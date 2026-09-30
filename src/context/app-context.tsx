import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import * as Haptics from 'expo-haptics';

import { AppSettings, DEFAULT_SETTINGS, QRItem } from '@/types/qr';
import {
  clearAllLocalData,
  clearHistory,
  deleteHistoryItem,
  getHistory,
  getSettings,
  saveHistoryItem,
  saveSettings,
} from '@/utils/storage';
import { AppTheme, ThemeTokens } from '@/constants/theme';

interface AppContextValue {
  history: QRItem[];
  settings: AppSettings;
  activeTheme: 'light' | 'dark';
  theme: AppTheme;
  isReady: boolean;
  addItem: (item: Omit<QRItem, 'id' | 'createdAt'> & { id?: string; createdAt?: number }) => Promise<QRItem>;
  removeItem: (id: string) => Promise<void>;
  clearItems: (filterOrigin?: 'scanned' | 'generated') => Promise<void>;
  updateSettings: (partial: Partial<AppSettings>) => Promise<void>;
  resetAllData: () => Promise<void>;
  triggerHaptic: (type?: 'light' | 'medium' | 'success' | 'warning' | 'error') => void;
  refreshHistory: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [history, setHistory] = useState<QRItem[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isReady, setIsReady] = useState(false);

  // Load persistent data on mount
  useEffect(() => {
    let mounted = true;
    async function init() {
      try {
        const [savedHistory, savedSettings] = await Promise.all([getHistory(), getSettings()]);
        if (mounted) {
          setHistory(savedHistory);
          setSettings(savedSettings);
        }
      } catch (err) {
        console.error('[AppProvider] Init error:', err);
      } finally {
        if (mounted) {
          setIsReady(true);
        }
      }
    }
    init();
    return () => {
      mounted = false;
    };
  }, []);

  // Compute active theme
  const activeTheme: 'light' | 'dark' =
    settings.themeMode === 'system'
      ? systemScheme === 'dark'
        ? 'dark'
        : 'light'
      : settings.themeMode;

  const theme: AppTheme = ThemeTokens[activeTheme];

  const triggerHaptic = (type: 'light' | 'medium' | 'success' | 'warning' | 'error' = 'light') => {
    if (!settings.hapticsEnabled) return;
    try {
      if (type === 'light') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      } else if (type === 'medium') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      } else if (type === 'success') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      } else if (type === 'warning') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      } else if (type === 'error') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      }
    } catch {
      // safe fallback on unsupported environments
    }
  };

  const addItem = async (
    item: Omit<QRItem, 'id' | 'createdAt'> & { id?: string; createdAt?: number }
  ): Promise<QRItem> => {
    const saved = await saveHistoryItem(item);
    setHistory((prev) => [saved, ...prev.filter((i) => i.id !== saved.id)]);
    triggerHaptic('success');
    return saved;
  };

  const removeItem = async (id: string): Promise<void> => {
    await deleteHistoryItem(id);
    setHistory((prev) => prev.filter((i) => i.id !== id));
    triggerHaptic('medium');
  };

  const clearItems = async (filterOrigin?: 'scanned' | 'generated'): Promise<void> => {
    await clearHistory(filterOrigin);
    if (!filterOrigin) {
      setHistory([]);
    } else {
      setHistory((prev) => prev.filter((i) => i.origin !== filterOrigin));
    }
    triggerHaptic('medium');
  };

  const updateSettings = async (partial: Partial<AppSettings>): Promise<void> => {
    const updated = await saveSettings(partial);
    setSettings(updated);
    triggerHaptic('light');
  };

  const resetAllData = async (): Promise<void> => {
    await clearAllLocalData();
    setHistory([]);
    setSettings(DEFAULT_SETTINGS);
    triggerHaptic('warning');
  };

  const refreshHistory = async (): Promise<void> => {
    const items = await getHistory();
    setHistory(items);
  };

  return (
    <AppContext.Provider
      value={{
        history,
        settings,
        activeTheme,
        theme,
        isReady,
        addItem,
        removeItem,
        clearItems,
        updateSettings,
        resetAllData,
        triggerHaptic,
        refreshHistory,
      }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return ctx;
}
