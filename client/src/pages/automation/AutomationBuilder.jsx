import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Save, Play, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../context/axios';
import useCanvasStore from '../../store/useCanvasStore';
import FlowCanvas from './FlowCanvas';
import NodePropertiesPane from './NodePropertiesPane';
import MobilePreviewPane from './MobilePreviewPane';
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
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  useEffect(() => {
    const loadAutomation = async () => {
      let defaultChannelId = '';
      try {
        const channelsRes = await api.get('/channels');
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
        toast.success('Automation saved successfully');
      } else {
        const res = await api.post('/automation', payload);
        toast.success('Automation created successfully');
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
      
      <div style={{
        height: '56px', background: 'white', borderBottom: '1px solid #E5E7EB',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', flexShrink: 0, zIndex: 20
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => navigate('/admin/automation')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', display: 'flex', padding: '4px' }}
          >
            <ChevronLeft size={20} />
          </button>
          <input
            type="text"
            value={flowName}
            onChange={(e) => setFlowName(e.target.value)}
            style={{
              fontSize: '16px', fontWeight: '600', color: '#111827', border: 'none',
              outline: 'none', background: 'transparent', width: '300px',
              padding: '4px 8px', borderRadius: '6px', transition: 'background 0.2s'
            }}
            onFocus={(e) => { e.currentTarget.style.background = '#F3F4F6'; }}
            onBlur={(e) => { e.currentTarget.style.background = 'transparent'; }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500' }}>
            {nodesCount} node{nodesCount !== 1 ? 's' : ''}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={toggleActive}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', display: 'flex',
              alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '6px',
              color: isActive ? '#059669' : '#6B7280', fontSize: '13px', fontWeight: '600',
              transition: 'all 0.2s'
            }}
          >
            {isActive ? <ToggleRight size={20} color="#10B981" /> : <ToggleLeft size={20} />}
            {isActive ? 'Active' : 'Draft'}
          </button>

          <div style={{ width: '1px', height: '24px', background: '#E5E7EB' }} />

          <button
            onClick={() => setIsAssignModalOpen(true)}
            style={{
              background: 'white', color: '#374151', border: '1px solid #E5E7EB',
              padding: '8px 20px', borderRadius: '8px', fontSize: '13px',
              fontWeight: '600', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
              transition: 'background 0.2s'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21l1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
            Assign Channel
          </button>

          <button
            onClick={() => setIsTestModalOpen(true)}
            style={{
              background: 'white', color: '#374151', border: '1px solid #E5E7EB',
              padding: '8px 20px', borderRadius: '8px', fontSize: '13px',
              fontWeight: '600', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
              transition: 'background 0.2s'
            }}
          >
            <Play size={14} />
            Test Automation
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{
              background: '#10B981', color: 'white', border: 'none',
              padding: '8px 20px', borderRadius: '8px', fontSize: '13px',
              fontWeight: '600', cursor: isSaving ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
              transition: 'background 0.2s', opacity: isSaving ? 0.7 : 1
            }}
            onMouseOver={(e) => { if (!isSaving) e.currentTarget.style.background = '#059669'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = '#10B981'; }}
          >
            {isSaving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />}
            {isSaving ? 'Saving...' : 'Save & Publish'}
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <FlowCanvas 
            onNodesChange={handleNodesChange} 
            onStartWithTemplate={() => setIsTemplateModalOpen(true)}
          />
        </div>

        <NodePropertiesPane currentChannelId={channelId} />

        <MobilePreviewPane />
      </div>

      {isTestModalOpen && (
        <TestAutomationModal 
          onClose={() => setIsTestModalOpen(false)} 
          automationId={id}
        />
      )}

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
    </div>
  );
}
