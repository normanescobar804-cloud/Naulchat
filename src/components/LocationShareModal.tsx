import React, { useState } from 'react';
import { MapPin, Navigation, Radio, Clock, ShieldCheck, X, Check } from 'lucide-react';
import { LocationMetadata } from '../types';
import { translations } from '../utils/translations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onShareLocation: (loc: LocationMetadata) => void;
  lang: 'es' | 'en' | 'miskito' | 'pt';
}

const PRESET_LOCATIONS = [
  {
    name: 'Puerto Salvador Allende, Managua',
    address: 'Costanera del Lago Xolotlán, Managua, Nicaragua',
    lat: 12.1601,
    lng: -86.2750,
  },
  {
    name: 'Catedral de Granada y La Calzada',
    address: 'Parque Central Colón, Granada, Nicaragua',
    lat: 11.9299,
    lng: -85.9560,
  },
  {
    name: 'Bahía de San Juan del Sur',
    address: 'Malecón de San Juan del Sur, Rivas, Nicaragua',
    lat: 11.2529,
    lng: -85.8705,
  },
  {
    name: 'Mirador de Catarina & Laguna de Apoyo',
    address: 'Catarina, Masaya, Nicaragua',
    lat: 11.9056,
    lng: -86.0744,
  },
  {
    name: 'Catedral Basílica de León',
    address: 'Plaza Mayor, León, Nicaragua',
    lat: 12.4350,
    lng: -86.8790,
  }
];

export const LocationShareModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onShareLocation,
  lang,
}) => {
  const t = translations[lang];
  const [isLive, setIsLive] = useState(true);
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [selectedPreset, setSelectedPreset] = useState(PRESET_LOCATIONS[0]);
  const [customPlaceName, setCustomPlaceName] = useState('');
  const [gettingGPS, setGettingGPS] = useState(false);

  if (!isOpen) return null;

  const handleUseBrowserGPS = () => {
    if ('geolocation' in navigator) {
      setGettingGPS(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGettingGPS(false);
          setSelectedPreset({
            name: 'Mi Ubicación Actual en Vivo',
            address: `Lat: ${pos.coords.latitude.toFixed(4)}, Lng: ${pos.coords.longitude.toFixed(4)}, Nicaragua`,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {
          setGettingGPS(false);
        },
        { timeout: 5000 }
      );
    }
  };

  const handleConfirmShare = () => {
    const finalName = customPlaceName.trim() || selectedPreset.name;
    const metadata: LocationMetadata = {
      latitude: selectedPreset.lat,
      longitude: selectedPreset.lng,
      placeName: finalName,
      address: selectedPreset.address,
      isLive,
      liveExpiresAt: isLive ? Date.now() + durationMinutes * 60 * 1000 : undefined,
    };
    onShareLocation(metadata);
    onClose();
  };

  return (
    <div id="location-share-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100 animate-scaleUp">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">
                {t.shareLocation}
              </h3>
              <p className="text-xs text-slate-400">
                GPS satelital cifrado con transmisión en tiempo real
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Map Preview Graphic */}
          <div className="relative h-44 w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center">
            {/* Stylized vector map background */}
            <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40" />

            {/* Map Roads & Contours visual */}
            <svg className="absolute inset-0 w-full h-full stroke-slate-800/80 fill-none stroke-[2]">
              <path d="M-10,30 Q120,60 240,40 T480,120" />
              <path d="M50,160 Q180,90 320,130 T520,70" />
              <circle cx="240" cy="80" r="45" stroke="rgba(14, 165, 233, 0.2)" strokeWidth="1" />
              <circle cx="240" cy="80" r="75" stroke="rgba(14, 165, 233, 0.1)" strokeWidth="1" />
            </svg>

            {/* Pulsing Pin */}
            <div className="relative flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-sky-500/20 flex items-center justify-center animate-ping absolute" />
              <div className="w-10 h-10 rounded-full bg-sky-500 text-white shadow-lg shadow-sky-500/40 flex items-center justify-center z-10">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="mt-2 px-3 py-1 rounded-full bg-black/80 border border-slate-700 text-xs font-semibold text-sky-400 shadow-md">
                {selectedPreset.name}
              </div>
            </div>

            {/* GPS Browser Button */}
            <button
              onClick={handleUseBrowserGPS}
              className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-xs text-sky-400 flex items-center gap-1.5 backdrop-blur-sm cursor-pointer"
            >
              <Navigation className={`w-3.5 h-3.5 ${gettingGPS ? 'animate-spin text-sky-400' : ''}`} />
              <span>{gettingGPS ? 'Detectando...' : 'Obtener mi GPS'}</span>
            </button>
          </div>

          {/* Mode Selection: Live Tracking vs Static */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setIsLive(true)}
              className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                isLive
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                  : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-1.5 font-semibold text-xs">
                <Radio className="w-4 h-4 animate-pulse" />
                <span>Ubicación en Tiempo Real</span>
              </div>
              <span className="text-[10px] text-slate-400">
                Actualiza dinámicamente según te desplaces
              </span>
            </button>

            <button
              type="button"
              onClick={() => setIsLive(false)}
              className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                !isLive
                  ? 'border-sky-500 bg-sky-500/10 text-sky-400'
                  : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-1.5 font-semibold text-xs">
                <MapPin className="w-4 h-4" />
                <span>Punto Fijo Actual</span>
              </div>
              <span className="text-[10px] text-slate-400">
                Envía una única coordenada fija
              </span>
            </button>
          </div>

          {/* Duration if live */}
          {isLive && (
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                Duración de la transmisión en tiempo real:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[15, 60, 480].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDurationMinutes(mins)}
                    className={`py-2 px-3 rounded-lg text-xs font-medium border transition cursor-pointer ${
                      durationMinutes === mins
                        ? 'border-sky-500 bg-sky-500/10 text-sky-400'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {mins === 15 ? '15 minutos' : mins === 60 ? '1 hora' : '8 horas'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Preset Selector for Nicaragua */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-medium">Lugares emblemáticos de Nicaragua:</label>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {PRESET_LOCATIONS.map((loc) => (
                <button
                  key={loc.name}
                  type="button"
                  onClick={() => setSelectedPreset(loc)}
                  className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between transition cursor-pointer ${
                    selectedPreset.name === loc.name
                      ? 'bg-slate-800 text-white font-medium'
                      : 'hover:bg-slate-800/50 text-slate-400'
                  }`}
                >
                  <div className="truncate">
                    <p className="text-slate-200">{loc.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{loc.address}</p>
                  </div>
                  {selectedPreset.name === loc.name && (
                    <Check className="w-4 h-4 text-sky-400 shrink-0 ml-2" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleConfirmShare}
            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl transition shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Navigation className="w-4 h-4" />
            <span>Compartir Ubicación en este Chat</span>
          </button>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Cifrado GPS E2EE
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
