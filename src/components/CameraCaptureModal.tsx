import React, { useState, useRef, useEffect } from 'react';
import { Camera, Video, RefreshCw, X, Check, Flashlight, Sparkles, Send, Wand2, ExternalLink, AlertTriangle } from 'lucide-react';
import { MediaPermissionGuideModal } from './MediaPermissionGuideModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCaptureImage: (dataUrl: string, caption?: string) => void;
  onCaptureVideo: (dataUrl: string, caption?: string) => void;
}

export const CameraCaptureModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onCaptureImage,
  onCaptureVideo,
}) => {
  const [mode, setMode] = useState<'photo' | 'video'>('photo');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedMedia, setCapturedMedia] = useState<{ type: 'photo' | 'video'; url: string } | null>(null);
  const [caption, setCaption] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [showPermissionGuideModal, setShowPermissionGuideModal] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start / restart camera when opened or facingMode changes
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setCapturedMedia(null);
      setCaption('');
      setIsRecording(false);
      setRecordDuration(0);
      setCameraError(null);
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    stopCamera();
    setCameraError(null);
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: true,
      };
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      // Fallback: try video without audio if mic permissions blocked
      try {
        const videoOnlyStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
        });
        setStream(videoOnlyStream);
        if (videoRef.current) {
          videoRef.current.srcObject = videoOnlyStream;
        }
      } catch (videoErr: any) {
        setCameraError('No se pudo acceder a la cámara. Revisa los permisos del navegador.');
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (recordIntervalRef.current) {
      clearInterval(recordIntervalRef.current);
    }
  };

  const handleFlipCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  const takePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    const video = videoRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (facingMode === 'user') {
      // Mirror image for user-facing camera
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedMedia({ type: 'photo', url: dataUrl });
  };

  const startVideoRecording = () => {
    if (!stream) return;
    recordedChunksRef.current = [];
    try {
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp8,opus' });
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };
      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          setCapturedMedia({ type: 'video', url: reader.result as string });
        };
        reader.readAsDataURL(blob);
      };
      recorder.start(100);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordDuration(0);
      recordIntervalRef.current = setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    } catch (e) {
      console.error('Error starting media recorder:', e);
    }
  };

  const stopVideoRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordIntervalRef.current) {
        clearInterval(recordIntervalRef.current);
      }
    }
  };

  const handleSend = () => {
    if (!capturedMedia) return;
    if (capturedMedia.type === 'photo') {
      onCaptureImage(capturedMedia.url, caption.trim() || undefined);
    } else {
      onCaptureVideo(capturedMedia.url, caption.trim() || undefined);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Top Header */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs font-semibold">
            {mode === 'photo' ? <Camera className="w-4 h-4 text-sky-400" /> : <Video className="w-4 h-4 text-rose-400" />}
            <span>{mode === 'photo' ? 'Cámara de Fotos' : 'Grabadora de Video'}</span>
          </div>

          <div className="flex items-center gap-2">
            {!capturedMedia && (
              <button
                onClick={handleFlipCamera}
                className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/10 backdrop-blur-md transition cursor-pointer"
                title="Girar cámara (Frontal / Trasera)"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/10 backdrop-blur-md transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Viewfinder or Media Preview */}
        <div className="relative w-full aspect-[4/5] bg-black flex items-center justify-center overflow-hidden">
          {cameraError ? (
            <div className="p-6 text-center space-y-4 max-w-sm">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">Acceso a la Cámara Restringido</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{cameraError}</p>
              </div>
              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => window.open(window.location.href, '_blank')}
                  className="w-full py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 transition cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Abrir en Nueva Pestaña</span>
                </button>
                <div className="flex items-center gap-2 justify-center">
                  <button
                    type="button"
                    onClick={() => setShowPermissionGuideModal(true)}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold border border-amber-500/30 transition cursor-pointer"
                  >
                    ¿Cómo desbloquear?
                  </button>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition cursor-pointer"
                  >
                    Reintentar
                  </button>
                </div>
              </div>
            </div>
          ) : capturedMedia ? (
            capturedMedia.type === 'photo' ? (
              <img
                src={capturedMedia.url}
                alt="Captured"
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                src={capturedMedia.url}
                controls
                autoPlay
                loop
                playsInline
                className="w-full h-full object-contain"
              />
            )
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${facingMode === 'user' ? '-scale-x-100' : ''}`}
            />
          )}

          {/* Recording Timer Badge */}
          {isRecording && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-rose-600/90 text-white text-xs font-mono font-bold flex items-center gap-2 shadow-lg animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
              <span>{`0:${recordDuration.toString().padStart(2, '0')}`}</span>
            </div>
          )}
        </div>

        {/* Bottom Controls */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-3">
          {capturedMedia ? (
            /* Review & Send Stage */
            <div className="space-y-3">
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Añade un comentario a la captura..."
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-700 text-white text-xs placeholder-slate-400 focus:outline-none focus:border-sky-500"
                autoFocus
              />
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={() => {
                    setCapturedMedia(null);
                    setCaption('');
                    startCamera();
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Tomar otra</span>
                </button>
                <button
                  onClick={handleSend}
                  className="flex-1 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-sky-500/25"
                >
                  {capturedMedia.type === 'photo' ? (
                    <>
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>Filtros y Enviar</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Enviar al chat</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Capture Controls Stage */
            <div className="space-y-3">
              {/* Mode switch pills */}
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setMode('photo')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                    mode === 'photo' ? 'bg-sky-600 text-white shadow' : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Foto
                </button>
                <button
                  type="button"
                  onClick={() => setMode('video')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                    mode === 'video' ? 'bg-rose-600 text-white shadow' : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Video
                </button>
              </div>

              {/* Shutter Button */}
              <div className="flex items-center justify-center pt-1">
                {mode === 'photo' ? (
                  <button
                    onClick={takePhoto}
                    className="w-16 h-16 rounded-full border-4 border-white p-1 flex items-center justify-center hover:scale-105 active:scale-95 transition cursor-pointer"
                    title="Tomar foto"
                  >
                    <div className="w-full h-full rounded-full bg-white shadow-inner" />
                  </button>
                ) : isRecording ? (
                  <button
                    onClick={stopVideoRecording}
                    className="w-16 h-16 rounded-full border-4 border-rose-500 p-1 flex items-center justify-center hover:scale-105 active:scale-95 transition cursor-pointer animate-pulse"
                    title="Detener grabación"
                  >
                    <div className="w-6 h-6 rounded-lg bg-rose-500" />
                  </button>
                ) : (
                  <button
                    onClick={startVideoRecording}
                    className="w-16 h-16 rounded-full border-4 border-rose-500 p-1 flex items-center justify-center hover:scale-105 active:scale-95 transition cursor-pointer"
                    title="Grabar video"
                  >
                    <div className="w-full h-full rounded-full bg-rose-500" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Media Permission Guide Modal */}
      <MediaPermissionGuideModal
        isOpen={showPermissionGuideModal}
        onClose={() => setShowPermissionGuideModal(false)}
        target="camera"
      />
    </div>
  );
};
