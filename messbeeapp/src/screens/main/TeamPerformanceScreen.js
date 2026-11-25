import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { performanceService, reportsService } from '../../services/api';

export default function TeamPerformanceScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [perfData, setPerfData] = useState(null);
  const [dashReport, setDashReport] = useState(null);
  const [salesReport, setSalesReport] = useState(null);

  const loadAll = useCallback(async () => {
    try {
      const [perf, dash, sales] = await Promise.all([
        performanceService.getOverview(),
        reportsService.getDashboardStats(),
        reportsService.getSalesReport(),
      ]);
      setPerfData(perf);
      setDashReport(dash);
      setSalesReport(sales);
    } catch (err) {
      console.warn('TeamPerformance load error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const onRefresh = () => {
    setRefreshing(true);
    loadAll();
  };

  const agents = perfData?.agents || perfData?.agentPerformance || [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Performance & Reports</Text>
        <View style={{ width: 32 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#00B67A" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#00B67A']} />}
        >
          {/* Real-time Chat & Queue Performance */}
          <Text style={styles.sectionTitle}>Real-Time Messaging Performance</Text>
          <View style={styles.kpiGrid}>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiValue}>{perfData?.totalChats ?? perfData?.openChats ?? 0}</Text>
              <Text style={styles.kpiLabel}>Open / Active Chats</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={[styles.kpiValue, { color: '#F59E0B' }]}>{perfData?.unreadChats ?? 0}</Text>
              <Text style={styles.kpiLabel}>Unread Queue</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={[styles.kpiValue, { color: '#00B67A' }]}>{perfData?.resolvedChats ?? 0}</Text>
              <Text style={styles.kpiLabel}>Resolved Today</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={[styles.kpiValue, { color: '#EF4444' }]}>{perfData?.failedMessages ?? 0}</Text>
              <Text style={styles.kpiLabel}>Failed Messages</Text>
            </View>
          </View>

          {/* Business Sales & Inventory Reports */}
          <Text style={styles.sectionTitle}>Business & Revenue Reports</Text>
          <View style={styles.card}>
            <View style={styles.reportRow}>
              <Text style={styles.reportLabel}>Total Sales Revenue</Text>
              <Text style={styles.reportValue}>
                ₹{Number(dashReport?.totalSales ?? salesReport?.totalRevenue ?? 0).toLocaleString('en-IN')}
              </Text>
            </View>
            <View style={styles.reportRow}>
              <Text style={styles.reportLabel}>Total Purchases</Text>
              <Text style={styles.reportValue}>
                ₹{Number(dashReport?.totalPurchases ?? 0).toLocaleString('en-IN')}
              </Text>
            </View>
            <View style={styles.reportRow}>
              <Text style={styles.reportLabel}>Active Products</Text>
              <Text style={styles.reportValue}>{dashReport?.totalProducts ?? 0}</Text>
            </View>
            <View style={[styles.reportRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.reportLabel}>Low Stock Items</Text>
              <Text style={[styles.reportValue, { color: '#F59E0B' }]}>
                {dashReport?.lowStockCount ?? 0}
              </Text>
            </View>
          </View>

          {/* Agent Breakdown */}
          <Text style={styles.sectionTitle}>Agent Activity ({agents.length})</Text>
          {agents.length === 0 ? (
            <View style={styles.card}>
              <Text style={styles.emptyText}>No agent performance data recorded for today.</Text>
            </View>
          ) : (
            agents.map((ag, idx) => (
              <View key={ag._id || idx} style={styles.agentCard}>
                <View style={styles.agentAvatar}>
                  <Text style={styles.agentInitials}>
                    {(ag.name || 'AG').slice(0, 2).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.agentName}>{ag.name || ag.email || 'Team Agent'}</Text>
                  <Text style={styles.agentMeta}>
                    Chats Handled: {ag.chatsHandled ?? ag.count ?? 0} • Avg Response: {ag.avgResponseTime || 'N/A'}
                  </Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { padding: 16, paddingBottom: 32 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginTop: 12, marginBottom: 10 },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  kpiCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  kpiValue: { fontSize: 22, fontWeight: '800', color: '#0F172A' },
  kpiLabel: { fontSize: 12, color: '#64748B', marginTop: 4 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  reportLabel: { fontSize: 13, color: '#475569', fontWeight: '500' },
  reportValue: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  agentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  agentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F8F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  agentInitials: { fontSize: 14, fontWeight: '700', color: '#00B67A' },
  agentName: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  agentMeta: { fontSize: 12, color: '#64748B', marginTop: 2 },
  emptyText: { fontSize: 13, color: '#94A3B8', textAlign: 'center', paddingVertical: 8 },
});
