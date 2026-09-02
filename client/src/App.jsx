import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import MobileNav from './components/layout/MobileNav';

// Pages
import DashboardPage from './pages/DashboardPage';
import CategoryInventoryPage from './pages/CategoryInventoryPage';
import AllInventoryPage from './pages/AllInventoryPage';
import ShoppingListPage from './pages/ShoppingListPage';
import AlertsPage from './pages/AlertsPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Navigation Bar */}
      <Navbar />

      {/* Main Layout Body */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 max-w-full overflow-x-hidden">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/inventory" element={<AllInventoryPage />} />
            <Route path="/category/:categoryId" element={<CategoryInventoryPage />} />
            <Route path="/shopping-list" element={<ShoppingListPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<DashboardPage />} />
          </Routes>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
}
