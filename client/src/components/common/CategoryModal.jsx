import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import DynamicIcon from './DynamicIcon';

const COLOR_OPTIONS = [
  { id: 'emerald', label: 'Emerald', bg: 'bg-emerald-500' },
  { id: 'blue', label: 'Blue', bg: 'bg-blue-500' },
  { id: 'rose', label: 'Rose', bg: 'bg-rose-500' },
  { id: 'amber', label: 'Amber', bg: 'bg-amber-500' },
  { id: 'violet', label: 'Violet', bg: 'bg-violet-500' },
  { id: 'orange', label: 'Orange', bg: 'bg-orange-500' }
];

const CATEGORY_ICONS = [
  'Apple', 'Milk', 'Beef', 'Wheat', 'Package', 'Coffee', 'Salad',
  'CupSoda', 'Pizza', 'Utensils', 'Egg', 'Fish', 'Sparkles', 'Folder'
];

export default function CategoryModal({ isOpen, onClose, onSave, categoryToEdit = null }) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('Folder');
  const [color, setColor] = useState('emerald');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name || '');
      setIcon(categoryToEdit.icon || 'Folder');
      setColor(categoryToEdit.color || 'emerald');
    } else {
      setName('');
      setIcon('Folder');
      setColor('emerald');
    }
    setError('');
  }, [categoryToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Category name is required');
      return;
    }

    try {
      setSubmitting(true);
      await onSave({
        name: name.trim(),
        icon,
        color
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-elevation border border-slate-200 dark:border-slate-800 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {categoryToEdit ? 'Edit category' : 'Create new category'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Category name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Frozen Foods, Condiments, Snacks..."
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            {error && (
              <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {error}
              </p>
            )}
          </div>

          {/* Color theme */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
              Color accent
            </label>
            <div className="flex items-center gap-3">
              {COLOR_OPTIONS.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setColor(c.id)}
                  className={`w-7 h-7 rounded-full ${c.bg} transition-all ${
                    color === c.id ? 'ring-4 ring-slate-900/10 dark:ring-white/20 scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* Icon Picker */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
              Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_ICONS.map((i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setIcon(i)}
                  className={`p-2 rounded-xl border transition-all ${
                    icon === i
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <DynamicIcon name={i} className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

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
              disabled={submitting}
              className="px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-sm transition-colors"
            >
              {submitting ? 'Saving...' : categoryToEdit ? 'Save changes' : 'Create category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
