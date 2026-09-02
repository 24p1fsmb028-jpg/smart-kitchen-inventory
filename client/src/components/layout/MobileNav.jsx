import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Boxes,
  ShoppingBag,
  Bell,
  Settings
} from 'lucide-react';
import { useAlerts } from '../../context/AlertContext';
import { useInventory } from '../../context/InventoryContext';

export default function MobileNav() {
  const { unreadCount } = useAlerts();
  const { stats } = useInventory();

  const urgentCount = (stats?.out_of_stock_count || 0) + (stats?.low_stock_count || 0);

  const links = [
    { to: '/', label: 'Home', icon: LayoutDashboard },
    { to: '/inventory', label: 'Stock', icon: Boxes },
    {
      to: '/shopping-list',
      label: 'Shop',
      icon: ShoppingBag,
      badge: urgentCount > 0 ? urgentCount : null
    },
    {
      to: '/alerts',
      label: 'Alerts',
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : null
    },
    { to: '/settings', label: 'Settings', icon: Settings }
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass border-t border-slate-200 dark:border-slate-800 px-3 py-1.5 flex items-center justify-around shadow-lg">
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) =>
              `relative flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`
            }
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {link.badge !== null && (
                <span className="absolute -top-1 -right-2 px-1.5 py-0.2 text-[9px] font-bold rounded-full bg-rose-500 text-white">
                  {link.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5">{link.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
