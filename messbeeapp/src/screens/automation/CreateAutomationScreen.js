import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { validateForm } from '../../utils/validation';
import {
  AUTOMATION_TYPES,
  PREBUILT_TEMPLATES,
  buildSequentialEdges,
} from './automationHelpers';

export default function CreateAutomationScreen({ navigation }) {
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [customName, setCustomName] = useState('');

  const handleOpenType = (typeObj) => {
    setSelectedType(typeObj);
    setCustomName(typeObj?.defaultFlowName || 'New Automation Flow');
    setShowNameModal(true);
  };

  const handleConfirmCreate = () => {
    const { isValid, firstError } = validateForm({
      flowName: { value: customName, required: true, minLength: 2, label: 'Flow Name' },
    });
    if (!isValid) {
      Alert.alert('Validation Error', firstError);
      return;
    }

    const triggerNode = selectedType
      ? JSON.parse(JSON.stringify(selectedType.defaultTrigger))
      : JSON.parse(JSON.stringify(AUTOMATION_TYPES[0].defaultTrigger));

    const defaultMsgNode = {
      id: 'node_msg_1',
      type: 'messageNode',
      position: { x: 100, y: 200 },
      data: {
        label: 'Welcome message',
        messageType: 'text',
        text: 'Hi {{name}}, thanks for reaching out! How can we help you today?',
      },
    };

    const nodes = [triggerNode, defaultMsgNode];
    const flow = {
      name: customName.trim(),
      isActive: false,
      nodes,
      edges: buildSequentialEdges(nodes),
    };

    setShowNameModal(false);
    navigation.navigate('AutomationFlowBuilder', { flow });
  };

  const handleSelectTemplate = (tpl) => {
    const nodes = JSON.parse(JSON.stringify(tpl.nodes));
    const flow = {
      name: tpl.name,
      isActive: false,
      nodes,
      edges: buildSequentialEdges(nodes),
    };
    setShowTemplatesModal(false);
    navigation.navigate('AutomationFlowBuilder', { flow });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Create Automation</Text>
          <Text style={styles.headerSub}>Choose how to build your flow</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Hero Start From Scratch Card */}
        <TouchableOpacity
          style={styles.heroCard}
          onPress={() => handleOpenType(AUTOMATION_TYPES[0])}
          activeOpacity={0.88}
        >
          <View style={styles.heroIconBox}>
            <Ionicons name="play" size={22} color="#00B67A" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>Start from scratch</Text>
            <Text style={styles.heroSub}>
              Build a custom WhatsApp automation flow with triggers, messages & actions.
            </Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Automation Type Section */}
        <Text style={styles.sectionTitle}>Automation type</Text>
        <View style={styles.typeList}>
          {AUTOMATION_TYPES.map((t) => (
            <TouchableOpacity
              key={t.id}
              style={styles.typeCard}
              onPress={() => handleOpenType(t)}
              activeOpacity={0.8}
            >
              <View style={[styles.typeIconBox, { backgroundColor: t.bg }]}>
                <Ionicons name={t.icon} size={22} color={t.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.typeTitle}>{t.title}</Text>
                <Text style={styles.typeSub}>{t.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Need a head start? */}
        <Text style={[styles.sectionTitle, { marginTop: 22 }]}>Need a head start?</Text>
        <TouchableOpacity
          style={styles.templateBanner}
          onPress={() => setShowTemplatesModal(true)}
          activeOpacity={0.82}
        >
          <View style={styles.templateBannerIcon}>
            <Ionicons name="sparkles-outline" size={20} color="#7C3AED" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.templateBannerTitle}>Browse pre-built templates</Text>
            <Text style={styles.templateBannerSub}>
              {PREBUILT_TEMPLATES.length} ready-to-launch WhatsApp flows
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#7C3AED" />
        </TouchableOpacity>
      </ScrollView>

      {/* Flow Name Modal */}
      <Modal
        visible={showNameModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNameModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.nameModalCard}>
            <Text style={styles.modalTitle}>Name your automation</Text>
            <Text style={styles.modalSub}>
              {selectedType ? selectedType.title : 'Custom Flow'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Reception QR flow"
              placeholderTextColor="#94A3B8"
              value={customName}
              onChangeText={setCustomName}
              autoFocus
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowNameModal(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirmCreate}>
                <Text style={styles.confirmBtnText}>Open Builder</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Pre-built Templates Modal */}
      <Modal
        visible={showTemplatesModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTemplatesModal(false)}
      >
        <View style={styles.sheetOverlay}>
          <View style={styles.sheetCard}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Pre-built Templates</Text>
              <TouchableOpacity onPress={() => setShowTemplatesModal(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
              {PREBUILT_TEMPLATES.map((tpl) => (
                <TouchableOpacity
                  key={tpl.id}
                  style={styles.tplCard}
                  onPress={() => handleSelectTemplate(tpl)}
                >
                  <View style={styles.tplTop}>
                    <Text style={styles.tplName}>{tpl.name}</Text>
                    <View style={styles.tplBadge}>
                      <Text style={styles.tplBadgeText}>{tpl.badge}</Text>
                    </View>
                  </View>
                  <Text style={styles.tplDesc}>{tpl.description}</Text>
                  <Text style={styles.tplMeta}>{tpl.nodes.length} steps included</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
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
    paddingVertical: 14,
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
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  headerSub: { fontSize: 12, color: '#64748B', marginTop: 1 },
  body: { padding: 16, paddingBottom: 40 },
  heroCard: {
    backgroundColor: '#00B67A',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 22,
    shadowColor: '#00B67A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  heroIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  heroSub: { fontSize: 12, color: '#DCFCE7', marginTop: 3, lineHeight: 17 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 10 },
  typeList: { gap: 10 },
  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  typeIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  typeSub: { fontSize: 12, color: '#64748B', marginTop: 2, lineHeight: 16 },
  templateBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  templateBannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  templateBannerTitle: { fontSize: 14, fontWeight: '700', color: '#5B21B6' },
  templateBannerSub: { fontSize: 12, color: '#7C3AED', marginTop: 2 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  nameModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
  },
  modalTitle: { fontSize: 17, fontWeight: '800', color: '#0F172A' },
  modalSub: { fontSize: 12, color: '#64748B', marginTop: 2, marginBottom: 14 },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 16,
  },
  modalBtnRow: { flexDirection: 'row', gap: 10 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  cancelBtnText: { fontSize: 14, fontWeight: '700', color: '#475569' },
  confirmBtn: {
    flex: 1.4,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#00B67A',
    alignItems: 'center',
  },
  confirmBtnText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
    justifyContent: 'flex-end',
  },
  sheetCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 20,
    paddingBottom: 32,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sheetTitle: { fontSize: 17, fontWeight: '800', color: '#0F172A' },
  tplCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  tplTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  tplName: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  tplBadge: { backgroundColor: '#EDF9F2', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  tplBadgeText: { fontSize: 10, fontWeight: '700', color: '#00875A' },
  tplDesc: { fontSize: 12, color: '#64748B', lineHeight: 17 },
  tplMeta: { fontSize: 11, fontWeight: '600', color: '#94A3B8', marginTop: 6 },
});
