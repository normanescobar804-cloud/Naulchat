import React, { useState, useEffect } from 'react';
import { 
  X, Server, Database, Cloud, CheckCircle2, AlertTriangle, 
  ExternalLink, RefreshCw, Link2, Copy, Check, Radio, Zap
} from 'lucide-react';
import { 
  getApiBaseUrl, 
  setCustomBackendUrl, 
  testBackendConnection 
} from '../services/api';

interface BackendConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  wsStatus: 'connecting' | 'connected' | 'disconnected';
  wsLatency: number | null;
}

export const BackendConnectionModal: React.FC<BackendConnectionModalProps> = ({
  isOpen,
  onClose,
  wsStatus,
  wsLatency,
}) => {
  const [backendUrl, setBackendUrl] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    message: string;
    data?: any;
  } | null>(null);
  const [copiedVar, setCopiedVar] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setBackendUrl(getApiBaseUrl());
      setTestResult(null);
      setSavedSuccess(false);
    }
  }, [isOpen]);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    setSavedSuccess(false);
    try {
      const res = await testBackendConnection(backendUrl.trim());
      setTestResult(res);
    } catch (err: any) {
      setTestResult({
        ok: false,
        message: err?.message || 'Error de conexión con el backend',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveBackendUrl = () => {
    const cleanUrl = backendUrl.trim().replace(/\/+$/, '');
    setCustomBackendUrl(cleanUrl || null);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      window.location.reload();
    }, 1200);
  };

  const handleResetToDefault = () => {
    setCustomBackendUrl(null);
    setBackendUrl('');
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      window.location.reload();
    }, 1200);
  };

  const copyToClipboard = (text: string, varName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedVar(varName);
    setTimeout(() => setCopiedVar(null), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#0b1322] border border-cyan-500/30 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-[#0e172a] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base sm:text-lg text-white flex items-center gap-2">
                Conectar Backend & Base de Datos
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Render + Mongo
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Pasa de una página estática a mensajería multiusuario en tiempo real
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">

          {/* Current Status Badge */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3.5 h-3.5 rounded-full ${wsStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
              <div>
                <div className="text-xs sm:text-sm font-semibold text-white">
                  {wsStatus === 'connected' ? 'Servidor WebSockets Conectado' : 'Sin conexión con Backend Externo'}
                </div>
                <div className="text-[11px] text-slate-400">
                  {getApiBaseUrl() ? `Conectado a: ${getApiBaseUrl()}` : 'Usando servidor local / integrado'}
                </div>
              </div>
            </div>
            {wsLatency !== null && (
              <div className="px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
                {wsLatency} ms
              </div>
            )}
          </div>

          {/* Configuration Form */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Link2 className="w-4 h-4 text-cyan-400" />
              URL del Backend en Render (Web Service):
            </label>

            <div className="flex gap-2">
              <input
                type="url"
                value={backendUrl}
                onChange={(e) => setBackendUrl(e.target.value)}
                placeholder="https://naul-chat-backend.onrender.com"
                className="flex-1 px-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-500 font-mono"
              />
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                {isTesting ? <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" /> : <Zap className="w-4 h-4 text-amber-400" />}
                <span>Probar</span>
              </button>
            </div>

            {/* Test result banner */}
            {testResult && (
              <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                testResult.ok 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}>
                {testResult.ok ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}

            {savedSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>¡URL guardada! Recargando aplicación para sincronizar...</span>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleSaveBackendUrl}
                className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs sm:text-sm transition cursor-pointer shadow-lg shadow-cyan-600/20"
              >
                Guardar y Conectar
              </button>
              {getApiBaseUrl() && (
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
                >
                  Restablecer
                </button>
              )}
            </div>
          </div>

          {/* Step-by-Step Guide for Render + MongoDB Atlas */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Cloud className="w-4 h-4 text-cyan-400" />
              Guía Paso a Paso para Desplegar Backend Gratis
            </h4>

            <div className="space-y-3">
              {/* Step 1 */}
              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[11px]">1</span>
                    Crear Base de Datos MongoDB Atlas (Gratis)
                  </div>
                  <a
                    href="https://www.mongodb.com/cloud/atlas/register"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    <span>Ir a Atlas</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Crea un clúster gratuito (M0 Sandbox). En "Database Access" crea un usuario y contraseña, y en "Network Access" permite acceso desde cualquier IP (`0.0.0.0/0`). Copia tu cadena de conexión URI.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[11px]">2</span>
                    Crear Web Service en Render
                  </div>
                  <a
                    href="https://dashboard.render.com/select-repo?type=web"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    <span>Ir a Render</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Conecta tu repositorio <strong className="text-slate-300">normanescobar804-cloud/naul-chat-nicaragua</strong> en Render.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px] font-mono">
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Build Command:</span>
                    <span className="text-cyan-300">npm install && npm run build</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Start Command:</span>
                    <span className="text-cyan-300">npm start</span>
                  </div>
                </div>

                <div className="pt-1">
                  <span className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Variables de Entorno en Render:
                  </span>
                  <div className="space-y-1">
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-[11px] font-mono">
                      <div>
                        <span className="text-amber-400">MONGODB_URI</span>
                        <span className="text-slate-500 text-[10px] block">mongodb+srv://user:pass@cluster.mongodb.net/naulchat</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard('mongodb+srv://<usuario>:<password>@cluster.mongodb.net/naulchat?retryWrites=true&w=majority', 'mongo')}
                        className="text-slate-400 hover:text-white cursor-pointer"
                        title="Copiar plantilla"
                      >
                        {copiedVar === 'mongo' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-[11px] font-mono">
                      <div>
                        <span className="text-amber-400">JWT_SECRET</span>
                        <span className="text-slate-500 text-[10px] block">naul-chat-nicaragua-secret-key-2026</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard('naul-chat-nicaragua-secret-key-2026', 'jwt')}
                        className="text-slate-400 hover:text-white cursor-pointer"
                        title="Copiar plantilla"
                      >
                        {copiedVar === 'jwt' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[11px]">3</span>
                  Pega la URL de Render arriba
                </div>
                <p className="text-[11px] text-slate-400">
                  Una vez que Render termine de desplegar (toma ~2 minutos), copia la URL que te asigna (ej. <code className="text-cyan-300">https://naul-chat-nicaragua.onrender.com</code>), pégala arriba y pulsa "Guardar y Conectar".
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-[#0e172a] flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Node.js + WebSockets + MongoDB</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer font-medium"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
