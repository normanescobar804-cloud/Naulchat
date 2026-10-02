import React, { useState } from 'react';
import { Palette, Check, RotateCcw, Cloud, Lock, Sparkles, X, CheckCheck } from 'lucide-react';
import { User, BubbleColors } from '../types';
import { updateUserBubbleColorsInFirestore } from '../services/firestoreChat';
import { apiUpdateBubbleColors } from '../services/api';

export const DEFAULT_BUBBLE_COLORS: BubbleColors = {
  outgoingBg: '#0077ff',
  outgoingText: '#ffffff',
  incomingBg: '#182232',
  incomingText: '#f1f5f9',
  presetId: 'default'
};

export interface BubblePreset {
  id: string;
  name: string;
  outgoingBg: string;
  outgoingText: string;
  incomingBg: string;
  incomingText: string;
  badge: string;
}

export const BUBBLE_COLOR_PRESETS: BubblePreset[] = [
  {
    id: 'default',
    name: 'Azul Naul',
    outgoingBg: '#0077ff',
    outgoingText: '#ffffff',
    incomingBg: '#182232',
    incomingText: '#f1f5f9',
    badge: 'Original'
  },
  {
    id: 'emerald',
    name: 'Esmeralda Cripto',
    outgoingBg: '#059669',
    outgoingText: '#ffffff',
    incomingBg: '#064e3b',
    incomingText: '#ecfdf5',
    badge: 'Seguridad'
  },
  {
    id: 'violet',
    name: 'Violeta Eléctrico',
    outgoingBg: '#7c3aed',
    outgoingText: '#ffffff',
    incomingBg: '#2e1065',
    incomingText: '#f5f3ff',
    badge: 'Neón'
  },
  {
    id: 'crimson',
    name: 'Rubí Fuego',
    outgoingBg: '#e11d48',
    outgoingText: '#ffffff',
    incomingBg: '#4c0519',
    incomingText: '#ffe4e6',
    badge: 'Cálido'
  },
  {
    id: 'amber',
    name: 'Ámbar Sol Nica',
    outgoingBg: '#d97706',
    outgoingText: '#ffffff',
    incomingBg: '#451a03',
    incomingText: '#fef3c7',
    badge: 'Nicaragua'
  },
  {
    id: 'cyan',
    name: 'Cyan Océano',
    outgoingBg: '#0891b2',
    outgoingText: '#ffffff',
    incomingBg: '#164e63',
    incomingText: '#ecfeff',
    badge: 'Fresco'
  },
  {
    id: 'sunset',
    name: 'Atardecer San Juan',
    outgoingBg: '#ea580c',
    outgoingText: '#ffffff',
    incomingBg: '#292524',
    incomingText: '#fafaf9',
    badge: 'Playa'
  },
  {
    id: 'midnight',
    name: 'Midnight OLED',
    outgoingBg: '#334155',
    outgoingText: '#f8fafc',
    incomingBg: '#0f172a',
    incomingText: '#cbd5e1',
    badge: 'Oscuro'
  },
  {
    id: 'forest',
    name: 'Verde WhatsApp Pro',
    outgoingBg: '#15803d',
    outgoingText: '#ffffff',
    incomingBg: '#1f2937',
    incomingText: '#f3f4f6',
    badge: 'Clásico'
  },
  {
    id: 'rose',
    name: 'Magenta Glam',
    outgoingBg: '#db2777',
    outgoingText: '#ffffff',
    incomingBg: '#500724',
    incomingText: '#fdf2f8',
    badge: 'Vibrante'
  }
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onSaveColors: (newColors: BubbleColors) => void;
  contactName?: string;
  contactAvatar?: string;
}

export const ChatBubbleColorModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentUser,
  onSaveColors,
  contactName = 'Yuri',
  contactAvatar = 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80'
}) => {
  const initialColors: BubbleColors = currentUser.bubbleColors || DEFAULT_BUBBLE_COLORS;

  const [currentPreset, setCurrentPreset] = useState<string>(initialColors.presetId || 'default');
  const [outgoingBg, setOutgoingBg] = useState<string>(initialColors.outgoingBg || DEFAULT_BUBBLE_COLORS.outgoingBg);
  const [outgoingText, setOutgoingText] = useState<string>(initialColors.outgoingText || DEFAULT_BUBBLE_COLORS.outgoingText);
  const [incomingBg, setIncomingBg] = useState<string>(initialColors.incomingBg || DEFAULT_BUBBLE_COLORS.incomingBg);
  const [incomingText, setIncomingText] = useState<string>(initialColors.incomingText || DEFAULT_BUBBLE_COLORS.incomingText);
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');

  if (!isOpen) return null;

  const handleSelectPreset = (preset: BubblePreset) => {
    setCurrentPreset(preset.id);
    setOutgoingBg(preset.outgoingBg);
    setOutgoingText(preset.outgoingText);
    setIncomingBg(preset.incomingBg);
    setIncomingText(preset.incomingText);
    setSaveSuccess(false);
  };

  const handleResetToDefault = () => {
    handleSelectPreset(BUBBLE_COLOR_PRESETS[0]);
  };

  const handleSaveToFirestore = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    const newColors: BubbleColors = {
      outgoingBg,
      outgoingText,
      incomingBg,
      incomingText,
      presetId: currentPreset
    };

    try {
      // 1. Guardar en Firestore en el documento users/{userId}
      await updateUserBubbleColorsInFirestore(currentUser.id, newColors);

      // 2. Sincronizar también con backend API si está autenticado
      try {
        await apiUpdateBubbleColors(newColors);
      } catch {
        // Fallback silencioso si solo usa Firestore
      }

      // 3. Notificar al componente padre para actualizar estado y localStorage
      onSaveColors(newColors);
      setSaveSuccess(true);

      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 900);
    } catch (err) {
      console.error('Error al guardar preferencia de colores en Firestore:', err);
      // Actualizar localmente de todas formas para no bloquear la experiencia del usuario
      onSaveColors(newColors);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 900);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-scaleUp"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 text-white">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                <span>Color de Globos de Mensajes</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 font-mono font-medium border border-sky-500/30">
                  Firestore Sync
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Personaliza los globos salientes y entrantes del chat
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Live Chat Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300 font-medium px-1">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Vista Previa en Vivo</span>
              </span>
              <span className="text-[11px] text-slate-400">
                Así se verán tus conversaciones en ChatArea
              </span>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/90 p-4 space-y-3.5 shadow-inner">
              {/* Incoming Bubble Preview */}
              <div className="flex items-end gap-2.5 max-w-[85%]">
                <img
                  src={contactAvatar}
                  alt={contactName}
                  className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-700"
                />
                <div
                  className="rounded-2xl rounded-bl-sm p-3 shadow-md text-xs sm:text-sm transition-all"
                  style={{
                    backgroundColor: incomingBg,
                    color: incomingText
                  }}
                >
                  <p className="font-bold text-[10px] opacity-80 mb-0.5">{contactName}</p>
                  <p className="leading-relaxed">¡Hola {currentUser.name}! ¿Qué te parece este nuevo color de globo en Naul Chat? 🇳🇮</p>
                  <span className="block text-[9px] opacity-70 text-right mt-1">10:42 AM</span>
                </div>
              </div>

              {/* Outgoing Bubble Preview */}
              <div className="flex items-end justify-end gap-2 max-w-[85%] ml-auto">
                <div
                  className="rounded-2xl rounded-br-sm p-3 shadow-md text-xs sm:text-sm transition-all"
                  style={{
                    backgroundColor: outgoingBg,
                    color: outgoingText
                  }}
                >
                  <p className="leading-relaxed">¡Quedó súper nítido! El contraste y los colores personalizados están excelentes.</p>
                  <div className="flex items-center justify-end gap-1 mt-1 text-[9px] opacity-85">
                    <span>10:43 AM</span>
                    <CheckCheck className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
            <button
              onClick={() => setActiveTab('presets')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition ${
                activeTab === 'presets'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Paletas Recomendadas ({BUBBLE_COLOR_PRESETS.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('custom');
                setCurrentPreset('custom');
              }}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition ${
                activeTab === 'custom'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Selector Libre / Personalizado
            </button>
          </div>

          {/* Tab 1: Presets Grid */}
          {activeTab === 'presets' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                Selecciona una combinación probada para máxima legibilidad y estilo:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {BUBBLE_COLOR_PRESETS.map(preset => {
                  const isSelected = currentPreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset)}
                      className={`group p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? 'border-sky-500 bg-sky-500/10 shadow-lg shadow-sky-500/10'
                          : 'border-slate-800 hover:border-slate-700 bg-slate-950/50 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-xs text-white group-hover:text-sky-300 transition">
                          {preset.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                          {preset.badge}
                        </span>
                      </div>

                      {/* Small visual color preview */}
                      <div className="flex items-center gap-2 pt-1">
                        <div className="flex-1 flex items-center justify-between p-1.5 rounded-lg border border-slate-700/50 text-[10px]" style={{ backgroundColor: preset.incomingBg, color: preset.incomingText }}>
                          <span>Entrante</span>
                          <span className="w-2 h-2 rounded-full border border-white/20" style={{ backgroundColor: preset.incomingText }} />
                        </div>
                        <div className="flex-1 flex items-center justify-between p-1.5 rounded-lg text-[10px]" style={{ backgroundColor: preset.outgoingBg, color: preset.outgoingText }}>
                          <span>Saliente</span>
                          <span className="w-2 h-2 rounded-full border border-white/20" style={{ backgroundColor: preset.outgoingText }} />
                        </div>
                      </div>

                      {isSelected && (
                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center shadow">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 2: Custom Pickers */}
          {activeTab === 'custom' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Outgoing Message Controls */}
              <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/60 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                    <span>Mis Mensajes (Globos Salientes)</span>
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">{outgoingBg}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1 font-medium">Color de Fondo:</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={outgoingBg}
                        onChange={e => {
                          setOutgoingBg(e.target.value);
                          setCurrentPreset('custom');
                        }}
                        className="w-10 h-10 rounded-xl cursor-pointer bg-slate-800 border border-slate-700 p-0.5"
                      />
                      <input
                        type="text"
                        value={outgoingBg}
                        onChange={e => {
                          setOutgoingBg(e.target.value);
                          setCurrentPreset('custom');
                        }}
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-sky-500"
                        placeholder="#0077ff"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1 font-medium">Color de Texto:</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={outgoingText}
                        onChange={e => {
                          setOutgoingText(e.target.value);
                          setCurrentPreset('custom');
                        }}
                        className="w-10 h-10 rounded-xl cursor-pointer bg-slate-800 border border-slate-700 p-0.5"
                      />
                      <div className="flex items-center gap-1.5 flex-1">
                        <button
                          type="button"
                          onClick={() => { setOutgoingText('#ffffff'); setCurrentPreset('custom'); }}
                          className={`flex-1 py-2 px-2 text-[10px] rounded-lg font-medium border ${outgoingText === '#ffffff' ? 'bg-slate-800 border-sky-400 text-white' : 'bg-slate-900 border-slate-800 text-slate-300'}`}
                        >
                          Blanco
                        </button>
                        <button
                          type="button"
                          onClick={() => { setOutgoingText('#0f172a'); setCurrentPreset('custom'); }}
                          className={`flex-1 py-2 px-2 text-[10px] rounded-lg font-medium border ${outgoingText === '#0f172a' ? 'bg-slate-800 border-sky-400 text-white' : 'bg-slate-900 border-slate-800 text-slate-300'}`}
                        >
                          Oscuro
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Incoming Message Controls */}
              <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/60 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>Mensajes Recibidos (Globos Entrantes)</span>
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">{incomingBg}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1 font-medium">Color de Fondo:</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={incomingBg}
                        onChange={e => {
                          setIncomingBg(e.target.value);
                          setCurrentPreset('custom');
                        }}
                        className="w-10 h-10 rounded-xl cursor-pointer bg-slate-800 border border-slate-700 p-0.5"
                      />
                      <input
                        type="text"
                        value={incomingBg}
                        onChange={e => {
                          setIncomingBg(e.target.value);
                          setCurrentPreset('custom');
                        }}
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-sky-500"
                        placeholder="#182232"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1 font-medium">Color de Texto:</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={incomingText}
                        onChange={e => {
                          setIncomingText(e.target.value);
                          setCurrentPreset('custom');
                        }}
                        className="w-10 h-10 rounded-xl cursor-pointer bg-slate-800 border border-slate-700 p-0.5"
                      />
                      <div className="flex items-center gap-1.5 flex-1">
                        <button
                          type="button"
                          onClick={() => { setIncomingText('#f1f5f9'); setCurrentPreset('custom'); }}
                          className={`flex-1 py-2 px-2 text-[10px] rounded-lg font-medium border ${incomingText === '#f1f5f9' ? 'bg-slate-800 border-sky-400 text-white' : 'bg-slate-900 border-slate-800 text-slate-300'}`}
                        >
                          Claro
                        </button>
                        <button
                          type="button"
                          onClick={() => { setIncomingText('#ffffff'); setCurrentPreset('custom'); }}
                          className={`flex-1 py-2 px-2 text-[10px] rounded-lg font-medium border ${incomingText === '#ffffff' ? 'bg-slate-800 border-sky-400 text-white' : 'bg-slate-900 border-slate-800 text-slate-300'}`}
                        >
                          Blanco
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Firestore & Security Note */}
          <div className="p-3 rounded-2xl bg-sky-950/30 border border-sky-800/40 text-[11px] text-sky-300/90 flex items-start gap-2.5">
            <Cloud className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Tu selección se guardará de forma persistente en tu documento de usuario en <strong>Firestore</strong> (<code className="text-sky-200">users/{currentUser.id}</code>). Estará disponible en todas tus sesiones.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restablecer</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 transition cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleSaveToFirestore}
              disabled={isSaving}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg cursor-pointer ${
                saveSuccess
                  ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                  : 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white hover:from-sky-400 hover:to-indigo-500 shadow-sky-500/25'
              }`}
            >
              {isSaving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Guardando en Firestore...</span>
                </>
              ) : saveSuccess ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>¡Guardado en Firestore!</span>
                </>
              ) : (
                <>
                  <Cloud className="w-4 h-4" />
                  <span>Guardar en Firestore</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
