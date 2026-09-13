# 🇳🇮 Naul Chat Nicaragua — PWA & WebRTC

> Plataforma moderna de mensajería de alta seguridad con cifrado de extremo a extremo, videollamadas en tiempo real (WebRTC + STUN global), notas de voz HD, estados efímeros y compatibilidad PWA para instalar en Android, iOS, Windows y Mac.

---

## 🚀 Despliegue en GitHub & GitHub Pages (Paso a Paso)

Este proyecto está **100% preparado** para desplegarse de manera automática y gratuita en **GitHub Pages** mediante **GitHub Actions**.

### 1. Crear el repositorio en GitHub
1. Entra a [GitHub.com](https://github.com) e inicia sesión.
2. Haz clic en el botón verde **"New"** (Nuevo Repositorio).
3. Nómbralo por ejemplo: `naul-chat` (déjalo **Público** para disfrutar de GitHub Pages gratuito).
4. No marques la opción de inicializar con README (ya tenemos todo listo).
5. Haz clic en **Create repository**.

### 2. Subir tu código a GitHub
Abre la terminal en la carpeta de este proyecto y ejecuta:

```bash
# 1. Inicializar git si aún no está iniciado
git init

# 2. Agregar todos los archivos
git add .

# 3. Guardar el primer commit
git commit -m "feat: Primera versión de Naul Chat Nicaragua con PWA y GitHub Actions"

# 4. Asegurar rama principal
git branch -M main

# 5. Conectar con tu repositorio (cambia TU_USUARIO por tu nombre de usuario en GitHub)
git remote add origin https://github.com/TU_USUARIO/naul-chat.git

# 6. Subir tu código
git push -u origin main
```

---

### 3. Activar GitHub Pages en 1 clic
1. En tu repositorio en GitHub, ve a la pestaña **Settings** (Configuración).
2. En el menú lateral izquierdo, haz clic en **Pages**.
3. En la sección **Build and deployment** &rarr; **Source (Origen)**, selecciona:
   👉 **`GitHub Actions`**.
4. ¡Listo! El flujo de trabajo `.github/workflows/deploy.yml` compilará la app automáticamente y la publicará en:
   `https://TU_USUARIO.github.io/naul-chat/`

---

## 📱 Instalación como App Nativa (PWA)

### En Teléfonos Android (Google Chrome):
1. Abre el enlace de tu app en Google Chrome.
2. Verás el botón **"Instalar App"** en la parte superior o en el banner.
3. También puedes tocar el menú de los 3 puntos de Chrome &rarr; **"Instalar aplicación"** o **"Añadir a la pantalla principal"**.
4. Se instalará con su propio ícono en el menú de aplicaciones y funcionará en pantalla completa con soporte sin conexión.

### En iPhone / iPad (Safari en iOS):
1. Abre el enlace en el navegador **Safari**.
2. Toca el botón **Compartir** (icono con cuadrado y flecha hacia arriba en la barra inferior).
3. Desliza hacia abajo y selecciona **"Añadir a pantalla de inicio"**.
4. Toca **Añadir**. Aparecerá el ícono de Naul Chat como una app nativa en tu pantalla.

### En Computadoras (Chrome / Edge / Brave):
1. Abre la app en tu navegador de escritorio.
2. En la barra de direcciones aparecerá un icono de monitor con flecha **"Instalar aplicación"**.
3. Haz clic en **Instalar** para abrirla como ventana de escritorio independiente.

---

## 🛠️ Comandos de Desarrollo Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo local
npm run dev

# Compilar para producción (genera la carpeta dist/)
npm run build

# Previsualizar la compilación de producción
npm run preview
```

---

## 🌟 Características Principales
- 💬 **Mensajería Instantánea Segura**: Canales directos, chats grupales y cifrado de extremo a extremo.
- 📹 **Videollamadas & Llamadas de Voz**: WebRTC con servidores globales STUN de Google, cambio de cámara frontal/trasera, compartir pantalla y sin límites de distancia.
- 🎙️ **Notas de Voz**: Grabación de alta calidad con visualizador de espectro sonoro.
- 📷 **Estados y Multimedia**: Compartir imágenes, documentos, ubicación en tiempo real y estados temporales.
- ⚡ **PWA Offline-Ready**: Service Worker con caché inteligente para cargar al instante incluso con mala cobertura.
