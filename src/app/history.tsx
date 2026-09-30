import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { useApp } from '@/context/app-context';
import { useToast } from '@/context/toast-context';
import { QRItem } from '@/types/qr';
import { TypeBadge } from '@/components/ui/type-badge';
import { QRDetailModal } from '@/components/ui/qr-detail-modal';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { AppButton } from '@/components/ui/app-button';
import { MaxContentWidth } from '@/constants/theme';
import {
  IconChevronRight,
  IconClose,
  IconQrCode,
  IconQrScan,
  IconSearch,
  IconTrash,
} from '@/components/icons';

type FilterTab = 'all' | 'scanned' | 'generated';

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const { history, theme, triggerHaptic, removeItem, clearItems } = useApp();
  const { toast } = useToast();

  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<QRItem | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);

  // Filtered and searched list
  const filteredList = useMemo(() => {
    return history.filter((item) => {
      // Origin filter
      if (activeFilter !== 'all' && item.origin !== activeFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = item.title?.toLowerCase().includes(q);
        const matchesSub = item.subtitle?.toLowerCase().includes(q);
        const matchesContent = item.rawContent?.toLowerCase().includes(q);
        const matchesType = item.type?.toLowerCase().includes(q);
        return matchesTitle || matchesSub || matchesContent || matchesType;
      }
      return true;
    });
  }, [history, activeFilter, searchQuery]);

  const scannedTotal = history.filter((i) => i.origin === 'scanned').length;
  const generatedTotal = history.filter((i) => i.origin === 'generated').length;

  const handleClearHistory = () => {
    setShowClearConfirm(false);
    if (activeFilter === 'all') {
      clearItems();
      toast.deleted('History cleared');
    } else {
      clearItems(activeFilter);
      toast.deleted(
        `${activeFilter === 'scanned' ? 'Scanned' : 'Generated'} items cleared`
      );
    }
  };

  const renderItem = ({ item }: { item: QRItem }) => {
    return (
      <Pressable
        onPress={() => {
          triggerHaptic('light');
          setSelectedItem(item);
        }}
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
            opacity: pressed ? 0.88 : 1,
            transform: [{ scale: pressed ? 0.99 : 1 }],
          },
        ]}>
        <View style={styles.cardHeader}>
          <TypeBadge type={item.type} size="sm" />
          <View
            style={[
              styles.originChip,
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

        <View style={styles.cardContent}>
          <Text
            numberOfLines={1}
            style={[styles.itemTitle, { color: theme.text }]}>
            {item.title}
          </Text>
          <Text
            numberOfLines={2}
            style={[styles.itemSnippet, { color: theme.textSecondary }]}>
            {item.subtitle || item.rawContent}
          </Text>
        </View>

        <View style={[styles.cardFooter, { borderTopColor: theme.borderSubtle }]}>
          <Text style={[styles.dateText, { color: theme.textMuted }]}>
            {formatDate(item.createdAt)}
          </Text>
          <View style={styles.viewRow}>
            <Text style={[styles.viewLabel, { color: theme.textSecondary }]}>
              View Details
            </Text>
            <IconChevronRight size={13} color={theme.textMuted} />
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <View
        style={[
          styles.container,
          {
            paddingTop: Math.max(insets.top, 16) + 12,
          },
        ]}>
        {/* Top Header */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <View>
              <Text style={[styles.heading, { color: theme.text }]}>
                HISTORY
              </Text>
              <Text style={[styles.subheading, { color: theme.textSecondary }]}>
                {history.length} persistent local entries
              </Text>
            </View>

            {history.length > 0 && (
              <AppButton
                variant="ghost"
                size="sm"
                icon={<IconTrash size={14} color={theme.danger} />}
                label={activeFilter === 'all' ? 'Clear All' : `Clear ${activeFilter}`}
                onPress={() => setShowClearConfirm(true)}
              />
            )}
          </View>

          {/* Search Bar */}
          <View
            style={[
              styles.searchBar,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}>
            <IconSearch size={16} color={theme.textMuted} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by title, payload or type..."
              placeholderTextColor={theme.textMuted}
              style={[styles.searchInput, { color: theme.text }]}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <Pressable
                onPress={() => setSearchQuery('')}
                hitSlop={8}
                style={styles.clearSearchBtn}>
                <IconClose size={14} color={theme.textMuted} />
              </Pressable>
            )}
          </View>

          {/* Tabs Filter */}
          <View style={styles.filterRow}>
            {(
              [
                { id: 'all', label: `All (${history.length})` },
                { id: 'scanned', label: `Scanned (${scannedTotal})` },
                { id: 'generated', label: `Created (${generatedTotal})` },
              ] as const
            ).map((tab) => {
              const active = activeFilter === tab.id;
              return (
                <Pressable
                  key={tab.id}
                  onPress={() => {
                    triggerHaptic('light');
                    setActiveFilter(tab.id);
                  }}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: active
                        ? theme.accent
                        : theme.surface,
                      borderColor: active ? theme.accent : theme.border,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.filterText,
                      {
                        color: active ? theme.accentContrast : theme.text,
                      },
                    ]}>
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* List Content */}
        <FlatList
          data={filteredList}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 92 },
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View
              style={[
                styles.emptyBox,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                },
              ]}>
              <View
                style={[
                  styles.emptyIconCircle,
                  { backgroundColor: theme.surfaceSecondary },
                ]}>
                <IconQrCode size={30} color={theme.textMuted} />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                {searchQuery ? 'No Matching Entries' : 'History is Empty'}
              </Text>
              <Text style={[styles.emptyDesc, { color: theme.textSecondary }]}>
                {searchQuery
                  ? `No items match "${searchQuery}". Try a different keyword.`
                  : activeFilter === 'scanned'
                  ? 'No scanned QR codes yet. Use the camera scanner to log codes.'
                  : activeFilter === 'generated'
                  ? 'No generated QR codes yet. Create a QR code to save it here.'
                  : 'All scanned and generated QR codes will be stored locally on your device.'}
              </Text>

              {!searchQuery && (
                <View style={styles.emptyActions}>
                  <AppButton
                    variant="primary"
                    size="sm"
                    icon={<IconQrScan size={14} color={theme.accentContrast} />}
                    label="Scan Code"
                    onPress={() => router.push('/scan')}
                  />
                  <AppButton
                    variant="secondary"
                    size="sm"
                    label="Create Code"
                    onPress={() => router.push('/generate')}
                  />
                </View>
              )}
            </View>
          }
        />
      </View>

      {/* Item Detail Modal */}
      <QRDetailModal
        item={selectedItem}
        visible={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        onDelete={(id) => {
          removeItem(id);
          toast.deleted('Item deleted');
        }}
      />

      {/* Clear Confirmation Modal */}
      <ConfirmModal
        visible={showClearConfirm}
        title={`Clear ${activeFilter === 'all' ? 'All History' : `${activeFilter} Items`}`}
        message={`Are you sure you want to permanently delete all ${
          activeFilter === 'all' ? 'entries' : `${activeFilter} items`
        }? This cannot be undone.`}
        confirmLabel="Clear"
        isDestructive
        onConfirm={handleClearHistory}
        onCancel={() => setShowClearConfirm(false)}
      />
    </View>
  );
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
  },
  container: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: 20,
    gap: 14,
  },
  header: {
    gap: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  heading: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  subheading: {
    fontSize: 12,
    marginTop: 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
  },
  clearSearchBtn: {
    padding: 4,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  listContent: {
    gap: 10,
    paddingTop: 4,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  originChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  originText: {
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardContent: {
    gap: 4,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  itemSnippet: {
    fontSize: 12,
    lineHeight: 17,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: 8,
    marginTop: 2,
  },
  dateText: {
    fontSize: 11,
    fontFamily: 'monospace',
  },
  viewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  viewLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  emptyBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 28,
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  emptyDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 320,
  },
  emptyActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
});
