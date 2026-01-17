import { google } from 'googleapis';
import { OrderData } from '@/types';

const SHEET_NAME = process.env.GOOGLE_SHEET_NAME || 'Orders_NEW_16112025';

async function getGoogleSheetsClient() {
  const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS || '{}');
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

export async function appendOrderToSheet(orderData: OrderData) {
  // Precompute row values so they are available in both the try and catch scopes
  // Format charms (each set on new line)
  const charmsText = orderData.selectedCharms && orderData.selectedCharms.length > 0
    ? orderData.selectedCharms.join('\n')
    : '';

  // Format add-ons (each set on new line, already formatted from frontend)
  const addOnsText = orderData.selectedAddOns && orderData.selectedAddOns.length > 0
    ? orderData.selectedAddOns.join('\n')
    : '';

  // Payment method translation
  const paymentMethodText = 
    orderData.paymentMethod === 'bank-transfer' ? 'Chuyển khoản' :
    orderData.paymentMethod === 'cod' ? 'Ship COD' :
    orderData.paymentMethod === 'pickup' ? 'Lấy hàng trực tiếp' : 
    orderData.paymentMethod;

  // Prepare cells, leaving empty strings when fields are missing (do not write a placeholder text)
  const phoneCell = orderData.phone ? `\'${orderData.phone}` : '';
  const addressCell = orderData.address && orderData.address !== 'N/A' ? orderData.address : '';
  const noteCell = orderData.note || '';

  // Determine initial payment status for transfer column
  const paymentStatusCell =
    orderData.paymentMethod === 'bank-transfer'
      ? 'Chưa chuyển khoản'
      : '';

  // Write order number as a text cell by prefixing with a single quote
  const orderNumberCell = orderData.orderNumber ? `\'${orderData.orderNumber}` : '';

  const rowValues = [
    orderNumberCell,
    orderData.timestamp,
    orderData.socialLink || '',
    orderData.recipientName || '',
    phoneCell, // Add single quote prefix to preserve leading zero when present
    addressCell,
    charmsText,
    addOnsText,
    noteCell,
    paymentMethodText,
    orderData.totalPrice,
    orderData.shippingFee,
    orderData.finalTotal,
    // Write status: default to 'Chưa soạn' so the sheet shows an initial processing state
    'Chưa soạn',
    paymentStatusCell, // Payment transfer status column
  ];

  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    if (!spreadsheetId) {
      throw new Error('GOOGLE_SHEET_ID is not configured');
    }

    // We read column A (orderNumber) to find first empty slot.
    const readRange = `${SHEET_NAME}!A2:A`;
    const getRes = await sheets.spreadsheets.values.get({ spreadsheetId, range: readRange });
    const rows = getRes.data.values || [];
    const firstEmptyRow = rows.length + 2; // +2 because sheets are 1-indexed and we have a header

    const updateRange = `${SHEET_NAME}!A${firstEmptyRow}:O${firstEmptyRow}`;
    const updateRes = await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: updateRange,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [rowValues] },
    });

    console.log(`Wrote order to row ${firstEmptyRow}. Sheets update response:`, updateRes.data);

    return { success: true, data: updateRes.data };
  } catch (error) {
    console.error('Error appending to Google Sheet:', error);
    // If update fails, try to append as a fallback
    try {
      const sheets = await getGoogleSheetsClient();
      const spreadsheetId = process.env.GOOGLE_SHEET_ID;
      const appendRes = await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${SHEET_NAME}!A:O`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [rowValues] },
      });
      console.log('Google Sheets append fallback response:', appendRes.data);
      return { success: true, data: appendRes.data };
    } catch (appendError) {
      console.error('Error in append fallback:', appendError);
      throw appendError; // Re-throw the append error
    }
  }
}

  // Fetch order status (orderStatus and paymentStatus) from sheet by orderNumber
  export async function getOrderStatus(orderNumber: string) {
    try {
      const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS || '{}');
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
      });
      const sheets = google.sheets({ version: 'v4', auth });
      const spreadsheetId = process.env.GOOGLE_SHEET_ID;
      if (!spreadsheetId) {
        throw new Error('GOOGLE_SHEET_ID is not configured');
      }

      // Read a reasonable range that includes A..O columns and many rows
      // NOTE: sheet name is Orders_NEW_16112025 (append writes to Orders_NEW_16112025)
      const readRange = 'Orders_NEW_16112025!A2:O1000';
      const res = await sheets.spreadsheets.values.get({ spreadsheetId, range: readRange });
      const rows = res.data.values || [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const cellOrderIdRaw = row[0];
        if (!cellOrderIdRaw) continue;
        // Normalize cell value: remove leading single-quote if present and trim
        const cellOrderId = String(cellOrderIdRaw).replace(/^'/, '').trim();
        if (cellOrderId === String(orderNumber).trim()) {
          const orderStatusRaw = (row[13] || '').toString(); // column N
          const paymentStatusRaw = (row[14] || '').toString(); // column O
          let orderStatus = orderStatusRaw;
          const orderStatusLower = orderStatusRaw.toLowerCase();
          const paymentStatus = paymentStatusRaw;
          const paymentStatusLower = paymentStatusRaw.toLowerCase();

          // Map some order statuses
          if (orderStatusLower === 'đã gửi') {
            orderStatus = 'Đã gửi ĐVVC';
          }

          // Strip out some statuses we want to remove from display
          const statusesToRemove = ['chưa xác nhận', 'đang chờ xác nhận', 'không xác nhận được', 'đã xác nhận'];
          if (statusesToRemove.includes(orderStatusLower)) {
            orderStatus = '';
          }

          // For UI convenience, add a small status sequence when order is done
          let statusSequence: string[] = [];
          if (orderStatus) {
            // If final state is Done, present a sequence that includes 'Giao hàng không thành công' before Done
            if (orderStatusLower === 'done') {
              statusSequence = ['Giao hàng không thành công', 'Done'];
            } else {
              statusSequence = [orderStatus];
            }
          }

          // Map payment status to color hints for the frontend
          let paymentStatusColor: string | null = null;
          if (paymentStatusLower === 'đã chuyển khoản') paymentStatusColor = 'green';
          if (paymentStatusLower === 'chưa chuyển khoản') paymentStatusColor = 'gray';

          const sheetRowNumber = 2 + i;
          return {
            found: true,
            orderNumber: cellOrderId,
            orderStatus,
            paymentStatus,
            paymentStatusColor,
            statusSequence,
            sheetRowNumber,
          };
        }
      }

      return { found: false };
    } catch (error) {
      console.error('Error fetching order status from sheet:', error);
      throw error;
    }
  }
