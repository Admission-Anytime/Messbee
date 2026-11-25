import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
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
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { teamService } from '../../services/api';
import { validateForm } from '../../utils/validation';

export default function TeamManagementScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [limits, setLimits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('agent');
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [usersData, limitsData] = await Promise.all([
        teamService.getUsers(),
        teamService.getAccountLimits(),
      ]);
      setUsers(Array.isArray(usersData) ? usersData : []);
      setLimits(limitsData);
    } catch (err) {
      console.warn('TeamManagement load error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddMember = async () => {
    const { isValid, firstError } = validateForm({
      name: { value: name, required: true, minLength: 2, label: 'Member Name' },
      email: { value: email, required: true, email: true, label: 'Email Address' },
      password: { value: password, required: true, minLength: 6, label: 'Password' },
    });
    if (!isValid) {
      Alert.alert('Validation Error', firstError);
      return;
    }

    setSaving(true);
    try {
      await teamService.createUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
      });
      Alert.alert('Success', 'Team member invited/created successfully!');
      setModalVisible(false);
      setName('');
      setEmail('');
      setPassword('');
      loadData();
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to add team member.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = (item) => {
    Alert.alert('Remove Member', `Remove "${item.name}" from workspace?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          setUsers((prev) => prev.filter((u) => u._id !== item._id));
          try {
            await teamService.deleteUser(item._id);
          } catch (err) {
            loadData();
          }
        },
      },
    ]);
  };

  const renderUser = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(item.name || 'TM').slice(0, 2).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.userName}>{item.name || 'Team Member'}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
        </View>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{(item.role || 'agent').toUpperCase()}</Text>
        </View>
        <TouchableOpacity onPress={() => handleDeleteUser(item)} style={{ marginLeft: 10 }}>
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
        <Text style={styles.headerTitle}>Team & Plan Limits</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Ionicons name="person-add-outline" size={16} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {limits ? (
        <View style={styles.limitsBanner}>
          <Text style={styles.limitsTitle}>
            Plan: {(limits.plan || limits.subscriptionPlan || 'Free').toUpperCase()}
          </Text>
          <Text style={styles.limitsSub}>
            Contacts: {limits.contactsUsed ?? 0} / {limits.contactLimit === -1 ? 'Unlimited' : limits.contactLimit ?? 500}
            {'  •  '}Team: {users.length}
          </Text>
        </View>
      ) : null}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#00B67A" />
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item, i) => item._id || String(i)}
          renderItem={renderUser}
          contentContainerStyle={[styles.listContent, users.length === 0 && { flex: 1, justifyContent: 'center' }]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} colors={['#00B67A']} />}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="people-outline" size={44} color="#94A3B8" />
              <Text style={styles.emptyTitle}>No team members yet</Text>
            </View>
          }
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Team Member</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.modalForm}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Priya Verma" />
              <Text style={styles.label}>Email Address *</Text>
              <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="agent@company.com" />
              <Text style={styles.label}>Temporary Password *</Text>
              <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry placeholder="Min 6 characters" />

              <Text style={styles.label}>Role</Text>
              <View style={styles.roleRow}>
                {['agent', 'manager', 'admin'].map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[styles.rolePill, role === r && styles.rolePillActive]}
                    onPress={() => setRole(r)}
                  >
                    <Text style={[styles.rolePillText, role === r && styles.rolePillTextActive]}>
                      {r.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.saveBtn} onPress={handleAddMember} disabled={saving}>
                {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveBtnText}>Add Team Member</Text>}
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
  limitsBanner: { backgroundColor: '#0F172A', margin: 16, marginBottom: 4, padding: 14, borderRadius: 12 },
  limitsTitle: { color: '#38BDF8', fontSize: 12, fontWeight: '700' },
  limitsSub: { color: '#FFFFFF', fontSize: 14, fontWeight: '600', marginTop: 4 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { padding: 16, gap: 10 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#E2E8F0' },
  row: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8F8F2', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { fontSize: 14, fontWeight: '700', color: '#00B67A' },
  userName: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  userEmail: { fontSize: 12, color: '#64748B', marginTop: 2 },
  roleBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  roleText: { fontSize: 10, fontWeight: '700', color: '#475569' },
  emptyBox: { alignItems: 'center', padding: 32 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: '#64748B', marginTop: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '85%', paddingBottom: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#0F172A' },
  modalForm: { padding: 18 },
  label: { fontSize: 13, fontWeight: '600', color: '#334155', marginTop: 10, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#0F172A' },
  roleRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  rolePill: { flex: 1, paddingVertical: 8, borderRadius: 8, backgroundColor: '#F1F5F9', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  rolePillActive: { backgroundColor: '#00B67A', borderColor: '#00B67A' },
  rolePillText: { fontSize: 12, fontWeight: '700', color: '#475569' },
  rolePillTextActive: { color: '#FFFFFF' },
  saveBtn: { backgroundColor: '#00B67A', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  saveBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
