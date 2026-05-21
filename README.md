# Electronics E-Commerce Portal

A full-featured e-commerce platform for browsing, purchasing, and managing electronic products with comprehensive admin controls and secure authentication.

### 📧 Email System
Automated email notifications for critical user actions:

#### Email Templates
- **Order Confirmation Email**: Sent immediately after successful order placement (COD or Razorpay)
  - Order number and items list
  - Order total with formatted pricing
  - Shipping address confirmation
  - Direct link to order tracking
  - Professional HTML-formatted template

- **Welcome Email**: Sent on user registration
- **Password Reset Email**: Sent when user requests password recovery
- **Order Status Update Email**: Sent when order status changes (Confirmed, Processing, Shipped, Delivered)

#### Email Configuration
- **Provider**: Nodemailer with SMTP support (Gmail, custom servers, etc.)
- **Async Delivery**: Non-blocking email sending - failures don't block order processing
- **Error Handling**: Graceful fallback if email fails; order still completes successfully
- **Environment Variables**: 
  - `EMAIL_HOST`: SMTP server hostname
  - `EMAIL_PORT`: SMTP port (usually 465 for secure, 587 for TLS)
  - `EMAIL_USER`: Sender email account
  - `EMAIL_PASS`: Sender email password
  - `FROM_NAME`: Display name for sender
  - `FROM_EMAIL`: From email address

---

## 📋 Table of Contents
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation & Setup](#-installation--setup)
- [API Endpoints](#-api-endpoints)
- [Database Models](#-database-models)
- [Authentication & Security](#-authentication--security)

---

## ✨ Features

### 🔐 User Authentication
- **Sign Up**: Register with email, phone, password, and initial address
- **Login**: Authenticate via email OR phone with password
- **JWT Tokens**: Secure token-based session management
- **Password Security**: bcrypt hashing for all passwords
- **Session Persistence**: Automatic token restoration from localStorage

### 🛒 Shopping & Browsing
- **Product Catalog**: Browse all electronic products with filters and search
- **Product Details**: View comprehensive product information including price, description, category, stock, and images
- **Smart Search**: Filter products by name and category
- **Wishlist**: Add/remove products to save for later purchase
- **Stock Information**: Real-time product availability display

### 🛍️ Shopping Cart
- **Add/Remove Items**: Manage cart contents easily
- **Quantity Management**: Adjust item quantities in cart
- **Running Total**: Real-time cart total calculation
- **Cart Persistence**: Cart maintains state across sessions
- **Auto-Clear**: Cart automatically empties after successful order

### 📦 Order Management
- **Flexible Checkout**: Place orders with multiple payment method options
  - Cash on Delivery (COD)
  - UPI Payments
  - Card Payments
- **Secure Online Payments**: Razorpay order creation + signature verification before order confirmation
- **COD Instant Orders**: COD orders are created immediately after placement
- **Payment Failure Handling**: Cancelled/failed online payments do not create orders
- **Address Selection**: Choose from saved addresses or use default shipping address
- **Order Tracking**: Monitor orders through complete lifecycle:
  - Pending → Confirmed → Processing → Shipped → Delivered
- **Order History**: View all past orders with timestamps and details
- **Order Details**: Access comprehensive order information including items, totals, and status
- **Order Cancellation**: Cancel orders in early stages (Pending/Confirmed)
- **Estimated Delivery**: Automatic 7-day delivery estimation

### 👤 Profile Management
- **Profile Viewing**: Display user name, email, phone, and current address
- **Profile Updates**: Edit name, phone, and address information
- **Password Management**: Change password with verification
- **Multiple Addresses**: Save and manage multiple shipping addresses with custom labels
- **Default Address**: Set a preferred address for quick checkout

### ⭐ Wishlist Management
- **Add to Wishlist**: Save products for future purchases
- **Remove from Wishlist**: Manage saved items
- **Wishlist View**: Dedicated page to view all wishlist items

### 📱 Mobile Responsiveness & UI
- **Fully Responsive Design**: Fluid layouts that adapt perfectly to mobile, tablet, and desktop screens
- **Adaptive Navbar**: Navigation bar intelligently wraps and manages vertical space on smaller screens to prevent content overlap
- **Dynamic Search Bar**: Search bar is context-aware and only visible to authenticated users to maintain a clean landing page
- **Protected Browsing Experience**: Core shopping pages (Home, Shop, Product Details) are restricted to registered members, with elegant redirects and toast notifications for guests
- **Local Network Testing Support**: API requests dynamically resolve to the host IP instead of localhost when testing on mobile devices via Wi-Fi

### 🤖 AI Chatbot Assistant
Intelligent support powered by Groq AI with real-time order management and product expertise:

#### Assistant Features
- **Order Tracking**: Instant order status lookup with delivery timelines and tracking details
- **Order Cancellation**: Smart eligibility assessment with real-time cancellation support for eligible orders
- **Product Recommendations**: AI-powered product suggestions based on budget and preferences
- **Product Comparison**: Compare two electronics side-by-side with detailed specifications
- **Electronics Guidance**: Expert knowledge on sensors, Arduino, ESP32, IoT components, and robotics
- **Payment & Delivery Help**: Assistance with payment methods and shipping inquiries
- **Conversation History**: Persistent chat sessions per user with context awareness
- **Quick Actions**: Pre-built action buttons for common tasks (Track Orders, Recommend Products, Compare, Payment Help, Delivery Help)
- **Rich Response Format**: Orders and products rendered with actionable buttons and detailed information

#### Assistant Technical Details
- **AI Engine**: Groq SDK for fast, real-time responses
- **Context Awareness**: Tracks active orders and products within conversation
- **Order Snapshots**: Real-time hydration of order data with payment and status information
- **Intent Detection**: Automatic detection of user intent (track, cancel, recommend, compare, general support)
- **Smart Search**: Multi-field product search with budget filtering and relevance sorting

### 📊 Admin Dashboard
Comprehensive analytics and management tools:

#### Dashboard Statistics
- **Total Products**: Quantity of all products in catalog
- **Total Users**: Count of all registered users
- **Total Orders**: Number of all placed orders
- **Total Revenue**: Sum of COD orders and paid Razorpay orders
- **Pending Orders**: Orders awaiting processing
- **Low Stock Alert**: Products with 5 or fewer units

#### 🏷️ Product Management
- **Create Products**: Add new products with name, description, price, category, stock, and featured flag
- **Image Upload**: Upload actual product images directly from your device (stored locally) instead of just providing external URLs
- **View Products**: Browse all products with pagination (10 per page)
- **Search Products**: Find products by name
- **Filter by Category**: Organize products by category
- **Update Products**: Edit product details and manage stock
- **Delete Products**: Remove products from catalog
- **Featured Products**: Mark products as featured for promotion

#### 📋 Order Management
- **View All Orders**: See complete list with pagination and timestamps
- **Filter by Status**: Filter orders by status (Pending, Confirmed, Processing, Shipped, Delivered, Cancelled)
- **Search Orders**: Find orders by customer name or email
- **Update Order Status**: Change delivery status and manage order workflow
- **Auto Payment Update**: Payment status automatically marked "Paid" when order is delivered
- **Customer Info**: View customer details for each order

#### 👥 User Management
- **View All Users**: Browse registered users with pagination
- **Search Users**: Find users by name, email, or phone number
- **Filter by Role**: Separate user and admin accounts
- **View User Details**: Access individual user profiles, wishlist, and order history
- **Change Roles**: Promote users to admin or demote admins to regular users
- **Ban/Unban Users**: Restrict or restore user access
- **Delete Users**: Remove users from the system

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend Framework** | React 19.2.6 with Vite 8.0.12 |
| **Routing** | React Router DOM 7.15.0 |
| **Styling** | Tailwind CSS 3.4.14 |
| **HTTP Client** | Axios 1.16.1 |
| **UI Components** | Lucide React, React Icons |
| **Notifications** | React Hot Toast |
| **Backend Runtime** | Node.js with Express.js 5.2.1 |
| **Database** | MongoDB with Mongoose 9.6.2 |
| **Authentication** | JWT (JSON Web Tokens) |
| **Password Hashing** | bcrypt 5.1.1 |
| **AI Assistant** | Groq SDK for real-time LLM responses |
| **Email Service** | Nodemailer with SMTP |
| **Payment Gateway** | Razorpay integration |

---

## 📁 Project Structure

```
electronics-ecommerce-portal/
│
├── backend/                          # Node.js + Express API
│   ├── config/
│   │   └── database.js              # MongoDB connection configuration
│   ├── controllers/
│   │   ├── adminController.js       # Admin operations
│   │   ├── authController.js        # Authentication logic
│   │   ├── cartController.js        # Cart management
│   │   ├── orderController.js       # Order operations
│   │   ├── paymentController.js     # Razorpay payment operations
│   │   ├── productController.js     # Product operations
│   │   └── userController.js        # User profile operations
│   ├── middleware/
│   │   ├── adminMiddleware.js       # Admin role verification
│   │   ├── authMiddleware.js        # Token validation
│   │   └── upload.js                # Multer image upload configuration
│   ├── models/
│   │   ├── User.js                  # User schema
│   │   ├── Product.js               # Product schema
│   │   ├── Order.js                 # Order schema
│   │   └── PaymentAttempt.js        # Razorpay payment attempt schema
│   ├── routes/
│   │   ├── adminRoutes.js           # Admin endpoints
│   │   ├── assistantRoutes.js       # AI chatbot endpoints
│   │   ├── authRoutes.js            # Auth endpoints
│   │   ├── cartRoutes.js            # Cart endpoints
│   │   ├── orderRoutes.js           # Order endpoints
│   │   ├── paymentRoutes.js         # Razorpay endpoints
│   │   ├── productRoutes.js         # Product endpoints
│   │   └── userRoutes.js            # User endpoints
│   ├── models/
│   │   ├── ChatSession.js           # AI chat session schema
│   │   ├── User.js                  # User schema
│   │   ├── Product.js               # Product schema
│   │   ├── Order.js                 # Order schema
│   │   └── PaymentAttempt.js        # Razorpay payment attempt schema
│   ├── middleware/
│   │   ├── adminMiddleware.js       # Admin role verification
│   │   ├── authMiddleware.js        # Token validation
│   │   ├── optionalAuth.js          # Optional token validation
│   │   └── upload.js                # Multer image upload configuration
│   ├── services/
│   │   ├── assistantService.js      # AI chatbot logic and utilities
│   │   ├── orderCancellationService.js  # Order cancellation logic
│   │   └── orderSupportService.js   # Order support utilities and snapshots
│   ├── controllers/
│   │   ├── adminController.js       # Admin operations
│   │   ├── assistantController.js   # AI chatbot controller
│   │   ├── authController.js        # Authentication logic
│   │   ├── cartController.js        # Cart management
│   │   ├── orderController.js       # Order operations
│   │   ├── paymentController.js     # Razorpay payment operations
│   │   ├── productController.js     # Product operations
│   │   └── userController.js        # User profile operations
│   ├── templates/
│   │   ├── orderTemplate.js         # Order confirmation email template
│   │   ├── resetPasswordTemplate.js # Password reset email template
│   │   ├── statusTemplate.js        # Order status update email template
│   │   └── welcomeTemplate.js       # Welcome email template
│   ├── utils/
│   │   ├── jwt.js                   # JWT token utilities
│   │   ├── sendEmail.js             # Email sending utility (Nodemailer)
│   │   └── imageUrl.js              # Image URL resolution utility
│   ├── uploads/
│   │   └── products/                # Uploaded product images directory
│   ├── server.js                    # Express server setup
│   ├── makeAdmin.js                 # Admin creation utility
│   └── package.json
│
├── frontend/                         # React + Vite application
│   ├── public/                       # Static assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── CategoryCard.jsx      # Category navigation card
│   │   │   ├── FilterSidebar.jsx     # Shop filtering sidebar
│   │   │   ├── Footer.jsx            # Application footer
│   │   │   ├── GuestRoute.jsx        # Guest-only route protection
│   │   │   ├── Navbar.jsx            # Navigation bar
│   │   │   ├── ProductCard.jsx       # Product display card
│   │   │   ├── ProductGrid.jsx       # Responsive grid for products
│   │   │   ├── ProtectedRoute.jsx    # User route protection
│   │   │   ├── SearchBar.jsx         # Search input component
│   │   │   └── SortDropdown.jsx      # Product sorting component
│   │   ├── admin/
│   │   │   ├── components/
│   │   │   │   ├── AdminLayout.jsx
│   │   │   │   ├── AdminNavbar.jsx
│   │   │   │   ├── AdminProtectedRoute.jsx
│   │   │   │   ├── AdminSidebar.jsx
│   │   │   │   ├── ConfirmModal.jsx
│   │   │   │   └── StatsCard.jsx
│   │   │   └── pages/
│   │   │       ├── Dashboard.jsx     # Admin dashboard
│   │   │       ├── Orders.jsx        # Order management
│   │   │       ├── Products.jsx      # Product management
│   │   │       └── Users.jsx         # User management
│   │   ├── context/
│   │   │   ├── AuthContext.jsx       # Authentication state
│   │   │   ├── CartContext.jsx       # Shopping cart state
│   │   │   ├── ProfileContext.jsx    # User profile state
│   │   │   └── SearchContext.jsx     # Global search state
│   │   ├── pages/
│   │   │   ├── Landing.jsx           # Welcome/landing page
│   │   │   ├── Home.jsx              # Product listing
│   │   │   ├── ProductDetails.jsx    # Product detail page
│   │   │   ├── Login.jsx             # Login page
│   │   │   ├── Signup.jsx            # Registration page
│   │   │   ├── Cart.jsx              # Shopping cart
│   │   │   ├── Checkout.jsx          # Order checkout
│   │   │   ├── OrderSuccess.jsx      # Order confirmation
│   │   │   ├── Orders.jsx            # Order history
│   │   │   ├── OrderDetails.jsx      # Order details page
│   │   │   ├── Profile.jsx           # User profile
│   │   │   ├── EditProfile.jsx       # Profile editing
│   │   │   ├── Addresses.jsx         # Address management
│   │   │   └── Wishlist.jsx          # Wishlist page
│   │   ├── utils/
│   │   │   ├── api.js                # API configuration
│   │   │   └── imageUrl.js           # Dynamic image path resolver
│   │   ├── App.jsx                   # Root component
│   │   ├── main.jsx                  # Application entry
│   │   ├── App.css                   # Global styles
│   │   └── index.css                 # Base styles
│   ├── vite.config.js                # Vite configuration
│   ├── tailwind.config.js            # Tailwind CSS config
│   ├── postcss.config.js             # PostCSS configuration
│   ├── eslint.config.js              # ESLint rules
│   ├── package.json
│   └── README.md
│
└── README.md                         # This file
```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Configure environment variables
# Create a .env file in the backend directory with:
# MONGODB_URI=your_mongodb_connection_string
# JWT_SECRET=your_secret_key
# PORT=5000

# Create the uploads directory (required for product image uploads)
mkdir uploads

# Start the server (dev mode with nodemon if installed, or standard start)
npm run dev
# OR
npm start

# (Optional) Create an initial admin user
node makeAdmin.js
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Configure environment variables
# Create a .env file in the frontend directory with:
# VITE_API_URL=http://localhost:5000

# Start the Vite development server
# Note: The app automatically resolves local network IPs if you test on your mobile device!
npm run dev

# Build for production
npm run build
```

---

## 📡 API Endpoints

### Authentication Routes (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup` | Register new user |
| POST | `/auth/login` | Login user and get JWT token |

### Product Routes (`/api/products`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | Get all products (with pagination & filters) |
| GET | `/products/:id` | Get single product details |
| POST | `/products/add` | Create new product (Admin only) |

### Cart Routes (`/api/cart`) - Protected
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/cart` | Get user's cart |
| POST | `/cart/add` | Add product to cart |
| PUT | `/cart/:productId` | Update product quantity in cart |
| DELETE | `/cart/:productId` | Remove product from cart |

### Order Routes (`/api/orders`) - Protected
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/orders` | Place new order |
| GET | `/orders/myorders` | Get user's order history |
| GET | `/orders/:id` | Get specific order details |
| PUT | `/orders/:id/cancel` | Cancel order |

### Payment Routes (`/api/payment`) - Protected
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/payment/create-order` | Create Razorpay order (no ecommerce order yet) |
| POST | `/payment/verify-payment` | Verify payment and create ecommerce order |
| POST | `/payment/webhook` | Razorpay webhook handler |

### User Profile Routes (`/api/users`) - Protected
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/me` | Get user profile |
| PUT | `/users/me` | Update user profile |
| PUT | `/users/me/password` | Update password |
| GET | `/users/me/wishlist` | Get wishlist items |
| POST | `/users/me/wishlist` | Add product to wishlist |
| DELETE | `/users/me/wishlist/:productId` | Remove from wishlist |
| GET | `/users/me/addresses` | Get saved addresses |
| POST | `/users/me/addresses` | Add new address |
| PUT | `/users/me/addresses/:addressId` | Update address |
| DELETE | `/users/me/addresses/:addressId` | Delete address |
| PUT | `/users/me/addresses/:addressId/default` | Set default address |

### Admin Routes (`/api/admin`) - Protected & Admin Only
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/stats` | Get dashboard statistics |
| GET | `/admin/products` | Get all products (with filters) |
| POST | `/admin/products` | Create new product |
| PUT | `/admin/products/:id` | Update product |
| DELETE | `/admin/products/:id` | Delete product |
| GET | `/admin/orders` | Get all orders (with filters) |
| PUT | `/admin/orders/:userId/:orderId` | Update order status |
| GET | `/admin/users` | Get all users (with filters & pagination) |
| GET | `/admin/users/:id` | Get specific user details |
| PUT | `/admin/users/:id/role` | Change user role |
| PUT | `/admin/users/:id/ban` | Toggle user ban status |
| DELETE | `/admin/users/:id` | Delete user |

### AI Assistant Routes (`/api/assistant`) - Protected
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/assistant/chat` | Send message to AI assistant |
| GET | `/assistant/session` | Get or create chat session |
| GET | `/assistant/session/messages` | Get session conversation history |
| DELETE | `/assistant/session` | Clear session |
| POST | `/assistant/quick-action` | Handle quick action buttons |

---

## 🗄️ Database Models

### User Model
```
{
  fullName: String (required)
  email: String (required, unique)
  phoneNumber: String (required)
  password: String (required, hashed)
  role: String (default: "user", values: "user" | "admin")
  isBanned: Boolean (default: false)
  address: Object {
    street: String
    city: String
    state: String
    pincode: String
    country: String
  }
  cartItems: Array of {
    product: ObjectId (reference to Product)
    quantity: Number
  }
  wishlistItems: Array of ObjectId (references to Product)
  savedAddresses: Array of {
    label: String
    street: String
    city: String
    state: String
    pincode: String
    country: String
    isDefault: Boolean
  }
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### Product Model
```
{
  productName: String (required)
  description: String (required)
  price: Number (required)
  category: String (required)
  stock: Number (required)
  imageUrl: String (default: provided)
  featured: Boolean (default: false)
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### PaymentAttempt Model
```
{
  user: ObjectId (reference to User)
  items: Array of { product: ObjectId, quantity: Number, price: Number }
  totalAmount: Number
  shippingAddress: Object
  paymentMethod: String (UPI | Card | Netbanking | Wallet)
  shippingCharge: Number
  taxAmount: Number
  razorpayOrderId: String
  razorpayPaymentId: String
  status: String (created | failed | completed)
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### Order Model
```
{
  user: ObjectId (reference to User, required)
  items: Array of {
    product: ObjectId (reference to Product)
    quantity: Number
    price: Number (snapshot at order time)
  }
  totalAmount: Number (required)
  shippingAddress: Object {
    street: String
    city: String
    state: String
    pincode: String
    country: String
  }
  paymentMethod: String (values: "Cash on Delivery" | "UPI" | "Card" | "Netbanking" | "Wallet")
  paymentStatus: String (values: "Pending" | "Paid" | "Failed" | "Refunded")
  razorpayOrderId: String (default: null)
  razorpayPaymentId: String (default: null)
  transactionStatus: String (values: "created" | "captured" | "failed" | "refunded")
  orderStatus: String (values: "Pending" | "Confirmed" | "Processing" | "Shipped" | "Delivered" | "Cancelled")
  cancellationReason: String
  cancelledBy: String (values: "user" | "admin")
  cancelledAt: Date
  estimatedDelivery: Date (default: current date + 7 days)
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### ChatSession Model (AI Assistant)
```
{
  user: ObjectId (reference to User, required)
  messages: Array of {
    role: String (values: "user" | "assistant")
    content: String (message text)
    richContent: Object {
      intent: String (detected user intent)
      summary: String
      quickActions: Array of action buttons
      products: Array of product snapshots
      orders: Array of order snapshots
      comparison: Object (product comparison data)
    }
    createdAt: Timestamp
  }
  title: String (conversation title derived from first message)
  summary: String (brief conversation summary)
  lastIntent: String (last detected user intent)
  context: Object {
    activeOrderId: ObjectId
    activeProductIds: Array of ObjectId
    lastResolvedReference: String
  }
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

---

## 🔐 Authentication & Security

### Security Features
- **JWT Authentication**: Secure token-based session management
- **Password Hashing**: bcrypt with 10 salt rounds
- **Protected Routes**: Backend middleware validates JWT tokens
- **Role-Based Access Control**: Separate permissions for users and admins
- **User Banning**: Admins can restrict user access
- **Session Persistence**: Secure localStorage for tokens
- **Order Validation**: Backend recalculates totals to prevent tampering

### Authentication Flow
1. User registers or logs in
2. Backend verifies credentials and issues JWT token
3. Frontend stores token in localStorage
4. Subsequent requests include token in Authorization header
5. Backend middleware validates token before processing requests
6. Token automatically cleared on logout

---

## 💼 Key Business Logic

- ✅ **Stock Management**: Validated before purchase, decremented on order, restored on cancellation
- ✅ **Cart Lifecycle**: Automatically clears after successful order placement
- ✅ **Order Workflow**: Multi-step status tracking (6 statuses total)
- ✅ **Default Addresses**: Automatic selection for quick checkout
- ✅ **Featured Products**: Admin-controlled promotion system
- ✅ **Low Stock Alerts**: Dashboard visibility for inventory management
- ✅ **Revenue Tracking**: Calculated from delivered orders only
- ✅ **Order Cancellation**: Restricted to early stages (Pending/Confirmed) only
- ✅ **Real-time Statistics**: Live dashboard metrics
- ✅ **AI-Powered Support**: Smart chatbot for order tracking, cancellation, product recommendations
- ✅ **Automated Email Notifications**: Order confirmation, status updates, password reset emails
- ✅ **Razorpay Webhook Integration**: Real-time payment status updates from payment gateway

---

## 📝 Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb://username:password@host:port/database
JWT_SECRET=your_super_secret_key
PORT=5000

# Email Configuration (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
FROM_NAME=ElectroMart
FROM_EMAIL=noreply@electromart.com

# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# AI Assistant (Groq)
GROQ_API_KEY=your_groq_api_key

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

---

## 📦 Dependencies

### Backend
- express@5.2.1
- mongoose@9.6.2
- bcrypt@5.1.1
- jsonwebtoken (JWT handling)
- cors (Cross-Origin Resource Sharing)
- dotenv (Environment variables)

### Frontend
- react@19.2.6
- vite@8.0.12
- react-router-dom@7.15.0
- tailwindcss@3.4.14
- axios@1.16.1
- lucide-react (Icons)
- react-icons (Icon library)
- react-hot-toast (Notifications)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 🆘 Support

For issues or questions, please:
1. Check the documentation
2. Review existing issues
3. Create a new issue with detailed description

---

**Last Updated**: May 2026
**Status**: Active Development
