import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import CompaniesPage from '../pages/CompaniesPage';
import AdminUsersPage from '../pages/AdminUsersPage';
import CompanyUsersPage from '../pages/CompanyUsersPage';
import FaqPage from '../pages/FaqPage';
import ChatbotSettingsPage from '../pages/ChatbotSettingsPage';
import ChatPage from '../pages/ChatPage';
import ApiKeysPage from '../pages/ApiKeysPage';

const AppRoutes: React.FC = () => (
  <Router>
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Protected */}
        <Route path="/dashboard" element={
          <ProtectedRoute><DashboardPage /></ProtectedRoute>
        } />

        <Route path="/companies" element={
          <ProtectedRoute allowedRoles={['SUPER_ADMIN']}><CompaniesPage /></ProtectedRoute>
        } />

        <Route path="/companies/:companyId/faqs" element={
          <ProtectedRoute allowedRoles={['SUPER_ADMIN']}><FaqPage /></ProtectedRoute>
        } />

        <Route path="/faqs" element={
          <ProtectedRoute allowedRoles={['COMPANY_ADMIN']}><FaqPage /></ProtectedRoute>
        } />

        <Route path="/chatbot" element={
          <ProtectedRoute allowedRoles={['COMPANY_ADMIN']}><ChatbotSettingsPage /></ProtectedRoute>
        } />

        <Route path="/api-keys" element={
          <ProtectedRoute allowedRoles={['COMPANY_ADMIN']}><ApiKeysPage /></ProtectedRoute>
        } />

        <Route path="/chat" element={
          <ProtectedRoute allowedRoles={['COMPANY_USER', 'COMPANY_ADMIN']}><ChatPage /></ProtectedRoute>
        } />

        <Route path="/admin-users" element={
          <ProtectedRoute allowedRoles={['SUPER_ADMIN']}><AdminUsersPage /></ProtectedRoute>
        } />

        <Route path="/company-users" element={
          <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'COMPANY_ADMIN']}><CompanyUsersPage /></ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  </Router>
);

export default AppRoutes;
