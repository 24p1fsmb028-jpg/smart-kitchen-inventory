import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Boxes,
  FolderTree,
  AlertTriangle,
  AlertCircle,
  Plus,
  ArrowRight,
  TrendingDown,
  Sparkles,
  ShoppingBag,
  RefreshCw
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import StatCard from '../components/common/StatCard';
import CategoryTile from '../components/common/CategoryTile';
import ItemRow from '../components/common/ItemRow';
import AlertBanner from '../components/layout/AlertBanner';
import ItemModal from '../components/common/ItemModal';
import CategoryModal from '../components/common/CategoryModal';
import DeleteConfirmModal from '../components/common/DeleteConfirmModal';

export default function DashboardPage() {
  const {
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
    addCategory
  } = useInventory();

  const navigate = useNavigate();

  // Fire refreshAll exactly once every time this page mounts (including navigation from /admin)
  // Using empty deps [] ensures it fires on mount, not on re-renders
  useEffect(() => {
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Modals state
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [deleteModalState, setDeleteModalState] = useState({ isOpen: false, item: null });

  const handleOpenAddItem = () => {
    setItemToEdit(null);
    setIsItemModalOpen(true);
  };

  const handleOpenEditItem = (item) => {
    setItemToEdit(item);
    setIsItemModalOpen(true);
  };

  const handleSaveItem = async (data) => {
    if (itemToEdit) {
      await updateItem(itemToEdit.id, data);
    } else {
      await addItem(data);
    }
  };

  const handleDeleteItem = async () => {
    if (deleteModalState.item) {
      await deleteItem(deleteModalState.item.id, deleteModalState.item.name);
      setDeleteModalState({ isOpen: false, item: null });
    }
  };

  // Urgent attention items (out of stock + low stock)
  const urgentItems = items
    .filter((i) => i.status === 'out_of_stock' || i.status === 'low')
    .sort((a, b) => {
      if (a.status === 'out_of_stock' && b.status !== 'out_of_stock') return -1;
      if (b.status === 'out_of_stock' && a.status !== 'out_of_stock') return 1;
      return (a.days_remaining ?? 999) - (b.days_remaining ?? 999);
    })
    .slice(0, 5);

  // Show spinner only while actively loading initial stats
  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading your smart kitchen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Alert Banner for Low / Out of stock items */}
      <AlertBanner
        outOfStockCount={stats?.out_of_stock_count || 0}
        lowStockCount={stats?.low_stock_count || 0}
      />

      {/* Row of 4 Stat Cards */}
      <section>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
          <StatCard
            title="Total items"
            value={stats?.total_items || 0}
            subtitle={`${stats?.in_stock_count || 0} items healthy`}
            icon={Boxes}
            color="emerald"
            onClick={() => navigate('/inventory')}
          />
          <StatCard
            title="Categories"
            value={stats?.total_categories || 0}
            subtitle="Organized storage"
            icon={FolderTree}
            color="blue"
          />
          <StatCard
            title="Running low"
            value={stats?.low_stock_count || 0}
            subtitle="Approaching threshold"
            icon={AlertCircle}
            color="amber"
            onClick={() => navigate('/inventory?status=low')}
          />
          <StatCard
            title="Out of stock"
            value={stats?.out_of_stock_count || 0}
            subtitle="Restock required"
            icon={AlertTriangle}
            color="rose"
            onClick={() => navigate('/inventory?status=out_of_stock')}
          />
        </div>
      </section>

      {/* Categories Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100">
              Kitchen categories
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select a category to view and manage specific stock
            </p>
          </div>
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            <span>Add category</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {categories.map((category) => (
            <CategoryTile key={category.id} category={category} />
          ))}
          <CategoryTile
            isAddTile
            onAddClick={() => setIsCategoryModalOpen(true)}
          />
        </div>
      </section>

      {/* Needs Attention Section */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>Needs attention</span>
              {urgentItems.length > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                  {urgentItems.length}
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Items that are empty or running below their restock threshold
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleOpenAddItem}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add item</span>
            </button>
            <button
              onClick={() => navigate('/shopping-list')}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>See Shopping List</span>
              {urgentItems.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-500 text-white font-bold">
                  {urgentItems.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {urgentItems.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Kitchen is fully stocked!
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              No items are currently out of stock or running low. All stock thresholds are healthy.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {urgentItems.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                onEdit={handleOpenEditItem}
                onDelete={(item) => setDeleteModalState({ isOpen: true, item })}
                onQuantityChange={adjustQuantity}
                onRestock={restockItem}
              />
            ))}
          </div>
        )}
      </section>

      {/* Item Modal (Add / Edit) */}
      <ItemModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        onSave={handleSaveItem}
        categories={categories}
        itemToEdit={itemToEdit}
      />

      {/* Category Modal (Add) */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSave={addCategory}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false, item: null })}
        onConfirm={handleDeleteItem}
        title="Delete kitchen item?"
        message={`Are you sure you want to delete "${deleteModalState.item?.name}" from your inventory?`}
      />
    </div>
  );
}
