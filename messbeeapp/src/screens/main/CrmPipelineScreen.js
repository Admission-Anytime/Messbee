import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  Platform,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

const DEFAULT_STAGES = [
  { id: 'new', label: 'New', color: '#2563EB', bg: '#EFF6FF', enabled: true },
  { id: 'contacted', label: 'Contacted', color: '#7C3AED', bg: '#F5F3FF', enabled: true },
  { id: 'qualified', label: 'Qualified', color: '#059669', bg: '#ECFDF5', enabled: true },
  { id: 'proposal', label: 'Proposal', color: '#D97706', bg: '#FFFBEB', enabled: true },
  { id: 'won', label: 'Won', color: '#047857', bg: '#D1FAE5', enabled: true },
  { id: 'lost', label: 'Lost', color: '#6B7280', bg: '#F3F4F6', enabled: true },
];

const PIPELINE_LABELS = [
  { id: 'pl_1', name: 'Hot Deal', color: '#EA580C', bg: '#FFF7ED' },
  { id: 'pl_2', name: 'Enterprise', color: '#0F766E', bg: '#F0FDFA' },
  { id: 'pl_3', name: 'Demo Booked', color: '#2563EB', bg: '#EFF6FF' },
  { id: 'pl_4', name: 'VIP', color: '#7C3AED', bg: '#F5F3FF' },
  { id: 'pl_5', name: 'Follow Up', color: '#D97706', bg: '#FFFBEB' },
];

const OWNERS = ['Afzal Hussain', 'Priya Sharma', 'Arshlan Khan', 'Vinay Verma'];

const INITIAL_LEADS = [
  {
    id: 'ld_1',
    name: 'Sumit Yadav',
    phone: '+91 9765432109',
    email: 'sumit.yadav@outlook.com',
    stage: 'qualified',
    dealValue: 45000,
    owner: 'Afzal Hussain',
    labels: ['Hot Deal', 'Demo Booked'],
    initials: 'SY',
    color: '#F59E0B',
    updatedAt: 'Today, 2:45 PM',
    customFields: { Company: 'Yadav Logistics', City: 'Jaipur' },
    notes: [
      { id: 'n1', author: 'Afzal Hussain', text: 'Shared WhatsApp API onboarding proposal.', time: '2h ago' },
    ],
  },
  {
    id: 'ld_2',
    name: 'Anil Verma',
    phone: '+91 9876543210',
    email: 'anil.verma@techcorp.in',
    stage: 'new',
    dealValue: 85000,
    owner: 'Priya Sharma',
    labels: ['Enterprise'],
    initials: 'AV',
    color: '#10B981',
    updatedAt: 'Today, 11:20 AM',
    customFields: { Company: 'TechCorp India', City: 'New Delhi' },
    notes: [
      { id: 'n2', author: 'Priya Sharma', text: 'Inbound inquiry from website pricing widget.', time: '5h ago' },
    ],
  },
  {
    id: 'ld_3',
    name: 'Priya Nair',
    phone: '+91 9812345678',
    email: 'priya.nair@vermaexports.com',
    stage: 'proposal',
    dealValue: 120000,
    owner: 'Arshlan Khan',
    labels: ['VIP', 'Follow Up'],
    initials: 'PN',
    color: '#6366F1',
    updatedAt: 'Yesterday',
    customFields: { Company: 'Verma Exports', City: 'Mumbai' },
    notes: [
      { id: 'n3', author: 'Arshlan Khan', text: 'Sent annual multi-agent CRM agreement.', time: '1d ago' },
    ],
  },
  {
    id: 'ld_4',
    name: 'Deepak Patel',
    phone: '+91 9711223344',
    email: 'deepak.p@retailhub.in',
    stage: 'won',
    dealValue: 64000,
    owner: 'Afzal Hussain',
    labels: ['Enterprise'],
    initials: 'DP',
    color: '#0D9488',
    updatedAt: 'Nov 09',
    customFields: { Company: 'RetailHub India', City: 'Ahmedabad' },
    notes: [
      { id: 'n4', author: 'Afzal Hussain', text: 'Payment cleared. Activated 8 team seats.', time: '2d ago' },
    ],
  },
];

const LEAD_AVATAR_COLORS = ['#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#EC4899', '#0D9488'];

const getInitials = (name = '') => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'LD';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function CrmPipelineScreen({ navigation }) {
  const [stages, setStages] = useState(DEFAULT_STAGES);
  const [leads, setLeads] = useState(INITIAL_LEADS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStageTab, setActiveStageTab] = useState('all');

  // Custom fields
  const [customFieldDefs, setCustomFieldDefs] = useState([
    { id: 'pcf_1', name: 'Company', type: 'Text' },
    { id: 'pcf_2', name: 'City', type: 'Text' },
  ]);

  // Modals State
  const [selectedLead, setSelectedLead] = useState(null);
  const [showActionsSheet, setShowActionsSheet] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [showConfigureModal, setShowConfigureModal] = useState(false);

  // Add/Edit Lead Form State
  const [showLeadFormModal, setShowLeadFormModal] = useState(false);
  const [editingLeadId, setEditingLeadId] = useState(null);
  const [leadForm, setLeadForm] = useState({
    name: '',
    phone: '',
    email: '',
    dealValue: '',
    stage: 'new',
    owner: OWNERS[0],
    labels: [],
    customFields: {},
  });
  const [customExpanded, setCustomExpanded] = useState(true);
  const [showNewFieldBox, setShowNewFieldBox] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');

  // Configure Stages State
  const [newStageName, setNewStageName] = useState('');

  // Detail Notes Input
  const [noteInput, setNoteInput] = useState('');

  const enabledStages = useMemo(() => stages.filter((s) => s.enabled), [stages]);

  const metrics = useMemo(() => {
    const totalValue = leads.reduce((sum, l) => sum + (Number(l.dealValue) || 0), 0);
    const wonLeads = leads.filter((l) => l.stage === 'won');
    const wonValue = wonLeads.reduce((sum, l) => sum + (Number(l.dealValue) || 0), 0);
    const convRate = leads.length > 0 ? Math.round((wonLeads.length / leads.length) * 100) : 0;
    return {
      totalLeads: leads.length,
      openCount: leads.filter((l) => l.stage !== 'won' && l.stage !== 'lost').length,
      totalValue,
      wonValue,
      convRate,
    };
  }, [leads]);

  const stageCounts = useMemo(() => {
    const map = { all: leads.length };
    stages.forEach((st) => {
      map[st.id] = leads.filter((l) => l.stage === st.id).length;
    });
    return map;
  }, [leads, stages]);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (activeStageTab !== 'all' && lead.stage !== activeStageTab) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const match =
          lead.name.toLowerCase().includes(q) ||
          lead.phone.toLowerCase().includes(q) ||
          (lead.email || '').toLowerCase().includes(q) ||
          (lead.owner || '').toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [leads, activeStageTab, searchQuery]);

  const getStageMeta = (stageId) => {
    return (
      stages.find((s) => s.id === stageId) || {
        id: stageId,
        label: stageId || 'Open',
        color: '#059669',
        bg: '#ECFDF5',
      }
    );
  };

  const openAddLeadModal = () => {
    setEditingLeadId(null);
    setLeadForm({
      name: '',
      phone: '',
      email: '',
      dealValue: '',
      stage: enabledStages[0]?.id || 'new',
      owner: OWNERS[0],
      labels: [],
      customFields: {},
    });
    setShowNewFieldBox(false);
    setNewFieldName('');
    setShowLeadFormModal(true);
  };

  const openEditLeadModal = (lead) => {
    setEditingLeadId(lead.id);
    setLeadForm({
      name: lead.name || '',
      phone: String(lead.phone || '').replace(/^\+91\s*/, ''),
      email: lead.email || '',
      dealValue: String(lead.dealValue || ''),
      stage: lead.stage || 'new',
      owner: lead.owner || OWNERS[0],
      labels: [...(lead.labels || [])],
      customFields: { ...(lead.customFields || {}) },
    });
    setShowNewFieldBox(false);
    setNewFieldName('');
    setShowLeadFormModal(true);
  };

  const handleSaveLead = () => {
    const cleanName = leadForm.name.trim();
    const rawPhone = leadForm.phone.trim();
    if (!cleanName) {
      Alert.alert('Validation Error', 'Lead name is required.');
      return;
    }
    if (!rawPhone || rawPhone.replace(/\D/g, '').length < 10) {
      Alert.alert('Validation Error', 'Valid 10-digit WhatsApp number is required.');
      return;
    }

    const formattedPhone = rawPhone.startsWith('+') ? rawPhone : `+91 ${rawPhone.replace(/\D/g, '').slice(-10)}`;
    const numValue = Math.max(0, Number(leadForm.dealValue) || 0);

    if (editingLeadId) {
      setLeads((prev) =>
        prev.map((l) =>
          l.id === editingLeadId
            ? {
                ...l,
                name: cleanName,
                phone: formattedPhone,
                email: leadForm.email.trim(),
                dealValue: numValue,
                stage: leadForm.stage,
                owner: leadForm.owner,
                labels: leadForm.labels,
                initials: getInitials(cleanName),
                updatedAt: 'Just now',
                customFields: leadForm.customFields,
              }
            : l
        )
      );
    } else {
      const newLead = {
        id: `ld_${Date.now()}`,
        name: cleanName,
        phone: formattedPhone,
        email: leadForm.email.trim(),
        stage: leadForm.stage,
        dealValue: numValue,
        owner: leadForm.owner,
        labels: leadForm.labels,
        initials: getInitials(cleanName),
        color: LEAD_AVATAR_COLORS[leads.length % LEAD_AVATAR_COLORS.length],
        updatedAt: 'Just now',
        customFields: leadForm.customFields,
        notes: [{ id: `n_${Date.now()}`, author: 'You', text: 'Lead added to CRM Pipeline.', time: 'Just now' }],
      };
      setLeads((prev) => [newLead, ...prev]);
    }
    setShowLeadFormModal(false);
  };

  const handleCreateCustomField = () => {
    const clean = newFieldName.trim();
    if (!clean) return;
    if (customFieldDefs.some((f) => f.name.toLowerCase() === clean.toLowerCase())) {
      Alert.alert('Duplicate Field', 'Custom field already exists.');
      return;
    }
    setCustomFieldDefs((prev) => [...prev, { id: `pcf_${Date.now()}`, name: clean, type: 'Text' }]);
    setNewFieldName('');
    setShowNewFieldBox(false);
  };

  const handleChangeLeadStage = (newStageId) => {
    if (!selectedLead) return;
    setLeads((prev) =>
      prev.map((l) => (l.id === selectedLead.id ? { ...l, stage: newStageId, updatedAt: 'Just now' } : l))
    );
    setSelectedLead((prev) => (prev ? { ...prev, stage: newStageId } : prev));
    setShowStatusModal(false);
  };

  const handleToggleLeadLabel = (labelName) => {
    if (!selectedLead) return;
    const exists = (selectedLead.labels || []).includes(labelName);
    const updatedLabels = exists
      ? selectedLead.labels.filter((l) => l !== labelName)
      : [...(selectedLead.labels || []), labelName];

    setLeads((prev) => prev.map((l) => (l.id === selectedLead.id ? { ...l, labels: updatedLabels } : l)));
    setSelectedLead((prev) => (prev ? { ...prev, labels: updatedLabels } : prev));
  };

  const handleDeleteLead = (lead) => {
    Alert.alert('Delete Lead', `Remove ${lead.name} from CRM Pipeline?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setLeads((prev) => prev.filter((item) => item.id !== lead.id));
          setShowActionsSheet(false);
          setShowDetailModal(false);
        },
      },
    ]);
  };

  const handleAddNote = () => {
    const text = noteInput.trim();
    if (!text || !selectedLead) return;
    const noteObj = { id: `note_${Date.now()}`, author: 'You', text, time: 'Just now' };
    const updatedNotes = [noteObj, ...(selectedLead.notes || [])];
    setLeads((prev) => prev.map((l) => (l.id === selectedLead.id ? { ...l, notes: updatedNotes } : l)));
    setSelectedLead((prev) => (prev ? { ...prev, notes: updatedNotes } : prev));
    setNoteInput('');
  };

  const handleAddStage = () => {
    const clean = newStageName.trim();
    if (!clean) return;
    const slug = clean.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    if (stages.some((s) => s.id === slug)) {
      Alert.alert('Stage Exists', 'A pipeline stage with this name already exists.');
      return;
    }
    setStages((prev) => [
      ...prev,
      { id: slug, label: clean, color: '#059669', bg: '#ECFDF5', enabled: true },
    ]);
    setNewStageName('');
  };

  const renderLeadCard = ({ item }) => {
    const stageMeta = getStageMeta(item.stage);
    return (
      <TouchableOpacity
        style={styles.leadCard}
        activeOpacity={0.85}
        onPress={() => {
          setSelectedLead(item);
          setShowDetailModal(true);
        }}
      >
        <View style={styles.leadTopRow}>
          <View style={[styles.avatar, { backgroundColor: item.color }]}>
            <Text style={styles.avatarText}>{item.initials}</Text>
          </View>

          <View style={styles.leadMain}>
            <View style={styles.leadTitleRow}>
              <Text style={styles.leadName} numberOfLines={1}>
                {item.name}
              </Text>
              <View style={[styles.stagePill, { backgroundColor: stageMeta.bg }]}>
                <Text style={[styles.stagePillText, { color: stageMeta.color }]}>{stageMeta.label}</Text>
              </View>
            </View>

            <Text style={styles.leadPhone}>{item.phone}</Text>

            <View style={styles.metaFooterRow}>
              <View style={styles.dealChip}>
                <Text style={styles.dealChipText}>
                  ₹{(Number(item.dealValue) || 0).toLocaleString('en-IN')}
                </Text>
              </View>
              <Text style={styles.ownerText} numberOfLines={1}>
                • {item.owner}
              </Text>
            </View>

            {item.labels && item.labels.length > 0 && (
              <View style={styles.labelsRow}>
                {item.labels.map((lblName) => {
                  const lblMeta = PIPELINE_LABELS.find((p) => p.name === lblName) || {
                    color: '#059669',
                    bg: '#ECFDF5',
                  };
                  return (
                    <View key={lblName} style={[styles.labelChip, { backgroundColor: lblMeta.bg }]}>
                      <View style={[styles.labelDot, { backgroundColor: lblMeta.color }]} />
                      <Text style={[styles.labelChipText, { color: lblMeta.color }]}>{lblName}</Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.moreBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={() => {
              setSelectedLead(item);
              setShowActionsSheet(true);
            }}
          >
            <Ionicons name="ellipsis-horizontal" size={18} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color="#111827" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>CRM Pipeline</Text>
            <Text style={styles.headerSub}>Manage leads, deal stages & conversions</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons Row */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={styles.configureBtn}
          activeOpacity={0.8}
          onPress={() => setShowConfigureModal(true)}
        >
          <Ionicons name="settings-outline" size={16} color="#1F2937" />
          <Text style={styles.configureBtnText}>Configure</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.addLeadBtn} activeOpacity={0.85} onPress={openAddLeadModal}>
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.addLeadBtnText}>Add Lead</Text>
        </TouchableOpacity>
      </View>

      {/* KPI Metrics Row */}
      <View style={styles.kpiWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Active Leads</Text>
            <Text style={styles.kpiVal}>{metrics.openCount}</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Pipeline Value</Text>
            <Text style={[styles.kpiVal, { color: '#059669' }]}>
              ₹{metrics.totalValue.toLocaleString('en-IN')}
            </Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Won Value</Text>
            <Text style={[styles.kpiVal, { color: '#047857' }]}>
              ₹{metrics.wonValue.toLocaleString('en-IN')}
            </Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Win Rate</Text>
            <Text style={[styles.kpiVal, { color: '#2563EB' }]}>{metrics.convRate}%</Text>
          </View>
        </ScrollView>
      </View>

      {/* Search Row */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#9CA3AF" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search leads, phones, emails..."
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={17} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Stage Filter Tabs */}
      <View style={styles.tabsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tabPill, activeStageTab === 'all' && styles.tabPillActive]}
            onPress={() => setActiveStageTab('all')}
          >
            <Text style={[styles.tabText, activeStageTab === 'all' && styles.tabTextActive]}>
              All ({stageCounts.all || 0})
            </Text>
          </TouchableOpacity>

          {enabledStages.map((st) => {
            const active = activeStageTab === st.id;
            return (
              <TouchableOpacity
                key={st.id}
                style={[styles.tabPill, active && styles.tabPillActive]}
                onPress={() => setActiveStageTab(st.id)}
              >
                <View style={[styles.stageDot, { backgroundColor: st.color }]} />
                <Text style={[styles.tabText, active && styles.tabTextActive]}>
                  {st.label} ({stageCounts[st.id] || 0})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Subheader */}
      <View style={styles.subHeader}>
        <Text style={styles.subHeaderCount}>
          {filteredLeads.length} {filteredLeads.length === 1 ? 'Lead' : 'Leads'}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Labels')}>
          <Text style={styles.goLabelsLink}>Manage Labels →</Text>
        </TouchableOpacity>
      </View>

      {/* Leads List */}
      <FlatList
        data={filteredLeads}
        keyExtractor={(item) => item.id}
        renderItem={renderLeadCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="git-network-outline" size={34} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No leads in this stage</Text>
            <Text style={styles.emptySub}>Tap "+ Add Lead" to create a new deal opportunity.</Text>
          </View>
        }
      />

      {/* ==================== LEAD ACTIONS BOTTOM SHEET ==================== */}
      <Modal
        visible={showActionsSheet && !!selectedLead}
        transparent
        animationType="fade"
        onRequestClose={() => setShowActionsSheet(false)}
      >
        <TouchableOpacity
          style={styles.sheetBackdrop}
          activeOpacity={1}
          onPress={() => setShowActionsSheet(false)}
        >
          <View style={styles.sheetBox}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Lead Actions</Text>
              <TouchableOpacity onPress={() => setShowActionsSheet(false)}>
                <Ionicons name="close" size={20} color="#374151" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => {
                setShowActionsSheet(false);
                setShowDetailModal(true);
              }}
            >
              <Ionicons name="eye-outline" size={20} color="#374151" />
              <Text style={styles.actionText}>View Lead Details</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => {
                setShowActionsSheet(false);
                openEditLeadModal(selectedLead);
              }}
            >
              <Ionicons name="create-outline" size={20} color="#374151" />
              <Text style={styles.actionText}>Edit Lead</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => {
                setShowActionsSheet(false);
                setShowStatusModal(true);
              }}
            >
              <Ionicons name="swap-horizontal-outline" size={20} color="#059669" />
              <Text style={styles.actionText}>Change Status</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => {
                setShowActionsSheet(false);
                navigation.navigate('ChatDetail', { contact: selectedLead });
              }}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={20} color="#059669" />
              <Text style={styles.actionText}>Open Chat</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => {
                setShowActionsSheet(false);
                setShowLabelModal(true);
              }}
            >
              <Ionicons name="pricetag-outline" size={20} color="#374151" />
              <Text style={styles.actionText}>Manage Labels</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionRow, { borderBottomWidth: 0 }]}
              onPress={() => handleDeleteLead(selectedLead)}
            >
              <Ionicons name="trash-outline" size={20} color="#DC2626" />
              <Text style={[styles.actionText, { color: '#DC2626' }]}>Delete Lead</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ==================== LEAD DETAILS MODAL ==================== */}
      <Modal
        visible={showDetailModal && !!selectedLead}
        animationType="slide"
        onRequestClose={() => setShowDetailModal(false)}
      >
        <SafeAreaView style={styles.modalScreen}>
          <View style={styles.modalTopHeader}>
            <TouchableOpacity onPress={() => setShowDetailModal(false)} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={22} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Lead Details</Text>
            <TouchableOpacity
              onPress={() => {
                setShowDetailModal(false);
                openEditLeadModal(selectedLead);
              }}
            >
              <Text style={styles.editTopLink}>Edit</Text>
            </TouchableOpacity>
          </View>

          {selectedLead && (
            <ScrollView contentContainerStyle={styles.detailScroll} showsVerticalScrollIndicator={false}>
              {/* Lead Profile Card */}
              <View style={styles.detailProfileCard}>
                <View style={[styles.avatarLg, { backgroundColor: selectedLead.color }]}>
                  <Text style={styles.avatarLgText}>{selectedLead.initials}</Text>
                </View>
                <Text style={styles.detailName}>{selectedLead.name}</Text>
                <Text style={styles.detailSub}>
                  {selectedLead.phone} {selectedLead.email ? `• ${selectedLead.email}` : ''}
                </Text>

                <View style={styles.detailValueBox}>
                  <Text style={styles.detailValueLabel}>Deal Value</Text>
                  <Text style={styles.detailValueNum}>
                    ₹{(Number(selectedLead.dealValue) || 0).toLocaleString('en-IN')}
                  </Text>
                </View>

                <View style={styles.detailQuickBtns}>
                  <TouchableOpacity
                    style={styles.detailQuickBtnGreen}
                    onPress={() => {
                      setShowDetailModal(false);
                      navigation.navigate('ChatDetail', { contact: selectedLead });
                    }}
                  >
                    <Ionicons name="logo-whatsapp" size={16} color="#FFFFFF" />
                    <Text style={styles.detailQuickBtnGreenText}>Open Chat</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.detailQuickBtnOutline}
                    onPress={() => setShowStatusModal(true)}
                  >
                    <Ionicons name="swap-horizontal" size={16} color="#059669" />
                    <Text style={styles.detailQuickBtnOutlineText}>Change Stage</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Stage Progress Pills */}
              <Text style={styles.sectionLabel}>Pipeline Stage</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginBottom: 16 }}>
                {enabledStages.map((st) => {
                  const active = selectedLead.stage === st.id;
                  return (
                    <TouchableOpacity
                      key={st.id}
                      style={[styles.stageChipBtn, active && { backgroundColor: st.bg, borderColor: st.color }]}
                      onPress={() => handleChangeLeadStage(st.id)}
                    >
                      <Text style={[styles.stageChipText, active && { color: st.color, fontWeight: '800' }]}>
                        {st.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Internal Notes */}
              <Text style={styles.sectionLabel}>Activity Notes</Text>
              <View style={styles.noteInputCard}>
                <TextInput
                  value={noteInput}
                  onChangeText={setNoteInput}
                  placeholder="Write a follow-up note for this lead..."
                  placeholderTextColor="#9CA3AF"
                  style={styles.noteInput}
                />
                <TouchableOpacity style={styles.addNoteBtn} onPress={handleAddNote}>
                  <Text style={styles.addNoteBtnText}>Add Note</Text>
                </TouchableOpacity>
              </View>

              {(selectedLead.notes || []).map((n) => (
                <View key={n.id} style={styles.noteCard}>
                  <View style={styles.noteTop}>
                    <Text style={styles.noteAuthor}>{n.author}</Text>
                    <Text style={styles.noteTime}>{n.time}</Text>
                  </View>
                  <Text style={styles.noteText}>{n.text}</Text>
                </View>
              ))}
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>

      {/* ==================== CHANGE STATUS MODAL ==================== */}
      <Modal
        visible={showStatusModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowStatusModal(false)}
      >
        <View style={styles.sheetBackdrop}>
          <View style={styles.sheetBox}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Change Pipeline Stage</Text>
              <TouchableOpacity onPress={() => setShowStatusModal(false)}>
                <Ionicons name="close" size={20} color="#374151" />
              </TouchableOpacity>
            </View>
            {enabledStages.map((st) => {
              const selected = selectedLead?.stage === st.id;
              return (
                <TouchableOpacity
                  key={st.id}
                  style={styles.actionRow}
                  onPress={() => handleChangeLeadStage(st.id)}
                >
                  <View style={[styles.stageDotLg, { backgroundColor: st.color }]} />
                  <Text style={[styles.actionText, { flex: 1 }]}>{st.label}</Text>
                  {selected && <Ionicons name="checkmark-circle" size={20} color="#059669" />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Modal>

      {/* ==================== MANAGE LEAD LABELS MODAL ==================== */}
      <Modal
        visible={showLabelModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLabelModal(false)}
      >
        <View style={styles.sheetBackdrop}>
          <View style={styles.sheetBox}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Manage Lead Labels</Text>
              <TouchableOpacity onPress={() => setShowLabelModal(false)}>
                <Ionicons name="close" size={20} color="#374151" />
              </TouchableOpacity>
            </View>
            <View style={styles.labelChipWrap}>
              {PIPELINE_LABELS.map((lbl) => {
                const active = (selectedLead?.labels || []).includes(lbl.name);
                return (
                  <TouchableOpacity
                    key={lbl.id}
                    style={[
                      styles.labelSelectChip,
                      active && { backgroundColor: lbl.bg, borderColor: lbl.color },
                    ]}
                    onPress={() => handleToggleLeadLabel(lbl.name)}
                  >
                    <View style={[styles.labelDot, { backgroundColor: lbl.color }]} />
                    <Text
                      style={[
                        styles.labelChipText,
                        { color: active ? lbl.color : '#374151', fontSize: 13 },
                      ]}
                    >
                      {lbl.name}
                    </Text>
                    {active && <Ionicons name="checkmark" size={14} color={lbl.color} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

      {/* ==================== CONFIGURE STAGES MODAL ==================== */}
      <Modal
        visible={showConfigureModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowConfigureModal(false)}
      >
        <View style={styles.sheetBackdrop}>
          <View style={styles.sheetBox}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Configure Pipeline Stages</Text>
              <TouchableOpacity onPress={() => setShowConfigureModal(false)}>
                <Ionicons name="close" size={20} color="#374151" />
              </TouchableOpacity>
            </View>

            <View style={styles.addStageRow}>
              <TextInput
                value={newStageName}
                onChangeText={setNewStageName}
                placeholder="New stage name (e.g. Negotiation)"
                placeholderTextColor="#9CA3AF"
                style={[styles.textInput, { flex: 1 }]}
              />
              <TouchableOpacity style={styles.addStageBtn} onPress={handleAddStage}>
                <Text style={styles.addStageBtnText}>Add</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 280 }}>
              {stages.map((st) => (
                <TouchableOpacity
                  key={st.id}
                  style={styles.actionRow}
                  onPress={() =>
                    setStages((prev) =>
                      prev.map((item) => (item.id === st.id ? { ...item, enabled: !item.enabled } : item))
                    )
                  }
                >
                  <View style={[styles.stageDotLg, { backgroundColor: st.color }]} />
                  <Text style={[styles.actionText, { flex: 1 }]}>{st.label}</Text>
                  <Ionicons
                    name={st.enabled ? 'checkbox' : 'square-outline'}
                    size={22}
                    color={st.enabled ? '#059669' : '#9CA3AF'}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ==================== ADD / EDIT LEAD MODAL ==================== */}
      <Modal
        visible={showLeadFormModal}
        animationType="slide"
        onRequestClose={() => setShowLeadFormModal(false)}
      >
        <SafeAreaView style={styles.modalScreen}>
          <View style={styles.modalTopHeader}>
            <TouchableOpacity onPress={() => setShowLeadFormModal(false)} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={22} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{editingLeadId ? 'Edit Lead' : 'Add Lead'}</Text>
            <TouchableOpacity style={styles.saveTopPill} onPress={handleSaveLead}>
              <Text style={styles.saveTopPillText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.formScroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionLabel}>Basic Information</Text>
            <View style={styles.formCard}>
              <Text style={styles.inputLabel}>
                Name <Text style={{ color: '#EF4444' }}>*</Text>
              </Text>
              <TextInput
                value={leadForm.name}
                onChangeText={(val) => setLeadForm((p) => ({ ...p, name: val }))}
                placeholder="Enter full name"
                placeholderTextColor="#9CA3AF"
                style={styles.textInput}
              />

              <Text style={styles.inputLabel}>
                WhatsApp Number <Text style={{ color: '#EF4444' }}>*</Text>
              </Text>
              <View style={styles.phoneInputWrap}>
                <View style={styles.countryPrefix}>
                  <Text style={styles.countryPrefixText}>+91</Text>
                </View>
                <TextInput
                  value={leadForm.phone}
                  onChangeText={(val) => setLeadForm((p) => ({ ...p, phone: val }))}
                  placeholder="Enter 10-digit WhatsApp number"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                  style={styles.phoneTextInput}
                />
              </View>

              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                value={leadForm.email}
                onChangeText={(val) => setLeadForm((p) => ({ ...p, email: val }))}
                placeholder="Enter email address"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.textInput}
              />

              <Text style={styles.inputLabel}>Deal Value (₹)</Text>
              <TextInput
                value={leadForm.dealValue}
                onChangeText={(val) => setLeadForm((p) => ({ ...p, dealValue: val }))}
                placeholder="e.g. 50000"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                style={styles.textInput}
              />

              <Text style={styles.inputLabel}>Pipeline Stage</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {enabledStages.map((st) => {
                  const selected = leadForm.stage === st.id;
                  return (
                    <TouchableOpacity
                      key={st.id}
                      style={[
                        styles.stageChipBtn,
                        selected && { backgroundColor: st.bg, borderColor: st.color },
                      ]}
                      onPress={() => setLeadForm((p) => ({ ...p, stage: st.id }))}
                    >
                      <Text
                        style={[
                          styles.stageChipText,
                          selected && { color: st.color, fontWeight: '700' },
                        ]}
                      >
                        {st.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <Text style={[styles.sectionLabel, { marginTop: 16 }]}>Labels</Text>
            <View style={styles.formCard}>
              <View style={styles.labelChipWrap}>
                {PIPELINE_LABELS.map((lbl) => {
                  const active = leadForm.labels.includes(lbl.name);
                  return (
                    <TouchableOpacity
                      key={lbl.id}
                      style={[
                        styles.labelSelectChip,
                        active && { backgroundColor: lbl.bg, borderColor: lbl.color },
                      ]}
                      onPress={() =>
                        setLeadForm((p) => ({
                          ...p,
                          labels: active
                            ? p.labels.filter((x) => x !== lbl.name)
                            : [...p.labels, lbl.name],
                        }))
                      }
                    >
                      <View style={[styles.labelDot, { backgroundColor: lbl.color }]} />
                      <Text
                        style={[
                          styles.labelChipText,
                          { color: active ? lbl.color : '#374151', fontSize: 12.5 },
                        ]}
                      >
                        {lbl.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <TouchableOpacity
              style={styles.customToggleRow}
              onPress={() => setCustomExpanded(!customExpanded)}
            >
              <Text style={styles.sectionLabel}>Custom Fields</Text>
              <Ionicons name={customExpanded ? 'chevron-up' : 'chevron-down'} size={18} color="#6B7280" />
            </TouchableOpacity>

            {customExpanded && (
              <View style={styles.formCard}>
                {customFieldDefs.map((cf) => (
                  <View key={cf.id}>
                    <Text style={styles.inputLabel}>{cf.name}</Text>
                    <TextInput
                      value={leadForm.customFields[cf.name] || ''}
                      onChangeText={(val) =>
                        setLeadForm((p) => ({
                          ...p,
                          customFields: { ...p.customFields, [cf.name]: val },
                        }))
                      }
                      placeholder={`Enter ${cf.name.toLowerCase()}`}
                      placeholderTextColor="#9CA3AF"
                      style={styles.textInput}
                    />
                  </View>
                ))}

                {showNewFieldBox ? (
                  <View style={styles.inlineBox}>
                    <TextInput
                      value={newFieldName}
                      onChangeText={setNewFieldName}
                      placeholder="Custom field name"
                      placeholderTextColor="#9CA3AF"
                      style={[styles.textInput, { marginBottom: 8 }]}
                    />
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TouchableOpacity
                        style={styles.inlineCancelBtn}
                        onPress={() => setShowNewFieldBox(false)}
                      >
                        <Text style={styles.inlineCancelText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.inlineSaveBtn} onPress={handleCreateCustomField}>
                        <Text style={styles.inlineSaveText}>Add Field</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.createFieldBtn}
                    onPress={() => setShowNewFieldBox(true)}
                  >
                    <Ionicons name="add-circle-outline" size={16} color="#059669" />
                    <Text style={styles.createFieldBtnText}>Create your first custom field</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  headerSub: {
    fontSize: 12,
    color: '#6B7280',
  },
  actionBar: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  configureBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  configureBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1F2937',
  },
  addLeadBtn: {
    flex: 1.35,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#059669',
  },
  addLeadBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  kpiWrapper: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 12,
  },
  kpiRow: {
    paddingHorizontal: 16,
    gap: 10,
  },
  kpiCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minWidth: 112,
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  kpiVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginTop: 2,
  },
  searchRow: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#111827',
  },
  tabsWrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 10,
  },
  tabsRow: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
  },
  tabPillActive: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#059669',
  },
  stageDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  tabTextActive: {
    color: '#059669',
    fontWeight: '700',
  },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  subHeaderCount: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#6B7280',
  },
  goLabelsLink: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#059669',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 28,
  },
  leadCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  leadTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  leadMain: {
    flex: 1,
  },
  leadTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  leadName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    maxWidth: '65%',
  },
  stagePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  stagePillText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  leadPhone: {
    fontSize: 12.5,
    color: '#6B7280',
    marginTop: 2,
  },
  metaFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  dealChip: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  dealChipText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#059669',
  },
  ownerText: {
    fontSize: 11.5,
    color: '#6B7280',
    flex: 1,
  },
  labelsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  labelChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  labelDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  labelChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  moreBtn: {
    padding: 4,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 56,
  },
  emptyTitle: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#374151',
    marginTop: 10,
  },
  emptySub: {
    fontSize: 12.5,
    color: '#9CA3AF',
    marginTop: 4,
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
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginBottom: 6,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  actionText: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#1F2937',
  },
  stageDotLg: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  modalScreen: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  modalTopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },
  editTopLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#059669',
  },
  saveTopPill: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#059669',
  },
  saveTopPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  detailScroll: {
    padding: 18,
    paddingBottom: 36,
  },
  detailProfileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 18,
  },
  avatarLg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarLgText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  detailName: {
    fontSize: 19,
    fontWeight: '800',
    color: '#111827',
  },
  detailSub: {
    fontSize: 12.5,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  detailValueBox: {
    marginTop: 14,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  detailValueLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#047857',
  },
  detailValueNum: {
    fontSize: 18,
    fontWeight: '800',
    color: '#059669',
  },
  detailQuickBtns: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
    width: '100%',
  },
  detailQuickBtnGreen: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#059669',
  },
  detailQuickBtnGreenText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  detailQuickBtnOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#059669',
    backgroundColor: '#FFFFFF',
  },
  detailQuickBtnOutlineText: {
    color: '#059669',
    fontWeight: '700',
    fontSize: 13,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  stageChipBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  stageChipText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#4B5563',
  },
  noteInputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  noteInput: {
    fontSize: 13.5,
    color: '#111827',
    minHeight: 44,
  },
  addNoteBtn: {
    alignSelf: 'flex-end',
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#059669',
  },
  addNoteBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  noteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
  },
  noteTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  noteAuthor: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  noteTime: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  noteText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
  },
  labelChipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 4,
  },
  labelSelectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  addStageRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  addStageBtn: {
    paddingHorizontal: 16,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addStageBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  formScroll: {
    padding: 18,
    paddingBottom: 40,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginTop: 8,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    fontSize: 13.5,
    color: '#111827',
  },
  phoneInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    height: 42,
    overflow: 'hidden',
  },
  countryPrefix: {
    paddingHorizontal: 12,
    height: '100%',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  countryPrefixText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },
  phoneTextInput: {
    flex: 1,
    paddingHorizontal: 12,
    fontSize: 13.5,
    color: '#111827',
  },
  customToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  createFieldBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#059669',
    backgroundColor: '#ECFDF5',
  },
  createFieldBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#059669',
  },
  inlineBox: {
    marginTop: 12,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
  },
  inlineCancelBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  inlineCancelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  inlineSaveBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#059669',
    alignItems: 'center',
  },
  inlineSaveText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

