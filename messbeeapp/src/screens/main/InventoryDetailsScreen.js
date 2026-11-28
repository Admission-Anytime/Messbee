import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { commerceService, inventoryService, salesService, resolveFileUrl } from '../../services/api';
import QuickBottomBar from '../../components/QuickBottomBar';

export default function InventoryDetailsScreen({ route, navigation }) {
  const initialProduct = route.params?.product || {};
  const [product, setProduct] = useState(initialProduct);
  const [logs, setLogs] = useState([]);
  const [soldCount, setSoldCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [prods, logsRes, salesRes] = await Promise.all([
        commerceService.getProducts().catch(() => []),
        inventoryService.getInventoryLogs(1, 100).catch(() => []),
        salesService.getSales('', 1, 100).catch(() => []),
      ]);

      if (Array.isArray(prods) && initialProduct?._id) {
        const fresh = prods.find((p) => p._id === initialProduct._id);
        if (fresh) setProduct(fresh);
      }

      const pid = String(initialProduct?._id || '');
      const pname = String(initialProduct?.name || '').toLowerCase();

      const matchingLogs = (Array.isArray(logsRes) ? logsRes : []).filter((l) => {
        const lid = String(l.product?._id || l.product || '');
        const lname = String(l.product?.name || l.productName || '').toLowerCase();
        return (pid && lid === pid) || (pname && lname === pname);
      });
      setLogs(matchingLogs);

      let sold = 0;
      (Array.isArray(salesRes) ? salesRes : []).forEach((s) => {
        (s.items || []).forEach((it) => {
          const matchId = pid && String(it.product?._id || it.product || '') === pid;
          const matchName = pname && String(it.name || it.productName || '').toLowerCase() === pname;
          if (matchId || matchName) sold += Number(it.quantity || 1);
        });
      });
      setSoldCount(sold);
    } catch (err) {
      console.warn('InventoryDetails load error:', err.message);
    } finally {
      setLoading(false);
    }
  }, [initialProduct?._id, initialProduct?.name]);

  useEffect(() => {
    loadData();
    const unsub = navigation.addListener('focus', loadData);
    return unsub;
  }, [loadData, navigation]);

  const currentStock = Number(product.currentStock ?? product.stock ?? 0);
  const minStock = Number(product.minimumStock ?? 10);
  const progressPct = useMemo(() => {
    const cap = Math.max(minStock * 2, currentStock, 10);
    return Math.min(100, Math.round((currentStock / cap) * 100));
  }, [currentStock, minStock]);

  const stockBadge =
    currentStock <= 0
      ? { label: 'Out of Stock', bg: '#FEE2E2', color: '#B91C1C' }
      : currentStock <= minStock
      ? { label: 'Low Stock', bg: '#FEF3C7', color: '#B45309' }
      : { label: 'In Stock', bg: '#DCFCE7', color: '#15803D' };

  const imageUri = resolveFileUrl(product.productImage || product.image);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.headerTitle}>Inventory Details</Text>
          <Text style={styles.headerSub}>{product.sku || 'SKU'}</Text>
        </View>
        <TouchableOpacity onPress={loadData} style={styles.headerBtn}>
          <Ionicons name="time-outline" size={20} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Product Summary Card */}
        <View style={styles.productCard}>
          <View style={styles.thumbBox}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={{ width: 52, height: 52, borderRadius: 12 }} />
            ) : (
              <Ionicons name="cube-outline" size={26} color="#92400E" />
            )}
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.productName} numberOfLines={1}>{product.name || 'Product'}</Text>
            <Text style={styles.productMeta}>
              {typeof product.category === 'object' ? product.category?.name : product.category || 'General'} • {product.sku || ''}
            </Text>
            <View style={[styles.badge, { backgroundColor: stockBadge.bg }]}>
              <Text style={[styles.badgeText, { color: stockBadge.color }]}>{stockBadge.label}</Text>
            </View>
          </View>
        </View>

        {/* Green Current Stock Card */}
        <View style={styles.greenStockCard}>
          <View style={styles.greenTopRow}>
            <Text style={styles.greenLabel}>Current stock</Text>
            <Text style={styles.greenCount}>
              {currentStock} <Text style={styles.greenUnit}>{product.unit || 'units'}</Text>
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
          </View>
          <Text style={styles.minLevelText}>Minimum stock level: {minStock} {product.unit || 'units'}</Text>
        </View>

        {/* 3 Stat Boxes: Available | Min Level | Sold */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Available</Text>
            <Text style={styles.statVal}>{currentStock}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Min Level</Text>
            <Text style={styles.statVal}>{minStock}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Sold</Text>
            <Text style={styles.statVal}>{soldCount}</Text>
          </View>
        </View>

        {/* Stock Movement History */}
        <View style={styles.movementCard}>
          <View style={styles.movementHeader}>
            <Text style={styles.movementTitle}>Stock movement</Text>
            <Text style={styles.movementCount}>{logs.length} logs</Text>
          </View>

          {loading ? (
            <ActivityIndicator size="small" color="#00B67A" style={{ marginVertical: 16 }} />
          ) : logs.length === 0 ? (
            <Text style={styles.emptyText}>No stock movement logs recorded for this product yet.</Text>
          ) : (
            logs.slice(0, 10).map((log, idx) => {
              const delta = Number(log.quantityChange ?? (log.newStock - log.previousStock) ?? 0);
              const isPos = delta >= 0;
              return (
                <View key={log._id || idx} style={styles.logRow}>
                  <View style={[styles.deltaPill, { backgroundColor: isPos ? '#DCFCE7' : '#FEE2E2' }]}>
                    <Text style={[styles.deltaText, { color: isPos ? '#15803D' : '#B91C1C' }]}>
                      {isPos ? `+${delta}` : delta}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.logReason} numberOfLines={1}>
                      {log.notes || log.type || 'Stock adjustment'}
                    </Text>
                    <Text style={styles.logDate}>
                      {log.createdAt ? new Date(log.createdAt).toLocaleString('en-IN') : ''}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionBtnRow}>
          <TouchableOpacity
            style={styles.adjustBtn}
            onPress={() => navigation.navigate('StockAdjustment', { product })}
          >
            <Ionicons name="create-outline" size={16} color="#FFFFFF" />
            <Text style={styles.adjustBtnText}>Adjust Inventory</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.detailsBtn}
            onPress={() => navigation.navigate('ProductDetails', { product })}
          >
            <Ionicons name="cube-outline" size={16} color="#0F172A" />
            <Text style={styles.detailsBtnText}>Product Details</Text>
          </TouchableOpacity>
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
    paddingTop: Platform.OS === 'android' ? 24 : 10,
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
  headerSub: { fontSize: 11, color: '#64748B', marginTop: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  thumbBox: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#F3E8D2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productName: { fontSize: 15.5, fontWeight: '800', color: '#0F172A' },
  productMeta: { fontSize: 11.5, color: '#64748B', marginTop: 2, marginBottom: 6 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  badgeText: { fontSize: 10.5, fontWeight: '700' },
  greenStockCard: {
    backgroundColor: '#009E66',
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
  },
  greenTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  greenLabel: { fontSize: 13, color: '#D1FAE5', fontWeight: '600' },
  greenCount: { fontSize: 28, fontWeight: '800', color: '#FFFFFF' },
  greenUnit: { fontSize: 13, fontWeight: '600', color: '#D1FAE5' },
  progressTrack: { height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.28)', marginBottom: 8 },
  progressFill: { height: 7, borderRadius: 4, backgroundColor: '#FFFFFF' },
  minLevelText: { fontSize: 11, color: '#D1FAE5' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statLabel: { fontSize: 11, color: '#64748B', marginBottom: 4 },
  statVal: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  movementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  movementHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  movementTitle: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  movementCount: { fontSize: 12, fontWeight: '700', color: '#00875A' },
  emptyText: { fontSize: 12.5, color: '#94A3B8', textAlign: 'center', paddingVertical: 14 },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  deltaPill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, minWidth: 44, alignItems: 'center' },
  deltaText: { fontSize: 12, fontWeight: '800' },
  logReason: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  logDate: { fontSize: 11, color: '#64748B', marginTop: 2 },
  actionBtnRow: { flexDirection: 'row', gap: 10 },
  adjustBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#00875A',
    paddingVertical: 13,
    borderRadius: 14,
  },
  adjustBtnText: { color: '#FFFFFF', fontSize: 13.5, fontWeight: '700' },
  detailsBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 13,
    borderRadius: 14,
  },
  detailsBtnText: { color: '#0F172A', fontSize: 13.5, fontWeight: '700' },
});
