import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Shield, Download, Upload, Cloud, Lock, Key, CheckCircle, 
  AlertTriangle, RefreshCw, Trash2, Eye, EyeOff, FileText, Check,
  Smartphone, Database, HardDrive, ArrowRight, ExternalLink
} from 'lucide-react';
import { Conversation, Message, User } from '../types';
import { 
  createEncryptedBackup, 
  decryptAndValidateBackup, 
  downloadBackupJsonFile, 
  generateRandomPassphrase,
  DecryptedBackupPayload,
  EncryptedBackupFile 
} from '../services/backupCryptoService';
import { 
  signInWithGoogleDrive, 
  uploadBackupToDrive, 
  listBackupsFromDrive, 
  downloadBackupFromDrive, 
  deleteBackupFromDrive,
  disconnectGoogleDrive,
  getCurrentGoogleUser,
  isGoogleDriveConnected,
  DriveBackupFile
} from '../services/googleDriveService';

interface BackupRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  onRestoreBackup: (payload: DecryptedBackupPayload, mode: 'merge' | 'replace') => Promise<void>;
  initialTab?: 'export' | 'restore' | 'drive';
}

export const BackupRestoreModal: React.FC<BackupRestoreModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  conversations,
  messages,
  onRestoreBackup,
  initialTab = 'export',
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'restore' | 'drive'>(initialTab);

  // Export State
  const [exportPassphrase, setExportPassphrase] = useState('');
  const [showExportPassphrase, setShowExportPassphrase] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccessMsg, setExportSuccessMsg] = useState<string | null>(null);
  const [exportErrorMsg, setExportErrorMsg] = useState<string | null>(null);

  // Restore State
  const [restoreSource, setRestoreSource] = useState<'file' | 'drive'>('file');
  const [restorePassphrase, setRestorePassphrase] = useState('');
  const [showRestorePassphrase, setShowRestorePassphrase] = useState(false);
  const [selectedFileContent, setSelectedFileContent] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [selectedDriveFileId, setSelectedDriveFileId] = useState<string | null>(null);
  const [previewPayload, setPreviewPayload] = useState<DecryptedBackupPayload | null>(null);
  const [restoreMode, setRestoreMode] = useState<'merge' | 'replace'>('merge');
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreErrorMsg, setRestoreErrorMsg] = useState<string | null>(null);
  const [restoreSuccessMsg, setRestoreSuccessMsg] = useState<string | null>(null);

  // Google Drive State
  const [driveConnected, setDriveConnected] = useState(isGoogleDriveConnected());
  const [googleUserEmail, setGoogleUserEmail] = useState<string | null>(null);
  const [googleUserName, setGoogleUserName] = useState<string | null>(null);
  const [googleUserPhoto, setGoogleUserPhoto] = useState<string | null>(null);
  const [driveBackups, setDriveBackups] = useState<DriveBackupFile[]>([]);
  const [isLoadingDrive, setIsLoadingDrive] = useState(false);
  const [driveError, setDriveError] = useState<string | null>(null);

  // Confirmation dialog state for deleting Drive backups (Mandatory for Workspace APIs)
  const [confirmDeleteFile, setConfirmDeleteFile] = useState<DriveBackupFile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compute total messages
  const totalMessagesCount = Object.values(messages).reduce(
    (acc: number, list: Message[]) => acc + (Array.isArray(list) ? list.length : 0),
    0
  );

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      checkDriveStatus();
    }
  }, [isOpen, initialTab]);

  const checkDriveStatus = async () => {
    const user = getCurrentGoogleUser();
    if (user) {
      setDriveConnected(true);
      setGoogleUserEmail(user.email || 'Cuenta de Google');
      setGoogleUserName(user.displayName || 'Usuario de Google');
      setGoogleUserPhoto(user.photoURL || null);
      loadDriveBackups();
    } else {
      setDriveConnected(false);
      setGoogleUserEmail(null);
      setGoogleUserName(null);
      setGoogleUserPhoto(null);
    }
  };

  const loadDriveBackups = async () => {
    setIsLoadingDrive(true);
    setDriveError(null);
    try {
      const files = await listBackupsFromDrive();
      setDriveBackups(files);
    } catch (err: any) {
      setDriveError(err?.message || 'Error al conectar con Google Drive');
    } finally {
      setIsLoadingDrive(false);
    }
  };

  const handleConnectGoogleDrive = async () => {
    setIsLoadingDrive(true);
    setDriveError(null);
    try {
      const { user } = await signInWithGoogleDrive();
      setDriveConnected(true);
      setGoogleUserEmail(user.email || 'Cuenta de Google');
      setGoogleUserName(user.displayName || 'Usuario de Google');
      setGoogleUserPhoto(user.photoURL || null);
      await loadDriveBackups();
    } catch (err: any) {
      setDriveError(err?.message || 'No se pudo autorizar el acceso a Google Drive.');
    } finally {
      setIsLoadingDrive(false);
    }
  };

  const handleDisconnectGoogleDrive = async () => {
    await disconnectGoogleDrive();
    setDriveConnected(false);
    setGoogleUserEmail(null);
    setGoogleUserName(null);
    setGoogleUserPhoto(null);
    setDriveBackups([]);
  };

  // Export handling: Download JSON
  const handleDownloadBackup = async () => {
    if (!exportPassphrase.trim()) {
      setExportErrorMsg('Debes asignar una contraseña para cifrar tu respaldo.');
      return;
    }
    setIsExporting(true);
    setExportErrorMsg(null);
    setExportSuccessMsg(null);
    try {
      const encryptedData = await createEncryptedBackup(
        currentUser,
        conversations,
        messages,
        exportPassphrase
      );
      downloadBackupJsonFile(encryptedData);
      setExportSuccessMsg(
        `¡Respaldo descargado exitosamente! Contiene ${conversations.length} chats y ${totalMessagesCount} mensajes cifrados con AES-256-GCM.`
      );
    } catch (err: any) {
      setExportErrorMsg(err?.message || 'Error al generar el respaldo cifrado.');
    } finally {
      setIsExporting(false);
    }
  };

  // Export handling: Upload directly to Google Drive
  const handleUploadToGoogleDrive = async () => {
    if (!exportPassphrase.trim()) {
      setExportErrorMsg('Debes asignar una contraseña para cifrar tu respaldo.');
      return;
    }
    setIsExporting(true);
    setExportErrorMsg(null);
    setExportSuccessMsg(null);
    try {
      const encryptedData = await createEncryptedBackup(
        currentUser,
        conversations,
        messages,
        exportPassphrase
      );
      const jsonStr = JSON.stringify(encryptedData, null, 2);
      const dateStr = new Date().toISOString().slice(0, 10);
      const timeStr = `${new Date().getHours()}${new Date().getMinutes()}`;
      const fileName = `NaulChat_Respaldo_${dateStr}_${timeStr}.json`;

      const uploaded = await uploadBackupToDrive(
        fileName,
        jsonStr,
        `Respaldo Naul Chat: ${conversations.length} chats, ${totalMessagesCount} mensajes. Cifrado AES-256.`
      );

      setExportSuccessMsg(
        `¡Respaldo subido a Google Drive exitosamente! (${uploaded.name}). Puedes recuperarlo en cualquier dispositivo.`
      );
      checkDriveStatus();
    } catch (err: any) {
      setExportErrorMsg(err?.message || 'Error al subir el respaldo a Google Drive.');
    } finally {
      setIsExporting(false);
    }
  };

  // Restore handling: File selected
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    setRestoreErrorMsg(null);
    setPreviewPayload(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setSelectedFileContent(content);
    };
    reader.readAsText(file);
  };

  // Restore handling: Decrypt and inspect
  const handleInspectBackup = async () => {
    setRestoreErrorMsg(null);
    let rawContent = selectedFileContent;

    if (restoreSource === 'drive') {
      if (!selectedDriveFileId) {
        setRestoreErrorMsg('Por favor selecciona una copia de seguridad de la lista de Google Drive.');
        return;
      }
      try {
        setIsRestoring(true);
        rawContent = await downloadBackupFromDrive(selectedDriveFileId);
        setSelectedFileContent(rawContent);
      } catch (err: any) {
        setIsRestoring(false);
        setRestoreErrorMsg(err?.message || 'Error al descargar respaldo de Google Drive.');
        return;
      }
    }

    if (!rawContent) {
      setRestoreErrorMsg('No se ha seleccionado ningún archivo de respaldo.');
      setIsRestoring(false);
      return;
    }

    if (!restorePassphrase.trim()) {
      setRestoreErrorMsg('Ingresa la contraseña de cifrado del respaldo para descifrarlo.');
      setIsRestoring(false);
      return;
    }

    try {
      setIsRestoring(true);
      const payload = await decryptAndValidateBackup(rawContent, restorePassphrase);
      setPreviewPayload(payload);
    } catch (err: any) {
      setRestoreErrorMsg(err?.message || 'Error al descifrar el archivo.');
    } finally {
      setIsRestoring(false);
    }
  };

  // Execute final restore
  const handleExecuteRestore = async () => {
    if (!previewPayload) return;
    setIsRestoring(true);
    setRestoreErrorMsg(null);
    try {
      await onRestoreBackup(previewPayload, restoreMode);
      setRestoreSuccessMsg(
        `¡Restauración exitosa! Se han recuperado ${previewPayload.stats.conversationsCount} conversaciones y ${previewPayload.stats.messagesCount} mensajes.`
      );
      setPreviewPayload(null);
      setSelectedFileContent(null);
      setSelectedFileName(null);
      setRestorePassphrase('');
    } catch (err: any) {
      setRestoreErrorMsg(err?.message || 'Error al aplicar los datos del respaldo.');
    } finally {
      setIsRestoring(false);
    }
  };

  // Execute confirmed Drive delete
  const handleConfirmDeleteDriveFile = async () => {
    if (!confirmDeleteFile) return;
    setIsDeleting(true);
    try {
      await deleteBackupFromDrive(confirmDeleteFile.id);
      setConfirmDeleteFile(null);
      await loadDriveBackups();
    } catch (err: any) {
      setDriveError(err?.message || 'Error al eliminar el archivo de Google Drive.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#0b1322] border border-cyan-500/30 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-[#0e172a] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base sm:text-lg text-white flex items-center gap-2">
                Respaldo de Conversaciones
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  AES-256
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Exporta y recupera tu historial cifrado en archivo JSON o Google Drive
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-[#080d18] px-3 pt-2">
          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 py-2.5 px-3 text-xs sm:text-sm font-semibold rounded-t-xl transition cursor-pointer flex items-center justify-center gap-2 border-b-2 ${
              activeTab === 'export'
                ? 'text-cyan-400 border-cyan-400 bg-[#0b1322]'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Crear Respaldo</span>
          </button>

          <button
            onClick={() => setActiveTab('restore')}
            className={`flex-1 py-2.5 px-3 text-xs sm:text-sm font-semibold rounded-t-xl transition cursor-pointer flex items-center justify-center gap-2 border-b-2 ${
              activeTab === 'restore'
                ? 'text-emerald-400 border-emerald-400 bg-[#0b1322]'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Restaurar Chats</span>
          </button>

          <button
            onClick={() => setActiveTab('drive')}
            className={`flex-1 py-2.5 px-3 text-xs sm:text-sm font-semibold rounded-t-xl transition cursor-pointer flex items-center justify-center gap-2 border-b-2 ${
              activeTab === 'drive'
                ? 'text-amber-400 border-amber-400 bg-[#0b1322]'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>Google Drive</span>
            {driveConnected && (
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            )}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          
          {/* ===================== TAB: EXPORTAR ===================== */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <div className="text-[11px] text-slate-400 font-medium">Conversaciones</div>
                  <div className="text-xl font-bold text-white mt-1">
                    {conversations.length}
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <div className="text-[11px] text-slate-400 font-medium">Mensajes Totales</div>
                  <div className="text-xl font-bold text-cyan-400 mt-1">
                    {totalMessagesCount}
                  </div>
                </div>
                <div className="col-span-2 sm:col-span-1 p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <div className="text-[11px] text-slate-400 font-medium">Algoritmo</div>
                  <div className="text-xs font-semibold text-emerald-400 mt-1.5 flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5" />
                    AES-256-GCM
                  </div>
                </div>
              </div>

              {/* Encryption Passphrase Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-cyan-400" />
                    Contraseña de cifrado para el respaldo:
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const pin = generateRandomPassphrase();
                      setExportPassphrase(pin);
                      setShowExportPassphrase(true);
                    }}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <Key className="w-3 h-3" />
                    Generar código seguro
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showExportPassphrase ? 'text' : 'password'}
                    value={exportPassphrase}
                    onChange={(e) => setExportPassphrase(e.target.value)}
                    placeholder="Escribe una contraseña o genera una clave..."
                    className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500 pr-10 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowExportPassphrase(!showExportPassphrase)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showExportPassphrase ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  Conserva esta clave. Nadie, ni siquiera los administradores, puede recuperar tus mensajes sin ella.
                </p>
              </div>

              {/* Status messages */}
              {exportErrorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{exportErrorMsg}</span>
                </div>
              )}
              {exportSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{exportSuccessMsg}</span>
                </div>
              )}

              {/* Export Actions */}
              <div className="space-y-3 pt-2">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Opciones de Exportación
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option 1: Download JSON */}
                  <button
                    onClick={handleDownloadBackup}
                    disabled={isExporting}
                    className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/40 to-slate-900 border border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-950/60 transition cursor-pointer text-left flex flex-col justify-between group disabled:opacity-50"
                  >
                    <div>
                      <div className="p-2 w-fit rounded-xl bg-cyan-500/20 text-cyan-400 mb-2.5">
                        <Download className="w-5 h-5" />
                      </div>
                      <div className="font-semibold text-sm text-white group-hover:text-cyan-300 transition">
                        Descargar archivo JSON
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Archivo local cifrado. Puedes guardarlo en una memoria USB, teléfono o PC.
                      </p>
                    </div>
                    <div className="mt-3 text-xs font-medium text-cyan-400 flex items-center gap-1">
                      <span>Exportar archivo</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </button>

                  {/* Option 2: Upload to Google Drive */}
                  <button
                    onClick={handleUploadToGoogleDrive}
                    disabled={isExporting}
                    className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/40 to-slate-900 border border-amber-500/30 hover:border-amber-400 hover:bg-amber-950/60 transition cursor-pointer text-left flex flex-col justify-between group disabled:opacity-50"
                  >
                    <div>
                      <div className="p-2 w-fit rounded-xl bg-amber-500/20 text-amber-400 mb-2.5">
                        <Cloud className="w-5 h-5" />
                      </div>
                      <div className="font-semibold text-sm text-white group-hover:text-amber-300 transition flex items-center justify-between">
                        <span>Guardar en Google Drive</span>
                        {driveConnected && (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                            Conectado
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Sincronización en la nube con tu cuenta de Google para restaurar al cambiar de dispositivo.
                      </p>
                    </div>
                    <div className="mt-3 text-xs font-medium text-amber-400 flex items-center gap-1">
                      <span>Subir a Google Drive</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===================== TAB: RESTAURAR ===================== */}
          {activeTab === 'restore' && (
            <div className="space-y-4">
              {/* Step 1: Select Source */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">
                  1. Seleccionar origen del respaldo:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRestoreSource('file');
                      setPreviewPayload(null);
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium transition cursor-pointer flex items-center justify-center gap-2 ${
                      restoreSource === 'file'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>Archivo JSON Local</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRestoreSource('drive');
                      setPreviewPayload(null);
                      if (!driveConnected) {
                        handleConnectGoogleDrive();
                      }
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium transition cursor-pointer flex items-center justify-center gap-2 ${
                      restoreSource === 'drive'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Cloud className="w-4 h-4" />
                    <span>Desde Google Drive</span>
                  </button>
                </div>
              </div>

              {/* Source 1: Local File Picker */}
              {restoreSource === 'file' && (
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-dashed border-slate-700 text-center space-y-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept=".json"
                    className="hidden"
                  />
                  <div className="p-3 w-fit mx-auto rounded-full bg-slate-800 text-slate-300">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs sm:text-sm font-semibold text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
                    >
                      Haz clic para seleccionar el archivo JSON
                    </button>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {selectedFileName ? `Archivo: ${selectedFileName}` : 'Formato compatible: NaulChat_Respaldo_*.json'}
                    </p>
                  </div>
                </div>
              )}

              {/* Source 2: Google Drive Backups List */}
              {restoreSource === 'drive' && (
                <div className="space-y-2">
                  {!driveConnected ? (
                    <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
                      <p className="text-xs text-slate-300">
                        Conecta tu cuenta de Google para buscar tus respaldos en Google Drive.
                      </p>
                      <button
                        onClick={handleConnectGoogleDrive}
                        disabled={isLoadingDrive}
                        className="gsi-material-button mx-auto"
                        style={{
                          backgroundColor: '#131314',
                          border: '1px solid #747775',
                          borderRadius: '20px',
                          padding: '10px 16px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '10px',
                          color: '#e3e3e3',
                          fontSize: '13px',
                          cursor: 'pointer',
                          fontWeight: 500,
                        }}
                      >
                        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ width: 18, height: 18 }}>
                          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                        </svg>
                        <span>Conectar con Google Drive</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">Respaldos encontrados en Drive:</span>
                        <button
                          onClick={loadDriveBackups}
                          className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Actualizar
                        </button>
                      </div>

                      {isLoadingDrive ? (
                        <div className="py-6 text-center text-xs text-slate-400">
                          Buscando respaldos en Google Drive...
                        </div>
                      ) : driveBackups.length === 0 ? (
                        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
                          No se encontraron respaldos de Naul Chat en tu Google Drive. Puedes crear uno en la pestaña "Crear Respaldo".
                        </div>
                      ) : (
                        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                          {driveBackups.map((file) => (
                            <div
                              key={file.id}
                              onClick={() => {
                                setSelectedDriveFileId(file.id);
                                setSelectedFileName(file.name);
                                setPreviewPayload(null);
                              }}
                              className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                                selectedDriveFileId === file.id
                                  ? 'border-amber-500 bg-amber-500/10 text-white'
                                  : 'border-slate-800 bg-slate-900/40 text-slate-300 hover:border-slate-700'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <HardDrive className="w-4 h-4 text-amber-400" />
                                <div>
                                  <div className="text-xs font-medium">{file.name}</div>
                                  <div className="text-[10px] text-slate-400">
                                    {new Date(file.createdTime).toLocaleString()}
                                    {file.size && ` • ${(parseInt(file.size, 10) / 1024).toFixed(1)} KB`}
                                  </div>
                                </div>
                              </div>
                              {selectedDriveFileId === file.id && (
                                <Check className="w-4 h-4 text-amber-400" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Passphrase */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-emerald-400" />
                  2. Contraseña del respaldo para descifrar:
                </label>
                <div className="relative">
                  <input
                    type={showRestorePassphrase ? 'text' : 'password'}
                    value={restorePassphrase}
                    onChange={(e) => setRestorePassphrase(e.target.value)}
                    placeholder="Introduce la contraseña con la que se cifró el archivo..."
                    className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 pr-10 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRestorePassphrase(!showRestorePassphrase)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showRestorePassphrase ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Action to Inspect and Decrypt */}
              {!previewPayload && (
                <button
                  type="button"
                  onClick={handleInspectBackup}
                  disabled={isRestoring || (!selectedFileContent && !selectedDriveFileId)}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold text-white text-xs sm:text-sm transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isRestoring ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Descifrando datos...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      <span>Descifrar e Inspeccionar Respaldo</span>
                    </>
                  )}
                </button>
              )}

              {/* Preview Card If Decrypted */}
              {previewPayload && (
                <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/40 space-y-3">
                  <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-emerald-300">
                        Respaldo Válido Descifrado
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      Exportado el: {new Date(previewPayload.exportedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-900/60 p-2 rounded-lg">
                      <span className="text-slate-400 block text-[10px]">Usuario original:</span>
                      <span className="text-white font-medium">{previewPayload.user.name || 'Usuario'}</span>
                    </div>
                    <div className="bg-slate-900/60 p-2 rounded-lg">
                      <span className="text-slate-400 block text-[10px]">Contenido:</span>
                      <span className="text-emerald-400 font-medium">
                        {previewPayload.stats.conversationsCount} chats • {previewPayload.stats.messagesCount} msgs
                      </span>
                    </div>
                  </div>

                  {/* Mode selection */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-semibold text-slate-300 block">
                      Modo de restauración:
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setRestoreMode('merge')}
                        className={`p-2 rounded-xl border text-left text-xs transition cursor-pointer ${
                          restoreMode === 'merge'
                            ? 'border-emerald-500 bg-emerald-500/10 text-white'
                            : 'border-slate-800 bg-slate-900 text-slate-400'
                        }`}
                      >
                        <div className="font-semibold">Fusionar (Recomendado)</div>
                        <div className="text-[10px] text-slate-400">Conserva chats actuales</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRestoreMode('replace')}
                        className={`p-2 rounded-xl border text-left text-xs transition cursor-pointer ${
                          restoreMode === 'replace'
                            ? 'border-rose-500 bg-rose-500/10 text-white'
                            : 'border-slate-800 bg-slate-900 text-slate-400'
                        }`}
                      >
                        <div className="font-semibold text-rose-300">Reemplazar Todo</div>
                        <div className="text-[10px] text-slate-400">Sobrescribe los chats</div>
                      </button>
                    </div>
                  </div>

                  {/* Execute Button */}
                  <button
                    type="button"
                    onClick={handleExecuteRestore}
                    disabled={isRestoring}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm transition cursor-pointer shadow-lg flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Confirmar y Restaurar Ahora</span>
                  </button>
                </div>
              )}

              {/* Status messages */}
              {restoreErrorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{restoreErrorMsg}</span>
                </div>
              )}
              {restoreSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{restoreSuccessMsg}</span>
                </div>
              )}
            </div>
          )}

          {/* ===================== TAB: GOOGLE DRIVE ===================== */}
          {activeTab === 'drive' && (
            <div className="space-y-4">
              {/* Account Card */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {googleUserPhoto ? (
                      <img
                        src={googleUserPhoto}
                        alt="Google avatar"
                        className="w-10 h-10 rounded-full border border-slate-700 object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold">
                        G
                      </div>
                    )}
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                        {googleUserName || 'Google Drive'}
                        {driveConnected ? (
                          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            Conectado
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                            Desconectado
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">
                        {googleUserEmail || 'No hay cuenta conectada'}
                      </div>
                    </div>
                  </div>

                  {driveConnected ? (
                    <button
                      onClick={handleDisconnectGoogleDrive}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs transition cursor-pointer"
                    >
                      Desconectar
                    </button>
                  ) : null}
                </div>

                {!driveConnected && (
                  <div className="pt-2 border-t border-slate-800">
                    <p className="text-xs text-slate-400 mb-3">
                      Conecta tu cuenta de Google Drive para guardar y acceder a tus respaldos cifrados desde cualquier teléfono o computadora con permiso de tu cuenta.
                    </p>
                    <button
                      onClick={handleConnectGoogleDrive}
                      disabled={isLoadingDrive}
                      className="gsi-material-button w-full justify-center"
                      style={{
                        backgroundColor: '#131314',
                        border: '1px solid #747775',
                        borderRadius: '16px',
                        padding: '10px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        color: '#e3e3e3',
                        fontSize: '13px',
                        cursor: 'pointer',
                        fontWeight: 500,
                      }}
                    >
                      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ width: 18, height: 18 }}>
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                      </svg>
                      <span>{isLoadingDrive ? 'Conectando...' : 'Iniciar sesión con Google'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Error state */}
              {driveError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{driveError}</span>
                </div>
              )}

              {/* Backups List on Drive */}
              {driveConnected && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Respaldos en tu Google Drive ({driveBackups.length})
                    </h4>
                    <button
                      onClick={loadDriveBackups}
                      className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Refrescar
                    </button>
                  </div>

                  {isLoadingDrive ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      Cargando archivos de Google Drive...
                    </div>
                  ) : driveBackups.length === 0 ? (
                    <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 text-center space-y-2">
                      <Cloud className="w-8 h-8 text-slate-500 mx-auto" />
                      <p className="text-xs text-slate-300 font-medium">
                        No hay respaldos guardados en Drive aún.
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Ve a la pestaña "Crear Respaldo" y pulsa "Guardar en Google Drive".
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {driveBackups.map((file) => (
                        <div
                          key={file.id}
                          className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-white truncate flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span className="truncate">{file.name}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {new Date(file.createdTime).toLocaleString()}
                              {file.size && ` • ${(parseInt(file.size, 10) / 1024).toFixed(1)} KB`}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Restore shortcut */}
                            <button
                              onClick={() => {
                                setSelectedDriveFileId(file.id);
                                setSelectedFileName(file.name);
                                setRestoreSource('drive');
                                setActiveTab('restore');
                              }}
                              title="Restaurar este respaldo"
                              className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition cursor-pointer text-xs flex items-center gap-1"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Restaurar</span>
                            </button>

                            {/* Delete (with confirmation dialog) */}
                            <button
                              onClick={() => setConfirmDeleteFile(file)}
                              title="Eliminar de Google Drive"
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-[#0e172a] flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Cifrado E2EE grado militar activo</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer font-medium"
          >
            Cerrar
          </button>
        </div>

      </div>

      {/* Confirmation Dialog for Deleting Drive Backup (Mandatory for Google Workspace Skill) */}
      {confirmDeleteFile && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0f172a] border border-rose-500/40 rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="p-3 w-fit rounded-2xl bg-rose-500/20 text-rose-400 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="text-base font-bold text-white">¿Eliminar copia de Google Drive?</h4>
              <p className="text-xs text-slate-300">
                ¿Estás seguro de que deseas eliminar permanentemente el archivo <span className="font-mono text-rose-300 font-semibold">{confirmDeleteFile.name}</span> de tu Google Drive?
              </p>
              <p className="text-[11px] text-slate-400 pt-1">
                Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteFile(null)}
                disabled={isDeleting}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteDriveFile}
                disabled={isDeleting}
                className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
