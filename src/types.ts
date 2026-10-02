export type MessageType = 'text' | 'image' | 'audio' | 'video' | 'file' | 'location' | 'system';

export type UserStatus = 'online' | 'offline' | 'away' | 'busy' | 'recording' | 'typing';

export type VerificationType = 'biometric' | 'cedula' | 'official' | 'business' | 'phone' | 'email';

export interface BubbleColors {
  outgoingBg: string;       // Color de fondo para mensajes salientes (ej. '#0077ff')
  outgoingText: string;     // Color de texto para mensajes salientes (ej. '#ffffff')
  incomingBg: string;       // Color de fondo para mensajes entrantes (ej. '#182232')
  incomingText: string;     // Color de texto para mensajes entrantes (ej. '#f1f5f9')
  presetId?: string;        // ID del preset seleccionado ('default', 'emerald', 'violet', etc.)
}

export type UserPlanType = 'free' | 'premium' | 'business';

export interface BusinessProduct {
  id: string;
  title: string;
  priceCordobas: number;
  description: string;
  imageUrl: string;
  category?: string;
  inStock: boolean;
}

export interface BusinessProfile {
  isBusiness: boolean;
  businessName: string;
  category: string;
  hours: string;
  department: string;
  address: string;
  whatsapp?: string;
  website?: string;
  catalog: BusinessProduct[];
  aiBotEnabled: boolean;
  aiBotWelcomeMessage?: string;
  aiBotPrompt?: string;
  aiBotFaq?: { question: string; answer: string }[];
}

export interface StorageBreakdown {
  totalMb: number;
  usedMb: number;
  photosMb: number;
  videosMb: number;
  audiosMb: number;
  documentsMb: number;
}

export interface SponsoredAd {
  id: string;
  businessName: string;
  businessCategory: string;
  businessAvatar: string;
  title: string;
  description: string;
  imageUrl: string;
  ctaText: string;
  phone: string;
  department: string;
  discountBadge?: string;
}

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
  bubbleColors?: BubbleColors;
  deletedContactIds?: string[];
  plan?: UserPlanType;
  businessProfile?: BusinessProfile;
  storageQuota?: StorageBreakdown;
  verificationStatus?: 'none' | 'pending' | 'verified';
  badgeType?: 'star_premium' | 'business_verified' | 'citizen_verified';
  points?: number;
  premiumExpiresAt?: number;
  pointsTrialActive?: boolean;
  depositTransactions?: DepositTransaction[];
}

export interface DepositTransaction {
  id: string;
  method: 'banpro_billetera' | 'lafise_cuenta';
  referenceNumber: string;
  amountCordobas: number;
  timestamp: number;
  status: 'approved' | 'pending' | 'pending_verification' | 'rejected';
  planId: string;
  voucherImage?: string;
  voucherNotes?: string;
  notes?: string;
  verifiedAt?: number;
  verifiedBy?: string;
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
  isEdited?: boolean;
  editedAt?: number;
  isDeleted?: boolean;
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
  iv?: string;
  algorithm?: string;
  cipherPayload?: string;
}

export interface StoryViewer {
  userId: string;
  userName: string;
  userAvatar: string;
  timestamp: number;
}

export interface UserStatusStory {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'text';
  audioTrack?: {
    title: string;
    artist?: string;
    url?: string;
  };
  text?: string;
  bgColor?: string;
  timestamp: number;
  expiresAt: number;
  viewsCount: number;
  viewers?: StoryViewer[];
  renewedCount?: number;
  autoRenew?: boolean;
}

export interface ReportTicket {
  id: string;
  reportedUserId: string;
  reporterUserId: string;
  reason: string;
  details: string;
  timestamp: number;
  status: 'pending' | 'resolved';
}

export interface SavedContact {
  id: string;
  userId: string;
  contactUserId: string;
  name: string;
  phone: string;
  email: string;
  avatar?: string;
  bio?: string;
  conversationId?: string;
  createdAt: number;
}

export interface BlockedContact {
  id: string;
  userId: string;
  blockedUserId: string;
  name: string;
  phone?: string;
  avatar?: string;
  reason?: string;
  blockedAt: number;
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group' | 'channel' | 'community';
  name: string;
  avatar: string;
  isVerified: boolean;
  verificationType?: VerificationType;
  participants: User[];
  participantIds?: string[];
  unreadCount: number;
  lastMessage?: Message;
  isPinned?: boolean;
  isMuted?: boolean;
  isBlocked?: boolean;
  e2eeKeyFingerprint: string;
  draft?: string;
  description?: string;
  membersCount?: number;
  category?: string;
}

export type LanguageCode = 'es' | 'en' | 'miskito' | 'pt';

export type AppTheme = 'dark' | 'light' | 'nica-midnight';

export type SocialPlatform = 'youtube' | 'tiktok' | 'facebook' | 'instagram' | 'x' | 'spotify';

export interface UserSession {
  id: string;
  userId: string;
  deviceName: string;
  ipAddress: string;
  userAgent: string;
  createdAt: number;
  lastActiveAt: number;
  isCurrent: boolean;
}

export interface SecurityReport {
  httpsEnabled: boolean;
  tlsProtocol: string;
  hstsActive: boolean;
  jwtAlgorithm: string;
  passwordHashing: string;
  rateLimiterActive: boolean;
  antiSpamProtection: string;
  fileValidation: string;
  fileSizeLimits: {
    videos: string;
    documents: string;
    audios: string;
    images: string;
  };
  privateFileStorage: string;
  activeSessionsCount: number;
  framePermissions: string[];
}
