import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

const MORE_ITEMS = [
  {
    id: 'crm_pipeline',
    title: 'CRM Pipeline',
    subtitle: 'Track deals & lead stages',
    icon: 'git-network-outline',
    iconBg: '#ECFDF5',
    iconColor: '#059669',
    route: 'CrmPipeline',
  },
  {
    id: 'labels',
    title: 'Labels',
    subtitle: 'Organize contact tags',
    icon: 'pricetag-outline',
    iconBg: '#ECFDF5',
    iconColor: '#059669',
    route: 'Labels',
  },
  {
    id: 'templates',
    title: 'Templates',
    subtitle: 'WhatsApp template manager',
    icon: 'document-text-outline',
    iconBg: '#ECFDF5',
    iconColor: '#059669',
    route: 'Templates',
  },
  {
    id: 'custom_fields',
    title: 'Custom Fields',
    subtitle: 'Define contact attributes',
    icon: 'list-outline',
    iconBg: '#EFF6FF',
    iconColor: '#2563EB',
    modal: 'customFields',
  },
  {
    id: 'quick_reply',
    title: 'Quick Reply',
    subtitle: 'Saved message shortcuts',
    icon: 'flash-outline',
    iconBg: '#FFFBEB',
    iconColor: '#D97706',
    modal: 'quickReplies',
  },
  {
    id: 'team',
    title: 'Team',
    subtitle: 'Agents & availability',
    icon: 'people-outline',
    iconBg: '#F5F3FF',
    iconColor: '#7C3AED',
    modal: 'team',
  },
  {
    id: 'team_box',
    title: 'Team Box',
    subtitle: 'Shared team conversations',
    icon: 'chatbubbles-outline',
    iconBg: '#ECFDF5',
    iconColor: '#059669',
    route: 'Chats',
  },
  {
    id: 'analytics',
    title: 'Analytics',
    subtitle: 'Response & conversion stats',
    icon: 'bar-chart-outline',
    iconBg: '#F0FDFA',
    iconColor: '#0F766E',
    modal: 'analytics',
  },
  {
    id: 'broadcast',
    title: 'Broadcast',
    subtitle: 'Bulk template campaigns',
    icon: 'megaphone-outline',
    iconBg: '#FFF7ED',
    iconColor: '#EA580C',
    route: 'TemplateSelection',
  },
  {
    id: 'automation',
    title: 'Automation',
    subtitle: 'Bot flows & triggers',
    icon: 'hardware-chip-outline',
    iconBg: '#ECFDF5',
    iconColor: '#059669',
    route: 'BotMenu',
  },
  {
    id: 'whatsapp_api',
    title: 'WhatsApp API',
    subtitle: 'WABA health & webhooks',
    icon: 'logo-whatsapp',
    iconBg: '#ECFDF5',
    iconColor: '#059669',
    modal: 'waba',
  },
  {
    id: 'members',
    title: 'Members Management',
    subtitle: 'Roles & access controls',
    icon: 'shield-checkmark-outline',
    iconBg: '#EFF6FF',
    iconColor: '#1D4ED8',
    modal: 'team',
  },
  {
    id: 'billing',
    title: 'Subscription & Billing',
    subtitle: 'Plan quota & invoices',
    icon: 'card-outline',
    iconBg: '#FDF2F8',
    iconColor: '#DB2777',
    modal: 'billing',
  },
];

const INITIAL_CUSTOM_FIELDS = [
  { id: 'f1', name: 'Company Name', type: 'Text', required: true },
  { id: 'f2', name: 'City', type: 'Text', required: false },
  { id: 'f3', name: 'Monthly Budget', type: 'Number', required: false },
];

const INITIAL_QUICK_REPLIES = [
  { id: 'qr1', shortcut: '/welcome', text: 'Hi! Welcome to MessBee Support. How can we assist you today?' },
  { id: 'qr2', shortcut: '/pricing', text: 'Our Growth Plan starts at ₹2,499/mo with unlimited shared team inbox.' },
  { id: 'qr3', shortcut: '/demo', text: 'Sure! Here is our calendar link to schedule a 15-min live walkthrough.' },
];

const TEAM_LIST = [
  { id: 'tm1', name: 'Afzal Hussain', role: 'Admin / Owner', status: 'Online', initials: 'AH', color: '#059669' },
  { id: 'tm2', name: 'Priya Sharma', role: 'Sales Executive', status: 'Online', initials: 'PS', color: '#3B82F6' },
  { id: 'tm3', name: 'Arshlan Khan', role: 'Support Lead', status: 'Away', initials: 'AK', color: '#F59E0B' },
];

export default function MoreScreen({ navigation }) {
  const [activeModal, setActiveModal] = useState(null);
  const [customFields, setCustomFields] = useState(INITIAL_CUSTOM_FIELDS);
  const [newFieldTitle, setNewFieldTitle] = useState('');
  const [quickReplies, setQuickReplies] = useState(INITIAL_QUICK_REPLIES);
  const [newShortcut, setNewShortcut] = useState('');
  const [newReplyBody, setNewReplyBody] = useState('');

  const handleCardPress = (item) => {
    if (item.route) {
      navigation.navigate(item.route);
      return;
    }
    if (item.modal) {
      setActiveModal(item.modal);
    }
  };

  const handleAddCustomField = () => {
    const clean = newFieldTitle.trim();
    if (!clean) return;
    setCustomFields((prev) => [...prev, { id: `f_${Date.now()}`, name: clean, type: 'Text', required: false }]);
    setNewFieldTitle('');
  };

  const handleAddQuickReply = () => {
    const sc = newShortcut.trim();
    const bd = newReplyBody.trim();
    if (!sc || !bd) {
      Alert.alert('Required Fields', 'Enter both shortcut and quick reply text.');
      return;
    }
    const normalized = sc.startsWith('/') ? sc : `/${sc}`;
    setQuickReplies((prev) => [{ id: `qr_${Date.now()}`, shortcut: normalized, text: bd }, ...prev]);
    setNewShortcut('');
    setNewReplyBody('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>More</Text>
        <Text style={styles.headerSub}>CRM tools, automation, team & workspace settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.gridScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {MORE_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              activeOpacity={0.82}
              onPress={() => handleCardPress(item)}
            >
              <View style={[styles.iconBox, { backgroundColor: item.iconBg }]}>
                <Ionicons name={item.icon} size={20} color={item.iconColor} />
              </View>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.cardSub} numberOfLines={2}>
                {item.subtitle}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Custom Fields Modal */}
      <Modal
        visible={activeModal === 'customFields'}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.sheetBackdrop}>
          <View style={styles.sheetBox}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Custom Fields</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons name="close" size={22} color="#374151" />
              </TouchableOpacity>
            </View>

            <View style={styles.inlineRow}>
              <TextInput
                value={newFieldTitle}
                onChangeText={setNewFieldTitle}
                placeholder="Add new field (e.g. GSTIN)"
                placeholderTextColor="#9CA3AF"
                style={[styles.input, { flex: 1 }]}
              />
              <TouchableOpacity style={styles.addSmallBtn} onPress={handleAddCustomField}>
                <Text style={styles.addSmallBtnText}>Add</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 300 }}>
              {customFields.map((cf) => (
                <View key={cf.id} style={styles.listRowCard}>
                  <View>
                    <Text style={styles.listRowTitle}>{cf.name}</Text>
                    <Text style={styles.listRowSub}>
                      Type: {cf.type} {cf.required ? '• Mandatory' : '• Optional'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setCustomFields((prev) => prev.filter((x) => x.id !== cf.id))}
                  >
                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Quick Replies Modal */}
      <Modal
        visible={activeModal === 'quickReplies'}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.sheetBackdrop}>
          <View style={styles.sheetBox}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Quick Reply Templates</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons name="close" size={22} color="#374151" />
              </TouchableOpacity>
            </View>

            <TextInput
              value={newShortcut}
              onChangeText={setNewShortcut}
              placeholder="Shortcut (e.g. /offer)"
              placeholderTextColor="#9CA3AF"
              style={[styles.input, { marginBottom: 8 }]}
            />
            <TextInput
              value={newReplyBody}
              onChangeText={setNewReplyBody}
              placeholder="Quick reply message..."
              placeholderTextColor="#9CA3AF"
              multiline
              style={[styles.input, { height: 64, paddingTop: 10, marginBottom: 10 }]}
            />
            <TouchableOpacity style={styles.fullGreenBtn} onPress={handleAddQuickReply}>
              <Text style={styles.fullGreenBtnText}>Save Quick Reply</Text>
            </TouchableOpacity>

            <ScrollView style={{ maxHeight: 240, marginTop: 12 }}>
              {quickReplies.map((qr) => (
                <View key={qr.id} style={styles.listRowCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.shortcutBadge}>{qr.shortcut}</Text>
                    <Text style={styles.listRowSub}>{qr.text}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Team & Members Modal */}
      <Modal
        visible={activeModal === 'team'}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.sheetBackdrop}>
          <View style={styles.sheetBox}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Team & Members Management</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons name="close" size={22} color="#374151" />
              </TouchableOpacity>
            </View>
            {TEAM_LIST.map((m) => (
              <View key={m.id} style={styles.listRowCard}>
                <View style={styles.memberLeft}>
                  <View style={[styles.memberAvatar, { backgroundColor: m.color }]}>
                    <Text style={styles.memberInitials}>{m.initials}</Text>
                  </View>
                  <View>
                    <Text style={styles.listRowTitle}>{m.name}</Text>
                    <Text style={styles.listRowSub}>{m.role}</Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.statusTag,
                    { backgroundColor: m.status === 'Online' ? '#ECFDF5' : '#FEF3C7' },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: '700',
                      color: m.status === 'Online' ? '#059669' : '#B45309',
                    }}
                  >
                    {m.status}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </Modal>

      {/* Analytics / WABA / Billing Summary Modal */}
      <Modal
        visible={activeModal === 'analytics' || activeModal === 'waba' || activeModal === 'billing'}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.sheetBackdrop}>
          <View style={styles.sheetBox}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>
                {activeModal === 'analytics'
                  ? 'CRM & Messaging Analytics'
                  : activeModal === 'waba'
                  ? 'WhatsApp Business API'
                  : 'Subscription & Billing'}
              </Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons name="close" size={22} color="#374151" />
              </TouchableOpacity>
            </View>

            {activeModal === 'analytics' && (
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statNum}>94.2%</Text>
                  <Text style={styles.statLbl}>Delivery Rate</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNum}>3m 12s</Text>
                  <Text style={styles.statLbl}>Avg Response</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNum}>148</Text>
                  <Text style={styles.statLbl}>Active Leads</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNum}>28%</Text>
                  <Text style={styles.statLbl}>Lead Won Rate</Text>
                </View>
              </View>
            )}

            {activeModal === 'waba' && (
              <View style={styles.infoBox}>
                <Text style={styles.infoRow}>Status: Connected (Green Quality)</Text>
                <Text style={styles.infoRow}>Messaging Limit: 100K / 24hr Tier</Text>
                <Text style={styles.infoRow}>Webhook Sync: Healthy</Text>
              </View>
            )}

            {activeModal === 'billing' && (
              <View style={styles.infoBox}>
                <Text style={styles.infoRow}>Current Plan: MessBee Pro CRM</Text>
                <Text style={styles.infoRow}>Next Renewal: 01 Dec 2026</Text>
                <Text style={styles.infoRow}>Seats Used: 3 / 10 Team Agents</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingTop: Platform.OS === 'android' ? 32 : 0,
  },
  header: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 23,
    fontWeight: '800',
    color: '#111827',
  },
  headerSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  gridScroll: {
    padding: 16,
    paddingBottom: 32,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  card: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  cardSub: {
    fontSize: 11.5,
    color: '#6B7280',
    marginTop: 3,
    lineHeight: 16,
  },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.45)',
    justifyContent: 'flex-end',
  },
  sheetBox: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 30 : 22,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginBottom: 12,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  inlineRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    fontSize: 13,
    color: '#111827',
  },
  addSmallBtn: {
    paddingHorizontal: 16,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addSmallBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  fullGreenBtn: {
    backgroundColor: '#059669',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },
  fullGreenBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
  listRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  listRowTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  listRowSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  shortcutBadge: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#059669',
  },
  memberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberInitials: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  statusTag: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statNum: {
    fontSize: 20,
    fontWeight: '800',
    color: '#059669',
  },
  statLbl: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  infoBox: {
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  infoRow: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#065F46',
  },
});

