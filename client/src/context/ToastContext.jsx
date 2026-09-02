import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast = { id, message, type };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    warning: (msg, dur) => addToast(msg, 'warning', dur),
    error: (msg, dur) => addToast(msg, 'error', dur),
    info: (msg, dur) => addToast(msg, 'info', dur),
  };

  return (
    <ToastContext.Provider value={{ toast, addToast, removeToast }}>
      {children}
      {/* Toast Render Portal */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => {
          let bgClass = 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-700';
          let IconComponent = Info;
          let iconColor = 'text-blue-400 dark:text-blue-600';

          if (t.type === 'success') {
            bgClass = 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-emerald-500/40 shadow-lg';
            IconComponent = CheckCircle2;
            iconColor = 'text-emerald-500';
          } else if (t.type === 'warning') {
            bgClass = 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-amber-500/40 shadow-lg';
            IconComponent = AlertTriangle;
            iconColor = 'text-amber-500';
          } else if (t.type === 'error') {
            bgClass = 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-rose-500/40 shadow-lg';
            IconComponent = AlertCircle;
            iconColor = 'text-rose-500';
          }

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-card transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 ${bgClass}`}
            >
              <IconComponent className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColor}`} />
              <div className="flex-1 text-sm font-medium leading-snug">{t.message}</div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
