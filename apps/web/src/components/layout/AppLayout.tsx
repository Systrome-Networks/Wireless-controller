import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar.js';
import { Header } from './Header.js';
import { useAuth } from '../../context/AuthContext.js';

export const AppLayout: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-900 text-slate-300">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Connecting to WAC Controller...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen w-screen bg-slate-50 dark:bg-slate-950 overflow-hidden text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto bg-slate-100/70 dark:bg-slate-950/60 transition-colors duration-200">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
