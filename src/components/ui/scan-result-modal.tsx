import React, { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useApp } from '@/context/app-context';
import { parseQRPayload } from '@/utils/qr-payload';
import { copyToClipboard, openURLSafe, shareContent } from '@/utils/qr-actions';
import { TypeBadge } from './type-badge';
import { AppButton } from './app-button';
import {
  IconCheck,
  IconClose,
  IconCopy,
  IconExternalLink,
  IconQrScan,
  IconShare,
  IconWifi,
} from '@/components/icons';

interface ScanResultModalProps {
  visible: boolean;
  rawContent: string;
  onScanAnother: () => void;
  onClose: () => void;
}

export function ScanResultModal({
  visible,
  rawContent,
  onScanAnother,
  onClose,
}: ScanResultModalProps) {
  const { theme, triggerHaptic } = useApp();
  const [copied, setCopied] = useState(false);

  if (!rawContent) return null;

  const parsed = parseQRPayload(rawContent);

  const handleCopy = async (text: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      triggerHaptic('success');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    triggerHaptic('light');
    await shareContent(rawContent, 'Scanned QR Code');
  };

  const handleOpen = () => {
    triggerHaptic('light');
    if (parsed.url) {
      openURLSafe(parsed.url);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.borderSubtle }]}>
            <View style={styles.headerTitleRow}>
              <TypeBadge type={parsed.type} size="md" />
              <View
                style={[
                  styles.statusPill,
                  {
                    backgroundColor: theme.successBg,
                    borderColor: theme.success,
                  },
                ]}>
                <IconCheck size={10} color={theme.success} />
                <Text style={[styles.statusText, { color: theme.success }]}>
                  SAVED LOCALLY
                </Text>
              </View>
            </View>

            <Pressable
              onPress={onClose}
              hitSlop={12}
              style={[styles.closeBtn, { backgroundColor: theme.surfaceSecondary }]}>
              <IconClose size={16} color={theme.text} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}>
            {/* Title & Preview */}
            <View style={styles.mainInfo}>
              <Text style={[styles.mainTitle, { color: theme.text }]}>
                {parsed.title}
              </Text>
              {parsed.subtitle && (
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                  {parsed.subtitle}
                </Text>
              )}
            </View>

            {/* Special Card for Wi-Fi */}
            {parsed.wifi && (
              <View
                style={[
                  styles.specialCard,
                  {
                    backgroundColor: theme.surfaceSecondary,
                    borderColor: theme.border,
                  },
                ]}>
                <View style={styles.cardHeader}>
                  <IconWifi size={16} color={theme.text} />
                  <Text style={[styles.cardHeaderTitle, { color: theme.text }]}>
                    Wi-Fi Credentials
                  </Text>
                </View>

                <View style={styles.wifiRow}>
                  <Text style={[styles.wifiLabel, { color: theme.textMuted }]}>
                    SSID:
                  </Text>
                  <Text style={[styles.wifiVal, { color: theme.text }]}>
                    {parsed.wifi.ssid}
                  </Text>
                </View>

                {parsed.wifi.password ? (
                  <View style={styles.wifiPassBlock}>
                    <Text style={[styles.wifiLabel, { color: theme.textMuted }]}>
                      Password:
                    </Text>
                    <View style={styles.passRow}>
                      <Text style={[styles.passText, { color: theme.text }]}>
                        {parsed.wifi.password}
                      </Text>
                      <AppButton
                        variant="secondary"
                        size="sm"
                        label="Copy"
                        icon={<IconCopy size={12} color={theme.text} />}
                        onPress={() => handleCopy(parsed.wifi?.password || '')}
                      />
                    </View>
                  </View>
                ) : (
                  <Text style={[styles.wifiVal, { color: theme.textMuted }]}>
                    Open Network (No Password)
                  </Text>
                )}
              </View>
            )}

            {/* Content Preview Box */}
            <View
              style={[
                styles.rawBox,
                {
                  backgroundColor: theme.surfaceSubtle,
                  borderColor: theme.borderSubtle,
                },
              ]}>
              <Text
                selectable
                numberOfLines={6}
                style={[styles.rawText, { color: theme.textSecondary }]}>
                {rawContent}
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionGrid}>
              {parsed.type === 'url' && (
                <AppButton
                  variant="primary"
                  size="lg"
                  icon={<IconExternalLink size={16} color={theme.accentContrast} />}
                  label="Open in Browser"
                  fullWidth
                  onPress={handleOpen}
                />
              )}

              <View style={styles.actionRow}>
                <AppButton
                  variant={parsed.type === 'url' ? 'secondary' : 'primary'}
                  size="md"
                  icon={
                    copied ? (
                      <IconCheck size={14} color={theme.success} />
                    ) : (
                      <IconCopy
                        size={14}
                        color={
                          parsed.type === 'url' ? theme.text : theme.accentContrast
                        }
                      />
                    )
                  }
                  label={copied ? 'Copied' : 'Copy Content'}
                  style={styles.flexBtn}
                  onPress={() => handleCopy(rawContent)}
                />

                <AppButton
                  variant="secondary"
                  size="md"
                  icon={<IconShare size={14} color={theme.text} />}
                  label="Share"
                  style={styles.flexBtn}
                  onPress={handleShare}
                />
              </View>

              <AppButton
                variant="ghost"
                size="md"
                icon={<IconQrScan size={15} color={theme.text} />}
                label="Scan Another Code"
                fullWidth
                onPress={() => {
                  triggerHaptic('light');
                  onScanAnother();
                }}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheet: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderTopWidth: 1,
    maxHeight: '85%',
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flexGrow: 1,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  mainInfo: {
    gap: 4,
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  specialCard: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardHeaderTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  wifiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  wifiLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  wifiVal: {
    fontSize: 13,
    fontWeight: '600',
  },
  wifiPassBlock: {
    gap: 4,
  },
  passRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  passText: {
    fontSize: 13,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  rawBox: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
  rawText: {
    fontSize: 12,
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  actionGrid: {
    gap: 10,
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  flexBtn: {
    flex: 1,
  },
});
