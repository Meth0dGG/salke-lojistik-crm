/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Province {
  name: string;
  coords: [number, number];
  districts: string[];
}

export const TURKEY_PROVINCES: Record<string, Province> = {
  "Adana": {
    name: "Adana",
    coords: [37.0000, 35.3213],
    districts: ["Seyhan", "Çukurova", "Yüreğir", "Sarıçam", "Ceyhan", "Kozan", "İmamoğlu", "Pozantı"]
  },
  "Adıyaman": {
    name: "Adıyaman",
    coords: [37.7644, 38.2762],
    districts: ["Merkez", "Kahta", "Besni", "Gölbaşı", "Gerger", "Samsat", "Çelikhan"]
  },
  "Afyonkarahisar": {
    name: "Afyonkarahisar",
    coords: [38.7569, 30.5433],
    districts: ["Merkez", "Sandıklı", "Dinar", "Bolvadin", "Emirdağ", "Sinanpaşa", "Şuhut"]
  },
  "Ağrı": {
    name: "Ağrı",
    coords: [39.7191, 43.0519],
    districts: ["Merkez", "Doğubayazıt", "Patnos", "Diyadin", "Eleşkirt", "Tutak"]
  },
  "Amasya": {
    name: "Amasya",
    coords: [40.6532, 35.8331],
    districts: ["Merkez", "Merzifon", "Suluova", "Gümüşhacıköy", "Taşova", "Göynücek"]
  },
  "Ankara": {
    name: "Ankara",
    coords: [39.9334, 32.8597],
    districts: ["Çankaya", "Keçiören", "Yenimahalle", "Mamak", "Etimesgut", "Sincan", "Gölbaşı", "Polatlı", "Kahramankazan", "Akyurt", "Pursaklar"]
  },
  "Antalya": {
    name: "Antalya",
    coords: [36.8969, 30.7133],
    districts: ["Muratpaşa", "Kepez", "Konyaaltı", "Alanya", "Manavgat", "Serik", "Kemer", "Kumluca", "Kaş", "Gazipaşa", "Finike"]
  },
  "Artvin": {
    name: "Artvin",
    coords: [41.1828, 41.8194],
    districts: ["Merkez", "Hopa", "Arhavi", "Borçka", "Şavşat", "Yusufeli", "Ardanuç"]
  },
  "Aydın": {
    name: "Aydın",
    coords: [37.8560, 27.8420],
    districts: ["Efeler", "Kuşadası", "Didim", "Nazilli", "Söke", "Germencik", "Çine", "İncirliova"]
  },
  "Balıkesir": {
    name: "Balıkesir",
    coords: [39.6484, 27.8826],
    districts: ["Karesi", "Altıeylül", "Bandırma", "Edremit", "Ayvalık", "Gönen", "Burhaniye", "Susurluk", "Erdek"]
  },
  "Bilecik": {
    name: "Bilecik",
    coords: [40.1426, 29.9793],
    districts: ["Merkez", "Bozüyük", "Osmaneli", "Söğüt", "Pazaryeri", "Gölpazarı"]
  },
  "Bingöl": {
    name: "Bingöl",
    coords: [38.8854, 40.4981],
    districts: ["Merkez", "Genç", "Solhan", "Karlıova", "Adaklı", "Kiğı"]
  },
  "Bitlis": {
    name: "Bitlis",
    coords: [38.4013, 42.1096],
    districts: ["Merkez", "Tatvan", "Ahlat", "Adilcevaz", "Mutki", "Hizan", "Güroymak"]
  },
  "Bolu": {
    name: "Bolu",
    coords: [40.7316, 31.6083],
    districts: ["Merkez", "Gerede", "Mudurnu", "Göynük", "Mengen", "Yeniçağa", "Dörtdivan"]
  },
  "Burdur": {
    name: "Burdur",
    coords: [37.7204, 30.2908],
    districts: ["Merkez", "Bucak", "Gölhisar", "Yeşilova", "Tefenni", "Karamanlı"]
  },
  "Bursa": {
    name: "Bursa",
    coords: [40.1826, 29.0662],
    districts: ["Osmangazi", "Yıldırım", "Nilüfer", "İnegöl", "Gemlik", "Mudanya", "Mustafakemalpaşa", "Karacabey", "Orhangazi", "Kestel", "Gürsu"]
  },
  "Çanakkale": {
    name: "Çanakkale",
    coords: [40.1553, 26.4142],
    districts: ["Merkez", "Biga", "Gelibolu", "Çan", "Ayvacık", "Ezine", "Lapseki", "Yenice", "Gökçeada", "Bozcaada"]
  },
  "Çankırı": {
    name: "Çankırı",
    coords: [40.6013, 33.6134],
    districts: ["Merkez", "Orta", "Ilgaz", "Çerkeş", "Eskipazar", "Kurşunlu"]
  },
  "Çorum": {
    name: "Çorum",
    coords: [40.5506, 34.9541],
    districts: ["Merkez", "Sungurlu", "Osmancık", "Alaca", "İskilip", "Bayat", "Kargı"]
  },
  "Denizli": {
    name: "Denizli",
    coords: [37.7765, 29.0864],
    districts: ["Merkezefendi", "Pamukkale", "Acıpayam", "Tavas", "Buldan", "Chivril", "Sararayköy", "Honaz"]
  },
  "Diyarbakır": {
    name: "Diyarbakır",
    coords: [37.9144, 40.2110],
    districts: ["Kayapınar", "Bağlar", "Yenişehir", "Sur", "Ergani", "Bismil", "Silvan", "Lice", "Çermik"]
  },
  "Edirne": {
    name: "Edirne",
    coords: [41.6818, 26.5623],
    districts: ["Merkez", "Keşan", "Uzunköprü", "İpsala", "Havsa", "Enez", "Lalapaşa"]
  },
  "Elazığ": {
    name: "Elazığ",
    coords: [38.6810, 39.2264],
    districts: ["Merkez", "Kovancılar", "Karakoçan", "Maden", "Sivrice", "Palu", "Baskil"]
  },
  "Erzincan": {
    name: "Erzincan",
    coords: [39.7500, 39.5000],
    districts: ["Merkez", "Tercan", "Üzümlü", "Refahiye", "İliç", "Kemah", "Kemaliye"]
  },
  "Erzurum": {
    name: "Erzurum",
    coords: [39.9000, 41.2700],
    districts: ["Yakutiye", "Palandöken", "Aziziye", "Oltu", "Horasan", "Pasinler", "Hınıs", "Aşkale", "Tortum"]
  },
  "Eskişehir": {
    name: "Eskişehir",
    coords: [39.7767, 30.5206],
    districts: ["Odunpazarı", "Tepebaşı", "Sivrihisar", "Çifteler", "Mahmudiye", "Alpu", "Mihalıççık"]
  },
  "Gaziantep": {
    name: "Gaziantep",
    coords: [37.0660, 37.3833],
    districts: ["Şehitkamil", "Şahinbey", "Nizip", "İslahiye", "Nurdağı", "Oğuzeli", "Araban", "Yavuzeli"]
  },
  "Giresun": {
    name: "Giresun",
    coords: [40.9169, 38.3886],
    districts: ["Merkez", "Bulancak", "Espiye", "Görele", "Tirebolu", "Şebinkarahisar", "Alucra", "Keşap"]
  },
  "Gümüşhane": {
    name: "Gümüşhane",
    coords: [40.4600, 39.4800],
    districts: ["Merkez", "Kelkit", "Şiran", "Kürtün", "Torul", "Köse"]
  },
  "Hakkari": {
    name: "Hakkari",
    coords: [37.5833, 43.7333],
    districts: ["Merkez", "Yüksekova", "Şemdinli", "Çukurca", "Derecik"]
  },
  "Hatay": {
    name: "Hatay",
    coords: [36.2021, 36.1605],
    districts: ["Antakya", "İskenderun", "Defne", "Samandağ", "Kırıkhan", "Reyhanlı", "Dörtyol", "Erzin", "Payas", "Arsuz", "Yayladağı"]
  },
  "Isparta": {
    name: "Isparta",
    coords: [37.7648, 30.5566],
    districts: ["Merkez", "Yalvaç", "Eğirdir", "Şarkikaraağaç", "Gelendost", "Uluborlu", "Senirkent"]
  },
  "Mersin": {
    name: "Mersin",
    coords: [36.8122, 34.6415],
    districts: ["Akdeniz", "Yenişehir", "Mezitli", "Toroslar", "Tarsus", "Silifke", "Anamur", "Erdemli", "Mut", "Gülnar", "Bozyazı"]
  },
  "İstanbul": {
    name: "İstanbul",
    coords: [41.0082, 28.9784],
    districts: ["Kadıköy", "Bakırköy", "Şişli", "Beşiktaş", "Üsküdar", "Fatih", "Beylikdüzü", "Esenyurt", "Ümraniye", "Tuzla", "Pendik", "Başakşehir", "Ataşehir", "Sarıyer", "Kartal", "Maltepe", "Zeytinburnu"]
  },
  "İzmir": {
    name: "İzmir",
    coords: [38.4192, 27.1287],
    districts: ["Konak", "Karşıyaka", "Bornova", "Buca", "Çiğli", "Gaziemir", "Torbalı", "Menemen", "Aliağa", "Çeşme", "Urla", "Karabağlar", "Bayraklı", "Ödemiş", "Bergama"]
  },
  "Kars": {
    name: "Kars",
    coords: [40.6167, 43.1000],
    districts: ["Merkez", "Sarıkamış", "Kağızman", "Selim", "Digor", "Arpaçay"]
  },
  "Kastamonu": {
    name: "Kastamonu",
    coords: [41.3887, 33.7827],
    districts: ["Merkez", "Tosya", "Taşköprü", "İnebolu", "Cide", "Daday", "Küre", "Abana"]
  },
  "Kayseri": {
    name: "Kayseri",
    coords: [38.7312, 35.4787],
    districts: ["Melikgazi", "Kocasinan", "Talas", "Develi", "Yahyalı", "Bünyan", "Pınarbaşı", "Tomarza"]
  },
  "Kırklareli": {
    name: "Kırklareli",
    coords: [41.7333, 27.2167],
    districts: ["Merkez", "Lüleburgaz", "Babaeski", "Demirköy", "Vize", "Pınarhisar", "Kofçaz"]
  },
  "Kırşehir": {
    name: "Kırşehir",
    coords: [39.1425, 34.1709],
    districts: ["Merkez", "Kaman", "Mucur", "Çiçekdağı", "Akpınar", "Boztepe"]
  },
  "Kocaeli": {
    name: "Kocaeli",
    coords: [40.8533, 29.8815],
    districts: ["İzmit", "Gebze", "Darıca", "Körfez", "Gölcük", "Kartepe", "Başiskele", "Çayırova", "Dilovası", "Kandıra", "Karamürsel"]
  },
  "Konya": {
    name: "Konya",
    coords: [37.8714, 32.4846],
    districts: ["Selçuklu", "Meram", "Karatay", "Ereğli", "Akşehir", "Beyşehir", "Seydişehir", "Kulu", "Cihanbeyli", "Karapınar"]
  },
  "Kütahya": {
    name: "Kütahya",
    coords: [39.4167, 29.9833],
    districts: ["Merkez", "Tavşanlı", "Simav", "Gediz", "Emet", "Domaniç", "Altıntaş"]
  },
  "Malatya": {
    name: "Malatya",
    coords: [38.3552, 38.3095],
    districts: ["Battalgazi", "Yeşilyurt", "Doğanşehir", "Akçadağ", "Darende", "Hekimhan", "Pütürge"]
  },
  "Manisa": {
    name: "Manisa",
    coords: [38.6191, 27.4287],
    districts: ["Şehzadeler", "Yunusemre", "Akhisar", "Turgutlu", "Salihli", "Soma", "Alaşehir", "Kula", "Sarıgöl", "Kırkağaç"]
  },
  "Kahramanmaraş": {
    name: "Kahramanmaraş",
    coords: [37.5858, 36.9372],
    districts: ["Onikişubat", "Dulkadiroğlu", "Elbistan", "Afşin", "Pazarcık", "Göksun", "Andırın", "Türkoğlu"]
  },
  "Mardin": {
    name: "Mardin",
    coords: [37.3212, 40.7245],
    districts: ["Artuklu", "Kızıltepe", "Midyat", "Nusaybin", "Mazıdağı", "Derik", "Savur"]
  },
  "Muğla": {
    name: "Muğla",
    coords: [37.2153, 28.3634],
    districts: ["Menteşe", "Bodrum", "Fethiye", "Marmaris", "Milas", "Ortaca", "Dalaman", "Datça", "Yatağan", "Köyceğiz", "Ula"]
  },
  "Muş": {
    name: "Muş",
    coords: [38.9461, 41.7539],
    districts: ["Merkez", "Bulanık", "Malazgirt", "Hasköy", "Varto", "Korkut"]
  },
  "Nevşehir": {
    name: "Nevşehir",
    coords: [38.6244, 34.7144],
    districts: ["Merkez", "Ürgüp", "Avanos", "Derinkuyu", "Kozaklı", "Hacıbektaş", "Gülşehir"]
  },
  "Niğde": {
    name: "Niğde",
    coords: [37.9667, 34.6833],
    districts: ["Merkez", "Bor", "Çamardı", "Ulukışla", "Altunhisar", "Çiftlik"]
  },
  "Ordu": {
    name: "Ordu",
    coords: [40.9839, 37.8764],
    districts: ["Altınordu", "Ünye", "Fatsa", "Gölköy", "Aybastı", "Korgan", "Kumru", "Perşembe"]
  },
  "Rize": {
    name: "Rize",
    coords: [41.0200, 40.5200],
    districts: ["Merkez", "Çayeli", "Ardeşen", "Pazar", "Fındıklı", "Kalkandere", "İyidere", "İkizdere"]
  },
  "Sakarya": {
    name: "Sakarya",
    coords: [40.7569, 30.3783],
    districts: ["Adapazarı", "Serdivan", "Erenler", "Hendek", "Akyazı", "Karasu", "Sapanca", "Geyve", "Pamukova", "Kocaali", "Arifiye"]
  },
  "Samsun": {
    name: "Samsun",
    coords: [41.2928, 36.3313],
    districts: ["Atakum", "İlkadım", "Canik", "Bafra", "Çarşamba", "Vezirköprü", "Havsa", "Terme", "Tekkeköy", "Ladik"]
  },
  "Siirt": {
    name: "Siirt",
    coords: [37.9333, 41.9500],
    districts: ["Merkez", "Kurtalan", "Pervari", "Baykan", "Şirvan", "Eruh"]
  },
  "Sinop": {
    name: "Sinop",
    coords: [42.0232, 35.1506],
    districts: ["Merkez", "Boyabat", "Gerze", "Ayancık", "Durağan", "Türkeli", "Erfelek"]
  },
  "Sivas": {
    name: "Sivas",
    coords: [39.7477, 37.0179],
    districts: ["Merkez", "Şarkışla", "Yıldızeli", "Suşehri", "Divriği", "Zara", "Kangal", "Gürün", "Gemerek"]
  },
  "Tekirdağ": {
    name: "Tekirdağ",
    coords: [40.9780, 27.5110],
    districts: ["Süleymanpaşa", "Çorlu", "Çerkezköy", "Kapaklı", "Malkara", "Ergene", "Şarköy", "Sararay", "Hayrabolu"]
  },
  "Tokat": {
    name: "Tokat",
    coords: [40.3167, 36.5500],
    districts: ["Merkez", "Erbaa", "Turhal", "Niksar", "Zile", "Almus", "Reşadiye", "Pazar"]
  },
  "Trabzon": {
    name: "Trabzon",
    coords: [41.0027, 39.7168],
    districts: ["Ortahisar", "Akçaabat", "Araklı", "Of", "Yomra", "Arsin", "Sürmene", "Vakfıkebir", "Maçka", "Beşikdüzü"]
  },
  "Tunceli": {
    name: "Tunceli",
    coords: [39.1111, 39.5444],
    districts: ["Merkez", "Ovacık", "Pertek", "Mazgirt", "Hozat", "Pülümür", "Çemişgezek"]
  },
  "Şanlıurfa": {
    name: "Şanlıurfa",
    coords: [37.1591, 38.7969],
    districts: ["Haliliye", "Eyyübiye", "Karaköprü", "Siverek", "Viranşehir", "Ceylanpınar", "Birecik", "Suruç", "Harran", "Akçakale", "Hilvan", "Halfeti"]
  },
  "Uşak": {
    name: "Uşak",
    coords: [38.6823, 29.4082],
    districts: ["Merkez", "Banaz", "Eşme", "Ulubey", "Sivaslı", "Karahallı"]
  },
  "Van": {
    name: "Van",
    coords: [38.4891, 43.4011],
    districts: ["İpekyolu", "Tuşba", "Edremit", "Erciş", "Muradiye", "Gevaş", "Özalp", "Çaldıran", "Başkale", "Saray"]
  },
  "Yozgat": {
    name: "Yozgat",
    coords: [39.8181, 34.8147],
    districts: ["Merkez", "Sorgun", "Akdağmadeni", "Yerköy", "Boğazlıyan", "Sarıkaya", "Şefaatli"]
  },
  "Zonguldak": {
    name: "Zonguldak",
    coords: [41.4564, 31.7987],
    districts: ["Merkez", "Ereğli", "Alaplı", "Çaycuma", "Devrek", "Kozlu", "Kilimli"]
  },
  "Aksaray": {
    name: "Aksaray",
    coords: [38.3686, 34.0370],
    districts: ["Merkez", "Ortaköy", "Eskil", "Gülağaç", "Güzelyurt", "Sarıyahşi"]
  },
  "Bayburt": {
    name: "Bayburt",
    coords: [40.2559, 40.2249],
    districts: ["Merkez", "Demirözü", "Aydıntepe"]
  },
  "Karaman": {
    name: "Karaman",
    coords: [37.1759, 33.2014],
    districts: ["Merkez", "Ermenek", "Kazımkarabekir", "Ayrancı", "Sarıveliler"]
  },
  "Kırıkkale": {
    name: "Kırıkkale",
    coords: [39.8468, 33.5153],
    districts: ["Merkez", "Yahşihan", "Bahşılı", "Keskin", "Delice", "Sulakyurt"]
  },
  "Batman": {
    name: "Batman",
    coords: [37.8811, 41.1351],
    districts: ["Merkez", "Kozluk", "Sason", "Beşiri", "Gercüş", "Hasankeyf"]
  },
  "Şırnak": {
    name: "Şırnak",
    coords: [37.5159, 42.4594],
    districts: ["Merkez", "Cizre", "Silopi", "İdil", "Uludere", "Beytüşşebap", "Güçlükonak"]
  },
  "Bartın": {
    name: "Bartın",
    coords: [41.6358, 32.3375],
    districts: ["Merkez", "Amasra", "Ulus", "Kurucaşile"]
  },
  "Ardahan": {
    name: "Ardahan",
    coords: [41.1105, 42.7022],
    districts: ["Merkez", "Göle", "Çıldır", "Posof", "Hanak", "Damal"]
  },
  "Iğdır": {
    name: "Iğdır",
    coords: [39.9167, 44.0500],
    districts: ["Merkez", "Aralık", "Tuzluca", "Karakoyunlu"]
  },
  "Yalova": {
    name: "Yalova",
    coords: [40.6550, 29.2769],
    districts: ["Merkez", "Çınarcık", "Altınova", "Armutlu", "Termal", "Çiftlikköy"]
  },
  "Karabük": {
    name: "Karabük",
    coords: [41.2000, 32.6200],
    districts: ["Merkez", "Safranbolu", "Yenice", "Eskipazar", "Ovacık", "Eflani"]
  },
  "Kilis": {
    name: "Kilis",
    coords: [36.7181, 37.1147],
    districts: ["Merkez", "Elbeyli", "Musabeyli", "Polateli"]
  },
  "Osmaniye": {
    name: "Osmaniye",
    coords: [37.0750, 36.2415],
    districts: ["Merkez", "Kadirli", "Düziçi", "Bahçe", "Sumbas", "Toprakkale", "Hasanbeyli"]
  },
  "Düzce": {
    name: "Düzce",
    coords: [40.8438, 31.1565],
    districts: ["Merkez", "Akçakoca", "Kaynaşlı", "Gölyaka", "Chilimli", "Gümüşova", "Yığılca"]
  }
};

export const PROVINCE_LIST = Object.keys(TURKEY_PROVINCES).sort((a, b) => a.localeCompare(b, 'tr'));
