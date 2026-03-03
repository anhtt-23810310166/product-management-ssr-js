# Product Management System

A fullstack e-commerce and product management system built with Node.js, Express, MongoDB, and Pug. This application supports administrators in managing business operations and provides a seamless shopping experience for customers.

---

## Core Features

### Client Side (Customer Portal)

- Home Page: Hero banner, Flash Sale countdown, featured products, new arrivals, news & blog
- Products: Filter by category, brand, advanced search, detailed product views
- Shopping Cart: Add/edit/remove items, real-time inventory checking
- Checkout: Support for COD and VNPay online payment, personal order management
- Reviews: Product rating system (stars) and user comments
- Articles: Tech news, blog posts categorized by topics
- Real-time Chat: Instant messaging with administrators via Socket.IO
- User Account: Registration, Login, Google/Facebook OAuth integration, OTP-based password recovery via email

### Admin Side (Dashboard)

- Dashboard overview: Revenue statistics, order summaries, user metrics
- Product Management: Full CRUD operations for products, categories, and brands
- Flash Sale Management: Create and schedule time-limited discount campaigns
- Order Management: View order details and update delivery statuses
- Content Management: Manage blog articles and article categories
- User & Account Management: Control customer accounts and admin credentials
- Role-based Access Control (RBAC): Flexible roles and permissions system
- Customer Support: Real-time chat interface to assist online users
- Activity Logging: Track and record admin actions automatically
- General Settings: Global website configuration

---

## Tech Stack

| Component               | Technology                                |
| ----------------------- | ----------------------------------------- |
| Backend                 | Node.js, Express.js                       |
| Template Engine         | Pug                                       |
| Database                | MongoDB (Mongoose ODM)                    |
| Real-time Communication | Socket.IO                                 |
| Authentication          | JWT, Passport.js (Google, Facebook OAuth) |
| Image Upload            | Cloudinary, Multer                        |
| Payment Gateway         | VNPay Sandbox                             |
| Mailing Service         | Nodemailer                                |
| Validation              | Joi                                       |
| Styling                 | Bootstrap + Custom CSS                    |

---

## Project Structure

```
product-managent/
|-- config/             # Database and system configuration
|-- controllers/        # Application logic
|   |-- admin/          # Admin portal controllers
|   |-- client/         # Client portal controllers
|-- helpers/            # Utility functions (pagination, search, passport...)
|-- middlewares/        # Express middlewares (auth, validation, upload...)
|-- models/             # Mongoose schemas (15 models)
|-- public/             # Static assets (CSS, JS, images)
|   |-- admin/          # Admin static files
|   |-- client/         # Client static files
|-- routes/             # Express routing
|   |-- admin/          # 18 admin route modules
|   |-- client/         # 10 client route modules
|-- services/           # Reusable business logic services
|-- sockets/            # Socket.IO event handlers
|-- validates/          # Joi validation schemas
|-- views/              # Pug template files
|   |-- admin/          # Admin UI templates
|   |-- client/         # Client UI templates
|-- index.js            # Application entry point
|-- package.json
|-- .env                # Environment variables
```

---

## Installation & Setup

### Prerequisites

- Node.js >= 18.x
- MongoDB (Local or MongoDB Atlas)
- npm >= 9.x

### Steps to Run

1. Clone the repository

```bash
git clone <repository-url>
cd product-managent
```

2. Install dependencies

```bash
npm install
```

3. Configure environment variables

Create a .env file in the root directory:

```env
PORT=3000
MONGO_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/product-managent

# Cloudinary Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Service (Gmail)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# JWT Authentication
JWT_SECRET=your_jwt_secret_key

# VNPay Integration
VNPAY_TMN_CODE=your_tmn_code
VNPAY_HASH_SECRET=your_hash_secret
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:3000/cart/vnpay-return

# OAuth Credentials
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
```

4. Run the development server

```bash
npm run dev
```

5. Access the application

- Client Portal: http://localhost:3000
- Admin Dashboard: http://localhost:3000/admin

### Running in Production

```bash
npm start
```

---

## Database Models

| Model           | Description                                               |
| --------------- | --------------------------------------------------------- |
| Product         | Product details (name, price, images, category, stock...) |
| ProductCategory | Product categories (supports hierarchical sub-categories) |
| Brand           | Product brands/manufacturers                              |
| User            | Customer accounts (profile, address, OAuth references)    |
| Account         | Administrator accounts                                    |
| Role            | Admin roles and permission matrices                       |
| Cart            | Shopping cart session storage                             |
| Order           | Customer orders (COD, VNPay transactions)                 |
| FlashSale       | Scheduled discount campaigns                              |
| Article         | Blog posts and news articles                              |
| ArticleCategory | Article topic categorization                              |
| Review          | Product user reviews and ratings                          |
| Chat            | Individual chat messages                                  |
| RoomChat        | Chat room sessions                                        |
| ActivityLog     | Traceability logs for admin actions                       |

---

## API Routes Overview

### Client Routes

| Method   | Route                  | Description                          |
| -------- | ---------------------- | ------------------------------------ |
| GET      | /                      | Homepage                             |
| GET      | /products              | Product listing                      |
| GET      | /products/detail/:slug | Product detailed view                |
| GET      | /articles              | Articles and blog listing            |
| GET/POST | /cart                  | Shopping cart management             |
| GET/POST | /order                 | Order placement and checkout process |
| GET/POST | /user                  | Login, registration, profile, OTP    |
| GET/POST | /chat                  | Customer support chat interface      |
| GET/POST | /review                | Submit product reviews               |

### Admin Routes

| Method | Route                    | Description                 |
| ------ | ------------------------ | --------------------------- |
| GET    | /admin/dashboard         | Main dashboard              |
| CRUD   | /admin/products          | Manage products             |
| CRUD   | /admin/products-category | Manage product categories   |
| CRUD   | /admin/brands            | Manage brands               |
| CRUD   | /admin/flash-sale        | Manage Flash Sale campaigns |
| CRUD   | /admin/articles          | Manage articles             |
| CRUD   | /admin/articles-category | Manage article categories   |
| CRUD   | /admin/accounts          | Manage admin accounts       |
| CRUD   | /admin/roles             | Manage administrative roles |
| GET    | /admin/users             | Manage customer accounts    |
| GET    | /admin/orders            | Manage and update orders    |
| GET    | /admin/chat              | Admin-side support chat     |

---

## License

ISC License
