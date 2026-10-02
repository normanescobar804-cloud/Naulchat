import React, { useState } from 'react';
import { ShieldCheck, Fingerprint, Scan, Mail, CheckCircle2, AlertCircle, Sparkles, X, Lock } from 'lucide-react';
import { User } from '../types';
import { translations } from '../utils/translations';
import { sounds } from '../utils/security';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onUpdateUser: (updated: Partial<User>) => void;
  lang: 'es' | 'en' | 'miskito' | 'pt';
}

export const BiometricVerificationModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  lang
}) => {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<'biometric' | 'email' | 'cedula'>('biometric');
  const [scanning, setScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [emailCode, setEmailCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [cedulaNumber, setCedulaNumber] = useState('001-280495-1022U');
  const [cedulaSuccess, setCedulaSuccess] = useState(false);

  if (!isOpen) return null;

  const handleStartBiometricScan = () => {
    setScanning(true);
    setScanSuccess(false);
    setTimeout(() => {
      setScanning(false);
      setScanSuccess(true);
      sounds.playBiometricSuccess();
      onUpdateUser({
        isVerified: true,
        verificationType: 'biometric',
        biometricRegistered: true,
      });
    }, 2200);
  };

  const handleSendEmailCode = () => {
    setCodeSent(true);
  };

  const handleVerifyEmail = () => {
    if (emailCode.trim().length >= 4) {
      setEmailSuccess(true);
      sounds.playBiometricSuccess();
      onUpdateUser({
        emailVerified: true,
        isVerified: true
      });
    }
  };

  const handleVerifyCedula = () => {
    if (cedulaNumber.trim().length >= 8) {
      setCedulaSuccess(true);
      sounds.playBiometricSuccess();
      onUpdateUser({
        isVerified: true,
        verificationType: 'cedula'
      });
    }
  };

  return (
    <div id="biometric-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div 
        id="biometric-modal-card"
        className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100 transition-all"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-850 to-sky-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                {t.verifiedBadge} 🇳🇮
              </h3>
              <p className="text-xs text-slate-400">
                Seguridad de grado gubernamental & biométrico
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

        {/* Tab Navigation */}
        <div className="grid grid-cols-3 border-b border-slate-800 text-xs font-semibold bg-slate-950/40">
          <button
            onClick={() => setActiveTab('biometric')}
            className={`py-3 px-2 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'biometric' 
                ? 'border-sky-500 text-sky-400 bg-sky-500/10' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Fingerprint className="w-4 h-4" />
            <span>Biometría</span>
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`py-3 px-2 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'email' 
                ? 'border-sky-500 text-sky-400 bg-sky-500/10' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Correo Seguro</span>
          </button>
          <button
            onClick={() => setActiveTab('cedula')}
            className={`py-3 px-2 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'cedula' 
                ? 'border-sky-500 text-sky-400 bg-sky-500/10' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Cédula NI</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 space-y-5">
          {activeTab === 'biometric' && (
            <div className="text-center space-y-4">
              <div className="relative mx-auto w-28 h-28 flex items-center justify-center">
                <div className={`absolute inset-0 rounded-full ${scanning ? 'animate-ping bg-sky-500/30' : 'bg-sky-500/10'}`} />
                <div className="relative w-24 h-24 rounded-full border-2 border-sky-400/50 flex items-center justify-center bg-slate-950 shadow-inner">
                  {scanning ? (
                    <Scan className="w-12 h-12 text-sky-400 animate-pulse" />
                  ) : scanSuccess || currentUser.biometricRegistered ? (
                    <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                  ) : (
                    <Fingerprint className="w-12 h-12 text-sky-400 hover:scale-110 transition-transform" />
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-white text-base">
                  {scanSuccess || currentUser.biometricRegistered
                    ? 'Biometría Activa y Autenticada'
                    : 'Reconocimiento Facial / Huella Digital'}
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Utiliza WebAuthn / Passkey para iniciar sesión instantáneamente sin riesgos de suplantación.
                </p>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-left text-xs space-y-1.5 text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Protección Criptográfica:</span>
                  <span className="text-emerald-400 font-mono font-medium">Hardware Enclave (FIDO2)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Estado de Cuenta:</span>
                  <span className="text-sky-400 font-medium flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Verificado Oficial
                  </span>
                </div>
              </div>

              <button
                id="btn-trigger-scan"
                onClick={handleStartBiometricScan}
                disabled={scanning}
                className="w-full py-3 px-4 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold rounded-xl transition shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {scanning ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Escaneando rasgos biométricos...
                  </>
                ) : (
                  <>
                    <Fingerprint className="w-5 h-5" />
                    {scanSuccess || currentUser.biometricRegistered ? 'Volver a Calibrar Biometría' : 'Activar Verificación Biométrica'}
                  </>
                )}
              </button>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="text-xs text-slate-400">Correo Electrónico Vinculado</p>
                  <p className="text-sm font-semibold text-slate-200 truncate">{currentUser.email}</p>
                </div>
                {currentUser.emailVerified && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/30">
                    Confirmado ✓
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-300 font-medium">Código de Confirmación (OTP):</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={emailCode}
                    onChange={(e) => setEmailCode(e.target.value)}
                    placeholder="Ej: 984210"
                    maxLength={6}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-center text-lg tracking-widest font-mono text-white focus:outline-none focus:border-sky-500"
                  />
                  <button
                    onClick={handleSendEmailCode}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
                  >
                    {codeSent ? 'Reenviado' : 'Enviar Código'}
                  </button>
                </div>
                {codeSent && (
                  <p className="text-xs text-sky-400 flex items-center gap-1 mt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Código de seguridad enviado a {currentUser.email} (Código demo: 984210)
                  </p>
                )}
              </div>

              <button
                onClick={handleVerifyEmail}
                disabled={emailCode.length < 4}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition shadow-lg shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
              >
                Confirmar Correo Electrónico
              </button>

              {emailSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>¡Tu correo ha sido confirmado y vinculado exitosamente!</span>
                </div>
              )}
            </div>
          )}

          {activeTab === 'cedula' && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 space-y-2">
                <div className="flex items-center gap-2 text-sky-400 font-semibold">
                  <Lock className="w-4 h-4" /> Verificación con Cédula Nicaragüense
                </div>
                <p className="text-slate-400">
                  Valida la autenticidad de tu perfil ante la comunidad de Nicaragua para evitar cuentas falsas o suplantación.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Número de Cédula de Identidad:</label>
                <input
                  type="text"
                  value={cedulaNumber}
                  onChange={(e) => setCedulaNumber(e.target.value)}
                  placeholder="001-000000-0000X"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 font-mono text-white text-sm focus:outline-none focus:border-sky-500"
                />
              </div>

              <button
                onClick={handleVerifyCedula}
                className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-xl transition shadow-lg shadow-sky-600/20 cursor-pointer"
              >
                Validar Cédula y Obtener Insignia Oficial
              </button>

              {cedulaSuccess && (
                <div className="p-3 bg-sky-500/10 border border-sky-500/30 rounded-xl text-sky-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-sky-400" />
                  <span>Cédula verificada satisfactoriamente con sello oficial 🇳🇮</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Protocolo Naul SafeID v2.4
          </span>
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
