import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

export default function TemplateSuccessScreen({ route, navigation }) {
  const { template, contact, renderedText } = route.params || {};

  const handleReturnToChat = () => {
    navigation.navigate('ChatDetail', {
      chat: contact,
      newTemplateMsg: {
        templateName: template?.name || 'admission_welcome_v1',
        text: renderedText || template?.body || 'Hello! Thank you for contacting Admission Anytime.',
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.contentContainer}>
        {/* Double Glowing Ring Graphic */}
        <View style={styles.glowRingOuter}>
          <View style={styles.glowRingInner}>
            <View style={styles.greenCircle}>
              <Ionicons name="checkmark" size={42} color="#FFFFFF" />
            </View>
          </View>
        </View>

        <Text style={styles.messbeeTag}>MESSBEE</Text>
        <Text style={styles.heading}>Message sent successfully</Text>
        <Text style={styles.subHeading}>
          Your approved WhatsApp template was added to the conversation.
        </Text>

        {/* Summary Details Card */}
        <View style={styles.summaryCard}>
          <View style={styles.cardRow}>
            <Ionicons name="document-text-outline" size={18} color="#00875A" style={{ marginRight: 10 }} />
            <Text style={styles.cardValueText}>{template?.name || 'admission_welcome_v1'}</Text>
          </View>

          <View style={styles.cardDivider} />

          <View style={styles.cardRow}>
            <Ionicons name="person-outline" size={18} color="#00875A" style={{ marginRight: 10 }} />
            <Text style={styles.cardValueText}>{contact?.phone || contact?.name || '919350157447'}</Text>
          </View>
        </View>

        <View style={{ flex: 1 }} />

        {/* Return Button */}
        <TouchableOpacity
          style={styles.returnBtn}
          onPress={handleReturnToChat}
          activeOpacity={0.85}
        >
          <Text style={styles.returnBtnText}>Return to chat</Text>
          <Ionicons name="chevron-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? 36 : 0,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 24,
  },
  glowRingOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  glowRingInner: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  greenCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#00875A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00875A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  messbeeTag: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#00875A',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },
  subHeading: {
    fontSize: 13.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  summaryCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  cardValueText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#0F172A',
  },
  returnBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00875A',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#00875A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  returnBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
