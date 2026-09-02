import React, { useState } from 'react';
import {
  ShoppingBag,
  CheckCircle2,
  Share2,
  RefreshCw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Boxes,
  Check
} from 'lucide-react';
import { useShoppingList } from '../context/ShoppingListContext';
import { useInventory } from '../context/InventoryContext';
import DynamicIcon from '../components/common/DynamicIcon';
import StatusBadge from '../components/common/StatusBadge';
import ShareListModal from '../components/common/ShareListModal';

export default function ShoppingListPage() {
  const {
    buyNowItems,
    wellStockedItems,
    summary,
    loading,
    toggleCheck,
    restockChecked
  } = useShoppingList();

  const { refreshAll } = useInventory();

  const [showWellStocked, setShowWellStocked] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isRestocking, setIsRestocking] = useState(false);

  const handleRestock = async () => {
    try {
      setIsRestocking(true);
      await restockChecked();
      await refreshAll();
    } finally {
      setIsRestocking(false);
    }
  };

  const uncheckedItems = buyNowItems.filter((i) => !i.checked);
  const checkedItems = buyNowItems.filter((i) => i.checked);

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Kitchen shopping list</span>
            {buyNowItems.length > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                {uncheckedItems.length} to buy
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Auto-generated from low stock and out-of-stock items in your pantry and fridge
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {checkedItems.length > 0 && (
            <button
              onClick={handleRestock}
              disabled={isRestocking}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRestocking ? 'animate-spin' : ''}`} />
              <span>Restock {checkedItems.length} checked</span>
            </button>
          )}

          <button
            onClick={() => setIsShareModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share list</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: BUY NOW ITEMS */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Buy now</span>
            <span className="text-xs text-slate-500 font-normal">
              ({uncheckedItems.length} pending, {checkedItems.length} checked)
            </span>
          </h2>
        </div>

        {buyNowItems.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-10 text-center shadow-subtle">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              No grocery purchases needed!
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              All items across all kitchen categories are currently above their low-stock thresholds.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {/* Unchecked Items First */}
            {uncheckedItems.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleCheck(item.id, item.checked)}
                className="group p-3.5 sm:p-4 rounded-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-subtle hover:border-slate-300 dark:hover:border-slate-700 transition-all flex items-center justify-between gap-3 cursor-pointer select-none"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Custom Checkbox */}
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors flex-shrink-0 ${
                      item.checked
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-slate-300 dark:border-slate-700 group-hover:border-emerald-500 bg-slate-50 dark:bg-slate-800'
                    }`}
                  >
                    {item.checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>

                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center flex-shrink-0">
                    <DynamicIcon name={item.icon} className="w-4 h-4" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
                        {item.name}
                      </span>
                      <StatusBadge status={item.status} size="sm" />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {item.category_name} • Current stock: {item.current_quantity} {item.unit}
                    </p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                    Buy {item.recommended_buy_quantity} {item.unit}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Weekly: {item.weekly_usage} {item.unit}/wk
                  </span>
                </div>
              </div>
            ))}

            {/* Checked Items (marked done / strikethrough) */}
            {checkedItems.length > 0 && (
              <div className="pt-3 space-y-2">
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 px-1">
                  Checked off ({checkedItems.length})
                </p>
                {checkedItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleCheck(item.id, item.checked)}
                    className="p-3.5 rounded-card bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 transition-all flex items-center justify-between gap-3 cursor-pointer opacity-70 hover:opacity-100 select-none"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-5 h-5 rounded-md bg-emerald-500 border border-emerald-500 text-white flex items-center justify-center flex-shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center flex-shrink-0 opacity-60">
                        <DynamicIcon name={item.icon} className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="line-through font-medium text-sm text-slate-500 dark:text-slate-400 truncate">
                          {item.name}
                        </span>
                        <p className="text-[11px] text-slate-400">
                          {item.category_name} • In cart
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      Ready to restock
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* SECTION 2: WELL STOCKED (Collapsible Reference List) */}
      <section className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setShowWellStocked(!showWellStocked)}
          className="w-full flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors shadow-subtle"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="text-xs sm:text-sm font-semibold">
              Well stocked reference list ({wellStockedItems.length} items)
            </span>
          </div>
          {showWellStocked ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {showWellStocked && (
          <div className="space-y-2 animate-in fade-in duration-200">
            {wellStockedItems.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-card bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <DynamicIcon name={item.icon} className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{item.name}</span>
                    <span className="text-[10px] text-slate-400 block">{item.category_name}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {item.current_quantity} {item.unit}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    (Threshold: {item.low_stock_threshold} {item.unit})
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Share List Modal */}
      <ShareListModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  );
}
