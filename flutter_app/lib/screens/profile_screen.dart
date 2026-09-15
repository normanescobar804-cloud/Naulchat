import 'package:flutter/material.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({
    super.key,
    required this.onOpenSettings,
    required this.onSecurity,
  });

  final VoidCallback onOpenSettings;
  final VoidCallback onSecurity;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF07121E),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text('Perfil'),
        centerTitle: true,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const CircleAvatar(
                radius: 54,
                backgroundColor: Color(0xFF2A9DFF),
                child: Text(
                  'Y',
                  style: TextStyle(fontSize: 38, fontWeight: FontWeight.w700, color: Colors.white),
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'Yuriel',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 26,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 6),
              const Text(
                'yuriel@naulchat.com',
                style: TextStyle(color: Color(0xFF9DB6D8)),
              ),
              const SizedBox(height: 24),
              _InfoCard(
                title: 'Estado',
                value: 'Disponible',
                icon: Icons.online_prediction,
              ),
              const SizedBox(height: 12),
              _InfoCard(
                title: 'Número',
                value: '+505 8123 4567',
                icon: Icons.phone_android,
              ),
              const SizedBox(height: 12),
              _InfoCard(
                title: 'Ubicación',
                value: 'Managua, Nicaragua',
                icon: Icons.location_on_outlined,
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: onOpenSettings,
                  icon: const Icon(Icons.settings_outlined),
                  label: const Text('Ajustes'),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    backgroundColor: const Color(0xFF0D1A2B),
                    foregroundColor: Colors.white,
                    side: const BorderSide(color: Color(0xFF1E3550)),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: onSecurity,
                  icon: const Icon(Icons.shield_outlined),
                  label: const Text('Seguridad y privacidad'),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    foregroundColor: Colors.white,
                    side: const BorderSide(color: Color(0xFF2A9DFF)),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _InfoCard extends StatelessWidget {
  const _InfoCard({
    required this.title,
    required this.value,
    required this.icon,
  });

  final String title;
  final String value;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF0D1A2B),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF1E3550)),
      ),
      child: Row(
        children: [
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              color: const Color(0xFF12243A),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: const Color(0xFF7FC6FF)),
          ),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(color: Color(0xFF9DB6D8), fontSize: 12),
              ),
              const SizedBox(height: 4),
              Text(
                value,
                style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
