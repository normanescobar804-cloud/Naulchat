import 'package:flutter/material.dart';

class ChatUser {
  ChatUser({
    required this.id,
    required this.name,
    required this.email,
    required this.avatar,
    required this.status,
    this.color = const Color(0xFF2A9DFF),
  });

  final String id;
  final String name;
  final String email;
  final String avatar;
  final String status;
  final Color color;
}

class ChatMessage {
  ChatMessage({
    required this.id,
    required this.senderId,
    required this.senderName,
    required this.text,
    required this.timestamp,
    required this.isMe,
    this.isEncrypted = true,
  });

  final String id;
  final String senderId;
  final String senderName;
  final String text;
  final DateTime timestamp;
  final bool isMe;
  final bool isEncrypted;
}

class Conversation {
  Conversation({
    required this.id,
    required this.title,
    required this.participants,
    required this.lastMessage,
    required this.unreadCount,
    required this.isOnline,
    required this.color,
  });

  final String id;
  final String title;
  final List<ChatUser> participants;
  final String lastMessage;
  final int unreadCount;
  final bool isOnline;
  final Color color;
}
