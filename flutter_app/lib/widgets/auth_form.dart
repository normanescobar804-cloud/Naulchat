import 'package:flutter/material.dart';

class AuthForm extends StatelessWidget {
  const AuthForm({
    super.key,
    required this.title,
    this.subtitle,
    required this.emailController,
    required this.passwordController,
    required this.onSubmit,
    this.onSecondary,
    this.primaryLabel = 'Continuar',
    this.secondaryLabel,
    this.showNameField = false,
    this.nameController,
  });

  final String title;
  final String? subtitle;
  final TextEditingController emailController;
  final TextEditingController passwordController;
  final VoidCallback onSubmit;
  final VoidCallback? onSecondary;
  final String primaryLabel;
  final String? secondaryLabel;
  final bool showNameField;
  final TextEditingController? nameController;

  @override
  Widget build(BuildContext context) {
    final obscure = ValueNotifier<bool>(true);

    return Container(
      width: 420,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: const Color(0xFF0D1A2B),
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: const Color(0xFF1E3550)),
      ),
      child: ValueListenableBuilder<bool>(
        valueListenable: obscure,
        builder: (context, isObscured, _) {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 28,
                  fontWeight: FontWeight.w700,
                ),
              ),
              if (subtitle != null) ...[
                const SizedBox(height: 8),
                Text(
                  subtitle!,
                  style: const TextStyle(color: Color(0xFF9DB6D8)),
                ),
              ],
              const SizedBox(height: 24),
              if (showNameField && nameController != null) ...[
                TextField(
                  controller: nameController,
                  style: const TextStyle(color: Colors.white),
                  decoration: InputDecoration(
                    filled: true,
                    fillColor: const Color(0xFF101D2C),
                    hintText: 'Nombre completo',
                    hintStyle: const TextStyle(color: Color(0xFF7F93AD)),
                    prefixIcon: const Icon(Icons.person_outline, color: Color(0xFF7F93AD)),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                      borderSide: BorderSide.none,
                    ),
                  ),
                ),
                const SizedBox(height: 16),
              ],
              TextField(
                controller: emailController,
                keyboardType: TextInputType.emailAddress,
                style: const TextStyle(color: Colors.white),
                decoration: InputDecoration(
                  filled: true,
                  fillColor: const Color(0xFF101D2C),
                  hintText: 'Correo electrónico',
                  hintStyle: const TextStyle(color: Color(0xFF7F93AD)),
                  prefixIcon: const Icon(Icons.email_outlined, color: Color(0xFF7F93AD)),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: BorderSide.none,
                  ),
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: passwordController,
                obscureText: isObscured,
                style: const TextStyle(color: Colors.white),
                decoration: InputDecoration(
                  filled: true,
                  fillColor: const Color(0xFF101D2C),
                  hintText: 'Contraseña',
                  hintStyle: const TextStyle(color: Color(0xFF7F93AD)),
                  prefixIcon: const Icon(Icons.lock_outline, color: Color(0xFF7F93AD)),
                  suffixIcon: IconButton(
                    onPressed: () => obscure.value = !isObscured,
                    icon: Icon(
                      isObscured ? Icons.visibility : Icons.visibility_off,
                      color: const Color(0xFF7F93AD),
                    ),
                  ),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: BorderSide.none,
                  ),
                ),
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: onSubmit,
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    backgroundColor: const Color(0xFF2A9DFF),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                  child: Text(
                    primaryLabel,
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                  ),
                ),
              ),
              if (secondaryLabel != null && onSecondary != null) ...[
                const SizedBox(height: 12),
                TextButton(
                  onPressed: onSecondary,
                  child: Text(
                    secondaryLabel!,
                    style: const TextStyle(color: Color(0xFF7FC6FF), fontWeight: FontWeight.w600),
                  ),
                ),
              ],
            ],
          );
        },
      ),
    );
  }
}
