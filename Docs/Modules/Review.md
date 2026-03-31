# Review & Rating Module

## Purpose
Cho phép khách hàng đánh giá chất lượng sản phẩm và giúp Admin phản hồi ý kiến khách hàng.

## Scope
- Client: Gửi đánh giá (1-5 sao), để lại bình luận và hình ảnh trên trang chi tiết sản phẩm.
- Admin: Quản lý đánh giá, ẩn/hiện đánh giá không phù hợp, trả lời đánh giá khách hàng.

## Business Logic
- **Rating:** Mỗi đánh giá có điểm từ 1 đến 5. Điểm trung bình sản phẩm thường được tính toán động từ collection này.
- **Phản hồi (Replies):** Admin có thể trả lời trực tiếp vào một đánh giá. Câu trả lời được lưu lồng trong mảng `replies` của bản ghi đó.
- **Soft Delete:** Hỗ trợ ẩn đánh giá nhưng không xóa khỏi DB.

## Business Rules
- Chỉ người dùng đã đăng nhập mới có quyền đánh giá (hoặc theo cấu hình - hiện tại code yêu cầu `userId`).
- Một người dùng có thể đánh giá nhiều lần (hoặc giới hạn 1 lần tùy logic controller).

## Dependencies
- `Product` module.
- `User` module.

## Security Rules
- Admin cần quyền `reviews_view` để xem và `reviews_edit` để phản hồi/xóa.
