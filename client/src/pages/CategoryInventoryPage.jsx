import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  PackageOpen,
  ArrowUpDown
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import DynamicIcon from '../components/common/DynamicIcon';
import ItemRow from '../components/common/ItemRow';
import ItemModal from '../components/common/ItemModal';
import DeleteConfirmModal from '../components/common/DeleteConfirmModal';

export default function CategoryInventoryPage() {
  const { categoryId } = useParams();
  const navigate = useNavigate();

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
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'in_stock' | 'low' | 'out_of_stock'
  const [sortBy, setSortBy] = useState('name'); // 'name' | 'quantity' | 'days_left' | 'usage'

  // Modals state
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [deleteModalState, setDeleteModalState] = useState({ isOpen: false, item: null });

  const currentCategory = categories.find((c) => c.id === categoryId);

  const categoryItems = items.filter((i) => i.category_id === categoryId);

  // Filter items
  const filteredItems = categoryItems
    .filter((item) => {
      if (statusFilter !== 'all' && item.status !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
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
      await addItem({ ...data, category_id: categoryId });
    }
  };

  const handleDeleteItem = async () => {
    if (deleteModalState.item) {
      await deleteItem(deleteModalState.item.id, deleteModalState.item.name);
      setDeleteModalState({ isOpen: false, item: null });
    }
  };

  if (loading && !currentCategory) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentCategory) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-12 text-center">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Category not found</h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">This category may have been removed.</p>
        <Link to="/" className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Category Header & Back Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
            <DynamicIcon name={currentCategory.icon} className="w-6 h-6" />
          </div>

          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              {currentCategory.name}
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {categoryItems.length} {categoryItems.length === 1 ? 'item' : 'items'}
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Manage item quantities, usage rates, and threshold alerts
            </p>
          </div>
        </div>

        {/* Add Item Action */}
        <button
          onClick={handleOpenAddItem}
          className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add item</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-3.5 flex flex-col md:flex-row items-center justify-between gap-3 shadow-subtle">
        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items in this category..."
            className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        {/* Status Filter Tabs & Sort Dropdown */}
        <div className="flex flex-wrap items-center justify-between md:justify-end w-full md:w-auto gap-2">
          {/* Status Filter Buttons */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                statusFilter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('in_stock')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                statusFilter === 'in_stock'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              In stock
            </button>
            <button
              onClick={() => setStatusFilter('low')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                statusFilter === 'low'
                  ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Low stock
            </button>
            <button
              onClick={() => setStatusFilter('out_of_stock')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                statusFilter === 'out_of_stock'
                  ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Out
            </button>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="name">Name (A-Z)</option>
              <option value="quantity">Stock level (Lowest)</option>
              <option value="days_left">Days left (Urgent)</option>
              <option value="usage">Weekly usage (Highest)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Items List */}
      {filteredItems.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <PackageOpen className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {searchQuery || statusFilter !== 'all' ? 'No matching items found' : 'No items in this category yet'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4 max-w-sm mx-auto">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your search query or status filter.'
              : `Start stocking ${currentCategory.name.toLowerCase()} by adding your first item.`}
          </p>
          <button
            onClick={handleOpenAddItem}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add item to {currentCategory.name}</span>
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
        defaultCategoryId={categoryId}
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
