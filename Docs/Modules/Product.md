# Product Module

## Purpose
Manages the core entity of the platform: Products. Handles creation, browsing, stock management, and categorization.

## Scope
- Admin: Full CRUD, inventory updates, featured status toggling, soft delete.
- Client: Catalog browsing, search (including Voice Search), category filtering, detail viewing.

## Business Logic
- **Voice Search:** Integrated using Web Speech API (Chrome/Edge support). Allows users to search for products by voice commands in Vietnamese.
- **Slug Generation:** Automatically generated from the title using `mongoose-slug-updater`. Must be unique.
- **Discount Calculation:** Price displayed to users is `price * (1 - discountPercentage/100)`.
- **Stock Management:** Stock is deducted upon order confirmation (or placement, depending on specific ADR).
- **Featured Products:** Handled via a boolean flag, used to display items on the homepage.

## Business Rules
- A product must belong to at least one category (optional but recommended).
- Titles must be descriptive.
- Soft-deleted products must not appear in client-side search or listings.

## Data Model
See `DATABASE_SCHEMA.md` for the `Products` collection details.

## API / Interfaces (Admin)
- `GET /admin/products`: List all products with filters (status, search).
- `POST /admin/products/create`: Create a new product.
- `PATCH /admin/products/edit/:id`: Update product details.
- `DELETE /admin/products/delete/:id`: Soft delete a product.

## Dependencies
- `ProductCategory` module (for filtering and assignment).
- `Brand` module.
- `Cloudinary` helper (for image uploads).

## Error Cases
- **Duplicate Slug:** Handled by Mongoose unique index.
- **Invalid ID:** Controller should return a 404 if product ID does not exist.
- **Upload Failure:** Gracefully handle Cloudinary connection issues.

## Security Rules
- Only accounts with `products_view` permission can list products.
- Only accounts with `products_edit` permission can modify or delete products.
