import 'package:flutter/material.dart';

import '../models/chat_models.dart';
import '../services/mock_backend.dart';

class AppState extends ChangeNotifier {
  AppState() {
    _reloadData();
  }

  bool _isAuthenticated = false;
  String _selectedConversationId = 'c1';
  String _currentUserName = 'Yuriel';

  bool get isAuthenticated => _isAuthenticated;
  String get selectedConversationId => _selectedConversationId;
  String get currentUserName => _currentUserName;

  List<Conversation> get conversations => AppBackend.getConversations();

  List<ChatMessage> getMessages(String conversationId) => AppBackend.getMessages(conversationId);

  void _reloadData() {
    if (AppBackend.currentUser.name.isNotEmpty) {
      _currentUserName = AppBackend.currentUser.name;
    }
    notifyListeners();
  }

  void login(String email, String password) {
    final ok = AppBackend.login(email, password);
    if (ok) {
      _isAuthenticated = true;
      _currentUserName = AppBackend.currentUser.name;
      notifyListeners();
    }
  }

  void register(String name, String email, String password) {
    final ok = AppBackend.register(name, email, password);
    if (ok) {
      _isAuthenticated = true;
      _currentUserName = AppBackend.currentUser.name;
      notifyListeners();
    }
  }

  void logout() {
    _isAuthenticated = false;
    notifyListeners();
  }

  void selectConversation(String id) {
    _selectedConversationId = id;
    notifyListeners();
  }

  void sendMessage(String text) {
    if (!_isAuthenticated) return;
    AppBackend.sendMessage(_selectedConversationId, text);
    notifyListeners();
  }
}
