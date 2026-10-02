import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Camera, Upload, RotateCw, ZoomIn, Check, 
  Trash2, Sparkles, Link as LinkIcon, RefreshCw, AlertCircle,
  Eye, ShieldCheck, Heart, User as UserIcon, Palette
} from 'lucide-react';
import { User } from '../types';
import { apiUpdateUserAvatar } from '../services/api';

interface EditProfilePhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onUpdateUser: (updated: Partial<User>) => void;
}

// Avatares temáticos nicaragüenses y universales de alta fidelidad
const CURATED_NICARAGUA_AVATARS = [
  // Símbolos de Nicaragua
  {
    id: 'nica-guardabarranco',
    category: 'Nicaragua 🇳🇮',
    name: 'Guardabarranco',
    url: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'nica-sacuanjoche',
    category: 'Nicaragua 🇳🇮',
    name: 'Flor de Sacuanjoche',
    url: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'nica-volcan',
    category: 'Nicaragua 🇳🇮',
    name: 'Volcán Masaya',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'nica-laguna',
    category: 'Nicaragua 🇳🇮',
    name: 'Laguna de Apoyo',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&auto=format&fit=crop&q=80'
  },
  // Profesionales & Emprendedores
  {
    id: 'pro-man',
    category: 'Profesional 💼',
    name: 'Emprendedor',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'pro-woman',
    category: 'Profesional 💼',
    name: 'Ejecutiva',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'pro-business-2',
    category: 'Profesional 💼',
    name: 'Asesor Comercial',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'pro-business-3',
    category: 'Profesional 💼',
    name: 'Líder de Negocio',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80'
  },
  // Estilo 3D & Moderno
  {
    id: 'modern-3d-boy',
    category: 'Moderno & 3D 🎨',
    name: 'Chico 3D Urbano',
    url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'modern-3d-girl',
    category: 'Moderno & 3D 🎨',
    name: 'Chica 3D Creativa',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'modern-tech',
    category: 'Moderno & 3D 🎨',
    name: 'Tecnología Naul',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'modern-pinolero',
    category: 'Moderno & 3D 🎨',
    name: 'Juventud Pinolera',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80'
  }
];

export const EditProfilePhotoModal: React.FC<EditProfilePhotoModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<string>(currentUser.avatar);
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [activeFilter, setActiveFilter] = useState<'normal' | 'warm' | 'bw' | 'vibrant' | 'pinolero'>('normal');
  const [activeTab, setActiveTab] = useState<'gallery' | 'presets' | 'camera' | 'url'>('gallery');
  const [urlInput, setUrlInput] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Camera capture states
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedPhoto(currentUser.avatar);
      setZoom(1);
      setRotation(0);
      setActiveFilter('normal');
      setError(null);
    } else {
      stopCamera();
    }
  }, [isOpen, currentUser.avatar]);

  // Handle Camera
  const startCamera = async () => {
    stopCamera();
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: cameraFacing, width: { ideal: 640 }, height: { ideal: 640 } },
        audio: false
      });
      setCameraStream(stream);
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.warn('Error accessing camera:', err);
      setError('No se pudo acceder a la cámara. Asegúrate de otorgar los permisos necesarios.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(t => t.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  const takeCameraSnapshot = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw square cropped center snapshot
    const video = videoRef.current;
    const size = Math.min(video.videoWidth, video.videoHeight);
    const startX = (video.videoWidth - size) / 2;
    const startY = (video.videoHeight - size) / 2;

    ctx.drawImage(video, startX, startY, size, size, 0, 0, 400, 400);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setSelectedPhoto(dataUrl);
    stopCamera();
    setActiveTab('gallery');
    showNotification('¡Foto tomada con éxito!');
  };

  // Handle Local File Upload with Auto-Resizing
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona un archivo de imagen válido (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = document.createElement('img');
      img.onload = () => {
        // Compress & resize to 500x500 square via canvas for speed
        const canvas = document.createElement('canvas');
        const maxDim = 500;
        canvas.width = maxDim;
        canvas.height = maxDim;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setSelectedPhoto(event.target?.result as string);
          return;
        }

        const minSide = Math.min(img.width, img.height);
        const sx = (img.width - minSide) / 2;
        const sy = (img.height - minSide) / 2;

        ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, maxDim, maxDim);
        const optimized = canvas.toDataURL('image/jpeg', 0.88);
        setSelectedPhoto(optimized);
        setZoom(1);
        setRotation(0);
        showNotification('Foto cargada desde tu dispositivo');
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      setError('No se pudo leer el archivo seleccionado.');
    };
    reader.readAsDataURL(file);
  };

  // Handle URL Load
  const handleLoadUrl = () => {
    if (!urlInput.trim()) return;
    setError(null);
    try {
      new URL(urlInput.trim());
      setSelectedPhoto(urlInput.trim());
      showNotification('Imagen cargada desde enlace web');
      setUrlInput('');
    } catch {
      setError('Por favor ingresa una URL web válida (ej. https://...).');
    }
  };

  // Filter css calculation
  const getFilterStyle = () => {
    switch (activeFilter) {
      case 'warm':
        return 'sepia(35%) saturate(140%) brightness(105%)';
      case 'bw':
        return 'grayscale(100%) contrast(115%)';
      case 'vibrant':
        return 'saturate(160%) contrast(110%)';
      case 'pinolero':
        return 'hue-rotate(-15deg) saturate(135%) brightness(105%)';
      default:
        return 'none';
    }
  };

  // Apply final canvas transformations when saving
  const handleSaveAvatar = async () => {
    setIsSaving(true);
    setError(null);

    try {
      // Build final image with rotation, zoom and filter baked in
      const canvas = document.createElement('canvas');
      const size = 400;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      let finalAvatarUrl = selectedPhoto;

      if (ctx) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => resolve(); // fallback if CORS blocks canvas export
          img.src = selectedPhoto;
        });

        if (img.complete && img.naturalWidth > 0) {
          ctx.save();
          ctx.filter = getFilterStyle();
          ctx.translate(size / 2, size / 2);
          ctx.rotate((rotation * Math.PI) / 180);
          ctx.scale(zoom, zoom);
          ctx.drawImage(img, -size / 2, -size / 2, size, size);
          ctx.restore();
          try {
            finalAvatarUrl = canvas.toDataURL('image/jpeg', 0.9);
          } catch {
            // CORS fallback: use original URL
            finalAvatarUrl = selectedPhoto;
          }
        }
      }

      // Update in server database
      const res = await apiUpdateUserAvatar(finalAvatarUrl);
      if (res) {
        onUpdateUser({ avatar: res.avatar || finalAvatarUrl });
      } else {
        onUpdateUser({ avatar: finalAvatarUrl });
      }

      showNotification('¡Foto de perfil actualizada con éxito en Naul Chat!');
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      console.error('Error saving avatar:', err);
      setError('Error al guardar la foto de perfil en el servidor.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefault = () => {
    const defaultAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(currentUser.name || 'NaulUser')}`;
    setSelectedPhoto(defaultAvatar);
    setZoom(1);
    setRotation(0);
    setActiveFilter('normal');
    showNotification('Foto restablecida a avatar inicial');
  };

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />

      <div className="bg-[#091322] border border-slate-700/90 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 bg-[#060e1a] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-white text-base leading-tight">
                Editar Foto de Perfil
              </h3>
              <p className="text-[11px] text-slate-400">
                Cámbiala cuando desees en Naul Chat 🇳🇮
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="mx-4 mt-3 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mx-4 mt-3 p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-medium flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* Main Photo Preview with Controls */}
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-b from-[#0b172a] to-[#070e1a] border border-slate-800">
            {/* Camera View Mode */}
            {isCameraActive ? (
              <div className="relative w-56 h-56 rounded-full overflow-hidden border-4 border-sky-500 shadow-2xl bg-black flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setCameraFacing(prev => prev === 'user' ? 'environment' : 'user')}
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/70 text-white hover:bg-black transition cursor-pointer"
                  title="Girar cámara"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Circular Avatar Preview with Live Zoom & Rotation */
              <div className="relative group">
                <div className="w-44 h-44 sm:w-48 sm:h-48 rounded-full overflow-hidden border-4 border-sky-400 shadow-2xl bg-slate-900 flex items-center justify-center">
                  <img
                    src={selectedPhoto}
                    alt={currentUser.name}
                    style={{
                      transform: `scale(${zoom}) rotate(${rotation}deg)`,
                      filter: getFilterStyle(),
                      transition: 'transform 0.15s ease-out, filter 0.2s ease'
                    }}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 p-2 rounded-full bg-sky-500 text-white shadow-lg border-2 border-[#091322]">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
            )}

            {/* Quick Action Buttons Under Avatar */}
            {isCameraActive ? (
              <div className="flex items-center gap-3 mt-4">
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold transition cursor-pointer"
                >
                  Cancelar Cámara
                </button>
                <button
                  type="button"
                  onClick={takeCameraSnapshot}
                  className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-xs text-white font-bold flex items-center gap-1.5 shadow-lg shadow-sky-500/30 transition cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>Capturar Foto</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Subir Foto</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    startCamera();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Tomar con Cámara</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRotation(r => (r + 90) % 360)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                  title="Girar foto 90°"
                >
                  <RotateCw className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                  title="Quitar foto / Usar avatar por defecto"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Zoom Slider */}
            {!isCameraActive && (
              <div className="w-full max-w-xs mt-4 px-2 space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <ZoomIn className="w-3 h-3 text-sky-400" />
                    <span>Zoom de recorte:</span>
                  </span>
                  <span className="font-mono text-sky-400 font-bold">{Math.round(zoom * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="2.2"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                />
              </div>
            )}

            {/* Visual Color Tone Filters */}
            {!isCameraActive && (
              <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-800/80">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mr-1">
                  Filtro:
                </span>
                {[
                  { id: 'normal', label: 'Original' },
                  { id: 'pinolero', label: '🇳🇮 Pinolero' },
                  { id: 'warm', label: 'Cálido' },
                  { id: 'vibrant', label: 'Vívido' },
                  { id: 'bw', label: 'B&N' }
                ].map(f => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setActiveFilter(f.id as any)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition cursor-pointer ${
                      activeFilter === f.id
                        ? 'bg-sky-500 text-white font-bold'
                        : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Navigation Tabs for Selection Modes */}
          <div className="space-y-3">
            <div className="flex border-b border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('presets')}
                className={`flex-1 py-2 font-bold text-center border-b-2 transition cursor-pointer ${
                  activeTab === 'presets'
                    ? 'border-sky-500 text-sky-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                🇳🇮 Galería Naul Chat
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('url')}
                className={`flex-1 py-2 font-bold text-center border-b-2 transition cursor-pointer ${
                  activeTab === 'url'
                    ? 'border-sky-500 text-sky-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                🔗 Pegar Enlace Web
              </button>
            </div>

            {/* Presets Grid */}
            {activeTab === 'presets' && (
              <div className="space-y-3 animate-fadeIn">
                <p className="text-[11px] text-slate-400">
                  Selecciona uno de los avatares oficiales diseñados para los usuarios de Nicaragua:
                </p>
                <div className="grid grid-cols-4 gap-2.5 max-h-48 overflow-y-auto pr-1">
                  {CURATED_NICARAGUA_AVATARS.map(avatar => (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => {
                        setSelectedPhoto(avatar.url);
                        setZoom(1);
                        setRotation(0);
                        showNotification(`Avatar seleccionado: ${avatar.name}`);
                      }}
                      className={`relative p-1 rounded-2xl border transition group cursor-pointer flex flex-col items-center gap-1 ${
                        selectedPhoto === avatar.url
                          ? 'border-sky-400 bg-sky-500/10'
                          : 'border-slate-800 hover:border-slate-700 bg-slate-900/60'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-700/80">
                        <img
                          src={avatar.url}
                          alt={avatar.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                          loading="lazy"
                        />
                      </div>
                      <span className="text-[9px] font-medium text-slate-300 truncate w-full text-center">
                        {avatar.name}
                      </span>
                      {selectedPhoto === avatar.url && (
                        <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-sky-400 text-slate-950 flex items-center justify-center text-[8px] font-bold">
                          ✓
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* URL Input */}
            {activeTab === 'url' && (
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5 animate-fadeIn">
                <label className="text-xs font-semibold text-slate-300 block">
                  Pega el enlace directo de cualquier imagen de internet:
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://ejemplo.com/mi-foto.jpg"
                    className="flex-1 px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                  <button
                    type="button"
                    onClick={handleLoadUrl}
                    className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition cursor-pointer"
                  >
                    Cargar
                  </button>
                </div>
                <p className="text-[10px] text-slate-400">
                  Admite formatos JPG, PNG, GIF, WebP o enlaces de Google Fotos.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-[#060e1a] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={handleSaveAvatar}
            className="flex-1 py-2.5 px-5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 transition cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>Guardando en BD...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Guardar Foto de Perfil</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
