import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { analyticsService, authService } from '../../services/api';
import DateFilterModal from './DateFilterModal';

export default function ConversationalAnalyticsScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('Table'); // 'Table' | 'Charts'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [convData, setConvData] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [expandedDates, setExpandedDates] = useState(['Nov 18, 2024']);
  const [activePreset, setActivePreset] = useState('30d');

  const loadData = useCallback(async () => {
    try {
      const [data, user] = await Promise.all([
        analyticsService.getConversationAnalytics().catch(() => null),
        authService.getCurrentUser().catch(() => null),
      ]);
      if (data) setConvData(data);
      if (user) setUserProfile(user);
    } catch (err) {
      console.warn('Error loading conversational analytics:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const toggleExpandDate = (dateKey) => {
    setExpandedDates((prev) =>
      prev.includes(dateKey)
        ? prev.filter((d) => d !== dateKey)
        : [...prev, dateKey]
    );
  };

  const totalConversations = convData?.totals?.totalConversations || 0;
  const totalCharges = convData?.totals?.totalCharges || 0.0;
  const dailyData = convData?.dailyBreakdown || [];

  const userInitials = (
    userProfile?.name?.substring(0, 2) ||
    userProfile?.businessName?.substring(0, 2) ||
    'KS'
  ).toUpperCase();

  return (
    <SafeAreaView style={styles.container}>
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
          <Text style={styles.pageTitle}>Conversational</Text>
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
        {/* Main Heading */}
        <View style={styles.titleSection}>
          <View style={styles.titleIconBox}>
            <Ionicons name="chatbubble-ellipses-outline" size={20} color="#00B67A" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.mainHeading}>Conversational Analytics</Text>
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

        {/* Table vs Charts Toggle Tabs */}
        <View style={styles.toggleTabBar}>
          <TouchableOpacity
            style={[
              styles.toggleTabBtn,
              activeTab === 'Table' && styles.toggleTabBtnActive,
            ]}
            onPress={() => setActiveTab('Table')}
          >
            <Text
              style={[
                styles.toggleTabText,
                activeTab === 'Table' && styles.toggleTabTextActive,
              ]}
            >
              Table
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleTabBtn,
              activeTab === 'Charts' && styles.toggleTabBtnActive,
            ]}
            onPress={() => setActiveTab('Charts')}
          >
            <Text
              style={[
                styles.toggleTabText,
                activeTab === 'Charts' && styles.toggleTabTextActive,
              ]}
            >
              Charts
            </Text>
          </TouchableOpacity>
        </View>

        {/* Top Summary Banner */}
        <View style={styles.summaryBanner}>
          <View style={styles.summaryCol}>
            <Text style={styles.summaryLabel}>Total conversations</Text>
            <Text style={styles.summaryValue}>{totalConversations}</Text>
            <Text style={styles.summaryDelta}>+14.8% vs previous period</Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryCol}>
            <Text style={styles.summaryLabel}>Total charges</Text>
            <Text style={styles.summaryValue}>₹{totalCharges.toFixed(2)}</Text>
            <Text style={styles.summaryDelta}>+14% charges vs previous period</Text>
          </View>
        </View>

        {/* View Mode: Table */}
        {activeTab === 'Table' && (
          <View style={styles.tableSection}>
            <Text style={styles.tableSectionTitle}>Daily conversation data</Text>
            <Text style={styles.tableSectionSub}>
              Tap a date to see category details
            </Text>

            {dailyData.map((item) => {
              const isExpanded = expandedDates.includes(item.date);
              return (
                <View key={item.date} style={styles.dateAccordionCard}>
                  {/* Date Header */}
                  <TouchableOpacity
                    style={styles.accordionHeader}
                    onPress={() => toggleExpandDate(item.date)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.accordionHeaderLeft}>
                      <View style={styles.greenDot} />
                      <View>
                        <Text style={styles.dateLabel}>{item.date}</Text>
                        <Text style={styles.dateConversations}>
                          {item.totalConversations} conversations
                        </Text>
                      </View>
                    </View>

                    <View style={styles.accordionHeaderRight}>
                      <Text style={styles.totalChargesText}>
                        ₹{item.totalCharges.toFixed(2)}
                      </Text>
                      <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={16}
                        color="#00B67A"
                        style={{ marginLeft: 6 }}
                      />
                    </View>
                  </TouchableOpacity>

                  {/* Expanded Categories Breakdown */}
                  {isExpanded && (
                    <View style={styles.categoriesContainer}>
                      {item.categories.map((cat) => (
                        <View key={cat.name} style={styles.categoryRow}>
                          <View
                            style={[
                              styles.categoryColorBar,
                              { backgroundColor: cat.color },
                            ]}
                          />
                          <View style={{ flex: 1, marginLeft: 10 }}>
                            <Text style={styles.catName}>{cat.name}</Text>
                            <Text style={styles.catCount}>
                              {cat.count} conversations
                            </Text>
                          </View>
                          <Text style={styles.catCharge}>
                            ₹{cat.charge.toFixed(2)}
                          </Text>
                          <Ionicons
                            name="chevron-forward"
                            size={14}
                            color="#CBD5E1"
                            style={{ marginLeft: 6 }}
                          />
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* View Mode: Charts */}
        {activeTab === 'Charts' && (
          <View style={styles.chartsSection}>
            {/* Daily Trend Card */}
            <View style={styles.trendChartCard}>
              <View style={styles.trendChartHeader}>
                <View>
                  <Text style={styles.chartTitle}>Daily conversation trend</Text>
                  <Text style={styles.chartSub}>Conversations metrics by day</Text>
                </View>
                <TouchableOpacity>
                  <Ionicons name="ellipsis-horizontal" size={18} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              {/* Legend */}
              <View style={styles.chartLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
                  <Text style={styles.legendText}>Sent</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#00B67A' }]} />
                  <Text style={styles.legendText}>Delivered</Text>
                </View>
              </View>

              {/* Visual Simulated SVG Chart */}
              <View style={styles.trendGraphBox}>
                <View style={styles.graphGridLine} />
                <View style={styles.graphGridLine} />
                <View style={styles.graphGridLine} />
                <View style={styles.graphTrendLines}>
                  <View style={styles.pointDotBlue} />
                  <View style={styles.pointDotGreen} />
                </View>
                <View style={styles.graphXAxis}>
                  <Text style={styles.axisLabel}>Nov 12</Text>
                  <Text style={styles.axisLabel}>Nov 15</Text>
                  <Text style={styles.axisLabel}>Nov 18</Text>
                </View>
              </View>
            </View>

            {/* Category Volume & Distribution Row */}
            <View style={styles.chartsBottomRow}>
              {/* Category Volume Bar Chart */}
              <View style={styles.miniChartCard}>
                <Text style={styles.miniChartTitle}>Category volume</Text>
                <View style={styles.barChartContainer}>
                  <View style={styles.barCol}>
                    <View style={[styles.bar, { height: 48, backgroundColor: '#00B67A' }]} />
                  </View>
                  <View style={styles.barCol}>
                    <View style={[styles.bar, { height: 28, backgroundColor: '#3B82F6' }]} />
                  </View>
                  <View style={styles.barCol}>
                    <View style={[styles.bar, { height: 16, backgroundColor: '#EF4444' }]} />
                  </View>
                  <View style={styles.barCol}>
                    <View style={[styles.bar, { height: 22, backgroundColor: '#8B5CF6' }]} />
                  </View>
                </View>
              </View>

              {/* Distribution */}
              <View style={styles.miniChartCard}>
                <Text style={styles.miniChartTitle}>Distribution</Text>
                <View style={styles.distributionBox}>
                  <Text style={styles.distributionBig}>{totalConversations}</Text>
                  <Text style={styles.distributionSub}>Total</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Date Filter Bottom Sheet */}
      <DateFilterModal
        visible={showFilterModal}
        activePreset={activePreset}
        onClose={() => setShowFilterModal(false)}
        onApply={({ preset }) => {
          setActivePreset(preset);
          loadData();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingTop: Platform.OS === 'android' ? 28 : 0,
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
  toggleTabBar: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 3,
    marginBottom: 16,
  },
  toggleTabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleTabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  toggleTabText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  toggleTabTextActive: {
    color: '#00B67A',
    fontWeight: '700',
  },
  summaryBanner: {
    backgroundColor: '#00593B',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    marginBottom: 20,
  },
  summaryCol: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#A7F3D0',
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  summaryDelta: {
    fontSize: 10,
    color: '#D1FAE5',
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginHorizontal: 14,
  },
  tableSection: {
    marginBottom: 10,
  },
  tableSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  tableSectionSub: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 14,
  },
  dateAccordionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 12,
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  accordionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00B67A',
    marginRight: 10,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  dateConversations: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  accordionHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalChargesText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00B67A',
  },
  categoriesContainer: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    gap: 10,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  categoryColorBar: {
    width: 4,
    height: 28,
    borderRadius: 2,
  },
  catName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  catCount: {
    fontSize: 11,
    color: '#64748B',
  },
  catCharge: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },

  // Charts
  chartsSection: {
    gap: 14,
  },
  trendChartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  trendChartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  chartSub: {
    fontSize: 11,
    color: '#64748B',
  },
  chartLegend: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 14,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  legendText: {
    fontSize: 11,
    color: '#64748B',
  },
  trendGraphBox: {
    height: 120,
    justifyContent: 'space-between',
    position: 'relative',
    marginTop: 10,
  },
  graphGridLine: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  graphTrendLines: {
    position: 'absolute',
    top: 30,
    left: 20,
    right: 20,
    bottom: 25,
    borderBottomWidth: 2,
    borderBottomColor: '#00B67A',
  },
  pointDotBlue: {
    position: 'absolute',
    top: 10,
    left: '45%',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
  },
  pointDotGreen: {
    position: 'absolute',
    top: 24,
    left: '80%',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00B67A',
  },
  graphXAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 6,
  },
  axisLabel: {
    fontSize: 10,
    color: '#94A3B8',
  },
  chartsBottomRow: {
    flexDirection: 'row',
    gap: 12,
  },
  miniChartCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  miniChartTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  barChartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 60,
  },
  barCol: {
    alignItems: 'center',
  },
  bar: {
    width: 14,
    borderRadius: 4,
  },
  distributionBox: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
  },
  distributionBig: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  distributionSub: {
    fontSize: 11,
    color: '#64748B',
  },
});
