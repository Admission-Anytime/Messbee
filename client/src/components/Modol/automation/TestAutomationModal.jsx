import React, { useState } from 'react';
import { X, Play, Smartphone } from 'lucide-react';

export default function TestAutomationModal({ onClose }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleTest = () => {
    if (!phoneNumber) return;
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setSuccess(true);
      setTimeout(onClose, 2000);
    }, 1500);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100, fontFamily: 'Outfit, sans-serif'
    }}>
      <div style={{
        background: 'white', width: '90%', maxWidth: '400px',
        borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{ padding: '24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6' }}>
              <Smartphone size={18} />
            </div>
            <span style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>Test Automation</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px' }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: '#10B981' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0', color: '#111827' }}>Test Triggered!</h3>
              <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>The first step of your automation was sent to {phoneNumber}.</p>
            </div>
          ) : (
            <>
              <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '20px' }}>
                Enter a WhatsApp number to instantly receive the first message of this automation.
              </p>
              
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Test WhatsApp Number</label>
                <div style={{ display: 'flex', border: '1px solid #D1D5DB', borderRadius: '8px', overflow: 'hidden' }}>
                  <span style={{ background: '#F3F4F6', padding: '10px 12px', borderRight: '1px solid #D1D5DB', color: '#6B7280', fontSize: '14px' }}>+</span>
                  <input 
                    type="text" 
                    value={phoneNumber} 
                    onChange={e => setPhoneNumber(e.target.value)}
                    placeholder="1234567890" 
                    style={{ flex: 1, padding: '10px 12px', border: 'none', outline: 'none', fontSize: '14px' }}
                    autoFocus
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button 
                  onClick={onClose}
                  style={{ background: 'white', color: '#374151', border: '1px solid #D1D5DB', padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleTest}
                  disabled={!phoneNumber || isSending}
                  style={{ background: '#3B82F6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: phoneNumber ? 'pointer' : 'not-allowed', opacity: phoneNumber ? 1 : 0.5, display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  {isSending ? 'Sending...' : <><Play size={14} /> Send Test</>}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
