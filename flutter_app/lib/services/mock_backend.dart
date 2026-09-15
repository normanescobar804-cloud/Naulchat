import 'package:flutter/material.dart';

import '../models/chat_models.dart';

class AppBackend {
  AppBackend._();

  static ChatUser currentUser = ChatUser(
    id: 'me',
    name: 'Yuriel',
    email: 'yo@naulchat.com',
    avatar: 'Y',
    status: 'Disponible',
    color: const Color(0xFF2A9DFF),
  );

  static final List<ChatUser> _users = [
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

  static List<Conversation> conversations = [
    Conversation(
      id: 'c1',
      title: 'Yuri',
      participants: [currentUser, _users[0]],
      lastMessage: '¡Quedó súper nítido el diseño!',
      unreadCount: 3,
      isOnline: true,
      color: const Color(0xFF5AA9FF),
    ),
    Conversation(
      id: 'c2',
      title: 'Ariana',
      participants: [currentUser, _users[1]],
      lastMessage: 'Te envié la propuesta final.',
      unreadCount: 1,
      isOnline: false,
      color: const Color(0xFF8D6BFF),
    ),
    Conversation(
      id: 'c3',
      title: 'Equipo',
      participants: [currentUser, _users[2]],
      lastMessage: 'Todo listo para la reunión.',
      unreadCount: 5,
      isOnline: true,
      color: const Color(0xFF1CD5B5),
    ),
  ];

  static final Map<String, List<ChatMessage>> messagesByConversation = {
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
        senderName: 'Yuriel',
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
        senderName: 'Yuriel',
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
        senderName: 'Yuriel',
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

  static bool login(String email, String password) {
    final validEmail = email.trim().isNotEmpty;
    final validPassword = password.trim().length >= 4;
    if (!validEmail || !validPassword) {
      return false;
    }

    currentUser = ChatUser(
      id: 'me',
      name: 'Yuriel',
      email: email.trim(),
      avatar: 'Y',
      status: 'Disponible',
      color: const Color(0xFF2A9DFF),
    );

    return true;
  }

  static bool register(String name, String email, String password) {
    if (name.trim().isEmpty || email.trim().isEmpty || password.trim().length < 4) {
      return false;
    }

    currentUser = ChatUser(
      id: 'me',
      name: name.trim(),
      email: email.trim(),
      avatar: name.trim().isNotEmpty ? name.trim().substring(0, 1).toUpperCase() : 'Y',
      status: 'Disponible',
      color: const Color(0xFF2A9DFF),
    );

    return true;
  }

  static List<Conversation> getConversations() => conversations;

  static List<ChatMessage> getMessages(String conversationId) {
    return messagesByConversation[conversationId] ?? const [];
  }

  static void sendMessage(String conversationId, String text) {
    final cleanText = text.trim();
    if (cleanText.isEmpty) {
      return;
    }

    final message = ChatMessage(
      id: 'm-${DateTime.now().millisecondsSinceEpoch}',
      senderId: currentUser.id,
      senderName: currentUser.name,
      text: cleanText,
      timestamp: DateTime.now(),
      isMe: true,
    );

    final existing = messagesByConversation[conversationId] ?? <ChatMessage>[];
    messagesByConversation[conversationId] = [...existing, message];

    final conversationIndex = conversations.indexWhere((c) => c.id == conversationId);
    if (conversationIndex >= 0) {
      conversations[conversationIndex] = Conversation(
        id: conversations[conversationIndex].id,
        title: conversations[conversationIndex].title,
        participants: conversations[conversationIndex].participants,
        lastMessage: cleanText,
        unreadCount: 0,
        isOnline: conversations[conversationIndex].isOnline,
        color: conversations[conversationIndex].color,
      );
    }
  }
}
