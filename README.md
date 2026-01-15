# MERN E-Commerce Platform

A full-stack e-commerce platform built with **MongoDB**, **Express.js**, **React**, and **Node.js** (MERN stack). This project features a complete shopping experience with product management, user authentication, shopping cart, payment processing, and admin analytics.

## 🌟 Features

### User Features
- **User Authentication**: Sign up and login with secure password handling
- **Product Browsing**: Browse products by categories (t-shirts, jeans, jackets, shoes, suits, glasses, bags, etc.)
- **Product Search**: Advanced search functionality to find products quickly
- **Shopping Cart**: Add/remove products, manage quantities, and persist cart data
- **Wishlist**: Save favorite products for later
- **Product Reviews**: Leave reviews and ratings on products
- **Order Management**: View order history and order details
- **Wishlist Management**: Add/remove products from wishlist
- **User Profile**: Manage user addresses and preferences

### Admin Features
- **Product Management**: Create, edit, and delete products
- **Analytics Dashboard**: View sales analytics, revenue charts, and order statistics
- **Coupon/Gift Code Management**: Create and manage promotional codes
- **Order Management**: View and manage customer orders
- **User Management**: Monitor registered users

### Payment Integration
- **Stripe Payment**: Process payments securely with Stripe
- **PayPal Integration**: Alternative payment option via PayPal
- **Payment Status Tracking**: Track payment status and order confirmations

### Additional Features
- **Email Notifications**: Order confirmations and notifications via email
- **Image Management**: Product images hosted on Cloudinary CDN
- **Caching**: Redis integration for performance optimization
- **Responsive Design**: Mobile-friendly UI with Tailwind CSS

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication tokens
- **Stripe API** - Payment processing
- **PayPal API** - Payment alternative
- **Cloudinary** - Image hosting and CDN
- **Redis** - Caching layer
- **Nodemailer** - Email service

### Frontend
- **React** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling framework
- **Axios** - HTTP client
- **Zustand** - State management
- **React Router** - Client-side routing

## 📁 Project Structure

```
mern-ecommerce/
├── backend/
│   ├── controllers/          # Business logic
│   │   ├── auth.controller.js
│   │   ├── product.controller.js
│   │   ├── cart.controller.js
│   │   ├── order.controller.js
│   │   ├── payment.controller.js
│   │   ├── coupon.controller.js
│   │   ├── review.controller.js
│   │   ├── wishlist.controller.js
│   │   ├── address.controller.js
│   │   ├── search.controller.js
│   │   └── analytics.controller.js
│   ├── models/              # Database schemas
│   │   ├── user.model.js
│   │   ├── product.model.js
│   │   ├── order.model.js
│   │   ├── review.model.js
│   │   ├── coupon.model.js
│   │   └── wishlist.model.js
│   ├── routes/              # API endpoints
│   │   ├── auth.route.js
│   │   ├── product.route.js
│   │   ├── cart.route.js
│   │   ├── payment.route.js
│   │   ├── coupon.route.js
│   │   ├── analytics.route.js
│   │   └── wishlist.route.js
│   ├── middleware/          # Custom middleware
│   │   └── auth.middleware.js
│   ├── lib/                 # External service configurations
│   │   ├── db.js           # Database connection
│   │   ├── cloudinary.js   # Image upload service
│   │   ├── stripe.js       # Stripe configuration
│   │   ├── paypal.js       # PayPal configuration
│   │   ├── redis.js        # Redis cache
│   │   └── email.service.js # Email service
│   └── server.js           # Main server file
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   │   ├── Header.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   ├── ProductsList.jsx
│   │   │   ├── CartItem.jsx
│   │   │   ├── OrderSummary.jsx
│   │   │   ├── CreateProductForm.jsx
│   │   │   ├── AnalyticsTab.jsx
│   │   │   ├── FeaturedProducts.jsx
│   │   │   ├── GiftCouponCard.jsx
│   │   │   ├── CategoryItem.jsx
│   │   │   ├── PeopleAlsoBought.jsx
│   │   │   └── LoadingSpinner.jsx
│   │   ├── pages/           # Page components
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── SignUpPage.jsx
│   │   │   ├── ProductPage.jsx
│   │   │   ├── CartPage.jsx
│   │   │   ├── WishlistPage.jsx
│   │   │   ├── CategoryPage.jsx
│   │   │   ├── AdminPage.jsx
│   │   │   ├── PurchaseSuccessPage.jsx
│   │   │   └── PurchaseCancelPage.jsx
│   │   ├── stores/          # Zustand state stores
│   │   │   ├── useCartStore.js
│   │   │   ├── useProductStore.js
│   │   │   ├── useUserStore.js
│   │   │   └── useWishlistStore.js
│   │   ├── lib/
│   │   │   └── axios.js    # Axios configuration
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/             # Static assets
│   │   └── img/           # Product images
│   ├── vite.config.js      # Vite configuration
│   ├── tailwind.config.js  # Tailwind CSS configuration
│   ├── postcss.config.js   # PostCSS configuration
│   └── package.json
│
└── package.json            # Root package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Redis (optional, for caching)
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/eyabouazzi/e-commrce.git
cd e-commrce
```

2. **Install dependencies**
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. **Setup environment variables**

Create `.env` files in both backend and frontend directories:

**Backend `.env`:**
```
MONGO_DB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
STRIPE_SECRET_KEY=your_stripe_secret_key
PAYPAL_CLIENT_ID=your_paypal_client_id
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
REDIS_URL=your_redis_url
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_password
```

**Frontend `.env`:**
```
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
```

4. **Run the application**

```bash
# From root directory - run both backend and frontend
npm run dev

# Or separately:
# Backend (from backend directory)
npm start

# Frontend (from frontend directory)
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## 📚 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)
- `GET /api/products/search/:query` - Search products

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add item to cart
- `DELETE /api/cart/remove/:productId` - Remove item from cart

### Orders & Payments
- `POST /api/payment/create-stripe-session` - Create Stripe checkout
- `POST /api/payment/create-paypal-session` - Create PayPal checkout
- `GET /api/orders` - Get user orders

### Wishlist
- `GET /api/wishlist` - Get user wishlist
- `POST /api/wishlist/add` - Add to wishlist
- `DELETE /api/wishlist/remove/:productId` - Remove from wishlist

### Coupons
- `GET /api/coupons` - Get available coupons
- `POST /api/coupons` - Create coupon (admin only)
- `POST /api/coupons/validate` - Validate coupon

### Analytics (Admin)
- `GET /api/analytics/dashboard` - Get dashboard analytics
- `GET /api/analytics/sales` - Get sales data

## 🔐 Authentication

The application uses JWT (JSON Web Tokens) for authentication. Users receive a token upon login that must be included in the `Authorization` header for protected routes.

## 💳 Payment Processing

- **Stripe**: Process credit/debit card payments
- **PayPal**: Alternative payment method

Payment verification and order confirmation are handled automatically.

## 📧 Email Notifications

Users receive email notifications for:
- Order confirmation
- Order status updates
- Password reset requests

## 🎨 Styling

The frontend uses **Tailwind CSS** for styling, providing a modern and responsive user interface.

## 🚦 Status Codes

- `200` - Successful request
- `201` - Created successfully
- `400` - Bad request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not found
- `500` - Server error

## 📝 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

**Eya Bouazzi**
- GitHub: [@eyabouazzi](https://github.com/eyabouazzi)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For any questions or support, please reach out via GitHub issues.

---

**Happy Shopping! 🛒**
