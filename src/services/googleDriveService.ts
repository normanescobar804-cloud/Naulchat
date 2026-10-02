/**
 * Google Drive Backup & Recovery Service
 * Integrates with Google Workspace Google Drive v3 API
 * Using Firebase Auth (GoogleAuthProvider) with https://www.googleapis.com/auth/drive.file
 * Strictly implements in-memory token caching and user confirmation for destructive actions.
 */

import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User as FirebaseUser, 
  signOut 
} from 'firebase/auth';
import { app } from '../firebase';

export interface DriveBackupFile {
  id: string;
  name: string;
  size?: string;
  createdTime: string;
  modifiedTime: string;
  description?: string;
}

// Scopes configured and approved for Google Drive
export const DRIVE_SCOPES = [
  'https://www.googleapis.com/auth/drive.file'
];

const auth = getAuth(app);
const provider = new GoogleAuthProvider();
DRIVE_SCOPES.forEach(scope => provider.addScope(scope));

// CRITICAL: Cache the access token IN MEMORY only. Never in localStorage or sessionStorage.
let cachedAccessToken: string | null = null;
let cachedGoogleUser: FirebaseUser | null = null;
let isSigningIn = false;

/**
 * Initialize listener for Auth State changes
 */
export function initGoogleAuth(
  onSuccess?: (user: FirebaseUser, token: string) => void,
  onSignedOut?: () => void
) {
  return onAuthStateChanged(auth, async (user) => {
    if (user && cachedAccessToken) {
      cachedGoogleUser = user;
      if (onSuccess) onSuccess(user, cachedAccessToken);
    } else if (!user) {
      cachedAccessToken = null;
      cachedGoogleUser = null;
      if (onSignedOut) onSignedOut();
    }
  });
}

/**
 * Trigger Google Sign In Popup with Drive scopes
 */
export async function signInWithGoogleDrive(): Promise<{ user: FirebaseUser; accessToken: string }> {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);

    if (!credential?.accessToken) {
      throw new Error('No se pudo obtener el token de acceso de Google Drive.');
    }

    cachedAccessToken = credential.accessToken;
    cachedGoogleUser = result.user;

    return {
      user: result.user,
      accessToken: cachedAccessToken
    };
  } catch (err: any) {
    console.error('Error al conectar con Google Drive:', err);
    throw err;
  } finally {
    isSigningIn = false;
  }
}

/**
 * Get the current in-memory access token, or prompt to sign in
 */
export async function getGoogleAccessToken(): Promise<string> {
  if (cachedAccessToken) {
    return cachedAccessToken;
  }
  const res = await signInWithGoogleDrive();
  return res.accessToken;
}

export function getCurrentGoogleUser(): FirebaseUser | null {
  return cachedGoogleUser || auth.currentUser;
}

export function isGoogleDriveConnected(): boolean {
  return Boolean(cachedAccessToken && (cachedGoogleUser || auth.currentUser));
}

/**
 * Sign out of Google Drive connection
 */
export async function disconnectGoogleDrive(): Promise<void> {
  await signOut(auth);
  cachedAccessToken = null;
  cachedGoogleUser = null;
}

/**
 * Upload encrypted backup JSON to Google Drive
 */
export async function uploadBackupToDrive(
  fileName: string,
  jsonContent: string,
  statsDescription?: string
): Promise<DriveBackupFile> {
  const token = await getGoogleAccessToken();

  const metadata = {
    name: fileName,
    mimeType: 'application/json',
    description: statsDescription || 'Copia de seguridad cifrada de Naul Chat Nicaragua (E2EE)',
  };

  const boundary = '-------NaulChatDriveBoundary' + Math.random().toString(36).substring(2);
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    jsonContent +
    closeDelimiter;

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,size,createdTime,modifiedTime,description',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Google Drive Upload error:', errorText);
    if (response.status === 401) {
      cachedAccessToken = null;
      throw new Error('Sesión de Google Drive expirada. Por favor vuelve a conectar tu cuenta.');
    }
    throw new Error(`Error al subir a Google Drive: ${response.statusText}`);
  }

  const fileData = await response.json();
  return fileData;
}

/**
 * List all Naul Chat backup files stored in Google Drive
 */
export async function listBackupsFromDrive(): Promise<DriveBackupFile[]> {
  const token = await getGoogleAccessToken();

  // Search for files containing 'NaulChat' and not trashed
  const query = "name contains 'NaulChat' and trashed = false";
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
    query
  )}&fields=files(id,name,size,createdTime,modifiedTime,description)&orderBy=createdTime desc&pageSize=25`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      cachedAccessToken = null;
      throw new Error('Sesión de Google Drive expirada. Por favor vuelve a conectar tu cuenta.');
    }
    const errText = await response.text();
    throw new Error(`Error al listar archivos de Google Drive: ${errText}`);
  }

  const data = await response.json();
  return data.files || [];
}

/**
 * Download a backup file directly from Google Drive
 */
export async function downloadBackupFromDrive(fileId: string): Promise<string> {
  const token = await getGoogleAccessToken();

  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      cachedAccessToken = null;
      throw new Error('Sesión de Google Drive expirada. Por favor vuelve a conectar tu cuenta.');
    }
    throw new Error(`Error al descargar archivo de Google Drive: ${response.statusText}`);
  }

  return await response.text();
}

/**
 * Delete a backup file from Google Drive
 * Requires prior explicit confirmation
 */
export async function deleteBackupFromDrive(fileId: string): Promise<boolean> {
  const token = await getGoogleAccessToken();

  const url = `https://www.googleapis.com/drive/v3/files/${fileId}`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok && response.status !== 204) {
    if (response.status === 401) {
      cachedAccessToken = null;
      throw new Error('Sesión de Google Drive expirada. Por favor vuelve a conectar tu cuenta.');
    }
    throw new Error(`Error al eliminar respaldo de Google Drive: ${response.statusText}`);
  }

  return true;
}
