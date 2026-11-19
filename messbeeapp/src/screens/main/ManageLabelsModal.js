import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { labelService, chatService } from '../../services/api';

const DEFAULT_LIBRARY = [
  { id: 'l1', name: 'New Lead', color: '#00875A' },
  { id: 'l2', name: 'Admission Inquiry', color: '#2563EB' },
  { id: 'l3', name: 'Follow-up', color: '#D97706' },
  { id: 'l4', name: 'Interested', color: '#7E22CE' },
  { id: 'l5', name: 'Not Interested', color: '#64748B' },
  { id: 'l6', name: 'Payment Pending', color: '#EA580C' },
  { id: 'l7', name: 'Existing Customer', color: '#0D9488' },
  { id: 'l8', name: 'Priority', color: '#DC2626' },
];

export default function ManageLabelsModal({ route, navigation }) {
  const { contact } = route.params || {};

  const [appliedLabels, setAppliedLabels] = useState(
    contact?.labels && contact.labels.length > 0
      ? contact.labels
      : ['Follow-up', 'Admission Inquiry', 'New Lead']
  );
  const [library, setLibrary] = useState(DEFAULT_LIBRARY);
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);

  // Fetch real labels from DB
  useEffect(() => {
    const fetchLabels = async () => {
      try {
        const live = await labelService.getLabels();
        if (Array.isArray(live) && live.length > 0) {
          const mapped = live.map((l) => ({
            id: l._id || l.name,
            name: l.name,
            color: l.color || '#00875A',
          }));
          setLibrary(mapped);
        }
      } catch (err) {}
    };
    fetchLabels();
  }, []);

  const handleToggleLabel = (name) => {
    if (appliedLabels.includes(name)) {
      setAppliedLabels(appliedLabels.filter((l) => l !== name));
    } else {
      setAppliedLabels([...appliedLabels, name]);
    }
  };

  const handleRemoveChip = (name) => {
    setAppliedLabels(appliedLabels.filter((l) => l !== name));
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      if (contact?._id) {
        await chatService.updateLabels(contact._id, appliedLabels);
      }
    } catch (err) {
      console.warn('Update labels note:', err.message);
    } finally {
      setSaving(false);
      navigation.navigate('ContactProfile', {
        contact: { ...contact, labels: appliedLabels },
        updatedLabels: appliedLabels,
      });
    }
  };

  const filteredLibrary = library.filter((l) =>
    l.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* Sheet Container (Matching Image 3 Screen 12) */}
      <View style={styles.sheetDialog}>
        <View style={styles.sheetHandle} />

        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.messbeeTag}>MESSBEE</Text>
            <Text style={styles.sheetTitle}>Manage Labels</Text>
            <Text style={styles.sheetSubtitle}>{contact?.phone || contact?.name || '919350157447'}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
            <Ionicons name="close" size={20} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Search / Create Input */}
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={17} color="#94A3B8" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search or create a label..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* APPLIED LABELS */}
          <Text style={styles.sectionHeaderTitle}>
            APPLIED LABELS ({appliedLabels.length} selected)
          </Text>

          <View style={styles.chipsWrap}>
            {appliedLabels.map((lbl, idx) => (
              <View key={idx} style={styles.appliedChip}>
                <View style={styles.chipColorDot} />
                <Text style={styles.chipText}>{lbl}</Text>
                <TouchableOpacity onPress={() => handleRemoveChip(lbl)} style={{ marginLeft: 6 }}>
                  <Ionicons name="close" size={13} color="#64748B" />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* LABEL LIBRARY */}
          <Text style={[styles.sectionHeaderTitle, { marginTop: 18 }]}>
            LABEL LIBRARY ({filteredLibrary.length} labels)
          </Text>

          <View style={styles.libraryList}>
            {filteredLibrary.map((item) => {
              const isChecked = appliedLabels.includes(item.name);
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.libraryRow, isChecked && styles.libraryRowChecked]}
                  onPress={() => handleToggleLabel(item.name)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.libDot, { backgroundColor: item.color }]} />
                  <Text style={styles.libName}>{item.name}</Text>

                  <View style={styles.libRightActions}>
                    <View style={[styles.checkboxSquare, isChecked && styles.checkboxChecked]}>
                      {isChecked && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
                    </View>
                    <TouchableOpacity style={{ marginLeft: 10 }}>
                      <Ionicons name="pencil-outline" size={16} color="#94A3B8" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Footer Buttons */}
        <View style={styles.footerBar}>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSaveChanges} activeOpacity={0.85}>
            <Text style={styles.saveBtnText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? 36 : 0,
  },
  sheetDialog: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  messbeeTag: {
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
  sheetSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
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
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  sectionHeaderTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  appliedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  chipColorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D97706',
    marginRight: 6,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  libraryList: {
    gap: 2,
  },
  libraryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  libraryRowChecked: {
    backgroundColor: '#F0FDF4',
  },
  libDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  libName: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#0F172A',
    flex: 1,
  },
  libRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxSquare: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#00875A',
    borderColor: '#00875A',
  },
  footerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  cancelBtn: {
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  cancelBtnText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#64748B',
  },
  saveBtn: {
    backgroundColor: '#00875A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  saveBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
