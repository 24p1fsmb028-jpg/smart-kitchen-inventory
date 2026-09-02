import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';

const ShoppingListContext = createContext(null);

export function ShoppingListProvider({ children }) {
  const [buyNowItems, setBuyNowItems] = useState([]);
  const [wellStockedItems, setWellStockedItems] = useState([]);
  const [summary, setSummary] = useState({ total_to_buy: 0, checked_count: 0, out_of_stock_count: 0, low_stock_count: 0 });
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  const fetchShoppingList = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const res = await api.getShoppingList();
      if (res.data) {
        setBuyNowItems(res.data.buy_now || []);
        setWellStockedItems(res.data.well_stocked || []);
        setSummary(res.data.summary || {});
      }
    } catch (err) {
      console.error('Failed to fetch shopping list:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchShoppingList();
    }
  }, [fetchShoppingList, isAuthenticated]);

  const toggleCheck = async (itemId, currentChecked) => {
    const nextChecked = !currentChecked;
    // Optimistic update
    setBuyNowItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, checked: nextChecked } : item))
    );
    setSummary((prev) => ({
      ...prev,
      checked_count: nextChecked ? prev.checked_count + 1 : Math.max(0, prev.checked_count - 1)
    }));

    try {
      await api.toggleShoppingItem(itemId, nextChecked);
    } catch (err) {
      console.error('Failed to update check state:', err);
      // Revert on error
      fetchShoppingList();
    }
  };

  const restockChecked = async () => {
    try {
      const res = await api.restockCheckedShoppingList();
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 }
      });
      toast.success(res.message || 'Checked items restocked!');
      fetchShoppingList();
      return res;
    } catch (err) {
      toast.error(err.message || 'Failed to restock checked items');
      throw err;
    }
  };

  const getFormattedShareText = () => {
    if (buyNowItems.length === 0) {
      return `🛒 Smart Kitchen Inventory - Shopping List\nAll items are well stocked! 🎉`;
    }

    const grouped = {};
    buyNowItems.forEach((item) => {
      const catName = item.category_name || 'General';
      if (!grouped[catName]) grouped[catName] = [];
      grouped[catName].push(item);
    });

    let text = `🛒 Smart Kitchen Inventory - Shopping List (${new Date().toLocaleDateString()})\n\n`;

    for (const [cat, items] of Object.entries(grouped)) {
      text += `📂 ${cat.toUpperCase()}\n`;
      items.forEach((i) => {
        const checkMark = i.checked ? '✅' : '⬜';
        const urgentTag = i.status === 'out_of_stock' ? ' [URGENT - OUT OF STOCK]' : '';
        const qtyToBuy = i.recommended_buy_quantity || 1;
        text += `  ${checkMark} ${i.name} — Buy ${qtyToBuy} ${i.unit} (Current: ${i.current_quantity} ${i.unit})${urgentTag}\n`;
      });
      text += '\n';
    }

    text += `Generated with Smart Kitchen Inventory`;
    return text;
  };

  return (
    <ShoppingListContext.Provider
      value={{
        buyNowItems,
        wellStockedItems,
        summary,
        loading,
        fetchShoppingList,
        toggleCheck,
        restockChecked,
        getFormattedShareText
      }}
    >
      {children}
    </ShoppingListContext.Provider>
  );
}

export const useShoppingList = () => {
  const context = useContext(ShoppingListContext);
  if (!context) {
    throw new Error('useShoppingList must be used within a ShoppingListProvider');
  }
  return context;
};
