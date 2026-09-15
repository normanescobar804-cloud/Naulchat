import 'package:flutter/material.dart';

import '../widgets/auth_form.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({
    super.key,
    required this.onLogin,
    required this.onCreateAccount,
    required this.onForgotPassword,
  });

  final VoidCallback onLogin;
  final VoidCallback onCreateAccount;
  final VoidCallback onForgotPassword;

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController(text: 'yo@naulchat.com');
  final _passwordController = TextEditingController(text: '123456');

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF07121E),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              children: [
                const SizedBox(height: 12),
                AuthForm(
                  title: 'Inicia sesión',
                  subtitle: 'Bienvenido a Naul Chat',
                  emailController: _emailController,
                  passwordController: _passwordController,
                  primaryLabel: 'Iniciar sesión',
                  onSubmit: widget.onLogin,
                  secondaryLabel: 'Crear cuenta',
                  onSecondary: widget.onCreateAccount,
                ),
                const SizedBox(height: 16),
                TextButton(
                  onPressed: widget.onForgotPassword,
                  child: const Text(
                    '¿Olvidaste tu contraseña?',
                    style: TextStyle(color: Color(0xFF7FC6FF)),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
