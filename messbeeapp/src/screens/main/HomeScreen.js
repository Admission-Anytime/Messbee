import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
  Dimensions,
  useWindowDimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import {
  authService,
  contactService,
  chatService,
  campaignService,
  notificationService,
} from '../../services/api';

const { width } = Dimensions.get('window');

const AVATAR_PALETTE = [
  { bg: '#FED7AA', text: '#C2410C' },
  { bg: '#BFDBFE', text: '#1D4ED8' },
  { bg: '#E9D5FF', text: '#7E22CE' },
  { bg: '#BBF7D0', text: '#15803D' },
  { bg: '#FECDD3', text: '#BE123C' },
  { bg: '#FEF08A', text: '#A16207' },
];

const getInitials = (name = '') => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'MB';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function HomeScreen({ navigation }) {
  const { width: windowWidth } = useWindowDimensions();
  const bannerWidth = Math.min(windowWidth - 32, 600);
  const bannerHeight = Math.round(bannerWidth * (416 / 863));

  const [activeFilter, setActiveFilter] = useState('unread');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [chats, setChats] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const loadData = useCallback(async () => {
    try {
      const [userData, contactsData, chatsData, campaignsData, unreadCountData] = await Promise.all([
        authService.getCurrentUser().catch(() => null),
        contactService.getContacts().catch(() => []),
        chatService.getChats().catch(() => []),
        campaignService.getCampaigns().catch(() => []),
        notificationService.getUnreadCount().catch(() => 0),
      ]);

      if (userData) {
        setCurrentUser(userData?.data || userData?.user || userData);
      }
      setContacts(Array.isArray(contactsData) ? contactsData : []);
      setChats(Array.isArray(chatsData) ? chatsData : []);
      setCampaigns(Array.isArray(campaignsData) ? campaignsData : []);
      setUnreadNotifications(typeof unreadCountData === 'number' ? unreadCountData : 0);
    } catch (err) {
      console.warn('HomeScreen loadData error:', err.message);
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

  // Filter chats based on activeFilter
  const filteredChats = useMemo(() => {
    if (activeFilter === 'unread') {
      const unreadList = chats.filter((c) => (c.unreadCount || c.unread || 0) > 0);
      return unreadList.length > 0 ? unreadList : chats;
    }
    if (activeFilter === 'followups') {
      return chats.filter((c) =>
        (c.labels || []).some((l) =>
          typeof l === 'string'
            ? l.toLowerCase().includes('follow')
            : (l.name || '').toLowerCase().includes('follow')
        )
      );
    }
    if (activeFilter === 'campaigns') {
      return chats.filter((c) => c.source === 'campaign' || c.campaignId);
    }
    return chats;
  }, [chats, activeFilter]);

  const userInitials = useMemo(() => {
    return getInitials(currentUser?.name || currentUser?.fullName || 'Admin User');
  }, [currentUser]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Top Header Bar */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <Image
            source={require('../../../assets/logo-with-name.png')}
            style={styles.headerLogoImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.headerRightActions}>
          <TouchableOpacity
            style={styles.searchPill}
            onPress={() => navigation.navigate('Chats')}
            activeOpacity={0.8}
          >
            <Ionicons name="search" size={15} color="#6B7280" />
            <Text style={styles.searchText}>Search</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.notifBtn}
            onPress={() => navigation.navigate('Notifications')}
            activeOpacity={0.8}
          >
            <Ionicons name="notifications-outline" size={20} color="#374151" />
            {unreadNotifications > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>
                  {unreadNotifications > 99 ? '99+' : unreadNotifications}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.profileCircle}
            onPress={() => navigation.navigate('Settings')}
            activeOpacity={0.8}
          >
            <Text style={styles.profileInitialsText}>{userInitials}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#00B67A']} />
        }
      >
        {/* Top Hero Banner */}
        <View style={styles.bannerContainer}>
          <Image
            source={require('../../../assets/home_hero_banner.png')}
            style={[
              styles.bannerImage,
              { width: bannerWidth, height: bannerHeight },
            ]}
            resizeMode="contain"
          />
        </View>

        {/* 4 Quick Action Tiles */}
        <View style={styles.quickActionsGrid}>
          {/* New Chat */}
          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => navigation.navigate('Chats')}
            activeOpacity={0.7}
          >
            <View style={styles.quickActionTile}>
              <Ionicons name="chatbubble-ellipses-outline" size={24} color="#00B67A" />
            </View>
            <Text style={styles.quickActionLabel}>New Chat</Text>
          </TouchableOpacity>

          {/* Contacts */}
          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => navigation.navigate('Contacts')}
            activeOpacity={0.7}
          >
            <View style={styles.quickActionTile}>
              <Ionicons name="people-outline" size={24} color="#00B67A" />
            </View>
            <Text style={styles.quickActionLabel}>Contacts</Text>
          </TouchableOpacity>

          {/* Quick Replies */}
          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => navigation.navigate('QuickReplies')}
            activeOpacity={0.7}
          >
            <View style={styles.quickActionTile}>
              <Ionicons name="chatbox-ellipses-outline" size={24} color="#00B67A" />
            </View>
            <Text style={styles.quickActionLabel}>Quick Replies</Text>
          </TouchableOpacity>

          {/* Templates */}
          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => navigation.navigate('Templates')}
            activeOpacity={0.7}
          >
            <View style={styles.quickActionTile}>
              <Ionicons name="document-text-outline" size={24} color="#00B67A" />
            </View>
            <Text style={styles.quickActionLabel}>Templates</Text>
          </TouchableOpacity>
        </View>

        {/* Business Tools Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Business Tools</Text>
          <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('BroadcastCampaigns')}>
            <Text style={styles.exploreLink}>Explore</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.businessToolsRow}>
          <TouchableOpacity
            style={styles.toolCol}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('BroadcastCampaigns')}
          >
            <View style={styles.toolSquircle}>
              <Ionicons name="megaphone-outline" size={20} color="#00B67A" />
            </View>
            <Text style={styles.toolTitle}>Campaigns</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolCol}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('AutomationDashboard')}
          >
            <View style={styles.toolSquircle}>
              <Ionicons name="sparkles-outline" size={20} color="#00B67A" />
            </View>
            <Text style={styles.toolTitle}>Automation</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolCol}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('AnalyticsOverview')}
          >
            <View style={styles.toolSquircle}>
              <Ionicons name="bar-chart-outline" size={20} color="#00B67A" />
            </View>
            <Text style={styles.toolTitle}>Analytics</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolCol}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('CrmPipeline')}
          >
            <View style={styles.toolSquircle}>
              <Ionicons name="git-network-outline" size={20} color="#00B67A" />
            </View>
            <Text style={styles.toolTitle}>Pipeline</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolCol}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('CommerceHub')}
          >
            <View style={styles.toolSquircle}>
              <Ionicons name="cart-outline" size={20} color="#00B67A" />
            </View>
            <Text style={styles.toolTitle}>Commerce</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterPillsRow}
        >
          <TouchableOpacity
            style={[styles.filterPill, activeFilter === 'unread' && styles.filterPillActive]}
            onPress={() => setActiveFilter('unread')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="chatbubble-outline"
              size={14}
              color={activeFilter === 'unread' ? '#00B67A' : '#6B7280'}
            />
            <Text
              style={[
                styles.filterPillText,
                activeFilter === 'unread' && styles.filterPillTextActive,
              ]}
            >
              Unread Messages
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterPill, activeFilter === 'followups' && styles.filterPillActive]}
            onPress={() => setActiveFilter('followups')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="time-outline"
              size={14}
              color={activeFilter === 'followups' ? '#00B67A' : '#6B7280'}
            />
            <Text
              style={[
                styles.filterPillText,
                activeFilter === 'followups' && styles.filterPillTextActive,
              ]}
            >
              Follow-ups
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterPill, activeFilter === 'campaigns' && styles.filterPillActive]}
            onPress={() => setActiveFilter('campaigns')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="megaphone-outline"
              size={14}
              color={activeFilter === 'campaigns' ? '#00B67A' : '#6B7280'}
            />
            <Text
              style={[
                styles.filterPillText,
                activeFilter === 'campaigns' && styles.filterPillTextActive,
              ]}
            >
              My Campaigns
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* AI Copilot Resource Banner */}
        <View style={styles.copilotCard}>
          <View style={styles.copilotLeft}>
            <Text style={styles.copilotTag}>MESSBEE</Text>
            <Text style={styles.copilotHeading}>Your business copilot</Text>
            <Text style={styles.copilotDesc}>
              Create replies, summarize chats, and generate campaign ideas.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.askButton}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('AutomationDashboard')}
          >
            <Text style={styles.askButtonText}>Ask  ›</Text>
          </TouchableOpacity>
        </View>

        {/* People Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>People</Text>
          <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('Contacts')}>
            <Text style={styles.exploreLink}>See all ({contacts.length})</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color="#00B67A" />
          </View>
        ) : contacts.length === 0 ? (
          <View style={styles.emptyPeopleBox}>
            <Ionicons name="people-outline" size={28} color="#9CA3AF" />
            <Text style={styles.emptyText}>No contacts yet</Text>
            <TouchableOpacity
              style={styles.emptyAddBtn}
              onPress={() => navigation.navigate('AddContact')}
            >
              <Text style={styles.emptyAddBtnText}>+ Add Contact</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.peopleRow}
          >
            {contacts.slice(0, 15).map((person, index) => {
              const pal = AVATAR_PALETTE[index % AVATAR_PALETTE.length];
              const initials = getInitials(person.name || person.phone || 'Contact');
              return (
                <TouchableOpacity
                  key={person._id || person.id || `person_${index}`}
                  style={styles.personCol}
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('Contacts')}
                >
                  <View style={[styles.personAvatarCircle, { backgroundColor: pal.bg }]}>
                    <Text style={[styles.personAvatarInitials, { color: pal.text }]}>
                      {initials}
                    </Text>
                  </View>
                  <Text style={styles.personName} numberOfLines={1}>
                    {(person.name || person.phone || '').split(' ')[0]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* Recent Chats Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Chats</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Chats')} activeOpacity={0.7}>
            <Text style={styles.exploreLink}>View all ({chats.length})</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color="#00B67A" />
          </View>
        ) : filteredChats.length === 0 ? (
          <View style={styles.emptyChatsBox}>
            <Ionicons name="chatbubbles-outline" size={32} color="#9CA3AF" />
            <Text style={styles.emptyText}>No active conversations</Text>
            <TouchableOpacity
              style={styles.emptyAddBtn}
              onPress={() => navigation.navigate('Chats')}
            >
              <Text style={styles.emptyAddBtnText}>Start a chat</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.chatsList}>
            {filteredChats.slice(0, 8).map((chat, index) => {
              const pal = AVATAR_PALETTE[index % AVATAR_PALETTE.length];
              const name = chat.name || chat.phone || chat.contactName || 'WhatsApp Contact';
              const initials = getInitials(name);
              const unread = chat.unreadCount || chat.unread || 0;
              const lastMsg =
                chat.lastMessage?.text ||
                chat.lastMessage ||
                chat.snippet ||
                'Tap to open conversation';
              const time =
                chat.lastMessageTime ||
                (chat.updatedAt ? new Date(chat.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '');

              return (
                <TouchableOpacity
                  key={chat._id || chat.id || `chat_${index}`}
                  style={styles.chatCardRow}
                  onPress={() => navigation.navigate('ChatDetail', { chat })}
                  activeOpacity={0.7}
                >
                  <View style={[styles.chatAvatarCircle, { backgroundColor: pal.bg }]}>
                    <Text style={[styles.chatAvatarInitials, { color: pal.text }]}>
                      {initials}
                    </Text>
                  </View>

                  <View style={styles.chatDetailsCol}>
                    <View style={styles.chatTopLine}>
                      <Text style={styles.chatContactName} numberOfLines={1}>
                        {name}
                      </Text>
                      {!!time && <Text style={styles.chatTimeText}>{time}</Text>}
                    </View>
                    <View style={styles.chatBottomLine}>
                      <Text style={styles.chatPreviewText} numberOfLines={1}>
                        {lastMsg}
                      </Text>
                      {unread > 0 && (
                        <View style={styles.unreadCountBadge}>
                          <Text style={styles.unreadCountText}>{unread}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Footer Caught Up Note */}
        <Text style={styles.caughtUpText}>You're all caught up</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogoImage: {
    width: 110,
    height: 32,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 7,
    gap: 6,
  },
  searchText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  notifBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  notifBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  profileCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E2FBE8',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  profileInitialsText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#059669',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  bannerContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
    alignItems: 'center',
  },
  bannerImage: {
    borderRadius: 14,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  quickActionItem: {
    alignItems: 'center',
    gap: 6,
  },
  quickActionTile: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  exploreLink: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00B67A',
  },
  businessToolsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 12,
    paddingBottom: 14,
  },
  toolCol: {
    alignItems: 'center',
    gap: 6,
  },
  toolSquircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  toolTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4B5563',
  },
  filterPillsRow: {
    paddingHorizontal: 16,
    gap: 8,
    paddingVertical: 10,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  filterPillActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterPillTextActive: {
    color: '#059669',
  },
  copilotCard: {
    marginHorizontal: 16,
    marginVertical: 10,
    backgroundColor: '#064E3B',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  copilotLeft: {
    flex: 1,
    paddingRight: 10,
  },
  copilotTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6EE7B7',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  copilotHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  copilotDesc: {
    fontSize: 12,
    color: '#D1FAE5',
    lineHeight: 16,
  },
  askButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  askButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  peopleRow: {
    paddingHorizontal: 16,
    gap: 14,
    paddingBottom: 6,
  },
  personCol: {
    alignItems: 'center',
    gap: 4,
    width: 60,
  },
  personAvatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  personAvatarInitials: {
    fontSize: 16,
    fontWeight: '700',
  },
  personName: {
    fontSize: 11,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
  },
  chatsList: {
    paddingHorizontal: 16,
    gap: 10,
  },
  chatCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    gap: 12,
  },
  chatAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatAvatarInitials: {
    fontSize: 14,
    fontWeight: '700',
  },
  chatDetailsCol: {
    flex: 1,
  },
  chatTopLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  chatContactName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  chatTimeText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  chatBottomLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatPreviewText: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
  unreadCountBadge: {
    backgroundColor: '#00B67A',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  unreadCountText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  loadingBox: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyPeopleBox: {
    paddingVertical: 20,
    alignItems: 'center',
    gap: 6,
  },
  emptyChatsBox: {
    paddingVertical: 24,
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  emptyAddBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#ECFDF5',
    borderRadius: 14,
  },
  emptyAddBtnText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
  caughtUpText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 20,
  },
});
