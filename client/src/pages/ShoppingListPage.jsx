import React, { useState } from 'react';
import {
  ShoppingBag,
  CheckCircle2,
  Share2,
  RefreshCw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Check,
  FileDown,
  Store,
  AlertTriangle
} from 'lucide-react';
import { useShoppingList } from '../context/ShoppingListContext';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../context/AuthContext';
import DynamicIcon from '../components/common/DynamicIcon';
import ShareListModal from '../components/common/ShareListModal';
import {
  generateSuperstoreShoppingPdf,
  groupItemsBySuperstoreAisle,
  calculateItemMonthlyMetrics
} from '../services/superstorePdfService';

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
  const { user } = useAuth();

  const [showWellStocked, setShowWellStocked] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isRestocking, setIsRestocking] = useState(false);

  // Superstore options
  const [viewMode, setViewMode] = useState('aisles'); // 'aisles' (Superstore aisles) | 'flat' (Standard)
  const [filterOutOfStockOnly, setFilterOutOfStockOnly] = useState(false);

  const handleRestock = async () => {
    try {
      setIsRestocking(true);
      await restockChecked();
      await refreshAll();
    } finally {
      setIsRestocking(false);
    }
  };

  // Filter items based on out of stock toggle
  const filteredBuyItems = buyNowItems.filter((item) => {
    if (filterOutOfStockOnly) {
      return Number(item.current_quantity) <= 0 || item.status === 'out_of_stock';
    }
    return true;
  });

  const uncheckedItems = filteredBuyItems.filter((i) => !i.checked);
  const checkedItems = filteredBuyItems.filter((i) => i.checked);

  // Group items by Pakistani Superstore aisles
  const aisleGroups = groupItemsBySuperstoreAisle(uncheckedItems);
  const aisleNames = Object.keys(aisleGroups);

  const handleDownloadPdf = () => {
    generateSuperstoreShoppingPdf({
      items: filteredBuyItems,
      kitchenName: user?.kitchen_name || 'My Kitchen',
      householdSize: user?.household_size || 2,
      includeLowStock: !filterOutOfStockOnly
    });
  };

  const outOfStockCount = buyNowItems.filter(
    (i) => Number(i.current_quantity) <= 0 || i.status === 'out_of_stock'
  ).length;

  const lowStockCount = buyNowItems.filter(
    (i) => Number(i.current_quantity) > 0 && i.status === 'low'
  ).length;

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Kitchen shopping list</span>
            {outOfStockCount > 0 && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {outOfStockCount} Out of Stock
              </span>
            )}
            {lowStockCount > 0 && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                {lowStockCount} Low Stock
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cross (✗) indicates items still needing restock • Tick (✓) indicates restocked items
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Download List PDF Button */}
          <button
            onClick={handleDownloadPdf}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            title="Download PDF Shopping List"
          >
            <FileDown className="w-4 h-4" />
            <span>Download List</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-mono uppercase tracking-wider">PDF</span>
          </button>

          {checkedItems.length > 0 && (
            <button
              onClick={handleRestock}
              disabled={isRestocking}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRestocking ? 'animate-spin' : ''}`} />
              <span>Restock {checkedItems.length} checked</span>
            </button>
          )}

          <button
            onClick={() => setIsShareModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share list</span>
          </button>
        </div>
      </div>

      {/* Superstore Toolbar & View Controls */}
      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
            <Store className="w-4 h-4 text-emerald-500" />
            Store layout:
          </span>
          <div className="inline-flex rounded-xl bg-slate-200/80 dark:bg-slate-800 p-0.5">
            <button
              onClick={() => setViewMode('aisles')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                viewMode === 'aisles'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Superstore Aisles
            </button>
            <button
              onClick={() => setViewMode('flat')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                viewMode === 'flat'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Standard List
            </button>
          </div>
        </div>

        {/* Filter Out of stock only toggle */}
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700 dark:text-slate-300 font-medium">
            <input
              type="checkbox"
              checked={filterOutOfStockOnly}
              onChange={(e) => setFilterOutOfStockOnly(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span>Show Out of Stock Only</span>
          </label>
        </div>
      </div>

      {/* SECTION 1: ITEMS TO BUY */}
      <section className="space-y-4">
        {filteredBuyItems.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-10 text-center shadow-subtle">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {filterOutOfStockOnly ? 'No out of stock items!' : 'No grocery purchases needed!'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              {filterOutOfStockOnly
                ? 'All finished items are replenished. Uncheck the filter to view items running low.'
                : 'All kitchen items are stocked.'}
            </p>
          </div>
        ) : viewMode === 'aisles' ? (
          /* AISLE-BY-AISLE PAKISTANI SUPERSTORE VIEW (PURE ENGLISH) */
          <div className="space-y-5">
            {aisleNames.map((aisleName) => {
              const itemsInAisle = aisleGroups[aisleName];
              return (
                <div
                  key={aisleName}
                  className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-subtle space-y-3"
                >
                  {/* Aisle Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                        {aisleName}
                      </h3>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {itemsInAisle.length} item{itemsInAisle.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Items in this aisle */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {itemsInAisle.map((item) => {
                      const isOutOfStock = Number(item.current_quantity) <= 0 || item.status === 'out_of_stock';
                      const monthlyUsage = item.monthly_usage || Math.round((item.weekly_usage || 1) * 4 * 10) / 10;

                      return (
                        <div
                          key={item.id}
                          onClick={() => toggleCheck(item.id, item.checked)}
                          className="group p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all flex items-center justify-between gap-3 cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center flex-shrink-0">
                              <DynamicIcon name={item.icon} className="w-4 h-4" />
                            </div>

                            <div className="min-w-0 space-y-0.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                                  {item.name}
                                </span>
                                {isOutOfStock ? (
                                  <span className="text-[10px] font-bold px-2 py-0.2 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-900">
                                    Out of Stock
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold px-2 py-0.2 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-900">
                                    Low Stock
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                                <span>Current: <strong className="text-slate-700 dark:text-slate-300">{item.current_quantity} {item.unit}</strong></span>
                                <span>•</span>
                                <span>Monthly: <strong className="text-slate-700 dark:text-slate-300">{monthlyUsage} {item.unit}/mo</strong></span>
                              </div>
                            </div>
                          </div>

                          {/* Right Section: Needs Stock + Interactive Tick Button */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                              Needs Stock
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleCheck(item.id, item.checked);
                              }}
                              className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500 hover:text-white border border-slate-300 dark:border-slate-700 hover:border-emerald-500 text-slate-400 dark:text-slate-500 transition-all flex items-center justify-center cursor-pointer shadow-xs group-hover:border-emerald-500 group-hover:text-emerald-500 group-hover:hover:text-white"
                              title="Click to mark Restocked"
                            >
                              <Check className="w-4 h-4 stroke-[2.5]" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* STANDARD FLAT LIST VIEW */
          <div className="space-y-2.5">
            {uncheckedItems.map((item) => {
              const isOutOfStock = Number(item.current_quantity) <= 0 || item.status === 'out_of_stock';
              const monthlyUsage = Math.round((item.weekly_usage || 1) * 4 * 10) / 10;

              return (
                <div
                  key={item.id}
                  onClick={() => toggleCheck(item.id, item.checked)}
                  className="group p-3.5 sm:p-4 rounded-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-subtle hover:border-slate-300 dark:hover:border-slate-700 transition-all flex items-center justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center flex-shrink-0">
                      <DynamicIcon name={item.icon} className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
                          {item.name}
                        </span>
                        {isOutOfStock ? (
                          <span className="text-[10px] font-bold px-2 py-0.2 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-900">
                            Out of Stock
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.2 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-900">
                            Low Stock
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 break-words">
                        {item.category_name} • {item.current_quantity} {item.unit} &nbsp;|&nbsp; {monthlyUsage} {item.unit}/mo
                      </p>
                    </div>
                  </div>

                  {/* Right Section: Needs Stock + Interactive Tick Button */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                      Needs Stock
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCheck(item.id, item.checked);
                      }}
                      className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500 hover:text-white border border-slate-300 dark:border-slate-700 hover:border-emerald-500 text-slate-400 dark:text-slate-500 transition-all flex items-center justify-center cursor-pointer shadow-xs group-hover:border-emerald-500 group-hover:text-emerald-500 group-hover:hover:text-white"
                      title="Click to mark Restocked"
                    >
                      <Check className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Checked Items (marked Restocked with green Tick ✓) */}
        {checkedItems.length > 0 && (
          <div className="pt-3 space-y-2">
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 px-1">
              Restocked ({checkedItems.length})
            </p>
            {checkedItems.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleCheck(item.id, item.checked)}
                className="p-3.5 rounded-card bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 transition-all flex items-center justify-between gap-3 cursor-pointer opacity-80 hover:opacity-100 select-none"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center flex-shrink-0 opacity-60">
                    <DynamicIcon name={item.icon} className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="line-through font-medium text-sm text-slate-500 dark:text-slate-400 truncate">
                      {item.name}
                    </span>
                    <p className="text-[11px] text-slate-400">
                      {item.category_name} • Restocked
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    Restocked
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCheck(item.id, item.checked);
                    }}
                    className="w-7 h-7 rounded-full bg-emerald-500 text-white border border-emerald-500 hover:bg-rose-500 hover:border-rose-500 transition-all flex items-center justify-center cursor-pointer shadow-xs"
                    title="Click to unmark"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SECTION 2: WELL STOCKED (Collapsible Reference List) */}
      <section className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setShowWellStocked(!showWellStocked)}
          className="w-full flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors shadow-subtle cursor-pointer"
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
