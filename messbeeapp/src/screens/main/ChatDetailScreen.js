import React, { useState } from 'react';
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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

const INITIAL_MESSAGES = [
  {
    id: 'm1',
    type: 'template',
    title: 'Welcome to MessBee!',
    body: 'Hello Rahul! 👋 Thank you for inquiring about our WhatsApp Business Automation solutions.',
    time: '10:30 AM',
    sender: 'system',
  },
  {
    id: 'm2',
    type: 'text',
    text: 'Hi team, can you share the product details and pricing catalog?',
    time: '10:40 AM',
    sender: 'customer',
  },
  {
    id: 'm3',
    type: 'text',
    text: 'Sure Rahul! Sharing the full brochure and pricing tier breakdown right away.',
    time: '10:42 AM',
    sender: 'user',
    status: 'delivered',
  },
];

export default function ChatDetailScreen({ route, navigation }) {
  const { chat = { name: 'Rahul Sharma', online: true, color: '#FB923C', initials: 'RS' } } =
    route.params || {};

  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMsg = {
      id: `m_${Date.now()}`,
      type: 'text',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sender: 'user',
      status: 'delivered',
    };

    setMessages([...messages, newMsg]);
    setInputText('');
  };

  const renderMessageItem = ({ item }) => {
    if (item.type === 'template') {
      return (
        <View style={styles.templateCardContainer}>
          <View style={styles.templateCard}>
            <View style={styles.templateHeader}>
              <Ionicons name="sparkles" size={16} color={COLORS.primaryDark} />
              <Text style={styles.templateTag}>AUTOMATED TEMPLATE</Text>
            </View>
            <Text style={styles.templateTitle}>{item.title}</Text>
            <Text style={styles.templateBody}>{item.body}</Text>
            <Text style={styles.templateTime}>{item.time}</Text>
          </View>
        </View>
      );
    }

    const isUser = item.sender === 'user';
    return (
      <View style={[styles.bubbleWrapper, isUser ? styles.bubbleRight : styles.bubbleLeft]}>
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleOther]}>
          <Text style={[styles.bubbleText, isUser ? styles.bubbleTextUser : styles.bubbleTextOther]}>
            {item.text}
          </Text>
          <View style={styles.metaRow}>
            <Text style={[styles.timeText, isUser ? styles.timeTextUser : styles.timeTextOther]}>
              {item.time}
            </Text>
            {isUser && (
              <Ionicons
                name="checkmark-done"
                size={14}
                color={COLORS.primaryDark}
                style={styles.checkIcon}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Chat Room Top Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>

        <View style={[styles.avatarCircle, { backgroundColor: chat.color || '#FB923C' }]}>
          <Text style={styles.avatarText}>{chat.initials || 'U'}</Text>
          {chat.online && <View style={styles.onlineBadge} />}
        </View>

        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{chat.name}</Text>
          <Text style={styles.headerStatus}>{chat.online ? 'Active now' : 'Offline'}</Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="call-outline" size={20} color="#374151" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="ellipsis-vertical" size={20} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages Feed */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessageItem}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
      />

      {/* Quick Replies Carousel */}
      <View style={styles.quickRepliesBar}>
        <TouchableOpacity
          style={styles.quickChip}
          onPress={() => setInputText('Sure, here is our product brochure!')}
          activeOpacity={0.7}
        >
          <Text style={styles.quickChipText}>⚡ Send Brochure</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickChip}
          onPress={() => setInputText('Would you like to schedule a quick call?')}
          activeOpacity={0.7}
        >
          <Text style={styles.quickChipText}>📅 Book Call</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickChip}
          onPress={() => setInputText('Thank you! Glad to connect with you.')}
          activeOpacity={0.7}
        >
          <Text style={styles.quickChipText}>🙏 Thank You</Text>
        </TouchableOpacity>
      </View>

      {/* Input Bar */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachBtn} activeOpacity={0.7}>
            <Ionicons name="add" size={24} color="#6B7280" />
          </TouchableOpacity>

          <TextInput
            placeholder="Type a message..."
            placeholderTextColor="#9CA3AF"
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            multiline
          />

          <TouchableOpacity
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim()}
            activeOpacity={0.8}
          >
            <Ionicons name="send" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: {
    marginRight: 10,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  headerStatus: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  templateCardContainer: {
    marginVertical: 10,
    alignItems: 'center',
  },
  templateCard: {
    width: '90%',
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    borderRadius: 16,
    padding: 16,
  },
  templateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  templateTag: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  templateTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#065F46',
    marginBottom: 6,
  },
  templateBody: {
    fontSize: 13,
    color: '#047857',
    lineHeight: 18,
    marginBottom: 8,
  },
  templateTime: {
    fontSize: 10,
    color: '#6EE7B7',
    textAlign: 'right',
  },
  bubbleWrapper: {
    marginVertical: 4,
    flexDirection: 'row',
  },
  bubbleLeft: {
    justifyContent: 'flex-start',
  },
  bubbleRight: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  bubbleUser: {
    backgroundColor: '#DCFCE7', // WhatsApp light green style
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20,
  },
  bubbleTextUser: {
    color: '#064E3B',
  },
  bubbleTextOther: {
    color: '#1F2937',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  timeText: {
    fontSize: 10,
  },
  timeTextUser: {
    color: '#059669',
  },
  timeTextOther: {
    color: '#9CA3AF',
  },
  checkIcon: {
    marginLeft: 4,
  },
  quickRepliesBar: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  quickChip: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  quickChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  attachBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    color: '#111827',
    maxHeight: 100,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendBtnDisabled: {
    backgroundColor: '#D1D5DB',
  },
});
