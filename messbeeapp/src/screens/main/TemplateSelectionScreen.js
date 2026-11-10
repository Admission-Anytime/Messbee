import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

// Sample pre-approved WhatsApp templates matching Meta Cloud API
export const INITIAL_TEMPLATES = [
  {
    id: 'tmpl_1',
    name: 'order_confirmation_v2',
    category: 'UTILITY',
    language: 'en_US',
    status: 'APPROVED',
    headerType: 'TEXT',
    headerText: 'Order Confirmed! 📦',
    bodyText: 'Hello {{1}}, thank you for your order #{{2}}. Your items are being packed and will be delivered by {{3}}. Track live status here: {{4}}',
    variables: ['Customer Name', 'Order ID', 'Delivery Date', 'Tracking URL'],
    defaultVars: ['Rahul', 'ORD-98213', 'Tomorrow 4 PM', 'https://track.messbee.com/98213'],
    footerText: 'MessBee Quick Commerce • Reply STOP to unsubscribe',
    buttons: [
      { type: 'QUICK_REPLY', text: 'Track Order 🚚' },
      { type: 'QUICK_REPLY', text: 'Need Help 💬' },
    ],
  },
  {
    id: 'tmpl_2',
    name: 'festive_offer_brochure',
    category: 'MARKETING',
    language: 'en_US',
    status: 'APPROVED',
    headerType: 'DOCUMENT',
    headerMedia: 'festive_catalogue_2026.pdf',
    bodyText: 'Hi {{1}}! 🎉 Exclusive festive discount just for you. Get flat {{2}}% off on all WhatsApp marketing automation subscriptions using code {{3}} before {{4}}!',
    variables: ['Contact Name', 'Discount %', 'Coupon Code', 'Valid Till'],
    defaultVars: ['Rahul', '25', 'FESTIVE25', '30 Nov 2026'],
    footerText: 'Terms & conditions apply • MessBee CRM',
    buttons: [
      { type: 'URL', text: 'Claim Discount 🎁', url: 'https://messbee.com/offers' },
      { type: 'QUICK_REPLY', text: 'Talk to Sales 📞' },
    ],
  },
  {
    id: 'tmpl_3',
    name: 'appointment_reminder',
    category: 'UTILITY',
    language: 'en_US',
    status: 'APPROVED',
    headerType: 'TEXT',
    headerText: 'Consultation Reminder ⏰',
    bodyText: 'Dear {{1}}, this is a friendly reminder for your scheduled video consultation with {{2}} on {{3}} at {{4}}. Please join 5 mins early.',
    variables: ['Client Name', 'Specialist Name', 'Date', 'Time'],
    defaultVars: ['Rahul Sharma', 'Dr. Alok Verma', 'Nov 12', '11:00 AM'],
    footerText: 'MessBee Health Desk',
    buttons: [
      { type: 'URL', text: 'Join Meeting 🎥', url: 'https://meet.messbee.com/room' },
      { type: 'QUICK_REPLY', text: 'Reschedule 📅' },
    ],
  },
  {
    id: 'tmpl_4',
    name: 'payment_link_request',
    category: 'UTILITY',
    language: 'en_US',
    status: 'APPROVED',
    headerType: 'TEXT',
    headerText: 'Invoice Payment Due 💳',
    bodyText: 'Hello {{1}}, an invoice of ₹{{2}} has been generated for your recent booking of {{3}}. Click below to complete payment securely via UPI or Card.',
    variables: ['Customer Name', 'Amount', 'Service Name'],
    defaultVars: ['Rahul', '4,999', 'Annual Enterprise WhatsApp Suite'],
    footerText: 'Instant Receipt on Payment',
    buttons: [
      { type: 'URL', text: 'Pay Now ₹ 💳', url: 'https://pay.messbee.com/inv982' },
      { type: 'QUICK_REPLY', text: 'Share Receipt 📄' },
    ],
  },
  {
    id: 'tmpl_5',
    name: 'otp_authentication_secure',
    category: 'AUTHENTICATION',
    language: 'en_US',
    status: 'APPROVED',
    headerType: 'NONE',
    bodyText: '{{1}} is your one-time verification passcode for MessBee Portal. Do not share this OTP with anyone, including our support agents. Valid for 10 minutes.',
    variables: ['OTP Code'],
    defaultVars: ['849201'],
    footerText: 'MessBee Security Center',
    buttons: [
      { type: 'COPY_CODE', text: 'Copy Code 📋' },
    ],
  },
  {
    id: 'tmpl_6',
    name: 'lead_welcome_onboarding',
    category: 'MARKETING',
    language: 'en_US',
    status: 'APPROVED',
    headerType: 'IMAGE',
    headerMedia: 'welcome_banner.png',
    bodyText: 'Welcome aboard {{1}}! 🚀 We are thrilled to partner with {{2}}. Our dedicated relationship manager {{3}} will assist you with onboarding setup.',
    variables: ['Name', 'Company', 'Manager Name'],
    defaultVars: ['Rahul', 'Skyline Travels', 'Priya Verma'],
    footerText: 'Powered by MessBee API Gateway',
    buttons: [
      { type: 'QUICK_REPLY', text: 'Start Onboarding 🚀' },
      { type: 'QUICK_REPLY', text: 'View Documentation 📚' },
    ],
  },
];

const CATEGORIES = ['ALL', 'UTILITY', 'MARKETING', 'AUTHENTICATION'];

export default function TemplateSelectionScreen({ route, navigation }) {
  const { onSelectTemplate } = route.params || {};

  const [templates, setTemplates] = useState(INITIAL_TEMPLATES);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [search, setSearch] = useState('');

  // Variable customization modal state
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [varValues, setVarValues] = useState({});

  const filteredTemplates = templates.filter((t) => {
    const matchesCat = selectedCategory === 'ALL' || t.category === selectedCategory;
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.bodyText.toLowerCase().includes(search.toLowerCase()) ||
      (t.headerText && t.headerText.toLowerCase().includes(search.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleOpenCustomize = (tmpl) => {
    setActiveTemplate(tmpl);
    const initialMap = {};
    tmpl.variables.forEach((v, idx) => {
      initialMap[idx] = tmpl.defaultVars[idx] || '';
    });
    setVarValues(initialMap);
  };

  const renderRenderedBody = () => {
    if (!activeTemplate) return '';
    let rendered = activeTemplate.bodyText;
    activeTemplate.variables.forEach((v, idx) => {
      const val = varValues[idx] || `{{${idx + 1}}}`;
      rendered = rendered.replace(new RegExp(`\\{\\{${idx + 1}\\}\\}`, 'g'), val);
    });
    return rendered;
  };

  const handleSendTemplate = () => {
    if (!activeTemplate) return;

    const finalizedMessage = {
      id: `tmpl_${Date.now()}`,
      type: 'template',
      title: activeTemplate.headerText || activeTemplate.name,
      body: renderRenderedBody(),
      headerType: activeTemplate.headerType,
      headerMedia: activeTemplate.headerMedia,
      footerText: activeTemplate.footerText,
      buttons: activeTemplate.buttons,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sender: 'user',
      status: 'delivered',
    };

    if (onSelectTemplate) {
      onSelectTemplate(finalizedMessage);
    }
    setActiveTemplate(null);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Screen Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>WhatsApp Templates</Text>
          <Text style={styles.headerSubtitle}>Select pre-approved Meta Cloud API templates</Text>
        </View>
        <View style={styles.badgeCount}>
          <Text style={styles.badgeCountText}>{filteredTemplates.length}</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#9CA3AF" />
          <TextInput
            placeholder="Search templates by keyword or name..."
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Category Pills Bar */}
      <View style={styles.categoryBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.8}
              >
                <Text style={[styles.categoryChipText, isSelected && styles.categoryChipTextActive]}>
                  {cat === 'ALL' ? 'All Templates' : cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Templates List */}
      <FlatList
        data={filteredTemplates}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const categoryColors = {
            UTILITY: { bg: '#EFF6FF', text: '#2563EB' },
            MARKETING: { bg: '#ECFDF5', text: '#059669' },
            AUTHENTICATION: { bg: '#FEF3C7', text: '#D97706' },
          };
          const colors = categoryColors[item.category] || { bg: '#F3F4F6', text: '#4B5563' };

          return (
            <View style={styles.templateCard}>
              {/* Card Header */}
              <View style={styles.cardHeaderRow}>
                <View style={[styles.catBadge, { backgroundColor: colors.bg }]}>
                  <Text style={[styles.catBadgeText, { color: colors.text }]}>{item.category}</Text>
                </View>

                <View style={styles.approvedBadge}>
                  <Ionicons name="checkmark-done" size={14} color="#10B981" />
                  <Text style={styles.approvedText}>META APPROVED</Text>
                </View>

                <Text style={styles.langText}>{item.language}</Text>
              </View>

              {/* Template Name */}
              <Text style={styles.templateName}>{item.name}</Text>

              {/* Header preview if available */}
              {item.headerText ? (
                <View style={styles.headerBlock}>
                  <Ionicons name="sparkles" size={14} color={COLORS.primaryDark} />
                  <Text style={styles.headerBlockText}>{item.headerText}</Text>
                </View>
              ) : null}

              {item.headerType === 'DOCUMENT' && (
                <View style={styles.mediaAttachmentBadge}>
                  <Ionicons name="document-text" size={14} color="#DC2626" />
                  <Text style={styles.mediaAttachmentText}>Document Attached: {item.headerMedia}</Text>
                </View>
              )}

              {item.headerType === 'IMAGE' && (
                <View style={styles.mediaAttachmentBadge}>
                  <Ionicons name="image" size={14} color="#2563EB" />
                  <Text style={styles.mediaAttachmentText}>Image Attached: {item.headerMedia}</Text>
                </View>
              )}

              {/* Body snippet */}
              <Text style={styles.templateBody} numberOfLines={3}>
                {item.bodyText}
              </Text>

              {/* Buttons chips */}
              {item.buttons && item.buttons.length > 0 && (
                <View style={styles.btnChipsRow}>
                  {item.buttons.map((btn, bIdx) => (
                    <View key={bIdx} style={styles.btnChip}>
                      <Ionicons
                        name={btn.type === 'URL' ? 'link' : 'return-down-forward'}
                        size={12}
                        color="#4B5563"
                      />
                      <Text style={styles.btnChipText}>{btn.text}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Action Bar */}
              <View style={styles.cardFooter}>
                <View style={styles.varCountWrap}>
                  <Ionicons name="code-slash" size={14} color="#6B7280" />
                  <Text style={styles.varCountText}>{item.variables.length} Dynamic Variables</Text>
                </View>

                <TouchableOpacity
                  style={styles.selectBtn}
                  onPress={() => handleOpenCustomize(item)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.selectBtnText}>Customize & Send</Text>
                  <Ionicons name="chevron-forward" size={14} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      {/* Customize & Variable Input Sheet Modal */}
      <Modal visible={!!activeTemplate} transparent animationType="slide" onRequestClose={() => setActiveTemplate(null)}>
        <View style={modalStyles.overlay}>
          <View style={modalStyles.container}>
            {/* Grab bar */}
            <View style={modalStyles.grabBar} />

            {/* Modal Header */}
            <View style={modalStyles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={modalStyles.modalTitle}>Customize Parameters</Text>
                <Text style={modalStyles.modalSub}>{activeTemplate?.name}</Text>
              </View>
              <TouchableOpacity onPress={() => setActiveTemplate(null)} style={modalStyles.closeBtn}>
                <Ionicons name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: '78%' }}>
              {/* WhatsApp Live Preview Bubble */}
              <Text style={modalStyles.sectionTitle}>WhatsApp Message Preview</Text>
              <View style={modalStyles.previewBubble}>
                {activeTemplate?.headerText ? (
                  <Text style={modalStyles.previewHeader}>{activeTemplate.headerText}</Text>
                ) : null}

                {activeTemplate?.headerType === 'DOCUMENT' && (
                  <View style={modalStyles.docPreviewBar}>
                    <Ionicons name="document-text" size={24} color="#DC2626" />
                    <View style={{ marginLeft: 8 }}>
                      <Text style={modalStyles.docPreviewName}>{activeTemplate.headerMedia}</Text>
                      <Text style={modalStyles.docPreviewSub}>PDF Document • 1.2 MB</Text>
                    </View>
                  </View>
                )}

                <Text style={modalStyles.previewBody}>{renderRenderedBody()}</Text>

                {activeTemplate?.footerText ? (
                  <Text style={modalStyles.previewFooter}>{activeTemplate.footerText}</Text>
                ) : null}

                {activeTemplate?.buttons?.map((b, idx) => (
                  <View key={idx} style={modalStyles.previewButton}>
                    <Text style={modalStyles.previewButtonText}>{b.text}</Text>
                  </View>
                ))}

                <View style={modalStyles.previewMetaRow}>
                  <Text style={modalStyles.previewTime}>
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                  <Ionicons name="checkmark-done" size={14} color="#10B981" />
                </View>
              </View>

              {/* Variable Inputs */}
              {activeTemplate?.variables && activeTemplate.variables.length > 0 && (
                <View style={modalStyles.inputsSection}>
                  <Text style={modalStyles.sectionTitle}>Fill Parameter Values</Text>
                  {activeTemplate.variables.map((varName, idx) => (
                    <View key={idx} style={modalStyles.inputBlock}>
                      <View style={modalStyles.inputHeader}>
                        <Text style={modalStyles.varTag}>{`{{${idx + 1}}}`}</Text>
                        <Text style={modalStyles.varLabel}>{varName}</Text>
                      </View>
                      <TextInput
                        style={modalStyles.varInput}
                        value={varValues[idx] || ''}
                        onChangeText={(txt) => setVarValues({ ...varValues, [idx]: txt })}
                        placeholder={`Enter ${varName}...`}
                        placeholderTextColor="#9CA3AF"
                      />
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>

            {/* Action Bar */}
            <View style={modalStyles.footerRow}>
              <TouchableOpacity
                style={modalStyles.cancelBtn}
                onPress={() => setActiveTemplate(null)}
                activeOpacity={0.7}
              >
                <Text style={modalStyles.cancelBtnText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={modalStyles.sendTemplateBtn}
                onPress={handleSendTemplate}
                activeOpacity={0.8}
              >
                <Ionicons name="paper-plane" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={modalStyles.sendTemplateBtnText}>Send to Customer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 40 : 12,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  badgeCount: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeCountText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#111827',
  },
  categoryBar: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryChipActive: {
    backgroundColor: COLORS.primaryDeep,
    borderColor: COLORS.primaryDeep,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  templateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  catBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  catBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  approvedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  approvedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  langText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  templateName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  headerBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 8,
  },
  headerBlockText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  mediaAttachmentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 8,
  },
  mediaAttachmentText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
  },
  templateBody: {
    fontSize: 13,
    lineHeight: 18,
    color: '#4B5563',
    marginBottom: 10,
  },
  btnChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  btnChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  btnChipText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#374151',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  varCountWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  varCountText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  selectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  selectBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 20,
    maxHeight: '90%',
  },
  grabBar: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  modalSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  previewBubble: {
    backgroundColor: '#DCF8C6',
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#C7EBB2',
  },
  previewHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  docPreviewBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  docPreviewName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  docPreviewSub: {
    fontSize: 11,
    color: '#6B7280',
  },
  previewBody: {
    fontSize: 13.5,
    color: '#111827',
    lineHeight: 19,
    marginBottom: 6,
  },
  previewFooter: {
    fontSize: 11,
    color: '#6B7280',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  previewButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  previewButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primaryDark,
  },
  previewMetaRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  previewTime: {
    fontSize: 11,
    color: '#6B7280',
  },
  inputsSection: {
    marginBottom: 14,
  },
  inputBlock: {
    marginBottom: 12,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  varTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
  varLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  varInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#111827',
  },
  footerRow: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  sendTemplateBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.primaryDark,
  },
  sendTemplateBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

