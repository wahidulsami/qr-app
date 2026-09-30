import React, { useState } from 'react';
import {
  KeyboardTypeOptions,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from 'react-native';
import { useApp } from '@/context/app-context';

interface AppInputProps {
  label?: string;
  helperText?: string;
  errorText?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  numberOfLines?: number;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  keyboardType?: KeyboardTypeOptions;
  style?: StyleProp<ViewStyle>;
  prefix?: string;
  rightElement?: React.ReactNode;
  editable?: boolean;
}

export function AppInput({
  label,
  helperText,
  errorText,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  numberOfLines = 3,
  secureTextEntry = false,
  autoCapitalize = 'none',
  autoCorrect = false,
  keyboardType = 'default',
  style,
  prefix,
  rightElement,
  editable = true,
}: AppInputProps) {
  const { theme } = useApp();
  const [isFocused, setIsFocused] = useState(false);

  const hasError = Boolean(errorText);

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, { color: theme.textSecondary }]}>
          {label}
        </Text>
      )}

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: editable ? theme.surface : theme.surfaceSecondary,
            borderColor: hasError
              ? theme.danger
              : isFocused
              ? theme.text
              : theme.border,
            minHeight: multiline ? numberOfLines * 24 + 16 : 46,
            paddingVertical: multiline ? 10 : 0,
          },
        ]}>
        {prefix && (
          <Text style={[styles.prefix, { color: theme.textMuted }]}>
            {prefix}
          </Text>
        )}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.textMuted}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          keyboardType={keyboardType}
          editable={editable}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          textAlignVertical={multiline ? 'top' : 'center'}
          style={[
            styles.input,
            {
              color: theme.text,
              fontSize: 14,
            },
          ]}
        />

        {rightElement && <View style={styles.rightElement}>{rightElement}</View>}
      </View>

      {hasError ? (
        <Text style={[styles.message, { color: theme.danger }]}>
          {errorText}
        </Text>
      ) : helperText ? (
        <Text style={[styles.message, { color: theme.textMuted }]}>
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
    width: '100%',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  prefix: {
    fontSize: 14,
    marginRight: 4,
    fontFamily: 'monospace',
  },
  input: {
    flex: 1,
    paddingVertical: 10,
  },
  rightElement: {
    marginLeft: 8,
  },
  message: {
    fontSize: 11,
    marginTop: 2,
    letterSpacing: 0.1,
  },
});
