import React, { useState } from 'react';
import { 
  Search, ShieldCheck, Fingerprint, Lock, Compass, Moon, Sun, 
  Globe, CheckCheck, MapPin, Mic, Image as ImageIcon, 
  FileText, Pin, KeyRound, Sparkles, X, MessageSquare, Users, 
  Phone, User as UserIcon, Pencil, MoreVertical, Video, Link2, PhoneIncoming, PhoneOutgoing,
  Github
} from 'lucide-react';
import { Conversation, User, LanguageCode, AppTheme } from '../types';
import { translations } from '../utils/translations';
import { CnLogo } from './CnLogo';
import { MessageStatusCheck } from './MessageStatusCheck';

interface Props {
  conversations: Conversation[];
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
  currentUser: User;
  onOpenBiometrics: () => void;
  onOpenRecovery: () => void;
  onOpenSocialHub: () => void;
  onOpenProfile?: () => void;
  onOpenSettings?: () => void;
  onOpenVoiceCall?: (isVideo?: boolean) => void;
  lang: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
  theme: AppTheme;
  onToggleTheme: () => void;
  onNewChat: () => void;
  onOpenGitHubExport?: () => void;
}

export const Sidebar: React.FC<Props> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  currentUser,
  onOpenBiometrics,
  onOpenRecovery,
  onOpenSocialHub,
  onOpenProfile,
  onOpenSettings,
  onOpenVoiceCall,
  lang,
  onSelectLanguage,
  theme,
  onToggleTheme,
  onNewChat,
  onOpenGitHubExport,
}) => {
  const t = translations[lang];
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chats' | 'groups' | 'calls'>('chats');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);

  const filteredConversations = conversations.filter(conv => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = conv.name.toLowerCase().includes(q);
      const matchMsg = conv.lastMessage?.content.toLowerCase().includes(q);
      if (!matchName && !matchMsg) return false;
    }

    // Main Tab Filter matching mockup
    if (activeTab === 'groups' && conv.type !== 'group') return false;
    if (activeTab === 'chats' && conv.type === 'group' && searchQuery === '' && false) {
      // Show all in chats tab like WhatsApp/Mockup
    }

    return true;
  });

  const getMessagePreview = (conv: Conversation) => {
    const msg = conv.lastMessage;
    if (!msg) return 'Comienza una conversación segura...';
    if (msg.type === 'audio') {
      return (
        <span className="flex items-center gap-1 text-sky-400">
          <Mic className="w-3.5 h-3.5" />
          <span>Nota de voz ({msg.audioMetadata?.duration || 15}s)</span>
        </span>
      );
    }
    if (msg.type === 'image') {
      return (
        <span className="flex items-center gap-1 text-slate-300">
          <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
          <span>{msg.caption || 'Foto en alta calidad'}</span>
        </span>
      );
    }
    if (msg.type === 'location') {
      return (
        <span className="flex items-center gap-1 text-emerald-400">
          <MapPin className="w-3.5 h-3.5" />
          <span>Ubicación en tiempo real</span>
        </span>
      );
    }
    if (msg.type === 'file') {
      return (
        <span className="flex items-center gap-1 text-slate-300">
          <FileText className="w-3.5 h-3.5 text-sky-400" />
          <span>{msg.fileMetadata?.fileName || 'Documento adjunto'}</span>
        </span>
      );
    }
    return msg.content;
  };

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return '';
    const now = new Date();
    const date = new Date(timestamp);
    const diffHours = (now.getTime() - date.getTime()) / (1000 * 3600);

    if (diffHours < 24 && date.getDate() === now.getDate()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (diffHours < 48) {
      return 'Ayer';
    }
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return days[date.getDay()];
  };

  return (
    <aside 
      id="sidebar-container"
      className="w-full md:w-80 lg:w-96 flex flex-col h-full border-r border-slate-800/80 bg-[#070e1a] shrink-0 select-none z-20 relative"
    >
      {/* Top Header matching Mockup Screen #5 */}
      <div className="pt-3 px-4 pb-2 border-b border-slate-800/80 bg-[#091322] flex items-center justify-between">
        {/* CN Logo + Title */}
        <div className="flex items-center gap-2">
          <CnLogo size="sm" />
          <div className="flex items-center gap-1.5">
            <span className="font-display font-extrabold text-white text-base tracking-tight">
              Naual Chat
            </span>
            <span className="font-display font-extrabold text-sky-400 text-base tracking-tight">
              Nicaragua
            </span>
          </div>
        </div>

        {/* Right action icons: Search & Menu */}
        <div className="flex items-center gap-1 text-slate-300">
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
            title="Buscar"
          >
            <Search className="w-4 h-4" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowMenuDropdown(!showMenuDropdown)}
              className="p-2 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
              title="Menú de opciones"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenuDropdown && (
              <div className="absolute right-0 mt-2 w-48 py-1.5 bg-[#0d1728] border border-slate-700/80 rounded-2xl shadow-2xl z-50 text-xs text-slate-200 divide-y divide-slate-800">
                <div className="px-3 py-2 text-[11px] text-slate-400 flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>E2EE Activo 🇳🇮</span>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => { setShowMenuDropdown(false); onOpenSocialHub(); }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center gap-2.5"
                  >
                    <Compass className="w-4 h-4 text-indigo-400" />
                    <span>Social Hub (YouTube/TikTok)</span>
                  </button>
                  <button
                    onClick={() => { setShowMenuDropdown(false); onOpenBiometrics(); }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center gap-2.5"
                  >
                    <Fingerprint className="w-4 h-4 text-sky-400" />
                    <span>Autenticación Biométrica</span>
                  </button>
                  <button
                    onClick={() => { setShowMenuDropdown(false); onOpenRecovery(); }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center gap-2.5"
                  >
                    <KeyRound className="w-4 h-4 text-amber-400" />
                    <span>Recuperar Contraseña</span>
                  </button>
                  {onOpenSettings && (
                    <button
                      onClick={() => { setShowMenuDropdown(false); onOpenSettings(); }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center gap-2.5"
                    >
                      <Lock className="w-4 h-4 text-slate-400" />
                      <span>Configuración</span>
                    </button>
                  )}
                  {onOpenGitHubExport && (
                    <button
                      onClick={() => { setShowMenuDropdown(false); onOpenGitHubExport(); }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center gap-2.5 text-sky-400 font-medium"
                    >
                      <Github className="w-4 h-4 text-sky-400" />
                      <span>Pasar a GitHub / Descargar ZIP</span>
                    </button>
                  )}
                </div>
                <div className="py-1">
                  <button
                    onClick={() => { setShowMenuDropdown(false); onToggleTheme(); }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center justify-between"
                  >
                    <span>Modo Oscuro / Color</span>
                    {theme === 'dark' ? <Moon className="w-3.5 h-3.5 text-sky-400" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expandable Search Input */}
      {isSearchOpen && (
        <div className="p-2.5 bg-[#091322] border-b border-slate-800/80 animate-fadeIn">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar mensajes o personas..."
              autoFocus
              className="w-full bg-[#0d192d] border border-slate-700/70 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Navigation Tabs matching Mockup: Chats | Grupos | Llamadas */}
      <div className="flex items-center justify-around bg-[#091322] border-b border-slate-800/80 text-xs font-semibold text-slate-400">
        <button
          onClick={() => setActiveTab('chats')}
          className={`flex-1 py-3 text-center relative transition cursor-pointer ${
            activeTab === 'chats'
              ? 'text-sky-400 font-bold'
              : 'hover:text-slate-200'
          }`}
        >
          <span>Chats</span>
          {activeTab === 'chats' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-400 shadow-sm shadow-sky-400" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('groups')}
          className={`flex-1 py-3 text-center relative transition cursor-pointer ${
            activeTab === 'groups'
              ? 'text-sky-400 font-bold'
              : 'hover:text-slate-200'
          }`}
        >
          <span>Grupos</span>
          {activeTab === 'groups' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-400 shadow-sm shadow-sky-400" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('calls')}
          className={`flex-1 py-3 text-center relative transition cursor-pointer ${
            activeTab === 'calls'
              ? 'text-sky-400 font-bold'
              : 'hover:text-slate-200'
          }`}
        >
          <span>Llamadas</span>
          {activeTab === 'calls' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-400 shadow-sm shadow-sky-400" />
          )}
        </button>
      </div>

      {/* Conversation / Calls List */}
      <div id="conversations-list" className="flex-1 overflow-y-auto divide-y divide-slate-800/40 px-1 py-1 relative">
        {activeTab === 'calls' ? (
          <div className="p-2 space-y-3">
            {/* Create Call Link Banner */}
            <div 
              onClick={() => {
                onSelectConversation('conv-yuri');
                if (onOpenVoiceCall) onOpenVoiceCall(true);
              }}
              className="p-3 rounded-2xl bg-gradient-to-r from-sky-900/40 to-blue-950/50 border border-sky-500/30 flex items-center gap-3 cursor-pointer hover:border-sky-400/60 transition group"
            >
              <div className="w-11 h-11 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-lg shadow-sky-500/30 shrink-0 group-hover:scale-105 transition">
                <Link2 className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-white">
                  Crear enlace de llamada
                </h4>
                <p className="text-[11px] text-sky-300 truncate">
                  Conexión P2P en tiempo real sin importar la distancia
                </p>
              </div>
            </div>

            {/* Recents header */}
            <div className="px-2 pt-2 flex items-center justify-between text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
              <span>Recientes</span>
              <span className="text-emerald-400 lowercase font-normal flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>WebRTC Global</span>
              </span>
            </div>

            {/* Calls log list */}
            <div className="space-y-1">
              {conversations.map((conv, idx) => {
                const isVideoRecent = idx % 2 === 0;
                return (
                  <div
                    key={`call-${conv.id}`}
                    className="p-2.5 rounded-2xl hover:bg-slate-800/60 transition flex items-center justify-between gap-2 text-slate-200"
                  >
                    <div 
                      onClick={() => {
                        onSelectConversation(conv.id);
                        if (onOpenVoiceCall) onOpenVoiceCall(isVideoRecent);
                      }}
                      className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                    >
                      <div className="relative shrink-0">
                        <img
                          src={conv.avatar}
                          alt={conv.name}
                          className="w-11 h-11 rounded-full object-cover border border-slate-700"
                        />
                        <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-[10px]">
                          {isVideoRecent ? (
                            <PhoneIncoming className="w-2.5 h-2.5 text-emerald-400" />
                          ) : (
                            <PhoneOutgoing className="w-2.5 h-2.5 text-sky-400" />
                          )}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-semibold text-white truncate">
                          {conv.name}
                        </h4>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                          <span>{isVideoRecent ? 'Videollamada' : 'Llamada de voz'}</span>
                          <span>•</span>
                          <span>{idx === 0 ? 'Hoy, 14:15' : idx === 1 ? 'Ayer, 18:42' : 'Hace 3 días'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Call Action Buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => {
                          onSelectConversation(conv.id);
                          if (onOpenVoiceCall) onOpenVoiceCall(false);
                        }}
                        className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-sky-400 hover:text-white transition cursor-pointer"
                        title="Llamada de voz"
                      >
                        <Phone className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          onSelectConversation(conv.id);
                          if (onOpenVoiceCall) onOpenVoiceCall(true);
                        }}
                        className="p-2 rounded-xl bg-sky-600/30 hover:bg-sky-600 border border-sky-500/40 text-sky-200 hover:text-white transition cursor-pointer shadow-sm"
                        title="Videollamada HD en tiempo real"
                      >
                        <Video className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs px-4">
            <p>No se encontraron conversaciones.</p>
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const isSelected = conv.id === activeConversationId;
            return (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={`p-3 rounded-2xl cursor-pointer transition-all flex items-center gap-3 relative ${
                  isSelected
                    ? 'bg-sky-500/15 border border-sky-500/30 text-white shadow-sm'
                    : 'hover:bg-slate-800/50 text-slate-300'
                }`}
              >
                {/* Avatar with badges */}
                <div className="relative shrink-0">
                  <img
                    src={conv.avatar}
                    alt={conv.name}
                    className="w-12 h-12 rounded-full object-cover border border-slate-700/80"
                  />
                  {conv.type === 'group' && (
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-800 border border-slate-700 text-[10px] flex items-center justify-center text-slate-300 font-bold">
                      👥
                    </span>
                  )}
                  {conv.isVerified && conv.type !== 'group' && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-sky-500 text-white flex items-center justify-center shadow">
                      <ShieldCheck className="w-3 h-3" />
                    </span>
                  )}
                </div>

                {/* Conversation Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 truncate">
                      <h4 className={`text-xs sm:text-sm font-semibold truncate ${isSelected ? 'text-white' : 'text-slate-100'}`}>
                        {conv.name}
                      </h4>
                      {conv.isPinned && <Pin className="w-3 h-3 text-amber-400 rotate-45 shrink-0" />}
                    </div>
                    <span className="text-[10px] sm:text-xs text-slate-400 shrink-0 ml-1">
                      {formatTime(conv.lastMessage?.timestamp)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-1">
                    <div className="text-xs text-slate-400 truncate max-w-[190px]">
                      {getMessagePreview(conv)}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-1">
                      {conv.unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-[#0077ff] text-white text-[10px] font-bold shadow-sm">
                          {conv.unreadCount}
                        </span>
                      )}
                      {conv.lastMessage?.senderId === currentUser.id && (
                        <MessageStatusCheck
                          status={conv.lastMessage.status}
                          size="xs"
                          className="shrink-0"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Floating Action Button (FAB Pencil) matching Mockup */}
        <button
          onClick={onNewChat}
          className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-[#0077ff] hover:bg-[#0066dd] text-white shadow-xl shadow-blue-600/40 flex items-center justify-center transition hover:scale-110 active:scale-95 cursor-pointer z-10"
          title="Nuevo chat"
        >
          <Pencil className="w-5 h-5" />
        </button>
      </div>

      {/* Bottom Navigation Bar matching Mockup Screen #5 & #7 */}
      <div className="border-t border-slate-800/80 bg-[#091322] flex items-center justify-around py-2 px-1 text-xs">
        <button
          onClick={() => setActiveTab('chats')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition cursor-pointer ${
            activeTab === 'chats' ? 'text-sky-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-[10px]">Chats</span>
        </button>

        <button
          onClick={() => setActiveTab('groups')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition cursor-pointer ${
            activeTab === 'groups' ? 'text-sky-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px]">Grupos</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('calls');
            if (onOpenVoiceCall) onOpenVoiceCall(false);
          }}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition cursor-pointer ${
            activeTab === 'calls' ? 'text-sky-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Phone className="w-5 h-5" />
          <span className="text-[10px]">Llamadas</span>
        </button>

        <button
          onClick={() => {
            if (onOpenProfile) onOpenProfile();
          }}
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-slate-400 hover:text-sky-400 transition cursor-pointer"
        >
          <UserIcon className="w-5 h-5" />
          <span className="text-[10px]">Perfil</span>
        </button>
      </div>
    </aside>
  );
};
