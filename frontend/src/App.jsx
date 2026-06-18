import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Public pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Customer pages
import MedicineSearch from './pages/customer/MedicineSearch';
import ReservationTracker from './pages/customer/ReservationTracker';

// Owner pages
import OwnerDashboard from './pages/owner/OwnerDashboard';
import InventoryManager from './pages/owner/InventoryManager';
import ReservationsManager from './pages/owner/ReservationsManager';
import RegisterPharmacy from './pages/owner/RegisterPharmacy';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManager from './pages/admin/UserManager';
import PharmacyManager from './pages/admin/PharmacyManager';

const App = () => {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Customer Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <MedicineSearch />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reservations"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <ReservationTracker />
              </ProtectedRoute>
            }
          />

          {/* Owner Protected Routes */}
          <Route
            path="/owner"
            element={
              <ProtectedRoute allowedRoles={['owner']}>
                <OwnerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/inventory"
            element={
              <ProtectedRoute allowedRoles={['owner']}>
                <InventoryManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/reservations"
            element={
              <ProtectedRoute allowedRoles={['owner']}>
                <ReservationsManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/register-pharmacy"
            element={
              <ProtectedRoute allowedRoles={['owner']}>
                <RegisterPharmacy />
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UserManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/pharmacies"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <PharmacyManager />
              </ProtectedRoute>
            }
          />
          
          {/* Catch-all fallback */}
          <Route path="*" element={<LandingPage />} />
        </Routes>

      </Layout>
    </AuthProvider>
  );
};

export default App;
