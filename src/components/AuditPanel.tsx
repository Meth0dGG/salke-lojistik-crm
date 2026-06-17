/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  FileLock2, 
  Search, 
  ShieldAlert, 
  Check, 
  Cpu, 
  RefreshCcw,
  Fingerprint
} from 'lucide-react';
import { AuditLog } from '../types';

interface AuditPanelProps {
  t: any;
  auditLogs: AuditLog[];
}

export default function AuditPanel({
  t,
  auditLogs
}: AuditPanelProps) {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');

  // Filter logs list
  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(search.toLowerCase()) ||
                          log.user.toLowerCase().includes(search.toLowerCase()) ||
                          log.role.toLowerCase().includes(search.toLowerCase()) ||
                          log.ip.includes(search);
    
    const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;

    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="space-y-6 fade-in" id="audit-trail-panel">
      
      {/* Intro info card */}
      <div className="bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold font-display text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <FileLock2 className="text-indigo-600 dark:text-sky-400" size={24} />
            {t.auditLogsTitle}
          </h2>

          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300 rounded-lg text-xs font-mono font-bold">
            <Fingerprint size={14} />
            SHA-256 GÜVENLİ
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-350">
          {t.auditDesc}
        </p>
      </div>

      {/* Filter Options */}
      <div className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row gap-4 justify-between" id="audit-logs-filter">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={17} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Kullanıcı adı, rol, IP adresi veya eylem aratın..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl outline-hidden focus:border-indigo-505 text-slate-800 dark:text-slate-100"
          />
        </div>

        <div className="flex gap-2" id="audit-severity-pills">
          {['all', 'info', 'warning', 'critical'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition cursor-pointer ${
                severityFilter === sev
                  ? 'bg-indigo-600 text-white dark:bg-sky-505'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800/80 dark:hover:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {sev === 'all' ? 'Tümü' : sev}
            </button>
          ))}
        </div>
      </div>

      {/* Audit logs listing table */}
      <div className="bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs" id="audit-table-wrapper">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-[10px] uppercase font-mono tracking-wider">
                <th className="py-2.5 px-4">{t.timestamp}</th>
                <th className="py-2.5 px-4">{t.user} / Rol</th>
                <th className="py-2.5 px-4">{t.action}</th>
                <th className="py-2.5 px-4">{t.ipAddress}</th>
                <th className="py-2.5 px-4 text-right">Durum Imzası</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px] leading-tight">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/20 transition">
                  <td className="py-3.5 px-4 text-slate-500 font-mono text-xs">{log.timestamp}</td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-800 dark:text-slate-205 block font-sans text-xs">{log.user}</span>
                    <span className="text-[10px] text-slate-400 font-sans">{log.role}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`font-semibold  text-wrap break-words block text-xs font-sans ${
                      log.severity === 'critical' ? 'text-rose-600 dark:text-rose-400 font-bold' :
                      log.severity === 'warning' ? 'text-amber-600 dark:text-amber-400' :
                      'text-slate-700 dark:text-slate-300'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">{log.ip}</td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <span className="text-[9px] text-emerald-500 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-1.5 py-0.5 rounded font-mono font-bold tracking-tighter">
                        {log.hash}
                      </span>
                      <span className="h-2 w-2 rounded-full bg-emerald-500" title="Mühür Bütünlüğü Korunuyor"></span>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-400 font-sans text-xs">
                    Güvenlik günlüğü filtresine uyan kayıt bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
