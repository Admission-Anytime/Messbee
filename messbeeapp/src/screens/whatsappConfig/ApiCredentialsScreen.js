import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { whatsappConfigService } from '../../services/api';

export default function ApiCredentialsScreen({ route, navigation }) {
  const initialConfig = route.params?.config || {};
  const onUpdate = route.params?.onUpdate;

  const [isEditing, setIsEditing] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form values
  const [wabaId, setWabaId] = useState(initialConfig.businessAccountId || '102938475610293');
  const [phoneId, setPhoneId] = useState(initialConfig.phoneNumberId || '107654321098765');
  const [token, setToken] = useState(initialConfig.accessToken || 'EAAGNO4XZC5ZB8BOZBZ89vZCz029837416');

  // Drafts for editing
  const [draftWabaId, setDraftWabaId] = useState(wabaId);
  const [draftPhoneId, setDraftPhoneId] = useState(phoneId);
  const [draftToken, setDraftToken] = useState(token);

  // Replace Confirmation Modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  // Bottom Toast
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Sync from props or load from DB if initial is empty
  useEffect(() => {
    if (!initialConfig.businessAccountId) {
      whatsappConfigService.getConfig().then((data) => {
        if (data) {
          if (data.businessAccountId) {
            setWabaId(data.businessAccountId);
            setDraftWabaId(data.businessAccountId);
          }
          if (data.phoneNumberId) {
            setPhoneId(data.phoneNumberId);
            setDraftPhoneId(data.phoneNumberId);
          }
          if (data.accessToken) {
            setToken(data.accessToken);
            setDraftToken(data.accessToken);
          }
        }
      });
    }
  }, [initialConfig]);

  const copyToClipboard = async (text, label) => {
    if (Clipboard?.setStringAsync) {
      await Clipboard.setStringAsync(text);
    }
    Alert.alert('Copied', `${label} copied to clipboard!`);
  };

  const handleStartEdit = () => {
    setDraftWabaId(wabaId);
    setDraftPhoneId(phoneId);
    setDraftToken(token);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setDraftWabaId(wabaId);
    setDraftPhoneId(phoneId);
    setDraftToken(token);
    setIsEditing(false);
  };

  const handleRotateToken = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const newToken =
      'EAAG' + Array.from({ length: 44 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    if (isEditing) {
      setDraftToken(newToken);
    } else {
      setDraftToken(newToken);
      setIsEditing(true);
    }
    Alert.alert('Token Rotated', 'A fresh System User Access Token has been generated. Save credentials to apply.');
  };

  const handleSavePress = () => {
    if (!draftWabaId.trim() || !draftPhoneId.trim()) {
      Alert.alert('Required Fields', 'Business Account ID and Phone Number ID cannot be empty.');
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmReplace = async () => {
    setShowConfirmModal(false);
    setSaving(true);
    try {
      const payload = {
        businessAccountId: draftWabaId.trim(),
        phoneNumberId: draftPhoneId.trim(),
        accessToken: draftToken.trim(),
        apiVersion: initialConfig.apiVersion || 'v18.0',
        webhookUrl: initialConfig.webhookUrl || 'https://api.messbee.com/webhooks/whatsapp',
        verifyToken: initialConfig.verifyToken || 'messbee_verify_token_2026',
        events: initialConfig.events,
      };

      await whatsappConfigService.saveConfig(payload);

      // Update state
      setWabaId(draftWabaId.trim());
      setPhoneId(draftPhoneId.trim());
      setToken(draftToken.trim());
      setIsEditing(false);

      if (onUpdate) {
        onUpdate(payload);
      }

      // Show bottom green toast exactly as screenshot
      setShowSuccessToast(true);
      setTimeout(() => {
        setShowSuccessToast(false);
      }, 3500);
    } catch (err) {
      Alert.alert('Error', 'Failed to save credentials: ' + err.message);
    } finally {
      setSaving(false);
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
            <Text style={styles.headerTitle}>API Credentials</Text>
            <Text style={styles.headerSubtitle}>
              {isEditing ? 'Editing credentials' : 'Secure Business API access'}
            </Text>
          </View>
        </View>

        {isEditing ? (
          <TouchableOpacity onPress={handleCancelEdit} style={styles.headerActionBtn}>
            <Text style={styles.headerCancelText}>Cancel</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleStartEdit} style={styles.headerActionBtn}>
            <Text style={styles.headerEditText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Blue Info Box */}
        <View style={styles.infoCard}>
          <Ionicons name="shield-checkmark-outline" size={20} color="#2563EB" style={{ marginRight: 10, marginTop: 1 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>Credentials are encrypted</Text>
            <Text style={styles.infoSubtitle}>
              Only authorized team members can view or change this configuration.
            </Text>
          </View>
        </View>

        {/* Credentials Card */}
        <View style={styles.card}>
          {/* WhatsApp Business Account ID */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>WhatsApp Business Account ID</Text>
            <View style={styles.fieldInputBox}>
              {isEditing ? (
                <TextInput
                  style={styles.textInput}
                  value={draftWabaId}
                  onChangeText={setDraftWabaId}
                  placeholder="Enter WABA ID"
                  placeholderTextColor="#94A3B8"
                  keyboardType="number-pad"
                />
              ) : (
                <Text style={styles.fieldValueText} numberOfLines={1}>
                  {wabaId}
                </Text>
              )}
              <TouchableOpacity
                onPress={() => copyToClipboard(isEditing ? draftWabaId : wabaId, 'WABA ID')}
                style={styles.iconBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="copy-outline" size={17} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Phone Number ID */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Phone Number ID</Text>
            <View style={styles.fieldInputBox}>
              {isEditing ? (
                <TextInput
                  style={styles.textInput}
                  value={draftPhoneId}
                  onChangeText={setDraftPhoneId}
                  placeholder="Enter Phone Number ID"
                  placeholderTextColor="#94A3B8"
                  keyboardType="number-pad"
                />
              ) : (
                <Text style={styles.fieldValueText} numberOfLines={1}>
                  {phoneId}
                </Text>
              )}
              <TouchableOpacity
                onPress={() => copyToClipboard(isEditing ? draftPhoneId : phoneId, 'Phone Number ID')}
                style={styles.iconBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="copy-outline" size={17} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>

          {/* System User Access Token */}
          <View style={[styles.fieldGroup, { borderBottomWidth: 0 }]}>
            <Text style={styles.fieldLabel}>System User Access Token</Text>
            <View style={styles.fieldInputBox}>
              {isEditing ? (
                <TextInput
                  style={styles.textInput}
                  value={draftToken}
                  onChangeText={setDraftToken}
                  placeholder="Enter Access Token"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showToken}
                  autoCapitalize="none"
                />
              ) : (
                <Text style={styles.fieldValueText} numberOfLines={1}>
                  {showToken ? token : '••••••••••••••••••••••••••••••••'}
                </Text>
              )}
              <View style={styles.inputActionIcons}>
                <TouchableOpacity
                  onPress={() => setShowToken(!showToken)}
                  style={styles.iconBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name={showToken ? 'eye-off-outline' : 'eye-outline'} size={17} color="#64748B" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => copyToClipboard(isEditing ? draftToken : token, 'Access Token')}
                  style={styles.iconBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="copy-outline" size={17} color="#64748B" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Lock text */}
            <View style={styles.lockRow}>
              <Ionicons name="lock-closed-outline" size={13} color="#94A3B8" style={{ marginRight: 5 }} />
              <Text style={styles.lockText}>
                Keep this token secret. Never expose it in client-side code.
              </Text>
            </View>
          </View>
        </View>

        {/* Rotate Access Token Button */}
        <TouchableOpacity
          style={styles.rotateBtn}
          onPress={handleRotateToken}
          activeOpacity={0.8}
        >
          <Ionicons name="refresh-outline" size={16} color="#1E293B" style={{ marginRight: 6 }} />
          <Text style={styles.rotateBtnText}>Rotate Access Token</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Mode Bottom Action Bar */}
      {isEditing && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.bottomCancelBtn}
            onPress={handleCancelEdit}
            disabled={saving}
          >
            <Text style={styles.bottomCancelText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bottomSaveBtn}
            onPress={handleSavePress}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.bottomSaveText}>Save Credentials</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Confirmation Modal: "Replace API credentials?" */}
      <Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.confirmBackdrop}>
          <View style={styles.confirmDialog}>
            <View style={styles.confirmHeader}>
              <Text style={styles.confirmTitle}>Replace API credentials?</Text>
              <TouchableOpacity onPress={() => setShowConfirmModal(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.confirmBody}>
              This will replace the credentials used by the WhatsApp Integration. Confirm that the new values are correct.
            </Text>

            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={styles.confirmCancelBtn}
                onPress={() => setShowConfirmModal(false)}
              >
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmReplaceBtn}
                onPress={handleConfirmReplace}
              >
                <Text style={styles.confirmReplaceText}>Replace Credentials</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom Green Toast: "✓ API credentials updated successfully." */}
      {showSuccessToast && (
        <View style={styles.toastContainer}>
          <View style={styles.toastBox}>
            <Ionicons name="checkmark" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.toastText}>API credentials updated successfully.</Text>
          </View>
        </View>
      )}
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
  headerActionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  headerEditText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00B67A',
  },
  headerCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1E3A8A',
    marginBottom: 2,
  },
  infoSubtitle: {
    fontSize: 11.5,
    color: '#2563EB',
    lineHeight: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  fieldInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
  },
  textInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#0F172A',
    fontWeight: '500',
  },
  fieldValueText: {
    flex: 1,
    fontSize: 13.5,
    color: '#0F172A',
    fontWeight: '500',
  },
  inputActionIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconBtn: {
    padding: 6,
  },
  lockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  lockText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  rotateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingVertical: 13,
  },
  rotateBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1E293B',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  bottomCancelBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  bottomCancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  bottomSaveBtn: {
    flex: 2,
    backgroundColor: '#064E3B',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  bottomSaveText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  confirmBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  confirmDialog: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 360,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  confirmHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  confirmTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeBtn: {
    padding: 4,
  },
  confirmBody: {
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 20,
  },
  confirmActions: {
    flexDirection: 'row',
    gap: 10,
  },
  confirmCancelBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmCancelText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#475569',
  },
  confirmReplaceBtn: {
    flex: 1.5,
    backgroundColor: '#064E3B',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmReplaceText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  toastContainer: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  toastBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#064E3B',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  toastText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
