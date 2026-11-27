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
import { contactService, pipelineService, chatService } from '../../services/api';

const STAGES = [
  { id: 'Active', label: 'Active', color: '#16A34A', bg: '#DCFCE7', barBg: '#D1FAE5', barText: '#065F46' },
  { id: 'Warm', label: 'Warm', color: '#EA580C', bg: '#FFEDD5', barBg: '#FED7AA', barText: '#9A3412' },
  { id: 'Cold', label: 'Cold', color: '#2563EB', bg: '#DBEAFE', barBg: '#C7D2FE', barText: '#3730A3' },
  { id: 'Inactive', label: 'Inactive', color: '#64748B', bg: '#F1F5F9', barBg: '#F1F5F9', barText: '#334155' },
];

export default function CrmPipelineScreen({ navigation }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStage, setActiveStage] = useState('Active');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Modals
  const [selectedLead, setSelectedLead] = useState(null);
  const [showStageModal, setShowStageModal] = useState(false);

  // Load from DB
  const loadLeads = useCallback(async () => {
    try {
      const data = await contactService.getContacts();
      if (Array.isArray(data)) {
        const mapped = data.map((item, idx) => {
          const rawName = item.name || item.firstName || `Lead ${idx + 1}`;
          const initials = rawName
            .split(' ')
            .map((p) => p[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

          const stage = item.stage || (item.status === 'Active' ? 'Active' : 'Warm');
          const subTag =
            Array.isArray(item.labels) && item.labels.length > 0
              ? typeof item.labels[0] === 'object'
                ? item.labels[0].name
                : item.labels[0]
              : 'Cold lead';

          return {
            _id: item._id || item.id || `lead_${idx}`,
            name: rawName,
            phone: item.phone || item.phoneNumber || '+91 0000000000',
            subtitle: 'Contact Lead',
            stage,
            subTag,
            initials: initials || 'LE',
          };
        });
        setLeads(mapped);
      } else {
        setLeads([]);
      }
    } catch (err) {
      console.warn('loadLeads error:', err);
      setLeads([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadLeads();
    const unsubscribe = navigation.addListener('focus', () => {
      loadLeads();
    });
    return unsubscribe;
  }, [navigation, loadLeads]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLeads();
    setRefreshing(false);
  };

  // Stage counts
  const stageCounts = useMemo(() => {
    const counts = { Active: 0, Warm: 0, Cold: 0, Inactive: 0 };
    leads.forEach((l) => {
      if (counts[l.stage] !== undefined) {
        counts[l.stage]++;
      } else {
        counts.Active++;
      }
    });
    return counts;
  }, [leads]);

  // Filtered by stage & search
  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const matchesStage = l.stage === activeStage;
      if (!matchesStage) return false;
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        return (
          l.name.toLowerCase().includes(q) ||
          l.phone.toLowerCase().includes(q) ||
          l.subTag.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [leads, activeStage, searchQuery]);

  const handleChangeStage = async (newStage) => {
    if (!selectedLead) return;
    try {
      await pipelineService.updateLeadStage(selectedLead._id, newStage);
    } catch (_) {}

    setLeads(
      leads.map((l) => (l._id === selectedLead._id ? { ...l, stage: newStage } : l))
    );
    setShowStageModal(false);
    setSelectedLead(null);
    Alert.alert('Stage Updated', `Moved ${selectedLead.name} to ${newStage}.`);
  };

  const handleDeleteLead = async () => {
    if (!selectedLead) return;
    Alert.alert('Delete Lead', `Are you sure you want to delete ${selectedLead.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await contactService.deleteContact(selectedLead._id);
          } catch (_) {}
          setLeads(leads.filter((l) => l._id !== selectedLead._id));
          setSelectedLead(null);
        },
      },
    ]);
  };

  const renderLeadCard = ({ item }) => {
    return (
      <View style={styles.leadCard}>
        {/* Avatar circle */}
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitials}>{item.initials}</Text>
        </View>

        {/* Info */}
        <View style={styles.leadInfoCol}>
          <View style={styles.nameRow}>
            <Text style={styles.leadName}>{item.name}</Text>
            <TouchableOpacity
              onPress={() => setSelectedLead(item)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="ellipsis-horizontal" size={17} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <Text style={styles.leadSubtitle}>{item.subtitle}</Text>
          <Text style={styles.leadPhone}>📞 {item.phone}</Text>

          {/* Chips */}
          <View style={styles.chipsRow}>
            <View style={styles.coldChip}>
              <View style={styles.blueDot} />
              <Text style={styles.coldChipText}>{item.subTag}</Text>
            </View>

            <View style={styles.activeChip}>
              <View style={styles.greenDot} />
              <Text style={styles.activeChipText}>{item.stage}</Text>
            </View>
          </View>
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

        <View style={styles.headerTitleBox}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.headerTitle}>CRM Pipeline</Text>
            <View style={styles.headerCounterBadge}>
              <Text style={styles.headerCounterText}>{leads.length}</Text>
            </View>
          </View>
          <Text style={styles.headerSubtitle}>Manage and track deal stages for your contacts.</Text>
        </View>

        <TouchableOpacity
          style={styles.moreHeaderBtn}
          onPress={() => navigation.navigate('CustomFields')}
        >
          <Ionicons name="ellipsis-horizontal" size={20} color="#0F172A" />
        </TouchableOpacity>
      </View>

      {/* Action Bar (Search icon, Refresh icon, Configure pill, + Add Lead) */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.iconCircleBtn} onPress={onRefresh}>
          <Ionicons name="search-outline" size={18} color="#0F172A" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconCircleBtn} onPress={onRefresh}>
          <Ionicons name="refresh-outline" size={18} color="#0F172A" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.configureBtn}
          onPress={() => Alert.alert('Configure', 'Customize CRM stages and pipeline view.')}
        >
          <Text style={styles.configureBtnText}>Configure</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addLeadBtn}
          onPress={() => navigation.navigate('AddContact')}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={18} color="#FFFFFF" style={{ marginRight: 4 }} />
          <Text style={styles.addLeadBtnText}>Add Lead</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={17} color="#94A3B8" style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search leads, phone, company..."
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Stage Filter Pills (Active 1, Warm 0, Cold 0, Inactive 0) */}
      <View style={styles.stagesBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stagesList}>
          {STAGES.map((s) => {
            const isSelected = activeStage === s.id;
            const count = stageCounts[s.id] || 0;
            return (
              <TouchableOpacity
                key={s.id}
                style={[styles.stagePill, isSelected && styles.stagePillActive]}
                onPress={() => setActiveStage(s.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.stageDot, { backgroundColor: s.color }]} />
                <Text style={[styles.stagePillText, isSelected && styles.stagePillTextActive]}>
                  {s.label} {count}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* List Header */}
      <View style={styles.listHeaderRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={styles.greenStatusDot} />
          <Text style={styles.listHeaderTitle}>
            {activeStage} {filteredLeads.length} lead{filteredLeads.length === 1 ? '' : 's'}
          </Text>
        </View>

        <TouchableOpacity style={styles.recentlyAddedRow}>
          <Ionicons name="swap-vertical" size={14} color="#64748B" style={{ marginRight: 4 }} />
          <Text style={styles.recentlyAddedText}>Recently Added</Text>
        </TouchableOpacity>
      </View>

      {/* Leads FlatList */}
      <FlatList
        data={filteredLeads}
        keyExtractor={(item) => item._id}
        renderItem={renderLeadCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#00875A']} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={44} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No {activeStage.toLowerCase()} leads</Text>
            <Text style={styles.emptySubtitle}>Tap "+ Add Lead" to create a new lead.</Text>
          </View>
        }
      />

      {/* ================= LEAD ACTIONS MODAL (Image 2 Screen 3) ================= */}
      <Modal
        visible={Boolean(selectedLead && !showStageModal)}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedLead(null)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setSelectedLead(null)}
        >
          <View style={styles.sheetDialog} onStartShouldSetResponder={() => true}>
            <View style={styles.sheetHandle} />

            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Lead Actions</Text>
              <TouchableOpacity onPress={() => setSelectedLead(null)}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.actionRowItem}
              onPress={() => {
                const lead = selectedLead;
                setSelectedLead(null);
                navigation.navigate('ContactProfile', { contact: lead });
              }}
            >
              <Ionicons name="person-add-outline" size={19} color="#0F172A" style={{ marginRight: 12 }} />
              <Text style={styles.actionItemText}>View Lead Details</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionRowItem}
              onPress={() => {
                const lead = selectedLead;
                setSelectedLead(null);
                navigation.navigate('EditContactProfile', { contact: lead });
              }}
            >
              <Ionicons name="create-outline" size={19} color="#0F172A" style={{ marginRight: 12 }} />
              <Text style={styles.actionItemText}>Edit Lead</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionRowItem}
              onPress={() => setShowStageModal(true)}
            >
              <Ionicons name="swap-vertical" size={19} color="#0F172A" style={{ marginRight: 12 }} />
              <Text style={styles.actionItemText}>Change Stage</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionRowItem}
              onPress={async () => {
                const lead = selectedLead;
                setSelectedLead(null);
                try {
                  const created = await chatService.createChat({
                    name: lead.name,
                    phone: lead.phone,
                  });
                  navigation.navigate('ChatDetail', {
                    chat: {
                      _id: created?._id || created?.id,
                      name: created?.name || lead.name,
                      phone: created?.phone || lead.phone,
                      avatarText: lead.initials,
                      avatarBg: '#D1FAE5',
                      avatarColor: '#065F46',
                    },
                  });
                } catch (err) {
                  Alert.alert('Error', err?.response?.data?.error || err?.message || 'Could not open chat.');
                }
              }}
            >
              <Ionicons name="chatbubble-outline" size={19} color="#0F172A" style={{ marginRight: 12 }} />
              <Text style={styles.actionItemText}>Open Chat</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionRowItem}
              onPress={() => {
                setSelectedLead(null);
                Alert.alert('Assign Labels', 'Manage labels for this lead.');
              }}
            >
              <Ionicons name="pricetag-outline" size={19} color="#0F172A" style={{ marginRight: 12 }} />
              <Text style={styles.actionItemText}>Assign Labels</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity style={styles.actionRowItem} onPress={handleDeleteLead}>
              <Ionicons name="trash-outline" size={19} color="#EF4444" style={{ marginRight: 12 }} />
              <Text style={[styles.actionItemText, { color: '#EF4444' }]}>Delete Lead</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ================= STAGE SELECTOR MODAL (Image 3 Screen 2) ================= */}
      <Modal
        visible={showStageModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowStageModal(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowStageModal(false)}
        >
          <View style={styles.sheetDialog} onStartShouldSetResponder={() => true}>
            <View style={styles.sheetHandle} />

            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Stage</Text>
              <TouchableOpacity onPress={() => setShowStageModal(false)}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.stageOptionsBox}>
              {STAGES.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  style={[styles.stageBarBtn, { backgroundColor: s.barBg }]}
                  onPress={() => handleChangeStage(s.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.stageBarBtnText, { color: s.barText }]}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
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
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerCounterBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
    marginLeft: 6,
  },
  headerCounterText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#166534',
  },
  headerSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  moreHeaderBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Action Row
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  iconCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  configureBtn: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  configureBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  addLeadBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00875A',
    borderRadius: 12,
    paddingVertical: 10,
  },
  addLeadBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Search
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
  },

  // Stages Filter Bar
  stagesBar: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 10,
  },
  stagesList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  stagePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  stagePillActive: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  stageDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  stagePillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  stagePillTextActive: {
    color: '#166534',
    fontWeight: '700',
  },

  // List Header
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  greenStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  listHeaderTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  recentlyAddedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentlyAddedText: {
    fontSize: 12,
    color: '#64748B',
  },

  // Lead Card
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 10,
  },
  leadCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
  leadInfoCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leadName: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  leadSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  leadPhone: {
    fontSize: 12,
    color: '#334155',
    marginTop: 4,
    fontWeight: '500',
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  coldChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  blueDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#2563EB',
    marginRight: 5,
  },
  coldChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1E40AF',
  },
  activeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  greenDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#16A34A',
    marginRight: 5,
  },
  activeChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  emptyTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },

  // Modal Sheet
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
  actionRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  actionItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },

  // Stage Selector (Image 3 Screen 2)
  stageOptionsBox: {
    gap: 12,
    marginVertical: 10,
  },
  stageBarBtn: {
    width: '100%',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageBarBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
