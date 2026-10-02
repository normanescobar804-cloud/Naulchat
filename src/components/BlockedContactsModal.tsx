import React, { useState, useEffect } from 'react';
import { UserX, ShieldAlert, Check, X, Unlock, Loader2, AlertCircle } from 'lucide-react';
import { BlockedContact } from '../types';
import { apiGetBlockedContacts, apiUnblockContact } from '../services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onUnblocked?: (unblockedUserId: string) => void;
}

export const BlockedContactsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onUnblocked
}) => {
  const [blockedList, setBlockedList] = useState<BlockedContact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [unblockingId, setUnblockingId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadBlockedContacts();
    }
  }, [isOpen]);

  const loadBlockedContacts = async () => {
    setIsLoading(true);
    try {
      const list = await apiGetBlockedContacts();
      setBlockedList(list);
    } catch (err) {
      console.error('Error cargando contactos bloqueados:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnblock = async (blockedUserId: string, name: string) => {
    setUnblockingId(blockedUserId);
    try {
      const ok = await apiUnblockContact(blockedUserId);
      if (ok) {
        setBlockedList(prev => prev.filter(b => b.blockedUserId !== blockedUserId));
        setFeedbackMsg(`Has desbloqueado a ${name}`);
        if (onUnblocked) onUnblocked(blockedUserId);
        setTimeout(() => setFeedbackMsg(null), 3000);
      }
    } catch (err) {
      console.error('Error al desbloquear:', err);
    } finally {
      setUnblockingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100 animate-scaleUp">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <UserX className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-white">
                Contactos Bloqueados
              </h3>
              <p className="text-[11px] text-slate-400">
                {blockedList.length} {blockedList.length === 1 ? 'contacto bloqueado' : 'contactos bloqueados'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feedback Message */}
        {feedbackMsg && (
          <div className="p-2.5 bg-emerald-500/20 border-b border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Content */}
        <div className="p-4 space-y-3">
          <p className="text-xs text-slate-400">
            Los contactos bloqueados no pueden enviarte mensajes, llamarte ni ver tu última hora de conexión ni estados.
          </p>

          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-xs text-slate-400 gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
              <span>Cargando lista de bloqueados...</span>
            </div>
          ) : blockedList.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-slate-800/80 border border-slate-700/60 flex items-center justify-center mx-auto text-slate-400">
                <ShieldAlert className="w-6 h-6 text-slate-500" />
              </div>
              <p className="text-xs text-slate-300 font-medium">No tienes contactos bloqueados</p>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                Puedes bloquear un contacto desde las opciones de su chat o desde la lista de contactos.
              </p>
            </div>
          ) : (
            <div className="max-h-72 overflow-y-auto space-y-2">
              {blockedList.map((blocked) => (
                <div
                  key={blocked.id || blocked.blockedUserId}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <img
                      src={blocked.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'}
                      alt={blocked.name}
                      className="w-9 h-9 rounded-full object-cover border border-slate-700 shrink-0 opacity-70 grayscale"
                    />
                    <div className="truncate">
                      <h4 className="text-xs font-semibold text-white truncate flex items-center gap-1.5">
                        <span>{blocked.name}</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                          Bloqueado
                        </span>
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono truncate">
                        {blocked.phone || 'Sin teléfono'} • {blocked.reason || 'Bloqueado'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleUnblock(blocked.blockedUserId, blocked.name)}
                    disabled={unblockingId === blocked.blockedUserId}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    {unblockingId === blocked.blockedUserId ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                    <span>Desbloquear</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition cursor-pointer mt-2"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
