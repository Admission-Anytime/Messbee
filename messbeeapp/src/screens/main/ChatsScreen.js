import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { chatService, contactService } from '../../services/api';

const TABS = ['All', 'Mine', 'Unread', 'Active', 'Resolved'];

// Reference default conversations (matching Image 1 Screen 1)
const DEFAULT_CHATS = [
  {
    _id: 'chat_1',
    name: '919350157447',
    phone: '+91 9350157447',
    lastMessage: 'Could you clarify that?',
    time: '10:42 AM',
    unread: 2,
    avatarText: '91',
    avatarBg: '#D1FAE5',
    avatarColor: '#065F46',
    status: 'Open',
    statusBg: '#DCFCE7',
    statusColor: '#166534',
    pinned: true,
    archived: false,
    assignedTo: 'Assigned to You',
  },
  {
    _id: 'chat_2',
    name: 'Unknown',
    phone: '+91 98765 00000',
    lastMessage: 'Unsupported message type',
    time: 'Yesterday',
    unread: 1,
    avatarText: 'U',
    avatarBg: '#F3E8FF',
    avatarColor: '#6B21A8',
    status: 'Open',
    statusBg: '#DCFCE7',
    statusColor: '#166534',
    pinned: false,
    archived: false,
    assignedTo: 'Unassigned',
  },
  {
    _id: 'chat_3',
    name: 'Rahul',
    phone: '+91 98765 43210',
    lastMessage: 'Hello Rahul, thank you for contacting Admission Anytime...',
    time: 'Mon',
    unread: 0,
    avatarText: 'RA',
    avatarBg: '#E0F2FE',
    avatarColor: '#0369A1',
    status: 'Open',
    statusBg: '#DCFCE7',
    statusColor: '#166534',
    pinned: true,
    archived: false,
    assignedTo: 'Assigned to You',
  },
  {
    _id: 'chat_4',
    name: 'Sarah Mitchell',
    phone: '+1 415 555 0142',
    lastMessage: 'Perfect, thank you for your help!',
    time: 'Sun',
    unread: 0,
    avatarText: 'SM',
    avatarBg: '#FFEDD5',
    avatarColor: '#C2410C',
    status: 'Resolved',
    statusBg: '#F3E8FF',
    statusColor: '#7E22CE',
    pinned: false,
    archived: false,
    assignedTo: 'Assigned to Aarav',
  },
];

export default function ChatsScreen({ navigation }) {
  const [chats, setChats] = useState(DEFAULT_CHATS);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showQuickFilters, setShowQuickFilters] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [suggestedContacts, setSuggestedContacts] = useState([
    { id: 'c1', name: 'Rahul', phone: '+91 98765 43210', initials: 'RA', bg: '#FFEDD5', color: '#C2410C' },
    { id: 'c2', name: 'Sarah Mitchell', phone: '+1 415 555 0142', initials: 'SM', bg: '#E0F2FE', color: '#0369A1' },
    { id: 'c3', name: '919350157447', phone: '+91 9350157447', initials: '91', bg: '#D1FAE5', color: '#065F46' },
  ]);

  // Load chats from real backend API
  const loadChats = useCallback(async () => {
    try {
      const data = await chatService.getChats();
      if (Array.isArray(data) && data.length > 0) {
        // Map backend chat document to UI model
        const mapped = data.map((item, idx) => {
          const rawName = item.name || item.whatsappId || item.phone || `Contact ${idx + 1}`;
          const isPhone = /^[0-9+]+$/.test(rawName.trim());
          const initials = isPhone ? rawName.slice(0, 2) : rawName.slice(0, 2).toUpperCase();
          const colors = [
            { bg: '#D1FAE5', color: '#065F46' },
            { bg: '#F3E8FF', color: '#6B21A8' },
            { bg: '#E0F2FE', color: '#0369A1' },
            { bg: '#FFEDD5', color: '#C2410C' },
          ];
          const colorPair = colors[idx % colors.length];
          const status = item.chatStatus || item.status || 'Open';
          const isResolved = status.toLowerCase() === 'resolved';

          return {
            _id: item._id || `chat_${idx}`,
            name: rawName,
            phone: item.phone || item.whatsappId || rawName,
            lastMessage: item.lastMsg || item.lastMessage || 'No messages yet',
            time: item.lastMsgTime || item.updatedAt ? new Date(item.updatedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:42 AM',
            unread: item.unread || 0,
            avatarText: initials,
            avatarBg: colorPair.bg,
            avatarColor: colorPair.color,
            status: status.charAt(0).toUpperCase() + status.slice(1),
            statusBg: isResolved ? '#F3E8FF' : '#DCFCE7',
            statusColor: isResolved ? '#7E22CE' : '#166534',
            pinned: item.pinned || false,
            archived: item.archived || false,
          };
        });
        setChats(mapped);
      }
    } catch (err) {
      console.log('Using default chats, API offline:', err.message);
    }
  }, []);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadChats();
    setRefreshing(false);
  };

  // Filter chats by tab and search
  const filteredChats = chats
    .filter((chat) => {
      if (chat.archived) return false;
      if (activeTab === 'Unread' && chat.unread === 0) return false;
      if (activeTab === 'Resolved' && chat.status.toLowerCase() !== 'resolved') return false;
      if (activeTab === 'Active' && chat.status.toLowerCase() === 'resolved') return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          chat.name.toLowerCase().includes(q) ||
          chat.phone.toLowerCase().includes(q) ||
          chat.lastMessage.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return 0;
    });

  const toggleSelectItem = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const unreadCount = chats.filter((c) => c.unread > 0).length;

  const handleStartChatWithContact = (contact) => {
    setShowNewChatModal(false);
    const existing = chats.find((c) => c.phone.includes(contact.phone.replace(/[^0-9]/g, '')));
    if (existing) {
      navigation.navigate('ChatDetail', { chat: existing });
    } else {
      const newChat = {
        _id: `chat_${Date.now()}`,
        name: contact.name,
        phone: contact.phone,
        lastMessage: 'Tap to start conversation',
        time: 'Just now',
        unread: 0,
        avatarText: contact.initials,
        avatarBg: contact.bg,
        avatarColor: contact.color,
        status: 'Open',
        statusBg: '#DCFCE7',
        statusColor: '#166534',
      };
      setChats([newChat, ...chats]);
      navigation.navigate('ChatDetail', { chat: newChat });
    }
  };

  const renderChatItem = ({ item }) => {
    const isSelected = selectedIds.includes(item._id);
    return (
      <TouchableOpacity
        style={[styles.chatCard, isSelected && styles.chatCardSelected]}
        onPress={() => {
          if (selectionMode) {
            toggleSelectItem(item._id);
          } else {
            navigation.navigate('ChatDetail', { chat: item });
          }
        }}
        onLongPress={() => {
          setSelectionMode(true);
          toggleSelectItem(item._id);
        }}
        activeOpacity={0.7}
      >
        {/* Selection Checkbox (Image 4 Screen 9) */}
        {selectionMode && (
          <View style={styles.selectionCheckboxCol}>
            <View style={[styles.selectBoxSquare, isSelected && styles.selectBoxSquareChecked]}>
              {isSelected && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
            </View>
          </View>
        )}

        {/* Avatar Squircle with WhatsApp indicator */}
        <View style={styles.avatarWrapper}>
          <View style={[styles.avatarSquircle, { backgroundColor: item.avatarBg }]}>
            <Text style={[styles.avatarInitials, { color: item.avatarColor }]}>{item.avatarText}</Text>
          </View>
          <View style={styles.whatsappDotBadge}>
            <Ionicons name="logo-whatsapp" size={9} color="#FFFFFF" />
          </View>
        </View>

        {/* Center Details */}
        <View style={styles.chatContent}>
          <View style={styles.topRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 }}>
              <Text style={styles.contactName} numberOfLines={1}>{item.name}</Text>
              {item.pinned && (
                <Ionicons name="pin" size={13} color="#D97706" style={{ marginLeft: 5 }} />
              )}
            </View>
            <Text style={styles.chatTime}>{item.time}</Text>
          </View>

          <View style={styles.bottomRow}>
            <Text style={styles.lastMessageText} numberOfLines={1}>
              {item.lastMessage}
            </Text>
            {item.unread > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{item.unread}</Text>
              </View>
            )}
          </View>

          {/* Status Pill Badge & Assigned Agent Row */}
          <View style={styles.statusPillRow}>
            <View style={[styles.statusPill, { backgroundColor: item.statusBg }]}>
              <View style={[styles.statusDot, { backgroundColor: item.statusColor }]} />
              <Text style={[styles.statusText, { color: item.statusColor }]}>{item.status}</Text>
            </View>
            {item.assignedTo && (
              <Text style={styles.assignedToText}>{item.assignedTo}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* Header (Matching Image 1 Screen 1 or Image 4 Screen 9 for Bulk Selection) */}
      {selectionMode ? (
        <View style={styles.selectionHeader}>
          <TouchableOpacity
            onPress={() => {
              setSelectionMode(false);
              setSelectedIds([]);
            }}
            style={styles.headerIconBtn}
          >
            <Ionicons name="close" size={24} color="#0F172A" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.selectAllBtn}
            onPress={() => {
              if (selectedIds.length === filteredChats.length) {
                setSelectedIds([]);
              } else {
                setSelectedIds(filteredChats.map((c) => c._id));
              }
            }}
            activeOpacity={0.8}
          >
            <View style={[styles.selectBoxSquare, selectedIds.length === filteredChats.length && styles.selectBoxSquareChecked]}>
              {selectedIds.length === filteredChats.length && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
            </View>
            <Text style={styles.selectAllText}>Select all ({selectedIds.length})</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bulkActionsBtn}
            onPress={() => {
              Alert.alert('Bulk actions', `Perform action on ${selectedIds.length} selected conversations`, [
                { text: 'Mark as Read', onPress: () => { setSelectionMode(false); setSelectedIds([]); } },
                { text: 'Archive Selected', onPress: () => { setSelectionMode(false); setSelectedIds([]); } },
                { text: 'Cancel', style: 'cancel' },
              ]);
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.bulkActionsText}>Bulk actions</Text>
            <Ionicons name="chevron-down" size={13} color="#64748B" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.header}>
          <View>
            <Text style={styles.messbeeTag}>MESSBEE</Text>
            <Text style={styles.headerTitle}>Chats</Text>
          </View>

          <View style={styles.headerRightActions}>
            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={() => setSearchQuery(searchQuery ? '' : ' ')}
              activeOpacity={0.7}
            >
              <Ionicons name="search-outline" size={22} color="#0F172A" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.plusGreenSquircle}
              onPress={() => setShowNewChatModal(true)}
              activeOpacity={0.85}
            >
              <Ionicons name="add" size={22} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={() => setShowQuickFilters(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="ellipsis-vertical" size={20} color="#0F172A" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={17} color="#94A3B8" style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search conversations..."
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
            value={searchQuery.trim() === '' ? '' : searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.trim().length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={17} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabsContainer}>
        <FlatList
          data={TABS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          renderItem={({ item }) => {
            const isSelected = activeTab === item;
            let displayLabel = item;
            if (item === 'Unread') {
              displayLabel = `Unread ${unreadCount > 0 ? unreadCount : 3}`;
            }
            return (
              <TouchableOpacity
                style={[styles.tabPill, isSelected && styles.tabPillSelected]}
                onPress={() => setActiveTab(item)}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabPillText, isSelected && styles.tabPillTextSelected]}>
                  {displayLabel}
                </Text>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={styles.tabsList}
        />
      </View>

      <FlatList
        data={filteredChats}
        keyExtractor={(item) => item._id}
        renderItem={renderChatItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#00B67A']} />}
        ListHeaderComponent={
          <>
            {/* Archived Chats Card */}
            <TouchableOpacity
              style={styles.archivedCard}
              onPress={() => navigation.navigate('ArchivedChats')}
              activeOpacity={0.7}
            >
              <View style={styles.archiveIconBox}>
                <Ionicons name="archive-outline" size={18} color="#00B67A" />
              </View>
              <View style={styles.archiveContent}>
                <Text style={styles.archiveTitle}>Archived Chats</Text>
                <Text style={styles.archiveSubtitle}>Keep your active inbox focused</Text>
              </View>
              <View style={styles.archiveBadgeBox}>
                <Text style={styles.archiveBadgeText}>2</Text>
                <Ionicons name="chevron-forward" size={16} color="#00B67A" style={{ marginLeft: 4 }} />
              </View>
            </TouchableOpacity>

            {/* Recent Conversations Header */}
            <View style={styles.recentHeaderRow}>
              <Text style={styles.recentHeaderText}>RECENT CONVERSATIONS</Text>
              <Text style={styles.recentCountText}>{filteredChats.length} chats</Text>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No conversations found</Text>
            <Text style={styles.emptySubtitle}>Tap the green + button to start a new chat</Text>
          </View>
        }
      />

      {/* ================= SCREEN 8: START A NEW CHAT MODAL ================= */}
      <Modal
        visible={showNewChatModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNewChatModal(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowNewChatModal(false)}
        >
          <View style={styles.sheetDialog} onStartShouldSetResponder={() => true}>
            <View style={styles.sheetHandle} />

            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTag}>MESSBEE</Text>
                <Text style={styles.sheetTitle}>Start a new chat</Text>
              </View>
              <TouchableOpacity onPress={() => setShowNewChatModal(false)} style={styles.sheetCloseBtn}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View style={styles.sheetSearchBox}>
              <Ionicons name="search-outline" size={17} color="#94A3B8" style={{ marginRight: 8 }} />
              <TextInput
                placeholder="Search name or phone number"
                placeholderTextColor="#94A3B8"
                style={styles.sheetSearchInput}
              />
            </View>

            <Text style={styles.suggestedHeading}>SUGGESTED CONTACTS</Text>

            {suggestedContacts.map((contact) => (
              <TouchableOpacity
                key={contact.id}
                style={styles.contactRow}
                onPress={() => handleStartChatWithContact(contact)}
                activeOpacity={0.7}
              >
                <View style={[styles.contactAvatar, { backgroundColor: contact.bg }]}>
                  <Text style={[styles.contactInitials, { color: contact.color }]}>{contact.initials}</Text>
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactNameText}>{contact.name}</Text>
                  <Text style={styles.contactPhoneText}>{contact.phone}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ================= SCREEN 11: QUICK FILTERS MODAL ================= */}
      <Modal
        visible={showQuickFilters}
        transparent
        animationType="slide"
        onRequestClose={() => setShowQuickFilters(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowQuickFilters(false)}
        >
          <View style={styles.sheetDialog} onStartShouldSetResponder={() => true}>
            <View style={styles.sheetHandle} />

            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTag}>FILTERS</Text>
                <Text style={styles.sheetTitle}>Quick Filters</Text>
              </View>
              <TouchableOpacity onPress={() => setShowQuickFilters(false)} style={styles.sheetCloseBtn}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.filterOptionRow}
              onPress={() => {
                setActiveTab('Unread');
                setShowQuickFilters(false);
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.filterOptIcon, { backgroundColor: '#DCFCE7' }]}>
                <Ionicons name="chatbubble-ellipses-outline" size={18} color="#00875A" />
              </View>
              <Text style={styles.filterOptText}>Unread chats</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.filterOptionRow}
              onPress={() => {
                setActiveTab('Active');
                setShowQuickFilters(false);
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.filterOptIcon, { backgroundColor: '#E0F2FE' }]}>
                <Ionicons name="time-outline" size={18} color="#0284C7" />
              </View>
              <Text style={styles.filterOptText}>Open session chats</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.filterOptionRow}
              onPress={() => {
                setActiveTab('Mine');
                setShowQuickFilters(false);
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.filterOptIcon, { backgroundColor: '#F1F5F9' }]}>
                <Ionicons name="volume-mute-outline" size={18} color="#64748B" />
              </View>
              <Text style={styles.filterOptText}>Muted chats</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.filterOptionRow}
              onPress={() => {
                setSearchQuery('Unassigned');
                setShowQuickFilters(false);
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.filterOptIcon, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="person-outline" size={18} color="#D97706" />
              </View>
              <Text style={styles.filterOptText}>Unassigned chats</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.filterOptionRow}
              onPress={() => {
                setShowQuickFilters(false);
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.filterOptIcon, { backgroundColor: '#EEF2FF' }]}>
                <Ionicons name="options-outline" size={18} color="#6366F1" />
              </View>
              <Text style={styles.filterOptText}>Advanced filters</Text>
            </TouchableOpacity>

            <View style={styles.filterDivider} />

            <TouchableOpacity
              style={[styles.filterOptionRow, { paddingVertical: 12 }]}
              onPress={() => {
                setActiveTab('All');
                setSearchQuery('');
                setShowQuickFilters(false);
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.filterOptIcon, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="refresh-outline" size={18} color="#EF4444" />
              </View>
              <Text style={[styles.filterOptText, { color: '#EF4444', fontWeight: '700' }]}>
                Clear Filters
              </Text>
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
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? 36 : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  messbeeTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00B67A',
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
  },
  plusGreenSquircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#00875A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00875A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  searchContainer: {
    paddingHorizontal: 18,
    marginBottom: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#0F172A',
  },
  tabsContainer: {
    marginBottom: 8,
  },
  tabsList: {
    paddingHorizontal: 18,
    gap: 8,
  },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  tabPillSelected: {
    backgroundColor: '#00875A',
  },
  tabPillText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
  },
  tabPillTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 18,
    paddingBottom: 24,
  },
  archivedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    borderRadius: 14,
    padding: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  archiveIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  archiveContent: {
    flex: 1,
  },
  archiveTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  archiveSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  archiveBadgeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  archiveBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00875A',
  },
  recentHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recentHeaderText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
  },
  recentCountText: {
    fontSize: 11.5,
    color: '#94A3B8',
    fontWeight: '600',
  },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 14,
  },
  avatarSquircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 15,
    fontWeight: '800',
  },
  whatsappDotBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 17,
    height: 17,
    borderRadius: 8.5,
    backgroundColor: '#00B67A',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatContent: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  contactName: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
    maxWidth: 200,
  },
  chatTime: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  lastMessageText: {
    fontSize: 12.5,
    color: '#64748B',
    flex: 1,
    marginRight: 10,
  },
  unreadBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#00875A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statusPillRow: {
    flexDirection: 'row',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginRight: 4,
  },
  statusText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },

  // Modal / Bottom Sheet (Screen 8)
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
    paddingBottom: 36,
    paddingTop: 10,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sheetTag: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#00875A',
    letterSpacing: 0.8,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  sheetCloseBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  sheetSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 18,
  },
  sheetSearchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
  },
  suggestedHeading: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contactInitials: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  contactInfo: {
    flex: 1,
  },
  contactNameText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  contactPhoneText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  filterOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
  },
  filterOptIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  filterOptText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  filterDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 6,
  },
});
