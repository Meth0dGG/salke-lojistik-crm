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
const API_KEY = 'AIzaSyC9LH1agAm48jh3ct8wJ4nisMdhvJ4_UCs';
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
    w.gapi.load('client', async () => {
      try {
        await w.gapi.client.init({
          apiKey: API_KEY,
          discoveryDocs: [DISCOVERY_DOC],
        });
        gapiInited = true;
        resolve();
      } catch (err) {
        console.error('GAPI Init Hatası:', err);
        reject(err);
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
 * Mevcut "Salke Lojistik CRM Yedek" spreadsheet'ini bul veya yeni oluştur
 */
async function findOrCreateSpreadsheet(): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  const w = window as any;
  const token = w.gapi.client.getToken()?.access_token;
  
  if (!token) throw new Error('Google hesabına giriş yapılmamış');

  // Mevcut spreadsheet'i Drive'da ara
  const searchResponse = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=name contains 'Salke Lojistik CRM Yedek' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false&orderBy=modifiedTime desc&fields=files(id,name,webViewLink)`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  const searchData = await searchResponse.json();
  
  if (searchData.files && searchData.files.length > 0) {
    return {
      spreadsheetId: searchData.files[0].id,
      spreadsheetUrl: searchData.files[0].webViewLink
    };
  }

  // Yoksa yeni oluştur
  const now = new Date();
  const dateStr = `${now.getDate().toString().padStart(2, '0')}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getFullYear()}`;
  
  const createResponse = await fetch(
    'https://www.googleapis.com/drive/v3/files',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: `Salke Lojistik CRM Yedek - ${dateStr}`,
        mimeType: 'application/vnd.google-apps.spreadsheet'
      })
    }
  );
  const fileData = await createResponse.json();
  
  return {
    spreadsheetId: fileData.id,
    spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${fileData.id}`
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
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties.title`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const metaData = await metaResponse.json();
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

  // Varsayılan "Sheet1" varsa ve kullanmıyorsak sil
  if (existingSheets.includes('Sheet1') && !sheetNames.includes('Sheet1') && requests.length > 0) {
    const sheetId = metaData.sheets.find((s: any) => s.properties.title === 'Sheet1')?.properties?.sheetId;
    if (sheetId !== undefined) {
      requests.push({
        deleteSheet: { sheetId }
      });
    }
  }
  
  if (requests.length > 0) {
    await fetch(
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
  }
}

/**
 * Sheet'e veri yaz (üzerine yaz)
 */
async function writeSheetData(spreadsheetId: string, sheetName: string, data: any[][]): Promise<void> {
  const w = window as any;
  const token = w.gapi.client.getToken()?.access_token;

  // Önce sheet'i temizle
  await fetch(
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

  // Yeni veriyi yaz
  await fetch(
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
    'Durum', 'Taşıyıcı', 'Yük Tipi', 'Ağırlık (kg)', 
    'Kalkış Tarihi', 'Tahmini Varış', 'Gecikme (dk)', 'Gecikme Nedeni', 'Oluşturan'
  ];
  const shipmentRows = shipments.map(s => [
    s.id,
    s.trackingNumber,
    s.customerName,
    s.origin,
    s.destination,
    translateShipmentStatus(s.status),
    s.carrier,
    s.cargoType,
    s.weight.toString(),
    s.departureDate,
    s.estimatedArrival,
    s.delayMinutes.toString(),
    s.delayReason,
    s.createdBy || '-'
  ]);
  
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
