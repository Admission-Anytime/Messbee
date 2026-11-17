import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

export default function SecuritySettingsScreen({ navigation }) {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

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
        <Text style={styles.headerTitle}>Login & Security</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Two-step verification */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AUTHENTICATION</Text>
          <View style={styles.card}>
            <View style={styles.toggleRow}>
              <View style={styles.iconSquircle}>
                <Ionicons name="shield-checkmark" size={20} color="#00B67A" />
              </View>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.toggleTitle}>Two-Step Verification (2FA)</Text>
                <Text style={styles.toggleSubtitle}>Require OTP code on sign in</Text>
              </View>
              <Switch
                value={twoFactorEnabled}
                onValueChange={(val) => {
                  setTwoFactorEnabled(val);
                  Alert.alert('Security', val ? 'Two-step verification activated' : 'Two-step verification disabled');
                }}
                trackColor={{ false: '#E2E8F0', true: '#A7F3D0' }}
                thumbColor={twoFactorEnabled ? '#00B67A' : '#CBD5E1'}
              />
            </View>

            <View style={[styles.toggleRow, { borderBottomWidth: 0 }]}>
              <View style={styles.iconSquircle}>
                <Ionicons name="finger-print" size={20} color="#00B67A" />
              </View>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.toggleTitle}>Biometric Unlock</Text>
                <Text style={styles.toggleSubtitle}>Use FaceID or Fingerprint</Text>
              </View>
              <Switch
                value={biometricEnabled}
                onValueChange={setBiometricEnabled}
                trackColor={{ false: '#E2E8F0', true: '#A7F3D0' }}
                thumbColor={biometricEnabled ? '#00B67A' : '#CBD5E1'}
              />
            </View>
          </View>
        </View>

        {/* Password */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PASSWORD</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.clickableRow}
              onPress={() => Alert.alert('Change Password', 'Password reset instructions sent to admin@messbee.com')}
              activeOpacity={0.7}
            >
              <View style={styles.iconSquircle}>
                <Ionicons name="lock-closed-outline" size={20} color="#00B67A" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleTitle}>Change Password</Text>
                <Text style={styles.toggleSubtitle}>Last changed 3 months ago</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Active Sessions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACTIVE DEVICES</Text>
          <View style={styles.card}>
            <View style={styles.clickableRow}>
              <View style={styles.iconSquircle}>
                <Ionicons name="phone-portrait-outline" size={20} color="#00B67A" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleTitle}>Android App (This device)</Text>
                <Text style={styles.toggleSubtitle}>Active now • New Delhi, India</Text>
              </View>
              <View style={styles.currentBadge}>
                <Text style={styles.currentBadgeText}>CURRENT</Text>
              </View>
            </View>

            <View style={[styles.clickableRow, { borderBottomWidth: 0 }]}>
              <View style={styles.iconSquircle}>
                <Ionicons name="laptop-outline" size={20} color="#00B67A" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleTitle}>Chrome on Windows</Text>
                <Text style={styles.toggleSubtitle}>Active 2 hours ago • New Delhi</Text>
              </View>
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
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  clickableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  iconSquircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E6F4EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  toggleSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  currentBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  currentBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#15803D',
  },
});
