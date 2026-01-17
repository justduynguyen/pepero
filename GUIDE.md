# 📖 Hướng dẫn sử dụng & Tùy chỉnh Pepero Food

## 🚀 Bắt đầu nhanh

### Chạy ứng dụng
```powershell
# Đi vào thư mục project
cd c:\Users\nd20318288\Desktop\pepero\food-order-app

# Chạy development server
npm run dev

# Mở browser tại http://localhost:3000
```

### Build production
```powershell
npm run build
npm start
```

---

## 🎨 Tùy chỉnh cho shop của bạn

### 1. Đổi tên shop

**File**: `components/HomePage.tsx` (line ~41)
```tsx
<h1 className="text-2xl font-bold text-red-600 mb-3">Tên Shop Của Bạn</h1>
```

### 2. Đổi màu chủ đạo

Hiện tại dùng màu đỏ (`red-500`, `red-600`). Để đổi sang màu khác:

**Tìm và thay thế** trong toàn bộ project:
- `bg-red-500` → `bg-blue-500` (màu xanh)
- `bg-red-600` → `bg-blue-600`
- `text-red-600` → `text-blue-600`
- `border-red-500` → `border-blue-500`
- `ring-red-500` → `ring-ring-500`

**Các màu Tailwind có sẵn**: 
- `blue` (xanh dương)
- `green` (xanh lá)
- `purple` (tím)
- `orange` (cam)
- `pink` (hồng)
- `indigo` (chàm)

### 3. Thêm món ăn mới

**File**: `data/mockData.ts`

#### Thêm món đơn (normal):
```typescript
{
  id: '7', // ID unique
  name: 'Tên món ăn',
  description: 'Mô tả ngắn gọn',
  price: 50000, // Giá VND
  image: 'https://images.unsplash.com/photo-xxxxx?w=400', // URL hình
  category: 'Danh mục', // Phở, Bún, Cơm, v.v.
  available: true, // true = còn hàng, false = hết hàng
  type: 'normal',
  
  // Options bắt buộc/không bắt buộc
  optionGroups: [
    {
      id: 'size',
      name: 'Size',
      required: true, // Bắt buộc chọn
      minSelect: 1,
      maxSelect: 1, // 1 = radio, >1 = checkbox
      options: [
        { id: 'small', name: 'Nhỏ', price: 0 },
        { id: 'large', name: 'Lớn', price: 15000 },
      ],
    },
  ],
  
  // Addons (topping/thêm món)
  addons: [
    { id: 'extra-meat', name: 'Thêm thịt', price: 20000, maxQuantity: 3 },
  ],
}
```

#### Thêm combo/set:
```typescript
{
  id: '8',
  name: 'Combo ABC',
  description: 'Set gồm...',
  price: 100000, // Giá base của combo
  image: 'URL',
  category: 'Combo',
  available: true,
  type: 'set',
  
  setItems: [
    {
      id: 'main-dish',
      name: 'Món chính',
      required: true,
      minSelect: 1,
      maxSelect: 1,
      products: [
        {
          id: 'option1',
          name: 'Option 1',
          price: 0, // +0đ so với giá base
          // ... các field khác để trống
          description: '',
          image: '',
          category: '',
          available: true,
          type: 'normal',
        },
        {
          id: 'option2',
          name: 'Option 2 (cao cấp)',
          price: 20000, // +20k so với giá base
          description: '',
          image: '',
          category: '',
          available: true,
          type: 'normal',
        },
      ],
    },
    {
      id: 'side-dish',
      name: 'Món phụ (tùy chọn)',
      required: false, // Không bắt buộc
      minSelect: 0,
      maxSelect: 2, // Chọn tối đa 2 món
      products: [
        // ... danh sách món phụ
      ],
    },
  ],
}
```

### 4. Đổi hình ảnh

#### Sử dụng Unsplash (miễn phí):
1. Vào https://unsplash.com
2. Tìm hình phù hợp
3. Click vào hình → Copy link
4. Thêm `?w=400` vào cuối URL (optimize size)
5. Paste vào field `image`

**Ví dụ**: 
```
https://images.unsplash.com/photo-1234567890?w=400
```

#### Sử dụng hình local:
1. Đặt hình vào folder `public/images/`
2. Trong mockData.ts:
```typescript
image: '/images/pho-bo.jpg'
```

3. **Không cần** config next.config.ts cho local images

### 5. Thêm danh mục mới

Sau khi thêm món với `category` mới vào `mockData.ts`, category sẽ tự động xuất hiện trong filter buttons.

**Ví dụ**: Thêm category "Lẩu"
```typescript
{
  id: '9',
  name: 'Lẩu Thái',
  category: 'Lẩu', // Danh mục mới
  // ...
}
```
→ Nút "Lẩu" sẽ tự động xuất hiện

### 6. Thay đổi metadata (SEO)

**File**: `app/layout.tsx`
```typescript
export const metadata: Metadata = {
  title: "Tên shop - Đặt đồ ăn online",
  description: "Mô tả shop của bạn",
};
```

---

## 📝 Cấu trúc dữ liệu

### Product Type
```typescript
type: 'normal' | 'set'
```

### OptionGroup
- `required: true` → Bắt buộc chọn (dấu *)
- `maxSelect: 1` → Radio buttons (chọn 1)
- `maxSelect: >1` → Checkboxes (chọn nhiều)

### Addon
- `maxQuantity` → Giới hạn số lượng có thể thêm
- Không có `maxQuantity` → Không giới hạn

### SetItem
- `required: true` → Bắt buộc chọn
- `required: false` → Tùy chọn
- `minSelect / maxSelect` → Số lượng món phải chọn

---

## 🎯 Tips & Best Practices

### 1. Đặt tên ID
- Dùng ID ngắn gọn, dễ hiểu: `'pho-bo'`, `'combo-ga'`
- Unique trong toàn bộ products
- Không dùng ký tự đặc biệt, space

### 2. Giá cả
- Luôn dùng số nguyên (VND không có decimal)
- Options/Addons: `price: 0` nghĩa là không tính thêm
- Set items: `price` là giá THÊM so với giá base của combo

### 3. Hình ảnh
- Khuyến nghị: 400-600px width
- Tỷ lệ 4:3 hoặc 1:1
- Format: JPEG (nhẹ hơn PNG)

### 4. Mô tả
- Ngắn gọn, 1-2 câu
- Nêu điểm đặc biệt của món
- Tránh quá dài (bị truncate trên card)

### 5. Category
- Dùng tên Tiếng Việt có dấu
- Viết hoa chữ cái đầu
- Ví dụ tốt: "Phở", "Bún", "Cơm"
- Tránh: "pho", "PHO", "phở bò"

---

## 🔧 Chức năng nâng cao

### Tích hợp backend API

Thay thế mock data bằng API calls:

**File**: `data/mockData.ts` → Tạo `services/api.ts`
```typescript
export async function getProducts() {
  const res = await fetch('https://your-api.com/products');
  return res.json();
}
```

**File**: `components/HomePage.tsx`
```typescript
import { useEffect, useState } from 'react';
import { getProducts } from '@/services/api';

const [products, setProducts] = useState([]);

useEffect(() => {
  getProducts().then(setProducts);
}, []);
```

### Thêm thanh toán

```typescript
// components/Cart.tsx - trong handleCheckout
const handleCheckout = async () => {
  const order = {
    items: cart.items,
    total: cart.totalPrice,
  };
  
  const res = await fetch('/api/orders', {
    method: 'POST',
    body: JSON.stringify(order),
  });
  
  if (res.ok) {
    clearCart();
    alert('Đặt hàng thành công!');
  }
};
```

### Thêm authentication

Sử dụng NextAuth.js:
```bash
npm install next-auth
```

Xem docs: https://next-auth.js.org/

---

## 🐛 Troubleshooting

### Lỗi: "hostname not configured"
**Fix**: Đã sửa trong `next.config.ts`
- Thêm hostname vào `remotePatterns`

### Hình không hiển thị
1. Check URL hình có đúng không
2. Check next.config.ts đã config hostname chưa
3. Xem Console browser có lỗi gì

### Giỏ hàng mất sau khi reload
- Check localStorage có hoạt động không (private mode sẽ block)
- Clear cache browser thử lại

### Modal không mở
- Check console có lỗi không
- Verify `isOpen` state
- Check onClick handler

### Giá tính sai
- Review logic trong `calculateTotalPrice`
- Check options/addons price
- Verify quantity multiplication

---

## 📱 Test trên mobile thật

### Sử dụng Network URL:
```
http://192.168.1.34:3000
```
(Thay IP bằng IP máy bạn trong mạng LAN)

### Hoặc dùng ngrok:
```bash
npm install -g ngrok
ngrok http 3000
```

---

## 🎓 Học thêm

- **Next.js**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **TypeScript**: https://www.typescriptlang.org/docs
- **React**: https://react.dev

---

Chúc bạn thành công! 🎉
