import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, AlertCircle, CheckCircle2, Check, ArrowRight, Trash2 } from 'lucide-react';
import { useAlerts } from '../../context/AlertContext';

export default function AlertsDropdown({ isOpen, onClose }) {
  const { alerts, unreadCount, markAsRead, markAllAsRead } = useAlerts();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const formatRelativeTime = (isoString) => {
    if (!isoString) return 'Just now';
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const getAlertIcon = (type) => {
    if (type === 'out_of_stock') {
      return (
        <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-4 h-4" />
        </div>
      );
    }
    if (type === 'low_stock') {
      return (
        <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
          <AlertCircle className="w-4 h-4" />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
        <CheckCircle2 className="w-4 h-4" />
      </div>
    );
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-elevation overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              Kitchen alerts
            </h4>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              Mark all read
            </button>
          )}
        </div>

        {/* List of Alerts */}
        <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
          {alerts.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
              No recent notifications
            </div>
          ) : (
            alerts.slice(0, 6).map((alert) => (
              <div
                key={alert.id}
                onClick={() => markAsRead(alert.id)}
                className={`p-3.5 flex items-start gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors ${
                  !alert.read ? 'bg-emerald-50/20 dark:bg-emerald-950/10' : ''
                }`}
              >
                {getAlertIcon(alert.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p
                      className={`text-xs truncate ${
                        !alert.read
                          ? 'font-semibold text-slate-900 dark:text-slate-100'
                          : 'font-medium text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {alert.item_name || 'Inventory Alert'}
                    </p>
                    <span className="text-[10px] text-slate-400 flex-shrink-0">
                      {formatRelativeTime(alert.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-tight">
                    {alert.message}
                  </p>
                </div>
                {!alert.read && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 mt-1.5" />
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-2.5 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => {
              onClose();
              navigate('/alerts');
            }}
            className="w-full py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl transition-colors flex items-center justify-center gap-1"
          >
            <span>View all alerts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </>
  );
}
