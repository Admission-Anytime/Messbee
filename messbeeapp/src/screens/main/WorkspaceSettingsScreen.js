import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { tenantSettingsService } from '../../services/api';

export default function WorkspaceSettingsScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [currency, setCurrency] = useState('INR');
  const [autoAssignChats, setAutoAssignChats] = useState(true);
  const [soundNotifications, setSoundNotifications] = useState(true);
  const [automationLogs, setAutomationLogs] = useState([]);

  const loadData = useCallback(async () => {
    try {
      const [settings, logs] = await Promise.all([
        tenantSettingsService.getSettings(),
        tenantSettingsService.getAutomationActivity(),
      ]);
      if (settings) {
        if (settings.timezone) setTimezone(settings.timezone);
        if (settings.currency) setCurrency(settings.currency);
        if (settings.autoAssignChats !== undefined) setAutoAssignChats(Boolean(settings.autoAssignChats));
        if (settings.soundNotifications !== undefined) setSoundNotifications(Boolean(settings.soundNotifications));
      }
      setAutomationLogs(Array.isArray(logs) ? logs : []);
    } catch (err) {
      console.warn('WorkspaceSettings load error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveSettings = async () => {
    if (!timezone.trim() || !currency.trim()) {
      Alert.alert('Validation Error', 'Timezone and Currency cannot be empty.');
      return;
    }
    setSaving(true);
    try {
      await tenantSettingsService.updateSettings({
        timezone: timezone.trim(),
        currency: currency.trim().toUpperCase(),
        autoAssignChats,
        soundNotifications,
      });
      Alert.alert('Saved', 'Workspace settings updated successfully!');
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to update workspace settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Workspace & Logs</Text>
        <View style={{ width: 32 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#00B67A" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} colors={['#00B67A']} />}
        >
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Tenant Workspace Preferences</Text>

            <Text style={styles.label}>Default Timezone</Text>
            <TextInput style={styles.input} value={timezone} onChangeText={setTimezone} placeholder="Asia/Kolkata" />

            <Text style={styles.label}>Default Currency Code</Text>
            <TextInput style={styles.input} value={currency} onChangeText={setCurrency} placeholder="INR" autoCapitalize="characters" maxLength={5} />

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Auto-assign incoming chats to agents</Text>
              <Switch
                value={autoAssignChats}
                onValueChange={setAutoAssignChats}
                trackColor={{ false: '#CBD5E1', true: '#A7F3D0' }}
                thumbColor={autoAssignChats ? '#00B67A' : '#F8FAFC'}
              />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Sound alerts for new messages</Text>
              <Switch
                value={soundNotifications}
                onValueChange={setSoundNotifications}
                trackColor={{ false: '#CBD5E1', true: '#A7F3D0' }}
                thumbColor={soundNotifications ? '#00B67A' : '#F8FAFC'}
              />
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveSettings} disabled={saving}>
              {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveBtnText}>Save Preferences</Text>}
            </TouchableOpacity>
          </View>

          <Text style={styles.logsHeading}>Recent Automation Activity ({automationLogs.length})</Text>
          {automationLogs.length === 0 ? (
            <View style={styles.card}>
              <Text style={styles.emptyText}>No recent bot or workflow execution logs.</Text>
            </View>
          ) : (
            automationLogs.slice(0, 15).map((log, idx) => (
              <View key={log._id || idx} style={styles.logCard}>
                <Ionicons name="flash-outline" size={18} color="#00B67A" />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.logTitle}>{log.ruleName || log.action || 'Automation Triggered'}</Text>
                  <Text style={styles.logSub}>{log.details || log.status || 'Executed'}</Text>
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
  scrollContent: { padding: 16, gap: 12 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 8 },
  label: { fontSize: 12, fontWeight: '600', color: '#475569', marginTop: 10, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#0F172A' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 },
  switchLabel: { fontSize: 13, color: '#334155', flex: 1, marginRight: 10 },
  saveBtn: { backgroundColor: '#00B67A', paddingVertical: 13, borderRadius: 10, alignItems: 'center', marginTop: 18 },
  saveBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  logsHeading: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginTop: 6 },
  emptyText: { fontSize: 13, color: '#94A3B8', textAlign: 'center', paddingVertical: 8 },
  logCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  logTitle: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  logSub: { fontSize: 12, color: '#64748B', marginTop: 2 },
});
