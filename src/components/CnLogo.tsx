import React from 'react';

interface CnLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textColor?: string;
  showSubtitle?: boolean;
  className?: string;
}

export const CnLogo: React.FC<CnLogoProps> = ({
  size = 'md',
  showText = false,
  showSubtitle = false,
  className = '',
}) => {
  const iconSize = {
    sm: 'w-8 h-8 rounded-xl',
    md: 'w-11 h-11 rounded-2xl',
    lg: 'w-16 h-16 rounded-3xl',
    xl: 'w-24 h-24 rounded-3xl',
  }[size];

  const fontSize = {
    sm: 'text-sm font-black tracking-tight',
    md: 'text-lg font-black tracking-tight',
    lg: 'text-2xl font-black tracking-tight',
    xl: 'text-4xl font-black tracking-tight',
  }[size];

  const flagHeight = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
    xl: 'h-4',
  }[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* App Icon with CN & Nicaragua Flag Badge */}
      <div
        className={`${iconSize} relative flex flex-col items-center justify-between p-1 overflow-hidden shrink-0 shadow-lg shadow-sky-600/30 border border-sky-400/30 bg-gradient-to-b from-[#0066d6] to-[#0048aa]`}
      >
        {/* Subtle glossy overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20 pointer-events-none" />

        {/* Letters CN */}
        <div className="flex-1 flex items-center justify-center">
          <span className={`${fontSize} font-sans text-white font-extrabold leading-none drop-shadow-sm`}>
            CN
          </span>
        </div>

        {/* Nicaraguan Flag Ribbon */}
        <div className={`w-[84%] ${flagHeight} rounded-sm overflow-hidden flex flex-col border border-white/20 shadow-sm z-10 shrink-0 mb-0.5`}>
          <div className="h-[33%] bg-[#0055b8]" />
          <div className="h-[34%] bg-white flex items-center justify-center relative">
            {/* Triangular Emblem */}
            <div className="w-1.5 h-1 border-b-[3px] border-b-[#0055b8] border-l-[2px] border-l-transparent border-r-[2px] border-r-transparent" />
          </div>
          <div className="h-[33%] bg-[#0055b8]" />
        </div>
      </div>

      {/* Brand Text */}
      {showText && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-1.5">
            <span className="font-display font-extrabold text-white text-base tracking-tight">
              Naual Chat
            </span>
            <span className="font-display font-extrabold text-sky-400 text-base tracking-tight">
              Nicaragua
            </span>
          </div>
          {showSubtitle && (
            <span className="text-[11px] text-slate-400 font-medium">
              Chat privado, rápido y seguro
            </span>
          )}
        </div>
      )}
    </div>
  );
};
