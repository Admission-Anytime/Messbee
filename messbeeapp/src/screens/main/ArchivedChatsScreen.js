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
  Alert,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { chatService, resolveFileUrl } from '../../services/api';

export default function ArchivedChatsScreen({ navigation }) {
  const [archivedChats, setArchivedChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadArchivedChats = useCallback(async () => {
    try {
      const allChats = await chatService.getChats();
      const colors = [
        { bg: '#D1FAE5', color: '#065F46' },
        { bg: '#F3E8FF', color: '#6B21A8' },
        { bg: '#E0F2FE', color: '#0369A1' },
        { bg: '#FFEDD5', color: '#C2410C' },
      ];

      const onlyArchived = (Array.isArray(allChats) ? allChats : [])
        .filter((item) => String(item.chatStatus || item.status || '').toLowerCase() === 'archived' || item.archived === true)
        .map((item, idx) => {
          const rawName = item.name || item.whatsappId || item.phone || `Contact ${idx + 1}`;
          const initials = rawName.slice(0, 2).toUpperCase();
          const colorPair = colors[idx % colors.length];
          return {
            _id: item._id || item.id,
            name: rawName,
            phone: item.phone || item.whatsappId || rawName,
            lastMessage: item.lastMsg || item.lastMessage?.text || item.lastMessage || 'No messages yet',
            time: item.lastMsgTime || (item.updatedAt ? new Date(item.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''),
            unread: item.unread || item.unreadCount || 0,
            avatarUrl: resolveFileUrl(item.avatar, true),
            avatarText: initials || 'WA',
            avatarBg: colorPair.bg,
            avatarColor: colorPair.color,
            status: 'Archived',
            statusBg: '#F1F5F9',
            statusColor: '#475569',
            archived: true,
          };
        });

      setArchivedChats(onlyArchived);
    } catch (err) {
      console.warn('ArchivedChats load error:', err.message);
      setArchivedChats([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadArchivedChats();
    const unsub = navigation.addListener('focus', loadArchivedChats);
    return unsub;
  }, [loadArchivedChats, navigation]);

  const handleUnarchive = async (item) => {
    try {
      await chatService.toggleArchive(item._id);
      setArchivedChats((prev) => prev.filter((c) => c._id !== item._id));
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.error || err?.message || 'Failed to unarchive chat.');
    }
  };

  const filteredChats = archivedChats.filter((c) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.lastMessage.toLowerCase().includes(q) || String(c.phone).toLowerCase().includes(q);
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
        {item.avatarUrl ? (
          <Image source={{ uri: item.avatarUrl }} style={{ width: 46, height: 46, borderRadius: 15 }} />
        ) : (
          <Text style={[styles.avatarInitials, { color: item.avatarColor }]}>{item.avatarText}</Text>
        )}
        <View style={styles.whatsappDotBadge}>
          <Ionicons name="logo-whatsapp" size={8} color="#FFFFFF" />
        </View>
      </View>

      <View style={styles.chatContent}>
        <View style={styles.topRow}>
          <Text style={styles.contactName} numberOfLines={1}>{item.name}</Text>
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

        <View style={styles.footerRow}>
          <View style={styles.statusPill}>
            <View style={[styles.statusDot, { backgroundColor: item.statusColor }]} />
            <Text style={[styles.statusText, { color: item.statusColor }]}>{item.status}</Text>
          </View>

          <TouchableOpacity
            style={styles.unarchiveBtn}
            onPress={() => handleUnarchive(item)}
            activeOpacity={0.75}
          >
            <Ionicons name="arrow-undo-outline" size={12} color="#00875A" style={{ marginRight: 4 }} />
            <Text style={styles.unarchiveText}>Unarchive</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>Archived Chats</Text>
          <Text style={styles.headerSubtitle}>Conversations you've archived</Text>
        </View>
        <TouchableOpacity style={styles.headerBtn} onPress={loadArchivedChats}>
          <Ionicons name="refresh-outline" size={20} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchWrap}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search archived chats"
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <FlatList
        data={filteredChats}
        keyExtractor={(item, idx) => String(item._id || idx)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadArchivedChats();
            }}
            colors={['#00875A']}
          />
        }
        ListEmptyComponent={
          loading ? (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#00875A" />
            </View>
          ) : (
            <View style={{ paddingVertical: 50, alignItems: 'center', paddingHorizontal: 24 }}>
              <Ionicons name="archive-outline" size={38} color="#94A3B8" />
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#0F172A', marginTop: 10 }}>
                No archived chats
              </Text>
              <Text style={{ fontSize: 12.5, color: '#64748B', textAlign: 'center', marginTop: 4 }}>
                Chats you archive from the chat actions menu will appear here.
              </Text>
            </View>
          )
        }
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
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitleBox: { flex: 1, marginLeft: 4 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  headerSubtitle: { fontSize: 11.5, color: '#64748B' },
  searchWrap: { paddingHorizontal: 16, paddingVertical: 10 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 13.5, color: '#0F172A' },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  avatarSquircle: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarInitials: { fontSize: 16, fontWeight: '800' },
  whatsappDotBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#25D366',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  chatContent: { flex: 1, marginLeft: 12 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  contactName: { fontSize: 14.5, fontWeight: '700', color: '#0F172A', flex: 1, marginRight: 8 },
  chatTime: { fontSize: 11, color: '#94A3B8' },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 3 },
  lastMessageText: { fontSize: 12.5, color: '#64748B', flex: 1, marginRight: 8 },
  unreadBadge: {
    backgroundColor: '#00875A',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadBadgeText: { fontSize: 10.5, fontWeight: '700', color: '#FFFFFF' },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  statusText: { fontSize: 10.5, fontWeight: '700' },
  unarchiveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  unarchiveText: { fontSize: 11, fontWeight: '700', color: '#00875A' },
});
