import React from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { useTheme } from '../../context/ThemeContext.js';
import { Sun, Moon, LogOut, Shield } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between shrink-0">
      {/* Left: Organization & Real-time Indicator */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Org:</span>
          <span className="text-sm font-semibold text-slate-200 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">
            {user?.orgName || 'Acme Global Networks'}
          </span>
        </div>

        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-800/50 text-emerald-400 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Telemetry Live</span>
        </div>
      </div>

      {/* Right: Theme Toggle & User Info */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <div className="h-5 w-px bg-slate-800" />

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-medium text-slate-200">{user?.name}</div>
            <div className="flex items-center justify-end gap-1 text-[11px] text-blue-400 font-mono">
              <Shield className="w-3 h-3" />
              <span>{user?.role}</span>
            </div>
          </div>

          <div className="w-9 h-9 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center font-bold text-blue-400 text-sm">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>

          <button
            onClick={logout}
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
