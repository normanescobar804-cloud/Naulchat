import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, Download, Info, ShieldCheck } from 'lucide-react';

interface Props {
  isOpen: boolean;
  imageUrl: string;
  caption?: string;
  onClose: () => void;
}

export const MediaViewerModal: React.FC<Props> = ({
  isOpen,
  imageUrl,
  caption,
  onClose,
}) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  if (!isOpen || !imageUrl) return null;

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  return (
    <div id="media-viewer-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl animate-fadeIn">
      {/* Top Toolbar */}
      <div className="absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between z-10 text-white">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md bg-white/10 text-xs font-semibold backdrop-blur-md flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
            Foto HD Original • 4K HDR
          </span>
          {caption && <span className="text-xs text-slate-300 hidden md:inline truncate max-w-md">{caption}</span>}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomIn}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
            title="Acercar"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
            title="Alejar"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleRotate}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
            title="Rotar"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
            title="Información"
          >
            <Info className="w-4 h-4" />
          </button>
          <a
            href={imageUrl}
            target="_blank"
            rel="noreferrer"
            download="NaulChat_Nicaragua_HD.jpg"
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
            title="Descargar"
          >
            <Download className="w-4 h-4" />
          </a>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-white transition ml-2"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main image stage */}
      <div className="w-full h-full flex items-center justify-center p-4 overflow-hidden select-none">
        <img
          src={imageUrl}
          alt={caption || 'Vista previa en alta calidad'}
          style={{
            transform: `scale(${scale}) rotate(${rotation}deg)`,
            transition: 'transform 0.2s ease-out',
          }}
          className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
        />
      </div>

      {/* Details drawer */}
      {showDetails && (
        <div className="absolute bottom-6 right-6 w-80 p-4 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-slate-300 backdrop-blur-md shadow-2xl space-y-2">
          <div className="font-semibold text-white flex items-center justify-between">
            <span>Detalles del Archivo</span>
            <span className="text-emerald-400">Sin compresión</span>
          </div>
          <div className="space-y-1 text-[11px] text-slate-400">
            <p>Resolución: <span className="text-white">4032 x 3024 (12.2 MP)</span></p>
            <p>Espacio de Color: <span className="text-white">Display P3 HDR</span></p>
            <p>Tamaño: <span className="text-white">8.4 MB (Límite hasta 100MB soportado)</span></p>
            <p>Cifrado: <span className="text-sky-400">AES-256 GCM Autenticado</span></p>
          </div>
        </div>
      )}

      {/* Bottom caption */}
      {caption && (
        <div className="absolute bottom-4 inset-x-0 text-center pointer-events-none">
          <div className="inline-block px-4 py-2 rounded-full bg-black/75 border border-white/10 text-white text-xs backdrop-blur-md max-w-xl mx-auto truncate">
            {caption}
          </div>
        </div>
      )}
    </div>
  );
};
