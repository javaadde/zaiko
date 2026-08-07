import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  ChevronLeft,
  RotateCcw,
  Trash2,
  Package,
  X,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';
import { getInventoryItems, unarchiveInventoryItem, deleteInventoryItem } from '@/services/inventory';
import type { InventoryItem } from '@/types';

export default function ArchivedStocksScreen() {
  const router = useRouter();
  const { colors, radii, shadows } = useTheme();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmQty, setDeleteConfirmQty] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const fetchArchivedItems = useCallback(async () => {
    try {
      const data = await getInventoryItems({ isArchived: true });
      setItems(data);
    } catch (error) {
      console.warn('Failed to fetch archived inventory:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchArchivedItems();
  }, [fetchArchivedItems]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchArchivedItems();
  }, [fetchArchivedItems]);

  const handleRestore = async (item: InventoryItem) => {
    Alert.alert(
      'Restore Stock',
      `Are you sure you want to restore "${item.brand} ${item.model}" to active inventory?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          onPress: async () => {
            try {
              await unarchiveInventoryItem(item.id);
              setItems((prev) => prev.filter((i) => i.id !== item.id));
              Alert.alert('Success', 'Item restored successfully');
            } catch (error) {
              Alert.alert('Error', error instanceof Error ? error.message : 'Unknown error');
            }
          },
        },
      ],
    );
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    if (Number(deleteConfirmQty) !== selectedItem.quantity) {
      Alert.alert(
        'Verification Failed',
        `Please enter the exact current quantity (${selectedItem.quantity}) to confirm deletion.`,
      );
      return;
    }
    setIsDeleting(true);
    try {
      await deleteInventoryItem(selectedItem.id);
      setItems((prev) => prev.filter((i) => i.id !== selectedItem.id));
      setShowDeleteModal(false);
      setDeleteConfirmQty('');
      Alert.alert('Success', 'Item deleted permanently');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bgCard }]}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Archived Stocks</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#6366F1" />
          </View>
        ) : items.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBox}>
              <Package size={60} color="#E5E7EB" strokeWidth={1} />
            </View>
            <Text style={styles.emptyTitle}>No archived stocks</Text>
            <Text style={styles.emptySub}>
              Items you archive will appear here
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {items.map((item) => (
              <View key={item.id} style={[styles.itemCard, { backgroundColor: colors.bgCardAlt }, shadows.card]}>
                <View style={styles.itemMain}>
                  <View style={styles.imageBox}>
                    {item.imageUrl ? (
                      <Image
                        source={{ uri: item.imageUrl }}
                        style={styles.image}
                      />
                    ) : (
                      <Text style={styles.emoji}>📱</Text>
                    )}
                  </View>
                  <View style={styles.info}>
                    <Text style={[styles.brand, { color: colors.textPrimary }]}>{item.brand}</Text>
                    <Text style={[styles.model, { color: colors.textSecondary }]}>{item.model}</Text>
                    <Text style={[styles.qty, { color: colors.textMuted }]}>
                      {item.quantity} Units in stock
                    </Text>
                  </View>
                </View>

                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.restoreBtn]}
                    onPress={() => handleRestore(item)}
                  >
                    <RotateCcw size={18} color="#6366F1" />
                    <Text style={[styles.actionText, { color: '#6366F1' }]}>
                      Restore
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, styles.deleteBtn]}
                    onPress={() => {
                      setSelectedItem(item);
                      setDeleteConfirmQty('');
                      setShowDeleteModal(true);
                    }}
                  >
                    <Trash2 size={18} color="#EF4444" />
                    <Text style={[styles.actionText, { color: '#EF4444' }]}>
                      Delete
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
        <View style={{ height: 50 }} />
      </ScrollView>

      <Modal visible={showDeleteModal} transparent={true} animationType="slide" onRequestClose={() => setShowDeleteModal(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[styles.restockDialog, { backgroundColor: colors.bgCard }]}>
            <View style={styles.dialogHeader}>
              <View>
                <Text style={[styles.dialogTitle, { color: colors.danger }]}>
                  Confirm Deletion
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowDeleteModal(false)}>
                <X size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <View style={styles.dialogBody}>
              {selectedItem && (
                <>
                  <Text style={[styles.dialogSub, { color: colors.textSecondary }]}>
                    To delete{' '}
                    <Text style={{ fontWeight: '800', color: colors.textPrimary }}>
                      {selectedItem.brand} {selectedItem.model}
                    </Text>{' '}
                    permanently, please type the current stock quantity:
                  </Text>

                  <View style={[styles.confirmTarget, { backgroundColor: colors.bgCardAlt, borderColor: colors.border }]}>
                    <Text style={[styles.confirmTargetText, { color: colors.textPrimary }]}>
                      {selectedItem.quantity}
                    </Text>
                  </View>

                  <TextInput
                    style={[styles.restockInput, { color: colors.textPrimary, borderColor: colors.border }]}
                    placeholder="Type quantity here..."
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
                    {isDeleting ? (
                      <ActivityIndicator color="#FFF" />
                    ) : (
                      <Text style={styles.dialogBtnText}>Delete Permanently</Text>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
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
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  scroll: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 40 },
  center: { paddingVertical: 100, alignItems: 'center' },
  emptyContainer: { alignItems: 'center', paddingVertical: 80, gap: 16 },
  emptyIconBox: { width: 100, height: 100, borderRadius: 24, backgroundColor: '#F9FAFB', alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  emptySub: { fontSize: 14, color: '#999', textAlign: 'center' },
  list: { gap: 16 },
  itemCard: { borderRadius: 16, padding: 16, gap: 12 },
  itemMain: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  imageBox: { width: 64, height: 64, borderRadius: 12, backgroundColor: '#F8F9FA', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  emoji: { fontSize: 28 },
  info: { flex: 1, gap: 4 },
  brand: { fontSize: 16, fontWeight: '700' },
  model: { fontSize: 14, fontWeight: '600' },
  qty: { fontSize: 13, fontWeight: '500' },
  actions: { flexDirection: 'row', gap: 12 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 12 },
  restoreBtn: { backgroundColor: '#EEF2FF' },
  deleteBtn: { backgroundColor: '#FEF2F2' },
  actionText: { fontSize: 13, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  restockDialog: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 16 },
  dialogHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dialogTitle: { fontSize: 20, fontWeight: '700' },
  dialogBody: { gap: 12 },
  dialogSub: { fontSize: 14, fontWeight: '600' },
  confirmTarget: { padding: 16, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  confirmTargetText: { fontSize: 24, fontWeight: '800' },
  restockInput: { borderWidth: 1, borderRadius: 12, padding: 16, fontSize: 16, fontWeight: '600' },
  dialogBtn: { borderRadius: 12, padding: 16, alignItems: 'center' },
  dialogBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
