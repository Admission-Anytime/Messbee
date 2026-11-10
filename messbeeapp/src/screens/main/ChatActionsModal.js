import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  FlatList,
  TextInput,
  Switch,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

// Status configurations
export const STATUS_OPTIONS = [
  { id: 'new', label: 'New Lead', color: '#3B82F6', icon: 'sparkles', bg: '#EFF6FF' },
  { id: 'open', label: 'Open / In Progress', color: '#10B981', icon: 'chatbubbles', bg: '#ECFDF5' },
  { id: 'pending', label: 'Pending Customer Reply', color: '#F59E0B', icon: 'time', bg: '#FFFBEB' },
  { id: 'followup', label: 'Follow-up Needed', color: '#8B5CF6', icon: 'alarm', bg: '#F5F3FF' },
  { id: 'resolved', label: 'Resolved / Closed', color: '#6B7280', icon: 'checkmark-circle', bg: '#F3F4F6' },
  { id: 'spam', label: 'Spam / Junk', color: '#EF4444', icon: 'alert-circle', bg: '#FEF2F2' },
];

// Available team agents
export const TEAM_AGENTS = [
  { id: 'a1', name: 'Rahul Sharma', role: 'Senior Support Lead', activeChats: 4, online: true, initials: 'RS', color: '#10B981' },
  { id: 'a2', name: 'Priya Verma', role: 'Sales Account Exec', activeChats: 2, online: true, initials: 'PV', color: '#8B5CF6' },
  { id: 'a3', name: 'Aman Patel', role: 'Customer Success', activeChats: 6, online: false, initials: 'AP', color: '#F59E0B' },
  { id: 'a4', name: 'MessBee AI Agent', role: 'Automated Bot Handoff', activeChats: 18, online: true, initials: 'AI', color: '#25D366' },
];

// Tag color palette
export const DEFAULT_TAGS = [
  { id: 't1', label: 'VIP Customer', color: '#EF4444', bg: '#FEF2F2' },
  { id: 't2', label: 'Enterprise Deal', color: '#8B5CF6', bg: '#F5F3FF' },
  { id: 't3', label: 'Payment Pending', color: '#F59E0B', bg: '#FFFBEB' },
  { id: 't4', label: 'High Priority', color: '#DC2626', bg: '#FEE2E2' },
  { id: 't5', label: 'WhatsApp Broadcast', color: '#10B981', bg: '#ECFDF5' },
  { id: 't6', label: 'Product Enquiry', color: '#3B82F6', bg: '#EFF6FF' },
];

/**
 * 1. Main Chat Actions Bottom Sheet
 */
export function ChatActionsSheet({
  visible,
  onClose,
  chat,
  onOpenCRM,
  onOpenStatus,
  onOpenAssign,
  onOpenTags,
  onOpenTemplates,
  onOpenBotMenu,
  onOpenArchive,
  onOpenClear,
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={sheetStyles.overlay}>
          <TouchableWithoutFeedback>
            <View style={sheetStyles.container}>
              {/* Grab bar */}
              <View style={sheetStyles.dragBarContainer}>
                <View style={sheetStyles.dragBar} />
              </View>

              {/* Header profile snapshot */}
              <View style={sheetStyles.header}>
                <View style={[sheetStyles.avatar, { backgroundColor: chat?.color || '#10B981' }]}>
                  <Text style={sheetStyles.avatarText}>{chat?.initials || 'U'}</Text>
                </View>
                <View style={sheetStyles.headerTextWrap}>
                  <Text style={sheetStyles.headerName}>{chat?.name || 'Contact Actions'}</Text>
                  <Text style={sheetStyles.headerSub}>Manage conversation, CRM & workflows</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={sheetStyles.closeBtn}>
                  <Ionicons name="close" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {/* Action List */}
              <View style={sheetStyles.actionsList}>
                <TouchableOpacity
                  style={sheetStyles.actionRow}
                  activeOpacity={0.7}
                  onPress={() => {
                    onClose();
                    onOpenCRM();
                  }}
                >
                  <View style={[sheetStyles.actionIcon, { backgroundColor: '#ECFDF5' }]}>
                    <Ionicons name="person-circle" size={22} color={COLORS.primaryDark} />
                  </View>
                  <View style={sheetStyles.actionInfo}>
                    <Text style={sheetStyles.actionTitle}>Contact CRM & Profile</Text>
                    <Text style={sheetStyles.actionDesc}>View contact details, notes, fields & lead history</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={sheetStyles.actionRow}
                  activeOpacity={0.7}
                  onPress={() => {
                    onClose();
                    onOpenStatus();
                  }}
                >
                  <View style={[sheetStyles.actionIcon, { backgroundColor: '#EFF6FF' }]}>
                    <Ionicons name="swap-horizontal" size={20} color="#3B82F6" />
                  </View>
                  <View style={sheetStyles.actionInfo}>
                    <Text style={sheetStyles.actionTitle}>Change Status</Text>
                    <Text style={sheetStyles.actionDesc}>Update lead stage: Open, Pending, Resolved</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={sheetStyles.actionRow}
                  activeOpacity={0.7}
                  onPress={() => {
                    onClose();
                    onOpenAssign();
                  }}
                >
                  <View style={[sheetStyles.actionIcon, { backgroundColor: '#F5F3FF' }]}>
                    <Ionicons name="people" size={20} color="#8B5CF6" />
                  </View>
                  <View style={sheetStyles.actionInfo}>
                    <Text style={sheetStyles.actionTitle}>Assign Team Member</Text>
                    <Text style={sheetStyles.actionDesc}>Transfer conversation to agent or AI Bot</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={sheetStyles.actionRow}
                  activeOpacity={0.7}
                  onPress={() => {
                    onClose();
                    onOpenTags();
                  }}
                >
                  <View style={[sheetStyles.actionIcon, { backgroundColor: '#FFFBEB' }]}>
                    <Ionicons name="pricetags" size={20} color="#F59E0B" />
                  </View>
                  <View style={sheetStyles.actionInfo}>
                    <Text style={sheetStyles.actionTitle}>Manage Tags & Labels</Text>
                    <Text style={sheetStyles.actionDesc}>Attach VIP, Enterprise, or Custom chips</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={sheetStyles.actionRow}
                  activeOpacity={0.7}
                  onPress={() => {
                    onClose();
                    onOpenTemplates();
                  }}
                >
                  <View style={[sheetStyles.actionIcon, { backgroundColor: '#ECFDF5' }]}>
                    <Ionicons name="sparkles" size={20} color="#059669" />
                  </View>
                  <View style={sheetStyles.actionInfo}>
                    <Text style={sheetStyles.actionTitle}>WhatsApp Templates</Text>
                    <Text style={sheetStyles.actionDesc}>Send pre-approved media & variable templates</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={sheetStyles.actionRow}
                  activeOpacity={0.7}
                  onPress={() => {
                    onClose();
                    onOpenBotMenu();
                  }}
                >
                  <View style={[sheetStyles.actionIcon, { backgroundColor: '#FEF3C7' }]}>
                    <Ionicons name="grid-outline" size={20} color="#D97706" />
                  </View>
                  <View style={sheetStyles.actionInfo}>
                    <Text style={sheetStyles.actionTitle}>Interactive Bot Menu</Text>
                    <Text style={sheetStyles.actionDesc}>Trigger automated flow steps & FAQs</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                </TouchableOpacity>

                <View style={sheetStyles.divider} />

                {/* Destructive Actions */}
                <TouchableOpacity
                  style={sheetStyles.actionRow}
                  activeOpacity={0.7}
                  onPress={() => {
                    onClose();
                    onOpenArchive();
                  }}
                >
                  <View style={[sheetStyles.actionIcon, { backgroundColor: '#F3F4F6' }]}>
                    <Ionicons name="archive-outline" size={20} color="#4B5563" />
                  </View>
                  <View style={sheetStyles.actionInfo}>
                    <Text style={sheetStyles.actionTitle}>Archive Conversation</Text>
                    <Text style={sheetStyles.actionDesc}>Move chat to archived folder</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={sheetStyles.actionRow}
                  activeOpacity={0.7}
                  onPress={() => {
                    onClose();
                    onOpenClear();
                  }}
                >
                  <View style={[sheetStyles.actionIcon, { backgroundColor: '#FEF2F2' }]}>
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                  </View>
                  <View style={sheetStyles.actionInfo}>
                    <Text style={[sheetStyles.actionTitle, { color: '#EF4444' }]}>Clear Chat</Text>
                    <Text style={sheetStyles.actionDesc}>Permanently delete all messages in chat</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

/**
 * 2. Change Status Modal (Figma "Chang...")
 */
export function ChangeStatusModal({
  visible,
  onClose,
  currentStatus,
  onSelectStatus,
}) {
  const [selected, setSelected] = useState(currentStatus || 'open');
  const [note, setNote] = useState('');

  const handleSave = () => {
    onSelectStatus(selected, note);
    setNote('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={modalStyles.overlay}>
          <TouchableWithoutFeedback>
            <View style={modalStyles.dialog}>
              <View style={modalStyles.header}>
                <View style={modalStyles.headerTitleWrap}>
                  <Ionicons name="flag" size={20} color={COLORS.primaryDark} />
                  <Text style={modalStyles.headerTitle}>Update Conversation Status</Text>
                </View>
                <TouchableOpacity onPress={onClose}>
                  <Ionicons name="close" size={22} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <Text style={modalStyles.subText}>Select the current stage for this customer query</Text>

              <View style={modalStyles.listContainer}>
                {STATUS_OPTIONS.map((st) => {
                  const isSelected = selected === st.id;
                  return (
                    <TouchableOpacity
                      key={st.id}
                      style={[
                        modalStyles.statusCard,
                        isSelected && { borderColor: st.color, backgroundColor: st.bg },
                      ]}
                      onPress={() => setSelected(st.id)}
                      activeOpacity={0.8}
                    >
                      <View style={[modalStyles.statusDot, { backgroundColor: st.color }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={[modalStyles.statusLabel, isSelected && { color: st.color, fontWeight: '700' }]}>
                          {st.label}
                        </Text>
                      </View>
                      {isSelected ? (
                        <Ionicons name="checkmark-circle" size={20} color={st.color} />
                      ) : (
                        <View style={modalStyles.radioEmpty} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Status Note */}
              <Text style={modalStyles.inputLabel}>Status Note (Optional)</Text>
              <TextInput
                placeholder="Reason for change (e.g. Waiting for payment screenshot)..."
                placeholderTextColor="#9CA3AF"
                style={modalStyles.textInput}
                value={note}
                onChangeText={setNote}
              />

              {/* Buttons */}
              <View style={modalStyles.btnRow}>
                <TouchableOpacity style={modalStyles.cancelBtn} onPress={onClose}>
                  <Text style={modalStyles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={modalStyles.confirmBtn} onPress={handleSave}>
                  <Text style={modalStyles.confirmBtnText}>Save Status</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

/**
 * 3. Assign Agent Modal (Figma Assign Agent)
 */
export function AssignAgentModal({
  visible,
  onClose,
  currentAgentId,
  onAssign,
}) {
  const [selectedAgent, setSelectedAgent] = useState(currentAgentId || 'a1');
  const [search, setSearch] = useState('');

  const filteredAgents = TEAM_AGENTS.filter(
    (a) => a.name.toLowerCase().includes(search.toLowerCase()) || a.role.toLowerCase().includes(search.toLowerCase())
  );

  const handleConfirm = () => {
    const agent = TEAM_AGENTS.find((a) => a.id === selectedAgent);
    onAssign(agent);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={modalStyles.overlay}>
          <TouchableWithoutFeedback>
            <View style={modalStyles.dialog}>
              <View style={modalStyles.header}>
                <View style={modalStyles.headerTitleWrap}>
                  <Ionicons name="person-add" size={20} color={COLORS.primaryDark} />
                  <Text style={modalStyles.headerTitle}>Assign Conversation</Text>
                </View>
                <TouchableOpacity onPress={onClose}>
                  <Ionicons name="close" size={22} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {/* Search box */}
              <View style={modalStyles.searchContainer}>
                <Ionicons name="search" size={18} color="#9CA3AF" />
                <TextInput
                  placeholder="Search team member by name or role..."
                  placeholderTextColor="#9CA3AF"
                  style={modalStyles.searchInput}
                  value={search}
                  onChangeText={setSearch}
                />
              </View>

              <FlatList
                data={filteredAgents}
                keyExtractor={(item) => item.id}
                style={{ maxHeight: 260 }}
                renderItem={({ item }) => {
                  const isSelected = selectedAgent === item.id;
                  return (
                    <TouchableOpacity
                      style={[modalStyles.agentRow, isSelected && modalStyles.agentRowActive]}
                      onPress={() => setSelectedAgent(item.id)}
                      activeOpacity={0.7}
                    >
                      <View style={[modalStyles.agentAvatar, { backgroundColor: item.color }]}>
                        <Text style={modalStyles.agentAvatarText}>{item.initials}</Text>
                        {item.online && <View style={modalStyles.onlineIndicator} />}
                      </View>
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={modalStyles.agentName}>{item.name}</Text>
                        <Text style={modalStyles.agentRole}>
                          {item.role} • {item.activeChats} active chats
                        </Text>
                      </View>
                      {isSelected ? (
                        <Ionicons name="checkmark-circle" size={22} color={COLORS.primaryDark} />
                      ) : (
                        <View style={modalStyles.radioEmpty} />
                      )}
                    </TouchableOpacity>
                  );
                }}
              />

              <View style={modalStyles.btnRow}>
                <TouchableOpacity style={modalStyles.cancelBtn} onPress={onClose}>
                  <Text style={modalStyles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={modalStyles.confirmBtn} onPress={handleConfirm}>
                  <Text style={modalStyles.confirmBtnText}>Assign Agent</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

/**
 * 4. Manage Tags Modal (Figma "Manag...")
 */
export function ManageTagsModal({
  visible,
  onClose,
  initialTags = ['VIP Customer', 'Enterprise Deal'],
  onSaveTags,
}) {
  const [selectedTags, setSelectedTags] = useState(initialTags);
  const [newTagInput, setNewTagInput] = useState('');

  const toggleTag = (label) => {
    if (selectedTags.includes(label)) {
      setSelectedTags(selectedTags.filter((t) => t !== label));
    } else {
      setSelectedTags([...selectedTags, label]);
    }
  };

  const handleAddNewTag = () => {
    if (!newTagInput.trim()) return;
    const tag = newTagInput.trim();
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
    setNewTagInput('');
  };

  const handleSave = () => {
    onSaveTags(selectedTags);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={modalStyles.overlay}>
          <TouchableWithoutFeedback>
            <View style={modalStyles.dialog}>
              <View style={modalStyles.header}>
                <View style={modalStyles.headerTitleWrap}>
                  <Ionicons name="pricetags" size={20} color={COLORS.primaryDark} />
                  <Text style={modalStyles.headerTitle}>Manage Contact Tags</Text>
                </View>
                <TouchableOpacity onPress={onClose}>
                  <Ionicons name="close" size={22} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <Text style={modalStyles.subText}>Select or add labels to categorize this conversation</Text>

              {/* Tag Chips Grid */}
              <View style={modalStyles.chipsGrid}>
                {DEFAULT_TAGS.map((t) => {
                  const isAttached = selectedTags.includes(t.label);
                  return (
                    <TouchableOpacity
                      key={t.id}
                      style={[
                        modalStyles.tagChip,
                        { backgroundColor: isAttached ? t.bg : '#F3F4F6', borderColor: isAttached ? t.color : '#E5E7EB' },
                      ]}
                      onPress={() => toggleTag(t.label)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={isAttached ? 'checkmark-circle' : 'add'}
                        size={14}
                        color={isAttached ? t.color : '#6B7280'}
                      />
                      <Text style={[modalStyles.tagChipText, { color: isAttached ? t.color : '#4B5563' }]}>
                        {t.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Create new tag */}
              <Text style={modalStyles.inputLabel}>Create New Label</Text>
              <View style={modalStyles.newTagRow}>
                <TextInput
                  placeholder="e.g. Flight Booking, High Value..."
                  placeholderTextColor="#9CA3AF"
                  style={[modalStyles.textInput, { flex: 1, marginBottom: 0 }]}
                  value={newTagInput}
                  onChangeText={setNewTagInput}
                />
                <TouchableOpacity
                  style={[modalStyles.addTagBtn, !newTagInput.trim() && { opacity: 0.5 }]}
                  onPress={handleAddNewTag}
                  disabled={!newTagInput.trim()}
                >
                  <Ionicons name="add" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <View style={modalStyles.btnRow}>
                <TouchableOpacity style={modalStyles.cancelBtn} onPress={onClose}>
                  <Text style={modalStyles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={modalStyles.confirmBtn} onPress={handleSave}>
                  <Text style={modalStyles.confirmBtnText}>Apply Tags</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

/**
 * 5. Archive Chat Modal (Figma "Archiv...")
 */
export function ArchiveChatModal({
  visible,
  onClose,
  contactName,
  onConfirmArchive,
}) {
  const [autoUnarchive, setAutoUnarchive] = useState(true);
  const [reason, setReason] = useState('resolved');

  const handleArchive = () => {
    onConfirmArchive({ reason, autoUnarchive });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={modalStyles.overlay}>
          <TouchableWithoutFeedback>
            <View style={modalStyles.dialog}>
              <View style={[modalStyles.iconCircle, { backgroundColor: '#F3F4F6' }]}>
                <Ionicons name="archive" size={26} color="#374151" />
              </View>

              <Text style={modalStyles.alertTitle}>Archive Conversation</Text>
              <Text style={modalStyles.alertDesc}>
                Are you sure you want to archive conversation with <Text style={{ fontWeight: '700', color: '#111827' }}>{contactName || 'this contact'}</Text>?
              </Text>

              {/* Archive reason options */}
              <View style={modalStyles.reasonContainer}>
                {[
                  { id: 'resolved', label: 'Issue successfully resolved' },
                  { id: 'inactive', label: 'Customer stopped responding' },
                  { id: 'spam', label: 'Spam or irrelevant enquiry' },
                ].map((r) => (
                  <TouchableOpacity
                    key={r.id}
                    style={modalStyles.reasonRow}
                    onPress={() => setReason(r.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={reason === r.id ? 'radio-button-on' : 'radio-button-off'}
                      size={18}
                      color={reason === r.id ? COLORS.primaryDark : '#9CA3AF'}
                    />
                    <Text style={modalStyles.reasonText}>{r.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Auto Unarchive Toggle */}
              <View style={modalStyles.toggleRow}>
                <View style={{ flex: 1 }}>
                  <Text style={modalStyles.toggleTitle}>Auto-unarchive on reply</Text>
                  <Text style={modalStyles.toggleSub}>Return to inbox if customer messages</Text>
                </View>
                <Switch
                  value={autoUnarchive}
                  onValueChange={setAutoUnarchive}
                  trackColor={{ false: '#D1D5DB', true: COLORS.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={modalStyles.btnRow}>
                <TouchableOpacity style={modalStyles.cancelBtn} onPress={onClose}>
                  <Text style={modalStyles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[modalStyles.confirmBtn, { backgroundColor: '#374151' }]}
                  onPress={handleArchive}
                >
                  <Text style={modalStyles.confirmBtnText}>Archive Chat</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

/**
 * 6. Clear Chat Modal (Figma "Clear...")
 */
export function ClearChatModal({
  visible,
  onClose,
  contactName,
  onConfirmClear,
}) {
  const [deleteMedia, setDeleteMedia] = useState(false);

  const handleClear = () => {
    onConfirmClear({ deleteMedia });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={modalStyles.overlay}>
          <TouchableWithoutFeedback>
            <View style={modalStyles.dialog}>
              <View style={[modalStyles.iconCircle, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="trash" size={26} color="#DC2626" />
              </View>

              <Text style={modalStyles.alertTitle}>Clear Chat History?</Text>
              <Text style={modalStyles.alertDesc}>
                This will delete all messages and conversation history with{' '}
                <Text style={{ fontWeight: '700', color: '#111827' }}>{contactName || 'this contact'}</Text>.
                This action cannot be undone.
              </Text>

              {/* Checkbox option */}
              <TouchableOpacity
                style={modalStyles.checkboxRow}
                onPress={() => setDeleteMedia(!deleteMedia)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={deleteMedia ? 'checkbox' : 'square-outline'}
                  size={20}
                  color={deleteMedia ? '#DC2626' : '#9CA3AF'}
                />
                <Text style={modalStyles.checkboxText}>Also delete media files & documents</Text>
              </TouchableOpacity>

              <View style={modalStyles.btnRow}>
                <TouchableOpacity style={modalStyles.cancelBtn} onPress={onClose}>
                  <Text style={modalStyles.cancelBtnText}>Keep Messages</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[modalStyles.confirmBtn, { backgroundColor: '#DC2626' }]}
                  onPress={handleClear}
                >
                  <Text style={modalStyles.confirmBtnText}>Clear Chat</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const sheetStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    maxHeight: '85%',
  },
  dragBarContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  dragBar: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginBottom: 8,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  headerTextWrap: {
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  headerSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  actionsList: {
    paddingTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
  },
  actionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  actionDesc: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 6,
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  dialog: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 8,
  },
  subText: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 14,
  },
  listContainer: {
    marginBottom: 12,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
  },
  radioEmpty: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#111827',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: '#111827',
  },
  agentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginBottom: 6,
  },
  agentRowActive: {
    backgroundColor: '#ECFDF5',
  },
  agentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  agentAvatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  agentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  agentRole: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  chipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    gap: 5,
  },
  tagChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  newTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  addTagBtn: {
    backgroundColor: COLORS.primaryDark,
    width: 42,
    height: 42,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 14,
  },
  alertTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 6,
  },
  alertDesc: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  reasonContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
  },
  reasonText: {
    fontSize: 13,
    color: '#374151',
    marginLeft: 8,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 16,
  },
  toggleTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  toggleSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    alignSelf: 'center',
  },
  checkboxText: {
    fontSize: 13,
    color: '#4B5563',
    marginLeft: 8,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: COLORS.primaryDark,
    alignItems: 'center',
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
