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
  Switch,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

const STATUS_META = {
  active: { label: 'Active', color: '#059669', bg: '#ECFDF5', border: '#A7F3D0' },
  inactive: { label: 'Inactive', color: '#6B7280', bg: '#F3F4F6', border: '#E5E7EB' },
  blocked: { label: 'Blocked', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
};

const LABEL_PALETTE = [
  { id: 'lbl_1', name: 'Hot Lead', color: '#EA580C', bg: '#FFF7ED' },
  { id: 'lbl_2', name: 'VIP', color: '#7C3AED', bg: '#F5F3FF' },
  { id: 'lbl_3', name: 'Verified', color: '#059669', bg: '#ECFDF5' },
  { id: 'lbl_4', name: 'Follow Up', color: '#2563EB', bg: '#EFF6FF' },
  { id: 'lbl_5', name: 'Enterprise', color: '#0F766E', bg: '#F0FDFA' },
  { id: 'lbl_6', name: 'New Inquiry', color: '#D97706', bg: '#FFFBEB' },
];

const INITIAL_CONTACTS = [
  {
    id: 'cnt_1',
    name: 'Anil Verma',
    phone: '+91 9876543210',
    email: 'anil.verma@techcorp.in',
    status: 'active',
    labels: ['Hot Lead', 'Verified'],
    initials: 'AV',
    color: '#F59E0B',
    createdAt: '2026-11-10',
    customFields: { Company: 'TechCorp India', City: 'New Delhi' },
  },
  {
    id: 'cnt_2',
    name: 'Priya Verma',
    phone: '+91 9812345678',
    email: 'priya.v@gmail.com',
    status: 'active',
    labels: ['VIP'],
    initials: 'PV',
    color: '#FB923C',
    createdAt: '2026-11-09',
    customFields: { Company: 'Verma Exports', City: 'Mumbai' },
  },
  {
    id: 'cnt_3',
    name: 'Sumit Yadav',
    phone: '+91 9765432109',
    email: 'sumit.yadav@outlook.com',
    status: 'active',
    labels: ['Follow Up'],
    initials: 'SY',
    color: '#F97316',
    createdAt: '2026-11-08',
    customFields: { City: 'Jaipur' },
  },
  {
    id: 'cnt_4',
    name: 'Kavita Nair',
    phone: '+91 9988776655',
    email: 'kavita.nair@cloudhub.io',
    status: 'inactive',
    labels: ['Enterprise'],
    initials: 'KN',
    color: '#0D9488',
    createdAt: '2026-11-04',
    customFields: { Company: 'CloudHub Solutions', City: 'Bengaluru' },
  },
  {
    id: 'cnt_5',
    name: 'Rohan Malhotra',
    phone: '+91 9123456789',
    email: 'rohan.m@retailmart.in',
    status: 'blocked',
    labels: ['New Inquiry'],
    initials: 'RM',
    color: '#6366F1',
    createdAt: '2026-10-28',
    customFields: { City: 'Chandigarh' },
  },
];

const SAMPLE_IMPORT_ROWS = [
  {
    id: 'imp_1',
    name: 'Amit Sharma',
    phone: '+91 9820112233',
    email: 'amit.sharma@gmail.com',
    labels: ['Hot Lead'],
    status: 'valid',
    issue: '',
    selected: true,
    initials: 'AS',
    color: '#F59E0B',
  },
  {
    id: 'imp_2',
    name: 'Meera Joshi',
    phone: '+91 9890445566',
    email: 'meera.joshi@workmail.in',
    labels: ['VIP'],
    status: 'valid',
    issue: '',
    selected: true,
    initials: 'MJ',
    color: '#10B981',
  },
  {
    id: 'imp_3',
    name: 'Deepak Patel',
    phone: '+91 9711223344',
    email: 'deepak.p@enterprise.co',
    labels: ['Enterprise'],
    status: 'valid',
    issue: '',
    selected: true,
    initials: 'DP',
    color: '#3B82F6',
  },
  {
    id: 'imp_4',
    name: 'Anil Verma',
    phone: '+91 9876543210',
    email: 'anil.verma@techcorp.in',
    labels: ['Verified'],
    status: 'duplicate',
    issue: 'Duplicate number already exists — skipped',
    selected: false,
    initials: 'AV',
    color: '#9CA3AF',
  },
];

const AVATAR_COLORS = ['#F59E0B', '#FB923C', '#10B981', '#0D9488', '#3B82F6', '#6366F1', '#EC4899'];

const getInitials = (name = '') => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'CT';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function ContactsScreen({ navigation }) {
  const [contacts, setContacts] = useState(INITIAL_CONTACTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatusTab, setActiveStatusTab] = useState('all'); // 'all' | 'active' | 'inactive' | 'blocked'

  // Custom field definitions
  const [customFieldDefs, setCustomFieldDefs] = useState([
    { id: 'cf_1', name: 'Company', type: 'Text' },
    { id: 'cf_2', name: 'City', type: 'Text' },
  ]);

  // Add / Edit Contact Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingContactId, setEditingContactId] = useState(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    phone: '',
    email: '',
    status: 'active',
    labels: [],
    customFields: {},
  });
  const [customFieldsExpanded, setCustomFieldsExpanded] = useState(true);
  const [showNewFieldForm, setShowNewFieldForm] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');

  // Import Contacts Modal State (step 1 = upload, step 2 = preview)
  const [showImportModal, setShowImportModal] = useState(false);
  const [importStep, setImportStep] = useState(1);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [importRows, setImportRows] = useState([]);

  // Filter Contacts Modal State
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    labels: [],
    phoneQuery: '',
    emailQuery: '',
    createdAfter: 'all', // 'all' | 'today' | '7d' | '30d'
  });
  const [draftFilters, setDraftFilters] = useState(filters);

  // Contact Action Bottom Sheet
  const [actionContact, setActionContact] = useState(null);
  const [showActionSheet, setShowActionSheet] = useState(false);

  const statusCounts = useMemo(() => {
    const counts = { all: contacts.length, active: 0, inactive: 0, blocked: 0 };
    contacts.forEach((c) => {
      if (counts[c.status] !== undefined) counts[c.status] += 1;
    });
    return counts;
  }, [contacts]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.status !== 'all') count += 1;
    if (filters.labels.length > 0) count += 1;
    if (filters.phoneQuery.trim()) count += 1;
    if (filters.emailQuery.trim()) count += 1;
    if (filters.createdAfter !== 'all') count += 1;
    return count;
  }, [filters]);

  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      const tabStatus = activeStatusTab !== 'all' ? activeStatusTab : filters.status;
      if (tabStatus !== 'all' && c.status !== tabStatus) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const match =
          c.name.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          (c.email || '').toLowerCase().includes(q) ||
          (c.labels || []).some((l) => l.toLowerCase().includes(q));
        if (!match) return false;
      }

      if (filters.labels.length > 0) {
        const hasLabel = filters.labels.some((lbl) => (c.labels || []).includes(lbl));
        if (!hasLabel) return false;
      }

      if (filters.phoneQuery.trim() && !c.phone.toLowerCase().includes(filters.phoneQuery.trim().toLowerCase())) {
        return false;
      }

      if (
        filters.emailQuery.trim() &&
        !(c.email || '').toLowerCase().includes(filters.emailQuery.trim().toLowerCase())
      ) {
        return false;
      }

      if (filters.createdAfter !== 'all' && c.createdAt) {
        const createdTs = new Date(c.createdAt).getTime();
        const now = Date.now();
        const dayMs = 24 * 60 * 60 * 1000;
        if (filters.createdAfter === 'today' && now - createdTs > dayMs) return false;
        if (filters.createdAfter === '7d' && now - createdTs > 7 * dayMs) return false;
        if (filters.createdAfter === '30d' && now - createdTs > 30 * dayMs) return false;
      }

      return true;
    });
  }, [contacts, activeStatusTab, searchQuery, filters]);

  const openAddContactModal = () => {
    setEditingContactId(null);
    setContactForm({
      name: '',
      phone: '',
      email: '',
      status: 'active',
      labels: [],
      customFields: {},
    });
    setShowNewFieldForm(false);
    setNewFieldName('');
    setShowAddModal(true);
  };

  const openEditContactModal = (contact) => {
    setEditingContactId(contact.id);
    setContactForm({
      name: contact.name || '',
      phone: String(contact.phone || '').replace(/^\+91\s*/, ''),
      email: contact.email || '',
      status: contact.status || 'active',
      labels: [...(contact.labels || [])],
      customFields: { ...(contact.customFields || {}) },
    });
    setShowNewFieldForm(false);
    setNewFieldName('');
    setShowAddModal(true);
  };

  const handleToggleFormLabel = (labelName) => {
    setContactForm((prev) => ({
      ...prev,
      labels: prev.labels.includes(labelName)
        ? prev.labels.filter((item) => item !== labelName)
        : [...prev.labels, labelName],
    }));
  };

  const handleCreateCustomField = () => {
    const clean = newFieldName.trim();
    if (!clean) {
      Alert.alert('Field Name Required', 'Please enter a name for the custom field.');
      return;
    }
    if (customFieldDefs.some((f) => f.name.toLowerCase() === clean.toLowerCase())) {
      Alert.alert('Duplicate Field', 'This custom field already exists.');
      return;
    }
    setCustomFieldDefs((prev) => [...prev, { id: `cf_${Date.now()}`, name: clean, type: 'Text' }]);
    setNewFieldName('');
    setShowNewFieldForm(false);
  };

  const handleSaveContact = () => {
    const cleanName = contactForm.name.trim();
    const rawPhone = contactForm.phone.trim();
    if (!cleanName) {
      Alert.alert('Validation Error', 'Please enter contact name.');
      return;
    }
    if (!rawPhone || rawPhone.replace(/\D/g, '').length < 10) {
      Alert.alert('Validation Error', 'Please enter a valid 10-digit WhatsApp number.');
      return;
    }

    const formattedPhone = rawPhone.startsWith('+') ? rawPhone : `+91 ${rawPhone.replace(/\D/g, '').slice(-10)}`;

    if (editingContactId) {
      setContacts((prev) =>
        prev.map((c) =>
          c.id === editingContactId
            ? {
                ...c,
                name: cleanName,
                phone: formattedPhone,
                email: contactForm.email.trim(),
                status: contactForm.status,
                labels: contactForm.labels,
                initials: getInitials(cleanName),
                customFields: contactForm.customFields,
              }
            : c
        )
      );
    } else {
      const color = AVATAR_COLORS[contacts.length % AVATAR_COLORS.length];
      const newContact = {
        id: `cnt_${Date.now()}`,
        name: cleanName,
        phone: formattedPhone,
        email: contactForm.email.trim(),
        status: contactForm.status,
        labels: contactForm.labels,
        initials: getInitials(cleanName),
        color,
        createdAt: new Date().toISOString().split('T')[0],
        customFields: contactForm.customFields,
      };
      setContacts((prev) => [newContact, ...prev]);
    }
    setShowAddModal(false);
  };

  const openImportFlow = () => {
    setImportStep(1);
    setSelectedFileName('');
    setImportRows([]);
    setShowImportModal(true);
  };

  const handleSelectImportFile = (fileName) => {
    setSelectedFileName(fileName);
    setImportRows(SAMPLE_IMPORT_ROWS.map((r) => ({ ...r })));
    setImportStep(2);
  };

  const handleToggleImportRow = (rowId) => {
    setImportRows((prev) =>
      prev.map((r) => (r.id === rowId && r.status === 'valid' ? { ...r, selected: !r.selected } : r))
    );
  };

  const selectedImportCount = useMemo(
    () => importRows.filter((r) => r.status === 'valid' && r.selected).length,
    [importRows]
  );

  const handleConfirmImport = () => {
    const toImport = importRows.filter((r) => r.status === 'valid' && r.selected);
    if (toImport.length === 0) {
      Alert.alert('No Contacts Selected', 'Select at least one valid contact to import.');
      return;
    }
    const existingPhones = new Set(contacts.map((c) => c.phone.replace(/\D/g, '').slice(-10)));
    const freshRecords = toImport
      .filter((r) => !existingPhones.has(r.phone.replace(/\D/g, '').slice(-10)))
      .map((r, index) => ({
        id: `cnt_imp_${Date.now()}_${index}`,
        name: r.name,
        phone: r.phone,
        email: r.email,
        status: 'active',
        labels: r.labels,
        initials: r.initials,
        color: r.color,
        createdAt: new Date().toISOString().split('T')[0],
        customFields: {},
      }));

    if (freshRecords.length > 0) {
      setContacts((prev) => [...freshRecords, ...prev]);
    }
    setShowImportModal(false);
    Alert.alert('Import Complete', `${freshRecords.length} contact(s) imported into Contacts CRM.`);
  };

  const openFilterSheet = () => {
    setDraftFilters({ ...filters, labels: [...filters.labels] });
    setShowFilterModal(true);
  };

  const handleResetFilters = () => {
    const empty = { status: 'all', labels: [], phoneQuery: '', emailQuery: '', createdAfter: 'all' };
    setDraftFilters(empty);
    setFilters(empty);
    setShowFilterModal(false);
  };

  const handleApplyFilters = () => {
    setFilters(draftFilters);
    if (draftFilters.status !== 'all') {
      setActiveStatusTab(draftFilters.status);
    }
    setShowFilterModal(false);
  };

  const handleDeleteContact = (contact) => {
    Alert.alert('Delete Contact', `Remove ${contact.name} from Contacts CRM?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setContacts((prev) => prev.filter((item) => item.id !== contact.id));
          setShowActionSheet(false);
        },
      },
    ]);
  };

  const handleToggleBlockStatus = (contact) => {
    const nextStatus = contact.status === 'blocked' ? 'active' : 'blocked';
    setContacts((prev) => prev.map((c) => (c.id === contact.id ? { ...c, status: nextStatus } : c)));
    setShowActionSheet(false);
  };

  const renderLabelBadge = (labelName) => {
    const meta = LABEL_PALETTE.find((l) => l.name === labelName) || {
      color: '#059669',
      bg: '#ECFDF5',
    };
    return (
      <View key={labelName} style={[styles.labelChip, { backgroundColor: meta.bg }]}>
        <View style={[styles.labelDot, { backgroundColor: meta.color }]} />
        <Text style={[styles.labelChipText, { color: meta.color }]}>{labelName}</Text>
      </View>
    );
  };

  const renderContactCard = ({ item }) => {
    const statusBadge = STATUS_META[item.status] || STATUS_META.active;
    return (
      <TouchableOpacity
        style={styles.contactCard}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('ContactCRM', { contact: item })}
      >
        <View style={styles.contactTopRow}>
          <View style={[styles.avatar, { backgroundColor: item.color }]}>
            <Text style={styles.avatarText}>{item.initials}</Text>
          </View>

          <View style={styles.contactMain}>
            <View style={styles.nameBadgeRow}>
              <Text style={styles.contactName} numberOfLines={1}>
                {item.name}
              </Text>
              <View
                style={[
                  styles.statusPill,
                  { backgroundColor: statusBadge.bg, borderColor: statusBadge.border },
                ]}
              >
                <Text style={[styles.statusPillText, { color: statusBadge.color }]}>
                  {statusBadge.label}
                </Text>
              </View>
            </View>

            <Text style={styles.contactPhone}>{item.phone}</Text>

            {item.labels && item.labels.length > 0 && (
              <View style={styles.labelsRow}>{item.labels.map(renderLabelBadge)}</View>
            )}
          </View>

          <TouchableOpacity
            style={styles.moreIconBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={() => {
              setActionContact(item);
              setShowActionSheet(true);
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
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Contacts</Text>
          <Text style={styles.headerSubtitle}>Manage people, labels, and custom fields</Text>
        </View>
      </View>

      {/* Action Buttons Row: Import + Add Contact */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.importBtn} activeOpacity={0.8} onPress={openImportFlow}>
          <Ionicons name="cloud-upload-outline" size={17} color="#1F2937" />
          <Text style={styles.importBtnText}>Import</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.addBtn} activeOpacity={0.85} onPress={openAddContactModal}>
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Add Contact</Text>
        </TouchableOpacity>
      </View>

      {/* Search + Filter Row */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#9CA3AF" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search contacts..."
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={17} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.filterBtn, activeFilterCount > 0 && styles.filterBtnActive]}
          onPress={openFilterSheet}
          activeOpacity={0.8}
        >
          <Ionicons
            name="options-outline"
            size={19}
            color={activeFilterCount > 0 ? '#059669' : '#374151'}
          />
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Status Filter Tabs */}
      <View style={styles.tabsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
          {[
            { key: 'all', label: 'All Contacts', count: statusCounts.all },
            { key: 'active', label: 'Active', count: statusCounts.active },
            { key: 'inactive', label: 'Inactive', count: statusCounts.inactive },
            { key: 'blocked', label: 'Blocked', count: statusCounts.blocked },
          ].map((tab) => {
            const isSelected = activeStatusTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tabPill, isSelected && styles.tabPillActive]}
                onPress={() => setActiveStatusTab(tab.key)}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, isSelected && styles.tabTextActive]}>
                  {tab.label}
                </Text>
                <View style={[styles.tabCountBadge, isSelected && styles.tabCountBadgeActive]}>
                  <Text style={[styles.tabCountText, isSelected && styles.tabCountTextActive]}>
                    {tab.count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* List Subheader: Count + Go to Label */}
      <View style={styles.subHeader}>
        <Text style={styles.countText}>
          {filteredContacts.length} {filteredContacts.length === 1 ? 'Contact' : 'Contacts'}
        </Text>
        <TouchableOpacity
          style={styles.goToLabelBtn}
          onPress={() => navigation.navigate('Labels')}
          activeOpacity={0.8}
        >
          <Ionicons name="pricetag-outline" size={14} color="#059669" />
          <Text style={styles.goToLabelText}>Go to Label</Text>
          <Ionicons name="chevron-forward" size={14} color="#059669" />
        </TouchableOpacity>
      </View>

      {/* Contact List */}
      <FlatList
        data={filteredContacts}
        keyExtractor={(item) => item.id}
        renderItem={renderContactCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="people-outline" size={32} color="#9CA3AF" />
            </View>
            <Text style={styles.emptyTitle}>No contacts found</Text>
            <Text style={styles.emptySubtitle}>
              Try clearing your search or filters, or add a new WhatsApp contact.
            </Text>
          </View>
        }
      />

      {/* ==================== IMPORT CONTACTS MODAL (2-Step Flow) ==================== */}
      <Modal visible={showImportModal} animationType="slide" onRequestClose={() => setShowImportModal(false)}>
        <SafeAreaView style={styles.modalScreen}>
          <View style={styles.modalTopHeader}>
            <TouchableOpacity
              onPress={() => setShowImportModal(false)}
              style={styles.backIconBtn}
            >
              <Ionicons name="chevron-back" size={22} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>Import Contacts</Text>
            <View style={{ width: 34 }} />
          </View>

          {/* 3-Step Indicator */}
          <View style={styles.stepperRow}>
            {[
              { step: 1, label: 'Upload' },
              { step: 2, label: 'Preview' },
              { step: 3, label: 'Import' },
            ].map((item, idx) => {
              const active = importStep >= item.step;
              return (
                <React.Fragment key={item.step}>
                  <View style={styles.stepItem}>
                    <View style={[styles.stepCircle, active && styles.stepCircleActive]}>
                      {importStep > item.step ? (
                        <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                      ) : (
                        <Text style={[styles.stepNum, active && styles.stepNumActive]}>{item.step}</Text>
                      )}
                    </View>
                    <Text style={[styles.stepLabel, active && styles.stepLabelActive]}>{item.label}</Text>
                  </View>
                  {idx < 2 && <View style={[styles.stepLine, importStep > item.step && styles.stepLineActive]} />}
                </React.Fragment>
              );
            })}
          </View>

          {importStep === 1 ? (
            <ScrollView contentContainerStyle={styles.importBody}>
              {/* Upload Dropzone Card */}
              <View style={styles.uploadCard}>
                <View style={styles.uploadIconCircle}>
                  <Ionicons name="cloud-upload-outline" size={30} color="#059669" />
                </View>
                <Text style={styles.uploadTitle}>Upload your contact file</Text>
                <Text style={styles.uploadSub}>
                  Supports .csv, .xlsx or .xls files with Name, Phone, Email and Labels columns.
                </Text>

                <TouchableOpacity
                  style={styles.selectFileBtn}
                  activeOpacity={0.85}
                  onPress={() => handleSelectImportFile('messbee_leads_nov2026.csv')}
                >
                  <Ionicons name="document-text-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.selectFileBtnText}>Select CSV or Excel File</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.downloadSampleBtn}
                  onPress={() =>
                    Alert.alert(
                      'Sample Template Ready',
                      'Columns: Name, WhatsApp Number, Email, Labels\nExample: Amit Sharma, +919820112233, amit@gmail.com, Hot Lead'
                    )
                  }
                >
                  <Ionicons name="download-outline" size={15} color="#059669" />
                  <Text style={styles.downloadSampleText}>Download Sample Template</Text>
                </TouchableOpacity>
              </View>

              {/* Before you import Tips Card */}
              <View style={styles.tipsCard}>
                <View style={styles.tipsHeader}>
                  <Ionicons name="information-circle" size={18} color="#059669" />
                  <Text style={styles.tipsTitle}>Before you import</Text>
                </View>
                <Text style={styles.tipItem}>• Include country code with WhatsApp numbers (e.g. +91).</Text>
                <Text style={styles.tipItem}>• Duplicate phone numbers are automatically detected and skipped.</Text>
                <Text style={styles.tipItem}>• You can preview and deselect rows before confirming import.</Text>
              </View>
            </ScrollView>
          ) : (
            <View style={{ flex: 1 }}>
              <ScrollView contentContainerStyle={styles.importBody}>
                {/* File Summary Banner */}
                <View style={styles.validatedBanner}>
                  <View style={styles.validatedLeft}>
                    <Ionicons name="checkmark-circle" size={20} color="#059669" />
                    <View>
                      <Text style={styles.validatedTitle}>
                        {selectedImportCount} Validated contacts ready
                      </Text>
                      <Text style={styles.validatedSub}>{selectedFileName}</Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => setImportStep(1)}>
                    <Text style={styles.changeFileLink}>Change</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.sectionHeading}>Preview Contacts</Text>

                {importRows.map((row) => {
                  const isValid = row.status === 'valid';
                  return (
                    <TouchableOpacity
                      key={row.id}
                      style={[styles.previewCard, !isValid && styles.previewCardSkipped]}
                      activeOpacity={isValid ? 0.8 : 1}
                      onPress={() => handleToggleImportRow(row.id)}
                    >
                      <View style={[styles.avatarSm, { backgroundColor: row.color }]}>
                        <Text style={styles.avatarSmText}>{row.initials}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={styles.previewNameRow}>
                          <Text style={styles.previewName}>{row.name}</Text>
                          <View
                            style={[
                              styles.previewBadge,
                              { backgroundColor: isValid ? '#ECFDF5' : '#FEF3C7' },
                            ]}
                          >
                            <Text
                              style={[
                                styles.previewBadgeText,
                                { color: isValid ? '#059669' : '#B45309' },
                              ]}
                            >
                              {isValid ? 'Valid' : 'Duplicate'}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.previewPhone}>{row.phone}</Text>
                        {row.issue ? (
                          <Text style={styles.previewIssue}>{row.issue}</Text>
                        ) : (
                          <Text style={styles.previewEmail}>{row.email}</Text>
                        )}
                      </View>
                      <Ionicons
                        name={
                          !isValid
                            ? 'alert-circle-outline'
                            : row.selected
                            ? 'checkbox'
                            : 'square-outline'
                        }
                        size={22}
                        color={!isValid ? '#D97706' : row.selected ? '#059669' : '#9CA3AF'}
                      />
                    </TouchableOpacity>
                  );
                })}

                <View style={styles.importWarnNote}>
                  <Ionicons name="warning-outline" size={16} color="#B45309" />
                  <Text style={styles.importWarnText}>
                    Duplicate entries will be skipped automatically during import.
                  </Text>
                </View>
              </ScrollView>

              {/* Sticky Footer */}
              <View style={styles.modalFooterBar}>
                <TouchableOpacity
                  style={styles.cancelOutlineBtn}
                  onPress={() => setShowImportModal(false)}
                >
                  <Text style={styles.cancelOutlineText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.confirmGreenBtn} onPress={handleConfirmImport}>
                  <Text style={styles.confirmGreenText}>
                    Import {selectedImportCount} Contact{selectedImportCount === 1 ? '' : 's'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </SafeAreaView>
      </Modal>

      {/* ==================== ADD / EDIT CONTACT MODAL ==================== */}
      <Modal visible={showAddModal} animationType="slide" onRequestClose={() => setShowAddModal(false)}>
        <SafeAreaView style={styles.modalScreen}>
          <View style={styles.modalTopHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)} style={styles.backIconBtn}>
              <Ionicons name="chevron-back" size={22} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>
              {editingContactId ? 'Edit Contact' : 'Add Contact'}
            </Text>
            <TouchableOpacity style={styles.headerSavePill} onPress={handleSaveContact}>
              <Text style={styles.headerSavePillText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.formScrollBody} showsVerticalScrollIndicator={false}>
            {/* Basic Information */}
            <Text style={styles.formSectionTitle}>Basic Information</Text>
            <View style={styles.formCard}>
              <Text style={styles.inputLabel}>
                Name <Text style={{ color: '#EF4444' }}>*</Text>
              </Text>
              <TextInput
                value={contactForm.name}
                onChangeText={(val) => setContactForm((p) => ({ ...p, name: val }))}
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
                  value={contactForm.phone}
                  onChangeText={(val) => setContactForm((p) => ({ ...p, phone: val }))}
                  placeholder="Enter 10-digit WhatsApp number"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                  style={styles.phoneTextInput}
                />
              </View>

              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                value={contactForm.email}
                onChangeText={(val) => setContactForm((p) => ({ ...p, email: val }))}
                placeholder="Enter email address"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.textInput}
              />

              <Text style={styles.inputLabel}>Contact Status</Text>
              <View style={styles.statusChoiceRow}>
                {['active', 'inactive', 'blocked'].map((st) => {
                  const selected = contactForm.status === st;
                  const meta = STATUS_META[st];
                  return (
                    <TouchableOpacity
                      key={st}
                      style={[
                        styles.statusChoiceChip,
                        selected && { backgroundColor: meta.bg, borderColor: meta.color },
                      ]}
                      onPress={() => setContactForm((p) => ({ ...p, status: st }))}
                    >
                      <Text
                        style={[
                          styles.statusChoiceText,
                          selected && { color: meta.color, fontWeight: '700' },
                        ]}
                      >
                        {meta.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Labels Section */}
            <View style={styles.formSectionHeaderRow}>
              <Text style={styles.formSectionTitle}>Labels</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowAddModal(false);
                  navigation.navigate('Labels');
                }}
              >
                <Text style={styles.manageLabelsLink}>Manage Labels</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.formCard}>
              <Text style={styles.helperText}>Select labels to organize this contact:</Text>
              <View style={styles.labelSelectGrid}>
                {LABEL_PALETTE.map((lbl) => {
                  const active = contactForm.labels.includes(lbl.name);
                  return (
                    <TouchableOpacity
                      key={lbl.id}
                      style={[
                        styles.labelSelectChip,
                        active && { backgroundColor: lbl.bg, borderColor: lbl.color },
                      ]}
                      onPress={() => handleToggleFormLabel(lbl.name)}
                    >
                      <View style={[styles.labelDot, { backgroundColor: lbl.color }]} />
                      <Text
                        style={[
                          styles.labelSelectText,
                          active && { color: lbl.color, fontWeight: '700' },
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

            {/* Custom Fields Section */}
            <TouchableOpacity
              style={styles.formSectionHeaderRow}
              onPress={() => setCustomFieldsExpanded(!customFieldsExpanded)}
            >
              <Text style={styles.formSectionTitle}>Custom Fields</Text>
              <Ionicons
                name={customFieldsExpanded ? 'chevron-up' : 'chevron-down'}
                size={18}
                color="#6B7280"
              />
            </TouchableOpacity>

            {customFieldsExpanded && (
              <View style={styles.formCard}>
                {customFieldDefs.length === 0 ? (
                  <Text style={styles.noFieldsText}>No custom fields yet</Text>
                ) : (
                  customFieldDefs.map((cf) => (
                    <View key={cf.id}>
                      <Text style={styles.inputLabel}>{cf.name}</Text>
                      <TextInput
                        value={contactForm.customFields[cf.name] || ''}
                        onChangeText={(val) =>
                          setContactForm((p) => ({
                            ...p,
                            customFields: { ...p.customFields, [cf.name]: val },
                          }))
                        }
                        placeholder={`Enter ${cf.name.toLowerCase()}`}
                        placeholderTextColor="#9CA3AF"
                        style={styles.textInput}
                      />
                    </View>
                  ))
                )}

                {showNewFieldForm ? (
                  <View style={styles.inlineNewFieldBox}>
                    <TextInput
                      value={newFieldName}
                      onChangeText={setNewFieldName}
                      placeholder="New custom field name (e.g. Budget)"
                      placeholderTextColor="#9CA3AF"
                      style={[styles.textInput, { marginBottom: 10 }]}
                    />
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TouchableOpacity
                        style={styles.inlineCancelBtn}
                        onPress={() => setShowNewFieldForm(false)}
                      >
                        <Text style={styles.inlineCancelText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.inlineAddBtn} onPress={handleCreateCustomField}>
                        <Text style={styles.inlineAddText}>Add Field</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.createFieldBtn}
                    onPress={() => setShowNewFieldForm(true)}
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

      {/* ==================== FILTER CONTACTS MODAL ==================== */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.sheetBackdrop}>
          <View style={styles.filterSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Filter Contacts</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Ionicons name="close" size={22} color="#374151" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
              <Text style={styles.inputLabel}>Status</Text>
              <View style={styles.filterChipRow}>
                {[
                  { key: 'all', label: 'All Statuses' },
                  { key: 'active', label: 'Active' },
                  { key: 'inactive', label: 'Inactive' },
                  { key: 'blocked', label: 'Blocked' },
                ].map((opt) => {
                  const selected = draftFilters.status === opt.key;
                  return (
                    <TouchableOpacity
                      key={opt.key}
                      style={[styles.filterChoicePill, selected && styles.filterChoicePillActive]}
                      onPress={() => setDraftFilters((p) => ({ ...p, status: opt.key }))}
                    >
                      <Text
                        style={[
                          styles.filterChoiceText,
                          selected && styles.filterChoiceTextActive,
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.inputLabel}>Labels</Text>
              <View style={styles.filterChipRow}>
                {LABEL_PALETTE.map((lbl) => {
                  const selected = draftFilters.labels.includes(lbl.name);
                  return (
                    <TouchableOpacity
                      key={lbl.id}
                      style={[styles.filterChoicePill, selected && styles.filterChoicePillActive]}
                      onPress={() =>
                        setDraftFilters((p) => ({
                          ...p,
                          labels: selected
                            ? p.labels.filter((x) => x !== lbl.name)
                            : [...p.labels, lbl.name],
                        }))
                      }
                    >
                      <Text
                        style={[
                          styles.filterChoiceText,
                          selected && styles.filterChoiceTextActive,
                        ]}
                      >
                        {lbl.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.inputLabel}>WhatsApp Number</Text>
              <TextInput
                value={draftFilters.phoneQuery}
                onChangeText={(val) => setDraftFilters((p) => ({ ...p, phoneQuery: val }))}
                placeholder="Search number..."
                placeholderTextColor="#9CA3AF"
                style={styles.textInput}
              />

              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                value={draftFilters.emailQuery}
                onChangeText={(val) => setDraftFilters((p) => ({ ...p, emailQuery: val }))}
                placeholder="Search email..."
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                style={styles.textInput}
              />

              <Text style={styles.inputLabel}>Created After</Text>
              <View style={styles.filterChipRow}>
                {[
                  { key: 'all', label: 'Any Time' },
                  { key: 'today', label: 'Today' },
                  { key: '7d', label: 'Last 7 Days' },
                  { key: '30d', label: 'Last 30 Days' },
                ].map((opt) => {
                  const selected = draftFilters.createdAfter === opt.key;
                  return (
                    <TouchableOpacity
                      key={opt.key}
                      style={[styles.filterChoicePill, selected && styles.filterChoicePillActive]}
                      onPress={() => setDraftFilters((p) => ({ ...p, createdAfter: opt.key }))}
                    >
                      <Text
                        style={[
                          styles.filterChoiceText,
                          selected && styles.filterChoiceTextActive,
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <View style={styles.sheetFooter}>
              <TouchableOpacity style={styles.cancelOutlineBtn} onPress={handleResetFilters}>
                <Text style={styles.cancelOutlineText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmGreenBtn} onPress={handleApplyFilters}>
                <Text style={styles.confirmGreenText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ==================== CONTACT QUICK ACTIONS BOTTOM SHEET ==================== */}
      <Modal
        visible={showActionSheet && !!actionContact}
        transparent
        animationType="fade"
        onRequestClose={() => setShowActionSheet(false)}
      >
        <TouchableOpacity
          style={styles.sheetBackdrop}
          activeOpacity={1}
          onPress={() => setShowActionSheet(false)}
        >
          <View style={styles.actionSheetBox}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{actionContact?.name}</Text>
              <TouchableOpacity onPress={() => setShowActionSheet(false)}>
                <Ionicons name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => {
                setShowActionSheet(false);
                navigation.navigate('ContactCRM', { contact: actionContact });
              }}
            >
              <Ionicons name="person-circle-outline" size={20} color="#374151" />
              <Text style={styles.actionRowText}>View Contact CRM</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => {
                setShowActionSheet(false);
                openEditContactModal(actionContact);
              }}
            >
              <Ionicons name="create-outline" size={20} color="#374151" />
              <Text style={styles.actionRowText}>Edit Contact</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => {
                setShowActionSheet(false);
                navigation.navigate('ChatDetail', { contact: actionContact });
              }}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={20} color="#059669" />
              <Text style={styles.actionRowText}>Open WhatsApp Chat</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => handleToggleBlockStatus(actionContact)}
            >
              <Ionicons name="ban-outline" size={20} color="#D97706" />
              <Text style={styles.actionRowText}>
                {actionContact?.status === 'blocked' ? 'Unblock Contact' : 'Block Contact'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionRow, { borderBottomWidth: 0 }]}
              onPress={() => handleDeleteContact(actionContact)}
            >
              <Ionicons name="trash-outline" size={20} color="#DC2626" />
              <Text style={[styles.actionRowText, { color: '#DC2626' }]}>Delete Contact</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
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
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  headerTextWrap: {
    flexDirection: 'column',
  },
  headerTitle: {
    fontSize: 23,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  actionBar: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 18,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  importBtn: {
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
  importBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1F2937',
  },
  addBtn: {
    flex: 1.35,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#059669',
  },
  addBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 18,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#111827',
  },
  filterBtn: {
    width: 42,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBtnActive: {
    borderColor: '#059669',
    backgroundColor: '#ECFDF5',
  },
  filterBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  tabsWrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 10,
  },
  tabsRow: {
    paddingHorizontal: 18,
    gap: 8,
  },
  tabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  tabPillActive: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#059669',
  },
  tabText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#4B5563',
  },
  tabTextActive: {
    color: '#059669',
    fontWeight: '700',
  },
  tabCountBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
  },
  tabCountBadgeActive: {
    backgroundColor: '#059669',
  },
  tabCountText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#4B5563',
  },
  tabCountTextActive: {
    color: '#FFFFFF',
  },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  countText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#6B7280',
  },
  goToLabelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#ECFDF5',
  },
  goToLabelText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  listContent: {
    paddingHorizontal: 18,
    paddingBottom: 28,
  },
  contactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  contactTopRow: {
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
    fontWeight: '800',
    fontSize: 15,
  },
  contactMain: {
    flex: 1,
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  contactName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    maxWidth: '68%',
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusPillText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  contactPhone: {
    fontSize: 12.5,
    color: '#6B7280',
    marginTop: 3,
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
  moreIconBtn: {
    padding: 4,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 56,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
  },
  emptySubtitle: {
    fontSize: 12.5,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
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
  backIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalHeaderTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },
  headerSavePill: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#059669',
  },
  headerSavePillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  stepItem: {
    alignItems: 'center',
    gap: 4,
  },
  stepCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: '#059669',
  },
  stepNum: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },
  stepNumActive: {
    color: '#FFFFFF',
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  stepLabelActive: {
    color: '#059669',
    fontWeight: '700',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 10,
    marginBottom: 16,
  },
  stepLineActive: {
    backgroundColor: '#059669',
  },
  importBody: {
    padding: 18,
    gap: 14,
  },
  uploadCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#A7F3D0',
  },
  uploadIconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  uploadSub: {
    fontSize: 12.5,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  selectFileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 18,
    width: '100%',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#059669',
  },
  selectFileBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  downloadSampleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
  },
  downloadSampleText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#059669',
  },
  tipsCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    gap: 6,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  tipsTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#065F46',
  },
  tipItem: {
    fontSize: 12,
    color: '#047857',
    lineHeight: 18,
  },
  validatedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  validatedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  validatedTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#065F46',
  },
  validatedSub: {
    fontSize: 11.5,
    color: '#047857',
    marginTop: 1,
  },
  changeFileLink: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#059669',
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
    marginTop: 4,
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  previewCardSkipped: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  avatarSm: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSmText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  previewNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  previewName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  previewBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  previewBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  previewPhone: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  previewEmail: {
    fontSize: 11.5,
    color: '#9CA3AF',
    marginTop: 1,
  },
  previewIssue: {
    fontSize: 11,
    color: '#B45309',
    marginTop: 2,
    fontWeight: '600',
  },
  importWarnNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFBEB',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  importWarnText: {
    flex: 1,
    fontSize: 12,
    color: '#92400E',
  },
  modalFooterBar: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  cancelOutlineBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  cancelOutlineText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#374151',
  },
  confirmGreenBtn: {
    flex: 1.5,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#059669',
    alignItems: 'center',
  },
  confirmGreenText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  formScrollBody: {
    padding: 18,
    paddingBottom: 40,
  },
  formSectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 8,
  },
  formSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  manageLabelsLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
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
    marginBottom: 6,
    marginTop: 8,
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
  statusChoiceRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  statusChoiceChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  statusChoiceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 10,
  },
  labelSelectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  labelSelectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  labelSelectText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  noFieldsText: {
    fontSize: 12.5,
    color: '#9CA3AF',
    textAlign: 'center',
    marginVertical: 8,
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
  inlineNewFieldBox: {
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
  inlineAddBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#059669',
    alignItems: 'center',
  },
  inlineAddText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.45)',
    justifyContent: 'flex-end',
  },
  filterSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 28 : 18,
    maxHeight: '85%',
  },
  actionSheetBox: {
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
    marginBottom: 8,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  filterChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  filterChoicePill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  filterChoicePillActive: {
    borderColor: '#059669',
    backgroundColor: '#ECFDF5',
  },
  filterChoiceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  filterChoiceTextActive: {
    color: '#059669',
    fontWeight: '700',
  },
  sheetFooter: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  actionRowText: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#1F2937',
  },
});
