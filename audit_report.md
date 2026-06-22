# Project Audit Report

## 🔴 Critical (fix before launch)

- **`frontend/src/context/AuthContext.jsx` & `utils/api.js`**
  - **Issue:** JWT tokens are stored in `localStorage` instead of `httpOnly` cookies, exposing them to XSS attacks.
  - **Suggestion:** Migrate to `httpOnly` cookies managed by the backend.

- **`backend/server.js` & `backend/socket.js`**
  - **Issue:** CORS is configured to allow all origins (`app.use(cors())` and `origin: "*"`).
  - **Suggestion:** Restrict CORS origins to the specific `FRONTEND_URL`.

- **`backend/socket.js` (Lines 21 & 29)**
  - **Issue:** User room and admin room joins (`join` and `join:admin`) are not protected by any authentication or role checks.
  - **Suggestion:** Verify user token and role before allowing socket to join these sensitive rooms.

- **`backend/controllers/assistantController.js` (Lines 122-186)**
  - **Issue:** Chat history is not being trimmed; all messages are continually pushed to the array, which will hit Groq token limits.
  - **Suggestion:** Implement a sliding window to trim `session.messages` to the last N interactions.

- **`backend/controllers/assistantController.js`**
  - **Issue:** No rate limiting on the chat endpoint per user.
  - **Suggestion:** Add an Express rate-limiting middleware to `/api/assistant/message`.

- **`backend/controllers/adminController.js` (Line 251)**
  - **Issue:** `getOrders` fetches all orders into memory (`Order.find(query).populate(...)`) and paginates via JavaScript slice, causing severe memory/performance issues at scale.
  - **Suggestion:** Use MongoDB `.skip()` and `.limit()` directly on the database query.

## 🟡 Important (fix soon after launch)

- **`backend/controllers/paymentController.js` (Line 25) & `orderController.js` (Line 42)**
  - **Issue:** N+1 query issue in `buildOrderItems` and `placeOrder`; loops over `items` array to call `Product.findById(item.product)`.
  - **Suggestion:** Use a single `$in` query to fetch all products at once.

- **`backend/models/Order.js`, `Product.js`, `User.js`**
  - **Issue:** Missing MongoDB indexes on frequently queried fields (e.g., `Order.user`, `Product.category`, `Product.price`).
  - **Suggestion:** Add `{ index: true }` to commonly queried schema paths.

- **Entire Backend (Multiple Controllers)**
  - **Issue:** `catch (error)` blocks return raw MongoDB errors to the client (`res.status(500).json({ message: error.message })`).
  - **Suggestion:** Abstract error handling to a global middleware and return generic error messages in production.

- **Frontend `index.html` & React Pages**
  - **Issue:** Missing dynamic `<title>` and `<meta description>` tags for key pages (SEO).
  - **Suggestion:** Implement `react-helmet-async` to dynamically inject meta tags per page.

- **Frontend Product Pages**
  - **Issue:** Product pages lack structured data (JSON-LD) and Open Graph (OG) tags for SEO and social sharing.
  - **Suggestion:** Inject structured data into the document head when a product loads.

- **Frontend Navigation / Architecture (`App.jsx`)**
  - **Issue:** Large components and routes are not code-split; everything loads in the initial bundle.
  - **Suggestion:** Use `React.lazy()` and `Suspense` for route-based code splitting.

## 🟢 Nice to Have (future improvements)

- **`backend/socket.js`, `server.js`, `makeAdmin.js`, `Home.jsx`**
  - **Issue:** Leftover `console.log` statements in production code.
  - **Suggestion:** Remove or replace them with a robust logging library like `winston` or `pino`.

- **Missing Standard E-Commerce Features**
  - **Issue:** No coupon or discount code support at checkout.
  - **Suggestion:** Implement a Coupon model and apply discount logic to the cart/checkout totals.

- **Missing Standard E-Commerce Features**
  - **Issue:** No option to download order invoices / receipts as PDFs.
  - **Suggestion:** Add a "Download Invoice" button generating a PDF on the client or server.

- **Missing Standard E-Commerce Features**
  - **Issue:** No "Recently Viewed Products" section.
  - **Suggestion:** Store recently viewed product IDs in `localStorage` or DB to render a slider on product pages.

- **Missing Standard E-Commerce Features**
  - **Issue:** No fallback response if Groq API is down or times out.
  - **Suggestion:** Add a `try/catch` specifically for the Groq call and return a polite fallback message.

## ✅ Already Implemented Well (things that look solid)

- **Payment Webhook Verification**
  - **Status:** Razorpay webhook endpoint correctly implements HMAC SHA256 signature verification (`webhookHandler` in `paymentController.js`).

- **Secure Order Creation Workflow**
  - **Status:** Order creation for online payments defers final order placement until *after* payment is verified via `PaymentAttempt` and `verifyPayment`.

- **Admin Routes Role Checks**
  - **Status:** Admin routes are properly secured behind `authMiddleware` and `adminMiddleware` to verify the user role.

- **Stock Verification Before Order Confirmation**
  - **Status:** Order controllers (`paymentController.js`, `orderController.js`) correctly check stock availability before confirming orders and decrease stock atomically.
