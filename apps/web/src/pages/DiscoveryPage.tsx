import React, { useState, useEffect } from 'react';
import { Compass, Play, Download, CheckCircle2 } from 'lucide-react';
import { apiFetch } from '../api/client.js';

interface DiscoveredItem {
  id: string;
  ip: string;
  mac?: string;
  sysDescr?: string;
  vendor: string;
  model?: string;
  serialNumber?: string;
  status: string;
  discoveredAt: string;
}

interface DiscoveryJobItem {
  id: string;
  subnetRange: string;
  status: string;
  discoveredDevicesCount: number;
  devices: DiscoveredItem[];
  startedAt: string;
}

export const DiscoveryPage: React.FC = () => {
  const [jobs, setJobs] = useState<DiscoveryJobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  // Scan form state
  const [subnetRange, setSubnetRange] = useState('10.10.1.0/24');
  const [snmpVersion, setSnmpVersion] = useState<'v2c' | 'v3'>('v2c');
  const [community, setCommunity] = useState('public');

  const fetchJobs = () => {
    setLoading(true);
    apiFetch<DiscoveryJobItem[]>('/discovery/jobs')
      .then(setJobs)
      .catch((err) => console.error('Failed to load discovery jobs:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleStartScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setScanning(true);
    try {
      await apiFetch('/discovery/scan', {
        method: 'POST',
        body: JSON.stringify({ subnetRange, snmpVersion, community }),
      });
      fetchJobs();
    } catch (err: any) {
      alert(`Discovery scan failed: ${err.message}`);
    } finally {
      setScanning(false);
    }
  };

  const handleImport = async (deviceId: string) => {
    try {
      await apiFetch(`/discovery/import/${deviceId}`, { method: 'POST' });
      alert('Access Point successfully imported into Fleet Inventory!');
      fetchJobs();
    } catch (err: any) {
      alert(`Import failed: ${err.message}`);
    }
  };

  // Flatten all discovered devices
  const allDevices = jobs.flatMap((j) => j.devices || []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Automated Device Discovery</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Scan subnets via SNMP v2c/v3, ICMP, and LLDP to discover and import access points</p>
        </div>
      </div>

      {/* Discovery Scanner Card */}
      <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <Compass className="w-4 h-4 text-blue-500" />
          <span>Launch Subnet Sweep</span>
        </div>

        <form onSubmit={handleStartScan} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-slate-500 dark:text-slate-400 mb-1">Subnet Range (CIDR)</label>
            <input
              type="text"
              required
              value={subnetRange}
              onChange={(e) => setSubnetRange(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
              placeholder="10.10.1.0/24"
            />
          </div>

          <div>
            <label className="block text-slate-500 dark:text-slate-400 mb-1">SNMP Protocol</label>
            <select
              value={snmpVersion}
              onChange={(e) => setSnmpVersion(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
            >
              <option value="v2c">SNMP v2c</option>
              <option value="v3">SNMP v3 (USM / AuthPriv)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-500 dark:text-slate-400 mb-1">Community String</label>
            <input
              type="text"
              value={community}
              onChange={(e) => setCommunity(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
              placeholder="public"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={scanning}
              className="w-full py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-500/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{scanning ? 'Scanning Subnet...' : 'Start Discovery'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Discovered Devices Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Discovered Wireless Hardware</h3>
          <span className="text-xs text-slate-500">{allDevices.length} unmanaged / new devices found</span>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3 px-4">Device IP / MAC</th>
              <th className="py-3 px-4">Detected Vendor</th>
              <th className="py-3 px-4">Model & System Info</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500 font-sans">
                  Loading discovered devices...
                </td>
              </tr>
            ) : allDevices.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500 font-sans">
                  No devices discovered yet. Run a subnet sweep above.
                </td>
              </tr>
            ) : (
              allDevices.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono">
                    <div className="font-semibold text-slate-900 dark:text-white">{d.ip}</div>
                    <div className="text-[11px] text-slate-400">{d.mac || '00:00:00:00:00:00'}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                      {d.vendor}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900 dark:text-slate-200">{d.model || 'Access Point'}</div>
                    <div className="text-[11px] text-slate-400 truncate max-w-xs">{d.sysDescr}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                        d.status === 'IMPORTED' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{d.status}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {d.status === 'IMPORTED' ? (
                      <span className="text-[11px] text-slate-400 font-medium">In Fleet</span>
                    ) : (
                      <button
                        onClick={() => handleImport(d.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-600/10 hover:bg-blue-100 dark:hover:bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 text-xs font-semibold flex items-center gap-1.5 ml-auto transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Import AP</span>
                      </button>
                    )}
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
