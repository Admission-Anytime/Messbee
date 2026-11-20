import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { whatsappConfigService } from '../../services/api';

const EVENT_DEFINITIONS = [
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
    icon: 'checkmark-done-outline',
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

  const [showDisableModal, setShowDisableModal] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialConfig.events) {
      setEvents(initialConfig.events);
    }
  }, [initialConfig]);

  const activeCount = Object.values(events).filter(Boolean).length;
  const totalCount = EVENT_DEFINITIONS.length;

  const toggleEvent = (key) => {
    setEvents((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleEnableAll = () => {
    const updated = {};
    EVENT_DEFINITIONS.forEach((e) => {
      updated[e.key] = true;
    });
    setEvents(updated);
  };

  const handleDisableAllConfirm = () => {
    setShowDisableModal(false);
    const updated = {};
    EVENT_DEFINITIONS.forEach((e) => {
      updated[e.key] = false;
    });
    setEvents(updated);
  };

  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      const updated = {
        ...(initialConfig || {}),
        events,
      };
      await whatsappConfigService.saveConfig(updated);
      Alert.alert('Saved', 'Subscribed events updated successfully.');
    } catch (err) {
      Alert.alert('Error', 'Failed to save subscribed events.');
    } finally {
      setSaving(false);
    }
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
          <Text style={styles.headerTitle}>Subscribed Events</Text>
          <Text style={styles.headerSubtitle}>Choose the events your application receives</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ================= SUMMARY PROGRESS CARD (Image 4 Screen 1) ================= */}
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>
            {activeCount} of {totalCount} <Text style={styles.progressTitleSub}>events active</Text>
          </Text>
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${(activeCount / totalCount) * 100}%` },
              ]}
            />
          </View>
        </View>

        {/* ================= ENABLE ALL / DISABLE ALL BUTTONS ================= */}
        <View style={styles.toggleActionsRow}>
          <TouchableOpacity
            style={styles.pillActionBtn}
            onPress={handleEnableAll}
            activeOpacity={0.7}
          >
            <Text style={styles.pillActionBtnText}>Enable All</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.pillActionBtn}
            onPress={() => setShowDisableModal(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.pillActionBtnText}>Disable All</Text>
          </TouchableOpacity>
        </View>

        {/* ================= EVENT TOGGLE LIST ================= */}
        <View style={styles.cardContainer}>
          {EVENT_DEFINITIONS.map((def, idx) => {
            const isEnabled = Boolean(events[def.key]);
            return (
              <React.Fragment key={def.key}>
                {idx > 0 && <View style={styles.itemDivider} />}
                <View style={styles.eventRow}>
                  <View style={[styles.eventIconBox, isEnabled && styles.eventIconBoxActive]}>
                    <Ionicons
                      name={def.icon}
                      size={20}
                      color={isEnabled ? '#00875A' : '#94A3B8'}
                    />
                  </View>
                  <View style={styles.eventInfoCol}>
                    <Text style={styles.eventTitle}>{def.title}</Text>
                    <Text style={styles.eventDesc}>{def.desc}</Text>
                  </View>
                  <Switch
                    value={isEnabled}
                    onValueChange={() => toggleEvent(def.key)}
                    trackColor={{ false: '#E2E8F0', true: '#34D399' }}
                    thumbColor={isEnabled ? '#00875A' : '#FFFFFF'}
                  />
                </View>
              </React.Fragment>
            );
          })}
        </View>

        {/* Save Changes Button */}
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSaveChanges}
          activeOpacity={0.85}
          disabled={saving}
        >
          <Text style={styles.saveBtnText}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ================= DISABLE ALL MODAL (Image 4 Screen 2) ================= */}
      <Modal
        visible={showDisableModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDisableModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.disableDialog}>
            <Text style={styles.disableTitle}>Disable all events?</Text>

            <View style={styles.warningBox}>
              <Ionicons name="warning-outline" size={18} color="#D97706" style={{ marginRight: 8, marginTop: 1 }} />
              <Text style={styles.warningText}>
                Your application will stop receiving WhatsApp event updates until subscriptions are enabled again.
              </Text>
            </View>

            <View style={styles.disableActionsRow}>
              <TouchableOpacity
                style={styles.cancelModalBtn}
                onPress={() => setShowDisableModal(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelModalBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmDisableBtn}
                onPress={handleDisableAllConfirm}
                activeOpacity={0.85}
              >
                <Text style={styles.confirmDisableBtnText}>Disable All</Text>
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
  scrollContent: {
    padding: 16,
  },

  // Progress Card
  progressCard: {
    backgroundColor: '#064E3B',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  progressTitleSub: {
    fontSize: 13,
    fontWeight: '500',
    color: '#A7F3D0',
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },

  // Toggle Actions
  toggleActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  pillActionBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pillActionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00875A',
  },

  // Events List
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  eventIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  eventIconBoxActive: {
    backgroundColor: '#DCFCE7',
  },
  eventInfoCol: {
    flex: 1,
    marginRight: 10,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  eventDesc: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  itemDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },

  // Save Button
  saveBtn: {
    backgroundColor: '#00875A',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00875A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  saveBtnText: {
    fontSize: 14,
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
  disableDialog: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 360,
  },
  disableTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 20,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: '#92400E',
    lineHeight: 17,
  },
  disableActionsRow: {
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
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  confirmDisableBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    backgroundColor: '#FFFFFF',
  },
  confirmDisableBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#DC2626',
  },
});
