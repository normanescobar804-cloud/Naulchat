/**
 * Naul Chat Nicaragua - World-Class Secure Messaging Application
 * Cifrado Extremo a Extremo (E2EE), Biometría, GPS en Vivo, Audio HD & Hub Social
 * Implementación fiel de las 8 pantallas oficiales del mockup de Naual Chat Nicaragua
 */
import React, { useState, useEffect } from 'react';
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
import { sounds, requestPushPermission, sendPushNotification } from './utils/security';
import { Smartphone, Monitor, Sparkles } from 'lucide-react';

export type MockupScreen = 'splash' | 'login' | 'register' | 'forgot' | 'inbox' | 'chat' | 'profile' | 'settings';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('naul_user_profile');
    return saved ? JSON.parse(saved) : CURRENT_USER;
  });

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem('naul_conversations');
    return saved ? JSON.parse(saved) : INITIAL_CONVERSATIONS;
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
  // Current active screen in phone mode
  const [activeScreen, setActiveScreen] = useState<MockupScreen>('chat');

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
  const [viewingMedia, setViewingMedia] = useState<{ url: string; caption?: string } | null>(null);

  // Mobile view inside responsive/desktop mode
  const [mobileView, setMobileView] = useState<'sidebar' | 'chat'>('chat');

  // Dynamic typing status per conversation
  const [typingConversations, setTypingConversations] = useState<Record<string, boolean>>({});

  // Push notification state
  const [activeNotification, setActiveNotification] = useState<{
    message: Message;
    conversationName: string;
  } | null>(null);
  const [pushPermission, setPushPermission] = useState<NotificationPermission | 'unsupported'>('default');

  // Persistence effects
  useEffect(() => {
    localStorage.setItem('naul_user_profile', JSON.stringify(currentUser));
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

  // Check push notification permission & URL call link on mount
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

  const activeConversation = conversations.find(c => c.id === activeConversationId) || conversations[0];
  const activeMessages = messages[activeConversationId] || [];

  const handleSendMessage = (msgPayload: Partial<Message>) => {
    const messageId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newMessage: Message = {
      id: messageId,
      conversationId: activeConversationId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
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

    // 1. Agregar mensaje inicial con estado 'sent'
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

    // 4. Contacto empieza a escribir y luego responde
    triggerSimulatedReply(activeConversationId, newMessage);
  };

  const triggerSimulatedReply = (convId: string, userMsg: Message) => {
    const conv = conversations.find(c => c.id === convId);
    if (!conv || conv.type === 'channel') return;

    const otherParticipants = conv.participants.filter(p => p.id !== currentUser.id);
    const replier = otherParticipants[0] || INITIAL_USERS['user-yuri'];

    // Mostrar 'escribiendo...' a los 1750ms cuando el contacto lee el mensaje
    setTimeout(() => {
      setTypingConversations(prev => ({ ...prev, [convId]: true }));
    }, 1750);

    // Enviar respuesta a los 3500ms y quitar 'escribiendo...'
    setTimeout(() => {
      setTypingConversations(prev => ({ ...prev, [convId]: false }));

      let replyText = '¡Recibido y verificado con cifrado de extremo a extremo! 🇳🇮';
      if (userMsg.type === 'audio') {
        replyText = 'Escuché tu nota de voz con perfecta nitidez. El audio en Opus suena excelente.';
      } else if (userMsg.type === 'location') {
        replyText = 'Veo tu ubicación GPS en tiempo real en el mapa. ¡Nos encontramos en breve!';
      } else if (userMsg.type === 'image') {
        replyText = '¡Qué calidad de imagen tan impresionante! Se aprecian todos los detalles en 4K.';
      } else if (userMsg.type === 'file') {
        replyText = 'Descargando el documento cifrado de forma segura.';
      } else if (userMsg.content.includes('YouTube') || userMsg.content.includes('TikTok')) {
        replyText = '¡Buenísimo el contenido compartido desde el Social Hub! Lo estoy reproduciendo ahora mismo.';
      } else if (convId === 'conv-yuri') {
        const yuriReplies = [
          'De acuerdo bro, sigamos avanzando 🚀',
          '¡Quedó súper nítido el diseño de Naul Chat!',
          'Copiado bro, cualquier cosa me avisas 👍',
          '¡Viva Nicaragua siempre conectada! 🇳🇮'
        ];
        replyText = yuriReplies[Math.floor(Math.random() * yuriReplies.length)];
      }

      const replyMsg: Message = {
        id: `msg-reply-${Date.now()}`,
        conversationId: convId,
        senderId: replier.id,
        senderName: replier.name,
        senderAvatar: replier.avatar,
        type: 'text',
        content: replyText,
        timestamp: Date.now(),
        status: 'read',
        isEncrypted: true,
      };

      setMessages(prev => ({
        ...prev,
        [convId]: [...(prev[convId] || []), replyMsg]
      }));

      setConversations(prev => prev.map(c => {
        if (c.id === convId) {
          return {
            ...c,
            lastMessage: replyMsg,
            unreadCount: c.id === activeConversationId ? 0 : c.unreadCount + 1,
          };
        }
        return c;
      }));

      sounds.playReceiveChime();
      sendPushNotification(`Nuevo mensaje de ${replier.name}`, replyText);

      setActiveNotification({
        message: replyMsg,
        conversationName: conv.name,
      });

      setTimeout(() => {
        setActiveNotification(null);
      }, 5000);
    }, 3500);
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
    setConversations(prev => [newConv, ...prev]);
    setActiveConversationId(newConv.id);
    setMobileView('chat');
    setActiveScreen('chat');
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    setMobileView('chat');
    setActiveScreen('chat');
    setConversations(prev => prev.map(c => c.id === id ? { ...c, unreadCount: 0 } : c));
  };

  // Render the current screen inside the phone simulator
  const renderPhoneScreen = () => {
    switch (activeScreen) {
      case 'splash':
        return (
          <SplashScreen 
            onContinue={() => setActiveScreen('inbox')}
            onGoLogin={() => setActiveScreen('login')}
          />
        );
      case 'login':
        return (
          <LoginScreen
            onLoginSuccess={() => setActiveScreen('inbox')}
            onGoToRegister={() => setActiveScreen('register')}
            onGoToForgotPassword={() => setActiveScreen('forgot')}
            onBackToSplash={() => setActiveScreen('splash')}
          />
        );
      case 'register':
        return (
          <RegisterScreen
            onRegisterSuccess={(name, email) => {
              setCurrentUser(prev => ({ ...prev, name, email }));
              setActiveScreen('inbox');
            }}
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
            currentUser={currentUser}
            onOpenSettings={() => setActiveScreen('settings')}
            onOpenPrivacy={() => setShowSecurityModal(true)}
            onOpenBiometrics={() => setShowBiometricsModal(true)}
          />
        );
      case 'settings':
        return (
          <SettingsScreen
            onBack={() => setActiveScreen('profile')}
            onLogout={() => setActiveScreen('login')}
            onOpenEditProfile={() => setActiveScreen('profile')}
            onOpenChangePassword={() => setShowRecoveryModal(true)}
            onOpenPrivacy={() => setShowSecurityModal(true)}
            onOpenDeployGuide={() => setShowGitHubDirectModal(true)}
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
              currentUser={currentUser}
              onOpenBiometrics={() => setShowBiometricsModal(true)}
              onOpenRecovery={() => setShowRecoveryModal(true)}
              onOpenSocialHub={() => setShowSocialHubModal(true)}
              onOpenProfile={() => setActiveScreen('profile')}
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
            />
          </div>
        );
      case 'chat':
      default:
        return activeConversation ? (
          <ChatArea
            conversation={activeConversation}
            messages={activeMessages}
            currentUser={currentUser}
            onSendMessage={handleSendMessage}
            onOpenSecurityModal={() => setShowSecurityModal(true)}
            onOpenVoiceCall={(isVideo) => {
              setCallIsVideo(!!isVideo);
              setShowVoiceCallModal(true);
            }}
            onOpenLocationModal={() => setShowLocationModal(true)}
            onOpenSocialHub={() => setShowSocialHubModal(true)}
            onViewImage={(url, caption) => setViewingMedia({ url, caption })}
            onBackToSidebar={() => setActiveScreen('inbox')}
            lang={lang}
            isContactTyping={!!typingConversations[activeConversationId]}
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

  return (
    <div id="naul-chat-root" className={`w-screen h-screen flex flex-col overflow-hidden font-sans ${themeClass}`}>
      {/* Top Universal Control & Screen Switcher Bar */}
      <header className="h-14 px-3 sm:px-6 bg-[#081120] border-b border-slate-800/80 flex items-center justify-between z-30 shrink-0 select-none">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <CnLogo size="sm" showText showSubtitle />
        </div>

        {/* 8 Official Mockup Screens Quick Jumper */}
        <div className="hidden xl:flex items-center gap-1 bg-[#0d182b] p-1 rounded-2xl border border-slate-700/60">
          <span className="text-[10px] text-slate-400 font-semibold px-2 uppercase tracking-wider">
            Mockup:
          </span>
          {[
            { id: 'splash', label: '1. Portada' },
            { id: 'login', label: '2. Login' },
            { id: 'register', label: '3. Registro' },
            { id: 'forgot', label: '4. Recuperar' },
            { id: 'inbox', label: '5. Bandeja' },
            { id: 'chat', label: '6. Chat Yuri' },
            { id: 'profile', label: '7. Perfil' },
            { id: 'settings', label: '8. Ajustes' },
          ].map((screen) => {
            const isActive = viewMode === 'phone' && activeScreen === screen.id;
            return (
              <button
                key={screen.id}
                onClick={() => {
                  setViewMode('phone');
                  setActiveScreen(screen.id as MockupScreen);
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition cursor-pointer ${
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

          {/* Slogan */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-medium">
            <span className="font-script text-base leading-none text-sky-300">Nicaragua siempre conectada</span>
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
              { id: 'splash', label: 'Portada' },
              { id: 'login', label: 'Login' },
              { id: 'register', label: 'Registro' },
              { id: 'forgot', label: 'Recuperar' },
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
          {/* Sidebar Pane (Always on desktop, conditional on mobile) */}
          <div className={`h-full ${mobileView === 'sidebar' ? 'w-full flex' : 'hidden md:flex'}`}>
            <Sidebar
              conversations={conversations}
              activeConversationId={activeConversationId}
              onSelectConversation={handleSelectConversation}
              currentUser={currentUser}
              onOpenBiometrics={() => setShowBiometricsModal(true)}
              onOpenRecovery={() => setShowRecoveryModal(true)}
              onOpenSocialHub={() => setShowSocialHubModal(true)}
              onOpenProfile={() => {
                setViewMode('phone');
                setActiveScreen('profile');
              }}
              onOpenSettings={() => {
                setViewMode('phone');
                setActiveScreen('settings');
              }}
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
            />
          </div>

          {/* Chat Area Pane (Always on desktop, conditional on mobile) */}
          <div className={`flex-1 h-full ${mobileView === 'chat' ? 'flex' : 'hidden md:flex'}`}>
            {activeConversation ? (
              <ChatArea
                conversation={activeConversation}
                messages={activeMessages}
                currentUser={currentUser}
                onSendMessage={handleSendMessage}
                onOpenSecurityModal={() => setShowSecurityModal(true)}
                onOpenVoiceCall={(isVideo) => {
                  setCallIsVideo(!!isVideo);
                  setShowVoiceCallModal(true);
                }}
                onOpenLocationModal={() => setShowLocationModal(true)}
                onOpenSocialHub={() => setShowSocialHubModal(true)}
                onViewImage={(url, caption) => setViewingMedia({ url, caption })}
                onBackToSidebar={() => setMobileView('sidebar')}
                lang={lang}
                isContactTyping={!!typingConversations[activeConversationId]}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
                Selecciona una conversación para comenzar
              </div>
            )}
          </div>
        </div>
      )}

      {/* Interactive Modals */}
      <BiometricVerificationModal
        isOpen={showBiometricsModal}
        onClose={() => setShowBiometricsModal(false)}
        currentUser={currentUser}
        onUpdateUser={(updated) => setCurrentUser(prev => ({ ...prev, ...updated }))}
        lang={lang}
      />

      <PasswordRecoveryModal
        isOpen={showRecoveryModal}
        onClose={() => setShowRecoveryModal(false)}
        userPhone={currentUser.phone}
        userEmail={currentUser.email}
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
          currentUser={currentUser}
          lang={lang}
        />
      )}

      {activeConversation && (
        <VoiceCallModal
          isOpen={showVoiceCallModal}
          onClose={() => setShowVoiceCallModal(false)}
          conversation={activeConversation}
          currentUser={currentUser}
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
        currentUser={currentUser}
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

      {/* PWA Offline Network Banner */}
      <OfflineIndicator />
    </div>
  );
}
