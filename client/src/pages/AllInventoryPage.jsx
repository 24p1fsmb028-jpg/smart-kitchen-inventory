import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Boxes,
  Plus,
  Search,
  Filter,
  PackageOpen,
  ArrowUpDown,
  FolderTree
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import ItemRow from '../components/common/ItemRow';
import ItemModal from '../components/common/ItemModal';
import DeleteConfirmModal from '../components/common/DeleteConfirmModal';

export default function AllInventoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'all';

  const {
    categories,
    items,
    loading,
    refreshAll,
    addItem,
    updateItem,
    adjustQuantity,
    restockItem,
    deleteItem
  } = useInventory();

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [sortBy, setSortBy] = useState('name');

  // Modals
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [deleteModalState, setDeleteModalState] = useState({ isOpen: false, item: null });

  const filteredItems = items
    .filter((item) => {
      if (selectedCategory !== 'all' && item.category_id !== selectedCategory) {
        return false;
      }
      if (statusFilter !== 'all' && item.status !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.category_name?.toLowerCase().includes(q) ||
          (item.notes && item.notes.toLowerCase().includes(q))
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'quantity') return a.current_quantity - b.current_quantity;
      if (sortBy === 'days_left') return (a.days_remaining ?? 999) - (b.days_remaining ?? 999);
      if (sortBy === 'usage') return b.weekly_usage - a.weekly_usage;
      return 0;
    });

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

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Kitchen inventory</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Full view of every pantry, fridge, and spice shelf item
          </p>
        </div>

        <button
          onClick={handleOpenAddItem}
          className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add new item</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-3.5 space-y-3 shadow-subtle">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, category, or note..."
              className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Category Dropdown & Sort */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <FolderTree className="w-3.5 h-3.5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="all">All categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="name">Name (A-Z)</option>
                <option value="quantity">Stock level (Lowest)</option>
                <option value="days_left">Days left (Urgent)</option>
                <option value="usage">Weekly usage (Highest)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 overflow-x-auto text-xs">
          <span className="text-slate-400 text-[11px] font-medium mr-1">Status:</span>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            All items ({items.length})
          </button>
          <button
            onClick={() => setStatusFilter('in_stock')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              statusFilter === 'in_stock'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100'
            }`}
          >
            In stock ({items.filter((i) => i.status === 'in_stock').length})
          </button>
          <button
            onClick={() => setStatusFilter('low')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              statusFilter === 'low'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 hover:bg-amber-100'
            }`}
          >
            Low stock ({items.filter((i) => i.status === 'low').length})
          </button>
          <button
            onClick={() => setStatusFilter('out_of_stock')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              statusFilter === 'out_of_stock'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 hover:bg-rose-100'
            }`}
          >
            Out of stock ({items.filter((i) => i.status === 'out_of_stock').length})
          </button>
        </div>
      </div>

      {/* Items list */}
      {filteredItems.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <PackageOpen className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            No items matching your criteria
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
            Try broadening your search filters or add a new item.
          </p>
          <button
            onClick={handleOpenAddItem}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add new item</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => (
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

      {/* Add / Edit Item Modal */}
      <ItemModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        onSave={handleSaveItem}
        categories={categories}
        itemToEdit={itemToEdit}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false, item: null })}
        onConfirm={handleDeleteItem}
        title="Delete kitchen item?"
        message={`Are you sure you want to delete "${deleteModalState.item?.name}"?`}
      />
    </div>
  );
}
