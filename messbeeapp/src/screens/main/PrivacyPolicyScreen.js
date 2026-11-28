import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

const POLICY_SECTIONS = [
  {
    id: 'collection',
    number: '01',
    title: 'Information We Collect',
    icon: 'layers-outline',
    iconBg: '#E8F5E9',
    iconColor: '#00B67A',
    summary: 'Data required to operate your WhatsApp Business CRM workspace.',
    points: [
      {
        label: 'Account & Business Profile',
        detail: 'Your full name, business name, email address, phone number, business category, and workspace address provided during registration.',
      },
      {
        label: 'WhatsApp API Credentials',
        detail: 'Your Meta WABA ID, Phone Number ID, access tokens, and webhook configuration needed to send and receive messages.',
      },
      {
        label: 'Contacts & Message Logs',
        detail: 'Customer names, phone numbers, labels, CRM notes, and conversation history synced within your workspace.',
      },
      {
        label: 'Usage & Diagnostics',
        detail: 'Device type, app version, delivery statuses, and error logs used strictly to maintain platform reliability.',
      },
    ],
  },
  {
    id: 'usage',
    number: '02',
    title: 'How We Use Your Data',
    icon: 'flash-outline',
    iconBg: '#EFF6FF',
    iconColor: '#2563EB',
    summary: 'Powers messaging, automation, campaigns, and billing.',
    points: [
      {
        label: 'Messaging & Broadcasts',
        detail: 'Delivering one-to-one customer chats, approved WhatsApp templates, media attachments, and scheduled campaigns.',
      },
      {
        label: 'Automation & Bot Workflows',
        detail: 'Executing auto-replies, welcome messages, away messages, and custom CRM pipeline triggers.',
      },
      {
        label: 'Billing & WCC Credits',
        detail: 'Managing active subscription plans, WhatsApp Conversation Credits (WCC), and generating GST/tax invoices.',
      },
      {
        label: 'Security & Fraud Prevention',
        detail: 'Protecting accounts with OTP verification, two-step PIN checks, and unauthorized access monitoring.',
      },
    ],
  },
  {
    id: 'meta',
    number: '03',
    title: 'WhatsApp & Meta Compliance',
    icon: 'logo-whatsapp',
    iconBg: '#ECFDF5',
    iconColor: '#059669',
    summary: 'Aligned with Meta Business & WhatsApp Cloud API standards.',
    points: [
      {
        label: 'Official Cloud API Processing',
        detail: 'Messages transmitted via Meta Cloud API are governed by Meta\'s WhatsApp Business Data Processing Terms.',
      },
      {
        label: 'Customer Opt-In & Consent',
        detail: 'Businesses must obtain explicit user opt-in before initiating template messages or broadcast campaigns.',
      },
      {
        label: 'Credential Encryption',
        detail: 'Permanent access tokens, webhook verify tokens, and registration PINs are encrypted at rest and in transit.',
      },
    ],
  },
  {
    id: 'sharing',
    number: '04',
    title: 'Data Sharing & Third Parties',
    icon: 'git-network-outline',
    iconBg: '#F3E8FF',
    iconColor: '#7C3AED',
    summary: 'We never sell your customer lists or conversation data.',
    points: [
      {
        label: 'Zero Data Selling',
        detail: 'MessBee never sells, rents, or trades your contacts, templates, or chat histories to advertisers or third parties.',
      },
      {
        label: 'Essential Infrastructure',
        detail: 'Data is shared only with Meta (for WhatsApp message routing), payment gateways (for billing), and secure cloud hosting providers.',
      },
      {
        label: 'Legal Compliance',
        detail: 'Information may be disclosed only when required by applicable law, court order, or regulatory authority.',
      },
    ],
  },
  {
    id: 'rights',
    number: '05',
    title: 'Your Rights & Controls',
    icon: 'key-outline',
    iconBg: '#FEF3C7',
    iconColor: '#D97706',
    summary: 'Full ownership and control over your workspace data.',
    points: [
      {
        label: 'Access & Export',
        detail: 'Export your contacts, campaign reports, and billing statements at any time from your workspace.',
      },
      {
        label: 'Correction & Deletion',
        detail: 'Update your business profile, remove contacts, or request permanent account deletion via support.',
      },
      {
        label: 'Disconnect Anytime',
        detail: 'Deregister your WhatsApp phone number or revoke API credentials instantly from WhatsApp Configuration.',
      },
    ],
  },
];

export default function PrivacyPolicyScreen({ navigation }) {
  const [expandedId, setExpandedId] = useState('collection');

  const toggleSection = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Top Navigation Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.75}
        >
          <Ionicons name="chevron-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Privacy Policy</Text>
          <Text style={styles.headerSubtitle}>MessBee Business Platform</Text>
        </View>
        <View style={styles.headerRightBadge}>
          <Ionicons name="shield-checkmark" size={18} color="#00B67A" />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Banner Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroIconWrap}>
              <Ionicons name="lock-closed" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.updatedPill}>
              <View style={styles.updatedDot} />
              <Text style={styles.updatedText}>Updated Nov 2026</Text>
            </View>
          </View>

          <Text style={styles.heroTitle}>Your Privacy & Data Security</Text>
          <Text style={styles.heroDesc}>
            At MessBee, we treat your business communications, customer contacts, and WhatsApp API credentials with strict confidentiality and enterprise-grade protection.
          </Text>

          <View style={styles.trustRow}>
            <View style={styles.trustBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#A7F3D0" />
              <Text style={styles.trustBadgeText}>Encrypted Tokens</Text>
            </View>
            <View style={styles.trustBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#A7F3D0" />
              <Text style={styles.trustBadgeText}>Zero Data Sale</Text>
            </View>
            <View style={styles.trustBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#A7F3D0" />
              <Text style={styles.trustBadgeText}>Meta Compliant</Text>
            </View>
          </View>
        </View>

        {/* Quick Highlights */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderTitle}>Policy Breakdown</Text>
          <Text style={styles.sectionHeaderHint}>Tap any section to expand</Text>
        </View>

        {/* Accordion Policy Sections */}
        {POLICY_SECTIONS.map((section) => {
          const isOpen = expandedId === section.id;
          return (
            <View key={section.id} style={[styles.policyCard, isOpen && styles.policyCardActive]}>
              <TouchableOpacity
                style={styles.policyCardHeader}
                onPress={() => toggleSection(section.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.policyIconBox, { backgroundColor: section.iconBg }]}>
                  <Ionicons name={section.icon} size={20} color={section.iconColor} />
                </View>
                <View style={styles.policyTitleCol}>
                  <View style={styles.policyNumberRow}>
                    <Text style={styles.policyNumber}>SECTION {section.number}</Text>
                  </View>
                  <Text style={styles.policyTitle}>{section.title}</Text>
                  {!isOpen && (
                    <Text style={styles.policySummary} numberOfLines={1}>
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
                <View style={styles.policyBody}>
                  <Text style={styles.policyBodyIntro}>{section.summary}</Text>
                  {section.points.map((pt, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.pointRow,
                        idx === section.points.length - 1 && { marginBottom: 0 },
                      ]}
                    >
                      <View style={styles.pointBullet}>
                        <Ionicons name="checkmark" size={12} color="#00B67A" />
                      </View>
                      <View style={styles.pointTextCol}>
                        <Text style={styles.pointLabel}>{pt.label}</Text>
                        <Text style={styles.pointDetail}>{pt.detail}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}

        {/* Contact & Grievance Officer Card */}
        <View style={styles.contactCard}>
          <View style={styles.contactTop}>
            <View style={styles.contactIconCircle}>
              <Ionicons name="mail-outline" size={20} color="#00B67A" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.contactTitle}>Privacy Questions or Data Requests?</Text>
              <Text style={styles.contactSubtitle}>
                Reach out to our Data Protection team for exports, corrections, or deletion requests.
              </Text>
            </View>
          </View>

          <View style={styles.contactInfoBox}>
            <View style={styles.contactInfoRow}>
              <Ionicons name="mail" size={14} color="#64748B" />
              <Text style={styles.contactInfoText}>support@messbee.com</Text>
            </View>
            <View style={styles.contactInfoRow}>
              <Ionicons name="call" size={14} color="#64748B" />
              <Text style={styles.contactInfoText}>+91 8181756688</Text>
            </View>
          </View>
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
    paddingTop: 10,
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
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 36,
  },
  heroCard: {
    backgroundColor: '#065F46',
    borderRadius: 22,
    padding: 20,
    marginBottom: 22,
    shadowColor: '#065F46',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
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
    backgroundColor: 'rgba(255,255,255,0.16)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  updatedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
  },
  updatedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
  },
  updatedText: {
    color: '#ECFDF5',
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
    color: '#D1FAE5',
    lineHeight: 19,
    marginBottom: 16,
  },
  trustRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 5,
  },
  trustBadgeText: {
    color: '#ECFDF5',
    fontSize: 11,
    fontWeight: '600',
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
  policyCard: {
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
  policyCardActive: {
    borderColor: '#A7F3D0',
    shadowColor: '#00B67A',
    shadowOpacity: 0.08,
    elevation: 3,
  },
  policyCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  policyIconBox: {
    width: 42,
    height: 42,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  policyTitleCol: {
    flex: 1,
  },
  policyNumberRow: {
    marginBottom: 2,
  },
  policyNumber: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00B67A',
    letterSpacing: 0.8,
  },
  policyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  policySummary: {
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
  policyBody: {
    paddingHorizontal: 15,
    paddingBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FAFFFC',
  },
  policyBodyIntro: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
    marginBottom: 12,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  pointBullet: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  pointTextCol: {
    flex: 1,
  },
  pointLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  pointDetail: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
  contactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  contactTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  contactIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 3,
  },
  contactSubtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
  },
  contactInfoBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  contactInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  contactInfoText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  footerCopyright: {
    textAlign: 'center',
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 20,
    fontWeight: '500',
  },
});
