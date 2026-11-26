import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Modal,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { automationService } from '../../services/api';
import { validateForm } from '../../utils/validation';

const WORKFLOW_STARTERS = [
  {
    id: 'starter_qr',
    name: 'QR Automation',
    trigger: 'QR code scanned or wa.me link opened',
    action: 'Send welcome message & notify team',
    type: 'QR_TRIGGER',
    replyText: 'Welcome! Thanks for scanning our QR code. How can we help you today?',
  },
  {
    id: 'starter_welcome',
    name: 'Welcome New Users',
    trigger: 'First incoming message from contact',
    action: 'Reply with greeting & menu options',
    type: 'WELCOME',
    replyText: 'Hi! Welcome to our WhatsApp Business desk. Reply 1 for Support or 2 for Pricing.',
  },
  {
    id: 'starter_away',
    name: 'After-Hours Auto Reply',
    trigger: 'Message received outside business hours',
    action: 'Send away message & schedule follow-up',
    type: 'AWAY',
    replyText: 'Thanks for reaching out! Our team is currently offline and will reply shortly.',
  },
];

export default function AutomationDashboardScreen({ navigation }) {
  const [automations, setAutomations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Active' | 'Paused'

  // Create / Edit Automation Modal
  const [showBuilderModal, setShowBuilderModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [flowName, setFlowName] = useState('');
  const [triggerKeyword, setTriggerKeyword] = useState('');
  const [replyText, setReplyText] = useState('');

  const loadAutomations = useCallback(async () => {
    try {
      const list = await automationService.getAutomations();
      setAutomations(Array.isArray(list) ? list : []);
    } catch (err) {
      console.warn('AutomationDashboard load error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAutomations();
    const unsub = navigation.addListener('focus', loadAutomations);
    return unsub;
  }, [loadAutomations, navigation]);

  const stats = useMemo(() => {
    const total = automations.length;
    const active = automations.filter((a) => String(a.status || 'ACTIVE').toUpperCase() === 'ACTIVE' && a.active !== false).length;
    const paused = total - active;
    const messages = automations.reduce((s, a) => s + Number(a.runsCount || a.executions || a.messagesSent || 0), 0);
    return { total, active, paused, messages };
  }, [automations]);

  const filteredAutomations = useMemo(() => {
    return automations.filter((a) => {
      const isActive = String(a.status || 'ACTIVE').toUpperCase() === 'ACTIVE' && a.active !== false;
      if (statusFilter === 'Active' && !isActive) return false;
      if (statusFilter === 'Paused' && isActive) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          String(a.name || '').toLowerCase().includes(q) ||
          String(a.description || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [automations, statusFilter, searchQuery]);

  const handleToggleStatus = async (item) => {
    const isCurrentlyActive = String(item.status || 'ACTIVE').toUpperCase() === 'ACTIVE' && item.active !== false;
    const nextStatus = isCurrentlyActive ? 'PAUSED' : 'ACTIVE';
    setAutomations((prev) =>
      prev.map((a) => (a._id === item._id ? { ...a, status: nextStatus, active: nextStatus === 'ACTIVE' } : a))
    );
    try {
      await automationService.updateAutomation(item._id, {
        status: nextStatus,
        active: nextStatus === 'ACTIVE',
      });
    } catch (err) {
      loadAutomations();
      Alert.alert('Update Failed', err?.response?.data?.message || err?.message || 'Could not update automation.');
    }
  };

  const openCreateModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFlowName(item.name || '');
      const firstTrig = Array.isArray(item.triggers) ? item.triggers[0]?.value || '' : '';
      setTriggerKeyword(firstTrig);
      setReplyText(item.description || item.replyText || '');
    } else {
      setEditingItem(null);
      setFlowName('');
      setTriggerKeyword('');
      setReplyText('');
    }
    setShowBuilderModal(true);
  };

  const handleSaveAutomation = async () => {
    const { isValid, firstError } = validateForm({
      flowName: { value: flowName, required: true, minLength: 3, label: 'Workflow Name' },
      triggerKeyword: { value: triggerKeyword, required: true, label: 'Trigger Keyword' },
      replyText: { value: replyText, required: true, minLength: 5, label: 'Reply Message' },
    });

    if (!isValid) {
      Alert.alert('Validation Error', firstError);
      return;
    }

    const payload = {
      name: flowName.trim(),
      description: replyText.trim(),
      status: editingItem ? editingItem.status || 'ACTIVE' : 'ACTIVE',
      triggers: [{ type: 'KEYWORD', value: triggerKeyword.trim() }],
      nodes: [
        { id: 'trigger_1', type: 'trigger', data: { keyword: triggerKeyword.trim() } },
        { id: 'msg_1', type: 'message', data: { text: replyText.trim() } },
      ],
    };

    try {
      setSaving(true);
      if (editingItem?._id) {
        await automationService.updateAutomation(editingItem._id, payload);
      } else {
        await automationService.createAutomation(payload);
      }
      setShowBuilderModal(false);
      await loadAutomations();
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || err?.message || 'Could not save automation.');
    } finally {
      setSaving(false);
    }
  };

  const handleLaunchStarter = async (starter) => {
    try {
      setSaving(true);
      await automationService.createAutomation({
        name: starter.name,
        description: starter.replyText,
        type: starter.type,
        status: 'ACTIVE',
        triggers: [{ type: 'EVENT', value: starter.trigger }],
        nodes: [
          { id: 'trigger_1', type: 'trigger', data: { label: starter.trigger } },
          { id: 'msg_1', type: 'message', data: { text: starter.replyText } },
        ],
      });
      setShowTemplateModal(false);
      await loadAutomations();
      Alert.alert('Launched', `${starter.name} is now active!`);
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || err?.message || 'Could not create automation.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAutomation = (item) => {
    Alert.alert('Delete Automation', `Delete "${item.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await automationService.deleteAutomation(item._id);
            await loadAutomations();
          } catch (err) {
            Alert.alert('Error', err?.response?.data?.message || err?.message || 'Delete failed.');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.boltBox}>
          <Ionicons name="flash" size={18} color="#00875A" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.headerTitle}>Automation</Text>
          <Text style={styles.headerSub}>Workflows that keep your business moving</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Notifications')}>
          <Ionicons name="notifications-outline" size={19} color="#334155" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.iconBtn, { marginLeft: 8 }]} onPress={() => navigation.navigate('BotMenu')}>
          <Ionicons name="settings-outline" size={19} color="#334155" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadAutomations();
            }}
            colors={['#00875A']}
          />
        }
      >
        {/* Search & Filter */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={18} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search automations"
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() =>
              setStatusFilter((prev) => (prev === 'All' ? 'Active' : prev === 'Active' ? 'Paused' : 'All'))
            }
          >
            <Ionicons name="funnel-outline" size={18} color="#00875A" />
          </TouchableOpacity>
        </View>

        {/* Green Smart Workflows Hero */}
        <View style={styles.heroCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTag}>SMART WORKFLOWS</Text>
            <Text style={styles.heroTitle}>Do more, automatically.</Text>
            <Text style={styles.heroDesc}>
              Build customer journeys that work around the clock.
            </Text>
          </View>
          <TouchableOpacity style={styles.heroPlusBtn} onPress={() => openCreateModal(null)}>
            <Ionicons name="add" size={24} color="#00875A" />
          </TouchableOpacity>
        </View>

        {/* 4 KPI Summary Row */}
        <View style={styles.kpiRow}>
          {[
            { icon: 'flash-outline', val: stats.total, label: 'Total', color: '#00875A', bg: '#ECFDF5' },
            { icon: 'play-outline', val: stats.active, label: 'Active', color: '#16A34A', bg: '#F0FDF4' },
            { icon: 'pause-outline', val: stats.paused, label: 'Paused', color: '#D97706', bg: '#FEF3C7' },
            { icon: 'chatbubble-outline', val: stats.messages, label: 'Runs', color: '#2563EB', bg: '#EFF6FF' },
          ].map((k) => (
            <View key={k.label} style={styles.kpiCard}>
              <View style={[styles.kpiIcon, { backgroundColor: k.bg }]}>
                <Ionicons name={k.icon} size={15} color={k.color} />
              </View>
              <Text style={styles.kpiVal}>{k.val}</Text>
              <Text style={styles.kpiLabel}>{k.label}</Text>
            </View>
          ))}
        </View>

        {/* 2 Quick Action Cards */}
        <View style={styles.quickRow}>
          <TouchableOpacity style={styles.quickCard} onPress={() => openCreateModal(null)} activeOpacity={0.8}>
            <View style={[styles.quickIcon, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="add" size={18} color="#00875A" />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.quickTitle}>Start from scratch</Text>
              <Text style={styles.quickSub}>Build your own workflow</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickCard} onPress={() => setShowTemplateModal(true)} activeOpacity={0.8}>
            <View style={[styles.quickIcon, { backgroundColor: '#EDE9FE' }]}>
              <Ionicons name="document-text-outline" size={17} color="#7C3AED" />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.quickTitle}>Use a template</Text>
              <Text style={styles.quickSub}>Launch in a few taps</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Your Automations List */}
        <View style={styles.listHeaderRow}>
          <Text style={styles.sectionTitle}>Your automations ({statusFilter})</Text>
          <TouchableOpacity onPress={() => setStatusFilter('All')}>
            <Text style={styles.viewAllText}>View all</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={{ paddingVertical: 30, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#00875A" />
          </View>
        ) : filteredAutomations.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="flash-off-outline" size={32} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No automations found</Text>
            <Text style={styles.emptySub}>
              Tap "Start from scratch" or "Use a template" to create your first WhatsApp workflow.
            </Text>
          </View>
        ) : (
          filteredAutomations.map((item, idx) => {
            const isActive = String(item.status || 'ACTIVE').toUpperCase() === 'ACTIVE' && item.active !== false;
            const triggerText =
              Array.isArray(item.triggers) && item.triggers.length > 0
                ? item.triggers.map((t) => t.value || t.type).join(', ')
                : 'Incoming WhatsApp message';
            const actionText = item.description || 'Send automated reply';

            return (
              <View key={item._id || idx} style={styles.flowCard}>
                <View style={styles.flowTopRow}>
                  <View style={[styles.flowIconBox, { backgroundColor: isActive ? '#ECFDF5' : '#F1F5F9' }]}>
                    <Ionicons name="git-branch-outline" size={18} color={isActive ? '#00875A' : '#64748B'} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.flowTitle} numberOfLines={1}>{item.name || `Workflow #${idx + 1}`}</Text>
                      <View style={[styles.statusPill, { backgroundColor: isActive ? '#DCFCE7' : '#FEF3C7' }]}>
                        <Text style={[styles.statusPillText, { color: isActive ? '#15803D' : '#B45309' }]}>
                          {isActive ? 'Active' : 'Paused'}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.flowRuns}>
                      {item.runsCount || item.executions || 0} runs
                    </Text>
                  </View>
                  <Switch
                    value={isActive}
                    onValueChange={() => handleToggleStatus(item)}
                    trackColor={{ false: '#CBD5E1', true: '#86EFAC' }}
                    thumbColor={isActive ? '#00875A' : '#FFFFFF'}
                  />
                </View>

                <View style={styles.flowStepsBox}>
                  <View style={styles.flowStepRow}>
                    <Ionicons name="flash-outline" size={14} color="#00875A" />
                    <Text style={styles.flowStepLabel}>Trigger:</Text>
                    <Text style={styles.flowStepVal} numberOfLines={1}>{triggerText}</Text>
                  </View>
                  <View style={[styles.flowStepRow, { marginTop: 6 }]}>
                    <Ionicons name="chatbubble-ellipses-outline" size={14} color="#7C3AED" />
                    <Text style={styles.flowStepLabel}>Action:</Text>
                    <Text style={styles.flowStepVal} numberOfLines={1}>{actionText}</Text>
                  </View>
                </View>

                <View style={styles.flowActionsRow}>
                  <TouchableOpacity style={styles.flowBtn} onPress={() => openCreateModal(item)}>
                    <Ionicons name="create-outline" size={14} color="#00875A" />
                    <Text style={styles.flowBtnText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.flowBtn} onPress={() => handleDeleteAutomation(item)}>
                    <Ionicons name="trash-outline" size={14} color="#EF4444" />
                    <Text style={[styles.flowBtnText, { color: '#EF4444' }]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Start From Scratch / Edit Modal */}
      <Modal visible={showBuilderModal} transparent animationType="slide" onRequestClose={() => setShowBuilderModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingItem ? 'Edit Automation' : 'New Automation'}</Text>
              <TouchableOpacity onPress={() => setShowBuilderModal(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Workflow Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Welcome New Lead"
              placeholderTextColor="#94A3B8"
              value={flowName}
              onChangeText={setFlowName}
            />

            <Text style={[styles.inputLabel, { marginTop: 12 }]}>Trigger Keyword *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. hi, hello, price"
              placeholderTextColor="#94A3B8"
              value={triggerKeyword}
              onChangeText={setTriggerKeyword}
            />

            <Text style={[styles.inputLabel, { marginTop: 12 }]}>Automated Reply Message *</Text>
            <TextInput
              style={[styles.input, { height: 84, textAlignVertical: 'top', paddingTop: 10 }]}
              multiline
              placeholder="Enter automated WhatsApp reply..."
              placeholderTextColor="#94A3B8"
              value={replyText}
              onChangeText={setReplyText}
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveAutomation} disabled={saving}>
              {saving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.saveBtnText}>{editingItem ? 'Save Changes' : 'Create & Activate'}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Prebuilt Templates Modal */}
      <Modal visible={showTemplateModal} transparent animationType="slide" onRequestClose={() => setShowTemplateModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Automation Templates</Text>
              <TouchableOpacity onPress={() => setShowTemplateModal(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            {WORKFLOW_STARTERS.map((st) => (
              <TouchableOpacity
                key={st.id}
                style={styles.starterCard}
                onPress={() => handleLaunchStarter(st)}
                disabled={saving}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.starterTitle}>{st.name}</Text>
                  <Text style={styles.starterSub}>{st.trigger}</Text>
                </View>
                <Ionicons name="add-circle" size={24} color="#00875A" />
              </TouchableOpacity>
            ))}
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
    paddingVertical: 15,
    minHeight: 62,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  boltBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  headerSub: { fontSize: 11.5, color: '#64748B' },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: { padding: 16, paddingBottom: 32 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 13.5, color: '#0F172A' },
  filterBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00875A',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
  },
  heroTag: { fontSize: 10, fontWeight: '700', color: '#A7F3D0', letterSpacing: 0.8, marginBottom: 4 },
  heroTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF', marginBottom: 4 },
  heroDesc: { fontSize: 12, color: '#D1FAE5', lineHeight: 17 },
  heroPlusBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  kpiRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginBottom: 14 },
  kpiCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  kpiIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  kpiVal: { fontSize: 17, fontWeight: '800', color: '#0F172A' },
  kpiLabel: { fontSize: 11, color: '#64748B', marginTop: 1 },
  quickRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  quickCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  quickTitle: { fontSize: 12.5, fontWeight: '700', color: '#0F172A' },
  quickSub: { fontSize: 10.5, color: '#64748B', marginTop: 1 },
  listHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  viewAllText: { fontSize: 12, fontWeight: '700', color: '#00875A' },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginTop: 10 },
  emptySub: { fontSize: 12.5, color: '#64748B', textAlign: 'center', marginTop: 4 },
  flowCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  flowTopRow: { flexDirection: 'row', alignItems: 'center' },
  flowIconBox: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  flowTitle: { fontSize: 14.5, fontWeight: '700', color: '#0F172A', maxWidth: 150 },
  statusPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  statusPillText: { fontSize: 10, fontWeight: '700' },
  flowRuns: { fontSize: 11.5, color: '#64748B', marginTop: 2 },
  flowStepsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },
  flowStepRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  flowStepLabel: { fontSize: 11.5, fontWeight: '700', color: '#475569' },
  flowStepVal: { fontSize: 11.5, color: '#64748B', flex: 1 },
  flowActionsRow: { flexDirection: 'row', gap: 12, marginTop: 10 },
  flowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  flowBtnText: { fontSize: 12, fontWeight: '700', color: '#00875A' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.45)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 28 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  modalTitle: { fontSize: 17, fontWeight: '800', color: '#0F172A' },
  inputLabel: { fontSize: 12.5, fontWeight: '700', color: '#334155', marginBottom: 6 },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 13.5,
    color: '#0F172A',
  },
  saveBtn: {
    backgroundColor: '#00875A',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 18,
  },
  saveBtnText: { fontSize: 14.5, fontWeight: '700', color: '#FFFFFF' },
  starterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  starterTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  starterSub: { fontSize: 12, color: '#64748B', marginTop: 2 },
});
