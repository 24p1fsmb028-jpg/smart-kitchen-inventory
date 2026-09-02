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

-- Create Indexes for performance
CREATE INDEX IF NOT EXISTS idx_items_category_id ON items(category_id);
CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);
CREATE INDEX IF NOT EXISTS idx_alerts_timestamp ON alerts(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_read ON alerts(read);
