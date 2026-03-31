# Article Module

## Purpose
Quản lý nội dung tin tức, blog hoặc các bài viết hướng dẫn trên hệ thống.

## Scope
- Admin: Soạn thảo bài viết (sử dụng TinyMCE), quản lý danh mục bài viết, thiết lập bài viết nổi bật (`featured`).
- Client: Xem danh sách tin tức, chi tiết bài viết.

## Business Logic
- **Phân loại:** Bài viết gắn liền với `ArticleCategory`.
- **Nổi bật:** Các bài viết có `featured: true` thường được ưu tiên hiển thị ở trang chủ hoặc thanh bên.

## Business Rules
- Bài viết hỗ trợ định dạng HTML (TinyMCE) cho phần mô tả.
- Slug được tạo tự động để tối ưu SEO.

## Dependencies
- `ArticleCategory` module.
- TinyMCE (Frontend Lib cho Admin).

## Security Rules
- Kiểm soát qua các quyền `articles_view`, `articles_create`, `articles_edit`, `articles_delete`.
