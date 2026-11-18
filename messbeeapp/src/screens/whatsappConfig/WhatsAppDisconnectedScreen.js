import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

export default function WhatsAppDisconnectedScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate('WhatsAppConfig', { status: 'Disconnected' })}
          style={styles.backButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>WhatsApp Disconnected</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Center Content */}
      <View style={styles.contentContainer}>
        {/* Disconnected Red Icon */}
        <View style={styles.iconWrapper}>
          <View style={styles.iconSquircle}>
            <Ionicons name="link-outline" size={34} color="#FFFFFF" />
            <View style={styles.slashOverlay}>
              <View style={styles.slashLine} />
            </View>
          </View>
          
          {/* Disconnected Badge Pill */}
          <View style={styles.badgePill}>
            <View style={styles.redDot} />
            <Text style={styles.badgeText}>Disconnected</Text>
          </View>
        </View>

        {/* Headings */}
        <Text style={styles.mainHeading}>Integration disconnected</Text>
        <Text style={styles.subHeading}>
          Message processing has stopped. Your account data has not been deleted.
        </Text>

        {/* Reconnect Button */}
        <TouchableOpacity
          style={styles.reconnectBtn}
          onPress={() => navigation.navigate('ReconnectWhatsApp')}
          activeOpacity={0.85}
        >
          <Ionicons name="refresh-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.reconnectBtnText}>Reconnect WhatsApp</Text>
        </TouchableOpacity>

        {/* Return Link */}
        <TouchableOpacity
          style={styles.returnLink}
          onPress={() => navigation.navigate('WhatsAppConfig', { status: 'Disconnected' })}
          activeOpacity={0.7}
        >
          <Text style={styles.returnLinkText}>Return to Configuration</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingTop: Platform.OS === 'android' ? 36 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#F8FAFC',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    marginTop: -40,
  },
  iconWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconSquircle: {
    width: 76,
    height: 76,
    borderRadius: 22,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
    position: 'relative',
  },
  slashOverlay: {
    position: 'absolute',
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slashLine: {
    width: 38,
    height: 3.5,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '45deg' }],
    borderRadius: 2,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 12,
  },
  redDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
    marginRight: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
  },
  mainHeading: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 10,
  },
  subHeading: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  reconnectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 20,
  },
  reconnectBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  returnLink: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  returnLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
  },
});
