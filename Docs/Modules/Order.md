# Order Module

## Purpose
Handles the checkout process and order lifecycle management.

## Scope
- Client: Cart to order conversion, order history, VNPAY/ZaloPay payment integration, auto email confirmation.
- Admin: Order tracking, status updates (Pending -> Confirmed -> Shipping -> Delivered), cancellations.

## Business Logic
- **Snapshots:** Orders store a snapshot of product details (price, title) at the time of purchase to ensure historical accuracy if the product is later updated or deleted.
- **Stock Validation:** Before creating an order, the system must verify that the requested quantities are available in stock.
- **Payment:** Supports Cash on Delivery (COD) and online payment via VNPAY or ZaloPay Sandbox.
- **Email Confirmation:** An automatic confirmation email containing order details is sent to the customer upon successful checkout or payment gateway callback.

## Business Rules
- Orders cannot be modified by the client once they are in "Shipping" status.
- Admin must provide a reason or note for "Cancelled" status (optional but recommended).

## Data Model
See `DATABASE_SCHEMA.md` for the `Orders` collection details.

## Dependencies
- `Product` module (for snapshots and stock updates).
- `User` module (for customer association).
- `VNPAY` helper.

## Error Cases
- **Insufficient Stock:** Order placement fails if stock < requested quantity.
- **Payment Gateway Failure:** If VNPAY fails, order status remains "unpaid".

## Security Rules
- Clients can only view their own orders.
- Admins require `orders_view` and `orders_edit` permissions.
