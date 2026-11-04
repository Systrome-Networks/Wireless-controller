import React, { useState, useEffect } from 'react';
import { Wifi, Plus, Layers, X, CheckCircle2 } from 'lucide-react';
import { apiFetch } from '../api/client.js';

interface SsidItem {
  id: string;
  name: string;
  enabled: boolean;
  broadcastSsid: boolean;
  securityType: string;
  vlanId: number;
  clientIsolation: boolean;
  bandSteering: boolean;
  minDataRateMbps?: number;
  bands: string[];
  radiusPrimaryIp?: string;
  apGroupSsids?: Array<{
    apGroup: { id: string; name: string };
  }>;
  _count?: { wirelessClients: number };
}

export const WirelessSsidsPage: React.FC = () => {
  const [ssids, setSsids] = useState<SsidItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [securityType, setSecurityType] = useState('WPA2_PERSONAL');
  const [passphrase, setPassphrase] = useState('');
  const [vlanId, setVlanId] = useState(100);
  const [clientIsolation, setClientIsolation] = useState(false);
  const [bandSteering, setBandSteering] = useState(true);
  const [radiusPrimaryIp, setRadiusPrimaryIp] = useState('');
  const [radiusSecret, setRadiusSecret] = useState('');

  const fetchSsids = () => {
    setLoading(true);
    apiFetch<SsidItem[]>('/wireless/ssids')
      .then(setSsids)
      .catch((err) => console.error('Failed to load SSIDs:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSsids();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/wireless/ssids', {
        method: 'POST',
        body: JSON.stringify({
          name,
          securityType,
          passphrase: passphrase || undefined,
          vlanId: Number(vlanId),
          clientIsolation,
          bandSteering,
          radiusPrimaryIp: radiusPrimaryIp || undefined,
          radiusSecret: radiusSecret || undefined,
        }),
      });
      setShowModal(false);
      setName('');
      setPassphrase('');
      fetchSsids();
    } catch (err: any) {
      alert(`Failed to create SSID: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Wireless Networks & SSIDs</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Define centralized 802.11 SSIDs, security policies, dynamic VLANs, and RADIUS settings</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create SSID</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 py-12 text-center text-slate-500 text-sm">Loading SSIDs...</div>
        ) : (
          ssids.map((ssid) => (
            <div key={ssid.id} className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <Wifi className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{ssid.name}</h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                        {ssid.securityType}
                      </span>
                    </div>
                  </div>

                  <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Active</span>
                  </span>
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-slate-600 dark:text-slate-400 font-mono">
                  <div className="flex items-center justify-between">
                    <span>VLAN Tag:</span>
                    <span className="font-bold text-slate-900 dark:text-slate-200">VLAN {ssid.vlanId}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Client Isolation:</span>
                    <span className="text-slate-900 dark:text-slate-200">{ssid.clientIsolation ? 'Enabled' : 'Disabled'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Band Steering:</span>
                    <span className="text-slate-900 dark:text-slate-200">{ssid.bandSteering ? 'Prefer 5GHz' : 'Disabled'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Connected Stations:</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{ssid._count?.wirelessClients || 0} clients</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-slate-500">
                  <Layers className="w-3.5 h-3.5" />
                  <span>
                    {ssid.apGroupSsids && ssid.apGroupSsids.length > 0
                      ? `${ssid.apGroupSsids.length} AP Groups`
                      : 'Global Fleet'}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">ID: {ssid.id.substring(0, 6)}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create SSID Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Create New Wireless SSID</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">SSID Name (Broadcast String)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme-HQ-Secure"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Security Type</label>
                  <select
                    value={securityType}
                    onChange={(e) => setSecurityType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="WPA2_PERSONAL">WPA2-Personal (PSK)</option>
                    <option value="WPA3_PERSONAL">WPA3-Personal (SAE)</option>
                    <option value="WPA2_ENTERPRISE">WPA2-Enterprise (802.1X)</option>
                    <option value="WPA3_ENTERPRISE">WPA3-Enterprise (802.1X)</option>
                    <option value="OPEN">Open (No Encryption)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">VLAN ID (1-4094)</label>
                  <input
                    type="number"
                    min="1"
                    max="4094"
                    value={vlanId}
                    onChange={(e) => setVlanId(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {securityType.includes('PERSONAL') && (
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">WPA Passphrase</label>
                  <input
                    type="password"
                    placeholder="Minimum 8 characters"
                    value={passphrase}
                    onChange={(e) => setPassphrase(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              {securityType.includes('ENTERPRISE') && (
                <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">RADIUS Primary IP</label>
                    <input
                      type="text"
                      placeholder="10.10.1.50"
                      value={radiusPrimaryIp}
                      onChange={(e) => setRadiusPrimaryIp(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">RADIUS Shared Secret</label>
                    <input
                      type="password"
                      placeholder="Shared secret"
                      value={radiusSecret}
                      onChange={(e) => setRadiusSecret(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bandSteering}
                    onChange={(e) => setBandSteering(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-0"
                  />
                  <span className="font-medium text-slate-700 dark:text-slate-300">Band Steering (Prefer 5GHz)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={clientIsolation}
                    onChange={(e) => setClientIsolation(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-0"
                  />
                  <span className="font-medium text-slate-700 dark:text-slate-300">Client Isolation</span>
                </label>
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
                  Create & Save SSID
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
