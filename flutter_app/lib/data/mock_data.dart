import 'package:flutter/material.dart';

import '../models/chat_models.dart';

final currentUser = ChatUser(
  id: 'me',
  name: 'Yo',
  email: 'yo@naulchat.com',
  avatar: 'Y',
  status: 'Disponible',
  color: const Color(0xFF2A9DFF),
);

final users = [
  ChatUser(
    id: 'u1',
    name: 'Yuri',
    email: 'yuri@naulchat.com',
    avatar: 'Y',
    status: 'En línea',
    color: const Color(0xFF5AA9FF),
  ),
  ChatUser(
    id: 'u2',
    name: 'Ariana',
    email: 'ariana@naulchat.com',
    avatar: 'A',
    status: 'Últ. vez 5m',
    color: const Color(0xFF8D6BFF),
  ),
  ChatUser(
    id: 'u3',
    name: 'Equipo',
    email: 'team@naulchat.com',
    avatar: 'E',
    status: '12 miembros',
    color: const Color(0xFF1CD5B5),
  ),
];

final conversations = [
  Conversation(
    id: 'c1',
    title: 'Yuri',
    participants: [currentUser, users[0]],
    lastMessage: '¡Quedó súper nítido el diseño!',
    unreadCount: 3,
    isOnline: true,
    color: const Color(0xFF5AA9FF),
  ),
  Conversation(
    id: 'c2',
    title: 'Ariana',
    participants: [currentUser, users[1]],
    lastMessage: 'Te envié la propuesta final.',
    unreadCount: 1,
    isOnline: false,
    color: const Color(0xFF8D6BFF),
  ),
  Conversation(
    id: 'c3',
    title: 'Equipo',
    participants: [currentUser, users[2]],
    lastMessage: 'Todo listo para la reunión.',
    unreadCount: 5,
    isOnline: true,
    color: const Color(0xFF1CD5B5),
  ),
];

final messagesByConversation = {
  'c1': [
    ChatMessage(
      id: 'm1',
      senderId: 'u1',
      senderName: 'Yuri',
      text: '¡Listo! Ya revisé el prototipo del chat de Naul.',
      timestamp: DateTime.now().subtract(const Duration(minutes: 16)),
      isMe: false,
    ),
    ChatMessage(
      id: 'm2',
      senderId: 'me',
      senderName: 'Yo',
      text: 'Perfecto, ahora necesito dejarlo con estilo Flutter.',
      timestamp: DateTime.now().subtract(const Duration(minutes: 15)),
      isMe: true,
    ),
    ChatMessage(
      id: 'm3',
      senderId: 'u1',
      senderName: 'Yuri',
      text: 'Esto queda con mejor sensación móvil y más limpio.',
      timestamp: DateTime.now().subtract(const Duration(minutes: 14)),
      isMe: false,
    ),
    ChatMessage(
      id: 'm4',
      senderId: 'me',
      senderName: 'Yo',
      text: 'Perfecto, sigamos con la versión final del producto.',
      timestamp: DateTime.now().subtract(const Duration(minutes: 13)),
      isMe: true,
    ),
  ],
  'c2': [
    ChatMessage(
      id: 'm5',
      senderId: 'u2',
      senderName: 'Ariana',
      text: 'Necesitamos revisar la estructura de autenticación.',
      timestamp: DateTime.now().subtract(const Duration(minutes: 22)),
      isMe: false,
    ),
    ChatMessage(
      id: 'm6',
      senderId: 'me',
      senderName: 'Yo',
      text: 'Sí, te envío la propuesta mañana.',
      timestamp: DateTime.now().subtract(const Duration(minutes: 21)),
      isMe: true,
    ),
  ],
  'c3': [
    ChatMessage(
      id: 'm7',
      senderId: 'u3',
      senderName: 'Equipo',
      text: 'La demo quedó lista para revisión.',
      timestamp: DateTime.now().subtract(const Duration(minutes: 30)),
      isMe: false,
    ),
  ],
};
