# Account Module (Admin Users)

## Purpose
Quản lý thông tin các tài khoản có quyền truy cập vào hệ thống quản trị (Dashboard).

## Scope
- Admin: Tạo mới nhân viên, cập nhật thông tin cá nhân, thay đổi vai trò hoặc trạng thái tài khoản.

## Business Logic
- **Định danh:** Sử dụng `email` làm định danh duy nhất.
- **Bảo mật:** Mật khẩu được mã hóa (Bcrypt) trước khi lưu.
- **Xác thực:** Sử dụng JWT (JSON Web Token) kết hợp với Cookie/Session để duy trì trạng thái đăng nhập.

## Business Rules
- Trạng thái `inactive` sẽ ngăn chặn hoàn toàn việc đăng nhập của tài khoản đó.
- Mỗi tài khoản phải được gán một `role_id` hợp lệ để có quyền truy cập các tính năng.

## Data Model
- `fullName`: Tên hiển thị.
- `email`: Email đăng nhập.
- `password`: Hashed password.
- `role_id`: Tham chiếu đến module `Role`.
- `token`: Chuỗi định danh phiên làm việc.

## Dependencies
- `Role` module.
- `Bcryptjs` cho việc băm mật khẩu.
- `jsonwebtoken` cho việc tạo và xác thực token.

## Security Rules
- Tuyệt đối không trả về `password` trong các câu lệnh `find` (sử dụng `.select("-password")`).
- Token cần được lưu trữ an toàn và có thời gian hết hạn.
