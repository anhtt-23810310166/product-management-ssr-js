# Settings & Configuration

## Purpose
Quản lý các thông số cấu hình chung của toàn bộ hệ thống mà không cần sửa code.

## Scope
- Admin: Cập nhật thông tin liên hệ, logo website, các đoạn mã script (Google Analytics, v.v.).

## Business Logic
- **Lưu trữ:** Thông tin được lưu vào một collection riêng (thường chỉ có 1 bản ghi duy nhất).
- **Global Access:** Cấu hình này thường được load lên `res.locals` thông qua một middleware để có thể truy cập từ bất kỳ file Pug nào.

## Data Model (Dự kiến)
- `websiteName`: Tên website.
- `logo`: Link ảnh logo.
- `phone/email/address`: Thông tin liên hệ.
- `copyright`: Thông tin bản quyền chân trang.

## Dependencies
- `Setting` Model (nếu có) hoặc `config/system.js`.
