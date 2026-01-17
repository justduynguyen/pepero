// Script to setup Google Sheet with headers
const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

async function setupSheet() {
  try {
    // Parse credentials
    const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS);
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    // Authenticate
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    console.log('🔍 Checking for "Orders_NEW_16112025" sheet...');

    // Get existing sheets
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId,
    });

    const existingSheets = spreadsheet.data.sheets || [];
    const ordersSheet = existingSheets.find(
      sheet => sheet.properties.title === 'Orders_NEW_16112025'
    );

    let sheetId;

    if (!ordersSheet) {
      console.log('📝 Creating "Orders_NEW_16112025" sheet...');
      // Create the Orders_NEW_16112025 sheet
      const addSheetResponse = await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: 'Orders_NEW_16112025',
                },
              },
            },
          ],
        },
      });
      sheetId = addSheetResponse.data.replies[0].addSheet.properties.sheetId;
      console.log('✅ Created "Orders_NEW_16112025" sheet!');
    } else {
      sheetId = ordersSheet.properties.sheetId;
      console.log('✅ "Orders_NEW_16112025" sheet already exists!');
    }

    console.log('📋 Adding headers...');

    // Add headers in Vietnamese
    const headers = [
      'Mã đơn hàng',
      'Thời gian',
      'Link mạng xã hội',
      'Tên người nhận',
      'Số điện thoại',
      'Địa chỉ',
      'Charms đã chọn',
      'Nguyên liệu thêm',
      'Ghi chú',
      'Hình thức thanh toán',
      'Tổng tiền',
      'Phí ship',
      'Thành tiền',
      'Trạng thái',
      'Đã chuyển khoản'
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Orders_NEW_16112025!A1:O1',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [headers],
      },
    });

    console.log('✅ Headers added!');

    // Format headers (bold, background color)
    console.log('🎨 Formatting headers...');
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          // Header formatting
          {
            repeatCell: {
              range: {
                sheetId: sheetId,
                startRowIndex: 0,
                endRowIndex: 1,
                startColumnIndex: 0,
                endColumnIndex: 15,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.95, green: 0.95, blue: 0.95 },
                  textFormat: { bold: true },
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat)',
            },
          },

          // - 'Lấy hàng trực tiếp' -> red full row highlight (columns A..O)
          {
            addConditionalFormatRule: {
              rule: {
                ranges: [{ sheetId: sheetId, startRowIndex: 1, startColumnIndex: 0, endColumnIndex: 15 }],
                booleanRule: {
                  condition: { type: 'CUSTOM_FORMULA', values: [{ userEnteredValue: '=($J2="Lấy hàng trực tiếp")' }] },
                  format: { backgroundColor: { red: 1.0, green: 0.9, blue: 0.9 }, textFormat: { bold: true } },
                },
              },
            },
          },

          // Basic filter across all header columns
          {
            setBasicFilter: {
              filter: { range: { sheetId: sheetId, startRowIndex: 0, startColumnIndex: 0, endColumnIndex: 15 } },
            },
          },

          // Status dropdown for "Trạng thái" (column N, index 13)
          {
            setDataValidation: {
              range: { sheetId: sheetId, startRowIndex: 1, startColumnIndex: 13, endColumnIndex: 14 },
              rule: {
                condition: { type: 'ONE_OF_LIST', values: [
                  { userEnteredValue: 'Chưa soạn' },
                  { userEnteredValue: 'Đã soạn' },
                  { userEnteredValue: 'Đã gửi ĐVVC' },
                  { userEnteredValue: 'Giao hàng không thành công' },
                  { userEnteredValue: 'Done' },
                ] },
                showCustomUi: true,
                strict: true,
              },
            },
          },

          // Payment status dropdown for "Đã chuyển khoản" (column O, index 14)
          {
            setDataValidation: {
              range: { sheetId: sheetId, startRowIndex: 1, startColumnIndex: 14, endColumnIndex: 15 },
              rule: {
                condition: { type: 'ONE_OF_LIST', values: [ { userEnteredValue: 'Chưa chuyển khoản' }, { userEnteredValue: 'Đã chuyển khoản' } ] },
                showCustomUi: true,
                strict: false,
              },
            },
          },

          // Conditional format: status colors
          // - 'Giao hàng không thành công' -> red
          {
            addConditionalFormatRule: {
              rule: {
                ranges: [{ sheetId: sheetId, startRowIndex: 1, startColumnIndex: 13, endColumnIndex: 14 }],
                booleanRule: {
                  condition: { type: 'TEXT_EQ', values: [{ userEnteredValue: 'Giao hàng không thành công' }] },
                  format: { backgroundColor: { red: 1, green: 0.8, blue: 0.8 }, textFormat: { bold: true } },
                },
              },
            },
          },

          // - 'đã gửi đvvc' -> blue
          {
            addConditionalFormatRule: {
              rule: {
                ranges: [{ sheetId: sheetId, startRowIndex: 1, startColumnIndex: 13, endColumnIndex: 14 }],
                booleanRule: {
                  condition: { type: 'TEXT_EQ', values: [{ userEnteredValue: 'Đã gửi ĐVVC' }] },
                  format: { backgroundColor: { red: 0.8, green: 0.9, blue: 1 }, textFormat: { bold: true } },
                },
              },
            },
          },

          // - 'done' -> green
          {
            addConditionalFormatRule: {
              rule: {
                ranges: [{ sheetId: sheetId, startRowIndex: 1, startColumnIndex: 13, endColumnIndex: 14 }],
                booleanRule: {
                  condition: { type: 'TEXT_EQ', values: [{ userEnteredValue: 'Done' }] },
                  format: { backgroundColor: { red: 0.7, green: 0.9, blue: 0.7 }, textFormat: { bold: true } },
                },
              },
            },
          },
          // removed: 'Đã xác nhận' -> consolidated into other workflow statuses managed by the team
          // - 'Ghi chú' (notes) present -> yellow background (column I, index 8)
          {
            addConditionalFormatRule: {
              rule: {
                ranges: [{ sheetId: sheetId, startRowIndex: 1, startColumnIndex: 8, endColumnIndex: 9 }],
                booleanRule: {
                  condition: { type: 'CUSTOM_FORMULA', values: [{ userEnteredValue: '=LEN($I2)>0' }] },
                  format: { backgroundColor: { red: 1.0, green: 1.0, blue: 0.6 }, textFormat: { bold: true } },
                },
              },
            },
          },

          // - 'đã soạn' -> yellow
          {
            addConditionalFormatRule: {
              rule: {
                ranges: [{ sheetId: sheetId, startRowIndex: 1, startColumnIndex: 13, endColumnIndex: 14 }],
                booleanRule: {
                  condition: { type: 'TEXT_EQ', values: [{ userEnteredValue: 'Đã soạn' }] },
                  format: { backgroundColor: { red: 1.0, green: 0.95, blue: 0.6 }, textFormat: { bold: true } },
                },
              },
            },
          },

          // - 'chưa soạn' -> gray (default)
          {
            addConditionalFormatRule: {
              rule: {
                ranges: [{ sheetId: sheetId, startRowIndex: 1, startColumnIndex: 13, endColumnIndex: 14 }],
                booleanRule: {
                  condition: { type: 'TEXT_EQ', values: [{ userEnteredValue: 'Chưa soạn' }] },
                  format: { backgroundColor: { red: 0.92, green: 0.92, blue: 0.92 }, textFormat: { bold: true } },
                },
              },
            },
          },
          
          // Payment status column conditional formatting (column O, index 14)
          // - 'Đã chuyển khoản' -> green
          {
            addConditionalFormatRule: {
              rule: {
                ranges: [{ sheetId: sheetId, startRowIndex: 1, startColumnIndex: 14, endColumnIndex: 15 }],
                booleanRule: {
                  condition: { type: 'TEXT_EQ', values: [{ userEnteredValue: 'Đã chuyển khoản' }] },
                  format: { backgroundColor: { red: 0.85, green: 1.0, blue: 0.85 }, textFormat: { bold: true } },
                },
              },
            },
          },
          // - 'Chưa chuyển khoản' -> gray
          {
            addConditionalFormatRule: {
              rule: {
                ranges: [{ sheetId: sheetId, startRowIndex: 1, startColumnIndex: 14, endColumnIndex: 15 }],
                booleanRule: {
                  condition: { type: 'TEXT_EQ', values: [{ userEnteredValue: 'Chưa chuyển khoản' }] },
                  format: { backgroundColor: { red: 0.92, green: 0.92, blue: 0.92 }, textFormat: { bold: false } },
                },
              },
            },
          },
        ],
      },
    });

    console.log('✅ Headers formatted!');
    console.log('✅ Filter enabled!');
    console.log('✅ Status dropdown added!');
    console.log('✅ Status color formatting added!');
    console.log('✅ Pickup row highlight (Lấy hàng trực tiếp) rule added!');
    console.log('   - Done: Green');
    console.log('   - Đã soạn: Yellow');
    console.log('   - Chưa soạn: Gray');
    console.log('\n🎉 Sheet setup complete!');
    console.log('\n📝 Next step: Share your sheet with:');
    console.log('   pepero@duy-nguyen-private.iam.gserviceaccount.com');
    console.log('   (as Editor)');
    console.log('\n🔗 Sheet URL:');
    console.log(`   https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`);
  } catch (error) {
    console.error('❌ Error setting up sheet:', error.message);
    if (error.code === 403) {
      console.log('\n⚠️  Make sure to share your Google Sheet with:');
      console.log('   pepero@duy-nguyen-private.iam.gserviceaccount.com');
      console.log('   (as Editor)');
    }
  }
}

setupSheet();
