import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare, UserPlus, ShoppingBag, Clock, FileText, AlertCircle,
  Gift, RefreshCw, Star, CreditCard, Users, Mail, Zap, ArrowRight, MousePointerClick,
  Search, Bell, Settings, QrCode, Smartphone, X, Stethoscope, Hotel, GraduationCap,
  UtensilsCrossed, Truck, Building2, Dumbbell, Car, BookOpen, Home, Briefcase,
  HeartHandshake, ShoppingCart, Pencil, Plus, ChevronRight
} from 'lucide-react';
import api from '../../context/axios';
import { userContext } from '../../context/Context';
import { showToast } from '../../utils/showToast';
import { PREBUILT_FLOWS } from './prebuiltFlowTemplates';

// ─── All 15 pre-built templates ───────────────────────────────────────────────
const PRE_BUILT_TEMPLATES = [
  // ── Healthcare ─────────────────────────────────────────────
  {
    id: 'qr_reception',
    category: 'Healthcare',
    categoryColor: '#EF4444',
    categoryBg: '#FEF2F2',
    icon: Stethoscope,
    title: 'QR Reception & Staff Routing',
    desc: 'Visitor/patient scans QR Code or wa.me link → collects details, routes to specialist & alerts on Real WhatsApp.',
    tags: ['QR', 'Reception', 'Routing', 'WhatsApp Alert'],
    isQRReception: true,
  },
  {
    id: 'clinic_appointment',
    category: 'Healthcare',
    categoryColor: '#EF4444',
    categoryBg: '#FEF2F2',
    icon: HeartHandshake,
    title: 'Clinic Appointment Booking',
    desc: 'Patients book appointments via WhatsApp by providing name, date & preferred time slot.',
    tags: ['Appointment', 'Booking'],
    keyword: 'appointment',
    actionText: '✅ Thank you! Your appointment request has been received. We will confirm your slot shortly.',
  },
  // ── Hospitality ────────────────────────────────────────────
  {
    id: 'hotel_checkin',
    category: 'Hotel',
    categoryColor: '#F59E0B',
    categoryBg: '#FFFBEB',
    icon: Hotel,
    title: 'Hotel Check-In & Room Service',
    desc: 'Guest scans QR → confirms name → selects service (Room Service, Housekeeping, Concierge) → staff alerted.',
    tags: ['QR', 'Room Service'],
    keyword: 'checkin',
    actionText: '🏨 Welcome to our hotel! How can we assist you today?\n1. Room Service\n2. Housekeeping\n3. Concierge\nReply with your choice.',
  },
  {
    id: 'restaurant_order',
    category: 'Restaurant',
    categoryColor: '#10B981',
    categoryBg: '#ECFDF5',
    icon: UtensilsCrossed,
    title: 'Restaurant Table Ordering',
    desc: 'Customer scans table QR → shares name → browses menu categories → order sent to kitchen.',
    tags: ['QR', 'Order', 'Menu'],
    keyword: 'menu',
    actionText: '🍽️ Welcome! Please share your table number and what you\'d like to order today.',
  },
  // ── Education ──────────────────────────────────────────────
  {
    id: 'college_admission',
    category: 'Education',
    categoryColor: '#3B82F6',
    categoryBg: '#EFF6FF',
    icon: GraduationCap,
    title: 'College Admission Enquiry',
    desc: 'Student sends enquiry → shares course interest → gets programme details + counselor contact.',
    tags: ['Admission', 'Counselor'],
    keyword: 'admission',
    actionText: '🎓 Hello! Welcome to our college admission helpdesk. Which course are you interested in? Share your name and we\'ll connect you with a counselor.',
  },
  {
    id: 'school_fee',
    category: 'Education',
    categoryColor: '#3B82F6',
    categoryBg: '#EFF6FF',
    icon: BookOpen,
    title: 'School Fee Reminder & Enquiry',
    desc: 'Parents receive automated fee reminders and can enquire about fee structures via WhatsApp.',
    tags: ['Fee', 'Reminder', 'Parents'],
    keyword: 'fee',
    actionText: '📚 Hello Parent! You can enquire about fee structure, dues, or payment options here. Please share your child\'s roll number.',
  },
  // ── E-Commerce ─────────────────────────────────────────────
  {
    id: 'ecommerce_order',
    category: 'E-Commerce',
    categoryColor: '#8B5CF6',
    categoryBg: '#F5F3FF',
    icon: ShoppingCart,
    title: 'Order Tracking & Support',
    desc: 'Customer shares order ID → gets live tracking update → option to raise a support ticket.',
    tags: ['Order', 'Tracking', 'Support'],
    keyword: 'track',
    actionText: '📦 Hi! Share your Order ID and we\'ll fetch the latest tracking update for you right away.',
  },
  {
    id: 'ecommerce_return',
    category: 'E-Commerce',
    categoryColor: '#8B5CF6',
    categoryBg: '#F5F3FF',
    icon: RefreshCw,
    title: 'Return & Refund Request',
    desc: 'Customer initiates return → shares order details & reason → support team alerted on WhatsApp.',
    tags: ['Return', 'Refund'],
    keyword: 'return',
    actionText: '🔄 We are sorry to hear that! Please share your Order ID and reason for return so we can process it immediately.',
  },
  // ── Real Estate ────────────────────────────────────────────
  {
    id: 'realestate_lead',
    category: 'Real Estate',
    categoryColor: '#F97316',
    categoryBg: '#FFF7ED',
    icon: Home,
    title: 'Property Enquiry & Site Visit',
    desc: 'Prospect shares name & budget → selects property type → site visit booked → agent alerted.',
    tags: ['Lead', 'Site Visit'],
    keyword: 'property',
    actionText: '🏡 Welcome! Tell us your name, budget and preferred property type (Apartment / Villa / Plot) to get started.',
  },
  // ── Fitness ────────────────────────────────────────────────
  {
    id: 'gym_membership',
    category: 'Fitness',
    categoryColor: '#EC4899',
    categoryBg: '#FDF2F8',
    icon: Dumbbell,
    title: 'Gym Membership & Trial Class',
    desc: 'Lead sends "JOIN" → shares name & goal → picks membership plan → confirmation sent.',
    tags: ['Membership', 'Fitness'],
    keyword: 'join',
    actionText: '💪 Welcome to our gym! Share your name and fitness goal to explore our membership plans.',
  },
  // ── Automobile ─────────────────────────────────────────────
  {
    id: 'car_service',
    category: 'Automobile',
    categoryColor: '#6366F1',
    categoryBg: '#EEF2FF',
    icon: Car,
    title: 'Car Service Appointment',
    desc: 'Customer sends "SERVICE" → shares vehicle number & issue → service slot booked → mechanic alerted.',
    tags: ['Service', 'Appointment'],
    keyword: 'service',
    actionText: '🚗 Hello! Share your vehicle number and the issue you are facing. We will schedule a service slot for you.',
  },
  // ── Corporate ──────────────────────────────────────────────
  {
    id: 'hr_leave',
    category: 'Corporate',
    categoryColor: '#14B8A6',
    categoryBg: '#F0FDFA',
    icon: Briefcase,
    title: 'HR Leave Request Automation',
    desc: 'Employee sends leave request → shares dates & reason → HR manager gets WhatsApp alert.',
    tags: ['HR', 'Leave', 'Alert'],
    keyword: 'leave',
    actionText: '📋 Hi! To apply for leave please share: Start Date, End Date, and Reason.',
  },
  {
    id: 'corporate_visitor',
    category: 'Corporate',
    categoryColor: '#14B8A6',
    categoryBg: '#F0FDFA',
    icon: Building2,
    title: 'Office Visitor Management',
    desc: 'Visitor scans lobby QR → provides name & host name → host gets WhatsApp notification.',
    tags: ['QR', 'Visitor', 'Alert'],
    keyword: 'visit',
    actionText: '🏢 Welcome! Please share your Name and the name of the person you are here to meet.',
  },
  // ── Logistics ──────────────────────────────────────────────
  {
    id: 'logistics_delivery',
    category: 'Logistics',
    categoryColor: '#64748B',
    categoryBg: '#F8FAFC',
    icon: Truck,
    title: 'Delivery Status & Updates',
    desc: 'Customer sends AWB/tracking number → gets instant delivery status → can raise a complaint.',
    tags: ['Delivery', 'Tracking'],
    keyword: 'delivery',
    actionText: '🚚 Share your AWB / tracking number and we\'ll fetch your delivery status instantly.',
  },
  // ── General ────────────────────────────────────────────────
  {
    id: 'feedback_collection',
    category: 'General',
    categoryColor: '#0EA5E9',
    categoryBg: '#F0F9FF',
    icon: Star,
    title: 'Customer Feedback Collection',
    desc: 'After service, customers rate experience (1–5) and leave comments → results stored & alerts sent.',
    tags: ['Feedback', 'Rating'],
    keyword: 'feedback',
    actionText: '⭐ Thank you for visiting us! On a scale of 1–5, how would you rate your experience today?',
  },
  {
    id: 'lead_capture',
    category: 'General',
    categoryColor: '#0EA5E9',
    categoryBg: '#F0F9FF',
    icon: UserPlus,
    title: 'Lead Capture & Follow-Up',
    desc: 'Prospect shares name & requirement → team alerted → automated follow-up message scheduled.',
    tags: ['Lead', 'CRM'],
    keyword: 'info',
    actionText: '👋 Hello! Share your name and what you are looking for and our team will get back to you within 2 hours.',
  },
];

const CATEGORIES = ['All', 'Healthcare', 'Hotel', 'Restaurant', 'Education', 'E-Commerce', 'Real Estate', 'Fitness', 'Automobile', 'Corporate', 'Logistics', 'General'];

// ─── Create Automation Modal ──────────────────────────────────────────────────
function CreateAutomationModal({ onClose, onStartScratch, onUseTemplate, initialView = 'templates' }) {
  const [view, setView] = useState(initialView);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQ, setSearchQ] = useState('');
  const [hoveredId, setHoveredId] = useState(null);

  const filtered = PRE_BUILT_TEMPLATES.filter(t => {
    const matchCat = activeCategory === 'All' || t.category === activeCategory;
    const matchSearch = !searchQ || t.title.toLowerCase().includes(searchQ.toLowerCase()) || t.desc.toLowerCase().includes(searchQ.toLowerCase()) || t.tags.some(tag => tag.toLowerCase().includes(searchQ.toLowerCase()));
    return matchCat && matchSearch;
  });

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
      zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
    }}>
      <div style={{
        background: 'white', borderRadius: '20px', width: '100%',
        maxWidth: view === 'templates' ? '1000px' : '560px',
        maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
        boxShadow: '0 25px 60px rgba(0,0,0,0.2)',
        transition: 'max-width 0.3s ease'
      }}>
        {/* Header */}
        <div style={{ padding: '28px 32px 24px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            {view === 'templates' && (
              <button onClick={() => setView('choice')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', fontSize: '13px', fontWeight: '500', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}>
                ← Back
              </button>
            )}
            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: '#111827' }}>
              {view === 'choice' ? 'Create Automation' : 'Choose a Template'}
            </h2>
            <p style={{ margin: '4px 0 0', color: '#6B7280', fontSize: '14px' }}>
              {view === 'choice' ? 'Start from scratch or pick a ready-made template for your business' : `${filtered.length} templates available — pick one and customize it`}
            </p>
          </div>
          <button onClick={onClose} style={{ background: '#F3F4F6', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={18} color="#6B7280" />
          </button>
        </div>

        {/* Choice View */}
        {view === 'choice' && (
          <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              onClick={onStartScratch}
              style={{ border: '2px solid #E5E7EB', borderRadius: '16px', padding: '28px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '20px', background: 'white' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#10B981'; e.currentTarget.style.background = '#F0FDF4'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.background = 'white'; }}
            >
              <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'linear-gradient(135deg, #10B981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Pencil size={24} color="white" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>Start from Scratch</div>
                <div style={{ fontSize: '13px', color: '#6B7280', lineHeight: '1.5' }}>Build a fully custom flow using the visual drag & drop canvas. Total control over every step.</div>
              </div>
              <ChevronRight size={20} color="#9CA3AF" />
            </div>

            <div
              onClick={() => setView('templates')}
              style={{ border: '2px solid #E5E7EB', borderRadius: '16px', padding: '28px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '20px', background: 'white', position: 'relative', overflow: 'hidden' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366F1'; e.currentTarget.style.background = '#F5F3FF'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.background = 'white'; }}
            >
              <div style={{ position: 'absolute', top: '12px', right: '56px', background: '#6366F1', color: 'white', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '20px' }}>
                {PRE_BUILT_TEMPLATES.length} TEMPLATES
              </div>
              <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FileText size={24} color="white" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>Start with a Pre-built Template</div>
                <div style={{ fontSize: '13px', color: '#6B7280', lineHeight: '1.5' }}>Choose from 15 ready-made flows for Hospital, Hotel, College, Restaurant & more — customize in seconds.</div>
              </div>
              <ChevronRight size={20} color="#9CA3AF" />
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
              {['Healthcare', 'Hotel', 'Education', 'E-Commerce', 'Real Estate', 'Corporate'].map(cat => (
                <span key={cat} onClick={() => { setActiveCategory(cat); setView('templates'); }} style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '20px', padding: '4px 12px', fontSize: '12px', color: '#4B5563', cursor: 'pointer', fontWeight: '500' }}>{cat}</span>
              ))}
              <span onClick={() => setView('templates')} style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '20px', padding: '4px 12px', fontSize: '12px', color: '#6366F1', cursor: 'pointer', fontWeight: '600' }}>+ more →</span>
            </div>
          </div>
        )}

        {/* Templates View */}
        {view === 'templates' && (
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
            <div style={{ padding: '20px 32px', borderBottom: '1px solid #F3F4F6', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px' }}>
                <Search size={15} color="#9CA3AF" style={{ marginRight: '8px' }} />
                <input type="text" placeholder="Search templates..." value={searchQ} onChange={e => setSearchQ(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', width: '100%', color: '#374151' }} autoFocus />
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setActiveCategory(cat)} style={{ padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', border: 'none', background: activeCategory === cat ? '#111827' : '#F3F4F6', color: activeCategory === cat ? 'white' : '#4B5563', transition: 'all 0.15s' }}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ overflowY: 'auto', padding: '24px 32px', flex: 1 }}>
              {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px', color: '#9CA3AF' }}>
                  <div style={{ fontSize: '15px', fontWeight: '600' }}>No templates found</div>
                  <div style={{ fontSize: '13px', marginTop: '4px' }}>Try a different category or search term</div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                  {filtered.map(tpl => {
                    const Icon = tpl.icon;
                    const isHovered = hoveredId === tpl.id;
                    return (
                      <div key={tpl.id} onMouseEnter={() => setHoveredId(tpl.id)} onMouseLeave={() => setHoveredId(null)}
                        style={{ border: `2px solid ${isHovered ? tpl.categoryColor : '#F3F4F6'}`, borderRadius: '14px', padding: '20px', cursor: 'pointer', background: isHovered ? tpl.categoryBg : 'white', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: isHovered ? `0 4px 20px ${tpl.categoryColor}22` : '0 1px 3px rgba(0,0,0,0.04)' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: tpl.categoryBg, border: `1px solid ${tpl.categoryColor}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Icon size={18} color={tpl.categoryColor} />
                          </div>
                          <div>
                            <div style={{ fontSize: '10px', fontWeight: '700', color: tpl.categoryColor, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{tpl.category}</div>
                            <div style={{ fontSize: '14px', fontWeight: '700', color: '#111827', lineHeight: '1.3', marginTop: '1px' }}>{tpl.title}</div>
                          </div>
                        </div>
                        <p style={{ margin: 0, fontSize: '12px', color: '#6B7280', lineHeight: '1.6', flex: 1 }}>{tpl.desc}</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {tpl.tags.map(tag => (
                            <span key={tag} style={{ background: tpl.categoryBg, color: tpl.categoryColor, border: `1px solid ${tpl.categoryColor}33`, borderRadius: '10px', padding: '2px 8px', fontSize: '10px', fontWeight: '600' }}>{tag}</span>
                          ))}
                        </div>
                        <button onClick={() => onUseTemplate(tpl)} style={{ background: isHovered ? tpl.categoryColor : '#F9FAFB', color: isHovered ? 'white' : '#374151', border: 'none', padding: '9px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', marginTop: 'auto' }}>
                          Use This Template →
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

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
  const [settings, setSettings] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
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

  const fetchSettings = async () => {
    try {
      const res = await api.get('/tenant-settings');
      setSettings(res.data);
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    }
  };

  useEffect(() => {
    fetchAutomations();
    fetchSettings();
  }, []);

  const handleToggle = async (automationName) => {
    if (!automationName) return;
    try {
      if (automationName === 'Welcome message') {
        const newValue = !(settings?.welcomeMessage?.enabled || false);
        await api.put('/tenant-settings', { welcomeMessage: { ...settings?.welcomeMessage, enabled: newValue } });
        fetchSettings();
        showToast.success('Welcome Message', newValue ? 'Automation Activated' : 'Automation Paused');
      }
      else if (automationName === 'Away message') {
        const newValue = !(settings?.awayMessage?.enabled || false);
        await api.put('/tenant-settings', { awayMessage: { ...settings?.awayMessage, enabled: newValue } });
        fetchSettings();
        showToast.success('Away Message', newValue ? 'Automation Activated' : 'Automation Paused');
      }
      else if (automationName === 'Fallback message') {
        const newValue = !(settings?.fallbackMessage?.enabled || false);
        await api.put('/tenant-settings', { fallbackMessage: { ...settings?.fallbackMessage, enabled: newValue } });
        fetchSettings();
        showToast.success('Fallback Message', newValue ? 'Automation Activated' : 'Automation Paused');
      }
      else {
        // Normal template automation
        const existing = automations.find(a => a?.name === automationName || (automationName?.includes('QR Reception') && a?.name?.includes('QR Reception')));
        if (existing) {
          const newStatus = !existing.isActive;
          await api.put(`/automation/${existing._id}`, { isActive: newStatus });
          fetchAutomations();
          showToast.success(existing.name, newStatus ? 'Automation Activated' : 'Automation Paused');
        } else if (automationName?.includes('QR Reception')) {
          await handleCreateReceptionTemplate(true);
        } else {
          // If it doesn't exist yet, auto-create it as active!
          let keyword = 'start';
          let action = `Thank you for reaching out regarding ${automationName}!`;
          if (automationName === 'Order Confirmation') {
            keyword = 'order';
            action = 'Your order has been confirmed!';
          } else if (automationName === 'Weekly Reports') {
            keyword = 'report';
            action = 'Here is your weekly report summary.';
          }
          await handleCreateTemplate(automationName, keyword, action, true);
        }
      }
    } catch (e) {
      console.error('Toggle failed', e);
    }
  };

  const checkIsActive = (name) => {
    if (!name) return false;
    if (name === 'Welcome message') return settings?.welcomeMessage?.enabled || false;
    if (name === 'Away message') return settings?.awayMessage?.enabled || false;
    if (name === 'Fallback message') return settings?.fallbackMessage?.enabled || false;
    
    // Normal template automation
    const existing = automations.find(a => 
      a?.name === name || 
      (name?.includes('QR Reception') && a?.name?.toLowerCase().includes('qr reception'))
    );
    return existing ? existing.isActive : false;
  };

  const handleCreateRichTemplate = async (tpl, startActive = false) => {
    try {
      const flowId = tpl?.id || (tpl?.isQRReception ? 'qr_reception' : null);
      const prebuilt = (flowId && PREBUILT_FLOWS[flowId]) ? PREBUILT_FLOWS[flowId] : null;

      const templateName = prebuilt?.name || tpl?.title || 'New Automation Flow';

      // Check if existing
      const existingFlow = automations.find(a => 
        a.name === templateName || 
        a.name === tpl?.title ||
        (flowId === 'qr_reception' && (a.name === 'QR Reception Desk & Doctor Routing' || a.name?.toLowerCase().includes('qr reception')))
      );
      if (existingFlow) {
        showToast.info("Opening Flow", `Opening your existing ${existingFlow.name} flow...`);
        navigate(`/admin/automation/${existingFlow._id}`);
        return;
      }

      let channelId = settings?.defaultChannelId;
      if (!channelId) {
        const channelsRes = await api.get('/whatsapp/channels');
        if (channelsRes.data && channelsRes.data.length > 0) {
          channelId = channelsRes.data[0]._id;
        } else {
          showToast.warning("Channel Needed", "Please connect a WhatsApp channel first or set a Default Channel in settings.");
          return;
        }
      }

      let finalName = templateName;
      if (automations.some(a => a.name === finalName)) {
        let counter = 2;
        while (automations.some(a => a.name === `${templateName} (${counter})`)) {
          counter++;
        }
        finalName = `${templateName} (${counter})`;
      }

      let nodes = prebuilt?.nodes;
      let edges = prebuilt?.edges;

      if (!nodes || nodes.length === 0) {
        nodes = [
          {
            id: '1', type: 'triggerNode', position: { x: 50, y: 250 },
            data: { label: 'Step 1: Trigger', triggerType: 'keyword', keyword: tpl?.keyword || 'start' }
          },
          {
            id: '2', type: 'inputNode', position: { x: 380, y: 250 },
            data: { label: 'Step 2: Collect Name', text: 'Hello! Please share your Full Name:', question: 'Hello! Please share your Full Name:', validationType: 'name', variableName: 'name' }
          },
          {
            id: '3', type: 'actionNode', position: { x: 710, y: 250 },
            data: { label: 'Alert Staff (WhatsApp)', actionType: 'notify_whatsapp', recipientPhone: '+919876543200', notificationMessage: `New inquiry for ${finalName} from {{name}} (+{{contact.phone}})` }
          },
          {
            id: '4', type: 'messageNode', position: { x: 1040, y: 250 },
            data: { label: 'Confirmation', messageType: 'text', text: tpl?.actionText || `Thank you {{name}}! We will get back to you shortly.` }
          }
        ];
        edges = [
          { id: 'e1-2', source: '1', sourceHandle: 'main-handle', target: '2', targetHandle: 'target-handle', type: 'smoothstep' },
          { id: 'e2-3', source: '2', sourceHandle: 'main-handle', target: '3', type: 'smoothstep' },
          { id: 'e3-4', source: '3', sourceHandle: 'main-handle', target: '4', type: 'smoothstep' }
        ];
      }

      const res = await api.post('/automation', {
        name: finalName,
        isActive: startActive,
        channelId,
        nodes,
        edges
      });

      if (res.data && res.data._id) {
        showToast.success(finalName, "Complete business template ready! Opening canvas...");
        navigate(`/admin/automation/${res.data._id}`);
      }
    } catch (error) {
      console.error('Failed to create template:', error);
      const errMsg = error.response?.data?.message || "Failed to create template flow.";
      showToast.error("Template Error", errMsg);
    }
  };

  const handleCreateTemplate = async (templateName, triggerKeyword, actionText, startActive = false) => {
    const match = PRE_BUILT_TEMPLATES.find(t => t.title === templateName || t.keyword === triggerKeyword);
    if (match) {
      await handleCreateRichTemplate(match, startActive);
    } else {
      await handleCreateRichTemplate({ title: templateName, keyword: triggerKeyword, actionText }, startActive);
    }
  };

  const handleCreateReceptionTemplate = async (startActive = false) => {
    await handleCreateRichTemplate({ id: 'qr_reception', title: 'QR Reception Desk & Doctor Routing', isQRReception: true }, startActive);
  };

  const AutomationCard = ({ 
    title, activeStatus, onToggle, 
    triggerIcon: TriggerIcon, triggerText, 
    actionIcon: ActionIcon, actionText, 
    buttonText, onButtonClick, 
    showTwoButtons, onScratch, onTemplate,
    hideToggle, hideBadge 
  }) => (
    <div style={{
      background: 'white', borderRadius: '12px', padding: '24px',
      border: '1px solid #F3F4F6', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '20px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>{title}</h3>
          {!hideBadge && <Badge isActive={activeStatus} />}
        </div>
        {!hideToggle && <ToggleSwitch isActive={activeStatus} onChange={onToggle} />}
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

      {showTwoButtons ? (
        <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', paddingTop: '16px' }}>
          <button
            onClick={onScratch}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0', padding: '9px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#DCFCE7'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#F0FDF4'; }}
          >
            <Pencil size={13} />
            Start from Scratch
          </button>
          <button
            onClick={onTemplate}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: '#F5F3FF', color: '#6366F1', border: '1px solid #C4B5FD', padding: '9px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#EDE9FE'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#F5F3FF'; }}
          >
            <FileText size={13} />
            Pre-built Template
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'auto', paddingTop: '16px' }}>
          <button 
            onClick={onButtonClick}
            style={{
              background: '#F0FDF4', 
              color: '#16A34A', border: '1px solid #BBF7D0',
              padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {buttonText}
          </button>
        </div>
      )}
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

  const handleStartScratch = () => {
    setShowCreateModal(false);
    navigate('/admin/automation/new', { 
      state: { 
        flowName: 'QR Automation Flow',
        startMode: 'scratch'
      } 
    });
  };

  // Handle template use from modal
  const handleUseTemplate = async (tpl) => {
    setShowCreateModal(false);
    await handleCreateRichTemplate(tpl);
  };

  const existingReception = automations.find(a => 
    a.name === 'QR Reception Desk & Doctor Routing' || 
    a.name?.toLowerCase().includes('qr reception')
  );
  const existingOrder = automations.find(a => a.name === 'Order Confirmation');
  const existingReports = automations.find(a => a.name === 'Weekly Reports');

  const basicCards = filterCards([
    {
      title: "QR Automation", 
      hideToggle: true,
      hideBadge: true,
      showTwoButtons: true,
      triggerIcon: QrCode, 
      triggerText: "Scan reception QR Code or click wa.me link", 
      actionIcon: Smartphone, 
      actionText: "Collect details, route to specialist & alert on Real WhatsApp",
      onScratch: handleStartScratch,
      onTemplate: () => setShowCreateModal(true),
    },
    {
      title: "Welcome New Users", activeStatusName: 'Welcome message', toggleName: 'Welcome message',
      triggerIcon: UserPlus, triggerText: "When user signs up", actionIcon: Mail, actionText: "Send welcome email",
      buttonText: "Configure settings", onButtonClick: () => onNavigateWelcomeMessage?.()
    },
    {
      title: "Order Confirmation", activeStatusName: 'Order Confirmation', toggleName: 'Order Confirmation',
      triggerIcon: ShoppingBag, triggerText: "When new order is placed", actionIcon: ArrowRight, actionText: "Send confirmation email with order details",
      buttonText: existingOrder ? "Open Canvas" : "Use Template",
      onButtonClick: () => {
        if (existingOrder) navigate(`/admin/automation/${existingOrder._id}`);
        else handleCreateTemplate('Order Confirmation', 'order', 'Your order is confirmed!');
      }
    },
    {
      title: "Away message", activeStatusName: 'Away message', toggleName: 'Away message',
      triggerIcon: Zap, triggerText: "Reply automatically when you are away", actionIcon: ArrowRight, actionText: "Send reminder notification",
      buttonText: "Configure settings", onButtonClick: () => onNavigateAwayMessage?.()
    },
    {
      title: "Weekly Reports", activeStatusName: 'Weekly Reports', toggleName: 'Weekly Reports',
      triggerIcon: Clock, triggerText: "Every Monday at 9 AM", actionIcon: ArrowRight, actionText: "Send analytics report to team",
      buttonText: existingReports ? "Open Canvas" : "Use Template",
      onButtonClick: () => {
        if (existingReports) navigate(`/admin/automation/${existingReports._id}`);
        else handleCreateTemplate('Weekly Reports', 'report', 'Here is your weekly report summary.');
      }
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

      {/* Modal */}
      {showCreateModal && (
        <CreateAutomationModal
          onClose={() => setShowCreateModal(false)}
          onStartScratch={handleStartScratch}
          onUseTemplate={handleUseTemplate}
        />
      )}
      
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
                showTwoButtons={c.showTwoButtons}
                onScratch={c.onScratch}
                onTemplate={c.onTemplate}
                hideToggle={c.hideToggle}
                hideBadge={c.hideBadge}
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
                        </div>
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
                          onClick={() => setShowCreateModal(true)}
                          style={{ background: '#10B981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                          Create Chatbot
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
                          Configure settings
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
                    onClick={() => handleCreateTemplate(tpl.title, tpl.title.toLowerCase().replace(/\s/g, '_'), tpl.desc)}
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
