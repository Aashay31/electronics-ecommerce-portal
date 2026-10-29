# ElectroMart Technical Documentation & Interview Preparation Manual

This document serves as a comprehensive, production-grade guide for understanding, explaining, and defending the design and implementation of the **ElectroMart Electronics E-Commerce Portal** in software engineering interviews.

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [High-Level Architecture](#2-high-level-architecture)
3. [Folder Structure](#3-folder-structure)
4. [Feature-by-Feature Breakdown](#4-feature-by-feature-breakdown)
5. [Backend Deep Dive](#5-backend-deep-dive)
6. [Frontend Deep Dive](#6-frontend-deep-dive)
7. [Database Design](#7-database-design)
8. [Complete API Documentation](#8-complete-api-documentation)
9. [Authentication & Session Flow](#9-authentication--session-flow)
10. [External Services](#10-external-services)
11. [Design Decisions](#11-design-decisions)
12. [Security Profile](#12-security-profile)
13. [Performance Optimizations](#13-performance-optimizations)
14. [Deployment Architecture](#14-deployment-architecture)
15. [Error Handling Strategy](#15-error-handling-strategy)
16. [Complete Project End-to-End Flow](#16-complete-project-end-to-end-flow)
17. [Most Complex Technical Challenges](#17-most-complex-technical-challenges)
18. [Future Professional Improvements](#18-future-professional-improvements)
19. [100 Technical Interview Questions & Answers](#19-100-technical-interview-questions--answers)
20. [HR Interview Questions & Answers](#20-hr-interview-questions--answers)
21. [Viva / System Design Presentation Guide](#21-viva--system-design-presentation-guide)
22. [Code Execution Walkthroughs](#22-code-execution-walkthroughs)
23. [Learning & Revision Summary](#23-learning--revision-summary)

---

# 1. Project Overview

### Purpose of the Project
ElectroMart is an advanced, responsive, full-featured MERN-stack electronics e-commerce platform. It provides a seamless interface for browsing, purchasing, and managing electronic components (such as microcontrollers, sensors, IoT devices, and robotics kits) alongside real-time support powered by a generative AI assistant (Groq Llama 3) and an administration dashboard for platform control.

### Problem it Solves
1. **Component Sourcing Barriers**: Provides hardware developers and electronics enthusiasts with a clean catalog containing real-time stock status and direct component details.
2. **Support Delays**: Eliminates traditional wait times for customer support by integrating a real-time AI assistant capable of tracking orders, validating cancellation eligibility, executing cancellations, and offering technical product guidance.
3. **Inventory Management Gaps**: Empowers business admins with automated inventory scans, daily health summaries, low-stock alerts, role management, and direct analytics tracking.
4. **Uncertain Payment Operations**: Minimizes incomplete payment exceptions through dual-phase checkout flow: temporary checkout validation vs. signature-verified Razorpay ledger entries.

### Target Users
- **Electronics Enthusiasts & Students**: Searching for sensors, microcontrollers (ESP32, Arduino, Raspberry Pi), and learning kits.
- **Hardware Engineers**: Sourcing prototyping parts with strict parameters.
- **Store Managers/Administrators**: Managing inventory stock, reviewing users, managing delivery states, and analyzing sales trends.

### Main Features
- **Secure Dual-Mechanism Authentication**: Log in via Email or Phone with bcrypt password hashing and 7-day persistent JSON Web Tokens (JWT) stored in HTTPOnly cookies or local headers.
- **Dynamic Catalog with Faceted Filters**: Real-time category aggregation counts, price range filtering, stock state filtering, sorting, and wildcard keyword searches.
- **Two-Tier Shopping Cart**: Stores items persistently in the user's database document with client-side context sync and real-time stock-ceiling verification.
- **Double-Locked Payment Gateways**: Cash on Delivery (COD) instant processing vs. Razorpay secure checkout with webhook fallback and SHA256 HMAC signature verification.
- **AI Support Bot (Groq SDK)**: State-aware conversational model featuring automatic intent detection, multi-field product search, side-by-side spec comparison tables, real-time order status tracking, and direct cancel validation.
- **Admin Management Suite**: Full control panel showing real-time statistics (total users, products, sales, inventory health index), product CRUD with local image uploads (Multer), user role toggles, banning mechanics, order updates, and review censorship.
- **Socket.io Real-Time Synchronization**: Live stock change broadcasts, live dashboard admin updates, and real-time user-specific order confirmation push events.
- **Redis Performance Caching**: Multi-namespace caching (5-minute lists, 10-minute details, 15-minute AI chat results) with smart invalidation upon database writes.
- **Email Notification Dispatch**: HTML template emails sent via Nodemailer SMTP for registration, order creation, order status updates, and secure password reset links.

### Tech Stack
- **Frontend**: React 19.2.6 (Vite 8.0.12), React Router DOM v7, Tailwind CSS, Axios, Lucide Icons, React Hot Toast, Socket.io Client.
- **Backend**: Node.js, Express.js 5.2.1, Socket.io, node-cron.
- **Database & Cache**: MongoDB (Mongoose 9.6.2), Redis (ioredis 5.11.1).
- **Security Utilities**: Helmet, express-rate-limit, express-mongo-sanitize, xss-clean, bcrypt, jsonwebtoken.
- **APIs & Services**: Razorpay Payment Gateway SDK, Groq Cloud API SDK, SMTP Transporter (Nodemailer).

---

# 2. High-Level Architecture

ElectroMart is built on a decoupled client-server architecture with an integrated persistent caching layer (Redis), real-time duplex networking (Socket.io), and message/payment gateways.

### System Topography

```
               +--------------------------------------------------------+
               |                  React Web Frontend                     |
               |     (State, Contexts, Hooks, Protected routes, UI)      |
               +---------------------------+----------------------------+
                                           | HTTP Requests & WebSockets
                                           v
+---------------------------------------------------------------------------------------+
| Express Backend Gateway                                                               |
|                                                                                       |
|  [Security Middlewares]                                                               |
|     CORS, Helmet, Rate Limiters, XSS Clean, Mongo Sanitize, Cookie Parser             |
|                                                                                       |
|  [Auth Middleware]                                                                    |
|     Extract JWT from Header/Cookie -> Verify -> Inject user context (req.user)        |
|                                                                                       |
|  [Routers & Controllers]                                                              |
|     Auth, Products, Cart, Orders, Payments, Users, Assistant, Admin                   |
+------------------------------------------+--------------------------------------------+
                                           |
                +--------------------------+--------------------------+
                | In-Memory Cache Lookup                              | Mongoose ORM
                v                                                     v
   +-------------------------+                           +-------------------------+
   |      Redis Database     |                           |    MongoDB Database     |
   |                         |                           |                         |
   | - products:list:* (5m)  |                           | - User document         |
   | - products:detail:* (10)|                           | - Product document      |
   | - chat:query (15m)      |                           | - Order document        |
   | - homepage:featured (5m)|                           | - PaymentAttempt doc    |
   |                         |                           | - ChatSession document  |
   +-------------------------+                           +-------------------------+
                ^                                                     ^
                | Invalidation writes                                 | Transactions
                +--------------------------+--------------------------+
                                           |
                                           +--------------------------+
                                           | SDK Requests             | SMTP
                                           v                          v
                              +-------------------------+  +-------------------------+
                              |        Groq SDK         |  |       Nodemailer        |
                              |   (Llama-3.3 LLM)       |  |     SMTP Mail Server    |
                              +-------------------------+  +-------------------------+
                                           |                          ^
                                           | Payment verification     | Order receipt
                                           v                          |
                              +---------------------------------------+--------------+
                              |                  Razorpay API Gateway                |
                              +------------------------------------------------------+
```

### High-Level Request Pipeline (Sequence)

```
[React Client]         [Express Server]         [Redis Cache]         [MongoDB]         [Socket.io Hub]
      |                       |                       |                   |                    |
      |--- GET /products ---->|                       |                   |                    |
      |                       |----- getCache() ----->|                   |                    |
      |                       |<---- Return Cache ----|                   |                    |
      |                       |                       |                   |                    |
      |                       | [If Cache Miss]       |                   |                    |
      |                       |------------------------------------------>|                    |
      |                       |<------------------------------------------|                    |
      |                       |----- setCache() ----->|                   |                    |
      |<-- Respond 200 OK ----|                       |                   |                    |
      |                       |                       |                   |                    |
      |                       |                       |                   |                    |
      |--- POST /orders (COD)-|                       |                   |                    |
      |    (Body: items)      |-- Verify DB stock & pricing ------------->|                    |
      |                       |<-- Stock Validated -----------------------|                    |
      |                       |-- Create Order -------------------------->|                    |
      |                       |-- Decrement stock ----------------------->|                    |
      |                       |                       |                   |                    |
      |                       |-- deleteCachePattern("products:list:*") ->|                    |
      |                       |-- deleteCache("products:detail:*") ------>|                    |
      |                       |                       |                   |                    |
      |                       |--- Broadcast stock updates ----------------------------------->|
      |                       |--- Emit admin:statsUpdated ----------------------------------->|
      |<-- Respond 201 OK ----|                                                                |
```

---

# 3. Folder Structure

```
electronics-ecommerce-portal/
├── backend/                            # Server codebase
│   ├── config/                         # Configuration layer
│   │   ├── database.js                 # MongoDB connection logic (mongoose.connect)
│   │   └── redis.js                    # Redis client initialization (ioredis connection)
│   ├── controllers/                    # Business controllers (receives req, returns res)
│   │   ├── adminController.js          # Admin dashboard analytics & role control CRUD
│   │   ├── assistantController.js      # AI chatbot interaction and session management
│   │   ├── authController.js           # Signup, login, password recovery logic
│   │   ├── cartController.js           # Add, remove, update shopping cart items
│   │   ├── orderController.js          # COD order placement, user tracking, cancellations
│   │   ├── paymentController.js        # Razorpay creation, signature verification, webhook
│   │   ├── productController.js        # Public product queries, reviews, cache settings
│   │   └── userController.js           # Addresses and profiles operations
│   ├── cron/                           # Scheduled tasks
│   │   ├── cronScheduler.js            # Node-cron orchestrator
│   │   └── inventoryCron.js            # Daily health check & low stock scanner execution
│   ├── middleware/                     # Express middleware chains
│   │   ├── adminMiddleware.js          # Intercepts requests to check admin roles
│   │   ├── authMiddleware.js           # Parses & validates JWT headers/cookies
│   │   ├── optionalAuth.js             # Decodes token if present without blocking guests
│   │   ├── upload.js                   # Multer engine setup for static image files
│   │   └── validationMiddleware.js     # Validates payload parameters limits (character lengths)
│   ├── models/                         # Mongoose schemas & indexes definition
│   │   ├── ChatSession.js              # AI conversation state and snapshots history
│   │   ├── Order.js                    # Order transaction records and tracking
│   │   ├── PaymentAttempt.js           # Pre-verify ledger for online checkouts
│   │   ├── Product.js                  # Product catalog, stock logs, nested reviews
│   │   └── User.js                     # Profiles, addresses, and wishlist lists
│   ├── routes/                         # Route endpoints declarations
│   │   ├── adminRoutes.js              # Admin features endpoints
│   │   ├── assistantRoutes.js          # AI bot endpoints
│   │   ├── authRoutes.js               # Registration & entry endpoints
│   │   ├── cartRoutes.js               # Cart operations endpoints
│   │   ├── orderRoutes.js              # Order operations endpoints
│   │   ├── paymentRoutes.js            # Webhooks and checkout verification endpoints
│   │   ├── productRoutes.js            # Public catalog and review endpoints
│   │   └── userRoutes.js               # Profile and address endpoints
│   ├── services/                       # Standalone service layer (independent logic)
│   │   ├── assistantService.js         # Core Groq model prompt builder and intent parser
│   │   ├── orderCancellationService.js # Cancellation business rule and stock restorer
│   │   ├── orderSupportService.js      # Formatter utilities and snapshot converters
│   │   └── inventoryMonitorService.js  # Low stock scanners and health computation logic
│   ├── templates/                      # Nodemailer HTML template scripts
│   │   ├── dailySummaryTemplate.js     # Admin daily health summary report
│   │   ├── lowStockTemplate.js         # Low stock warning report
│   │   ├── orderTemplate.js            # Order placed verification invoice
│   │   ├── resetPasswordTemplate.js    # Hashed reset token token delivery
│   │   ├── statusTemplate.js           # Order status transitions warnings
│   │   └── welcomeTemplate.js          # Welcome greetings email
│   ├── uploads/                        # Destination folder for uploaded images
│   ├── utils/                          # Low-level utilities
│   │   ├── cache.js                    # Redis wrappers (get, set, delete, pattern matches)
│   │   ├── jwt.js                      # Sign JWTs with a 7d expiration config
│   │   ├── sendEmail.js                # Nodemailer SMTP transporter helper
│   │   ├── imageUrl.js                 # Local file paths resolution
│   │   └── emitDashboardStats.js       # Admin updates socket emitter
│   ├── server.js                       # Express configuration, app init, socket attachments
│   └── makeAdmin.js                    # CLI admin generator script
│
└── frontend/                           # React client codebase
    ├── src/                            # App sources
    │   ├── admin/                      # Admin routes layouts and pages
    │   │   ├── components/             # AdminNavbar, AdminSidebar, AdminLayout, ConfirmModal
    │   │   └── pages/                  # Dashboard, Orders, Products, Users, Reviews
    │   ├── components/                 # Public layouts and cards
    │   │   ├── CategoryCard.jsx        # Navigation cards
    │   │   ├── FilterSidebar.jsx       # Shop filters
    │   │   ├── Footer.jsx              # Footer component
    │   │   ├── GuestRoute.jsx          # Protects Login/Register
    │   │   ├── Navbar.jsx              # Core dynamic header
    │   │   ├── ProductCard.jsx         # Unified grid cards
    │   │   ├── ProductGrid.jsx         # Grids layout
    │   │   ├── ProtectedRoute.jsx      # Protects User Pages
    │   │   ├── SearchBar.jsx           # Global context input
    │   │   └── SortDropdown.jsx        # Grid order controls
    │   ├── context/                    # Context Providers (Global State)
    │   │   ├── AuthContext.jsx         # Session persistence and request wraps
    │   │   ├── CartContext.jsx         # Add, remove, update shopping quantities
    │   │   ├── ProfileContext.jsx      # Address states and user configurations
    │   │   ├── SearchContext.jsx       # Shop routing query variables
    │   │   └── ThemeContext.jsx        # Dark/Light system config
    │   ├── pages/                      # Page components
    │   │   ├── Addresses.jsx           # Address list configurations
    │   │   ├── Cart.jsx                # Cart checkout lists
    │   │   ├── Checkout.jsx            # Razorpay / COD triggers
    │   │   ├── EditProfile.jsx         # Edit parameters
    │   │   ├── ForgotPassword.jsx      # Token request trigger form
    │   │   ├── ResetPassword.jsx       # Token entry form
    │   │   ├── Home.jsx                # Highlights and sliders landing
    │   │   ├── Landing.jsx             # Public welcome page
    │   │   ├── OrderDetails.jsx        # Estimated timelines and cancellation buttons
    │   │   ├── Orders.jsx              # Order lists history
    │   │   ├── OrderSuccess.jsx        # Checkout receipt landing
    │   │   ├── PaymentFailure.jsx      # payment failure warnings
    │   │   ├── ProductDetails.jsx      # Reviews and descriptions details
    │   │   ├── Profile.jsx             # Dashboard overview
    │   │   ├── Shop.jsx                # Catalog and filter page
    │   │   ├── Signup.jsx              # Signup parameters form
    │   │   ├── Login.jsx               # Authentication form
    │   │   └── Wishlist.jsx            # Saved product indexes
    │   └── utils/                      # Helper files
    │       ├── api.js                  # Axios interceptor instance
    │       └── imageUrl.js             # Resolves images paths
    ├── vite.config.js                  # Vite configuration
    └── package.json                    # Frontend dependency package
```

### Folder Interaction Details
- **Controllers** map incoming routes to database actions. They validate parameters, call **Services** for algorithmic operations (like AI logic or cancellation validation), read/write to **Models**, clear **Cache** namespaces, and send push notifications via **Socket** configurations.
- **Services** are completely decoupled from express HTTP headers. They can be triggered by routes, cron jobs, or tests.
- **Context Providers** on the frontend wrap pages inside `App.jsx`, providing centralized hooks (like `useAuth` and `useCart`) that manage synchronization with local storage and axios networks.

---

# 4. Feature-by-Feature Breakdown

## Feature 1: User Authentication & Role Authorization
- **Purpose**: Restrict access to personalized zones (checkout, cart, profile, wishlist) and verify admin rights for backend CRUD dashboard actions.
- **Flow**: User signs up/logs in -> controller validates credentials -> hashes password (bcrypt) -> generates JWT -> sets token cookie and JSON response -> client stores auth state in local context and header configurations.
- **Files Involved**:
  - Backend: [authRoutes.js](file:///e:/SIQOL%20Internship%202026/electronics-ecommerce-portal/backend/routes/authRoutes.js), [authController.js](file:///e:/SIQOL%20Internship%202026/electronics-ecommerce-portal/backend/controllers/authController.js), [authMiddleware.js](file:///e:/SIQOL%20Internship%202026/electronics-ecommerce-portal/backend/middleware/authMiddleware.js), [adminMiddleware.js](file:///e:/SIQOL%20Internship%202026/electronics-ecommerce-portal/backend/middleware/adminMiddleware.js), [User.js](file:///e:/SIQOL%20Internship%202026/electronics-ecommerce-portal/backend/models/User.js).
  - Frontend: [AuthContext.jsx](file:///e:/SIQOL%20Internship%202026/electronics-ecommerce-portal/frontend/src/context/AuthContext.jsx), [Login.jsx](file:///e:/SIQOL%20Internship%202026/electronics-ecommerce-portal/frontend/src/pages/Login.jsx), [Signup.jsx](file:///e:/SIQOL%20Internship%202026/electronics-ecommerce-portal/frontend/src/pages/Signup.jsx), [ProtectedRoute.jsx](file:///e:/SIQOL%20Internship%202026/electronics-ecommerce-portal/frontend/src/components/ProtectedRoute.jsx), [AdminProtectedRoute.jsx](file:///e:/SIQOL%20Internship%202026/electronics-ecommerce-portal/frontend/src/admin/components/AdminProtectedRoute.jsx).
- **API Endpoints**:
  - `POST /api/auth/signup`
  - `POST /api/auth/login`
- **Database Collections**: `users`
- **Validation**: Payload checks require all inputs (name, email, phone, password, address sub-elements). Matches regex validations. Banned flag validation prevents entry.
- **Error Handling**: Missing inputs reject with a `400 Bad Request`. Email/Phone collisions return a `400 Bad Request`. Mismatched passwords return a `401 Unauthorized`. Suspended entries return a `403 Forbidden` for banned users.
- **Security Considerations**: Cookie configs enforce `httpOnly` flags, `secure` flags (production-only), and `sameSite: "strict"` tags. Password records are excluded from default queries via `select: false` model configurations.
- **Possible Improvements**: Implement standard OAuth2 (Google/GitHub) and short-lived access tokens paired with rotation refresh tokens.
- **Common Bugs**: Expired token cookies cause silent network failures; requires clean route redirections on client interceptors.
- **Interview Question**: *How do you prevent database queries from returning users' hashed passwords in user listings?*
- **Expected Answer**: Set `select: false` on the password field of the Mongoose schema. In endpoints requiring validation (like login), explicitly select it by appending `.select("+password")` to the query chain.
- **Real-World Explanation**: Like showing passport IDs at checking points; validation checks the credentials once and returns a temporary badge (JWT) for subsequent visits.
- **Tradeoffs**: Storing tokens in cookies prevents XSS reading, but requires CORS/CSRF headers mitigation; local storage is vulnerable to XSS but simplifies deployment configurations across domains.

## Feature 2: Product Catalog & Review Engine
- **Purpose**: Browse electronic items, select categories, sort by metrics, write reviews, check purchases verification status, and manage helpful counts.
- **Flow**: User queries shop endpoint -> controller checks Redis cache -> returns data if cached -> falls back to MongoDB -> aggregates category counts. Verified users write reviews -> system performs stock check -> writes review details -> syncs average ratings.
- **Files Involved**:
  - Backend: [productRoutes.js](file:///e:/SIQOL%20Internship%202026/electronics-ecommerce-portal/backend/routes/productRoutes.js), [productController.js](file:///e:/SIQOL%20Internship%202026/electronics-ecommerce-portal/backend/controllers/productController.js), [Product.js](file:///e:/SIQOL%20Internship%202026/electronics-ecommerce-portal/backend/models/Product.js), [cache.js](file:///e:/SIQOL%20Internship%202026/electronics-ecommerce-portal/backend/utils/cache.js).
  - Frontend: [Shop.jsx](file:///e:/SIQOL%20Internship%202026/electronics-ecommerce-portal/frontend/src/pages/Shop.jsx), [ProductDetails.jsx](file:///e:/SIQOL%20Internship%202026/electronics-ecommerce-portal/frontend/src/pages/ProductDetails.jsx), [FilterSidebar.jsx](file:///e:/SIQOL%20Internship%202026/electronics-ecommerce-portal/frontend/src/components/FilterSidebar.jsx).
- **API Endpoints**:
  - `GET /api/products` (Filters: search, category, pricing boundaries, stock, sorting, pagination)
  - `GET /api/products/:id` (Detail lookup)
  - `POST /api/products/:id/reviews` (Submit reviews)
  - `PUT /api/products/:id/reviews/:reviewId` (Edit review content)
  - `DELETE /api/products/:id/reviews/:reviewId` (Delete review)
  - `POST /api/products/:id/reviews/:reviewId/helpful` (Increment/Decrement helpful index)
- **Database Collections**: `products`, `orders` (verified check lookup)
- **Validation**: Review rating values must fall between 1 and 5. Comment and title field validations require non-empty text strings with maximum length validation constraints.
- **Error Handling**: Invalid ratings return `400 Bad Request`. Duplicate user reviews return a `400 Bad Request` constraint warning. Unfound products yield a `404 Not Found` response.
- **Security Considerations**: express-mongo-sanitize filters search query elements, preventing NoSQL injections inside input search regex.
- **Possible Improvements**: Implement fuzzy search capabilities via MongoDB Atlas Search indexes (instead of JavaScript regular expressions).
- **Common Bugs**: Race conditions during concurrent review insertions can miscalculate average rating sums.
- **Interview Question**: *How do you verify if a user has actually purchased a product before allowing them to post a "verified" review?*
- **Expected Answer**: Execute a fast `.exists()` query checking the `orders` collection for the active `userId`, matching the target `productId`, and ensuring the order status is not `Cancelled`.
- **Real-World Explanation**: Reviews mimic store guestbooks, but verify buyer receipts to confirm authentic purchase feedback.
- **Tradeoffs**: Embedding reviews directly inside the product document speeds up read times, but risks exceeding the 16MB document limit of MongoDB if a product amasses thousands of entries.

## Feature 3: Shopping Cart Architecture
- **Purpose**: Manage selected items and verify real-time stock limits before placing orders.
- **Flow**: User clicks "Add to Cart" -> API verifies product availability -> adds reference key and quantity to `cartItems` database array. Updates recalculate totals and verify quantity thresholds.
- **Files Involved**:
  - Backend: [cartRoutes.js](file:///e:/SIQOL%20Internship%202026/electronics-ecommerce-portal/backend/routes/cartRoutes.js), [cartController.js](file:///e:/SIQOL%20Internship%202026/electronics-ecommerce-portal/backend/controllers/cartController.js).
  - Frontend: [CartContext.jsx](file:///e:/SIQOL%20Internship%202026/electronics-ecommerce-portal/frontend/src/context/CartContext.jsx), [Cart.jsx](file:///e:/SIQOL%20Internship%202026/electronics-ecommerce-portal/frontend/src/pages/Cart.jsx).
- **API Endpoints**:
  - `GET /api/cart`
  - `POST /api/cart/add`
  - `PUT /api/cart/:productId`
  - `DELETE /api/cart/:productId`
- **Database Collections**: `users`, `products`
- **Validation**: Verification ensures added quantities do not exceed stock levels. Quantities must exceed 0.
- **Error Handling**: Stock overflow requests return a `400 Bad Request`. Missing identifiers return a `404 Not Found`.
- **Security Considerations**: Operations rely on the user ID decoded from the authenticated JWT session, preventing unauthorized users from accessing or modifying another customer's cart.
- **Possible Improvements**: Implement session-based guest carts in local storage that merge with the user's database cart upon login.
- **Common Bugs**: If stock decreases elsewhere while a user is editing their cart, stale quantities can bypass client-side checks, requiring final validation during checkout.
- **Interview Question**: *Why do we validate stock at the Cart controller level when the checkout endpoint does it again anyway?*
- **Expected Answer**: Early validation improves the user experience by immediately warning users of stock issues, reducing checkout failures and optimizing server resources.
- **Real-World Explanation**: Like physical shopping carts; the system checks the shelf stock before letting you place an item in your cart, then re-verifies it at the cash register.
- **Tradeoffs**: Storing cart states in the database ensures synchronization across devices, but increases database read and write traffic.

## Feature 4: Order Creation & Payment Gateways (COD & Razorpay)
- **Purpose**: Process payments securely and create transaction records while preventing total amount tampering.
- **Flow**: COD: Order created -> stock decremented -> cart cleared. Razorpay: Create order API initiates gateway -> checkout verifies signature -> webhook verifies status -> stock decremented.
- **Files Involved**:
  - Backend: [orderRoutes.js](file:///e:/SIQOL%20Internship%202026/electronics-ecommerce-portal/backend/routes/orderRoutes.js), [orderController.js](file:///e:/SIQOL%20Internship%202026/electronics-ecommerce-portal/backend/controllers/orderController.js), [paymentRoutes.js](file:///e:/SIQOL%20Internship%202026/electronics-ecommerce-portal/backend/routes/paymentRoutes.js), [paymentController.js](file:///e:/SIQOL%20Internship%202026/electronics-ecommerce-portal/backend/controllers/paymentController.js), [PaymentAttempt.js](file:///e:/SIQOL%20Internship%202026/electronics-ecommerce-portal/backend/models/PaymentAttempt.js), [Order.js](file:///e:/SIQOL%20Internship%202026/electronics-ecommerce-portal/backend/models/Order.js).
  - Frontend: [Checkout.jsx](file:///e:/SIQOL%20Internship%202026/electronics-ecommerce-portal/frontend/src/pages/Checkout.jsx), [OrderSuccess.jsx](file:///e:/SIQOL%20Internship%202026/electronics-ecommerce-portal/frontend/src/pages/OrderSuccess.jsx).
- **API Endpoints**:
  - `POST /api/orders` (COD order placement)
  - `POST /api/payment/create-order` (Razorpay order checkout init)
  - `POST /api/payment/verify-payment` (Signature validation)
  - `POST /api/payment/webhook` (Gateway status listener)
- **Database Collections**: `orders`, `paymentattempts`, `products`, `users`
- **Validation**: Backend recalculates line items and shipping taxes, comparing totals to prevent price manipulation. Signature verification parses payloads using SHA256 HMAC tokens.
- **Error Handling**: Amount discrepancies trigger a `400 Bad Request`. Out-of-stock items reject order creation. Signature mismatches return a `400 Bad Request`.
- **Security Considerations**: Webhook endpoints use `express.raw` parsers to preserve the original request string, ensuring exact signature matches.
- **Possible Improvements**: Implement database transactions (Mongoose sessions) to ensure order creation, stock decrement, and cart clearing succeed or fail together.
- **Common Bugs**: Network drops during payment redirects can delay order creation; solved by using background webhook captures.
- **Interview Question**: *How does the webhook handler verify that payment events actually originated from Razorpay?*
- **Expected Answer**: Generate a SHA256 HMAC using the raw request body and the local webhook secret, then compare it to the signature in the `x-razorpay-signature` header.
- **Real-World Explanation**: Like cash register verifications; checkouts are locked until the cashier verifies the signed receipt matches the purchase details.
- **Tradeoffs**: COD orders are processed immediately, whereas online checkouts require two steps to prevent unpaid orders from consuming inventory stock.

## Feature 5: State-Aware AI Chatbot Assistant
- **Purpose**: Provide real-time product support, compare specifications, track delivery timelines, and process cancellations.
- **Flow**: User sends message -> system detects intent -> fetches database context (user profile, recent orders, catalog) -> builds LLM system prompts -> returns structured response with quick actions.
- **Files Involved**:
  - Backend: [assistantRoutes.js](file:///e:/SIQOL%20Internship%202026/electronics-ecommerce-portal/backend/routes/assistantRoutes.js), [assistantController.js](file:///e:/SIQOL%20Internship%202026/electronics-ecommerce-portal/backend/controllers/assistantController.js), [assistantService.js](file:///e:/SIQOL%20Internship%202026/electronics-ecommerce-portal/backend/services/assistantService.js), [orderSupportService.js](file:///e:/SIQOL%20Internship%202026/electronics-ecommerce-portal/backend/services/orderSupportService.js).
  - Frontend: [ChatWidget.jsx](file:///e:/SIQOL%20Internship%202026/electronics-ecommerce-portal/frontend/src/assistant/ChatWidget.jsx).
- **API Endpoints**:
  - `POST /api/assistant/message`
  - `GET /api/assistant/session`
  - `DELETE /api/assistant/session`
  - `POST /api/assistant/orders/:orderId/cancel`
- **Database Collections**: `chatsessions`, `products`, `orders`, `users`
- **Validation**: Limits user inputs to 500 characters. Cancellation requests are checked against shipping status and payment method rules.
- **Error Handling**: API errors fallback gracefully to deterministic responses (e.g. database-generated summaries) without crashing the chat session.
- **Security Considerations**: The LLM prompt restricts product information to search context items only, preventing the model from inventing non-existent items.
- **Possible Improvements**: Implement Retrieval-Augmented Generation (RAG) using a vector database for product queries.
- **Common Bugs**: Stale session context can cause the chatbot to reference older orders; solved by clearing active contexts when intents change.
- **Interview Question**: *How does the chatbot decide if an order can be cancelled directly during the conversation?*
- **Expected Answer**: It queries the database for the order details and evaluates it against strict business rules: the order must be a COD purchase, and its status must be `Pending` or `Confirmed`. If these criteria are met, the assistant can execute the cancellation and restore stock levels.
- **Real-World Explanation**: Like a helpful store clerk; the assistant checks order records to answer questions or process returns within store policies.
- **Tradeoffs**: Long conversation histories improve contextual accuracy but increase token counts and API latency.

---

# 5. Backend Deep Dive

The Express server handles routing, authentication, business services, and database queries.

```
       [server.js]  <-- Root bootstrap file
            |
      +-----+-----+-----------------------------+
      |           |                             |
[Middlewares]  [cronScheduler]               [socket.js]
      |           | (Node-cron orchestration)   | (Socket.io event loops)
      |           v                             v
      |       [inventoryCron]               [emitDashboardStats]
      |           |                             |
      |           +--------------+--------------+
      |                          |
      v                          v
[Routes] ----------------> [Controllers] -------> [Services]
(Declarations)             (Logic handlers)       (Reusable business logic)
                                 |
                                 v
                              [Models] (Mongoose Schemas & DB operations)
```

### Server Bootstrapping (`server.js`)
Configures middleware chains, connects to MongoDB, starts the cron scheduler, and initializes HTTP and WebSocket servers.

### Core Middlewares
1. **CORS Configuration**: Limits requests to approved origins and local networks, using `credentials: true` to support cookie-based sessions.
2. **Helmet Security Headers**: Dynamically configures HTTP headers to protect against cross-site scripting (XSS) and clickjacking attacks.
3. **NoSQL & XSS Sanitization**: Sanitizes input fields using `xss-clean` and `express-mongo-sanitize` to block script tags and query injection attempts.
4. **Rate Limiting**: Protects endpoints by limiting login/signup attempts to 10 requests per 15 minutes, chat messages to 20 per minute, and general API calls to 200 per 15 minutes.
5. **Auth Middleware**: Extracts tokens from headers or cookies, decodes the payload, and injects the user ID (`req.user`) into the request chain.

### Service Layer Design
Moves business logic out of database controllers into reusable services:
- **`inventoryMonitorService`**: Computes inventory statistics and generates system-wide health ratings.
- **`orderCancellationService`**: Validates cancellation policies, updates order status, restocks inventory, and triggers email notifications.
- **`assistantService`**: Formulates Groq prompts and maps user intents to database actions.

---

# 6. Frontend Deep Dive

The React frontend utilizes a context-driven state architecture to manage dynamic themes, active user sessions, shopping carts, and real-time updates.

```
                    [App.jsx] (Providers wrapper & Route maps)
                        |
      +-----------------+-----------------+
      |                                   |
[State Contexts]                  [Protected Routes]
  - AuthContext                     - ProtectedRoute (Users)
  - CartContext                     - AdminProtectedRoute (Admins)
  - ProfileContext                  - GuestRoute (Redirects logged-in users)
  - SearchContext
  - ThemeContext
                        |
                        v
                 [Pages & Forms] (React hooks, Axios, Forms)
                        |
                        v
                 [ChatWidget / Modals] (Socket events, live stock)
```

### Global Context Providers
- **`AuthContext`**: Manages user login state, token persistence in local storage, and Axios interceptor settings.
- **`CartContext`**: Synchronizes cart state across page transitions, calculates totals, and manages quantity updates.
- **`SearchContext`**: Shares query parameters across landing pages and search components.
- **`ThemeContext`**: Stores and updates dark mode preferences by injecting class parameters.

### Form Validation
Page forms handle user input validation client-side (e.g., checking email formats and character counts) before making API requests, reducing invalid network traffic.

### WebSocket Integration
The client listens for real-time socket events to update the UI dynamically:
- **`product:stockUpdated`**: Updates product card stock levels in real time.
- **`order:created` / `order:cancelled`**: Refreshes order lists and dashboard statistics.
- **`dashboard:statsUpdated`**: Updates admin analytics panels dynamically.

---

# 7. Database Design

```
                     +-----------------------+
                     |         users         |
                     +-----------------------+
                     | _id (ObjectId)        |
                     | fullName (String)     |
                     | email (String) *Index |
                     | phoneNumber (String)  |
                     | password (String)     |
                     | role (Enum)           |
                     | isBanned (Boolean)    |
                     +-----------+-----------+
                                 |
         +-----------------------+-----------------------+
         | 1:N (Embedded)                                | 1:N (Embedded)
         v                                               v
+------------------------+                      +------------------------+
|    savedAddresses      |                      |       cartItems        |
+------------------------+                      +------------------------+
| recipientName (String) |                      | product (ObjectId) ----+--+
| phoneNumber (String)   |                      | quantity (Number)      |  |
| street (String)        |                      +------------------------+  |
| city (String)          |                                                  |
| pincode (String)       |                                                  |
+------------------------+                                                  |
                                                                            |
         +------------------------------------------------------------------+
         |
         v 1:N References
+------------------------+                      +------------------------+
|        products        |                      |         orders         |
+------------------------+                      +------------------------+
| _id (ObjectId)         |                      | _id (ObjectId)         |
| productName (String)   |                      | user (ObjectId) -------> [users]
| category (String)      |                      | totalAmount (Number)   |
| stock (Number)         |                      | orderStatus (Enum)     |
| lowStockThreshold (N)  |                      | paymentStatus (Enum)   |
+-----------+------------+                      +-----------+------------+
            |                                               |
            | 1:N (Embedded)                                | 1:N (Embedded)
            v                                               v
+------------------------+                      +------------------------+
|        reviews         |                      |       orderItems       |
+------------------------+                      +------------------------+
| user (ObjectId) -------> [users]              | product (ObjectId) ----+
| rating (Number)        |                      | quantity (Number)      |
| comment (String)       |                      | price (Number)         |
+------------------------+                      +------------------------+
                                                            ^
                                                            |
                                                            | 1:N References (Optional verification)
                                                            |
                                                +-----------+------------+
                                                |     paymentattempts    |
                                                +------------------------+
                                                | user (ObjectId)        |
                                                | totalAmount (Number)   |
                                                | razorpayOrderId(Str)   |
                                                +------------------------+
```

### Mongoose Collection Configurations

### 1. `users`
- **Purpose**: Stores profiles, credential hashes, default addresses, cart arrays, and wishlist items.
- **Key Indexes**: `email: 1` (unique), `phoneNumber: 1` (unique).
- **Denormalization Decisions**: Storing the active cart array directly inside the user document speeds up cart reads.

### 2. `products`
- **Purpose**: Product details, stock limits, and nested user reviews.
- **Key Indexes**: `category: 1`, `stock: 1`, `averageRating: -1`.
- **Denormalization Decisions**: Embedding reviews in the product document simplifies aggregation and calculates average ratings efficiently.

### 3. `orders`
- **Purpose**: Transaction history, shipment details, and payment statuses.
- **Key Indexes**: `user: 1`, `orderStatus: 1`, `createdAt: -1`.
- **Denormalization Decisions**: Item price snapshots preserve checkout prices, protecting historical order data from future product price changes.

### 4. `chatsessions`
- **Purpose**: Stores conversation histories, active contexts, and intent categories.
- **Key Indexes**: `user: 1` (unique).
- **Denormalization Decisions**: Storing the last detected intent and active order ID within the session context speeds up conversational lookups.

---

# 8. Complete API Documentation

| Module | Method | Endpoint | Auth Required | Payload Structure / Requirements | Typical Responses (JSON shapes) | Codes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Auth** | POST | `/api/auth/signup` | No | `{ fullName, email, phoneNumber, password, address: { street, city, state, pincode, country } }` | `{ success: true, token, user: { _id, fullName, role } }` | 201, 400 |
| **Auth** | POST | `/api/auth/login` | No | `{ email/phoneNumber, password }` | `{ success: true, token, user }` | 200, 401, 403 |
| **Products** | GET | `/api/products` | No | *Query params* | `{ success: true, products: [...], categories: [...], pagination }` | 200, 500 |
| **Products** | GET | `/api/products/:id` | No | *None* | `{ success: true, product }` | 200, 404 |
| **Products** | POST | `/api/products/:id/reviews` | Yes | `{ rating, title, comment }` | `{ success: true, message: "Review added", stats }` | 201, 400 |
| **Cart** | GET | `/api/cart` | Yes | *None* | `{ success: true, cartItems: [...] }` | 200, 401 |
| **Cart** | POST | `/api/cart/add` | Yes | `{ productId, quantity }` | `{ success: true, cartItems }` | 200, 400 |
| **Orders** | POST | `/api/orders` | Yes | `{ items, shippingAddress, paymentMethod, totalAmount }` | `{ success: true, message: "Order placed", order }` | 201, 400 |
| **Orders** | GET | `/api/orders/myorders` | Yes | *None* | `{ success: true, orders }` | 200, 401 |
| **Payment** | POST | `/api/payment/create-order`| Yes | `{ items, shippingAddress, paymentMethod, totalAmount }` | `{ success: true, order_id, amount, key_id }` | 201, 400 |
| **Payment** | POST | `/api/payment/verify-payment`|Yes| `{ razorpay_order_id, razorpay_payment_id, razorpay_signature }` | `{ success: true, order }` | 200, 400 |
| **Payment** | POST | `/api/payment/webhook` | No | *Raw JSON string payload from Razorpay* | `{ success: true }` | 200, 400 |
| **Assistant**| POST | `/api/assistant/message` | Yes | `{ message, quickAction, selectedOrderId }` | `{ success: true, session, message: { role, content } }` | 200, 400 |
| **Admin** | GET | `/api/admin/stats` | Admin | *None* | `{ success: true, stats: { totalRevenue, inventoryHealth... } }` | 200, 403 |

---

# 9. Authentication & Session Flow

The platform implements a JWT-based authentication flow, utilizing signed cookies or authorization headers to secure endpoints.

```
User Registration                      User Login
   [Client]                             [Client]
      |                                    |
      |-- POST /signup (Credentials) ----->|
      |                                    |-- POST /login (Credentials) ------> [Server]
      |                                    |                                        |
      |                                    |<-- Set Cookie "token" + Send JSON -----|
      |<-- Save Auth User info in Context -|
      |
      |
Active Secure Requests
   [Client]                                                        [Server]
      |                                                               |
      |-- GET /api/orders/myorders (Cookie or Auth Header: Bearer) ->|-- Check token in header/cookie
      |                                                              |-- jwt.verify(token, JWT_SECRET)
      |                                                              |-- Inject decoded user id (req.user)
      |<-- Respond 200 OK (Orders JSON) ------------------------------|-- Run controller database query
```

### Flow Breakdown
1. **Credentials Validation**: Validates user login credentials, verifying passwords against stored hashes using `bcrypt.compare()`.
2. **Token Generation**: Generates a JSON Web Token containing the user's ID and role, signed with a 7-day expiration time.
3. **Session Persistence**: Stores the token in HTTPOnly cookies or local storage, attaching it to subsequent Axios request headers automatically.
4. **Endpoint Protection**: Verification middleware checks incoming requests for a valid token; invalid tokens return a `401 Unauthorized` response.
5. **Session Termination**: Clears the authentication token from both the server cookie and client storage upon logout.

---

# 10. External Services

```
                       +-------------------------------+
                       |      ElectroMart App Core     |
                       +---------------+---------------+
                                       |
       +-----------------------+-------+---------------+-----------------------+
       |                       |                       |                       |
       v                       v                       v                       v
+--------------+        +--------------+        +--------------+        +--------------+
|   MongoDB    |        |    Redis     |        |   Groq AI    |        |   Razorpay   |
| (Persistent  |        | (Transient   |        |  (Llama-3.3  |        |  (Prepaid    |
| Document DB) |        | Cache Layer) |        | Assistant API|        | Checkouts)   |
+--------------+        +--------------+        +--------------+        +--------------+
```

1. **MongoDB Atlas**: Manages transactional data (orders, users, products) persistently. Alternate options include PostgreSQL.
2. **Redis (ioredis)**: Caches catalog data and AI conversation history in memory. Alternate options include Memcached.
3. **Groq Cloud API**: Powers the AI chatbot assistant using the Llama 3 model. Alternate options include OpenAI or Anthropic.
4. **Razorpay Gateway**: Handles credit cards, digital wallets, and UPI payments. Alternate options include Stripe or PayPal.
5. **Nodemailer SMTP**: Handles transactional emails (confirmations, welcome messages). Alternate options include SendGrid or AWS SES.

---

# 11. Design Decisions

- **React 19 & Vite**: Selected for optimized compilation speeds, efficient DOM rendering, and faster development cycles.
- **Node.js & Express**: Provides an asynchronous, non-blocking I/O model that handles concurrent socket operations efficiently.
- **MongoDB**: The document schema structure aligns cleanly with dynamic product configurations and embedded cart models.
- **Redis Caching**: Offloads database query traffic, protecting MongoDB from repetitive requests for popular catalog items.
- **Socket.io**: Enables real-time, bidirectional communication, keeping stock counts and dashboard metrics in sync without polling.

---

# 12. Security Profile

- **Rate Limiting**: Protects authentication endpoints from brute-force attacks and safeguards chatbot APIs from resource abuse.
- **NoSQL Injection Block**: Sanitizes request inputs, stripping MongoDB operator keys (`$`, `.`) from parameters.
- **Cross-Site Scripting (XSS) Prevention**: Filters user input values to neutralize malicious HTML and script tags.
- **Helmet Headers**: Enforces strict transport security and prevents clickjacking attempts.
- **Payment Signature Auditing**: Webhook events calculate HMAC hashes locally, comparing them to Razorpay headers to prevent fraud.

---

# 13. Performance Optimizations

```
                        API Request for Product Details
                                      |
                                      v
                             [Check Cache Key]
                             `products:detail:123`
                                      |
                 +--------------------+--------------------+
                 | Cache Hit                               | Cache Miss
                 v                                         v
         [Read from Redis]                         [Query MongoDB]
                 |                                         |
                 |                                 [Set Cache in Redis]
                 |                                 (with 600s TTL)
                 |                                         |
                 +--------------------+--------------------+
                                      |
                                      v
                             [Return Response]
```

- **Redis Cache TTL**: Caches query lists for 5 minutes, product details for 10 minutes, and AI chatbot results for 15 minutes.
- **Write-Through Cache Invalidation**: Write operations (such as restocking or pricing updates) trigger selective cache purges to keep data fresh.
- **Database Index Optimization**: Speeds up text-based searches and catalog filters using targeted database indexes.
- **Lean Mongoose Queries**: Uses `.lean()` for read-only queries to bypass model hydrations, reducing CPU overhead.

---

# 14. Deployment Architecture

- **Client Hosting**: The React application is built into static assets and deployed to high-speed CDN edges (like Vercel).
- **Server Instance**: The Node.js application runs on scalable cloud platforms (such as Render) with process managers (PM2) handling recycling.
- **Database Hosting**: MongoDB runs on cloud clusters (MongoDB Atlas), while Redis is hosted on managed instances (like Upstash).
- **Environment Variables**: API keys, secrets, and database credentials are kept out of code repositories, managed directly in environment configurations.

---

# 15. Error Handling Strategy

- **Graceful Fallbacks**: If Redis is offline, database calls continue seamlessly; email dispatch failures do not block checkout flows.
- **Structured API Responses**: API errors return standardized JSON responses (error messages, status codes, success flags).
- **Centralized Logs**: System logs output detailed error stack traces locally while hiding sensitive trace paths from client views.
- **Real-Time Client Toasts**: Frontend catch blocks map API errors to toast notifications, keeping users informed of network issues.

---

# 16. Complete Project End-to-End Flow

```
1. Guest Landing  ==>  2. Registration  ==>  3. Browse & Filter  ==>  4. Add to Cart
   (Landing page)          (Signup Page)            (Shop page)           (Cart Page)
                                                                               ||
                                                                               ||
8. Secure Logout  <==  7. Live Track   <==  6. confirmation  <==  5. Checkout Verification
   (Clear Session)     (Socket updates)      (Nodemailer Email)      (Razorpay/COD payments)
```

1. **Guest Access**: A guest lands on the site and is redirected to sign up/login pages.
2. **Registration**: The user registers; the system hashes their password, registers the account, and sends a welcome email.
3. **Catalog Browsing**: The user filters products; the system checks Redis and falls back to MongoDB to return product lists.
4. **Cart Management**: The user adds products to their cart; the system validates stock levels and updates the database.
5. **Checkout**: The user initiates checkout, selecting COD or Razorpay; the system validates totals and processes the payment.
6. **Confirmation**: Successful checkout decrements stock, invalidates caches, and triggers an email confirmation.
7. **Tracking & Support**: The user monitors delivery status on their profile page or cancels COD orders via the AI assistant.
8. **Logout**: The user logs out; the system destroys token cookies and client sessions, returning to the landing page.

---

# 17. Most Complex Technical Challenges

### 1. Razorpay Async Checkout Alignment & Webhook Integrity
- **Challenge**: Managing order verification when users close checkouts before payment redirects finish.
- **Solution**: The system uses `PaymentAttempt` documents to record transactions before redirecting to Razorpay. If a redirect is interrupted, Razorpay webhooks process the transaction asynchronously. Webhook handlers verify signatures using local secrets, check stock levels, and finalize orders, notifying users via Socket.io.

### 2. Conversational Intent Mapping & Entity Resolution
- **Challenge**: Resolving references like "cancel *that* order" or "show specs for *it*" within the chatbot context.
- **Solution**: The chatbot stores previous context keys (such as the active order ID and last search term) in the database chat session. When a request is received, the intent engine analyzes the message for contextual references, resolving them to the correct active ID before querying the database.

---

# 18. Future Professional Improvements

- **Refactored Refresh Tokens**: Transition to 15-minute access tokens paired with secure, rotating refresh tokens stored in cookies.
- **Dynamic Search Engine Integration**: Migrate regular expression catalog searches to vector-based databases (like Atlas Search).
- **Distributed Event Queues**: Implement message brokers (such as RabbitMQ or BullMQ) to offload cron jobs and email deliveries from the main thread.
- **Cloud-Native Image Management**: Move product image uploads from local folders to cloud storage buckets (like AWS S3).

---

# 19. 100 Technical Interview Questions & Answers

### Category 1: Easy (Questions 1 - 35)

#### Q1: What is the main purpose of the `.env` file in the project?
**A**: It stores sensitive configuration variables (such as database URIs, API keys, and port numbers) outside the codebase, ensuring security across environments.

#### Q2: Which hashing algorithm is used for user passwords in this application?
**A**: **bcrypt** is used with a salt round value of 10 to hash password inputs during user registration.

#### Q3: How are public routes separated from private routes on the frontend?
**A**: React Router paths are wrapped with `ProtectedRoute` or `AdminProtectedRoute` components, checking authorization states before rendering pages.

#### Q4: What does the Mongoose `unique: true` constraint do on fields?
**A**: It instructs MongoDB to build a unique index on the target field, preventing duplicate entries (like registering the same email twice).

#### Q5: Explain the difference between React's `useState` and `useEffect` hooks.
**A**: `useState` declares state variables, while `useEffect` handles side effects (like data fetching or subscribing to socket connections).

#### Q6: How does the client send credentials (cookies) in Axios requests?
**A**: By setting the `withCredentials: true` option in the Axios instance configuration.

#### Q7: What role does the `cors` package play in the backend?
**A**: It manages Cross-Origin Resource Sharing, restricting API requests to approved client domains.

#### Q8: How does the backend recognize the currently logged-in user?
**A**: Auth middleware decodes the JWT token sent in headers or cookies and attaches the user's ID to `req.user`.

#### Q9: What does the `.lean()` method do in Mongoose queries?
**A**: It returns plain JavaScript objects instead of full Mongoose documents, reducing memory usage and CPU overhead.

#### Q10: How are environment variables read in the React application?
**A**: By using the `import.meta.env` prefix inside the Vite application environment.

#### Q11: What is the purpose of the `User.js` pre-save hook?
**A**: It intercepts user document updates, checking if the password field was modified and hashing it before saving.

#### Q12: Why is the `express.json()` middleware required in `server.js`?
**A**: It parses incoming requests with JSON payloads, making the parsed data available under `req.body`.

#### Q13: What does JWT stand for and what are its three components?
**A**: JSON Web Token. It consists of a header (metadata), a payload (claims), and a signature (verification).

#### Q14: How does Nodemailer send emails in this project?
**A**: It configures a mail transporter using SMTP settings, sending structured HTML templates when triggered by user events.

#### Q15: Explain the purpose of `react-hot-toast` in the UI.
**A**: It provides toast notifications, displaying transaction updates and error warnings to users.

#### Q16: What does the `enum` property do in a Mongoose schema field?
**A**: It restricts the field's value to a predefined set of strings (like limiting role properties to "user" or "admin").

#### Q17: How is Vite configured to proxy backend requests during local testing?
**A**: The Vite configuration defines proxy rules, routing client calls to the local API server.

#### Q18: What is the default port for local Redis connections?
**A**: **6379**.

#### Q19: How do you verify if a document was successfully deleted in Mongoose?
**A**: By checking if the returned result matches the target query, or checking the deleted document count.

#### Q20: What does the `useContext` hook do in React?
**A**: It allows components to consume values from a React context directly, avoiding the need to pass props down manually.

#### Q21: What is the purpose of `express-mongo-sanitize`?
**A**: It removes prohibited characters (like `$` and `.`) from request inputs, protecting queries from NoSQL injection.

#### Q22: How does the client check the admin status of a user?
**A**: The `AdminProtectedRoute` component inspects the `role` property in the user context, verifying it matches "admin".

#### Q23: Why do we use `bcrypt.compare()` instead of comparing password hashes directly?
**A**: Because bcrypt incorporates random salts; comparing hashes directly would fail even if the input passwords matched.

#### Q24: What is the purpose of the `makeAdmin.js` script?
**A**: It is a command-line script that updates a user's role to "admin" directly in the database.

#### Q25: Explain the difference between `HTTP` and `WebSockets`.
**A**: HTTP uses a request-response model, while WebSockets establish persistent, bidirectional connections for real-time updates.

#### Q26: What does the `select: false` setting do in a Mongoose schema?
**A**: It excludes the marked field from default database queries unless it is explicitly requested.

#### Q27: How does `xss-clean` protect the application?
**A**: It sanitizes user inputs by filtering out HTML tags and script elements, protecting against Cross-Site Scripting.

#### Q28: What is the difference between `npm run dev` and `npm run build`?
**A**: `dev` starts the local development server, while `build` compiles the React application into optimized static assets.

#### Q29: What does the `cookie-parser` middleware do?
**A**: It parses cookies sent with client requests, making them accessible via `req.cookies`.

#### Q30: What is the default estimated delivery time for orders in this project?
**A**: Orders calculate and store an estimated delivery date set to 7 days from the creation date.

#### Q31: How do you access parameters from a URL in React Router?
**A**: By using the `useParams` hook (like extracting the product ID with `const { id } = useParams()`).

#### Q32: What does the Mongoose `timestamps: true` option do?
**A**: It automatically adds and updates `createdAt` and `updatedAt` date fields on documents.

#### Q33: How are categories managed in the public product catalog?
**A**: The database aggregates category counts dynamically, returning a list of available categories with product counts.

#### Q34: What is the purpose of `req.params` in Express?
**A**: It holds route parameters defined in path strings (like extracting values from `/products/:id`).

#### Q35: How does the system handle password reset requests?
**A**: It generates a secure random token, saves a hashed version with an expiration window to the user's document, and emails the reset link.

---

### Category 2: Medium (Questions 36 - 70)

#### Q36: Describe the two-stage checkout flow implemented in the project.
**A**: For online checkouts, the frontend requests a Razorpay order from the backend. The backend creates a `PaymentAttempt` document to log the transaction details. Once payment succeeds, the frontend sends the payment signature to the backend, which verifies the details, updates the attempt status, and creates the finalized order.

#### Q37: How does Redis invalidation work when a new product is added?
**A**: The controller uses `deleteCachePattern("products:list:*")` to clear cached search results and `deleteCache("homepage:featured")` to update landing page queries, ensuring catalog views display the new product.

#### Q38: Explain the fallback mechanism if the Redis server goes offline.
**A**: The client is configured with custom event listeners; connection errors are caught without crashing, and data fetching falls back directly to MongoDB.

#### Q39: How does the admin dashboard compute total revenue?
**A**: It queries the `orders` collection, summing the `totalAmount` of all COD orders and paid Razorpay orders while excluding cancelled purchases.

#### Q40: What security issue arises if you use `req.query` with Mongoose query operators directly in Express 5?
**A**: Express 5 query parameters can bypass standard checks; sanitization middleware is applied manually to `req.body` and `req.params` to prevent NoSQL query injection.

#### Q41: How does Socket.io ensure only authorized users join specific channels?
**A**: The connection middleware decodes the JWT token during the handshake. If authentication succeeds, the socket is joined to a user-specific room (`user:userId`).

#### Q42: What is the purpose of `PaymentAttempt.js`?
**A**: It acts as a pre-verify ledger, recording items and prices before directing users to payment gateways to prevent stock discrepancies.

#### Q43: How does the system validate product prices during checkout?
**A**: The backend recalculates line items and totals using product data queried directly from the database, ignoring client-side pricing payloads.

#### Q44: Describe the role of `node-cron` in inventory management.
**A**: It schedules recurring background tasks, running low-stock scans every minute and sending daily health summaries to admins.

#### Q45: How does the AI chatbot compare products?
**A**: It parses comparison terms from user input, queries the database for matching products, and generates structured comparison tables (pricing, specifications, stock levels).

#### Q46: What is the purpose of `express.raw({ type: "application/json" })` on Razorpay webhooks?
**A**: It preserves the raw request body string, which is required to calculate accurate signature hashes for security validation.

#### Q47: How does the client manage local network testing with Vite?
**A**: The configuration resolves Axios base URLs to the host IP instead of localhost, allowing mobile devices on the same Wi-Fi network to connect to the local API.

#### Q48: Explain the Mongoose `$expr` operator used in stock monitoring.
**A**: It enables cross-field comparison, checking if product stock is less than or equal to individual low-stock thresholds directly within database queries.

#### Q49: Why does the project separate business logic into a Service layer?
**A**: Moving database queries and formatting logic out of controllers into reusable services simplifies testing and code maintenance.

#### Q50: How does the application prevent duplicate review submissions?
**A**: Before saving a review, the controller checks if the product's reviews array already contains an entry matching the active user ID.

#### Q51: Explain the token cookie security options: `httpOnly`, `secure`, and `sameSite`.
**A**: `httpOnly` blocks client-side scripts from reading the cookie; `secure` ensures transmission over HTTPS; `sameSite` prevents cross-site request forgery (CSRF).

#### Q52: How does the frontend handle token restoration after a browser refresh?
**A**: The application context parses saved session data from local storage, setting the authentication state and headers on reload.

#### Q53: What index optimizations are applied to the `Order` model?
**A**: The model indexes fields like `user` and `createdAt` to speed up order history queries and dashboard statistic aggregation.

#### Q54: How does the daily summary cron job determine inventory health?
**A**: It calculates the ratio of well-stocked items (stock above thresholds) to total products, generating a percentage index.

#### Q55: How does the chatbot track orders?
**A**: It retrieves the user's active orders, parses the status, formatting payment types and estimated deliveries, and displays the tracking timeline to the user.

#### Q56: Why are cart updates validated against product stock levels?
**A**: To prevent users from adding more items to their cart than are currently available in the database, reducing checkout failures.

#### Q57: How does `Multer` determine file names for uploaded product images?
**A**: It combines random strings with the original file extension to create unique names, preventing file name collisions.

#### Q58: What is the purpose of the `GuestRoute` component?
**A**: It protects login and registration paths, redirecting authenticated users back to the home page.

#### Q59: How does the backend handle email failures during checkouts?
**A**: Transporter functions run inside try-catch blocks; failures are logged without interrupting the order creation process.

#### Q60: Explain how ratings stats are updated when a review is deleted.
**A**: The system recalculates rating counts and averages using the remaining reviews, saving the updated metrics to the product document.

#### Q61: What is a Mongoose virtual field, and why would we use it?
**A**: Virtual fields are document properties that can be read and written but are not saved to the database, useful for dynamic data formatting.

#### Q62: Why is the CORS origin configuration dynamic?
**A**: To support local network testing, allowing developers to access the API server from mobile devices and local addresses.

#### Q63: Explain how rate limiting parameters protect chat endpoints.
**A**: They limit users to 20 chat requests per minute, preventing automated API spam from overwhelming LLM services.

#### Q64: How are address labels managed in the profile section?
**A**: Users save addresses with custom labels (such as "Home" or "Work") and can designate a default address for checkout.

#### Q65: What index strategy optimizes public search queries?
**A**: Indexes on fields like `productName` and `category` speed up regex-based catalog searches.

#### Q66: How does the application verify purchase history for reviews?
**A**: It checks the orders collection for a completed purchase of the product by the user before flagging a review as verified.

#### Q67: Explain the difference between Mongoose's `findByIdAndUpdate` and document `save()` methods.
**A**: `save()` triggers validation middleware and hooks, while `findByIdAndUpdate` updates the database directly, bypassing hooks unless configured.

#### Q68: What is the purpose of `optionalAuth` middleware?
**A**: It decodes user tokens if present to personalize views (like showing wishlists) without blocking guest access to public pages.

#### Q69: Explain the data structure of the `ChatSession` messages array.
**A**: It stores message objects containing role types (user or assistant), timestamps, text content, and structured snapshot data.

#### Q70: How does the application handle database connection failures?
**A**: Mongoose parameters include connection retry thresholds; failures trigger connection error events and alert administrators.

---

### Category 3: Advanced (Questions 71 - 100)

#### Q71: Explain the race condition risk during concurrent checkouts and how it is addressed.
**A**: Concurrent checkouts can cause stock levels to drop below requested quantities between verification and order creation. While Mongoose transactions offer a solution, this project manages stock levels using atomic updates like `Product.findByIdAndUpdate(id, { $inc: { stock: -quantity } })`. The update fails or reports a negative balance if stock is insufficient.

#### Q72: How does the chatbot resolve references to older orders, such as "cancel it"?
**A**: It retrieves conversation context records from the chat session. If a message contains intent triggers (like "cancel") and reference keywords (like "it"), the system resolves the request using the last active order ID in the session.

#### Q73: Why is `express.raw` applied only to `/api/payment/webhook`?
**A**: It captures the original, unaltered payload string needed for Razorpay signature verification; standard body parsers modify whitespace, which invalidates signatures.

#### Q74: Why do we use Redis wildcard keys scanning (`redis.keys`) during catalog updates?
**A**: Wildcards scan and delete cached search query results (like `products:list:*`) in a single operation, ensuring category views refresh immediately when products change.

#### Q75: How does the application prevent NoSQL injections via request parameters?
**A**: Input sanitization middleware strips characters like `$` and `.` from requests, preventing attackers from injecting operators (like `$gt`) to query unauthorized data.

#### Q76: Explain the difference between Razorpay checkout signature verification and Webhook signature verification.
**A**: Checkout verification hashes the `order_id` and `payment_id` using the key secret, while webhook verification checks the entire raw payload against the header signature.

#### Q77: Why does the low-stock cron job update a boolean flag after sending notifications?
**A**: Setting `lowStockNotificationSent` to true prevents the system from sending duplicate alerts during subsequent scans until the product is restocked.

#### Q78: Explain the database aggregation pipeline used in admin review listings.
**A**: It unwinds the reviews array, matches rating filters, performs a lookup on the users collection to retrieve author details, sorts by date, and uses facets to return data and total counts.

#### Q79: How does Socket.io broadcast stock updates to all clients during checkout?
**A**: The order controller queries the updated stock levels and broadcasts a `product:stockUpdated` event to all active sockets, updating client views in real time.

#### Q80: How does the application handle user bans?
**A**: It sets the `isBanned` flag to true on the user's document. Authentication controllers check this flag during login, rejecting banned accounts with a `403 Forbidden` response.

#### Q81: What is the purpose of the `PaymentAttempt` TTL policy?
**A**: Incomplete checkout attempts are automatically removed from the database after a set time, keeping the database clean.

#### Q82: How does Nodemailer configure SMTP transport options?
**A**: It initializes connection properties using host addresses, port settings, secure options (like TLS on port 465), and authentication keys.

#### Q83: Why is the AI chatbot response cached, and how is it invalidated?
**A**: Caching answers to common queries (like product comparisons) reduces LLM API costs. Cache entries use the user's query as the key and expire after 15 minutes.

#### Q84: Explain the difference between React Router's dynamic imports and standard imports.
**A**: Dynamic imports load components only when their paths are visited, reducing initial page load sizes and improving performance.

#### Q85: How does the app update the admin dashboard in real time?
**A**: Controllers trigger `emitDashboardStats()` after database updates, recalculating system metrics and broadcasting updates to the admin socket room.

#### Q86: What security concerns arise from storing tokens in localStorage?
**A**: Storing tokens in localStorage makes them vulnerable to Cross-Site Scripting (XSS) attacks; the project mitigates this by also supporting secure, httpOnly cookies.

#### Q87: Why do we recalculate product ratings on the server instead of the client?
**A**: Performing rating calculations on the server prevents users from tampering with data and ensures rating calculations are consistent.

#### Q88: How does the chatbot handle queries for products that are out of stock?
**A**: The chatbot prompt instructs the model to check stock values in the product context. If stock is 0, the model informs the user and suggests in-stock alternatives.

#### Q89: Why is `express-rate-limit` key generation configured to check reverse proxies?
**A**: Checking reverse proxies ensures the rate limiter reads the client's actual IP address rather than the load balancer's IP, preventing accidental blockages.

#### Q90: How does client-side search syncing work with React contexts?
**A**: The search context stores query variables and shares them across search bars and catalog pages, keeping the UI in sync.

#### Q91: Why are product updates structured to clean old image files?
**A**: When a new image is uploaded, the update controller deletes the old image file from the server's disk, preventing disk space accumulation.

#### Q92: What role does the Mongoose `ObjectId` reference play in database models?
**A**: It establishes relationships between collections (like linking orders to users), allowing populate operations to join data during queries.

#### Q93: Why is the application designed to fall back to default addresses during checkout?
**A**: If a user has a saved address marked as default, the checkout page selects it automatically, reducing checkout steps and improving the checkout experience.

#### Q94: How does the application prevent memory leaks in Socket.io?
**A**: It cleans up event listeners when clients disconnect, preventing the server from retaining stale socket references.

#### Q95: Why are email templates stored as separate JavaScript modules?
**A**: Separating template modules from email controllers keeps code clean and makes email templates easier to update.

#### Q96: Explain how CORS credentials verification affects cookies.
**A**: Setting credentials verification to true allows browsers to send session cookies with cross-origin requests, which is required for cookie-based authentication.

#### Q97: How does the app handle invalid route requests on the backend?
**A**: A fallback wildcard handler catches unmatched routes and returns a JSON error, preventing the server from leaking internal files.

#### Q98: Why are review comments limited to 2000 characters?
**A**: Setting length limits prevents database bloat and protects rendering performance on product detail pages.

#### Q99: How does the chatbot format product comparisons in markdown?
**A**: The prompt guides the model to return comparisons as markdown tables, which the frontend renders as comparison grids.

#### Q100: Why does the system verify signature details locally during Razorpay checkouts?
**A**: Local signature verification ensures the payment was authorized by Razorpay and has not been tampered with, protecting against fraud.

---

# 20. HR Interview Questions & Answers

### Q1: What was the biggest technical challenge you faced in this project?
**A**: The most complex challenge was keeping checkout inventory counts accurate during network drops. If a user paid via Razorpay but closed the window before the redirect completed, the order remained uncreated despite the payment being processed. I resolved this by introducing `PaymentAttempt` records. These log details before payment begins, allowing the webhook handler to finalize orders and adjust stock levels independently when payment events are received.

### Q2: Why did you choose this specific architecture for the application?
**A**: I chose a decoupled MERN stack because it matches modern production patterns. React provides a responsive, components-based UI, while Node.js and Express handle API routing efficiently. MongoDB supports the flexible document structure needed for product specs and reviews, and Redis caching keeps search times low.

### Q3: If you had more time, what would you improve in the codebase?
**A**: I would transition the application to TypeScript to improve code reliability. I would also replace the current local file uploads with cloud storage (like AWS S3) and add a search engine (like Elasticsearch) to support advanced product queries.

### Q4: Tell me about a mistake you made during development and what you learned.
**A**: Early on, I did not write custom webhook verification logic, which left the payment system vulnerable to spoofed success events. This taught me the importance of local signature checks and webhook validation. I now ensure all external webhooks verify payloads using secure HMAC hashes.

---

# 21. Viva / System Design Presentation Guide

### System Design Pitch (Resume Defense)
*“ElectroMart is a full-stack electronics e-commerce platform built to solve inventory sync issues and provide instant support. I used React for the frontend and Node/Express for the backend, with MongoDB storing order and product details. To speed up load times, I added a Redis caching layer that stores catalog searches. Real-time updates are handled via Socket.io, and checkouts are processed securely using Razorpay verification. The platform also features an AI assistant powered by Groq to help users track and cancel orders directly in chat.”*

### Core Viva Q&A
- **Q**: *Why use MongoDB instead of SQL?*
  - **A**: MongoDB's document model matches the structure of e-commerce catalogs. Products have varied specifications and nested reviews, which can be stored in a single document without complex SQL joins.
- **Q**: *What happens if the Redis cache is not invalidated during stock changes?*
  - **A**: Stale stock data remains cached, allowing users to add out-of-stock items to their carts. The project avoids this by using write-through cache invalidation, clearing related cache keys whenever stock levels change.
- **Q**: *How is database integrity maintained during order cancellations?*
  - **A**: The cancellation service checks if the order is eligible, updates the status, and increments product stock levels in a single database operation, preventing double-cancellation issues.

---

# 22. Code Execution Walkthroughs

### 1. User Registration Flow
1. The client sends user details to `POST /api/auth/signup`.
2. `authController.js` checks for missing inputs and queries MongoDB to ensure the email is unique.
3. The password is hashed using bcrypt in the User model's pre-save hook.
4. The user document is saved to the database.
5. The controller signs a JWT, sets it in a cookie, and returns the user object to the client.
6. Nodemailer sends a welcome email in the background, while the client redirects the user to the home page.

### 2. Product Search & Caching Flow
1. The client calls `GET /api/products?search=sensor`.
2. `productController.js` generates a cache key from the query parameters: `products:list:{"search":"sensor"}`.
3. The controller queries Redis; if the key exists, it returns the cached data immediately.
4. If a cache miss occurs, the controller queries MongoDB using a regex search.
5. The query results are saved to Redis with a 5-minute expiration time and returned to the client.

### 3. Razorpay Payment Verification Flow
1. The client submits payment details to `POST /api/payment/verify-payment`.
2. The controller hashes the `razorpay_order_id` and `razorpay_payment_id` using the local key secret.
3. The generated signature is compared to `razorpay_signature`.
4. If the signatures match, the controller queries the corresponding `PaymentAttempt` document.
5. An order is created with status "Paid", and product stock levels are decremented.
6. The user's cart is cleared, caches are invalidated, and Socket.io broadcasts the updated stock levels to all clients.

### 4. AI Chatbot Order Cancellation Flow
1. The user asks the chatbot to cancel their order.
2. The assistant determines the user's intent and retrieves the conversation context.
3. The chatbot service queries the order details and evaluates them against cancellation policies.
4. If the order is eligible, the backend updates the order status to "Cancelled" and restocks the items.
5. The chatbot sends a confirmation message to the user, and Socket.io notifies the admin dashboard.

---

# 23. Learning & Revision Summary

Use this summary for quick review before interviews:

```
                          [MERN Stack Architecture]
   React (State & Hooks) <---> Express (APIs) <---> MongoDB (Data Models)
                                  ^
                                  | (Read/Write cache)
                                  v
                                Redis
```

- **Authentication**: Uses JWTs stored in secure, HttpOnly cookies. Passwords are encrypted using bcrypt before database writes.
- **Caching Strategy**: Redis caches product listings for 5 minutes and detail pages for 10 minutes, reducing database load. Caches are cleared on updates.
- **Webhooks**: Razorpay webhooks process payments asynchronously, verifying signature hashes to prevent checkout fraud.
- **AI Chatbot**: Utilizes Groq APIs to parse user intent, retrieving database context to answer queries and process cancellations.
- **Real-Time Sync**: Socket.io syncs stock changes and admin stats across clients, preventing out-of-stock checkouts.
- **Inventory Monitoring**: scheduled cron tasks scan stock levels, sending alert emails to admins when stock falls below thresholds.
