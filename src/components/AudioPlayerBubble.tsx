import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';
import { AudioMetadata } from '../types';
import { generateVoiceNoteAudioUrl, playSpokenVoiceNote, stopSpokenVoiceNote } from '../utils/audioVoiceGenerator';

interface Props {
  audioMetadata?: AudioMetadata;
  isOutgoing: boolean;
  timestamp: string;
}

export const AudioPlayerBubble: React.FC<Props> = ({
  audioMetadata,
  isOutgoing,
  timestamp,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [playbackRate, setPlaybackRate] = useState<1 | 1.5 | 2>(1);
  const [realDuration, setRealDuration] = useState<number>(audioMetadata?.duration || 8);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const synthNodesRef = useRef<{
    osc1: OscillatorNode;
    osc2: OscillatorNode;
    filter: BiquadFilterNode;
    gain: GainNode;
  } | null>(null);

  // Garantizar siempre un audioUrl reproducible y audible para emisor y receptor
  const effectiveAudioUrl = useMemo(() => {
    if (audioMetadata?.audioUrl && audioMetadata.audioUrl.trim().length > 0) {
      return audioMetadata.audioUrl;
    }
    // Si no hay audioUrl provisto, generar una nota de voz acústica de alta fidelidad
    return generateVoiceNoteAudioUrl(realDuration || 8, isOutgoing);
  }, [audioMetadata?.audioUrl, realDuration, isOutgoing]);

  const duration = realDuration;
  const waveform = audioMetadata?.waveform || [30, 45, 60, 25, 80, 50, 40, 70, 90, 40, 60, 30, 75, 45, 50];

  // Sincronizar velocidad con el elemento de audio HTML5
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      stopSyntheticAudio();
      stopSpokenVoiceNote();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const stopSyntheticAudio = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (synthNodesRef.current) {
      try {
        const { osc1, osc2, gain } = synthNodesRef.current;
        gain.gain.setValueAtTime(0, audioContextRef.current?.currentTime || 0);
        osc1.stop();
        osc2.stop();
        osc1.disconnect();
        osc2.disconnect();
      } catch {
        // ignore
      }
      synthNodesRef.current = null;
    }
  };

  const startSyntheticAudio = async (startProgress: number) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const ctx = audioContextRef.current;
      const now = ctx.currentTime;

      // Síntesis vocal humana enriquecida
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'triangle';

      // Rango vocal humano diferenciado para emisor y receptor
      const baseFreq = isOutgoing ? 210 : 190;
      osc1.frequency.setValueAtTime(baseFreq, now);
      osc2.frequency.setValueAtTime(baseFreq * 1.5, now);

      // Filtro formante para simular cavidad vocal humana
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(750, now);
      filter.Q.setValueAtTime(3.2, now);

      // Nivel de volumen óptimo y audible (0.28 en lugar de 0.06 para buena audición)
      gain.gain.setValueAtTime(0.28, now);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);

      synthNodesRef.current = { osc1, osc2, filter, gain };

      const stepMs = 50;
      const totalSteps = (duration / playbackRate) * (1000 / stepMs);
      let stepCount = Math.floor(startProgress * totalSteps);

      timerRef.current = setInterval(() => {
        stepCount++;
        const newProg = stepCount / totalSteps;
        if (newProg >= 1) {
          stopSyntheticAudio();
          setIsPlaying(false);
          setProgress(0);
          return;
        }

        setProgress(newProg);

        // Modulación silábica y formantes dinámicos
        if (synthNodesRef.current && audioContextRef.current) {
          const t = audioContextRef.current.currentTime;
          const cadence = Math.sin(t * 7.5 * playbackRate);
          const formantWobble = 720 + Math.sin(t * 3.8) * 160;
          synthNodesRef.current.filter.frequency.setValueAtTime(formantWobble, t);
          const vol = 0.22 + Math.max(0, cadence) * 0.12;
          synthNodesRef.current.gain.gain.setValueAtTime(vol, t);
        }
      }, stepMs);
    } catch (err) {
      console.warn('Synthetic voice audio error:', err);
      // Temporizador visual de fallback si AudioContext está completamente bloqueado
      const stepMs = 100;
      const totalSteps = (duration / playbackRate) * (1000 / stepMs);
      timerRef.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 1) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1 / totalSteps;
        });
      }, stepMs);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      // Pausar
      if (audioRef.current) {
        audioRef.current.pause();
      }
      stopSyntheticAudio();
      stopSpokenVoiceNote();
      setIsPlaying(false);
    } else {
      // Reproducir
      setIsPlaying(true);

      // Desbloquear AudioContext con el gesto del usuario
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!audioContextRef.current) {
          audioContextRef.current = new AudioCtx();
        }
        if (audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume().catch(() => {});
        }
      } catch {}

      if (audioRef.current) {
        audioRef.current.volume = 1.0;
        audioRef.current.playbackRate = playbackRate;
        audioRef.current.play().catch(err => {
          console.warn('Real audio playback failed, falling back to voice synthesizer:', err);
          startSyntheticAudio(progress);
        });
      } else {
        startSyntheticAudio(progress);
      }
    }
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current && audioRef.current.duration) {
      const cur = audioRef.current.currentTime;
      const dur = audioRef.current.duration;
      setProgress(cur / dur);
      if (dur > 0 && Math.abs(dur - realDuration) > 1) {
        setRealDuration(Math.round(dur));
      }
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setProgress(0);
    stopSyntheticAudio();
    stopSpokenVoiceNote();
  };

  const cycleSpeed = () => {
    if (playbackRate === 1) setPlaybackRate(1.5);
    else if (playbackRate === 1.5) setPlaybackRate(2);
    else setPlaybackRate(1);
  };

  const formatSecs = (sec: number) => {
    const s = Math.floor(sec);
    return `0:${s.toString().padStart(2, '0')}`;
  };

  const currentSeconds = progress * duration;

  return (
    <div className="flex items-center gap-3 p-1 min-w-[260px] sm:min-w-[290px]">
      {/* Elemento de audio HTML5 con soporte para audio real y voz generada */}
      <audio
        ref={audioRef}
        src={effectiveAudioUrl}
        preload="auto"
        onTimeUpdate={handleAudioTimeUpdate}
        onEnded={handleAudioEnded}
        onError={() => {
          console.warn('Audio tag error, switching to synthetic vocal engine');
          if (isPlaying) {
            startSyntheticAudio(progress);
          }
        }}
        onLoadedMetadata={() => {
          if (audioRef.current?.duration && !isNaN(audioRef.current.duration) && isFinite(audioRef.current.duration)) {
            setRealDuration(Math.round(audioRef.current.duration));
          }
        }}
      />

      {/* Botón Play / Pause */}
      <button
        type="button"
        onClick={togglePlay}
        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition shadow-md cursor-pointer ${
          isOutgoing
            ? 'bg-white text-sky-600 hover:bg-slate-100'
            : 'bg-sky-500 text-white hover:bg-sky-400'
        }`}
        title={isPlaying ? 'Pausar audio' : 'Reproducir audio'}
      >
        {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
      </button>

      {/* Onda acústica y duración sincronizada */}
      <div className="flex-1 space-y-1">
        <div className="flex items-end gap-[3px] h-7 w-full py-1">
          {waveform.map((barHeight, idx) => {
            const barFraction = idx / waveform.length;
            const isPlayed = barFraction <= progress;
            return (
              <div
                key={idx}
                style={{ height: `${Math.max(barHeight, 20)}%` }}
                className={`flex-1 rounded-full transition-colors ${
                  isOutgoing
                    ? isPlayed
                      ? 'bg-white'
                      : 'bg-white/40'
                    : isPlayed
                    ? 'bg-sky-400'
                    : 'bg-slate-600'
                }`}
              />
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[11px]">
          <span className={isOutgoing ? 'text-sky-100 font-mono' : 'text-slate-400 font-mono'}>
            {isPlaying ? formatSecs(currentSeconds) : formatSecs(duration)}
          </span>
          <div className="flex items-center gap-1">
            <Volume2 className={`w-3 h-3 ${isOutgoing ? 'text-sky-200' : 'text-slate-500'}`} />
            <span className={`text-[10px] ${isOutgoing ? 'text-sky-200' : 'text-slate-400'}`}>
              {isOutgoing ? 'Voz Emisor • 48 kHz' : 'Voz Receptor • 48 kHz'}
            </span>
          </div>
        </div>
      </div>

      {/* Chip multiplicador de velocidad */}
      <button
        type="button"
        onClick={cycleSpeed}
        className={`px-1.5 py-0.5 rounded text-[11px] font-bold shrink-0 transition cursor-pointer ${
          isOutgoing
            ? 'bg-white/20 hover:bg-white/30 text-white'
            : 'bg-slate-800 hover:bg-slate-700 text-sky-400'
        }`}
        title="Cambiar velocidad de reproducción (1x, 1.5x, 2x)"
      >
        {playbackRate}x
      </button>
    </div>
  );
};
