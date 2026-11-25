import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
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
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { categoryService, customerService } from '../../services/api';
import { validateForm } from '../../utils/validation';

export default function CategoriesCustomersScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('categories'); // 'categories' | 'customers'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [categories, setCategories] = useState([]);
  const [customers, setCustomers] = useState([]);

  // Category Modal
  const [catModalVisible, setCatModalVisible] = useState(false);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [savingCat, setSavingCat] = useState(false);

  // Customer Modal
  const [custModalVisible, setCustModalVisible] = useState(false);
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [savingCust, setSavingCust] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [catData, custData] = await Promise.all([
        categoryService.getCategories(),
        customerService.getCustomers(),
      ]);
      setCategories(Array.isArray(catData) ? catData : []);
      setCustomers(Array.isArray(custData) ? custData : []);
    } catch (err) {
      console.warn('CategoriesCustomers load error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveCategory = async () => {
    const { isValid, firstError } = validateForm({
      catName: { value: catName, required: true, minLength: 2, label: 'Category Name' },
    });
    if (!isValid) {
      Alert.alert('Validation Error', firstError);
      return;
    }

    setSavingCat(true);
    try {
      await categoryService.createCategory({ name: catName.trim(), description: catDesc.trim() });
      Alert.alert('Success', 'Category created!');
      setCatModalVisible(false);
      setCatName('');
      setCatDesc('');
      loadData();
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to create category.');
    } finally {
      setSavingCat(false);
    }
  };

  const handleSaveCustomer = async () => {
    const { isValid, firstError } = validateForm({
      custName: { value: custName, required: true, minLength: 2, label: 'Customer Name' },
      custPhone: { value: custPhone, required: true, phone: true, label: 'Mobile Number' },
      custEmail: { value: custEmail, email: true, label: 'Email Address' },
    });
    if (!isValid) {
      Alert.alert('Validation Error', firstError);
      return;
    }

    setSavingCust(true);
    try {
      await customerService.createCustomer({
        customerName: custName.trim(),
        mobile: custPhone.trim(),
        email: custEmail.trim(),
      });
      Alert.alert('Success', 'Customer added!');
      setCustModalVisible(false);
      setCustName('');
      setCustPhone('');
      setCustEmail('');
      loadData();
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to add customer.');
    } finally {
      setSavingCust(false);
    }
  };

  const handleDeleteCategory = (item) => {
    Alert.alert('Delete Category', `Delete "${item.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setCategories((prev) => prev.filter((c) => c._id !== item._id));
          try {
            await categoryService.deleteCategory(item._id);
          } catch (err) {
            loadData();
          }
        },
      },
    ]);
  };

  const handleDeleteCustomer = (item) => {
    Alert.alert('Delete Customer', `Delete "${item.customerName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setCustomers((prev) => prev.filter((c) => c._id !== item._id));
          try {
            await customerService.deleteCustomer(item._id);
          } catch (err) {
            loadData();
          }
        },
      },
    ]);
  };

  const renderCategory = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.iconBox}>
          <Ionicons name="folder-open-outline" size={20} color="#00B67A" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          {item.description ? <Text style={styles.cardSub}>{item.description}</Text> : null}
        </View>
        <TouchableOpacity onPress={() => handleDeleteCategory(item)}>
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCustomer = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={[styles.iconBox, { backgroundColor: '#EDE9FE' }]}>
          <Ionicons name="person-outline" size={20} color="#7C3AED" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{item.customerName || item.name}</Text>
          <Text style={styles.cardSub}>
            {item.mobile || item.phone} {item.email ? `• ${item.email}` : ''}
          </Text>
        </View>
        <TouchableOpacity onPress={() => handleDeleteCustomer(item)}>
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Categories & Customers</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => (activeTab === 'categories' ? setCatModalVisible(true) : setCustModalVisible(true))}
        >
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.addBtnText}>{activeTab === 'categories' ? 'Category' : 'Customer'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'categories' && styles.tabActive]}
          onPress={() => setActiveTab('categories')}
        >
          <Text style={[styles.tabText, activeTab === 'categories' && styles.tabTextActive]}>
            Categories ({categories.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'customers' && styles.tabActive]}
          onPress={() => setActiveTab('customers')}
        >
          <Text style={[styles.tabText, activeTab === 'customers' && styles.tabTextActive]}>
            Customers ({customers.length})
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#00B67A" />
        </View>
      ) : (
        <FlatList
          data={activeTab === 'categories' ? categories : customers}
          keyExtractor={(item, i) => item._id || String(i)}
          renderItem={activeTab === 'categories' ? renderCategory : renderCustomer}
          contentContainerStyle={[
            styles.listContent,
            (activeTab === 'categories' ? categories : customers).length === 0 && { flex: 1, justifyContent: 'center' },
          ]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} colors={['#00B67A']} />}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="albums-outline" size={44} color="#94A3B8" />
              <Text style={styles.emptyTitle}>
                {activeTab === 'categories' ? 'No categories yet' : 'No customers yet'}
              </Text>
            </View>
          }
        />
      )}

      {/* Add Category Modal */}
      <Modal visible={catModalVisible} animationType="slide" transparent onRequestClose={() => setCatModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Product Category</Text>
              <TouchableOpacity onPress={() => setCatModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.modalForm}>
              <Text style={styles.label}>Category Name *</Text>
              <TextInput style={styles.input} value={catName} onChangeText={setCatName} placeholder="e.g. Electronics, Apparel" />
              <Text style={styles.label}>Description</Text>
              <TextInput style={styles.input} value={catDesc} onChangeText={setCatDesc} placeholder="Optional category notes" />
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveCategory} disabled={savingCat}>
                {savingCat ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveBtnText}>Save Category</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Add Customer Modal */}
      <Modal visible={custModalVisible} animationType="slide" transparent onRequestClose={() => setCustModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Customer</Text>
              <TouchableOpacity onPress={() => setCustModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.modalForm}>
              <Text style={styles.label}>Customer Name *</Text>
              <TextInput style={styles.input} value={custName} onChangeText={setCustName} placeholder="e.g. Rahul Sharma" />
              <Text style={styles.label}>Mobile Number *</Text>
              <TextInput style={styles.input} value={custPhone} onChangeText={setCustPhone} keyboardType="phone-pad" maxLength={15} placeholder="10-digit mobile" />
              <Text style={styles.label}>Email Address</Text>
              <TextInput style={styles.input} value={custEmail} onChangeText={setCustEmail} keyboardType="email-address" autoCapitalize="none" placeholder="customer@email.com" />
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveCustomer} disabled={savingCust}>
                {savingCust ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveBtnText}>Save Customer</Text>}
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
  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#00B67A', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, gap: 4 },
  addBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  tabBar: { flexDirection: 'row', backgroundColor: '#FFFFFF', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  tab: { paddingVertical: 12, paddingHorizontal: 14, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#00B67A' },
  tabText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  tabTextActive: { color: '#00B67A' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { padding: 16, gap: 10 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#E2E8F0' },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#E8F8F2', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  cardSub: { fontSize: 12, color: '#64748B', marginTop: 2 },
  emptyBox: { alignItems: 'center', padding: 32 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: '#64748B', marginTop: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '85%', paddingBottom: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#0F172A' },
  modalForm: { padding: 18 },
  label: { fontSize: 13, fontWeight: '600', color: '#334155', marginTop: 10, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#0F172A' },
  saveBtn: { backgroundColor: '#00B67A', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  saveBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
