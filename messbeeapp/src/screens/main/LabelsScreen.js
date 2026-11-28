import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Modal,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { labelService } from '../../services/api';

const DEFAULT_LABELS = [
  {
    _id: 'lbl_1',
    name: 'Sumit yadav',
    description: 'ux designer',
    color: '#F59E0B',
    creator: 'Admission Anytime',
    contactsCount: 0,
  },
];

export default function LabelsScreen({ navigation }) {
  const [labels, setLabels] = useState(DEFAULT_LABELS);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterOption, setFilterOption] = useState('All labels');

  // Load from real DB API
  const loadLabels = useCallback(async () => {
    try {
      const data = await labelService.getLabels();
      if (Array.isArray(data) && data.length > 0) {
        const mapped = data.map((item, idx) => ({
          _id: item._id || item.id || `lbl_${idx}`,
          name: item.name || `Label ${idx + 1}`,
          description: item.desc || item.description || '',
          color: item.color || '#F59E0B',
          creator: item.creator || 'Admission Anytime',
          contactsCount: item.contactsCount || 0,
        }));
        setLabels(mapped);
      }
    } catch (err) {
      console.warn('loadLabels error:', err);
    }
  }, []);

  useEffect(() => {
    loadLabels();
  }, [loadLabels]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLabels();
    setRefreshing(false);
  };

  const filteredLabels = useMemo(() => {
    return labels.filter((lbl) => {
      if (filterOption === 'With Description' && !lbl.description) return false;
      if (filterOption === 'No Description' && lbl.description) return false;

      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        return lbl.name.toLowerCase().includes(q) || (lbl.description && lbl.description.toLowerCase().includes(q));
      }
      return true;
    });
  }, [labels, searchQuery, filterOption]);

  const handleDeleteLabel = async (lbl) => {
    Alert.alert('Delete Label', `Are you sure you want to delete "${lbl.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await labelService.deleteLabel(lbl._id);
          } catch (_) {}
          setLabels(labels.filter((item) => item._id !== lbl._id));
        },
      },
    ]);
  };

  const renderLabelItem = ({ item }) => {
    return (
      <View style={styles.labelCard}>
        {/* Left Tag Icon in squircle */}
        <View style={[styles.tagSquare, { backgroundColor: item.color + '20' }]}>
          <Ionicons name="pricetag" size={20} color={item.color} />
        </View>

        {/* Content Col */}
        <View style={styles.labelContentCol}>
          <Text style={styles.labelName}>{item.name}</Text>
          {item.description ? (
            <Text style={styles.labelDescription}>{item.description}</Text>
          ) : null}

          {/* Color Badge */}
          <View style={styles.colorPill}>
            <View style={[styles.colorDot, { backgroundColor: item.color }]} />
            <Text style={styles.colorText}>{item.color}</Text>
          </View>

          {/* Creator */}
          <View style={styles.creatorRow}>
            <View style={styles.creatorAvatarSmall}>
              <Text style={styles.creatorAvatarText}>AA</Text>
            </View>
            <Text style={styles.creatorText}>Created by {item.creator}</Text>
          </View>
        </View>

        {/* Right Actions: Edit, Delete, More */}
        <View style={styles.rightActionsCol}>
          <TouchableOpacity
            style={styles.actionIconBtn}
            onPress={() => navigation.navigate('EditLabel', { label: item })}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="create-outline" size={17} color="#64748B" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionIconBtn}
            onPress={() => handleDeleteLabel(item)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="trash-outline" size={17} color="#EF4444" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionIconBtn}
            onPress={() => navigation.navigate('LabelDetails', { label: item })}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="ellipsis-horizontal" size={17} color="#94A3B8" />
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

        <View style={styles.headerTitleBox}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.headerTitle}>Labels</Text>
            <View style={styles.counterBadge}>
              <Text style={styles.counterText}>{labels.length}</Text>
            </View>
          </View>
          <Text style={styles.headerSubtitle}>Manage and organise contact labels from one place.</Text>
        </View>

        <TouchableOpacity style={styles.addLabelTopBtn} onPress={() => navigation.navigate('AddLabel')}>
          <Ionicons name="add" size={16} color="#FFFFFF" style={{ marginRight: 2 }} />
          <Text style={styles.addLabelTopBtnText}>Add Label</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredLabels}
        keyExtractor={(item) => item._id}
        renderItem={renderLabelItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#00875A']} />}
        ListHeaderComponent={
          <>
            {/* Total Labels Summary Card (Image 3 Screen 1) */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryTagIconBox}>
                <Ionicons name="pricetag" size={22} color="#00875A" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.summaryLabel}>Total Labels</Text>
                <Text style={styles.summaryCount}>{labels.length}</Text>
                <Text style={styles.summarySubtitle}>Organise contacts with custom labels.</Text>
              </View>
            </View>

            {/* Search Bar with filter icon */}
            <View style={styles.searchRow}>
              <View style={styles.searchBox}>
                <Ionicons name="search-outline" size={17} color="#94A3B8" style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="Search labels..."
                  placeholderTextColor="#94A3B8"
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>

              <TouchableOpacity
                style={styles.filterIconBtn}
                onPress={() => setShowFilterModal(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="options-outline" size={20} color="#0F172A" />
              </TouchableOpacity>
            </View>

            {/* List Section Header */}
            <View style={styles.listSectionHeader}>
              <Text style={styles.sectionTitle}>
                {filteredLabels.length} label • All Labels
              </Text>
              <View style={styles.recentlyCreatedRow}>
                <Ionicons name="swap-vertical" size={14} color="#64748B" style={{ marginRight: 4 }} />
                <Text style={styles.recentlyCreatedText}>Recently Created</Text>
              </View>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="pricetag-outline" size={44} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No labels found</Text>
            <Text style={styles.emptySubtitle}>Tap "+ Add Label" to create your first label.</Text>
          </View>
        }
      />

      {/* ================= FILTER LABELS MODAL (Image 3 Screen 6) ================= */}
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

            <View style={styles.filterOptionsContainer}>
              {['All labels', 'With Description', 'No Description'].map((opt) => {
                const isSelected = filterOption === opt;
                return (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.filterSelectRow, isSelected && styles.filterSelectRowActive]}
                    onPress={() => setFilterOption(opt)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.filterSelectText, isSelected && styles.filterSelectTextActive]}>
                      {opt}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.filterActionsRow}>
              <TouchableOpacity
                style={styles.resetBtn}
                onPress={() => {
                  setFilterOption('All labels');
                  setShowFilterModal(false);
                }}
              >
                <Text style={styles.resetBtnText}>Reset</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.applyBtn}
                onPress={() => setShowFilterModal(false)}
              >
                <Text style={styles.applyBtnText}>Apply Filters</Text>
              </TouchableOpacity>
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
    paddingTop: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
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
  counterBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
    marginLeft: 6,
  },
  counterText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#166534',
  },
  headerSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  addLabelTopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00875A',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  addLabelTopBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  listContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 12,
  },

  // Summary Card
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  summaryTagIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  summaryLabel: {
    fontSize: 11.5,
    color: '#15803D',
    fontWeight: '600',
  },
  summaryCount: {
    fontSize: 22,
    fontWeight: '800',
    color: '#166534',
    marginVertical: 1,
  },
  summarySubtitle: {
    fontSize: 12,
    color: '#15803D',
  },

  // Search
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
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
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
  },
  filterIconBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // List Section Header
  listSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  recentlyCreatedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentlyCreatedText: {
    fontSize: 12,
    color: '#64748B',
  },

  // Label Card (Image 3 Screen 1)
  labelCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tagSquare: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  labelContentCol: {
    flex: 1,
  },
  labelName: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  labelDescription: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  colorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  colorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  colorText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  creatorAvatarSmall: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  creatorAvatarText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#166534',
  },
  creatorText: {
    fontSize: 11,
    color: '#64748B',
  },
  rightActionsCol: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 8,
  },
  actionIconBtn: {
    padding: 4,
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

  // Modal
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
  filterOptionsContainer: {
    gap: 10,
    marginBottom: 20,
  },
  filterSelectRow: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterSelectRowActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#00875A',
  },
  filterSelectText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#475569',
  },
  filterSelectTextActive: {
    color: '#00875A',
    fontWeight: '700',
  },
  filterActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  resetBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  resetBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  applyBtn: {
    flex: 1.5,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00875A',
  },
  applyBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
