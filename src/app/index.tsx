import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '@/context/app-context';
import { useToast } from '@/context/toast-context';
import { QRItem, QRType } from '@/types/qr';
import { BezelCard } from '@/components/ui/bezel-card';
import { TypeBadge } from '@/components/ui/type-badge';
import { QRDetailModal } from '@/components/ui/qr-detail-modal';
import { MaxContentWidth } from '@/constants/theme';
import {
  IconArrowRight,
  IconChevronRight,
  IconFileText,
  IconGlobe,
  IconHistory,
  IconMail,
  IconPlus,
  IconQrCode,
  IconQrScan,
  IconShieldCheck,
  IconSparkles,
  IconUser,
  IconWifi,
} from '@/components/icons';

// Fast type presets on Home
const PRESETS: { type: QRType; label: string; icon: (c: string) => React.ReactNode }[] = [
  { type: 'url', label: 'Website URL', icon: (c) => <IconGlobe size={16} color={c} /> },
  { type: 'wifi', label: 'Wi-Fi Network', icon: (c) => <IconWifi size={16} color={c} /> },
  { type: 'contact', label: 'Contact vCard', icon: (c) => <IconUser size={16} color={c} /> },
  { type: 'email', label: 'Email Message', icon: (c) => <IconMail size={16} color={c} /> },
  { type: 'text', label: 'Plain Text', icon: (c) => <IconFileText size={16} color={c} /> },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { history, theme, triggerHaptic, removeItem } = useApp();
  const { toast } = useToast();
  const [selectedItem, setSelectedItem] = useState<QRItem | null>(null);

  const scannedCount = history.filter((i) => i.origin === 'scanned').length;
  const generatedCount = history.filter((i) => i.origin === 'generated').length;
  const recentItems = history.slice(0, 4);

  const handleLaunchScan = () => {
    triggerHaptic('medium');
    router.push('/scan');
  };

  const handleLaunchGenerate = (preselectedType?: QRType) => {
    triggerHaptic('light');
    if (preselectedType) {
      router.push({ pathname: '/generate', params: { initialType: preselectedType } });
    } else {
      router.push('/generate');
    }
  };

  const handleViewItem = (item: QRItem) => {
    triggerHaptic('light');
    setSelectedItem(item);
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
          {/* Editorial Masthead */}
          <View style={styles.header}>
            <View style={styles.eyebrowRow}>
              <View
                style={[
                  styles.offlineBadge,
                  {
                    backgroundColor: theme.successBg,
                    borderColor: theme.success,
                  },
                ]}>
                <IconShieldCheck size={11} color={theme.success} />
                <Text style={[styles.offlineText, { color: theme.success }]}>
                  100% OFFLINE • ZERO TELEMETRY
                </Text>
              </View>
              <Text style={[styles.dateText, { color: theme.textMuted }]}>
                {new Date().toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </View>

            <View style={styles.titleRow}>
              <Text style={[styles.title, { color: theme.text }]}>QR STUDIO</Text>
              <Text style={[styles.tagline, { color: theme.textSecondary }]}>
                Private, local-first code engine
              </Text>
            </View>
          </View>

          {/* Primary Bento Action Cards */}
          <View style={styles.bentoHero}>
            {/* Scan Action Card */}
            <Pressable
              onPress={handleLaunchScan}
              style={({ pressed }) => [
                styles.actionCardPressable,
                {
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
              ]}>
              <BezelCard
                highlight
                outerPadding={2}
                innerPadding={16}
                innerStyle={[styles.heroCardInner, { backgroundColor: theme.surface }]}>
                <View style={styles.cardTopRow}>
                  <View
                    style={[
                      styles.iconCircle,
                      { backgroundColor: theme.accent, borderColor: theme.accent },
                    ]}>
                    <IconQrScan size={20} color={theme.accentContrast} />
                  </View>
                  <View
                    style={[
                      styles.arrowPill,
                      { backgroundColor: theme.surfaceSecondary },
                    ]}>
                    <IconArrowRight size={13} color={theme.text} />
                  </View>
                </View>

                <View style={styles.cardBody}>
                  <Text style={[styles.cardTitle, { color: theme.text }]}>
                    Scan QR
                  </Text>
                  <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>
                    Instant camera viewfinder detection
                  </Text>
                </View>
              </BezelCard>
            </Pressable>

            {/* Generate Action Card */}
            <Pressable
              onPress={() => handleLaunchGenerate()}
              style={({ pressed }) => [
                styles.actionCardPressable,
                {
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
              ]}>
              <BezelCard
                outerPadding={2}
                innerPadding={16}
                innerStyle={[styles.heroCardInner, { backgroundColor: theme.surface }]}>
                <View style={styles.cardTopRow}>
                  <View
                    style={[
                      styles.iconCircle,
                      {
                        backgroundColor: theme.surfaceSecondary,
                        borderColor: theme.border,
                      },
                    ]}>
                    <IconQrCode size={20} color={theme.text} />
                  </View>
                  <View
                    style={[
                      styles.arrowPill,
                      { backgroundColor: theme.surfaceSecondary },
                    ]}>
                    <IconArrowRight size={13} color={theme.text} />
                  </View>
                </View>

                <View style={styles.cardBody}>
                  <Text style={[styles.cardTitle, { color: theme.text }]}>
                    Create QR
                  </Text>
                  <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>
                    URLs, Wi-Fi keys, contacts & notes
                  </Text>
                </View>
              </BezelCard>
            </Pressable>
          </View>

          {/* Quick Presets Carousel / Grid */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              QUICK GENERATE
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.presetsScroll}>
            {PRESETS.map((p) => (
              <Pressable
                key={p.type}
                onPress={() => handleLaunchGenerate(p.type)}
                style={({ pressed }) => [
                  styles.presetChip,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                    transform: [{ scale: pressed ? 0.96 : 1 }],
                  },
                ]}>
                <View
                  style={[
                    styles.presetIconWrap,
                    { backgroundColor: theme.surfaceSecondary },
                  ]}>
                  {p.icon(theme.text)}
                </View>
                <Text style={[styles.presetLabel, { color: theme.text }]}>
                  {p.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Metrics Bento Row */}
          <View style={styles.metricsGrid}>
            <View
              style={[
                styles.metricCard,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                },
              ]}>
              <Text style={[styles.metricLabel, { color: theme.textMuted }]}>
                SCANNED
              </Text>
              <Text style={[styles.metricValue, { color: theme.text }]}>
                {scannedCount}
              </Text>
              <Text style={[styles.metricFoot, { color: theme.textSecondary }]}>
                codes logged
              </Text>
            </View>

            <View
              style={[
                styles.metricCard,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                },
              ]}>
              <Text style={[styles.metricLabel, { color: theme.textMuted }]}>
                CREATED
              </Text>
              <Text style={[styles.metricValue, { color: theme.text }]}>
                {generatedCount}
              </Text>
              <Text style={[styles.metricFoot, { color: theme.textSecondary }]}>
                payloads saved
              </Text>
            </View>

            <View
              style={[
                styles.metricCard,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                },
              ]}>
              <Text style={[styles.metricLabel, { color: theme.textMuted }]}>
                STORAGE
              </Text>
              <Text style={[styles.metricValueMono, { color: theme.text }]}>
                Local
              </Text>
              <Text style={[styles.metricFoot, { color: theme.success }]}>
                on-device only
              </Text>
            </View>
          </View>

          {/* Recent Activity Section */}
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              RECENT ACTIVITY
            </Text>
            {history.length > 0 && (
              <Pressable
                onPress={() => router.push('/history')}
                hitSlop={8}
                style={styles.viewAllBtn}>
                <Text style={[styles.viewAllText, { color: theme.textSecondary }]}>
                  View all ({history.length})
                </Text>
                <IconChevronRight size={14} color={theme.textSecondary} />
              </Pressable>
            )}
          </View>

          {recentItems.length === 0 ? (
            <View
              style={[
                styles.emptyCard,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                },
              ]}>
              <View
                style={[
                  styles.emptyIconWrap,
                  { backgroundColor: theme.surfaceSecondary },
                ]}>
                <IconQrCode size={28} color={theme.textMuted} />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                No Recent Activity
              </Text>
              <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
                Scan any QR code or create one above. Everything stays strictly on your
                device.
              </Text>
            </View>
          ) : (
            <View style={styles.recentList}>
              {recentItems.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => handleViewItem(item)}
                  style={({ pressed }) => [
                    styles.recentItemPressable,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.border,
                      opacity: pressed ? 0.88 : 1,
                      transform: [{ scale: pressed ? 0.99 : 1 }],
                    },
                  ]}>
                  <View style={styles.recentItemLead}>
                    <TypeBadge type={item.type} size="sm" />
                    <View style={styles.recentTextGroup}>
                      <Text
                        numberOfLines={1}
                        style={[styles.recentTitle, { color: theme.text }]}>
                        {item.title}
                      </Text>
                      <Text
                        numberOfLines={1}
                        style={[styles.recentSub, { color: theme.textSecondary }]}>
                        {item.subtitle || item.rawContent}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.recentItemTrail}>
                    <Text style={[styles.timeAgo, { color: theme.textMuted }]}>
                      {formatTimeAgo(item.createdAt)}
                    </Text>
                    <IconChevronRight size={14} color={theme.textMuted} />
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Detail Modal */}
      <QRDetailModal
        item={selectedItem}
        visible={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        onDelete={(id) => {
          removeItem(id);
          toast.deleted('Item deleted');
        }}
      />
    </View>
  );
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
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
    gap: 20,
  },
  header: {
    gap: 8,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  offlineText: {
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
  },
  titleRow: {
    gap: 2,
    marginTop: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  tagline: {
    fontSize: 14,
  },
  bentoHero: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCardPressable: {
    flex: 1,
  },
  heroCardInner: {
    minHeight: 120,
    justifyContent: 'space-between',
    gap: 12,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowPill: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    gap: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  cardDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  sectionHeader: {
    marginTop: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '500',
  },
  presetsScroll: {
    gap: 10,
    paddingRight: 10,
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  presetIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  metricCard: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    gap: 2,
  },
  metricLabel: {
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  metricValueMono: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
    fontFamily: 'monospace',
  },
  metricFoot: {
    fontSize: 11,
    fontWeight: '500',
  },
  emptyCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    gap: 10,
  },
  emptyIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  emptySub: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
  recentList: {
    gap: 8,
  },
  recentItemPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  recentItemLead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  recentTextGroup: {
    flex: 1,
    gap: 2,
  },
  recentTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  recentSub: {
    fontSize: 11,
  },
  recentItemTrail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 8,
  },
  timeAgo: {
    fontSize: 11,
    fontFamily: 'monospace',
  },
});
