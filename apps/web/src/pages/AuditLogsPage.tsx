import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api/client.js';

interface AuditItem {
  id: string;
  action: string;
  targetType: string;
  targetId?: string;
  ipAddress?: string;
  details?: Record<string, unknown>;
  createdAt: string;
  user?: {
    name: string;
    email: string;
    role: string;
  };
}

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<{ logs: AuditItem[] }>('/audit-logs')
      .then((data) => setLogs(data.logs || []))
      .catch((err) => console.error('Failed to load audit logs:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Security & Operational Audit Trail</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Immutable record of all administrative actions, logins, and configuration changes</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Actor</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Target</th>
              <th className="py-3 px-4">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300 font-mono">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500 font-sans">
                  Loading audit logs...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500 font-sans">
                  No audit logs recorded yet
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-[11px]">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-sans">
                    <div className="font-semibold text-slate-900 dark:text-white text-xs">{log.user?.name || 'System Daemon'}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{log.user?.email || 'internal'}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-800 dark:text-slate-300 text-[11px]">
                    {log.targetType} {log.targetId && `(${log.targetId.substring(0, 8)}...)`}
                  </td>
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-[11px]">
                    {log.ipAddress || '127.0.0.1'}
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
