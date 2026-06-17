/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Database, 
  GitBranch, 
  Settings, 
  FileText, 
  MessageSquare, 
  Truck, 
  Users, 
  FileSpreadsheet, 
  TrendingUp, 
  ArrowRight, 
  Copy, 
  Check, 
  Sparkles, 
  Play, 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Plus, 
  RotateCcw, 
  Code,
  Shield, 
  ChevronRight, 
  Info,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Sun,
  Moon
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  initialCustomers, 
  initialDrivers, 
  initialVehicles, 
  initialShipments, 
  standardDatabaseSchemas, 
  recommendGithubFolderStructure 
} from "./data";
import { Customer, Driver, Vehicle, Shipment, Expense, TableSchema } from "./types";

export default function App() {
  // Dark Mode State with persistence and prefers-color-scheme detection
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved) return saved === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // Navigation State
  const [activeTab, setActiveTab] = useState<"modules" | "database" | "github" | "advisor">("modules");
  
  // Data State for simulations
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [drivers, setDrivers] = useState<Driver[]>(initialDrivers);
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [shipments, setShipments] = useState<Shipment[]>(initialShipments);
  
  // Database Schema Tab states
  const [selectedTable, setSelectedTable] = useState<string>("musteriler");
  const [customTablePrompt, setCustomTablePrompt] = useState<string>("");
  const [aiGeneratedSchema, setAiGeneratedSchema] = useState<any | null>(null);
  const [isGeneratingSchema, setIsGeneratingSchema] = useState<boolean>(false);
  const [schemaError, setSchemaError] = useState<string | null>(null);

  // GitHub Tab states
  const [githubAppName, setGithubAppName] = useState<string>("throat-logistic-crm");
  const [selectedModulesForReadme, setSelectedModulesForReadme] = useState<string[]>([
    "Müşteri & Tedarikçi Yönetimi",
    "Fiyatlandırma & Navlun Teklifleri",
    "Sipariş & Operasyon Yönetimi",
    "Sefer & Filo Yönetimi",
    "Finansal Takip & Faturalandırma"
  ]);
  const [aiGeneratedReadme, setAiGeneratedReadme] = useState<string | null>(null);
  const [isGeneratingReadme, setIsGeneratingReadme] = useState<boolean>(false);
  const [readmeError, setReadmeError] = useState<string | null>(null);

  // Advisor Chat states
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([
    {
      role: "assistant",
      text: "Merhaba! Ben Lojistik Sistemleri ve CRM Entegrasyon Mimarıyım. THRO CRM gibi devasa lojistik yazılımlarının veritabanı tasarımı, modüler kurguları ve Github'da yayınlama süreçleri hakkında her türlü sorun için buradayım. Yan taraftaki hızlı sorulardan birine tıklayabilir veya bana özel bir soru yöneltebilirsin!"
    }
  ]);
  const [userInput, setUserInput] = useState<string>("");
  const [isSendingMessage, setIsSendingMessage] = useState<boolean>(false);

  // Simulation Tool States
  const [simMode, setSimMode] = useState<"offer" | "operation" | "fleet">("offer");
  const [copiedText, setCopiedText] = useState<{ [key: string]: boolean }>({});

  // Helper to copy text to clipboard
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setCopiedText((prev) => ({ ...prev, [key]: false }));
    }, 2000);
  };

  // --- SUB-SIMULATOR 1: Offer Engine Generator ---
  const [offerCustId, setOfferCustId] = useState<string>(initialCustomers[0].id);
  const [offerOrigin, setOfferOrigin] = useState<string>("İstanbul, Türkiye");
  const [offerDest, setOfferDest] = useState<string>("Münih, Almanya");
  const [offerTType, setOfferTType] = useState<"Kara" | "Deniz" | "Hava" | "Demiryolu">("Kara");
  const [offerCargoType, setOfferCargoType] = useState<"FTL" | "LTL" | "FCL" | "LCL">("FTL");
  const [offerWeight, setOfferWeight] = useState<number>(12); // Tons
  const [offerVolume, setOfferVolume] = useState<number>(45); // m3
  const [calculatedFreight, setCalculatedFreight] = useState<number>(2850);
  const [calculatedCurrency, setCalculatedCurrency] = useState<"EUR" | "USD" | "TRY">("EUR");
  const [estimatedDuration, setEstimatedDuration] = useState<number>(4); // Days
  const [offerSubmittedMessage, setOfferSubmittedMessage] = useState<string | null>(null);

  // Simple formula-based logistics freight pricing calculator
  useEffect(() => {
    let baseRate = 800; // default base navlun
    if (offerTType === "Kara") {
      baseRate = 500 + offerWeight * 120 + offerVolume * 15;
      setCalculatedCurrency("EUR");
      setEstimatedDuration(4 + Math.ceil(offerWeight / 6));
    } else if (offerTType === "Deniz") {
      baseRate = 1200 + offerVolume * 40;
      setCalculatedCurrency("USD");
      setEstimatedDuration(14);
    } else if (offerTType === "Hava") {
      baseRate = 2500 + offerWeight * 800;
      setCalculatedCurrency("USD");
      setEstimatedDuration(2);
    } else { // Demiryolu
      baseRate = 1000 + offerWeight * 150;
      setCalculatedCurrency("EUR");
      setEstimatedDuration(8);
    }
    setCalculatedFreight(Math.round(baseRate));
  }, [offerOrigin, offerDest, offerTType, offerCargoType, offerWeight, offerVolume]);

  const handleCreateOfferSimulation = () => {
    const cust = customers.find(c => c.id === offerCustId);
    if (!cust) return;

    // Simulate backend response
    const newOfferId = `TEK-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    
    // Add directly to simulated shipments/orders if they choose to progress it
    const newShipment: Shipment = {
      id: `SEF-2026-${Math.floor(2000 + Math.random() * 8000)}`,
      offerId: newOfferId,
      customerId: cust.id,
      customerName: cust.name,
      origin: offerOrigin,
      destination: offerDest,
      cargoType: offerCargoType,
      cargoDetails: `${offerWeight} Ton / ${offerVolume} m3 Lojistik Sevkiyatı`,
      weight: offerWeight * 1000,
      volume: offerVolume,
      packagesCount: Math.ceil(offerVolume / 1.5),
      plate: "Seçilmedi",
      driverId: "Seçilmedi",
      driverName: "Atanmadı",
      deliveryStatus: "Taslak",
      revenue: calculatedFreight,
      currency: calculatedCurrency,
      expenses: [],
      notes: "CRM Teklif motorundan oluşturulmuş canlı iş emri taslağı."
    };

    setShipments(prev => [newShipment, ...prev]);
    setOfferSubmittedMessage(`Başarılı! ${newOfferId} kodlu navlun teklifi ${cust.name} için üretildi ve yeni operasyonel iş emri taslağı (${newShipment.id}) oluşturuldu!`);
    setTimeout(() => setOfferSubmittedMessage(null), 8500);
  };

  // --- SUB-SIMULATOR 2: Operations Profit Controller ---
  const [activeExpShipmentId, setActiveExpShipmentId] = useState<string>(initialShipments[0].id);
  const [expType, setExpType] = useState<"Yakit" | "Otoban/HGS" | "Harciirah" | "Gumruk" | "Demuraj" | "Diger">("Yakit");
  const [expAmount, setExpAmount] = useState<number>(150);
  const [expDesc, setExpDesc] = useState<string>("");

  const handleAddExpense = () => {
    if (!expAmount || expAmount <= 0) return;
    setShipments(prev => prev.map(ship => {
      if (ship.id === activeExpShipmentId) {
        const newExpense: Expense = {
          id: `EXP-${Date.now()}`,
          type: expType,
          amount: expAmount,
          currency: ship.currency,
          description: expDesc || `${expType} Masraf Girişi`
        };
        return {
          ...ship,
          expenses: [...ship.expenses, newExpense]
        };
      }
      return ship;
    }));
    setExpAmount(150);
    setExpDesc("");
  };

  // --- SUB-SIMULATOR 3: Fleet Dispatcher ---
  const [dispatchShipmentId, setDispatchShipmentId] = useState<string>(initialShipments[1].id);
  const [dispatchPlate, setDispatchPlate] = useState<string>(initialVehicles[1].plate);
  const [dispatchDriverId, setDispatchDriverId] = useState<string>(initialDrivers[1].id);

  const handleManualDispatch = () => {
    const selectedDrv = drivers.find(d => d.id === dispatchDriverId);
    if (!selectedDrv) return;

    setShipments(prev => prev.map(ship => {
      if (ship.id === dispatchShipmentId) {
        return {
          ...ship,
          plate: dispatchPlate,
          driverId: selectedDrv.id,
          driverName: selectedDrv.fullName,
          deliveryStatus: "Yolda"
        };
      }
      return ship;
    }));

    // Update driver & vehicle status to Busy/Seferde
    setDrivers(prev => prev.map(d => d.id === dispatchDriverId ? { ...d, status: "Seferde" } : d));
    setVehicles(prev => prev.map(v => v.plate === dispatchPlate ? { ...v, status: "Seferde" } : v));
  };

  // --- BACKEND API INTEGRATIONS ---
  const handleAskArchitect = async (customQuestion?: string) => {
    const questionToAsk = customQuestion || userInput;
    if (!questionToAsk.trim()) return;

    setUserInput("");
    setMessages(prev => [...prev, { role: "user", text: questionToAsk }]);
    setIsSendingMessage(true);

    try {
      const response = await fetch("/api/ask-architect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: questionToAsk,
          context: {
            appVersion: "1.0.0",
            modules: selectedModulesForReadme,
            selectedTable
          }
        })
      });

      const data = await response.json();
      if (response.ok) {
        setMessages(prev => [...prev, { role: "assistant", text: data.answer }]);
      } else {
        setMessages(prev => [...prev, { role: "assistant", text: `Üzgünüm, API erişiminde bir sorun oluştu: ${data.error || "Bilinmeyen hata"}` }]);
      }
    } catch (e: any) {
      setMessages(prev => [...prev, { role: "assistant", text: `Ağ bağlantı hatası oluştu: ${e.message || "Lütfen internet bağlantınızı veya API ayarlarınızı kontrol edin."}` }]);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleGenerateSchemaWithAI = async () => {
    if (!customTablePrompt.trim()) return;
    setIsGeneratingSchema(true);
    setSchemaError(null);
    try {
      const res = await fetch("/api/generate-schema", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: customTablePrompt,
          customTables: { currentSelectedTable: selectedTable }
        })
      });
      const data = await res.json();
      if (res.ok) {
        setAiGeneratedSchema(data);
      } else {
        setSchemaError(data.error || "Metin üretilirken Backend hatası.");
      }
    } catch (err: any) {
      setSchemaError(err.message || "Bağlantı hatası oluştu.");
    } finally {
      setIsGeneratingSchema(false);
    }
  };

  const handleGenerateReadmeWithAI = async () => {
    setIsGeneratingReadme(true);
    setReadmeError(null);
    try {
      const activeTableDetails = standardDatabaseSchemas.find(t => t.tableName === selectedTable);
      const res = await fetch("/api/generate-readme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appName: githubAppName,
          modules: selectedModulesForReadme,
          schemaCode: activeTableDetails ? `CREATE TABLE ${activeTableDetails.tableName} ...` : ""
        })
      });
      const data = await res.json();
      if (res.ok) {
        setAiGeneratedReadme(data.readme);
      } else {
        setReadmeError(data.error || "Bilinmeyen hata.");
      }
    } catch (err: any) {
      setReadmeError(err.message || "İstek gönderilemedi.");
    } finally {
      setIsGeneratingReadme(false);
    }
  };

  // Helper to click popular advisor questions
  const handleQuickQuestionClick = (q: string) => {
    handleAskArchitect(q);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-250">
      {/* Upper Navigation / Decorative Banner */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-sm transition-colors duration-250">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-tr from-indigo-600 to-indigo-800 p-2.5 rounded-lg text-white shadow-md">
                <Truck className="h-6 w-6" id="logo-icon" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  Lojistik CRM Mimarı <span className="bg-indigo-100 dark:bg-indigo-950/70 text-indigo-800 dark:text-indigo-300 text-xs py-0.5 px-2 rounded-full font-medium">Pro</span>
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Thro CRM Eşdeğeri Tasarım & Veritabanı Planlayıcı</p>
              </div>
            </div>

            {/* Header Right Segment holding Tabs & Dark Mode Toggle */}
            <div className="flex items-center space-x-4">
              {/* Main Tabs */}
              <nav className="flex space-x-1" aria-label="Tabs" id="nav-tabs">
                {(
                  [
                    { id: "modules", label: "Proje Modülleri", icon: Layers },
                    { id: "database", label: "Veritabanı Şeması", icon: Database },
                    { id: "github", label: "GitHub Yayınlayıcı", icon: GitBranch },
                    { id: "advisor", label: "AI Sistem Danışmanı", icon: MessageSquare }
                  ] as const
                ).map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      id={`tab-btn-${tab.id}`}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-150 ${
                        isActive 
                          ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 shadow-sm" 
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

              {/* Dark Mode switcher button */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                id="dark-mode-toggler"
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-amber-400 hover:bg-slate-200 dark:hover:bg-slate-705 dark:hover:bg-slate-700 transition"
                title={darkMode ? "Açık Tema" : "Karanlık Tema"}
              >
                {darkMode ? <Sun className="h-4.5 w-4.5 text-amber-400" /> : <Moon className="h-4.5 w-4.5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Metric Cards Top Overview (Architectural Honesty: real counts from application states) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center space-x-4 transition-colors">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tablo Sayısı</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{standardDatabaseSchemas.length} Çekirdek</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center space-x-4 transition-colors">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Müşteri Carileri</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{customers.length} Firma</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center space-x-4 transition-colors">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-lg">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Aktif Seferler</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{shipments.length} Operasyon</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center space-x-4 transition-colors">
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-lg">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Gereksinim Durumu</p>
              <h3 className="text-xl font-bold text-rose-600 dark:text-rose-400">Hazır (7 Modül)</h3>
            </div>
          </div>
        </div>

        {/* Dynamic Tab Panel Container */}
        <AnimatePresence mode="wait">
          
          {/* TAB 1: ROADMAP & INTERACTIVE MODULES */}
          {activeTab === "modules" && (
            <motion.div
              key="modules-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              {/* Info Jumbotron */}
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg border border-indigo-950">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                  <Truck className="w-64 h-64 text-white" />
                </div>
                <div className="relative z-10 max-w-3xl">
                  <span className="bg-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-wider uppercase px-3 py-1 rounded-full border border-indigo-500/30">
                    Süreç Yol Haritası ve Mimari
                  </span>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-4 tracking-tight leading-tight">
                    THRO Benzeri Bir Lojistik CRM Nasıl Çalışır?
                  </h2>
                  <p className="text-slate-300 mt-2 text-sm md:text-base leading-relaxed">
                    Lojistik CRM programları yalnızca müşterileri listelemez; tekliften faturalandırmaya, 
                    sürücü harcırahı takibinden gerçek zamanlı TRIP kârlılık (PnL) analizlerine kadar tüm süreci 
                    tek bir ilişkisel veritabanında entegre yönetir.
                  </p>
                  
                  {/* Visual Process Flow */}
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mt-6 pt-6 border-t border-slate-800">
                    {[
                      { step: "01", name: "Cari Hesap", desc: "Müşteri Kaydı" },
                      { step: "02", name: "Fiyatlama", desc: "Navlun Teklifi" },
                      { step: "03", name: "Operasyon", desc: "İş Emri & Sefer" },
                      { step: "04", name: "Maliyet Girişi", desc: "Masraf & Harcırah" },
                      { step: "05", name: "Denge & PnL", desc: "Fatura & Ciro" }
                    ].map((p, idx) => (
                      <div key={idx} className="bg-white/5 p-3 rounded-lg border border-white/10">
                        <div className="text-xs text-indigo-400 font-bold">{p.step}</div>
                        <div className="text-sm font-semibold text-white mt-1">{p.name}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{p.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Interactive Simulation Dashboard Title */}
              <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Canlı Modül & İş Akışı Simülatörü</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Modüller arası veri akışının veritabanı tablolarına nasıl yansıdığını interaktif deneyimleyin:</p>
              </div>

              {/* Sub Navigation of Simulation */}
              <div className="flex bg-slate-200 dark:bg-slate-800 p-1.5 rounded-xl max-w-lg transition-colors">
                {(
                  [
                    { id: "offer", label: "Teklif Motoru", icon: FileSpreadsheet },
                    { id: "operation", label: "Aktif Seferler & PnL", icon: TrendingUp },
                    { id: "fleet", label: "Sürücü & Çekici Atama", icon: Truck }
                  ] as const
                ).map((mode) => {
                  const Icon = mode.icon;
                  const isSel = simMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => setSimMode(mode.id)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs md:text-sm font-semibold transition-all ${
                        isSel 
                          ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs" 
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{mode.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Simulation Stage */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden transition-colors">
                <div className="p-6 md:p-8">
                  {/* INLINE SIMULATOR 1: OFFER ENGINE */}
                  {simMode === "offer" && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      {/* Controls Form */}
                      <div className="lg:col-span-5 space-y-4">
                        <div className="space-y-1">
                          <h4 className="text-base font-bold text-slate-900 dark:text-white">1. Navlun Teklifi Hazırlama</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Sektör standartlarında hacimsel ağırlık katsayıları ile fiyat hesaplayın.</p>
                        </div>

                        {/* Customer select */}
                        <div>
                          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Müşteri Seçin (Cari Hesap)</label>
                          <select 
                            value={offerCustId}
                            onChange={(e) => setOfferCustId(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                          >
                            {customers.filter(c => c.type !== "tedarikci").map(c => (
                              <option key={c.id} value={c.id} className="dark:bg-slate-900">{c.name} ({c.id})</option>
                            ))}
                          </select>
                        </div>

                        {/* Route input */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Yükleme Noktası</label>
                            <input 
                              type="text" 
                              value={offerOrigin}
                              onChange={(e) => setOfferOrigin(e.target.value)}
                              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Boşaltma Noktası</label>
                            <input 
                              type="text" 
                              value={offerDest}
                              onChange={(e) => setOfferDest(e.target.value)}
                              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                            />
                          </div>
                        </div>

                        {/* Transport types and cargo types */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Taşıma Modu</label>
                            <select 
                              value={offerTType}
                              onChange={(e) => setOfferTType(e.target.value as any)}
                              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                            >
                              <option value="Kara" className="dark:bg-slate-900">Karayolu (Road)</option>
                              <option value="Deniz" className="dark:bg-slate-900">Denizyolu (Sea)</option>
                              <option value="Hava" className="dark:bg-slate-900">Havayolu (Air)</option>
                              <option value="Demiryolu" className="dark:bg-slate-900">Demiryolu (Rail)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Yükleme Tipi</label>
                            <select 
                              value={offerCargoType}
                              onChange={(e) => setOfferCargoType(e.target.value as any)}
                              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                            >
                              {offerTType === "Kara" || offerTType === "Demiryolu" ? (
                                <>
                                  <option value="FTL" className="dark:bg-slate-900">FTL (Full Truck Load)</option>
                                  <option value="LTL" className="dark:bg-slate-900">LTL (Less than Truck Load)</option>
                                </>
                              ) : (
                                <>
                                  <option value="FCL" className="dark:bg-slate-900">FCL (Full Container)</option>
                                  <option value="LCL" className="dark:bg-slate-900">LCL (Less Container Load)</option>
                                </>
                              )}
                            </select>
                          </div>
                        </div>

                        {/* Weight and volume */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Brüt Ağırlık (Ton)</label>
                            <input 
                              type="number" 
                              min="0.1" 
                              step="0.1"
                              value={offerWeight}
                              onChange={(e) => setOfferWeight(parseFloat(e.target.value) || 1)}
                              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Hacim (Metreküp / Cbm)</label>
                            <input 
                              type="number" 
                              min="0.1" 
                              step="1"
                              value={offerVolume}
                              onChange={(e) => setOfferVolume(parseFloat(e.target.value) || 1)}
                              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                            />
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleCreateOfferSimulation}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition shadow-xs"
                        >
                          <Play className="h-4 w-4" />
                          <span>Müşteriye Teklif Sun & Sipariş Başlat</span>
                        </button>
                      </div>

                      {/* Display Output Board */}
                      <div className="lg:col-span-7 bg-slate-900 rounded-xl p-6 text-white flex flex-col justify-between border border-slate-800 shadow-inner relative">
                        <div>
                          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-400">Canlı Teklif & Navlun Değerleme Ekranı</span>
                            <span className="flex h-2 w-2 relative">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                          </div>

                          <div className="space-y-6 pt-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="text-xs text-slate-400">GÜZERGAH SEFER HESAPLAMA</p>
                                <h5 className="text-lg font-bold flex items-center gap-1.5 mt-0.5">
                                  {offerOrigin} <ArrowRight className="h-4 w-4 text-indigo-400 shrink-0" /> {offerDest}
                                </h5>
                                <div className="flex gap-2 mt-1">
                                  <span className="text-xs bg-indigo-950 text-indigo-300 border border-indigo-900 py-0.5 px-2 rounded-md">
                                    {offerTType} Deposu
                                  </span>
                                  <span className="text-xs bg-slate-800 text-slate-300 py-0.5 px-2 rounded-md">
                                    {offerCargoType}
                                  </span>
                                </div>
                              </div>

                              <div className="text-right">
                                <p className="text-xs text-slate-400">TAHMİNİ SEFER HESABI</p>
                                <span className="text-lg font-mono font-bold text-emerald-400">{estimatedDuration} Gün</span>
                              </div>
                            </div>

                            {/* Volumetric conversion math */}
                            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-800/80 text-xs text-slate-300 space-y-1.5">
                              <div className="flex justify-between">
                                <span className="text-slate-400">Sefer Ağırlığı:</span>
                                <span className="font-mono">{(offerWeight * 1000).toLocaleString()} kg</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Hacim Ölçüsü:</span>
                                <span className="font-mono">{offerVolume} m³ (cbm)</span>
                              </div>
                              <div className="flex justify-between border-t border-slate-800 pt-1 text-slate-200">
                                <span className="font-medium text-indigo-300">Lojistik Navlun Bedeli:</span>
                                <span className="font-bold text-sm text-emerald-300">{calculatedFreight.toLocaleString()} {calculatedCurrency}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {offerSubmittedMessage ? (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-emerald-950/80 border border-emerald-800 p-3 rounded-lg text-xs text-emerald-300 mt-4"
                          >
                            <span className="font-bold">Sistem Veritabanı İşlemi:</span> {offerSubmittedMessage}
                          </motion.div>
                        ) : (
                          <div className="text-[11px] text-slate-500 italic mt-6 pt-4 border-t border-slate-800 flex items-center gap-1.5">
                            <Info className="h-3 w.5-3 text-slate-400 shrink-0" />
                            <span>Butona tıkladığınızda 'teklifler' tablosuna durum='Onaylandı' olan bir satır yazılır ve 'siparisler_operasyon' üzerinde yeni bir iş tetiklenir.</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* INLINE SIMULATOR 2: ONGOING SHIPMENTS & COSTS */}
                  {simMode === "operation" && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      {/* Active Shipments Cards Grid */}
                      <div className="lg:col-span-7 space-y-4 max-h-[480px] overflow-y-auto pr-1">
                        <div className="flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 pb-2 z-10 transition-colors">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Mevcut Seferler (siparisler_operasyon)</h4>
                          <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full">{shipments.length} Kayıt</span>
                        </div>

                        {shipments.map((s) => {
                          const totalExpense = s.expenses.reduce((acc, curr) => acc + curr.amount, 0);
                          const netProfit = s.revenue - totalExpense;
                          const profitMargin = s.revenue > 0 ? Math.round((netProfit / s.revenue) * 100) : 0;
                          
                          return (
                            <div 
                              key={s.id}
                              onClick={() => setActiveExpShipmentId(s.id)}
                              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                                activeExpShipmentId === s.id 
                                  ? "border-indigo-600 dark:border-indigo-505 bg-indigo-50/20 dark:bg-indigo-950/20 shadow-xs" 
                                  : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">{s.id}</span>
                                <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                                  s.deliveryStatus === "Teslim Edildi" 
                                    ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300" 
                                    : s.deliveryStatus === "Yolda" 
                                      ? "bg-sky-100 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300" 
                                      : s.deliveryStatus === "Gümrükte"
                                        ? "bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300"
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-850 dark:text-slate-300"
                                }`}>
                                  {s.deliveryStatus}
                                </span>
                              </div>

                              <div className="mt-2 grid grid-cols-2 gap-2">
                                <div>
                                  <p className="text-xs text-slate-400 dark:text-slate-500">GÖNDERİCİ CARİ</p>
                                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{s.customerName}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-slate-400 dark:text-slate-500">GÜZERGAH</p>
                                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{s.origin.split(",")[0]} ➔ {s.destination.split(",")[0]}</p>
                                </div>
                              </div>

                              {/* PnL Indicator bar */}
                              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <div className="flex space-x-4">
                                  <div>
                                    <span className="text-[10px] text-slate-400 block uppercase">NAVLUN (Gelir)</span>
                                    <span className="font-mono font-bold text-xs text-slate-800 dark:text-slate-200">+{s.revenue} {s.currency}</span>
                                  </div>
                                  <div>
                                    <span className="text-[10px] text-slate-400 block uppercase">MALİYETLER (M)</span>
                                    <span className="font-mono font-bold text-xs text-rose-600 dark:text-rose-400">-{totalExpense} {s.currency}</span>
                                  </div>
                                </div>

                                <div className="text-right">
                                  <span className="text-[10px] text-slate-400 block uppercase">NET KÂR</span>
                                  <span className={`font-mono font-bold text-xs ${netProfit >= 500 ? "text-emerald-600 dark:text-emerald-400" : netProfit > 0 ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400"}`}>
                                    {netProfit} {s.currency} ({profitMargin}%)
                                  </span>
                                </div>
                              </div>

                              {/* Small details if selected */}
                              {activeExpShipmentId === s.id && (
                                <div className="mt-3 pt-3 border-t border-dashed border-slate-200 dark:border-slate-805">
                                  <p className="text-[11px] font-bold text-indigo-900 dark:text-indigo-400 mb-1">Masraf Kalemleri (sefer_maliyetleri):</p>
                                  {s.expenses.length === 0 ? (
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 italic">Henüz bu sefere ait bir masraf faturalandırılmadı.</p>
                                  ) : (
                                    <div className="space-y-1">
                                      {s.expenses.map(exp => (
                                        <div key={exp.id} className="flex justify-between items-center text-[10px]">
                                          <span className="text-slate-600 dark:text-slate-450 font-medium">● {exp.type} ({exp.description})</span>
                                          <span className="font-mono text-rose-600 dark:text-rose-400 font-semibold">-{exp.amount} {s.currency}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 font-mono">Araç: {s.plate} | Sürücü: {s.driverName}</p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Quick Expense Booking Form */}
                      <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex flex-col justify-between transition-colors">
                        <div className="space-y-4">
                          <div className="border-b border-slate-200 dark:border-slate-700 pb-2">
                            <h5 className="text-sm font-bold text-slate-900 dark:text-white">2. Sefer Maliyet Girdisi Yap</h5>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Seçili sefere gümrük, otoban, yakıt veya şoför harcırahı giderleri ekleyin.</p>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Seçili Sefer No (FOREIGN KEY)</label>
                            <input 
                              type="text" 
                              disabled 
                              value={activeExpShipmentId} 
                              className="w-full bg-slate-200 dark:bg-slate-805 border border-slate-300 dark:border-slate-700 rounded-lg py-2 px-3 text-xs font-mono text-slate-600 dark:text-slate-400"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Maliyet Tipi</label>
                              <select 
                                value={expType}
                                onChange={(e) => setExpType(e.target.value as any)}
                                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg py-1.5 px-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                              >
                                <option value="Yakit" className="dark:bg-slate-900">Yakıt (Mazot)</option>
                                <option value="Otoban/HGS" className="dark:bg-slate-900">Otoban & HGS</option>
                                <option value="Harciirah" className="dark:bg-slate-900">Sürücü Harcırahı</option>
                                <option value="Gumruk" className="dark:bg-slate-900">Gümrük Komisyonu</option>
                                <option value="Demuraj" className="dark:bg-slate-900">Demuraj Bedeli</option>
                                <option value="Diger" className="dark:bg-slate-900">Diğer Masraf</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Meblağ</label>
                              <input 
                                type="number" 
                                value={expAmount}
                                onChange={(e) => setExpAmount(parseInt(e.target.value) || 0)}
                                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg py-1.5 px-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Masraf Belge No / Açıklama</label>
                            <input 
                              type="text" 
                              placeholder="Örn: Shell Fiş No 0192 veya Beyanname" 
                              value={expDesc}
                              onChange={(e) => setExpDesc(e.target.value)}
                              className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={handleAddExpense}
                            className="w-full bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-semibold text-xs py-2 px-4 rounded-lg flex items-center justify-center gap-1.5 transition"
                          >
                            <Plus className="h-4 w-4" />
                            <span>Gideri Sefer Maliyetine Ekle</span>
                          </button>
                        </div>

                        <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-3 border border-amber-200 dark:border-amber-900/30 text-[11px] text-amber-800 dark:text-amber-300 space-y-1.5 mt-4 transition-colors">
                          <h6 className="font-bold flex items-center gap-1">
                            <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                            Lojistik Maliyet Bilinci
                          </h6>
                          <p className="leading-tight">
                            Yukarıdaki listede kâr oranının anlık değiştiğini görebilirsiniz. Gerçek CRM projelerinde, 
                            bu masraf satırları <span className="font-mono bg-amber-100 dark:bg-amber-950/40 px-0.5 rounded">sefer_maliyetleri</span> tablosuna yazılırken, 
                            gider faturaları <span className="font-mono bg-amber-100 dark:bg-amber-950/40 px-0.5 rounded">faturalar_finans</span> tablosuna aktarılır.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* INLINE SIMULATOR 3: FLEET INVENTORY & DISPATCH */}
                  {simMode === "fleet" && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      {/* Left: Driver and Truck States */}
                      <div className="lg:col-span-7 grid grid-cols-2 gap-4">
                        {/* Fleet vehicles list */}
                        <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 p-4 rounded-xl transition-colors">
                          <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-3 flex items-center gap-1">
                            <Truck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" /> Araç Kayıtları
                          </h5>
                          <div className="space-y-2 max-h-[250px] overflow-y-auto">
                            {vehicles.map(v => (
                              <div key={v.id} className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-xs flex justify-between items-center whitespace-nowrap transition-colors">
                                <div>
                                  <p className="font-bold text-slate-800 dark:text-slate-200">{v.plate}</p>
                                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{v.brandModel.split(" ")[0]} ({v.type})</p>
                                </div>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                  v.status === "Musait" 
                                    ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300" 
                                    : "bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300"
                                }`}>
                                  {v.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Drivers list */}
                        <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 p-4 rounded-xl transition-colors">
                          <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-3 flex items-center gap-1">
                            <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Şoför Kayıtları
                          </h5>
                          <div className="space-y-2 max-h-[250px] overflow-y-auto">
                            {drivers.map(d => (
                              <div key={d.id} className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-xs flex justify-between items-center whitespace-nowrap transition-colors">
                                <div>
                                  <p className="font-bold text-slate-800 dark:text-slate-200">{d.fullName}</p>
                                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{d.licenseClass}</p>
                                </div>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                  d.status === "Musait" 
                                    ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300" 
                                    : "bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300"
                                }`}>
                                  {d.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right: Dispatch Action Form */}
                      <div className="lg:col-span-5 bg-slate-900 text-white p-6 rounded-2xl flex flex-col justify-between">
                        <div className="space-y-4">
                          <div className="border-b border-slate-800 pb-2">
                            <h5 className="text-sm font-bold text-white flex items-center gap-1.5">
                              <Sparkles className="h-4 w-4 text-indigo-400" />
                              Özmal Filo & Şoför Atama
                            </h5>
                            <p className="text-xs text-slate-400">Taslak bir sefer siparişine boşta duran çekici ve sürücüyü entegre edin.</p>
                          </div>

                          <div>
                            <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">Sefer İş Emri</label>
                            <select 
                              value={dispatchShipmentId}
                              onChange={(e) => setDispatchShipmentId(e.target.value)}
                              className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                            >
                              {shipments.map(s => (
                                <option key={s.id} value={s.id}>{s.id} ({s.customerName.slice(0, 10)}... | {s.deliveryStatus})</option>
                              ))}
                            </select>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">Araç Çekici</label>
                              <select 
                                value={dispatchPlate}
                                onChange={(e) => setDispatchPlate(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-1.5 px-2 text-xs text-white focus:outline-none"
                              >
                                {vehicles.map(v => (
                                  <option key={v.id} value={v.plate}>{v.plate} ({v.status})</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">Profesyonel Şoför</label>
                              <select 
                                value={dispatchDriverId}
                                onChange={(e) => setDispatchDriverId(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-1.5 px-2 text-xs text-white focus:outline-none"
                              >
                                {drivers.map(d => (
                                  <option key={d.id} value={d.id}>{d.fullName.split(" ")[0]} ({d.status})</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={handleManualDispatch}
                            className="w-full bg-gradient-to-r from-indigo-500 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 text-white font-medium text-xs py-2.5 px-4 rounded-lg transition-all"
                          >
                            Seferi Ataması Yap ve Şoföre Gönder
                          </button>
                        </div>

                        <p className="text-[10px] text-slate-500 italic mt-6 leading-tight">
                          Atama yapıldığında, sürücünün ve aracın sistem durumları otomatik olarak 'Seferde' şeklinde ilişkisel güncellenir.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Core Feature List cards */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Gerekli CRM Modülleri</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    {
                      title: "Müşteri, Tedarikçi & Kontrat",
                      icon: Users,
                      color: "text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950/40",
                      desc: "Tüm gönderici, alıcı ve alt yüklenicilerin iletişim kayıtları ile anlaşma fiyat matrislerinin depolandığı modül."
                    },
                    {
                      title: "Navlun Değerleme & Teklif",
                      icon: FileSpreadsheet,
                      color: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40",
                      desc: "Rota uzunluğu, deniz mili, hacimsel tonaj bazlı otomatik teklif mekanizmaları ve revizyon durum takipleri."
                    },
                    {
                      title: "Sipariş & Gümrük Operasyon",
                      icon: Briefcase,
                      color: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/40",
                      desc: "Plaka atama, transit gümrük (T1, T2 belgeleri), ordino onayı ve CMR taşıma belgesi hazırlama süreçleri."
                    },
                    {
                      title: "Özmal Araç & Sürücü Filosu",
                      icon: Truck,
                      color: "text-sky-600 bg-sky-50 dark:text-sky-400 dark:bg-sky-950/40",
                      desc: "TÜVTÜRK muayeneleri, şoför pasaport vizeleri, SRC belgeleri, anlık rota takipleri ve HGS limit yönetimleri."
                    },
                    {
                      title: "Maliyet Analizi & Harcırahlar",
                      icon: DollarSign,
                      color: "text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/40",
                      desc: "Özmal veya alt yüklenici tır giderleri, mazot fişleri, şoförün otoban harcamaları ve günlük sefer yolluk girişleri."
                    },
                    {
                      title: "Finansal Analitik & Fatura",
                      icon: TrendingUp,
                      color: "text-violet-600 bg-violet-50 dark:text-violet-400 dark:bg-violet-950/40",
                      desc: "KDV tevkifat oranları, dövizli navlun fatura dönüşümleri, cari hesap mutabakat panoları."
                    }
                  ].map((f, i) => {
                    const Icon = f.icon;
                    return (
                      <div key={i} className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-xs transition duration-200">
                        <div className={`p-3 rounded-lg inline-block ${f.color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <h4 className="text-base font-bold text-slate-950 dark:text-white mt-4">{f.title}</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">{f.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: DATABASE SCHEMAS & ORM */}
          {activeTab === "database" && (
            <motion.div
              key="database-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              {/* Header explanation */}
              <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">PostgreSQL İlişkisel Lojistik Veri Şeması</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Lojistik CRM projelerinde ilişkisel bütünlüğü (Referential Integrity) korumak için tasarlanmış resmi Postgres şeması:</p>
              </div>

              {/* Main Layout containing Schema Sidebar and Code Display */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Visual Schema Navigation Sidebar */}
                <div className="lg:col-span-4 space-y-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Veritabanı Tabloları</span>
                  <div className="space-y-1.5">
                    {standardDatabaseSchemas.map(t => (
                      <button
                        key={t.tableName}
                        onClick={() => {
                          setSelectedTable(t.tableName);
                          setAiGeneratedSchema(null);
                        }}
                        className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition ${
                          selectedTable === t.tableName && !aiGeneratedSchema
                            ? "bg-slate-950 dark:bg-indigo-950/40 border-slate-950 dark:border-indigo-800 text-white dark:text-indigo-300 shadow-md" 
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-250"
                        }`}
                      >
                        <div className="truncate pr-2">
                          <p className="font-mono text-sm font-bold">CREATE TABLE {t.tableName}</p>
                        </div>
                        <ChevronRight className={`h-4 w-4 shrink-0 opacity-60 ${selectedTable === t.tableName && !aiGeneratedSchema ? "text-indigo-400" : "text-slate-500"}`} />
                      </button>
                    ))}
                  </div>

                  {/* AI Schema Generator Input box */}
                  <div className="bg-gradient-to-tr from-indigo-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 border border-indigo-200 dark:border-slate-800 p-4 rounded-xl space-y-3 shadow-xs transition-colors">
                    <span className="text-xs font-bold text-indigo-950 dark:text-indigo-300 uppercase tracking-wider block flex items-center gap-1">
                      <Sparkles className="h-4 w-4 text-indigo-700 dark:text-indigo-400 animate-pulse" />
                      Yapay Zeka ile Şema Genişlet
                    </span>
                    <p className="text-[11px] text-indigo-800 dark:text-slate-300 leading-tight">
                      Lojistik şirketinize özel ek modül tabloları (örneğin "gumruk_beyannameleri" veya "depo_stok_durumu") eklemek veya şemayı özelleştirmek için buraya yazın:
                    </p>
                    <textarea
                      placeholder="Örn: Sürücülerin vize, pasaport başvuruları için 'surucu_vizeleri' tablosu ekle ve 'suruculer' ile ilişkilendir."
                      value={customTablePrompt}
                      onChange={(e) => setCustomTablePrompt(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-indigo-300 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 max-h-24 min-h-[60px]"
                    />
                    <button
                      type="button"
                      disabled={isGeneratingSchema || !customTablePrompt}
                      onClick={handleGenerateSchemaWithAI}
                      className="w-full bg-indigo-700 hover:bg-indigo-800 disabled:bg-indigo-400 text-white font-bold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition shadow-xs"
                    >
                      {isGeneratingSchema ? "Yapay Zeka Hazırlıyor..." : "Şemayı Yapay Zeka ile Güncelle"}
                    </button>
                    {schemaError && (
                      <p className="text-[10px] text-red-600 dark:text-red-400 pt-1">{schemaError}</p>
                    )}
                  </div>
                </div>

                {/* SQL and Drizzle Display Code Area */}
                <div className="lg:col-span-8 space-y-4">
                  {isGeneratingSchema ? (
                    <div className="bg-slate-900 text-slate-300 rounded-2xl p-12 border border-slate-800 flex flex-col items-center justify-center space-y-4 h-[550px]">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                      <p className="font-semibold text-white">Yapay Zeka Mimarı Lojistik Şemasını Tasarlıyor...</p>
                      <p className="text-xs text-slate-400 max-w-sm text-center">İlişkiler optimize ediliyor, PRIMARY/FOREIGN KEY bağlantıları kuruluyor ve Drizzle ORM karşılığı programlanıyor.</p>
                    </div>
                  ) : aiGeneratedSchema ? (
                    //* AI Generated Schema Result Show *//
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors"
                    >
                      <div className="bg-indigo-900 text-white px-5 py-4 flex items-center justify-between">
                        <div>
                          <span className="bg-indigo-500 text-white text-[10px] uppercase font-extrabold tracking-widest px-2.5 py-0.5 rounded-full">Yapay Zeka Tasarımı</span>
                          <h4 className="text-base font-bold mt-1">Özelleştirilmiş Veritabanı Şeması</h4>
                        </div>
                        <button
                          onClick={() => setAiGeneratedSchema(null)}
                          className="text-xs text-indigo-200 hover:text-white underline font-semibold"
                        >
                          Standart Şemaya Dön
                        </button>
                      </div>

                      <div className="p-5 space-y-6">
                        <div className="bg-indigo-50/50 dark:bg-indigo-950/25 rounded-lg p-3.5 border border-indigo-100 dark:border-indigo-900/30">
                          <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">Açıklama & İlişkiler</h5>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">{aiGeneratedSchema.explanation}</p>
                          {aiGeneratedSchema.relationships && (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {aiGeneratedSchema.relationships.map((rel: string, idx: number) => (
                                <span key={idx} className="bg-indigo-100 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-300 text-[10px] py-0.5 px-2 rounded-md font-mono">{rel}</span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-t-lg transition-colors">
                              <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">PostgreSQL DDL SQL</span>
                              <button 
                                onClick={() => handleCopy(aiGeneratedSchema.sql, "aisql")}
                                className="text-xs flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                              >
                                {copiedText["aisql"] ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-1.5-3" />}
                                <span>{copiedText["aisql"] ? "Kopyalandı!" : "Kopyala"}</span>
                              </button>
                            </div>
                            <pre className="bg-slate-900 p-4 rounded-b-lg text-xs font-mono text-emerald-400 overflow-x-auto max-h-[250px] shadow-inner">
                              {aiGeneratedSchema.sql}
                            </pre>
                          </div>

                          {aiGeneratedSchema.drizzle && (
                            <div>
                              <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-t-lg transition-colors">
                                <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">Drizzle ORM TypeScript Kodları</span>
                                <button 
                                  onClick={() => handleCopy(aiGeneratedSchema.drizzle, "aidrizzle")}
                                  className="text-xs flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                >
                                  {copiedText["aidrizzle"] ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-1.5-3" />}
                                  <span>{copiedText["aidrizzle"] ? "Kopyalandı!" : "Kopyala"}</span>
                                </button>
                              </div>
                              <pre className="bg-slate-900 p-4 rounded-b-lg text-xs font-mono text-indigo-300 overflow-x-auto max-h-[250px] shadow-inner">
                                {aiGeneratedSchema.drizzle}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    //* Standard Static Tables Show *//
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
                    >
                      {/* Active table info banner */}
                      {standardDatabaseSchemas.filter(t => t.tableName === selectedTable).map((table) => {
                        // Generate copyable standard DDL block
                        const ddlCode = `CREATE TABLE ${table.tableName} (\n` +
                          table.columns.map(col => `  ${col.name} ${col.type}${col.constraints ? " " + col.constraints : ""}`).join(",\n") +
                          "\n);";

                        // Generate copyable standard Drizzle model
                        const drizzleModel = `export const ${table.tableName} = pgTable('${table.tableName}', {\n` +
                          table.columns.map(col => {
                            let typeFunc = `text('${col.name}')`;
                            if (col.type.startsWith("serial")) typeFunc = `serial('${col.name}').primaryKey()`;
                            else if (col.type.startsWith("integer")) typeFunc = `integer('${col.name}')`;
                            else if (col.type.startsWith("numeric")) typeFunc = `numeric('${col.name}', { precision: 15, scale: 2 })`;
                            else if (col.type.startsWith("timestamp")) typeFunc = `timestamp('${col.name}').defaultNow()`;
                            else if (col.type.startsWith("date")) typeFunc = `date('${col.name}')`;
                            return `  ${col.name}: ${typeFunc}${col.constraints && col.constraints.includes("NOT NULL") ? ".notNull()" : ""}`;
                          }).join(",\n") +
                          "\n});";

                        return (
                          <div key={table.tableName}>
                            <div className="bg-slate-950 text-white px-5 py-4 flex items-center justify-between">
                              <div>
                                <h4 className="text-base font-mono font-bold">CREATE TABLE {table.tableName}</h4>
                                <p className="text-xs text-slate-400 mt-0.5">{table.description}</p>
                              </div>
                              <span className="bg-indigo-950 text-indigo-300 border border-indigo-900 text-xs px-3 py-1 rounded-full font-mono font-medium">
                                Postgres
                              </span>
                            </div>

                            {/* Tables details grid */}
                            <div className="p-5 space-y-6">
                              <div>
                                <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-3">Kolon Detayları</h5>
                                <div className="overflow-x-auto">
                                  <table className="w-full text-slate-700 dark:text-slate-350 border-collapse">
                                    <thead>
                                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 text-[11px] uppercase text-left">
                                        <th className="pb-2 font-semibold">Kolon Adı</th>
                                        <th className="pb-2 font-semibold">Veri Tipi</th>
                                        <th className="pb-2 font-semibold">Kısıtlamalar</th>
                                        <th className="pb-2 font-semibold">Lojistik İşlevi & Açıklaması</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-mono">
                                      {table.columns.map((col, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                          <td className="py-2.5 font-bold text-indigo-950 dark:text-indigo-400">{col.name}</td>
                                          <td className="py-2.5 text-emerald-700 dark:text-emerald-400">{col.type}</td>
                                          <td className="py-2.5 text-slate-500 dark:text-slate-400 text-[10px]">{col.constraints || "-"}</td>
                                          <td className="py-2.5 text-slate-600 dark:text-slate-350 font-sans">{col.description}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                              {/* Action Codes Tab */}
                              <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                                <div>
                                  <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-t-lg transition-colors">
                                    <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">Üretim SQL Kodu (Geçerli PostgreSQL)</span>
                                    <button 
                                      onClick={() => handleCopy(ddlCode, "stdsql")}
                                      className="text-xs flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                    >
                                      {copiedText["stdsql"] ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-1.5-3" />}
                                      <span>{copiedText["stdsql"] ? "Kopyalandı!" : "Kopyala"}</span>
                                    </button>
                                  </div>
                                  <pre className="bg-slate-900 p-4 rounded-b-lg text-xs font-mono text-emerald-400 overflow-x-auto shadow-inner max-h-[180px]">
                                    {ddlCode}
                                  </pre>
                                </div>

                                <div>
                                  <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-t-lg transition-colors">
                                    <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">Drizzle Schema TypeScript Kodu</span>
                                    <button 
                                      onClick={() => handleCopy(drizzleModel, "stddrizzle")}
                                      className="text-xs flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                    >
                                      {copiedText["stddrizzle"] ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-1.5-3" />}
                                      <span>{copiedText["stddrizzle"] ? "Kopyalandı!" : "Kopyala"}</span>
                                    </button>
                                  </div>
                                  <pre className="bg-slate-900 p-4 rounded-b-lg text-xs font-mono text-indigo-400 overflow-x-auto shadow-inner max-h-[180px]">
                                    {drizzleModel}
                                  </pre>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: GITHUB PUBLISHER (README MAKER) */}
          {activeTab === "github" && (
            <motion.div
              key="github-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              {/* Header explanation */}
              <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">GitHub'da Yayınlama ve Dosya Düzeni</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Lojistik CRM programınızı bir yazılım mühendisi gibi GitHub'a göndermek için gerekli olan yapıyı kurun:</p>
              </div>

              {/* Layout: Sidebar recommended folders & live compiler output README */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Visual directory structure diagram */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-slate-950 text-white p-5 rounded-2xl border border-slate-800 shadow-md">
                    <span className="text-xs font-extrabold tracking-widest text-indigo-400 uppercase">Önerilen GitHub Klasör Ağacı</span>
                    <p className="text-[11px] text-slate-400 mt-0.5 mb-4">Lojistik projenizdeki dosyaları aşağıdaki gibi dizinleyebilirsiniz:</p>
                    <pre className="font-mono text-xs text-indigo-200 overflow-x-auto leading-relaxed border-t border-slate-900 pt-3 max-h-[380px]">
                      {recommendGithubFolderStructure}
                    </pre>
                    <div className="flex justify-end mt-4">
                      <button
                        onClick={() => handleCopy(recommendGithubFolderStructure, "tree")}
                        className="text-xs flex items-center gap-1.5 bg-slate-900 hover:bg-slate-850 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300 transition"
                      >
                        {copiedText["tree"] ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                        <span>{copiedText["tree"] ? "Kopyalandı!" : "Dizin Şemasını Kopyala"}</span>
                      </button>
                    </div>
                  </div>

                  {/* GitHub configurations form */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4 shadow-xs transition-colors">
                    <h5 className="text-sm font-bold text-slate-900 dark:text-white">GitHub README.md Sihirbazı</h5>
                    
                    <div>
                      <label className="block text-xs font-medium text-slate-705 text-slate-700 dark:text-slate-300 mb-1">GitHub Depo Adı (Repository Name)</label>
                      <input 
                        type="text" 
                        value={githubAppName}
                        onChange={(e) => setGithubAppName(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 text-xs font-mono rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white transition-colors"
                      />
                    </div>

                    <div>
                      <span className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Dahil Edilen Modüller</span>
                      <div className="space-y-1.5 max-h-36 overflow-y-auto border border-slate-100 dark:border-slate-800 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 transition-colors">
                        {[
                          "Müşteri & Tedarikçi Yönetimi",
                          "Fiyatlandırma & Navlun Teklifleri",
                          "Sipariş & Operasyon Yönetimi",
                          "Sefer & Filo Yönetimi",
                          "Finansal Takip & Faturalandırma",
                          "Demuraj & Konteyner Takibi",
                          "Gümrük Evrak Barkodlama"
                        ].map(mod => {
                          const isChecked = selectedModulesForReadme.includes(mod);
                          return (
                            <label key={mod} className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={isChecked} 
                                onChange={() => {
                                  if (isChecked) {
                                    setSelectedModulesForReadme(prev => prev.filter(m => m !== mod));
                                  } else {
                                    setSelectedModulesForReadme(prev => [...prev, mod]);
                                  }
                                }}
                                className="rounded text-indigo-600 focus:ring-indigo-500 dark:bg-slate-900 dark:border-slate-700" 
                              />
                              <span>{mod}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isGeneratingReadme}
                      onClick={handleGenerateReadmeWithAI}
                      className="w-full bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-white hover:shadow-xs font-semibold text-xs py-2.5 px-4 rounded-lg flex items-center justify-center gap-1.5 transition"
                    >
                      <Sparkles className="h-4 w-4 text-indigo-400 dark:text-indigo-600" />
                      <span>{isGeneratingReadme ? "GitHub README Üretiliyor..." : "Profesyonel README.md Üret"}</span>
                    </button>
                    {readmeError && (
                      <p className="text-[10px] text-red-600 dark:text-red-400 font-medium">{readmeError}</p>
                    )}
                  </div>
                </div>

                {/* Right: README show code or steps */}
                <div className="lg:col-span-7">
                  {isGeneratingReadme ? (
                    <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 flex flex-col items-center justify-center space-y-4 h-[550px] shadow-sm transition-colors">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 dark:border-white"></div>
                      <p className="font-semibold text-slate-905 text-slate-900 dark:text-white">Profesyonel GitHub README.md Yazılıyor...</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm text-center">Modüller, veritabanı şemaları, kurulum adımları ve lojistik teknolojileri dokümante edilmektedir.</p>
                    </div>
                  ) : aiGeneratedReadme ? (
                    //* AI Generated README block *//
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
                    >
                      <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
                        <div>
                          <span className="bg-indigo-600 text-white text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full">Yayın Hazır</span>
                          <h4 className="text-sm font-bold mt-1">Özelleştirilmiş README.md Dosyası</h4>
                        </div>
                        <button
                          onClick={() => handleCopy(aiGeneratedReadme, "aireadme")}
                          className="bg-slate-850 hover:bg-slate-850 border border-slate-800 text-xs text-white px-3 py-1.5 rounded-lg flex items-center gap-1 transition"
                        >
                          {copiedText["aireadme"] ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                          <span>{copiedText["aireadme"] ? "Kopyalandı!" : "Metni Kopyala"}</span>
                        </button>
                      </div>
                      <div className="p-5 overflow-y-auto max-h-[500px]">
                        <div className="prose prose-sm max-w-none text-slate-705 text-slate-700 dark:text-slate-200 leading-relaxed space-y-4 bg-slate-50 dark:bg-slate-950 p-6 rounded-xl border border-slate-100 dark:border-slate-800/80 font-sans whitespace-pre-wrap">
                          {aiGeneratedReadme}
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    //* Default README/Steps instructions *//
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-sm transition-colors">
                      <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                        <h4 className="text-base font-bold text-slate-950 dark:text-white flex items-center gap-1.5">
                          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                          GitHub Yayınlama Adımları
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Lokalde tasarladığınız bu lojistik CRM programını sıfırdan GitHub reposuna göndermek için rehber:</p>
                      </div>

                      <div className="space-y-4 text-xs">
                        {[
                          {
                            step: "1. Repozitör Oluşturun",
                            text: "GitHub hesabınıza giderek yeni (New) bir repozitör oluşturun. Reponun ismini 'lojistik-crm' yapabilirsiniz. README veya .gitignore seçmeyin, bunları lokalde hazırlayacağız."
                          },
                          {
                            step: "2. Lokalde Git Projesi Başlatın",
                            text: "Bilgisayarınızda terminal açın, projenizin bulunduğu kök klasöre girerek sırasıyla şu komutları çalıştırıp Git'i aktive edin:",
                            cmd: "git init\ngit add .\ngit commit -m 'ilk lojistik crm tasarimi'"
                          },
                          {
                            step: "3. Uzak Depoyu Tanımlayın",
                            text: "Uzakta açtığınız GitHub reposunu lokalinizdeki kod ile eşleştirin:",
                            cmd: `git remote add origin https://github.com/KULLANICI_ADINIZ/${githubAppName}.git\ngit branch -M main`
                          },
                          {
                            step: "4. Kodu GitHub'a Gönderin",
                            text: "Son olarak projenizi ana dalda (main) buluta yükleyin. Bu işlemden sonra projeniz tüm dünya ile paylaşılmış olur!",
                            cmd: "git push -u origin main"
                          }
                        ].map((item, idx) => (
                          <div key={idx} className="space-y-1.5">
                            <h5 className="font-bold text-slate-900 dark:text-slate-100">{item.step}</h5>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{item.text}</p>
                            {item.cmd && (
                              <pre className="bg-slate-900 p-3 rounded-lg text-indigo-300 dark:text-indigo-400 font-mono text-[11px] overflow-x-auto whitespace-pre">
                                {item.cmd}
                              </pre>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="bg-indigo-50 dark:bg-slate-950 border border-indigo-100 dark:border-slate-800/85 rounded-xl p-4 flex items-start space-x-3 text-xs leading-relaxed text-indigo-950 dark:text-indigo-300 mt-4 transition-colors">
                        <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-indigo-950 dark:text-indigo-200">Yardımcı İpucu:</p>
                          <p className="text-slate-700 dark:text-slate-305 dark:text-slate-300 mt-1">
                            Soldaki sihirbazı kullanarak hazırladığınız veritabanı tablolarına uygun professional bir <strong>README.md</strong> üretebilirsiniz. 
                            Üretilen içeriği kopyalayarak projenizin kök dizinine README.md adıyla kaydettikten sonra git push yaparsanız, GitHub profilinizde harika 
                            bir proje sunumu sergilenecektir!
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: AI SYSTEM ADVISOR CHAT */}
          {activeTab === "advisor" && (
            <motion.div
              key="advisor-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Header explanation */}
              <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Lojistik Yazılım Mimarı (Duyarlı AI Danışmanı)</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Filo operasyonları, nakliye teklif algoritmaları, Drizzle/Prisma veri modeli sorunları ve entegrasyonlar için anlık danışın:</p>
              </div>

              {/* Chat Panel and Quick Questions */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Popular click-to-ask questions */}
                <div className="lg:col-span-4 space-y-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Sık Sorulan Sorular (Lojistik)</span>
                  <div className="space-y-2">
                    {[
                      "FTL ve LTL sevkiyatları veritabanında nasıl ayrlaştırılır?",
                      "Lojistik faturalarında KDV muafiyeti ve tevkifatı nasıl işlenmeli?",
                      "Konum takibi için IoT veya GPS verilerini nasıl şemalandırabilirim?",
                      "Tedarikçi ve Müşteri cari hesaplarını tek tabloda mı tutmalıyım?",
                      "Sefer maliyet analizi (Fuel Indexing) lojistik programında nasıl formüle edilir?"
                    ].map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuickQuestionClick(q)}
                        className="w-full text-left p-3 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-350 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-xs text-slate-700 dark:text-slate-350 leading-snug transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>

                  <div className="bg-slate-100 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1.5 transition-colors">
                    <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <Info className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                      Mimar Notu
                    </p>
                    <p className="leading-relaxed">
                      Lojistik ERP tabanlı veritabanı kurgularında en kritik konu ilişkilerin kurgulanmasıdır. 
                      Yabancı anahtarların <span className="font-mono bg-slate-200 dark:bg-slate-805 dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-1 rounded">ON DELETE CASCADE</span> yerine 
                      <span className="font-mono bg-slate-200 dark:bg-slate-805 dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-1 rounded">SET NULL</span> olarak tanımlanması veri kayıplarını engellemek için hayati önem taşır.
                    </p>
                  </div>
                </div>

                {/* AI Chat Area */}
                <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden h-[540px] flex flex-col justify-between transition-colors">
                  
                  {/* Message stream panel */}
                  <div className="p-5 overflow-y-auto flex-1 space-y-4">
                    {messages.map((m, idx) => (
                      <div 
                        key={idx} 
                        className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`max-w-[85%] rounded-xl p-4 text-xs leading-relaxed ${
                          m.role === "user" 
                            ? "bg-indigo-600 text-white font-medium" 
                            : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                        }`}>
                          <p className="font-bold mb-1 uppercase tracking-wider text-[9px] opacity-75">
                            {m.role === "user" ? "Siz" : "Lojistik Çözüm Mimarı (Gemini)"}
                          </p>
                          <div className="whitespace-pre-line font-sans">
                            {m.text}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {isSendingMessage && (
                      <div className="flex justify-start">
                        <div className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl p-4 text-xs flex items-center space-x-2">
                          <span className="animate-bounce">●</span>
                          <span className="animate-bounce [animation-delay:0.2s]">●</span>
                          <span className="animate-bounce [animation-delay:0.4s]">●</span>
                          <span>Mimari Çözüm Yazılıyor...</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Message Input submit bar */}
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAskArchitect();
                    }}
                    className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center gap-2 transition-colors"
                  >
                    <input 
                      type="text" 
                      placeholder="Sorunuzu buraya yazın (Örn: Lojistik CMR projesine SMS api entegrasyonu nasıl tasarlanır?)" 
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-4 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={isSendingMessage || !userInput.trim()}
                      className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold text-xs py-2.5 px-4 rounded-xl transition shadow-xs shrink-0"
                    >
                      Gönder
                    </button>
                  </form>

                </div>

              </div>
            </motion.div>
          )}

        </AnimatePresence>

      </main>

      {/* Modern Compact Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 mt-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-500 dark:text-slate-400 text-xs">
          <p>Lojistik CRM Geliştirme, Veritabanı Şemalandırma ve GitHub Yayınlama Portalı © 2026</p>
          <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">Bu uygulama Gemini-3.5-Flash model yapay zeka altyapısı ile donatılmıştır.</p>
        </div>
      </footer>
    </div>
  );
}
