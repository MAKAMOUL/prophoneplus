import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { LanguageProvider } from './contexts/LanguageContext';
import LoginForm from './components/auth/LoginForm';
import AdminLayout from './components/layout/AdminLayout';
import WorkerLayout from './components/layout/WorkerLayout';
import LoadingSpinner from './components/common/LoadingSpinner';

import Dashboard from './pages/admin/Dashboard';
import Products from './pages/admin/Products';
import Categories from './pages/admin/Categories';
import Sales from './pages/admin/Sales';
import Users from './pages/admin/Users';
import Alerts from './pages/admin/Alerts';

import WorkerProducts from './pages/worker/WorkerProducts';
import WorkerDashboard from './pages/worker/WorkerDashboard';
import WorkerCategories from './pages/worker/WorkerCategories';
import AddProduct from './pages/worker/AddProduct';
import MakeSale from './pages/worker/MakeSale';
import MySales from './pages/worker/MySales';
import WorkerAlerts from './pages/worker/WorkerAlerts';
import type { ReactNode } from 'react';

function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: ReactNode;
  allowedRoles: string[];
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" message="Loading..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/worker'} replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" message="Loading..." />
      </div>
    );
  }

  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/worker'} replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginForm />
          </PublicRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="categories" element={<Categories />} />
        <Route path="sales" element={<Sales />} />
        <Route path="users" element={<Users />} />
        <Route path="alerts" element={<Alerts />} />
      </Route>

      <Route
        path="/worker"
        element={
          <ProtectedRoute allowedRoles={['worker']}>
            <WorkerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<WorkerProducts />} />
        <Route path="dashboard" element={<WorkerDashboard />} />
        <Route path="categories" element={<WorkerCategories />} />
        <Route path="add-product" element={<AddProduct />} />
        <Route path="sell" element={<MakeSale />} />
        <Route path="my-sales" element={<MySales />} />
        <Route path="alerts" element={<WorkerAlerts />} />
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <AppProvider>
            <AppRoutes />
          </AppProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;
