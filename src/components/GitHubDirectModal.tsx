import React, { useState } from 'react';
import { 
  Github, Download, Check, Copy, ExternalLink, X, FolderArchive, 
  Terminal, ShieldCheck, Smartphone, Globe
} from 'lucide-react';

interface GitHubDirectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubDirectModal: React.FC<GitHubDirectModalProps> = ({ isOpen, onClose }) => {
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [activeTab, setActiveTab] = useState<'download' | 'github'>('download');

  if (!isOpen) return null;

  const gitCommands = `# 1. En tu computadora o terminal:
git init
git branch -M main
git remote add origin https://github.com/TU_USUARIO/naul-chat.git
git add .
git commit -m "feat: Naul Chat Nicaragua oficial"
git push -u origin main`;

  const copyCommands = () => {
    navigator.clipboard.writeText(gitCommands);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-[#091120] border border-slate-700 shadow-2xl text-slate-100 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 bg-[#070e1a]/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Descargar y Pasar a GitHub
              </h3>
              <p className="text-xs text-slate-400">Todo tu proyecto listo para tu teléfono o PC</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-800 bg-[#060c18] p-1.5 gap-1 text-xs">
          <button
            onClick={() => setActiveTab('download')}
            className={`flex-1 py-2 rounded-xl font-semibold flex items-center justify-center gap-2 transition ${
              activeTab === 'download' 
                ? 'bg-[#0077ff] text-white shadow-md' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            1. Descargar ZIP en tu Celular
          </button>
          <button
            onClick={() => setActiveTab('github')}
            className={`flex-1 py-2 rounded-xl font-semibold flex items-center justify-center gap-2 transition ${
              activeTab === 'github' 
                ? 'bg-[#0077ff] text-white shadow-md' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            2. Subir a GitHub
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {activeTab === 'download' ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-sky-950/30 border border-sky-500/30 space-y-2">
                <span className="font-semibold text-sky-300 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                  <FolderArchive className="w-4 h-4 text-sky-400" />
                  Archivo ZIP completo preparado
                </span>
                <p className="text-slate-300 leading-relaxed text-xs">
                  Como en el móvil no sale el botón del menú de Google AI Studio, 
                  <strong> empaquetamos el código completo de Naul Chat en un archivo ZIP descargable directo</strong>:
                </p>

                <div className="pt-2">
                  <a
                    href="/naul-chat-proyecto.zip"
                    download="naul-chat-proyecto.zip"
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 active:scale-[0.98] transition cursor-pointer text-sm"
                  >
                    <Download className="w-4 h-4 animate-bounce" />
                    Descargar naul-chat-proyecto.zip (153 KB)
                  </a>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0d182b] border border-slate-800 space-y-2 text-xs text-slate-300">
                <div className="font-semibold text-white flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  ¿Qué contiene este archivo?
                </div>
                <ul className="space-y-1 text-slate-400 list-disc list-inside">
                  <li>Las 8 pantallas oficiales del mockup (Login, Registro, Chat, etc.)</li>
                  <li>Configuración para compilar y ejecutar con Vite y React</li>
                  <li>Soporte PWA (Progressive Web App) y service workers</li>
                  <li>Acción de GitHub Actions (.github/workflows) para desplegar gratis</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <span className="font-semibold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Github className="w-4 h-4 text-sky-400" />
                  Paso A: Crear repositorio en GitHub desde tu celular
                </span>
                <p className="text-slate-300 text-xs">
                  Entra a GitHub en tu navegador del teléfono tocando el siguiente botón:
                </p>
                <a
                  href="https://github.com/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium border border-slate-700 text-xs transition"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                  Abrir github.com/new (Crear repositorio vacío)
                </a>
              </div>

              <div className="space-y-2">
                <span className="font-semibold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <FolderArchive className="w-4 h-4 text-purple-400" />
                  Paso B: Subir archivos con 1 toque en GitHub
                </span>
                <p className="text-slate-300 text-xs">
                  Una vez creado tu repositorio en GitHub, toca el botón <strong>"uploading an existing file"</strong> (subir archivos) y arrastra o selecciona el ZIP o tus archivos.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                    Si usas terminal o PC (opcional):
                  </span>
                  <button
                    onClick={copyCommands}
                    className="flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 transition"
                  >
                    {copiedCmd ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedCmd ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
                <pre className="p-2.5 rounded-lg bg-black/50 text-[11px] font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap">
                  {gitCommands}
                </pre>
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>GitHub Pages se activará automáticamente gracias al archivo <code>deploy.yml</code> incluido.</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-[#070e1a] flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
