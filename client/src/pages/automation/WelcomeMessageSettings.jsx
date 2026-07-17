import React, { useState, useEffect } from 'react';
import { ChevronLeft, Info } from 'lucide-react';
import api from '../../context/axios';

export default function WelcomeMessageSettings({ onBack }) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState(null);
  const [automations, setAutomations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showFlowSelector, setShowFlowSelector] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [settingsRes, automationsRes] = await Promise.all([
          api.get('/tenant-settings'),
          api.get('/automation')
        ]);
        
        const settings = settingsRes.data;
        if (settings?.welcomeMessage) {
          setIsEnabled(settings.welcomeMessage.enabled || false);
        }
        
        const autoData = automationsRes.data || [];
        setAutomations(autoData);
        
        if (settings?.welcomeMessage?.automationId) {
          const flow = autoData.find(a => a._id === settings.welcomeMessage.automationId);
          if (flow) {
            setSelectedFlow(flow);
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.put('/tenant-settings', {
        welcomeMessage: {
          enabled: isEnabled,
          automationId: selectedFlow ? selectedFlow._id : null
        }
      });
      alert('Welcome Message settings saved successfully.');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', fontFamily: 'Outfit, sans-serif' }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 48px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Outfit, sans-serif', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <button 
            onClick={onBack}
            style={{
              width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'white', border: '1px solid #E5E7EB', borderRadius: '8px', cursor: 'pointer',
              color: '#374151', flexShrink: 0
            }}
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0 0 8px 0' }}>Welcome Message</h1>
            <p style={{ color: '#6B7280', margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
              Greet new customers the moment they first message you — automatically, every single time.
            </p>
          </div>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          style={{
            background: '#1E293B', color: 'white', border: 'none', padding: '10px 16px',
            borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
            opacity: isSaving ? 0.7 : 1
          }}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Enable Toggle Card */}
      <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '24px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>Enable Welcome Message</h3>
          <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>Activate or deactivate the automatic greeting for new customers.</p>
        </div>
        
        {/* Toggle Switch */}
        <div 
          onClick={() => setIsEnabled(!isEnabled)}
          style={{
            width: '44px', height: '24px', background: isEnabled ? '#10B981' : '#E5E7EB',
            borderRadius: '100px', position: 'relative', cursor: 'pointer', transition: 'background 0.2s'
          }}
        >
          <div style={{
            width: '20px', height: '20px', background: 'white', borderRadius: '50%',
            position: 'absolute', top: '2px', left: isEnabled ? '22px' : '2px',
            transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}></div>
        </div>
      </div>

      {/* Set Message Card */}
      <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '24px', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>Set Welcome Message</h3>
        <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 20px 0' }}>Choose a message flow to be sent. You can use text, media, or interactive messages.</p>
        
        <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '600', color: '#6B7280', letterSpacing: '0.05em', marginBottom: '4px' }}>SELECTED MESSAGE FLOW</div>
            <div style={{ fontSize: '15px', fontWeight: '500', color: '#111827' }}>
              {selectedFlow ? selectedFlow.name : 'No flow selected'}
            </div>
          </div>
          <button 
            onClick={() => setShowFlowSelector(true)}
            style={{
              background: 'white', border: '1px solid #E5E7EB', padding: '8px 16px',
              borderRadius: '6px', fontSize: '13px', fontWeight: '600', color: '#374151',
              cursor: 'pointer'
            }}
          >
            Select New Message
          </button>
        </div>
        
        {/* Simple inline dropdown to select flow if showFlowSelector is true */}
        {showFlowSelector && (
          <div style={{ marginTop: '16px', borderTop: '1px solid #E5E7EB', paddingTop: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Available Flows:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
              {automations.length === 0 ? (
                <div style={{ fontSize: '13px', color: '#6B7280' }}>No flows available. Please create one in the Automation builder.</div>
              ) : (
                automations.map(flow => (
                  <div 
                    key={flow._id}
                    onClick={() => {
                      setSelectedFlow(flow);
                      setShowFlowSelector(false);
                    }}
                    style={{
                      padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: '6px',
                      cursor: 'pointer', fontSize: '14px', background: selectedFlow?._id === flow._id ? '#ECFDF5' : 'white',
                      borderColor: selectedFlow?._id === flow._id ? '#10B981' : '#E5E7EB'
                    }}
                  >
                    {flow.name}
                  </div>
                ))
              )}
              <button 
                onClick={() => setShowFlowSelector(false)}
                style={{ marginTop: '8px', background: 'transparent', border: 'none', color: '#6B7280', fontSize: '13px', cursor: 'pointer', textAlign: 'left' }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tip Box */}
      <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '8px', padding: '16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <Info size={20} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
        <p style={{ fontSize: '14px', color: '#065F46', margin: 0, lineHeight: '1.5' }}>
          <strong style={{ fontWeight: '600' }}>Tip:</strong> You can create complex flows in the Chatbot Builder and link them here as a welcome greeting.
        </p>
      </div>

    </div>
  );
}
