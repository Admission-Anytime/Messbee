import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  RefreshControl,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { contactGroupService, contactService } from '../../services/api';

export default function ContactGroupsScreen({ navigation }) {
  const [groups, setGroups] = useState([]);
  const [allContacts, setAllContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Group Create/Edit Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [groupTags, setGroupTags] = useState('');
  const [selectedContactIds, setSelectedContactIds] = useState([]);
  const [contactFilterQuery, setContactFilterQuery] = useState('');
  const [saving, setSaving] = useState(false);

  // Group Members Preview Modal State
  const [membersModalVisible, setMembersModalVisible] = useState(false);
  const [activeViewGroup, setActiveViewGroup] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const fetchGroupsAndContacts = useCallback(async () => {
    try {
      const [groupsData, contactsData] = await Promise.all([
        contactGroupService.getContactGroups(),
        contactService.getContacts().catch(() => []),
      ]);
      setGroups(Array.isArray(groupsData) ? groupsData : []);
      setAllContacts(Array.isArray(contactsData) ? contactsData : []);
    } catch (err) {
      console.warn('fetchGroupsAndContacts error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchGroupsAndContacts();
  }, [fetchGroupsAndContacts]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchGroupsAndContacts();
  };

  const openAddModal = () => {
    setEditingGroup(null);
    setGroupName('');
    setGroupDesc('');
    setGroupTags('');
    setSelectedContactIds([]);
    setContactFilterQuery('');
    setModalVisible(true);
  };

  const openEditModal = (group) => {
    setEditingGroup(group);
    setGroupName(group.name || '');
    setGroupDesc(group.description || '');
    setGroupTags(Array.isArray(group.tags) ? group.tags.join(', ') : '');
    setSelectedContactIds(Array.isArray(group.contacts) ? group.contacts.map((c) => (typeof c === 'object' ? c._id : c)) : []);
    setContactFilterQuery('');
    setModalVisible(true);
  };

  const openMembersPreview = async (group) => {
    setActiveViewGroup(group);
    setMembersModalVisible(true);
    setLoadingMembers(true);
    try {
      const details = await contactGroupService.getContactGroup(group._id);
      setGroupMembers(details?.contacts || []);
    } catch (err) {
      setGroupMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  };

  const toggleSelectContact = (id) => {
    setSelectedContactIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSaveGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Required', 'Please enter an audience group name.');
      return;
    }

    const tagsArray = groupTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      name: groupName.trim(),
      description: groupDesc.trim(),
      tags: tagsArray,
      contacts: selectedContactIds,
    };

    setSaving(true);
    try {
      if (editingGroup) {
        await contactGroupService.updateContactGroup(editingGroup._id, payload);
        Alert.alert('Success', 'Audience group updated successfully!');
      } else {
        await contactGroupService.createContactGroup(payload);
        Alert.alert('Success', 'New audience group created!');
      }
      setModalVisible(false);
      fetchGroupsAndContacts();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || err.message || 'Failed to save audience group.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGroup = (group) => {
    Alert.alert(
      'Delete Audience Group',
      `Are you sure you want to delete "${group.name}"? Contacts will not be deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setGroups((prev) => prev.filter((g) => g._id !== group._id));
            try {
              await contactGroupService.deleteContactGroup(group._id);
            } catch (err) {
              Alert.alert('Error', 'Failed to delete group.');
              fetchGroupsAndContacts();
            }
          },
        },
      ]
    );
  };

  // Filter groups
  const filteredGroups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter((g) => {
      const nameMatch = (g.name || '').toLowerCase().includes(q);
      const descMatch = (g.description || '').toLowerCase().includes(q);
      const tagsMatch = (g.tags || []).some((t) => t.toLowerCase().includes(q));
      return nameMatch || descMatch || tagsMatch;
    });
  }, [groups, searchQuery]);

  // Filter contacts inside modal
  const filteredModalContacts = useMemo(() => {
    const q = contactFilterQuery.trim().toLowerCase();
    if (!q) return allContacts;
    return allContacts.filter((c) => {
      const name = (c.name || c.firstName || '').toLowerCase();
      const phone = (c.phone || c.whatsapp || '').toLowerCase();
      return name.includes(q) || phone.includes(q);
    });
  }, [allContacts, contactFilterQuery]);

  const totalAudience = useMemo(() => {
    return groups.reduce((acc, g) => acc + (g.totalContacts || (g.contacts || []).length || 0), 0);
  }, [groups]);

  const renderGroupCard = ({ item }) => {
    const contactCount = item.totalContacts !== undefined ? item.totalContacts : (item.contacts || []).length;
    const tags = Array.isArray(item.tags) ? item.tags : [];

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.iconBox}>
            <Ionicons name="people-circle-outline" size={26} color="#00B67A" />
          </View>
          <View style={styles.groupInfo}>
            <Text style={styles.groupName} numberOfLines={1}>
              {item.name}
            </Text>
            {item.description ? (
              <Text style={styles.groupDesc} numberOfLines={2}>
                {item.description}
              </Text>
            ) : null}
          </View>

          <View style={styles.actionIcons}>
            <TouchableOpacity
              onPress={() => openEditModal(item)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="pencil-outline" size={18} color="#0284C7" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDeleteGroup(item)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>

        {tags.length > 0 && (
          <View style={styles.tagsRow}>
            {tags.map((t, idx) => (
              <View key={idx} style={styles.tagBadge}>
                <Text style={styles.tagText}>#{t}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.cardFooter}>
          <TouchableOpacity
            style={styles.memberCountBadge}
            onPress={() => openMembersPreview(item)}
            activeOpacity={0.8}
          >
            <Ionicons name="people-outline" size={14} color="#00B67A" />
            <Text style={styles.memberCountText}>{contactCount} Contacts</Text>
            <Ionicons name="chevron-forward" size={12} color="#00B67A" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.broadcastBtn}
            onPress={() => navigation.navigate('BroadcastCampaigns')}
            activeOpacity={0.8}
          >
            <Ionicons name="megaphone-outline" size={14} color="#FFFFFF" />
            <Text style={styles.broadcastBtnText}>Broadcast</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
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
        <Text style={styles.headerTitle}>Audience Groups</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Group</Text>
        </TouchableOpacity>
      </View>

      {/* KPI Stats Strip */}
      <View style={styles.kpiStrip}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Total Groups</Text>
          <Text style={[styles.kpiNumber, { color: '#0F172A' }]}>{groups.length}</Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Segmented Audience</Text>
          <Text style={[styles.kpiNumber, { color: '#00B67A' }]}>{totalAudience}</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search groups by name or tag..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#00B67A" />
          <Text style={styles.loadingText}>Loading audience groups...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredGroups}
          keyExtractor={(item) => item._id || Math.random().toString()}
          renderItem={renderGroupCard}
          contentContainerStyle={[
            styles.listContent,
            filteredGroups.length === 0 && { flex: 1, justifyContent: 'center' },
          ]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#00B67A']} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="people-outline" size={44} color="#94A3B8" />
              </View>
              <Text style={styles.emptyTitle}>No audience groups yet</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? 'No groups matched your search filter.'
                  : 'Group your contacts into segments (e.g., VIP, Leads, Subscribers) to send targeted WhatsApp campaigns.'}
              </Text>
              <TouchableOpacity style={styles.emptyActionBtn} onPress={openAddModal}>
                <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
                <Text style={styles.emptyActionText}>Create First Group</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* Create / Edit Group Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingGroup ? 'Edit Audience Group' : 'Create Audience Group'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalForm} showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Group Name *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. VIP Customers, Weekend Promo Leads"
                value={groupName}
                onChangeText={setGroupName}
              />

              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Describe audience segment purpose..."
                value={groupDesc}
                onChangeText={setGroupDesc}
                multiline
                numberOfLines={2}
              />

              <Text style={styles.inputLabel}>Tags (comma-separated)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. vip, retail, lead"
                value={groupTags}
                onChangeText={setGroupTags}
              />

              <View style={styles.contactSelectHeader}>
                <Text style={styles.inputLabel}>
                  Select Contacts ({selectedContactIds.length} chosen)
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    if (selectedContactIds.length === allContacts.length) {
                      setSelectedContactIds([]);
                    } else {
                      setSelectedContactIds(allContacts.map((c) => c._id));
                    }
                  }}
                >
                  <Text style={styles.selectToggleText}>
                    {selectedContactIds.length === allContacts.length ? 'Clear all' : 'Select all'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Filter contacts in modal */}
              <View style={styles.modalSearchBar}>
                <Ionicons name="search" size={16} color="#94A3B8" />
                <TextInput
                  style={styles.modalSearchInput}
                  placeholder="Filter contacts..."
                  value={contactFilterQuery}
                  onChangeText={setContactFilterQuery}
                />
              </View>

              <View style={styles.contactsScrollBox}>
                <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={true}>
                  {filteredModalContacts.map((c) => {
                    const isSelected = selectedContactIds.includes(c._id);
                    const name = c.name || c.firstName || 'Contact';
                    const phone = c.phone || c.whatsapp || '';

                    return (
                      <TouchableOpacity
                        key={c._id}
                        style={[styles.contactRow, isSelected && styles.contactRowSelected]}
                        onPress={() => toggleSelectContact(c._id)}
                      >
                        <Ionicons
                          name={isSelected ? 'checkbox' : 'square-outline'}
                          size={20}
                          color={isSelected ? '#00B67A' : '#94A3B8'}
                        />
                        <View style={{ flex: 1, marginLeft: 10 }}>
                          <Text style={styles.contactRowName}>{name}</Text>
                          {phone ? <Text style={styles.contactRowPhone}>{phone}</Text> : null}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              <TouchableOpacity
                style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                onPress={handleSaveGroup}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveBtnText}>
                    {editingGroup ? 'Save Changes' : 'Create Group'}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Preview Members Modal */}
      <Modal
        visible={membersModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setMembersModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{activeViewGroup?.name || 'Group Members'}</Text>
                <Text style={styles.modalSubtitle}>
                  {groupMembers.length} Contact{groupMembers.length !== 1 ? 's' : ''} in segment
                </Text>
              </View>
              <TouchableOpacity onPress={() => setMembersModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            {loadingMembers ? (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <ActivityIndicator size="small" color="#00B67A" />
              </View>
            ) : (
              <FlatList
                data={groupMembers}
                keyExtractor={(item) => item._id || Math.random().toString()}
                renderItem={({ item }) => (
                  <View style={styles.memberListItem}>
                    <View style={styles.memberAvatar}>
                      <Ionicons name="person" size={16} color="#00B67A" />
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.memberName}>{item.name || item.firstName || 'Contact'}</Text>
                      <Text style={styles.memberPhone}>{item.phone || item.whatsapp || 'No phone'}</Text>
                    </View>
                  </View>
                )}
                contentContainerStyle={{ padding: 16 }}
                ListEmptyComponent={
                  <View style={{ padding: 30, alignItems: 'center' }}>
                    <Text style={{ color: '#94A3B8', fontSize: 13 }}>No contacts in this group yet.</Text>
                  </View>
                }
              />
            )}
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00B67A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  kpiStrip: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
  },
  kpiNumber: {
    fontSize: 18,
    fontWeight: '800',
  },
  searchSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 38,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#E8F8F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  groupDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  actionIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginLeft: 8,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 6,
  },
  tagBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  memberCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  memberCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00B67A',
  },
  broadcastBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00B67A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  broadcastBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00B67A',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  emptyActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  modalForm: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
    marginTop: 10,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 60,
    textAlignVertical: 'top',
  },
  contactSelectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  selectToggleText: {
    fontSize: 12,
    color: '#00B67A',
    fontWeight: '600',
  },
  modalSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 36,
    marginBottom: 8,
    gap: 6,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
  },
  contactsScrollBox: {
    height: 180,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  contactRowSelected: {
    backgroundColor: '#F0FDF4',
  },
  contactRowName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  contactRowPhone: {
    fontSize: 11,
    color: '#64748B',
  },
  saveBtn: {
    backgroundColor: '#00B67A',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  // Member preview items
  memberListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  memberAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F8F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  memberPhone: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
});
