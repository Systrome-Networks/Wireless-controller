import React, { useState, useEffect } from 'react';
import { Play, CheckCircle2, X, Code } from 'lucide-react';
import { apiFetch } from '../api/client.js';

interface ConfigJob {
  id: string;
  status: string;
  dryRun: boolean;
  startedAt: string;
  completedAt?: string;
  apGroup?: { id: string; name: string };
  initiatedBy?: { name: string; email: string };
  items?: Array<{
    id: string;
    status: string;
    accessPoint: { name: string; macAddress: string; model: string };
  }>;
}

export const ConfigEnginePage: React.FC = () => {
  const [jobs, setJobs] = useState<ConfigJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [dryRun, setDryRun] = useState(false);
  const [deploying, setDeploying] = useState(false);

  const fetchJobs = () => {
    setLoading(true);
    apiFetch<ConfigJob[]>('/configurations/jobs')
      .then(setJobs)
      .catch((err) => console.error('Failed to load config jobs:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeploying(true);
    try {
      await apiFetch('/configurations/deploy', {
        method: 'POST',
        body: JSON.stringify({
          dryRun,
          configSnapshot: {
            policyVersion: 'v2.1',
            txPowerDbm: 18,
            minDataRateMbps: 12,
            channelBandwidth: 80,
            bandSteering: true,
          },
        }),
      });
      setShowModal(false);
      fetchJobs();
      alert(dryRun ? 'Dry run validation finished successfully!' : 'Configuration successfully deployed across fleet!');
    } catch (err: any) {
      alert(`Deployment failed: ${err.message}`);
    } finally {
      setDeploying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Centralized Configuration Engine</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Asynchronous policy deployment, dry-run preflight checks, and rollback history</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-colors flex items-center gap-1.5"
        >
          <Play className="w-3.5 h-3.5" />
          <span>Deploy Policy</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Job ID</th>
              <th className="py-3.5 px-4">Scope / Group</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Target APs</th>
              <th className="py-3.5 px-4">Executed By</th>
              <th className="py-3.5 px-4">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500 font-sans">
                  Loading configuration jobs...
                </td>
              </tr>
            ) : jobs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500 font-sans">
                  No configuration jobs dispatched yet.
                </td>
              </tr>
            ) : (
              jobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-[11px] font-semibold text-slate-900 dark:text-white">
                    {job.id.substring(0, 8)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {job.apGroup?.name || 'Campus Wide'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono border ${
                        job.status === 'SUCCESS'
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                          : 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{job.status}</span>
                      {job.dryRun && <span className="opacity-75">(DRY RUN)</span>}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                    {job.items?.length || 4} APs
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900 dark:text-slate-200">{job.initiatedBy?.name || 'Admin'}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{job.initiatedBy?.email || 'admin@wac.network'}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                    {new Date(job.startedAt).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Deploy Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Deploy Fleet Wireless Configuration</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDeploy} className="space-y-4 text-xs">
              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between font-semibold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5 text-blue-500" />
                    <span>Policy Snapshot Payload</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">JSON</span>
                </div>
                <pre className="text-[11px] font-mono text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-2.5 rounded border border-slate-200 dark:border-slate-800 overflow-x-auto">
{`{
  "policyVersion": "v2.1",
  "txPowerDbm": 18,
  "minDataRateMbps": 12,
  "channelBandwidth": 80,
  "bandSteering": true
}`}
                </pre>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60">
                <div>
                  <div className="font-semibold text-blue-900 dark:text-blue-300">Dry-Run Validation Mode</div>
                  <div className="text-[11px] text-blue-700 dark:text-blue-400">Validate against vendor APIs without committing changes</div>
                </div>
                <input
                  type="checkbox"
                  checked={dryRun}
                  onChange={(e) => setDryRun(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-0"
                />
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
                  disabled={deploying}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-500/20 disabled:opacity-50"
                >
                  {deploying ? 'Running Deployment...' : dryRun ? 'Run Preflight Dry Run' : 'Commit & Deploy to Fleet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
