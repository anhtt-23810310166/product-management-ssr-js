# Brand Module

## Purpose
Quản lý các thương hiệu sản phẩm có mặt trên hệ thống.

## Scope
- Admin: CRUD thương hiệu, quản lý logo và thông tin mô tả.
- Client: Hiển thị danh sách thương hiệu trong bộ lọc sản phẩm hoặc trang chi tiết sản phẩm.

## Business Logic
- **Nhận diện:** Mỗi sản phẩm (`Product`) có trường `brand_id` tham chiếu đến module này.
- **Hình ảnh:** Logo thương hiệu được lưu trữ qua Cloudinary.

## Business Rules
- Thương hiệu cần có tên và logo (khuyến nghị).
- Khi thương hiệu bị xóa (soft delete), các sản phẩm liên quan vẫn giữ `brand_id` nhưng có thể không hiển thị tên thương hiệu ở frontend nếu không kiểm tra tồn tại.

## Dependencies
- `Product` module (mối quan hệ 1-N).

## Security Rules
- Yêu cầu quyền `brands_view`, `brands_create`, `brands_edit`, `brands_delete`.
