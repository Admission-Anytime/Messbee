import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/colors';

const PEOPLE = [
  { id: '1', name: 'Kunal', initials: 'K', color: '#3B82F6', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
  { id: '2', name: 'Vinay', initials: 'V', color: '#10B981', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
  { id: '3', name: 'Vaani', initials: 'V', color: '#EC4899', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
  { id: '4', name: 'Ranjit', initials: 'R', color: '#F59E0B', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
];

const RECENT_CHATS = [
  {
    id: '1',
    name: 'Rahul Sharma',
    initials: 'RS',
    color: '#FB923C',
    lastMessage: 'Can you share the product details?',
    time: '10:42',
    unread: 1,
    online: true,
  },
  {
    id: '2',
    name: 'Priya Verma',
    initials: 'PV',
    color: '#60A5FA',
    lastMessage: 'Thank you for your help!',
    time: '9:15',
    unread: 0,
    online: false,
  },
  {
    id: '3',
    name: 'Amit Kumar',
    initials: 'AK',
    color: '#A78BFA',
    lastMessage: 'Please send me the pricing.',
    time: 'Yesterday',
    unread: 2,
    online: false,
  },
];

export default function HomeScreen({ navigation }) {
  const [activeFilter, setActiveFilter] = useState('unread');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Top App Header */}
      <View style={styles.header}>
        {/* Logo */}
        <View style={styles.logoBox}>
          <Ionicons name="chatbubbles" size={24} color={COLORS.primary} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            placeholder="Search chats or contacts"
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
          />
        </View>

        {/* Profile Avatar Button */}
        <TouchableOpacity
          style={styles.profileBtn}
          onPress={() => navigation.navigate('You')}
          activeOpacity={0.8}
        >
          <Ionicons name="person-outline" size={20} color="#4B5563" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Banner */}
        <View style={styles.bannerContainer}>
          <LinearGradient
            colors={['#E6F9F0', '#DCFCE7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.bannerGradient}
          >
            <View style={styles.bannerGraphic}>
              <View style={styles.bannerIconBadge}>
                <Ionicons name="storefront" size={32} color={COLORS.primaryDark} />
              </View>
              <View style={styles.bannerPhoneBadge}>
                <Ionicons name="phone-portrait-outline" size={20} color={COLORS.primary} />
              </View>
            </View>
            <Text style={styles.bannerText}>
              Your business conversations, <Text style={styles.bannerBold}>all in one place.</Text>
            </Text>
          </LinearGradient>
        </View>

        {/* 4 Quick Action Cards */}
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Chats')}
            activeOpacity={0.7}
          >
            <View style={styles.actionIconBox}>
              <Ionicons name="chatbubble-ellipses" size={22} color={COLORS.primaryDark} />
            </View>
            <Text style={styles.actionLabel}>New Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Contacts')}
            activeOpacity={0.7}
          >
            <View style={styles.actionIconBox}>
              <Ionicons name="people" size={22} color={COLORS.primaryDark} />
            </View>
            <Text style={styles.actionLabel}>Contacts</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Chats')}
            activeOpacity={0.7}
          >
            <View style={styles.actionIconBox}>
              <Ionicons name="flash" size={22} color={COLORS.primaryDark} />
            </View>
            <Text style={styles.actionLabel}>Quick Replies</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Chats')}
            activeOpacity={0.7}
          >
            <View style={styles.actionIconBox}>
              <Ionicons name="document-text" size={22} color={COLORS.primaryDark} />
            </View>
            <Text style={styles.actionLabel}>Templates</Text>
          </TouchableOpacity>
        </View>

        {/* Business Tools Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Business Tools</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.sectionLink}>Explore</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.toolsRow}>
          <TouchableOpacity style={styles.toolItem} activeOpacity={0.7}>
            <View style={styles.toolIconCircle}>
              <Ionicons name="megaphone-outline" size={22} color="#1F2937" />
            </View>
            <Text style={styles.toolLabel}>Campaigns</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.toolItem} activeOpacity={0.7}>
            <View style={styles.toolIconCircle}>
              <Ionicons name="hardware-chip-outline" size={22} color="#1F2937" />
            </View>
            <Text style={styles.toolLabel}>Automation</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.toolItem} activeOpacity={0.7}>
            <View style={styles.toolIconCircle}>
              <Ionicons name="bar-chart-outline" size={22} color="#1F2937" />
            </View>
            <Text style={styles.toolLabel}>Analytics</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.toolItem} activeOpacity={0.7}>
            <View style={styles.toolIconCircle}>
              <Ionicons name="cart-outline" size={22} color="#1F2937" />
            </View>
            <Text style={styles.toolLabel}>Commerce</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.toolItem} activeOpacity={0.7}>
            <View style={styles.toolIconCircle}>
              <Ionicons name="cube-outline" size={22} color="#1F2937" />
            </View>
            <Text style={styles.toolLabel}>Inventory</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <TouchableOpacity
            style={[styles.filterChip, activeFilter === 'unread' && styles.filterChipActive]}
            onPress={() => setActiveFilter('unread')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="flag-outline"
              size={15}
              color={activeFilter === 'unread' ? COLORS.primaryDark : '#6B7280'}
            />
            <Text
              style={[
                styles.filterChipText,
                activeFilter === 'unread' && styles.filterChipTextActive,
              ]}
            >
              Unread Messages
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, activeFilter === 'followups' && styles.filterChipActive]}
            onPress={() => setActiveFilter('followups')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="time-outline"
              size={15}
              color={activeFilter === 'followups' ? COLORS.primaryDark : '#6B7280'}
            />
            <Text
              style={[
                styles.filterChipText,
                activeFilter === 'followups' && styles.filterChipTextActive,
              ]}
            >
              Follow-ups
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, activeFilter === 'campaigns' && styles.filterChipActive]}
            onPress={() => setActiveFilter('campaigns')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="radio-button-on"
              size={15}
              color={activeFilter === 'campaigns' ? COLORS.primaryDark : '#6B7280'}
            />
            <Text
              style={[
                styles.filterChipText,
                activeFilter === 'campaigns' && styles.filterChipTextActive,
              ]}
            >
              My Campaigns
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* AI Copilot Resource Card */}
        <View style={styles.copilotCard}>
          <LinearGradient
            colors={['#064E3B', '#047857']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0.8 }}
            style={styles.copilotGradient}
          >
            <View style={styles.copilotTopRow}>
              <View style={styles.copilotBadge}>
                <Text style={styles.copilotBadgeText}>RESOURCE</Text>
              </View>
            </View>
            <Text style={styles.copilotTitle}>Your business copilot</Text>
            <Text style={styles.copilotDesc}>
              Create replies, summarize chats, and generate campaign ideas.
            </Text>

            <TouchableOpacity style={styles.askBtn} activeOpacity={0.85}>
              <Text style={styles.askBtnText}>Ask</Text>
              <Ionicons name="chevron-forward" size={14} color="#064E3B" />
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* People Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>People</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.sectionLink}>See all</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.peopleScroll}>
          {PEOPLE.map((person) => (
            <TouchableOpacity key={person.id} style={styles.personItem} activeOpacity={0.7}>
              <View style={[styles.avatarCircle, { backgroundColor: person.color }]}>
                <Text style={styles.avatarText}>{person.initials}</Text>
              </View>
              <Text style={styles.personName}>{person.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Recent Chats Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Chats</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Chats')} activeOpacity={0.7}>
            <Text style={styles.sectionLink}>View all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.chatsList}>
          {RECENT_CHATS.map((chat) => (
            <TouchableOpacity
              key={chat.id}
              style={styles.chatRow}
              onPress={() => navigation.navigate('ChatDetail', { chat })}
              activeOpacity={0.7}
            >
              <View style={[styles.chatAvatar, { backgroundColor: chat.color }]}>
                <Text style={styles.chatAvatarText}>{chat.initials}</Text>
                {chat.online && <View style={styles.onlineDot} />}
              </View>

              <View style={styles.chatInfo}>
                <View style={styles.chatTitleRow}>
                  <Text style={styles.chatName}>{chat.name}</Text>
                  <Text style={styles.chatTime}>{chat.time}</Text>
                </View>
                <View style={styles.chatMsgRow}>
                  <Text style={styles.chatLastMsg} numberOfLines={1}>
                    {chat.lastMessage}
                  </Text>
                  {chat.unread > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadText}>{chat.unread}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Caught up footer */}
        <View style={styles.footerNote}>
          <Ionicons name="checkmark-done" size={16} color="#9CA3AF" />
          <Text style={styles.footerNoteText}>You're all caught up</Text>
        </View>
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
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  logoBox: {
    marginRight: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 14,
    height: 40,
    marginRight: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  profileBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  bannerContainer: {
    paddingHorizontal: 16,
    marginTop: 14,
  },
  bannerGradient: {
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  bannerGraphic: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  bannerIconBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#A7F3D0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerPhoneBadge: {
    marginLeft: -14,
    marginTop: 20,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  bannerText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#065F46',
  },
  bannerBold: {
    fontWeight: '800',
    color: '#047857',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 18,
  },
  actionCard: {
    alignItems: 'center',
    width: '23%',
  },
  actionIconBox: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: '#E6F9F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },
  sectionLink: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primaryDark,
  },
  toolsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  toolItem: {
    alignItems: 'center',
    width: '18%',
  },
  toolIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  toolLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#4B5563',
    textAlign: 'center',
  },
  filterScroll: {
    paddingLeft: 16,
    marginBottom: 20,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 10,
  },
  filterChipActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 6,
  },
  filterChipTextActive: {
    color: COLORS.primaryDark,
  },
  copilotCard: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  copilotGradient: {
    borderRadius: 20,
    padding: 18,
  },
  copilotTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  copilotBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  copilotBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  copilotTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  copilotDesc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 18,
    marginBottom: 14,
  },
  askBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
  },
  askBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#064E3B',
    marginRight: 2,
  },
  peopleScroll: {
    paddingLeft: 16,
    marginBottom: 20,
  },
  personItem: {
    alignItems: 'center',
    marginRight: 18,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  personName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  chatsList: {
    paddingHorizontal: 16,
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  chatAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  chatAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  chatInfo: {
    flex: 1,
  },
  chatTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  chatTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  chatMsgRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatLastMsg: {
    flex: 1,
    fontSize: 13,
    color: '#6B7280',
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: COLORS.primary,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  unreadText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  footerNote: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerNoteText: {
    fontSize: 13,
    color: '#9CA3AF',
    marginLeft: 6,
  },
});
