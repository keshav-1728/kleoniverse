# Fashion E-Commerce Platform - Architecture Documentation

## Project Overview

This is a scalable fashion e-commerce platform similar to Myntra, built with a decoupled (double) architecture where frontend and backend are completely separate projects.

---

## Architecture Overview

### Decoupled Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  React + Vite + Tailwind CSS + Shadcn UI                   │
│  Hosted on: Hostinger Premium (Static Hosting)             │
│                                                              │
│  - Pages (Home, Product Listing, Product Detail, Cart)     │
│  - Components (Navbar, Footer, ProductCard, FilterPanel)  │
│  - Services (API handler)                                  │
│  - Hooks (Custom React hooks)                              │
│  - Context (State management)                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ REST API (HTTP/HTTPS)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        BACKEND                               │
│  Node.js + Express + Supabase (PostgreSQL)                │
│  Hosted on: Render / VPS                                   │
│                                                              │
│  - Routes (API endpoints)                                  │
│  - Controllers (Business logic)                            │
│  - Middleware (Auth, Validation, Error handling)           │
│  - Models (Database schemas) - via Supabase               │
│  - Utils (Helper functions)                                │
└─────────────────────────────────────────────────────────────┘
```

---

## Folder Structure

### Backend Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js         # Database configuration
│   │   └── supabase.js         # Supabase client configuration
│   ├── controllers/
│   │   ├── auth.controller.js      # Authentication logic
│   │   ├── product.controller.js   # Product management
│   │   ├── cart.controller.js      # Shopping cart
│   │   ├── order.controller.js     # Order processing
│   │   ├── wishlist.controller.js  # Wishlist management
│   │   ├── user.controller.js      # User profile
│   │   ├── address.controller.js   # Address management
│   │   └── admin.controller.js     # Admin dashboard
│   ├── middleware/
│   │   ├── auth.js             # JWT authentication
│   │   ├── validate.js         # Request validation
│   │   └── errorHandler.js    # Error handling
│   ├── models/
│   │   └── (Database schemas via Supabase)
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── product.routes.js
│   │   ├── cart.routes.js
│   │   ├── order.routes.js
│   │   ├── wishlist.routes.js
│   │   ├── user.routes.js
│   │   ├── address.routes.js
│   │   └── admin.routes.js
│   ├── utils/
│   │   └── response.js         # Response formatter
│   └── server.js               # Main entry point
├── supabase/
│   ├── schema.sql              # Database schema
│   ├── test-data.sql           # Sample data
│   └── ...
├── package.json
├── .env                        # Environment variables
└── .env.example                # Environment template
```

### Frontend Structure

```
frontend/
├── public/
│   └── index.html              # HTML template
├── src/
│   ├── components/
│   │   ├── ui/                # Shadcn UI components
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── ProductCard.jsx
│   │   ├── FilterPanel.jsx
│   │   ├── CartDrawer.jsx
│   │   └── ...
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── ProductListingPage.jsx
│   │   ├── ProductDetailPage.jsx
│   │   ├── CartPage.jsx
│   │   ├── CheckoutPage.jsx
│   │   ├── WishlistPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── OrderTrackingPage.jsx
│   │   ├── AccountDashboardPage.jsx
│   │   └── admin/
│   │       ├── AdminDashboardPage.jsx
│   │       ├── AdminProductsPage.jsx
│   │       ├── AdminOrdersPage.jsx
│   │       └── AdminUsersPage.jsx
│   ├── services/
│   │   ├── api.js             # API handler (Axios)
│   │   └── supabaseService.js # Supabase client
│   ├── hooks/
│   │   └── use-toast.js       # Toast notifications
│   ├── context/
│   │   └── (State management)
│   ├── lib/
│   │   ├── supabase.js        # Supabase client
│   │   └── utils.js           # Utility functions
│   ├── data/
│   │   └── mockData.js        # Mock data for development
│   ├── App.js                 # Main App component
│   ├── index.js               # Entry point
│   └── index.css              # Global styles
├── package.json
├── .env                       # Environment variables
├── tailwind.config.js
├── craco.config.js
└── ...
```

---

## API Endpoints

### Authentication (`/api/v1/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | No |
| POST | `/login` | User login | No |
| POST | `/logout` | User logout | Yes |
| GET | `/me` | Get current user | Yes |
| POST | `/refresh-token` | Refresh JWT token | No |
| POST | `/forgot-password` | Request password reset | No |
| POST | `/reset-password` | Reset password | Yes |

### Products (`/api/v1/products`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all products (with filters) | No |
| GET | `/featured` | Get featured products | No |
| GET | `/new-arrivals` | Get new arrivals | No |
| GET | `/best-sellers` | Get best sellers | No |
| GET | `/categories` | Get all categories | No |
| GET | `/brands` | Get all brands | No |
| GET | `/:id` | Get product by ID | No |
| GET | `/:id/related` | Get related products | No |
| POST | `/` | Create product (Admin) | Yes (Admin) |
| PUT | `/:id` | Update product (Admin) | Yes (Admin) |
| DELETE | `/:id` | Delete product (Admin) | Yes (Admin) |

### Cart (`/api/v1/cart`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get user's cart | Yes |
| POST | `/` | Add item to cart | Yes |
| PUT | `/:itemId` | Update cart item | Yes |
| DELETE | `/:itemId` | Remove item from cart | Yes |
| DELETE | `/` | Clear cart | Yes |

### Orders (`/api/v1/orders`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get user's orders | Yes |
| GET | `/:id` | Get order by ID | Yes |
| POST | `/` | Create new order | Yes |
| PUT | `/:id/cancel` | Cancel order | Yes |
| PUT | `/:id/status` | Update order status | Yes (Admin) |

### Wishlist (`/api/v1/wishlist`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get user's wishlist | Yes |
| POST | `/` | Add to wishlist | Yes |
| DELETE | `/:productId` | Remove from wishlist | Yes |

### User (`/api/v1/users`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/profile` | Get user profile | Yes |
| PUT | `/profile` | Update profile | Yes |
| PUT | `/avatar` | Update avatar | Yes |

### Address (`/api/v1/addresses`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all addresses | Yes |
| POST | `/` | Add new address | Yes |
| PUT | `/:id` | Update address | Yes |
| DELETE | `/:id` | Delete address | Yes |
| PUT | `/:id/default` | Set default address | Yes |

### Admin (`/api/v1/admin`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard` | Get dashboard stats |
| GET | `/products` | Get all products (Admin) |
| POST | `/products` | Create product |
| PUT | `/products/:id` | Update product |
| DELETE | `/products/:id` | Delete product |
| GET | `/orders` | Get all orders |
| PUT | `/orders/:id/status` | Update order status |
| GET | `/users` | Get all users |
| PUT | `/users/:id/role` | Update user role |
| POST | `/categories` | Create category |
| PUT | `/categories/:id` | Update category |
| DELETE | `/categories/:id` | Delete category |
| POST | `/brands` | Create brand |
| PUT | `/brands/:id` | Update brand |
| DELETE | `/brands/:id` | Delete brand |

---

## Environment Variables

### Backend (.env)

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT Configuration
JWT_SECRET=your-jwt-secret-key

# CORS
CORS_ORIGIN=http://localhost:3000

# Frontend URL (for password reset)
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)

```env
REACT_APP_API_URL=http://localhost:5000/api/v1
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

---

## Dependencies

### Backend Dependencies

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.97.0",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "express-validator": "^7.0.1",
    "jsonwebtoken": "^9.0.2",
    "morgan": "^1.10.0",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "eslint": "^8.56.0",
    "nodemon": "^3.0.2"
  }
}
```

### Frontend Dependencies

```json
{
  "dependencies": {
    "@radix-ui/react-*": "latest",
    "axios": "^1.8.4",
    "clsx": "^2.1.1",
    "date-fns": "^4.1.0",
    "lucide-react": "^0.507.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-hook-form": "^7.56.2",
    "react-router-dom": "^7.5.1",
    "recharts": "^3.6.0",
    "tailwind-merge": "^3.2.0",
    "zod": "^3.24.4"
  }
}
```

---

## Development Workflow

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (for database)

### Setup Backend

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your Supabase credentials

# Start development server
npm run dev
```

### Setup Frontend

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your API URL and Supabase credentials

# Start development server
npm start
```

### Database Setup

1. Create a new project on Supabase
2. Run the SQL schema from `backend/supabase/schema.sql`
3. Add sample data from `backend/supabase/test-data.sql`
4. Update environment variables with your Supabase credentials

---

## Deployment

### Backend (Render/Railway/VPS)

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Frontend (Hostinger)

```bash
# Build static files
npm run build

# Upload the 'build' folder to Hostinger
# Configure custom domain (optional)
```

---

## Features Implemented

### User Features
- [x] User registration and login
- [x] JWT authentication
- [x] Product browsing with filters
- [x] Search functionality
- [x] Shopping cart
- [x] Wishlist
- [x] Order placement and tracking
- [x] Address management
- [x] User profile management

### Admin Features
- [x] Admin dashboard with statistics
- [x] Product management (CRUD)
- [x] Order management
- [x] User management
- [x] Category management
- [x] Brand management

### Technical Features
- [x] RESTful API
- [x] Role-based access control
- [x] Request validation
- [x] Error handling
- [x] Pagination
- [x] JWT token refresh

---

## License

MIT License
