import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Share,
  Alert,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { commerceService } from '../../services/api';
import QuickBottomBar from '../../components/QuickBottomBar';

const STATUS_TABS = ['All', 'Success', 'Pending', 'Failed', 'Refunded'];

const normalizeStatus = (raw) => {
  const s = String(raw || 'pending').toLowerCase();
  if (['success', 'paid', 'completed', 'captured'].includes(s)) return 'Success';
  if (['failed', 'error', 'declined'].includes(s)) return 'Failed';
  if (['refunded', 'refund'].includes(s)) return 'Refunded';
  return 'Pending';
};

const getStatusStyle = (status) => {
  switch (status) {
    case 'Success':
      return { bg: '#DCFCE7', text: '#15803D', dot: '#16A34A' };
    case 'Failed':
      return { bg: '#FEE2E2', text: '#B91C1C', dot: '#DC2626' };
    case 'Refunded':
      return { bg: '#EDE9FE', text: '#6D28D9', dot: '#7C3AED' };
    default:
      return { bg: '#FEF3C7', text: '#B45309', dot: '#D97706' };
  }
};

export default function PaymentListScreen({ navigation }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Download Report Modal State
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportStatus, setReportStatus] = useState('All');
  const [reportFormat, setReportFormat] = useState('CSV');

  const fetchPayments = useCallback(async () => {
    try {
      const list = await commerceService.getPayments();
      setPayments(Array.isArray(list) ? list : []);
    } catch (err) {
      console.warn('PaymentList fetch error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
    const unsub = navigation.addListener('focus', fetchPayments);
    return unsub;
  }, [fetchPayments, navigation]);

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const norm = normalizeStatus(p.status);
      if (statusFilter !== 'All' && norm !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const name = String(p.customerName || p.customer || '').toLowerCase();
        const txId = String(p.transactionId || p.paymentId || p._id || '').toLowerCase();
        const orderId = String(p.orderId || '').toLowerCase();
        const product = String(p.productName || p.product || '').toLowerCase();
        return name.includes(q) || txId.includes(q) || orderId.includes(q) || product.includes(q);
      }
      return true;
    });
  }, [payments, statusFilter, searchQuery]);

  const reportMatches = useMemo(() => {
    if (reportStatus === 'All') return payments;
    return payments.filter((p) => normalizeStatus(p.status) === reportStatus);
  }, [payments, reportStatus]);

  const handleGenerateReport = async () => {
    if (reportMatches.length === 0) {
      Alert.alert('No Transactions', 'No payment records match the selected filter.');
      return;
    }

    const header = 'Transaction ID,Order ID,Customer,Product,Method,Amount,Status,Date';
    const rows = reportMatches.map((p) => {
      const txId = p.transactionId || p._id || '';
      const orderId = p.orderId || '';
      const cust = (p.customerName || p.customer || 'Customer').replace(/,/g, ' ');
      const prod = (p.productName || p.product || 'Order').replace(/,/g, ' ');
      const method = (p.paymentMethod || p.method || 'UPI').replace(/,/g, ' ');
      const amt = Number(p.amount || p.total || 0);
      const st = normalizeStatus(p.status);
      const dt = p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '';
      return `${txId},${orderId},${cust},${prod},${method},${amt},${st},${dt}`;
    });

    const content =
      reportFormat === 'CSV'
        ? [header, ...rows].join('\n')
        : `MessBee Payment Report (${reportStatus})\nTotal Transactions: ${reportMatches.length}\nTotal Amount: ₹${reportMatches
            .reduce((s, p) => s + Number(p.amount || p.total || 0), 0)
            .toLocaleString('en-IN')}\n\n` + rows.join('\n');

    try {
      await Share.share({
        title: `MessBee Payment Report (${reportFormat})`,
        message: content,
      });
      setShowReportModal(false);
    } catch (err) {
      Alert.alert('Export Error', err?.message || 'Unable to share report.');
    }
  };

  const renderPaymentCard = ({ item }) => {
    const normStatus = normalizeStatus(item.status);
    const badge = getStatusStyle(normStatus);
    const customerName = item.customerName || item.customer || 'Customer';
    const initials = customerName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join('') || 'CU';
    const txCode = item.transactionId || item.paymentId || `MBP-${String(item._id || '').slice(-6).toUpperCase()}`;
    const amount = Number(item.amount || item.total || 0);
    const dateText = item.createdAt
      ? new Date(item.createdAt).toLocaleString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
      : '';

    return (
      <TouchableOpacity
        style={styles.paymentCard}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('PaymentDetails', { payment: item })}
      >
        <View style={styles.cardTopRow}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.customerName} numberOfLines={1}>{customerName}</Text>
            <Text style={styles.txMeta} numberOfLines={1}>
              {txCode}{item.orderId ? ` · ${item.orderId}` : ''}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.amountText}>₹{amount.toLocaleString('en-IN')}</Text>
            <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
              <View style={[styles.statusDot, { backgroundColor: badge.dot }]} />
              <Text style={[styles.statusBadgeText, { color: badge.text }]}>{normStatus}</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.cardBottomRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.metaLabel}>Product</Text>
            <Text style={styles.metaVal} numberOfLines={1}>{item.productName || item.product || 'Order Payment'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.metaLabel}>Method</Text>
            <Text style={styles.metaVal} numberOfLines={1}>{item.paymentMethod || item.method || 'Online'}</Text>
          </View>
        </View>

        <View style={styles.cardFooterRow}>
          <Text style={styles.dateText}>{dateText}</Text>
          <Text style={styles.viewDetailsLink}>View details ›</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={styles.headerTitle}>Payment List</Text>
          <Text style={styles.headerSub}>Track transactions, amounts and order status</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('DownloadReport')} style={styles.iconBtn}>
          <Ionicons name="download-outline" size={20} color="#00875A" />
        </TouchableOpacity>
      </View>

      {/* Search & Status Tabs */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search transaction, customer or order ID"
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          horizontal
          data={STATUS_TABS}
          keyExtractor={(i) => i}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsRow}
          renderItem={({ item }) => {
            const active = statusFilter === item;
            return (
              <TouchableOpacity
                style={[styles.tabPill, active && styles.tabPillActive]}
                onPress={() => setStatusFilter(item)}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>{item}</Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <View style={styles.countRow}>
        <Text style={styles.countText}>{filteredPayments.length} transactions</Text>
        <TouchableOpacity onPress={() => setShowReportModal(true)}>
          <Text style={styles.exportText}>Download report</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredPayments}
        keyExtractor={(item, idx) => String(item._id || item.id || idx)}
        renderItem={renderPaymentCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchPayments();
            }}
            colors={['#00875A']}
          />
        }
        ListEmptyComponent={
          loading ? (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#00875A" />
            </View>
          ) : (
            <View style={{ paddingVertical: 50, alignItems: 'center', paddingHorizontal: 24 }}>
              <Ionicons name="receipt-outline" size={40} color="#94A3B8" />
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#0F172A', marginTop: 10 }}>
                No payments found
              </Text>
              <Text style={{ fontSize: 13, color: '#64748B', textAlign: 'center', marginTop: 4 }}>
                Customer payments and WhatsApp commerce orders will appear here once recorded.
              </Text>
            </View>
          )
        }
      />

      {/* Download Report Modal */}
      <Modal visible={showReportModal} transparent animationType="slide" onRequestClose={() => setShowReportModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Download Report</Text>
                <Text style={styles.modalSub}>Export payment transaction data</Text>
              </View>
              <TouchableOpacity onPress={() => setShowReportModal(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Payment status</Text>
            <View style={styles.modalChipRow}>
              {STATUS_TABS.map((st) => (
                <TouchableOpacity
                  key={st}
                  style={[styles.tabPill, reportStatus === st && styles.tabPillActive]}
                  onPress={() => setReportStatus(st)}
                >
                  <Text style={[styles.tabText, reportStatus === st && styles.tabTextActive]}>{st}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.modalLabel, { marginTop: 14 }]}>File format</Text>
            <View style={styles.modalChipRow}>
              {['CSV', 'Summary'].map((fmt) => (
                <TouchableOpacity
                  key={fmt}
                  style={[styles.tabPill, reportFormat === fmt && styles.tabPillActive]}
                  onPress={() => setReportFormat(fmt)}
                >
                  <Text style={[styles.tabText, reportFormat === fmt && styles.tabTextActive]}>{fmt}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.summaryBox}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryKey}>Transactions</Text>
                <Text style={styles.summaryVal}>{reportMatches.length}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryKey}>Total Amount</Text>
                <Text style={styles.summaryVal}>
                  ₹{reportMatches.reduce((s, p) => s + Number(p.amount || p.total || 0), 0).toLocaleString('en-IN')}
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.downloadBtn} onPress={handleGenerateReport} activeOpacity={0.85}>
              <Ionicons name="download-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.downloadBtnText}>Generate & Download</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <QuickBottomBar navigation={navigation} activeTab="Home" />
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
    paddingHorizontal: 16,
    paddingVertical: 15,
    minHeight: 62,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  headerSub: { fontSize: 12, color: '#64748B', marginTop: 1 },
  searchWrap: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13.5,
    color: '#0F172A',
  },
  tabsRow: {
    paddingTop: 10,
    gap: 8,
  },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  tabPillActive: {
    backgroundColor: '#00875A',
  },
  tabText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  tabTextActive: { color: '#FFFFFF' },
  countRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  countText: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  exportText: { fontSize: 12, fontWeight: '700', color: '#00875A' },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  paymentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTopRow: { flexDirection: 'row', alignItems: 'center' },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 13, fontWeight: '800', color: '#00875A' },
  customerName: { fontSize: 14.5, fontWeight: '700', color: '#0F172A' },
  txMeta: { fontSize: 11.5, color: '#64748B', marginTop: 1 },
  amountText: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 4,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  statusBadgeText: { fontSize: 10.5, fontWeight: '700' },
  cardDivider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 10 },
  cardBottomRow: { flexDirection: 'row', gap: 12 },
  metaLabel: { fontSize: 10.5, color: '#94A3B8', fontWeight: '600' },
  metaVal: { fontSize: 12.5, color: '#334155', fontWeight: '600', marginTop: 2 },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  dateText: { fontSize: 11, color: '#94A3B8' },
  viewDetailsLink: { fontSize: 12, fontWeight: '700', color: '#00875A' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 28,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 17, fontWeight: '800', color: '#0F172A' },
  modalSub: { fontSize: 12, color: '#64748B', marginTop: 2 },
  modalLabel: { fontSize: 12.5, fontWeight: '700', color: '#334155', marginBottom: 8 },
  modalChipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  summaryBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 3 },
  summaryKey: { fontSize: 12.5, color: '#64748B' },
  summaryVal: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00875A',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 18,
  },
  downloadBtnText: { fontSize: 14.5, fontWeight: '700', color: '#FFFFFF' },
});
