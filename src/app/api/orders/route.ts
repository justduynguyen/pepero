import { NextRequest, NextResponse } from 'next/server';
import { appendOrderToSheet, getOrderStatus } from '@/utils/googleSheets';
import { OrderData } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const orderData: OrderData = await request.json();

    // Log incoming payload for debugging
    console.log('API /api/orders POST received. payload:', JSON.stringify(orderData));
    console.log('Env GOOGLE_SHEET_ID (server):', process.env.GOOGLE_SHEET_ID ? '[present]' : '[missing]');

    // Validate required fields
    if (!orderData.socialLink || !orderData.recipientName || !orderData.phone) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Append to Google Sheets
    const appendResult = await appendOrderToSheet(orderData);
    console.log('appendOrderToSheet result:', appendResult && typeof appendResult === 'object' ? JSON.stringify(appendResult) : appendResult);

    return NextResponse.json({ 
      success: true, 
      message: 'Order saved successfully' 
    });
  } catch (error) {
    console.error('Error saving order:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to save order' 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl;
    const orderNumber = url.searchParams.get('orderNumber');

    if (!orderNumber) {
      return NextResponse.json({ success: false, error: 'orderNumber is required' }, { status: 400 });
    }

    const statusResult = await getOrderStatus(orderNumber);
    if (!statusResult || !statusResult.found) {
      return NextResponse.json({ success: false, found: false }, { status: 404 });
    }

    return NextResponse.json({ success: true, found: true, data: statusResult });
  } catch (error) {
    console.error('Error in GET /api/orders:', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Failed' }, { status: 500 });
  }
}
