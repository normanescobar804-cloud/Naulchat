import React, { useState } from 'react';
import { ArrowLeft, Mail, Send, CheckCircle2 } from 'lucide-react';

interface ForgotPasswordScreenProps {
  onBackToLogin: () => void;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  onBackToLogin,
}) => {
  const [email, setEmail] = useState('normanescobar804@gmail.com');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSent(true);
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
      <div className="flex-1 flex flex-col items-center justify-center px-6 max-w-sm mx-auto w-full z-10">
        {/* Paper Plane Mail Badge */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-500 border border-sky-400/30 flex items-center justify-center text-white mb-6 shadow-xl shadow-blue-500/20">
          <div className="relative">
            <Mail className="w-8 h-8 stroke-[1.8]" />
            <Send className="w-4 h-4 absolute -top-1 -right-1 text-sky-200" />
          </div>
        </div>

        <div className="text-center mb-6">
          <h2 className="font-display font-extrabold text-2xl text-white tracking-tight">
            Recuperar contraseña
          </h2>
          <p className="text-slate-400 text-xs mt-2 leading-relaxed max-w-xs mx-auto">
            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
          </p>
        </div>

        {sent ? (
          <div className="w-full p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2 animate-fadeIn">
            <div className="flex justify-center text-emerald-400">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <p className="text-xs font-semibold text-emerald-300">
              ¡Enlace de recuperación enviado!
            </p>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Hemos enviado las instrucciones a <strong className="text-white">{email}</strong>. Revisa tu bandeja de entrada o spam.
            </p>
            <button
              onClick={onBackToLogin}
              className="mt-3 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold cursor-pointer"
            >
              Volver al inicio de sesión
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full space-y-4">
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

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-[#0077ff] hover:bg-[#0066dd] text-white font-semibold text-sm shadow-lg shadow-blue-600/30 active:scale-98 transition duration-150 cursor-pointer"
            >
              Enviar
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={onBackToLogin}
                className="text-slate-400 hover:text-white text-xs font-medium cursor-pointer transition"
              >
                Volver al inicio de sesión
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Decorative Wavy Curves */}
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
