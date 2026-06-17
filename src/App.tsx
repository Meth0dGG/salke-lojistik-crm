/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  Bell, 
  Users, 
  Truck, 
  Shield, 
  Database, 
  Code, 
  FileLock2, 
  MessageSquare, 
  AlertTriangle,
  User,
  Power,
  RefreshCw,
  Info
} from 'lucide-react';
import { translations } from './translations';
import { 
  Customer, 
  Shipment, 
  Backup, 
  AuditLog, 
  Notification, 
  UserRole, 
  AppState,
  SystemUser
} from './types';
import { 
  initialCustomers, 
  initialShipments, 
  initialBackups, 
  initialAuditLogs, 
  initialNotifications 
} from './mockData';

import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { collection, onSnapshot, setDoc, deleteDoc, doc } from 'firebase/firestore';

// Modular children panels import
import DashboardOverview from './components/DashboardOverview';
import CrmPanel from './components/CrmPanel';
import ShipmentsPanel from './components/ShipmentsPanel';
import RolesPanel from './components/RolesPanel';
import BackupPanel from './components/BackupPanel';
import ApiPanel from './components/ApiPanel';
import AuditPanel from './components/AuditPanel';
import FeedbackPanel from './components/FeedbackPanel';
import LoginPanel from './components/LoginPanel';
import MembersPanel from './components/MembersPanel';

export default function App() {
  // Authentication states
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const [loggedInUser, setLoggedInUser] = useState<SystemUser | null>(() => {
    const saved = localStorage.getItem('erp_logged_in_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Keep track of Firebase Auth State
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user);
    });
    return () => unsubscribe();
  }, []);

  // Global React state
  const [activeModule, setActiveModule] = useState<string>('dashboard');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [language, setLanguage] = useState<'tr' | 'en' | 'de'>('tr');
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>(() => {
    const savedUser = localStorage.getItem('erp_logged_in_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser) as SystemUser;
      return parsed.role;
    }
    return 'admin';
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean>(true);
  
  // Data list states synchronized via Firestore real-time snapshots
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [backups, setBackups] = useState<Backup[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // UI States
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Firestore Real-time Sync & Seeding Effect
  useEffect(() => {
    const unsubSystemUsers = onSnapshot(collection(db, 'systemUsers'), (snapshot) => {
      const data: SystemUser[] = [];
      snapshot.forEach(doc => {
        data.push(doc.data() as SystemUser);
      });
      if (data.length > 0) {
        setUsers(data);
      } else {
        const defaultUsers: SystemUser[] = [
          { id: 'usr-admin', username: 'admin', password: '1234', role: 'admin', personnelName: 'System Admin' },
          { id: 'usr-asli', username: 'asli', password: '1234', role: 'customer_rep', personnelName: 'Aslı Demir' },
          { id: 'usr-caner', username: 'caner', password: '1234', role: 'logistics_manager', personnelName: 'Caner Kaya' },
          { id: 'usr-deniz', username: 'deniz', password: '1234', role: 'support', personnelName: 'Deniz Yılmaz' }
        ];
        defaultUsers.forEach(u => {
          setDoc(doc(db, 'systemUsers', u.id), u).catch(e => console.error(e));
        });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'systemUsers');
    });

    const unsubCustomers = onSnapshot(collection(db, 'customers'), (snapshot) => {
      const data: Customer[] = [];
      snapshot.forEach(doc => {
        data.push(doc.data() as Customer);
      });
      if (data.length > 0) {
        setCustomers(data);
      } else {
        initialCustomers.forEach(c => {
          setDoc(doc(db, 'customers', c.id), c).catch(e => console.error(e));
        });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'customers');
    });

    const unsubShipments = onSnapshot(collection(db, 'shipments'), (snapshot) => {
      const data: Shipment[] = [];
      snapshot.forEach(doc => {
        data.push(doc.data() as Shipment);
      });
      if (data.length > 0) {
        setShipments(data);
      } else {
        initialShipments.forEach(s => {
          setDoc(doc(db, 'shipments', s.id), s).catch(e => console.error(e));
        });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'shipments');
    });

    const unsubNotifications = onSnapshot(collection(db, 'notifications'), (snapshot) => {
      const data: Notification[] = [];
      snapshot.forEach(doc => {
        data.push(doc.data() as Notification);
      });
      data.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
      if (data.length > 0) {
        setNotifications(data);
      } else {
        initialNotifications.forEach(n => {
          setDoc(doc(db, 'notifications', n.id), n).catch(e => console.error(e));
        });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'notifications');
    });

    const unsubAuditLogs = onSnapshot(collection(db, 'auditLogs'), (snapshot) => {
      const data: AuditLog[] = [];
      snapshot.forEach(doc => {
        data.push(doc.data() as AuditLog);
      });
      data.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
      if (data.length > 0) {
        setAuditLogs(data);
      } else {
        initialAuditLogs.forEach(a => {
          setDoc(doc(db, 'auditLogs', a.id), a).catch(e => console.error(e));
        });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'auditLogs');
    });

    const unsubBackups = onSnapshot(collection(db, 'backups'), (snapshot) => {
      const data: Backup[] = [];
      snapshot.forEach(doc => {
        data.push(doc.data() as Backup);
      });
      data.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
      if (data.length > 0) {
        setBackups(data);
      } else {
        initialBackups.forEach(b => {
          setDoc(doc(db, 'backups', b.id), b).catch(e => console.error(e));
        });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'backups');
    });

    return () => {
      unsubSystemUsers();
      unsubCustomers();
      unsubShipments();
      unsubNotifications();
      unsubAuditLogs();
      unsubBackups();
    };
  }, []);

  // Sync session states individually
  useEffect(() => {
    if (loggedInUser) {
      localStorage.setItem('erp_logged_in_user', JSON.stringify(loggedInUser));
    } else {
      localStorage.removeItem('erp_logged_in_user');
    }
  }, [loggedInUser]);

  // Set initial HTML theme dark mode
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const activeT = translations[language];

  // Helper function to append to audit log and show ephemeral alerts
  const recordAuditLog = (action: string, severity: 'info' | 'warning' | 'critical' = 'info') => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const chars = "abcdef0123456789";
    let hashStr = "";
    for(let i=0; i<8; i++) { hashStr += chars.charAt(Math.floor(Math.random() * chars.length)); }
    hashStr += "...";
    for(let i=0; i<4; i++) { hashStr += chars.charAt(Math.floor(Math.random() * chars.length)); }

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp,
      user: currentUserRole === 'admin' ? "Murat Admin (m.admin)" : 
            currentUserRole === 'logistics_manager' ? "Mustafa Manager (m.ops)" :
            currentUserRole === 'customer_rep' ? "Selin Temsilci (s.crm)" : "Ahmet Saha (a.support)",
      role: activeT[currentUserRole],
      action,
      ip: "192.168.12." + Math.floor(10 + Math.random() * 80),
      hash: hashStr,
      severity
    };

    setDoc(doc(db, 'auditLogs', newLog.id), newLog).catch(e => {
      handleFirestoreError(e, OperationType.WRITE, `auditLogs/${newLog.id}`);
    });
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Authentication Actions
  const handleLogin = (username: string, pass: string): boolean => {
    const found = users.find(u => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === pass);
    if (found) {
      setLoggedInUser(found);
      setCurrentUserRole(found.role);
      setActiveModule('dashboard');
      // Add audit log with temporary manual user string since recordAuditLog relies on currently updated role
      setTimeout(() => {
        recordAuditLog(`Oturum açıldı: ${found.personnelName} (${found.username})`);
      }, 50);
      triggerToast(`Hoş geldiniz, ${found.personnelName}!`);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    if (loggedInUser) {
      recordAuditLog(`Oturum kapatıldı: ${loggedInUser.personnelName}`);
    }
    setLoggedInUser(null);
    setActiveModule('dashboard');
    triggerToast("Oturum güvenli bir şekilde kapatıldı.");
  };

  const handleAddUser = (newUser: SystemUser) => {
    setDoc(doc(db, 'systemUsers', newUser.id), newUser)
      .then(() => {
        recordAuditLog(`Yeni sistem üyesi kaydedildi: ${newUser.personnelName} (${newUser.username})`);
      })
      .catch(e => handleFirestoreError(e, OperationType.CREATE, `systemUsers/${newUser.id}`));
  };

  const handleUpdateUser = (updatedUser: SystemUser) => {
    setDoc(doc(db, 'systemUsers', updatedUser.id), updatedUser)
      .then(() => {
        if (loggedInUser && loggedInUser.id === updatedUser.id) {
          setLoggedInUser(updatedUser);
          setCurrentUserRole(updatedUser.role);
        }
        recordAuditLog(`Sistem üyesi/yetkisi güncellendi: ${updatedUser.personnelName} (${updatedUser.username}) - Rol: ${updatedUser.role}`);
      })
      .catch(e => handleFirestoreError(e, OperationType.UPDATE, `systemUsers/${updatedUser.id}`));
  };

  const handleDeleteUser = (id: string) => {
    const target = users.find(u => u.id === id);
    if (!target) return;
    deleteDoc(doc(db, 'systemUsers', id))
      .then(() => {
        recordAuditLog(`Sistem üyesi kaydı silindi: ${target.personnelName} (${target.username})`, 'warning');
      })
      .catch(e => handleFirestoreError(e, OperationType.DELETE, `systemUsers/${id}`));
  };

  // Perform secure backup simulation
  const handleTriggerManualBackup = () => {
    const timestampStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const dateFormatted = new Date().toISOString().slice(0,10).replace(/-/g, "");
    
    const chars = "0123456789abcdef";
    let sha = "";
    for(let i=0; i<64; i++) { sha += chars.charAt(Math.floor(Math.random() * chars.length)); }

    const newBackup: Backup = {
      id: `back-${Date.now()}`,
      timestamp: timestampStr,
      filename: `db_backup_manual_${dateFormatted}_${Math.floor(1000 + Math.random() * 9000)}.enc`,
      size: `${(13.8 + Math.random() * 2).toFixed(1)} MB`,
      type: 'manual',
      status: 'success',
      checksum: sha
    };

    setDoc(doc(db, 'backups', newBackup.id), newBackup)
      .then(() => {
        // Notification
        const newNot: Notification = {
          id: `not-${Date.now()}`,
          type: 'backup',
          title: activeT.backupNotificationTitle,
          message: `${newBackup.filename} isimli mühürlü AES-256 veritabanı yedeği güvenli bulut deposuna yüklendi.`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(11, 16),
          read: false
        };

        return setDoc(doc(db, 'notifications', newNot.id), newNot);
      })
      .then(() => {
        recordAuditLog(`Veritabanı yedeği manuel tetiklendi: ${newBackup.filename}`);
        triggerToast("📦 BULUT YEDEĞİ: Şifreli snapshot arşivi başarıyla depolandı.");
      })
      .catch(e => handleFirestoreError(e, OperationType.WRITE, `backups/${newBackup.id}`));
  };

  // CRM Mutators
  const handleAddCustomer = (cust: Customer) => {
    setDoc(doc(db, 'customers', cust.id), cust)
      .then(() => {
        recordAuditLog(`Yeni müşteri eklendi: ${cust.company} (${cust.name})`);
        triggerToast(`Kayıt Eklendi: ${cust.company} sisteme kaydedildi.`);
      })
      .catch(e => handleFirestoreError(e, OperationType.CREATE, `customers/${cust.id}`));
  };

  const handleUpdateCustomer = (cust: Customer) => {
    setDoc(doc(db, 'customers', cust.id), cust)
      .then(() => {
        recordAuditLog(`Müşteri kaydı güncellendi: ${cust.company}`);
        triggerToast(`Kayıt Güncellendi: ${cust.company}`);
      })
      .catch(e => handleFirestoreError(e, OperationType.UPDATE, `customers/${cust.id}`));
  };

  const handleDeleteCustomer = (id: string) => {
    const target = customers.find(c => c.id === id);
    if (!target) return;
    deleteDoc(doc(db, 'customers', id))
      .then(() => {
        recordAuditLog(`Müşteri kaydı veritabanından silindi: ${target.company}`, 'critical');
        triggerToast(`Müşteri Silindi: ${target.company}`);
      })
      .catch(e => handleFirestoreError(e, OperationType.DELETE, `customers/${id}`));
  };

  // Shipments Mutators
  const handleAddShipment = (sh: Shipment) => {
    setDoc(doc(db, 'shipments', sh.id), sh)
      .then(() => {
        recordAuditLog(`Yeni sevkiyat takip kaydı açıldı: #${sh.trackingNumber}`);
        triggerToast(`Sevkiyat Açıldı: #${sh.trackingNumber}`);
      })
      .catch(e => handleFirestoreError(e, OperationType.CREATE, `shipments/${sh.id}`));
  };

  const handleUpdateShipment = (sh: Shipment) => {
    setDoc(doc(db, 'shipments', sh.id), sh)
      .then(() => {
        recordAuditLog(`Sevkiyat güncellendi: #${sh.trackingNumber} durum: ${sh.status}`);
        triggerToast(`Güncellendi: #${sh.trackingNumber}`);
      })
      .catch(e => handleFirestoreError(e, OperationType.UPDATE, `shipments/${sh.id}`));
  };

  const handleDeleteShipment = (id: string) => {
    const target = shipments.find(s => s.id === id);
    if (!target) return;
    deleteDoc(doc(db, 'shipments', id))
      .then(() => {
        recordAuditLog(`Sevkiyat arşivi sistemden kaldırıldı: #${target.trackingNumber}`, 'critical');
        triggerToast(`Sevkiyat Silindi: #${target.trackingNumber}`);
      })
      .catch(e => handleFirestoreError(e, OperationType.DELETE, `shipments/${id}`));
  };

  // Toggle MFA
  const handleToggleMfa = () => {
    setTwoFactorEnabled(prev => {
      const next = !prev;
      recordAuditLog(`Çok faktörlü kimlik doğrulama (MFA) durumu değiştirildi: ${next ? "AKTİF" : "DEVRE DIŞI"}`, next ? 'info' : 'warning');
      triggerToast(next ? "🔒 GÜVENLİK: Çok faktörlü doğrulama (MFA) zorunlu tutuldu." : "⚠️ GÜVENLİK: MFA koruması kapatıldı!");
      return next;
    });
  };

  // Switch role action
  const handleRoleChange = (role: UserRole) => {
    setCurrentUserRole(role);
    recordAuditLog(`Kullanıcı çalışma rolünü '${role}' olarak değiştirdi.`);
    triggerToast(`Kimlik Değişti: Çalışma rolü ${activeT[role] || role} yapıldı.`);
  };

  // Read notification bell helper
  const handleMarkAllNotificationsRead = () => {
    notifications.forEach(n => {
      if (!n.read) {
        setDoc(doc(db, 'notifications', n.id), { ...n, read: true })
          .catch(e => console.error(e));
      }
    });
    triggerToast("Tüm bildirimler okundu olarak işaretlendi.");
  };

  const menuItems = [
    { id: 'dashboard', label: activeT.dashboard, icon: Globe },
    { id: 'crm', label: activeT.crm, icon: Users },
    { id: 'shipments', label: activeT.shipments, icon: Truck },
    { id: 'roles', label: activeT.roles, icon: Shield },
    ...(loggedInUser?.role === 'admin' ? [{ id: 'members', label: language === 'en' ? 'User Management' : language === 'de' ? 'Benutzerverwaltung' : 'Üye Yönetimi', icon: Users }] : []),
    { id: 'cloudBackup', label: activeT.cloudBackup, icon: Database },
    { id: 'devApi', label: activeT.devApi, icon: Code },
    { id: 'auditLogs', label: activeT.auditLogs, icon: FileLock2 },
    { id: 'feedback', label: activeT.feedback, icon: MessageSquare }
  ];

  const filteredCustomers = customers;

  const filteredShipments = !loggedInUser || loggedInUser.role === 'admin' 
    ? shipments 
    : shipments.filter(s => {
        const cust = customers.find(c => c.id === s.customerId);
        const matchesRep = cust && cust.representative.toLowerCase() === loggedInUser.personnelName.toLowerCase();
        const matchesCreator = s.createdBy && s.createdBy.toLowerCase() === loggedInUser.personnelName.toLowerCase();
        return matchesRep || matchesCreator;
      });

  if (!loggedInUser) {
    return <LoginPanel onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans antialiased selection:bg-indigo-505 selection:text-white" id="main-applet-shell">
      
      {/* GLOBAL TOAST FLOATER */}
      {toastMessage && (
        <div 
          className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-800 dark:bg-slate-900 text-white rounded-2xl p-4 shadow-2xl flex items-center gap-3 max-w-sm border-l-4 border-l-indigo-500 animate-bounce"
          id="global-toast-message"
        >
          <Info className="text-indigo-400 shrink-0" size={20} />
          <span className="text-xs sm:text-sm font-semibold leading-snug">{toastMessage}</span>
        </div>
      )}

      {/* SIDEBAR ON DESKTOP */}
      <aside 
        className="hidden lg:flex flex-col w-64 shrink-0 bg-white dark:bg-slate-925 border-r border-slate-150 dark:border-slate-800/80 p-5 justify-between select-none"
        id="desktop-sidebar"
      >
        <div className="space-y-6">
          {/* Brand logo */}
          <div className="flex items-center gap-2.5 px-2 pb-4 border-b border-slate-100 dark:border-slate-850">
            <div className="p-2 rounded-xl bg-indigo-600 dark:bg-sky-500 text-white shadow-md shadow-indigo-150 dark:shadow-none">
              <Globe size={22} className="animate-spin-slow" />
            </div>
            <div>
              <h1 className="font-extrabold text-sm sm:text-base tracking-tight font-display bg-gradient-to-r from-slate-900 to-slate-705 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Salke Lojistik
              </h1>
              <span className="text-[10px] font-bold font-mono text-indigo-650 dark:text-sky-400">
                ERP CLOUD v4.1
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1" id="desktop-nav-menu">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveModule(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
                    isActive 
                      ? 'bg-indigo-650 text-white dark:bg-sky-500 shadow-xs' 
                      : 'text-slate-500 hover:text-slate-850 dark:text-slate-400 dark:hover:text-slate-100'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Lower footprint / quick info details */}
        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-850">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800 rounded-xl space-y-2">
            <span className="text-[9px] uppercase font-bold text-slate-450 dark:text-slate-500 tracking-wider font-mono block">Aktif Oturum</span>
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-sky-400 flex items-center justify-center text-[10px] font-bold uppercase">
                {currentUserRole[0]}
              </div>
              <div className="text-left leading-tight truncate">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate leading-none capitalize">{activeT[currentUserRole]}</span>
                <span className="text-[9px] text-slate-450 dark:text-slate-500 font-mono">192.168.12.33</span>
              </div>
            </div>
          </div>

          <div className="text-center">
            <span className="text-[10px] text-slate-400 font-mono select-none block">&copy; 2026 Salke Lojistik A.Ş.</span>
          </div>
        </div>
      </aside>

      {/* MOBILE OFFCANVAS DRAWER */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden bg-slate-950/60 dark:bg-black/80 backdrop-blur-xs flex"
          id="mobile-drawer-backing"
        >
          <div className="w-64 bg-white dark:bg-slate-925 shadow-2xl p-5 flex flex-col justify-between" id="mobile-drawer-pane">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Globe size={18} className="text-indigo-600 dark:text-sky-400" />
                  <span className="font-extrabold text-sm font-display text-slate-900 dark:text-white">Salke Lojistik</span>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-slate-450 hover:text-slate-700 p-1"
                >
                  <X size={18} />
                </button>
              </div>

              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeModule === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveModule(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer transition ${
                        isActive 
                          ? 'bg-indigo-650 text-white dark:bg-sky-505 shadow-xs' 
                          : 'text-slate-600 dark:text-slate-350 hover:bg-slate-50'
                      }`}
                    >
                      <Icon size={16} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <User size={14} className="text-slate-400" />
                <span className="text-xs text-slate-500 font-semibold capitalize">{activeT[currentUserRole]}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono block">&copy; 2026 Salke ERP Cloud</span>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER WORKSPACE */}
      <div className="flex-1 flex flex-col overflow-hidden" id="workspace-main-panel-scroller">
        
        {/* HEADER TOPBAR WITH FILTERS AND TRIGGERS */}
        <header 
          className="bg-white dark:bg-slate-900 border-b border-slate-150 dark:border-slate-800/80 px-4 sm:px-6 py-3 flex items-center justify-between shrink-0 select-none"
          id="global-header-topbar"
        >
          {/* Menu Button on Mobile / Breadcrumb on Desktop */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 transition cursor-pointer"
              id="btn-mobile-menu"
            >
              <Menu size={20} />
            </button>
            
            {/* Nav breadcrumb path */}
            <div className="hidden lg:flex items-center gap-1 text-xs text-slate-440 font-mono">
              <span className="hover:text-slate-600">Salke Cloud</span>
              <span>/</span>
              <span className="hover:text-slate-600 text-slate-600 dark:text-slate-300 font-semibold uppercase tracking-wider text-[11px]">
                {activeT[activeModule] || activeModule}
              </span>
            </div>
          </div>

          {/* Action buttons list */}
          <div className="flex items-center gap-2 sm:gap-4" id="header-actions">
            
            {/* Language Switcher */}
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200/40 dark:border-slate-700/60" id="lang-switcher">
              {(['tr', 'en', 'de'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-2 py-1 rounded text-[10px] sm:text-xs font-bold uppercase transition-all cursor-pointer ${
                    language === lang 
                      ? 'bg-indigo-600 dark:bg-slate-950 text-white dark:text-sky-400 shadow-xs' 
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            {/* Dark / Light Toggle */}
            <button
              onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
              className="p-2 bg-slate-100 hover:bg-slate-150 dark:bg-slate-820 dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 transition cursor-pointer"
              title="Karanlık / Aydınlık Mod Toggled"
              id="theme-toggler"
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>

            {/* NOTIFICATION HUB dropdown bell icon with status pulses ! */}
            <div className="relative" id="notifications-bell-dropdown">
              <button
                onClick={() => setIsNotificationDropdownOpen(!isNotificationDropdownOpen)}
                className={`p-2 bg-slate-105 dark:bg-slate-820 rounded-xl text-slate-600 dark:text-slate-300 transition cursor-pointer relative ${
                  notifications.some(n => !n.read) ? 'status-pulse-delayed' : ''
                }`}
                title="Bildirimler"
              >
                <Bell size={16} />
              </button>

              {isNotificationDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2.5 w-72 sm:w-80 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-4 space-y-3"
                  id="notifications-dropdown-pane"
                >
                  <div className="flex justify-between items-center pb-2 border-b border-slate-50 dark:border-slate-850">
                    <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 font-display flex items-center gap-1.5">
                      <Bell size={14} className="text-indigo-500" />
                      {activeT.notificationHub}
                    </span>
                    
                    <button
                      onClick={handleMarkAllNotificationsRead}
                      className="text-[10px] sm:text-xs text-indigo-650 dark:text-sky-450 hover:underline cursor-pointer"
                    >
                      {activeT.markAllRead}
                    </button>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto" id="notifications-dropdown-scroll">
                    {notifications.map((n) => (
                      <div 
                        key={n.id}
                        className={`p-2.5 rounded-xl text-xs space-y-1 transition border ${
                          n.read 
                            ? 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800/80' 
                            : 'bg-indigo-50/10 border-indigo-105 dark:bg-sky-505/5 dark:border-sky-500/20'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <span className={`font-semibold ${n.read ? 'text-slate-600 dark:text-slate-300' : 'text-indigo-705 dark:text-sky-400 font-bold'}`}>
                            {n.title}
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono">{n.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                          {n.message}
                        </p>
                      </div>
                    ))}

                    {notifications.length === 0 && (
                      <div className="text-center py-8 text-slate-400 text-xs">
                        {activeT.noNotifications}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick-Switch current role selection (shortcut badge) */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-150 dark:bg-slate-820 dark:hover:bg-slate-800 rounded-xl border border-slate-200/20 dark:border-slate-700/65" id="header-current-session-role">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300 capitalize">{activeT[currentUserRole]}</span>
            </div>

            {/* Logged in User profile & Logout button */}
            {loggedInUser && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-150 dark:bg-slate-820 dark:hover:bg-slate-800 rounded-xl border border-slate-200/20 dark:border-slate-700/65 text-slate-700 dark:text-slate-200" id="header-user-banner">
                <span className="text-xs font-bold whitespace-nowrap">
                  👤 {loggedInUser.personnelName}
                </span>
                <button 
                  onClick={handleLogout}
                  className="text-[10px] sm:text-xs font-bold text-rose-605 hover:text-rose-500 hover:underline border-l border-slate-300 dark:border-slate-750 pl-2 cursor-pointer whitespace-nowrap"
                  title="Güvenli Çıkış"
                >
                  Çıkış
                </button>
              </div>
            )}

          </div>
        </header>

        {/* WORKSPACE CONTENT BODY with responsive containment limits */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6" id="applet-viewport-body">
          <div className="w-full max-w-7xl mx-auto space-y-6" id="container-constrain">
            
            {/* Dashboard Overview view */}
            {activeModule === 'dashboard' && (
              <DashboardOverview 
                t={activeT}
                shipments={filteredShipments}
                customers={filteredCustomers}
                notifications={notifications}
                onNavigate={setActiveModule}
              />
            )}

            {/* CRM Modülü */}
            {activeModule === 'crm' && (
              <CrmPanel 
                t={activeT}
                customers={filteredCustomers}
                userRole={currentUserRole}
                loggedInUser={loggedInUser}
                onAddCustomer={handleAddCustomer}
                onUpdateCustomer={handleUpdateCustomer}
                onDeleteCustomer={handleDeleteCustomer}
              />
            )}

            {/* Sevkiyatlar */}
            {activeModule === 'shipments' && (
              <ShipmentsPanel 
                t={activeT}
                shipments={filteredShipments}
                customers={filteredCustomers}
                userRole={currentUserRole}
                theme={theme}
                loggedInUser={loggedInUser}
                onAddShipment={handleAddShipment}
                onUpdateShipment={handleUpdateShipment}
                onDeleteShipment={handleDeleteShipment}
              />
            )}

            {/* Üye / Personel Yönetimi */}
            {activeModule === 'members' && loggedInUser?.role === 'admin' && (
              <MembersPanel 
                t={activeT}
                users={users}
                onAddUser={handleAddUser}
                onUpdateUser={handleUpdateUser}
                onDeleteUser={handleDeleteUser}
                toast={triggerToast}
              />
            )}

            {/* Rol Matrix Yetkilendirme */}
            {activeModule === 'roles' && (
              <RolesPanel 
                t={activeT}
                currentRole={currentUserRole}
                twoFactorEnabled={twoFactorEnabled}
                onRoleChange={handleRoleChange}
                onToggleTwoFactor={handleToggleMfa}
              />
            )}

            {/* Bulut Depolama & Yedek */}
            {activeModule === 'cloudBackup' && (
              <BackupPanel 
                t={activeT}
                userRole={currentUserRole}
                backups={backups}
                onTriggerBackup={handleTriggerManualBackup}
              />
            )}

            {/* API Geliştirici Sandbox */}
            {activeModule === 'devApi' && (
              <ApiPanel 
                t={activeT}
                shipments={filteredShipments}
                customers={filteredCustomers}
                backups={backups}
              />
            )}

            {/* Audit Logs */}
            {activeModule === 'auditLogs' && (
              <AuditPanel 
                t={activeT}
                auditLogs={auditLogs}
              />
            )}

            {/* Geri Bildirim */}
            {activeModule === 'feedback' && (
              <FeedbackPanel 
                t={activeT}
                onSendFeedbackToast={triggerToast}
              />
            )}

          </div>
        </main>
      </div>

    </div>
  );
}
