import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini AI client helper
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not defined");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// 1. API: Schema & DDL Generator
app.post("/api/generate-schema", async (req, res) => {
  try {
    const { prompt, customTables } = req.body;
    const ai = getGeminiClient();

    const systemInstruction = 
      "Sen uzman bir lojistik veritabanı mimarısın. " +
      "Kullanıcının lojistik CRM projesi için özel veya ek tablolarla desteklenmiş, PostgreSQL uyumlu DDL (CREATE TABLE) şeması tasarlayacaksın. " +
      "Çıktı kesinlikle geçerli bir JSON objesi olmalıdır. Şema şu alanları içermelidir:\n" +
      "1. \"sql\": Tabloları, birincil anahtarlarını, yabancı anahtarlarını (FOREIGN KEY), kısıtlamalarını (constraints) ve lojistiğe özel alanlarını (örneğin plaka, sürücü tc, sefer no, tonaj, hacim, para birimi) içeren temiz, okunabilir, yorum satırlarıyla zenginleştirilmiş PostgreSQL DDL kodu.\n" +
      "2. \"drizzle\": Bu tabloların TypeScript Drizzle ORM (veya Prisma) karşılığı olan şema kodu.\n" +
      "3. \"explanation\": Her bir tablonun lojistik sürecinde ne işe yaradığına dair Türkçe açıklama.\n" +
      "4. \"relationships\": Tablolar arası ilişkilerin (örneğin Teklif -> Müşteri (N:1), Sefer -> Araç (N:1)) bir listesi.\n\n" +
      "Sadece talep edilen JSON yapısını dön. Kesinlikle markdown kod blokları (```json ... ```) dışında bir metin ekleme.";

    const userPrompt = `Kullanıcı İsteği: ${prompt || "Genel lojistik CRM veritabanı şeması"}\n` +
                       `Özel Tablolar/Alanlar: ${customTables ? JSON.stringify(customTables) : "Yok"}\n\n` +
                       "Lütfen buna uygun PostgreSQL şemasını, Drizzle ORM kodunu ve lojistik odaklı ilişki açıklamalarını JSON formatında üret.";

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const resultText = response.text || "{}";
    const parsedResult = JSON.parse(resultText);
    res.json(parsedResult);
  } catch (error: any) {
    console.error("Schema generation failed:", error);
    res.status(500).json({ error: error.message || "Şema üretilirken bir hata oluştu." });
  }
});

// 2. API: Github README.md Generator
app.post("/api/generate-readme", async (req, res) => {
  try {
    const { modules, schemaCode, appName } = req.body;
    const ai = getGeminiClient();

    const systemInstruction = 
      "Sen kıdemli bir lojistik yazılım mühendisisin. " +
      "Github'da yayınlanacak, lojistik CRM projesi için mükemmel seviyede, profesyonel bir README.md içeriği üreteceksin. " +
      "İçerik Türkçe olmalı ve şu bölümleri içermelidir:\n" +
      "- Proje Başlığı ve Özet (Lojistik CRM Programı)\n" +
      "- Temel Modüller ve İşlevleri (Müşteri İlişkileri, Teklif, Sipariş, Sefer, Sürücü/Araç Takibi, Finans vb.)\n" +
      "- Veritabanı Mimarisi (PostgreSQL kullanımı ve tablo ilişkileri)\n" +
      "- Kurulum ve Çalıştırma Adımları (Node.js/React/PostgreSQL için)\n" +
      "- Gelecek Yol Haritası (Mobile entegrasyon, IoT araç takibi vb.)\n" +
      "Yanıt düz markdown formatında olmalıdır.";

    const userPrompt = `Uygulama Adı: ${appName || "Lojistik CRM"}\n` +
                       `Modüller: ${JSON.stringify(modules)}\n` +
                       `Seçili Şema Kodu: \n${schemaCode || "PostgreSQL şeması mevcut"}\n\n` +
                       "Lütfen bu proje için Github'da hemen kullanılabilecek, göz alıcı bir README.md dosyası oluştur.";

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
      },
    });

    res.json({ readme: response.text || "README içeriği oluşturulamadı." });
  } catch (error: any) {
    console.error("README generation failed:", error);
    res.status(500).json({ error: error.message || "README üretilirken bir hata oluştu." });
  }
});

// 3. API: Ask AI Architect (Çözüm Ortağı Danışmanı)
app.post("/api/ask-architect", async (req, res) => {
  try {
    const { question, context } = req.body;
    const ai = getGeminiClient();

    const systemInstruction = 
      "Sen Thro CRM benzeri lojistik yazılımları geliştirme konusunda uzman bir sistem mimarısın. " +
      "Kullanıcının lojistik CRM programı geliştirme, Github entegrasyonu, lojistik süreçlerin (FTL/LTL, intermodal, gümrükleme, navlun teklifleri, demuraj) " +
      "veritabanı tasarımı veya yazılım mimarisi hakkındaki sorularını yanıtlayacaksın. " +
      "Yanıtlarında teknik olarak net, sektör terimlerine (navlun, çeki listesi, ordino, konşimento vb.) hakim ve yönlendirici ol. " +
      "Her zaman profesyonel, yapıcı ve Türkçe bir dille cevap ver.";

    const userPrompt = `Mevcut Bağlam (Proje Modülleri): ${JSON.stringify(context || {})}\n` +
                       `Kullanıcının Sorusu: ${question}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
      },
    });

    res.json({ answer: response.text || "Bir sorun oldu, yanıt üretilemedi." });
  } catch (error: any) {
    console.error("AI Architect call failed:", error);
    res.status(500).json({ error: error.message || "AI Danışman yanıt verirken bir hata oluştu." });
  }
});

// Vite middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running on http://localhost:${PORT}`);
  });
}

startServer();
