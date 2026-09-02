import express from 'express';
import { db } from '../db/db.js';

const router = express.Router();

// GET /api/settings - Get all user settings & profile
router.get('/', async (req, res) => {
  try {
    const settings = await db.getSettings();
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/settings - Update profile & notification preferences
router.put('/', async (req, res) => {
  try {
    const updated = await db.updateSettings(req.body);
    res.json({ success: true, data: updated, message: 'Settings saved successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/settings/reset - Reset database to demo seed data
router.post('/reset', async (req, res) => {
  try {
    const result = await db.resetToSeed();
    res.json({ success: true, message: result.message });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/settings/export - Export full JSON backup
router.get('/export', async (req, res) => {
  try {
    const exported = await db.exportData();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=smart-kitchen-inventory-${new Date().toISOString().split('T')[0]}.json`);
    res.json(exported);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/settings/import - Import JSON backup
router.post('/import', async (req, res) => {
  try {
    const payload = req.body;
    const result = await db.importData(payload);
    res.json({ success: true, message: `Import successful: ${result.count_categories} categories and ${result.count_items} items imported.` });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
