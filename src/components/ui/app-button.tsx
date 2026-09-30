import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { useApp } from '@/context/app-context';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface AppButtonProps {
  label?: string;
  children?: React.ReactNode;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  fullWidth?: boolean;
}

export function AppButton({
  label,
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  trailingIcon,
  disabled = false,
  loading = false,
  style,
  fullWidth = false,
}: AppButtonProps) {
  const { theme, triggerHaptic } = useApp();

  const handlePress = () => {
    if (disabled || loading) return;
    triggerHaptic('light');
    onPress?.();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          container: {
            backgroundColor: theme.accent,
            borderColor: theme.accent,
            borderWidth: 1,
          },
          text: {
            color: theme.accentContrast,
          },
          subWrapper: {
            backgroundColor: theme.accentContrast === '#FFFFFF' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
          },
        };
      case 'secondary':
        return {
          container: {
            backgroundColor: theme.surfaceSecondary,
            borderColor: theme.border,
            borderWidth: 1,
          },
          text: {
            color: theme.text,
          },
          subWrapper: {
            backgroundColor: theme.surfaceSubtle,
          },
        };
      case 'danger':
        return {
          container: {
            backgroundColor: theme.dangerBg,
            borderColor: theme.danger,
            borderWidth: 1,
          },
          text: {
            color: theme.danger,
          },
          subWrapper: {
            backgroundColor: 'rgba(217, 56, 58, 0.1)',
          },
        };
      case 'ghost':
      default:
        return {
          container: {
            backgroundColor: 'transparent',
            borderColor: 'transparent',
            borderWidth: 1,
          },
          text: {
            color: theme.text,
          },
          subWrapper: {
            backgroundColor: theme.surfaceSecondary,
          },
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          paddingVertical: 7,
          paddingHorizontal: 12,
          fontSize: 12,
          iconWrapperSize: 20,
          borderRadius: 8,
        };
      case 'lg':
        return {
          paddingVertical: 14,
          paddingHorizontal: 20,
          fontSize: 15,
          iconWrapperSize: 28,
          borderRadius: 12,
        };
      case 'md':
      default:
        return {
          paddingVertical: 10,
          paddingHorizontal: 16,
          fontSize: 13,
          iconWrapperSize: 24,
          borderRadius: 10,
        };
    }
  };

  const variantStyle = getVariantStyles();
  const sizeStyle = getSizeStyles();

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        variantStyle.container,
        {
          paddingVertical: sizeStyle.paddingVertical,
          paddingHorizontal: sizeStyle.paddingHorizontal,
          borderRadius: sizeStyle.borderRadius,
          opacity: disabled ? 0.45 : pressed ? 0.88 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
          alignSelf: fullWidth ? 'stretch' : 'auto',
        },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variantStyle.text.color}
          style={styles.spinner}
        />
      ) : (
        <>
          {icon && <View style={styles.iconLead}>{icon}</View>}
          {label ? (
            <Text
              style={[
                styles.label,
                variantStyle.text,
                { fontSize: sizeStyle.fontSize },
              ]}>
              {label}
            </Text>
          ) : (
            children
          )}
          {trailingIcon && (
            <View
              style={[
                styles.trailingWrapper,
                variantStyle.subWrapper,
                {
                  width: sizeStyle.iconWrapperSize,
                  height: sizeStyle.iconWrapperSize,
                  borderRadius: sizeStyle.iconWrapperSize / 2,
                },
              ]}>
              {trailingIcon}
            </View>
          )}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  label: {
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  spinner: {
    marginVertical: 2,
  },
  iconLead: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  trailingWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },
});
