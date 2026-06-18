/**
 * Google Sheets Yedekleme Servisi
 * Müşteri ve Sevkiyat verilerini Google Drive'da Google Sheets'e yedekler.
 * 
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { Customer, Shipment } from './types';

// Google API yapılandırması
// Firebase projesi üzerinden OAuth 2.0 kullanılır
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file';
const DISCOVERY_DOC = 'https://sheets.googleapis.com/$discovery/rest?version=v4';

// Google Cloud Console'dan alınan OAuth 2.0 Client ID
// Firebase projesi: salke-savas-aktarim
// Ayarlamak için: https://console.cloud.google.com/apis/credentials?project=salke-savas-aktarim
const CLIENT_ID = '916796491480-0n64fbv67ti0nnbt03tfopctr49o4eei.apps.googleusercontent.com';

let tokenClient: any = null;
let gapiInited = false;
let gisInited = false;

export interface GoogleSheetsStatus {
  isSignedIn: boolean;
  userEmail: string | null;
  lastBackupTime: string | null;
  spreadsheetUrl: string | null;
  spreadsheetId: string | null;
}

/**
 * GAPI kütüphanesini başlat
 */
export const initGapi = async () => {
  if (gapiInited) return;
  const w = window as any;
  
  await new Promise<void>((resolve, reject) => {
    if (!w.gapi) {
      reject(new Error('Google API kütüphanesi yüklenemedi'));
      return;
    }

    const timeoutId = setTimeout(() => {
      reject(new Error('gapi.load 5 saniye içinde yanıt vermedi (zaman aşımı). İnternet bağlantısını veya güvenlik duvarını kontrol edin.'));
    }, 5000);

    w.gapi.load('client', async () => {
      clearTimeout(timeoutId);
      try {
        await w.gapi.client.init({
          discoveryDocs: [DISCOVERY_DOC],
        });
        gapiInited = true;
        resolve();
      } catch (err: any) {
        console.error('GAPI Init Hatası:', err);
        reject(new Error(err?.message || err?.details || JSON.stringify(err)));
      }
    });
  });
};

/**
 * Google Identity Services'i başlat
 */
export function initGis(onSignInChange: (status: GoogleSheetsStatus) => void): void {
  const w = window as any;
  if (!w.google?.accounts?.oauth2) {
    console.warn('Google Identity Services yüklenemedi');
    return;
  }

  tokenClient = w.google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: (response: any) => {
      if (response.error) {
        console.error('OAuth hatası:', response);
        return;
      }
      // Token alındı, kullanıcı bilgilerini al
      fetchUserInfo().then(email => {
        onSignInChange({
          isSignedIn: true,
          userEmail: email,
          lastBackupTime: null,
          spreadsheetUrl: null,
          spreadsheetId: null
        });
      });
    },
  });
  gisInited = true;
}

/**
 * Google hesabına giriş yap
 */
export function signIn(): void {
  if (!tokenClient) {
    console.error('Token client başlatılmadı');
    return;
  }
  
  const w = window as any;
  if (w.gapi?.client?.getToken()) {
    // Zaten token var, yeni scope iste
    tokenClient.requestAccessToken({ prompt: '' });
  } else {
    // İlk kez giriş, consent ekranı göster
    tokenClient.requestAccessToken({ prompt: 'consent' });
  }
}

/**
 * Google hesabından çıkış yap
 */
export function signOut(onSignInChange: (status: GoogleSheetsStatus) => void): void {
  const w = window as any;
  const token = w.gapi?.client?.getToken();
  if (token) {
    w.google.accounts.oauth2.revoke(token.access_token);
    w.gapi.client.setToken('');
    onSignInChange({
      isSignedIn: false,
      userEmail: null,
      lastBackupTime: null,
      spreadsheetUrl: null,
      spreadsheetId: null
    });
  }
}

/**
 * Kullanıcı email bilgisini al
 */
async function fetchUserInfo(): Promise<string | null> {
  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${(window as any).gapi.client.getToken().access_token}`
      }
    });
    const data = await response.json();
    return data.email || null;
  } catch {
    return null;
  }
}

/**
 * Drive'da yedek dosyası ara (Sadece bulur, oluşturmaz)
 */
export async function findSpreadsheet(): Promise<{ spreadsheetId: string; spreadsheetUrl: string } | null> {
  const w = window as any;
  const token = w.gapi.client.getToken()?.access_token;
  
  if (!token) throw new Error('Google hesabına giriş yapılmamış');

  const query = "name contains 'Salke Lojistik CRM Yedek' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false";
  const encodedQuery = encodeURIComponent(query);

  try {
    const searchResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodedQuery}&orderBy=modifiedTime%20desc&fields=files(id,name,webViewLink)`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    const searchData = await searchResponse.json();
    if (searchResponse.ok && searchData.files && searchData.files.length > 0) {
      return {
        spreadsheetId: searchData.files[0].id,
        spreadsheetUrl: searchData.files[0].webViewLink
      };
    } else if (!searchResponse.ok) {
      const errMsg = searchData.error?.message || 'Bilinmeyen hata';
      console.warn("Drive API ile arama yapılamadı.", searchData);
      
      // Eğer Drive API aktif değilse özel bir uyarı göster
      if (errMsg.includes('Drive API has not been used') || errMsg.includes('disabled') || searchResponse.status === 403) {
         throw new Error("Google Drive API aktif değil! Lütfen Google Cloud Console üzerinden 'Google Drive API' servisini etkinleştirin.");
      }
    }
  } catch (err: any) {
    if (err.message && err.message.includes('Google Drive API aktif değil')) {
      throw err;
    }
    console.warn("Drive API ağ hatası.", err);
  }
  
  return null;
}

/**
 * Mevcut "Salke Lojistik CRM Yedek" spreadsheet'ini bul veya yeni oluştur
 */
export async function findOrCreateSpreadsheet(): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  const existing = await findSpreadsheet();
  if (existing) {
    return existing;
  }

  // Yoksa yeni oluştur
  const now = new Date();
  const dateStr = `${now.getDate().toString().padStart(2, '0')}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getFullYear()}`;
  
  // Sadece Sheets API kullanarak yeni bir tablo oluştur
  const createResponse = await fetch(
    'https://sheets.googleapis.com/v4/spreadsheets',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: {
          title: `Salke Lojistik CRM Yedek - ${dateStr}`
        }
      })
    }
  );
  const fileData = await createResponse.json();
  if (!createResponse.ok) {
    throw new Error(`Sheets API Tablo Oluşturma Hatası: ${fileData.error?.message || createResponse.statusText}`);
  }
  
  return {
    spreadsheetId: fileData.spreadsheetId,
    spreadsheetUrl: fileData.spreadsheetUrl
  };
}

/**
 * Spreadsheet'e sheet ekle (yoksa)
 */
async function ensureSheets(spreadsheetId: string, sheetNames: string[]): Promise<void> {
  const w = window as any;
  const token = w.gapi.client.getToken()?.access_token;
  
  // Mevcut sheet'leri al
  const metaResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties.title,sheets.properties.sheetId`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const metaData = await metaResponse.json();
  if (!metaResponse.ok) {
    throw new Error(`Sheets API Meta Hatası: ${metaData.error?.message || metaResponse.statusText}`);
  }

  const existingSheets = metaData.sheets?.map((s: any) => s.properties.title) || [];
  
  const requests: any[] = [];
  
  for (const name of sheetNames) {
    if (!existingSheets.includes(name)) {
      requests.push({
        addSheet: {
          properties: { title: name }
        }
      });
    }
  }

  // Varsayılan "Sheet1" veya "Sayfa1" varsa ve kullanmıyorsak sil
  const defaultSheets = ['Sheet1', 'Sayfa1'];
  for (const ds of defaultSheets) {
    if (existingSheets.includes(ds) && !sheetNames.includes(ds) && requests.length > 0) {
      const sheetId = metaData.sheets.find((s: any) => s.properties.title === ds)?.properties?.sheetId;
      if (sheetId !== undefined) {
        requests.push({
          deleteSheet: { sheetId }
        });
      }
    }
  }
  
  if (requests.length > 0) {
    const batchResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ requests })
      }
    );
    const batchData = await batchResponse.json();
    if (!batchResponse.ok) {
      throw new Error(`Sheets API Batch Update Hatası: ${batchData.error?.message || batchResponse.statusText}`);
    }
  }
}

/**
 * Sheet'e veri yaz (üzerine yaz)
 */
async function writeSheetData(spreadsheetId: string, sheetName: string, data: any[][]): Promise<void> {
  const w = window as any;
  const token = w.gapi.client.getToken()?.access_token;

  // Önce sheet'i temizle
  const clearResp = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}:clear`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    }
  );
  if (!clearResp.ok) {
    const clearData = await clearResp.json();
    throw new Error(`Sheets API Clear Hatası: ${clearData.error?.message || clearResp.statusText}`);
  }

  // Yeni veriyi yaz
  const appendResp = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}!A1:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        values: data
      })
    }
  );
  if (!appendResp.ok) {
    const appendData = await appendResp.json();
    throw new Error(`Sheets API Append Hatası: ${appendData.error?.message || appendResp.statusText}`);
  }
}

/**
 * Sheet'i formatla (başlık satırını kalın ve renkli yap)
 */
async function formatHeaderRow(spreadsheetId: string, sheetName: string): Promise<void> {
  const w = window as any;
  const token = w.gapi.client.getToken()?.access_token;

  // Sheet ID'sini al
  const metaResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const metaData = await metaResponse.json();
  if (!metaResponse.ok) return; // Sessizce geçebiliriz, formatlama kritik değil
  
  const sheet = metaData.sheets?.find((s: any) => s.properties.title === sheetName);
  if (!sheet) return;
  
  const sheetId = sheet.properties.sheetId;

  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requests: [
          {
            repeatCell: {
              range: { sheetId, startRowIndex: 0, endRowIndex: 1 },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.1, green: 0.2, blue: 0.4 },
                  textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, bold: true, fontSize: 11 },
                  horizontalAlignment: 'CENTER'
                }
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)'
            }
          },
          {
            updateSheetProperties: {
              properties: { sheetId, gridProperties: { frozenRowCount: 1 } },
              fields: 'gridProperties.frozenRowCount'
            }
          },
          {
            autoResizeDimensions: {
              dimensions: { sheetId, dimension: 'COLUMNS', startIndex: 0, endIndex: 15 }
            }
          }
        ]
      })
    }
  );
}

/**
 * Durum çeviricisi
 */
function translateCustomerStatus(status: string): string {
  const map: Record<string, string> = {
    active: 'Aktif',
    lead: 'Potansiyel',
    vip: 'VIP',
    inactive: 'Pasif'
  };
  return map[status] || status;
}

function translateShipmentStatus(status: string): string {
  const map: Record<string, string> = {
    preparing: 'Hazırlanıyor',
    transit: 'Yolda',
    delivered: 'Teslim Edildi',
    cancelled: 'İptal'
  };
  return map[status] || status;
}

/**
 * Ana yedekleme fonksiyonu - Müşteri ve Sevkiyat verilerini Google Sheets'e yedekler
 */
export async function backupToGoogleSheets(
  customers: Customer[],
  shipments: Shipment[],
  onProgress?: (percent: number, message: string) => void
): Promise<{ spreadsheetUrl: string; spreadsheetId: string; timestamp: string }> {
  
  onProgress?.(5, 'Google Drive bağlantısı kuruluyor...');
  
  // Spreadsheet'i bul veya oluştur
  const { spreadsheetId, spreadsheetUrl } = await findOrCreateSpreadsheet();
  
  onProgress?.(15, 'Spreadsheet hazırlanıyor...');
  
  // Sheet'leri oluştur
  await ensureSheets(spreadsheetId, ['Müşteriler', 'Sevkiyatlar']);
  
  onProgress?.(25, 'Müşteri verileri yazılıyor...');
  
  // Müşteri verilerini hazırla
  const customerHeaders = ['ID', 'Ad Soyad', 'Şirket', 'E-Posta', 'Telefon', 'Durum', 'Temsilci', 'Ülke'];
  const customerRows = customers.map(c => [
    c.id,
    c.name,
    c.company,
    c.email,
    c.phone,
    translateCustomerStatus(c.status),
    c.representative,
    c.country
  ]);
  
  await writeSheetData(spreadsheetId, 'Müşteriler', [customerHeaders, ...customerRows]);
  
  onProgress?.(50, 'Müşteri formatı uygulanıyor...');
  await formatHeaderRow(spreadsheetId, 'Müşteriler');
  
  onProgress?.(60, 'Sevkiyat verileri yazılıyor...');
  
  // Sevkiyat verilerini hazırla
  const shipmentHeaders = [
    'ID', 'Takip No', 'Müşteri', 'Çıkış Noktası', 'Varış Noktası', 
    'Durum', 'Taşıyıcı', 'Yük Tipi', 'Ağırlık (kg)', 'Alış Fiyatı (₺)', 'Satış Fiyatı (₺)', 'Kâr (₺)',
    'Kalkış Tarihi', 'Tahmini Varış', 'Gecikme (dk)', 'Gecikme Nedeni', 'Oluşturan'
  ];
  const shipmentRows = shipments.map(s => {
    const profit = (s.purchasePrice != null && s.salePrice != null) ? (s.salePrice - s.purchasePrice) : '';
    return [
      s.id,
      s.trackingNumber,
      s.customerName,
      s.origin,
      s.destination,
      translateShipmentStatus(s.status),
      s.carrier,
      s.cargoType,
      s.weight.toString(),
      s.purchasePrice != null ? s.purchasePrice.toString() : '',
      s.salePrice != null ? s.salePrice.toString() : '',
      profit.toString(),
      s.departureDate,
      s.estimatedArrival,
      s.delayMinutes.toString(),
      s.delayReason,
      s.createdBy || '-'
    ];
  });
  
  await writeSheetData(spreadsheetId, 'Sevkiyatlar', [shipmentHeaders, ...shipmentRows]);
  
  onProgress?.(85, 'Sevkiyat formatı uygulanıyor...');
  await formatHeaderRow(spreadsheetId, 'Sevkiyatlar');
  
  onProgress?.(100, 'Yedekleme tamamlandı!');
  
  const now = new Date();
  const timestamp = `${now.toLocaleDateString('tr-TR')} ${now.toLocaleTimeString('tr-TR')}`;
  
  return { spreadsheetUrl, spreadsheetId, timestamp };
}

/**
 * Google API'nin yüklenip yüklenmediğini kontrol et
 */
export function isGoogleApiLoaded(): boolean {
  const w = window as any;
  return !!(w.gapi && w.google?.accounts?.oauth2);
}

/**
 * Oturumun açık olup olmadığını kontrol et
 */
export function isSignedIn(): boolean {
  const w = window as any;
  return !!(w.gapi?.client?.getToken());
}

/**
 * Tablodan veri oku
 */
async function readSheetData(spreadsheetId: string, range: string): Promise<any[][]> {
  const w = window as any;
  const token = w.gapi.client.getToken()?.access_token;
  
  if (!token) throw new Error('Google hesabına giriş yapılmamış');

  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || 'Veri okuma hatası');
  }
  
  return data.values || [];
}

/**
 * Durum geri çeviricileri
 */
function reverseTranslateCustomerStatus(statusTr: string): Customer['status'] {
  const map: Record<string, Customer['status']> = {
    'Aktif': 'active',
    'Potansiyel': 'lead',
    'VIP': 'vip',
    'Pasif': 'inactive'
  };
  return map[statusTr] || 'active';
}

function reverseTranslateShipmentStatus(statusTr: string): Shipment['status'] {
  const map: Record<string, Shipment['status']> = {
    'Hazırlanıyor': 'preparing',
    'Yolda': 'transit',
    'Teslim Edildi': 'delivered',
    'İptal': 'cancelled'
  };
  return map[statusTr] || 'preparing';
}

/**
 * Geri yükleme ana fonksiyonu
 */
export async function restoreFromGoogleSheets(
  spreadsheetId: string,
  onProgress?: (percent: number, message: string) => void
): Promise<{ customers: Customer[], shipments: Shipment[] }> {
  
  onProgress?.(10, 'Google Drive bağlantısı kuruluyor...');
  
  onProgress?.(30, 'Müşteri verileri okunuyor...');
  const customerRows = await readSheetData(spreadsheetId, 'Müşteriler!A2:H');
  
  const seenCustomerIds = new Set<string>();
  const customers: Customer[] = customerRows.map((row, index) => {
    let rowId = row[0]?.trim() || '';
    // Eğer ID cus- veya cust- ile başlamıyorsa veya zaten kullanılmışsa yeni ID üret
    const isInvalid = !(rowId.startsWith('cus-') || rowId.startsWith('cust-'));
    let finalId = isInvalid ? `cus-${Date.now()}-${index}` : rowId;
    
    // Kopya ID kontrolü
    if (seenCustomerIds.has(finalId)) {
      finalId = `cus-${Date.now()}-${index}-dup`;
    }
    seenCustomerIds.add(finalId);

    return {
      id: finalId,
      name: row[1] || '',
      company: row[2] || '',
      email: row[3] || '',
      phone: row[4] || '',
      status: reverseTranslateCustomerStatus(row[5] || ''),
      representative: row[6] || '',
      country: row[7] || ''
    };
  }).filter(c => c.name.trim() || c.company.trim() || c.email.trim() || c.phone.trim()); // Anlamlı bir verisi olanları al

  onProgress?.(60, 'Sevkiyat verileri okunuyor...');
  const shipmentRows = await readSheetData(spreadsheetId, 'Sevkiyatlar!A2:Z');

  const seenShipmentIds = new Set<string>();
  const shipments: Shipment[] = shipmentRows.map((row, index) => {
    // Fiyatları parse et
    const parseCurrency = (val: any) => {
      if (!val) return undefined;
      if (typeof val === 'number') return val;
      let str = String(val).trim().replace(/[^0-9.,-]/g, '');
      if (!str) return undefined;
      
      const lastCommaIdx = str.lastIndexOf(',');
      const lastDotIdx = str.lastIndexOf('.');
      
      if (lastCommaIdx > lastDotIdx) {
        // virgül ondalık (1.500,50)
        str = str.replace(/\./g, '').replace(',', '.');
      } else if (lastDotIdx > lastCommaIdx) {
        // nokta ondalık (1,500.50)
        str = str.replace(/,/g, '');
      }
      const parsed = parseFloat(str);
      return isNaN(parsed) ? undefined : parsed;
    };

    const purchaseStr = row[9];
    const saleStr = row[10];
    const purchasePrice = parseCurrency(purchaseStr);
    const salePrice = parseCurrency(saleStr);

    let rowId = row[0]?.trim() || '';
    // sh- veya shp- ile başlıyorsa geçerli kabul et, yoksa otomatik ID ata
    const isInvalid = !(rowId.startsWith('shp-') || rowId.startsWith('sh-'));
    let finalId = isInvalid ? `shp-${Date.now()}-${index}` : rowId;

    if (seenShipmentIds.has(finalId)) {
      finalId = `shp-${Date.now()}-${index}-dup`;
    }
    seenShipmentIds.add(finalId);

    return {
      id: finalId,
      trackingNumber: row[1]?.trim() || `TRK-${Math.floor(1000000 + Math.random() * 9000000)}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
      customerId: 'google-sheets-import', // Firestore rules require customerId
      customerName: row[2] || '',
      origin: row[3] || '',
      destination: row[4] || '',
      status: reverseTranslateShipmentStatus(row[5] || ''),
      carrier: row[6] || '',
      cargoType: row[7] || '',
      weight: parseFloat(row[8]) || 0,
      purchasePrice: (purchasePrice !== undefined && !isNaN(purchasePrice)) ? purchasePrice : null,
      salePrice: (salePrice !== undefined && !isNaN(salePrice)) ? salePrice : null,
      departureDate: row[12] || '',
      estimatedArrival: row[13] || '',
      delayMinutes: parseInt(row[14]) || 0,
      delayReason: row[15] || '',
      createdBy: (row[16] && row[16] !== '-') ? row[16] : 'Sistem'
    };
  }).filter(s => s.trackingNumber.trim() || s.customerName.trim() || s.origin.trim() || s.destination.trim()); // Anlamlı verisi olan sevkiyatları al

  onProgress?.(100, 'Veriler başarıyla okundu!');

  return { customers, shipments };
}
