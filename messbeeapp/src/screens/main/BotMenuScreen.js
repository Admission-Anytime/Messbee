import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { automationService, quickReplyService, qrWhatsappService } from '../../services/api';

export default function BotMenuScreen({ route, navigation }) {
  const { onTriggerMenu } = route.params || {};

  const [flowSteps, setFlowSteps] = useState([]);
  const [quickReplies, setQuickReplies] = useState([]);
  const [botEnabled, setBotEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadBotData = useCallback(async () => {
    try {
      const [automations, qrList, autoResponder] = await Promise.all([
        automationService.getAutomations().catch(() => []),
        quickReplyService.getQuickReplies().catch(() => []),
        qrWhatsappService.getAutoResponder().catch(() => null),
      ]);

      if (autoResponder && autoResponder.botEnabled !== undefined) {
        setBotEnabled(Boolean(autoResponder.botEnabled));
      }

      if (Array.isArray(automations) && automations.length > 0) {
        const mapped = automations.map((a, idx) => {
          const triggers = Array.isArray(a.triggers) ? a.triggers.map((t) => t.value || t.type).filter(Boolean) : [];
          return {
            id: a._id || `auto_${idx}`,
            title: a.name || `Automation Flow #${idx + 1}`,
            type: a.type || 'FLOW',
            active: a.status === 'ACTIVE' || a.active !== false,
            description: a.description || `Triggered by keywords: ${triggers.slice(0, 3).join(', ') || 'Direct message'}`,
            options: triggers.length > 0 ? triggers.slice(0, 4) : ['Trigger on message', 'Auto-reply sent'],
            badge: a.status === 'ACTIVE' ? 'ACTIVE' : 'DRAFT',
            raw: a,
          };
        });
        setFlowSteps(mapped);
      } else {
        setFlowSteps([]);
      }

      if (Array.isArray(qrList)) {
        setQuickReplies(qrList);
      }
    } catch (err) {
      console.warn('loadBotData error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadBotData();
  }, [loadBotData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadBotData();
  };

  const toggleStep = async (id) => {
    const target = flowSteps.find((s) => s.id === id);
    if (!target) return;
    const nextActive = !target.active;

    setFlowSteps((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              active: nextActive,
              badge: nextActive ? 'ACTIVE' : 'PAUSED',
            }
          : s
      )
    );

    try {
      if (!id.startsWith('auto_')) {
        await automationService.updateAutomation(id, {
          status: nextActive ? 'ACTIVE' : 'PAUSED',
        });
      }
    } catch (err) {
      console.warn('Update automation error:', err.message);
    }
  };

  const handleToggleMasterBot = async (val) => {
    setBotEnabled(val);
    try {
      await qrWhatsappService.updateAutoResponder({ botEnabled: val });
    } catch (err) {
      console.warn('Save bot setting note:', err.message);
    }
  };

  const handleSendMenuToChat = (step) => {
    if (onTriggerMenu) {
      onTriggerMenu(step);
      navigation.goBack();
    } else {
      Alert.alert(
        'Flow Triggered',
        `Interactive Menu "${step.title}" has been sent to the chat conversation.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Interactive Bot Menu</Text>
          <Text style={styles.headerSubtitle}>Automated conversation flow & list menus</Text>
        </View>
        <View style={styles.botStatusBadge}>
          <View style={[styles.statusDot, { backgroundColor: botEnabled ? '#10B981' : '#9CA3AF' }]} />
          <Text style={styles.statusBadgeText}>{botEnabled ? 'ACTIVE' : 'PAUSED'}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        {/* Master Bot Switch Card */}
        <View style={styles.masterCard}>
          <View style={styles.masterIconWrap}>
            <Ionicons name="hardware-chip" size={26} color={COLORS.primaryDark} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.masterTitle}>MessBee Smart Bot Engine</Text>
            <Text style={styles.masterDesc}>
              Automatically replies to common customer queries and captures CRM leads.
            </Text>
          </View>
          <Switch
            value={botEnabled}
            onValueChange={handleToggleMasterBot}
            trackColor={{ false: '#D1D5DB', true: COLORS.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* Section title */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>CONFIGURED BOT STEPS & MENUS</Text>
          <Text style={styles.sectionCount}>{flowSteps.length} Steps</Text>
        </View>

        {/* Loading Spinner */}
        {loading && (
          <View style={{ paddingVertical: 32, alignItems: 'center' }}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={{ marginTop: 8, fontSize: 13, color: '#6B7280' }}>Loading bot workflows...</Text>
          </View>
        )}

        {/* Empty State */}
        {!loading && flowSteps.length === 0 && (
          <View style={styles.stepCard}>
            <View style={{ alignItems: 'center', paddingVertical: 20 }}>
              <Ionicons name="git-network-outline" size={38} color="#9CA3AF" />
              <Text style={[styles.stepTitle, { textAlign: 'center', marginTop: 10 }]}>No Bot Flows Configured</Text>
              <Text style={[styles.stepDesc, { textAlign: 'center', marginTop: 4, paddingHorizontal: 12 }]}>
                Automated conversation funnels and interactive list menus will appear here once configured.
              </Text>
            </View>
          </View>
        )}

        {/* Flow Steps List */}
        {!loading && flowSteps.map((step) => {
          return (
            <View key={step.id} style={[styles.stepCard, !step.active && styles.stepCardDisabled]}>
              {/* Step Header */}
              <View style={styles.stepHeader}>
                <View style={styles.badgeWrap}>
                  <Text style={styles.stepBadgeText}>{step.badge}</Text>
                </View>
                <Switch
                  value={step.active}
                  onValueChange={() => toggleStep(step.id)}
                  trackColor={{ false: '#D1D5DB', true: COLORS.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {/* Title & Desc */}
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepDesc}>{step.description}</Text>

              {/* Options Pills */}
              <View style={styles.optionsWrap}>
                {step.options.map((opt, oIdx) => (
                  <View key={oIdx} style={styles.optionPill}>
                    <Ionicons name="checkmark-circle-outline" size={13} color={COLORS.primaryDark} />
                    <Text style={styles.optionPillText}>{opt}</Text>
                  </View>
                ))}
              </View>

              {/* Action trigger button */}
              <TouchableOpacity
                style={styles.triggerBtn}
                onPress={() => handleSendMenuToChat(step)}
                activeOpacity={0.8}
              >
                <Ionicons name="play-circle-outline" size={18} color="#FFFFFF" />
                <Text style={styles.triggerBtnText}>Send this Menu to Customer</Text>
              </TouchableOpacity>
            </View>
          );
        })}

        {/* Quick FAQ responses */}
        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>QUICK REPLY KEYWORD SHORTCUTS</Text>
          <View style={styles.faqCard}>
            {quickReplies.length > 0 ? (
              quickReplies.slice(0, 6).map((qr, idx) => (
                <View key={qr._id || idx} style={styles.faqRow}>
                  <Text style={styles.commandText}>/{qr.shortcut || qr.title || `reply${idx + 1}`}</Text>
                  <Text style={styles.commandDesc} numberOfLines={1}>
                    {qr.message || qr.body || qr.title || 'Quick response text'}
                  </Text>
                </View>
              ))
            ) : (
              <View style={{ paddingVertical: 8 }}>
                <Text style={[styles.commandDesc, { textAlign: 'center' }]}>
                  No quick reply shortcuts set. Manage quick replies from Settings.
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
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
    paddingTop: 12,
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
  botStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  content: {
    padding: 16,
    paddingBottom: 36,
  },
  masterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  masterIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  masterTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  masterDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    lineHeight: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.6,
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  stepCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  stepCardDisabled: {
    opacity: 0.6,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeWrap: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  stepBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 12,
  },
  optionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  optionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  optionPillText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  triggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.primaryDark,
    paddingVertical: 10,
    borderRadius: 10,
  },
  triggerBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  faqSection: {
    marginTop: 10,
  },
  faqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  faqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  commandText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '700',
    fontSize: 13,
    color: COLORS.primaryDeep,
    width: 90,
  },
  commandDesc: {
    fontSize: 12,
    color: '#4B5563',
    flex: 1,
  },
});

