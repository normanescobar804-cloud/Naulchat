class AuthService {
  bool isAuthenticated = false;

  bool login(String email, String password) {
    final valid = email.trim().isNotEmpty && password.trim().length >= 4;
    isAuthenticated = valid;
    return valid;
  }

  bool register(String name, String email, String password) {
    final valid = name.trim().isNotEmpty && email.trim().isNotEmpty && password.trim().length >= 4;
    isAuthenticated = valid;
    return valid;
  }

  void logout() {
    isAuthenticated = false;
  }
}
