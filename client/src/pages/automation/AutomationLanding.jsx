import React, { useState, useEffect } from 'react';
import {
  Plus, MessageSquare, Clock, AlertCircle, Play, Settings2, Grid
} from 'lucide-react';
import api from '../../api';

/**
 * AutomationLanding — The main "Automation" page matching Figma Section 1.
 */
export default function AutomationLanding({ onNavigateFlows, onCreateAutomation, onCreatePreconfigured, onNavigateWelcomeMessage, onNavigateAwayMessage, onNavigateFallbackMessage }) {
  const [activeCount, setActiveCount] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/automations');
        const activeAutomations = res.data.filter(a => a.isActive).length;
        setActiveCount(activeAutomations);
      } catch (err) {
        console.error('Failed to fetch automations:', err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div style={{ padding: '40px 48px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Outfit, sans-serif', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <div style={{ background: '#1E293B', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ZapIcon />
          </div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0 0 8px 0' }}>Automation</h1>
            <p style={{ color: '#6B7280', margin: 0, fontSize: '14px', lineHeight: '1.5', maxWidth: '500px' }}>
              Set up automations that manage conversations and streamline your workflows so you can focus on your business.
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '6px 12px', borderRadius: '100px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }}></div>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#059669' }}>{activeCount} active</span>
          </div>
          <button 
            onClick={() => onNavigateFlows?.()}
            style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', 
            padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '600',
            background: 'white', color: '#374151', border: '1px solid #D1D5DB', cursor: 'pointer'
          }}>
            <Grid size={16} /> Chatbot gallery
          </button>
          <button 
            onClick={() => onCreateAutomation?.()}
            style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', 
            padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '600',
            background: '#1E293B', color: 'white', border: 'none', cursor: 'pointer'
          }}>
            <Plus size={16} /> New automation
          </button>
        </div>
      </div>

      {/* Greet people Section */}
      <div style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>Greet people</h2>
        <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 20px 0' }}>Automatically welcome and respond to your customers.</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
          
          {/* Welcome Message Card */}
          <div style={{
            background: 'linear-gradient(135deg, #3730A3 0%, #312E81 100%)',
            borderRadius: '16px', padding: '32px', position: 'relative', overflow: 'hidden',
            color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            minHeight: '240px'
          }}>
            {/* Background decorative circles */}
            <div style={{ position: 'absolute', right: '-10%', top: '-20%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, rgba(99,102,241,0) 70%)', borderRadius: '50%' }}></div>
            <div style={{ position: 'absolute', right: '20%', bottom: '-10%', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(99,102,241,0) 70%)', borderRadius: '50%' }}></div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: '100px', marginBottom: '16px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34D399' }}></div>
                <span style={{ fontSize: '12px', fontWeight: '500' }}>Ready</span>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 8px 0' }}>Welcome message</h3>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', margin: '0 0 24px 0', lineHeight: '1.5', maxWidth: '80%' }}>
                Greet new customers the moment they first message you — automatically, every single time.
              </p>
              <button 
                onClick={() => onNavigateWelcomeMessage?.()}
                style={{ 
                background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', 
                color: 'white', padding: '8px 16px', borderRadius: '100px', fontSize: '13px', 
                fontWeight: '500', cursor: 'pointer', backdropFilter: 'blur(4px)'
              }}>
                Set message →
              </button>
            </div>
            
            <div style={{ position: 'absolute', right: '32px', bottom: '32px', opacity: 0.8 }}>
              {/* Graphic icon placeholder for Welcome message */}
              <div style={{ width: '64px', height: '64px', position: 'relative' }}>
                <div style={{ position: 'absolute', right: 0, top: 0, width: '48px', height: '36px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)' }}></div>
                <div style={{ position: 'absolute', left: 0, bottom: 0, width: '52px', height: '40px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Away Message Card */}
          <div style={{
            background: 'linear-gradient(135deg, #9A3412 0%, #78350F 100%)',
            borderRadius: '16px', padding: '32px', position: 'relative', overflow: 'hidden',
            color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            minHeight: '240px'
          }}>
             {/* Background decorative circles */}
             <div style={{ position: 'absolute', right: '-10%', top: '-20%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(249,115,22,0.2) 0%, rgba(249,115,22,0) 70%)', borderRadius: '50%' }}></div>
             <div style={{ position: 'absolute', right: '20%', bottom: '-10%', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(249,115,22,0.15) 0%, rgba(249,115,22,0) 70%)', borderRadius: '50%' }}></div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: '100px', marginBottom: '16px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#9CA3AF' }}></div>
                <span style={{ fontSize: '12px', fontWeight: '500' }}>Ready</span>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 8px 0' }}>Away message</h3>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', margin: '0 0 24px 0', lineHeight: '1.5', maxWidth: '80%' }}>
                Auto-reply when your team is unavailable or outside your set business hours.
              </p>
              <button 
                onClick={() => onNavigateAwayMessage?.()}
                style={{ 
                background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', 
                color: 'white', padding: '8px 16px', borderRadius: '100px', fontSize: '13px', 
                fontWeight: '500', cursor: 'pointer', backdropFilter: 'blur(4px)'
              }}>
                Set message →
              </button>
            </div>

            <div style={{ position: 'absolute', right: '32px', bottom: '32px', opacity: 0.8 }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                 <Clock size={32} color="rgba(255,255,255,0.5)" strokeWidth={1.5} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Automation Section */}
      <div>
        <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>Advanced automation</h2>
        <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 20px 0' }}>Automate repetitive processes with the visual chatbot builder.</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
          
          {/* Chatbot Builder Card */}
          <div style={{
            background: 'linear-gradient(135deg, #1E1B4B 0%, #0F172A 100%)',
            borderRadius: '16px', padding: '32px', position: 'relative', overflow: 'hidden',
            color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            minHeight: '240px'
          }}>
            {/* Background decorative circles */}
            <div style={{ position: 'absolute', right: '-10%', top: '-20%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(59,130,246,0) 70%)', borderRadius: '50%' }}></div>
            <div style={{ position: 'absolute', right: '20%', bottom: '-10%', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, rgba(59,130,246,0) 70%)', borderRadius: '50%' }}></div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: '100px', marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', fontWeight: '500', color: '#818CF8' }}>+ Visual builder</span>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 8px 0' }}>Chatbot builder</h3>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', margin: '0 0 24px 0', lineHeight: '1.5', maxWidth: '80%' }}>
                Drag-and-drop visual flows with keyword triggers, template messages, and branching logic — no code needed.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={() => onCreateAutomation?.()}
                  style={{ 
                  background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', 
                  color: 'white', padding: '8px 16px', borderRadius: '100px', fontSize: '13px', 
                  fontWeight: '500', cursor: 'pointer', backdropFilter: 'blur(4px)'
                }}>
                  Create automation →
                </button>
                <button 
                  onClick={onNavigateFlows}
                  style={{ 
                  background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', 
                  color: 'white', padding: '8px 16px', borderRadius: '100px', fontSize: '13px', 
                  fontWeight: '500', cursor: 'pointer'
                }}>
                  View all
                </button>
              </div>
            </div>

            <div style={{ position: 'absolute', right: '32px', bottom: '32px', opacity: 0.8 }}>
              {/* Graphic icon placeholder for Flow builder */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                 <div style={{ width: '40px', height: '24px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)' }}></div>
                 <div style={{ width: '2px', height: '16px', background: 'rgba(255,255,255,0.2)' }}></div>
                 <div style={{ display: 'flex', gap: '16px' }}>
                   <div style={{ width: '40px', height: '24px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)' }}></div>
                   <div style={{ width: '40px', height: '24px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)' }}></div>
                 </div>
              </div>
            </div>
          </div>

          {/* Fallback Message Card */}
          <div style={{
            background: 'linear-gradient(135deg, #451A03 0%, #27272A 100%)',
            borderRadius: '16px', padding: '32px', position: 'relative', overflow: 'hidden',
            color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            minHeight: '240px'
          }}>
             {/* Background decorative circles */}
             <div style={{ position: 'absolute', right: '-10%', top: '-20%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(251,146,60,0.1) 0%, rgba(251,146,60,0) 70%)', borderRadius: '50%' }}></div>
             <div style={{ position: 'absolute', right: '20%', bottom: '-10%', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(251,146,60,0.05) 0%, rgba(251,146,60,0) 70%)', borderRadius: '50%' }}></div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: '100px', marginBottom: '16px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#9CA3AF' }}></div>
                <span style={{ fontSize: '12px', fontWeight: '500' }}>Ready</span>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 8px 0' }}>Fallback message</h3>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', margin: '0 0 24px 0', lineHeight: '1.5', maxWidth: '80%' }}>
                Catch-all reply when no keyword or trigger matches — keeps every conversation covered.
              </p>
              <button 
                onClick={() => onNavigateFallbackMessage?.()}
                style={{ 
                background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', 
                color: 'white', padding: '8px 16px', borderRadius: '100px', fontSize: '13px', 
                fontWeight: '500', cursor: 'pointer', backdropFilter: 'blur(4px)'
              }}>
                Set message →
              </button>
            </div>

            <div style={{ position: 'absolute', right: '32px', bottom: '32px', opacity: 0.8 }}>
              <div style={{ width: '64px', height: '64px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <div style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', border: '2px dashed rgba(251,146,60,0.3)' }}></div>
                 <AlertCircle size={32} color="#FB923C" strokeWidth={1.5} />
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

const ZapIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
  </svg>
);

