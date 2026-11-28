import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Modal,
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { statusService, authService } from '../../services/api';
import MainBottomBar from '../../components/MainBottomBar';

const COLOR_PALETTE = [
  '#00B67A', // Emerald green
  '#3B82F6', // Blue
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
];

export default function StatusScreen({ navigation }) {
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // 'ALL', 'ACTIVE', 'INACTIVE'
  const [userProfile, setUserProfile] = useState(null);

  // Modals
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formColor, setFormColor] = useState('#00B67A');
  const [formActive, setFormActive] = useState(true);

  // Toast
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const loadData = useCallback(async () => {
    try {
      const [statusList, user] = await Promise.all([
        statusService.getStatuses(),
        authService.getCurrentUser().catch(() => null),
      ]);
      setStatuses(Array.isArray(statusList) ? statusList : []);
      if (user) setUserProfile(user);
    } catch (err) {
      console.warn('Error loading statuses:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation, loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const openCreateModal = () => {
    setFormName('');
    setFormDescription('');
    setFormColor('#00B67A');
    setFormActive(true);
    setCreateModalVisible(true);
  };

  const openEditModal = (status) => {
    setSelectedStatus(status);
    setFormName(status.name || '');
    setFormDescription(status.description || '');
    setFormColor(status.color || '#00B67A');
    setFormActive(status.isActive !== false);
    setEditModalVisible(true);
  };

  const openDeleteModal = (status) => {
    setSelectedStatus(status);
    setDeleteModalVisible(true);
  };

  const handleCreateStatus = async () => {
    if (!formName.trim()) {
      Alert.alert('Required', 'Please enter a status name.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newStatus = await statusService.createStatus({
        name: formName.trim(),
        description: formDescription.trim(),
        color: formColor,
        isActive: formActive,
      });

      setStatuses((prev) => [newStatus, ...prev]);
      setCreateModalVisible(false);
      showToast('Status created successfully');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to create status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!formName.trim() || !selectedStatus) {
      Alert.alert('Required', 'Please enter a status name.');
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await statusService.updateStatus(selectedStatus._id, {
        name: formName.trim(),
        description: formDescription.trim(),
        color: formColor,
        isActive: formActive,
      });

      setStatuses((prev) =>
        prev.map((s) => (s._id === selectedStatus._id ? updated : s))
      );
      setEditModalVisible(false);
      setSelectedStatus(null);
      showToast('Status updated successfully');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStatus = async () => {
    if (!selectedStatus) return;
    setIsSubmitting(true);
    try {
      await statusService.deleteStatus(selectedStatus._id);
      setStatuses((prev) => prev.filter((s) => s._id !== selectedStatus._id));
      setDeleteModalVisible(false);
      setSelectedStatus(null);
      showToast('Status deleted successfully');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to delete status');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter & Search
  const filteredStatuses = statuses.filter((s) => {
    if (filterType === 'ACTIVE' && s.isActive === false) return false;
    if (filterType === 'INACTIVE' && s.isActive !== false) return false;

    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.description && s.description.toLowerCase().includes(q))
    );
  });

  const creatorName =
    userProfile?.businessName || userProfile?.name || 'Admission Anytime';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Status</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#00B67A']} />
        }
      >
        <Text style={styles.pageTitle}>Status</Text>
        <Text style={styles.subtitle}>
          Define and manage contact lifecycle statuses.
        </Text>

        {/* Counter Pill & Add Status Button Row */}
        <View style={styles.topActionRow}>
          <View style={styles.countPill}>
            <Text style={styles.countPillText}>
              Status: {statuses.length}/999999
            </Text>
          </View>

          <TouchableOpacity
            style={styles.addStatusBtn}
            onPress={openCreateModal}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={18} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text style={styles.addStatusBtnText}>Add Status</Text>
          </TouchableOpacity>
        </View>

        {/* Main White Card Container */}
        <View style={styles.mainContainerCard}>
          {/* Filter Status Selector */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Filter Status</Text>
            <TouchableOpacity
              style={styles.dropdownSelector}
              onPress={() => {
                setFilterType((prev) =>
                  prev === 'ALL' ? 'ACTIVE' : prev === 'ACTIVE' ? 'INACTIVE' : 'ALL'
                );
              }}
            >
              <Text style={styles.dropdownValue}>
                {filterType === 'ALL'
                  ? 'All Statuses'
                  : filterType === 'ACTIVE'
                  ? 'Active Statuses'
                  : 'Inactive Statuses'}
              </Text>
              <Ionicons name="chevron-down" size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchBarContainer}>
            <Ionicons name="search-outline" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search statuses..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          {/* List or Empty State */}
          {loading ? (
            <ActivityIndicator size="large" color="#00B67A" style={{ marginVertical: 40 }} />
          ) : filteredStatuses.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBox}>
                <Ionicons name="search-outline" size={32} color="#94A3B8" />
              </View>
              <Text style={styles.emptyTitle}>No statuses found</Text>
              <Text style={styles.emptyDesc}>
                Try another search term or change the selected filter.
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery('');
                  setFilterType('ALL');
                }}
                style={styles.clearFiltersBtn}
              >
                <Text style={styles.clearFiltersText}>Clear Filters</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredStatuses.map((item) => {
              const isActive = item.isActive !== false;
              const statusColor = item.color || '#00B67A';

              return (
                <View key={item._id} style={styles.statusCard}>
                  <View style={styles.cardTopRow}>
                    <View style={styles.nameAndDot}>
                      <View
                        style={[styles.coloredDot, { backgroundColor: statusColor }]}
                      />
                      <Text style={styles.statusName}>{item.name}</Text>
                      <View
                        style={[
                          styles.activeBadge,
                          { backgroundColor: isActive ? '#E8F7EE' : '#F1F5F9' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.activeBadgeText,
                            { color: isActive ? '#00B67A' : '#64748B' },
                          ]}
                        >
                          {isActive ? 'Active' : 'Inactive'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.cardActions}>
                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => openEditModal(item)}
                      >
                        <Ionicons name="pencil-outline" size={17} color="#64748B" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => openDeleteModal(item)}
                      >
                        <Ionicons name="trash-outline" size={17} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {item.description ? (
                    <Text style={styles.statusDescription}>{item.description}</Text>
                  ) : null}

                  {/* Hex Color Tag */}
                  <View style={styles.hexPill}>
                    <Text style={styles.hexPillText}>{statusColor.toLowerCase()}</Text>
                  </View>

                  {/* Creator Info */}
                  <View style={styles.creatorRow}>
                    <View style={styles.avatarCircle}>
                      <Text style={styles.avatarText}>
                        {creatorName.substring(0, 2).toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.creatorName} numberOfLines={1}>
                      {item.createdBy || creatorName}
                    </Text>
                  </View>
                </View>
              );
            })
          )}

          {/* Pagination Footer */}
          <View style={styles.paginationFooter}>
            <Text style={styles.paginationTotal}>
              Total: {filteredStatuses.length}
            </Text>

            <View style={styles.rowsPerPage}>
              <Text style={styles.rowsPerPageLabel}>Rows per page</Text>
              <View style={styles.rowsDropdown}>
                <Text style={styles.rowsDropdownText}>10</Text>
                <Ionicons name="chevron-down" size={14} color="#64748B" />
              </View>
            </View>

            <Text style={styles.paginationRange}>
              {filteredStatuses.length > 0 ? `1-${filteredStatuses.length} of ${filteredStatuses.length}` : '0 of 0'}
            </Text>

            <View style={styles.pageButtons}>
              <TouchableOpacity style={styles.pageArrow} disabled>
                <Ionicons name="chevron-back" size={16} color="#CBD5E1" />
              </TouchableOpacity>
              <View style={styles.pageNumberBox}>
                <Text style={styles.pageNumberText}>1</Text>
              </View>
              <TouchableOpacity style={styles.pageArrow} disabled>
                <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating Bottom Toast Banner */}
      {toastMessage && (
        <View style={styles.toastContainer}>
          <Ionicons name="checkmark-sharp" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      {/* Create Status Modal */}
      <Modal
        visible={createModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setCreateModalVisible(false)}
        >
          <View style={styles.dialogCard} onStartShouldSetResponder={() => true}>
            <View style={styles.dialogHeader}>
              <View>
                <Text style={styles.dialogTitle}>Create New Status</Text>
                <Text style={styles.dialogSubtitle}>
                  Add a lifecycle status for your contacts.
                </Text>
              </View>
              <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Name */}
            <View style={styles.modalInputGroup}>
              <Text style={styles.modalInputLabel}>Name *</Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder="Enter status name"
                placeholderTextColor="#94A3B8"
                value={formName}
                onChangeText={setFormName}
              />
            </View>

            {/* Description */}
            <View style={styles.modalInputGroup}>
              <Text style={styles.modalInputLabel}>Description</Text>
              <TextInput
                style={[styles.modalTextInput, styles.modalMultilineInput]}
                placeholder="Add an optional description"
                placeholderTextColor="#94A3B8"
                value={formDescription}
                onChangeText={setFormDescription}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Color Swatches */}
            <View style={styles.modalInputGroup}>
              <Text style={styles.modalInputLabel}>Color</Text>
              <View style={styles.colorSwatchesRow}>
                {COLOR_PALETTE.map((c) => {
                  const isSelected = formColor.toLowerCase() === c.toLowerCase();
                  return (
                    <TouchableOpacity
                      key={c}
                      style={[styles.colorSwatch, { backgroundColor: c }]}
                      onPress={() => setFormColor(c)}
                    >
                      {isSelected && (
                        <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
              <View style={styles.hexCodeBox}>
                <Text style={styles.hexCodeText}>{formColor.toLowerCase()}</Text>
              </View>
            </View>

            {/* Active Switch */}
            <View style={styles.modalToggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleLabel}>Active status</Text>
                <Text style={styles.toggleSubtitle}>Available for contact assignment</Text>
              </View>
              <Switch
                value={formActive}
                onValueChange={setFormActive}
                trackColor={{ false: '#CBD5E1', true: '#00B67A' }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Buttons */}
            <View style={styles.dialogButtonsRow}>
              <TouchableOpacity
                style={styles.dialogCancelBtn}
                onPress={() => setCreateModalVisible(false)}
                disabled={isSubmitting}
              >
                <Text style={styles.dialogCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dialogSubmitBtn}
                onPress={handleCreateStatus}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.dialogSubmitText}>Create Status</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Edit Status Modal */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setEditModalVisible(false)}
        >
          <View style={styles.dialogCard} onStartShouldSetResponder={() => true}>
            <View style={styles.dialogHeader}>
              <View>
                <Text style={styles.dialogTitle}>Edit Status</Text>
                <Text style={styles.dialogSubtitle}>
                  Update lifecycle status details.
                </Text>
              </View>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Name */}
            <View style={styles.modalInputGroup}>
              <Text style={styles.modalInputLabel}>Name *</Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder="Enter status name"
                placeholderTextColor="#94A3B8"
                value={formName}
                onChangeText={setFormName}
              />
            </View>

            {/* Description */}
            <View style={styles.modalInputGroup}>
              <Text style={styles.modalInputLabel}>Description</Text>
              <TextInput
                style={[styles.modalTextInput, styles.modalMultilineInput]}
                placeholder="Add an optional description"
                placeholderTextColor="#94A3B8"
                value={formDescription}
                onChangeText={setFormDescription}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Color Swatches */}
            <View style={styles.modalInputGroup}>
              <Text style={styles.modalInputLabel}>Color</Text>
              <View style={styles.colorSwatchesRow}>
                {COLOR_PALETTE.map((c) => {
                  const isSelected = formColor.toLowerCase() === c.toLowerCase();
                  return (
                    <TouchableOpacity
                      key={c}
                      style={[styles.colorSwatch, { backgroundColor: c }]}
                      onPress={() => setFormColor(c)}
                    >
                      {isSelected && (
                        <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
              <View style={styles.hexCodeBox}>
                <Text style={styles.hexCodeText}>{formColor.toLowerCase()}</Text>
              </View>
            </View>

            {/* Active Switch */}
            <View style={styles.modalToggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleLabel}>Active status</Text>
                <Text style={styles.toggleSubtitle}>Available for contact assignment</Text>
              </View>
              <Switch
                value={formActive}
                onValueChange={setFormActive}
                trackColor={{ false: '#CBD5E1', true: '#00B67A' }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Buttons */}
            <View style={styles.dialogButtonsRow}>
              <TouchableOpacity
                style={styles.dialogCancelBtn}
                onPress={() => setEditModalVisible(false)}
                disabled={isSubmitting}
              >
                <Text style={styles.dialogCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dialogSubmitBtn}
                onPress={handleUpdateStatus}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.dialogSubmitText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.alertBox}>
            <View style={styles.trashCircle}>
              <Ionicons name="trash-outline" size={26} color="#EF4444" />
            </View>
            <Text style={styles.alertTitle}>Delete Status?</Text>
            <Text style={styles.alertMessage}>
              Are you sure you want to delete this status? This action cannot be undone.
            </Text>

            <View style={styles.alertButtonsRow}>
              <TouchableOpacity
                style={styles.alertCancelBtn}
                onPress={() => setDeleteModalVisible(false)}
                disabled={isSubmitting}
              >
                <Text style={styles.alertCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.alertConfirmBtn}
                onPress={handleDeleteStatus}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.alertConfirmText}>Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <MainBottomBar navigation={navigation} activeTab="More" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingTop: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 16,
  },
  topActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  countPill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  countPillText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  addStatusBtn: {
    backgroundColor: '#00B67A',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    shadowColor: '#00B67A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  addStatusBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  mainContainerCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filterGroup: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  dropdownSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 44,
    backgroundColor: '#FFFFFF',
  },
  dropdownValue: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1E293B',
  },
  statusCard: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  nameAndDot: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  coloredDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginRight: 8,
  },
  activeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    padding: 4,
    marginLeft: 6,
  },
  statusDescription: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 8,
  },
  hexPill: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 10,
  },
  hexPillText: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E8F7EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  avatarText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#00B67A',
  },
  creatorName: {
    fontSize: 12,
    color: '#64748B',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 36,
  },
  emptyIconBox: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 240,
    lineHeight: 18,
    marginBottom: 14,
  },
  clearFiltersBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  clearFiltersText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00B67A',
  },
  paginationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 8,
  },
  paginationTotal: {
    fontSize: 11,
    color: '#64748B',
  },
  rowsPerPage: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowsPerPageLabel: {
    fontSize: 11,
    color: '#64748B',
    marginRight: 4,
  },
  rowsDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  rowsDropdownText: {
    fontSize: 11,
    color: '#1E293B',
    marginRight: 2,
  },
  paginationRange: {
    fontSize: 11,
    color: '#64748B',
  },
  pageButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pageArrow: {
    padding: 2,
  },
  pageNumberBox: {
    borderWidth: 1,
    borderColor: '#00B67A',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginHorizontal: 4,
  },
  pageNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00B67A',
  },

  // Toast
  toastContainer: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },

  // Modal / Dialog
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialogCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 360,
  },
  dialogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  dialogTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  dialogSubtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  modalInputGroup: {
    marginBottom: 14,
  },
  modalInputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  modalTextInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1E293B',
  },
  modalMultilineInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  colorSwatchesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hexCodeBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  hexCodeText: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  modalToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  toggleLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  toggleSubtitle: {
    fontSize: 11,
    color: '#64748B',
  },
  dialogButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  dialogCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  dialogCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  dialogSubmitBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#00B67A',
    alignItems: 'center',
  },
  dialogSubmitText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Alert Box for Delete
  alertBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  trashCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  alertMessage: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  alertButtonsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  alertCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  alertCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  alertConfirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#EF4444',
  },
  alertConfirmText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
