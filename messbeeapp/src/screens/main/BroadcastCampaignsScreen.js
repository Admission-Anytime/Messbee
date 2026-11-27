import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import {
  campaignService,
  contactService,
  labelService,
  statusService,
  templateService,
  authService,
  qrWhatsappService,
} from '../../services/api';
import QuickBottomBar from '../../components/QuickBottomBar';

export default function BroadcastCampaignsScreen({ navigation }) {
  // Campaigns list state
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'PROCESSING' | 'SCHEDULED' | 'COMPLETED'
  const [showFilterModal, setShowFilterModal] = useState(false);

  // User & Contacts state
  const [userProfile, setUserProfile] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [contactsCount, setContactsCount] = useState(0);
  const [labels, setLabels] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [templates, setTemplates] = useState([]);

  // Quick Broadcast Modal State (for Free QR direct broadcast)
  const [showQuickBroadcastModal, setShowQuickBroadcastModal] = useState(false);
  const [quickBroadcastMsg, setQuickBroadcastMsg] = useState('');
  const [sendingQuickBroadcast, setSendingQuickBroadcast] = useState(false);

  // Create Campaign Wizard State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Audience, 2: Template, 3: Review

  // Form Fields
  const [campaignName, setCampaignName] = useState('');
  const [campaignDesc, setCampaignDesc] = useState('');
  const [audienceType, setAudienceType] = useState('ALL'); // 'ALL' | 'LABELS' | 'STATUS' | 'CSV'
  const [selectedLabels, setSelectedLabels] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customMessage, setCustomMessage] = useState('');
  const [scheduleMode, setScheduleMode] = useState('NOW'); // 'NOW' | 'SCHEDULE'
  const [scheduleDate, setScheduleDate] = useState('');
  const [delayOption, setDelayOption] = useState('10s');
  const [creating, setCreating] = useState(false);

  // Card Options Modal
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showOptionsModal, setShowOptionsModal] = useState(false);

  // Load Data dynamically from backend APIs
  const loadData = useCallback(async () => {
    try {
      const [
        campaignsData,
        contactsData,
        labelsData,
        statusesData,
        templatesData,
        currentUser,
      ] = await Promise.all([
        campaignService.getCampaigns().catch(() => []),
        contactService.getContacts().catch(() => []),
        labelService.getLabels().catch(() => []),
        statusService.getStatuses().catch(() => []),
        templateService.getTemplates().catch(() => []),
        authService.getCurrentUser().catch(() => null),
      ]);

      const campaignList = Array.isArray(campaignsData)
        ? campaignsData
        : Array.isArray(campaignsData?.data)
        ? campaignsData.data
        : [];

      const safeContacts = Array.isArray(contactsData) ? contactsData : [];
      setCampaigns(campaignList);
      setContacts(safeContacts);
      setContactsCount(safeContacts.length);
      setLabels(Array.isArray(labelsData) ? labelsData : []);
      setStatuses(Array.isArray(statusesData) ? statusesData : []);
      setTemplates(Array.isArray(templatesData) ? templatesData : []);
      if (currentUser) setUserProfile(currentUser);
    } catch (err) {
      console.warn('Error loading campaigns data:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation, loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Metrics Calculations
  const totalCampaigns = campaigns.length;
  const completedCount = campaigns.filter(
    (c) =>
      c.status?.toLowerCase() === 'completed' ||
      c.status === 'COMPLETED'
  ).length;
  const processingCount = campaigns.filter(
    (c) =>
      c.status?.toLowerCase() === 'processing' ||
      c.status?.toLowerCase() === 'active' ||
      c.status?.toLowerCase() === 'running' ||
      c.status === 'PROCESSING'
  ).length;

  // Filter & Search
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.description && c.description.toLowerCase().includes(q)) ||
        (c.templateName && c.templateName.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (statusFilter === 'ALL') return true;
      const st = (c.status || '').toUpperCase();
      if (statusFilter === 'PROCESSING')
        return st === 'PROCESSING' || st === 'ACTIVE' || st === 'RUNNING';
      if (statusFilter === 'SCHEDULED') return st === 'SCHEDULED';
      if (statusFilter === 'COMPLETED') return st === 'COMPLETED';
      return true;
    });
  }, [campaigns, searchQuery, statusFilter]);

  const isFreeQr = userProfile?.whatsappChannelType === 'free_qr';

  // Estimated audience computation from real contacts
  const estimatedAudienceCount = useMemo(() => {
    if (audienceType === 'ALL') {
      return contactsCount;
    }
    if (audienceType === 'LABELS') {
      if (selectedLabels.length === 0) return 0;
      return contacts.filter((c) => {
        const tags = Array.isArray(c.tags) ? c.tags : Array.isArray(c.labels) ? c.labels : [];
        return selectedLabels.some((lbl) => tags.includes(lbl));
      }).length;
    }
    if (audienceType === 'STATUS') {
      if (!selectedStatus) return 0;
      return contacts.filter((c) => (c.status || '').toLowerCase() === selectedStatus.toLowerCase()).length;
    }
    return 0;
  }, [audienceType, selectedLabels, selectedStatus, contactsCount, contacts]);

  const resetCreateForm = () => {
    setCampaignName('');
    setCampaignDesc('');
    setAudienceType('ALL');
    setSelectedLabels([]);
    setSelectedStatus('');
    setSelectedTemplate(null);
    setCustomMessage('');
    setScheduleMode('NOW');
    setScheduleDate('');
    setCurrentStep(1);
    setShowCreateModal(false);
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!campaignName.trim()) {
        Alert.alert('Required', 'Please enter a campaign name.');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (isFreeQr) {
        if (!customMessage.trim()) {
          Alert.alert('Message Required', 'Please enter a broadcast message to continue.');
          return;
        }
      } else if (!selectedTemplate && templates.length > 0) {
        Alert.alert('Select Template', 'Please select a message template to continue.');
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      handleLaunchCampaign();
    }
  };

  const handleLaunchCampaign = async () => {
    setCreating(true);
    try {
      const payload = {
        name: campaignName.trim(),
        description: campaignDesc.trim() || 'Broadcast Campaign',
        channelType: isFreeQr ? 'FREE_QR' : 'META_CLOUD',
        messageTemplate: isFreeQr
          ? customMessage.trim()
          : (selectedTemplate?.name || selectedTemplate?.title || 'Broadcast Message'),
        status: scheduleMode === 'SCHEDULE' ? 'scheduled' : 'active',
        scheduledDate: scheduleMode === 'SCHEDULE' && scheduleDate ? new Date(scheduleDate) : null,
        delayOption: delayOption,
        audienceFilter: {
          tags: audienceType === 'LABELS' ? selectedLabels : [],
          status: audienceType === 'STATUS' && selectedStatus ? selectedStatus : null,
        },
      };

      const created = await campaignService.createCampaign(payload);

      setCampaigns((prev) => [created || payload, ...prev]);
      resetCreateForm();
      Alert.alert(
        'Success',
        scheduleMode === 'SCHEDULE'
          ? 'Campaign scheduled successfully!'
          : 'Campaign launched successfully!'
      );
    } catch (err) {
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to launch campaign.';
      Alert.alert('Campaign Error', errMsg);
    } finally {
      setCreating(false);
    }
  };

  const handleSendQuickBroadcast = async () => {
    const recipientPhones = contacts
      .map((c) => String(c.whatsapp || c.phone || '').replace(/\D/g, ''))
      .filter((p) => p.length >= 10);

    if (recipientPhones.length === 0) {
      Alert.alert('No Recipients', 'No contacts with valid phone numbers were found.');
      return;
    }
    if (!quickBroadcastMsg.trim()) {
      Alert.alert('Message Required', 'Please enter a broadcast message.');
      return;
    }

    setSendingQuickBroadcast(true);
    try {
      const res = await qrWhatsappService.sendBroadcast({
        recipientPhones,
        messageText: quickBroadcastMsg.trim(),
        intervalSeconds: 5,
      });
      if (res?.success) {
        setShowQuickBroadcastModal(false);
        setQuickBroadcastMsg('');
        Alert.alert(
          'Broadcast Started',
          res.message || `Sending broadcast to ${recipientPhones.length} contacts.`
        );
      } else {
        Alert.alert('Broadcast Failed', res?.message || 'Failed to start broadcast.');
      }
    } catch (err) {
      Alert.alert(
        'Broadcast Error',
        err?.response?.data?.message || err?.message || 'Failed to send broadcast message.'
      );
    } finally {
      setSendingQuickBroadcast(false);
    }
  };

  const handleDeleteCampaign = async (campaign) => {
    if (!campaign?._id) return;
    try {
      await campaignService.deleteCampaign(campaign._id);
      setCampaigns((prev) => prev.filter((c) => c._id !== campaign._id));
      setShowOptionsModal(false);
      setSelectedCampaign(null);
    } catch (err) {
      Alert.alert('Error', 'Failed to delete campaign');
    }
  };

  const formatScheduleText = (c) => {
    const st = (c.status || '').toUpperCase();
    if (st === 'PROCESSING' || st === 'ACTIVE' || st === 'RUNNING') {
      return 'Sending now';
    }
    if (c.scheduledAt || c.scheduledDate) {
      const d = new Date(c.scheduledAt || c.scheduledDate);
      return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    if (c.createdAt) {
      const d = new Date(c.createdAt);
      return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return 'Sending now';
  };

  const creatorName =
    userProfile?.name ||
    userProfile?.businessName ||
    'User';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Main Screen Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Campaigns</Text>
          <Text style={styles.headerSubtitle}>
            {`${totalCampaigns} total campaign${totalCampaigns === 1 ? '' : 's'}`}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#00B67A']} />
        }
      >
        {/* Top 3 Metrics Cards */}
        <View style={styles.metricsRow}>
          {/* Total campaigns */}
          <View style={styles.metricCard}>
            <View style={[styles.metricIconBox, { backgroundColor: '#EDF9F2' }]}>
              <Ionicons name="stats-chart" size={16} color="#00B67A" />
            </View>
            <Text style={styles.metricLabel}>Total campaigns</Text>
            <Text style={styles.metricValue}>{totalCampaigns}</Text>
            <Text style={styles.metricSub}>All time</Text>
          </View>

          {/* Completed */}
          <View style={styles.metricCard}>
            <View style={[styles.metricIconBox, { backgroundColor: '#EDF9F2' }]}>
              <Ionicons name="checkmark-outline" size={18} color="#00B67A" />
            </View>
            <Text style={styles.metricLabel}>Completed</Text>
            <Text style={styles.metricValue}>{completedCount}</Text>
            <Text style={styles.metricSub}>Successfully sent</Text>
          </View>

          {/* Processing */}
          <View style={styles.metricCard}>
            <View style={[styles.metricIconBox, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="paper-plane-outline" size={16} color="#3B82F6" />
            </View>
            <Text style={styles.metricLabel}>Processing</Text>
            <Text style={styles.metricValue}>{processingCount}</Text>
            <Text style={styles.metricSub}>Sending now</Text>
          </View>
        </View>

        {/* Search & Filter Row */}
        <View style={styles.searchRow}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search-outline" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search campaigns..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilterModal(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="options-outline" size={20} color="#475569" />
          </TouchableOpacity>
        </View>

        {/* Create Campaign & Send Broadcast CTA Buttons */}
        <View style={styles.ctaRow}>
          <TouchableOpacity
            style={[styles.createButton, { flex: 1, marginBottom: 0 }]}
            onPress={() => setShowCreateModal(true)}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.createButtonText}>Create</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sendBroadcastBtn}
            onPress={() => {
              if (isFreeQr) {
                setShowQuickBroadcastModal(true);
              } else {
                setShowCreateModal(true);
              }
            }}
            activeOpacity={0.85}
          >
            <Ionicons name="paper-plane-outline" size={18} color="#00B67A" style={{ marginRight: 6 }} />
            <Text style={styles.sendBroadcastBtnText}>Send Broadcast Message</Text>
          </TouchableOpacity>
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent campaigns</Text>
          <Text style={styles.sectionSubtitle}>
            {filteredCampaigns.length} shown
          </Text>
        </View>

        {/* Campaigns List */}
        {loading ? (
          <ActivityIndicator size="large" color="#00B67A" style={{ marginTop: 40 }} />
        ) : filteredCampaigns.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBox}>
              <Ionicons name="megaphone-outline" size={36} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>No campaigns found</Text>
            <Text style={styles.emptyDesc}>
              {searchQuery
                ? 'Try a different search query or clear the filter.'
                : 'Create your first broadcast campaign to reach your customers.'}
            </Text>
          </View>
        ) : (
          filteredCampaigns.map((camp, idx) => {
            const st = (camp.status || 'PROCESSING').toUpperCase();
            const audienceTarget =
              camp.stats?.totalTargeted ||
              camp.targetCount ||
              (Array.isArray(camp.targetAudience) ? camp.targetAudience.length : 0);

            let statusBg = '#FEF3C7';
            let statusTextColor = '#D97706';
            let statusLabel = 'Processing';

            if (st === 'COMPLETED') {
              statusBg = '#DCFCE7';
              statusTextColor = '#16A34A';
              statusLabel = 'Completed';
            } else if (st === 'SCHEDULED') {
              statusBg = '#EFF6FF';
              statusTextColor = '#2563EB';
              statusLabel = 'Scheduled';
            } else if (st === 'DRAFT') {
              statusBg = '#F1F5F9';
              statusTextColor = '#475569';
              statusLabel = 'Draft';
            }

            const scheduleDisplay = formatScheduleText(camp);
            const createdDateText = camp.createdAt
              ? `Created ${new Date(camp.createdAt).getDate()} ${new Date(camp.createdAt).toLocaleString('default', { month: 'short' })} ${new Date(camp.createdAt).getFullYear()} by ${camp.user?.name || creatorName}`
              : `Created by ${creatorName}`;

            return (
              <View key={camp._id || camp.id || idx} style={styles.campaignCard}>
                {/* Top Row */}
                <View style={styles.cardTopRow}>
                  <View style={styles.cardIconBox}>
                    <Ionicons name="megaphone-outline" size={18} color="#00B67A" />
                  </View>
                  <View style={styles.cardTitleCol}>
                    <Text style={styles.cardTitle}>{camp.name || camp.title}</Text>
                    <Text style={styles.cardSubtitle}>
                      {camp.description || camp.templateName || 'Festival Special Offer'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.moreOptionsBtn}
                    onPress={() => {
                      setSelectedCampaign(camp);
                      setShowOptionsModal(true);
                    }}
                  >
                    <Ionicons name="ellipsis-vertical" size={18} color="#64748B" />
                  </TouchableOpacity>
                </View>

                {/* Middle Info Row */}
                <View style={styles.cardMiddleRow}>
                  <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
                    <Text style={[styles.statusBadgeText, { color: statusTextColor }]}>
                      {statusLabel}
                    </Text>
                  </View>

                  <View style={styles.audienceBadge}>
                    <Ionicons name="people-outline" size={14} color="#64748B" style={{ marginRight: 4 }} />
                    <Text style={styles.audienceText}>
                      {Number(audienceTarget).toLocaleString()}
                    </Text>
                  </View>

                  <View style={styles.scheduleBadge}>
                    <Ionicons name="calendar-outline" size={14} color="#64748B" style={{ marginRight: 4 }} />
                    <Text style={styles.scheduleText}>{scheduleDisplay}</Text>
                  </View>
                </View>

                {/* Bottom Row */}
                <View style={styles.cardBottomRow}>
                  <Text style={styles.creatorDateText} numberOfLines={1}>
                    {createdDateText}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* ========================================================================= */}
      {/* CREATE CAMPAIGN WIZARD MODAL (1:1 Exact Match to Right Screen)           */}
      {/* ========================================================================= */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={resetCreateForm}
      >
        <SafeAreaView style={styles.wizardContainer}>
          <StatusBar style="dark" />

          {/* Wizard Header */}
          <View style={styles.wizardHeader}>
            <TouchableOpacity
              onPress={() => {
                if (currentStep > 1) {
                  setCurrentStep((prev) => prev - 1);
                } else {
                  resetCreateForm();
                }
              }}
              style={styles.wizardBackBtn}
            >
              <Ionicons name="chevron-back" size={24} color="#0F172A" />
            </TouchableOpacity>
            <Text style={styles.wizardHeaderTitle}>Create Campaign</Text>
            <TouchableOpacity onPress={resetCreateForm} style={styles.wizardCloseBtn}>
              <Ionicons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Stepper Progress Bar */}
          <View style={styles.stepperContainer}>
            {/* Step 1 */}
            <View style={styles.stepItem}>
              <View
                style={[
                  styles.stepCircle,
                  currentStep >= 1 ? styles.stepCircleActive : styles.stepCircleInactive,
                ]}
              >
                <Text
                  style={[
                    styles.stepNumber,
                    currentStep >= 1 ? styles.stepNumberActive : styles.stepNumberInactive,
                  ]}
                >
                  1
                </Text>
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  currentStep === 1 ? styles.stepLabelActive : styles.stepLabelInactive,
                ]}
              >
                Audience
              </Text>
            </View>

            <View style={styles.stepLine} />

            {/* Step 2 */}
            <View style={styles.stepItem}>
              <View
                style={[
                  styles.stepCircle,
                  currentStep >= 2 ? styles.stepCircleActive : styles.stepCircleInactive,
                ]}
              >
                <Text
                  style={[
                    styles.stepNumber,
                    currentStep >= 2 ? styles.stepNumberActive : styles.stepNumberInactive,
                  ]}
                >
                  2
                </Text>
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  currentStep === 2 ? styles.stepLabelActive : styles.stepLabelInactive,
                ]}
              >
                Template
              </Text>
            </View>

            <View style={styles.stepLine} />

            {/* Step 3 */}
            <View style={styles.stepItem}>
              <View
                style={[
                  styles.stepCircle,
                  currentStep >= 3 ? styles.stepCircleActive : styles.stepCircleInactive,
                ]}
              >
                <Text
                  style={[
                    styles.stepNumber,
                    currentStep >= 3 ? styles.stepNumberActive : styles.stepNumberInactive,
                  ]}
                >
                  3
                </Text>
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  currentStep === 3 ? styles.stepLabelActive : styles.stepLabelInactive,
                ]}
              >
                Review
              </Text>
            </View>
          </View>

          {/* Step Body */}
          <ScrollView
            contentContainerStyle={styles.wizardBody}
            keyboardShouldPersistTaps="handled"
          >
            {/* ================= STEP 1: AUDIENCE ================= */}
            {currentStep === 1 && (
              <View>
                <Text style={styles.stepSubtitleBadge}>STEP 1 OF 3</Text>
                <Text style={styles.stepMainTitle}>Create a new campaign</Text>
                <Text style={styles.stepDescription}>
                  Give your campaign a name, then select the audience to reach.
                </Text>

                {/* Campaign Name Input */}
                <View style={styles.inputSection}>
                  <Text style={styles.inputLabel}>Campaign name *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter campaign name"
                    placeholderTextColor="#94A3B8"
                    value={campaignName}
                    onChangeText={setCampaignName}
                    maxLength={80}
                  />
                  <Text style={styles.charCounter}>{campaignName.length}/80</Text>
                </View>

                {/* Audience Selection Section */}
                <Text style={styles.audienceSectionTitle}>
                  Who should receive this campaign?
                </Text>
                <Text style={styles.audienceSectionSubtitle}>
                  Select the contacts you want to reach out to.
                </Text>

                {/* 1. All Contacts Option Card */}
                <TouchableOpacity
                  style={[
                    styles.audienceCard,
                    audienceType === 'ALL' && styles.audienceCardSelected,
                  ]}
                  onPress={() => setAudienceType('ALL')}
                  activeOpacity={0.8}
                >
                  <View style={styles.audienceCardRow}>
                    <View
                      style={[
                        styles.audienceIconBox,
                        { backgroundColor: audienceType === 'ALL' ? '#EDF9F2' : '#F1F5F9' },
                      ]}
                    >
                      <Ionicons
                        name="people-outline"
                        size={20}
                        color={audienceType === 'ALL' ? '#00B67A' : '#64748B'}
                      />
                    </View>
                    <View style={styles.audienceTextCol}>
                      <Text style={styles.audienceTitle}>All Contacts</Text>
                      <Text style={styles.audienceDesc}>
                        Send this campaign to everyone in your contact list.
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.radioButton,
                        audienceType === 'ALL' && styles.radioButtonSelected,
                      ]}
                    >
                      {audienceType === 'ALL' && <View style={styles.radioInnerDot} />}
                    </View>
                  </View>

                  {/* Available contacts banner */}
                  {audienceType === 'ALL' && (
                    <View style={styles.availableBanner}>
                      <Text style={styles.availableCount}>
                        {Number(contactsCount).toLocaleString()}{' '}
                        <Text style={styles.availableText}>available contacts</Text>
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* 2. Filter by Labels */}
                <TouchableOpacity
                  style={[
                    styles.audienceCard,
                    audienceType === 'LABELS' && styles.audienceCardSelected,
                  ]}
                  onPress={() => setAudienceType('LABELS')}
                  activeOpacity={0.8}
                >
                  <View style={styles.audienceCardRow}>
                    <View
                      style={[
                        styles.audienceIconBox,
                        { backgroundColor: audienceType === 'LABELS' ? '#EDF9F2' : '#F1F5F9' },
                      ]}
                    >
                      <Ionicons
                        name="pricetag-outline"
                        size={18}
                        color={audienceType === 'LABELS' ? '#00B67A' : '#64748B'}
                      />
                    </View>
                    <View style={styles.audienceTextCol}>
                      <Text style={styles.audienceTitle}>Filter by Labels</Text>
                      <Text style={styles.audienceDesc}>
                        Select specific segments using labels.
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.radioButton,
                        audienceType === 'LABELS' && styles.radioButtonSelected,
                      ]}
                    >
                      {audienceType === 'LABELS' && <View style={styles.radioInnerDot} />}
                    </View>
                  </View>

                  {/* Label Chips Selector */}
                  {audienceType === 'LABELS' && (
                    <View style={styles.inlineChipsContainer}>
                      {labels.map((lbl) => {
                        const isChosen = selectedLabels.includes(lbl.name);
                        return (
                          <TouchableOpacity
                            key={lbl._id || lbl.name}
                            style={[
                              styles.labelChip,
                              isChosen && styles.labelChipActive,
                            ]}
                            onPress={() => {
                              setSelectedLabels((prev) =>
                                prev.includes(lbl.name)
                                  ? prev.filter((x) => x !== lbl.name)
                                  : [...prev, lbl.name]
                              );
                            }}
                          >
                            <Text
                              style={[
                                styles.labelChipText,
                                isChosen && styles.labelChipTextActive,
                              ]}
                            >
                              {lbl.name}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </TouchableOpacity>

                {/* 3. Filter by Status */}
                <TouchableOpacity
                  style={[
                    styles.audienceCard,
                    audienceType === 'STATUS' && styles.audienceCardSelected,
                  ]}
                  onPress={() => setAudienceType('STATUS')}
                  activeOpacity={0.8}
                >
                  <View style={styles.audienceCardRow}>
                    <View
                      style={[
                        styles.audienceIconBox,
                        { backgroundColor: audienceType === 'STATUS' ? '#EDF9F2' : '#F1F5F9' },
                      ]}
                    >
                      <Ionicons
                        name="options-outline"
                        size={18}
                        color={audienceType === 'STATUS' ? '#00B67A' : '#64748B'}
                      />
                    </View>
                    <View style={styles.audienceTextCol}>
                      <Text style={styles.audienceTitle}>Filter by Status</Text>
                      <Text style={styles.audienceDesc}>
                        Send messages based on contact lead status.
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.radioButton,
                        audienceType === 'STATUS' && styles.radioButtonSelected,
                      ]}
                    >
                      {audienceType === 'STATUS' && <View style={styles.radioInnerDot} />}
                    </View>
                  </View>

                  {/* Status Chips Selector */}
                  {audienceType === 'STATUS' && (
                    <View style={styles.inlineChipsContainer}>
                      {statuses.map((st) => {
                        const isChosen = selectedStatus === st.name;
                        return (
                          <TouchableOpacity
                            key={st._id || st.name}
                            style={[
                              styles.labelChip,
                              isChosen && styles.labelChipActive,
                            ]}
                            onPress={() => setSelectedStatus(st.name)}
                          >
                            <Text
                              style={[
                                styles.labelChipText,
                                isChosen && styles.labelChipTextActive,
                              ]}
                            >
                              {st.name}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </TouchableOpacity>

                {/* 4. Upload CSV */}
                <TouchableOpacity
                  style={[
                    styles.audienceCard,
                    audienceType === 'CSV' && styles.audienceCardSelected,
                  ]}
                  onPress={() => setAudienceType('CSV')}
                  activeOpacity={0.8}
                >
                  <View style={styles.audienceCardRow}>
                    <View
                      style={[
                        styles.audienceIconBox,
                        { backgroundColor: audienceType === 'CSV' ? '#EDF9F2' : '#F1F5F9' },
                      ]}
                    >
                      <Ionicons
                        name="cloud-upload-outline"
                        size={18}
                        color={audienceType === 'CSV' ? '#00B67A' : '#64748B'}
                      />
                    </View>
                    <View style={styles.audienceTextCol}>
                      <Text style={styles.audienceTitle}>Upload CSV</Text>
                      <Text style={styles.audienceDesc}>
                        Import contacts from a CSV or Excel file.
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.radioButton,
                        audienceType === 'CSV' && styles.radioButtonSelected,
                      ]}
                    >
                      {audienceType === 'CSV' && <View style={styles.radioInnerDot} />}
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            )}

            {/* ================= STEP 2: TEMPLATE / MESSAGE ================= */}
            {currentStep === 2 && (
              <View>
                <Text style={styles.stepSubtitleBadge}>STEP 2 OF 3</Text>
                <Text style={styles.stepMainTitle}>
                  {isFreeQr ? 'Write broadcast message' : 'Select message template'}
                </Text>
                <Text style={styles.stepDescription}>
                  {isFreeQr
                    ? 'Write your custom WhatsApp broadcast message. Use {{name}} to personalize.'
                    : 'Choose an approved WhatsApp message template for this broadcast.'}
                </Text>

                {isFreeQr ? (
                  <View style={styles.inputSection}>
                    <Text style={styles.inputLabel}>Broadcast Message *</Text>
                    <TextInput
                      style={[styles.textInput, styles.textAreaInput]}
                      placeholder="Hi {{name}}, we have an exciting update for you!"
                      placeholderTextColor="#94A3B8"
                      value={customMessage}
                      onChangeText={setCustomMessage}
                      multiline
                      numberOfLines={5}
                      textAlignVertical="top"
                    />
                    <Text style={styles.charCounter}>{customMessage.length} characters</Text>
                  </View>
                ) : templates.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyTitle}>No templates available</Text>
                    <Text style={styles.emptyDesc}>
                      Create and approve a template first to send a Meta Cloud broadcast.
                    </Text>
                  </View>
                ) : (
                  templates.map((tmpl) => {
                    const isSelected =
                      selectedTemplate?.name === tmpl.name ||
                      selectedTemplate?.id === tmpl.id;
                    return (
                      <TouchableOpacity
                        key={tmpl._id || tmpl.id || tmpl.name}
                        style={[
                          styles.templateCard,
                          isSelected && styles.templateCardSelected,
                        ]}
                        onPress={() => setSelectedTemplate(tmpl)}
                      >
                        <View style={styles.templateHeader}>
                          <Text style={styles.templateName}>{tmpl.name || tmpl.title}</Text>
                          <View style={styles.approvedBadge}>
                            <Text style={styles.approvedBadgeText}>Approved</Text>
                          </View>
                        </View>
                        <Text style={styles.templateBody} numberOfLines={2}>
                          {tmpl.body || tmpl.content || 'Hello, thank you for contacting us...'}
                        </Text>
                      </TouchableOpacity>
                    );
                  })
                )}
              </View>
            )}

            {/* ================= STEP 3: REVIEW & SCHEDULE ================= */}
            {currentStep === 3 && (
              <View>
                <Text style={styles.stepSubtitleBadge}>STEP 3 OF 3</Text>
                <Text style={styles.stepMainTitle}>Review and schedule</Text>
                <Text style={styles.stepDescription}>
                  Review your campaign details before launching.
                </Text>

                {/* Summary Card */}
                <View style={styles.reviewSummaryCard}>
                  <View style={styles.reviewRow}>
                    <Text style={styles.reviewLabel}>Campaign Name</Text>
                    <Text style={styles.reviewValue}>{campaignName}</Text>
                  </View>
                  <View style={styles.reviewDivider} />
                  <View style={styles.reviewRow}>
                    <Text style={styles.reviewLabel}>Target Audience</Text>
                    <Text style={styles.reviewValue}>
                      {Number(estimatedAudienceCount).toLocaleString()} contacts
                    </Text>
                  </View>
                  <View style={styles.reviewDivider} />
                  <View style={styles.reviewRow}>
                    <Text style={styles.reviewLabel}>{isFreeQr ? 'Message' : 'Template'}</Text>
                    <Text style={styles.reviewValue} numberOfLines={2}>
                      {isFreeQr
                        ? (customMessage.trim() || 'Broadcast Message')
                        : (selectedTemplate?.name || 'Broadcast Message')}
                    </Text>
                  </View>
                </View>

                {/* Scheduling Mode */}
                <Text style={styles.inputLabel}>Delivery Timing</Text>
                <View style={styles.scheduleModeRow}>
                  <TouchableOpacity
                    style={[
                      styles.scheduleModeBtn,
                      scheduleMode === 'NOW' && styles.scheduleModeBtnActive,
                    ]}
                    onPress={() => setScheduleMode('NOW')}
                  >
                    <Text
                      style={[
                        styles.scheduleModeText,
                        scheduleMode === 'NOW' && styles.scheduleModeTextActive,
                      ]}
                    >
                      Send Immediately
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.scheduleModeBtn,
                      scheduleMode === 'SCHEDULE' && styles.scheduleModeBtnActive,
                    ]}
                    onPress={() => setScheduleMode('SCHEDULE')}
                  >
                    <Text
                      style={[
                        styles.scheduleModeText,
                        scheduleMode === 'SCHEDULE' && styles.scheduleModeTextActive,
                      ]}
                    >
                      Schedule for Later
                    </Text>
                  </TouchableOpacity>
                </View>

                {scheduleMode === 'SCHEDULE' && (
                  <View style={{ marginTop: 12 }}>
                    <Text style={styles.inputLabel}>Date & Time</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. 2026-11-25 10:30 AM"
                      value={scheduleDate}
                      onChangeText={setScheduleDate}
                    />
                  </View>
                )}
              </View>
            )}
          </ScrollView>

          {/* Sticky Bottom Bar (Exact match to screenshot) */}
          <View style={styles.wizardStickyFooter}>
            <TouchableOpacity onPress={resetCreateForm} style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <View style={styles.audienceEstimatedBox}>
              <Text style={styles.estimatedLabel}>Estimated audience</Text>
              <Text style={styles.estimatedValue}>
                {Number(estimatedAudienceCount).toLocaleString()} contacts
              </Text>
            </View>

            <TouchableOpacity
              style={styles.nextBtn}
              onPress={handleNextStep}
              disabled={creating}
            >
              {creating ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <View style={styles.nextBtnContent}>
                  <Text style={styles.nextBtnText}>
                    {currentStep === 3 ? 'Launch' : 'Next'}
                  </Text>
                  {currentStep < 3 && (
                    <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
                  )}
                </View>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Filter Bottom Sheet Modal */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFilterModal(false)}
        >
          <View style={styles.filterSheet}>
            <Text style={styles.filterSheetTitle}>Filter Campaigns</Text>
            {['ALL', 'PROCESSING', 'SCHEDULED', 'COMPLETED'].map((st) => (
              <TouchableOpacity
                key={st}
                style={[
                  styles.filterSheetItem,
                  statusFilter === st && styles.filterSheetItemActive,
                ]}
                onPress={() => {
                  setStatusFilter(st);
                  setShowFilterModal(false);
                }}
              >
                <Text
                  style={[
                    styles.filterSheetItemText,
                    statusFilter === st && styles.filterSheetItemTextActive,
                  ]}
                >
                  {st === 'ALL'
                    ? 'All Statuses'
                    : st.charAt(0) + st.slice(1).toLowerCase()}
                </Text>
                {statusFilter === st && (
                  <Ionicons name="checkmark" size={18} color="#00B67A" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Options Sheet Modal */}
      <Modal
        visible={showOptionsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowOptionsModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowOptionsModal(false)}
        >
          <View style={styles.optionsSheet}>
            <Text style={styles.optionsSheetTitle}>
              {selectedCampaign?.name || 'Campaign Options'}
            </Text>

            <TouchableOpacity
              style={styles.optionsItem}
              onPress={() => handleDeleteCampaign(selectedCampaign)}
            >
              <Ionicons name="trash-outline" size={18} color="#EF4444" style={{ marginRight: 10 }} />
              <Text style={[styles.optionsItemText, { color: '#EF4444' }]}>Delete Campaign</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
      {/* Quick Broadcast Modal (Free QR) */}
      <Modal
        visible={showQuickBroadcastModal}
        transparent
        animationType="slide"
        onRequestClose={() => !sendingQuickBroadcast && setShowQuickBroadcastModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.quickBroadcastSheet}>
            <View style={styles.quickBroadcastHeader}>
              <Text style={styles.optionsSheetTitle}>Send Broadcast Message</Text>
              <TouchableOpacity
                onPress={() => !sendingQuickBroadcast && setShowQuickBroadcastModal(false)}
              >
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>
            <Text style={styles.quickBroadcastSub}>
              Sending to {contactsCount} contact{contactsCount === 1 ? '' : 's'} via connected WhatsApp Web
            </Text>
            <TextInput
              style={[styles.textInput, styles.textAreaInput]}
              placeholder="Hi {{name}}, write your broadcast message here..."
              placeholderTextColor="#94A3B8"
              value={quickBroadcastMsg}
              onChangeText={setQuickBroadcastMsg}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[
                styles.createButton,
                { marginTop: 14, marginBottom: 0 },
                sendingQuickBroadcast && { opacity: 0.7 },
              ]}
              onPress={handleSendQuickBroadcast}
              disabled={sendingQuickBroadcast}
              activeOpacity={0.85}
            >
              {sendingQuickBroadcast ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="paper-plane" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.createButtonText}>Send Broadcast Message</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <QuickBottomBar navigation={navigation} activeTab="Home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingTop: Platform.OS === 'android' ? 28 : 0,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  metricIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  metricSub: {
    fontSize: 10,
    color: '#94A3B8',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },
  filterButton: {
    width: 46,
    height: 46,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButton: {
    backgroundColor: '#00B67A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#00B67A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  sendBroadcastBtn: {
    flex: 1.5,
    backgroundColor: '#EDF9F2',
    borderWidth: 1,
    borderColor: '#00B67A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 10,
  },
  sendBroadcastBtnText: {
    color: '#00875A',
    fontSize: 13,
    fontWeight: '700',
  },
  textAreaInput: {
    minHeight: 110,
    paddingTop: 12,
  },
  quickBroadcastSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 34,
  },
  quickBroadcastHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  quickBroadcastSub: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  campaignCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#EDF9F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardTitleCol: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  moreOptionsBtn: {
    padding: 4,
  },
  cardMiddleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  audienceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  audienceText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  scheduleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  scheduleText: {
    fontSize: 12,
    color: '#64748B',
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  creatorDateText: {
    fontSize: 12,
    color: '#94A3B8',
    flex: 1,
    marginRight: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIconBox: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 240,
    lineHeight: 18,
  },

  // ================= WIZARD MODAL STYLES =================
  wizardContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  wizardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  wizardBackBtn: {
    padding: 4,
  },
  wizardHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  wizardCloseBtn: {
    padding: 4,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  stepItem: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  stepCircleActive: {
    backgroundColor: '#EDF9F2',
    borderWidth: 1.5,
    borderColor: '#00B67A',
  },
  stepCircleInactive: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  stepNumber: {
    fontSize: 13,
    fontWeight: '700',
  },
  stepNumberActive: {
    color: '#00B67A',
  },
  stepNumberInactive: {
    color: '#94A3B8',
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  stepLabelActive: {
    color: '#00B67A',
  },
  stepLabelInactive: {
    color: '#94A3B8',
  },
  stepLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 12,
    marginBottom: 20,
  },
  wizardBody: {
    padding: 20,
    paddingBottom: 40,
  },
  stepSubtitleBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00B67A',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  stepMainTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 20,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 46,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
  },
  charCounter: {
    fontSize: 11,
    color: '#94A3B8',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  audienceSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  audienceSectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 14,
  },
  audienceCard: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  audienceCardSelected: {
    borderColor: '#00B67A',
    borderWidth: 1.5,
  },
  audienceCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  audienceIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  audienceTextCol: {
    flex: 1,
    marginRight: 10,
  },
  audienceTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  audienceDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: '#00B67A',
  },
  radioInnerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00B67A',
  },
  availableBanner: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  availableCount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#00B67A',
  },
  availableText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#64748B',
  },
  inlineChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  labelChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  labelChipActive: {
    borderColor: '#00B67A',
    backgroundColor: '#EDF9F2',
  },
  labelChipText: {
    fontSize: 12,
    color: '#475569',
  },
  labelChipTextActive: {
    color: '#00B67A',
    fontWeight: '700',
  },

  // Template Step Cards
  templateCard: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  templateCardSelected: {
    borderColor: '#00B67A',
    borderWidth: 1.5,
    backgroundColor: '#F7FCF9',
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  templateName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  approvedBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  approvedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#16A34A',
  },
  templateBody: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },

  // Review Summary
  reviewSummaryCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  reviewValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  reviewDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  scheduleModeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  scheduleModeBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  scheduleModeBtnActive: {
    borderColor: '#00B67A',
    backgroundColor: '#EDF9F2',
  },
  scheduleModeText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  scheduleModeTextActive: {
    color: '#00B67A',
    fontWeight: '700',
  },

  // Sticky Bottom Bar
  wizardStickyFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  cancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  audienceEstimatedBox: {
    alignItems: 'center',
  },
  estimatedLabel: {
    fontSize: 10,
    color: '#94A3B8',
  },
  estimatedValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  nextBtn: {
    backgroundColor: '#00B67A',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  // Filter Sheet
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  filterSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 34,
  },
  filterSheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 14,
  },
  filterSheetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  filterSheetItemActive: {
    backgroundColor: '#F7FCF9',
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  filterSheetItemText: {
    fontSize: 14,
    color: '#334155',
  },
  filterSheetItemTextActive: {
    fontWeight: '700',
    color: '#00B67A',
  },

  // Options Sheet
  optionsSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 34,
  },
  optionsSheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 14,
  },
  optionsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  optionsItemText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
