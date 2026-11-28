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

export default function TemplateAnalyticsScreen({ navigation }) {
  const [timeframe, setTimeframe] = useState('Daily');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tmplData, setTmplData] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [activePreset, setActivePreset] = useState('30d');
  const [customDates, setCustomDates] = useState({ fromDate: '', toDate: '' });

  // Performance Modal
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showPerfModal, setShowPerfModal] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const range = getDateRangeFromPreset(activePreset, customDates.fromDate, customDates.toDate);
      const params = {
        groupBy: timeframe.toLowerCase(),
        ...range,
      };
      const [data, user] = await Promise.all([
        analyticsService.getTemplateAnalytics(params).catch(() => null),
        authService.getCurrentUser().catch(() => null),
      ]);
      if (data) setTmplData(data);
      if (user) setUserProfile(user);
    } catch (err) {
      console.warn('Error loading template analytics:', err.message);
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

  const totalSent = tmplData?.summary?.totalSent || 0;
  const deliveryRate = tmplData?.summary?.deliveryRate || '0.0';
  const readRate = tmplData?.summary?.readRate || '0.0';

  const templateList = tmplData?.engagement || [];

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
          <Text style={styles.pageTitle}>Templates</Text>
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
            <Ionicons name="document-text-outline" size={20} color="#00B67A" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.mainHeading}>Template Analytics</Text>
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

        {/* Timeframe Pills */}
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

        {/* 3 Metrics Cards */}
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
            <Text style={styles.metricValue}>{deliveryRate}%</Text>
            <Text style={styles.metricDelta}>Delivery rate</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIconBox, { backgroundColor: '#FEF2F2' }]}>
              <Ionicons name="eye-outline" size={16} color="#EF4444" />
            </View>
            <Text style={styles.metricLabel}>Read rate</Text>
            <Text style={styles.metricValue}>{readRate}%</Text>
            <Text style={styles.metricDelta}>Engagement</Text>
          </View>
        </View>

        {/* Template Engagement Section */}
        <View style={styles.engagementCard}>
          <Text style={styles.cardHeading}>Template Engagement</Text>
          <Text style={styles.cardSubheading}>
            Tap a template for complete metrics
          </Text>

          {/* Table Header */}
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.thText, { flex: 2 }]}>TEMPLATE</Text>
            <Text style={[styles.thText, { flex: 1, textAlign: 'center' }]}>SENT</Text>
            <Text style={[styles.thText, { flex: 1, textAlign: 'right', paddingRight: 16 }]}>
              READ
            </Text>
          </View>

          {/* Template Rows */}
          {templateList.length === 0 ? (
            <View style={{ padding: 28, alignItems: 'center' }}>
              <Ionicons name="document-text-outline" size={32} color="#94A3B8" />
              <Text style={{ marginTop: 8, color: '#64748B', fontSize: 13 }}>No template metrics found for this period</Text>
            </View>
          ) : (
            templateList.map((tmpl, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.tableRow}
                onPress={() => {
                  setSelectedTemplate(tmpl);
                  setShowPerfModal(true);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.tmplNameCol}>
                  <View style={styles.dotIndicator} />
                  <View>
                    <Text style={styles.tmplNameText}>{tmpl.name}</Text>
                    <Text style={styles.tmplLangText}>{tmpl.language}</Text>
                  </View>
                </View>

                <Text style={styles.rowSentText}>{tmpl.sent}</Text>

                <View style={styles.readCol}>
                  <Text style={styles.rowReadText}>{tmpl.read}</Text>
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

      {/* Template Performance Modal */}
      <Modal
        visible={showPerfModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPerfModal(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowPerfModal(false)}
        >
          <View style={styles.perfSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.sheetHandle} />

            <View style={styles.perfHeader}>
              <Text style={styles.perfTitle}>Template performance</Text>
              <TouchableOpacity onPress={() => setShowPerfModal(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* WhatsApp Template Preview Box */}
            <View style={styles.waPreviewContainer}>
              <Text style={styles.waPreviewNotice}>WHATSAPP TEMPLATE</Text>
              <View style={styles.waMessageBubble}>
                <Text style={styles.waBubbleTitle}>
                  {selectedTemplate?.name || 'Template'}
                </Text>
                <Text style={styles.waBubbleBody}>
                  {selectedTemplate?.body ||
                    `Template "${selectedTemplate?.name || ''}" (${selectedTemplate?.language || 'en'})`}
                </Text>
                {!!selectedTemplate?.buttonLabel && (
                  <View style={styles.waBubbleButton}>
                    <Text style={styles.waBubbleButtonText}>
                      {selectedTemplate.buttonLabel}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Template Title & Status */}
            <View style={styles.tmplDetailHeader}>
              <View>
                <Text style={styles.tmplDetailName}>
                  {selectedTemplate?.name || 'Template'}
                </Text>
                <Text style={styles.tmplDetailMeta}>
                  {selectedTemplate?.language || 'en'} •{' '}
                  {selectedTemplate?.category || 'Marketing'}
                </Text>
              </View>
              <View style={styles.approvedBadge}>
                <Text style={styles.approvedText}>{selectedTemplate?.status || 'Approved'}</Text>
              </View>
            </View>

            {/* 4 Stat Boxes (2x2 Grid) */}
            {(() => {
              const s = selectedTemplate?.sent || 0;
              const d = selectedTemplate?.delivered || 0;
              const r = selectedTemplate?.read || 0;
              const f = selectedTemplate?.failed || 0;
              const dRate = s > 0 ? Math.round((d / s) * 100) : 0;
              const rRate = s > 0 ? Math.round((r / s) * 100) : 0;
              return (
                <View style={styles.statsGrid}>
                  <View style={styles.statBox}>
                    <Text style={styles.statBoxLabel}>Total sent</Text>
                    <Text style={styles.statBoxVal}>{s}</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statBoxLabel}>Delivered</Text>
                    <Text style={styles.statBoxVal}>{d}</Text>
                    <Text style={styles.statBoxSub}>Delivery rate {dRate}%</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statBoxLabel}>Read</Text>
                    <Text style={styles.statBoxVal}>{r}</Text>
                    <Text style={styles.statBoxSub}>Read rate {rRate}%</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statBoxLabel}>Failed</Text>
                    <Text style={styles.statBoxVal}>{f}</Text>
                  </View>
                </View>
              );
            })()}

            {/* Total charges row */}
            <View style={styles.chargesRow}>
              <Text style={styles.chargesLabel}>Estimated charges</Text>
              <Text style={styles.chargesVal}>
                ₹{Number(selectedTemplate?.charges || 0).toFixed(2)}
              </Text>
            </View>

            {/* View Associated Campaigns Button */}
            <TouchableOpacity
              style={styles.viewAssociatedBtn}
              onPress={() => {
                setShowPerfModal(false);
                navigation.navigate('CampaignAnalytics');
              }}
            >
              <Text style={styles.viewAssociatedText}>View associated campaigns</Text>
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
  engagementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
  },
  cardHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  cardSubheading: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 14,
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
  tmplNameCol: {
    flex: 2,
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
  tmplNameText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  tmplLangText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  rowSentText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
    color: '#475569',
  },
  readCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  rowReadText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },

  // Performance Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  perfSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    maxHeight: '90%',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  perfHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  perfTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  waPreviewContainer: {
    backgroundColor: '#EDF9F2',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#C6EED5',
  },
  waPreviewNotice: {
    fontSize: 9,
    fontWeight: '700',
    color: '#00B67A',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  waMessageBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
  },
  waBubbleTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  waBubbleBody: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 16,
    marginBottom: 10,
  },
  waBubbleButton: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
    alignItems: 'center',
  },
  waBubbleButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00B67A',
  },
  tmplDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tmplDetailName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  tmplDetailMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  approvedBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  approvedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  statBox: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statBoxLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 2,
  },
  statBoxVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  statBoxSub: {
    fontSize: 10,
    color: '#00B67A',
    marginTop: 2,
  },
  chargesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginBottom: 16,
  },
  chargesLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  chargesVal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  viewAssociatedBtn: {
    backgroundColor: '#00B67A',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  viewAssociatedText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
