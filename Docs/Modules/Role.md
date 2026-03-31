# Role & Permissions Module

## Purpose
Hệ thống quản lý vai trò và phân quyền dựa trên thuộc tính (RBAC - Role-Based Access Control) cho quản trị viên.

## Scope
- Admin (Super): Tạo vai trò (Role), gán danh sách quyền (`permissions`), và gán vai trò cho tài khoản.
- Hệ thống: Kiểm tra quyền truy cập trước khi thực thi route/controller.

## Business Logic
- **Cấu trúc Quyền:** Quyền được lưu dưới dạng một mảng các chuỗi ký tự (ví dụ: `products_view`, `products_create`).
- **Giao diện Ma trận Quyền:** Một bảng ma trận (Table Matrix) cho phép bật/tắt từng quyền cho từng vai trò cùng một lúc. Dữ liệu sau đó được gửi lên dưới dạng JSON chứa `role_id` và mảng `permissions` mới.
- **Middleware Authorization:** `requirePermission(permission_name)` kiểm tra xem quyền yêu cầu có tồn tại trong `res.locals.userPermissions` hay không.

## Business Rules
- Một tài khoản (`Account`) chỉ gắn với một vai trò (`Role`).
- Super Admin (thường là tài khoản có toàn bộ quyền) chịu trách nhiệm cấu hình các vai trò khác.

## Data Model
- `title`: Tên vai trò (Admin, Editor, v.v.).
- `permissions`: Mảng các string định nghĩa quyền hạn.

## API / Interfaces (Admin)
- `GET /admin/roles/permissions`: Trang cấu hình ma trận quyền.
- `PATCH /admin/roles/permissions`: Cập nhật quyền cho tất cả vai trò.

## Security Rules
- Middleware `requireAuth` tự động nạp thông tin `role` và `permissions` vào `res.locals` cho mỗi request admin.
- Không bao giờ cho phép người dùng thay đổi quyền của chính mình trừ khi họ là Super Admin.
