import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

export default function WhatsAppDisconnectedScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate('WhatsAppConfig')}
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={24} color="#0F172A" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>WhatsApp Disconnected</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.content}>
        {/* Red Hero Squircle with broken link */}
        <View style={styles.heroIconBox}>
          <Ionicons name="link-outline" size={32} color="#FFFFFF" />
        </View>

        {/* Disconnected Pill */}
        <View style={styles.statusPill}>
          <View style={styles.redDot} />
          <Text style={styles.statusText}>Disconnected</Text>
        </View>

        <Text style={styles.title}>Integration disconnected</Text>
        <Text style={styles.subtitle}>
          Message processing has stopped. Your account data has not been deleted.
        </Text>

        <View style={styles.actionsBox}>
          <TouchableOpacity
            style={styles.reconnectBtn}
            onPress={() => navigation.navigate('ReconnectWhatsApp')}
            activeOpacity={0.85}
          >
            <Ionicons name="refresh-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.reconnectBtnText}>Reconnect WhatsApp</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.returnLink}
            onPress={() => navigation.navigate('WhatsAppConfig')}
            activeOpacity={0.7}
          >
            <Text style={styles.returnLinkText}>Return to Configuration</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  heroIconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
    marginBottom: 14,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 16,
  },
  redDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#DC2626',
    marginRight: 6,
  },
  statusText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#DC2626',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 290,
    marginBottom: 32,
  },
  actionsBox: {
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  reconnectBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 14,
    paddingVertical: 14,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 16,
  },
  reconnectBtnText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  returnLink: {
    paddingVertical: 8,
  },
  returnLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
});
