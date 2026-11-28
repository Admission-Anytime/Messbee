import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { chatService, contactService, resolveFileUrl } from '../../services/api';
import { validateForm } from '../../utils/validation';

export default function EditContactProfileScreen({ route, navigation }) {
  const { contact } = route.params || {};

  const [name, setName] = useState(contact?.name || '919350157447');
  const [phone, setPhone] = useState(contact?.phone || '+91 9350157447');
  const [email, setEmail] = useState(contact?.email || '');
  const [status, setStatus] = useState(contact?.status || 'Open');
  const [avatarUri, setAvatarUri] = useState(resolveFileUrl(contact?.avatar, true));
  const [labels, setLabels] = useState(
    contact?.labels && contact.labels.length > 0
      ? contact.labels
      : ['New Lead', 'Admission Inquiry']
  );
  const [saving, setSaving] = useState(false);

  const handleRemoveLabel = (lbl) => {
    setLabels(labels.filter((l) => l !== lbl));
  };

  const handlePickContactPhoto = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission Required', 'Please allow photo library access to pick a contact photo.');
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!res.canceled && res.assets?.length) {
        setAvatarUri(res.assets[0].uri);
      }
    } catch (err) {
      Alert.alert('Error', err?.message || 'Could not select photo.');
    }
  };

  const handleSaveChanges = async () => {
    const { isValid, firstError } = validateForm({
      name: { value: name, required: true, minLength: 2, label: 'Contact Name' },
      phone: { value: phone, required: true, phone: true, label: 'Phone Number' },
      email: { value: email, email: true, label: 'Email Address' },
    });

    if (!isValid) {
      Alert.alert('Validation Error', firstError);
      return;
    }

    setSaving(true);
    const updatedData = {
      name: name.trim(),
      whatsapp: phone.trim(),
      phone: phone.trim(),
      email: email.trim(),
      status,
      labels,
    };

    try {
      if (contact?._id) {
        await chatService.updateProfile(contact._id, updatedData);
        await chatService.updateStatus(contact._id, status.toLowerCase());
        await chatService.updateLabels(contact._id, labels);
      }
    } catch (err) {
      console.warn('Update profile note:', err.message);
    } finally {
      setSaving(false);
      navigation.navigate('ContactProfile', {
        contact: { ...contact, ...updatedData, ...(avatarUri ? { avatar: avatarUri } : {}) },
        updatedProfile: updatedData,
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* Header (Matching Image 3 Screen 10) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Contact Profile</Text>
        <TouchableOpacity style={styles.headerBtn}>
          <Ionicons name="ellipsis-vertical" size={20} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Avatar with Camera Icon */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarSquircle}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={{ width: 72, height: 72, borderRadius: 22 }} />
            ) : (
              <Text style={styles.avatarInitials}>{name.slice(0, 2) || '91'}</Text>
            )}
            <TouchableOpacity style={styles.cameraBadge} onPress={handlePickContactPhoto} activeOpacity={0.8}>
              <Ionicons name="camera" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.avatarName}>{name}</Text>
          <Text style={styles.avatarSubtitle}>WhatsApp contact</Text>
        </View>

        {/* Section 1: Contact Information */}
        <Text style={styles.sectionHeading}>CONTACT INFORMATION</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>FULL NAME</Text>
          <TextInput
            style={styles.textInput}
            value={name}
            onChangeText={setName}
            placeholder="Full Name"
            placeholderTextColor="#94A3B8"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>WHATSAPP NUMBER</Text>
          <TextInput
            style={styles.textInput}
            value={phone}
            onChangeText={(text) => setPhone(text.replace(/[^0-9+\s]/g, '').slice(0, 15))}
            placeholder="+91..."
            placeholderTextColor="#94A3B8"
            keyboardType="phone-pad"
            maxLength={15}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
          <TextInput
            style={styles.textInput}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter email address"
            placeholderTextColor="#94A3B8"
            keyboardType="email-address"
          />
        </View>

        {/* Section 2: Status */}
        <Text style={styles.sectionHeading}>STATUS</Text>
        <View style={styles.statusDropdownContainer}>
          <TouchableOpacity
            style={styles.statusPickerRow}
            onPress={() => {
              const nextStatus = status === 'Open' ? 'Resolved' : status === 'Resolved' ? 'Pending' : 'Open';
              setStatus(nextStatus);
            }}
          >
            <View style={styles.statusRowLeft}>
              <View style={[styles.statusDot, { backgroundColor: status === 'Resolved' ? '#7E22CE' : '#00875A' }]} />
              <Text style={styles.statusText}>{status}</Text>
            </View>
            <Ionicons name="chevron-down" size={16} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Section 3: Labels */}
        <Text style={styles.sectionHeading}>LABELS</Text>
        <TouchableOpacity
          style={styles.addLabelsInputRow}
          onPress={() => navigation.navigate('ManageLabelsModal', { contact: { ...contact, labels } })}
        >
          <Ionicons name="add" size={16} color="#94A3B8" style={{ marginRight: 6 }} />
          <Text style={styles.addLabelsPlaceholder}>Add labels...</Text>
          <Ionicons name="chevron-down" size={16} color="#94A3B8" style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>

        <View style={styles.chipsContainer}>
          {labels.map((lbl, idx) => (
            <View key={idx} style={styles.chipPill}>
              <View style={styles.chipDot} />
              <Text style={styles.chipText}>{lbl}</Text>
              <TouchableOpacity onPress={() => handleRemoveLabel(lbl)} style={styles.chipCloseBtn}>
                <Ionicons name="close" size={12} color="#64748B" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footerBar}>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSaveChanges}
          disabled={saving}
          activeOpacity={0.85}
        >
          <Text style={styles.saveBtnText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  headerBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarSquircle: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: '#00875A',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 10,
  },
  avatarInitials: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#00B67A',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  avatarSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginTop: 16,
    marginBottom: 10,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    fontSize: 13.5,
    color: '#0F172A',
  },
  statusDropdownContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    justifyContent: 'center',
  },
  statusPickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  statusText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#0F172A',
  },
  addLabelsInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    marginBottom: 10,
  },
  addLabelsPlaceholder: {
    fontSize: 13,
    color: '#94A3B8',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  chipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00875A',
    marginRight: 6,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#065F46',
  },
  chipCloseBtn: {
    marginLeft: 6,
  },
  footerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
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
