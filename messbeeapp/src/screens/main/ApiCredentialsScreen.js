import React, { useState, useEffect } from 'react';
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
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { whatsappConfigService } from '../../services/api';

export default function ApiCredentialsScreen({ route, navigation }) {
  const initialConfig = route.params?.config || {};

  const [wabaId, setWabaId] = useState(initialConfig.businessAccountId || '102938475610293');
  const [phoneId, setPhoneId] = useState(initialConfig.phoneNumberId || '107654321098765');
  const [token, setToken] = useState(initialConfig.accessToken || 'EAAG...your_meta_system_user_access_token');
  
  const [isEditing, setIsEditing] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Drafts during editing
  const [draftWabaId, setDraftWabaId] = useState(wabaId);
  const [draftPhoneId, setDraftPhoneId] = useState(phoneId);
  const [draftToken, setDraftToken] = useState(token);

  useEffect(() => {
    if (initialConfig.businessAccountId) setWabaId(initialConfig.businessAccountId);
    if (initialConfig.phoneNumberId) setPhoneId(initialConfig.phoneNumberId);
    if (initialConfig.accessToken) setToken(initialConfig.accessToken);
  }, [initialConfig]);

  const handleStartEdit = () => {
    setDraftWabaId(wabaId);
    setDraftPhoneId(phoneId);
    setDraftToken(token);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSavePress = () => {
    setShowReplaceModal(true);
  };

  const handleConfirmReplace = async () => {
    setShowReplaceModal(false);
    try {
      const updated = {
        ...(initialConfig || {}),
        businessAccountId: draftWabaId,
        phoneNumberId: draftPhoneId,
        accessToken: draftToken,
      };
      await whatsappConfigService.saveConfig(updated);
      setWabaId(draftWabaId);
      setPhoneId(draftPhoneId);
      setToken(draftToken);
      setIsEditing(false);

      setShowToast(true);
      setTimeout(() => setShowToast(false), 3500);
    } catch (err) {
      Alert.alert('Error', 'Failed to update API credentials.');
    }
  };

  const handleRotateToken = () => {
    Alert.alert(
      'Rotate Access Token',
      'Generate a new permanent System User Access Token in Meta Business Manager and paste it in Edit mode.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Edit Credentials', onPress: handleStartEdit },
      ]
    );
  };

  const copyToClipboard = (label) => {
    Alert.alert('Copied', `${label} copied to clipboard!`);
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
          <Text style={styles.headerTitle}>API Credentials</Text>
          <Text style={styles.headerSubtitle}>
            {isEditing ? 'Editing credentials' : 'Secure Business API access'}
          </Text>
        </View>

        <TouchableOpacity
          onPress={isEditing ? handleCancelEdit : handleStartEdit}
          style={styles.headerRightAction}
        >
          <Text style={styles.headerRightActionText}>{isEditing ? 'Cancel' : 'Edit'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ================= ENCRYPTION BANNER ================= */}
        <View style={styles.encryptBanner}>
          <Ionicons name="shield-checkmark-outline" size={20} color="#0284C7" style={{ marginRight: 10 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.encryptTitle}>Credentials are encrypted</Text>
            <Text style={styles.encryptSubtitle}>
              Only authorized team members can view or change this configuration.
            </Text>
          </View>
        </View>

        {/* ================= CREDENTIALS FORM CARD ================= */}
        <View style={styles.cardContainer}>
          {/* Field 1: WhatsApp Business Account ID */}
          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>WhatsApp Business Account ID</Text>
            {isEditing ? (
              <TextInput
                style={styles.textInput}
                value={draftWabaId}
                onChangeText={setDraftWabaId}
                placeholder="Enter WABA ID"
                placeholderTextColor="#94A3B8"
              />
            ) : (
              <View style={styles.readOnlyRow}>
                <Text style={styles.readOnlyValue}>{wabaId}</Text>
                <TouchableOpacity onPress={() => copyToClipboard('WhatsApp Business Account ID')}>
                  <Ionicons name="copy-outline" size={17} color="#64748B" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.fieldDivider} />

          {/* Field 2: Phone Number ID */}
          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>Phone Number ID</Text>
            {isEditing ? (
              <TextInput
                style={styles.textInput}
                value={draftPhoneId}
                onChangeText={setDraftPhoneId}
                placeholder="Enter Phone Number ID"
                placeholderTextColor="#94A3B8"
              />
            ) : (
              <View style={styles.readOnlyRow}>
                <Text style={styles.readOnlyValue}>{phoneId}</Text>
                <TouchableOpacity onPress={() => copyToClipboard('Phone Number ID')}>
                  <Ionicons name="copy-outline" size={17} color="#64748B" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.fieldDivider} />

          {/* Field 3: System User Access Token */}
          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>System User Access Token</Text>
            {isEditing ? (
              <TextInput
                style={styles.textInput}
                value={draftToken}
                onChangeText={setDraftToken}
                placeholder="Paste Access Token"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showToken}
              />
            ) : (
              <View style={styles.readOnlyRow}>
                <Text style={styles.readOnlyValue} numberOfLines={1}>
                  {showToken ? token : '••••••••••••••••••••••••••••'}
                </Text>
                <View style={styles.tokenActionsRow}>
                  <TouchableOpacity
                    onPress={() => setShowToken(!showToken)}
                    style={{ marginRight: 10 }}
                  >
                    <Ionicons
                      name={showToken ? 'eye-off-outline' : 'eye-outline'}
                      size={18}
                      color="#64748B"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => copyToClipboard('Access Token')}>
                    <Ionicons name="copy-outline" size={17} color="#64748B" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            <View style={styles.lockNoteRow}>
              <Ionicons name="lock-closed-outline" size={13} color="#94A3B8" style={{ marginRight: 4 }} />
              <Text style={styles.lockNoteText}>
                Keep this token secret. Never expose it in client-side code.
              </Text>
            </View>
          </View>
        </View>

        {/* Rotate Access Token Button (View Mode) */}
        {!isEditing && (
          <TouchableOpacity
            style={styles.rotateBtn}
            onPress={handleRotateToken}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh-outline" size={16} color="#00875A" style={{ marginRight: 6 }} />
            <Text style={styles.rotateBtnText}>Rotate Access Token</Text>
          </TouchableOpacity>
        )}

        {/* Edit Mode Actions */}
        {isEditing && (
          <View style={styles.editActionsRow}>
            <TouchableOpacity
              style={styles.cancelEditBtn}
              onPress={handleCancelEdit}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelEditBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveEditBtn}
              onPress={handleSavePress}
              activeOpacity={0.85}
            >
              <Text style={styles.saveEditBtnText}>Save Credentials</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* ================= CONFIRMATION MODAL (Image 2 Screen 1) ================= */}
      <Modal
        visible={showReplaceModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReplaceModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.replaceDialog}>
            <View style={styles.replaceHeader}>
              <Text style={styles.replaceTitle}>Replace API credentials?</Text>
              <TouchableOpacity onPress={() => setShowReplaceModal(false)}>
                <Ionicons name="close" size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <Text style={styles.replaceBody}>
              This will replace the credentials used by the WhatsApp integration. Confirm that the new values are correct.
            </Text>

            <View style={styles.replaceActionsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowReplaceModal(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={handleConfirmReplace}
                activeOpacity={0.85}
              >
                <Text style={styles.modalConfirmBtnText}>Replace Credentials</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ================= SUCCESS TOAST BANNER (Image 2 Screen 2) ================= */}
      {showToast && (
        <View style={styles.toastBanner}>
          <Ionicons name="checkmark" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.toastText}>API credentials updated successfully.</Text>
        </View>
      )}
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
  headerRightAction: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  headerRightActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00875A',
  },
  scrollContent: {
    padding: 16,
  },

  // Encryption Banner
  encryptBanner: {
    flexDirection: 'row',
    backgroundColor: '#F0F9FF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E0F2FE',
    marginBottom: 16,
  },
  encryptTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0369A1',
    marginBottom: 2,
  },
  encryptSubtitle: {
    fontSize: 11.5,
    color: '#0284C7',
    lineHeight: 16,
  },

  // Card
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  fieldBlock: {
    paddingVertical: 6,
  },
  fieldLabel: {
    fontSize: 11.5,
    color: '#64748B',
    marginBottom: 8,
    fontWeight: '500',
  },
  readOnlyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  readOnlyValue: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '600',
    color: '#0F172A',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginRight: 8,
  },
  tokenActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13.5,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#00875A',
  },
  fieldDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  lockNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  lockNoteText: {
    fontSize: 11,
    color: '#94A3B8',
  },

  // Rotate Button
  rotateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  rotateBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#00875A',
  },

  // Edit Mode Actions
  editActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  cancelEditBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelEditBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#475569',
  },
  saveEditBtn: {
    flex: 2,
    backgroundColor: '#00875A',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveEditBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  replaceDialog: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 360,
  },
  replaceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  replaceTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  replaceBody: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 20,
  },
  replaceActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modalCancelBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  modalCancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalConfirmBtn: {
    flex: 1.5,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00875A',
  },
  modalConfirmBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Toast
  toastBanner: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    backgroundColor: '#064E3B',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  toastText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
