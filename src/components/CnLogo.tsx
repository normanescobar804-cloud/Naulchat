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
  const sizeConfig = {
    sm: { container: 'w-8 h-8 rounded-xl p-0.5', inner: 'rounded-[10px]' },
    md: { container: 'w-11 h-11 rounded-2xl p-1', inner: 'rounded-xl' },
    lg: { container: 'w-16 h-16 rounded-[22px] p-1.5', inner: 'rounded-[16px]' },
    xl: { container: 'w-28 h-28 sm:w-32 sm:h-32 rounded-[32px] p-2.5 shadow-2xl', inner: 'rounded-[22px]' },
  }[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Official Elevated 3D App Icon with White Bezel matching Mockup & Desktop Icon */}
      <div
        className={`${sizeConfig.container} relative shrink-0 overflow-hidden bg-white/95 shadow-2xl shadow-sky-500/25 border border-white/80 transition-transform hover:scale-105 duration-200`}
      >
        <div className={`w-full h-full ${sizeConfig.inner} overflow-hidden bg-[#040d1e] relative shadow-inner`}>
          <img
            src="/pwa-192x192.png"
            alt="Naul Chat Nicaragua"
            className="w-full h-full object-cover select-none"
            referrerPolicy="no-referrer"
          />
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
