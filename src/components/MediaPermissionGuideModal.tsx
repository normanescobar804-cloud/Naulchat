import React from 'react';
import { X, Mic, Video, ExternalLink, ShieldCheck, CheckCircle2, Lock, AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  target?: 'microphone' | 'camera' | 'both';
  callUrl?: string;
}

export const MediaPermissionGuideModal: React.FC<Props> = ({
  isOpen,
  onClose,
  target = 'both',
  callUrl,
}) => {
  if (!isOpen) return null;

  const handleOpenNewTab = () => {
    const url = callUrl || window.location.href;
    window.open(url, '_blank');
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div 
      id="media-permission-guide-modal"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-amber-950/50 via-slate-900 to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              {target === 'microphone' ? <Mic className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                <span>Cómo Desbloquear Micrófono y Cámara</span>
              </h3>
              <p className="text-[11px] text-amber-300/80">
                Solución rápida para videollamadas y notas de voz en Naul Chat
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto text-xs sm:text-sm">
          {/* Quick 1-click Solution Banner */}
          <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sky-300 text-xs sm:text-sm flex items-center gap-1.5">
                <ExternalLink className="w-4 h-4 text-sky-400" />
                <span>Solución 1: Abrir en pestaña independiente (Recomendado)</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-semibold">
                Inmediato
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Las vistas previas dentro de iframes a menudo tienen el hardware restringido por seguridad del navegador. Al abrir la app en una nueva pestaña, tu navegador te preguntará directamente <strong>"Permitir micrófono y cámara"</strong>.
            </p>
            <button
              onClick={handleOpenNewTab}
              className="w-full mt-1 py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 transition cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Abrir Naul Chat en Nueva Pestaña</span>
            </button>
          </div>

          {/* Browser Specific Steps */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Solución 2: Habilitar permisos en la barra de direcciones</span>
            </h4>

            {/* Step 1: Chrome / Edge */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="font-semibold text-slate-200 text-xs flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center text-[11px] font-bold">1</span>
                <span>En Google Chrome o Microsoft Edge:</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5 pl-7 list-disc">
                <li>
                  Haz clic en el <strong>icono del candado 🔒</strong> o <strong>Ajustes del sitio (deslizadores)</strong> en el extremo izquierdo de la barra de direcciones (donde ves la URL <code>https://...</code>).
                </li>
                <li>
                  Busca <strong>Micrófono</strong> y <strong>Cámara</strong> y cámbialos a <span className="text-emerald-400 font-bold">"Permitir"</span>.
                </li>
                <li>
                  Haz clic en <strong>Recargar</strong> para aplicar los cambios.
                </li>
              </ul>
            </div>

            {/* Step 2: Safari / iOS */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="font-semibold text-slate-200 text-xs flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center text-[11px] font-bold">2</span>
                <span>En Safari (Mac / iPhone):</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5 pl-7 list-disc">
                <li>
                  En iPhone/iPad: toca el botón <strong>aA</strong> en la barra de búsqueda y selecciona <em>Configuración del sitio web</em> &gt; activa <strong>Micrófono</strong> y <strong>Cámara</strong> en <em>Permitir</em>.
                </li>
                <li>
                  En Mac: Ve a <em>Safari &gt; Ajustes para este sitio web</em> y activa Cámara y Micrófono.
                </li>
              </ul>
            </div>
          </div>

          {/* Voice Notes & Calls guarantee */}
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-300/90 leading-relaxed">
              <strong className="text-emerald-300">Modo Asistido Activo:</strong> Si decides no habilitar el micrófono físico ahora mismo, Naul Chat te permite seguir grabando notas de voz con audio acústico sintetizado de alta calidad, y tus llamadas seguirán conectando con avatar animado.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleReload}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Recargar Página</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
