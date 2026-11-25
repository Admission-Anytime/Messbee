import React, { useState } from 'react';
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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { quickReplyService } from '../../services/api';
import { isValidShortcut, isValidUrl } from '../../utils/validation';

const RESPONSE_TYPES = [
  { id: 'Text', label: 'Text', icon: 'chatbubble-ellipses-outline' },
  { id: 'Image', label: 'Image', icon: 'image-outline' },
  { id: 'Sticker', label: 'Sticker', icon: 'happy-outline' },
  { id: 'Audio', label: 'Audio', icon: 'mic-outline' },
  { id: 'Video', label: 'Video', icon: 'videocam-outline' },
  { id: 'File', label: 'File', icon: 'document-text-outline' },
  { id: 'CTA URL', label: 'CTA URL', icon: 'open-outline' },
];

const VARIABLE_TAGS = ['{customer_name}', '{agent_name}', '{order_id}'];

export default function EditQuickReplyScreen({ navigation, route }) {
  const { reply } = route.params || {};

  const initialType =
    reply?.type === 'URL' || reply?.type === 'CTA URL'
      ? 'CTA URL'
      : reply?.type
      ? reply.type.charAt(0).toUpperCase() + reply.type.slice(1).toLowerCase()
      : 'Text';

  const [responseType, setResponseType] = useState(initialType);
  const [shortcut, setShortcut] = useState(reply?.shortcut || '');
  const [content, setContent] = useState(reply?.content || '');
  const [buttonLabel, setButtonLabel] = useState(reply?.buttonText || '');
  const [destinationUrl, setDestinationUrl] = useState(reply?.url || '');
  const [caption, setCaption] = useState(reply?.content || '');
  const [selectedImage, setSelectedImage] = useState(reply?.mediaUrl || null);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleShortcutChange = (val) => {
    setShortcut(val);
  };

  const handleInsertVariable = (tag) => {
    setContent((prev) => (prev ? `${prev} ${tag}` : tag));
  };

  const handleSave = async () => {
    const cleanShortcut = shortcut.trim();
    if (!cleanShortcut) {
      Alert.alert('Validation Error', 'Please enter a shortcut command.');
      return;
    }
    if (!isValidShortcut(cleanShortcut)) {
      Alert.alert('Validation Error', 'Shortcut command cannot contain spaces or special characters.');
      return;
    }

    const formattedShortcut = cleanShortcut.startsWith('/')
      ? cleanShortcut
      : `/${cleanShortcut}`;

    if (responseType === 'CTA URL') {
      if (!destinationUrl.trim()) {
        Alert.alert('Validation Error', 'Please enter a destination URL for the CTA.');
        return;
      }
      if (!isValidUrl(destinationUrl)) {
        Alert.alert('Validation Error', 'Destination URL must start with http:// or https://.');
        return;
      }
    } else if (responseType === 'Text' && !content.trim()) {
      Alert.alert('Validation Error', 'Please enter message content.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        shortcut: formattedShortcut,
        type: responseType === 'CTA URL' ? 'URL' : responseType.toUpperCase(),
        content: content.trim() || caption.trim(),
        buttonText: buttonLabel.trim() || 'View details',
        url: destinationUrl.trim(),
      };

      await quickReplyService.updateQuickReply(reply._id, payload);

      if (route.params?.onSuccess) {
        route.params.onSuccess();
      }
      navigation.goBack();
    } catch (err) {
      Alert.alert(
        'Error',
        err.response?.data?.message || err.message || 'Failed to update quick reply.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Quick Reply</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.subtitle}>
          Set message, media, and shortcut in one place.
        </Text>

        {/* Section: Response Type */}
        <Text style={styles.sectionTitle}>Response Type</Text>
        <View style={styles.typeGrid}>
          {RESPONSE_TYPES.map((t) => {
            const isSelected = responseType === t.id;
            return (
              <TouchableOpacity
                key={t.id}
                style={[styles.typeTile, isSelected && styles.typeTileActive]}
                onPress={() => setResponseType(t.id)}
              >
                <Ionicons
                  name={t.icon}
                  size={22}
                  color={isSelected ? '#00B67A' : '#64748B'}
                />
                <Text
                  style={[styles.typeTileLabel, isSelected && styles.typeTileLabelActive]}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Section: Shortcut */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Shortcut *</Text>
          <View style={styles.shortcutInputContainer}>
            <Text style={styles.shortcutPrefix}>/</Text>
            <TextInput
              style={styles.shortcutInput}
              placeholder="welcome"
              placeholderTextColor="#94A3B8"
              value={shortcut.startsWith('/') ? shortcut.slice(1) : shortcut}
              onChangeText={handleShortcutChange}
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Dynamic Section based on Response Type */}
        {responseType === 'CTA URL' ? (
          <View style={styles.dynamicSection}>
            <Text style={styles.sectionTitle}>CTA Configuration</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Button label *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="View details"
                placeholderTextColor="#94A3B8"
                value={buttonLabel}
                onChangeText={setButtonLabel}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Destination URL *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="https://example.com"
                placeholderTextColor="#94A3B8"
                value={destinationUrl}
                onChangeText={setDestinationUrl}
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Message</Text>
              <TextInput
                style={[styles.textInput, styles.multilineInput]}
                placeholder="Supporting message"
                placeholderTextColor="#94A3B8"
                value={content}
                onChangeText={setContent}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        ) : responseType === 'Image' ? (
          <View style={styles.dynamicSection}>
            <Text style={styles.sectionTitle}>Image Selection</Text>

            <TouchableOpacity
              style={styles.uploadBox}
              onPress={() => setSelectedImage('sample_image.png')}
            >
              <Ionicons
                name="cloud-upload-outline"
                size={32}
                color={selectedImage ? '#00B67A' : '#94A3B8'}
                style={{ marginBottom: 6 }}
              />
              <Text style={styles.uploadBoxTitle}>
                {selectedImage ? 'Image Selected' : 'Select Image'}
              </Text>
              <Text style={styles.uploadBoxSub}>
                Tap to simulate media selection
              </Text>
            </TouchableOpacity>

            <View style={[styles.inputGroup, { marginTop: 14 }]}>
              <Text style={styles.inputLabel}>Optional caption</Text>
              <TextInput
                style={[styles.textInput, styles.multilineInput]}
                placeholder="Add a caption..."
                placeholderTextColor="#94A3B8"
                value={caption}
                onChangeText={setCaption}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        ) : (
          <View style={styles.dynamicSection}>
            <View style={styles.messageContentHeader}>
              <Text style={styles.sectionTitle}>Message Content</Text>
              <Text style={styles.charCount}>{content.length} / 4096</Text>
            </View>

            {/* Variable Pills */}
            <View style={styles.varsRow}>
              {VARIABLE_TAGS.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={styles.varPill}
                  onPress={() => handleInsertVariable(tag)}
                >
                  <Text style={styles.varPillText}>{tag}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={[styles.textInput, styles.messageInput]}
              placeholder="Type message..."
              placeholderTextColor="#94A3B8"
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </View>
        )}

        {/* Preview Message Button */}
        <TouchableOpacity
          style={styles.previewBtn}
          onPress={() => setShowPreview(true)}
          activeOpacity={0.8}
        >
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={18}
            color="#00B67A"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.previewBtnText}>Preview Message</Text>
        </TouchableOpacity>

        {/* Action Buttons */}
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={saving}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Update Quick Reply</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* WhatsApp Message Preview Modal */}
      <Modal
        visible={showPreview}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPreview(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPreview(false)}
        >
          <View style={styles.previewSheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.previewHeader}>
              <Text style={styles.previewModalTitle}>Message Preview</Text>
              <TouchableOpacity onPress={() => setShowPreview(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.whatsappRoom}>
              <View style={styles.waChatBar}>
                <View style={styles.waAvatar}>
                  <Text style={styles.waAvatarText}>RA</Text>
                </View>
                <View>
                  <Text style={styles.waName}>Rahul</Text>
                  <Text style={styles.waStatus}>online</Text>
                </View>
              </View>

              <View style={styles.waChatArea}>
                <View style={styles.waBubble}>
                  <Text style={styles.waBubbleText}>
                    {content || caption || (buttonLabel ? `CTA: ${buttonLabel}` : 'Your message preview will appear here.')}
                  </Text>
                  <Text style={styles.waBubbleTime}>10:42 AM ✓✓</Text>
                </View>

                {responseType === 'CTA URL' && buttonLabel ? (
                  <View style={styles.waCtaBtn}>
                    <Ionicons name="open-outline" size={15} color="#00B67A" style={{ marginRight: 6 }} />
                    <Text style={styles.waCtaText}>{buttonLabel}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? 28 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 16,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  typeTile: {
    width: '22%',
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  typeTileActive: {
    borderColor: '#00B67A',
    backgroundColor: '#EDF9F2',
  },
  typeTileLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 6,
  },
  typeTileLabelActive: {
    color: '#00B67A',
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  shortcutInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 48,
    backgroundColor: '#FFFFFF',
  },
  shortcutPrefix: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00B67A',
    marginRight: 6,
  },
  shortcutInput: {
    flex: 1,
    fontSize: 15,
    color: '#1E293B',
  },
  dynamicSection: {
    marginTop: 4,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1E293B',
    backgroundColor: '#FFFFFF',
  },
  multilineInput: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  messageContentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  charCount: {
    fontSize: 11,
    color: '#94A3B8',
  },
  varsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  varPill: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 14,
  },
  varPillText: {
    fontSize: 12,
    color: '#00B67A',
    fontWeight: '500',
  },
  messageInput: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
  uploadBox: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#C6EED5',
    backgroundColor: '#F7FCF9',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadBoxTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  uploadBoxSub: {
    fontSize: 12,
    color: '#94A3B8',
  },
  previewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#C6EED5',
    backgroundColor: '#F7FCF9',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 24,
  },
  previewBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00B67A',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#00B67A',
    shadowColor: '#00B67A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  previewSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  previewModalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E293B',
  },
  whatsappRoom: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  waChatBar: {
    backgroundColor: '#075E54',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  waAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  waAvatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  waName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  waStatus: {
    color: '#A7F3D0',
    fontSize: 11,
  },
  waChatArea: {
    backgroundColor: '#EFEAE2',
    padding: 16,
    minHeight: 160,
    justifyContent: 'flex-end',
  },
  waBubble: {
    backgroundColor: '#DCF8C6',
    borderRadius: 12,
    borderTopRightRadius: 2,
    padding: 12,
    maxWidth: '85%',
    alignSelf: 'flex-end',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  waBubbleText: {
    fontSize: 14,
    color: '#1E293B',
    lineHeight: 20,
  },
  waBubbleTime: {
    fontSize: 10,
    color: '#64748B',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  waCtaBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
    marginTop: 6,
    maxWidth: '85%',
    borderWidth: 1,
    borderColor: '#00B67A',
  },
  waCtaText: {
    color: '#00B67A',
    fontSize: 13,
    fontWeight: '600',
  },
});
