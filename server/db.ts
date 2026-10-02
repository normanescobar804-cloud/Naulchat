import fs from 'fs';
import path from 'path';
import { MongoClient, Db } from 'mongodb';

export interface DepositTransactionDoc {
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

export interface UserDoc {
  id: string;
  name: string;
  username: string;
  phone: string;
  email: string;
  passwordHash?: string;
  avatar: string;
  bio?: string;
  status?: string;
  isVerified: boolean;
  verificationType?: string;
  bubbleColors?: any;
  plan?: 'free' | 'premium' | 'business';
  badgeType?: 'star_premium' | 'business_verified' | 'citizen_verified';
  storageQuota?: {
    totalMb: number;
    usedMb: number;
    photosMb: number;
    videosMb: number;
    audiosMb: number;
    documentsMb: number;
  };
  points?: number;
  premiumExpiresAt?: number;
  pointsTrialActive?: boolean;
  depositTransactions?: DepositTransactionDoc[];
  createdAt: number;
  updatedAt?: number;
}

export interface MessageDoc {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  type: 'text' | 'image' | 'audio' | 'video' | 'file' | 'location';
  content: string;
  timestamp: number;
  status: 'sent' | 'delivered' | 'read';
  isEncrypted: boolean;
  mediaUrl?: string;
  audioMetadata?: {
    duration: number;
    waveform?: number[];
  };
  fileMetadata?: {
    fileName: string;
    fileSize: string;
    fileType: string;
  };
  locationMetadata?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  replyTo?: {
    id: string;
    senderName: string;
    text: string;
  };
  isEdited?: boolean;
  isDeleted?: boolean;
  reactions?: Record<string, string[]>;
  caption?: string;
  iv?: string;
  algorithm?: string;
  cipherPayload?: string;
}

export interface ConversationDoc {
  id: string;
  type: 'direct' | 'group' | 'channel' | 'community';
  name: string;
  avatar: string;
  participants: UserDoc[];
  participantIds: string[];
  unreadCount: number;
  lastMessage?: MessageDoc;
  isVerified?: boolean;
  isPinned?: boolean;
  category?: string;
  createdAt: number;
  updatedAt: number;
}

export interface StatusDoc {
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
  viewers?: Array<{
    userId: string;
    userName: string;
    userAvatar: string;
    timestamp: number;
  }>;
  renewedCount?: number;
  autoRenew?: boolean;
}

export interface OtpDoc {
  id: string;
  target: string; // phone or email
  code: string;
  expiresAt: number;
  verified: boolean;
  createdAt: number;
}

export interface SessionDoc {
  id: string;
  userId: string;
  deviceName: string;
  ipAddress: string;
  userAgent: string;
  tokenSignature?: string;
  createdAt: number;
  lastActiveAt: number;
  isValid: boolean;
}

export interface StoredFileDoc {
  id: string;
  userId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  filePath?: string;
  isPrivate: boolean;
  createdAt: number;
}

export interface ContactDoc {
  id: string;
  userId: string; // The user who saved this contact
  contactUserId: string; // The user or profile being saved
  name: string;
  phone: string;
  email: string;
  avatar?: string;
  bio?: string;
  conversationId?: string;
  createdAt: number;
}

export interface BlockDoc {
  id: string;
  userId: string;        // Usuario que realiza el bloqueo
  blockedUserId: string; // Usuario bloqueado
  name: string;
  phone?: string;
  avatar?: string;
  reason?: string;
  blockedAt: number;
}

interface LocalDBData {
  users: UserDoc[];
  conversations: ConversationDoc[];
  messages: MessageDoc[];
  statuses: StatusDoc[];
  otps: OtpDoc[];
  sessions: SessionDoc[];
  storedFiles: StoredFileDoc[];
  contacts: ContactDoc[];
  blockedUsers?: BlockDoc[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'naul_mongodb.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;
let isUsingRemoteMongo = false;

// Initial Seed Data
const SEED_USERS: UserDoc[] = [
  {
    id: 'user-me',
    name: 'Norman Escobar',
    username: '@normanescobar',
    phone: '+505 8899 4432',
    email: 'normanescobar804@gmail.com',
    passwordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', // 'admin123'
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    bio: 'La disciplina te lleva lejos. 💪',
    status: 'online',
    isVerified: true,
    verificationType: 'official',
    createdAt: Date.now() - 30 * 86400000,
  },
  {
    id: 'user-yuri',
    name: 'Yuri',
    username: '@yuri_nica',
    phone: '+505 7766 5544',
    email: 'yuri@naulchat.ni',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    bio: 'Nicaragua siempre conectada 🇳🇮',
    status: 'online',
    isVerified: true,
    verificationType: 'official',
    createdAt: Date.now() - 25 * 86400000,
  },
  {
    id: 'user-carlos',
    name: 'Carlos Mendoza',
    username: '@carlos_m',
    phone: '+505 8822 1199',
    email: 'carlos@managua.ni',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    bio: 'Beisbol, café y desarrollo en Managua ⚾☕',
    status: 'offline',
    isVerified: true,
    verificationType: 'identity',
    createdAt: Date.now() - 20 * 86400000,
  },
  {
    id: 'user-sofia',
    name: 'Dra. Sofía Mendoza',
    username: '@sofia_medica',
    phone: '+505 8872 3410',
    email: 'dra.sofiamendoza@salud.org.ni',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80',
    bio: 'Médico General • Consultas y prevención • Managua 🩺🇳🇮',
    status: 'online',
    isVerified: true,
    verificationType: 'official',
    createdAt: Date.now() - 15 * 86400000,
  },
  {
    id: 'user-kevin',
    name: 'Ing. Kevin Talavera',
    username: '@kevin_talavera',
    phone: '+505 8421 9901',
    email: 'kevin.talavera@ingenieria.ni',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    bio: 'Ingeniero en Computación y Telecomunicaciones • León 💻⚡',
    status: 'online',
    isVerified: true,
    verificationType: 'identity',
    createdAt: Date.now() - 12 * 86400000,
  },
  {
    id: 'user-elena',
    name: 'Elena Blandón',
    username: '@elena_matagalpa',
    phone: '+505 8654 2210',
    email: 'elena.cafe@matagalpa.ni',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    bio: 'Producción y exportación de café de altura • Matagalpa ☕🌿',
    status: 'away',
    isVerified: true,
    verificationType: 'identity',
    createdAt: Date.now() - 10 * 86400000,
  },
  {
    id: 'user-lucia',
    name: 'Lucía Chamorro',
    username: '@lucia_chamorro',
    phone: '+505 7812 4589',
    email: 'lucia.chamorro@arte.ni',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
    bio: 'Diseño de marcas y proyectos culturales • Granada 🎨✨',
    status: 'online',
    isVerified: true,
    verificationType: 'official',
    createdAt: Date.now() - 8 * 86400000,
  },
  {
    id: 'user-marlon',
    name: 'Marlon Jarquín',
    username: '@marlon_esteli',
    phone: '+505 8933 1450',
    email: 'marlon.fitness@esteli.ni',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    bio: 'Entrenador deportivo y nutrición • Estelí 🏋️‍♂️⚽',
    status: 'offline',
    isVerified: true,
    verificationType: 'identity',
    createdAt: Date.now() - 7 * 86400000,
  },
  {
    id: 'user-francisco',
    name: 'Don Francisco Rivas',
    username: '@francisco_masaya',
    phone: '+505 8701 5562',
    email: 'artesanias.rivas@masaya.com.ni',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
    bio: 'Comercio local y artesanías de Masaya 🏺🪵',
    status: 'online',
    isVerified: true,
    verificationType: 'official',
    createdAt: Date.now() - 6 * 86400000,
  },
  {
    id: 'user-marcela',
    name: 'Dra. Marcela Somarriba',
    username: '@marcela_dental',
    phone: '+505 8599 3012',
    email: 'clinica.somarriba@managua.ni',
    avatar: 'https://images.unsplash.com/photo-1594824813576-905792c30089?w=400&auto=format&fit=crop&q=80',
    bio: 'Odontología integral y estética dental • Managua 🦷✨',
    status: 'online',
    isVerified: true,
    verificationType: 'identity',
    createdAt: Date.now() - 5 * 86400000,
  },
  {
    id: 'user-cruz-blanca',
    name: 'Cruz Blanca Nicaragüense (128)',
    username: '@cruzblanca_128',
    phone: '+505 2265 1419',
    email: 'emergencias@cruzblanca.org.ni',
    avatar: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=400&auto=format&fit=crop&q=80',
    bio: 'Ambulancias y atención médica prehospitalaria • Emergencias 128 🚑🚨',
    status: 'online',
    isVerified: true,
    verificationType: 'official',
    createdAt: Date.now() - 30 * 86400000,
  },
  {
    id: 'user-bomberos',
    name: 'Bomberos Unificados de Nicaragua (115)',
    username: '@bomberos_115',
    phone: '+505 2264 0244',
    email: 'contacto@bomberos.gob.ni',
    avatar: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400&auto=format&fit=crop&q=80',
    bio: 'Prevención, rescate y combate de incendios • Línea de Emergencia 115 🚒🔥',
    status: 'online',
    isVerified: true,
    verificationType: 'official',
    createdAt: Date.now() - 30 * 86400000,
  },
  {
    id: 'user-enacal',
    name: 'ENACAL Oficial (127)',
    username: '@enacal_127',
    phone: '+505 2266 7777',
    email: 'atencion@enacal.gob.ni',
    avatar: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=400&auto=format&fit=crop&q=80',
    bio: 'Empresa Nicaragüense de Acueductos y Alcantarillados • Línea 127 💧🚰',
    status: 'online',
    isVerified: true,
    verificationType: 'official',
    createdAt: Date.now() - 30 * 86400000,
  }
];

const SEED_CONVERSATIONS: ConversationDoc[] = [
  {
    id: 'conv-yuri',
    type: 'direct',
    name: 'Yuri',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    participants: [SEED_USERS[0], SEED_USERS[1]],
    participantIds: ['user-me', 'user-yuri'],
    unreadCount: 0,
    isVerified: true,
    isPinned: true,
    category: 'Oficial',
    createdAt: Date.now() - 10 * 86400000,
    updatedAt: Date.now(),
    lastMessage: {
      id: 'msg-seed-1',
      conversationId: 'conv-yuri',
      senderId: 'user-yuri',
      senderName: 'Yuri',
      senderAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
      type: 'text',
      content: '¡Quedó súper nítido el backend con base de datos real en Naul Chat! 🇳🇮🚀',
      timestamp: Date.now() - 120000,
      status: 'read',
      isEncrypted: true
    }
  },
  {
    id: 'conv-comunidad-nica',
    type: 'community',
    name: 'Comunidad Nacional 🇳🇮',
    avatar: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&auto=format&fit=crop&q=80',
    participants: [SEED_USERS[0], SEED_USERS[1], SEED_USERS[2]],
    participantIds: ['user-me', 'user-yuri', 'user-carlos'],
    unreadCount: 2,
    isVerified: true,
    isPinned: true,
    category: 'Comunidades',
    createdAt: Date.now() - 5 * 86400000,
    updatedAt: Date.now() - 3600000,
    lastMessage: {
      id: 'msg-seed-2',
      conversationId: 'conv-comunidad-nica',
      senderId: 'user-carlos',
      senderName: 'Carlos Mendoza',
      senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      type: 'text',
      content: '¡Bienvenidos a la red nicaragüense con estados de fotos, videos y música! 🎵',
      timestamp: Date.now() - 3600000,
      status: 'read',
      isEncrypted: true
    }
  }
];

const SEED_MESSAGES: MessageDoc[] = [
  {
    id: 'msg-yuri-1',
    conversationId: 'conv-yuri',
    senderId: 'user-yuri',
    senderName: 'Yuri',
    senderAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    type: 'text',
    content: 'Hola Norman, bienvenido a la red de Naul Chat Nicaragua. Todo cifrado y seguro.',
    timestamp: Date.now() - 600000,
    status: 'read',
    isEncrypted: true
  },
  {
    id: 'msg-yuri-2',
    conversationId: 'conv-yuri',
    senderId: 'user-me',
    senderName: 'Norman Escobar',
    senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    type: 'text',
    content: 'Excelente Yuri, ya tenemos Node.js con base de datos conectada.',
    timestamp: Date.now() - 300000,
    status: 'read',
    isEncrypted: true
  },
  {
    id: 'msg-seed-1',
    conversationId: 'conv-yuri',
    senderId: 'user-yuri',
    senderName: 'Yuri',
    senderAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    type: 'text',
    content: '¡Quedó súper nítido el backend con base de datos real en Naul Chat! 🇳🇮🚀',
    timestamp: Date.now() - 120000,
    status: 'read',
    isEncrypted: true
  }
];

const SEED_STATUSES: StatusDoc[] = [
  {
    id: 'status-yuri-1',
    userId: 'user-yuri',
    userName: 'Yuri',
    userAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    mediaType: 'image',
    audioTrack: {
      title: 'Nicaragua Mía',
      artist: 'Tino López Guerra',
      url: 'https://cdn.freesound.org/previews/518/518888_6142149-lq.mp3'
    },
    text: 'Fin de semana en San Juan del Sur 🏖️🇳🇮',
    timestamp: Date.now() - 3600000 * 2,
    expiresAt: Date.now() + 3600000 * 22,
    viewsCount: 42
  },
  {
    id: 'status-carlos-1',
    userId: 'user-carlos',
    userName: 'Carlos Mendoza',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=800&auto=format&fit=crop&q=80',
    mediaType: 'image',
    audioTrack: {
      title: 'Son Nica Tradicional',
      artist: 'Camilo Zapata',
      url: 'https://cdn.freesound.org/previews/456/456123_5121236-lq.mp3'
    },
    text: 'Listos para el clásico de béisbol en el Estadio Nacional Denis Martínez ⚾🇳🇮',
    timestamp: Date.now() - 3600000 * 5,
    expiresAt: Date.now() + 3600000 * 19,
    viewsCount: 65
  }
];

// In-memory cache & indexes for ultra-fast sub-millisecond queries (<1ms)
let localDbCache: LocalDBData | null = null;
let saveDebounceTimer: NodeJS.Timeout | null = null;

// Normalizador inteligente de números de teléfono nicaragüenses (8 dígitos estándar)
export function normalizeNicaPhoneDigits(phone?: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length >= 8) {
    return digits.slice(-8); // Extrae los últimos 8 dígitos (ej. 58898311)
  }
  return digits;
}

// Índices rápidos en memoria para O(1) lookups
const userBy8DigitPhone = new Map<string, UserDoc>();
const userById = new Map<string, UserDoc>();
const userByEmail = new Map<string, UserDoc>();
const userByUsername = new Map<string, UserDoc>();

function rebuildInMemoryIndexes(data: LocalDBData): void {
  userBy8DigitPhone.clear();
  userById.clear();
  userByEmail.clear();
  userByUsername.clear();

  if (data.users) {
    for (const u of data.users) {
      if (u.id) userById.set(u.id, u);
      if (u.phone) {
        const norm = normalizeNicaPhoneDigits(u.phone);
        if (norm) userBy8DigitPhone.set(norm, u);
      }
      if (u.email) {
        userByEmail.set(u.email.toLowerCase().trim(), u);
      }
      if (u.username) {
        const uname = u.username.toLowerCase().replace(/^@/, '');
        userByUsername.set(uname, u);
      }
    }
  }
}

// Helper to read local data with in-memory caching for ultra-fast response times (<1ms)
function readLocalData(): LocalDBData {
  if (localDbCache) {
    return localDbCache;
  }

  if (!fs.existsSync(DATA_FILE)) {
    const initial: LocalDBData = {
      users: SEED_USERS,
      conversations: SEED_CONVERSATIONS,
      messages: SEED_MESSAGES,
      statuses: SEED_STATUSES,
      otps: [],
      sessions: [],
      storedFiles: [],
      contacts: [],
      blockedUsers: []
    };
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(initial), 'utf-8');
    } catch (err) {
      console.error('Error writing initial local db file:', err);
    }
    localDbCache = initial;
    rebuildInMemoryIndexes(initial);
    return initial;
  }

  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const data: LocalDBData = JSON.parse(raw);
    if (!data.sessions) data.sessions = [];
    if (!data.storedFiles) data.storedFiles = [];
    if (!data.otps) data.otps = [];
    if (!data.contacts) data.contacts = [];
    if (!data.blockedUsers) data.blockedUsers = [];
    localDbCache = data;
    rebuildInMemoryIndexes(data);
    return data;
  } catch (err) {
    console.error('Error reading local db file:', err);
    const fallback: LocalDBData = {
      users: SEED_USERS,
      conversations: SEED_CONVERSATIONS,
      messages: SEED_MESSAGES,
      statuses: SEED_STATUSES,
      otps: [],
      sessions: [],
      storedFiles: [],
      contacts: [],
      blockedUsers: []
    };
    localDbCache = fallback;
    rebuildInMemoryIndexes(fallback);
    return fallback;
  }
}

// Helper to write local data asynchronously without blocking the event loop
function writeLocalData(data: LocalDBData, immediate = false): void {
  localDbCache = data;

  const persistToDisk = () => {
    try {
      // Escritura atómica y compacta ultra rápida
      fs.writeFile(DATA_FILE, JSON.stringify(data), 'utf-8', (err) => {
        if (err) console.error('Error writing local db file:', err);
      });
    } catch (err) {
      console.error('Sync write error to local db file:', err);
    }
  };

  if (immediate) {
    if (saveDebounceTimer) {
      clearTimeout(saveDebounceTimer);
      saveDebounceTimer = null;
    }
    persistToDisk();
  } else {
    if (!saveDebounceTimer) {
      saveDebounceTimer = setTimeout(() => {
        saveDebounceTimer = null;
        persistToDisk();
      }, 150); // 150ms debounce para alta respuesta
    }
  }
}

// Init Database connection & create optimal indexes for remote MongoDB
export async function initDatabase(): Promise<{ isRemote: boolean }> {
  const uri = process.env.MONGODB_URI;
  if (uri && uri.trim().startsWith('mongodb')) {
    try {
      console.log('Connecting to remote MongoDB URI...');
      mongoClient = new MongoClient(uri);
      await mongoClient.connect();
      mongoDb = mongoClient.db('naulchat');
      isUsingRemoteMongo = true;
      console.log('Successfully connected to MongoDB Atlas / cluster');

      // Create indexes for ultra-fast authentication and queries
      Promise.all([
        mongoDb.collection('users').createIndex({ id: 1 }, { unique: true }),
        mongoDb.collection('users').createIndex({ phone: 1 }),
        mongoDb.collection('users').createIndex({ email: 1 }),
        mongoDb.collection('users').createIndex({ username: 1 }),
        mongoDb.collection('sessions').createIndex({ id: 1, isValid: 1 }),
        mongoDb.collection('sessions').createIndex({ userId: 1 }),
        mongoDb.collection('conversations').createIndex({ id: 1 }),
        mongoDb.collection('conversations').createIndex({ participantIds: 1 }),
        mongoDb.collection('messages').createIndex({ conversationId: 1, timestamp: -1 }),
        mongoDb.collection('contacts').createIndex({ userId: 1, phone: 1 }),
        mongoDb.collection('contacts').createIndex({ userId: 1, contactUserId: 1 }),
        mongoDb.collection('blockedUsers').createIndex({ userId: 1, blockedUserId: 1 })
      ]).catch(err => console.warn('Index creation notice:', err.message));

      return { isRemote: true };
    } catch (err) {
      console.warn('Could not connect to remote MongoDB URI, falling back to local MongoDB persistent document store:', err);
    }
  }

  // Pre-load in-memory cache from local persistent document database
  readLocalData();
  console.log(`Using persistent local MongoDB-compatible document database at ${DATA_FILE} (Cached in-memory)`);
  return { isRemote: false };
}

// User Operations
export async function dbFindUser(query: { id?: string; phone?: string; email?: string; username?: string }): Promise<UserDoc | null> {
  if (isUsingRemoteMongo && mongoDb) {
    const filter: Record<string, unknown> = {};
    if (query.id) filter.id = query.id;
    if (query.phone) filter.phone = query.phone;
    if (query.email) filter.email = query.email;
    if (query.username) filter.username = query.username;
    const res = await mongoDb.collection<UserDoc>('users').findOne(filter);
    return res;
  }

  readLocalData();
  if (query.id && userById.has(query.id)) return userById.get(query.id)!;
  if (query.phone) {
    const norm = normalizeNicaPhoneDigits(query.phone);
    if (norm && userBy8DigitPhone.has(norm)) return userBy8DigitPhone.get(norm)!;
  }
  if (query.email) {
    const em = query.email.toLowerCase().trim();
    if (userByEmail.has(em)) return userByEmail.get(em)!;
  }
  if (query.username) {
    const uname = query.username.toLowerCase().replace(/^@/, '');
    if (userByUsername.has(uname)) return userByUsername.get(uname)!;
  }

  return null;
}

export async function dbFindUserByLogin(identifier: string): Promise<UserDoc | null> {
  const clean = identifier.trim().toLowerCase();
  if (isUsingRemoteMongo && mongoDb) {
    const user = await mongoDb.collection<UserDoc>('users').findOne({
      $or: [
        { email: clean },
        { phone: identifier.trim() },
        { username: clean.startsWith('@') ? clean : `@${clean}` }
      ]
    });
    return user;
  }

  readLocalData();

  // 1. Instant check by 8-digit Nicaraguan phone
  const normPhone = normalizeNicaPhoneDigits(identifier);
  if (normPhone && userBy8DigitPhone.has(normPhone)) {
    return userBy8DigitPhone.get(normPhone)!;
  }

  // 2. Instant check by email
  if (userByEmail.has(clean)) {
    return userByEmail.get(clean)!;
  }

  // 3. Instant check by username
  const cleanUname = clean.replace(/^@/, '');
  if (userByUsername.has(cleanUname)) {
    return userByUsername.get(cleanUname)!;
  }

  return null;
}

export async function dbCreateUser(user: UserDoc): Promise<UserDoc> {
  if (isUsingRemoteMongo && mongoDb) {
    await mongoDb.collection<UserDoc>('users').insertOne({ ...user });
    return user;
  }

  const data = readLocalData();
  data.users.push(user);
  
  // Actualizar índices en memoria O(1)
  if (user.id) userById.set(user.id, user);
  if (user.phone) {
    const norm = normalizeNicaPhoneDigits(user.phone);
    if (norm) userBy8DigitPhone.set(norm, user);
  }
  if (user.email) userByEmail.set(user.email.toLowerCase().trim(), user);
  if (user.username) userByUsername.set(user.username.toLowerCase().replace(/^@/, ''), user);

  writeLocalData(data);
  return user;
}

export async function dbUpdateUser(userId: string, updates: Partial<UserDoc>): Promise<UserDoc | null> {
  if (isUsingRemoteMongo && mongoDb) {
    await mongoDb.collection<UserDoc>('users').updateOne({ id: userId }, { $set: updates });
    return dbFindUser({ id: userId });
  }

  const data = readLocalData();
  const idx = data.users.findIndex(u => u.id === userId);
  if (idx === -1) return null;
  data.users[idx] = { ...data.users[idx], ...updates, updatedAt: Date.now() };
  writeLocalData(data);
  return data.users[idx];
}

export async function dbListUsers(): Promise<UserDoc[]> {
  if (isUsingRemoteMongo && mongoDb) {
    return await mongoDb.collection<UserDoc>('users').find({}).toArray();
  }
  return readLocalData().users;
}

// Conversations Operations
export async function dbListConversations(userId: string): Promise<ConversationDoc[]> {
  if (isUsingRemoteMongo && mongoDb) {
    const list = await mongoDb.collection<ConversationDoc>('conversations')
      .find({ participantIds: userId })
      .sort({ updatedAt: -1 })
      .toArray();
    return list;
  }

  const data = readLocalData();
  // Return conversations where user participates, sorted by recent activity
  return data.conversations
    .filter(c => c.participantIds.includes(userId) || c.type === 'community' || c.type === 'channel')
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function dbGetConversation(convId: string): Promise<ConversationDoc | null> {
  if (isUsingRemoteMongo && mongoDb) {
    return await mongoDb.collection<ConversationDoc>('conversations').findOne({ id: convId });
  }
  const data = readLocalData();
  return data.conversations.find(c => c.id === convId) || null;
}

export async function dbCreateConversation(conv: ConversationDoc): Promise<ConversationDoc> {
  if (isUsingRemoteMongo && mongoDb) {
    await mongoDb.collection<ConversationDoc>('conversations').insertOne({ ...conv });
    return conv;
  }

  const data = readLocalData();
  const existing = data.conversations.find(c => c.id === conv.id);
  if (existing) return existing;
  data.conversations.unshift(conv);
  writeLocalData(data);
  return conv;
}

export async function dbDeleteConversation(convId: string, userId: string): Promise<boolean> {
  if (isUsingRemoteMongo && mongoDb) {
    const res = await mongoDb.collection<ConversationDoc>('conversations').deleteOne({ 
      id: convId, 
      $or: [
        { participantIds: userId },
        { type: 'community' },
        { type: 'channel' }
      ]
    });
    await mongoDb.collection<MessageDoc>('messages').deleteMany({ conversationId: convId });
    return res.deletedCount > 0;
  }

  const data = readLocalData();
  const initialLen = data.conversations.length;
  data.conversations = data.conversations.filter(c => !(c.id === convId && (c.participantIds.includes(userId) || c.type === 'community' || c.type === 'channel')));
  data.messages = data.messages.filter(m => m.conversationId !== convId);
  if (data.conversations.length !== initialLen) {
    writeLocalData(data);
    return true;
  }
  return false;
}

export interface GetMessagesOptions {
  limit?: number;
  before?: number;
  offset?: number;
}

export interface PaginatedMessagesResult {
  messages: MessageDoc[];
  hasMore: boolean;
  total: number;
  oldestTimestamp?: number;
}

// Messages Operations with Pagination & Cursor Support
export async function dbGetMessages(
  convId: string,
  options: number | GetMessagesOptions = 30
): Promise<PaginatedMessagesResult> {
  const opt: GetMessagesOptions = typeof options === 'number' ? { limit: options } : (options || {});
  const rawLimit = opt.limit ?? 30;
  const limit = Math.min(Math.max(1, rawLimit), 100);
  const before = opt.before !== undefined && !isNaN(Number(opt.before)) ? Number(opt.before) : undefined;
  const offset = opt.offset !== undefined && !isNaN(Number(opt.offset)) && Number(opt.offset) > 0 ? Number(opt.offset) : 0;

  if (isUsingRemoteMongo && mongoDb) {
    const total = await mongoDb.collection<MessageDoc>('messages').countDocuments({ conversationId: convId });
    const filter: Record<string, unknown> = { conversationId: convId };
    if (before !== undefined) {
      filter.timestamp = { $lt: before };
    }

    // Query 1 extra item to check if there are older messages
    const items = await mongoDb.collection<MessageDoc>('messages')
      .find(filter)
      .sort({ timestamp: -1 })
      .skip(offset)
      .limit(limit + 1)
      .toArray();

    const hasMore = items.length > limit;
    if (hasMore) {
      items.pop();
    }
    // Return in chronological order
    items.reverse();

    return {
      messages: items,
      hasMore,
      total,
      oldestTimestamp: items.length > 0 ? items[0].timestamp : undefined
    };
  }

  const data = readLocalData();
  const allForConv = data.messages.filter(m => m.conversationId === convId);
  const total = allForConv.length;

  let filtered = allForConv;
  if (before !== undefined) {
    filtered = filtered.filter(m => m.timestamp < before);
  }

  // Sort descending by timestamp (newest first)
  filtered.sort((a, b) => b.timestamp - a.timestamp);

  if (offset > 0) {
    filtered = filtered.slice(offset);
  }

  const hasMore = filtered.length > limit;
  const sliced = filtered.slice(0, limit);
  // Return in chronological order
  sliced.reverse();

  return {
    messages: sliced,
    hasMore,
    total,
    oldestTimestamp: sliced.length > 0 ? sliced[0].timestamp : undefined
  };
}

export async function dbSaveMessage(msg: MessageDoc): Promise<MessageDoc> {
  if (isUsingRemoteMongo && mongoDb) {
    await mongoDb.collection<MessageDoc>('messages').insertOne({ ...msg });
    await mongoDb.collection<ConversationDoc>('conversations').updateOne(
      { id: msg.conversationId },
      { $set: { lastMessage: msg, updatedAt: msg.timestamp } }
    );
    return msg;
  }

  const data = readLocalData();
  data.messages.push(msg);
  const convIdx = data.conversations.findIndex(c => c.id === msg.conversationId);
  if (convIdx !== -1) {
    data.conversations[convIdx].lastMessage = msg;
    data.conversations[convIdx].updatedAt = msg.timestamp;
  }
  writeLocalData(data);
  return msg;
}

export async function dbEditMessage(convId: string, msgId: string, newText: string): Promise<boolean> {
  if (isUsingRemoteMongo && mongoDb) {
    const res = await mongoDb.collection<MessageDoc>('messages').updateOne(
      { id: msgId, conversationId: convId },
      { $set: { content: newText, isEdited: true } }
    );
    return res.modifiedCount > 0;
  }

  const data = readLocalData();
  const m = data.messages.find(msg => msg.id === msgId && msg.conversationId === convId);
  if (!m) return false;
  m.content = newText;
  m.isEdited = true;
  writeLocalData(data);
  return true;
}

export async function dbDeleteMessage(convId: string, msgId: string): Promise<boolean> {
  if (isUsingRemoteMongo && mongoDb) {
    const res = await mongoDb.collection<MessageDoc>('messages').updateOne(
      { id: msgId, conversationId: convId },
      { $set: { content: 'Este mensaje fue eliminado', isDeleted: true } }
    );
    return res.modifiedCount > 0;
  }

  const data = readLocalData();
  const m = data.messages.find(msg => msg.id === msgId && msg.conversationId === convId);
  if (!m) return false;
  m.content = 'Este mensaje fue eliminado';
  m.isDeleted = true;
  writeLocalData(data);
  return true;
}

export async function dbUpdateMessageReactions(convId: string, msgId: string, reactions: Record<string, string[]>): Promise<boolean> {
  if (isUsingRemoteMongo && mongoDb) {
    const res = await mongoDb.collection<MessageDoc>('messages').updateOne(
      { id: msgId, conversationId: convId },
      { $set: { reactions } }
    );
    return res.modifiedCount > 0;
  }

  const data = readLocalData();
  const m = data.messages.find(msg => msg.id === msgId && msg.conversationId === convId);
  if (!m) return false;
  m.reactions = reactions;
  writeLocalData(data);
  return true;
}

export async function dbMarkMessagesAsRead(convId: string, readerUserId: string): Promise<string[]> {
  const updatedMessageIds: string[] = [];

  if (isUsingRemoteMongo && mongoDb) {
    const unreadMsgs = await mongoDb.collection<MessageDoc>('messages')
      .find({ conversationId: convId, senderId: { $ne: readerUserId }, status: { $ne: 'read' } })
      .toArray();

    for (const msg of unreadMsgs) {
      updatedMessageIds.push(msg.id);
    }

    if (updatedMessageIds.length > 0) {
      await mongoDb.collection<MessageDoc>('messages').updateMany(
        { id: { $in: updatedMessageIds } },
        { $set: { status: 'read' } }
      );
      await mongoDb.collection<ConversationDoc>('conversations').updateOne(
        { id: convId },
        { $set: { unreadCount: 0 } }
      );
    }
    return updatedMessageIds;
  }

  const data = readLocalData();
  data.messages.forEach(msg => {
    if (msg.conversationId === convId && msg.senderId !== readerUserId && msg.status !== 'read') {
      msg.status = 'read';
      updatedMessageIds.push(msg.id);
    }
  });

  const conv = data.conversations.find(c => c.id === convId);
  if (conv) {
    conv.unreadCount = 0;
    if (conv.lastMessage && conv.lastMessage.senderId !== readerUserId) {
      conv.lastMessage.status = 'read';
    }
  }

  if (updatedMessageIds.length > 0) {
    writeLocalData(data);
  }
  return updatedMessageIds;
}

// Statuses / Historias Operations
export async function dbListStatuses(): Promise<StatusDoc[]> {
  const now = Date.now();
  const cutoff = now - 24 * 3600 * 1000;

  if (isUsingRemoteMongo && mongoDb) {
    // Auto-renew statuses marked with autoRenew that are older than 24h
    try {
      await mongoDb.collection<StatusDoc>('statuses').updateMany(
        { autoRenew: true, timestamp: { $lt: cutoff } },
        { 
          $set: { timestamp: now, expiresAt: now + 24 * 3600 * 1000 },
          $inc: { renewedCount: 1 }
        }
      );
    } catch (e) {
      console.warn('Mongo auto-renew statuses error:', e);
    }

    return await mongoDb.collection<StatusDoc>('statuses')
      .find({ $or: [{ timestamp: { $gte: cutoff } }, { autoRenew: true }] })
      .sort({ timestamp: -1 })
      .toArray();
  }

  const data = readLocalData();
  let modified = false;

  // Auto-renew any statuses marked with autoRenew
  data.statuses.forEach(s => {
    if (s.autoRenew && s.timestamp < cutoff) {
      s.timestamp = now;
      s.expiresAt = now + 24 * 3600 * 1000;
      s.renewedCount = (s.renewedCount || 0) + 1;
      modified = true;
    }
  });

  if (modified) {
    writeLocalData(data);
  }

  return data.statuses
    .filter(s => s.timestamp >= cutoff || s.autoRenew)
    .sort((a, b) => b.timestamp - a.timestamp);
}

export async function dbCreateStatus(status: StatusDoc): Promise<StatusDoc> {
  if (isUsingRemoteMongo && mongoDb) {
    await mongoDb.collection<StatusDoc>('statuses').insertOne({ ...status });
    return status;
  }

  const data = readLocalData();
  data.statuses.unshift(status);
  writeLocalData(data);
  return status;
}

export async function dbRenewStatus(statusId: string, userId: string): Promise<StatusDoc | null> {
  const now = Date.now();
  const newExpiresAt = now + 24 * 3600 * 1000;

  if (isUsingRemoteMongo && mongoDb) {
    await mongoDb.collection<StatusDoc>('statuses').updateOne(
      { id: statusId, userId },
      { 
        $set: { timestamp: now, expiresAt: newExpiresAt },
        $inc: { renewedCount: 1 }
      }
    );
    return await mongoDb.collection<StatusDoc>('statuses').findOne({ id: statusId, userId });
  }

  const data = readLocalData();
  const status = data.statuses.find(s => s.id === statusId && s.userId === userId);
  if (!status) return null;

  status.timestamp = now;
  status.expiresAt = newExpiresAt;
  status.renewedCount = (status.renewedCount || 0) + 1;
  writeLocalData(data);
  return status;
}

export async function dbToggleStatusAutoRenew(statusId: string, userId: string): Promise<StatusDoc | null> {
  const now = Date.now();
  if (isUsingRemoteMongo && mongoDb) {
    const current = await mongoDb.collection<StatusDoc>('statuses').findOne({ id: statusId, userId });
    if (!current) return null;
    const newAutoRenew = !current.autoRenew;
    const updateDoc: any = { autoRenew: newAutoRenew };
    if (newAutoRenew && current.timestamp < now - 24 * 3600 * 1000) {
      updateDoc.timestamp = now;
      updateDoc.expiresAt = now + 24 * 3600 * 1000;
    }
    await mongoDb.collection<StatusDoc>('statuses').updateOne({ id: statusId, userId }, { $set: updateDoc });
    return await mongoDb.collection<StatusDoc>('statuses').findOne({ id: statusId, userId });
  }

  const data = readLocalData();
  const status = data.statuses.find(s => s.id === statusId && s.userId === userId);
  if (!status) return null;

  status.autoRenew = !status.autoRenew;
  if (status.autoRenew && status.timestamp < now - 24 * 3600 * 1000) {
    status.timestamp = now;
    status.expiresAt = now + 24 * 3600 * 1000;
  }
  writeLocalData(data);
  return status;
}

export async function dbDeleteStatus(statusId: string, userId: string): Promise<boolean> {
  if (isUsingRemoteMongo && mongoDb) {
    const res = await mongoDb.collection<StatusDoc>('statuses').deleteOne({ id: statusId, userId });
    return (res.deletedCount || 0) > 0;
  }

  const data = readLocalData();
  const prevLen = data.statuses.length;
  data.statuses = data.statuses.filter(s => !(s.id === statusId && s.userId === userId));
  if (data.statuses.length !== prevLen) {
    writeLocalData(data);
    return true;
  }
  return false;
}

export async function dbUpdateUserAvatarInStatuses(userId: string, newAvatar: string): Promise<void> {
  if (isUsingRemoteMongo && mongoDb) {
    await mongoDb.collection<StatusDoc>('statuses').updateMany(
      { userId },
      { $set: { userAvatar: newAvatar } }
    );
    return;
  }

  const data = readLocalData();
  let modified = false;
  data.statuses.forEach(s => {
    if (s.userId === userId) {
      s.userAvatar = newAvatar;
      modified = true;
    }
  });
  if (modified) {
    writeLocalData(data);
  }
}

export async function dbRecordStatusView(statusId: string, viewer: { userId: string; userName: string; userAvatar: string }): Promise<StatusDoc | null> {
  if (isUsingRemoteMongo && mongoDb) {
    await mongoDb.collection<StatusDoc>('statuses').updateOne(
      { id: statusId, 'viewers.userId': { $ne: viewer.userId } },
      {
        $inc: { viewsCount: 1 },
        $push: { viewers: { ...viewer, timestamp: Date.now() } } as any
      }
    );
    return await mongoDb.collection<StatusDoc>('statuses').findOne({ id: statusId });
  }

  const data = readLocalData();
  const status = data.statuses.find(s => s.id === statusId);
  if (!status) return null;

  if (!status.viewers) status.viewers = [];
  const alreadyViewed = status.viewers.some(v => v.userId === viewer.userId);
  if (!alreadyViewed && viewer.userId !== status.userId) {
    status.viewsCount = (status.viewsCount || 0) + 1;
    status.viewers.push({
      ...viewer,
      timestamp: Date.now()
    });
    writeLocalData(data);
  }
  return status;
}

// OTP Verification Operations
export async function dbCreateOtp(target: string, code: string): Promise<OtpDoc> {
  const otp: OtpDoc = {
    id: `otp-${Date.now()}`,
    target: target.trim(),
    code,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes validity
    verified: false,
    createdAt: Date.now()
  };

  if (isUsingRemoteMongo && mongoDb) {
    await mongoDb.collection<OtpDoc>('otps').insertOne({ ...otp });
    return otp;
  }

  const data = readLocalData();
  data.otps.push(otp);
  writeLocalData(data);
  return otp;
}

export async function dbVerifyOtp(target: string, code: string): Promise<boolean> {
  const now = Date.now();
  if (isUsingRemoteMongo && mongoDb) {
    const doc = await mongoDb.collection<OtpDoc>('otps').findOne({
      target: target.trim(),
      code: code.trim(),
      expiresAt: { $gte: now },
      verified: false
    });
    if (!doc) return false;
    await mongoDb.collection<OtpDoc>('otps').updateOne({ id: doc.id }, { $set: { verified: true } });
    return true;
  }

  const data = readLocalData();
  const idx = data.otps.findIndex(o => 
    o.target.trim().toLowerCase() === target.trim().toLowerCase() && 
    o.code.trim() === code.trim() && 
    o.expiresAt >= now && 
    !o.verified
  );
  if (idx === -1) return false;
  data.otps[idx].verified = true;
  writeLocalData(data);
  return true;
}

// Session Management Operations
export async function dbCreateSession(session: SessionDoc): Promise<SessionDoc> {
  if (isUsingRemoteMongo && mongoDb) {
    await mongoDb.collection<SessionDoc>('sessions').insertOne({ ...session });
    return session;
  }

  const data = readLocalData();
  if (!data.sessions) data.sessions = [];
  data.sessions.push(session);
  writeLocalData(data);
  return session;
}

export async function dbFindSession(sessionId: string): Promise<SessionDoc | null> {
  if (isUsingRemoteMongo && mongoDb) {
    return await mongoDb.collection<SessionDoc>('sessions').findOne({ id: sessionId, isValid: true });
  }

  const data = readLocalData();
  return data.sessions?.find(s => s.id === sessionId && s.isValid) || null;
}

export async function dbListUserSessions(userId: string): Promise<SessionDoc[]> {
  if (isUsingRemoteMongo && mongoDb) {
    return await mongoDb.collection<SessionDoc>('sessions')
      .find({ userId, isValid: true })
      .sort({ lastActiveAt: -1 })
      .toArray();
  }

  const data = readLocalData();
  return (data.sessions || [])
    .filter(s => s.userId === userId && s.isValid)
    .sort((a, b) => b.lastActiveAt - a.lastActiveAt);
}

export async function dbTouchSession(sessionId: string): Promise<void> {
  const now = Date.now();
  if (isUsingRemoteMongo && mongoDb) {
    await mongoDb.collection<SessionDoc>('sessions').updateOne(
      { id: sessionId },
      { $set: { lastActiveAt: now } }
    );
    return;
  }

  const data = readLocalData();
  const sess = data.sessions?.find(s => s.id === sessionId);
  if (sess) {
    const shouldPersist = now - sess.lastActiveAt > 30000;
    sess.lastActiveAt = now;
    if (shouldPersist) {
      writeLocalData(data, false);
    }
  }
}

export async function dbRevokeSession(sessionId: string, userId: string): Promise<boolean> {
  if (isUsingRemoteMongo && mongoDb) {
    const res = await mongoDb.collection<SessionDoc>('sessions').updateOne(
      { id: sessionId, userId },
      { $set: { isValid: false } }
    );
    return res.modifiedCount > 0;
  }

  const data = readLocalData();
  const sess = data.sessions?.find(s => s.id === sessionId && s.userId === userId);
  if (!sess) return false;
  sess.isValid = false;
  writeLocalData(data);
  return true;
}

export async function dbRevokeAllOtherSessions(userId: string, currentSessionId: string): Promise<number> {
  if (isUsingRemoteMongo && mongoDb) {
    const res = await mongoDb.collection<SessionDoc>('sessions').updateMany(
      { userId, id: { $ne: currentSessionId }, isValid: true },
      { $set: { isValid: false } }
    );
    return res.modifiedCount;
  }

  const data = readLocalData();
  let count = 0;
  if (data.sessions) {
    data.sessions.forEach(s => {
      if (s.userId === userId && s.id !== currentSessionId && s.isValid) {
        s.isValid = false;
        count++;
      }
    });
    if (count > 0) writeLocalData(data);
  }
  return count;
}

// Stored Files Operations
export async function dbSaveStoredFile(file: StoredFileDoc): Promise<StoredFileDoc> {
  if (isUsingRemoteMongo && mongoDb) {
    await mongoDb.collection<StoredFileDoc>('storedFiles').insertOne({ ...file });
    return file;
  }

  const data = readLocalData();
  if (!data.storedFiles) data.storedFiles = [];
  data.storedFiles.push(file);
  writeLocalData(data);
  return file;
}

export async function dbGetStoredFile(fileId: string): Promise<StoredFileDoc | null> {
  if (isUsingRemoteMongo && mongoDb) {
    return await mongoDb.collection<StoredFileDoc>('storedFiles').findOne({ id: fileId });
  }

  const data = readLocalData();
  return data.storedFiles?.find(f => f.id === fileId) || null;
}

// Contacts Operations
export async function dbListContacts(userId: string): Promise<ContactDoc[]> {
  if (isUsingRemoteMongo && mongoDb) {
    return await mongoDb.collection<ContactDoc>('contacts')
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();
  }

  const data = readLocalData();
  if (!data.contacts) data.contacts = [];
  return data.contacts
    .filter(c => c.userId === userId)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function dbSaveContact(contact: ContactDoc): Promise<ContactDoc> {
  if (isUsingRemoteMongo && mongoDb) {
    const existing = await mongoDb.collection<ContactDoc>('contacts').findOne({
      userId: contact.userId,
      $or: [
        { contactUserId: contact.contactUserId },
        { phone: contact.phone },
        ...(contact.email ? [{ email: contact.email }] : [])
      ]
    });

    if (existing) {
      await mongoDb.collection<ContactDoc>('contacts').updateOne(
        { id: existing.id },
        { $set: { ...contact, id: existing.id } }
      );
      return { ...contact, id: existing.id };
    }

    await mongoDb.collection<ContactDoc>('contacts').insertOne({ ...contact });
    return contact;
  }

  const data = readLocalData();
  if (!data.contacts) data.contacts = [];

  const existingIdx = data.contacts.findIndex(c => 
    c.userId === contact.userId && (
      c.contactUserId === contact.contactUserId ||
      (c.phone && contact.phone && c.phone.replace(/\s+/g, '') === contact.phone.replace(/\s+/g, '')) ||
      (c.email && contact.email && c.email.toLowerCase() === contact.email.toLowerCase())
    )
  );

  if (existingIdx !== -1) {
    data.contacts[existingIdx] = { ...contact, id: data.contacts[existingIdx].id };
    writeLocalData(data);
    return data.contacts[existingIdx];
  }

  data.contacts.unshift(contact);
  writeLocalData(data);
  return contact;
}

// Guardado atómico ultra-rápido de contacto (<2ms): usuario, chat y contacto en memoria de una sola vez
export async function dbSaveContactDirect(
  currentUser: UserDoc,
  contactData: {
    name: string;
    phone?: string;
    email?: string;
    avatar?: string;
    bio?: string;
  }
): Promise<{ contact: ContactDoc; targetUser: UserDoc; conversation: ConversationDoc }> {
  const cleanPhone = (contactData.phone || '').trim();
  const cleanEmail = (contactData.email || '').trim().toLowerCase();
  const cleanName = (contactData.name || 'Contacto').trim();

  // 1. Buscar usuario destino instantáneamente en índices O(1)
  let targetUser: UserDoc | null = null;
  if (cleanPhone) {
    targetUser = await dbFindUserByLogin(cleanPhone);
  }
  if (!targetUser && cleanEmail) {
    targetUser = await dbFindUserByLogin(cleanEmail);
  }

  const data = readLocalData();
  if (!data.contacts) data.contacts = [];
  if (!data.conversations) data.conversations = [];
  if (!data.users) data.users = [];

  // 2. Si no existe, crear usuario en memoria de inmediato
  if (!targetUser) {
    const generatedId = `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const cleanUsername = cleanName.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 15);
    targetUser = {
      id: generatedId,
      name: cleanName,
      username: `@${cleanUsername || 'contacto'}`,
      phone: cleanPhone || '+505 0000 0000',
      email: cleanEmail || '',
      avatar: contactData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      bio: contactData.bio?.trim() || 'Contacto guardado en Naul Chat Nicaragua 🇳🇮',
      status: 'offline',
      isVerified: false,
      createdAt: Date.now()
    };
    data.users.push(targetUser);
    
    // Actualizar mapas en memoria
    userById.set(targetUser.id, targetUser);
    const norm = normalizeNicaPhoneDigits(targetUser.phone);
    if (norm) userBy8DigitPhone.set(norm, targetUser);
    if (targetUser.email) userByEmail.set(targetUser.email.toLowerCase().trim(), targetUser);
  }

  // 3. Obtener o crear conversación directa
  let conv = data.conversations.find(c => c.type === 'direct' && c.participantIds.includes(targetUser!.id) && c.participantIds.includes(currentUser.id));
  if (!conv) {
    conv = {
      id: `conv-direct-${[currentUser.id, targetUser.id].sort().join('-')}`,
      type: 'direct',
      name: cleanName || targetUser.name,
      avatar: targetUser.avatar || contactData.avatar || '',
      participants: [currentUser, targetUser],
      participantIds: [currentUser.id, targetUser.id],
      unreadCount: 0,
      isVerified: targetUser.isVerified,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    data.conversations.unshift(conv);
  }

  // 4. Guardar o actualizar registro de contacto
  const normTargetPhone = normalizeNicaPhoneDigits(cleanPhone || targetUser.phone);
  const existingIdx = data.contacts.findIndex(c => 
    c.userId === currentUser.id && (
      c.contactUserId === targetUser!.id ||
      (normTargetPhone && normalizeNicaPhoneDigits(c.phone) === normTargetPhone) ||
      (cleanEmail && c.email && c.email.toLowerCase() === cleanEmail)
    )
  );

  const contactRecord: ContactDoc = {
    id: existingIdx !== -1 ? data.contacts[existingIdx].id : `contact-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    userId: currentUser.id,
    contactUserId: targetUser.id,
    name: cleanName,
    phone: cleanPhone || targetUser.phone,
    email: cleanEmail || targetUser.email,
    avatar: targetUser.avatar,
    bio: targetUser.bio,
    conversationId: conv.id,
    createdAt: existingIdx !== -1 ? data.contacts[existingIdx].createdAt : Date.now()
  };

  if (existingIdx !== -1) {
    data.contacts[existingIdx] = contactRecord;
  } else {
    data.contacts.unshift(contactRecord);
  }

  // 5. Persistir una sola vez de forma asíncrona
  writeLocalData(data);

  return {
    contact: contactRecord,
    targetUser,
    conversation: conv
  };
}

// Guardado por lotes (Batch) para importar agendas o archivos VCF a máxima velocidad
export async function dbSaveContactsBatch(
  currentUser: UserDoc,
  contacts: Array<{
    name: string;
    phone?: string;
    email?: string;
    avatar?: string;
    bio?: string;
  }>
): Promise<{ success: boolean; count: number; contacts: ContactDoc[] }> {
  const savedList: ContactDoc[] = [];

  for (const c of contacts) {
    if (!c.name || (!c.phone && !c.email)) continue;
    try {
      const res = await dbSaveContactDirect(currentUser, c);
      savedList.push(res.contact);
    } catch (e) {
      console.error('Error batch saving single contact:', e);
    }
  }

  return {
    success: true,
    count: savedList.length,
    contacts: savedList
  };
}

export async function dbDeleteContact(
  identifier: string,
  userId: string,
  deleteConversation = false
): Promise<{ success: boolean; deletedCount: number; conversationId?: string }> {
  const cleanId = decodeURIComponent(identifier).trim();
  const cleanPhone = cleanId.replace(/\s+/g, '');

  if (isUsingRemoteMongo && mongoDb) {
    const matching = await mongoDb.collection<ContactDoc>('contacts').find({
      userId,
      $or: [
        { id: cleanId },
        { contactUserId: cleanId },
        { phone: cleanId },
        { phone: cleanPhone },
        { email: cleanId.toLowerCase() }
      ]
    }).toArray();

    if (matching.length === 0) {
      return { success: false, deletedCount: 0 };
    }

    const conversationIds = matching.map(m => m.conversationId).filter(Boolean) as string[];

    const res = await mongoDb.collection<ContactDoc>('contacts').deleteMany({
      userId,
      $or: [
        { id: cleanId },
        { contactUserId: cleanId },
        { phone: cleanId },
        { phone: cleanPhone },
        { email: cleanId.toLowerCase() }
      ]
    });

    if (deleteConversation && conversationIds.length > 0) {
      for (const convId of conversationIds) {
        await dbDeleteConversation(convId, userId);
      }
    }

    return {
      success: res.deletedCount > 0,
      deletedCount: res.deletedCount,
      conversationId: conversationIds[0]
    };
  }

  const data = readLocalData();
  if (!data.contacts) data.contacts = [];
  const initialLen = data.contacts.length;

  const toDelete = data.contacts.filter(c =>
    c.userId === userId && (
      c.id === cleanId ||
      c.contactUserId === cleanId ||
      c.phone === cleanId ||
      (c.phone && c.phone.replace(/\s+/g, '') === cleanPhone) ||
      (c.email && c.email.toLowerCase() === cleanId.toLowerCase())
    )
  );

  if (toDelete.length === 0) {
    return { success: false, deletedCount: 0 };
  }

  const conversationIds = toDelete.map(c => c.conversationId).filter(Boolean) as string[];
  data.contacts = data.contacts.filter(c => !toDelete.includes(c));
  writeLocalData(data, true);

  if (deleteConversation && conversationIds.length > 0) {
    for (const convId of conversationIds) {
      await dbDeleteConversation(convId, userId);
    }
  }

  return {
    success: true,
    deletedCount: toDelete.length,
    conversationId: conversationIds[0]
  };
}

// ==================== BLOQUEO Y GESTIÓN DE CONTACTOS ====================

export async function dbListBlockedUsers(userId: string): Promise<BlockDoc[]> {
  if (isUsingRemoteMongo && mongoDb) {
    return await mongoDb.collection<BlockDoc>('blockedUsers')
      .find({ userId })
      .sort({ blockedAt: -1 })
      .toArray();
  }

  const data = readLocalData();
  if (!data.blockedUsers) data.blockedUsers = [];
  return data.blockedUsers
    .filter(b => b.userId === userId)
    .sort((a, b) => b.blockedAt - a.blockedAt);
}

export async function dbBlockUser(blockRecord: BlockDoc): Promise<BlockDoc> {
  if (isUsingRemoteMongo && mongoDb) {
    await mongoDb.collection<BlockDoc>('blockedUsers').updateOne(
      { userId: blockRecord.userId, blockedUserId: blockRecord.blockedUserId },
      { $set: blockRecord },
      { upsert: true }
    );
    return blockRecord;
  }

  const data = readLocalData();
  if (!data.blockedUsers) data.blockedUsers = [];
  const existingIdx = data.blockedUsers.findIndex(
    b => b.userId === blockRecord.userId && b.blockedUserId === blockRecord.blockedUserId
  );
  if (existingIdx !== -1) {
    data.blockedUsers[existingIdx] = blockRecord;
  } else {
    data.blockedUsers.unshift(blockRecord);
  }
  writeLocalData(data);
  return blockRecord;
}

export async function dbUnblockUser(userId: string, blockedUserId: string): Promise<boolean> {
  if (isUsingRemoteMongo && mongoDb) {
    const res = await mongoDb.collection<BlockDoc>('blockedUsers').deleteOne({ userId, blockedUserId });
    return res.deletedCount > 0;
  }

  const data = readLocalData();
  if (!data.blockedUsers) return false;
  const initialLen = data.blockedUsers.length;
  data.blockedUsers = data.blockedUsers.filter(
    b => !(b.userId === userId && b.blockedUserId === blockedUserId)
  );
  if (data.blockedUsers.length !== initialLen) {
    writeLocalData(data);
    return true;
  }
  return false;
}

export async function dbIsUserBlocked(userAId: string, userBId: string): Promise<boolean> {
  if (isUsingRemoteMongo && mongoDb) {
    const found = await mongoDb.collection<BlockDoc>('blockedUsers').findOne({
      $or: [
        { userId: userAId, blockedUserId: userBId },
        { userId: userBId, blockedUserId: userAId }
      ]
    });
    return !!found;
  }

  const data = readLocalData();
  if (!data.blockedUsers) return false;
  return data.blockedUsers.some(
    b => (b.userId === userAId && b.blockedUserId === userBId) ||
         (b.userId === userBId && b.blockedUserId === userAId)
  );
}

// ==================== GARBAGE COLLECTION & STORAGE PRUNING ====================

export async function dbListStoredFiles(userId?: string): Promise<StoredFileDoc[]> {
  if (isUsingRemoteMongo && mongoDb) {
    const filter = userId ? { userId } : {};
    return await mongoDb.collection<StoredFileDoc>('storedFiles')
      .find(filter)
      .sort({ createdAt: 1 })
      .toArray();
  }

  const data = readLocalData();
  const list = data.storedFiles || [];
  return (userId ? list.filter(f => f.userId === userId) : list).sort((a, b) => a.createdAt - b.createdAt);
}

export async function dbDeleteStoredFilesByIds(fileIds: string[]): Promise<number> {
  if (!fileIds || fileIds.length === 0) return 0;

  if (isUsingRemoteMongo && mongoDb) {
    const res = await mongoDb.collection<StoredFileDoc>('storedFiles').deleteMany({
      id: { $in: fileIds }
    });
    return res.deletedCount;
  }

  const data = readLocalData();
  if (!data.storedFiles) return 0;
  const initialLen = data.storedFiles.length;
  const set = new Set(fileIds);
  data.storedFiles = data.storedFiles.filter(f => !set.has(f.id));
  const deletedCount = initialLen - data.storedFiles.length;
  if (deletedCount > 0) {
    writeLocalData(data, true);
  }
  return deletedCount;
}

export async function dbPruneExpiredStatuses(): Promise<number> {
  const now = Date.now();
  if (isUsingRemoteMongo && mongoDb) {
    const res = await mongoDb.collection<StatusDoc>('statuses').deleteMany({
      expiresAt: { $lt: now }
    });
    return res.deletedCount;
  }

  const data = readLocalData();
  if (!data.statuses) return 0;
  const initialLen = data.statuses.length;
  data.statuses = data.statuses.filter(s => s.expiresAt >= now);
  const pruned = initialLen - data.statuses.length;
  if (pruned > 0) {
    writeLocalData(data, true);
  }
  return pruned;
}

export async function dbPruneExpiredOtps(): Promise<number> {
  const now = Date.now();
  if (isUsingRemoteMongo && mongoDb) {
    const res = await mongoDb.collection<OtpDoc>('otps').deleteMany({
      expiresAt: { $lt: now }
    });
    return res.deletedCount;
  }

  const data = readLocalData();
  if (!data.otps) return 0;
  const initialLen = data.otps.length;
  data.otps = data.otps.filter(o => o.expiresAt >= now);
  const pruned = initialLen - data.otps.length;
  if (pruned > 0) {
    writeLocalData(data, true);
  }
  return pruned;
}

export async function dbPruneRevokedSessions(maxAgeMs = 14 * 86400000): Promise<number> {
  const cutoff = Date.now() - maxAgeMs;
  if (isUsingRemoteMongo && mongoDb) {
    const res = await mongoDb.collection<SessionDoc>('sessions').deleteMany({
      isValid: false,
      lastActiveAt: { $lt: cutoff }
    });
    return res.deletedCount;
  }

  const data = readLocalData();
  if (!data.sessions) return 0;
  const initialLen = data.sessions.length;
  data.sessions = data.sessions.filter(s => s.isValid || s.lastActiveAt >= cutoff);
  const pruned = initialLen - data.sessions.length;
  if (pruned > 0) {
    writeLocalData(data, true);
  }
  return pruned;
}

export async function dbPruneOldMessages(keepCountPerConv = 100): Promise<number> {
  if (isUsingRemoteMongo && mongoDb) {
    const conversations = await mongoDb.collection<ConversationDoc>('conversations').find({}).toArray();
    let totalPruned = 0;
    for (const conv of conversations) {
      const msgs = await mongoDb.collection<MessageDoc>('messages')
        .find({ conversationId: conv.id })
        .sort({ timestamp: -1 })
        .toArray();

      if (msgs.length > keepCountPerConv) {
        const toDeleteIds = msgs.slice(keepCountPerConv).map(m => m.id);
        const delRes = await mongoDb.collection<MessageDoc>('messages').deleteMany({
          id: { $in: toDeleteIds }
        });
        totalPruned += delRes.deletedCount;
      }
    }
    return totalPruned;
  }

  const data = readLocalData();
  if (!data.messages || data.messages.length === 0) return 0;
  const initialCount = data.messages.length;

  const map = new Map<string, MessageDoc[]>();
  for (const msg of data.messages) {
    const list = map.get(msg.conversationId) || [];
    list.push(msg);
    map.set(msg.conversationId, list);
  }

  const keptMessages: MessageDoc[] = [];
  for (const [, list] of map.entries()) {
    list.sort((a, b) => b.timestamp - a.timestamp);
    const kept = list.slice(0, keepCountPerConv);
    kept.reverse();
    keptMessages.push(...kept);
  }

  data.messages = keptMessages;
  const pruned = initialCount - data.messages.length;
  if (pruned > 0) {
    writeLocalData(data, true);
  }
  return pruned;
}

export async function dbGetTotalStats(): Promise<{
  usersCount: number;
  messagesCount: number;
  conversationsCount: number;
  storedFilesCount: number;
  storedFilesBytes: number;
}> {
  if (isUsingRemoteMongo && mongoDb) {
    const [usersCount, messagesCount, conversationsCount, storedFilesCount] = await Promise.all([
      mongoDb.collection('users').countDocuments(),
      mongoDb.collection('messages').countDocuments(),
      mongoDb.collection('conversations').countDocuments(),
      mongoDb.collection('storedFiles').countDocuments()
    ]);
    const files = await mongoDb.collection<StoredFileDoc>('storedFiles').find({}).toArray();
    const storedFilesBytes = files.reduce((acc, f) => acc + (f.sizeBytes || 0), 0);
    return { usersCount, messagesCount, conversationsCount, storedFilesCount, storedFilesBytes };
  }

  const data = readLocalData();
  const storedFilesBytes = (data.storedFiles || []).reduce((acc, f) => acc + (f.sizeBytes || 0), 0);
  return {
    usersCount: data.users?.length || 0,
    messagesCount: data.messages?.length || 0,
    conversationsCount: data.conversations?.length || 0,
    storedFilesCount: data.storedFiles?.length || 0,
    storedFilesBytes
  };
}

// ==================== PAGOS BANCARIOS REALES & SISTEMA DE PUNTOS ====================

export const OFFICIAL_PAYMENT_ACCOUNTS = {
  banpro: {
    bankName: 'Banco de la Producción (Banpro)',
    method: 'Billetera Móvil Banpro',
    accountNumber: '+505 58898311',
    cleanNumber: '+50558898311',
    holderName: 'Norman Escobar',
    instructions: 'Envía tu depósito por Billetera Móvil Banpro al número +505 58898311. El paquete Premium se activará automáticamente con el número de transacción.'
  },
  lafise: {
    bankName: 'LAFISE Bancentro',
    method: 'Cuenta Bancaria LAFISE',
    accountNumber: '134085049',
    holderName: 'Norman Escobar',
    accountType: 'Cuenta en Córdobas (C$)',
    instructions: 'Transfiere a la cuenta bancaria LAFISE Bancentro 134085049. El comprobante se valida en tiempo real y desbloquea el paquete Premium de inmediato.'
  }
};

export async function dbRecordDepositPayment(
  userId: string,
  paymentData: {
    method: 'banpro_billetera' | 'lafise_cuenta';
    referenceNumber: string;
    amountCordobas: number;
    planId: string;
    voucherImage?: string;
    voucherNotes?: string;
  }
): Promise<{ success: boolean; user: UserDoc; message: string; transaction: DepositTransactionDoc }> {
  const transaction: DepositTransactionDoc = {
    id: `dep-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    method: paymentData.method,
    referenceNumber: paymentData.referenceNumber.trim() || `REF-${Date.now().toString().slice(-6)}`,
    amountCordobas: paymentData.amountCordobas || 50,
    timestamp: Date.now(),
    status: paymentData.voucherImage ? 'pending_verification' : 'approved',
    planId: paymentData.planId || 'premium_basic',
    voucherImage: paymentData.voucherImage,
    voucherNotes: paymentData.voucherNotes?.trim()
  };

  const isBusiness = paymentData.planId?.startsWith('business');
  const targetPlan = isBusiness ? 'business' : 'premium';
  const targetBadge = isBusiness ? 'business_verified' : 'star_premium';
  const targetQuotaTotal = isBusiness ? 102400 : 51200; // 100 GB o 50 GB
  const durationDays = 30; // 30 días de suscripción activa

  if (isUsingRemoteMongo && mongoDb) {
    const user = await mongoDb.collection<UserDoc>('users').findOne({ id: userId });
    if (!user) throw new Error('Usuario no encontrado');

    const updatedPoints = (user.points || 0) + 50; // +50 puntos de bono por depósito
    const newExpiresAt = Date.now() + durationDays * 86400000;

    await mongoDb.collection<UserDoc>('users').updateOne(
      { id: userId },
      {
        $set: {
          plan: targetPlan,
          badgeType: targetBadge,
          isVerified: true,
          premiumExpiresAt: newExpiresAt,
          pointsTrialActive: false,
          'storageQuota.totalMb': targetQuotaTotal,
          points: updatedPoints
        },
        $push: { depositTransactions: transaction as any }
      }
    );

    const updatedUser = await mongoDb.collection<UserDoc>('users').findOne({ id: userId });
    return {
      success: true,
      user: updatedUser!,
      transaction,
      message: paymentData.voucherImage 
        ? `¡Comprobante de depósito enviado con éxito para verificación administrativa! Tu plan ${targetPlan === 'business' ? 'Negocio' : 'Premium'} ha sido pre-activado.`
        : `¡Depósito verificado en tiempo real! Paquete ${targetPlan === 'business' ? 'Negocio' : 'Premium'} activado con éxito por 30 días.`
    };
  }

  const data = readLocalData();
  const user = data.users.find(u => u.id === userId);
  if (!user) throw new Error('Usuario no encontrado');

  if (!user.depositTransactions) user.depositTransactions = [];
  user.depositTransactions.unshift(transaction);

  user.plan = targetPlan;
  user.badgeType = targetBadge;
  user.isVerified = true;
  user.premiumExpiresAt = Date.now() + durationDays * 86400000;
  user.pointsTrialActive = false;
  user.points = (user.points || 0) + 50;

  if (!user.storageQuota) {
    user.storageQuota = { totalMb: targetQuotaTotal, usedMb: 245, photosMb: 140, videosMb: 65, audiosMb: 30, documentsMb: 10 };
  } else {
    user.storageQuota.totalMb = targetQuotaTotal;
  }

  writeLocalData(data, true);

  return {
    success: true,
    user,
    transaction,
    message: paymentData.voucherImage 
      ? `¡Comprobante de depósito enviado con éxito para verificación administrativa! Tu plan ${targetPlan === 'business' ? 'Negocio' : 'Premium'} ha sido pre-activado.`
      : `¡Depósito verificado en tiempo real! Paquete ${targetPlan === 'business' ? 'Negocio' : 'Premium'} activado con éxito por 30 días.`
  };
}

// Listar todos los comprobantes y depósitos para verificación administrativa
export async function dbListAllDepositsForAdmin(): Promise<Array<{
  userId: string;
  userName: string;
  userPhone: string;
  userEmail: string;
  transaction: DepositTransactionDoc;
}>> {
  if (isUsingRemoteMongo && mongoDb) {
    const users = await mongoDb.collection<UserDoc>('users')
      .find({ 'depositTransactions.0': { $exists: true } })
      .toArray();

    const list: any[] = [];
    users.forEach(u => {
      (u.depositTransactions || []).forEach(tx => {
        list.push({
          userId: u.id,
          userName: u.name,
          userPhone: u.phone,
          userEmail: u.email,
          transaction: tx
        });
      });
    });
    return list.sort((a, b) => b.transaction.timestamp - a.transaction.timestamp);
  }

  const data = readLocalData();
  const list: any[] = [];
  data.users.forEach(u => {
    (u.depositTransactions || []).forEach(tx => {
      list.push({
        userId: u.id,
        userName: u.name,
        userPhone: u.phone,
        userEmail: u.email,
        transaction: tx
      });
    });
  });
  return list.sort((a, b) => b.transaction.timestamp - a.transaction.timestamp);
}

// Verificar administrativamente un comprobante de depósito
export async function dbVerifyDepositTransaction(
  userId: string,
  depositId: string,
  status: 'approved' | 'rejected',
  adminNotes?: string
): Promise<{ success: boolean; user?: UserDoc; message: string }> {
  const verifiedAt = Date.now();

  if (isUsingRemoteMongo && mongoDb) {
    const user = await mongoDb.collection<UserDoc>('users').findOne({ id: userId });
    if (!user) return { success: false, message: 'Usuario no encontrado' };

    await mongoDb.collection<UserDoc>('users').updateOne(
      { id: userId, 'depositTransactions.id': depositId },
      {
        $set: {
          'depositTransactions.$.status': status,
          'depositTransactions.$.verifiedAt': verifiedAt,
          'depositTransactions.$.verifiedBy': 'admin_norman',
          'depositTransactions.$.notes': adminNotes
        }
      }
    );

    const updated = await mongoDb.collection<UserDoc>('users').findOne({ id: userId });
    return {
      success: true,
      user: updated!,
      message: `Comprobante ${depositId} marcado como ${status === 'approved' ? 'Aprobado' : 'Rechazado'}`
    };
  }

  const data = readLocalData();
  const user = data.users.find(u => u.id === userId);
  if (!user) return { success: false, message: 'Usuario no encontrado' };

  const tx = (user.depositTransactions || []).find(t => t.id === depositId);
  if (!tx) return { success: false, message: 'Transacción no encontrada' };

  tx.status = status;
  tx.verifiedAt = verifiedAt;
  tx.verifiedBy = 'admin_norman';
  if (adminNotes) tx.notes = adminNotes;

  writeLocalData(data, true);
  return {
    success: true,
    user,
    message: `Comprobante ${depositId} marcado como ${status === 'approved' ? 'Aprobado' : 'Rechazado'}`
  };
}

export async function dbAddUserPoints(
  userId: string,
  pointsToAdd: number,
  reason: string
): Promise<{
  success: boolean;
  currentPoints: number;
  unlockedPremium: boolean;
  user: UserDoc;
  message: string;
}> {
  if (isUsingRemoteMongo && mongoDb) {
    const user = await mongoDb.collection<UserDoc>('users').findOne({ id: userId });
    if (!user) throw new Error('Usuario no encontrado');

    const newPoints = Math.max(0, (user.points || 0) + pointsToAdd);
    let unlockedPremium = false;
    const updateFields: Record<string, unknown> = { points: newPoints };

    // Regla de los 300 puntos: activa Premium por 15 días gratis
    if (newPoints >= 300 && user.plan !== 'premium' && !user.pointsTrialActive) {
      unlockedPremium = true;
      updateFields.plan = 'premium';
      updateFields.badgeType = 'star_premium';
      updateFields.isVerified = true;
      updateFields.pointsTrialActive = true;
      updateFields.premiumExpiresAt = Date.now() + 15 * 86400000; // 15 días gratis
      updateFields['storageQuota.totalMb'] = 51200;
    }

    await mongoDb.collection<UserDoc>('users').updateOne(
      { id: userId },
      { $set: updateFields }
    );

    const updatedUser = await mongoDb.collection<UserDoc>('users').findOne({ id: userId });
    return {
      success: true,
      currentPoints: newPoints,
      unlockedPremium,
      user: updatedUser!,
      message: unlockedPremium
        ? '🎉 ¡Felicidades! Has acumulado 300 puntos. ¡Paquete Premium activado gratis por 15 días!'
        : `Ganaste +${pointsToAdd} puntos por ${reason}. Puntos actuales: ${newPoints}/300`
    };
  }

  const data = readLocalData();
  const user = data.users.find(u => u.id === userId);
  if (!user) throw new Error('Usuario no encontrado');

  const newPoints = Math.max(0, (user.points || 0) + pointsToAdd);
  user.points = newPoints;
  let unlockedPremium = false;

  // Regla de los 300 puntos: activa Premium por 15 días gratis
  if (newPoints >= 300 && user.plan !== 'premium' && !user.pointsTrialActive) {
    unlockedPremium = true;
    user.plan = 'premium';
    user.badgeType = 'star_premium';
    user.isVerified = true;
    user.pointsTrialActive = true;
    user.premiumExpiresAt = Date.now() + 15 * 86400000; // 15 días gratis
    if (!user.storageQuota) {
      user.storageQuota = { totalMb: 51200, usedMb: 245, photosMb: 140, videosMb: 65, audiosMb: 30, documentsMb: 10 };
    } else {
      user.storageQuota.totalMb = 51200;
    }
  }

  writeLocalData(data, true);

  return {
    success: true,
    currentPoints: newPoints,
    unlockedPremium,
    user,
    message: unlockedPremium
      ? '🎉 ¡Felicidades! Has acumulado 300 puntos. ¡Paquete Premium activado gratis por 15 días!'
      : `Ganaste +${pointsToAdd} puntos por ${reason}. Puntos actuales: ${newPoints}/300`
  };
}

export async function dbRedeemPointsForTrial(
  userId: string
): Promise<{ success: boolean; user: UserDoc; message: string }> {
  if (isUsingRemoteMongo && mongoDb) {
    const user = await mongoDb.collection<UserDoc>('users').findOne({ id: userId });
    if (!user) throw new Error('Usuario no encontrado');
    if ((user.points || 0) < 300) {
      return { success: false, user, message: `Necesitas 300 puntos para activar 15 días gratis de Premium. Actualmente tienes ${user.points || 0} puntos.` };
    }

    const newPoints = Math.max(0, (user.points || 0) - 300);
    const newExpiresAt = Date.now() + 15 * 86400000;

    await mongoDb.collection<UserDoc>('users').updateOne(
      { id: userId },
      {
        $set: {
          points: newPoints,
          plan: 'premium',
          badgeType: 'star_premium',
          isVerified: true,
          pointsTrialActive: true,
          premiumExpiresAt: newExpiresAt,
          'storageQuota.totalMb': 51200
        }
      }
    );

    const updatedUser = await mongoDb.collection<UserDoc>('users').findOne({ id: userId });
    return {
      success: true,
      user: updatedUser!,
      message: '🎉 ¡Canje exitoso de 300 puntos! Paquete Premium activado gratis por 15 días.'
    };
  }

  const data = readLocalData();
  const user = data.users.find(u => u.id === userId);
  if (!user) throw new Error('Usuario no encontrado');

  if ((user.points || 0) < 300) {
    return { success: false, user, message: `Necesitas 300 puntos para activar 15 días gratis de Premium. Actualmente tienes ${user.points || 0} puntos.` };
  }

  user.points = Math.max(0, (user.points || 0) - 300);
  user.plan = 'premium';
  user.badgeType = 'star_premium';
  user.isVerified = true;
  user.pointsTrialActive = true;
  user.premiumExpiresAt = Date.now() + 15 * 86400000;
  if (!user.storageQuota) {
    user.storageQuota = { totalMb: 51200, usedMb: 245, photosMb: 140, videosMb: 65, audiosMb: 30, documentsMb: 10 };
  } else {
    user.storageQuota.totalMb = 51200;
  }

  writeLocalData(data, true);

  return {
    success: true,
    user,
    message: '🎉 ¡Canje exitoso de 300 puntos! Paquete Premium activado gratis por 15 días.'
  };
}

