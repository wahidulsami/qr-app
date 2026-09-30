import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Clock,
  House,
  QrCode,
  Scan,
  Settings,
} from 'lucide-react-native';

import { useApp } from '@/context/app-context';

export interface AppDockRoute {
  key: string;
  name: string;
  params?: any;
}

export interface AppDockProps {
  state: {
    index: number;
    routes: AppDockRoute[];
  };
  descriptors: Record<
    string,
    {
      options?: {
        href?: string | null;
        title?: string;
        [key: string]: any;
      };
    }
  >;
  navigation: {
    emit: (event: {
      type: string;
      target: string;
      canPreventDefault?: boolean;
    }) => { defaultPrevented: boolean };
    navigate: (name: string, params?: any) => void;
  };
}

interface DockTabItemProps {
  name: string;
  label: string;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  renderIcon: (color: string, focused: boolean) => React.ReactNode;
  activeTheme: 'light' | 'dark';
}

function DockTabItem({
  label,
  isFocused,
  onPress,
  onLongPress,
  renderIcon,
  activeTheme,
}: DockTabItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  // Subtle bounce on becoming active
  useEffect(() => {
    if (isFocused) {
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -3,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.spring(bounceAnim, {
          toValue: 0,
          friction: 5,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isFocused, bounceAnim]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.90,
      friction: 6,
      tension: 140,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1.0,
      friction: 5,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const isDark = activeTheme === 'dark';
  const activeColor = isDark ? '#FAFAFA' : '#141413';
  const inactiveColor = isDark ? '#71717A' : '#9B9990';
  const currentColor = isFocused ? activeColor : inactiveColor;

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }, { translateY: bounceAnim }],
      }}>
      <Pressable
        accessibilityRole="tab"
        accessibilityState={{ selected: isFocused }}
        accessibilityLabel={label}
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onHoverIn={() => setIsHovered(true)}
        onHoverOut={() => setIsHovered(false)}
        style={[
          styles.dockItem,
          isFocused && (isDark ? styles.itemFocusedDark : styles.itemFocusedLight),
          !isFocused && isHovered && (isDark ? styles.itemHoverDark : styles.itemHoverLight),
        ]}>
        <View style={styles.iconContainer}>
          {renderIcon(currentColor, isFocused)}
        </View>

        {/* Subtle active indicator bar */}
        {isFocused && (
          <View
            style={[
              styles.activeIndicator,
              { backgroundColor: isDark ? '#FAFAFA' : '#141413' },
            ]}
          />
        )}
      </Pressable>
    </Animated.View>
  );
}

export function AppDock({ state, descriptors, navigation }: AppDockProps) {
  const insets = useSafeAreaInsets();
  const { activeTheme, triggerHaptic } = useApp();

  // Screen ordering and Lucide icons
  const TAB_CONFIGS: Record<
    string,
    { label: string; icon: (color: string, focused: boolean) => React.ReactNode }
  > = {
    index: {
      label: 'Home',
      icon: (color, focused) => (
        <House size={20} color={color} strokeWidth={focused ? 2.2 : 1.8} />
      ),
    },
    scan: {
      label: 'Scan',
      icon: (color, focused) => (
        <Scan size={20} color={color} strokeWidth={focused ? 2.2 : 1.8} />
      ),
    },
    generate: {
      label: 'Generate',
      icon: (color, focused) => (
        <QrCode size={20} color={color} strokeWidth={focused ? 2.2 : 1.8} />
      ),
    },
    history: {
      label: 'History',
      icon: (color, focused) => (
        <Clock size={20} color={color} strokeWidth={focused ? 2.2 : 1.8} />
      ),
    },
    settings: {
      label: 'Settings',
      icon: (color, focused) => (
        <Settings size={20} color={color} strokeWidth={focused ? 2.2 : 1.8} />
      ),
    },
  };

  const isDark = activeTheme === 'dark';

  // Filter routes to only include defined tabs (excluding explore and hidden tabs)
  const visibleRoutes = state.routes.filter((route) => {
    const options = descriptors[route.key]?.options;
    if (options?.href === null) return false;
    return Boolean(TAB_CONFIGS[route.name]);
  });

  return (
    <View
      style={[
        styles.dockWrapper,
        {
          bottom: Math.max(insets.bottom, 10) + 6,
        },
      ]}
      pointerEvents="box-none">
      <View
        style={[
          styles.dockContainer,
          isDark ? styles.dockDark : styles.dockLight,
        ]}
        pointerEvents="auto">
        {visibleRoutes.map((route) => {
          const isFocused = state.routes[state.index].key === route.key;
          const config = TAB_CONFIGS[route.name];

          const onPress = () => {
            triggerHaptic('light');

            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <DockTabItem
              key={route.key}
              name={route.name}
              label={config?.label || route.name}
              isFocused={isFocused}
              onPress={onPress}
              onLongPress={onLongPress}
              renderIcon={config?.icon || (() => null)}
              activeTheme={activeTheme}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dockWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  dockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    gap: 4,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: Platform.OS === 'ios' ? 0.09 : 0.22,
    shadowRadius: 18,
    elevation: 10,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(20px) saturate(180%)',
      },
    }),
  },
  dockLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: 'rgba(0, 0, 0, 0.08)',
    ...Platform.select({
      web: {
        boxShadow:
          '0 12px 36px -4px rgba(0, 0, 0, 0.10), 0 4px 12px -2px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05)',
      },
    }),
  },
  dockDark: {
    backgroundColor: 'rgba(21, 21, 25, 0.95)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    ...Platform.select({
      web: {
        boxShadow:
          '0 12px 36px -4px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.08)',
      },
    }),
  },
  dockItem: {
    width: 52,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      },
    }),
  },
  itemFocusedLight: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  itemFocusedDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.09)',
  },
  itemHoverLight: {
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
  itemHoverDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 4,
    width: 14,
    height: 2.5,
    borderRadius: 1.5,
  },
});
