# Database Schema - Product Management System

## Core Collections

### `Products`
- `title` (String): Product name.
- `slug` (String): URL-friendly identifier.
- `product_category_id` (String): Reference to category.
- `brand_id` (String): Reference to brand.
- `price` (Number): Base price.
- `discountPercentage` (Number): Current discount.
- `stock` (Number): Inventory count.
- `thumbnail` (String): Primary image URL.
- `images` (Array): Supplementary image URLs.
- `variants` (Array): Nested objects (sku, price, stock).
- `featured` (Boolean): Highlight on home page.
- `status` (String): `active`, `inactive`.
- `deleted` (Boolean): Soft delete flag.

### `ProductCategories`
- `title` (String): Category name.
- `parent_id` (String): Reference for hierarchy (Tree structure).
- `slug` (String): URL-friendly identifier.
- `description` (String): Markdown/HTML description.
- `thumbnail` (String): Image URL.

### `Orders`
- `userId` (String): Reference to customer (optional for guests).
- `customerName` (String): Full name.
- `customerPhone` (String): Contact number.
- `customerAddress` (String): Shipping destination.
- `items` (Array): Snapshots of products (price, quantity, variant).
- `totalAmount` (Number): Grand total.
- `status` (Enum): `pending`, `confirmed`, `shipping`, `delivered`, `cancelled`.
- `paymentMethod` (Enum): `cod`, `vnpay`.

### `Accounts` (Admin)
- `fullName` (String): Admin name.
- `email` (String): Login identifier.
- `password` (String): Hashed password.
- `role_id` (String): Reference to permissions.
- `status` (String): `active`, `inactive`.

### `Users` (Client)
- `fullName` (String): Customer name.
- `email` (String): Login identifier.
- `password` (String): Hashed password (or empty for OAuth).
- `tokenUser` (String): Session/Verification token.
- `status` (String): `active`, `inactive`.
- `statusOnline` (Boolean): Real-time online status.

### `ActivityLogs`
- `accountId` (String): Performer ID.
- `action` (String): Action type (`create`, `edit`, ...).
- `module` (String): Affected module.
- `description` (String): Context.
- `ip` (String): Source IP.

### `Reviews`
- `productId` (String): Product reference.
- `userId` (String): Customer reference.
- `rating` (Number): 1-5 score.
- `comment` (String): Text review.
- `replies` (Array): Admin responses.

## Relationships
- **Product -> Product Category:** Many-to-one.
- **Product -> Brand:** Many-to-one.
- **Account -> Role:** Many-to-one.
- **Order -> User:** Many-to-one (optional).
- **Product Category -> Product Category:** Recursive parent-child relationship for tree structure.
