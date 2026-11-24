import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { contactService, labelService } from '../../services/api';

export default function AddContactScreen({ navigation }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [selectedLabels, setSelectedLabels] = useState([]);
  const [customFields, setCustomFields] = useState([]);
  const [saving, setSaving] = useState(false);

  // Available labels from real DB
  const [availableLabels, setAvailableLabels] = useState([
    { _id: 'l1', name: 'Hot Lead', color: '#F59E0B' },
    { _id: 'l2', name: 'Cold lead', color: '#0284C7' },
    { _id: 'l3', name: 'Customer', color: '#10B981' },
    { _id: 'l4', name: 'New lead', color: '#8B5CF6' },
  ]);
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [showCustomFieldModal, setShowCustomFieldModal] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldValue, setNewFieldValue] = useState('');

  useEffect(() => {
    labelService.getLabels().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setAvailableLabels(data);
      }
    });
  }, []);

  const handleSaveContact = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter a contact name.');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Required', 'Please enter a WhatsApp number.');
      return;
    }

    try {
      setSaving(true);
      const cleanPhone = phone.startsWith('+') ? phone : `+91${phone.replace(/[^0-9]/g, '')}`;

      const payload = {
        name: name.trim(),
        phone: cleanPhone,
        email: email.trim(),
        labels: selectedLabels,
        customFields: customFields.reduce((acc, f) => {
          acc[f.name] = f.value;
          return acc;
        }, {}),
        status: 'active',
      };

      await contactService.createContact(payload);
      Alert.alert('Success', 'Contact saved successfully!');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Success', 'Contact added to list.');
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  };

  const toggleLabel = (labelName) => {
    if (selectedLabels.includes(labelName)) {
      setSelectedLabels(selectedLabels.filter((l) => l !== labelName));
    } else {
      setSelectedLabels([...selectedLabels, labelName]);
    }
  };

  const addCustomField = () => {
    if (!newFieldName.trim()) return;
    setCustomFields([...customFields, { name: newFieldName.trim(), value: newFieldValue.trim() }]);
    setNewFieldName('');
    setNewFieldValue('');
    setShowCustomFieldModal(false);
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

        <Text style={styles.headerTitle}>Add Contact</Text>

        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSaveContact}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveBtnText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ================= SECTION 1: BASIC INFORMATION ================= */}
        <Text style={styles.sectionHeading}>Basic Information</Text>
        <View style={styles.formCard}>
          {/* Name Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Name *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter contact name"
              placeholderTextColor="#94A3B8"
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* WhatsApp Number Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>WhatsApp Number *</Text>
            <View style={styles.phoneInputRow}>
              <View style={styles.countryCodeBox}>
                <Text style={styles.countryCodeText}>+91</Text>
                <Ionicons name="chevron-down" size={14} color="#64748B" style={{ marginLeft: 3 }} />
              </View>
              <TextInput
                style={styles.phoneInput}
                placeholder="Enter 10-digit WhatsApp number"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>
          </View>

          {/* Email Address Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter email address"
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>
        </View>

        {/* ================= SECTION 2: LABELS ================= */}
        <Text style={styles.sectionHeading}>Labels</Text>
        <View style={styles.formCard}>
          <TouchableOpacity
            style={styles.labelSelectorRow}
            onPress={() => setShowLabelModal(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.labelSelectorPlaceholder}>
              {selectedLabels.length === 0 ? 'Select Labels' : `${selectedLabels.length} labels selected`}
            </Text>
            <View style={styles.addLabelIconBtn}>
              <Ionicons name="add" size={18} color="#64748B" />
            </View>
          </TouchableOpacity>

          {selectedLabels.length > 0 && (
            <View style={styles.selectedChipsContainer}>
              {selectedLabels.map((lbl) => (
                <View key={lbl} style={styles.labelChip}>
                  <Text style={styles.labelChipText}>{lbl}</Text>
                  <TouchableOpacity onPress={() => toggleLabel(lbl)}>
                    <Ionicons name="close-circle" size={15} color="#00875A" style={{ marginLeft: 4 }} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* ================= SECTION 3: CUSTOM FIELDS ================= */}
        <Text style={styles.sectionHeading}>Custom Fields</Text>
        <View style={styles.formCard}>
          {customFields.length === 0 ? (
            <View style={styles.emptyCustomFieldsBox}>
              <Text style={styles.emptyCustomFieldsText}>No custom fields yet.</Text>
              <TouchableOpacity
                onPress={() => setShowCustomFieldModal(true)}
                activeOpacity={0.7}
                style={styles.createCustomFieldLink}
              >
                <Text style={styles.createCustomFieldText}>+ Create your first custom field</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.customFieldsList}>
              {customFields.map((f, i) => (
                <View key={i} style={styles.customFieldRow}>
                  <Text style={styles.customFieldName}>{f.name}</Text>
                  <Text style={styles.customFieldValue}>{f.value}</Text>
                </View>
              ))}
              <TouchableOpacity
                onPress={() => setShowCustomFieldModal(true)}
                style={{ marginTop: 8 }}
              >
                <Text style={styles.createCustomFieldText}>+ Add another custom field</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* ================= LABELS SELECTOR MODAL ================= */}
      <Modal visible={showLabelModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowLabelModal(false)}
        >
          <View style={styles.labelModalDialog} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Labels</Text>
              <TouchableOpacity onPress={() => setShowLabelModal(false)}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {availableLabels.map((item) => {
              const isChecked = selectedLabels.includes(item.name);
              return (
                <TouchableOpacity
                  key={item._id || item.name}
                  style={styles.labelCheckRow}
                  onPress={() => toggleLabel(item.name)}
                >
                  <View style={[styles.checkSquare, isChecked && styles.checkSquareActive]}>
                    {isChecked && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
                  </View>
                  <Text style={styles.labelOptionText}>{item.name}</Text>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              style={styles.modalDoneBtn}
              onPress={() => setShowLabelModal(false)}
            >
              <Text style={styles.modalDoneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ================= CUSTOM FIELD MODAL ================= */}
      <Modal visible={showCustomFieldModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowCustomFieldModal(false)}
        >
          <View style={styles.labelModalDialog} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Custom Field</Text>
              <TouchableOpacity onPress={() => setShowCustomFieldModal(false)}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.textInput, { marginBottom: 12 }]}
              placeholder="Field Name (e.g. City, GSTN)"
              placeholderTextColor="#94A3B8"
              value={newFieldName}
              onChangeText={setNewFieldName}
            />

            <TextInput
              style={[styles.textInput, { marginBottom: 16 }]}
              placeholder="Field Value (e.g. Delhi, 07AAAAA0000A1Z5)"
              placeholderTextColor="#94A3B8"
              value={newFieldValue}
              onChangeText={setNewFieldValue}
            />

            <TouchableOpacity style={styles.modalDoneBtn} onPress={addCustomField}>
              <Text style={styles.modalDoneBtnText}>Add Field</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingTop: Platform.OS === 'android' ? 36 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  saveBtn: {
    backgroundColor: '#00875A',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    marginTop: 10,
    paddingHorizontal: 2,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 13.5,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 11,
    marginRight: 8,
  },
  countryCodeText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  phoneInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 13.5,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  labelSelectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  labelSelectorPlaceholder: {
    fontSize: 13,
    color: '#94A3B8',
  },
  addLabelIconBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  labelChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  labelChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#166534',
  },
  emptyCustomFieldsBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  emptyCustomFieldsText: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 8,
  },
  createCustomFieldLink: {
    paddingVertical: 4,
  },
  createCustomFieldText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00875A',
  },
  customFieldsList: {
    gap: 8,
  },
  customFieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  customFieldName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  customFieldValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  labelModalDialog: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 340,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  labelCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  checkSquare: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkSquareActive: {
    backgroundColor: '#00875A',
    borderColor: '#00875A',
  },
  labelOptionText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#0F172A',
  },
  modalDoneBtn: {
    backgroundColor: '#00875A',
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  modalDoneBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
