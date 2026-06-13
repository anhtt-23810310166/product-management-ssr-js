# AI KNOWLEDGE BASE & MODULE SUMMARY

> **❗ CHÚ Ý DÀNH CHO AI (AGENT):**
> File này là Single Source of Truth tổng hợp toàn bộ kiến trúc, nghiệp vụ và sơ đồ module của dự án. 
> **AI PHẢI ĐỌC FILE NÀY** trước khi thực hiện bất kỳ thay đổi nào để không phải tốn token/thời gian đọc source code từng file.

---

## 1. KIẾN TRÚC IMPLEMENTATION (ARCHITECTURE)
Hệ thống sử dụng mô hình **MVC + Service Layer** trên nền tảng **Node.js + Express + Pug + MongoDB + Redis**.
Dự án được triển khai bằng **Docker** và có luồng **CI/CD** qua GitHub Actions.

*   **Luồng dữ liệu (Data Flow):** `Route` → `Middleware` (Xác thực/Validation Joi) → `Controller` (Nhận Request/Trả Response) → `Service` (Chứa toàn bộ Business Logic/Truy vấn DB) → `Model` (Mongoose Schema) → `Controller` → `View` (Pug Renderer hoặc JSON).
*   **Phân quyền (RBAC):** Admin phân quyền theo thuộc tính (ví dụ: `products_view`, `orders_edit`). Middleware `requirePermission` sẽ block request nếu không có quyền.
*   **Error Handling:** Lỗi ở Controller/Service sẽ được ném vào `next(error)` và xử lý tập trung tại `middlewares/errorHandler.middleware.js`.
*   **Soft Delete:** Hầu hết collections không xóa cứng mà dùng cờ `deleted: true` và `deletedAt`.

---

## 2. AGENT CONTEXT & SKILLS (Quy định bắt buộc cho AI)
Chi tiết tại: `Docs/FEATURE_GUIDELINES.md` và `Docs/AI_CONTEXT.md`.
*   **Agent Rule 1:** Không tự ý thêm thư viện ngoài (`npm install`) nếu chưa xin phép.
*   **Agent Rule 2:** Luôn tái sử dụng các Helper có sẵn trong thư mục `helpers/` (như upload ảnh lên Cloudinary, Pagination, CreateTree).
*   **Agent Rule 3:** Không lưu mật khẩu/secret dạng clear text. Tuyệt đối không thay đổi biến môi trường.
*   **Agent Rule 4:** Code luôn chia rõ tách biệt giữa Admin (Dashboard) và Client (Storefront).

---

## 3. SUMMARY CÁC MODULE NGHIỆP VỤ (BUSINESS RULES)
Mỗi module được thiết kế theo cấu trúc thư mục rõ ràng. Chi tiết nghiệp vụ chuyên sâu nằm ở `Docs/Modules/TênModule.md`. Dưới đây là bảng tổng hợp giúp AI xác định context nhanh nhất:

### 📦 Nhóm Sản phẩm & Mua sắm (E-Commerce)
| Module | File Docs Chi Tiết | Controller & Service | Nghiệp Vụ Chính (Business Rules) |
| :--- | :--- | :--- | :--- |
| **Product** | `Docs/Modules/Product.md` | `product.*.js` | Quản lý sản phẩm. Hỗ trợ **Tìm kiếm bằng giọng nói** (Voice Search). Giá hiển thị = `price - (price * discountPercentage)`. Xóa mềm. Ảnh lưu trên Cloudinary. |
| **Category**| `Docs/Modules/ProductCategory.md`| `product-category.*.js` | Danh mục đa cấp (Tree). Cần dùng helper `createTree` để đệ quy danh mục cha-con. |
| **Cart** | `Docs/Modules/Cart.md` | `cart.*.js` | Quản lý giỏ hàng qua `cartId` (lưu Cookie 30 ngày). **Tự động chọn biến thể đầu tiên** nếu thêm nhanh. Cộng dồn số lượng nếu trùng Product/Variant. |
| **Order** | `Docs/Modules/Order.md` | `order.*.js` | Checkout từ Cart. **Bắt buộc Snapshot** giá/tên sản phẩm tại thời điểm mua. Trừ stock khi thanh toán. Hỗ trợ VNPAY & COD. |
| **Marketing**| `Docs/Modules/Marketing.md`| `flash-sale.*`, `discount.*`| Quản lý Flash sale (có startTime/endTime) và Discount code. Có kiểm tra số lượt dùng và số lượng stock riêng cho Flash sale. |

### 👥 Nhóm Tài khoản & Phân quyền (Auth & RBAC)
| Module | File Docs Chi Tiết | Controller & Service | Nghiệp Vụ Chính (Business Rules) |
| :--- | :--- | :--- | :--- |
| **Auth** | `Docs/Modules/Auth.md` | `auth.*.js` | Tách biệt Admin (Local Login) và Client (Local, Google/FB OAuth). Sử dụng JWT/Session Token. Password mã hóa Bcrypt. |
| **Account**| `Docs/Modules/Account.md` | `account.*.js` | Tài khoản nội bộ (Admin). Liên kết với `role_id`. Nếu status `inactive` sẽ không thể đăng nhập. |
| **Role** | `Docs/Modules/Role.md` | `role.*.js` | Quản lý vai trò (Super Admin, Editor). Lưu permissions dưới dạng mảng các chuỗi (`["view", "edit"]`). Cấu hình bằng ma trận quyền (Matrix Table). |

### 🛠️ Nhóm Tiện ích & Chăm sóc khách hàng
| Module | File Docs Chi Tiết | Controller & Service | Nghiệp Vụ Chính (Business Rules) |
| :--- | :--- | :--- | :--- |
| **Chat** | `Docs/Modules/Chat.md` | `chat.*.js`, `sockets/` | Tích hợp Socket.io. Chat riêng tư giữa 1 Client (`room_chat_id` riêng) và Admin. Lưu tin nhắn vào DB có phân biệt `sender_type`. |
| **Review** | `Docs/Modules/Review.md` | `review.*.js` | Khách hàng đánh giá 1-5 sao sau khi mua hàng. Admin có thể trả lời (`replies` lồng nhau). |
| **Log** | `Docs/Modules/ActivityLog.md`| `activity-log.*.js` | Ghi lại hành động của Admin (CRUD) dưới dạng Fire-and-Forget (không làm chậm app). Tự động xóa log sau 90 ngày (TTL MongoDB). |

---
**📍 HƯỚNG DẪN DÀNH CHO AI KHI NHẬN TASK:**
1. Đọc yêu cầu của User.
2. Kiểm tra `AI_MODULES_SUMMARY.md` (file này) để xác định module cần sửa.
3. Nếu cần, đọc thêm file chi tiết trong `Docs/Modules/{ModuleName}.md`.
4. Tìm đến các file tương ứng: `controllers/{admin|client}/{module}.controller.js`, `services/{module}.service.js`, `views/{admin|client}/pages/{module}/*.pug`.
5. Đề xuất code thay đổi tối thiểu, tuân thủ kiến trúc **MVC + Service** và **Error Handler**.
