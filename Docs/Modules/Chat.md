# Chat Module (Real-time Support)

## Purpose
Cung cấp kênh giao tiếp trực tuyến giữa Khách hàng và Đội ngũ chăm sóc khách hàng (Admin).

## Scope
- Client: Chat trực tiếp trên website (Widget Chat), gửi văn bản và hình ảnh.
- Admin: Giao diện quản lý tin nhắn tập trung, trả lời khách hàng theo phòng (Room).

## Business Logic
- **Công nghệ:** Sử dụng `Socket.io` để truyền tải dữ liệu thời gian thực.
- **Phân loại Người gửi:** `sender_type` là "user" (Khách hàng) hoặc "admin" (Nhân viên CSKH).
- **Phòng Chat (Room):** Mỗi khách hàng có một `room_chat_id` riêng biệt để đảm bảo tính riêng tư.
- **Trạng thái Online:** Hệ thống tự động cập nhật `statusOnline` trong DB khi socket kết nối/ngắt kết nối.
- **Hình ảnh:** Ảnh gửi qua chat được upload lên Cloudinary dưới dạng base64 từ client và lưu URL vào DB.
- **Typing Indicator:** Thông báo khi đối phương đang soạn thảo tin nhắn.

## Business Rules
- Khi Server khởi động, tất cả trạng thái Online của người dùng được reset về `false`.
- Tin nhắn admin gửi đi luôn được đánh dấu `sender_type: "admin"`.

## Dependencies
- `Socket.io` thư viện chính.
- `Cloudinary` cho việc lưu trữ ảnh chat.
- `Chat` Model cho việc lưu trữ lịch sử tin nhắn.

## Security Rules
- Socket cần được join đúng `room_chat_id` để tránh nhận tin nhắn của người khác.
- Admin chỉ có thể gửi tin nhắn khi đã đăng nhập và có quyền `chat_view`.
