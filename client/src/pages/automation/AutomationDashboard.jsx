import React, { useState, useEffect } from 'react';
import api from '../../context/axios';
import { 
  Plus, Search, ChevronLeft, Trash2, Edit3, Shield, Zap, Settings, Clock, RefreshCw, BarChart2
} from 'lucide-react';
import { DeliveryRulesModal, SpamProtectionModal, CrmSyncModal } from './GlobalSettingsModals';

export default function AutomationDashboard({ onCreateAutomation, onEditAutomation, onBack }) {
  const [automations, setAutomations] = useState([]);
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('automations');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModal, setActiveModal] = useState(null);
  const [globalSettings, setGlobalSettings] = useState(null);

  const fetchGlobalSettings = async () => {
    try {
      const res = await api.get('/tenant-settings');
      setGlobalSettings(res.data);
    } catch (e) {
      console.error('Failed to load global settings', e);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const automRes = await api.get('/automation');
        setAutomations(automRes.data.reverse());
        
        const actRes = await api.get('/automation/activity');
        setActivities(actRes.data || []);

        await fetchGlobalSettings();
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this automation?')) return;
    try {
      await api.delete(`/automation/${id}`);
      setAutomations(prev => prev.filter(a => a._id !== id));
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Failed to delete automation.');
    }
  };
  
  const handleToggleStatus = async (automation) => {
    try {
      const newStatus = !automation.isActive;
      await api.put(`/automation/${automation._id}`, { isActive: newStatus });
      setAutomations(prev => prev.map(a => a._id === automation._id ? { ...a, isActive: newStatus } : a));
    } catch (error) {
      console.error('Failed to toggle status:', error);
      alert('Failed to update automation status.');
    }
  };

  const getTriggerText = (a) => {
    const triggerNode = a.nodes?.find(n => n.type === 'triggerNode');
    if (!triggerNode) return 'Not set';
    const tt = triggerNode.data?.triggerType;
    if (tt === 'fallback') return 'Fallback';
    if (tt === 'qr_link') return 'QR / Link';
    if (tt === 'whatsapp_ad') return 'WhatsApp Ad';
    if (tt === 'new_contact') return 'New Opt-in';
    return triggerNode.data?.keyword || 'Not set';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    const d = new Date(dateString);
    const day = d.getDate();
    const month = d.toLocaleString('en-GB', { month: 'short' });
    const year = d.getFullYear();
    const time = d.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();
    return `${day} ${month}, ${year} ${time}`;
  };

  const filtered = automations.filter(a => {
    if (searchQuery && !a.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ padding: '32px 48px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'Outfit, sans-serif', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Header matching Figma */}
      <div style={{ marginBottom: '24px' }}>
        {onBack && (
          <div onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: '#6B7280', marginBottom: '16px', fontSize: '14px', fontWeight: '500' }}>
            <ChevronLeft size={16} /> Back to Hub
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', margin: '0 0 4px 0' }}>Automations</h1>
            <p style={{ color: '#6B7280', margin: 0, fontSize: '14px' }}>Manage and monitor your AI-powered messaging workflows across all channels.</p>
          </div>
        <button 
          onClick={onCreateAutomation}
          style={{ 
            background: '#10B981', color: 'white', border: 'none', 
            padding: '12px 20px', borderRadius: '8px', fontSize: '14px', 
            fontWeight: '600', cursor: 'pointer', display: 'flex', 
            alignItems: 'center', gap: '8px', transition: 'background 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#059669'}
          onMouseOut={(e) => e.currentTarget.style.background = '#10B981'}
        >
          <Plus size={18} /> Create New Automation
        </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
        <button 
          onClick={() => setActiveTab('automations')}
          style={{ 
            background: 'none', border: 'none', padding: '0 0 8px 0', 
            fontSize: '15px', fontWeight: '600', cursor: 'pointer',
            color: activeTab === 'automations' ? '#111827' : '#9CA3AF',
            borderBottom: activeTab === 'automations' ? '2px solid #111827' : '2px solid transparent',
          }}
        >
          Automations List
        </button>
        <button 
          onClick={() => setActiveTab('activity')}
          style={{ 
            background: 'none', border: 'none', padding: '0 0 8px 0', 
            fontSize: '15px', fontWeight: '600', cursor: 'pointer',
            color: activeTab === 'activity' ? '#111827' : '#9CA3AF',
            borderBottom: activeTab === 'activity' ? '2px solid #111827' : '2px solid transparent',
          }}
        >
          Activity Log
        </button>
      </div>
      
      {activeTab === 'automations' ? (
        <>
          {/* Card Table Container */}
          <div style={{ background: '#FFFFFF', border: '1px solid #F3F4F6', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden', marginBottom: '40px' }}>
            <div style={{ width: '100%', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px' }}>
                <thead>
                  <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #F3F4F6' }}>
                    <th style={thStyle}>AUTOMATION NAME</th>
                    <th style={thStyle}>TRIGGER</th>
                    <th style={thStyle}>SUCCESS RATE</th>
                    <th style={thStyle}>MONTHLY USAGE</th>
                    <th style={thStyle}>STATUS</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan="6" style={{ padding: '48px', textAlign: 'center', color: '#9CA3AF' }}>Loading your automations...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ padding: '64px', textAlign: 'center', color: '#6B7280' }}>
                        No automations found. Create your first one to get started.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((automation, i) => {
                      const successRate = automation.successRate !== undefined ? automation.successRate : 0;
                      
                      return (
                        <tr key={automation._id || i} style={{ borderBottom: '1px solid #F3F4F6' }}>
                          
                          {/* AUTOMATION NAME */}
                          <td style={{ padding: '20px 24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                              <div style={{ width: '40px', height: '40px', background: '#F3F4F6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Zap size={20} color="#6B7280" />
                              </div>
                              <div>
                                <div 
                                  onClick={() => onEditAutomation(automation)}
                                  onMouseOver={(e) => e.currentTarget.style.color = '#3B82F6'}
                                  onMouseOut={(e) => e.currentTarget.style.color = '#111827'}
                                  style={{ fontSize: '15px', fontWeight: '600', color: '#111827', cursor: 'pointer', transition: 'color 0.2s' }}
                                >
                                  {automation.name || 'Untitled Automation'}
                                </div>
                                <div style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '2px' }}>
                                  ID: {automation._id?.substring(18) || 'N/A'}
                                </div>
                              </div>
                            </div>
                          </td>
                          
                          {/* TRIGGER */}
                          <td style={{ padding: '20px 24px' }}>
                            <span style={{ background: '#F3F4F6', color: '#4B5563', padding: '6px 12px', borderRadius: '100px', fontSize: '13px', fontWeight: '500' }}>
                              {getTriggerText(automation)}
                            </span>
                          </td>
                          
                          {/* SUCCESS RATE */}
                          <td style={{ padding: '20px 24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{ width: '60px', height: '6px', background: '#E5E7EB', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ width: `${successRate}%`, height: '100%', background: '#10B981', borderRadius: '3px' }} />
                              </div>
                              <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>{successRate}%</span>
                            </div>
                          </td>
                          
                          {/* MONTHLY USAGE */}
                          <td style={{ padding: '20px 24px' }}>
                            <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                              {automation.sessionStats ? automation.sessionStats.total : 0}
                            </span>
                          </td>
                          
                          {/* STATUS */}
                          <td style={{ padding: '20px 24px' }}>
                            <div 
                              onClick={() => handleToggleStatus(automation)}
                              style={{
                                width: '44px', height: '24px', borderRadius: '12px', cursor: 'pointer',
                                background: automation.isActive ? '#10B981' : '#D1D5DB',
                                position: 'relative', transition: 'background 0.3s'
                              }}
                            >
                              <div style={{
                                width: '20px', height: '20px', background: 'white', borderRadius: '50%',
                                position: 'absolute', top: '2px', left: automation.isActive ? '22px' : '2px',
                                transition: 'left 0.3s', boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                              }} />
                            </div>
                          </td>
                          
                          {/* ACTIONS */}
                          <td style={{ padding: '20px 24px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                              <button 
                                onClick={() => onEditAutomation(automation)}
                                style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}
                                onMouseOver={(e) => e.currentTarget.style.color = '#374151'}
                                onMouseOut={(e) => e.currentTarget.style.color = '#9CA3AF'}
                              >
                                <Edit3 size={18} />
                              </button>
                              <button 
                                onClick={() => handleDelete(automation._id)}
                                style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}
                                onMouseOver={(e) => e.currentTarget.style.color = '#EF4444'}
                                onMouseOut={(e) => e.currentTarget.style.color = '#9CA3AF'}
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                          
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Global Settings */}
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '20px' }}>Global Settings</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            
            {/* Setting Card 1 */}
            <div style={{ background: '#FFFFFF', border: '1px solid #F3F4F6', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div style={{ width: '48px', height: '48px', background: '#ECFDF5', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={24} color="#10B981" />
                </div>
                {globalSettings?.deliveryRules?.quietHoursEnabled ? (
                  <span style={{ background: '#ECFDF5', color: '#059669', fontSize: '12px', fontWeight: '600', padding: '4px 10px', borderRadius: '100px' }}>Quiet Hours Active</span>
                ) : (
                  <span style={{ background: '#F3F4F6', color: '#6B7280', fontSize: '12px', fontWeight: '600', padding: '4px 10px', borderRadius: '100px' }}>Off</span>
                )}
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: '0 0 12px 0' }}>Global Delivery Rules</h3>
              <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 24px 0', lineHeight: '1.5' }}>
                Set quiet hours and message frequency caps across all active automations.
              </p>
              <button onClick={() => setActiveModal('delivery')} style={{ color: '#10B981', fontSize: '14px', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Configure Rules →</button>
            </div>

            {/* Setting Card 2 */}
            <div style={{ background: '#FFFFFF', border: '1px solid #F3F4F6', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div style={{ width: '48px', height: '48px', background: '#ECFDF5', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Shield size={24} color="#10B981" />
                </div>
                {globalSettings?.spamProtection?.enabled ? (
                  <span style={{ background: '#ECFDF5', color: '#059669', fontSize: '12px', fontWeight: '600', padding: '4px 10px', borderRadius: '100px' }}>Protected</span>
                ) : (
                  <span style={{ background: '#F3F4F6', color: '#6B7280', fontSize: '12px', fontWeight: '600', padding: '4px 10px', borderRadius: '100px' }}>Disabled</span>
                )}
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: '0 0 12px 0' }}>Spam Protection</h3>
              <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 24px 0', lineHeight: '1.5' }}>
                Advanced AI filtering to detect and block malicious content and duplicate senders.
              </p>
              <button onClick={() => setActiveModal('spam')} style={{ color: '#10B981', fontSize: '14px', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Security Settings →</button>
            </div>

            {/* Setting Card 3 */}
            <div style={{ background: '#FFFFFF', border: '1px solid #F3F4F6', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div style={{ width: '48px', height: '48px', background: '#ECFDF5', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <RefreshCw size={24} color="#10B981" />
                </div>
                {globalSettings?.crmSync?.enabled ? (
                  <span style={{ background: '#ECFDF5', color: '#059669', fontSize: '12px', fontWeight: '600', padding: '4px 10px', borderRadius: '100px' }}>Syncing</span>
                ) : (
                  <span style={{ background: '#F3F4F6', color: '#6B7280', fontSize: '12px', fontWeight: '600', padding: '4px 10px', borderRadius: '100px' }}>Not Synced</span>
                )}
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: '0 0 12px 0' }}>CRM Sync</h3>
              <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 24px 0', lineHeight: '1.5' }}>
                Real-time data synchronization with HubSpot, Salesforce, and Zapier integrations.
              </p>
              <button onClick={() => setActiveModal('crm')} style={{ color: '#10B981', fontSize: '14px', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Manage Sync →</button>
            </div>

          </div>
        </>
      ) : (
        <div style={{ background: '#FFFFFF', border: '1px solid #F3F4F6', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px' }}>
              <thead>
                <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #F3F4F6' }}>
                  <th style={thStyle}>PHONE NUMBER</th>
                  <th style={thStyle}>FLOW NAME</th>
                  <th style={thStyle}>STATUS</th>
                  <th style={thStyle}>CHANNEL</th>
                  <th style={thStyle}>LAST INTERACTION</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan="5" style={{ padding: '48px', textAlign: 'center', color: '#9CA3AF' }}>Loading activity logs...</td></tr>
                ) : activities.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '64px', textAlign: 'center', color: '#6B7280' }}>
                      No recent activity found.
                    </td>
                  </tr>
                ) : (
                  activities.map((act, i) => (
                    <tr key={act._id || i} style={{ borderBottom: '1px solid #F3F4F6' }}>
                      <td style={{ padding: '20px 24px' }}>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                          {act.phone}
                        </div>
                      </td>
                      <td style={{ padding: '20px 24px' }}>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#4B5563' }}>
                          {act.activeFlowId?.name || 'Unknown Flow'}
                        </div>
                      </td>
                      <td style={{ padding: '20px 24px' }}>
                        <span style={{ 
                          display: 'inline-flex', padding: '4px 10px', borderRadius: '100px', fontSize: '12px', fontWeight: '600',
                          background: act.status === 'COMPLETED' ? '#ECFDF5' : act.status === 'ACTIVE' ? '#EFF6FF' : act.status === 'FAILED' ? '#FEF2F2' : '#F3F4F6',
                          color: act.status === 'COMPLETED' ? '#059669' : act.status === 'ACTIVE' ? '#2563EB' : act.status === 'FAILED' ? '#DC2626' : '#4B5563',
                        }}>
                          {act.status}
                        </span>
                      </td>
                      <td style={{ padding: '20px 24px' }}>
                        <span style={{ fontSize: '13px', color: '#6B7280' }}>
                          {act.channelId?.name || 'Unknown Channel'}
                        </span>
                      </td>
                      <td style={{ padding: '20px 24px' }}>
                        <span style={{ fontSize: '13px', color: '#6B7280' }}>
                          {formatDate(act.lastInteractionAt)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Render Modals */}
      {activeModal === 'delivery' && <DeliveryRulesModal onClose={() => { setActiveModal(null); fetchGlobalSettings(); }} />}
      {activeModal === 'spam' && <SpamProtectionModal onClose={() => { setActiveModal(null); fetchGlobalSettings(); }} />}
      {activeModal === 'crm' && <CrmSyncModal onClose={() => { setActiveModal(null); fetchGlobalSettings(); }} />}
    </div>
  );
}

const thStyle = { 
  padding: '16px 24px', fontSize: '12px', fontWeight: '600', 
  color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' 
};const actionBtnStyle = { 
  background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: 0,
  display: 'flex', alignItems: 'center', justifyContent: 'center'
};

