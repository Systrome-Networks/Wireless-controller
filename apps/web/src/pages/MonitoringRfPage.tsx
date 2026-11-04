import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle2, Radio, RefreshCw } from 'lucide-react';
import { apiFetch } from '../api/client.js';

interface AlertItem {
  id: string;
  title: string;
  message: string;
  severity: string;
  targetType: string;
  targetId: string;
  status: string;
  triggeredAt: string;
  acknowledgedBy?: { name: string };
}

interface MetricsData {
  totalAps: number;
  onlineAps: number;
  offlineAps: number;
  totalClients: number;
  controllersCount: number;
  activeAlertsCount: number;
  channelStats: Array<{
    band: string;
    channel: number;
    utilization: number;
    clients: number;
  }>;
}

export const MonitoringRfPage: React.FC = () => {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      apiFetch<MetricsData>('/monitoring/metrics'),
      apiFetch<AlertItem[]>('/monitoring/alerts'),
    ])
      .then(([m, a]) => {
        setMetrics(m);
        setAlerts(a);
      })
      .catch((err) => console.error('Failed to load telemetry:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAcknowledge = async (id: string) => {
    try {
      await apiFetch(`/monitoring/alerts/${id}/acknowledge`, { method: 'POST' });
      fetchData();
    } catch (err: any) {
      alert(`Action failed: ${err.message}`);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await apiFetch(`/monitoring/alerts/${id}/resolve`, { method: 'POST' });
      fetchData();
    } catch (err: any) {
      alert(`Action failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">RF Spectrum & Live Monitoring</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Real-time radio frequency spectrum utilization, co-channel interference, and alert triage</p>
        </div>

        <button
          onClick={fetchData}
          className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Spectrum</span>
        </button>
      </div>

      {/* KPI Row */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-slate-400 text-[10px] uppercase font-semibold">Total AP Fleet</span>
            <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{metrics.totalAps} APs</div>
          </div>
          <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-slate-400 text-[10px] uppercase font-semibold">Online Access Points</span>
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{metrics.onlineAps} Active</div>
          </div>
          <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-slate-400 text-[10px] uppercase font-semibold">Associated Clients</span>
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-0.5">{metrics.totalClients} Stations</div>
          </div>
          <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-slate-400 text-[10px] uppercase font-semibold">WLC Gateways</span>
            <div className="text-lg font-bold text-purple-600 dark:text-purple-400 mt-0.5">{metrics.controllersCount} Controllers</div>
          </div>
        </div>
      )}

      {/* RF Spectrum Map Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 2.4 GHz Band */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-amber-500" />
              <span>2.4 GHz Channels Spectrum (Channels 1, 6, 11)</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              High Density
            </span>
          </div>

          <div className="space-y-2.5 pt-2">
            {[
              { ch: 1, load: 38, clients: 12 },
              { ch: 6, load: 28, clients: 16 },
              { ch: 11, load: 45, clients: 20 },
            ].map((c) => (
              <div key={c.ch} className="space-y-1">
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 font-mono">
                  <span>Channel {c.ch} (20 MHz)</span>
                  <span className="text-slate-900 dark:text-slate-200 font-semibold">{c.load}% load • {c.clients} clients</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${c.load > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${c.load}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5 GHz Band */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-blue-500" />
              <span>5 GHz UNII-1 & UNII-3 Spectrum (80 MHz)</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              Optimal Throughput
            </span>
          </div>

          <div className="space-y-2.5 pt-2">
            {[
              { ch: 36, load: 14, clients: 28 },
              { ch: 52, load: 18, clients: 22 },
              { ch: 149, load: 22, clients: 18 },
            ].map((c) => (
              <div key={c.ch} className="space-y-1">
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 font-mono">
                  <span>Channel {c.ch} (80 MHz)</span>
                  <span className="text-slate-900 dark:text-slate-200 font-semibold">{c.load}% load • {c.clients} clients</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-500"
                    style={{ width: `${c.load}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Operational Alerts Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Active Operational Alerts & Alarms</h3>
          <span className="text-xs text-slate-500">{alerts.length} total alarms</span>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3 px-4">Severity</th>
              <th className="py-3 px-4">Alert Title & Description</th>
              <th className="py-3 px-4">Target Entity</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500 font-sans">
                  Loading alerts...
                </td>
              </tr>
            ) : alerts.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500 font-sans">
                  Zero active alarms. All wireless nodes operating within thresholds.
                </td>
              </tr>
            ) : (
              alerts.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono border font-semibold ${
                        a.severity === 'CRITICAL'
                          ? 'bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
                          : 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                      }`}
                    >
                      <AlertTriangle className="w-3 h-3" />
                      <span>{a.severity}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900 dark:text-white text-xs">{a.title}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 max-w-lg">{a.message}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-800 dark:text-slate-200">
                    {a.targetType}: {a.targetId}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                        a.status === 'RESOLVED'
                          ? 'text-slate-400'
                          : a.status === 'ACKNOWLEDGED'
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{a.status}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {a.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleAcknowledge(a.id)}
                          className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-[11px] font-medium transition-colors"
                        >
                          Ack
                        </button>
                      )}
                      {a.status !== 'RESOLVED' && (
                        <button
                          onClick={() => handleResolve(a.id)}
                          className="px-2 py-1 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 text-[11px] font-medium transition-colors"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
