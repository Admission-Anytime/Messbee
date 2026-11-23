import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { chatService } from '../../services/api';

const ACTIVITY_FILTERS = ['All Activity', 'Messages', 'Status Updates', 'Campaigns'];

export default function ContactFullHistoryScreen({ route, navigation }) {
  const { contact } = route.params || {};

  const [activeFilter, setActiveFilter] = useState('All Activity');
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch real activity logs from backend API if available
  useEffect(() => {
    let isMounted = true;
    const fetchLogs = async () => {
      const contactId = contact?._id || contact?.id;
      if (contactId) {
        try {
          setLoading(true);
          const logs = await chatService.getActivityLogs(contactId);
          if (isMounted && Array.isArray(logs)) {
            setActivities(
              logs.map((l, i) => ({
                id: l._id || `log_${i}`,
                title: l.action || 'Activity Update',
                time: l.createdAt ? new Date(l.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
                snippet: l.description || l.details || l.message || 'Message event processed',
                status: l.status || 'Completed',
              }))
            );
          }
        } catch (err) {
          console.warn('getActivityLogs error:', err.message);
        } finally {
          if (isMounted) setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchLogs();
    return () => {
      isMounted = false;
    };
  }, [contact?._id, contact?.id]);

  const handleExportLog = () => {
    Alert.alert('Export Log', 'Activity audit log exported successfully.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* Header (Matching Image 3 Screen 11) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Full History</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={handleExportLog} style={styles.headerBtn}>
            <Ionicons name="download-outline" size={20} color="#0F172A" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn}>
            <Ionicons name="ellipsis-vertical" size={20} color="#0F172A" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Contact Summary Header Card */}
        <View style={styles.contactRow}>
          <View style={styles.avatarSquircle}>
            <Text style={styles.avatarInitials}>{contact?.name?.slice(0, 2) || '91'}</Text>
          </View>
          <View style={styles.contactMetaCol}>
            <View style={styles.nameStatusRow}>
              <Text style={styles.contactName}>{contact?.name || '919350157447'}</Text>
              <View style={styles.openPill}>
                <View style={styles.openDot} />
                <Text style={styles.openPillText}>OPEN</Text>
              </View>
            </View>
            <Text style={styles.contactPhone}>{contact?.phone || '+91 9350157447'}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('ChatDetail', { chat: contact })}>
            <Text style={styles.backChatLink}>Back to Chat &gt;</Text>
          </TouchableOpacity>
        </View>

        {/* 3 Metrics Cards Row */}
        <View style={styles.metricsRow}>
          {/* Card 1: Green Total Interactions */}
          <View style={styles.metricCardGreen}>
            <Text style={styles.metricGreenLabel}>TOTAL INTERACTIO...</Text>
            <Text style={styles.metricGreenVal}>28</Text>
            <Text style={styles.metricGreenSub}>+21 this week</Text>
          </View>

          {/* Card 2: Avg Response Time */}
          <View style={styles.metricCardWhite}>
            <Text style={styles.metricWhiteLabel}>AVG. RESPONS...</Text>
            <Text style={styles.metricWhiteVal}>7m</Text>
            <Text style={styles.metricWhiteSub}>Agent response</Text>
          </View>

          {/* Card 3: Lead Since */}
          <View style={styles.metricCardWhite}>
            <Text style={styles.metricWhiteLabel}>LEAD SINCE</Text>
            <Text style={styles.metricWhiteVal}>Oct 08</Text>
            <Text style={styles.metricWhiteSub}>2026</Text>
          </View>
        </View>

        {/* Section: Contact Activity */}
        <Text style={styles.sectionHeadingTag}>CONTACT ACTIVITY</Text>
        <View style={styles.timelineHeaderRow}>
          <Text style={styles.timelineTitle}>Activity timeline</Text>
          <TouchableOpacity style={styles.searchIconBtn}>
            <Ionicons name="search-outline" size={18} color="#0F172A" />
          </TouchableOpacity>
        </View>

        {/* Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterPillsRow}>
          {ACTIVITY_FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterPill, activeFilter === f && styles.filterPillActive]}
              onPress={() => setActiveFilter(f)}
            >
              <Text style={[styles.filterPillText, activeFilter === f && styles.filterPillTextActive]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Timeline Header: TODAY */}
        <Text style={styles.todayHeader}>TODAY</Text>

        {/* Timeline Items */}
        {loading ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator size="small" color="#00875A" />
            <Text style={{ marginTop: 10, color: '#64748B', fontSize: 13 }}>Loading activity logs...</Text>
          </View>
        ) : activities.length === 0 ? (
          <View style={{ paddingVertical: 40, alignItems: 'center', paddingHorizontal: 30 }}>
            <Ionicons name="time-outline" size={40} color="#CBD5E1" />
            <Text style={{ marginTop: 12, fontSize: 15, fontWeight: '600', color: '#0F172A' }}>No activity logs yet</Text>
            <Text style={{ marginTop: 4, fontSize: 13, color: '#64748B', textAlign: 'center' }}>
              Events, message interactions, and status updates for this contact will appear here.
            </Text>
          </View>
        ) : (
          activities.map((item) => (
            <View key={item.id} style={styles.timelineItemRow}>
              <View style={styles.timelineIconCol}>
                <View style={styles.whatsappIconCircle}>
                  <Ionicons name="logo-whatsapp" size={14} color="#00875A" />
                </View>
                <View style={styles.timelineLine} />
              </View>

              <View style={styles.activityCard}>
                <View style={styles.cardTopRow}>
                  <View style={styles.cardTitleRow}>
                    <Ionicons name="document-text-outline" size={13} color="#64748B" style={{ marginRight: 6 }} />
                    <Text style={styles.activityTitle}>{item.title}</Text>
                  </View>
                  <Text style={styles.activityTime}>{item.time}</Text>
                </View>

                <Text style={styles.activitySnippet}>{item.snippet}</Text>

                <View style={styles.cardBottomRow}>
                  <View style={styles.sentStatusRow}>
                    <View style={styles.sentDot} />
                    <Text style={styles.sentText}>{item.status}</Text>
                  </View>
                  <TouchableOpacity>
                    <Text style={styles.viewDetailsLink}>View details &gt;</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Floating Export Log Button */}
      <View style={styles.floatingContainer}>
        <TouchableOpacity style={styles.exportLogBtn} onPress={handleExportLog} activeOpacity={0.85}>
          <Ionicons name="download-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.exportLogBtnText}>Export Log</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? 36 : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  headerBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 80,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarSquircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#00875A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarInitials: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  contactMetaCol: {
    flex: 1,
  },
  nameStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactName: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
    marginRight: 6,
  },
  openPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  openDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#00875A',
    marginRight: 4,
  },
  openPillText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#00875A',
  },
  contactPhone: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  backChatLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00875A',
  },

  // Metrics
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  metricCardGreen: {
    flex: 1.1,
    backgroundColor: '#00875A',
    borderRadius: 14,
    padding: 12,
  },
  metricGreenLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#A7F3D0',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  metricGreenVal: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  metricGreenSub: {
    fontSize: 10,
    color: '#DCFCE7',
  },
  metricCardWhite: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
  },
  metricWhiteLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  metricWhiteVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  metricWhiteSub: {
    fontSize: 10,
    color: '#64748B',
  },

  // Activity Section
  sectionHeadingTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00875A',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  timelineHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timelineTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  searchIconBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterPillsRow: {
    gap: 8,
    marginBottom: 16,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterPillActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  filterPillText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  todayHeader: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 12,
  },

  // Timeline Items
  timelineItemRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  timelineIconCol: {
    alignItems: 'center',
    marginRight: 10,
  },
  whatsappIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E2E8F0',
    marginTop: 4,
  },
  activityCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  activityTime: {
    fontSize: 10.5,
    color: '#94A3B8',
  },
  activitySnippet: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
    marginBottom: 10,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    paddingTop: 8,
  },
  sentStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sentDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#00875A',
    marginRight: 5,
  },
  sentText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00875A',
  },
  viewDetailsLink: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  floatingContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  exportLogBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  exportLogBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
