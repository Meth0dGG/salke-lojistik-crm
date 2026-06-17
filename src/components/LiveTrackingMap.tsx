/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Shipment } from '../types';
import { Map, MapPin, Navigation, Compass, AlertCircle, Info, RefreshCw } from 'lucide-react';
import { TURKEY_PROVINCES } from '../data/turkeyData';

// Resolve coordinates of Turkish cities dynamically from dataset
function getCityCoords(name: string): [number, number] {
  const norm = name.toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c');

  for (const [key, prov] of Object.entries(TURKEY_PROVINCES)) {
    const provNorm = key.toLowerCase()
      .replace(/ı/g, 'i')
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c');
    
    if (norm.includes(provNorm)) {
      return prov.coords;
    }
  }

  // Fallback map pointer (Ankara)
  return [39.9334, 32.8597];
}

interface HighwayRouteResult {
  currentRoute: [number, number][];
  currentRouteCities: string[];
}

// Dynamically generate realistic highways passing through intermediate cities
function getHighwayRoutes(origin: string, destination: string): HighwayRouteResult {
  const start = getCityCoords(origin);
  const end = getCityCoords(destination);

  const startLat = start[0];
  const startLng = start[1];
  const endLat = end[0];
  const endLng = end[1];

  const dLat = endLat - startLat;
  const dLng = endLng - startLng;
  const lenSq = dLat * dLat + dLng * dLng;

  if (lenSq < 0.01) {
    return {
      currentRoute: [start, end],
      currentRouteCities: [origin, destination]
    };
  }

  const candidates: { t: number; dist: number; coords: [number, number]; name: string }[] = [];

  for (const [name, prov] of Object.entries(TURKEY_PROVINCES)) {
    if (name.toLowerCase() === origin.toLowerCase() || name.toLowerCase() === destination.toLowerCase()) continue;

    const provLat = prov.coords[0];
    const provLng = prov.coords[1];

    const t = ((provLat - startLat) * dLat + (provLng - startLng) * dLng) / lenSq;

    if (t > 0.05 && t < 0.95) {
      const closestLat = startLat + t * dLat;
      const closestLng = startLng + t * dLng;
      const dist = Math.sqrt(Math.pow(provLat - closestLat, 2) + Math.pow(provLng - closestLng, 2));

      // Threshold: only select cities near to the line corridor
      const maxDist = Math.max(1.3, Math.sqrt(lenSq) * 0.45);

      if (dist < maxDist) {
        const item = { t, dist, coords: prov.coords, name: prov.name };
        candidates.push(item);
      }
    }
  }

  candidates.sort((a, b) => a.t - b.t);

  const selectRepresentativeCities = (items: typeof candidates) => {
    if (items.length <= 3) return items;
    const step = (items.length - 1) / 3;
    return [
      items[0],
      items[Math.floor(step)],
      items[Math.floor(2 * step)],
      items[items.length - 1]
    ];
  };

  const selectedCities = selectRepresentativeCities(candidates);

  const currentRoute: [number, number][] = [start];
  const currentRouteCities: string[] = [origin];
  selectedCities.forEach(c => {
    currentRoute.push(c.coords);
    currentRouteCities.push(c.name);
  });
  currentRoute.push(end);
  currentRouteCities.push(destination);

  // Fallbacks if no cities were found in between
  if (selectedCities.length === 0) {
    const midLat = startLat + 0.5 * dLat;
    const midLng = startLng + 0.5 * dLng;
    const pLat = -dLng * 0.08;
    const pLng = dLat * 0.08;

    return {
      currentRoute: [start, [midLat + pLat, midLng + pLng], end],
      currentRouteCities: [origin, "Karayolu Transit Geçiş", destination]
    };
  }

  return {
    currentRoute,
    currentRouteCities
  };
}

// Calculate intermediate coordinate along a segmented route based on fraction
function interpolateRoutePoints(route: [number, number][], fraction: number): [number, number] {
  if (route.length === 0) return [39.9334, 32.8597];
  if (route.length === 1) return route[0];
  if (fraction <= 0) return route[0];
  if (fraction >= 1) return route[route.length - 1];

  const segmentLengths: number[] = [];
  let totalLength = 0;
  for (let i = 0; i < route.length - 1; i++) {
    const lat1 = route[i][0];
    const lng1 = route[i][1];
    const lat2 = route[i + 1][0];
    const lng2 = route[i + 1][1];
    const len = Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lng2 - lng1, 2));
    segmentLengths.push(len);
    totalLength += len;
  }

  if (totalLength === 0) return route[0];

  const targetLength = totalLength * fraction;
  let accumulatedLength = 0;

  for (let i = 0; i < segmentLengths.length; i++) {
    const nextAccumulated = accumulatedLength + segmentLengths[i];
    if (targetLength <= nextAccumulated) {
      const segmentFraction = (targetLength - accumulatedLength) / segmentLengths[i];
      const start = route[i];
      const end = route[i + 1];
      const lat = start[0] + (end[0] - start[0]) * segmentFraction;
      const lng = start[1] + (end[1] - start[1]) * segmentFraction;
      return [lat, lng];
    }
    accumulatedLength = nextAccumulated;
  }

  return route[route.length - 1];
}

interface LiveTrackingMapProps {
  t: any;
  shipments: Shipment[];
  theme: 'light' | 'dark';
}

export default function LiveTrackingMap({
  t,
  shipments,
  theme
}: LiveTrackingMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const layersGroupRef = useRef<L.FeatureGroup | null>(null);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);

  // CartoDB elegant base tiles compatible with styling preferences
  const lightTiles = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
  const darkTiles = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
  const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

  // Instantiate Leaflet Map once
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map centering nicely over Turkey domestic space
    const initialMap = L.map(mapContainerRef.current, {
      center: [39.0, 35.2],
      zoom: 6,
      scrollWheelZoom: true,
      fadeAnimation: true,
      zoomControl: true,
    });

    mapRef.current = initialMap;

    // Set initial tile layer with current theme
    const activeTileUrl = theme === 'dark' ? darkTiles : lightTiles;
    const tiles = L.tileLayer(activeTileUrl, {
      attribution,
      maxZoom: 18,
    }).addTo(initialMap);

    tileLayerRef.current = tiles;

    // Create a feature group to hold dynamically generated shipment paths & markers
    const featureGroup = L.featureGroup().addTo(initialMap);
    layersGroupRef.current = featureGroup;

    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update Tile source if theme toggles
  useEffect(() => {
    if (!tileLayerRef.current) return;
    const activeTileUrl = theme === 'dark' ? darkTiles : lightTiles;
    tileLayerRef.current.setUrl(activeTileUrl);
  }, [theme]);

  // Update Map Markers and Connections when shipment counts or filters change
  useEffect(() => {
    const map = mapRef.current;
    const group = layersGroupRef.current;
    if (!map || !group) return;

    // Clear previous geometries and markers
    group.clearLayers();

    const pointsToFit: L.LatLng[] = [];

    shipments.forEach((s) => {
      const { currentRoute, currentRouteCities } = getHighwayRoutes(s.origin, s.destination);

      let fraction = 0;
      let statusColor = 'bg-blue-500';
      let pulseStyle = 'border-blue-500 shadow-blue-500/50';

      if (s.status === 'preparing') {
        fraction = 0.05; // Slightly offset from origin
        statusColor = 'bg-indigo-500';
        pulseStyle = 'border-indigo-500 shadow-indigo-500/40 animate-pulse';
      } else if (s.status === 'transit') {
        fraction = 0.45; // Approximately middle of trace
        statusColor = 'bg-sky-505 bg-sky-500';
        pulseStyle = 'border-sky-500 shadow-sky-500/50 animate-bounce';
      } else if (s.status === 'delivered') {
        fraction = 1.0; // Anchored at endpoint
        statusColor = 'bg-emerald-500';
        pulseStyle = 'border-emerald-500 shadow-emerald-500/45';
      } else if (s.status === 'cancelled') {
        fraction = 0.0;
        statusColor = 'bg-slate-500';
        pulseStyle = 'border-slate-500 shadow-slate-500/30';
      }

      const activeCoord = interpolateRoutePoints(currentRoute, fraction);
      
      // Store all traversed points for map bounding box fits
      currentRoute.forEach(pt => pointsToFit.push(L.latLng(pt)));
      pointsToFit.push(L.latLng(activeCoord));

      // Draw Current Route (Mevcut Karayolu) - Solid Emerald path
      const currentLine = L.polyline(currentRoute, {
        color: '#10b981',
        weight: 3.5,
        opacity: 0.85,
        dashArray: s.status === 'preparing' ? '3, 6' : s.status === 'delivered' ? '1' : 'none',
      }).addTo(group);

      currentLine.bindTooltip(`Mevcut Karayolu Rotası:<br/>${currentRouteCities.join(' ➔ ')}`, { 
        sticky: true,
        className: 'font-sans text-xs bg-emerald-950 border border-emerald-800 text-emerald-100 rounded p-1.5'
      });

      // Create Custom Tailwind Interactive DivIcon for Shipments
      const currentIcon = L.divIcon({
        className: 'custom-shipment-icon',
        html: `
          <div class="relative w-8 h-8 flex items-center justify-center">
            <span class="absolute inline-flex h-full w-full rounded-full opacity-75 blur-xs ${statusColor} ${pulseStyle}"></span>
            <div class="relative flex items-center justify-center rounded-full w-6 h-6 border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm text-[10px] font-bold text-slate-700 dark:text-slate-200">
              ${s.status === 'delivered' ? '✓' : '📦'}
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      // Marker for active shipment state
      const shipmentMarker = L.marker(activeCoord, { icon: currentIcon })
        .addTo(group);

      // Simple interactive popup
      const popupHtml = `
        <div class="p-3 font-sans min-w-[220px] bg-white text-slate-800" style="font-family: var(--font-sans);">
          <div class="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-2">
            <span class="text-xs font-mono font-black text-indigo-700 font-bold">${s.trackingNumber}</span>
            <span class="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
              s.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
              'bg-blue-100 text-blue-800'
            }">${s.status}</span>
          </div>
          <div class="space-y-1.5 text-xs">
            <p class="truncate"><strong class="text-slate-400">Şirket:</strong> ${s.customerName}</p>
            <p><strong>Karayolu Güzergahı:</strong> ${currentRouteCities.join(' ➔ ')}</p>
            <p><strong>Kargo:</strong> ${s.cargoType}</p>
            <p><strong>Taşıyıcı:</strong> ${s.carrier} (${s.weight.toLocaleString()} kg)</p>
            ${s.purchasePrice != null || s.salePrice != null ? `
              <div class="mt-1.5 pt-1.5 border-t border-slate-100 flex justify-between text-[10px]">
                ${s.purchasePrice != null ? `<span><strong class="text-slate-400">Alış:</strong> ${s.purchasePrice}₺</span>` : ''}
                ${s.salePrice != null ? `<span><strong class="text-slate-400">Satış:</strong> ${s.salePrice}₺</span>` : ''}
                ${s.purchasePrice != null && s.salePrice != null ? `<span class="text-green-600 font-bold">Kâr: ${s.salePrice - s.purchasePrice}₺</span>` : ''}
              </div>
            ` : ''}
            <p class="text-[10px] text-slate-500 font-mono mt-1 border-t border-slate-100 pt-1 text-right">Tahmini Varış: ${s.estimatedArrival}</p>
          </div>
          <div class="mt-2.5 pt-2 border-t border-slate-100">
            <a href="https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(s.origin + ', Türkiye')}&destination=${encodeURIComponent(s.destination + ', Türkiye')}&travelmode=driving" 
               target="_blank" 
               rel="noopener noreferrer" 
               class="inline-flex items-center justify-center w-full px-2 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded font-semibold text-[10px] transition-all"
               style="color: white; text-decoration: none; text-align: center; display: block;"
            >
              🗺️ Google Haritalar'da Rotayı Aç ↗
            </a>
          </div>
        </div>
      `;

      shipmentMarker.bindPopup(popupHtml, { closeButton: false });

      // Click to trigger focus panel update
      shipmentMarker.on('click', () => {
        setSelectedShipment(s);
      });
    });

    // Fit map view bounds if we have elements to show
    if (pointsToFit.length > 0) {
      map.fitBounds(L.latLngBounds(pointsToFit), {
        padding: [50, 50],
        maxZoom: 10,
        animate: true,
      });
    }
  }, [shipments]);

  // Center on single shipment coordinate
  const handleFocusShipmentOnMap = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    const map = mapRef.current;
    if (!map) return;

    const { currentRoute } = getHighwayRoutes(shipment.origin, shipment.destination);
    
    let offsetFraction = 0.45;
    if (shipment.status === 'preparing') offsetFraction = 0.05;
    if (shipment.status === 'delivered') offsetFraction = 1.0;

    const approximateCoord = interpolateRoutePoints(currentRoute, offsetFraction);

    map.setView(approximateCoord, 7, {
      animate: true,
      duration: 1.2,
    });
  };

  const activeShipments = shipments.filter(s => s.status === 'transit');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-900/10 shadow-xs" id="live-map-card">
      
      {/* Left panel showing list of active tracking tags */}
      <div className="p-5 bg-white dark:bg-slate-900 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800 flex flex-col justify-between" id="live-map-sidebar">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-50 dark:border-slate-850">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 font-display flex items-center gap-1.5">
              <Compass className="text-indigo-600 dark:text-sky-400 rotate-12" size={17} />
              Konumsal Sinyaller ({activeShipments.length})
            </h3>
            <span className="text-[9px] px-2 py-0.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 font-bold rounded-lg font-mono tracking-wider animate-pulse">
              AKSIYONDA
            </span>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1" id="live-nodes-list">
            {shipments.map((s) => {
              const isActiveFocus = selectedShipment?.id === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => handleFocusShipmentOnMap(s)}
                  className={`w-full text-left p-3 rounded-xl border transition-all text-xs flex justify-between items-start gap-2 cursor-pointer ${
                    isActiveFocus
                      ? 'bg-indigo-50 border-indigo-200 dark:bg-sky-505/10 dark:border-sky-500/40 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100/60 dark:bg-slate-950/45 dark:hover:bg-slate-950/80 border-slate-100 dark:border-slate-800'
                  }`}
                >
                  <div className="space-y-1 truncate">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-extrabold text-slate-700 dark:text-slate-200">{s.trackingNumber}</span>
                      <span className={`inline-block w-1.5 h-1.5 rounded-full ${
                        s.status === 'delivered' ? 'bg-emerald-500' :
                        s.status === 'preparing' ? 'bg-indigo-400' : 'bg-blue-500'
                      }`}></span>
                    </div>

                    <p className="text-[10px] text-slate-400 truncate font-sans">
                      {s.origin} &rarr; {s.destination}
                    </p>
                  </div>

                  <div className="text-right whitespace-nowrap shrink-0">
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase bg-slate-200/55 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {t[s.status] || s.status}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Info card footer */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-850 mt-4 space-y-3">
          {selectedShipment ? (() => {
            const { currentRouteCities } = getHighwayRoutes(selectedShipment.origin, selectedShipment.destination);
            return (
              <div className="p-3 bg-indigo-50/20 dark:bg-slate-950/40 border border-indigo-100/40 dark:border-slate-800 rounded-xl space-y-2.5" id="focused-shipment-details">
                <span className="text-[9px] font-bold text-indigo-700 dark:text-sky-400 font-mono tracking-wider block uppercase">Odaklanmış Sevkiyat</span>
                
                <div className="text-xs text-slate-600 dark:text-slate-350 space-y-1.5 font-sans">
                  <p className="font-bold text-slate-800 dark:text-slate-200">#{selectedShipment.trackingNumber}</p>
                  <p><strong>Yükleyici:</strong> {selectedShipment.customerName}</p>
                  <p><strong>Kargo Tipi:</strong> {selectedShipment.cargoType}</p>
                  <p><strong>Taşıyıcı:</strong> {selectedShipment.carrier}</p>
                  {(selectedShipment.purchasePrice != null || selectedShipment.salePrice != null) && (
                    <div className="pt-2 mt-2 border-t border-indigo-100/50 dark:border-slate-800 flex justify-between text-[11px]">
                      {selectedShipment.purchasePrice != null && <span><strong>Alış:</strong> {selectedShipment.purchasePrice}₺</span>}
                      {selectedShipment.salePrice != null && <span><strong>Satış:</strong> {selectedShipment.salePrice}₺</span>}
                      {selectedShipment.purchasePrice != null && selectedShipment.salePrice != null && (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">Kâr: {selectedShipment.salePrice - selectedShipment.purchasePrice}₺</span>
                      )}
                    </div>
                  )}
                  
                  <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                    <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shrink-0"></span>
                      Karayolu Güzergahı:
                    </p>
                    <p className="text-[11px] bg-slate-50 dark:bg-slate-950/50 p-2 rounded-lg font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                      {currentRouteCities.join(' ➔ ')}
                    </p>

                    <a
                      href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(selectedShipment.origin + ', Türkiye')}&destination=${encodeURIComponent(selectedShipment.destination + ', Türkiye')}&travelmode=driving`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs cursor-pointer text-center no-underline"
                    >
                      <MapPin size={13} className="shrink-0" />
                      Google Haritalar'da Canlı Rotayı Gör ↗
                    </a>
                  </div>
                </div>
              </div>
            );
          })() : (
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950/20 rounded-xl text-[11px] text-slate-500 dark:text-slate-400 flex gap-2 items-start">
              <Info size={15} className="shrink-0 text-slate-400 mt-0.5" />
              <span>Harita üzerindeki kargo simgelerine tıklayarak sevkiyatların canlı transit rotalarını ve karayolu güzergahlarını inceleyebilirsiniz.</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Interactive Leaflet Canvas */}
      <div className="lg:col-span-2 relative min-h-[380px] lg:min-h-[450px]" id="leaflet-map-canvas-container">
        
        {/* Floating Highway Legend Widget */}
        <div className="absolute top-4 right-4 z-40 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-md space-y-2 pointer-events-auto">
          <div className="text-[11px] font-bold text-slate-705 dark:text-slate-200 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-0.5">
            <Navigation className="text-indigo-600 dark:text-sky-400 rotate-45" size={12} />
            <span>Karayolu Güzergahı</span>
          </div>
          <div className="space-y-1 text-[10px]">
            <div className="flex items-center gap-2">
              <span className="w-5 h-0.5 bg-emerald-500 inline-block"></span>
              <span className="text-slate-600 dark:text-slate-350 font-medium">Aktif Karayolu Rotası</span>
            </div>
          </div>
        </div>

        {/* Map Mount Target */}
        <div 
          ref={mapContainerRef} 
          className="w-full h-full min-h-[380px] lg:min-h-[450px] relative z-10"
          style={{ outline: "none" }}
          id="leaflet-tracking-canvas"
        />

      </div>

    </div>
  );
}
