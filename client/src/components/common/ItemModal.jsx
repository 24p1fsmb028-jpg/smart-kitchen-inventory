import React, { useState, useEffect } from 'react';
import { X, Sparkles, Clock, AlertCircle } from 'lucide-react';
import DynamicIcon from './DynamicIcon';
import StatusBadge from './StatusBadge';

const UNIT_OPTIONS = [
  { value: 'pieces', label: 'Pieces (pcs)' },
  { value: 'kg', label: 'Kilograms (kg)' },
  { value: 'grams', label: 'Grams (g)' },
  { value: 'litres', label: 'Litres (L)' },
  { value: 'ml', label: 'Millilitres (ml)' },
  { value: 'packs', label: 'Packs' },
  { value: 'cans', label: 'Cans' },
  { value: 'bottles', label: 'Bottles' },
  { value: 'boxes', label: 'Boxes' },
  { value: 'loaves', label: 'Loaves' },
  { value: 'bags', label: 'Bags' },
  { value: 'bars', label: 'Bars' }
];

const ICON_OPTIONS = [
  'Apple', 'Milk', 'Beef', 'Wheat', 'Coffee', 'Package', 'Salad',
  'Egg', 'Fish', 'Droplet', 'Layers', 'Pizza', 'Utensils', 'CupSoda',
  'Cookie', 'Citrus', 'Sparkles'
];

export default function ItemModal({
  isOpen,
  onClose,
  onSave,
  categories = [],
  itemToEdit = null,
  defaultCategoryId = null
}) {
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    unit: 'pieces',
    current_quantity: 1,
    weekly_usage: 1,
    low_stock_threshold: 1,
    icon: 'Package',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (itemToEdit) {
      setFormData({
        name: itemToEdit.name || '',
        category_id: itemToEdit.category_id || (categories[0]?.id || ''),
        unit: itemToEdit.unit || 'pieces',
        current_quantity: itemToEdit.current_quantity ?? 1,
        weekly_usage: itemToEdit.weekly_usage ?? 1,
        low_stock_threshold: itemToEdit.low_stock_threshold ?? 1,
        icon: itemToEdit.icon || 'Package',
        notes: itemToEdit.notes || ''
      });
    } else {
      setFormData({
        name: '',
        category_id: defaultCategoryId || (categories[0]?.id || ''),
        unit: 'pieces',
        current_quantity: 1,
        weekly_usage: 1,
        low_stock_threshold: 1,
        icon: 'Package',
        notes: ''
      });
    }
    setErrors({});
  }, [itemToEdit, defaultCategoryId, categories, isOpen]);

  if (!isOpen) return null;

  // Real-time stock status preview
  const qty = Number(formData.current_quantity) || 0;
  const threshold = Number(formData.low_stock_threshold) || 0;
  const usage = Number(formData.weekly_usage) || 0;

  let computedStatus = 'in_stock';
  if (qty <= 0) computedStatus = 'out_of_stock';
  else if (qty <= threshold) computedStatus = 'low';

  const daysLeft = usage > 0 && qty > 0
    ? Math.round((qty / (usage / 7)) * 10) / 10
    : null;

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = 'Item name is required';
    }
    if (!formData.category_id) {
      errs.category_id = 'Please select a category';
    }
    if (formData.current_quantity < 0) {
      errs.current_quantity = 'Quantity cannot be negative';
    }
    if (formData.low_stock_threshold < 0) {
      errs.low_stock_threshold = 'Threshold cannot be negative';
    }
    if (formData.weekly_usage <= 0) {
      errs.weekly_usage = 'Weekly usage must be greater than 0';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      await onSave({
        ...formData,
        current_quantity: parseFloat(formData.current_quantity),
        weekly_usage: parseFloat(formData.weekly_usage),
        low_stock_threshold: parseFloat(formData.low_stock_threshold)
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-elevation border border-slate-200 dark:border-slate-800 overflow-hidden my-8 z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {itemToEdit ? 'Edit kitchen item' : 'Add new kitchen item'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Track stock levels, weekly usage, and low-stock alerts
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Live Status Preview Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                <DynamicIcon name={formData.icon} className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block">Calculated status:</span>
                <StatusBadge status={computedStatus} size="sm" />
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 dark:text-slate-400 block">Estimated run time:</span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 justify-end">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {daysLeft !== null ? `~${daysLeft} days` : qty <= 0 ? 'Empty' : 'N/A'}
              </span>
            </div>
          </div>

          {/* Item Name */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Item name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Honeycrisp Apples, Whole Milk..."
              className={`w-full px-3.5 py-2 text-sm rounded-xl border bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors ${
                errors.name ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
              }`}
            />
            {errors.name && <p className="text-xs text-rose-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.name}</p>}
          </div>

          {/* Category & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className={`w-full px-3.5 py-2 text-sm rounded-xl border bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors ${
                  errors.category_id ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.category_id && <p className="text-xs text-rose-500 mt-1">{errors.category_id}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Unit of measurement
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
              >
                {UNIT_OPTIONS.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Current Quantity & Weekly Usage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Current quantity
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={formData.current_quantity}
                  onChange={(e) => setFormData({ ...formData, current_quantity: e.target.value })}
                  className={`w-full px-3.5 py-2 text-sm rounded-xl border bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors ${
                    errors.current_quantity ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
                <span className="absolute right-3.5 top-2 text-xs text-slate-400 pointer-events-none">
                  {formData.unit}
                </span>
              </div>
              {errors.current_quantity && <p className="text-xs text-rose-500 mt-1">{errors.current_quantity}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Weekly usage rate
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  min="0.1"
                  value={formData.weekly_usage}
                  onChange={(e) => setFormData({ ...formData, weekly_usage: e.target.value })}
                  className={`w-full px-3.5 py-2 text-sm rounded-xl border bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors ${
                    errors.weekly_usage ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
                <span className="absolute right-3.5 top-2 text-xs text-slate-400 pointer-events-none">
                  {formData.unit}/wk
                </span>
              </div>
              {errors.weekly_usage && <p className="text-xs text-rose-500 mt-1">{errors.weekly_usage}</p>}
            </div>
          </div>

          {/* Low Stock Alert Threshold (Slider + Number input) */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Alert me when stock falls below:
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={formData.low_stock_threshold}
                  onChange={(e) => setFormData({ ...formData, low_stock_threshold: e.target.value })}
                  className="w-16 px-2 py-1 text-xs text-right font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                />
                <span className="text-xs text-slate-500">{formData.unit}</span>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max={Math.max(10, (formData.weekly_usage || 2) * 3)}
              step="0.5"
              value={formData.low_stock_threshold}
              onChange={(e) => setFormData({ ...formData, low_stock_threshold: parseFloat(e.target.value) })}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Triggers a "Low Stock" alert and automatically adds this item to your Shopping List.
            </p>
          </div>

          {/* Icon Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Select icon
            </label>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map((iconName) => (
                <button
                  type="button"
                  key={iconName}
                  onClick={() => setFormData({ ...formData, icon: iconName })}
                  className={`p-2 rounded-xl border transition-all ${
                    formData.icon === iconName
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <DynamicIcon name={iconName} className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Notes / Location (optional)
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Stored in top freezer drawer, prefer organic brand..."
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-sm transition-colors flex items-center gap-2"
            >
              {isSubmitting ? 'Saving...' : itemToEdit ? 'Save changes' : 'Add item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
