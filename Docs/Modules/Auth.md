# Auth Module (Admin & Client)

## Purpose
Manages user and admin identity, session management, and access control.

## Scope
- Admin: Local login for staff accounts.
- Client: Local login, Google/Facebook OAuth registration, password recovery.

## Business Logic
- **Hashing:** All local passwords are hashed using `bcryptjs`.
- **RBAC:** Admin permissions are governed by roles. Each role has an array of strings representing permissions.
- **Session:** Uses `cookie-session` for persistence.

## Business Rules
- Admin accounts must be created by another admin (no public registration).
- Clients must verify their email (if implemented) or use OAuth for trust.

## Dependencies
- `Account` Model (Admin).
- `User` Model (Client).
- `Passport.js` (OAuth strategies).

## Security Rules
- Password resets must use time-limited tokens.
- Sessions should have a maximum age (e.g., 24 hours).
- Passwords are never returned in API responses or logs.
