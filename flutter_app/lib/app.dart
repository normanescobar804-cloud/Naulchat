import 'package:flutter/material.dart';

import 'app_shell.dart';

class NaulChatApp extends StatelessWidget {
  const NaulChatApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Naul Chat',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF07121E),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF2A9DFF),
          secondary: Color(0xFF1CD5B5),
          surface: Color(0xFF0D1A2B),
          background: Color(0xFF07121E),
        ),
        fontFamily: 'Roboto',
      ),
      home: const AppShell(),
    );
  }
}
