import React, { useState } from 'react';
import { X, Zap, ArrowRight, Bot, Briefcase, CheckCircle2 } from 'lucide-react';

const TRIGGER_OPTIONS = [
  { value: 'KEYWORD_MATCH', label: 'Keyword Match' },
  { value: 'TAG_ADDED', label: 'Tag Added' },
  { value: 'FIELD_UPDATED', label: 'Field Updated' },
  { value: 'NEW_CONTACT', label: 'New Contact' },
  { value: 'API_EVENT', label: 'API Event' }
];

const ACTION_OPTIONS = [
  { value: 'add_tag', label: 'Add Tag' },
  { value: 'remove_tag', label: 'Remove Tag' },
  { value: 'update_field', label: 'Update Field' },
  { value: 'human_handoff', label: 'Human Handoff' },
  { value: 'send_message', label: 'Send Message' }
];

export default function CreateAutomationModal({ onClose, onCreate }) {
  const [name, setName] = useState('');
  const [trigger, setTrigger] = useState('');
  const [action, setAction] = useState('');
  const [aiProfile, setAiProfile] = useState('support');

  const handleCreate = () => {
    if (!name.trim()) {
      alert('Please enter an automation name.');
      return;
    }
    onCreate({
      name: name.trim(),
      triggerType: trigger || 'NEW_CONTACT',
      action: action,
      profile: aiProfile
    });
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100, fontFamily: 'Inter, Outfit, sans-serif'
    }}>
      <div style={{
        background: 'white', width: '90%', maxWidth: '460px',
        borderRadius: '12px', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.2)',
        padding: '24px', position: 'relative'
      }}>
        {/* Close Button */}
        <button onClick={onClose} style={{
          position: 'absolute', top: '20px', right: '20px',
          background: 'transparent', border: 'none', color: '#9CA3AF',
          cursor: 'pointer', display: 'flex', padding: '4px',
          transition: 'color 0.2s'
        }}
        onMouseOver={e => e.currentTarget.style.color = '#4B5563'}
        onMouseOut={e => e.currentTarget.style.color = '#9CA3AF'}
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ margin: '0 0 6px 0', fontSize: '20px', fontWeight: '700', color: '#111827' }}>
            Create New Automation
          </h2>
          <p style={{ margin: 0, color: '#6B7280', fontSize: '13px' }}>
            Set up automated workflows to engage your customers.
          </p>
        </div>

        {/* Automation Name */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
            Automation Name
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g., Welcome Message Sequence"
            style={{
              width: '100%', padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: '8px',
              fontSize: '13px', color: '#111827', outline: 'none', boxSizing: 'border-box',
              transition: 'border-color 0.2s, box-shadow 0.2s'
            }}
            onFocus={e => { e.target.style.borderColor = '#10B981'; e.target.style.boxShadow = '0 0 0 2px rgba(16, 185, 129, 0.1)'; }}
            onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; }}
          />
        </div>

        {/* Trigger and Action */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
              <Zap size={14} color="#10B981" /> Trigger
            </label>
            <select
              value={trigger}
              onChange={e => setTrigger(e.target.value)}
              style={{
                width: '100%', padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: '8px',
                fontSize: '13px', color: '#111827', outline: 'none', boxSizing: 'border-box',
                backgroundColor: 'white', appearance: 'none', cursor: 'pointer',
                transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = '#10B981'}
              onBlur={e => e.target.style.borderColor = '#E5E7EB'}
            >
              <option value="" disabled hidden></option>
              {TRIGGER_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <div style={{ position: 'absolute', right: '12px', top: '38px', pointerEvents: 'none' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
          </div>
          <div style={{ flex: 1, position: 'relative' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
              <ArrowRight size={14} color="#10B981" /> Action
            </label>
            <select
              value={action}
              onChange={e => setAction(e.target.value)}
              style={{
                width: '100%', padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: '8px',
                fontSize: '13px', color: '#111827', outline: 'none', boxSizing: 'border-box',
                backgroundColor: 'white', appearance: 'none', cursor: 'pointer',
                transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = '#10B981'}
              onBlur={e => e.target.style.borderColor = '#E5E7EB'}
            >
              <option value="" disabled hidden></option>
              {ACTION_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <div style={{ position: 'absolute', right: '12px', top: '38px', pointerEvents: 'none' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
          </div>
        </div>

        {/* Configuration Box */}
        <div style={{ background: '#F9FAFB', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
          <div style={{ fontSize: '10px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
            CONFIGURATION
          </div>
          <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
            Select AI Agent Profile
          </div>

          {/* Card 1: Support Pro */}
          <div 
            onClick={() => setAiProfile('support')}
            style={{
              display: 'flex', alignItems: 'center', padding: '12px 16px', borderRadius: '10px',
              border: aiProfile === 'support' ? '2px solid #10B981' : '1px solid #E5E7EB',
              background: aiProfile === 'support' ? '#F0FDF4' : 'white',
              cursor: 'pointer', marginBottom: '10px', transition: 'all 0.2s',
              boxSizing: 'border-box'
            }}
          >
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%', background: '#10B981',
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px'
            }}>
              <Bot size={18} color="white" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '2px' }}>
                Customer Support Pro
              </div>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>
                Trained on knowledge base & FAQs
              </div>
            </div>
            {aiProfile === 'support' && <div style={{ background: 'white', borderRadius: '50%', display: 'flex' }}><CheckCircle2 size={20} color="#10B981" /></div>}
          </div>

          {/* Card 2: Sales Assistant */}
          <div 
            onClick={() => setAiProfile('sales')}
            style={{
              display: 'flex', alignItems: 'center', padding: '12px 16px', borderRadius: '10px',
              border: aiProfile === 'sales' ? '2px solid #10B981' : '1px solid #E5E7EB',
              background: aiProfile === 'sales' ? '#F0FDF4' : 'white',
              cursor: 'pointer', marginBottom: '16px', transition: 'all 0.2s',
              boxSizing: 'border-box'
            }}
          >
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%', background: '#F3F4F6',
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px'
            }}>
              <Briefcase size={18} color="#374151" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '2px' }}>
                Sales Assistant
              </div>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>
                Optimized for lead conversion
              </div>
            </div>
            {aiProfile === 'sales' && <div style={{ background: 'white', borderRadius: '50%', display: 'flex' }}><CheckCircle2 size={20} color="#10B981" /></div>}
          </div>

          <div style={{ fontSize: '12px', color: '#4B5563', fontWeight: '500', display: 'flex', alignItems: 'center', paddingLeft: '4px' }}>
            Notify agent if AI sentiment is negative
          </div>
        </div>

        {/* Footer Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', alignItems: 'center' }}>
          <button onClick={onClose} style={{
            background: 'transparent', border: 'none', color: '#4B5563', fontSize: '13px',
            fontWeight: '600', cursor: 'pointer', padding: '10px 20px', transition: 'color 0.2s'
          }}
          onMouseOver={e => e.currentTarget.style.color = '#111827'}
          onMouseOut={e => e.currentTarget.style.color = '#4B5563'}
          >
            Cancel
          </button>
          <button onClick={handleCreate} style={{
            background: '#10B981', color: 'white', border: 'none', borderRadius: '8px',
            fontSize: '13px', fontWeight: '600', cursor: 'pointer', padding: '10px 20px',
            boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)', transition: 'background 0.2s'
          }}
          onMouseOver={e => e.currentTarget.style.background = '#059669'}
          onMouseOut={e => e.currentTarget.style.background = '#10B981'}
          >
            Create Automation
          </button>
        </div>
      </div>
    </div>
  );
}


