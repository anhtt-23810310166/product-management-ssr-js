# Flash Sale & Discount Module

## Purpose
Quản lý các chương trình khuyến mãi, giảm giá sốc trong khung giờ vàng và mã giảm giá.

## Scope
- Admin: Thiết lập khung giờ Flash Sale, chọn sản phẩm tham gia, tạo mã Discount code.
- Client: Hiển thị sản phẩm đang Flash Sale với thanh tiến độ (sold/stock), áp dụng mã giảm giá khi checkout.

## Business Logic
- **Flash Sale:**
    - Có thời gian bắt đầu (`startTime`) và kết thúc (`endTime`).
    - Mỗi sản phẩm trong Flash Sale có `discountPercentage` và `stock` riêng (khác với giá gốc).
    - Tự động ẩn khi hết thời gian hoặc hết tồn kho trong chương trình.
- **Discount Code:**
    - Có hai loại: `percentage` (giảm %) và `fixed` (giảm số tiền cố định).
    - Có giới hạn lượt dùng (`usageLimit`) và giá trị đơn hàng tối thiểu (`minOrder`).

## Business Rules
- Mã giảm giá phải là duy nhất và được viết hoa (`uppercase`).
- Không thể áp dụng mã giảm giá đã hết hạn hoặc đã dùng hết lượt.

## Dependencies
- `Product` module.
- `Order` module (để kiểm tra và trừ lượt dùng mã giảm giá).

## Security Rules
- Chỉ Admin có quyền quản lý qua `flash-sale_view` và `discounts_view`.
