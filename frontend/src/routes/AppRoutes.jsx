import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import DashboardPage from '@/pages/dashboard/DashboardPage';

// Employee Module Pages (Independent Forms & Multiple-Data Tables)
import BasicInfoPage from '@/pages/employee/BasicInfoPage';
import CnicPage from '@/pages/employee/CnicPage';
import PresentAddressPage from '@/pages/employee/PresentAddressPage';
import PermanentAddressPage from '@/pages/employee/PermanentAddressPage';
import ContactsPage from '@/pages/employee/ContactsPage';
import LanguagesPage from '@/pages/employee/LanguagesPage';

// Finance Module Pages
import IncomePage from '@/pages/finance/IncomePage';
import ExpenseLayout from '@/pages/finance/ExpenseLayout';
import HomeExpensePage from '@/pages/finance/HomeExpensePage';
import OtherExpensePage from '@/pages/finance/OtherExpensePage';

// Family Module Pages
import SpousesPage from '@/pages/family/SpousesPage';
import ChildrenPage from '@/pages/family/ChildrenPage';
import ParentsPage from '@/pages/family/ParentsPage';

import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import AppShell from '@/layouts/AppShell';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      {/* Protected Routes inside AppShell */}
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Employee Module Sub-Routes (Individual Section Pages) */}
        <Route path="/employee" element={<Navigate to="/employee/basic-info" replace />} />
        <Route path="/employee/basic-info" element={<BasicInfoPage />} />
        <Route path="/employee/cnic" element={<CnicPage />} />
        <Route path="/employee/present-address" element={<PresentAddressPage />} />
        <Route path="/employee/permanent-address" element={<PermanentAddressPage />} />
        <Route path="/employee/contacts" element={<ContactsPage />} />
        <Route path="/employee/languages" element={<LanguagesPage />} />


        {/* Finance Module Sub-Routes */}
        <Route path="/finance" element={<Navigate to="/finance/income" replace />} />
        <Route path="/finance/income" element={<IncomePage />} />

        {/* Expense Section with Differentiated Sub-Sections */}
        <Route path="/finance/expenses" element={<ExpenseLayout />}>
          <Route index element={<Navigate to="/finance/expenses/home" replace />} />
          <Route path="home" element={<HomeExpensePage />} />
          <Route path="other" element={<OtherExpensePage />} />
        </Route>

        {/* Family Module Sub-Routes */}
        <Route path="/family" element={<Navigate to="/family/spouses" replace />} />
        <Route path="/family/spouses" element={<SpousesPage />} />
        <Route path="/family/children" element={<ChildrenPage />} />
        <Route path="/family/parents" element={<ParentsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
