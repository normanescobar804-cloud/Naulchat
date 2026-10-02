import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  doc,
  getDocFromServer
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const FIRESTORE_DB_ID = (firebaseConfig as any).firestoreDatabaseId || 'ai-studio-naulchatnicaragu-56b148e5-6e72-413c-bb7f-f845bcce661e';

// Usa la base de datos específica aprovisionada
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
}, FIRESTORE_DB_ID);

export const auth = getAuth(app);

// Test connection on startup as mandated
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, '_connection_test', 'status'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Naul Chat Firestore: client is currently offline or connecting.");
    }
    return false;
  }
}
