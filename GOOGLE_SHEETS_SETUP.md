# Google Sheets Integration Setup

## Bước 1: Tạo Google Cloud Project

1. Truy cập https://console.cloud.google.com/
2. Tạo project mới hoặc chọn project có sẵn
3. Enable **Google Sheets API**:
   - Menu > APIs & Services > Library
   - Tìm "Google Sheets API"
   - Click "Enable"

## Bước 2: Tạo Service Account

1. Menu > APIs & Services > Credentials
2. Click "Create Credentials" > "Service Account"
3. Điền thông tin:
   - Service account name: `pepero-sheets-service`
   - Click "Create and Continue"
   - Skip "Grant this service account access" (không cần)
   - Click "Done"

## Bước 3: Tạo JSON Key

1. Click vào service account vừa tạo
2. Tab "Keys" > "Add Key" > "Create new key"
3. Chọn "JSON" > Click "Create"
4. File JSON sẽ tự động download

## Bước 4: Setup Google Sheet

1. Tạo Google Sheet mới
2. Tạo sheet tên "Orders" với headers ở row 1:
   ```
   A1: Timestamp
   B1: Social Link
   C1: Recipient Name
   D1: Phone
   E1: Address
   F1: Selected Charms
   G1: Add-ons
   H1: Note
   I1: Payment Method
   J1: Total Price
   K1: Shipping Fee
   L1: Final Total
   ```
3. Click "Share" button
4. Paste Service Account email (trong JSON file, field "client_email")
5. Chọn role: "Editor"
6. Click "Send" (bỏ tick "Notify people")

## Bước 5: Configure Environment Variables

1. Copy file `.env.local.example` thành `.env.local`
2. Mở file JSON vừa download
3. Copy toàn bộ nội dung JSON (bao gồm cả dấu ngoặc {})
4. Paste vào `.env.local`:
   ```
   GOOGLE_SHEETS_CREDENTIALS={"type":"service_account","project_id":"..."}
   ```
5. Copy Spreadsheet ID từ URL của Google Sheet:
   - URL: https://docs.google.com/spreadsheets/d/ABC123XYZ/edit
   - Spreadsheet ID: ABC123XYZ
6. Paste vào `.env.local`:
   ```
   GOOGLE_SHEET_ID=ABC123XYZ
   ```

## Bước 6: Test Integration

1. Restart development server: `npm run dev`
2. Truy cập http://localhost:3000
3. Thêm sản phẩm vào giỏ hàng
4. Điền form checkout
5. Submit đơn hàng
6. Check Google Sheet → Dữ liệu sẽ xuất hiện ở row mới!

## Troubleshooting

### Error: "GOOGLE_SHEETS_CREDENTIALS is not configured"
- Check file `.env.local` đã tạo đúng chưa
- Check JSON credentials đã paste đúng format chưa (phải là 1 dòng)

### Error: "The caller does not have permission"
- Check đã share Sheet với service account email chưa
- Check role phải là "Editor"

### Error: "Unable to parse range"
- Check sheet name phải là "Orders" (case-sensitive)
- Check đã có header row chưa

## Production Deployment (Vercel/Netlify)

1. Add environment variables vào platform settings:
   - `GOOGLE_SHEETS_CREDENTIALS`
   - `GOOGLE_SHEET_ID`
2. Deploy!

## Notes

- Service account credentials nên được giữ bí mật
- **KHÔNG** commit file `.env.local` vào Git
- **KHÔNG** commit file JSON credentials vào Git
- File `.gitignore` đã được config tự động ignore `.env.local`
