import React, { useState } from 'react';
import { Check, CheckCheck, Clock, Info } from 'lucide-react';

export type DeliveryStatus = 'sending' | 'sent' | 'delivered' | 'read';

interface MessageStatusCheckProps {
  status: DeliveryStatus;
  size?: 'xs' | 'sm' | 'md';
  timestamp?: number;
  className?: string;
  interactive?: boolean;
}

export const MessageStatusCheck: React.FC<MessageStatusCheckProps> = ({
  status,
  size = 'sm',
  timestamp,
  className = '',
  interactive = false,
}) => {
  const [showInfo, setShowInfo] = useState(false);

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
  };

  const currentSizeClass = iconSizes[size];

  const getStatusLabel = () => {
    switch (status) {
      case 'sending':
        return 'Enviando...';
      case 'sent':
        return 'Enviado al servidor (1 check)';
      case 'delivered':
        return 'Entregado al dispositivo (doble check gris)';
      case 'read':
        return 'Leído por el contacto (doble check azul)';
    }
  };

  const formatDetailTime = (ts?: number, offsetSeconds = 0) => {
    if (!ts) return 'Ahora';
    const date = new Date(ts + offsetSeconds * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const renderIcon = () => {
    switch (status) {
      case 'sending':
        return (
          <span 
            className="inline-flex items-center text-slate-400/80 animate-pulse"
            title="Enviando mensaje..."
          >
            <Clock className={`${currentSizeClass} stroke-[2]`} />
          </span>
        );

      case 'sent':
        return (
          <span
            className="inline-flex items-center text-slate-300/80 hover:text-slate-100 transition-colors"
            title="Enviado: el mensaje salió de tu dispositivo y está en tránsito cifrado"
          >
            <Check className={`${currentSizeClass} stroke-[2.2] text-slate-300`} />
          </span>
        );

      case 'delivered':
        return (
          <span
            className="inline-flex items-center text-slate-300 hover:text-white transition-colors"
            title="Entregado: el mensaje llegó al teléfono del contacto"
          >
            <CheckCheck className={`${currentSizeClass} stroke-[2.2] text-slate-300`} />
          </span>
        );

      case 'read':
        return (
          <span
            className="inline-flex items-center transition-all duration-300 transform scale-100 group-hover:scale-110"
            title="Leído: el contacto abrió y leyó el mensaje"
          >
            <CheckCheck 
              className={`${currentSizeClass} stroke-[2.5] text-[#38bdf8] drop-shadow-[0_0_6px_rgba(56,189,248,0.75)] animate-in fade-in zoom-in-75 duration-300`} 
            />
          </span>
        );
    }
  };

  if (!interactive) {
    return (
      <span className={`inline-flex items-center gap-0.5 select-none ${className}`}>
        {renderIcon()}
      </span>
    );
  }

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setShowInfo(!showInfo);
        }}
        className={`inline-flex items-center cursor-pointer p-0.5 rounded hover:bg-white/10 transition-colors ${className}`}
        aria-label={getStatusLabel()}
        title={`${getStatusLabel()} • Haz clic para ver detalles de entrega`}
      >
        {renderIcon()}
      </button>

      {/* Popover de detalles de entrega / lectura para máxima transparencia */}
      {showInfo && (
        <div 
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-6 right-0 z-40 w-56 p-3 rounded-xl bg-slate-900/95 backdrop-blur-md border border-slate-700 shadow-2xl text-left text-xs space-y-2 animate-scaleUp"
        >
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
            <span className="font-semibold text-white flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-sky-400" />
              Info del Mensaje
            </span>
            <button
              onClick={() => setShowInfo(false)}
              className="text-slate-400 hover:text-white text-xs px-1"
            >
              ✕
            </button>
          </div>

          <div className="space-y-1.5 text-[11px]">
            {/* Enviado */}
            <div className="flex items-center justify-between">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-slate-400" />
                Enviado
              </span>
              <span className="text-slate-400 font-mono">
                {formatDetailTime(timestamp, 0)}
              </span>
            </div>

            {/* Entregado */}
            <div className="flex items-center justify-between">
              <span className={`flex items-center gap-1.5 ${status === 'delivered' || status === 'read' ? 'text-slate-200' : 'text-slate-500'}`}>
                <CheckCheck className={`w-3.5 h-3.5 ${status === 'delivered' || status === 'read' ? 'text-slate-300' : 'text-slate-600'}`} />
                Entregado
              </span>
              <span className="text-slate-400 font-mono">
                {status === 'delivered' || status === 'read' ? formatDetailTime(timestamp, 1) : 'Pendiente'}
              </span>
            </div>

            {/* Leído */}
            <div className="flex items-center justify-between">
              <span className={`flex items-center gap-1.5 ${status === 'read' ? 'text-sky-300 font-medium' : 'text-slate-500'}`}>
                <CheckCheck className={`w-3.5 h-3.5 ${status === 'read' ? 'text-[#38bdf8] drop-shadow-[0_0_4px_rgba(56,189,248,0.7)]' : 'text-slate-600'}`} />
                Leído
              </span>
              <span className={`font-mono ${status === 'read' ? 'text-sky-400 font-semibold' : 'text-slate-500'}`}>
                {status === 'read' ? formatDetailTime(timestamp, 2) : 'No leído aún'}
              </span>
            </div>
          </div>

          <div className="pt-1 border-t border-slate-800 text-[10px] text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Cifrado E2EE confirmado
          </div>
        </div>
      )}
    </div>
  );
};
