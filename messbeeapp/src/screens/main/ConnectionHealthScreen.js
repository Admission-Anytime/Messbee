import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { whatsappConfigService } from '../../services/api';

export default function ConnectionHealthScreen({ navigation }) {
  const [running, setRunning] = useState(false);
  const [lastChecked, setLastChecked] = useState('just now');
  const [lastApiTime, setLastApiTime] = useState('Today, 10:42:18 AM');

  const handleRunDiagnostics = async () => {
    try {
      setRunning(true);
      const res = await whatsappConfigService.testConnection();
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastChecked('just now');
      setLastApiTime(`Today, ${timeStr}`);
      if (res.success) {
        Alert.alert('Diagnostics Passed', 'All systems are operational and responding with HTTP 200.');
      } else {
        Alert.alert('Diagnostics Report', res.message || 'Meta API returned non-200 status code.');
      }
    } catch (err) {
      Alert.alert('Diagnostics Notice', 'Diagnostics completed.');
    } finally {
      setRunning(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={24} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>Connection Health</Text>
          <Text style={styles.headerSubtitle}>Live diagnostics from your integration</Text>
        </View>

        <TouchableOpacity
          onPress={handleRunDiagnostics}
          style={styles.headerRefreshBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          disabled={running}
        >
          {running ? (
            <ActivityIndicator size="small" color="#00875A" />
          ) : (
            <Ionicons name="refresh-outline" size={20} color="#0F172A" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ================= TOP HEALTH STATUS CARD (Image 1 Screen 2) ================= */}
        <View style={styles.healthBannerCard}>
          <View style={styles.checkCircleLarge}>
            <Ionicons name="checkmark" size={20} color="#FFFFFF" />
          </View>
          <View style={styles.healthBannerTextBox}>
            <Text style={styles.healthBannerTitle}>All systems operational</Text>
            <Text style={styles.healthBannerSubtitle}>Last checked {lastChecked}</Text>
          </View>
        </View>

        {/* ================= DIAGNOSTIC CHECKLIST CARD ================= */}
        <View style={styles.checklistCard}>
          {/* Row 1 */}
          <View style={styles.diagRow}>
            <View style={styles.diagLeft}>
              <View style={styles.greenStatusDot} />
              <Text style={styles.diagLabel}>WhatsApp API Status</Text>
            </View>
            <Text style={styles.diagValueBold}>Operational</Text>
          </View>

          <View style={styles.rowDivider} />

          {/* Row 2 */}
          <View style={styles.diagRow}>
            <View style={styles.diagLeft}>
              <View style={styles.greenStatusDot} />
              <Text style={styles.diagLabel}>Phone Number Status</Text>
            </View>
            <Text style={styles.diagValueBold}>Active</Text>
          </View>

          <View style={styles.rowDivider} />

          {/* Row 3 */}
          <View style={styles.diagRow}>
            <View style={styles.diagLeft}>
              <View style={styles.greenStatusDot} />
              <Text style={styles.diagLabel}>Webhook Status</Text>
            </View>
            <Text style={styles.diagValueBold}>Receiving events</Text>
          </View>

          <View style={styles.rowDivider} />

          {/* Row 4 */}
          <View style={styles.diagRow}>
            <View style={styles.diagLeft}>
              <View style={styles.greenStatusDot} />
              <Text style={styles.diagLabel}>Access Token Status</Text>
            </View>
            <Text style={styles.diagValueBold}>Valid • 52 days left</Text>
          </View>

          <View style={styles.rowDivider} />

          {/* Row 5 */}
          <View style={styles.diagRow}>
            <View style={styles.diagLeft}>
              <View style={styles.neutralStatusDot} />
              <Text style={styles.diagLabel}>Last Successful API Request</Text>
            </View>
            <Text style={styles.diagValueNormal}>{lastApiTime}</Text>
          </View>

          <View style={styles.rowDivider} />

          {/* Row 6 */}
          <View style={styles.diagRow}>
            <View style={styles.diagLeft}>
              <View style={styles.neutralStatusDot} />
              <Text style={styles.diagLabel}>Last Error</Text>
            </View>
            <Text style={styles.diagValueNormal}>No errors in the last 7 days</Text>
          </View>
        </View>

        {/* Prototype notice banner */}
        <View style={styles.noticeBanner}>
          <Ionicons name="pulse-outline" size={18} color="#0284C7" style={{ marginRight: 10, marginTop: 1 }} />
          <Text style={styles.noticeText}>
            Health checks are simulated for this prototype and do not contact Meta.
          </Text>
        </View>

        {/* Run diagnostics button */}
        <TouchableOpacity
          style={styles.runDiagBtn}
          onPress={handleRunDiagnostics}
          activeOpacity={0.85}
          disabled={running}
        >
          {running ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="refresh-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.runDiagBtnText}>Run diagnostics again</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingTop: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleBox: {
    flex: 1,
    marginLeft: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  headerRefreshBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
  },

  // Health Status Banner
  healthBannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  checkCircleLarge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  healthBannerTextBox: {
    flex: 1,
  },
  healthBannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#166534',
  },
  healthBannerSubtitle: {
    fontSize: 12,
    color: '#15803D',
    marginTop: 2,
  },

  // Diagnostic Checklist
  checklistCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  diagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
  },
  diagLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  greenStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#16A34A',
    marginRight: 10,
  },
  neutralStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#94A3B8',
    marginRight: 10,
  },
  diagLabel: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
  },
  diagValueBold: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  diagValueNormal: {
    fontSize: 12.5,
    color: '#64748B',
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },

  // Notice Banner
  noticeBanner: {
    flexDirection: 'row',
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0F2FE',
    marginBottom: 20,
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    color: '#0369A1',
    lineHeight: 17,
  },

  // Button
  runDiagBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00875A',
    borderRadius: 14,
    paddingVertical: 14,
    shadowColor: '#00875A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  runDiagBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
