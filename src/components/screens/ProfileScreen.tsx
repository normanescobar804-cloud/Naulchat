import React, { useState } from 'react';
import { 
  Settings, Camera, Phone, Mail, Info, 
  Lock, Bell, Database, HelpCircle, ChevronRight, ShieldCheck 
} from 'lucide-react';
import { User } from '../../types';

interface ProfileScreenProps {
  currentUser: User;
  onOpenSettings: () => void;
  onOpenPrivacy?: () => void;
  onOpenBiometrics?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  currentUser,
  onOpenSettings,
  onOpenPrivacy,
  onOpenBiometrics,
}) => {
  const [showFullPhone, setShowFullPhone] = useState(false);

  return (
    <div className="w-full h-full flex flex-col bg-[#050b14] text-white select-none overflow-y-auto">
      {/* Top Header */}
      <div className="pt-4 px-5 pb-3 flex items-center justify-between border-b border-slate-800/80 bg-[#070e1a]/80 backdrop-blur-md sticky top-0 z-20">
        <h2 className="font-display font-bold text-lg text-white">
          Perfil
        </h2>
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition cursor-pointer"
          title="Configuración"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 px-4 py-6 space-y-6 max-w-md mx-auto w-full">
        {/* User Card */}
        <div className="flex flex-col items-center text-center">
          <div className="relative group">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-24 h-24 rounded-full object-cover border-2 border-slate-700 shadow-xl"
            />
            {/* Camera badge */}
            <button
              onClick={() => alert('Seleccionar foto de perfil o tomar captura con cámara')}
              className="absolute bottom-0 right-0 p-2 rounded-full bg-[#0077ff] hover:bg-[#0066dd] text-white shadow-lg border-2 border-[#050b14] transition cursor-pointer"
              title="Cambiar foto de perfil"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <h3 className="font-display font-extrabold text-lg text-white mt-3">
            {currentUser.name}
          </h3>

          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs text-slate-300 font-medium">En línea</span>
            {currentUser.isVerified && (
              <span className="ml-1 inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md bg-sky-500/10 text-sky-400 text-[10px] font-semibold">
                <ShieldCheck className="w-3 h-3" /> Verificado 🇳🇮
              </span>
            )}
          </div>
        </div>

        {/* Contact Info Card */}
        <div className="rounded-2xl bg-[#0b1322] border border-slate-800/80 divide-y divide-slate-800/60 overflow-hidden shadow-lg">
          {/* Phone */}
          <div 
            onClick={() => setShowFullPhone(!showFullPhone)}
            className="p-3.5 flex items-center gap-3.5 cursor-pointer hover:bg-slate-800/30 transition"
          >
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
              <Phone className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-slate-400">Número de teléfono</p>
              <p className="text-xs sm:text-sm font-medium text-white truncate">
                {showFullPhone ? currentUser.phone : '+505 8XX XXX XXX'}
              </p>
            </div>
          </div>

          {/* Email */}
          <div className="p-3.5 flex items-center gap-3.5 hover:bg-slate-800/30 transition">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-slate-400">Correo electrónico</p>
              <p className="text-xs sm:text-sm font-medium text-white truncate">
                {currentUser.email || 'norman@email.com'}
              </p>
            </div>
          </div>

          {/* About / Bio */}
          <div className="p-3.5 flex items-center gap-3.5 hover:bg-slate-800/30 transition">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Info className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-slate-400">Acerca de</p>
              <p className="text-xs sm:text-sm font-medium text-white break-words">
                {currentUser.bio || 'La disciplina te lleva lejos. 💪'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Menu List */}
        <div className="rounded-2xl bg-[#0b1322] border border-slate-800/80 divide-y divide-slate-800/60 overflow-hidden shadow-lg">
          {/* Privacidad */}
          <button
            onClick={onOpenPrivacy || onOpenBiometrics}
            className="w-full p-3.5 flex items-center justify-between hover:bg-slate-800/40 transition cursor-pointer text-left"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-slate-200">
                Privacidad y Cifrado
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>

          {/* Notificaciones */}
          <button
            onClick={onOpenSettings}
            className="w-full p-3.5 flex items-center justify-between hover:bg-slate-800/40 transition cursor-pointer text-left"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-slate-200">
                Notificaciones
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>

          {/* Datos y almacenamiento */}
          <button
            onClick={() => alert('Almacenamiento: 42.4 MB utilizados. Caché cifrada local.')}
            className="w-full p-3.5 flex items-center justify-between hover:bg-slate-800/40 transition cursor-pointer text-left"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
                <Database className="w-4 h-4" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-slate-200">
                Datos y almacenamiento
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>

          {/* Ayuda */}
          <button
            onClick={() => alert('Naul Chat Nicaragua - Soporte 24/7 y Centro de Asistencia técnica.')}
            className="w-full p-3.5 flex items-center justify-between hover:bg-slate-800/40 transition cursor-pointer text-left"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-slate-500/10 text-slate-400 flex items-center justify-center shrink-0">
                <HelpCircle className="w-4 h-4" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-slate-200">
                Ayuda
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>
    </div>
  );
};
