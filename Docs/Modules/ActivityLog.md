# Activity Log Module

## Purpose
Ghi lại mọi hành động quan trọng của quản trị viên (Admin) để phục vụ việc tra cứu và bảo mật hệ thống.

## Scope
- Admin: Xem danh sách log, lọc log theo module hoặc hành động cụ thể.
- Hệ thống: Tự động ghi log khi có các hành động: `create`, `edit`, `delete`, `change-status`, `login`, `permissions`.

## Business Logic
- **Helper `activityLog.js`**: Một hàm `createLog` tiện ích được sử dụng ở tầng Controller. 
- **Cơ chế Fire-and-Forget**: Việc ghi log không được làm chậm phản hồi cho người dùng (không dùng `await` trong controller mà để nó chạy ngầm).
- **TTL (Time To Live)**: Hệ thống tự động xóa các bản ghi log cũ hơn 90 ngày thông qua MongoDB Index (`expireAfterSeconds`).

## Business Rules
- Log phải lưu được: ID người thực hiện, Tên, Hành động, Module, IP và dữ liệu liên quan.
- IP được lấy từ `req.ip` hoặc `x-forwarded-for`.

## Data Model
- `accountId`: ID admin thực hiện.
- `action`: Loại hành động (`create`, `edit`, ...).
- `module`: Tên module bị tác động.
- `data`: Object chứa dữ liệu cũ/mới (optional).

## Dependencies
- `ActivityLog` Model.
- `activityLog.js` Helper.
