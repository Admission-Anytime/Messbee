import React, { useState, useMemo } from 'react';
import { Search, X, MessageCircle, QrCode, ClipboardList, Zap, Smartphone, LayoutGrid } from 'lucide-react';

const TRIGGERS = [
  { id: 'specific_message', title: 'Customer send specific message', desc: 'Trigger the automation when the customer messages specific keywords.', icon: MessageCircle, bg: '#ffedd5', tags: ['specific_message', 'whatsapp_business'] },
  { id: 'qr_link', title: 'Customer scan QR or click on link', desc: 'Trigger when the customer scans a QR code or opens a Click to Chat link.', icon: QrCode, bg: '#e0f2fe', tags: ['link_qr', 'whatsapp_business'] },
  { id: 'interactive_template', title: 'Interactive template (campaign)', desc: 'Trigger when the customer receives a template with buttons or menus.', icon: ClipboardList, bg: '#f3e8ff', tags: ['template_campaign', 'whatsapp_business'] },
  { id: 'agent_sends', title: 'Agent sends interactive message', desc: 'Trigger after your team sends a quick reply or interactive message.', icon: Zap, bg: '#dcfce7', tags: ['agent_interactive', 'whatsapp_business'] },
  { id: 'any_message', title: 'Incoming message', desc: 'Trigger for every new incoming message, useful for welcome messages.', icon: MessageCircle, bg: '#f3f4f6', tags: ['specific_message', 'whatsapp_business'] },
  { id: 'whatsapp_ad', title: 'Click to WhatsApp', desc: 'Initiate conversation when a user clicks on a Meta Click-to-WhatsApp ad.', icon: Smartphone, bg: '#f0fdf4', tags: ['link_qr', 'whatsapp_business'] },
  { id: 'new_subscriber', title: 'New contact subscribed', desc: 'Trigger when a user first opts in or subscribes to your WhatsApp service.', icon: Smartphone, bg: '#eef2ff', tags: ['whatsapp_business'] },
  { id: 'webhook', title: 'API Webhook', desc: 'Trigger this automation by sending data to a unique webhook URL.', icon: Zap, bg: '#eef2ff', tags: ['api_webhook'] },
  { id: 'tag_added', title: 'Tag Added (CRM)', desc: 'Trigger automatically when a specific tag is attached to a contact profile.', icon: Zap, bg: '#ecfdf5', tags: ['crm_integration'] },
  { id: 'crm', title: 'CRM Event', desc: 'Trigger automation when an event happens in your connected CRM.', icon: Zap, bg: '#ecfdf5', tags: ['crm_integration'] },
  { id: 'schedule', title: 'Schedule', desc: 'Run this automation at a specific date and time.', icon: ClipboardList, bg: '#fff7ed', tags: ['scheduling'] },
  { id: 'missed_call', title: 'Missed Call', desc: 'Trigger when a customer tries to call your WhatsApp number.', icon: Smartphone, bg: '#fee2e2', tags: ['whatsapp_business'] },
  { id: 'reaction', title: 'Reaction', desc: 'Trigger when a customer reacts to your message with an emoji.', icon: MessageCircle, bg: '#fefce8', tags: ['whatsapp_business'] },
  { id: 'media_received', title: 'Media Received', desc: 'Trigger when a customer sends any media type.', icon: MessageCircle, bg: '#f3e8ff', tags: ['whatsapp_business'] },
  { id: 'image_received', title: 'Image Received', desc: 'Trigger when a customer sends an image.', icon: MessageCircle, bg: '#f3e8ff', tags: ['whatsapp_business'] },
  { id: 'video_received', title: 'Video Received', desc: 'Trigger when a customer sends a video.', icon: MessageCircle, bg: '#f3e8ff', tags: ['whatsapp_business'] },
  { id: 'document_received', title: 'Document Received', desc: 'Trigger when a customer sends a document.', icon: MessageCircle, bg: '#f3e8ff', tags: ['whatsapp_business'] },
  { id: 'voice_received', title: 'Voice Received', desc: 'Trigger when a customer sends a voice note.', icon: MessageCircle, bg: '#f3e8ff', tags: ['whatsapp_business'] },
  { id: 'location_received', title: 'Location Received', desc: 'Trigger when a customer shares a location.', icon: MessageCircle, bg: '#f3e8ff', tags: ['whatsapp_business'] },
  { id: 'contact_shared', title: 'Contact Shared', desc: 'Trigger when a customer shares a contact card.', icon: MessageCircle, bg: '#f3e8ff', tags: ['whatsapp_business'] },
  { id: 'button_click', title: 'Button Click', desc: 'Trigger when a customer clicks a specific button.', icon: Zap, bg: '#e0f2fe', tags: ['whatsapp_business'] },
  { id: 'list_selection', title: 'List Selection', desc: 'Trigger when a customer selects an option from a list menu.', icon: Zap, bg: '#e0f2fe', tags: ['whatsapp_business'] },
  { id: 'template_reply', title: 'Template Reply', desc: 'Trigger when a customer replies to a template.', icon: Zap, bg: '#e0f2fe', tags: ['whatsapp_business'] },
  { id: 'order_created', title: 'Order Created', desc: 'Trigger when a new order is placed.', icon: Zap, bg: '#dcfce7', tags: ['ecommerce'] },
  { id: 'payment_success', title: 'Payment Success', desc: 'Trigger when a payment is completed successfully.', icon: Zap, bg: '#d1fae5', tags: ['ecommerce'] },
  { id: 'recurring', title: 'Recurring', desc: 'Run this flow repeatedly (e.g. every Monday).', icon: ClipboardList, bg: '#fff7ed', tags: ['scheduling'] },
  { id: 'manual', title: 'Manual Trigger', desc: 'Trigger this automation manually for a specific contact.', icon: Zap, bg: '#f1f5f9', tags: ['manual'] }
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
          color: isActive ? '#10b981' : '#6b7280',
          fontWeight: isActive ? '600' : '400',
        }}
      >
        <Icon size={16} color={isActive ? '#10b981' : '#9ca3af'} />
        {label}
      </div>
    );
  };

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
        <div style={{ padding: '24px 32px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#111827' }}>Set chatbot trigger</h2>
            <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '13px' }}>Select how the automation will start and end</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button style={{
              background: '#10b981', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#059669'}
            onMouseOut={(e) => e.currentTarget.style.background = '#10b981'}
            >
              Custom keywords
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
          <div style={{ width: '260px', background: 'white', borderRight: '1px solid #f3f4f6', padding: '24px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            
            <div style={{ marginBottom: '32px' }}>
              <div style={sidebarHeaderStyle}>POPULAR</div>
              <SidebarItem id="all" icon={LayoutGrid} label="All triggers" />
            </div>

            <div style={{ marginBottom: '32px' }}>
              <div style={sidebarHeaderStyle}>BY TYPE</div>
              <SidebarItem id="specific_message" icon={MessageCircle} label="Specific message" />
              <SidebarItem id="link_qr" icon={QrCode} label="Link or QR" />
              <SidebarItem id="template_campaign" icon={ClipboardList} label="Template campaign" />
              <SidebarItem id="agent_interactive" icon={Zap} label="Agent interactive" />
            </div>

            <div style={{ marginBottom: '32px', flex: 1 }}>
              <div style={sidebarHeaderStyle}>BY CHANNEL</div>
              <SidebarItem id="whatsapp_business" icon={Smartphone} label="WhatsApp Business" />
            </div>

            {/* Bottom Left Info block */}
            <div style={{ marginTop: 'auto' }}>
              <h4 style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: '700', color: '#374151' }}>End of flow</h4>
              <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af', lineHeight: '1.5' }}>
                Bot will end once the flow is completed or there is no response from the customer in 24 hrs.
              </p>
            </div>
          </div>

          {/* Right Content Area */}
          <div style={{ flex: 1, padding: '32px', overflowY: 'auto', background: 'white', display: 'flex', flexDirection: 'column' }}>
            
            {/* Search Bar */}
            <div style={{ position: 'relative', marginBottom: '32px' }}>
              <Search size={18} color="#9ca3af" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '12px 16px 12px 44px', border: '1px solid #10b981', borderRadius: '8px', fontSize: '14px', outline: 'none', color: '#1f2937', boxSizing: 'border-box' }}
              />
            </div>

            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '20px', textTransform: 'capitalize' }}>
              {activeFilter === 'all' ? 'Popular' : activeFilter.replace('_', ' ')}
            </h3>

            {/* Cards Grid */}
            <div style={{ flex: 1 }}>
              {filteredTriggers.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
                  {filteredTriggers.map((trigger) => {
                    const Icon = trigger.icon;
                    return (
                      <div 
                        key={trigger.id} 
                        onClick={() => onSelectTrigger(trigger.id)} 
                        style={cardStyle}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#10b981';
                          e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#e5e7eb';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <div style={{ height: '110px', background: trigger.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon size={28} color="#9ca3af" />
                        </div>
                        <div style={{ padding: '20px' }}>
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
                  <p style={{ margin: 0, fontSize: '16px', fontWeight: '500' }}>No triggers found</p>
                  <p style={{ margin: '4px 0 0', fontSize: '14px' }}>Try adjusting your search or filters.</p>
                </div>
              )}
            </div>
            
            {/* Next Step Section */}
            <div style={{ marginTop: '40px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>Next step</h3>
              <div style={{ padding: '20px', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '13px', color: '#6b7280', lineHeight: '1.6' }}>
                After you set the trigger, use <strong>Set first message</strong> on the next step, then pick your first node from the dialog. You can also drag a connection from a node into empty space or use the + on the canvas toolbar or on a node to add steps.
              </div>
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
  marginBottom: '12px',
  paddingLeft: '12px'
};

const sidebarItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '10px 12px',
  borderRadius: '8px',
  fontSize: '13px',
  cursor: 'pointer',
  marginBottom: '4px',
  transition: 'all 0.2s ease',
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
  margin: '0 0 8px',
  fontSize: '14px',
  fontWeight: '700',
  color: '#111827',
  lineHeight: '1.4'
};

const cardDescStyle = {
  margin: 0,
  fontSize: '12px',
  color: '#6b7280',
  lineHeight: '1.5',
};
