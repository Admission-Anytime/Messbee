import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { contactService, automationService } from '../../services/api';
import { getNodeSummary } from './automationHelpers';

export default function AutomationSimulatorScreen({ navigation, route }) {
  const { flow } = route.params || {};
  const nodes = Array.isArray(flow?.nodes) ? flow.nodes : [];

  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [testMessage, setTestMessage] = useState('Hi, I scanned the reception QR code');
  const [simState, setSimState] = useState('READY'); // 'READY' | 'RUNNING' | 'COMPLETE'
  const [completedStepIdx, setCompletedStepIdx] = useState(-1);
  const [stepTimestamps, setStepTimestamps] = useState({});
  const [chatBubbles, setChatBubbles] = useState([]);
  const timerRef = useRef(null);

  useEffect(() => {
    contactService
      .getContacts({ limit: 20 })
      .then((list) => {
        const arr = Array.isArray(list) ? list : [];
        setContacts(arr);
        if (arr.length > 0) setSelectedContact(arr[0]);
      })
      .catch(() => setContacts([]));

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleReset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSimState('READY');
    setCompletedStepIdx(-1);
    setStepTimestamps({});
    setChatBubbles([]);
  };

  const handleRunSimulation = async () => {
    if (!testMessage.trim()) {
      Alert.alert('Message Required', 'Please enter a test incoming message.');
      return;
    }
    if (nodes.length === 0) {
      Alert.alert('Empty Flow', 'Add at least one node to simulate.');
      return;
    }

    handleReset();
    setSimState('RUNNING');
    const contactName = selectedContact?.name || 'Customer';

    setChatBubbles([
      {
        id: 'in_1',
        from: 'user',
        text: testMessage.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    if (flow?._id) {
      automationService
        .simulateStart(flow._id, {
          channelId: flow.channelId,
          simulatorPhone: selectedContact?.phone || 'SIMULATOR_USER',
        })
        .catch(() => {});
    }

    let idx = 0;
    timerRef.current = setInterval(() => {
      if (idx >= nodes.length) {
        clearInterval(timerRef.current);
        setSimState('COMPLETE');
        return;
      }

      const currentNode = nodes[idx];
      const nowStr = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      setCompletedStepIdx(idx);
      setStepTimestamps((prev) => ({ ...prev, [currentNode.id]: nowStr }));

      if (currentNode.type === 'messageNode' || currentNode.type === 'interactiveNode') {
        const rawText = String(currentNode.data?.text || '');
        const personalized = rawText.replace(/\{\{\s*name\s*\}\}/gi, contactName);
        if (personalized) {
          setChatBubbles((prev) => [
            ...prev,
            {
              id: `bot_${currentNode.id}`,
              from: 'bot',
              text: personalized,
              time: nowStr,
            },
          ]);
        }
      }

      idx += 1;
      if (idx >= nodes.length) {
        clearInterval(timerRef.current);
        setSimState('COMPLETE');
      }
    }, 650);
  };

  const triggerNode = nodes.find((n) => n.type === 'triggerNode' || n.type === 'eventTriggerNode');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Automation Simulator</Text>
          <Text style={styles.headerSub}>Test without messaging real customers</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Status Banner */}
        <View style={styles.statusBanner}>
          <View style={styles.statusLeft}>
            <View
              style={[
                styles.statusDot,
                simState === 'COMPLETE'
                  ? { backgroundColor: '#00B67A' }
                  : simState === 'RUNNING'
                  ? { backgroundColor: '#3B82F6' }
                  : { backgroundColor: '#94A3B8' },
              ]}
            />
            <View>
              <Text style={styles.statusTitle}>
                {simState === 'READY'
                  ? 'Ready to simulate'
                  : simState === 'RUNNING'
                  ? 'Simulation running'
                  : 'Simulation complete'}
              </Text>
              <Text style={styles.statusSub}>{flow?.name || 'Automation Flow'}</Text>
            </View>
          </View>
          <View
            style={[
              styles.statusBadge,
              simState === 'COMPLETE' && { backgroundColor: '#DCFCE7' },
              simState === 'RUNNING' && { backgroundColor: '#EFF6FF' },
            ]}
          >
            <Text
              style={[
                styles.statusBadgeText,
                simState === 'COMPLETE' && { color: '#16A34A' },
                simState === 'RUNNING' && { color: '#2563EB' },
              ]}
            >
              {simState === 'READY' ? 'Idle' : simState === 'RUNNING' ? 'Simulating...' : 'Complete'}
            </Text>
          </View>
        </View>

        {/* Test Input Card */}
        <Text style={styles.sectionTitle}>Test Input</Text>
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>Test contact</Text>
          <TouchableOpacity
            style={styles.dropdownField}
            onPress={() => setShowContactPicker((v) => !v)}
            activeOpacity={0.8}
          >
            <Text style={styles.dropdownText} numberOfLines={1}>
              {selectedContact
                ? `${selectedContact.name || 'Contact'} • ${selectedContact.phone || selectedContact.whatsapp || ''}`
                : 'Default Test Contact'}
            </Text>
            <Ionicons name={showContactPicker ? 'chevron-up' : 'chevron-down'} size={16} color="#64748B" />
          </TouchableOpacity>
          {showContactPicker && contacts.length > 0 && (
            <View style={styles.dropdownList}>
              {contacts.slice(0, 6).map((c) => {
                const chosen = selectedContact?._id === c._id;
                return (
                  <TouchableOpacity
                    key={c._id}
                    style={[styles.dropdownItem, chosen && styles.dropdownItemActive]}
                    onPress={() => {
                      setSelectedContact(c);
                      setShowContactPicker(false);
                    }}
                  >
                    <Text style={[styles.dropdownItemText, chosen && { color: '#00875A', fontWeight: '700' }]}>
                      {c.name || c.phone} ({c.phone || c.whatsapp || 'N/A'})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <Text style={styles.fieldLabel}>Trigger event</Text>
          <View style={styles.readonlyField}>
            <Text style={styles.readonlyText}>
              {triggerNode?.data?.label || 'Trigger'} ({triggerNode?.data?.keyword || 'any'})
            </Text>
          </View>

          <Text style={[styles.fieldLabel, { marginTop: 10 }]}>Test message</Text>
          <TextInput
            style={styles.input}
            value={testMessage}
            onChangeText={setTestMessage}
            placeholder="Enter incoming test message..."
            placeholderTextColor="#94A3B8"
          />
        </View>

        {/* Live Execution Checklist */}
        <Text style={[styles.sectionTitle, { marginTop: 18 }]}>Live execution</Text>
        <View style={styles.card}>
          {nodes.map((n, idx) => {
            const done = idx <= completedStepIdx;
            const running = simState === 'RUNNING' && idx === completedStepIdx + 1;
            return (
              <View key={n.id} style={[styles.execRow, idx < nodes.length - 1 && styles.execBorder]}>
                <Ionicons
                  name={done ? 'checkmark-circle' : running ? 'ellipse' : 'ellipse-outline'}
                  size={20}
                  color={done ? '#00B67A' : running ? '#3B82F6' : '#CBD5E1'}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.execTitle}>{n.data?.label || 'Step'}</Text>
                  <Text style={styles.execSub} numberOfLines={1}>
                    {stepTimestamps[n.id]
                      ? `Executed at ${stepTimestamps[n.id]}`
                      : simState === 'READY'
                      ? 'Waiting to execute...'
                      : getNodeSummary(n)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* WhatsApp Output */}
        <Text style={[styles.sectionTitle, { marginTop: 18 }]}>WhatsApp output</Text>
        <View style={styles.waOutputBox}>
          {chatBubbles.length === 0 ? (
            <Text style={styles.waEmpty}>Tap Run simulation to preview WhatsApp messages.</Text>
          ) : (
            chatBubbles.map((b) => (
              <View
                key={b.id}
                style={[styles.bubble, b.from === 'user' ? styles.userBubble : styles.botBubble]}
              >
                <Text style={styles.bubbleText}>{b.text}</Text>
                <Text style={styles.bubbleTime}>{b.time}</Text>
              </View>
            ))
          )}
        </View>
        {/* Completion Toast Banner */}
        {simState === 'COMPLETE' && (
          <View style={styles.completeToast}>
            <Ionicons name="checkmark-circle" size={16} color="#00B67A" />
            <Text style={styles.completeToastText}>Simulation completed successfully!</Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
          <Text style={styles.resetBtnText}>Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.runBtn, simState === 'RUNNING' && { opacity: 0.7 }]}
          onPress={handleRunSimulation}
          disabled={simState === 'RUNNING'}
        >
          <Ionicons name="play" size={16} color="#FFFFFF" />
          <Text style={styles.runBtnText}>
            {simState === 'RUNNING' ? 'Simulating...' : 'Run simulation'}
          </Text>
        </TouchableOpacity>
      </View>
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
  statusBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
  },
  statusLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  statusSub: { fontSize: 11, color: '#64748B', marginTop: 1 },
  statusBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: { fontSize: 11, fontWeight: '700', color: '#475569' },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 8 },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 14,
  },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: '#475569', marginBottom: 6 },
  contactChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  contactChipActive: { backgroundColor: '#EDF9F2', borderWidth: 1, borderColor: '#00B67A' },
  contactChipText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  contactChipTextActive: { color: '#00875A', fontWeight: '700' },
  dropdownField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  dropdownText: { fontSize: 13, fontWeight: '600', color: '#0F172A', flex: 1 },
  dropdownList: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    marginBottom: 10,
    overflow: 'hidden',
  },
  dropdownItem: { paddingHorizontal: 12, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  dropdownItemActive: { backgroundColor: '#EDF9F2' },
  dropdownItemText: { fontSize: 12, color: '#334155' },
  completeToast: {
    marginTop: 14,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  completeToastText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  readonlyField: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 10,
  },
  readonlyText: { fontSize: 13, color: '#334155', fontWeight: '600' },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
  },
  execRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  execBorder: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  execTitle: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  execSub: { fontSize: 11, color: '#64748B', marginTop: 1 },
  waOutputBox: {
    backgroundColor: '#E7F5EC',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 14,
    padding: 14,
    minHeight: 90,
    gap: 8,
  },
  waEmpty: { fontSize: 12, color: '#64748B', textAlign: 'center', marginTop: 18 },
  bubble: { borderRadius: 12, padding: 10, maxWidth: '85%' },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#DCFCE7' },
  botBubble: { alignSelf: 'flex-start', backgroundColor: '#FFFFFF' },
  bubbleText: { fontSize: 13, color: '#0F172A', lineHeight: 18 },
  bubbleTime: { fontSize: 10, color: '#94A3B8', textAlign: 'right', marginTop: 3 },
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
  resetBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  resetBtnText: { fontSize: 14, fontWeight: '700', color: '#334155' },
  runBtn: {
    flex: 1.5,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#00B67A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  runBtnText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
});
