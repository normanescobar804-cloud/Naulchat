import React, { useState } from 'react';
import { Plus, Users, ShieldCheck, Search, X, MessageSquare, Check } from 'lucide-react';
import { User, Conversation } from '../types';
import { INITIAL_USERS } from '../data/initialData';
import { generateFingerprint } from '../utils/security';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onCreateConversation: (conv: Conversation) => void;
}

export const NewChatModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentUser,
  onCreateConversation,
}) => {
  const [mode, setMode] = useState<'direct' | 'group'>('direct');
  const [groupName, setGroupName] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const usersList = Object.values(INITIAL_USERS);

  const filteredUsers = usersList.filter(u => {
    if (!search.trim()) return true;
    return u.name.toLowerCase().includes(search.toLowerCase()) || u.username.toLowerCase().includes(search.toLowerCase());
  });

  const toggleSelectUser = (id: string) => {
    if (selectedUserIds.includes(id)) {
      setSelectedUserIds(selectedUserIds.filter(i => i !== id));
    } else {
      setSelectedUserIds([...selectedUserIds, id]);
    }
  };

  const handleCreateDirect = (user: User) => {
    const newConv: Conversation = {
      id: `conv-direct-${user.id}-${Date.now()}`,
      type: 'direct',
      name: user.name,
      avatar: user.avatar,
      isVerified: user.isVerified,
      verificationType: user.verificationType,
      participants: [currentUser, user],
      unreadCount: 0,
      e2eeKeyFingerprint: generateFingerprint(user.id),
      description: user.bio,
    };
    onCreateConversation(newConv);
    onClose();
  };

  const handleCreateGroup = () => {
    if (!groupName.trim() || selectedUserIds.length === 0) return;

    const participants = [currentUser, ...usersList.filter(u => selectedUserIds.includes(u.id))];
    const newConv: Conversation = {
      id: `conv-group-${Date.now()}`,
      type: 'group',
      name: groupName.trim(),
      avatar: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=200&auto=format&fit=crop&q=80',
      isVerified: true,
      verificationType: 'business',
      participants,
      unreadCount: 0,
      e2eeKeyFingerprint: generateFingerprint(`group-${Date.now()}`),
      description: 'Grupo creado en Naul Chat Nicaragua con cifrado de extremo a extremo.',
    };
    onCreateConversation(newConv);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100 animate-scaleUp">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <h3 className="font-display font-bold text-base text-white">
              Nueva Conversación Cifrada
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Direct vs Group */}
        <div className="grid grid-cols-2 border-b border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setMode('direct')}
            className={`py-3 text-center border-b-2 transition ${
              mode === 'direct' ? 'border-sky-500 text-sky-400 bg-sky-500/10' : 'border-transparent text-slate-400'
            }`}
          >
            Chat Directo
          </button>
          <button
            onClick={() => setMode('group')}
            className={`py-3 text-center border-b-2 transition ${
              mode === 'group' ? 'border-sky-500 text-sky-400 bg-sky-500/10' : 'border-transparent text-slate-400'
            }`}
          >
            Nuevo Grupo Cifrado
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {mode === 'group' && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Nombre del Grupo:</label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Ej: Emprendedores Masaya 🇳🇮"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          )}

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar contactos en Nicaragua..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Users List */}
          <div className="max-h-60 overflow-y-auto space-y-1">
            {filteredUsers.map((user) => {
              const isSelected = selectedUserIds.includes(user.id);
              return (
                <div
                  key={user.id}
                  onClick={() => mode === 'direct' ? handleCreateDirect(user) : toggleSelectUser(user.id)}
                  className={`p-2 rounded-xl flex items-center justify-between cursor-pointer transition ${
                    isSelected ? 'bg-sky-500/20 border border-sky-500/40' : 'hover:bg-slate-800 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-9 h-9 rounded-full object-cover border border-slate-700"
                    />
                    <div className="truncate">
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-xs text-white">{user.name}</span>
                        {user.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />}
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">{user.bio}</p>
                    </div>
                  </div>

                  {mode === 'group' && (
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                      isSelected ? 'bg-sky-500 border-sky-500 text-white' : 'border-slate-700'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {mode === 'group' && (
            <button
              onClick={handleCreateGroup}
              disabled={!groupName.trim() || selectedUserIds.length === 0}
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition shadow cursor-pointer"
            >
              Crear Grupo Cifrado
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
