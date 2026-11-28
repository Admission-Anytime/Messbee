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
import { inventoryService, commerceService } from '../../services/api';

const formatLogDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

export default function InventoryScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'low_stock' | 'out_of_stock' | 'logs'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Data states
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [outOfStockProducts, setOutOfStockProducts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [allProducts, setAllProducts] = useState([]);

  // Adjust Stock Modal state
  const [adjustModalVisible, setAdjustModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [newStockLevel, setNewStockLevel] = useState('');
  const [notes, setNotes] = useState('');
  const [savingAdjustment, setSavingAdjustment] = useState(false);

  const fetchAllInventoryData = useCallback(async () => {
    try {
      const [lowRes, outRes, logsRes, prodsRes] = await Promise.all([
        inventoryService.getLowStockAlerts(),
        inventoryService.getOutOfStock(),
        inventoryService.getInventoryLogs(1, 40),
        commerceService.getProducts(),
      ]);

      setLowStockProducts(Array.isArray(lowRes) ? lowRes : []);
      setOutOfStockProducts(Array.isArray(outRes) ? outRes : []);
      setLogs(Array.isArray(logsRes) ? logsRes : []);
      setAllProducts(Array.isArray(prodsRes) ? prodsRes : []);
    } catch (err) {
      console.warn('fetchAllInventoryData error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAllInventoryData();
    const unsub = navigation.addListener('focus', fetchAllInventoryData);
    return unsub;
  }, [fetchAllInventoryData, navigation]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAllInventoryData();
  };

  const openAdjustModal = (product = null) => {
    const target = product || allProducts[0] || null;
    setSelectedProduct(target);
    setNewStockLevel(target ? String(target.currentStock ?? target.stock ?? 0) : '0');
    setNotes('');
    setAdjustModalVisible(true);
  };

  const handleSaveAdjustment = async () => {
    if (!selectedProduct?._id) {
      Alert.alert('Selection Error', 'Please select a valid product.');
      return;
    }
    const parsedLevel = Number(newStockLevel);
    if (isNaN(parsedLevel) || parsedLevel < 0) {
      Alert.alert('Invalid Stock', 'Stock level must be a valid number 0 or greater.');
      return;
    }

    setSavingAdjustment(true);
    try {
      await inventoryService.adjustStock(
        selectedProduct._id,
        parsedLevel,
        notes || 'Stock adjustment via Mobile'
      );
      Alert.alert('Success', `Stock for "${selectedProduct.name}" updated to ${parsedLevel}.`);
      setAdjustModalVisible(false);
      fetchAllInventoryData();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || err.message || 'Failed to adjust stock.');
    } finally {
      setSavingAdjustment(false);
    }
  };

  // Stock card renderer (used for low stock & out of stock)
  const renderProductAlertCard = ({ item }) => {
    const isOut = (item.currentStock ?? item.stock ?? 0) <= 0;
    const catName = typeof item.category === 'object' ? item.category?.name : item.category;

    return (
      <TouchableOpacity
        style={[styles.alertCard, isOut && styles.alertCardCritical]}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('InventoryDetails', { product: item })}
      >
        <View style={styles.alertHeader}>
          <View style={[styles.iconBox, isOut ? styles.iconBoxCritical : styles.iconBoxWarning]}>
            <Ionicons
              name={isOut ? 'alert-circle' : 'warning-outline'}
              size={22}
              color={isOut ? '#EF4444' : '#F59E0B'}
            />
          </View>
          <View style={styles.alertProductInfo}>
            <Text style={styles.alertProductName} numberOfLines={1}>
              {item.name}
            </Text>
            <View style={styles.skuRow}>
              <Text style={styles.skuText}>SKU: {item.sku || 'N/A'}</Text>
              {catName && <Text style={styles.catBadge}>{catName}</Text>}
            </View>
          </View>
        </View>

        <View style={styles.alertMetricsRow}>
          <View>
            <Text style={styles.metricLabel}>Current Stock</Text>
            <Text style={[styles.metricValue, isOut ? styles.textCritical : styles.textWarning]}>
              {item.currentStock ?? item.stock ?? 0} {item.unit || 'pcs'}
            </Text>
          </View>
          <View>
            <Text style={styles.metricLabel}>Min. Stock</Text>
            <Text style={styles.metricValue}>{item.minimumStock ?? 10} {item.unit || 'pcs'}</Text>
          </View>

          <TouchableOpacity
            style={styles.adjustCardBtn}
            onPress={() => navigation.navigate('StockAdjustment', { product: item })}
            activeOpacity={0.8}
          >
            <Ionicons name="swap-vertical" size={15} color="#FFFFFF" />
            <Text style={styles.adjustCardBtnText}>Adjust</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  // Log item renderer
  const renderLogItem = ({ item }) => {
    const prodName = typeof item.product === 'object' ? item.product?.name : 'Product';
    const prodSku = typeof item.product === 'object' ? item.product?.sku : '';
    const diff = (item.newStock ?? 0) - (item.previousStock ?? 0);
    const isPositive = diff >= 0;

    return (
      <View style={styles.logCard}>
        <View style={styles.logHeader}>
          <View style={styles.logProdInfo}>
            <Text style={styles.logProdName} numberOfLines={1}>
              {prodName}
            </Text>
            {prodSku ? <Text style={styles.logSku}>SKU: {prodSku}</Text> : null}
          </View>
          <View style={[styles.diffBadge, isPositive ? styles.diffBadgePos : styles.diffBadgeNeg]}>
            <Text style={[styles.diffBadgeText, isPositive ? styles.diffTextPos : styles.diffTextNeg]}>
              {isPositive ? `+${diff}` : `${diff}`}
            </Text>
          </View>
        </View>

        <View style={styles.logBody}>
          <Text style={styles.logLevels}>
            {item.previousStock ?? 0} → {item.newStock ?? 0} ({item.type || 'adjustment'})
          </Text>
          {item.notes ? <Text style={styles.logNotes}>{item.notes}</Text> : null}
        </View>

        <View style={styles.logFooter}>
          <Ionicons name="time-outline" size={12} color="#94A3B8" />
          <Text style={styles.logDateText}>{formatLogDate(item.createdAt)}</Text>
        </View>
      </View>
    );
  };

  const currentListData = useMemo(() => {
    if (activeTab === 'all') return allProducts;
    if (activeTab === 'low_stock') return lowStockProducts;
    if (activeTab === 'out_of_stock') return outOfStockProducts;
    return logs;
  }, [activeTab, allProducts, lowStockProducts, outOfStockProducts, logs]);

  const estRevenue = useMemo(() => {
    return allProducts.reduce(
      (sum, p) => sum + (Number(p.sellingPrice ?? p.price ?? 0) * Number(p.currentStock ?? p.stock ?? 0)),
      0
    );
  }, [allProducts]);

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
        <Text style={styles.headerTitle}>Inventory Management</Text>
        <TouchableOpacity
          style={styles.headerActionBtn}
          onPress={() => navigation.navigate('StockAdjustment', { product: allProducts[0] || null })}
        >
          <Ionicons name="swap-vertical" size={18} color="#FFFFFF" />
          <Text style={styles.headerActionText}>Adjust</Text>
        </TouchableOpacity>
      </View>

      {/* Summary KPI Strip (Total Products, Out of Stock, Est. Revenue) */}
      <View style={styles.kpiStrip}>
        <TouchableOpacity
          style={[styles.kpiCard, activeTab === 'all' && styles.kpiCardActive]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={styles.kpiLabel}>Total Products</Text>
          <Text style={[styles.kpiNumber, { color: '#0F172A' }]}>
            {allProducts.length}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.kpiCard, activeTab === 'out_of_stock' && styles.kpiCardActive]}
          onPress={() => setActiveTab('out_of_stock')}
        >
          <Text style={styles.kpiLabel}>Out of Stock</Text>
          <Text style={[styles.kpiNumber, { color: '#EF4444' }]}>
            {outOfStockProducts.length}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.kpiCard, activeTab === 'logs' && styles.kpiCardActive]}
          onPress={() => setActiveTab('logs')}
        >
          <Text style={styles.kpiLabel}>Est. Value</Text>
          <Text style={[styles.kpiNumber, { color: '#00875A', fontSize: 16 }]}>
            ₹{estRevenue >= 100000 ? `${(estRevenue / 100000).toFixed(1)}L` : estRevenue.toLocaleString('en-IN')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.tabActive]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
            All ({allProducts.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'low_stock' && styles.tabActive]}
          onPress={() => setActiveTab('low_stock')}
        >
          <Text style={[styles.tabText, activeTab === 'low_stock' && styles.tabTextActive]}>
            Low ({lowStockProducts.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'out_of_stock' && styles.tabActive]}
          onPress={() => setActiveTab('out_of_stock')}
        >
          <Text style={[styles.tabText, activeTab === 'out_of_stock' && styles.tabTextActive]}>
            Out ({outOfStockProducts.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'logs' && styles.tabActive]}
          onPress={() => setActiveTab('logs')}
        >
          <Text style={[styles.tabText, activeTab === 'logs' && styles.tabTextActive]}>
            Logs
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#00B67A" />
          <Text style={styles.loadingText}>Loading inventory records...</Text>
        </View>
      ) : (
        <FlatList
          data={currentListData}
          keyExtractor={(item, idx) => item._id || String(idx)}
          renderItem={activeTab === 'logs' ? renderLogItem : renderProductAlertCard}
          contentContainerStyle={[
            styles.listContent,
            currentListData.length === 0 && { flex: 1, justifyContent: 'center' },
          ]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#00B67A']} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons
                  name={activeTab === 'logs' ? 'clipboard-outline' : 'checkmark-circle-outline'}
                  size={44}
                  color={activeTab === 'logs' ? '#94A3B8' : '#10B981'}
                />
              </View>
              <Text style={styles.emptyTitle}>
                {activeTab === 'low_stock'
                  ? 'No Low Stock Alerts'
                  : activeTab === 'out_of_stock'
                  ? 'No Out of Stock Products'
                  : 'No Inventory Movement Logs'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {activeTab === 'logs'
                  ? 'Stock adjustments, purchases, and orders will record audit history here.'
                  : 'All inventory stock levels are healthy and within optimal thresholds!'}
              </Text>
            </View>
          }
        />
      )}

      {/* Adjust Stock Modal */}
      <Modal
        visible={adjustModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAdjustModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Adjust Stock Level</Text>
              <TouchableOpacity onPress={() => setAdjustModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalForm} showsVerticalScrollIndicator={false}>
              {/* Product Selector */}
              <Text style={styles.inputLabel}>Select Product</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.prodPillsScroll}
              >
                {allProducts.map((p) => {
                  const isSelected = selectedProduct?._id === p._id;
                  return (
                    <TouchableOpacity
                      key={p._id}
                      style={[styles.prodPill, isSelected && styles.prodPillSelected]}
                      onPress={() => {
                        setSelectedProduct(p);
                        setNewStockLevel(String(p.currentStock ?? p.stock ?? 0));
                      }}
                    >
                      <Text
                        style={[styles.prodPillText, isSelected && styles.prodPillTextSelected]}
                        numberOfLines={1}
                      >
                        {p.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {selectedProduct ? (
                <View style={styles.selectedProdBanner}>
                  <Text style={styles.selectedProdTitle}>{selectedProduct.name}</Text>
                  <Text style={styles.selectedProdDetails}>
                    SKU: {selectedProduct.sku} | Current Stock: {selectedProduct.currentStock ?? selectedProduct.stock ?? 0}
                  </Text>
                </View>
              ) : null}

              {/* New Stock Input */}
              <Text style={styles.inputLabel}>New Stock Level *</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={newStockLevel}
                onChangeText={setNewStockLevel}
                placeholder="Enter new quantity"
              />

              {/* Notes Input */}
              <Text style={styles.inputLabel}>Adjustment Notes / Reason</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="e.g. Received new shipment, stock count correction..."
                multiline
                numberOfLines={3}
              />

              <TouchableOpacity
                style={[styles.saveBtn, savingAdjustment && styles.saveBtnDisabled]}
                onPress={handleSaveAdjustment}
                disabled={savingAdjustment}
              >
                {savingAdjustment ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveBtnText}>Confirm Stock Adjustment</Text>
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
  headerActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  headerActionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  kpiStrip: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  kpiCardActive: {
    borderColor: '#00B67A',
    backgroundColor: '#F0FDF4',
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
  },
  kpiNumber: {
    fontSize: 18,
    fontWeight: '800',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#00B67A',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#00B67A',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  alertCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  alertCardCritical: {
    borderColor: '#FECDD3',
    backgroundColor: '#FFF1F2',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconBoxWarning: {
    backgroundColor: '#FEF3C7',
  },
  iconBoxCritical: {
    backgroundColor: '#FEE2E2',
  },
  alertProductInfo: {
    flex: 1,
  },
  alertProductName: {
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
    backgroundColor: '#FFFFFF',
    color: '#475569',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  alertMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  metricLabel: {
    fontSize: 11,
    color: '#94A3B8',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  textWarning: {
    color: '#D97706',
  },
  textCritical: {
    color: '#DC2626',
  },
  adjustCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00B67A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  adjustCardBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  // Logs
  logCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  logProdInfo: {
    flex: 1,
    marginRight: 10,
  },
  logProdName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  logSku: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  diffBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  diffBadgePos: {
    backgroundColor: '#D1FAE5',
  },
  diffBadgeNeg: {
    backgroundColor: '#FEE2E2',
  },
  diffBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  diffTextPos: {
    color: '#059669',
  },
  diffTextNeg: {
    color: '#DC2626',
  },
  logBody: {
    marginBottom: 8,
  },
  logLevels: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
  },
  logNotes: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
    fontStyle: 'italic',
  },
  logFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  logDateText: {
    fontSize: 11,
    color: '#94A3B8',
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
  },
  // Modal
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
  prodPillsScroll: {
    gap: 8,
    paddingVertical: 6,
  },
  prodPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  prodPillSelected: {
    backgroundColor: '#00B67A',
    borderColor: '#00B67A',
  },
  prodPillText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  prodPillTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  selectedProdBanner: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#00B67A',
  },
  selectedProdTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  selectedProdDetails: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
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
