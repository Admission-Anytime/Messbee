import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { commerceService, salesService, resolveFileUrl } from '../../services/api';
import QuickBottomBar from '../../components/QuickBottomBar';

export default function ProductDetailsScreen({ route, navigation }) {
  const initialProduct = route.params?.product || {};
  const [product, setProduct] = useState(initialProduct);
  const [sales, setSales] = useState([]);
  const [loadingPerf, setLoadingPerf] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [prods, salesList] = await Promise.all([
        commerceService.getProducts().catch(() => []),
        salesService.getSales('', 1, 100).catch(() => []),
      ]);
      if (Array.isArray(prods) && initialProduct?._id) {
        const fresh = prods.find((p) => p._id === initialProduct._id);
        if (fresh) setProduct(fresh);
      }
      setSales(Array.isArray(salesList) ? salesList : []);
    } catch (err) {
      console.warn('ProductDetails load error:', err.message);
    } finally {
      setLoadingPerf(false);
    }
  }, [initialProduct?._id]);

  useEffect(() => {
    loadData();
    const unsub = navigation.addListener('focus', loadData);
    return unsub;
  }, [loadData, navigation]);

  const perf = useMemo(() => {
    const pid = String(product._id || '');
    const pname = String(product.name || '').toLowerCase();
    let unitsSold = 0;
    let revenue = 0;
    const dailyBuckets = {};

    sales.forEach((sale) => {
      const items = Array.isArray(sale.items) ? sale.items : [];
      items.forEach((item) => {
        const matchId = pid && String(item.product?._id || item.product || '') === pid;
        const matchName = pname && String(item.name || item.productName || '').toLowerCase() === pname;
        if (matchId || matchName) {
          const qty = Number(item.quantity || 1);
          const amt = Number(item.total || item.price * qty || 0);
          unitsSold += qty;
          revenue += amt;
          const dayKey = sale.createdAt
            ? new Date(sale.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
            : 'Recent';
          dailyBuckets[dayKey] = (dailyBuckets[dayKey] || 0) + qty;
        }
      });
    });

    const bars = Object.entries(dailyBuckets)
      .slice(-8)
      .map(([label, val]) => ({ label, val }));

    return { unitsSold, revenue, bars };
  }, [sales, product._id, product.name]);

  const handleDelete = () => {
    setShowMenu(false);
    Alert.alert('Delete Product', `Are you sure you want to delete "${product.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await commerceService.deleteProduct(product._id);
            navigation.goBack();
          } catch (err) {
            Alert.alert('Error', err?.response?.data?.message || 'Failed to delete product.');
          }
        },
      },
    ]);
  };

  const stock = Number(product.currentStock ?? product.stock ?? 0);
  const sellingPrice = Number(product.sellingPrice ?? product.price ?? 0);
  const purchasePrice = Number(product.purchasePrice ?? 0);
  const gst = Number(product.gstPercentage ?? 18);
  const isActive = (product.status || 'active').toLowerCase() === 'active';
  const imageUri = resolveFileUrl(product.productImage || product.image);
  const maxBar = Math.max(1, ...perf.bars.map((b) => b.val));

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIconBtn}>
          <Ionicons name="chevron-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Details</Text>
        <TouchableOpacity onPress={() => setShowMenu((v) => !v)} style={styles.headerIconBtn}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#0F172A" />
        </TouchableOpacity>
      </View>

      {showMenu && (
        <View style={styles.dropdownMenu}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setShowMenu(false);
              navigation.navigate('AddProduct', { product });
            }}
          >
            <Ionicons name="create-outline" size={16} color="#0F172A" />
            <Text style={styles.menuItemText}>Edit Product</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setShowMenu(false);
              navigation.navigate('StockAdjustment', { product });
            }}
          >
            <Ionicons name="swap-vertical-outline" size={16} color="#00875A" />
            <Text style={[styles.menuItemText, { color: '#00875A' }]}>Adjust Stock</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={16} color="#EF4444" />
            <Text style={[styles.menuItemText, { color: '#EF4444' }]}>Delete Product</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Product Image */}
        <View style={styles.heroImageCard}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.heroImage} resizeMode="cover" />
          ) : (
            <View style={styles.heroPlaceholder}>
              <Ionicons name="cube-outline" size={52} color="#92400E" />
            </View>
          )}
        </View>

        {/* Status, Title & Price */}
        <View style={styles.titleBlock}>
          <View style={[styles.statusBadge, !isActive && { backgroundColor: '#F1F5F9' }]}>
            <View style={[styles.statusDot, !isActive && { backgroundColor: '#64748B' }]} />
            <Text style={[styles.statusText, !isActive && { color: '#475569' }]}>
              {isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>

          <View style={styles.titlePriceRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.productName}>{product.name || 'Product'}</Text>
              <Text style={styles.productSku}>
                {product.sku || 'NO-SKU'} • {typeof product.category === 'object' ? product.category?.name : product.category || 'General'}
              </Text>
            </View>
            <Text style={styles.productPrice}>₹{sellingPrice.toLocaleString('en-IN')}</Text>
          </View>
        </View>

        {/* About this product */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>About this product</Text>
          <Text style={styles.productDesc}>
            {product.description?.trim() || 'No product description added yet.'}
          </Text>

          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Available stock</Text>
            <Text style={[styles.specValue, stock <= 0 && { color: '#EF4444' }]}>
              {stock} {product.unit || 'units'}
            </Text>
          </View>
          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Brand</Text>
            <Text style={styles.specValue}>{product.brand || '—'}</Text>
          </View>
          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Purchase price</Text>
            <Text style={styles.specValue}>₹{purchasePrice.toLocaleString('en-IN')}</Text>
          </View>
          <View style={[styles.specRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
            <Text style={styles.specLabel}>Tax / GST</Text>
            <Text style={styles.specValue}>{gst}%</Text>
          </View>
        </View>

        {/* Product performance */}
        <View style={styles.sectionCard}>
          <View style={styles.perfHeader}>
            <Text style={styles.sectionTitle}>Product performance</Text>
            <Text style={styles.perfSub}>From live sales</Text>
          </View>

          {loadingPerf ? (
            <ActivityIndicator size="small" color="#00B67A" style={{ marginVertical: 16 }} />
          ) : (
            <>
              <View style={styles.perfStatsRow}>
                <View style={styles.perfStatCol}>
                  <Text style={styles.perfStatVal}>{perf.unitsSold}</Text>
                  <Text style={styles.perfStatLabel}>Units sold</Text>
                </View>
                <View style={styles.perfStatCol}>
                  <Text style={styles.perfStatVal}>₹{perf.revenue.toLocaleString('en-IN')}</Text>
                  <Text style={styles.perfStatLabel}>Revenue</Text>
                </View>
                <View style={styles.perfStatCol}>
                  <Text style={styles.perfStatVal}>{stock}</Text>
                  <Text style={styles.perfStatLabel}>In stock</Text>
                </View>
              </View>

              {perf.bars.length > 0 ? (
                <View style={styles.chartRow}>
                  {perf.bars.map((b, i) => {
                    const h = Math.max(10, Math.round((b.val / maxBar) * 64));
                    return (
                      <View key={i} style={styles.barWrap}>
                        <View style={[styles.barFill, { height: h, backgroundColor: i >= perf.bars.length - 2 ? '#00B67A' : '#A7F3D0' }]} />
                        <Text style={styles.barLabel} numberOfLines={1}>{b.label}</Text>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <View style={styles.emptyPerfBox}>
                  <Text style={styles.emptyPerfText}>No sales recorded for this product yet.</Text>
                </View>
              )}
            </>
          )}
        </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#0F172A' },
  dropdownMenu: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 70 : 56,
    right: 16,
    zIndex: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    minWidth: 160,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuItemText: { fontSize: 13, fontWeight: '600', color: '#0F172A' },
  scrollContent: { padding: 16, paddingBottom: 96 },
  heroImageCard: {
    height: 190,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#FDE68A',
    marginBottom: 14,
  },
  heroImage: { width: '100%', height: '100%' },
  heroPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3E8D2',
  },
  titleBlock: { marginBottom: 14 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 5,
    marginBottom: 8,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' },
  statusText: { fontSize: 11, fontWeight: '700', color: '#059669' },
  titlePriceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  productName: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  productSku: { fontSize: 12, color: '#64748B', marginTop: 3 },
  productPrice: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#0F172A', marginBottom: 8 },
  productDesc: { fontSize: 13, color: '#64748B', lineHeight: 19, marginBottom: 14 },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  specLabel: { fontSize: 13, color: '#64748B' },
  specValue: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  perfHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  perfSub: { fontSize: 11.5, fontWeight: '600', color: '#00B67A' },
  perfStatsRow: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 },
  perfStatCol: { alignItems: 'center' },
  perfStatVal: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  perfStatLabel: { fontSize: 11, color: '#64748B', marginTop: 2 },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 90,
    paddingTop: 10,
    marginTop: 6,
  },
  barWrap: { alignItems: 'center', flex: 1 },
  barFill: { width: 16, borderRadius: 4 },
  barLabel: { fontSize: 9.5, color: '#94A3B8', marginTop: 4 },
  emptyPerfBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 6,
  },
  emptyPerfText: { fontSize: 12, color: '#94A3B8' },
});
