# KleoniVerse - Fashion E-Commerce Platform

A scalable fashion e-commerce platform built with decoupled (double) architecture.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND                               │
│  React + Vite + TypeScript + Tailwind CSS + Radix UI       │
│  Hosted on: Hostinger Premium (Static Hosting)             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    REST API (External)
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       BACKEND                               │
│  Node.js + Express + PostgreSQL + Sequelize                 │
│  Hosted on: Render / VPS                                    │
└─────────────────────────────────────────────────────────────┘
```

## 📂 Project Structure

### Backend (`/backend`)

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # Database configuration
│   ├── controllers/             # Business logic
│   │   ├── auth.controller.js
│   │   ├── product.controller.js
│   │   ├── cart.controller.js
│   │   ├── order.controller.js
│   │   ├── wishlist.controller.js
│   │   └── user.controller.js
│   ├── middleware/             # Express middleware
│   │   ├── auth.js             # JWT authentication
│   │   ├── errorHandler.js     # Error handling
│   │   └── notFound.js        # 404 handler
│   ├── models/                 # Database models
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Cart.js
│   │   ├── Order.js
│   │   ├── Wishlist.js
│   │   └── index.js
│   ├── routes/                 # API routes
│   │   ├── auth.routes.js
│   │   ├── product.routes.js
│   │   ├── cart.routes.js
│   │   ├── order.routes.js
│   │   ├── wishlist.routes.js
│   │   └── user.routes.js
│   └── server.js               # Entry point
├── package.json
└── .env.example
```

### Frontend (`/frontend`)

```
frontend/
├── src/
│   ├── components/             # Reusable UI components
│   │   └── ui/                 # Base UI components (Radix)
│   ├── context/                # State management
│   │   ├── AuthContext.tsx
│   │   ├── CartContext.tsx
│   │   └── WishlistContext.tsx
│   ├── hooks/                  # Custom hooks (ready for use)
│   ├── pages/                  # Page components
│   ├── services/               # API services
│   │   └── api.ts              # Axios API handler
│   ├── data/                   # Mock data (if needed)
│   ├── lib/                    # Utilities
│   ├── App.js
│   └── index.js
├── public/
├── package.json
├── .env.example
├── tailwind.config.js
└── craco.config.js
```

## 📦 Dependencies

### Backend Dependencies
```json
{
  "express": "^4.18.2",
  "sequelize": "^6.35.2",
  "pg": "^8.11.3",
  "jsonwebtoken": "^9.0.2",
  "bcryptjs": "^2.4.3",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1",
  "express-validator": "^7.0.1",
  "morgan": "^1.10.0",
  "uuid": "^9.0.1"
}
```

### Frontend Dependencies
```json
{
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "react-router-dom": "^7.5.1",
  "axios": "^1.8.4",
  "@radix-ui/react-*": "...",
  "tailwindcss": "^3.4.17",
  "lucide-react": "^0.507.0"
}
```

## 🔐 Environment Variables

### Backend (`.env`)
```env
# Server
NODE_ENV=development
PORT=5000

# Database (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=socialhood
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Frontend (`.env`)
```env
REACT_APP_API_URL=http://localhost:5000/api/v1
REACT_APP_ENV=development
```

## 🚀 Development Workflow

### 1. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Update .env with your database credentials

# Run development server
npm run dev
```

### 2. Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Run development server
npm start
```

### 3. Database Setup

1. Install PostgreSQL
2. Create database: `CREATE DATABASE socialhood;`
3. Tables will be auto-created by Sequelize on first run



## 🔑 Roles

- **User**: Regular customers
- **Admin**: Can manage products, view all orders, access dashboard

## 💳 Payment Integration

Payments are NOT connected yet. To integrate:
1. Add Razorpay/Stripe keys to frontend
2. Create payment endpoint in backend
3. Update order creation flow

## 🌍 Deployment

### Backend (Render/Railway/VPS)

### Frontend (Hostinger Premium)

### Common Errors

- **EADDRINUSE**: Port already in use - kill the process or use a different port
- **MODULE_NOT_FOUND**: Missing dependencies - run `npm install`
- **Connection refused**: Backend not running - start backend first

## � Notes

- This is a skeleton project with NO UI built yet
- All data fetching is via external API calls
- Ready to connect to backend via `BASE_URL`
- Role-based access control implemented
- JWT authentication ready
