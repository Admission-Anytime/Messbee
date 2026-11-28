import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { commerceService } from '../../services/api';

const DEFAULT_CATEGORIES = ['All', 'Electronics', 'Clothing', 'Services', 'Groceries', 'General'];

export default function CommerceCatalogScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [stockFilter, setStockFilter] = useState('All'); // 'All' | 'In Stock' | 'Low Stock' | 'Out of Stock'

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [currentStock, setCurrentStock] = useState('0');
  const [description, setDescription] = useState('');

  const fetchCatalog = useCallback(async () => {
    try {
      const data = await commerceService.getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('fetchCatalog error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCatalog();
    const unsub = navigation.addListener('focus', fetchCatalog);
    return unsub;
  }, [fetchCatalog, navigation]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCatalog();
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setSku(`SKU-${Date.now().toString().slice(-6)}`);
    setCategory('General');
    setSellingPrice('');
    setPurchasePrice('');
    setCurrentStock('10');
    setDescription('');
    setModalVisible(true);
  };

  const openEditModal = (item) => {
    setEditingProduct(item);
    setName(item.name || '');
    setSku(item.sku || '');
    setCategory(typeof item.category === 'object' ? item.category?.name || 'General' : item.category || 'General');
    setSellingPrice(String(item.sellingPrice ?? item.price ?? ''));
    setPurchasePrice(String(item.purchasePrice ?? ''));
    setCurrentStock(String(item.currentStock ?? item.stock ?? 0));
    setDescription(item.description || '');
    setModalVisible(true);
  };

  const handleSaveProduct = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter a product name.');
      return;
    }
    if (!sku.trim()) {
      Alert.alert('Validation Error', 'Please enter a product SKU.');
      return;
    }
    if (!sellingPrice.trim() || isNaN(Number(sellingPrice)) || Number(sellingPrice) < 0) {
      Alert.alert('Validation Error', 'Selling price must be 0 or greater.');
      return;
    }
    if (currentStock.trim() && (isNaN(Number(currentStock)) || Number(currentStock) < 0)) {
      Alert.alert('Validation Error', 'Stock quantity cannot be negative.');
      return;
    }

    const payload = {
      name: name.trim(),
      sku: sku.trim(),
      category: category.trim() || 'General',
      sellingPrice: Number(sellingPrice),
      purchasePrice: purchasePrice.trim() ? Number(purchasePrice) : Number(sellingPrice),
      currentStock: Number(currentStock) || 0,
      description: description.trim(),
    };

    setSaving(true);
    try {
      if (editingProduct) {
        const updated = await commerceService.updateProduct(editingProduct._id, payload);
        setProducts((prev) =>
          prev.map((p) => (p._id === editingProduct._id ? { ...p, ...payload, ...updated } : p))
        );
      } else {
        const created = await commerceService.createProduct(payload);
        setProducts((prev) => [created, ...prev]);
      }
      setModalVisible(false);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || err.message || 'Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = (item) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${item.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setProducts((prev) => prev.filter((p) => p._id !== item._id));
            try {
              await commerceService.deleteProduct(item._id);
            } catch (err) {
              Alert.alert('Error', 'Failed to delete product.');
              fetchCatalog();
            }
          },
        },
      ]
    );
  };

  // Derive categories list dynamically
  const categoriesList = useMemo(() => {
    const set = new Set(DEFAULT_CATEGORIES);
    products.forEach((p) => {
      const cat = typeof p.category === 'object' ? p.category?.name : p.category;
      if (cat) set.add(cat);
    });
    return Array.from(set);
  }, [products]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const pCat = typeof p.category === 'object' ? p.category?.name : p.category;
      const matchesCategory =
        selectedCategory === 'All' || (pCat && pCat.toLowerCase() === selectedCategory.toLowerCase());
      const stk = Number(p.currentStock ?? p.stock ?? 0);
      let matchesStock = true;
      if (stockFilter === 'In Stock') matchesStock = stk > 5;
      else if (stockFilter === 'Low Stock') matchesStock = stk > 0 && stk <= 5;
      else if (stockFilter === 'Out of Stock') matchesStock = stk <= 0;
      const query = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !query ||
        (p.name && p.name.toLowerCase().includes(query)) ||
        (p.sku && p.sku.toLowerCase().includes(query));
      return matchesCategory && matchesStock && matchesQuery;
    });
  }, [products, selectedCategory, stockFilter, searchQuery]);

  // Stock status helper
  const getStockStatus = (stock) => {
    const num = Number(stock) || 0;
    if (num <= 0) return { label: 'Out of Stock', color: '#EF4444', bg: '#FEE2E2' };
    if (num <= 5) return { label: `Low Stock (${num})`, color: '#F59E0B', bg: '#FEF3C7' };
    return { label: `In Stock (${num})`, color: '#10B981', bg: '#D1FAE5' };
  };

  const renderProductItem = ({ item }) => {
    const stockStatus = getStockStatus(item.currentStock ?? item.stock);
    const price = item.sellingPrice ?? item.price ?? 0;
    const catName = typeof item.category === 'object' ? item.category?.name : item.category;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('ProductDetails', { product: item })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.productIconBox}>
            <Ionicons name="cube-outline" size={24} color="#00B67A" />
          </View>
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={1}>
              {item.name}
            </Text>
            <View style={styles.skuRow}>
              <Text style={styles.skuText}>SKU: {item.sku || 'N/A'}</Text>
              {catName && <Text style={styles.catBadge}>{catName}</Text>}
            </View>
          </View>
        </View>

        {item.description ? (
          <Text style={styles.descriptionText} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}

        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.priceLabel}>Price</Text>
            <Text style={styles.priceValue}>₹{Number(price).toLocaleString('en-IN')}</Text>
          </View>

          <View style={[styles.stockBadge, { backgroundColor: stockStatus.bg }]}>
            <Text style={[styles.stockBadgeText, { color: stockStatus.color }]}>
              {stockStatus.label}
            </Text>
          </View>

          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.actionIconButton}
              onPress={() => navigation.navigate('AddProduct', { product: item })}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="pencil-outline" size={18} color="#0284C7" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionIconButton}
              onPress={() => handleDeleteProduct(item)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product List</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddProduct')}>
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Connect Meta + Add Product Bar (matching screenshot) */}
      <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 10, backgroundColor: '#FFFFFF' }}>
        <TouchableOpacity
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            paddingVertical: 10,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#E2E8F0',
            backgroundColor: '#F8FAFC',
          }}
          onPress={() => navigation.navigate('WhatsAppConfig')}
        >
          <Ionicons name="link-outline" size={16} color="#0F172A" />
          <Text style={{ fontSize: 12.5, fontWeight: '700', color: '#0F172A' }}>Connect Meta</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            paddingVertical: 10,
            borderRadius: 12,
            backgroundColor: '#00875A',
          }}
          onPress={() => navigation.navigate('AddProduct')}
        >
          <Ionicons name="add" size={16} color="#FFFFFF" />
          <Text style={{ fontSize: 12.5, fontWeight: '700', color: '#FFFFFF' }}>Add Product</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or SKU..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Categories & Stock Status Filter Horizontal Bar */}
      <View style={styles.categoryBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {categoriesList.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryPill, isActive && styles.categoryPillActive]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[styles.categoryPillText, isActive && styles.categoryPillTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
          {['In Stock', 'Low Stock', 'Out of Stock'].map((st) => {
            const isActive = stockFilter === st;
            return (
              <TouchableOpacity
                key={st}
                style={[styles.categoryPill, isActive && { backgroundColor: '#0F172A' }]}
                onPress={() => setStockFilter(isActive ? 'All' : st)}
              >
                <Text style={[styles.categoryPillText, isActive && { color: '#FFFFFF' }]}>
                  {st}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Product List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#00B67A" />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item._id || item.sku || Math.random().toString()}
          renderItem={renderProductItem}
          contentContainerStyle={[
            styles.listContent,
            filteredProducts.length === 0 && { flex: 1, justifyContent: 'center' },
          ]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#00B67A']} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="cart-outline" size={44} color="#94A3B8" />
              </View>
              <Text style={styles.emptyTitle}>No products found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? 'No products match your search query.'
                  : 'Get started by creating your first product in the catalog.'}
              </Text>
              <TouchableOpacity style={styles.emptyActionBtn} onPress={openAddModal}>
                <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
                <Text style={styles.emptyActionText}>Add Product</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* Add / Edit Product Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalForm} showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Product Name *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Standard Subscription"
                value={name}
                onChangeText={setName}
              />

              <View style={styles.formRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.inputLabel}>SKU *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. PROD-001"
                    value={sku}
                    onChangeText={setSku}
                    autoCapitalize="characters"
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.inputLabel}>Category</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Electronics"
                    value={category}
                    onChangeText={setCategory}
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.inputLabel}>Selling Price (₹) *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="0.00"
                    keyboardType="numeric"
                    value={sellingPrice}
                    onChangeText={setSellingPrice}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.inputLabel}>Stock Quantity</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="0"
                    keyboardType="numeric"
                    value={currentStock}
                    onChangeText={setCurrentStock}
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Enter product details..."
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />

              <TouchableOpacity
                style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                onPress={handleSaveProduct}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveBtnText}>
                    {editingProduct ? 'Save Changes' : 'Create Product'}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingTop: Platform.OS === 'android' ? 36 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 15,
    minHeight: 62,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00B67A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  searchSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },
  categoryBar: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  categoryPillActive: {
    backgroundColor: '#00B67A',
  },
  categoryPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  productIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#E8F8F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  skuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  skuText: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  catBadge: {
    fontSize: 11,
    backgroundColor: '#F1F5F9',
    color: '#475569',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  descriptionText: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  priceLabel: {
    fontSize: 11,
    color: '#94A3B8',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  stockBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionIconButton: {
    padding: 4,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00B67A',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  emptyActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalForm: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
    marginTop: 10,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  saveBtn: {
    backgroundColor: '#00B67A',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
