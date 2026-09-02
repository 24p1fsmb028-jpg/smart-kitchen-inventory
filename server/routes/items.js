import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/db.js';
import { calculateStatus, calculateDaysRemaining, handleStatusTransitionAlert } from '../services/stockEngine.js';

const router = express.Router();

// Helper to enrich item with days_remaining
function enrichItem(item) {
  if (!item) return null;
  const days_remaining = calculateDaysRemaining(item.current_quantity, item.weekly_usage);
  return {
    ...item,
    days_remaining
  };
}

// GET /api/items - List all items with optional filters
router.get('/', async (req, res) => {
  try {
    const { category_id, status, search } = req.query;
    const items = await db.getItems({ category_id, status, search });
    const enriched = items.map(enrichItem);
    res.json({ success: true, data: enriched });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/items/:id - Get single item
router.get('/:id', async (req, res) => {
  try {
    const item = await db.getItemById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }
    res.json({ success: true, data: enrichItem(item) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/items - Create a new item
router.post('/', async (req, res) => {
  try {
    const {
      name,
      category_id,
      unit,
      current_quantity,
      weekly_usage,
      low_stock_threshold,
      icon,
      notes
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Item name is required' });
    }
    if (!category_id) {
      return res.status(400).json({ success: false, error: 'Category is required' });
    }

    const qty = current_quantity !== undefined ? parseFloat(current_quantity) : 0;
    const threshold = low_stock_threshold !== undefined ? parseFloat(low_stock_threshold) : 1;
    const usage = weekly_usage !== undefined ? parseFloat(weekly_usage) : 1;

    // Automatically calculate status
    const status = calculateStatus(qty, threshold);

    const newItem = {
      id: `item-${uuidv4().slice(0, 8)}`,
      name: name.trim(),
      category_id,
      unit: unit || 'pieces',
      current_quantity: qty,
      weekly_usage: usage,
      low_stock_threshold: threshold,
      status,
      icon: icon || 'Package',
      notes: notes || '',
      last_updated: new Date().toISOString()
    };

    const created = await db.createItem(newItem);

    // Alert if created with low or out_of_stock status
    await handleStatusTransitionAlert(null, created);

    const fullItem = await db.getItemById(created.id);
    res.status(201).json({ success: true, data: enrichItem(fullItem) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/items/:id - Update an item
router.put('/:id', async (req, res) => {
  try {
    const existing = await db.getItemById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    const {
      name,
      category_id,
      unit,
      current_quantity,
      weekly_usage,
      low_stock_threshold,
      icon,
      notes
    } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (category_id !== undefined) updates.category_id = category_id;
    if (unit !== undefined) updates.unit = unit;
    if (icon !== undefined) updates.icon = icon;
    if (notes !== undefined) updates.notes = notes;

    const nextQty = current_quantity !== undefined ? parseFloat(current_quantity) : existing.current_quantity;
    const nextThreshold = low_stock_threshold !== undefined ? parseFloat(low_stock_threshold) : existing.low_stock_threshold;
    const nextUsage = weekly_usage !== undefined ? parseFloat(weekly_usage) : existing.weekly_usage;

    updates.current_quantity = nextQty;
    updates.low_stock_threshold = nextThreshold;
    updates.weekly_usage = nextUsage;

    // Recalculate status
    const newStatus = calculateStatus(nextQty, nextThreshold);
    updates.status = newStatus;

    const updated = await db.updateItem(req.params.id, updates);

    // Check & generate automated alert on status transition
    await handleStatusTransitionAlert(existing, updated);

    const fullItem = await db.getItemById(req.params.id);
    res.json({ success: true, data: enrichItem(fullItem) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/items/:id/quantity - Quick adjust quantity (+ / - / set)
router.patch('/:id/quantity', async (req, res) => {
  try {
    const existing = await db.getItemById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    const { delta, quantity } = req.body;
    let nextQty = existing.current_quantity;

    if (quantity !== undefined) {
      nextQty = parseFloat(quantity);
    } else if (delta !== undefined) {
      nextQty = Math.max(0, Math.round((existing.current_quantity + parseFloat(delta)) * 100) / 100);
    }

    const newStatus = calculateStatus(nextQty, existing.low_stock_threshold);
    const updated = await db.updateItem(req.params.id, {
      current_quantity: nextQty,
      status: newStatus
    });

    await handleStatusTransitionAlert(existing, updated);

    const fullItem = await db.getItemById(req.params.id);
    res.json({ success: true, data: enrichItem(fullItem) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/items/:id/restock - Quick restock to recommended quantity
router.post('/:id/restock', async (req, res) => {
  try {
    const existing = await db.getItemById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    const targetQty = req.body.quantity !== undefined
      ? parseFloat(req.body.quantity)
      : Math.max(existing.low_stock_threshold * 2, existing.weekly_usage * 1.5, 2);

    const newStatus = calculateStatus(targetQty, existing.low_stock_threshold);
    const updated = await db.updateItem(req.params.id, {
      current_quantity: targetQty,
      status: newStatus
    });

    await handleStatusTransitionAlert(existing, updated);

    const fullItem = await db.getItemById(req.params.id);
    res.json({ success: true, data: enrichItem(fullItem), message: `${existing.name} restocked to ${targetQty} ${existing.unit}!` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/items/:id - Delete an item
router.delete('/:id', async (req, res) => {
  try {
    const existing = await db.getItemById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    await db.deleteItem(req.params.id);
    res.json({ success: true, message: 'Item deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
