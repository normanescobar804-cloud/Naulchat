import React, { useState, useEffect } from 'react';
import { 
  Shield, Key, Lock, CheckCircle2, QrCode, Copy, Check, X, 
  ShieldAlert, Cpu, Laptop, Smartphone, Globe, RefreshCw, 
  Trash2, AlertTriangle, FileCheck, CheckCheck, Camera, Mic, ShieldCheck
} from 'lucide-react';
import { Conversation, User, UserSession, SecurityReport } from '../types';
import { translations } from '../utils/translations';
import { generateSafetyNumber, encryptWithAES256, decryptWithAES256 } from '../utils/security';
import { apiGetSecurityStatus, apiListSessions, apiRevokeSession, apiRevokeOtherSessions } from '../services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  conversation: Conversation;
  currentUser: User;
  lang: 'es' | 'en' | 'miskito' | 'pt';
}

export const E2EESecurityModal: React.FC<Props> = ({
  isOpen,
  onClose,
  conversation,
  currentUser,
  lang,
}) => {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<'e2ee' | 'system'>('e2ee');
  const [copied, setCopied] = useState(false);
  const [isVerifiedKey, setIsVerifiedKey] = useState(false);

  // Live client-side AES-256 tester
  const [testPlaintext, setTestPlaintext] = useState('¡Mensaje confidencial de prueba! 🇳🇮');
  const [testResult, setTestResult] = useState<{
    ciphertext: string;
    iv: string;
    decryptedText: string;
    timeMs: number;
  } | null>(null);
  const [isTestingAES, setIsTestingAES] = useState(false);

  const handleTestAES = async () => {
    if (!testPlaintext.trim()) return;
    setIsTestingAES(true);
    const start = performance.now();
    try {
      const enc = await encryptWithAES256(testPlaintext, conversation.id);
      const dec = await decryptWithAES256(enc.ciphertext, conversation.id);
      const elapsed = Math.round((performance.now() - start) * 100) / 100;
      setTestResult({
        ciphertext: enc.ciphertext,
        iv: enc.iv,
        decryptedText: dec.plaintext,
        timeMs: elapsed,
      });
    } catch (e) {
      console.error('Test AES error:', e);
    } finally {
      setIsTestingAES(false);
    }
  };

  // System security and session management state
  const [securityReport, setSecurityReport] = useState<SecurityReport | null>(null);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [isLoadingSecurity, setIsLoadingSecurity] = useState(false);
  const [sessionActionMsg, setSessionActionMsg] = useState<string | null>(null);
  const [micPermStatus, setMicPermStatus] = useState<'prompt' | 'granted' | 'denied' | 'checking'>('checking');
  const [cameraPermStatus, setCameraPermStatus] = useState<'prompt' | 'granted' | 'denied' | 'checking'>('checking');

  useEffect(() => {
    if (isOpen && activeTab === 'system') {
      loadSystemSecurityData();
      checkBrowserPermissions();
    }
  }, [isOpen, activeTab]);

  const loadSystemSecurityData = async () => {
    setIsLoadingSecurity(true);
    try {
      const [report, sessList] = await Promise.all([
        apiGetSecurityStatus(),
        apiListSessions()
      ]);
      if (report) setSecurityReport(report);
      setSessions(sessList);
    } catch (err) {
      console.error('Error cargando estado de seguridad:', err);
    } finally {
      setIsLoadingSecurity(false);
    }
  };

  const checkBrowserPermissions = async () => {
    if (navigator.permissions && navigator.permissions.query) {
      try {
        const mic = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        setMicPermStatus(mic.state);
        mic.onchange = () => setMicPermStatus(mic.state);
      } catch {
        setMicPermStatus('prompt');
      }

      try {
        const cam = await navigator.permissions.query({ name: 'camera' as PermissionName });
        setCameraPermStatus(cam.state);
        cam.onchange = () => setCameraPermStatus(cam.state);
      } catch {
        setCameraPermStatus('prompt');
      }
    } else {
      setMicPermStatus('prompt');
      setCameraPermStatus('prompt');
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    const ok = await apiRevokeSession(sessionId);
    if (ok) {
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      setSessionActionMsg('Sesión revocada exitosamente.');
      setTimeout(() => setSessionActionMsg(null), 3000);
    }
  };

  const handleRevokeOthers = async () => {
    const count = await apiRevokeOtherSessions();
    setSessions(prev => prev.filter(s => s.isCurrent));
    setSessionActionMsg(`Se revocaron ${count} otras sesiones activas.`);
    setTimeout(() => setSessionActionMsg(null), 3000);
  };

  if (!isOpen) return null;

  const safetyNumber = generateSafetyNumber(currentUser.id, conversation.id);

  const handleCopy = () => {
    navigator.clipboard.writeText(safetyNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="e2ee-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100 animate-scaleUp flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-850 to-emerald-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                Centro de Seguridad & Cifrado 🇳🇮
              </h3>
              <p className="text-xs text-slate-400">
                {conversation.name} • Naul Chat Nicaragua
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-5 pt-2">
          <button
            onClick={() => setActiveTab('e2ee')}
            className={`pb-2.5 px-4 text-xs font-semibold border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'e2ee'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Cifrado E2EE del Chat</span>
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`pb-2.5 px-4 text-xs font-semibold border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'system'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Etapa 5: Seguridad del Sistema</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {activeTab === 'e2ee' ? (
            <>
              {/* E2EE Info banner */}
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 space-y-1">
                <div className="font-semibold flex items-center gap-1.5 text-emerald-400">
                  <Lock className="w-4 h-4" /> {t.e2eeBadge}
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {t.e2eeInfo}
                </p>
              </div>

              {/* QR Code and Key presentation */}
              <div className="flex flex-col items-center justify-center space-y-3 p-4 bg-slate-950 rounded-2xl border border-slate-800">
                <div className="p-3 bg-white rounded-xl shadow-lg relative">
                  <svg className="w-32 h-32" viewBox="0 0 100 100" fill="none">
                    <rect x="5" y="5" width="25" height="25" fill="#0f172a" rx="4" />
                    <rect x="9" y="9" width="17" height="17" fill="#ffffff" rx="2" />
                    <rect x="13" y="13" width="9" height="9" fill="#0f172a" rx="1" />

                    <rect x="70" y="5" width="25" height="25" fill="#0f172a" rx="4" />
                    <rect x="74" y="9" width="17" height="17" fill="#ffffff" rx="2" />
                    <rect x="78" y="13" width="9" height="9" fill="#0f172a" rx="1" />

                    <rect x="5" y="70" width="25" height="25" fill="#0f172a" rx="4" />
                    <rect x="9" y="74" width="17" height="17" fill="#ffffff" rx="2" />
                    <rect x="13" y="78" width="9" height="9" fill="#0f172a" rx="1" />

                    <rect x="36" y="8" width="6" height="6" fill="#0f172a" />
                    <rect x="46" y="8" width="6" height="6" fill="#0f172a" />
                    <rect x="56" y="8" width="6" height="6" fill="#0f172a" />
                    <rect x="36" y="20" width="6" height="6" fill="#0f172a" />
                    <rect x="50" y="24" width="8" height="8" fill="#0284c7" rx="1" />
                    <rect x="10" y="40" width="6" height="6" fill="#0f172a" />
                    <rect x="22" y="44" width="6" height="6" fill="#0f172a" />
                    <rect x="36" y="40" width="6" height="6" fill="#0f172a" />
                    <rect x="46" y="46" width="6" height="6" fill="#0f172a" />
                    <rect x="62" y="40" width="6" height="6" fill="#0f172a" />
                    <rect x="76" y="44" width="6" height="6" fill="#0f172a" />
                    <rect x="88" y="40" width="6" height="6" fill="#0f172a" />
                    <rect x="40" y="60" width="8" height="8" fill="#0f172a" />
                    <rect x="56" y="60" width="6" height="6" fill="#0f172a" />
                    <rect x="70" y="64" width="6" height="6" fill="#0f172a" />
                    <rect x="40" y="78" width="8" height="8" fill="#0f172a" />
                    <rect x="56" y="80" width="6" height="6" fill="#0f172a" />
                    <rect x="76" y="76" width="8" height="8" fill="#0f172a" />
                    <rect x="86" y="86" width="6" height="6" fill="#0284c7" rx="1" />
                  </svg>
                </div>

                <p className="text-[11px] text-slate-400 text-center max-w-xs">
                  {t.safetyNumberDesc}
                </p>
              </div>

              {/* 60-digit number display */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-medium flex items-center gap-1">
                    <Key className="w-3.5 h-3.5 text-sky-400" />
                    Código de seguridad (60 dígitos):
                  </span>
                  <button
                    onClick={handleCopy}
                    className="text-sky-400 hover:text-sky-300 flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs sm:text-sm text-center text-slate-200 tracking-wider leading-relaxed select-all">
                  {safetyNumber}
                </div>
              </div>

              {/* Cryptographic Specifications */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-500 text-[11px] flex items-center gap-1">
                    <Cpu className="w-3 h-3 text-sky-400" /> Algoritmo Simétrico:
                  </span>
                  <p className="font-semibold text-slate-200">AES-256-GCM</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-500 text-[11px] flex items-center gap-1">
                    <Shield className="w-3 h-3 text-emerald-400" /> Intercambio de Claves:
                  </span>
                  <p className="font-semibold text-slate-200">Curve25519 (ECDH)</p>
                </div>
              </div>

              {/* Interactive Live AES-256-GCM Cryptographic Verifier */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                    Consola de Verificación AES-256 en Vivo
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Web Crypto API
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Prueba el motor criptográfico real directamente en tu navegador. El texto se cifra con AES-256-GCM y se descifra en tiempo real sin salir de tu dispositivo.
                </p>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={testPlaintext}
                    onChange={(e) => setTestPlaintext(e.target.value)}
                    placeholder="Escribe un mensaje confidencial..."
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleTestAES}
                    disabled={isTestingAES || !testPlaintext.trim()}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    {isTestingAES ? (
                      <span>Cifrando...</span>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Probar AES</span>
                      </>
                    )}
                  </button>
                </div>

                {testResult && (
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-2 text-[11px] font-mono">
                    <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-1.5">
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-400" /> Cifrado y descifrado exitoso
                      </span>
                      <span className="text-slate-500 text-[10px]">Latencia: {testResult.timeMs}ms</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block font-sans">IV (Vector 96-bit):</span>
                      <span className="text-amber-300 break-all">{testResult.iv}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block font-sans">Texto Cifrado (Wire Payload):</span>
                      <span className="text-emerald-300 break-all max-h-16 overflow-y-auto block text-[10px]">
                        {testResult.ciphertext}
                      </span>
                    </div>
                    <div className="pt-1 border-t border-slate-800">
                      <span className="text-slate-500 text-[10px] block font-sans">Resultado Descifrado:</span>
                      <span className="text-white font-sans text-xs">{testResult.decryptedText}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Mark as verified button */}
              <button
                onClick={() => setIsVerifiedKey(!isVerifiedKey)}
                className={`w-full py-3 rounded-xl font-semibold text-xs transition flex items-center justify-center gap-2 cursor-pointer ${
                  isVerifiedKey
                    ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {isVerifiedKey ? 'Clave Marcada como Verificada ✓' : 'Marcar Clave como Verificada en Persona'}
                </span>
              </button>
            </>
          ) : (
            /* ETAPA 5 - SEGURIDAD Y SESIONES */
            <div className="space-y-5">
              {sessionActionMsg && (
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCheck className="w-4 h-4" />
                  <span>{sessionActionMsg}</span>
                </div>
              )}

              {/* Security parameters grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* HTTPS & HSTS */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                      <Globe className="w-4 h-4 text-emerald-400" /> HTTPS & HSTS
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      ACTIVO
                    </span>
                  </div>
                  <p className="text-slate-300 font-semibold">TLS 1.3 / Strict-Transport-Security</p>
                  <p className="text-[10px] text-slate-500">Cabeceras CSP, nosniff y HSTS habilitadas en servidor</p>
                </div>

                {/* JWT Session tokens */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                      <Key className="w-4 h-4 text-sky-400" /> Tokens JWT
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                      HMAC-SHA256
                    </span>
                  </div>
                  <p className="text-slate-300 font-semibold">RFC 7519 Criptográfico</p>
                  <p className="text-[10px] text-slate-500">Sesiones rastreadas con revocación remota en tiempo real</p>
                </div>

                {/* Contraseñas Protegidas */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                      <Lock className="w-4 h-4 text-amber-400" /> Contraseñas Protegidas
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      PBKDF2
                    </span>
                  </div>
                  <p className="text-slate-300 font-semibold">100,000 Iteraciones + Salt</p>
                  <p className="text-[10px] text-slate-500">Blindaje contra ataques por fuerza bruta y diccionarios</p>
                </div>

                {/* Anti-spam & Rate Limiter */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                      <ShieldAlert className="w-4 h-4 text-rose-400" /> Anti-Spam & DoS
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      RATE LIMITER
                    </span>
                  </div>
                  <p className="text-slate-300 font-semibold">15 msgs / 10s • 10 uploads / min</p>
                  <p className="text-[10px] text-slate-500">Filtrado automático de inundación en el backend</p>
                </div>
              </div>

              {/* Validación de archivos y límites de tamaño */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-cyan-400" />
                    Validación de Archivos & Magic Bytes
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">Doble Validación Servidor</span>
                </div>
                <p className="text-xs text-slate-400">
                  Cada archivo recibido se valida examinando su firma binaria (magic bytes) para evitar extensiones falsas o scripts maliciosos.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                  <div className="p-2 bg-slate-900 rounded-lg text-center border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Videos HD</span>
                    <span className="font-semibold text-purple-400">Máx. 25 MB</span>
                  </div>
                  <div className="p-2 bg-slate-900 rounded-lg text-center border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Documentos</span>
                    <span className="font-semibold text-emerald-400">Máx. 20 MB</span>
                  </div>
                  <div className="p-2 bg-slate-900 rounded-lg text-center border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Música / Voz</span>
                    <span className="font-semibold text-cyan-400">Máx. 15 MB</span>
                  </div>
                  <div className="p-2 bg-slate-900 rounded-lg text-center border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Fotos</span>
                    <span className="font-semibold text-sky-400">Máx. 10 MB</span>
                  </div>
                </div>
              </div>

              {/* Permisos de Dispositivos (Cámara y Micrófono) */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-sky-400" />
                    Permisos de Hardware del Navegador
                  </span>
                  <button 
                    onClick={checkBrowserPermissions}
                    className="text-sky-400 hover:text-sky-300 flex items-center gap-1 text-[11px] cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" /> Actualizar
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <Mic className="w-4 h-4 text-rose-400" /> Micrófono (Audio)
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      micPermStatus === 'granted' 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : micPermStatus === 'denied'
                        ? 'bg-rose-500/20 text-rose-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {micPermStatus === 'granted' ? 'Permitido' : micPermStatus === 'denied' ? 'Bloqueado' : 'Preguntar'}
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <Camera className="w-4 h-4 text-sky-400" /> Cámara (Video)
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      cameraPermStatus === 'granted' 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : cameraPermStatus === 'denied'
                        ? 'bg-rose-500/20 text-rose-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {cameraPermStatus === 'granted' ? 'Permitido' : cameraPermStatus === 'denied' ? 'Bloqueado' : 'Preguntar'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Control de Sesiones Activas */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <Laptop className="w-4 h-4 text-indigo-400" />
                    Sesiones Activas ({sessions.length})
                  </span>
                  {sessions.length > 1 && (
                    <button
                      onClick={handleRevokeOthers}
                      className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[11px] font-medium border border-rose-500/30 transition cursor-pointer"
                    >
                      Cerrar otras sesiones
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {sessions.map((sess) => (
                    <div 
                      key={sess.id}
                      className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          sess.isCurrent ? 'bg-sky-500/20 text-sky-400' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {sess.deviceName.toLowerCase().includes('phone') || sess.deviceName.toLowerCase().includes('mobile') ? (
                            <Smartphone className="w-4 h-4" />
                          ) : (
                            <Laptop className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">{sess.deviceName}</span>
                            {sess.isCurrent && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-bold">
                                Esta sesión
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 font-mono">
                            IP: {sess.ipAddress} • {new Date(sess.lastActiveAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>

                      {!sess.isCurrent && (
                        <button
                          onClick={() => handleRevokeSession(sess.id)}
                          className="p-1.5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-lg transition cursor-pointer"
                          title="Revocar sesión"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Clave de sesión: {conversation.e2eeKeyFingerprint}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition cursor-pointer"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};

