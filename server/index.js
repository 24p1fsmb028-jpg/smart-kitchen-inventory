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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

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
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Smart Kitchen Inventory API',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/categories', categoriesRouter);
app.use('/api/items', itemsRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/shopping-list', shoppingListRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/stats', statsRouter);

// 404 Handler
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, error: `API route not found: ${req.originalUrl}` });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// Start Server
async function startServer() {
  await initDB();
  app.listen(PORT, () => {
    console.log(`🚀 Smart Kitchen Inventory API server running at http://localhost:${PORT}`);
  });
}

startServer();
