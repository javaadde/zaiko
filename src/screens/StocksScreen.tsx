import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Smartphone, PackageOpen, Search, Filter } from 'lucide-react-native';
import { useTheme } from '@/hooks/use-theme';
import { getInventoryItems, deleteInventoryItem } from '@/services/inventory';
import { brandCategories, brandPalette } from '@/data/brands';
import StockCard from '@/components/StockCard';
import type { InventoryItem } from '@/types';

type FilterStatus = 'all' | 'in_stock' | 'low' | 'out_of_stock';

type CategoryIconProps = {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onPress: () => void;
  isImage?: boolean;
  bgColor?: string;
};

function CategoryIcon({ label, icon, active, onPress, isImage, bgColor }: CategoryIconProps) {
  const { colors, radii, scheme } = useTheme();
  return (
    <TouchableOpacity style={styles.catWrap} onPress={onPress}>
      <View
        style={[
          styles.catCircle,
          active && { backgroundColor: colors.accent },
          bgColor && !active && { backgroundColor: bgColor },
        ]}
      >
        {isImage ? (
          <Image
            source={icon as any}
            style={{ width: 45, height: 45, borderRadius: radii.full }}
            resizeMode="contain"
          />
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>{icon}</View>
        )}
      </View>
      <Text style={[styles.catLabel, active && { color: colors.accent }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function StocksScreen() {
  const router = useRouter();
  const { colors, scheme } = useTheme();
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const fetchItems = useCallback(async () => {
    try {
      const data = await getInventoryItems({
        brand: selectedBrand !== 'All' ? selectedBrand : undefined,
        search: search.trim() || undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined,
      });
      setItems(data);
    } catch (error) {
      console.warn('Failed to fetch inventory:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedBrand, search, filterStatus]);

  useFocusEffect(
    useCallback(() => {
      fetchItems();
    }, [fetchItems]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchItems();
  }, [fetchItems]);

  const handleDelete = (item: InventoryItem) => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete "${item.model}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteInventoryItem(item.id);
              setItems((prev) => prev.filter((i) => i.id !== item.id));
            } catch (error) {
              Alert.alert('Error', error instanceof Error ? error.message : 'Delete failed');
            }
          },
        },
      ],
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <View style={styles.searchRow}>
            <View style={[styles.searchBox, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
              <Search size={20} color={colors.textSecondary} strokeWidth={2} />
              <TextInput
                placeholder="Search inventory..."
                style={[styles.searchInput, { color: colors.textPrimary }]}
                placeholderTextColor={colors.textMuted}
                value={search}
                onChangeText={setSearch}
              />
            </View>
            <TouchableOpacity
              style={[styles.filterBtn, { backgroundColor: colors.pastelYellow }]}
              activeOpacity={0.8}
              onPress={() => setIsFilterVisible(true)}
            >
              <Filter size={20} color="#18191E" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catScroll}
        >
          <CategoryIcon
            label="All"
            icon={
              <Smartphone
                size={26}
                color={selectedBrand === 'All' ? colors.textPrimary : colors.textMuted}
                strokeWidth={2}
              />
            }
            active={selectedBrand === 'All'}
            bgColor={colors.bgCard}
            onPress={() => setSelectedBrand('All')}
          />
          {brandCategories.map((c) => (
            <CategoryIcon
              key={c.id}
              label={c.label}
              icon={c.logo}
              isImage
              bgColor={colors.bgCard}
              active={selectedBrand === c.label}
              onPress={() => setSelectedBrand(c.label)}
            />
          ))}
        </ScrollView>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textMuted }]}>Loading inventory...</Text>
          </View>
        ) : items.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconBox, { backgroundColor: colors.bgCard }]}>
              <PackageOpen size={56} color={colors.textMuted} strokeWidth={1.5} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No items found</Text>
            <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
              {search || selectedBrand !== 'All'
                ? 'Try adjusting your search or filters'
                : 'Add your first inventory item!'}
            </Text>
          </View>
        ) : (
          <View style={styles.cardGrid}>
            {items.map((item) => (
              <StockCard
                key={item.id}
                item={item as any}
                onPress={() =>
                  router.push({ pathname: '/sell', params: { id: item.id } })
                }
                onDelete={() => handleDelete(item)}
              />
            ))}
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      <Modal
        visible={isFilterVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsFilterVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsFilterVisible(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.bgCard }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Filter & Sort</Text>
              <TouchableOpacity onPress={() => setIsFilterVisible(false)}>
                <Text style={[styles.closeBtnText, { color: colors.pastelGreen }]}>Done</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Status</Text>
            <View style={styles.filterRow}>
              {(['all', 'in_stock', 'low', 'out_of_stock'] as FilterStatus[]).map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.filterOption,
                    { backgroundColor: colors.bgCardAlt },
                    filterStatus === s && { backgroundColor: colors.pastelYellow },
                  ]}
                  onPress={() => setFilterStatus(s)}
                >
                  <Text
                    style={[
                      styles.filterText,
                      { color: colors.textPrimary },
                      filterStatus === s && { color: '#18191E' },
                    ]}
                  >
                    {s.replace('_', ' ').toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Sort By</Text>
            <View style={styles.filterRow}>
              {[
                { label: 'Newest', value: 'createdAt' },
                { label: 'Price', value: 'sellingPrice' },
                { label: 'Stock', value: 'quantity' },
              ].map((s) => (
                <TouchableOpacity
                  key={s.value}
                  style={[
                    styles.filterOption,
                    { backgroundColor: colors.bgCardAlt },
                    sortBy === s.value && { backgroundColor: colors.pastelYellow },
                  ]}
                  onPress={() => setSortBy(s.value)}
                >
                  <Text
                    style={[
                      styles.filterText,
                      { color: colors.textPrimary },
                      sortBy === s.value && { color: '#18191E' },
                    ]}
                  >
                    {s.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  searchBox: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    gap: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  filterBtn: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catScroll: {
    paddingLeft: 20,
    paddingBottom: 25,
    gap: 15,
  },
  catWrap: {
    alignItems: 'center',
    gap: 8,
  },
  catCircle: {
    width: 60,
    height: 60,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  catCircleActive: {
    borderColor: '#000',
  },
  catLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  catLabelActive: {
    color: '#000',
  },
  loadingContainer: {
    paddingVertical: 100,
    alignItems: 'center',
    gap: 15,
  },
  loadingText: {
    fontSize: 15,
    color: '#999',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
    gap: 16,
  },
  emptyIconBox: {
    width: 100,
    height: 100,
    borderRadius: 24,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  emptySub: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 350,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
