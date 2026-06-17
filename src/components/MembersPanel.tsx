/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Users, UserPlus, Key, Shield, ShieldAlert, CheckCircle, Trash2, Edit } from 'lucide-react';
import { SystemUser, UserRole } from '../types';

interface MembersPanelProps {
  t: any;
  users: SystemUser[];
  onAddUser: (u: SystemUser) => void;
  onUpdateUser: (u: SystemUser) => void;
  onDeleteUser: (id: string) => void;
  toast: (msg: string) => void;
}

export default function MembersPanel({
  t,
  users,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  toast
}: MembersPanelProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [personnelName, setPersonnelName] = useState('');
  const [role, setRole] = useState<UserRole>('customer_rep');
  const [error, setError] = useState<string | null>(null);
  
  // Edit mode tracking state
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const handleEditClick = (u: SystemUser) => {
    setEditingUserId(u.id);
    setUsername(u.username);
    setPassword(u.password || '');
    setPersonnelName(u.personnelName);
    setRole(u.role);
    setError(null);
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setUsername('');
    setPassword('');
    setPersonnelName('');
    setRole('customer_rep');
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();
    const cleanPersonnelName = personnelName.trim();

    if (!cleanUsername || !cleanPassword || !cleanPersonnelName) {
      setError("Lütfen alanları boş bırakmayın!");
      return;
    }

    // Check username conflict with others
    const conflict = users.some(u => u.id !== editingUserId && u.username.toLowerCase() === cleanUsername);
    if (conflict) {
      setError(`"${username}" kullanıcı adı zaten başka bir üye tarafından kullanılmaktadır.`);
      return;
    }

    if (editingUserId) {
      // Perform save update
      const updatedUser: SystemUser = {
        id: editingUserId,
        username: cleanUsername,
        password: cleanPassword,
        personnelName: cleanPersonnelName,
        role: role
      };

      onUpdateUser(updatedUser);
      setEditingUserId(null);
      toast(`Üye bilgileri ve yetkileri başarıyla güncellendi: ${updatedUser.personnelName}`);
    } else {
      // Create new user
      const newUser: SystemUser = {
        id: `usr-${Date.now()}`,
        username: cleanUsername,
        password: cleanPassword,
        personnelName: cleanPersonnelName,
        role: role
      };

      onAddUser(newUser);
      toast(`Yeni üye başarıyla oluşturuldu: ${newUser.personnelName} (${newUser.username})`);
    }

    // Reset input fields
    setUsername('');
    setPassword('');
    setPersonnelName('');
    setRole('customer_rep');
  };

  return (
    <div className="space-y-6 fade-in" id="members-management-panel">
      {/* Header introduction */}
      <div className="bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-3">
        <h2 className="text-xl font-bold font-display text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Users className="text-indigo-600 dark:text-sky-400" size={24} />
          Sistem Üyeleri ve Personel Yönetimi
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-350">
          Uygulama genelinde oturum açabilecek kullanıcıları tanımlayabilir, şifre belirleyebilir ve ilgili personel adlarını atayabilirsiniz. Personeller sisteme girdiklerinde <strong>yalnızca kendi adlarına atanmış işleri</strong> (müşteri ve sevkiyatları) görebilecektir.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create / Edit Member Form */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 p-5 rounded-2xl shadow-md h-fit">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base font-display flex items-center gap-2 mb-4 border-b border-slate-50 dark:border-slate-850 pb-2">
            <UserPlus size={18} className="text-indigo-550" />
            {editingUserId ? 'Üye Yetki & Bilgi Düzenle' : 'Yeni Üye Oluştur'}
          </h3>

          {error && (
            <div className="p-3 mb-4 bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900 dark:text-rose-400 text-xs rounded-xl flex items-center gap-2">
              <ShieldAlert size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-blue-955 dark:text-white mb-1">Kullanıcı Adı</label>
              <input 
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Örn: asli.demir"
                className="w-full bg-white dark:bg-slate-900 border-2 border-blue-600 dark:border-blue-400 text-blue-955 font-extrabold placeholder-blue-400 dark:text-white rounded-lg p-2.5 text-xs sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-blue-955 dark:text-white mb-1">Giriş Parolası</label>
              <input 
                type="text"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Şifre belirleyin"
                className="w-full bg-white dark:bg-slate-900 border-2 border-blue-600 dark:border-blue-400 text-blue-955 font-extrabold placeholder-blue-400 dark:text-white rounded-lg p-2.5 text-xs sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-blue-955 dark:text-white mb-1">Personel Temsilci Adı (Soyadı ile)</label>
              <input 
                type="text"
                value={personnelName}
                onChange={e => setPersonnelName(e.target.value)}
                placeholder="Örn: Aslı Demir"
                className="w-full bg-white dark:bg-slate-900 border-2 border-blue-600 dark:border-blue-400 text-blue-955 font-extrabold placeholder-blue-400 dark:text-white rounded-lg p-2.5 text-xs sm:text-sm"
                required
              />
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1">İşlerin filtrelenebilmesi için CRM veya Sevkiyattaki isimle birebir uyuşmalıdır.</span>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-blue-955 dark:text-white mb-1">ERP Yetki & Erişim Rolü</label>
              <select 
                value={role}
                onChange={e => setRole(e.target.value as UserRole)}
                className="w-full bg-white dark:bg-slate-900 border-2 border-blue-600 dark:border-blue-400 text-blue-955 font-extrabold dark:text-white rounded-lg p-2.5 text-xs sm:text-sm"
              >
                <option value="admin" className="text-blue-955 bg-white dark:bg-slate-900 dark:text-white font-extrabold">Yönetici / Admin</option>
                <option value="logistics_manager" className="text-blue-955 bg-white dark:bg-slate-900 dark:text-white font-extrabold">Operasyon Amiri (Logistics Manager)</option>
                <option value="customer_rep" className="text-blue-955 bg-white dark:bg-slate-900 dark:text-white font-extrabold">Müşteri Temsilcisi (Customer Rep)</option>
                <option value="support" className="text-blue-955 bg-white dark:bg-slate-900 dark:text-white font-extrabold">Saha Elemanı (Support Agent)</option>
              </select>
            </div>

            <div className="flex gap-2">
              {editingUserId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-755 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs sm:text-sm transition cursor-pointer"
                >
                  İptal
                </button>
              )}
              <button
                type="submit"
                className="flex-3 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs sm:text-sm transition shadow-md shadow-indigo-100 dark:shadow-none cursor-pointer"
              >
                {editingUserId ? 'Değişiklikleri Kaydet' : 'Üyeyi Kaydet & Yetkilendir'}
              </button>
            </div>
          </form>
        </div>

        {/* Members List Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 p-5 rounded-2xl shadow-md">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base font-display flex items-center gap-2 mb-4 border-b border-slate-50 dark:border-slate-850 pb-2">
            <Key size={18} className="text-indigo-550" />
            Kayıtlı Sistem Personelleri ({users.length})
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase font-mono">
                  <th className="pb-3 px-2">Kullanıcı Adı</th>
                  <th className="pb-3 px-2">Parola</th>
                  <th className="pb-3 px-2">Personel Adı Soyadı</th>
                  <th className="pb-3 px-2">Erişim Rolü</th>
                  <th className="pb-3 px-2 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60 dark:divide-slate-850/60">
                {users.map((u) => (
                  <tr key={u.id} className={`text-xs hover:bg-slate-50/50 dark:hover:bg-slate-850/10 ${editingUserId === u.id ? 'bg-indigo-50/40 dark:bg-indigo-950/20 font-semibold' : ''}`}>
                    <td className="py-3 px-2 font-mono font-bold text-indigo-605 dark:text-sky-400">
                      {u.username}
                    </td>
                    <td className="py-3 px-2 text-slate-500 dark:text-slate-400 font-mono">
                      {u.password || "••••••"}
                    </td>
                    <td className="py-3 px-2 font-semibold text-slate-800 dark:text-slate-200">
                      {u.personnelName}
                    </td>
                    <td className="py-3 px-2">
                      <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded-md uppercase font-mono ${
                        u.role === 'admin' ? 'bg-rose-50 text-rose-750 dark:bg-rose-950/40 dark:text-rose-300' :
                        u.role === 'logistics_manager' ? 'bg-violet-50 text-violet-750 dark:bg-violet-950/40 dark:text-violet-300' :
                        u.role === 'customer_rep' ? 'bg-emerald-50 text-emerald-750 dark:bg-emerald-950/40 dark:text-emerald-300' :
                        'bg-blue-50 text-blue-750 dark:bg-blue-950/40 dark:text-blue-300'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <div className="flex justify-end gap-2 items-center">
                        <button
                          onClick={() => handleEditClick(u)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition"
                          title="Düzenle & Yetkilendir"
                        >
                          <Edit size={14} />
                        </button>
                        {u.username === 'admin' ? (
                          <span className="text-[10px] text-slate-400 italic">Sistem Amiri Pasif</span>
                        ) : (
                          <button
                            onClick={() => onDeleteUser(u.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg cursor-pointer transition"
                            title="Üyeyi Sil"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
