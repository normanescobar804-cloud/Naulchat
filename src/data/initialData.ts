import { User, Conversation, Message } from '../types';
import { generateFingerprint, generateWaveform } from '../utils/security';

export const CURRENT_USER: User = {
  id: 'user-me',
  name: 'Norman Escobar',
  username: '@normanescobar',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  status: 'online',
  isVerified: true,
  verificationType: 'biometric',
  phone: '+505 8899 4432',
  email: 'normanescobar804@gmail.com',
  bio: 'La disciplina te lleva lejos. 💪',
  location: 'Managua, Nicaragua',
  biometricRegistered: true,
  emailVerified: true,
  publicKeyFingerprint: generateFingerprint('user-me'),
};

export const INITIAL_USERS: Record<string, User> = {
  'user-yuri': {
    id: 'user-yuri',
    name: 'Yuri',
    username: '@yuri_dev',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    status: 'online',
    isVerified: true,
    verificationType: 'official',
    phone: '+505 8765 4321',
    email: 'yuri@dev.ni',
    bio: 'Desarrollador Full Stack en Managua 💻🇳🇮',
    location: 'Managua, Nicaragua',
    biometricRegistered: true,
    emailVerified: true,
    publicKeyFingerprint: generateFingerprint('user-yuri'),
  },
  'user-mama': {
    id: 'user-mama',
    name: 'Mamá',
    username: '@mama_escobar',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    status: 'online',
    isVerified: true,
    verificationType: 'biometric',
    phone: '+505 8234 5678',
    email: 'familia@gmail.com',
    bio: 'La familia es lo primero ❤️',
    location: 'Granada, Nicaragua',
    biometricRegistered: true,
    emailVerified: true,
    publicKeyFingerprint: generateFingerprint('user-mama'),
  },
  'user-carlos': {
    id: 'user-carlos',
    name: 'Carlos',
    username: '@carlos_amigo',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    status: 'online',
    isVerified: true,
    verificationType: 'cedula',
    phone: '+505 8734 1120',
    email: 'carlos.amigos@gmail.com',
    bio: 'Amigos de siempre ⚽🛵',
    location: 'Masaya, Nicaragua',
    biometricRegistered: true,
    emailVerified: true,
    publicKeyFingerprint: generateFingerprint('user-carlos'),
  },
  'user-jefe': {
    id: 'user-jefe',
    name: 'Jefe',
    username: '@director_trabajo',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    status: 'away',
    lastSeen: '08:30',
    isVerified: true,
    verificationType: 'business',
    phone: '+505 8912 3004',
    email: 'gerencia@empresa.com.ni',
    bio: 'Gestión de proyectos tecnológicos corporativos',
    location: 'Plaza España, Managua',
    biometricRegistered: true,
    emailVerified: true,
    publicKeyFingerprint: generateFingerprint('user-jefe'),
  },
  'user-joel': {
    id: 'user-joel',
    name: 'Joel',
    username: '@joel_nica',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
    status: 'online',
    isVerified: true,
    verificationType: 'official',
    phone: '+505 8811 2233',
    email: 'joel@nicaragua.org',
    bio: 'Orgullosamente Pinolero 🇳🇮',
    location: 'León, Nicaragua',
    biometricRegistered: true,
    emailVerified: true,
    publicKeyFingerprint: generateFingerprint('user-joel'),
  },
  'user-luis': {
    id: 'user-luis',
    name: 'Luis',
    username: '@luis_deportes',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
    status: 'offline',
    lastSeen: 'Lunes',
    isVerified: true,
    verificationType: 'cedula',
    phone: '+505 8555 4411',
    email: 'luis.futbol@gmail.com',
    bio: 'Fútbol, entrenamiento y disciplina deportiva ⚽🥇',
    location: 'Estelí, Nicaragua',
    biometricRegistered: true,
    emailVerified: true,
    publicKeyFingerprint: generateFingerprint('user-luis'),
  }
};

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-familia',
    type: 'group',
    name: 'Familia',
    avatar: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=200&auto=format&fit=crop&q=80',
    isVerified: true,
    verificationType: 'official',
    participants: [CURRENT_USER, INITIAL_USERS['user-mama']],
    unreadCount: 2,
    isPinned: true,
    e2eeKeyFingerprint: generateFingerprint('conv-familia'),
    description: 'Grupo familiar con cifrado de extremo a extremo.'
  },
  {
    id: 'conv-amigos',
    type: 'group',
    name: 'Amigos del barrio',
    avatar: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=200&auto=format&fit=crop&q=80',
    isVerified: false,
    participants: [CURRENT_USER, INITIAL_USERS['user-carlos']],
    unreadCount: 1,
    isPinned: true,
    e2eeKeyFingerprint: generateFingerprint('conv-amigos'),
    description: 'Grupo de amigos del barrio - Fútbol, salidas y café.'
  },
  {
    id: 'conv-trabajo',
    type: 'group',
    name: 'Trabajo',
    avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&auto=format&fit=crop&q=80',
    isVerified: true,
    verificationType: 'business',
    participants: [CURRENT_USER, INITIAL_USERS['user-jefe']],
    unreadCount: 1,
    e2eeKeyFingerprint: generateFingerprint('conv-trabajo'),
    description: 'Canal de proyectos y coordinación de equipo.'
  },
  {
    id: 'conv-grupo-nicaragua',
    type: 'group',
    name: 'Grupo Nicaragua',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
    isVerified: true,
    verificationType: 'official',
    participants: [CURRENT_USER, INITIAL_USERS['user-joel']],
    unreadCount: 0,
    e2eeKeyFingerprint: generateFingerprint('conv-nicaragua'),
    description: 'Comunidad nacional de usuarios de Naul Chat Nicaragua 🇳🇮'
  },
  {
    id: 'conv-yuri',
    type: 'direct',
    name: 'Yuri',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    isVerified: true,
    verificationType: 'biometric',
    participants: [CURRENT_USER, INITIAL_USERS['user-yuri']],
    unreadCount: 0,
    e2eeKeyFingerprint: generateFingerprint('user-yuri'),
    description: 'Desarrollador Full Stack • En línea'
  },
  {
    id: 'conv-estudio',
    type: 'group',
    name: 'Estudio',
    avatar: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=200&auto=format&fit=crop&q=80',
    isVerified: false,
    participants: [CURRENT_USER],
    unreadCount: 0,
    e2eeKeyFingerprint: generateFingerprint('conv-estudio'),
    description: 'Compañeros de universidad y proyectos académicos.'
  },
  {
    id: 'conv-deportes',
    type: 'group',
    name: 'Deportes',
    avatar: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=200&auto=format&fit=crop&q=80',
    isVerified: false,
    participants: [CURRENT_USER, INITIAL_USERS['user-luis']],
    unreadCount: 0,
    e2eeKeyFingerprint: generateFingerprint('conv-deportes'),
    description: 'Fútbol 5, liga local y eventos deportivos.'
  }
];

export const INITIAL_MESSAGES: Record<string, Message[]> = {
  'conv-yuri': [
    {
      id: 'm-yuri-1',
      conversationId: 'conv-yuri',
      senderId: 'user-yuri',
      senderName: 'Yuri',
      senderAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
      type: 'text',
      content: 'Bro, ya quedó el proyecto',
      timestamp: Date.now() - 1000 * 60 * 6,
      status: 'read',
      isEncrypted: true,
    },
    {
      id: 'm-yuri-2',
      conversationId: 'conv-yuri',
      senderId: 'user-me',
      senderName: 'Norman Escobar',
      senderAvatar: CURRENT_USER.avatar,
      type: 'text',
      content: '¡Excelente! 👏\nMe alegra bro, ¿cómo va todo?',
      timestamp: Date.now() - 1000 * 60 * 5,
      status: 'read',
      isEncrypted: true,
    },
    {
      id: 'm-yuri-3',
      conversationId: 'conv-yuri',
      senderId: 'user-yuri',
      senderName: 'Yuri',
      senderAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
      type: 'text',
      content: 'Todo bien, ya lo subí al servidor',
      timestamp: Date.now() - 1000 * 60 * 4,
      status: 'read',
      isEncrypted: true,
    },
    {
      id: 'm-yuri-4',
      conversationId: 'conv-yuri',
      senderId: 'user-me',
      senderName: 'Norman Escobar',
      senderAvatar: CURRENT_USER.avatar,
      type: 'text',
      content: 'Perfecto, si necesitas algo me dices.',
      timestamp: Date.now() - 1000 * 60 * 3,
      status: 'read',
      isEncrypted: true,
    },
    {
      id: 'm-yuri-5',
      conversationId: 'conv-yuri',
      senderId: 'user-yuri',
      senderName: 'Yuri',
      senderAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
      type: 'text',
      content: 'Va bro, gracias 🙌',
      timestamp: Date.now() - 1000 * 60 * 2,
      status: 'read',
      isEncrypted: true,
    }
  ],

  'conv-familia': [
    {
      id: 'mf-1',
      conversationId: 'conv-familia',
      senderId: 'user-mama',
      senderName: 'Mamá',
      senderAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
      type: 'text',
      content: 'Mamá: Ya llegué a casa',
      timestamp: Date.now() - 1000 * 60 * 14,
      status: 'read',
      isEncrypted: true,
    },
    {
      id: 'mf-2',
      conversationId: 'conv-familia',
      senderId: 'user-me',
      senderName: 'Norman Escobar',
      senderAvatar: CURRENT_USER.avatar,
      type: 'text',
      content: '¡Qué bueno mamá! Descansa, nos vemos al rato.',
      timestamp: Date.now() - 1000 * 60 * 10,
      status: 'read',
      isEncrypted: true,
    }
  ],

  'conv-amigos': [
    {
      id: 'ma-1',
      conversationId: 'conv-amigos',
      senderId: 'user-carlos',
      senderName: 'Carlos',
      senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      type: 'text',
      content: 'Carlos: Nos vemos más tarde',
      timestamp: Date.now() - 1000 * 60 * 38,
      status: 'read',
      isEncrypted: true,
    }
  ],

  'conv-trabajo': [
    {
      id: 'mt-1',
      conversationId: 'conv-trabajo',
      senderId: 'user-jefe',
      senderName: 'Jefe',
      senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      type: 'text',
      content: 'Jefe: Mañana hay reunión',
      timestamp: Date.now() - 1000 * 60 * 115,
      status: 'read',
      isEncrypted: true,
    }
  ],

  'conv-grupo-nicaragua': [
    {
      id: 'mn-1',
      conversationId: 'conv-grupo-nicaragua',
      senderId: 'user-joel',
      senderName: 'Joel',
      senderAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
      type: 'text',
      content: 'Joel: 🇳🇮',
      timestamp: Date.now() - 1000 * 60 * 60 * 20,
      status: 'read',
      isEncrypted: true,
    }
  ],

  'conv-estudio': [
    {
      id: 'me-1',
      conversationId: 'conv-estudio',
      senderId: 'user-me',
      senderName: 'Norman Escobar',
      senderAvatar: CURRENT_USER.avatar,
      type: 'text',
      content: 'Perfecto, ya revisé los apuntes de la clase.',
      timestamp: Date.now() - 1000 * 60 * 60 * 2,
      status: 'delivered',
      isEncrypted: true,
    }
  ],

  'conv-deportes': [
    {
      id: 'md-1',
      conversationId: 'conv-deportes',
      senderId: 'user-luis',
      senderName: 'Luis',
      senderAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
      type: 'text',
      content: '¡Armemos el partido de este fin de semana!',
      timestamp: Date.now() - 1000 * 60 * 60 * 3,
      status: 'read',
      isEncrypted: true,
    },
    {
      id: 'md-2',
      conversationId: 'conv-deportes',
      senderId: 'user-me',
      senderName: 'Norman Escobar',
      senderAvatar: CURRENT_USER.avatar,
      type: 'text',
      content: '¿A qué hora nos vemos en la cancha?',
      timestamp: Date.now() - 1000 * 60 * 15,
      status: 'sent',
      isEncrypted: true,
    }
  ]
};

// Populate last messages
INITIAL_CONVERSATIONS.forEach(conv => {
  const msgs = INITIAL_MESSAGES[conv.id];
  if (msgs && msgs.length > 0) {
    conv.lastMessage = msgs[msgs.length - 1];
  }
});
