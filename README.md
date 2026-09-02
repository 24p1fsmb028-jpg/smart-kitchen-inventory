# 🍳 Smart Kitchen Inventory

A modern, full-stack grocery and kitchen stock management web application built with **React**, **Tailwind CSS**, **Node.js/Express**, and **PostgreSQL / Supabase**.

---

## ✨ Features

- **📊 Comprehensive Dashboard**: 4 key stock metric stat cards (*Total Items, Categories, Running Low, Out of Stock*), urgent stock alert banner, interactive category grid, and "Needs Attention" list.
- **📂 Category & Inventory Management**: Filter items by stock status (*All, In Stock, Low Stock, Out of Stock*), sort by burn rate / urgency, and adjust stock quantities with live steppers (`-`, `+`).
- **⚡ Dynamic Stock Calculation & Run Time Estimates**:
  - `Out of stock`: `current_quantity <= 0`
  - `Low stock`: `0 < current_quantity <= low_stock_threshold`
  - `In stock`: `current_quantity > low_stock_threshold`
  - Daily burn rate and days-remaining estimation based on weekly usage.
- **🔔 Real-time Stock Alerts**: Automated transition logs when stock drops below threshold or replenishes, with live unread badge counters on the navbar.
- **🛒 Auto-Synced Shopping List**: Automatically partitions into *"Buy now"* and *"Well stocked"*, supports manual check-off, bulk *"Restock Checked Items"* with celebration effects, and formatted list sharing (WhatsApp, Notes, SMS, native Web Share).
- **⚙️ Settings & Data Portability**: User profile, notification rules, category CRUD manager, dark/light mode toggle, and full JSON data backup export & import.
- **🐘 PostgreSQL & Supabase Integration**: Dual-mode database engine connecting directly to Supabase with automated schema migrations and seed population.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, React Router DOM, Tailwind CSS, Lucide React, Recharts, Canvas Confetti.
- **Backend**: Node.js, Express, PostgreSQL (`pg`), Supabase (`@supabase/supabase-js`), dotenv, CORS.
- **Database**: PostgreSQL / Supabase with automatic schema initialization and local storage fallback.

---

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd smart-kitchen-inventory
```

### 2. Install dependencies
```bash
npm install
npm --prefix server install
npm --prefix client install
```

### 3. Configure Environment
Copy `server/.env.example` to `server/.env` and optionally set your Supabase database URI:
```env
PORT=5000
NODE_ENV=development

DATABASE_URL=postgresql://postgres.your_project_ref:YOUR_PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run Locally
```bash
# Starts both frontend (:3000) and backend (:5000) concurrently
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 License
MIT License. Built with ❤️ for smart, zero-waste kitchen management.
