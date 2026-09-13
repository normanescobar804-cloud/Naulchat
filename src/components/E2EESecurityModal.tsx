import React, { useState } from 'react';
import { Shield, Key, Lock, CheckCircle2, QrCode, Copy, Check, X, ShieldAlert, Cpu } from 'lucide-react';
import { Conversation, User } from '../types';
import { translations } from '../utils/translations';
import { generateSafetyNumber } from '../utils/security';

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
  const [copied, setCopied] = useState(false);
  const [isVerifiedKey, setIsVerifiedKey] = useState(false);

  if (!isOpen) return null;

  const safetyNumber = generateSafetyNumber(currentUser.id, conversation.id);

  const handleCopy = () => {
    navigator.clipboard.writeText(safetyNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="e2ee-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100 animate-scaleUp">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-850 to-emerald-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                {t.safetyNumber}
              </h3>
              <p className="text-xs text-slate-400">
                {conversation.name} • Cifrado de Extremo a Extremo
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
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
            {/* Custom stylized QR representation */}
            <div className="p-3 bg-white rounded-xl shadow-lg relative">
              <svg className="w-36 h-36" viewBox="0 0 100 100" fill="none">
                {/* Position detection squares */}
                <rect x="5" y="5" width="25" height="25" fill="#0f172a" rx="4" />
                <rect x="9" y="9" width="17" height="17" fill="#ffffff" rx="2" />
                <rect x="13" y="13" width="9" height="9" fill="#0f172a" rx="1" />

                <rect x="70" y="5" width="25" height="25" fill="#0f172a" rx="4" />
                <rect x="74" y="9" width="17" height="17" fill="#ffffff" rx="2" />
                <rect x="78" y="13" width="9" height="9" fill="#0f172a" rx="1" />

                <rect x="5" y="70" width="25" height="25" fill="#0f172a" rx="4" />
                <rect x="9" y="74" width="17" height="17" fill="#ffffff" rx="2" />
                <rect x="13" y="78" width="9" height="9" fill="#0f172a" rx="1" />

                {/* Random patterned data matrix */}
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
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Clave de sesión: {conversation.e2eeKeyFingerprint}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
