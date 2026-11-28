import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { automationService } from '../../services/api';
import { validateAutomationFlow, buildSequentialEdges } from './automationHelpers';

export default function PublishAutomationScreen({ navigation, route }) {
  const { flow } = route.params || {};
  const [publishing, setPublishing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [publishedFlow, setPublishedFlow] = useState(null);

  const checklist = useMemo(() => validateAutomationFlow(flow, true), [flow]);
  const allPassed = checklist.every((c) => c.passed);

  const triggerNode = (flow?.nodes || []).find(
    (n) => n.type === 'triggerNode' || n.type === 'eventTriggerNode'
  );
  const triggerLabel =
    triggerNode?.data?.triggerType === 'qr_code'
      ? 'QR Code Scanned'
      : triggerNode?.data?.triggerType === 'webhook'
      ? 'Webhook Event'
      : 'Keyword Match';

  const handleSaveFlow = async (isActive) => {
    setPublishing(true);
    try {
      const payload = {
        name: (flow?.name || 'Automation Flow').trim(),
        channelId: flow?.channelId || undefined,
        isActive,
        nodes: flow?.nodes || [],
        edges: buildSequentialEdges(flow?.nodes || []),
      };

      let saved;
      if (flow?._id) {
        saved = await automationService.updateAutomation(flow._id, payload);
      } else {
        saved = await automationService.createAutomation(payload);
      }

      setShowConfirmModal(false);
      if (isActive) {
        setPublishedFlow(saved || { ...flow, ...payload });
      } else {
        Alert.alert('Saved as Draft', 'Flow saved as draft.');
        navigation.navigate('AutomationDashboard');
      }
    } catch (err) {
      setShowConfirmModal(false);
      Alert.alert(
        'Publish Failed',
        err?.response?.data?.message || err?.message || 'Unable to publish automation.'
      );
    } finally {
      setPublishing(false);
    }
  };

  const isPublished = !!publishedFlow;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>
            {isPublished ? 'Automation published' : 'Publish Automation'}
          </Text>
          <Text style={styles.headerSub}>
            {isPublished ? 'Live and active' : 'Review checklist before going live'}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Hero Status Card */}
        <View style={[styles.heroCard, !allPassed && !isPublished && styles.heroCardWarn]}>
          <View style={styles.heroIcon}>
            <Ionicons
              name={isPublished ? 'checkmark-done' : allPassed ? 'rocket' : 'alert'}
              size={24}
              color="#FFFFFF"
            />
          </View>
          <View style={{ flex: 1 }}>
            {isPublished && (
              <View style={styles.liveBadge}>
                <Text style={styles.liveBadgeText}>Live</Text>
              </View>
            )}
            <Text style={styles.heroTitle}>
              {isPublished
                ? publishedFlow.name
                : allPassed
                ? 'Your flow is ready to go live!'
                : 'Fix checklist items first'}
            </Text>
            <Text style={styles.heroSub}>
              {isPublished
                ? 'Your automation is now active and handling incoming WhatsApp events.'
                : allPassed
                ? 'All validation checks passed. Publish to activate immediately.'
                : 'Complete the highlighted items below before publishing.'}
            </Text>
          </View>
        </View>

        {/* Validation Checklist */}
        <Text style={styles.sectionTitle}>Validation checklist</Text>
        <View style={styles.checklistCard}>
          {checklist.map((item, idx) => (
            <View
              key={item.id}
              style={[styles.checkRow, idx < checklist.length - 1 && styles.checkBorder]}
            >
              <Ionicons
                name={item.passed ? 'checkmark-circle' : 'close-circle'}
                size={20}
                color={item.passed ? '#00B67A' : '#EF4444'}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.checkTitle}>{item.title}</Text>
                <Text style={styles.checkDesc}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Flow Summary */}
        <Text style={[styles.sectionTitle, { marginTop: 18 }]}>Flow summary</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Flow Name</Text>
            <Text style={styles.summaryVal} numberOfLines={1}>{flow?.name || 'Untitled'}</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Trigger</Text>
            <Text style={styles.summaryVal} numberOfLines={1}>{triggerLabel}</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Total Nodes</Text>
            <Text style={styles.summaryVal}>{(flow?.nodes || []).length}</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Status</Text>
            <Text style={[styles.summaryVal, { color: isPublished ? '#00B67A' : '#64748B' }]}>
              {isPublished ? 'Active (Live)' : 'Draft'}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Footer */}
      {isPublished ? (
        <View style={styles.publishedFooter}>
          <TouchableOpacity
            style={styles.darkGreenBtn}
            onPress={() => navigation.navigate('AnalyticsOverview')}
          >
            <Ionicons name="bar-chart-outline" size={16} color="#FFFFFF" />
            <Text style={styles.primaryBtnText}>View live analytics</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.outlineBackBtn}
            onPress={() => navigation.navigate('AutomationDashboard')}
          >
            <Text style={styles.secondaryBtnText}>Back to automations</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => handleSaveFlow(false)}
            disabled={publishing}
          >
            <Text style={styles.secondaryBtnText}>Save as draft</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.primaryBtn, !allPassed && { opacity: 0.5 }]}
            onPress={() => {
              if (!allPassed) {
                Alert.alert('Validation Incomplete', 'Please resolve all failed checklist items.');
                return;
              }
              setShowConfirmModal(true);
            }}
            disabled={publishing}
          >
            <Text style={styles.primaryBtnText}>Publish automation</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>Publish Automation?</Text>
            <Text style={styles.confirmDesc}>
              Your flow will immediately start running for matching WhatsApp triggers.
            </Text>
            <View style={styles.confirmBtns}>
              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => setShowConfirmModal(false)}
                disabled={publishing}
              >
                <Text style={styles.secondaryBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => handleSaveFlow(true)}
                disabled={publishing}
              >
                {publishing ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryBtnText}>Publish now</Text>
                )}
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
    backgroundColor: '#F8FAFC',
    paddingTop: Platform.OS === 'android' ? 28 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#0F172A' },
  headerSub: { fontSize: 11, color: '#64748B', marginTop: 1 },
  body: { padding: 16, paddingBottom: 110 },
  heroCard: {
    backgroundColor: '#00B67A',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 18,
  },
  heroCardWarn: { backgroundColor: '#D97706' },
  heroIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  liveBadgeText: { fontSize: 10, fontWeight: '800', color: '#00875A' },
  heroTitle: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  heroSub: { fontSize: 12, color: '#ECFDF5', marginTop: 2, lineHeight: 17 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 10 },
  checklistCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  checkBorder: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  checkTitle: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  checkDesc: { fontSize: 11, color: '#64748B', marginTop: 1 },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  summaryBox: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
  },
  summaryLabel: { fontSize: 11, color: '#64748B' },
  summaryVal: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginTop: 3 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 10,
    padding: 14,
    paddingBottom: Platform.OS === 'ios' ? 26 : 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  secondaryBtnText: { fontSize: 13, fontWeight: '700', color: '#334155' },
  primaryBtn: {
    flex: 1.3,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#00B67A',
    alignItems: 'center',
  },
  primaryBtnText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  publishedFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    gap: 8,
    padding: 14,
    paddingBottom: Platform.OS === 'ios' ? 26 : 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  darkGreenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#064E3B',
  },
  outlineBackBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
    justifyContent: 'flex-end',
  },
  confirmCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 22,
    paddingBottom: 34,
  },
  confirmTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  confirmDesc: { fontSize: 13, color: '#64748B', marginTop: 6, marginBottom: 18, lineHeight: 19 },
  confirmBtns: { flexDirection: 'row', gap: 10 },
});
