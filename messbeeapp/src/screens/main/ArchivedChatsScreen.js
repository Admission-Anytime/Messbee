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

const DEFAULT_ARCHIVED = [
  {
    _id: 'arch_1',
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
    archived: true,
  },
  {
    _id: 'arch_2',
    name: 'Rahul',
    phone: '+91 98765 43210',
    lastMessage: 'Hello Rahul, thank you for contacting Admission An...',
    time: 'Mon',
    unread: 0,
    avatarText: 'RA',
    avatarBg: '#E0F2FE',
    avatarColor: '#0369A1',
    status: 'Open',
    statusBg: '#DCFCE7',
    statusColor: '#166534',
    archived: true,
  },
];

export default function ArchivedChatsScreen({ navigation }) {
  const [archivedChats, setArchivedChats] = useState(DEFAULT_ARCHIVED);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChats = archivedChats.filter((c) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.lastMessage.toLowerCase().includes(q);
    }
    return true;
  });

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chatCard}
      onPress={() => navigation.navigate('ChatDetail', { chat: item })}
      activeOpacity={0.7}
    >
      <View style={[styles.avatarSquircle, { backgroundColor: item.avatarBg }]}>
        <Text style={[styles.avatarInitials, { color: item.avatarColor }]}>{item.avatarText}</Text>
        <View style={styles.whatsappDotBadge}>
          <Ionicons name="logo-whatsapp" size={8} color="#FFFFFF" />
        </View>
      </View>

      <View style={styles.chatContent}>
        <View style={styles.topRow}>
          <Text style={styles.contactName}>{item.name}</Text>
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

        <View style={styles.statusPill}>
          <View style={[styles.statusDot, { backgroundColor: item.statusColor }]} />
          <Text style={[styles.statusText, { color: item.statusColor }]}>{item.status}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* Header (Matching Image 1 Screen 2) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>Archived Chats</Text>
          <Text style={styles.headerSubtitle}>Conversations you've archived</Text>
        </View>
        <TouchableOpacity style={styles.headerBtn}>
          <Ionicons name="ellipsis-vertical" size={20} color="#0F172A" />
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={17} color="#94A3B8" style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search archived chats..."
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Section Header */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>ARCHIVED CONVERSATIONS</Text>
        <Text style={styles.sectionCount}>{filteredChats.length} chats</Text>
      </View>

      {/* List */}
      <FlatList
        data={filteredChats}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  headerBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleBox: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 16.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
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
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
  },
  sectionCount: {
    fontSize: 11.5,
    color: '#94A3B8',
  },
  listContent: {
    paddingHorizontal: 16,
  },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  avatarSquircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginRight: 14,
  },
  avatarInitials: {
    fontSize: 15,
    fontWeight: '800',
  },
  whatsappDotBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 16,
    height: 16,
    borderRadius: 8,
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
  },
  chatTime: {
    fontSize: 11,
    color: '#94A3B8',
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
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
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
});
