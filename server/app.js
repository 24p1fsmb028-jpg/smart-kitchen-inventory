import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDB } from './db/db.js';
import categoriesRouter from './routes/categories.js';
import itemsRouter from './routes/items.js';
import alertsRouter from './routes/alerts.js';
import shoppingListRouter from './routes/shoppingList.js';
import settingsRouter from './routes/settings.js';
import statsRouter from './routes/stats.js';
import authRouter from './routes/auth.js';
import adminRouter from './routes/admin.js';

dotenv.config();

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging Middleware in development
if (process.env.NODE_ENV !== 'test') {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[${req.method}] ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    });
    next();
  });
}

// Health Check
const healthHandler = (req, res) => {
  res.json({
    status: 'ok',
    service: 'Smart Kitchen Inventory API',
    timestamp: new Date().toISOString()
  });
};
app.get('/api/health', healthHandler);
app.get('/health', healthHandler);

let dbPromise = null;
export async function ensureDB() {
  if (!dbPromise) {
    dbPromise = initDB().catch((err) => {
      console.error('Database connection error in ensureDB:', err);
      dbPromise = null;
      throw err;
    });
  }
  return dbPromise;
}

// Ensure database is initialized before any route executes
app.use(async (req, res, next) => {
  try {
    await ensureDB();
  } catch (err) {
    console.warn('DB initialization deferred:', err.message);
  }
  next();
});

// Mount Routes (support both /api/path and /path for Vercel rewrites)
app.use('/api/auth', authRouter);
app.use('/auth', authRouter);

app.use('/api/admin', adminRouter);
app.use('/admin', adminRouter);

app.use('/api/categories', categoriesRouter);
app.use('/categories', categoriesRouter);

app.use('/api/items', itemsRouter);
app.use('/items', itemsRouter);

app.use('/api/alerts', alertsRouter);
app.use('/alerts', alertsRouter);

app.use('/api/shopping-list', shoppingListRouter);
app.use('/shopping-list', shoppingListRouter);

app.use('/api/settings', settingsRouter);
app.use('/settings', settingsRouter);

app.use('/api/stats', statsRouter);
app.use('/stats', statsRouter);

// Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

export default app;
