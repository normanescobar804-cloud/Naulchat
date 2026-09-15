import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Check, ArrowLeft } from 'lucide-react';
import { CnLogo } from '../CnLogo';

interface LoginScreenProps {
  onLoginSuccess: (email: string, password: string, rememberMe: boolean) => void;
  onGoToRegister: () => void;
  onGoToForgotPassword: () => void;
  onBackToSplash?: () => void;
  loginError?: string;
  defaultRememberMe?: boolean;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onGoToRegister,
  onGoToForgotPassword,
  onBackToSplash,
  loginError,
  defaultRememberMe = true,
}) => {
  const [email, setEmail] = useState('normanescobar804@gmail.com');
  const [password, setPassword] = useState('Nicaragua2026!#');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(defaultRememberMe);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSuccess(email, password, rememberMe);
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-[#070d18] text-white select-none">
      {/* Top Status Bar */}
      <div className="pt-4 px-6 flex justify-between items-center text-xs text-slate-300 font-medium z-10">
        <div className="flex items-center gap-2">
          {onBackToSplash && (
            <button 
              onClick={onBackToSplash}
              className="p-1 -ml-2 text-slate-400 hover:text-white"
              title="Volver"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <span>10:24</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-300">
          <span className="text-[10px]">5G</span>
          <span>●●●</span>
          <div className="w-5 h-2.5 border border-slate-300 rounded-sm p-0.5 flex items-center">
            <div className="w-full h-full bg-white rounded-2xs" />
          </div>
        </div>
      </div>

      {/* Main Content Form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 max-w-sm mx-auto w-full z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-7">
          <CnLogo size="lg" className="mb-3" />
          
          <div className="flex items-center gap-1.5">
            <h2 className="font-display font-extrabold text-2xl text-white tracking-tight">
              Naual Chat
            </h2>
            <h2 className="font-display font-extrabold text-2xl text-sky-400 tracking-tight">
              Nicaragua
            </h2>
          </div>

          <p className="text-slate-400 text-xs mt-1">
            Chat privado, rápido y seguro
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-3.5">
          {loginError && (
            <div className="rounded-xl border border-red-500/50 bg-red-500/10 px-3 py-2 text-xs text-red-200">
              {loginError}
            </div>
          )}

          {/* Email Input */}
          <div className="relative flex items-center">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Correo electrónico"
              required
              className="w-full bg-[#0d1627] border border-slate-700/70 hover:border-slate-600 focus:border-sky-500 rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none transition shadow-inner"
            />
          </div>

          {/* Password Input */}
          <div className="relative flex items-center">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              required
              className="w-full bg-[#0d1627] border border-slate-700/70 hover:border-slate-600 focus:border-sky-500 rounded-xl pl-10 pr-10 py-3 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none transition shadow-inner"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center gap-2 pt-1 text-xs text-slate-300">
            <button
              type="button"
              onClick={() => setRememberMe(!rememberMe)}
              className={`w-4 h-4 rounded border flex items-center justify-center transition cursor-pointer ${
                rememberMe ? 'bg-sky-500 border-sky-500 text-white' : 'border-slate-600 bg-[#0d1627]'
              }`}
            >
              {rememberMe && <Check className="w-3 h-3 stroke-[3]" />}
            </button>
            <span onClick={() => setRememberMe(!rememberMe)} className="cursor-pointer">
              Mantener sesión iniciada
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-[#0077ff] hover:bg-[#0066dd] text-white font-semibold text-sm shadow-lg shadow-blue-600/30 active:scale-98 transition duration-150 cursor-pointer mt-2"
          >
            Entrar
          </button>
        </form>

        {/* Links */}
        <div className="mt-5 text-center space-y-2.5 text-xs">
          <p className="text-slate-400">
            ¿No tienes una cuenta?{' '}
            <button
              onClick={onGoToRegister}
              className="text-sky-400 hover:text-sky-300 font-semibold cursor-pointer underline-offset-2 hover:underline"
            >
              Crear cuenta
            </button>
          </p>

          <div>
            <button
              onClick={onGoToForgotPassword}
              className="text-sky-400 hover:text-sky-300 font-medium cursor-pointer underline-offset-2 hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        </div>
      </div>

      {/* Decorative Wavy Curve Footer matching mockup */}
      <div className="relative w-full h-24 overflow-hidden pointer-events-none">
        <svg className="absolute bottom-0 w-full h-24" viewBox="0 0 400 100" preserveAspectRatio="none">
          <path
            d="M0,40 C120,90 260,10 400,50 L400,100 L0,100 Z"
            fill="#0b172a"
            opacity="0.8"
          />
          <path
            d="M0,60 C150,20 280,80 400,30 L400,100 L0,100 Z"
            fill="#0284c7"
            opacity="0.25"
          />
          <path
            d="M0,80 C180,40 250,90 400,60 L400,100 L0,100 Z"
            fill="#0369a1"
            opacity="0.15"
          />
        </svg>
      </div>
    </div>
  );
};
