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

import { QRItem } from '@/types/qr';
import { useApp } from '@/context/app-context';
import { useToast } from '@/context/toast-context';
import { parseQRPayload } from '@/utils/qr-payload';
import { copyToClipboard, openURLSafe } from '@/utils/qr-actions';
import { TypeBadge } from './type-badge';
import { QRCardView } from './qr-card-view';
import { AppButton } from './app-button';
import { ConfirmModal } from './confirm-modal';
import {
  IconCheck,
  IconClose,
  IconCopy,
  IconExternalLink,
  IconTrash,
} from '@/components/icons';

interface QRDetailModalProps {
  item: QRItem | null;
  visible: boolean;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

export function QRDetailModal({
  item,
  visible,
  onClose,
  onDelete,
}: QRDetailModalProps) {
  const { theme, triggerHaptic } = useApp();
  const { toast } = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!item) return null;

  const parsed = parseQRPayload(item.rawContent);
  const formattedDate = new Date(item.createdAt).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const handleCopyField = async (text: string, key: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      triggerHaptic('success');
      setCopiedKey(key);
      toast.copied(key.includes('url') ? 'Link copied' : 'QR content copied');
      setTimeout(() => setCopiedKey(null), 2000);
    } else {
      toast.error('Failed to copy to clipboard');
    }
  };

  const confirmDelete = () => {
    setShowDeleteConfirm(false);
    onDelete?.(item.id);
    onClose();
  };

  return (
    <>
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
            {/* Top Bar */}
            <View style={[styles.header, { borderBottomColor: theme.borderSubtle }]}>
              <View style={styles.headerMeta}>
                <TypeBadge type={item.type} size="md" />
                <View
                  style={[
                    styles.originBadge,
                    {
                      backgroundColor:
                        item.origin === 'scanned'
                          ? theme.badgeUrl.bg
                          : theme.badgeWifi.bg,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.originText,
                      {
                        color:
                          item.origin === 'scanned'
                            ? theme.badgeUrl.text
                            : theme.badgeWifi.text,
                      },
                    ]}>
                    {item.origin.toUpperCase()}
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
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}>
              {/* QR Code Canvas */}
              <QRCardView
                value={item.rawContent}
                size={170}
                type={item.type}
                title={item.title}
                subtitle={item.subtitle}
                showActions={true}
              />

              {/* Timestamp */}
              <View
                style={[
                  styles.timestampBox,
                  {
                    borderColor: theme.borderSubtle,
                    backgroundColor: theme.surfaceSubtle,
                  },
                ]}>
                <Text style={[styles.metaLabel, { color: theme.textMuted }]}>
                  Recorded
                </Text>
                <Text style={[styles.metaValue, { color: theme.textSecondary }]}>
                  {formattedDate}
                </Text>
              </View>

              {/* Structured Metadata Breakdown */}
              {parsed.wifi && (
                <View
                  style={[
                    styles.detailsBlock,
                    {
                      borderColor: theme.border,
                      backgroundColor: theme.surfaceSecondary,
                    },
                  ]}>
                  <Text style={[styles.blockTitle, { color: theme.text }]}>
                    Network Configuration
                  </Text>

                  <View style={styles.fieldRow}>
                    <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>
                      Network Name (SSID)
                    </Text>
                    <Text style={[styles.fieldValue, { color: theme.text }]}>
                      {parsed.wifi.ssid}
                    </Text>
                  </View>

                  {parsed.wifi.password ? (
                    <View style={styles.fieldRow}>
                      <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>
                        Password
                      </Text>
                      <View style={styles.passwordRow}>
                        <Text style={[styles.fieldValueMono, { color: theme.text }]}>
                          {parsed.wifi.password}
                        </Text>
                        <AppButton
                          variant="secondary"
                          size="sm"
                          icon={
                            copiedKey === 'wifi_pass' ? (
                              <IconCheck size={12} color={theme.success} />
                            ) : (
                              <IconCopy size={12} color={theme.text} />
                            )
                          }
                          label={copiedKey === 'wifi_pass' ? 'Copied' : 'Copy'}
                          onPress={() =>
                            handleCopyField(parsed.wifi?.password || '', 'wifi_pass')
                          }
                        />
                      </View>
                    </View>
                  ) : (
                    <Text style={[styles.fieldValue, { color: theme.textMuted }]}>
                      No password required (Open Network)
                    </Text>
                  )}

                  <View style={styles.fieldRow}>
                    <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>
                      Security Type
                    </Text>
                    <Text style={[styles.fieldValue, { color: theme.textSecondary }]}>
                      {parsed.wifi.encryption.toUpperCase()}
                      {parsed.wifi.hidden ? ' • Hidden Network' : ''}
                    </Text>
                  </View>
                </View>
              )}

              {parsed.contact && (
                <View
                  style={[
                    styles.detailsBlock,
                    {
                      borderColor: theme.border,
                      backgroundColor: theme.surfaceSecondary,
                    },
                  ]}>
                  <Text style={[styles.blockTitle, { color: theme.text }]}>
                    Contact Information
                  </Text>

                  <View style={styles.fieldRow}>
                    <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>
                      Full Name
                    </Text>
                    <Text style={[styles.fieldValue, { color: theme.text }]}>
                      {parsed.contact.firstName} {parsed.contact.lastName || ''}
                    </Text>
                  </View>

                  {parsed.contact.phone && (
                    <View style={styles.fieldRow}>
                      <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>
                        Phone
                      </Text>
                      <View style={styles.passwordRow}>
                        <Text style={[styles.fieldValue, { color: theme.text }]}>
                          {parsed.contact.phone}
                        </Text>
                        <AppButton
                          variant="secondary"
                          size="sm"
                          icon={
                            copiedKey === 'contact_phone' ? (
                              <IconCheck size={12} color={theme.success} />
                            ) : (
                              <IconCopy size={12} color={theme.text} />
                            )
                          }
                          label={copiedKey === 'contact_phone' ? 'Copied' : 'Copy'}
                          onPress={() =>
                            handleCopyField(parsed.contact?.phone || '', 'contact_phone')
                          }
                        />
                      </View>
                    </View>
                  )}

                  {parsed.contact.email && (
                    <View style={styles.fieldRow}>
                      <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>
                        Email Address
                      </Text>
                      <View style={styles.passwordRow}>
                        <Text style={[styles.fieldValue, { color: theme.text }]}>
                          {parsed.contact.email}
                        </Text>
                        <AppButton
                          variant="secondary"
                          size="sm"
                          icon={
                            copiedKey === 'contact_email' ? (
                              <IconCheck size={12} color={theme.success} />
                            ) : (
                              <IconCopy size={12} color={theme.text} />
                            )
                          }
                          label={copiedKey === 'contact_email' ? 'Copied' : 'Copy'}
                          onPress={() =>
                            handleCopyField(parsed.contact?.email || '', 'contact_email')
                          }
                        />
                      </View>
                    </View>
                  )}

                  {parsed.contact.organization && (
                    <View style={styles.fieldRow}>
                      <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>
                        Organization
                      </Text>
                      <Text style={[styles.fieldValue, { color: theme.textSecondary }]}>
                        {parsed.contact.organization}
                        {parsed.contact.title ? ` • ${parsed.contact.title}` : ''}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* Raw Payload Block */}
              <View
                style={[
                  styles.detailsBlock,
                  {
                    borderColor: theme.border,
                    backgroundColor: theme.surfaceSecondary,
                  },
                ]}>
                <View style={styles.blockTitleRow}>
                  <Text style={[styles.blockTitle, { color: theme.text }]}>
                    Raw Payload
                  </Text>
                  <AppButton
                    variant="ghost"
                    size="sm"
                    icon={
                      copiedKey === 'raw' ? (
                        <IconCheck size={12} color={theme.success} />
                      ) : (
                        <IconCopy size={12} color={theme.text} />
                      )
                    }
                    label={copiedKey === 'raw' ? 'Copied' : 'Copy'}
                    onPress={() => handleCopyField(item.rawContent, 'raw')}
                  />
                </View>

                <Text
                  selectable
                  style={[
                    styles.rawText,
                    {
                      color: theme.textSecondary,
                      backgroundColor: theme.surfaceSubtle,
                      borderColor: theme.borderSubtle,
                    },
                  ]}>
                  {item.rawContent}
                </Text>
              </View>

              {/* Bottom Actions */}
              <View style={styles.footerActions}>
                {item.type === 'url' && (
                  <AppButton
                    variant="primary"
                    size="lg"
                    icon={<IconExternalLink size={16} color={theme.accentContrast} />}
                    label="Open Link in Browser"
                    fullWidth
                    onPress={() => openURLSafe(item.rawContent)}
                  />
                )}

                {onDelete && (
                  <AppButton
                    variant="danger"
                    size="md"
                    icon={<IconTrash size={15} color={theme.danger} />}
                    label="Delete from History"
                    fullWidth
                    onPress={() => setShowDeleteConfirm(true)}
                  />
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <ConfirmModal
        visible={showDeleteConfirm}
        title="Delete Item"
        message="Are you sure you want to permanently delete this item from your local history?"
        confirmLabel="Delete"
        isDestructive
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    maxHeight: '90%',
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
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  originBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  originText: {
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '700',
    letterSpacing: 0.6,
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
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  timestampBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
  },
  metaLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  metaValue: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  detailsBlock: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  blockTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  blockTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  fieldRow: {
    gap: 4,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },
  fieldValue: {
    fontSize: 13,
    lineHeight: 18,
  },
  fieldValueMono: {
    fontSize: 13,
    fontFamily: 'monospace',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  rawText: {
    fontSize: 11,
    fontFamily: 'monospace',
    lineHeight: 16,
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
  },
  footerActions: {
    gap: 10,
    marginTop: 8,
  },
});
