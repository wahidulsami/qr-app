import React, { useEffect, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '@/context/app-context';
import { useToast } from '@/context/toast-context';
import { getStorageStats } from '@/utils/storage';
import { BezelCard } from '@/components/ui/bezel-card';
import { AppButton } from '@/components/ui/app-button';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { MaxContentWidth } from '@/constants/theme';
import {
  IconCheck,
  IconLaptop,
  IconMoon,
  IconRefresh,
  IconShieldCheck,
  IconSun,
  IconTrash,
} from '@/components/icons';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { theme, settings, activeTheme, updateSettings, resetAllData, triggerHaptic } = useApp();
  const { toast } = useToast();

  const [stats, setStats] = useState({
    scannedCount: 0,
    generatedCount: 0,
    totalCount: 0,
    approxBytes: 0,
  });

  const [showWipeConfirm, setShowWipeConfirm] = useState(false);

  useEffect(() => {
    loadStats();
  }, [settings]);

  const loadStats = async () => {
    const s = await getStorageStats();
    setStats(s);
  };

  const handleThemeChange = (mode: 'system' | 'light' | 'dark') => {
    triggerHaptic('light');
    updateSettings({ themeMode: mode });
  };

  const handleToggleHaptics = (val: boolean) => {
    updateSettings({ hapticsEnabled: val });
  };

  const handleToggleAutoCopy = (val: boolean) => {
    triggerHaptic('light');
    updateSettings({ autoCopyOnScan: val });
  };

  const handleToggleAutoOpen = (val: boolean) => {
    triggerHaptic('light');
    updateSettings({ autoOpenUrls: val });
  };

  const handleWipeData = async () => {
    setShowWipeConfirm(false);
    await resetAllData();
    await loadStats();
    toast.info('All local history and data wiped');
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top, 16) + 12,
            paddingBottom: insets.bottom + 92,
          },
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.heading, { color: theme.text }]}>SETTINGS</Text>
            <Text style={[styles.subheading, { color: theme.textSecondary }]}>
              Preferences and on-device storage controls
            </Text>
          </View>

          {/* Theme Appearance Block */}
          <View
            style={[
              styles.sectionCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}>
            <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
              APPEARANCE
            </Text>

            <View style={styles.themeSelectorRow}>
              {(
                [
                  { id: 'system', label: 'System', icon: (c: string) => <IconLaptop size={16} color={c} /> },
                  { id: 'light', label: 'Light', icon: (c: string) => <IconSun size={16} color={c} /> },
                  { id: 'dark', label: 'Dark', icon: (c: string) => <IconMoon size={16} color={c} /> },
                ] as const
              ).map((t) => {
                const isSelected = settings.themeMode === t.id;
                return (
                  <Pressable
                    key={t.id}
                    onPress={() => handleThemeChange(t.id)}
                    style={({ pressed }) => [
                      styles.themeOption,
                      {
                        backgroundColor: isSelected
                          ? theme.accent
                          : theme.surfaceSecondary,
                        borderColor: isSelected ? theme.accent : theme.border,
                        opacity: pressed ? 0.85 : 1,
                      },
                    ]}>
                    {t.icon(
                      isSelected ? theme.accentContrast : theme.textSecondary
                    )}
                    <Text
                      style={[
                        styles.themeOptionText,
                        {
                          color: isSelected
                            ? theme.accentContrast
                            : theme.text,
                        },
                      ]}>
                      {t.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Scanner Preferences */}
          <View
            style={[
              styles.sectionCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}>
            <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
              SCANNER BEHAVIOR
            </Text>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: theme.text }]}>
                  Haptic Feedback
                </Text>
                <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
                  Vibrate lightly when a barcode or button is triggered
                </Text>
              </View>
              <Switch
                value={settings.hapticsEnabled}
                onValueChange={handleToggleHaptics}
                trackColor={{ false: theme.surfaceSecondary, true: theme.accent }}
                thumbColor={theme.accentContrast}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: theme.borderSubtle }]} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: theme.text }]}>
                  Auto-Copy on Scan
                </Text>
                <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
                  Automatically copy detected QR text to device clipboard
                </Text>
              </View>
              <Switch
                value={settings.autoCopyOnScan}
                onValueChange={handleToggleAutoCopy}
                trackColor={{ false: theme.surfaceSecondary, true: theme.accent }}
                thumbColor={theme.accentContrast}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: theme.borderSubtle }]} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: theme.text }]}>
                  Auto-Open URLs
                </Text>
                <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
                  Promptly open valid links in default browser
                </Text>
              </View>
              <Switch
                value={settings.autoOpenUrls}
                onValueChange={handleToggleAutoOpen}
                trackColor={{ false: theme.surfaceSecondary, true: theme.accent }}
                thumbColor={theme.accentContrast}
              />
            </View>
          </View>

          {/* Data & Storage Management */}
          <View
            style={[
              styles.sectionCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}>
            <View style={styles.cardHeaderRow}>
              <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
                ON-DEVICE STORAGE
              </Text>
              <Pressable onPress={loadStats} hitSlop={8}>
                <IconRefresh size={14} color={theme.textMuted} />
              </Pressable>
            </View>

            <View style={styles.statsSummary}>
              <View style={styles.statLine}>
                <Text style={[styles.statKey, { color: theme.textMuted }]}>
                  Scanned entries
                </Text>
                <Text style={[styles.statVal, { color: theme.text }]}>
                  {stats.scannedCount}
                </Text>
              </View>
              <View style={styles.statLine}>
                <Text style={[styles.statKey, { color: theme.textMuted }]}>
                  Generated entries
                </Text>
                <Text style={[styles.statVal, { color: theme.text }]}>
                  {stats.generatedCount}
                </Text>
              </View>
              <View style={styles.statLine}>
                <Text style={[styles.statKey, { color: theme.textMuted }]}>
                  Total local items
                </Text>
                <Text style={[styles.statVal, { color: theme.text }]}>
                  {stats.totalCount}
                </Text>
              </View>
              <View style={styles.statLine}>
                <Text style={[styles.statKey, { color: theme.textMuted }]}>
                  Estimated payload footprint
                </Text>
                <Text style={[styles.statValMono, { color: theme.textSecondary }]}>
                  {stats.approxBytes > 1024
                    ? `${(stats.approxBytes / 1024).toFixed(1)} KB`
                    : `${stats.approxBytes} B`}
                </Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.borderSubtle }]} />

            <AppButton
              variant="danger"
              size="md"
              icon={<IconTrash size={15} color={theme.danger} />}
              label="Erase All Local Data"
              fullWidth
              onPress={() => setShowWipeConfirm(true)}
            />
          </View>

          {/* Privacy & Architecture Guarantee Card */}
          <BezelCard
            outerPadding={2}
            innerPadding={16}
            innerStyle={[styles.privacyInner, { backgroundColor: theme.surface }]}>
            <View style={styles.privacyHeader}>
              <IconShieldCheck size={20} color={theme.success} />
              <Text style={[styles.privacyTitle, { color: theme.text }]}>
                100% Offline Architecture
              </Text>
            </View>

            <Text style={[styles.privacyBody, { color: theme.textSecondary }]}>
              This app has zero remote backend, zero analytics trackers, and zero cloud
              dependencies. All QR code generation, camera scanning, and history
              records reside strictly inside your device&apos;s local AsyncStorage.
            </Text>

            <View
              style={[
                styles.specsBox,
                {
                  backgroundColor: theme.surfaceSecondary,
                  borderColor: theme.borderSubtle,
                },
              ]}>
              <View style={styles.specRow}>
                <Text style={[styles.specKey, { color: theme.textMuted }]}>
                  Engine
                </Text>
                <Text style={[styles.specVal, { color: theme.text }]}>
                  react-native-qrcode-svg
                </Text>
              </View>
              <View style={styles.specRow}>
                <Text style={[styles.specKey, { color: theme.textMuted }]}>
                  Scanner
                </Text>
                <Text style={[styles.specVal, { color: theme.text }]}>
                  expo-camera (native)
                </Text>
              </View>
              <View style={styles.specRow}>
                <Text style={[styles.specKey, { color: theme.textMuted }]}>
                  Storage
                </Text>
                <Text style={[styles.specVal, { color: theme.text }]}>
                  AsyncStorage (Encrypted Sandbox)
                </Text>
              </View>
            </View>
          </BezelCard>
        </View>
      </ScrollView>

      {/* Wipe Confirmation */}
      <ConfirmModal
        visible={showWipeConfirm}
        title="Erase All Local Data"
        message="This will permanently delete all scan records, generated QR entries, and reset preferences to default. This action cannot be reversed."
        confirmLabel="Erase Everything"
        isDestructive
        onConfirm={handleWipeData}
        onCancel={() => setShowWipeConfirm(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  container: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: 18,
  },
  header: {
    gap: 2,
  },
  heading: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  subheading: {
    fontSize: 13,
  },
  sectionCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  themeSelectorRow: {
    flexDirection: 'row',
    gap: 8,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  themeOptionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  settingInfo: {
    flex: 1,
    gap: 2,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  settingSub: {
    fontSize: 12,
    lineHeight: 16,
  },
  divider: {
    height: 1,
    width: '100%',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statsSummary: {
    gap: 8,
  },
  statLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statKey: {
    fontSize: 13,
  },
  statVal: {
    fontSize: 14,
    fontWeight: '700',
  },
  statValMono: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  privacyInner: {
    gap: 12,
  },
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  privacyTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  privacyBody: {
    fontSize: 12,
    lineHeight: 18,
  },
  specsBox: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
    gap: 6,
  },
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  specKey: {
    fontSize: 11,
    fontFamily: 'monospace',
  },
  specVal: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
});
