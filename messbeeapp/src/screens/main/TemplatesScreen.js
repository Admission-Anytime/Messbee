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

// Initial pre-loaded WhatsApp Business Templates matching Meta Cloud API
const INITIAL_TEMPLATES_DATA = [
  {
    id: 'tmpl_1',
    name: 'welcome_customer',
    category: 'UTILITY',
    language: 'English',
    status: 'APPROVED',
    quality: 'High',
    headerType: 'TEXT',
    headerText: 'Welcome to MessBee',
    bodyText: 'Hello {{1}}, welcome to MessBee! We are happy to have you with us. How can our team help today?',
    variables: ['Customer Name'],
    sampleValues: { '{{1}}': 'Aman' },
    footerText: 'MessBee Customer Success Team',
    buttons: [
      { id: 'b1', type: 'QUICK_REPLY', text: 'Talk to support', icon: 'chatbubbles-outline' },
    ],
    createdAt: '12 Jun 2025',
    updatedAt: '14 Jun 2025',
    statusNote: 'Updates are usually approved within a few minutes.',
  },
  {
    id: 'tmpl_2',
    name: 'summer_savings',
    category: 'MARKETING',
    language: 'English',
    status: 'PENDING',
    quality: 'Pending',
    headerType: 'TEXT',
    headerText: 'Exclusive Summer Offer ☀️',
    bodyText: 'Hi {{1}}, your exclusive $20 offer is here. Shop today before Sunday and enjoy early access.',
    variables: ['First Name'],
    sampleValues: { '{{1}}': 'Priya' },
    footerText: 'Terms and conditions apply',
    buttons: [
      { id: 'b2', type: 'URL', text: 'Claim Offer 🎁', url: 'https://messbee.com/summer' },
      { id: 'b3', type: 'QUICK_REPLY', text: 'Opt-out', icon: 'close-circle-outline' },
    ],
    createdAt: '14 Jun 2025',
    updatedAt: '14 Jun 2025',
    statusNote: 'Under review by Meta. Usually takes 5-10 minutes.',
  },
  {
    id: 'tmpl_3',
    name: 'order_shipped_update',
    category: 'UTILITY',
    language: 'English',
    status: 'APPROVED',
    quality: 'High',
    headerType: 'TEXT',
    headerText: 'Order Shipped! 📦',
    bodyText: 'Hi {{1}}, your order #{{2}} has been shipped! Track your package in real-time with tracking code {{3}}.',
    variables: ['Customer Name', 'Order ID', 'Tracking Code'],
    sampleValues: { '{{1}}': 'Rahul', '{{2}}': 'ORD-89412', '{{3}}': 'MB-99214X' },
    footerText: 'Thank you for shopping with MessBee',
    buttons: [
      { id: 'b4', type: 'URL', text: 'Track Shipment 🚚', url: 'https://track.messbee.com' },
      { id: 'b5', type: 'QUICK_REPLY', text: 'Support Desk', icon: 'call-outline' },
    ],
    createdAt: '10 Jun 2025',
    updatedAt: '11 Jun 2025',
    statusNote: 'Approved by Meta.',
  },
  {
    id: 'tmpl_4',
    name: 'flash_sale_announcement',
    category: 'MARKETING',
    language: 'English',
    status: 'APPROVED',
    quality: 'High',
    headerType: 'TEXT',
    headerText: '⚡ Flash Sale is Live!',
    bodyText: 'Hello {{1}}, our Flash Sale is live. Use code {{2}} to save 20% for next 24 hours only.',
    variables: ['Customer Name', 'Promo Code'],
    sampleValues: { '{{1}}': 'Amit', '{{2}}': 'FLASH20' },
    footerText: 'MessBee Deals & Discounts',
    buttons: [
      { id: 'b6', type: 'URL', text: 'Shop Now 🛍️', url: 'https://messbee.com/sale' },
    ],
    createdAt: '08 Jun 2025',
    updatedAt: '09 Jun 2025',
    statusNote: 'Approved by Meta.',
  },
  {
    id: 'tmpl_5',
    name: 'otp_verification_meta',
    category: 'AUTHENTICATION',
    language: 'English',
    status: 'APPROVED',
    quality: 'High',
    headerType: 'NONE',
    headerText: '',
    bodyText: '{{1}} is your MessBee security verification code. Do not share this code with anyone, including support staff.',
    variables: ['OTP Code'],
    sampleValues: { '{{1}}': '491-023' },
    footerText: 'Security Alert • Valid for 10 minutes',
    buttons: [
      { id: 'b7', type: 'COPY_CODE', text: 'Copy Code 📋' },
    ],
    createdAt: '01 Jun 2025',
    updatedAt: '01 Jun 2025',
    statusNote: 'Authentication templates are pre-approved by Meta.',
  },
  {
    id: 'tmpl_6',
    name: 'payment_reminder_urgent',
    category: 'UTILITY',
    language: 'English',
    status: 'DRAFT',
    quality: 'Not Submitted',
    headerType: 'TEXT',
    headerText: 'Payment Reminder 💳',
    bodyText: 'Dear {{1}}, invoice #{{2}} of ₹{{3}} is due on {{4}}. Kindly complete payment to prevent service interruption.',
    variables: ['Client Name', 'Invoice Number', 'Amount', 'Due Date'],
    sampleValues: { '{{1}}': 'Sunil Verma', '{{2}}': 'INV-2025', '{{3}}': '5,499', '{{4}}': '20 Jun 2025' },
    footerText: 'MessBee Accounts Team',
    buttons: [
      { id: 'b8', type: 'URL', text: 'Pay Invoice 💳', url: 'https://pay.messbee.com' },
    ],
    createdAt: '15 Jun 2025',
    updatedAt: '15 Jun 2025',
    statusNote: 'Draft saved locally. Not submitted to Meta yet.',
  },
];

// Pre-made Gallery Templates for quick deployment
const GALLERY_TEMPLATES = [
  {
    id: 'gal_1',
    name: 'welcome_customer',
    category: 'UTILITY',
    categoryLabel: 'Utility',
    language: 'English',
    status: 'APPROVED',
    headerType: 'TEXT',
    headerText: 'Welcome to MessBee',
    bodyText: 'Hello {{1}}, welcome to MessBee! We are happy to have you with us. How can our team help today?',
    variables: ['Customer Name'],
    defaultSamples: { '{{1}}': 'Aman' },
    footerText: 'MessBee Customer Success Team',
    buttons: [{ id: 'gb1', type: 'QUICK_REPLY', text: 'Talk to support' }],
  },
  {
    id: 'gal_2',
    name: 'flash_sale_announcement',
    category: 'MARKETING',
    categoryLabel: 'Marketing',
    language: 'English',
    status: 'APPROVED',
    headerType: 'TEXT',
    headerText: '⚡ Flash Sale Alert',
    bodyText: 'Hello {{1}}, our Flash Sale is live. Use code {{2}} to save 20% for next 24 hours.',
    variables: ['Customer Name', 'Promo Code'],
    defaultSamples: { '{{1}}': 'Priya', '{{2}}': 'FLASH20' },
    footerText: 'MessBee Shopping',
    buttons: [{ id: 'gb2', type: 'URL', text: 'Shop Now 🛍️', url: 'https://messbee.com' }],
  },
  {
    id: 'gal_3',
    name: 'order_delivery_confirmation',
    category: 'UTILITY',
    categoryLabel: 'Utility',
    language: 'English',
    status: 'APPROVED',
    headerType: 'TEXT',
    headerText: 'Package Dispatched 📦',
    bodyText: 'Hi {{1}}, your order #{{2}} is out for delivery with our executive {{3}}. OTP for delivery is {{4}}.',
    variables: ['Customer Name', 'Order ID', 'Executive Name', 'Delivery OTP'],
    defaultSamples: { '{{1}}': 'Vikram', '{{2}}': 'ORD-9821', '{{3}}': 'Ramesh Kumar', '{{4}}': '3941' },
    footerText: 'MessBee Logistics',
    buttons: [{ id: 'gb3', type: 'QUICK_REPLY', text: 'Track Live' }],
  },
  {
    id: 'gal_4',
    name: 'appointment_booking_alert',
    category: 'UTILITY',
    categoryLabel: 'Utility',
    language: 'English',
    status: 'APPROVED',
    headerType: 'TEXT',
    headerText: 'Appointment Confirmed ⏰',
    bodyText: 'Hello {{1}}, your booking with {{2}} is confirmed for {{3}} at {{4}}. Please arrive 10 minutes early.',
    variables: ['Patient Name', 'Doctor/Agent', 'Date', 'Time'],
    defaultSamples: { '{{1}}': 'Sneha', '{{2}}': 'Dr. Sharma', '{{3}}': 'Tomorrow', '{{4}}': '3:30 PM' },
    footerText: 'MessBee Healthcare Desk',
    buttons: [{ id: 'gb4', type: 'URL', text: 'View Directions 📍', url: 'https://maps.google.com' }],
  },
  {
    id: 'gal_5',
    name: 'account_otp_security',
    category: 'AUTHENTICATION',
    categoryLabel: 'Authentication',
    language: 'English',
    status: 'APPROVED',
    headerType: 'NONE',
    headerText: '',
    bodyText: '{{1}} is your one-time verification password for your MessBee account. Valid for 10 minutes.',
    variables: ['OTP Code'],
    defaultSamples: { '{{1}}': '842-190' },
    footerText: 'Never share OTP with anyone',
    buttons: [{ id: 'gb5', type: 'COPY_CODE', text: 'Copy Code 📋' }],
  },
];

const STATUS_FILTERS = ['All', 'Approved', 'Pending', 'Rejected', 'Draft'];
const CATEGORY_OPTIONS = [
  {
    id: 'Marketing',
    title: 'Marketing',
    desc: 'Send promotional offers, announcements, and marketing messages.',
    icon: 'megaphone-outline',
  },
  {
    id: 'Utility',
    title: 'Utility',
    desc: 'Send transactional updates, confirmations, and service notices.',
    icon: 'notifications-outline',
  },
  {
    id: 'Authentication',
    title: 'Authentication',
    desc: 'Send OTPs and account verification messages.',
    icon: 'shield-checkmark-outline',
  },
];

const TEMPLATE_TYPE_OPTIONS = [
  {
    id: 'Custom',
    title: 'Custom',
    desc: 'Flexible messages with custom content and buttons.',
    icon: 'document-text-outline',
  },
  {
    id: 'Catalog',
    title: 'Catalog',
    desc: 'Display your online product catalog directly in chat.',
    icon: 'grid-outline',
  },
];

export default function TemplatesScreen({ navigation }) {
  // Main Subtabs: 'list' | 'create' | 'gallery'
  const [activeMainTab, setActiveMainTab] = useState('list');

  // Templates State
  const [templates, setTemplates] = useState(INITIAL_TEMPLATES_DATA);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState(null);

  // Template Details View Modal
  const [selectedDetailsTemplate, setSelectedDetailsTemplate] = useState(null);

  // Create / Edit Flow Modal (2-Step Builder)
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [builderStep, setBuilderStep] = useState(1); // 1 = Setup, 2 = Content
  const [builderTab, setBuilderTab] = useState('edit'); // 'edit' | 'preview'
  const [isEditingId, setIsEditingId] = useState(null);

  // Form State for 2-step Builder
  const [formCategory, setFormCategory] = useState('Utility');
  const [formType, setFormType] = useState('Custom');
  const [formName, setFormName] = useState('');
  const [formLanguage, setFormLanguage] = useState('English');
  const [formHeaderType, setFormHeaderType] = useState('Text'); // 'None' | 'Text' | 'Media'
  const [formHeaderText, setFormHeaderText] = useState('');
  const [formBodyText, setFormBodyText] = useState('');
  const [formFooterText, setFormFooterText] = useState('');
  const [formButtons, setFormButtons] = useState([
    { id: 'b_default', type: 'QUICK_REPLY', text: 'Talk to support' },
  ]);
  const [formSamples, setFormSamples] = useState({ '{{1}}': 'Aman' });

  // Confirmation Modal for Submit
  const [isSubmitConfirmVisible, setIsSubmitConfirmVisible] = useState(false);

  // Gallery State
  const [gallerySearch, setGallerySearch] = useState('');
  const [galleryCategory, setGalleryCategory] = useState('All');
  const [galleryPreviewTemplate, setGalleryPreviewTemplate] = useState(null);

  // Customize / Use Template Modal (Screen 10)
  const [customizingTemplate, setCustomizingTemplate] = useState(null);
  const [customVarInputs, setCustomVarInputs] = useState({});

  // Helper to show transient bottom toast
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3800);
  };

  // Sync with Meta Cloud API simulation
  const handleSyncMeta = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      showToast('Templates synced successfully with Meta Cloud API.');
    }, 900);
  };

  // Filtered Templates List
  const filteredTemplates = useMemo(() => {
    return templates.filter((item) => {
      const matchStatus =
        statusFilter === 'All' ||
        item.status.toUpperCase() === statusFilter.toUpperCase();

      const q = searchQuery.trim().toLowerCase();
      const matchQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.bodyText.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);

      return matchStatus && matchQuery;
    });
  }, [templates, statusFilter, searchQuery]);

  // Filtered Gallery Templates
  const filteredGallery = useMemo(() => {
    return GALLERY_TEMPLATES.filter((item) => {
      const matchCat =
        galleryCategory === 'All' ||
        item.category.toUpperCase() === galleryCategory.toUpperCase();

      const q = gallerySearch.trim().toLowerCase();
      const matchQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.bodyText.toLowerCase().includes(q);

      return matchCat && matchQuery;
    });
  }, [galleryCategory, gallerySearch]);

  // Open Create Modal Fresh
  const handleStartCreateFresh = (initialCategory = 'Utility') => {
    setIsEditingId(null);
    setBuilderStep(1);
    setBuilderTab('edit');
    setFormCategory(initialCategory);
    setFormType('Custom');
    setFormName('');
    setFormLanguage('English');
    setFormHeaderType('Text');
    setFormHeaderText('Welcome to MessBee');
    setFormBodyText(
      'Hello {{1}}, welcome to MessBee! We are happy to have you with us. How can our team help today?'
    );
    setFormFooterText('MessBee Team');
    setFormButtons([{ id: 'btn_1', type: 'QUICK_REPLY', text: 'Talk to support' }]);
    setFormSamples({ '{{1}}': 'Aman' });
    setIsCreateModalVisible(true);
  };

  // Open Edit for an existing Template
  const handleEditTemplate = (tmpl) => {
    setIsEditingId(tmpl.id);
    setBuilderStep(1);
    setBuilderTab('edit');
    setFormCategory(tmpl.category);
    setFormType('Custom');
    setFormName(tmpl.name);
    setFormLanguage(tmpl.language || 'English');
    setFormHeaderType(tmpl.headerType === 'NONE' ? 'None' : 'Text');
    setFormHeaderText(tmpl.headerText || '');
    setFormBodyText(tmpl.bodyText || '');
    setFormFooterText(tmpl.footerText || '');
    setFormButtons(
      tmpl.buttons && tmpl.buttons.length
        ? tmpl.buttons
        : [{ id: 'btn_1', type: 'QUICK_REPLY', text: 'Talk to support' }]
    );
    setFormSamples(tmpl.sampleValues || { '{{1}}': 'Aman' });
    setSelectedDetailsTemplate(null);
    setIsCreateModalVisible(true);
  };

  // Duplicate an existing Template
  const handleDuplicateTemplate = (tmpl) => {
    const dupName = `${tmpl.name}_copy`;
    const newTmpl = {
      ...tmpl,
      id: `tmpl_${Date.now()}`,
      name: dupName,
      status: 'DRAFT',
      quality: 'Not Submitted',
      createdAt: 'Just now',
      updatedAt: 'Just now',
    };
    setTemplates((prev) => [newTmpl, ...prev]);
    setSelectedDetailsTemplate(null);
    showToast(`Template duplicated as "${dupName}".`);
  };

  // Delete a Template
  const handleDeleteTemplate = (tmpl) => {
    Alert.alert(
      'Delete Template?',
      `Are you sure you want to delete "${tmpl.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setTemplates((prev) => prev.filter((t) => t.id !== tmpl.id));
            setSelectedDetailsTemplate(null);
            showToast(`Template "${tmpl.name}" deleted.`);
          },
        },
      ]
    );
  };

  // Add variable placeholder into body text
  const handleInsertVariable = () => {
    const matches = formBodyText.match(/\{\{(\d+)\}\}/g) || [];
    const nextIdx = matches.length + 1;
    const nextTag = `{{${nextIdx}}}`;
    setFormBodyText((prev) => `${prev} ${nextTag}`);
    setFormSamples((prev) => ({
      ...prev,
      [nextTag]: `Sample ${nextIdx}`,
    }));
  };

  // Render WhatsApp preview body with sample variable replacements
  const getRenderedBody = (text, samplesMap) => {
    if (!text) return '';
    let rendered = text;
    Object.keys(samplesMap || {}).forEach((key) => {
      const val = samplesMap[key];
      if (val !== undefined && val !== '') {
        rendered = rendered.split(key).join(val);
      }
    });
    return rendered;
  };

  // Handle Submit Template to Meta
  const handleConfirmSubmit = () => {
    setIsSubmitConfirmVisible(false);
    setIsCreateModalVisible(false);

    const safeName = (formName.trim() || 'custom_template')
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_');

    const newTemplateObj = {
      id: isEditingId || `tmpl_${Date.now()}`,
      name: safeName,
      category: formCategory.toUpperCase(),
      language: formLanguage,
      status: 'PENDING',
      quality: 'Pending',
      headerType: formHeaderType === 'None' ? 'NONE' : 'TEXT',
      headerText: formHeaderType === 'Text' ? formHeaderText : '',
      bodyText: formBodyText,
      variables: Object.keys(formSamples).map((_, i) => `Variable ${i + 1}`),
      sampleValues: formSamples,
      footerText: formFooterText,
      buttons: formButtons,
      createdAt: 'Just now',
      updatedAt: 'Just now',
      statusNote: 'Submitted to Meta. Status updates usually within 5-10 minutes.',
    };

    if (isEditingId) {
      setTemplates((prev) =>
        prev.map((t) => (t.id === isEditingId ? newTemplateObj : t))
      );
      showToast('Template updated & submitted to Meta for review!');
    } else {
      setTemplates((prev) => [newTemplateObj, ...prev]);
      showToast('Template submitted! Meta review status will update within a few minutes.');
    }
  };

  // Handle Save Draft
  const handleSaveDraft = () => {
    setIsCreateModalVisible(false);
    const safeName = (formName.trim() || 'draft_template')
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_');

    const draftObj = {
      id: isEditingId || `tmpl_${Date.now()}`,
      name: safeName,
      category: formCategory.toUpperCase(),
      language: formLanguage,
      status: 'DRAFT',
      quality: 'Draft',
      headerType: formHeaderType === 'None' ? 'NONE' : 'TEXT',
      headerText: formHeaderType === 'Text' ? formHeaderText : '',
      bodyText: formBodyText,
      variables: Object.keys(formSamples).map((_, i) => `Variable ${i + 1}`),
      sampleValues: formSamples,
      footerText: formFooterText,
      buttons: formButtons,
      createdAt: 'Today',
      updatedAt: 'Just now',
      statusNote: 'Saved as draft. Not submitted to Meta yet.',
    };

    if (isEditingId) {
      setTemplates((prev) =>
        prev.map((t) => (t.id === isEditingId ? draftObj : t))
      );
    } else {
      setTemplates((prev) => [draftObj, ...prev]);
    }
    showToast('Template draft saved successfully.');
  };

  // Open "Use This Template" customization modal (Screen 10)
  const handleOpenCustomizeTemplate = (tmpl) => {
    setCustomizingTemplate(tmpl);
    const initialInputs = {};
    tmpl.variables.forEach((v, idx) => {
      const placeholder = `{{${idx + 1}}}`;
      initialInputs[placeholder] =
        (tmpl.defaultSamples && tmpl.defaultSamples[placeholder]) ||
        (tmpl.sampleValues && tmpl.sampleValues[placeholder]) ||
        'Aman';
    });
    setCustomVarInputs(initialInputs);
  };

  // Save customized template into user list
  const handleSaveCustomizedTemplate = () => {
    if (!customizingTemplate) return;
    const customizedName = `${customizingTemplate.name}_customized`;
    const newEntry = {
      id: `tmpl_${Date.now()}`,
      name: customizedName,
      category: customizingTemplate.category,
      language: customizingTemplate.language || 'English',
      status: 'APPROVED',
      quality: 'High',
      headerType: customizingTemplate.headerType,
      headerText: customizingTemplate.headerText,
      bodyText: customizingTemplate.bodyText,
      variables: customizingTemplate.variables,
      sampleValues: customVarInputs,
      footerText: customizingTemplate.footerText,
      buttons: customizingTemplate.buttons,
      createdAt: 'Just now',
      updatedAt: 'Just now',
      statusNote: 'Ready for campaigns. Variables personalized.',
    };
    setTemplates((prev) => [newEntry, ...prev]);
    setCustomizingTemplate(null);
    setActiveMainTab('list');
    showToast('Template customized! Campaign workflow accumulation is in prototype.');
  };

  // Helper for Status Badge Pill styling
  const renderStatusPill = (status) => {
    const s = (status || '').toUpperCase();
    if (s === 'APPROVED') {
      return (
        <View style={[styles.statusBadge, { backgroundColor: '#D1FAE5' }]}>
          <View style={[styles.statusDot, { backgroundColor: '#059669' }]} />
          <Text style={[styles.statusBadgeText, { color: '#065F46' }]}>Approved</Text>
        </View>
      );
    }
    if (s === 'PENDING') {
      return (
        <View style={[styles.statusBadge, { backgroundColor: '#FEF3C7' }]}>
          <View style={[styles.statusDot, { backgroundColor: '#D97706' }]} />
          <Text style={[styles.statusBadgeText, { color: '#92400E' }]}>Pending</Text>
        </View>
      );
    }
    if (s === 'REJECTED') {
      return (
        <View style={[styles.statusBadge, { backgroundColor: '#FEE2E2' }]}>
          <View style={[styles.statusDot, { backgroundColor: '#DC2626' }]} />
          <Text style={[styles.statusBadgeText, { color: '#991B1B' }]}>Rejected</Text>
        </View>
      );
    }
    return (
      <View style={[styles.statusBadge, { backgroundColor: '#F3F4F6' }]}>
        <View style={[styles.statusDot, { backgroundColor: '#6B7280' }]} />
        <Text style={[styles.statusBadgeText, { color: '#4B5563' }]}>Draft</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* TOP HEADER */}
      <View style={styles.topHeader}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>Templates</Text>
          <TouchableOpacity
            style={styles.syncIconButton}
            onPress={handleSyncMeta}
            disabled={isSyncing}
            activeOpacity={0.7}
          >
            <Ionicons
              name="sync-outline"
              size={20}
              color="#059669"
              style={isSyncing ? { transform: [{ rotate: '45deg' }] } : {}}
            />
          </TouchableOpacity>
        </View>

        {/* 3 SUBTABS: Template List | Create Template | Template Gallery */}
        <View style={styles.subtabsContainer}>
          <TouchableOpacity
            style={[
              styles.subtabButton,
              activeMainTab === 'list' && styles.subtabButtonActive,
            ]}
            onPress={() => setActiveMainTab('list')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.subtabText,
                activeMainTab === 'list' && styles.subtabTextActive,
              ]}
            >
              Template List
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.subtabButton,
              activeMainTab === 'create' && styles.subtabButtonActive,
            ]}
            onPress={() => setActiveMainTab('create')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.subtabText,
                activeMainTab === 'create' && styles.subtabTextActive,
              ]}
            >
              Create Template
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.subtabButton,
              activeMainTab === 'gallery' && styles.subtabButtonActive,
            ]}
            onPress={() => setActiveMainTab('gallery')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.subtabText,
                activeMainTab === 'gallery' && styles.subtabTextActive,
              ]}
            >
              Template Gallery
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* MAIN VIEW CONTENT */}
      {activeMainTab === 'list' && (
        <ScrollView
          style={styles.mainScroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Subheader info strip */}
          <View style={styles.listSubheader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionHeading}>Template List</Text>
              <Text style={styles.sectionSubtitle}>
                Manage and organize your WhatsApp message templates.
              </Text>
            </View>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>
                {filteredTemplates.length} Templates
              </Text>
            </View>
          </View>

          {/* Action Row: Sync & + Create Template */}
          <View style={styles.actionRowBar}>
            <TouchableOpacity
              style={styles.syncOutlineBtn}
              onPress={handleSyncMeta}
              activeOpacity={0.7}
            >
              <Ionicons name="refresh-outline" size={17} color="#111827" />
              <Text style={styles.syncOutlineBtnText}>
                {isSyncing ? 'Syncing...' : 'Sync'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.createSolidBtn}
              onPress={() => handleStartCreateFresh('Utility')}
              activeOpacity={0.85}
            >
              <Ionicons name="add" size={19} color="#FFFFFF" />
              <Text style={styles.createSolidBtnText}>Create Template</Text>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchBarContainer}>
            <Ionicons name="search-outline" size={18} color="#9CA3AF" />
            <TextInput
              placeholder="Search templates..."
              placeholderTextColor="#9CA3AF"
              style={styles.searchTextInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Status Filters Horizontal Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterChipsRow}
          >
            {STATUS_FILTERS.map((st) => {
              const isActive = statusFilter === st;
              return (
                <TouchableOpacity
                  key={st}
                  style={[
                    styles.filterChip,
                    isActive && styles.filterChipActive,
                  ]}
                  onPress={() => setStatusFilter(st)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      isActive && styles.filterChipTextActive,
                    ]}
                  >
                    {st}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Templates Cards List */}
          {filteredTemplates.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="document-text-outline" size={32} color="#9CA3AF" />
              </View>
              <Text style={styles.emptyTitle}>No templates found</Text>
              <Text style={styles.emptyDesc}>
                Try searching with another name or filter by another status.
              </Text>
              <TouchableOpacity
                style={styles.emptyCreateBtn}
                onPress={() => handleStartCreateFresh('Utility')}
              >
                <Text style={styles.emptyCreateBtnText}>+ Create Template</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredTemplates.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.templateCard}
                onPress={() => setSelectedDetailsTemplate(item)}
                activeOpacity={0.9}
              >
                <View style={styles.cardHeaderRow}>
                  <View style={styles.cardIconBox}>
                    <Ionicons
                      name="chatbubble-ellipses-outline"
                      size={20}
                      color="#059669"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTemplateName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.cardMetaText}>
                      {item.category.charAt(0).toUpperCase() +
                        item.category.slice(1).toLowerCase()}{' '}
                      • {item.language}
                    </Text>
                  </View>
                  {renderStatusPill(item.status)}
                </View>

                {/* Message snippet preview */}
                <Text style={styles.cardBodySnippet} numberOfLines={2}>
                  {item.bodyText}
                </Text>

                {/* Card Footer: Date + View details */}
                <View style={styles.cardFooterRow}>
                  <Text style={styles.cardCreatedDate}>
                    Created {item.createdAt}
                  </Text>
                  <TouchableOpacity
                    style={styles.viewDetailsRow}
                    onPress={() => setSelectedDetailsTemplate(item)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.viewDetailsText}>View details</Text>
                    <Ionicons name="chevron-forward" size={14} color="#059669" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}

      {/* SUBTAB 2: CHOOSE TEMPLATE METHOD (Screen 7 from Figma) */}
      {activeMainTab === 'create' && (
        <ScrollView
          style={styles.mainScroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.chooseMethodHeader}>
            <Text style={styles.sectionHeading}>Choose Template Method</Text>
            <Text style={styles.sectionSubtitle}>
              Select how you want to create your WhatsApp template.
            </Text>
          </View>

          {/* Option 1: Create New Template */}
          <TouchableOpacity
            style={styles.methodCard}
            onPress={() => handleStartCreateFresh('Marketing')}
            activeOpacity={0.85}
          >
            <View style={styles.methodIconCircleGreen}>
              <Ionicons name="add" size={24} color="#059669" />
            </View>
            <Text style={styles.methodCardTitle}>Create New Template</Text>
            <Text style={styles.methodCardDesc}>
              Build custom templates with full control over content, variables,
              media, and actions.
            </Text>
            <View style={styles.methodCardAction}>
              <Text style={styles.methodCardActionText}>Start Building</Text>
              <Ionicons name="arrow-forward" size={15} color="#059669" />
            </View>
          </TouchableOpacity>

          {/* Option 2: Template Gallery */}
          <TouchableOpacity
            style={styles.methodCard}
            onPress={() => setActiveMainTab('gallery')}
            activeOpacity={0.85}
          >
            <View style={styles.methodIconCircleBlue}>
              <Ionicons name="globe-outline" size={24} color="#2563EB" />
            </View>
            <Text style={styles.methodCardTitle}>Template Gallery</Text>
            <Text style={styles.methodCardDesc}>
              Browse pre-approved templates ready to customize for quick deployment.
            </Text>
            <View style={styles.methodCardAction}>
              <Text style={styles.methodCardActionText}>Browse Library</Text>
              <Ionicons name="arrow-forward" size={15} color="#059669" />
            </View>
          </TouchableOpacity>

          {/* Info Banner at bottom */}
          <View style={styles.infoCalloutBanner}>
            <Ionicons name="information-circle" size={20} color="#059669" />
            <Text style={styles.infoCalloutText}>
              Templates need review from Meta before you can submit them.
              Pre-approved templates also require approval from Meta for review.
            </Text>
          </View>
        </ScrollView>
      )}

      {/* SUBTAB 3: TEMPLATE GALLERY (Screen 9 from Figma) */}
      {activeMainTab === 'gallery' && (
        <ScrollView
          style={styles.mainScroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.listSubheader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionHeading}>Template Gallery</Text>
              <Text style={styles.sectionSubtitle}>
                Choose a template to start your campaign.
              </Text>
            </View>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>
                {filteredGallery.length} Templates
              </Text>
            </View>
          </View>

          {/* + Create Template button */}
          <TouchableOpacity
            style={[styles.createSolidBtn, { marginBottom: 14 }]}
            onPress={() => handleStartCreateFresh('Marketing')}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={19} color="#FFFFFF" />
            <Text style={styles.createSolidBtnText}>Create Template</Text>
          </TouchableOpacity>

          {/* Search Library */}
          <View style={[styles.searchBarContainer, { marginBottom: 14 }]}>
            <Ionicons name="search-outline" size={18} color="#9CA3AF" />
            <TextInput
              placeholder="Search the library..."
              placeholderTextColor="#9CA3AF"
              style={styles.searchTextInput}
              value={gallerySearch}
              onChangeText={setGallerySearch}
            />
            {gallerySearch ? (
              <TouchableOpacity onPress={() => setGallerySearch('')}>
                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Gallery Category Selector */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterChipsRow}
          >
            {['All', 'Marketing', 'Utility', 'Authentication'].map((cat) => {
              const isActive = galleryCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.filterChip,
                    isActive && styles.filterChipActive,
                  ]}
                  onPress={() => setGalleryCategory(cat)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      isActive && styles.filterChipTextActive,
                    ]}
                  >
                    {cat === 'All' ? 'All Templates' : cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Gallery Items */}
          {filteredGallery.map((item) => (
            <View key={item.id} style={styles.galleryCard}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.cardIconBox}>
                  <Ionicons
                    name="document-text-outline"
                    size={20}
                    color="#059669"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTemplateName}>{item.name}</Text>
                  <Text style={styles.cardMetaText}>
                    {item.categoryLabel} • {item.language}
                  </Text>
                </View>
                {renderStatusPill(item.status)}
              </View>

              <Text style={styles.cardBodySnippet}>{item.bodyText}</Text>

              <View style={styles.galleryCardActionsRow}>
                <TouchableOpacity
                  style={styles.galleryPreviewBtn}
                  onPress={() => setGalleryPreviewTemplate(item)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="eye-outline" size={16} color="#374151" />
                  <Text style={styles.galleryPreviewBtnText}>Preview</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.galleryUseBtn}
                  onPress={() => handleOpenCustomizeTemplate(item)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.galleryUseBtnText}>Use Template</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: TEMPLATE DETAILS VIEW (Screen 2 from Figma)      */}
      {/* ======================================================== */}
      <Modal
        visible={!!selectedDetailsTemplate}
        animationType="slide"
        onRequestClose={() => setSelectedDetailsTemplate(null)}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <StatusBar style="dark" />
          {selectedDetailsTemplate && (
            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Top Navigation */}
              <View style={styles.modalTopBar}>
                <TouchableOpacity
                  style={styles.modalBackBtn}
                  onPress={() => setSelectedDetailsTemplate(null)}
                >
                  <Ionicons name="arrow-back" size={22} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.modalTopTitle}>Template Details</Text>
                <View style={{ width: 32 }} />
              </View>

              {/* Top Header Card */}
              <View style={styles.detailsHeaderCard}>
                <View style={styles.detailsTitleRow}>
                  <View style={styles.detailsIconCircle}>
                    <Ionicons
                      name="chatbubble-ellipses"
                      size={20}
                      color="#059669"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.detailsTemplateName}>
                      {selectedDetailsTemplate.name}
                    </Text>
                    <Text style={styles.detailsLangText}>
                      {selectedDetailsTemplate.language || 'English'}
                    </Text>
                  </View>
                  {renderStatusPill(selectedDetailsTemplate.status)}
                </View>

                {/* 4 Action Buttons Row: Sync | Duplicate | Edit | Delete */}
                <View style={styles.detailsActionIconsBar}>
                  <TouchableOpacity
                    style={styles.detailsActionIconItem}
                    onPress={handleSyncMeta}
                  >
                    <View style={styles.actionRoundCircle}>
                      <Ionicons name="sync-outline" size={17} color="#374151" />
                    </View>
                    <Text style={styles.actionIconLabel}>Sync</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.detailsActionIconItem}
                    onPress={() =>
                      handleDuplicateTemplate(selectedDetailsTemplate)
                    }
                  >
                    <View style={styles.actionRoundCircle}>
                      <Ionicons name="copy-outline" size={17} color="#374151" />
                    </View>
                    <Text style={styles.actionIconLabel}>Duplicate</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.detailsActionIconItem}
                    onPress={() => handleEditTemplate(selectedDetailsTemplate)}
                  >
                    <View style={styles.actionRoundCircle}>
                      <Ionicons name="pencil-outline" size={17} color="#059669" />
                    </View>
                    <Text style={styles.actionIconLabel}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.detailsActionIconItem}
                    onPress={() =>
                      handleDeleteTemplate(selectedDetailsTemplate)
                    }
                  >
                    <View style={styles.actionRoundCircleRed}>
                      <Ionicons name="trash-outline" size={17} color="#DC2626" />
                    </View>
                    <Text style={[styles.actionIconLabel, { color: '#DC2626' }]}>
                      Delete
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Template Information Section */}
              <View style={styles.sectionCard}>
                <Text style={styles.sectionCardHeader}>Template Information</Text>

                <View style={styles.infoKeyValueRow}>
                  <Text style={styles.infoKeyText}>Category</Text>
                  <Text style={styles.infoValueText}>
                    {selectedDetailsTemplate.category}
                  </Text>
                </View>

                <View style={styles.infoKeyValueRow}>
                  <Text style={styles.infoKeyText}>Created</Text>
                  <Text style={styles.infoValueText}>
                    {selectedDetailsTemplate.createdAt}
                  </Text>
                </View>

                <View style={styles.infoKeyValueRow}>
                  <Text style={styles.infoKeyText}>Last updated</Text>
                  <Text style={styles.infoValueText}>
                    {selectedDetailsTemplate.updatedAt}
                  </Text>
                </View>

                <View style={styles.infoKeyValueRow}>
                  <Text style={styles.infoKeyText}>Quality</Text>
                  <View style={styles.qualityRow}>
                    <View style={styles.qualityDotGreen} />
                    <Text style={styles.qualityValueText}>
                      {selectedDetailsTemplate.quality || 'High'}
                    </Text>
                  </View>
                </View>

                <View style={styles.statusCalloutBox}>
                  <Ionicons name="shield-checkmark" size={16} color="#059669" />
                  <Text style={styles.statusCalloutText}>
                    {selectedDetailsTemplate.statusNote ||
                      'Updates are usually approved within a few minutes.'}
                  </Text>
                </View>
              </View>

              {/* Message Content Section */}
              <View style={styles.sectionCard}>
                <Text style={styles.sectionCardHeader}>Message content</Text>
                <View style={styles.messageContentBox}>
                  {selectedDetailsTemplate.headerText ? (
                    <Text style={styles.previewContentHeader}>
                      {selectedDetailsTemplate.headerText}
                    </Text>
                  ) : null}
                  <Text style={styles.previewContentBody}>
                    {selectedDetailsTemplate.bodyText}
                  </Text>
                  {selectedDetailsTemplate.footerText ? (
                    <Text style={styles.previewContentFooter}>
                      {selectedDetailsTemplate.footerText}
                    </Text>
                  ) : null}
                </View>
              </View>

              {/* Variables & Samples Section */}
              <View style={styles.sectionCard}>
                <Text style={styles.sectionCardHeader}>Variables & samples</Text>
                {selectedDetailsTemplate.sampleValues &&
                Object.keys(selectedDetailsTemplate.sampleValues).length > 0 ? (
                  Object.keys(selectedDetailsTemplate.sampleValues).map(
                    (key) => (
                      <View key={key} style={styles.varRow}>
                        <View style={styles.varBadge}>
                          <Text style={styles.varBadgeText}>{key}</Text>
                        </View>
                        <Text style={styles.varSampleValueText}>
                          {selectedDetailsTemplate.sampleValues[key]}
                        </Text>
                      </View>
                    )
                  )
                ) : (
                  <Text style={styles.noVarText}>No variables declared.</Text>
                )}
              </View>

              {/* Interactive Buttons Section */}
              <View style={styles.sectionCard}>
                <Text style={styles.sectionCardHeader}>Interactive buttons</Text>
                {selectedDetailsTemplate.buttons &&
                selectedDetailsTemplate.buttons.length > 0 ? (
                  selectedDetailsTemplate.buttons.map((btn, bidx) => (
                    <View key={btn.id || bidx} style={styles.interactiveButtonChip}>
                      <Ionicons
                        name={
                          btn.type === 'URL'
                            ? 'open-outline'
                            : btn.type === 'COPY_CODE'
                            ? 'copy-outline'
                            : 'chatbubble-ellipses-outline'
                        }
                        size={16}
                        color="#059669"
                      />
                      <Text style={styles.interactiveBtnText}>{btn.text}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noVarText}>No interactive buttons.</Text>
                )}
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL 2: CREATE / EDIT 2-STEP BUILDER (Screens 3, 4, 6)   */}
      {/* ======================================================== */}
      <Modal
        visible={isCreateModalVisible}
        animationType="slide"
        onRequestClose={() => setIsCreateModalVisible(false)}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <StatusBar style="dark" />

          {/* Builder Top Bar */}
          <View style={styles.builderTopBar}>
            <TouchableOpacity
              style={styles.modalBackBtn}
              onPress={() => {
                if (builderStep === 2) {
                  setBuilderStep(1);
                } else {
                  setIsCreateModalVisible(false);
                }
              }}
            >
              <Ionicons name="arrow-back" size={22} color="#111827" />
            </TouchableOpacity>

            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.builderMainTitle}>
                {isEditingId ? 'Edit Template' : 'Create New Template'}
              </Text>
              <Text style={styles.builderSubtitle}>
                Build a WhatsApp Business template
              </Text>
            </View>

            {/* In Step 2, show Edit | Preview toggle pill */}
            {builderStep === 2 && (
              <View style={styles.segmentedToggleBox}>
                <TouchableOpacity
                  style={[
                    styles.segmentBtn,
                    builderTab === 'edit' && styles.segmentBtnActive,
                  ]}
                  onPress={() => setBuilderTab('edit')}
                >
                  <Text
                    style={[
                      styles.segmentBtnText,
                      builderTab === 'edit' && styles.segmentBtnTextActive,
                    ]}
                  >
                    Edit
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.segmentBtn,
                    builderTab === 'preview' && styles.segmentBtnActive,
                  ]}
                  onPress={() => setBuilderTab('preview')}
                >
                  <Text
                    style={[
                      styles.segmentBtnText,
                      builderTab === 'preview' && styles.segmentBtnTextActive,
                    ]}
                  >
                    Preview
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Stepper Indicator */}
          <View style={styles.stepperContainer}>
            <View style={styles.stepperHeaderRow}>
              <Text style={styles.stepperText}>
                Step {builderStep} of 2:{' '}
                {builderStep === 1 ? 'Setup' : 'Content'}
              </Text>
            </View>
            <View style={styles.stepperBarTrack}>
              <View
                style={[
                  styles.stepperBarFill,
                  { width: builderStep === 1 ? '50%' : '100%' },
                ]}
              />
            </View>
          </View>

          {/* STEP 1: SETUP FORM */}
          {builderStep === 1 && (
            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.builderSectionTitle}>1. Choose Category</Text>
              <Text style={styles.builderSectionSubtitle}>
                Select the category that best describes your message.
              </Text>

              {CATEGORY_OPTIONS.map((cat) => {
                const isSelected = formCategory === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.radioCard,
                      isSelected && styles.radioCardSelected,
                    ]}
                    onPress={() => setFormCategory(cat.id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.radioTopRow}>
                      <View
                        style={[
                          styles.radioCircle,
                          isSelected && styles.radioCircleSelected,
                        ]}
                      >
                        {isSelected && <View style={styles.radioInnerDot} />}
                      </View>
                      <Ionicons
                        name={cat.icon}
                        size={19}
                        color={isSelected ? '#059669' : '#4B5563'}
                      />
                      <Text
                        style={[
                          styles.radioCardTitle,
                          isSelected && styles.radioCardTitleSelected,
                        ]}
                      >
                        {cat.title}
                      </Text>
                    </View>
                    <Text style={styles.radioCardDesc}>{cat.desc}</Text>
                  </TouchableOpacity>
                );
              })}

              <View style={{ height: 16 }} />

              <Text style={styles.builderSectionTitle}>
                2. Choose Template Type
              </Text>
              <Text style={styles.builderSectionSubtitle}>
                Select what type of format your template uses.
              </Text>

              {TEMPLATE_TYPE_OPTIONS.map((tp) => {
                const isSelected = formType === tp.id;
                return (
                  <TouchableOpacity
                    key={tp.id}
                    style={[
                      styles.radioCard,
                      isSelected && styles.radioCardSelected,
                    ]}
                    onPress={() => setFormType(tp.id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.radioTopRow}>
                      <View
                        style={[
                          styles.radioCircle,
                          isSelected && styles.radioCircleSelected,
                        ]}
                      >
                        {isSelected && <View style={styles.radioInnerDot} />}
                      </View>
                      <Ionicons
                        name={tp.icon}
                        size={19}
                        color={isSelected ? '#059669' : '#4B5563'}
                      />
                      <Text
                        style={[
                          styles.radioCardTitle,
                          isSelected && styles.radioCardTitleSelected,
                        ]}
                      >
                        {tp.title}
                      </Text>
                    </View>
                    <Text style={styles.radioCardDesc}>{tp.desc}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          {/* STEP 2: CONTENT EDITOR */}
          {builderStep === 2 && builderTab === 'edit' && (
            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.builderSectionTitle}>
                Create Template Content
              </Text>
              <Text style={styles.builderSectionSubtitle}>
                Configure the message parameters and text.
              </Text>

              {/* Template Name & Language in 2 columns */}
              <View style={styles.formRowTwoCol}>
                <View style={{ flex: 1.3 }}>
                  <Text style={styles.formLabel}>Template Name *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="welcome_customer"
                    placeholderTextColor="#9CA3AF"
                    value={formName}
                    onChangeText={setFormName}
                    autoCapitalize="none"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.formLabel}>Language</Text>
                  <View style={styles.languagePillBox}>
                    <Text style={styles.languagePillText}>{formLanguage}</Text>
                    <Ionicons name="chevron-down" size={14} color="#6B7280" />
                  </View>
                </View>
              </View>

              {/* Header Selector */}
              <View style={{ marginTop: 14 }}>
                <Text style={styles.formLabel}>Header (Optional)</Text>
                <View style={styles.headerTypeSelectorRow}>
                  {['None', 'Text', 'Media'].map((ht) => {
                    const isSel = formHeaderType === ht;
                    return (
                      <TouchableOpacity
                        key={ht}
                        style={[
                          styles.headerTypePill,
                          isSel && styles.headerTypePillActive,
                        ]}
                        onPress={() => setFormHeaderType(ht)}
                      >
                        <Text
                          style={[
                            styles.headerTypePillText,
                            isSel && styles.headerTypePillTextActive,
                          ]}
                        >
                          {ht}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {formHeaderType === 'Text' && (
                  <TextInput
                    style={[styles.formInput, { marginTop: 8 }]}
                    placeholder="e.g. Welcome to MessBee"
                    placeholderTextColor="#9CA3AF"
                    value={formHeaderText}
                    onChangeText={setFormHeaderText}
                  />
                )}
              </View>

              {/* Body Textarea with + Variable button */}
              <View style={{ marginTop: 14 }}>
                <View style={styles.bodyLabelRow}>
                  <Text style={styles.formLabel}>Body *</Text>
                  <TouchableOpacity
                    style={styles.addVariableBtn}
                    onPress={handleInsertVariable}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="add" size={14} color="#059669" />
                    <Text style={styles.addVariableBtnText}>Variable</Text>
                  </TouchableOpacity>
                </View>

                <TextInput
                  style={styles.formTextArea}
                  placeholder="Enter the message body here. Use {{1}}, {{2}} for variables."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={4}
                  value={formBodyText}
                  onChangeText={setFormBodyText}
                />
                <Text style={styles.charCountText}>
                  {formBodyText.length} / 1024 characters
                </Text>
              </View>

              {/* Footer Input */}
              <View style={{ marginTop: 14 }}>
                <Text style={styles.formLabel}>Footer (Optional)</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. Reply STOP to unsubscribe"
                  placeholderTextColor="#9CA3AF"
                  value={formFooterText}
                  onChangeText={setFormFooterText}
                />
              </View>

              {/* Variable Sample Values Setup */}
              {Object.keys(formSamples).length > 0 && (
                <View style={{ marginTop: 16 }}>
                  <Text style={styles.formLabel}>
                    Sample variable test values
                  </Text>
                  {Object.keys(formSamples).map((k) => (
                    <View key={k} style={styles.sampleInputRow}>
                      <View style={styles.varBadge}>
                        <Text style={styles.varBadgeText}>{k}</Text>
                      </View>
                      <TextInput
                        style={[styles.formInput, { flex: 1 }]}
                        value={formSamples[k]}
                        onChangeText={(txt) =>
                          setFormSamples((prev) => ({ ...prev, [k]: txt }))
                        }
                        placeholder="Sample preview value"
                        placeholderTextColor="#9CA3AF"
                      />
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          )}

          {/* STEP 2: PREVIEW MODE (Screen 6 from Figma - Live WhatsApp Preview) */}
          {builderStep === 2 && builderTab === 'preview' && (
            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.builderSectionTitle}>
                Live WhatsApp Preview
              </Text>
              <Text style={styles.builderSectionSubtitle}>
                Changes from the editor are reflected instantly.
              </Text>

              {/* Phone Mockup Canvas */}
              <View style={styles.whatsappPhoneMockup}>
                {/* Green WhatsApp Header */}
                <View style={styles.waPhoneHeader}>
                  <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
                  <View style={styles.waAvatarCircle}>
                    <Text style={styles.waAvatarText}>M</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Text style={styles.waBusinessName}>MessBee Business</Text>
                      <Ionicons
                        name="checkmark-circle"
                        size={14}
                        color="#25D366"
                      />
                    </View>
                    <Text style={styles.waStatusSub}>
                      Official business account
                    </Text>
                  </View>
                </View>

                {/* WhatsApp Chat Wallpaper background */}
                <View style={styles.waChatWallpaper}>
                  {/* WhatsApp Speech Bubble */}
                  <View style={styles.waSpeechBubble}>
                    {formHeaderType === 'Text' && formHeaderText ? (
                      <Text style={styles.waBubbleHeader}>
                        {formHeaderText}
                      </Text>
                    ) : null}

                    <Text style={styles.waBubbleBody}>
                      {getRenderedBody(formBodyText, formSamples)}
                    </Text>

                    {formFooterText ? (
                      <Text style={styles.waBubbleFooter}>
                        {formFooterText}
                      </Text>
                    ) : null}

                    <View style={styles.waBubbleMetaRow}>
                      <Text style={styles.waTimestamp}>12:45 PM</Text>
                      <Ionicons name="checkmark-done" size={14} color="#53BDEB" />
                    </View>
                  </View>

                  {/* WhatsApp Action Buttons */}
                  {formButtons.map((btn, bidx) => (
                    <TouchableOpacity
                      key={btn.id || bidx}
                      style={styles.waButtonPill}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name="chatbubbles-outline"
                        size={15}
                        color="#059669"
                      />
                      <Text style={styles.waButtonText}>{btn.text}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <Text style={styles.previewFootnote}>
                Preview uses active sample test variable values.
              </Text>
            </ScrollView>
          )}

          {/* Builder Bottom Action Bar */}
          <View style={styles.builderBottomBar}>
            {builderStep === 1 ? (
              <>
                <TouchableOpacity
                  style={styles.draftOutlineBtn}
                  onPress={handleSaveDraft}
                  activeOpacity={0.7}
                >
                  <Text style={styles.draftOutlineBtnText}>Save Draft</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.continueSolidBtn}
                  onPress={() => setBuilderStep(2)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.continueSolidBtnText}>Continue</Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.draftOutlineBtn}
                  onPress={() => setBuilderStep(1)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.draftOutlineBtnText}>Previous</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.submitSolidBtn}
                  onPress={() => setIsSubmitConfirmVisible(true)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.submitSolidBtnText}>Submit Template</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </SafeAreaView>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL 3: CONFIRMATION MODAL (Screen 5 from Figma)        */}
      {/* ======================================================== */}
      <Modal
        visible={isSubmitConfirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsSubmitConfirmVisible(false)}
      >
        <View style={styles.confirmModalOverlay}>
          <View style={styles.confirmCard}>
            <View style={styles.confirmIconCircle}>
              <Ionicons name="paper-plane" size={26} color="#059669" />
            </View>
            <Text style={styles.confirmTitle}>Submit Template?</Text>
            <Text style={styles.confirmMessage}>
              This will be submitted to Meta for review. In average approved
              within 5-10 minutes.
            </Text>
            <View style={styles.confirmActionsRow}>
              <TouchableOpacity
                style={styles.confirmCancelBtn}
                onPress={() => setIsSubmitConfirmVisible(false)}
              >
                <Text style={styles.confirmCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmSubmitBtn}
                onPress={handleConfirmSubmit}
              >
                <Text style={styles.confirmSubmitBtnText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL 4: GALLERY PREVIEW MODAL                           */}
      {/* ======================================================== */}
      <Modal
        visible={!!galleryPreviewTemplate}
        transparent
        animationType="fade"
        onRequestClose={() => setGalleryPreviewTemplate(null)}
      >
        <View style={styles.confirmModalOverlay}>
          {galleryPreviewTemplate && (
            <View style={styles.galleryPreviewDialog}>
              <View style={styles.galleryDialogHeader}>
                <Text style={styles.galleryDialogTitle}>
                  {galleryPreviewTemplate.name}
                </Text>
                <TouchableOpacity
                  onPress={() => setGalleryPreviewTemplate(null)}
                >
                  <Ionicons name="close" size={22} color="#4B5563" />
                </TouchableOpacity>
              </View>

              <View style={styles.waChatWallpaperDialog}>
                <View style={styles.waSpeechBubble}>
                  {galleryPreviewTemplate.headerText ? (
                    <Text style={styles.waBubbleHeader}>
                      {galleryPreviewTemplate.headerText}
                    </Text>
                  ) : null}
                  <Text style={styles.waBubbleBody}>
                    {getRenderedBody(
                      galleryPreviewTemplate.bodyText,
                      galleryPreviewTemplate.defaultSamples
                    )}
                  </Text>
                  <View style={styles.waBubbleMetaRow}>
                    <Text style={styles.waTimestamp}>11:30 AM</Text>
                    <Ionicons name="checkmark-done" size={14} color="#53BDEB" />
                  </View>
                </View>
              </View>

              <View style={styles.galleryDialogFooter}>
                <TouchableOpacity
                  style={styles.confirmCancelBtn}
                  onPress={() => setGalleryPreviewTemplate(null)}
                >
                  <Text style={styles.confirmCancelBtnText}>Close</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.confirmSubmitBtn}
                  onPress={() => {
                    const t = galleryPreviewTemplate;
                    setGalleryPreviewTemplate(null);
                    handleOpenCustomizeTemplate(t);
                  }}
                >
                  <Text style={styles.confirmSubmitBtnText}>Use Template</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL 5: USE THIS TEMPLATE / CUSTOMIZE (Screen 10)       */}
      {/* ======================================================== */}
      <Modal
        visible={!!customizingTemplate}
        animationType="slide"
        onRequestClose={() => setCustomizingTemplate(null)}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <StatusBar style="dark" />
          {customizingTemplate && (
            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Back Header */}
              <View style={styles.modalTopBar}>
                <TouchableOpacity
                  style={styles.modalBackBtn}
                  onPress={() => setCustomizingTemplate(null)}
                >
                  <Ionicons name="arrow-back" size={22} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.modalTopTitle}>Use This Template</Text>
                <View style={{ width: 32 }} />
              </View>

              <View style={{ paddingHorizontal: 16, marginTop: 4 }}>
                <Text style={styles.sectionHeading}>Customize Template</Text>
                <Text style={styles.sectionSubtitle}>
                  Review details and personalize sample variables before continuing.
                </Text>
              </View>

              {/* Template Header Card */}
              <View style={[styles.detailsHeaderCard, { marginHorizontal: 16, marginTop: 14 }]}>
                <View style={styles.detailsTitleRow}>
                  <View style={styles.detailsIconCircle}>
                    <Ionicons
                      name="chatbubble-ellipses"
                      size={20}
                      color="#059669"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.detailsTemplateName}>
                      {customizingTemplate.name}
                    </Text>
                    <Text style={styles.detailsLangText}>
                      {customizingTemplate.language || 'English'}
                    </Text>
                  </View>
                  {renderStatusPill(customizingTemplate.status)}
                </View>
              </View>

              {/* Customizable Variables Inputs */}
              <View style={[styles.sectionCard, { marginHorizontal: 16, marginTop: 14 }]}>
                <Text style={styles.sectionCardHeader}>Customizable variables</Text>
                {Object.keys(customVarInputs).map((placeholder) => (
                  <View key={placeholder} style={{ marginTop: 8 }}>
                    <Text style={styles.formLabel}>Value for {placeholder}</Text>
                    <TextInput
                      style={styles.formInput}
                      value={customVarInputs[placeholder]}
                      onChangeText={(val) =>
                        setCustomVarInputs((prev) => ({
                          ...prev,
                          [placeholder]: val,
                        }))
                      }
                      placeholder="Enter value"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                ))}
              </View>

              {/* Live WhatsApp Preview Box */}
              <View style={{ marginHorizontal: 16, marginTop: 14 }}>
                <View style={styles.whatsappPhoneMockup}>
                  <View style={styles.waPhoneHeader}>
                    <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
                    <View style={styles.waAvatarCircle}>
                      <Text style={styles.waAvatarText}>M</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <Text style={styles.waBusinessName}>MessBee Business</Text>
                      <Text style={styles.waStatusSub}>Official business account</Text>
                    </View>
                  </View>

                  <View style={styles.waChatWallpaper}>
                    <View style={styles.waSpeechBubble}>
                      {customizingTemplate.headerText ? (
                        <Text style={styles.waBubbleHeader}>
                          {customizingTemplate.headerText}
                        </Text>
                      ) : null}
                      <Text style={styles.waBubbleBody}>
                        {getRenderedBody(
                          customizingTemplate.bodyText,
                          customVarInputs
                        )}
                      </Text>
                      <View style={styles.waBubbleMetaRow}>
                        <Text style={styles.waTimestamp}>Now</Text>
                        <Ionicons name="checkmark-done" size={14} color="#53BDEB" />
                      </View>
                    </View>
                  </View>
                </View>
              </View>

              {/* Footnote & Button */}
              <View style={{ paddingHorizontal: 16, marginVertical: 18 }}>
                <Text style={styles.nothingSentNote}>
                  Nothing will be sent yet. Continue to the next campaign workflow.
                  Group and recipient selection comes in a future step.
                </Text>

                <TouchableOpacity
                  style={styles.useTemplateSolidBtn}
                  onPress={handleSaveCustomizedTemplate}
                  activeOpacity={0.85}
                >
                  <Text style={styles.useTemplateSolidBtnText}>
                    Use This Template
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>

      {/* ======================================================== */}
      {/* FLOATING TOAST NOTIFICATION (Screen 11 from Figma)       */}
      {/* ======================================================== */}
      {toastMessage && (
        <View style={styles.toastContainer}>
          <View style={styles.toastCard}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingTop: Platform.OS === 'android' ? 32 : 0,
  },
  topHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 23,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.3,
  },
  syncIconButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 3,
  },
  subtabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  subtabButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  subtabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  subtabTextActive: {
    color: '#059669',
    fontWeight: '800',
  },
  mainScroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 36,
  },
  listSubheader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  countBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  actionRowBar: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  syncOutlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  syncOutlineBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  createSolidBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#059669',
  },
  createSolidBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
    marginBottom: 12,
  },
  searchTextInput: {
    flex: 1,
    fontSize: 13,
    color: '#111827',
  },
  filterChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#059669',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterChipTextActive: {
    color: '#059669',
    fontWeight: '800',
  },
  templateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  cardIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTemplateName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  cardMetaText: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  cardBodySnippet: {
    fontSize: 12.5,
    color: '#4B5563',
    lineHeight: 18,
    marginBottom: 12,
  },
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  cardCreatedDate: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  viewDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewDetailsText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  emptyDesc: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 17,
  },
  emptyCreateBtn: {
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#059669',
  },
  emptyCreateBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12.5,
  },
  chooseMethodHeader: {
    marginBottom: 16,
  },
  methodCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  methodIconCircleGreen: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  methodIconCircleBlue: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  methodCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  methodCardDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    lineHeight: 17,
  },
  methodCardAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 14,
  },
  methodCardActionText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#059669',
  },
  infoCalloutBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 12,
    padding: 14,
    marginTop: 10,
  },
  infoCalloutText: {
    flex: 1,
    fontSize: 11.5,
    color: '#065F46',
    lineHeight: 16,
  },
  galleryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  galleryCardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  galleryPreviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  galleryPreviewBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  galleryUseBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#059669',
  },
  galleryUseBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalSafeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  modalTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalBackBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTopTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  modalScroll: {
    flex: 1,
  },
  modalScrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  detailsHeaderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 14,
  },
  detailsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  detailsIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsTemplateName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  detailsLangText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  detailsActionIconsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  detailsActionIconItem: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  actionRoundCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRoundCircleRed: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4B5563',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  sectionCardHeader: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 10,
  },
  infoKeyValueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  infoKeyText: {
    fontSize: 12,
    color: '#6B7280',
  },
  infoValueText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  qualityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  qualityDotGreen: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  qualityValueText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  statusCalloutBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  statusCalloutText: {
    flex: 1,
    fontSize: 11,
    color: '#065F46',
  },
  messageContentBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  previewContentHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  previewContentBody: {
    fontSize: 12.5,
    color: '#374151',
    lineHeight: 18,
  },
  previewContentFooter: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 8,
  },
  varRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 5,
  },
  varBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  varBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  varSampleValueText: {
    fontSize: 12,
    color: '#111827',
    fontWeight: '600',
  },
  noVarText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  interactiveButtonChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 6,
  },
  interactiveBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#111827',
  },
  builderTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  builderMainTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  builderSubtitle: {
    fontSize: 11,
    color: '#6B7280',
  },
  segmentedToggleBox: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 2,
  },
  segmentBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
  },
  segmentBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  segmentBtnTextActive: {
    color: '#059669',
    fontWeight: '800',
  },
  stepperContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  stepperHeaderRow: {
    marginBottom: 6,
  },
  stepperText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#4B5563',
  },
  stepperBarTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  stepperBarFill: {
    height: '100%',
    backgroundColor: '#059669',
  },
  builderSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 2,
  },
  builderSectionSubtitle: {
    fontSize: 11.5,
    color: '#6B7280',
    marginBottom: 12,
  },
  radioCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 10,
  },
  radioCardSelected: {
    borderColor: '#059669',
    backgroundColor: '#F6FEF9',
  },
  radioTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: '#059669',
  },
  radioInnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#059669',
  },
  radioCardTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#111827',
  },
  radioCardTitleSelected: {
    color: '#059669',
  },
  radioCardDesc: {
    fontSize: 11.5,
    color: '#6B7280',
    marginLeft: 26,
    marginTop: 4,
    lineHeight: 16,
  },
  formRowTwoCol: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 5,
  },
  formInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    fontSize: 12.5,
    color: '#111827',
  },
  languagePillBox: {
    height: 40,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  languagePillText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#111827',
  },
  headerTypeSelectorRow: {
    flexDirection: 'row',
    gap: 8,
  },
  headerTypePill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  headerTypePillActive: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#059669',
  },
  headerTypePillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  headerTypePillTextActive: {
    color: '#059669',
    fontWeight: '800',
  },
  bodyLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addVariableBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#059669',
    backgroundColor: '#ECFDF5',
  },
  addVariableBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  formTextArea: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 12,
    minHeight: 90,
    fontSize: 12.5,
    color: '#111827',
    textAlignVertical: 'top',
    marginTop: 6,
  },
  charCountText: {
    fontSize: 10.5,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
  },
  sampleInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  whatsappPhoneMockup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  waPhoneHeader: {
    backgroundColor: '#075E54',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  waAvatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#128C7E',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  waAvatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  waBusinessName: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  waStatusSub: {
    color: '#A7F3D0',
    fontSize: 10,
  },
  waChatWallpaper: {
    backgroundColor: '#EFEAE2',
    padding: 14,
    minHeight: 200,
  },
  waChatWallpaperDialog: {
    backgroundColor: '#EFEAE2',
    padding: 14,
    borderRadius: 10,
    marginVertical: 10,
  },
  waSpeechBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    maxWidth: '92%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  waBubbleHeader: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  waBubbleBody: {
    fontSize: 12.5,
    color: '#111827',
    lineHeight: 18,
  },
  waBubbleFooter: {
    fontSize: 10.5,
    color: '#667781',
    marginTop: 6,
  },
  waBubbleMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 6,
  },
  waTimestamp: {
    fontSize: 10,
    color: '#667781',
  },
  waButtonPill: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  waButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  previewFootnote: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 10,
  },
  builderBottomBar: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  draftOutlineBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  draftOutlineBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4B5563',
  },
  continueSolidBtn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#059669',
  },
  continueSolidBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  submitSolidBtn: {
    flex: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#059669',
  },
  submitSolidBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  confirmModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  confirmCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  confirmIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  confirmTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  confirmMessage: {
    fontSize: 12.5,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },
  confirmActionsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  confirmCancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  confirmCancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  confirmSubmitBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#059669',
  },
  confirmSubmitBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  galleryPreviewDialog: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
  },
  galleryDialogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  galleryDialogTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  galleryDialogFooter: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  nothingSentNote: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 16,
    textAlign: 'center',
    marginBottom: 12,
  },
  useTemplateSolidBtn: {
    backgroundColor: '#059669',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  useTemplateSolidBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  toastContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 34 : 20,
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  toastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#111827',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  toastText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 16,
  },
});

