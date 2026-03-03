# Product Management - He Thong Quan Ly Ban Hang

He thong quan ly san pham va ban hang truc tuyen fullstack duoc xay dung bang Node.js, Express, MongoDB va Pug. Ho tro quan tri vien quan ly toan bo hoat dong kinh doanh va khach hang mua sam truc tuyen.

---

## Tinh Nang Chinh

### Trang Khach Hang (Client)

- Trang chu: Hero banner, Flash Sale dem nguoc, san pham noi bat, hang moi ve, tin tuc & blog
- San pham: Loc theo danh muc, thuong hieu, tim kiem, xem chi tiet
- Gio hang: Them, sua, xoa san pham, kiem tra ton kho realtime
- Dat hang: Thanh toan COD & VNPay, quan ly don hang ca nhan
- Danh gia: Danh gia san pham voi sao va binh luan
- Bai viet: Tin tuc cong nghe, bai viet theo danh muc
- Chat: Nhan tin realtime voi admin qua Socket.IO
- Tai khoan: Dang ky, dang nhap, OAuth Google/Facebook, quen mat khau qua OTP email

### Trang Quan Tri (Admin)

- Dashboard: Tong quan doanh thu, don hang, nguoi dung
- Quan ly san pham: CRUD san pham, danh muc, thuong hieu
- Flash Sale: Tao chuong trinh giam gia co thoi han
- Don hang: Xem, cap nhat trang thai don hang
- Bai viet: Quan ly bai viet, danh muc bai viet
- Nguoi dung & Tai khoan: Quan ly khach hang, tai khoan admin
- Phan quyen: He thong vai tro va quyen han linh hoat
- Chat: Ho tro khach hang realtime
- Nhat ky hoat dong: Ghi log thao tac admin
- Cai dat he thong: Cau hinh website

---

## Cong Nghe Su Dung

| Thanh phan      | Cong nghe                                 |
| --------------- | ----------------------------------------- |
| Backend         | Node.js, Express.js                       |
| Template Engine | Pug                                       |
| Database        | MongoDB (Mongoose ODM)                    |
| Realtime        | Socket.IO                                 |
| Authentication  | JWT, Passport.js (Google, Facebook OAuth) |
| Upload anh      | Cloudinary, Multer                        |
| Thanh toan      | VNPay Sandbox                             |
| Email           | Nodemailer                                |
| Validation      | Joi                                       |
| CSS             | Bootstrap + Custom CSS                    |

---

## Cau Truc Du An

```
product-managent/
|-- config/             # Cau hinh database, he thong
|-- controllers/        # Xu ly logic
|   |-- admin/          # Controllers trang quan tri
|   |-- client/         # Controllers trang khach hang
|-- helpers/            # Ham tien ich (pagination, search, passport...)
|-- middlewares/        # Middleware (auth, validate, upload, error handler)
|-- models/             # Mongoose schemas (15 models)
|-- public/             # Static files (CSS, JS, images)
|   |-- admin/          # Assets trang admin
|   |-- client/         # Assets trang client
|-- routes/             # Dinh tuyen
|   |-- admin/          # 18 route modules admin
|   |-- client/         # 10 route modules client
|-- services/           # Business logic services
|-- sockets/            # Socket.IO handlers (chat)
|-- validates/          # Joi validation schemas
|-- views/              # Pug templates
|   |-- admin/          # Giao dien admin
|   |-- client/         # Giao dien client
|-- index.js            # Entry point
|-- package.json
|-- .env                # Bien moi truong
```

---

## Cai Dat & Chay

### Yeu Cau

- Node.js >= 18.x
- MongoDB (hoac MongoDB Atlas)
- npm >= 9.x

### Cac Buoc

1. Clone du an

```bash
git clone <repository-url>
cd product-managent
```

2. Cai dat dependencies

```bash
npm install
```

3. Cau hinh bien moi truong

Tao file .env tai thu muc goc:

```env
PORT=3000
MONGO_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/product-managent

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Gmail)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# JWT
JWT_SECRET=your_jwt_secret_key

# VNPay
VNPAY_TMN_CODE=your_tmn_code
VNPAY_HASH_SECRET=your_hash_secret
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:3000/cart/vnpay-return

# OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
```

4. Chay development server

```bash
npm run dev
```

5. Truy cap ung dung

- Client: http://localhost:3000
- Admin: http://localhost:3000/admin

### Chay Production

```bash
npm start
```

---

## Database Models

| Model           | Mo ta                                          |
| --------------- | ---------------------------------------------- |
| Product         | San pham (ten, gia, anh, danh muc, ton kho...) |
| ProductCategory | Danh muc san pham (ho tro da cap)              |
| Brand           | Thuong hieu san pham                           |
| User            | Khach hang (thong tin, dia chi, OAuth)         |
| Account         | Tai khoan quan tri vien                        |
| Role            | Vai tro & phan quyen admin                     |
| Cart            | Gio hang                                       |
| Order           | Don hang (COD, VNPay)                          |
| FlashSale       | Chuong trinh Flash Sale                        |
| Article         | Bai viet / tin tuc                             |
| ArticleCategory | Danh muc bai viet                              |
| Review          | Danh gia san pham                              |
| Chat            | Tin nhan chat                                  |
| RoomChat        | Phong chat                                     |
| ActivityLog     | Nhat ky hoat dong admin                        |

---

## API Routes

### Client Routes

| Method   | Route                  | Mo ta                       |
| -------- | ---------------------- | --------------------------- |
| GET      | /                      | Trang chu                   |
| GET      | /products              | Danh sach san pham          |
| GET      | /products/detail/:slug | Chi tiet san pham           |
| GET      | /articles              | Danh sach bai viet          |
| GET/POST | /cart                  | Gio hang                    |
| GET/POST | /order                 | Dat hang                    |
| GET/POST | /user                  | Dang nhap, dang ky, profile |
| GET/POST | /chat                  | Chat voi admin              |
| GET/POST | /review                | Danh gia san pham           |

### Admin Routes

| Method | Route                    | Mo ta                     |
| ------ | ------------------------ | ------------------------- |
| GET    | /admin/dashboard         | Dashboard                 |
| CRUD   | /admin/products          | Quan ly san pham          |
| CRUD   | /admin/products-category | Quan ly danh muc          |
| CRUD   | /admin/brands            | Quan ly thuong hieu       |
| CRUD   | /admin/flash-sale        | Quan ly Flash Sale        |
| CRUD   | /admin/articles          | Quan ly bai viet          |
| CRUD   | /admin/articles-category | Quan ly danh muc bai viet |
| CRUD   | /admin/accounts          | Quan ly tai khoan admin   |
| CRUD   | /admin/roles             | Quan ly vai tro           |
| GET    | /admin/users             | Quan ly nguoi dung        |
| GET    | /admin/orders            | Quan ly don hang          |
| GET    | /admin/chat              | Chat ho tro               |

---

## License

ISC License
