import React, { useState, useEffect } from 'react';
import { Radio, RefreshCw, Power, Search, Filter, X, Cpu, HardDrive } from 'lucide-react';
import { apiFetch } from '../api/client.js';

interface APItem {
  id: string;
  name: string;
  macAddress: string;
  ipAddress: string;
  serialNumber?: string;
  vendor: string;
  model: string;
  firmwareVersion?: string;
  status: string;
  uptimeSeconds: number;
  cpuUsagePercent: number;
  memoryUsagePercent: number;
  connectedClientsCount: number;
  configDrift: string;
  site?: { id: string; name: string };
  controller?: { id: string; name: string; vendor: string };
  apGroup?: { id: string; name: string };
  radios?: Array<{
    id: string;
    band: string;
    channel: number;
    channelWidth: number;
    txPowerDbm: number;
    utilizationPercent: number;
    clientCount: number;
  }>;
}

export const AccessPointsPage: React.FC = () => {
  const [aps, setAps] = useState<APItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<string>('ALL');
  const [selectedAp, setSelectedAp] = useState<APItem | null>(null);
  const [rebootingId, setRebootingId] = useState<string | null>(null);

  const fetchAps = () => {
    setLoading(true);
    let url = '/access-points';
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (selectedVendor !== 'ALL') params.append('vendor', selectedVendor);
    if (params.toString()) url += `?${params.toString()}`;

    apiFetch<APItem[]>(url)
      .then(setAps)
      .catch((err) => console.error('Failed to load APs:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAps();
  }, [selectedVendor]);

  const handleReboot = async (id: string, name: string) => {
    if (!window.confirm(`Initiate reboot sequence for AP: ${name}?`)) return;
    setRebootingId(id);
    try {
      await apiFetch(`/access-points/${id}/reboot`, { method: 'POST' });
      alert(`Reboot command dispatched to ${name}`);
      fetchAps();
    } catch (err: any) {
      alert(`Reboot failed: ${err.message}`);
    } finally {
      setRebootingId(null);
    }
  };

  const getVendorBadge = (vendor: string) => {
    switch (vendor) {
      case 'CISCO':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30';
      case 'ARUBA':
        return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30';
      case 'OMADA':
        return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30';
      case 'UNIFI':
        return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30';
      case 'RUIJIE':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30';
      default:
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Access Point Fleet Inventory</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Centralized inventory, live status, RF metrics, and lifecycle operations across all vendors</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAps}
            className="px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by AP Name, MAC, IP, or Model..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchAps()}
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-500 dark:text-slate-400">Vendor:</span>
          <select
            value={selectedVendor}
            onChange={(e) => setSelectedVendor(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Vendors</option>
            <option value="CISCO">Cisco</option>
            <option value="ARUBA">Aruba</option>
            <option value="OMADA">TP-Link Omada</option>
            <option value="UNIFI">Ubiquiti UniFi</option>
            <option value="RUIJIE">Ruijie</option>
            <option value="NATIVE_CAPWAP">Native CAPWAP</option>
          </select>
        </div>
      </div>

      {/* AP Inventory Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Access Point</th>
              <th className="py-3.5 px-4">Vendor & Model</th>
              <th className="py-3.5 px-4">Network / IP</th>
              <th className="py-3.5 px-4">Campus / Group</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Clients</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500 font-sans">
                  Loading access point inventory...
                </td>
              </tr>
            ) : aps.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500 font-sans">
                  No access points match the filter criteria.
                </td>
              </tr>
            ) : (
              aps.map((ap) => (
                <tr key={ap.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => setSelectedAp(ap)}
                      className="text-left group cursor-pointer"
                    >
                      <div className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors flex items-center gap-1.5">
                        <Radio className="w-3.5 h-3.5 text-blue-500" />
                        <span>{ap.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">{ap.macAddress}</div>
                    </button>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono border font-medium ${getVendorBadge(ap.vendor)}`}>
                      {ap.vendor}
                    </span>
                    <div className="text-slate-600 dark:text-slate-300 font-medium text-[11px] mt-1">{ap.model}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px]">
                    <div className="text-slate-900 dark:text-slate-200">{ap.ipAddress}</div>
                    <div className="text-slate-400 text-[10px]">{ap.firmwareVersion || 'v1.0'}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="text-slate-800 dark:text-slate-200 text-xs">{ap.site?.name || 'Unassigned Site'}</div>
                    <div className="text-slate-400 text-[11px]">{ap.apGroup?.name || 'No Group'}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{ap.status}</span>
                    </span>
                    <div className="text-slate-400 text-[10px] mt-0.5">
                      Up {Math.floor(ap.uptimeSeconds / 86400)}d {Math.floor((ap.uptimeSeconds % 86400) / 3600)}h
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                    {ap.connectedClientsCount}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleReboot(ap.id, ap.name)}
                      disabled={rebootingId === ap.id}
                      title="Reboot Access Point"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                    >
                      <Power className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* AP Details Modal */}
      {selectedAp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-500">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{selectedAp.name}</h3>
                  <div className="text-xs text-slate-400 font-mono">{selectedAp.macAddress} • {selectedAp.ipAddress}</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedAp(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Hardware & Telemetry Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase">Vendor / Model</span>
                <div className="font-semibold text-slate-900 dark:text-slate-200 mt-1">{selectedAp.vendor} {selectedAp.model}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase">Firmware</span>
                <div className="font-semibold text-slate-900 dark:text-slate-200 mt-1">{selectedAp.firmwareVersion || 'v1.4.2'}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase flex items-center gap-1">
                  <Cpu className="w-3 h-3" /> CPU Load
                </span>
                <div className="font-semibold text-slate-900 dark:text-slate-200 mt-1">{selectedAp.cpuUsagePercent}%</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase flex items-center gap-1">
                  <HardDrive className="w-3 h-3" /> Memory
                </span>
                <div className="font-semibold text-slate-900 dark:text-slate-200 mt-1">{selectedAp.memoryUsagePercent}%</div>
              </div>
            </div>

            {/* Radios Info */}
            <div>
              <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Radios Configuration</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedAp.radios && selectedAp.radios.length > 0 ? (
                  selectedAp.radios.map((r, i) => (
                    <div key={i} className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
                      <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                        <span>{r.band} Radio</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/30">Ch {r.channel} ({r.channelWidth}MHz)</span>
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 text-[11px]">Tx Power: {r.txPowerDbm} dBm • Load: {r.utilizationPercent}%</div>
                      <div className="text-slate-500 dark:text-slate-400 text-[11px]">Connected Stations: {r.clientCount} clients</div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-slate-400 text-xs col-span-2">Dual-band 2.4GHz & 5GHz Wi-Fi 6 Radios active</div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedAp(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
