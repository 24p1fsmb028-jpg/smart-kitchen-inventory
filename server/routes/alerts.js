import express from 'express';
import { db } from '../db/db.js';

const router = express.Router();

// GET /api/alerts - List all alerts
router.get('/', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 100;
    const alerts = await db.getAlerts(limit);
    const unreadCount = alerts.filter((a) => !a.read).length;
    res.json({
      success: true,
      data: alerts,
      unread_count: unreadCount,
      total_count: alerts.length
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/alerts/unread-count - Fast unread counter for navbar badge
router.get('/unread-count', async (req, res) => {
  try {
    const alerts = await db.getAlerts(100);
    const unreadCount = alerts.filter((a) => !a.read).length;
    res.json({ success: true, count: unreadCount });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/alerts/:id/read - Mark single alert as read
router.patch('/:id/read', async (req, res) => {
  try {
    const updated = await db.markAlertAsRead(req.params.id);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/alerts/read-all - Mark all alerts as read
router.post('/read-all', async (req, res) => {
  try {
    await db.markAllAlertsAsRead();
    res.json({ success: true, message: 'All alerts marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/alerts/:id - Delete an alert
router.delete('/:id', async (req, res) => {
  try {
    await db.deleteAlert(req.params.id);
    res.json({ success: true, message: 'Alert dismissed' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/alerts - Clear all alerts
router.delete('/', async (req, res) => {
  try {
    await db.clearAllAlerts();
    res.json({ success: true, message: 'All alerts cleared' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
