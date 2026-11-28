import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { chatService } from '../../services/api';

export default function ConfirmSendTemplateScreen({ route, navigation }) {
  const { template, contact, variables, renderedText } = route.params || {};

  const [deliveryOption, setDeliveryOption] = useState('now'); // 'now' or 'later'
  const [sending, setSending] = useState(false);

  const handleSendMessage = async () => {
    const recipientPhone = contact?.phone || contact?.whatsappId || contact?.whatsapp;
    if (!contact?._id && !recipientPhone) {
      Alert.alert('Error', 'Missing recipient chat ID or phone number. Please reopen the chat and try again.');
      return;
    }

    setSending(true);
    try {
      const varKeys = Object.keys(variables || {}).sort((a, b) => Number(a) - Number(b));
      const components = [];
      const hType = String(template?.headerType || '').toLowerCase();
      if (['image', 'video', 'document'].includes(hType) && /^https?:\/\//i.test(String(template?.headerMediaUrl || ''))) {
        components.push({
          type: 'header',
          parameters: [
            {
              type: hType,
              [hType]: { link: template.headerMediaUrl },
            },
          ],
        });
      }
      if (varKeys.length > 0) {
        components.push({
          type: 'body',
          parameters: varKeys.map((k) => ({
            type: 'text',
            text: String(variables[k] || ''),
          })),
        });
      }

      await chatService.sendTemplate({
        chatId: contact?._id,
        to: recipientPhone,
        templateName: template?.whatsappTemplateName || template?.name,
        languageCode: template?.language || 'en_US',
        components,
      });

      navigation.navigate('TemplateSuccess', {
        template,
        contact,
        renderedText,
      });
    } catch (err) {
      const errCode = err?.response?.data?.errorCode;
      if (String(errCode) === '131026' || String(errCode) === '13026') {
        Alert.alert(
          'User Not on WhatsApp',
          'This user is not using WhatsApp. Invite them to join WhatsApp or connect with you on MessBee.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Invite',
              onPress: () =>
                Share.share({
                  title: 'Invite to WhatsApp & MessBee',
                  message: `Hi ${contact?.name ? `${contact.name}, ` : ''}we tried reaching you on WhatsApp to share an important update. Join WhatsApp or connect with us directly on MessBee: https://messbee.com`,
                }),
            },
          ]
        );
      } else {
        const errMsg =
          err?.response?.data?.error ||
          err?.response?.data?.message ||
          err?.response?.data?.rawError?.message ||
          err.message ||
          'Failed to send template.';
        Alert.alert('Template Send Failed', errMsg);
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* Header (Matching Image 2 Screen 6) */}
      <View style={styles.header}>
        <View style={styles.headerTitleBox}>
          <View style={styles.templateIconSquare}>
            <Ionicons name="document-text-outline" size={18} color="#00875A" />
          </View>
          <View>
            <Text style={styles.headerTag}>MESSBEE</Text>
            <Text style={styles.headerTitle}>Confirm & Send Message</Text>
          </View>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('ChatDetail', { chat: contact })} style={styles.closeBtn}>
          <Ionicons name="close" size={22} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Recipient Summary Card */}
        <View style={styles.recipientCard}>
          <View style={styles.recipientAvatar}>
            <Ionicons name="person-outline" size={18} color="#00875A" />
          </View>
          <View style={styles.recipientInfo}>
            <Text style={styles.recipientTag}>RECIPIENT SUMMARY</Text>
            <Text style={styles.recipientName}>Sending to: {contact?.name || '919350157447'}</Text>
            <Text style={styles.recipientPhone}>{contact?.phone || '+91 9350157447'}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.editLink}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Message Preview Card */}
        <Text style={styles.sectionHeaderTitle}>MESSAGE PREVIEW</Text>
        <View style={styles.previewBox}>
          <View style={styles.previewMetaHeader}>
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={12} color="#00875A" style={{ marginRight: 4 }} />
              <Text style={styles.verifiedText}>Verified Sender</Text>
            </View>
            <Text style={styles.previewTemplateName}>{template?.name || 'admission_welcome_v1'}</Text>
          </View>

          <Text style={styles.previewBodyText}>
            {renderedText || 'Hello! Thank you for contacting Admission Anytime.'}
          </Text>
          <Text style={styles.previewTimeText}>10:48 AM ✓✓</Text>
        </View>

        {/* Delivery Options */}
        <Text style={styles.sectionHeaderTitle}>DELIVERY OPTIONS</Text>
        
        {/* Option 1: Send Now */}
        <TouchableOpacity
          style={[styles.deliveryCard, deliveryOption === 'now' && styles.deliveryCardActive]}
          onPress={() => setDeliveryOption('now')}
          activeOpacity={0.8}
        >
          <Ionicons name="send" size={18} color="#00875A" style={{ marginRight: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.deliveryTitle}>Send Now</Text>
            <Text style={styles.deliveryDesc}>Message will be dispatched immediately</Text>
          </View>
          <View style={[styles.radioOutline, deliveryOption === 'now' && styles.radioActive]}>
            {deliveryOption === 'now' && <View style={styles.radioDot} />}
          </View>
        </TouchableOpacity>

        {/* Option 2: Schedule for Later */}
        <TouchableOpacity
          style={[styles.deliveryCard, deliveryOption === 'later' && styles.deliveryCardActive]}
          onPress={() => setDeliveryOption('later')}
          activeOpacity={0.8}
        >
          <Ionicons name="calendar-outline" size={18} color="#64748B" style={{ marginRight: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.deliveryTitle}>Schedule for Later</Text>
            <Text style={styles.deliveryDesc}>Select a specific date and time</Text>
          </View>
          <View style={[styles.radioOutline, deliveryOption === 'later' && styles.radioActive]}>
            {deliveryOption === 'later' && <View style={styles.radioDot} />}
          </View>
        </TouchableOpacity>

        {/* Cost & Balance Banner */}
        <View style={styles.costBanner}>
          <Ionicons name="information-circle-outline" size={18} color="#D97706" style={{ marginRight: 10 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.costTitle}>Estimated cost: ₹0.00 MGC credit</Text>
            <Text style={styles.costDesc}>Final cost depends on applicable template and delivery rules.</Text>
          </View>
          <View style={styles.balanceBox}>
            <Text style={styles.balanceLabel}>Balance</Text>
            <Text style={styles.balanceValue}>₹4,992.40</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footerBar}>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sendBtn}
          onPress={handleSendMessage}
          disabled={sending}
          activeOpacity={0.85}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="send" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.sendBtnText}>Send Message</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  headerTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  templateIconSquare: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerTag: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#00875A',
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  recipientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  recipientAvatar: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recipientInfo: {
    flex: 1,
  },
  recipientTag: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
  },
  recipientName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 1,
  },
  recipientPhone: {
    fontSize: 12,
    color: '#64748B',
  },
  editLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00875A',
  },
  sectionHeaderTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  previewBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    borderRadius: 16,
    padding: 14,
    marginBottom: 24,
  },
  previewMetaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00875A',
  },
  previewTemplateName: {
    fontSize: 10,
    color: '#64748B',
  },
  previewBodyText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#064E3B',
    marginBottom: 6,
  },
  previewTimeText: {
    fontSize: 10,
    color: '#94A3B8',
    textAlign: 'right',
  },
  deliveryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  deliveryCardActive: {
    borderColor: '#00875A',
    backgroundColor: '#FAFCFA',
  },
  deliveryTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  deliveryDesc: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  radioOutline: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    borderColor: '#00875A',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00875A',
  },
  costBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 14,
    padding: 12,
    marginTop: 10,
    marginBottom: 20,
  },
  costTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },
  costDesc: {
    fontSize: 10.5,
    color: '#B45309',
    marginTop: 1,
  },
  balanceBox: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  balanceLabel: {
    fontSize: 9.5,
    color: '#92400E',
  },
  balanceValue: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#92400E',
  },
  footerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  cancelBtn: {
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  cancelBtnText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#64748B',
  },
  sendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00875A',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
  },
  sendBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
