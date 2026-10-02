/**
 * Backup Encryption & Decryption Service
 * Uses Web Crypto API AES-256-GCM and PBKDF2 (100,000 rounds)
 * Format compliant for local JSON export and Google Drive synchronization
 */

import { Conversation, Message, User } from '../types';

export interface DecryptedBackupPayload {
  version: string;
  appName: string;
  exportedAt: string;
  user: Partial<User>;
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  contacts?: any[];
  preferences?: Record<string, any>;
  stats: {
    conversationsCount: number;
    messagesCount: number;
  };
}

export interface EncryptedBackupFile {
  format: 'NAUL_CHAT_BACKUP_V1';
  appName: string;
  version: string;
  createdAt: string;
  userId: string;
  userName: string;
  isEncrypted: boolean;
  encryption: {
    algorithm: 'AES-256-GCM';
    kdf: 'PBKDF2-SHA256';
    iterations: number;
    salt: string; // Base64
    iv: string;   // Base64
  };
  stats: {
    conversationsCount: number;
    messagesCount: number;
  };
  payload: string; // Base64 AES-256-GCM ciphertext
}

// Convert bytes to Base64
function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert Base64 to Uint8Array
function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Generate a memorable and secure recovery code
export function generateRandomPassphrase(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let segment1 = '';
  let segment2 = '';
  for (let i = 0; i < 4; i++) {
    segment1 += chars.charAt(Math.floor(Math.random() * chars.length));
    segment2 += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `NAUL-${segment1}-${segment2}`;
}

/**
 * Derives a 256-bit AES key from a passphrase and salt using PBKDF2
 */
async function deriveBackupKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const passphraseBytes = enc.encode(passphrase.trim());

  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    passphraseBytes,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Creates an encrypted backup bundle ready for JSON export or Google Drive upload
 */
export async function createEncryptedBackup(
  user: User | null,
  conversations: Conversation[],
  messages: Record<string, Message[]>,
  passphrase: string,
  contacts: any[] = []
): Promise<EncryptedBackupFile> {
  if (!passphrase || passphrase.trim().length < 4) {
    throw new Error('La contraseña de cifrado debe tener al menos 4 caracteres.');
  }

  // Calculate stats
  let totalMessages = 0;
  Object.values(messages).forEach((list) => {
    if (Array.isArray(list)) totalMessages += list.length;
  });

  const payloadObject: DecryptedBackupPayload = {
    version: '1.0',
    appName: 'Naul Chat Nicaragua',
    exportedAt: new Date().toISOString(),
    user: user
      ? {
          id: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          avatar: user.avatar,
          bubbleColors: user.bubbleColors,
        }
      : {},
    conversations,
    messages,
    contacts,
    stats: {
      conversationsCount: conversations.length,
      messagesCount: totalMessages,
    },
  };

  const payloadString = JSON.stringify(payloadObject);
  const enc = new TextEncoder();
  const encodedData = enc.encode(payloadString);

  // Generate 16-byte random salt and 12-byte IV
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  // Derive AES key
  const aesKey = await deriveBackupKey(passphrase, salt);

  // Encrypt with AES-GCM
  const cipherBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    aesKey,
    encodedData
  );

  const cipherBytes = new Uint8Array(cipherBuffer);

  return {
    format: 'NAUL_CHAT_BACKUP_V1',
    appName: 'Naul Chat Nicaragua',
    version: '1.0',
    createdAt: new Date().toISOString(),
    userId: user?.id || 'guest',
    userName: user?.name || 'Usuario Naul Chat',
    isEncrypted: true,
    encryption: {
      algorithm: 'AES-256-GCM',
      kdf: 'PBKDF2-SHA256',
      iterations: 100000,
      salt: uint8ArrayToBase64(salt),
      iv: uint8ArrayToBase64(iv),
    },
    stats: {
      conversationsCount: conversations.length,
      messagesCount: totalMessages,
    },
    payload: uint8ArrayToBase64(cipherBytes),
  };
}

/**
 * Decrypts and validates an encrypted backup string or object
 */
export async function decryptAndValidateBackup(
  backupInput: string | EncryptedBackupFile,
  passphrase: string
): Promise<DecryptedBackupPayload> {
  if (!passphrase) {
    throw new Error('Debes ingresar la contraseña de cifrado del respaldo.');
  }

  let backupObj: EncryptedBackupFile;
  if (typeof backupInput === 'string') {
    try {
      backupObj = JSON.parse(backupInput);
    } catch {
      throw new Error('El archivo no tiene un formato JSON válido.');
    }
  } else {
    backupObj = backupInput;
  }

  if (backupObj.format !== 'NAUL_CHAT_BACKUP_V1') {
    throw new Error('El archivo no corresponde a un formato de respaldo válido de Naul Chat.');
  }

  if (!backupObj.encryption || !backupObj.encryption.salt || !backupObj.encryption.iv || !backupObj.payload) {
    throw new Error('Los parámetros criptográficos del respaldo están incompletos o dañados.');
  }

  const salt = base64ToUint8Array(backupObj.encryption.salt);
  const iv = base64ToUint8Array(backupObj.encryption.iv);
  const ciphertext = base64ToUint8Array(backupObj.payload);

  try {
    const aesKey = await deriveBackupKey(passphrase, salt);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      aesKey,
      ciphertext
    );

    const dec = new TextDecoder();
    const decryptedString = dec.decode(decryptedBuffer);
    const parsedPayload: DecryptedBackupPayload = JSON.parse(decryptedString);

    if (!Array.isArray(parsedPayload.conversations) || typeof parsedPayload.messages !== 'object') {
      throw new Error('El contenido del respaldo está incompleto o dañado.');
    }

    return parsedPayload;
  } catch (err: any) {
    if (err?.name === 'OperationError' || err?.message?.includes('operation failed')) {
      throw new Error('Contraseña incorrecta. No se pudo descifrar el respaldo.');
    }
    throw new Error(err?.message || 'Error al descifrar el archivo de respaldo.');
  }
}

/**
 * Trigger browser file download of backup JSON
 */
export function downloadBackupJsonFile(backupData: EncryptedBackupFile): void {
  const jsonStr = JSON.stringify(backupData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = `${now.getHours()}${now.getMinutes()}`;
  const filename = `NaulChat_Respaldo_${dateStr}_${timeStr}.json`;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
