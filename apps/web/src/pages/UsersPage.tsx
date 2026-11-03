import React, { useState, useEffect } from 'react';
import { UserPlus, Shield, CheckCircle2, XCircle } from 'lucide-react';
import { apiFetch } from '../api/client.js';

interface UserItem {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<UserItem[]>('/users')
      .then(setUsers)
      .catch((err) => console.error('Failed to load users:', err))
      .finally(() => setLoading(false));
  }, []);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'ORG_ADMIN':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'NETWORK_ADMIN':
      case 'WIRELESS_ADMIN':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'SECURITY_ADMIN':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Identity & Access Control (RBAC)</h2>
          <p className="text-xs text-slate-400 mt-0.5">Manage administrative roles, operator privileges, and user accounts</p>
        </div>

        <button className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-colors flex items-center gap-1.5">
          <UserPlus className="w-3.5 h-3.5" />
          <span>Invite New User</span>
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">User</th>
              <th className="py-3 px-4">Role / Scope</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Last Login</th>
              <th className="py-3 px-4">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">
                  Loading users...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-white">{u.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono border ${getRoleBadge(u.role)}`}>
                      <Shield className="w-3 h-3" />
                      <span>{u.role}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {u.isActive ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Active</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-400 text-[11px]">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Deactivated</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                    {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : 'Never'}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                    {new Date(u.createdAt).toLocaleDateString()}
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
