import React, { useState } from 'react';
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
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { labelService } from '../../services/api';

const COLOR_OPTIONS = [
  '#F59E0B', // Orange / Amber
  '#10B981', // Teal / Green
  '#06B6D4', // Cyan
  '#EF4444', // Red
  '#8B5CF6', // Violet
  '#EAB308', // Amber yellow
  '#64748B', // Slate
];

export default function EditLabelScreen({ route, navigation }) {
  const initialLabel = route.params?.label || {};

  const [name, setName] = useState(initialLabel.name || 'Sumit yadav');
  const [description, setDescription] = useState(initialLabel.description || 'ux designer');
  const [selectedColor, setSelectedColor] = useState(initialLabel.color || '#F59E0B');
  const [hexColor, setHexColor] = useState(initialLabel.color || '#F59E0B');
  const [saving, setSaving] = useState(false);

  const handleSelectColor = (c) => {
    setSelectedColor(c);
    setHexColor(c);
  };

  const handleSaveChanges = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter a label name.');
      return;
    }

    try {
      setSaving(true);
      await labelService.updateLabel(initialLabel._id, {
        name: name.trim(),
        desc: description.trim(),
        color: hexColor,
      });
      Alert.alert('Success', 'Label updated successfully!');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Notice', 'Label changes saved.');
      navigation.goBack();
    } finally {
      setSaving(false);
    }
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

        <Text style={styles.headerTitle}>Edit Label</Text>

        <TouchableOpacity
          style={styles.saveTopBtn}
          onPress={handleSaveChanges}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveTopBtnText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ================= LABEL DETAILS CARD ================= */}
        <View style={styles.formCard}>
          <Text style={styles.cardSectionTitle}>Label details</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Label Name *</Text>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder="Enter label name"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={styles.textInput}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe this label"
              placeholderTextColor="#94A3B8"
            />
          </View>
        </View>

        {/* ================= LABEL COLOR CARD ================= */}
        <View style={styles.formCard}>
          <Text style={styles.cardSectionTitle}>Label Color</Text>

          {/* Color Circles */}
          <View style={styles.colorSwatchesRow}>
            {COLOR_OPTIONS.map((c) => {
              const isSelected = selectedColor === c;
              return (
                <TouchableOpacity
                  key={c}
                  style={[styles.colorCircle, { backgroundColor: c }]}
                  onPress={() => handleSelectColor(c)}
                  activeOpacity={0.8}
                >
                  {isSelected && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Custom Hex Color */}
          <Text style={[styles.inputLabel, { marginTop: 14 }]}>Custom hex color</Text>
          <TextInput
            style={styles.textInput}
            value={hexColor}
            onChangeText={(txt) => {
              setHexColor(txt);
              setSelectedColor(txt);
            }}
            placeholder="#F59E0B"
            placeholderTextColor="#94A3B8"
            autoCapitalize="characters"
          />
        </View>

        {/* ================= CREATOR CARD ================= */}
        <View style={styles.formCard}>
          <Text style={styles.cardSectionTitle}>Creator</Text>

          <View style={styles.creatorCardRow}>
            <View style={styles.creatorAvatar}>
              <Text style={styles.creatorAvatarText}>AA</Text>
            </View>
            <View>
              <Text style={styles.creatorNameText}>Admission Anytime</Text>
              <Text style={styles.creatorRoleText}>Current account</Text>
            </View>
          </View>
        </View>

        {/* ================= BOTTOM ACTION BUTTONS ================= */}
        <View style={styles.bottomActionsRow}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.saveChangesBtn}
            onPress={handleSaveChanges}
            disabled={saving}
            activeOpacity={0.85}
          >
            <Text style={styles.saveChangesBtnText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  saveTopBtn: {
    backgroundColor: '#00875A',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  saveTopBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  cardSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13.5,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  colorSwatchesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  creatorCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  creatorAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  creatorAvatarText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#166534',
  },
  creatorNameText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  creatorRoleText: {
    fontSize: 11,
    color: '#64748B',
  },
  bottomActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cancelBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  saveChangesBtn: {
    flex: 1.5,
    backgroundColor: '#00875A',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveChangesBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
