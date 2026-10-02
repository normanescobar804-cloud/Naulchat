import { User, Conversation, Message, UserStatusStory, SavedContact, BlockedContact, BubbleColors, DepositTransaction } from '../types';
import { 
  encryptMessagePayload, 
  decryptMessagePayload, 
  encryptWithAES256, 
  decryptWithAES256 
} from '../utils/security';

const TOKEN_KEY = 'naul_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('naul_custom_backend_url');
    if (custom) return custom.trim().replace(/\/+$/, '');
  }
  const envUrl = (import.meta as any).env?.VITE_API_URL;
  if (envUrl) return envUrl.trim().replace(/\/+$/, '');
  return '';
}

export function setCustomBackendUrl(url: string | null): void {
  if (url && url.trim()) {
    localStorage.setItem('naul_custom_backend_url', url.trim().replace(/\/+$/, ''));
  } else {
    localStorage.removeItem('naul_custom_backend_url');
  }
}

export function getWebSocketUrl(): string {
  const base = getApiBaseUrl();
  if (base) {
    return base.replace(/^http/i, 'ws') + '/ws';
  }
  const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = typeof window !== 'undefined' ? window.location.host : 'localhost:3000';
  return `${protocol}//${host}/ws`;
}

export function apiUrl(endpoint: string): string {
  const base = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${base}${cleanEndpoint}`;
}

export async function testBackendConnection(url?: string): Promise<{ ok: boolean; message: string; data?: any }> {
  try {
    const target = url ? url.trim().replace(/\/+$/, '') : getApiBaseUrl();
    const fullUrl = target ? `${target}/api/health` : '/api/health';
    const res = await fetch(fullUrl, { method: 'GET', headers: { 'Accept': 'application/json' } });
    if (!res.ok) {
      return { ok: false, message: `El servidor respondió con código HTTP ${res.status}` };
    }
    const data = await res.json();
    return { ok: true, message: '¡Conexión exitosa con el backend de Naul Chat!', data };
  } catch (err: any) {
    return { ok: false, message: err?.message || 'No se pudo contactar al servidor' };
  }
}

function getAuthHeaders(): Record<string, string> {
  const token = getStoredToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

// --- AUTHENTICATION ---

export async function apiRegister(payload: {
  name: string;
  phone?: string;
  email?: string;
  password?: string;
  avatar?: string;
  bio?: string;
}): Promise<{ user: User; token: string }> {
  const res = await fetch(apiUrl('/api/auth/register'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Error al registrar usuario en la base de datos');
  }
  setStoredToken(data.token);
  return { user: data.user, token: data.token };
}

export async function apiLogin(
  identifier: string,
  password?: string
): Promise<{ user: User; token: string }> {
  const res = await fetch(apiUrl('/api/auth/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password })
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Error al iniciar sesión');
  }
  setStoredToken(data.token);
  return { user: data.user, token: data.token };
}

export async function apiRequestCode(target: string): Promise<{ code: string; message: string }> {
  const res = await fetch(apiUrl('/api/auth/request-code'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ target })
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Error al solicitar código');
  }
  return { code: data.code, message: data.message };
}

export async function apiVerifyCode(
  target: string,
  code: string,
  name?: string
): Promise<{ user: User; token: string }> {
  const res = await fetch(apiUrl('/api/auth/verify-code'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ target, code, name })
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Código incorrecto o expirado');
  }
  setStoredToken(data.token);
  return { user: data.user, token: data.token };
}

export async function apiGetMe(): Promise<User | null> {
  const token = getStoredToken();
  if (!token) return null;
  try {
    const res = await fetch(apiUrl('/api/auth/me'), {
      headers: getAuthHeaders()
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user || null;
  } catch (err) {
    console.error('Error in apiGetMe:', err);
    return null;
  }
}

export async function apiGetUsers(): Promise<User[]> {
  try {
    const res = await fetch(apiUrl('/api/users'), {
      headers: getAuthHeaders()
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.users || [];
  } catch {
    return [];
  }
}

// --- CONVERSATIONS & CONTACTOS EN BASE DE DATOS ---

export async function apiGetContacts(): Promise<SavedContact[]> {
  try {
    const res = await fetch(apiUrl('/api/contacts'), {
      headers: getAuthHeaders()
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.contacts || [];
  } catch {
    return [];
  }
}

export async function apiSaveContact(payload: {
  name: string;
  phone?: string;
  email?: string;
  avatar?: string;
  bio?: string;
}): Promise<{
  contact: SavedContact;
  targetUser: User;
  conversation: Conversation;
} | null> {
  try {
    const res = await fetch(apiUrl('/api/contacts'), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Error al guardar contacto');
    }
    return data;
  } catch (err) {
    console.error('Error in apiSaveContact:', err);
    return null;
  }
}

export async function apiSaveContactsBatch(contacts: Array<{
  name: string;
  phone?: string;
  email?: string;
  avatar?: string;
  bio?: string;
}>): Promise<{
  success: boolean;
  count: number;
  contacts: SavedContact[];
  message?: string;
} | null> {
  try {
    const res = await fetch(apiUrl('/api/contacts/batch'), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ contacts })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Error al guardar lote de contactos');
    }
    return data;
  } catch (err) {
    console.error('Error in apiSaveContactsBatch:', err);
    return null;
  }
}

export async function apiDeleteContact(contactId: string, deleteConversation = false): Promise<boolean> {
  try {
    const query = deleteConversation ? '?deleteConversation=true' : '';
    const res = await fetch(apiUrl(`/api/contacts/${encodeURIComponent(contactId)}${query}`), {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    return !!data.success;
  } catch {
    return false;
  }
}

export async function apiGetBlockedContacts(): Promise<BlockedContact[]> {
  try {
    const res = await fetch(apiUrl('/api/contacts/blocked'), {
      headers: getAuthHeaders()
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.blockedUsers || [];
  } catch {
    return [];
  }
}

export async function apiBlockContact(payload: {
  blockedUserId: string;
  name?: string;
  phone?: string;
  avatar?: string;
  reason?: string;
}): Promise<BlockedContact | null> {
  try {
    const res = await fetch(apiUrl('/api/contacts/block'), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return data.block || null;
  } catch {
    return null;
  }
}

export async function apiUnblockContact(blockedUserId: string): Promise<boolean> {
  try {
    const res = await fetch(apiUrl('/api/contacts/unblock'), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ blockedUserId })
    });
    const data = await res.json();
    return !!data.success;
  } catch {
    return false;
  }
}

export async function apiGetConversations(): Promise<Conversation[]> {
  try {
    const res = await fetch(apiUrl('/api/conversations'), {
      headers: getAuthHeaders()
    });
    if (!res.ok) return [];
    const data = await res.json();
    const rawList: Conversation[] = data.conversations || [];

    // Descifrado seguro del último mensaje para vista previa en el cliente
    const decryptedList = await Promise.all(
      rawList.map(async conv => {
        if (conv.lastMessage && conv.lastMessage.content) {
          const participantIds = conv.participantIds || conv.participants?.map(p => p.id);
          const decryptedMsg = await decryptMessagePayload(conv.lastMessage, conv.id, participantIds);
          return {
            ...conv,
            lastMessage: decryptedMsg
          };
        }
        return conv;
      })
    );

    return decryptedList;
  } catch {
    return [];
  }
}

export async function apiCreateConversation(targetUserId: string): Promise<Conversation | null> {
  try {
    const res = await fetch(apiUrl('/api/conversations'), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ targetUserId })
    });
    const data = await res.json();
    return data.conversation || null;
  } catch {
    return null;
  }
}

export async function apiDeleteConversation(conversationId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/conversations/${conversationId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    return !!data.success;
  } catch {
    return false;
  }
}

// --- MESSAGES (CLIENT AES-256-GCM E2EE CON PAGINACIÓN) ---

export interface GetMessagesOptions {
  limit?: number;
  before?: number;
  offset?: number;
}

export interface PaginatedMessagesResponse {
  messages: Message[];
  hasMore: boolean;
  total: number;
  oldestTimestamp?: number;
}

export async function apiGetMessages(
  conversationId: string,
  participantIds?: string[],
  options?: GetMessagesOptions
): Promise<PaginatedMessagesResponse> {
  try {
    const params = new URLSearchParams();
    if (options?.limit) params.set('limit', options.limit.toString());
    if (options?.before) params.set('before', options.before.toString());
    if (options?.offset) params.set('offset', options.offset.toString());
    const query = params.toString() ? `?${params.toString()}` : '';

    const res = await fetch(apiUrl(`/api/conversations/${conversationId}/messages${query}`), {
      headers: getAuthHeaders()
    });
    if (!res.ok) return { messages: [], hasMore: false, total: 0 };
    const data = await res.json();
    const rawMessages: Message[] = data.messages || [];

    // Descifrar todos los mensajes recibidos del backend localmente en el cliente con AES-256
    const decryptedMessages = await Promise.all(
      rawMessages.map(msg => decryptMessagePayload(msg, conversationId, participantIds))
    );

    return {
      messages: decryptedMessages,
      hasMore: !!data.hasMore,
      total: typeof data.total === 'number' ? data.total : decryptedMessages.length,
      oldestTimestamp: data.oldestTimestamp ?? (decryptedMessages.length > 0 ? decryptedMessages[0].timestamp : undefined)
    };
  } catch (err) {
    console.error('Error al obtener y descifrar mensajes paginados:', err);
    return { messages: [], hasMore: false, total: 0 };
  }
}

export async function apiSendMessage(
  conversationId: string,
  msgPayload: Partial<Message>,
  participantIds?: string[]
): Promise<Message | null> {
  try {
    // 1. Cifrar en el cliente con AES-256-GCM antes de enviar al backend
    const encryptedPayload = await encryptMessagePayload(
      {
        ...msgPayload,
        content: msgPayload.content || '',
      },
      conversationId,
      participantIds
    );

    // 2. Enviar el payload cifrado por la red al servidor
    const res = await fetch(`/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(encryptedPayload)
    });
    const data = await res.json();
    if (!data.message) return null;

    // 3. Descifrar el mensaje confirmado para el estado local del cliente
    return await decryptMessagePayload(data.message, conversationId, participantIds);
  } catch (err) {
    console.error('Error al cifrar y enviar mensaje al backend:', err);
    return null;
  }
}

export async function apiEditMessage(
  conversationId: string,
  messageId: string,
  content: string,
  participantIds?: string[]
): Promise<boolean> {
  try {
    // Cifrar el nuevo contenido antes del PUT al backend
    const encRes = await encryptWithAES256(content, conversationId, participantIds);
    const res = await fetch(`/api/conversations/${conversationId}/messages/${messageId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ 
        content: encRes.ciphertext,
        iv: encRes.iv,
        algorithm: 'AES-256-GCM',
        isEncrypted: true
      })
    });
    const data = await res.json();
    return !!data.success;
  } catch {
    return false;
  }
}

export async function apiDeleteMessage(
  conversationId: string,
  messageId: string
): Promise<boolean> {
  try {
    const res = await fetch(`/api/conversations/${conversationId}/messages/${messageId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    return !!data.success;
  } catch {
    return false;
  }
}

export async function apiUpdateMessageReactions(
  conversationId: string,
  messageId: string,
  reactions: Record<string, string[]>
): Promise<boolean> {
  try {
    const res = await fetch(`/api/conversations/${conversationId}/messages/${messageId}/reactions`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reactions })
    });
    const data = await res.json();
    return !!data.success;
  } catch {
    return false;
  }
}

export async function apiMarkConversationAsRead(conversationId: string): Promise<string[]> {
  try {
    const res = await fetch(`/api/conversations/${conversationId}/read`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    return data.messageIds || [];
  } catch {
    return [];
  }
}

// --- STATUSES / HISTORIAS CON FOTOS, VIDEOS Y MÚSICA ---

export async function apiGetStatuses(): Promise<UserStatusStory[]> {
  try {
    const res = await fetch(apiUrl('/api/statuses'), {
      headers: getAuthHeaders()
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.statuses || [];
  } catch {
    return [];
  }
}

export async function apiCreateStatus(payload: {
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'text';
  audioTrack?: {
    title: string;
    artist?: string;
    url?: string;
  };
  text?: string;
  bgColor?: string;
}): Promise<UserStatusStory | null> {
  try {
    const res = await fetch(apiUrl('/api/statuses'), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return data.status || null;
  } catch {
    return null;
  }
}

export async function apiRecordStatusView(statusId: string): Promise<{ viewsCount: number; viewers?: any[] } | null> {
  try {
    const res = await fetch(apiUrl(`/api/statuses/${statusId}/view`), {
      method: 'POST',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    return { viewsCount: data.viewsCount || 0, viewers: data.viewers || [] };
  } catch {
    return null;
  }
}

export async function apiRenewStatus(statusId: string): Promise<UserStatusStory | null> {
  try {
    const res = await fetch(apiUrl(`/api/statuses/${statusId}/renew`), {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.status || null;
  } catch (e) {
    console.error('Error renewing status:', e);
    return null;
  }
}

export async function apiToggleStatusAutoRenew(statusId: string): Promise<{ autoRenew: boolean; status: UserStatusStory } | null> {
  try {
    const res = await fetch(apiUrl(`/api/statuses/${statusId}/auto-renew`), {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!res.ok) return null;
    const data = await res.json();
    return { autoRenew: data.autoRenew, status: data.status };
  } catch (e) {
    console.error('Error toggling auto-renew:', e);
    return null;
  }
}

export async function apiDeleteStatus(statusId: string): Promise<boolean> {
  try {
    const res = await fetch(apiUrl(`/api/statuses/${statusId}`), {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return res.ok;
  } catch (e) {
    console.error('Error deleting status:', e);
    return false;
  }
}

// --- ALMACENAMIENTO SEGURO DE ARCHIVOS CON VALIDACIÓN EN BACK-END ---

export async function apiUploadFile(
  dataUrl: string,
  fileName?: string,
  mimeType?: string,
  isPrivate: boolean = true
): Promise<{
  success: boolean;
  fileId: string;
  url: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
}> {
  const res = await fetch(apiUrl('/api/upload'), {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ dataUrl, fileName, mimeType, isPrivate })
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Error al validar y subir el archivo al servidor');
  }

  return data;
}

// --- CONTROL DE SESIONES Y SEGURIDAD ---

export async function apiListSessions(): Promise<import('../types').UserSession[]> {
  try {
    const res = await fetch(apiUrl('/api/auth/sessions'), {
      headers: getAuthHeaders()
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.sessions || [];
  } catch {
    return [];
  }
}

export async function apiRevokeSession(sessionId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/auth/sessions/${sessionId}/revoke`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    return !!data.success;
  } catch {
    return false;
  }
}

export async function apiRevokeOtherSessions(): Promise<number> {
  try {
    const res = await fetch(apiUrl('/api/auth/sessions/revoke-others'), {
      method: 'POST',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    return data.revokedCount || 0;
  } catch {
    return 0;
  }
}

export async function apiGetSecurityStatus(): Promise<import('../types').SecurityReport | null> {
  try {
    const res = await fetch(apiUrl('/api/security/status'), {
      headers: getAuthHeaders()
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.security || null;
  } catch {
    return null;
  }
}

export async function apiUpdateBubbleColors(bubbleColors: BubbleColors): Promise<User | null> {
  try {
    const res = await fetch(apiUrl('/api/users/profile'), {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ bubbleColors })
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user || null;
  } catch {
    return null;
  }
}

export async function apiUpdateUserAvatar(avatar: string): Promise<User | null> {
  try {
    const res = await fetch(apiUrl('/api/users/avatar'), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ avatar })
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user || null;
  } catch (e) {
    console.error('Error updating user avatar:', e);
    return null;
  }
}

export async function apiUpdateUserProfile(updates: {
  name?: string;
  avatar?: string;
  bio?: string;
  status?: string;
  bubbleColors?: BubbleColors;
}): Promise<User | null> {
  try {
    const res = await fetch(apiUrl('/api/users/profile'), {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user || null;
  } catch (e) {
    console.error('Error updating user profile:', e);
    return null;
  }
}

// --- GARBAGE COLLECTION & STORAGE 8GB METRICS ---

export interface StorageMetricsResponse {
  success: boolean;
  totalDiskUsageBytes: number;
  totalDiskUsageMb: number;
  maxLimitBytes: number;
  maxLimitMb: number;
  percentUsed: number;
  uploadsCount: number;
  messagesCount: number;
  conversationsCount: number;
  lastResult?: {
    cleanedFilesCount: number;
    cleanedBytesReclaimed: number;
    cleanedExpiredStatuses: number;
    cleanedExpiredOtps: number;
    cleanedRevokedSessions: number;
    cleanedOldMessages: number;
    durationMs: number;
    timestamp: string;
    triggeredBy: string;
  } | null;
}

export async function apiGetStorageMetrics(): Promise<StorageMetricsResponse | null> {
  try {
    const res = await fetch(apiUrl('/api/storage/metrics'), {
      headers: getAuthHeaders()
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function apiRunStorageCleanup(aggressive = false): Promise<{
  success: boolean;
  message: string;
  result?: any;
} | null> {
  try {
    const res = await fetch(apiUrl('/api/storage/cleanup'), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ aggressive })
    });
    return await res.json();
  } catch {
    return null;
  }
}

// --- PAGOS BANCARIOS REALES & SISTEMA DE PUNTOS ---

export interface PaymentAccountsResponse {
  success: boolean;
  accounts: {
    banpro: {
      bankName: string;
      method: string;
      accountNumber: string;
      cleanNumber: string;
      holderName: string;
      instructions: string;
    };
    lafise: {
      bankName: string;
      method: string;
      accountNumber: string;
      holderName: string;
      accountType: string;
      instructions: string;
    };
  };
  pointsRule: {
    pointsToUnlockPremium: number;
    rewardDurationDays: number;
    description: string;
  };
}

export async function apiGetPaymentAccounts(): Promise<PaymentAccountsResponse | null> {
  try {
    const res = await fetch(apiUrl('/api/payments/accounts'), {
      headers: getAuthHeaders()
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function apiDepositPayment(data: {
  method: 'banpro_billetera' | 'lafise_cuenta';
  referenceNumber: string;
  amountCordobas: number;
  planId?: string;
  voucherImage?: string;
  voucherNotes?: string;
}): Promise<{ success: boolean; user?: User; message: string; transaction?: any } | null> {
  try {
    const res = await fetch(apiUrl('/api/payments/deposit'), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return await res.json();
  } catch {
    return null;
  }
}

export async function apiGetMyDepositTransactions(): Promise<{
  success: boolean;
  transactions: DepositTransaction[];
} | null> {
  try {
    const res = await fetch(apiUrl('/api/payments/my-deposits'), {
      headers: getAuthHeaders()
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function apiAddPoints(points: number, reason: string): Promise<{
  success: boolean;
  currentPoints: number;
  unlockedPremium: boolean;
  user?: User;
  message: string;
} | null> {
  try {
    const res = await fetch(apiUrl('/api/points/add'), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ points, reason })
    });
    return await res.json();
  } catch {
    return null;
  }
}

export async function apiRedeemPoints(): Promise<{
  success: boolean;
  user?: User;
  message: string;
} | null> {
  try {
    const res = await fetch(apiUrl('/api/points/redeem'), {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return await res.json();
  } catch {
    return null;
  }
}


