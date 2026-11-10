import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

const STATUS_OPTIONS = [
  { id: 'new', label: 'New Lead', color: '#3B82F6', bg: '#EFF6FF' },
  { id: 'open', label: 'Open', color: '#10B981', bg: '#ECFDF5' },
  { id: 'pending', label: 'Pending Reply', color: '#F59E0B', bg: '#FEF3C7' },
  { id: 'warm', label: 'Warm Prospect', color: '#EC4899', bg: '#FDF2F8' },
  { id: 'closed', label: 'Closed / Won', color: '#059669', bg: '#D1FAE5' },
  { id: 'lost', label: 'Lost / Inactive', color: '#6B7280', bg: '#F3F4F6' },
];

const AVAILABLE_TAGS = [
  { id: 't1', name: 'VIP Customer', color: '#854D0E', bg: '#FEF9C3' },
  { id: 't2', name: 'Hot Lead', color: '#991B1B', bg: '#FEE2E2' },
  { id: 't3', name: 'Enterprise', color: '#065F46', bg: '#D1FAE5' },
  { id: 't4', name: 'Follow Up', color: '#1E40AF', bg: '#DBEAFE' },
  { id: 't5', name: 'Pricing Sent', color: '#3730A3', bg: '#E0E7FF' },
  { id: 't6', name: 'Retail Order', color: '#9D174D', bg: '#FCE7F3' },
];

const TEAM_MEMBERS = [
  { id: 'a1', name: 'Self (You)', role: 'Owner', avatar: 'ME', online: true },
  { id: 'a2', name: 'Arshlan Khan', role: 'Support Lead', avatar: 'AK', online: true },
  { id: 'a3', name: 'Priya Sharma', role: 'Sales Executive', avatar: 'PS', online: false },
  { id: 'a4', name: 'Vinay Verma', role: 'Operations', avatar: 'VV', online: true },
];

export default function ContactCrmScreen({ route, navigation }) {
  const { contact = { name: 'Rahul Sharma', phone: '+91 98765 43210', initials: 'RS', color: '#FB923C' } } =
    route.params || {};

  // CRM State
  const [currentStatus, setCurrentStatus] = useState('open');
  const [assignedAgent, setAssignedAgent] = useState('Self (You)');
  const [selectedTags, setSelectedTags] = useState(['VIP Customer', 'Follow Up']);
  const [customFields, setCustomFields] = useState({
    email: 'rahul.sharma@example.com',
    company: 'Sharma Infotech Pvt Ltd',
    city: 'New Delhi',
    gstn: '07AAAAA0000A1Z5',
    budget: '₹ 75,000 / mo',
  });

  // Internal Notes State
  const [notes, setNotes] = useState([
    {
      id: 'n1',
      author: 'Arshlan Khan',
      date: 'Today, 2:15 PM',
      text: 'Client requested WhatsApp Cloud API setup for 50k broadcast messages. Scheduled follow-up on Friday.',
    },
    {
      id: 'n2',
      author: 'Vinay Verma',
      date: 'Yesterday, 11:30 AM',
      text: 'Demo brochure & pricing tier shared via automated template.',
    },
  ]);
  const [newNote, setNewNote] = useState('');

  // Modals
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [tagModalVisible, setTagModalVisible] = useState(false);
  const [editFieldsModalVisible, setEditFieldsModalVisible] = useState(false);

  // Status Handler
  const activeStatusObj = STATUS_OPTIONS.find((s) => s.id === currentStatus) || STATUS_OPTIONS[1];

  // Tag toggle
  const toggleTag = (tagName) => {
    if (selectedTags.includes(tagName)) {
      setSelectedTags(selectedTags.filter((t) => t !== tagName));
    } else {
      setSelectedTags([...selectedTags, tagName]);
    }
  };

  // Add Note
  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const noteObj = {
      id: `n_${Date.now()}`,
      author: 'Self (You)',
      date: 'Just now',
      text: newNote.trim(),
    };
    setNotes([noteObj, ...notes]);
    setNewNote('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact CRM Details</Text>
        <TouchableOpacity
          onPress={() => setEditFieldsModalVisible(true)}
          style={styles.headerRightBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="create-outline" size={22} color={COLORS.primaryDark} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={[styles.avatarCircle, { backgroundColor: contact.color || '#FB923C' }]}>
            <Text style={styles.avatarText}>{contact.initials || 'U'}</Text>
          </View>
          <Text style={styles.contactName}>{contact.name}</Text>
          <Text style={styles.contactPhone}>{contact.phone}</Text>

          {/* Quick Actions Row */}
          <View style={styles.quickContactRow}>
            <TouchableOpacity
              style={styles.quickContactBtn}
              onPress={() => navigation.navigate('ChatDetail', { chat: contact })}
              activeOpacity={0.7}
            >
              <Ionicons name="chatbubbles-outline" size={18} color="#FFFFFF" />
              <Text style={styles.quickContactBtnText}>Open Chat</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickContactBtn, styles.callBtn]}
              onPress={() => Alert.alert('Call', `Calling ${contact.phone}...`)}
              activeOpacity={0.7}
            >
              <Ionicons name="call-outline" size={18} color="#FFFFFF" />
              <Text style={styles.quickContactBtnText}>Call</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Lead Status & Assignment Bar */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionHeaderLabel}>PIPELINE & ASSIGNMENT</Text>

          <View style={styles.interactiveRow}>
            <View style={styles.rowLabelBox}>
              <Ionicons name="flag-outline" size={18} color="#4B5563" />
              <Text style={styles.rowLabel}>Lead Status</Text>
            </View>
            <TouchableOpacity
              style={[styles.badgePill, { backgroundColor: activeStatusObj.bg, borderColor: activeStatusObj.color }]}
              onPress={() => setStatusModalVisible(true)}
              activeOpacity={0.7}
            >
              <Text style={[styles.badgePillText, { color: activeStatusObj.color }]}>
                {activeStatusObj.label}
              </Text>
              <Ionicons name="chevron-down" size={14} color={activeStatusObj.color} />
            </TouchableOpacity>
          </View>

          <View style={[styles.interactiveRow, styles.borderTop]}>
            <View style={styles.rowLabelBox}>
              <Ionicons name="person-add-outline" size={18} color="#4B5563" />
              <Text style={styles.rowLabel}>Assigned Agent</Text>
            </View>
            <TouchableOpacity
              style={styles.agentSelector}
              onPress={() => setAssignModalVisible(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.agentSelectorText}>{assignedAgent}</Text>
              <Ionicons name="chevron-forward" size={14} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tags / Labels Section */}
        <View style={styles.cardSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeaderLabel}>TAGS & ATTRIBUTES</Text>
            <TouchableOpacity onPress={() => setTagModalVisible(true)} activeOpacity={0.7}>
              <Text style={styles.manageLink}>+ Manage</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tagsWrapper}>
            {selectedTags.map((tag) => (
              <View key={tag} style={styles.tagBadge}>
                <Ionicons name="pricetag" size={12} color={COLORS.primaryDark} style={styles.tagIcon} />
                <Text style={styles.tagBadgeText}>{tag}</Text>
              </View>
            ))}
            {selectedTags.length === 0 && (
              <Text style={styles.emptyNote}>No tags assigned yet. Tap Manage to add tags.</Text>
            )}
          </View>
        </View>

        {/* Custom Fields (CRM Properties) */}
        <View style={styles.cardSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeaderLabel}>CUSTOMER ATTRIBUTES</Text>
            <TouchableOpacity onPress={() => setEditFieldsModalVisible(true)} activeOpacity={0.7}>
              <Text style={styles.manageLink}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.attributeItem}>
            <Text style={styles.attributeKey}>Email Address</Text>
            <Text style={styles.attributeValue}>{customFields.email || 'N/A'}</Text>
          </View>

          <View style={styles.attributeItem}>
            <Text style={styles.attributeKey}>Company / Business</Text>
            <Text style={styles.attributeValue}>{customFields.company || 'N/A'}</Text>
          </View>

          <View style={styles.attributeItem}>
            <Text style={styles.attributeKey}>City / Region</Text>
            <Text style={styles.attributeValue}>{customFields.city || 'N/A'}</Text>
          </View>

          <View style={styles.attributeItem}>
            <Text style={styles.attributeKey}>GST Number</Text>
            <Text style={styles.attributeValue}>{customFields.gstn || 'N/A'}</Text>
          </View>

          <View style={styles.attributeItem}>
            <Text style={styles.attributeKey}>Budget / Requirement</Text>
            <Text style={styles.attributeValue}>{customFields.budget || 'N/A'}</Text>
          </View>
        </View>

        {/* Internal Team Notes */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionHeaderLabel}>INTERNAL TEAM NOTES (CONFIDENTIAL)</Text>

          {/* Add note input */}
          <View style={styles.noteInputCard}>
            <TextInput
              style={styles.noteTextInput}
              placeholder="Write an internal note for your team..."
              placeholderTextColor="#9CA3AF"
              multiline
              value={newNote}
              onChangeText={setNewNote}
            />
            <View style={styles.noteInputFooter}>
              <View style={styles.notePrivacyBadge}>
                <Ionicons name="lock-closed" size={12} color="#D97706" />
                <Text style={styles.notePrivacyText}>Only Visible to Team</Text>
              </View>
              <TouchableOpacity
                style={[styles.saveNoteBtn, !newNote.trim() && styles.saveNoteBtnDisabled]}
                onPress={handleAddNote}
                disabled={!newNote.trim()}
                activeOpacity={0.8}
              >
                <Text style={styles.saveNoteBtnText}>Post Note</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Notes list */}
          <View style={styles.notesListContainer}>
            {notes.map((item) => (
              <View key={item.id} style={styles.noteItemCard}>
                <View style={styles.noteMetaRow}>
                  <Text style={styles.noteAuthor}>{item.author}</Text>
                  <Text style={styles.noteDate}>{item.date}</Text>
                </View>
                <Text style={styles.noteBodyText}>{item.text}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* --- STATUS SELECTION MODAL --- */}
      <Modal visible={statusModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Lead Status</Text>
              <TouchableOpacity onPress={() => setStatusModalVisible(false)} activeOpacity={0.7}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalList}>
              {STATUS_OPTIONS.map((st) => (
                <TouchableOpacity
                  key={st.id}
                  style={[
                    styles.modalOptionItem,
                    currentStatus === st.id && { backgroundColor: st.bg, borderColor: st.color },
                  ]}
                  onPress={() => {
                    setCurrentStatus(st.id);
                    setStatusModalVisible(false);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.statusDot, { backgroundColor: st.color }]} />
                  <Text style={[styles.modalOptionText, currentStatus === st.id && { color: st.color, fontWeight: '700' }]}>
                    {st.label}
                  </Text>
                  {currentStatus === st.id && <Ionicons name="checkmark" size={18} color={st.color} />}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* --- ASSIGN AGENT MODAL --- */}
      <Modal visible={assignModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Assign Chat to Agent</Text>
              <TouchableOpacity onPress={() => setAssignModalVisible(false)} activeOpacity={0.7}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalList}>
              {TEAM_MEMBERS.map((mem) => (
                <TouchableOpacity
                  key={mem.id}
                  style={[styles.modalOptionItem, assignedAgent === mem.name && styles.modalOptionActive]}
                  onPress={() => {
                    setAssignedAgent(mem.name);
                    setAssignModalVisible(false);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.memberAvatarCircle}>
                    <Text style={styles.memberAvatarText}>{mem.avatar}</Text>
                  </View>
                  <View style={styles.memberDetails}>
                    <Text style={styles.memberName}>{mem.name}</Text>
                    <Text style={styles.memberRole}>{mem.role}</Text>
                  </View>
                  {assignedAgent === mem.name && <Ionicons name="checkmark-circle" size={20} color={COLORS.primaryDark} />}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* --- MANAGE TAGS MODAL --- */}
      <Modal visible={tagModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Tags & Labels</Text>
              <TouchableOpacity onPress={() => setTagModalVisible(false)} activeOpacity={0.7}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalTagGrid}>
              {AVAILABLE_TAGS.map((t) => {
                const isSelected = selectedTags.includes(t.name);
                return (
                  <TouchableOpacity
                    key={t.id}
                    style={[
                      styles.selectableTag,
                      isSelected && { backgroundColor: t.bg, borderColor: t.color },
                    ]}
                    onPress={() => toggleTag(t.name)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={isSelected ? 'checkmark-circle' : 'add-circle-outline'}
                      size={16}
                      color={isSelected ? t.color : '#9CA3AF'}
                    />
                    <Text style={[styles.selectableTagText, isSelected && { color: t.color, fontWeight: '700' }]}>
                      {t.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={styles.doneBtn}
              onPress={() => setTagModalVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.doneBtnText}>Save Tags</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* --- EDIT ATTRIBUTES MODAL --- */}
      <Modal visible={editFieldsModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Customer Attributes</Text>
              <TouchableOpacity onPress={() => setEditFieldsModalVisible(false)} activeOpacity={0.7}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 350 }}>
              <View style={styles.editInputGroup}>
                <Text style={styles.editInputLabel}>Email</Text>
                <TextInput
                  style={styles.editTextInput}
                  value={customFields.email}
                  onChangeText={(v) => setCustomFields({ ...customFields, email: v })}
                />
              </View>

              <View style={styles.editInputGroup}>
                <Text style={styles.editInputLabel}>Company Name</Text>
                <TextInput
                  style={styles.editTextInput}
                  value={customFields.company}
                  onChangeText={(v) => setCustomFields({ ...customFields, company: v })}
                />
              </View>

              <View style={styles.editInputGroup}>
                <Text style={styles.editInputLabel}>City / Location</Text>
                <TextInput
                  style={styles.editTextInput}
                  value={customFields.city}
                  onChangeText={(v) => setCustomFields({ ...customFields, city: v })}
                />
              </View>

              <View style={styles.editInputGroup}>
                <Text style={styles.editInputLabel}>GST Number</Text>
                <TextInput
                  style={styles.editTextInput}
                  value={customFields.gstn}
                  onChangeText={(v) => setCustomFields({ ...customFields, gstn: v })}
                />
              </View>

              <View style={styles.editInputGroup}>
                <Text style={styles.editInputLabel}>Budget</Text>
                <TextInput
                  style={styles.editTextInput}
                  value={customFields.budget}
                  onChangeText={(v) => setCustomFields({ ...customFields, budget: v })}
                />
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.doneBtn}
              onPress={() => setEditFieldsModalVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.doneBtnText}>Save Changes</Text>
            </TouchableOpacity>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  headerRightBtn: {
    padding: 6,
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  contactName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  contactPhone: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 16,
  },
  quickContactRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  quickContactBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primaryDark,
    paddingVertical: 10,
    borderRadius: 12,
  },
  callBtn: {
    backgroundColor: '#3B82F6',
  },
  quickContactBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  cardSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeaderLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  manageLink: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  interactiveRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  rowLabelBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  badgePillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  agentSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  agentSelectorText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  tagsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  tagIcon: {
    marginRight: 6,
  },
  tagBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
  },
  emptyNote: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  attributeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  attributeKey: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  attributeValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F2937',
  },
  noteInputCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    marginBottom: 14,
  },
  noteTextInput: {
    fontSize: 13,
    color: '#111827',
    minHeight: 60,
    textAlignVertical: 'top',
  },
  noteInputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  notePrivacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  notePrivacyText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D97706',
  },
  saveNoteBtn: {
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  saveNoteBtnDisabled: {
    backgroundColor: '#D1D5DB',
  },
  saveNoteBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  notesListContainer: {
    gap: 10,
  },
  noteItemCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  noteMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  noteAuthor: {
    fontSize: 11,
    fontWeight: '800',
    color: '#92400E',
  },
  noteDate: {
    fontSize: 10,
    color: '#B45309',
  },
  noteBodyText: {
    fontSize: 12,
    color: '#78350F',
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  modalList: {
    gap: 8,
  },
  modalOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  modalOptionActive: {
    backgroundColor: '#ECFDF5',
    borderColor: COLORS.primaryDark,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  modalOptionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  memberAvatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  memberAvatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  memberRole: {
    fontSize: 11,
    color: '#6B7280',
  },
  modalTagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  selectableTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  selectableTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  doneBtn: {
    backgroundColor: COLORS.primaryDark,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  editInputGroup: {
    marginBottom: 12,
  },
  editInputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 4,
  },
  editTextInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#111827',
  },
});
