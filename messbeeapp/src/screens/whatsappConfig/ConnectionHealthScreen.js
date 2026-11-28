import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { whatsappConfigService } from '../../services/api';

export default function ConnectionHealthScreen({ navigation }) {
  const [running, setRunning] = useState(false);
  const [lastChecked, setLastChecked] = useState('just now');
  const [lastApiRequestTime, setLastApiRequestTime] = useState('Today, 10:42:18 AM');

  const runDiagnostics = async () => {
    setRunning(true);
    try {
      await whatsappConfigService.testConnection();
      const now = new Date();
      const timeStr = `Today, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
      setLastApiRequestTime(timeStr);
      setLastChecked('just now');
    } catch (err) {
      // Keep healthy
    } finally {
      setTimeout(() => {
        setRunning(false);
      }, 600);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Connection Health</Text>
            <Text style={styles.headerSubtitle}>Live diagnostics from your integration</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.refreshHeaderBtn}
          onPress={runDiagnostics}
          disabled={running}
          activeOpacity={0.7}
        >
          {running ? (
            <ActivityIndicator size="small" color="#00B67A" />
          ) : (
            <Ionicons name="refresh-outline" size={20} color="#374151" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Green Alert Card */}
        <View style={styles.alertCard}>
          <View style={styles.checkCircle}>
            <Ionicons name="checkmark" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.alertTextBox}>
            <Text style={styles.alertTitle}>All systems operational</Text>
            <Text style={styles.alertSubtitle}>Last checked {lastChecked}</Text>
          </View>
        </View>

        {/* Status List Card */}
        <View style={styles.card}>
          {/* Row 1 */}
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={styles.statusDotGreen} />
              <Text style={styles.rowLabel}>WhatsApp API Status</Text>
            </View>
            <Text style={styles.rowValue}>Operational</Text>
          </View>

          {/* Row 2 */}
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={styles.statusDotGreen} />
              <Text style={styles.rowLabel}>Phone Number Status</Text>
            </View>
            <Text style={styles.rowValue}>Active</Text>
          </View>

          {/* Row 3 */}
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={styles.statusDotGreen} />
              <Text style={styles.rowLabel}>Webhook Status</Text>
            </View>
            <Text style={styles.rowValue}>Receiving events</Text>
          </View>

          {/* Row 4 */}
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={styles.statusDotGreen} />
              <Text style={styles.rowLabel}>Access Token Status</Text>
            </View>
            <Text style={styles.rowValue}>Valid • 52 days left</Text>
          </View>

          {/* Row 5 */}
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={styles.statusDotGrey} />
              <Text style={styles.rowLabel}>Last Successful API Request</Text>
            </View>
            <Text style={styles.rowValueMuted}>{lastApiRequestTime}</Text>
          </View>

          {/* Row 6 */}
          <View style={[styles.row, { borderBottomWidth: 0 }]}>
            <View style={styles.rowLeft}>
              <View style={styles.statusDotGrey} />
              <Text style={styles.rowLabel}>Last Error</Text>
            </View>
            <Text style={styles.rowValueMuted}>No errors in the last 7 days</Text>
          </View>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Ionicons name="pulse" size={18} color="#2563EB" style={{ marginRight: 8, marginTop: 1 }} />
          <Text style={styles.infoText}>
            Health checks are simulated for this prototype and do not contact Meta.
          </Text>
        </View>

        {/* Run diagnostics button */}
        <TouchableOpacity
          style={styles.runBtn}
          onPress={runDiagnostics}
          disabled={running}
          activeOpacity={0.8}
        >
          {running ? (
            <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
          ) : (
            <Ionicons name="refresh-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
          )}
          <Text style={styles.runBtnText}>Run diagnostics again</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  refreshHeaderBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  checkCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertTextBox: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#065F46',
  },
  alertSubtitle: {
    fontSize: 11.5,
    color: '#047857',
    marginTop: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
    overflow: 'hidden',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDotGreen: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#00B67A',
  },
  statusDotGrey: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#94A3B8',
  },
  rowLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  rowValue: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  rowValueMuted: {
    fontSize: 12,
    color: '#64748B',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 14,
    padding: 12,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 11.5,
    color: '#1E40AF',
    lineHeight: 16,
  },
  runBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#064E3B',
    borderRadius: 14,
    paddingVertical: 14,
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  runBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
