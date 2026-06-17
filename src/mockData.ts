/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Customer, Shipment, Backup, AuditLog, Notification } from './types';

export const initialCustomers: Customer[] = [
  {
    id: "cust-1",
    name: "Murat Yılmaz",
    company: "Anadolu Global Ticaret A.Ş.",
    email: "m.yilmaz@anadoluticaret.com",
    phone: "+90 216 555 1234",
    status: "active",
    representative: "Aslı Demir",
    country: "Türkiye"
  },
  {
    id: "cust-2",
    name: "Cem Karaca",
    company: "Ege Otomotiv Yedek Parça Ltd.",
    email: "c.karaca@egeotomotiv.com",
    phone: "+90 232 444 5678",
    status: "vip",
    representative: "Caner Kaya",
    country: "Türkiye"
  },
  {
    id: "cust-3",
    name: "Ahmet Erdemir",
    company: "Karadeniz Çelik Endüstrisi A.Ş.",
    email: "a.erdemir@kardemir-celik.com",
    phone: "+90 372 316 9900",
    status: "lead",
    representative: "Aslı Demir",
    country: "Türkiye"
  },
  {
    id: "cust-4",
    name: "Fatma Şahin",
    company: "Güneydoğu Tarım Kooperatifi",
    email: "f.sahin@guneydogutarim.coop",
    phone: "+90 414 712 3456",
    status: "active",
    representative: "Deniz Yılmaz",
    country: "Türkiye"
  },
  {
    id: "cust-5",
    name: "Selin Akdeniz",
    company: "Akdeniz Narenciye Pazarlama",
    email: "s.akdeniz@akdeniznarenciye.com",
    phone: "+90 324 234 5050",
    status: "vip",
    representative: "Caner Kaya",
    country: "Türkiye"
  },
  {
    id: "cust-6",
    name: "Hakan Koç",
    company: "Marmara Lojistik Depolama",
    email: "h.koc@marmaradeopolama.com",
    phone: "+90 262 641 1200",
    status: "inactive",
    representative: "Deniz Yılmaz",
    country: "Türkiye"
  }
];

export const initialShipments: Shipment[] = [
  {
    id: "sh-101",
    trackingNumber: "TRK-3490812-A",
    customerId: "cust-2",
    customerName: "Ege Otomotiv Yedek Parça Ltd.",
    origin: "Kocaeli, Gebze",
    destination: "İzmir, Bornova",
    status: "transit",
    delayMinutes: 0,
    delayReason: "Yok",
    departureDate: "2026-06-10",
    estimatedArrival: "2026-06-13",
    carrier: "Horoz Lojistik",
    cargoType: "Otomotiv Yedek Parça",
    weight: 12450
  },
  {
    id: "sh-102",
    trackingNumber: "TRK-4412980-B",
    customerId: "cust-1",
    customerName: "Anadolu Global Ticaret A.Ş.",
    origin: "Gaziantep, Şehitkamil",
    destination: "İstanbul, Kadıköy",
    status: "transit",
    delayMinutes: 0,
    delayReason: "Yok",
    departureDate: "2026-06-11",
    estimatedArrival: "2026-06-13",
    carrier: "Yurtiçi Kargo",
    cargoType: "Tekstil ve Hazır Giyim",
    weight: 8600
  },
  {
    id: "sh-103",
    trackingNumber: "TRK-3788127-C",
    customerId: "cust-3",
    customerName: "Karadeniz Çelik Endüstrisi A.Ş.",
    origin: "Zonguldak, Ereğli",
    destination: "İstanbul, Ümraniye",
    status: "transit",
    delayMinutes: 0,
    delayReason: "Yok",
    departureDate: "2026-06-11",
    estimatedArrival: "2026-06-14",
    carrier: "Aras Lojistik",
    cargoType: "Demir Çelik Profili",
    weight: 14400
  },
  {
    id: "sh-104",
    trackingNumber: "TRK-6311290-D",
    customerId: "cust-4",
    customerName: "Güneydoğu Tarım Kooperatifi",
    origin: "Şanlıurfa, Siverek",
    destination: "Yalova, Merkez",
    status: "delivered",
    delayMinutes: 0,
    delayReason: "Yok",
    departureDate: "2026-06-09",
    estimatedArrival: "2026-06-11",
    carrier: "Ekol Lojistik",
    cargoType: "Tarımsal Gıda Maddeleri",
    weight: 6500
  },
  {
    id: "sh-105",
    trackingNumber: "TRK-0610298-E",
    customerId: "cust-1",
    customerName: "Anadolu Global Ticaret A.Ş.",
    origin: "Ankara, Kahramankazan",
    destination: "Mersin, Akdeniz",
    status: "preparing",
    delayMinutes: 0,
    delayReason: "Yok",
    departureDate: "2026-06-14",
    estimatedArrival: "2026-06-16",
    carrier: "Netlog Lojistik",
    cargoType: "Makine Teçhizat Parçaları",
    weight: 4200
  },
  {
    id: "sh-106",
    trackingNumber: "TRK-3329011-F",
    customerId: "cust-5",
    customerName: "Akdeniz Narenciye Pazarlama",
    origin: "Mersin, Tarsus",
    destination: "Bursa, İnegöl",
    status: "transit",
    delayMinutes: 0,
    delayReason: "Yok",
    departureDate: "2026-06-11",
    estimatedArrival: "2026-06-13",
    carrier: "Mars Logistics",
    cargoType: "Narenciye Kasaları",
    weight: 22000
  }
];

export const initialBackups: Backup[] = [
  {
    id: "back-1",
    timestamp: "2026-06-12 00:00:15",
    filename: "db_backup_20260612_0000.enc",
    size: "14.2 MB",
    type: "auto",
    status: "success",
    checksum: "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08"
  },
  {
    id: "back-2",
    timestamp: "2026-06-11 00:00:11",
    filename: "db_backup_20260611_0000.enc",
    size: "14.1 MB",
    type: "auto",
    status: "success",
    checksum: "ec2014cd456222792110c7128cb5f3b708cf0efea5430858f7004481308a472c"
  },
  {
    id: "back-3",
    timestamp: "2026-06-10 15:32:01",
    filename: "db_backup_manual_v12.enc",
    size: "13.9 MB",
    type: "manual",
    status: "success",
    checksum: "4b87ae95f00e5720d20dffdfdce401a75661b369cf8cb5fcf1c80f4886616013"
  }
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: "log-1",
    timestamp: "2026-06-12 06:12:45",
    user: "Aslı Demir",
    role: "Lojistik Operasyon Müdürü",
    action: "TRK-3490812-A durumunu 'YOLDA' olarak güncelledi",
    ip: "192.168.12.44",
    hash: "a4f5b61c...22de",
    severity: "info"
  },
  {
    id: "log-2",
    timestamp: "2026-06-12 05:40:12",
    user: "Caner Kaya",
    role: "Müşteri Temsilcisi (CRM)",
    action: "Ege Otomotiv Yedek Parça Ltd. iletişim bilgilerini güncelledi",
    ip: "85.105.210.37",
    hash: "f7c1b2e4...aa98",
    severity: "info"
  },
  {
    id: "log-3",
    timestamp: "2026-06-12 04:15:00",
    user: "System Daemon",
    role: "Sistem Yöneticisi (Admin)",
    action: "AES-256 Otomatik veritabanı mühürlü yedek başarılı",
    ip: "127.0.0.1",
    hash: "2c3d5e8f...bc99",
    severity: "info"
  },
  {
    id: "log-4",
    timestamp: "2026-06-12 01:22:10",
    user: "Bilinmeyen Terminal",
    role: "İzin Verilmeyen",
    action: "API Gateway: /v1/shipments endpointine başarısız erişim denemesi (Eksik Token)",
    ip: "185.140.24.112",
    hash: "d9e0f31c...bbcc",
    severity: "warning"
  }
];

export const initialNotifications: Notification[] = [
  {
    id: "not-1",
    type: "delay",
    title: "Yol Kapanma & Gecikme Uyarısı",
    message: "TRK-4412980-B nolu tekstil yükü Bolu Dağı tünel yol onarımı nedeniyle duraklamış ve gecikmeye girmiştir.",
    timestamp: "2026-06-12 05:43",
    read: false
  },
  {
    id: "not-2",
    type: "backup",
    title: "Günlük Otomatik Yedekleme Tamamlandı",
    message: "En son veritabanı yedeği korumalı bulut vault depolama konumuna başarıyla kopyalandı.",
    timestamp: "2026-06-12 04:15",
    read: false
  },
  {
    id: "not-3",
    type: "security",
    title: "Yetkisiz Erişim Engellendi",
    message: "185.140.24.112 IP adresinden API sistemine yapılan yetkisiz sorgulama engellendi.",
    timestamp: "2026-06-12 01:23",
    read: true
  }
];
