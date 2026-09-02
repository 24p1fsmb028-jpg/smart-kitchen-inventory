-- Smart Kitchen Inventory PostgreSQL Schema

-- 1. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(50) DEFAULT 'Folder',
    color VARCHAR(30) DEFAULT 'emerald',
    order_index INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Items Table
CREATE TABLE IF NOT EXISTS items (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category_id VARCHAR(64) REFERENCES categories(id) ON DELETE CASCADE,
    unit VARCHAR(50) NOT NULL DEFAULT 'pieces',
    current_quantity NUMERIC(10, 2) NOT NULL DEFAULT 0,
    weekly_usage NUMERIC(10, 2) NOT NULL DEFAULT 1,
    low_stock_threshold NUMERIC(10, 2) NOT NULL DEFAULT 1,
    status VARCHAR(30) NOT NULL DEFAULT 'in_stock', -- 'in_stock' | 'low' | 'out_of_stock'
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    icon VARCHAR(50) DEFAULT 'Package',
    notes TEXT DEFAULT ''
);

-- 3. Alerts Table
CREATE TABLE IF NOT EXISTS alerts (
    id VARCHAR(64) PRIMARY KEY,
    item_id VARCHAR(64) REFERENCES items(id) ON DELETE CASCADE,
    item_name VARCHAR(150),
    type VARCHAR(30) NOT NULL, -- 'low_stock' | 'out_of_stock' | 'restocked'
    message TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    read BOOLEAN DEFAULT FALSE
);

-- 4. Settings Table
CREATE TABLE IF NOT EXISTS settings (
    id VARCHAR(64) PRIMARY KEY DEFAULT 'default_settings',
    profile JSONB NOT NULL DEFAULT '{"name": "Kitchen Chef", "email": "chef@smartkitchen.app", "household_size": 3}',
    notifications JSONB NOT NULL DEFAULT '{"enabled": true, "low_stock_alerts": true, "out_of_stock_alerts": true, "restock_alerts": true}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Users Table (Admin & Customer roles with plain password visibility & online activity tracking)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(200) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    password_plain VARCHAR(255) DEFAULT '',
    role VARCHAR(20) NOT NULL DEFAULT 'customer', -- 'admin' | 'customer'
    phone VARCHAR(30) DEFAULT '',
    kitchen_name VARCHAR(150) DEFAULT 'My Kitchen',
    household_size INT DEFAULT 2,
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active' | 'suspended'
    is_online BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP WITH TIME ZONE,
    last_logout TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Account Requests Table (Pending approval by admin with requested password preview)
CREATE TABLE IF NOT EXISTS account_requests (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(200) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    password_plain VARCHAR(255) DEFAULT '',
    phone VARCHAR(30) DEFAULT '',
    kitchen_name VARCHAR(150) DEFAULT '',
    household_size INT DEFAULT 2,
    notes TEXT DEFAULT '',
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected'
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP WITH TIME ZONE
);

-- 7. Activity Logs Table (Live Login/Logout and Admin Audit Trail)
CREATE TABLE IF NOT EXISTS activity_logs (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64),
    user_name VARCHAR(150),
    user_email VARCHAR(200),
    action VARCHAR(50) NOT NULL, -- 'login' | 'logout' | 'signup_request' | 'request_approved' | 'request_rejected' | 'password_changed' | 'status_changed'
    details TEXT DEFAULT '',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for performance
CREATE INDEX IF NOT EXISTS idx_items_category_id ON items(category_id);
CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);
CREATE INDEX IF NOT EXISTS idx_alerts_timestamp ON alerts(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_read ON alerts(read);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_online ON users(is_online);
CREATE INDEX IF NOT EXISTS idx_account_requests_status ON account_requests(status);
CREATE INDEX IF NOT EXISTS idx_account_requests_email ON account_requests(email);
CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON activity_logs(timestamp DESC);
