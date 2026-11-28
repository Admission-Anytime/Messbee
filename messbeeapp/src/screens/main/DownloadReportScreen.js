import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Share,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { commerceService } from '../../services/api';
import QuickBottomBar from '../../components/QuickBottomBar';

const STATUS_OPTIONS = ['All Status', 'Success', 'Pending', 'Failed', 'Refunded'];
const FORMAT_OPTIONS = ['CSV (Excel)', 'JSON'];

export default function DownloadReportScreen({ navigation }) {
  const todayStr = new Date().toISOString().split('T')[0];
  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];

  const [fromDate, setFromDate] = useState(monthAgo);
  const [toDate, setToDate] = useState(todayStr);
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [format, setFormat] = useState('CSV (Excel)');
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showStatusList, setShowStatusList] = useState(false);
  const [showFormatList, setShowFormatList] = useState(false);

  useEffect(() => {
    commerceService
      .getPayments()
      .then((list) => setPayments(Array.isArray(list) ? list : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return payments.filter((p) => {
      const st = String(p.status || 'pending').toLowerCase();
      if (statusFilter !== 'All Status') {
        if (statusFilter === 'Success' && !['success', 'paid', 'completed', 'captured'].includes(st)) return false;
        if (statusFilter === 'Pending' && st !== 'pending') return false;
        if (statusFilter === 'Failed' && !['failed', 'error', 'declined'].includes(st)) return false;
        if (statusFilter === 'Refunded' && !['refunded', 'refund'].includes(st)) return false;
      }
      if (p.createdAt) {
        const dStr = new Date(p.createdAt).toISOString().split('T')[0];
        if (fromDate && dStr < fromDate) return false;
        if (toDate && dStr > toDate) return false;
      }
      return true;
    });
  }, [payments, statusFilter, fromDate, toDate]);

  const totalAmount = useMemo(
    () => filtered.reduce((sum, p) => sum + Number(p.amount || p.total || 0), 0),
    [filtered]
  );

  const estimatedKb = useMemo(() => {
    const bytes = Math.max(256, filtered.length * 140);
    return `${(bytes / 1024).toFixed(1)} KB`;
  }, [filtered.length]);

  const handleGenerate = async () => {
    if (filtered.length === 0) {
      Alert.alert('No Transactions', 'No payment transactions match the selected date range and status.');
      return;
    }

    let content = '';
    if (format === 'JSON') {
      content = JSON.stringify(filtered, null, 2);
    } else {
      const header = 'Transaction ID,Order ID,Customer,Product,Method,Amount,Status,Date';
      const rows = filtered.map((p) =>
        [
          p.transactionId || p.paymentId || p._id || '',
          p.orderId || '',
          `"${(p.customerName || p.customer || '').replace(/"/g, '""')}"`,
          `"${(p.productName || p.product || '').replace(/"/g, '""')}"`,
          p.method || p.paymentMethod || '',
          p.amount || p.total || 0,
          p.status || '',
          p.createdAt ? new Date(p.createdAt).toISOString() : '',
        ].join(',')
      );
      content = [header, ...rows].join('\n');
    }

    await Share.share({
      title: `MessBee Payment Report (${fromDate} to ${toDate})`,
      message: content,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.headerTitle}>Download Report</Text>
          <Text style={styles.headerSub}>Export payment transaction data</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={styles.headerBtn}>
          <Ionicons name="notifications-outline" size={20} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Top Icon + Heading */}
        <View style={styles.topHero}>
          <View style={styles.heroIcon}>
            <Ionicons name="receipt-outline" size={28} color="#00875A" />
          </View>
          <Text style={styles.heroTitle}>Payment report</Text>
          <Text style={styles.heroSub}>Choose a date range and file type to generate your report.</Text>
        </View>

        {/* Filter Card */}
        <View style={styles.card}>
          <View style={styles.row2}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>From date</Text>
              <TextInput
                style={styles.input}
                value={fromDate}
                onChangeText={setFromDate}
                placeholder="YYYY-MM-DD"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>To date</Text>
              <TextInput
                style={styles.input}
                value={toDate}
                onChangeText={setToDate}
                placeholder="YYYY-MM-DD"
              />
            </View>
          </View>

          <Text style={styles.label}>Payment status</Text>
          <TouchableOpacity style={styles.selectBox} onPress={() => setShowStatusList((v) => !v)}>
            <Text style={styles.selectText}>{statusFilter}</Text>
            <Ionicons name="chevron-down" size={16} color="#64748B" />
          </TouchableOpacity>
          {showStatusList && (
            <View style={styles.dropdown}>
              {STATUS_OPTIONS.map((st) => (
                <TouchableOpacity
                  key={st}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setStatusFilter(st);
                    setShowStatusList(false);
                  }}
                >
                  <Text style={[styles.dropdownText, statusFilter === st && { color: '#00875A', fontWeight: '700' }]}>
                    {st}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={styles.label}>File format</Text>
          <TouchableOpacity style={styles.selectBox} onPress={() => setShowFormatList((v) => !v)}>
            <Text style={styles.selectText}>{format}</Text>
            <Ionicons name="chevron-down" size={16} color="#64748B" />
          </TouchableOpacity>
          {showFormatList && (
            <View style={styles.dropdown}>
              {FORMAT_OPTIONS.map((fmt) => (
                <TouchableOpacity
                  key={fmt}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setFormat(fmt);
                    setShowFormatList(false);
                  }}
                >
                  <Text style={[styles.dropdownText, format === fmt && { color: '#00875A', fontWeight: '700' }]}>
                    {fmt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Summary Card */}
        <View style={styles.card}>
          {loading ? (
            <ActivityIndicator size="small" color="#00875A" />
          ) : (
            <>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Date range</Text>
                <Text style={styles.summaryVal}>{fromDate} to {toDate}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Transactions</Text>
                <Text style={styles.summaryVal}>{filtered.length}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total amount</Text>
                <Text style={styles.summaryVal}>₹{totalAmount.toLocaleString('en-IN')}</Text>
              </View>
              <View style={[styles.summaryRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
                <Text style={styles.summaryLabel}>Estimated file size</Text>
                <Text style={styles.summaryVal}>{estimatedKb}</Text>
              </View>
            </>
          )}
        </View>

        <TouchableOpacity style={styles.downloadBtn} onPress={handleGenerate} activeOpacity={0.85}>
          <Ionicons name="download-outline" size={18} color="#FFFFFF" />
          <Text style={styles.downloadBtnText}>Generate & Download</Text>
        </TouchableOpacity>
      </ScrollView>

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
    paddingTop: 10,
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
  topHero: { alignItems: 'center', marginBottom: 16 },
  heroIcon: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  heroTitle: { fontSize: 18, fontWeight: '800', color: '#00875A' },
  heroSub: { fontSize: 12, color: '#64748B', textAlign: 'center', marginTop: 3 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  row2: { flexDirection: 'row', gap: 10 },
  label: { fontSize: 12, fontWeight: '700', color: '#334155', marginBottom: 6, marginTop: 10 },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 13,
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
  selectText: { fontSize: 13, color: '#0F172A' },
  dropdown: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    marginTop: 6,
    backgroundColor: '#FFFFFF',
  },
  dropdownItem: { paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  dropdownText: { fontSize: 13, color: '#334155' },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  summaryLabel: { fontSize: 12.5, color: '#64748B' },
  summaryVal: { fontSize: 12.5, fontWeight: '700', color: '#0F172A' },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#00875A',
    borderRadius: 14,
    paddingVertical: 15,
  },
  downloadBtnText: { color: '#FFFFFF', fontSize: 14.5, fontWeight: '800' },
});
