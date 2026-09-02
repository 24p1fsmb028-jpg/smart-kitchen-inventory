import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
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
import LoginPage from './pages/LoginPage';
import PublicShowcasePage from './pages/PublicShowcasePage';
import AdminDashboardPage from './pages/AdminDashboardPage';

// Route guard: redirect to landing page if not authenticated
function PrivateRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/" state={{ from: location }} replace />;
  return children;
}

// Route guard: admin-only routes
function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/" state={{ from: location }} replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
}

// Main authenticated kitchen workspace layout
function KitchenLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}

export default function App() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Root Route: Shows Public Landing Page with Embedded Login if guest, or redirects if authenticated */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />
          ) : (
            <PublicShowcasePage />
          )
        }
      />

      <Route path="/showcase" element={<PublicShowcasePage />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace /> : <LoginPage />} />

      {/* Admin-only Routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboardPage />
          </AdminRoute>
        }
      />

      {/* Authenticated Kitchen Workspace Routes */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <KitchenLayout>
              <DashboardPage />
            </KitchenLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/inventory"
        element={
          <PrivateRoute>
            <KitchenLayout>
              <AllInventoryPage />
            </KitchenLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/category/:categoryId"
        element={
          <PrivateRoute>
            <KitchenLayout>
              <CategoryInventoryPage />
            </KitchenLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/shopping-list"
        element={
          <PrivateRoute>
            <KitchenLayout>
              <ShoppingListPage />
            </KitchenLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/alerts"
        element={
          <PrivateRoute>
            <KitchenLayout>
              <AlertsPage />
            </KitchenLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <PrivateRoute>
            <KitchenLayout>
              <SettingsPage />
            </KitchenLayout>
          </PrivateRoute>
        }
      />

      {/* Fallback Route */}
      <Route
        path="*"
        element={
          isAuthenticated ? (
            <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
    </Routes>
  );
}
