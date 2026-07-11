import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Save, Play, ToggleLeft, ToggleRight, Loader2, Smartphone } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../context/axios';
import io from 'socket.io-client';
import useCanvasStore from '../../store/useCanvasStore';
import FlowCanvas from './FlowCanvas';
import NodePropertiesPane from './NodePropertiesPane';
import MobilePreviewPane from './MobilePreviewPane';
import SimulatorPanel from './SimulatorPanel';
import TestAutomationModal from '../../components/Modol/automation/TestAutomationModal';
import WhatsAppTemplateSelectionModal from '../../components/Modol/automation/WhatsAppTemplateSelectionModal';
import AssignChannelsModal from '../../components/Modol/automation/AssignChannelsModal';
import 'reactflow/dist/style.css';

export default function AutomationBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { nodes, edges, setFlowData, setNodes } = useCanvasStore();

  const [flowName, setFlowName] = useState(location.state?.flowName || 'Untitled Automation');
  const [isActive, setIsActive] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [channelId, setChannelId] = useState('');
  const [nodesCount, setNodesCount] = useState(0);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(true);
  
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [activeDebugNodeId, setActiveDebugNodeId] = useState(null);
  const [invalidNodeId, setInvalidNodeId] = useState(null);
  const isInitialLoad = React.useRef(true);

  // Setup Socket connection for Visual Debugger
  useEffect(() => {
    if (!id || id === 'new') return;
    
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (import.meta.env.VITE_API_URL ? String(import.meta.env.VITE_API_URL).replace(/\/api\/?$/, '') : '');
    const socket = io(SOCKET_URL, { withCredentials: true });
    
    // Join the specific flow's room
    socket.emit('join', `automation_${id}`);
    
    socket.on('node_executed', (data) => {
      console.log('Debugger - Node Executed:', data);
      setActiveDebugNodeId(data.nodeId);
      // Remove highlight after 2.5 seconds
      setTimeout(() => {
        setActiveDebugNodeId(current => current === data.nodeId ? null : current);
      }, 2500);
    });

    return () => socket.disconnect();
  }, [id]);

  // Track unsaved changes
  useEffect(() => {
    if (isLoading) return;
    if (isInitialLoad.current) {
      const timer = setTimeout(() => { isInitialLoad.current = false; }, 500);
      return () => clearTimeout(timer);
    }
    setHasUnsavedChanges(true);
  }, [nodes, edges, flowName, isActive, channelId, isLoading]);

  useEffect(() => {
    const loadAutomation = async () => {
      let defaultChannelId = '';
      try {
        const channelsRes = await api.get('/whatsapp/channels');
        if (channelsRes.data && channelsRes.data.length > 0) {
          defaultChannelId = channelsRes.data[0]._id;
        }
      } catch (err) {
        console.error('Failed to fetch default channels:', err);
      }

      if (id && id !== 'new') {
        try {
          const res = await api.get(`/automation/${id}`);
          const automation = res.data;
          setFlowName(automation.name || 'Untitled Automation');
          setIsActive(automation.isActive || false);
          setChannelId(automation.channelId || defaultChannelId);
          setFlowData(automation.nodes || [], automation.edges || []);
        } catch (error) {
          console.error('Failed to load automation:', error);
          toast.error('Failed to load automation');
        }
      } else {
        setChannelId(defaultChannelId);
        const triggerType = location.state?.triggerType || 'exact_match';
        setFlowData([
          {
            id: 'trigger_1',
            type: 'triggerNode',
            position: { x: 250, y: 50 },
            data: {
              label: 'Trigger',
              triggerType: triggerType,
              keyword: '',
            },
          },
        ], []);
      }
      setIsLoading(false);
    };

    loadAutomation();

    return () => {
      setFlowData([], []);
    };
  }, [id]);

  const handleSave = useCallback(async () => {
    if (isSaving) return;

    if (!channelId) {
      toast.error('Please assign a WhatsApp Channel to this flow before publishing.');
      return;
    }

    setInvalidNodeId(null);
    // Pre-save validation
    for (const node of nodes) {
      if (node.type === 'triggerNode') {
        const tType = node.data?.triggerType || '';
        if (!node.data?.keyword && tType !== 'media_any' && !tType.includes('_received') && tType !== 'away_message' && tType !== 'fallback') {
          toast.error(`Trigger node is missing a keyword`);
          setInvalidNodeId(node.id);
          return;
        }
      }
      if (node.type === 'apiNode' && !node.data?.endpoint) {
        toast.error(`API node is missing an endpoint URL`);
        setInvalidNodeId(node.id);
        return;
      }
      if (node.type === 'templateNode' && !node.data?.templateName) {
        toast.error(`Template node is missing a selected template`);
        setInvalidNodeId(node.id);
        return;
      }
      if (node.type === 'messageNode' && !node.data?.text) {
        toast.error(`Message node is missing text content`);
        setInvalidNodeId(node.id);
        return;
      }
      if (node.type === 'menuNode') {
        const sections = node.data?.sections || [];
        const hasRows = sections.some(s => s.rows && s.rows.length > 0);
        if (!hasRows) {
          toast.error(`Menu node must have at least one option/row`);
          setInvalidNodeId(node.id);
          return;
        }
      }
      if (node.type === 'interactiveNode' && (!node.data?.buttons || node.data.buttons.length === 0)) {
        toast.error(`Interactive node must have at least one button`);
        setInvalidNodeId(node.id);
        return;
      }
    }

    setIsSaving(true);
    try {
      const payload = {
        name: flowName,
        nodes,
        edges,
        isActive,
        channelId,
      };

      if (id && id !== 'new') {
        await api.put(`/automation/${id}`, payload);
        toast.success('Saved and published successfully');
        setHasUnsavedChanges(false);
      } else {
        const res = await api.post('/automation', payload);
        toast.success('Saved and published successfully');
        setHasUnsavedChanges(false);
        navigate(`/admin/automation/${res.data._id}`, { replace: true });
      }
    } catch (error) {
      console.error('Failed to save automation:', error);
      toast.error(error.response?.data?.message || 'Failed to save automation');
    } finally {
      setIsSaving(false);
    }
  }, [id, flowName, nodes, edges, isActive, channelId, isSaving, navigate]);

  const handleNodesChange = useCallback((updatedNodes) => {
    setNodesCount(updatedNodes.length);
  }, []);

  const toggleActive = useCallback(async () => {
    const newActiveState = !isActive;
    setIsActive(newActiveState);

    if (id && id !== 'new') {
      try {
        await api.put(`/automation/${id}`, { isActive: newActiveState });
        toast.success(newActiveState ? 'Automation activated' : 'Automation deactivated');
      } catch (error) {
        setIsActive(!newActiveState);
        toast.error('Failed to update status');
      }
    }
  }, [isActive, id]);

  const handleSelectWhatsAppTemplate = (template) => {
    // Generate placeholder values for variables (e.g. {{1}} -> '')
    let variables = [];
    let bodyText = '';
    let headerType = 'none';
    let mediaUrl = '';
    let headerText = '';

    if (template.components) {
      template.components.forEach(comp => {
        if (comp.type === 'BODY') {
          bodyText = comp.text || '';
          if (comp.example && comp.example.body_text) {
            const numVars = comp.example.body_text[0].length;
            for (let i = 0; i < numVars; i++) {
              variables.push({ value: '' });
            }
          }
        } else if (comp.type === 'HEADER') {
          if (comp.format === 'TEXT') {
            headerType = 'text';
            headerText = comp.text || '';
          } else if (['IMAGE', 'VIDEO', 'DOCUMENT'].includes(comp.format)) {
            headerType = comp.format.toLowerCase();
            mediaUrl = comp.example?.header_handle?.[0] || '';
          }
        }
      });
    }

    const templateNode = {
      id: `template_node_${Date.now()}`,
      type: 'templateNode',
      position: { x: 350, y: 150 },
      data: {
        label: 'Template Message',
        templateName: template.name,
        templateLanguage: template.language || 'en',
        variables: variables,
        text: bodyText,
        headerType: headerType,
        headline: headerText,
        mediaUrl: mediaUrl,
        buttons: (template.components && template.components.find(c => c.type === 'BUTTONS')?.buttons) || []
      }
    };

    const triggerNode = {
      id: `trigger_${Date.now()}`,
      type: 'triggerNode',
      position: { x: 50, y: 150 },
      data: {
        label: 'Incoming Message',
        triggerType: 'exact_match',
        keyword: '',
      },
    };

    setFlowData([triggerNode, templateNode], [
      {
        id: `edge_${Date.now()}`,
        source: triggerNode.id,
        target: templateNode.id,
        sourceHandle: 'main-handle',
        type: 'smoothstep'
      }
    ]);
    
    setIsTemplateModalOpen(false);
  };

  if (isLoading) {
    return (
      <div style={{
        width: '100%', height: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: '#f8fafc', fontFamily: 'Outfit, sans-serif'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <Loader2 size={32} color="#10B981" style={{ animation: 'spin 1s linear infinite' }} />
          <span style={{ color: '#6B7280', fontSize: '14px', fontWeight: '500' }}>Loading automation...</span>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%', fontFamily: 'Outfit, sans-serif' }}>
      <style>{`
        /* Responsive Top Bar */
        .auto-topbar { padding: 0 20px; }
        .auto-title-input { width: 300px; }
        .auto-btn-text { display: inline; }
        .auto-toolbar-gap { gap: 12px; }
        .auto-btn-padding { padding: 8px 20px; }

        /* Sidebar Responsiveness */
        .properties-pane { width: 320px; flex-shrink: 0; }
        .preview-pane { width: 360px; flex-shrink: 0; }

        @media (max-width: 1536px) {
          .preview-pane { width: 320px; }
        }

        /* Laptops <= 1400px (13.3", 14", etc.) */
        @media (max-width: 1400px) {
          .auto-title-input { width: 200px !important; }
          .auto-btn-padding { padding: 6px 12px !important; font-size: 12px !important; }
          .auto-toolbar-gap { gap: 8px !important; }
          .auto-topbar { padding: 0 12px !important; }
          
          .properties-pane { width: 300px; }
          .preview-pane { width: 300px; }
        }

        /* Laptops <= 1200px (11.6", extreme split-screen) */
        @media (max-width: 1200px) {
          .auto-title-input { width: 140px !important; }
          .auto-btn-text.optional { display: none !important; }
          .auto-btn-padding { padding: 8px !important; } /* Icon only */
          
          .properties-pane { width: 280px; }
          .preview-pane { width: 280px; }
        }
      `}</style>
      
      <div className="auto-topbar" style={{
        height: '56px', background: 'white', borderBottom: '1px solid #E5E7EB',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0, zIndex: 20
      }}>
        <div className="auto-toolbar-gap" style={{ display: 'flex', alignItems: 'center' }}>
          <button
            onClick={() => {
              if (hasUnsavedChanges) {
                setShowExitWarning(true);
              } else {
                navigate('/admin/automation');
              }
            }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', display: 'flex', padding: '4px' }}
          >
            <ChevronLeft size={20} />
          </button>
          <input
            className="auto-title-input"
            type="text"
            value={flowName}
            onChange={(e) => setFlowName(e.target.value)}
            style={{
              fontSize: '15px', fontWeight: '600', color: '#111827', border: 'none',
              outline: 'none', background: 'transparent',
              padding: '4px 8px', borderRadius: '6px', transition: 'background 0.2s',
              textOverflow: 'ellipsis'
            }}
            onFocus={(e) => { e.currentTarget.style.background = '#F3F4F6'; }}
            onBlur={(e) => { e.currentTarget.style.background = 'transparent'; }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 8px' }}>
          <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: '600', whiteSpace: 'nowrap' }}>
            {nodesCount} node{nodesCount !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="auto-toolbar-gap" style={{ display: 'flex', alignItems: 'center' }}>
          <button
            className="auto-btn-padding"
            onClick={toggleActive}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', display: 'flex',
              alignItems: 'center', gap: '6px', borderRadius: '6px',
              color: isActive ? '#059669' : '#6B7280', fontSize: '13px', fontWeight: '600',
              transition: 'all 0.2s'
            }}
          >
            {isActive ? <ToggleRight size={18} color="#10B981" /> : <ToggleLeft size={18} />}
            <span className="auto-btn-text optional">{isActive ? 'Active' : 'Draft'}</span>
          </button>

          <div style={{ width: '1px', height: '24px', background: '#E5E7EB' }} />

          <button
            className="auto-btn-padding"
            onClick={() => setIsAssignModalOpen(true)}
            style={{
              background: 'white', color: '#374151', border: '1px solid #E5E7EB',
              borderRadius: '8px', fontSize: '13px',
              fontWeight: '600', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
              transition: 'background 0.2s'
            }}
            title="Assign Channel"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21l1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
            <span className="auto-btn-text optional">Channel</span>
          </button>

          <button
            className="auto-btn-padding"
            onClick={() => setIsSimulatorOpen(true)}
            style={{
              background: '#EEF2FF', color: '#4F46E5', border: '1px solid #C7D2FE',
              borderRadius: '8px', fontSize: '13px',
              fontWeight: '600', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
              transition: 'background 0.2s'
            }}
            title="Simulator"
          >
            <Play size={14} />
            <span className="auto-btn-text optional">Simulator</span>
          </button>

          <button
            className="auto-btn-padding"
            onClick={() => setIsTestModalOpen(true)}
            style={{
              background: 'white', color: '#374151', border: '1px solid #E5E7EB',
              borderRadius: '8px', fontSize: '13px',
              fontWeight: '600', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
              transition: 'background 0.2s'
            }}
            title="Test on Phone"
          >
            <Smartphone size={14} />
            <span className="auto-btn-text optional">Test</span>
          </button>

          <button
            className="auto-btn-padding"
            onClick={() => setShowMobilePreview(!showMobilePreview)}
            style={{
              background: showMobilePreview ? '#EEF2FF' : 'white', 
              color: showMobilePreview ? '#4F46E5' : '#374151', 
              border: `1px solid ${showMobilePreview ? '#C7D2FE' : '#E5E7EB'}`,
              borderRadius: '8px', fontSize: '13px',
              fontWeight: '600', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
              transition: 'all 0.2s'
            }}
            title={showMobilePreview ? "Hide Preview" : "See Preview"}
          >
            <Smartphone size={14} />
            <span className="auto-btn-text optional">{showMobilePreview ? "Hide" : "Preview"}</span>
          </button>

          <button
            className="auto-btn-padding"
            onClick={handleSave}
            disabled={isSaving}
            style={{
              background: '#10B981', color: 'white', border: 'none',
              borderRadius: '8px', fontSize: '13px',
              fontWeight: '600', cursor: isSaving ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
              transition: 'background 0.2s', opacity: isSaving ? 0.7 : 1
            }}
            onMouseOver={(e) => { if (!isSaving) e.currentTarget.style.background = '#059669'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = '#10B981'; }}
            title="Save & Publish"
          >
            {isSaving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />}
            <span className="auto-btn-text">{isSaving ? 'Saving...' : 'Publish'}</span>
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <FlowCanvas 
            activeDebugNodeId={activeDebugNodeId}
            invalidNodeId={invalidNodeId}
            onNodesChange={handleNodesChange} 
            onAddTrigger={() => {}} 
            onStartWithTemplate={() => setIsTemplateModalOpen(true)} 
          />
        </div>

        <NodePropertiesPane currentChannelId={channelId} />

        {showMobilePreview && <MobilePreviewPane />}
      </div>

      {isTestModalOpen && (
        <TestAutomationModal 
          onClose={() => setIsTestModalOpen(false)} 
          automationId={id}
        />
      )}

      <SimulatorPanel 
        isOpen={isSimulatorOpen} 
        onClose={() => setIsSimulatorOpen(false)} 
        automationId={id} 
        channelId={channelId} 
      />

      {isTemplateModalOpen && (
        <WhatsAppTemplateSelectionModal 
          onClose={() => setIsTemplateModalOpen(false)}
          onSelect={handleSelectWhatsAppTemplate}
        />
      )}

      {isAssignModalOpen && (
        <AssignChannelsModal 
          currentChannelId={channelId}
          onAssign={(newId) => setChannelId(newId)}
          onClose={() => setIsAssignModalOpen(false)} 
        />
      )}

      {showExitWarning && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '16px', width: '90%', maxWidth: '420px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '8px', fontSize: '20px', fontWeight: '700', color: '#111827' }}>Unsaved Changes</h3>
            <p style={{ color: '#4B5563', fontSize: '14px', marginBottom: '32px', lineHeight: '1.5' }}>You have unsaved changes in this automation. Do you want to save them before leaving?</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                onClick={() => setShowExitWarning(false)} 
                style={{ padding: '10px 16px', background: 'transparent', border: '1px solid #D1D5DB', borderRadius: '8px', cursor: 'pointer', color: '#374151', fontSize: '13px', fontWeight: '600', transition: 'background 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.background = '#F9FAFB'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                Cancel
              </button>
              <button 
                onClick={() => { setShowExitWarning(false); navigate('/admin/automation'); }} 
                style={{ padding: '10px 16px', background: '#FEF2F2', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#DC2626', fontSize: '13px', fontWeight: '600', transition: 'background 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.background = '#FEE2E2'}
                onMouseOut={(e) => e.currentTarget.style.background = '#FEF2F2'}
              >
                Don&apos;t Save
              </button>
              <button 
                onClick={async () => { 
                  setShowExitWarning(false); 
                  await handleSave(); 
                  navigate('/admin/automation'); 
                }} 
                style={{ padding: '10px 16px', background: '#10B981', border: 'none', borderRadius: '8px', cursor: 'pointer', color: 'white', fontSize: '13px', fontWeight: '600', transition: 'background 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.background = '#059669'}
                onMouseOut={(e) => e.currentTarget.style.background = '#10B981'}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
