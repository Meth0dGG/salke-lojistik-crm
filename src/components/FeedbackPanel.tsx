/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  Star, 
  Users,
  Layers,
  Sparkles
} from 'lucide-react';

interface Feedback {
  id: string;
  name: string;
  category: 'uiux' | 'bug' | 'featureReq';
  rating: number;
  message: string;
  timestamp: string;
}

interface FeedbackPanelProps {
  t: any;
  onSendFeedbackToast: (message: string) => void;
}

export default function FeedbackPanel({
  t,
  onSendFeedbackToast
}: FeedbackPanelProps) {
  const [nameInput, setNameInput] = useState('');
  const [category, setCategory] = useState<'uiux' | 'bug' | 'featureReq'>('uiux');
  const [rating, setRating] = useState<number>(5);
  const [msgInput, setMsgInput] = useState('');
  const [success, setSuccess] = useState(false);

  const [feedbackHistory, setFeedbackHistory] = useState<Feedback[]>([
    {
      id: "feed-1",
      name: "Caner Kaya",
      category: "uiux",
      rating: 5,
      message: "Karanlık mod ve çok dilli geçiş inanılmaz pratik! Sevkiyat gecikmelerini tek dokunuşla bildirebiliyoruz.",
      timestamp: "2026-06-12 05:10"
    },
    {
      id: "feed-2",
      name: "Aslı Demir",
      category: "featureReq",
      rating: 4,
      message: "Gelecek sevkiyat tahminleri için filtre ekranına 'Taşıyıcı Kodu' da eklenmesini talep ediyoruz.",
      timestamp: "2026-06-11 14:24"
    }
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput || !msgInput) {
      alert("Lütfen tüm alanları eksiksiz doldurun!");
      return;
    }

    const payload: Feedback = {
      id: `feed-${Date.now()}`,
      name: nameInput,
      category,
      rating,
      message: msgInput,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setFeedbackHistory([payload, ...feedbackHistory]);
    onSendFeedbackToast(`${nameInput} isimli kullanıcı bir geri bildirim gönderdi.`);
    setSuccess(true);
    setNameInput('');
    setMsgInput('');
    setRating(5);

    setTimeout(() => {
      setSuccess(false);
    }, 6000);
  };

  return (
    <div className="space-y-6 fade-in" id="feedback-panel-container">
      
      {/* Description header */}
      <div className="bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
        <h2 className="text-xl font-bold font-display text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <MessageSquare className="text-indigo-600 dark:text-sky-400" size={24} />
          {t.feedbackTitle}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-350">
          {t.feedbackDesc}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Form: Send feedback */}
        <div className="bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-800 dark:text-slate-205 text-sm font-display flex items-center gap-1.5">
            <Sparkles size={16} className="text-indigo-500" />
            Yeni Bildirim Kaydı Açın
          </h3>

          {success && (
            <div className="bg-emerald-50 dark:bg-emerald-950/25 border border-emerald-250 dark:border-emerald-900 p-4 rounded-xl flex items-start gap-2 text-emerald-800 dark:text-emerald-300" id="feedback-toast-alert">
              <CheckCircle2 className="shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" size={18} />
              <div className="text-xs sm:text-sm font-semibold">{t.feedbackSuccess}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{t.yourName}</label>
              <input 
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Örn: Arda Şen"
                className="w-full bg-slate-50 border border-slate-205 rounded-xl p-2.5 text-xs sm:text-sm outline-hidden focus:border-indigo-505 text-slate-800 dark:bg-slate-850 dark:border-slate-800 dark:text-slate-100"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{t.feebackCategory}</label>
                <select
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-205 rounded-xl p-2.5 text-xs sm:text-sm outline-hidden dark:bg-slate-850 dark:border-slate-800 dark:text-slate-100 text-slate-800"
                >
                  <option value="uiux">{t.uiux}</option>
                  <option value="bug">{t.bug}</option>
                  <option value="featureReq">{t.featureReq}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Puanınız (Kullanışlılık)</label>
                <div className="flex items-center gap-1.5 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="text-slate-350 hover:scale-115 transition"
                    >
                      <Star 
                        size={18} 
                        className={star <= rating ? 'fill-yellow-400 text-yellow-405' : 'text-slate-300'} 
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{t.yourMessage}</label>
              <textarea
                value={msgInput}
                onChange={(e) => setMsgInput(e.target.value)}
                placeholder="Önerilerinizi veya yaşadığınız teknik aksaklıkları buraya aktarın..."
                rows={4}
                className="w-full bg-slate-50 border border-slate-205 rounded-xl p-2.5 text-xs sm:text-sm outline-hidden focus:border-indigo-505 text-slate-800 dark:bg-slate-850 dark:border-slate-800 dark:text-slate-100"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Send size={14} />
              {t.sendFeedback}
            </button>
          </form>
        </div>

        {/* Right list: Past feedbacks */}
        <div className="bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-205 text-sm font-display flex items-center gap-1.5">
              <Users size={16} />
              Saha Ekip Rapor Akışı
            </h3>

            <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1" id="feedback-history-list">
              {feedbackHistory.map((item) => (
                <div 
                  key={item.id}
                  className="p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800 rounded-xl space-y-1.5"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-100 text-xs sm:text-sm block">{item.name}</span>
                      <span className="text-[10px] text-slate-400">{item.timestamp}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={10} className={s <= item.rating ? 'fill-yellow-405 text-yellow-400' : 'text-slate-205'} />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed italic text-wrap break-words">
                    &ldquo;{item.message}&rdquo;
                  </p>

                  <div className="flex justify-between items-center pt-1 text-[10px] text-slate-400">
                    <span className="font-semibold uppercase tracking-wider text-[9px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded">
                      {t[item.category] || item.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[10px] text-slate-400 bg-slate-50 dark:bg-slate-950/30 p-2.5 rounded-lg border border-slate-200/40 dark:border-slate-800/60 text-center">
            Gönderilen tüm veri kayıtları mühürlenir ve SQL operasyonları veritabanına otomatik eşitlenir.
          </p>
        </div>

      </div>

    </div>
  );
}
