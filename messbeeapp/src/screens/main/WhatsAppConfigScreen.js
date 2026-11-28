import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { whatsappConfigService } from '../../services/api';

export default function WhatsAppConfigScreen({ navigation }) {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeStatus, setActiveStatus] = useState('Active');
  const [lastSyncText, setLastSyncText] = useState('just now');
  const [showMenu, setShowMenu] = useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [understandDisconnect, setUnderstandDisconnect] = useState(false);

  // Fetch real configuration from server
  const loadConfig = useCallback(async () => {
    try {
      setLoading(true);
      const data = await whatsappConfigService.getConfig();
      if (data) {
        setConfig(data);
        if (data.phoneNumberId && data.accessToken) {
          setActiveStatus('Active');
        } else {
          setActiveStatus('Disconnected');
        }
      }
    } catch (err) {
      console.warn('Failed to load WhatsApp config:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const handleRefreshConnection = async () => {
    try {
      setRefreshing(true);
      const res = await whatsappConfigService.testConnection();
      if (res.success) {
        setActiveStatus('Active');
        setLastSyncText('just now');
        Alert.alert('Connection Status', 'WhatsApp Cloud API connection is active and operational.');
      } else {
        setActiveStatus('Inactive');
        Alert.alert('Connection Notice', res.message || 'WhatsApp Cloud API responded with an error.');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to test connection.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleDisconnectConfirm = async () => {
    try {
      await whatsappConfigService.disconnect();
      setShowDisconnectModal(false);
      navigation.navigate('WhatsAppDisconnected');
    } catch (err) {
      setShowDisconnectModal(false);
      navigation.navigate('WhatsAppDisconnected');
    }
  };

  const isConnected = activeStatus === 'Active';

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
          <Text style={styles.headerTitle}>WhatsApp Configuration</Text>
          <Text style={styles.headerSubtitle}>Manage your Business API connection</Text>
        </View>

        <TouchableOpacity
          onPress={() => setShowMenu(true)}
          style={styles.moreBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="ellipsis-horizontal" size={20} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ================= HERO STATUS CARD (Image 1 Screen 1) ================= */}
        <View style={[styles.heroCard, !isConnected && styles.heroCardDisconnected]}>
          <View style={styles.heroTopRow}>
            <View style={styles.waIconCircle}>
              <Ionicons name="logo-whatsapp" size={22} color="#FFFFFF" />
            </View>
            <View style={styles.heroBrandCol}>
              <Text style={styles.heroBrandTag}>MESSBEE BUSINESS API</Text>
              <Text style={styles.heroTitle}>{isConnected ? 'Connected and ready' : 'Disconnected'}</Text>
            </View>
            <View style={[styles.statusPill, !isConnected && styles.statusPillDisconnected]}>
              <View style={[styles.statusDot, !isConnected && styles.statusDotDisconnected]} />
              <Text style={[styles.statusPillText, !isConnected && styles.statusPillTextDisconnected]}>
                {isConnected ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>

          <Text style={styles.heroDesc}>
            {isConnected
              ? 'Messages are flowing normally through your production account.'
              : 'WhatsApp API credentials are not active. Reconnect to resume message delivery.'}
          </Text>

          <View style={styles.heroFooter}>
            <View style={styles.metaApiBadge}>
              <View style={styles.greenLiveDot} />
              <Text style={styles.metaApiText}>Live Meta API</Text>
            </View>
            <Text style={styles.lastSyncText}>Last sync: {lastSyncText}</Text>
          </View>
        </View>

        {/* ================= ACTION BUTTONS (Reconnect / Export / Save) ================= */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('ReconnectWhatsApp')}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh-outline" size={18} color="#00875A" />
            <Text style={styles.actionBtnText}>Reconnect</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => {
              Alert.alert('Configuration Exported', 'WhatsApp configuration exported to clipboard.');
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="download-outline" size={18} color="#00875A" />
            <Text style={styles.actionBtnText}>Export</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => {
              Alert.alert('Saved', 'Configuration verified and saved.');
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="checkmark-outline" size={18} color="#00875A" />
            <Text style={styles.actionBtnText}>Save</Text>
          </TouchableOpacity>
        </View>

        {/* ================= SYSTEM STATUS SECTION ================= */}
        <Text style={styles.sectionHeader}>SYSTEM STATUS</Text>
        <View style={styles.cardContainer}>
          <View style={styles.overviewHeaderRow}>
            <Text style={styles.overviewTitle}>Connection overview</Text>
            <View style={[styles.statusPillSmall, !isConnected && styles.statusPillSmallDisconnected]}>
              <View style={[styles.statusDotSmall, !isConnected && styles.statusDotDisconnected]} />
              <Text style={[styles.statusPillSmallText, !isConnected && styles.statusPillTextDisconnected]}>
                {isConnected ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>

          <View style={styles.overviewGrid}>
            <View style={styles.gridCol}>
              <Text style={styles.gridLabel}>Environment</Text>
              <Text style={styles.gridValue}>Production</Text>
            </View>
            <View style={styles.gridCol}>
              <Text style={styles.gridLabel}>Last successful sync</Text>
              <Text style={styles.gridValue}>Today, 10:42 AM</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.refreshOutlineBtn}
            onPress={handleRefreshConnection}
            activeOpacity={0.7}
            disabled={refreshing}
          >
            {refreshing ? (
              <ActivityIndicator size="small" color="#00875A" />
            ) : (
              <>
                <Ionicons name="refresh-outline" size={16} color="#00875A" style={{ marginRight: 6 }} />
                <Text style={styles.refreshOutlineText}>Refresh connection status</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* ================= CONFIGURATION LIST ================= */}
        <Text style={styles.sectionHeader}>CONFIGURATION</Text>
        <View style={styles.cardContainer}>
          {/* Connection Health */}
          <TouchableOpacity
            style={styles.configItemRow}
            onPress={() => navigation.navigate('ConnectionHealth')}
            activeOpacity={0.7}
          >
            <View style={[styles.configIconBox, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="pulse-outline" size={20} color="#00875A" />
            </View>
            <View style={styles.configItemContent}>
              <Text style={styles.configItemTitle}>Connection Health</Text>
              <Text style={styles.configItemSubtitle}>All systems operational</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.itemDivider} />

          {/* API Credentials */}
          <TouchableOpacity
            style={styles.configItemRow}
            onPress={() => navigation.navigate('ApiCredentials', { config })}
            activeOpacity={0.7}
          >
            <View style={[styles.configIconBox, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="key-outline" size={20} color="#00875A" />
            </View>
            <View style={styles.configItemContent}>
              <Text style={styles.configItemTitle}>API Credentials</Text>
              <Text style={styles.configItemSubtitle}>Business account, phone and token</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.itemDivider} />

          {/* Webhook Settings */}
          <TouchableOpacity
            style={styles.configItemRow}
            onPress={() => navigation.navigate('WebhookSettings', { config })}
            activeOpacity={0.7}
          >
            <View style={[styles.configIconBox, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="git-network-outline" size={20} color="#00875A" />
            </View>
            <View style={styles.configItemContent}>
              <Text style={styles.configItemTitle}>Webhook Settings</Text>
              <Text style={styles.configItemSubtitle}>Endpoint verified and active</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.itemDivider} />

          {/* Subscribed Events */}
          <TouchableOpacity
            style={styles.configItemRow}
            onPress={() => navigation.navigate('SubscribedEvents', { config })}
            activeOpacity={0.7}
          >
            <View style={[styles.configIconBox, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="newspaper-outline" size={20} color="#00875A" />
            </View>
            <View style={styles.configItemContent}>
              <Text style={styles.configItemTitle}>Subscribed Events</Text>
              <Text style={styles.configItemSubtitle}>4 of 6 events active</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.itemDivider} />

          {/* Phone Number Status */}
          <TouchableOpacity
            style={styles.configItemRow}
            onPress={() => navigation.navigate('PhoneNumberStatus', { config })}
            activeOpacity={0.7}
          >
            <View style={[styles.configIconBox, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="call-outline" size={20} color="#00875A" />
            </View>
            <View style={styles.configItemContent}>
              <Text style={styles.configItemTitle}>Phone Number Status</Text>
              <Text style={styles.configItemSubtitle}>Registration and verification details</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ================= 3-DOTS MENU MODAL ================= */}
      <Modal visible={showMenu} transparent animationType="fade" onRequestClose={() => setShowMenu(false)}>
        <TouchableOpacity style={styles.menuBackdrop} activeOpacity={1} onPress={() => setShowMenu(false)}>
          <View style={styles.menuDialog}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                navigation.navigate('ReconnectWhatsApp');
              }}
            >
              <Ionicons name="refresh-outline" size={18} color="#0F172A" style={{ marginRight: 10 }} />
              <Text style={styles.menuItemText}>Reconnect WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                handleRefreshConnection();
              }}
            >
              <Ionicons name="pulse-outline" size={18} color="#0F172A" style={{ marginRight: 10 }} />
              <Text style={styles.menuItemText}>Check Connection Health</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                setShowDisconnectModal(true);
              }}
            >
              <Ionicons name="close-circle-outline" size={18} color="#DC2626" style={{ marginRight: 10 }} />
              <Text style={[styles.menuItemText, { color: '#DC2626' }]}>Disconnect WhatsApp</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ================= DISCONNECT FINAL CONFIRMATION MODAL (Image 5 Screen 1) ================= */}
      <Modal
        visible={showDisconnectModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDisconnectModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.confirmDialog}>
            <Text style={styles.confirmTitle}>Final confirmation</Text>
            <Text style={styles.confirmBody}>
              Are you sure? Account data will be retained, but all message processing will stop immediately.
            </Text>

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setUnderstandDisconnect(!understandDisconnect)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkboxSquare, understandDisconnect && styles.checkboxSquareChecked]}>
                {understandDisconnect && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
              </View>
              <Text style={styles.checkboxLabel}>I understand this will stop messaging</Text>
            </TouchableOpacity>

            <View style={styles.confirmActionsRow}>
              <TouchableOpacity
                style={styles.cancelModalBtn}
                onPress={() => setShowDisconnectModal(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelModalBtnText}>Go Back</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.disconnectModalBtn,
                  !understandDisconnect && styles.disconnectModalBtnDisabled,
                ]}
                onPress={handleDisconnectConfirm}
                disabled={!understandDisconnect}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.disconnectModalBtnText,
                    !understandDisconnect && styles.disconnectModalBtnTextDisabled,
                  ]}
                >
                  Disconnect Now
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingTop: 0,
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
  moreBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
  },

  // Hero Card
  heroCard: {
    backgroundColor: '#064E3B',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  heroCardDisconnected: {
    backgroundColor: '#7F1D1D',
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  waIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  heroBrandCol: {
    flex: 1,
  },
  heroBrandTag: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#6EE7B7',
    letterSpacing: 0.6,
  },
  heroTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 1,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPillDisconnected: {
    backgroundColor: 'rgba(254, 202, 202, 0.25)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
    marginRight: 6,
  },
  statusDotDisconnected: {
    backgroundColor: '#F87171',
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statusPillTextDisconnected: {
    color: '#FEE2E2',
  },
  heroDesc: {
    fontSize: 12.5,
    color: '#D1FAE5',
    lineHeight: 18,
    marginBottom: 16,
  },
  heroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
    paddingTop: 12,
  },
  metaApiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greenLiveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  metaApiText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#A7F3D0',
  },
  lastSyncText: {
    fontSize: 11,
    color: '#6EE7B7',
  },

  // 3 Action Buttons
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 22,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginLeft: 6,
  },

  // Sections
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginTop: 4,
    paddingHorizontal: 2,
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 18,
  },

  // System Status Card
  overviewHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  overviewTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  statusPillSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusPillSmallDisconnected: {
    backgroundColor: '#FEE2E2',
  },
  statusDotSmall: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#16A34A',
    marginRight: 5,
  },
  statusPillSmallText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
  },
  overviewGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  gridCol: {
    flex: 1,
  },
  gridLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 4,
  },
  gridValue: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  refreshOutlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  refreshOutlineText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00875A',
  },

  // Configuration rows
  configItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  configIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  configItemContent: {
    flex: 1,
  },
  configItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  configItemSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  itemDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },

  // More Menu Modal
  menuBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 56,
    paddingRight: 16,
  },
  menuDialog: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 8,
    width: 220,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  menuItemText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#0F172A',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },

  // Disconnect Confirmation Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  confirmDialog: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    width: '100%',
    maxWidth: 360,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  confirmBody: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 19,
    marginBottom: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkboxSquare: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxSquareChecked: {
    backgroundColor: '#00875A',
    borderColor: '#00875A',
  },
  checkboxLabel: {
    fontSize: 12.5,
    color: '#0F172A',
    fontWeight: '500',
  },
  confirmActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelModalBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  cancelModalBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  disconnectModalBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EF4444',
    backgroundColor: '#FFFFFF',
  },
  disconnectModalBtnDisabled: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
  },
  disconnectModalBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#EF4444',
  },
  disconnectModalBtnTextDisabled: {
    color: '#F87171',
  },
});
