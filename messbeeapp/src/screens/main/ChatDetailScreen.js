import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  Image,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { chatService, quickReplyService } from '../../services/api';

export default function ChatDetailScreen({ route, navigation }) {
  const { chat = { _id: 'chat_1', name: 'Contact', phone: '', status: 'Open', avatarText: 'WA' } } =
    route.params || {};

  const [messages, setMessages] = useState([]);
  const [quickReplies, setQuickReplies] = useState([]);
  const [loading, setLoading] = useState(true);

  const [inputText, setInputText] = useState('');
  const [currentStatus, setCurrentStatus] = useState(chat.status || 'Open');
  const [showActionsSheet, setShowActionsSheet] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [isArchived, setIsArchived] = useState(chat.archived || false);
  const [isPinned, setIsPinned] = useState(chat.pinned || false);

  const flatListRef = useRef(null);

  // Load real messages & quick replies from backend + live 5s sync
  useEffect(() => {
    let isMounted = true;
    const mapMessages = (liveMsgs) =>
      liveMsgs.map((m, idx) => ({
        id: m._id || m.id || `m_${idx}`,
        type: m.template ? 'template' : (m.status === 'failed' ? 'error' : 'text'),
        text: m.text || m.body || m.message || '',
        time: m.time || (m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''),
        sender: m.sender === 'me' || m.sender === 'user' || m.fromMe ? 'me' : 'customer',
        status: m.status || 'delivered',
        templateTag: m.templateName || m.template?.name,
      }));

    const fetchChatData = async (isInitial = false) => {
      if (isInitial) setLoading(true);
      try {
        const [liveMsgs, liveQuickReplies] = await Promise.all([
          chat._id ? chatService.getMessages(chat._id).catch(() => []) : Promise.resolve([]),
          isInitial ? quickReplyService.getQuickReplies().catch(() => []) : Promise.resolve(null),
        ]);

        if (isInitial && chat._id) {
          chatService.markAsRead(chat._id);
        }

        if (isMounted) {
          if (Array.isArray(liveMsgs)) {
            setMessages(mapMessages(liveMsgs));
          }

          if (isInitial) {
            if (Array.isArray(liveQuickReplies) && liveQuickReplies.length > 0) {
              setQuickReplies(liveQuickReplies.map((qr) => qr.message || qr.body || qr.title || qr.shortcut || ''));
            } else {
              setQuickReplies(['I see. Tell me more.', 'Could you clarify that?', "I'll look into this right away."]);
            }
          }
        }
      } catch (err) {
        if (isInitial) console.warn('Chat data loading note:', err.message);
      } finally {
        if (isMounted && isInitial) setLoading(false);
      }
    };

    fetchChatData(true);
    const pollInterval = setInterval(() => fetchChatData(false), 5000);
    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [chat._id]);

  // Handle status update from UpdateLeadStatusModal
  useEffect(() => {
    if (route.params?.newStatus) {
      setCurrentStatus(route.params.newStatus);
    }
  }, [route.params?.newStatus]);

  // Handle new template sent from Template wizard flow
  useEffect(() => {
    if (route.params?.newTemplateMsg) {
      const newTmpl = route.params.newTemplateMsg;
      setMessages((prev) => [
        ...prev,
        {
          id: `tmpl_${Date.now()}`,
          type: 'template',
          bannerText: 'Build your future.',
          templateTag: newTmpl.templateName || 'ADMISSION_WELCOME_V1',
          text: newTmpl.text || 'Hello! Thank you for contacting Admission Anytime.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sender: 'me',
          status: 'delivered',
        },
      ]);
    }
  }, [route.params?.newTemplateMsg]);

  // Send text message
  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const textToSend = inputText.trim();
    const newMsg = {
      id: `msg_${Date.now()}`,
      type: 'text',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sender: 'me',
      status: 'delivered',
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');

    try {
      if (chat._id) {
        await chatService.sendMessage({
          chatId: chat._id,
          text: textToSend,
          sender: 'me',
        });
      }
    } catch (err) {
      console.warn('Message send API note:', err.message);
    }
  };

  // Toggle pin
  const handleTogglePin = async () => {
    const nextPin = !isPinned;
    setIsPinned(nextPin);
    setShowActionsSheet(false);
    try {
      if (chat._id) {
        await chatService.togglePin(chat._id);
      }
    } catch (err) {
      console.warn('Pin API note:', err.message);
    }
  };

  // Confirm Clear chat history
  const handleConfirmClearHistory = async () => {
    setShowClearModal(false);
    setMessages([]);
    try {
      if (chat._id) await chatService.clearHistory(chat._id);
    } catch (err) {}
  };

  // Confirm Delete contact
  const handleConfirmDeleteContact = async () => {
    setShowDeleteModal(false);
    try {
      if (chat._id) await chatService.deleteChat(chat._id);
    } catch (err) {}
    navigation.goBack();
  };

  // Confirm Restore archived chat
  const handleConfirmRestoreChat = async () => {
    setShowRestoreModal(false);
    setIsArchived(false);
    try {
      if (chat._id) await chatService.toggleArchive(chat._id);
    } catch (err) {}
  };

  const renderMessageItem = ({ item }) => {
    // 1. Error / Outside 24h Window Alert Box
    if (item.type === 'error') {
      return (
        <View style={styles.errorAlertBox}>
          <View style={styles.errorIconCircle}>
            <Ionicons name="alert" size={14} color="#FFFFFF" />
          </View>
          <View style={styles.errorContent}>
            <Text style={styles.errorTitle}>{item.title}</Text>
            <Text style={styles.errorSubtitle}>{item.subtitle}</Text>
          </View>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => navigation.navigate('TemplateSelection', { contact: chat })}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh-outline" size={13} color="#DC2626" style={{ marginRight: 4 }} />
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // 2. Template Message Card
    if (item.type === 'template') {
      return (
        <View style={styles.templateBubbleWrapper}>
          <View style={styles.templateBubbleCard}>
            {/* Banner Graphic */}
            <View style={styles.templateBanner}>
              <View style={styles.bannerDecorCircle} />
              <Text style={styles.bannerTagText}>ADMISSIONS</Text>
              <Text style={styles.bannerHeadingText}>{item.bannerText || 'Build your future.'}</Text>
            </View>

            {/* Template Header Badge */}
            <View style={styles.templateMetaRow}>
              <Ionicons name="document-text-outline" size={12} color="#00875A" style={{ marginRight: 4 }} />
              <Text style={styles.templateNameTag}>{item.templateTag || 'ADMISSION_WELCOME_V1'}</Text>
            </View>

            {/* Template Body */}
            <Text style={styles.templateBodyText}>{item.text}</Text>

            {/* Footer with Time and Double Tick */}
            <View style={styles.bubbleFooter}>
              <Text style={styles.bubbleTime}>{item.time}</Text>
              <Ionicons name="checkmark-done" size={14} color="#00B67A" style={{ marginLeft: 4 }} />
            </View>
          </View>
        </View>
      );
    }

    // 3. Regular Text Bubble
    const isMe = item.sender === 'me';
    return (
      <View style={[styles.bubbleRow, isMe ? styles.bubbleRowMe : styles.bubbleRowThem]}>
        <View style={[styles.bubbleBox, isMe ? styles.bubbleBoxMe : styles.bubbleBoxThem]}>
          <Text style={[styles.bubbleText, isMe ? styles.bubbleTextMe : styles.bubbleTextThem]}>
            {item.text}
          </Text>
          <View style={styles.bubbleFooter}>
            <Text style={styles.bubbleTime}>{item.time}</Text>
            {isMe && <Ionicons name="checkmark-done" size={14} color="#00B67A" style={{ marginLeft: 4 }} />}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* Header (Matching Image 1 Screen 2) */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-back" size={24} color="#0F172A" />
        </TouchableOpacity>

        {/* Squircle Avatar with WhatsApp Dot */}
        <TouchableOpacity
          style={styles.headerProfileBtn}
          onPress={() => navigation.navigate('ContactProfile', { contact: chat })}
          activeOpacity={0.8}
        >
          <View style={styles.avatarSquircle}>
            <Text style={styles.avatarInitials}>{chat.avatarText || '91'}</Text>
            <View style={styles.avatarGreenDot} />
          </View>
          <View style={styles.headerTitleBox}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.headerContactName} numberOfLines={1}>{chat.name || '919350157447'}</Text>
              {isPinned && <Ionicons name="pin" size={13} color="#D97706" style={{ marginLeft: 5 }} />}
            </View>
            <View style={styles.headerSubtitleRow}>
              <View style={styles.directDot} />
              <Text style={styles.headerSubtitleText}>Direct • WhatsApp</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Status Dropdown Pill */}
        <TouchableOpacity
          style={styles.statusPillBtn}
          onPress={() => navigation.navigate('UpdateLeadStatus', { contact: { ...chat, status: currentStatus } })}
          activeOpacity={0.8}
        >
          <View style={styles.statusPillDot} />
          <Text style={styles.statusPillLabel}>{currentStatus}</Text>
          <Ionicons name="chevron-down" size={12} color="#00875A" style={{ marginLeft: 3 }} />
        </TouchableOpacity>

        {/* 3-Dots Menu */}
        <TouchableOpacity
          style={styles.menuIconBtn}
          onPress={() => setShowActionsSheet(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="ellipsis-vertical" size={20} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessageItem}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <>
              {/* If Chat is Archived, Show Top Banner (Image 1 Screen 3) */}
              {isArchived && (
                <View style={styles.archivedTopBanner}>
                  <View style={styles.archivedBannerLeft}>
                    <View style={styles.archivedIconCircle}>
                      <Ionicons name="archive-outline" size={16} color="#00875A" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.archivedBannerTitle}>This chat is archived</Text>
                      <Text style={styles.archivedBannerDesc}>Restore this chat to return it to your active conversations.</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.restoreChatBtn}
                    onPress={() => setShowRestoreModal(true)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.restoreChatBtnText}>Restore Chat</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* WhatsApp Security Notice Banner */}
              <View style={styles.securityBanner}>
                <Ionicons name="lock-closed" size={12} color="#64748B" style={{ marginRight: 6 }} />
                <Text style={styles.securityBannerText}>Messages are secured with WhatsApp</Text>
              </View>

              {/* Date Header */}
              {messages.length > 0 && (
                <View style={styles.dateHeader}>
                  <Text style={styles.dateHeaderText}>Today</Text>
                </View>
              )}
            </>
          }
          ListEmptyComponent={
            loading ? (
              <View style={[styles.clearedEmptyBox, { paddingVertical: 40 }]}>
                <ActivityIndicator size="large" color="#00875A" />
                <Text style={[styles.clearedSubtext, { marginTop: 12 }]}>Loading messages...</Text>
              </View>
            ) : (
              /* Cleared Chat Empty State (Image 2 Screen 7) */
              <View style={styles.clearedEmptyBox}>
                <View style={styles.clearedIconSquircle}>
                  <Ionicons name="chatbubble-outline" size={26} color="#00875A" />
                </View>
                <Text style={styles.clearedHeading}>No messages yet</Text>
                <Text style={styles.clearedSubtext}>Start the conversation by typing a message below.</Text>
              </View>
            )
          }
        />

        {/* Quick Reply Suggestion Pills */}
        {quickReplies.length > 0 && (
          <View style={styles.quickRepliesContainer}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={quickReplies}
              keyExtractor={(item, index) => `${item}_${index}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.quickReplyPill}
                  onPress={() => setInputText(item)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.quickReplyText}>{item}</Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.quickRepliesList}
            />
          </View>
        )}

        {/* Bottom Input Composer */}
        <View style={styles.composerBar}>
          {/* Attachment Paperclip */}
          <TouchableOpacity style={styles.composerIconBtn} activeOpacity={0.7}>
            <Ionicons name="attach" size={22} color="#64748B" />
          </TouchableOpacity>

          {/* Text Input */}
          <TextInput
            style={styles.composerInput}
            placeholder="Type a message..."
            placeholderTextColor="#94A3B8"
            value={inputText}
            onChangeText={setInputText}
            multiline
          />

          {/* WhatsApp Template Document Icon */}
          <TouchableOpacity
            style={styles.composerIconBtn}
            onPress={() => navigation.navigate('TemplateSelection', { contact: chat })}
            activeOpacity={0.7}
          >
            <Ionicons name="document-text-outline" size={22} color="#00875A" />
          </TouchableOpacity>

          {/* Send Button */}
          <TouchableOpacity
            style={styles.sendGreenCircle}
            onPress={handleSendMessage}
            activeOpacity={0.85}
          >
            <Ionicons name="send" size={17} color="#FFFFFF" style={{ marginLeft: 2 }} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* ================= SCREEN 3: CONVERSATION ACTIONS SHEET ================= */}
      <Modal
        visible={showActionsSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowActionsSheet(false)}
      >
        <TouchableOpacity
          style={styles.sheetBackdrop}
          activeOpacity={1}
          onPress={() => setShowActionsSheet(false)}
        >
          <View style={styles.actionsSheetCard} onStartShouldSetResponder={() => true}>
            <View style={styles.sheetHandle} />

            <View style={styles.sheetTopRow}>
              <View>
                <Text style={styles.sheetTagText}>MESSBEE</Text>
                <Text style={styles.sheetTitleText}>Conversation actions</Text>
              </View>
              <TouchableOpacity onPress={() => setShowActionsSheet(false)} style={styles.sheetCloseBtn}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Action 1: View Profile */}
            <TouchableOpacity
              style={styles.actionItemRow}
              onPress={() => {
                setShowActionsSheet(false);
                navigation.navigate('ContactProfile', { contact: chat });
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="person-outline" size={20} color="#00875A" style={styles.actionIcon} />
              <Text style={styles.actionLabel}>View Profile</Text>
            </TouchableOpacity>

            {/* Action 2: Manage Labels */}
            <TouchableOpacity
              style={styles.actionItemRow}
              onPress={() => {
                setShowActionsSheet(false);
                navigation.navigate('ManageLabelsModal', { contact: chat });
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="pricetag-outline" size={20} color="#00875A" style={styles.actionIcon} />
              <Text style={styles.actionLabel}>Manage Labels</Text>
            </TouchableOpacity>

            {/* Action 3: Change Status */}
            <TouchableOpacity
              style={styles.actionItemRow}
              onPress={() => {
                setShowActionsSheet(false);
                navigation.navigate('UpdateLeadStatus', { contact: { ...chat, status: currentStatus } });
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="swap-horizontal-outline" size={20} color="#00875A" style={styles.actionIcon} />
              <Text style={[styles.actionLabel, { flex: 1 }]}>Change Status</Text>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>

            {/* Action 4: View Full History */}
            <TouchableOpacity
              style={styles.actionItemRow}
              onPress={() => {
                setShowActionsSheet(false);
                navigation.navigate('ContactFullHistory', { contact: chat });
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="time-outline" size={20} color="#00875A" style={styles.actionIcon} />
              <Text style={styles.actionLabel}>View Full History</Text>
            </TouchableOpacity>

            {/* Action 5: Assign Agent */}
            <TouchableOpacity
              style={styles.actionItemRow}
              onPress={() => {
                setShowActionsSheet(false);
                Alert.alert('Assign Agent', 'Agent assigned to current conversation.');
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="hardware-chip-outline" size={20} color="#00875A" style={styles.actionIcon} />
              <Text style={styles.actionLabel}>Assign Agent</Text>
            </TouchableOpacity>

            {/* Action 6: Pin / Unpin Chat */}
            <TouchableOpacity
              style={styles.actionItemRow}
              onPress={handleTogglePin}
              activeOpacity={0.7}
            >
              <Ionicons name="pin-outline" size={20} color="#00875A" style={styles.actionIcon} />
              <Text style={styles.actionLabel}>{isPinned ? 'Unpin Chat' : 'Pin Chat'}</Text>
            </TouchableOpacity>

            {/* Action 7: Clear Chat History */}
            <TouchableOpacity
              style={styles.actionItemRow}
              onPress={() => {
                setShowActionsSheet(false);
                setShowClearModal(true);
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={20} color="#00875A" style={styles.actionIcon} />
              <Text style={styles.actionLabel}>Clear Chat History</Text>
            </TouchableOpacity>

            {/* Action 8: Delete Contact */}
            <TouchableOpacity
              style={styles.actionItemRow}
              onPress={() => {
                setShowActionsSheet(false);
                setShowDeleteModal(true);
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="person-remove-outline" size={20} color="#00875A" style={styles.actionIcon} />
              <Text style={styles.actionLabel}>Delete Contact</Text>
            </TouchableOpacity>

            {/* Action 9: Block Contact */}
            <TouchableOpacity
              style={[styles.actionItemRow, { borderBottomWidth: 0 }]}
              onPress={() => {
                setShowActionsSheet(false);
                Alert.alert('Block Contact', `${chat.name} has been blocked.`);
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="ban-outline" size={20} color="#00875A" style={styles.actionIcon} />
              <Text style={styles.actionLabel}>Block Contact</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Quick Status Picker Sheet */}
      <Modal
        visible={showStatusSheet}
        transparent
        animationType="fade"
        onRequestClose={() => setShowStatusSheet(false)}
      >
        <TouchableOpacity
          style={styles.sheetBackdrop}
          activeOpacity={1}
          onPress={() => setShowStatusSheet(false)}
        >
          <View style={styles.statusDialog} onStartShouldSetResponder={() => true}>
            <Text style={styles.statusDialogTitle}>Select Conversation Status</Text>
            {['Open', 'Pending', 'Resolved'].map((st) => (
              <TouchableOpacity
                key={st}
                style={[styles.statusOptionRow, currentStatus.toLowerCase() === st.toLowerCase() && styles.statusOptionActive]}
                onPress={() => handleChangeStatus(st)}
              >
                <View style={styles.statusOptionLeft}>
                  <View style={[styles.statusOptDot, { backgroundColor: st === 'Resolved' ? '#7E22CE' : st === 'Pending' ? '#D97706' : '#166534' }]} />
                  <Text style={styles.statusOptText}>{st}</Text>
                </View>
                {currentStatus.toLowerCase() === st.toLowerCase() && (
                  <Ionicons name="checkmark" size={18} color="#00875A" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
      {/* ================= RESTORE CHAT MODAL (Image 1 Screen 4) ================= */}
      <Modal
        visible={showRestoreModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRestoreModal(false)}
      >
        <View style={styles.confirmBackdrop}>
          <View style={styles.confirmCardDialog}>
            <View style={styles.restoreIconCircle}>
              <Ionicons name="refresh" size={24} color="#00875A" />
            </View>

            <Text style={styles.confirmDialogTitle}>Restore Chat?</Text>
            <Text style={styles.confirmDialogBody}>
              This conversation will return to your active Chats list with its messages and history intact.
            </Text>

            {/* Selected Conversation Preview Card */}
            <View style={styles.contactPreviewCard}>
              <View style={[styles.previewAvatarSquircle, { backgroundColor: chat.avatarBg || '#F3E8FF' }]}>
                <Text style={[styles.previewAvatarText, { color: chat.avatarColor || '#6B21A8' }]}>
                  {chat.avatarText || 'U'}
                </Text>
                <View style={styles.previewDot} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.previewContactName}>{chat.name || 'Unknown'}</Text>
                <View style={styles.previewStatusRow}>
                  <View style={styles.previewStatusDot} />
                  <Text style={styles.previewStatusText}>{chat.status || 'Open'}</Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.confirmBtnRow}>
              <TouchableOpacity
                style={styles.confirmCancelBtn}
                onPress={() => setShowRestoreModal(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmRestoreBtn}
                onPress={handleConfirmRestoreChat}
                activeOpacity={0.85}
              >
                <Text style={styles.confirmRestoreText}>Restore Chat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ================= CLEAR CHAT HISTORY MODAL (Image 2 Screen 6) ================= */}
      <Modal
        visible={showClearModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowClearModal(false)}
      >
        <View style={styles.confirmBackdrop}>
          <View style={styles.confirmCardDialog}>
            <View style={styles.dangerIconCircle}>
              <Ionicons name="warning-outline" size={26} color="#EF4444" />
            </View>

            <Text style={styles.confirmDialogTitle}>Clear Chat History</Text>
            <Text style={styles.confirmDialogBody}>
              Are you sure you want to clear this chat history? This action will remove all messages from your view and cannot be undone.
            </Text>

            {/* Selected Conversation Card */}
            <View style={styles.contactPreviewCard}>
              <View style={[styles.previewAvatarSquircle, { backgroundColor: '#DCFCE7' }]}>
                <Text style={[styles.previewAvatarText, { color: '#065F46' }]}>
                  {chat.name?.slice(0, 2) || '91'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.previewSubLabel}>Selected conversation</Text>
                <Text style={styles.previewContactName}>{chat.name || '919350157447'}</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.confirmBtnRow}>
              <TouchableOpacity
                style={styles.confirmCancelBtn}
                onPress={() => setShowClearModal(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmDangerBtn}
                onPress={handleConfirmClearHistory}
                activeOpacity={0.85}
              >
                <Text style={styles.confirmDangerText}>Clear History</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.failureLink} activeOpacity={0.7}>
              <Text style={styles.failureLinkText}>Preview failure state</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ================= DELETE CONTACT MODAL (Image 2 Screen 8) ================= */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.confirmBackdrop}>
          <View style={styles.confirmCardDialog}>
            <View style={styles.dangerIconCircle}>
              <Ionicons name="warning-outline" size={26} color="#EF4444" />
            </View>

            <Text style={styles.confirmDialogTitle}>Delete Contact</Text>
            <Text style={styles.confirmDialogBody}>
              Are you sure you want to delete this contact and all its messages? This action is permanent and cannot be reversed.
            </Text>

            {/* Selected Contact Card */}
            <View style={styles.contactPreviewCard}>
              <View style={[styles.previewAvatarSquircle, { backgroundColor: '#DCFCE7' }]}>
                <Text style={[styles.previewAvatarText, { color: '#065F46' }]}>
                  {chat.name?.slice(0, 2) || '91'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.previewSubLabel}>Selected contact</Text>
                <Text style={styles.previewContactName}>{chat.name || '919350157447'}</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.confirmBtnRow}>
              <TouchableOpacity
                style={styles.confirmCancelBtn}
                onPress={() => setShowDeleteModal(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmDangerBtn}
                onPress={handleConfirmDeleteContact}
                activeOpacity={0.85}
              >
                <Text style={styles.confirmDangerText}>Delete Contact</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.failureLink} activeOpacity={0.7}>
              <Text style={styles.failureLinkText}>Preview failure state</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? 36 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerProfileBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
  },
  avatarSquircle: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarInitials: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#065F46',
  },
  avatarGreenDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00B67A',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  headerTitleBox: {
    marginLeft: 10,
    flex: 1,
  },
  headerContactName: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
  },
  directDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#94A3B8',
    marginRight: 4,
  },
  headerSubtitleText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  statusPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginRight: 6,
  },
  statusPillDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#00875A',
    marginRight: 4,
  },
  statusPillLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00875A',
  },
  menuIconBtn: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  securityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 12,
  },
  securityBannerText: {
    fontSize: 11,
    color: '#64748B',
  },
  dateHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  dateHeaderText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  bubbleRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  bubbleRowMe: {
    justifyContent: 'flex-end',
  },
  bubbleRowThem: {
    justifyContent: 'flex-start',
  },
  bubbleBox: {
    maxWidth: '82%',
    borderRadius: 16,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  bubbleBoxThem: {
    backgroundColor: '#F1F5F9',
    borderBottomLeftRadius: 4,
  },
  bubbleBoxMe: {
    backgroundColor: '#DCFCE7',
    borderBottomRightRadius: 4,
  },
  bubbleText: {
    fontSize: 13.5,
    lineHeight: 19,
  },
  bubbleTextThem: {
    color: '#0F172A',
  },
  bubbleTextMe: {
    color: '#064E3B',
  },
  bubbleFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
  },
  bubbleTime: {
    fontSize: 10,
    color: '#94A3B8',
  },

  // Template Message Card Bubble
  templateBubbleWrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 14,
  },
  templateBubbleCard: {
    width: '84%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    paddingBottom: 8,
    paddingHorizontal: 10,
  },
  templateBanner: {
    backgroundColor: '#00875A',
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    marginBottom: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  bannerDecorCircle: {
    position: 'absolute',
    right: -20,
    top: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  bannerTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#A7F3D0',
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  bannerHeadingText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  templateMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  templateNameTag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#00875A',
    textTransform: 'uppercase',
  },
  templateBodyText: {
    fontSize: 12.5,
    lineHeight: 18,
    color: '#1E293B',
    marginBottom: 4,
  },

  // Error Alert Box
  errorAlertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 14,
    padding: 10,
    marginVertical: 10,
  },
  errorIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  errorContent: {
    flex: 1,
  },
  errorTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  errorSubtitle: {
    fontSize: 10.5,
    color: '#991B1B',
    lineHeight: 14,
    marginTop: 1,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 6,
  },
  retryBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },

  // Quick Replies
  quickRepliesContainer: {
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
  },
  quickRepliesList: {
    paddingHorizontal: 14,
    gap: 8,
  },
  quickReplyPill: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  quickReplyText: {
    fontSize: 11.5,
    color: '#475569',
  },

  // Composer
  composerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  composerIconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  composerInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#0F172A',
    maxHeight: 100,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  sendGreenCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#00875A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00875A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    marginLeft: 6,
  },

  // Conversation Actions Bottom Sheet
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  actionsSheetCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 10,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  sheetTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sheetTagText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#00875A',
    letterSpacing: 0.8,
  },
  sheetTitleText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  sheetCloseBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  actionItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  actionIcon: {
    marginRight: 14,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },

  // Status dialog
  statusDialog: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 30,
  },
  statusDialogTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 14,
  },
  statusOptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  statusOptionActive: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  statusOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusOptDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  statusOptText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },

  // Archived Top Banner (Screen 3)
  archivedTopBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  archivedBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  archivedIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  archivedBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  archivedBannerDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  restoreChatBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#00875A',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  restoreChatBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#00875A',
  },

  // Cleared Empty State (Screen 7)
  clearedEmptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  clearedIconSquircle: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  clearedHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  clearedSubtext: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },

  // Confirmation Modals (Screens 4, 6, 8)
  confirmBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  confirmCardDialog: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  restoreIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  dangerIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  confirmDialogTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  confirmDialogBody: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  contactPreviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    marginBottom: 20,
  },
  previewAvatarSquircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    position: 'relative',
  },
  previewAvatarText: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  previewDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00B67A',
  },
  previewSubLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  previewContactName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  previewStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  previewStatusDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#00875A',
    marginRight: 4,
  },
  previewStatusText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#00875A',
  },
  confirmBtnRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },
  confirmCancelBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmCancelText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#475569',
  },
  confirmRestoreBtn: {
    flex: 1.2,
    backgroundColor: '#00875A',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmRestoreText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  confirmDangerBtn: {
    flex: 1.2,
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmDangerText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  failureLink: {
    marginTop: 14,
  },
  failureLinkText: {
    fontSize: 11.5,
    color: '#94A3B8',
    textDecorationLine: 'underline',
  },
});
