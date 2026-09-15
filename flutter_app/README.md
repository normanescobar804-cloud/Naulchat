# Naul Chat Flutter - Producto real

Este proyecto ya está orientado a una versión real de producto en Flutter, con el flujo principal de:

- Login
- Registro
- Recuperación de contraseña
- Pantalla de perfil
- Ajustes
- Chat principal

## Requisitos

- Flutter SDK instalado
- Android Studio / VS Code con soporte Flutter

## Ejecutar

```bash
cd flutter_app
flutter pub get
flutter run
```

## Estructura principal

- `lib/app.dart` → configuración global de la app
- `lib/app_shell.dart` → navegación entre pantallas
- `lib/screens/` → pantallas del producto
- `lib/models/` → modelos de dominio
- `lib/data/` → datos mock de la app
- `pubspec.yaml` → configuración del proyecto

> El entorno actual de este contenedor no tiene Flutter instalado, por lo que no se pudo compilar aquí. La verificación mostró: `bash: flutter: command not found`.
