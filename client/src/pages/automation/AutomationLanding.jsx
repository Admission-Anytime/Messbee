import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare, UserPlus, ShoppingBag, Clock, FileText, AlertCircle,
  Gift, RefreshCw, Star, CreditCard, Users, Mail, Zap, ArrowRight, MousePointerClick,
  Search, Bell, Settings
} from 'lucide-react';
import api from '../../context/axios';
import { userContext } from '../../context/Context';

const ToggleSwitch = ({ isActive, onChange }) => (
  <div 
    onClick={onChange}
    style={{
      width: '40px', height: '24px', borderRadius: '24px',
      background: isActive ? '#10B981' : '#E5E7EB',
      position: 'relative', cursor: 'pointer', transition: 'background 0.2s'
    }}
  >
    <div style={{
      width: '18px', height: '18px', borderRadius: '50%', background: 'white',
      position: 'absolute', top: '3px', left: isActive ? '19px' : '3px',
      transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }} />
  </div>
);

const Badge = ({ isActive }) => (
  <span style={{
    background: isActive ? '#DCFCE7' : '#F3F4F6',
    color: isActive ? '#16A34A' : '#4B5563',
    padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600'
  }}>
    {isActive ? 'Active' : 'Paused'}
  </span>
);

export default function AutomationLanding({ onNavigateFlows, onCreateAutomation, onCreatePreconfigured, onNavigateWelcomeMessage, onNavigateAwayMessage, onNavigateFallbackMessage }) {
  const [automations, setAutomations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useContext(userContext);
  const navigate = useNavigate();

  const fetchAutomations = async () => {
    try {
      const res = await api.get('/automation');
      setAutomations(res.data);
    } catch (err) {
      console.error('Failed to fetch automations:', err);
    }
  };

  useEffect(() => {
    fetchAutomations();
  }, []);

  const handleToggle = async (automationName) => {
    const existing = automations.find(a => a.name === automationName);
    if (existing) {
      try {
        await api.put(`/automation/${existing._id}`, { isActive: !existing.isActive });
        fetchAutomations();
      } catch (e) {
        console.error('Toggle failed', e);
      }
    } else {
      if (automationName === 'Welcome New Users' || automationName === 'Welcome message') onNavigateWelcomeMessage?.();
      else if (automationName === 'Away message') onNavigateAwayMessage?.();
      else onCreatePreconfigured?.(); 
    }
  };

  const checkIsActive = (name) => {
    const existing = automations.find(a => a.name === name);
    return existing ? existing.isActive : false;
  };

  const AutomationCard = ({ title, activeStatus, onToggle, triggerIcon: TriggerIcon, triggerText, actionIcon: ActionIcon, actionText, buttonText, onButtonClick }) => (
    <div style={{
      background: 'white', borderRadius: '12px', padding: '24px',
      border: '1px solid #F3F4F6', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '20px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>{title}</h3>
          <Badge isActive={activeStatus} />
        </div>
        <ToggleSwitch isActive={activeStatus} onChange={onToggle} />
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#F0F9FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
            <TriggerIcon size={14} color="#0EA5E9" />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '500', marginBottom: '2px' }}>Trigger</div>
            <div style={{ fontSize: '13px', color: '#374151', lineHeight: '1.4' }}>{triggerText}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
            <ActionIcon size={14} color="#A855F7" />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '500', marginBottom: '2px' }}>Action</div>
            <div style={{ fontSize: '13px', color: '#374151', lineHeight: '1.4' }}>{actionText}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'auto', paddingTop: '16px' }}>
        <button 
          onClick={onButtonClick}
          style={{
            background: '#F0FDF4', color: '#16A34A', border: 'none',
            padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer'
          }}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );

  const filterCards = (cards) => {
    if (!searchTerm) return cards;
    return cards.filter(c => 
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (c.triggerText && c.triggerText.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.actionText && c.actionText.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const basicCards = filterCards([
    {
      title: "Welcome New Users", activeStatusName: 'Welcome message', toggleName: 'Welcome message',
      triggerIcon: UserPlus, triggerText: "When user signs up", actionIcon: Mail, actionText: "Send welcome email",
      buttonText: "Send Message", onButtonClick: () => onNavigateWelcomeMessage?.()
    },
    {
      title: "Order Confirmation", activeStatusName: 'Order Confirmation', toggleName: 'Order Confirmation',
      triggerIcon: ShoppingBag, triggerText: "When new order is placed", actionIcon: ArrowRight, actionText: "Send confirmation email with order details",
      buttonText: "Send Message", onButtonClick: () => onCreatePreconfigured?.()
    },
    {
      title: "Away message", activeStatusName: 'Away message', toggleName: 'Away message',
      triggerIcon: Zap, triggerText: "Reply automatically when you are away", actionIcon: ArrowRight, actionText: "Send reminder notification",
      buttonText: "Send Message", onButtonClick: () => onNavigateAwayMessage?.()
    },
    {
      title: "Weekly Reports", activeStatusName: 'Weekly Reports', toggleName: 'Weekly Reports',
      triggerIcon: Clock, triggerText: "Every Monday at 9 AM", actionIcon: ArrowRight, actionText: "Send analytics report to team",
      buttonText: "Send Message", onButtonClick: () => onCreatePreconfigured?.()
    }
  ]);

  const advanceCards = filterCards([
    {
      title: "Chatbot builder", isBuilder: true,
      triggerText: "Build with drag and drop chatbot builder to automate advance trigger based on keywords, template message and more",
      buttonText: "Send Message"
    },
    {
      title: "Fallback message", activeStatusName: 'Fallback message', toggleName: 'Fallback message',
      triggerText: "Send fallback message when no keywords or trigger for automation matches",
      buttonText: "Send Message"
    }
  ]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#FAFAFA', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Top Navigation Bar */}
      <div style={{ 
        height: '64px', background: 'white', borderBottom: '1px solid #F3F4F6', 
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
        padding: '0 48px', boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '8px 12px', width: '320px' }}>
          <Search size={16} color="#9CA3AF" style={{ marginRight: '8px' }} />
          <input 
            type="text" 
            placeholder="Search automation" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', width: '100%', color: '#374151' }} 
          />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Bell onClick={() => navigate('/admin/notifications')} size={20} color="#6B7280" style={{ cursor: 'pointer' }} />
            <Settings onClick={() => navigate('/admin/account/profile')} size={20} color="#6B7280" style={{ cursor: 'pointer' }} />
          </div>
          
          <div style={{ width: '1px', height: '24px', background: '#E5E7EB' }}></div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>{user?.name || ""}</div>
              <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>{user?.phone || user?.phoneNumber || ""}</div>
            </div>
            <div style={{ 
              width: '40px', height: '40px', borderRadius: '50%', background: '#F97316', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', cursor: 'pointer'
            }} onClick={() => navigate('/admin/account/profile')}>
              {user?.avatarUrl || user?.avatar ? (
                <img src={user.avatarUrl || user.avatar} alt="profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                  {(user?.name || "U").charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '40px 48px', maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', margin: '0 0 8px 0' }}>Automation</h1>
          <p style={{ color: '#6B7280', margin: 0, fontSize: '14px' }}>Manage and create automated workflows to streamline your processes</p>
        </div>

        {basicCards.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '48px' }}>
            {basicCards.map((c, i) => (
              <AutomationCard 
                key={i}
                title={c.title} activeStatus={checkIsActive(c.activeStatusName)}
                onToggle={() => handleToggle(c.toggleName)}
                triggerIcon={c.triggerIcon} triggerText={c.triggerText}
                actionIcon={c.actionIcon} actionText={c.actionText}
                buttonText={c.buttonText} onButtonClick={c.onButtonClick}
              />
            ))}
          </div>
        )}

        {advanceCards.length > 0 && (
          <div style={{ marginBottom: '48px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>Advance Automation</h2>
            <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 24px 0' }}>Automate repetitive processes with advance chat bot builder</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
              
              {advanceCards.map((c, i) => {
                if (c.isBuilder) {
                  return (
                    <div key={i} style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #F3F4F6', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>Chatbot builder</h3>
                          <Badge isActive={true} />
                        </div>
                        <ToggleSwitch isActive={true} onChange={() => {}} />
                      </div>
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#F0F9FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                          <MousePointerClick size={14} color="#0EA5E9" />
                        </div>
                        <p style={{ fontSize: '13px', color: '#4B5563', margin: 0, lineHeight: '1.6' }}>
                          {c.triggerText}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '12px', marginTop: 'auto', paddingTop: '16px' }}>
                        <button 
                          onClick={onNavigateFlows}
                          style={{ background: '#F0FDF4', color: '#16A34A', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                          View chatbot
                        </button>
                        <button 
                          onClick={onCreateAutomation}
                          style={{ background: '#F0FDF4', color: '#16A34A', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                          Send Message
                        </button>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div key={i} style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #F3F4F6', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>Fallback message</h3>
                          <Badge isActive={checkIsActive('Fallback message')} />
                        </div>
                        <ToggleSwitch isActive={checkIsActive('Fallback message')} onChange={() => handleToggle('Fallback message')} />
                      </div>
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#F0F9FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                          <AlertCircle size={14} color="#0EA5E9" />
                        </div>
                        <p style={{ fontSize: '13px', color: '#4B5563', margin: 0, lineHeight: '1.6' }}>
                          {c.triggerText}
                        </p>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'auto', paddingTop: '16px' }}>
                        <button 
                          onClick={onNavigateFallbackMessage}
                          style={{ background: '#F0FDF4', color: '#16A34A', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                          Send Message
                        </button>
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          </div>
        )}

        {!searchTerm && (
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>Suggested Automations</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
              
              {[
                { title: 'Birthday Wishes', desc: 'Automatically send birthday greetings to users', icon: Gift, color: '#3B82F6' },
                { title: 'Re-engagement Campaign', desc: 'Reach out to inactive users after 30 days', icon: RefreshCw, color: '#3B82F6' },
                { title: 'Feedback Collection', desc: 'Request feedback after a purchase or interaction', icon: FileText, color: '#3B82F6' },
                { title: 'VIP Customer Alert', desc: 'Notify team when high-value customer takes action', icon: Star, color: '#A855F7' },
                { title: 'Onboarding Sequence', desc: 'Guide new users through setup with timed emails', icon: Users, color: '#3B82F6' },
                { title: 'Payment Failed Follow-up', desc: 'Automatically retry and notify on payment failures', icon: CreditCard, color: '#3B82F6' }
              ].map((tpl, i) => (
                <div key={i} style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #F3F4F6', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#F0F9FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <tpl.icon size={14} color={tpl.color} />
                    </div>
                    <h3 style={{ fontSize: '15px', fontWeight: '600', margin: 0, color: '#111827' }}>{tpl.title}</h3>
                  </div>
                  <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 16px 0', lineHeight: '1.5' }}>{tpl.desc}</p>
                  <button 
                    onClick={() => onCreatePreconfigured?.()}
                    style={{ width: '100%', background: 'white', border: '1px solid #E5E7EB', padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: '#374151', cursor: 'pointer', marginTop: 'auto' }}>
                    Use Template
                  </button>
                </div>
              ))}

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
