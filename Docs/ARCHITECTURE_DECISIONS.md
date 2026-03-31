# Architecture Decisions - Product Management System

## ADR 001: Service Layer Implementation
- **Context:** Early codebase mixed database queries directly in controllers.
- **Decision:** Extract all database interactions and business logic into a dedicated `services/` directory.
- **Reason:** Promotes reusability between Admin/Client controllers and improves unit testability.
- **Trade-offs:** Slightly more boilerplate for simple CRUD operations.

## ADR 002: Server-Side Rendering (SSR) with Pug
- **Context:** Project requires SEO-friendly pages and fast initial load for the storefront.
- **Decision:** Use Pug as the primary view engine.
- **Reason:** Familiarity for the team, excellent integration with Express, and no need for complex SPA state management for the initial phase.
- **Trade-offs:** Heavier server load compared to a static site; less interactive than a frontend framework like React (mitigated by custom JS in `public/js`).

## ADR 003: Soft Deletes
- **Context:** Accidental deletion of products or orders could lead to data loss and broken relationships.
- **Decision:** Use a `deleted: Boolean` flag and `deletedAt: Date` field for major entities.
- **Reason:** Allows for data recovery and maintains historical integrity for orders.
- **Trade-offs:** Requires filtering `{ deleted: false }` in all query services.

## ADR 004: Cloudinary for Asset Management
- **Context:** Hosting images locally on the server consumes storage and bandwidth.
- **Decision:** Use Cloudinary via `multer-storage-cloudinary`.
- **Reason:** Offloads asset delivery to a CDN, provides automatic image optimization, and simplifies backup.
- **Trade-offs:** Dependency on a third-party service; requires API management.

## ADR 005: Auto-selection of Product Variant
- **Context:** Quick-add buttons on the homepage/listings don't provide a way for users to choose a specific variant (size, color, etc.), leading to validation errors.
- **Decision:** Automatically select the first available variant of a product if none is explicitly provided during the "Add to Cart" operation.
- **Reason:** Simplifies the user journey for quick purchases and prevents technical errors in non-detailed views.
- **Trade-offs:** Users might inadvertently add the wrong variant; however, this is mitigated by allowing them to change the variant in the cart later (future scope).

