import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { contactService, chatService } from '../../services/api';

export default function ContactProfileScreen({ route, navigation }) {
  const { contact = { name: 'Contact', phone: '', status: 'OPEN', avatarText: 'WA' } } =
    route.params || {};

  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    _id: contact._id || contact.id,
    name: contact.name || 'Contact',
    phone: contact.phone || '',
    email: contact.email || '',
    status: contact.status || 'OPEN',
    lastSeen: 'recently',
    labels: contact.labels || [],
    customFields: contact.customFields || {},
  });

  // Fetch updated contact details and custom fields from backend
  useEffect(() => {
    const fetchContactDetails = async () => {
      const contactId = contact._id || contact.id;
      if (contactId) {
        try {
          setLoading(true);
          const liveContact = await contactService.getContactById(contactId);
          if (liveContact) {
            setProfile((prev) => ({
              ...prev,
              name: liveContact.name || prev.name,
              phone: liveContact.phone || prev.phone,
              email: liveContact.email || prev.email,
              status: liveContact.status || prev.status,
              labels: liveContact.labels || prev.labels,
              customFields: liveContact.customFields || liveContact.fields || prev.customFields,
            }));
          }
        } catch (err) {
          console.warn('getContactById error:', err.message);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchContactDetails();
  }, [contact._id, contact.id]);

  // Sync if returned from Edit Profile or Manage Labels
  useEffect(() => {
    if (route.params?.updatedProfile) {
      setProfile((prev) => ({ ...prev, ...route.params.updatedProfile }));
    }
  }, [route.params?.updatedProfile]);

  useEffect(() => {
    if (route.params?.updatedLabels) {
      setProfile((prev) => ({ ...prev, labels: route.params.updatedLabels }));
    }
  }, [route.params?.updatedLabels]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* Header (Matching Image 3 Screen 9) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact Info</Text>
        <TouchableOpacity style={styles.headerBtn}>
          <Ionicons name="ellipsis-vertical" size={20} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.avatarSquircle}>
            <Text style={styles.avatarText}>{profile.name.slice(0, 2) || '91'}</Text>
            <View style={styles.statusIndicatorDot} />
          </View>

          <Text style={styles.contactName}>{profile.name}</Text>
          <Text style={styles.contactPhone}>{profile.phone}</Text>
          <Text style={styles.lastSeenText}>Last seen {profile.lastSeen}</Text>

          {/* Status Pill */}
          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusPillText}>{(profile.status || 'OPEN').toUpperCase()}</Text>
          </View>
        </View>

        {/* Labels Section Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardHeaderTitle}>LABELS</Text>
            <TouchableOpacity
              style={styles.addLabelBtn}
              onPress={() => navigation.navigate('ManageLabelsModal', { contact: { ...contact, labels: profile.labels } })}
            >
              <Ionicons name="add" size={18} color="#00875A" />
            </TouchableOpacity>
          </View>

          {profile.labels && profile.labels.length > 0 ? (
            <View style={styles.chipsRow}>
              {profile.labels.map((lbl, idx) => (
                <View key={idx} style={styles.labelChip}>
                  <View style={styles.chipDot} />
                  <Text style={styles.chipText}>{lbl}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyLabelsRow}>
              <Ionicons name="pricetag-outline" size={16} color="#94A3B8" style={{ marginRight: 8 }} />
              <Text style={styles.emptyLabelsText}>No labels applied</Text>
            </View>
          )}
        </View>

        {/* Custom Fields Section Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardHeaderTitle}>CUSTOM FIELDS</Text>
            <TouchableOpacity onPress={() => navigation.navigate('CustomFields')}>
              <Text style={styles.editFieldsLink}>Manage Fields</Text>
            </TouchableOpacity>
          </View>

          {profile.customFields && Object.keys(profile.customFields).length > 0 ? (
            <View style={styles.fieldsGrid}>
              {Object.entries(profile.customFields).map(([key, val], idx) => (
                <View key={idx} style={[styles.fieldCol, { marginBottom: 12 }]}>
                  <Text style={styles.fieldLabel}>{String(key).toUpperCase()}</Text>
                  <Text style={styles.fieldValue}>{String(val || 'Not set')}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyLabelsRow}>
              <Ionicons name="clipboard-outline" size={16} color="#94A3B8" style={{ marginRight: 8 }} />
              <Text style={styles.emptyLabelsText}>No custom fields set</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Dual Action Buttons */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.editProfileBtn}
          onPress={() => navigation.navigate('EditContactProfile', { contact: profile })}
          activeOpacity={0.8}
        >
          <Ionicons name="create-outline" size={17} color="#0F172A" style={{ marginRight: 6 }} />
          <Text style={styles.editProfileText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.viewHistoryBtn}
          onPress={() => navigation.navigate('ContactFullHistory', { contact: profile })}
          activeOpacity={0.85}
        >
          <Ionicons name="time-outline" size={17} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.viewHistoryText}>View Full History</Text>
        </TouchableOpacity>
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
    paddingTop: 20,
    paddingBottom: 24,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarSquircle: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: '#00875A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    position: 'relative',
    shadowColor: '#00875A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statusIndicatorDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  contactName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  contactPhone: {
    fontSize: 13.5,
    color: '#64748B',
    marginBottom: 4,
  },
  lastSeenText: {
    fontSize: 11.5,
    color: '#94A3B8',
    marginBottom: 12,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#00875A',
    marginRight: 6,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#00875A',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
  },
  addLabelBtn: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyLabelsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  emptyLabelsText: {
    fontSize: 13,
    color: '#94A3B8',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  labelChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
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
    color: '#334155',
  },
  editFieldsLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00875A',
  },
  fieldsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fieldCol: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  fieldValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
    gap: 10,
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingVertical: 13,
    borderRadius: 12,
  },
  editProfileText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  viewHistoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    paddingVertical: 14,
    borderRadius: 12,
  },
  viewHistoryText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
