import 'package:flutter/material.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({
    super.key,
    required this.onBack,
    required this.onLogout,
  });

  final VoidCallback onBack;
  final VoidCallback onLogout;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF07121E),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          onPressed: onBack,
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white),
        ),
        title: const Text('Ajustes'),
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            _SettingTile(label: 'Cuenta', icon: Icons.person_outline, onTap: () {}),
            _SettingTile(label: 'Privacidad', icon: Icons.shield_outlined, onTap: () {}),
            _SettingTile(label: 'Notificaciones', icon: Icons.notifications_none_rounded, onTap: () {}),
            _SettingTile(label: 'Tema oscuro', icon: Icons.dark_mode_outlined, onTap: () {}),
            _SettingTile(label: 'Idioma', icon: Icons.translate_outlined, onTap: () {}),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: onLogout,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  backgroundColor: const Color(0xFF0D1A2B),
                  foregroundColor: Colors.white,
                  side: const BorderSide(color: Color(0xFF1E3550)),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
                child: const Text('Cerrar sesión'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SettingTile extends StatelessWidget {
  const _SettingTile({
    required this.label,
    required this.icon,
    required this.onTap,
  });

  final String label;
  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: const Color(0xFF0D1A2B),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF1E3550)),
      ),
      child: ListTile(
        leading: Icon(icon, color: const Color(0xFF7FC6FF)),
        title: Text(label, style: const TextStyle(color: Colors.white)),
        trailing: const Icon(Icons.chevron_right, color: Color(0xFF9DB6D8)),
        onTap: onTap,
      ),
    );
  }
}
