import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Mic, MicOff, Paperclip, Image as ImageIcon, FileText, 
  MapPin, Phone, Video, ShieldCheck, Lock, MoreVertical, 
  Smile, Search, ArrowLeft, Download, ExternalLink, X, 
  Check, CheckCheck, Radio, Sparkles, AlertCircle, Compass
} from 'lucide-react';
import { Conversation, Message, User, LocationMetadata, FileMetadata, AudioMetadata, LanguageCode } from '../types';
import { translations } from '../utils/translations';
import { AudioPlayerBubble } from './AudioPlayerBubble';
import { generateWaveform, sounds } from '../utils/security';
import { MessageStatusCheck } from './MessageStatusCheck';

interface Props {
  conversation: Conversation;
  messages: Message[];
  currentUser: User;
  onSendMessage: (msg: Partial<Message>) => void;
  onOpenSecurityModal: () => void;
  onOpenVoiceCall: (isVideo?: boolean) => void;
  onOpenLocationModal: () => void;
  onOpenSocialHub: () => void;
  onViewImage: (url: string, caption?: string) => void;
  onBackToSidebar?: () => void;
  lang: LanguageCode;
  isContactTyping?: boolean;
}

const COMMON_EMOJIS = ['❤️', '🔥', '👍', '😂', '🇳🇮', '👏', '🚀', '😍', '☕'];

export const ChatArea: React.FC<Props> = ({
  conversation,
  messages,
  currentUser,
  onSendMessage,
  onOpenSecurityModal,
  onOpenVoiceCall,
  onOpenLocationModal,
  onOpenSocialHub,
  onViewImage,
  onBackToSidebar,
  lang,
  isContactTyping = false,
}) => {
  const t = translations[lang];
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [activeReactionMessageId, setActiveReactionMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recordIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto scroll to bottom on new messages and typing indicator
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isRecording, isContactTyping]);

  // Voice recording timer
  useEffect(() => {
    if (isRecording) {
      setRecordSeconds(0);
      recordIntervalRef.current = setInterval(() => {
        setRecordSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
    }
    return () => {
      if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
    };
  }, [isRecording]);

  const handleSendText = () => {
    if (!inputText.trim()) return;

    sounds.playSendChime();
    onSendMessage({
      type: 'text',
      content: inputText.trim(),
      replyTo: replyingTo ? {
        id: replyingTo.id,
        senderName: replyingTo.senderName,
        content: replyingTo.content,
        type: replyingTo.type,
      } : undefined,
    });

    setInputText('');
    setReplyingTo(null);
    setShowEmojiPicker(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  const handleStartRecording = () => {
    setIsRecording(true);
  };

  const handleCancelRecording = () => {
    setIsRecording(false);
    setRecordSeconds(0);
  };

  const handleFinishRecording = () => {
    const finalSeconds = Math.max(recordSeconds, 2);
    setIsRecording(false);
    sounds.playSendChime();

    onSendMessage({
      type: 'audio',
      content: `Nota de voz cifrada (${finalSeconds}s)`,
      audioMetadata: {
        duration: finalSeconds,
        waveform: generateWaveform(30),
      }
    });
    setRecordSeconds(0);
  };

  const handleSendSampleImage = () => {
    setShowAttachMenu(false);
    sounds.playSendChime();
    onSendMessage({
      type: 'image',
      content: 'Foto en alta calidad',
      mediaUrl: 'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=1200&auto=format&fit=crop&q=90',
      caption: 'Fotografía 4K HDR desde Granada, Nicaragua 🇳🇮 (8.2 MB)'
    });
  };

  const handleSendSampleDocument = () => {
    setShowAttachMenu(false);
    sounds.playSendChime();
    onSendMessage({
      type: 'file',
      content: 'Documento Cifrado E2EE',
      fileMetadata: {
        fileName: 'Informe_Comercio_Nicaragua_2026.pdf',
        fileSize: '18.5 MB',
        fileType: 'Documento PDF Cifrado',
        downloadUrl: '#'
      }
    });
  };

  const handleAddReaction = (messageId: string, emoji: string) => {
    const msg = messages.find(m => m.id === messageId);
    if (!msg) return;

    const currentReactions = { ...(msg.reactions || {}) };
    if (!currentReactions[emoji]) {
      currentReactions[emoji] = [currentUser.name];
    } else {
      if (currentReactions[emoji].includes(currentUser.name)) {
        currentReactions[emoji] = currentReactions[emoji].filter(n => n !== currentUser.name);
        if (currentReactions[emoji].length === 0) delete currentReactions[emoji];
      } else {
        currentReactions[emoji].push(currentUser.name);
      }
    }

    msg.reactions = currentReactions;
    setActiveReactionMessageId(null);
  };

  const formatMessageTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div id="chat-area-container" className="flex-1 flex flex-col h-full bg-slate-950 relative overflow-hidden">
      {/* Top Chat Header */}
      <div className="h-16 px-3 sm:px-4 border-b border-slate-800/80 bg-[#070e1a]/95 backdrop-blur-md flex items-center justify-between z-10">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {onBackToSidebar && (
            <button
              onClick={onBackToSidebar}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
              title="Volver"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div className="relative shrink-0">
            <img
              src={conversation.avatar}
              alt={conversation.name}
              className="w-10 h-10 rounded-full object-cover border border-slate-700"
            />
            {/* Green online dot */}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#070e1a]" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-display font-bold text-sm text-white truncate">
                {conversation.name}
              </h3>
              {conversation.isVerified && (
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              )}
            </div>

            {isContactTyping ? (
              <div className="flex items-center gap-1.5 text-[11px] text-sky-400 font-medium">
                <span className="animate-pulse">escribiendo</span>
                <span className="flex gap-0.5 items-center">
                  <span className="w-1 h-1 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1 h-1 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1 h-1 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-slate-300">En línea</span>
              </div>
            )}
          </div>
        </div>

        {/* Right action controls matching mockup: Phone, Video, 3 dots Menu */}
        <div className="flex items-center gap-1 sm:gap-2 text-slate-300">
          <button
            onClick={() => onOpenVoiceCall(false)}
            className="p-2 rounded-xl hover:bg-slate-800 hover:text-white transition cursor-pointer"
            title={t.voiceCall}
          >
            <Phone className="w-4 h-4" />
          </button>

          <button
            onClick={() => onOpenVoiceCall(true)}
            className="p-2 rounded-xl hover:bg-slate-800 hover:text-white transition cursor-pointer"
            title={t.videoCall}
          >
            <Video className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenSocialHub}
            className="p-2 rounded-xl hover:bg-slate-800 hover:text-indigo-400 transition cursor-pointer hidden lg:flex items-center gap-1 text-xs"
            title={t.socialHub}
          >
            <Compass className="w-4 h-4 text-indigo-400" />
            <span>Social</span>
          </button>

          <button
            onClick={onOpenSecurityModal}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
            title="Opciones y Cifrado"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Stream */}
      <div 
        id="messages-stream-container"
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px]"
      >
        {/* E2EE System Badge */}
        <div className="max-w-md mx-auto p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center shadow-lg backdrop-blur-md space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-400">
            <Lock className="w-3.5 h-3.5" />
            <span>{t.e2eeBadge}</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            {t.e2eeInfo}
          </p>
        </div>

        {/* Messages List */}
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUser.id;
          const hasReactions = msg.reactions && Object.keys(msg.reactions).length > 0;

          return (
            <div
              key={msg.id}
              className={`flex flex-col group relative ${isMe ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-end gap-2 max-w-[85%] sm:max-w-[75%]">
                {!isMe && (
                  <img
                    src={msg.senderAvatar}
                    alt={msg.senderName}
                    className="w-7 h-7 rounded-full object-cover shrink-0 mb-1 border border-slate-700"
                  />
                )}

                <div
                  className={`rounded-2xl p-3 shadow-md relative transition-all ${
                    isMe
                      ? 'bg-[#0077ff] text-white rounded-br-sm'
                      : 'bg-[#182232] border border-slate-800/80 text-slate-100 rounded-bl-sm'
                  }`}
                >
                  {/* Sender Name in groups */}
                  {!isMe && conversation.type === 'group' && (
                    <p className="text-[11px] font-bold text-sky-400 mb-1">
                      {msg.senderName}
                    </p>
                  )}

                  {/* Quoted reply */}
                  {msg.replyTo && (
                    <div className={`mb-2 p-2 rounded-lg border-l-2 text-xs text-left ${
                      isMe ? 'bg-sky-700/60 border-sky-200 text-sky-100' : 'bg-slate-800 border-sky-500 text-slate-300'
                    }`}>
                      <p className="font-semibold text-[10px] text-sky-300">{msg.replyTo.senderName}</p>
                      <p className="truncate text-[11px]">{msg.replyTo.content}</p>
                    </div>
                  )}

                  {/* Text Message */}
                  {msg.type === 'text' && (
                    <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed break-words select-text">
                      {msg.content}
                    </p>
                  )}

                  {/* Voice Audio Message */}
                  {msg.type === 'audio' && (
                    <AudioPlayerBubble
                      audioMetadata={msg.audioMetadata}
                      isOutgoing={isMe}
                      timestamp={formatMessageTime(msg.timestamp)}
                    />
                  )}

                  {/* High Resolution Image Attachment */}
                  {msg.type === 'image' && msg.mediaUrl && (
                    <div className="space-y-2">
                      <div 
                        onClick={() => onViewImage(msg.mediaUrl!, msg.caption)}
                        className="relative rounded-xl overflow-hidden cursor-pointer group/img max-w-sm"
                      >
                        <img
                          src={msg.mediaUrl}
                          alt={msg.caption || 'Foto en alta calidad'}
                          className="w-full h-auto object-cover max-h-72 rounded-lg group-hover/img:scale-102 transition-transform duration-300"
                        />
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-mono text-sky-400 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          <span>4K HDR</span>
                        </div>
                      </div>
                      {msg.caption && (
                        <p className="text-xs sm:text-sm text-slate-100">{msg.caption}</p>
                      )}
                    </div>
                  )}

                  {/* Document / File Attachment */}
                  {msg.type === 'file' && (
                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-black/20 border border-white/10 min-w-[240px]">
                      <div className="w-10 h-10 rounded-lg bg-sky-500/20 text-sky-300 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-xs truncate text-white">
                          {msg.fileMetadata?.fileName || 'Documento Cifrado'}
                        </p>
                        <p className="text-[10px] text-slate-300">
                          {msg.fileMetadata?.fileSize || '14.2 MB'} • AES-256
                        </p>
                      </div>
                      <button
                        onClick={() => alert(`Descargando "${msg.fileMetadata?.fileName}" de forma segura y desencriptando localmente...`)}
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                        title="Descargar archivo"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Real-time Location Card */}
                  {msg.type === 'location' && msg.locationMetadata && (
                    <div className="space-y-2 min-w-[260px] sm:min-w-[290px]">
                      <div className="h-32 rounded-xl overflow-hidden relative border border-slate-700 bg-slate-950 flex items-center justify-center">
                        {/* Vector mini map */}
                        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:12px_12px]" />
                        <svg className="absolute inset-0 w-full h-full stroke-sky-500/20 stroke-2 fill-none">
                          <circle cx="140" cy="65" r="30" />
                          <circle cx="140" cy="65" r="50" strokeDasharray="4 4" />
                        </svg>

                        <div className="relative flex flex-col items-center z-10">
                          <div className="w-8 h-8 rounded-full bg-emerald-500/30 flex items-center justify-center animate-ping absolute" />
                          <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg">
                            <MapPin className="w-4 h-4" />
                          </div>
                        </div>

                        {msg.locationMetadata.isLive && (
                          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[10px] font-semibold flex items-center gap-1">
                            <Radio className="w-3 h-3 animate-pulse" />
                            <span>GPS EN VIVO</span>
                          </div>
                        )}
                      </div>

                      <div className="text-left">
                        <p className="font-semibold text-xs text-white">
                          {msg.locationMetadata.placeName}
                        </p>
                        <p className="text-[11px] text-slate-300 truncate">
                          {msg.locationMetadata.address}
                        </p>
                        <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/10 text-[11px]">
                          <span className="text-emerald-300 flex items-center gap-1 font-mono">
                            <Lock className="w-3 h-3" /> Transmisión cifrada
                          </span>
                          <a
                            href={`https://www.google.com/maps?q=${msg.locationMetadata.latitude},${msg.locationMetadata.longitude}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sky-300 hover:text-white flex items-center gap-1 font-semibold"
                          >
                            <span>Ver Mapa</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bottom meta: Time & read receipts */}
                  <div className={`flex items-center justify-end gap-1.5 mt-1 text-[10px] ${
                    isMe ? 'text-sky-100/90' : 'text-slate-400'
                  }`}>
                    <span>{formatMessageTime(msg.timestamp)}</span>
                    {isMe && (
                      <MessageStatusCheck
                        status={msg.status}
                        timestamp={msg.timestamp}
                        interactive={true}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Message Reactions Bar */}
              {hasReactions && (
                <div className={`flex flex-wrap gap-1 mt-1 ${isMe ? 'mr-2' : 'ml-9'}`}>
                  {Object.entries(msg.reactions || {}).map(([emoji, users]) => {
                    const userList = Array.isArray(users) ? users : [];
                    return (
                      <button
                        key={emoji}
                        onClick={() => handleAddReaction(msg.id, emoji)}
                        className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-xs flex items-center gap-1 shadow hover:bg-slate-800 transition"
                      >
                        <span>{emoji}</span>
                        <span className="text-[10px] text-slate-400 font-bold">{userList.length}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Hover Quick Action to React / Reply */}
              <div className={`opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-1 text-slate-400 ${
                isMe ? 'mr-2' : 'ml-9'
              }`}>
                <button
                  onClick={() => setActiveReactionMessageId(activeReactionMessageId === msg.id ? null : msg.id)}
                  className="p-1 rounded hover:bg-slate-800 hover:text-white text-xs flex items-center gap-0.5"
                  title="Reaccionar"
                >
                  <Smile className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setReplyingTo(msg)}
                  className="p-1 rounded hover:bg-slate-800 hover:text-white text-[11px]"
                  title="Responder"
                >
                  Responder
                </button>
              </div>

              {/* Floating Reaction Selector */}
              {activeReactionMessageId === msg.id && (
                <div className={`absolute z-30 bottom-8 p-1.5 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl flex items-center gap-1 animate-scaleUp ${
                  isMe ? 'right-0' : 'left-8'
                }`}>
                  {COMMON_EMOJIS.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => handleAddReaction(msg.id, emoji)}
                      className="w-8 h-8 rounded-full hover:bg-slate-800 flex items-center justify-center text-base hover:scale-125 transition-transform"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Contact Typing Indicator Bubble */}
        {isContactTyping && (
          <div className="flex items-end gap-2 max-w-[85%] sm:max-w-[75%] animate-in fade-in slide-in-from-bottom-2 duration-300">
            <img
              src={conversation.avatar}
              alt={conversation.name}
              className="w-7 h-7 rounded-full object-cover shrink-0 mb-1 border border-slate-700"
            />
            <div className="rounded-2xl px-3.5 py-2.5 bg-[#182232] border border-slate-800/80 rounded-bl-sm text-slate-300 flex items-center gap-2 shadow-md">
              <span className="text-xs text-slate-300 font-medium">
                {conversation.name} está escribiendo
              </span>
              <span className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Replying banner */}
      {replyingTo && (
        <div className="px-4 py-2 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2 truncate">
            <span className="text-sky-400 font-semibold">Respondiendo a {replyingTo.senderName}:</span>
            <span className="truncate text-slate-400">{replyingTo.content}</span>
          </div>
          <button 
            onClick={() => setReplyingTo(null)}
            className="p-1 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Input Bar & Voice Recorder */}
      <div className="p-3 bg-slate-900/95 border-t border-slate-800 relative z-20">
        {/* Attachment menu popover */}
        {showAttachMenu && (
          <div className="absolute bottom-16 left-4 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-30 flex flex-col gap-1 w-64 animate-scaleUp">
            <button
              onClick={handleSendSampleImage}
              className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800 text-xs text-slate-200 flex items-center gap-3 transition cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
                <ImageIcon className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-white">Fotos en Alta Calidad</p>
                <p className="text-[10px] text-slate-400">Hasta 100MB sin compresión</p>
              </div>
            </button>

            <button
              onClick={handleSendSampleDocument}
              className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800 text-xs text-slate-200 flex items-center gap-3 transition cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-white">Documento o Archivo</p>
                <p className="text-[10px] text-slate-400">PDF, ZIP, DOC cifrados</p>
              </div>
            </button>

            <button
              onClick={() => { setShowAttachMenu(false); onOpenLocationModal(); }}
              className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800 text-xs text-slate-200 flex items-center gap-3 transition cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-white">Ubicación en Tiempo Real</p>
                <p className="text-[10px] text-slate-400">Compartir GPS en vivo</p>
              </div>
            </button>
          </div>
        )}

        {/* Emoji Selector Popover */}
        {showEmojiPicker && (
          <div className="absolute bottom-16 left-12 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-3 z-30 grid grid-cols-6 gap-2 animate-scaleUp">
            {['❤️', '🔥', '👍', '😂', '🇳🇮', '👏', '🚀', '😍', '☕', '🎉', '🌴', '🌋', '💯', '✨', '⚡', '🥑', '🌊', '🛡️'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => { setInputText(prev => prev + emoji); setShowEmojiPicker(false); }}
                className="w-9 h-9 rounded-xl hover:bg-slate-800 flex items-center justify-center text-lg hover:scale-110 transition cursor-pointer"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* Voice recording state */}
        {isRecording ? (
          <div className="flex items-center justify-between gap-3 px-3 py-2 bg-slate-950 rounded-2xl border border-rose-500/40 animate-pulse">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
              <span className="text-xs font-semibold text-rose-400 flex items-center gap-1.5 font-mono">
                <Mic className="w-4 h-4" />
                {`0:${recordSeconds.toString().padStart(2, '0')}`}
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">
                {t.recording}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCancelRecording}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleFinishRecording}
                className="px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-semibold text-white shadow-md shadow-sky-600/20 transition cursor-pointer flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar Audio</span>
              </button>
            </div>
          </div>
        ) : (
          /* Normal typing state matching mockup: smile, input, paperclip, blue send/mic */
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowAttachMenu(false); }}
              className={`p-2 rounded-xl transition cursor-pointer ${
                showEmojiPicker ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Emojis"
            >
              <Smile className="w-5 h-5" />
            </button>

            <div className="flex-1 relative flex items-center">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe un mensaje..."
                className="w-full bg-[#0d1627] border border-slate-700/70 rounded-2xl pl-4 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 transition"
              />
              <button
                onClick={() => { setShowAttachMenu(!showAttachMenu); setShowEmojiPicker(false); }}
                className={`absolute right-2.5 p-1.5 rounded-lg transition cursor-pointer ${
                  showAttachMenu ? 'text-sky-400' : 'text-slate-400 hover:text-white'
                }`}
                title="Adjuntar multimedia o ubicación"
              >
                <Paperclip className="w-4 h-4" />
              </button>
            </div>

            {inputText.trim() ? (
              <button
                onClick={handleSendText}
                className="w-10 h-10 rounded-full bg-[#0077ff] hover:bg-[#0066dd] text-white flex items-center justify-center shadow-lg shadow-blue-600/30 transition hover:scale-105 active:scale-95 cursor-pointer shrink-0"
                title={t.send}
              >
                <Send className="w-4 h-4 translate-x-0.5" />
              </button>
            ) : (
              <button
                onClick={handleStartRecording}
                className="w-10 h-10 rounded-full bg-[#0077ff] hover:bg-[#0066dd] text-white flex items-center justify-center shadow-lg shadow-blue-600/30 transition hover:scale-105 active:scale-95 cursor-pointer shrink-0"
                title={t.holdToRecord}
              >
                <Mic className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
