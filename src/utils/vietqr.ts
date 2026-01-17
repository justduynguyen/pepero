import { crc16ccitt } from 'crc';

/**
 * Generate a unique 6-digit order number
 */
export function generateOrderNumber(): string {
  // Produce an 8-digit numeric, time-based order number.
  // Implementation: take current epoch seconds modulo 100,000,000 and pad to 8 digits.
  // This value increases over time (per second) and fits the 8-digit requirement.
  const seconds = Math.floor(Date.now() / 1000);
  const mod = seconds % 100000000; // keep last 8 digits
  return String(mod).padStart(8, '0');
}

/**
 * Build a field in ID-Length-Value format
 */
function buildField(idStr: string, value: string): string {
  if (!value) {
    return '';
  }
  const lengthStr = value.length.toString().padStart(2, '0');
  return `${idStr}${lengthStr}${value}`;
}

/**
 * Calculate CRC16/CCITT-FALSE for VietQR
 */
function calculateCRC16(data: string): string {
  const buffer = Buffer.from(data, 'ascii');
  const crcValue = crc16ccitt(buffer, 0xFFFF);
  return crcValue.toString(16).toUpperCase().padStart(4, '0');
}

interface VietQRParams {
  bankBin: string;
  accountNumber: string;
  amount: string;
  accountName?: string;
  purpose?: string;
  billNumber?: string;
  qrType?: '11' | '12'; // 11 = static, 12 = dynamic
}

/**
 * Generate VietQR string according to NAPAS standard
 */
export function generateVietQRString({
  bankBin,
  accountNumber,
  amount,
  accountName = '',
  purpose = '',
  billNumber = '',
  qrType = '12'
}: VietQRParams): string {
  // ID 00: Payload Format Indicator
  const id_00 = buildField('00', '01');
  // ID 01: Point of Initiation Method
  const id_01 = buildField('01', qrType);

  // ID 38: Merchant Account Information (NAPAS)
  const sub_id_38_00_guid = buildField('00', 'A000000727');
  const sub_tag_38_01_00_bin = buildField('00', bankBin);
  const sub_tag_38_01_01_acc = buildField('01', accountNumber);
  const sub_id_38_01_ben_info = buildField('01', sub_tag_38_01_00_bin + sub_tag_38_01_01_acc);
  const sub_id_38_02_service = buildField('02', 'QRIBFTTA');
  
  const id_38_val = sub_id_38_00_guid + sub_id_38_01_ben_info + sub_id_38_02_service;
  const id_38 = buildField('38', id_38_val);

  // ID 53: Currency code
  const id_53 = buildField('53', '704'); // VND
  // ID 54: Amount
  const id_54 = buildField('54', amount);
  // ID 58: Country code
  const id_58 = buildField('58', 'VN');
  // ID 59: Account name (max 25 chars)
  const id_59 = buildField('59', accountName.substring(0, 25));

  // ID 62: Additional info
  const sub_id_62_01_bill = buildField('01', billNumber);
  const sub_id_62_08_purpose = buildField('08', purpose);
  const id_62_val = sub_id_62_01_bill + sub_id_62_08_purpose;
  const id_62 = buildField('62', id_62_val);

  // ID 63: CRC placeholder
  const id_63_placeholder = '6304';

  // Pre-CRC string
  const pre_crc_string = 
    `${id_00}${id_01}${id_38}${id_53}${id_54}${id_58}${id_59}${id_62}${id_63_placeholder}`;

  // Calculate CRC
  const crc_value = calculateCRC16(pre_crc_string);

  // Final QR string
  return `${pre_crc_string}${crc_value}`;
}

/**
 * Generate QR code for bank transfer with order details
 */
export function generateTransferQR(orderNumber: string, totalAmount: number): string {
  const MY_BANK_BIN = '963388'; // Timo Bank BIN
  const MY_ACCOUNT_NUM = '0857700655';
  const MY_ACCOUNT_NAME = 'THAI THI MINH PHUONG';

  return generateVietQRString({
    bankBin: MY_BANK_BIN,
    accountNumber: MY_ACCOUNT_NUM,
    amount: totalAmount.toString(),
    accountName: MY_ACCOUNT_NAME,
    purpose: orderNumber,
    billNumber: '', // Remove duplicate - only use purpose field
    qrType: '12' // Dynamic QR
  });
}
