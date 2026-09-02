import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Sun,
  Moon,
  Refrigerator,
  Sparkles,
  User,
  Settings,
  ShoppingBag,
  Shield,
  LogOut
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAlerts } from '../../context/AlertContext';
import { useAuth } from '../../context/AuthContext';
import AlertsDropdown from './AlertsDropdown';
import GlobalSearchModal from './GlobalSearchModal';

export default function Navbar() {
  const { isDark, toggleTheme } = useTheme();
  const { unreadCount } = useAlerts();
  const { user, isAdmin, logout } = useAuth();
  const [showAlerts, setShowAlerts] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'SK';

  return (
    <>
      <header className="sticky top-0 z-30 w-full glass border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo & Name */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Refrigerator className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base sm:text-lg tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                Smart Kitchen
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-xs px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
                  Stock
                </span>
              </span>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block">
                {user?.kitchen_name || 'Inventory & Grocery Manager'}
              </p>
            </div>
          </Link>

          {/* Center: Search Trigger Bar */}
          <div className="flex-1 max-w-md hidden md:block">
            <button
              onClick={() => setShowSearch(true)}
              className="w-full flex items-center justify-between px-3.5 py-2 text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-400" />
                <span>Search items, categories, or notes...</span>
              </div>
              <kbd className="px-2 py-0.5 text-[10px] font-semibold text-slate-500 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                Ctrl K
              </kbd>
            </button>
          </div>

          {/* Right Actions: Admin Badge, Search, Theme, Notifications, User Avatar */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Admin Quick Jump Link */}
            {isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/40 border border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 text-xs font-semibold rounded-xl hover:bg-purple-200 dark:hover:bg-purple-900/60 transition-colors"
              >
                <Shield size={14} />
                Admin Panel
              </button>
            )}

            {/* Mobile Search Icon */}
            <button
              onClick={() => setShowSearch(true)}
              className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              title="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>

            {/* Bell Notifications with unread badge */}
            <div className="relative">
              <button
                onClick={() => setShowAlerts(!showAlerts)}
                className="relative p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                  </span>
                )}
              </button>

              <AlertsDropdown isOpen={showAlerts} onClose={() => setShowAlerts(false)} />
            </div>

            {/* User Avatar & Dropdown */}
            <div className="relative ml-1">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className={`w-8 h-8 rounded-xl ${isAdmin ? 'bg-gradient-to-br from-purple-600 to-indigo-600' : 'bg-gradient-to-br from-emerald-500 to-teal-600'} text-white font-semibold text-xs flex items-center justify-center shadow-xs`}>
                  {initials}
                </div>
              </button>

              {showProfileMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowProfileMenu(false)}
                  />
                  <div className="absolute right-0 top-11 z-50 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-elevation py-1.5 animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {user?.name || 'Kitchen User'}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-full ${isAdmin ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'}`}>
                        {isAdmin ? '👑 Admin Owner' : '👤 Customer'}
                      </span>
                    </div>

                    {isAdmin && (
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          navigate('/admin');
                        }}
                        className="w-full px-3.5 py-2 text-xs text-left text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/30 flex items-center gap-2 font-medium"
                      >
                        <Shield className="w-3.5 h-3.5" />
                        Admin Control Center
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate('/settings');
                      }}
                      className="w-full px-3.5 py-2 text-xs text-left text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      Settings & Profile
                    </button>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate('/shopping-list');
                      }}
                      className="w-full px-3.5 py-2 text-xs text-left text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Shopping List
                    </button>

                    <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                    <button
                      onClick={handleLogout}
                      className="w-full px-3.5 py-2 text-xs text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center gap-2 font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={showSearch} onClose={() => setShowSearch(false)} />
    </>
  );
}
