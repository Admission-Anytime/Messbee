import React, { useState } from 'react';
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
import { chatService } from '../../services/api';

const STATUS_OPTIONS = [
  {
    id: 'Open',
    title: 'Open',
    desc: 'Conversation is active and needs attention.',
    icon: 'chatbubble-ellipses-outline',
    color: '#00875A',
  },
  {
    id: 'Pending',
    title: 'Pending',
    desc: 'Waiting for a reply or further action.',
    icon: 'time-outline',
    color: '#D97706',
  },
  {
    id: 'Resolved',
    title: 'Resolved',
    desc: 'The conversation or lead has been handled.',
    icon: 'checkmark-circle-outline',
    color: '#7E22CE',
  },
];

const QUICK_TAGS = [
  'Follow-up required',
  'Customer responded',
  'Issue resolved',
  'Waiting for customer',
  'Assigned for review',
];

export default function UpdateLeadStatusModal({ route, navigation }) {
  const { contact = { name: '919350157447', phone: '+91 9350157447', status: 'Open' }, onStatusUpdated } =
    route.params || {};

  const currentStatus = contact.status || 'Open';
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const isSameStatus = selectedStatus.toLowerCase() === currentStatus.toLowerCase();

  const handleConfirm = async () => {
    if (isSameStatus) return;
    setSaving(true);
    try {
      if (contact._id) {
        await chatService.updateStatus(contact._id, selectedStatus.toLowerCase());
      }
    } catch (err) {
      console.warn('Status update API note:', err.message);
    } finally {
      setSaving(false);
      if (onStatusUpdated) onStatusUpdated(selectedStatus);
      navigation.navigate('ChatDetail', {
        chat: { ...contact, status: selectedStatus },
        newStatus: selectedStatus,
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* Modal Dialog Sheet (Matching Image 1 Screen 1) */}
      <View style={styles.sheetDialog}>
        <View style={styles.sheetHandle} />

        {/* Top Header */}
        <View style={styles.sheetHeader}>
          <View>
            <Text style={styles.messbeeTag}>MESSBEE</Text>
            <Text style={styles.sheetTitle}>Update Lead Status</Text>
            <Text style={styles.sheetSubtitle}>{contact.name || contact.phone || '919350157447'}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
            <Ionicons name="close" size={20} color="#64748B" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* CURRENT STATUS */}
          <Text style={styles.sectionHeading}>CURRENT STATUS</Text>
          <View style={styles.currentStatusCard}>
            <View style={styles.currentStatusDot} />
            <Text style={styles.currentStatusTitle}>{currentStatus}</Text>
            <Text style={styles.currentStatusDesc}>This contact is currently being handled.</Text>
          </View>

          {/* SELECT NEW STATUS */}
          <Text style={[styles.sectionHeading, { marginTop: 18 }]}>SELECT NEW STATUS</Text>

          {STATUS_OPTIONS.map((opt) => {
            const isSelected = selectedStatus.toLowerCase() === opt.id.toLowerCase();
            return (
              <TouchableOpacity
                key={opt.id}
                style={[styles.statusOptionCard, isSelected && styles.statusOptionCardSelected]}
                onPress={() => setSelectedStatus(opt.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.statusIconCircle, { backgroundColor: isSelected ? '#DCFCE7' : '#F1F5F9' }]}>
                  <Ionicons name={opt.icon} size={18} color={opt.color} />
                </View>

                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={styles.statusOptionTitle}>{opt.title}</Text>
                  <Text style={styles.statusOptionDesc}>{opt.desc}</Text>
                </View>

                <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                  {isSelected && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            );
          })}

          {/* Same Status Warning Banner */}
          {isSameStatus && (
            <View style={styles.warningBanner}>
              <Ionicons name="information-circle-outline" size={16} color="#D97706" style={{ marginRight: 6 }} />
              <Text style={styles.warningBannerText}>
                This contact already has this status. Choose a different status to continue.
              </Text>
            </View>
          )}

          {/* INTERNAL REASON FOR CHANGE (OPTIONAL) */}
          <View style={styles.reasonHeaderRow}>
            <Text style={styles.sectionHeading}>INTERNAL REASON FOR CHANGE</Text>
            <Text style={styles.optionalTag}>OPTIONAL</Text>
          </View>

          <View style={styles.reasonInputBox}>
            <TextInput
              style={styles.reasonInput}
              placeholder="Explain why you're changing the status..."
              placeholderTextColor="#94A3B8"
              value={reason}
              onChangeText={setReason}
              maxLength={200}
              multiline
            />
            <Text style={styles.charCountText}>{reason.length}/200</Text>
          </View>

          <Text style={styles.privateNoteText}>• Private to your team - never sent on WhatsApp.</Text>

          {/* Quick Tags Chips */}
          <View style={styles.quickTagsWrap}>
            {QUICK_TAGS.map((tag, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.quickTagChip}
                onPress={() => setReason(tag)}
                activeOpacity={0.7}
              >
                <Text style={styles.quickTagText}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Footer Actions */}
        <View style={styles.footerBar}>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.confirmBtn, isSameStatus && styles.confirmBtnDisabled]}
            onPress={handleConfirm}
            disabled={isSameStatus || saving}
            activeOpacity={0.85}
          >
            <Ionicons name="checkmark" size={16} color={isSameStatus ? '#94A3B8' : '#FFFFFF'} style={{ marginRight: 6 }} />
            <Text style={[styles.confirmBtnText, isSameStatus && styles.confirmBtnTextDisabled]}>
              Confirm Status Update
            </Text>
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
  sheetHeader: {
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
  scrollContent: {
    paddingBottom: 24,
  },
  sectionHeading: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  currentStatusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    borderRadius: 12,
    padding: 12,
  },
  currentStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00875A',
    marginRight: 8,
  },
  currentStatusTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00875A',
    marginRight: 8,
  },
  currentStatusDesc: {
    fontSize: 12,
    color: '#64748B',
    flex: 1,
  },
  statusOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  statusOptionCardSelected: {
    borderColor: '#00875A',
    backgroundColor: '#FAFCFA',
  },
  statusIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statusOptionTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  statusOptionDesc: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: '#00875A',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00875A',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 10,
    padding: 10,
    marginTop: 4,
    marginBottom: 16,
  },
  warningBannerText: {
    fontSize: 11.5,
    color: '#92400E',
    flex: 1,
  },
  reasonHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 6,
  },
  optionalTag: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#94A3B8',
  },
  reasonInputBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    minHeight: 80,
  },
  reasonInput: {
    fontSize: 13,
    color: '#0F172A',
    minHeight: 50,
  },
  charCountText: {
    fontSize: 10,
    color: '#94A3B8',
    textAlign: 'right',
  },
  privateNoteText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 6,
    marginBottom: 12,
  },
  quickTagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickTagChip: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  quickTagText: {
    fontSize: 11,
    color: '#475569',
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cancelBtnText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#64748B',
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00875A',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  confirmBtnDisabled: {
    backgroundColor: '#F1F5F9',
  },
  confirmBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  confirmBtnTextDisabled: {
    color: '#94A3B8',
  },
});
