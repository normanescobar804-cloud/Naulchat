import React, { useState } from 'react';
import { User } from '../types';
import { 
  X, 
  UserPlus, 
  Trash2, 
  Search, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  Phone,
  Sparkles
} from 'lucide-react';

interface DeletedContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  deletedContacts: User[];
  onRestoreContact: (contact: User) => void;
  onRestoreAllContacts?: () => void;
}

export const DeletedContactsModal: React.FC<DeletedContactsModalProps> = ({
  isOpen,
  onClose,
  deletedContacts,
  onRestoreContact,
  onRestoreAllContacts
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [restoredId, setRestoredId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filtered = deletedContacts.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.phone && c.phone.includes(searchTerm)) ||
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleRestore = (contact: User) => {
    setRestoredId(contact.id);
    onRestoreContact(contact);
    setTimeout(() => {
      setRestoredId(null);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100 animate-scaleUp max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-amber-600/30">
              <Trash2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                <span>Contactos Eliminados</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 font-mono border border-slate-700">
                  {deletedContacts.length}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Puedes volver a agregar cualquier contacto a tu app cuando desees
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3 flex-1 overflow-y-auto">
          {/* Search bar */}
          {deletedContacts.length > 0 && (
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre, teléfono o correo..."
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 placeholder-slate-500"
              />
            </div>
          )}

          {/* Action to restore all */}
          {deletedContacts.length > 1 && onRestoreAllContacts && (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/60">
              <div className="text-xs text-slate-300">
                <span>¿Deseas restaurar todos los contactos a tu lista activa?</span>
              </div>
              <button
                onClick={onRestoreAllContacts}
                className="px-3 py-1.5 rounded-lg bg-sky-600/20 hover:bg-sky-600 text-sky-300 hover:text-white border border-sky-500/30 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar todos</span>
              </button>
            </div>
          )}

          {/* Empty state */}
          {deletedContacts.length === 0 ? (
            <div className="py-12 px-6 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700 mx-auto flex items-center justify-center text-slate-500">
                <CheckCircle2 className="w-7 h-7 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">No tienes contactos eliminados</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                  Todos tus contactos están en tu lista principal. Cuando elimines un contacto de tu agenda, aparecerá en esta sección para que puedas volver a agregarlo en cualquier momento.
                </p>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No se encontraron contactos eliminados con el término "{searchTerm}".
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((contact) => {
                const isJustRestored = restoredId === contact.id;
                return (
                  <div
                    key={contact.id}
                    className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/90 hover:border-slate-700/80 transition flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="relative shrink-0">
                        <img
                          src={contact.avatar}
                          alt={contact.name}
                          className="w-11 h-11 rounded-full object-cover border border-slate-700 opacity-90 group-hover:opacity-100"
                        />
                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-slate-700 border-2 border-slate-900" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs sm:text-sm font-semibold text-white truncate">
                            {contact.name}
                          </h4>
                          {contact.isVerified && (
                            <ShieldCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          )}
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
                            Eliminado
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5 font-mono">
                          {contact.phone && (
                            <span className="text-sky-300">{contact.phone}</span>
                          )}
                          {contact.email && (
                            <>
                              <span>•</span>
                              <span className="text-slate-400 font-sans truncate">{contact.email}</span>
                            </>
                          )}
                        </div>

                        {contact.bio && (
                          <p className="text-[10px] text-slate-500 truncate mt-0.5">
                            {contact.bio}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Restore button */}
                    <div className="shrink-0">
                      <button
                        onClick={() => handleRestore(contact)}
                        disabled={isJustRestored}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-sm ${
                          isJustRestored
                            ? 'bg-emerald-600 text-white shadow-emerald-500/30'
                            : 'bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white shadow-sky-500/20 hover:scale-[1.02]'
                        }`}
                        title="Volver a agregar a mis contactos"
                      >
                        {isJustRestored ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                            <span>¡Agregado!</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Volver a agregar</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Los contactos restaurados vuelven de inmediato a tu directorio activo</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
