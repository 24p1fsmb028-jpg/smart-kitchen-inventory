# 🍳 Smart Kitchen Inventory — Complete Project & Architecture Guide
> **Note for AI Assistants:** This document is the single source of truth for the Smart Kitchen Inventory codebase. You can understand the entire project, its architecture, credentials, business rules, database schema, API contracts, and coding patterns directly from this file without needing prior conversation context.

---

## 📑 Table of Contents
1. [Executive Summary & Tech Stack](#1-executive-summary--tech-stack)
2. [Credentials, Roles & Secrets](#2-credentials-roles--secrets)
3. [Repository & Directory Structure](#3-repository--directory-structure)
4. [Database Schema (Supabase PostgreSQL)](#4-database-schema-supabase-postgresql)
5. [Complete API Specification](#5-complete-api-specification)
6. [Frontend Architecture & Routing](#6-frontend-architecture--routing)
7. [Admin Control Center (Deep Dive)](#7-admin-control-center-deep-dive)
8. [Business Logic & Mathematical Models](#8-business-logic--mathematical-models)
9. [Local Development & Deployment Guide](#9-local-development--deployment-guide)
10. [Vercel Production Deployment](#10-vercel-production-deployment)
11. [Critical Rules & Guidelines for Future AI Assistants](#11-critical-rules--guidelines-for-future-ai-assistants)
12. [Developer Playbook & Recipes](#12-developer-playbook--recipes)

---

## 1. Executive Summary & Tech Stack

**Smart Kitchen Inventory** is a cloud-synchronized kitchen inventory and stock forecasting application designed for modern households. It enables families to track pantry items, receive proactive restock alerts before essential ingredients run out, auto-generate shopping lists divided by urgency, and allows administrators to oversee customer accounts, security credentials, and live telemetry.

### Core Technologies
| Layer | Technology | Details |
|---|---|---|
| **Frontend** | React 18 (Vite) | Single Page Application running on port `3000` |
| **Styling** | Tailwind CSS + Vanilla CSS | Dark theme by default, modern glassmorphic cards |
| **Icons** | Lucide React | Modern feather-inspired SVG icon system |
| **Backend** | Node.js (Express) | RESTful API server running on port `5000`; Vercel Serverless Functions on production |
| **Database** | Supabase (PostgreSQL) | Remote managed PostgreSQL pooler in Tokyo (`ap-northeast-1`) |
| **State Management** | React Context API | `AuthContext` with persistent `localStorage` session |
| **Source Repo** | GitHub | `https://github.com/24p1fsmb028-jpg/smart-kitchen-inventory` (branch: `main`) |
| **Live Deployment** | Vercel | `https://smart-kitchen-inventory-lyart.vercel.app` — auto-deploys from GitHub `main` |

---

## 2. Credentials, Roles & Secrets

### User Roles & Accounts
There are two user roles: `admin` and `customer`.

#### Master Admin Account
- **Email:** `24p1fsmb028@concordia.edu.pk`
- **Password:** `bilal`
- **Role:** `admin`
- **Phone:** `03270220077`
- **Primary View:** Admin Master Control (`/admin`)

#### Demo Customer Account
- **Email:** `customer@smartkitchen.io`
- **Password:** `user123`
- **Role:** `customer`
- **Kitchen Name:** `Demo Family Kitchen`
- **Primary View:** Kitchen Dashboard (`/dashboard`)

### Supabase Connection Details
- **Project ID:** `nqmptcvfloejromioqog`
- **Region:** `ap-northeast-1` (Tokyo, Japan)
- **Supabase URL:** `https://nqmptcvfloejromioqog.supabase.co`
- **Pooler Host:** `aws-0-ap-northeast-1.pooler.supabase.com`
- **Pooler Port:** `6543`
- **Connection URI:** `postgresql://postgres.nqmptcvfloejromioqog:[DB_PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres`
- **Anon Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xbXB0Y3ZmbG9lanJvbWlvcW9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1OTEyNDIsImV4cCI6MjEwMzE2NzI0Mn0.wm7kLBD1oURG1_jgHsJwJJFlaol4ucxc4VqXcVCB4To`

### Security & Password Storage Model
- **Dual-Storage Architecture:** Passwords are stored in two forms:
  1. `password_hash`: SHA-256 with salt `'ski_salt_2024'` for server authentication.
  2. `password_plain`: Plaintext password string for the Admin Control Center viewer.
- **Hashing Formula:**
```javascript
const hashPassword = (password) =>
  crypto.createHash('sha256').update(password + 'ski_salt_2024').digest('hex');
```
- **WhatsApp Support Link:** `https://wa.me/923270220077`

---

## 3. Repository & Directory Structure

```
e:\react-apps\
├── api/                                        <- Vercel Serverless Function Entrypoints
│   ├── index.js                                <- Primary handler: exports Express app directly
│   └── [...path].js                            <- Catch-all handler for nested API routes
│
├── client/                                     <- React 18 + Vite Frontend Application
│   ├── index.html                              <- HTML5 Shell with meta tags
│   ├── vite.config.js                          <- Vite config (port 3000, proxy /api -> localhost:5000)
│   ├── package.json                            <- Frontend dependencies & scripts
│   └── src/
│       ├── main.jsx                            <- React DOM root with BrowserRouter & AuthProvider
│       ├── App.jsx                             <- Master router with PrivateRoute & AdminRoute
│       ├── context/
│       │   ├── AuthContext.jsx                 <- Auth provider, session restore, login, logout, submitRequest
│       │   ├── InventoryContext.jsx            <- Global inventory state: categories, items, stats, CRUD actions
│       │   └── ToastContext.jsx                <- Toast notification system
│       ├── services/
│       │   ├── api.js                          <- Centralized client fetch wrapper with error handling
│       │   └── superstorePdfService.js         <- PDF generation for shopping lists (Pakistani superstore format)
│       ├── pages/
│       │   ├── PublicShowcasePage.jsx          <- Landing page (/) with features, demo card, and WhatsApp CTA
│       │   ├── LoginPage.jsx                   <- Clean login page (/login) with email and password form
│       │   ├── AdminDashboardPage.jsx          <- Admin Master Control (/admin) with 4 tabs & telemetry
│       │   ├── DashboardPage.jsx               <- Customer overview (/dashboard) with health stats
│       │   ├── AllInventoryPage.jsx            <- Full inventory list (/inventory) with add/edit/delete
│       │   ├── CategoryInventoryPage.jsx       <- Category-filtered inventory (/category/:categoryId)
│       │   ├── ShoppingListPage.jsx            <- Auto-partitioned shopping list (/shopping-list)
│       │   ├── PurchaseScannerPage.jsx         <- AI Purchase List Scanner (/purchase-scanner)
│       │   ├── AlertsPage.jsx                  <- Alerts notification center (/alerts)
│       │   └── SettingsPage.jsx                <- Pantry settings & profile preferences (/settings)
│       └── components/
│           ├── auth/
│           │   └── RegisterRequestModal.jsx    <- Signup request modal with WhatsApp expediting
│           ├── common/
│           │   ├── StatCard.jsx                <- Dashboard stat card widget
│           │   ├── CategoryTile.jsx            <- Category grid card with item count
│           │   ├── ItemRow.jsx                 <- Inventory row with restock tick + status pill
│           │   ├── ItemModal.jsx               <- Add/edit item modal form
│           │   ├── CategoryModal.jsx           <- Add/edit category modal form
│           │   └── DeleteConfirmModal.jsx      <- Deletion confirmation dialog
│           └── layout/
│               ├── Navbar.jsx                  <- Top navbar with active kitchen, role tag, and logout
│               ├── Sidebar.jsx                 <- Desktop left sidebar with role-aware routes
│               ├── MobileNav.jsx               <- Bottom fixed mobile navigation bar
│               └── AlertBanner.jsx             <- Contextual alert banner for low/out-of-stock counts
│
├── server/                                     <- Node.js + Express Backend Server
│   ├── app.js                                  <- Express app factory: middlewares, routes, DB middleware
│   ├── index.js                                <- Local server entry: imports app.js and calls listen(5000)
│   ├── .env                                    <- Secret environment variables (ignored by Git)
│   ├── .env.example                            <- Reference configuration template
│   ├── db/
│   │   ├── schema.sql                          <- PostgreSQL schema with all 7 tables and indexes
│   │   ├── seedData.js                         <- Realistic initial categories, items, and users
│   │   └── db.js                               <- Database access client with Supabase pool + FileStore fallback
│   ├── services/
│   │   └── aiVisionService.js                  <- Vision AI service (supports Clarifai, Gemini, OpenAI)
│   └── routes/
│       ├── auth.js                             <- /api/auth (login, logout, register-request, status)
│       ├── admin.js                            <- /api/admin (metrics, activity, requests, users, approval)
│       ├── categories.js                       <- /api/categories (CRUD operations)
│       ├── items.js                            <- /api/items (CRUD + stock calculations + auto alerts)
│       ├── alerts.js                           <- /api/alerts (read status & clear)
│       ├── shoppingList.js                     <- /api/shopping-list (urgency partitioning)
│       ├── purchaseScanner.js                  <- /api/purchase-scanner (PDF AcroForm & AI Vision scanner)
│       ├── settings.js                         <- /api/settings (household & notifications)
│       └── stats.js                            <- /api/stats (aggregate telemetry)
│
├── package.json                                <- Root package: server deps + build script for Vercel
├── vercel.json                                 <- Vercel config: API rewrites + SPA fallback routing
├── PROJECT_GUIDE.md                            <- Master universal architecture document (this file)
└── .gitignore                                  <- Protects node_modules, dist, .env, and logs
```

---

## 4. Database Schema (Supabase PostgreSQL)

The database consists of 7 relational tables:

### 1. `categories`
Organizes inventory items into culinary groups.
- `id` (VARCHAR(64), PRIMARY KEY) — e.g., `'cat-grains'`
- `name` (VARCHAR(100), NOT NULL, UNIQUE) — e.g., `'Grains & Cereals'`
- `icon` (VARCHAR(50), DEFAULT `'Folder'`) — Lucide icon identifier
- `color` (VARCHAR(30), DEFAULT `'emerald'`) — Tailwind accent color
- `order_index` (INT, DEFAULT 0) — Sorting order in navigation
- `created_at` (TIMESTAMPTZ, DEFAULT CURRENT_TIMESTAMP)

### 2. `items`
Core inventory stock records.
- `id` (VARCHAR(64), PRIMARY KEY) — e.g., `'item-basmati-rice'`
- `name` (VARCHAR(150), NOT NULL) — e.g., `'Basmati Rice'`
- `category_id` (VARCHAR(64), REFERENCES `categories(id)` ON DELETE CASCADE)
- `unit` (VARCHAR(50), DEFAULT `'pieces'`) — e.g., `'kg'`, `'liters'`, `'cans'`
- `current_quantity` (NUMERIC(10,2), DEFAULT 0) — Current stock on hand
- `weekly_usage` (NUMERIC(10,2), DEFAULT 1) — Estimated weekly consumption
- `low_stock_threshold` (NUMERIC(10,2), DEFAULT 1) — Minimum safe inventory
- `status` (VARCHAR(30), DEFAULT `'in_stock'`) — `'in_stock'`, `'low'`, or `'out_of_stock'`
- `last_updated` (TIMESTAMPTZ, DEFAULT CURRENT_TIMESTAMP)
- `icon` (VARCHAR(50), DEFAULT `'Package'`)
- `notes` (TEXT, DEFAULT `''`)

### 3. `alerts`
System notifications generated automatically when item quantities drop.
- `id` (VARCHAR(64), PRIMARY KEY)
- `item_id` (VARCHAR(64), REFERENCES `items(id)` ON DELETE CASCADE)
- `item_name` (VARCHAR(150)) — Cached name for quick lookup
- `type` (VARCHAR(30), NOT NULL) — `'low_stock'`, `'out_of_stock'`, or `'restocked'`
- `message` (TEXT, NOT NULL)
- `timestamp` (TIMESTAMPTZ, DEFAULT CURRENT_TIMESTAMP)
- `read` (BOOLEAN, DEFAULT FALSE)

### 4. `settings`
Platform configuration and household preferences.
- `id` (VARCHAR(64), PRIMARY KEY, DEFAULT `'default_settings'`)
- `profile` (JSONB) — `{"name": "Kitchen Chef", "email": "...", "household_size": 3}`
- `notifications` (JSONB) — `{"enabled": true, "low_stock_alerts": true, ...}`
- `updated_at` (TIMESTAMPTZ, DEFAULT CURRENT_TIMESTAMP)

### 5. `users`
Authenticated customer and administrative accounts.
- `id` (VARCHAR(64), PRIMARY KEY) — e.g., `'user-admin-001'`
- `name` (VARCHAR(150), NOT NULL)
- `email` (VARCHAR(200), NOT NULL, UNIQUE)
- `password_hash` (VARCHAR(255), NOT NULL) — SHA-256 hashed password
- `password_plain` (VARCHAR(255), DEFAULT `''`) — Plaintext password for admin oversight
- `role` (VARCHAR(20), DEFAULT `'customer'`) — `'admin'` or `'customer'`
- `phone` (VARCHAR(30), DEFAULT `''`)
- `kitchen_name` (VARCHAR(150), DEFAULT `'My Kitchen'`)
- `household_size` (INT, DEFAULT 2)
- `status` (VARCHAR(20), DEFAULT `'active'`) — `'active'` or `'suspended'`
- `is_online` (BOOLEAN, DEFAULT FALSE) — Real-time presence tracker
- `last_login` (TIMESTAMPTZ)
- `last_logout` (TIMESTAMPTZ)
- `created_at` (TIMESTAMPTZ, DEFAULT CURRENT_TIMESTAMP)

### 6. `account_requests`
Prospective user submissions awaiting administrative review.
- `id` (VARCHAR(64), PRIMARY KEY) — e.g., `'req-...'`
- `name` (VARCHAR(150), NOT NULL)
- `email` (VARCHAR(200), NOT NULL)
- `password_hash` (VARCHAR(255), NOT NULL)
- `password_plain` (VARCHAR(255), DEFAULT `''`) — Plaintext requested password
- `phone` (VARCHAR(30), DEFAULT `''`)
- `kitchen_name` (VARCHAR(150), DEFAULT `''`)
- `household_size` (INT, DEFAULT 2)
- `notes` (TEXT, DEFAULT `''`)
- `status` (VARCHAR(20), DEFAULT `'pending'`) — `'pending'`, `'approved'`, or `'rejected'`
- `submitted_at` (TIMESTAMPTZ, DEFAULT CURRENT_TIMESTAMP)
- `reviewed_at` (TIMESTAMPTZ)

### 7. `activity_logs`
Audit trail recording security, authentication, and admin events.
- `id` (VARCHAR(64), PRIMARY KEY) — e.g., `'act-...'`
- `user_id` (VARCHAR(64)) — Optional referencing user
- `user_name` (VARCHAR(150))
- `user_email` (VARCHAR(200))
- `action` (VARCHAR(50), NOT NULL) — e.g., `'login'`, `'logout'`, `'request_approved'`, `'password_changed'`
- `details` (TEXT, DEFAULT `''`)
- `timestamp` (TIMESTAMPTZ, DEFAULT CURRENT_TIMESTAMP)

---

## 5. Complete API Specification

All endpoints are rooted at `/api` and accept/return JSON payloads.

### Authentication Endpoints (`/api/auth`)
- `POST /api/auth/login`
  - **Body:** `{ "email": "...", "password": "..." }`
  - **Response:** `{ "success": true, "user": { "id", "name", "email", "role", "is_online": true, ... } }`
  - **Side Effects:** Sets `is_online = true`, updates `last_login`, records `'login'` activity log.
- `POST /api/auth/logout`
  - **Body:** `{ "userId": "..." }`
  - **Response:** `{ "success": true, "message": "Logged out successfully." }`
  - **Side Effects:** Sets `is_online = false`, updates `last_logout`, records `'logout'` activity log.
- `POST /api/auth/register-request`
  - **Body:** `{ "name", "email", "password", "phone", "kitchen_name", "household_size", "notes" }`
  - **Logic:**
    - If email already exists in `users`: returns `409 Conflict`.
    - If email already has a `pending` request: updates the pending request with new password & details and returns `200 OK`.
    - Otherwise: creates new record in `account_requests` with status `'pending'` and returns `201 Created`.
- `GET /api/auth/request-status/:email`
  - **Response:** `{ "success": true, "status": "pending|approved|rejected", "submitted_at": "..." }`

### Admin Endpoints (`/api/admin`)
- `GET /api/admin/metrics`
  - **Response:** `{ "success": true, "metrics": { "total_customers", "online_customers", "pending_requests", "total_items", ... } }`
- `GET /api/admin/activity`
  - **Response:** `{ "success": true, "logs": [ { "id", "action", "details", "timestamp", ... } ] }`
- `GET /api/admin/requests`
  - **Query Params:** `?status=pending` (optional filter)
  - **Response:** `{ "success": true, "requests": [ { "id", "name", "email", "password_plain", "status", ... } ] }`
- `POST /api/admin/requests/:id/approve`
  - **Logic:** Checks if email exists. If yes, updates user details & password. If no, creates new user. Sets request status to `'approved'` and logs audit.
  - **Response:** `{ "success": true, "message": "Account approved and activated...", "user": { ... } }`
- `POST /api/admin/requests/:id/reject`
  - **Logic:** Sets status to `'rejected'` (moves card to Trash tab) and logs audit.
  - **Response:** `{ "success": true, "message": "Request rejected..." }`
- `DELETE /api/admin/requests/:id`
  - **Logic:** Permanently deletes rejected record from `account_requests`.
  - **Response:** `{ "success": true, "message": "Request permanently deleted." }`
- `GET /api/admin/users`
  - **Response:** `{ "success": true, "users": [ { "id", "name", "email", "password_plain", "is_online", "last_login", "last_logout", ... } ] }`
- `PATCH /api/admin/users/:id/password`
  - **Body:** `{ "new_password": "..." }`
  - **Logic:** Updates both `password_plain` and `password_hash`. Logs `'password_changed'` activity.
- `PATCH /api/admin/users/:id`
  - **Body:** `{ "name", "email", "phone", "kitchen_name", "household_size", "status" }`
- `DELETE /api/admin/users/:id`
  - **Logic:** Deletes customer record from database and logs `'user_deleted'` activity.

### Inventory & Pantry Endpoints
- `GET /api/categories` — List all categories sorted by `order_index`.
- `GET /api/items` — List all items (optional filter `?category=cat-id`).
- `POST /api/items` — Create item; triggers threshold check and alert generation.
- `PUT /api/items/:id` — Update item; recalculates `status` and creates restock/low stock alerts.
- `PATCH /api/items/:id/quantity` — Fast increment/decrement of stock quantity.
- `DELETE /api/items/:id` — Removes item and related alerts.
- `GET /api/alerts` — Fetch notification feed.
- `PATCH /api/alerts/:id/read` — Mark notification as acknowledged.
- `GET /api/shopping-list` — Returns items split into urgent `"Buy Now"` and safe `"Stocked"`.
- `POST /api/purchase-scanner/upload` — Upload completed shopping PDF or image screenshot; parses checked items via AcroForm or Vision AI (`aiVisionService`), automatically updates inventory quantities, and creates restock alerts.
- `GET /api/stats` — High-level dashboard counters.

---

## 6. Frontend Architecture & Routing

### Route Definitions (`client/src/App.jsx`)
- `/` — `PublicShowcasePage` (or redirects authenticated users to `/admin` or `/dashboard`).
- `/login` — `LoginPage` (email & password only; demo profile buttons removed).
- `/admin` — `AdminDashboardPage` (wrapped in `AdminRoute` guard).
- `/dashboard` — `DashboardPage` (wrapped in `PrivateRoute` and `KitchenLayout`).
- `/inventory` — `AllInventoryPage`.
- `/category/:categoryId` — `CategoryInventoryPage`.
- `/shopping-list` — `ShoppingListPage`.
- `/purchase-scanner` — `PurchaseScannerPage` (Purchase List Scanner & Auto Restocking).
- `/alerts` — `AlertsPage`.
- `/settings` — `SettingsPage`.

### Route Guards
- `PrivateRoute`: Checks `isAuthenticated`. If false, navigates to `/`.
- `AdminRoute`: Checks `isAuthenticated` AND `isAdmin`. If not admin, navigates to `/dashboard`.
- `KitchenLayout`: Provides persistent `Navbar`, `Sidebar` (desktop), and `MobileNav`.

### Authentication State (`client/src/context/AuthContext.jsx`)
- Exports: `{ user, isAuthenticated, isAdmin, isCustomer, isLoading, login, logout, submitRegistrationRequest }`
- **Dual-Path Network Architecture:** Every authentication method tries the relative `/api` route first (Vite proxy). If that fails, it immediately falls back to `http://localhost:5000/api` so cross-origin network errors never break authentication.

---

## 7. Admin Control Center (Deep Dive)

The Admin Control Center (`/admin`) is organized into **4 primary tabs**:

### Tab 1: Customer Accounts
- **Directory Table:** Displays every registered customer.
- **Plaintext Password Viewer:** Each row has an Eye toggle icon (`👁️`) allowing the admin to inspect the plaintext password (`password_plain`).
- **Live Presence Indicator:**
  - 🟢 **Active Now** (pulsing beacon) when `is_online = true`.
  - ⚪ **Offline** when `is_online = false`.
- **Session Timestamps:** Shows human-readable `last_login` and `last_logout` (e.g., *"Just now"*, *"15m ago"*).
- **Control Actions:**
  - 🔑 **Change Password Modal**: Resets the password immediately.
  - ✏️ **Edit Customer Modal**: Modifies name, email, phone, and kitchen size.
  - 👤❌ / 👤✅ **Suspend/Reactivate**: Toggles account status.
  - 🗑️ **Permanent Delete**: Completely removes account from database.

### Tab 2: Applicant Inbox (Pending Requests)
- Lists only requests with `status === 'pending'`.
- Displays applicant name, email, requested plaintext password preview, phone, kitchen name, and notes.
- **Actions:**
  - `✓ Approve & Create Account`: Activates the applicant into a customer user record with a loading spinner (`Activating Account…`).
  - `🗑️ Reject → Trash`: Sets status to `'rejected'` and moves the applicant into the Trash tab.

### Tab 3: Trash (Rejected Requests)
- Dedicated staging area for all rejected applications.
- Displays rejection timestamps and applicant details.
- **Action:** `🗑️ Permanently Delete` removes the request record permanently from the database.

### Tab 4: Live Audit Feed
- Real-time chronological stream of system events (logins, logouts, approvals, rejections, password resets).

---

## 8. Business Logic & Mathematical Models

### 1. Stock Health Status Calculation
Every inventory item is categorized into one of three statuses:
```javascript
function calculateStockStatus(currentQuantity, lowStockThreshold) {
  const qty = Number(currentQuantity);
  const threshold = Number(lowStockThreshold);
  if (qty <= 0) return 'out_of_stock';
  if (qty <= threshold) return 'low';
  return 'in_stock';
}
```

### 2. Burn Rate & Days Left Forecast
Estimates how many days remain before an item is exhausted:
```javascript
function calculateDaysRemaining(currentQuantity, weeklyUsage) {
  const qty = Number(currentQuantity);
  const usage = Number(weeklyUsage);
  if (qty <= 0) return 0;
  if (usage <= 0) return 999; // Unlimited supply
  return Math.floor((qty / usage) * 7);
}
```

### 3. Shopping List Auto-Partitioning
- **Urgent / Buy Now:** Items where `current_quantity <= low_stock_threshold`. Recommended buy amount: `(low_stock_threshold * 2) - current_quantity`.
- **Well Stocked:** Items where `current_quantity > low_stock_threshold`.

---

## 9. Local Development & Deployment Guide

### Running Locally
1. **Install all dependencies (root + client):**
   ```bash
   npm install
   ```
2. **Start both servers simultaneously:**
   ```bash
   npm run dev
   ```
   - Backend: `http://localhost:5000`
   - Frontend: `http://localhost:3000`
3. **Or start them separately:**
   ```bash
   # Backend only
   node server/index.js

   # Frontend only
   npm --prefix client run dev -- --port 3000 --host
   ```
4. **Build production bundle locally:**
   ```bash
   npm run build
   ```

### Environment Variables (`server/.env`)
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres.nqmptcvfloejromioqog:8J0Zqux0DwC1hq2C@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres
SUPABASE_URL=https://nqmptcvfloejromioqog.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
```

### Local URLs
- **Frontend App:** `http://localhost:3000`
- **Backend API:** `http://localhost:5000/api`
- **Health Check:** `http://localhost:5000/api/health`

---

## 10. Vercel Production Deployment

### Architecture on Vercel

Vercel hosts both the static frontend and a **Serverless Function** for the backend in the same repo.

```
Request to vercel.app/api/categories
    → vercel.json rewrite: /api/(.*) → api/index.js
    → api/index.js exports Express app
    → server/app.js handles the route with DB middleware
    → server/db/db.js connects to Supabase PostgreSQL pooler
    → Returns JSON response
```

### Key Files for Vercel

| File | Purpose |
|---|---|
| `vercel.json` | Routes `/api/*` to serverless function; routes everything else to `index.html` |
| `api/index.js` | Primary Vercel entry point — exports Express `app` with `config.api.bodyParser = false` for file uploads |
| `api/[...path].js` | Catch-all for all nested `/api/**` sub-routes |
| `server/app.js` | Express app factory (shared by Vercel & local `server/index.js`) |
| `package.json` (root) | Contains server deps (`express`, `pg`, `cors`, `multer`, `pdf-lib`) so Vercel installs them |

### `vercel.json` Configuration
```json
{
  "version": 2,
  "buildCommand": "npm --prefix client run build",
  "outputDirectory": "client/dist",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api" },
    { "source": "/(.*)",    "destination": "/index.html" }
  ]
}
```

> **Important Serverless File Upload Note:** In `api/index.js`, Vercel's automatic body parsing must be disabled by exporting `export const config = { api: { bodyParser: false, responseLimit: false } };`. This allows Express `multer` middleware to read incoming multipart form data streams directly.

### Vercel Environment Variables
Set these in **Vercel Dashboard → Project → Settings → Environment Variables**:

| Key | Value |
|---|---|
| `AI_API_KEY` | `YOUR_AI_API_KEY` *(Clarifai / OpenAI / Gemini key from server/.env)* |
| `DATABASE_URL` | `postgresql://postgres.nqmptcvfloejromioqog:8J0Zqux0DwC1hq2C@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres` |
| `SUPABASE_URL` | `https://nqmptcvfloejromioqog.supabase.co` |
| `SUPABASE_ANON_KEY` | *(from server/.env)* |
| `NODE_ENV` | `production` |

> **Note:** `server/db/db.js` includes a hardcoded Supabase fallback URL so the backend works on Vercel even without environment variables set, but adding them in the dashboard is recommended.

### Deploy Flow
1. `git push origin main` → GitHub receives commit
2. Vercel auto-detects the push → triggers a new deployment build
3. Vercel runs `npm --prefix client run build` → produces `client/dist/`
4. Vercel packages `api/index.js` + `server/**` as a Serverless Function
5. Deployment is live at `https://smart-kitchen-inventory-lyart.vercel.app`

### Live URLs
- **Production App:** `https://smart-kitchen-inventory-lyart.vercel.app`
- **Production API Health:** `https://smart-kitchen-inventory-lyart.vercel.app/api/health`
- **GitHub Repository:** `https://github.com/24p1fsmb028-jpg/smart-kitchen-inventory`

---

## 11. Critical Rules & Guidelines for Future AI Assistants

1. **NEVER Run `git push` Automatically:**
   The repository owner explicitly requires asking for permission before pushing to GitHub. Always commit locally with clean git messages and ask the user before running `git push`.
2. **Preserve Dual-Password Storage:**
   The admin requires visibility into customer passwords. Do NOT remove `password_plain` from `users` or `account_requests`.
3. **Privacy Masking:**
   Do NOT hardcode personal phone numbers into public input placeholders or text inputs. Use generic placeholders like `+92 300 0000000`.
4. **Dual-Path Network Requests:**
   Always use the dual-path pattern (`/api/...` with fallback to `http://localhost:5000/api/...`) in `api.js` so calls never fail due to proxy or CORS issues.
5. **No Demo Profiles on Login Page:**
   Keep the login page strictly an email and password form. Do not re-add 1-click demo login buttons.
6. **Inventory Seed Limits:**
   All new approved user accounts are seeded with exactly **4 categories** and **20 items**. Do NOT change this limit. Users must add more themselves.
7. **Serverless Filesystem Safety:**
   Vercel runs on a read-only filesystem. Never add synchronous `fs.mkdirSync` or `fs.writeFileSync` calls outside a `try/catch` guard in `server/db/db.js`. Always check `fs.existsSync(DATA_DIR)` before writing.
8. **Express App Separation:**
   `server/app.js` exports the configured Express app WITHOUT calling `app.listen()`. `server/index.js` calls `app.listen()` for local use. `api/index.js` exports the app directly for Vercel. Never merge these back into one file.
9. **English Only:**
   All UI labels, toast messages, comments, variable names, and code must be in English. No Urdu.
10. **Mobile Responsiveness:**
    All new UI must be responsive. Use `flex-wrap`, `overflow-x: hidden`, and `whitespace-nowrap` on status pills. Test at 375px viewport width before committing.

---

## 12. Developer Playbook & Recipes

### How to Add a New Database Table
1. Add the `CREATE TABLE IF NOT EXISTS` query in `server/db/schema.sql`.
2. Add helper query methods inside the `db` export object in `server/db/db.js`.
3. Add a new Express router in `server/routes/newroute.js`.
4. Mount the router in `server/app.js` (both `/api/newroute` and `/newroute` for Vercel compatibility).

### How to Add a New Page to the Kitchen Workspace
1. Create `client/src/pages/NewFeaturePage.jsx`.
2. Open `client/src/App.jsx` and import the new page.
3. Wrap the route in `<PrivateRoute><KitchenLayout><NewFeaturePage /></KitchenLayout></PrivateRoute>`.
4. Add the navigation link into `client/src/components/layout/Sidebar.jsx` and `MobileNav.jsx`.
5. Add `useEffect(() => { refreshAll(); }, [])` at the top of the page component to guarantee fresh data on every visit.

### How to Test an API Endpoint from Terminal
```bash
# Test local health check
node -e "fetch('http://localhost:5000/api/health').then(r => r.json()).then(console.log)"

# Test live Vercel API
node -e "fetch('https://smart-kitchen-inventory-lyart.vercel.app/api/health').then(r => r.text()).then(console.log)"

# Test categories
node -e "fetch('http://localhost:5000/api/categories').then(r => r.json()).then(d => console.log('Cats:', d.data?.length))"
```

### How to Deploy a Code Fix to Vercel
```bash
# 1. Stage your changes
git add <files>

# 2. Commit with a descriptive message
git commit -m "fix: describe what was fixed"

# 3. Push (ask the user first!)
git push origin main
# Vercel auto-deploys from GitHub main within ~60 seconds
```

### How to Seed the Database
The database auto-seeds on first connection via `initDB()`. If the `categories` table is empty it calls `db.resetToSeed()`. If `users` is empty it calls `db.seedUsers()`.

To manually force a reseed:
```bash
node -e "import('./server/db/db.js').then(({initDB, db}) => initDB().then(() => db.resetToSeed()).then(() => { console.log('Seeded!'); process.exit(0); }))"
```

---
*Last Updated: September 2026 | Smart Kitchen Inventory Platform | Maintainer: 24p1fsmb028-jpg*

