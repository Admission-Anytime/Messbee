import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

export default function ApiManagementScreen({ navigation }) {
  const [showKey, setShowKey] = useState(false);
  const apiKey = 'mb_live_98a7f23c91d044e18b827e69f8c4129b';
  const webhookUrl = 'https://api.messbee.com/webhook/whatsapp/v1';

  const copyToClipboard = (label) => {
    Alert.alert('Copied', `${label} copied to clipboard!`);
  };

  return (
    <SafeAreaView style={styles.container}>
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
        <Text style={styles.headerTitle}>API & Developer</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Banner */}
        <View style={styles.bannerCard}>
          <Ionicons name="code-slash" size={24} color="#00B67A" />
          <View style={styles.bannerTextBox}>
            <Text style={styles.bannerTitle}>Developer API</Text>
            <Text style={styles.bannerSubtitle}>
              Integrate MessBee WhatsApp messaging with your CRM, ERP, or custom software.
            </Text>
          </View>
        </View>

        {/* API Key Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>API CREDENTIALS</Text>
          <View style={styles.card}>
            <View style={styles.fieldBox}>
              <Text style={styles.fieldLabel}>Live API Key</Text>
              <View style={styles.rowField}>
                <Text style={styles.apiCode} numberOfLines={1}>
                  {showKey ? apiKey : '••••••••••••••••••••••••••••••••••••••••'}
                </Text>
                <TouchableOpacity onPress={() => setShowKey(!showKey)} style={styles.iconBtn}>
                  <Ionicons name={showKey ? 'eye-off-outline' : 'eye-outline'} size={18} color="#64748B" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => copyToClipboard('API Key')} style={styles.iconBtn}>
                  <Ionicons name="copy-outline" size={18} color="#00B67A" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.fieldBox, { borderBottomWidth: 0 }]}>
              <Text style={styles.fieldLabel}>Inbound Webhook URL</Text>
              <View style={styles.rowField}>
                <Text style={styles.apiCode} numberOfLines={1}>
                  {webhookUrl}
                </Text>
                <TouchableOpacity onPress={() => copyToClipboard('Webhook URL')} style={styles.iconBtn}>
                  <Ionicons name="copy-outline" size={18} color="#00B67A" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Active Access Tokens */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACTIVE ACCESS TOKENS</Text>
          <View style={styles.card}>
            <View style={styles.tokenRow}>
              <View style={styles.tokenIconBox}>
                <Ionicons name="key-outline" size={18} color="#00B67A" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.tokenName}>Production Mobile App Token</Text>
                <Text style={styles.tokenMeta}>Created 17 Nov 2026 • Never expires</Text>
              </View>
              <View style={styles.activePill}>
                <Text style={styles.activePillText}>Active</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={styles.newKeyBtn}
          onPress={() => Alert.alert('New Token', 'Generated new API token successfully!')}
          activeOpacity={0.8}
        >
          <Ionicons name="add-circle-outline" size={18} color="#00B67A" style={{ marginRight: 6 }} />
          <Text style={styles.newKeyBtnText}>Generate New Token</Text>
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
    paddingTop: Platform.OS === 'android' ? 24 : 10,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
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
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  bannerCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E6F4EA',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    gap: 12,
  },
  bannerTextBox: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#065F46',
    marginBottom: 2,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: '#047857',
    lineHeight: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.6,
    marginBottom: 8,
    paddingLeft: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
    overflow: 'hidden',
  },
  fieldBox: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 6,
  },
  rowField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  apiCode: {
    flex: 1,
    fontSize: 12.5,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#1E293B',
  },
  iconBtn: {
    padding: 4,
    marginLeft: 6,
  },
  tokenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  tokenIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#E6F4EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tokenName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  tokenMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  activePill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  activePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
  },
  newKeyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    paddingVertical: 13,
    borderRadius: 14,
    marginTop: 4,
  },
  newKeyBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00B67A',
  },
});
