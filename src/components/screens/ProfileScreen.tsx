import React, { useState, useRef } from 'react';
import { 
  Settings, Camera, Phone, Mail, Info, 
  Lock, Bell, Database, HelpCircle, ChevronRight, ShieldCheck,
  ArrowLeft, LogOut, Edit2, Check, X, Store, Star, Cloud, Bot, Award
} from 'lucide-react';
import { User } from '../../types';

interface ProfileScreenProps {
  currentUser: User;
  onOpenSettings: () => void;
  onOpenPrivacy?: () => void;
  onOpenBiometrics?: () => void;
  onOpenBusinessAndPlans?: (tab?: 'plans' | 'business' | 'ai' | 'ads' | 'verification' | 'storage') => void;
  onBack?: () => void;
  onLogout?: () => void;
  onUpdateUser?: (updated: Partial<User>) => void;
  onOpenEditProfilePhoto?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  currentUser,
  onOpenSettings,
  onOpenPrivacy,
  onOpenBiometrics,
  onOpenBusinessAndPlans,
  onBack,
  onLogout,
  onUpdateUser,
  onOpenEditProfilePhoto,
}) => {
  const [showFullPhone, setShowFullPhone] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [editedBio, setEditedBio] = useState(currentUser.bio || '');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(currentUser.name || '');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUpdateUser) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      onUpdateUser({ avatar: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  const saveBio = () => {
    if (onUpdateUser) {
      onUpdateUser({ bio: editedBio.trim() });
    }
    setIsEditingBio(false);
  };

  const saveName = () => {
    if (onUpdateUser && editedName.trim()) {
      onUpdateUser({ name: editedName.trim() });
    }
    setIsEditingName(false);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#050b14] text-white select-none overflow-y-auto">
      {/* Hidden avatar file input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleAvatarChange}
        className="hidden"
      />

      {/* Top Header */}
      <div className="pt-4 px-4 pb-3 flex items-center justify-between border-b border-slate-800/80 bg-[#070e1a]/80 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 transition cursor-pointer"
              title="Volver a los chats"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <h2 className="font-display font-bold text-lg text-white">
            Perfil de Usuario
          </h2>
        </div>
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
          <div className="relative group cursor-pointer" onClick={() => onOpenEditProfilePhoto ? onOpenEditProfilePhoto() : fileInputRef.current?.click()}>
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-24 h-24 rounded-full object-cover border-2 border-sky-400/80 shadow-xl group-hover:opacity-90 transition"
            />
            {/* Camera badge */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenEditProfilePhoto) {
                  onOpenEditProfilePhoto();
                } else {
                  fileInputRef.current?.click();
                }
              }}
              className="absolute bottom-0 right-0 p-2 rounded-full bg-[#0077ff] hover:bg-[#0066dd] text-white shadow-lg border-2 border-[#050b14] transition cursor-pointer"
              title="Editar foto de perfil cuando desees"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Edit Photo Trigger Button */}
          <button
            type="button"
            onClick={() => onOpenEditProfilePhoto ? onOpenEditProfilePhoto() : fileInputRef.current?.click()}
            className="mt-2 text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 transition cursor-pointer px-2.5 py-1 rounded-full bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20"
          >
            <Camera className="w-3 h-3" />
            <span>Editar foto de perfil</span>
          </button>

          {/* Name & Quick Edit */}
          {isEditingName ? (
            <div className="flex items-center gap-1.5 mt-3">
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="px-2.5 py-1 text-sm bg-slate-800 border border-sky-500 rounded-lg text-white focus:outline-none text-center font-bold"
                autoFocus
              />
              <button onClick={saveName} className="p-1 text-emerald-400 hover:text-emerald-300">
                <Check className="w-4 h-4" />
              </button>
              <button onClick={() => setIsEditingName(false)} className="p-1 text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 mt-3">
              <h3 className="font-display font-extrabold text-lg text-white">
                {currentUser.name}
              </h3>
              <button 
                onClick={() => setIsEditingName(true)}
                className="text-slate-500 hover:text-sky-400 transition"
                title="Editar nombre"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-slate-300 font-medium">En línea</span>
            
            {currentUser.plan === 'business' ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                <Store className="w-3 h-3" /> Comercio Verificado
              </span>
            ) : currentUser.plan === 'premium' ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 text-[10px] font-bold border border-amber-500/30">
                <Star className="w-3 h-3" /> Usuario VIP ⭐
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px] font-medium border border-slate-700">
                🆓 Plan Gratis
              </span>
            )}

            {currentUser.isVerified && currentUser.plan !== 'business' && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-sky-500/10 text-sky-400 text-[10px] font-semibold border border-sky-500/20">
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
              <p className="text-[11px] text-slate-400">Número de teléfono (+505 Nicaragua)</p>
              <p className="text-xs sm:text-sm font-medium text-white truncate">
                {showFullPhone ? currentUser.phone : `${currentUser.phone.slice(0, 8)} XXXX`}
              </p>
            </div>
            <span className="text-[10px] text-sky-400 font-medium">
              {showFullPhone ? 'Ocultar' : 'Mostrar'}
            </span>
          </div>

          {/* Email */}
          <div className="p-3.5 flex items-center gap-3.5 hover:bg-slate-800/30 transition">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-slate-400">Correo electrónico</p>
              <p className="text-xs sm:text-sm font-medium text-white truncate">
                {currentUser.email || 'normanescobar804@gmail.com'}
              </p>
            </div>
          </div>

          {/* About / Bio with inline edit */}
          <div className="p-3.5 flex items-start gap-3.5 hover:bg-slate-800/30 transition">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <Info className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-slate-400">Estado / Biografía</p>
                {!isEditingBio && (
                  <button 
                    onClick={() => setIsEditingBio(true)}
                    className="text-[10px] text-sky-400 hover:text-sky-300 font-medium"
                  >
                    Editar
                  </button>
                )}
              </div>
              {isEditingBio ? (
                <div className="mt-1.5 space-y-2">
                  <input
                    type="text"
                    value={editedBio}
                    onChange={(e) => setEditedBio(e.target.value)}
                    placeholder="Escribe tu biografía..."
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-800 border border-sky-500 rounded-lg text-white focus:outline-none"
                    autoFocus
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={saveBio}
                      className="px-3 py-1 rounded-md bg-sky-500 hover:bg-sky-600 text-white text-[11px] font-semibold"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => setIsEditingBio(false)}
                      className="px-2 py-1 text-slate-400 hover:text-white text-[11px]"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs sm:text-sm font-medium text-white break-words mt-0.5">
                  {currentUser.bio || '¡Hola! Estoy usando Naul Chat Nicaragua 🇳🇮'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Business & Monetization Model Card */}
        <div className="rounded-2xl bg-gradient-to-r from-[#0e1b2e] to-[#0d222e] border border-sky-500/30 p-4 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Planes & Negocios (C$)
              </span>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
              Cómo funcionaría
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {currentUser.plan === 'business' 
              ? 'Tienes activo tu Perfil Comercial con Catálogo digital e IA 24/7 para atención a clientes.'
              : currentUser.plan === 'premium'
              ? 'Tienes activo Naul Premium VIP: 50 GB de almacenamiento, fotos Ultra-HD y estrella dorada.'
              : 'Chat y llamadas 100% gratis. Descubre el Perfil Comercial (C$100–300/mes) o funciones Premium (C$50–100/mes).'}
          </p>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => onOpenBusinessAndPlans && onOpenBusinessAndPlans('plans')}
              className="py-2 px-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 border border-slate-700"
            >
              <Star className="w-3.5 h-3.5 text-amber-400" />
              <span>Ver Planes C$</span>
            </button>

            <button
              onClick={() => onOpenBusinessAndPlans && onOpenBusinessAndPlans(currentUser.plan === 'business' ? 'business' : 'business')}
              className="py-2 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 border border-emerald-500/40"
            >
              <Store className="w-3.5 h-3.5 text-emerald-400" />
              <span>{currentUser.plan === 'business' ? 'Mi Catálogo' : 'Activar Negocio'}</span>
            </button>
          </div>
        </div>

        {/* Cloud Storage Quick Monitor */}
        <div 
          onClick={() => onOpenBusinessAndPlans && onOpenBusinessAndPlans('storage')}
          className="rounded-2xl bg-[#0b1322] border border-slate-800/80 p-3.5 hover:border-slate-700 transition cursor-pointer space-y-2 shadow-lg"
        >
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Cloud className="w-4 h-4 text-cyan-400" />
              <span className="font-semibold text-white">Almacenamiento en la Nube</span>
            </div>
            <span className="text-[11px] text-cyan-400 font-bold">
              {currentUser.storageQuota?.usedMb || 245} MB / {((currentUser.storageQuota?.totalMb || 8192) / 1024).toFixed(0)} GB
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
            <div className="h-full bg-cyan-400 w-1/4 rounded-full" />
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>Fotos, audios y documentos seguros</span>
            <span className="text-sky-400 font-medium hover:underline">Gestionar espacio →</span>
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
                Privacidad y Cifrado E2EE
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>

          {/* Configuración */}
          <button
            onClick={onOpenSettings}
            className="w-full p-3.5 flex items-center justify-between hover:bg-slate-800/40 transition cursor-pointer text-left"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                <Settings className="w-4 h-4" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-slate-200">
                Ajustes de la Aplicación
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Cerrar sesión prominente */}
        {onLogout && (
          <div className="pt-2 pb-6">
            <button
              onClick={onLogout}
              className="w-full py-3.5 px-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 flex items-center justify-center gap-2.5 text-rose-400 hover:text-rose-300 font-semibold text-sm transition cursor-pointer active:scale-98 shadow-md"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
