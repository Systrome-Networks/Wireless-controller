import React, { useState, useEffect } from 'react';
import { Server, Plus, RefreshCw, CheckCircle2, X } from 'lucide-react';
import { apiFetch } from '../api/client.js';

interface ControllerItem {
  id: string;
  name: string;
  vendor: string;
  host: string;
  port: number;
  protocol: string;
  apiVersion?: string;
  status: string;
  apCount: number;
  lastSyncAt?: string;
  site?: { id: string; name: string };
}

export const ControllersPage: React.FC = () => {
  const [controllers, setControllers] = useState<ControllerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [vendor, setVendor] = useState('CISCO');
  const [host, setHost] = useState('');
  const [port, setPort] = useState(443);
  const [protocol, setProtocol] = useState('https');

  const fetchControllers = () => {
    setLoading(true);
    apiFetch<ControllerItem[]>('/controllers')
      .then(setControllers)
      .catch((err) => console.error('Failed to load controllers:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchControllers();
  }, []);

  const handleSync = async (id: string) => {
    setSyncingId(id);
    try {
      await apiFetch(`/controllers/${id}/sync`, { method: 'POST' });
      fetchControllers();
    } catch (err: any) {
      alert(`Sync failed: ${err.message}`);
    } finally {
      setSyncingId(null);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/controllers', {
        method: 'POST',
        body: JSON.stringify({ name, vendor, host, port: Number(port), protocol }),
      });
      setShowModal(false);
      setName('');
      setHost('');
      fetchControllers();
    } catch (err: any) {
      alert(`Registration failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Wireless Controllers & Gateways</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Manage external vendor WLC clusters, SDN controllers, and cloud orchestrators</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Register Controller</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 py-12 text-center text-slate-500 text-sm">Loading controllers...</div>
        ) : (
          controllers.map((c) => (
            <div key={c.id} className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                      <Server className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{c.name}</h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {c.vendor}
                      </span>
                    </div>
                  </div>

                  <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{c.status}</span>
                  </span>
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-slate-600 dark:text-slate-400 font-mono">
                  <div className="flex items-center justify-between">
                    <span>Host / IP:</span>
                    <span className="text-slate-900 dark:text-slate-200">{c.host}:{c.port}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Protocol:</span>
                    <span className="text-slate-900 dark:text-slate-200 uppercase">{c.protocol} ({c.apiVersion || 'API'})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Managed APs:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{c.apCount} APs</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Last Sync:</span>
                    <span className="text-slate-500">{c.lastSyncAt ? new Date(c.lastSyncAt).toLocaleTimeString() : 'Never'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">Campus: {c.site?.name || 'Headquarters'}</span>
                <button
                  onClick={() => handleSync(c.id)}
                  disabled={syncingId === c.id}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncingId === c.id ? 'animate-spin' : ''}`} />
                  <span>Sync Fleet</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Register Controller Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Register Vendor Controller</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Controller Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HQ-Catalyst-Cluster"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Vendor Ecosystem</label>
                <select
                  value={vendor}
                  onChange={(e) => setVendor(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="CISCO">Cisco Catalyst 9800 / AireOS</option>
                  <option value="ARUBA">Aruba Mobility Conductor (AOS 8/10)</option>
                  <option value="OMADA">TP-Link Omada SDN Controller</option>
                  <option value="UNIFI">Ubiquiti UniFi Network Application</option>
                  <option value="RUIJIE">Ruijie Cloud / Reyee Gateway</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Host / IP Address</label>
                  <input
                    type="text"
                    required
                    placeholder="10.10.1.10"
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Port</label>
                  <input
                    type="number"
                    value={port}
                    onChange={(e) => setPort(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Protocol</label>
                <select
                  value={protocol}
                  onChange={(e) => setProtocol(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="https">HTTPS</option>
                  <option value="http">HTTP</option>
                  <option value="ssh">SSH</option>
                  <option value="snmp">SNMP</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-500/20"
                >
                  Save & Connect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
