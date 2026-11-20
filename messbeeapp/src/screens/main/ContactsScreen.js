import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { contactService, labelService } from '../../services/api';

const FILTER_TABS = ['All Contacts', 'Active', 'Inactive', 'Blocked'];

// Initial contacts matching Image 1 Screen 1 if DB is empty
const DEFAULT_CONTACTS = [
  {
    _id: 'c_1',
    name: 'Amit Kumar',
    phone: '+919211072422',
    email: 'amit.kumar@example.com',
    status: 'Inactive',
    statusDot: '#94A3B8',
    statusBg: '#F1F5F9',
    statusColor: '#64748B',
    tag: 'Customer',
    tagDot: '#0284C7',
    tagBg: '#E0F2FE',
    tagColor: '#0369A1',
    initials: 'AK',
    avatarBg: '#F59E0B',
  },
  {
    _id: 'c_2',
    name: 'Priya Verma',
    phone: '+919810452881',
    email: 'priya@example.com',
    status: 'Active',
    statusDot: '#10B981',
    statusBg: '#DCFCE7',
    statusColor: '#166534',
    tag: 'New lead',
    tagDot: '#0284C7',
    tagBg: '#E0F2FE',
    tagColor: '#0369A1',
    initials: 'PV',
    avatarBg: '#F59E0B',
  },
  {
    _id: 'c_3',
    name: 'Sumit yadav',
    phone: '+917697215393',
    email: 'sy@test.com',
    status: 'Active',
    statusDot: '#10B981',
    statusBg: '#DCFCE7',
    statusColor: '#166534',
    tag: 'Cold lead',
    tagDot: '#0284C7',
    tagBg: '#E0F2FE',
    tagColor: '#0369A1',
    initials: 'SY',
    avatarBg: '#F59E0B',
  },
];

export default function ContactsScreen({ navigation }) {
  const [contacts, setContacts] = useState(DEFAULT_CONTACTS);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All Contacts');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  // Modals
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importStep, setImportStep] = useState(1);
  const [selectedContactAction, setSelectedContactAction] = useState(null);

  // Filters State
  const [filterStatus, setFilterStatus] = useState('Any status');
  const [filterLabel, setFilterLabel] = useState('Any label');
  const [filterPhone, setFilterPhone] = useState('');
  const [filterEmail, setFilterEmail] = useState('');
  const [filterDate, setFilterDate] = useState('');

  // Fetch from real DB / API
  const loadContacts = useCallback(async () => {
    try {
      const data = await contactService.getContacts();
      if (Array.isArray(data) && data.length > 0) {
        const mapped = data.map((item, idx) => {
          const rawName = item.name || item.firstName || `Contact ${idx + 1}`;
          const initials = rawName
            .split(' ')
            .map((p) => p[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

          const statusRaw = (item.status || 'Active').toLowerCase();
          const isActive = statusRaw === 'active' || statusRaw === 'open';
          const isBlocked = statusRaw === 'blocked';

          let statusLabel = 'Active';
          let statusColor = '#166534';
          let statusBg = '#DCFCE7';
          let statusDot = '#10B981';

          if (isBlocked) {
            statusLabel = 'Blocked';
            statusColor = '#991B1B';
            statusBg = '#FEE2E2';
            statusDot = '#DC2626';
          } else if (!isActive) {
            statusLabel = 'Inactive';
            statusColor = '#64748B';
            statusBg = '#F1F5F9';
            statusDot = '#94A3B8';
          }

          const labelTag =
            Array.isArray(item.labels) && item.labels.length > 0
              ? typeof item.labels[0] === 'object'
                ? item.labels[0].name
                : item.labels[0]
              : 'Customer';

          return {
            _id: item._id || item.id || `c_${idx}`,
            name: rawName,
            phone: item.phone || item.phoneNumber || '+91 0000000000',
            email: item.email || '',
            status: statusLabel,
            statusDot,
            statusBg,
            statusColor,
            tag: labelTag,
            tagDot: '#0284C7',
            tagBg: '#E0F2FE',
            tagColor: '#0369A1',
            initials: initials || 'CO',
            avatarBg: '#F59E0B',
          };
        });
        setContacts(mapped);
      }
    } catch (err) {
      console.warn('loadContacts error:', err);
    }
  }, []);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadContacts();
    setRefreshing(false);
  };

  // Filtered list
  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      // Tab filter
      if (activeTab === 'Active' && c.status !== 'Active') return false;
      if (activeTab === 'Inactive' && c.status !== 'Inactive') return false;
      if (activeTab === 'Blocked' && c.status !== 'Blocked') return false;

      // Search Query
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const matchesName = c.name.toLowerCase().includes(q);
        const matchesPhone = c.phone.toLowerCase().includes(q);
        const matchesTag = c.tag.toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesTag) return false;
      }

      // Filter modal options
      if (filterStatus !== 'Any status' && c.status.toLowerCase() !== filterStatus.toLowerCase()) {
        return false;
      }
      if (filterPhone.trim() && !c.phone.includes(filterPhone.trim())) {
        return false;
      }
      if (filterEmail.trim() && !c.email.toLowerCase().includes(filterEmail.trim().toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [contacts, activeTab, searchQuery, filterStatus, filterPhone, filterEmail]);

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleDeleteContact = async (contact) => {
    Alert.alert('Delete Contact', `Are you sure you want to delete ${contact.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await contactService.deleteContact(contact._id);
          } catch (_) {}
          setContacts(contacts.filter((c) => c._id !== contact._id));
          setSelectedContactAction(null);
        },
      },
    ]);
  };

  const handleImportSuccess = () => {
    setShowImportModal(false);
    setImportStep(1);
    Alert.alert('Success', '1 contact successfully imported!');
    loadContacts();
  };

  const renderContactItem = ({ item }) => {
    const isSelected = selectedIds.includes(item._id);

    return (
      <View style={styles.contactCard}>
        {/* Checkbox if selectionMode */}
        {selectionMode && (
          <TouchableOpacity
            style={styles.selectCheckbox}
            onPress={() => toggleSelect(item._id)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkboxSquare, isSelected && styles.checkboxSquareChecked]}>
              {isSelected && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
            </View>
          </TouchableOpacity>
        )}

        {/* Squircle Avatar in warm orange */}
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitials}>{item.initials}</Text>
        </View>

        {/* Details column */}
        <View style={styles.contactDetailsCol}>
          <View style={styles.nameRow}>
            <Text style={styles.contactName}>{item.name}</Text>
            {/* Status pill with dot */}
            <View style={[styles.statusPill, { backgroundColor: item.statusBg }]}>
              <View style={[styles.statusDot, { backgroundColor: item.statusDot }]} />
              <Text style={[styles.statusPillText, { color: item.statusColor }]}>{item.status}</Text>
            </View>
          </View>

          <Text style={styles.contactPhone}>{item.phone}</Text>

          {/* Tag Pill */}
          <View style={[styles.tagPill, { backgroundColor: item.tagBg }]}>
            <View style={[styles.tagDot, { backgroundColor: item.tagDot }]} />
            <Text style={[styles.tagPillText, { color: item.tagColor }]}>{item.tag}</Text>
          </View>
        </View>

        {/* 3 dots action button */}
        <TouchableOpacity
          style={styles.moreOptionsBtn}
          onPress={() => setSelectedContactAction(item)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="ellipsis-horizontal" size={18} color="#94A3B8" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* ================= HEADER (Image 1 Screen 1) ================= */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Contacts</Text>
          <Text style={styles.headerSubtitle}>Manage people, labels, and custom fields.</Text>
        </View>
        <TouchableOpacity style={styles.gridIconBtn} activeOpacity={0.7}>
          <Ionicons name="grid-outline" size={20} color="#0F172A" />
        </TouchableOpacity>
      </View>

      {/* ================= ACTION BUTTONS ROW (Import & Add Contact) ================= */}
      <View style={styles.topActionsRow}>
        <TouchableOpacity
          style={styles.importBtn}
          onPress={() => {
            setImportStep(1);
            setShowImportModal(true);
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="download-outline" size={17} color="#0F172A" style={{ marginRight: 6 }} />
          <Text style={styles.importBtnText}>Import</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addContactBtn}
          onPress={() => navigation.navigate('AddContact')}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={19} color="#FFFFFF" style={{ marginRight: 4 }} />
          <Text style={styles.addContactBtnText}>Add Contact</Text>
        </TouchableOpacity>
      </View>

      {/* ================= SEARCH BAR WITH FILTER ICON ================= */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={17} color="#94A3B8" style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search contacts..."
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.filterIconBtn}
          onPress={() => setShowFilterModal(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="options-outline" size={20} color="#0F172A" />
        </TouchableOpacity>
      </View>

      {/* ================= FILTER TABS ================= */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsList}>
          {FILTER_TABS.map((tab) => {
            const isSelected = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tabPill, isSelected && styles.tabPillActive]}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.75}
              >
                <Text style={[styles.tabPillText, isSelected && styles.tabPillTextActive]}>{tab}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ================= COUNTER & SORT ROW ================= */}
      <View style={styles.counterRow}>
        <Text style={styles.counterText}>{filteredContacts.length} contacts</Text>

        <TouchableOpacity
          style={styles.sortSelectBtn}
          onPress={() => {
            setSelectionMode(!selectionMode);
            setSelectedIds([]);
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="swap-vertical" size={15} color="#00875A" style={{ marginRight: 4 }} />
          <Text style={styles.sortSelectText}>
            {selectionMode ? 'Done selecting' : 'Sort & select'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ================= CONTACTS LIST ================= */}
      <FlatList
        data={filteredContacts}
        keyExtractor={(item) => item._id}
        renderItem={renderContactItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#00875A']} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No contacts found</Text>
            <Text style={styles.emptySubtitle}>Tap "+ Add Contact" or "Import" to populate contacts.</Text>
          </View>
        }
      />

      {/* ================= IMPORT CONTACTS MODAL (Image 1 Screen 2 & 3) ================= */}
      <Modal
        visible={showImportModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowImportModal(false)}
      >
        <SafeAreaView style={styles.modalFullContainer}>
          <StatusBar style="dark" />

          {/* Stepper Header */}
          <View style={styles.importHeader}>
            <TouchableOpacity
              onPress={() => {
                if (importStep > 1) setImportStep(importStep - 1);
                else setShowImportModal(false);
              }}
              style={styles.backBtn}
            >
              <Ionicons name="chevron-back" size={24} color="#0F172A" />
            </TouchableOpacity>

            <Text style={styles.importHeaderTitle}>Import Contacts</Text>
            <View style={{ width: 36 }} />
          </View>

          {/* Stepper Indicators */}
          <View style={styles.stepperRow}>
            <View style={[styles.stepCircle, styles.stepCircleActive]}>
              <Text style={styles.stepCircleTextActive}>1</Text>
            </View>
            <View style={[styles.stepLine, importStep >= 2 && styles.stepLineActive]} />
            <View style={[styles.stepCircle, importStep >= 2 && styles.stepCircleActive]}>
              <Text style={importStep >= 2 ? styles.stepCircleTextActive : styles.stepCircleTextInactive}>
                2
              </Text>
            </View>
            <View style={[styles.stepLine, importStep >= 3 && styles.stepLineActive]} />
            <View style={[styles.stepCircle, importStep >= 3 && styles.stepCircleActive]}>
              <Text style={importStep >= 3 ? styles.stepCircleTextActive : styles.stepCircleTextInactive}>
                3
              </Text>
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.importScrollContent}>
            {/* STEP 1: UPLOAD */}
            {importStep === 1 && (
              <>
                <View style={styles.uploadCard}>
                  <View style={styles.uploadIconCircle}>
                    <Ionicons name="cloud-upload-outline" size={28} color="#00875A" />
                  </View>
                  <Text style={styles.uploadTitle}>Upload your contact file</Text>
                  <Text style={styles.uploadSubtitle}>Select a CSV or XLSX file up to 10 MB.</Text>

                  <TouchableOpacity
                    style={styles.selectFileBtn}
                    onPress={() => setImportStep(2)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.selectFileBtnText}>Select CSV or XLSX File</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.downloadTemplateLink}
                    onPress={() => Alert.alert('Sample Downloaded', 'massbee_contacts_template.csv saved')}
                  >
                    <Text style={styles.downloadTemplateText}>Download Sample Template</Text>
                  </TouchableOpacity>
                </View>

                {/* Before you import Box */}
                <View style={styles.beforeImportBox}>
                  <Text style={styles.beforeImportTitle}>Before you import</Text>
                  <Text style={styles.beforeImportText}>
                    Include Name and WhatsApp Number columns. Phone numbers should include a country code.
                  </Text>
                </View>
              </>
            )}

            {/* STEP 2: PREVIEW CONTACTS */}
            {importStep === 2 && (
              <>
                {/* File Ready Pill Banner */}
                <View style={styles.fileReadyBanner}>
                  <Ionicons name="checkmark" size={16} color="#00875A" style={{ marginRight: 8 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fileReadyName}>massbee-contacts.csv</Text>
                    <Text style={styles.fileReadyMeta}>3 Contacts • Ready to preview</Text>
                  </View>
                </View>

                <Text style={styles.previewSectionTitle}>Preview contacts</Text>

                {/* Contact Preview Item 1 */}
                <View style={styles.previewCard}>
                  <View style={styles.previewAvatar}>
                    <Text style={styles.previewAvatarText}>SY</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.previewName}>Sumit yadav</Text>
                    <Text style={styles.previewPhone}>+917697215393 • Asia</Text>
                    <Text style={styles.previewEmail}>sy@test.com</Text>
                  </View>
                  <View style={styles.validBadge}>
                    <Text style={styles.validBadgeText}>Valid</Text>
                  </View>
                </View>

                {/* Contact Preview Item 2 */}
                <View style={styles.previewCard}>
                  <View style={styles.previewAvatar}>
                    <Text style={styles.previewAvatarText}>PV</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.previewName}>Priya Verma</Text>
                    <Text style={styles.previewPhone}>+919810452881</Text>
                    <Text style={styles.previewEmail}>priya@example.com</Text>
                  </View>
                  <View style={styles.validBadge}>
                    <Text style={styles.validBadgeText}>Valid</Text>
                  </View>
                </View>

                {/* Duplicate Warning */}
                <View style={styles.duplicateWarningBox}>
                  <Text style={styles.duplicateWarningText}>
                    1 duplicate detected. Existing contacts will be skipped.
                  </Text>
                </View>

                {/* Bottom Buttons */}
                <View style={styles.step2ActionsRow}>
                  <TouchableOpacity
                    style={styles.cancelStepBtn}
                    onPress={() => setImportStep(1)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.cancelStepBtnText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.importConfirmBtn}
                    onPress={handleImportSuccess}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.importConfirmBtnText}>Import 1 Contact</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ================= FILTER CONTACTS BOTTOM SHEET (Image 1 Screen 5) ================= */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowFilterModal(false)}
        >
          <View style={styles.sheetDialog} onStartShouldSetResponder={() => true}>
            <View style={styles.sheetHandle} />

            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Filter Contacts</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Status Dropdown */}
            <Text style={styles.filterFieldLabel}>Status</Text>
            <View style={styles.filterDropdown}>
              <Text style={styles.filterDropdownText}>{filterStatus}</Text>
              <Ionicons name="chevron-down" size={16} color="#64748B" />
            </View>

            {/* Labels Dropdown */}
            <Text style={styles.filterFieldLabel}>Labels</Text>
            <View style={styles.filterDropdown}>
              <Text style={styles.filterDropdownText}>{filterLabel}</Text>
              <Ionicons name="chevron-down" size={16} color="#64748B" />
            </View>

            {/* WhatsApp Number */}
            <Text style={styles.filterFieldLabel}>WhatsApp number</Text>
            <TextInput
              style={styles.filterInput}
              placeholder="Enter number"
              placeholderTextColor="#94A3B8"
              value={filterPhone}
              onChangeText={setFilterPhone}
            />

            {/* Email */}
            <Text style={styles.filterFieldLabel}>Email</Text>
            <TextInput
              style={styles.filterInput}
              placeholder="Enter email"
              placeholderTextColor="#94A3B8"
              value={filterEmail}
              onChangeText={setFilterEmail}
            />

            {/* Date added */}
            <Text style={styles.filterFieldLabel}>Date added</Text>
            <TextInput
              style={styles.filterInput}
              placeholder="Select date range"
              placeholderTextColor="#94A3B8"
              value={filterDate}
              onChangeText={setFilterDate}
            />

            {/* Bottom Actions */}
            <View style={styles.filterActionsRow}>
              <TouchableOpacity
                style={styles.filterResetBtn}
                onPress={() => {
                  setFilterStatus('Any status');
                  setFilterLabel('Any label');
                  setFilterPhone('');
                  setFilterEmail('');
                  setFilterDate('');
                  setShowFilterModal(false);
                }}
              >
                <Text style={styles.filterResetBtnText}>Reset</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.filterApplyBtn}
                onPress={() => setShowFilterModal(false)}
              >
                <Text style={styles.filterApplyBtnText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ================= CONTACT 3-DOTS ACTIONS MODAL ================= */}
      <Modal
        visible={Boolean(selectedContactAction)}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedContactAction(null)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setSelectedContactAction(null)}
        >
          <View style={styles.sheetDialog} onStartShouldSetResponder={() => true}>
            <View style={styles.sheetHandle} />

            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{selectedContactAction?.name}</Text>
              <TouchableOpacity onPress={() => setSelectedContactAction(null)}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.actionMenuRow}
              onPress={() => {
                const c = selectedContactAction;
                setSelectedContactAction(null);
                navigation.navigate('ChatDetail', {
                  chat: {
                    _id: c._id,
                    name: c.name,
                    phone: c.phone,
                    avatarText: c.initials,
                    avatarBg: '#D1FAE5',
                    avatarColor: '#065F46',
                  },
                });
              }}
            >
              <Ionicons name="chatbubble-outline" size={18} color="#00875A" style={{ marginRight: 12 }} />
              <Text style={styles.actionMenuText}>Open WhatsApp Chat</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionMenuRow}
              onPress={() => {
                const c = selectedContactAction;
                setSelectedContactAction(null);
                navigation.navigate('EditContactProfile', { contact: c });
              }}
            >
              <Ionicons name="create-outline" size={18} color="#0F172A" style={{ marginRight: 12 }} />
              <Text style={styles.actionMenuText}>Edit Contact Details</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.actionMenuRow}
              onPress={() => handleDeleteContact(selectedContactAction)}
            >
              <Ionicons name="trash-outline" size={18} color="#EF4444" style={{ marginRight: 12 }} />
              <Text style={[styles.actionMenuText, { color: '#EF4444' }]}>Delete Contact</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  gridIconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Action Buttons Row (Import & Add Contact)
  topActionsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  importBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  importBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  addContactBtn: {
    flex: 1.3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00875A',
    borderRadius: 12,
    paddingVertical: 10,
  },
  addContactBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Search Row
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    gap: 10,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#0F172A',
  },
  filterIconBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Filter Tabs
  tabsContainer: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 10,
  },
  tabsList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  tabPillActive: {
    backgroundColor: '#00875A',
  },
  tabPillText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
  },
  tabPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Counter Row
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  counterText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
  },
  sortSelectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortSelectText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#00875A',
  },

  // Contact Cards
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 10,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectCheckbox: {
    marginRight: 10,
  },
  checkboxSquare: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSquareChecked: {
    backgroundColor: '#00875A',
    borderColor: '#00875A',
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarInitials: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  contactDetailsCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactName: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginRight: 4,
  },
  statusPillText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  contactPhone: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 6,
  },
  tagDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginRight: 5,
  },
  tagPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  moreOptionsBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
    textAlign: 'center',
  },

  // Bottom Sheet Modal & Action Menu
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  sheetDialog: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 32,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 14,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  filterFieldLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 6,
    marginTop: 10,
  },
  filterDropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterDropdownText: {
    fontSize: 13,
    color: '#0F172A',
  },
  filterInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 22,
  },
  filterResetBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  filterResetBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  filterApplyBtn: {
    flex: 1.5,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00875A',
  },
  filterApplyBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionMenuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  actionMenuText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },

  // Import Modal Styles (Image 1 Screen 2 & 3)
  modalFullContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? 36 : 0,
  },
  importHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  importHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  stepCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: '#00875A',
  },
  stepCircleTextActive: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  stepCircleTextInactive: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  stepLine: {
    width: 36,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: '#00875A',
  },
  importScrollContent: {
    padding: 20,
  },
  uploadCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#A7F3D0',
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  uploadSubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    marginBottom: 18,
  },
  selectFileBtn: {
    width: '100%',
    backgroundColor: '#00875A',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  selectFileBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  downloadTemplateLink: {
    paddingVertical: 4,
  },
  downloadTemplateText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#00875A',
  },
  beforeImportBox: {
    backgroundColor: '#F0FDF4',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  beforeImportTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#166534',
    marginBottom: 4,
  },
  beforeImportText: {
    fontSize: 12,
    color: '#15803D',
    lineHeight: 17,
  },
  fileReadyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    marginBottom: 16,
  },
  fileReadyName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#166534',
  },
  fileReadyMeta: {
    fontSize: 11,
    color: '#15803D',
    marginTop: 2,
  },
  previewSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  previewAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  previewAvatarText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  previewName: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  previewPhone: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  previewEmail: {
    fontSize: 11,
    color: '#94A3B8',
  },
  validBadge: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  validBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#00875A',
  },
  duplicateWarningBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginVertical: 14,
  },
  duplicateWarningText: {
    fontSize: 11.5,
    color: '#92400E',
    fontWeight: '500',
  },
  step2ActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  cancelStepBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cancelStepBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  importConfirmBtn: {
    flex: 1.5,
    backgroundColor: '#00875A',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  importConfirmBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
