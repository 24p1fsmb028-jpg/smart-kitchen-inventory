import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useToast } from './ToastContext';

const InventoryContext = createContext(null);

export function InventoryProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { toast } = useToast();

  const refreshAll = useCallback(async () => {
    try {
      setLoading(true);
      const [catsRes, itemsRes, statsRes] = await Promise.all([
        api.getCategories(),
        api.getItems(),
        api.getStats()
      ]);
      setCategories(catsRes.data || []);
      setItems(itemsRes.data || []);
      setStats(statsRes.data || null);
    } catch (err) {
      console.error('Failed to load inventory data:', err);
      toast.error('Failed to load inventory data. Check connection.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll, refreshTrigger]);

  const triggerRefresh = () => setRefreshTrigger((prev) => prev + 1);

  // --- ITEM ACTIONS ---
  const addItem = async (itemData) => {
    try {
      const res = await api.createItem(itemData);
      toast.success(`"${res.data.name}" added to inventory.`);
      triggerRefresh();
      return res.data;
    } catch (err) {
      toast.error(err.message || 'Failed to add item');
      throw err;
    }
  };

  const updateItem = async (id, updates) => {
    try {
      const res = await api.updateItem(id, updates);
      toast.success(`"${res.data.name}" updated successfully.`);
      triggerRefresh();
      return res.data;
    } catch (err) {
      toast.error(err.message || 'Failed to update item');
      throw err;
    }
  };

  const adjustQuantity = async (id, delta, directQty = undefined) => {
    try {
      // Optimistic update
      setItems((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item;
          const nextQty = directQty !== undefined ? directQty : Math.max(0, Math.round((item.current_quantity + delta) * 100) / 100);
          let newStatus = 'in_stock';
          if (nextQty <= 0) newStatus = 'out_of_stock';
          else if (nextQty <= item.low_stock_threshold) newStatus = 'low';
          return { ...item, current_quantity: nextQty, status: newStatus };
        })
      );

      const res = await api.adjustItemQuantity(id, delta, directQty);
      triggerRefresh();
      return res.data;
    } catch (err) {
      toast.error(err.message || 'Failed to update stock');
      triggerRefresh();
      throw err;
    }
  };

  const restockItem = async (id, quantity) => {
    try {
      const res = await api.restockItem(id, quantity);
      toast.success(res.message || 'Item restocked!');
      triggerRefresh();
      return res.data;
    } catch (err) {
      toast.error(err.message || 'Failed to restock item');
      throw err;
    }
  };

  const deleteItem = async (id, name = 'Item') => {
    try {
      await api.deleteItem(id);
      toast.info(`"${name}" deleted.`);
      triggerRefresh();
    } catch (err) {
      toast.error(err.message || 'Failed to delete item');
      throw err;
    }
  };

  // --- CATEGORY ACTIONS ---
  const addCategory = async (catData) => {
    try {
      const res = await api.createCategory(catData);
      toast.success(`Category "${res.data.name}" created.`);
      triggerRefresh();
      return res.data;
    } catch (err) {
      toast.error(err.message || 'Failed to create category');
      throw err;
    }
  };

  const updateCategory = async (id, catData) => {
    try {
      const res = await api.updateCategory(id, catData);
      toast.success(`Category "${res.data.name}" updated.`);
      triggerRefresh();
      return res.data;
    } catch (err) {
      toast.error(err.message || 'Failed to update category');
      throw err;
    }
  };

  const deleteCategory = async (id, name = 'Category') => {
    try {
      await api.deleteCategory(id);
      toast.info(`Category "${name}" and its items deleted.`);
      triggerRefresh();
    } catch (err) {
      toast.error(err.message || 'Failed to delete category');
      throw err;
    }
  };

  return (
    <InventoryContext.Provider
      value={{
        categories,
        items,
        stats,
        loading,
        refreshAll,
        addItem,
        updateItem,
        adjustQuantity,
        restockItem,
        deleteItem,
        addCategory,
        updateCategory,
        deleteCategory
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
