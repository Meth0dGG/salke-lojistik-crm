/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Globe, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface LoginPanelProps {
  onLogin: (username: string, pass: string) => boolean;
}

export default function LoginPanel({ onLogin }: LoginPanelProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError("Lütfen kullanıcı adı ve şifrenizi giriniz.");
      return;
    }

    const success = onLogin(username.trim().toLowerCase(), password.trim());
    if (!success) {
      setError("Kullanıcı adı veya şifre hatalı!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12 relative overflow-hidden" id="login-container-view">
      
      {/* Decorative ambient gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md space-y-8 relative z-10" id="login-inner-box">
        {/* Brand logo header */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-500/20">
            <Globe size={32} className="animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display bg-gradient-to-r from-white via-slate-205 to-slate-400 bg-clip-text text-transparent">
              Salke Lojistik
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-mono">
              ERP CLOUD ENTERPRISE SECURE v4.1
            </p>
          </div>
        </div>

        {/* Login Form Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6" id="login-form-card">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white font-display">Giriş Yapın</h2>
            <p className="text-xs text-slate-450">Sistem yetkilerine erişmek için hesap bilgilerinizi doğrulayın.</p>
          </div>

          {error && (
            <div className="p-3 bg-rose-950/30 border border-rose-900 text-rose-400 text-xs rounded-xl flex items-center gap-2 animate-shake" id="login-error-alert">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-blue-400 mb-1.5 uppercase tracking-wider">Kullanıcı Adı</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full bg-slate-950 border-2 border-indigo-650/50 hover:border-indigo-600 focus:border-indigo-500 text-white font-semibold placeholder-slate-600 rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm outline-hidden transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-blue-400 mb-1.5 uppercase tracking-wider">Giriş Parolası</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••"
                  className="w-full bg-slate-950 border-2 border-indigo-650/50 hover:border-indigo-600 focus:border-indigo-500 text-white font-semibold placeholder-slate-600 rounded-xl pl-10 pr-10 py-3 text-xs sm:text-sm outline-hidden transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-500/20 active:bg-indigo-705 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-indigo-650/10 cursor-pointer"
            >
              Doğrula & Sisteme Giriş Yap
            </button>
          </form>
        </div>

        {/* Helper Instructions Callout Box */}
        <div className="bg-slate-900/40 border border-slate-800/85 p-4 rounded-2xl text-[11px] sm:text-xs text-slate-400 space-y-2 pointer-events-none" id="login-instructions-footer">
          <div className="font-bold text-slate-200">💡 Canlı Demo Giriş Bilgileri</div>
          <div className="grid grid-cols-2 gap-2 font-mono text-[10px] sm:text-[11px] bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <div><span className="text-slate-500">Kullanıcı:</span> admin</div>
            <div><span className="text-slate-500 font-sans">Şifre:</span> 1234</div>
          </div>
          <p className="text-[10px] text-slate-500 leading-normal">
            Yönetici olarak giriş yaptıktan sonra üst menüdeki <strong>"Üye Yönetimi"</strong> sekmesinden yeni personeller oluşturabilir ve her temsilcinin sadece kendi atanan işlerini görmesini test edebilirsiniz.
          </p>
        </div>

      </div>
    </div>
  );
}
