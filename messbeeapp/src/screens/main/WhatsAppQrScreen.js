import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { qrWhatsappService } from '../../services/api';
import { isValidPhone } from '../../utils/validation';

export default function WhatsAppQrScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusData, setStatusData] = useState({ connected: false, status: 'disconnected' });
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [pairingPhone, setPairingPhone] = useState('');
  const [pairingCode, setPairingCode] = useState('');
  const [generating, setGenerating] = useState(false);

  // Auto-Responder State
  const [autoEnabled, setAutoEnabled] = useState(false);
  const [autoMessage, setAutoMessage] = useState('');
  const [savingAuto, setSavingAuto] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [statusRes, autoRes] = await Promise.all([
        qrWhatsappService.getStatus(),
        qrWhatsappService.getAutoResponder(),
      ]);
      setStatusData(statusRes || { connected: false, status: 'disconnected' });
      if (statusRes?.qr) setQrCodeUrl(statusRes.qr);
      setAutoEnabled(Boolean(autoRes?.enabled));
      setAutoMessage(autoRes?.message || '');
    } catch (err) {
      console.warn('WhatsAppQrScreen loadData error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleGenerateQr = async () => {
    setGenerating(true);
    try {
      const res = await qrWhatsappService.generateQr();
      if (res?.qr || res?.qrCode) {
        setQrCodeUrl(res.qr || res.qrCode);
      }
      Alert.alert('QR Ready', 'Scan the QR code from WhatsApp -> Linked Devices.');
      loadData();
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || err.message || 'Failed to generate QR.');
    } finally {
      setGenerating(false);
    }
  };

  const handleGetPairingCode = async () => {
    if (!isValidPhone(pairingPhone)) {
      Alert.alert('Validation Error', 'Please enter a valid 10-15 digit phone number with country code.');
      return;
    }
    setGenerating(true);
    try {
      const res = await qrWhatsappService.getPairingCode(pairingPhone.trim());
      if (res?.code || res?.pairingCode) {
        setPairingCode(res.code || res.pairingCode);
      } else {
        Alert.alert('Pairing Requested', 'Check your WhatsApp app for the pairing prompt.');
      }
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || err.message || 'Failed to get pairing code.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDisconnect = () => {
    Alert.alert('Disconnect WhatsApp Web', 'Are you sure you want to unlink this session?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Disconnect',
        style: 'destructive',
        onPress: async () => {
          try {
            await qrWhatsappService.disconnect();
            setQrCodeUrl(null);
            setPairingCode('');
            loadData();
          } catch (err) {
            Alert.alert('Error', 'Failed to disconnect.');
          }
        },
      },
    ]);
  };

  const handleSaveAutoResponder = async () => {
    if (autoEnabled && !autoMessage.trim()) {
      Alert.alert('Validation Error', 'Please enter an auto-reply message before enabling.');
      return;
    }
    setSavingAuto(true);
    try {
      await qrWhatsappService.updateAutoResponder({
        enabled: autoEnabled,
        message: autoMessage.trim(),
      });
      Alert.alert('Saved', 'Auto-responder settings updated!');
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to update auto-responder.');
    } finally {
      setSavingAuto(false);
    }
  };

  const isConnected = statusData?.connected || statusData?.status === 'connected';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>QR WhatsApp Connect</Text>
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
          {/* Connection Status Card */}
          <View style={styles.card}>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: isConnected ? '#10B981' : '#EF4444' }]} />
              <Text style={styles.statusTitle}>
                {isConnected ? 'WhatsApp Web Connected' : 'Not Connected'}
              </Text>
            </View>
            <Text style={styles.statusSub}>
              {isConnected
                ? `Linked as ${statusData?.phone || statusData?.pushname || 'Active Session'}`
                : 'Link your WhatsApp directly without Meta Cloud API using QR or Pairing Code.'}
            </Text>

            {isConnected ? (
              <TouchableOpacity style={styles.disconnectBtn} onPress={handleDisconnect}>
                <Ionicons name="log-out-outline" size={18} color="#FFFFFF" />
                <Text style={styles.btnText}>Disconnect Session</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleGenerateQr}
                disabled={generating}
              >
                {generating ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="qr-code-outline" size={18} color="#FFFFFF" />
                    <Text style={styles.btnText}>Generate QR Code</Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            {qrCodeUrl && !isConnected && (
              <View style={styles.qrBox}>
                <Image source={{ uri: qrCodeUrl }} style={styles.qrImage} resizeMode="contain" />
                <Text style={styles.qrHint}>Scan via WhatsApp ➔ Linked Devices</Text>
              </View>
            )}
          </View>

          {/* Phone Pairing Code Card */}
          {!isConnected && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Link via Phone Pairing Code</Text>
              <Text style={styles.label}>Phone Number (with country code)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 919876543210"
                keyboardType="phone-pad"
                maxLength={15}
                value={pairingPhone}
                onChangeText={setPairingPhone}
              />
              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={handleGetPairingCode}
                disabled={generating}
              >
                <Text style={styles.secondaryBtnText}>Get 8-Digit Pairing Code</Text>
              </TouchableOpacity>

              {pairingCode ? (
                <View style={styles.codeBanner}>
                  <Text style={styles.codeLabel}>Your Pairing Code:</Text>
                  <Text style={styles.codeValue}>{pairingCode}</Text>
                </View>
              ) : null}
            </View>
          )}

          {/* Auto Responder Card */}
          <View style={styles.card}>
            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>QR Auto-Responder</Text>
                <Text style={styles.statusSub}>Automatically reply to incoming messages</Text>
              </View>
              <Switch
                value={autoEnabled}
                onValueChange={setAutoEnabled}
                trackColor={{ false: '#CBD5E1', true: '#A7F3D0' }}
                thumbColor={autoEnabled ? '#00B67A' : '#F8FAFC'}
              />
            </View>

            <Text style={styles.label}>Auto-Reply Message</Text>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              placeholder="Hi! Thanks for messaging us. We will get back to you shortly."
              multiline
              value={autoMessage}
              onChangeText={setAutoMessage}
            />

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleSaveAutoResponder}
              disabled={savingAuto}
            >
              {savingAuto ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.btnText}>Save Auto-Responder</Text>
              )}
            </TouchableOpacity>
          </View>
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
  scrollContent: { padding: 16, gap: 14 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  statusSub: { fontSize: 13, color: '#64748B', lineHeight: 18, marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 6 },
  label: { fontSize: 12, fontWeight: '600', color: '#475569', marginTop: 8, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 12,
  },
  primaryBtn: {
    flexDirection: 'row',
    backgroundColor: '#00B67A',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  disconnectBtn: {
    flexDirection: 'row',
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: '#00B67A',
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
  },
  secondaryBtnText: { color: '#00B67A', fontSize: 14, fontWeight: '700' },
  btnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  qrBox: { alignItems: 'center', marginTop: 16, padding: 12, backgroundColor: '#F8FAFC', borderRadius: 10 },
  qrImage: { width: 200, height: 200 },
  qrHint: { fontSize: 12, color: '#475569', marginTop: 8, fontWeight: '600' },
  codeBanner: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    alignItems: 'center',
  },
  codeLabel: { fontSize: 12, color: '#065F46' },
  codeValue: { fontSize: 22, fontWeight: '800', color: '#00B67A', letterSpacing: 3, marginTop: 4 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
});
