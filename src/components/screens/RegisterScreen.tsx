import React, { useState } from 'react';
import { ArrowLeft, User, Mail, Lock, Eye, EyeOff } from 'lucide-react';

interface RegisterScreenProps {
  onRegisterSuccess: (name: string, email: string) => void;
  onBackToLogin: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onRegisterSuccess,
  onBackToLogin,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onRegisterSuccess(name.trim(), email.trim() || 'nuevo_usuario@naul.ni');
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-[#070d18] text-white select-none">
      {/* Top Bar with back button */}
      <div className="pt-4 px-4 flex items-center justify-between z-10">
        <button
          onClick={onBackToLogin}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/50 transition cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-xs text-slate-400 font-medium">10:24</span>
        <div className="w-5" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center px-6 max-w-sm mx-auto w-full z-10 py-4">
        <div className="mb-6">
          <h2 className="font-display font-extrabold text-2xl text-white tracking-tight">
            Crear cuenta
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Únete a Naual Chat Nicaragua
          </p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Full Name */}
          <div className="relative flex items-center">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre completo"
              required
              className="w-full bg-[#0d1627] border border-slate-700/70 hover:border-slate-600 focus:border-sky-500 rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none transition shadow-inner"
            />
          </div>

          {/* Email */}
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

          {/* Password */}
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

          {/* Confirm Password */}
          <div className="relative flex items-center">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmar contraseña"
              required
              className="w-full bg-[#0d1627] border border-slate-700/70 hover:border-slate-600 focus:border-sky-500 rounded-xl pl-10 pr-10 py-3 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none transition shadow-inner"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-[#0077ff] hover:bg-[#0066dd] text-white font-semibold text-sm shadow-lg shadow-blue-600/30 active:scale-98 transition duration-150 cursor-pointer mt-2"
          >
            Registrarse
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-slate-400">
          ¿Ya tienes una cuenta?{' '}
          <button
            onClick={onBackToLogin}
            className="text-sky-400 hover:text-sky-300 font-semibold cursor-pointer underline-offset-2 hover:underline"
          >
            Entrar
          </button>
        </div>
      </div>

      {/* Decorative Wavy Curve Footer */}
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
        </svg>
      </div>
    </div>
  );
};
