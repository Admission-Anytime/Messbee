import React, { useState, useMemo } from 'react';
import { 
  Search, X, MessageCircle, QrCode, Zap, Smartphone, LayoutGrid, 
  Image as ImageIcon, ShoppingBag, Calendar, Share2, MapPin, Mic, FileText, Video 
} from 'lucide-react';

const TRIGGERS = [
  // Messages & Keywords
  { 
    id: 'specific_message', 
    title: 'Customer Sends Keyword', 
    desc: 'Trigger when customer messages specific keywords (exact match, contains, starts with).', 
    icon: MessageCircle, 
    bg: '#ffedd5', 
    iconColor: '#ea580c',
    tags: ['messages'] 
  },
  { 
    id: 'any_message', 
    title: 'Any Incoming Message', 
    desc: 'Trigger for every new incoming message. Ideal for welcome greetings or first responses.', 
    icon: MessageCircle, 
    bg: '#f1f5f9', 
    iconColor: '#475569',
    tags: ['messages'] 
  },
  { 
    id: 'new_subscriber', 
    title: 'New Contact Subscribed', 
    desc: 'Trigger when a new contact messages your WhatsApp business number for the first time.', 
    icon: Smartphone, 
    bg: '#eef2ff', 
    iconColor: '#4f46e5',
    tags: ['messages'] 
  },

  // Links, QR & Ads
  { 
    id: 'qr_link', 
    title: 'Scan QR or Click-to-Chat Link', 
    desc: 'Trigger when customer scans your QR code or taps a custom wa.me click-to-chat link.', 
    icon: QrCode, 
    bg: '#e0f2fe', 
    iconColor: '#0284c7',
    tags: ['links_ads'] 
  },
  { 
    id: 'whatsapp_ad', 
    title: 'Click-to-WhatsApp Ad (Meta)', 
    desc: 'Initiate this flow when a user clicks on your Meta Click-to-WhatsApp advertisement.', 
    icon: Smartphone, 
    bg: '#f0fdf4', 
    iconColor: '#16a34a',
    tags: ['links_ads'] 
  },

  // Media & Attachments
  { 
    id: 'media_received', 
    title: 'Media Received (Any)', 
    desc: 'Trigger when customer sends any media attachment (photo, document, voice, video).', 
    icon: ImageIcon, 
    bg: '#f3e8ff', 
    iconColor: '#9333ea',
    tags: ['media'] 
  },
  { 
    id: 'image_received', 
    title: 'Image Received', 
    desc: 'Trigger automatically when a customer sends an image or photo attachment.', 
    icon: ImageIcon, 
    bg: '#fdf2f8', 
    iconColor: '#db2777',
    tags: ['media'] 
  },
  { 
    id: 'document_received', 
    title: 'Document / PDF Received', 
    desc: 'Trigger automatically when customer sends a PDF, bill, or document file.', 
    icon: FileText, 
    bg: '#eff6ff', 
    iconColor: '#2563eb',
    tags: ['media'] 
  },
  { 
    id: 'voice_received', 
    title: 'Voice Note Received', 
    desc: 'Trigger automatically when customer sends an audio file or WhatsApp voice note.', 
    icon: Mic, 
    bg: '#ecfdf5', 
    iconColor: '#059669',
    tags: ['media'] 
  },
  { 
    id: 'video_received', 
    title: 'Video Received', 
    desc: 'Trigger automatically when customer sends a video recording or clip.', 
    icon: Video, 
    bg: '#fff1f2', 
    iconColor: '#e11d48',
    tags: ['media'] 
  },
  { 
    id: 'location_received', 
    title: 'Location Shared', 
    desc: 'Trigger when customer shares their live or static GPS pin location on WhatsApp.', 
    icon: MapPin, 
    bg: '#fef3c7', 
    iconColor: '#d97706',
    tags: ['media'] 
  },
  { 
    id: 'contact_shared', 
    title: 'Contact Card Shared', 
    desc: 'Trigger when customer shares a vCard / contact card attachment.', 
    icon: Share2, 
    bg: '#e0e7ff', 
    iconColor: '#4338ca',
    tags: ['media'] 
  },
  { 
    id: 'reaction', 
    title: 'Emoji Reaction Received', 
    desc: 'Trigger when customer reacts to an existing message with an emoji.', 
    icon: MessageCircle, 
    bg: '#fefce8', 
    iconColor: '#ca8a04',
    tags: ['media'] 
  },

  // E-Commerce
  { 
    id: 'order_created', 
    title: 'Order Created', 
    desc: 'Trigger when customer places a catalog or checkout order on WhatsApp.', 
    icon: ShoppingBag, 
    bg: '#dcfce7', 
    iconColor: '#15803d',
    tags: ['ecommerce'] 
  },
  { 
    id: 'payment_success', 
    title: 'Payment Success', 
    desc: 'Trigger immediately when a WhatsApp payment or order payment link succeeds.', 
    icon: Zap, 
    bg: '#d1fae5', 
    iconColor: '#059669',
    tags: ['ecommerce'] 
  },

  // CRM, Webhooks & Schedule
  { 
    id: 'webhook', 
    title: 'API Webhook Trigger', 
    desc: 'Trigger this automation remotely by sending data to your unique webhook endpoint.', 
    icon: Zap, 
    bg: '#eef2ff', 
    iconColor: '#4f46e5',
    tags: ['integrations'] 
  },
  { 
    id: 'tag_added', 
    title: 'Tag Added (CRM)', 
    desc: 'Trigger automatically when a specific tag is attached to a contact profile in CRM.', 
    icon: Zap, 
    bg: '#ecfdf5', 
    iconColor: '#059669',
    tags: ['integrations'] 
  },
  { 
    id: 'crm', 
    title: 'CRM Status Event', 
    desc: 'Trigger automation when a customer stage or status changes in your connected CRM.', 
    icon: Zap, 
    bg: '#ecfdf5', 
    iconColor: '#10b981',
    tags: ['integrations'] 
  },
  { 
    id: 'schedule', 
    title: 'Scheduled Trigger', 
    desc: 'Run this automation at a scheduled date and time for designated contacts.', 
    icon: Calendar, 
    bg: '#fff7ed', 
    iconColor: '#ea580c',
    tags: ['integrations'] 
  },
  { 
    id: 'recurring', 
    title: 'Recurring Schedule', 
    desc: 'Run this automation on a repeating schedule (e.g., daily or weekly).', 
    icon: Calendar, 
    bg: '#fff7ed', 
    iconColor: '#c2410c',
    tags: ['integrations'] 
  },
];

export default function TriggerSelectionModal({ onClose, onSelectTrigger }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTriggers = useMemo(() => {
    return TRIGGERS.filter(trigger => {
      const matchesFilter = activeFilter === 'all' || trigger.tags.includes(activeFilter);
      const matchesSearch = trigger.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            trigger.desc.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, searchQuery]);

  const SidebarItem = ({ id, icon: Icon, label }) => {
    const isActive = activeFilter === id;
    return (
      <div 
        onClick={() => setActiveFilter(id)}
        style={{
          ...sidebarItemStyle,
          background: isActive ? '#e0f2fe' : 'transparent',
          color: isActive ? '#0284c7' : '#6b7280',
          fontWeight: isActive ? '600' : '400',
        }}
      >
        <Icon size={16} color={isActive ? '#0284c7' : '#9ca3af'} />
        {label}
      </div>
    );
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.45)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      fontFamily: 'Outfit, sans-serif'
    }}>
      
      {/* Modal Container */}
      <div style={{
        background: 'white',
        width: '90%',
        maxWidth: '1000px',
        height: '85vh',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden'
      }}>
        
        {/* Modal Header */}
        <div style={{ padding: '22px 28px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '19px', fontWeight: '700', color: '#111827' }}>Set Chatbot Trigger</h2>
            <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '13px' }}>Choose the event or customer action that starts this automation</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button 
              onClick={() => onSelectTrigger('specific_message')}
              style={{
                background: '#10b981', color: 'white', border: 'none', padding: '9px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#059669'}
              onMouseOut={(e) => e.currentTarget.style.background = '#10b981'}
            >
              Keyword Match
            </button>
            <button onClick={onClose} style={{
              background: 'white', border: '1px solid #e5e7eb', padding: '8px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#f9fafb'}
            onMouseOut={(e) => e.currentTarget.style.background = 'white'}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          
          {/* Left Sidebar Menu */}
          <div style={{ width: '250px', background: 'white', borderRight: '1px solid #f3f4f6', padding: '20px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            
            <div style={{ marginBottom: '24px' }}>
              <div style={sidebarHeaderStyle}>ALL TRIGGERS</div>
              <SidebarItem id="all" icon={LayoutGrid} label="All Triggers" />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={sidebarHeaderStyle}>BY CATEGORY</div>
              <SidebarItem id="messages" icon={MessageCircle} label="Messages & Keywords" />
              <SidebarItem id="links_ads" icon={QrCode} label="Links, QR & Ads" />
              <SidebarItem id="media" icon={ImageIcon} label="Media & Attachments" />
              <SidebarItem id="ecommerce" icon={ShoppingBag} label="E-Commerce & Orders" />
              <SidebarItem id="integrations" icon={Zap} label="CRM, Webhooks & Schedule" />
            </div>

            {/* Bottom Left Info block */}
            <div style={{ marginTop: 'auto', background: '#F8FAFC', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
              <h4 style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: '700', color: '#334155' }}>24h Session Rule</h4>
              <p style={{ margin: 0, fontSize: '11px', color: '#64748B', lineHeight: '1.4' }}>
                Automation executes inside active customer sessions according to standard WhatsApp Business guidelines.
              </p>
            </div>
          </div>

          {/* Right Content Area */}
          <div style={{ flex: 1, padding: '24px 28px', overflowY: 'auto', background: 'white', display: 'flex', flexDirection: 'column' }}>
            
            {/* Search Bar */}
            <div style={{ position: 'relative', marginBottom: '20px' }}>
              <Search size={18} color="#9ca3af" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                placeholder="Search triggers..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '11px 16px 11px 44px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13.5px', outline: 'none', color: '#1f2937', boxSizing: 'border-box' }}
                onFocus={(e) => e.target.style.borderColor = '#10b981'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

            {/* Cards Grid */}
            <div style={{ flex: 1 }}>
              {filteredTriggers.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '16px' }}>
                  {filteredTriggers.map((trigger) => {
                    const Icon = trigger.icon;
                    return (
                      <div 
                        key={trigger.id} 
                        onClick={() => onSelectTrigger(trigger.id)} 
                        style={cardStyle}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#10b981';
                          e.currentTarget.style.boxShadow = '0 8px 18px -4px rgba(0, 0, 0, 0.08)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#e5e7eb';
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        <div style={{ height: '90px', background: trigger.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon size={28} color={trigger.iconColor || '#475569'} />
                        </div>
                        <div style={{ padding: '16px' }}>
                          <h4 style={cardTitleStyle}>{trigger.title}</h4>
                          <p style={cardDescStyle}>{trigger.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280' }}>
                  <Search size={40} color="#e5e7eb" style={{ marginBottom: '16px' }} />
                  <p style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>No triggers found</p>
                  <p style={{ margin: '4px 0 0', fontSize: '13px' }}>Try adjusting your search query.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

// Styling Constants
const sidebarHeaderStyle = {
  fontSize: '10px',
  fontWeight: '700',
  color: '#9ca3af',
  letterSpacing: '0.05em',
  marginBottom: '10px',
  paddingLeft: '10px'
};

const sidebarItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '9px 12px',
  borderRadius: '8px',
  fontSize: '13px',
  cursor: 'pointer',
  marginBottom: '4px',
  transition: 'all 0.15s ease',
};

const cardStyle = {
  border: '1px solid #e5e7eb',
  borderRadius: '12px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  backgroundColor: 'white',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  height: '100%',
  boxSizing: 'border-box'
};

const cardTitleStyle = {
  margin: '0 0 6px',
  fontSize: '13.5px',
  fontWeight: '700',
  color: '#111827',
  lineHeight: '1.35'
};

const cardDescStyle = {
  margin: 0,
  fontSize: '11.5px',
  color: '#6b7280',
  lineHeight: '1.45',
};
