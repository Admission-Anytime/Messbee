import React, { useState, useEffect } from 'react';
import { X, MessageCircle } from 'lucide-react';
import api from '../../api';

export default function AssignChannelsModal({ onClose, currentChannelId, onAssign }) {
  const [selectedChannel, setSelectedChannel] = useState(currentChannelId || '');
  const [channels, setChannels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const res = await api.get('/channels');
        setChannels(res.data);
      } catch (err) {
        console.error('Failed to fetch channels:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchChannels();
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      fontFamily: 'Outfit, sans-serif'
    }}>
      <div style={{
        background: 'white',
        width: '100%',
        maxWidth: '480px',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden'
      }}>
        
        {/* Dark Header */}
        <div style={{ 
          background: '#0B1120', 
          padding: '24px 32px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start' 
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: 'white' }}>Assign WhatsApp Number</h2>
            <p style={{ margin: '6px 0 0', color: '#9CA3AF', fontSize: '14px' }}>Choose channels to enable this automation</p>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255, 255, 255, 0.1)', 
            border: 'none', 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: 'white',
            width: '32px',
            height: '32px',
            borderRadius: '50%'
          }}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '32px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {isLoading ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#6B7280', fontSize: '14px' }}>Loading channels...</div>
            ) : channels.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#6B7280', fontSize: '14px' }}>No channels connected. Please connect a WhatsApp number in settings.</div>
            ) : channels.map((channel) => (
              <label 
                key={channel._id}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '16px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ background: '#25D366', color: 'white', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MessageCircle size={20} fill="currentColor" strokeWidth={0} />
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#111827' }}>{channel.name}</div>
                    <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '2px' }}>{channel.phoneNumber}</div>
                  </div>
                </div>
                
                <input 
                  type="radio" 
                  name="channel" 
                  value={channel._id}
                  checked={selectedChannel === channel._id}
                  onChange={() => setSelectedChannel(channel._id)}
                  style={{ width: '20px', height: '20px', accentColor: '#0B1120', cursor: 'pointer' }}
                />
              </label>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ padding: '24px 32px', borderTop: '1px solid #F3F4F6', display: 'flex', gap: '16px' }}>
          <button onClick={onClose} style={{
            flex: 1,
            background: 'white',
            border: '1px solid #E5E7EB',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: '600',
            color: '#374151',
            cursor: 'pointer'
          }}>
            Cancel
          </button>
          <button 
            onClick={() => {
              if (selectedChannel && onAssign) onAssign(selectedChannel);
              onClose();
            }} 
            disabled={!selectedChannel}
            style={{
            flex: 1,
            background: selectedChannel ? '#0B1120' : '#D1D5DB',
            border: 'none',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: '600',
            color: 'white',
            cursor: selectedChannel ? 'pointer' : 'not-allowed'
          }}>
            Update Assignment
          </button>
        </div>
      </div>
    </div>
  );
}
