import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { teamService } from '../../services/api';
import { validateForm } from '../../utils/validation';

const FAQS = [
  {
    q: 'How do I connect WhatsApp Business API?',
    a: 'Go to Settings -> WhatsApp Configuration -> API Credentials to enter your WABA ID, Phone Number ID, and Permanent Access Token. Or use QR WhatsApp Web for quick linking.',
  },
  {
    q: 'Why must I use an approved Template for first-time messages?',
    a: 'Meta WhatsApp policy requires pre-approved Templates to initiate a conversation outside the 24-hour customer service window.',
  },
  {
    q: 'How do Broadcast Campaigns work with Audience Groups?',
    a: 'Create segments in Audience Groups, then select your approved Template and target contacts/groups in Broadcast Campaigns to launch.',
  },
  {
    q: 'How does Inventory sync with Sales Invoices?',
    a: 'Every time a Sales Invoice is generated in Billing & Invoices, product stock is automatically deducted and logged in Inventory Movement Logs.',
  },
];

export default function HelpSupportScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIdx, setExpandedIdx] = useState(0);
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const filteredFaqs = FAQS.filter(
    (f) =>
      f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmitTicket = async () => {
    const { isValid, firstError } = validateForm({
      phone: { value: phone, required: true, phone: true, label: 'Contact Number' },
      message: { value: message, required: true, minLength: 5, label: 'Support Message' },
    });
    if (!isValid) {
      Alert.alert('Validation Error', firstError);
      return;
    }

    setSending(true);
    try {
      await teamService.contactSales({
        phone: phone.trim(),
        message: `[Support Ticket] ${message.trim()}`,
      });
      Alert.alert('Ticket Submitted', 'Support team has received your request and will contact you shortly.');
      setPhone('');
      setMessage('');
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to submit support request.');
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search help articles & FAQs..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        {filteredFaqs.map((faq, idx) => {
          const isOpen = expandedIdx === idx;
          return (
            <TouchableOpacity
              key={idx}
              style={styles.faqCard}
              onPress={() => setExpandedIdx(isOpen ? -1 : idx)}
              activeOpacity={0.8}
            >
              <View style={styles.faqHeader}>
                <Text style={styles.faqQ}>{faq.q}</Text>
                <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={18} color="#64748B" />
              </View>
              {isOpen && <Text style={styles.faqA}>{faq.a}</Text>}
            </TouchableOpacity>
          );
        })}

        <View style={styles.supportCard}>
          <Text style={styles.sectionTitle}>Contact Support Team</Text>
          <Text style={styles.supportMeta}>Email: support@messbee.com • Phone: +91 8181756688</Text>

          <Text style={styles.label}>Your Phone Number *</Text>
          <TextInput
            style={styles.input}
            placeholder="10-digit mobile number"
            keyboardType="phone-pad"
            maxLength={15}
            value={phone}
            onChangeText={setPhone}
          />

          <Text style={styles.label}>Describe Your Issue *</Text>
          <TextInput
            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
            placeholder="Explain your question or issue..."
            multiline
            value={message}
            onChangeText={setMessage}
          />

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitTicket} disabled={sending}>
            {sending ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.submitBtnText}>Submit Support Request</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  scrollContent: { padding: 16, gap: 12 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#0F172A' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginTop: 4 },
  faqCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#E2E8F0' },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQ: { fontSize: 14, fontWeight: '700', color: '#0F172A', flex: 1, marginRight: 8 },
  faqA: { fontSize: 13, color: '#475569', lineHeight: 19, marginTop: 8 },
  supportCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', marginTop: 8 },
  supportMeta: { fontSize: 12, color: '#00B67A', fontWeight: '600', marginTop: 4, marginBottom: 8 },
  label: { fontSize: 12, fontWeight: '600', color: '#334155', marginTop: 10, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#0F172A' },
  submitBtn: { backgroundColor: '#00B67A', paddingVertical: 13, borderRadius: 10, alignItems: 'center', marginTop: 16 },
  submitBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});
