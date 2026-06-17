/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: 'active' | 'lead' | 'vip' | 'inactive';
  representative: string;
  country: string;
}

export interface Shipment {
  id: string;
  trackingNumber: string;
  customerId: string;
  customerName: string;
  origin: string;
  destination: string;
  status: 'preparing' | 'transit' | 'delivered' | 'cancelled';
  delayMinutes: number;
  delayReason: string;
  departureDate: string;
  estimatedArrival: string;
  carrier: string;
  cargoType: string;
  weight: number; // kg
  purchasePrice?: number; // Alış fiyatı
  salePrice?: number; // Satış fiyatı
  createdBy?: string;
}

export interface Notification {
  id: string;
  type: 'delay' | 'backup' | 'security' | 'system' | 'feedback';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  ip: string;
  hash: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface Backup {
  id: string;
  timestamp: string;
  filename: string;
  size: string;
  type: 'auto' | 'manual';
  status: 'success' | 'failed';
  checksum: string;
}

export type UserRole = 'admin' | 'logistics_manager' | 'support' | 'customer_rep';

export interface SystemUser {
  id: string;
  username: string;
  password?: string;
  role: UserRole;
  personnelName: string;
}

export interface AppState {
  theme: 'light' | 'dark';
  language: 'tr' | 'en' | 'de';
  currentUserRole: UserRole;
  twoFactorEnabled: boolean;
  backups: Backup[];
  auditLogs: AuditLog[];
  notifications: Notification[];
  shipments: Shipment[];
  customers: Customer[];
  apiKeys: string[];
}
