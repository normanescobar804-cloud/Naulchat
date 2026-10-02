import React, { useState, useMemo } from 'react';
import { Search, X, Sparkles } from 'lucide-react';
import { EMOJI_CATEGORIES, EMOJI_KEYWORDS, QUICK_REACTION_EMOJIS } from '../data/emojis';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectEmoji: (emoji: string) => void;
  targetMessagePreview?: string;
  title?: string;
}

export const EmojiReactionPickerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSelectEmoji,
  targetMessagePreview,
  title
}) => {
  const [activeCategoryId, setActiveCategoryId] = useState<string>('frecuentes');
  const [searchQuery, setSearchQuery] = useState('');

  const totalEmojisCount = useMemo(() => {
    const set = new Set<string>();
    EMOJI_CATEGORIES.forEach(c => c.emojis.forEach(e => set.add(e)));
    return set.size;
  }, []);

  const filteredEmojis = useMemo(() => {
    if (!searchQuery.trim()) {
      const cat = EMOJI_CATEGORIES.find(c => c.id === activeCategoryId);
      return cat ? cat.emojis : QUICK_REACTION_EMOJIS;
    }

    const q = searchQuery.toLowerCase().trim();
    const matches: string[] = [];

    // Search through all categories
    for (const cat of EMOJI_CATEGORIES) {
      for (const emoji of cat.emojis) {
        if (matches.includes(emoji)) continue;

        // Check keywords
        const keywords = EMOJI_KEYWORDS[emoji] || [];
        const hasKeywordMatch = keywords.some(k => k.toLowerCase().includes(q));

        // Check category name match
        const hasCategoryMatch = cat.name.toLowerCase().includes(q);

        if (hasKeywordMatch || hasCategoryMatch || emoji.includes(q)) {
          matches.push(emoji);
        }
      }
    }

    // Direct country / sport / flag fallbacks
    if (matches.length === 0) {
      if (q.includes('copa') || q.includes('trofeo') || q.includes('campeon') || q.includes('ganador')) {
        const copasCat = EMOJI_CATEGORIES.find(c => c.id === 'copas');
        return copasCat ? copasCat.emojis : ['🏆', '🥇', '🥈', '🥉', '🏅', '🎖️', '👑'];
      }
      if (q.includes('bandera') || q.includes('pais')) {
        const flagCat = EMOJI_CATEGORIES.find(c => c.id === 'banderas');
        return flagCat ? flagCat.emojis : [];
      }
      if (q.includes('nica') || q.includes('pinol')) {
        return ['🇳🇮', '☕', '⚾', '🌋', '❤️', '🏆'];
      }
    }

    return matches.length > 0 ? matches : QUICK_REACTION_EMOJIS;
  }, [searchQuery, activeCategoryId]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[#0a1220] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-scaleUp text-slate-200"
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-800 bg-[#070e19] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🏆</span>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5 flex-wrap">
                <span>{title || 'Reaccionar al mensaje'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 font-semibold border border-sky-500/30">
                  +{totalEmojisCount} Emojis, Copas & Banderas
                </span>
              </h3>
              {targetMessagePreview && (
                <p className="text-[11px] text-slate-400 truncate max-w-xs sm:max-w-sm">
                  "{targetMessagePreview}"
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            title="Cerrar (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search bar */}
        <div className="p-3 border-b border-slate-800/80 bg-[#08101e]">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar emoji... (copa, trofeo, bandera, nicaragua, risa, amor)"
              autoFocus
              className="w-full bg-[#0e192c] border border-slate-700/80 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 transition shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-slate-400 hover:text-white p-1"
                title="Limpiar"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs (hidden when searching) */}
        {!searchQuery && (
          <div className="flex items-center gap-1 p-2 border-b border-slate-800/80 bg-[#070e19] overflow-x-auto no-scrollbar">
            {EMOJI_CATEGORIES.map(cat => {
              const isActive = activeCategoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategoryId(cat.id)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shrink-0 transition cursor-pointer ${
                    isActive 
                      ? 'bg-sky-500/25 border border-sky-500/40 text-sky-300 font-semibold shadow-sm' 
                      : 'hover:bg-slate-800/80 text-slate-400 hover:text-slate-200'
                  }`}
                  title={cat.name}
                >
                  <span className="text-sm">{cat.icon}</span>
                  <span className="text-[11px] whitespace-nowrap">{cat.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Emojis Grid */}
        <div className="flex-1 overflow-y-auto p-3 min-h-[260px] max-h-[380px]">
          <div className="grid grid-cols-7 sm:grid-cols-9 gap-2">
            {filteredEmojis.map((emoji, idx) => (
              <button
                key={`${emoji}-${idx}`}
                onClick={() => {
                  onSelectEmoji(emoji);
                  onClose();
                }}
                className="w-10 h-10 rounded-xl hover:bg-sky-500/20 active:bg-sky-500/30 flex items-center justify-center text-2xl transition hover:scale-125 cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                title={emoji}
              >
                <span>{emoji}</span>
              </button>
            ))}
          </div>

          {filteredEmojis.length === 0 && (
            <div className="py-10 text-center text-xs text-slate-400 space-y-2">
              <p>No se encontraron emojis para "{searchQuery}".</p>
              <button
                onClick={() => setSearchQuery('')}
                className="px-3 py-1 rounded-lg bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 text-xs"
              >
                Ver todos los emojis
              </button>
            </div>
          )}
        </div>

        {/* Footer Quick Access */}
        <div className="p-2.5 border-t border-slate-800 bg-[#070e19] flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5 text-sky-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sincronizado en tiempo real (WebSocket + Firestore)</span>
          </span>
          <span className="text-slate-400 font-mono">
            {filteredEmojis.length} emojis disponibles
          </span>
        </div>
      </div>
    </div>
  );
};
