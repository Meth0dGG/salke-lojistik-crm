/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Code, 
  Key, 
  RefreshCw, 
  Terminal, 
  Play, 
  ChevronRight, 
  Copy, 
  Check,
  Server
} from 'lucide-react';
import { apiEndpoints, ApiEndpoint } from '../apiDocs';
import { Shipment, Customer, Backup } from '../types';

interface ApiPanelProps {
  t: any;
  shipments: Shipment[];
  customers: Customer[];
  backups: Backup[];
}

export default function ApiPanel({
  t,
  shipments,
  customers,
  backups
}: ApiPanelProps) {
  const [apiKey, setApiKey] = useState('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoic3ZzdHJuOTFAZ21haWwuY29tIiwiY29tcGFueSI6IkxvZ2lzdGljc0VSTSJ9.a8b1z7q9_dev_key');
  const [copied, setCopied] = useState(false);
  
  // Sandbox State
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint>(apiEndpoints[0]);
  const [apiResponse, setApiResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCopyToken = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleGenerateNewKey = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let tokenBuffer = "logistics_jwt_token_";
    for(let i=0; i<32; i++) {
      tokenBuffer += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setApiKey(tokenBuffer);
    setApiResponse('');
  };

  // Run dynamic simulated REST endpoint queries utilizing the actual on-screen array states!
  const runSandboxQuery = () => {
    setIsLoading(true);
    setApiResponse('');

    setTimeout(() => {
      let outputPayload: any = {};
      const currentTime = new Date().toISOString();

      switch(selectedEndpoint.path) {
        case '/api/v1/shipments':
          outputPayload = {
            success: true,
            count: shipments.length,
            requestedAt: currentTime,
            apiRoute: "GET /api/v1/shipments",
            environment: "Cloud Run Sandbox",
            data: shipments.map(s => ({
              trackingNumber: s.trackingNumber,
              cargoOwner: s.customerName,
              originPort: s.origin,
              destinationPort: s.destination,
              shipmentStatus: s.status,
              estimatedArrivalDate: s.estimatedArrival,
              carrierCompany: s.carrier
            }))
          };
          break;

        case '/api/v1/customers':
          outputPayload = {
            success: true,
            count: customers.length,
            requestedAt: currentTime,
            apiRoute: "GET /api/v1/customers",
            data: customers.map(c => ({
              company: c.company,
              representative: c.name,
              email: c.email,
              status: c.status,
              originCountry: c.country
            }))
          };
          break;

        case '/api/v1/shipments/delay':
          outputPayload = {
            success: true,
            apiRoute: "POST /api/v1/shipments/delay",
            message: "Müşteri sevkiyatındaki gecikme parametreleri sisteme entegre edilmiştir. Sürücüye rota düzeltme uyarısı gönderildi.",
            environment: "Production Cluster EU-West",
            status: "SUCCESS",
            delayParametersRecorded: {
              trackingNumber: "TRK-4412980-B",
              delayMinutes: 180,
              delayReason: "Gümrük Geçiş Kuyruğu (Bulgaristan Sınırı)",
              timestampValidated: currentTime
            }
          };
          break;

        case '/api/v1/system/backups':
          outputPayload = {
            success: true,
            apiRoute: "GET /api/v1/system/backups",
            cloudStorageStatus: "GREEN / ENCRYPTED",
            backupRetentionSchedule: "DAILY / AUTO ROTATE",
            totalArchivesAvailable: backups.length,
            archives: backups.map(b => ({
              filename: b.filename,
              size: b.size,
              backupType: b.type,
              checksumSHA256: b.checksum
            }))
          };
          break;

        default:
          outputPayload = selectedEndpoint.defaultResponse;
      }

      setApiResponse(JSON.stringify(outputPayload, null, 2));
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="space-y-6 fade-in" id="developer-api-panel">
      
      {/* Description header */}
      <div className="bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
        <h2 className="text-xl font-bold font-display text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Code className="text-indigo-600 dark:text-sky-400" size={24} />
          {t.developerPortal}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-350">
          {t.apiDesc}
        </p>

        {/* API key display strip */}
        <div className="p-4 bg-slate-950/95 dark:bg-black rounded-xl border border-slate-800 space-y-3" id="api-key-panel">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono text-slate-400 font-semibold uppercase flex items-center gap-1">
              <Key size={12} className="text-yellow-500" />
              {t.apiToken}
            </span>
            <button
              onClick={handleGenerateNewKey}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer transition"
            >
              <RefreshCw size={12} />
              {t.regenerateToken}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] sm:text-xs text-emerald-400 select-all block break-all truncate flex-1">
              {apiKey}
            </span>
            <button
              onClick={handleCopyToken}
              className="p-1.5 bg-slate-800 text-slate-450 hover:bg-slate-700/80 rounded-lg text-xs"
              title="Tokenı Kopyala"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} className="text-slate-300" />}
            </button>
          </div>
        </div>
      </div>

      {/* API Sandbox Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left 2 Columns: Endpoint lists selector */}
        <div className="lg:col-span-2 space-y-4" id="api-endpoints-column">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm font-display flex items-center gap-1.5">
            <Server size={16} />
            {t.apiPlayground}
          </h3>

          <div className="space-y-2.5" id="api-endpoint-buttons">
            {apiEndpoints.map((endpoint, i) => {
              const methodColors = endpoint.method === 'GET' 
                ? 'bg-blue-500/10 text-blue-600 dark:border-blue-900/60 dark:text-blue-400' 
                : 'bg-emerald-500/10 text-emerald-600 dark:border-emerald-950/40 dark:text-emerald-400';

              return (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedEndpoint(endpoint);
                    setApiResponse('');
                  }}
                  className={`w-full text-left p-3.5 border rounded-xl transition flex flex-col gap-1.5 cursor-pointer leading-tight ${
                    selectedEndpoint.path === endpoint.path 
                      ? 'border-indigo-500 bg-indigo-50/20 dark:bg-slate-900/80 ring-2 ring-indigo-500/25' 
                      : 'border-slate-150 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/20 dark:hover:bg-slate-800/10'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black font-mono border ${methodColors}`}>
                      {endpoint.method}
                    </span>
                    <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {endpoint.path}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    {endpoint.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 3 Columns: Request / Response Console */}
        <div className="lg:col-span-3 space-y-4" id="api-console-column">
          
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between min-h-[480px]">
            <div>
              <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Terminal className="text-sky-400" size={18} />
                  <span className="text-xs font-mono font-bold text-slate-250">API SORGUSU OYUN ALANI</span>
                </div>

                <button
                  onClick={runSandboxQuery}
                  disabled={isLoading}
                  className="flex items-center gap-1 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  {isLoading ? (
                    <span className="h-3 w-3 border-2 border-white border-t-transparent animate-spin rounded-full"></span>
                  ) : (
                    <Play size={11} className="fill-current" />
                  )}
                  {t.tryOut}
                </button>
              </div>

              {/* Endpoint spec */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 bg-slate-850 p-2.5 rounded-lg border border-slate-800">
                  <span className={`px-2 py-0.5 text-[9px] font-black font-mono text-sky-400`}>
                    {selectedEndpoint.method}
                  </span>
                  <span className="text-xs font-mono text-slate-200">{selectedEndpoint.path}</span>
                </div>

                {/* Parameters specs */}
                {selectedEndpoint.parameters.length > 0 && (
                  <div className="space-y-1.5" id="parameter-specifications">
                    <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block">Query Parameters / Payloads</span>
                    <div className="space-y-1.5 text-xs text-slate-300 font-mono">
                      {selectedEndpoint.parameters.map((param, index) => (
                        <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-850 py-1">
                          <span className="text-sky-305">
                            {param.name} {param.required && <span className="text-rose-525 text-[9px] font-bold font-mono">REQUIRED</span>}
                          </span>
                          <span className="text-slate-500 font-mono text-[11px]">{param.type} &mdash; {param.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Output screen */}
            <div className="mt-4" id="api-output-screen">
              <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider block mb-2">{t.responseConsole}</span>
              <div className="bg-slate-950 p-3.5 border border-slate-850 rounded-lg min-h-[220px] max-h-[300px] overflow-y-auto font-mono text-[10px] sm:text-xs text-emerald-450 leading-relaxed">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full text-slate-500 text-xs">
                    HTTP/1.1 Send Request... TLS Handshake... Processing Data Out...
                  </div>
                ) : apiResponse ? (
                  <pre>{apiResponse}</pre>
                ) : (
                  <div className="text-slate-650 italic text-center py-16 text-xs text-slate-500">
                    &ldquo;{t.tryOut}&rdquo; butonuna tıklayarak mühürlü JSON API cevabını test edin...
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
