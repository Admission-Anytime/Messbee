import React, { useState } from 'react';
import { X, MessageSquare, Link, ClipboardList, Sparkles, Zap, Lightbulb } from 'lucide-react';

const TEMPLATES = [
  { id: 'message', label: 'Message', icon: MessageSquare, triggerType: 'specific_message' },
  { id: 'qr_link', label: 'QR / Link', icon: Link, triggerType: 'qr_link' },
  { id: 'template', label: 'Template', icon: ClipboardList, triggerType: 'interactive_template' },
  { id: 'blank', label: 'Blank', icon: Sparkles, triggerType: 'blank' }
];

export default function CreateAutomationModal({ onClose, onCreate }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('blank');

  const handleCreate = () => {
    if (!name.trim()) {
      alert('Please enter a flow title.');
      return;
    }
    const template = TEMPLATES.find(t => t.id === selectedTemplate);
    onCreate({
      name: name.trim(),
      triggerType: template.triggerType,
      profile: 'custom' // Maintained for compatibility
    });
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100, fontFamily: 'Outfit, sans-serif'
    }}>
      <div style={{
        background: 'white', width: '90%', maxWidth: '480px',
        borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        overflow: 'hidden'
      }}>
        {/* Top Dark Section */}
        <div style={{ background: '#0F172A', padding: '24px', position: 'relative' }}>
          {/* Header Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: '100px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }}></div>
              <span style={{ fontSize: '11px', fontWeight: '500', color: 'rgba(255,255,255,0.9)' }}>New automation</span>
            </div>
            <button onClick={onClose} style={{ 
              background: 'rgba(255,255,255,0.1)', border: 'none', color: '#9CA3AF', 
              cursor: 'pointer', padding: '6px', borderRadius: '50%', display: 'flex',
              transition: 'background 0.2s'
            }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            >
              <X size={16} />
            </button>
          </div>
          
          <h2 style={{ margin: '0 0 6px 0', fontSize: '20px', fontWeight: '600', color: 'white' }}>Create flow</h2>
          <p style={{ margin: '0 0 24px 0', color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>Set up your automation in seconds</p>

          {/* Template Cards */}
          <div style={{ display: 'flex', gap: '12px' }}>
            {TEMPLATES.map(tpl => {
              const isSelected = selectedTemplate === tpl.id;
              const Icon = tpl.icon;
              return (
                <div 
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl.id)}
                  style={{
                    flex: 1, height: '72px', borderRadius: '12px', cursor: 'pointer',
                    background: isSelected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.03)',
                    border: isSelected ? '1px solid #10B981' : '1px solid rgba(255,255,255,0.08)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={e => { if (!isSelected) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; } }}
                  onMouseOut={e => { if (!isSelected) { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; } }}
                >
                  <Icon size={20} color={isSelected && tpl.id === 'blank' ? '#FBBF24' : isSelected ? '#10B981' : 'rgba(255,255,255,0.6)'} />
                  <span style={{ fontSize: '11px', fontWeight: '500', color: isSelected ? 'white' : 'rgba(255,255,255,0.6)' }}>{tpl.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom White Section */}
        <div style={{ padding: '24px' }}>
          {/* Flow Title */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              FLOW TITLE
            </label>
            <div style={{ position: 'relative' }}>
              <Zap size={16} color="#9CA3AF" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Welcome flow, Support triage..."
                style={{
                  width: '100%', padding: '10px 12px 10px 36px', border: '1px solid #E5E7EB', borderRadius: '8px',
                  fontSize: '14px', color: '#111827', outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.2s'
                }}
                onFocus={e => e.target.style.borderColor = '#10B981'}
                onBlur={e => e.target.style.borderColor = '#E5E7EB'}
              />
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              DESCRIPTION <span style={{ textTransform: 'none', fontWeight: '400', color: '#9CA3AF' }}>(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe what this flow does..."
              rows={3}
              style={{
                width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '8px',
                fontSize: '14px', color: '#111827', outline: 'none', boxSizing: 'border-box', resize: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = '#10B981'}
              onBlur={e => e.target.style.borderColor = '#E5E7EB'}
            />
          </div>

          {/* Quick Tip */}
          <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '24px' }}>
            <div style={{ background: 'white', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Lightbulb size={16} color="#10B981" />
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#065F46', marginBottom: '4px' }}>Quick tip</div>
              <div style={{ fontSize: '12px', color: '#047857' }}>You can set triggers, add nodes and test on canvas after creating.</div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={onClose} style={{
              flex: 1, padding: '10px', borderRadius: '8px', fontSize: '14px', fontWeight: '600',
              background: 'white', color: '#6B7280', border: '1px solid #E5E7EB', cursor: 'pointer',
              transition: 'background 0.2s'
            }}
              onMouseOver={e => e.currentTarget.style.background = '#F9FAFB'}
              onMouseOut={e => e.currentTarget.style.background = 'white'}
            >Cancel</button>
            <button onClick={handleCreate} style={{
              flex: 2, padding: '10px', borderRadius: '8px', fontSize: '14px', fontWeight: '600',
              background: '#0F172A', color: 'white', border: 'none', cursor: 'pointer',
              transition: 'background 0.2s'
            }}
              onMouseOver={e => e.currentTarget.style.background = '#1E293B'}
              onMouseOut={e => e.currentTarget.style.background = '#0F172A'}
            >Create flow →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

