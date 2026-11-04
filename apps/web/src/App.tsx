import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.js';
import { ThemeProvider } from './context/ThemeContext.js';
import { AppLayout } from './components/layout/AppLayout.js';
import { LoginPage } from './pages/LoginPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { AccessPointsPage } from './pages/AccessPointsPage.js';
import { ControllersPage } from './pages/ControllersPage.js';
import { WirelessSsidsPage } from './pages/WirelessSsidsPage.js';
import { ConfigEnginePage } from './pages/ConfigEnginePage.js';
import { DiscoveryPage } from './pages/DiscoveryPage.js';
import { MonitoringRfPage } from './pages/MonitoringRfPage.js';
import { RadiusAaaPage } from './pages/RadiusAaaPage.js';
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
              <Route path="/access-points" element={<AccessPointsPage />} />
              <Route path="/controllers" element={<ControllersPage />} />
              <Route path="/ssids" element={<WirelessSsidsPage />} />
              <Route path="/configurations" element={<ConfigEnginePage />} />
              <Route path="/discovery" element={<DiscoveryPage />} />
              <Route path="/monitoring" element={<MonitoringRfPage />} />
              <Route path="/aaa" element={<RadiusAaaPage />} />
              <Route path="/sites" element={<SitesPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/audit-logs" element={<AuditLogsPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};
