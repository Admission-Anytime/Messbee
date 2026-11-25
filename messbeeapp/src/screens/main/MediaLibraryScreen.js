import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { mediaService } from '../../services/api';

const FILTERS = ['All', 'Image', 'Document', 'Video'];

const formatFileSize = (bytes) => {
  if (!bytes) return '0 KB';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export default function MediaLibraryScreen({ navigation }) {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  const fetchMedia = useCallback(async () => {
    try {
      const data = await mediaService.getMedia();
      setMedia(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('MediaLibrary fetch error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMedia();
  };

  const handleDelete = (item) => {
    Alert.alert('Delete File', `Delete "${item.originalName || item.filename || 'this media'}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setMedia((prev) => prev.filter((m) => m._id !== item._id));
          try {
            await mediaService.deleteMedia(item._id);
          } catch (err) {
            Alert.alert('Error', 'Failed to delete media file.');
            fetchMedia();
          }
        },
      },
    ]);
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    Alert.alert('Bulk Delete', `Delete ${selectedIds.length} selected files?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete All',
        style: 'destructive',
        onPress: async () => {
          const idsToDelete = [...selectedIds];
          setMedia((prev) => prev.filter((m) => !idsToDelete.includes(m._id)));
          setSelectedIds([]);
          try {
            await mediaService.bulkDeleteMedia(idsToDelete);
          } catch (err) {
            Alert.alert('Error', 'Failed to bulk delete media.');
            fetchMedia();
          }
        },
      },
    ]);
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const filteredMedia = useMemo(() => {
    return media.filter((item) => {
      const mime = (item.mimetype || item.type || '').toLowerCase();
      if (activeFilter === 'Image' && !mime.includes('image')) return false;
      if (activeFilter === 'Video' && !mime.includes('video')) return false;
      if (activeFilter === 'Document' && (mime.includes('image') || mime.includes('video'))) return false;

      if (searchQuery.trim()) {
        const name = (item.originalName || item.filename || item.name || '').toLowerCase();
        return name.includes(searchQuery.trim().toLowerCase());
      }
      return true;
    });
  }, [media, activeFilter, searchQuery]);

  const renderItem = ({ item }) => {
    const mime = (item.mimetype || item.type || '').toLowerCase();
    const isImage = mime.includes('image');
    const isVideo = mime.includes('video');
    const isSelected = selectedIds.includes(item._id);
    const title = item.originalName || item.filename || item.name || 'Media File';

    return (
      <TouchableOpacity
        style={[styles.card, isSelected && styles.cardSelected]}
        onLongPress={() => toggleSelect(item._id)}
        onPress={() => (selectedIds.length > 0 ? toggleSelect(item._id) : null)}
        activeOpacity={0.85}
      >
        <View style={styles.thumbBox}>
          {isImage && item.url ? (
            <Image source={{ uri: item.url }} style={styles.thumbImage} resizeMode="cover" />
          ) : (
            <Ionicons
              name={isImage ? 'image-outline' : isVideo ? 'videocam-outline' : 'document-text-outline'}
              size={26}
              color="#00B67A"
            />
          )}
        </View>

        <View style={styles.cardInfo}>
          <Text style={styles.fileName} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.fileMeta}>
            {formatFileSize(item.size)} • {mime || 'file'}
          </Text>
        </View>

        {selectedIds.length > 0 ? (
          <Ionicons
            name={isSelected ? 'checkbox' : 'square-outline'}
            size={22}
            color={isSelected ? '#00B67A' : '#94A3B8'}
          />
        ) : (
          <TouchableOpacity onPress={() => handleDelete(item)} style={styles.delBtn}>
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Media Library</Text>
        {selectedIds.length > 0 ? (
          <TouchableOpacity style={styles.bulkDelBtn} onPress={handleBulkDelete}>
            <Ionicons name="trash" size={16} color="#FFFFFF" />
            <Text style={styles.bulkDelText}>Delete ({selectedIds.length})</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 36 }} />
        )}
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search uploaded assets..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterPill, activeFilter === f && styles.filterPillActive]}
            onPress={() => setActiveFilter(f)}
          >
            <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#00B67A" />
        </View>
      ) : (
        <FlatList
          data={filteredMedia}
          keyExtractor={(item, idx) => item._id || String(idx)}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.listContent,
            filteredMedia.length === 0 && { flex: 1, justifyContent: 'center' },
          ]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#00B67A']} />}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="images-outline" size={48} color="#94A3B8" />
              <Text style={styles.emptyTitle}>No media files found</Text>
              <Text style={styles.emptySub}>
                Brochures, product images, and WhatsApp template media assets appear here.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
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
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  bulkDelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  bulkDelText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  searchSection: { backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 6 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 38,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 13, color: '#0F172A' },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  filterPillActive: { backgroundColor: '#00B67A' },
  filterText: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  filterTextActive: { color: '#FFFFFF' },
  listContent: { padding: 16, gap: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardSelected: { borderColor: '#00B67A', backgroundColor: '#F0FDF4' },
  thumbBox: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#E8F8F2',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginRight: 12,
  },
  thumbImage: { width: '100%', height: '100%' },
  cardInfo: { flex: 1 },
  fileName: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  fileMeta: { fontSize: 12, color: '#64748B', marginTop: 2 },
  delBtn: { padding: 6 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyBox: { alignItems: 'center', padding: 32 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginTop: 12 },
  emptySub: { fontSize: 13, color: '#64748B', textAlign: 'center', marginTop: 6, lineHeight: 18 },
});
