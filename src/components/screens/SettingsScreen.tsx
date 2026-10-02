import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, User, Lock, Shield, Bell, 
  Moon, Globe, HelpCircle, FileText, LogOut, ChevronRight,
  Github, Download, Upload, Sparkles, UserX, Store, Star, Cloud, Bot, ShieldCheck,
  Server, Database, Camera, CheckCircle2, RefreshCw
} from 'lucide-react';
import { LanguageCode, AppTheme } from '../../types';
import defaultVersion from '../../version.json';

interface SettingsScreenProps {
  onBack: () => void;
  onLogout: () => void;
  onOpenEditProfile?: () => void;
  onOpenEditProfilePhoto?: () => void;
  onOpenChangePassword?: () => void;
  onOpenPrivacy?: () => void;
  onOpenBlockedContacts?: () => void;
  onOpenDeployGuide?: () => void;
  onOpenBusinessAndPlans?: (tab?: 'plans' | 'business' | 'ai' | 'ads' | 'verification' | 'storage') => void;
  onOpenBackupRestore?: (tab?: 'export' | 'restore' | 'drive') => void;
  onOpenBackendSettings?: () => void;
  lang: LanguageCode;
  onSelectLanguage: (l: LanguageCode) => void;
  theme: AppTheme;
  onToggleTheme: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onBack,
  onLogout,
  onOpenEditProfile,
  onOpenEditProfilePhoto,
  onOpenChangePassword,
  onOpenPrivacy,
  onOpenBlockedContacts,
  onOpenDeployGuide,
  onOpenBusinessAndPlans,
  onOpenBackupRestore,
  onOpenBackendSettings,
  lang,
  onSelectLanguage,
  theme,
  onToggleTheme,
}) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  // Versión dinámica cargada desde version.json
  const [appVersion, setAppVersion] = useState(() => defaultVersion);
  const [checkingVersion, setCheckingVersion] = useState(false);
  const [versionCheckStatus, setVersionCheckStatus] = useState<string | null>(null);

  const fetchVersion = async (showFeedback = false) => {
    try {
      setCheckingVersion(true);
      if (showFeedback) setVersionCheckStatus('Verificando última versión...');
      const res = await fetch(`./version.json?t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
      });
      if (res.ok) {
        const data = await res.json();
        setAppVersion(data);
        if (showFeedback) {
          setVersionCheckStatus('¡Excelente! Tienes la última versión activa');
          setTimeout(() => setVersionCheckStatus(null), 4000);
        }
      }
    } catch (err) {
      console.warn('Error al verificar version.json:', err);
      if (showFeedback) {
        setVersionCheckStatus('Conectado a versión local');
        setTimeout(() => setVersionCheckStatus(null), 3000);
      }
    } finally {
      setCheckingVersion(false);
    }
  };

  useEffect(() => {
    fetchVersion(false);
  }, []);

  const handleForceUpdate = async () => {
    try {
      if ('caches' in window) {
        const names = await caches.keys();
        await Promise.all(names.map(name => caches.delete(name)));
      }
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.unregister();
        }
      }
    } catch (e) {
      console.warn('Error clearing service worker cache:', e);
    }
    window.location.reload();
  };

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
        {/* Section: Negocios, Planes & Monetización (C$) */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-400 px-1 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-emerald-400" />
              Negocios, Planes & IA (C$)
            </span>
            <span className="text-[10px] text-emerald-400 font-bold px-1.5 py-0.2 rounded bg-emerald-500/10">
              Nicaragua
            </span>
          </p>

          <div className="rounded-2xl bg-[#0b1322] border border-slate-800/80 divide-y divide-slate-800/60 overflow-hidden shadow-md">
            {/* Planes y Tarifas C$ */}
            <button
              onClick={() => onOpenBusinessAndPlans && onOpenBusinessAndPlans('plans')}
              className="w-full p-3.5 flex items-center justify-between hover:bg-slate-800/40 transition cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <Star className="w-4 h-4 text-amber-400" />
                <div>
                  <span className="text-xs sm:text-sm font-medium text-slate-200 block">
                    Planes y Precios (Cómo funcionaría)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Gratis, Premium (C$50–100) y Negocios (C$100–300)
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>

            {/* Perfil Comercial */}
            <button
              onClick={() => onOpenBusinessAndPlans && onOpenBusinessAndPlans('business')}
              className="w-full p-3.5 flex items-center justify-between hover:bg-slate-800/40 transition cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <Store className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="text-xs sm:text-sm font-medium text-slate-200 block">
                    Perfil Comercial & Catálogo
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Vende productos y servicios directamente por chat
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>

            {/* IA para Negocios 24/7 */}
            <button
              onClick={() => onOpenBusinessAndPlans && onOpenBusinessAndPlans('ai')}
              className="w-full p-3.5 flex items-center justify-between hover:bg-slate-800/40 transition cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <Bot className="w-4 h-4 text-sky-400" />
                <div>
                  <span className="text-xs sm:text-sm font-medium text-slate-200 block">
                    Asistente IA para Clientes 24/7
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Respuestas automáticas de precios y horarios
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>

            {/* Almacenamiento en la Nube */}
            <button
              onClick={() => onOpenBusinessAndPlans && onOpenBusinessAndPlans('storage')}
              className="w-full p-3.5 flex items-center justify-between hover:bg-slate-800/40 transition cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <Cloud className="w-4 h-4 text-cyan-400" />
                <div>
                  <span className="text-xs sm:text-sm font-medium text-slate-200 block">
                    Almacenamiento en la Nube
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Espacio para fotos familiares, audios y documentos
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>

            {/* Verificación Oficial */}
            <button
              onClick={() => onOpenBusinessAndPlans && onOpenBusinessAndPlans('verification')}
              className="w-full p-3.5 flex items-center justify-between hover:bg-slate-800/40 transition cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <div>
                  <span className="text-xs sm:text-sm font-medium text-slate-200 block">
                    Insignia de Verificación Oficial
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Validación con Cédula de Nicaragua o RUC
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Section: Respaldo de Chats & Google Drive */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-400 px-1 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              Copia de Seguridad & Nube
            </span>
            <span className="text-[10px] text-cyan-400 font-bold px-1.5 py-0.2 rounded bg-cyan-500/10">
              AES-256 E2EE
            </span>
          </p>

          <div className="rounded-2xl bg-[#0b1322] border border-cyan-500/30 divide-y divide-slate-800/60 overflow-hidden shadow-md">
            {/* Crear Respaldo */}
            <button
              onClick={() => onOpenBackupRestore && onOpenBackupRestore('export')}
              className="w-full p-3.5 flex items-center justify-between hover:bg-slate-800/40 transition cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <Download className="w-4 h-4 text-cyan-400" />
                <div>
                  <span className="text-xs sm:text-sm font-medium text-slate-200 block">
                    Exportar Respaldo Cifrado
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Descargar historial en JSON o subir a Google Drive
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>

            {/* Restaurar Conversaciones */}
            <button
              onClick={() => onOpenBackupRestore && onOpenBackupRestore('restore')}
              className="w-full p-3.5 flex items-center justify-between hover:bg-slate-800/40 transition cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <Upload className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="text-xs sm:text-sm font-medium text-slate-200 block">
                    Restaurar Conversaciones
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Recupera tus chats desde archivo o Google Drive
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>

            {/* Google Drive Sincronización */}
            <button
              onClick={() => onOpenBackupRestore && onOpenBackupRestore('drive')}
              className="w-full p-3.5 flex items-center justify-between hover:bg-slate-800/40 transition cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <Cloud className="w-4 h-4 text-amber-400" />
                <div>
                  <span className="text-xs sm:text-sm font-medium text-slate-200 block">
                    Conectar con Google Drive
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Sincronización multi-dispositivo y almacenamiento seguro
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Section: Cuenta */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-400 px-1 uppercase tracking-wider">
            Cuenta
          </p>

          <div className="rounded-2xl bg-[#0b1322] border border-slate-800/80 divide-y divide-slate-800/60 overflow-hidden shadow-md">
            {/* Foto de perfil (Editar cuando desees) */}
            <button
              onClick={onOpenEditProfilePhoto || onOpenEditProfile}
              className="w-full p-3.5 flex items-center justify-between hover:bg-slate-800/40 transition cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <Camera className="w-4 h-4 text-sky-400" />
                <div>
                  <span className="text-xs sm:text-sm font-medium text-slate-200 block">
                    Foto de perfil
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Cambiar foto, cámara o elegir de la galería de Nicaragua
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>

            {/* Editar perfil */}
            <button
              onClick={onOpenEditProfile}
              className="w-full p-3.5 flex items-center justify-between hover:bg-slate-800/40 transition cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-slate-400" />
                <span className="text-xs sm:text-sm font-medium text-slate-200">
                  Editar nombre y biografía
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

            {/* Contactos bloqueados */}
            <button
              onClick={onOpenBlockedContacts}
              className="w-full p-3.5 flex items-center justify-between hover:bg-slate-800/40 transition cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <UserX className="w-4 h-4 text-rose-400" />
                <span className="text-xs sm:text-sm font-medium text-slate-200">
                  Contactos bloqueados
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
          <p className="text-xs font-semibold text-slate-400 px-1 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              Despliegue & Backend Cloud
            </span>
            <span className="text-[10px] text-emerald-400 font-bold px-1.5 py-0.2 rounded bg-emerald-500/10">
              Render + Mongo
            </span>
          </p>

          <div className="rounded-2xl bg-[#0b1322] border border-sky-500/30 divide-y divide-slate-800/60 overflow-hidden shadow-md">
            {/* Backend Render & MongoDB */}
            <button
              onClick={onOpenBackendSettings}
              className="w-full p-3.5 flex items-center justify-between hover:bg-slate-800/40 transition cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Server className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-semibold text-white flex items-center gap-1.5">
                    Conectar Backend (Render & MongoDB)
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Mensajería multiusuario en vivo y base de datos permanente
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-400" />
            </button>

            {/* Pasar a GitHub */}
            <button
              onClick={onOpenDeployGuide}
              className="w-full p-3.5 flex items-center justify-between hover:bg-slate-800/40 transition cursor-pointer text-left"
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

        {/* Indicador visual discreto de versión (version.json) */}
        <div className="pt-4 pb-8 flex flex-col items-center justify-center text-center">
          <div className="w-full max-w-sm px-3.5 py-3 rounded-2xl bg-[#08101d]/90 border border-slate-800/80 shadow-inner flex flex-col gap-2 transition hover:border-slate-700/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="font-bold text-xs text-slate-200">
                  Naul Chat v{appVersion.version}
                </span>
                <span className="px-1.5 py-0.5 rounded-md bg-sky-500/10 text-sky-400 font-mono text-[9px] border border-sky-500/20">
                  {appVersion.tag || 'oficial'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => fetchVersion(true)}
                disabled={checkingVersion}
                title="Verificar si la versión desplegada está al día"
                className="px-2 py-1 rounded-lg text-slate-400 hover:text-sky-300 hover:bg-slate-800/80 transition cursor-pointer flex items-center gap-1 text-[11px] disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${checkingVersion ? 'animate-spin text-sky-400' : ''}`} />
                <span className="text-[10px] font-medium">Verificar</span>
              </button>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/60">
              <span className="truncate text-slate-400">
                {appVersion.buildFormatted || appVersion.buildDate || 'Octubre 2026'}
              </span>
              <button
                type="button"
                onClick={handleForceUpdate}
                className="text-[10px] text-sky-400 hover:text-sky-300 underline cursor-pointer"
                title="Limpiar la memoria de la PWA y recargar la última versión"
              >
                Refrescar PWA
              </button>
            </div>

            {versionCheckStatus && (
              <div className="text-[10px] text-emerald-400 font-medium flex items-center justify-center gap-1 bg-emerald-950/40 py-1 px-2 rounded-lg border border-emerald-800/40">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>{versionCheckStatus}</span>
              </div>
            )}
          </div>
          
          <p className="text-[10px] text-slate-600 mt-2">
            Naul Chat Nicaragua · Plataforma PWA con Cifrado E2EE 🇳🇮
          </p>
        </div>
      </div>
    </div>
  );
};
