import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Check,
  Copy,
  Info,
  Scan,
  Trash2,
  X,
  XCircle,
} from 'lucide-react-native';

import { useApp } from './app-context';

export type ToastType = 'success' | 'copied' | 'info' | 'error' | 'delete' | 'scan';

export interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
  actionLabel?: string;
  onAction?: () => void;
}

interface ActiveToast extends ToastOptions {
  id: string;
}

interface ToastContextValue {
  showToast: (options: ToastOptions | string) => void;
  hideToast: () => void;
  toast: {
    success: (msg: string, duration?: number) => void;
    copied: (msg?: string, duration?: number) => void;
    error: (msg: string, duration?: number) => void;
    info: (msg: string, duration?: number) => void;
    deleted: (msg?: string, duration?: number) => void;
    scan: (msg?: string, duration?: number) => void;
  };
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const { theme, activeTheme, triggerHaptic } = useApp();

  const [activeToast, setActiveToast] = useState<ActiveToast | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Animation values
  const translateY = useRef(new Animated.Value(-24)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.96)).current;

  const hideToast = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -20,
        duration: 180,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 180,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.95,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setActiveToast(null);
    });
  }, [opacity, scale, translateY]);

  const showToast = useCallback(
    (options: ToastOptions | string) => {
      const config: ToastOptions =
        typeof options === 'string' ? { message: options, type: 'info' } : options;

      const type = config.type || 'info';
      const duration = config.duration ?? (type === 'error' ? 3200 : 2400);

      // Trigger semantic haptic response
      if (type === 'error') {
        triggerHaptic('error');
      } else if (type === 'delete' || type === 'info') {
        triggerHaptic('medium');
      } else {
        triggerHaptic('success');
      }

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      const id = Date.now().toString();
      setActiveToast({
        id,
        message: config.message,
        type,
        duration,
        actionLabel: config.actionLabel,
        onAction: config.onAction,
      });

      // Reset and trigger entrance animation
      translateY.setValue(-24);
      opacity.setValue(0);
      scale.setValue(0.95);

      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          friction: 8,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 7,
          tension: 70,
          useNativeDriver: true,
        }),
      ]).start();

      timerRef.current = setTimeout(() => {
        hideToast();
      }, duration);
    },
    [hideToast, opacity, scale, translateY, triggerHaptic]
  );

  const toastHelpers = {
    success: (msg: string, duration?: number) =>
      showToast({ message: msg, type: 'success', duration }),
    copied: (msg: string = 'Copied to clipboard', duration?: number) =>
      showToast({ message: msg, type: 'copied', duration }),
    error: (msg: string, duration?: number) =>
      showToast({ message: msg, type: 'error', duration }),
    info: (msg: string, duration?: number) =>
      showToast({ message: msg, type: 'info', duration }),
    deleted: (msg: string = 'Item deleted', duration?: number) =>
      showToast({ message: msg, type: 'delete', duration }),
    scan: (msg: string = 'Scan completed', duration?: number) =>
      showToast({ message: msg, type: 'scan', duration }),
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const renderIcon = (type: ToastType) => {
    const iconSize = 14;
    switch (type) {
      case 'success':
        return (
          <View style={[styles.iconPill, { backgroundColor: theme.successBg }]}>
            <Check size={iconSize} color={theme.success} strokeWidth={2.4} />
          </View>
        );
      case 'copied':
        return (
          <View style={[styles.iconPill, { backgroundColor: theme.surfaceSecondary }]}>
            <Copy size={iconSize} color={theme.text} strokeWidth={2.2} />
          </View>
        );
      case 'delete':
        return (
          <View style={[styles.iconPill, { backgroundColor: theme.dangerBg }]}>
            <Trash2 size={iconSize} color={theme.danger} strokeWidth={2.2} />
          </View>
        );
      case 'scan':
        return (
          <View style={[styles.iconPill, { backgroundColor: theme.successBg }]}>
            <Scan size={iconSize} color={theme.success} strokeWidth={2.2} />
          </View>
        );
      case 'error':
        return (
          <View style={[styles.iconPill, { backgroundColor: theme.dangerBg }]}>
            <XCircle size={iconSize} color={theme.danger} strokeWidth={2.2} />
          </View>
        );
      case 'info':
      default:
        return (
          <View style={[styles.iconPill, { backgroundColor: theme.surfaceSecondary }]}>
            <Info size={iconSize} color={theme.textSecondary} strokeWidth={2.2} />
          </View>
        );
    }
  };

  return (
    <ToastContext.Provider
      value={{
        showToast,
        hideToast,
        toast: toastHelpers,
      }}>
      {children}

      {/* Floating Toast Notification */}
      {activeToast && (
        <View
          style={[
            styles.wrapper,
            {
              top: Math.max(insets.top, 14) + 8,
            },
          ]}
          pointerEvents="box-none">
          <Animated.View
            style={[
              styles.toastContainer,
              {
                backgroundColor: activeTheme === 'dark' ? '#18181C' : '#FFFFFF',
                borderColor:
                  activeTheme === 'dark'
                    ? 'rgba(255, 255, 255, 0.14)'
                    : 'rgba(0, 0, 0, 0.08)',
                transform: [{ translateY }, { scale }],
                opacity,
              },
            ]}>
            <Pressable
              onPress={hideToast}
              style={({ pressed }) => [
                styles.toastPressable,
                pressed && { opacity: 0.9 },
              ]}>
              {renderIcon(activeToast.type || 'info')}

              <Text
                style={[
                  styles.messageText,
                  { color: activeTheme === 'dark' ? '#FAFAFA' : '#141413' },
                ]}
                numberOfLines={2}>
                {activeToast.message}
              </Text>

              {activeToast.actionLabel && activeToast.onAction ? (
                <Pressable
                  onPress={() => {
                    activeToast.onAction?.();
                    hideToast();
                  }}
                  style={[
                    styles.actionBtn,
                    {
                      backgroundColor:
                        activeTheme === 'dark'
                          ? 'rgba(255, 255, 255, 0.1)'
                          : 'rgba(0, 0, 0, 0.06)',
                    },
                  ]}>
                  <Text
                    style={[
                      styles.actionText,
                      { color: activeTheme === 'dark' ? '#FAFAFA' : '#141413' },
                    ]}>
                    {activeToast.actionLabel}
                  </Text>
                </Pressable>
              ) : (
                <Pressable
                  onPress={hideToast}
                  hitSlop={8}
                  style={styles.closeBtn}>
                  <X
                    size={12}
                    color={activeTheme === 'dark' ? '#71717A' : '#9B9990'}
                    strokeWidth={2}
                  />
                </Pressable>
              )}
            </Pressable>
          </Animated.View>
        </View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 99999,
  },
  toastContainer: {
    minHeight: 42,
    maxWidth: 380,
    minWidth: 220,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: Platform.OS === 'ios' ? 0.12 : 0.25,
    shadowRadius: 16,
    elevation: 8,
    ...Platform.select({
      web: {
        boxShadow: '0 8px 24px -2px rgba(0, 0, 0, 0.12), 0 2px 6px -1px rgba(0, 0, 0, 0.06)',
      },
    }),
  },
  toastPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 10,
  },
  iconPill: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  actionBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginLeft: 4,
  },
  actionText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  closeBtn: {
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
