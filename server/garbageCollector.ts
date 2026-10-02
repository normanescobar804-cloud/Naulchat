import fs from 'fs';
import path from 'path';
import {
  dbListStoredFiles,
  dbDeleteStoredFilesByIds,
  dbPruneExpiredStatuses,
  dbPruneExpiredOtps,
  dbPruneRevokedSessions,
  dbPruneOldMessages,
  dbGetTotalStats,
  StoredFileDoc
} from './db.js';

// Límite oficial de almacenamiento: 8 GB
export const MAX_STORAGE_BYTES = 8 * 1024 * 1024 * 1024; // 8 GB (8,589,934,592 bytes)
export const MAX_STORAGE_MB = 8192; // 8,192 MB

// Umbral de activación preventiva para mantener la app fluida (90% de 8GB = ~7.37 GB)
export const HIGH_WATERMARK_BYTES = Math.floor(MAX_STORAGE_BYTES * 0.9);

export interface GarbageCollectionResult {
  success: boolean;
  totalDiskUsageBytes: number;
  totalDiskUsageMb: number;
  maxLimitBytes: number;
  maxLimitMb: number;
  percentUsed: number;
  cleanedFilesCount: number;
  cleanedBytesReclaimed: number;
  cleanedExpiredStatuses: number;
  cleanedExpiredOtps: number;
  cleanedRevokedSessions: number;
  cleanedOldMessages: number;
  durationMs: number;
  timestamp: string;
  triggeredBy: 'automatic' | 'manual' | 'threshold';
}

let lastResult: GarbageCollectionResult | null = null;
let isCurrentlyRunning = false;
let gcIntervalTimer: NodeJS.Timeout | null = null;

/**
 * Escanea recursivamente el directorio de archivos subidos y calcula el tamaño total
 */
export function getUploadsDirectoryDiskUsage(uploadsDir: string): { totalBytes: number; files: Array<{ name: string; fullPath: string; size: number; mtimeMs: number }> } {
  if (!fs.existsSync(uploadsDir)) {
    return { totalBytes: 0, files: [] };
  }

  let totalBytes = 0;
  const files: Array<{ name: string; fullPath: string; size: number; mtimeMs: number }> = [];

  try {
    const entries = fs.readdirSync(uploadsDir);
    for (const entry of entries) {
      const fullPath = path.join(uploadsDir, entry);
      try {
        const stat = fs.statSync(fullPath);
        if (stat.isFile()) {
          totalBytes += stat.size;
          files.push({
            name: entry,
            fullPath,
            size: stat.size,
            mtimeMs: stat.mtimeMs
          });
        }
      } catch {
        // Skip unreadable files
      }
    }
  } catch (err) {
    console.error('Error reading uploads directory for disk usage:', err);
  }

  return { totalBytes, files };
}

/**
 * Rutina principal de Garbage Collection (Limpieza inteligente de memoria y almacenamiento)
 */
export async function runStorageGarbageCollection(
  uploadsDir: string,
  options?: { force?: boolean; aggressive?: boolean; triggeredBy?: 'automatic' | 'manual' | 'threshold' }
): Promise<GarbageCollectionResult> {
  if (isCurrentlyRunning) {
    if (lastResult) return lastResult;
  }

  isCurrentlyRunning = true;
  const startTime = Date.now();
  const triggeredBy = options?.triggeredBy || (options?.force ? 'manual' : 'automatic');

  let cleanedFilesCount = 0;
  let cleanedBytesReclaimed = 0;
  let cleanedExpiredStatuses = 0;
  let cleanedExpiredOtps = 0;
  let cleanedRevokedSessions = 0;
  let cleanedOldMessages = 0;

  try {
    console.log(`[GarbageCollector] Iniciando rutina de limpieza de almacenamiento (${triggeredBy}). Límite: 8 GB...`);

    // 1. Limpieza de datos efímeros y expirados
    cleanedExpiredStatuses = await dbPruneExpiredStatuses().catch(() => 0);
    cleanedExpiredOtps = await dbPruneExpiredOtps().catch(() => 0);
    cleanedRevokedSessions = await dbPruneRevokedSessions().catch(() => 0);

    // 2. Escaneo de disco en uploads/
    const diskInfo = getUploadsDirectoryDiskUsage(uploadsDir);
    const dbFiles = await dbListStoredFiles().catch(() => [] as StoredFileDoc[]);
    const dbFileMap = new Map<string, StoredFileDoc>();
    for (const f of dbFiles) {
      dbFileMap.set(f.id, f);
      if (f.filePath) {
        dbFileMap.set(path.basename(f.filePath), f);
      }
    }

    // 3. Eliminar archivos huérfanos en disco (archivos sin registro o temporales .tmp)
    for (const diskFile of diskInfo.files) {
      const isTmp = diskFile.name.endsWith('.tmp') || diskFile.name.startsWith('temp_');
      const baseId = diskFile.name.split('.')[0];
      const isTracked = dbFileMap.has(diskFile.name) || dbFileMap.has(baseId);

      if (isTmp || (!isTracked && (Date.now() - diskFile.mtimeMs > 24 * 3600 * 1000))) {
        try {
          fs.unlinkSync(diskFile.fullPath);
          cleanedBytesReclaimed += diskFile.size;
          cleanedFilesCount++;
        } catch (e) {
          console.warn(`[GarbageCollector] No se pudo eliminar archivo huérfano: ${diskFile.name}`, e);
        }
      }
    }

    // 4. Calcular el uso total actual
    const updatedDiskInfo = getUploadsDirectoryDiskUsage(uploadsDir);
    let currentUsageBytes = updatedDiskInfo.totalBytes;

    // Medir tamaño de base de datos local JSON si existe
    const dataFile = path.join(process.cwd(), 'data', 'naul_mongodb.json');
    if (fs.existsSync(dataFile)) {
      try {
        currentUsageBytes += fs.statSync(dataFile).size;
      } catch {}
    }

    // 5. Si el almacenamiento excede el umbral o el límite de 8GB, o en modo agresivo/forzado:
    const exceedsThreshold = currentUsageBytes > HIGH_WATERMARK_BYTES;
    const shouldEvictMedia = exceedsThreshold || options?.aggressive;

    if (shouldEvictMedia && dbFiles.length > 0) {
      console.log(`[GarbageCollector] Almacenamiento aproximándose al límite de 8GB (${(currentUsageBytes / 1024 / 1024).toFixed(2)} MB). Evictando archivos antiguos...`);

      // Ordenar por fecha de creación (los más antiguos primero)
      const sortedFiles = [...dbFiles].sort((a, b) => a.createdAt - b.createdAt);
      const toEvictFileIds: string[] = [];

      // Objetivo de desalojo: bajar al 80% del límite (~6.4 GB) o liberar espacio
      const targetBytes = Math.floor(MAX_STORAGE_BYTES * 0.8);

      for (const file of sortedFiles) {
        if (currentUsageBytes <= targetBytes && !options?.aggressive) {
          break;
        }

        // Eliminar del disco
        let removed = false;
        if (file.filePath && fs.existsSync(file.filePath)) {
          try {
            const stat = fs.statSync(file.filePath);
            fs.unlinkSync(file.filePath);
            currentUsageBytes -= stat.size;
            cleanedBytesReclaimed += stat.size;
            cleanedFilesCount++;
            removed = true;
          } catch {}
        } else {
          // Check by filename in uploads
          const fallbackPath = path.join(uploadsDir, `${file.id}${path.extname(file.fileName)}`);
          if (fs.existsSync(fallbackPath)) {
            try {
              const stat = fs.statSync(fallbackPath);
              fs.unlinkSync(fallbackPath);
              currentUsageBytes -= stat.size;
              cleanedBytesReclaimed += stat.size;
              cleanedFilesCount++;
              removed = true;
            } catch {}
          }
        }

        toEvictFileIds.push(file.id);
        if (!removed && file.sizeBytes) {
          cleanedBytesReclaimed += file.sizeBytes;
          cleanedFilesCount++;
        }
      }

      if (toEvictFileIds.length > 0) {
        await dbDeleteStoredFilesByIds(toEvictFileIds).catch(() => {});
      }
    }

    // 6. Si hay exceso de mensajes o se fuerza la limpieza, podar mensajes antiguos conservando los 100 más recientes por chat
    if (exceedsThreshold || options?.aggressive) {
      cleanedOldMessages = await dbPruneOldMessages(100).catch(() => 0);
    }

    // Re-evaluar uso final
    const finalDisk = getUploadsDirectoryDiskUsage(uploadsDir);
    let finalBytes = finalDisk.totalBytes;
    if (fs.existsSync(dataFile)) {
      try {
        finalBytes += fs.statSync(dataFile).size;
      } catch {}
    }

    const durationMs = Date.now() - startTime;
    const percentUsed = Math.min(100, Math.round((finalBytes / MAX_STORAGE_BYTES) * 1000) / 10);

    const result: GarbageCollectionResult = {
      success: true,
      totalDiskUsageBytes: finalBytes,
      totalDiskUsageMb: Math.round((finalBytes / (1024 * 1024)) * 100) / 100,
      maxLimitBytes: MAX_STORAGE_BYTES,
      maxLimitMb: MAX_STORAGE_MB,
      percentUsed,
      cleanedFilesCount,
      cleanedBytesReclaimed,
      cleanedExpiredStatuses,
      cleanedExpiredOtps,
      cleanedRevokedSessions,
      cleanedOldMessages,
      durationMs,
      timestamp: new Date().toISOString(),
      triggeredBy
    };

    lastResult = result;
    console.log(
      `[GarbageCollector] Limpieza completada en ${durationMs}ms. Liberados: ${(cleanedBytesReclaimed / 1024 / 1024).toFixed(2)} MB. Uso actual: ${result.totalDiskUsageMb} MB / ${MAX_STORAGE_MB} MB (${percentUsed}%).`
    );

    return result;
  } catch (err: any) {
    console.error('[GarbageCollector] Error durante la recolección de basura:', err);
    return {
      success: false,
      totalDiskUsageBytes: 0,
      totalDiskUsageMb: 0,
      maxLimitBytes: MAX_STORAGE_BYTES,
      maxLimitMb: MAX_STORAGE_MB,
      percentUsed: 0,
      cleanedFilesCount: 0,
      cleanedBytesReclaimed: 0,
      cleanedExpiredStatuses: 0,
      cleanedExpiredOtps: 0,
      cleanedRevokedSessions: 0,
      cleanedOldMessages: 0,
      durationMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      triggeredBy
    };
  } finally {
    isCurrentlyRunning = false;
  }
}

/**
 * Consulta de estado y métricas actuales de almacenamiento
 */
export async function getStorageMetrics(uploadsDir: string): Promise<{
  totalDiskUsageBytes: number;
  totalDiskUsageMb: number;
  maxLimitBytes: number;
  maxLimitMb: number;
  percentUsed: number;
  uploadsCount: number;
  messagesCount: number;
  conversationsCount: number;
  lastResult: GarbageCollectionResult | null;
}> {
  const disk = getUploadsDirectoryDiskUsage(uploadsDir);
  const dataFile = path.join(process.cwd(), 'data', 'naul_mongodb.json');
  let totalBytes = disk.totalBytes;
  if (fs.existsSync(dataFile)) {
    try {
      totalBytes += fs.statSync(dataFile).size;
    } catch {}
  }

  const dbStats = await dbGetTotalStats().catch(() => ({
    usersCount: 0,
    messagesCount: 0,
    conversationsCount: 0,
    storedFilesCount: 0,
    storedFilesBytes: 0
  }));

  const percentUsed = Math.min(100, Math.round((totalBytes / MAX_STORAGE_BYTES) * 1000) / 10);

  return {
    totalDiskUsageBytes: totalBytes,
    totalDiskUsageMb: Math.round((totalBytes / (1024 * 1024)) * 100) / 100,
    maxLimitBytes: MAX_STORAGE_BYTES,
    maxLimitMb: MAX_STORAGE_MB,
    percentUsed,
    uploadsCount: disk.files.length,
    messagesCount: dbStats.messagesCount,
    conversationsCount: dbStats.conversationsCount,
    lastResult
  };
}

/**
 * Inicia la rutina periódica de Garbage Collection en segundo plano
 */
export function startPeriodicGarbageCollector(uploadsDir: string, intervalMs = 4 * 3600 * 1000): void {
  if (gcIntervalTimer) {
    clearInterval(gcIntervalTimer);
  }

  // Ejecución inicial ligera diferida para no interferir con el arranque
  setTimeout(() => {
    runStorageGarbageCollection(uploadsDir, { force: false, triggeredBy: 'automatic' }).catch((err) =>
      console.error('[GarbageCollector] Initial background GC notice:', err)
    );
  }, 10000);

  // Intervalo recurrente (por defecto cada 4 horas)
  gcIntervalTimer = setInterval(() => {
    runStorageGarbageCollection(uploadsDir, { force: false, triggeredBy: 'automatic' }).catch((err) =>
      console.error('[GarbageCollector] Periodic background GC notice:', err)
    );
  }, intervalMs);

  console.log(`[GarbageCollector] Rutina de limpieza periódica programada cada ${Math.round(intervalMs / 3600000)}h (Límite: 8 GB).`);
}
