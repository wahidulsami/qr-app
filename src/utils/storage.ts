import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings, DEFAULT_SETTINGS, QRItem } from '@/types/qr';

const STORAGE_KEYS = {
  HISTORY: '@qr_studio_history_v1',
  SETTINGS: '@qr_studio_settings_v1',
} as const;

/**
 * Generates an offline random ID
 */
export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Safely parses JSON with fallback
 */
function safeJsonParse<T>(jsonString: string | null, fallback: T): T {
  if (!jsonString) return fallback;
  try {
    const parsed = JSON.parse(jsonString);
    return parsed !== null && parsed !== undefined ? (parsed as T) : fallback;
  } catch (error) {
    console.warn('[Storage] Corrupted data detected, returning fallback:', error);
    return fallback;
  }
}

/**
 * Fetch all history items from local storage
 */
export async function getHistory(): Promise<QRItem[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.HISTORY);
    const parsed = safeJsonParse<QRItem[]>(raw, []);
    if (!Array.isArray(parsed)) return [];
    // Sort descending by creation date
    return parsed.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  } catch (err) {
    console.error('[Storage] Error reading history:', err);
    return [];
  }
}

/**
 * Add or update an item in history
 */
export async function saveHistoryItem(
  item: Omit<QRItem, 'id' | 'createdAt'> & { id?: string; createdAt?: number }
): Promise<QRItem> {
  try {
    const current = await getHistory();
    const fullItem: QRItem = {
      ...item,
      id: item.id || generateId(),
      createdAt: item.createdAt || Date.now(),
    };

    // Remove existing item with same id if any, and insert at head
    const filtered = current.filter((x) => x.id !== fullItem.id);
    const updated = [fullItem, ...filtered];

    await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
    return fullItem;
  } catch (err) {
    console.error('[Storage] Error saving history item:', err);
    throw err;
  }
}

/**
 * Delete a specific history item by ID
 */
export async function deleteHistoryItem(id: string): Promise<void> {
  try {
    const current = await getHistory();
    const updated = current.filter((item) => item.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
  } catch (err) {
    console.error('[Storage] Error deleting history item:', err);
    throw err;
  }
}

/**
 * Clear history (optionally filtered by origin: 'scanned' | 'generated')
 */
export async function clearHistory(filterOrigin?: 'scanned' | 'generated'): Promise<void> {
  try {
    if (!filterOrigin) {
      await AsyncStorage.removeItem(STORAGE_KEYS.HISTORY);
      return;
    }
    const current = await getHistory();
    const kept = current.filter((item) => item.origin !== filterOrigin);
    await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(kept));
  } catch (err) {
    console.error('[Storage] Error clearing history:', err);
    throw err;
  }
}

/**
 * Fetch application settings
 */
export async function getSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    const parsed = safeJsonParse<Partial<AppSettings>>(raw, {});
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch (err) {
    console.error('[Storage] Error reading settings:', err);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Update and persist settings
 */
export async function saveSettings(partial: Partial<AppSettings>): Promise<AppSettings> {
  try {
    const current = await getSettings();
    const updated: AppSettings = { ...current, ...partial };
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('[Storage] Error saving settings:', err);
    throw err;
  }
}

/**
 * Completely wipe all stored data
 */
export async function clearAllLocalData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([STORAGE_KEYS.HISTORY, STORAGE_KEYS.SETTINGS]);
  } catch (err) {
    console.error('[Storage] Error clearing all data:', err);
    throw err;
  }
}

/**
 * Retrieve storage statistics
 */
export async function getStorageStats(): Promise<{
  scannedCount: number;
  generatedCount: number;
  totalCount: number;
  approxBytes: number;
}> {
  try {
    const history = await getHistory();
    const scannedCount = history.filter((i) => i.origin === 'scanned').length;
    const generatedCount = history.filter((i) => i.origin === 'generated').length;
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.HISTORY);
    const approxBytes = raw ? raw.length * 2 : 0; // rough UTF-16 byte estimate

    return {
      scannedCount,
      generatedCount,
      totalCount: history.length,
      approxBytes,
    };
  } catch {
    return {
      scannedCount: 0,
      generatedCount: 0,
      totalCount: 0,
      approxBytes: 0,
    };
  }
}
