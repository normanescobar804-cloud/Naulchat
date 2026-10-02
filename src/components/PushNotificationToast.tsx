import React from 'react';
import { Bell, Check, ShieldCheck, X, MessageSquare, ArrowRight } from 'lucide-react';
import { Message, User } from '../types';

interface Props {
  notification: {
    message: Message;
    conversationName: string;
  } | null;
  onDismiss: () => void;
  onSelectChat: (convId: string) => void;
  pushPermissionState: NotificationPermission | 'unsupported';
  onRequestPermission: () => void;
}

export const PushNotificationToast: React.FC<Props> = ({
  notification,
  onDismiss,
  onSelectChat,
  pushPermissionState,
  onRequestPermission,
}) => {
  return (
    <>
      {/* Top Banner if Push Notifications are not yet enabled */}
      {pushPermissionState === 'default' && (
        <div className="fixed top-3 inset-x-4 max-w-xl mx-auto z-40 bg-gradient-to-r from-sky-900 to-indigo-900 border border-sky-500/40 rounded-xl p-3 shadow-xl text-white flex items-center justify-between gap-3 animate-slideDown">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/30 flex items-center justify-center text-sky-300">
              <Bell className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <p className="font-semibold">Activa las Notificaciones Push</p>
              <p className="text-sky-200 text-[11px]">Recibe alertas instantáneas de mensajes y llamadas cifradas.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onRequestPermission}
              className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs rounded-lg transition shadow cursor-pointer whitespace-nowrap"
            >
              Permitir
            </button>
          </div>
        </div>
      )}

      {/* Floating incoming message toast */}
      {notification && (
        <div className="fixed top-16 right-4 z-50 max-w-sm w-full bg-slate-900/95 border border-sky-500/40 rounded-2xl shadow-2xl p-4 text-slate-100 backdrop-blur-xl animate-slideDown">
          <div className="flex items-start gap-3">
            <img
              src={notification.message.senderAvatar}
              alt={notification.message.senderName}
              className="w-10 h-10 rounded-full object-cover border border-sky-500/40 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-white truncate flex items-center gap-1">
                  {notification.message.senderName}
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                </span>
                <span className="text-[10px] text-sky-400">Ahora</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                {notification.conversationName}
              </p>
              <p className="text-xs text-slate-200 mt-1 line-clamp-2">
                {notification.message.type === 'audio'
                  ? '🎤 Mensaje de voz cifrado'
                  : notification.message.type === 'image'
                  ? '📷 Fotografía en alta resolución'
                  : notification.message.type === 'location'
                  ? '📍 Ubicación en tiempo real'
                  : notification.message.content}
              </p>

              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => {
                    onSelectChat(notification.message.conversationId);
                    onDismiss();
                  }}
                  className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-semibold rounded-lg flex items-center gap-1 transition cursor-pointer"
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>Ver chat</span>
                </button>
                <button
                  onClick={onDismiss}
                  className="px-2 py-1 text-slate-400 hover:text-white text-[11px] rounded-lg transition"
                >
                  Descartar
                </button>
              </div>
            </div>
            <button
              onClick={onDismiss}
              className="text-slate-400 hover:text-white p-1 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
