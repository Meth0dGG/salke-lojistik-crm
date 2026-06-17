/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Database, 
  RotateCw, 
  ArrowDownToLine, 
  CloudLightning,
  CheckCircle,
  Clock,
  ShieldCheck,
  Zap,
  HardDriveUpload,
  Server
} from 'lucide-react';
import { Backup, UserRole } from '../types';

interface BackupPanelProps {
  t: any;
  userRole: UserRole;
  backups: Backup[];
  onTriggerBackup: () => void;
}

export default function BackupPanel({
  t,
  userRole,
  backups,
  onTriggerBackup
}: BackupPanelProps) {
  const [backupFrequency, setBackupFrequency] = useState<'hourly' | 'daily' | 'weekly'>('daily');
  const [isSimulating, setIsSimulating] = useState(false);
  const [downloadSuccessCode, setDownloadSuccessCode] = useState<string | null>(null);

  // Trigger loading animation and mock manual backup successfully
  const handleCreateManualBackup = () => {
    // Only administrators or managers are allowed to manage database backups
    if (userRole !== 'admin') {
      alert("Operasyon Yetki Engeli: Veritabanı yönetim operasyonları ve anlık AES-256 yedekleme işlemleri sadece Sistem Yöneticisi (admin) yetkisindedir!");
      return;
    }

    setIsSimulating(true);
    setTimeout(() => {
      onTriggerBackup();
      setIsSimulating(false);
    }, 2000);
  };

  const simulateDownload = (filename: string, checksum: string) => {
    setDownloadSuccessCode(`"${filename}" mühür indiriliyor... SHA-256 doğrulaması tamamlandı: ${checksum.substring(0, 16)}...`);
    setTimeout(() => setDownloadSuccessCode(null), 6000);
  };

  return (
    <div className="space-y-6 fade-in" id="backup-management-panel">
      
      {/* Cloud Header info */}
      <div className="bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold font-display text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Database className="text-indigo-600 dark:text-sky-400" size={24} />
            {t.cloudStorageStatus}
          </h2>

          <button
            onClick={handleCreateManualBackup}
            disabled={isSimulating}
            className={`flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer dark:bg-sky-500`}
            id="btn-manual-backup"
          >
            {isSimulating ? (
              <RotateCw size={15} className="animate-spin" />
            ) : (
              <HardDriveUpload size={15} />
            )}
            {isSimulating ? "Yedek Alınıyor..." : t.createBackup}
          </button>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-350">
          {t.cloudDesc}
        </p>

        {isSimulating && (
          <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl space-y-3" id="backup-progress-card">
            <div className="flex justify-between items-center text-xs font-semibold text-indigo-700 dark:text-sky-300">
              <span>{t.simulatingCloudBackup}</span>
              <span>76%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-indigo-600 dark:bg-sky-500 h-full w-[76%] transition-all duration-300"></div>
            </div>
          </div>
        )}
      </div>

      {downloadSuccessCode && (
        <div className="bg-emerald-50 dark:bg-emerald-950/25 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3 text-emerald-800 dark:text-emerald-300 text-xs font-mono" id="download-trigger-success">
          {downloadSuccessCode}
        </div>
      )}

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left 1 Column: Config Auto Frequency */}
        <div className="bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4 h-fit">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm font-display flex items-center gap-1.5">
            <Clock size={16} />
            {t.autoBackupFrequency}
          </h3>

          <div className="space-y-2" id="backup-frequency-selectors">
            {[
              { id: 'hourly', label: t.hourly, time: "Her 60 dakikada bir otomatik" },
              { id: 'daily', label: t.daily, time: "Her gece saat 00:00'da (Önerilen)" },
              { id: 'weekly', label: t.weekly, time: "Pazar günleri haftalık yedek" },
            ].map((freq) => (
              <button
                key={freq.id}
                onClick={() => setBackupFrequency(freq.id as any)}
                className={`w-full text-left p-3 rounded-xl border transition cursor-pointer font-sans ${
                  backupFrequency === freq.id 
                    ? 'border-indigo-500 bg-indigo-50/30 dark:bg-slate-950/80 ring-2 ring-indigo-550/20' 
                    : 'border-slate-150 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200">{freq.label}</span>
                  {backupFrequency === freq.id && (
                    <span className="h-2 w-2 rounded-full bg-indigo-600"></span>
                  )}
                </div>
                <p className="text-[10px] sm:text-xs text-slate-400 mt-1">{freq.time}</p>
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-50 dark:border-slate-800 space-y-2 text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5"><ShieldCheck className="text-emerald-500" size={14} /> Otomatik yedekleme bütünlüğü aktif</div>
            <div className="flex items-center gap-1.5"><Server size={14} className="text-indigo-500" /> Sürüm saklama süresi: 30 Gün</div>
          </div>
        </div>

        {/* Right 2 Columns: Backup Archives logs directory */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-850 dark:text-slate-150 text-sm font-display mb-3">
              {t.backupHistory}
            </h3>

            <div className="overflow-x-auto" id="backup-history-table">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-slate-405 dark:text-slate-500 text-[10px] uppercase font-mono">
                    <th className="py-2.5 px-3">{t.filename}</th>
                    <th className="py-2.5 px-3">Zaman</th>
                    <th className="py-2.5 px-3">{t.size}</th>
                    <th className="py-2.5 px-3">Tür</th>
                    <th className="py-2.5 px-3 text-right">Mühür</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {backups.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/20 font-mono text-[11px]">
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-700 dark:text-slate-350">{b.filename}</span>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono tracking-tighter truncate max-w-[170px]" title={b.checksum}>
                          Hash: {b.checksum}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-500">{b.timestamp}</td>
                      <td className="py-3 px-3 text-slate-705 dark:text-slate-300 font-bold">{b.size}</td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex px-1.5 py-0.5 rounded-sm uppercase text-[9px] font-black ${
                          b.type === 'auto' ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400'
                        }`}>
                          {b.type === 'auto' ? 'Otomatik' : 'Manuel'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-xs font-sans">
                        <button
                          onClick={() => simulateDownload(b.filename, b.checksum)}
                          className="px-2 py-1 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded hover:bg-indigo-600 hover:text-white transition-colors duration-250 cursor-pointer flex items-center justify-center gap-1 text-[11px] ml-auto"
                        >
                          <ArrowDownToLine size={11} />
                          {t.download}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-950/30 rounded-xl mt-4 flex items-center gap-3">
            <CloudLightning className="text-yellow-500 animate-pulse shrink-0" size={20} />
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">
              <strong>Yük Kurtarma (Disaster Recovery):</strong> En kötü felaket senaryolarında, son yedek dosyanızı yeni bir Docker imajına yükleyerek ERP sisteminizi 3 saniyede sıfır veri kaybı ile ayağa kaldırabilirsiniz.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
