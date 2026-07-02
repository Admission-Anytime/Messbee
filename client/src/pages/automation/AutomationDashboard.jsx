import React, { useState, useEffect } from 'react';
import api from '../../api';
import { 
  Plus, Search, MoreVertical, LinkIcon, QrCode, Smartphone, ChevronLeft, Settings,
  MessageCircle, Trash2, Edit3, List, Minus, Activity, Shield, Workflow, Eye, Zap
} from 'lucide-react';

export default function AutomationDashboard({ onCreateAutomation, onEditAutomation, onBack }) {
  const [automations, setAutomations] = useState([]);
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('automations');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const automRes = await api.get('/automations');
        setAutomations(automRes.data.reverse());
        
        const actRes = await api.get('/automations/activity');
        setActivities(actRes.data || []);
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
      await api.delete(`/automations/${id}`);
      setAutomations(prev => prev.filter(a => a._id !== id));
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Failed to delete automation.');
    }
  };

  const getTriggerText = (a) => {
    const triggerNode = a.nodes?.find(n => n.type === 'triggerNode');
    if (!triggerNode) return 'Not set';
    const tt = triggerNode.data?.triggerType;
    if (tt === 'fallback') return 'Fallback';
    if (tt === 'qr_link') return 'QR / Link';
    if (tt === 'whatsapp_ad') return 'WhatsApp Ad';
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

  const getTotalExecutions = (automation) => {
    if (!automation.nodeStats) return 0;
    const triggerNode = automation.nodes?.find(n => n.type === 'triggerNode');
    if (triggerNode && automation.nodeStats[triggerNode.id]) {
      return automation.nodeStats[triggerNode.id];
    }
    // Fallback sum
    let sum = 0;
    for (const key in automation.nodeStats) {
      if (typeof automation.nodeStats[key] === 'number') sum += automation.nodeStats[key];
    }
    return sum;
  };

  const filtered = automations.filter(a => {
    if (searchQuery && !a.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ padding: '40px 48px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'Outfit, sans-serif', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 0, display: 'flex' }}>
              <ChevronLeft size={20} />
            </button>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: 0 }}>Automations</h1>
          </div>
          <p style={{ color: '#6B7280', margin: '0 0 0 28px', fontSize: '14px' }}>Drive your business forward with reliable chatbot automations.</p>
        </div>
        <button 
          onClick={onCreateAutomation}
          style={{ 
            background: '#10B981', color: 'white', border: 'none', 
            padding: '10px 20px', borderRadius: '8px', fontSize: '14px', 
            fontWeight: '600', cursor: 'pointer', display: 'flex', 
            alignItems: 'center', gap: '8px', transition: 'background 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#059669'}
          onMouseOut={(e) => e.currentTarget.style.background = '#10B981'}
        >
          <Plus size={16} /> New automation
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid #E5E7EB', marginBottom: '24px' }}>
        <button 
          onClick={() => setActiveTab('automations')}
          style={{ 
            background: 'none', border: 'none', padding: '0 0 12px 0', 
            fontSize: '14px', fontWeight: '600', cursor: 'pointer',
            color: activeTab === 'automations' ? '#111827' : '#6B7280',
            borderBottom: activeTab === 'automations' ? '2px solid #111827' : '2px solid transparent',
          }}
        >
          Automations
        </button>
        <button 
          onClick={() => setActiveTab('activity')}
          style={{ 
            background: 'none', border: 'none', padding: '0 0 12px 0', 
            fontSize: '14px', fontWeight: '600', cursor: 'pointer',
            color: activeTab === 'activity' ? '#111827' : '#6B7280',
            borderBottom: activeTab === 'activity' ? '2px solid #111827' : '2px solid transparent',
          }}
        >
          Activity Log
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ position: 'relative', marginBottom: '24px' }}>
        <Search size={16} color="#9CA3AF" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
        <input 
          type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search automations..." 
          style={{ 
            padding: '10px 12px 10px 36px', border: '1px solid #E5E7EB', borderRadius: '8px', 
            fontSize: '14px', outline: 'none', width: '300px', background: '#F9FAFB'
          }} 
        />
      </div>

      {activeTab === 'automations' ? (
        <div style={{ width: '100%', overflowX: 'auto' }}>
          {/* Automations Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                <th style={thStyle}>NAME</th>
                <th style={thStyle}>LAST EDITED</th>
                <th style={thStyle}>STATUS</th>
                <th style={thStyle}>TRIGGERS</th>
                <th style={thStyle}>EXECUTIONS</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>ACTIONS</th>
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
                  return (
                    <tr key={automation._id || i} style={{ borderBottom: '1px solid #F3F4F6' }}>
                      
                      {/* NAME */}
                      <td style={{ padding: '16px 12px 16px 0' }}>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827', marginBottom: '4px' }}>
                          {automation.name || 'Untitled Automation'}
                        </div>
                        <div style={{ fontSize: '11px', color: '#6B7280' }}>
                          ID: {automation._id?.substring(18) || 'N/A'}
                        </div>
                      </td>
                      
                      {/* LAST EDITED */}
                      <td style={{ padding: '16px 12px' }}>
                        <span style={{ fontSize: '13px', color: '#6B7280' }}>{formatDate(automation.updatedAt)}</span>
                      </td>
                      
                      {/* STATUS */}
                      <td style={{ padding: '16px 12px' }}>
                        {automation.isActive ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#ECFDF5', color: '#059669', padding: '4px 10px', borderRadius: '100px', fontSize: '12px', fontWeight: '600' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} /> Active
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#F3F4F6', color: '#6B7280', padding: '4px 10px', borderRadius: '100px', fontSize: '12px', fontWeight: '600' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#9CA3AF' }} /> Draft
                          </span>
                        )}
                      </td>
                      
                      {/* TRIGGERS */}
                      <td style={{ padding: '16px 12px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#EFF6FF', color: '#2563EB', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '500', border: '1px solid #BFDBFE' }}>
                          <Zap size={14} /> {getTriggerText(automation)}
                        </div>
                      </td>

                      {/* EXECUTIONS */}
                      <td style={{ padding: '16px 12px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>
                          {getTotalExecutions(automation)}
                        </span>
                      </td>
                      
                      {/* ACTIONS */}
                      <td style={{ padding: '16px 0 16px 12px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '16px' }}>
                          <button 
                            onClick={() => onEditAutomation(automation)}
                            style={{ background: 'none', border: 'none', color: '#3B82F6', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Edit3 size={14} /> Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(automation._id)}
                            style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Trash2 size={14} /> Delete
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
      ) : (
        <div style={{ width: '100%', overflowX: 'auto' }}>
          {/* Activity Log Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
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
                    <td style={{ padding: '16px 12px 16px 0' }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                        {act.phone}
                      </div>
                    </td>
                    <td style={{ padding: '16px 12px' }}>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#4B5563' }}>
                        {act.activeFlowId?.name || 'Unknown Flow'}
                      </div>
                    </td>
                    <td style={{ padding: '16px 12px' }}>
                      <span style={{ 
                        display: 'inline-flex', padding: '4px 10px', borderRadius: '100px', fontSize: '12px', fontWeight: '600',
                        background: act.status === 'COMPLETED' ? '#ECFDF5' : act.status === 'ACTIVE' ? '#EFF6FF' : act.status === 'FAILED' ? '#FEF2F2' : '#F3F4F6',
                        color: act.status === 'COMPLETED' ? '#059669' : act.status === 'ACTIVE' ? '#2563EB' : act.status === 'FAILED' ? '#DC2626' : '#4B5563',
                      }}>
                        {act.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 12px' }}>
                      <span style={{ fontSize: '13px', color: '#6B7280' }}>
                        {act.channelId?.name || 'Unknown Channel'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 12px' }}>
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
      )}

    </div>
  );
}

const thStyle = { 
  padding: '12px 12px 12px 0', fontSize: '11px', fontWeight: '700', 
  color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' 
};

const actionBtnStyle = { 
  background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: 0,
  display: 'flex', alignItems: 'center', justifyContent: 'center'
};

