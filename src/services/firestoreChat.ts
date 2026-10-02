import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc,
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc,
  serverTimestamp,
  limit
} from 'firebase/firestore';
import { db } from '../firebase';
import { User, Message, Conversation, BubbleColors } from '../types';
import { encryptWithAES256, encryptMessagePayload, decryptMessagePayload } from '../utils/security';

export interface FirestoreUserData {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatar: string;
  bio: string;
  status: string;
  isVerified: boolean;
  online: boolean;
  lastSeen?: string;
  updatedAt: string;
  bubbleColors?: BubbleColors;
}

// Guardar o registrar usuario en Firestore
export async function saveUserToFirestore(user: User): Promise<void> {
  try {
    const userRef = doc(db, 'users', user.id);
    await setDoc(userRef, {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email || '',
      avatar: user.avatar,
      bio: user.bio || '',
      status: user.status || 'online',
      isVerified: !!user.isVerified,
      online: true,
      lastSeen: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...(user.bubbleColors ? { bubbleColors: user.bubbleColors } : {})
    }, { merge: true });
  } catch (err) {
    console.error('Error saving user to Firestore:', err);
  }
}

// Actualizar colores personalizados de los globos de mensajes en Firestore
export async function updateUserBubbleColorsInFirestore(
  userId: string, 
  bubbleColors: BubbleColors
): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      bubbleColors,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.error('Error updating bubble colors in Firestore:', err);
    throw err;
  }
}

// Guardar contacto en Firestore asociado al usuario
export async function saveContactToFirestore(
  userId: string,
  contact: {
    id: string;
    contactUserId: string;
    name: string;
    phone: string;
    email: string;
    avatar?: string;
    bio?: string;
    conversationId?: string;
  }
): Promise<void> {
  try {
    const contactRef = doc(db, 'users', userId, 'savedContacts', contact.id);
    await setDoc(contactRef, {
      ...contact,
      userId,
      createdAt: Date.now(),
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.error('Error saving contact to Firestore:', err);
  }
}

// Obtener contactos guardados en Firestore
export async function getContactsFromFirestore(userId: string): Promise<any[]> {
  try {
    const contactsCol = collection(db, 'users', userId, 'savedContacts');
    const snap = await getDocs(contactsCol);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('Error getting contacts from Firestore:', err);
    return [];
  }
}

// Eliminar contacto guardado en Firestore
export async function deleteContactFromFirestore(userId: string, contactId: string): Promise<void> {
  try {
    const contactRef = doc(db, 'users', userId, 'savedContacts', contactId);
    try {
      await deleteDoc(contactRef);
    } catch {
      await setDoc(contactRef, { deleted: true, updatedAt: new Date().toISOString() }, { merge: true });
    }
  } catch (err) {
    console.error('Error deleting contact from Firestore:', err);
  }
}

// Sincronizar lista de IDs de contactos eliminados en Firestore para persistencia
export async function syncDeletedContactIdsInFirestore(userId: string, deletedContactIds: string[]): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      deletedContactIds,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.error('Error syncing deleted contact IDs in Firestore:', err);
  }
}

// Obtener lista de IDs de contactos eliminados en Firestore
export async function getDeletedContactIdsFromFirestore(userId: string): Promise<string[]> {
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data();
      return Array.isArray(data.deletedContactIds) ? data.deletedContactIds : [];
    }
    return [];
  } catch (err) {
    console.error('Error getting deleted contact IDs from Firestore:', err);
    return [];
  }
}

// Eliminar conversación completa en Firestore
export async function deleteConversationFromFirestore(conversationId: string): Promise<void> {
  try {
    const convRef = doc(db, 'conversations', conversationId);
    try {
      await deleteDoc(convRef);
    } catch {
      await setDoc(convRef, { isDeleted: true, updatedAt: new Date().toISOString() }, { merge: true });
    }
  } catch (err) {
    console.error('Error deleting conversation from Firestore:', err);
  }
}

// Buscar o autenticar usuario por teléfono o correo
export async function findUserByCredentials(identifier: string): Promise<User | null> {
  try {
    const usersCol = collection(db, 'users');
    const cleanId = identifier.trim().toLowerCase();
    
    // Probar búsqueda
    const snap = await getDocs(usersCol);
    for (const docSnap of snap.docs) {
      const data = docSnap.data();
      const phone = (data.phone || '').replace(/\s+/g, '');
      const email = (data.email || '').toLowerCase();
      const name = (data.name || '').toLowerCase();
      const cleanInput = cleanId.replace(/\s+/g, '');

      if (phone === cleanInput || email === cleanId || name === cleanId || data.id === cleanId) {
        return {
          id: data.id,
          name: data.name,
          username: `@${(data.name || 'user').toLowerCase().replace(/\s+/g, '_')}`,
          avatar: data.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
          status: 'online',
          isVerified: !!data.isVerified,
          verificationType: 'official',
          phone: data.phone || identifier,
          email: data.email || '',
          bio: data.bio || '¡Hola! Estoy usando Naul Chat Nicaragua 🇳🇮',
          biometricRegistered: true,
          emailVerified: true,
          publicKeyFingerprint: 'NC-E2EE-CLOUD',
          bubbleColors: data.bubbleColors,
        };
      }
    }
    return null;
  } catch (err) {
    console.error('Error searching user in Firestore:', err);
    return null;
  }
}

// Obtener todos los usuarios registrados en Firestore
export async function getRegisteredUsers(): Promise<User[]> {
  try {
    const usersCol = collection(db, 'users');
    const snap = await getDocs(usersCol);
    const users: User[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      users.push({
        id: data.id,
        name: data.name || 'Usuario',
        username: `@${(data.name || 'user').toLowerCase().replace(/\s+/g, '_')}`,
        avatar: data.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        status: data.online ? 'online' : 'offline',
        isVerified: !!data.isVerified,
        verificationType: 'official',
        phone: data.phone || '',
        email: data.email || '',
        bio: data.bio || '',
        biometricRegistered: true,
        emailVerified: true,
        publicKeyFingerprint: 'NC-E2EE-CLOUD',
        bubbleColors: data.bubbleColors,
      });
    });
    return users;
  } catch (err) {
    console.error('Error loading users from Firestore:', err);
    return [];
  }
}

// Enviar mensaje a Firestore con cifrado AES-256 en el cliente
export async function sendMessageToFirestore(
  conversationId: string, 
  message: Message,
  participants: User[]
): Promise<void> {
  try {
    const participantIds = participants.map(p => p.id);
    // Cifrar el contenido con AES-256 antes de guardarlo en Firestore
    const encryptedMsg = await encryptMessagePayload(message, conversationId, participantIds);

    // 1. Actualizar o crear metadata de la conversación con vista previa cifrada
    const convRef = doc(db, 'conversations', conversationId);
    await setDoc(convRef, {
      id: conversationId,
      lastMessage: encryptedMsg.content,
      lastMessageTime: new Date(message.timestamp).toISOString(),
      updatedAt: new Date().toISOString(),
      participantIds,
      participants: participants.map(p => ({
        id: p.id,
        name: p.name,
        phone: p.phone,
        avatar: p.avatar,
        isVerified: !!p.isVerified
      }))
    }, { merge: true });

    // 2. Guardar mensaje cifrado en la subcolección
    const msgRef = doc(db, 'conversations', conversationId, 'messages', message.id);
    await setDoc(msgRef, {
      id: encryptedMsg.id,
      conversationId: encryptedMsg.conversationId,
      senderId: encryptedMsg.senderId,
      senderName: encryptedMsg.senderName,
      senderAvatar: encryptedMsg.senderAvatar,
      type: encryptedMsg.type,
      content: encryptedMsg.content,
      timestamp: encryptedMsg.timestamp,
      status: 'delivered',
      isEncrypted: true,
      iv: encryptedMsg.iv || null,
      algorithm: 'AES-256-GCM',
      audioMetadata: encryptedMsg.audioMetadata || null,
      fileMetadata: encryptedMsg.fileMetadata || null,
      locationMetadata: encryptedMsg.locationMetadata || null,
      caption: encryptedMsg.caption || null,
      createdAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error sending message to Firestore:', err);
  }
}

// Editar mensaje en Firestore con cifrado AES-256
export async function editMessageInFirestore(
  conversationId: string, 
  messageId: string, 
  newContent: string,
  participantIds?: string[]
): Promise<void> {
  try {
    const encRes = await encryptWithAES256(newContent, conversationId, participantIds);
    const msgRef = doc(db, 'conversations', conversationId, 'messages', messageId);
    await updateDoc(msgRef, {
      content: encRes.ciphertext,
      iv: encRes.iv,
      algorithm: 'AES-256-GCM',
      isEncrypted: true,
      isEdited: true,
      editedAt: Date.now()
    });
  } catch (err) {
    console.error('Error editing message in Firestore:', err);
  }
}

// Eliminar mensaje en Firestore (soft delete o remove)
export async function deleteMessageInFirestore(conversationId: string, messageId: string): Promise<void> {
  try {
    const msgRef = doc(db, 'conversations', conversationId, 'messages', messageId);
    await updateDoc(msgRef, {
      isDeleted: true,
      content: 'Este mensaje fue eliminado',
      type: 'text'
    });
  } catch (err) {
    console.error('Error deleting message in Firestore:', err);
  }
}

// Sincronizar reacciones de mensaje en Firestore en tiempo real
export async function updateMessageReactionsInFirestore(
  conversationId: string, 
  messageId: string, 
  reactions: Record<string, string[]>
): Promise<void> {
  try {
    const msgRef = doc(db, 'conversations', conversationId, 'messages', messageId);
    await updateDoc(msgRef, {
      reactions: reactions || {},
      reactionsUpdatedAt: Date.now()
    });
  } catch (err) {
    console.error('Error updating message reactions in Firestore:', err);
  }
}

// Crear reporte de usuario en Firestore
export async function submitUserReport(ticket: {
  reportedUserId: string;
  reporterUserId: string;
  reason: string;
  details: string;
}): Promise<boolean> {
  try {
    const reportsCol = collection(db, 'reports');
    await addDoc(reportsCol, {
      ...ticket,
      timestamp: Date.now(),
      status: 'pending',
      createdAt: new Date().toISOString()
    });
    return true;
  } catch (err) {
    console.error('Error reporting user:', err);
    return false;
  }
}

// Bloquear / Desbloquear usuario
export async function toggleBlockUser(currentUserId: string, targetUserId: string, shouldBlock: boolean): Promise<void> {
  try {
    const blockRef = doc(db, 'users', currentUserId, 'blocked', targetUserId);
    if (shouldBlock) {
      await setDoc(blockRef, {
        userId: targetUserId,
        blockedAt: Date.now()
      });
    } else {
      await setDoc(blockRef, { unblocked: true }, { merge: true });
    }
  } catch (err) {
    console.error('Error toggling block user in Firestore:', err);
  }
}

export function subscribeToMessages(
  conversationId: string, 
  onUpdate: (msgs: Message[]) => void
) {
  try {
    const msgsCol = collection(db, 'conversations', conversationId, 'messages');
    const q = query(msgsCol, orderBy('timestamp', 'asc'));

    return onSnapshot(q, async (snapshot) => {
      const rawMsgs: Message[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        rawMsgs.push({
          id: d.id,
          conversationId: d.conversationId || conversationId,
          senderId: d.senderId,
          senderName: d.senderName,
          senderAvatar: d.senderAvatar,
          type: d.type || 'text',
          content: d.content || '',
          timestamp: d.timestamp || Date.now(),
          status: d.status || 'delivered',
          isEncrypted: d.isEncrypted !== false,
          iv: d.iv || undefined,
          algorithm: d.algorithm || 'AES-256-GCM',
          cipherPayload: d.content,
          isEdited: !!d.isEdited,
          editedAt: d.editedAt || undefined,
          isDeleted: !!d.isDeleted,
          audioMetadata: d.audioMetadata || undefined,
          fileMetadata: d.fileMetadata || undefined,
          locationMetadata: d.locationMetadata || undefined,
          caption: d.caption || undefined,
          reactions: d.reactions || undefined
        });
      });
      const decryptedMsgs = await Promise.all(
        rawMsgs.map(m => decryptMessagePayload(m, conversationId))
      );
      onUpdate(decryptedMsgs);
    }, (error) => {
      console.warn('Firestore messages subscription:', error);
    });
  } catch (err) {
    console.error('Error subscribing to messages:', err);
    return () => {};
  }
}
