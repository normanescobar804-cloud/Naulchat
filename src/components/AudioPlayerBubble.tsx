import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Mic, CheckCheck } from 'lucide-react';
import { AudioMetadata } from '../types';

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
  const duration = audioMetadata?.duration || 12;
  const waveform = audioMetadata?.waveform || [30, 45, 60, 25, 80, 50, 40, 70, 90, 40, 60, 30, 75, 45, 50];
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying) {
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
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, duration, playbackRate]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
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
      {/* Play / Pause button */}
      <button
        type="button"
        onClick={togglePlay}
        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition shadow-md cursor-pointer ${
          isOutgoing
            ? 'bg-white text-sky-600 hover:bg-slate-100'
            : 'bg-sky-500 text-white hover:bg-sky-400'
        }`}
      >
        {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
      </button>

      {/* Waveform & Duration */}
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
          <span className={isOutgoing ? 'text-sky-100' : 'text-slate-400'}>
            {isPlaying ? formatSecs(currentSeconds) : formatSecs(duration)}
          </span>
          <span className={`text-[10px] ${isOutgoing ? 'text-sky-200' : 'text-slate-400'}`}>
            Audio HD • 48 kHz
          </span>
        </div>
      </div>

      {/* Speed multiplier chip */}
      <button
        type="button"
        onClick={cycleSpeed}
        className={`px-1.5 py-0.5 rounded text-[11px] font-bold shrink-0 transition cursor-pointer ${
          isOutgoing
            ? 'bg-white/20 hover:bg-white/30 text-white'
            : 'bg-slate-800 hover:bg-slate-700 text-sky-400'
        }`}
        title="Cambiar velocidad de reproducción"
      >
        {playbackRate}x
      </button>
    </div>
  );
};
