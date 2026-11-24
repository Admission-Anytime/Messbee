import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { quickReplyService } from '../../services/api';

export default function QuickRepliesScreen({ navigation }) {
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('recent'); // 'recent' or 'name'

  // Modals & Sheets
  const [previewReply, setPreviewReply] = useState(null);
  const [replyToDelete, setReplyToDelete] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
      const data = await quickReplyService.getQuickReplies();
      setReplies(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Error loading quick replies:', err.message);
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

  const handleDeletePress = (reply) => {
    setReplyToDelete(reply);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!replyToDelete) return;
    setIsDeleting(true);
    try {
      await quickReplyService.deleteQuickReply(replyToDelete._id);
      setReplies((prev) => prev.filter((r) => r._id !== replyToDelete._id));
      setDeleteModalVisible(false);
      const name = replyToDelete.shortcut?.startsWith('/')
        ? replyToDelete.shortcut
        : `/${replyToDelete.shortcut}`;
      setReplyToDelete(null);
      showToast(`Quick reply deleted successfully`);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to delete quick reply');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter & Search
  const filteredReplies = replies.filter((r) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (r.shortcut && r.shortcut.toLowerCase().includes(q)) ||
      (r.content && r.content.toLowerCase().includes(q)) ||
      (r.type && r.type.toLowerCase().includes(q))
    );
  });

  const sortedReplies = [...filteredReplies].sort((a, b) => {
    if (sortOrder === 'name') {
      return (a.shortcut || '').localeCompare(b.shortcut || '');
    }
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  const totalReplies = replies.length;
  const activeReplies = replies.length; // In backend, all existing quick replies are active

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
        <Text style={styles.headerTitle}>Quick Replies</Text>
        <TouchableOpacity
          onPress={onRefresh}
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
          Set up shortcut responses to answer common questions faster.
        </Text>

        {/* Add Quick Reply Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() =>
            navigation.navigate('AddQuickReply', {
              onSuccess: () => showToast('Quick reply created successfully'),
            })
          }
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.addButtonText}>Add Quick Reply</Text>
        </TouchableOpacity>

        {/* Total & Active Replies Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total replies</Text>
            <Text style={styles.summaryValue}>{totalReplies}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Active</Text>
            <Text style={styles.summaryValue}>{activeReplies}</Text>
          </View>
        </View>

        {/* Search Bar & Filter */}
        <View style={styles.searchRow}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search-outline" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search quick replies..."
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
            onPress={() =>
              setSortOrder((prev) => (prev === 'recent' ? 'name' : 'recent'))
            }
          >
            <Ionicons name="filter-outline" size={20} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Count & Sort Row */}
        <View style={styles.countRow}>
          <Text style={styles.countText}>
            {sortedReplies.length} replies · All Types
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

        {/* Quick Replies List */}
        {loading ? (
          <ActivityIndicator size="large" color="#00B67A" style={{ marginTop: 40 }} />
        ) : sortedReplies.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBox}>
              <Ionicons name="flash-outline" size={38} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>No quick replies found</Text>
            <Text style={styles.emptyDesc}>
              {searchQuery
                ? 'Try a different search query or clear the filter.'
                : 'Create shortcut responses to reply with single keystroke commands.'}
            </Text>
          </View>
        ) : (
          sortedReplies.map((reply) => {
            const formattedShortcut = reply.shortcut?.startsWith('/')
              ? reply.shortcut
              : `/${reply.shortcut || ''}`;
            const typeLabel = (reply.type || 'Text').toUpperCase();

            return (
              <View key={reply._id} style={styles.replyCard}>
                {/* Header Row */}
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <Text style={styles.shortcutText}>{formattedShortcut}</Text>
                    <View style={styles.typeBadge}>
                      <Text style={styles.typeBadgeText}>
                        {typeLabel === 'CTA URL' || typeLabel === 'URL' ? 'CTA' : 'Text'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={styles.actionIconBtn}
                      onPress={() =>
                        navigation.navigate('EditQuickReply', {
                          reply,
                          onSuccess: () => showToast('Quick reply updated successfully'),
                        })
                      }
                    >
                      <Ionicons name="pencil-outline" size={17} color="#64748B" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionIconBtn}
                      onPress={() => handleDeletePress(reply)}
                    >
                      <Ionicons name="trash-outline" size={17} color="#EF4444" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionIconBtn}>
                      <Ionicons name="ellipsis-horizontal" size={17} color="#94A3B8" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Content Snippet */}
                <Text style={styles.replyContent} numberOfLines={2}>
                  {reply.content || (reply.url ? `CTA: ${reply.buttonText || 'Link'} (${reply.url})` : 'No message content')}
                </Text>

                {/* Preview Message Button */}
                <TouchableOpacity
                  style={styles.previewBtn}
                  onPress={() => setPreviewReply(reply)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="chatbubble-ellipses-outline" size={15} color="#00B67A" style={{ marginRight: 6 }} />
                  <Text style={styles.previewBtnText}>Preview Message</Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Floating Bottom Toast Banner */}
      {toastMessage && (
        <View style={styles.toastContainer}>
          <Ionicons name="checkmark-sharp" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      {/* WhatsApp Message Preview Modal */}
      <Modal
        visible={!!previewReply}
        transparent
        animationType="slide"
        onRequestClose={() => setPreviewReply(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setPreviewReply(null)}
        >
          <View style={styles.previewSheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.previewHeader}>
              <Text style={styles.previewModalTitle}>Message Preview</Text>
              <TouchableOpacity onPress={() => setPreviewReply(null)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Simulated WhatsApp Room */}
            <View style={styles.whatsappRoom}>
              {/* WhatsApp Chat Bar */}
              <View style={styles.waChatBar}>
                <View style={styles.waAvatar}>
                  <Text style={styles.waAvatarText}>RA</Text>
                </View>
                <View>
                  <Text style={styles.waName}>Rahul</Text>
                  <Text style={styles.waStatus}>online</Text>
                </View>
              </View>

              {/* Chat Area with WhatsApp Message Bubble */}
              <View style={styles.waChatArea}>
                <View style={styles.waBubble}>
                  <Text style={styles.waBubbleText}>
                    {previewReply?.content || previewReply?.shortcut || 'Your message preview will appear here.'}
                  </Text>
                  <Text style={styles.waBubbleTime}>10:42 AM ✓✓</Text>
                </View>

                {/* If CTA URL */}
                {previewReply?.url && (
                  <View style={styles.waCtaBtn}>
                    <Ionicons name="open-outline" size={15} color="#00B67A" style={{ marginRight: 6 }} />
                    <Text style={styles.waCtaText}>
                      {previewReply?.buttonText || 'Open Link'}
                    </Text>
                  </View>
                )}
              </View>
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
        <View style={styles.alertOverlay}>
          <View style={styles.alertBox}>
            <View style={styles.trashCircle}>
              <Ionicons name="trash-outline" size={26} color="#EF4444" />
            </View>
            <Text style={styles.alertTitle}>Delete Quick Reply?</Text>
            <Text style={styles.alertMessage}>
              Are you sure you want to delete{' '}
              <Text style={{ fontWeight: '700', color: '#1E293B' }}>
                {replyToDelete?.shortcut}
              </Text>
              ? This action cannot be undone.
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
                  <Text style={styles.alertConfirmText}>Delete Quick Reply</Text>
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
    paddingTop: Platform.OS === 'android' ? 28 : 0,
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
  addButton: {
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
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#00B67A',
  },
  summaryDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#E2E8F0',
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
  replyCard: {
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
    marginBottom: 8,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  shortcutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00B67A',
    marginRight: 8,
  },
  typeBadge: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 11,
    color: '#2563EB',
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
  replyContent: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 12,
  },
  previewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  previewBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00B67A',
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

  // WhatsApp Message Preview Sheet
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  previewSheet: {
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
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  previewModalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E293B',
  },
  whatsappRoom: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  waChatBar: {
    backgroundColor: '#075E54',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  waAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  waAvatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  waName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  waStatus: {
    color: '#A7F3D0',
    fontSize: 11,
  },
  waChatArea: {
    backgroundColor: '#EFEAE2',
    padding: 16,
    minHeight: 160,
    justifyContent: 'flex-end',
  },
  waBubble: {
    backgroundColor: '#DCF8C6',
    borderRadius: 12,
    borderTopRightRadius: 2,
    padding: 12,
    maxWidth: '85%',
    alignSelf: 'flex-end',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  waBubbleText: {
    fontSize: 14,
    color: '#1E293B',
    lineHeight: 20,
  },
  waBubbleTime: {
    fontSize: 10,
    color: '#64748B',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  waCtaBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
    marginTop: 6,
    maxWidth: '85%',
    borderWidth: 1,
    borderColor: '#00B67A',
  },
  waCtaText: {
    color: '#00B67A',
    fontSize: 13,
    fontWeight: '600',
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

  // Delete Alert Modal
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
