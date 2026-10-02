import { SponsoredAd, BusinessProduct, StorageBreakdown } from '../types';

export interface PlanTier {
  id: 'free' | 'premium_basic' | 'premium_pro' | 'business_starter' | 'business_pro';
  category: 'free' | 'premium' | 'business';
  name: string;
  badge: string;
  priceCordobas: number;
  period: string;
  subtitle: string;
  features: string[];
  highlight?: boolean;
  colorScheme: 'slate' | 'amber' | 'emerald' | 'sky';
}

export const MONETIZATION_PLANS: PlanTier[] = [
  {
    id: 'free',
    category: 'free',
    name: '🆓 Usuarios Gratis',
    badge: '100% Gratis',
    priceCordobas: 0,
    period: 'para siempre',
    subtitle: 'Todo lo esencial para conectar con familiares y amigos en Nicaragua y el mundo',
    features: [
      'Chat ilimitado individual y grupos',
      'Llamadas de voz y video en tiempo real gratis',
      'Envío de fotos, videos, audios y notas de voz',
      'Estados e historias de 24 horas',
      'Cifrado de extremo a extremo (E2EE)',
      '1 GB de almacenamiento seguro en la nube'
    ],
    colorScheme: 'slate'
  },
  {
    id: 'premium_basic',
    category: 'premium',
    name: '⭐ Naul Premium',
    badge: 'Más Popular',
    priceCordobas: 50,
    period: 'por mes (C$50)',
    subtitle: 'Funciones exclusivas y mayor potencia para usuarios individuales',
    features: [
      'Insignia de estrella dorada de Verificación Premium ⭐',
      '15 GB de almacenamiento en la nube para fotos y archivos ☁️',
      'Envío multimedia en calidad original Ultra-HD sin compresión',
      'Temas visuales y colores de burbujas personalizados ilimitados',
      'Paquetes de emojis y stickers VIP exclusivos',
      'Soporte prioritario y cero límites de reenvío'
    ],
    highlight: true,
    colorScheme: 'amber'
  },
  {
    id: 'premium_pro',
    category: 'premium',
    name: '⭐ Naul VIP Pro',
    badge: 'Máximo Poder',
    priceCordobas: 100,
    period: 'por mes (C$100)',
    subtitle: 'El paquete definitivo para usuarios exigentes y creadores de contenido',
    features: [
      'Todos los beneficios de Naul Premium',
      '50 GB de almacenamiento en la nube ☁️',
      'Transcripción instantánea de notas de voz a texto',
      'Estados de video de mayor duración (hasta 60s)',
      'Insignia VIP dorada brillante animada',
      'Acceso anticipado a nuevas funciones beta'
    ],
    colorScheme: 'sky'
  },
  {
    id: 'business_starter',
    category: 'business',
    name: '🏪 Negocio Emprendedor',
    badge: 'Pymes & Pulperías',
    priceCordobas: 100,
    period: 'por mes (C$100)',
    subtitle: 'Digitaliza tu negocio, atiende a tus clientes y vende directamente por chat',
    features: [
      'Perfil comercial verificado con logo, horario y dirección 🏪',
      'Catálogo interactivo de hasta 20 productos con precio en C$',
      'Botón de "Pedir por Chat" directo para compradores',
      'Insignia de Comercio Local Verificado 🇳🇮',
      'Mensaje de bienvenida y respuesta rápida automática',
      '15 GB de almacenamiento para fotos de catálogo'
    ],
    colorScheme: 'emerald'
  },
  {
    id: 'business_pro',
    category: 'business',
    name: '🏪 Negocio Pro + IA 24/7',
    badge: 'Empresas & Franquicias',
    priceCordobas: 300,
    period: 'por mes (C$300)',
    subtitle: 'La solución empresarial completa con inteligencia artificial para atención continua',
    features: [
      'Todo lo de Negocio Emprendedor',
      '🤖 Asistente IA 24/7: responde dudas, precios y horarios automáticamente',
      'Toma de pedidos autónoma vía chat cuando estás fuera de línea',
      'Catálogo ilimitado de productos con fotos de alta resolución',
      '📢 2 Anuncios destacados mensuales en sección Estados / Descubrir',
      'Insignia Oficial de Empresa Verificada con RUC / Alcaldía ✅',
      '100 GB de almacenamiento en la nube ☁️'
    ],
    highlight: true,
    colorScheme: 'emerald'
  }
];

export const INITIAL_SPONSORED_ADS: SponsoredAd[] = [
  {
    id: 'ad-comideria-tania',
    businessName: 'Comidería Doña Tania',
    businessCategory: 'Gastronomía Nica',
    businessAvatar: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80',
    title: '¡El mejor Gallo Pinto con Carne Asada de Managua!',
    description: 'Tradición y sazón nicaragüense. Envíos gratis en compras mayores a C$200 en Altamira y alrededores.',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80',
    ctaText: 'Ver Menú & Pedir',
    phone: '+505 8899 4433',
    department: 'Managua',
    discountBadge: '15% DTO en Almuerzos'
  },
  {
    id: 'ad-artesanias-masaya',
    businessName: 'Artesanías El Coyotepe',
    businessCategory: 'Artesanías & Cultura',
    businessAvatar: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=200&auto=format&fit=crop&q=80',
    title: 'Hamacas de Masaya 100% Algodón Tejidas a Mano',
    description: 'Envíos a todo el país (EnviaYa / CargoTrans). Calidad de exportación directamente del taller.',
    imageUrl: 'https://images.unsplash.com/photo-1579656381226-5fc0f0100c3b?w=800&auto=format&fit=crop&q=80',
    ctaText: 'Consultar Modelos',
    phone: '+505 8765 4321',
    department: 'Masaya',
    discountBadge: 'Envío Gratis a Managua'
  },
  {
    id: 'ad-tech-nica',
    businessName: 'Tech Nica Store',
    businessCategory: 'Tecnología & Celulares',
    businessAvatar: 'https://images.unsplash.com/photo-1511707171634-5f897ff02560?w=200&auto=format&fit=crop&q=80',
    title: 'Fundas, Vidrios Templados y Cables Tipo C para tu Celular',
    description: 'Cables reforzados desde C$120. Aceptamos transferencias LAFISE, BAC y pagos contra entrega.',
    imageUrl: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=800&auto=format&fit=crop&q=80',
    ctaText: 'Ver Catálogo',
    phone: '+505 8234 5678',
    department: 'León',
    discountBadge: 'Oferta Especial'
  },
  {
    id: 'ad-cafe-las-segovias',
    businessName: 'Café Alturas Las Segovias',
    businessCategory: 'Café Especial de Origen',
    businessAvatar: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=200&auto=format&fit=crop&q=80',
    title: 'Café de Estelí y Jinotega Tostado Artesanalmente',
    description: 'Lleva el aroma de la montaña a tu hogar. Bolsas de 1 libra en grano o molido desde C$150.',
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format&fit=crop&q=80',
    ctaText: 'Hacer Pedido',
    phone: '+505 8901 2345',
    department: 'Estelí',
    discountBadge: 'Cosecha Nueva'
  }
];

export const DEFAULT_BUSINESS_CATALOG: BusinessProduct[] = [
  {
    id: 'prod-1',
    title: 'Combo Almuerzo Típico Nica',
    priceCordobas: 180,
    description: 'Carne asada, gallo pinto, tajadas con queso frito y ensalada de repollo fresca.',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=80',
    category: 'Comidas',
    inStock: true
  },
  {
    id: 'prod-2',
    title: 'Refresco Natural de Cacao con Leche (1 Litro)',
    priceCordobas: 60,
    description: 'Cacao molido tradicional bien helado y batido artesanalmente.',
    imageUrl: 'https://images.unsplash.com/photo-1517578239113-b03992dcdd25?w=400&auto=format&fit=crop&q=80',
    category: 'Bebidas',
    inStock: true
  },
  {
    id: 'prod-3',
    title: 'Nacatamal Especial de Cerdo',
    priceCordobas: 90,
    description: 'Envuelto en hoja de plátano con arroz, papa, hierbabuena y chile congo al gusto.',
    imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&auto=format&fit=crop&q=80',
    category: 'Especialidades',
    inStock: true
  }
];

export const DEFAULT_STORAGE_QUOTA: Record<'free' | 'premium' | 'business', StorageBreakdown> = {
  free: {
    totalMb: 8192,      // 8 GB de almacenamiento en la nube (8,192 MB)
    usedMb: 245,        // ~245 MB usado
    photosMb: 140,
    videosMb: 65,
    audiosMb: 30,
    documentsMb: 10
  },
  premium: {
    totalMb: 51200,     // 50 GB
    usedMb: 3450,       // ~3.4 GB usado
    photosMb: 1820,
    videosMb: 1200,
    audiosMb: 310,
    documentsMb: 120
  },
  business: {
    totalMb: 102400,    // 100 GB
    usedMb: 8900,       // ~8.9 GB usado
    photosMb: 5200,
    videosMb: 2400,
    audiosMb: 900,
    documentsMb: 400
  }
};
