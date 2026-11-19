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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { chatService } from '../../services/api';

const QUICK_REPLIES = [
  'I see. Tell me more.',
  'Could you clarify that?',
  "I'll look into this right away.",
];

export default function ChatDetailScreen({ route, navigation }) {
  const { chat = { _id: 'chat_1', name: '919350157447', phone: '+91 9350157447', status: 'Open', avatarText: '91' } } =
    route.params || {};

  const [messages, setMessages] = useState([
    {
      id: 'm1',
      type: 'text',
      text: "Hi, I'd like to know more about the admission process.",
      time: '10:18 AM',
      sender: 'customer',
    },
    {
      id: 'm2',
      type: 'text',
      text: "Of course! I'd be happy to help. Which program are you interested in?",
      time: '10:20 AM',
      sender: 'me',
      status: 'delivered',
    },
    {
      id: 'm3',
      type: 'template',
      bannerText: 'Build your future.',
      templateTag: 'ADMISSION_WELCOME_V1',
      text: 'Hello! Thank you for contacting Admission Anytime. Our admissions team will guide you through every step.',
      time: '10:40 AM',
      sender: 'me',
      status: 'delivered',
    },
    {
      id: 'm4',
      type: 'text',
      text: 'Could you clarify that?',
      time: '10:41 AM',
      sender: 'customer',
    },
    {
      id: 'm5',
      type: 'error',
      title: 'Message not delivered',
      subtitle: 'Template outside the 24-hour window. Send an approved template to restart the conversation.',
      sender: 'system',
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [currentStatus, setCurrentStatus] = useState(chat.status || 'Open');
  const [showActionsSheet, setShowActionsSheet] = useState(false);
  const [showStatusSheet, setShowStatusSheet] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  const flatListRef = useRef(null);

  // Load real messages if available
  useEffect(() => {
    const fetchChatMessages = async () => {
      if (chat._id) {
        const liveMsgs = await chatService.getMessages(chat._id);
        if (Array.isArray(liveMsgs) && liveMsgs.length > 0) {
          const mapped = liveMsgs.map((m, idx) => ({
            id: m._id || `m_${idx}`,
            type: m.template ? 'template' : 'text',
            text: m.text || m.body || '',
            time: m.time || '10:42 AM',
            sender: m.sender === 'me' || m.sender === 'user' ? 'me' : 'customer',
            status: m.status || 'delivered',
            templateTag: m.templateName,
          }));
          setMessages(mapped);
        }
      }
    };
    fetchChatMessages();
  }, [chat._id]);

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

  // Change chat status
  const handleChangeStatus = async (newStatus) => {
    setCurrentStatus(newStatus);
    setShowStatusSheet(false);
    try {
      if (chat._id) {
        await chatService.updateStatus(chat._id, newStatus.toLowerCase());
      }
    } catch (err) {
      console.warn('Status update API note:', err.message);
    }
  };

  // Toggle pin
  const handleTogglePin = async () => {
    setIsPinned(!isPinned);
    setShowActionsSheet(false);
    try {
      if (chat._id) {
        await chatService.togglePin(chat._id);
      }
    } catch (err) {
      console.warn('Pin API note:', err.message);
    }
  };

  // Clear chat
  const handleClearHistory = () => {
    setShowActionsSheet(false);
    Alert.alert('Clear Chat History', 'Are you sure you want to delete all messages in this conversation?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          setMessages([]);
          try {
            if (chat._id) await chatService.clearHistory(chat._id);
          } catch (err) {}
        },
      },
    ]);
  };

  // Delete chat
  const handleDeleteChat = () => {
    setShowActionsSheet(false);
    Alert.alert('Delete Contact', 'Are you sure you want to permanently delete this contact and chat?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            if (chat._id) await chatService.deleteChat(chat._id);
          } catch (err) {}
          navigation.goBack();
        },
      },
    ]);
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
            <Text style={styles.headerContactName} numberOfLines={1}>{chat.name || '919350157447'}</Text>
            <View style={styles.headerSubtitleRow}>
              <View style={styles.directDot} />
              <Text style={styles.headerSubtitleText}>Direct • WhatsApp</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Status Dropdown Pill */}
        <TouchableOpacity
          style={styles.statusPillBtn}
          onPress={() => setShowStatusSheet(true)}
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
              {/* WhatsApp Security Notice Banner */}
              <View style={styles.securityBanner}>
                <Ionicons name="lock-closed" size={12} color="#64748B" style={{ marginRight: 6 }} />
                <Text style={styles.securityBannerText}>Messages are secured with WhatsApp</Text>
              </View>

              {/* Date Header */}
              <View style={styles.dateHeader}>
                <Text style={styles.dateHeaderText}>Today</Text>
              </View>
            </>
          }
        />

        {/* Quick Reply Suggestion Pills */}
        <View style={styles.quickRepliesContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={QUICK_REPLIES}
            keyExtractor={(item) => item}
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
                setShowStatusSheet(true);
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
              onPress={handleClearHistory}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={20} color="#00875A" style={styles.actionIcon} />
              <Text style={styles.actionLabel}>Clear Chat History</Text>
            </TouchableOpacity>

            {/* Action 8: Delete Contact */}
            <TouchableOpacity
              style={styles.actionItemRow}
              onPress={handleDeleteChat}
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
});
