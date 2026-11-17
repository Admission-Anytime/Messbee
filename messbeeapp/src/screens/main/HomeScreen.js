import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Image,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const PEOPLE = [
  {
    id: '1',
    name: 'Kunal',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    color: '#3B82F6',
  },
  {
    id: '2',
    name: 'Vinay',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    color: '#10B981',
  },
  {
    id: '3',
    name: 'Vaani',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    color: '#EC4899',
  },
  {
    id: '4',
    name: 'Ranjit',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    color: '#F59E0B',
  },
  {
    id: '5',
    name: 'Puja',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    color: '#8B5CF6',
  },
  {
    id: '6',
    name: 'Rohit',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    color: '#06B6D4',
  },
  {
    id: '7',
    name: 'Niha',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150',
    color: '#F43F5E',
  },
];

const RECENT_CHATS = [
  {
    id: '1',
    name: 'Rahul Sharma',
    initials: 'RS',
    avatarBg: '#FED7AA',
    avatarText: '#C2410C',
    lastMessage: 'Can you share the product details?',
    time: '10:42',
    unread: 2,
    online: true,
  },
  {
    id: '2',
    name: 'Priya Verma',
    initials: 'PV',
    avatarBg: '#BFDBFE',
    avatarText: '#1D4ED8',
    lastMessage: 'Thank you for your help!',
    time: '9:15',
    unread: 0,
    online: false,
  },
  {
    id: '3',
    name: 'Amit Kumar',
    initials: 'AK',
    avatarBg: '#E9D5FF',
    avatarText: '#7E22CE',
    lastMessage: 'Please send me the pricing.',
    time: 'Yesterday',
    unread: 1,
    online: false,
  },
];

export default function HomeScreen({ navigation }) {
  const [activeFilter, setActiveFilter] = useState('unread');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Top Header Bar (Logo on Left, Search & Profile on Right) */}
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
            style={styles.profileCircle}
            onPress={() => navigation.navigate('You')}
            activeOpacity={0.8}
          >
            <Ionicons name="person-outline" size={18} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Top Hero Banner */}
        <View style={styles.bannerContainer}>
          <Image
            source={require('../../../assets/home_hero_banner.png')}
            style={styles.bannerImage}
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
            onPress={() => navigation.navigate('Chats')}
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
            onPress={() => navigation.navigate('BotMenu')}
          >
            <View style={styles.toolSquircle}>
              <Ionicons name="sparkles-outline" size={20} color="#00B67A" />
            </View>
            <Text style={styles.toolTitle}>Automation</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.toolCol} activeOpacity={0.7}>
            <View style={styles.toolSquircle}>
              <Ionicons name="bar-chart-outline" size={20} color="#00B67A" />
            </View>
            <Text style={styles.toolTitle}>Analytics</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.toolCol} activeOpacity={0.7}>
            <View style={styles.toolSquircle}>
              <Ionicons name="cart-outline" size={20} color="#00B67A" />
            </View>
            <Text style={styles.toolTitle}>Commerce</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.toolCol} activeOpacity={0.7}>
            <View style={styles.toolSquircle}>
              <Ionicons name="cube-outline" size={20} color="#00B67A" />
            </View>
            <Text style={styles.toolTitle}>Inventory</Text>
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

        {/* AI Copilot Resource Banner (Dark Forest Green Card) */}
        <View style={styles.copilotCard}>
          <View style={styles.copilotLeft}>
            <Text style={styles.copilotTag}>MESSBEE</Text>
            <Text style={styles.copilotHeading}>Your business copilot</Text>
            <Text style={styles.copilotDesc}>
              Create replies, summarize chats, and generate campaign ideas.
            </Text>
          </View>

          <TouchableOpacity style={styles.askButton} activeOpacity={0.85}>
            <Text style={styles.askButtonText}>Ask  ›</Text>
          </TouchableOpacity>
        </View>

        {/* People Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>People</Text>
          <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('Contacts')}>
            <Text style={styles.exploreLink}>See all</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.peopleRow}
        >
          {PEOPLE.map((person) => (
            <TouchableOpacity key={person.id} style={styles.personCol} activeOpacity={0.7}>
              <Image source={{ uri: person.avatar }} style={styles.personAvatarImg} />
              <Text style={styles.personName}>{person.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Recent Chats Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Chats</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Chats')} activeOpacity={0.7}>
            <Text style={styles.exploreLink}>View all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.chatsList}>
          {RECENT_CHATS.map((chat) => (
            <TouchableOpacity
              key={chat.id}
              style={styles.chatCardRow}
              onPress={() => navigation.navigate('ChatDetail', { chat })}
              activeOpacity={0.7}
            >
              <View style={[styles.chatAvatarCircle, { backgroundColor: chat.avatarBg }]}>
                <Text style={[styles.chatAvatarInitials, { color: chat.avatarText }]}>
                  {chat.initials}
                </Text>
              </View>

              <View style={styles.chatDetailsCol}>
                <View style={styles.chatTopLine}>
                  <Text style={styles.chatContactName}>{chat.name}</Text>
                  <Text style={styles.chatTimeText}>{chat.time}</Text>
                </View>
                <View style={styles.chatBottomLine}>
                  <Text style={styles.chatPreviewText} numberOfLines={1}>
                    {chat.lastMessage}
                  </Text>
                  {chat.unread > 0 && (
                    <View style={styles.unreadCountBadge}>
                      <Text style={styles.unreadCountText}>{chat.unread}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

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
    paddingTop: Platform.OS === 'android' ? 24 : 8,
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
  profileCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  scrollContent: {
    paddingBottom: 32,
  },

  /* Hero Banner */
  bannerContainer: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 14,
    alignItems: 'center',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  bannerImage: {
    width: width - 32,
    height: (width - 32) * (416 / 863),
    borderRadius: 20,
  },

  /* 4 Quick Actions */
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    marginBottom: 20,
  },
  quickActionItem: {
    alignItems: 'center',
    width: (width - 36 - 36) / 4,
  },
  quickActionTile: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: '#E6F4EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  quickActionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },

  /* Business Tools */
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginBottom: 12,
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
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    marginBottom: 16,
  },
  toolCol: {
    alignItems: 'center',
    width: (width - 36 - 32) / 5,
  },
  toolSquircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  toolTitle: {
    fontSize: 10,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },

  /* Filter Pills */
  filterPillsRow: {
    paddingHorizontal: 18,
    gap: 8,
    marginBottom: 18,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterPillActive: {
    backgroundColor: '#E8F5E9',
    borderColor: '#00B67A',
  },
  filterPillText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
  },
  filterPillTextActive: {
    color: '#00B67A',
    fontWeight: '700',
  },

  /* AI Copilot Card */
  copilotCard: {
    marginHorizontal: 18,
    backgroundColor: '#064E3B',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  copilotLeft: {
    flex: 1,
    paddingRight: 12,
  },
  copilotTag: {
    fontSize: 9,
    fontWeight: '800',
    color: '#34D399',
    letterSpacing: 1,
    marginBottom: 3,
  },
  copilotHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  copilotDesc: {
    fontSize: 11,
    color: '#A7F3D0',
    lineHeight: 15,
  },
  askButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  askButtonText: {
    color: '#064E3B',
    fontSize: 12,
    fontWeight: '700',
  },

  /* People Carousel */
  peopleRow: {
    paddingHorizontal: 18,
    gap: 14,
    marginBottom: 22,
  },
  personCol: {
    alignItems: 'center',
  },
  personAvatarImg: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginBottom: 6,
    backgroundColor: '#F3F4F6',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  personName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
  },

  /* Recent Chats */
  chatsList: {
    paddingHorizontal: 18,
    marginBottom: 16,
  },
  chatCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  chatAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  chatAvatarInitials: {
    fontSize: 15,
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
    fontWeight: '700',
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
    flex: 1,
    fontSize: 12,
    color: '#6B7280',
    paddingRight: 8,
  },
  unreadCountBadge: {
    backgroundColor: '#00B67A',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  unreadCountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  caughtUpText: {
    textAlign: 'center',
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 8,
    marginBottom: 10,
  },
});
