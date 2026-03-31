# Feature Guidelines - Product Management System

## Coding Standards

### 1. Naming Conventions
- **Files:** `kebab-case.extension.js` (e.g., `product.controller.js`).
- **Variables/Functions:** `camelCase`.
- **Constants:** `UPPER_SNAKE_CASE`.
- **Classes/Models:** `PascalCase`.

### 2. Error Handling
- **Service Layer:** Throw meaningful lỗi hoặc trả về structured error responses.
- **Controller Layer:** Sử dụng `try-catch`. Bắt lỗi và chuyển sang global error handler (`next(error)`).
- **Global Middleware:** `errorHandler.middleware.js` xử lý tất cả `next(error)`, log chi tiết lỗi và trả về JSON hoặc render trang lỗi dựa trên loại request.
- **UI:** Sử dụng `express-flash` cho các thông báo success/error.

### 3. Asset Management
- **Cloudinary:** Luôn sử dụng helper `upload.js` hoặc cấu hình multer-cloudinary để xử lý ảnh.
- **Cấm:** Không lưu file nhị phân (binary) trực tiếp vào Database. Chỉ lưu URL.

### 4. Validation
- Sử dụng **Joi** schemas cho tất cả dữ liệu đầu vào (`req.body`, `req.query`).
- Validation phải diễn ra ở tầng middleware trước khi vào controller.

### 5. Authentication & Authorization (RBAC)
- **Admin:** Xác thực qua `auth.middleware.js` sử dụng session/JWT. Kiểm tra quyền qua `requirePermission(permission_name)`.
- **Client:** Xác thực qua `auth.middleware.js`.

### 6. View Rendering
- **Mixins:** Luôn sử dụng mixins cho các thành phần UI lặp lại (bảng, form, phân trang).
- **Logic trong View:** Hạn chế tối đa logic trong file Pug; chuẩn bị toàn bộ dữ liệu ở controller.

## Forbidden Actions
- **KHÔNG** log secrets hoặc API keys.
- **KHÔNG** hardcode credentials hoặc sensitive endpoints.
- **KHÔNG** commit file `.env`.
- **KHÔNG** bỏ qua tầng Service để thao tác trực tiếp với Database.
- **KHÔNG** tự ý thêm thư viện ngoài mà chưa được phê duyệt.
