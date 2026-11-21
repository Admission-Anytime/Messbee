import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  ActivityIndicator,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { customFieldService } from '../../services/api';

const FIELD_TYPES = ['Text', 'Number', 'Date'];

export default function EditCustomFieldScreen({ navigation, route }) {
  const { field } = route.params || {};

  const [name, setName] = useState(field?.name || '');
  const [type, setType] = useState(field?.type || 'Text');
  const [technicalKey, setTechnicalKey] = useState(field?.key || '');
  const [description, setDescription] = useState(field?.description || '');
  const [minLength, setMinLength] = useState(String(field?.minLength ?? 0));
  const [maxLength, setMaxLength] = useState(String(field?.maxLength ?? 255));
  const [isActive, setIsActive] = useState(field?.isActive !== false);
  const [saving, setSaving] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Required Field', 'Please enter a field name.');
      return;
    }

    setSaving(true);
    try {
      await customFieldService.updateCustomField(field._id, {
        name: name.trim(),
        type,
        key: technicalKey.trim() || field.key,
        description: description.trim(),
        minLength: parseInt(minLength, 10) || 0,
        maxLength: parseInt(maxLength, 10) || 255,
        isActive,
      });

      Alert.alert('Success', 'Custom field updated successfully.', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (err) {
      Alert.alert(
        'Error',
        err.response?.data?.message || err.message || 'Failed to update custom field.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Custom Field</Text>

        {/* Top Right Save Changes Button */}
        <TouchableOpacity
          style={styles.topSaveBtn}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.topSaveBtnText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Section: Field details */}
        <Text style={styles.sectionTitle}>Field details</Text>

        {/* Field Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Field Name *</Text>
          <TextInput
            style={styles.textInput}
            value={name}
            onChangeText={setName}
            placeholder="Enter field name"
            placeholderTextColor="#94A3B8"
          />
        </View>

        {/* Field Type Dropdown */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Field Type</Text>
          <TouchableOpacity
            style={styles.dropdownSelector}
            onPress={() => setShowTypePicker(true)}
          >
            <Text style={styles.dropdownValueText}>{type}</Text>
            <Ionicons name="chevron-down" size={18} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Technical Key */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Technical Key</Text>
          <TextInput
            style={[styles.textInput, styles.disabledInput]}
            value={technicalKey}
            editable={false}
          />
          <Text style={styles.helperText}>
            Technical keys remain stable to preserve contact data.
          </Text>
        </View>

        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Description</Text>
          <TextInput
            style={[styles.textInput, styles.multilineInput]}
            value={description}
            onChangeText={setDescription}
            placeholder="Briefly explain the purpose of this field"
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Section: Field Configuration */}
        <Text style={styles.sectionTitle}>Field Configuration</Text>
        <View style={styles.configRow}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.inputLabel}>Minimum length</Text>
            <TextInput
              style={styles.textInput}
              value={minLength}
              onChangeText={setMinLength}
              keyboardType="number-pad"
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
            <Text style={styles.inputLabel}>Maximum length</Text>
            <TextInput
              style={styles.textInput}
              value={maxLength}
              onChangeText={setMaxLength}
              keyboardType="number-pad"
            />
          </View>
        </View>

        {/* Active field Toggle */}
        <View style={styles.toggleRow}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={styles.toggleLabel}>Active field</Text>
            <Text style={styles.toggleSubtitle}>Available for contact data entry</Text>
          </View>
          <Switch
            value={isActive}
            onValueChange={setIsActive}
            trackColor={{ false: '#CBD5E1', true: '#00B67A' }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* Bottom Action Buttons */}
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={saving}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Field Type Picker Modal */}
      <Modal
        visible={showTypePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTypePicker(false)}
      >
        <TouchableOpacity
          style={styles.pickerOverlay}
          activeOpacity={1}
          onPress={() => setShowTypePicker(false)}
        >
          <View style={styles.pickerBox}>
            <Text style={styles.pickerTitle}>Select Field Type</Text>
            {FIELD_TYPES.map((t) => (
              <TouchableOpacity
                key={t}
                style={[
                  styles.pickerItem,
                  type === t && styles.pickerItemActive,
                ]}
                onPress={() => {
                  setType(t);
                  setShowTypePicker(false);
                }}
              >
                <Text
                  style={[
                    styles.pickerItemText,
                    type === t && styles.pickerItemTextActive,
                  ]}
                >
                  {t}
                </Text>
                {type === t && (
                  <Ionicons name="checkmark-circle" size={20} color="#00B67A" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? 28 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  topSaveBtn: {
    backgroundColor: '#00B67A',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  topSaveBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 8,
    marginBottom: 14,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1E293B',
    backgroundColor: '#FFFFFF',
  },
  disabledInput: {
    backgroundColor: '#F8FAFC',
    color: '#64748B',
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 5,
    lineHeight: 16,
  },
  dropdownSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  dropdownValueText: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
  },
  configRow: {
    flexDirection: 'row',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  toggleSubtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#00B67A',
    shadowColor: '#00B67A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  pickerBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 320,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  pickerItemActive: {
    backgroundColor: '#EDF9F2',
    borderRadius: 8,
  },
  pickerItemText: {
    fontSize: 15,
    color: '#334155',
  },
  pickerItemTextActive: {
    fontWeight: '700',
    color: '#00B67A',
  },
});
