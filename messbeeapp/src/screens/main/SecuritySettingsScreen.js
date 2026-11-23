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
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../../services/api';

export default function SecuritySettingsScreen({ navigation }) {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  // Change Password Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [modalError, setModalError] = useState('');

  const handleUpdatePassword = async () => {
    setModalError('');
    if (!currentPassword) {
      setModalError('Please enter your current password');
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setModalError('New password must be at least 8 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      setModalError('Passwords do not match');
      return;
    }

    try {
      setSavingPassword(true);
      const res = await authService.updatePassword(currentPassword, newPassword);
      if (res && res.success !== false) {
        setShowPasswordModal(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        Alert.alert('Success', 'Password updated successfully!');
      } else {
        setModalError(res?.message || 'Failed to update password');
      }
    } catch (err) {
      setModalError(err?.response?.data?.message || 'Current password is incorrect');
    } finally {
      setSavingPassword(false);
    }
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
              onPress={() => {
                setModalError('');
                setShowPasswordModal(true);
              }}
              activeOpacity={0.7}
            >
              <View style={styles.iconSquircle}>
                <Ionicons name="lock-closed-outline" size={20} color="#00B67A" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleTitle}>Change Password</Text>
                <Text style={styles.toggleSubtitle}>Update your account security credentials</Text>
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

      {/* Change Password Modal */}
      <Modal
        visible={showPasswordModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowPasswordModal(false)}
        >
          <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Account Password</Text>
              <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            {modalError ? (
              <View style={styles.modalErrorBox}>
                <Ionicons name="alert-circle" size={16} color="#DC2626" style={{ marginRight: 6 }} />
                <Text style={styles.modalErrorText}>{modalError}</Text>
              </View>
            ) : null}

            <Text style={styles.modalFieldLabel}>Current Password</Text>
            <View style={styles.modalInputBox}>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter current password"
                placeholderTextColor="#94A3B8"
                secureTextEntry
                value={currentPassword}
                onChangeText={setCurrentPassword}
              />
            </View>

            <Text style={styles.modalFieldLabel}>New Password (min 8 chars)</Text>
            <View style={styles.modalInputBox}>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter new password"
                placeholderTextColor="#94A3B8"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />
            </View>

            <Text style={styles.modalFieldLabel}>Confirm New Password</Text>
            <View style={styles.modalInputBox}>
              <TextInput
                style={styles.modalInput}
                placeholder="Repeat new password"
                placeholderTextColor="#94A3B8"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>

            <TouchableOpacity
              style={styles.modalSubmitBtn}
              onPress={handleUpdatePassword}
              disabled={savingPassword}
              activeOpacity={0.88}
            >
              {savingPassword ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.modalSubmitBtnText}>Update Password</Text>
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 12,
  },
  modalErrorText: {
    flex: 1,
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '500',
  },
  modalFieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 4,
    marginTop: 8,
  },
  modalInputBox: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  modalInput: {
    fontSize: 14,
    color: '#0F172A',
  },
  modalSubmitBtn: {
    backgroundColor: '#00875A',
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },
  modalSubmitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
