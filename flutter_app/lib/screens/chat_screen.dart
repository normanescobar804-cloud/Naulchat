import 'package:flutter/material.dart';

import '../models/chat_models.dart';
import '../services/mock_backend.dart';

class ChatScreen extends StatefulWidget {
  const ChatScreen({
    super.key,
    this.onOpenProfile,
    this.onOpenSettings,
  });

  final VoidCallback? onOpenProfile;
  final VoidCallback? onOpenSettings;

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final TextEditingController _messageController = TextEditingController();
  late final ValueNotifier<String> _activeConversationId;

  @override
  void initState() {
    super.initState();
    _activeConversationId = ValueNotifier<String>(AppBackend.getConversations().first.id);
  }

  @override
  void dispose() {
    _messageController.dispose();
    _activeConversationId.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final mobile = MediaQuery.of(context).size.width < 900;
    final conversations = AppBackend.getConversations();
    final activeConversation = conversations.firstWhere(
      (c) => c.id == _activeConversationId.value,
      orElse: () => conversations.first,
    );

    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Color(0xFF07121E), Color(0xFF0B1728), Color(0xFF07121E)],
          ),
        ),
        child: SafeArea(
          child: mobile
              ? _MobileChatLayout(
                  activeConversationId: _activeConversationId,
                  onSendMessage: _handleSendMessage,
                  messageController: _messageController,
                  onOpenProfile: widget.onOpenProfile,
                  onOpenSettings: widget.onOpenSettings,
                )
              : Row(
                  children: [
                    Expanded(
                      flex: 2,
                      child: _Sidebar(
                        conversations: conversations,
                        activeConversationId: _activeConversationId,
                        onOpenProfile: widget.onOpenProfile,
                        onOpenSettings: widget.onOpenSettings,
                      ),
                    ),
                    Expanded(
                      flex: 4,
                      child: _ChatMainPanel(
                        conversation: activeConversation,
                        messages: AppBackend.getMessages(activeConversation.id),
                        onSendMessage: _handleSendMessage,
                        controller: _messageController,
                      ),
                    ),
                  ],
                ),
        ),
      ),
    );
  }

  void _handleSendMessage() {
    final text = _messageController.text.trim();
    if (text.isEmpty) return;

    AppBackend.sendMessage(_activeConversationId.value, text);
    _messageController.clear();
    setState(() {});
  }
}

class _Sidebar extends StatelessWidget {
  const _Sidebar({
    required this.conversations,
    required this.activeConversationId,
    this.onOpenProfile,
    this.onOpenSettings,
  });

  final List<Conversation> conversations;
  final ValueNotifier<String> activeConversationId;
  final VoidCallback? onOpenProfile;
  final VoidCallback? onOpenSettings;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        border: Border(right: BorderSide(color: Color(0xFF1A2B40))),
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(18, 18, 18, 12),
            child: Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: const BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: LinearGradient(
                      colors: [Color(0xFF1D9BF0), Color(0xFF5BB7FF)],
                    ),
                  ),
                  child: const Icon(Icons.chat_bubble_outline, size: 20),
                ),
                const SizedBox(width: 12),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Naul Chat',
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w700,
                          fontSize: 22,
                        ),
                      ),
                      Text(
                        'Nicaragua siempre conectada',
                        style: TextStyle(
                          color: Color(0xFF7FC6FF),
                          fontSize: 11,
                        ),
                      ),
                    ],
                  ),
                ),
                Row(
                  children: [
                    IconButton(
                      onPressed: onOpenProfile,
                      icon: const Icon(Icons.person_outline, color: Colors.white, size: 20),
                    ),
                    IconButton(
                      onPressed: onOpenSettings,
                      icon: const Icon(Icons.settings_outlined, color: Colors.white, size: 20),
                    ),
                  ],
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 14),
            child: TextField(
              decoration: InputDecoration(
                filled: true,
                fillColor: const Color(0xFF101D2C),
                hintText: 'Buscar contacto',
                hintStyle: const TextStyle(color: Color(0xFF7F93AD)),
                prefixIcon: const Icon(Icons.search, color: Color(0xFF7F93AD)),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: BorderSide.none,
                ),
                contentPadding: const EdgeInsets.symmetric(vertical: 14),
              ),
            ),
          ),
          const SizedBox(height: 12),
          Expanded(
            child: ListView.builder(
              itemCount: conversations.length,
              itemBuilder: (context, index) {
                final conversation = conversations[index];
                final isSelected = activeConversationId.value == conversation.id;

                return InkWell(
                  onTap: () => activeConversationId.value = conversation.id,
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    decoration: BoxDecoration(
                      color: isSelected ? const Color(0xFF12243A) : Colors.transparent,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Row(
                      children: [
                        CircleAvatar(
                          radius: 24,
                          backgroundColor: conversation.color,
                          child: Text(
                            conversation.title.substring(0, 1),
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 18,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Expanded(
                                    child: Text(
                                      conversation.title,
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 15,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ),
                                  if (conversation.unreadCount > 0)
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFF2A9DFF),
                                        borderRadius: BorderRadius.circular(999),
                                      ),
                                      child: Text(
                                        conversation.unreadCount.toString(),
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontSize: 11,
                                          fontWeight: FontWeight.w700,
                                        ),
                                      ),
                                    ),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Text(
                                conversation.isOnline ? 'En línea' : 'Últ. vez hace un momento',
                                style: const TextStyle(
                                  color: Color(0xFF81A3C5),
                                  fontSize: 11,
                                ),
                              ),
                              const SizedBox(height: 3),
                              Text(
                                conversation.lastMessage,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(
                                  color: Color(0xFFB7C8DA),
                                  fontSize: 12,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _MobileChatLayout extends StatefulWidget {
  const _MobileChatLayout({
    required this.activeConversationId,
    required this.onSendMessage,
    required this.messageController,
    this.onOpenProfile,
    this.onOpenSettings,
  });

  final ValueNotifier<String> activeConversationId;
  final VoidCallback onSendMessage;
  final TextEditingController messageController;
  final VoidCallback? onOpenProfile;
  final VoidCallback? onOpenSettings;

  @override
  State<_MobileChatLayout> createState() => _MobileChatLayoutState();
}

class _MobileChatLayoutState extends State<_MobileChatLayout> {
  bool showChats = false;

  @override
  Widget build(BuildContext context) {
    final conversation = conversations.firstWhere(
      (item) => item.id == widget.activeConversationId.value,
      orElse: () => conversations.first,
    );

    final messages = messagesByConversation[conversation.id] ?? const [];

    if (!showChats) {
      return _Sidebar(
        conversations: conversations,
        activeConversationId: widget.activeConversationId,
        onOpenProfile: widget.onOpenProfile,
        onOpenSettings: widget.onOpenSettings,
      );
    }

    return _ChatMainPanel(
      conversation: conversation,
      messages: messages,
      onSendMessage: widget.onSendMessage,
      controller: widget.messageController,
      onBack: () => setState(() => showChats = false),
    );
  }
}

class _ChatMainPanel extends StatelessWidget {
  const _ChatMainPanel({
    required this.conversation,
    required this.messages,
    required this.onSendMessage,
    required this.controller,
    this.onBack,
  });

  final Conversation conversation;
  final List<ChatMessage> messages;
  final VoidCallback onSendMessage;
  final TextEditingController controller;
  final VoidCallback? onBack;

  @override
  Widget build(BuildContext context) {
    return Container(
      color: const Color(0xFF081522),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
            decoration: const BoxDecoration(
              border: Border(bottom: BorderSide(color: Color(0xFF1A2B40), width: 1)),
            ),
            child: Row(
              children: [
                if (onBack != null)
                  IconButton(
                    onPressed: onBack,
                    icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Color(0xFF92C8FF)),
                  ),
                CircleAvatar(
                  radius: 20,
                  backgroundColor: conversation.color,
                  child: Text(
                    conversation.title.substring(0, 1),
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        conversation.title,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      Text(
                        conversation.isOnline ? 'En línea ahora' : 'Últ. vez hace un momento',
                        style: const TextStyle(
                          color: Color(0xFF8AB5E3),
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  onPressed: () {},
                  icon: const Icon(Icons.call_outlined, color: Color(0xFF92C8FF)),
                ),
                IconButton(
                  onPressed: () {},
                  icon: const Icon(Icons.videocam_outlined, color: Color(0xFF92C8FF)),
                ),
                IconButton(
                  onPressed: () {},
                  icon: const Icon(Icons.lock_outline, color: Color(0xFF92C8FF)),
                ),
              ],
            ),
          ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: messages.length,
              reverse: false,
              itemBuilder: (context, index) {
                final message = messages[index];
                final itemKey = ValueKey(message.id);

                return TweenAnimationBuilder<double>(
                  tween: Tween<double>(begin: 0.0, end: 1.0),
                  duration: const Duration(milliseconds: 280),
                  curve: Curves.easeOutBack,
                  builder: (context, value, child) {
                    return Transform.scale(
                      scale: 0.96 + (value * 0.04),
                      alignment: message.isMe ? Alignment.centerRight : Alignment.centerLeft,
                      child: Opacity(
                        opacity: value,
                        child: child,
                      ),
                    );
                  },
                  child: Align(
                    key: itemKey,
                    alignment: message.isMe ? Alignment.centerRight : Alignment.centerLeft,
                    child: Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      constraints: const BoxConstraints(maxWidth: 380),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      decoration: BoxDecoration(
                        color: message.isMe ? const Color(0xFF1D7EF2) : const Color(0xFF12263C),
                        borderRadius: BorderRadius.only(
                          topLeft: const Radius.circular(18),
                          topRight: const Radius.circular(18),
                          bottomLeft: Radius.circular(message.isMe ? 18 : 6),
                          bottomRight: Radius.circular(message.isMe ? 6 : 18),
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.12),
                            blurRadius: 12,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            message.text,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 14,
                              height: 1.45,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                _formatTime(message.timestamp),
                                style: TextStyle(
                                  color: message.isMe ? Colors.white70 : const Color(0xFF9FBAD1),
                                  fontSize: 10,
                                ),
                              ),
                              const SizedBox(width: 5),
                              if (message.isEncrypted)
                                Icon(
                                  Icons.lock,
                                  size: 12,
                                  color: message.isMe ? Colors.white70 : const Color(0xFF9FBAD1),
                                ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
          AnimatedContainer(
            duration: const Duration(milliseconds: 220),
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 18),
            decoration: const BoxDecoration(
              border: Border(top: BorderSide(color: Color(0xFF1A2B40), width: 1)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    padding: const EdgeInsets.symmetric(horizontal: 14),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0F1E2E),
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(
                        color: const Color(0xFF1A2B40),
                      ),
                    ),
                    child: TextField(
                      controller: controller,
                      style: const TextStyle(color: Colors.white),
                      decoration: const InputDecoration(
                        hintText: 'Escribe un mensaje...',
                        hintStyle: TextStyle(color: Color(0xFF8AA6C8)),
                        border: InputBorder.none,
                        focusedBorder: InputBorder.none,
                        enabledBorder: InputBorder.none,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                TweenAnimationBuilder<double>(
                  tween: Tween<double>(begin: 1.0, end: 1.0),
                  duration: const Duration(milliseconds: 180),
                  builder: (context, value, child) {
                    return Transform.scale(
                      scale: value,
                      child: child,
                    );
                  },
                  child: GestureDetector(
                    onTap: onSendMessage,
                    child: Container(
                      width: 52,
                      height: 52,
                      decoration: const BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: LinearGradient(
                          colors: [Color(0xFF2A9DFF), Color(0xFF1CD5B5)],
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: Color(0xFF1CD5B5),
                            blurRadius: 16,
                            spreadRadius: 1,
                            offset: Offset(0, 6),
                          ),
                        ],
                      ),
                      child: const Icon(Icons.send_rounded, color: Colors.white),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _formatTime(DateTime timestamp) {
    final hour = timestamp.hour.toString().padLeft(2, '0');
    final minute = timestamp.minute.toString().padLeft(2, '0');
    return '$hour:$minute';
  }
}
