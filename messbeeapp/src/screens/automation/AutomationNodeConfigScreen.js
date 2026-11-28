import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { validateForm, isValidUrl } from '../../utils/validation';

const HOW_IT_WORKS_COPY = {
  triggerNode: {
    title: 'About Trigger',
    desc: 'Triggers listen for incoming WhatsApp events (such as a QR code scan or keyword message) and automatically launch this flow.',
    steps: [
      'Choose the trigger type (QR Code or Keyword).',
      'Enter the QR identifier or comma-separated keywords.',
      'Ensure Trigger Status is enabled before publishing.',
    ],
    tip: 'Use short, clear keywords like "pricing", "support", or "hi" for reliable matching.',
  },
  messageNode: {
    title: 'About Message Node',
    desc: 'Sends an automated WhatsApp message to the customer. You can personalize text with dynamic variables or attach media.',
    steps: [
      'Write your message text in the editor.',
      'Tap variable chips like {{name}} to personalize.',
      'Check the live WhatsApp preview before saving.',
    ],
    tip: 'Keep messages concise and friendly so customers reply quickly.',
  },
  default: {
    title: 'About This Step',
    desc: 'Configure the parameters for this automation step. Changes are saved to your flow immediately when you tap Save configuration.',
    steps: [
      'Fill in all required fields for this step.',
      'Verify variable syntax and URLs if applicable.',
      'Tap Save configuration to return to the Flow Builder.',
    ],
    tip: 'Test your complete flow in the Automation Simulator before publishing.',
  },
};

export default function AutomationNodeConfigScreen({ navigation, route }) {
  const { node, onSaveNode } = route.params || {};
  const [activeTab, setActiveTab] = useState('CONFIG'); // 'CONFIG' | 'HOW'
  const [label, setLabel] = useState(node?.data?.label || 'Flow Step');
  const [data, setData] = useState({ ...(node?.data || {}) });

  const isTrigger = node?.type === 'triggerNode' || node?.type === 'eventTriggerNode';
  const isMedia = node?.type === 'messageNode' && data.messageType === 'media';
  const isMessage = node?.type === 'messageNode' || node?.type === 'interactiveNode';
  const isCondition = node?.type === 'conditionNode';
  const isDelay = node?.type === 'delayNode';
  const isAction = node?.type === 'actionNode';
  const isApi = node?.type === 'apiNode';

  const updateField = (key, val) => setData((prev) => ({ ...prev, [key]: val }));

  const appendVariable = (token) => {
    const current = String(data.text || '');
    updateField('text', `${current}${current && !current.endsWith(' ') ? ' ' : ''}${token}`);
  };

  const handleSave = () => {
    const { isValid, firstError } = validateForm({
      label: { value: label, required: true, minLength: 2, label: 'Step Title' },
    });
    if (!isValid) {
      Alert.alert('Validation Error', firstError);
      return;
    }

    if (isTrigger) {
      if (data.triggerType === 'webhook' && !String(data.eventName || '').trim()) {
        Alert.alert('Validation Error', 'Please enter a Webhook Event Name.');
        return;
      }
      if (data.triggerType !== 'webhook' && !String(data.keyword || data.qrName || '').trim()) {
        Alert.alert('Validation Error', 'Please enter a keyword or QR identifier.');
        return;
      }
    }

    if (isMessage && !String(data.text || '').trim()) {
      Alert.alert('Validation Error', 'Please enter message text.');
      return;
    }

    if (isMedia && String(data.mediaUrl || '').trim() && !isValidUrl(data.mediaUrl.trim())) {
      Alert.alert('Invalid URL', 'Media URL must start with http:// or https://');
      return;
    }

    if (isApi && !isValidUrl(String(data.endpoint || '').trim())) {
      Alert.alert('Invalid Endpoint', 'Please enter a valid http(s):// webhook URL.');
      return;
    }

    if (isAction && (data.actionType === 'add_tag' || data.actionType === 'remove_tag') && !String(data.tagValue || '').trim()) {
      Alert.alert('Validation Error', 'Please enter a tag name.');
      return;
    }

    const updatedNode = {
      ...node,
      data: {
        ...data,
        label: label.trim(),
      },
    };
    if (typeof onSaveNode === 'function') {
      onSaveNode(updatedNode);
    }
    navigation.goBack();
  };

  const howCopy = HOW_IT_WORKS_COPY[node?.type] || HOW_IT_WORKS_COPY.default;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle} numberOfLines={1}>{label || 'Configure Step'}</Text>
          <Text style={styles.headerSub}>{node?.type || 'Node'}</Text>
        </View>
      </View>

      {/* 2-Tab Switcher */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'CONFIG' && styles.tabBtnActive]}
          onPress={() => setActiveTab('CONFIG')}
        >
          <Text style={[styles.tabText, activeTab === 'CONFIG' && styles.tabTextActive]}>
            Configuration
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'HOW' && styles.tabBtnActive]}
          onPress={() => setActiveTab('HOW')}
        >
          <Text style={[styles.tabText, activeTab === 'HOW' && styles.tabTextActive]}>
            How Does It Work
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        {activeTab === 'HOW' ? (
          <View style={styles.howCard}>
            <View style={styles.howIconBox}>
              <Ionicons name="information-circle-outline" size={24} color="#00B67A" />
            </View>
            <Text style={styles.howTitle}>{howCopy.title}</Text>
            <Text style={styles.howDesc}>{howCopy.desc}</Text>
            <Text style={styles.howSubHeader}>How to configure</Text>
            {howCopy.steps.map((s, idx) => (
              <View key={idx} style={styles.howStepRow}>
                <View style={styles.howBullet}>
                  <Text style={styles.howBulletText}>{idx + 1}</Text>
                </View>
                <Text style={styles.howStepText}>{s}</Text>
              </View>
            ))}
            <View style={styles.tipBox}>
              <Ionicons name="sparkles" size={16} color="#7C3AED" />
              <View style={{ flex: 1 }}>
                <Text style={styles.tipTitle}>Best practice</Text>
                <Text style={styles.tipText}>{howCopy.tip}</Text>
              </View>
            </View>
          </View>
        ) : (
          <View>
            {/* Common Step Title */}
            <Text style={styles.fieldLabel}>Step Title *</Text>
            <TextInput
              style={styles.input}
              value={label}
              onChangeText={setLabel}
              placeholder="Enter step title"
              placeholderTextColor="#94A3B8"
            />

            {/* Trigger Configuration */}
            {isTrigger && (
              <View>
                <Text style={styles.fieldLabel}>Trigger Type</Text>
                <View style={styles.chipRow}>
                  {[
                    { id: 'qr_code', label: 'QR Code' },
                    { id: 'keyword', label: 'Keyword' },
                    { id: 'webhook', label: 'Webhook' },
                  ].map((opt) => (
                    <TouchableOpacity
                      key={opt.id}
                      style={[styles.choiceChip, data.triggerType === opt.id && styles.choiceChipActive]}
                      onPress={() => updateField('triggerType', opt.id)}
                    >
                      <Text style={[styles.choiceChipText, data.triggerType === opt.id && styles.choiceChipTextActive]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {data.triggerType === 'qr_code' && (
                  <>
                    <Text style={styles.fieldLabel}>QR Code Name</Text>
                    <TextInput
                      style={styles.input}
                      value={data.qrName || ''}
                      onChangeText={(v) => updateField('qrName', v)}
                      placeholder="e.g. Reception Desk QR"
                      placeholderTextColor="#94A3B8"
                    />
                  </>
                )}

                <Text style={styles.fieldLabel}>
                  {data.triggerType === 'webhook' ? 'Event Name *' : 'Trigger Keyword / Code *'}
                </Text>
                <TextInput
                  style={styles.input}
                  value={data.triggerType === 'webhook' ? (data.eventName || '') : (data.keyword || '')}
                  onChangeText={(v) =>
                    updateField(data.triggerType === 'webhook' ? 'eventName' : 'keyword', v)
                  }
                  placeholder={data.triggerType === 'webhook' ? 'lead_created' : 'hi, hello, reception_qr'}
                  placeholderTextColor="#94A3B8"
                />

                <Text style={styles.fieldLabel}>Destination</Text>
                <View style={styles.chipRow}>
                  {['Support Desk', 'Sales Team', 'General Inbox', 'Bot Menu'].map((dest) => (
                    <TouchableOpacity
                      key={dest}
                      style={[styles.choiceChip, data.destination === dest && styles.choiceChipActive]}
                      onPress={() => updateField('destination', dest)}
                    >
                      <Text style={[styles.choiceChipText, data.destination === dest && styles.choiceChipTextActive]}>
                        {dest}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.switchRow}>
                  <View>
                    <Text style={styles.switchTitle}>Trigger Status</Text>
                    <Text style={styles.switchSub}>Allow this trigger to start the flow</Text>
                  </View>
                  <Switch
                    value={data.enabled !== false}
                    onValueChange={(v) => updateField('enabled', v)}
                    trackColor={{ false: '#CBD5E1', true: '#A7F3D0' }}
                    thumbColor={data.enabled !== false ? '#00B67A' : '#94A3B8'}
                  />
                </View>

                {data.triggerType === 'qr_code' && (
                  <View style={styles.qrPreviewCard}>
                    <View style={styles.qrBox}>
                      <Ionicons name="qr-code" size={44} color="#0F172A" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.qrPreviewTitle}>QR preview</Text>
                      <Text style={styles.qrPreviewSub}>
                        {data.qrName || 'Reception Desk QR'} • {data.keyword || 'reception_qr'}
                      </Text>
                      <View style={styles.qrActionsRow}>
                        <TouchableOpacity
                          style={styles.qrSmallBtn}
                          onPress={() => Alert.alert('QR Link', `https://wa.me/?text=${encodeURIComponent(data.keyword || 'reception_qr')}`)}
                        >
                          <Ionicons name="copy-outline" size={12} color="#00875A" />
                          <Text style={styles.qrSmallBtnText}>Copy link</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Message & Media Configuration */}
            {isMessage && (
              <View>
                {isMedia && (
                  <>
                    <Text style={styles.fieldLabel}>Media Type</Text>
                    <View style={styles.chipRow}>
                      {['image', 'video', 'document'].map((mt) => (
                        <TouchableOpacity
                          key={mt}
                          style={[styles.choiceChip, data.headerType === mt && styles.choiceChipActive]}
                          onPress={() => updateField('headerType', mt)}
                        >
                          <Text style={[styles.choiceChipText, data.headerType === mt && styles.choiceChipTextActive]}>
                            {mt.toUpperCase()}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <Text style={styles.fieldLabel}>Media Public URL</Text>
                    <TextInput
                      style={styles.input}
                      value={data.mediaUrl || ''}
                      onChangeText={(v) => updateField('mediaUrl', v)}
                      placeholder="https://example.com/brochure.pdf"
                      placeholderTextColor="#94A3B8"
                      autoCapitalize="none"
                    />
                  </>
                )}

                <View style={styles.labelWithCount}>
                  <Text style={styles.fieldLabel}>Message Text *</Text>
                  <Text style={styles.charCount}>{(data.text || '').length}/1024</Text>
                </View>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={data.text || ''}
                  onChangeText={(v) => updateField('text', v)}
                  placeholder="Write your WhatsApp message..."
                  placeholderTextColor="#94A3B8"
                  maxLength={1024}
                  multiline
                  textAlignVertical="top"
                />

                {/* Interactive Buttons Editor */}
                {data.messageType === 'interactive' && (
                  <View style={styles.buttonsEditor}>
                    <Text style={styles.fieldLabel}>Quick Reply Buttons (max 3)</Text>
                    {(Array.isArray(data.buttons) ? data.buttons : []).map((btn, bIdx) => (
                      <View key={btn.id || bIdx} style={styles.btnEditRow}>
                        <TextInput
                          style={[styles.input, { flex: 1 }]}
                          value={btn.title}
                          onChangeText={(val) => {
                            const nextBtns = [...(data.buttons || [])];
                            nextBtns[bIdx] = { ...nextBtns[bIdx], title: val };
                            updateField('buttons', nextBtns);
                          }}
                          placeholder={`Button ${bIdx + 1}`}
                          placeholderTextColor="#94A3B8"
                          maxLength={20}
                        />
                        <TouchableOpacity
                          onPress={() => {
                            const nextBtns = (data.buttons || []).filter((_, i) => i !== bIdx);
                            updateField('buttons', nextBtns);
                          }}
                          style={{ padding: 8 }}
                        >
                          <Ionicons name="trash-outline" size={18} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    ))}
                    {(data.buttons || []).length < 3 && (
                      <TouchableOpacity
                        style={styles.addBtnChip}
                        onPress={() => {
                          const nextBtns = [
                            ...(data.buttons || []),
                            { id: `btn_${Date.now()}`, title: `Option ${(data.buttons || []).length + 1}` },
                          ];
                          updateField('buttons', nextBtns);
                        }}
                      >
                        <Ionicons name="add" size={15} color="#00875A" />
                        <Text style={styles.addBtnChipText}>Add button</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {/* Variable Chips */}
                <View style={styles.varRow}>
                  {[
                    { label: '+ First Name', token: '{{name}}' },
                    { label: '+ Time', token: '{{time}}' },
                    { label: '+ Date', token: '{{date}}' },
                    { label: '+ Custom', token: '{{custom}}' },
                  ].map((v) => (
                    <TouchableOpacity
                      key={v.token}
                      style={styles.varChip}
                      onPress={() => appendVariable(v.token)}
                    >
                      <Text style={styles.varChipText}>{v.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* WhatsApp Preview */}
                <Text style={styles.fieldLabel}>WhatsApp preview</Text>
                <View style={styles.waPreviewBox}>
                  <View style={styles.waPreviewHeader}>
                    <Ionicons name="logo-whatsapp" size={14} color="#00875A" />
                    <Text style={styles.waPreviewHeaderTitle}>{label || 'WhatsApp preview'}</Text>
                  </View>
                  {isMedia && data.mediaUrl ? (
                    <View style={styles.waMediaTag}>
                      <Ionicons name="attach" size={14} color="#00875A" />
                      <Text style={styles.waMediaText} numberOfLines={1}>{data.mediaUrl}</Text>
                    </View>
                  ) : null}
                  <View style={styles.waBubble}>
                    <Text style={styles.waBubbleText}>
                      {data.text || 'Your message preview will appear here...'}
                    </Text>
                    <Text style={styles.waTime}>10:42 AM ✓✓</Text>
                  </View>
                  {data.messageType === 'interactive' && Array.isArray(data.buttons) && data.buttons.length > 0 && (
                    <View style={styles.waBtnList}>
                      {data.buttons.map((b, i) => (
                        <View key={b.id || i} style={styles.waReplyBtn}>
                          <Ionicons name="arrow-undo-outline" size={12} color="#0284C7" />
                          <Text style={styles.waReplyBtnText}>{b.title || `Option ${i + 1}`}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.testStepBtn}
                  onPress={() =>
                    Alert.alert(
                      isMedia ? 'Media Preview Ready' : 'Message Preview Ready',
                      data.text || 'Configure message text first.'
                    )
                  }
                >
                  <Ionicons name="paper-plane-outline" size={15} color="#00875A" />
                  <Text style={styles.testStepBtnText}>
                    {isMedia ? 'Test media' : 'Test message'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Condition Configuration */}
            {isCondition && (
              <View>
                <Text style={styles.fieldLabel}>Variable</Text>
                <TextInput
                  style={styles.input}
                  value={data.variable || 'message'}
                  onChangeText={(v) => updateField('variable', v)}
                />
                <Text style={styles.fieldLabel}>Operator</Text>
                <View style={styles.chipRow}>
                  {['contains', 'equals', 'greater_than'].map((op) => (
                    <TouchableOpacity
                      key={op}
                      style={[styles.choiceChip, data.operator === op && styles.choiceChipActive]}
                      onPress={() => updateField('operator', op)}
                    >
                      <Text style={[styles.choiceChipText, data.operator === op && styles.choiceChipTextActive]}>
                        {op}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.fieldLabel}>Match Value *</Text>
                <TextInput
                  style={styles.input}
                  value={data.value || ''}
                  onChangeText={(v) => updateField('value', v)}
                  placeholder="pricing"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            )}

            {/* Delay Configuration */}
            {isDelay && (
              <View>
                <Text style={styles.fieldLabel}>Delay Duration</Text>
                <View style={styles.chipRow}>
                  {[
                    { label: '5 sec', ms: 5000 },
                    { label: '15 sec', ms: 15000 },
                    { label: '1 min', ms: 60000 },
                    { label: '5 min', ms: 300000 },
                  ].map((d) => (
                    <TouchableOpacity
                      key={d.label}
                      style={[styles.choiceChip, data.delayTimeMs === d.ms && styles.choiceChipActive]}
                      onPress={() => {
                        updateField('delayTimeMs', d.ms);
                        updateField('delayDisplay', d.label);
                      }}
                    >
                      <Text style={[styles.choiceChipText, data.delayTimeMs === d.ms && styles.choiceChipTextActive]}>
                        {d.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Action Configuration */}
            {isAction && (
              <View>
                {(data.actionType === 'add_tag' || data.actionType === 'remove_tag') && (
                  <>
                    <Text style={styles.fieldLabel}>Tag Name *</Text>
                    <TextInput
                      style={styles.input}
                      value={data.tagValue || ''}
                      onChangeText={(v) => updateField('tagValue', v)}
                      placeholder="e.g. VIP Lead"
                      placeholderTextColor="#94A3B8"
                    />
                  </>
                )}
                {data.actionType === 'human_handoff' && (
                  <>
                    <Text style={styles.fieldLabel}>Assign Department / Team</Text>
                    <TextInput
                      style={styles.input}
                      value={data.department || ''}
                      onChangeText={(v) => updateField('department', v)}
                      placeholder="Support Desk"
                      placeholderTextColor="#94A3B8"
                    />
                  </>
                )}
              </View>
            )}

            {/* API / Webhook Configuration */}
            {isApi && (
              <View>
                <Text style={styles.fieldLabel}>HTTP Method</Text>
                <View style={styles.chipRow}>
                  {['GET', 'POST', 'PUT'].map((m) => (
                    <TouchableOpacity
                      key={m}
                      style={[styles.choiceChip, data.method === m && styles.choiceChipActive]}
                      onPress={() => updateField('method', m)}
                    >
                      <Text style={[styles.choiceChipText, data.method === m && styles.choiceChipTextActive]}>
                        {m}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.fieldLabel}>Endpoint URL *</Text>
                <TextInput
                  style={styles.input}
                  value={data.endpoint || ''}
                  onChangeText={(v) => updateField('endpoint', v)}
                  placeholder="https://api.example.com/webhook"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="none"
                />
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Sticky Save Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
          <Text style={styles.saveBtnText}>Save configuration</Text>
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
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  tabBtnActive: { backgroundColor: '#EDF9F2', borderWidth: 1, borderColor: '#00B67A' },
  tabText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  tabTextActive: { color: '#00875A', fontWeight: '700' },
  body: { padding: 16, paddingBottom: 100 },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: '#334155', marginBottom: 6, marginTop: 10 },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  textArea: { minHeight: 110, paddingTop: 10 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  choiceChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  choiceChipActive: { backgroundColor: '#EDF9F2', borderColor: '#00B67A' },
  choiceChipText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  choiceChipTextActive: { color: '#00875A', fontWeight: '700' },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
  },
  switchTitle: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  switchSub: { fontSize: 11, color: '#64748B', marginTop: 1 },
  qrPreviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
  },
  qrBox: {
    width: 58,
    height: 58,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrPreviewTitle: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  qrPreviewSub: { fontSize: 12, color: '#64748B', marginTop: 2 },
  varRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  varChip: {
    backgroundColor: '#EDF9F2',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  varChipText: { fontSize: 11, fontWeight: '700', color: '#00875A' },
  waPreviewBox: {
    backgroundColor: '#E7F5EC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  waMediaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    padding: 6,
    borderRadius: 8,
    marginBottom: 8,
  },
  waMediaText: { fontSize: 11, color: '#00875A', flex: 1 },
  waBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignSelf: 'flex-start',
    maxWidth: '90%',
  },
  waBubbleText: { fontSize: 13, color: '#0F172A', lineHeight: 19 },
  waTime: { fontSize: 10, color: '#94A3B8', textAlign: 'right', marginTop: 4 },
  howCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 18,
  },
  howIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EDF9F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  howTitle: { fontSize: 17, fontWeight: '800', color: '#0F172A' },
  howDesc: { fontSize: 13, color: '#475569', lineHeight: 19, marginTop: 6 },
  howSubHeader: { fontSize: 13, fontWeight: '700', color: '#0F172A', marginTop: 16, marginBottom: 8 },
  howStepRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  howBullet: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#EDF9F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  howBulletText: { fontSize: 11, fontWeight: '800', color: '#00875A' },
  howStepText: { fontSize: 13, color: '#334155', flex: 1 },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
  },
  tipTitle: { fontSize: 12, fontWeight: '800', color: '#5B21B6', marginBottom: 2 },
  tipText: { fontSize: 12, color: '#6D28D9', lineHeight: 17 },
  qrActionsRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
  qrSmallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EDF9F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  qrSmallBtnText: { fontSize: 11, fontWeight: '700', color: '#00875A' },
  waPreviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  waPreviewHeaderTitle: { fontSize: 12, fontWeight: '700', color: '#00875A' },
  testStepBtn: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#00B67A',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  testStepBtnText: { fontSize: 13, fontWeight: '700', color: '#00875A' },
  labelWithCount: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  charCount: { fontSize: 11, color: '#94A3B8', marginTop: 10 },
  buttonsEditor: { marginTop: 8 },
  btnEditRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  addBtnChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#00B67A',
    backgroundColor: '#EDF9F2',
  },
  addBtnChipText: { fontSize: 12, fontWeight: '700', color: '#00875A' },
  waBtnList: { marginTop: 6, gap: 4, maxWidth: '90%' },
  waReplyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 8,
  },
  waReplyBtnText: { fontSize: 12, fontWeight: '700', color: '#0284C7' },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
    paddingBottom: Platform.OS === 'ios' ? 26 : 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  saveBtn: {
    backgroundColor: '#00B67A',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
});
