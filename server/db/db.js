import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import { initialCategories, initialItems, initialAlerts, initialSettings, initialUsers, initialAccountRequests } from './seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const DATA_DIR = path.join(__dirname, '../data');
const STORE_PATH = path.join(DATA_DIR, 'store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let pgPool = null;
let usePostgres = false;

// Attempt PostgreSQL / Supabase Connection if configured
if (process.env.DATABASE_URL || process.env.PGHOST) {
  try {
    const isSupabase = process.env.DATABASE_URL && (
      process.env.DATABASE_URL.includes('supabase.co') ||
      process.env.DATABASE_URL.includes('supabase.com') ||
      process.env.DATABASE_URL.includes('pooler.supabase.com')
    );

    const sslConfig = isSupabase || process.env.NODE_ENV === 'production' || (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('sslmode=require'))
      ? { rejectUnauthorized: false }
      : false;

    const config = process.env.DATABASE_URL
      ? {
          connectionString: process.env.DATABASE_URL,
          ssl: sslConfig
        }
      : {
          host: process.env.PGHOST || 'localhost',
          port: parseInt(process.env.PGPORT || '5432'),
          user: process.env.PGUSER || 'postgres',
          password: process.env.PGPASSWORD || '',
          database: process.env.PGDATABASE || 'smart_kitchen',
          ssl: sslConfig
        };

    pgPool = new Pool(config);
    console.log('🔄 Initializing PostgreSQL / Supabase connection pool...');
  } catch (err) {
    console.warn('⚠️ PostgreSQL / Supabase initialization warning:', err.message);
  }
}

// Memory / File Store Fallback System
class FileStore {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
      if (fs.existsSync(STORE_PATH)) {
        const raw = fs.readFileSync(STORE_PATH, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('Error reading store.json, resetting to seed data:', err.message);
    }
    const defaultData = {
      categories: [...initialCategories],
      items: [...initialItems],
      alerts: [...initialAlerts],
      settings: { ...initialSettings }
    };
    this.save(defaultData);
    return defaultData;
  }

  save(dataToSave = null) {
    try {
      const data = dataToSave || this.data;
      fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving to store.json:', err.message);
    }
  }

  reset() {
    this.data = {
      categories: JSON.parse(JSON.stringify(initialCategories)),
      items: JSON.parse(JSON.stringify(initialItems)),
      alerts: JSON.parse(JSON.stringify(initialAlerts)),
      settings: JSON.parse(JSON.stringify(initialSettings))
    };
    this.save();
    return this.data;
  }
}

const fileStore = new FileStore();

export const initDB = async () => {
  if (pgPool) {
    try {
      const client = await pgPool.connect();
      const schemaSQL = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
      await client.query(schemaSQL);
      usePostgres = true;

      // Check if categories are empty, auto-seed if needed
      const countRes = await client.query('SELECT COUNT(*)::int AS count FROM categories');
      const count = countRes.rows[0]?.count || 0;
      // Check if users are seeded
      const usersRes = await client.query('SELECT COUNT(*)::int AS count FROM users');
      const usersCount = usersRes.rows[0]?.count || 0;
      client.release();

      console.log('✅ Connected to Supabase / PostgreSQL database and verified schema.');

      if (count === 0) {
        console.log('🌱 Supabase database is empty. Auto-populating initial sample seed data...');
        await db.resetToSeed();
        console.log('✅ Seed data successfully loaded into Supabase!');
      }

      if (usersCount === 0) {
        console.log('🔐 Seeding initial admin and demo customer accounts...');
        await db.seedUsers();
        console.log('✅ Default user accounts created!');
      }

      return;
    } catch (err) {
      console.warn('⚠️ Could not connect to Supabase/PostgreSQL. Using persistent local file store:', err.message);
      usePostgres = false;
    }
  } else {
    console.log('📦 Using persistent local storage adapter (Set DATABASE_URL in .env to connect to PostgreSQL/Supabase).');
  }
};

// Database Operations
export const db = {
  isPostgres: () => usePostgres,

  // --- CATEGORIES ---
  async getCategories() {
    if (usePostgres) {
      const res = await pgPool.query(`
        SELECT c.*, 
               COALESCE(COUNT(i.id), 0)::int AS item_count
        FROM categories c
        LEFT JOIN items i ON c.id = i.category_id
        GROUP BY c.id
        ORDER BY c.order_index ASC, c.name ASC
      `);
      return res.rows;
    } else {
      const items = fileStore.data.items || [];
      return fileStore.data.categories
        .map((cat) => ({
          ...cat,
          item_count: items.filter((item) => item.category_id === cat.id).length
        }))
        .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
    }
  },

  async getCategoryById(id) {
    if (usePostgres) {
      const res = await pgPool.query('SELECT * FROM categories WHERE id = $1', [id]);
      return res.rows[0] || null;
    } else {
      return fileStore.data.categories.find((c) => c.id === id) || null;
    }
  },

  async createCategory(cat) {
    if (usePostgres) {
      const res = await pgPool.query(
        'INSERT INTO categories (id, name, icon, color, order_index) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [cat.id, cat.name, cat.icon || 'Folder', cat.color || 'emerald', cat.order_index || 0]
      );
      return res.rows[0];
    } else {
      fileStore.data.categories.push(cat);
      fileStore.save();
      return cat;
    }
  },

  async updateCategory(id, updates) {
    if (usePostgres) {
      const fields = [];
      const values = [];
      let idx = 1;
      for (const [key, val] of Object.entries(updates)) {
        fields.push(`${key} = $${idx}`);
        values.push(val);
        idx++;
      }
      values.push(id);
      const res = await pgPool.query(
        `UPDATE categories SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
        values
      );
      return res.rows[0];
    } else {
      const index = fileStore.data.categories.findIndex((c) => c.id === id);
      if (index === -1) return null;
      fileStore.data.categories[index] = { ...fileStore.data.categories[index], ...updates };
      fileStore.save();
      return fileStore.data.categories[index];
    }
  },

  async deleteCategory(id) {
    if (usePostgres) {
      await pgPool.query('DELETE FROM categories WHERE id = $1', [id]);
      return true;
    } else {
      fileStore.data.categories = fileStore.data.categories.filter((c) => c.id !== id);
      fileStore.data.items = fileStore.data.items.filter((i) => i.category_id !== id);
      fileStore.save();
      return true;
    }
  },

  // --- ITEMS ---
  async getItems(filters = {}) {
    if (usePostgres) {
      let query = `
        SELECT i.*, c.name AS category_name, c.icon AS category_icon, c.color AS category_color
        FROM items i
        LEFT JOIN categories c ON i.category_id = c.id
        WHERE 1=1
      `;
      const params = [];
      if (filters.category_id) {
        params.push(filters.category_id);
        query += ` AND i.category_id = $${params.length}`;
      }
      if (filters.status) {
        params.push(filters.status);
        query += ` AND i.status = $${params.length}`;
      }
      if (filters.search) {
        params.push(`%${filters.search.toLowerCase()}%`);
        query += ` AND LOWER(i.name) LIKE $${params.length}`;
      }
      query += ` ORDER BY i.name ASC`;
      const res = await pgPool.query(query, params);
      return res.rows.map(r => ({
        ...r,
        current_quantity: parseFloat(r.current_quantity),
        weekly_usage: parseFloat(r.weekly_usage),
        low_stock_threshold: parseFloat(r.low_stock_threshold)
      }));
    } else {
      let items = [...fileStore.data.items];
      const categoriesMap = new Map(fileStore.data.categories.map((c) => [c.id, c]));

      items = items.map((item) => {
        const cat = categoriesMap.get(item.category_id);
        return {
          ...item,
          category_name: cat ? cat.name : 'Uncategorized',
          category_icon: cat ? cat.icon : 'Folder',
          category_color: cat ? cat.color : 'slate'
        };
      });

      if (filters.category_id) {
        items = items.filter((i) => i.category_id === filters.category_id);
      }
      if (filters.status) {
        items = items.filter((i) => i.status === filters.status);
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        items = items.filter((i) => i.name.toLowerCase().includes(q) || (i.notes && i.notes.toLowerCase().includes(q)));
      }
      return items.sort((a, b) => a.name.localeCompare(b.name));
    }
  },

  async getItemById(id) {
    if (usePostgres) {
      const res = await pgPool.query(`
        SELECT i.*, c.name AS category_name, c.icon AS category_icon, c.color AS category_color
        FROM items i
        LEFT JOIN categories c ON i.category_id = c.id
        WHERE i.id = $1
      `, [id]);
      if (res.rows[0]) {
        const r = res.rows[0];
        return {
          ...r,
          current_quantity: parseFloat(r.current_quantity),
          weekly_usage: parseFloat(r.weekly_usage),
          low_stock_threshold: parseFloat(r.low_stock_threshold)
        };
      }
      return null;
    } else {
      const item = fileStore.data.items.find((i) => i.id === id);
      if (!item) return null;
      const cat = fileStore.data.categories.find((c) => c.id === item.category_id);
      return {
        ...item,
        category_name: cat ? cat.name : 'Uncategorized',
        category_icon: cat ? cat.icon : 'Folder',
        category_color: cat ? cat.color : 'slate'
      };
    }
  },

  async createItem(item) {
    if (usePostgres) {
      const res = await pgPool.query(
        `INSERT INTO items (id, name, category_id, unit, current_quantity, weekly_usage, low_stock_threshold, status, icon, notes, last_updated)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
        [
          item.id,
          item.name,
          item.category_id,
          item.unit || 'pieces',
          item.current_quantity || 0,
          item.weekly_usage || 1,
          item.low_stock_threshold || 1,
          item.status || 'in_stock',
          item.icon || 'Package',
          item.notes || '',
          item.last_updated || new Date().toISOString()
        ]
      );
      return res.rows[0];
    } else {
      fileStore.data.items.push(item);
      fileStore.save();
      return item;
    }
  },

  async updateItem(id, updates) {
    updates.last_updated = new Date().toISOString();
    if (usePostgres) {
      const fields = [];
      const values = [];
      let idx = 1;
      for (const [key, val] of Object.entries(updates)) {
        fields.push(`${key} = $${idx}`);
        values.push(val);
        idx++;
      }
      values.push(id);
      const res = await pgPool.query(
        `UPDATE items SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
        values
      );
      return res.rows[0];
    } else {
      const index = fileStore.data.items.findIndex((i) => i.id === id);
      if (index === -1) return null;
      fileStore.data.items[index] = { ...fileStore.data.items[index], ...updates };
      fileStore.save();
      return fileStore.data.items[index];
    }
  },

  async deleteItem(id) {
    if (usePostgres) {
      await pgPool.query('DELETE FROM items WHERE id = $1', [id]);
      return true;
    } else {
      fileStore.data.items = fileStore.data.items.filter((i) => i.id !== id);
      fileStore.data.alerts = fileStore.data.alerts.filter((a) => a.item_id !== id);
      fileStore.save();
      return true;
    }
  },

  // --- ALERTS ---
  async getAlerts(limit = 100) {
    if (usePostgres) {
      const res = await pgPool.query(
        'SELECT * FROM alerts ORDER BY timestamp DESC LIMIT $1',
        [limit]
      );
      return res.rows;
    } else {
      return [...fileStore.data.alerts]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit);
    }
  },

  async createAlert(alert) {
    if (usePostgres) {
      const res = await pgPool.query(
        `INSERT INTO alerts (id, item_id, item_name, type, message, timestamp, read)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [
          alert.id,
          alert.item_id,
          alert.item_name,
          alert.type,
          alert.message,
          alert.timestamp || new Date().toISOString(),
          alert.read || false
        ]
      );
      return res.rows[0];
    } else {
      fileStore.data.alerts.unshift(alert);
      if (fileStore.data.alerts.length > 200) {
        fileStore.data.alerts = fileStore.data.alerts.slice(0, 200);
      }
      fileStore.save();
      return alert;
    }
  },

  async markAlertAsRead(id) {
    if (usePostgres) {
      const res = await pgPool.query('UPDATE alerts SET read = TRUE WHERE id = $1 RETURNING *', [id]);
      return res.rows[0];
    } else {
      const alert = fileStore.data.alerts.find((a) => a.id === id);
      if (alert) {
        alert.read = true;
        fileStore.save();
      }
      return alert;
    }
  },

  async markAllAlertsAsRead() {
    if (usePostgres) {
      await pgPool.query('UPDATE alerts SET read = TRUE');
      return true;
    } else {
      fileStore.data.alerts.forEach((a) => (a.read = true));
      fileStore.save();
      return true;
    }
  },

  async deleteAlert(id) {
    if (usePostgres) {
      await pgPool.query('DELETE FROM alerts WHERE id = $1', [id]);
      return true;
    } else {
      fileStore.data.alerts = fileStore.data.alerts.filter((a) => a.id !== id);
      fileStore.save();
      return true;
    }
  },

  async clearAllAlerts() {
    if (usePostgres) {
      await pgPool.query('DELETE FROM alerts');
      return true;
    } else {
      fileStore.data.alerts = [];
      fileStore.save();
      return true;
    }
  },

  // --- SETTINGS ---
  async getSettings() {
    if (usePostgres) {
      const res = await pgPool.query('SELECT * FROM settings WHERE id = $1', ['default_settings']);
      if (res.rows[0]) return res.rows[0];
      return initialSettings;
    } else {
      return fileStore.data.settings || initialSettings;
    }
  },

  async updateSettings(updates) {
    if (usePostgres) {
      const current = await this.getSettings();
      const newProfile = updates.profile ? JSON.stringify({ ...current.profile, ...updates.profile }) : JSON.stringify(current.profile);
      const newNotifs = updates.notifications ? JSON.stringify({ ...current.notifications, ...updates.notifications }) : JSON.stringify(current.notifications);
      const res = await pgPool.query(
        `INSERT INTO settings (id, profile, notifications, updated_at)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
         ON CONFLICT (id) DO UPDATE 
         SET profile = EXCLUDED.profile, notifications = EXCLUDED.notifications, updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        ['default_settings', newProfile, newNotifs]
      );
      return res.rows[0];
    } else {
      fileStore.data.settings = {
        ...fileStore.data.settings,
        ...updates,
        profile: { ...fileStore.data.settings?.profile, ...updates.profile },
        notifications: { ...fileStore.data.settings?.notifications, ...updates.notifications }
      };
      fileStore.save();
      return fileStore.data.settings;
    }
  },

  // --- SHOPPING LIST CHECKED STATUS ---
  async toggleShoppingChecked(itemId, checked) {
    const settings = await this.getSettings();
    let checkedIds = settings.checked_shopping_ids || [];
    if (checked) {
      if (!checkedIds.includes(itemId)) checkedIds.push(itemId);
    } else {
      checkedIds = checkedIds.filter((id) => id !== itemId);
    }
    await this.updateSettings({ checked_shopping_ids: checkedIds });
    return checkedIds;
  },

  // --- USERS ---
  async getUserByEmail(email) {
    if (usePostgres) {
      const res = await pgPool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
      return res.rows[0] || null;
    } else {
      return fileStore.data.users?.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
    }
  },

  async getUserById(id) {
    if (usePostgres) {
      const res = await pgPool.query('SELECT * FROM users WHERE id = $1', [id]);
      return res.rows[0] || null;
    } else {
      return fileStore.data.users?.find(u => u.id === id) || null;
    }
  },

  async getAllUsers() {
    if (usePostgres) {
      const res = await pgPool.query(`
        SELECT u.*,
               COALESCE((SELECT COUNT(*) FROM items), 0)::int AS item_count
        FROM users u
        ORDER BY u.created_at DESC
      `);
      return res.rows;
    } else {
      const itemsCount = fileStore.data.items?.length || 0;
      return (fileStore.data.users || []).map(u => ({ ...u, item_count: itemsCount }));
    }
  },

  async createUser(user) {
    if (usePostgres) {
      const res = await pgPool.query(
        `INSERT INTO users (id, name, email, password_hash, password_plain, role, phone, kitchen_name, household_size, status, is_online, last_login)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
        [
          user.id,
          user.name,
          user.email,
          user.password_hash,
          user.password_plain || '',
          user.role || 'customer',
          user.phone || '',
          user.kitchen_name || 'My Kitchen',
          user.household_size || 2,
          user.status || 'active',
          user.is_online || false,
          user.last_login || null
        ]
      );
      return res.rows[0];
    } else {
      if (!fileStore.data.users) fileStore.data.users = [];
      fileStore.data.users.push(user);
      fileStore.save();
      return user;
    }
  },

  async recordUserLogin(userId) {
    if (usePostgres) {
      const res = await pgPool.query(
        `UPDATE users
         SET is_online = TRUE, last_login = CURRENT_TIMESTAMP
         WHERE id = $1 RETURNING *`,
        [userId]
      );
      if (res.rows[0]) {
        await this.logActivity({
          userId: res.rows[0].id,
          userName: res.rows[0].name,
          userEmail: res.rows[0].email,
          action: 'login',
          details: `User ${res.rows[0].name} signed in successfully.`
        });
      }
      return res.rows[0] || null;
    } else {
      const user = fileStore.data.users?.find(u => u.id === userId);
      if (user) {
        user.is_online = true;
        user.last_login = new Date().toISOString();
        fileStore.save();
        this.logActivity({
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          action: 'login',
          details: `User ${user.name} signed in.`
        });
      }
      return user || null;
    }
  },

  async recordUserLogout(userId) {
    if (usePostgres) {
      const res = await pgPool.query(
        `UPDATE users
         SET is_online = FALSE, last_logout = CURRENT_TIMESTAMP
         WHERE id = $1 RETURNING *`,
        [userId]
      );
      if (res.rows[0]) {
        await this.logActivity({
          userId: res.rows[0].id,
          userName: res.rows[0].name,
          userEmail: res.rows[0].email,
          action: 'logout',
          details: `User ${res.rows[0].name} signed out.`
        });
      }
      return res.rows[0] || null;
    } else {
      const user = fileStore.data.users?.find(u => u.id === userId);
      if (user) {
        user.is_online = false;
        user.last_logout = new Date().toISOString();
        fileStore.save();
        this.logActivity({
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          action: 'logout',
          details: `User ${user.name} signed out.`
        });
      }
      return user || null;
    }
  },

  async updateUserPassword(userId, passwordPlain, passwordHash) {
    if (usePostgres) {
      const res = await pgPool.query(
        `UPDATE users
         SET password_plain = $1, password_hash = $2
         WHERE id = $3 RETURNING *`,
        [passwordPlain, passwordHash, userId]
      );
      if (res.rows[0]) {
        await this.logActivity({
          userId: res.rows[0].id,
          userName: res.rows[0].name,
          userEmail: res.rows[0].email,
          action: 'password_changed',
          details: `Password changed by Admin for ${res.rows[0].email}.`
        });
      }
      return res.rows[0] || null;
    } else {
      const user = fileStore.data.users?.find(u => u.id === userId);
      if (user) {
        user.password_plain = passwordPlain;
        user.password_hash = passwordHash;
        fileStore.save();
      }
      return user || null;
    }
  },

  async updateUserDetails(userId, updates) {
    if (usePostgres) {
      const fields = [];
      const values = [];
      let idx = 1;
      for (const [key, val] of Object.entries(updates)) {
        fields.push(`${key} = $${idx}`);
        values.push(val);
        idx++;
      }
      values.push(userId);
      const res = await pgPool.query(
        `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
        values
      );
      return res.rows[0] || null;
    } else {
      const user = fileStore.data.users?.find(u => u.id === userId);
      if (user) {
        Object.assign(user, updates);
        fileStore.save();
      }
      return user || null;
    }
  },

  async updateUserStatus(id, status) {
    if (usePostgres) {
      const res = await pgPool.query('UPDATE users SET status = $1 WHERE id = $2 RETURNING *', [status, id]);
      if (res.rows[0]) {
        await this.logActivity({
          userId: res.rows[0].id,
          userName: res.rows[0].name,
          userEmail: res.rows[0].email,
          action: 'status_changed',
          details: `Account status updated to '${status}'.`
        });
      }
      return res.rows[0] || null;
    } else {
      const user = fileStore.data.users?.find(u => u.id === id);
      if (user) { user.status = status; fileStore.save(); }
      return user || null;
    }
  },

  async deleteUser(id) {
    if (usePostgres) {
      await pgPool.query('DELETE FROM users WHERE id = $1', [id]);
      return true;
    } else {
      if (fileStore.data.users) {
        fileStore.data.users = fileStore.data.users.filter(u => u.id !== id);
        fileStore.save();
      }
      return true;
    }
  },

  async seedUsers() {
    for (const user of initialUsers) {
      const existing = await this.getUserByEmail(user.email);
      if (!existing) await this.createUser(user);
    }
    if (usePostgres) {
      for (const req of initialAccountRequests) {
        const existing = await pgPool.query('SELECT id FROM account_requests WHERE email = $1', [req.email]);
        if (existing.rows.length === 0) {
          await pgPool.query(
            `INSERT INTO account_requests (id, name, email, password_hash, password_plain, phone, kitchen_name, household_size, notes, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [req.id, req.name, req.email, req.password_hash, req.password_plain, req.phone, req.kitchen_name, req.household_size, req.notes, req.status]
          );
        }
      }
    } else {
      if (!fileStore.data.account_requests) fileStore.data.account_requests = [];
      for (const req of initialAccountRequests) {
        if (!fileStore.data.account_requests.find(r => r.email === req.email)) {
          fileStore.data.account_requests.push(req);
        }
      }
      fileStore.save();
    }
  },

  // --- ACTIVITY LOGS ---
  async logActivity({ userId, userName, userEmail, action, details }) {
    const id = `act-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const timestamp = new Date().toISOString();
    if (usePostgres) {
      try {
        await pgPool.query(
          `INSERT INTO activity_logs (id, user_id, user_name, user_email, action, details, timestamp)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [id, userId || null, userName || 'Anonymous', userEmail || '', action, details || '', timestamp]
        );
      } catch (err) {
        console.warn('Activity log insert error:', err.message);
      }
    } else {
      if (!fileStore.data.activity_logs) fileStore.data.activity_logs = [];
      fileStore.data.activity_logs.unshift({ id, user_id: userId, user_name: userName, user_email: userEmail, action, details, timestamp });
      if (fileStore.data.activity_logs.length > 200) fileStore.data.activity_logs.pop();
      fileStore.save();
    }
  },

  async getActivityLogs(limit = 60) {
    if (usePostgres) {
      try {
        const res = await pgPool.query('SELECT * FROM activity_logs ORDER BY timestamp DESC LIMIT $1', [limit]);
        return res.rows;
      } catch {
        return [];
      }
    } else {
      return (fileStore.data.activity_logs || []).slice(0, limit);
    }
  },

  // --- ACCOUNT REQUESTS ---
  async getAllRequests(statusFilter = null) {
    if (usePostgres) {
      if (statusFilter) {
        const res = await pgPool.query('SELECT * FROM account_requests WHERE status = $1 ORDER BY submitted_at DESC', [statusFilter]);
        return res.rows;
      }
      const res = await pgPool.query('SELECT * FROM account_requests ORDER BY submitted_at DESC');
      return res.rows;
    } else {
      const all = fileStore.data.account_requests || [];
      return statusFilter ? all.filter(r => r.status === statusFilter) : all;
    }
  },

  async getRequestById(id) {
    if (usePostgres) {
      const res = await pgPool.query('SELECT * FROM account_requests WHERE id = $1', [id]);
      return res.rows[0] || null;
    } else {
      return fileStore.data.account_requests?.find(r => r.id === id) || null;
    }
  },

  async getRequestByEmail(email) {
    if (usePostgres) {
      const res = await pgPool.query('SELECT * FROM account_requests WHERE LOWER(email) = LOWER($1) ORDER BY submitted_at DESC LIMIT 1', [email]);
      return res.rows[0] || null;
    } else {
      return fileStore.data.account_requests?.find(r => r.email.toLowerCase() === email.toLowerCase()) || null;
    }
  },

  async createAccountRequest(request) {
    if (usePostgres) {
      const res = await pgPool.query(
        `INSERT INTO account_requests (id, name, email, password_hash, password_plain, phone, kitchen_name, household_size, notes, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
        [request.id, request.name, request.email, request.password_hash, request.password_plain || '',
         request.phone || '', request.kitchen_name || '', request.household_size || 2,
         request.notes || '', 'pending']
      );
      await this.logActivity({
        userId: null,
        userName: request.name,
        userEmail: request.email,
        action: 'signup_request',
        details: `New account request received from ${request.name} (${request.email}).`
      });
      return res.rows[0];
    } else {
      if (!fileStore.data.account_requests) fileStore.data.account_requests = [];
      const newReq = { ...request, status: 'pending', submitted_at: new Date().toISOString() };
      fileStore.data.account_requests.unshift(newReq);
      fileStore.save();
      this.logActivity({
        userId: null,
        userName: request.name,
        userEmail: request.email,
        action: 'signup_request',
        details: `New account request received from ${request.name} (${request.email}).`
      });
      return newReq;
    }
  },

  async updateRequestStatus(id, status) {
    if (usePostgres) {
      await pgPool.query(
        'UPDATE account_requests SET status = $1, reviewed_at = CURRENT_TIMESTAMP WHERE id = $2',
        [status, id]
      );
    } else {
      const req = fileStore.data.account_requests?.find(r => r.id === id);
      if (req) { req.status = status; req.reviewed_at = new Date().toISOString(); fileStore.save(); }
    }
  },

  async updatePendingRequest(id, updates) {
    if (usePostgres) {
      const res = await pgPool.query(
        `UPDATE account_requests
         SET name = $1, password_hash = $2, password_plain = $3, phone = $4,
             kitchen_name = $5, household_size = $6, notes = $7, submitted_at = CURRENT_TIMESTAMP
         WHERE id = $8 RETURNING *`,
        [
          updates.name,
          updates.password_hash,
          updates.password_plain || '',
          updates.phone || '',
          updates.kitchen_name || '',
          updates.household_size || 2,
          updates.notes || '',
          id
        ]
      );
      return res.rows[0] || null;
    } else {
      const req = fileStore.data.account_requests?.find(r => r.id === id);
      if (req) {
        Object.assign(req, updates, { submitted_at: new Date().toISOString() });
        fileStore.save();
      }
      return req || null;
    }
  },

  async deleteRequest(id) {
    if (usePostgres) {
      await pgPool.query('DELETE FROM account_requests WHERE id = $1', [id]);
    } else {
      const idx = fileStore.data.account_requests?.findIndex(r => r.id === id);
      if (idx !== -1) {
        fileStore.data.account_requests.splice(idx, 1);
        fileStore.save();
      }
    }
  },

  // --- RESET & BACKUP ---
  async resetToSeed() {
    if (usePostgres) {
      await pgPool.query('DELETE FROM alerts');
      await pgPool.query('DELETE FROM items');
      await pgPool.query('DELETE FROM categories');
      for (const cat of initialCategories) {
        await this.createCategory(cat);
      }
      for (const item of initialItems) {
        await this.createItem(item);
      }
      for (const alert of initialAlerts) {
        await this.createAlert(alert);
      }
      await this.updateSettings(initialSettings);
      return { success: true, message: 'Database reset to sample seed data.' };
    } else {
      fileStore.reset();
      return { success: true, message: 'Local storage reset to sample seed data.' };
    }
  },

  async exportData() {
    const categories = await this.getCategories();
    const items = await this.getItems();
    const alerts = await this.getAlerts();
    const settings = await this.getSettings();
    return {
      version: '1.0.0',
      exported_at: new Date().toISOString(),
      categories,
      items,
      alerts,
      settings
    };
  },

  async importData(imported) {
    if (!imported || !Array.isArray(imported.categories) || !Array.isArray(imported.items)) {
      throw new Error('Invalid import format. Expected categories and items arrays.');
    }
    if (usePostgres) {
      await pgPool.query('DELETE FROM alerts');
      await pgPool.query('DELETE FROM items');
      await pgPool.query('DELETE FROM categories');
      for (const cat of imported.categories) {
        await this.createCategory(cat);
      }
      for (const item of imported.items) {
        await this.createItem(item);
      }
      if (Array.isArray(imported.alerts)) {
        for (const alert of imported.alerts) {
          await this.createAlert(alert);
        }
      }
      if (imported.settings) {
        await this.updateSettings(imported.settings);
      }
    } else {
      fileStore.data = {
        categories: imported.categories,
        items: imported.items,
        alerts: imported.alerts || [],
        settings: imported.settings || initialSettings
      };
      fileStore.save();
    }
    return { success: true, count_categories: imported.categories.length, count_items: imported.items.length };
  },

  // --- SEED NEW USER STARTER INVENTORY ---
  // Called once each time a brand-new customer account is approved.
  // Inserts 2 default categories + 10 basic food items into the SHARED inventory
  // using ON CONFLICT DO NOTHING so existing entries are never overwritten.
  async seedNewUserInventory() {
    const { v4: uuid } = await import('uuid');

    const starterCategories = [
      {
        id: 'cat-starter-pantry',
        name: 'Essential Pantry Staples',
        icon: 'ShoppingBag',
        color: 'amber',
        order_index: 10
      },
      {
        id: 'cat-starter-produce',
        name: 'Fresh Produce Basics',
        icon: 'Apple',
        color: 'emerald',
        order_index: 11
      }
    ];

    const starterItems = [
      // Essential Pantry Staples (5 items)
      { name: 'Basmati Rice',        category_id: 'cat-starter-pantry',   unit: 'kg',     current_quantity: 5,   weekly_usage: 2,   low_stock_threshold: 2,   status: 'in_stock',  icon: 'Wheat',      notes: 'Long-grain aromatic rice for daily meals' },
      { name: 'Cooking Oil',         category_id: 'cat-starter-pantry',   unit: 'liters', current_quantity: 2,   weekly_usage: 0.5, low_stock_threshold: 0.5, status: 'in_stock',  icon: 'Droplets',   notes: 'All-purpose vegetable oil for frying and cooking' },
      { name: 'Table Salt',          category_id: 'cat-starter-pantry',   unit: 'kg',     current_quantity: 1,   weekly_usage: 0.1, low_stock_threshold: 0.2, status: 'in_stock',  icon: 'Sparkles',   notes: 'Iodised table salt' },
      { name: 'All-Purpose Flour',   category_id: 'cat-starter-pantry',   unit: 'kg',     current_quantity: 3,   weekly_usage: 0.8, low_stock_threshold: 1,   status: 'in_stock',  icon: 'Wheat',      notes: 'Flour for bread, roti, and baking' },
      { name: 'White Sugar',         category_id: 'cat-starter-pantry',   unit: 'kg',     current_quantity: 2,   weekly_usage: 0.3, low_stock_threshold: 0.5, status: 'in_stock',  icon: 'Cookie',     notes: 'Granulated white sugar for tea and baking' },
      // Fresh Produce Basics (5 items)
      { name: 'Onions',              category_id: 'cat-starter-produce',  unit: 'kg',     current_quantity: 2,   weekly_usage: 1,   low_stock_threshold: 1,   status: 'in_stock',  icon: 'Circle',     notes: 'Yellow onions for everyday cooking' },
      { name: 'Tomatoes',            category_id: 'cat-starter-produce',  unit: 'kg',     current_quantity: 1.5, weekly_usage: 1,   low_stock_threshold: 0.5, status: 'in_stock',  icon: 'Cherry',     notes: 'Fresh tomatoes for curries and salads' },
      { name: 'Potatoes',            category_id: 'cat-starter-produce',  unit: 'kg',     current_quantity: 3,   weekly_usage: 1.5, low_stock_threshold: 1,   status: 'in_stock',  icon: 'Circle',     notes: 'Versatile potatoes for curries and frying' },
      { name: 'Garlic',              category_id: 'cat-starter-produce',  unit: 'pieces', current_quantity: 6,   weekly_usage: 2,   low_stock_threshold: 2,   status: 'in_stock',  icon: 'Flower',     notes: 'Fresh garlic bulbs for flavouring' },
      { name: 'Green Chilies',       category_id: 'cat-starter-produce',  unit: 'pieces', current_quantity: 10,  weekly_usage: 5,   low_stock_threshold: 3,   status: 'in_stock',  icon: 'Flame',      notes: 'Fresh green chilies for spice' }
    ];

    if (usePostgres) {
      // Insert categories (skip if already present)
      for (const cat of starterCategories) {
        await pgPool.query(
          `INSERT INTO categories (id, name, icon, color, order_index)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (id) DO NOTHING`,
          [cat.id, cat.name, cat.icon, cat.color, cat.order_index]
        );
      }
      // Insert items (skip if already present)
      for (const item of starterItems) {
        const itemId = `item-starter-${item.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
        await pgPool.query(
          `INSERT INTO items (id, name, category_id, unit, current_quantity, weekly_usage, low_stock_threshold, status, icon, notes, last_updated)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           ON CONFLICT (id) DO NOTHING`,
          [
            itemId,
            item.name,
            item.category_id,
            item.unit,
            item.current_quantity,
            item.weekly_usage,
            item.low_stock_threshold,
            item.status,
            item.icon,
            item.notes,
            new Date().toISOString()
          ]
        );
      }
    } else {
      // File store fallback — insert only if not already present
      for (const cat of starterCategories) {
        const exists = fileStore.data.categories?.find(c => c.id === cat.id);
        if (!exists) {
          fileStore.data.categories = fileStore.data.categories || [];
          fileStore.data.categories.push(cat);
        }
      }
      for (const item of starterItems) {
        const itemId = `item-starter-${item.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
        const exists = fileStore.data.items?.find(i => i.id === itemId);
        if (!exists) {
          fileStore.data.items = fileStore.data.items || [];
          fileStore.data.items.push({ ...item, id: itemId, last_updated: new Date().toISOString() });
        }
      }
      fileStore.save();
    }

    console.log(`✅ Starter inventory seeded: ${starterCategories.length} categories + ${starterItems.length} items.`);
    return { categories: starterCategories.length, items: starterItems.length };
  }
};

