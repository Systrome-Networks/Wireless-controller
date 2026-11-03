import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Radio,
  Server,
  Wifi,
  Sliders,
  Compass,
  Activity,
  KeyRound,
  Building2,
  Users,
  ShieldCheck,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Access Points', href: '/access-points', icon: Radio },
  { name: 'Controllers', href: '/controllers', icon: Server },
  { name: 'Wireless SSIDs', href: '/ssids', icon: Wifi },
  { name: 'Config Engine', href: '/configurations', icon: Sliders },
  { name: 'Discovery', href: '/discovery', icon: Compass },
  { name: 'Monitoring & RF', href: '/monitoring', icon: Activity },
  { name: 'AAA / FreeRADIUS', href: '/aaa', icon: KeyRound },
  { name: 'Sites & Campus', href: '/sites', icon: Building2 },
  { name: 'Users & Roles', href: '/users', icon: Users },
  { name: 'Audit Logs', href: '/audit-logs', icon: ShieldCheck },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20">
          W
        </div>
        <div>
          <h1 className="font-bold text-white text-base tracking-tight leading-none">WAC Central</h1>
          <span className="text-[10px] text-blue-400 font-medium uppercase tracking-wider">Multi-Vendor Controller</span>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500">
        <div>Enterprise WAC v1.0.0</div>
        <div className="text-[10px] text-slate-600">RFC 5415 • CAPWAP • FreeRADIUS</div>
      </div>
    </aside>
  );
};
