import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Image,
  RefreshControl,
  ScrollView,
} from 'react-native';
import {
  Search,
  Calendar,
  User,
  Smartphone,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  CreditCard,
} from 'lucide-react-native';
import { useTheme } from '@/hooks/use-theme';
import { getSales } from '@/services/sales';
import type { Sale } from '@/types';

export default function SalesHistoryScreen() {
  const { colors, shadows, scheme } = useTheme();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  const fetchSales = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      try {
        const data = await getSales();
        let filtered = data;
        if (search) {
          const q = search.toLowerCase();
          filtered = data.filter(
            (s) =>
              s.customerName.toLowerCase().includes(q) ||
              s.itemId.toLowerCase().includes(q) ||
              s.imei.toLowerCase().includes(q),
          );
        }
        filtered.sort((a, b) => {
          let valA, valB;
          if (sortBy === 'date') {
            valA = a.saleDate;
            valB = b.saleDate;
          } else if (sortBy === 'price') {
            valA = a.salePrice;
            valB = b.salePrice;
          } else if (sortBy === 'customer') {
            valA = a.customerName.toLowerCase();
            valB = b.customerName.toLowerCase();
          } else if (sortBy === 'brand') {
            valA = a.itemId.toLowerCase();
            valB = b.itemId.toLowerCase();
          } else {
            valA = (a as any)[sortBy];
            valB = (b as any)[sortBy];
          }
          if (valA < valB) return sortOrder === 'desc' ? 1 : -1;
          if (valA > valB) return sortOrder === 'desc' ? -1 : 1;
          return 0;
        });
        setSales(filtered);
      } catch (error) {
        console.error('Failed to fetch sales:', error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [search, sortBy, sortOrder],
  );

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const formatDate = (dateString: number) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' } as const;
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const SortButton = ({ label, value }: { label: string; value: string }) => {
    const isActive = sortBy === value;
    return (
      <TouchableOpacity
        style={[
          styles.sortBtn,
          { backgroundColor: colors.bgCard },
          isActive && { backgroundColor: colors.pastelYellow },
        ]}
        onPress={() => {
          if (isActive) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
          } else {
            setSortBy(value);
            setSortOrder('desc');
          }
        }}
      >
        <Text style={[styles.sortBtnText, { color: colors.textPrimary }, isActive && { color: '#18191E' }]}>
          {label}
        </Text>
        {isActive &&
          (sortOrder === 'asc' ? (
            <ArrowUpRight size={14} color="#18191E" />
          ) : (
            <ArrowDownRight size={14} color="#18191E" />
          ))}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} />

      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Sales History</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.filterSection}>
        <View style={[styles.searchContainer, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <Search size={20} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search customer, model, or IMEI..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <View style={styles.sortContainer}>
          <Filter size={16} color={colors.textSecondary} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sortScroll}
          >
            <SortButton label="Date" value="date" />
            <SortButton label="Price" value="price" />
            <SortButton label="Customer" value="customer" />
            <SortButton label="Brand" value="brand" />
          </ScrollView>
        </View>
      </View>

      {loading && !refreshing ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>Fetching sales history...</Text>
        </View>
      ) : (
        <FlatList
          data={sales}
          renderItem={renderSaleItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchSales(true)}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <TrendingUp size={48} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No sales recorded yet</Text>
            </View>
          }
        />
      )}
    </View>
  );

  function renderSaleItem({ item }: { item: Sale }) {
    return (
      <View style={[styles.saleCard, { backgroundColor: colors.bgCard, borderColor: colors.border }, shadows.card]}>
        <View style={styles.cardHeader}>
          <View style={[styles.brandBadge, { backgroundColor: colors.bgCardAlt }]}>
            <Text style={[styles.brandText, { color: colors.textSecondary }]}>
              {item.itemId || 'Deleted Item'}
            </Text>
          </View>
          <Text style={[styles.saleDate, { color: colors.textMuted }]}>{formatDate(item.saleDate)}</Text>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.cardDetails}>
            <View style={styles.productInfo}>
              <Smartphone size={16} color={colors.textSecondary} />
              <Text style={[styles.modelName, { color: colors.textPrimary }]}>
                {item.itemId || 'Unknown Model'}
              </Text>
            </View>

            <View style={styles.customerInfo}>
              <User size={16} color={colors.textSecondary} />
              <Text style={[styles.customerName, { color: colors.textPrimary }]}>{item.customerName}</Text>
            </View>

            <View style={styles.imeiBox}>
              <Text style={[styles.imeiLabel, { color: colors.textSecondary }]}>IMEI:</Text>
              <Text style={[styles.imeiValue, { color: colors.textPrimary }]}>{item.imei}</Text>
            </View>
          </View>

          {item.customerPhotoUrl && (
            <Image
              source={{ uri: item.customerPhotoUrl }}
              style={styles.customerAvatar}
            />
          )}
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.priceBox}>
            <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>Sold for</Text>
            <Text style={[styles.priceValue, { color: colors.pastelGreen }]}>
              ₹{item.salePrice.toLocaleString()}
            </Text>
          </View>
          <View
            style={[
              styles.typeBadge,
              {
                backgroundColor:
                  item.saleType === 'wholesale' ? colors.pastelYellow : 'rgba(94, 234, 154, 0.2)',
              },
            ]}
          >
            <Text
              style={[
                styles.typeText,
                { color: '#18191E' },
              ]}
            >
              {item.saleType.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'PlayfairDisplay_600SemiBold_Italic',
    fontSize: 24,
    fontWeight: '600',
  },
  filterSection: { paddingHorizontal: 20, gap: 12, marginBottom: 16 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 52,
    gap: 12,
  },
  searchIcon: {},
  searchInput: { flex: 1, fontSize: 15, fontWeight: '500' },
  sortContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sortScroll: { gap: 10 },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  sortBtnText: { fontSize: 13, fontWeight: '700' },
  centerBox: { paddingVertical: 100, alignItems: 'center', gap: 12 },
  loadingText: { fontWeight: '600' },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  saleCard: { borderRadius: 28, padding: 18, marginBottom: 16, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  brandBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  brandText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  saleDate: { fontSize: 12, fontWeight: '600' },
  cardBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardDetails: { flex: 1, gap: 8 },
  productInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  modelName: { fontSize: 15, fontWeight: '700' },
  customerInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  customerName: { fontSize: 14, fontWeight: '600' },
  imeiBox: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  imeiLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  imeiValue: { fontSize: 13, fontWeight: '600' },
  customerAvatar: { width: 48, height: 48, borderRadius: 24, marginLeft: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceBox: {},
  priceLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  priceValue: { fontSize: 18, fontWeight: '800' },
  typeBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  typeText: { fontSize: 11, fontWeight: '800' },
  emptyBox: { alignItems: 'center', paddingVertical: 80, gap: 12 },
  emptyText: { fontSize: 16, fontWeight: '700' },
});
