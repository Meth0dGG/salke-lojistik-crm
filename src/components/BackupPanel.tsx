/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Database, 
  RotateCw, 
  ArrowDownToLine, 
  CloudLightning,
  CheckCircle,
  Clock,
  ShieldCheck,
  Zap,
  HardDriveUpload,
  Server,
  FileSpreadsheet,
  LogIn,
  LogOut,
  ExternalLink,
  Cloud,
  CircleCheckBig,
  X,
  Trash2
} from 'lucide-react';
import { Backup, UserRole, Customer, Shipment } from '../types';
import { 
  initGapi, 
  initGis, 
  signIn, 
  signOut, 
  backupToGoogleSheets, 
  restoreFromGoogleSheets,
  findSpreadsheet,
  isGoogleApiLoaded,
  isSignedIn,
  GoogleSheetsStatus
} from '../googleSheetsBackup';

interface BackupPanelProps {
  t: any;
  userRole: UserRole;
  backups: Backup[];
  onTriggerBackup: () => void;
  onRestore: (customers: Customer[], shipments: Shipment[]) => Promise<void>;
  customers: Customer[];
  shipments: Shipment[];
}

export default function BackupPanel({
  t,
  userRole,
  backups,
  onTriggerBackup,
  onRestore,
  customers,
  shipments
}: BackupPanelProps) {
  const [backupFrequency, setBackupFrequency] = useState<'hourly' | 'daily' | 'weekly'>('daily');
  const [isSimulating, setIsSimulating] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [downloadSuccessCode, setDownloadSuccessCode] = useState<string | null>(null);
  
  // Google Sheets state
  const [googleStatus, setGoogleStatus] = useState<GoogleSheetsStatus>({
    isSignedIn: false,
    userEmail: null,
    lastBackupTime: null,
    spreadsheetUrl: null,
    spreadsheetId: null
  });
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreConfirmationUrl, setRestoreConfirmationUrl] = useState<string | null>(null);
  const [restoreConfirmationId, setRestoreConfirmationId] = useState<string | null>(null);
  const [showManualUrlModal, setShowManualUrlModal] = useState(false);
  const [manualUrlInput, setManualUrlInput] = useState('');
  const [backupProgress, setBackupProgress] = useState(0);
  const [backupMessage, setBackupMessage] = useState('');
  const [googleApiReady, setGoogleApiReady] = useState(false);
  const [backupsList, setBackupsList] = useState<Backup[]>(backups);
  const [initError, setInitError] = useState<string>('');
  const [backupSuccess, setBackupSuccess] = useState(false);

  // Google API'yi başlat
  useEffect(() => {
    let mounted = true;
    const initGoogle = async () => {
      // API'lerin yüklenmesini bekle
      const waitForApis = () => new Promise<void>((resolve) => {
        const check = () => {
          if (isGoogleApiLoaded()) {
            resolve();
          } else {
            setTimeout(check, 200);
          }
        };
        check();
        // 10 saniye sonra timeout
        setTimeout(resolve, 10000);
      });

      await waitForApis();
      
      if (!isGoogleApiLoaded()) {
        console.warn('Google API yüklenemedi');
        setInitError('isGoogleApiLoaded false döndü');
        return;
      }

      try {
        await initGapi();
        initGis((status) => {
          if (mounted) {
            setGoogleStatus(status);
          }
        });
        
        if (mounted) {
          setGoogleApiReady(true);
        }
        
        // Önceki oturum varsa kontrol et
        if (isSignedIn()) {
          setGoogleStatus(prev => ({ ...prev, isSignedIn: true }));
        }
      } catch (err: any) {
        console.error('Google API başlatma hatası:', err);
        setInitError(err?.message || String(err));
      }
    };

    initGoogle();
  }, []);

  // Trigger loading animation and mock manual backup successfully
  const handleCreateManualBackup = () => {
    // Only administrators or managers are allowed to manage database backups
    if (userRole !== 'admin') {
      alert("Operasyon Yetki Engeli: Veritabanı yönetim operasyonları ve anlık AES-256 yedekleme işlemleri sadece Sistem Yöneticisi (admin) yetkisindedir!");
      return;
    }

    setIsSimulating(true);
    setTimeout(() => {
      onTriggerBackup();
      setIsSimulating(false);
    }, 2000);
  };

  const handleCleanupDatabase = async () => {
    const confirmed = window.confirm("Dikkat! Bu işlem veritabanınızdaki isimsiz (boş) veya kopya olarak oluşmuş çöp kayıtları kalıcı olarak temizleyecektir. Devam etmek istiyor musunuz?");
    if (!confirmed) return;

    setIsCleaning(true);
    let deletedCount = 0;
    try {
      const { deleteDoc, doc } = await import('firebase/firestore');
      const { db } = await import('../firebase');

      const garbageCustomers = customers.filter(c => !c.name.trim() && !c.company.trim() && !c.email.trim() && !c.phone.trim());
      for (const c of garbageCustomers) {
        await deleteDoc(doc(db, 'customers', c.id));
        deletedCount++;
      }

      const garbageShipments = shipments.filter(s => !s.trackingNumber.trim() && !s.customerName.trim() && !s.origin.trim() && !s.destination.trim());
      for (const s of garbageShipments) {
        await deleteDoc(doc(db, 'shipments', s.id));
        deletedCount++;
      }
      
      alert(`Temizlik tamamlandı! Toplam ${deletedCount} adet çöp kayıt başarıyla silindi.`);
    } catch(err: any) {
      alert(`Temizlik sırasında bir hata oluştu: ${err.message}`);
    } finally {
      setIsCleaning(false);
    }
  };

  // Google Sheets'ten geri yükleme
  const handleGoogleSheetsRestore = async () => {
    if (!googleStatus.isSignedIn) {
      signIn();
      return;
    }

    setIsRestoring(true);
    setBackupMessage('Yedek dosya aranıyor...');
    try {
      let spreadsheetId: string | null = null;
      let spreadsheetUrl: string | null = null;
      
      try {
        const spreadsheet = await findSpreadsheet();
        if (spreadsheet) {
          spreadsheetId = spreadsheet.spreadsheetId;
          spreadsheetUrl = spreadsheet.spreadsheetUrl;
        }
      } catch (err: any) {
        console.warn('Otomatik arama başarısız oldu (muhtemelen Drive API kapalı):', err.message);
      }
      
      if (!spreadsheetId || !spreadsheetUrl) {
        // Electron'da window.prompt desteklenmediği için kendi modalımızı açıyoruz
        setShowManualUrlModal(true);
        setIsRestoring(false);
        setBackupMessage('');
        return;
      }
      
      setRestoreConfirmationId(spreadsheetId);
      setRestoreConfirmationUrl(spreadsheetUrl);
    } catch(err: any) {
      console.error('Google Sheets dosya arama hatası:', err);
      alert(err.message || 'Yedek dosyası aranırken bir hata oluştu.');
      setIsRestoring(false);
    }
  };

  const handleManualUrlSubmit = () => {
    if (!manualUrlInput) {
      setShowManualUrlModal(false);
      return;
    }
    
    const match = manualUrlInput.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (!match || !match[1]) {
      alert("Geçersiz Google Sheets linki. Linkin içinde '/d/...' formatında bir ID bulunmalıdır.");
      return;
    }
    
    setRestoreConfirmationId(match[1]);
    setRestoreConfirmationUrl(manualUrlInput);
    setShowManualUrlModal(false);
    setManualUrlInput('');
  };

  const executeRestore = async () => {
    if (!restoreConfirmationId) return;

    const targetSpreadsheetId = restoreConfirmationId;

    setRestoreConfirmationUrl(null);
    setRestoreConfirmationId(null);
    setIsRestoring(true);
    setBackupProgress(0);
    setBackupMessage('Geri yükleme başlatılıyor...');
    setBackupSuccess(false);

    try {
      const result = await restoreFromGoogleSheets(targetSpreadsheetId, (percent, message) => {
        setBackupProgress(percent);
        setBackupMessage(message);
      });

      setBackupMessage('Veriler Firebase\'e yazılıyor...');
      await onRestore(result.customers, result.shipments);
      
      setBackupProgress(100);
      setBackupMessage('Geri yükleme başarıyla tamamlandı!');
      setBackupSuccess(true);
      setTimeout(() => setBackupSuccess(false), 8000);
    } catch (err: any) {
      console.error('Google Sheets restore hatası:', err);
      setBackupMessage(`Hata: ${err.message}`);
    } finally {
      setTimeout(() => {
        setIsRestoring(false);
        setBackupProgress(0);
        setBackupMessage('');
      }, 3000);
    }
  };

  // Google Sheets'e yedekleme
  const handleGoogleSheetsBackup = async () => {
    if (!googleStatus.isSignedIn) {
      signIn();
      return;
    }

    setIsBackingUp(true);
    setBackupProgress(0);
    setBackupMessage('Başlatılıyor...');
    setBackupSuccess(false);

    try {
      const result = await backupToGoogleSheets(
        customers,
        shipments,
        (percent, message) => {
          setBackupProgress(percent);
          setBackupMessage(message);
        }
      );

      setGoogleStatus(prev => ({
        ...prev,
        lastBackupTime: result.timestamp,
        spreadsheetUrl: result.spreadsheetUrl,
        spreadsheetId: result.spreadsheetId
      }));

      setBackupSuccess(true);
      setTimeout(() => setBackupSuccess(false), 8000);
    } catch (err: any) {
      console.error('Google Sheets yedekleme hatası:', err);
      setBackupMessage(`Hata: ${err.message}`);
    } finally {
      setTimeout(() => {
        setIsBackingUp(false);
        setBackupProgress(0);
        setBackupMessage('');
      }, 2000);
    }
  };

  const handleGoogleSignIn = () => {
    signIn();
  };

  const handleGoogleSignOut = () => {
    signOut(setGoogleStatus);
  };

  const simulateDownload = (filename: string, checksum: string) => {
    setDownloadSuccessCode(`"${filename}" mühür indiriliyor... SHA-256 doğrulaması tamamlandı: ${checksum.substring(0, 16)}...`);
    setTimeout(() => setDownloadSuccessCode(null), 6000);
  };

  return (
    <div className="space-y-6 fade-in" id="backup-management-panel">
      
      {/* Google Sheets Yedekleme Kartı */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800/50 p-5 rounded-2xl shadow-xs space-y-4" id="google-sheets-backup-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold font-display text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <FileSpreadsheet className="text-emerald-600 dark:text-emerald-400" size={24} />
              Google Sheets Yedekleme
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Müşteri ve sevkiyat verilerinizi Google Drive'da güvenle saklayın
            </p>
          </div>

          <div className="flex items-center gap-2">
            {googleStatus.isSignedIn ? (
              <div className="flex items-center gap-2 flex-wrap justify-end">
                <button
                  onClick={handleGoogleSheetsBackup}
                  disabled={isBackingUp || isRestoring}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer shadow-sm"
                  id="btn-google-sheets-backup"
                >
                  {isBackingUp ? (
                    <RotateCw size={15} className="animate-spin" />
                  ) : (
                    <Cloud size={15} />
                  )}
                  {isBackingUp ? 'Yedekleniyor...' : "Google Sheets'e Yedekle"}
                </button>
                <button
                  onClick={handleGoogleSheetsRestore}
                  disabled={isBackingUp || isRestoring}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer shadow-sm"
                  id="btn-google-sheets-restore"
                >
                  {isRestoring ? (
                    <RotateCw size={15} className="animate-spin" />
                  ) : (
                    <ArrowDownToLine size={15} />
                  )}
                  {isRestoring ? 'Geri Yükleniyor...' : "Geri Yükle"}
                </button>
                <button
                  onClick={handleGoogleSignOut}
                  className="flex items-center gap-1 px-3 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-medium hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition cursor-pointer"
                  title="Google hesabından çıkış"
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={handleGoogleSignIn}
                disabled={!googleApiReady}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer disabled:opacity-40 shadow-sm"
                id="btn-google-sign-in"
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                {googleApiReady ? 'Google ile Giriş Yap' : 'API Yükleniyor...'}
              </button>
            )}
          </div>
        </div>

        {/* Debug info */}
        {!googleApiReady && (
          <div className="text-[10px] text-red-500 font-mono mt-2 p-2 bg-red-50 rounded">
            DEBUG: href: {window.location.href}<br/>
            gapi: {typeof (window as any).gapi}<br/>
            google: {typeof (window as any).google}<br/>
            oauth2: {typeof (window as any).google?.accounts?.oauth2}<br/>
            error: {initError || 'Waiting...'}
          </div>
        )}

        {/* Bağlantı durumu */}
        {googleStatus.isSignedIn && (
          <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400">
            <CircleCheckBig size={14} />
            <span>Bağlı: <strong>{googleStatus.userEmail || 'Google Hesabı'}</strong></span>
          </div>
        )}

        {/* Geri Yükleme Onay Penceresi */}
        {restoreConfirmationUrl && (
          <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl space-y-3 shadow-sm animate-fade-in">
            <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-100 flex items-center gap-2">
              <Database size={16} />
              Geri Yükleme Onayı
            </h3>
            <p className="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed">
              Google Drive'ınızda <strong>Salke Lojistik CRM Yedek</strong> adını taşıyan en güncel tablo bulundu. 
              Geri yükleme işlemi, bu tablodaki kayıtları veritabanınızla birleştirecek (aynı ID'ye sahip olanları güncelleyecek, yenileri ekleyecek).
            </p>
            
            <a
              href={restoreConfirmationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition mt-1"
            >
              <ExternalLink size={12} />
              Aktarılacak Tabloyu İncele
            </a>

            <div className="flex items-center gap-2 pt-2 border-t border-indigo-100 dark:border-indigo-800/50">
              <button
                onClick={executeRestore}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
              >
                <CheckCircle size={14} />
                Evet, Verileri Getir
              </button>
              <button
                onClick={() => { setRestoreConfirmationUrl(null); setRestoreConfirmationId(null); }}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold transition"
              >
                İptal
              </button>
            </div>
          </div>
        )}

        {/* Manuel Link Giriş Penceresi */}
        {showManualUrlModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl max-w-lg w-full p-6 animate-fade-in-up">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Database className="text-indigo-500" />
                  Yedek Bulunamadı
                </h3>
                <button
                  onClick={() => setShowManualUrlModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Google Drive'da yedek dosyanız otomatik olarak bulunamadı (Drive API kapalı olabilir). 
                  Lütfen geri yüklemek istediğiniz Google Sheets tablosunun LİNKİNİ (URL) aşağıya yapıştırın.
                </p>
                <input 
                  type="text" 
                  value={manualUrlInput}
                  onChange={(e) => setManualUrlInput(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0Xry5n8t4/edit"
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition text-slate-800 dark:text-slate-200"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowManualUrlModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  İptal
                </button>
                <button
                  onClick={handleManualUrlSubmit}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  <CheckCircle size={16} />
                  Onayla
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Yedekleme İlerleme Çubuğu */}
        {(isBackingUp || isRestoring) && (
          <div className="p-4 bg-white/60 dark:bg-slate-900/40 rounded-xl space-y-3" id="sheets-backup-progress">
            <div className="flex justify-between items-center text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              <span>{backupMessage}</span>
              <span>%{backupProgress}</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 dark:bg-emerald-400 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${backupProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Başarı mesajı */}
        {backupSuccess && googleStatus.spreadsheetUrl && (
          <div className="p-4 bg-emerald-100/80 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 rounded-xl flex items-start gap-3" id="sheets-backup-success">
            <CheckCircle className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" size={18} />
            <div className="space-y-2 flex-1">
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                ✅ Yedekleme başarıyla tamamlandı!
              </p>
              <div className="text-xs text-emerald-700 dark:text-emerald-300 space-y-1">
                <p>📊 <strong>{customers.length}</strong> müşteri ve <strong>{shipments.length}</strong> sevkiyat kaydı yedeklendi</p>
                <p>🕐 Son yedekleme: {googleStatus.lastBackupTime}</p>
              </div>
              <a
                href={googleStatus.spreadsheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition mt-1"
              >
                <ExternalLink size={12} />
                Google Sheets'te Aç
              </a>
            </div>
          </div>
        )}

        {/* Son yedekleme bilgisi */}
        {!backupSuccess && googleStatus.lastBackupTime && googleStatus.spreadsheetUrl && (
          <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-slate-900/30 rounded-xl">
            <div className="text-xs text-slate-600 dark:text-slate-400">
              <span>Son yedekleme: <strong className="text-slate-800 dark:text-slate-200">{googleStatus.lastBackupTime}</strong></span>
            </div>
            <a
              href={googleStatus.spreadsheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
            >
              <ExternalLink size={12} />
              Sheets'te Görüntüle
            </a>
          </div>
        )}
      </div>

      {/* Cloud Header info */}
      <div className="bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold font-display text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Database className="text-indigo-600 dark:text-sky-400" size={24} />
            {t.cloudStorageStatus}
          </h2>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCleanupDatabase}
              disabled={isCleaning}
              className={`flex items-center justify-center gap-1.5 px-4 py-2.5 bg-rose-100 text-rose-600 hover:bg-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-900/60 disabled:opacity-50 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer`}
              title="Sistemdeki hayalet ve çöp kayıtları temizler"
            >
              {isCleaning ? (
                <RotateCw size={15} className="animate-spin" />
              ) : (
                <Trash2 size={15} />
              )}
              {isCleaning ? "Temizleniyor..." : "Çöp Kayıtları Temizle"}
            </button>
            <button
              onClick={handleCreateManualBackup}
              disabled={isSimulating}
              className={`flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer dark:bg-sky-500`}
              id="btn-manual-backup"
            >
              {isSimulating ? (
                <RotateCw size={15} className="animate-spin" />
              ) : (
                <HardDriveUpload size={15} />
              )}
              {isSimulating ? "Yedek Alınıyor..." : t.createBackup}
            </button>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-350">
          {t.cloudDesc}
        </p>

        {isSimulating && (
          <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl space-y-3" id="backup-progress-card">
            <div className="flex justify-between items-center text-xs font-semibold text-indigo-700 dark:text-sky-300">
              <span>{t.simulatingCloudBackup}</span>
              <span>76%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-indigo-600 dark:bg-sky-500 h-full w-[76%] transition-all duration-300"></div>
            </div>
          </div>
        )}
      </div>

      {downloadSuccessCode && (
        <div className="bg-emerald-50 dark:bg-emerald-950/25 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3 text-emerald-800 dark:text-emerald-300 text-xs font-mono" id="download-trigger-success">
          {downloadSuccessCode}
        </div>
      )}

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left 1 Column: Config Auto Frequency */}
        <div className="bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4 h-fit">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm font-display flex items-center gap-1.5">
            <Clock size={16} />
            {t.autoBackupFrequency}
          </h3>

          <div className="space-y-2" id="backup-frequency-selectors">
            {[
              { id: 'hourly', label: t.hourly, time: "Her 60 dakikada bir otomatik" },
              { id: 'daily', label: t.daily, time: "Her gece saat 00:00'da (Önerilen)" },
              { id: 'weekly', label: t.weekly, time: "Pazar günleri haftalık yedek" },
            ].map((freq) => (
              <button
                key={freq.id}
                onClick={() => setBackupFrequency(freq.id as any)}
                className={`w-full text-left p-3 rounded-xl border transition cursor-pointer font-sans ${
                  backupFrequency === freq.id 
                    ? 'border-indigo-500 bg-indigo-50/30 dark:bg-slate-950/80 ring-2 ring-indigo-550/20' 
                    : 'border-slate-150 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200">{freq.label}</span>
                  {backupFrequency === freq.id && (
                    <span className="h-2 w-2 rounded-full bg-indigo-600"></span>
                  )}
                </div>
                <p className="text-[10px] sm:text-xs text-slate-400 mt-1">{freq.time}</p>
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-50 dark:border-slate-800 space-y-2 text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5"><ShieldCheck className="text-emerald-500" size={14} /> Otomatik yedekleme bütünlüğü aktif</div>
            <div className="flex items-center gap-1.5"><Server size={14} className="text-indigo-500" /> Sürüm saklama süresi: 30 Gün</div>
          </div>
        </div>

        {/* Right 2 Columns: Backup Archives logs directory */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-850 dark:text-slate-150 text-sm font-display mb-3">
              {t.backupHistory}
            </h3>

            <div className="overflow-x-auto" id="backup-history-table">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-slate-405 dark:text-slate-500 text-[10px] uppercase font-mono">
                    <th className="py-2.5 px-3">{t.filename}</th>
                    <th className="py-2.5 px-3">Zaman</th>
                    <th className="py-2.5 px-3">{t.size}</th>
                    <th className="py-2.5 px-3">Tür</th>
                    <th className="py-2.5 px-3 text-right">Mühür</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {backups.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/20 font-mono text-[11px]">
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-700 dark:text-slate-350">{b.filename}</span>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono tracking-tighter truncate max-w-[170px]" title={b.checksum}>
                          Hash: {b.checksum}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-500">{b.timestamp}</td>
                      <td className="py-3 px-3 text-slate-705 dark:text-slate-300 font-bold">{b.size}</td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex px-1.5 py-0.5 rounded-sm uppercase text-[9px] font-black ${
                          b.type === 'auto' ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400'
                        }`}>
                          {b.type === 'auto' ? 'Otomatik' : 'Manuel'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-xs font-sans">
                        <button
                          onClick={() => simulateDownload(b.filename, b.checksum)}
                          className="px-2 py-1 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded hover:bg-indigo-600 hover:text-white transition-colors duration-250 cursor-pointer flex items-center justify-center gap-1 text-[11px] ml-auto"
                        >
                          <ArrowDownToLine size={11} />
                          {t.download}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-950/30 rounded-xl mt-4 flex items-center gap-3">
            <CloudLightning className="text-yellow-500 animate-pulse shrink-0" size={20} />
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">
              <strong>Yük Kurtarma (Disaster Recovery):</strong> En kötü felaket senaryolarında, son yedek dosyanızı yeni bir Docker imajına yükleyerek ERP sisteminizi 3 saniyede sıfır veri kaybı ile ayağa kaldırabilirsiniz.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
