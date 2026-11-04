import React, { useState } from 'react';
import { Radio, Users, Server, AlertTriangle, ArrowUpRight } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [stats] = useState({
    totalAps: 8,
    onlineAps: 8,
    offlineAps: 0,
    totalClients: 112,
    controllersCount: 5,
    activeAlertsCount: 1,
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Wireless Infrastructure Operations Center</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Real-time status across multi-vendor wireless campus and branch sites</p>
        </div>

        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-colors flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5" />
            <span>Discover Devices</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total APs */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Access Points</span>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.totalAps}</div>
            <div className="flex items-center gap-2 mt-1 text-[11px]">
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">{stats.onlineAps} Online</span>
              <span className="text-slate-400 dark:text-slate-500">•</span>
              <span className="text-slate-500 dark:text-slate-400">{stats.offlineAps} Offline</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Radio className="w-5 h-5" />
          </div>
        </div>

        {/* Wireless Clients */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Connected Clients</span>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.totalClients}</div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">98% 5GHz / Wi-Fi 6</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Multi-Vendor Controllers */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Active Controllers</span>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.controllersCount}</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Cisco • Aruba • Omada • UniFi • Ruijie</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <Server className="w-5 h-5" />
          </div>
        </div>

        {/* Alerts */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">System Alerts</span>
            <div className="text-2xl font-bold text-amber-500 dark:text-amber-400 mt-1">{stats.activeAlertsCount}</div>
            <div className="text-[11px] text-amber-600 dark:text-amber-400/80 mt-1">1 Warning Needs Attention</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Vendor Distribution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Multi-Vendor Fleet Distribution</h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">Unified Controller Plane</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { name: 'Cisco Catalyst', count: '2 APs', status: 'Healthy', color: 'border-blue-200 dark:border-blue-500/40 text-blue-600 dark:text-blue-400' },
              { name: 'Aruba Conductor', count: '2 APs', status: 'Healthy', color: 'border-orange-200 dark:border-orange-500/40 text-orange-600 dark:text-orange-400' },
              { name: 'TP-Link Omada', count: '1 AP', status: 'Healthy', color: 'border-cyan-200 dark:border-cyan-500/40 text-cyan-600 dark:text-cyan-400' },
              { name: 'Ubiquiti UniFi', count: '1 AP', status: 'Healthy', color: 'border-indigo-200 dark:border-indigo-500/40 text-indigo-600 dark:text-indigo-400' },
              { name: 'Ruijie Cloud', count: '1 AP', status: 'Healthy', color: 'border-rose-200 dark:border-rose-500/40 text-rose-600 dark:text-rose-400' },
              { name: 'Native CAPWAP', count: '1 AP', status: 'RFC 5415 RUN', color: 'border-emerald-200 dark:border-emerald-500/40 text-emerald-600 dark:text-emerald-400' },
            ].map((v) => (
              <div key={v.name} className={`p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950/70 border ${v.color}`}>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{v.name}</div>
                <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">{v.count}</div>
                <div className="text-[10px] font-mono mt-1 opacity-80">{v.status}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Alert Card */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Active Operational Alerts</h3>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                Warning
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">High Channel Interference Detected</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Channel 36 on AP-HQ-ENG-101 experiencing 42% co-channel interference from external BSSID.
              </p>
              <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500 pt-1">Target: AP-HQ-ENG-101 • 15 min ago</div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 cursor-pointer">
            <span>View all 1 active alerts in Monitoring</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
