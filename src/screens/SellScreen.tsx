import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Modal,
} from 'react-native';
import {
  MoreVertical,
  Edit2,
  ChevronLeft,
  X,
  Archive,
  Trash2,
  PackagePlus,
} from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';
import { getInventoryItem, restockItem, archiveInventoryItem, deleteInventoryItem } from '@/services/inventory';
import type { InventoryItem } from '@/types';

function formatINR(value: number) {
  return `₹${value.toLocaleString('en-IN')}`;
}

function formatDate(ts?: number | null) {
  if (!ts) return null;
  return new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function SellScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, scheme } = useTheme();
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);

  const [salePrice, setSalePrice] = useState('');
  const [saleType, setSaleType] = useState<'retail' | 'wholesale'>('retail');
  const [restockQty, setRestockQty] = useState('');
  const [restocking, setRestocking] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmQty, setDeleteConfirmQty] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const loadItem = useCallback(async (itemId: string) => {
    try {
      const data = await getInventoryItem(itemId);
      setItem(data);
      setSalePrice(String(data.sellingPrice));
    } catch {
      Alert.alert('Error', 'Failed to load item details');
      router.back();
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (id) {
      const timer = setTimeout(() => {
        void loadItem(id);
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [id, loadItem]);

  const handleSell = () => {
    if (!salePrice || isNaN(Number(salePrice))) {
      Alert.alert('Invalid Price', 'Please enter a valid numeric sale price.');
      return;
    }
    const price = Number(salePrice);
    const cost = item?.purchasePrice ?? 0;
    if (saleType === 'wholesale') {
      const minPrice = item?.minWholesalePrice || cost + 500;
      if (price < minPrice) {
        Alert.alert('Price Too Low', `Wholesale price must be at least ₹${minPrice}`);
        return;
      }
    } else {
      const minPrice = item?.minRetailPrice || cost + 1000;
      if (price < minPrice) {
        Alert.alert('Price Too Low', `Retail price must be at least ₹${minPrice}`);
        return;
      }
    }
    router.push({
      pathname: '/sell-verify/[id]',
      params: { id, price, type: saleType },
    });
  };

  const handleRestock = async () => {
    if (!restockQty || isNaN(Number(restockQty)) || Number(restockQty) <= 0) {
      Alert.alert('Invalid Quantity', 'Please enter a valid quantity to add.');
      return;
    }
    setRestocking(true);
    try {
      const updated = await restockItem(id, Number(restockQty));
      setItem(updated);
      setRestockQty('');
      setShowRestockModal(false);
      Alert.alert('Success', 'Inventory updated successfully!');
    } catch (error) {
      Alert.alert('Restock Failed', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setRestocking(false);
    }
  };

  const handleArchive = async () => {
    try {
      await archiveInventoryItem(id);
      Alert.alert('Success', 'Item archived successfully');
      router.replace('/(tabs)/stocks');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setShowMenu(false);
    }
  };

  const handleDelete = async () => {
    if (!item) return;
    if (Number(deleteConfirmQty) !== item.quantity) {
      Alert.alert(
        'Verification Failed',
        `Please enter the exact current quantity (${item.quantity}) to confirm deletion.`,
      );
      return;
    }
    setIsDeleting(true);
    try {
      await deleteInventoryItem(item.id);
      setShowDeleteModal(false);
      Alert.alert('Success', 'Item deleted permanently');
      router.replace('/(tabs)/stocks');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bgCard }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!item) return null;

  const minAllowed =
    saleType === 'wholesale'
      ? item.minWholesalePrice || item.purchasePrice + 500
      : item.minRetailPrice || item.purchasePrice + 1000;
  const margin = item.sellingPrice - item.purchasePrice;
  const stockDotColor =
    item.quantity <= 0 ? colors.danger : item.status === 'low' ? colors.pastelYellow : colors.pastelGreen;
  const stockLabel =
    item.quantity <= 0 ? 'Out of stock' : item.status === 'low' ? 'Low stock' : 'In stock';

  const detailRows: { label: string; value: string }[] = [
    { label: 'Purchase price', value: formatINR(item.purchasePrice) },
    { label: 'Min retail', value: formatINR(item.minRetailPrice || item.purchasePrice + 1000) },
    { label: 'Min wholesale', value: formatINR(item.minWholesalePrice || item.purchasePrice + 500) },
    { label: 'Margin per unit', value: formatINR(margin) },
    ...(item.supplier ? [{ label: 'Supplier', value: item.supplier }] : []),
    ...(item.imei ? [{ label: 'IMEI', value: item.imei }] : []),
    ...(item.color ? [{ label: 'Color', value: item.color }] : []),
    ...(formatDate(item.purchaseDate)
      ? [{ label: 'Purchased on', value: formatDate(item.purchaseDate) as string }]
      : []),
    { label: 'Added on', value: formatDate(item.createdAt) ?? '—' },
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.bgCard }]}
    >
      <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Minimal nav — reference: plain chevron, small centered title, trailing icon */}
        <View style={styles.navRow}>
          <TouchableOpacity style={styles.navBtn} onPress={() => router.back()} activeOpacity={0.6} hitSlop={12}>
            <ChevronLeft size={24} color={colors.textPrimary} strokeWidth={2.2} />
          </TouchableOpacity>
          <Text style={[styles.navTitle, { color: colors.textPrimary }]}>Product Details</Text>
          <TouchableOpacity style={styles.navBtn} onPress={() => setShowMenu(true)} activeOpacity={0.6} hitSlop={12}>
            <MoreVertical size={21} color={colors.textPrimary} strokeWidth={2.2} />
          </TouchableOpacity>
        </View>

        {/* Hero — product on a soft light card, vertical brand type down the right edge */}
        <View style={[styles.hero, { backgroundColor: colors.bgCardAlt }]}>
          <View style={styles.heroImageZone}>
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.heroImage} resizeMode="contain" />
            ) : (
              <Text style={styles.heroEmoji}>📱</Text>
            )}
          </View>
          <View style={styles.heroVerticalWrap} pointerEvents="none">
            <Text numberOfLines={1} style={[styles.heroVerticalText, { color: colors.textPrimary }]}>
              {(item.brand || 'ZAiko').toUpperCase()}
            </Text>
          </View>
          <View style={[styles.stockPill, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <View style={[styles.stockDot, { backgroundColor: stockDotColor }]} />
            <Text style={[styles.stockPillText, { color: colors.textPrimary }]}>{item.quantity} left</Text>
          </View>
        </View>

        {/* Title block — eyebrow, name, price */}
        <View style={styles.titleBlock}>
          <Text style={[styles.eyebrow, { color: colors.textMuted }]}>{item.brand}</Text>
          <Text style={[styles.modelName, { color: colors.textPrimary }]}>{item.model}</Text>
          <Text style={[styles.price, { color: colors.textPrimary }]}>{formatINR(item.sellingPrice)}</Text>

          {/* Bordered pill chips */}
          <View style={styles.chipRow}>
            <View style={[styles.chip, { borderColor: colors.borderActive }]}>
              <View style={[styles.stockDot, { backgroundColor: stockDotColor }]} />
              <Text style={[styles.chipText, { color: colors.textPrimary }]}>{stockLabel}</Text>
            </View>
            <View style={[styles.chip, { borderColor: colors.borderActive }]}>
              <Text style={[styles.chipText, { color: colors.textPrimary }]}>{item.quantity} units</Text>
            </View>
            <View style={[styles.chip, { borderColor: colors.borderActive }]}>
              <Text style={[styles.chipText, { color: margin >= 0 ? colors.textPrimary : colors.danger }]}>
                {margin >= 0 ? '+' : ''}{formatINR(margin)} margin
              </Text>
            </View>
          </View>
        </View>

        {/* Spec list — hairline rows directly on the canvas, like the reference checkout list */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>The Details</Text>
          <View style={styles.rowsWrap}>
            {detailRows.map((row, index) => (
              <View key={row.label}>
                <View style={styles.specRow}>
                  <Text style={[styles.specLabel, { color: colors.textSecondary }]}>{row.label}</Text>
                  <Text style={[styles.specValue, { color: colors.textPrimary }]} numberOfLines={1}>
                    {row.value}
                  </Text>
                </View>
                {index < detailRows.length - 1 && (
                  <View style={[styles.hairline, { backgroundColor: colors.border }]} />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Sell section — segmented pill control + pill price field + black pill CTA */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Sell this Item</Text>

          <View style={[styles.segmentTrack, { backgroundColor: colors.bgCardAlt }]}>
            {(['retail', 'wholesale'] as const).map((type) => {
              const active = saleType === type;
              return (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.segmentBtn,
                    active && { backgroundColor: colors.primary },
                  ]}
                  onPress={() => setSaleType(type)}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      { color: colors.textSecondary },
                      active && { color: colors.textInverse },
                    ]}
                  >
                    {type === 'retail' ? 'Retail' : 'Wholesale'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={[styles.pricePill, { backgroundColor: colors.bgCardAlt }]}>
            <Text style={[styles.currency, { color: colors.textSecondary }]}>₹</Text>
            <TextInput
              style={[styles.priceInput, { color: colors.textPrimary }]}
              placeholder="0"
              keyboardType="numeric"
              value={salePrice}
              onChangeText={setSalePrice}
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <Text style={[styles.hint, { color: colors.textMuted }]}>
            Min allowed {formatINR(minAllowed)}  •  {item.quantity} units in stock
          </Text>

          <TouchableOpacity
            style={[styles.cta, { backgroundColor: colors.primary }]}
            onPress={handleSell}
            activeOpacity={0.9}
          >
            <Text style={[styles.ctaText, { color: colors.textInverse }]}>Continue to Verify</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={showMenu} transparent animationType="fade" onRequestClose={() => setShowMenu(false)}>
        <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={() => setShowMenu(false)}>
          <View style={[styles.menuContent, { backgroundColor: colors.bgCard }]}>
            <View style={[styles.menuHandle, { backgroundColor: colors.border }]} />
            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => {
                setShowMenu(false);
                router.push({ pathname: '/(tabs)/add', params: { id } });
              }}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: colors.bgCardAlt }]}>
                <Edit2 size={18} color={colors.textPrimary} />
              </View>
              <Text style={[styles.menuItemText, { color: colors.textPrimary }]}>Edit product</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => {
                setShowMenu(false);
                setShowRestockModal(true);
              }}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: colors.bgCardAlt }]}>
                <PackagePlus size={18} color={colors.textPrimary} />
              </View>
              <Text style={[styles.menuItemText, { color: colors.textPrimary }]}>Restock</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} activeOpacity={0.7} onPress={handleArchive}>
              <View style={[styles.menuIconWrap, { backgroundColor: colors.bgCardAlt }]}>
                <Archive size={18} color={colors.textPrimary} />
              </View>
              <Text style={[styles.menuItemText, { color: colors.textPrimary }]}>Archive</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => {
                setShowMenu(false);
                setShowDeleteModal(true);
              }}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: colors.dangerLight }]}>
                <Trash2 size={18} color={colors.danger} />
              </View>
              <Text style={[styles.menuItemText, { color: colors.danger }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={showRestockModal} transparent animationType="slide" onRequestClose={() => setShowRestockModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowRestockModal(false)}>
          <View style={[styles.dialog, { backgroundColor: colors.bgCard }]}>
            <View style={styles.dialogHeader}>
              <Text style={[styles.dialogTitle, { color: colors.textPrimary }]}>Restock Item</Text>
              <TouchableOpacity
                style={[styles.dialogClose, { backgroundColor: colors.bgCardAlt }]}
                onPress={() => setShowRestockModal(false)}
              >
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.dialogSub, { color: colors.textSecondary }]}>Enter quantity to add:</Text>
            <TextInput
              style={[styles.dialogInput, { color: colors.textPrimary, backgroundColor: colors.bgCardAlt }]}
              placeholder="0"
              keyboardType="numeric"
              value={restockQty}
              onChangeText={setRestockQty}
              placeholderTextColor={colors.textMuted}
            />
            <TouchableOpacity
              style={[styles.dialogBtn, { backgroundColor: colors.primary }]}
              onPress={handleRestock}
              disabled={restocking}
              activeOpacity={0.9}
            >
              {restocking ? (
                <ActivityIndicator color={colors.textInverse} />
              ) : (
                <Text style={[styles.dialogBtnText, { color: colors.textInverse }]}>Restock</Text>
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={showDeleteModal} transparent animationType="slide" onRequestClose={() => setShowDeleteModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowDeleteModal(false)}>
          <View style={[styles.dialog, { backgroundColor: colors.bgCard }]}>
            <View style={styles.dialogHeader}>
              <Text style={[styles.dialogTitle, { color: colors.danger }]}>Confirm Deletion</Text>
              <TouchableOpacity
                style={[styles.dialogClose, { backgroundColor: colors.bgCardAlt }]}
                onPress={() => setShowDeleteModal(false)}
              >
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.dialogSub, { color: colors.textSecondary }]}>
              To delete <Text style={{ fontWeight: '800', color: colors.textPrimary }}>{item.brand} {item.model}</Text> permanently, please type the current stock quantity:
            </Text>
            <View style={[styles.confirmTarget, { backgroundColor: colors.bgCardAlt }]}>
              <Text style={[styles.confirmTargetText, { color: colors.textPrimary }]}>{item.quantity}</Text>
            </View>
            <TextInput
              style={[styles.dialogInput, { color: colors.textPrimary, backgroundColor: colors.bgCardAlt }]}
              placeholder="Type quantity here"
              keyboardType="numeric"
              value={deleteConfirmQty}
              onChangeText={setDeleteConfirmQty}
              placeholderTextColor={colors.textMuted}
            />
            <TouchableOpacity
              style={[styles.dialogBtn, { backgroundColor: colors.danger }]}
              onPress={handleDelete}
              disabled={isDeleting}
              activeOpacity={0.9}
            >
              {isDeleting ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.dialogBtnText}>Delete Permanently</Text>
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingTop: 56, paddingBottom: 44 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // Minimal nav — reference style
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 18,
  },
  navBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22 },
  navTitle: { fontSize: 16, fontWeight: '800', letterSpacing: -0.2 },

  // Hero — product on soft light card with vertical brand type
  hero: {
    marginHorizontal: 16,
    height: 340,
    borderRadius: 32,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroImageZone: { flex: 1, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center', paddingLeft: 24, paddingRight: 64, paddingVertical: 28 },
  heroImage: { width: '100%', height: '100%' },
  heroEmoji: { fontSize: 72 },
  heroVerticalWrap: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroVerticalText: {
    width: 300,
    textAlign: 'center',
    transform: [{ rotate: '90deg' }],
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 4,
  },
  stockPill: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 9999,
    borderWidth: 1,
  },
  stockDot: { width: 8, height: 8, borderRadius: 4 },
  stockPillText: { fontSize: 12, fontWeight: '800' },

  // Title block
  titleBlock: { paddingHorizontal: 24, marginTop: 24, gap: 6 },
  eyebrow: { fontSize: 12, fontWeight: '800', letterSpacing: 1.6, textTransform: 'uppercase' },
  modelName: { fontSize: 27, fontWeight: '800', letterSpacing: -0.5, lineHeight: 33 },
  price: { fontSize: 21, fontWeight: '800', marginTop: 2 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 9999,
    borderWidth: 1,
  },
  chipText: { fontSize: 12, fontWeight: '700' },

  // Sections
  section: { paddingHorizontal: 24, marginTop: 34 },
  sectionTitle: {
    fontFamily: 'PlayfairDisplay_600SemiBold_Italic',
    fontSize: 21,
    fontWeight: '600',
    marginBottom: 16,
  },

  // Spec rows with hairlines
  rowsWrap: {},
  specRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 20, paddingVertical: 13 },
  specLabel: { fontSize: 14, fontWeight: '500' },
  specValue: { fontSize: 14, fontWeight: '800', flexShrink: 1 },
  hairline: { height: StyleSheet.hairlineWidth },

  // Segmented pill control
  segmentTrack: {
    flexDirection: 'row',
    borderRadius: 9999,
    padding: 5,
    marginBottom: 14,
  },
  segmentBtn: { flex: 1, borderRadius: 9999, paddingVertical: 13, alignItems: 'center', justifyContent: 'center' },
  segmentText: { fontSize: 14, fontWeight: '800' },

  // Pill price field
  pricePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 9999,
    paddingHorizontal: 24,
    minHeight: 62,
  },
  currency: { fontSize: 20, fontWeight: '800' },
  priceInput: { flex: 1, paddingVertical: 16, fontSize: 20, fontWeight: '800' },
  hint: { fontSize: 12, fontWeight: '600', textAlign: 'center', marginTop: 12 },

  // Black pill CTA — reference "Proceed to Checkout"
  cta: {
    borderRadius: 9999,
    paddingVertical: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  ctaText: { fontSize: 16, fontWeight: '800', letterSpacing: 0.1 },

  // Menu sheet
  menuOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'flex-end' },
  menuContent: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 32,
    gap: 6,
  },
  menuHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 14 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 10 },
  menuIconWrap: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  menuItemText: { fontSize: 16, fontWeight: '700' },

  // Dialogs
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  dialog: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 36,
    gap: 16,
  },
  dialogHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dialogTitle: { fontSize: 20, fontWeight: '800' },
  dialogClose: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  dialogSub: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
  dialogInput: {
    borderRadius: 9999,
    paddingHorizontal: 22,
    paddingVertical: 15,
    fontSize: 16,
    fontWeight: '700',
  },
  dialogBtn: { borderRadius: 9999, paddingVertical: 17, alignItems: 'center' },
  dialogBtnText: { color: '#FFF', fontWeight: '800', fontSize: 16 },
  confirmTarget: { padding: 16, borderRadius: 24, alignItems: 'center' },
  confirmTargetText: { fontSize: 24, fontWeight: '800' },
});
