import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share2, Smartphone, Apple, CheckCircle, Github, Globe, Terminal, ExternalLink, X } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'header' | 'modal' | 'banner';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'header' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showDeployGuide, setShowDeployGuide] = useState(false);

  return (
    <>
      {/* If already installed */}
      {isInstalled ? (
        variant === 'header' ? (
          <button
            onClick={() => setShowDeployGuide(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all shadow-sm"
            title="App Instalada - Ver información de GitHub y Despliegue"
          >
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">App Instalada</span>
            <Github className="w-3.5 h-3.5 ml-1 text-slate-400" />
          </button>
        ) : null
      ) : isInstallable ? (
        <button
          onClick={install}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-md shadow-sky-500/20 hover:shadow-sky-500/40 active:scale-95 transition-all"
        >
          <Download className="w-3.5 h-3.5 animate-bounce" />
          <span>Instalar App</span>
        </button>
      ) : isIOS ? (
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 transition-all shadow-sm"
        >
          <Apple className="w-3.5 h-3.5 text-slate-300" />
          <span className="hidden sm:inline">Instalar en iOS</span>
        </button>
      ) : (
        <button
          onClick={() => setShowDeployGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 transition-all shadow-sm"
        >
          <Github className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden sm:inline">Desplegar en GitHub</span>
        </button>
      )}

      {/* iOS Safari Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Instalar en iPhone / iPad</h3>
                  <p className="text-xs text-slate-400">Ejecútala como una app nativa en pantalla completa</p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4 text-sm text-slate-300">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-sky-500 text-white font-bold text-xs">1</span>
                <div>
                  Toca el botón <strong className="text-white">Compartir</strong> (<Share2 className="inline w-3.5 h-3.5 text-sky-400 mx-0.5" />) en la barra inferior de Safari.
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-sky-500 text-white font-bold text-xs">2</span>
                <div>
                  Desplázate hacia abajo y selecciona <strong className="text-white">"Añadir a pantalla de inicio"</strong>.
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-sky-500 text-white font-bold text-xs">3</span>
                <div>
                  Toca <strong className="text-white">Añadir</strong> en la esquina superior derecha. ¡Listo! Ya tendrás el ícono de <span className="text-sky-400 font-semibold">Naul Chat</span> en tu menú.
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-6 w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-sm transition shadow-lg shadow-sky-500/20"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* GitHub & Deployment Guide Modal */}
      {showDeployGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  <Github className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    Desplegar en GitHub & PWA
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">Listo para producción</span>
                  </h3>
                  <p className="text-xs text-slate-400">Convierte y publica Naul Chat en GitHub Pages en 3 sencillos pasos</p>
                </div>
              </div>
              <button
                onClick={() => setShowDeployGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4 text-sm text-slate-300">
              <div className="p-4 rounded-xl bg-sky-950/40 border border-sky-500/40 space-y-2.5">
                <div className="flex items-center gap-2 text-sky-300 font-bold text-xs uppercase tracking-wider">
                  <Download className="w-4 h-4 text-sky-400" />
                  Descargar Proyecto Completo en ZIP (Para Celular y PC)
                </div>
                <p className="text-xs text-slate-300">
                  Si estás en el celular y no te sale la opción de exportar en AI Studio, descarga el archivo ZIP directamente con este botón:
                </p>
                <a
                  href="/naul-chat-proyecto.zip"
                  download="naul-chat-proyecto.zip"
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-sky-500/20 active:scale-[0.98] transition cursor-pointer"
                >
                  <Download className="w-4 h-4 animate-bounce" />
                  Descargar naul-chat-proyecto.zip
                </a>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2">
                <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs uppercase tracking-wider">
                  <Terminal className="w-4 h-4" />
                  Opción 2: Comandos Git para subir a tu repositorio
                </div>
                <div className="rounded-lg bg-slate-950 p-3 font-mono text-xs text-emerald-400 space-y-1 overflow-x-auto border border-slate-800">
                  <p className="text-slate-500"># 1. Iniciar git y vincular tu repo de GitHub</p>
                  <p>git init</p>
                  <p>git add .</p>
                  <p>git commit -m "feat: Naul Chat Nicaragua con PWA y GitHub Actions"</p>
                  <p>git branch -M main</p>
                  <p>git remote add origin https://github.com/TU_USUARIO/naul-chat.git</p>
                  <p>git push -u origin main</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-700/40 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider">
                  <ExternalLink className="w-4 h-4" />
                  Paso Final: Activar GitHub Pages Gratis
                </div>
                <p className="text-xs text-slate-300">
                  Ya dejamos configurado el archivo de automatización <code className="text-emerald-300 bg-emerald-950/80 px-1 py-0.5 rounded">.github/workflows/deploy.yml</code>. Solo ve a:
                </p>
                <ol className="list-decimal list-inside text-xs text-slate-300 space-y-1 pl-1">
                  <li>Tu repositorio en <strong>GitHub</strong> &rarr; pestaña <strong>Settings</strong></li>
                  <li>Sección <strong>Pages</strong> (en el menú izquierdo)</li>
                  <li>En <strong>Source / Origen</strong>, selecciona <strong>"GitHub Actions"</strong></li>
                </ol>
                <p className="text-[11px] text-emerald-400/90 font-medium">
                  ¡Y listo! Tu app quedará publicada en <span className="underline">https://TU_USUARIO.github.io/naul-chat/</span> con instalador PWA para celulares y PC.
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowDeployGuide(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm transition"
              >
                Cerrar
              </button>
              {isInstallable && (
                <button
                  onClick={() => {
                    setShowDeployGuide(false);
                    install();
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-sm transition shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Instalar en este equipo
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-600/90 backdrop-blur px-3.5 py-2 text-xs font-semibold text-white shadow-xl border border-amber-500/50 animate-pulse">
      <span className="h-2 w-2 rounded-full bg-white animate-ping" />
      Modo Sin Conexión — Navegando con datos en caché PWA.
    </div>
  );
};
