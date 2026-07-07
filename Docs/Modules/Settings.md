# Settings & Configuration

## Purpose
Quản lý các thông số cấu hình chung của toàn bộ hệ thống và giao diện linh hoạt của trang chủ mà không cần can thiệp vào code.

## Scope
- Admin: Cập nhật thông tin liên hệ, logo website, tên hệ thống.
- Admin: Cấu hình nội dung trang chủ (Hero Banner, danh sách tính năng nổi bật, Banner quảng cáo nhỏ).
- Admin: Cấu hình SEO toàn cục (Title, Description, OpenGraph, GA4, robots.txt).
- Admin: Truy cập nhanh Sitemap động của hệ thống từ Sidebar (mở ở tab mới).
- Client: Toàn bộ thông tin cấu hình được nạp qua middleware để hiển thị động lên Header, Footer, Homepage và các thẻ `<head>`.

## Business Logic
- **Lưu trữ:** Thông tin được lưu vào collection `setting-generals` và `setting-seos` (mỗi collection chỉ có 1 bản ghi duy nhất, tự động tạo mới nếu chưa có).
- **Global Access:** Cấu hình này được load lên `res.locals.settingGeneral` và `res.locals.settingSeo` thông qua các middleware tương ứng để có thể truy cập từ bất kỳ file Pug nào.
- **Dynamic SEO & Robots.txt:** Cung cấp fallback cho Meta Tags (ưu tiên dữ liệu riêng của Entity như Article/Product, nếu không có sẽ lấy cấu hình SEO toàn cục). Tự động phục vụ nội dung file `/robots.txt` từ Database.
- **Dynamic Sitemap:** Hệ thống tự động sinh sitemap động tại `/sitemap.xml` liệt kê toàn bộ URL sản phẩm, danh mục, và bài viết đang hoạt động (`status: "active"`, `deleted: false`) cùng với thời gian cập nhật gần nhất (`<lastmod>`). Sitemap này tự động khai báo trong `robots.txt` để hỗ trợ các công cụ tìm kiếm (Googlebot).
- **Giao diện & Trải nghiệm (UI/UX):** Các ô nhập liệu (`.form-input`, `.form-textarea`) được thiết kế nền trắng (`#ffffff`) kết hợp viền xám rõ ràng (`#cbd5e1`), có trạng thái `:hover` (`#94a3b8`) và `:focus` (viền xanh thương hiệu) giúp người quản trị dễ dàng phân biệt ô nhập trên nền xám nhạt của trang cài đặt.

## Data Model (SettingGeneral)
- `websiteName`: Tên website.
- `logo`: Link ảnh logo (Upload qua Cloudinary).
- `phone/email/address`: Thông tin liên hệ.
- `copyright`: Thông tin bản quyền chân trang.
- `heroBanner`: Object chứa cấu hình banner chính (image, title, desc, buttonText, buttonLink).
- `features`: Mảng tối đa 4 phần tử lưu cấu hình khối tính năng (icon, title, desc).
- `doubleBanners`: Mảng chứa tối đa 2 khối banner dọc quảng cáo (image, title, badge, buttonText, link).

## Data Model (SettingSeo)
- `metaTitle`: Meta title fallback.
- `metaDescription`: Meta description fallback.
- `metaKeyword`: Meta keyword.
- `ogImage`: Ảnh OpenGraph hiển thị khi chia sẻ link.
- `googleAnalyticsId`: ID để chèn mã thẻ GA4.
- `robotsTxt`: Nội dung để render tại endpoint `/robots.txt`.

## Dependencies
- `SettingGeneral`, `SettingSeo` Model.
- Controller: `sitemap.controller.js`, `robots.controller.js`.
- Middleware: `setting.middleware.js`, `settingSeo.middleware.js`.
