import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

const TERMS_SECTIONS = [
  {
    id: 'acceptance',
    number: '01',
    title: 'Acceptance of Terms',
    icon: 'document-text-outline',
    iconBg: '#ECFDF5',
    iconColor: '#00B67A',
    summary: 'Agreement governing your use of MessBee Business.',
    items: [
      'By registering, logging in, or using the MessBee mobile app or web platform, you agree to be bound by these Terms & Conditions.',
      'If you are using MessBee on behalf of a company or organization, you represent that you have authority to bind that entity.',
      'We may update these terms periodically to reflect new features, Meta policy updates, or legal requirements.',
    ],
  },
  {
    id: 'whatsapp_rules',
    number: '02',
    title: 'WhatsApp & Meta Policy Compliance',
    icon: 'logo-whatsapp',
    iconBg: '#E8F5E9',
    iconColor: '#059669',
    summary: 'Mandatory rules for using WhatsApp Business API.',
    items: [
      'You must strictly comply with Meta\'s WhatsApp Business Messaging Policy and Commerce Policy at all times.',
      'Customers must explicitly opt in before receiving promotional broadcasts or template notifications.',
      'Initiating conversations outside the 24-hour customer service window requires a Meta-approved message template.',
      'Sending spam, phishing links, or prohibited goods/services may result in immediate WABA suspension by Meta and MessBee.',
    ],
  },
  {
    id: 'accounts',
    number: '03',
    title: 'Accounts & Security',
    icon: 'person-circle-outline',
    iconBg: '#EFF6FF',
    iconColor: '#2563EB',
    summary: 'Keeping your workspace credentials and team access safe.',
    items: [
      'You are responsible for maintaining the confidentiality of your login password, OTPs, and WhatsApp API tokens.',
      'Workspace owners are responsible for all actions performed by team members invited under their organization.',
      'Notify MessBee immediately at support@messbee.com if you suspect unauthorized access to your account.',
    ],
  },
  {
    id: 'billing',
    number: '04',
    title: 'Subscriptions, Plans & WCC Credits',
    icon: 'card-outline',
    iconBg: '#FEF3C7',
    iconColor: '#D97706',
    summary: 'How plan renewals, messaging credits, and taxes work.',
    items: [
      'Paid plans and WhatsApp Conversation Credits (WCC) are billed according to the pricing tier selected in your workspace.',
      'Campaigns and template broadcasts require sufficient active WCC balance or an eligible active subscription.',
      'All applicable taxes (including GST where applicable) are itemized on your downloadable billing invoices.',
    ],
  },
  {
    id: 'prohibited',
    number: '05',
    title: 'Prohibited Activities',
    icon: 'ban-outline',
    iconBg: '#FEF2F2',
    iconColor: '#EF4444',
    summary: 'Actions that violate platform integrity and user trust.',
    items: [
      'Reverse engineering, scraping, or attempting to bypass MessBee API rate limits and authentication controls.',
      'Uploading malicious files, automated abuse scripts, or impersonating another business or brand.',
      'Using MessBee to send unsolicited bulk messages without valid recipient consent.',
    ],
  },
  {
    id: 'liability',
    number: '06',
    title: 'Service Availability & Liability',
    icon: 'shield-outline',
    iconBg: '#F3E8FF',
    iconColor: '#7C3AED',
    summary: 'Platform uptime, third-party dependencies, and limits.',
    items: [
      'MessBee relies on Meta\'s WhatsApp Cloud API and telecom networks; delivery delays caused by upstream outages are outside our direct control.',
      'To the maximum extent permitted by law, MessBee\'s total liability is limited to the subscription fees paid by you in the preceding 3 months.',
    ],
  },
];

export default function TermsConditionsScreen({ navigation }) {
  const [expandedId, setExpandedId] = useState('acceptance');

  const toggleSection = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.75}
        >
          <Ionicons name="chevron-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Terms & Conditions</Text>
          <Text style={styles.headerSubtitle}>MessBee Service Agreement</Text>
        </View>
        <View style={styles.headerRightBadge}>
          <Ionicons name="document-lock" size={18} color="#0F172A" />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Dark Emerald/Slate Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroIconWrap}>
              <Ionicons name="ribbon-outline" size={24} color="#34D399" />
            </View>
            <View style={styles.effectivePill}>
              <Text style={styles.effectiveText}>Effective Nov 2026</Text>
            </View>
          </View>

          <Text style={styles.heroTitle}>Terms of Service</Text>
          <Text style={styles.heroDesc}>
            Please review these terms carefully. They outline your rights, WhatsApp Business compliance obligations, and how MessBee delivers services to your business.
          </Text>

          <View style={styles.highlightBanner}>
            <Ionicons name="information-circle" size={16} color="#34D399" />
            <Text style={styles.highlightText}>
              Compliant with Meta WhatsApp Business & Cloud API Policies
            </Text>
          </View>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderTitle}>Agreement Clauses</Text>
          <Text style={styles.sectionHeaderHint}>Tap to read details</Text>
        </View>

        {/* Accordion Terms Cards */}
        {TERMS_SECTIONS.map((section) => {
          const isOpen = expandedId === section.id;
          return (
            <View key={section.id} style={[styles.termCard, isOpen && styles.termCardActive]}>
              <TouchableOpacity
                style={styles.termHeader}
                onPress={() => toggleSection(section.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.termIconBox, { backgroundColor: section.iconBg }]}>
                  <Ionicons name={section.icon} size={20} color={section.iconColor} />
                </View>
                <View style={styles.termTitleCol}>
                  <Text style={styles.termNumber}>CLAUSE {section.number}</Text>
                  <Text style={styles.termTitle}>{section.title}</Text>
                  {!isOpen && (
                    <Text style={styles.termSummary} numberOfLines={1}>
                      {section.summary}
                    </Text>
                  )}
                </View>
                <View style={[styles.chevronBox, isOpen && styles.chevronBoxActive]}>
                  <Ionicons
                    name={isOpen ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={isOpen ? '#00B67A' : '#64748B'}
                  />
                </View>
              </TouchableOpacity>

              {isOpen && (
                <View style={styles.termBody}>
                  {section.items.map((item, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.clauseRow,
                        idx === section.items.length - 1 && { marginBottom: 0 },
                      ]}
                    >
                      <View style={styles.clauseDot} />
                      <Text style={styles.clauseText}>{item}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}

        {/* Footer Legal Note */}
        <View style={styles.legalNoteCard}>
          <View style={styles.legalNoteHeader}>
            <Ionicons name="scale-outline" size={18} color="#0F172A" />
            <Text style={styles.legalNoteTitle}>Governing Law & Support</Text>
          </View>
          <Text style={styles.legalNoteBody}>
            These Terms are governed by applicable laws of India. For legal notices or compliance inquiries, contact{' '}
            <Text style={{ fontWeight: '700', color: '#00B67A' }}>support@messbee.com</Text>.
          </Text>
        </View>

        <Text style={styles.footerCopyright}>
          © 2026 MessBee Business Platform. All rights reserved.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 24 : 10,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 1,
  },
  headerRightBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 36,
  },
  heroCard: {
    backgroundColor: '#0F172A',
    borderRadius: 22,
    padding: 20,
    marginBottom: 22,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 6,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  heroIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(52,211,153,0.14)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  effectivePill: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 20,
  },
  effectiveText: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '700',
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  heroDesc: {
    fontSize: 13,
    color: '#CBD5E1',
    lineHeight: 19,
    marginBottom: 14,
  },
  highlightBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(16,185,129,0.14)',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.25)',
  },
  highlightText: {
    flex: 1,
    fontSize: 11.5,
    fontWeight: '600',
    color: '#A7F3D0',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  sectionHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionHeaderHint: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  termCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  termCardActive: {
    borderColor: '#A7F3D0',
    shadowColor: '#00B67A',
    shadowOpacity: 0.08,
    elevation: 3,
  },
  termHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  termIconBox: {
    width: 42,
    height: 42,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  termTitleCol: {
    flex: 1,
  },
  termNumber: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00B67A',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  termTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  termSummary: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  chevronBox: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  chevronBoxActive: {
    backgroundColor: '#ECFDF5',
  },
  termBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FAFFFC',
  },
  clauseRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  clauseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00B67A',
    marginTop: 6,
    marginRight: 10,
  },
  clauseText: {
    flex: 1,
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 19,
  },
  legalNoteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  legalNoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  legalNoteTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  legalNoteBody: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
  footerCopyright: {
    textAlign: 'center',
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 20,
    fontWeight: '500',
  },
});
