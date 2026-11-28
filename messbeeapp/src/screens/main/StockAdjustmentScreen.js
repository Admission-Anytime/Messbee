import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { commerceService, inventoryService, resolveFileUrl } from '../../services/api';
import QuickBottomBar from '../../components/QuickBottomBar';

const REASONS = [
  'Purchase restock',
  'Online order',
  'Damaged / Expired',
  'Customer return',
  'Manual stock count',
];

export default function StockAdjustmentScreen({ route, navigation }) {
  const [selectedProduct, setSelectedProduct] = useState(route.params?.product || null);
  const [allProducts, setAllProducts] = useState([]);
  const [showProductPicker, setShowProductPicker] = useState(false);

  const [adjustType, setAdjustType] = useState('add'); // 'add' | 'remove'
  const [qtyText, setQtyText] = useState('');
  const [reason, setReason] = useState(REASONS[0]);
  const [showReasonPicker, setShowReasonPicker] = useState(false);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    commerceService
      .getProducts()
      .then((list) => {
        const arr = Array.isArray(list) ? list : [];
        setAllProducts(arr);
        if (!selectedProduct && arr.length > 0) setSelectedProduct(arr[0]);
      })
      .catch(() => {});
  }, []);

  const currentStock = Number(selectedProduct?.currentStock ?? selectedProduct?.stock ?? 0);
  const qty = Math.max(0, parseInt(qtyText || '0', 10) || 0);
  const afterStock =
    adjustType === 'add' ? currentStock + qty : Math.max(0, currentStock - qty);

  const handleSave = async () => {
    if (!selectedProduct?._id) {
      Alert.alert('Select Product', 'Please choose a product first.');
      return;
    }
    if (qty <= 0) {
      Alert.alert('Invalid Quantity', 'Please enter a quantity greater than 0.');
      return;
    }

    setSaving(true);
    try {
      const fullNote = `${adjustType === 'add' ? '+' : '-'}${qty} (${reason})${notes.trim() ? `: ${notes.trim()}` : ''}`;
      await inventoryService.adjustStock(selectedProduct._id, afterStock, fullNote);
      Alert.alert('Stock Updated', `${selectedProduct.name} stock updated to ${afterStock} units.`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || err.message || 'Failed to save stock adjustment.');
    } finally {
      setSaving(false);
    }
  };

  const imageUri = resolveFileUrl(selectedProduct?.productImage || selectedProduct?.image);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.headerTitle}>Stock Adjustment</Text>
          <Text style={styles.headerSub}>Update product inventory quantity</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={styles.headerBtn}>
          <Ionicons name="notifications-outline" size={20} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Selected Product Card */}
        <View style={styles.productCard}>
          <View style={styles.thumbBox}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={{ width: 46, height: 46, borderRadius: 10 }} />
            ) : (
              <Ionicons name="cube-outline" size={22} color="#92400E" />
            )}
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.smallLabel}>Selected product</Text>
            <Text style={styles.productName} numberOfLines={1}>
              {selectedProduct?.name || 'Select a product'}
            </Text>
            <Text style={styles.productSku}>{selectedProduct?.sku || ''}</Text>
          </View>
          <TouchableOpacity onPress={() => setShowProductPicker(true)}>
            <Text style={styles.changeLink}>Change</Text>
          </TouchableOpacity>
        </View>

        {/* Current Stock Quantity Banner */}
        <View style={styles.mintBanner}>
          <Text style={styles.mintLabel}>Current stock quantity</Text>
          <Text style={styles.mintVal}>
            {currentStock} <Text style={styles.mintUnit}>{selectedProduct?.unit || 'units'}</Text>
          </Text>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          <Text style={styles.fieldLabel}>Adjustment type</Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.toggleBtn, adjustType === 'add' && styles.toggleBtnActive]}
              onPress={() => setAdjustType('add')}
            >
              <Text style={[styles.toggleText, adjustType === 'add' && styles.toggleTextActive]}>
                + Add stock
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, adjustType === 'remove' && styles.toggleBtnActiveRed]}
              onPress={() => setAdjustType('remove')}
            >
              <Text style={[styles.toggleText, adjustType === 'remove' && styles.toggleTextActiveRed]}>
                - Remove stock
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.fieldLabel}>Quantity</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter quantity"
            placeholderTextColor="#94A3B8"
            keyboardType="numeric"
            value={qtyText}
            onChangeText={setQtyText}
          />

          <Text style={styles.fieldLabel}>Reason for adjustment</Text>
          <TouchableOpacity
            style={styles.selectBox}
            onPress={() => setShowReasonPicker((v) => !v)}
          >
            <Text style={styles.selectText}>{reason}</Text>
            <Ionicons name="chevron-down" size={16} color="#64748B" />
          </TouchableOpacity>
          {showReasonPicker && (
            <View style={styles.reasonList}>
              {REASONS.map((r) => (
                <TouchableOpacity
                  key={r}
                  style={styles.reasonItem}
                  onPress={() => {
                    setReason(r);
                    setShowReasonPicker(false);
                  }}
                >
                  <Text style={[styles.reasonText, reason === r && { color: '#00875A', fontWeight: '700' }]}>
                    {r}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={styles.fieldLabel}>Notes (optional)</Text>
          <TextInput
            style={[styles.input, { height: 78, textAlignVertical: 'top', paddingTop: 10 }]}
            placeholder="Add details about this adjustment"
            placeholderTextColor="#94A3B8"
            multiline
            value={notes}
            onChangeText={setNotes}
          />
        </View>

        {/* Stock After Adjustment */}
        <View style={styles.mintBanner}>
          <Text style={styles.mintLabel}>Stock after adjustment</Text>
          <Text style={styles.mintVal}>
            {afterStock} <Text style={styles.mintUnit}>{selectedProduct?.unit || 'units'}</Text>
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveBtnText}>✓ Save Adjustment</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Product Picker Modal */}
      <Modal
        visible={showProductPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowProductPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Product</Text>
              <TouchableOpacity onPress={() => setShowProductPicker(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={allProducts}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.pickerRow}
                  onPress={() => {
                    setSelectedProduct(item);
                    setShowProductPicker(false);
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.pickerName}>{item.name}</Text>
                    <Text style={styles.pickerSub}>{item.sku} • Stock: {item.currentStock ?? 0}</Text>
                  </View>
                  {selectedProduct?._id === item._id && (
                    <Ionicons name="checkmark-circle" size={20} color="#00B67A" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      <QuickBottomBar navigation={navigation} activeTab="Home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 24 : 10,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#0F172A' },
  headerSub: { fontSize: 11.5, color: '#64748B', marginTop: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  thumbBox: {
    width: 46,
    height: 46,
    borderRadius: 10,
    backgroundColor: '#F3E8D2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallLabel: { fontSize: 10.5, color: '#64748B' },
  productName: { fontSize: 14.5, fontWeight: '800', color: '#0F172A' },
  productSku: { fontSize: 11, color: '#64748B' },
  changeLink: { fontSize: 12.5, fontWeight: '700', color: '#00875A' },
  mintBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
  },
  mintLabel: { fontSize: 13, fontWeight: '700', color: '#065F46' },
  mintVal: { fontSize: 18, fontWeight: '800', color: '#00875A' },
  mintUnit: { fontSize: 12, fontWeight: '600' },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: '#334155', marginBottom: 6, marginTop: 10 },
  toggleRow: { flexDirection: 'row', gap: 8, backgroundColor: '#F1F5F9', padding: 4, borderRadius: 12 },
  toggleBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  toggleBtnActive: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#A7F3D0' },
  toggleBtnActiveRed: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#FECACA' },
  toggleText: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  toggleTextActive: { color: '#00875A' },
  toggleTextActiveRed: { color: '#EF4444' },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 13.5,
    color: '#0F172A',
  },
  selectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  selectText: { fontSize: 13.5, color: '#0F172A' },
  reasonList: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    marginTop: 6,
    backgroundColor: '#FFFFFF',
  },
  reasonItem: { paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  reasonText: { fontSize: 13, color: '#334155' },
  saveBtn: {
    backgroundColor: '#00875A',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  saveBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 18, maxHeight: '70%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  pickerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  pickerName: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  pickerSub: { fontSize: 11.5, color: '#64748B', marginTop: 2 },
});
