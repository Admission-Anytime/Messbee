import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { analyticsService, authService } from '../../services/api';
import QuickBottomBar from '../../components/QuickBottomBar';
import DateFilterModal, { getDateRangeFromPreset } from './DateFilterModal';

export default function MessageAnalyticsScreen({ navigation }) {
  const [timeframe, setTimeframe] = useState('Daily'); // 'Daily' | 'Weekly' | 'Monthly'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [msgData, setMsgData] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [activePreset, setActivePreset] = useState('30d');
  const [customDates, setCustomDates] = useState({ fromDate: '', toDate: '' });

  // Details Modal
  const [selectedDateItem, setSelectedDateItem] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const range = getDateRangeFromPreset(activePreset, customDates.fromDate, customDates.toDate);
      const params = {
        groupBy: timeframe.toLowerCase(),
        ...range,
      };
      const [data, user] = await Promise.all([
        analyticsService.getMessageAnalytics(params).catch(() => null),
        authService.getCurrentUser().catch(() => null),
      ]);
      if (data) setMsgData(data);
      if (user) setUserProfile(user);
    } catch (err) {
      console.warn('Error loading message analytics:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [timeframe, activePreset, customDates.fromDate, customDates.toDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const totalSent = msgData?.summary?.totalSent ?? msgData?.totals?.sent ?? 0;
  const totalDelivered = msgData?.summary?.totalDelivered ?? msgData?.totals?.delivered ?? 0;
  const successRate =
    msgData?.summary?.successRate !== undefined
      ? String(msgData.summary.successRate)
      : totalSent > 0
      ? ((totalDelivered / totalSent) * 100).toFixed(1)
      : '0.0';

  const tableRows = msgData?.chartData || [];

  const userInitials = (
    userProfile?.name?.substring(0, 2) ||
    userProfile?.businessName?.substring(0, 2) ||
    'KS'
  ).toUpperCase();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={24} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.brandTitle}>MESSBEE</Text>
          <Text style={styles.pageTitle}>Messages</Text>
        </View>

        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{userInitials}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#00B67A']} />
        }
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          <View style={styles.titleIconBox}>
            <Ionicons name="paper-plane-outline" size={20} color="#00B67A" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.mainHeading}>Message Analytics</Text>
            <Text style={styles.mainSubheading}>
              Detailed performance metrics across communication channels.
            </Text>
          </View>
        </View>

        {/* Date Range & Filter Button */}
        <View style={styles.dateSelectorRow}>
          <View style={styles.dateDisplayBox}>
            <Ionicons name="calendar-outline" size={16} color="#00B67A" style={{ marginRight: 6 }} />
            <Text style={styles.dateDisplayText}>
              {activePreset === '30d' ? 'Last 30 days' : activePreset}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => setShowFilterModal(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="options-outline" size={16} color="#475569" style={{ marginRight: 4 }} />
            <Text style={styles.filterBtnText}>Filter</Text>
          </TouchableOpacity>
        </View>

        {/* Timeframe Pills (Daily | Weekly | Monthly) */}
        <View style={styles.timeframeRow}>
          {['Daily', 'Weekly', 'Monthly'].map((tf) => (
            <TouchableOpacity
              key={tf}
              style={[
                styles.timeframePill,
                timeframe === tf && styles.timeframePillActive,
              ]}
              onPress={() => setTimeframe(tf)}
            >
              <Text
                style={[
                  styles.timeframeText,
                  timeframe === tf && styles.timeframeTextActive,
                ]}
              >
                {tf}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 3 Metric Cards */}
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <View style={[styles.metricIconBox, { backgroundColor: '#EDF9F2' }]}>
              <Ionicons name="stats-chart" size={14} color="#00B67A" />
            </View>
            <Text style={styles.metricLabel}>Total sent</Text>
            <Text style={styles.metricValue}>{totalSent}</Text>
            <Text style={styles.metricDelta}>{timeframe}</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIconBox, { backgroundColor: '#EDF9F2' }]}>
              <Ionicons name="checkmark-outline" size={16} color="#00B67A" />
            </View>
            <Text style={styles.metricLabel}>Delivered</Text>
            <Text style={styles.metricValue}>{totalDelivered}</Text>
            <Text style={styles.metricDelta}>Confirmed</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIconBox, { backgroundColor: '#F5F3FF' }]}>
              <Ionicons name="trending-up-outline" size={16} color="#8B5CF6" />
            </View>
            <Text style={styles.metricLabel}>Success rate</Text>
            <Text style={styles.metricValue}>{successRate}%</Text>
            <Text style={styles.metricDelta}>Delivery</Text>
          </View>
        </View>

        {/* Data Distribution Table */}
        <View style={styles.distributionCard}>
          <View style={styles.distHeaderRow}>
            <View>
              <Text style={styles.distTitle}>Data distribution</Text>
              <Text style={styles.distSub}>Sent and delivered by date</Text>
            </View>
            <TouchableOpacity>
              <Ionicons name="ellipsis-horizontal" size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Table Header */}
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.thText, { flex: 1.5 }]}>DATE</Text>
            <Text style={[styles.thText, { flex: 1, textAlign: 'center' }]}>SENT</Text>
            <Text style={[styles.thText, { flex: 1, textAlign: 'right', paddingRight: 20 }]}>
              DELIVERED
            </Text>
          </View>

          {/* Table Rows */}
          {tableRows.length === 0 ? (
            <View style={{ padding: 28, alignItems: 'center' }}>
              <Ionicons name="mail-outline" size={32} color="#94A3B8" />
              <Text style={{ marginTop: 8, color: '#64748B', fontSize: 13 }}>No messages recorded for this period</Text>
            </View>
          ) : (
            tableRows.map((row, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.tableRow}
                onPress={() => {
                  setSelectedDateItem(row);
                  setShowDetailsModal(true);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.dateCol}>
                  <View style={styles.dotIndicator} />
                  <Text style={styles.rowDateText}>{row.date}</Text>
                </View>

                <Text style={styles.rowSentText}>{row.sent}</Text>

                <View style={styles.deliveredCol}>
                  <Text style={styles.rowDeliveredText}>{row.delivered}</Text>
                  <Ionicons name="chevron-forward" size={14} color="#CBD5E1" style={{ marginLeft: 6 }} />
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Date Filter Modal */}
      <DateFilterModal
        visible={showFilterModal}
        activePreset={activePreset}
        onClose={() => setShowFilterModal(false)}
        onApply={({ preset, fromDate, toDate }) => {
          setActivePreset(preset);
          setCustomDates({ fromDate: fromDate || '', toDate: toDate || '' });
        }}
      />

      {/* Message Details Modal */}
      <Modal
        visible={showDetailsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowDetailsModal(false)}
        >
          <View style={styles.detailsSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.sheetHandle} />

            <View style={styles.detailsHeader}>
              <Text style={styles.detailsTitle}>
                Message details - {selectedDateItem?.date || ''}
              </Text>
              <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Green Summary Banner */}
            {(() => {
              const s = selectedDateItem?.sent || 0;
              const d = selectedDateItem?.delivered || 0;
              const r = selectedDateItem?.read || 0;
              const f = selectedDateItem?.failed || 0;
              const rate = s > 0 ? ((d / s) * 100).toFixed(1) : '0.0';
              return (
                <>
                  <View style={styles.detailsGreenBanner}>
                    <View style={styles.bannerRow}>
                      <Text style={styles.bannerCount}>{s} sent</Text>
                      <Text style={styles.bannerDivider}>|</Text>
                      <Text style={styles.bannerCount}>{d} delivered</Text>
                    </View>
                    <Text style={styles.bannerRate}>{rate}% delivery rate</Text>
                  </View>

                  <View style={styles.messagesList}>
                    <View style={styles.messageItemRow}>
                      <Ionicons name="paper-plane-outline" size={18} color="#3B82F6" style={{ marginRight: 10 }} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.msgItemTitle}>Total Sent</Text>
                        <Text style={styles.msgItemTime}>{s} messages dispatched on {selectedDateItem?.date}</Text>
                      </View>
                    </View>

                    <View style={styles.messageItemRow}>
                      <Ionicons name="checkmark-circle" size={18} color="#00B67A" style={{ marginRight: 10 }} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.msgItemTitle}>Delivered & Read</Text>
                        <Text style={styles.msgItemTime}>{d} delivered • {r} read</Text>
                      </View>
                    </View>

                    <View style={styles.messageItemRow}>
                      <Ionicons name="alert-circle-outline" size={18} color={f > 0 ? '#EF4444' : '#94A3B8'} style={{ marginRight: 10 }} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.msgItemTitle}>Failed</Text>
                        <Text style={styles.msgItemTime}>{f} failed deliveries</Text>
                      </View>
                    </View>
                  </View>
                </>
              );
            })()}

            {/* Button */}
            <TouchableOpacity
              style={styles.viewAllDetailsBtn}
              onPress={() => setShowDetailsModal(false)}
            >
              <Text style={styles.viewAllDetailsText}>Close details</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
      <QuickBottomBar navigation={navigation} activeTab="Home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingTop: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerBtn: {
    padding: 4,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: '#00B67A',
    letterSpacing: 1.5,
  },
  pageTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EDF9F2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#C6EED5',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00B67A',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#EDF9F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  mainHeading: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  mainSubheading: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  dateSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  dateDisplayBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dateDisplayText: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '500',
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  timeframeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  timeframePill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timeframePillActive: {
    backgroundColor: '#EDF9F2',
    borderColor: '#00B67A',
  },
  timeframeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  timeframeTextActive: {
    color: '#00B67A',
    fontWeight: '700',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
  },
  metricIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  metricDelta: {
    fontSize: 10,
    fontWeight: '600',
    color: '#00B67A',
  },
  distributionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
  },
  distHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  distTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  distSub: {
    fontSize: 11,
    color: '#64748B',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  thText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  dateCol: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dotIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00B67A',
    marginRight: 8,
  },
  rowDateText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  rowSentText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
    color: '#475569',
  },
  deliveredCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  rowDeliveredText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  detailsSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  detailsGreenBanner: {
    backgroundColor: '#00593B',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  bannerCount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  bannerDivider: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
    marginHorizontal: 10,
  },
  bannerRate: {
    fontSize: 11,
    color: '#A7F3D0',
  },
  messagesList: {
    gap: 12,
    marginBottom: 20,
  },
  messageItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  msgItemTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  msgItemTime: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  viewAllDetailsBtn: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  viewAllDetailsText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
});
