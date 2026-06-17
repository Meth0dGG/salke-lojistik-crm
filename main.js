import { app, BrowserWindow, shell, dialog } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import express from 'express';

const require = createRequire(import.meta.url);
const { autoUpdater } = require('electron-updater');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Canlıda yayınlayacağınız gerçek, halka açık üretim (production) web adresi.
// ÖRNEK: "https://salkelojistik.com" veya kendi canlı Cloud Run adresiniz.
// NOT: AI Studio üzerindeki geçici "ais-pre-..." önizleme adresleri Google hesabı oturumu (cookie) gerektirdiğinden,
// masaüstü uygulamanız doğrudan açmaya çalıştığında "Page not found" veya "Giriş Yap" engeline takılır.
// Bu yüzden yerel testlerde ve paketlenmemiş modda doğrudan yerel (dist/index.html) dosyalarını yükleyeceğiz.
const LIVE_WEB_URL = "https://ais-pre-fdjrt74tczrdoxwzammtes-411329602448.europe-west1.run.app";

let mainWindow = null;

let localServer = null;

function startLocalServerAndLoad(win) {
  if (localServer) {
    win.loadURL('http://localhost:3000');
    return;
  }
  
  const serverApp = express();
  serverApp.use(express.static(path.join(__dirname, 'dist')));
  
  serverApp.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });

  localServer = serverApp.listen(3000, 'localhost', () => {
    console.log('Yerel sunucu http://localhost:3000 adresinde başlatıldı.');
    win.loadURL('http://localhost:3000').catch(err => {
      console.error('Local sunucu yüklenemedi:', err);
    });
  });
  
  localServer.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log('Port 3000 zaten kullanımda, doğrudan bağlanılıyor...');
      win.loadURL('http://localhost:3000');
    } else {
      console.error('Local server hatası:', err);
      win.loadFile(path.join(__dirname, 'dist/index.html'));
    }
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1285,
    height: 850,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'), // Güvenli ön yükleme desteği (isteğe bağlı)
    },
    title: "Salke Lojistik CRM ve Sevkiyat Takip",
    icon: path.join(__dirname, 'build', 'icon.png')
  });

  // Geliştirici konsolunu (DevTools) kolay açmak için menüyü veya kısayolları standart tutalım.
  mainWindow.setMenuBarVisibility(false); // Menü çubuğunu gizle (temiz görünüm için)

  const isDev = !app.isPackaged;
  const isAistudioPreview = LIVE_WEB_URL.includes("ais-pre-") || LIVE_WEB_URL.includes("ais-dev-");

  // Eğer yerel geliştirme aşamasındaysak VEYA tanımlı URL korumalı bir AI Studio önizleme adresi ise:
  // Doğrudan yerel, yüksek hızlı ve güvenli derlenmiş (dist/index.html) dosyalarını yükle.
  if (isDev || isAistudioPreview) {
    console.log("Geliştirme / AI Studio Önizleme modu algılandı. Yerel React dosyaları (dist/index.html) yükleniyor...");
    startLocalServerAndLoad(mainWindow);
  } else {
    // Gerçek bir canlı dağıtım (production) URL'i girildiğinde burası çalışır:
    console.log(`Masaüstü uygulaması canlı web adresine bağlanıyor: ${LIVE_WEB_URL}`);
    mainWindow.loadURL(LIVE_WEB_URL).catch((err) => {
      console.warn("Canlı web uygulaması yüklenemedi, çevrimdışı yerel yedek moduna geçiliyor...", err);
      // İnternet yoksa veya yüklenemezse yerel derlenmiş React dosyalarını yükle (Çevrimdışı Mod Fallback)
      startLocalServerAndLoad(mainWindow);
    });
  }

  // Güvenlik ve Akış: Harici bağlantıları (örneğin harici linkler, harita linkleri vb.) 
  // dahili pencerede açmak yerine kullanıcının varsayılan tarayıcısında açalım.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.startsWith(LIVE_WEB_URL) && !url.startsWith('file://')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith(LIVE_WEB_URL) && !url.startsWith('file://') && !url.startsWith('http://localhost')) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });
}

// ============================================
// OTOMATİK GÜNCELLEME (AUTO-UPDATE) SİSTEMİ
// ============================================
function setupAutoUpdater() {
  // Geliştirme modunda güncelleme kontrolü yapma
  if (!app.isPackaged) {
    console.log('Geliştirme modu: Otomatik güncelleme devre dışı.');
    return;
  }

  // Güncelleme loglarını aktif et
  autoUpdater.logger = console;

  // Otomatik indirmeyi kapat - kullanıcıya sor
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  // Güncelleme kontrolü başladı
  autoUpdater.on('checking-for-update', () => {
    console.log('Güncelleme kontrol ediliyor...');
  });

  // Yeni güncelleme bulundu
  autoUpdater.on('update-available', (info) => {
    console.log('Yeni güncelleme mevcut:', info.version);
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Güncelleme Mevcut',
      message: `Yeni sürüm mevcut: v${info.version}`,
      detail: 'Güncellemeyi şimdi indirmek ister misiniz?',
      buttons: ['Şimdi İndir', 'Sonra'],
      defaultId: 0,
      cancelId: 1
    }).then((result) => {
      if (result.response === 0) {
        autoUpdater.downloadUpdate();
      }
    });
  });

  // Güncelleme yok
  autoUpdater.on('update-not-available', () => {
    console.log('Uygulama güncel.');
  });

  // İndirme ilerleme durumu
  autoUpdater.on('download-progress', (progressObj) => {
    const logMessage = `İndirme hızı: ${Math.round(progressObj.bytesPerSecond / 1024)} KB/s - %${Math.round(progressObj.percent)} tamamlandı`;
    console.log(logMessage);
    
    if (mainWindow) {
      mainWindow.setProgressBar(progressObj.percent / 100);
    }
  });

  // İndirme tamamlandı
  autoUpdater.on('update-downloaded', (info) => {
    console.log('Güncelleme indirildi:', info.version);
    
    if (mainWindow) {
      mainWindow.setProgressBar(-1); // İlerleme çubuğunu kaldır
    }

    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Güncelleme Hazır',
      message: 'Güncelleme indirildi.',
      detail: `v${info.version} yüklemeye hazır. Uygulamayı yeniden başlatmak ister misiniz?`,
      buttons: ['Şimdi Yeniden Başlat', 'Sonra'],
      defaultId: 0,
      cancelId: 1
    }).then((result) => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
  });

  // Hata
  autoUpdater.on('error', (err) => {
    console.error('Güncelleme hatası:', err);
  });

  // Uygulama başladıktan 3 saniye sonra güncelleme kontrolü yap
  setTimeout(() => {
    autoUpdater.checkForUpdates().catch((err) => {
      console.error('Güncelleme kontrolü başarısız:', err);
    });
  }, 3000);
}

app.whenReady().then(() => {
  createWindow();
  setupAutoUpdater();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
