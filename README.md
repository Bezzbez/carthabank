# 🏦 SecureBank — E-Banking Platform

A full-stack secure E-Banking web application built with:
- **Frontend:** React 19, React Router, React Query, Axios
- **Backend:** Node.js/Express, Sequelize ORM, MySQL 8.0+
- **Security:** JWT authentication, bcryptjs, Helmet.js, Rate Limiting
- **Architecture:** MVC + REST API + Component-based UI

**Status:** ✅ Development Complete | Security Audit Passed | Ready for Testing

> ✨ **Built with pure vibe coding** ✨

---

## 📋 Quick Navigation

- 📝 **[Database Schema](database/schema.sql)** — SQL schema with relationships
- 🧪 **[API Collection](docs/ebanking-api.postman_collection.json)** — Postman requests for all endpoints
- 🎨 **[UML Diagrams](docs/uml/uml-diagrams.html)** — Use case, class, and sequence diagrams

---

## 📐 Project Structure

```
ebanking/
├── backend/
│   ├── src/
│   │   ├── app.js                 # Express entry point
│   │   ├── config/
│   │   │   └── database.js        # Sequelize MySQL config
│   │   ├── controllers/           # Request handlers (5 files)
│   │   ├── middleware/            # Auth, error handling
│   │   ├── models/                # Sequelize models (User, Account, Transaction, OTP)
│   │   ├── routes/                # API routes (5 route files)
│   │   ├── services/
│   │   │   └── otp.service.js     # OTP generation & verification
│   │   └── utils/
│   │       ├── logger.js          # Winston logging
│   │       └── validateEnv.js     # Env config validation ✨ NEW
│   ├── logs/                      # Auto-created logs directory
│   ├── .env.example               # Environment template
│   ├── .gitignore                 # ✨ NEW - prevents credential leaks
│   └── package.json
│
├── react_front/
│   ├── src/
│   │   ├── App.js                 # ✨ UPDATED - Auth routing, error boundary
│   │   ├── context/
│   │   │   └── AuthContext.js     # ✨ NEW - Global auth state
│   │   ├── services/
│   │   │   └── api.js             # ✨ UPDATED - JWT interceptors, all endpoints
│   │   ├── components/
│   │   │   ├── ErrorBoundary.js   # ✨ NEW - Error fallback UI
│   │   │   └── layout/
│   │   │       └── Layout.js
│   │   ├── pages/
│   │   │   ├── LoginPage.js
│   │   │   ├── RegisterPage.js
│   │   │   ├── DashboardPage.js
│   │   │   ├── TransferPage.js
│   │   │   ├── TransactionHistoryPage.js
│   │   │   ├── BillPaymentPage.js
│   │   │   ├── ProfilePage.js
│   │   │   └── AdminDashboardPage.js
│   └── package.json
│
├── database/
│   └── schema.sql                 # MySQL schema with relationships
│
├── docs/
│   ├── ebanking-api.postman_collection.json
│   └── uml/
│       └── uml-diagrams.html
│
├── README.md                      # This file
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+ (download from [nodejs.org](https://nodejs.org/))
- **MySQL** 8.0+ (download from [mysql.com](https://dev.mysql.com/downloads/mysql/))
- **npm** or **yarn**

### 1️⃣ Database Setup

```bash
# Create database and tables
mysql -u root -p < database/schema.sql

# When prompted, enter your MySQL root password
```

### 2️⃣ Backend Setup

```bash
cd backend

# Copy example env file and edit it
cp .env.example .env

# Edit .env with your database credentials and JWT secrets
# REQUIRED: DB_USER, DB_PASSWORD, JWT_SECRET, JWT_REFRESH_SECRET

# Install dependencies
npm install

# Start development server (http://localhost:5000)
npm run dev
```

**What the backend does:**
- Validates all required environment variables on startup
- Connects to MySQL database
- Syncs Sequelize models
- Starts Express API server with security middleware
- Logs all requests and errors to `logs/` directory

### 3️⃣ Frontend Setup

```bash
cd react_front

# Copy example env file
cp .env.example .env

# Verify REACT_APP_API_URL points to backend
# Default: http://localhost:5000/api

# Install dependencies
npm install

# Start React development server (http://localhost:3000)
npm start
```

**What the frontend does:**
- Loads AuthContext (global auth state)
- Sets up JWT interceptors (auto-attach tokens, auto-refresh)
- Protects routes (redirects to /login if not authenticated)
- Provides Error Boundary (catches React errors)

### 4️⃣ Verify It's Working

**Backend:**
```bash
curl http://localhost:5000/api/health
# Response: {"status":"OK","timestamp":"2026-04-23T..."}
```

**Postman:**
- Import `docs/ebanking-api.postman_collection.json`
- Test endpoints with provided requests

**Frontend:**
- Navigate to http://localhost:3000
- Register new account or login
- See dashboard with accounts and transactions

---

## 🔑 Demo Credentials

After running `database/schema.sql`:

| Role   | Email                  | Password     | Purpose |
|--------|------------------------|--------------|---------|
| Client | john.doe@example.com   | Client@1234  | Test client features |
| Admin  | admin@ebank.com        | Admin@1234   | Test admin dashboard |

**To Register:**
1. Go to http://localhost:3000/register
2. Create account with your details
3. Auto-creates a default checking account
4. Login and start using the platform

---

## 🔐 Security Features

### Backend
- ✅ **Helmet.js** → Secure HTTP headers (CSP, X-Frame-Options, HSTS)
- ✅ **CORS** → Restricted to frontend URL only
- ✅ **Rate Limiting** → 100 req/15min global, 10 req/15min for auth
- ✅ **JWT** → Access (1h) + Refresh tokens (7d)
- ✅ **bcryptjs** → 12-round password hashing
- ✅ **Input Validation** → All endpoints use express-validator
- ✅ **RBAC** → Role-based access control (client/admin)
- ✅ **Error Handling** → Global middleware, no stack traces in production
- ✅ **Environment Validation** → Fails fast if config missing

### Frontend
- ✅ **AuthContext** → Global auth state, never loses session on refresh
- ✅ **Protected Routes** → Only authenticated users can access protected pages
- ✅ **JWT Interceptors** → Auto-attach tokens, auto-refresh when expired
- ✅ **Error Boundary** → Catches React crashes, provides fallback UI
- ✅ **Secure Storage** → localStorage for tokens (app-level only)

### Database
- ✅ **UUID Primary Keys** → Prevents ID enumeration attacks
- ✅ **Foreign Key Constraints** → Referential integrity
- ✅ **Unique Indexes** → Prevents duplicate emails, account numbers
- ✅ **Audit Columns** → Track when records were created/modified
- ✅ **SQL Injection Prevention** → Sequelize parameterized queries

---


---

## 🐛 Troubleshooting

### "Cannot find module" errors
```bash
cd backend
npm install

cd ../react_front
npm install
```

### "Connection refused" on database
```bash
# Verify MySQL is running
mysql -u root -p

# Check if database exists
SHOW DATABASES;

# Create if missing
CREATE DATABASE ebanking_db;
```

### CORS errors from frontend
- Check `FRONTEND_URL` in backend `.env` matches your frontend URL
- Verify `REACT_APP_API_URL` in frontend `.env` matches backend URL

### 500 errors from backend
- Check backend console: `npm run dev` should show errors
- Check logs: `cat backend/logs/error.log`
- Verify `.env` variables are all set
- Run `npm audit` to check dependencies

### "Token expired" messages
- This is normal! Frontend auto-refreshes with refresh token
- If auto-refresh doesn't work, login again
- Check JWT_REFRESH_SECRET is set in backend `.env`

More troubleshooting: [TECHNICAL_DOCUMENTATION.md#troubleshooting](TECHNICAL_DOCUMENTATION.md#troubleshooting)

---

## 📊 Database Schema

The database includes 4 main tables:

**Users** — Bank customers and admins
- Stores credentials, profile info, roles
- Passwords hashed with bcryptjs
- Tracks last login

**Accounts** — Checking, savings, credit accounts
- One user can have multiple accounts
- Tracks balance, type, currency
- Auto-assigned account number

**Transactions** — All money transfers and bill payments
- Tracks from/to account, amount, timestamp
- Status: pending, completed, failed, reversed
- Includes bill payment details

**OTP** — One-time passwords for high-risk operations
- Used for verify email during registration
- Expires after 60 seconds
- Prevents unauthorized access

Schema SQL: [database/schema.sql](database/schema.sql)

---

## 📈 Development Workflow

### Running Locally (3 terminals)

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd react_front
npm start
```

**Terminal 3 — Database (optional, just monitor):**
```bash
# If using MySQL workbench, keep it open or:
mysql -u root -p ebanking_db
SHOW TABLES;
SELECT * FROM users;
```

### Adding New Features

1. **Database Change** → Update model in `backend/src/models/`, restart server (auto-synced in dev)
2. **Backend Logic** → Create controller + route
3. **API Call** → Add method in `react_front/src/services/api.js`
4. **Frontend UI** → Create page component with useAuth hook
5. **Test** → Use Postman or manual testing

### Debugging Tips

```bash
# View backend logs
tail -f backend/logs/*.log

# Check frontend errors (browser DevTools)
F12 → Console tab

# Test API endpoint directly
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/users/profile

# Check database
mysql -u root -p ebanking_db
SELECT * FROM users WHERE email = 'john.doe@example.com';
```

---

## 🚢 Production Deployment

### Before Deploying

1. **Generate strong JWT secrets:**
   ```bash
   openssl rand -base64 32  # Do twice for JWT_SECRET and JWT_REFRESH_SECRET
   ```

2. **Update `.env` for production:**
   ```
   NODE_ENV=production
   DB_HOST=your-rds-endpoint.amazonaws.com
   JWT_SECRET=your-strong-secret-here
   FRONTEND_URL=https://yourapp.com
   ```

3. **Create database backups**

4. **Enable HTTPS/SSL** (essential for banking)


### Deployment Steps

**Option 1: Docker** (recommended)
```bash
docker-compose up
```

**Option 2: Cloud (AWS, DigitalOcean, Heroku)**
- Deploy backend to cloud platform
- Deploy frontend to CDN (Vercel, Netlify)
- Use managed MySQL (RDS, Heroku Postgres)
- Set environment variables via platform UI

**Option 3: Manual Server**
- Use PM2 to manage Node.js process
- Use Nginx as reverse proxy
- Enable SSL with Let's Encrypt certbot

---

## 📞 Support

- 📝 **API Requests** → `docs/ebanking-api.postman_collection.json`
- 🎨 **Architecture Diagrams** → `docs/uml/uml-diagrams.html`

---

## ✅ Recent Updates (2026-04-23)

### What's Working 🟢
- ✅ User registration and login
- ✅ JWT authentication with auto-refresh
- ✅ Protected routes with role-based access
- ✅ Account management
- ✅ Money transfers
- ✅ Bill payments
- ✅ Transaction history
- ✅ Admin dashboard
- ✅ Error handling and logging
- ✅ Rate limiting and security headers

---

## 📄 License

This project is proprietary E-Banking software. All rights reserved.

---

Last Updated: **April 23, 2026**  
Version: **1.0.0**  
Status: **Development ✅ | Testing 🟡 | Production 🔴**


```bash
cd frontend
cp .env.example .env        # Set REACT_APP_API_URL
npm install
npm start                   # Starts on http://localhost:3000
```

---

## 🔑 Demo Credentials

| Role   | Email                    | Password     |
|--------|--------------------------|--------------|
| Client | john.doe@example.com     | Client@1234  |
| Admin  | admin@ebank.com          | Admin@1234   |

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint              | Description          | Auth |
|--------|-----------------------|----------------------|------|
| POST   | /api/auth/register    | Register new client  | No   |
| POST   | /api/auth/login       | Login + get tokens   | No   |
| POST   | /api/auth/refresh     | Refresh access token | No   |
| GET    | /api/auth/me          | Get current user     | Yes  |

### Users
| Method | Endpoint              | Description          | Auth |
|--------|-----------------------|----------------------|------|
| GET    | /api/users/dashboard  | Dashboard data       | Yes  |
| GET    | /api/users/profile    | Get profile          | Yes  |
| PUT    | /api/users/profile    | Update profile       | Yes  |
| PUT    | /api/users/password   | Change password      | Yes  |

### Accounts
| Method | Endpoint              | Description          | Auth |
|--------|-----------------------|----------------------|------|
| GET    | /api/accounts         | List accounts        | Yes  |
| GET    | /api/accounts/:id     | Account + txns       | Yes  |
| POST   | /api/accounts         | Open new account     | Yes  |

### Transactions
| Method | Endpoint                        | Description       | Auth |
|--------|---------------------------------|-------------------|------|
| POST   | /api/transactions/otp/request   | Request OTP       | Yes  |
| POST   | /api/transactions/transfer      | Transfer + OTP    | Yes  |
| POST   | /api/transactions/bill-payment  | Pay bill + OTP    | Yes  |
| GET    | /api/transactions               | Transaction hist. | Yes  |

### Admin (admin role only)
| Method | Endpoint                       | Description           |
|--------|--------------------------------|-----------------------|
| GET    | /api/admin/stats               | System statistics     |
| GET    | /api/admin/users               | All users (paginated) |
| PUT    | /api/admin/users/:id/status    | Toggle user status    |
| GET    | /api/admin/transactions        | All transactions      |

---

## 🔐 Security Features

| Feature              | Implementation                                      |
|----------------------|-----------------------------------------------------|
| Password hashing     | bcryptjs (12 salt rounds)                           |
| JWT Authentication   | Access token (1h) + Refresh token (7d)              |
| 2FA / OTP            | 6-digit, 60s expiry, 3 attempt max                  |
| Rate limiting        | 100 req/15min global, 10 req/15min on auth routes   |
| HTTP Security        | Helmet (CSP, HSTS, X-Frame, etc.)                   |
| CORS                 | Restricted to frontend origin                       |
| Atomic transfers     | Sequelize transactions + row-level DB locking       |
| Role-based access    | Admin / Client RBAC via JWT claims                  |
| Error sanitization   | Generic messages to prevent info leakage            |
| Logging              | Winston — structured logs to files + console        |

---

## 📊 SCRUM Sprints

| Sprint   | Focus                          | Deliverables                            |
|----------|--------------------------------|-----------------------------------------|
| Sprint 0 | Design & Architecture          | UML diagrams, DB schema, project setup  |
| Sprint 1 | Authentication System          | Register, Login, JWT, OTP               |
| Sprint 2 | Account Management             | Accounts CRUD, Dashboard, Profile       |
| Sprint 3 | Transactions                   | Transfer, Bill Payment, History         |
| Sprint 4 | Security & Optimization        | Rate limiting, logging, error handling  |

---

## 🗄️ Database Schema

```
users         — id, first_name, last_name, email, password, role, is_active
accounts      — id, account_number, type, balance, currency, user_id (FK)
transactions  — id, reference, type, amount, status, from_account_id, to_account_id
otps          — id, user_id, code, purpose, expires_at, is_used, attempts
```

---

## 📮 Postman

Import `docs/ebanking-api.postman_collection.json` into Postman.

1. Run **Login** — tokens are auto-saved to collection variables
2. Run **List My Accounts** — account ID auto-saved
3. Run **Step 1 — Request OTP**, check server console for code
4. Run **Step 2 — Transfer Money** with the OTP code

---

## 🎨 UML Diagrams

Open `docs/uml/uml-diagrams.html` in any browser to view:
- Use Case Diagram (Client + Admin actors)
- Class Diagram (User, Account, Transaction, OTP)
- Sequence Diagram (Money Transfer with 2FA)
- MVC Architecture Diagram
