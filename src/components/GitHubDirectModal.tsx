import React, { useState } from 'react';
import { 
  Github, Download, Check, Copy, ExternalLink, X, FolderArchive, 
  Terminal, ShieldCheck, Smartphone, Globe, Key, Sparkles, AlertCircle,
  RefreshCw, CheckCircle2, Lock
} from 'lucide-react';
import { apiUrl } from '../services/api';

interface GitHubDirectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubDirectModal: React.FC<GitHubDirectModalProps> = ({ isOpen, onClose }) => {
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [activeTab, setActiveTab] = useState<'token' | 'download' | 'manual'>('token');

  // Token Upload State
  const [githubToken, setGithubToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [repoName, setRepoName] = useState('naul-chat');
  const [isPrivateRepo, setIsPrivateRepo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    repoUrl?: string;
    pagesUrl?: string;
    message?: string;
    error?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handlePushWithToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubToken.trim()) {
      setUploadResult({ success: false, error: 'Por favor ingresa tu token de GitHub.' });
      return;
    }

    setIsSubmitting(true);
    setUploadResult(null);

    try {
      const response = await fetch(apiUrl('/api/github/push'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: githubToken.trim(),
          repoName: repoName.trim() || 'naul-chat',
          isPrivate: isPrivateRepo
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al conectar y subir a GitHub.');
      }

      setUploadResult({
        success: true,
        repoUrl: data.repoUrl,
        pagesUrl: data.pagesUrl,
        message: data.message || '¡Proyecto subido exitosamente a GitHub!'
      });
      setGithubToken('');
    } catch (err: any) {
      setUploadResult({
        success: false,
        error: err.message || 'Error inesperado durante la subida a GitHub.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
      <div className="w-full max-w-lg rounded-2xl bg-[#091120] border border-slate-700 shadow-2xl text-slate-100 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 bg-[#070e1a]/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Conectar y Subir a GitHub
              </h3>
              <p className="text-xs text-slate-400">Publica tu código y despliega tu app</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-800 bg-[#060c18] p-1.5 gap-1 text-xs">
          <button
            onClick={() => setActiveTab('token')}
            className={`flex-1 py-2 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTab === 'token' 
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Subir con Token (Rápido)
          </button>

          <button
            onClick={() => setActiveTab('download')}
            className={`flex-1 py-2 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTab === 'download' 
                ? 'bg-[#0077ff] text-white shadow-md' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            Descargar ZIP
          </button>

          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-2 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTab === 'manual' 
                ? 'bg-[#0077ff] text-white shadow-md' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Terminal
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
          
          {/* ==================== TAB: SUBIR CON TOKEN ==================== */}
          {activeTab === 'token' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-sky-950/40 border border-sky-500/30 text-xs text-sky-200 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5 text-white">
                  <Key className="w-4 h-4 text-amber-400" />
                  Subida directa a tu cuenta de GitHub
                </div>
                <p className="text-slate-300">
                  Crea o pega tu <strong>Personal Access Token (classic)</strong> con permiso <code>repo</code>. Nuestro servidor creará el repositorio en tu GitHub y subirá todos los archivos automáticamente.
                </p>
                <div className="pt-1">
                  <a
                    href="https://github.com/settings/tokens/new?scopes=repo&description=NaulChatDeploy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-semibold text-sky-300 hover:text-sky-200 underline"
                  >
                    <span>1. Toca aquí para generar tu token en GitHub (permiso "repo")</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {uploadResult && (
                <div className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                  uploadResult.success 
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' 
                    : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                }`}>
                  {uploadResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <p className="font-semibold text-white">
                      {uploadResult.success ? uploadResult.message : uploadResult.error}
                    </p>
                    {uploadResult.repoUrl && (
                      <div className="pt-2 flex flex-wrap gap-2">
                        <a
                          href={uploadResult.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 text-xs transition"
                        >
                          <Github className="w-3.5 h-3.5" />
                          <span>Ver Repositorio en GitHub ↗</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <form onSubmit={handlePushWithToken} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nombre del repositorio en GitHub:
                  </label>
                  <input
                    type="text"
                    value={repoName}
                    onChange={(e) => setRepoName(e.target.value)}
                    placeholder="naul-chat"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm font-mono focus:border-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Personal Access Token (ghp_...):
                  </label>
                  <div className="relative">
                    <input
                      type={showToken ? 'text' : 'password'}
                      value={githubToken}
                      onChange={(e) => setGithubToken(e.target.value)}
                      placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm font-mono focus:border-sky-500 focus:outline-none pr-16"
                    />
                    <button
                      type="button"
                      onClick={() => setShowToken(!showToken)}
                      className="absolute right-2 top-2 px-2 py-1 text-[11px] text-slate-400 hover:text-white rounded bg-slate-800 transition cursor-pointer"
                    >
                      {showToken ? 'Ocultar' : 'Ver'}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-emerald-400" />
                    El token solo se utiliza en memoria para la subida y nunca se guarda.
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isPrivateCheck"
                    checked={isPrivateRepo}
                    onChange={(e) => setIsPrivateRepo(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-sky-500 focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="isPrivateCheck" className="text-xs text-slate-300 cursor-pointer">
                    Hacer el repositorio privado (por defecto es público)
                  </label>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || !githubToken.trim()}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 active:scale-[0.98] transition cursor-pointer text-sm disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Subiendo proyecto a GitHub...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>Subir todo a mi GitHub Ahora</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ==================== TAB: DESCARGAR ZIP ==================== */}
          {activeTab === 'download' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-sky-950/30 border border-sky-500/30 space-y-2">
                <span className="font-semibold text-sky-300 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                  <FolderArchive className="w-4 h-4 text-sky-400" />
                  Archivo ZIP completo preparado
                </span>
                <p className="text-slate-300 leading-relaxed text-xs">
                  Descarga todo el proyecto comprimido listo para descomprimir o subir manualmente:
                </p>

                <div className="pt-2">
                  <a
                    href="/naul-chat-proyecto.zip"
                    download="naul-chat-proyecto.zip"
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 active:scale-[0.98] transition cursor-pointer text-sm"
                  >
                    <Download className="w-4 h-4 animate-bounce" />
                    Descargar naul-chat-proyecto.zip (1.2 MB)
                  </a>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0d182b] border border-slate-800 space-y-2 text-xs text-slate-300">
                <div className="font-semibold text-white flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  Contenido incluido:
                </div>
                <ul className="space-y-1 text-slate-400 list-disc list-inside">
                  <li>8 pantallas oficiales completas (Splash, Login, Chat, Ajustes, etc.)</li>
                  <li>Servicio de Respaldo Cifrado AES-256 + Integración con Google Drive</li>
                  <li>Soporte PWA (Progressive Web App) y service workers offline</li>
                  <li>Flujo de GitHub Actions (.github/workflows) para desplegar gratis</li>
                </ul>
              </div>
            </div>
          )}

          {/* ==================== TAB: MANUAL / TERMINAL ==================== */}
          {activeTab === 'manual' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <span className="font-semibold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Github className="w-4 h-4 text-sky-400" />
                  Paso A: Crear repositorio en GitHub
                </span>
                <p className="text-slate-300 text-xs">
                  Entra a GitHub para crear el repositorio:
                </p>
                <a
                  href="https://github.com/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium border border-slate-700 text-xs transition"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                  Abrir github.com/new (Crear repositorio)
                </a>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                    Comandos de terminal con Token:
                  </span>
                  <button
                    onClick={copyCommands}
                    className="flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 transition cursor-pointer"
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
                <span>GitHub Pages se activará automáticamente con el flujo <code>deploy.yml</code> incluido.</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-[#070e1a] flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
