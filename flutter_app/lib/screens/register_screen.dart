import 'package:flutter/material.dart';

import '../widgets/auth_form.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({
    super.key,
    required this.onRegister,
    required this.onBackToLogin,
  });

  final VoidCallback onRegister;
  final VoidCallback onBackToLogin;

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _nameController = TextEditingController(text: 'Nicolás');
  final _emailController = TextEditingController(text: 'nicolas@naulchat.com');
  final _passwordController = TextEditingController(text: '123456');

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF07121E),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          onPressed: widget.onBackToLogin,
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white),
        ),
      ),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              children: [
                AuthForm(
                  title: 'Crear cuenta',
                  subtitle: 'Únete a Naul Chat',
                  emailController: _emailController,
                  passwordController: _passwordController,
                  nameController: _nameController,
                  showNameField: true,
                  primaryLabel: 'Registrarme',
                  onSubmit: widget.onRegister,
                  secondaryLabel: 'Inicia sesión',
                  onSecondary: widget.onBackToLogin,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
