import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useToast } from './ToastContext';

const AlertContext = createContext(null);

export function AlertProvider({ children }) {
  const [alerts, setAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await api.getAlerts();
      setAlerts(res.data || []);
      setUnreadCount(res.unread_count || 0);
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    // Periodic refresh every 15 seconds
    const interval = setInterval(fetchAlerts, 15000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  const markAsRead = async (id) => {
    try {
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, read: true } : a))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      await api.markAlertRead(id);
    } catch (err) {
      console.error('Failed to mark alert read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
      setUnreadCount(0);
      await api.markAllAlertsRead();
      toast.success('All alerts marked as read.');
    } catch (err) {
      toast.error('Failed to mark all alerts as read');
    }
  };

  const deleteAlert = async (id) => {
    try {
      setAlerts((prev) => prev.filter((a) => a.id !== id));
      await api.deleteAlert(id);
    } catch (err) {
      console.error('Failed to delete alert:', err);
    }
  };

  const clearAll = async () => {
    try {
      setAlerts([]);
      setUnreadCount(0);
      await api.clearAllAlerts();
      toast.info('All alerts cleared.');
    } catch (err) {
      toast.error('Failed to clear alerts');
    }
  };

  return (
    <AlertContext.Provider
      value={{
        alerts,
        unreadCount,
        loading,
        fetchAlerts,
        markAsRead,
        markAllAsRead,
        deleteAlert,
        clearAll
      }}
    >
      {children}
    </AlertContext.Provider>
  );
}

export const useAlerts = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlerts must be used within an AlertProvider');
  }
  return context;
};
