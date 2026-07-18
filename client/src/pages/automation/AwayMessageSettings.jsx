import React, { useState, useEffect } from 'react';
import { ChevronLeft, Info, Settings } from 'lucide-react';
import api from '../../context/axios';

export default function AwayMessageSettings({ onBack }) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [holidayMode, setHolidayMode] = useState(false);
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [selectedFlow, setSelectedFlow] = useState(null);
  
  const [workingHours, setWorkingHours] = useState({
    monday: { isOpen: true, open: '09:00', close: '17:00' },
    tuesday: { isOpen: true, open: '09:00', close: '17:00' },
    wednesday: { isOpen: true, open: '09:00', close: '17:00' },
    thursday: { isOpen: true, open: '09:00', close: '17:00' },
    friday: { isOpen: true, open: '09:00', close: '17:00' },
    saturday: { isOpen: false, open: '09:00', close: '17:00' },
    sunday: { isOpen: false, open: '09:00', close: '17:00' },
  });

  const [automations, setAutomations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showFlowSelector, setShowFlowSelector] = useState(false);
  const [showHoursConfig, setShowHoursConfig] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [settingsRes, automationsRes] = await Promise.all([
          api.get('/tenant-settings'),
          api.get('/automation')
        ]);
        
        const settings = settingsRes.data;
        if (settings?.awayMessage) {
          setIsEnabled(settings.awayMessage.enabled || false);
          setHolidayMode(settings.awayMessage.holidayMode || false);
          setTimezone(settings.awayMessage.timezone || 'Asia/Kolkata');
          
          if (settings.awayMessage.workingHours && Object.keys(settings.awayMessage.workingHours).length > 0) {
            setWorkingHours(settings.awayMessage.workingHours);
          }
        }
        
        const autoData = automationsRes.data || [];
        setAutomations(autoData);
        
        if (settings?.awayMessage?.automationId) {
          const flow = autoData.find(a => a._id === settings.awayMessage.automationId);
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
        awayMessage: {
          enabled: isEnabled,
          timezone,
          holidayMode,
          workingHours,
          automationId: selectedFlow ? selectedFlow._id : null
        }
      });
      alert('Away Message settings saved successfully.');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleHourChange = (day, field, value) => {
    setWorkingHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', fontFamily: 'Outfit, sans-serif' }}>
        <p>Loading...</p>
      </div>
    );
  }

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  const timezones = [
    { value: 'Pacific/Midway', label: '(GMT -11:00) Midway Island, Samoa' },
    { value: 'Pacific/Honolulu', label: '(GMT -10:00) Hawaii' },
    { value: 'America/Anchorage', label: '(GMT -09:00) Alaska' },
    { value: 'America/Los_Angeles', label: '(GMT -08:00) Pacific Time (US & Canada)' },
    { value: 'America/Denver', label: '(GMT -07:00) Mountain Time (US & Canada)' },
    { value: 'America/Chicago', label: '(GMT -06:00) Central Time (US & Canada)' },
    { value: 'America/New_York', label: '(GMT -05:00) Eastern Time (US & Canada)' },
    { value: 'America/Caracas', label: '(GMT -04:30) Caracas' },
    { value: 'America/Halifax', label: '(GMT -04:00) Atlantic Time (Canada)' },
    { value: 'America/St_Johns', label: '(GMT -03:30) Newfoundland' },
    { value: 'America/Argentina/Buenos_Aires', label: '(GMT -03:00) Buenos Aires' },
    { value: 'America/Sao_Paulo', label: '(GMT -03:00) Brasilia' },
    { value: 'Atlantic/South_Georgia', label: '(GMT -02:00) Mid-Atlantic' },
    { value: 'Atlantic/Azores', label: '(GMT -01:00) Azores' },
    { value: 'UTC', label: '(GMT +00:00) UTC' },
    { value: 'Europe/London', label: '(GMT +00:00) London, Edinburgh, Dublin, Lisbon' },
    { value: 'Europe/Paris', label: '(GMT +01:00) Paris, Madrid, Berlin, Rome' },
    { value: 'Europe/Athens', label: '(GMT +02:00) Athens, Istanbul, Minsk' },
    { value: 'Africa/Cairo', label: '(GMT +02:00) Cairo' },
    { value: 'Europe/Moscow', label: '(GMT +03:00) Moscow, St. Petersburg, Volgograd' },
    { value: 'Asia/Dubai', label: '(GMT +04:00) Abu Dhabi, Muscat' },
    { value: 'Asia/Kabul', label: '(GMT +04:30) Kabul' },
    { value: 'Asia/Karachi', label: '(GMT +05:00) Islamabad, Karachi, Tashkent' },
    { value: 'Asia/Kolkata', label: '(GMT +05:30) Chennai, Kolkata, Mumbai, New Delhi' },
    { value: 'Asia/Kathmandu', label: '(GMT +05:45) Kathmandu' },
    { value: 'Asia/Dhaka', label: '(GMT +06:00) Astana, Dhaka' },
    { value: 'Asia/Rangoon', label: '(GMT +06:30) Yangon (Rangoon)' },
    { value: 'Asia/Bangkok', label: '(GMT +07:00) Bangkok, Hanoi, Jakarta' },
    { value: 'Asia/Hong_Kong', label: '(GMT +08:00) Beijing, Chongqing, Hong Kong, Urumqi' },
    { value: 'Asia/Tokyo', label: '(GMT +09:00) Osaka, Sapporo, Tokyo' },
    { value: 'Australia/Adelaide', label: '(GMT +09:30) Adelaide' },
    { value: 'Australia/Sydney', label: '(GMT +10:00) Canberra, Melbourne, Sydney' },
    { value: 'Asia/Magadan', label: '(GMT +11:00) Magadan, Solomon Is., New Caledonia' },
    { value: 'Pacific/Auckland', label: '(GMT +12:00) Auckland, Wellington' },
    { value: 'Pacific/Tongatapu', label: '(GMT +13:00) Nuku\'alofa' }
  ];

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
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0 0 8px 0' }}>Away Message</h1>
            <p style={{ color: '#6B7280', margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
              Auto-reply when your team is unavailable or outside your set business hours.
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
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>Enable Away Message</h3>
          <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>Activate automatic responses during non-working hours.</p>
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

      {/* Business Hours Card */}
      <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '24px', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>Business Hours & Timezone</h3>
        
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>System Timezone</label>
          <select 
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '14px', outline: 'none', background: '#F9FAFB' }}
          >
            {timezones.map(tz => (
              <option key={tz.value} value={tz.value}>{tz.label}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #E5E7EB' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>Working Hours</label>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 12px 0' }}>Define your active days and time slots.</p>
          <button 
            onClick={() => setShowHoursConfig(!showHoursConfig)}
            style={{ background: 'white', border: '1px solid #E5E7EB', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', color: '#374151', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Settings size={14} /> Configure Hours
          </button>
          
          {showHoursConfig && (
            <div style={{ marginTop: '16px', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '16px' }}>
              {daysOfWeek.map(day => (
                <div key={day} style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', gap: '16px' }}>
                  <div style={{ width: '100px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input 
                      type="checkbox" 
                      checked={workingHours[day]?.isOpen || false} 
                      onChange={(e) => handleHourChange(day, 'isOpen', e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '14px', textTransform: 'capitalize', color: '#374151' }}>{day}</span>
                  </div>
                  
                  {workingHours[day]?.isOpen ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input 
                        type="time" 
                        value={workingHours[day]?.open || '09:00'}
                        onChange={(e) => handleHourChange(day, 'open', e.target.value)}
                        style={{ padding: '6px', border: '1px solid #E5E7EB', borderRadius: '4px', fontSize: '13px' }}
                      />
                      <span style={{ fontSize: '13px', color: '#6B7280' }}>to</span>
                      <input 
                        type="time" 
                        value={workingHours[day]?.close || '17:00'}
                        onChange={(e) => handleHourChange(day, 'close', e.target.value)}
                        style={{ padding: '6px', border: '1px solid #E5E7EB', borderRadius: '4px', fontSize: '13px' }}
                      />
                    </div>
                  ) : (
                    <span style={{ fontSize: '13px', color: '#9CA3AF', fontStyle: 'italic' }}>Closed</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>Holiday Mode</h4>
            <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>Force away message for all incoming chats.</p>
          </div>
          <div 
            onClick={() => setHolidayMode(!holidayMode)}
            style={{
              width: '40px', height: '22px', background: holidayMode ? '#10B981' : '#E5E7EB',
              borderRadius: '100px', position: 'relative', cursor: 'pointer', transition: 'background 0.2s'
            }}
          >
            <div style={{
              width: '18px', height: '18px', background: 'white', borderRadius: '50%',
              position: 'absolute', top: '2px', left: holidayMode ? '20px' : '2px',
              transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}></div>
          </div>
        </div>
      </div>

      {/* Set Message Card */}
      <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '24px', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>Set Away Message</h3>
        <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 20px 0' }}>Choose the message flow to be sent when you are away.</p>
        
        <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '600', color: '#6B7280', letterSpacing: '0.05em', marginBottom: '4px' }}>SELECTED MESSAGE FLOW</div>
            <div style={{ fontSize: '15px', fontWeight: '500', color: '#111827' }}>
              {selectedFlow ? selectedFlow.name : 'Select flow'}
            </div>
          </div>
          <button 
            onClick={() => setShowFlowSelector(!showFlowSelector)}
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
          <strong style={{ fontWeight: '600' }}>Tip:</strong> Set a polite away message and mention when your team will be back to manage expectations.
        </p>
      </div>

    </div>
  );
}
