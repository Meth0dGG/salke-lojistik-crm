/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React from 'react';
import { 
  Shield, 
  UserCheck, 
  Lock, 
  Check, 
  X, 
  HelpCircle, 
  Smartphone,
  Eye,
  Key
} from 'lucide-react';
import { UserRole } from '../types';

interface RolesPanelProps {
  t: any;
  currentRole: UserRole;
  twoFactorEnabled: boolean;
  onRoleChange: (role: UserRole) => void;
  onToggleTwoFactor: () => void;
}

export default function RolesPanel({
  t,
  currentRole,
  twoFactorEnabled,
  onRoleChange,
  onToggleTwoFactor
}: RolesPanelProps) {
  
  // Define full role details
  const rolesDetails = [
    {
      id: "admin" as UserRole,
      title: t.admin,
      badge: "Sınırsız Kök Yetki (Root)",
      color: "border-rose-300 bg-rose-50/50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300",
      desc: "Tüm CRM veritabanı mütasyonları, AWS/GCP bulut şifreleme anahtarı manipülasyonları, otomatik yedek sıklıkları düzenlenmesi ve API token üretme yetkileri."
    },
    {
      id: "logistics_manager" as UserRole,
      title: t.logistics_manager,
      badge: "Operasyon Amiri",
      color: "border-violet-300 bg-violet-50/50 dark:bg-violet-950/20 text-violet-800 dark:text-violet-300",
      desc: "Sevkiyat süreçlerini yönetme, anlık gecikmeleri raporlama, gümrük blokajı ekleme ve saha ekibi ataması yapma yetkileri."
    },
    {
      id: "customer_rep" as UserRole,
      title: t.customer_rep,
      badge: "CRM Sorumlusu",
      color: "border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300",
      desc: "Müşteri kartı açma, VIP entegrasyonu, temsilci atama ve talep takibi. Sevkiyat ve mühürlü yedekleme işlemlerine müdahale edemez."
    },
    {
      id: "support" as UserRole,
      title: t.support,
      badge: "Saha Elemanı",
      color: "border-blue-300 bg-blue-50/50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-300",
      desc: "Mevcut sevkiyatların durumlarını (Preparing, In Transit, Delivered) saha koşullarına göre güncelleme yetkisi. CRM değiştiremez."
    }
  ];

  const permissions = [
    { name: t.viewData, roles: ["admin", "logistics_manager", "customer_rep", "support"] },
    { name: t.editData, roles: ["admin", "logistics_manager", "customer_rep"] },
    { name: t.manageBackups, roles: ["admin"] },
    { name: t.accessApi, roles: ["admin", "logistics_manager"] },
    { name: t.viewAuditLogs, roles: ["admin"] }
  ];

  return (
    <div className="space-y-6 fade-in" id="roles-permissions-panel">
      
      {/* Intro section */}
      <div className="bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-3">
        <h2 className="text-xl font-bold font-display text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Shield className="text-indigo-600 dark:text-sky-400" size={24} />
          {t.rolesPermissions}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-355 text-balance">
          {t.rolesDesc}
        </p>

        {/* Current Active Identity */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/80 border border-slate-200/60 dark:border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-sky-400">
              <UserCheck size={20} />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold block">{t.currentRole}</span>
              <span className="font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base capitalize">
                {t[currentRole] || currentRole}
              </span>
            </div>
          </div>

          <div className="flex gap-1.5 flex-wrap" id="roles-switchers">
            {rolesDetails.map((r) => (
              <button
                key={r.id}
                onClick={() => onRoleChange(r.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
                  currentRole === r.id 
                    ? 'bg-indigo-600 active:bg-indigo-700 text-white dark:bg-sky-500 hover:opacity-90 shadow-sm' 
                    : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400'
                }`}
              >
                {t[r.id] || r.id}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Two Factor setup & Security info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Role Details */}
        <div className="md:col-span-2 space-y-4" id="role-cards-grid">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base font-display">Rol Erişim Limitleri & Politikaları</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {rolesDetails.map((rd) => (
              <div 
                key={rd.id}
                className={`p-4 border rounded-xl space-y-2 transition-all ${
                  currentRole === rd.id 
                    ? 'ring-2 ring-indigo-505 dark:ring-sky-500/50 bg-indigo-50/20 dark:bg-slate-900/80 border-indigo-400' 
                    : 'opacity-70 bg-white border-slate-150 dark:bg-slate-900/40 dark:border-slate-800/80'
                }`}
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{rd.title}</h4>
                  <span className={`text-[8px] sm:text-[9px] font-bold font-mono px-2 py-0.5 rounded-md ${rd.color}`}>
                    {rd.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed text-wrap">
                  {rd.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Column: MFA setup Card */}
        <div className="space-y-4" id="mfa-sidebar">
          <h3 className="font-bold text-slate-800 dark:text-slate-250 text-base font-display">Sistem Güvenlik Kapısı</h3>
          
          <div className="bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-start gap-2 text-indigo-600 dark:text-sky-400">
              <Smartphone size={24} className="shrink-0" />
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs sm:text-sm">{t.mfaRequirement}</h4>
                <p className="text-[11px] text-slate-400 leading-tight mt-1">{t.mfaDesc}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Zorunlu MFA Durumu:</span>
              <button
                onClick={onToggleTwoFactor}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-hidden cursor-pointer ${
                  twoFactorEnabled ? 'bg-indigo-600 dark:bg-sky-500' : 'bg-slate-200 dark:bg-slate-800'
                }`}
                id="toggle-mfa"
              >
                <span className="sr-only">Toggle MFA</span>
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {twoFactorEnabled ? (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-xl space-y-1 text-center">
                <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 block">✓ MFA Koruması Aktif</span>
                <p className="text-[10px] text-slate-400">Gelişmiş veri şifreleme ve DB operasyonları onaylandı.</p>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 rounded-xl space-y-1 text-center">
                <span className="text-xs font-semibold text-amber-800 dark:text-amber-400 block">▲ Güvenlik Açığı</span>
                <p className="text-[10px] text-slate-400">Kritik işlemlerde ek güvenlik onayı devre dışı.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Permissions Matrix Table representation */}
      <div className="bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs">
        <h3 className="font-semibold text-slate-850 dark:text-slate-100 font-display mb-3 flex items-center gap-1">
          <Lock size={16} />
          {t.permissionsMatrix}
        </h3>

        <div className="overflow-x-auto" id="permissions-matrix-table-wrapper">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-100 dark:border-slate-800 text-slate-400 text-[10px] uppercase font-mono">
                <th className="py-2.5 px-4">{t.permission}</th>
                <th className="py-2.5 px-4 text-center">{t.admin}</th>
                <th className="py-2.5 px-4 text-center">{t.logistics_manager}</th>
                <th className="py-2.5 px-4 text-center">{t.customer_rep}</th>
                <th className="py-2.5 px-4 text-center">{t.support}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {permissions.map((perm, i) => (
                <tr key={i} className="hover:bg-slate-50/20 transition">
                  <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-350">{perm.name}</td>
                  {["admin", "logistics_manager", "customer_rep", "support"].map((rId) => {
                    const isAllowed = perm.roles.includes(rId);
                    return (
                      <td key={rId} className="py-3 px-4 text-center">
                        <span className={`inline-flex p-1 rounded-full ${
                          isAllowed ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-950/20 text-rose-400 dark:text-rose-500'
                        }`}>
                          {isAllowed ? <Check size={14} /> : <X size={14} />}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
