import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Boxes,
  ShoppingBag,
  Bell,
  Settings,
  Sparkles,
  Layers,
  Shield
} from 'lucide-react';
import { useAlerts } from '../../context/AlertContext';
import { useInventory } from '../../context/InventoryContext';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const { unreadCount } = useAlerts();
  const { stats, categories } = useInventory();
  const { isAdmin, user } = useAuth();

  const urgentCount = (stats?.out_of_stock_count || 0) + (stats?.low_stock_count || 0);

  const navLinks = [
    ...(isAdmin ? [{
      to: '/admin',
      label: 'Admin Panel',
      icon: Shield,
      badge: 'Owner',
      badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
    }] : []),
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      to: '/inventory',
      label: 'All Inventory',
      icon: Boxes,
      badge: stats?.total_items || null
    },
    {
      to: '/shopping-list',
      label: 'Shopping List',
      icon: ShoppingBag,
      badge: urgentCount > 0 ? urgentCount : null,
      badgeColor: 'bg-rose-500 text-white'
    },
    {
      to: '/alerts',
      label: 'Stock Alerts',
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : null,
      badgeColor: 'bg-amber-500 text-white'
    },
    {
      to: '/settings',
      label: 'Settings & Data',
      icon: Settings,
      badge: null
    }
  ];

  return (
    <aside className="w-64 hidden lg:flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-4 space-y-6 flex-shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Navigation Links */}
      <div className="space-y-1">
        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
          Main Menu
        </p>
        {navLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                    <span>{link.label}</span>
                  </div>
                  {link.badge !== null && (
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : link.badgeColor || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {link.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Quick Category Jump */}
      {categories.length > 0 && (
        <div className="space-y-1 pt-4 border-t border-slate-100 dark:border-slate-800/80">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
            Categories
          </p>
          <div className="space-y-0.5 max-h-56 overflow-y-auto">
            {categories.map((cat) => (
              <NavLink
                key={cat.id}
                to={`/category/${cat.id}`}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`
                }
              >
                <span className="truncate">{cat.name}</span>
                <span className="text-[10px] text-slate-400">
                  {cat.item_count || 0}
                </span>
              </NavLink>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Kitchen Health Metric */}
      {stats && (
        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/80">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
            <div className="flex items-center justify-between text-xs font-medium mb-1.5">
              <span className="text-slate-600 dark:text-slate-300">Stock health</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {stats.health_percentage}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${stats.health_percentage}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-2">
              {stats.in_stock_count} of {stats.total_items} items in good supply
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}
