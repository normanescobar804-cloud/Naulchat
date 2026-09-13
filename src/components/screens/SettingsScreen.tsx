import React, { useState } from 'react';
import { 
  ArrowLeft, User, Lock, Shield, Bell, 
  Moon, Globe, HelpCircle, FileText, LogOut, ChevronRight,
  Github, Download, Sparkles
} from 'lucide-react';
import { LanguageCode, AppTheme } from '../../types';

interface SettingsScreenProps {
  onBack: () => void;
  onLogout: () => void;
  onOpenEditProfile?: () => void;
  onOpenChangePassword?: () => void;
  onOpenPrivacy?: () => void;
  onOpenDeployGuide?: () => void;
  lang: LanguageCode;
  onSelectLanguage: (l: LanguageCode) => void;
  theme: AppTheme;
  onToggleTheme: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onBack,
  onLogout,
  onOpenEditProfile,
  onOpenChangePassword,
  onOpenPrivacy,
  onOpenDeployGuide,
  lang,
  onSelectLanguage,
  theme,
  onToggleTheme,
}) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const langNames: Record<LanguageCode, string> = {
    es: 'Español 🇳🇮',
    en: 'English',
    miskito: 'Mískitu',
    pt: 'Português',
  };

  const themeNames: Record<AppTheme, string> = {
    'dark': 'Oscuro',
    'nica-midnight': 'Azul Pinolero',
    'light': 'Claro',
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#050b14] text-white select-none overflow-y-auto">
      {/* Top Header with Back */}
      <div className="pt-4 px-4 pb-3 flex items-center gap-3 border-b border-slate-800/80 bg-[#070e1a]/80 backdrop-blur-md sticky top-0 z-20">
        <button
          onClick={onBack}
          className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 transition cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="font-display font-bold text-lg text-white">
          Configuración
        </h2>
      </div>

      <div className="flex-1 px-4 py-5 space-y-6 max-w-md mx-auto w-full">
        {/* Section: Cuenta */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-400 px-1 uppercase tracking-wider">
            Cuenta
          </p>

          <div className="rounded-2xl bg-[#0b1322] border border-slate-800/80 divide-y divide-slate-800/60 overflow-hidden shadow-md">
            {/* Editar perfil */}
            <button
              onClick={onOpenEditProfile}
              className="w-full p-3.5 flex items-center justify-between hover:bg-slate-800/40 transition cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-slate-400" />
                <span className="text-xs sm:text-sm font-medium text-slate-200">
                  Editar perfil
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>

            {/* Cambiar contraseña */}
            <button
              onClick={onOpenChangePassword}
              className="w-full p-3.5 flex items-center justify-between hover:bg-slate-800/40 transition cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <Lock className="w-4 h-4 text-slate-400" />
                <span className="text-xs sm:text-sm font-medium text-slate-200">
                  Cambiar contraseña
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>

            {/* Privacidad */}
            <button
              onClick={onOpenPrivacy}
              className="w-full p-3.5 flex items-center justify-between hover:bg-slate-800/40 transition cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-slate-400" />
                <span className="text-xs sm:text-sm font-medium text-slate-200">
                  Privacidad
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Section: App */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-400 px-1 uppercase tracking-wider">
            App
          </p>

          <div className="rounded-2xl bg-[#0b1322] border border-slate-800/80 divide-y divide-slate-800/60 overflow-hidden shadow-md">
            {/* Notificaciones Toggle */}
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-slate-400" />
                <span className="text-xs sm:text-sm font-medium text-slate-200">
                  Notificaciones
                </span>
              </div>
              <button
                type="button"
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  notificationsEnabled ? 'bg-[#0077ff]' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform transform shadow-sm ${
                    notificationsEnabled ? 'translate-x-5.5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Tema */}
            <button
              onClick={onToggleTheme}
              className="w-full p-3.5 flex items-center justify-between hover:bg-slate-800/40 transition cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <Moon className="w-4 h-4 text-slate-400" />
                <span className="text-xs sm:text-sm font-medium text-slate-200">
                  Tema
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                <span>{themeNames[theme]}</span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </div>
            </button>

            {/* Idioma */}
            <button
              onClick={() => {
                const order: LanguageCode[] = ['es', 'en', 'miskito', 'pt'];
                const next = order[(order.indexOf(lang) + 1) % order.length];
                onSelectLanguage(next);
              }}
              className="w-full p-3.5 flex items-center justify-between hover:bg-slate-800/40 transition cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-slate-400" />
                <span className="text-xs sm:text-sm font-medium text-slate-200">
                  Idioma
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                <span>{langNames[lang]}</span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </div>
            </button>
          </div>
        </div>

        {/* Section: App Real & GitHub */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-400 px-1 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            Despliegue & App Móvil
          </p>

          <div className="rounded-2xl bg-gradient-to-r from-sky-950/40 to-slate-900 border border-sky-500/30 overflow-hidden shadow-md">
            <button
              onClick={onOpenDeployGuide}
              className="w-full p-3.5 flex items-center justify-between hover:bg-sky-500/10 transition cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400">
                  <Github className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-semibold text-sky-300 flex items-center gap-1.5">
                    Pasar a GitHub / Descargar ZIP
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Descargar código completo y pasos para GitHub
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-sky-400" />
            </button>
          </div>
        </div>

        {/* Section: Ayuda */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-400 px-1 uppercase tracking-wider">
            Ayuda
          </p>

          <div className="rounded-2xl bg-[#0b1322] border border-slate-800/80 divide-y divide-slate-800/60 overflow-hidden shadow-md">
            {/* Centro de ayuda */}
            <button
              onClick={() => alert('Centro de Ayuda: Naul Chat Nicaragua. Soporte en línea 24/7.')}
              className="w-full p-3.5 flex items-center justify-between hover:bg-slate-800/40 transition cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <HelpCircle className="w-4 h-4 text-slate-400" />
                <span className="text-xs sm:text-sm font-medium text-slate-200">
                  Centro de ayuda
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>

            {/* Términos y condiciones */}
            <button
              onClick={() => alert('Términos de Servicio y Privacidad Cifrada E2EE - Naul Chat Nicaragua.')}
              className="w-full p-3.5 flex items-center justify-between hover:bg-slate-800/40 transition cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-slate-400" />
                <span className="text-xs sm:text-sm font-medium text-slate-200">
                  Términos y condiciones
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Cerrar sesión */}
        <div className="pt-2">
          <button
            onClick={onLogout}
            className="w-full p-3.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 flex items-center gap-3 text-rose-400 font-semibold text-xs sm:text-sm transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>
    </div>
  );
};
