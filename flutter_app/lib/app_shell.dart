import 'package:flutter/material.dart';

import 'services/auth_service.dart';
import 'services/mock_backend.dart';
import 'screens/chat_screen.dart';
import 'screens/forgot_password_screen.dart';
import 'screens/login_screen.dart';
import 'screens/profile_screen.dart';
import 'screens/register_screen.dart';
import 'screens/settings_screen.dart';

class AppShell extends StatefulWidget {
  const AppShell({super.key});

  @override
  State<AppShell> createState() => _AppShellState();
}

class _AppShellState extends State<AppShell> {
  enum Screen { login, register, forgot, chat, profile, settings }

  final AuthService _authService = AuthService();
  Screen _currentScreen = Screen.login;

  void _handleLogin() {
    setState(() {
      _currentScreen = Screen.chat;
    });
  }

  void _handleRegister() {
    setState(() {
      _currentScreen = Screen.chat;
    });
  }

  void _handleLogout() {
    _authService.logout();
    setState(() {
      _currentScreen = Screen.login;
    });
  }

  @override
  Widget build(BuildContext context) {
    switch (_currentScreen) {
      case Screen.login:
        return LoginScreen(
          onLogin: () {
            final ok = _authService.login('yo@naulchat.com', '123456');
            if (ok) {
              AppBackend.login('yo@naulchat.com', '123456');
              _handleLogin();
            }
          },
          onCreateAccount: () => setState(() => _currentScreen = Screen.register),
          onForgotPassword: () => setState(() => _currentScreen = Screen.forgot),
        );
      case Screen.register:
        return RegisterScreen(
          onRegister: () {
            final ok = _authService.register('Yuriel', 'yo@naulchat.com', '123456');
            if (ok) {
              AppBackend.register('Yuriel', 'yo@naulchat.com', '123456');
              _handleRegister();
            }
          },
          onBackToLogin: () => setState(() => _currentScreen = Screen.login),
        );
      case Screen.forgot:
        return ForgotPasswordScreen(
          onBackToLogin: () => setState(() => _currentScreen = Screen.login),
        );
      case Screen.chat:
        return ChatScreen(
          onOpenProfile: () => setState(() => _currentScreen = Screen.profile),
          onOpenSettings: () => setState(() => _currentScreen = Screen.settings),
        );
      case Screen.profile:
        return ProfileScreen(
          onOpenSettings: () => setState(() => _currentScreen = Screen.settings),
          onSecurity: () {},
        );
      case Screen.settings:
        return SettingsScreen(
          onBack: () => setState(() => _currentScreen = Screen.profile),
          onLogout: _handleLogout,
        );
    }
  }
}
