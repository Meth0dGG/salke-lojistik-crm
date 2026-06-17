/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Customer {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  taxNumber: string;
  taxOffice: string;
  type: "gonderici" | "alici" | "tedarikci" | "hem_gonderici_hem_alici";
  balance: number;
  currency: "TRY" | "EUR" | "USD";
}

export interface Offer {
  id: string;
  customerId: string;
  customerName: string;
  origin: string;
  destination: string;
  transportType: "Kara" | "Deniz" | "Hava" | "Demiryolu";
  cargoType: "FTL" | "LTL" | "FCL" | "LCL";
  freightAmount: number;
  currency: "EUR" | "USD" | "TRY";
  validUntil: string;
  status: "Beklemede" | "Onaylandi" | "Reddedildi";
  createdAt: string;
}

export interface Shipment {
  id: string;
  offerId: string;
  customerId: string;
  customerName: string;
  origin: string;
  destination: string;
  cargoType: "FTL" | "LTL" | "FCL" | "LCL";
  cargoDetails: string;
  weight: number; // kg
  volume: number; // m3
  packagesCount: number;
  plate: string;
  driverId: string;
  driverName: string;
  deliveryStatus: "Taslak" | "Yuklendi" | "Yolda" | "Gümrükte" | "Teslim Edildi";
  notes?: string;
  expenses: Expense[];
  revenue: number;
  currency: "EUR" | "USD" | "TRY";
}

export interface Expense {
  id: string;
  type: "Yakit" | "Otoban/HGS" | "Harciirah" | "Gumruk" | "Demuraj" | "Diger";
  amount: number;
  currency: "EUR" | "USD" | "TRY";
  description: string;
}

export interface Vehicle {
  id: string;
  plate: string;
  brandModel: string;
  type: "Tir" | "Kamyon" | "Panelvan" | "Konteyner tasiyici";
  status: "Musait" | "Seferde" | "Bakimda";
  inspectionDate: string;
}

export interface Driver {
  id: string;
  fullName: string;
  idNumber: string; // TC No
  phone: string;
  licenseClass: string;
  status: "Musait" | "Seferde" | "Izinli";
}

export interface TableSchema {
  tableName: string;
  description: string;
  columns: {
    name: string;
    type: string;
    constraints?: string;
    description: string;
  }[];
}
