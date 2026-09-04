import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/db.js';
import { calculateStatus, calculateDaysRemaining, handleStatusTransitionAlert } from '../services/stockEngine.js';

const router = express.Router();

// GET /api/shopping-list - Get auto-derived shopping list (Buy now vs Well stocked)
router.get('/', async (req, res) => {
  try {
    const allItems = await db.getItems();
    const settings = await db.getSettings();
    const checkedIds = new Set(settings.checked_shopping_ids || []);

    const buyNowItems = [];
    const wellStockedItems = [];

    for (const item of allItems) {
      const isChecked = checkedIds.has(item.id);
      const daysLeft = calculateDaysRemaining(item.current_quantity, item.weekly_usage);
      
      // Calculate recommended purchase quantity to reach a healthy stock (2x threshold or 2 weeks usage)
      const recommendedTarget = Math.max(
        (item.low_stock_threshold || 1) * 2,
        (item.weekly_usage || 1) * 1.5,
        2
      );
      const recommendedBuyQty = Math.max(
        1,
        Math.round((recommendedTarget - item.current_quantity) * 10) / 10
      );

      const entry = {
        ...item,
        days_remaining: daysLeft,
        recommended_buy_quantity: recommendedBuyQty,
        checked: isChecked
      };

      if (item.status === 'out_of_stock' || item.status === 'low') {
        buyNowItems.push(entry);
      } else {
        wellStockedItems.push(entry);
      }
    }

    // Sort buy now: out of stock first, then low stock, then by name
    buyNowItems.sort((a, b) => {
      if (a.checked !== b.checked) return a.checked ? 1 : -1;
      if (a.status === 'out_of_stock' && b.status !== 'out_of_stock') return -1;
      if (b.status === 'out_of_stock' && a.status !== 'out_of_stock') return 1;
      return a.name.localeCompare(b.name);
    });

    res.json({
      success: true,
      data: {
        buy_now: buyNowItems,
        well_stocked: wellStockedItems,
        summary: {
          total_to_buy: buyNowItems.length,
          checked_count: buyNowItems.filter(i => i.checked).length,
          out_of_stock_count: buyNowItems.filter(i => i.status === 'out_of_stock').length,
          low_stock_count: buyNowItems.filter(i => i.status === 'low').length
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/shopping-list/check/:itemId - Toggle or set item checked status
router.patch('/check/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const { checked } = req.body;
    const checkedIds = await db.toggleShoppingChecked(itemId, checked);
    res.json({ success: true, checked_ids: checkedIds });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/shopping-list/restock-checked - Restock all checked items at once
router.post('/restock-checked', async (req, res) => {
  try {
    const settings = await db.getSettings();
    const checkedIds = settings.checked_shopping_ids || [];

    if (checkedIds.length === 0) {
      return res.status(400).json({ success: false, message: 'No items currently checked' });
    }

    const restockedItems = [];

    for (const id of checkedIds) {
      const item = await db.getItemById(id);
      if (item) {
        // Target: double the threshold or 2 weeks usage
        const targetQty = Math.max((item.low_stock_threshold || 1) * 2, (item.weekly_usage || 1) * 2, 2);
        const newStatus = calculateStatus(targetQty, item.low_stock_threshold);
        const updated = await db.updateItem(id, {
          current_quantity: targetQty,
          status: newStatus
        });
        await handleStatusTransitionAlert(item, updated);
        restockedItems.push(updated);
      }
    }

    // Clear checked list
    await db.updateSettings({ checked_shopping_ids: [] });

    res.json({
      success: true,
      message: `Successfully restocked ${restockedItems.length} items!`,
      restocked_count: restockedItems.length
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/shopping-list/save - Persist a snapshot shopping list for PDF generation & scanning
router.post('/save', async (req, res) => {
  try {
    const { items, kitchenName, userId } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Cannot save an empty shopping list.' });
    }

    const shoppingListId = `sl-${uuidv4().slice(0, 12)}`;
    const listData = {
      id: shoppingListId,
      user_id: userId || null,
      kitchen_name: kitchenName || 'My Kitchen',
      source: 'pdf_export',
      created_at: new Date().toISOString()
    };

    const formattedItems = items.map((item, idx) => ({
      id: `sli-${uuidv4().slice(0, 8)}`,
      item_id: item.id || item.item_id,
      item_name: item.name || item.item_name,
      quantity: parseFloat(item.recommended_buy_quantity || item.quantity || 1),
      unit: item.unit || 'pieces'
    }));

    const saved = await db.createShoppingList(listData, formattedItems);

    res.json({
      success: true,
      shopping_list_id: shoppingListId,
      total_items: formattedItems.length,
      list: saved,
      items: formattedItems
    });
  } catch (err) {
    console.error('Error saving shopping list:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/shopping-list/history - Retrieve user's saved shopping lists
router.get('/history', async (req, res) => {
  try {
    const userId = req.query.userId || null;
    const lists = await db.getShoppingListsByUser(userId, 20);
    res.json({ success: true, lists });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/shopping-list/:id - Get specific shopping list details and items
router.get('/:id', async (req, res) => {
  try {
    const list = await db.getShoppingListById(req.params.id);
    if (!list) {
      return res.status(404).json({ success: false, error: 'Shopping list not found.' });
    }
    const items = await db.getShoppingListItems(req.params.id);
    res.json({ success: true, list, items });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

