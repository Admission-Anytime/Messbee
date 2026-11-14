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

const COLOR_SWATCHES = [
  { id: 'c_emerald', color: '#059669', bg: '#ECFDF5', name: 'Emerald' },
  { id: 'c_orange', color: '#EA580C', bg: '#FFF7ED', name: 'Orange' },
  { id: 'c_purple', color: '#7C3AED', bg: '#F5F3FF', name: 'Purple' },
  { id: 'c_blue', color: '#2563EB', bg: '#EFF6FF', name: 'Blue' },
  { id: 'c_teal', color: '#0F766E', bg: '#F0FDFA', name: 'Teal' },
  { id: 'c_amber', color: '#D97706', bg: '#FFFBEB', name: 'Amber' },
  { id: 'c_rose', color: '#DB2777', bg: '#FDF2F8', name: 'Rose' },
  { id: 'c_slate', color: '#475569', bg: '#F1F5F9', name: 'Slate' },
];

const INITIAL_LABELS = [
  {
    id: 'lbl_1',
    name: 'Hot Lead',
    description: 'High-intent prospects requesting pricing or live demo',
    color: '#EA580C',
    bg: '#FFF7ED',
    contactsCount: 18,
    createdAt: 'Nov 02, 2026',
  },
  {
    id: 'lbl_2',
    name: 'VIP',
    description: 'Priority enterprise & key recurring accounts',
    color: '#7C3AED',
    bg: '#F5F3FF',
    contactsCount: 12,
    createdAt: 'Oct 29, 2026',
  },
  {
    id: 'lbl_3',
    name: 'Verified',
    description: 'Contacts with confirmed WhatsApp opt-in & KYC',
    color: '#059669',
    bg: '#ECFDF5',
    contactsCount: 42,
    createdAt: 'Oct 21, 2026',
  },
  {
    id: 'lbl_4',
    name: 'Follow Up',
    description: 'Pending callback or proposal follow-up scheduled',
    color: '#2563EB',
    bg: '#EFF6FF',
    contactsCount: 24,
    createdAt: 'Oct 18, 2026',
  },
  {
    id: 'lbl_5',
    name: 'Enterprise',
    description: 'Multi-seat B2B teams & custom API customers',
    color: '#0F766E',
    bg: '#F0FDFA',
    contactsCount: 9,
    createdAt: 'Oct 14, 2026',
  },
  {
    id: 'lbl_6',
    name: 'New Inquiry',
    description: 'Fresh inbound chats needing qualification',
    color: '#D97706',
    bg: '#FFFBEB',
    contactsCount: 31,
    createdAt: 'Oct 10, 2026',
  },
];

export default function LabelsScreen({ navigation }) {
  const [labels, setLabels] = useState(INITIAL_LABELS);
  const [searchQuery, setSearchQuery] = useState('');

  // Add / Edit Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    color: COLOR_SWATCHES[0].color,
    bg: COLOR_SWATCHES[0].bg,
  });

  // Action sheet
  const [selectedLabel, setSelectedLabel] = useState(null);
  const [showActionSheet, setShowActionSheet] = useState(false);

  const filteredLabels = useMemo(() => {
    if (!searchQuery.trim()) return labels;
    const q = searchQuery.trim().toLowerCase();
    return labels.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        (l.description || '').toLowerCase().includes(q)
    );
  }, [labels, searchQuery]);

  const totalAssigned = useMemo(
    () => labels.reduce((sum, l) => sum + (l.contactsCount || 0), 0),
    [labels]
  );

  const openAddModal = () => {
    setEditingId(null);
    setForm({
      name: '',
      description: '',
      color: COLOR_SWATCHES[0].color,
      bg: COLOR_SWATCHES[0].bg,
    });
    setShowModal(true);
  };

  const openEditModal = (lbl) => {
    setEditingId(lbl.id);
    setForm({
      name: lbl.name,
      description: lbl.description || '',
      color: lbl.color,
      bg: lbl.bg,
    });
    setShowModal(true);
  };

  const handleSaveLabel = () => {
    const cleanName = form.name.trim();
    if (!cleanName) {
      Alert.alert('Validation Error', 'Please enter a label name.');
      return;
    }

    const duplicate = labels.some(
      (l) => l.name.toLowerCase() === cleanName.toLowerCase() && l.id !== editingId
    );
    if (duplicate) {
      Alert.alert('Duplicate Label', 'A label with this name already exists.');
      return;
    }

    if (editingId) {
      setLabels((prev) =>
        prev.map((l) =>
          l.id === editingId
            ? {
                ...l,
                name: cleanName,
                description: form.description.trim(),
                color: form.color,
                bg: form.bg,
              }
            : l
        )
      );
    } else {
      const created = {
        id: `lbl_${Date.now()}`,
        name: cleanName,
        description: form.description.trim(),
        color: form.color,
        bg: form.bg,
        contactsCount: 0,
        createdAt: 'Just now',
      };
      setLabels((prev) => [created, ...prev]);
    }
    setShowModal(false);
  };

  const handleDeleteLabel = (lbl) => {
    Alert.alert('Delete Label', `Delete "${lbl.name}" label from workspace?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setLabels((prev) => prev.filter((item) => item.id !== lbl.id));
          setShowActionSheet(false);
        },
      },
    ]);
  };

  const renderLabelCard = ({ item }) => (
    <TouchableOpacity
      style={styles.labelCard}
      activeOpacity={0.85}
      onPress={() => openEditModal(item)}
    >
      <View style={styles.cardTop}>
        <View style={[styles.tagIconCircle, { backgroundColor: item.bg }]}>
          <Ionicons name="pricetag" size={18} color={item.color} />
        </View>

        <View style={{ flex: 1 }}>
          <View style={styles.cardTitleRow}>
            <View style={[styles.previewPill, { backgroundColor: item.bg }]}>
              <View style={[styles.dot, { backgroundColor: item.color }]} />
              <Text style={[styles.previewPillText, { color: item.color }]}>{item.name}</Text>
            </View>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>
                {item.contactsCount} {item.contactsCount === 1 ? 'contact' : 'contacts'}
              </Text>
            </View>
          </View>

          {!!item.description && (
            <Text style={styles.labelDesc} numberOfLines={2}>
              {item.description}
            </Text>
          )}
          <Text style={styles.createdMeta}>Created {item.createdAt}</Text>
        </View>

        <TouchableOpacity
          style={styles.moreBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={() => {
            setSelectedLabel(item);
            setShowActionSheet(true);
          }}
        >
          <Ionicons name="ellipsis-horizontal" size={18} color="#6B7280" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

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
            <Text style={styles.headerTitle}>Labels</Text>
            <Text style={styles.headerSub}>Segment contacts & automate campaigns</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.addHeaderBtn} activeOpacity={0.85} onPress={openAddModal}>
          <Ionicons name="add" size={17} color="#FFFFFF" />
          <Text style={styles.addHeaderBtnText}>Add Label</Text>
        </TouchableOpacity>
      </View>

      {/* Search + Stats Bar */}
      <View style={styles.topControls}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#9CA3AF" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search labels..."
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={17} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>
            {filteredLabels.length} Labels • {totalAssigned} Tagged Contacts
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'Contacts' })}>
            <Text style={styles.contactsLink}>Go to Contacts →</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Labels List */}
      <FlatList
        data={filteredLabels}
        keyExtractor={(item) => item.id}
        renderItem={renderLabelCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="pricetags-outline" size={34} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No labels found</Text>
            <Text style={styles.emptySub}>Create color-coded labels to categorize leads and contacts.</Text>
          </View>
        }
      />

      {/* ==================== ADD / EDIT LABEL MODAL ==================== */}
      <Modal visible={showModal} animationType="slide" onRequestClose={() => setShowModal(false)}>
        <SafeAreaView style={styles.modalScreen}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowModal(false)} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={22} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{editingId ? 'Edit Label' : 'Add Label'}</Text>
            <TouchableOpacity style={styles.savePill} onPress={handleSaveLabel}>
              <Text style={styles.savePillText}>Save Label</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalBody} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionHeading}>Label Details</Text>

            <View style={styles.formCard}>
              <Text style={styles.inputLabel}>
                Label Name <Text style={{ color: '#EF4444' }}>*</Text>
              </Text>
              <TextInput
                value={form.name}
                onChangeText={(val) => setForm((p) => ({ ...p, name: val }))}
                placeholder="e.g. Premium Prospect"
                placeholderTextColor="#9CA3AF"
                style={styles.textInput}
              />

              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                value={form.description}
                onChangeText={(val) => setForm((p) => ({ ...p, description: val }))}
                placeholder="Describe when team members should apply this label"
                placeholderTextColor="#9CA3AF"
                multiline
                style={[styles.textInput, styles.textArea]}
              />

              <Text style={styles.inputLabel}>Select Color</Text>
              <View style={styles.swatchGrid}>
                {COLOR_SWATCHES.map((sw) => {
                  const selected = form.color === sw.color;
                  return (
                    <TouchableOpacity
                      key={sw.id}
                      style={[
                        styles.swatchItem,
                        selected && { borderColor: sw.color, backgroundColor: sw.bg },
                      ]}
                      onPress={() => setForm((p) => ({ ...p, color: sw.color, bg: sw.bg }))}
                    >
                      <View style={[styles.swatchDot, { backgroundColor: sw.color }]}>
                        {selected && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
                      </View>
                      <Text style={styles.swatchName}>{sw.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.inputLabel}>Live Preview</Text>
              <View style={styles.previewBox}>
                <View style={[styles.previewPillLg, { backgroundColor: form.bg }]}>
                  <View style={[styles.dotLg, { backgroundColor: form.color }]} />
                  <Text style={[styles.previewPillLgText, { color: form.color }]}>
                    {form.name.trim() || 'Label Preview'}
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ==================== LABEL ACTIONS SHEET ==================== */}
      <Modal
        visible={showActionSheet && !!selectedLabel}
        transparent
        animationType="fade"
        onRequestClose={() => setShowActionSheet(false)}
      >
        <TouchableOpacity
          style={styles.sheetBackdrop}
          activeOpacity={1}
          onPress={() => setShowActionSheet(false)}
        >
          <View style={styles.sheetBox}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{selectedLabel?.name}</Text>
              <TouchableOpacity onPress={() => setShowActionSheet(false)}>
                <Ionicons name="close" size={20} color="#374151" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => {
                setShowActionSheet(false);
                openEditModal(selectedLabel);
              }}
            >
              <Ionicons name="create-outline" size={20} color="#374151" />
              <Text style={styles.actionText}>Edit Label</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => {
                setShowActionSheet(false);
                navigation.navigate('MainTabs', { screen: 'Contacts' });
              }}
            >
              <Ionicons name="people-outline" size={20} color="#059669" />
              <Text style={styles.actionText}>View Tagged Contacts</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionRow, { borderBottomWidth: 0 }]}
              onPress={() => handleDeleteLabel(selectedLabel)}
            >
              <Ionicons name="trash-outline" size={20} color="#DC2626" />
              <Text style={[styles.actionText, { color: '#DC2626' }]}>Delete Label</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
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
    fontSize: 11.5,
    color: '#6B7280',
  },
  addHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 9,
    backgroundColor: '#059669',
  },
  addHeaderBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  topControls: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  summaryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },
  contactsLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
  labelCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  tagIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  previewPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  previewPillText: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  countBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
  },
  labelDesc: {
    fontSize: 12.5,
    color: '#4B5563',
    marginTop: 7,
    lineHeight: 17,
  },
  createdMeta: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 5,
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
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  modalScreen: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  modalHeader: {
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
  savePill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#059669',
  },
  savePillText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalBody: {
    padding: 18,
    paddingBottom: 40,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginTop: 10,
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
  textArea: {
    height: 82,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  swatchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  swatchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    minWidth: '22%',
  },
  swatchDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchName: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#374151',
  },
  previewBox: {
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'flex-start',
  },
  previewPillLg: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  dotLg: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  previewPillLgText: {
    fontSize: 13.5,
    fontWeight: '800',
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
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  actionText: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#1F2937',
  },
});

