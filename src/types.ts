export type MessageType = 'text' | 'image' | 'audio' | 'video' | 'file' | 'location' | 'system';

export type UserStatus = 'online' | 'offline' | 'away' | 'busy' | 'recording' | 'typing';

export type VerificationType = 'biometric' | 'cedula' | 'official' | 'business';

export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  status: UserStatus;
  lastSeen?: string;
  isVerified: boolean;
  verificationType?: VerificationType;
  phone: string;
  email: string;
  bio: string;
  location?: string;
  biometricRegistered: boolean;
  emailVerified: boolean;
  publicKeyFingerprint: string;
}

export interface AudioMetadata {
  duration: number; // in seconds
  waveform: number[];
  audioUrl?: string;
}

export interface FileMetadata {
  fileName: string;
  fileSize: string;
  fileType: string;
  downloadUrl?: string;
}

export interface LocationMetadata {
  latitude: number;
  longitude: number;
  placeName: string;
  address: string;
  isLive: boolean;
  liveExpiresAt?: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  type: MessageType;
  content: string;
  timestamp: number;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  isEncrypted: boolean;
  reactions?: Record<string, string[]>; // emoji -> [userNames/Ids]
  replyTo?: {
    id: string;
    senderName: string;
    content: string;
    type: MessageType;
  };
  audioMetadata?: AudioMetadata;
  fileMetadata?: FileMetadata;
  locationMetadata?: LocationMetadata;
  mediaUrl?: string;
  caption?: string;
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group' | 'channel';
  name: string;
  avatar: string;
  isVerified: boolean;
  verificationType?: VerificationType;
  participants: User[];
  unreadCount: number;
  lastMessage?: Message;
  isPinned?: boolean;
  isMuted?: boolean;
  e2eeKeyFingerprint: string;
  draft?: string;
  description?: string;
}

export type LanguageCode = 'es' | 'en' | 'miskito' | 'pt';

export type AppTheme = 'dark' | 'light' | 'nica-midnight';

export type SocialPlatform = 'youtube' | 'tiktok' | 'facebook' | 'instagram' | 'x' | 'spotify';
