import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/db.js';

const router = express.Router();

// GET /api/categories - List all categories with dynamic item_count
router.get('/', async (req, res) => {
  try {
    const categories = await db.getCategories();
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/categories/:id - Get single category
router.get('/:id', async (req, res) => {
  try {
    const category = await db.getCategoryById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }
    res.json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/categories - Create new category
router.post('/', async (req, res) => {
  try {
    const { name, icon, color, order_index } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Category name is required' });
    }

    const newCategory = {
      id: `cat-${uuidv4().slice(0, 8)}`,
      name: name.trim(),
      icon: icon || 'Folder',
      color: color || 'emerald',
      order_index: Number.isInteger(order_index) ? order_index : 0
    };

    const created = await db.createCategory(newCategory);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/categories/:id - Update category
router.put('/:id', async (req, res) => {
  try {
    const { name, icon, color, order_index } = req.body;
    const existing = await db.getCategoryById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (icon !== undefined) updates.icon = icon;
    if (color !== undefined) updates.color = color;
    if (order_index !== undefined) updates.order_index = order_index;

    const updated = await db.updateCategory(req.params.id, updates);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/categories/:id - Delete category
router.delete('/:id', async (req, res) => {
  try {
    const existing = await db.getCategoryById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    await db.deleteCategory(req.params.id);
    res.json({ success: true, message: 'Category and associated items deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
