# Architecture - Product Management System

## Design Pattern
The project follows a modular **MVC (Model-View-Controller)** pattern with a dedicated **Service Layer** to isolate business logic.

## Layers Description

### 1. Route Layer (`routes/`)
- Entry point for all HTTP requests.
- Maps URL patterns to specific controller methods.
- Applies route-specific middleware (auth, permissions).
- Divided into `admin/` and `client/` namespaces.

### 2. Middleware Layer (`middlewares/`)
- `auth.middleware.js`: Handles session/token verification and RBAC (Role-Based Access Control).
- `validate.middleware.js`: Generic Joi validation wrapper.
- `category.middleware.js`: Injects global category data for navigation menus.
- `cart.middleware.js`: Tracks cart counts for the storefront header.

### 3. Controller Layer (`controllers/`)
- Orchestrates the flow between the request and the service layer.
- Handles UI-specific logic (redirects, flash messages, status codes).
- Does **not** contain complex business logic or direct database queries.

### 4. Service Layer (`services/`)
- Contains the core business logic.
- Directly interacts with models.
- Reusable across different controllers (e.g., admin and client).
- Methods are generally stateless and return data or throw errors.

### 5. Model Layer (`models/`)
- Defines MongoDB schemas using Mongoose.
- Implements plugins like `mongoose-slug-updater`.
- Encapsulates data integrity and validation at the database level.

### 6. View Layer (`views/`)
- Server-side rendered Pug templates.
- Utilizes mixins for reusable UI components (pagination, search, etc.).
- Divided into `admin/` (dashboard) and `client/` (storefront).

## Flow Diagram (Simplified)
`Request -> Router -> [Middleware] -> Controller -> Service -> Model -> Database -> Service -> Controller -> View (Pug) -> Response`
