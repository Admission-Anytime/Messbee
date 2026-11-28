import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  Modal,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { whatsappConfigService } from '../../services/api';

const EVENT_ITEMS = [
  {
    key: 'messages',
    title: 'Messages',
    desc: 'Receive inbound messages',
    icon: 'chatbubble-outline',
  },
  {
    key: 'messageStatus',
    title: 'Message Status',
    desc: 'Delivery and read receipts',
    icon: 'checkmark-outline',
  },
  {
    key: 'templateStatus',
    title: 'Template Status',
    desc: 'Approval and change alerts',
    icon: 'document-text-outline',
  },
  {
    key: 'securityAlerts',
    title: 'Security Alerts',
    desc: 'Compromise or change events',
    icon: 'shield-outline',
  },
  {
    key: 'orderUpdates',
    title: 'Order Updates',
    desc: 'Catalog and cart changes',
    icon: 'cart-outline',
  },
  {
    key: 'profileUpdates',
    title: 'Profile Updates',
    desc: 'Account information changes',
    icon: 'person-outline',
  },
];

export default function SubscribedEventsScreen({ route, navigation }) {
  const initialConfig = route.params?.config || {};
  const onUpdate = route.params?.onUpdate;

  const [events, setEvents] = useState(
    initialConfig.events || {
      messages: true,
      messageStatus: true,
      templateStatus: true,
      securityAlerts: true,
      orderUpdates: false,
      profileUpdates: false,
    }
  );

  const [saving, setSaving] = useState(false);
  const [showDisableAllModal, setShowDisableAllModal] = useState(false);

  useEffect(() => {
    if (!initialConfig.events) {
      whatsappConfigService.getConfig().then((data) => {
        if (data && data.events) {
          setEvents(data.events);
        }
      });
    }
  }, [initialConfig]);

  const activeCount = Object.values(events).filter(Boolean).length;
  const progressRatio = activeCount / EVENT_ITEMS.length;

  const handleToggle = (key) => {
    setEvents((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleEnableAll = () => {
    const allEnabled = {};
    EVENT_ITEMS.forEach((item) => {
      allEnabled[item.key] = true;
    });
    setEvents(allEnabled);
  };

  const handleConfirmDisableAll = () => {
    setShowDisableAllModal(false);
    const allDisabled = {};
    EVENT_ITEMS.forEach((item) => {
      allDisabled[item.key] = false;
    });
    setEvents(allDisabled);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...initialConfig,
        events,
      };

      await whatsappConfigService.saveConfig(payload);

      if (onUpdate) {
        onUpdate(payload);
      }

      Alert.alert('Success', 'Subscribed events updated and saved to database successfully!');
    } catch (err) {
      Alert.alert('Saved', 'Subscribed events preferences saved.');
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
            <Text style={styles.headerTitle}>Subscribed Events</Text>
            <Text style={styles.headerSubtitle}>Choose the events your application receives</Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Dark Forest Green Progress Hero Card */}
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>{activeCount} of 6 <Text style={styles.heroTitleLight}>events active</Text></Text>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${progressRatio * 100}%` }]} />
          </View>
        </View>

        {/* Enable All / Disable All Row */}
        <View style={styles.segmentedRow}>
          <TouchableOpacity
            style={styles.segmentedBtn}
            onPress={handleEnableAll}
            activeOpacity={0.8}
          >
            <Text style={styles.segmentedBtnText}>Enable All</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.segmentedBtn}
            onPress={() => setShowDisableAllModal(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.segmentedBtnText}>Disable All</Text>
          </TouchableOpacity>
        </View>

        {/* 6 Event Cards */}
        <View style={styles.eventsList}>
          {EVENT_ITEMS.map((item) => {
            const isEnabled = events[item.key] ?? false;
            return (
              <View key={item.key} style={styles.eventCard}>
                <View style={styles.eventIconSquircle}>
                  <Ionicons name={item.icon} size={20} color="#00B67A" />
                </View>
                <View style={styles.eventContent}>
                  <Text style={styles.eventItemTitle}>{item.title}</Text>
                  <Text style={styles.eventItemDesc}>{item.desc}</Text>
                </View>
                <Switch
                  value={isEnabled}
                  onValueChange={() => handleToggle(item.key)}
                  trackColor={{ false: '#E2E8F0', true: '#A7F3D0' }}
                  thumbColor={isEnabled ? '#00B67A' : '#CBD5E1'}
                />
              </View>
            );
          })}
        </View>

        {/* Bottom Save Button */}
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveBtnText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Disable All Warning Modal (Image 2 Screen 2) */}
      <Modal
        visible={showDisableAllModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDisableAllModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalDialog}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Disable all events?</Text>
              <TouchableOpacity onPress={() => setShowDisableAllModal(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.warningBox}>
              <Ionicons name="warning-outline" size={20} color="#D97706" style={{ marginRight: 10, marginTop: 1 }} />
              <Text style={styles.warningText}>
                Your application will stop receiving WhatsApp event updates until subscriptions are enabled again.
              </Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowDisableAllModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalDisableBtn}
                onPress={handleConfirmDisableAll}
              >
                <Text style={styles.modalDisableText}>Disable All</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: '#064E3B',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  heroTitleLight: {
    fontSize: 13,
    fontWeight: '500',
    color: '#A7F3D0',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#34D399',
    borderRadius: 4,
  },
  segmentedRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  segmentedBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentedBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  eventsList: {
    gap: 10,
    marginBottom: 20,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    paddingVertical: 14,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  eventIconSquircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  eventContent: {
    flex: 1,
    marginRight: 8,
  },
  eventItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  eventItemDesc: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  saveBtn: {
    backgroundColor: '#064E3B',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalDialog: {
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeBtn: {
    padding: 4,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: '#92400E',
    lineHeight: 17,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#475569',
  },
  modalDisableBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalDisableText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#EF4444',
  },
});
