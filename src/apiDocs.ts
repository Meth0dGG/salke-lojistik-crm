/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  parameters: { name: string; type: string; required: boolean; description: string }[];
  defaultResponse: any;
}

export const apiEndpoints: ApiEndpoint[] = [
  {
    method: 'GET',
    path: '/api/v1/shipments',
    description: 'Tüm aktif lojistik sevkiyatlarının listesini, durumlarını ve çıkış/varış koordinatlarını döner. (Returns all active logistics shipments & tracking info)',
    parameters: [
      { name: 'status', type: 'string', required: false, description: 'Filtreleme kriteri: transit, preparing, delayed, delivered' },
      { name: 'carrier', type: 'string', required: false, description: 'Taşıyıcı filtreleyici (Örn: DHL, Turkish Cargo)' }
    ],
    defaultResponse: {
      success: true,
      count: 6,
      timestamp: "2026-06-12T06:18:43Z",
      shipments: [
        {
          id: "sh-101",
          trackingNumber: "TRK-9081273-A",
          customerName: "Rheinland Automotive Gmbh",
          origin: "Stuttgart, Almanya",
          destination: "Kocaeli, Türkiye",
          status: "transit",
          delayMinutes: 0,
          carrier: "DHL Global",
          cargoType: "Otomotiv Yedek Parça"
        }
      ]
    }
  },
  {
    method: 'GET',
    path: '/api/v1/customers',
    description: 'CRM veritabanındaki kayıtlı tüm lojistik müşterilerini ve durumlarını listeler. (Retrieves all registered customers from CRM system)',
    parameters: [
      { name: 'status', type: 'string', required: false, description: 'Filtreleyici: active, lead, vip, inactive' }
    ],
    defaultResponse: {
      success: true,
      count: 6,
      timestamp: "2026-06-12T06:18:43Z",
      customers: [
        {
          id: "cust-1",
          name: "Murat Yılmaz",
          company: "Anadolu Global Ticaret",
          email: "m.yilmaz@anadoluticaret.com",
          status: "active",
          country: "Türkiye"
        }
      ]
    }
  },
  {
    method: 'POST',
    path: '/api/v1/shipments/delay',
    description: 'Taşıyıcılar tarafından bir sevkiyattaki anlık gecikme durumunu sisteme entegre etmek için kullanılır. (Inserts/updates delay status for active tracking codes)',
    parameters: [
      { name: 'trackingNumber', type: 'string', required: true, description: 'Sevkiyat takip numarası' },
      { name: 'delayMinutes', type: 'number', required: true, description: 'Dakika cinsinden gecikme süresi' },
      { name: 'reason', type: 'string', required: true, description: 'Gecikme nedeni (Hava muhalefeti, gümrük vb.)' }
    ],
    defaultResponse: {
      success: true,
      message: "Gecikme durumu sisteme işlendi. Anlık bildirimler CRM ekranına gönderildi.",
      updatedTracking: "TRK-4412980-B",
      delayMinutes: 180,
      timestamp: "2026-06-12T06:18:43Z"
    }
  },
  {
    method: 'GET',
    path: '/api/v1/system/backups',
    description: 'Bulut altyapısında depolanan, şifrelenmiş yedeklerin (mühürlü snapshot listesi) sağlık durumunu kontrol eder. (Lists all encrypted daily backups and cloud health status)',
    parameters: [],
    defaultResponse: {
      success: true,
      cloudVaultStatus: "STABLE",
      autoRetentionSchedule: "DAILY",
      lastBackupTimestamp: "2026-06-12 00:00:15",
      files: [
        {
          filename: "db_backup_20260612_0000.enc",
          size: "14.2 MB",
          checksumSHA256: "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08"
        }
      ]
    }
  }
];
