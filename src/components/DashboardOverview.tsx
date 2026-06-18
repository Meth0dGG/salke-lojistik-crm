/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  TrendingUp, 
  Users, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  Play, 
  Truck, 
  RefreshCw, 
  ArrowRight,
  Package,
  Globe,
  Database,
  DollarSign,
  TrendingUp as TrendingUpIcon
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Cell
} from 'recharts';
import { Customer, Shipment, Notification, AuditLog } from '../types';

interface DashboardOverviewProps {
  t: any;
  shipments: Shipment[];
  customers: Customer[];
  notifications: Notification[];
  onNavigate: (module: string) => void;
}

export default function DashboardOverview({
  t,
  shipments,
  customers,
  notifications,
  onNavigate
}: DashboardOverviewProps) {
  
  // Calculate analytics metrics
  const totalShipments = shipments.length;
  const activeCustomers = customers.filter(c => c.status !== 'inactive').length;

  const todayStr = new Date().toISOString().split('T')[0];
  const thisMonthStr = todayStr.substring(0, 7);

  let dailyProfit = 0;
  let monthlyProfit = 0;

  const normalizeDateStr = (dateStr: string) => {
    if (!dateStr) return '';
    if (dateStr.includes('.')) {
      const parts = dateStr.split('.');
      if (parts.length === 3) return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    return dateStr;
  };

  shipments.forEach(s => {
    if (s.purchasePrice != null && s.salePrice != null) {
      const profit = Number(s.salePrice) - Number(s.purchasePrice);
      if (profit > 0) {
        const normDate = normalizeDateStr(s.departureDate);
        if (normDate === todayStr) {
          dailyProfit += profit;
        }
        if (normDate.startsWith(thisMonthStr)) {
          monthlyProfit += profit;
        }
      }
    }
  });

  // Render mock data for Monthly Performance (Recharts)
  const chartData = [
    { name: 'Ocak/Jan', tamamlanan: 98, hacim: 240 },
    { name: 'Şubat/Feb', tamamlanan: 110, hacim: 280 },
    { name: 'Mart/Mar', tamamlanan: 135, hacim: 320 },
    { name: 'Nisan/Apr', tamamlanan: 142, hacim: 310 },
    { name: 'Mayıs/May', tamamlanan: 165, hacim: 380 },
    { name: 'Haziran/Jun', tamamlanan: 180, hacim: 410 }, // Current month
  ];

  // Cargo distributions count
  const cargoTypes = shipments.reduce((acc: { [key: string]: number }, cur) => {
    acc[cur.cargoType] = (acc[cur.cargoType] || 0) + 1;
    return acc;
  }, {});

  const cargoChartData = Object.keys(cargoTypes).map((key) => ({
    name: key.length > 15 ? key.substring(0, 15) + '...' : key,
    deger: cargoTypes[key]
  }));  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-6 fade-in" id="dashboard-overview-container">

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4" id="kpi-grid">
        
        {/* KPI 1: Shipments */}
        <div 
          onClick={() => onNavigate('shipments')}
          className="bg-white dark:bg-slate-900/60 dark:border-slate-800 border border-slate-100 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer group"
          id="kpi-shipments"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-mono tracking-wider uppercase">
              {t.totalShipments}
            </span>
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
              <Truck size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-display text-slate-900 dark:text-slate-100">
              {totalShipments}
            </span>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
              <TrendingUp size={12} />
              +14%
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <span>{t.shipments} modülüne git</span>
            <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
          </p>
        </div>

        {/* KPI 2: Active Customers */}
        <div 
          onClick={() => onNavigate('crm')}
          className="bg-white dark:bg-slate-900/60 dark:border-slate-800 border border-slate-100 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer group"
          id="kpi-customers"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-mono tracking-wider uppercase">
              {t.activeCustomers}
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <Users size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-display text-slate-900 dark:text-slate-100">
              {activeCustomers}
            </span>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
              <TrendingUp size={12} />
              +8%
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <span>{t.crm} modülüne git</span>
            <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
          </p>
        </div>

        {/* KPI 3: Enterprise Guard Status */}
        <div 
          onClick={() => onNavigate('cloudBackup')}
          className="bg-white dark:bg-slate-900/60 dark:border-slate-800 border border-slate-100 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer group"
          id="kpi-backup-shield"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-mono tracking-wider uppercase">
              {t.backupStatus}
            </span>
            <div className="p-2.5 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 group-hover:scale-110 transition-transform">
              <ShieldCheck size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-display text-emerald-600 dark:text-emerald-400">
              MÜHÜRLÜ
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <span>AES-256 Korumalı Bulut</span>
          </p>
        </div>

        {/* KPI 4: Daily Profit */}
        <div 
          className="bg-white dark:bg-slate-900/60 dark:border-slate-800 border border-slate-100 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all cursor-default group"
          id="kpi-daily-profit"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-mono tracking-wider uppercase">
              Günlük Kâr
            </span>
            <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">
              {dailyProfit.toLocaleString('tr-TR')} ₺
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <span>Bugün (Sevk Edilenler)</span>
          </p>
        </div>

        {/* KPI 5: Monthly Profit */}
        <div 
          className="bg-white dark:bg-slate-900/60 dark:border-slate-800 border border-slate-100 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all cursor-default group"
          id="kpi-monthly-profit"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-mono tracking-wider uppercase">
              Aylık Kâr
            </span>
            <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform">
              <TrendingUpIcon size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">
              {monthlyProfit.toLocaleString('tr-TR')} ₺
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <span>Bu Ay İçerisindeki Toplam</span>
          </p>
        </div>
      </div>

      {/* Grid of analytical charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="dashboard-plots-grid">
        
        {/* Chart 1: Monthly Performance (Recharts) */}
        <div className="bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 font-display">
                {t.monthlyPerformance}
              </h3>
              <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                6 Aylık Özet
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tamamlanan sevkiyat hacimleri
            </p>
          </div>

          <div className="h-[260px] w-full" id="area-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTamamlanan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                    borderRadius: '8px', 
                    borderColor: '#334155',
                    color: '#f8fafc'
                  }} 
                />
                <Area type="monotone" dataKey="tamamlanan" name="Başarılı Sevk" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTamamlanan)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Cargo Distribution */}
        <div className="bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 font-display">
              {t.cargoDist}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Mevcut sevkiyat tiplerinin sayısal dağılımı
            </p>
          </div>
          
          {cargoChartData.length > 0 ? (
            <div className="h-[260px] w-full" id="bar-chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cargoChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                      borderRadius: '6px', 
                      borderColor: '#334155',
                      color: '#f8fafc' 
                    }} 
                  />
                  <Bar dataKey="deger" name="Sevkiyat Adedi" radius={[4, 4, 0, 0]}>
                    {cargoChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 text-sm">Gösterilecek kargo verisi bulunmuyor.</div>
          )}
        </div>

      </div>

    </div>
  );
}
