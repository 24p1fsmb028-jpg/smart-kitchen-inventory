import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowRight, ShoppingBag } from 'lucide-react';

export default function AlertBanner({ outOfStockCount = 0, lowStockCount = 0 }) {
  const navigate = useNavigate();

  if (outOfStockCount === 0 && lowStockCount === 0) {
    return null;
  }

  const isSevere = outOfStockCount > 0;

  const bgStyle = isSevere
    ? 'bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-900/60 text-rose-950 dark:text-rose-100'
    : 'bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-900/60 text-amber-950 dark:text-amber-100';

  const iconColor = isSevere ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400';
  const buttonStyle = isSevere
    ? 'bg-rose-600 hover:bg-rose-700 text-white'
    : 'bg-amber-600 hover:bg-amber-700 text-white';

  return (
    <div
      className={`rounded-card border p-4 sm:p-4.5 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 transition-all ${bgStyle}`}
    >
      <div className="flex items-start sm:items-center gap-3">
        <div className={`p-2 rounded-xl bg-white/80 dark:bg-slate-900/80 shadow-xs flex-shrink-0 ${iconColor}`}>
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-semibold text-sm sm:text-base leading-tight">
            {outOfStockCount > 0 && lowStockCount > 0 ? (
              <span>
                {outOfStockCount} {outOfStockCount === 1 ? 'item is' : 'items are'} out of stock and {lowStockCount} running low
              </span>
            ) : outOfStockCount > 0 ? (
              <span>
                {outOfStockCount} {outOfStockCount === 1 ? 'item is' : 'items are'} currently out of stock
              </span>
            ) : (
              <span>
                {lowStockCount} {lowStockCount === 1 ? 'item is' : 'items are'} running low on stock
              </span>
            )}
          </h4>
          <p className="text-xs opacity-80 mt-0.5">
            Your automated shopping list has been updated to replenish essential kitchen stock.
          </p>
        </div>
      </div>

      <button
        onClick={() => navigate('/shopping-list')}
        className={`px-4 py-2 text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 flex-shrink-0 ${buttonStyle}`}
      >
        <ShoppingBag className="w-4 h-4" />
        <span>See Shopping List</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
