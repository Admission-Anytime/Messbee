import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { chatService } from '../../services/api';

const getStatusConfig = (raw) => {
  const s = String(raw || 'pending').toLowerCase();
  if (['success', 'paid', 'completed', 'captured'].includes(s)) {
    return {
      label: 'Success',
      headline: 'Payment confirmed',
      icon: 'checkmark',
      bg: '#ECFDF5',
      border: '#BBF7D0',
      iconBg: '#10B981',
      pillBg: '#DCFCE7',
      pillText: '#15803D',
    };
  }
  if (['failed', 'error', 'declined'].includes(s)) {
    return {
      label: 'Failed',
      headline: 'Failed payment',
      icon: 'warning',
      bg: '#FEF2F2',
      border: '#FECACA',
      iconBg: '#EF4444',
      pillBg: '#FEE2E2',
      pillText: '#B91C1C',
    };
  }
  if (['refunded', 'refund'].includes(s)) {
    return {
      label: 'Refunded',
      headline: 'Refunded payment',
      icon: 'refresh',
      bg: '#ECFDF5',
      border: '#BBF7D0',
      iconBg: '#16A34A',
      pillBg: '#EDE9FE',
      pillText: '#6D28D9',
    };
  }
  return {
    label: 'Pending',
    headline: 'Pending payment',
    icon: 'time',
    bg: '#FFFBEB',
    border: '#FDE68A',
    iconBg: '#F59E0B',
    pillBg: '#FEF3C7',
    pillText: '#B45309',
  };
};

export default function PaymentDetailsScreen({ route, navigation }) {
  const payment = route.params?.payment || {};
  const cfg = getStatusConfig(payment.status);

  const txId = payment.transactionId || payment.paymentId || `MBP-${String(payment._id || '').slice(-6).toUpperCase()}`;
  const orderId = payment.orderId || '—';
  const customerName = payment.customerName || payment.customer || 'Customer';
  const customerPhone = payment.customerPhone || payment.phone || '';
  const customerEmail = payment.customerEmail || payment.email || '';
  const initials = customerName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || 'CU';

  const amount = Number(payment.amount || payment.total || 0);
  const subtotal = Number(payment.subtotal ?? amount);
  const tax = Number(payment.tax || 0);
  const discount = Number(payment.discount || 0);
  const dateText = payment.createdAt
    ? new Date(payment.createdAt).toLocaleString([], {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

  const handleShareReceipt = async () => {
    try {
      await Share.share({
        title: `Payment Receipt ${txId}`,
        message: `MessBee Payment Receipt\nTransaction: ${txId}\nOrder: ${orderId}\nCustomer: ${customerName}\nAmount: ₹${amount.toLocaleString('en-IN')}\nStatus: ${cfg.label}\nDate: ${dateText}`,
      });
    } catch (err) {
      Alert.alert('Error', err?.message || 'Unable to share receipt.');
    }
  };

  const handleOpenChat = async () => {
    if (!customerPhone) {
      Alert.alert('No Phone Number', 'No phone number is attached to this payment.');
      return;
    }
    try {
      const chat = await chatService.createChat({ name: customerName, phone: customerPhone });
      navigation.navigate('ChatDetail', {
        chat: {
          _id: chat?._id || chat?.id,
          name: chat?.name || customerName,
          phone: chat?.phone || customerPhone,
        },
      });
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.error || err?.message || 'Could not open chat.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={styles.headerTitle}>Payment Details</Text>
          <Text style={styles.headerSub}>{txId}</Text>
        </View>
        <TouchableOpacity onPress={handleShareReceipt} style={styles.iconBtn}>
          <Ionicons name="share-outline" size={20} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Status Hero Card */}
        <View style={[styles.statusHeroCard, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
          <View style={[styles.statusIconCircle, { backgroundColor: cfg.iconBg }]}>
            <Ionicons name={cfg.icon} size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.heroHeadline}>{cfg.headline}</Text>
          <Text style={styles.heroAmount}>₹{amount.toLocaleString('en-IN')}</Text>
          <View style={[styles.heroPill, { backgroundColor: cfg.pillBg }]}>
            <Text style={[styles.heroPillText, { color: cfg.pillText }]}>{cfg.label}</Text>
          </View>
        </View>

        {/* Customer Information */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          <View style={styles.customerRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.customerName}>{customerName}</Text>
              <Text style={styles.customerSub}>
                {[customerPhone, customerEmail].filter(Boolean).join(' · ') || 'No contact details'}
              </Text>
            </View>
            {customerPhone ? (
              <TouchableOpacity style={styles.chatIconBtn} onPress={handleOpenChat}>
                <Ionicons name="chatbubble-ellipses-outline" size={18} color="#00875A" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Transaction Details */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Transaction details</Text>

          {[
            ['Transaction ID', txId],
            ['Order ID', orderId],
            ['Product', payment.productName || payment.product || 'Order Payment'],
            ['Payment method', payment.paymentMethod || payment.method || 'Online'],
            ['Date & time', dateText],
            ['Subtotal', `₹${subtotal.toLocaleString('en-IN')}`],
            ['Tax', tax > 0 ? `₹${tax.toLocaleString('en-IN')}` : 'Included'],
            ['Discount', discount > 0 ? `- ₹${discount.toLocaleString('en-IN')}` : '₹0'],
          ].map(([k, v]) => (
            <View key={k} style={styles.detailRow}>
              <Text style={styles.detailKey}>{k}</Text>
              <Text style={styles.detailVal}>{v}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  scrollContent: { padding: 16, paddingBottom: 32 },
  statusHeroCard: {
    alignItems: 'center',
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    marginBottom: 14,
  },
  statusIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  heroHeadline: { fontSize: 13, fontWeight: '600', color: '#475569' },
  heroAmount: { fontSize: 30, fontWeight: '800', color: '#0F172A', marginTop: 4 },
  heroPill: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginTop: 8 },
  heroPillText: { fontSize: 11.5, fontWeight: '700' },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTitle: { fontSize: 14.5, fontWeight: '800', color: '#0F172A', marginBottom: 12 },
  customerRow: { flexDirection: 'row', alignItems: 'center' },
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
  customerSub: { fontSize: 12, color: '#64748B', marginTop: 2 },
  chatIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailKey: { fontSize: 12.5, color: '#64748B' },
  detailVal: { fontSize: 12.5, fontWeight: '700', color: '#0F172A', maxWidth: '58%', textAlign: 'right' },
});
