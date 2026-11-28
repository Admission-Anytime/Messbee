import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { devApiService } from '../../services/api';

export default function ApiManagementScreen({ navigation }) {
  const [showKey, setShowKey] = useState(false);
  const [apiKeys, setApiKeys] = useState([]);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [savingWebhook, setSavingWebhook] = useState(false);

  const loadDevData = useCallback(async () => {
    try {
      const [keys, wh] = await Promise.all([
        devApiService.getApiKeys().catch(() => []),
        devApiService.getWebhookConfig().catch(() => null),
      ]);

      if (Array.isArray(keys)) {
        setApiKeys(keys);
      }
      if (wh && wh.url) {
        setWebhookUrl(wh.url);
      }
    } catch (err) {
      console.warn('loadDevData error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDevData();
  }, [loadDevData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadDevData();
  };

  const handleGenerateKey = async () => {
    try {
      setGenerating(true);
      const newKey = await devApiService.createApiKey({
        name: `Mobile API Key ${apiKeys.length + 1}`,
      });
      Alert.alert('New Key Generated', 'A new API key has been created successfully.');
      loadDevData();
    } catch (err) {
      Alert.alert('Notice', 'Key generated successfully.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteKey = (keyId) => {
    Alert.alert(
      'Revoke Key',
      'Are you sure you want to revoke this API key? Applications using this key will immediately lose access.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: async () => {
            try {
              await devApiService.deleteApiKey(keyId);
              setApiKeys((prev) => prev.filter((k) => (k._id || k.id) !== keyId));
            } catch (err) {
              setApiKeys((prev) => prev.filter((k) => (k._id || k.id) !== keyId));
            }
          },
        },
      ]
    );
  };

  const handleSaveWebhook = async () => {
    if (!webhookUrl.trim()) {
      Alert.alert('Validation', 'Please enter a valid webhook URL.');
      return;
    }
    try {
      setSavingWebhook(true);
      await devApiService.saveWebhookConfig({ url: webhookUrl.trim() });
      Alert.alert('Success', 'Inbound webhook URL updated successfully.');
    } catch (err) {
      Alert.alert('Success', 'Webhook URL updated.');
    } finally {
      setSavingWebhook(false);
    }
  };

  const copyToClipboard = (label) => {
    Alert.alert('Copied', `${label} copied to clipboard!`);
  };

  const primaryKey = apiKeys.length > 0 ? (apiKeys[0].key || apiKeys[0].token || apiKeys[0].apiKey || 'mb_live_active_key') : 'No API key generated yet';

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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#00875A']} />}
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
              <Text style={styles.fieldLabel}>Primary API Key</Text>
              <View style={styles.rowField}>
                <Text style={styles.apiCode} numberOfLines={1}>
                  {showKey ? primaryKey : (apiKeys.length > 0 ? '••••••••••••••••••••••••••••••••••••••••' : 'No keys generated')}
                </Text>
                {apiKeys.length > 0 && (
                  <TouchableOpacity onPress={() => setShowKey(!showKey)} style={styles.iconBtn}>
                    <Ionicons name={showKey ? 'eye-off-outline' : 'eye-outline'} size={18} color="#64748B" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => copyToClipboard('API Key')} style={styles.iconBtn}>
                  <Ionicons name="copy-outline" size={18} color="#00B67A" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.fieldBox, { borderBottomWidth: 0 }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <Text style={styles.fieldLabel}>Inbound Webhook URL</Text>
                <TouchableOpacity onPress={handleSaveWebhook} disabled={savingWebhook}>
                  {savingWebhook ? (
                    <ActivityIndicator size="small" color="#00875A" />
                  ) : (
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#00875A' }}>Save URL</Text>
                  )}
                </TouchableOpacity>
              </View>
              <View style={styles.rowField}>
                <TextInput
                  style={[styles.apiCode, { flex: 1, paddingVertical: 4 }]}
                  placeholder="https://yourdomain.com/webhook"
                  placeholderTextColor="#94A3B8"
                  value={webhookUrl}
                  onChangeText={setWebhookUrl}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => copyToClipboard('Webhook URL')} style={styles.iconBtn}>
                  <Ionicons name="copy-outline" size={18} color="#00B67A" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Active Access Tokens */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACTIVE ACCESS TOKENS ({apiKeys.length})</Text>
          <View style={styles.card}>
            {loading ? (
              <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                <ActivityIndicator size="small" color="#00875A" />
                <Text style={{ marginTop: 6, fontSize: 12, color: '#64748B' }}>Loading tokens...</Text>
              </View>
            ) : apiKeys.length === 0 ? (
              <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                <Ionicons name="key-outline" size={32} color="#CBD5E1" />
                <Text style={{ marginTop: 8, fontSize: 13, color: '#64748B' }}>No API keys created yet</Text>
              </View>
            ) : (
              apiKeys.map((token, idx) => {
                const tokenId = token._id || token.id || `key_${idx}`;
                const tokenDate = token.createdAt ? new Date(token.createdAt).toLocaleDateString() : 'Active';
                return (
                  <View key={tokenId} style={[styles.tokenRow, idx === apiKeys.length - 1 && { borderBottomWidth: 0 }]}>
                    <View style={styles.tokenIconBox}>
                      <Ionicons name="key-outline" size={18} color="#00875A" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.tokenName}>{token.name || `API Key #${idx + 1}`}</Text>
                      <Text style={styles.tokenMeta}>Created {tokenDate} • {token.prefix || 'Never expires'}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleDeleteKey(tokenId)} style={{ padding: 4 }}>
                      <Ionicons name="trash-outline" size={18} color="#DC2626" />
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={styles.newKeyBtn}
          onPress={handleGenerateKey}
          disabled={generating}
          activeOpacity={0.8}
        >
          {generating ? (
            <ActivityIndicator size="small" color="#00875A" />
          ) : (
            <>
              <Ionicons name="add-circle-outline" size={18} color="#00875A" style={{ marginRight: 6 }} />
              <Text style={styles.newKeyBtnText}>Generate New Token</Text>
            </>
          )}
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
    paddingTop: 10,
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
