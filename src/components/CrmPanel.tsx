/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldAlert, 
  Edit3, 
  Trash2, 
  UserPlus, 
  Check, 
  X,
  UserCheck,
  Users
} from 'lucide-react';
import { Customer, UserRole, SystemUser } from '../types';

interface CrmPanelProps {
  t: any;
  customers: Customer[];
  userRole: UserRole;
  loggedInUser?: SystemUser | null;
  onAddCustomer: (customer: Customer) => void;
  onUpdateCustomer: (customer: Customer) => void;
  onDeleteCustomer: (id: string) => void;
}

export default function CrmPanel({
  t,
  customers,
  userRole,
  loggedInUser,
  onAddCustomer,
  onUpdateCustomer,
  onDeleteCustomer
}: CrmPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Modals / forms state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  
  // Notification alert state
  const [permissionError, setPermissionError] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'active' | 'lead' | 'vip' | 'inactive'>('active');
  const [representative, setRepresentative] = useState('');
  const [country, setCountry] = useState('');

  // Check mutation permission based on user roles
  // Tüm kullanıcılar kendisi firma ekleyebilir ve düzenleyebilir.
  const hasPermission = () => {
    return true;
  };

  const handleOpenAddForm = () => {
    if (!hasPermission()) {
      setPermissionError("Operasyon Yetki Engeli: Saha Temsilcisi (support) rolleri yeni müşteri ekleme yetkisine sahip değildir!");
      setTimeout(() => setPermissionError(null), 5000);
      return;
    }
    setEditingCustomer(null);
    setName('');
    setCompany('');
    setEmail('');
    setPhone('');
    setStatus('active');
    setRepresentative(loggedInUser && loggedInUser.role !== 'admin' ? loggedInUser.personnelName : 'Aslı Demir');
    setCountry('');
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (cust: Customer) => {
    if (!hasPermission()) {
      setPermissionError("Operasyon Yetki Engeli: Saha Temsilcisi (support) rolleri müşteri kayıtlarını düzenleme yetkisine sahip değildir!");
      setTimeout(() => setPermissionError(null), 5000);
      return;
    }
    setEditingCustomer(cust);
    setName(cust.name);
    setCompany(cust.company);
    setEmail(cust.email);
    setPhone(cust.phone);
    setStatus(cust.status);
    setRepresentative(cust.representative);
    setCountry(cust.country);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!hasPermission()) {
      setPermissionError("Silme Engeli: Saha Temsilcisi (support) rolleri veritabanı kayıtlarını silemez!");
      setTimeout(() => setPermissionError(null), 5000);
      return;
    }
    const confirmed = window.confirm("Bu müşteriyi sistemden silmek istediğinize emin misiniz? (Müşteri ilişkisi pasife çekilebilir)");
    if (confirmed) {
      onDeleteCustomer(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasPermission()) return;

    if (!name || !company || !email) {
      alert("Lütfen İsim, Şirket ve E-posta alanlarını doldurun!");
      return;
    }

    const payload: Customer = {
      id: editingCustomer ? editingCustomer.id : `cust-${Date.now()}`,
      name,
      company,
      email,
      phone,
      status,
      representative,
      country: country || "Türkiye"
    };

    if (editingCustomer) {
      onUpdateCustomer(payload);
    } else {
      onAddCustomer(payload);
    }
    setIsFormOpen(false);
  };

  // Filter logic
  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.country.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 fade-in" id="crm-panel-container">
      
      {/* Header operations */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" id="crm-header-controls">
        <h2 className="text-xl font-bold font-display text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Users className="text-indigo-600 dark:text-sky-400" size={24} />
          {t.crm}
        </h2>

        <button
          onClick={handleOpenAddForm}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 dark:bg-sky-500 dark:hover:bg-sky-600 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer"
          id="btn-add-customer"
        >
          <UserPlus size={16} />
          {t.addNewCustomer}
        </button>
      </div>

      {/* Permission warning overlay */}
      {permissionError && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 p-4 rounded-xl flex items-start gap-2 text-amber-900 dark:text-amber-300 stroke-amber-600" id="crm-permission-banner">
          <ShieldAlert className="shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" size={18} />
          <div className="text-xs sm:text-sm font-medium">{permissionError}</div>
        </div>
      )}

      {/* Interactive Form Drawer/Card */}
      {isFormOpen && (
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-lg max-w-2xl" id="crm-form-card">
          <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 font-display">
              {editingCustomer ? t.editCustomer : t.addNewCustomer}
            </h3>
            <button 
              onClick={() => setIsFormOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-blue-955 dark:text-white mb-1">Yetkili İsim / Soyisim</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                placeholder="Örn: Arda Şen"
                className="w-full bg-white dark:bg-slate-900 border-2 border-blue-600 dark:border-blue-400 text-blue-955 font-extrabold placeholder-blue-400 dark:text-white rounded-lg p-2.5 text-xs sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-blue-955 dark:text-white mb-1">{t.companyName}</label>
              <input 
                type="text" 
                value={company} 
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Örn: Vestel Dış Ticaret"
                className="w-full bg-white dark:bg-slate-900 border-2 border-blue-600 dark:border-blue-400 text-blue-955 font-extrabold placeholder-blue-400 dark:text-white rounded-lg p-2.5 text-xs sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-blue-955 dark:text-white mb-1">{t.email}</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@sirket.com"
                className="w-full bg-white dark:bg-slate-900 border-2 border-blue-600 dark:border-blue-400 text-blue-955 font-extrabold placeholder-blue-400 dark:text-white rounded-lg p-2.5 text-xs sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-blue-955 dark:text-white mb-1">{t.phone}</label>
              <input 
                type="text" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+90 212 123 4567"
                className="w-full bg-white dark:bg-slate-900 border-2 border-blue-600 dark:border-blue-400 text-blue-955 font-extrabold placeholder-blue-400 dark:text-white rounded-lg p-2.5 text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-blue-955 dark:text-white mb-1">{t.country}</label>
              <input 
                type="text" 
                value={country} 
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Örn: Türkiye, İtalya"
                className="w-full bg-white dark:bg-slate-900 border-2 border-blue-600 dark:border-blue-400 text-blue-955 font-extrabold placeholder-blue-400 dark:text-white rounded-lg p-2.5 text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-blue-955 dark:text-white mb-1">{t.status}</label>
              <select 
                value={status} 
                onChange={(e: any) => setStatus(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border-2 border-blue-600 dark:border-blue-400 text-blue-955 font-extrabold dark:text-white rounded-lg p-2.5 text-xs sm:text-sm"
              >
                <option value="active" className="text-blue-955 bg-white dark:bg-slate-900 dark:text-white font-extrabold">{t.active}</option>
                <option value="lead" className="text-blue-955 bg-white dark:bg-slate-900 dark:text-white font-extrabold">{t.lead}</option>
                <option value="vip" className="text-blue-955 bg-white dark:bg-slate-900 dark:text-white font-extrabold">{t.vip}</option>
                <option value="inactive" className="text-blue-955 bg-white dark:bg-slate-900 dark:text-white font-extrabold">{t.inactive}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-blue-955 dark:text-white mb-1">Atanan Müşteri Temsilcisi</label>
              <input 
                type="text" 
                value={representative} 
                onChange={(e) => setRepresentative(e.target.value)}
                placeholder="Atanan temsilci"
                readOnly={!!(loggedInUser && loggedInUser.role !== 'admin')}
                className={`w-full border-2 rounded-lg p-2.5 text-xs sm:text-sm font-extrabold ${
                  loggedInUser && loggedInUser.role !== 'admin'
                    ? 'bg-slate-100 dark:bg-slate-800/80 border-slate-300 dark:border-slate-700 text-slate-500 cursor-not-allowed'
                    : 'bg-white dark:bg-slate-900 border-blue-600 dark:border-blue-400 text-blue-955 placeholder-blue-400 dark:text-white'
                }`}
              />
            </div>

            <div className="sm:col-span-2 flex justify-end gap-2.5 mt-4">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs sm:text-sm font-semibold transition"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition"
              >
                {t.save}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search & Filter section */}
      <div className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between" id="crm-filter-section">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchCustomer}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl outline-hidden focus:border-indigo-500 dark:focus:border-sky-500 text-slate-800 dark:text-slate-100"
          />
        </div>

        <div className="flex gap-2" id="crm-status-pills">
          {['all', 'active', 'lead', 'vip', 'inactive'].map((statusKey) => (
            <button
              key={statusKey}
              onClick={() => setStatusFilter(statusKey)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition cursor-pointer ${
                statusFilter === statusKey
                  ? 'bg-indigo-600 text-white dark:bg-sky-500'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800/80 dark:hover:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {statusKey === 'all' ? 'Tümü' : t[statusKey] || statusKey}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Desktop Table & Mobile List View */}
      <div className="bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs" id="crm-table-wrapper">
        
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto" id="customers-desktop-table">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider font-mono">
                <th className="py-3 px-5">{t.companyName}</th>
                <th className="py-3 px-5">Müşteri Sorumlusu</th>
                <th className="py-3 px-5">İletişim</th>
                <th className="py-3 px-5">{t.country}</th>
                <th className="py-3 px-5">{t.status}</th>
                <th className="py-3 px-5 text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCustomers.map((cust) => (
                <tr key={cust.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/25 transition">
                  <td className="py-4 px-5">
                    <div className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{cust.company}</div>
                    <div className="text-xs text-slate-400 dark:text-slate-500">Temsilci: {cust.representative}</div>
                  </td>
                  <td className="py-4 px-5 text-slate-700 dark:text-slate-300 text-sm font-medium">{cust.name}</td>
                  <td className="py-4 px-5 space-y-0.5 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1.5"><Mail size={12} /> {cust.email}</div>
                    {cust.phone && <div className="flex items-center gap-1.5"><Phone size={12} /> {cust.phone}</div>}
                  </td>
                  <td className="py-4 px-5">
                    <span className="inline-flex items-center gap-1 text-xs text-slate-700 dark:text-slate-300">
                      <MapPin size={12} className="text-rose-500" />
                      {cust.country}
                    </span>
                  </td>
                  <td className="py-4 px-5">
                    <span className={`inline-flex px-2 py-0.5 text-[10px] font-semibold font-mono rounded-full uppercase ${
                      cust.status === 'active' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' :
                      cust.status === 'vip' ? 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300' :
                      cust.status === 'lead' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' :
                      'bg-slate-100 text-slate-600 dark:bg-slate-850 dark:text-slate-400'
                    }`}>
                      {t[cust.status] || cust.status}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEditForm(cust)}
                        className="p-1 px-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 dark:hover:text-sky-400 rounded-lg transition text-xs flex items-center gap-1 cursor-pointer"
                        title={t.editCustomer}
                      >
                        <Edit3 size={12} /> {t.actions}
                      </button>
                      <button
                        onClick={() => handleDelete(cust.id)}
                        className="p-1 px-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition text-xs flex items-center gap-1 cursor-pointer"
                        title={t.deleteCustomer}
                      >
                        <Trash2 size={12} /> Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400 text-xs">
                    Arama kriterlerine uygun lojistik müşterisi bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Grid/List View */}
        <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800" id="customers-mobile-list">
          {filteredCustomers.map((cust) => (
            <div key={cust.id} className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{cust.company}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{cust.name} ({cust.representative})</p>
                </div>
                <span className={`px-2 py-0.5 text-[9px] font-semibold rounded-full uppercase ${
                  cust.status === 'active' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' :
                  cust.status === 'vip' ? 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300' :
                  cust.status === 'lead' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' :
                  'bg-slate-100 text-slate-600 dark:bg-slate-850 dark:text-slate-400'
                }`}>
                  {t[cust.status] || cust.status}
                </span>
              </div>

              <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1.5"><Mail size={12} /> {cust.email}</div>
                {cust.phone && <div className="flex items-center gap-1.5"><Phone size={12} /> {cust.phone}</div>}
                <div className="flex items-center gap-1.5"><MapPin size={12} className="text-rose-500" /> {cust.country}</div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-50 dark:border-slate-800/60 justify-end">
                <button
                  onClick={() => handleOpenEditForm(cust)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-105 hover:bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs"
                >
                  <Edit3 size={11} /> {t.actions}
                </button>
                <button
                  onClick={() => handleDelete(cust.id)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-lg text-xs"
                >
                  <Trash2 size={11} /> Sil
                </button>
              </div>
            </div>
          ))}

          {filteredCustomers.length === 0 && (
            <div className="text-center py-10 text-slate-400 text-xs">
              Müşteri bulunamadı.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
