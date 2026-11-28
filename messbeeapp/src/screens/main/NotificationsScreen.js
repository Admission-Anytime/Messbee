import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { io } from 'socket.io-client';
import { notificationService, getSocketUrl } from '../../services/api';

const getTypeIcon = (type) => {
  switch (type) {
    case 'chat':
    case 'mention':
      return { name: 'chatbubbles-outline', color: '#0284C7', bg: '#E0F2FE' };
    case 'lead':
    case 'contact':
      return { name: 'person-add-outline', color: '#10B981', bg: '#D1FAE5' };
    case 'campaign':
      return { name: 'megaphone-outline', color: '#8B5CF6', bg: '#EDE9FE' };
    case 'alert':
      return { name: 'warning-outline', color: '#F59E0B', bg: '#FEF3C7' };
    case 'system':
    default:
      return { name: 'notifications-outline', color: '#00B67A', bg: '#E8F8F2' };
  }
};

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await notificationService.getNotifications(1, 50);
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Notifications fetch error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const unsub = navigation.addListener('focus', fetchNotifications);
    return unsub;
  }, [fetchNotifications, navigation]);

  // Real-time Socket.IO listener for new notifications (matching web NotificationPage)
  useEffect(() => {
    let socket;
    try {
      socket = io(getSocketUrl(), {
        transports: ['websocket', 'polling'],
        reconnection: true,
      });
      socket.on('new_notification', (notif) => {
        if (!notif) return;
        setNotifications((prev) => {
          const id = notif._id || notif.id;
          if (id && prev.some((p) => (p._id || p.id) === id)) return prev;
          return [{ ...notif, isRead: false }, ...prev];
        });
      });
    } catch (err) {
      console.warn('Notification socket error:', err.message);
    }
    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleMarkAsRead = async (item) => {
    if (item.isRead) return;
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n._id === item._id ? { ...n, isRead: true } : n))
    );
    try {
      await notificationService.markAsRead(item._id);
    } catch (err) {
      console.warn('Failed to mark read:', err.message);
    }
  };

  const handleMarkAllRead = async () => {
    if (markingAll) return;
    setMarkingAll(true);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await notificationService.markAllAsRead();
    } catch (err) {
      Alert.alert('Error', 'Failed to mark all notifications as read.');
      fetchNotifications();
    } finally {
      setMarkingAll(false);
    }
  };

  const handleDelete = (item) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setNotifications((prev) => prev.filter((n) => n._id !== item._id));
            try {
              await notificationService.deleteNotification(item._id);
            } catch (err) {
              console.warn('Failed to delete notification:', err.message);
            }
          },
        },
      ]
    );
  };

  const handleNotificationPress = async (item) => {
    await handleMarkAsRead(item);
    const t = String(item.type || '').toLowerCase();
    if (t === 'chat' || t === 'mention') {
      navigation.navigate('MainTabs', { screen: 'Chats' });
    } else if (t === 'campaign') {
      navigation.navigate('BroadcastCampaigns');
    } else if (t === 'lead' || t === 'contact') {
      navigation.navigate('MainTabs', { screen: 'Contacts' });
    } else if (t === 'alert') {
      navigation.navigate('Inventory');
    }
  };

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    if (filter === 'unread') {
      return notifications.filter((n) => !n.isRead);
    }
    if (filter === 'chat') {
      return notifications.filter((n) => ['chat', 'mention'].includes(String(n.type || '').toLowerCase()));
    }
    if (filter === 'campaign') {
      return notifications.filter((n) => String(n.type || '').toLowerCase() === 'campaign');
    }
    if (filter === 'alert') {
      return notifications.filter((n) => ['alert', 'system'].includes(String(n.type || '').toLowerCase()));
    }
    return notifications;
  }, [notifications, filter]);

  const renderItem = ({ item }) => {
    const iconMeta = getTypeIcon(item.type);
    const timeStr = formatTimeAgo(item.createdAt);

    return (
      <TouchableOpacity
        style={[styles.itemCard, !item.isRead && styles.itemCardUnread]}
        activeOpacity={0.7}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={[styles.iconContainer, { backgroundColor: iconMeta.bg }]}>
          <Ionicons name={iconMeta.name} size={22} color={iconMeta.color} />
        </View>

        <View style={styles.itemContent}>
          <View style={styles.itemHeaderRow}>
            <Text style={[styles.itemTitle, !item.isRead && styles.itemTitleUnread]} numberOfLines={1}>
              {item.title || 'Notification'}
            </Text>
            <Text style={styles.itemTime}>{timeStr}</Text>
          </View>

          <Text style={styles.itemMessage} numberOfLines={2}>
            {item.message || ''}
          </Text>

          {item.meta && item.meta.length > 0 && (
            <View style={styles.metaRow}>
              {item.meta.slice(0, 2).map((m, idx) => (
                <View key={idx} style={styles.metaBadge}>
                  <Text style={styles.metaText}>
                    {m.label}: {m.value}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.actionCol}>
          {!item.isRead && <View style={styles.unreadDot} />}
          <TouchableOpacity
            style={styles.deleteBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={() => handleDelete(item)}
          >
            <Ionicons name="trash-outline" size={16} color="#94A3B8" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {unreadCount > 0 && (
            <TouchableOpacity
              onPress={handleMarkAllRead}
              style={styles.markAllBtn}
              disabled={markingAll}
            >
              <Ionicons name="checkmark-done-outline" size={18} color="#00B67A" />
              <Text style={styles.markAllText}>Read all</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => navigation.navigate('NotificationsSettings')}
            style={styles.backBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="settings-outline" size={20} color="#0F172A" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {[
            { id: 'all', label: `All (${notifications.length})` },
            { id: 'unread', label: `Unread (${unreadCount})` },
            { id: 'chat', label: 'Chats' },
            { id: 'campaign', label: 'Campaigns' },
            { id: 'alert', label: 'Alerts' },
          ].map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[styles.tab, filter === t.id && styles.tabActive]}
              onPress={() => setFilter(t.id)}
            >
              <Text style={[styles.tabText, filter === t.id && styles.tabTextActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#00B67A" />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredNotifications}
          keyExtractor={(item, index) => item._id || String(index)}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.listContent,
            filteredNotifications.length === 0 && { flex: 1, justifyContent: 'center' },
          ]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#00B67A']} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="notifications-off-outline" size={44} color="#94A3B8" />
              </View>
              <Text style={styles.emptyTitle}>
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {filter === 'unread'
                  ? 'All caught up! New alerts and messages will appear here.'
                  : 'Important updates regarding chats, campaigns, and leads will be displayed here.'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  markAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00B67A',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#00B67A',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#00B67A',
  },
  listContent: {
    padding: 16,
    gap: 10,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  itemCardUnread: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    flex: 1,
    marginRight: 8,
  },
  itemTitleUnread: {
    color: '#0F172A',
    fontWeight: '700',
  },
  itemTime: {
    fontSize: 12,
    color: '#94A3B8',
  },
  itemMessage: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  metaBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  metaText: {
    fontSize: 11,
    color: '#475569',
  },
  actionCol: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 8,
    gap: 12,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00B67A',
  },
  deleteBtn: {
    padding: 4,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
});
