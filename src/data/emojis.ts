export interface EmojiCategory {
  id: string;
  name: string;
  icon: string;
  emojis: string[];
}

export const QUICK_REACTION_EMOJIS = [
  '❤️', '👍', '😂', '😮', '😢', '🙏', '🔥', '🇳🇮', '🏆', '👏', '😍', '☕', '🎉', '💪', '🥇', '💯'
];

export const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    id: 'frecuentes',
    name: 'Frecuentes & Populares',
    icon: '⭐',
    emojis: [
      '❤️', '🔥', '👍', '😂', '🇳🇮', '👏', '🙏', '😍', '😮', '😢', '🏆', '☕',
      '🎉', '🚀', '💯', '🥰', '✨', '💪', '🥳', '😎', '👌', '🤝', '🤍', '⭐',
      '🥇', '⚽', '⚾', '🥊', '💖', '👑', '🙌', '🤩', '🎯', '⚡', '🌟', '💥'
    ]
  },
  {
    id: 'copas',
    name: 'Copas, Trofeos & Deportes',
    icon: '🏆',
    emojis: [
      // Copas, Trofeos, Medallas y Premios
      '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️', '🏵️', '🎗️', '👑', '💎',
      // Deportes de Pelota y Campo
      '⚽', '⚾', '🥎', '🏀', '🏐', '🏈', '🏉', '🎾', '🥏', '🎳',
      '🏏', '🏑', '🏒', '🥍', '🏓', '🏸', '🥊', '🥋', '🥅', '⛳',
      // Deportes Acuáticos, Nieve y Combate
      '⛸️', '🎣', '🤿', '🎽', '🎿', '🛷', '🥌', '🎯', '🎱', '🎮',
      '🕹️', '🎲', '♟️', '🎰', '🧩', '🏎️', '🏍️', '🚴', '🚵', '🏇',
      '🏊', '🤽', '🚣', '🧗', '🧘', '🏋️', '🤺', '🤼', '🤸', '⛹️',
      '🤾', '🧗‍♂️', '🧗‍♀️', '🏄', '🛹', '🛼', '🏹', '🥋', '🥊', '🏁',
      '🚩', '🎫', '🎟️', '🎪', '🤹', '🎭', '🩰', '🎨', '🎬', '🎤',
      '🎧', '🎼', '🎹', '🥁', '🎷', '🎺', '🎸', '🪕', '🎻', '📣'
    ]
  },
  {
    id: 'banderas',
    name: 'Banderas de Todos los Países',
    icon: '🇳🇮',
    emojis: [
      // Centroamérica & Caribe
      '🇳🇮', '🇨🇷', '🇭🇳', '🇸🇻', '🇬🇹', '🇵🇦', '🇧🇿', '🇨🇺', '🇩🇴', '🇵🇷', '🇭🇹', '🇯🇲', '🇹🇹', '🇧🇸', '🇧🇧',
      // Norteamérica
      '🇲🇽', '🇺🇸', '🇨🇦',
      // Sudamérica
      '🇨🇴', '🇻🇪', '🇪🇨', '🇵🇪', '🇧🇴', '🇨🇱', '🇦🇷', '🇺🇾', '🇵🇾', '🇧🇷', '🇬🇾', '🇸🇷',
      // Europa
      '🇪🇸', '🇫🇷', '🇩🇪', '🇮🇹', '🇬🇧', '🇵🇹', '🇨🇭', '🇳🇱', '🇧🇪', '🇦🇹', '🇸🇪', '🇳🇴',
      '🇩🇰', '🇫🇮', '🇮🇪', '🇬🇷', '🇵🇱', '🇺🇦', '🇷🇺', '🇨🇿', '🇷🇴', '🇭🇺', '🇭🇷', '🇷🇸',
      '🇹🇷', '🇻🇦', '🇲🇨', '🇮🇸', '🇸🇰', '🇧🇬', '🇸🇮', '🇱🇺', '🇦🇱', '🇲🇰', '🇧🇦', '🇲🇪',
      '🇪🇪', '🇱🇻', '🇱🇹', '🇲🇹', '🇨🇾', '🇦🇩', '🇸🇲', '🇱🇮', '🇬🇮',
      // Asia & Medio Oriente
      '🇯🇵', '🇰🇷', '🇨🇳', '🇮🇳', '🇵🇭', '🇮🇩', '🇹🇭', '🇻🇳', '🇸🇬', '🇲🇾', '🇸🇦', '🇦🇪',
      '🇶🇦', '🇰🇼', '🇮🇱', '🇯🇴', '🇱🇧', '🇵🇰', '🇧🇩', '🇹🇼', '🇭🇰', '🇮🇷', '🇮🇶', '🇸🇾',
      '🇾🇪', '🇴🇲', '🇧🇭', '🇵🇸', '🇦🇫', '🇳🇵', '🇱🇰', '🇲🇲', '🇰🇭', '🇱🇦', '🇲🇳', '🇰🇿',
      '🇺🇿', '🇦🇲', '🇬🇪', '🇦🇿',
      // Oceanía
      '🇦🇺', '🇳🇿', '🇫🇯', '🇵🇬', '🇼🇸', '🇹🇴', '🇬🇺', '🇵🇫',
      // África
      '🇪🇬', '🇿🇦', '🇲🇦', '🇳🇬', '🇰🇪', '🇬🇭', '🇸🇳', '🇨🇲', '🇩🇿', '🇹🇳', '🇪🇹', '🇨🇮',
      '🇹🇿', '🇺🇬', '🇦🇴', '🇲🇿', '🇿🇼', '🇿🇲', '🇲🇬', '🇸🇩', '🇱🇾', '🇲🇱', '🇧🇫', '🇬🇳',
      // Banderas Especiales y Deportivas
      '🏁', '🚩', '🎌', '🏴', '🏳️', '🏳️‍🌈', '🏳️‍⚧️', '🏴‍☠️', '🇺🇳', '🇪🇺'
    ]
  },
  {
    id: 'caritas',
    name: 'Caritas & Emociones (Todos los Estilos)',
    icon: '😀',
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '🥲', '🥹', '☺️', '😊',
      '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋',
      '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸', '🤩', '🥳', '😏',
      '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺',
      '😢', '😭', '😮‍💨', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱',
      '😨', '😰', '😥', '😓', '🤗', '🤔', '🫣', '🤭', '🫢', '🫡', '🤫', '🫠',
      '🤥', '😶', '😐', '😑', '😬', '🫨', '🙄', '😯', '😦', '😧', '😮', '😲',
      '🥱', '😴', '🤤', '😪', '😵', '😵‍💫', '🤐', '🥴', '🤢', '🤮', '🤧', '😷',
      '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀',
      '☠️', '👽', '👾', '🤖', '🎃'
    ]
  },
  {
    id: 'manos',
    name: 'Gestos, Manos & Cuerpo',
    icon: '👋',
    emojis: [
      '👍', '👎', '👊', '✊', '🤛', '🤜', '🤞', '✌️', '🫰', '🤟', '🤘', '👌',
      '🤌', '🤏', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋',
      '🤙', '🫲', '🫱', '🫵', '🤝', '👏', '🙌', '🫶', '👐', '🤲', '🙏', '✍️',
      '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🫀',
      '🫁', '🦷', '🦴', '👀', '👁️', '👅', '👄'
    ]
  },
  {
    id: 'corazones',
    name: 'Corazones & Afecto',
    icon: '❤️',
    emojis: [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '❤️‍🩹',
      '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '💌', '💋', '🫂',
      '💐', '🌹', '🥀', '🌺', '🌸', '🌷', '🌻', '🌼', '💎', '💍', '✨', '⭐'
    ]
  },
  {
    id: 'celebracion',
    name: 'Celebración, Bebidas & Copas',
    icon: '🎉',
    emojis: [
      '🎉', '🎊', '🎈', '🎂', '🍰', '🧁', '🍾', '🥂', '🍻', '🍺', '🍷', '🍸',
      '🍹', '🧃', '🧉', '☕', '🍵', '🧋', '🎁', '🎇', '🎆', '🧨', '🪅', '🪩',
      '👑', '💍', '💎', '🪄', '🌟', '⭐', '🌠', '✨', '⚡', '💥', '🔥', '🌈',
      '☀️', '🌙', '🪐', '🚀', '🛸', '🔔', '🔕', '🎵', '🎶', '💯', '💢', '💡',
      '💰', '💵', '💳', '🔑', '🔒', '🔓', '🛡️', '⚔️', '🧭', '📱', '💻', '📷'
    ]
  },
  {
    id: 'naturaleza',
    name: 'Animales, Naturaleza & Comida',
    icon: '🦁',
    emojis: [
      '🐶', '🐱', '🦁', '🐯', '🐻', '🐼', '🐵', '🐴', '🦄', '🦅', '🦉', '🐬',
      '🦈', '🦋', '🐝', '🐢', '🐍', '🐙', '🦕', '🌸', '🌺', '🌻', '🌹', '🌴',
      '🌲', '🍀', '🍁', '🍂', '🍕', '🍔', '🍟', '🌭', '🌮', '🌯', '🍿', '🥩',
      '🍗', '🥪', '🥗', '🍣', '🍦', '🍩', '🍫', '🥑', '🥥', '🍉', '🍇', '🍓',
      '🍌', '🍎', '🥭', '🍍', '🥟', '🍜', '🌋', '🌊', '☕'
    ]
  }
];

// Helper to search emojis by keyword in Spanish
export const EMOJI_KEYWORDS: Record<string, string[]> = {
  // Copas y trofeos
  '🏆': ['copa', 'trofeo', 'campeon', 'ganador', 'primer', 'premio', 'victoria', 'oro', 'championship'],
  '🥇': ['oro', 'primer', 'medalla', 'campeon', '1', 'ganador', 'copa'],
  '🥈': ['plata', 'segundo', 'medalla', '2', 'subcampeon'],
  '🥉': ['bronce', 'tercero', 'medalla', '3'],
  '🏅': ['medalla', 'premio', 'deporte', 'honor'],
  '🎖️': ['militar', 'medalla', 'honor', 'premio'],
  '👑': ['corona', 'rey', 'reina', 'campeon', 'lider'],
  '💎': ['diamante', 'joya', 'riqueza', 'brillante'],

  // Deportes
  '⚽': ['futbol', 'pelota', 'balon', 'deporte', 'gol', 'soccer', 'partido'],
  '⚾': ['beisbol', 'pelota', 'nicaragua', 'deporte', 'homerun', 'boer', 'dantos', 'baseball'],
  '🏀': ['baloncesto', 'basquet', 'deporte', 'cesta', 'nba'],
  '🏐': ['voleibol', 'voley', 'pelota'],
  '🏈': ['futbol americano', 'nfl'],
  '🎾': ['tenis', 'raqueta', 'pelota'],
  '🥊': ['boxeo', 'pelea', 'chocolate', 'chocolatito', 'guantes', 'ring', 'knockout'],
  '🥋': ['judo', 'karate', 'artes marciales'],
  '🏎️': ['carrera', 'formula1', 'f1', 'auto', 'carro'],
  '🏍️': ['moto', 'motocicleta', 'carrera'],
  '🚴': ['bici', 'bicicleta', 'ciclismo'],
  '🏊': ['nadar', 'natacion', 'piscina', 'agua'],
  '🏋️': ['pesas', 'gimnasio', 'gym', 'fuerza', 'musculo'],
  '🎯': ['diana', 'tiro', 'objetivo', 'blanco', 'acierto'],

  // Banderas Centroamérica y Caribe
  '🇳🇮': ['nicaragua', 'nica', 'pinolero', 'patria', 'bandera', 'managua', 'leon', 'granada', 'esteli', 'matagalpa'],
  '🇨🇷': ['costa rica', 'tico', 'bandera', 'san jose'],
  '🇭🇳': ['honduras', 'catracho', 'bandera', 'tegucigalpa'],
  '🇸🇻': ['el salvador', 'salvadoreño', 'bandera', 'san salvador'],
  '🇬🇹': ['guatemala', 'chapin', 'bandera'],
  '🇵🇦': ['panama', 'canal', 'bandera'],
  '🇧🇿': ['belice', 'belize', 'bandera'],
  '🇨🇺': ['cuba', 'habana', 'bandera'],
  '🇩🇴': ['republica dominicana', 'dominicano', 'quisqueya', 'bandera', 'santo domingo'],
  '🇵🇷': ['puerto rico', 'boricua', 'bandera', 'san juan'],
  '🇭🇹': ['haiti', 'bandera'],
  '🇯🇲': ['jamaica', 'bandera'],

  // Banderas Norte y Sudamérica
  '🇲🇽': ['mexico', 'mexicano', 'bandera', 'cdmx', 'azteca'],
  '🇺🇸': ['estados unidos', 'usa', 'eeuu', 'gringo', 'bandera', 'america'],
  '🇨🇦': ['canada', 'canadiense', 'bandera'],
  '🇨🇴': ['colombia', 'cafetero', 'bandera', 'bogota', 'medellin'],
  '🇻🇪': ['venezuela', 'venezolano', 'bandera', 'caracas'],
  '🇪🇨': ['ecuador', 'ecuatoriano', 'bandera', 'quito'],
  '🇵🇪': ['peru', 'peruano', 'bandera', 'lima', 'inca'],
  '🇧🇴': ['bolivia', 'boliviano', 'bandera', 'la paz'],
  '🇨🇱': ['chile', 'chileno', 'bandera', 'santiago'],
  '🇦🇷': ['argentina', 'campeon', 'messi', 'maradona', 'bandera', 'buenos aires'],
  '🇺🇾': ['uruguay', 'uruguayo', 'bandera', 'celeste', 'montevideo'],
  '🇵🇾': ['paraguay', 'paraguayo', 'bandera', 'asuncion'],
  '🇧🇷': ['brasil', 'brazil', 'futbol', 'samba', 'bandera', 'rio'],

  // Banderas Europa
  '🇪🇸': ['españa', 'español', 'bandera', 'madrid', 'barcelona'],
  '🇫🇷': ['francia', 'frances', 'paris', 'bandera'],
  '🇩🇪': ['alemania', 'aleman', 'berlin', 'bandera'],
  '🇮🇹': ['italia', 'italiano', 'roma', 'bandera'],
  '🇬🇧': ['reino unido', 'inglaterra', 'uk', 'londres', 'bandera'],
  '🇵🇹': ['portugal', 'portugues', 'lisboa', 'cr7', 'bandera'],
  '🇨🇭': ['suiza', 'suizo', 'bandera'],
  '🇳🇱': ['holanda', 'paises bajos', 'amsterdam', 'bandera'],
  '🇺🇦': ['ucrania', 'ucraniano', 'bandera'],
  '🇷🇺': ['rusia', 'ruso', 'moscu', 'bandera'],

  // Banderas Asia & África
  '🇯🇵': ['japon', 'tokyo', 'anime', 'bandera'],
  '🇰🇷': ['corea', 'corea del sur', 'kpop', 'seoul', 'bandera'],
  '🇨🇳': ['china', 'pekin', 'beijing', 'bandera'],
  '🇮🇳': ['india', 'hindu', 'bandera'],
  '🇪🇬': ['egipto', 'piramides', 'el cairo', 'bandera'],
  '🇿🇦': ['sudafrica', 'africa', 'bandera'],
  '🇲🇦': ['marruecos', 'marroqui', 'bandera'],

  // Caritas y reacciones emocionales
  '❤️': ['corazon', 'amor', 'love', 'rojo', 'te amo'],
  '🔥': ['fuego', 'candela', 'hot', 'fuerte', 'crack', 'llama'],
  '👍': ['bien', 'like', 'pulgar', 'ok', 'bueno', 'correcto'],
  '👎': ['mal', 'dislike', 'no', 'incorrecto'],
  '😂': ['risa', 'jaja', 'gracioso', 'chiste', 'divertido', 'humor', 'lol'],
  '🤣': ['carcajada', 'muero de risa', 'risa', 'jaja'],
  '😍': ['enamorado', 'ojos corazon', 'bello', 'lindo', 'hermoso'],
  '🥰': ['tierno', 'amor', 'cariño', 'abrazado'],
  '😮': ['sorpresa', 'wow', 'asombro', 'boca abierta'],
  '😢': ['triste', 'llorar', 'lagrima', 'pena'],
  '😭': ['llanto', 'desconsolado', 'pena', 'dolor'],
  '🙏': ['rezo', 'oracion', 'por favor', 'gracias', 'bendicion', 'dios'],
  '👏': ['aplauso', 'bravo', 'felicitaciones', 'felicidades'],
  '💪': ['fuerza', 'poder', 'animo', 'gym', 'musculo'],
  '🥳': ['fiesta', 'celebracion', 'cumpleaños', 'party'],
  '😎': ['genial', 'cool', 'lentes', 'crack'],
  '☕': ['cafe', 'desayuno', 'caliente', 'nicaragua', 'matagalpa', 'jinotega'],
  '🎉': ['fiesta', 'celebracion', 'cumpleaños', 'congrats', 'felicidades'],
  '💯': ['cien', 'perfecto', '100', 'puntos', 'exacto'],
  '✨': ['brillo', 'magia', 'estrellas', 'especial'],
  '🚀': ['cohete', 'despegue', 'rapido', 'crecimiento']
};
