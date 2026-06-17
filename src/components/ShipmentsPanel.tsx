/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Search, 
  Truck, 
  Plus, 
  MapPin, 
  Calendar, 
  Weight, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  X,
  UserCheck,
  Briefcase,
  Map as MapIcon,
  List as ListIcon,
  Trash2
} from 'lucide-react';
import { Shipment, Customer, UserRole, SystemUser } from '../types';
import LiveTrackingMap from './LiveTrackingMap';
import { TURKEY_PROVINCES, PROVINCE_LIST } from '../data/turkeyData';

interface ShipmentsPanelProps {
  t: any;
  shipments: Shipment[];
  customers: Customer[];
  userRole: UserRole;
  theme: 'light' | 'dark';
  loggedInUser?: SystemUser | null;
  onAddShipment: (shipment: Shipment) => void;
  onUpdateShipment: (shipment: Shipment) => void;
  onDeleteShipment?: (shipmentId: string) => void;
}

export default function ShipmentsPanel({
  t,
  shipments,
  customers,
  userRole,
  theme,
  loggedInUser,
  onAddShipment,
  onUpdateShipment,
  onDeleteShipment
}: ShipmentsPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  
  // Forms & Actions
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);
  const [deleteConfirmShipment, setDeleteConfirmShipment] = useState<Shipment | null>(null);

  // Error trigger alerts
  const [permissionMessage, setPermissionMessage] = useState<string | null>(null);

  // New Shipment Form states
  const [trackingNumber, setTrackingNumber] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  
  // Province and District dropdown selections
  const [originProv, setOriginProv] = useState('İstanbul');
  const [originDist, setOriginDist] = useState('Kadıköy');
  const [destProv, setDestProv] = useState('Ankara');
  const [destDist, setDestDist] = useState('Çankaya');

  const [status, setStatus] = useState<'preparing' | 'transit' | 'delivered' | 'cancelled'>('preparing');
  const [carrier, setCarrier] = useState('');
  const [cargoType, setCargoType] = useState('');
  const [weight, setWeight] = useState(1000);
  const [purchasePrice, setPurchasePrice] = useState<number | ''>('');
  const [salePrice, setSalePrice] = useState<number | ''>('');
  const [departureDate, setDepartureDate] = useState('2026-06-12');
  const [estimatedArrival, setEstimatedArrival] = useState('2026-06-18');

  // Role modification permission check
  // Tüm kayıtlı personel rolleri (Yönetici, Operasyon Amiri, Müşteri Temsilcisi ve Saha Elemanı) sevkiyat ekleyebilir ve düzenleyebilir.
  const canModifyShipments = () => {
    return true;
  };

  const canDeleteShipments = () => {
    return userRole === 'admin' || userRole === 'logistics_manager';
  };

  const handleOpenDeleteConfirm = (shipment: Shipment) => {
    if (!canDeleteShipments()) {
      setPermissionMessage("Yetki Engeli: Sadece Lojistik Müdürü (logistics_manager) ve Sistem Yöneticisi (admin) sevkiyat silebilir.");
      setTimeout(() => setPermissionMessage(null), 5000);
      return;
    }
    setDeleteConfirmShipment(shipment);
  };

  const handleOpenAddForm = () => {
    if (!canModifyShipments()) {
      setPermissionMessage("Erişim Engeli: Yetkiniz bulunmuyor.");
      setTimeout(() => setPermissionMessage(null), 5000);
      return;
    }
    if (customers.length === 0) {
      setPermissionMessage("Sevkiyat ekleyebilmek için sistemde en az 1 kayıtlı müşteri bulunmalıdır. Lütfen öncelikle 'Müşteri Listesi (CRM)' sekmesinden yeni bir müşteri/şirket kaydı oluşturun.");
      setTimeout(() => setPermissionMessage(null), 7000);
      return;
    }
    setEditingShipment(null);
    setTrackingNumber(`TRK-${Math.floor(1000000 + Math.random() * 9000000)}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`);
    setCustomerId(customers[0]?.id || 'cust-1');
    setOrigin('');
    setDestination('');
    setOriginProv('İstanbul');
    setOriginDist('Kadıköy');
    setDestProv('Ankara');
    setDestDist('Çankaya');
    setStatus('preparing');
    setCarrier('Hepsijet');
    setCargoType('Elektronik Eşya');
    setWeight(1500);
    setPurchasePrice('');
    setSalePrice('');
    setDepartureDate(new Date().toISOString().split('T')[0]);
    setEstimatedArrival(new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (shipment: Shipment) => {
    if (!canModifyShipments()) {
      setPermissionMessage("Yetki Engeli: Müşteri temsilcileri sevkiyat kaydı değiştiremez!");
      setTimeout(() => setPermissionMessage(null), 5000);
      return;
    }
    setEditingShipment(shipment);
    setTrackingNumber(shipment.trackingNumber);
    setCustomerId(shipment.customerId);
    setOrigin(shipment.origin);
    setDestination(shipment.destination);

    // Dynamic extraction of Province, District values
    const [origP, origD] = shipment.origin.includes(', ') ? shipment.origin.split(', ') : [shipment.origin, ''];
    setOriginProv(origP || 'İstanbul');
    setOriginDist(origD || 'Kadıköy');

    const [dstP, dstD] = shipment.destination.includes(', ') ? shipment.destination.split(', ') : [shipment.destination, ''];
    setDestProv(dstP || 'Ankara');
    setDestDist(dstD || 'Çankaya');

    setStatus(shipment.status);
    setCarrier(shipment.carrier);
    setCargoType(shipment.cargoType);
    setWeight(shipment.weight);
    setPurchasePrice(shipment.purchasePrice || '');
    setSalePrice(shipment.salePrice || '');
    setDepartureDate(shipment.departureDate);
    setEstimatedArrival(shipment.estimatedArrival);
    setIsFormOpen(true);
  };

  const handleSubmitShipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canModifyShipments()) return;

    const selectedCust = customers.find(c => c.id === customerId);

    const payload: Shipment = {
      id: editingShipment ? editingShipment.id : `sh-${Date.now()}`,
      trackingNumber,
      customerId,
      customerName: selectedCust ? selectedCust.company : "Bilinmeyen Müşteri",
      origin: `${originProv}, ${originDist}`,
      destination: `${destProv}, ${destDist}`,
      status,
      delayMinutes: editingShipment ? editingShipment.delayMinutes : 0,
      delayReason: editingShipment ? editingShipment.delayReason : "Yok",
      departureDate,
      estimatedArrival,
      carrier: carrier || "Yurtiçi Kargo",
      cargoType: cargoType || "Ticari Ürün",
      weight: Number(weight) || 1000,
      purchasePrice: purchasePrice === '' ? null as any : Number(purchasePrice),
      salePrice: salePrice === '' ? null as any : Number(salePrice),
      createdBy: (editingShipment && editingShipment.createdBy) ? editingShipment.createdBy : (loggedInUser ? loggedInUser.personnelName : 'Sistem')
    };

    if (editingShipment) {
      onUpdateShipment(payload);
    } else {
      onAddShipment(payload);
    }
    setIsFormOpen(false);
  };

  const updateStatusQuickly = (shipment: Shipment, newStatus: any) => {
    if (!canModifyShipments()) {
      setPermissionMessage("Engellendi: Yetkiniz bulunmuyor.");
      setTimeout(() => setPermissionMessage(null), 4000);
      return;
    }
    const updated: Shipment = {
      ...shipment,
      status: newStatus
    };
    onUpdateShipment(updated);
  };

  // Filter list
  const filtered = shipments.filter(s => {
    const term = searchQuery.toLowerCase();
    const matchTerm = s.trackingNumber.toLowerCase().includes(term) ||
                      s.origin.toLowerCase().includes(term) ||
                      s.destination.toLowerCase().includes(term) ||
                      s.customerName.toLowerCase().includes(term) ||
                      s.carrier.toLowerCase().includes(term);

    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchTerm && matchStatus;
  });

  return (
    <div className="space-y-6 fade-in" id="shipments-panel-container">
      
      {/* Upper bar controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" id="shipments-top-controls">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <h2 className="text-xl font-bold font-display text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Truck className="text-indigo-600 dark:text-sky-400 font-bold" size={24} />
            {t.shipments}
          </h2>

          <div className="inline-flex bg-slate-100 dark:bg-slate-805 p-1 rounded-xl border border-slate-200/20" id="shipments-view-toggle">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-sky-450 shadow-xs'
                  : 'text-slate-500 hover:text-slate-705 dark:text-slate-400'
              }`}
            >
              <ListIcon size={14} />
              <span>Liste Görünümü</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                viewMode === 'map'
                  ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-sky-450 shadow-xs'
                  : 'text-slate-500 hover:text-slate-705 dark:text-slate-400'
              }`}
            >
              <MapIcon size={14} />
              <span>Canlı Takip Haritası</span>
            </button>
          </div>
        </div>

        <button
          onClick={handleOpenAddForm}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 dark:bg-sky-500 dark:hover:bg-sky-600 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer"
          id="btn-add-shipment"
        >
          <Plus size={16} />
          {t.addNewShipment}
        </button>
      </div>

      {/* Role limitations feedback */}
      {permissionMessage && (
        <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 p-4 rounded-xl flex items-start gap-2 text-rose-900 dark:text-rose-300" id="shipment-permission-alert">
          <AlertTriangle className="text-rose-600 dark:text-rose-400 mt-0.5 shrink-0" size={18} />
          <div className="text-xs sm:text-sm font-semibold">{permissionMessage}</div>
        </div>
      )}

      {/* NEW/EDIT SHIPMENT FORM */}
      {isFormOpen && (
        <div className="bg-slate-50 dark:bg-slate-950 border-4 border-blue-600 dark:border-blue-500 rounded-2xl p-6 shadow-2xl ring-4 ring-blue-100 dark:ring-blue-950/40 max-w-2xl" id="shipment-form-card">
          <div className="flex justify-between items-center mb-5 border-b-2 border-blue-250 dark:border-blue-800 pb-3">
            <h3 className="font-extrabold text-blue-950 dark:text-white font-display text-base sm:text-lg uppercase tracking-wider">
              {editingShipment ? 'Sevkiyat Düzenle' : t.addNewShipment}
            </h3>
            <button 
              onClick={() => setIsFormOpen(false)}
              className="text-blue-600 hover:text-blue-955 dark:text-blue-300 dark:hover:text-white p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmitShipment} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-blue-950 dark:text-white mb-1">{t.trackingNumber} (Otomatik)</label>
              <input 
                type="text" 
                value={trackingNumber} 
                className="w-full bg-slate-200 dark:bg-slate-800 border-2 border-blue-500 rounded-lg p-2.5 text-xs sm:text-sm font-mono text-blue-955 font-extrabold dark:text-white"
                readOnly
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-blue-950 dark:text-white mb-1">Müşteri Şirketi</label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border-2 border-blue-600 dark:border-blue-400 text-blue-955 font-extrabold dark:text-white rounded-lg p-2.5 text-xs sm:text-sm"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id} className="text-blue-955 bg-white dark:bg-slate-900 dark:text-white font-extrabold">{c.company} ({c.name})</option>
                ))}
              </select>
            </div>

            {/* Çıkış Noktası (Marmara/Türkiye) */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-extrabold text-blue-955 dark:text-white mb-1">Çıkış İli</label>
                <select
                  value={originProv}
                  onChange={(e) => {
                    const p = e.target.value;
                    setOriginProv(p);
                    const dists = TURKEY_PROVINCES[p]?.districts || [];
                    setOriginDist(dists[0] || '');
                  }}
                  className="w-full bg-white dark:bg-slate-900 border-2 border-blue-600 dark:border-blue-400 text-blue-955 font-extrabold dark:text-white rounded-lg p-2.5 text-xs sm:text-sm"
                >
                  {PROVINCE_LIST.map((provName) => (
                    <option key={provName} value={provName} className="text-blue-955 bg-white dark:bg-slate-900 dark:text-white font-extrabold">{provName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-extrabold text-blue-955 dark:text-white mb-1">Çıkış İlçesi</label>
                <select
                  value={originDist}
                  onChange={(e) => setOriginDist(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border-2 border-blue-600 dark:border-blue-400 text-blue-955 font-extrabold dark:text-white rounded-lg p-2.5 text-xs sm:text-sm"
                >
                  {(TURKEY_PROVINCES[originProv]?.districts || []).map((distName) => (
                    <option key={distName} value={distName} className="text-blue-955 bg-white dark:bg-slate-900 dark:text-white font-extrabold">{distName}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Varış Noktası (Marmara/Türkiye) */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-extrabold text-blue-955 dark:text-white mb-1">Varış İli</label>
                <select
                  value={destProv}
                  onChange={(e) => {
                    const p = e.target.value;
                    setDestProv(p);
                    const dists = TURKEY_PROVINCES[p]?.districts || [];
                    setDestDist(dists[0] || '');
                  }}
                  className="w-full bg-white dark:bg-slate-900 border-2 border-blue-600 dark:border-blue-400 text-blue-955 font-extrabold dark:text-white rounded-lg p-2.5 text-xs sm:text-sm"
                >
                  {PROVINCE_LIST.map((provName) => (
                    <option key={provName} value={provName} className="text-blue-955 bg-white dark:bg-slate-900 dark:text-white font-extrabold">{provName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-extrabold text-blue-955 dark:text-white mb-1">Varış İlçesi</label>
                <select
                  value={destDist}
                  onChange={(e) => setDestDist(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border-2 border-blue-600 dark:border-blue-400 text-blue-955 font-extrabold dark:text-white rounded-lg p-2.5 text-xs sm:text-sm"
                >
                  {(TURKEY_PROVINCES[destProv]?.districts || []).map((distName) => (
                    <option key={distName} value={distName} className="text-blue-955 bg-white dark:bg-slate-900 dark:text-white font-extrabold">{distName}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-blue-955 dark:text-white mb-1">{t.carrier}</label>
              <input 
                type="text" 
                value={carrier} 
                onChange={(e) => setCarrier(e.target.value)}
                placeholder="Örn: DHL Global, Maersk"
                className="w-full bg-white dark:bg-slate-900 border-2 border-blue-600 dark:border-blue-400 text-blue-955 font-extrabold placeholder-blue-400 dark:text-white rounded-lg p-2.5 text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-blue-955 dark:text-white mb-1">{t.cargoType}</label>
              <input 
                type="text" 
                value={cargoType} 
                onChange={(e) => setCargoType(e.target.value)}
                placeholder="Örn: Makine Parçası, Kimyasal"
                className="w-full bg-white dark:bg-slate-900 border-2 border-blue-600 dark:border-blue-400 text-blue-955 font-extrabold placeholder-blue-400 dark:text-white rounded-lg p-2.5 text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-blue-955 dark:text-white mb-1">{t.weight} (kg)</label>
              <input 
                type="number" 
                value={weight} 
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full bg-white dark:bg-slate-900 border-2 border-blue-600 dark:border-blue-400 text-blue-955 font-extrabold dark:text-white rounded-lg p-2.5 text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-blue-955 dark:text-white mb-1">Alış Fiyatı (₺)</label>
              <input 
                type="number" 
                value={purchasePrice} 
                onChange={(e) => setPurchasePrice(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Örn: 1500"
                className="w-full bg-white dark:bg-slate-900 border-2 border-blue-600 dark:border-blue-400 text-blue-955 font-extrabold dark:text-white rounded-lg p-2.5 text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-blue-955 dark:text-white mb-1">Satış Fiyatı (₺)</label>
              <input 
                type="number" 
                value={salePrice} 
                onChange={(e) => setSalePrice(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Örn: 2000"
                className="w-full bg-white dark:bg-slate-900 border-2 border-blue-600 dark:border-blue-400 text-blue-955 font-extrabold dark:text-white rounded-lg p-2.5 text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-blue-955 dark:text-white mb-1">{t.status}</label>
              <select
                value={status}
                onChange={(e: any) => setStatus(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border-2 border-blue-600 dark:border-blue-400 text-blue-955 font-extrabold dark:text-white rounded-lg p-2.5 text-xs sm:text-sm"
              >
                <option value="preparing" className="text-blue-955 bg-white dark:bg-slate-900 dark:text-white font-extrabold">{t.preparing}</option>
                <option value="transit" className="text-blue-955 bg-white dark:bg-slate-900 dark:text-white font-extrabold">{t.transit}</option>
                <option value="delivered" className="text-blue-955 bg-white dark:bg-slate-900 dark:text-white font-extrabold">{t.delivered}</option>
                <option value="cancelled" className="text-blue-955 bg-white dark:bg-slate-900 dark:text-white font-extrabold">{t.cancelled}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-blue-955 dark:text-white mb-1">{t.departure}</label>
              <input 
                type="date" 
                value={departureDate} 
                onChange={(e) => setDepartureDate(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border-2 border-blue-600 dark:border-blue-400 text-blue-955 font-extrabold dark:text-white rounded-lg p-2.5 text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-blue-955 dark:text-white mb-1">{t.estArrival}</label>
              <input 
                type="date" 
                value={estimatedArrival} 
                onChange={(e) => setEstimatedArrival(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border-2 border-blue-600 dark:border-blue-400 text-blue-955 font-extrabold dark:text-white rounded-lg p-2.5 text-xs sm:text-sm"
              />
            </div>

            <div className="sm:col-span-2 flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs sm:text-sm font-extrabold transition hover:bg-slate-300 dark:hover:bg-slate-700 cursor-pointer border-2 border-slate-400 dark:border-slate-600"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs sm:text-sm font-extrabold transition shadow-md hover:shadow-lg cursor-pointer border-2 border-blue-900 dark:border-blue-500"
              >
                {t.save}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL OVERLAY */}
      {deleteConfirmShipment && (
        <div className="fixed inset-0 bg-slate-950/40 dark:bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="delete-confirmation-overlay">
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl max-w-sm w-full space-y-4" id="delete-confirm-card">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="p-3 bg-rose-50 dark:bg-rose-950/20 rounded-xl">
                <AlertTriangle size={24} />
              </div>
              <h3 className="font-bold text-base sm:text-lg font-display">
                Sevkiyatı Arşivden Sil
              </h3>
            </div>
            
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-350 leading-relaxed">
              #{deleteConfirmShipment.trackingNumber} numaralı sevkiyat kaydı sistemden kalıcı olarak kaldırılacaktır. Bu işlem geri alınamaz.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmShipment(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-705 dark:text-slate-200 rounded-xl text-xs sm:text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                onClick={() => {
                  if (onDeleteShipment) {
                    onDeleteShipment(deleteConfirmShipment.id);
                  }
                  setDeleteConfirmShipment(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 size={14} />
                Silmeyi Onayla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Options */}
      <div className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row gap-4 justify-between" id="shipment-filter-row">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={17} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchShipment}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl outline-hidden focus:border-indigo-500 dark:focus:border-sky-500 text-slate-800 dark:text-slate-100"
          />
        </div>

        <div className="flex flex-wrap gap-2" id="shipment-status-pills">
          {['all', 'preparing', 'transit', 'delivered', 'cancelled'].map((stKey) => (
            <button
              key={stKey}
              onClick={() => setStatusFilter(stKey)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition cursor-pointer ${
                statusFilter === stKey
                  ? 'bg-indigo-600 text-white dark:bg-sky-500'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800/80 dark:hover:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {stKey === 'all' ? 'Tümü' : t[stKey] || stKey}
            </button>
          ))}
        </div>
      </div>

      {/* Shipment Records / Live Map view toggle */}
      {viewMode === 'map' ? (
        <LiveTrackingMap t={t} shipments={filtered} theme={theme} />
      ) : (
        <div className="bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs" id="shipments-table-wrapper font">
        
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto" id="shipments-desktop-table">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider font-mono">
                <th className="py-3 px-4">{t.trackingNumber}</th>
                <th className="py-3 px-4">Yük Sahibi</th>
                <th className="py-3 px-4">Rota Detayı</th>
                <th className="py-3 px-4">Kargo & Taşıyıcı</th>
                <th className="py-3 px-4">Zaman Tablosu</th>
                <th className="py-3 px-4">Durum</th>
                <th className="py-3 px-4 text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30 transition">
                  <td className="py-4 px-4 font-mono text-xs font-bold text-indigo-700 dark:text-sky-300">
                    {s.trackingNumber}
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block max-w-[170px] truncate" title={s.customerName}>
                      {s.customerName}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-xs text-slate-700 dark:text-slate-350 space-y-0.5">
                    <div className="flex items-center gap-1"><MapPin size={11} className="text-indigo-500" /> {s.origin}</div>
                    <div className="flex items-center gap-1"><MapPin size={11} className="text-emerald-500" /> {s.destination}</div>
                  </td>
                  <td className="p-3">
                    <div className="font-extrabold text-blue-955 dark:text-slate-200 text-xs sm:text-sm">{s.cargoType}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{s.carrier} | {s.weight.toLocaleString()} kg</div>
                    {(s.purchasePrice != null || s.salePrice != null) && (
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {s.purchasePrice != null && <span>Alış: {s.purchasePrice}₺</span>}
                        {s.purchasePrice != null && s.salePrice != null && <span> | </span>}
                        {s.salePrice != null && <span>Satış: {s.salePrice}₺</span>}
                        {s.purchasePrice != null && s.salePrice != null && (
                          <span className="font-bold text-green-600 ml-1">
                            ({s.salePrice - s.purchasePrice}₺ Kâr)
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4 text-[11px] text-slate-600 dark:text-slate-400 font-mono space-y-0.5">
                    <div>Sevk: {s.departureDate}</div>
                    <div>Varış: {s.estimatedArrival}</div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold font-mono rounded-md uppercase ${
                      s.status === 'preparing' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300' :
                      s.status === 'transit' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' :
                      s.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-350' :
                      'bg-slate-100 text-slate-600 dark:bg-slate-850 dark:text-slate-400'
                    }`}>
                      {t[s.status] || s.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => handleOpenEdit(s)}
                        className="p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        Düzenle
                      </button>
                      <button 
                        onClick={() => handleOpenDeleteConfirm(s)}
                        className="p-1 text-rose-600 hover:bg-rose-5/10 dark:hover:bg-rose-950/15 text-rose-700 dark:text-rose-400 rounded-lg text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                        title="Sevkiyatı Sil"
                      >
                        <Trash2 size={12} />
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile List View */}
        <div className="block lg:hidden divide-y divide-slate-100 dark:divide-slate-800" id="shipments-mobile-list">
          {filtered.map((s) => (
            <div key={s.id} className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-mono font-black text-indigo-700 dark:text-sky-300 block">#{s.trackingNumber}</span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">{s.customerName}</span>
                </div>
                <span className={`inline-flex px-2 py-0.5 text-[9px] font-bold rounded-md uppercase ${
                  s.status === 'preparing' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40' :
                  s.status === 'transit' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40' :
                  s.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 theme-green' :
                  'bg-slate-100 text-slate-600 dark:bg-slate-850'
                }`}>
                  {t[s.status] || s.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500 block">Yük / Ağırlık</span>
                  {s.cargoType} ({s.weight} kg)
                  {(s.purchasePrice != null || s.salePrice != null) && (
                    <div className="text-[10px] mt-1">
                      {s.purchasePrice != null && <span>A: {s.purchasePrice}₺</span>}
                      {s.purchasePrice != null && s.salePrice != null && <span> | </span>}
                      {s.salePrice != null && <span>S: {s.salePrice}₺</span>}
                      {s.purchasePrice != null && s.salePrice != null && (
                        <span className="font-bold text-green-600 ml-1">
                          (Kâr: {s.salePrice - s.purchasePrice}₺)
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500 block">Hizmet Alan</span>
                  {s.carrier}
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500 block">Rota</span>
                  {s.origin} &rarr; {s.destination}
                </div>
              </div>

              <div className="flex items-center gap-2 justify-end pt-2 border-t border-slate-50 dark:border-slate-800/80">
                <button
                  onClick={() => handleOpenEdit(s)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-705 dark:text-slate-300 rounded-lg text-xs cursor-pointer"
                >
                  Düzenle
                </button>
                <button
                  onClick={() => handleOpenDeleteConfirm(s)}
                  className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/25 text-rose-700 dark:text-rose-400 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 size={12} />
                  Sil
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-10 text-slate-450 text-xs">
              Sevkiyat kaydı bulunamadı.
            </div>
          )}
        </div>

      </div>
      )}

    </div>
  );
}
