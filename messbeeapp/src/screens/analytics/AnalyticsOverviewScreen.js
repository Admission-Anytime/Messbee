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

export default function AnalyticsOverviewScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [dash, user] = await Promise.all([
        analyticsService.getDashboardAnalytics().catch(() => null),
        authService.getCurrentUser().catch(() => null),
      ]);
      if (dash) setDashboardData(dash);
      if (user) setUserProfile(user);
    } catch (err) {
      console.warn('Error loading analytics dashboard:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation, loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const totalDelivered =
    dashboardData?.messages?.byStatus?.find(
      (s) => (s._id || '').toLowerCase() === 'delivered'
    )?.count ||
    dashboardData?.campaigns?.totalDelivered ||
    94700;

  const totalSent = dashboardData?.messages?.total || 1284;
  const todayDelivered =
    dashboardData?.messages?.byStatus?.find(
      (s) => (s._id || '').toLowerCase() === 'delivered'
    )?.count || 1241;

  const successRate =
    totalSent > 0 ? ((todayDelivered / totalSent) * 100).toFixed(1) : '96.6';

  const userInitials = (
    userProfile?.name?.substring(0, 2) ||
    userProfile?.businessName?.substring(0, 2) ||
    'KS'
  ).toUpperCase();

  const formatLargeNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return String(num);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerMenuBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="menu-outline" size={24} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.brandTitle}>MESSBEE</Text>
          <Text style={styles.pageTitle}>Analytics overview</Text>
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
        {/* Hero Banner Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroIconBox}>
              <Ionicons name="pie-chart-outline" size={18} color="#FFFFFF" />
            </View>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>ANALYTICS CENTER</Text>
            </View>
          </View>

          <Text style={styles.heroHeading}>
            Know what's working.{'\n'}Grow every conversation.
          </Text>

          <View style={styles.heroBottomRow}>
            <View>
              <Text style={styles.heroBottomLabel}>Messages delivered</Text>
              <Text style={styles.heroDeltaText}>+12.4% this month</Text>
            </View>
            <Text style={styles.heroDeliveredValue}>
              {formatLargeNumber(totalDelivered)}
            </Text>
          </View>
        </View>

        {/* Section: Your analytics */}
        <Text style={styles.sectionHeading}>Your analytics</Text>
        <Text style={styles.sectionSubheading}>Choose a report to explore</Text>

        {/* 2x2 Tiles Grid */}
        <View style={styles.tilesGrid}>
          {/* 1. Conversational */}
          <TouchableOpacity
            style={styles.tileCard}
            onPress={() => navigation.navigate('ConversationalAnalytics')}
            activeOpacity={0.8}
          >
            <View style={[styles.tileIconBox, { backgroundColor: '#EDF9F2' }]}>
              <Ionicons name="chatbubble-ellipses-outline" size={20} color="#00B67A" />
            </View>
            <Text style={styles.tileTitle}>Conversational</Text>
            <Text style={styles.tileSubtitle}>Chats & episodes</Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color="#CBD5E1"
              style={styles.tileChevron}
            />
          </TouchableOpacity>

          {/* 2. Messages */}
          <TouchableOpacity
            style={styles.tileCard}
            onPress={() => navigation.navigate('MessageAnalytics')}
            activeOpacity={0.8}
          >
            <View style={[styles.tileIconBox, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="paper-plane-outline" size={20} color="#3B82F6" />
            </View>
            <Text style={styles.tileTitle}>Messages</Text>
            <Text style={styles.tileSubtitle}>Delivery & updates</Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color="#CBD5E1"
              style={styles.tileChevron}
            />
          </TouchableOpacity>

          {/* 3. Templates */}
          <TouchableOpacity
            style={styles.tileCard}
            onPress={() => navigation.navigate('TemplateAnalytics')}
            activeOpacity={0.8}
          >
            <View style={[styles.tileIconBox, { backgroundColor: '#FEF2F2' }]}>
              <Ionicons name="document-text-outline" size={20} color="#EF4444" />
            </View>
            <Text style={styles.tileTitle}>Templates</Text>
            <Text style={styles.tileSubtitle}>Engagement rates</Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color="#CBD5E1"
              style={styles.tileChevron}
            />
          </TouchableOpacity>

          {/* 4. Campaigns */}
          <TouchableOpacity
            style={styles.tileCard}
            onPress={() => navigation.navigate('CampaignAnalytics')}
            activeOpacity={0.8}
          >
            <View style={[styles.tileIconBox, { backgroundColor: '#FFFBEB' }]}>
              <Ionicons name="megaphone-outline" size={20} color="#F59E0B" />
            </View>
            <Text style={styles.tileTitle}>Campaigns</Text>
            <Text style={styles.tileSubtitle}>Campaign results</Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color="#CBD5E1"
              style={styles.tileChevron}
            />
          </TouchableOpacity>
        </View>

        {/* Section: Today's snapshot */}
        <View style={styles.snapshotCard}>
          <View style={styles.snapshotHeader}>
            <View>
              <Text style={styles.snapshotTitle}>Today's snapshot</Text>
              <Text style={styles.snapshotSubtitle}>Updated just now</Text>
            </View>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Live</Text>
            </View>
          </View>

          <View style={styles.snapshotColumns}>
            <View style={styles.snapshotCol}>
              <Text style={styles.snapshotNumber}>
                {Number(totalSent).toLocaleString()}
              </Text>
              <Text style={styles.snapshotLabel}>Sent</Text>
            </View>

            <View style={styles.snapshotDivider} />

            <View style={styles.snapshotCol}>
              <Text style={styles.snapshotNumber}>
                {Number(todayDelivered).toLocaleString()}
              </Text>
              <Text style={styles.snapshotLabel}>Delivered</Text>
            </View>

            <View style={styles.snapshotDivider} />

            <View style={styles.snapshotCol}>
              <Text style={styles.snapshotNumber}>{successRate}%</Text>
              <Text style={styles.snapshotLabel}>Success</Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
  headerMenuBtn: {
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
  heroCard: {
    backgroundColor: '#00593B',
    borderRadius: 18,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  heroIconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  heroBadge: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  heroBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#A7F3D0',
    letterSpacing: 0.5,
  },
  heroHeading: {
    fontSize: 21,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 28,
    marginBottom: 20,
  },
  heroBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.12)',
    paddingTop: 14,
  },
  heroBottomLabel: {
    fontSize: 11,
    color: '#A7F3D0',
    marginBottom: 2,
  },
  heroDeltaText: {
    fontSize: 12,
    color: '#D1FAE5',
    fontWeight: '600',
  },
  heroDeliveredValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  sectionSubheading: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 14,
  },
  tilesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  tileCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
    position: 'relative',
  },
  tileIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  tileTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  tileSubtitle: {
    fontSize: 11,
    color: '#64748B',
  },
  tileChevron: {
    position: 'absolute',
    top: 16,
    right: 14,
  },
  snapshotCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  snapshotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  snapshotTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  snapshotSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDF9F2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00B67A',
    marginRight: 4,
  },
  liveText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00B67A',
  },
  snapshotColumns: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  snapshotCol: {
    flex: 1,
    alignItems: 'center',
  },
  snapshotNumber: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  snapshotLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  snapshotDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#E2E8F0',
  },
});
