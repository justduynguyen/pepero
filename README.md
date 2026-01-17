# Pepero Food - Ứng dụng đặt đồ ăn online

Ứng dụng web frontend đặt đồ ăn trực tuyến được xây dựng bằng Next.js, TypeScript và Tailwind CSS, lấy cảm hứng từ GrabFood.

## 🌟 Tính năng

### ✅ Đã hoàn thành
- ✨ **Danh sách sản phẩm** - Hiển thị món ăn với hình ảnh, tên, giá, mô tả
- 🔍 **Tìm kiếm** - Tìm kiếm món ăn theo tên hoặc mô tả
- 🏷️ **Lọc theo danh mục** - Lọc món ăn theo category (Phở, Bún, Cơm, Đồ uống, v.v.)
- 📱 **Responsive design** - Giao diện tối ưu cho cả mobile và desktop
- 🎨 **Modal fullscreen** - Hiển thị chi tiết món ăn (fullscreen trên mobile, popup trên desktop)

### 🍽️ Chọn món ăn
- **Món đơn (normal)**:
  - Chọn options (Size, Loại thịt, Độ cay, Đường, Đá, v.v.)
  - Single choice (radio) hoặc multiple choice (checkbox)
  - Validate options bắt buộc
  - Thêm addons (Thêm trứng, thêm thịt, thêm topping, v.v.)
  - Điều chỉnh số lượng addon
  
- **Combo/Set**:
  - Chọn món theo từng set item (Món chính, Canh, Đồ uống, v.v.)
  - Validate set items bắt buộc
  - Tùy chọn chọn món phụ không bắt buộc
  - Hiển thị giá thêm khi chọn món cao cấp hơn

- **Ghi chú đặc biệt** cho từng món

### 🛒 Giỏ hàng & Thanh toán
- Thêm/xóa món khỏi giỏ hàng
- Cập nhật số lượng món
- Hiển thị đầy đủ thông tin: options, addons, set items đã chọn
- Tính tổng tiền tự động
- Lưu giỏ hàng vào localStorage (giữ nguyên khi reload trang)
- Tích hợp Google Sheets để lưu đơn hàng
- Tạo mã QR cho thanh toán VietQR
- Theo dõi trạng thái đơn hàng

### 🎯 UX/UI
- Giao diện thân thiện, dễ sử dụng
- Mobile-first design
- Smooth transitions và animations
- Error handling và validation messages

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **API**: Google Sheets API
- **Deployment**: Docker

## 📦 Cài đặt & Chạy

First, set up your environment variables by copying `env.local.example` to `.env.local` and filling in the required values.

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📁 Cấu trúc thư mục

```
food-order-app-2/
├── src/
│   ├── app/
│   │   ├── (main)/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── api/
│   │   │   └── orders/
│   │   │       └── route.ts
│   │   ├── my-order/
│   │   │   └── [orderId]/
│   │   │       └── page.tsx
│   │   └── my-orders/
│   │       └── page.tsx
│   ├── components/
│   │   ├── AddressSelector.tsx
│   │   ├── Cart.tsx
│   │   ├── CheckoutForm.tsx
│   │   └── NoticeModal.tsx
│   ├── context/
│   │   └── CartContext.tsx
│   ├── data/
│   │   └── mockData.ts
│   ├── constants/
│   │   └── gis-v2.json
│   ├── utils/
│   │   ├── googleSheets.ts
│   │   └── vietqr.ts
│   └── types/
│       └── index.ts
├── public/
│   ├── imgs/
│   └── favicon.ico
├── package.json
├── next.config.ts
├── tsconfig.json
└── README.md
```

## 🎨 Tùy chỉnh

### Thay đổi tên shop
Sửa file `components/HomePage.tsx`:
```tsx
<h1 className="text-2xl font-bold text-red-600 mb-3">Tên Shop Của Bạn</h1>
```

### Thêm/sửa sản phẩm
Chỉnh sửa file `data/mockData.ts`

## 🚀 Tính năng sẽ triển khai

- [ ] Backend API integration
- [ ] Thanh toán online
- [ ] Đăng nhập/đăng ký
- [ ] Lịch sử đơn hàng
- [ ] Theo dõi đơn hàng real-time

## 📝 Ghi chú

- Dữ liệu hiện tại là mock data, chưa kết nối database
- Hình ảnh sản phẩm dùng Unsplash (cần thay bằng hình thật)
- Chức năng "Đặt hàng" hiện chỉ hiển thị alert (cần backend)
- LocalStorage dùng để lưu giỏ hàng tạm thời

---

## Learn More (Next.js)

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
