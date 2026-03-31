# Product Category Module

## Purpose
Quản lý cấu trúc danh mục sản phẩm theo dạng phân cấp (Tree structure).

## Scope
- Admin: Tạo/Sửa/Xóa danh mục, thay đổi vị trí (`position`), thay đổi danh mục cha (`parent_id`).
- Client: Hiển thị menu danh mục đa cấp, lọc sản phẩm theo danh mục.

## Business Logic
- **Cấu trúc Cây (Tree Architecture):** Sử dụng `parent_id` để xác định mối quan hệ cha-con. Helper `createTree.js` chịu trách nhiệm chuyển đổi danh sách phẳng từ DB thành object lồng nhau để render view.
- **Vị trí (Positioning):** Hỗ trợ sắp xếp thủ công qua trường `position`. Nếu không nhập, hệ thống tự động tính toán (thường là số lượng bản ghi + 1).
- **Slug:** Tự động tạo từ `title`, đảm bảo duy nhất để phục vụ SEO.

## Business Rules
- Một danh mục có thể không có cha (`parent_id: ""`).
- Khi xóa một danh mục cha, các danh mục con vẫn tồn tại nhưng sẽ mồ côi (hoặc cần được xử lý theo logic nghiệp vụ cụ thể - hiện tại code đang giữ nguyên).
- Không được phép chọn chính nó làm danh mục cha (để tránh vòng lặp vô tận).

## Data Model
- `title`: Tên danh mục.
- `parent_id`: ID của danh mục cha.
- `slug`: Đường dẫn URL-friendly.
- `status`: `active` hoặc `inactive`.

## Dependencies
- Helper `createTree.js`.
- BaseService (thừa kế CRUD cơ bản).

## Security Rules
- Yêu cầu quyền `product-category_view` để xem và `product-category_edit/create/delete` để thao tác.
