import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.js';
import { ThemeProvider } from './context/ThemeContext.js';
import { AppLayout } from './components/layout/AppLayout.js';
import { LoginPage } from './pages/LoginPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { SitesPage } from './pages/SitesPage.js';
import { UsersPage } from './pages/UsersPage.js';
import { AuditLogsPage } from './pages/AuditLogsPage.js';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route element={<AppLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/sites" element={<SitesPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/audit-logs" element={<AuditLogsPage />} />

              {/* Placeholder routes for next phases */}
              <Route path="/access-points" element={<DashboardPage />} />
              <Route path="/controllers" element={<DashboardPage />} />
              <Route path="/ssids" element={<DashboardPage />} />
              <Route path="/configurations" element={<DashboardPage />} />
              <Route path="/discovery" element={<DashboardPage />} />
              <Route path="/monitoring" element={<DashboardPage />} />
              <Route path="/aaa" element={<DashboardPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};
