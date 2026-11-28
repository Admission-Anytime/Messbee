import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  RefreshControl,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { supplierService, purchaseService, commerceService } from '../../services/api';
import { validateForm } from '../../utils/validation';

export default function SuppliersPurchasesScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('suppliers'); // 'suppliers' | 'purchases'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [suppliers, setSuppliers] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);

  // Add Supplier Modal
  const [supModalVisible, setSupModalVisible] = useState(false);
  const [supName, setSupName] = useState('');
  const [supPhone, setSupPhone] = useState('');
  const [supEmail, setSupEmail] = useState('');
  const [supGst, setSupGst] = useState('');
  const [savingSup, setSavingSup] = useState(false);

  // Add Purchase Order Modal
  const [poModalVisible, setPoModalVisible] = useState(false);
  const [selSupplierId, setSelSupplierId] = useState('');
  const [selProductId, setSelProductId] = useState('');
  const [poQty, setPoQty] = useState('10');
  const [poPrice, setPoPrice] = useState('');
  const [savingPo, setSavingPo] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [supData, poData, prodData] = await Promise.all([
        supplierService.getSuppliers(),
        purchaseService.getPurchases(),
        commerceService.getProducts(),
      ]);
      setSuppliers(Array.isArray(supData) ? supData : []);
      setPurchases(Array.isArray(poData) ? poData : []);
      setProducts(Array.isArray(prodData) ? prodData : []);
    } catch (err) {
      console.warn('SuppliersPurchases fetch error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveSupplier = async () => {
    const { isValid, firstError } = validateForm({
      supName: { value: supName, required: true, minLength: 2, label: 'Supplier Name' },
      supPhone: { value: supPhone, required: true, phone: true, label: 'Mobile Number' },
      supEmail: { value: supEmail, email: true, label: 'Email Address' },
    });
    if (!isValid) {
      Alert.alert('Validation Error', firstError);
      return;
    }

    setSavingSup(true);
    try {
      await supplierService.createSupplier({
        supplierName: supName.trim(),
        mobile: supPhone.trim(),
        email: supEmail.trim(),
        gstNumber: supGst.trim(),
      });
      Alert.alert('Success', 'Supplier added successfully!');
      setSupModalVisible(false);
      setSupName('');
      setSupPhone('');
      setSupEmail('');
      setSupGst('');
      fetchData();
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to add supplier.');
    } finally {
      setSavingSup(false);
    }
  };

  const handleCreatePurchase = async () => {
    if (!selSupplierId) {
      Alert.alert('Validation Error', 'Please select a supplier.');
      return;
    }
    if (!selProductId) {
      Alert.alert('Validation Error', 'Please select a product.');
      return;
    }
    const qtyNum = Number(poQty);
    const priceNum = Number(poPrice);
    if (!poQty.trim() || isNaN(qtyNum) || qtyNum < 1) {
      Alert.alert('Validation Error', 'Quantity must be at least 1.');
      return;
    }
    if (!poPrice.trim() || isNaN(priceNum) || priceNum < 0) {
      Alert.alert('Validation Error', 'Purchase unit price must be 0 or greater.');
      return;
    }

    const totalAmount = qtyNum * priceNum;
    setSavingPo(true);
    try {
      await purchaseService.createPurchase({
        supplier: selSupplierId,
        products: [
          {
            product: selProductId,
            quantity: qtyNum,
            purchasePrice: priceNum,
            totalAmount,
          },
        ],
        subTotal: totalAmount,
        grandTotal: totalAmount,
        paymentStatus: 'paid',
        purchaseDate: new Date().toISOString(),
      });
      Alert.alert('Success', 'Purchase order recorded and stock updated!');
      setPoModalVisible(false);
      fetchData();
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to create purchase order.');
    } finally {
      setSavingPo(false);
    }
  };

  const handleDeleteSupplier = (item) => {
    Alert.alert('Delete Supplier', `Delete "${item.supplierName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setSuppliers((prev) => prev.filter((s) => s._id !== item._id));
          try {
            await supplierService.deleteSupplier(item._id);
          } catch (err) {
            fetchData();
          }
        },
      },
    ]);
  };

  const renderSupplier = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <View style={styles.iconBox}>
          <Ionicons name="business-outline" size={22} color="#00B67A" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{item.supplierName || item.name}</Text>
          <Text style={styles.cardSub}>{item.mobile || item.phone} {item.email ? `• ${item.email}` : ''}</Text>
          {item.gstNumber ? <Text style={styles.gstBadge}>GST: {item.gstNumber}</Text> : null}
        </View>
        <TouchableOpacity onPress={() => handleDeleteSupplier(item)}>
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPurchase = ({ item }) => {
    const supName = typeof item.supplier === 'object' ? item.supplier?.supplierName : 'Supplier';
    return (
      <View style={styles.card}>
        <View style={styles.cardRow}>
          <View style={[styles.iconBox, { backgroundColor: '#E0F2FE' }]}>
            <Ionicons name="cube-outline" size={22} color="#0284C7" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{item.invoiceNumber || item.billNumber || 'PO-Record'}</Text>
            <Text style={styles.cardSub}>{supName}</Text>
          </View>
          <Text style={styles.amountText}>₹{Number(item.grandTotal || 0).toLocaleString('en-IN')}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Suppliers & Purchases</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => {
            if (activeTab === 'suppliers') {
              setSupModalVisible(true);
            } else {
              if (suppliers.length > 0) setSelSupplierId(suppliers[0]._id);
              if (products.length > 0) {
                setSelProductId(products[0]._id);
                setPoPrice(String(products[0].purchasePrice ?? products[0].sellingPrice ?? 0));
              }
              setPoModalVisible(true);
            }
          }}
        >
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.addBtnText}>{activeTab === 'suppliers' ? 'Supplier' : 'Stock In'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'suppliers' && styles.tabActive]}
          onPress={() => setActiveTab('suppliers')}
        >
          <Text style={[styles.tabText, activeTab === 'suppliers' && styles.tabTextActive]}>
            Suppliers ({suppliers.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'purchases' && styles.tabActive]}
          onPress={() => setActiveTab('purchases')}
        >
          <Text style={[styles.tabText, activeTab === 'purchases' && styles.tabTextActive]}>
            Purchase Orders ({purchases.length})
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#00B67A" />
        </View>
      ) : (
        <FlatList
          data={activeTab === 'suppliers' ? suppliers : purchases}
          keyExtractor={(item, i) => item._id || String(i)}
          renderItem={activeTab === 'suppliers' ? renderSupplier : renderPurchase}
          contentContainerStyle={[
            styles.listContent,
            (activeTab === 'suppliers' ? suppliers : purchases).length === 0 && { flex: 1, justifyContent: 'center' },
          ]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} colors={['#00B67A']} />}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="briefcase-outline" size={44} color="#94A3B8" />
              <Text style={styles.emptyTitle}>
                {activeTab === 'suppliers' ? 'No suppliers added yet' : 'No purchase orders yet'}
              </Text>
            </View>
          }
        />
      )}

      {/* Add Supplier Modal */}
      <Modal visible={supModalVisible} animationType="slide" transparent onRequestClose={() => setSupModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Supplier</Text>
              <TouchableOpacity onPress={() => setSupModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.modalForm}>
              <Text style={styles.label}>Supplier / Vendor Name *</Text>
              <TextInput style={styles.input} value={supName} onChangeText={setSupName} placeholder="e.g. Apex Distributors" />
              <Text style={styles.label}>Mobile Number *</Text>
              <TextInput style={styles.input} value={supPhone} onChangeText={setSupPhone} keyboardType="phone-pad" maxLength={15} placeholder="10-digit mobile" />
              <Text style={styles.label}>Email Address</Text>
              <TextInput style={styles.input} value={supEmail} onChangeText={setSupEmail} keyboardType="email-address" autoCapitalize="none" placeholder="vendor@company.com" />
              <Text style={styles.label}>GST Number</Text>
              <TextInput style={styles.input} value={supGst} onChangeText={setSupGst} autoCapitalize="characters" placeholder="Optional GSTIN" />
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveSupplier} disabled={savingSup}>
                {savingSup ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveBtnText}>Save Supplier</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Add Purchase Order Modal */}
      <Modal visible={poModalVisible} animationType="slide" transparent onRequestClose={() => setPoModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Purchase / Stock-In</Text>
              <TouchableOpacity onPress={() => setPoModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.modalForm}>
              <Text style={styles.label}>Select Supplier *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 6 }}>
                {suppliers.map((s) => (
                  <TouchableOpacity
                    key={s._id}
                    style={[styles.pill, selSupplierId === s._id && styles.pillActive]}
                    onPress={() => setSelSupplierId(s._id)}
                  >
                    <Text style={[styles.pillText, selSupplierId === s._id && styles.pillTextActive]}>
                      {s.supplierName || s.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.label}>Select Product *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 6 }}>
                {products.map((p) => (
                  <TouchableOpacity
                    key={p._id}
                    style={[styles.pill, selProductId === p._id && styles.pillActive]}
                    onPress={() => {
                      setSelProductId(p._id);
                      setPoPrice(String(p.purchasePrice ?? p.sellingPrice ?? 0));
                    }}
                  >
                    <Text style={[styles.pillText, selProductId === p._id && styles.pillTextActive]}>
                      {p.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.label}>Quantity *</Text>
              <TextInput style={styles.input} value={poQty} onChangeText={setPoQty} keyboardType="numeric" />
              <Text style={styles.label}>Purchase Unit Price (₹) *</Text>
              <TextInput style={styles.input} value={poPrice} onChangeText={setPoPrice} keyboardType="numeric" />

              <TouchableOpacity style={styles.saveBtn} onPress={handleCreatePurchase} disabled={savingPo}>
                {savingPo ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveBtnText}>Create Purchase Order</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00B67A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  addBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  tabBar: { flexDirection: 'row', backgroundColor: '#FFFFFF', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  tab: { paddingVertical: 12, paddingHorizontal: 14, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#00B67A' },
  tabText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  tabTextActive: { color: '#00B67A' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { padding: 16, gap: 10 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#E2E8F0' },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 42, height: 42, borderRadius: 10, backgroundColor: '#E8F8F2', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  cardSub: { fontSize: 12, color: '#64748B', marginTop: 2 },
  gstBadge: { fontSize: 11, color: '#0284C7', marginTop: 3, fontWeight: '600' },
  amountText: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  emptyBox: { alignItems: 'center', padding: 32 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: '#64748B', marginTop: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '88%', paddingBottom: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#0F172A' },
  modalForm: { padding: 18 },
  label: { fontSize: 13, fontWeight: '600', color: '#334155', marginTop: 10, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#0F172A' },
  pill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' },
  pillActive: { backgroundColor: '#00B67A', borderColor: '#00B67A' },
  pillText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  pillTextActive: { color: '#FFFFFF' },
  saveBtn: { backgroundColor: '#00B67A', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  saveBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
