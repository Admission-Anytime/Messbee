import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { commerceService } from '../../services/api';
import QuickBottomBar from '../../components/QuickBottomBar';

const formatCurrencyCompact = (num) => {
  const n = Number(num) || 0;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n.toLocaleString('en-IN')}`;
};

export default function CommerceHubScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [prodList, payList] = await Promise.all([
        commerceService.getProducts(),
        commerceService.getPayments(),
      ]);
      setProducts(Array.isArray(prodList) ? prodList : []);
      setPayments(Array.isArray(payList) ? payList : []);
    } catch (err) {
      console.warn('CommerceHub load error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const unsub = navigation.addListener('focus', loadData);
    return unsub;
  }, [loadData, navigation]);

  const stats = useMemo(() => {
    const totalProducts = products.length;
    const totalPayments = payments.length;
    const inventoryValue = products.reduce(
      (sum, p) => sum + (Number(p.sellingPrice || p.price || 0) * Number(p.currentStock ?? p.stock ?? 0)),
      0
    );
    const totalRevenue = payments
      .filter((p) => ['success', 'paid', 'completed', 'captured'].includes(String(p.status || '').toLowerCase()))
      .reduce((sum, p) => sum + Number(p.amount || p.total || 0), 0);
    const inStockCount = products.filter((p) => Number(p.currentStock ?? p.stock ?? 0) > 0).length;

    return { totalProducts, totalPayments, inventoryValue, totalRevenue, inStockCount };
  }, [products, payments]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={styles.headerTitle}>Commerce</Text>
          <Text style={styles.headerSub}>Manage products, payments and inventory</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadData();
            }}
            colors={['#00875A']}
          />
        }
      >
        {/* Green Business Overview Hero Banner */}
        <View style={styles.heroCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTag}>BUSINESS OVERVIEW</Text>
            <Text style={styles.heroTitle}>Your business at a glance</Text>
            <Text style={styles.heroDesc}>
              Everything you need to sell and grow from one place.
            </Text>
          </View>
          <View style={styles.heroIconBox}>
            <Ionicons name="storefront-outline" size={24} color="#FFFFFF" />
          </View>
        </View>

        {loading ? (
          <View style={{ paddingVertical: 30, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#00875A" />
          </View>
        ) : (
          <View style={styles.kpiGrid}>
            <View style={styles.kpiCard}>
              <View style={styles.kpiTopRow}>
                <View style={[styles.kpiIconBox, { backgroundColor: '#ECFDF5' }]}>
                  <Ionicons name="cube-outline" size={18} color="#00875A" />
                </View>
                <View style={styles.kpiBadge}>
                  <Text style={styles.kpiBadgeText}>{stats.inStockCount} active</Text>
                </View>
              </View>
              <Text style={styles.kpiValue}>{stats.totalProducts}</Text>
              <Text style={styles.kpiLabel}>Total Products</Text>
              <Text style={styles.kpiHint}>Live catalog items</Text>
            </View>

            <View style={styles.kpiCard}>
              <View style={styles.kpiTopRow}>
                <View style={[styles.kpiIconBox, { backgroundColor: '#EFF6FF' }]}>
                  <Ionicons name="card-outline" size={18} color="#2563EB" />
                </View>
                <View style={styles.kpiBadge}>
                  <Text style={styles.kpiBadgeText}>Synced</Text>
                </View>
              </View>
              <Text style={styles.kpiValue}>{stats.totalPayments}</Text>
              <Text style={styles.kpiLabel}>Total Payments</Text>
              <Text style={styles.kpiHint}>Recorded transactions</Text>
            </View>

            <View style={styles.kpiCard}>
              <View style={styles.kpiTopRow}>
                <View style={[styles.kpiIconBox, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="layers-outline" size={18} color="#D97706" />
                </View>
                <View style={styles.kpiBadge}>
                  <Text style={styles.kpiBadgeText}>Stock</Text>
                </View>
              </View>
              <Text style={styles.kpiValue}>{formatCurrencyCompact(stats.inventoryValue)}</Text>
              <Text style={styles.kpiLabel}>Inventory Value</Text>
              <Text style={styles.kpiHint}>Across all SKUs</Text>
            </View>

            <View style={styles.kpiCard}>
              <View style={styles.kpiTopRow}>
                <View style={[styles.kpiIconBox, { backgroundColor: '#ECFDF5' }]}>
                  <Ionicons name="trending-up-outline" size={18} color="#00875A" />
                </View>
                <View style={styles.kpiBadge}>
                  <Text style={styles.kpiBadgeText}>Paid</Text>
                </View>
              </View>
              <Text style={styles.kpiValue}>{formatCurrencyCompact(stats.totalRevenue)}</Text>
              <Text style={styles.kpiLabel}>Total Revenue</Text>
              <Text style={styles.kpiHint}>Confirmed payments</Text>
            </View>
          </View>
        )}

        {/* Commerce Tools Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Commerce tools</Text>
          <Text style={styles.sectionCount}>3 modules</Text>
        </View>

        <TouchableOpacity
          style={styles.toolCard}
          onPress={() => navigation.navigate('PaymentList')}
          activeOpacity={0.8}
        >
          <View style={[styles.toolIconBox, { backgroundColor: '#ECFDF5' }]}>
            <Ionicons name="receipt-outline" size={20} color="#00875A" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.toolTitle}>Payment List</Text>
            <Text style={styles.toolSub}>Track transactions and payment status</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toolCard}
          onPress={() => navigation.navigate('CommerceCatalog')}
          activeOpacity={0.8}
        >
          <View style={[styles.toolIconBox, { backgroundColor: '#EFF6FF' }]}>
            <Ionicons name="pricetags-outline" size={20} color="#2563EB" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.toolTitle}>Product List</Text>
            <Text style={styles.toolSub}>Manage your digital product catalog</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toolCard}
          onPress={() => navigation.navigate('Inventory')}
          activeOpacity={0.8}
        >
          <View style={[styles.toolIconBox, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="cube-outline" size={20} color="#D97706" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.toolTitle}>Inventory Management</Text>
            <Text style={styles.toolSub}>Track stock levels, alerts and updates</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
        </TouchableOpacity>
      </ScrollView>
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
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00875A',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
  },
  heroTag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#A7F3D0',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  heroDesc: {
    fontSize: 12,
    color: '#D1FAE5',
    lineHeight: 17,
  },
  heroIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 20,
  },
  kpiCard: {
    width: '48.2%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  kpiTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  kpiIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiBadge: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  kpiBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#00875A',
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  kpiLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
    marginTop: 2,
  },
  kpiHint: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00875A',
  },
  toolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  toolIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  toolTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  toolSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
});
