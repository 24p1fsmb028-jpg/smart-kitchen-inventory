import express from 'express';
import { db } from '../db/db.js';
import { calculateDaysRemaining } from '../services/stockEngine.js';

const router = express.Router();

// GET /api/stats - Dashboard summary metrics & urgent items
router.get('/', async (req, res) => {
  try {
    const categories = await db.getCategories();
    const items = await db.getItems();
    const alerts = await db.getAlerts(100);

    const totalItems = items.length;
    const totalCategories = categories.length;
    const outOfStockItems = items.filter((i) => i.status === 'out_of_stock');
    const lowStockItems = items.filter((i) => i.status === 'low');
    const inStockItems = items.filter((i) => i.status === 'in_stock');
    const unreadAlertsCount = alerts.filter((a) => !a.read).length;

    // Needs attention list: Out of stock first, then low stock, sorted by urgency
    const needsAttention = [...outOfStockItems, ...lowStockItems]
      .map((item) => ({
        ...item,
        days_remaining: calculateDaysRemaining(item.current_quantity, item.weekly_usage)
      }))
      .sort((a, b) => {
        if (a.status === 'out_of_stock' && b.status !== 'out_of_stock') return -1;
        if (b.status === 'out_of_stock' && a.status !== 'out_of_stock') return 1;
        return (a.days_remaining ?? 999) - (b.days_remaining ?? 999);
      })
      .slice(0, 10);

    const healthPercentage = totalItems > 0
      ? Math.round((inStockItems.length / totalItems) * 100)
      : 100;

    res.json({
      success: true,
      data: {
        total_items: totalItems,
        total_categories: totalCategories,
        out_of_stock_count: outOfStockItems.length,
        low_stock_count: lowStockItems.length,
        in_stock_count: inStockItems.length,
        unread_alerts_count: unreadAlertsCount,
        health_percentage: healthPercentage,
        needs_attention: needsAttention
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
