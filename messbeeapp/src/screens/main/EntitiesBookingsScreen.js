import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  RefreshControl,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { entityService } from '../../services/api';
import { validateForm } from '../../utils/validation';

export default function EntitiesBookingsScreen({ navigation }) {
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Branch');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState('1');
  const [saving, setSaving] = useState(false);

  const loadEntities = useCallback(async () => {
    try {
      const data = await entityService.getEntities();
      setEntities(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Entities load error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadEntities();
  }, [loadEntities]);

  const handleSave = async () => {
    const { isValid, firstError } = validateForm({
      name: { value: name, required: true, minLength: 2, label: 'Entity / Branch Name' },
      capacity: { value: capacity, required: true, number: true, min: 1, label: 'Slot Capacity' },
    });
    if (!isValid) {
      Alert.alert('Validation Error', firstError);
      return;
    }

    setSaving(true);
    try {
      await entityService.createEntity({
        name: name.trim(),
        category: category.trim() || 'Branch',
        description: description.trim(),
        capacity: Number(capacity) || 1,
        isActive: true,
      });
      Alert.alert('Success', 'Entity created successfully!');
      setModalVisible(false);
      setName('');
      setDescription('');
      setCapacity('1');
      loadEntities();
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to create entity.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item) => {
    Alert.alert('Delete Entity', `Delete "${item.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setEntities((prev) => prev.filter((e) => e._id !== item._id));
          try {
            await entityService.deleteEntity(item._id);
          } catch (err) {
            loadEntities();
          }
        },
      },
    ]);
  };

  const renderEntity = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.iconBox}>
          <Ionicons name="storefront-outline" size={22} color="#00B67A" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{item.name}</Text>
          <Text style={styles.sub}>
            {item.category || 'Branch'} • Capacity: {item.capacity ?? 1}
          </Text>
          {item.description ? <Text style={styles.desc}>{item.description}</Text> : null}
        </View>
        <TouchableOpacity onPress={() => handleDelete(item)}>
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Branches & Booking Slots</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#00B67A" />
        </View>
      ) : (
        <FlatList
          data={entities}
          keyExtractor={(item, i) => item._id || String(i)}
          renderItem={renderEntity}
          contentContainerStyle={[styles.listContent, entities.length === 0 && { flex: 1, justifyContent: 'center' }]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadEntities(); }} colors={['#00B67A']} />}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="calendar-outline" size={44} color="#94A3B8" />
              <Text style={styles.emptyTitle}>No branches or booking entities yet</Text>
              <Text style={styles.emptySub}>Create stores, doctors, rooms, or service desks for WhatsApp slot bookings.</Text>
            </View>
          }
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Branch / Resource</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.modalForm}>
              <Text style={styles.label}>Name *</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Delhi Main Branch / Consultation Room 1" />
              <Text style={styles.label}>Category</Text>
              <TextInput style={styles.input} value={category} onChangeText={setCategory} placeholder="e.g. Branch, Service, Doctor" />
              <Text style={styles.label}>Capacity / Slots *</Text>
              <TextInput style={styles.input} value={capacity} onChangeText={setCapacity} keyboardType="numeric" />
              <Text style={styles.label}>Description</Text>
              <TextInput style={styles.input} value={description} onChangeText={setDescription} placeholder="Optional notes" />
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
                {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveBtnText}>Create Entity</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#00B67A', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, gap: 4 },
  addBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { padding: 16, gap: 10 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#E2E8F0' },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 42, height: 42, borderRadius: 10, backgroundColor: '#E8F8F2', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  title: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  sub: { fontSize: 12, color: '#00B67A', fontWeight: '600', marginTop: 2 },
  desc: { fontSize: 12, color: '#64748B', marginTop: 3 },
  emptyBox: { alignItems: 'center', padding: 32 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginTop: 10 },
  emptySub: { fontSize: 12, color: '#64748B', textAlign: 'center', marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '85%', paddingBottom: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#0F172A' },
  modalForm: { padding: 18 },
  label: { fontSize: 13, fontWeight: '600', color: '#334155', marginTop: 10, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#0F172A' },
  saveBtn: { backgroundColor: '#00B67A', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  saveBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
