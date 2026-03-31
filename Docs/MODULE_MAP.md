# Module Map - Product Management System

## Admin Modules

| Module | Responsibility | Controller | Service | Routes | Views |
|---|---|---|---|---|---|
| **Dashboard** | Overview of system stats and charts. | `dashboard.controller.js` | N/A | `dashboard.route.js` | `admin/pages/dashboard/` |
| **Products** | CRUD operations for products, stock management. | `product.controller.js` | `product.service.js` | `product.route.js` | `admin/pages/products/` |
| **Product Categories**| Hierarchical category management. | `product-category.controller.js`| `product-category.service.js`| `product-category.route.js` | `admin/pages/product-category/`|
| **Orders** | Management of customer orders, status tracking. | `order.controller.js` | `order.service.js` | `order.route.js` | `admin/pages/orders/` |
| **Articles** | Blog/Article content management. | `article.controller.js` | `article.service.js` | `article.route.js` | `admin/pages/articles/` |
| **Brands** | Manufacturer/Brand management. | `brand.controller.js` | `brand.service.js` | `brand.route.js` | `admin/pages/brands/` |
| **Roles & Permissions**| RBAC management. | `role.controller.js` | `role.service.js` | `role.route.js` | `admin/pages/roles/` |
| **Accounts** | Internal admin staff management. | `account.controller.js` | `account.service.js` | `account.route.js` | `admin/pages/accounts/` |
| **Settings** | Global site configuration. | `setting.controller.js` | N/A | `setting.route.js` | `admin/pages/settings/` |
| **Chat** | Real-time support chat management. | `chat.controller.js` | `chat.service.js` | `chat.route.js` | `admin/pages/chat/` |

## Client Modules

| Module | Responsibility | Controller | Service | Routes | Views |
|---|---|---|---|---|---|
| **Home** | Landing page, featured sections. | `home.controller.js` | N/A | `home.route.js` | `client/pages/home/` |
| **Product Catalog** | Browsing, searching, and product details. | `product.controller.js` | `product.service.js` | `product.route.js` | `client/pages/products/` |
| **Cart** | Shopping cart lifecycle management. | `cart.controller.js` | N/A | `cart.route.js` | `client/pages/cart/` |
| **Checkout & Orders**| Order placement and history. | `order.controller.js` | `order.service.js` | `order.route.js` | `client/pages/orders/` |
| **User Auth** | Login, registration, profile management. | `auth.controller.js` | `user.service.js` | `user.route.js` | `client/pages/user/` |
| **Chat** | Customer-side real-time chat interface. | `chat.controller.js` | `chat.service.js` | `chat.route.js` | `client/pages/chat/` |
| **Wishlist** | Favorite products management. | `wishlist.controller.js` | N/A | `wishlist.route.js` | `client/pages/wishlist/` |
