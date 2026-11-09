import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

const TABS = ['All', 'Unread', 'Groups', 'Broadcast', 'Starred'];

const CHATS_DATA = [
  {
    id: '1',
    name: 'Rahul Sharma',
    tag: 'VIP Lead',
    tagColor: '#FEF3C7',
    tagTextColor: '#92400E',
    lastMessage: 'Can you share the product details and catalog?',
    time: '10:42 AM',
    unread: 2,
    color: '#FB923C',
    initials: 'RS',
    online: true,
  },
  {
    id: '2',
    name: 'Priya Verma',
    tag: 'Customer',
    tagColor: '#D1FAE5',
    tagTextColor: '#065F46',
    lastMessage: 'Thank you for your help! Order placed.',
    time: '09:15 AM',
    unread: 0,
    color: '#60A5FA',
    initials: 'PV',
    online: false,
  },
  {
    id: '3',
    name: 'Amit Kumar',
    tag: 'Negotiation',
    tagColor: '#E0E7FF',
    tagTextColor: '#3730A3',
    lastMessage: 'Please send me the pricing invoice copy.',
    time: 'Yesterday',
    unread: 1,
    color: '#A78BFA',
    initials: 'AK',
    online: false,
  },
  {
    id: '4',
    name: 'Anjali Gupta',
    tag: 'New Inquiry',
    tagColor: '#FCE7F3',
    tagTextColor: '#9D174D',
    lastMessage: 'Hi, are your services available on weekends?',
    time: 'Yesterday',
    unread: 0,
    color: '#F472B6',
    initials: 'AG',
    online: true,
  },
  {
    id: '5',
    name: 'Vikram Singh',
    tag: 'Enterprise',
    tagColor: '#FEF9C3',
    tagTextColor: '#854D0E',
    lastMessage: 'We would like to book a team demo next Tuesday.',
    time: '2 Nov',
    unread: 0,
    color: '#34D399',
    initials: 'VS',
    online: false,
  },
  {
    id: '6',
    name: 'Neha Kapoor',
    tag: 'Support',
    tagColor: '#FEE2E2',
    tagTextColor: '#991B1B',
    lastMessage: 'Ticket #4092 resolved. Closing conversation.',
    time: '31 Oct',
    unread: 0,
    color: '#F87171',
    initials: 'NK',
    online: false,
  },
];

export default function ChatsScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChats = CHATS_DATA.filter((chat) => {
    if (activeTab === 'Unread' && chat.unread === 0) return false;
    if (searchQuery.trim()) {
      return (
        chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  const renderChatItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chatRow}
      onPress={() => navigation.navigate('ChatDetail', { chat: item })}
      activeOpacity={0.7}
    >
      <View style={[styles.avatarCircle, { backgroundColor: item.color }]}>
        <Text style={styles.avatarText}>{item.initials}</Text>
        {item.online && <View style={styles.onlineBadge} />}
      </View>

      <View style={styles.chatDetails}>
        <View style={styles.nameRow}>
          <Text style={styles.chatName}>{item.name}</Text>
          <Text style={styles.chatTime}>{item.time}</Text>
        </View>

        <View style={styles.tagRow}>
          <View style={[styles.tagBadge, { backgroundColor: item.tagColor }]}>
            <Text style={[styles.tagText, { color: item.tagTextColor }]}>
              {item.tag}
            </Text>
          </View>
        </View>

        <View style={styles.messageRow}>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage}
          </Text>
          {item.unread > 0 && (
            <View style={styles.unreadCount}>
              <Text style={styles.unreadCountText}>{item.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chats</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
            <Ionicons name="filter-outline" size={22} color="#1F2937" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
            <Ionicons name="ellipsis-vertical" size={20} color="#1F2937" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            placeholder="Search messages, contacts..."
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
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
            const isActive = activeTab === item;
            return (
              <TouchableOpacity
                style={[styles.tabChip, isActive && styles.tabChipActive]}
                onPress={() => setActiveTab(item)}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={styles.tabsList}
        />
      </View>

      {/* Chats FlatList */}
      <FlatList
        data={filteredChats}
        keyExtractor={(item) => item.id}
        renderItem={renderChatItem}
        contentContainerStyle={styles.chatsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={56} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No chats found</Text>
            <Text style={styles.emptySubtitle}>Try changing filter or start a new chat</Text>
          </View>
        }
      />

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('Contacts')}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  searchSection: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  tabsContainer: {
    marginBottom: 8,
  },
  tabsList: {
    paddingHorizontal: 16,
  },
  tabChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
  },
  tabChipActive: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabTextActive: {
    color: COLORS.primaryDark,
  },
  chatsList: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  chatRow: {
    flexDirection: 'row',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  chatDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  chatTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  tagRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  tagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    flex: 1,
    fontSize: 13,
    color: '#6B7280',
    marginRight: 8,
  },
  unreadCount: {
    backgroundColor: COLORS.primary,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  unreadCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#374151',
    marginTop: 14,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
});
