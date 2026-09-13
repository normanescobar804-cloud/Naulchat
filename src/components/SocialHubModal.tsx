import React, { useState } from 'react';
import { Youtube, ExternalLink, Share2, Compass, Play, Music2, Sparkles, X, Globe } from 'lucide-react';
import { translations } from '../utils/translations';
import { SocialPlatform } from '../types';

interface SocialItem {
  id: string;
  platform: SocialPlatform;
  title: string;
  creator: string;
  thumbnail: string;
  url: string;
  tags: string[];
}

const TRENDING_CONTENT: SocialItem[] = [
  {
    id: 'yt-1',
    platform: 'youtube',
    title: 'Descubriendo Nicaragua: Volcán Masaya y Laguna de Apoyo',
    creator: 'Nicaragua Turismo & Aventura',
    thumbnail: 'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=600&auto=format&fit=crop&q=80',
    url: 'https://www.youtube.com/results?search_query=nicaragua+turismo',
    tags: ['Nicaragua', 'Naturaleza', '4K']
  },
  {
    id: 'yt-2',
    platform: 'youtube',
    title: 'Desarrollo de Software y Emprendimiento Tecnológico en Centroamérica',
    creator: 'Comunidad Tech Latam',
    thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80',
    url: 'https://www.youtube.com/results?search_query=tecnologia+nicaragua',
    tags: ['Tech', 'Startups', 'Ciberseguridad']
  },
  {
    id: 'tt-1',
    platform: 'tiktok',
    title: 'Recetas Pinoleras: El Secreto del Auténtico Gallo Pinto y Vigorón',
    creator: '@sabores_nicaragua',
    thumbnail: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
    url: 'https://www.tiktok.com/tag/nicaragua',
    tags: ['ComidaNicaragüense', 'Viral', 'Managua']
  },
  {
    id: 'tt-2',
    platform: 'tiktok',
    title: 'Surfeando en Playa Maderas y San Juan del Sur',
    creator: '@surf_nicaragua_vibes',
    thumbnail: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=600&auto=format&fit=crop&q=80',
    url: 'https://www.tiktok.com/tag/sanjuandelsur',
    tags: ['SanJuanDelSur', 'Playa', 'Travel']
  },
  {
    id: 'ig-1',
    platform: 'instagram',
    title: 'Fotografía Colonial: Calles de Granada y Arquitectura Neoclásica',
    creator: '@granada_colonial_photos',
    thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop&q=80',
    url: 'https://www.instagram.com/explore/tags/nicaragua/',
    tags: ['Fotografía', 'Cultura', 'Granada']
  },
  {
    id: 'sp-1',
    platform: 'spotify',
    title: 'Música Nicaragüense Contemporánea & Marimba Tradicional',
    creator: 'Sones de mi Tierra Nicaragua',
    thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    url: 'https://open.spotify.com/search/nicaragua',
    tags: ['Música', 'Marimba', 'OrgulloPinolero']
  }
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onShareToChat: (content: string, url?: string) => void;
  lang: 'es' | 'en' | 'miskito' | 'pt';
}

export const SocialHubModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onShareToChat,
  lang,
}) => {
  const t = translations[lang];
  const [activeFilter, setActiveFilter] = useState<'all' | SocialPlatform>('all');
  const [customSearch, setCustomSearch] = useState('');

  if (!isOpen) return null;

  const filteredItems = TRENDING_CONTENT.filter(item => {
    if (activeFilter !== 'all' && item.platform !== activeFilter) return false;
    if (customSearch.trim() && !item.title.toLowerCase().includes(customSearch.toLowerCase()) && !item.creator.toLowerCase().includes(customSearch.toLowerCase())) {
      return false;
    }
    return true;
  });

  const getPlatformIcon = (platform: SocialPlatform) => {
    switch (platform) {
      case 'youtube':
        return <Youtube className="w-4 h-4 text-red-500" />;
      case 'tiktok':
        return <Play className="w-4 h-4 text-pink-500" />;
      case 'spotify':
        return <Music2 className="w-4 h-4 text-emerald-400" />;
      case 'instagram':
        return <Sparkles className="w-4 h-4 text-fuchsia-400" />;
      default:
        return <Globe className="w-4 h-4 text-sky-400" />;
    }
  };

  return (
    <div id="social-hub-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-slate-100 animate-scaleUp">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                {t.socialHub}
              </h3>
              <p className="text-xs text-slate-400">
                Navegación directa a YouTube, TikTok y redes con opción de compartir al chat
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Launch Buttons for Popular Networks */}
        <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex flex-wrap gap-2 items-center justify-between">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-sky-500 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Tendencias
            </button>
            <button
              onClick={() => setActiveFilter('youtube')}
              className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition cursor-pointer ${
                activeFilter === 'youtube'
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Youtube className="w-3.5 h-3.5 text-red-400" />
              YouTube
            </button>
            <button
              onClick={() => setActiveFilter('tiktok')}
              className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition cursor-pointer ${
                activeFilter === 'tiktok'
                  ? 'bg-pink-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Play className="w-3.5 h-3.5 text-pink-400" />
              TikTok
            </button>
            <button
              onClick={() => setActiveFilter('instagram')}
              className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition cursor-pointer ${
                activeFilter === 'instagram'
                  ? 'bg-fuchsia-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
              Instagram
            </button>
            <button
              onClick={() => setActiveFilter('spotify')}
              className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition cursor-pointer ${
                activeFilter === 'spotify'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Music2 className="w-3.5 h-3.5 text-emerald-400" />
              Spotify
            </button>
          </div>

          <div className="w-full sm:w-48 mt-2 sm:mt-0">
            <input
              type="text"
              value={customSearch}
              onChange={(e) => setCustomSearch(e.target.value)}
              placeholder="Filtrar temas..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {/* Content Grid */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredItems.map(item => (
              <div
                key={item.id}
                className="group bg-slate-950/80 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition flex flex-col justify-between shadow-md"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md flex items-center gap-1 text-[11px] font-semibold text-white">
                    {getPlatformIcon(item.platform)}
                    <span className="capitalize">{item.platform}</span>
                  </div>
                </div>

                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-semibold text-xs sm:text-sm text-slate-100 line-clamp-2">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {item.creator}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.tags.map(tag => (
                        <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-sky-400">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-850">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg flex items-center justify-center gap-1 transition"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>{t.openExternal}</span>
                    </a>
                    <button
                      onClick={() => {
                        onShareToChat(`🎥 Te comparto este contenido de ${item.platform.toUpperCase()}: "${item.title}"\n🔗 ${item.url}`, item.thumbnail);
                        onClose();
                      }}
                      className="py-1.5 px-3 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                      title="Compartir enlace al chat"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Compartir</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Direct Platform Portals */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 mt-4">
            <h5 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-sky-400" />
              Acceso Directo Oficial a Redes Sociales:
            </h5>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <a
                href="https://www.youtube.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-red-500/40 text-xs text-slate-300 flex items-center gap-2 transition"
              >
                <Youtube className="w-4 h-4 text-red-500" />
                <span>YouTube</span>
              </a>
              <a
                href="https://www.tiktok.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-pink-500/40 text-xs text-slate-300 flex items-center gap-2 transition"
              >
                <Play className="w-4 h-4 text-pink-500" />
                <span>TikTok</span>
              </a>
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-fuchsia-500/40 text-xs text-slate-300 flex items-center gap-2 transition"
              >
                <Sparkles className="w-4 h-4 text-fuchsia-400" />
                <span>Instagram</span>
              </a>
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-blue-500/40 text-xs text-slate-300 flex items-center gap-2 transition"
              >
                <Globe className="w-4 h-4 text-blue-500" />
                <span>Facebook</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Naul Social Connect • Nicaragua & Latinoamérica</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
