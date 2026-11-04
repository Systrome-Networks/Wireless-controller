import React, { useState, useEffect } from 'react';
import { Server, UserCheck, Plus, PowerOff, X, Radio } from 'lucide-react';
import { apiFetch } from '../api/client.js';

interface NasItem {
  id: number;
  nasname: string;
  shortname: string;
  type: string;
  description?: string;
}

interface RadiusUserItem {
  id: number;
  username: string;
  attribute: string;
  vlanId?: number;
}

interface SessionItem {
  radacctid: string;
  username: string;
  nasipaddress: string;
  callingstationid?: string;
  framedipaddress?: string;
  acctsessiontime?: number;
  acctinputoctets: string;
  acctoutputoctets: string;
}

export const RadiusAaaPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'nas' | 'sessions'>('users');
  const [nasList, setNasList] = useState<NasItem[]>([]);
  const [userList, setUserList] = useState<RadiusUserItem[]>([]);
  const [sessionList, setSessionList] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showUserModal, setShowUserModal] = useState(false);
  const [showNasModal, setShowNasModal] = useState(false);

  // Form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [vlanId, setVlanId] = useState<number>(100);

  const [nasname, setNasname] = useState('');
  const [shortname, setShortname] = useState('');
  const [nasType, setNasType] = useState('cisco');
  const [secret, setSecret] = useState('RadiusSecretKey123');

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      apiFetch<NasItem[]>('/radius/nas'),
      apiFetch<RadiusUserItem[]>('/radius/users'),
      apiFetch<SessionItem[]>('/radius/sessions'),
    ])
      .then(([n, u, s]) => {
        setNasList(n);
        setUserList(u);
        setSessionList(s);
      })
      .catch((err) => console.error('Failed to load RADIUS data:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/radius/users', {
        method: 'POST',
        body: JSON.stringify({ username, password, vlanId: Number(vlanId) }),
      });
      setShowUserModal(false);
      setUsername('');
      setPassword('');
      fetchData();
    } catch (err: any) {
      alert(`Failed to add user: ${err.message}`);
    }
  };

  const handleCreateNas = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/radius/nas', {
        method: 'POST',
        body: JSON.stringify({ nasname, shortname, type: nasType, secret }),
      });
      setShowNasModal(false);
      setNasname('');
      setShortname('');
      fetchData();
    } catch (err: any) {
      alert(`Failed to add NAS: ${err.message}`);
    }
  };

  const handleDisconnect = async (nasIp: string, clientMac: string) => {
    if (!window.confirm(`Transmit RFC 5176 Disconnect-Request to ${nasIp} for MAC ${clientMac}?`)) return;
    try {
      const res = await apiFetch<{ message: string }>('/radius/coa', {
        method: 'POST',
        body: JSON.stringify({ nasIp, clientMac, action: 'DISCONNECT' }),
      });
      alert(res.message);
      fetchData();
    } catch (err: any) {
      alert(`CoA Disconnect failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">AAA & FreeRADIUS Management</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">802.1X EAP credentials, dynamic VLAN assignment, NAS clients, and RFC 5176 CoA</p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'users' && (
            <button
              onClick={() => setShowUserModal(true)}
              className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add RADIUS User / MAB</span>
            </button>
          )}
          {activeTab === 'nas' && (
            <button
              onClick={() => setShowNasModal(true)}
              className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register NAS Client</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-2.5 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'users'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>802.1X Users & Dynamic VLANs ({userList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('nas')}
          className={`pb-2.5 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'nas'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>NAS Devices ({nasList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sessions')}
          className={`pb-2.5 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'sessions'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>Accounting Sessions ({sessionList.length})</span>
        </button>
      </div>

      {/* Tab 1: Users */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Username / MAC Address</th>
                <th className="py-3 px-4">Auth Method</th>
                <th className="py-3 px-4">Dynamic VLAN Assignment</th>
                <th className="py-3 px-4">Security Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300 font-mono">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500 font-sans">
                    Loading users...
                  </td>
                </tr>
              ) : (
                userList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      {u.username}
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-sans">
                      {u.username.length === 12 ? 'MAB (MAC Bypass)' : '802.1X / EAP-PEAP'}
                    </td>
                    <td className="py-3 px-4">
                      {u.vlanId ? (
                        <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-[11px] font-bold">
                          VLAN {u.vlanId}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-sans text-xs">Default VLAN</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">Authorized</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: NAS Devices */}
      {activeTab === 'nas' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">NAS IP / Hostname</th>
                <th className="py-3 px-4">Shortname</th>
                <th className="py-3 px-4">Vendor Type</th>
                <th className="py-3 px-4">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
              {nasList.map((n) => (
                <tr key={n.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-semibold text-slate-900 dark:text-white">
                    {n.nasname}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">{n.shortname}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {n.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500">{n.description || 'Controller NAS Client'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Sessions & CoA */}
      {activeTab === 'sessions' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Station MAC</th>
                <th className="py-3 px-4">Framed IP</th>
                <th className="py-3 px-4">NAS Client</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4 text-right">RFC 5176 CoA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300 font-mono">
              {sessionList.map((s) => (
                <tr key={s.radacctid} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                    {s.username}
                  </td>
                  <td className="py-3 px-4 text-slate-500">{s.callingstationid || 'A0:C5:89:11:22:01'}</td>
                  <td className="py-3 px-4 text-slate-900 dark:text-slate-200">{s.framedipaddress || '10.100.1.15'}</td>
                  <td className="py-3 px-4 text-slate-500">{s.nasipaddress}</td>
                  <td className="py-3 px-4 text-slate-400 font-sans text-[11px]">{s.acctsessiontime ? `${Math.floor(s.acctsessiontime / 60)} mins` : 'Active'}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDisconnect(s.nasipaddress, s.callingstationid || 'A0:C5:89:11:22:01')}
                      className="px-2 py-1 rounded bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 font-sans font-semibold text-[11px] transition-colors inline-flex items-center gap-1"
                    >
                      <PowerOff className="w-3 h-3" />
                      <span>Disconnect</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Add RADIUS 802.1X / MAB User</h3>
              <button onClick={() => setShowUserModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Username or MAC</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. alice.johnson or 001122334455"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Cleartext Password</label>
                <input
                  type="password"
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Dynamic VLAN (Tunnel-Private-Group-Id)</label>
                <input
                  type="number"
                  min="1"
                  max="4094"
                  value={vlanId}
                  onChange={(e) => setVlanId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-500/20"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add NAS Modal */}
      {showNasModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Register FreeRADIUS NAS Client</h3>
              <button onClick={() => setShowNasModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNas} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">NAS IP or Hostname</label>
                <input
                  type="text"
                  required
                  placeholder="10.10.1.10"
                  value={nasname}
                  onChange={(e) => setNasname(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Short Name</label>
                <input
                  type="text"
                  required
                  placeholder="cisco-wlc-01"
                  value={shortname}
                  onChange={(e) => setShortname(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Vendor NAS Type</label>
                <select
                  value={nasType}
                  onChange={(e) => setNasType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="cisco">Cisco WLC (IOS-XE / AireOS)</option>
                  <option value="aruba">Aruba Mobility Controller</option>
                  <option value="other">Standard RFC 2865 RADIUS Client</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Shared Secret</label>
                <input
                  type="password"
                  required
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNasModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-500/20"
                >
                  Register NAS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
