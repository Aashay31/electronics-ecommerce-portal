# Electronics E-Commerce Portal

A full-featured e-commerce platform for browsing, purchasing, and managing electronic products with comprehensive admin controls and secure authentication.

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

### 📊 Admin Dashboard
Comprehensive analytics and management tools:

#### Dashboard Statistics
- **Total Products**: Quantity of all products in catalog
- **Total Users**: Count of all registered users
- **Total Orders**: Number of all placed orders
- **Total Revenue**: Sum of all order amounts (from delivered orders)
- **Pending Orders**: Orders awaiting processing
- **Low Stock Alert**: Products with 5 or fewer units

#### 🏷️ Product Management
- **Create Products**: Add new products with name, description, price, category, stock, image, and featured flag
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
│   │   ├── productController.js     # Product operations
│   │   └── userController.js        # User profile operations
│   ├── middleware/
│   │   ├── adminMiddleware.js       # Admin role verification
│   │   └── authMiddleware.js        # Token validation
│   ├── models/
│   │   ├── User.js                  # User schema
│   │   ├── Product.js               # Product schema
│   │   └── Order.js                 # Order schema
│   ├── routes/
│   │   ├── adminRoutes.js           # Admin endpoints
│   │   ├── authRoutes.js            # Auth endpoints
│   │   ├── cartRoutes.js            # Cart endpoints
│   │   ├── orderRoutes.js           # Order endpoints
│   │   ├── productRoutes.js         # Product endpoints
│   │   └── userRoutes.js            # User endpoints
│   ├── utils/
│   │   └── jwt.js                   # JWT token utilities
│   ├── server.js                    # Express server setup
│   ├── makeAdmin.js                 # Admin creation utility
│   └── package.json
│
├── frontend/                         # React + Vite application
│   ├── public/                       # Static assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── Footer.jsx            # Application footer
│   │   │   ├── GuestRoute.jsx        # Guest-only route protection
│   │   │   ├── Navbar.jsx            # Navigation bar
│   │   │   ├── ProductCard.jsx       # Product display card
│   │   │   └── ProtectedRoute.jsx    # User route protection
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
│   │   │   └── ProfileContext.jsx    # User profile state
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
│   │   │   └── api.js                # API configuration
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
# Create a .env file with:
# MONGODB_URI=your_mongodb_connection_string
# JWT_SECRET=your_secret_key
# PORT=5000

# Start the server
npm start

# (Optional) Create an admin user
node makeAdmin.js
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Configure API base URL in src/utils/api.js
# Update the API endpoint to match your backend URL

# Start development server
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
  paymentMethod: String (values: "Cash on Delivery" | "UPI" | "Card")
  paymentStatus: String (values: "Pending" | "Paid" | "Failed")
  orderStatus: String (values: "Pending" | "Confirmed" | "Processing" | "Shipped" | "Delivered" | "Cancelled")
  estimatedDelivery: Date (default: current date + 7 days)
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

---

## 📝 Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb://username:password@host:port/database
JWT_SECRET=your_super_secret_key
PORT=5000
```

### Frontend (src/utils/api.js)
```
API_BASE_URL=http://localhost:5000/api
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

## 📄 License

This project is licensed under the MIT License.

---

## 🆘 Support

For issues or questions, please:
1. Check the documentation
2. Review existing issues
3. Create a new issue with detailed description

---

**Last Updated**: May 2026
**Status**: Active Development
