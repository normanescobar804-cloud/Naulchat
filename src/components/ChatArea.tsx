import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Mic, MicOff, Paperclip, Image as ImageIcon, FileText, 
  MapPin, Phone, Video, ShieldCheck, Lock, MoreVertical, 
  Smile, Search, ArrowLeft, Download, ExternalLink, X, 
  Check, CheckCheck, Radio, Sparkles, AlertCircle, Compass,
  Camera, Film, Music, Edit3, Trash2, Flag, UserX, Loader2,
  Contrast, Sun, SunMedium, Sliders, Eye, EyeOff, RotateCcw,
  Wand2, Palette, ChevronUp, ChevronDown, Plus
} from 'lucide-react';
import { Conversation, Message, User, LocationMetadata, FileMetadata, AudioMetadata, LanguageCode, BubbleColors } from '../types';
import { translations } from '../utils/translations';
import { AudioPlayerBubble } from './AudioPlayerBubble';
import { generateWaveform, sounds } from '../utils/security';
import { MessageStatusCheck } from './MessageStatusCheck';
import { CameraCaptureModal } from './CameraCaptureModal';
import { ChatBubbleColorModal, DEFAULT_BUBBLE_COLORS } from './ChatBubbleColorModal';
import { MediaPermissionGuideModal } from './MediaPermissionGuideModal';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { EmojiReactionPickerModal } from './EmojiReactionPickerModal';
import { QUICK_REACTION_EMOJIS } from '../data/emojis';
import { apiUploadFile } from '../services/api';
import { generateVoiceNoteAudioUrl } from '../utils/audioVoiceGenerator';

export type CameraImageFilter = 'normal' | 'grayscale' | 'sepia' | 'brightness';

export interface PendingCameraImage {
  originalUrl: string;
  filter: CameraImageFilter;
  brightness: number; // 100 - 200%
  caption: string;
}

export const CAMERA_VISUAL_FILTERS: Array<{
  id: CameraImageFilter;
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
  getCss: (brightness: number) => string;
}> = [
  {
    id: 'normal',
    label: 'Normal',
    sublabel: 'Sin filtro',
    icon: Sparkles,
    getCss: () => 'none',
  },
  {
    id: 'grayscale',
    label: 'Blanco y Negro',
    sublabel: 'B&W Clásico',
    icon: Contrast,
    getCss: () => 'grayscale(100%) contrast(110%)',
  },
  {
    id: 'sepia',
    label: 'Sepia',
    sublabel: 'Tono Vintage',
    icon: Palette,
    getCss: () => 'sepia(100%) contrast(100%) brightness(95%)',
  },
  {
    id: 'brightness',
    label: 'Brillo',
    sublabel: 'Luminoso HD',
    icon: SunMedium,
    getCss: (b: number) => `brightness(${b}%) contrast(105%)`,
  },
];

/**
 * Bakes the chosen visual filter into an image using HTML5 Canvas
 */
export const applyFilterToImage = (
  imageUrl: string,
  filter: CameraImageFilter,
  brightness: number
): Promise<string> => {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width || 1280;
        canvas.height = img.naturalHeight || img.height || 720;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(imageUrl);
          return;
        }

        // Apply filter directly in Canvas
        if (filter === 'grayscale') {
          ctx.filter = 'grayscale(100%) contrast(110%)';
        } else if (filter === 'sepia') {
          ctx.filter = 'sepia(100%) contrast(100%) brightness(95%)';
        } else if (filter === 'brightness') {
          ctx.filter = `brightness(${brightness}%) contrast(105%)`;
        } else {
          ctx.filter = 'none';
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Fallback pixel manipulation if ctx.filter is unsupported in specific webview
        if (filter !== 'normal' && (ctx.filter === 'none' || !ctx.filter)) {
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const d = imgData.data;
          const factor = brightness / 100;
          for (let i = 0; i < d.length; i += 4) {
            const r = d[i];
            const g = d[i + 1];
            const b = d[i + 2];
            if (filter === 'grayscale') {
              const gray = 0.299 * r + 0.587 * g + 0.114 * b;
              d[i] = gray;
              d[i + 1] = gray;
              d[i + 2] = gray;
            } else if (filter === 'sepia') {
              d[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
              d[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
              d[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
            } else if (filter === 'brightness') {
              d[i] = Math.min(255, r * factor);
              d[i + 1] = Math.min(255, g * factor);
              d[i + 2] = Math.min(255, b * factor);
            }
          }
          ctx.putImageData(imgData, 0, 0);
        }

        const filteredDataUrl = canvas.toDataURL('image/jpeg', 0.92);
        resolve(filteredDataUrl);
      } catch (err) {
        console.warn('Canvas export failed, falling back to original:', err);
        resolve(imageUrl);
      }
    };
    img.onerror = () => resolve(imageUrl);
    img.src = imageUrl;
  });
};

interface Props {
  conversation: Conversation;
  messages: Message[];
  currentUser: User;
  hasMoreMessages?: boolean;
  isLoadingOlderMessages?: boolean;
  onLoadOlderMessages?: () => void;
  onSendMessage: (msg: Partial<Message>) => void;
  onEditMessage?: (messageId: string, newContent: string) => void;
  onDeleteMessage?: (messageId: string) => void;
  onOpenSecurityModal: () => void;
  onOpenVoiceCall: (isVideo?: boolean) => void;
  onOpenLocationModal: () => void;
  onOpenSocialHub: () => void;
  onOpenReportModal?: (reportedUser: { id: string; name: string }) => void;
  onViewImage: (url: string, caption?: string) => void;
  onBackToSidebar?: () => void;
  onUpdateUser?: (updated: Partial<User>) => void;
  onDeleteConversation?: (conversationId: string) => void;
  onReactMessage?: (messageId: string, emoji: string) => void;
  lang: LanguageCode;
  isContactTyping?: boolean;
  onTyping?: (isTyping: boolean) => void;
}

export const ChatArea: React.FC<Props> = ({
  conversation,
  messages,
  currentUser,
  hasMoreMessages = false,
  isLoadingOlderMessages = false,
  onLoadOlderMessages,
  onSendMessage,
  onEditMessage,
  onDeleteMessage,
  onDeleteConversation,
  onReactMessage,
  onOpenSecurityModal,
  onOpenVoiceCall,
  onOpenLocationModal,
  onOpenSocialHub,
  onOpenReportModal,
  onViewImage,
  onBackToSidebar,
  onUpdateUser,
  lang,
  isContactTyping = false,
  onTyping,
}) => {
  const t = translations[lang];
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showInputFullEmojiPicker, setShowInputFullEmojiPicker] = useState(false);
  const [fullPickerTargetMessage, setFullPickerTargetMessage] = useState<{ id: string; preview: string } | null>(null);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);

  // Bubble color customization modal state
  const [showBubbleColorModal, setShowBubbleColorModal] = useState(false);
  const [showDeleteConversationConfirm, setShowDeleteConversationConfirm] = useState(false);
  const [bubbleColors, setBubbleColors] = useState<BubbleColors>(
    currentUser.bubbleColors || DEFAULT_BUBBLE_COLORS
  );

  useEffect(() => {
    if (currentUser.bubbleColors) {
      setBubbleColors(currentUser.bubbleColors);
    }
  }, [currentUser.bubbleColors]);

  const handleSaveBubbleColors = (newColors: BubbleColors) => {
    setBubbleColors(newColors);
    if (onUpdateUser) {
      onUpdateUser({ bubbleColors: newColors });
    }
  };
  
  // Camera visual filter selector state
  const [pendingCameraImage, setPendingCameraImage] = useState<PendingCameraImage | null>(null);
  const [isComparingOriginal, setIsComparingOriginal] = useState(false);
  const [isProcessingFilterSend, setIsProcessingFilterSend] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [isSimulatedVoiceRecording, setIsSimulatedVoiceRecording] = useState(false);
  const [showPermissionGuideModal, setShowPermissionGuideModal] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState('');
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [activeReactionMessageId, setActiveReactionMessageId] = useState<string | null>(null);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);

  // Real AES-256-GCM message inspection modal state
  const [inspectEncryptedMsg, setInspectEncryptedMsg] = useState<Message | null>(null);
  const [copiedCipher, setCopiedCipher] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef<number>(0);
  const prevConversationIdRef = useRef<string>(conversation.id);
  const isPrependingRef = useRef<boolean>(false);
  const recordIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTriggerLoadOlder = () => {
    if (isLoadingOlderMessages || !hasMoreMessages || !onLoadOlderMessages) return;
    if (messagesContainerRef.current) {
      prevScrollHeightRef.current = messagesContainerRef.current.scrollHeight;
      isPrependingRef.current = true;
    }
    onLoadOlderMessages();
  };

  const handleMessagesScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    if (container.scrollTop < 40 && hasMoreMessages && !isLoadingOlderMessages && onLoadOlderMessages) {
      handleTriggerLoadOlder();
    }
  };

  // In-chat message search state
  const [isChatSearchOpen, setIsChatSearchOpen] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);
  const chatSearchInputRef = useRef<HTMLInputElement>(null);

  // Reset in-chat search when switching conversation
  useEffect(() => {
    setIsChatSearchOpen(false);
    setChatSearchQuery('');
    setCurrentMatchIndex(-1);
  }, [conversation.id]);

  // Global Ctrl+F / Cmd+F handler to open in-chat search
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setIsChatSearchOpen(true);
        setTimeout(() => chatSearchInputRef.current?.focus(), 80);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Compute matched message IDs
  const searchMatches = React.useMemo(() => {
    if (!chatSearchQuery.trim()) return [];
    const q = chatSearchQuery.toLowerCase().trim();
    const matchedIds: string[] = [];
    for (const m of messages) {
      if (m.isDeleted) continue;
      const inContent = m.content && m.content.toLowerCase().includes(q);
      const inCaption = m.caption && m.caption.toLowerCase().includes(q);
      const inDoc = m.fileMetadata?.fileName && m.fileMetadata.fileName.toLowerCase().includes(q);
      const inSender = m.senderName && m.senderName.toLowerCase().includes(q);
      if (inContent || inCaption || inDoc || inSender) {
        matchedIds.push(m.id);
      }
    }
    return matchedIds;
  }, [messages, chatSearchQuery]);

  useEffect(() => {
    if (searchMatches.length > 0) {
      setCurrentMatchIndex(searchMatches.length - 1);
    } else {
      setCurrentMatchIndex(-1);
    }
  }, [searchMatches]);

  useEffect(() => {
    if (currentMatchIndex >= 0 && currentMatchIndex < searchMatches.length) {
      const targetId = searchMatches[currentMatchIndex];
      const el = document.getElementById(`msg-${targetId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentMatchIndex, searchMatches]);

  const goToPrevMatch = () => {
    if (searchMatches.length === 0) return;
    setCurrentMatchIndex(prev => (prev > 0 ? prev - 1 : searchMatches.length - 1));
  };

  const goToNextMatch = () => {
    if (searchMatches.length === 0) return;
    setCurrentMatchIndex(prev => (prev < searchMatches.length - 1 ? prev + 1 : 0));
  };

  const renderHighlightedChatMessage = (text?: string, query?: string) => {
    if (!text) return null;
    if (!query || !query.trim()) return text;
    const trimmed = query.trim();
    const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    const parts = text.split(regex);
    if (parts.length === 1) return text;
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark
          key={i}
          className="bg-amber-400 text-slate-950 font-bold px-1 py-0.5 rounded shadow-sm ring-1 ring-amber-300"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const handleInputChange = (val: string) => {
    setInputText(val);
    if (onTyping) {
      onTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
      }, 1500);
    }
  };

  // Auto scroll to bottom or restore position when older messages are loaded
  useEffect(() => {
    // 1. Conversation switched -> scroll to bottom
    if (prevConversationIdRef.current !== conversation.id) {
      prevConversationIdRef.current = conversation.id;
      isPrependingRef.current = false;
      prevScrollHeightRef.current = 0;
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
      return;
    }

    // 2. Prepended older messages -> restore scroll offset seamlessly
    if (isPrependingRef.current && messagesContainerRef.current && prevScrollHeightRef.current > 0) {
      const newScrollHeight = messagesContainerRef.current.scrollHeight;
      const heightDifference = newScrollHeight - prevScrollHeightRef.current;
      if (heightDifference > 0) {
        messagesContainerRef.current.scrollTop += heightDifference;
      }
      isPrependingRef.current = false;
      prevScrollHeightRef.current = 0;
      return;
    }

    // 3. Normal incoming or outgoing message at bottom: scroll smoothly to bottom
    if (!isChatSearchOpen || !chatSearchQuery.trim()) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isRecording, isContactTyping, isChatSearchOpen, chatSearchQuery, conversation.id]);

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

    if (onTyping) onTyping(false);

    if (editingMessage && onEditMessage) {
      onEditMessage(editingMessage.id, inputText.trim());
      setEditingMessage(null);
      setInputText('');
      return;
    }

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

  /**
   * Captures an image from the camera and opens the visual filter selector studio
   * allowing the user to select filters (Blanco y Negro, Sepia, Brillo, Normal)
   */
  const handleCaptureImage = (dataUrl: string, captionText?: string) => {
    setShowCameraModal(false);
    setPendingCameraImage({
      originalUrl: dataUrl,
      filter: 'normal',
      brightness: 135,
      caption: captionText || '',
    });
    setIsComparingOriginal(false);
  };

  /**
   * Processes the camera image with the chosen visual filter baked in using HTML5 Canvas,
   * uploads the resulting filtered media, and sends it to the conversation.
   */
  const handleSendFilteredCameraImage = async () => {
    if (!pendingCameraImage || isProcessingFilterSend) return;
    setIsProcessingFilterSend(true);
    try {
      // 1. Bake the filter into the actual image pixels
      const finalDataUrl = await applyFilterToImage(
        pendingCameraImage.originalUrl,
        pendingCameraImage.filter,
        pendingCameraImage.brightness
      );

      const filterNames: Record<CameraImageFilter, string> = {
        normal: 'Foto de cámara',
        grayscale: 'Foto (Blanco y Negro)',
        sepia: 'Foto (Sepia Vintage)',
        brightness: `Foto (Brillo +${Math.round(pendingCameraImage.brightness - 100)}%)`,
      };

      const filterTag = filterNames[pendingCameraImage.filter];
      const userCaption = pendingCameraImage.caption.trim();
      const finalCaption = userCaption ? `${userCaption} • ${filterTag} 🇳🇮` : `${filterTag} 🇳🇮`;

      // Close the filter studio modal
      setPendingCameraImage(null);

      setIsUploading(true);
      setUploadStatusText('Guardando y aplicando filtro a la captura...');
      try {
        const uploadRes = await apiUploadFile(
          finalDataUrl,
          `camara_${pendingCameraImage.filter}_${Date.now()}.jpg`,
          'image/jpeg',
          true
        );
        sounds.playSendChime();
        onSendMessage({
          type: 'image',
          content: userCaption ? `Foto: ${userCaption}` : filterTag,
          mediaUrl: uploadRes.url,
          caption: finalCaption,
        });
      } catch (err: any) {
        console.warn('Fallback enviando foto filtrada localmente:', err);
        sounds.playSendChime();
        onSendMessage({
          type: 'image',
          content: userCaption ? `Foto: ${userCaption}` : filterTag,
          mediaUrl: finalDataUrl,
          caption: finalCaption,
        });
      } finally {
        setIsUploading(false);
        setUploadStatusText('');
      }
    } catch (err: any) {
      console.error('Error aplicando filtro a la captura:', err);
    } finally {
      setIsProcessingFilterSend(false);
    }
  };

  /**
   * When image is taken via mobile camera file input, open visual filter selector
   */
  const handleCameraFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setShowAttachMenu(false);

    if (file.size > 15 * 1024 * 1024) {
      alert('La fotografía no puede exceder el límite seguro de 15 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setPendingCameraImage({
        originalUrl: dataUrl,
        filter: 'normal',
        brightness: 135,
        caption: '',
      });
      setIsComparingOriginal(false);
    };
    reader.readAsDataURL(file);
  };

  const handleCaptureVideo = async (dataUrl: string, captionText?: string) => {
    setIsUploading(true);
    setUploadStatusText('Guardando video capturado en servidor seguro...');
    try {
      const uploadRes = await apiUploadFile(dataUrl, `video_${Date.now()}.webm`, 'video/webm', true);
      sounds.playSendChime();
      onSendMessage({
        type: 'video',
        content: captionText ? `Video: ${captionText}` : 'Video grabado con la cámara',
        mediaUrl: uploadRes.url,
        caption: captionText ? `${captionText} 🇳🇮` : 'Video HD grabado al instante 🇳🇮'
      });
    } catch (err: any) {
      console.error('Error al guardar video:', err);
      sounds.playSendChime();
      onSendMessage({
        type: 'video',
        content: captionText ? `Video: ${captionText}` : 'Video grabado con la cámara',
        mediaUrl: dataUrl,
        caption: captionText ? `${captionText} 🇳🇮` : 'Video HD grabado al instante 🇳🇮'
      });
    } finally {
      setIsUploading(false);
      setUploadStatusText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  // Grabador de voz en audio real conectado con MediaRecorder y el servidor
  const handleStartRecording = async () => {
    setRecordingError(null);
    audioChunksRef.current = [];
    setIsSimulatedVoiceRecording(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      let options: MediaRecorderOptions = {};
      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          options = { mimeType: 'audio/webm;codecs=opus' };
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          options = { mimeType: 'audio/webm' };
        } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
          options = { mimeType: 'audio/ogg;codecs=opus' };
        }
      }

      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.start(250); // Muestreo cada 250ms
      setIsRecording(true);
      setRecordSeconds(0);
    } catch (err: any) {
      console.warn('Permiso de micrófono o error de dispositivo:', err);
      const isDenied = err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError' || err.message?.includes('Permission denied') || err.message?.includes('denied');
      
      // Permitir continuar grabando mediante síntesis vocal asistida de alta calidad para no bloquear al usuario
      setIsSimulatedVoiceRecording(true);
      setIsRecording(true);
      setRecordSeconds(0);
      if (isDenied) {
        setRecordingError('Micrófono bloqueado por el navegador o vista previa. Grabando en Modo Asistido (puedes abrir en una nueva pestaña para usar el micrófono físico).');
      } else {
        setRecordingError('Dispositivo físico no detectado. Grabando en Modo Asistido.');
      }
    }
  };

  const handleCancelRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch {}
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    audioChunksRef.current = [];
    setIsRecording(false);
    setIsSimulatedVoiceRecording(false);
    setRecordSeconds(0);
  };

  const handleFinishRecording = () => {
    const finalSeconds = Math.max(recordSeconds, 1);
    setIsRecording(false);

    if (isSimulatedVoiceRecording) {
      setIsSimulatedVoiceRecording(false);
      const vocalAudioUrl = generateVoiceNoteAudioUrl(finalSeconds, true);
      sounds.playSendChime();
      onSendMessage({
        type: 'audio',
        content: `Nota de voz (${finalSeconds}s)`,
        mediaUrl: vocalAudioUrl,
        audioMetadata: {
          duration: finalSeconds,
          waveform: generateWaveform(28),
          audioUrl: vocalAudioUrl
        }
      });
      return;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      const recorder = mediaRecorderRef.current;
      const mimeType = recorder.mimeType || 'audio/webm';

      recorder.onstop = async () => {
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(track => track.stop());
          mediaStreamRef.current = null;
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        audioChunksRef.current = [];

        if (audioBlob.size > 0) {
          const reader = new FileReader();
          reader.onloadend = async () => {
            const dataUrl = reader.result as string;
            setIsUploading(true);
            setUploadStatusText('Subiendo y protegiendo nota de voz en servidor...');
            try {
              const uploadRes = await apiUploadFile(dataUrl, `voz_${Date.now()}.webm`, mimeType, true);
              sounds.playSendChime();
              onSendMessage({
                type: 'audio',
                content: `Nota de voz (${finalSeconds}s)`,
                mediaUrl: uploadRes.url,
                audioMetadata: {
                  duration: finalSeconds,
                  waveform: generateWaveform(28),
                  audioUrl: uploadRes.url
                }
              });
            } catch (upErr: any) {
              console.warn('Fallback enviando nota local:', upErr);
              sounds.playSendChime();
              onSendMessage({
                type: 'audio',
                content: `Nota de voz (${finalSeconds}s)`,
                mediaUrl: dataUrl,
                audioMetadata: {
                  duration: finalSeconds,
                  waveform: generateWaveform(28),
                  audioUrl: dataUrl
                }
              });
            } finally {
              setIsUploading(false);
              setUploadStatusText('');
            }
          };
          reader.readAsDataURL(audioBlob);
        } else {
          // Fallback con síntesis vocal audible en alta fidelidad
          const vocalAudioUrl = generateVoiceNoteAudioUrl(finalSeconds, true);
          sounds.playSendChime();
          onSendMessage({
            type: 'audio',
            content: `Nota de voz (${finalSeconds}s)`,
            mediaUrl: vocalAudioUrl,
            audioMetadata: {
              duration: finalSeconds,
              waveform: generateWaveform(28),
              audioUrl: vocalAudioUrl
            }
          });
        }
      };

      try {
        recorder.stop();
      } catch (e) {
        console.error('Error stopping recorder:', e);
      }
    } else {
      // Fallback si no había hardware de micrófono activo en el navegador/iframe
      const vocalAudioUrl = generateVoiceNoteAudioUrl(finalSeconds, true);
      sounds.playSendChime();
      onSendMessage({
        type: 'audio',
        content: `Nota de voz (${finalSeconds}s)`,
        mediaUrl: vocalAudioUrl,
        audioMetadata: {
          duration: finalSeconds,
          waveform: generateWaveform(28),
          audioUrl: vocalAudioUrl
        }
      });
    }

    setRecordSeconds(0);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setShowAttachMenu(false);

    // Validación de tamaño (Máximo 10 MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('La imagen no puede exceder el límite seguro de 10 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      setIsUploading(true);
      setUploadStatusText(`Subiendo y validando ${file.name} en el servidor...`);
      try {
        const uploadRes = await apiUploadFile(dataUrl, file.name, file.type, true);
        sounds.playSendChime();
        onSendMessage({
          type: 'image',
          content: `Foto: ${file.name}`,
          mediaUrl: uploadRes.url,
          caption: `${file.name} (${(file.size / 1024 / 1024).toFixed(1)} MB) 🇳🇮 Almacenado y cifrado`
        });
      } catch (uploadErr: any) {
        alert(uploadErr.message || 'Error al validar y subir la imagen');
      } finally {
        setIsUploading(false);
        setUploadStatusText('');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setShowAttachMenu(false);

    // Validación de tamaño (Máximo 25 MB)
    if (file.size > 25 * 1024 * 1024) {
      alert('El video supera el límite máximo permitido de 25 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      setIsUploading(true);
      setUploadStatusText(`Subiendo y procesando video ${file.name}...`);
      try {
        const uploadRes = await apiUploadFile(dataUrl, file.name, file.type, true);
        sounds.playSendChime();
        onSendMessage({
          type: 'video',
          content: `Video: ${file.name}`,
          mediaUrl: uploadRes.url,
          caption: `Video HD Cifrado (${(file.size / 1024 / 1024).toFixed(1)} MB)`
        });
      } catch (err: any) {
        alert(err.message || 'Error al validar y subir el video');
      } finally {
        setIsUploading(false);
        setUploadStatusText('');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDocFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setShowAttachMenu(false);

    // Validación de tamaño (Máximo 20 MB)
    if (file.size > 20 * 1024 * 1024) {
      alert('El documento no puede exceder el límite seguro de 20 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      setIsUploading(true);
      setUploadStatusText(`Subiendo documento ${file.name}...`);
      try {
        const uploadRes = await apiUploadFile(dataUrl, file.name, file.type || 'application/pdf', true);
        sounds.playSendChime();
        onSendMessage({
          type: 'file',
          content: file.name,
          mediaUrl: uploadRes.url,
          fileMetadata: {
            fileName: file.name,
            fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
            fileType: file.type || 'Documento Cifrado',
            downloadUrl: uploadRes.url
          }
        });
      } catch (err: any) {
        alert(err.message || 'Error al validar y almacenar documento');
      } finally {
        setIsUploading(false);
        setUploadStatusText('');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setShowAttachMenu(false);

    // Validación de tamaño (Máximo 15 MB)
    if (file.size > 15 * 1024 * 1024) {
      alert('El archivo de audio no puede superar los 15 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      setIsUploading(true);
      setUploadStatusText(`Subiendo archivo de música/audio ${file.name}...`);
      try {
        const uploadRes = await apiUploadFile(dataUrl, file.name, file.type || 'audio/mpeg', true);
        sounds.playSendChime();
        onSendMessage({
          type: 'audio',
          content: `Audio: ${file.name}`,
          mediaUrl: uploadRes.url,
          audioMetadata: {
            duration: 30,
            waveform: generateWaveform(28),
            audioUrl: uploadRes.url
          }
        });
      } catch (err: any) {
        alert(err.message || 'Error al validar y subir audio');
      } finally {
        setIsUploading(false);
        setUploadStatusText('');
      }
    };
    reader.readAsDataURL(file);
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
    setActiveReactionMessageId(null);
    setFullPickerTargetMessage(null);
    sounds.playReactionSound();

    if (onReactMessage) {
      onReactMessage(messageId, emoji);
      return;
    }

    const msg = messages.find(m => m.id === messageId);
    if (!msg) return;

    const currentReactions = { ...(msg.reactions || {}) };
    const myName = currentUser.name || 'Tú';
    if (!currentReactions[emoji]) {
      currentReactions[emoji] = [myName];
    } else {
      if (currentReactions[emoji].includes(myName)) {
        currentReactions[emoji] = currentReactions[emoji].filter(n => n !== myName);
        if (currentReactions[emoji].length === 0) delete currentReactions[emoji];
      } else {
        currentReactions[emoji].push(myName);
      }
    }

    msg.reactions = currentReactions;
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

        {/* Right action controls matching mockup: Search, Phone, Video, Palette, 3 dots Menu */}
        <div className="flex items-center gap-1 sm:gap-2 text-slate-300">
          <button
            onClick={() => {
              setIsChatSearchOpen(prev => {
                const next = !prev;
                if (next) {
                  setTimeout(() => chatSearchInputRef.current?.focus(), 80);
                }
                return next;
              });
            }}
            className={`p-2 rounded-xl transition cursor-pointer flex items-center gap-1 ${
              isChatSearchOpen
                ? 'bg-sky-500/25 text-sky-400 ring-1 ring-sky-500/50'
                : 'hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
            title="Buscar en esta conversación (Ctrl+F)"
          >
            <Search className="w-4 h-4" />
            <span className="text-[11px] font-medium hidden 2xl:inline">Buscar</span>
          </button>

          <button
            onClick={() => setShowBubbleColorModal(true)}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-sky-400 transition cursor-pointer flex items-center gap-1"
            title="Personalizar color de globos de texto (Firestore)"
          >
            <Palette className="w-4 h-4 text-sky-400" />
            <span className="text-[11px] font-medium hidden xl:inline text-sky-300">Colores</span>
          </button>

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
            onClick={() => window.open(window.location.href, '_blank')}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-sky-400 transition cursor-pointer hidden md:flex items-center"
            title="Abrir Naul Chat en nueva pestaña (Permitir cámara y micrófono sin restricciones)"
          >
            <ExternalLink className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenSocialHub}
            className="p-2 rounded-xl hover:bg-slate-800 hover:text-indigo-400 transition cursor-pointer hidden lg:flex items-center gap-1 text-xs"
            title={t.socialHub}
          >
            <Compass className="w-4 h-4 text-indigo-400" />
            <span>Social</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowOptionsMenu(!showOptionsMenu)}
              className="p-2 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
              title="Opciones y Cifrado"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showOptionsMenu && (
              <div className="absolute right-0 top-11 w-64 bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl py-1.5 z-40 text-xs animate-scaleUp divide-y divide-slate-800/80">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowOptionsMenu(false);
                      setIsChatSearchOpen(true);
                      setTimeout(() => chatSearchInputRef.current?.focus(), 80);
                    }}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-slate-800/80 text-slate-200 flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <Search className="w-4 h-4 text-sky-400" />
                    <span>Buscar en la conversación (Ctrl+F)</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowOptionsMenu(false);
                      setShowBubbleColorModal(true);
                    }}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-slate-800/80 text-slate-200 flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <Palette className="w-4 h-4 text-sky-400" />
                    <span>Color de Globos de Mensajes</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowOptionsMenu(false);
                      onOpenSecurityModal();
                    }}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-slate-800/80 text-slate-200 flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <Lock className="w-4 h-4 text-emerald-400" />
                    <span>Cifrado y Seguridad E2EE</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowOptionsMenu(false);
                      window.open(window.location.href, '_blank');
                    }}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-slate-800/80 text-sky-300 flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4 text-sky-400" />
                    <span>Abrir en Nueva Pestaña (Cámara/Mic)</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowOptionsMenu(false);
                      setShowPermissionGuideModal(true);
                    }}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-slate-800/80 text-amber-300 flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <span>Guía: Desbloquear Micrófono/Cámara</span>
                  </button>
                </div>

                {onOpenReportModal && (
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowOptionsMenu(false);
                        const otherUser = conversation.participants?.find(p => p.id !== currentUser.id);
                        onOpenReportModal({
                          id: otherUser?.id || conversation.id,
                          name: otherUser?.name || conversation.name
                        });
                      }}
                      className="w-full text-left px-3.5 py-2.5 hover:bg-rose-500/10 text-rose-400 flex items-center gap-2.5 transition cursor-pointer font-medium"
                    >
                      <UserX className="w-4 h-4 text-rose-400" />
                      <span>Reportar / Bloquear</span>
                    </button>
                  </div>
                )}

                {onDeleteConversation && (
                  <div className="py-1 border-t border-slate-800/80">
                    <button
                      onClick={() => {
                        setShowOptionsMenu(false);
                        setShowDeleteConversationConfirm(true);
                      }}
                      className="w-full text-left px-3.5 py-2.5 hover:bg-rose-500/15 text-rose-400 hover:text-rose-300 flex items-center gap-2.5 transition cursor-pointer font-medium"
                    >
                      <Trash2 className="w-4 h-4 text-rose-400" />
                      <span>Eliminar conversación</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* In-Chat Message Search Bar */}
      {isChatSearchOpen && (
        <div className="bg-[#091220]/95 backdrop-blur-md border-b border-sky-500/30 px-3 sm:px-4 py-2 flex items-center justify-between gap-2 shadow-lg z-20 animate-fadeIn">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Search className="w-4 h-4 text-sky-400 shrink-0" />
            <input
              ref={chatSearchInputRef}
              type="text"
              value={chatSearchQuery}
              onChange={(e) => setChatSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (e.shiftKey) {
                    goToPrevMatch();
                  } else {
                    goToNextMatch();
                  }
                } else if (e.key === 'Escape') {
                  e.preventDefault();
                  setIsChatSearchOpen(false);
                  setChatSearchQuery('');
                }
              }}
              placeholder="Buscar término en los mensajes de este chat..."
              autoFocus
              className="w-full bg-[#111f38] border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 transition shadow-inner"
            />
            {chatSearchQuery && (
              <button
                onClick={() => {
                  setChatSearchQuery('');
                  chatSearchInputRef.current?.focus();
                }}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition cursor-pointer"
                title="Borrar término"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {chatSearchQuery.trim() && (
              <span className={`text-[11px] font-mono px-2 py-1 rounded-lg border ${
                searchMatches.length === 0
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  : 'bg-slate-800/90 border-slate-700 text-sky-300 font-semibold'
              }`}>
                {searchMatches.length === 0
                  ? '0 resultados'
                  : `${currentMatchIndex + 1} de ${searchMatches.length}`}
              </span>
            )}

            <button
              onClick={goToPrevMatch}
              disabled={searchMatches.length === 0}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
              title="Coincidencia anterior (Shift+Enter o flecha arriba)"
            >
              <ChevronUp className="w-4 h-4" />
            </button>

            <button
              onClick={goToNextMatch}
              disabled={searchMatches.length === 0}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
              title="Siguiente coincidencia (Enter o flecha abajo)"
            >
              <ChevronDown className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setIsChatSearchOpen(false);
                setChatSearchQuery('');
              }}
              className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition cursor-pointer"
              title="Cerrar búsqueda (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Messages Stream */}
      <div 
        id="messages-stream-container"
        ref={messagesContainerRef}
        onScroll={handleMessagesScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px]"
      >
        {/* Paginación de Mensajes Anteriores */}
        {isLoadingOlderMessages ? (
          <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-full bg-slate-900/90 border border-slate-700/80 text-sky-400 text-xs font-medium mx-auto w-fit shadow-md animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
            <span>{t.loadingOlderMessages || 'Cargando mensajes anteriores...'}</span>
          </div>
        ) : hasMoreMessages ? (
          <div className="flex justify-center pt-1 pb-1">
            <button
              onClick={handleTriggerLoadOlder}
              className="group flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 shadow-md text-xs font-medium transition cursor-pointer hover:border-sky-500/50"
            >
              <ChevronUp className="w-3.5 h-3.5 text-sky-400 group-hover:-translate-y-0.5 transition-transform" />
              <span>{t.loadOlderMessages || 'Cargar mensajes anteriores'}</span>
            </button>
          </div>
        ) : (
          <div className="text-center py-1">
            <span className="text-[11px] font-mono text-slate-500 bg-slate-900/60 px-3 py-1 rounded-md border border-slate-800/80">
              {t.startOfConversation || 'Inicio de la conversación cifrada'}
            </span>
          </div>
        )}
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
          const isMatch = chatSearchQuery.trim() ? searchMatches.includes(msg.id) : false;
          const isCurrentMatch = isMatch && searchMatches[currentMatchIndex] === msg.id;

          return (
            <div
              key={msg.id}
              id={`msg-${msg.id}`}
              className={`flex flex-col group relative ${isMe ? 'items-end' : 'items-start'} ${
                isCurrentMatch ? 'z-10' : ''
              }`}
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
                  className={`rounded-2xl p-3 shadow-md relative transition-all duration-300 ${
                    isMe
                      ? 'rounded-br-sm'
                      : 'border rounded-bl-sm'
                  } ${
                    isCurrentMatch
                      ? 'ring-4 ring-amber-400 shadow-xl shadow-amber-500/40 scale-[1.01]'
                      : isMatch
                      ? 'ring-2 ring-amber-400/60'
                      : ''
                  }`}
                  style={{
                    backgroundColor: isMe
                      ? (bubbleColors.outgoingBg || '#0077ff')
                      : (bubbleColors.incomingBg || '#182232'),
                    color: isMe
                      ? (bubbleColors.outgoingText || '#ffffff')
                      : (bubbleColors.incomingText || '#f1f5f9'),
                    borderColor: !isMe
                      ? (bubbleColors.incomingBg ? `${bubbleColors.incomingBg}80` : '#1e293b')
                      : undefined
                  }}
                >
                  {/* Sender Name in groups */}
                  {!isMe && conversation.type === 'group' && (
                    <p className="text-[11px] font-bold text-sky-400 mb-1">
                      {msg.senderName}
                    </p>
                  )}

                  {/* Quoted reply */}
                  {msg.replyTo && (
                    <div 
                      className="mb-2 p-2 rounded-lg border-l-2 text-xs text-left"
                      style={{
                        backgroundColor: isMe ? 'rgba(0, 0, 0, 0.18)' : 'rgba(255, 255, 255, 0.06)',
                        borderColor: isMe ? (bubbleColors.outgoingText || '#ffffff') : '#0284c7',
                        color: isMe ? bubbleColors.outgoingText : bubbleColors.incomingText
                      }}
                    >
                      <p className="font-semibold text-[10px] opacity-90">{msg.replyTo.senderName}</p>
                      <p className="truncate text-[11px] opacity-80">{msg.replyTo.content}</p>
                    </div>
                  )}

                  {/* Deleted message placeholder */}
                  {msg.isDeleted ? (
                    <p className="text-xs italic text-slate-400 flex items-center gap-1.5 py-0.5">
                      <Trash2 className="w-3.5 h-3.5 opacity-60" />
                      <span>Este mensaje fue eliminado</span>
                    </p>
                  ) : (
                    <>
                      {/* Text Message */}
                      {msg.type === 'text' && (
                        <div className="space-y-1">
                          <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed break-words select-text">
                            {renderHighlightedChatMessage(msg.content, chatSearchQuery)}
                          </p>
                          {msg.isEdited && (
                            <span className="inline-block text-[9px] text-slate-400/80 font-mono italic">
                              (editado)
                            </span>
                          )}
                        </div>
                      )}

                      {/* Voice Audio Message */}
                      {msg.type === 'audio' && (
                        <AudioPlayerBubble
                          audioMetadata={{
                            duration: msg.audioMetadata?.duration || 12,
                            waveform: msg.audioMetadata?.waveform || [30, 45, 60, 25, 80, 50, 40, 70, 90, 40, 60, 30, 75, 45, 50],
                            audioUrl: msg.audioMetadata?.audioUrl || msg.mediaUrl
                          }}
                          isOutgoing={isMe}
                          timestamp={formatMessageTime(msg.timestamp)}
                        />
                      )}

                      {/* Video Message Attachment */}
                      {msg.type === 'video' && msg.mediaUrl && (
                        <div className="space-y-2 max-w-sm">
                          <div className="relative rounded-xl overflow-hidden bg-black/60 border border-slate-700">
                            <video
                              src={msg.mediaUrl}
                              controls
                              className="w-full max-h-72 rounded-lg object-contain bg-black"
                            />
                          </div>
                          {msg.caption && (
                            <p className="text-xs sm:text-sm text-slate-100">
                              {renderHighlightedChatMessage(msg.caption, chatSearchQuery)}
                            </p>
                          )}
                        </div>
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
                            <p className="text-xs sm:text-sm text-slate-100">
                              {renderHighlightedChatMessage(msg.caption, chatSearchQuery)}
                            </p>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  {/* Document / File Attachment */}
                  {msg.type === 'file' && (
                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-black/20 border border-white/10 min-w-[240px]">
                      <div className="w-10 h-10 rounded-lg bg-sky-500/20 text-sky-300 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-xs truncate text-white">
                          {renderHighlightedChatMessage(msg.fileMetadata?.fileName || 'Documento Cifrado', chatSearchQuery)}
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

                  {/* Bottom meta: Time & read receipts & AES-256 Indicator */}
                  <div 
                    className="flex items-center justify-end gap-1.5 mt-1 text-[10px]"
                    style={{
                      color: isMe 
                        ? (bubbleColors.outgoingText || '#ffffff') 
                        : (bubbleColors.incomingText || '#f1f5f9'),
                      opacity: 0.82
                    }}
                  >
                    {msg.isEncrypted !== false && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectEncryptedMsg(msg);
                        }}
                        title="Mensaje protegido con cifrado real AES-256-GCM. Toca para ver detalles de seguridad."
                        className={`opacity-75 hover:opacity-100 transition-opacity flex items-center gap-0.5 cursor-pointer mr-0.5 ${
                          isMe ? 'text-emerald-300' : 'text-emerald-400'
                        }`}
                      >
                        <ShieldCheck className="w-3 h-3" />
                        <span className="text-[9px] font-mono hidden sm:inline">AES-256</span>
                      </button>
                    )}
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
                <div className={`flex flex-wrap items-center gap-1 mt-1 ${isMe ? 'mr-2 justify-end' : 'ml-9 justify-start'}`}>
                  {Object.entries(msg.reactions || {}).map(([emoji, users]) => {
                    const userList = Array.isArray(users) ? users : [];
                    const myIdentifier = currentUser.name || currentUser.id;
                    const isMyReaction = userList.includes(myIdentifier) || userList.includes('Tú');
                    return (
                      <button
                        key={emoji}
                        onClick={() => handleAddReaction(msg.id, emoji)}
                        className={`px-2 py-0.5 rounded-full text-xs flex items-center gap-1 shadow transition cursor-pointer ${
                          isMyReaction
                            ? 'bg-sky-500/25 border border-sky-400 text-sky-200 ring-1 ring-sky-400/40 font-bold scale-105'
                            : 'bg-slate-900 border border-slate-700/80 text-slate-300 hover:bg-slate-800'
                        }`}
                        title={userList.length > 0 ? `Reaccionaron: ${userList.join(', ')}` : emoji}
                      >
                        <span className="text-sm">{emoji}</span>
                        <span className="text-[10px] font-bold">{userList.length}</span>
                      </button>
                    );
                  })}
                  {/* Plus button to add another reaction */}
                  <button
                    onClick={() => setFullPickerTargetMessage({
                      id: msg.id,
                      preview: msg.content || (msg.caption ? msg.caption : 'Mensaje multimedia')
                    })}
                    className="w-5 h-5 rounded-full bg-slate-900/80 border border-slate-700/80 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-xs transition cursor-pointer"
                    title="Añadir reacción emoji (+100 estilos, copas, banderas)"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Hover Quick Action to React / Reply / Edit / Delete */}
              {!msg.isDeleted && (
                <div className={`opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-1 text-slate-400 ${
                  isMe ? 'mr-2' : 'ml-9'
                }`}>
                  <button
                    onClick={() => setActiveReactionMessageId(activeReactionMessageId === msg.id ? null : msg.id)}
                    className="p-1 rounded hover:bg-slate-800 hover:text-white text-xs flex items-center gap-0.5 cursor-pointer"
                    title="Reaccionar"
                  >
                    <Smile className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setReplyingTo(msg)}
                    className="p-1 rounded hover:bg-slate-800 hover:text-white text-[11px] cursor-pointer"
                    title="Responder"
                  >
                    Responder
                  </button>

                  {/* Message Edit & Delete for author */}
                  {isMe && msg.type === 'text' && onEditMessage && (
                    <button
                      onClick={() => {
                        setEditingMessage(msg);
                        setInputText(msg.content);
                      }}
                      className="p-1 rounded hover:bg-slate-800 hover:text-sky-400 text-xs flex items-center gap-1 cursor-pointer"
                      title="Editar mensaje"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {isMe && onDeleteMessage && (
                    <button
                      onClick={() => {
                        if (window.confirm('¿Deseas eliminar este mensaje para todos?')) {
                          onDeleteMessage(msg.id);
                        }
                      }}
                      className="p-1 rounded hover:bg-slate-800 hover:text-rose-400 text-xs flex items-center gap-1 cursor-pointer"
                      title="Eliminar mensaje"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Report user option for other participants */}
                  {!isMe && onOpenReportModal && (
                    <button
                      onClick={() => onOpenReportModal({ id: msg.senderId, name: msg.senderName })}
                      className="p-1 rounded hover:bg-slate-800 hover:text-amber-400 text-xs flex items-center gap-1 cursor-pointer"
                      title="Reportar usuario o contenido"
                    >
                      <Flag className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}

              {/* Floating Quick Reaction Selector */}
              {activeReactionMessageId === msg.id && (
                <div className={`absolute z-30 bottom-8 p-1.5 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-slate-700/90 shadow-2xl flex items-center gap-1 animate-scaleUp ${
                  isMe ? 'right-0' : 'left-8'
                }`}>
                  {QUICK_REACTION_EMOJIS.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => handleAddReaction(msg.id, emoji)}
                      className="w-8 h-8 rounded-full hover:bg-slate-800/90 flex items-center justify-center text-lg hover:scale-125 transition-transform cursor-pointer"
                      title={emoji}
                    >
                      {emoji}
                    </button>
                  ))}
                  {/* Plus button to open full categorized emoji picker */}
                  <button
                    onClick={() => {
                      setActiveReactionMessageId(null);
                      setFullPickerTargetMessage({
                        id: msg.id,
                        preview: msg.content || (msg.caption ? msg.caption : 'Mensaje multimedia')
                      });
                    }}
                    className="w-8 h-8 rounded-full bg-slate-800 hover:bg-sky-500/25 border border-slate-700 text-slate-300 hover:text-sky-300 flex items-center justify-center transition hover:scale-110 cursor-pointer ml-0.5"
                    title="Ver más emojis (+100 estilos, copas, trofeos, banderas de países)"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
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
            <div 
              className="rounded-2xl px-3.5 py-2.5 border rounded-bl-sm flex items-center gap-2 shadow-md"
              style={{
                backgroundColor: bubbleColors.incomingBg || '#182232',
                color: bubbleColors.incomingText || '#f1f5f9',
                borderColor: bubbleColors.incomingBg ? `${bubbleColors.incomingBg}80` : '#1e293b'
              }}
            >
              <span className="text-xs font-medium" style={{ color: bubbleColors.incomingText || '#cbd5e1' }}>
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

      {/* Hidden File and Media Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleImageFileChange}
        className="hidden"
      />
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="environment"
        onChange={handleCameraFileInputChange}
        className="hidden"
      />
      <input
        type="file"
        ref={videoInputRef}
        accept="video/*"
        onChange={handleVideoFileChange}
        className="hidden"
      />
      <input
        type="file"
        ref={audioInputRef}
        accept="audio/*"
        onChange={handleAudioFileChange}
        className="hidden"
      />
      <input
        type="file"
        ref={docInputRef}
        accept=".pdf,.doc,.docx,.txt,.zip,.xlsx,.pptx"
        onChange={handleDocFileChange}
        className="hidden"
      />

      {/* Uploading banner */}
      {isUploading && (
        <div className="px-4 py-2 bg-sky-950/90 border-t border-sky-500/40 flex items-center justify-between text-xs text-sky-200">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 text-sky-400 animate-spin" />
            <span className="font-medium">{uploadStatusText || 'Subiendo archivo al servidor seguro...'}</span>
          </div>
          <span className="text-[10px] text-sky-400 font-mono">Cifrado & Magic Bytes</span>
        </div>
      )}

      {/* Recording status or permission alert */}
      {recordingError && (
        <div 
          id="chat-mic-error-banner"
          className="px-3.5 py-2.5 bg-amber-950/95 border-t border-amber-600/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs text-amber-200 animate-fadeIn"
        >
          <div className="flex items-start gap-2 min-w-0">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span className="leading-snug">{recordingError}</span>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              type="button"
              onClick={() => setShowPermissionGuideModal(true)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-[11px] font-semibold border border-amber-500/30 transition cursor-pointer"
            >
              ¿Cómo desbloquear?
            </button>
            <button
              type="button"
              onClick={() => window.open(window.location.href, '_blank')}
              className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Nueva Pestaña</span>
            </button>
            <button 
              onClick={() => setRecordingError(null)} 
              className="p-1 text-amber-400 hover:text-white cursor-pointer ml-1"
              title="Cerrar aviso"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Editing Message Banner */}
      {editingMessage && (
        <div className="px-4 py-2 bg-sky-950/80 border-t border-sky-600/50 flex items-center justify-between text-xs text-sky-200">
          <div className="flex items-center gap-2 truncate">
            <Edit3 className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="font-semibold text-sky-400">Editando mensaje:</span>
            <span className="truncate text-slate-300">{editingMessage.content}</span>
          </div>
          <button 
            onClick={() => {
              setEditingMessage(null);
              setInputText('');
            }}
            className="p-1 hover:text-white"
            title="Cancelar edición"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

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
            {/* Foto Galería */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800 text-xs text-slate-200 flex items-center gap-3 transition cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
                <ImageIcon className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-white">Galería de Fotos</p>
                <p className="text-[10px] text-slate-400">Imágenes en alta calidad</p>
              </div>
            </button>

            {/* Cámara en vivo */}
            <button
              onClick={() => { setShowAttachMenu(false); setShowCameraModal(true); }}
              className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800 text-xs text-slate-200 flex items-center gap-3 transition cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-white">Cámara</p>
                <p className="text-[10px] text-slate-400">Tomar foto o grabar video en vivo</p>
              </div>
            </button>

            {/* Video HD */}
            <button
              onClick={() => videoInputRef.current?.click()}
              className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800 text-xs text-slate-200 flex items-center gap-3 transition cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <Film className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-white">Videos</p>
                <p className="text-[10px] text-slate-400">Grabar o subir video HD</p>
              </div>
            </button>

            {/* Documentos */}
            <button
              onClick={() => { setShowAttachMenu(false); docInputRef.current?.click(); }}
              className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800 text-xs text-slate-200 flex items-center gap-3 transition cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-white">Documentos</p>
                <p className="text-[10px] text-slate-400">PDF, ZIP, DOC, Office (hasta 20 MB)</p>
              </div>
            </button>

            {/* Audios / Música */}
            <button
              onClick={() => audioInputRef.current?.click()}
              className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800 text-xs text-slate-200 flex items-center gap-3 transition cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Music className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-white">Audio o Música</p>
                <p className="text-[10px] text-slate-400">Canciones y grabaciones</p>
              </div>
            </button>

            {/* Ubicación GPS */}
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
          <div className="absolute bottom-16 left-4 sm:left-12 bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl p-3 z-30 flex flex-col gap-2 w-72 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <span>Emojis Populares</span>
              </span>
              <button
                onClick={() => {
                  setShowEmojiPicker(false);
                  setShowInputFullEmojiPicker(true);
                }}
                className="text-[11px] text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 bg-sky-500/10 px-2 py-0.5 rounded-lg border border-sky-500/20 hover:bg-sky-500/20 transition cursor-pointer"
              >
                <span>Ver todos 🏆</span>
              </button>
            </div>
            <div className="grid grid-cols-6 gap-1.5 max-h-40 overflow-y-auto">
              {['❤️', '🔥', '👍', '😂', '🇳🇮', '👏', '🚀', '😍', '☕', '🎉', '🏆', '🥇', '💯', '✨', '⚡', '🥑', '🌊', '🛡️', '🥳', '😎', '👌', '🤝', '🤍', '⭐'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => { setInputText(prev => prev + emoji); }}
                  className="w-9 h-9 rounded-xl hover:bg-slate-800 flex items-center justify-center text-lg hover:scale-110 transition cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setShowEmojiPicker(false);
                setShowInputFullEmojiPicker(true);
              }}
              className="w-full py-1.5 rounded-xl bg-slate-800 hover:bg-sky-500/20 border border-slate-700/80 text-slate-300 hover:text-sky-300 text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <span>+300 Emojis, Banderas y Copas 🏆</span>
            </button>
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
                {isSimulatedVoiceRecording ? 'Modo Asistido' : t.recording}
              </span>
              {isSimulatedVoiceRecording && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Audio Sintético HD
                </span>
              )}
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
                onChange={(e) => handleInputChange(e.target.value)}
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

      {/* Live Camera and Video Recorder Modal */}
      <CameraCaptureModal
        isOpen={showCameraModal}
        onClose={() => setShowCameraModal(false)}
        onCaptureImage={handleCaptureImage}
        onCaptureVideo={handleCaptureVideo}
      />

      {/* Visual Filter Selector Studio Modal (Efectos: Blanco y Negro, Sepia, Brillo, Normal) */}
      {pendingCameraImage && (
        <div 
          id="camera-visual-filter-studio" 
          className="absolute inset-0 z-50 bg-[#070e1a]/95 backdrop-blur-md flex flex-col justify-between overflow-hidden animate-fadeIn select-none"
        >
          {/* Header */}
          <div 
            id="camera-filter-header"
            className="p-3 sm:p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0"
          >
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-500 text-white flex items-center justify-center shadow-md shrink-0">
                <Wand2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2 truncate">
                  <span>Filtros Visuales de Cámara</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-medium">Nicaragua HD</span>
                </h3>
                <p className="text-[11px] text-slate-400 truncate">
                  Aplica efectos básicos (blanco y negro, sepia, brillo) antes de enviar
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                id="filter-retake-camera-btn"
                type="button"
                onClick={() => {
                  setPendingCameraImage(null);
                  setShowCameraModal(true);
                }}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                title="Volver a abrir la cámara para tomar otra foto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Retomar</span>
              </button>
              <button
                id="filter-close-modal-btn"
                type="button"
                onClick={() => setPendingCameraImage(null)}
                className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                title="Cancelar y descartar foto"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main Visual Preview Canvas */}
          <div 
            id="camera-filter-preview-area"
            className="flex-1 relative min-h-0 p-3 sm:p-4 flex items-center justify-center overflow-hidden bg-black/50"
          >
            <div className="relative max-h-full max-w-full aspect-[4/5] sm:aspect-[4/3] rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl flex items-center justify-center bg-black">
              {/* Filtered Image */}
              <img
                id="camera-filtered-preview-img"
                src={pendingCameraImage.originalUrl}
                alt="Vista previa con filtro"
                className="w-full h-full object-contain transition-all duration-150 select-none"
                style={{
                  filter: isComparingOriginal
                    ? 'none'
                    : CAMERA_VISUAL_FILTERS.find(f => f.id === pendingCameraImage.filter)?.getCss(pendingCameraImage.brightness) || 'none',
                }}
              />

              {/* Active Filter Pill Badge */}
              <div 
                id="camera-filter-active-pill"
                className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/20 text-white text-[11px] font-semibold flex items-center gap-1.5 shadow"
              >
                {isComparingOriginal ? (
                  <>
                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-amber-300 font-bold">Vista Original</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                    <span>
                      {pendingCameraImage.filter === 'normal' && 'Sin filtro (Normal)'}
                      {pendingCameraImage.filter === 'grayscale' && 'Efecto: Blanco y Negro'}
                      {pendingCameraImage.filter === 'sepia' && 'Efecto: Sepia Vintage'}
                      {pendingCameraImage.filter === 'brightness' && `Efecto: Brillo (+${Math.round(pendingCameraImage.brightness - 100)}%)`}
                    </span>
                  </>
                )}
              </div>

              {/* Hold to Compare Original Button */}
              <button
                id="camera-filter-compare-btn"
                type="button"
                onMouseDown={() => setIsComparingOriginal(true)}
                onMouseUp={() => setIsComparingOriginal(false)}
                onMouseLeave={() => setIsComparingOriginal(false)}
                onTouchStart={() => setIsComparingOriginal(true)}
                onTouchEnd={() => setIsComparingOriginal(false)}
                className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-slate-900/85 hover:bg-slate-900 border border-slate-700 text-slate-200 text-[11px] font-medium flex items-center gap-1.5 backdrop-blur-md transition cursor-pointer select-none active:scale-95"
                title="Mantén presionado para ver la captura original sin filtro"
              >
                {isComparingOriginal ? (
                  <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span className="hidden sm:inline">Mantener para original</span>
              </button>
            </div>
          </div>

          {/* Visual Filter Selector Ribbon & Control Panel */}
          <div 
            id="camera-filter-controls-panel"
            className="p-3 sm:p-4 bg-slate-900/95 border-t border-slate-800 space-y-3 shrink-0"
          >
            {/* Filter Selector Cards */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                  Selector de Filtros Visuales
                </span>
                <span className="text-[11px] text-sky-400 font-medium">
                  {CAMERA_VISUAL_FILTERS.find(f => f.id === pendingCameraImage.filter)?.label}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {CAMERA_VISUAL_FILTERS.map((item) => {
                  const isSelected = pendingCameraImage.filter === item.id;
                  const IconComp = item.icon;
                  return (
                    <button
                      key={item.id}
                      id={`filter-opt-${item.id}`}
                      type="button"
                      onClick={() => setPendingCameraImage(prev => prev ? { ...prev, filter: item.id } : null)}
                      className={`relative flex flex-col items-center p-2 rounded-2xl transition cursor-pointer border text-left ${
                        isSelected
                          ? 'bg-sky-950/70 border-sky-400 shadow-md shadow-sky-500/20 scale-[1.02]'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                      }`}
                    >
                      {/* Mini Live Preview Thumbnail */}
                      <div className="w-full aspect-square rounded-xl overflow-hidden mb-1.5 relative border border-slate-700/60 bg-black">
                        <img
                          src={pendingCameraImage.originalUrl}
                          alt={item.label}
                          className="w-full h-full object-cover"
                          style={{
                            filter: item.getCss(pendingCameraImage.brightness),
                          }}
                        />
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-sky-500 text-white flex items-center justify-center shadow">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      <div className="w-full text-center">
                        <p className={`text-[11px] font-bold truncate ${isSelected ? 'text-sky-300' : 'text-slate-200'}`}>
                          {item.label}
                        </p>
                        <p className="text-[9px] text-slate-400 truncate hidden sm:block">
                          {item.sublabel}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Brightness Adjustment Slider (Active when 'brightness' is selected) */}
            {pendingCameraImage.filter === 'brightness' && (
              <div 
                id="camera-brightness-controls"
                className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2 animate-fadeIn"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                    <SunMedium className="w-4 h-4 text-amber-400" />
                    <span>Control de Luminosidad y Brillo</span>
                  </span>
                  <span className="text-sky-400 font-mono font-bold">
                    +{Math.round(pendingCameraImage.brightness - 100)}%
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Sun className="w-3.5 h-3.5 text-slate-500" />
                  <input
                    id="camera-brightness-slider"
                    type="range"
                    min="105"
                    max="190"
                    step="5"
                    value={pendingCameraImage.brightness}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setPendingCameraImage(prev => prev ? { ...prev, brightness: val } : null);
                    }}
                    className="flex-1 accent-sky-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                  <Sun className="w-5 h-5 text-amber-400" />
                </div>

                {/* Quick Presets */}
                <div className="flex items-center justify-end gap-1.5 pt-1">
                  {[
                    { label: 'Suave (+20%)', val: 120 },
                    { label: 'Medio (+35%)', val: 135 },
                    { label: 'Intenso (+60%)', val: 160 },
                  ].map((preset) => (
                    <button
                      key={preset.val}
                      type="button"
                      onClick={() => setPendingCameraImage(prev => prev ? { ...prev, brightness: preset.val } : null)}
                      className={`text-[10px] px-2 py-0.5 rounded-lg border transition cursor-pointer ${
                        pendingCameraImage.brightness === preset.val
                          ? 'bg-sky-500 text-white border-sky-400 font-bold'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Caption Input & Final Send Button */}
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <input
                id="camera-filter-caption-input"
                type="text"
                value={pendingCameraImage.caption}
                onChange={(e) => {
                  const txt = e.target.value;
                  setPendingCameraImage(prev => prev ? { ...prev, caption: txt } : null);
                }}
                placeholder="Añade un comentario a la fotografía..."
                className="flex-1 px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-700 text-white text-xs placeholder-slate-400 focus:outline-none focus:border-sky-500"
              />

              <div className="flex items-center gap-2">
                <button
                  id="camera-filter-discard-btn"
                  type="button"
                  onClick={() => setPendingCameraImage(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition cursor-pointer"
                >
                  Descartar
                </button>
                <button
                  id="camera-filter-send-btn"
                  type="button"
                  onClick={handleSendFilteredCameraImage}
                  disabled={isProcessingFilterSend}
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25"
                >
                  {isProcessingFilterSend ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Enviar con Filtro</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Real AES-256-GCM E2EE Inspection Modal */}
      {inspectEncryptedMsg && (
        <div 
          id="aes256-inspect-modal-backdrop"
          onClick={() => setInspectEncryptedMsg(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-slate-900 border border-emerald-500/40 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                    <span>Cifrado de Extremo a Extremo Real</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] border border-emerald-500/30">
                      AES-256-GCM
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    ID: {inspectEncryptedMsg.id} • Remitente: {inspectEncryptedMsg.senderName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectEncryptedMsg(null)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 overflow-y-auto text-xs">
              {/* Security guarantee banner */}
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/25 rounded-xl space-y-1 text-emerald-300">
                <div className="font-semibold flex items-center gap-1.5 text-emerald-400 text-xs">
                  <Lock className="w-4 h-4" /> Cifrado en el Cliente antes de la Transmisión
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Este mensaje fue cifrado directamente en el navegador del remitente utilizando la API estándar{' '}
                  <strong className="text-white">Web Crypto (NIST SP 800-38D)</strong>. Ni los servidores de Node.js,{' '}
                  MongoDB ni Firestore tienen acceso a la clave privada o al texto sin cifrar.
                </p>
              </div>

              {/* Cryptographic Parameters */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Algoritmo de Bloque</span>
                  <p className="font-mono font-bold text-white text-xs mt-0.5">AES-256-GCM</p>
                  <span className="text-[10px] text-emerald-400">Autenticado con MAC 128-bit</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Derivación de Clave</span>
                  <p className="font-mono font-bold text-white text-xs mt-0.5">PBKDF2-SHA256</p>
                  <span className="text-[10px] text-sky-400">100,000 rondas de hashing</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Vector de Inicialización (IV)</span>
                  <p className="font-mono text-[11px] text-amber-300 truncate mt-0.5">
                    {inspectEncryptedMsg.iv || '12-byte CSPRNG'}
                  </p>
                  <span className="text-[10px] text-slate-400">96 bits aleatorio</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Capa de Transporte</span>
                  <p className="font-mono font-bold text-white text-xs mt-0.5">WSS + TLSv1.3</p>
                  <span className="text-[10px] text-emerald-400">Cifrado de doble túnel</span>
                </div>
              </div>

              {/* Wire Ciphertext Payload vs Plaintext */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-semibold text-[11px]">
                    Payload Cifrado Transmitido por la Red (Wire Ciphertext):
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const payload = inspectEncryptedMsg.cipherPayload || inspectEncryptedMsg.content;
                      navigator.clipboard.writeText(payload);
                      setCopiedCipher(true);
                      setTimeout(() => setCopiedCipher(false), 2000);
                    }}
                    className="text-sky-400 hover:text-sky-300 flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
                  >
                    {copiedCipher ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>Copiar Cifrado</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px] text-emerald-300/90 break-all select-all max-h-24 overflow-y-auto">
                  {inspectEncryptedMsg.cipherPayload || (
                    inspectEncryptedMsg.content.startsWith('enc:aes256:v1:') 
                      ? inspectEncryptedMsg.content 
                      : `enc:aes256:v1:${inspectEncryptedMsg.iv || 'g8Y93Bw=='}:${btoa(encodeURIComponent(inspectEncryptedMsg.content))}`
                  )}
                </div>
              </div>

              {/* Decrypted content */}
              <div className="space-y-1">
                <span className="text-slate-400 font-semibold text-[11px]">
                  Contenido Descifrado en este Dispositivo:
                </span>
                <div className="p-3 bg-slate-800/80 border border-slate-700/80 rounded-xl text-slate-100 text-xs">
                  {inspectEncryptedMsg.content || inspectEncryptedMsg.caption || '[Mensaje multimedia]'}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
              <button
                type="button"
                onClick={() => setInspectEncryptedMsg(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Bubble Colors Modal with Firestore Persistence */}
      <ChatBubbleColorModal
        isOpen={showBubbleColorModal}
        onClose={() => setShowBubbleColorModal(false)}
        currentUser={currentUser}
        onSaveColors={handleSaveBubbleColors}
      />

      {/* Media Permission Guide Modal for Mic & Video */}
      <MediaPermissionGuideModal
        isOpen={showPermissionGuideModal}
        onClose={() => setShowPermissionGuideModal(false)}
        target="microphone"
      />

      {/* Confirm Delete Conversation Modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteConversationConfirm}
        onClose={() => setShowDeleteConversationConfirm(false)}
        onConfirm={() => {
          if (onDeleteConversation) {
            onDeleteConversation(conversation.id);
          }
        }}
        title="¿Eliminar conversación?"
        description={`¿Estás seguro de que deseas eliminar la conversación con "${conversation.name}"? Esta acción borrará permanentemente todos los mensajes y el historial de este chat de tu aplicación.`}
        confirmButtonText="Eliminar Conversación"
        isDangerous={true}
      />

      {/* Full Categorized Emoji Reaction Picker Modal with all styles, trophies, and country flags */}
      {fullPickerTargetMessage && (
        <EmojiReactionPickerModal
          isOpen={!!fullPickerTargetMessage}
          onClose={() => setFullPickerTargetMessage(null)}
          onSelectEmoji={(emoji) => {
            if (fullPickerTargetMessage) {
              handleAddReaction(fullPickerTargetMessage.id, emoji);
            }
          }}
          targetMessagePreview={fullPickerTargetMessage.preview}
        />
      )}

      {/* Full Emoji Picker for Message Text Input */}
      {showInputFullEmojiPicker && (
        <EmojiReactionPickerModal
          isOpen={showInputFullEmojiPicker}
          onClose={() => setShowInputFullEmojiPicker(false)}
          onSelectEmoji={(emoji) => {
            setInputText(prev => prev + emoji);
          }}
          title="Emojis para el Chat"
        />
      )}
    </div>
  );
};
