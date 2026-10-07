import React, { useState } from 'react';
import { X, ArrowRight } from 'lucide-react';

export default function CreateAutomationModal({ onClose, onCreate }) {
  const [name, setName] = useState('');
  const [startMode, setStartMode] = useState('scratch'); // 'scratch' | 'template'

  const handleCreate = (e) => {
    e.preventDefault();
    const finalName = name.trim() || (startMode === 'template' ? 'Template Campaign Bot' : 'Customer Support Bot');
    onCreate({ 
      name: finalName, 
      startMode: startMode 
    });
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(3px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, fontFamily: 'Outfit, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        background: '#fff', width: '92%', maxWidth: '440px', borderRadius: '16px',
        padding: '28px 24px 24px 24px', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.2)'
      }}>
        {/* Close button */}
        <button 
          onClick={onClose} 
          style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '4px' }}
        >
          <X size={18} />
        </button>

        <h2 style={{ margin: '0 0 6px 0', fontSize: '20px', fontWeight: '700', color: '#0f172a' }}>
          Create New Chatbot
        </h2>
        <p style={{ margin: '0 0 20px 0', color: '#64748b', fontSize: '13.5px', lineHeight: '1.4' }}>
          Enter a name and choose how you want to start.
        </p>

        <form onSubmit={handleCreate}>
          {/* Chatbot Name */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
              Chatbot Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., Customer Support Bot"
              autoFocus
              style={{
                width: '100%', padding: '11px 14px', border: '1px solid #e2e8f0', borderRadius: '10px',
                fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#0f172a'
              }}
            />
          </div>

          {/* Starting Point */}
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '10px' }}>
            Starting Point
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
            {/* Start from Scratch */}
            <div 
              onClick={() => setStartMode('scratch')}
              style={{
                border: startMode === 'scratch' ? '1.5px solid #10b981' : '1px solid #e2e8f0',
                background: startMode === 'scratch' ? '#f0fdf4' : '#fff',
                borderRadius: '12px', padding: '14px 16px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '12px',
                transition: 'all 0.2s'
              }}
            >
              <input 
                type="radio" 
                name="startPoint" 
                checked={startMode === 'scratch'} 
                onChange={() => setStartMode('scratch')}
                style={{ width: '17px', height: '17px', accentColor: '#10b981', cursor: 'pointer', margin: 0 }}
              />
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>
                  Start from Scratch
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                  Khali canvas se custom flow banayein
                </div>
              </div>
            </div>

            {/* Start from Template */}
            <div 
              onClick={() => setStartMode('template')}
              style={{
                border: startMode === 'template' ? '1.5px solid #10b981' : '1px solid #e2e8f0',
                background: startMode === 'template' ? '#f0fdf4' : '#fff',
                borderRadius: '12px', padding: '14px 16px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '12px',
                transition: 'all 0.2s'
              }}
            >
              <input 
                type="radio" 
                name="startPoint" 
                checked={startMode === 'template'} 
                onChange={() => setStartMode('template')}
                style={{ width: '17px', height: '17px', accentColor: '#10b981', cursor: 'pointer', margin: 0 }}
              />
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>
                  Start from Template
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                  Account ke WhatsApp templates se shuru karein
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button 
              type="button" 
              onClick={onClose} 
              style={{
                background: 'none', border: '1px solid #e2e8f0', padding: '10px 18px',
                borderRadius: '10px', fontSize: '13.5px', fontWeight: '600', color: '#475569',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              style={{
                background: '#059669', color: '#fff', border: 'none', padding: '10px 22px',
                borderRadius: '10px', fontSize: '13.5px', fontWeight: '600', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px',
                boxShadow: '0 2px 4px rgba(5, 150, 105, 0.2)'
              }}
            >
              Open Flow Builder <ArrowRight size={15} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
