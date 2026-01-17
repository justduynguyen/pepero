# 🧪 Test Checklist - Pepero Food App

## ✅ Danh sách kiểm tra chức năng

### 1. **Trang chủ - ProductList**
- [x] Hiển thị danh sách món ăn với hình ảnh từ Unsplash
- [x] Hiển thị tên, mô tả, giá món
- [x] Badge "COMBO" hiển thị cho món set
- [x] Badge "Hết hàng" cho món không available
- [x] Responsive grid: 1 cột (mobile), 2 cột (tablet), 3 cột (desktop)

### 2. **Tìm kiếm & Lọc**
- [x] Thanh tìm kiếm hoạt động (tìm theo tên/mô tả)
- [x] Nút "Tất cả" hiển thị tất cả món
- [x] Các nút category: Phở, Bún, Cơm, Đồ uống, Combo, Bánh mì
- [x] Filter kết hợp search + category
- [x] Hiển thị "Không tìm thấy món ăn" khi không có kết quả

### 3. **ProductModal - Món đơn (Normal)**

#### Test với "Phở Bò Tái":
- [x] Modal mở khi click vào món
- [x] Hiển thị hình ảnh lớn
- [x] Hiển thị tên, mô tả, giá
- [x] Nút back để đóng modal
- [x] **Options - Size** (required, single choice):
  - [x] Radio buttons hoạt động
  - [x] Dấu * hiển thị (bắt buộc)
  - [x] Nhỏ: +0đ, Vừa: +10,000đ, Lớn: +20,000đ
- [x] **Options - Loại thịt** (required, single choice):
  - [x] Tái, Chín, Tái+Chín, Đặc biệt
  - [x] Giá cộng thêm hiển thị đúng
- [x] **Addons**:
  - [x] Thêm trứng: nút +/- hoạt động
  - [x] Số lượng hiển thị đúng
  - [x] MaxQuantity limit hoạt động (2 cho trứng)
  - [x] Giá addon cộng vào tổng
- [x] **Validation**:
  - [x] Báo lỗi nếu chưa chọn Size
  - [x] Báo lỗi nếu chưa chọn Loại thịt
  - [x] Không thể thêm vào giỏ khi thiếu options bắt buộc

#### Test với "Trà Sữa Trân Châu":
- [x] **Options - Size** (M/L)
- [x] **Options - Đá** (Không đá/Ít đá/Bình thường)
- [x] **Options - Đường** (0%, 30%, 50%, 70%, 100%)
- [x] **Addons**: Thêm trân châu, pudding, thạch
- [x] Tất cả 3 options bắt buộc phải chọn

### 4. **ProductModal - Combo/Set**

#### Test với "Combo Cơm Gà":
- [x] **Set Item - Món chính** (required):
  - [x] Radio: Gà rô ti (+0đ), Gà chiên (+5k), Gà nướng (+10k)
  - [x] Dấu * hiển thị
- [x] **Set Item - Canh** (required):
  - [x] Canh rau (+0đ), Canh trứng (+3k)
- [x] **Set Item - Đồ uống** (required):
  - [x] Trà đá (+0đ), Nước ngọt (+8k), Trà sữa (+15k)
- [x] **Set Item - Món phụ** (optional, max 2):
  - [x] Checkbox hoạt động
  - [x] Có thể chọn 0, 1, hoặc 2 món
  - [x] Không bắt buộc (không có dấu *)
- [x] **Validation**:
  - [x] Báo lỗi nếu thiếu món chính/canh/đồ uống
  - [x] Cho phép bỏ qua món phụ

### 5. **Ghi chú & Số lượng**
- [x] Textarea ghi chú hoạt động
- [x] Nút +/- số lượng hoạt động
- [x] Số lượng tối thiểu = 1
- [x] Giá nhân với số lượng chính xác

### 6. **Tính giá**
- [x] Giá base hiển thị đúng
- [x] Giá options cộng vào
- [x] Giá addons (price × quantity) cộng vào
- [x] Giá set items cộng vào
- [x] Tổng giá × số lượng
- [x] Hiển thị format VND đúng

### 7. **Giỏ hàng**
- [x] Floating button hiển thị ở góc phải
- [x] Badge số lượng món hiển thị đúng
- [x] Tổng tiền hiển thị trên button
- [x] Click mở cart modal
- [x] **Cart Items**:
  - [x] Hiển thị hình ảnh món
  - [x] Hiển thị tên món
  - [x] Hiển thị options đã chọn
  - [x] Hiển thị addons đã chọn (x quantity)
  - [x] Hiển thị set items đã chọn
  - [x] Hiển thị ghi chú (nếu có)
  - [x] Hiển thị giá từng món
- [x] **Cập nhật số lượng**:
  - [x] Nút +/- hoạt động
  - [x] Giá update khi đổi số lượng
- [x] **Xóa món**:
  - [x] Nút xóa từng món hoạt động
  - [x] Tổng tiền update đúng
- [x] **Xóa tất cả**:
  - [x] Nút "Xóa tất cả" hoạt động
  - [x] Giỏ hàng trống sau khi xóa
- [x] **LocalStorage**:
  - [x] Giỏ hàng được lưu
  - [x] Reload trang giữ nguyên giỏ hàng
- [x] Nút "Đặt hàng" hiển thị alert

### 8. **Responsive Design**

#### Desktop (>1024px):
- [x] Grid 3 cột
- [x] Modal popup ở giữa màn hình
- [x] Max-width modal hợp lý
- [x] Floating cart button

#### Tablet (640px - 1024px):
- [x] Grid 2 cột
- [x] Modal responsive

#### Mobile (<640px):
- [x] Grid 1 cột
- [x] Modal fullscreen
- [x] Nút back ở góc trái
- [x] Scroll mượt mà
- [x] Touch-friendly buttons
- [x] Category scroll horizontal

### 9. **UX/UI**
- [x] Màu đỏ (#ef4444) nhất quán
- [x] Hover effects hoạt động
- [x] Transitions mượt mà
- [x] Loading states (nếu có)
- [x] Error messages rõ ràng
- [x] Typography dễ đọc
- [x] Spacing hợp lý

### 10. **Performance**
- [x] Hình ảnh load từ Unsplash (next/image optimization)
- [x] No console errors
- [x] No runtime errors
- [x] Fast navigation

---

## 🎯 Test Scenarios

### Scenario 1: Đặt 1 món đơn với options và addons
1. Click "Phở Bò Tái"
2. Chọn Size: Lớn (+20k)
3. Chọn Loại thịt: Đặc biệt (+15k)
4. Thêm 2 trứng (2 × 10k = 20k)
5. Số lượng: 2
6. Ghi chú: "Ít tiêu"
7. **Kỳ vọng**: Tổng = (55k + 20k + 15k + 20k) × 2 = 220,000đ

### Scenario 2: Đặt combo
1. Click "Combo Cơm Gà"
2. Món chính: Gà nướng (+10k)
3. Canh: Canh trứng (+3k)
4. Đồ uống: Trà sữa (+15k)
5. Món phụ: Salad (+10k) + Khoai tây chiên (+15k)
6. **Kỳ vọng**: Tổng = 65k + 10k + 3k + 15k + 10k + 15k = 118,000đ

### Scenario 3: Validation errors
1. Click "Phở Bò Tái"
2. Không chọn gì, click "Thêm vào giỏ"
3. **Kỳ vọng**: Hiển thị 2 lỗi (Size, Loại thịt)

### Scenario 4: LocalStorage persistence
1. Thêm 3 món vào giỏ
2. Reload trang (F5)
3. **Kỳ vọng**: 3 món vẫn còn trong giỏ

---

## ✅ Kết quả

**Status**: ✅ PASS - Tất cả chức năng hoạt động đúng

**Browser tested**: Chrome, Edge, Firefox, Safari (mobile)

**Issues found**: Không có lỗi nghiêm trọng

**Notes**: 
- ESLint warnings về code complexity không ảnh hưởng runtime
- Tất cả core features hoạt động như mong đợi
- UI/UX mượt mà và responsive tốt
