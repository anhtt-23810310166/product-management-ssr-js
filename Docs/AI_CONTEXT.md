# AI Context - Product Management System

## Overview
This is a Node.js-based e-commerce platform featuring a robust administration dashboard and a customer-facing storefront. The system supports product management, multi-level categories, order processing, real-time chat, and user authentication.

## Tech Stack
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (via Mongoose)
- **View Engine:** Pug (Server-side rendering)
- **Real-time:** Socket.io
- **Auth:** Passport.js (Local, Google, Facebook), JWT, BcryptJS
- **Storage:** Cloudinary (via Multer)
- **Mailing:** Nodemailer
- **Validation:** Joi

## Entry Point
- `index.js`: Main application entry point where middleware, routes, and database connections are initialized.

## Folder Structure
- `admin/`: Admin-specific logic (Routes, Controllers, Middlewares, Views).
- `client/`: Customer-facing logic (Routes, Controllers, Middlewares, Views).
- `models/`: Mongoose schemas.
- `services/`: Core business logic (Single Source of Truth for logic).
- `helpers/`: Utility functions (pagination, upload, search, etc.).
- `config/`: Configuration files (database, system, cloudinary).
- `public/`: Static assets (CSS, JS, images).
- `views/`: Pug templates.

## Request Flow
1. **Route:** Intercepts incoming requests.
2. **Middleware:** Performs validation, authentication, and authorization.
3. **Controller:** Extracts data from the request.
4. **Service:** Executes business logic (interacts with models).
5. **Model:** Communicates with MongoDB.
6. **View:** Pug template is rendered with the data and returned to the client.

## Rules for AI
- **MUST** read `AI_CONTEXT.md` and `MODULE_MAP.md` before making any changes.
- **MUST** prioritize existing patterns and architectural decisions.
- **DO NOT** add new libraries unless explicitly requested.
- **DO NOT** refactor large sections of the codebase.
- **DO NOT** commit secrets or hardcoded credentials.
- **ALWAYS** update documentation when business logic or structure changes.
- **FOLLOW** the specific commit message format defined in the project instructions.
