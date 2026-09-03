import React, { useState } from 'react';
import { Minus, Plus, MoreVertical, Edit2, Trash2, RefreshCw, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import DynamicIcon from './DynamicIcon';
import StatusBadge from './StatusBadge';
import StockProgressBar from './StockProgressBar';

export default function ItemRow({
  item,
  onEdit,
  onDelete,
  onQuantityChange,
  onRestock
}) {
  const [expanded, setExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleStep = async (delta) => {
    if (updating) return;
    try {
      setUpdating(true);
      await onQuantityChange(item.id, delta);
    } finally {
      setUpdating(false);
    }
  };

  const getDaysLeftDisplay = () => {
    if (item.current_quantity <= 0) {
      return { text: 'Empty', color: 'text-rose-600 dark:text-rose-400 font-semibold' };
    }
    if (item.days_remaining !== null && item.days_remaining !== undefined) {
      if (item.days_remaining < 1) {
        return { text: '< 1 day left', color: 'text-rose-600 dark:text-rose-400 font-medium' };
      }
      if (item.days_remaining <= 3) {
        return { text: `~${item.days_remaining} days left`, color: 'text-amber-600 dark:text-amber-400 font-medium' };
      }
      return { text: `~${item.days_remaining} days left`, color: 'text-slate-500 dark:text-slate-400' };
    }
    return { text: 'Well stocked', color: 'text-emerald-600 dark:text-emerald-400' };
  };

  const daysInfo = getDaysLeftDisplay();

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card shadow-subtle hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 overflow-visible">
      {/* Main Row */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Icon, Name & Category */}
        <div className="flex items-center gap-3.5 min-w-0 flex-shrink-0 sm:w-52">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center flex-shrink-0">
            <DynamicIcon name={item.icon} className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm sm:text-base truncate">
                {item.name}
              </h4>
              <StatusBadge status={item.status} size="sm" className="sm:hidden" />
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <span>{item.category_name}</span>
              <span>•</span>
              <span>Usage: {item.weekly_usage} {item.unit}/wk</span>
            </div>
          </div>
        </div>

        {/* Middle: Progress Bar & Days left */}
        <div className="flex-1 min-w-0 px-1 sm:px-4">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {item.current_quantity} <span className="text-slate-500 font-normal">{item.unit}</span>
            </span>
            <span className={`flex items-center gap-1 text-xs ${daysInfo.color}`}>
              <Clock className="w-3 h-3" />
              {daysInfo.text}
            </span>
          </div>
          <StockProgressBar
            currentQuantity={item.current_quantity}
            threshold={item.low_stock_threshold}
            weeklyUsage={item.weekly_usage}
            status={item.status}
          />
        </div>

        {/* Right: Status badge, Quantity Stepper & Actions */}
        <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
          <div className="hidden sm:block">
            <StatusBadge status={item.status} />
          </div>

          {/* Quick Stepper Buttons */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => handleStep(-1)}
              disabled={item.current_quantity <= 0 || updating}
              className="p-1 rounded-md text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
              title="Decrease quantity by 1"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-xs font-semibold text-slate-800 dark:text-slate-200 min-w-[28px] text-center">
              {item.current_quantity}
            </span>
            <button
              onClick={() => handleStep(1)}
              disabled={updating}
              className="p-1 rounded-md text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-colors"
              title="Increase quantity by 1"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Restock button for low / out items */}
          {item.status !== 'in_stock' && (
            <button
              onClick={() => onRestock(item.id)}
              className="px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800/60 rounded-lg transition-colors flex items-center gap-1"
              title="Quick restock to target"
            >
              <RefreshCw className="w-3 h-3" />
              <span className="hidden md:inline">Restock</span>
            </button>
          )}

          {/* Options Menu & Expand button */}
          <div className="relative flex items-center gap-1">
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={expanded ? 'Collapse details' : 'Expand details'}
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-8 z-30 w-36 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-card py-1">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onEdit(item);
                    }}
                    className="w-full px-3 py-1.5 text-xs text-left font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit item
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onRestock(item.id);
                    }}
                    className="w-full px-3 py-1.5 text-xs text-left font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center gap-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Restock
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onDelete(item);
                    }}
                    className="w-full px-3 py-1.5 text-xs text-left font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 border-t border-slate-100 dark:border-slate-700"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete item
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Expandable Details Drawer */}
      {expanded && (
        <div className="px-5 pb-4 pt-2 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 text-xs text-slate-600 dark:text-slate-400">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2">
            <div>
              <span className="text-slate-400 dark:text-slate-500 block">Low stock alert below:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {item.low_stock_threshold} {item.unit}
              </span>
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500 block">Weekly consumption:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {item.weekly_usage} {item.unit} / week
              </span>
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500 block">Daily run rate:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {Math.round((item.weekly_usage / 7) * 100) / 100} {item.unit} / day
              </span>
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500 block">Last updated:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {item.last_updated ? new Date(item.last_updated).toLocaleDateString() : 'Recently'}
              </span>
            </div>
          </div>
          {item.notes && (
            <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
              <span className="text-slate-400 dark:text-slate-500 mr-1">Notes:</span>
              <span className="italic text-slate-700 dark:text-slate-300">{item.notes}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
