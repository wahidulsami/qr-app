import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { QRType } from '@/types/qr';
import { useApp } from '@/context/app-context';
import { IconFileText, IconGlobe, IconMail, IconUser, IconWifi } from '@/components/icons';

interface TypeBadgeProps {
  type: QRType;
  size?: 'sm' | 'md';
}

export function TypeBadge({ type, size = 'sm' }: TypeBadgeProps) {
  const { theme } = useApp();

  const config = (() => {
    switch (type) {
      case 'url':
        return {
          label: 'URL',
          colors: theme.badgeUrl,
          icon: (c: string, s: number) => <IconGlobe size={s} color={c} />,
        };
      case 'wifi':
        return {
          label: 'WI-FI',
          colors: theme.badgeWifi,
          icon: (c: string, s: number) => <IconWifi size={s} color={c} />,
        };
      case 'contact':
        return {
          label: 'CONTACT',
          colors: theme.badgeContact,
          icon: (c: string, s: number) => <IconUser size={s} color={c} />,
        };
      case 'email':
        return {
          label: 'EMAIL',
          colors: theme.badgeEmail,
          icon: (c: string, s: number) => <IconMail size={s} color={c} />,
        };
      case 'text':
      default:
        return {
          label: 'TEXT',
          colors: theme.badgeText,
          icon: (c: string, s: number) => <IconFileText size={s} color={c} />,
        };
    }
  })();

  const isSmall = size === 'sm';
  const iconSize = isSmall ? 11 : 13;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.colors.bg,
          borderColor: config.colors.border,
          paddingVertical: isSmall ? 2 : 4,
          paddingHorizontal: isSmall ? 6 : 9,
        },
      ]}>
      {config.icon(config.colors.text, iconSize)}
      <Text
        style={[
          styles.text,
          {
            color: config.colors.text,
            fontSize: isSmall ? 10 : 11,
          },
        ]}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1,
    gap: 4,
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: 'monospace',
    fontWeight: '700',
    letterSpacing: 0.6,
  },
});
