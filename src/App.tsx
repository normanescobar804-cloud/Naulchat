/**
 * Naul Chat Nicaragua - World-Class Secure Messaging Application
 * Cifrado Extremo a Extremo (E2EE), Biometría, GPS en Vivo, Audio HD & Hub Social
 * Implementación fiel de las 8 pantallas oficiales del mockup de Naual Chat Nicaragua
 */
import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { BiometricVerificationModal } from './components/BiometricVerificationModal';
import { PasswordRecoveryModal } from './components/PasswordRecoveryModal';
import { SocialHubModal } from './components/SocialHubModal';
import { E2EESecurityModal } from './components/E2EESecurityModal';
import { VoiceCallModal } from './components/VoiceCallModal';
import { LocationShareModal } from './components/LocationShareModal';
import { MediaViewerModal } from './components/MediaViewerModal';
import { PushNotificationToast } from './components/PushNotificationToast';
import { NewChatModal } from './components/NewChatModal';
import { GitHubDirectModal } from './components/GitHubDirectModal';
import { ReportUserModal } from './components/ReportUserModal';
import { BlockedContactsModal } from './components/BlockedContactsModal';
import { StatusStoriesModal } from './components/StatusStoriesModal';
import { BusinessAndPlansModal } from './components/BusinessAndPlansModal';
import { BackupRestoreModal } from './components/BackupRestoreModal';
import { EditProfilePhotoModal } from './components/EditProfilePhotoModal';
import { DecryptedBackupPayload } from './services/backupCryptoService';

// Mockup screen components
import { SplashScreen } from './components/screens/SplashScreen';
import { LoginScreen } from './components/screens/LoginScreen';
import { RegisterScreen } from './components/screens/RegisterScreen';
import { ForgotPasswordScreen } from './components/screens/ForgotPasswordScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { CnLogo } from './components/CnLogo';
import { PWAInstallButton, OfflineIndicator } from './components/PWAInstallButton';

import { 
  CURRENT_USER, 
  INITIAL_CONVERSATIONS, 
  INITIAL_MESSAGES,
  INITIAL_USERS 
} from './data/initialData';
import { Conversation, Message, User, LanguageCode, AppTheme, LocationMetadata } from './types';
import { 
  sounds, 
  requestPushPermission, 
  sendPushNotification,
  decryptMessagePayload,
  decryptWithAES256 
} from './utils/security';
import { Smartphone, Monitor, Sparkles, Activity, Wifi, WifiOff, Github } from 'lucide-react';
import { 
  saveUserToFirestore, 
  sendMessageToFirestore, 
  subscribeToMessages, 
  getRegisteredUsers,
  editMessageInFirestore,
  deleteMessageInFirestore,
  deleteConversationFromFirestore,
  updateMessageReactionsInFirestore,
  toggleBlockUser
} from './services/firestoreChat';
import {
  apiGetMe,
  apiGetConversations,
  apiGetMessages,
  apiSendMessage,
  apiEditMessage,
  apiDeleteMessage,
  apiDeleteConversation,
  apiUpdateMessageReactions,
  apiMarkConversationAsRead,
  apiUpdateUserAvatar,
  apiUpdateUserProfile,
  apiLogin,
  getStoredToken,
  setStoredToken,
  getWebSocketUrl
} from './services/api';

export type MockupScreen = 'splash' | 'login' | 'register' | 'forgot' | 'inbox' | 'chat' | 'profile' | 'settings';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('naul_user_profile');
      if (saved && saved !== 'null' && saved !== 'undefined') {
        const u = JSON.parse(saved);
        if (u && (!u.storageQuota || u.storageQuota.totalMb < 8192)) {
          u.storageQuota = {
            ...(u.storageQuota || {}),
            totalMb: 8192,
            usedMb: u.storageQuota?.usedMb ?? 245.5,
            photosMb: u.storageQuota?.photosMb ?? 120.2,
            videosMb: u.storageQuota?.videosMb ?? 85.0,
            audiosMb: u.storageQuota?.audiosMb ?? 28.3,
            documentsMb: u.storageQuota?.documentsMb ?? 12.0
          };
        }
        return u;
      }
    } catch (e) {
      console.error('Error loading saved user', e);
    }
    return CURRENT_USER;
  });

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem('naul_conversations');
      const list: Conversation[] = saved ? JSON.parse(saved) : INITIAL_CONVERSATIONS;
      const seen = new Set<string>();
      return list.filter(c => {
        if (!c || !c.id || seen.has(c.id)) return false;
        seen.add(c.id);
        return true;
      });
    } catch {
      return INITIAL_CONVERSATIONS;
    }
  });

  const [messages, setMessages] = useState<Record<string, Message[]>>(() => {
    const saved = localStorage.getItem('naul_messages');
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });

  // Default active conversation is Yuri (mockup screen #6)
  const [activeConversationId, setActiveConversationId] = useState<string>('conv-yuri');
  const [lang, setLang] = useState<LanguageCode>(() => {
    return (localStorage.getItem('naul_lang') as LanguageCode) || 'es';
  });
  const [theme, setTheme] = useState<AppTheme>(() => {
    return (localStorage.getItem('naul_theme') as AppTheme) || 'nica-midnight';
  });

  // Presentation mode: 'phone' (matches the exact mobile mockups) or 'desktop' (full screen split messenger)
  const [viewMode, setViewMode] = useState<'phone' | 'desktop'>('desktop');
  // Default screen is 'inbox' so the app is immediately open and ready to use
  const [activeScreen, setActiveScreen] = useState<MockupScreen>(() => {
    try {
      const savedScreen = localStorage.getItem('naul_active_screen');
      if (savedScreen && ['inbox', 'profile', 'settings', 'chat'].includes(savedScreen)) {
        return savedScreen as MockupScreen;
      }
    } catch {
      // ignore
    }
    return 'inbox';
  });

  // Auto-login to backend Node.js on mount if token is missing
  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      apiLogin('normanescobar804@gmail.com', 'admin123').catch(err => {
        console.warn('Auto-login background status:', err);
      });
    }
  }, []);

  useEffect(() => {
    if (activeScreen && !['splash', 'login', 'register', 'forgot'].includes(activeScreen)) {
      localStorage.setItem('naul_active_screen', activeScreen);
    }
  }, [activeScreen]);

  // Modals state
  const [showBiometricsModal, setShowBiometricsModal] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [showSocialHubModal, setShowSocialHubModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showVoiceCallModal, setShowVoiceCallModal] = useState(false);
  const [callIsVideo, setCallIsVideo] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showGitHubDirectModal, setShowGitHubDirectModal] = useState(false);
  const [showStatusStoriesModal, setShowStatusStoriesModal] = useState(false);
  const [showEditProfilePhotoModal, setShowEditProfilePhotoModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showBlockedContactsModal, setShowBlockedContactsModal] = useState(false);
  const [showBusinessModal, setShowBusinessModal] = useState(false);
  const [businessModalTab, setBusinessModalTab] = useState<'plans' | 'deposit' | 'points' | 'business' | 'ai' | 'ads' | 'verification' | 'storage'>('plans');
  const [showBackupRestoreModal, setShowBackupRestoreModal] = useState(false);
  const [backupModalTab, setBackupModalTab] = useState<'export' | 'restore' | 'drive'>('export');
  const [reportedTargetUser, setReportedTargetUser] = useState<{ id: string; name: string }>({ id: '', name: '' });
  const [viewingMedia, setViewingMedia] = useState<{ url: string; caption?: string } | null>(null);

  // Mobile view inside responsive/desktop mode
  const [mobileView, setMobileView] = useState<'sidebar' | 'chat'>('chat');

  // WebSocket Real-time Status and Latency (ms)
  const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [wsLatency, setWsLatency] = useState<number | null>(null);

  // Dynamic typing status per conversation
  const [typingConversations, setTypingConversations] = useState<Record<string, boolean>>({});

  // Message pagination state
  const [hasMoreMessages, setHasMoreMessages] = useState<Record<string, boolean>>({});
  const [isLoadingOlderMessages, setIsLoadingOlderMessages] = useState(false);

  // Push notification state
  const [activeNotification, setActiveNotification] = useState<{
    message: Message;
    conversationName: string;
  } | null>(null);
  const [pushPermission, setPushPermission] = useState<NotificationPermission | 'unsupported'>('default');

  // Persistence effects
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('naul_user_profile', JSON.stringify(currentUser));
      localStorage.setItem('naul_logged_in', 'true');
    } else {
      localStorage.removeItem('naul_user_profile');
      localStorage.removeItem('naul_logged_in');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('naul_conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem('naul_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('naul_lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('naul_theme', theme);
  }, [theme]);

  // Check push notification permission, URL call link, and sync Firestore messages in real time
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPushPermission(Notification.permission);
    } else {
      setPushPermission('unsupported');
    }

    // Direct WebRTC Call Link Handler (?call=conv-id&video=true)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const callParam = params.get('call');
      const isVideoParam = params.get('video') !== 'false';
      if (callParam) {
        const found = conversations.find(c => c.id === callParam || c.name.toLowerCase().includes(callParam.toLowerCase()));
        if (found) {
          setActiveConversationId(found.id);
        }
        setCallIsVideo(isVideoParam);
        setShowVoiceCallModal(true);
      }
    }
  }, []);

  // Suscribirse a mensajes en tiempo real desde Firestore para la conversación activa
  useEffect(() => {
    if (!activeConversationId) return;

    const unsubscribe = subscribeToMessages(activeConversationId, (cloudMsgs) => {
      if (cloudMsgs.length > 0) {
        setMessages(prev => {
          const localList = prev[activeConversationId] || [];
          // Combinar evitando duplicados por ID
          const map = new Map<string, Message>();
          localList.forEach(m => map.set(m.id, m));
          cloudMsgs.forEach(m => map.set(m.id, m));
          return {
            ...prev,
            [activeConversationId]: Array.from(map.values()).sort((a, b) => a.timestamp - b.timestamp)
          };
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [activeConversationId]);

  // Verificar sesión con el Backend Node.js + MongoDB si existe token
  useEffect(() => {
    const token = getStoredToken();
    if (token && !currentUser) {
      apiGetMe().then(user => {
        if (user) {
          setCurrentUser(user);
          setActiveScreen('inbox');
        }
      }).catch(err => {
        console.warn('Backend session verify error:', err);
      });
    }
  }, []);

  // Cargar conversaciones reales del Backend Node.js + MongoDB al iniciar sesión
  useEffect(() => {
    if (!currentUser) return;
    apiGetConversations().then(cloudConvs => {
      if (cloudConvs && cloudConvs.length > 0) {
        setConversations(prev => {
          const map = new Map<string, Conversation>();
          // Preserve local conversations first or update with cloud versions
          for (const c of [...cloudConvs, ...prev]) {
            if (c && c.id && !map.has(c.id)) {
              map.set(c.id, c);
            }
          }
          return Array.from(map.values());
        });
      }
    }).catch(err => {
      console.warn('Backend conversations load error:', err);
    });
  }, [currentUser]);

  // Cargar primeros 30 mensajes de la conversación activa desde el Backend Node.js + MongoDB con descifrado AES-256
  useEffect(() => {
    if (!currentUser || !activeConversationId) return;
    const currentConv = conversations.find(c => c.id === activeConversationId);
    const participantIds = currentConv?.participantIds || currentConv?.participants?.map(p => p.id) || [currentUser.id];
    apiGetMessages(activeConversationId, participantIds, { limit: 30 }).then(res => {
      if (res && res.messages && res.messages.length > 0) {
        setMessages(prev => ({
          ...prev,
          [activeConversationId]: res.messages
        }));
        setHasMoreMessages(prev => ({
          ...prev,
          [activeConversationId]: !!res.hasMore
        }));
      }
    }).catch(err => {
      console.warn('Backend messages load error:', err);
    });
  }, [activeConversationId, currentUser, conversations]);

  // Paginación: Cargar lote anterior de mensajes antiguos al hacer scroll hacia arriba
  const handleLoadOlderMessages = async (convId?: string) => {
    const targetConvId = convId || activeConversationId;
    if (!targetConvId || !currentUser || isLoadingOlderMessages) return;

    const currentList = messages[targetConvId] || [];
    if (currentList.length === 0) return;

    const oldestTimestamp = currentList[0]?.timestamp;
    const currentConv = conversations.find(c => c.id === targetConvId);
    const participantIds = currentConv?.participantIds || currentConv?.participants?.map(p => p.id) || [currentUser.id];

    setIsLoadingOlderMessages(true);
    try {
      const res = await apiGetMessages(targetConvId, participantIds, {
        limit: 30,
        before: oldestTimestamp
      });

      if (res.messages && res.messages.length > 0) {
        setMessages(prev => {
          const current = prev[targetConvId] || [];
          const currentIds = new Set(current.map(m => m.id));
          const newOlder = res.messages.filter(m => !currentIds.has(m.id));
          return {
            ...prev,
            [targetConvId]: [...newOlder, ...current]
          };
        });
      }

      setHasMoreMessages(prev => ({
        ...prev,
        [targetConvId]: !!res.hasMore
      }));
    } catch (err) {
      console.error('Error al cargar mensajes anteriores:', err);
    } finally {
      setIsLoadingOlderMessages(false);
    }
  };

  const wsRef = useRef<WebSocket | null>(null);

  // Conexión WebSocket para actualizaciones en vivo (Node.js WebSocket Server)
  useEffect(() => {
    if (!currentUser) return;
    const wsUrl = getWebSocketUrl();
    let ws: WebSocket | null = null;
    let pingInterval: any = null;
    try {
      ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setWsStatus('connected');
        ws?.send(JSON.stringify({
          type: 'USER_AUTH',
          userId: currentUser.id,
          name: currentUser.name
        }));
        // Measure initial ping immediately
        ws?.send(JSON.stringify({
          type: 'PING',
          clientTime: Date.now()
        }));
      };

      ws.onclose = () => {
        setWsStatus('disconnected');
        setWsLatency(null);
      };

      ws.onerror = () => {
        setWsStatus('disconnected');
      };

      // Periodic ping-pong to measure latency in real time (every 4 seconds)
      pingInterval = setInterval(() => {
        if (ws?.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'PING',
            clientTime: Date.now()
          }));
        }
      }, 4000);

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // Latency pong measurement
          if (data.type === 'PONG' && typeof data.clientTime === 'number') {
            const rtt = Math.max(1, Date.now() - data.clientTime);
            setWsLatency(rtt);
            setWsStatus('connected');
            return;
          }

          // 1. Mensaje nuevo en tiempo real (descifrado seguro con AES-256 en el cliente)
          if (data.type === 'NEW_MESSAGE' && data.message && data.conversationId) {
            const rawMsg = data.message;
            decryptMessagePayload(rawMsg, data.conversationId).then(newMsg => {
              setMessages(prev => {
                const currentList = prev[data.conversationId] || [];
                if (currentList.some(m => m.id === newMsg.id)) return prev;
                return {
                  ...prev,
                  [data.conversationId]: [...currentList, newMsg]
                };
              });

              // Actualizar último mensaje de la conversación
              setConversations(prev => prev.map(c => {
                if (c.id === data.conversationId) {
                  return {
                    ...c,
                    lastMessage: newMsg,
                    unreadCount: c.id === activeConversationId ? 0 : (c.unreadCount || 0) + 1
                  };
                }
                return c;
              }));

              // Si es la conversación activa y el remitente es otro usuario, marcar como leído inmediatamente (✓✓ azul)
              if (data.conversationId === activeConversationId && newMsg.senderId !== currentUser.id) {
                apiMarkConversationAsRead(data.conversationId).catch(() => {});
                ws?.send(JSON.stringify({
                  type: 'MARK_READ',
                  conversationId: data.conversationId,
                  userId: currentUser.id
                }));
              }
            });
          }

          // Mensaje editado en tiempo real (descifrado AES-256)
          if (data.type === 'EDIT_MESSAGE' && data.conversationId && data.messageId) {
            decryptWithAES256(data.newContent || '', data.conversationId).then(decRes => {
              const plainContent = decRes.plaintext;
              setMessages(prev => {
                const list = prev[data.conversationId] || [];
                return {
                  ...prev,
                  [data.conversationId]: list.map(m =>
                    m.id === data.messageId ? { ...m, content: plainContent, isEdited: true } : m
                  )
                };
              });
              setConversations(prev => prev.map(c => {
                if (c.id === data.conversationId && c.lastMessage?.id === data.messageId) {
                  return {
                    ...c,
                    lastMessage: { ...c.lastMessage, content: plainContent, isEdited: true }
                  };
                }
                return c;
              }));
            });
          }

          // Mensaje eliminado en tiempo real
          if (data.type === 'DELETE_MESSAGE' && data.conversationId && data.messageId) {
            setMessages(prev => {
              const list = prev[data.conversationId] || [];
              return {
                ...prev,
                [data.conversationId]: list.map(m =>
                  m.id === data.messageId ? { ...m, content: 'Este mensaje fue eliminado', isDeleted: true } : m
                )
              };
            });
          }

          // Reacciones a mensajes en tiempo real vía WebSocket
          if (data.type === 'MESSAGE_REACTION' && data.conversationId && data.messageId) {
            setMessages(prev => {
              const list = prev[data.conversationId];
              if (!list) return prev;
              return {
                ...prev,
                [data.conversationId]: list.map(m =>
                  m.id === data.messageId ? { ...m, reactions: data.reactions } : m
                )
              };
            });
          }

          // 2. Notificación de escritura en vivo ("Escribiendo...")
          if (data.type === 'USER_TYPING' && data.conversationId) {
            if (data.userId !== currentUser.id) {
              setTypingConversations(prev => ({
                ...prev,
                [data.conversationId]: !!data.isTyping
              }));
            }
          }

          // 3. Confirmación de lectura en vivo (Doble check azul ✓✓)
          if (data.type === 'MESSAGES_READ' && data.conversationId) {
            setMessages(prev => {
              const currentList = prev[data.conversationId];
              if (!currentList) return prev;
              return {
                ...prev,
                [data.conversationId]: currentList.map(m =>
                  m.senderId === currentUser.id ? { ...m, status: 'read' as const } : m
                )
              };
            });
            setConversations(prev => prev.map(c => {
              if (c.id === data.conversationId && c.lastMessage?.senderId === currentUser.id) {
                return {
                  ...c,
                  lastMessage: { ...c.lastMessage, status: 'read' as const }
                };
              }
              return c;
            }));
          }

          // 4. Presencia de contactos ("En línea" / "Desconectado")
          if (data.type === 'ONLINE_USERS_LIST' && Array.isArray(data.userIds)) {
            const onlineSet = new Set<string>(data.userIds);
            setConversations(prev => prev.map(c => {
              const other = c.participants?.find(p => p.id !== currentUser.id);
              if (other && onlineSet.has(other.id)) {
                return {
                  ...c,
                  participants: c.participants.map(p => p.id === other.id ? { ...p, status: 'online' as const } : p)
                };
              }
              return c;
            }));
          }

          if (data.type === 'USER_PRESENCE' && data.userId && data.status) {
            setConversations(prev => prev.map(c => {
              const hasParticipant = c.participants?.some(p => p.id === data.userId);
              if (hasParticipant) {
                return {
                  ...c,
                  participants: c.participants.map(p => p.id === data.userId ? { ...p, status: data.status } : p)
                };
              }
              return c;
            }));
          }
        } catch (e) {
          console.error('Error handling WS event:', e);
        }
      };
    } catch (err) {
      console.warn('WebSocket connection not supported in this context:', err);
    }
    return () => {
      clearInterval(pingInterval);
      if (ws) ws.close();
      wsRef.current = null;
    };
  }, [currentUser, activeConversationId]);

  const handleTyping = (isTyping: boolean) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && currentUser) {
      wsRef.current.send(JSON.stringify({
        type: 'TYPING',
        conversationId: activeConversationId,
        userId: currentUser.id,
        userName: currentUser.name,
        isTyping
      }));
    }
  };

  const handleRequestPush = async () => {
    const granted = await requestPushPermission();
    setPushPermission(granted ? 'granted' : 'denied');
    if (granted) {
      sounds.playReceiveChime();
      sendPushNotification('Naul Chat Nicaragua 🇳🇮', '¡Notificaciones push activadas correctamente!');
    }
  };

  const handleToggleTheme = () => {
    if (theme === 'dark') setTheme('nica-midnight');
    else if (theme === 'nica-midnight') setTheme('light');
    else setTheme('dark');
  };

  const effectiveCurrentUser: User = currentUser || CURRENT_USER;

  const handleLogout = () => {
    setStoredToken(null);
    localStorage.removeItem('naul_user_profile');
    localStorage.removeItem('naul_logged_in');
    setCurrentUser(null);
    setActiveScreen('splash');
    setMobileView('sidebar');
  };

  const handleLoginSuccess = (user?: User, remember: boolean = true) => {
    const loggedUser = user || CURRENT_USER;
    setCurrentUser(loggedUser);
    if (remember) {
      localStorage.setItem('naul_logged_in', 'true');
      localStorage.setItem('naul_user_profile', JSON.stringify(loggedUser));
    }
    setActiveScreen('inbox');
    setMobileView('sidebar');
  };

  const handleRegisterSuccess = (registeredUser: User) => {
    setCurrentUser(registeredUser);
    localStorage.setItem('naul_logged_in', 'true');
    localStorage.setItem('naul_user_profile', JSON.stringify(registeredUser));
    setActiveScreen('inbox');
    setMobileView('sidebar');
  };

  const handleUpdateCurrentUser = (updated: Partial<User>) => {
    setCurrentUser(prev => {
      const next = prev ? { ...prev, ...updated } : { ...CURRENT_USER, ...updated };
      localStorage.setItem('naul_user_profile', JSON.stringify(next));
      return next;
    });

    // Synchronize to Node.js backend
    if (updated.avatar) {
      apiUpdateUserAvatar(updated.avatar).catch(err => {
        console.warn('Backend avatar sync warning:', err);
      });
    } else {
      apiUpdateUserProfile(updated).catch(err => {
        console.warn('Backend profile sync warning:', err);
      });
    }
  };

  const handleOpenBusinessAndPlans = (tab: 'plans' | 'deposit' | 'points' | 'business' | 'ai' | 'ads' | 'verification' | 'storage' = 'plans') => {
    setBusinessModalTab(tab);
    setShowBusinessModal(true);
  };

  const handleOpenBackupRestore = (tab: 'export' | 'restore' | 'drive' = 'export') => {
    setBackupModalTab(tab);
    setShowBackupRestoreModal(true);
  };

  const handleRestoreBackup = async (payload: DecryptedBackupPayload, mode: 'merge' | 'replace') => {
    if (mode === 'replace') {
      setConversations(payload.conversations);
      setMessages(payload.messages);
      localStorage.setItem('naul_conversations', JSON.stringify(payload.conversations));
      localStorage.setItem('naul_messages', JSON.stringify(payload.messages));
      if (payload.conversations.length > 0) {
        setActiveConversationId(payload.conversations[0].id);
      }
    } else {
      // Merge conversations
      setConversations((prev) => {
        const existingIds = new Set(prev.map((c) => c.id));
        const merged = [...prev];
        for (const c of payload.conversations) {
          if (!existingIds.has(c.id)) {
            merged.push(c);
            existingIds.add(c.id);
          }
        }
        localStorage.setItem('naul_conversations', JSON.stringify(merged));
        return merged;
      });

      // Merge messages
      setMessages((prev) => {
        const merged = { ...prev };
        for (const [convId, msgs] of Object.entries(payload.messages)) {
          const existingList = merged[convId] || [];
          const existingMsgIds = new Set(existingList.map((m) => m.id));
          const combined = [...existingList];
          for (const m of msgs) {
            if (!existingMsgIds.has(m.id)) {
              combined.push(m);
              existingMsgIds.add(m.id);
            }
          }
          combined.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
          merged[convId] = combined;
        }
        localStorage.setItem('naul_messages', JSON.stringify(merged));
        return merged;
      });
    }

    // Restore contacts if available
    if (payload.contacts && Array.isArray(payload.contacts) && payload.contacts.length > 0) {
      try {
        const stored = localStorage.getItem('naul_saved_contacts');
        const currentContacts = stored ? JSON.parse(stored) : [];
        const contactIds = new Set(currentContacts.map((c: any) => c.id));
        const mergedContacts = [...currentContacts];
        for (const c of payload.contacts) {
          if (!contactIds.has(c.id)) {
            mergedContacts.push(c);
            contactIds.add(c.id);
          }
        }
        localStorage.setItem('naul_saved_contacts', JSON.stringify(mergedContacts));
      } catch (e) {
        console.warn('Failed restoring contacts to localStorage', e);
      }
    }

    // Sync to Firestore cloud database so new device receives active conversation
    if (currentUser) {
      for (const conv of payload.conversations) {
        const msgsForConv = payload.messages[conv.id] || [];
        if (msgsForConv.length > 0) {
          const lastMsg = msgsForConv[msgsForConv.length - 1];
          sendMessageToFirestore(conv.id, lastMsg, conv.participants || [currentUser]).catch((err) => {
            console.warn('Firestore backup sync warning:', err);
          });
        }
      }
    }
  };

  const activeConversation = conversations.find(c => c.id === activeConversationId) || conversations[0];
  const activeMessages = messages[activeConversationId] || [];

  const handleSendMessage = (msgPayload: Partial<Message>) => {
    const messageId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newMessage: Message = {
      id: messageId,
      conversationId: activeConversationId,
      senderId: effectiveCurrentUser.id,
      senderName: effectiveCurrentUser.name,
      senderAvatar: effectiveCurrentUser.avatar,
      type: msgPayload.type || 'text',
      content: msgPayload.content || '',
      timestamp: Date.now(),
      status: 'sent', // Estado 1: Enviado (1 check gris)
      isEncrypted: true,
      audioMetadata: msgPayload.audioMetadata,
      fileMetadata: msgPayload.fileMetadata,
      locationMetadata: msgPayload.locationMetadata,
      mediaUrl: msgPayload.mediaUrl,
      caption: msgPayload.caption,
      replyTo: msgPayload.replyTo,
    };

    // 1. Agregar mensaje inicial localmente
    setMessages(prev => ({
      ...prev,
      [activeConversationId]: [...(prev[activeConversationId] || []), newMessage]
    }));

    // Actualizar último mensaje de la conversación
    setConversations(prev => prev.map(c => {
      if (c.id === activeConversationId) {
        return {
          ...c,
          lastMessage: newMessage,
        };
      }
      return c;
    }));

    // Sincronizar en la nube Firestore
    if (activeConversation) {
      sendMessageToFirestore(activeConversationId, newMessage, activeConversation.participants || [effectiveCurrentUser]);
    }

    // Sincronizar en el Backend Node.js + MongoDB con cifrado real AES-256
    const participantIds = activeConversation?.participants?.map(p => p.id) || [effectiveCurrentUser.id];
    apiSendMessage(activeConversationId, newMessage, participantIds).catch(err => {
      console.warn('Backend apiSendMessage error:', err);
    });

    // 2. Transición a 'delivered' (Doble check gris) tras 750ms
    setTimeout(() => {
      setMessages(prev => {
        const currentList = prev[activeConversationId] || [];
        return {
          ...prev,
          [activeConversationId]: currentList.map(m => 
            m.id === messageId ? { ...m, status: 'delivered' } : m
          )
        };
      });

      setConversations(prev => prev.map(c => {
        if (c.id === activeConversationId && c.lastMessage?.id === messageId) {
          return {
            ...c,
            lastMessage: { ...c.lastMessage, status: 'delivered' }
          };
        }
        return c;
      }));
    }, 750);

    // 3. Transición a 'read' (Doble check azul brillante) tras 1750ms
    setTimeout(() => {
      setMessages(prev => {
        const currentList = prev[activeConversationId] || [];
        return {
          ...prev,
          [activeConversationId]: currentList.map(m => 
            m.id === messageId ? { ...m, status: 'read' } : m
          )
        };
      });

      setConversations(prev => prev.map(c => {
        if (c.id === activeConversationId && c.lastMessage?.id === messageId) {
          return {
            ...c,
            lastMessage: { ...c.lastMessage, status: 'read' }
          };
        }
        return c;
      }));
    }, 1750);
  };

  const handleEditMessage = async (messageId: string, newContent: string) => {
    // 1. Update in local state
    setMessages(prev => {
      const convMsgs = prev[activeConversationId] || [];
      return {
        ...prev,
        [activeConversationId]: convMsgs.map(m => 
          m.id === messageId ? { ...m, content: newContent, isEdited: true } : m
        )
      };
    });

    // Update lastMessage in conversations list if needed
    setConversations(prev => prev.map(c => {
      if (c.id === activeConversationId && c.lastMessage?.id === messageId) {
        return {
          ...c,
          lastMessage: { ...c.lastMessage, content: newContent, isEdited: true }
        };
      }
      return c;
    }));

    // 2. Persist to Firestore & Backend with AES-256
    const participantIds = activeConversation?.participants?.map(p => p.id) || [effectiveCurrentUser.id];
    await editMessageInFirestore(activeConversationId, messageId, newContent, participantIds);
    apiEditMessage(activeConversationId, messageId, newContent, participantIds).catch(() => {});
  };

  const handleDeleteMessage = async (messageId: string) => {
    // 1. Update in local state
    setMessages(prev => {
      const convMsgs = prev[activeConversationId] || [];
      return {
        ...prev,
        [activeConversationId]: convMsgs.map(m => 
          m.id === messageId ? { ...m, content: 'Este mensaje fue eliminado', isDeleted: true } : m
        )
      };
    });

    // Update lastMessage in conversations list if needed
    setConversations(prev => prev.map(c => {
      if (c.id === activeConversationId && c.lastMessage?.id === messageId) {
        return {
          ...c,
          lastMessage: { ...c.lastMessage, content: 'Este mensaje fue eliminado', isDeleted: true }
        };
      }
      return c;
    }));

    // 2. Persist to Firestore & Node.js backend if available
    await deleteMessageInFirestore(activeConversationId, messageId);
    apiDeleteMessage(activeConversationId, messageId).catch(() => {});
  };

  const handleReactMessage = async (messageId: string, emoji: string) => {
    sounds.playReactionSound();
    let updatedReactions: Record<string, string[]> = {};

    // 1. Optimistic update local messages state and localStorage
    setMessages(prev => {
      const convMsgs = prev[activeConversationId] || [];
      const targetMsg = convMsgs.find(m => m.id === messageId);
      if (!targetMsg) return prev;

      const currentReactions: Record<string, string[]> = { ...(targetMsg.reactions || {}) };
      const myIdentifier = effectiveCurrentUser.name || effectiveCurrentUser.id;

      if (!currentReactions[emoji]) {
        currentReactions[emoji] = [myIdentifier];
      } else {
        const users = Array.isArray(currentReactions[emoji]) ? currentReactions[emoji] : [];
        if (users.includes(myIdentifier)) {
          const filtered = users.filter(n => n !== myIdentifier);
          if (filtered.length === 0) {
            delete currentReactions[emoji];
          } else {
            currentReactions[emoji] = filtered;
          }
        } else {
          currentReactions[emoji] = [...users, myIdentifier];
        }
      }
      updatedReactions = currentReactions;

      const nextList = convMsgs.map(m =>
        m.id === messageId ? { ...m, reactions: currentReactions } : m
      );
      return {
        ...prev,
        [activeConversationId]: nextList
      };
    });

    // 2. Broadcast in real time via WebSocket to all connected peers
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'MESSAGE_REACTION',
        conversationId: activeConversationId,
        messageId,
        reactions: updatedReactions,
        userId: effectiveCurrentUser.id,
        userName: effectiveCurrentUser.name,
        emoji
      }));
    }

    // 3. Persist in real time to Firestore
    updateMessageReactionsInFirestore(activeConversationId, messageId, updatedReactions).catch(err => {
      console.warn('Firestore reaction sync error:', err);
    });
  };

  const handleOpenReportModal = (reportedUser: { id: string; name: string }) => {
    setReportedTargetUser(reportedUser);
    setShowReportModal(true);
  };

  const handleShareLocation = (loc: LocationMetadata) => {
    sounds.playSendChime();
    handleSendMessage({
      type: 'location',
      content: loc.isLive ? 'Ubicación en tiempo real transmitiéndose' : 'Ubicación fija compartida',
      locationMetadata: loc,
    });
  };

  const handleShareToChatFromSocial = (content: string, mediaUrl?: string) => {
    sounds.playSendChime();
    handleSendMessage({
      type: 'text',
      content,
      mediaUrl,
    });
  };

  const handleCreateNewConversation = (newConv: Conversation) => {
    setConversations(prev => {
      const exists = prev.find(c => c.id === newConv.id);
      if (exists) {
        // Move existing to top with updated properties, avoiding duplicates
        return [{ ...exists, ...newConv }, ...prev.filter(c => c.id !== newConv.id)];
      }
      return [newConv, ...prev];
    });
    setActiveConversationId(newConv.id);
    setMobileView('chat');
    setActiveScreen('chat');
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    setMobileView('chat');
    setActiveScreen('chat');
    setConversations(prev => prev.map(c => c.id === id ? { ...c, unreadCount: 0 } : c));
    apiMarkConversationAsRead(id).catch(() => {});
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && currentUser) {
      wsRef.current.send(JSON.stringify({
        type: 'MARK_READ',
        conversationId: id,
        userId: currentUser.id
      }));
    }
  };

  const handleDeleteConversation = async (convId: string) => {
    // 1. Remove from conversations list
    setConversations(prev => {
      const remaining = prev.filter(c => c.id !== convId);
      localStorage.setItem('naul_conversations', JSON.stringify(remaining));

      if (activeConversationId === convId) {
        if (remaining.length > 0) {
          setActiveConversationId(remaining[0].id);
        } else {
          setActiveConversationId('');
          setMobileView('sidebar');
          setActiveScreen('inbox');
        }
      }
      return remaining;
    });

    // 2. Remove cached messages for this conversation
    setMessages(prev => {
      const updated = { ...prev };
      delete updated[convId];
      localStorage.setItem('naul_messages', JSON.stringify(updated));
      return updated;
    });

    // 3. Delete in Firestore and backend API
    deleteConversationFromFirestore(convId).catch(() => {});
    apiDeleteConversation(convId).catch(() => {});

    // Play subtle audio cue
    sounds.playDeleteMessage();
  };

  // Render the current screen inside the phone simulator
  const renderPhoneScreen = () => {
    switch (activeScreen) {
      case 'splash':
        return (
          <SplashScreen 
            onContinue={() => setActiveScreen(currentUser ? 'inbox' : 'login')}
            onGoLogin={() => setActiveScreen('login')}
            onGoRegister={() => setActiveScreen('register')}
          />
        );
      case 'login':
        return (
          <LoginScreen
            onLoginSuccess={(user, remember) => handleLoginSuccess(user, remember)}
            onGoToRegister={() => setActiveScreen('register')}
            onGoToForgotPassword={() => setActiveScreen('forgot')}
            onBackToSplash={() => setActiveScreen('splash')}
          />
        );
      case 'register':
        return (
          <RegisterScreen
            onRegisterSuccess={(registeredUser) => handleRegisterSuccess(registeredUser)}
            onBackToLogin={() => setActiveScreen('login')}
          />
        );
      case 'forgot':
        return (
          <ForgotPasswordScreen
            onBackToLogin={() => setActiveScreen('login')}
          />
        );
      case 'profile':
        return (
          <ProfileScreen
            currentUser={effectiveCurrentUser}
            onOpenSettings={() => setActiveScreen('settings')}
            onOpenPrivacy={() => setShowSecurityModal(true)}
            onOpenBiometrics={() => setShowBiometricsModal(true)}
            onOpenBusinessAndPlans={handleOpenBusinessAndPlans}
            onBack={() => setActiveScreen('inbox')}
            onLogout={handleLogout}
            onUpdateUser={handleUpdateCurrentUser}
            onOpenEditProfilePhoto={() => setShowEditProfilePhotoModal(true)}
          />
        );
      case 'settings':
        return (
          <SettingsScreen
            onBack={() => setActiveScreen('profile')}
            onLogout={handleLogout}
            onOpenEditProfile={() => setActiveScreen('profile')}
            onOpenEditProfilePhoto={() => setShowEditProfilePhotoModal(true)}
            onOpenChangePassword={() => setShowRecoveryModal(true)}
            onOpenPrivacy={() => setShowSecurityModal(true)}
            onOpenBlockedContacts={() => setShowBlockedContactsModal(true)}
            onOpenDeployGuide={() => setShowGitHubDirectModal(true)}
            onOpenBusinessAndPlans={handleOpenBusinessAndPlans}
            onOpenBackupRestore={handleOpenBackupRestore}
            lang={lang}
            onSelectLanguage={setLang}
            theme={theme}
            onToggleTheme={handleToggleTheme}
          />
        );
      case 'inbox':
        return (
          <div className="w-full h-full flex flex-col">
            <Sidebar
              conversations={conversations}
              activeConversationId={activeConversationId}
              onSelectConversation={handleSelectConversation}
              onDeleteConversation={handleDeleteConversation}
              currentUser={effectiveCurrentUser}
              onOpenBiometrics={() => setShowBiometricsModal(true)}
              onOpenRecovery={() => setShowRecoveryModal(true)}
              onOpenSocialHub={() => setShowSocialHubModal(true)}
              onOpenStatusStories={() => setShowStatusStoriesModal(true)}
              onOpenReportModal={handleOpenReportModal}
              onOpenProfile={() => setActiveScreen('profile')}
              onOpenEditProfilePhoto={() => setShowEditProfilePhotoModal(true)}
              onOpenSettings={() => setActiveScreen('settings')}
              onOpenVoiceCall={(isVideo) => {
                setCallIsVideo(!!isVideo);
                setShowVoiceCallModal(true);
              }}
              lang={lang}
              onSelectLanguage={setLang}
              theme={theme}
              onToggleTheme={handleToggleTheme}
              onNewChat={() => setShowNewChatModal(true)}
              onOpenGitHubExport={() => setShowGitHubDirectModal(true)}
              onOpenBusinessAndPlans={(tab) => handleOpenBusinessAndPlans(tab || 'plans')}
              onOpenBackupRestore={handleOpenBackupRestore}
              onLogout={handleLogout}
            />
          </div>
        );
      case 'chat':
      default:
        return activeConversation ? (
          <ChatArea
            conversation={activeConversation}
            messages={activeMessages}
            currentUser={effectiveCurrentUser}
            hasMoreMessages={!!hasMoreMessages[activeConversationId]}
            isLoadingOlderMessages={isLoadingOlderMessages}
            onLoadOlderMessages={() => handleLoadOlderMessages(activeConversationId)}
            onSendMessage={handleSendMessage}
            onEditMessage={handleEditMessage}
            onDeleteMessage={handleDeleteMessage}
            onDeleteConversation={handleDeleteConversation}
            onReactMessage={handleReactMessage}
            onOpenSecurityModal={() => setShowSecurityModal(true)}
            onOpenVoiceCall={(isVideo) => {
              setCallIsVideo(!!isVideo);
              setShowVoiceCallModal(true);
            }}
            onOpenLocationModal={() => setShowLocationModal(true)}
            onOpenSocialHub={() => setShowSocialHubModal(true)}
            onOpenReportModal={handleOpenReportModal}
            onViewImage={(url, caption) => setViewingMedia({ url, caption })}
            onBackToSidebar={() => setActiveScreen('inbox')}
            lang={lang}
            isContactTyping={!!typingConversations[activeConversationId]}
            onTyping={handleTyping}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
            Selecciona una conversación
          </div>
        );
    }
  };

  // Theme container classes
  const themeClass = theme === 'nica-midnight'
    ? 'bg-[#060c18] text-slate-100'
    : theme === 'dark'
    ? 'bg-slate-950 text-slate-100'
    : 'bg-slate-100 text-slate-900';

  // RESTRICCIÓN DE SEGURIDAD Y ACCESO:
  // Toda la interfaz interna de la app solo se mira hasta que el usuario entra
  // con su teléfono, correo o código de verificación.
  if (!currentUser) {
    return (
      <div id="naul-chat-auth-portal" className={`w-screen h-screen flex flex-col items-center justify-center p-2 sm:p-4 overflow-hidden bg-gradient-to-b from-[#050a14] via-[#081222] to-[#03060d] font-sans ${themeClass}`}>
        {/* Realistic Smartphone Chassis Frame for Authentication */}
        <div className="relative w-full max-w-[420px] h-full max-h-[860px] rounded-[44px] bg-[#0c1524] p-3 shadow-2xl shadow-sky-950/80 border-[5px] border-slate-700/80 flex flex-col overflow-hidden ring-1 ring-white/10">
          <div className="absolute inset-0 rounded-[39px] pointer-events-none border border-white/10" />
          <div className="relative flex-1 w-full h-full rounded-[34px] bg-[#050b14] overflow-hidden flex flex-col shadow-inner">
            {/* Top Dynamic Island */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-4 rounded-full bg-black/90 z-40 flex items-center justify-center gap-2 pointer-events-none shadow-sm">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
              <div className="w-2 h-2 rounded-full bg-sky-950 border border-sky-900" />
            </div>

            {/* Screen Content: Solo pantallas de Acceso/Autenticación */}
            <div className="flex-1 w-full h-full overflow-hidden flex flex-col">
              {activeScreen === 'splash' ? (
                <SplashScreen 
                  onContinue={() => setActiveScreen('login')}
                  onGoLogin={() => setActiveScreen('login')}
                  onGoRegister={() => setActiveScreen('register')}
                />
              ) : activeScreen === 'register' ? (
                <RegisterScreen
                  onRegisterSuccess={(registeredUser) => handleRegisterSuccess(registeredUser)}
                  onBackToLogin={() => setActiveScreen('login')}
                />
              ) : activeScreen === 'forgot' ? (
                <ForgotPasswordScreen
                  onBackToLogin={() => setActiveScreen('login')}
                />
              ) : (
                <LoginScreen
                  onLoginSuccess={(user, remember) => handleLoginSuccess(user, remember)}
                  onGoToRegister={() => setActiveScreen('register')}
                  onGoToForgotPassword={() => setActiveScreen('forgot')}
                  onBackToSplash={() => setActiveScreen('splash')}
                />
              )}
            </div>

            {/* Bottom Indicator */}
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 rounded-full bg-white/30 pointer-events-none z-30" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="naul-chat-root" className={`w-screen h-screen flex flex-col overflow-hidden font-sans ${themeClass}`}>
      {/* Top Universal Control & Screen Switcher Bar */}
      <header className="h-14 px-3 sm:px-6 bg-[#081120] border-b border-slate-800/80 flex items-center justify-between z-30 shrink-0 select-none">
        {/* Brand, Database Status & WebSocket Real-time Latency Indicator */}
        <div className="flex items-center gap-2.5">
          <CnLogo size="sm" showText showSubtitle />
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[11px] text-emerald-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>BD Node.js + Mongo Activo</span>
          </div>

          {/* WebSocket Connection Status & Latency Badge */}
          <div 
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold transition-all ${
              wsStatus === 'connected'
                ? wsLatency !== null && wsLatency < 60
                  ? 'bg-sky-500/10 border-sky-500/30 text-sky-400'
                  : wsLatency !== null && wsLatency < 150
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : wsStatus === 'connecting'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}
            title={
              wsStatus === 'connected'
                ? `Conexión WebSocket E2EE activa con el servidor. Latencia de ida y vuelta: ${wsLatency !== null ? `${wsLatency}ms` : 'calculando...'}`
                : wsStatus === 'connecting'
                ? 'Conectando WebSocket...'
                : 'WebSocket desconectado del servidor'
            }
          >
            {wsStatus === 'connected' ? (
              <>
                <span className={`w-2 h-2 rounded-full ${
                  wsLatency !== null && wsLatency < 60
                    ? 'bg-sky-400 animate-ping'
                    : 'bg-emerald-400 animate-pulse'
                }`} />
                <span className="flex items-center gap-1">
                  <span>WS En Línea</span>
                  {wsLatency !== null && (
                    <span className="font-mono text-[10px] opacity-90 px-1 py-0.2 bg-black/30 rounded">
                      {wsLatency}ms
                    </span>
                  )}
                </span>
              </>
            ) : wsStatus === 'connecting' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>WS Conectando...</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-rose-400" />
                <span>WS Desconectado</span>
              </>
            )}
          </div>
        </div>

        {/* 4 Official Internal Screens Quick Jumper */}
        <div className="hidden xl:flex items-center gap-1 bg-[#0d182b] p-1 rounded-2xl border border-slate-700/60">
          <span className="text-[10px] text-slate-400 font-semibold px-2 uppercase tracking-wider">
            Navegación:
          </span>
          {[
            { id: 'inbox', label: '1. Bandeja' },
            { id: 'chat', label: '2. Chat Yuri' },
            { id: 'profile', label: '3. Perfil' },
            { id: 'settings', label: '4. Ajustes' },
          ].map((screen) => {
            const isActive = activeScreen === screen.id;
            return (
              <button
                key={screen.id}
                onClick={() => {
                  setActiveScreen(screen.id as MockupScreen);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  isActive
                    ? 'bg-[#0077ff] text-white shadow-md shadow-blue-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {screen.label}
              </button>
            );
          })}
        </div>

        {/* View Mode Toggle: Phone Mockup vs Desktop */}
        <div className="flex items-center gap-2">
          {/* PWA Install & GitHub Deployment Quick Action */}
          <PWAInstallButton variant="header" />

          {/* Direct GitHub Push Button */}
          <button
            type="button"
            onClick={() => setShowGitHubDirectModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-500 text-xs font-semibold text-slate-200 hover:text-white transition cursor-pointer shadow-sm group"
            title="Pasar la app a GitHub con Token"
          >
            <Github className="w-3.5 h-3.5 text-sky-400 group-hover:scale-110 transition" />
            <span className="hidden sm:inline">Pasar a GitHub</span>
          </button>

          {/* User profile capsule */}
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <img src={effectiveCurrentUser.avatar} alt={effectiveCurrentUser.name} className="w-5 h-5 rounded-full object-cover" />
            <span className="font-bold text-white max-w-[100px] truncate">{effectiveCurrentUser.name}</span>
          </div>

          <div className="flex items-center bg-[#0d182b] border border-slate-700/60 rounded-xl p-0.5">
            <button
              onClick={() => setViewMode('phone')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                viewMode === 'phone'
                  ? 'bg-[#0077ff] text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Ver en formato teléfono idéntico al mockup"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Móvil Mockup</span>
            </button>
            <button
              onClick={() => setViewMode('desktop')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                viewMode === 'desktop'
                  ? 'bg-[#0077ff] text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Ver en formato pantalla completa"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pantalla Completa</span>
            </button>
          </div>
        </div>
      </header>

      {/* Push Notification Floating Toast */}
      <PushNotificationToast
        notification={activeNotification}
        onDismiss={() => setActiveNotification(null)}
        onSelectChat={handleSelectConversation}
        pushPermissionState={pushPermission}
        onRequestPermission={handleRequestPush}
      />

      {/* Main Content Area */}
      {viewMode === 'phone' ? (
        /* PHONE SIMULATOR VIEW (Exact representation of uploaded design) */
        <div className="flex-1 flex flex-col items-center justify-center p-2 sm:p-6 overflow-hidden bg-gradient-to-b from-[#060c18] via-[#091426] to-[#040810]">
          {/* Phone Quick Screens Selector Bar on Small/Medium screens */}
          <div className="flex xl:hidden items-center gap-1.5 overflow-x-auto max-w-full pb-2 px-2 text-xs">
            {[
              { id: 'inbox', label: 'Bandeja' },
              { id: 'chat', label: 'Chat' },
              { id: 'profile', label: 'Perfil' },
              { id: 'settings', label: 'Ajustes' },
            ].map((screen) => (
              <button
                key={screen.id}
                onClick={() => setActiveScreen(screen.id as MockupScreen)}
                className={`px-3 py-1 rounded-xl font-medium shrink-0 transition cursor-pointer ${
                  activeScreen === screen.id
                    ? 'bg-[#0077ff] text-white shadow-md'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {screen.label}
              </button>
            ))}
          </div>

          {/* Realistic Smartphone Chassis Frame */}
          <div className="relative w-full max-w-[400px] h-full max-h-[820px] rounded-[44px] bg-[#0d1624] p-3 shadow-2xl shadow-sky-950/60 border-[5px] border-slate-700/80 flex flex-col overflow-hidden ring-1 ring-white/10">
            {/* Glossy edge highlight */}
            <div className="absolute inset-0 rounded-[39px] pointer-events-none border border-white/10" />

            {/* Inner Phone Screen */}
            <div className="relative flex-1 w-full h-full rounded-[34px] bg-[#050b14] overflow-hidden flex flex-col shadow-inner">
              {/* Top Dynamic Island / Speaker Notch */}
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-4 rounded-full bg-black/90 z-40 flex items-center justify-center gap-2 pointer-events-none shadow-sm">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
                <div className="w-2 h-2 rounded-full bg-sky-950 border border-sky-900" />
              </div>

              {/* Screen Content */}
              <div className="flex-1 w-full h-full overflow-hidden flex flex-col">
                {renderPhoneScreen()}
              </div>

              {/* Bottom Home Indicator Bar */}
              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 rounded-full bg-white/30 pointer-events-none z-30" />
            </div>
          </div>
        </div>
      ) : (
        /* DESKTOP / FULL WORKSPACE VIEW */
        <div className="flex-1 flex overflow-hidden w-full h-full relative">
          {['splash', 'login', 'register', 'forgot', 'profile', 'settings'].includes(activeScreen) ? (
            <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-[#060c18] via-[#091426] to-[#040810] overflow-y-auto w-full h-full">
              <div className="w-full max-w-md bg-[#0b1526] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden min-h-[580px] flex flex-col">
                {renderPhoneScreen()}
              </div>
            </div>
          ) : (
            <>
              {/* Sidebar Pane (Always on desktop, conditional on mobile) */}
              <div className={`h-full ${mobileView === 'sidebar' ? 'w-full md:w-96 flex' : 'hidden md:flex md:w-96'}`}>
                <Sidebar
                  conversations={conversations}
                  activeConversationId={activeConversationId}
                  onSelectConversation={handleSelectConversation}
                  onDeleteConversation={handleDeleteConversation}
                  currentUser={effectiveCurrentUser}
                  onOpenBiometrics={() => setShowBiometricsModal(true)}
                  onOpenRecovery={() => setShowRecoveryModal(true)}
                  onOpenSocialHub={() => setShowSocialHubModal(true)}
                  onOpenStatusStories={() => setShowStatusStoriesModal(true)}
                  onOpenReportModal={handleOpenReportModal}
                  onOpenProfile={() => setActiveScreen('profile')}
                  onOpenEditProfilePhoto={() => setShowEditProfilePhotoModal(true)}
                  onOpenSettings={() => setActiveScreen('settings')}
                  onOpenVoiceCall={(isVideo) => {
                    setCallIsVideo(!!isVideo);
                    setShowVoiceCallModal(true);
                  }}
                  lang={lang}
                  onSelectLanguage={setLang}
                  theme={theme}
                  onToggleTheme={handleToggleTheme}
                  onNewChat={() => setShowNewChatModal(true)}
                  onOpenGitHubExport={() => setShowGitHubDirectModal(true)}
                  onOpenBusinessAndPlans={(tab) => handleOpenBusinessAndPlans(tab || 'plans')}
                  onOpenBackupRestore={handleOpenBackupRestore}
                  onLogout={handleLogout}
                />
              </div>

              {/* Chat Area Pane (Always on desktop, conditional on mobile) */}
              <div className={`flex-1 h-full ${mobileView === 'chat' ? 'flex' : 'hidden md:flex'}`}>
                {activeConversation ? (
                  <ChatArea
                    conversation={activeConversation}
                    messages={activeMessages}
                    currentUser={effectiveCurrentUser}
                    hasMoreMessages={!!hasMoreMessages[activeConversationId]}
                    isLoadingOlderMessages={isLoadingOlderMessages}
                    onLoadOlderMessages={() => handleLoadOlderMessages(activeConversationId)}
                    onSendMessage={handleSendMessage}
                    onEditMessage={handleEditMessage}
                    onDeleteMessage={handleDeleteMessage}
                    onDeleteConversation={handleDeleteConversation}
                    onReactMessage={handleReactMessage}
                    onOpenSecurityModal={() => setShowSecurityModal(true)}
                    onOpenVoiceCall={(isVideo) => {
                      setCallIsVideo(!!isVideo);
                      setShowVoiceCallModal(true);
                    }}
                    onOpenLocationModal={() => setShowLocationModal(true)}
                    onOpenSocialHub={() => setShowSocialHubModal(true)}
                    onOpenReportModal={handleOpenReportModal}
                    onViewImage={(url, caption) => setViewingMedia({ url, caption })}
                    onBackToSidebar={() => {
                      setMobileView('sidebar');
                      setActiveScreen('inbox');
                    }}
                    lang={lang}
                    isContactTyping={!!typingConversations[activeConversationId]}
                    onTyping={handleTyping}
                  />
                ) : (
                  <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
                    Selecciona una conversación para comenzar
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Interactive Modals */}
      <StatusStoriesModal
        isOpen={showStatusStoriesModal}
        onClose={() => setShowStatusStoriesModal(false)}
        currentUser={effectiveCurrentUser}
        onReplyToStory={(storyUser, text) => {
          sounds.playSendChime();
          const targetConv = conversations.find(c => c.name.toLowerCase().includes(storyUser.name.toLowerCase())) || conversations[0];
          if (targetConv) {
            handleSendMessage({
              type: 'text',
              content: `Respondiendo a tu Estado: "${text}" 🇳🇮`,
            });
          }
        }}
        onOpenDirectChat={(userId) => {
          setShowStatusStoriesModal(false);
          const found = conversations.find(c => c.participants?.some(p => p.id === userId) || c.id === userId);
          if (found) {
            handleSelectConversation(found.id);
          } else {
            setShowNewChatModal(true);
          }
        }}
      />

      <EditProfilePhotoModal
        isOpen={showEditProfilePhotoModal}
        onClose={() => setShowEditProfilePhotoModal(false)}
        currentUser={effectiveCurrentUser}
        onUpdateUser={handleUpdateCurrentUser}
      />

      <BusinessAndPlansModal
        isOpen={showBusinessModal}
        onClose={() => setShowBusinessModal(false)}
        currentUser={effectiveCurrentUser}
        onUpdateUser={handleUpdateCurrentUser}
        onOpenDirectChat={(userId) => {
          setShowBusinessModal(false);
          const found = conversations.find(c => c.participants?.some(p => p.id === userId) || c.id === userId);
          if (found) {
            handleSelectConversation(found.id);
          } else {
            setShowNewChatModal(true);
          }
        }}
        initialTab={businessModalTab}
        onOpenBackupRestore={handleOpenBackupRestore}
      />

      <ReportUserModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        reportedUserId={reportedTargetUser.id}
        reportedUserName={reportedTargetUser.name}
        onBlockUser={async (userId) => {
          if (effectiveCurrentUser?.id) {
            await toggleBlockUser(effectiveCurrentUser.id, userId, true);
          }
        }}
      />

      <BlockedContactsModal
        isOpen={showBlockedContactsModal}
        onClose={() => setShowBlockedContactsModal(false)}
      />

      <BiometricVerificationModal
        isOpen={showBiometricsModal}
        onClose={() => setShowBiometricsModal(false)}
        currentUser={effectiveCurrentUser}
        onUpdateUser={(updated) => setCurrentUser(prev => prev ? ({ ...prev, ...updated }) : ({ ...CURRENT_USER, ...updated }))}
        lang={lang}
      />

      <PasswordRecoveryModal
        isOpen={showRecoveryModal}
        onClose={() => setShowRecoveryModal(false)}
        userPhone={effectiveCurrentUser.phone}
        userEmail={effectiveCurrentUser.email}
        lang={lang}
      />

      <SocialHubModal
        isOpen={showSocialHubModal}
        onClose={() => setShowSocialHubModal(false)}
        onShareToChat={handleShareToChatFromSocial}
        lang={lang}
      />

      {activeConversation && (
        <E2EESecurityModal
          isOpen={showSecurityModal}
          onClose={() => setShowSecurityModal(false)}
          conversation={activeConversation}
          currentUser={effectiveCurrentUser}
          lang={lang}
        />
      )}

      {activeConversation && (
        <VoiceCallModal
          isOpen={showVoiceCallModal}
          onClose={() => setShowVoiceCallModal(false)}
          conversation={activeConversation}
          currentUser={effectiveCurrentUser}
          isVideo={callIsVideo}
          lang={lang}
        />
      )}

      <LocationShareModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onShareLocation={handleShareLocation}
        lang={lang}
      />

      <NewChatModal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        currentUser={effectiveCurrentUser}
        onCreateConversation={handleCreateNewConversation}
      />

      {viewingMedia && (
        <MediaViewerModal
          isOpen={!!viewingMedia}
          imageUrl={viewingMedia.url}
          caption={viewingMedia.caption}
          onClose={() => setViewingMedia(null)}
        />
      )}

      <GitHubDirectModal
        isOpen={showGitHubDirectModal}
        onClose={() => setShowGitHubDirectModal(false)}
      />

      <BackupRestoreModal
        isOpen={showBackupRestoreModal}
        onClose={() => setShowBackupRestoreModal(false)}
        currentUser={effectiveCurrentUser}
        conversations={conversations}
        messages={messages}
        onRestoreBackup={handleRestoreBackup}
        initialTab={backupModalTab}
      />

      {/* PWA Offline Network Banner */}
      <OfflineIndicator />
    </div>
  );
}
