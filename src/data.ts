/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Customer, Driver, Vehicle, Shipment, TableSchema } from "./types";

export const initialCustomers: Customer[] = [
  {
    id: "CUST-001",
    name: "Arçelik A.Ş.",
    contactPerson: "Ahmet Yılmaz",
    email: "ahmet.yilmaz@arcelik.com",
    phone: "+90 532 111 22 33",
    taxNumber: "0810023456",
    taxOffice: "Ataşehir Vergi Dairesi",
    type: "hem_gonderici_hem_alici",
    balance: -4500,
    currency: "EUR"
  },
  {
    id: "CUST-002",
    name: "Vestel Ticaret A.Ş.",
    contactPerson: "Mehmet Demir",
    email: "mehmet.demir@vestel.com",
    phone: "+90 533 444 55 66",
    taxNumber: "9250012345",
    taxOffice: "Ege Kurumlar V.D.",
    type: "gonderici",
    balance: 12500,
    currency: "USD"
  },
  {
    id: "CUST-003",
    name: "Omsan Lojistik (Tedarikçi)",
    contactPerson: "Burak Soylu",
    email: "bsoylu@omsan.com.tr",
    phone: "+90 216 555 77 88",
    taxNumber: "6410098765",
    taxOffice: "Tuzla Vergi Dairesi",
    type: "tedarikci",
    balance: -8000,
    currency: "TRY"
  },
  {
    id: "CUST-004",
    name: "Şişecam Kimyasallar",
    contactPerson: "Fatma Aslan",
    email: "faslan@sisecam.com",
    phone: "+90 505 123 45 67",
    taxNumber: "8123456789",
    taxOffice: "Beşiktaş V.D.",
    type: "gonderici",
    balance: 0,
    currency: "EUR"
  }
];

export const initialDrivers: Driver[] = [
  {
    id: "DRV-001",
    fullName: "Mustafa Kaplan",
    idNumber: "12345678901",
    phone: "+90 542 999 88 77",
    licenseClass: "CE (Tır)",
    status: "Seferde"
  },
  {
    id: "DRV-002",
    fullName: "Süleyman Aksoy",
    idNumber: "98765432102",
    phone: "+90 535 888 77 66",
    licenseClass: "CE (Tır)",
    status: "Musait"
  },
  {
    id: "DRV-003",
    fullName: "Hasan Polat",
    idNumber: "45612378903",
    phone: "+90 531 666 55 44",
    licenseClass: "D1 (Kamyon)",
    status: "Musait"
  }
];

export const initialVehicles: Vehicle[] = [
  {
    id: "VEH-001",
    plate: "34 LOJ 999",
    brandModel: "Mercedes-Benz Actros 1845",
    type: "Tir",
    status: "Seferde",
    inspectionDate: "2026-09-15"
  },
  {
    id: "VEH-002",
    plate: "35 CRM 101",
    brandModel: "Volvo FH 500",
    type: "Tir",
    status: "Musait",
    inspectionDate: "2026-11-20"
  },
  {
    id: "VEH-003",
    plate: "06 LGT 424",
    brandModel: "Scania R 450",
    type: "Tir",
    status: "Musait",
    inspectionDate: "2026-05-18"
  }
];

export const initialShipments: Shipment[] = [
  {
    id: "SEF-2026-1024",
    offerId: "TEK-2026-01",
    customerId: "CUST-002",
    customerName: "Vestel Ticaret A.Ş.",
    origin: "Manisa, Türkiye",
    destination: "Hamburg, Almanya",
    cargoType: "FTL",
    cargoDetails: "Beyaz Eşya - 33 Palet",
    weight: 18500,
    volume: 86,
    packagesCount: 33,
    plate: "34 LOJ 999",
    driverId: "DRV-001",
    driverName: "Mustafa Kaplan",
    deliveryStatus: "Yolda",
    revenue: 4200,
    currency: "EUR",
    expenses: [
      { id: "EXP-1", type: "Yakit", amount: 1100, currency: "EUR", description: "Viyana Shell Yakıt Alımı" },
      { id: "EXP-2", type: "Otoban/HGS", amount: 350, currency: "EUR", description: "Bulgaristan & Macaristan Otoban Ücretleri" },
      { id: "EXP-3", type: "Harciirah", amount: 250, currency: "EUR", description: "Mustafa Kaplan Yolluk" }
    ],
    notes: "Kapıkule sınır kapısı yoğunluğuna bağlı olarak teslimat 1 gün gecikebilir."
  },
  {
    id: "SEF-2026-1025",
    offerId: "TEK-2026-02",
    customerId: "CUST-001",
    customerName: "Arçelik A.Ş.",
    origin: "Çayırova, Kocaeli",
    destination: "Lyon, Fransa",
    cargoType: "LTL",
    cargoDetails: "Elektronik Kart ve Ankastre Fırın Grubu",
    weight: 4200,
    volume: 18,
    packagesCount: 12,
    plate: "Serbest Plaka (Tedarikçi)",
    driverId: "DRV-003",
    driverName: "Hasan Polat",
    deliveryStatus: "Gümrükte",
    revenue: 1800,
    currency: "EUR",
    expenses: [
      { id: "EXP-4", type: "Gumruk", amount: 200, currency: "EUR", description: "Erenköy Gümrük Beyanname İşlemleri" },
      { id: "EXP-5", type: "Harciirah", amount: 150, currency: "EUR", description: "Şoför Harcırahı" }
    ],
    notes: "Fransa gümrük operasyonu takip edilmektedir."
  }
];

export const standardDatabaseSchemas: TableSchema[] = [
  {
    tableName: "musteriler",
    description: "Cari hesap yönetiminde kullanılan ve ticari tarafları (Gönderici, Alıcı, Nakliyeci/Yükleyici, Tedarikçi) kaydeden temel tablo.",
    columns: [
      { name: "id", type: "serial", constraints: "PRIMARY KEY", description: "Tablonun birincil anahtarı, otomatik artan benzersiz ID." },
      { name: "unvan", type: "varchar(255)", constraints: "NOT NULL", description: "Firmanın tam resmi ticari unvanı." },
      { name: "yetkili_ad_soyad", type: "varchar(100)", description: "İletişim kurulacak ana yetkili kişinin bilgisi." },
      { name: "email", type: "varchar(150)", constraints: "UNIQUE", description: "Resmi e-posta adresi (teklif gönderimleri için)." },
      { name: "telefon", type: "varchar(50)", description: "Yetkili veya ofis telefon numarası." },
      { name: "vergi_dairesi", type: "varchar(100)", description: "Firmanın kayıtlı olduğu vergi dairesi." },
      { name: "vergi_no", type: "varchar(20)", constraints: "UNIQUE", description: "Şirket vergi kimlik numarası (10 basamaklı) veya TC Kimlik no." },
      { name: "cari_tipi", type: "varchar(30)", constraints: "DEFAULT 'gonderici'", description: "Cari kartın kategorisi: 'gonderici', 'alici', 'tedarikci', 'hem_gonderici_hem_alici'." },
      { name: "bakiye", type: "numeric(15,2)", constraints: "DEFAULT 0.00", description: "Hesabın güncel finansal bakiyesi." },
      { name: "para_birimi", type: "varchar(3)", constraints: "DEFAULT 'TRY'", description: "Cari hesabın varsayılan döviz cinsi (TRY, EUR, USD)." },
      { name: "created_at", type: "timestamp", constraints: "DEFAULT now()", description: "Kartın oluşturulduğu zaman damgası." }
    ]
  },
  {
    tableName: "teklifler",
    description: "Lojistik süreçlerin ilk aşaması olan navlun tekliflerini saklayan tablo. Kara, Hava, Deniz veya Demiryolu taşımacılığı için esnek fiyatlandırma verilerini tutar.",
    columns: [
      { name: "id", type: "serial", constraints: "PRIMARY KEY", description: "Teklif benzersiz kimlik numarası." },
      { name: "musteri_id", type: "integer", constraints: "REFERENCES musteriler(id)", description: "Teklifin sunulduğu müşteri cari kartına bağlanan yabancı anahtar." },
      { name: "cikis_yeri", type: "text", constraints: "NOT NULL", description: "Sevkiyatın başlayacağı adres, şehir veya liman." },
      { name: "varis_yeri", type: "text", constraints: "NOT NULL", description: "Sevkiyatın tamamlanacağı teslim adresi, gümrük noktası veya liman." },
      { name: "tasima_kategorisi", type: "varchar(20)", description: "Taşıma türü: 'Kara', 'Deniz', 'Hava', 'Demiryolu'." },
      { name: "yukleme_tipi", type: "varchar(10)", description: "Yükleme biçimi: 'FTL' (Tam Kamyon), 'LTL' (Parsiyel), 'FCL' (Tam Konteyner), 'LCL' (Grupaj Deniz)." },
      { name: "navlun_fiyati", type: "numeric(12,2)", constraints: "NOT NULL", description: "Müşteriye teklif edilen navlun bedeli." },
      { name: "para_birimi", type: "varchar(3)", constraints: "DEFAULT 'EUR'", description: "Teklif döviz cinsi (EUR, USD, TRY)." },
      { name: "gecerlilik_tarihi", type: "date", description: "Navlun fiyatının geçerli olduğu son gün." },
      { name: "durum", type: "varchar(20)", constraints: "DEFAULT 'Beklemede'", description: "Teklif onay durumu: 'Beklemede', 'Onaylandı', 'Reddedildi', 'Revize Edildi'." },
      { name: "olusturan_personel_id", type: "integer", description: "Teklifi hazırlayan satış temsilcisinin sistem ID'si." }
    ]
  },
  {
    tableName: "siparisler_operasyon",
    description: "Onaylanan tekliflerin operasyona dönüştürüldüğü, taşımanın asıl detaylarını (plaka, hacim, sürücü vb.) takip eden lojistik iş emri tablosudur.",
    columns: [
      { name: "id", type: "serial", constraints: "PRIMARY KEY", description: "Operasyonel sipariş / sefer benzersiz numarası." },
      { name: "teklif_id", type: "integer", constraints: "REFERENCES teklifler(id) ON DELETE SET NULL", description: "Siparişin dayandığı onaylı teklif referansı." },
      { name: "musteri_id", type: "integer", constraints: "REFERENCES musteriler(id)", description: "Yükü hazırlatan müşterinin cari ID'si." },
      { name: "yuk_cinsi_aciklama", type: "text", description: "Yükün ne olduğu (örn. 'Gıda, Paletli Beyaz Eşya, Yanıcı Kimyasal')." },
      { name: "toplam_agirlik_kg", type: "integer", description: "Sevkiyatın toplam brüt ağırlığı (Kg cinsinden)." },
      { name: "toplam_hacim_m3", type: "numeric(8,2)", description: "Sevkiyatın toplam metreküp (m3) hacmi." },
      { name: "kap_adedi", type: "integer", description: "Malzemenin paket veya palet adedi." },
      { name: "arac_plaka", type: "varchar(20)", description: "Taşımayı gerçekleştiren özmal plaka veya tedarikçi tır plakası." },
      { name: "surucu_id", type: "integer", description: "Taşımayı yapan atanmış profesyonel sürücünün ID'si." },
      { name: "teslimat_durumu", type: "varchar(30)", constraints: "DEFAULT 'Taslak'", description: "Canlı teslim durumu: 'Taslak', 'Yüklendi', 'Yolda', 'Gümrükte', 'Teslim Edildi'." },
      { name: "teslim_tarihi", type: "timestamp", description: "Yükün alıcıya güvenli bir şekilde ulaştığı gerçek zaman." }
    ]
  },
  {
    tableName: "filo_araclar",
    description: "Özmal veya sürekli kiralık tır, kamyon, dorse, panelvan araçlarının lojistik kayıtlarını ve durumlarını tutan tablo.",
    columns: [
      { name: "id", type: "serial", constraints: "PRIMARY KEY", description: "Sistem araç kayıt ID'si." },
      { name: "plaka", type: "varchar(20)", constraints: "UNIQUE NOT NULL", description: "Aracın resmi plakası." },
      { name: "marka_model", type: "varchar(100)", description: "Araç çekici / dorse marka ve modeli (örn. Scania S500)." },
      { name: "arac_tipi", type: "varchar(30)", description: "Araç cinsi: 'Çekici', 'Dorse', 'Kamyon', 'Hafif Ticari'." },
      { name: "durum", type: "varchar(20)", constraints: "DEFAULT 'Musait'", description: "Operasyonel müsaitlik durumu: 'Müsait', 'Seferde', 'Bakımda', 'Arızalı'." },
      { name: "vize_tarihi", type: "date", description: "TÜVTÜRK muayene son geçerlilik tarihi." },
      { name: "sigorta_tarihi", type: "date", description: "Kasko ve trafik sigortası son yenileme tarihi." }
    ]
  },
  {
    tableName: "suruculer",
    description: "Taşıma operasyonlarında görev alan tır sürücülerinin kimlik, ehliyet ve çalışma durumları tablosu.",
    columns: [
      { name: "id", type: "serial", constraints: "PRIMARY KEY", description: "Sürücü kayıt ID'si." },
      { name: "ad_soyad", type: "varchar(100)", constraints: "NOT NULL", description: "Sürücünün tam adı." },
      { name: "tc_no", type: "varchar(11)", constraints: "UNIQUE", description: "11 basamaklı T.C. Kimlik Numarası." },
      { name: "telefon", type: "varchar(30)", description: "Sürücüye ulaşılacak GSM hattı numarası." },
      { name: "ehliyet_siniflari", type: "varchar(30)", description: "Sahip olunan ehliyet sınıfları (Örn: C, E, DE, SRC-3, SRC-4, ADR)." },
      { name: "calisma_durumu", type: "varchar(20)", constraints: "DEFAULT 'Musait'", description: "Şoförün müsaitlik hali: 'Müsait', 'Seferde', 'İzinli', 'Raporlu'." },
      { name: "pasaport_gecerlilik", type: "date", description: "Uluslararası seferler için pasaport son vize tarihi." }
    ]
  },
  {
    tableName: "sefer_maliyetleri",
    description: "Bir sefer başına yapılan tüm masrafların (yakıt, otoban, harcırah, gümrük vergileri vs.) girildiği finansal tablo. Trip Profitability/Sefer Kârlılığını hesaplar.",
    columns: [
      { name: "id", type: "serial", constraints: "PRIMARY KEY", description: "Masraf kalemi benzersiz ID'si." },
      { name: "siparis_id", type: "integer", constraints: "REFERENCES siparisler_operasyon(id) ON DELETE CASCADE", description: "Giderin yazıldığı aktif lojistik operasyon sefere bağlanan yabancı anahtar." },
      { name: "maliyet_kat_id", type: "varchar(30)", description: "Gider türü: 'Yakit', 'Otoban/HGS', 'Harciirah', 'Gumruk', 'Demuraj', 'Diger'." },
      { name: "tutar", type: "numeric(12,2)", constraints: "NOT NULL", description: "Ödenen veya tahakkuk eden masraf tutarı." },
      { name: "para_birimi", type: "varchar(3)", constraints: "DEFAULT 'EUR'", description: "Giderin ödendiği para birimi." },
      { name: "belge_no", type: "varchar(50)", description: "Fiş, fatura veya dekont numarası." },
      { name: "aciklama", type: "text", description: "Masraf detayları ve açıklaması." }
    ]
  },
  {
    tableName: "faturalar_finans",
    description: "Müşterilere kesilen resmi gelir faturalarının ve tedarikçilerden gelen gider faturalarının cari hareket izlem tablosu.",
    columns: [
      { name: "id", type: "serial", constraints: "PRIMARY KEY", description: "Fatura fatura izlem no." },
      { name: "siparis_id", type: "integer", constraints: "REFERENCES siparisler_operasyon(id)", description: "Faturanın dayandığı operasyonel nakliye seferi." },
      { name: "cari_id", type: "integer", constraints: "REFERENCES musteriler(id)", description: "Borçlandırılan (müşteri) veya alacaklandırılan (tedarikçi) cari ID." },
      { name: "fatura_yönü", type: "varchar(10)", description: "Faturanın yönü: 'GELIR' (kesilen) veya 'GIDER' (alınan)." },
      { name: "tutar_matrah", type: "numeric(15,2)", constraints: "NOT NULL", description: "KDV hariç vergi matrah tutarı." },
      { name: "kdv_orani", type: "integer", constraints: "DEFAULT 20", description: "Uygulanan KDV oranı yüzdesi (0, 10, 20 vb.)." },
      { name: "vergi_tutar", type: "numeric(15,2)", description: "KDV/Vergi tutarı." },
      { name: "toplam_fatura_tutari", type: "numeric(15,2)", description: "Toplam KDV dahil fatura tutarı." },
      { name: "para_birimi", type: "varchar(3)", constraints: "DEFAULT 'TRY'", description: "Fatura resmi para birimi." },
      { name: "durum", type: "varchar(20)", constraints: "DEFAULT 'Odenmedi'", description: "Faturanın ödeme vaziyeti: 'Ödenmedi', 'Ödendi', 'Kısmi Ödendi', 'İptal'." },
      { name: "fatura_tarihi", type: "date", constraints: "DEFAULT CURRENT_DATE", description: "Faturanın yasal kesim tarihi." }
    ]
  }
];

export const recommendGithubFolderStructure = `
lojistik-crm-projesi/
├── .env                  # Veritabanı ve API anahtarları (Lokalde kalır)
├── .env.example          # Ortam değişkenleri şablonu
├── .gitignore            # Github'a yüklenmeyecek dosyalar (node_modules, .env, dist)
├── package.json          # Node dependencies ve npm betikleri
├── tsconfig.json         # TypeScript konfigürasyonu
├── vite.config.ts        # Vite SPA ve alias ayarları
├── server.ts             # Express & Vite Fullstack sunucu dosyası
├── firestore.rules       # Süreçte Firebase kullanılacaksa güvenlik kuralları
│
├── src/                  # React Front-End Kaynak Kodları
│   ├── main.tsx          # React başlangıç noktası
│   ├── App.tsx           # Ana sarmalayıcı ve navigasyon
│   ├── index.css         # Tailwind CSS ithali ve global sınıflar
│   ├── types.ts          # Tüm lojistik nesnelerinin TypeScript tipleri
│   │
│   ├── db/               # Veritabanı şemaları ve bağlantı dosyaları
│   │   ├── index.ts      # Drizzle veya Prisma bağlantı havuzu (Pool)
│   │   └── schema.ts     # Tabloların (Müşteriler, Teklifler, Seferler) ORM tanımları
│   │
│   ├── components/       # Tekrar kullanılabilir UI Bileşenleri
│   │   ├── Navbar.tsx    # Header ve kullanıcı kartı
│   │   ├── Layout.tsx    # Ekran sarmalayıcı (dashboard şablonu)
│   │   └── UI/           # Ortak UI elementleri (Button, Input, Card)
│   │
│   ├── modules/          # Core Lojistik CRM Modül Sayfaları
│   │   ├── Dashboard.tsx # KPI Panel ve Sefer İzleme Panosu
│   │   ├── Customers.tsx # Müşteri ve Cari Hesap Takibi
│   │   ├── Quotations.tsx# Navlun Fiyatlama ve Teklif Motoru
│   │   ├── Operations.tsx# Sefer & İş Emri Yönetimi
│   │   ├── Fleet.tsx     # Tır Filosu ve Sürücü/Plaka Veritabanı
│   │   └── Finance.tsx   # Fatura Tablosu ve Sefer Maliyet Analiz Kartları
│   │
│   └── utils/            # Yardımcı fonsiyonlar, dosya üreteçleri vb.
`;
