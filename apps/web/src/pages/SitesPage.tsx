import React, { useState, useEffect } from 'react';
import { Building2, Plus, MapPin, ChevronRight } from 'lucide-react';
import { apiFetch } from '../api/client.js';

interface SiteItem {
  id: string;
  name: string;
  timezone: string;
  address?: string;
  _count: {
    accessPoints: number;
    wirelessClients: number;
    controllers: number;
  };
  buildings?: Array<{
    id: string;
    name: string;
    floorCount: number;
    floors?: Array<{ id: string; name: string }>;
  }>;
}

export const SitesPage: React.FC = () => {
  const [sites, setSites] = useState<SiteItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<SiteItem[]>('/sites')
      .then(setSites)
      .catch((err) => console.error('Failed to load sites:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Sites & Campus Hierarchy</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Physical topology, campuses, buildings, and floor mapping</p>
        </div>

        <button className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-colors flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Site</span>
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500 text-sm">Loading campus sites...</div>
      ) : sites.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
          <Building2 className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">No Sites Configured</h3>
          <p className="text-xs text-slate-500 mt-1">Create your first campus site to organize APs and RF zones.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sites.map((site) => (
            <div key={site.id} className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-500" />
                      <span>{site.name}</span>
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{site.address || 'Address not specified'}</span>
                      <span className="text-slate-400 dark:text-slate-600">•</span>
                      <span className="text-slate-500 font-mono text-[11px]">{site.timezone}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    Site ID: {site.id.substring(0, 8)}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80">
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 text-center">
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-medium">Access Points</div>
                    <div className="text-base font-bold text-slate-900 dark:text-slate-200 mt-0.5">{site._count?.accessPoints || 0}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 text-center">
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-medium">Clients</div>
                    <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{site._count?.wirelessClients || 0}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 text-center">
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-medium">Buildings</div>
                    <div className="text-base font-bold text-purple-600 dark:text-purple-400 mt-0.5">{site.buildings?.length || 0}</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 cursor-pointer">
                <span>View Buildings & Floor Plans</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
