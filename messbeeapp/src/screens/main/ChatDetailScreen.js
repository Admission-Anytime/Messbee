import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  Image,
  ActivityIndicator,
  Share,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { chatService, quickReplyService, resolveFileUrl, getSocketUrl, templateService, mediaService, authService, commerceService } from '../../services/api';

export default function ChatDetailScreen({ route, navigation }) {
  const { chat = { _id: 'chat_1', name: 'Contact', phone: '', status: 'Open', avatarText: 'WA' } } =
    route.params || {};

  const [messages, setMessages] = useState([]);
  const [quickReplies, setQuickReplies] = useState([]);
  const [templateMap, setTemplateMap] = useState({});
  const [loading, setLoading] = useState(true);

  const [inputText, setInputText] = useState('');
  const [currentStatus, setCurrentStatus] = useState(chat.status || 'Open');
  const [showActionsSheet, setShowActionsSheet] = useState(false);
  const [showStatusSheet, setShowStatusSheet] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaTab, setMediaTab] = useState('recent');
  const [mediaAssets, setMediaAssets] = useState([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaCaption, setMediaCaption] = useState('');
  const [mediaSearch, setMediaSearch] = useState('');
  const [showClearModal, setShowClearModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [isArchived, setIsArchived] = useState(chat.archived || false);
  const [isPinned, setIsPinned] = useState(chat.pinned || false);
  const [activeChatId, setActiveChatId] = useState(chat._id || null);
  const [isFreeQrUser, setIsFreeQrUser] = useState(false);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [previewImageUrl, setPreviewImageUrl] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyMap, setReplyMap] = useState({});
  const [showAtTagMenu, setShowAtTagMenu] = useState(false);

  const replyStorageKey = `messbee_reply_map_${activeChatId || chat._id || 'default'}`;

  useEffect(() => {
    AsyncStorage.getItem(replyStorageKey)
      .then((raw) => {
        if (raw) setReplyMap(JSON.parse(raw));
      })
      .catch(() => {});
  }, [replyStorageKey]);

  const saveReplyMeta = async (msgObj, replyMeta) => {
    if (!replyMeta) return;
    const next = {
      ...replyMap,
      [msgObj.id]: replyMeta,
      ...(msgObj.text ? { [`txt_${msgObj.text}`]: replyMeta } : {}),
    };
    setReplyMap(next);
    try {
      await AsyncStorage.setItem(replyStorageKey, JSON.stringify(next));
    } catch {}
  };

  const handleStartReply = (item, overrideMediaUrl = null) => {
    const mUrl = overrideMediaUrl || item.mediaUrl || null;
    const mType = String(item.mediaType || '').toLowerCase();
    const fallbackLabel =
      mUrl && (!mType || mType === 'image' || mType.startsWith('image/'))
        ? '📷 Photo'
        : mUrl && (mType === 'video' || mType.startsWith('video/'))
        ? '🎥 Video'
        : mUrl && (mType === 'audio' || mType.startsWith('audio/'))
        ? '🎵 Audio'
        : mUrl
        ? `📄 ${item.fileName || 'Document'}`
        : item.templateTag
        ? `Template: ${item.templateTag}`
        : 'Message';
    setReplyingTo({
      id: item.id,
      senderLabel: item.sender === 'me' ? 'You' : (chat.name || 'Customer'),
      text: item.text?.trim() || fallbackLabel,
      mediaUrl: mUrl,
      mediaType: item.mediaType || (mUrl ? 'image' : null),
    });
  };

  const scrollToQuotedMessage = (targetId) => {
    if (!targetId) return;
    const reversed = [...messages].reverse();
    const idx = reversed.findIndex((m) => m.id === targetId);
    if (idx >= 0 && flatListRef.current) {
      try {
        flatListRef.current.scrollToIndex({ index: idx, animated: true, viewPosition: 0.5 });
      } catch {}
    }
  };

  useEffect(() => {
    authService
      .getCurrentUser()
      .then((u) => {
        if (u?.whatsappChannelType === 'free_qr') setIsFreeQrUser(true);
      })
      .catch(() => {});
  }, []);

  const flatListRef = useRef(null);
  const pollDisabledRef = useRef(false);

  // Load real messages & quick replies from backend + live 5s sync
  useEffect(() => {
    let isMounted = true;
    const mapMessages = (liveMsgs) =>
      liveMsgs.map((m, idx) => {
        const isInviteError =
          String(m.errorCode) === '131026' ||
          String(m.errorCode) === '13026' ||
          String(m.error || '').toLowerCase().includes('not have whatsapp');
        return {
          id: m._id || m.id || `m_${idx}`,
          type: m.status === 'failed' ? 'error' : (m.messageType === 'template' || m.template ? 'template' : 'text'),
          isInviteError,
          title: isInviteError
            ? 'This user is not on WhatsApp'
            : m.errorCode
            ? `WhatsApp Error (${m.errorCode})`
            : 'Message Failed',
          subtitle: isInviteError
            ? 'This user is not using WhatsApp. Invite them to connect via MessBee.'
            : m.error || m.text || 'Tap Retry to send an approved WhatsApp template.',
          text: m.text || m.body || m.message || '',
          time: m.time || (m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''),
          createdAt: m.createdAt || null,
          sender: m.sender === 'me' || m.sender === 'user' || m.fromMe ? 'me' : 'customer',
          status: m.status || 'sent',
          templateTag: m.templateName || m.template?.name,
          mediaUrl: resolveFileUrl(m.mediaUrl),
          mediaType: m.mediaType || null,
          fileName: m.fileName || null,
        };
      });

    const fetchChatData = async (isInitial = false) => {
      if (!isInitial && pollDisabledRef.current) return;
      if (isInitial) setLoading(true);
      try {
        let targetChatId = activeChatId;

        if (isInitial && targetChatId) {
          // Verify chat exists; if contact _id was mistakenly passed, resolve via createChat
          try {
            const liveMsgs = await chatService.getMessages(targetChatId);
            if (isMounted && Array.isArray(liveMsgs)) {
              setMessages(mapMessages(liveMsgs));
            }
          } catch (msgErr) {
            if (msgErr?.response?.status === 404 && (chat.phone || chat.whatsapp)) {
              const resolved = await chatService.createChat({
                name: chat.name,
                phone: chat.phone || chat.whatsapp,
              });
              if (resolved?._id && isMounted) {
                targetChatId = resolved._id;
                setActiveChatId(resolved._id);
                const retryMsgs = await chatService.getMessages(resolved._id).catch(() => []);
                if (isMounted && Array.isArray(retryMsgs)) {
                  setMessages(mapMessages(retryMsgs));
                }
              } else {
                pollDisabledRef.current = true;
              }
            } else {
              pollDisabledRef.current = true;
            }
          }
        } else if (targetChatId) {
          const liveMsgs = await chatService.getMessages(targetChatId).catch(() => null);
          if (isMounted && Array.isArray(liveMsgs)) {
            setMessages(mapMessages(liveMsgs));
          } else if (liveMsgs === null) {
            pollDisabledRef.current = true;
          }
        }

        if (isInitial && targetChatId) {
          chatService.markAsRead(targetChatId);
        }

        if (isInitial && isMounted) {
          const [liveQuickReplies, liveTemplates] = await Promise.all([
            quickReplyService.getQuickReplies().catch(() => []),
            templateService.getTemplates().catch(() => []),
          ]);
          if (isMounted) {
            if (Array.isArray(liveQuickReplies) && liveQuickReplies.length > 0) {
              setQuickReplies(liveQuickReplies.map((qr) => qr.message || qr.body || qr.title || qr.shortcut || ''));
            } else {
              setQuickReplies(['I see. Tell me more.', 'Could you clarify that?', "I'll look into this right away."]);
            }
            if (Array.isArray(liveTemplates) && liveTemplates.length > 0) {
              const tMap = {};
              liveTemplates.forEach((tpl) => {
                const headerComp = tpl.components?.find((c) => String(c.type).toUpperCase() === 'HEADER') || {};
                const footerComp = tpl.components?.find((c) => String(c.type).toUpperCase() === 'FOOTER') || {};
                const rawMedia =
                  headerComp.headerMediaUrlPreview ||
                  headerComp.headerMediaUrl ||
                  tpl.headerMediaUrlPreview ||
                  tpl.headerMediaUrl ||
                  (Array.isArray(headerComp.example?.header_handle) && /^https?:\/\//i.test(String(headerComp.example.header_handle[0] || ''))
                    ? headerComp.example.header_handle[0]
                    : '');
                const info = {
                  mediaUrl: resolveFileUrl(rawMedia),
                  headerType: headerComp.format || tpl.headerType || '',
                  headerText: headerComp.text || tpl.headerText || '',
                  footerText: footerComp.text || tpl.footerText || '',
                };
                if (tpl.name) tMap[String(tpl.name).toLowerCase()] = info;
                if (tpl.whatsappTemplateName) tMap[String(tpl.whatsappTemplateName).toLowerCase()] = info;
              });
              setTemplateMap(tMap);
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
  }, [activeChatId]);

  // Real-time Socket.IO listener for incoming messages & live read/delivery ticks
  useEffect(() => {
    if (!activeChatId) return;
    let socket;
    try {
      socket = io(getSocketUrl(), {
        transports: ['websocket', 'polling'],
        reconnection: true,
      });

      socket.on('connect', () => {
        socket.emit('join_chat', activeChatId);
      });

      socket.on('message_status_update', (payload) => {
        if (!payload || String(payload.chatId) !== String(activeChatId)) return;
        setMessages((prev) =>
          prev.map((m) =>
            String(m.id) === String(payload.messageId)
              ? {
                  ...m,
                  status: payload.status || m.status,
                  type: payload.status === 'failed' ? 'error' : m.type,
                  subtitle: payload.error || m.subtitle,
                }
              : m
          )
        );
      });

      const handleIncomingSocketMsg = (payload) => {
        const msg = payload?.message || payload;
        const msgChatId = payload?.chatId || msg?.chatId;
        if (!msg || String(msgChatId) !== String(activeChatId)) return;
        const mappedId = String(msg._id || msg.id || '');
        if (!mappedId) return;

        setMessages((prev) => {
          if (prev.some((m) => String(m.id) === mappedId)) return prev;
          return [
            ...prev,
            {
              id: mappedId,
              type: msg.status === 'failed' ? 'error' : (msg.messageType === 'template' || msg.template ? 'template' : 'text'),
              text: msg.text || msg.body || msg.message || '',
              time: msg.time || (msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''),
              createdAt: msg.createdAt || new Date().toISOString(),
              sender: msg.sender === 'me' || msg.sender === 'user' || msg.fromMe ? 'me' : 'customer',
              status: msg.status || 'sent',
              templateTag: msg.templateName || msg.template?.name,
              mediaUrl: resolveFileUrl(msg.mediaUrl),
              mediaType: msg.mediaType || null,
              fileName: msg.fileName || null,
            },
          ];
        });
      };

      socket.on('receive_message', handleIncomingSocketMsg);
      socket.on('message_sent', handleIncomingSocketMsg);
    } catch (e) {}

    return () => {
      if (socket) socket.disconnect();
    };
  }, [activeChatId]);

  const customerPresence = React.useMemo(() => {
    const incoming = [...messages].reverse().find((m) => m.sender === 'customer' && m.createdAt);
    const refTs = incoming?.createdAt || chat?.lastActivity || chat?.updatedAt;
    if (!refTs) return { label: 'WhatsApp', active: false };
    const diffMs = Date.now() - new Date(refTs).getTime();
    if (diffMs <= 5 * 60 * 1000) return { label: 'Active now • WhatsApp', active: true };
    if (diffMs <= 24 * 60 * 60 * 1000) {
      const t = new Date(refTs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return { label: `Active (24h window) • ${t}`, active: true };
    }
    const d = new Date(refTs).toLocaleDateString([], { day: '2-digit', month: 'short' });
    return { label: `Last active ${d} • WhatsApp`, active: false };
  }, [messages, chat?.lastActivity, chat?.updatedAt]);

  const renderStatusTicks = (status) => {
    const st = String(status || 'sent').toLowerCase();
    if (st === 'read') {
      return (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 4 }}>
          <Ionicons name="checkmark-done" size={14} color="#3B82F6" />
          <Text style={{ fontSize: 9.5, color: '#3B82F6', fontWeight: '700', marginLeft: 2 }}>Seen</Text>
        </View>
      );
    }
    if (st === 'delivered') {
      return <Ionicons name="checkmark-done" size={14} color="#64748B" style={{ marginLeft: 4 }} />;
    }
    if (st === 'failed') {
      return <Ionicons name="alert-circle" size={13} color="#EF4444" style={{ marginLeft: 4 }} />;
    }
    return <Ionicons name="checkmark" size={14} color="#64748B" style={{ marginLeft: 4 }} />;
  };

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
    const activeReply = replyingTo;
    const newMsg = {
      id: `msg_${Date.now()}`,
      type: 'text',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sender: 'me',
      status: 'delivered',
      replyTo: activeReply || null,
    };

    if (activeReply) saveReplyMeta(newMsg, activeReply);
    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
    setReplyingTo(null);
    setShowAtTagMenu(false);

    try {
      let targetId = activeChatId || chat._id;
      if (!targetId && (chat.phone || chat.whatsappId || chat.whatsapp)) {
        const resolved = await chatService.createChat({
          name: chat.name,
          phone: chat.phone || chat.whatsappId || chat.whatsapp,
        });
        if (resolved?._id) {
          targetId = resolved._id;
          setActiveChatId(resolved._id);
        }
      }
      if (targetId) {
        await chatService.sendMessage({
          chatId: targetId,
          text: textToSend,
          sender: 'me',
        });
      }
    } catch (err) {
      const errData = err?.response?.data;
      const errMsg = errData?.error || errData?.message || err.message || 'Failed to send message.';
      // Remove optimistic message on failure
      setMessages((prev) => prev.filter((m) => m.id !== newMsg.id));

      if (errData?.errorCode === 131047) {
        Alert.alert(
          '24-Hour Window Expired',
          'For new contacts or chats older than 24 hours, WhatsApp requires an approved Template message first.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Send Template',
              onPress: () =>
                navigation.navigate('TemplateSelection', {
                  contact: { ...chat, _id: activeChatId || chat._id },
                }),
            },
          ]
        );
      } else {
        Alert.alert('Message Not Sent', errMsg);
      }
    }
  };

  // ==================== MEDIA ATTACHMENT & UPLOAD (Web-Matching) ====================
  const openMediaModal = async () => {
    setShowMediaModal(true);
    setMediaCaption('');
    setMediaSearch('');
    setLoadingMedia(true);
    try {
      const list = await mediaService.getMedia();
      const mapped = (Array.isArray(list) ? list : []).map((a) => ({
        id: a._id || a.id,
        name: a.name || a.filename || 'Media Asset',
        size: a.size || '',
        type:
          a.type === 'IMAGE' || a.type === 'image'
            ? 'image'
            : a.type === 'VIDEO' || a.type === 'video'
            ? 'video'
            : a.type === 'AUDIO' || a.type === 'audio'
            ? 'audio'
            : 'document',
        url: resolveFileUrl(a.url),
        whatsappMediaId: a.whatsappMediaId || null,
      }));
      setMediaAssets(mapped);
      if (mapped.length > 0 && !selectedMedia) {
        setSelectedMedia(mapped[0]);
      }
    } catch (err) {
      console.warn('openMediaModal fetch error:', err.message);
    } finally {
      setLoadingMedia(false);
    }
  };

  const uploadPickedAsset = async (asset, fallbackType = 'image') => {
    if (!asset?.uri) return;
    setUploadingMedia(true);
    try {
      const res = await chatService.uploadFile(asset);
      if (res?.success) {
        const mime = res.mimeType || asset.mimeType || '';
        const detectedType = mime.startsWith('image/')
          ? 'image'
          : mime.startsWith('video/')
          ? 'video'
          : mime.startsWith('audio/')
          ? 'audio'
          : fallbackType;
        const newAsset = {
          id: res.mediaId || `media_${Date.now()}`,
          name: res.fileName || asset.fileName || asset.name || 'Uploaded File',
          size: res.size || '',
          type: detectedType,
          url: resolveFileUrl(res.fileUrl),
          whatsappMediaId: res.whatsappMediaId || null,
        };
        setMediaAssets((prev) => [newAsset, ...prev]);
        setSelectedMedia(newAsset);
        if (mediaTab !== 'recent') {
          setMediaTab(detectedType);
        }
      } else {
        Alert.alert('Upload Failed', res?.error || 'Could not upload file to WhatsApp.');
      }
    } catch (err) {
      const errMsg = err?.response?.data?.error || err?.response?.data?.details || err.message || 'Upload failed.';
      Alert.alert('Upload Error', errMsg);
    } finally {
      setUploadingMedia(false);
    }
  };

  const handlePickImageOrVideo = async (fromCamera = false) => {
    try {
      if (fromCamera) {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
          Alert.alert('Permission Required', 'Camera permission is needed to take a photo.');
          return;
        }
        const res = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images', 'videos'],
          quality: 0.85,
        });
        if (!res.canceled && res.assets?.[0]) {
          const a = res.assets[0];
          await uploadPickedAsset(a, a.type === 'video' ? 'video' : 'image');
        }
      } else {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) {
          Alert.alert('Permission Required', 'Gallery permission is needed to pick photos or videos.');
          return;
        }
        const res = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images', 'videos'],
          quality: 0.85,
        });
        if (!res.canceled && res.assets?.[0]) {
          const a = res.assets[0];
          await uploadPickedAsset(a, a.type === 'video' ? 'video' : 'image');
        }
      }
    } catch (err) {
      Alert.alert('Picker Error', err.message || 'Could not open media picker.');
    }
  };

  const handlePickDocument = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'audio/*', '*/*'],
        copyToCacheDirectory: true,
      });
      if (!res.canceled && res.assets?.[0]) {
        const a = res.assets[0];
        const mime = a.mimeType || '';
        const fallback = mime.startsWith('audio/') ? 'audio' : mime.startsWith('image/') ? 'image' : mime.startsWith('video/') ? 'video' : 'document';
        await uploadPickedAsset(a, fallback);
      }
    } catch (err) {
      Alert.alert('Document Error', err.message || 'Could not pick document.');
    }
  };

  const handleSendSelectedMedia = async () => {
    if (!selectedMedia) {
      Alert.alert('No Media Selected', 'Please upload or select a media asset first.');
      return;
    }
    const caption = mediaCaption.trim();
    const mediaToSend = selectedMedia;
    const activeReply = replyingTo;
    setShowMediaModal(false);
    setMediaCaption('');
    setReplyingTo(null);

    const optimisticMsg = {
      id: `msg_media_${Date.now()}`,
      type: 'text',
      text: caption,
      mediaUrl: mediaToSend.url,
      mediaType: mediaToSend.type,
      fileName: mediaToSend.name,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sender: 'me',
      status: 'sent',
      replyTo: activeReply || null,
    };
    if (activeReply) saveReplyMeta(optimisticMsg, activeReply);
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      let targetId = activeChatId || chat._id;
      if (!targetId && (chat.phone || chat.whatsappId || chat.whatsapp)) {
        const resolved = await chatService.createChat({
          name: chat.name,
          phone: chat.phone || chat.whatsappId || chat.whatsapp,
        });
        if (resolved?._id) {
          targetId = resolved._id;
          setActiveChatId(resolved._id);
        }
      }
      if (targetId) {
        await chatService.sendMediaMessage({
          chatId: targetId,
          text: caption,
          sender: 'me',
          media: {
            id: mediaToSend.id,
            whatsappMediaId: mediaToSend.whatsappMediaId,
            url: mediaToSend.url,
            name: mediaToSend.name,
            type: mediaToSend.type,
          },
          mediaType: mediaToSend.type,
        });
      }
    } catch (err) {
      const errData = err?.response?.data;
      const errMsg = errData?.error || errData?.message || err.message || 'Failed to send media.';
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
      if (errData?.errorCode === 131047) {
        Alert.alert(
          '24-Hour Window Expired',
          'For new contacts or chats older than 24 hours, WhatsApp requires an approved Template message first.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Send Template',
              onPress: () =>
                navigation.navigate('TemplateSelection', {
                  contact: { ...chat, _id: activeChatId || chat._id },
                }),
            },
          ]
        );
      } else {
        Alert.alert('Media Not Sent', errMsg);
      }
    }
  };

  // ==================== FREE QR TEMPLATE GUARD & CATALOG PRODUCT PICKER ====================
  const handleTemplatePress = () => {
    if (isFreeQrUser) {
      Alert.alert(
        'Meta Business Account Required',
        'Official WhatsApp Templates require a verified Meta WABA. On Free QR mode, you can send unlimited Free Text, Media, Quick Replies, and Catalog Products!',
        [
          { text: 'OK', style: 'cancel' },
          { text: 'Manage Quick Replies', onPress: () => navigation.navigate('QuickReplies') },
        ]
      );
      return;
    }
    navigation.navigate('TemplateSelection', {
      contact: { ...chat, _id: activeChatId || chat._id },
    });
  };

  const openProductPicker = async () => {
    setShowProductPicker(true);
    setProductSearch('');
    setLoadingProducts(true);
    try {
      const list = await commerceService.getProducts();
      setCatalogProducts(Array.isArray(list) ? list : []);
    } catch {
      setCatalogProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleSendProduct = async (prod) => {
    setShowProductPicker(false);
    const price = Number(prod.sellingPrice ?? prod.price ?? 0);
    const lines = [
      `*${prod.name || 'Product'}*`,
      `Price: ₹${price.toLocaleString('en-IN')}`,
      prod.sku ? `SKU: ${prod.sku}` : '',
      prod.description ? `\n${prod.description}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    const imgUrl = resolveFileUrl(prod.productImage || prod.image);
    const optimisticMsg = {
      id: `msg_prod_${Date.now()}`,
      type: 'text',
      text: lines,
      mediaUrl: imgUrl || null,
      mediaType: imgUrl ? 'image' : null,
      fileName: prod.name || 'Product',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sender: 'me',
      status: 'sent',
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      let targetId = activeChatId || chat._id;
      if (!targetId && (chat.phone || chat.whatsappId || chat.whatsapp)) {
        const resolved = await chatService.createChat({
          name: chat.name,
          phone: chat.phone || chat.whatsappId || chat.whatsapp,
        });
        if (resolved?._id) {
          targetId = resolved._id;
          setActiveChatId(resolved._id);
        }
      }
      if (targetId) {
        if (imgUrl) {
          await chatService.sendMediaMessage({
            chatId: targetId,
            text: lines,
            sender: 'me',
            media: { url: imgUrl, name: prod.name || 'product.jpg', type: 'image' },
            mediaType: 'image',
          });
        } else {
          await chatService.sendMessage({
            chatId: targetId,
            text: lines,
            sender: 'me',
          });
        }
      }
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
      Alert.alert('Product Not Sent', err?.response?.data?.error || err.message || 'Failed to send product.');
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

  // Change conversation status
  const handleChangeStatus = async (nextStatus) => {
    setCurrentStatus(nextStatus);
    setShowStatusSheet(false);
    try {
      if (chat._id) {
        await chatService.updateStatus(chat._id, nextStatus.toLowerCase());
      }
    } catch (err) {
      console.warn('Status update API note:', err.message);
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

  const handleInviteContact = async () => {
    const contactName = chat?.name ? `${chat.name}, ` : '';
    const inviteMessage = `Hi ${contactName}we tried reaching you on WhatsApp to share an important update. Join WhatsApp or connect with us directly on MessBee: https://messbee.com`;
    try {
      await Share.share({
        title: 'Invite to WhatsApp & MessBee',
        message: inviteMessage,
      });
    } catch (err) {
      Alert.alert('Invite Failed', err?.message || 'Unable to open share sheet.');
    }
  };

  const renderMessageItem = ({ item }) => {
    // 1. Error / Outside 24h Window / Not on WhatsApp Alert Box
    if (item.type === 'error') {
      return (
        <View style={[styles.errorAlertBox, item.isInviteError && styles.inviteAlertBox]}>
          <View style={[styles.errorIconCircle, item.isInviteError && styles.inviteIconCircle]}>
            <Ionicons name={item.isInviteError ? 'person-add-outline' : 'alert'} size={14} color="#FFFFFF" />
          </View>
          <View style={styles.errorContent}>
            <Text style={[styles.errorTitle, item.isInviteError && styles.inviteTitle]}>{item.title}</Text>
            <Text style={[styles.errorSubtitle, item.isInviteError && styles.inviteSubtitle]}>{item.subtitle}</Text>
          </View>
          {item.isInviteError ? (
            <TouchableOpacity
              style={styles.inviteBtn}
              onPress={handleInviteContact}
              activeOpacity={0.7}
            >
              <Ionicons name="share-social-outline" size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={styles.inviteBtnText}>Invite</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() =>
                navigation.navigate('TemplateSelection', {
                  contact: { ...chat, _id: activeChatId || chat._id },
                })
              }
              activeOpacity={0.7}
            >
              <Ionicons name="refresh-outline" size={13} color="#DC2626" style={{ marginRight: 4 }} />
              <Text style={styles.retryBtnText}>Retry</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    // 2. Template Message Card
    if (item.type === 'template') {
      const tplKey = String(item.templateTag || '').toLowerCase();
      const tplInfo = tplKey ? templateMap[tplKey] : null;
      const effectiveMediaUrl = item.mediaUrl || tplInfo?.mediaUrl || null;
      const effectiveMediaType = item.mediaType || (tplInfo?.headerType ? String(tplInfo.headerType).toLowerCase() : null);

      const tplReplyMeta = item.replyTo || replyMap[item.id] || (item.text ? replyMap[`txt_${item.text}`] : null);
      return (
        <View style={styles.templateBubbleWrapper}>
          <TouchableOpacity
            activeOpacity={0.95}
            delayLongPress={250}
            onLongPress={() => handleStartReply(item, effectiveMediaUrl)}
            style={styles.templateBubbleCard}
          >
            {tplReplyMeta && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => scrollToQuotedMessage(tplReplyMeta.id)}
                style={styles.quotedBoxLight}
              >
                <View style={styles.quotedAccentBar} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.quotedSenderLight}>{tplReplyMeta.senderLabel}</Text>
                  <Text style={styles.quotedTextLight} numberOfLines={2}>{tplReplyMeta.text}</Text>
                </View>
                {tplReplyMeta.mediaUrl && (
                  <Image source={{ uri: tplReplyMeta.mediaUrl }} style={styles.quotedThumb} resizeMode="cover" />
                )}
              </TouchableOpacity>
            )}
            {effectiveMediaUrl && (!effectiveMediaType || effectiveMediaType === 'image') ? (
              <TouchableOpacity activeOpacity={0.9} onPress={() => setPreviewImageUrl(effectiveMediaUrl)}>
                <Image
                  source={{ uri: effectiveMediaUrl }}
                  style={{
                    width: '100%',
                    height: 175,
                    borderRadius: 10,
                    marginBottom: 8,
                    backgroundColor: '#F1F5F9',
                  }}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ) : effectiveMediaUrl ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', padding: 10, borderRadius: 10, marginBottom: 8 }}>
                <Ionicons name="document-attach-outline" size={18} color="#00875A" style={{ marginRight: 8 }} />
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#0F172A', flex: 1 }} numberOfLines={1}>
                  {item.fileName || 'Attached Media'}
                </Text>
              </View>
            ) : null}

            {/* Template Header Badge */}
            <View style={styles.templateMetaRow}>
              <Ionicons name="document-text-outline" size={12} color="#00875A" style={{ marginRight: 4 }} />
              <Text style={styles.templateNameTag}>{item.templateTag || 'WhatsApp Template'}</Text>
            </View>

            {tplInfo?.headerText ? (
              <Text style={{ fontSize: 13.5, fontWeight: '700', color: '#0F172A', marginBottom: 4 }}>
                {tplInfo.headerText}
              </Text>
            ) : null}

            {/* Template Body */}
            <Text style={styles.templateBodyText}>{item.text}</Text>

            {tplInfo?.footerText ? (
              <Text style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>
                {tplInfo.footerText}
              </Text>
            ) : null}

            {/* Footer with Time and Status Ticks */}
            <View style={styles.bubbleFooter}>
              <TouchableOpacity onPress={() => handleStartReply(item, effectiveMediaUrl)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }} style={{ marginRight: 8 }}>
                <Ionicons name="arrow-undo-outline" size={13} color="#00875A" />
              </TouchableOpacity>
              <Text style={styles.bubbleTime}>{item.time}</Text>
              {renderStatusTicks(item.status)}
            </View>
          </TouchableOpacity>
        </View>
      );
    }

    // 3. Regular Text & Media Bubble
    const isMe = item.sender === 'me';
    const mediaTypeLower = String(item.mediaType || '').toLowerCase();
    const replyMeta = item.replyTo || replyMap[item.id] || (item.text ? replyMap[`txt_${item.text}`] : null);
    return (
      <View style={[styles.bubbleRow, isMe ? styles.bubbleRowMe : styles.bubbleRowThem]}>
        <TouchableOpacity
          activeOpacity={0.95}
          delayLongPress={250}
          onLongPress={() => handleStartReply(item)}
          style={[styles.bubbleBox, isMe ? styles.bubbleBoxMe : styles.bubbleBoxThem]}
        >
          {replyMeta && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => scrollToQuotedMessage(replyMeta.id)}
              style={isMe ? styles.quotedBoxDark : styles.quotedBoxLight}
            >
              <View style={[styles.quotedAccentBar, isMe && { backgroundColor: '#A7F3D0' }]} />
              <View style={{ flex: 1 }}>
                <Text style={isMe ? styles.quotedSenderDark : styles.quotedSenderLight}>{replyMeta.senderLabel}</Text>
                <Text style={isMe ? styles.quotedTextDark : styles.quotedTextLight} numberOfLines={2}>{replyMeta.text}</Text>
              </View>
              {replyMeta.mediaUrl && (
                <Image source={{ uri: replyMeta.mediaUrl }} style={styles.quotedThumb} resizeMode="cover" />
              )}
            </TouchableOpacity>
          )}
          {item.mediaUrl && (!mediaTypeLower || mediaTypeLower === 'image' || mediaTypeLower.startsWith('image/')) ? (
            <TouchableOpacity activeOpacity={0.9} onPress={() => setPreviewImageUrl(item.mediaUrl)}>
              <Image
                source={{ uri: item.mediaUrl }}
                style={{
                  width: 210,
                  height: 150,
                  borderRadius: 10,
                  marginBottom: item.text ? 6 : 2,
                  backgroundColor: '#F1F5F9',
                }}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ) : item.mediaUrl && (mediaTypeLower === 'video' || mediaTypeLower.startsWith('video/')) ? (
            <TouchableOpacity activeOpacity={0.8} onPress={() => Linking.openURL(item.mediaUrl).catch(() => {})} style={styles.mediaFileBubble}>
              <Ionicons name="videocam" size={20} color="#00875A" style={{ marginRight: 8 }} />
              <Text style={styles.mediaFileBubbleText} numberOfLines={1}>
                {item.fileName || 'Video Attachment'}
              </Text>
            </TouchableOpacity>
          ) : item.mediaUrl && (mediaTypeLower === 'audio' || mediaTypeLower.startsWith('audio/')) ? (
            <TouchableOpacity activeOpacity={0.8} onPress={() => Linking.openURL(item.mediaUrl).catch(() => {})} style={styles.mediaFileBubble}>
              <Ionicons name="musical-notes" size={20} color="#00875A" style={{ marginRight: 8 }} />
              <Text style={styles.mediaFileBubbleText} numberOfLines={1}>
                {item.fileName || 'Audio Message'}
              </Text>
            </TouchableOpacity>
          ) : item.mediaUrl ? (
            <TouchableOpacity activeOpacity={0.8} onPress={() => Linking.openURL(item.mediaUrl).catch(() => {})} style={styles.mediaFileBubble}>
              <Ionicons name="document-text" size={20} color="#00875A" style={{ marginRight: 8 }} />
              <Text style={styles.mediaFileBubbleText} numberOfLines={1}>
                {item.fileName || 'Document Attachment'}
              </Text>
            </TouchableOpacity>
          ) : null}
          {!!item.text && (
            <Text style={[styles.bubbleText, isMe ? styles.bubbleTextMe : styles.bubbleTextThem]}>
              {item.text}
            </Text>
          )}
          <View style={styles.bubbleFooter}>
            <TouchableOpacity onPress={() => handleStartReply(item)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }} style={{ marginRight: 8 }}>
              <Ionicons name="arrow-undo-outline" size={13} color={isMe ? '#D1FAE5' : '#64748B'} />
            </TouchableOpacity>
            <Text style={[styles.bubbleTime, isMe && { color: '#D1FAE5' }]}>{item.time}</Text>
            {isMe && renderStatusTicks(item.status)}
          </View>
        </TouchableOpacity>
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
              <View style={[styles.directDot, !customerPresence.active && { backgroundColor: '#94A3B8' }]} />
              <Text style={styles.headerSubtitleText}>{customerPresence.label}</Text>
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
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 24}
      >
        <FlatList
          ref={flatListRef}
          inverted
          style={{ flex: 1, backgroundColor: '#F1F5F3' }}
          data={[...messages].reverse()}
          keyExtractor={(item) => item.id}
          renderItem={renderMessageItem}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListFooterComponent={
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

        {/* @ Mention & Quick-Quote Menu */}
        {showAtTagMenu && (
          <View style={styles.atTagMenu}>
            <Text style={styles.atTagHeader}>Tag or Quote a Message</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
              <TouchableOpacity
                style={styles.atTagChip}
                onPress={() => {
                  const base = inputText.replace(/@$/, '');
                  setInputText(`${base}@${(chat.name || 'Customer').split(' ')[0]} `);
                  setShowAtTagMenu(false);
                }}
              >
                <Ionicons name="person-outline" size={13} color="#00875A" />
                <Text style={styles.atTagChipText}>@{chat.name || 'Customer'}</Text>
              </TouchableOpacity>
              {[...messages].reverse().slice(0, 5).map((m) => (
                <TouchableOpacity
                  key={m.id}
                  style={styles.atTagChip}
                  onPress={() => {
                    setInputText(inputText.replace(/@$/, ''));
                    handleStartReply(m);
                    setShowAtTagMenu(false);
                  }}
                >
                  <Ionicons name={m.mediaUrl ? 'image-outline' : 'arrow-undo-outline'} size={13} color="#00875A" />
                  <Text style={styles.atTagChipText} numberOfLines={1}>
                    {m.mediaUrl ? '📷 Photo' : (m.text || m.templateTag || 'Message').slice(0, 22)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* WhatsApp-Style Quoted Reply Preview Bar */}
        {replyingTo && (
          <View style={styles.replyPreviewBar}>
            <View style={styles.quotedAccentBar} />
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.quotedSenderLight}>{replyingTo.senderLabel}</Text>
              <Text style={styles.quotedTextLight} numberOfLines={1}>{replyingTo.text}</Text>
            </View>
            {replyingTo.mediaUrl && (
              <Image source={{ uri: replyingTo.mediaUrl }} style={styles.quotedThumb} resizeMode="cover" />
            )}
            <TouchableOpacity onPress={() => setReplyingTo(null)} style={{ padding: 6 }}>
              <Ionicons name="close" size={18} color="#64748B" />
            </TouchableOpacity>
          </View>
        )}

        {/* Bottom Input Composer */}
        <View style={styles.composerBar}>
          {/* Attachment Paperclip */}
          <TouchableOpacity
            style={styles.composerIconBtn}
            onPress={openMediaModal}
            activeOpacity={0.7}
          >
            <Ionicons name="attach" size={22} color="#64748B" />
          </TouchableOpacity>

          {/* Text Input */}
          <TextInput
            style={styles.composerInput}
            placeholder="Type a message..."
            placeholderTextColor="#94A3B8"
            value={inputText}
            onChangeText={(val) => {
              setInputText(val);
              setShowAtTagMenu(val.endsWith('@'));
            }}
            multiline
          />

          {/* Catalog Product Picker Icon (Web-Matching) */}
          <TouchableOpacity
            style={styles.composerIconBtn}
            onPress={openProductPicker}
            activeOpacity={0.7}
          >
            <Ionicons name="bag-handle-outline" size={21} color="#4F46E5" />
          </TouchableOpacity>

          {/* WhatsApp Template Document Icon */}
          <TouchableOpacity
            style={styles.composerIconBtn}
            onPress={handleTemplatePress}
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

      {/* ================= MEDIA LIBRARY & UPLOAD MODAL (Web-Matching) ================= */}
      <Modal
        visible={showMediaModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMediaModal(false)}
      >
        <View style={styles.sheetBackdrop}>
          <View style={styles.mediaModalCard}>
            <View style={styles.sheetHandle} />

            {/* Modal Header */}
            <View style={styles.mediaModalHeader}>
              <View>
                <Text style={styles.mediaModalTitle}>Attach Media</Text>
                <Text style={styles.mediaModalSubtitle}>Upload new or pick from Media Gallery</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowMediaModal(false)}
                style={styles.mediaCloseBtn}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Upload Quick Actions (Gallery, Camera, Document/Audio) */}
            <View style={styles.uploadActionRow}>
              <TouchableOpacity
                style={[styles.uploadActionBtn, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}
                onPress={() => handlePickImageOrVideo(false)}
                disabled={uploadingMedia}
              >
                <Ionicons name="images-outline" size={18} color="#00875A" />
                <Text style={[styles.uploadActionText, { color: '#00875A' }]}>Photo / Video</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.uploadActionBtn, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}
                onPress={() => handlePickImageOrVideo(true)}
                disabled={uploadingMedia}
              >
                <Ionicons name="camera-outline" size={18} color="#2563EB" />
                <Text style={[styles.uploadActionText, { color: '#2563EB' }]}>Camera</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.uploadActionBtn, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}
                onPress={handlePickDocument}
                disabled={uploadingMedia}
              >
                <Ionicons name="document-attach-outline" size={18} color="#D97706" />
                <Text style={[styles.uploadActionText, { color: '#D97706' }]}>Doc / Audio</Text>
              </TouchableOpacity>
            </View>

            {uploadingMedia && (
              <View style={styles.uploadingBanner}>
                <ActivityIndicator size="small" color="#00875A" />
                <Text style={styles.uploadingBannerText}>Uploading to WhatsApp & Media Gallery...</Text>
              </View>
            )}

            {/* Search + Category Filter Tabs */}
            <View style={styles.mediaSearchBox}>
              <Ionicons name="search" size={16} color="#94A3B8" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.mediaSearchInput}
                placeholder="Search media assets..."
                placeholderTextColor="#94A3B8"
                value={mediaSearch}
                onChangeText={setMediaSearch}
              />
            </View>

            <View style={styles.mediaTabsRow}>
              {[
                { id: 'recent', label: 'Recent' },
                { id: 'image', label: 'Images' },
                { id: 'video', label: 'Videos' },
                { id: 'audio', label: 'Audio' },
                { id: 'document', label: 'Docs' },
              ].map((tab) => {
                const active = mediaTab === tab.id;
                return (
                  <TouchableOpacity
                    key={tab.id}
                    style={[styles.mediaTabPill, active && styles.mediaTabPillActive]}
                    onPress={() => setMediaTab(tab.id)}
                  >
                    <Text style={[styles.mediaTabText, active && styles.mediaTabTextActive]}>
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Gallery Grid */}
            <View style={{ flex: 1, minHeight: 170 }}>
              {loadingMedia ? (
                <View style={styles.mediaEmptyBox}>
                  <ActivityIndicator size="small" color="#00875A" />
                  <Text style={styles.mediaEmptyText}>Loading Media Gallery...</Text>
                </View>
              ) : (
                <FlatList
                  data={mediaAssets.filter((m) => {
                    const matchTab = mediaTab === 'recent' || m.type === mediaTab;
                    const matchSearch =
                      !mediaSearch.trim() ||
                      (m.name || '').toLowerCase().includes(mediaSearch.toLowerCase());
                    return matchTab && matchSearch;
                  })}
                  keyExtractor={(item, index) => String(item.id || index)}
                  numColumns={2}
                  columnWrapperStyle={{ gap: 10 }}
                  contentContainerStyle={{ paddingBottom: 10, gap: 10 }}
                  ListEmptyComponent={
                    <View style={styles.mediaEmptyBox}>
                      <Ionicons name="folder-open-outline" size={32} color="#CBD5E1" />
                      <Text style={styles.mediaEmptyText}>No media found. Upload a file above!</Text>
                    </View>
                  }
                  renderItem={({ item }) => {
                    const isSelected = selectedMedia?.id === item.id;
                    return (
                      <TouchableOpacity
                        style={[styles.mediaGridCard, isSelected && styles.mediaGridCardActive]}
                        onPress={() => setSelectedMedia(item)}
                        activeOpacity={0.8}
                      >
                        <View style={styles.mediaThumbBox}>
                          {item.type === 'image' && item.url ? (
                            <Image source={{ uri: item.url }} style={styles.mediaThumbImg} resizeMode="cover" />
                          ) : (
                            <Ionicons
                              name={
                                item.type === 'video'
                                  ? 'videocam-outline'
                                  : item.type === 'audio'
                                  ? 'musical-notes-outline'
                                  : 'document-text-outline'
                              }
                              size={28}
                              color="#00875A"
                            />
                          )}
                          {isSelected && (
                            <View style={styles.mediaSelectedCheck}>
                              <Ionicons name="checkmark-circle" size={20} color="#00B67A" />
                            </View>
                          )}
                        </View>
                        <Text style={styles.mediaGridName} numberOfLines={1}>
                          {item.name}
                        </Text>
                        {!!item.size && (
                          <Text style={styles.mediaGridSize}>{item.size}</Text>
                        )}
                      </TouchableOpacity>
                    );
                  }}
                />
              )}
            </View>

            {/* Caption & Send Bar */}
            <View style={styles.mediaSendBar}>
              <TextInput
                style={styles.mediaCaptionInput}
                placeholder="Add a caption (optional)..."
                placeholderTextColor="#94A3B8"
                value={mediaCaption}
                onChangeText={setMediaCaption}
              />
              <TouchableOpacity
                style={[
                  styles.mediaSendBtn,
                  (!selectedMedia || uploadingMedia) && { opacity: 0.5 },
                ]}
                onPress={handleSendSelectedMedia}
                disabled={!selectedMedia || uploadingMedia}
              >
                <Ionicons name="send" size={16} color="#FFFFFF" />
                <Text style={styles.mediaSendBtnText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ================= CATALOG PRODUCT PICKER MODAL (Web-Matching) ================= */}
      <Modal
        visible={showProductPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowProductPicker(false)}
      >
        <View style={styles.sheetBackdrop}>
          <View style={styles.mediaModalCard}>
            <View style={styles.sheetHandle} />
            <View style={styles.mediaModalHeader}>
              <View>
                <Text style={styles.mediaModalTitle}>Send Catalog Product</Text>
                <Text style={styles.mediaModalSubtitle}>Tap any product to share in chat</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowProductPicker(false)}
                style={styles.mediaCloseBtn}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.mediaSearchBox}>
              <Ionicons name="search" size={16} color="#94A3B8" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.mediaSearchInput}
                placeholder="Search products..."
                placeholderTextColor="#94A3B8"
                value={productSearch}
                onChangeText={setProductSearch}
              />
            </View>

            {loadingProducts ? (
              <View style={styles.mediaEmptyBox}>
                <ActivityIndicator size="small" color="#00875A" />
                <Text style={styles.mediaEmptyText}>Loading catalog products...</Text>
              </View>
            ) : (
              <FlatList
                data={catalogProducts.filter(
                  (p) =>
                    !productSearch.trim() ||
                    (p.name || '').toLowerCase().includes(productSearch.toLowerCase()) ||
                    (p.sku || '').toLowerCase().includes(productSearch.toLowerCase())
                )}
                keyExtractor={(item, idx) => String(item._id || idx)}
                ListEmptyComponent={
                  <View style={styles.mediaEmptyBox}>
                    <Ionicons name="bag-outline" size={32} color="#CBD5E1" />
                    <Text style={styles.mediaEmptyText}>No products in catalog yet.</Text>
                  </View>
                }
                renderItem={({ item }) => {
                  const pImg = resolveFileUrl(item.productImage || item.image);
                  const price = Number(item.sellingPrice ?? item.price ?? 0);
                  return (
                    <TouchableOpacity
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: 12,
                        borderBottomWidth: 1,
                        borderBottomColor: '#F1F5F9',
                        gap: 12,
                      }}
                      onPress={() => handleSendProduct(item)}
                    >
                      <View
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 12,
                          backgroundColor: '#EEF2FF',
                          justifyContent: 'center',
                          alignItems: 'center',
                          overflow: 'hidden',
                        }}
                      >
                        {pImg ? (
                          <Image source={{ uri: pImg }} style={{ width: 48, height: 48 }} resizeMode="cover" />
                        ) : (
                          <Ionicons name="cube-outline" size={22} color="#4F46E5" />
                        )}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: '#0F172A' }} numberOfLines={1}>
                          {item.name}
                        </Text>
                        <Text style={{ fontSize: 11.5, color: '#64748B', marginTop: 2 }}>
                          ₹{price.toLocaleString('en-IN')} • Stock: {item.currentStock ?? 0}
                        </Text>
                      </View>
                      <Ionicons name="send" size={16} color="#00875A" />
                    </TouchableOpacity>
                  );
                }}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* ================= FULL-SCREEN IMAGE VIEWER MODAL ================= */}
      <Modal
        visible={!!previewImageUrl}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewImageUrl(null)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ position: 'absolute', top: Platform.OS === 'android' ? 38 : 54, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between', zIndex: 10 }}>
            <TouchableOpacity
              onPress={() => Share.share({ message: previewImageUrl, url: previewImageUrl }).catch(() => {})}
              style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.16)', justifyContent: 'center', alignItems: 'center' }}
            >
              <Ionicons name="share-outline" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setPreviewImageUrl(null)}
              style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.16)', justifyContent: 'center', alignItems: 'center' }}
            >
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          {!!previewImageUrl && (
            <Image
              source={{ uri: previewImageUrl }}
              style={{ width: '96%', height: '80%' }}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 0,
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  bubbleBoxMe: {
    backgroundColor: '#00875A',
    borderBottomRightRadius: 4,
    shadowColor: '#00875A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 5,
    elevation: 2,
  },
  bubbleText: {
    fontSize: 13.5,
    lineHeight: 19,
  },
  bubbleTextThem: {
    color: '#0F172A',
  },
  bubbleTextMe: {
    color: '#FFFFFF',
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
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: '#A7F3D0',
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
  inviteAlertBox: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  inviteIconCircle: {
    backgroundColor: '#00875A',
  },
  inviteTitle: {
    color: '#065F46',
  },
  inviteSubtitle: {
    color: '#047857',
  },
  inviteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00875A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    marginLeft: 8,
  },
  inviteBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#FFFFFF',
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
  mediaFileBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 4,
    maxWidth: 220,
  },
  mediaFileBubbleText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#0F172A',
    flexShrink: 1,
  },
  mediaModalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 28 : 18,
    height: '80%',
  },
  mediaModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  mediaModalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  mediaModalSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  mediaCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  uploadActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  uploadActionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  uploadingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 10,
  },
  uploadingBannerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#065F46',
  },
  mediaSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
    marginBottom: 10,
  },
  mediaSearchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
  },
  mediaTabsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  mediaTabPill: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  mediaTabPillActive: {
    backgroundColor: '#DCFCE7',
  },
  mediaTabText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  mediaTabTextActive: {
    color: '#00875A',
    fontWeight: '700',
  },
  mediaEmptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    gap: 8,
  },
  mediaEmptyText: {
    fontSize: 12.5,
    color: '#94A3B8',
    fontWeight: '500',
  },
  mediaGridCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 8,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  mediaGridCardActive: {
    borderColor: '#00B67A',
    backgroundColor: '#ECFDF5',
  },
  mediaThumbBox: {
    height: 86,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 6,
    position: 'relative',
  },
  mediaThumbImg: {
    width: '100%',
    height: '100%',
  },
  mediaSelectedCheck: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  mediaGridName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  mediaGridSize: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 1,
  },
  mediaSendBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  mediaCaptionInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    fontSize: 13,
    color: '#0F172A',
  },
  mediaSendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#00875A',
    paddingHorizontal: 16,
    height: 42,
    borderRadius: 12,
  },
  quotedBoxLight: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 7,
    marginBottom: 6,
    gap: 8,
  },
  quotedBoxDark: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
    borderRadius: 8,
    padding: 7,
    marginBottom: 6,
    gap: 8,
  },
  quotedAccentBar: {
    width: 3.5,
    alignSelf: 'stretch',
    borderRadius: 2,
    backgroundColor: '#00875A',
  },
  quotedSenderLight: { fontSize: 11, fontWeight: '800', color: '#00875A', marginBottom: 1 },
  quotedSenderDark: { fontSize: 11, fontWeight: '800', color: '#A7F3D0', marginBottom: 1 },
  quotedTextLight: { fontSize: 11.5, color: '#475569' },
  quotedTextDark: { fontSize: 11.5, color: '#ECFDF5' },
  quotedThumb: { width: 34, height: 34, borderRadius: 6, backgroundColor: '#E2E8F0' },
  replyPreviewBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 8,
  },
  atTagMenu: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  atTagHeader: { fontSize: 10.5, fontWeight: '700', color: '#64748B', marginBottom: 4 },
  atTagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    maxWidth: 170,
  },
  atTagChipText: { fontSize: 12, fontWeight: '600', color: '#065F46' },
  mediaSendBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
});
