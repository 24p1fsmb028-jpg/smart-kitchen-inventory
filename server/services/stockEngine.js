import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/db.js';

/**
 * Calculates stock status based on current quantity and low stock threshold.
 * - out_of_stock: current_quantity <= 0
 * - low: current_quantity <= low_stock_threshold (but > 0)
 * - in_stock: current_quantity > low_stock_threshold
 */
export function calculateStatus(currentQuantity, lowStockThreshold) {
  const qty = Number(currentQuantity) || 0;
  const threshold = Number(lowStockThreshold) || 0;

  if (qty <= 0) {
    return 'out_of_stock';
  }
  if (qty <= threshold) {
    return 'low';
  }
  return 'in_stock';
}

/**
 * Calculates estimated days remaining based on current quantity and weekly usage.
 */
export function calculateDaysRemaining(currentQuantity, weeklyUsage) {
  const qty = Number(currentQuantity) || 0;
  const usage = Number(weeklyUsage) || 0;

  if (qty <= 0) return 0;
  if (usage <= 0) return null; // Unknown/infinite

  const dailyUsage = usage / 7;
  const days = qty / dailyUsage;
  return Math.round(days * 10) / 10; // 1 decimal place
}

/**
 * Checks for status transition and creates corresponding alerts automatically.
 */
export async function handleStatusTransitionAlert(prevItem, newItem) {
  try {
    const settings = await db.getSettings();
    const notifs = settings.notifications || {};
    if (notifs.enabled === false) return;

    const oldStatus = prevItem ? prevItem.status : null;
    const newStatus = newItem.status;
    const itemName = newItem.name;
    const unit = newItem.unit || 'units';
    const qty = Number(newItem.current_quantity);

    // 1. Transition to OUT OF STOCK
    if (newStatus === 'out_of_stock' && oldStatus !== 'out_of_stock') {
      if (notifs.out_of_stock_alerts !== false) {
        await db.createAlert({
          id: `alert-${uuidv4().slice(0, 8)}`,
          item_id: newItem.id,
          item_name: itemName,
          type: 'out_of_stock',
          message: `${itemName} is out of stock! It has been added to your shopping list.`,
          timestamp: new Date().toISOString(),
          read: false
        });
      }
      return;
    }

    // 2. Transition to LOW STOCK
    if (newStatus === 'low' && oldStatus === 'in_stock') {
      if (notifs.low_stock_alerts !== false) {
        const daysLeft = calculateDaysRemaining(qty, newItem.weekly_usage);
        const daysText = daysLeft !== null ? ` (Est. ~${daysLeft} days remaining)` : '';
        await db.createAlert({
          id: `alert-${uuidv4().slice(0, 8)}`,
          item_id: newItem.id,
          item_name: itemName,
          type: 'low_stock',
          message: `${itemName} is running low (${qty} ${unit} left)${daysText}.`,
          timestamp: new Date().toISOString(),
          read: false
        });
      }
      return;
    }

    // 3. Transition to RESTOCKED (from low or out_of_stock to in_stock)
    if (newStatus === 'in_stock' && (oldStatus === 'low' || oldStatus === 'out_of_stock')) {
      if (notifs.restock_alerts !== false) {
        await db.createAlert({
          id: `alert-${uuidv4().slice(0, 8)}`,
          item_id: newItem.id,
          item_name: itemName,
          type: 'restocked',
          message: `${itemName} was restocked to ${qty} ${unit}. Stock health restored!`,
          timestamp: new Date().toISOString(),
          read: false
        });
      }
      return;
    }
  } catch (err) {
    console.error('Error creating status transition alert:', err);
  }
}
