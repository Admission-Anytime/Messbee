import React, { useState, useEffect } from 'react';
import api from '../../context/axios';
import { X, Save } from 'lucide-react';
import { toast } from 'react-toastify';

const modalOverlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1000,
  display: 'flex', justifyContent: 'center', alignItems: 'center'
};

const modalContainerStyle = {
  background: '#ffffff', borderRadius: '12px', width: '500px', maxWidth: '90%',
  padding: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  fontFamily: 'Outfit, sans-serif'
};

const inputStyle = {
  width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB',
  borderRadius: '6px', fontSize: '14px', marginTop: '6px', marginBottom: '16px', boxSizing: 'border-box'
};

const labelStyle = { fontSize: '14px', fontWeight: '500', color: '#374151' };

const buttonStyle = {
  background: '#10B981', color: 'white', border: 'none', padding: '10px 20px',
  borderRadius: '6px', fontSize: '14px', fontWeight: '500', cursor: 'pointer',
  display: 'flex', alignItems: 'center', gap: '8px'
};

export const DeliveryRulesModal = ({ onClose }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rules, setRules] = useState({
    quietHoursEnabled: false, quietHoursStart: '22:00', quietHoursEnd: '08:00',
    maxMessagesPerMinute: 30, maxMessagesPerDay: 1000
  });

  useEffect(() => {
    api.get('/tenant-settings').then(res => {
      if (res.data && res.data.deliveryRules) {
        setRules(res.data.deliveryRules);
      }
      setLoading(false);
    }).catch(e => { console.error(e); setLoading(false); });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/tenant-settings', { deliveryRules: rules });
      toast.success('Delivery rules saved successfully');
      onClose();
    } catch (e) {
      console.error(e);
      alert('Failed to save rules');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContainerStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#111827' }}>Global Delivery Rules</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="#6B7280" /></button>
        </div>
        
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', cursor: 'pointer' }}>
            <input type="checkbox" checked={rules.quietHoursEnabled} onChange={e => setRules({...rules, quietHoursEnabled: e.target.checked})} style={{ width: '18px', height: '18px' }} />
            <span style={labelStyle}>Enable Quiet Hours (Stop messages during these times)</span>
          </label>
          
          {rules.quietHoursEnabled && (
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Start Time</label>
                <input type="time" style={inputStyle} value={rules.quietHoursStart} onChange={e => setRules({...rules, quietHoursStart: e.target.value})} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>End Time</label>
                <input type="time" style={inputStyle} value={rules.quietHoursEnd} onChange={e => setRules({...rules, quietHoursEnd: e.target.value})} />
              </div>
            </div>
          )}

          <hr style={{ border: 'none', borderTop: '1px solid #E5E7EB', margin: '20px 0' }} />

          <label style={labelStyle}>Max Messages Per Minute</label>
          <input type="number" style={inputStyle} value={rules.maxMessagesPerMinute} onChange={e => setRules({...rules, maxMessagesPerMinute: parseInt(e.target.value)})} />
          
          <label style={labelStyle}>Max Messages Per Day</label>
          <input type="number" style={inputStyle} value={rules.maxMessagesPerDay} onChange={e => setRules({...rules, maxMessagesPerDay: parseInt(e.target.value)})} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button onClick={handleSave} disabled={saving} style={{...buttonStyle, opacity: saving ? 0.7 : 1}}>
            <Save size={16} /> {saving ? 'Saving...' : 'Save Rules'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const SpamProtectionModal = ({ onClose }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [spam, setSpam] = useState({
    enabled: false, rateLimitWindowMs: 60000, maxMessagesPerWindow: 10, blocklist: ''
  });

  useEffect(() => {
    api.get('/tenant-settings').then(res => {
      if (res.data && res.data.spamProtection) {
        setSpam({
          ...res.data.spamProtection,
          blocklist: res.data.spamProtection.blocklist ? res.data.spamProtection.blocklist.join(', ') : ''
        });
      }
      setLoading(false);
    }).catch(e => { console.error(e); setLoading(false); });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const formattedList = spam.blocklist.split(',').map(n => n.trim()).filter(n => n);
      await api.put('/tenant-settings', { spamProtection: { ...spam, blocklist: formattedList } });
      toast.success('Security settings saved successfully');
      onClose();
    } catch (e) {
      console.error(e);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContainerStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#111827' }}>Spam Protection</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="#6B7280" /></button>
        </div>
        
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', cursor: 'pointer' }}>
            <input type="checkbox" checked={spam.enabled} onChange={e => setSpam({...spam, enabled: e.target.checked})} style={{ width: '18px', height: '18px' }} />
            <span style={labelStyle}>Enable Spam Protection (Block bad actors automatically)</span>
          </label>
          
          <label style={labelStyle}>Blocklist (Comma separated phone numbers with country code)</label>
          <textarea 
            style={{...inputStyle, minHeight: '100px', resize: 'vertical'}} 
            value={spam.blocklist} 
            onChange={e => setSpam({...spam, blocklist: e.target.value})}
            placeholder="+1234567890, +919876543210"
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button onClick={handleSave} disabled={saving} style={{...buttonStyle, opacity: saving ? 0.7 : 1}}>
            <Save size={16} /> {saving ? 'Saving...' : 'Save Security Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const CrmSyncModal = ({ onClose }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [crm, setCrm] = useState({
    enabled: false, provider: 'custom_webhook', webhookUrl: '', syncContacts: true
  });

  useEffect(() => {
    api.get('/tenant-settings').then(res => {
      if (res.data && res.data.crmSync) {
        setCrm(res.data.crmSync);
      }
      setLoading(false);
    }).catch(e => { console.error(e); setLoading(false); });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/tenant-settings', { crmSync: crm });
      toast.success('CRM settings saved successfully');
      onClose();
    } catch (e) {
      console.error(e);
      alert('Failed to save CRM settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContainerStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#111827' }}>CRM Sync (Webhook)</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="#6B7280" /></button>
        </div>
        
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', cursor: 'pointer' }}>
            <input type="checkbox" checked={crm.enabled} onChange={e => setCrm({...crm, enabled: e.target.checked})} style={{ width: '18px', height: '18px' }} />
            <span style={labelStyle}>Enable CRM Sync (Send data to Zapier/Pabbly/HubSpot)</span>
          </label>
          
          <label style={labelStyle}>Provider</label>
          <select style={inputStyle} value={crm.provider} onChange={e => setCrm({...crm, provider: e.target.value})}>
            <option value="custom_webhook">Custom Webhook (Zapier/Pabbly)</option>
            <option value="none" disabled>HubSpot (Coming Soon)</option>
            <option value="none" disabled>Salesforce (Coming Soon)</option>
          </select>
          
          <label style={labelStyle}>Webhook POST URL</label>
          <input 
            type="text" 
            style={inputStyle} 
            value={crm.webhookUrl} 
            onChange={e => setCrm({...crm, webhookUrl: e.target.value})}
            placeholder="https://hooks.zapier.com/hooks/catch/..."
          />
          <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '-10px' }}>
            We will send a POST request with the customer's phone, name, and collected variables when an automation flow finishes.
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button onClick={handleSave} disabled={saving} style={{...buttonStyle, opacity: saving ? 0.7 : 1}}>
            <Save size={16} /> {saving ? 'Saving...' : 'Save Sync Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const ChannelAssignmentModal = ({ onClose }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [channels, setChannels] = useState([]);
  const [selectedChannelId, setSelectedChannelId] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [channelsRes, settingsRes] = await Promise.all([
          api.get('/whatsapp/channels'),
          api.get('/tenant-settings')
        ]);
        setChannels(channelsRes.data || []);
        if (settingsRes.data && settingsRes.data.defaultChannelId) {
          setSelectedChannelId(settingsRes.data.defaultChannelId);
        } else if (channelsRes.data && channelsRes.data.length > 0) {
          setSelectedChannelId(channelsRes.data[0]._id);
        }
        setLoading(false);
      } catch (e) {
        console.error(e);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/tenant-settings', { defaultChannelId: selectedChannelId });
      toast.success('Default channel saved successfully');
      onClose();
    } catch (e) {
      console.error(e);
      alert('Failed to save default channel');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContainerStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#111827' }}>Default Channel Assignment</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="#6B7280" /></button>
        </div>
        
        <div>
          <label style={labelStyle}>Select Default WhatsApp Channel</label>
          <select style={inputStyle} value={selectedChannelId} onChange={e => setSelectedChannelId(e.target.value)}>
            <option value="" disabled>Select a channel</option>
            {channels.map(channel => (
              <option key={channel._id} value={channel._id}>
                {channel.name} ({channel.phoneNumber})
              </option>
            ))}
          </select>
          <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '-10px' }}>
            This channel will be automatically assigned to new automations and fallback messages.
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button onClick={handleSave} disabled={saving} style={{...buttonStyle, opacity: saving ? 0.7 : 1}}>
            <Save size={16} /> {saving ? 'Saving...' : 'Save Default Channel'}
          </button>
        </div>
      </div>
    </div>
  );
};

