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
import {
  billingService,
  salesService,
  commerceService,
  customerService,
  authService,
} from '../../services/api';

const formatInvoiceDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export default function BillingInvoicesScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('invoices'); // 'invoices' | 'transactions'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Data states
  const [currentUser, setCurrentUser] = useState(null);
  const [salesList, setSalesList] = useState([]);
  const [transactionsList, setTransactionsList] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [customersList, setCustomersList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Top Up Modal State
  const [topUpModalVisible, setTopUpModalVisible] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('1000');
  const [savingTopUp, setSavingTopUp] = useState(false);

  // New Invoice Modal State
  const [invoiceModalVisible, setInvoiceModalVisible] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [discount, setDiscount] = useState('0');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [paymentStatus, setPaymentStatus] = useState('paid');
  const [savingInvoice, setSavingInvoice] = useState(false);

  const fetchAllData = useCallback(async () => {
    try {
      const [userData, salesData, txnsData, prodsData, custData] = await Promise.all([
        authService.getCurrentUser().catch(() => null),
        salesService.getSales().catch(() => []),
        billingService.getTransactions().catch(() => []),
        commerceService.getProducts().catch(() => []),
        customerService.getCustomers().catch(() => []),
      ]);

      if (userData) {
        setCurrentUser(userData?.data || userData?.user || userData);
      }
      setSalesList(Array.isArray(salesData) ? salesData : []);
      setTransactionsList(Array.isArray(txnsData) ? txnsData : []);
      setProductsList(Array.isArray(prodsData) ? prodsData : []);
      setCustomersList(Array.isArray(custData) ? custData : []);
    } catch (err) {
      console.warn('BillingInvoices fetchAllData error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAllData();
  };

  // Top Up Handlers
  const handleTopUpSubmit = async () => {
    const amountNum = Number(topUpAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid recharge amount.');
      return;
    }

    setSavingTopUp(true);
    try {
      const desc = `WCC Top-Up Credit (₹${amountNum})`;
      await billingService.createTransaction({
        desc,
        amount: amountNum,
        status: 'Paid',
        wccAmount: amountNum,
      });

      Alert.alert('Recharge Successful', `₹${amountNum} top-up completed successfully!`);
      setTopUpModalVisible(false);
      fetchAllData();
    } catch (err) {
      Alert.alert('Top-Up Notice', err.response?.data?.message || err.message || 'Payment processing error.');
    } finally {
      setSavingTopUp(false);
    }
  };

  // New Invoice Handlers
  const openNewInvoiceModal = () => {
    if (customersList.length > 0) {
      setSelectedCustomerId(customersList[0]._id);
    }
    if (productsList.length > 0) {
      setSelectedProductId(productsList[0]._id);
    }
    setQuantity('1');
    setDiscount('0');
    setPaymentMethod('upi');
    setPaymentStatus('paid');
    setInvoiceModalVisible(true);
  };

  const handleCreateInvoice = async () => {
    if (!selectedCustomerId) {
      Alert.alert('Customer Required', 'Please select or add a customer.');
      return;
    }
    if (!selectedProductId) {
      Alert.alert('Product Required', 'Please select a product for the invoice.');
      return;
    }

    const targetProduct = productsList.find((p) => p._id === selectedProductId);
    if (!targetProduct) {
      Alert.alert('Error', 'Selected product was not found.');
      return;
    }

    const qty = Number(quantity);
    if (!quantity.trim() || isNaN(qty) || qty < 1) {
      Alert.alert('Validation Error', 'Quantity must be at least 1.');
      return;
    }
    const unitPrice = Number(targetProduct.sellingPrice ?? targetProduct.price ?? 0);
    const subTotal = unitPrice * qty;
    const disc = Number(discount) || 0;
    if (disc < 0) {
      Alert.alert('Validation Error', 'Discount cannot be negative.');
      return;
    }
    const taxRate = Number(targetProduct.gstPercentage ?? 18);
    const gstAmount = Math.round((subTotal * taxRate) / 100);
    const grandTotal = Math.max(0, subTotal + gstAmount - disc);

    const payload = {
      customer: selectedCustomerId,
      products: [
        {
          product: targetProduct._id,
          quantity: qty,
          unitPrice,
          gstPercentage: taxRate,
          gstAmount,
          totalAmount: subTotal + gstAmount,
        },
      ],
      subTotal,
      totalTax: gstAmount,
      discount: disc,
      grandTotal,
      paidAmount: paymentStatus === 'paid' ? grandTotal : 0,
      balanceAmount: paymentStatus === 'paid' ? 0 : grandTotal,
      paymentMethod,
      paymentStatus,
      salesDate: new Date().toISOString(),
    };

    setSavingInvoice(true);
    try {
      await salesService.createSale(payload);
      Alert.alert('Success', 'Sales invoice created successfully!');
      setInvoiceModalVisible(false);
      fetchAllData();
    } catch (err) {
      Alert.alert('Invoice Error', err.response?.data?.message || err.message || 'Failed to create invoice.');
    } finally {
      setSavingInvoice(false);
    }
  };

  // Filtered sales
  const filteredSales = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return salesList;
    return salesList.filter((s) => {
      const invNum = s.invoiceNumber ? s.invoiceNumber.toLowerCase() : '';
      const custName =
        typeof s.customer === 'object' && s.customer?.customerName
          ? s.customer.customerName.toLowerCase()
          : '';
      return invNum.includes(q) || custName.includes(q);
    });
  }, [salesList, searchQuery]);

  // Render Sales Invoice Card
  const renderInvoiceCard = ({ item }) => {
    const custName = typeof item.customer === 'object' ? item.customer?.customerName : 'Direct Customer';
    const custPhone = typeof item.customer === 'object' ? item.customer?.mobile : '';
    const isPaid = (item.paymentStatus || '').toLowerCase() === 'paid';
    const isPending = (item.paymentStatus || '').toLowerCase() === 'pending';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.invNumberRow}>
            <View style={styles.invIconBox}>
              <Ionicons name="receipt-outline" size={20} color="#00B67A" />
            </View>
            <View>
              <Text style={styles.invoiceNumber}>{item.invoiceNumber || 'INV-0000'}</Text>
              <Text style={styles.invoiceDate}>{formatInvoiceDate(item.salesDate || item.createdAt)}</Text>
            </View>
          </View>

          <View
            style={[
              styles.statusBadge,
              isPaid ? styles.statusPaid : isPending ? styles.statusPending : styles.statusPartial,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                isPaid ? styles.statusTextPaid : isPending ? styles.statusTextPending : styles.statusTextPartial,
              ]}
            >
              {(item.paymentStatus || 'Paid').toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.customerNameText}>{custName}</Text>
          {custPhone ? <Text style={styles.customerPhoneText}>{custPhone}</Text> : null}
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.methodBadge}>
            <Text style={styles.methodBadgeText}>
              {(item.paymentMethod || 'UPI').toUpperCase()}
            </Text>
          </View>

          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Total</Text>
            <Text style={styles.amountValue}>
              ₹{Number(item.grandTotal ?? item.subTotal ?? 0).toLocaleString('en-IN')}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // Render Transaction Card
  const renderTransactionCard = ({ item }) => {
    const isPaid = (item.status || '').toLowerCase() === 'paid';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.invNumberRow}>
            <View style={[styles.invIconBox, { backgroundColor: '#F1F5F9' }]}>
              <Ionicons name="card-outline" size={20} color="#0284C7" />
            </View>
            <View>
              <Text style={styles.invoiceNumber}>{item.transactionId || 'TXN-00000000'}</Text>
              <Text style={styles.invoiceDate}>{formatInvoiceDate(item.date || item.createdAt)}</Text>
            </View>
          </View>

          <View style={[styles.statusBadge, isPaid ? styles.statusPaid : styles.statusPending]}>
            <Text style={[styles.statusText, isPaid ? styles.statusTextPaid : styles.statusTextPending]}>
              {(item.status || 'Paid').toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={styles.txDescriptionText} numberOfLines={2}>
          {item.desc || 'Billing Statement / Credit Recharge'}
        </Text>

        <View style={styles.cardFooter}>
          <Text style={styles.txnTypeLabel}>Statement Record</Text>
          <Text style={styles.amountValue}>
            ₹{Number(item.amount || 0).toLocaleString('en-IN')}
          </Text>
        </View>
      </View>
    );
  };

  const walletCredits = currentUser?.credits !== undefined ? currentUser.credits : 500;

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
        <Text style={styles.headerTitle}>Billing & Invoices</Text>
        <TouchableOpacity style={styles.addInvoiceBtn} onPress={openNewInvoiceModal}>
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.addInvoiceBtnText}>Invoice</Text>
        </TouchableOpacity>
      </View>

      {/* Wallet / Credit Balance Card */}
      <View style={styles.walletContainer}>
        <View style={styles.walletLeft}>
          <Text style={styles.walletLabel}>WCC Wallet Credits</Text>
          <Text style={styles.walletAmount}>₹{Number(walletCredits).toLocaleString('en-IN')}</Text>
          <Text style={styles.planSubtext}>
            Plan: {currentUser?.plan ? currentUser.plan.toUpperCase() : 'GROWTH BUSINESS'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.topUpBtn}
          onPress={() => setTopUpModalVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="wallet-outline" size={16} color="#FFFFFF" />
          <Text style={styles.topUpBtnText}>Top-Up</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'invoices' && styles.tabActive]}
          onPress={() => setActiveTab('invoices')}
        >
          <Text style={[styles.tabText, activeTab === 'invoices' && styles.tabTextActive]}>
            Sales Invoices ({salesList.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'transactions' && styles.tabActive]}
          onPress={() => setActiveTab('transactions')}
        >
          <Text style={[styles.tabText, activeTab === 'transactions' && styles.tabTextActive]}>
            Transactions ({transactionsList.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar (Only shown for Invoices tab) */}
      {activeTab === 'invoices' && (
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by invoice # or customer..."
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
      )}

      {/* List Content */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#00B67A" />
          <Text style={styles.loadingText}>Loading records...</Text>
        </View>
      ) : (
        <FlatList
          data={activeTab === 'invoices' ? filteredSales : transactionsList}
          keyExtractor={(item, idx) => item._id || item.transactionId || String(idx)}
          renderItem={activeTab === 'invoices' ? renderInvoiceCard : renderTransactionCard}
          contentContainerStyle={[
            styles.listContent,
            (activeTab === 'invoices' ? filteredSales : transactionsList).length === 0 && {
              flex: 1,
              justifyContent: 'center',
            },
          ]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#00B67A']} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons
                  name={activeTab === 'invoices' ? 'receipt-outline' : 'card-outline'}
                  size={44}
                  color="#94A3B8"
                />
              </View>
              <Text style={styles.emptyTitle}>
                {activeTab === 'invoices' ? 'No sales invoices yet' : 'No billing transactions'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {activeTab === 'invoices'
                  ? 'Generate customer sales invoices with product items and tax calculation.'
                  : 'Your account payment statements and credit top-up history will appear here.'}
              </Text>
              {activeTab === 'invoices' && (
                <TouchableOpacity style={styles.emptyActionBtn} onPress={openNewInvoiceModal}>
                  <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.emptyActionText}>Create First Invoice</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}

      {/* Top-Up Modal */}
      <Modal
        visible={topUpModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setTopUpModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Recharge WCC Credits</Text>
              <TouchableOpacity onPress={() => setTopUpModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalForm}>
              <Text style={styles.inputLabel}>Select Top-Up Amount (₹)</Text>
              <View style={styles.presetRow}>
                {['500', '1000', '2500', '5000'].map((amt) => {
                  const isSel = topUpAmount === amt;
                  return (
                    <TouchableOpacity
                      key={amt}
                      style={[styles.presetBtn, isSel && styles.presetBtnActive]}
                      onPress={() => setTopUpAmount(amt)}
                    >
                      <Text style={[styles.presetBtnText, isSel && styles.presetBtnTextActive]}>
                        ₹{amt}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.inputLabel}>Or Enter Custom Amount</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={topUpAmount}
                onChangeText={setTopUpAmount}
                placeholder="Enter amount in ₹"
              />

              <TouchableOpacity
                style={[styles.saveBtn, savingTopUp && styles.saveBtnDisabled]}
                onPress={handleTopUpSubmit}
                disabled={savingTopUp}
              >
                {savingTopUp ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveBtnText}>Proceed to Recharge (₹{topUpAmount})</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Create Sales Invoice Modal */}
      <Modal
        visible={invoiceModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setInvoiceModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Sales Invoice</Text>
              <TouchableOpacity onPress={() => setInvoiceModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalForm} showsVerticalScrollIndicator={false}>
              {/* Customer Selector */}
              <Text style={styles.inputLabel}>Select Customer *</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.prodPillsScroll}
              >
                {customersList.map((c) => {
                  const isSel = selectedCustomerId === c._id;
                  return (
                    <TouchableOpacity
                      key={c._id}
                      style={[styles.prodPill, isSel && styles.prodPillSelected]}
                      onPress={() => setSelectedCustomerId(c._id)}
                    >
                      <Text style={[styles.prodPillText, isSel && styles.prodPillTextSelected]}>
                        {c.customerName || 'Customer'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Product Selector */}
              <Text style={styles.inputLabel}>Select Product *</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.prodPillsScroll}
              >
                {productsList.map((p) => {
                  const isSel = selectedProductId === p._id;
                  return (
                    <TouchableOpacity
                      key={p._id}
                      style={[styles.prodPill, isSel && styles.prodPillSelected]}
                      onPress={() => setSelectedProductId(p._id)}
                    >
                      <Text style={[styles.prodPillText, isSel && styles.prodPillTextSelected]}>
                        {p.name} (₹{p.sellingPrice ?? p.price ?? 0})
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Quantity & Discount */}
              <View style={styles.formRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.inputLabel}>Quantity</Text>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="numeric"
                    value={quantity}
                    onChangeText={setQuantity}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.inputLabel}>Discount (₹)</Text>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="numeric"
                    value={discount}
                    onChangeText={setDiscount}
                  />
                </View>
              </View>

              {/* Payment Method */}
              <Text style={styles.inputLabel}>Payment Method</Text>
              <View style={styles.presetRow}>
                {['upi', 'cash', 'card', 'bank'].map((m) => {
                  const isSel = paymentMethod === m;
                  return (
                    <TouchableOpacity
                      key={m}
                      style={[styles.presetBtn, isSel && styles.presetBtnActive]}
                      onPress={() => setPaymentMethod(m)}
                    >
                      <Text style={[styles.presetBtnText, isSel && styles.presetBtnTextActive]}>
                        {m.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Payment Status */}
              <Text style={styles.inputLabel}>Payment Status</Text>
              <View style={styles.presetRow}>
                {['paid', 'pending'].map((s) => {
                  const isSel = paymentStatus === s;
                  return (
                    <TouchableOpacity
                      key={s}
                      style={[styles.presetBtn, isSel && styles.presetBtnActive]}
                      onPress={() => setPaymentStatus(s)}
                    >
                      <Text style={[styles.presetBtnText, isSel && styles.presetBtnTextActive]}>
                        {s.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                style={[styles.saveBtn, savingInvoice && styles.saveBtnDisabled]}
                onPress={handleCreateInvoice}
                disabled={savingInvoice}
              >
                {savingInvoice ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveBtnText}>Generate Sales Invoice</Text>
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
  },
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
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  addInvoiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00B67A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  addInvoiceBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  walletContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
    margin: 16,
    padding: 16,
    borderRadius: 14,
  },
  walletLeft: {
    flex: 1,
  },
  walletLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '500',
  },
  walletAmount: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    marginVertical: 4,
  },
  planSubtext: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '600',
  },
  topUpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00B67A',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  topUpBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
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
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#00B67A',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#00B67A',
  },
  searchSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 38,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
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
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  invNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  invIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#E8F8F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  invoiceNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  invoiceDate: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusPaid: {
    backgroundColor: '#D1FAE5',
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
  },
  statusPartial: {
    backgroundColor: '#E0F2FE',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusTextPaid: {
    color: '#059669',
  },
  statusTextPending: {
    color: '#D97706',
  },
  statusTextPartial: {
    color: '#0284C7',
  },
  cardBody: {
    marginVertical: 4,
  },
  customerNameText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  customerPhoneText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  txDescriptionText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginVertical: 6,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  methodBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  methodBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  txnTypeLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amountLabel: {
    fontSize: 10,
    color: '#94A3B8',
  },
  amountValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
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
  presetRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 8,
  },
  presetBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  presetBtnActive: {
    backgroundColor: '#00B67A',
    borderColor: '#00B67A',
  },
  presetBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  presetBtnTextActive: {
    color: '#FFFFFF',
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
