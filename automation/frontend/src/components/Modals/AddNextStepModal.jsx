import React, { useState } from 'react';
import { 
  X, Search, MessageSquare, Menu, MousePointerClick, Bookmark, 
  ShoppingBag, ShoppingCart, Image as ImageIcon, Video, FileText, 
  BellRing, BellOff, Edit3, Webhook, Hourglass, UserPlus, UserMinus, 
  Clock, Split, HelpCircle, Hash, Smartphone, Mail, Calendar as CalendarIcon, MapPin,
  Link, Home, ImagePlus, Mic, FilePlus, Bot, Sparkles, Zap, LayoutTemplate,
  GalleryHorizontalEnd, ListChecks, Key, Tag, Receipt, CreditCard, Contact, FileImage, SmilePlus, Shuffle, ShoppingBag as ShopifyIcon
} from 'lucide-react';

export default function AddNextStepModal({ onClose, onSelectStep }) {
  const [searchQuery, setSearchQuery] = useState('');

  const nodeGroups = [
    {
      group: 'WHATSAPP MESSAGES',
      items: [
        { id: 'interactive_msg', label: 'Interactive', icon: <MousePointerClick size={16} />, color: '#059669', bg: '#ecfdf5' },
        { id: 'button_msg', label: 'Button', icon: <MousePointerClick size={16} />, color: '#059669', bg: '#ecfdf5' },
        { id: 'menu_msg', label: 'Menu Message', icon: <Menu size={16} />, color: '#059669', bg: '#ecfdf5' },
        { id: 'list_msg', label: 'List', icon: <Menu size={16} />, color: '#059669', bg: '#ecfdf5' },
        { id: 'text_msg', label: 'Text', icon: <MessageSquare size={16} />, color: '#059669', bg: '#ecfdf5' },
        { id: 'btn_ref', label: 'Button reference', icon: <Bookmark size={16} />, color: '#3b82f6', bg: '#eff6ff' }
      ]
    },
    {
      group: 'CATALOGUE',
      items: [
        { id: 'catalog', label: 'Catalog', icon: <ShoppingBag size={16} />, color: '#d97706', bg: '#fef3c7' },
        { id: 'single_product', label: 'Single Product Message', icon: <ShoppingBag size={16} />, color: '#d97706', bg: '#fef3c7' },
        { id: 'multi_product', label: 'Multiple Product Message', icon: <ShoppingCart size={16} />, color: '#d97706', bg: '#fef3c7' }
      ]
    },
    {
      group: 'MEDIA',
      items: [
        { id: 'image_msg', label: 'Image', icon: <ImageIcon size={16} />, color: '#8b5cf6', bg: '#f3e8ff' },
        { id: 'video_msg', label: 'Video', icon: <Video size={16} />, color: '#8b5cf6', bg: '#f3e8ff' },
        { id: 'doc_msg', label: 'Document', icon: <FileText size={16} />, color: '#8b5cf6', bg: '#f3e8ff' },
        { id: 'audio_msg', label: 'Audio', icon: <Mic size={16} />, color: '#8b5cf6', bg: '#f3e8ff' },
        { id: 'voice_msg', label: 'Voice', icon: <Mic size={16} />, color: '#8b5cf6', bg: '#f3e8ff' },
        { id: 'sticker_msg', label: 'Sticker', icon: <ImagePlus size={16} />, color: '#8b5cf6', bg: '#f3e8ff' },
        { id: 'gif_msg', label: 'GIF', icon: <FileImage size={16} />, color: '#8b5cf6', bg: '#f3e8ff' }
      ]
    },
    {
      group: 'INTERACTIVE',
      items: [
        { id: 'carousel_msg', label: 'Carousel', icon: <GalleryHorizontalEnd size={16} />, color: '#ec4899', bg: '#fce7f3' },
        { id: 'poll_msg', label: 'Poll', icon: <ListChecks size={16} />, color: '#0ea5e9', bg: '#e0f2fe' },
        { id: 'reaction_msg', label: 'Reaction', icon: <SmilePlus size={16} />, color: '#eab308', bg: '#fefce8' }
      ]
    },
    {
      group: 'COMMERCE',
      items: [
        { id: 'otp_msg', label: 'OTP', icon: <Key size={16} />, color: '#10b981', bg: '#d1fae5' },
        { id: 'coupon_msg', label: 'Coupon', icon: <Tag size={16} />, color: '#10b981', bg: '#d1fae5' },
        { id: 'invoice_msg', label: 'Invoice', icon: <Receipt size={16} />, color: '#10b981', bg: '#d1fae5' },
        { id: 'payment_msg', label: 'Payment Link', icon: <CreditCard size={16} />, color: '#10b981', bg: '#d1fae5' }
      ]
    },
    {
      group: 'UTILITY',
      items: [
        { id: 'location_msg', label: 'Location', icon: <MapPin size={16} />, color: '#6366f1', bg: '#e0e7ff' },
        { id: 'contact_msg', label: 'Contact', icon: <Contact size={16} />, color: '#6366f1', bg: '#e0e7ff' },
        { id: 'calendar_msg', label: 'Calendar Invite', icon: <CalendarIcon size={16} />, color: '#6366f1', bg: '#e0e7ff' }
      ]
    },
    {
      group: 'ACTIONS',
      items: [
        { id: 'opt_in', label: 'Marketing Opt-in', icon: <BellRing size={16} />, color: '#10b981', bg: '#d1fae5' },
        { id: 'opt_out', label: 'Marketing Opt-out', icon: <BellOff size={16} />, color: '#ef4444', bg: '#fee2e2' },
        { id: 'update_contact', label: 'Update contact fields', icon: <Edit3 size={16} />, color: '#f59e0b', bg: '#fef3c7' },
        { id: 'api_call', label: 'API call', icon: <Webhook size={16} />, color: '#3b82f6', bg: '#eff6ff' },
        { id: 'wait_input', label: 'Wait for user input', icon: <Hourglass size={16} />, color: '#3b82f6', bg: '#eff6ff' },
        { id: 'assign_team', label: 'Assign Team Member', icon: <UserPlus size={16} />, color: '#10b981', bg: '#d1fae5' },
        { id: 'round_robin_assign', label: 'Round-Robin Handoff', icon: <UserPlus size={16} />, color: '#10b981', bg: '#d1fae5' },
        { id: 'unassign_team', label: 'Unassign Team Member', icon: <UserMinus size={16} />, color: '#f43f5e', bg: '#ffe4e6' },
        { id: 'delay', label: 'Add delay', icon: <Clock size={16} />, color: '#3b82f6', bg: '#eff6ff' },
        { id: 'wait_event', label: 'Wait for Event (Timeout)', icon: <Hourglass size={16} />, color: '#3b82f6', bg: '#eff6ff' },
        { id: 'if_else', label: 'If / Else', icon: <Split size={16} />, color: '#64748b', bg: '#f1f5f9' },
        { id: 'randomizer', label: 'Randomizer (A/B Test)', icon: <Shuffle size={16} />, color: '#ec4899', bg: '#fce7f3' }
      ]
    },
    {
      group: 'APP INTEGRATIONS',
      items: [
        { id: 'shopify', label: 'Shopify', icon: <ShopifyIcon size={16} />, color: '#95bf47', bg: '#f4f9eb' }
      ]
    },
    {
      group: 'ASK A QUESTION',
      items: [
        { id: 'ask_text', label: 'Ask text', icon: <MessageSquare size={16} />, color: '#10b981', bg: '#d1fae5' },
        { id: 'ask_anything', label: 'Ask anything', icon: <HelpCircle size={16} />, color: '#10b981', bg: '#d1fae5' },
        { id: 'ask_number', label: 'Ask number', icon: <Hash size={16} />, color: '#10b981', bg: '#d1fae5' },
        { id: 'ask_mobile', label: 'Ask mobile', icon: <Smartphone size={16} />, color: '#10b981', bg: '#d1fae5' },
        { id: 'ask_email', label: 'Ask email', icon: <Mail size={16} />, color: '#10b981', bg: '#d1fae5' },
        { id: 'ask_date', label: 'Ask date', icon: <CalendarIcon size={16} />, color: '#10b981', bg: '#d1fae5' },
        { id: 'ask_location', label: 'Ask location', icon: <MapPin size={16} />, color: '#10b981', bg: '#d1fae5' },
        { id: 'ask_url', label: 'Ask URL', icon: <Link size={16} />, color: '#10b981', bg: '#d1fae5' },
        { id: 'ask_address', label: 'Ask address', icon: <Home size={16} />, color: '#10b981', bg: '#d1fae5' },
        { id: 'ask_photo', label: 'Ask photo', icon: <ImagePlus size={16} />, color: '#10b981', bg: '#d1fae5' },
        { id: 'ask_audio', label: 'Ask audio', icon: <Mic size={16} />, color: '#10b981', bg: '#d1fae5' },
        { id: 'ask_pdf', label: 'Ask PDF', icon: <FilePlus size={16} />, color: '#10b981', bg: '#d1fae5' }
      ]
    },
    {
      group: 'AI BOTS',
      items: [
        { id: 'call_chatgpt', label: 'Call Chatgpt api', icon: <Bot size={16} />, color: '#0ea5e9', bg: '#e0f2fe' },
        { id: 'garvik_ai', label: 'Garvik AI', icon: <Sparkles size={16} />, color: '#8b5cf6', bg: '#f3e8ff' }
      ]
    },
    {
      group: 'MORE',
      items: [
        { id: 'quick_reply', label: 'Quick Reply', icon: <Zap size={16} />, color: '#10b981', bg: '#d1fae5' },
        { id: 'template', label: 'Template', icon: <LayoutTemplate size={16} />, color: '#8b5cf6', bg: '#f3e8ff' }
      ]
    }
  ];

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
      <div style={{
        background: 'white',
        width: '100%',
        maxWidth: '560px',
        height: '80vh',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden'
      }}>
        
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#111827' }}>Add next step</h2>
          <button onClick={onClose} style={{
            background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af'
          }}>
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} color="#9ca3af" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search steps..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '12px 16px 12px 42px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', outline: 'none', color: '#1f2937', boxSizing: 'border-box', background: '#fcfcfd' }}
            />
          </div>
        </div>

        {/* List Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 24px' }}>
          {nodeGroups.map((group, idx) => {
            const filteredItems = group.items.filter(item => item.label.toLowerCase().includes(searchQuery.toLowerCase()));
            
            if (filteredItems.length === 0) return null;

            return (
              <div key={idx} style={{ marginTop: '24px' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', letterSpacing: '0.05em', marginBottom: '12px' }}>
                  {group.group}
                </div>
                <div style={{ border: '1px solid #f3f4f6', borderRadius: '12px', overflow: 'hidden' }}>
                  {filteredItems.map((item, itemIdx) => (
                    <div 
                      key={item.id}
                      onClick={() => onSelectStep(item)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 16px',
                        cursor: 'pointer', background: 'white',
                        borderBottom: itemIdx < filteredItems.length - 1 ? '1px solid #f3f4f6' : 'none',
                        transition: 'background 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#f9fafb'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                    >
                      <div style={{ 
                        width: '32px', height: '32px', borderRadius: '8px', 
                        background: item.bg, color: item.color, 
                        display: 'flex', alignItems: 'center', justifyContent: 'center' 
                      }}>
                        {item.icon}
                      </div>
                      <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
