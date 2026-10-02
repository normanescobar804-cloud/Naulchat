import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, ShieldCheck, Shield, Fingerprint, Lock, Compass, Moon, Sun, 
  Globe, CheckCheck, MapPin, Mic, Image as ImageIcon, 
  FileText, Pin, KeyRound, Sparkles, X, MessageSquare, Users, 
  Phone, User as UserIcon, Pencil, MoreVertical, Video, Link2, PhoneIncoming, PhoneOutgoing,
  Github, LogOut, UserPlus, BookOpen, Building2, Check, Trash2, UserMinus, RotateCcw,
  Store, Star, CreditCard, Trophy, Camera
} from 'lucide-react';
import { Conversation, User, LanguageCode, AppTheme } from '../types';
import { translations } from '../utils/translations';
import { CnLogo } from './CnLogo';
import { MessageStatusCheck } from './MessageStatusCheck';
import { INITIAL_USERS } from '../data/initialData';
import { apiGetContacts, apiGetUsers, apiDeleteContact } from '../services/api';
import { syncDeletedContactIdsInFirestore, getDeletedContactIdsFromFirestore } from '../services/firestoreChat';
import { DeletedContactsModal } from './DeletedContactsModal';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface Props {
  conversations: Conversation[];
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
  onDeleteConversation?: (id: string) => void;
  currentUser: User;
  onOpenBiometrics: () => void;
  onOpenRecovery: () => void;
  onOpenSocialHub: () => void;
  onOpenProfile?: () => void;
  onOpenEditProfilePhoto?: () => void;
  onOpenSettings?: () => void;
  onOpenVoiceCall?: (isVideo?: boolean) => void;
  onOpenStatusStories?: () => void;
  onOpenReportModal?: () => void;
  lang: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
  theme: AppTheme;
  onToggleTheme: () => void;
  onNewChat: () => void;
  onOpenGitHubExport?: () => void;
  onOpenBusinessAndPlans?: (tab?: 'plans' | 'deposit' | 'points' | 'business' | 'ai' | 'ads' | 'verification' | 'storage') => void;
  onOpenBackupRestore?: (tab?: 'export' | 'restore' | 'drive') => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<Props> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onDeleteConversation,
  currentUser,
  onOpenBiometrics,
  onOpenRecovery,
  onOpenSocialHub,
  onOpenProfile,
  onOpenEditProfilePhoto,
  onOpenSettings,
  onOpenVoiceCall,
  onOpenStatusStories,
  onOpenReportModal,
  lang,
  onSelectLanguage,
  theme,
  onToggleTheme,
  onNewChat,
  onOpenGitHubExport,
  onOpenBusinessAndPlans,
  onOpenBackupRestore,
  onLogout,
}) => {
  const t = translations[lang];
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'chats' | 'groups' | 'contacts' | 'calls' | 'channels'>('chats');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);

  const highlightSidebarText = (text: string, query: string) => {
    if (!query.trim() || !text) return text;
    const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    const parts = text.split(regex);
    if (parts.length === 1) return text;
    return parts.map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="text-sky-300 font-bold bg-sky-500/30 px-0.5 rounded">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  // Deleted contacts state (persisted in localStorage and Firestore)
  const [deletedContactIds, setDeletedContactIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('naul_deleted_contact_ids');
      if (saved) return JSON.parse(saved);
      if (currentUser?.deletedContactIds && Array.isArray(currentUser.deletedContactIds)) {
        return currentUser.deletedContactIds;
      }
    } catch {
      // ignore
    }
    return [];
  });

  // Master pool of all contacts
  const [allContactsPool, setAllContactsPool] = useState<Map<string, User>>(() => {
    const map = new Map<string, User>();
    Object.values(INITIAL_USERS).forEach(u => {
      if (u.id !== currentUser.id) map.set(u.id, u);
    });
    return map;
  });

  // Modal and deletion states
  const [showDeletedContactsModal, setShowDeletedContactsModal] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<User | null>(null);
  const [showConfirmDeleteContact, setShowConfirmDeleteContact] = useState(false);
  const [deletedContactToast, setDeletedContactToast] = useState<{ name: string; contact: User } | null>(null);

  const [conversationToDelete, setConversationToDelete] = useState<Conversation | null>(null);
  const [showConfirmDeleteConv, setShowConfirmDeleteConv] = useState(false);

  // Real contacts state
  const [contactsList, setContactsList] = useState<User[]>(() => {
    return Object.values(INITIAL_USERS).filter(u => u.id !== currentUser.id);
  });

  // Sync deleted contact IDs from Firestore on mount
  useEffect(() => {
    if (currentUser?.id) {
      getDeletedContactIdsFromFirestore(currentUser.id).then(ids => {
        if (ids && ids.length > 0) {
          setDeletedContactIds(prev => {
            const combined = Array.from(new Set([...prev, ...ids]));
            localStorage.setItem('naul_deleted_contact_ids', JSON.stringify(combined));
            return combined;
          });
        }
      }).catch(() => {});
    }
  }, [currentUser]);

  useEffect(() => {
    Promise.all([
      apiGetUsers().catch(() => []),
      apiGetContacts().catch(() => [])
    ]).then(([users, contacts]) => {
      const map = new Map<string, User>();
      Object.values(INITIAL_USERS).forEach(u => map.set(u.id, u));
      users.forEach((u: User) => map.set(u.id, u));
      contacts.forEach((c: any) => {
        if (!map.has(c.contactUserId)) {
          map.set(c.contactUserId, {
            id: c.contactUserId,
            name: c.name,
            username: `@${c.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
            avatar: c.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
            status: 'online',
            isVerified: true,
            phone: c.phone,
            email: c.email,
            bio: c.bio,
            biometricRegistered: true,
            emailVerified: true,
            publicKeyFingerprint: `NC-${c.id?.slice(0, 8) || 'KEY'}`
          });
        }
      });
      setAllContactsPool(new Map(map));
      setContactsList(Array.from(map.values()).filter(u => u.id !== currentUser.id && u.phone !== currentUser.phone));
    });
  }, [currentUser]);

  // Active contacts excluding deleted
  const activeContacts = contactsList.filter(u => !deletedContactIds.includes(u.id));

  // Deleted contacts available for restoration
  const deletedContactsList = Array.from(allContactsPool.values()).filter((u: User) => 
    deletedContactIds.includes(u.id) && u.id !== currentUser.id && u.phone !== currentUser.phone
  );

  const filteredContacts = activeContacts.filter(u => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      (u.phone && u.phone.includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.bio && u.bio.toLowerCase().includes(q)) ||
      (u.location && u.location.toLowerCase().includes(q))
    );
  });

  const handleConfirmDeleteContact = async () => {
    if (!contactToDelete) return;
    const deletedUser = contactToDelete;
    const cid = deletedUser.id;
    const updated = Array.from(new Set([...deletedContactIds, cid]));
    setDeletedContactIds(updated);
    localStorage.setItem('naul_deleted_contact_ids', JSON.stringify(updated));

    if (currentUser?.id) {
      syncDeletedContactIdsInFirestore(currentUser.id, updated).catch(() => {});
    }

    // Delete completely from backend database by User ID and by Phone number
    apiDeleteContact(cid).catch(() => {});
    if (deletedUser.phone) {
      apiDeleteContact(deletedUser.phone).catch(() => {});
    }

    // Immediately remove from lists
    setContactsList(prev => prev.filter(c => c.id !== cid && (!deletedUser.phone || c.phone !== deletedUser.phone)));
    setAllContactsPool(prev => {
      const next = new Map(prev);
      next.delete(cid);
      return next;
    });

    setContactToDelete(null);
    setShowConfirmDeleteContact(false);

    // Show undo/confirmation toast
    setDeletedContactToast({ name: deletedUser.name, contact: deletedUser });
    setTimeout(() => {
      setDeletedContactToast(prev => prev?.name === deletedUser.name ? null : prev);
    }, 5000);
  };

  const handleRestoreContact = async (contact: User) => {
    const updated = deletedContactIds.filter(id => id !== contact.id);
    setDeletedContactIds(updated);
    localStorage.setItem('naul_deleted_contact_ids', JSON.stringify(updated));

    setContactsList(prev => {
      if (prev.some(u => u.id === contact.id)) return prev;
      return [contact, ...prev];
    });

    if (currentUser?.id) {
      syncDeletedContactIdsInFirestore(currentUser.id, updated).catch(() => {});
    }
    setDeletedContactToast(null);
  };

  const handleRestoreAllContacts = async () => {
    setDeletedContactIds([]);
    localStorage.removeItem('naul_deleted_contact_ids');
    if (currentUser?.id) {
      syncDeletedContactIdsInFirestore(currentUser.id, []).catch(() => {});
    }
    const all = Array.from(allContactsPool.values()).filter((u: User) => u.id !== currentUser.id && u.phone !== currentUser.phone);
    setContactsList(all);
    setDeletedContactToast(null);
  };

  const handleContactClick = (contactUser: User) => {
    const existing = conversations.find(c => 
      c.type === 'direct' && c.participants.some(p => p.id === contactUser.id)
    );
    if (existing) {
      onSelectConversation(existing.id);
    } else {
      onNewChat();
    }
  };

  // Deduplicate conversations strictly by ID to guarantee unique React keys across renders
  const uniqueConversations = React.useMemo(() => {
    const map = new Map<string, Conversation>();
    for (const conv of conversations) {
      if (conv && conv.id && !map.has(conv.id)) {
        map.set(conv.id, conv);
      }
    }
    return Array.from(map.values());
  }, [conversations]);

  const filteredConversations = uniqueConversations.filter(conv => {
    // Search query filtering
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = conv.name.toLowerCase().includes(q);
      const matchMsg = conv.lastMessage?.content.toLowerCase().includes(q) ||
        (conv.lastMessage?.caption && conv.lastMessage.caption.toLowerCase().includes(q)) ||
        (conv.lastMessage?.fileMetadata?.fileName && conv.lastMessage.fileMetadata.fileName.toLowerCase().includes(q));
      const matchCat = conv.category?.toLowerCase().includes(q);
      const matchParticipants = conv.participants?.some(p =>
        p.name.toLowerCase().includes(q) ||
        (p.phone && p.phone.toLowerCase().includes(q)) ||
        (p.email && p.email.toLowerCase().includes(q))
      );
      if (!matchName && !matchMsg && !matchCat && !matchParticipants) return false;
    }

    // Main Tab Filter matching mockup
    if (activeTab === 'groups' && conv.type !== 'group' && conv.type !== 'community') return false;
    if (activeTab === 'channels' && conv.type !== 'channel' && conv.type !== 'community') return false;
    if (activeTab === 'chats' && (conv.type === 'channel')) return false;

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

        {/* Right action icons: Points badge, Plan badge, Search & Menu */}
        <div className="flex items-center gap-1 text-slate-300">
          {onOpenBusinessAndPlans && (
            <button
              onClick={() => onOpenBusinessAndPlans('points')}
              className="px-2 py-1 rounded-xl text-[10px] font-extrabold flex items-center gap-1 border border-amber-500/40 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 transition cursor-pointer"
              title="Puntos Naul Chat: Acumula 300 puntos para 15 días gratis de Premium"
            >
              <Trophy className="w-3 h-3 text-amber-400" />
              <span>{currentUser.points || 0}/300 pts</span>
            </button>
          )}

          {onOpenBusinessAndPlans && (
            <button
              onClick={() => onOpenBusinessAndPlans('plans')}
              className={`px-2 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 border transition cursor-pointer ${
                currentUser.plan === 'business'
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25'
                  : currentUser.plan === 'premium'
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/25'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700/80 hover:bg-slate-700/80'
              }`}
              title="Ver Planes, Negocios e IA (C$)"
            >
              {currentUser.plan === 'business' ? (
                <>
                  <Store className="w-3 h-3 text-emerald-400" />
                  <span>Negocio</span>
                </>
              ) : currentUser.plan === 'premium' ? (
                <>
                  <Star className="w-3 h-3 text-amber-400" />
                  <span>Premium</span>
                </>
              ) : (
                <>
                  <Store className="w-3 h-3 text-emerald-400" />
                  <span className="hidden sm:inline">Planes</span>
                  <span className="text-emerald-400 font-extrabold">C$</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={() => {
              setIsSearchOpen(true);
              searchInputRef.current?.focus();
            }}
            className={`p-2 rounded-xl transition cursor-pointer ${
              searchQuery ? 'bg-sky-500/20 text-sky-400' : 'hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
            title="Buscar en Naul Chat"
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
              <div className="absolute right-0 mt-2 w-56 py-1.5 bg-[#0d1728] border border-slate-700/80 rounded-2xl shadow-2xl z-50 text-xs text-slate-200 divide-y divide-slate-800">
                <div className="px-3 py-2 text-[11px] text-slate-400 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>E2EE Activo 🇳🇮</span>
                  </div>
                  <span className="text-[10px] text-slate-500">v2.5</span>
                </div>
                <div className="py-1">
                  {onOpenBusinessAndPlans && (
                    <>
                      <button
                        onClick={() => { setShowMenuDropdown(false); onOpenBusinessAndPlans('deposit'); }}
                        className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center justify-between text-emerald-300 font-semibold group"
                      >
                        <div className="flex items-center gap-2.5">
                          <CreditCard className="w-4 h-4 text-emerald-400" />
                          <span>💳 Depósito Banpro / LAFISE</span>
                        </div>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          En Vivo
                        </span>
                      </button>

                      <button
                        onClick={() => { setShowMenuDropdown(false); onOpenBusinessAndPlans('points'); }}
                        className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center justify-between text-amber-300 font-semibold group"
                      >
                        <div className="flex items-center gap-2.5">
                          <Trophy className="w-4 h-4 text-amber-400" />
                          <span>⭐ Puntos ({currentUser.points || 0}/300)</span>
                        </div>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          15d Gratis
                        </span>
                      </button>

                      <button
                        onClick={() => { setShowMenuDropdown(false); onOpenBusinessAndPlans('plans'); }}
                        className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center justify-between text-sky-400 font-semibold group"
                      >
                        <div className="flex items-center gap-2.5">
                          <Store className="w-4 h-4 text-sky-400" />
                          <span>Planes, Negocios & IA</span>
                        </div>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                          C$
                        </span>
                      </button>
                    </>
                  )}
                  {onOpenBackupRestore && (
                    <button
                      onClick={() => { setShowMenuDropdown(false); onOpenBackupRestore('export'); }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center justify-between text-cyan-400 font-semibold group"
                    >
                      <div className="flex items-center gap-2.5">
                        <Shield className="w-4 h-4 text-cyan-400" />
                        <span>Respaldo & Google Drive</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        Nube
                      </span>
                    </button>
                  )}
                  {onOpenStatusStories && (
                    <button
                      onClick={() => { setShowMenuDropdown(false); onOpenStatusStories(); }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center gap-2.5 text-sky-400 font-medium"
                    >
                      <Sparkles className="w-4 h-4 text-sky-400" />
                      <span>Estados / Historias (24h)</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowMenuDropdown(false);
                      if (onOpenEditProfilePhoto) onOpenEditProfilePhoto();
                      else if (onOpenProfile) onOpenProfile();
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center justify-between text-slate-200 group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Camera className="w-4 h-4 text-sky-400" />
                      <span>Editar Foto de Perfil</span>
                    </div>
                    <span className="text-[10px] text-sky-300 bg-sky-500/10 px-1.5 py-0.5 rounded">
                      Personalizar
                    </span>
                  </button>
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

                  {onLogout && (
                    <button
                      onClick={() => { setShowMenuDropdown(false); onLogout(); }}
                      className="w-full text-left px-3 py-2 hover:bg-rose-500/20 text-rose-400 flex items-center gap-2.5 font-medium border-t border-slate-800/80 mt-1"
                    >
                      <LogOut className="w-4 h-4 text-rose-400" />
                      <span>Cerrar sesión</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs matching Mockup: Chats | Grupos | Contactos | Canales | Llamadas */}
      <div className="flex items-center justify-around bg-[#091322] border-b border-slate-800/80 text-[11px] sm:text-xs font-semibold text-slate-400">
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
          onClick={() => setActiveTab('contacts')}
          className={`flex-1 py-3 text-center relative transition cursor-pointer ${
            activeTab === 'contacts'
              ? 'text-sky-400 font-bold'
              : 'hover:text-slate-200'
          }`}
        >
          <span>Contactos</span>
          {activeTab === 'contacts' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-400 shadow-sm shadow-sky-400" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('channels')}
          className={`flex-1 py-3 text-center relative transition cursor-pointer ${
            activeTab === 'channels'
              ? 'text-sky-400 font-bold'
              : 'hover:text-slate-200'
          }`}
        >
          <span>Canales</span>
          {activeTab === 'channels' && (
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

      {/* Dedicated Search Bar Component */}
      <div className="p-2.5 bg-[#08101e] border-b border-slate-800/80">
        <div className="relative flex items-center">
          <Search className={`w-4 h-4 absolute left-3 transition-colors ${
            searchQuery ? 'text-sky-400' : 'text-slate-500'
          }`} />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setSearchQuery('');
              }
            }}
            placeholder={
              activeTab === 'contacts'
                ? 'Buscar contactos por nombre o celular (+505)...'
                : activeTab === 'groups'
                ? 'Buscar grupos...'
                : activeTab === 'channels'
                ? 'Buscar canales...'
                : 'Buscar conversaciones o mensajes...'
            }
            className="w-full bg-[#0d192d] border border-slate-700/70 rounded-xl pl-9 pr-20 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 transition shadow-inner"
          />
          {searchQuery && (
            <div className="absolute right-2.5 flex items-center gap-1.5">
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-sky-300 font-semibold border border-slate-700">
                {activeTab === 'contacts' ? filteredContacts.length : filteredConversations.length}
              </span>
              <button
                onClick={() => {
                  setSearchQuery('');
                  searchInputRef.current?.focus();
                }}
                className="text-slate-400 hover:text-white p-0.5 rounded hover:bg-slate-800 transition cursor-pointer"
                title="Limpiar búsqueda (Esc)"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
        {searchQuery.trim() && (
          <div className="flex items-center justify-between mt-1.5 px-1 text-[11px] text-slate-400">
            <span className="truncate">
              Filtrando {activeTab === 'contacts' ? 'contactos' : 'chats'}: <strong className="text-sky-400 font-medium">"{searchQuery}"</strong>
            </span>
            <button
              onClick={() => setSearchQuery('')}
              className="text-sky-400 hover:text-sky-300 text-[11px] hover:underline cursor-pointer shrink-0 ml-2"
            >
              Restablecer
            </button>
          </div>
        )}
      </div>

      {/* Conversation / Calls / Contacts List */}
      <div id="conversations-list" className="flex-1 overflow-y-auto divide-y divide-slate-800/40 px-1 py-1 relative">
        {activeTab === 'contacts' ? (
          <div className="p-2 space-y-3">
            {/* Quick Add Contact Banner */}
            <div 
              onClick={onNewChat}
              className="p-3 rounded-2xl bg-gradient-to-r from-sky-950/60 via-blue-950/40 to-slate-900 border border-sky-500/30 flex items-center justify-between gap-2 cursor-pointer hover:border-sky-400/60 transition group shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-600 to-blue-500 text-white flex items-center justify-center shadow-lg shadow-sky-500/30 shrink-0 group-hover:scale-105 transition">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                    <span>Agregar Contacto Real</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-normal">Nicaragua</span>
                  </h4>
                  <p className="text-[11px] text-sky-300 truncate">
                    Registra número celular (+505) o importa libreta
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold shrink-0 shadow-sm">
                + Nuevo
              </span>
            </div>

            {/* Deleted Contacts Section Banner if any */}
            {deletedContactsList.length > 0 && (
              <div 
                onClick={() => setShowDeletedContactsModal(true)}
                className="p-3 rounded-2xl bg-gradient-to-r from-amber-950/40 via-orange-950/30 to-slate-900 border border-amber-500/30 flex items-center justify-between gap-2 cursor-pointer hover:border-amber-400/60 transition group shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-amber-200 flex items-center gap-1.5">
                      <span>Contactos Eliminados</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                        {deletedContactsList.length}
                      </span>
                    </h4>
                    <p className="text-[11px] text-amber-400/80">
                      Toca para ver o volver a agregarlos a tu lista
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 group-hover:bg-amber-500 text-amber-200 group-hover:text-white text-xs font-semibold shrink-0 transition flex items-center gap-1">
                  <RotateCcw className="w-3 h-3" />
                  <span>Restaurar</span>
                </span>
              </div>
            )}

            {/* Deleted Contact Toast with Undo */}
            {deletedContactToast && (
              <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs flex items-center justify-between text-slate-200 animate-fadeIn">
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 font-medium">"{deletedContactToast.name}"</span>
                  <span className="text-slate-400">fue eliminado</span>
                </div>
                <button
                  onClick={() => handleRestoreContact(deletedContactToast.contact)}
                  className="text-xs text-sky-400 hover:text-sky-300 font-semibold cursor-pointer underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Deshacer</span>
                </button>
              </div>
            )}

            {/* Services Header */}
            <div className="px-1 pt-1 flex items-center justify-between text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
              <span>Directorio Oficial y Emergencias 🇳🇮</span>
              <span className="text-sky-400 lowercase font-normal">Verificados</span>
            </div>

            {/* Emergency & Official Services */}
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { name: 'Cruz Blanca 🚑', phone: '+505 2265 1280', code: '128', bg: 'from-red-950/40 to-rose-900/30 border-rose-800/40 text-rose-300' },
                { name: 'Bomberos 🚒', phone: '+505 2228 1150', code: '115', bg: 'from-amber-950/40 to-orange-900/30 border-amber-800/40 text-amber-300' },
                { name: 'Policía Nac. 🚓', phone: '+505 2277 1180', code: '118', bg: 'from-blue-950/40 to-sky-900/30 border-sky-800/40 text-sky-300' },
                { name: 'ENACAL 💧', phone: '+505 2266 7777', code: '127', bg: 'from-cyan-950/40 to-blue-900/30 border-cyan-800/40 text-cyan-300' },
              ].map(serv => (
                <div
                  key={serv.code}
                  onClick={() => {
                    const matchUser = contactsList.find(u => u.name.includes(serv.name.split(' ')[0]));
                    if (matchUser) handleContactClick(matchUser);
                    else onNewChat();
                  }}
                  className={`p-2 rounded-xl bg-gradient-to-br ${serv.bg} border flex items-center justify-between cursor-pointer hover:scale-[1.02] transition`}
                >
                  <div className="truncate">
                    <p className="text-xs font-bold text-white truncate">{serv.name}</p>
                    <p className="text-[10px] font-mono opacity-80">{serv.phone}</p>
                  </div>
                  <span className="w-6 h-6 rounded-full bg-black/40 flex items-center justify-center text-[10px] font-bold shrink-0">
                    {serv.code}
                  </span>
                </div>
              ))}
            </div>

            {/* Contacts list header */}
            <div className="px-1 pt-2 flex items-center justify-between text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
              <span>Contactos Registrados ({filteredContacts.length})</span>
              <span className="text-emerald-400 lowercase font-normal flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>En línea</span>
              </span>
            </div>

            {/* Real Contacts List */}
            <div className="space-y-1">
              {filteredContacts.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  No se encontraron contactos con ese término de búsqueda.
                </div>
              ) : (
                filteredContacts.map((contactUser) => (
                  <div
                    key={contactUser.id}
                    className="p-2.5 rounded-2xl hover:bg-slate-800/60 transition flex items-center justify-between gap-2 text-slate-200 group border border-transparent hover:border-slate-700/60"
                  >
                    <div 
                      onClick={() => handleContactClick(contactUser)}
                      className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                    >
                      <div className="relative shrink-0">
                        <img
                          src={contactUser.avatar}
                          alt={contactUser.name}
                          className="w-11 h-11 rounded-full object-cover border border-slate-700"
                        />
                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <h4 className="text-xs sm:text-sm font-semibold text-white truncate group-hover:text-sky-400 transition">
                            {highlightSidebarText(contactUser.name, searchQuery)}
                          </h4>
                          {contactUser.isVerified && (
                            <ShieldCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5 font-mono">
                          <span className="text-sky-400">{contactUser.phone || contactUser.email}</span>
                          {contactUser.location && (
                            <>
                              <span>•</span>
                              <span className="text-slate-400 font-sans truncate">{contactUser.location.replace(', Nicaragua', '')}</span>
                            </>
                          )}
                        </div>

                        {contactUser.bio && (
                          <p className="text-[10px] text-slate-500 truncate mt-0.5 font-sans">
                            {contactUser.bio}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Quick Contact Actions: Message, Voice Call, Video Call */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleContactClick(contactUser)}
                        className="p-2 text-slate-400 hover:text-white hover:bg-sky-500/20 rounded-xl transition cursor-pointer"
                        title="Enviar mensaje"
                      >
                        <MessageSquare className="w-4 h-4 text-sky-400" />
                      </button>
                      <button
                        onClick={() => {
                          handleContactClick(contactUser);
                          if (onOpenVoiceCall) onOpenVoiceCall(false);
                        }}
                        className="p-2 text-slate-400 hover:text-white hover:bg-emerald-500/20 rounded-xl transition cursor-pointer"
                        title="Llamada de voz"
                      >
                        <Phone className="w-4 h-4 text-emerald-400" />
                      </button>
                      <button
                        onClick={() => {
                          handleContactClick(contactUser);
                          if (onOpenVoiceCall) onOpenVoiceCall(true);
                        }}
                        className="p-2 text-slate-400 hover:text-white hover:bg-blue-500/20 rounded-xl transition cursor-pointer"
                        title="Videollamada HD"
                      >
                        <Video className="w-4 h-4 text-blue-400" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setContactToDelete(contactUser);
                          setShowConfirmDeleteContact(true);
                        }}
                        className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 rounded-xl transition cursor-pointer"
                        title="Eliminar contacto"
                      >
                        <UserMinus className="w-4 h-4 text-rose-400" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : activeTab === 'calls' ? (
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
              {uniqueConversations.map((conv, idx) => {
                const isVideoRecent = idx % 2 === 0;
                return (
                  <div
                    key={`call-${conv.id}-${idx}`}
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
          <div className="py-12 px-4 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/80 mx-auto flex items-center justify-center text-slate-400 shadow-md">
              <Search className="w-6 h-6 text-slate-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-slate-200">
                {searchQuery.trim() ? 'Sin resultados de búsqueda' : 'No hay conversaciones'}
              </p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                {searchQuery.trim()
                  ? `No se encontraron chats o mensajes que coincidan con "${searchQuery}".`
                  : 'Inicia un nuevo chat con tus contactos seguros.'}
              </p>
            </div>
            {searchQuery.trim() && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  searchInputRef.current?.focus();
                }}
                className="px-3 py-1.5 rounded-xl bg-sky-500/20 text-sky-400 hover:bg-sky-500/30 text-xs font-medium transition cursor-pointer"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          filteredConversations.map((conv, idx) => {
            const isSelected = conv.id === activeConversationId;
            return (
              <div
                key={`conv-${conv.id}-${idx}`}
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

                  {/* Floating Unread Count Badge on Avatar */}
                  {conv.unreadCount > 0 && (
                    <span 
                      className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white text-[10px] font-extrabold flex items-center justify-center ring-2 ring-slate-900 shadow-md shadow-sky-500/50 animate-bounce-subtle z-10"
                      title={`${conv.unreadCount} mensajes sin leer`}
                    >
                      {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                    </span>
                  )}
                </div>

                {/* Conversation Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 truncate">
                      <h4 className={`text-xs sm:text-sm font-semibold truncate ${isSelected ? 'text-white' : 'text-slate-100'}`}>
                        {highlightSidebarText(conv.name, searchQuery)}
                      </h4>
                      {conv.isPinned && <Pin className="w-3 h-3 text-amber-400 rotate-45 shrink-0" />}
                    </div>
                    <span className="text-[10px] sm:text-xs text-slate-400 shrink-0 ml-1">
                      {formatTime(conv.lastMessage?.timestamp)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-1">
                    <div className="text-xs text-slate-400 truncate max-w-[180px]">
                      {getMessagePreview(conv)}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-1">
                      {conv.unreadCount > 0 && (
                        <span 
                          className="px-2 py-0.5 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white text-[10px] font-bold shadow-md shadow-sky-500/30 animate-pulse"
                          title={`${conv.unreadCount} mensajes no leídos`}
                        >
                          {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                        </span>
                      )}
                      {conv.lastMessage?.senderId === currentUser.id && (
                        <MessageStatusCheck
                          status={conv.lastMessage.status}
                          size="xs"
                          className="shrink-0"
                        />
                      )}
                      {onDeleteConversation && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConversationToDelete(conv);
                            setShowConfirmDeleteConv(true);
                          }}
                          className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/20 transition opacity-60 hover:opacity-100 cursor-pointer shrink-0"
                          title="Eliminar conversación"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
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
          onClick={() => setActiveTab('contacts')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition cursor-pointer ${
            activeTab === 'contacts' ? 'text-sky-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px]">Contactos</span>
        </button>

        <button
          onClick={() => {
            if (onOpenStatusStories) onOpenStatusStories();
          }}
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-slate-400 hover:text-sky-400 transition cursor-pointer"
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px]">Estados</span>
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
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-slate-400 hover:text-sky-400 transition cursor-pointer group"
          title="Ver perfil (Toca la cámara para cambiar foto)"
        >
          <div className="relative">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-5 h-5 rounded-full object-cover border border-slate-600 group-hover:border-sky-400 transition"
            />
            <span
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenEditProfilePhoto) onOpenEditProfilePhoto();
                else if (onOpenProfile) onOpenProfile();
              }}
              className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-sky-500 hover:bg-sky-400 text-white flex items-center justify-center text-[7px] border border-slate-900 cursor-pointer shadow"
              title="Cambiar foto de perfil"
            >
              📷
            </span>
          </div>
          <span className="text-[10px]">Perfil</span>
        </button>
      </div>

      {/* Deleted Contacts Management & Restoration Modal */}
      <DeletedContactsModal
        isOpen={showDeletedContactsModal}
        onClose={() => setShowDeletedContactsModal(false)}
        deletedContacts={deletedContactsList}
        onRestoreContact={handleRestoreContact}
        onRestoreAllContacts={handleRestoreAllContacts}
      />

      {/* Confirm Delete Contact Modal */}
      <ConfirmDeleteModal
        isOpen={showConfirmDeleteContact}
        onClose={() => {
          setShowConfirmDeleteContact(false);
          setContactToDelete(null);
        }}
        onConfirm={handleConfirmDeleteContact}
        title="¿Eliminar número y contacto por completo?"
        description={`¿Estás seguro de que deseas eliminar permanentemente a "${contactToDelete?.name}" (${contactToDelete?.phone || 'sin número'}) de tus contactos guardados y de la base de datos?`}
        confirmButtonText="Eliminar por Completo"
        isDangerous={true}
      />

      {/* Confirm Delete Conversation Modal */}
      <ConfirmDeleteModal
        isOpen={showConfirmDeleteConv}
        onClose={() => {
          setShowConfirmDeleteConv(false);
          setConversationToDelete(null);
        }}
        onConfirm={() => {
          if (conversationToDelete && onDeleteConversation) {
            onDeleteConversation(conversationToDelete.id);
          }
          setConversationToDelete(null);
        }}
        title="¿Eliminar conversación?"
        description={`¿Estás seguro de que deseas eliminar la conversación con "${conversationToDelete?.name}"? Esta acción borrará el historial de mensajes de este chat.`}
        confirmButtonText="Eliminar Conversación"
        isDangerous={true}
      />
    </aside>
  );
};
