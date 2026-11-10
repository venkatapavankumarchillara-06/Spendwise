# SpendWise – Personal Expense Tracker & Financial Analytics

SpendWise is a full-stack MERN (MongoDB, Express, React, Node.js) personal financial management platform built for individuals, freelancers, and families. It provides real-time transaction tracking, automated monthly budget calculations, and interactive visualizations.

---

## 🌟 Key Features

- **Robust Authentication & Authorization**:
  - Secure signup and login with one-way `bcryptjs` password hashing (salt factor 10).
  - JWT authentication delivered via HTTP-only secure cookies and standard `Authorization: Bearer` headers.
  - Multi-tenant data isolation: users can strictly view and modify only their own financial data.
  - Rate limiting on authentication routes to mitigate brute force attempts.

- **Dynamic Financial Dashboard**:
  - Financial KPI cards: Total Net Balance, Monthly Income, Monthly Expense, and Monthly Savings.
  - Dynamic Month/Year filters recalculating metrics from MongoDB data without page reloads.
  - 6-month historical Income vs. Expense visual trend using Recharts.
  - Real-time Category Breakdown donut chart.
  - Recent transactions list with quick-add modal.

- **Full-featured Transaction Management (CRUD)**:
  - Add, edit, delete, and view income and expense records.
  - Keyword search across titles, descriptions, and categories.
  - Filters: Transaction Type (Income/Expense), Category, and Custom Date Range.
  - Multi-column sorting (date, amount) and server-side pagination.
  - Modals and confirmation dialogs for destructive actions.

- **Category-Specific Budget Management**:
  - Set monthly spending limits per expense category (Food, Bills, Shopping, Transportation, etc.).
  - Automatic calculation of actual spent, remaining buffer, and percentage utilization directly from expense records.
  - Visual status alerts: **Normal** (<80%), **Warning** (80%–99%), and **Exceeded** (≥100%).

- **Dedicated Analytics & Visualization Suite**:
  - 12-month annual overview of income, expenses, and net savings.
  - Trajectory line charts for savings growth.
  - Top 5 spending categories ranked by volume.
  - Payment method breakdown (UPI, Credit Card, Cash, Net Banking, Debit Card).

- **Personal Profile & Customization**:
  - Update user name, email (with duplicate checks), and display currency (₹ INR, $ USD, € EUR, £ GBP).
  - Change password with verification of the current password.
  - Toggle between Light and Dark mode (persisted to localStorage).

---

## 🛠️ Technology Stack

| Component | Technology |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS, React Router DOM v7, Axios, Context API, Recharts, Lucide React |
| **Backend** | Node.js (v22+), Express.js (v4.21), Mongoose (v8.9) |
| **Security** | Helmet, CORS, Express Rate Limit, Cookie-Parser, bcryptjs, jsonwebtoken |
| **Database** | MongoDB Atlas / Local MongoDB Server |

---

## 📁 Project Architecture

```
Spendwise/
├── client/                     # Frontend React (Vite) Application
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # Modal, ConfirmDialog, LoadingSpinner, EmptyState
│   │   │   ├── layout/         # Layout, Navbar, Sidebar, ProtectedRoute
│   │   │   ├── transactions/   # TransactionModal
│   │   │   └── budgets/        # BudgetModal
│   │   ├── context/            # AuthContext, ThemeContext, ToastContext
│   │   ├── pages/              # Dashboard, Transactions, Budgets, Analytics, Profile, Login, Register
│   │   ├── services/           # Axios instance with credentials
│   │   ├── utils/              # Currency and date formatters
│   │   ├── App.jsx             # Route definitions and layout wrapper
│   │   ├── main.jsx            # React root mount
│   │   └── index.css           # Tailwind CSS directives & custom themes
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── server/                     # Backend Node / Express REST API
│   ├── config/                 # MongoDB Mongoose connection
│   ├── controllers/            # Auth, Transaction, Budget, and Analytics controllers
│   ├── middleware/             # Auth guard (protect), Rate limiter, Error handler
│   ├── models/                 # User, Transaction, and Budget Mongoose models
│   ├── routes/                 # Express route definitions
│   ├── utils/                  # Token response generator & cookie handler
│   ├── server.js               # Express application entrypoint
│   ├── test_e2e.js             # Comprehensive integration test suite
│   ├── .env.example
│   └── package.json
│
├── package.json                # Root automation scripts
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local service or MongoDB Atlas cluster)

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/<your-username>/spendwise.git
cd spendwise

# Install root, backend, and frontend dependencies
npm run install:all
```

Or install separately:
```bash
cd server && npm install
cd ../client && npm install
```

---

### 2. Configure Environment Variables

#### Backend (`server/.env`):
Create `server/.env` based on `server/.env.example`:

```env
PORT=5000
NODE_ENV=development

# Database Connection (MongoDB Atlas URI)
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER_URL/spendwise?retryWrites=true&w=majority

# JWT Secret & Expiry
JWT_SECRET=spendwise_super_secure_jwt_secret_key_prod_ready_2026!
JWT_EXPIRE=7d

# Allowed Frontend Client Origin
CLIENT_URL=http://localhost:5173
```

#### Frontend (`client/.env`):
Create `client/.env` based on `client/.env.example`:

```env
VITE_API_URL=http://localhost:5000/api
```

---

### 3. Run the Development Servers

In terminal 1 (start backend API on `http://localhost:5000`):
```bash
npm run server
```

In terminal 2 (start frontend Vite dev server on `http://localhost:5173`):
```bash
npm run client
```

Open `http://localhost:5173` in your browser.

---

### 4. Run Automated End-to-End Tests

To execute the automated 20-point integration test suite:

```bash
npm test
```

This verifies:
1. Server health check
2. User registration
3. Duplicate email prevention
4. User login & token generation
5. Protected route authentication
6. Profile detail updates
7. Income transaction creation
8. Expense transaction creation across categories
9. Monthly budget creation
10. Real-time budget calculation against actual MongoDB records
11. Dashboard financial calculations (Income, Expense, Savings)
12. Strict multi-tenant data isolation (User B cannot read/write User A's data)
13. Keyword search and filters
14. Transaction editing
15. Dynamic budget recalculation after transaction update
16. Transaction deletion
17. User logout & cookie invalidation

---

## 📡 RESTful API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user account |
| `POST` | `/api/auth/login` | Public | Login user and issue JWT cookie/token |
| `POST` | `/api/auth/logout` | Public | Clear auth cookie |
| `GET` | `/api/auth/me` | Private | Get authenticated user profile |
| `PUT` | `/api/auth/profile` | Private | Update user name, email, currency |
| `PUT` | `/api/auth/password` | Private | Change password with current password verification |

### Transactions (`/api/transactions`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/transactions` | Private | List transactions (supports search, filters, pagination) |
| `POST` | `/api/transactions` | Private | Record new income/expense transaction |
| `GET` | `/api/transactions/categories` | Private | Get list of supported categories & payment methods |
| `GET` | `/api/transactions/:id` | Private | Get single transaction by ID |
| `PUT` | `/api/transactions/:id` | Private | Update transaction |
| `DELETE` | `/api/transactions/:id` | Private | Delete transaction |

### Budgets (`/api/budgets`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/budgets?month=11&year=2026` | Private | List monthly budgets with calculated spending & utilization |
| `POST` | `/api/budgets` | Private | Set or update category monthly limit |
| `PUT` | `/api/budgets/:id` | Private | Edit budget limit |
| `DELETE` | `/api/budgets/:id` | Private | Delete category budget |

### Analytics & Dashboard (`/api/analytics`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/analytics/dashboard?month=11&year=2026` | Private | Get summary cards, 6-month trend, category breakdown |
| `GET` | `/api/analytics?year=2026` | Private | Get 12-month trends, savings rate, top categories |

---

## 🌐 Production Deployment Guide

### Database: MongoDB Atlas
1. Create a free M0 cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a database user with read/write privileges.
3. In Network Access, whitelist `0.0.0.0/0` (allow access from anywhere) or specific Render IP ranges.
4. Obtain connection string in format:
   `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/spendwise?retryWrites=true&w=majority`

### Backend: Render
1. Create a new **Web Service** on [Render](https://render.com/).
2. Connect your GitHub repository.
3. Set **Root Directory** to `server`.
4. Set **Build Command** to `npm install`.
5. Set **Start Command** to `npm start`.
6. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `MONGO_URI`: `<Your MongoDB Atlas URI>`
   - `JWT_SECRET`: `<Random 32+ character string>`
   - `JWT_EXPIRE`: `7d`
   - `CLIENT_URL`: `<Your Vercel Frontend URL>`

### Frontend: Vercel
1. Create a new project on [Vercel](https://vercel.com/).
2. Select your repository.
3. Set **Root Directory** to `client`.
4. Framework Preset: **Vite**.
5. Add Environment Variable:
   - `VITE_API_URL`: `<Your Render Backend URL>/api` (e.g. `https://spendwise-api.onrender.com/api`)
6. Deploy!

---

## 🔒 Security Best Practices Implemented

1. **Password Hashing**: Passwords are never stored in plain text; hashed using `bcryptjs` with salt factor 10.
2. **HTTP-only Cookies**: JWTs are transferred via HTTP-only cookies to eliminate XSS token theft.
3. **Multi-tenant Isolation**: All queries (`find`, `findById`, `updateOne`, `deleteOne`) enforce `userId: req.user._id`.
4. **Helmet Headers**: Standard security headers (X-Frame-Options, DNS Prefetch Control, etc.) applied automatically.
5. **Rate Limiting**: Authentication endpoints are rate-limited to prevent brute force credential attacks.
6. **Input Validation**: Server enforces numeric validation on amounts and limits, prevents duplicate emails, and sanitizes strings.

---

## 📄 License
This project is licensed under the ISC License.

