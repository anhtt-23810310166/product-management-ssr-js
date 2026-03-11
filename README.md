# 🛒 Product Management System - Fullstack E-Commerce

[![Node.js](https://img.shields.io/badge/backend-Node.js%2018-339933?style=flat-square&logo=nodedotjs)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/framework-Express.js-000000?style=flat-square&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/database-MongoDB-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Pug](https://img.shields.io/badge/view_engine-Pug-A86454?style=flat-square&logo=pug)](https://pugjs.org/)
[![Socket.io](https://img.shields.io/badge/realtime-Socket.io-010101?style=flat-square&logo=socketdotio)](https://socket.io/)
[![Bootstrap](https://img.shields.io/badge/styling-Bootstrap%205-7952B3?style=flat-square&logo=bootstrap)](https://getbootstrap.com/)

Hệ thống quản lý sản phẩm và thương mại điện tử toàn diện được xây dựng trên nền tảng Node.js. Hỗ trợ đầy đủ quy trình từ quản lý kho hàng (Admin) đến trải nghiệm mua sắm trực tuyến (Client).

---

## 🌟 Tính Năng Cốt Lõi

### 🛍️ Client Side (Trang Người Dùng)
- **Trang chủ hiện đại**: Banner sống động, Flash Sale đếm ngược, sản phẩm nổi bật & mới nhất.
- **Bộ lọc thông minh**: Tìm kiếm nâng cao, lọc theo danh mục, thương hiệu, mức giá.
- **Giỏ hàng & Thanh toán**: Kiểm tra tồn kho thời gian thực, hỗ trợ COD và VNPay (Online Payment).
- **Hệ thống đánh giá**: Đánh giá sản phẩm theo sao và để lại bình luận thực tế.
- **Tin tức & Blog**: Cập nhật xu hướng công nghệ và tin tức thị trường.
- **Chat trực tuyến**: Hỗ trợ khách hàng thời gian thực qua Socket.IO.
- **Xác thực an toàn**: Đăng nhập qua Google/Facebook OAuth, khôi phục mật khẩu qua OTP Email.

### 🛡️ Admin Side (Trang Quản Trị)
- **Dashboard tổng quan**: Thống kê doanh thu, đơn hàng, người dùng bằng biểu đồ trực quan.
- **Quản lý Sản phẩm**: CRUD sản phẩm, danh mục đa cấp (Recursive Tree), thương hiệu.
- **Chiến dịch Flash Sale**: Tạo và lên lịch các chương trình giảm giá giới hạn thời gian.
- **Quản lý Đơn hàng**: Theo dõi chi tiết và cập nhật trạng thái vận chuyển linh hoạt.
- **Quản lý Nội dung**: Kiểm soát bài viết blog, tin tức và danh mục tin tức.
- **Phân quyền nâng cao (RBAC)**: Hệ thống Roles & Permissions chi tiết cho từng cấp bậc nhân viên.
- **Activity Logging**: Tự động ghi lại mọi thao tác của quản trị viên để truy xuất nguồn gốc.
- **Customer Support Hub**: Giao diện chat tập trung để hỗ trợ người dùng online.

---

## 🛠 Tech Stack

| Thành phần | Công nghệ sử dụng |
| :--- | :--- |
| **Backend** | Node.js, Express.js |
| **View Engine** | Pug (Jade) |
| **Database** | MongoDB (Mongoose ODM) |
| **Real-time** | Socket.IO |
| **Auth** | JWT, Passport.js (Google, Facebook) |
| **Storage** | Cloudinary, Multer |
| **Payment** | VNPay Sandbox |
| **Validation** | Joi |
| **Utils** | PDFKit (Export PDF), XLSX (Excel Support) |

---

## 🏗️ Cấu Trúc Dự Án

```
product-managent/
├── config/             # Cấu hình Database, Cloudinary, System
├── controllers/        # Xử lý logic nghiệp vụ (Admin & Client)
├── helpers/            # Tiện ích (Pagination, Search, Passport, Upload...)
├── middlewares/        # Kiểm tra xác thực, Phân quyền, Upload
├── models/             # Định nghĩa Schema (15 models: Product, Order, User...)
├── public/             # Tài nguyên tĩnh (CSS, JS, Images)
├── routes/             # Hệ thống định tuyến (28 modules)
├── services/           # Logic nghiệp vụ tái sử dụng
├── sockets/            # Xử lý sự kiện Real-time
├── validates/          # Schema kiểm tra dữ liệu đầu vào (Joi)
├── views/              # Template Pug (Giao diện Admin & Client)
└── index.js            # Điểm khởi đầu của ứng dụng
```

---

## 🚀 Hướng Dẫn Cài Đặt

### 1. Yêu cầu hệ thống
- Node.js >= 18.x
- MongoDB (Local hoặc Atlas)

### 2. Các bước triển khai
```bash
# Clone project
git clone <your-repo-url>
cd product-managent

# Cài đặt thư viện
npm install

# Cấu hình môi trường
cp .env.example .env # Sau đó điền thông tin vào .env
```

### 3. Biến môi trường quan trọng (`.env`)
Cần đảm bảo có đủ:
- `MONGO_URL`: Chuỗi kết nối MongoDB.
- `CLOUDINARY_*`: Thông tin API Cloudinary.
- `VNPAY_*`: Thông tin cấu hình thanh toán.
- `EMAIL_USER/PASS`: Tài khoản Gmail để gửi OTP.

### 4. Chạy ứng dụng
```bash
# Chế độ phát triển (auto-reload)
npm run dev

# Chế độ production
npm start
```

---

## 🔗 Truy Cập Hệ Thống

- **Trang chủ**: `http://localhost:3000`
- **Trang quản trị**: `http://localhost:3000/admin`
  - *Lưu ý: Bạn cần có tài khoản quản trị và được cấp quyền để truy cập.*

---

## 📄 Giấy Phép

Dự án sử dụng giấy phép **ISC**.

---
**Developed with ❤️ by Product Management Team**
