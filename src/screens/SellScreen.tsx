import React, { useState, useEffect } from 'react';
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
  PackagePlus,
  X,
  Archive,
  Trash2,
} from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/use-theme';
import { getInventoryItem, restockItem, archiveInventoryItem, deleteInventoryItem } from '@/services/inventory';
import type { InventoryItem } from '@/types';

export default function SellScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, radii, shadows } = useTheme();
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [selling, setSelling] = useState(false);

  const [salePrice, setSalePrice] = useState('');
  const [saleType, setSaleType] = useState<'retail' | 'wholesale'>('retail');
  const [restockQty, setRestockQty] = useState('');
  const [restocking, setRestocking] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmQty, setDeleteConfirmQty] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  useEffect(() => {
    if (id) {
      loadItem(id);
    }
  }, [id]);

  const loadItem = async (itemId: string) => {
    try {
      const data = await getInventoryItem(itemId);
      setItem(data);
      setSalePrice(String(data.sellingPrice));
    } catch (error) {
      Alert.alert('Error', 'Failed to load item details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

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
      Alert.alert('Success', 'Inventory updated successfully!');
    } catch (error) {
      Alert.alert('Restock Failed', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setRestocking(false);
    }
  };

  const handleArchive = async () => {
    setIsArchiving(true);
    try {
      await archiveInventoryItem(id);
      Alert.alert('Success', 'Item archived successfully');
      router.replace('/(tabs)/stocks');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsArchiving(false);
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
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1A1A1A" />
      </View>
    );
  }

  if (!item) return null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Sell Phone</Text>
              <Text style={styles.subtitle}>
                {item.brand} {item.model}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.moreBtn}
              onPress={() => setShowMenu(true)}
              activeOpacity={0.7}
            >
              <MoreVertical size={24} color="#111827" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.itemCard, shadows.card]}>
          <View style={styles.itemImageWrap}>
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
            ) : (
              <View style={styles.noImage}>
                <Text style={styles.noImageText}>📱</Text>
              </View>
            )}
          </View>
          <View style={styles.itemInfo}>
            <Text style={styles.itemModel}>{item.model}</Text>
            <Text style={styles.itemBrand}>{item.brand}</Text>
            <Text style={styles.itemQty}>{item.quantity} in stock</Text>
          </View>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Sale Price</Text>
            <TextInput
              style={styles.input}
              placeholder="₹0"
              keyboardType="numeric"
              value={salePrice}
              onChangeText={setSalePrice}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.typeBtn, saleType === 'retail' && styles.typeBtnActive]}
              onPress={() => setSaleType('retail')}
            >
              <Text style={[styles.typeBtnText, saleType === 'retail' && styles.typeBtnTextActive]}>
                Retail
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeBtn, saleType === 'wholesale' && styles.typeBtnActive]}
              onPress={() => setSaleType('wholesale')}
            >
              <Text style={[styles.typeBtnText, saleType === 'wholesale' && styles.typeBtnTextActive]}>
                Wholesale
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
            onPress={handleSell}
          >
            <Text style={styles.primaryBtnText}>Continue to Verify</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={showMenu} transparent animationType="fade" onRequestClose={() => setShowMenu(false)}>
        <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={() => setShowMenu(false)}>
          <View style={[styles.menuContent, { backgroundColor: colors.bgCard }]}>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setShowMenu(false); router.push({ pathname: '/sell', params: { id, edit: '1' } }); }}>
              <Edit2 size={20} color={colors.textPrimary} />
              <Text style={[styles.menuItemText, { color: colors.textPrimary }]}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleArchive}>
              <Archive size={20} color={colors.textPrimary} />
              <Text style={[styles.menuItemText, { color: colors.textPrimary }]}>Archive</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setShowMenu(false); setShowDeleteModal(true); }}>
              <Trash2 size={20} color={colors.danger} />
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
              <TouchableOpacity onPress={() => setShowRestockModal(false)}>
                <X size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            <Text style={[styles.dialogSub, { color: colors.textSecondary }]}>Enter quantity to add:</Text>
            <TextInput
              style={[styles.dialogInput, { color: colors.textPrimary, borderColor: colors.border }]}
              placeholder="0"
              keyboardType="numeric"
              value={restockQty}
              onChangeText={setRestockQty}
              placeholderTextColor="#999"
            />
            <TouchableOpacity
              style={[styles.dialogBtn, { backgroundColor: colors.primary }]}
              onPress={handleRestock}
              disabled={restocking}
            >
              {restocking ? <ActivityIndicator color="#FFF" /> : <Text style={styles.dialogBtnText}>Restock</Text>}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={showDeleteModal} transparent animationType="slide" onRequestClose={() => setShowDeleteModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowDeleteModal(false)}>
          <View style={[styles.dialog, { backgroundColor: colors.bgCard }]}>
            <View style={styles.dialogHeader}>
              <Text style={[styles.dialogTitle, { color: colors.danger }]}>Confirm Deletion</Text>
              <TouchableOpacity onPress={() => setShowDeleteModal(false)}>
                <X size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            <Text style={[styles.dialogSub, { color: colors.textSecondary }]}>
              To delete <Text style={{ fontWeight: '800', color: colors.textPrimary }}>{item.brand} {item.model}</Text> permanently, please type the current stock quantity:
            </Text>
            <View style={[styles.confirmTarget, { backgroundColor: colors.bgCardAlt, borderColor: colors.border }]}>
              <Text style={[styles.confirmTargetText, { color: colors.textPrimary }]}>{item.quantity}</Text>
            </View>
            <TextInput
              style={[styles.dialogInput, { color: colors.textPrimary, borderColor: colors.border }]}
              placeholder="Type quantity here"
              keyboardType="numeric"
              value={deleteConfirmQty}
              onChangeText={setDeleteConfirmQty}
              placeholderTextColor="#999"
            />
            <TouchableOpacity
              style={[styles.dialogBtn, { backgroundColor: colors.danger }]}
              onPress={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.dialogBtnText}>Delete Permanently</Text>}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  scroll: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { marginBottom: 24 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 24, color: '#1A1A1A', fontWeight: '300' },
  subtitle: { fontSize: 14, color: '#999', fontWeight: '600', marginTop: 4 },
  moreBtn: { padding: 8 },
  itemCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 24, flexDirection: 'row', gap: 16, alignItems: 'center' },
  itemImageWrap: { width: 80, height: 80, borderRadius: 12, backgroundColor: '#F8F9FA', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  itemImage: { width: '100%', height: '100%' },
  noImage: { alignItems: 'center', justifyContent: 'center' },
  noImageText: { fontSize: 32 } as any,
  itemInfo: { flex: 1, gap: 4 },
  itemModel: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  itemBrand: { fontSize: 14, color: '#6B7280', fontWeight: '600' },
  itemQty: { fontSize: 13, color: '#999', fontWeight: '500' },
  form: { gap: 16 },
  inputContainer: { gap: 6 },
  label: { fontSize: 13, fontWeight: '700', color: '#666', textTransform: 'uppercase' },
  input: { backgroundColor: '#F9FAFB', borderRadius: 12, padding: 16, color: '#1A1A1A', fontWeight: '500', borderWidth: 1, borderColor: '#F3F4F6' },
  row: { flexDirection: 'row', gap: 12 },
  typeBtn: { flex: 1, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#F3F4F6', alignItems: 'center' },
  typeBtnActive: { backgroundColor: '#1A1A1A', borderColor: '#1A1A1A' },
  typeBtnText: { color: '#6B7280', fontWeight: '700' },
  typeBtnTextActive: { color: '#FFF' },
  primaryBtn: { borderRadius: 12, padding: 18, alignItems: 'center', marginTop: 8 },
  primaryBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  menuOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'flex-end' },
  menuContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 12 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 12 },
  menuItemText: { fontSize: 16, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  dialog: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 16 },
  dialogHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dialogTitle: { fontSize: 20, fontWeight: '700' },
  dialogSub: { fontSize: 14, fontWeight: '600' },
  dialogInput: { borderWidth: 1, borderRadius: 12, padding: 16, fontSize: 16, fontWeight: '600' },
  dialogBtn: { borderRadius: 12, padding: 16, alignItems: 'center' },
  dialogBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  confirmTarget: { padding: 16, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  confirmTargetText: { fontSize: 24, fontWeight: '800' },
});
