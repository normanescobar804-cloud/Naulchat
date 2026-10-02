import React, { useState } from 'react';
import { KeyRound, Phone, Mail, CheckCircle2, ArrowRight, ShieldCheck, X, Eye, EyeOff, Lock } from 'lucide-react';
import { translations } from '../utils/translations';
import { sounds } from '../utils/security';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userPhone: string;
  userEmail: string;
  lang: 'es' | 'en' | 'miskito' | 'pt';
}

export const PasswordRecoveryModal: React.FC<Props> = ({
  isOpen,
  onClose,
  userPhone,
  userEmail,
  lang,
}) => {
  const t = translations[lang];
  const [method, setMethod] = useState<'phone' | 'email'>('phone');
  const [step, setStep] = useState<'request' | 'verify' | 'newPassword' | 'success'>('request');
  const [phoneInput, setPhoneInput] = useState(userPhone || '+505 8899 4432');
  const [emailInput, setEmailInput] = useState(userEmail || 'normanescobar804@gmail.com');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSendCode = () => {
    setIsSubmitting(true);
    setErrorMessage('');
    setTimeout(() => {
      setIsSubmitting(false);
      setStep('verify');
    }, 1000);
  };

  const handleVerifyOtp = () => {
    if (otpCode.trim().length < 4) {
      setErrorMessage('Por favor ingresa el código de 6 dígitos.');
      return;
    }
    setErrorMessage('');
    setStep('newPassword');
  };

  const handleResetPassword = () => {
    if (newPassword.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }
    setErrorMessage('');
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      sounds.playBiometricSuccess();
      setStep('success');
    }, 1200);
  };

  const handleResetState = () => {
    setStep('request');
    setOtpCode('');
    setNewPassword('');
    setConfirmPassword('');
    setErrorMessage('');
    onClose();
  };

  return (
    <div id="password-recovery-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100 animate-scaleUp">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">
                {t.forgotPassword}
              </h3>
              <p className="text-xs text-slate-400">
                Recuperación ágil vía Celular o Correo
              </p>
            </div>
          </div>
          <button 
            onClick={handleResetState}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {step === 'request' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300">
                Selecciona el canal seguro para recibir tu código de validación:
              </p>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMethod('phone')}
                  className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                    method === 'phone'
                      ? 'border-sky-500 bg-sky-500/10 text-sky-400'
                      : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Phone className="w-4 h-4" />
                  <span className="text-xs font-semibold">SMS / Celular</span>
                  <span className="text-[10px] text-slate-400">Nicaragua (+505)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('email')}
                  className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                    method === 'email'
                      ? 'border-sky-500 bg-sky-500/10 text-sky-400'
                      : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  <span className="text-xs font-semibold">Correo Electrónico</span>
                  <span className="text-[10px] text-slate-400">Verificación inmediata</span>
                </button>
              </div>

              {method === 'phone' ? (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    {t.enterPhone}:
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      placeholder="+505 8899 4432"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    {t.enterEmail}:
                  </label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="ejemplo@correo.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              )}

              <button
                type="button"
                onClick={handleSendCode}
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold rounded-xl transition shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{t.sendCode}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {step === 'verify' && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <p className="text-xs text-slate-300">
                  Ingresa el código OTP de 6 dígitos que enviamos a:
                </p>
                <p className="text-sm font-semibold text-sky-400 font-mono">
                  {method === 'phone' ? phoneInput : emailInput}
                </p>
                <p className="text-[11px] text-slate-500">
                  (Código demo: 492015)
                </p>
              </div>

              <input
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="492015"
                maxLength={6}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-center text-xl tracking-widest font-mono text-white focus:outline-none focus:border-sky-500"
              />

              {errorMessage && (
                <p className="text-xs text-rose-400 text-center">{errorMessage}</p>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('request')}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Volver
                </button>
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  className="flex-2 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl transition shadow-md shadow-sky-600/20"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {step === 'newPassword' && (
            <div className="space-y-3.5">
              <p className="text-xs text-slate-300">
                Crea una nueva contraseña segura protegida por cifrado local:
              </p>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">{t.newPassword}:</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">{t.confirmPassword}:</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite la contraseña"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Password strength indicator */}
              <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] space-y-1 text-slate-400">
                <div className="flex items-center justify-between">
                  <span>Robustez de contraseña:</span>
                  <span className={newPassword.length >= 8 ? 'text-emerald-400 font-semibold' : 'text-amber-400'}>
                    {newPassword.length >= 8 ? 'Alta (Cifrado Fuerte)' : 'Aceptable'}
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${
                      newPassword.length >= 8 ? 'w-full bg-emerald-500' : newPassword.length >= 5 ? 'w-2/3 bg-amber-500' : 'w-1/4 bg-rose-500'
                    }`}
                  />
                </div>
              </div>

              {errorMessage && (
                <p className="text-xs text-rose-400 text-center">{errorMessage}</p>
              )}

              <button
                type="button"
                onClick={handleResetPassword}
                disabled={isSubmitting}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>{t.verifyAndReset}</span>
                  </>
                )}
              </button>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">
                  {t.passwordResetSuccess}
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Tu acceso ha sido restablecido con los protocolos de seguridad de Naul Chat Nicaragua.
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center gap-2 text-left">
                <ShieldCheck className="w-5 h-5 text-sky-400 shrink-0" />
                <span>Sesión asegurada con verificación en 2 pasos y biometría activa.</span>
              </div>

              <button
                type="button"
                onClick={handleResetState}
                className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-xl transition"
              >
                Acceder a mis conversaciones
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
