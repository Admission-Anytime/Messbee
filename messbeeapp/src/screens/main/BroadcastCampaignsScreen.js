import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
  Alert,
  Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

// =============================================================================
// INITIAL REALISTIC DATA: CAMPAIGNS, TEMPLATES, AUDIENCE & RECIPIENT LEDGERS
// =============================================================================

const INITIAL_CAMPAIGNS_DATA = [
  {
    id: 'camp_001',
    name: 'diwali_mega_sale_announcement',
    title: 'Diwali Mega Sale 50% Off',
    templateId: 'tmpl_diwali_offer',
    templateName: 'diwali_special_offer',
    category: 'MARKETING',
    status: 'ACTIVE', // 'ACTIVE' | 'SCHEDULED' | 'COMPLETED' | 'PAUSED' | 'DRAFT' | 'FAILED'
    createdAt: '2026-11-14T09:30:00Z',
    scheduledFor: '2026-11-14T10:00:00Z',
    paceMode: 'STANDARD', // 'SAFE' (10/min) | 'STANDARD' (60/min) | 'HIGH_SPEED' (200/min)
    targetAudience: 'VIP & Past Purchasers',
    targetCount: 1450,
    sentCount: 1120,
    deliveredCount: 1098,
    readCount: 942,
    repliedCount: 284,
    failedCount: 22,
    costPerMsg: 0.78,
    totalBudget: 1131.0,
    spentAmount: 873.6,
    tags: ['Diwali', 'Discount', 'High Value'],
    variablesMapping: {
      '{{1}}': 'Contact Name',
      '{{2}}': 'DIWALI50',
      '{{3}}': '15 Nov 2026',
    },
    recipients: [
      { id: 'rc_1', name: 'Aman Sharma', phone: '+91 98765 43210', status: 'READ', deliveredAt: '10:02 AM', readAt: '10:05 AM', replied: true, lastReply: 'Can I apply this on electronics?' },
      { id: 'rc_2', name: 'Pooja Verma', phone: '+91 98111 22334', status: 'REPLIED', deliveredAt: '10:03 AM', readAt: '10:04 AM', replied: true, lastReply: 'Order placed, thank you!' },
      { id: 'rc_3', name: 'Rohan Mehra', phone: '+91 99222 33445', status: 'DELIVERED', deliveredAt: '10:08 AM', readAt: null, replied: false, lastReply: null },
      { id: 'rc_4', name: 'Zoya Khan', phone: '+91 97333 44556', status: 'READ', deliveredAt: '10:12 AM', readAt: '10:20 AM', replied: false, lastReply: null },
      { id: 'rc_5', name: 'Vikram Singh', phone: '+91 91444 55667', status: 'FAILED', deliveredAt: null, readAt: null, replied: false, failReason: 'Meta 131026: Message undeliverable to non-WA number' },
      { id: 'rc_6', name: 'Sunil Gupta', phone: '+91 98555 66778', status: 'READ', deliveredAt: '10:15 AM', readAt: '10:19 AM', replied: true, lastReply: 'Send payment link please' },
      { id: 'rc_7', name: 'Neha Chawla', phone: '+91 99666 77889', status: 'DELIVERED', deliveredAt: '10:22 AM', readAt: null, replied: false, lastReply: null },
      { id: 'rc_8', name: 'Kabir Das', phone: '+91 98777 88990', status: 'READ', deliveredAt: '10:25 AM', readAt: '10:30 AM', replied: false, lastReply: null },
    ],
  },
  {
    id: 'camp_002',
    name: 'cart_abandonment_recovery_blast',
    title: 'Cart Recovery (10% Extra Discount)',
    templateId: 'tmpl_cart_recovery',
    templateName: 'cart_recovery_reminder',
    category: 'MARKETING',
    status: 'ACTIVE',
    createdAt: '2026-11-14T11:00:00Z',
    scheduledFor: '2026-11-14T11:15:00Z',
    paceMode: 'SAFE',
    targetAudience: 'Incomplete Checkout (Last 48h)',
    targetCount: 420,
    sentCount: 310,
    deliveredCount: 304,
    readCount: 268,
    repliedCount: 89,
    failedCount: 6,
    costPerMsg: 0.78,
    totalBudget: 327.6,
    spentAmount: 241.8,
    tags: ['Cart', 'Auto-Trigger', 'High Conversion'],
    variablesMapping: {
      '{{1}}': 'Customer Name',
      '{{2}}': 'Wireless Earbuds Pro',
      '{{3}}': 'CART10',
    },
    recipients: [
      { id: 'rc_10', name: 'Aditya Roy', phone: '+91 98201 12345', status: 'READ', deliveredAt: '11:18 AM', readAt: '11:22 AM', replied: true, lastReply: 'Is cash on delivery available?' },
      { id: 'rc_11', name: 'Simran Kaur', phone: '+91 98334 56789', status: 'REPLIED', deliveredAt: '11:20 AM', readAt: '11:21 AM', replied: true, lastReply: 'Completed checkout now' },
      { id: 'rc_12', name: 'Manish Patel', phone: '+91 98456 78901', status: 'DELIVERED', deliveredAt: '11:25 AM', readAt: null, replied: false, lastReply: null },
    ],
  },
  {
    id: 'camp_003',
    name: 'black_friday_vip_early_access',
    title: 'Black Friday VIP Early Access',
    templateId: 'tmpl_black_friday',
    templateName: 'black_friday_early_bird',
    category: 'MARKETING',
    status: 'SCHEDULED',
    createdAt: '2026-11-13T16:00:00Z',
    scheduledFor: '2026-11-20T08:00:00Z',
    paceMode: 'HIGH_SPEED',
    targetAudience: 'All Subscribed Members (Tier 1)',
    targetCount: 5200,
    sentCount: 0,
    deliveredCount: 0,
    readCount: 0,
    repliedCount: 0,
    failedCount: 0,
    costPerMsg: 0.78,
    totalBudget: 4056.0,
    spentAmount: 0.0,
    tags: ['Black Friday', 'Early Access', 'Tier 1'],
    variablesMapping: {
      '{{1}}': 'Member Name',
      '{{2}}': '24 Hours Before Public',
    },
    recipients: [],
  },
  {
    id: 'camp_004',
    name: 'monthly_account_statement_utility',
    title: 'November Account Statement & Invoice',
    templateId: 'tmpl_monthly_bill',
    templateName: 'account_statement_notice',
    category: 'UTILITY',
    status: 'COMPLETED',
    createdAt: '2026-11-01T08:00:00Z',
    scheduledFor: '2026-11-01T09:00:00Z',
    paceMode: 'STANDARD',
    targetAudience: 'Active Paying Accounts',
    targetCount: 850,
    sentCount: 850,
    deliveredCount: 842,
    readCount: 780,
    repliedCount: 42,
    failedCount: 8,
    costPerMsg: 0.35,
    totalBudget: 297.5,
    spentAmount: 297.5,
    tags: ['Invoice', 'Utility', 'Billing'],
    variablesMapping: {
      '{{1}}': 'Business Name',
      '{{2}}': 'October 2026',
      '{{3}}': 'INV-2026-1042',
    },
    recipients: [
      { id: 'rc_20', name: 'Greenleaf Traders', phone: '+91 97111 00223', status: 'READ', deliveredAt: '09:02 AM', readAt: '09:10 AM', replied: false, lastReply: null },
      { id: 'rc_21', name: 'Nova Infotech', phone: '+91 97222 11334', status: 'READ', deliveredAt: '09:03 AM', readAt: '09:08 AM', replied: true, lastReply: 'Received, tax invoice downloaded' },
    ],
  },
  {
    id: 'camp_005',
    name: 'lead_reactivation_q4_special',
    title: 'Re-engagement: 90 Days Inactive Leads',
    templateId: 'tmpl_reengagement',
    templateName: 'we_miss_you_reactivate',
    category: 'MARKETING',
    status: 'PAUSED',
    createdAt: '2026-11-12T14:20:00Z',
    scheduledFor: '2026-11-12T15:00:00Z',
    paceMode: 'SAFE',
    targetAudience: 'Inactive Leads (>90 Days)',
    targetCount: 1200,
    sentCount: 450,
    deliveredCount: 432,
    readCount: 310,
    repliedCount: 65,
    failedCount: 18,
    costPerMsg: 0.78,
    totalBudget: 936.0,
    spentAmount: 351.0,
    tags: ['Reactivation', 'Winback', 'Paused'],
    variablesMapping: {
      '{{1}}': 'First Name',
      '{{2}}': 'Free 1-on-1 Consultation',
    },
    recipients: [],
  },
];

const INITIAL_AUDIENCE_SEGMENTS = [
  { id: 'seg_1', name: 'All Registered Contacts', count: 4890, description: 'Every valid WhatsApp contact in database', icon: 'people', color: '#059669' },
  { id: 'seg_2', name: 'VIP High-Spenders', count: 450, description: 'Lifetime value > ₹25,000 with 3+ purchases', icon: 'star', color: '#D97706' },
  { id: 'seg_3', name: 'New Leads (Last 7 Days)', count: 320, description: 'Fresh inquiries received via website & Instagram', icon: 'flash', color: '#2563EB' },
  { id: 'seg_4', name: 'Abandoned Checkout', count: 185, description: 'Added products to cart but did not purchase in 48h', icon: 'cart', color: '#DC2626' },
  { id: 'seg_5', name: 'CRM Stage: Won / Active', count: 890, description: 'Customers currently tagged in Won pipeline stage', icon: 'checkmark-circle', color: '#10B981' },
  { id: 'seg_6', name: 'Tag: Webinar Attendees', count: 640, description: 'Contacts tagged during live product demo session', icon: 'videocam', color: '#7C3AED' },
  { id: 'seg_7', name: 'Tag: Urgent Follow-Up', count: 95, description: 'Manual priority follow-up requested by sales team', icon: 'flag', color: '#EA580C' },
];

const APPROVED_TEMPLATES_CATALOG = [
  {
    id: 'tmpl_diwali_offer',
    name: 'diwali_special_offer',
    displayName: 'Diwali Festive Mega Offer',
    category: 'MARKETING',
    language: 'English (en_US)',
    status: 'APPROVED',
    headerType: 'IMAGE',
    headerText: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987',
    bodyText: 'Happy Diwali *{{1}}*! 🪔\n\nCelebrate this festive season with exclusive 50% OFF on our entire catalog. Use coupon code *{{2}}* at checkout.\n\nHurry, offer ends on *{{3}}*.',
    footerText: 'MessBee Retail • Stop to unsubscribe',
    buttons: [
      { id: 'b1', type: 'URL', text: 'Shop Now 🛍️', url: 'https://messbee.com/shop' },
      { id: 'b2', type: 'QUICK_REPLY', text: 'Talk to Sales' },
    ],
    variablesCount: 3,
    sampleValues: ['Aman', 'DIWALI50', '15 Nov 2026'],
  },
  {
    id: 'tmpl_cart_recovery',
    name: 'cart_recovery_reminder',
    displayName: 'Cart Abandonment Reminder',
    category: 'MARKETING',
    language: 'English (en_US)',
    status: 'APPROVED',
    headerType: 'TEXT',
    headerText: 'Did you leave something behind?',
    bodyText: 'Hey *{{1}}*, we noticed you left *{{2}}* in your shopping bag!\n\nComplete your order now and enjoy an extra 10% discount with promo code *{{3}}*.',
    footerText: 'Expires in 6 hours • MessBee Express',
    buttons: [
      { id: 'b1', type: 'URL', text: 'Complete Order 🛒', url: 'https://messbee.com/cart' },
      { id: 'b2', type: 'QUICK_REPLY', text: 'Need Help?' },
    ],
    variablesCount: 3,
    sampleValues: ['Priya', 'Wireless Earbuds Pro', 'CART10'],
  },
  {
    id: 'tmpl_black_friday',
    name: 'black_friday_early_bird',
    displayName: 'Black Friday VIP Invite',
    category: 'MARKETING',
    language: 'English (en_US)',
    status: 'APPROVED',
    headerType: 'IMAGE',
    headerText: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da',
    bodyText: 'Exclusive VIP Access for *{{1}}*! 🚀\n\nAs a privileged member, your early bird access unlocks *{{2}}*. Be the first to grab the biggest discounts of the year.',
    footerText: 'MessBee Prime Member Benefit',
    buttons: [
      { id: 'b1', type: 'URL', text: 'Unlock Deals 🔓', url: 'https://messbee.com/black-friday' },
      { id: 'b2', type: 'QUICK_REPLY', text: 'Opt Out' },
    ],
    variablesCount: 2,
    sampleValues: ['Rohan', '24 Hours Before Public'],
  },
  {
    id: 'tmpl_monthly_bill',
    name: 'account_statement_notice',
    displayName: 'Monthly Statement & Invoice',
    category: 'UTILITY',
    language: 'English (en_US)',
    status: 'APPROVED',
    headerType: 'TEXT',
    headerText: 'Monthly Account Statement',
    bodyText: 'Dear *{{1}}*, your account statement for *{{2}}* is now ready.\n\nInvoice Number: *{{3}}*. Your monthly invoice PDF is attached for your records.',
    footerText: 'MessBee Billing Support',
    buttons: [
      { id: 'b1', type: 'URL', text: 'Download Invoice 📄', url: 'https://messbee.com/billing' },
      { id: 'b2', type: 'QUICK_REPLY', text: 'Query Invoice' },
    ],
    variablesCount: 3,
    sampleValues: ['Greenleaf Traders', 'October 2026', 'INV-2026-1042'],
  },
  {
    id: 'tmpl_reengagement',
    name: 'we_miss_you_reactivate',
    displayName: 'Winback Inactive Customers',
    category: 'MARKETING',
    language: 'English (en_US)',
    status: 'APPROVED',
    headerType: 'NONE',
    headerText: '',
    bodyText: 'Hello *{{1}}*! We haven\'t seen you in a while and wanted to make sure everything is going smoothly.\n\nWe\'d love to offer you a *{{2}}* to help scale your business this quarter.',
    footerText: 'MessBee Customer Success',
    buttons: [
      { id: 'b1', type: 'URL', text: 'Book Free Session 📅', url: 'https://messbee.com/book' },
      { id: 'b2', type: 'QUICK_REPLY', text: 'Not Interested' },
    ],
    variablesCount: 2,
    sampleValues: ['Afzal', 'Free 1-on-1 Consultation'],
  },
];

// =============================================================================
// COMPONENT MAIN EXPORT
// =============================================================================

export default function BroadcastCampaignsScreen({ navigation }) {
  // Navigation Tabs: 'campaigns' | 'create' | 'audience' | 'analytics'
  const [activeMainTab, setActiveMainTab] = useState('campaigns');

  // Campaigns State
  const [campaigns, setCampaigns] = useState(INITIAL_CAMPAIGNS_DATA);
  const [campaignSearch, setCampaignSearch] = useState('');
  const [campaignStatusFilter, setCampaignStatusFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'SCHEDULED' | 'COMPLETED' | 'PAUSED'
  const [sortBy, setSortBy] = useState('NEWEST');

  // Selected Campaign Details Modal
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [ledgerFilter, setLedgerFilter] = useState('ALL'); // 'ALL' | 'DELIVERED' | 'READ' | 'REPLIED' | 'FAILED'

  // Live WhatsApp Preview Modal
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(APPROVED_TEMPLATES_CATALOG[0]);
  const [previewSampleVars, setPreviewSampleVars] = useState({
    '{{1}}': 'Aman Sharma',
    '{{2}}': 'DIWALI50',
    '{{3}}': '15 Nov 2026',
  });

  // Audience Segments State
  const [segments, setSegments] = useState(INITIAL_AUDIENCE_SEGMENTS);
  const [newSegmentModal, setNewSegmentModal] = useState(false);
  const [newSegName, setNewSegName] = useState('');
  const [newSegDesc, setNewSegDesc] = useState('');

  // ---------------------------------------------------------------------------
  // 5-STEP CREATE BROADCAST WIZARD STATE
  // ---------------------------------------------------------------------------
  const [wizardStep, setWizardStep] = useState(1); // 1 = Details, 2 = Template, 3 = Audience, 4 = Variables, 5 = Review
  const [newCampName, setNewCampName] = useState('');
  const [newCampDesc, setNewCampDesc] = useState('');
  const [newCampPace, setNewCampPace] = useState('STANDARD'); // 'SAFE' | 'STANDARD' | 'HIGH_SPEED'
  const [newCampSelectedTemplate, setNewCampSelectedTemplate] = useState(APPROVED_TEMPLATES_CATALOG[0]);
  const [newCampSelectedAudience, setNewCampSelectedAudience] = useState(INITIAL_AUDIENCE_SEGMENTS[0]);
  const [newCampVariableMappings, setNewCampVariableMappings] = useState({
    '{{1}}': 'First Name',
    '{{2}}': 'Special Code',
    '{{3}}': 'Expiry Date',
  });
  const [newCampScheduleMode, setNewCampScheduleMode] = useState('NOW'); // 'NOW' | 'LATER'
  const [newCampScheduleDate, setNewCampScheduleDate] = useState('2026-11-15 10:00 AM');
  const [skipNonWhatsApp, setSkipNonWhatsApp] = useState(true);

  // Toast Notification
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg(null);
    }, 3500);
  };

  // ---------------------------------------------------------------------------
  // FILTERED CAMPAIGNS
  // ---------------------------------------------------------------------------
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      const matchStatus =
        campaignStatusFilter === 'ALL' || c.status.toUpperCase() === campaignStatusFilter.toUpperCase();
      const q = campaignSearch.trim().toLowerCase();
      const matchQuery =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.templateName.toLowerCase().includes(q) ||
        c.targetAudience.toLowerCase().includes(q);
      return matchStatus && matchQuery;
    });
  }, [campaigns, campaignStatusFilter, campaignSearch]);

  // Overall Global Statistics
  const globalStats = useMemo(() => {
    let totalTarget = 0;
    let totalSent = 0;
    let totalDelivered = 0;
    let totalRead = 0;
    let totalReplied = 0;
    let totalSpent = 0;

    campaigns.forEach((c) => {
      totalTarget += c.targetCount || 0;
      totalSent += c.sentCount || 0;
      totalDelivered += c.deliveredCount || 0;
      totalRead += c.readCount || 0;
      totalReplied += c.repliedCount || 0;
      totalSpent += c.spentAmount || 0;
    });

    const deliveryRate = totalSent > 0 ? ((totalDelivered / totalSent) * 100).toFixed(1) : 0;
    const readRate = totalDelivered > 0 ? ((totalRead / totalDelivered) * 100).toFixed(1) : 0;
    const responseRate = totalRead > 0 ? ((totalReplied / totalRead) * 100).toFixed(1) : 0;

    return {
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter((c) => c.status === 'ACTIVE').length,
      totalSent,
      totalDelivered,
      totalRead,
      totalReplied,
      totalSpent: totalSpent.toFixed(2),
      deliveryRate,
      readRate,
      responseRate,
    };
  }, [campaigns]);

  // Handle Campaign Pause/Resume
  const handleToggleCampaignStatus = (campId) => {
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id === campId) {
          const nextStatus = c.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
          showToast(`Campaign ${c.title} is now ${nextStatus}.`);
          return { ...c, status: nextStatus };
        }
        return c;
      })
    );
  };

  // Launch New Broadcast Wizard
  const handleLaunchCampaign = () => {
    if (!newCampName.trim()) {
      Alert.alert('Required', 'Please enter a campaign name.');
      setWizardStep(1);
      return;
    }

    const createdCampaign = {
      id: 'camp_' + Date.now(),
      name: newCampName.trim().toLowerCase().replace(/\s+/g, '_'),
      title: newCampName.trim(),
      templateId: newCampSelectedTemplate.id,
      templateName: newCampSelectedTemplate.name,
      category: newCampSelectedTemplate.category,
      status: newCampScheduleMode === 'NOW' ? 'ACTIVE' : 'SCHEDULED',
      createdAt: new Date().toISOString(),
      scheduledFor: newCampScheduleMode === 'NOW' ? new Date().toISOString() : newCampScheduleDate,
      paceMode: newCampPace,
      targetAudience: newCampSelectedAudience.name,
      targetCount: newCampSelectedAudience.count,
      sentCount: newCampScheduleMode === 'NOW' ? 1 : 0,
      deliveredCount: newCampScheduleMode === 'NOW' ? 1 : 0,
      readCount: 0,
      repliedCount: 0,
      failedCount: 0,
      costPerMsg: newCampSelectedTemplate.category === 'UTILITY' ? 0.35 : 0.78,
      totalBudget: (newCampSelectedAudience.count * (newCampSelectedTemplate.category === 'UTILITY' ? 0.35 : 0.78)),
      spentAmount: newCampScheduleMode === 'NOW' ? 0.78 : 0.0,
      tags: ['Broadcast', newCampSelectedAudience.name],
      variablesMapping: { ...newCampVariableMappings },
      recipients: [
        {
          id: 'rc_new_1',
          name: 'Primary Recipient',
          phone: '+91 98765 00000',
          status: newCampScheduleMode === 'NOW' ? 'DELIVERED' : 'SCHEDULED',
          deliveredAt: newCampScheduleMode === 'NOW' ? 'Just Now' : null,
          readAt: null,
          replied: false,
        },
      ],
    };

    setCampaigns((prev) => [createdCampaign, ...prev]);
    showToast(`🎉 Campaign "${newCampName}" ${newCampScheduleMode === 'NOW' ? 'launched successfully' : 'scheduled'}!`);
    // Reset wizard
    setWizardStep(1);
    setNewCampName('');
    setNewCampDesc('');
    setActiveMainTab('campaigns');
  };

  // Status Badge Helper
  const renderStatusBadge = (status) => {
    let bg = '#F3F4F6';
    let text = '#4B5563';
    let label = status;

    if (status === 'ACTIVE') {
      bg = '#DCFCE7';
      text = '#15803D';
      label = '● Sending';
    } else if (status === 'SCHEDULED') {
      bg = '#FEF3C7';
      text = '#B45309';
      label = '⏰ Scheduled';
    } else if (status === 'COMPLETED') {
      bg = '#EFF6FF';
      text = '#1D4ED8';
      label = '✓ Completed';
    } else if (status === 'PAUSED') {
      bg = '#FEE2E2';
      text = '#B91C1C';
      label = '⏸ Paused';
    } else if (status === 'DRAFT') {
      bg = '#F3F4F6';
      text = '#6B7280';
      label = 'Draft';
    }

    return (
      <View style={[styles.statusBadgeBox, { backgroundColor: bg }]}>
        <Text style={[styles.statusBadgeText, { color: text }]}>{label}</Text>
      </View>
    );
  };

  // ===========================================================================
  // RENDER MAIN SCREEN
  // ===========================================================================
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* ── TOP APP HEADER & WABA HEALTH BANNER ────────────────────────────── */}
      <View style={styles.topHeader}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color="#111827" />
          </TouchableOpacity>
          <View style={styles.headerTitles}>
            <Text style={styles.mainTitle}>Broadcast & Campaigns</Text>
            <Text style={styles.mainSubtitle}>WhatsApp Meta Cloud Marketing Engine</Text>
          </View>
          <TouchableOpacity
            style={styles.createHeaderBtn}
            onPress={() => setActiveMainTab('create')}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />
            <Text style={styles.createHeaderBtnText}>New</Text>
          </TouchableOpacity>
        </View>

        {/* WABA Connected Tier & Quality Bar */}
        <View style={styles.wabaQualityBar}>
          <View style={styles.wabaTierLeft}>
            <View style={styles.wabaLiveDot} />
            <Text style={styles.wabaNumberText}>+91 98765 43210</Text>
            <View style={styles.verifiedChip}>
              <Ionicons name="checkmark-circle" size={13} color="#059669" />
              <Text style={styles.verifiedChipText}>Official WABA</Text>
            </View>
          </View>
          <View style={styles.wabaTierRight}>
            <Text style={styles.tierLimitText}>Tier: 100k/day</Text>
            <View style={styles.qualityPill}>
              <Text style={styles.qualityPillText}>High Quality</Text>
            </View>
          </View>
        </View>

        {/* 4 Main View Switcher Tabs */}
        <View style={styles.subtabContainer}>
          {[
            { id: 'campaigns', label: 'Campaigns', icon: 'megaphone-outline' },
            { id: 'create', label: 'Create Broadcast', icon: 'create-outline' },
            { id: 'audience', label: 'Audience Lists', icon: 'people-outline' },
            { id: 'analytics', label: 'Analytics & ROI', icon: 'bar-chart-outline' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.subtabBtn,
                activeMainTab === tab.id && styles.subtabBtnActive,
              ]}
              onPress={() => setActiveMainTab(tab.id)}
              activeOpacity={0.75}
            >
              <Ionicons
                name={tab.icon}
                size={14}
                color={activeMainTab === tab.id ? '#059669' : '#6B7280'}
              />
              <Text
                style={[
                  styles.subtabBtnText,
                  activeMainTab === tab.id && styles.subtabBtnTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── TOAST ALERT ────────────────────────────────────────────────────── */}
      {toastMsg && (
        <View style={styles.toastContainer}>
          <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
          <Text style={styles.toastText}>{toastMsg}</Text>
        </View>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* ── SUBTAB 1: CAMPAIGNS LIST ────────────────────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {activeMainTab === 'campaigns' && (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Quick Metrics Ribbon */}
          <View style={styles.metricsRibbon}>
            <View style={styles.metricCardMini}>
              <Text style={styles.metricValMini}>{globalStats.activeCampaigns}</Text>
              <Text style={styles.metricLblMini}>Sending</Text>
            </View>
            <View style={styles.metricCardMini}>
              <Text style={styles.metricValMini}>{globalStats.totalSent.toLocaleString()}</Text>
              <Text style={styles.metricLblMini}>Sent</Text>
            </View>
            <View style={styles.metricCardMini}>
              <Text style={[styles.metricValMini, { color: '#059669' }]}>{globalStats.deliveryRate}%</Text>
              <Text style={styles.metricLblMini}>Delivered</Text>
            </View>
            <View style={styles.metricCardMini}>
              <Text style={[styles.metricValMini, { color: '#2563EB' }]}>{globalStats.readRate}%</Text>
              <Text style={styles.metricLblMini}>Read Rate</Text>
            </View>
          </View>

          {/* Search & Status Filters */}
          <View style={styles.filterBar}>
            <View style={styles.searchInputBox}>
              <Ionicons name="search" size={16} color="#9CA3AF" />
              <TextInput
                style={styles.searchTextInput}
                placeholder="Search campaigns by name, template..."
                placeholderTextColor="#9CA3AF"
                value={campaignSearch}
                onChangeText={setCampaignSearch}
              />
              {campaignSearch.length > 0 && (
                <TouchableOpacity onPress={() => setCampaignSearch('')}>
                  <Ionicons name="close-circle" size={16} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>

            {/* Filter Chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
              {['ALL', 'ACTIVE', 'SCHEDULED', 'COMPLETED', 'PAUSED'].map((st) => (
                <TouchableOpacity
                  key={st}
                  style={[
                    styles.chipBtn,
                    campaignStatusFilter === st && styles.chipBtnActive,
                  ]}
                  onPress={() => setCampaignStatusFilter(st)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.chipBtnText,
                      campaignStatusFilter === st && styles.chipBtnTextActive,
                    ]}
                  >
                    {st === 'ALL' ? 'All Status' : st.charAt(0) + st.slice(1).toLowerCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Campaign Cards List */}
          {filteredCampaigns.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="megaphone-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No Broadcast Campaigns Found</Text>
              <Text style={styles.emptySub}>Create your first WhatsApp blast campaign with template personalisation.</Text>
              <TouchableOpacity
                style={styles.emptyCreateBtn}
                onPress={() => setActiveMainTab('create')}
              >
                <Text style={styles.emptyCreateBtnText}>Create Campaign</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredCampaigns.map((camp) => {
              const progressPct =
                camp.targetCount > 0 ? Math.min(100, Math.round((camp.sentCount / camp.targetCount) * 100)) : 0;
              return (
                <View key={camp.id} style={styles.campaignCard}>
                  {/* Card Header */}
                  <View style={styles.campCardHeader}>
                    <View style={styles.campCardHeaderLeft}>
                      <View style={styles.campIconBubble}>
                        <Ionicons name="chatbubble-ellipses" size={18} color="#059669" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.campCardTitle} numberOfLines={1}>
                          {camp.title}
                        </Text>
                        <Text style={styles.campCardMeta}>
                          Template: <Text style={{ fontWeight: '700', color: '#111827' }}>{camp.templateName}</Text> • {camp.category}
                        </Text>
                      </View>
                    </View>
                    {renderStatusBadge(camp.status)}
                  </View>

                  {/* Target Audience Pill & Pace */}
                  <View style={styles.audienceInfoRow}>
                    <View style={styles.audTag}>
                      <Ionicons name="people" size={12} color="#059669" />
                      <Text style={styles.audTagText}>{camp.targetAudience} ({camp.targetCount.toLocaleString()})</Text>
                    </View>
                    <View style={styles.paceTag}>
                      <Ionicons name="speedometer-outline" size={12} color="#4B5563" />
                      <Text style={styles.paceTagText}>{camp.paceMode} PACE</Text>
                    </View>
                  </View>

                  {/* Sending Progress Bar */}
                  <View style={styles.progressContainer}>
                    <View style={styles.progressHeaderRow}>
                      <Text style={styles.progressLbl}>Dispatch Progress</Text>
                      <Text style={styles.progressPctText}>{progressPct}% ({camp.sentCount}/{camp.targetCount})</Text>
                    </View>
                    <View style={styles.progressBarBg}>
                      <View style={[styles.progressBarFill, { width: `${progressPct}%` }]} />
                    </View>
                  </View>

                  {/* 4 Performance Metrics Grid */}
                  <View style={styles.campStatsRow}>
                    <View style={styles.campStatCol}>
                      <Text style={styles.campStatVal}>{camp.deliveredCount.toLocaleString()}</Text>
                      <Text style={styles.campStatLbl}>Delivered</Text>
                    </View>
                    <View style={styles.campStatCol}>
                      <Text style={[styles.campStatVal, { color: '#059669' }]}>{camp.readCount.toLocaleString()}</Text>
                      <Text style={styles.campStatLbl}>Read</Text>
                    </View>
                    <View style={styles.campStatCol}>
                      <Text style={[styles.campStatVal, { color: '#2563EB' }]}>{camp.repliedCount.toLocaleString()}</Text>
                      <Text style={styles.campStatLbl}>Replied</Text>
                    </View>
                    <View style={styles.campStatCol}>
                      <Text style={[styles.campStatVal, { color: camp.failedCount > 0 ? '#DC2626' : '#6B7280' }]}>
                        {camp.failedCount}
                      </Text>
                      <Text style={styles.campStatLbl}>Failed</Text>
                    </View>
                  </View>

                  {/* Card Bottom Actions */}
                  <View style={styles.campCardActions}>
                    <TouchableOpacity
                      style={styles.campActionBtnPrimary}
                      onPress={() => setSelectedCampaign(camp)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="analytics" size={14} color="#FFFFFF" />
                      <Text style={styles.campActionBtnPrimaryText}>View Ledger & Funnel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.campActionBtnIcon}
                      onPress={() => {
                        const tmpl = APPROVED_TEMPLATES_CATALOG.find((t) => t.id === camp.templateId) || APPROVED_TEMPLATES_CATALOG[0];
                        setPreviewTemplate(tmpl);
                        setPreviewModalVisible(true);
                      }}
                      activeOpacity={0.7}
                      title="Preview Template"
                    >
                      <Ionicons name="eye-outline" size={17} color="#4B5563" />
                    </TouchableOpacity>

                    {camp.status === 'ACTIVE' || camp.status === 'PAUSED' ? (
                      <TouchableOpacity
                        style={[
                          styles.campActionBtnIcon,
                          camp.status === 'ACTIVE' ? styles.pauseBtnBg : styles.resumeBtnBg,
                        ]}
                        onPress={() => handleToggleCampaignStatus(camp.id)}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name={camp.status === 'ACTIVE' ? 'pause' : 'play'}
                          size={16}
                          color={camp.status === 'ACTIVE' ? '#DC2626' : '#059669'}
                        />
                      </TouchableOpacity>
                    ) : null}
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* ── SUBTAB 2: 5-STEP CREATE BROADCAST WIZARD ────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {activeMainTab === 'create' && (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Stepper Header (1 to 5) */}
          <View style={styles.wizardStepperHeader}>
            {[
              { num: 1, title: 'Details' },
              { num: 2, title: 'Template' },
              { num: 3, title: 'Audience' },
              { num: 4, title: 'Variables' },
              { num: 5, title: 'Launch' },
            ].map((st, idx) => (
              <View key={st.num} style={styles.stepIndicatorCol}>
                <TouchableOpacity
                  style={[
                    styles.stepCircle,
                    wizardStep === st.num && styles.stepCircleActive,
                    wizardStep > st.num && styles.stepCircleCompleted,
                  ]}
                  onPress={() => setWizardStep(st.num)}
                >
                  {wizardStep > st.num ? (
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  ) : (
                    <Text
                      style={[
                        styles.stepCircleText,
                        wizardStep === st.num && styles.stepCircleTextActive,
                      ]}
                    >
                      {st.num}
                    </Text>
                  )}
                </TouchableOpacity>
                <Text
                  style={[
                    styles.stepTitleText,
                    wizardStep === st.num && styles.stepTitleTextActive,
                  ]}
                >
                  {st.title}
                </Text>
              </View>
            ))}
          </View>

          {/* STEP 1: CAMPAIGN DETAILS */}
          {wizardStep === 1 && (
            <View style={styles.wizardStepCard}>
              <View style={styles.stepCardHeader}>
                <Text style={styles.stepCardTitle}>Step 1: Campaign Information</Text>
                <Text style={styles.stepCardSub}>Set campaign name, internal tags, and dispatch speed.</Text>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Campaign Name (Internal Title) *</Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="e.g. Diwali Weekend Flash Sale 2026"
                  placeholderTextColor="#9CA3AF"
                  value={newCampName}
                  onChangeText={setNewCampName}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Campaign Goal / Description</Text>
                <TextInput
                  style={[styles.fieldInput, { height: 75, textAlignVertical: 'top' }]}
                  multiline
                  placeholder="Describe target audience and expected response goals..."
                  placeholderTextColor="#9CA3AF"
                  value={newCampDesc}
                  onChangeText={setNewCampDesc}
                />
              </View>

              {/* Anti-Ban Pacing Speed Options */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Anti-Ban Delivery Pacing (Safe Mode)</Text>
                <Text style={styles.fieldHint}>Controls messages per minute to protect Meta WABA account quality.</Text>

                <View style={styles.paceSelectorRow}>
                  {[
                    { id: 'SAFE', title: 'Safe Mode', speed: '10-15 / min', sub: 'Best for new WABA numbers', icon: 'shield-checkmark' },
                    { id: 'STANDARD', title: 'Standard', speed: '50-60 / min', sub: 'Recommended for Tier 2 numbers', icon: 'speedometer' },
                    { id: 'HIGH_SPEED', title: 'High Speed', speed: '200+ / min', sub: 'Verified Tier 3 accounts only', icon: 'flash' },
                  ].map((p) => (
                    <TouchableOpacity
                      key={p.id}
                      style={[
                        styles.paceCard,
                        newCampPace === p.id && styles.paceCardActive,
                      ]}
                      onPress={() => setNewCampPace(p.id)}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={p.icon}
                        size={18}
                        color={newCampPace === p.id ? '#059669' : '#6B7280'}
                      />
                      <Text style={[styles.paceTitle, newCampPace === p.id && styles.paceTitleActive]}>
                        {p.title}
                      </Text>
                      <Text style={styles.paceSpeed}>{p.speed}</Text>
                      <Text style={styles.paceSub}>{p.sub}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Skip non-WA toggle */}
              <TouchableOpacity
                style={styles.toggleRow}
                onPress={() => setSkipNonWhatsApp(!skipNonWhatsApp)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={skipNonWhatsApp ? 'checkbox' : 'square-outline'}
                  size={20}
                  color={skipNonWhatsApp ? '#059669' : '#9CA3AF'}
                />
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.toggleTitle}>Skip Invalid / Landline Numbers</Text>
                  <Text style={styles.toggleSub}>Prevents Meta penalty error 131026 for unverified phones.</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.stepNextBtn}
                onPress={() => {
                  if (!newCampName.trim()) {
                    Alert.alert('Required', 'Please enter a campaign name to continue.');
                    return;
                  }
                  setWizardStep(2);
                }}
              >
                <Text style={styles.stepNextBtnText}>Continue to Template Selection →</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 2: SELECT APPROVED WHATSAPP TEMPLATE */}
          {wizardStep === 2 && (
            <View style={styles.wizardStepCard}>
              <View style={styles.stepCardHeader}>
                <Text style={styles.stepCardTitle}>Step 2: Select Meta WhatsApp Template</Text>
                <Text style={styles.stepCardSub}>Choose an approved template from your Meta Cloud catalog.</Text>
              </View>

              {APPROVED_TEMPLATES_CATALOG.map((tmpl) => {
                const isSelected = newCampSelectedTemplate.id === tmpl.id;
                return (
                  <TouchableOpacity
                    key={tmpl.id}
                    style={[
                      styles.templatePickCard,
                      isSelected && styles.templatePickCardActive,
                    ]}
                    onPress={() => setNewCampSelectedTemplate(tmpl)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.templatePickHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.templatePickName}>{tmpl.displayName}</Text>
                        <Text style={styles.templatePickCode}>Meta Code: {tmpl.name}</Text>
                      </View>
                      <View style={styles.templateCategoryTag}>
                        <Text style={styles.templateCategoryTagText}>{tmpl.category}</Text>
                      </View>
                    </View>

                    <Text style={styles.templatePickBody} numberOfLines={2}>
                      {tmpl.bodyText.replace(/\\n/g, ' ')}
                    </Text>

                    <View style={styles.templatePickFooter}>
                      <Text style={styles.templateVarsCount}>
                        Variables: <Text style={{ fontWeight: '700' }}>{tmpl.variablesCount}</Text>
                      </Text>
                      <TouchableOpacity
                        style={styles.templatePreviewBtn}
                        onPress={() => {
                          setPreviewTemplate(tmpl);
                          setPreviewModalVisible(true);
                        }}
                      >
                        <Ionicons name="eye-outline" size={13} color="#059669" />
                        <Text style={styles.templatePreviewBtnText}>Preview WhatsApp</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })}

              <View style={styles.stepNavRow}>
                <TouchableOpacity
                  style={styles.stepBackBtn}
                  onPress={() => setWizardStep(1)}
                >
                  <Text style={styles.stepBackBtnText}>← Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.stepNextBtnFlex}
                  onPress={() => setWizardStep(3)}
                >
                  <Text style={styles.stepNextBtnText}>Choose Target Audience →</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* STEP 3: CHOOSE TARGET AUDIENCE */}
          {wizardStep === 3 && (
            <View style={styles.wizardStepCard}>
              <View style={styles.stepCardHeader}>
                <Text style={styles.stepCardTitle}>Step 3: Select Target Audience Segment</Text>
                <Text style={styles.stepCardSub}>Target by tags, CRM pipeline stages, or segmented contact lists.</Text>
              </View>

              {segments.map((seg) => {
                const isSelected = newCampSelectedAudience.id === seg.id;
                return (
                  <TouchableOpacity
                    key={seg.id}
                    style={[
                      styles.audiencePickCard,
                      isSelected && styles.audiencePickCardActive,
                    ]}
                    onPress={() => setNewCampSelectedAudience(seg)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.audCardLeft}>
                      <View style={[styles.audIconBox, { backgroundColor: seg.color + '20' }]}>
                        <Ionicons name={seg.icon || 'people'} size={18} color={seg.color} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.audName}>{seg.name}</Text>
                        <Text style={styles.audDesc}>{seg.description}</Text>
                      </View>
                    </View>
                    <View style={styles.audBadge}>
                      <Text style={styles.audCount}>{seg.count.toLocaleString()}</Text>
                      <Text style={styles.audCountLbl}>Contacts</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}

              <View style={styles.stepNavRow}>
                <TouchableOpacity
                  style={styles.stepBackBtn}
                  onPress={() => setWizardStep(2)}
                >
                  <Text style={styles.stepBackBtnText}>← Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.stepNextBtnFlex}
                  onPress={() => setWizardStep(4)}
                >
                  <Text style={styles.stepNextBtnText}>Map Personalization Variables →</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* STEP 4: VARIABLE MAPPING & LIVE PREVIEW */}
          {wizardStep === 4 && (
            <View style={styles.wizardStepCard}>
              <View style={styles.stepCardHeader}>
                <Text style={styles.stepCardTitle}>Step 4: Variable Personalization Mapper</Text>
                <Text style={styles.stepCardSub}>Map template tags to recipient contact attributes.</Text>
              </View>

              {newCampSelectedTemplate.variablesCount === 0 ? (
                <View style={styles.noVarsBox}>
                  <Ionicons name="information-circle-outline" size={24} color="#059669" />
                  <Text style={styles.noVarsText}>This template contains no dynamic variables. Ready to launch!</Text>
                </View>
              ) : (
                <View style={styles.varsFormContainer}>
                  {Array.from({ length: newCampSelectedTemplate.variablesCount }).map((_, i) => {
                    const tag = `{{${i + 1}}}`;
                    return (
                      <View key={tag} style={styles.varMappingRow}>
                        <View style={styles.varTagBadge}>
                          <Text style={styles.varTagBadgeText}>{tag}</Text>
                        </View>
                        <Ionicons name="arrow-forward" size={14} color="#9CA3AF" />
                        <View style={{ flex: 1 }}>
                          <TextInput
                            style={styles.fieldInputSmall}
                            value={newCampVariableMappings[tag] || ''}
                            placeholder={`Map ${tag} (e.g. First Name, Code)`}
                            placeholderTextColor="#9CA3AF"
                            onChangeText={(val) =>
                              setNewCampVariableMappings((prev) => ({ ...prev, [tag]: val }))
                            }
                          />
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}

              {/* Sample Rendered Preview */}
              <View style={styles.previewBoxContainer}>
                <Text style={styles.previewBoxHeader}>Live Dynamic Render Preview:</Text>
                <View style={styles.previewChatBubble}>
                  <Text style={styles.previewBubbleText}>
                    {newCampSelectedTemplate.bodyText
                      .replace(/{{1}}/g, newCampVariableMappings['{{1}}'] || 'Aman')
                      .replace(/{{2}}/g, newCampVariableMappings['{{2}}'] || 'DIWALI50')
                      .replace(/{{3}}/g, newCampVariableMappings['{{3}}'] || '15 Nov 2026')
                      .replace(/\\n/g, '\n')}
                  </Text>
                  <Text style={styles.previewBubbleFooter}>{newCampSelectedTemplate.footerText}</Text>
                </View>
              </View>

              <View style={styles.stepNavRow}>
                <TouchableOpacity
                  style={styles.stepBackBtn}
                  onPress={() => setWizardStep(3)}
                >
                  <Text style={styles.stepBackBtnText}>← Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.stepNextBtnFlex}
                  onPress={() => setWizardStep(5)}
                >
                  <Text style={styles.stepNextBtnText}>Review & Schedule →</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* STEP 5: REVIEW, ESTIMATE COST & LAUNCH */}
          {wizardStep === 5 && (
            <View style={styles.wizardStepCard}>
              <View style={styles.stepCardHeader}>
                <Text style={styles.stepCardTitle}>Step 5: Review Budget & Launch</Text>
                <Text style={styles.stepCardSub}>Verify audience size, estimated Meta conversation charges, and timing.</Text>
              </View>

              {/* Summary Review Grid */}
              <View style={styles.reviewSummaryBox}>
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLbl}>Campaign Name:</Text>
                  <Text style={styles.reviewVal}>{newCampName}</Text>
                </View>
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLbl}>Selected Template:</Text>
                  <Text style={styles.reviewVal}>{newCampSelectedTemplate.displayName}</Text>
                </View>
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLbl}>Target Audience:</Text>
                  <Text style={styles.reviewVal}>{newCampSelectedAudience.name}</Text>
                </View>
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLbl}>Recipient Count:</Text>
                  <Text style={[styles.reviewVal, { color: '#059669', fontWeight: '800' }]}>
                    {newCampSelectedAudience.count.toLocaleString()} Contacts
                  </Text>
                </View>
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLbl}>Category / Rate:</Text>
                  <Text style={styles.reviewVal}>
                    {newCampSelectedTemplate.category} (₹{newCampSelectedTemplate.category === 'UTILITY' ? '0.35' : '0.78'} / msg)
                  </Text>
                </View>
                <View style={[styles.reviewRow, styles.reviewRowTotal]}>
                  <Text style={styles.reviewLblTotal}>Estimated Total Cost:</Text>
                  <Text style={styles.reviewValTotal}>
                    ₹{(newCampSelectedAudience.count * (newCampSelectedTemplate.category === 'UTILITY' ? 0.35 : 0.78)).toFixed(2)}
                  </Text>
                </View>
              </View>

              {/* Schedule Mode Radio */}
              <View style={styles.scheduleRadioContainer}>
                <Text style={styles.fieldLabel}>Dispatch Timing</Text>
                <View style={styles.scheduleOptions}>
                  <TouchableOpacity
                    style={[
                      styles.schedOptionCard,
                      newCampScheduleMode === 'NOW' && styles.schedOptionCardActive,
                    ]}
                    onPress={() => setNewCampScheduleMode('NOW')}
                  >
                    <Ionicons name="flash" size={18} color={newCampScheduleMode === 'NOW' ? '#059669' : '#6B7280'} />
                    <Text style={[styles.schedOptionTitle, newCampScheduleMode === 'NOW' && styles.schedOptionTitleActive]}>
                      Send Immediately
                    </Text>
                    <Text style={styles.schedOptionSub}>Dispatches instantly with safe pacing</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.schedOptionCard,
                      newCampScheduleMode === 'LATER' && styles.schedOptionCardActive,
                    ]}
                    onPress={() => setNewCampScheduleMode('LATER')}
                  >
                    <Ionicons name="time" size={18} color={newCampScheduleMode === 'LATER' ? '#059669' : '#6B7280'} />
                    <Text style={[styles.schedOptionTitle, newCampScheduleMode === 'LATER' && styles.schedOptionTitleActive]}>
                      Schedule for Later
                    </Text>
                    <Text style={styles.schedOptionSub}>{newCampScheduleDate}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.stepNavRow}>
                <TouchableOpacity
                  style={styles.stepBackBtn}
                  onPress={() => setWizardStep(4)}
                >
                  <Text style={styles.stepBackBtnText}>← Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.launchCampaignBtn}
                  onPress={handleLaunchCampaign}
                  activeOpacity={0.85}
                >
                  <Ionicons name="paper-plane" size={16} color="#FFFFFF" />
                  <Text style={styles.launchCampaignBtnText}>
                    {newCampScheduleMode === 'NOW' ? '🚀 Launch Broadcast Now' : '⏰ Confirm Schedule'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* ── SUBTAB 3: AUDIENCE LISTS & SEGMENTS ──────────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {activeMainTab === 'audience' && (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.audienceHeaderBanner}>
            <View style={{ flex: 1 }}>
              <Text style={styles.audBannerTitle}>Audience Segments & Lists</Text>
              <Text style={styles.audBannerSub}>Target high-intent leads using dynamic tags and CRM filters.</Text>
            </View>
            <TouchableOpacity
              style={styles.addAudienceBtn}
              onPress={() => setNewSegmentModal(true)}
            >
              <Ionicons name="add" size={16} color="#FFFFFF" />
              <Text style={styles.addAudienceBtnText}>New Segment</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.segmentsGrid}>
            {segments.map((seg) => (
              <View key={seg.id} style={styles.segmentDetailCard}>
                <View style={styles.segmentCardTop}>
                  <View style={[styles.audIconBox, { backgroundColor: seg.color + '20' }]}>
                    <Ionicons name={seg.icon || 'people'} size={20} color={seg.color} />
                  </View>
                  <View style={styles.segCountBadge}>
                    <Text style={styles.segCountText}>{seg.count.toLocaleString()}</Text>
                    <Text style={styles.segCountSub}>contacts</Text>
                  </View>
                </View>

                <Text style={styles.segCardTitle}>{seg.name}</Text>
                <Text style={styles.segCardDesc}>{seg.description}</Text>

                <View style={styles.segCardBottom}>
                  <TouchableOpacity
                    style={styles.segActionBtn}
                    onPress={() => {
                      setNewCampSelectedAudience(seg);
                      setActiveMainTab('create');
                      setWizardStep(1);
                      showToast(`Selected "${seg.name}" for new broadcast campaign.`);
                    }}
                  >
                    <Ionicons name="megaphone-outline" size={14} color="#059669" />
                    <Text style={styles.segActionBtnText}>Broadcast to Segment</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* ── SUBTAB 4: ANALYTICS & ROI HUB ───────────────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {activeMainTab === 'analytics' && (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Executive Overview Cards */}
          <View style={styles.analyticsStatsGrid}>
            <View style={styles.analyticsStatBox}>
              <Text style={styles.analyticsStatNum}>₹{globalStats.totalSpent}</Text>
              <Text style={styles.analyticsStatLbl}>Total Meta Spend</Text>
            </View>
            <View style={styles.analyticsStatBox}>
              <Text style={[styles.analyticsStatNum, { color: '#059669' }]}>₹48,500</Text>
              <Text style={styles.analyticsStatLbl}>Attributed Sales (ROI: 55x)</Text>
            </View>
            <View style={styles.analyticsStatBox}>
              <Text style={[styles.analyticsStatNum, { color: '#2563EB' }]}>{globalStats.deliveryRate}%</Text>
              <Text style={styles.analyticsStatLbl}>Average Delivery Rate</Text>
            </View>
            <View style={styles.analyticsStatBox}>
              <Text style={[styles.analyticsStatNum, { color: '#D97706' }]}>{globalStats.responseRate}%</Text>
              <Text style={styles.analyticsStatLbl}>Lead Response Rate</Text>
            </View>
          </View>

          {/* Delivery Funnel Visualization */}
          <View style={styles.funnelCard}>
            <Text style={styles.funnelCardTitle}>End-to-End Broadcast Funnel</Text>
            <Text style={styles.funnelCardSub}>Cumulative engagement across all active and finished blasts.</Text>

            <View style={styles.funnelRowsContainer}>
              {[
                { stage: '1. Messages Sent', count: globalStats.totalSent, pct: 100, color: '#10B981' },
                { stage: '2. Messages Delivered', count: globalStats.totalDelivered, pct: parseFloat(globalStats.deliveryRate) || 98, color: '#059669' },
                { stage: '3. Read by Customer', count: globalStats.totalRead, pct: parseFloat(globalStats.readRate) || 85, color: '#2563EB' },
                { stage: '4. Inbound Reply', count: globalStats.totalReplied, pct: parseFloat(globalStats.responseRate) || 24, color: '#7C3AED' },
              ].map((fn) => (
                <View key={fn.stage} style={styles.funnelBarRow}>
                  <View style={styles.funnelLabelRow}>
                    <Text style={styles.funnelStageName}>{fn.stage}</Text>
                    <Text style={styles.funnelStageVal}>
                      {fn.count.toLocaleString()} ({fn.pct}%)
                    </Text>
                  </View>
                  <View style={styles.funnelBarBg}>
                    <View style={[styles.funnelBarFill, { width: `${fn.pct}%`, backgroundColor: fn.color }]} />
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Campaign Quality Assurance Warning */}
          <View style={styles.qualityNoticeBox}>
            <Ionicons name="shield-checkmark" size={24} color="#059669" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.qualityNoticeTitle}>High WABA Account Health Rating</Text>
              <Text style={styles.qualityNoticeSub}>
                Your low opt-out rate (&lt;0.4%) maintains Tier 2 WhatsApp messaging limits without throttling risks.
              </Text>
            </View>
          </View>
        </ScrollView>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* ── MODAL 1: CAMPAIGN RECIPIENT LEDGER & PERFORMANCE REPORT ─────────── */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {selectedCampaign && (
        <Modal
          visible={!!selectedCampaign}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setSelectedCampaign(null)}
        >
          <SafeAreaView style={styles.modalFullContainer}>
            <View style={styles.modalTopBar}>
              <TouchableOpacity
                onPress={() => setSelectedCampaign(null)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={22} color="#111827" />
              </TouchableOpacity>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.modalTopBarTitle} numberOfLines={1}>
                  {selectedCampaign.title}
                </Text>
                <Text style={styles.modalTopBarSub}>
                  Recipient Delivery Ledger • {selectedCampaign.paceMode} PACE
                </Text>
              </View>
              {renderStatusBadge(selectedCampaign.status)}
            </View>

            <ScrollView contentContainerStyle={styles.modalScrollBody}>
              {/* Funnel Summary Bar */}
              <View style={styles.ledgerFunnelRow}>
                <View style={styles.ledgerFunnelCol}>
                  <Text style={styles.ledgerFunnelNum}>{selectedCampaign.targetCount}</Text>
                  <Text style={styles.ledgerFunnelLbl}>Targeted</Text>
                </View>
                <View style={styles.ledgerFunnelCol}>
                  <Text style={styles.ledgerFunnelNum}>{selectedCampaign.deliveredCount}</Text>
                  <Text style={styles.ledgerFunnelLbl}>Delivered</Text>
                </View>
                <View style={styles.ledgerFunnelCol}>
                  <Text style={[styles.ledgerFunnelNum, { color: '#059669' }]}>{selectedCampaign.readCount}</Text>
                  <Text style={styles.ledgerFunnelLbl}>Read</Text>
                </View>
                <View style={styles.ledgerFunnelCol}>
                  <Text style={[styles.ledgerFunnelNum, { color: '#2563EB' }]}>{selectedCampaign.repliedCount}</Text>
                  <Text style={styles.ledgerFunnelLbl}>Replies</Text>
                </View>
              </View>

              {/* Recipient Ledger Header */}
              <View style={styles.ledgerHeaderRow}>
                <Text style={styles.ledgerSectionTitle}>
                  Recipient Delivery Log ({selectedCampaign.recipients.length})
                </Text>
                <TouchableOpacity
                  style={styles.exportCsvBtn}
                  onPress={() => showToast('Exporting delivery ledger to CSV...')}
                >
                  <Ionicons name="download-outline" size={14} color="#059669" />
                  <Text style={styles.exportCsvBtnText}>Export CSV</Text>
                </TouchableOpacity>
              </View>

              {/* Recipients List */}
              {selectedCampaign.recipients.length === 0 ? (
                <View style={styles.noRecipientsBox}>
                  <Text style={styles.noRecipientsText}>Campaign is scheduled. Recipient ledger populates upon dispatch.</Text>
                </View>
              ) : (
                selectedCampaign.recipients.map((rc) => (
                  <View key={rc.id} style={styles.recipientRowCard}>
                    <View style={styles.rcAvatar}>
                      <Text style={styles.rcAvatarText}>{rc.name.charAt(0)}</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.rcName}>{rc.name}</Text>
                      <Text style={styles.rcPhone}>{rc.phone}</Text>
                      {rc.replied && rc.lastReply && (
                        <View style={styles.rcReplyBubble}>
                          <Ionicons name="chatbubble-outline" size={11} color="#059669" />
                          <Text style={styles.rcReplyText} numberOfLines={1}>
                            "{rc.lastReply}"
                          </Text>
                        </View>
                      )}
                      {rc.failReason && (
                        <Text style={styles.rcFailText}>{rc.failReason}</Text>
                      )}
                    </View>
                    <View style={styles.rcStatusCol}>
                      <View
                        style={[
                          styles.rcStatusPill,
                          rc.status === 'READ' || rc.status === 'REPLIED'
                            ? styles.rcStatusRead
                            : rc.status === 'FAILED'
                            ? styles.rcStatusFailed
                            : styles.rcStatusDelivered,
                        ]}
                      >
                        <Text
                          style={[
                            styles.rcStatusPillText,
                            rc.status === 'READ' || rc.status === 'REPLIED'
                              ? styles.rcStatusReadText
                              : rc.status === 'FAILED'
                              ? styles.rcStatusFailedText
                              : styles.rcStatusDeliveredText,
                          ]}
                        >
                          {rc.status}
                        </Text>
                      </View>
                      <Text style={styles.rcTimeText}>{rc.deliveredAt || 'Pending'}</Text>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          </SafeAreaView>
        </Modal>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* ── MODAL 2: LIVE WHATSAPP PHONE PREVIEW ────────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {previewModalVisible && (
        <Modal
          visible={previewModalVisible}
          animationType="fade"
          transparent
          onRequestClose={() => setPreviewModalVisible(false)}
        >
          <View style={styles.previewModalBackdrop}>
            <View style={styles.previewPhoneFrame}>
              {/* WhatsApp Simulated Top Bar */}
              <View style={styles.waTopBar}>
                <TouchableOpacity onPress={() => setPreviewModalVisible(false)}>
                  <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <View style={styles.waBusinessAvatar}>
                  <Ionicons name="business" size={16} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.waBusinessName}>MessBee Official</Text>
                  <Text style={styles.waBusinessSub}>Official WhatsApp Business Account</Text>
                </View>
                <TouchableOpacity onPress={() => setPreviewModalVisible(false)}>
                  <Ionicons name="close" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* Chat Bubble Scrollable Body */}
              <ScrollView contentContainerStyle={styles.waChatScroll}>
                <View style={styles.waEncryptionNotice}>
                  <Ionicons name="lock-closed" size={11} color="#54656F" />
                  <Text style={styles.waEncryptionText}>
                    Messages and calls are end-to-end encrypted.
                  </Text>
                </View>

                {/* WhatsApp Chat Bubble */}
                <View style={styles.waBubble}>
                  {previewTemplate.headerType === 'TEXT' && (
                    <Text style={styles.waHeaderTitle}>{previewTemplate.headerText}</Text>
                  )}
                  {previewTemplate.headerType === 'IMAGE' && (
                    <View style={styles.waMediaHeaderPlaceholder}>
                      <Ionicons name="image" size={32} color="#059669" />
                      <Text style={styles.waMediaPlaceholderText}>Attached Marketing Banner</Text>
                    </View>
                  )}

                  <Text style={styles.waBodyText}>
                    {previewTemplate.bodyText
                      .replace(/{{1}}/g, previewSampleVars['{{1}}'] || 'Aman Sharma')
                      .replace(/{{2}}/g, previewSampleVars['{{2}}'] || 'DIWALI50')
                      .replace(/{{3}}/g, previewSampleVars['{{3}}'] || '15 Nov 2026')
                      .replace(/\\n/g, '\n')}
                  </Text>

                  {previewTemplate.footerText ? (
                    <Text style={styles.waFooterText}>{previewTemplate.footerText}</Text>
                  ) : null}

                  <View style={styles.waTimeRow}>
                    <Text style={styles.waTimeText}>10:45 AM</Text>
                    <Ionicons name="checkmark-done" size={14} color="#53BDEB" />
                  </View>

                  {/* Interactive Button Chips */}
                  {previewTemplate.buttons?.map((btn, idx) => (
                    <TouchableOpacity key={idx} style={styles.waButtonChip} activeOpacity={0.8}>
                      <Ionicons
                        name={btn.type === 'URL' ? 'globe-outline' : 'chatbubble-ellipses-outline'}
                        size={14}
                        color="#059669"
                      />
                      <Text style={styles.waButtonChipText}>{btn.text}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* ── MODAL 3: CREATE AUDIENCE SEGMENT MODAL ──────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {newSegmentModal && (
        <Modal
          visible={newSegmentModal}
          transparent
          animationType="fade"
          onRequestClose={() => setNewSegmentModal(false)}
        >
          <View style={styles.sheetBackdrop}>
            <View style={styles.sheetContainer}>
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>Create Audience Segment</Text>
                <TouchableOpacity onPress={() => setNewSegmentModal(false)}>
                  <Ionicons name="close" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Segment Name *</Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="e.g. Inactive Customers 60 Days"
                  placeholderTextColor="#9CA3AF"
                  value={newSegName}
                  onChangeText={setNewSegName}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Criteria / Description</Text>
                <TextInput
                  style={[styles.fieldInput, { height: 60, textAlignVertical: 'top' }]}
                  multiline
                  placeholder="e.g. Tags: High Value AND Stage: Closed"
                  placeholderTextColor="#9CA3AF"
                  value={newSegDesc}
                  onChangeText={setNewSegDesc}
                />
              </View>

              <TouchableOpacity
                style={styles.fullGreenBtn}
                onPress={() => {
                  if (!newSegName.trim()) {
                    Alert.alert('Required', 'Please enter a segment name.');
                    return;
                  }
                  const createdSeg = {
                    id: 'seg_' + Date.now(),
                    name: newSegName.trim(),
                    count: Math.floor(150 + Math.random() * 850),
                    description: newSegDesc.trim() || 'Custom segmented rule filter',
                    icon: 'filter',
                    color: '#059669',
                  };
                  setSegments((prev) => [createdSeg, ...prev]);
                  setNewSegmentModal(false);
                  setNewSegName('');
                  setNewSegDesc('');
                  showToast(`Audience segment "${createdSeg.name}" created!`);
                }}
              >
                <Text style={styles.fullGreenBtnText}>Save Audience Segment</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

// =============================================================================
// PRODUCTION-GRADE STYLESHEET (MATCHING FIGMA & MESSBEE GREEN PALETTE)
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingTop: Platform.OS === 'android' ? 32 : 0,
  },
  topHeader: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
  },
  backBtn: {
    padding: 6,
    marginRight: 6,
  },
  headerTitles: {
    flex: 1,
  },
  mainTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#111827',
  },
  mainSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  createHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    gap: 3,
  },
  createHeaderBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  wabaQualityBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#DCFCE7',
  },
  wabaTierLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  wabaLiveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  wabaNumberText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#065F46',
  },
  verifiedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  verifiedChipText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#065F46',
  },
  wabaTierRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tierLimitText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#047857',
  },
  qualityPill: {
    backgroundColor: '#059669',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  qualityPillText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  subtabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  subtabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 4,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  subtabBtnActive: {
    borderBottomColor: '#059669',
  },
  subtabBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#6B7280',
  },
  subtabBtnTextActive: {
    color: '#059669',
    fontWeight: '800',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  toastContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#111827',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 999,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '600',
    flex: 1,
  },
  metricsRibbon: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  metricCardMini: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  metricValMini: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  metricLblMini: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 2,
  },
  filterBar: {
    marginBottom: 14,
    gap: 8,
  },
  searchInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
  },
  searchTextInput: {
    flex: 1,
    fontSize: 12.5,
    color: '#111827',
  },
  chipsScroll: {
    gap: 6,
  },
  chipBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipBtnActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  chipBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
  },
  chipBtnTextActive: {
    color: '#FFFFFF',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
    marginTop: 12,
  },
  emptySub: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 260,
  },
  emptyCreateBtn: {
    marginTop: 16,
    backgroundColor: '#059669',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 12,
  },
  emptyCreateBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  campaignCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  campCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  campCardHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  campIconBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  campCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  campCardMeta: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  statusBadgeBox: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  audienceInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  audTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  audTagText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#065F46',
  },
  paceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  paceTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4B5563',
  },
  progressContainer: {
    marginTop: 12,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLbl: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#6B7280',
  },
  progressPctText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#111827',
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F3F4F6',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#059669',
    borderRadius: 3,
  },
  campStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 12,
  },
  campStatCol: {
    alignItems: 'center',
  },
  campStatVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
  campStatLbl: {
    fontSize: 9.5,
    color: '#6B7280',
    marginTop: 1,
  },
  campCardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  campActionBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
  },
  campActionBtnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  campActionBtnIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseBtnBg: {
    backgroundColor: '#FEE2E2',
  },
  resumeBtnBg: {
    backgroundColor: '#DCFCE7',
  },
  wizardStepperHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  stepIndicatorCol: {
    alignItems: 'center',
    gap: 4,
  },
  stepCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: '#059669',
  },
  stepCircleCompleted: {
    backgroundColor: '#10B981',
  },
  stepCircleText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6B7280',
  },
  stepCircleTextActive: {
    color: '#FFFFFF',
  },
  stepTitleText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
  },
  stepTitleTextActive: {
    color: '#059669',
    fontWeight: '800',
  },
  wizardStepCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  stepCardHeader: {
    marginBottom: 14,
  },
  stepCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  stepCardSub: {
    fontSize: 11.5,
    color: '#6B7280',
    marginTop: 2,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#374151',
    marginBottom: 6,
  },
  fieldHint: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 8,
  },
  fieldInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#111827',
  },
  fieldInputSmall: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 36,
    fontSize: 12,
    color: '#111827',
  },
  paceSelectorRow: {
    flexDirection: 'row',
    gap: 8,
  },
  paceCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    gap: 3,
  },
  paceCardActive: {
    borderColor: '#059669',
    backgroundColor: '#ECFDF5',
  },
  paceTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#374151',
    marginTop: 2,
  },
  paceTitleActive: {
    color: '#059669',
  },
  paceSpeed: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  paceSub: {
    fontSize: 8.5,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 11,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  toggleTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  toggleSub: {
    fontSize: 10.5,
    color: '#6B7280',
    marginTop: 1,
  },
  stepNextBtn: {
    backgroundColor: '#059669',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNextBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  stepNavRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  stepBackBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBackBtnText: {
    color: '#4B5563',
    fontSize: 12.5,
    fontWeight: '700',
  },
  stepNextBtnFlex: {
    flex: 1,
    backgroundColor: '#059669',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  templatePickCard: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  templatePickCardActive: {
    borderColor: '#059669',
    backgroundColor: '#ECFDF5',
  },
  templatePickHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  templatePickName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
  templatePickCode: {
    fontSize: 10.5,
    color: '#6B7280',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  templateCategoryTag: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  templateCategoryTagText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#3730A3',
  },
  templatePickBody: {
    fontSize: 11.5,
    color: '#4B5563',
    lineHeight: 16,
    marginBottom: 8,
  },
  templatePickFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 6,
  },
  templateVarsCount: {
    fontSize: 10.5,
    color: '#6B7280',
  },
  templatePreviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  templatePreviewBtnText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#059669',
  },
  audiencePickCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  audiencePickCardActive: {
    borderColor: '#059669',
    backgroundColor: '#ECFDF5',
  },
  audCardLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  audIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  audName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
  audDesc: {
    fontSize: 10.5,
    color: '#6B7280',
    marginTop: 1,
  },
  audBadge: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  audCount: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#059669',
  },
  audCountLbl: {
    fontSize: 9.5,
    color: '#6B7280',
  },
  noVarsBox: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    marginBottom: 12,
    gap: 6,
  },
  noVarsText: {
    fontSize: 12,
    color: '#065F46',
    fontWeight: '600',
    textAlign: 'center',
  },
  varsFormContainer: {
    gap: 8,
    marginBottom: 12,
  },
  varMappingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  varTagBadge: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    minWidth: 48,
    alignItems: 'center',
  },
  varTagBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#3730A3',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  previewBoxContainer: {
    marginTop: 10,
    marginBottom: 14,
  },
  previewBoxHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6B7280',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  previewChatBubble: {
    backgroundColor: '#DCF8C6',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#C6E8AF',
  },
  previewBubbleText: {
    fontSize: 12.5,
    color: '#111827',
    lineHeight: 18,
  },
  previewBubbleFooter: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 6,
    fontStyle: 'italic',
  },
  reviewSummaryBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
    marginBottom: 14,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewRowTotal: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
    marginTop: 4,
  },
  reviewLbl: {
    fontSize: 11.5,
    color: '#6B7280',
  },
  reviewVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  reviewLblTotal: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#111827',
  },
  reviewValTotal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#059669',
  },
  scheduleRadioContainer: {
    marginBottom: 14,
  },
  scheduleOptions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  schedOptionCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    gap: 3,
  },
  schedOptionCardActive: {
    borderColor: '#059669',
    backgroundColor: '#ECFDF5',
  },
  schedOptionTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#374151',
    marginTop: 2,
  },
  schedOptionTitleActive: {
    color: '#059669',
  },
  schedOptionSub: {
    fontSize: 9,
    color: '#6B7280',
    textAlign: 'center',
  },
  launchCampaignBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 6,
  },
  launchCampaignBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  audienceHeaderBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 14,
  },
  audBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  audBannerSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  addAudienceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    gap: 3,
  },
  addAudienceBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
  segmentsGrid: {
    gap: 10,
  },
  segmentDetailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
  },
  segmentCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  segCountBadge: {
    alignItems: 'flex-end',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  segCountText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#111827',
  },
  segCountSub: {
    fontSize: 9,
    color: '#6B7280',
  },
  segCardTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#111827',
  },
  segCardDesc: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  segCardBottom: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  segActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  segActionBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#059669',
  },
  analyticsStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  analyticsStatBox: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  analyticsStatNum: {
    fontSize: 19,
    fontWeight: '800',
    color: '#111827',
  },
  analyticsStatLbl: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '600',
  },
  funnelCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    marginBottom: 14,
  },
  funnelCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  funnelCardSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  funnelRowsContainer: {
    marginTop: 14,
    gap: 12,
  },
  funnelBarRow: {
    gap: 4,
  },
  funnelLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  funnelStageName: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#374151',
  },
  funnelStageVal: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#111827',
  },
  funnelBarBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F3F4F6',
    overflow: 'hidden',
  },
  funnelBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  qualityNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  qualityNoticeTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#065F46',
  },
  qualityNoticeSub: {
    fontSize: 11,
    color: '#047857',
    marginTop: 2,
    lineHeight: 15,
  },
  modalFullContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  modalTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalTopBarTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#111827',
  },
  modalTopBarSub: {
    fontSize: 11,
    color: '#6B7280',
  },
  modalScrollBody: {
    padding: 16,
  },
  ledgerFunnelRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 14,
  },
  ledgerFunnelCol: {
    flex: 1,
    alignItems: 'center',
  },
  ledgerFunnelNum: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  ledgerFunnelLbl: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 1,
  },
  ledgerHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  ledgerSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
  exportCsvBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  exportCsvBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  noRecipientsBox: {
    padding: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  noRecipientsText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  recipientRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
  },
  rcAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rcAvatarText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#4B5563',
  },
  rcName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#111827',
  },
  rcPhone: {
    fontSize: 10.5,
    color: '#6B7280',
  },
  rcReplyBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  rcReplyText: {
    fontSize: 10,
    color: '#065F46',
    fontWeight: '600',
    flex: 1,
  },
  rcFailText: {
    fontSize: 10,
    color: '#DC2626',
    marginTop: 2,
  },
  rcStatusCol: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  rcStatusPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  rcStatusRead: {
    backgroundColor: '#DCFCE7',
  },
  rcStatusReadText: {
    color: '#15803D',
    fontSize: 9.5,
    fontWeight: '800',
  },
  rcStatusDelivered: {
    backgroundColor: '#EFF6FF',
  },
  rcStatusDeliveredText: {
    color: '#1D4ED8',
    fontSize: 9.5,
    fontWeight: '800',
  },
  rcStatusFailed: {
    backgroundColor: '#FEE2E2',
  },
  rcStatusFailedText: {
    color: '#B91C1C',
    fontSize: 9.5,
    fontWeight: '800',
  },
  rcTimeText: {
    fontSize: 9.5,
    color: '#9CA3AF',
    marginTop: 2,
  },
  previewModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  previewPhoneFrame: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#EFEAE2',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#111827',
    maxHeight: '85%',
  },
  waTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#075E54',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  waBusinessAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#128C7E',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  waBusinessName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  waBusinessSub: {
    fontSize: 9.5,
    color: '#A7F3D0',
  },
  waChatScroll: {
    padding: 14,
  },
  waEncryptionNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFEECD',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
    marginBottom: 12,
  },
  waEncryptionText: {
    fontSize: 9.5,
    color: '#54656F',
    fontWeight: '600',
  },
  waBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  waHeaderTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  waMediaHeaderPlaceholder: {
    height: 110,
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    gap: 4,
  },
  waMediaPlaceholderText: {
    fontSize: 11,
    color: '#065F46',
    fontWeight: '600',
  },
  waBodyText: {
    fontSize: 12.5,
    color: '#111827',
    lineHeight: 18,
  },
  waFooterText: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 6,
    fontStyle: 'italic',
  },
  waTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 3,
    marginTop: 4,
  },
  waTimeText: {
    fontSize: 9.5,
    color: '#667781',
  },
  waButtonChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F2F5',
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 6,
    gap: 6,
  },
  waButtonChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  fullGreenBtn: {
    backgroundColor: '#059669',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  fullGreenBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
