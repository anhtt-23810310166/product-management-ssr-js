# Cart Module

## Purpose
Quản lý giỏ hàng của khách hàng trước khi tiến hành đặt hàng.

## Scope
- Client: Thêm/Xóa/Sửa số lượng sản phẩm trong giỏ, lưu trữ giỏ hàng lâu dài.

## Business Logic
- **Lưu trữ:** Giỏ hàng được lưu trong MongoDB và gắn với một `cartId` duy nhất trong Cookie của trình duyệt (thường tồn tại 30 ngày).
- **Sáp nhập (Optional):** Nếu người dùng đăng nhập, giỏ hàng có thể được cập nhật thêm `userId` để đồng bộ giữa các thiết bị.
- **Variant Support:** Hỗ trợ lưu thông tin cụ thể về biến thể sản phẩm (size, màu sắc) cùng với ID sản phẩm.

## Business Rules
- Số lượng sản phẩm tối thiểu trong giỏ là 1.
- Nếu thêm sản phẩm đã có trong giỏ, hệ thống tự động cộng dồn số lượng.
- **Auto-selection:** Đối với các sản phẩm có biến thể, nếu người dùng thêm vào giỏ hàng mà không chọn phân loại (ví dụ: nút thêm nhanh từ trang chủ), hệ thống sẽ tự động chọn biến thể đầu tiên có trong danh sách.
- **Validation:** Kiểm tra tồn kho của từng biến thể cụ thể trước khi thêm. Nếu vượt quá số lượng tồn kho (hoặc tồn kho Flash Sale), hệ thống sẽ báo lỗi.

## Data Model
- `cartId`: Định danh giỏ hàng lưu ở cookie.
- `userId`: Liên kết với tài khoản khách hàng.
- `items`: Mảng chứa `productId`, `variantId`, `quantity`.

## Dependencies
- `Product` module (để lấy thông tin giá và tồn kho hiển thị trong giỏ).
- `CartMiddleware`: Đếm tổng số lượng item để hiển thị ở Header.
