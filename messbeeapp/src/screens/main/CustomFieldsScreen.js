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
import { customFieldService, authService } from '../../services/api';

export default function CustomFieldsScreen({ navigation }) {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userProfile, setUserProfile] = useState(null);

  // Modals & Bottom Sheets
  const [showOptionsSheet, setShowOptionsSheet] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [fieldToDelete, setFieldToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sortOrder, setSortOrder] = useState('recent'); // 'recent' or 'name'

  const loadData = useCallback(async () => {
    try {
      const [customFieldsData, user] = await Promise.all([
        customFieldService.getCustomFields(),
        authService.getCurrentUser().catch(() => null),
      ]);
      setFields(Array.isArray(customFieldsData) ? customFieldsData : []);
      if (user) setUserProfile(user);
    } catch (err) {
      console.warn('Error loading custom fields:', err.message);
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

  const handleToggleActive = async (field) => {
    const originalState = field.isActive !== false;
    const newFields = fields.map((f) =>
      f._id === field._id ? { ...f, isActive: !originalState } : f
    );
    setFields(newFields);

    try {
      if (customFieldService.toggleCustomField) {
        await customFieldService.toggleCustomField(field._id);
      } else {
        await customFieldService.updateCustomField(field._id, {
          isActive: !originalState,
        });
      }
    } catch (err) {
      // Revert if API fails
      setFields(fields);
      Alert.alert('Error', 'Failed to update field status');
    }
  };

  const handleDeletePress = (field) => {
    setFieldToDelete(field);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!fieldToDelete) return;
    setIsDeleting(true);
    try {
      await customFieldService.deleteCustomField(fieldToDelete._id);
      setFields((prev) => prev.filter((f) => f._id !== fieldToDelete._id));
      setDeleteModalVisible(false);
      setFieldToDelete(null);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to delete custom field');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter & Search
  const filteredFields = fields.filter((f) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (f.name && f.name.toLowerCase().includes(q)) ||
      (f.key && f.key.toLowerCase().includes(q)) ||
      (f.description && f.description.toLowerCase().includes(q))
    );
  });

  const sortedFields = [...filteredFields].sort((a, b) => {
    if (sortOrder === 'name') {
      return (a.name || '').localeCompare(b.name || '');
    }
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  const totalFields = fields.length;
  const activeFields = fields.filter((f) => f.isActive !== false).length;

  const creatorName =
    userProfile?.businessName ||
    userProfile?.name ||
    'Admission Anytime';

  return (
    <SafeAreaView style={styles.container}>
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
        <Text style={styles.headerTitle}>Custom Fields</Text>
        <TouchableOpacity
          onPress={() => setShowOptionsSheet(true)}
          style={styles.moreButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="ellipsis-horizontal" size={22} color="#1E293B" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#00B67A']} />
        }
      >
        <Text style={styles.subtitle}>
          Create and manage custom data fields for your contacts.
        </Text>

        {/* Create Custom Field Button */}
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('CreateCustomField')}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.createButtonText}>Create Custom Field</Text>
        </TouchableOpacity>

        {/* Total & Active Fields Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryIconContainer}>
            <Ionicons name="grid-outline" size={22} color="#FFFFFF" />
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Fields</Text>
            <Text style={styles.summaryValue}>{totalFields}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Active Fields</Text>
            <Text style={styles.summaryValue}>{activeFields}</Text>
          </View>
        </View>

        {/* Search Bar & Filter */}
        <View style={styles.searchRow}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search-outline" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search custom fields..."
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
          <TouchableOpacity
            style={styles.filterIconButton}
            onPress={() => setShowOptionsSheet(true)}
          >
            <Ionicons name="filter-outline" size={20} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Count & Sort Row */}
        <View style={styles.countRow}>
          <Text style={styles.countText}>
            {sortedFields.length} of {totalFields} · All Types
          </Text>
          <TouchableOpacity
            style={styles.sortToggle}
            onPress={() =>
              setSortOrder((prev) => (prev === 'recent' ? 'name' : 'recent'))
            }
          >
            <Ionicons name="swap-vertical" size={14} color="#64748B" style={{ marginRight: 4 }} />
            <Text style={styles.sortToggleText}>
              {sortOrder === 'recent' ? 'Recently Created' : 'By Name'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* List of Custom Fields */}
        {loading ? (
          <ActivityIndicator size="large" color="#00B67A" style={{ marginTop: 40 }} />
        ) : sortedFields.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBox}>
              <Ionicons name="list-outline" size={40} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>No custom fields found</Text>
            <Text style={styles.emptyDesc}>
              {searchQuery
                ? 'Try a different search query or clear the filter.'
                : 'Get started by creating your first custom data field.'}
            </Text>
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
                <Text style={styles.clearSearchText}>Clear Search</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : (
          sortedFields.map((field) => {
            const isActive = field.isActive !== false;
            return (
              <View key={field._id || field.key} style={styles.fieldCard}>
                {/* Header Row */}
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <Text style={styles.fieldName}>{field.name}</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: isActive ? '#E8F7EE' : '#F1F5F9' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusBadgeText,
                          { color: isActive ? '#00B67A' : '#64748B' },
                        ]}
                      >
                        {isActive ? 'Active' : 'Inactive'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={styles.actionIconBtn}
                      onPress={() => navigation.navigate('EditCustomField', { field })}
                    >
                      <Ionicons name="pencil-outline" size={17} color="#64748B" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionIconBtn}
                      onPress={() => handleDeletePress(field)}
                    >
                      <Ionicons name="trash-outline" size={17} color="#EF4444" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionIconBtn}
                      onPress={() => setShowOptionsSheet(true)}
                    >
                      <Ionicons name="ellipsis-horizontal" size={17} color="#94A3B8" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Description */}
                {field.description ? (
                  <Text style={styles.fieldDescription}>{field.description}</Text>
                ) : null}

                {/* Tags Row */}
                <View style={styles.tagsRow}>
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeBadgeText}>{field.type || 'Text'}</Text>
                  </View>
                  <View style={styles.keyBadge}>
                    <Text style={styles.keyBadgeText}>{field.key || field.name?.toLowerCase()}</Text>
                  </View>
                </View>

                {/* Footer with Creator and Toggle */}
                <View style={styles.cardFooter}>
                  <View style={styles.creatorRow}>
                    <View style={styles.avatarCircle}>
                      <Text style={styles.avatarText}>
                        {creatorName.substring(0, 2).toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.creatorText} numberOfLines={1}>
                      Created by {field.createdBy || creatorName}
                    </Text>
                  </View>

                  <Switch
                    value={isActive}
                    onValueChange={() => handleToggleActive(field)}
                    trackColor={{ false: '#CBD5E1', true: '#00B67A' }}
                    thumbColor="#FFFFFF"
                  />
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Options Bottom Sheet */}
      <Modal
        visible={showOptionsSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowOptionsSheet(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowOptionsSheet(false)}
        >
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Custom Field options</Text>
              <TouchableOpacity onPress={() => setShowOptionsSheet(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.sheetItem}
              onPress={() => {
                setSortOrder((prev) => (prev === 'recent' ? 'name' : 'recent'));
                setShowOptionsSheet(false);
              }}
            >
              <Ionicons name="swap-vertical" size={20} color="#1E293B" style={{ marginRight: 14 }} />
              <Text style={styles.sheetItemText}>
                Sort Fields ({sortOrder === 'recent' ? 'By Name' : 'Recently Created'})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sheetItem}
              onPress={() => {
                setShowOptionsSheet(false);
                onRefresh();
              }}
            >
              <Ionicons name="refresh-outline" size={20} color="#1E293B" style={{ marginRight: 14 }} />
              <Text style={styles.sheetItemText}>Refresh</Text>
            </TouchableOpacity>
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
        <View style={styles.alertOverlay}>
          <View style={styles.alertBox}>
            <View style={styles.trashCircle}>
              <Ionicons name="trash-outline" size={26} color="#EF4444" />
            </View>
            <Text style={styles.alertTitle}>Delete Custom Field?</Text>
            <Text style={styles.alertMessage}>
              You are about to delete{' '}
              <Text style={{ fontWeight: '700', color: '#1E293B' }}>
                {fieldToDelete?.name}
              </Text>
              . This will also remove it from Contacts and remove saved values. This action cannot be undone.
            </Text>

            <View style={styles.alertButtonsRow}>
              <TouchableOpacity
                style={styles.alertCancelBtn}
                onPress={() => setDeleteModalVisible(false)}
                disabled={isDeleting}
              >
                <Text style={styles.alertCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.alertConfirmBtn}
                onPress={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.alertConfirmText}>Confirm Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  moreButton: {
    padding: 4,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 16,
    lineHeight: 18,
  },
  createButton: {
    backgroundColor: '#00B67A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#00B67A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  summaryCard: {
    backgroundColor: '#EDF9F2',
    borderColor: '#C6EED5',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#00B67A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  summaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#C6EED5',
    marginHorizontal: 12,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1E293B',
  },
  filterIconButton: {
    width: 44,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  countText: {
    fontSize: 12,
    color: '#64748B',
  },
  sortToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortToggleText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  fieldCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fieldName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIconBtn: {
    padding: 4,
    marginLeft: 6,
  },
  fieldDescription: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 10,
    lineHeight: 18,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeBadge: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 8,
  },
  typeBadgeText: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '600',
  },
  keyBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  keyBadgeText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
    marginTop: 4,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  avatarCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E8F7EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  avatarText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#00B67A',
  },
  creatorText: {
    fontSize: 12,
    color: '#64748B',
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIconBox: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 18,
  },
  clearSearchBtn: {
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: '#E8F7EE',
    borderRadius: 8,
  },
  clearSearchText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00B67A',
  },

  // Bottom Sheet
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E293B',
  },
  sheetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  sheetItemText: {
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '500',
  },

  // Alert Modal
  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  alertBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
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
