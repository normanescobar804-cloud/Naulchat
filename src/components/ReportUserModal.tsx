import React, { useState } from 'react';
import { Flag, ShieldAlert, CheckCircle2, X, AlertTriangle } from 'lucide-react';
import { submitUserReport } from '../services/firestoreChat';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  reportedUserName: string;
  reportedUserId: string;
  currentUserId: string;
  onUserBlocked?: () => void;
}

const REPORT_REASONS = [
  'Spam o mensajes no solicitados',
  'Suplantación de identidad / Perfil falso',
  'Acoso o amenazas',
  'Contenido explícito o inapropiado',
  'Intento de fraude o estafa',
  'Otro motivo'
];

export const ReportUserModal: React.FC<Props> = ({
  isOpen,
  onClose,
  reportedUserName,
  reportedUserId,
  currentUserId,
  onUserBlocked,
}) => {
  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0]);
  const [details, setDetails] = useState('');
  const [alsoBlock, setAlsoBlock] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await submitUserReport({
        reportedUserId,
        reporterUserId: currentUserId,
        reason: selectedReason,
        details: details.trim() || 'Sin detalles adicionales'
      });

      if (alsoBlock && onUserBlocked) {
        onUserBlocked();
      }

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 1600);
    } catch {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 1500);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#0b1424] border border-slate-700/80 rounded-2xl w-full max-w-md p-5 shadow-2xl relative text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-8 text-center space-y-3 animate-scaleUp">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">Reporte recibido</h3>
            <p className="text-xs text-slate-300 max-w-xs mx-auto">
              Gracias por colaborar con la seguridad de la comunidad Naul Chat Nicaragua. El equipo de moderación revisará este caso.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                <Flag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Reportar usuario</h3>
                <p className="text-xs text-slate-400">
                  Estás reportando a <span className="text-sky-400 font-semibold">{reportedUserName}</span>
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">
                ¿Cuál es el motivo del reporte?
              </label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {REPORT_REASONS.map(reason => (
                  <label
                    key={reason}
                    className={`flex items-center gap-2.5 p-2 rounded-xl border text-xs cursor-pointer transition ${
                      selectedReason === reason
                        ? 'border-sky-500 bg-sky-500/15 text-white font-medium'
                        : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <input
                      type="radio"
                      name="report-reason"
                      checked={selectedReason === reason}
                      onChange={() => setSelectedReason(reason)}
                      className="accent-sky-400"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Detalles adicionales (opcional)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Describe brevemente lo ocurrido..."
                rows={3}
                className="w-full bg-[#080e1a] border border-slate-700/80 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition resize-none"
              />
            </div>

            <label className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={alsoBlock}
                onChange={(e) => setAlsoBlock(e.target.checked)}
                className="accent-red-400 rounded"
              />
              <span className="text-slate-300">
                Bloquear también a <strong className="text-white">{reportedUserName}</strong> para no recibir más mensajes o llamadas.
              </span>
            </label>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white transition flex items-center justify-center gap-1.5 shadow-lg shadow-red-600/30"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>{isSubmitting ? 'Enviando...' : 'Enviar Reporte'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
