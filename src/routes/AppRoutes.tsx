import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import CompaniesPage from '../pages/CompaniesPage';
import AdminUsersPage from '../pages/AdminUsersPage';
import CompanyUsersPage from '../pages/CompanyUsersPage';

const AppRoutes: React.FC = () => (
  <Router>
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/companies"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
              <CompaniesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-users"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/company-users"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'COMPANY_ADMIN']}>
              <CompanyUsersPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  </Router>
);

export default AppRoutes;
