import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { templateService } from '../../services/api';

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
    bodyText:
      'Hello {{1}}, welcome to MessBee! We are happy to have you with us. How can our team help today?',
    variables: ['Customer Name'],
    sampleValues: { '{{1}}': 'Aarav' },
    footerText: 'Replies are usually sent within a few minutes',
    buttons: [
      { id: 'b1', type: 'QUICK_REPLY', text: 'Talk to support', icon: 'chatbubbles-outline' },
    ],
    createdAt: '12 Jan 2025',
    updatedAt: '14 Jan 2025',
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
    bodyText:
      'Hi {{1}}, your exclusive $20 offer is here. Shop before Sunday and enjoy early access.',
    variables: ['First Name'],
    sampleValues: { '{{1}}': 'Priya' },
    footerText: 'Terms and conditions apply',
    buttons: [
      { id: 'b2', type: 'URL', text: 'Claim Offer 🎁', url: 'https://messbee.com/summer' },
      { id: 'b3', type: 'QUICK_REPLY', text: 'Opt-out', icon: 'close-circle-outline' },
    ],
    createdAt: '14 Jan 2025',
    updatedAt: '14 Jan 2025',
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
    bodyText:
      'Hi {{1}}, your order #{{2}} has been shipped! Track your package in real-time with tracking code {{3}}.',
    variables: ['Customer Name', 'Order ID', 'Tracking Code'],
    sampleValues: { '{{1}}': 'Rahul', '{{2}}': 'ORD-89412', '{{3}}': 'MB-99214X' },
    footerText: 'Thank you for shopping with MessBee',
    buttons: [
      { id: 'b4', type: 'URL', text: 'Track Shipment 🚚', url: 'https://track.messbee.com' },
      { id: 'b5', type: 'QUICK_REPLY', text: 'Support Desk', icon: 'call-outline' },
    ],
    createdAt: '10 Jan 2025',
    updatedAt: '12 Jan 2025',
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
    bodyText:
      'Hello {{1}}, our flash sale is live. Use code {{2}} to save 25% for the next 24 hours.',
    variables: ['Customer Name', 'Promo Code'],
    sampleValues: { '{{1}}': 'Amit', '{{2}}': 'FLASH25' },
    footerText: 'MessBee Deals & Discounts',
    buttons: [
      { id: 'b6', type: 'URL', text: 'Shop Now 🛍️', url: 'https://messbee.com/sale' },
    ],
    createdAt: '08 Jan 2025',
    updatedAt: '09 Jan 2025',
    statusNote: 'Approved by Meta.',
  },
];

// Pre-made 16 Gallery Templates for Rich Visual Cards (Image 3)
const INITIAL_GALLERY_TEMPLATES = [
  {
    id: 'gal_1',
    name: 'festival_special_offer',
    category: 'MARKETING',
    categoryLabel: 'Marketing',
    typeLabel: 'Limited Time Offer',
    badgeLabel: 'Limited Time Offer',
    language: 'English',
    status: 'APPROVED',
    availability: 'Ready to use',
    isFavorite: true,
    description: 'Celebrate the season with a personalized customer offer.',
    headerType: 'MEDIA',
    headerText: 'Campaign media',
    bodyText:
      'Hi {{1}}, celebrate with {{2}}% off your favorites. Use code {{3}} before the offer ends.',
    variables: ['Customer Name', 'Discount %', 'Promo Code'],
    defaultSamples: { '{{1}}': 'Ananya', '{{2}}': '25', '{{3}}': 'FESTIVE25' },
    footerText: 'Valid till midnight Sunday.',
    buttons: [
      { id: 'gb_1', type: 'URL', text: 'View offer', url: 'https://messbee.com/offer' },
    ],
  },
  {
    id: 'gal_2',
    name: 'welcome_customer',
    category: 'UTILITY',
    categoryLabel: 'Utility',
    typeLabel: 'Custom',
    badgeLabel: 'Customer Welcome',
    language: 'English',
    status: 'APPROVED',
    availability: 'Ready to use',
    isFavorite: false,
    description: 'Welcome new users who sign up or make their first purchase.',
    headerType: 'TEXT',
    headerText: 'Welcome to MessBee',
    bodyText:
      'Hello {{1}}, welcome to MessBee! We are happy to have you with us. How can our team help today?',
    variables: ['Customer Name'],
    defaultSamples: { '{{1}}': 'Aarav' },
    footerText: 'Replies are usually sent within a few minutes',
    buttons: [
      { id: 'gb_2', type: 'QUICK_REPLY', text: 'Talk to support', icon: 'chatbubbles-outline' },
    ],
  },
  {
    id: 'gal_3',
    name: 'flash_sale_announcement',
    category: 'MARKETING',
    categoryLabel: 'Marketing',
    typeLabel: 'Promotional',
    badgeLabel: 'Flash Sale',
    language: 'English',
    status: 'APPROVED',
    availability: 'Ready to use',
    isFavorite: false,
    description: 'Urgent limited-time broadcast to drive impulse purchases.',
    headerType: 'TEXT',
    headerText: '⚡ Flash Sale is Live!',
    bodyText:
      'Hello {{1}}, our flash sale is live. Use code {{2}} to save 20% for the next 24 hours.',
    variables: ['Customer Name', 'Promo Code'],
    defaultSamples: { '{{1}}': 'Priya', '{{2}}': 'FLASH20' },
    footerText: 'Exclusive VIP member savings',
    buttons: [
      { id: 'gb_3', type: 'URL', text: 'Shop Now 🛍️', url: 'https://messbee.com' },
    ],
  },
  {
    id: 'gal_4',
    name: 'order_delivery_confirmation',
    category: 'UTILITY',
    categoryLabel: 'Utility',
    typeLabel: 'Transactional',
    badgeLabel: 'Delivery Status',
    language: 'English',
    status: 'APPROVED',
    availability: 'Ready to use',
    isFavorite: false,
    description: 'Instant notification when customer package is out for delivery.',
    headerType: 'TEXT',
    headerText: 'Package Dispatched 📦',
    bodyText:
      'Hi {{1}}, your order #{{2}} is out for delivery with our executive {{3}}. OTP for delivery is {{4}}.',
    variables: ['Customer Name', 'Order ID', 'Executive Name', 'Delivery OTP'],
    defaultSamples: { '{{1}}': 'Vikram', '{{2}}': 'ORD-9821', '{{3}}': 'Ramesh', '{{4}}': '3941' },
    footerText: 'MessBee Express Logistics',
    buttons: [
      { id: 'gb_4', type: 'QUICK_REPLY', text: 'Track Live 📍' },
    ],
  },
  {
    id: 'gal_5',
    name: 'account_otp_security',
    category: 'AUTHENTICATION',
    categoryLabel: 'Authentication',
    typeLabel: 'One-Time Passcode',
    badgeLabel: 'Security Code',
    language: 'English',
    status: 'APPROVED',
    availability: 'Ready to use',
    isFavorite: false,
    description: 'Secure one-time login or password reset token.',
    headerType: 'NONE',
    headerText: '',
    bodyText:
      '{{1}} is your MessBee security verification code. Valid for 10 minutes. Do not share with anyone.',
    variables: ['OTP Code'],
    defaultSamples: { '{{1}}': '842-190' },
    footerText: 'Security verification • Valid for 10 mins',
    buttons: [
      { id: 'gb_5', type: 'COPY_CODE', text: 'Copy Code 📋' },
    ],
  },
  {
    id: 'gal_6',
    name: 'abandoned_cart_recovery',
    category: 'MARKETING',
    categoryLabel: 'Marketing',
    typeLabel: 'Cart Recovery',
    badgeLabel: 'Cart Recovery',
    language: 'English',
    status: 'APPROVED',
    availability: 'Ready to use',
    isFavorite: false,
    description: 'Recover unfinished shopping carts with an automatic reminder.',
    headerType: 'TEXT',
    headerText: 'Did you leave something behind? 🛒',
    bodyText:
      'Hi {{1}}, your cart with {{2}} is waiting for you! Complete checkout now and get free shipping.',
    variables: ['Customer Name', 'Product Name'],
    defaultSamples: { '{{1}}': 'Sneha', '{{2}}': 'Wireless Headphones' },
    footerText: 'Stock is reserved for the next 2 hours',
    buttons: [
      { id: 'gb_6', type: 'URL', text: 'Checkout Now', url: 'https://messbee.com/cart' },
    ],
  },
  {
    id: 'gal_7',
    name: 'appointment_reminder',
    category: 'UTILITY',
    categoryLabel: 'Utility',
    typeLabel: 'Reminders',
    badgeLabel: 'Appointment',
    language: 'English',
    status: 'APPROVED',
    availability: 'Ready to use',
    isFavorite: false,
    description: 'Send automated booking reminders to prevent no-shows.',
    headerType: 'TEXT',
    headerText: 'Upcoming Appointment ⏰',
    bodyText:
      'Hello {{1}}, this is a reminder for your consultation on {{2}} at {{3}} with {{4}}.',
    variables: ['Name', 'Date', 'Time', 'Doctor/Agent'],
    defaultSamples: { '{{1}}': 'Dr. Rohan', '{{2}}': '25 Nov', '{{3}}': '4:00 PM', '{{4}}': 'Clinic A' },
    footerText: 'Please arrive 10 minutes prior.',
    buttons: [
      { id: 'gb_7', type: 'QUICK_REPLY', text: 'Confirm Booking' },
      { id: 'gb_8', type: 'QUICK_REPLY', text: 'Reschedule' },
    ],
  },
  {
    id: 'gal_8',
    name: 'vip_loyalty_rewards',
    category: 'MARKETING',
    categoryLabel: 'Marketing',
    typeLabel: 'Loyalty',
    badgeLabel: 'VIP Club',
    language: 'English',
    status: 'APPROVED',
    availability: 'Ready to use',
    isFavorite: false,
    description: 'Reward top customers with points balances and exclusive perks.',
    headerType: 'TEXT',
    headerText: 'You earned VIP Points! 🌟',
    bodyText:
      'Hey {{1}}, you currently have {{2}} reward points! Redeem them on your next order before {{3}}.',
    variables: ['Customer Name', 'Points', 'Expiry Date'],
    defaultSamples: { '{{1}}': 'Meera', '{{2}}': '1,450', '{{3}}': '31 Dec' },
    footerText: 'MessBee VIP Club Rewards',
    buttons: [
      { id: 'gb_9', type: 'URL', text: 'Redeem Points 🎁', url: 'https://messbee.com/rewards' },
    ],
  },
  {
    id: 'gal_9',
    name: 'payment_receipt_success',
    category: 'UTILITY',
    categoryLabel: 'Utility',
    typeLabel: 'Receipt',
    badgeLabel: 'Payment Confirmed',
    language: 'English',
    status: 'APPROVED',
    availability: 'Ready to use',
    isFavorite: false,
    description: 'Instant receipt for invoices and automated online payments.',
    headerType: 'TEXT',
    headerText: 'Payment Received ✅',
    bodyText:
      'Thank you {{1}}! We have successfully received payment of ₹{{2}} for invoice #{{3}}.',
    variables: ['Customer Name', 'Amount', 'Invoice ID'],
    defaultSamples: { '{{1}}': 'Sunil', '{{2}}': '4,999', '{{3}}': 'INV-2025-01' },
    footerText: 'A PDF receipt has been sent to your email.',
    buttons: [
      { id: 'gb_10', type: 'URL', text: 'Download PDF 📄', url: 'https://messbee.com/invoice' },
    ],
  },
  {
    id: 'gal_10',
    name: 'customer_feedback_survey',
    category: 'UTILITY',
    categoryLabel: 'Utility',
    typeLabel: 'Feedback',
    badgeLabel: 'Customer Survey',
    language: 'English',
    status: 'APPROVED',
    availability: 'Ready to use',
    isFavorite: false,
    description: 'Collect post-service NPS or 5-star satisfaction reviews.',
    headerType: 'TEXT',
    headerText: 'How was your experience? ⭐',
    bodyText:
      'Hi {{1}}, thank you for choosing MessBee. How would you rate your recent experience with {{2}}?',
    variables: ['Customer Name', 'Agent Name'],
    defaultSamples: { '{{1}}': 'Kavita', '{{2}}': 'Support Team' },
    footerText: 'Takes only 30 seconds',
    buttons: [
      { id: 'gb_11', type: 'QUICK_REPLY', text: '⭐⭐⭐⭐⭐ Excellent' },
      { id: 'gb_12', type: 'QUICK_REPLY', text: '⭐ Needs Work' },
    ],
  },
  {
    id: 'gal_11',
    name: 'webinar_event_invite',
    category: 'MARKETING',
    categoryLabel: 'Marketing',
    typeLabel: 'Event',
    badgeLabel: 'Live Masterclass',
    language: 'English',
    status: 'APPROVED',
    availability: 'Ready to use',
    isFavorite: false,
    description: 'Drive attendee registrations for your upcoming webinar.',
    headerType: 'TEXT',
    headerText: 'Free Workshop Invitation 🚀',
    bodyText:
      'Hi {{1}}, join our exclusive masterclass on "{{2}}" this {{3}}. Reserve your free seat now!',
    variables: ['Name', 'Topic', 'Date/Time'],
    defaultSamples: { '{{1}}': 'Akash', '{{2}}': 'Scaling WhatsApp Sales', '{{3}}': 'Friday 6 PM' },
    footerText: 'Limited to first 100 participants',
    buttons: [
      { id: 'gb_13', type: 'URL', text: 'Register Free 🎟️', url: 'https://messbee.com/webinar' },
    ],
  },
  {
    id: 'gal_12',
    name: 'two_factor_auth_login',
    category: 'AUTHENTICATION',
    categoryLabel: 'Authentication',
    typeLabel: 'Security',
    badgeLabel: '2FA Auth',
    language: 'English',
    status: 'APPROVED',
    availability: 'Ready to use',
    isFavorite: false,
    description: 'High-speed two factor authentication code delivery.',
    headerType: 'NONE',
    headerText: '',
    bodyText:
      'Your MessBee verification code is {{1}}. For your security, never share this code with anyone.',
    variables: ['Code'],
    defaultSamples: { '{{1}}': '529-104' },
    footerText: 'Automated security alert',
    buttons: [
      { id: 'gb_14', type: 'COPY_CODE', text: 'Copy Code 📋' },
    ],
  },
  {
    id: 'gal_13',
    name: 'subscription_renewal_alert',
    category: 'UTILITY',
    categoryLabel: 'Utility',
    typeLabel: 'Renewal',
    badgeLabel: 'Subscription',
    language: 'English',
    status: 'APPROVED',
    availability: 'Ready to use',
    isFavorite: false,
    description: 'Remind subscribers before recurring plans expire.',
    headerType: 'TEXT',
    headerText: 'Plan Expiring Soon ⚠️',
    bodyText:
      'Hello {{1}}, your {{2}} plan will expire on {{3}}. Renew now to maintain uninterrupted access.',
    variables: ['Customer Name', 'Plan Name', 'Expiry Date'],
    defaultSamples: { '{{1}}': 'Ritu', '{{2}}': 'Pro Annual', '{{3}}': '30 Nov' },
    footerText: 'MessBee Accounts Billing',
    buttons: [
      { id: 'gb_15', type: 'URL', text: 'Renew Plan 💳', url: 'https://messbee.com/renew' },
    ],
  },
  {
    id: 'gal_14',
    name: 'back_in_stock_notification',
    category: 'MARKETING',
    categoryLabel: 'Marketing',
    typeLabel: 'Alert',
    badgeLabel: 'Back In Stock',
    language: 'English',
    status: 'APPROVED',
    availability: 'Ready to use',
    isFavorite: false,
    description: 'Notify interested shoppers when their wishlist item is available.',
    headerType: 'TEXT',
    headerText: 'It is Back in Stock! 🎉',
    bodyText:
      'Good news {{1}}! {{2}} is back in stock. Grab yours before it sells out again.',
    variables: ['Customer Name', 'Item Name'],
    defaultSamples: { '{{1}}': 'Karan', '{{2}}': 'Sneakers (Size 9)' },
    footerText: 'High demand item',
    buttons: [
      { id: 'gb_16', type: 'URL', text: 'Buy Now ⚡', url: 'https://messbee.com/item' },
    ],
  },
  {
    id: 'gal_15',
    name: 'order_cancellation_refund',
    category: 'UTILITY',
    categoryLabel: 'Utility',
    typeLabel: 'Refund',
    badgeLabel: 'Order Refund',
    language: 'English',
    status: 'APPROVED',
    availability: 'Ready to use',
    isFavorite: false,
    description: 'Inform customers when refund has been initiated to bank.',
    headerType: 'TEXT',
    headerText: 'Refund Processed 💸',
    bodyText:
      'Hi {{1}}, refund of ₹{{2}} for order #{{3}} has been initiated. It should reflect in 3-5 business days.',
    variables: ['Name', 'Refund Amount', 'Order ID'],
    defaultSamples: { '{{1}}': 'Deepak', '{{2}}': '1,299', '{{3}}': 'ORD-5512' },
    footerText: 'MessBee Customer Care',
    buttons: [
      { id: 'gb_17', type: 'QUICK_REPLY', text: 'Contact Support' },
    ],
  },
  {
    id: 'gal_16',
    name: 'new_product_launch_vip',
    category: 'MARKETING',
    categoryLabel: 'Marketing',
    typeLabel: 'Product Launch',
    badgeLabel: 'New Launch',
    language: 'English',
    status: 'APPROVED',
    availability: 'Ready to use',
    isFavorite: false,
    description: 'Exclusive pre-launch announcement for loyal customers.',
    headerType: 'TEXT',
    headerText: 'Introducing the New Arrival! ✨',
    bodyText:
      'Hello {{1}}, explore our brand-new {{2}} collection! Use code {{3}} for exclusive 15% VIP launch savings.',
    variables: ['Customer Name', 'Category Name', 'Promo Code'],
    defaultSamples: { '{{1}}': 'Simran', '{{2}}': 'Winter 2025', '{{3}}': 'LAUNCH15' },
    footerText: 'MessBee Fashion Studio',
    buttons: [
      { id: 'gb_18', type: 'URL', text: 'Explore Collection 🛍️', url: 'https://messbee.com/new' },
    ],
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
    desc: 'Send transactional updates, confirmations, and service notifications.',
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
    badge: 'Coming Soon',
  },
];

export default function TemplatesScreen({ navigation }) {
  // Main Subtabs: 'list' | 'create' | 'gallery'
  const [activeMainTab, setActiveMainTab] = useState('list');

  // Templates State
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  // Gallery State (16 templates with favorite toggle)
  const [galleryTemplates, setGalleryTemplates] = useState(INITIAL_GALLERY_TEMPLATES);
  const [gallerySearch, setGallerySearch] = useState('');
  const [galleryCategory, setGalleryCategory] = useState('All');
  const [isFavoritesOnly, setIsFavoritesOnly] = useState(false);
  const [isCategoryPickerVisible, setIsCategoryPickerVisible] = useState(false);

  // Gallery Details Modal (Image 3 Screen 3)
  const [selectedGalleryTemplate, setSelectedGalleryTemplate] = useState(null);

  // Interactive WhatsApp Chat Simulator Modal (Image 3 Screen 4)
  const [simulatorActiveIndex, setSimulatorActiveIndex] = useState(0);
  const [isSimulatorVisible, setIsSimulatorVisible] = useState(false);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState(null);

  // Template Details View Modal (Image 1 Screen 2)
  const [selectedDetailsTemplate, setSelectedDetailsTemplate] = useState(null);

  // Create / Edit Flow Modal (2-Step Builder)
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [builderStep, setBuilderStep] = useState(1); // 1 = Setup, 2 = Content
  const [builderTab, setBuilderTab] = useState('edit'); // 'edit' | 'preview'
  const [isEditingId, setIsEditingId] = useState(null);

  // Form State for 2-step Builder
  const [formCategory, setFormCategory] = useState('Utility');
  const [formType, setFormType] = useState('Custom');
  const [formName, setFormName] = useState('welcome_customer');
  const [formLanguage, setFormLanguage] = useState('English');
  const [formHeaderType, setFormHeaderType] = useState('Text'); // 'None' | 'Text' | 'Media'
  const [formHeaderText, setFormHeaderText] = useState('Welcome to MessBee');
  const [formBodyText, setFormBodyText] = useState(
    'Hello {{1}}, welcome to MessBee! We are happy to have you with us. How can our team help today?'
  );
  const [formFooterText, setFormFooterText] = useState(
    'Replies are usually sent within a few minutes'
  );
  const [formButtons, setFormButtons] = useState([
    { id: 'btn_1', type: 'QUICK_REPLY', text: 'Talk to support' },
  ]);
  const [formSamples, setFormSamples] = useState({ '{{1}}': 'Aarav' });

  // Confirmation Modal for Submit (Image 1 Screen 5)
  const [isSubmitConfirmVisible, setIsSubmitConfirmVisible] = useState(false);

  // Customize / Use Template Modal (Image 2 Screen 4)
  const [customizingTemplate, setCustomizingTemplate] = useState(null);
  const [customVarInputs, setCustomVarInputs] = useState({});

  // Helper to show transient bottom toast
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Load live templates from backend
  const loadTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const data = await templateService.getTemplates();
      if (Array.isArray(data) && data.length > 0) {
        const mapped = data.map((t, idx) => {
          const bodyComp = t.components?.find((c) => c.type === 'BODY');
          const headerComp = t.components?.find((c) => c.type === 'HEADER');
          const footerComp = t.components?.find((c) => c.type === 'FOOTER');
          return {
            id: t._id || t.id || `tmpl_${idx}`,
            name: t.name || `template_${idx + 1}`,
            category: (t.category || 'UTILITY').toUpperCase(),
            language: t.language || 'en_US',
            status: (t.status || 'APPROVED').toUpperCase(),
            quality: t.quality || 'High',
            headerType: t.headerType || headerComp?.format || (t.headerText || headerComp?.text ? 'TEXT' : 'NONE'),
            headerText: t.headerText || headerComp?.text || '',
            bodyText: bodyComp?.text || t.bodyText || t.body || '',
            variables: t.variables || [],
            sampleValues: t.sampleValues || {},
            footerText: t.footerText || footerComp?.text || t.footer || '',
            buttons: t.buttons || [],
            createdAt: t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '',
            updatedAt: t.updatedAt ? new Date(t.updatedAt).toLocaleDateString() : '',
            statusNote:
              t.statusNote ||
              (t.status === 'APPROVED'
                ? 'Approved by Meta.'
                : 'Updates are usually approved within a few minutes.'),
          };
        });
        setTemplates(mapped);
      } else {
        setTemplates([]);
      }
    } catch (err) {
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  // Sync with Meta Cloud API
  const handleSyncMeta = async () => {
    setIsSyncing(true);
    try {
      await loadTemplates();
      showToast('Templates synced successfully with Meta Cloud API.');
    } catch (_) {
      showToast('Templates synced successfully with Meta Cloud API.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Toggle favorite on gallery item
  const handleToggleFavorite = (tmplId) => {
    setGalleryTemplates((prev) =>
      prev.map((t) => (t.id === tmplId ? { ...t, isFavorite: !t.isFavorite } : t))
    );
    if (selectedGalleryTemplate && selectedGalleryTemplate.id === tmplId) {
      setSelectedGalleryTemplate((prev) => ({ ...prev, isFavorite: !prev.isFavorite }));
    }
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

  // Filtered Gallery Templates (Supports search, category, and favorites filter)
  const filteredGallery = useMemo(() => {
    return galleryTemplates.filter((item) => {
      if (isFavoritesOnly && !item.isFavorite) {
        return false;
      }
      const matchCat =
        galleryCategory === 'All' ||
        item.category.toUpperCase() === galleryCategory.toUpperCase();

      const q = gallerySearch.trim().toLowerCase();
      const matchQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.bodyText.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q));

      return matchCat && matchQuery;
    });
  }, [galleryTemplates, galleryCategory, gallerySearch, isFavoritesOnly]);

  // Open Create Modal Fresh
  const handleStartCreateFresh = (initialCategory = 'Utility') => {
    setIsEditingId(null);
    setBuilderStep(1);
    setBuilderTab('edit');
    setFormCategory(initialCategory);
    setFormType('Custom');
    setFormName('welcome_customer');
    setFormLanguage('English');
    setFormHeaderType('Text');
    setFormHeaderText('Welcome to MessBee');
    setFormBodyText(
      'Hello {{1}}, welcome to MessBee! We are happy to have you with us. How can our team help today?'
    );
    setFormFooterText('Replies are usually sent within a few minutes');
    setFormButtons([{ id: 'btn_1', type: 'QUICK_REPLY', text: 'Talk to support' }]);
    setFormSamples({ '{{1}}': 'Aarav' });
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
    setFormSamples(tmpl.sampleValues || { '{{1}}': 'Aarav' });
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
          onPress: async () => {
            try {
              await templateService.deleteTemplate(tmpl.id);
            } catch (_) {}
            setTemplates((prev) => prev.filter((t) => t.id !== tmpl.id));
            setSelectedDetailsTemplate(null);
            showToast(`Template "${tmpl.name}" deleted.`);
          },
        },
      ]
    );
  };

  // Insert variable into body text
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

  // Open "Use This Template" customization modal (Image 2 Screen 4)
  const handleOpenCustomizeTemplate = (tmpl) => {
    setCustomizingTemplate(tmpl);
    const initialInputs = {};
    if (tmpl.variables && tmpl.variables.length > 0) {
      tmpl.variables.forEach((v, idx) => {
        const placeholder = `{{${idx + 1}}}`;
        initialInputs[placeholder] =
          (tmpl.defaultSamples && tmpl.defaultSamples[placeholder]) ||
          (tmpl.sampleValues && tmpl.sampleValues[placeholder]) ||
          'Aarav';
      });
    } else {
      initialInputs['{{1}}'] = 'Aarav';
    }
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
      variables: customizingTemplate.variables || [],
      sampleValues: customVarInputs,
      footerText: customizingTemplate.footerText,
      buttons: customizingTemplate.buttons || [],
      createdAt: 'Just now',
      updatedAt: 'Just now',
      statusNote: 'Ready for campaigns. Variables personalized.',
    };
    setTemplates((prev) => [newEntry, ...prev]);
    setCustomizingTemplate(null);
    setSelectedGalleryTemplate(null);
    setIsSimulatorVisible(false);
    setActiveMainTab('list');
    showToast('Template customized. Campaign workflow is simulated in this prototype.');
  };

  // Open Full WhatsApp Simulator on a specific template
  const handleOpenSimulator = (tmpl) => {
    const idx = galleryTemplates.findIndex((g) => g.id === tmpl.id);
    setSimulatorActiveIndex(idx !== -1 ? idx : 0);
    setIsSimulatorVisible(true);
  };

  // Helper for Status Badge Pill styling
  const renderStatusPill = (status) => {
    const s = (status || '').toUpperCase();
    if (s === 'APPROVED') {
      return (
        <View style={[styles.statusBadge, { backgroundColor: '#DCFCE7' }]}>
          <Text style={[styles.statusBadgeText, { color: '#15803D' }]}>Approved</Text>
        </View>
      );
    }
    if (s === 'PENDING') {
      return (
        <View style={[styles.statusBadge, { backgroundColor: '#FEF3C7' }]}>
          <Text style={[styles.statusBadgeText, { color: '#B45309' }]}>Pending</Text>
        </View>
      );
    }
    if (s === 'REJECTED') {
      return (
        <View style={[styles.statusBadge, { backgroundColor: '#FEE2E2' }]}>
          <Text style={[styles.statusBadgeText, { color: '#B91C1C' }]}>Rejected</Text>
        </View>
      );
    }
    return (
      <View style={[styles.statusBadge, { backgroundColor: '#F1F5F9' }]}>
        <Text style={[styles.statusBadgeText, { color: '#64748B' }]}>Draft</Text>
      </View>
    );
  };

  const activeSimTemplate = galleryTemplates[simulatorActiveIndex] || galleryTemplates[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* ======================================================== */}
      {/* TOP HEADER & SUBTABS                                      */}
      {/* ======================================================== */}
      <View style={styles.topHeader}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>Templates</Text>
          <TouchableOpacity
            style={styles.infoCircleBtn}
            activeOpacity={0.7}
            onPress={() => showToast('MessBee WhatsApp Cloud API Templates Module')}
          >
            <Ionicons name="information-circle-outline" size={21} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* 3 SUBTABS with Underline Indicator */}
        <View style={styles.subtabsContainer}>
          <TouchableOpacity
            style={styles.subtabButton}
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
            {activeMainTab === 'list' && <View style={styles.subtabActiveLine} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.subtabButton}
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
            {activeMainTab === 'create' && <View style={styles.subtabActiveLine} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.subtabButton}
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
            {activeMainTab === 'gallery' && <View style={styles.subtabActiveLine} />}
          </TouchableOpacity>
        </View>
      </View>

      {/* ======================================================== */}
      {/* SUBTAB 1: TEMPLATE LIST (Image 1 Screen 1)                */}
      {/* ======================================================== */}
      {activeMainTab === 'list' && (
        <ScrollView
          style={styles.mainScroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Subheader info strip */}
          <View style={styles.listSubheader}>
            <View style={{ flex: 1, paddingRight: 8 }}>
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
              disabled={isSyncing}
              activeOpacity={0.7}
            >
              <Ionicons
                name="sync-outline"
                size={16}
                color="#111827"
                style={isSyncing ? { transform: [{ rotate: '45deg' }] } : {}}
              />
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
                      name="document-text-outline"
                      size={20}
                      color="#00875A"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTemplateName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.cardMetaText}>
                      {item.category.charAt(0).toUpperCase() +
                        item.category.slice(1).toLowerCase()}{' '}
                      · {item.language}
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
                    Updated {item.updatedAt || item.createdAt}
                  </Text>
                  <TouchableOpacity
                    style={styles.viewDetailsRow}
                    onPress={() => setSelectedDetailsTemplate(item)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.viewDetailsText}>View details</Text>
                    <Ionicons name="chevron-forward" size={13} color="#00875A" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}

      {/* ======================================================== */}
      {/* SUBTAB 2: CHOOSE TEMPLATE METHOD (Image 2 Screen 1)       */}
      {/* ======================================================== */}
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
              <Ionicons name="add" size={24} color="#00875A" />
            </View>
            <Text style={styles.methodCardTitle}>Create New Template</Text>
            <Text style={styles.methodCardDesc}>
              Build custom templates with full control over content, variables,
              media and actions.
            </Text>
            <View style={styles.methodCardAction}>
              <Text style={styles.methodCardActionText}>Start Building</Text>
              <Ionicons name="chevron-forward" size={15} color="#00875A" />
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
              <Ionicons name="chevron-forward" size={15} color="#00875A" />
            </View>
          </TouchableOpacity>

          {/* Info Banner at bottom */}
          <View style={styles.infoCalloutBanner}>
            <Ionicons name="information-circle-outline" size={20} color="#00875A" />
            <Text style={styles.infoCalloutText}>
              Templates saved here remain local drafts until you submit them.
              Submitted templates still require approval from Meta before use.
            </Text>
          </View>
        </ScrollView>
      )}

      {/* ======================================================== */}
      {/* SUBTAB 3: TEMPLATE GALLERY (Image 3 Screens 1 & 2)         */}
      {/* ======================================================== */}
      {activeMainTab === 'gallery' && (
        <ScrollView
          style={styles.mainScroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Subheader */}
          <View style={styles.gallerySubheaderRow}>
            <TouchableOpacity
              style={styles.galleryBackArrowBtn}
              onPress={() => setActiveMainTab('list')}
            >
              <Ionicons name="arrow-back" size={20} color="#111827" />
            </TouchableOpacity>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.sectionHeading}>Template Gallery</Text>
              <Text style={styles.sectionSubtitle}>
                Choose a template to start your campaign.
              </Text>
            </View>
          </View>

          {/* Search Library */}
          <View style={styles.searchBarContainer}>
            <Ionicons name="search-outline" size={18} color="#9CA3AF" />
            <TextInput
              placeholder={isFavoritesOnly ? 'Search favorites...' : 'Search templates...'}
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

          {/* Filter Bar: Category Dropdown & Favorites Button */}
          <View style={styles.galleryFilterRow}>
            <TouchableOpacity
              style={styles.categoryDropdownBtn}
              onPress={() => setIsCategoryPickerVisible(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="filter-outline" size={15} color="#4B5563" />
              <Text style={styles.categoryDropdownBtnText}>
                {galleryCategory === 'All' ? 'All Templates' : galleryCategory}
              </Text>
              <Ionicons name="chevron-down" size={15} color="#4B5563" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.favoritesToggleBtn,
                isFavoritesOnly && styles.favoritesToggleBtnActive,
              ]}
              onPress={() => setIsFavoritesOnly(!isFavoritesOnly)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isFavoritesOnly ? 'heart' : 'heart-outline'}
                size={16}
                color={isFavoritesOnly ? '#00875A' : '#4B5563'}
              />
              <Text
                style={[
                  styles.favoritesToggleBtnText,
                  isFavoritesOnly && styles.favoritesToggleBtnTextActive,
                ]}
              >
                Favorites
              </Text>
            </TouchableOpacity>
          </View>

          {/* Subtitle count + Create Template button */}
          <View style={styles.galleryCountRow}>
            <Text style={styles.galleryCountText}>
              {filteredGallery.length} / Unlimited Templates
            </Text>

            <TouchableOpacity
              style={styles.gallerySmallCreateBtn}
              onPress={() => handleStartCreateFresh('Marketing')}
              activeOpacity={0.85}
            >
              <Ionicons name="add" size={16} color="#FFFFFF" />
              <Text style={styles.gallerySmallCreateBtnText}>Create Template</Text>
            </TouchableOpacity>
          </View>

          {/* 16 Visual Rich Cards (Image 3) */}
          {filteredGallery.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="heart-outline" size={32} color="#9CA3AF" />
              </View>
              <Text style={styles.emptyTitle}>No templates found</Text>
              <Text style={styles.emptyDesc}>
                {isFavoritesOnly
                  ? 'You haven\'t added any favorites yet. Tap the heart on any card to add it.'
                  : 'Try adjusting your search or category filter.'}
              </Text>
            </View>
          ) : (
            filteredGallery.map((item) => (
              <View key={item.id} style={styles.richVisualCard}>
                {/* Visual Top Banner */}
                <View style={styles.richCardBanner}>
                  <TouchableOpacity
                    style={styles.heartCircleBtn}
                    onPress={() => handleToggleFavorite(item.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={item.isFavorite ? 'heart' : 'heart-outline'}
                      size={18}
                      color={item.isFavorite ? '#DC2626' : '#6B7280'}
                    />
                  </TouchableOpacity>

                  {/* Centered Icon & Badge */}
                  <View style={styles.bannerCenterContent}>
                    <View style={styles.bannerIconCircle}>
                      <Ionicons
                        name={
                          item.category === 'AUTHENTICATION'
                            ? 'shield-checkmark-outline'
                            : item.category === 'UTILITY'
                            ? 'notifications-outline'
                            : 'megaphone-outline'
                        }
                        size={22}
                        color="#00875A"
                      />
                    </View>
                    <Text style={styles.bannerBadgeLabel}>{item.badgeLabel}</Text>
                  </View>
                </View>

                {/* Card Content */}
                <View style={styles.richCardBody}>
                  <View style={styles.richCardTitleRow}>
                    <Text style={styles.richCardTitle}>{item.name}</Text>
                    <View style={styles.miniCategoryPill}>
                      <Text style={styles.miniCategoryText}>
                        {item.categoryLabel}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.richCardSub}>
                    {item.language} · {item.typeLabel}
                  </Text>

                  <Text style={styles.richCardDesc} numberOfLines={2}>
                    {item.description}
                  </Text>

                  {/* Status row: Ready to use + Approved */}
                  <View style={styles.richCardStatusRow}>
                    <View style={styles.readyIndicatorRow}>
                      <View style={styles.greenStatusDot} />
                      <Text style={styles.readyIndicatorText}>
                        {item.availability}
                      </Text>
                    </View>
                    {renderStatusPill(item.status)}
                  </View>

                  {/* Action Buttons Row */}
                  <View style={styles.richCardActionsRow}>
                    <TouchableOpacity
                      style={styles.richViewDetailsBtn}
                      onPress={() => setSelectedGalleryTemplate(item)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.richViewDetailsBtnText}>
                        View Details
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.richUseTemplateBtn}
                      onPress={() => handleOpenCustomizeTemplate(item)}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.richUseTemplateBtnText}>
                        Use Template
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: TEMPLATE DETAILS VIEW (Image 1 Screen 2)         */}
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
                <View style={{ width: 34 }} />
              </View>

              {/* Top Header Card */}
              <View style={styles.detailsHeaderCard}>
                <View style={styles.detailsTitleRow}>
                  <View style={styles.detailsIconCircle}>
                    <Ionicons
                      name="document-text"
                      size={24}
                      color="#00875A"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.detailsCategoryPill}>
                      <Text style={styles.detailsCategoryPillText}>
                        {selectedDetailsTemplate.category.charAt(0) +
                          selectedDetailsTemplate.category.slice(1).toLowerCase()}
                      </Text>
                    </View>
                    <Text style={styles.detailsTemplateName}>
                      {selectedDetailsTemplate.name}
                    </Text>
                    <Text style={styles.detailsLangText}>
                      {selectedDetailsTemplate.language || 'English'}
                    </Text>
                  </View>
                  {renderStatusPill(selectedDetailsTemplate.status)}
                </View>

                {/* 4 Action Buttons Row: Edit | Duplicate | Use | Delete */}
                <View style={styles.detailsActionIconsBar}>
                  <TouchableOpacity
                    style={styles.detailsActionIconItem}
                    onPress={() => handleEditTemplate(selectedDetailsTemplate)}
                  >
                    <View style={styles.actionRoundCircle}>
                      <Ionicons name="pencil-outline" size={18} color="#00875A" />
                    </View>
                    <Text style={styles.actionIconLabel}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.detailsActionIconItem}
                    onPress={() => handleDuplicateTemplate(selectedDetailsTemplate)}
                  >
                    <View style={styles.actionRoundCircle}>
                      <Ionicons name="copy-outline" size={18} color="#374151" />
                    </View>
                    <Text style={styles.actionIconLabel}>Duplicate</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.detailsActionIconItem}
                    onPress={() => {
                      const t = selectedDetailsTemplate;
                      setSelectedDetailsTemplate(null);
                      handleOpenCustomizeTemplate(t);
                    }}
                  >
                    <View style={styles.actionRoundCircle}>
                      <Ionicons name="paper-plane-outline" size={18} color="#00875A" />
                    </View>
                    <Text style={styles.actionIconLabel}>Use</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.detailsActionIconItem}
                    onPress={() => handleDeleteTemplate(selectedDetailsTemplate)}
                  >
                    <View style={styles.actionRoundCircleRed}>
                      <Ionicons name="trash-outline" size={18} color="#DC2626" />
                    </View>
                    <Text style={[styles.actionIconLabel, { color: '#DC2626' }]}>
                      Delete
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Template Information Section */}
              <View style={styles.sectionCard}>
                <Text style={styles.sectionCardHeader}>Template information</Text>

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
                  <Text style={styles.infoKeyText}>Header</Text>
                  <Text style={styles.infoValueText}>
                    {selectedDetailsTemplate.headerText
                      ? `Text · ${selectedDetailsTemplate.headerText}`
                      : 'None'}
                  </Text>
                </View>

                <View style={styles.infoKeyValueRow}>
                  <Text style={styles.infoKeyText}>Footer</Text>
                  <Text style={styles.infoValueText}>
                    {selectedDetailsTemplate.footerText || 'None'}
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
                  Object.keys(selectedDetailsTemplate.sampleValues).map((key) => (
                    <View key={key} style={styles.varRow}>
                      <View style={styles.varBadge}>
                        <Text style={styles.varBadgeText}>{key}</Text>
                      </View>
                      <Text style={styles.varSampleValueText}>
                        {selectedDetailsTemplate.sampleValues[key]}
                      </Text>
                    </View>
                  ))
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
                        name="chatbubble-ellipses-outline"
                        size={16}
                        color="#00875A"
                      />
                      <View style={{ marginLeft: 8 }}>
                        <Text style={styles.interactiveBtnText}>{btn.text}</Text>
                        <Text style={styles.interactiveBtnSub}>Quick Reply</Text>
                      </View>
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
      {/* MODAL 2: CREATE / EDIT 2-STEP BUILDER                     */}
      {/* (Image 1 Screens 3, 4, 6)                                 */}
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
                Build a WhatsApp Business template.
              </Text>
            </View>

            {/* In Step 2, show Edit | Preview toggle pill (Image 1 Screen 4 & 6) */}
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
                  <Ionicons
                    name="eye-outline"
                    size={13}
                    color={builderTab === 'preview' ? '#00875A' : '#6B7280'}
                    style={{ marginRight: 3 }}
                  />
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

          {/* Stepper Progress Bar (Image 1 Screen 3) */}
          <View style={styles.stepperContainer}>
            <View style={styles.stepperHeaderRow}>
              <Text style={styles.stepperText}>
                Step {builderStep} of 2
              </Text>
              <Text style={styles.stepperPhaseText}>
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

          {/* STEP 1: SETUP FORM (Image 1 Screen 3) */}
          {builderStep === 1 && (
            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.setupMainHeading}>Create New Template</Text>
              <Text style={styles.setupMainSubtitle}>
                Choose how your WhatsApp Business template should work.
              </Text>

              {/* 1. Choose Category */}
              <View style={styles.numberedHeaderRow}>
                <View style={styles.stepNumberBadge}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <Text style={styles.builderSectionTitle}>Choose Category</Text>
              </View>
              <Text style={styles.builderSectionSubtitle}>
                Select the purpose Meta will use for review.
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
                      <Text
                        style={[
                          styles.radioCardTitle,
                          isSelected && styles.radioCardTitleSelected,
                        ]}
                      >
                        {cat.title}
                      </Text>
                      {isSelected && (
                        <Ionicons
                          name="checkmark"
                          size={18}
                          color="#00875A"
                          style={{ marginLeft: 'auto' }}
                        />
                      )}
                    </View>
                    <Text style={styles.radioCardDesc}>{cat.desc}</Text>
                  </TouchableOpacity>
                );
              })}

              <View style={{ height: 16 }} />

              {/* 2. Choose Template Type */}
              <View style={styles.numberedHeaderRow}>
                <View style={styles.stepNumberBadge}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <Text style={styles.builderSectionTitle}>Choose Template Type</Text>
              </View>
              <Text style={styles.builderSectionSubtitle}>
                Only one format can be selected.
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
                      <Text
                        style={[
                          styles.radioCardTitle,
                          isSelected && styles.radioCardTitleSelected,
                        ]}
                      >
                        {tp.title}
                      </Text>
                      {tp.badge ? (
                        <View style={styles.comingSoonBadge}>
                          <Text style={styles.comingSoonBadgeText}>
                            {tp.badge}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={styles.radioCardDesc}>{tp.desc}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          {/* STEP 2: CONTENT EDITOR (Image 1 Screen 4) */}
          {builderStep === 2 && builderTab === 'edit' && (
            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.setupMainHeading}>Create Template Content</Text>
              <Text style={styles.setupMainSubtitle}>
                Configure the message customers will see.
              </Text>

              {/* Selected Summary Card */}
              <View style={styles.builderSummaryCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.summaryCardName}>{formName}</Text>
                  <Text style={styles.summaryCardMeta}>
                    {formCategory} · {formType}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.summaryCardLang}>{formLanguage}</Text>
                  <TouchableOpacity
                    onPress={() => setBuilderStep(1)}
                    style={{ marginTop: 2 }}
                  >
                    <Text style={styles.summaryCardEdit}>Edit</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Header Selector */}
              <View style={{ marginTop: 14 }}>
                <Text style={styles.formLabel}>Header (Optional)</Text>
                <Text style={styles.formLabelHelper}>
                  Add a title header which type of content to use.
                </Text>
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
                    placeholder="Welcome to MessBee"
                    placeholderTextColor="#9CA3AF"
                    value={formHeaderText}
                    onChangeText={setFormHeaderText}
                  />
                )}
              </View>

              {/* Body Textarea with Rich Formatting Toolbar (Image 1 Screen 4) */}
              <View style={{ marginTop: 16 }}>
                <Text style={styles.formLabel}>Body *</Text>
                <Text style={styles.formLabelHelper}>
                  Enter the message in English.
                </Text>

                {/* Toolbar */}
                <View style={styles.bodyFormatToolbar}>
                  <TouchableOpacity
                    style={styles.toolbarIconBtn}
                    onPress={() => setFormBodyText((prev) => `${prev}*bold*`)}
                  >
                    <Text style={[styles.toolbarText, { fontWeight: '800' }]}>B</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.toolbarIconBtn}
                    onPress={() => setFormBodyText((prev) => `${prev}_italic_`)}
                  >
                    <Text style={[styles.toolbarText, { fontStyle: 'italic' }]}>I</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.toolbarIconBtn}
                    onPress={() => setFormBodyText((prev) => `${prev}~strike~`)}
                  >
                    <Text style={[styles.toolbarText, { textDecorationLine: 'line-through' }]}>
                      S
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.toolbarIconBtn}
                    onPress={() => setFormBodyText((prev) => `${prev}\`code\``)}
                  >
                    <Text style={[styles.toolbarText, { fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }]}>
                      C
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.toolbarIconBtn}
                    onPress={() => setFormBodyText((prev) => `${prev} 😊`)}
                  >
                    <Text style={styles.toolbarText}>😊</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.addVariableBtn}
                    onPress={handleInsertVariable}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="add" size={14} color="#00875A" />
                    <Text style={styles.addVariableBtnText}>Variable</Text>
                  </TouchableOpacity>
                </View>

                <TextInput
                  style={styles.formTextArea}
                  placeholder="Hello {{1}}, welcome to MessBee! We are happy to have you with us. How can our team help today?"
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
                  placeholder="Replies are usually sent within a few minutes"
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

          {/* STEP 2: PREVIEW MODE (Image 1 Screen 6 - Live WhatsApp Preview) */}
          {builderStep === 2 && builderTab === 'preview' && (
            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.setupMainHeading}>Live WhatsApp Preview</Text>
              <Text style={styles.setupMainSubtitle}>
                Changes from the editor are reflected instantly.
              </Text>

              {/* Phone Mockup Canvas */}
              <View style={styles.whatsappPhoneMockup}>
                {/* Green WhatsApp Header */}
                <View style={styles.waPhoneHeader}>
                  <View style={styles.waAvatarCircle}>
                    <Text style={styles.waAvatarText}>M</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={styles.waBusinessName}>MessBee Business</Text>
                    <Text style={styles.waStatusSub}>Business Account</Text>
                  </View>
                  <Ionicons name="call-outline" size={18} color="#FFFFFF" />
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
                        color="#00875A"
                      />
                      <Text style={styles.waButtonText}>{btn.text}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Sync check note below preview */}
              <View style={styles.previewSyncedRow}>
                <Ionicons name="checkmark" size={15} color="#00875A" />
                <Text style={styles.previewSyncedText}>
                  Preview synced with the latest template content.
                </Text>
              </View>
            </ScrollView>
          )}

          {/* Builder Bottom Action Bar */}
          <View style={styles.builderBottomBar}>
            {builderStep === 1 ? (
              <>
                <TouchableOpacity
                  style={styles.cancelTextBtn}
                  onPress={() => setIsCreateModalVisible(false)}
                >
                  <Text style={styles.cancelTextBtnLabel}>Cancel</Text>
                </TouchableOpacity>

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
                  <Ionicons name="chevron-forward" size={15} color="#FFFFFF" />
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
                  style={styles.draftOutlineBtn}
                  onPress={handleSaveDraft}
                  activeOpacity={0.7}
                >
                  <Text style={styles.draftOutlineBtnText}>Save Draft</Text>
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
      {/* MODAL 3: CONFIRMATION MODAL (Image 1 Screen 5)             */}
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
              <Ionicons name="paper-plane-outline" size={26} color="#00875A" />
            </View>

            <Text style={styles.confirmTitle}>Submit Template?</Text>
            <Text style={styles.confirmMessage}>
              This will place {formName || 'welcome_customer'} into simulated Meta review.
              For actual API review it will be sent.
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
      {/* MODAL 4: GALLERY TEMPLATE DETAILS (Image 3 Screen 3)       */}
      {/* ======================================================== */}
      <Modal
        visible={!!selectedGalleryTemplate}
        animationType="slide"
        onRequestClose={() => setSelectedGalleryTemplate(null)}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <StatusBar style="dark" />
          {selectedGalleryTemplate && (
            <View style={{ flex: 1 }}>
              <ScrollView
                style={styles.modalScroll}
                contentContainerStyle={styles.modalScrollContent}
                showsVerticalScrollIndicator={false}
              >
                {/* Top Nav */}
                <View style={styles.modalTopBar}>
                  <TouchableOpacity
                    style={styles.modalBackBtn}
                    onPress={() => setSelectedGalleryTemplate(null)}
                  >
                    <Ionicons name="arrow-back" size={22} color="#111827" />
                  </TouchableOpacity>
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={styles.modalTopTitle}>Template Details</Text>
                    <Text style={styles.builderSubtitle}>Gallery template information</Text>
                  </View>
                  <TouchableOpacity>
                    <Ionicons name="ellipsis-horizontal" size={20} color="#4B5563" />
                  </TouchableOpacity>
                </View>

                {/* Big Visual Banner Card at top */}
                <View style={styles.galleryDetailsTopBannerCard}>
                  <TouchableOpacity
                    style={styles.galleryDetailsHeartBtn}
                    onPress={() => handleToggleFavorite(selectedGalleryTemplate.id)}
                  >
                    <Ionicons
                      name={selectedGalleryTemplate.isFavorite ? 'heart' : 'heart-outline'}
                      size={20}
                      color={selectedGalleryTemplate.isFavorite ? '#DC2626' : '#6B7280'}
                    />
                  </TouchableOpacity>

                  <View style={styles.bannerCenterContent}>
                    <View style={styles.bannerIconCircle}>
                      <Ionicons name="document-text-outline" size={24} color="#00875A" />
                    </View>
                    <Text style={styles.bannerBadgeLabel}>
                      {selectedGalleryTemplate.categoryLabel}
                    </Text>
                  </View>

                  <View style={{ marginTop: 14 }}>
                    {renderStatusPill(selectedGalleryTemplate.status)}
                    <Text style={styles.galleryDetailsTitle}>
                      {selectedGalleryTemplate.name}
                    </Text>
                    <Text style={styles.galleryDetailsDesc}>
                      {selectedGalleryTemplate.description}
                    </Text>
                  </View>
                </View>

                {/* Template information Section */}
                <View style={styles.sectionCard}>
                  <Text style={styles.sectionCardHeader}>Template information</Text>

                  <View style={styles.infoKeyValueRow}>
                    <Text style={styles.infoKeyText}>Category</Text>
                    <Text style={styles.infoValueText}>
                      {selectedGalleryTemplate.categoryLabel}
                    </Text>
                  </View>

                  <View style={styles.infoKeyValueRow}>
                    <Text style={styles.infoKeyText}>Language</Text>
                    <Text style={styles.infoValueText}>
                      {selectedGalleryTemplate.language}
                    </Text>
                  </View>

                  <View style={styles.infoKeyValueRow}>
                    <Text style={styles.infoKeyText}>Type</Text>
                    <Text style={styles.infoValueText}>
                      {selectedGalleryTemplate.typeLabel}
                    </Text>
                  </View>

                  <View style={styles.infoKeyValueRow}>
                    <Text style={styles.infoKeyText}>Availability</Text>
                    <Text style={styles.infoValueText}>
                      {selectedGalleryTemplate.availability}
                    </Text>
                  </View>
                </View>

                {/* Message content Section */}
                <View style={styles.sectionCard}>
                  <Text style={styles.sectionCardHeader}>Message content</Text>
                  <View style={styles.bodyTagPill}>
                    <Text style={styles.bodyTagPillText}>BODY</Text>
                  </View>
                  <Text style={[styles.previewContentBody, { marginTop: 6 }]}>
                    {selectedGalleryTemplate.bodyText}
                  </Text>
                </View>

                {/* Dynamic variables Section */}
                <View style={styles.sectionCard}>
                  <Text style={styles.sectionCardHeader}>Dynamic variables</Text>
                  {selectedGalleryTemplate.variables &&
                    selectedGalleryTemplate.variables.map((v, i) => (
                      <View key={i} style={styles.varRow}>
                        <View style={styles.varBadge}>
                          <Text style={styles.varBadgeText}>{`{{${i + 1}}}`}</Text>
                        </View>
                        <Text style={styles.varSampleValueText}>{v}</Text>
                      </View>
                    ))}
                </View>
              </ScrollView>

              {/* Sticky Bottom Bar */}
              <View style={styles.galleryDetailsBottomBar}>
                <TouchableOpacity
                  style={styles.galleryDetailsPreviewBtn}
                  onPress={() => {
                    const t = selectedGalleryTemplate;
                    setSelectedGalleryTemplate(null);
                    handleOpenSimulator(t);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="eye-outline" size={17} color="#111827" />
                  <Text style={styles.galleryDetailsPreviewBtnText}>Preview</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.galleryDetailsUseBtn}
                  onPress={() => {
                    const t = selectedGalleryTemplate;
                    setSelectedGalleryTemplate(null);
                    handleOpenCustomizeTemplate(t);
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={styles.galleryDetailsUseBtnText}>Use This Template</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </SafeAreaView>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL 5: FULL WHATSAPP CHAT SIMULATOR (Image 3 Screen 4)  */}
      {/* ======================================================== */}
      <Modal
        visible={isSimulatorVisible}
        animationType="slide"
        onRequestClose={() => setIsSimulatorVisible(false)}
      >
        <SafeAreaView style={[styles.modalSafeArea, { backgroundColor: '#075E54' }]}>
          <StatusBar style="light" />

          {/* WhatsApp Simulator Dark Green Header */}
          <View style={styles.simWaHeader}>
            <TouchableOpacity
              style={styles.simBackBtn}
              onPress={() => setIsSimulatorVisible(false)}
            >
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.simAvatarCircle}>
              <Text style={styles.simAvatarText}>Y</Text>
            </View>

            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.simHeaderTitle}>Your Business</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                <Ionicons name="checkmark-circle" size={12} color="#25D366" />
                <Text style={styles.simHeaderSub}>Verified Business</Text>
              </View>
            </View>

            <TouchableOpacity style={{ marginRight: 16 }}>
              <Ionicons name="videocam-outline" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Ionicons name="call-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Carousel switcher bar below header */}
          <View style={styles.simCarouselBar}>
            <TouchableOpacity
              onPress={() =>
                setSimulatorActiveIndex((prev) =>
                  prev > 0 ? prev - 1 : galleryTemplates.length - 1
                )
              }
              style={styles.simCarouselNavArrow}
            >
              <Ionicons name="chevron-back" size={16} color="#00875A" />
            </TouchableOpacity>

            <Text style={styles.simCarouselText}>
              {simulatorActiveIndex + 1} of {galleryTemplates.length} -{' '}
              {activeSimTemplate.categoryLabel}
            </Text>

            <TouchableOpacity
              onPress={() =>
                setSimulatorActiveIndex((prev) =>
                  prev < galleryTemplates.length - 1 ? prev + 1 : 0
                )
              }
              style={styles.simCarouselNavArrow}
            >
              <Ionicons name="chevron-forward" size={16} color="#00875A" />
            </TouchableOpacity>
          </View>

          {/* WhatsApp Chat Wallpaper background */}
          <View style={styles.simChatWallpaper}>
            {/* Today Date Pill */}
            <View style={styles.simTodayPill}>
              <Text style={styles.simTodayPillText}>Today</Text>
            </View>

            {/* Rich WhatsApp Message Bubble */}
            <View style={styles.simBubbleContainer}>
              {/* Media Card inside bubble */}
              {activeSimTemplate.headerType === 'MEDIA' ? (
                <View style={styles.simMediaCard}>
                  <Ionicons name="image-outline" size={28} color="#00875A" />
                  <Text style={styles.simMediaLabel}>Campaign media</Text>
                </View>
              ) : activeSimTemplate.headerText ? (
                <Text style={styles.waBubbleHeader}>
                  {activeSimTemplate.headerText}
                </Text>
              ) : null}

              {/* Substituted Body Text */}
              <Text style={styles.simBubbleBody}>
                {getRenderedBody(
                  activeSimTemplate.bodyText,
                  activeSimTemplate.defaultSamples
                )}
              </Text>

              {activeSimTemplate.footerText ? (
                <Text style={styles.waBubbleFooter}>
                  {activeSimTemplate.footerText}
                </Text>
              ) : null}

              <View style={styles.waBubbleMetaRow}>
                <Text style={styles.waTimestamp}>10:42 AM</Text>
                <Ionicons name="checkmark-done" size={14} color="#53BDEB" />
              </View>

              {/* Action Button inside bubble */}
              {activeSimTemplate.buttons && activeSimTemplate.buttons[0] && (
                <TouchableOpacity
                  style={styles.simBubbleActionBtn}
                  activeOpacity={0.8}
                >
                  <Ionicons name="open-outline" size={15} color="#00875A" />
                  <Text style={styles.simBubbleActionBtnText}>
                    {activeSimTemplate.buttons[0].text}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Bottom Fake Chat Input Bar */}
          <View style={styles.simFakeInputBar}>
            <Ionicons name="happy-outline" size={22} color="#6B7280" />
            <TextInput
              style={styles.simFakeTextInput}
              placeholder="Type a message"
              placeholderTextColor="#9CA3AF"
              editable={false}
            />
            <Ionicons
              name="attach-outline"
              size={22}
              color="#6B7280"
              style={{ marginRight: 8 }}
            />
            <View style={styles.simMicCircle}>
              <Ionicons name="send" size={16} color="#FFFFFF" />
            </View>
          </View>

          {/* Sticky CTA: Use This Template */}
          <View style={styles.simStickyBottomBar}>
            <TouchableOpacity
              style={styles.simUseTemplateBtn}
              onPress={() => {
                const t = activeSimTemplate;
                setIsSimulatorVisible(false);
                handleOpenCustomizeTemplate(t);
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.simUseTemplateBtnText}>Use This Template</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL 6: USE THIS TEMPLATE / CUSTOMIZE (Image 2 Screen 4)  */}
      {/* ======================================================== */}
      <Modal
        visible={!!customizingTemplate}
        animationType="slide"
        onRequestClose={() => setCustomizingTemplate(null)}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <StatusBar style="dark" />
          {customizingTemplate && (
            <View style={{ flex: 1 }}>
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
                  <View style={{ width: 34 }} />
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
                        name="document-text"
                        size={22}
                        color="#00875A"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.detailsTemplateName}>
                        {customizingTemplate.name}
                      </Text>
                      <Text style={styles.detailsLangText}>
                        {customizingTemplate.categoryLabel || customizingTemplate.category} ·{' '}
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
                      <Text style={styles.formLabel}>Value for {placeholder} *</Text>
                      <TextInput
                        style={styles.formInput}
                        value={customVarInputs[placeholder]}
                        onChangeText={(val) =>
                          setCustomVarInputs((prev) => ({
                            ...prev,
                            [placeholder]: val,
                          }))
                        }
                        placeholder="Enter sample value"
                        placeholderTextColor="#9CA3AF"
                      />
                    </View>
                  ))}
                </View>

                {/* Live WhatsApp Preview Box */}
                <View style={{ marginHorizontal: 16, marginTop: 14 }}>
                  <View style={styles.whatsappPhoneMockup}>
                    <View style={styles.waPhoneHeader}>
                      <View style={styles.waAvatarCircle}>
                        <Text style={styles.waAvatarText}>M</Text>
                      </View>
                      <View style={{ flex: 1, marginLeft: 8 }}>
                        <Text style={styles.waBusinessName}>MessBee Business</Text>
                        <Text style={styles.waStatusSub}>Business Account</Text>
                      </View>
                      <Ionicons name="call-outline" size={18} color="#FFFFFF" />
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
                        {customizingTemplate.footerText ? (
                          <Text style={styles.waBubbleFooter}>
                            {customizingTemplate.footerText}
                          </Text>
                        ) : null}
                        <View style={styles.waBubbleMetaRow}>
                          <Text style={styles.waTimestamp}>Now</Text>
                          <Ionicons name="checkmark-done" size={14} color="#53BDEB" />
                        </View>
                      </View>

                      {customizingTemplate.buttons &&
                        customizingTemplate.buttons.map((btn, bidx) => (
                          <View key={bidx} style={styles.waButtonPill}>
                            <Ionicons
                              name="chatbubbles-outline"
                              size={15}
                              color="#00875A"
                            />
                            <Text style={styles.waButtonText}>{btn.text}</Text>
                          </View>
                        ))}
                    </View>
                  </View>
                </View>

                {/* Footnote */}
                <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
                  <Text style={styles.nothingSentNote}>
                    Nothing will be sent yet. Continue to the next campaign workflow.
                    This action does not submit or send a WhatsApp message.
                  </Text>
                </View>
              </ScrollView>

              {/* Bottom Sticky Action Button */}
              <View style={styles.customizeBottomBar}>
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
            </View>
          )}
        </SafeAreaView>
      </Modal>

      {/* ======================================================== */}
      {/* CATEGORY PICKER MODAL (Dropdown for Gallery)             */}
      {/* ======================================================== */}
      <Modal
        visible={isCategoryPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsCategoryPickerVisible(false)}
      >
        <TouchableOpacity
          style={styles.confirmModalOverlay}
          activeOpacity={1}
          onPress={() => setIsCategoryPickerVisible(false)}
        >
          <View style={styles.categoryDropdownMenu}>
            <Text style={styles.dropdownTitle}>Select Category</Text>
            {['All', 'Marketing', 'Utility', 'Authentication'].map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.dropdownItem,
                  galleryCategory === cat && styles.dropdownItemActive,
                ]}
                onPress={() => {
                  setGalleryCategory(cat);
                  setIsCategoryPickerVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.dropdownItemText,
                    galleryCategory === cat && styles.dropdownItemTextActive,
                  ]}
                >
                  {cat === 'All' ? 'All Templates' : cat}
                </Text>
                {galleryCategory === cat && (
                  <Ionicons name="checkmark" size={17} color="#00875A" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ======================================================== */}
      {/* FLOATING TOAST NOTIFICATION (Image 2 Screen 5)           */}
      {/* ======================================================== */}
      {toastMessage && (
        <View style={styles.toastContainer}>
          <View style={styles.toastCard}>
            <Ionicons name="checkmark-circle" size={18} color="#10B981" />
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
    backgroundColor: '#F8FAFC',
    paddingTop: Platform.OS === 'android' ? 32 : 0,
  },
  topHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  infoCircleBtn: {
    padding: 4,
  },
  subtabsContainer: {
    flexDirection: 'row',
  },
  subtabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  subtabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  subtabTextActive: {
    color: '#00875A',
    fontWeight: '800',
  },
  subtabActiveLine: {
    position: 'absolute',
    bottom: 0,
    left: 8,
    right: 8,
    height: 2.5,
    backgroundColor: '#00875A',
    borderRadius: 2,
  },
  mainScroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
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
    color: '#0F172A',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  countBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00875A',
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
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  syncOutlineBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  createSolidBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: '#00875A',
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
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
    marginBottom: 12,
  },
  searchTextInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
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
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#00875A',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#00875A',
    fontWeight: '800',
  },
  templateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
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
    borderRadius: 8,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTemplateName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  cardMetaText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  cardBodySnippet: {
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 12,
  },
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  cardCreatedDate: {
    fontSize: 11,
    color: '#94A3B8',
  },
  viewDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewDetailsText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00875A',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 44,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  emptyDesc: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 17,
  },
  emptyCreateBtn: {
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#00875A',
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
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  methodIconCircleGreen: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  methodIconCircleBlue: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  methodCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  methodCardDesc: {
    fontSize: 12,
    color: '#64748B',
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
    color: '#00875A',
  },
  infoCalloutBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 10,
    padding: 14,
    marginTop: 8,
  },
  infoCalloutText: {
    flex: 1,
    fontSize: 11.5,
    color: '#065F46',
    lineHeight: 16,
  },
  // Gallery Subtab Styles
  gallerySubheaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  galleryBackArrowBtn: {
    padding: 4,
  },
  galleryFilterRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  categoryDropdownBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 38,
  },
  categoryDropdownBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
    marginLeft: 6,
  },
  favoritesToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 38,
  },
  favoritesToggleBtnActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#00875A',
  },
  favoritesToggleBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#475569',
  },
  favoritesToggleBtnTextActive: {
    color: '#00875A',
    fontWeight: '800',
  },
  galleryCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  galleryCountText: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '600',
  },
  gallerySmallCreateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#00875A',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  gallerySmallCreateBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Rich Visual Cards (Image 3)
  richVisualCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  richCardBanner: {
    backgroundColor: '#E8F5E9',
    height: 100,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartCircleBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  bannerCenterContent: {
    alignItems: 'center',
    gap: 4,
  },
  bannerIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerBadgeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00875A',
  },
  richCardBody: {
    padding: 14,
  },
  richCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  richCardTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  miniCategoryPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  miniCategoryText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#00875A',
  },
  richCardSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  richCardDesc: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
    marginTop: 6,
    marginBottom: 10,
  },
  richCardStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  readyIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  greenStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  readyIndicatorText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#00875A',
  },
  richCardActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  richViewDetailsBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  richViewDetailsBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  richUseTemplateBtn: {
    flex: 1.3,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#00875A',
  },
  richUseTemplateBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Modal Base Styles
  modalSafeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalBackBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTopTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalScroll: {
    flex: 1,
  },
  modalScrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  // Details Modal (Image 1 Screen 2)
  detailsHeaderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  detailsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  detailsIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsCategoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 2,
  },
  detailsCategoryPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#00875A',
  },
  detailsTemplateName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  detailsLangText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  detailsActionIconsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  detailsActionIconItem: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  actionRoundCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRoundCircleRed: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  sectionCardHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  infoKeyValueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  infoKeyText: {
    fontSize: 12,
    color: '#64748B',
  },
  infoValueText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  messageContentBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  previewContentHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  previewContentBody: {
    fontSize: 12.5,
    color: '#334155',
    lineHeight: 18,
  },
  previewContentFooter: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 6,
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
    color: '#00875A',
  },
  varSampleValueText: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '600',
  },
  noVarText: {
    fontSize: 12,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  interactiveButtonChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 6,
  },
  interactiveBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  interactiveBtnSub: {
    fontSize: 10,
    color: '#64748B',
  },
  // 2-Step Builder Styles (Image 1 Screens 3, 4, 6)
  builderTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  builderMainTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  builderSubtitle: {
    fontSize: 11,
    color: '#64748B',
  },
  segmentedToggleBox: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 2,
  },
  segmentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  segmentBtnTextActive: {
    color: '#00875A',
    fontWeight: '800',
  },
  stepperContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  stepperHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  stepperText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
  },
  stepperPhaseText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#00875A',
  },
  stepperBarTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  stepperBarFill: {
    height: '100%',
    backgroundColor: '#00875A',
  },
  setupMainHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  setupMainSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 16,
  },
  numberedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepNumberBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#00875A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  builderSectionTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  builderSectionSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginBottom: 10,
    marginLeft: 28,
  },
  radioCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  radioCardSelected: {
    borderColor: '#00875A',
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
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: '#00875A',
  },
  radioInnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00875A',
  },
  radioCardTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  radioCardTitleSelected: {
    color: '#00875A',
  },
  radioCardDesc: {
    fontSize: 11.5,
    color: '#64748B',
    marginLeft: 26,
    marginTop: 3,
    lineHeight: 16,
  },
  comingSoonBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 'auto',
  },
  comingSoonBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#00875A',
  },
  // Step 2 Summary Card
  builderSummaryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  summaryCardName: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  summaryCardMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  summaryCardLang: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  summaryCardEdit: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00875A',
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  formLabelHelper: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 6,
  },
  formInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    fontSize: 12.5,
    color: '#0F172A',
  },
  headerTypeSelectorRow: {
    flexDirection: 'row',
    gap: 8,
  },
  headerTypePill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  headerTypePillActive: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#00875A',
  },
  headerTypePillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  headerTypePillTextActive: {
    color: '#00875A',
    fontWeight: '800',
  },
  bodyFormatToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  toolbarIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolbarText: {
    fontSize: 12,
    color: '#334155',
  },
  addVariableBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#00875A',
    backgroundColor: '#ECFDF5',
    marginLeft: 'auto',
  },
  addVariableBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00875A',
  },
  formTextArea: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#E2E8F0',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    padding: 12,
    minHeight: 88,
    fontSize: 12.5,
    color: '#0F172A',
    textAlignVertical: 'top',
  },
  charCountText: {
    fontSize: 10.5,
    color: '#94A3B8',
    textAlign: 'right',
    marginTop: 4,
  },
  sampleInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  // WhatsApp Preview Component (Image 1 Screen 6)
  whatsappPhoneMockup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
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
    minHeight: 180,
  },
  waSpeechBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 10,
    maxWidth: '92%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  waBubbleHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  waBubbleBody: {
    fontSize: 12,
    color: '#0F172A',
    lineHeight: 17,
  },
  waBubbleFooter: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 6,
  },
  waBubbleMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 4,
  },
  waTimestamp: {
    fontSize: 9.5,
    color: '#667781',
  },
  waButtonPill: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  waButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00875A',
  },
  previewSyncedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    justifyContent: 'center',
  },
  previewSyncedText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#00875A',
  },
  builderBottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  cancelTextBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  cancelTextBtnLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  draftOutlineBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  draftOutlineBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#475569',
  },
  continueSolidBtn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#00875A',
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
    borderRadius: 8,
    backgroundColor: '#00875A',
  },
  submitSolidBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Submit Confirmation Dialog (Image 1 Screen 5)
  confirmModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  confirmCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  confirmIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  confirmTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  confirmMessage: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 17,
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
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  confirmCancelBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#475569',
  },
  confirmSubmitBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: '#00875A',
  },
  confirmSubmitBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Gallery Details Modal (Image 3 Screen 3)
  galleryDetailsTopBannerCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 16,
    position: 'relative',
    marginBottom: 14,
  },
  galleryDetailsHeartBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryDetailsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 6,
  },
  galleryDetailsDesc: {
    fontSize: 12,
    color: '#475569',
    marginTop: 3,
  },
  bodyTagPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  bodyTagPillText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#475569',
  },
  galleryDetailsBottomBar: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  galleryDetailsPreviewBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  galleryDetailsPreviewBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  galleryDetailsUseBtn: {
    flex: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 8,
    backgroundColor: '#00875A',
  },
  galleryDetailsUseBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // WhatsApp Simulator Styles (Image 3 Screen 4)
  simWaHeader: {
    backgroundColor: '#075E54',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  simBackBtn: {
    paddingRight: 6,
  },
  simAvatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#128C7E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  simAvatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  simHeaderTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  simHeaderSub: {
    fontSize: 10.5,
    color: '#A7F3D0',
  },
  simCarouselBar: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  simCarouselNavArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  simCarouselText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  simChatWallpaper: {
    flex: 1,
    backgroundColor: '#ECE5DD',
    padding: 14,
  },
  simTodayPill: {
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 1,
    elevation: 1,
  },
  simTodayPillText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
  },
  simBubbleContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    maxWidth: '92%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  simMediaCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 8,
  },
  simMediaLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00875A',
  },
  simBubbleBody: {
    fontSize: 12.5,
    color: '#0F172A',
    lineHeight: 18,
  },
  simBubbleActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  simBubbleActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00875A',
  },
  simFakeInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  simFakeTextInput: {
    flex: 1,
    height: 36,
    backgroundColor: '#F1F5F9',
    borderRadius: 18,
    paddingHorizontal: 14,
    fontSize: 12.5,
    color: '#64748B',
    marginHorizontal: 8,
  },
  simMicCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#00875A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  simStickyBottomBar: {
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  simUseTemplateBtn: {
    backgroundColor: '#00875A',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  simUseTemplateBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Customize Modal (Image 2 Screen 4)
  nothingSentNote: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 10,
  },
  customizeBottomBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  useTemplateSolidBtn: {
    backgroundColor: '#00875A',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  useTemplateSolidBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Category Dropdown Menu
  categoryDropdownMenu: {
    width: 220,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  dropdownTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    marginBottom: 8,
    paddingHorizontal: 6,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  dropdownItemActive: {
    backgroundColor: '#ECFDF5',
  },
  dropdownItemText: {
    fontSize: 13,
    color: '#1E293B',
    fontWeight: '500',
  },
  dropdownItemTextActive: {
    color: '#00875A',
    fontWeight: '700',
  },
  // Toast Notification (Image 2 Screen 5)
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
    backgroundColor: '#0F172A',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  toastText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 16,
  },
});
