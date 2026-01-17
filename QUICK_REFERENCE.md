# ⚡ Quick Reference - Pepero Food App

## 🚀 Các lệnh thường dùng

```powershell
# Chạy development
npm run dev

# Build production
npm run build
npm start

# Lint check
npm run lint
```

---

## 📂 Files quan trọng

| File | Mô tả |
|------|-------|
| `data/mockData.ts` | **Dữ liệu món ăn** - Chỉnh ở đây để thêm/sửa món |
| `components/HomePage.tsx` | Trang chủ - Đổi tên shop ở đây |
| `next.config.ts` | Config Next.js - Thêm hostname cho images |
| `tailwind.config.ts` | Config Tailwind - Thêm màu/font custom |
| `app/layout.tsx` | Layout chính - Metadata SEO |

---

## 🎨 Màu sắc

```tsx
// Màu chính (đỏ)
bg-red-500      // Background
text-red-600    // Text
border-red-500  // Border
hover:bg-red-600 // Hover state

// Màu phụ
bg-gray-50      // Background nhạt
bg-gray-100     // Card background
text-gray-600   // Text phụ
border-gray-200 // Border nhẹ
```

---

## 📝 Thêm món mới - Template

### Món đơn
```typescript
{
  id: 'unique-id',
  name: 'Tên món',
  description: 'Mô tả ngắn',
  price: 50000,
  image: 'https://images.unsplash.com/photo-xxx?w=400',
  category: 'Danh mục',
  available: true,
  type: 'normal',
  optionGroups: [
    {
      id: 'size',
      name: 'Size',
      required: true,
      minSelect: 1,
      maxSelect: 1,
      options: [
        { id: 'S', name: 'Nhỏ', price: 0 },
        { id: 'L', name: 'Lớn', price: 10000 },
      ],
    },
  ],
  addons: [
    { id: 'addon1', name: 'Thêm X', price: 5000, maxQuantity: 3 },
  ],
}
```

### Combo/Set
```typescript
{
  id: 'combo-1',
  name: 'Combo ABC',
  price: 100000,
  type: 'set',
  // ... fields khác
  setItems: [
    {
      id: 'main',
      name: 'Món chính',
      required: true,
      minSelect: 1,
      maxSelect: 1,
      products: [
        {
          id: 'opt1',
          name: 'Option 1',
          price: 0,
          description: '',
          image: '',
          category: '',
          available: true,
          type: 'normal',
        },
      ],
    },
  ],
}
```

---

## 🔍 Tìm và sửa nhanh

### Đổi tên shop
**File**: `components/HomePage.tsx`
**Line**: ~41
**Tìm**: `Pepero Food`

### Đổi màu toàn bộ app
**Find all**: `red-500` → Replace: `blue-500`
**Find all**: `red-600` → Replace: `blue-600`

### Thêm hostname cho images
**File**: `next.config.ts`
```typescript
remotePatterns: [
  {
    protocol: 'https',
    hostname: 'your-domain.com',
    pathname: '/**',
  },
],
```

---

## 🐛 Fix lỗi thường gặp

### "hostname not configured"
→ Thêm vào `next.config.ts` / `remotePatterns`

### Giỏ hàng mất
→ Check localStorage, tắt private browsing

### Modal không mở
→ Check console errors, verify state

### Giá tính sai
→ Review `calculateTotalPrice()` function

---

## 📱 Test responsive

| Device | Breakpoint | Grid |
|--------|-----------|------|
| Mobile | < 640px | 1 col |
| Tablet | 640-1024px | 2 cols |
| Desktop | > 1024px | 3 cols |

---

## ✅ Checklist trước khi deploy

- [ ] Đổi tên shop
- [ ] Thêm món ăn thật
- [ ] Thay hình ảnh thật
- [ ] Config hostname trong next.config.ts
- [ ] Test tất cả chức năng
- [ ] Test trên mobile thật
- [ ] Build production (`npm run build`)
- [ ] Test production build (`npm start`)
- [ ] Setup backend API (nếu cần)
- [ ] Setup payment gateway (nếu cần)

---

## 🎯 Các tính năng có sẵn

✅ Danh sách sản phẩm với hình ảnh
✅ Tìm kiếm & lọc theo category
✅ Modal chi tiết món (fullscreen mobile)
✅ Chọn options (single/multiple choice)
✅ Thêm addons với số lượng
✅ Combo/Set với validation
✅ Giỏ hàng với localStorage
✅ Cập nhật số lượng trong giỏ
✅ Tính tổng tiền tự động
✅ Responsive mobile/tablet/desktop
✅ Ghi chú đặc biệt
✅ Validation options bắt buộc

---

## 📞 Liên kết hữu ích

- Documentation: `README.md`
- Hướng dẫn chi tiết: `GUIDE.md`
- Test checklist: `TEST_CHECKLIST.md`
- Next.js Docs: https://nextjs.org/docs
- Tailwind CSS: https://tailwindcss.com/docs

---

**Version**: 1.0.0
**Last updated**: November 11, 2025
