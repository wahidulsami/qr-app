import React, { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { useApp } from '@/context/app-context';
import { useToast } from '@/context/toast-context';
import { QRType } from '@/types/qr';
import {
  copyToClipboard,
  exportQRAsImageFile,
  openURLSafe,
  shareQRAsImage,
} from '@/utils/qr-actions';
import { AppButton } from './app-button';
import {
  IconCheck,
  IconCopy,
  IconDownload,
  IconExternalLink,
  IconQrCode,
  IconShare,
} from '@/components/icons';

interface QRCardViewProps {
  value: string;
  size?: number;
  type?: QRType;
  title?: string;
  subtitle?: string;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  fgColor?: string;
  bgColor?: string;
  showActions?: boolean;
  onSavedLocally?: () => void;
  saveLabel?: string;
}

export function QRCardView({
  value,
  size = 190,
  type = 'text',
  title,
  subtitle,
  errorCorrectionLevel = 'M',
  fgColor,
  bgColor,
  showActions = true,
  onSavedLocally,
  saveLabel,
}: QRCardViewProps) {
  const { theme, triggerHaptic } = useApp();
  const { toast } = useToast();
  const qrRef = useRef<any>(null);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  const effectiveFg = fgColor || '#000000';
  const effectiveBg = bgColor || '#FFFFFF';

  const handleCopy = async () => {
    if (!value) return;
    const ok = await copyToClipboard(value);
    if (ok) {
      triggerHaptic('success');
      setCopied(true);
      toast.copied(type === 'url' ? 'Link copied' : 'QR copied');
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleShare = async () => {
    if (!value) return;
    triggerHaptic('light');
    const ok = await shareQRAsImage(qrRef.current, 'qr_code.png', value);
    if (!ok) {
      toast.error('Could not open share dialog');
    }
  };

  const handleSaveImage = async () => {
    if (!value) return;
    setSaving(true);
    triggerHaptic('light');
    try {
      const fileUri = await exportQRAsImageFile(qrRef.current, `qr_${Date.now()}.png`);
      if (fileUri) {
        triggerHaptic('success');
        toast.success('Saved to device storage');
      } else {
        toast.error('Could not save QR code image');
      }
    } catch {
      toast.error('Export failed');
    } finally {
      setSaving(false);
    }
  };

  const hasContent = Boolean(value && value.trim().length > 0);

  return (
    <View
      style={[
        styles.outerContainer,
        {
          borderColor: theme.border,
          backgroundColor: theme.surfaceSecondary,
        },
      ]}>
      {/* QR Visual Container */}
      <View
        style={[
          styles.qrCanvasWrapper,
          {
            backgroundColor: effectiveBg,
            borderColor: theme.borderSubtle,
          },
        ]}>
        {hasContent ? (
          <QRCode
            value={value}
            size={size}
            color={effectiveFg}
            backgroundColor={effectiveBg}
            ecl={errorCorrectionLevel}
            getRef={(c) => {
              qrRef.current = c;
            }}
          />
        ) : (
          <View style={[styles.placeholder, { width: size, height: size }]}>
            <IconQrCode size={48} color={theme.textMuted} strokeWidth={1.2} />
            <Text style={[styles.placeholderText, { color: theme.textMuted }]}>
              Enter details below to generate QR
            </Text>
          </View>
        )}
      </View>

      {/* Header Info */}
      {(title || subtitle) && (
        <View style={styles.infoBlock}>
          {title && (
            <Text
              numberOfLines={2}
              style={[styles.title, { color: theme.text }]}>
              {title}
            </Text>
          )}
          {subtitle && (
            <Text
              numberOfLines={2}
              style={[styles.subtitle, { color: theme.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
      )}

      {/* Actions */}
      {showActions && hasContent && (
        <View style={styles.actionsRow}>
          {type === 'url' && (
            <AppButton
              variant="secondary"
              size="sm"
              icon={<IconExternalLink size={14} color={theme.text} />}
              label="Open"
              onPress={() => openURLSafe(value)}
            />
          )}

          <AppButton
            variant="secondary"
            size="sm"
            icon={
              copied ? (
                <IconCheck size={14} color={theme.success} />
              ) : (
                <IconCopy size={14} color={theme.text} />
              )
            }
            label={copied ? 'Copied' : 'Copy'}
            onPress={handleCopy}
          />

          <AppButton
            variant="secondary"
            size="sm"
            icon={<IconShare size={14} color={theme.text} />}
            label="Share"
            onPress={handleShare}
          />

          <AppButton
            variant="secondary"
            size="sm"
            icon={<IconDownload size={14} color={theme.text} />}
            label="Export"
            loading={saving}
            onPress={handleSaveImage}
          />

          {onSavedLocally && (
            <AppButton
              variant="primary"
              size="sm"
              label={saveLabel || 'Save to History'}
              onPress={onSavedLocally}
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    alignItems: 'center',
    gap: 12,
    alignSelf: 'stretch',
  },
  qrCanvasWrapper: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 10,
  },
  placeholderText: {
    fontSize: 12,
    textAlign: 'center',
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  infoBlock: {
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginTop: 4,
  },
});
