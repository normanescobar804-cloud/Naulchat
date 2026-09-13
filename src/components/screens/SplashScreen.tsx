import React from 'react';
import { CnLogo } from '../CnLogo';

interface SplashScreenProps {
  onContinue: () => void;
  onGoLogin: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onContinue,
  onGoLogin,
}) => {
  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-slate-950 text-white select-none">
      {/* Background Scenic Volcano / Lake Nicaragua Twilight image with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0 scale-105 transition-transform duration-1000 ease-out"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=85')`,
        }}
      >
        {/* Dark twilight gradient overlay matching the mockup sunset lighting */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/60 to-black/90" />
        <div className="absolute inset-0 bg-sky-950/30 mix-blend-color" />
      </div>

      {/* Top status bar placeholder */}
      <div className="relative z-10 pt-4 px-6 flex justify-between items-center text-xs text-slate-300 font-medium">
        <span>10:24</span>
        <div className="flex items-center gap-1.5 text-slate-300">
          <span className="text-[10px]">5G</span>
          <span>●●●</span>
          <div className="w-5 h-2.5 border border-slate-300 rounded-sm p-0.5 flex items-center">
            <div className="w-full h-full bg-white rounded-2xs" />
          </div>
        </div>
      </div>

      {/* Center Branding Hero */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 mt-12 animate-fadeIn">
        <CnLogo size="xl" className="mb-4" />

        <div className="flex items-center gap-2 mt-2">
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
            Naual Chat
          </h1>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-sky-400 tracking-tight">
            Nicaragua
          </h1>
        </div>

        <p className="text-slate-300 text-sm sm:text-base font-medium mt-2 max-w-xs leading-relaxed">
          Chat privado, rápido y seguro
        </p>

        {/* Action Button */}
        <div className="mt-8 w-full max-w-xs space-y-3">
          <button
            onClick={onContinue}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold text-sm shadow-xl shadow-sky-600/30 active:scale-98 transition-all cursor-pointer"
          >
            Entrar a la Aplicación
          </button>
          <button
            onClick={onGoLogin}
            className="w-full py-2.5 px-4 rounded-xl text-slate-300 hover:text-white text-xs font-medium transition cursor-pointer"
          >
            Ver Pantallas de Inicio / Login
          </button>
        </div>
      </div>

      {/* Bottom Slogan in script font */}
      <div className="relative z-10 pb-8 px-6 text-center">
        <div className="inline-block relative">
          <p className="font-script text-3xl sm:text-4xl text-sky-400 tracking-wide transform -rotate-2 drop-shadow-md">
            Nicaragua siempre conectada
          </p>
          <svg className="w-full h-2 text-sky-400/80 -mt-1" viewBox="0 0 100 10" preserveAspectRatio="none">
            <path d="M0,5 Q50,9 100,3" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </div>
  );
};
