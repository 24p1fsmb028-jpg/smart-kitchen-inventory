import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Bell,
  FolderTree,
  Moon,
  Sun,
  Download,
  Upload,
  RotateCcw,
  Plus,
  Edit2,
  Trash2,
  Save,
  Check,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { useInventory } from '../context/InventoryContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import DynamicIcon from '../components/common/DynamicIcon';
import CategoryModal from '../components/common/CategoryModal';
import DeleteConfirmModal from '../components/common/DeleteConfirmModal';

export default function SettingsPage() {
  const { categories, addCategory, updateCategory, deleteCategory, refreshAll } = useInventory();
  const { isDark, toggleTheme } = useTheme();
  const { toast } = useToast();

  const [profile, setProfile] = useState({
    name: 'Alex Morgan',
    email: 'alex@smartkitchen.io',
    kitchen_name: 'Main Family Kitchen',
    household_size: 3
  });

  const [notifications, setNotifications] = useState({
    enabled: true,
    low_stock_alerts: true,
    out_of_stock_alerts: true,
    restock_alerts: true,
    sound_enabled: true
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Category Modal state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);
  const [deleteCategoryState, setDeleteCategoryState] = useState({ isOpen: false, category: null });

  // Reset confirmation
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const res = await api.getSettings();
        if (res.data) {
          if (res.data.profile) setProfile(res.data.profile);
          if (res.data.notifications) setNotifications(res.data.notifications);
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.updateSettings({ profile, notifications });
      toast.success('Settings updated successfully');
    } catch (err) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      const data = await api.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `smart-kitchen-inventory-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Inventory backup exported successfully!');
    } catch (err) {
      toast.error('Failed to export inventory data');
    }
  };

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target.result);
        const res = await api.importData(json);
        toast.success(res.message || 'Data imported successfully');
        await refreshAll();
      } catch (err) {
        toast.error('Invalid JSON backup file or corrupted format.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetDemo = async () => {
    try {
      await api.resetDemoData();
      await refreshAll();
      toast.success('Kitchen inventory reset to demo seed data.');
      setIsResetConfirmOpen(false);
    } catch (err) {
      toast.error('Failed to reset demo data');
    }
  };

  const handleOpenEditCategory = (cat) => {
    setCategoryToEdit(cat);
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (data) => {
    if (categoryToEdit) {
      await updateCategory(categoryToEdit.id, data);
    } else {
      await addCategory(data);
    }
  };

  const handleDeleteCategory = async () => {
    if (deleteCategoryState.category) {
      await deleteCategory(deleteCategoryState.category.id, deleteCategoryState.category.name);
      setDeleteCategoryState({ isOpen: false, category: null });
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-4xl">
      {/* Page Header */}
      <div>
        <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
          Settings & preferences
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Manage your user profile, category schema, stock alert rules, and data backups
        </p>
      </div>

      {/* 1. Profile Information */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-6 shadow-subtle space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              User profile & household
            </h2>
            <p className="text-[11px] text-slate-500">
              Used to personalize restock recommendations and shopping estimates
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Your full name
              </label>
              <input
                type="text"
                value={profile.name || ''}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Email address
              </label>
              <input
                type="email"
                value={profile.email || ''}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Kitchen / pantry name
              </label>
              <input
                type="text"
                value={profile.kitchen_name || ''}
                onChange={(e) => setProfile({ ...profile, kitchen_name: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Household members (size)
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={profile.household_size || 1}
                onChange={(e) => setProfile({ ...profile, household_size: parseInt(e.target.value) || 1 })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save profile'}</span>
            </button>
          </div>
        </form>
      </section>

      {/* 2. Notification Preferences */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-6 shadow-subtle space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Stock notification preferences
            </h2>
            <p className="text-[11px] text-slate-500">
              Configure automatic alert triggers when stock levels fluctuate
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-1">
          <label className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer">
            <div>
              <span className="text-xs font-medium text-slate-900 dark:text-slate-100 block">
                Enable all notifications
              </span>
              <span className="text-[11px] text-slate-500">
                Master switch for in-app alert badges and transition banners
              </span>
            </div>
            <input
              type="checkbox"
              checked={notifications.enabled}
              onChange={(e) => {
                const updated = { ...notifications, enabled: e.target.checked };
                setNotifications(updated);
                api.updateSettings({ notifications: updated });
              }}
              className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer">
            <div>
              <span className="text-xs font-medium text-slate-900 dark:text-slate-100 block">
                Out of stock alerts
              </span>
              <span className="text-[11px] text-slate-500">
                Alert immediately when any item reaches 0 quantity
              </span>
            </div>
            <input
              type="checkbox"
              checked={notifications.out_of_stock_alerts}
              disabled={!notifications.enabled}
              onChange={(e) => {
                const updated = { ...notifications, out_of_stock_alerts: e.target.checked };
                setNotifications(updated);
                api.updateSettings({ notifications: updated });
              }}
              className="w-4 h-4 accent-emerald-500 rounded cursor-pointer disabled:opacity-40"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer">
            <div>
              <span className="text-xs font-medium text-slate-900 dark:text-slate-100 block">
                Low stock alerts
              </span>
              <span className="text-[11px] text-slate-500">
                Alert when stock falls below custom threshold limit
              </span>
            </div>
            <input
              type="checkbox"
              checked={notifications.low_stock_alerts}
              disabled={!notifications.enabled}
              onChange={(e) => {
                const updated = { ...notifications, low_stock_alerts: e.target.checked };
                setNotifications(updated);
                api.updateSettings({ notifications: updated });
              }}
              className="w-4 h-4 accent-emerald-500 rounded cursor-pointer disabled:opacity-40"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer">
            <div>
              <span className="text-xs font-medium text-slate-900 dark:text-slate-100 block">
                Restocked confirmation alerts
              </span>
              <span className="text-[11px] text-slate-500">
                Create a celebration log when stock is replenished
              </span>
            </div>
            <input
              type="checkbox"
              checked={notifications.restock_alerts}
              disabled={!notifications.enabled}
              onChange={(e) => {
                const updated = { ...notifications, restock_alerts: e.target.checked };
                setNotifications(updated);
                api.updateSettings({ notifications: updated });
              }}
              className="w-4 h-4 accent-emerald-500 rounded cursor-pointer disabled:opacity-40"
            />
          </label>
        </div>
      </section>

      {/* 3. Category Manager */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-6 shadow-subtle space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FolderTree className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Manage kitchen categories
              </h2>
              <p className="text-[11px] text-slate-500">
                Add, rename, re-color, or delete kitchen categories
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setCategoryToEdit(null);
              setIsCategoryModalOpen(true);
            }}
            className="px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl transition-colors flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add category</span>
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {categories.map((cat) => (
            <div key={cat.id} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                  <DynamicIcon name={cat.icon} className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    {cat.name}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {cat.item_count || 0} items stored
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEditCategory(cat)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Edit category"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeleteCategoryState({ isOpen: true, category: cat })}
                  className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Delete category"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Appearance (Light / Dark Mode) */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-6 shadow-subtle space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400 flex items-center justify-center">
            {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Appearance & theme
            </h2>
            <p className="text-[11px] text-slate-500">
              Switch between clean light mode and immersive dark mode
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
            Current mode: <strong className="text-slate-900 dark:text-slate-100 capitalize">{isDark ? 'Dark Mode' : 'Light Mode'}</strong>
          </span>
          <button
            onClick={toggleTheme}
            className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-800 dark:text-slate-200 transition-colors flex items-center gap-2"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            <span>Toggle to {isDark ? 'Light' : 'Dark'} mode</span>
          </button>
        </div>
      </section>

      {/* 5. Data Backup & Reset */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-6 shadow-subtle space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <RotateCcw className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Data portability & demo reset
            </h2>
            <p className="text-[11px] text-slate-500">
              Export your inventory, import an existing backup, or reset to initial sample data
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Export JSON */}
          <button
            onClick={handleExportData}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 text-left transition-colors flex flex-col justify-between"
          >
            <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mb-2" />
            <div>
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block">
                Export JSON backup
              </span>
              <span className="text-[10px] text-slate-500">
                Download entire stock & history
              </span>
            </div>
          </button>

          {/* Import JSON */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 text-left transition-colors flex flex-col justify-between"
          >
            <Upload className="w-4 h-4 text-blue-600 dark:text-blue-400 mb-2" />
            <div>
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block">
                Import JSON backup
              </span>
              <span className="text-[10px] text-slate-500">
                Restore previously saved file
              </span>
            </div>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFile}
            accept=".json"
            className="hidden"
          />

          {/* Reset Demo Data */}
          <button
            onClick={() => setIsResetConfirmOpen(true)}
            className="p-3 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 hover:bg-rose-50 text-left transition-colors flex flex-col justify-between"
          >
            <RotateCcw className="w-4 h-4 text-rose-600 dark:text-rose-400 mb-2" />
            <div>
              <span className="text-xs font-semibold text-rose-700 dark:text-rose-400 block">
                Reset to demo data
              </span>
              <span className="text-[10px] text-rose-500/80">
                Populate 6 demo categories
              </span>
            </div>
          </button>
        </div>
      </section>

      {/* Category Modal (Add / Edit) */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSave={handleSaveCategory}
        categoryToEdit={categoryToEdit}
      />

      {/* Delete Category Modal */}
      <DeleteConfirmModal
        isOpen={deleteCategoryState.isOpen}
        onClose={() => setDeleteCategoryState({ isOpen: false, category: null })}
        onConfirm={handleDeleteCategory}
        title="Delete category?"
        message={`Deleting "${deleteCategoryState.category?.name}" will also delete all items contained inside it.`}
      />

      {/* Reset Demo Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleResetDemo}
        title="Reset to demo dataset?"
        message="This will reset all categories, items, and alert history back to the initial sample demo data. Any custom items created will be replaced."
      />
    </div>
  );
}
