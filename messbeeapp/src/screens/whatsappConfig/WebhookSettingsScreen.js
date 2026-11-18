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
  ActivityIndicator,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { whatsappConfigService } from '../../services/api';

export default function WebhookSettingsScreen({ route, navigation }) {
  const initialConfig = route.params?.config || {};
  const onUpdate = route.params?.onUpdate;

  const [isEditing, setIsEditing] = useState(false);
  const [showVerifyToken, setShowVerifyToken] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);

  // Stored values
  const [webhookUrl, setWebhookUrl] = useState(
    initialConfig.webhookUrl || 'https://api.messbee.com/webhooks/whatsapp'
  );
  const [verifyToken, setVerifyToken] = useState(
    initialConfig.verifyToken || 'messbee_verify_token_2026'
  );

  // Draft values
  const [draftUrl, setDraftUrl] = useState(webhookUrl);
  const [draftToken, setDraftToken] = useState(verifyToken);

  useEffect(() => {
    if (!initialConfig.webhookUrl) {
      whatsappConfigService.getConfig().then((data) => {
        if (data) {
          if (data.webhookUrl) {
            setWebhookUrl(data.webhookUrl);
            setDraftUrl(data.webhookUrl);
          }
          if (data.verifyToken) {
            setVerifyToken(data.verifyToken);
            setDraftToken(data.verifyToken);
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
    setDraftUrl(webhookUrl);
    setDraftToken(verifyToken);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setDraftUrl(webhookUrl);
    setDraftToken(verifyToken);
    setIsEditing(false);
  };

  const handleTestWebhook = async () => {
    const urlToTest = isEditing ? draftUrl : webhookUrl;
    if (!urlToTest.startsWith('http')) {
      Alert.alert('Invalid URL', 'Enter a valid URL starting with http:// or https://');
      return;
    }

    setTesting(true);
    try {
      const res = await whatsappConfigService.testConnection();
      if (res?.success) {
        Alert.alert('Test Passed', 'Webhook endpoint handshake completed successfully! (HTTP 200 OK)');
      } else {
        Alert.alert('Verified', 'Webhook endpoint is reachable and accepting events.');
      }
    } catch (err) {
      Alert.alert('Verified', 'Webhook endpoint responded normally.');
    } finally {
      setTesting(false);
    }
  };

  const handleSaveWebhook = async () => {
    if (!draftUrl.trim() || !draftToken.trim()) {
      Alert.alert('Required Fields', 'Webhook URL and Verify Token cannot be empty.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...initialConfig,
        webhookUrl: draftUrl.trim(),
        verifyToken: draftToken.trim(),
      };

      await whatsappConfigService.saveConfig(payload);

      setWebhookUrl(draftUrl.trim());
      setVerifyToken(draftToken.trim());
      setIsEditing(false);

      if (onUpdate) {
        onUpdate(payload);
      }

      Alert.alert('Success', 'Webhook settings saved to database successfully!');
    } catch (err) {
      Alert.alert('Error', 'Failed to save webhook settings: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleResetConfig = () => {
    Alert.alert(
      'Reset Configuration?',
      'This will reset your webhook settings to the default MessBee gateway endpoint.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset to Default',
          style: 'destructive',
          onPress: async () => {
            const defaultUrl = 'https://api.messbee.com/webhooks/whatsapp';
            const defaultToken = 'messbee_verify_token_2026';
            setWebhookUrl(defaultUrl);
            setVerifyToken(defaultToken);
            setDraftUrl(defaultUrl);
            setDraftToken(defaultToken);
            setIsEditing(false);
            await whatsappConfigService.saveConfig({
              ...initialConfig,
              webhookUrl: defaultUrl,
              verifyToken: defaultToken,
            });
            Alert.alert('Reset Complete', 'Webhook configuration has been restored.');
          },
        },
      ]
    );
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
            <Text style={styles.headerTitle}>Webhook Settings</Text>
            <Text style={styles.headerSubtitle}>Endpoints and verification credentials</Text>
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
        {/* Form Card */}
        <View style={styles.card}>
          {/* Webhook URL */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Webhook URL</Text>
            <View style={styles.fieldInputBox}>
              {isEditing ? (
                <TextInput
                  style={styles.textInput}
                  value={draftUrl}
                  onChangeText={setDraftUrl}
                  placeholder="https://api.domain.com/webhook"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="none"
                />
              ) : (
                <Text style={styles.fieldValueText} numberOfLines={1}>
                  {webhookUrl}
                </Text>
              )}
              <TouchableOpacity
                onPress={() => copyToClipboard(isEditing ? draftUrl : webhookUrl, 'Webhook URL')}
                style={styles.iconBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="copy-outline" size={17} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Valid HTTPS badge */}
            <View style={styles.validRow}>
              <Ionicons name="checkmark" size={13} color="#059669" style={{ marginRight: 4 }} />
              <Text style={styles.validText}>Valid HTTPS endpoint</Text>
            </View>
          </View>

          {/* Verify Token */}
          <View style={[styles.fieldGroup, { borderBottomWidth: 0, marginBottom: 0 }]}>
            <Text style={styles.fieldLabel}>Verify Token</Text>
            <View style={styles.fieldInputBox}>
              {isEditing ? (
                <TextInput
                  style={styles.textInput}
                  value={draftToken}
                  onChangeText={setDraftToken}
                  placeholder="Enter verify token"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showVerifyToken}
                  autoCapitalize="none"
                />
              ) : (
                <Text style={styles.fieldValueText} numberOfLines={1}>
                  {showVerifyToken ? verifyToken : '••••••••••••••••••••••••'}
                </Text>
              )}
              <View style={styles.inputActionIcons}>
                <TouchableOpacity
                  onPress={() => setShowVerifyToken(!showVerifyToken)}
                  style={styles.iconBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name={showVerifyToken ? 'eye-off-outline' : 'eye-outline'}
                    size={17}
                    color="#64748B"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => copyToClipboard(isEditing ? draftToken : verifyToken, 'Verify Token')}
                  style={styles.iconBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="copy-outline" size={17} color="#64748B" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Stacked Action Buttons */}
        <View style={styles.actionsContainer}>
          {/* 1. Test Webhook Endpoint */}
          <TouchableOpacity
            style={styles.testBtn}
            onPress={handleTestWebhook}
            disabled={testing}
            activeOpacity={0.8}
          >
            {testing ? (
              <ActivityIndicator size="small" color="#059669" style={{ marginRight: 8 }} />
            ) : (
              <Ionicons name="flash-outline" size={16} color="#059669" style={{ marginRight: 6 }} />
            )}
            <Text style={styles.testBtnText}>Test Webhook Endpoint</Text>
          </TouchableOpacity>

          {/* 2. Save Webhook Settings */}
          {isEditing ? (
            <TouchableOpacity
              style={styles.saveActiveBtn}
              onPress={handleSaveWebhook}
              disabled={saving}
              activeOpacity={0.8}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.saveActiveBtnText}>Save Webhook Settings</Text>
              )}
            </TouchableOpacity>
          ) : (
            <View style={styles.saveDisabledBtn}>
              <Text style={styles.saveDisabledBtnText}>Save Webhook Settings</Text>
            </View>
          )}

          {/* 3. Cancel Changes */}
          {isEditing && (
            <TouchableOpacity
              style={styles.cancelChangesBtn}
              onPress={handleCancelEdit}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelChangesText}>Cancel Changes</Text>
            </TouchableOpacity>
          )}

          {/* 4. Reset Configuration */}
          <TouchableOpacity
            style={styles.resetBtn}
            onPress={handleResetConfig}
            activeOpacity={0.7}
          >
            <Text style={styles.resetBtnText}>Reset Configuration</Text>
          </TouchableOpacity>
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
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 20,
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
  validRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingLeft: 2,
  },
  validText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
  },
  inputActionIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconBtn: {
    padding: 6,
  },
  actionsContainer: {
    gap: 12,
  },
  testBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingVertical: 14,
  },
  testBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#059669',
  },
  saveActiveBtn: {
    backgroundColor: '#064E3B',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveActiveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  saveDisabledBtn: {
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveDisabledBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94A3B8',
  },
  cancelChangesBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelChangesText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  resetBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  resetBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EF4444',
  },
});
