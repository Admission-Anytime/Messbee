import React, { useState, useEffect } from 'react';
import 'reactflow/dist/style.css';
import { ChevronLeft, RefreshCw, MessageCircle, Play, Save, LogOut, Search } from 'lucide-react';

import FlowCanvas from './features/canvas/FlowCanvas';
import NodePropertiesPane from './features/canvas/NodePropertiesPane';
import MobilePreviewPane from './features/canvas/MobilePreviewPane';
import AutomationLanding from './features/dashboard/AutomationLanding';
import AutomationDashboard from './features/dashboard/AutomationDashboard';
import InboxDashboard from './features/inbox/InboxDashboard';
import ContactsDashboard from './features/crm/ContactsDashboard';
import TriggerSelectionModal from './components/Modals/TriggerSelectionModal';
import CreateAutomationModal from './components/Modals/CreateAutomationModal';
import AssignChannelsModal from './components/Modals/AssignChannelsModal';
import TestAutomationModal from './components/Modals/TestAutomationModal';
import WelcomeMessageSettings from './features/dashboard/WelcomeMessageSettings';
import AwayMessageSettings from './features/dashboard/AwayMessageSettings';
import FallbackMessageSettings from './features/dashboard/FallbackMessageSettings';
import useCanvasStore from './store/useCanvasStore';
import useAuthStore from './store/useAuthStore';
import api from './api';

// --- Sub-components ---
function SidebarLink({ label, active, onClick, highlight, icon, badge, badgeColor, badgeTextColor }) {
  const renderIcon = () => {
    if (icon === 'layout') return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>;
    if (icon === 'bell') return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>;
    if (icon === 'message-square') return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;
    if (icon === 'grid') return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="14" width="7" height="7" rx="1"></rect><rect x="3" y="14" width="7" height="7" rx="1"></rect></svg>;
    if (icon === 'users') return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
    if (icon === 'log-out') return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;
    return null;
  };

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 12px', borderRadius: '8px', fontSize: '14px', fontWeight: active ? '600' : '500',
        color: highlight ? '#10B981' : active ? '#111827' : '#6B7280',
        background: active ? '#F3F4F6' : 'transparent',
        cursor: 'pointer', transition: 'background 0.15s', marginBottom: '4px'
      }}
      onMouseOver={e => { if (!active) e.currentTarget.style.background = '#F9FAFB'; }}
      onMouseOut={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {icon && <div style={{ color: active ? '#10B981' : '#9CA3AF', display: 'flex' }}>{renderIcon()}</div>}
        {label}
      </div>
      {badge && (
        <span style={{ 
          background: badgeColor || '#EF4444', 
          color: badgeTextColor || 'white', 
          fontSize: '11px', fontWeight: 'bold', 
          padding: '2px 6px', borderRadius: '100px',
          minWidth: '16px', textAlign: 'center'
        }}>
          {badge}
        </span>
      )}
    </div>
  );
}

function SubSidebarLink({ label, active, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '8px 12px', borderRadius: '6px', fontSize: '13px', 
        fontWeight: active ? '600' : '500',
        color: active ? '#10B981' : '#6B7280',
        background: active ? '#ECFDF5' : 'transparent',
        cursor: 'pointer', transition: 'background 0.15s'
      }}
      onMouseOver={e => { if (!active) e.currentTarget.style.background = '#F9FAFB'; }}
      onMouseOut={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
    >
      {label}
    </div>
  );
}

const headerButtonStyle = {
  background: 'rgba(249,250,251,0.9)',
  border: '1px solid #e5e7eb',
  padding: '7px 14px',
  borderRadius: '8px',
  fontSize: '12px',
  fontWeight: '600',
  color: '#4b5563',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
  boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
};
// --- End Sub-components ---

function App() {
  const { isAuthenticated, user, login, logout } = useAuthStore();
  // Views: 'landing' | 'flows' | 'trigger-select' | 'create-modal' | 'canvas' | 'welcome-message'
  const [currentView, setCurrentView] = useState('landing');
  const [nodesCount, setNodesCount] = useState(0);
  const [selectedChannelId, setSelectedChannelId] = useState('');
  const [activeChatsCount, setActiveChatsCount] = useState(0);

  useEffect(() => {
    const fetchChannelsAndStats = async () => {
      try {
        const res = await api.get('/channels');
        if (res.data && res.data.length > 0) {
          setSelectedChannelId(res.data[0]._id);
        }
        
        // Fetch active chats count for the sidebar badge
        const actRes = await api.get('/automations/activity');
        if (actRes.data) {
          setActiveChatsCount(actRes.data.filter(s => s.status === 'ACTIVE').length);
        }
      } catch (err) {
        console.error('Failed to fetch initial data:', err);
      }
    };
    fetchChannelsAndStats();
    
    // Poll for active chats count every 15s
    const interval = setInterval(async () => {
      try {
        const actRes = await api.get('/automations/activity');
        if (actRes.data) {
          setActiveChatsCount(actRes.data.filter(s => s.status === 'ACTIVE').length);
        }
      } catch (e) {}
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const [flowName, setFlowName] = useState('');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentAutomationId, setCurrentAutomationId] = useState(null);
  const [isTriggerModalOpen, setIsTriggerModalOpen] = useState(false);
  
  const nodes = useCanvasStore(state => state.nodes);
  const edges = useCanvasStore(state => state.edges);
  const addNode = useCanvasStore(state => state.addNode);
  const setFlowData = useCanvasStore(state => state.setFlowData);

  // DEV MODE AUTO-LOGIN: Automatically acquires a JWT token so the builder works seamlessly 
  // without a login screen. When you merge this into your main website, you will just replace 
  // this block with your main website's token injection logic.
  useEffect(() => {
    const autoLoginForDev = async () => {
      if (!isAuthenticated) {
        try {
          const res = await api.post('/auth/login', { email: 'dev@local.host', password: 'password123' });
          login(res.data.token, res.data.tenant);
        } catch (error) {
          try {
            const reg = await api.post('/auth/register', { email: 'dev@local.host', password: 'password123', name: 'Dev Tenant' });
            login(reg.data.token, reg.data.tenant);
          } catch (e) {
            console.error('Failed to auto-login dev account. Is the backend running?');
          }
        }
      }
    };
    autoLoginForDev();
  }, [isAuthenticated, login]);

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Outfit, sans-serif' }}>
        <h2>Loading Builder Environment...</h2>
      </div>
    );
  }

  const handleSaveAndDeploy = async () => {
    setIsSaving(true);
    try {
      const triggerNode = nodes.find(n => n.type === 'triggerNode' || n.type === 'eventTriggerNode');
      
      if (!triggerNode) {
        alert('Please add a Trigger node to start your flow.');
        setIsSaving(false);
        return;
      }

      let payloadTriggerType = 'KEYWORD_MATCH';
      let payloadTriggerValue = null;

      if (triggerNode.type === 'eventTriggerNode') {
        const eventName = triggerNode.data?.eventName?.trim();
        if (!eventName) {
          alert('Please set an Event Name in the API Webhook node before deploying.');
          setIsSaving(false);
          return;
        }
        payloadTriggerType = 'API_EVENT';
        payloadTriggerValue = eventName;
      } else {
        const triggerType = triggerNode.data?.triggerType || 'exact_match';
        const keyword = triggerNode.data?.keyword?.trim();
        
        const isFallback = triggerType === 'fallback';
        const isWelcome = triggerType === 'welcome_message';
        const isAway = triggerType === 'away_message';
        const isTagAdded = triggerType === 'tag_added';
        
        if (!isFallback && !isWelcome && !isAway && !isTagAdded && !keyword && !['media_any', 'image_received', 'video_received', 'document_received', 'voice_received', 'location_received', 'contact_shared', 'reaction'].includes(triggerType)) {
          alert('Please set a keyword in the Trigger match node before deploying.');
          setIsSaving(false);
          return;
        }

        payloadTriggerValue = keyword;

        if (isWelcome) {
          payloadTriggerType = 'NEW_CONTACT';
          payloadTriggerValue = null;
        } else if (isAway) {
          payloadTriggerValue = '[__AWAY_MESSAGE__]';
        } else if (isFallback) {
          payloadTriggerValue = '[__FALLBACK__]';
        } else if (isTagAdded) {
          payloadTriggerType = 'TAG_ADDED';
        }
      }

      if (!selectedChannelId) {
        alert('Please assign a WhatsApp Channel to this flow before publishing (click "Assign Channels" in the top bar).');
        setIsSaving(false);
        return;
      }

      const payload = {
        channelId: selectedChannelId,
        name: flowName || 'My Automation Flow',
        isActive: true,
        triggers: [
          {
            type: payloadTriggerType,
            value: payloadTriggerValue
          }
        ],
        nodes,
        edges
      };

      if (currentAutomationId) {
        await api.put(`/automations/${currentAutomationId}`, payload);
        alert('Flow updated successfully!');
      } else {
        const response = await api.post('/automations', payload);
        setCurrentAutomationId(response.data._id);
        alert('Flow saved and deployed successfully! The Backend Engine is now listening for this keyword.');
      }
    } catch (error) {
      console.error('Save failed:', error);
      alert(error.response?.data?.message || 'Failed to save flow. Check server logs.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateFromModal = async ({ name, triggerType, profile }) => {
    try {
      // Validation: Check if automation name already exists
      const res = await api.get('/automations');
      const existingAutomations = res.data || [];
      const nameExists = existingAutomations.some(a => a.name.trim().toLowerCase() === name.trim().toLowerCase());
      
      if (nameExists) {
        alert(`An automation with the name "${name}" already exists. Please choose a different name.`);
        // Return to automation page (close modal)
        setCurrentView('landing');
        return;
      }
    } catch (error) {
      console.error('Failed to validate automation name:', error);
    }

    setCurrentAutomationId(null);
    setFlowName(name);

    let initialNodes = [];
    let initialEdges = [];

    // Identify standard presets and templates
    if (name === 'Welcome Message' || triggerType === 'new_subscriber') {
      const triggerId = `node_trigger_${Date.now()}`;
      const messageId = `node_message_${Date.now() + 1}`;
      initialNodes = [
        {
          id: triggerId,
          type: 'triggerNode',
          position: { x: 150, y: 150 },
          data: { label: 'Welcome Trigger', triggerType: 'welcome_message', keyword: '' },
          selected: false
        },
        {
          id: messageId,
          type: 'messageNode',
          position: { x: 500, y: 150 },
          data: { label: 'Welcome Message', messageType: 'text', text: 'Welcome to our WhatsApp page! How can we help you today?' },
          selected: false
        }
      ];
      initialEdges = [
        {
          id: `edge_${Date.now()}`,
          source: triggerId,
          sourceHandle: 'main-handle',
          target: messageId,
          style: { stroke: '#10b981', strokeWidth: 2 }
        }
      ];
    } else if (name === 'Away Message') {
      const triggerId = `node_trigger_${Date.now()}`;
      const messageId = `node_message_${Date.now() + 1}`;
      initialNodes = [
        {
          id: triggerId,
          type: 'triggerNode',
          position: { x: 150, y: 150 },
          data: { label: 'Away Trigger', triggerType: 'away_message', keyword: '[__AWAY_MESSAGE__]' },
          selected: false
        },
        {
          id: messageId,
          type: 'messageNode',
          position: { x: 500, y: 150 },
          data: { label: 'Away Message', messageType: 'text', text: 'Thank you for your message. We are currently offline, but we will get back to you as soon as we return!' },
          selected: false
        }
      ];
      initialEdges = [
        {
          id: `edge_${Date.now()}`,
          source: triggerId,
          sourceHandle: 'main-handle',
          target: messageId,
          style: { stroke: '#10b981', strokeWidth: 2 }
        }
      ];
    } else if (name === 'Fallback Message') {
      const triggerId = `node_trigger_${Date.now()}`;
      const messageId = `node_message_${Date.now() + 1}`;
      initialNodes = [
        {
          id: triggerId,
          type: 'triggerNode',
          position: { x: 150, y: 150 },
          data: { label: 'Fallback Trigger', triggerType: 'fallback', keyword: '[__FALLBACK__]' },
          selected: false
        },
        {
          id: messageId,
          type: 'messageNode',
          position: { x: 500, y: 150 },
          data: { label: 'Default Reply', messageType: 'text', text: 'Sorry, we did not understand your message. Please reply with one of our keywords or wait for an agent.' },
          selected: false
        }
      ];
      initialEdges = [
        {
          id: `edge_${Date.now()}`,
          source: triggerId,
          sourceHandle: 'main-handle',
          target: messageId,
          style: { stroke: '#10b981', strokeWidth: 2 }
        }
      ];
    } else if (triggerType === 'qr_link') {
      const triggerId = `node_trigger_${Date.now()}`;
      const messageId = `node_message_${Date.now() + 1}`;
      initialNodes = [
        {
          id: triggerId,
          type: 'triggerNode',
          position: { x: 150, y: 150 },
          data: { label: 'QR / Link Trigger', triggerType: 'qr_link', keyword: 'order_now' },
          selected: false
        },
        {
          id: messageId,
          type: 'messageNode',
          position: { x: 500, y: 150 },
          data: { label: 'Response', messageType: 'text', text: 'Thank you for scanning our QR code! How can we assist you with your order?' },
          selected: false
        }
      ];
      initialEdges = [
        {
          id: `edge_${Date.now()}`,
          source: triggerId,
          sourceHandle: 'main-handle',
          target: messageId,
          style: { stroke: '#10b981', strokeWidth: 2 }
        }
      ];
    } else if (triggerType === 'interactive_template') {
      const triggerId = `node_trigger_${Date.now()}`;
      const templateId = `node_template_${Date.now() + 1}`;
      initialNodes = [
        {
          id: triggerId,
          type: 'triggerNode',
          position: { x: 150, y: 150 },
          data: { label: 'Quick Reply Trigger', triggerType: 'interactive_template', keyword: 'btn_confirm' },
          selected: false
        },
        {
          id: templateId,
          type: 'templateNode',
          position: { x: 500, y: 150 },
          data: { label: 'Send Template', templateName: 'order_confirmation', templateLanguage: 'en', variables: [] },
          selected: false
        }
      ];
      initialEdges = [
        {
          id: `edge_${Date.now()}`,
          source: triggerId,
          sourceHandle: 'main-handle',
          target: templateId,
          style: { stroke: '#10b981', strokeWidth: 2 }
        }
      ];
    } else if (triggerType === 'specific_message') {
      const triggerId = `node_trigger_${Date.now()}`;
      const messageId = `node_message_${Date.now() + 1}`;
      initialNodes = [
        {
          id: triggerId,
          type: 'triggerNode',
          position: { x: 150, y: 150 },
          data: { label: 'Keyword Trigger', triggerType: 'exact_match', keyword: 'hello' },
          selected: false
        },
        {
          id: messageId,
          type: 'messageNode',
          position: { x: 500, y: 150 },
          data: { label: 'Response Text', messageType: 'text', text: 'Hello there! Let us know how we can help.' },
          selected: false
        }
      ];
      initialEdges = [
        {
          id: `edge_${Date.now()}`,
          source: triggerId,
          sourceHandle: 'main-handle',
          target: messageId,
          style: { stroke: '#10b981', strokeWidth: 2 }
        }
      ];
    }

    setFlowData(initialNodes, initialEdges);
    setCurrentView('canvas');

    if (initialNodes.length === 0) {
      setIsTriggerModalOpen(true);
    } else {
      setIsTriggerModalOpen(false);
    }
  };

  // Sidebar navigation items
  const sidebarItems = [
    { id: 'landing', label: 'Home', icon: '🏠' },
    { id: 'flows', label: 'Flows', icon: '⚡' },
  ];

  const showSidebar = currentView !== 'canvas';

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#fcfcfd', fontFamily: 'Outfit, sans-serif' }}>
      
      {/* Top Header Bar */}
      <header style={{ padding: '10px 24px', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(229,231,235,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
        {currentView === 'canvas' ? (
          <>
            {/* Canvas Header - Figma Style */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button 
                onClick={() => setCurrentView('landing')}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
              </button>
              
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#111827' }}>{flowName || 'Untitled Flow'}</span>
                  <span style={{ background: '#f3f4f6', color: '#6b7280', fontSize: '10px', fontWeight: '700', padding: '2px 6px', borderRadius: '4px', letterSpacing: '0.05em' }}>{currentAutomationId ? 'PUBLISHED' : 'DRAFT'}</span>
                </div>
              </div>

              <div style={{ width: '1px', height: '24px', background: '#e5e7eb', margin: '0 8px' }} />

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '9px', fontWeight: '600', color: '#9ca3af', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Nodes</span>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>{nodesCount}</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
              <button style={{ ...headerButtonStyle, background: '#ffffff' }} onClick={() => window.location.reload()}>
                <RefreshCw size={14} /> Reload
              </button>
              <button style={{ ...headerButtonStyle, background: '#ffffff' }} onClick={() => setIsAssignModalOpen(true)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21l1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg> Assign Channels
              </button>
              <button style={{ ...headerButtonStyle, background: '#ffffff' }} onClick={() => setIsTestModalOpen(true)}>
                <Play size={14} /> Test Automation
              </button>
              <button 
                style={{ background: '#10B981', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '100px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s', display: 'flex', alignItems: 'center', gap: '6px' }} 
                onClick={handleSaveAndDeploy}
                disabled={isSaving}
              >
                {isSaving ? 'Publishing...' : 'Publish'}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Dashboard Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '18px', fontWeight: '700', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#10B981', fontSize: '22px' }}>●</span> MessBee
              </span>
            </div>
            <div style={{ position: 'relative', width: '320px' }}>
              <Search size={16} color="#9CA3AF" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input type="text" placeholder="Search automations..." style={{ width: '100%', padding: '8px 12px 8px 36px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '12px', color: '#10B981', fontWeight: '600', background: '#ECFDF5', padding: '4px 10px', borderRadius: '100px' }}>{user?.tenantName || 'MessBee Pro'}</span>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: 'white' }}>{user?.name?.charAt(0) || 'U'}</div>
            </div>
          </>
        )}
      </header>
      
      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        
        {/* Left Sidebar (hidden on canvas) */}
        {showSidebar && (
          <div style={{
            width: '240px', background: '#FFFFFF', borderRight: '1px solid #E5E7EB',
            display: 'flex', flexDirection: 'column'
          }}>
            {/* Logo */}
            <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '24px', height: '24px', background: '#10B981', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'white', fontWeight: 'bold', fontSize: '14px' }}>M</span>
              </div>
              <span style={{ fontSize: '18px', fontWeight: '700', color: '#111827' }}>MessBee</span>
            </div>

            {/* Nav Links */}
            <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <SidebarLink label="Home" active={currentView === 'landing'} onClick={() => setCurrentView('landing')} icon="layout" />
              <SidebarLink label="Flows" active={currentView === 'flows'} onClick={() => setCurrentView('flows')} icon="grid" />
              <SidebarLink 
                label="Live Chat" 
                active={currentView === 'inbox'} 
                onClick={() => setCurrentView('inbox')} 
                icon="message-square" 
                badge={activeChatsCount > 0 ? activeChatsCount : null}
                badgeColor="#10B981"
              />
              <SidebarLink label="Contacts" active={currentView === 'contacts'} onClick={() => setCurrentView('contacts')} icon="users" />
            </div>
            
            <div style={{ marginTop: 'auto', padding: '24px 16px' }}>
              <SidebarLink label="Logout" active={false} onClick={logout} icon="log-out" />
            </div>
          </div>
        )}

        {/* Page Content */}
        {currentView === 'landing' && (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <AutomationLanding
              onNavigateFlows={() => setCurrentView('flows')}
              onCreateAutomation={() => setCurrentView('create-modal')}
              onCreatePreconfigured={handleCreateFromModal}
              onNavigateWelcomeMessage={() => setCurrentView('welcome-message')}
              onNavigateAwayMessage={() => setCurrentView('away-message')}
              onNavigateFallbackMessage={() => setCurrentView('fallback-message')}
            />
          </div>
        )}

        {currentView === 'welcome-message' && (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <WelcomeMessageSettings onBack={() => setCurrentView('landing')} />
          </div>
        )}

        {currentView === 'away-message' && (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <AwayMessageSettings onBack={() => setCurrentView('landing')} />
          </div>
        )}

        {currentView === 'fallback-message' && (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <FallbackMessageSettings onBack={() => setCurrentView('landing')} />
          </div>
        )}

        {currentView === 'flows' && (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <AutomationDashboard 
              onBack={() => setCurrentView('landing')}
              onCreateAutomation={() => setCurrentView('create-modal')} 
              onEditAutomation={(automation) => {
                setCurrentAutomationId(automation._id);
                setFlowName(automation.name);
                setFlowData(automation.nodes || [], automation.edges || []);
                setCurrentView('canvas');
              }}
            />
          </div>
        )}

        {currentView === 'inbox' && (
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <InboxDashboard currentChannelId={selectedChannelId} />
          </div>
        )}

        {currentView === 'contacts' && (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <ContactsDashboard />
          </div>
        )}

        {currentView === 'canvas' && (
          <>
            <div style={{ flex: 1, position: 'relative' }}>
              <FlowCanvas 
                onNodesChange={(nodes) => setNodesCount(nodes.length)} 
                onAddTrigger={() => setIsTriggerModalOpen(true)}
                onStartWithTemplate={() => setCurrentView('create-modal')}
              />
            </div>
            <NodePropertiesPane currentChannelId={selectedChannelId} />
            <MobilePreviewPane />
          </>
        )}
        
      </div>

      {/* Modals */}
      {isTestModalOpen && (
        <TestAutomationModal onClose={() => setIsTestModalOpen(false)} />
      )}

      {isTriggerModalOpen && (
        <TriggerSelectionModal 
          onClose={() => setIsTriggerModalOpen(false)}
          onSelectTrigger={(triggerType) => {
            const triggerConfigs = {
              'specific_message': { nodeData: { label: 'Keyword Match', triggerType: 'keyword_equals', keyword: '' } },
              'any_message': { nodeData: { label: 'Any Message', triggerType: 'fallback', keyword: '' } },
              'qr_link': { nodeData: { label: 'QR Scan / Link Click', triggerType: 'qr_link', keyword: 'scan' } },
              'whatsapp_ad': { nodeData: { label: 'Ad Click', triggerType: 'whatsapp_ad', keyword: 'ad_click' } },
              'interactive_template': { nodeData: { label: 'Template Reply', triggerType: 'keyword_equals', keyword: '' } },
              'agent_sends': { nodeData: { label: 'Agent Trigger', triggerType: 'keyword_equals', keyword: '' } },
              'new_subscriber': { nodeData: { label: 'New Subscriber', triggerType: 'fallback', keyword: '' } },
              'webhook': { nodeData: { label: 'API Webhook', triggerType: 'api_webhook', keyword: '' } }
            };
            const config = triggerConfigs[triggerType] || { nodeData: { label: 'Trigger match', triggerType: 'keyword_equals', keyword: '' } };
            
            addNode({
              id: `node_trigger_${Date.now()}`,
              type: 'triggerNode',
              position: { x: 250, y: 150 },
              data: config.nodeData,
              selected: true
            });
            setIsTriggerModalOpen(false);
          }}
        />
      )}

      {currentView === 'create-modal' && (
        <CreateAutomationModal
          onClose={() => setCurrentView(currentView === 'create-modal' ? 'flows' : currentView)}
          onCreate={handleCreateFromModal}
        />
      )}

      {isAssignModalOpen && (
        <AssignChannelsModal 
          currentChannelId={selectedChannelId}
          onAssign={(id) => setSelectedChannelId(id)}
          onClose={() => setIsAssignModalOpen(false)} 
        />
      )}
    </div>
  );
}



export default App;
