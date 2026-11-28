import React, { useState, useEffect, useMemo } from 'react';
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
  ActivityIndicator,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { automationService, whatsappConfigService } from '../../services/api';
import {
  NODE_CATEGORIES,
  buildSequentialEdges,
  getNodeVisualMeta,
  getNodeSummary,
} from './automationHelpers';

export default function AutomationFlowBuilderScreen({ navigation, route }) {
  const initialFlow = route?.params?.flow;
  const automationId = route?.params?.automationId || initialFlow?._id;

  const [flow, setFlow] = useState(
    initialFlow || {
      name: 'Reception QR flow',
      isActive: false,
      nodes: [],
      edges: [],
    }
  );
  const [loading, setLoading] = useState(!!automationId && !initialFlow);
  const [saving, setSaving] = useState(false);
  const [channelId, setChannelId] = useState(initialFlow?.channelId || null);

  // Add Node Bottom Sheet & Rename Modal
  const [showAddNode, setShowAddNode] = useState(false);
  const [nodeSearch, setNodeSearch] = useState('');
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameText, setRenameText] = useState(flow.name || '');

  // History for Undo/Redo
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [zoomPct, setZoomPct] = useState(100);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        const cfg = await whatsappConfigService.getConfig().catch(() => null);
        if (mounted && cfg?._id) {
          setChannelId(cfg._id);
        } else if (mounted && cfg?.channelId) {
          setChannelId(cfg.channelId);
        }

        if (automationId && !initialFlow) {
          const loaded = await automationService.getAutomationById(automationId);
          if (mounted && loaded) {
            setFlow(loaded);
            if (loaded.channelId) setChannelId(loaded.channelId);
          }
        }
      } catch (err) {
        Alert.alert('Load Error', err?.message || 'Failed to load automation flow.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    init();
    return () => {
      mounted = false;
    };
  }, [automationId, initialFlow]);

  const updateFlowNodes = (nextNodes) => {
    setHistory((prev) => [...prev.slice(-9), flow.nodes]);
    setRedoStack([]);
    setFlow((prev) => ({
      ...prev,
      nodes: nextNodes,
      edges: buildSequentialEdges(nextNodes),
    }));
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const prevNodes = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [...prev.slice(-9), flow.nodes]);
    setFlow((prev) => ({
      ...prev,
      nodes: prevNodes,
      edges: buildSequentialEdges(prevNodes),
    }));
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const nextNodes = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    setHistory((prev) => [...prev.slice(-9), flow.nodes]);
    setFlow((prev) => ({
      ...prev,
      nodes: nextNodes,
      edges: buildSequentialEdges(nextNodes),
    }));
  };

  const handleAddNodeItem = (catalogItem) => {
    const newNode = {
      id: `node_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      type: catalogItem.type,
      position: { x: 100, y: 50 + flow.nodes.length * 150 },
      data: JSON.parse(JSON.stringify(catalogItem.defaultData)),
    };
    updateFlowNodes([...flow.nodes, newNode]);
    setShowAddNode(false);
    setNodeSearch('');
  };

  const handleDeleteNode = (nodeId) => {
    if (flow.nodes.length <= 1) {
      Alert.alert('Cannot Remove', 'A flow must have at least a trigger node.');
      return;
    }
    Alert.alert('Delete Node', 'Remove this step from the flow?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => updateFlowNodes(flow.nodes.filter((n) => n.id !== nodeId)),
      },
    ]);
  };

  const handleMoveNode = (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 1 || targetIdx >= flow.nodes.length) return;
    const next = [...flow.nodes];
    const [moved] = next.splice(index, 1);
    next.splice(targetIdx, 0, moved);
    updateFlowNodes(next);
  };

  const handleEditNode = (node) => {
    navigation.navigate('AutomationNodeConfig', {
      node,
      onSaveNode: (updatedNode) => {
        const nextNodes = flow.nodes.map((n) => (n.id === updatedNode.id ? updatedNode : n));
        updateFlowNodes(nextNodes);
      },
    });
  };

  const handleSaveDraft = async () => {
    if (!String(flow.name || '').trim()) {
      Alert.alert('Flow Name Required', 'Please provide a name for this flow.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: flow.name.trim(),
        channelId: flow.channelId || channelId || undefined,
        isActive: false,
        nodes: flow.nodes,
        edges: buildSequentialEdges(flow.nodes),
      };
      let saved;
      if (flow._id) {
        saved = await automationService.updateAutomation(flow._id, payload);
      } else {
        saved = await automationService.createAutomation(payload);
      }
      setFlow(saved || { ...flow, ...payload });
      Alert.alert('Draft Saved', 'Your automation flow has been saved as a draft.');
    } catch (err) {
      Alert.alert(
        'Save Failed',
        err?.response?.data?.message || err?.message || 'Could not save draft.'
      );
    } finally {
      setSaving(false);
    }
  };

  const filteredCategories = useMemo(() => {
    const q = nodeSearch.trim().toLowerCase();
    if (!q) return NODE_CATEGORIES;
    return NODE_CATEGORIES.map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (i) => i.label.toLowerCase().includes(q) || i.desc.toLowerCase().includes(q)
      ),
    })).filter((cat) => cat.items.length > 0);
  }, [nodeSearch]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#00B67A" style={{ marginTop: 80 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerCenter}
          onPress={() => {
            setRenameText(flow.name || '');
            setShowRenameModal(true);
          }}
        >
          <Text style={styles.headerTitle} numberOfLines={1}>
            {flow.name || 'Untitled Flow'}
          </Text>
          <Ionicons name="pencil-outline" size={13} color="#64748B" />
          <View style={[styles.statusPill, flow.isActive ? styles.pillLive : styles.pillDraft]}>
            <Text style={[styles.statusPillText, flow.isActive ? styles.textLive : styles.textDraft]}>
              {flow.isActive ? 'Live' : 'Draft'}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => navigation.navigate('PublishAutomation', { flow: { ...flow, channelId: flow.channelId || channelId } })}
        >
          <Ionicons name="rocket-outline" size={20} color="#00B67A" />
        </TouchableOpacity>
      </View>

      {/* Action Toolbar (5-item Figma strip) */}
      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.toolTab} onPress={() => setShowAddNode(true)}>
          <Ionicons name="git-branch-outline" size={16} color="#00B67A" />
          <Text style={[styles.toolTabText, { color: '#00875A' }]}>Nodes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.toolTab}
          onPress={() => {
            const trig = flow.nodes.find((n) => n.type === 'triggerNode' || n.type === 'eventTriggerNode');
            if (trig) handleEditNode(trig);
          }}
        >
          <Ionicons name="flash-outline" size={16} color="#64748B" />
          <Text style={styles.toolTabText}>Triggers</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.toolTab}
          onPress={() => navigation.navigate('CreateAutomation')}
        >
          <Ionicons name="layers-outline" size={16} color="#64748B" />
          <Text style={styles.toolTabText}>Templates</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.toolTab}
          onPress={() => navigation.navigate('AutomationSimulator', { flow: { ...flow, channelId: flow.channelId || channelId } })}
        >
          <Ionicons name="play-outline" size={16} color="#64748B" />
          <Text style={styles.toolTabText}>Simulate</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.toolTab}
          onPress={() => navigation.navigate('PublishAutomation', { flow: { ...flow, channelId: flow.channelId || channelId } })}
        >
          <Ionicons name="rocket-outline" size={16} color="#64748B" />
          <Text style={styles.toolTabText}>Publish</Text>
        </TouchableOpacity>
      </View>

      {/* Zoom & Undo/Redo Strip */}
      <View style={styles.zoomStrip}>
        <Text style={styles.nodeCountLabel}>{flow.nodes.length} nodes</Text>
        <View style={styles.zoomControls}>
          <TouchableOpacity onPress={() => setZoomPct(100)} style={styles.zoomBtn}>
            <Text style={styles.fitText}>Fit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setZoomPct((z) => Math.max(80, z - 10))} style={styles.zoomBtn}>
            <Ionicons name="remove" size={14} color="#475569" />
          </TouchableOpacity>
          <Text style={styles.zoomText}>{zoomPct}%</Text>
          <TouchableOpacity onPress={() => setZoomPct((z) => Math.min(110, z + 10))} style={styles.zoomBtn}>
            <Ionicons name="add" size={14} color="#475569" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleUndo} disabled={history.length === 0} style={[styles.zoomBtn, history.length === 0 && { opacity: 0.4 }]}>
            <Ionicons name="arrow-undo-outline" size={14} color="#475569" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleRedo} disabled={redoStack.length === 0} style={[styles.zoomBtn, redoStack.length === 0 && { opacity: 0.4 }]}>
            <Ionicons name="arrow-redo-outline" size={14} color="#475569" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Vertical Flow Canvas */}
      <ScrollView
        contentContainerStyle={[
          styles.canvas,
          { transform: [{ scale: zoomPct / 100 }] },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {flow.nodes.map((node, index) => {
          const meta = getNodeVisualMeta(node);
          return (
            <View key={node.id} style={styles.nodeWrapper}>
              <TouchableOpacity
                style={styles.nodeCard}
                onPress={() => handleEditNode(node)}
                activeOpacity={0.85}
              >
                <View style={[styles.nodeIconBox, { backgroundColor: meta.bg }]}>
                  <Ionicons name={meta.icon} size={20} color={meta.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.nodeCategory, { color: meta.color }]}>{meta.category}</Text>
                  <Text style={styles.nodeTitle} numberOfLines={1}>
                    {node.data?.label || 'Flow Step'}
                  </Text>
                  <Text style={styles.nodeSummary} numberOfLines={2}>
                    {getNodeSummary(node)}
                  </Text>
                </View>
                <View style={styles.nodeActions}>
                  {index > 1 && (
                    <TouchableOpacity onPress={() => handleMoveNode(index, -1)} style={styles.nodeActionBtn}>
                      <Ionicons name="arrow-up-outline" size={15} color="#64748B" />
                    </TouchableOpacity>
                  )}
                  {index > 0 && index < flow.nodes.length - 1 && (
                    <TouchableOpacity onPress={() => handleMoveNode(index, 1)} style={styles.nodeActionBtn}>
                      <Ionicons name="arrow-down-outline" size={15} color="#64748B" />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => handleEditNode(node)} style={styles.nodeActionBtn}>
                    <Ionicons name="pencil-outline" size={16} color="#64748B" />
                  </TouchableOpacity>
                  {index > 0 && (
                    <TouchableOpacity onPress={() => handleDeleteNode(node.id)} style={styles.nodeActionBtn}>
                      <Ionicons name="trash-outline" size={16} color="#EF4444" />
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>

              {/* Connector Line */}
              <View style={styles.connector}>
                <View style={styles.connectorDash} />
                <Ionicons name="chevron-down" size={14} color="#00B67A" />
              </View>
            </View>
          );
        })}

        {/* Add New Node Button */}
        <TouchableOpacity
          style={styles.addNodeBox}
          onPress={() => setShowAddNode(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add-circle" size={20} color="#00B67A" />
          <Text style={styles.addNodeText}>Add new node</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.draftBtn}
          onPress={handleSaveDraft}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#475569" />
          ) : (
            <Text style={styles.draftBtnText}>Save draft</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.testFlowBtn}
          onPress={() =>
            navigation.navigate('AutomationSimulator', {
              flow: { ...flow, channelId: flow.channelId || channelId },
            })
          }
        >
          <Ionicons name="play" size={15} color="#FFFFFF" />
          <Text style={styles.testFlowBtnText}>Test flow</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.publishBtn}
          onPress={() =>
            navigation.navigate('PublishAutomation', {
              flow: { ...flow, channelId: flow.channelId || channelId },
            })
          }
        >
          <Ionicons name="rocket-outline" size={15} color="#FFFFFF" />
          <Text style={styles.testFlowBtnText}>Publish</Text>
        </TouchableOpacity>
      </View>

      {/* Rename Flow Modal */}
      <Modal
        visible={showRenameModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRenameModal(false)}
      >
        <View style={styles.renameOverlay}>
          <View style={styles.renameCard}>
            <Text style={styles.sheetTitle}>Rename Flow</Text>
            <TextInput
              style={styles.renameInput}
              value={renameText}
              onChangeText={setRenameText}
              placeholder="Enter flow name"
              placeholderTextColor="#94A3B8"
              autoFocus
            />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={styles.draftBtn} onPress={() => setShowRenameModal(false)}>
                <Text style={styles.draftBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.testFlowBtn}
                onPress={() => {
                  if (!renameText.trim()) {
                    Alert.alert('Required', 'Flow name cannot be empty.');
                    return;
                  }
                  setFlow((prev) => ({ ...prev, name: renameText.trim() }));
                  setShowRenameModal(false);
                }}
              >
                <Text style={styles.testFlowBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Node Bottom Sheet */}
      <Modal
        visible={showAddNode}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddNode(false)}
      >
        <View style={styles.sheetOverlay}>
          <View style={styles.sheetContainer}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Add node</Text>
              <TouchableOpacity onPress={() => setShowAddNode(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={16} color="#94A3B8" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search nodes..."
                placeholderTextColor="#94A3B8"
                value={nodeSearch}
                onChangeText={setNodeSearch}
              />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 430 }}>
              {filteredCategories.map((cat) => (
                <View key={cat.title} style={{ marginBottom: 16 }}>
                  <Text style={styles.catLabel}>{cat.title}</Text>
                  <View style={styles.catGrid}>
                    {cat.items.map((item) => (
                      <TouchableOpacity
                        key={item.kind}
                        style={styles.catItem}
                        onPress={() => handleAddNodeItem(item)}
                        activeOpacity={0.8}
                      >
                        <View style={styles.catIconBox}>
                          <Ionicons name={item.icon} size={18} color="#00B67A" />
                        </View>
                        <Text style={styles.catItemLabel} numberOfLines={1}>
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
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
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 10,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', maxWidth: 170 },
  statusPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  pillDraft: { backgroundColor: '#F1F5F9' },
  pillLive: { backgroundColor: '#DCFCE7' },
  statusPillText: { fontSize: 11, fontWeight: '700' },
  textDraft: { color: '#64748B' },
  textLive: { color: '#16A34A' },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  toolTab: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  toolTabText: { fontSize: 12, fontWeight: '600', color: '#334155' },
  zoomStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  nodeCountLabel: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  zoomControls: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  zoomBtn: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomText: { fontSize: 11, fontWeight: '700', color: '#475569', minWidth: 34, textAlign: 'center' },
  fitText: { fontSize: 10, fontWeight: '700', color: '#475569', paddingHorizontal: 4 },
  canvas: { padding: 16, paddingBottom: 110, alignItems: 'center' },
  nodeWrapper: { width: '100%', alignItems: 'center' },
  nodeCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  nodeIconBox: {
    width: 42,
    height: 42,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeCategory: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  nodeTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginTop: 1 },
  nodeSummary: { fontSize: 12, color: '#64748B', marginTop: 2 },
  nodeActions: { flexDirection: 'row', gap: 4 },
  nodeActionBtn: { padding: 6 },
  connector: { alignItems: 'center', paddingVertical: 4 },
  connectorDash: { width: 2, height: 14, backgroundColor: '#A7F3D0' },
  addNodeBox: {
    width: '100%',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#00B67A',
    backgroundColor: '#EDF9F2',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
  },
  addNodeText: { fontSize: 14, fontWeight: '700', color: '#00875A' },
  bottomBar: {
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
  draftBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  draftBtnText: { fontSize: 14, fontWeight: '700', color: '#334155' },
  testFlowBtn: {
    flex: 1.4,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#00B67A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  testFlowBtnText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  publishBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#064E3B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  renameOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  renameCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
  },
  renameInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    marginTop: 12,
    marginBottom: 16,
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
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
    marginBottom: 12,
  },
  sheetTitle: { fontSize: 17, fontWeight: '800', color: '#0F172A' },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    marginBottom: 14,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 13, color: '#0F172A' },
  catLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  catItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 10,
    gap: 8,
  },
  catIconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#EDF9F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  catItemLabel: { fontSize: 12, fontWeight: '700', color: '#0F172A', flex: 1 },
});
