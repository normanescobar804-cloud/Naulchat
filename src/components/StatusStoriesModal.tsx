import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Eye, Clock, X, Sparkles, ChevronRight, Play, Pause, 
  Music, Video, Image, Volume2, VolumeX, Upload, AlertCircle, 
  Megaphone, Store, MapPin, MessageCircle, RefreshCw, Trash2, 
  CheckCircle, Timer, ShieldCheck
} from 'lucide-react';
import { User, UserStatusStory } from '../types';
import { 
  apiGetStatuses, 
  apiCreateStatus, 
  apiRecordStatusView,
  apiRenewStatus,
  apiToggleStatusAutoRenew,
  apiDeleteStatus
} from '../services/api';
import { INITIAL_SPONSORED_ADS } from '../data/monetizationData';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onReplyToStory?: (storyUser: UserStatusStory, text: string) => void;
  onOpenDirectChat?: (userId: string) => void;
}

const NICA_MUSIC_TRACKS = [
  {
    title: 'Nicaragua Mía',
    artist: 'Tino López Guerra',
    url: 'https://cdn.freesound.org/previews/518/518888_6142149-lq.mp3'
  },
  {
    title: 'Son Nica Tradicional',
    artist: 'Camilo Zapata',
    url: 'https://cdn.freesound.org/previews/456/456123_5121236-lq.mp3'
  },
  {
    title: 'Alforja Campesina',
    artist: 'Los Caracoles',
    url: 'https://cdn.freesound.org/previews/320/320655_5260872-lq.mp3'
  },
  {
    title: 'Ritmo Marimba de Masaya',
    artist: 'Folklore Nicaragüense',
    url: 'https://cdn.freesound.org/previews/448/448080_9159316-lq.mp3'
  }
];

/**
 * LazyStoryMedia: Carga diferida optimizada (lazy loading) para imágenes y videos de historias
 * Evita bloqueos de red y renderiza esqueletos de carga suaves.
 */
const LazyStoryMedia: React.FC<{
  mediaUrl: string;
  mediaType: 'image' | 'video';
  alt?: string;
  className?: string;
}> = ({ mediaUrl, mediaType, alt = 'Estado', className = '' }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative w-full h-full flex items-center justify-center overflow-hidden bg-slate-950 ${className}`}>
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-sm animate-pulse z-10">
          <div className="w-8 h-8 rounded-full border-2 border-sky-400 border-t-transparent animate-spin mb-2" />
          <span className="text-[11px] text-sky-300 font-medium">Cargando estado...</span>
        </div>
      )}
      {hasError ? (
        <div className="text-center p-4 text-slate-400 text-xs flex flex-col items-center gap-1.5">
          <AlertCircle className="w-5 h-5 text-rose-400" />
          <span>No se pudo cargar el archivo multimedia</span>
        </div>
      ) : mediaType === 'video' ? (
        <video
          src={mediaUrl}
          preload="metadata"
          className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          autoPlay
          loop
          playsInline
          onLoadedData={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
        />
      ) : (
        <img
          src={mediaUrl}
          alt={alt}
          loading="lazy"
          decoding="async"
          className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
        />
      )}
    </div>
  );
};

export const StatusStoriesModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentUser,
  onReplyToStory,
  onOpenDirectChat,
}) => {
  const [stories, setStories] = useState<UserStatusStory[]>([]);
  const [myStories, setMyStories] = useState<UserStatusStory[]>([]);
  const [activeStory, setActiveStory] = useState<UserStatusStory | null>(null);
  const [showCreateStory, setShowCreateStory] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRenewing, setIsRenewing] = useState(false);
  const [statusNotification, setStatusNotification] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [nowTick, setNowTick] = useState(Date.now());

  // Form states
  const [storyMediaType, setStoryMediaType] = useState<'text' | 'image' | 'video'>('text');
  const [newStoryText, setNewStoryText] = useState('');
  const [mediaDataUrl, setMediaDataUrl] = useState<string>('');
  const [selectedBg, setSelectedBg] = useState('from-sky-600 to-blue-800');
  const [selectedMusic, setSelectedMusic] = useState<{ title: string; artist?: string; url?: string } | null>(null);
  const [customAudioUrl, setCustomAudioUrl] = useState<string>('');

  // Audio player ref for Story viewer
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(true);
  const [showViewersList, setShowViewersList] = useState(false);

  // Live timer tick every 30 seconds for accurate countdowns
  useEffect(() => {
    const timer = setInterval(() => setNowTick(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  // Load statuses from database on open
  useEffect(() => {
    if (!isOpen) return;
    loadStatuses();
  }, [isOpen]);

  const loadStatuses = async () => {
    try {
      const data = await apiGetStatuses();
      if (data && data.length > 0) {
        setStories(data.filter(s => s.userId !== currentUser.id));
        setMyStories(data.filter(s => s.userId === currentUser.id));
      } else {
        setStories([]);
        setMyStories([]);
      }
    } catch (err) {
      console.error('Error loading statuses from db:', err);
    }
  };

  const showToast = (msg: string) => {
    setStatusNotification(msg);
    setTimeout(() => setStatusNotification(null), 3500);
  };

  const formatRemainingTime = (story: UserStatusStory) => {
    const expiresAt = story.expiresAt || (story.timestamp + 24 * 3600 * 1000);
    const diffMs = expiresAt - nowTick;
    if (diffMs <= 0) return 'Expirado (Toca renovar)';
    const hours = Math.floor(diffMs / 3600000);
    const minutes = Math.floor((diffMs % 3600000) / 60000);
    if (hours > 0) return `${hours}h ${minutes}m restantes`;
    return `${minutes} min restantes`;
  };

  const getRemainingPercent = (story: UserStatusStory) => {
    const expiresAt = story.expiresAt || (story.timestamp + 24 * 3600 * 1000);
    const remaining = Math.max(0, expiresAt - nowTick);
    return Math.min(100, Math.max(4, (remaining / (24 * 3600 * 1000)) * 100));
  };

  // Renovar estado por 24 horas más
  const handleRenewStatus = async (storyId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsRenewing(true);
    try {
      const renewed = await apiRenewStatus(storyId);
      if (renewed) {
        setMyStories(prev => prev.map(s => s.id === storyId ? renewed : s));
        if (activeStory?.id === storyId) {
          setActiveStory(renewed);
        }
        showToast('¡Estado renovado por 24 horas más con éxito! 🇳🇮');
      }
    } catch (err) {
      console.error('Error renewing status:', err);
      showToast('Error al renovar el estado');
    } finally {
      setIsRenewing(false);
    }
  };

  // Activar o desactivar auto-renovación cada 24 horas
  const handleToggleAutoRenew = async (storyId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const res = await apiToggleStatusAutoRenew(storyId);
      if (res) {
        setMyStories(prev => prev.map(s => s.id === storyId ? { ...s, autoRenew: res.autoRenew } : s));
        if (activeStory?.id === storyId) {
          setActiveStory(prev => prev ? { ...prev, autoRenew: res.autoRenew } : null);
        }
        showToast(res.autoRenew ? 'Auto-renovación cada 24h ACTIVADA 🔄' : 'Auto-renovación cada 24h desactivada');
      }
    } catch (err) {
      console.error('Error toggling auto-renew:', err);
    }
  };

  // Eliminar estado
  const handleDeleteStatus = async (storyId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const ok = await apiDeleteStatus(storyId);
      if (ok) {
        setMyStories(prev => prev.filter(s => s.id !== storyId));
        if (activeStory?.id === storyId) {
          setActiveStory(null);
        }
        showToast('Estado eliminado de la base de datos');
      }
    } catch (err) {
      console.error('Error deleting status:', err);
    }
  };

  // Renovar todos mis estados juntos
  const handleRenewAllMyStatuses = async () => {
    if (myStories.length === 0) return;
    setIsRenewing(true);
    try {
      const updatedList = await Promise.all(
        myStories.map(async s => {
          const renewed = await apiRenewStatus(s.id);
          return renewed || s;
        })
      );
      setMyStories(updatedList);
      showToast(`¡Se renovaron ${updatedList.length} estado(s) por 24 horas más! 🇳🇮`);
    } catch (err) {
      console.error('Error renewing all statuses:', err);
    } finally {
      setIsRenewing(false);
    }
  };

  const handleOpenStory = async (story: UserStatusStory) => {
    setActiveStory(story);
    setShowViewersList(false);
    if (story.userId !== currentUser.id) {
      try {
        const res = await apiRecordStatusView(story.id);
        if (res) {
          setStories(prev => prev.map(s => s.id === story.id ? { ...s, viewsCount: res.viewsCount, viewers: res.viewers } : s));
        }
      } catch (e) {
        console.error('Error recording view:', e);
      }
    }
  };

  // Handle media file upload (Photo or Video)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);

    // Limit check: 10MB for images, 25MB for videos
    const maxBytes = type === 'video' ? 25 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxBytes) {
      setUploadError(`El archivo excede el tamaño máximo permitido (${type === 'video' ? '25 MB' : '10 MB'}).`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setMediaDataUrl(reader.result as string);
      setStoryMediaType(type);
    };
    reader.onerror = () => {
      setUploadError('Error al procesar el archivo seleccionado.');
    };
    reader.readAsDataURL(file);
  };

  // Handle music file upload
  const handleAudioFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);

    if (file.size > 15 * 1024 * 1024) {
      setUploadError('El archivo de audio no debe superar los 15 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setCustomAudioUrl(dataUrl);
      setSelectedMusic({
        title: file.name.replace(/\.[^/.]+$/, ''),
        artist: 'Mi Música',
        url: dataUrl
      });
    };
    reader.onerror = () => {
      setUploadError('Error al leer el archivo de música.');
    };
    reader.readAsDataURL(file);
  };

  const handlePublishStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoryText.trim() && !mediaDataUrl) return;

    setIsLoading(true);
    setUploadError(null);
    try {
      const saved = await apiCreateStatus({
        mediaUrl: mediaDataUrl || undefined,
        mediaType: storyMediaType,
        audioTrack: selectedMusic || undefined,
        text: newStoryText.trim() || undefined,
        bgColor: selectedBg
      });

      const newStory: UserStatusStory = saved || {
        id: `my-story-${Date.now()}`,
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatar,
        mediaUrl: mediaDataUrl || undefined,
        mediaType: storyMediaType,
        audioTrack: selectedMusic || undefined,
        text: newStoryText.trim() || undefined,
        bgColor: selectedBg,
        timestamp: Date.now(),
        expiresAt: Date.now() + 24 * 3600 * 1000,
        viewsCount: 0
      };

      setMyStories(prev => [newStory, ...prev]);
      setNewStoryText('');
      setMediaDataUrl('');
      setSelectedMusic(null);
      setShowCreateStory(false);
    } catch (err: any) {
      console.error('Error publishing status:', err);
      setUploadError(err.message || 'Error al guardar el estado en el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  // Play audio when viewing story with music
  useEffect(() => {
    if (activeStory?.audioTrack?.url) {
      if (!audioRef.current) {
        audioRef.current = new Audio(activeStory.audioTrack.url);
        audioRef.current.loop = true;
      } else {
        audioRef.current.src = activeStory.audioTrack.url;
      }
      audioRef.current.play().catch(() => {
        setIsPlayingAudio(false);
      });
      setIsPlayingAudio(true);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [activeStory]);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlayingAudio(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-[#091220] border border-slate-700/80 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-800 bg-[#070e1a] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-display font-extrabold text-white text-base">Estados / Historias</span>
            <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 text-[11px] font-bold">
              Fotos, Videos y Música
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Toast Notification */}
          {statusNotification && (
            <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between animate-fadeIn shadow-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{statusNotification}</span>
              </div>
              <button onClick={() => setStatusNotification(null)} className="p-1 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* 24h Cycle Information Banner */}
          <div className="p-3 rounded-2xl bg-sky-950/40 border border-sky-500/30 flex items-start gap-2.5">
            <Timer className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <div className="flex-1 text-[11px] text-slate-300 leading-relaxed">
              <span className="font-bold text-sky-300">Ciclo Oficial de 24 Horas: </span>
              Los estados permanecen visibles durante 24 horas exactas. Puedes 
              <span className="text-white font-semibold"> renovarlos por 24 horas más </span> 
              en cualquier momento con un solo toque o activar la auto-renovación continua.
            </div>
          </div>

          {/* My status card */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-sky-400"
                  />
                  <button
                    onClick={() => setShowCreateStory(true)}
                    className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-md hover:bg-sky-400 transition cursor-pointer"
                    title="Crear nuevo estado"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span>Mi Estado</span>
                    <span className="text-[10px] text-sky-400 font-normal px-2 py-0.2 rounded-full bg-sky-950/80 border border-sky-800/60">
                      24 Horas
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    {myStories.length > 0
                      ? `${myStories.length} estado(s) activo(s) en BD`
                      : 'Comparte fotos, videos o música que duran 24 horas'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {myStories.length > 1 && (
                  <button
                    onClick={handleRenewAllMyStatuses}
                    disabled={isRenewing}
                    className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1 transition cursor-pointer border border-amber-500/30"
                    title="Renovar todos mis estados por 24 horas más"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRenewing ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Renovar Todos</span>
                  </button>
                )}
                {myStories.length > 0 && (
                  <button
                    onClick={() => handleOpenStory(myStories[0])}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ver</span>
                  </button>
                )}
                <button
                  onClick={() => setShowCreateStory(true)}
                  className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Crear</span>
                </button>
              </div>
            </div>

            {/* List of My Active Stories with Renewal Controls */}
            {myStories.length > 0 && (
              <div className="pt-2 border-t border-slate-800/80 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Mis Estados Activos & Renovación
                </span>

                <div className="space-y-2">
                  {myStories.map(story => {
                    const remainingPercent = getRemainingPercent(story);
                    const isExpiringSoon = remainingPercent < 20;

                    return (
                      <div
                        key={story.id}
                        className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/90 flex flex-col gap-2 hover:border-slate-700 transition"
                      >
                        <div className="flex items-center justify-between gap-2">
                          {/* Left: Thumbnail & Content summary */}
                          <div 
                            onClick={() => handleOpenStory(story)}
                            className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                          >
                            <div className="w-9 h-9 rounded-lg overflow-hidden border border-slate-700 bg-slate-900 shrink-0 relative">
                              {story.mediaUrl ? (
                                story.mediaType === 'video' ? (
                                  <video src={story.mediaUrl} className="w-full h-full object-cover" />
                                ) : (
                                  <img src={story.mediaUrl} alt="Miniatura" className="w-full h-full object-cover" />
                                )
                              ) : (
                                <div className={`w-full h-full bg-gradient-to-br ${story.bgColor || 'from-sky-700 to-blue-900'} flex items-center justify-center text-[9px] text-white font-bold p-1 text-center truncate`}>
                                  Aa
                                </div>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-white truncate">
                                {story.text || (story.mediaType === 'video' ? 'Video' : 'Foto')}
                              </p>
                              <div className="flex items-center gap-2 text-[10px]">
                                <span className={`flex items-center gap-1 font-semibold ${isExpiringSoon ? 'text-rose-400 animate-pulse' : 'text-sky-400'}`}>
                                  <Clock className="w-3 h-3" />
                                  <span>{formatRemainingTime(story)}</span>
                                </span>
                                {story.renewedCount && story.renewedCount > 0 ? (
                                  <span className="text-emerald-400 bg-emerald-950/60 px-1 rounded text-[9px]">
                                    {story.renewedCount}x renovado
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          </div>

                          {/* Right action buttons: Renew, Auto-Renew Toggle, Delete */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Auto-renew toggle */}
                            <button
                              type="button"
                              onClick={(e) => handleToggleAutoRenew(story.id, e)}
                              className={`p-1.5 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition cursor-pointer border ${
                                story.autoRenew
                                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                              }`}
                              title={story.autoRenew ? 'Auto-renovación cada 24h activada (toca para desactivar)' : 'Activar auto-renovación automática cada 24h'}
                            >
                              <Sparkles className="w-3 h-3 text-emerald-400" />
                              <span className="hidden sm:inline">{story.autoRenew ? 'Auto 24h' : 'Manual'}</span>
                            </button>

                            {/* Renew Button */}
                            <button
                              type="button"
                              disabled={isRenewing}
                              onClick={(e) => handleRenewStatus(story.id, e)}
                              className="px-2.5 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                              title="Renovar por 24 horas más a partir de ahora"
                            >
                              <RefreshCw className={`w-3.5 h-3.5 ${isRenewing ? 'animate-spin' : ''}`} />
                              <span>Renovar 24h</span>
                            </button>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={(e) => handleDeleteStatus(story.id, e)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                              title="Eliminar estado"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Remaining Time Progress Bar */}
                        <div className="space-y-0.5">
                          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${remainingPercent}%` }}
                              className={`h-full transition-all duration-500 rounded-full ${
                                isExpiringSoon
                                  ? 'bg-rose-500'
                                  : remainingPercent < 50
                                  ? 'bg-amber-400'
                                  : 'bg-gradient-to-r from-sky-400 to-emerald-400'
                              }`}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[9px] text-slate-500">
                            <span>Publicado {new Date(story.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <span>{story.viewsCount || 0} vistas · 24h de validez</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Create story form */}
          {showCreateStory && (
            <form onSubmit={handlePublishStory} className="p-4 rounded-2xl bg-[#0e1a2f] border border-sky-500/40 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-bold uppercase tracking-wider text-sky-400">
                  Nuevo Estado (BD Node.js)
                </h5>
                <span className="text-[10px] text-slate-400">Desaparece en 24 horas</span>
              </div>

              {uploadError && (
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Selector de modo: Texto, Foto, Video */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => { setStoryMediaType('text'); setMediaDataUrl(''); }}
                  className={`py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    storyMediaType === 'text' ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  <span>✍️ Texto</span>
                </button>

                <label className={`py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  storyMediaType === 'image' && mediaDataUrl ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-300'
                }`}>
                  <Image className="w-3.5 h-3.5" />
                  <span>📷 Foto</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'image')}
                  />
                </label>

                <label className={`py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  storyMediaType === 'video' && mediaDataUrl ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-300'
                }`}>
                  <Video className="w-3.5 h-3.5" />
                  <span>🎥 Video</span>
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'video')}
                  />
                </label>
              </div>

              {/* Visual Preview / Editor Box */}
              {mediaDataUrl ? (
                <div className="relative rounded-xl overflow-hidden aspect-video bg-black flex items-center justify-center border border-slate-700">
                  {storyMediaType === 'video' ? (
                    <video src={mediaDataUrl} className="w-full h-full object-contain" autoPlay muted loop />
                  ) : (
                    <img src={mediaDataUrl} alt="Preview" className="w-full h-full object-cover" />
                  )}
                  <button
                    type="button"
                    onClick={() => setMediaDataUrl('')}
                    className="absolute top-2 right-2 p-1 rounded-full bg-black/70 text-white hover:bg-black"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className={`p-4 rounded-xl bg-gradient-to-r ${selectedBg} text-white min-h-[90px] flex items-center justify-center text-center font-medium shadow-inner`}>
                  <textarea
                    value={newStoryText}
                    onChange={(e) => setNewStoryText(e.target.value)}
                    placeholder="¿Qué estás pensando o compartiendo hoy en Nicaragua? 🇳🇮"
                    rows={2}
                    className="w-full bg-transparent text-white placeholder-white/70 text-sm text-center resize-none focus:outline-none"
                    autoFocus
                  />
                </div>
              )}

              {/* Pie de foto si hay foto o video */}
              {mediaDataUrl && (
                <input
                  type="text"
                  value={newStoryText}
                  onChange={(e) => setNewStoryText(e.target.value)}
                  placeholder="Añade un pie de foto o comentario..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-400 focus:outline-none focus:border-sky-500"
                />
              )}

              {/* Selector de Música / Audio */}
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-bold flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5 text-amber-400" />
                    <span>Música de fondo para el estado</span>
                  </span>
                  {selectedMusic && (
                    <button
                      type="button"
                      onClick={() => setSelectedMusic(null)}
                      className="text-[10px] text-rose-400 hover:underline"
                    >
                      Quitar
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  {NICA_MUSIC_TRACKS.map(track => (
                    <button
                      key={track.title}
                      type="button"
                      onClick={() => setSelectedMusic(track)}
                      className={`px-2 py-1.5 rounded-lg text-left text-[11px] font-medium transition cursor-pointer truncate ${
                        selectedMusic?.title === track.title
                          ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300'
                          : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      🎵 {track.title}
                    </button>
                  ))}
                </div>

                <div className="pt-1 flex items-center justify-between">
                  <label className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer">
                    <Upload className="w-3 h-3" />
                    <span>Subir mi propia canción / audio MP3</span>
                    <input
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={handleAudioFileUpload}
                    />
                  </label>
                  {selectedMusic && (
                    <span className="text-[10px] text-emerald-400 font-semibold truncate max-w-[150px]">
                      ✓ {selectedMusic.title}
                    </span>
                  )}
                </div>
              </div>

              {/* Color gradient picker (when text mode) */}
              {!mediaDataUrl && (
                <div className="flex items-center gap-2 justify-center">
                  {[
                    'from-sky-600 to-blue-800',
                    'from-emerald-600 to-teal-800',
                    'from-purple-600 to-indigo-800',
                    'from-amber-600 to-orange-800',
                    'from-rose-600 to-pink-800'
                  ].map(bg => (
                    <button
                      key={bg}
                      type="button"
                      onClick={() => setSelectedBg(bg)}
                      className={`w-6 h-6 rounded-full bg-gradient-to-r ${bg} transition ${
                        selectedBg === bg ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCreateStory(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-xs font-bold text-white shadow transition cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? 'Guardando en BD...' : 'Publicar Estado (24h)'}
                </button>
              </div>
            </form>
          )}

          {/* Recent stories from contacts */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Actualizaciones recientes ({stories.length})
            </h5>

            <div className="space-y-2">
              {stories.map(story => (
                <div
                  key={story.id}
                  onClick={() => handleOpenStory(story)}
                  className="p-2.5 rounded-2xl bg-slate-900/50 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between cursor-pointer transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative p-0.5 rounded-full ring-2 ring-sky-400 shrink-0">
                      <img
                        src={story.userAvatar}
                        alt={story.userName}
                        loading="lazy"
                        decoding="async"
                        className="w-11 h-11 rounded-full object-cover"
                      />
                      {story.audioTrack && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[8px] font-bold">
                          🎵
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-sky-300 transition">
                          {story.userName}
                        </h4>
                        {story.mediaType === 'video' && (
                          <span className="text-[10px] text-sky-400 bg-sky-950 px-1.5 py-0.2 rounded font-mono">Video</span>
                        )}
                        {story.mediaType === 'image' && (
                          <span className="text-[10px] text-emerald-400 bg-emerald-950 px-1.5 py-0.2 rounded font-mono">Foto</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        <span>Hace {Math.max(1, Math.round((Date.now() - story.timestamp) / 3600000))}h</span>
                        {story.audioTrack && (
                          <span className="text-amber-400 text-[10px]">· ♫ {story.audioTrack.title}</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 text-slate-400 text-xs group-hover:text-sky-400">
                    {/* Lazy-loaded media preview thumbnail if photo or video */}
                    {story.mediaUrl && (
                      <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 shrink-0">
                        {story.mediaType === 'video' ? (
                          <video
                            src={story.mediaUrl}
                            preload="metadata"
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img
                            src={story.mediaUrl}
                            alt="Miniatura"
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    )}
                    <span>Ver</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sponsored Stories / Ads Section matching business model */}
          <div className="space-y-3 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Megaphone className="w-3.5 h-3.5 text-rose-400" />
                <h5 className="text-xs font-bold uppercase tracking-wider text-rose-400">
                  📢 Estados & Negocios Patrocinados (Nicaragua)
                </h5>
              </div>
              <span className="text-[10px] text-slate-500 font-semibold px-2 py-0.5 rounded-full bg-slate-800">
                Publicidad Local
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {INITIAL_SPONSORED_ADS.slice(0, 2).map(ad => (
                <div 
                  key={ad.id}
                  className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden shadow-md flex flex-col justify-between p-3 space-y-2 group transition"
                >
                  <div className="flex items-center gap-2.5">
                    <img 
                      src={ad.businessAvatar} 
                      alt={ad.businessName} 
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-rose-500/50"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h6 className="text-xs font-bold text-white truncate">{ad.businessName}</h6>
                        <span className="text-[9px] text-rose-400 bg-rose-950/60 px-1.5 py-0.2 rounded font-semibold border border-rose-500/30">
                          Patrocinado
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5 text-slate-500" />
                        <span>{ad.department} · {ad.businessCategory}</span>
                      </p>
                    </div>
                  </div>

                  <div className="relative rounded-xl overflow-hidden h-28 bg-slate-950">
                    <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    {ad.discountBadge && (
                      <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md bg-rose-500 text-white font-extrabold text-[9px] shadow">
                        {ad.discountBadge}
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-300 line-clamp-2 leading-tight">
                    {ad.title}
                  </p>

                  <button
                    onClick={() => {
                      onClose();
                      if (onOpenDirectChat) {
                        onOpenDirectChat('user-maria');
                      }
                    }}
                    className="w-full py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-[11px] font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>{ad.ctaText}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Story Viewer Modal */}
      {activeStory && (
        <div className="fixed inset-0 z-60 bg-black/95 flex flex-col items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl overflow-hidden border border-slate-700 bg-slate-950 flex flex-col relative aspect-[9/16] shadow-2xl">
            {/* Top progress bar */}
            <div className="absolute top-3 left-3 right-3 z-20 flex gap-1">
              <div className="h-1 flex-1 bg-white/40 rounded-full overflow-hidden">
                <div className="h-full bg-white animate-[pulse_4s_ease-in-out_infinite]" />
              </div>
            </div>

            {/* Author info */}
            <div className="absolute top-6 left-4 right-4 z-20 flex items-center justify-between text-white">
              <div className="flex items-center gap-2.5">
                <img
                  src={activeStory.userAvatar}
                  alt={activeStory.userName}
                  className="w-9 h-9 rounded-full object-cover border border-white/40"
                />
                <div>
                  <h5 className="text-xs font-bold leading-none">{activeStory.userName}</h5>
                  {activeStory.audioTrack ? (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Music className="w-2.5 h-2.5 text-amber-300 animate-spin" />
                      <span className="text-[10px] text-amber-200 truncate max-w-[130px]">
                        {activeStory.audioTrack.title}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Clock className="w-2.5 h-2.5 text-sky-300" />
                      <span className="text-[10px] text-sky-200 font-medium">
                        {formatRemainingTime(activeStory)}
                      </span>
                      {activeStory.autoRenew && (
                        <span className="text-[9px] bg-emerald-500/30 text-emerald-300 px-1 rounded border border-emerald-400/40">
                          Auto 24h
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Author renewal action directly inside viewer */}
                {activeStory.userId === currentUser.id && (
                  <button
                    onClick={(e) => handleRenewStatus(activeStory.id, e)}
                    disabled={isRenewing}
                    className="px-2 py-1 rounded-full bg-sky-500/80 hover:bg-sky-400 text-white text-[10px] font-bold flex items-center gap-1 transition shadow cursor-pointer"
                    title="Renovar este estado por 24 horas más"
                  >
                    <RefreshCw className={`w-3 h-3 ${isRenewing ? 'animate-spin' : ''}`} />
                    <span>Renovar 24h</span>
                  </button>
                )}

                {activeStory.audioTrack && (
                  <button
                    onClick={toggleAudio}
                    className="p-1.5 rounded-full bg-black/50 text-amber-300 hover:bg-black/80"
                    title={isPlayingAudio ? 'Silenciar música' : 'Reproducir música'}
                  >
                    {isPlayingAudio ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>
                )}
                <button
                  onClick={() => setActiveStory(null)}
                  className="p-1 rounded-full bg-black/40 text-white hover:bg-black/60"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Story Content */}
            <div className="flex-1 flex items-center justify-center relative overflow-hidden">
              {activeStory.mediaUrl ? (
                <LazyStoryMedia
                  mediaUrl={activeStory.mediaUrl}
                  mediaType={activeStory.mediaType === 'video' ? 'video' : 'image'}
                  alt={`Estado de ${activeStory.userName}`}
                />
              ) : (
                <div className={`w-full h-full bg-gradient-to-b ${activeStory.bgColor || 'from-sky-700 to-blue-950'} p-6 flex items-center justify-center text-center`}>
                  <p className="text-base sm:text-lg font-bold text-white leading-relaxed">
                    {activeStory.text}
                  </p>
                </div>
              )}

              {activeStory.mediaUrl && activeStory.text && (
                <div className="absolute bottom-12 left-4 right-4 p-3 rounded-2xl bg-black/60 backdrop-blur-md text-white text-xs font-medium text-center z-20">
                  {activeStory.text}
                </div>
              )}
            </div>

            {/* Bottom views */}
            <div className="absolute bottom-3 left-4 right-4 z-20 flex items-center justify-between text-[11px] text-white/80">
              {activeStory.userId === currentUser.id ? (
                <button
                  onClick={() => setShowViewersList(!showViewersList)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md hover:bg-black/80 text-sky-300 font-semibold transition cursor-pointer border border-white/10"
                >
                  <Eye className="w-3.5 h-3.5 text-sky-400" />
                  <span>{activeStory.viewsCount} visualizaciones</span>
                  <span className="text-[10px] text-slate-300 underline ml-1">Ver quién</span>
                </button>
              ) : (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md">
                  <Eye className="w-3.5 h-3.5 text-sky-400" />
                  <span>{activeStory.viewsCount} visualizaciones</span>
                </span>
              )}
              <span className="text-sky-300 font-mono text-[10px]">Cifrado E2EE 🇳🇮</span>
            </div>

            {/* Viewers Drawer (when author clicks to see who viewed) */}
            {showViewersList && activeStory.userId === currentUser.id && (
              <div className="absolute inset-x-0 bottom-0 max-h-[60%] bg-slate-950/95 backdrop-blur-lg border-t border-slate-700 rounded-t-3xl p-4 z-30 flex flex-col animate-slideUp">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-sky-400" />
                    <h5 className="text-xs font-bold text-white uppercase tracking-wider">
                      Visto por ({activeStory.viewers?.length || activeStory.viewsCount || 0})
                    </h5>
                  </div>
                  <button
                    onClick={() => setShowViewersList(false)}
                    className="p-1 rounded-full text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 py-2 space-y-1">
                  {activeStory.viewers && activeStory.viewers.length > 0 ? (
                    activeStory.viewers.map((viewer, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={viewer.userAvatar}
                            alt={viewer.userName}
                            className="w-8 h-8 rounded-full object-cover border border-sky-400/50"
                          />
                          <div>
                            <p className="text-xs font-semibold text-white">{viewer.userName}</p>
                            <p className="text-[10px] text-slate-400">
                              {viewer.timestamp ? `Visto hace ${Math.max(1, Math.round((Date.now() - viewer.timestamp) / 60000))} min` : 'Recientemente'}
                            </p>
                          </div>
                        </div>
                        <span className="text-emerald-400 text-xs">✓✓</span>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-xs text-slate-400 space-y-1">
                      <p>Aún no hay espectadores registrados.</p>
                      <p className="text-[10px] text-slate-500">Tus contactos verán tu estado cuando lo abran.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
