import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useApp } from '@/context/app-context';

interface BezelCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  innerStyle?: StyleProp<ViewStyle>;
  outerPadding?: number;
  innerPadding?: number;
  highlight?: boolean;
}

export function BezelCard({
  children,
  style,
  innerStyle,
  outerPadding = 3,
  innerPadding = 16,
  highlight = false,
}: BezelCardProps) {
  const { theme } = useApp();

  return (
    <View
      style={[
        styles.outerShell,
        {
          borderColor: highlight ? theme.text : theme.border,
          backgroundColor: theme.surfaceSecondary,
          padding: outerPadding,
        },
        style,
      ]}>
      <View
        style={[
          styles.innerCore,
          {
            backgroundColor: theme.surface,
            padding: innerPadding,
          },
          innerStyle,
        ]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerShell: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  innerCore: {
    borderRadius: 12,
  },
});
