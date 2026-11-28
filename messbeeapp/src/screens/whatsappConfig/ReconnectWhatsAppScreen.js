import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Animated,
  Easing,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { whatsappConfigService } from '../../services/api';

export default function ReconnectWhatsAppScreen({ navigation, route }) {
  // Steps: 1 = Details, 2 = Permissions, 3 = In Progress, 4 = Success
  const [step, setStep] = useState(1);
  const [progressStep, setProgressStep] = useState(1); // 1 = Auth confirmed, 2 = Validating, 3 = Restoring
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [connecting, setConnecting] = useState(false);

  // Rotation animation for spinner in step 3
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (step === 3) {
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      // Sequenced simulation and real DB sync
      const timer1 = setTimeout(() => {
        setProgressStep(2); // Validating account
      }, 1000);

      const timer2 = setTimeout(() => {
        setProgressStep(3); // Restoring webhooks
      }, 2200);

      const timer3 = setTimeout(async () => {
        try {
          // Re-enable / test connection via API
          await whatsappConfigService.testConnection();
        } catch (err) {
          console.log('Reconnect test connection:', err.message);
        }
        setStep(4); // WhatsApp is connected
      }, 3400);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [step]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleBack = () => {
    if (step === 1) {
      navigation.goBack();
    } else if (step === 2) {
      setStep(1);
    } else if (step === 3) {
      setStep(2);
    } else if (step === 4) {
      navigation.navigate('WhatsAppConfig', { status: 'Active' });
    }
  };

  const handleReturnToConfig = () => {
    navigation.navigate('WhatsAppConfig', { status: 'Active', reconnected: true });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        {step < 4 ? (
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="chevron-back" size={24} color="#0F172A" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
        <View style={styles.headerTitleCol}>
          <Text style={styles.headerTitle}>Reconnect WhatsApp</Text>
          <Text style={styles.headerSubtitle}>Restore your messaging services</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.mainContainer}>
        {/* ================= STEP 1: BUSINESS ACCOUNT DETAILS ================= */}
        {step === 1 && (
          <View style={styles.stepContent}>
            {/* Top Green WhatsApp Icon with Link Badge */}
            <View style={styles.whatsappIconWrapper}>
              <View style={styles.whatsappSquircle}>
                <Ionicons name="logo-whatsapp" size={36} color="#FFFFFF" />
              </View>
              <View style={styles.linkSmallBadge}>
                <Ionicons name="link-outline" size={14} color="#2563EB" />
              </View>
            </View>

            <Text style={styles.stepHeading}>Reconnect your business account</Text>
            <Text style={styles.stepSubtext}>
              You'll be guided through a secure authorization flow. No real Meta connection is made in this prototype.
            </Text>

            {/* Account Info Card */}
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Business Account</Text>
                <Text style={styles.infoValue}>MessBee Business</Text>
              </View>

              <View style={styles.infoDivider} />

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Registered Phone</Text>
                <Text style={styles.infoValue}>+1 (415) 555-0198</Text>
              </View>

              <View style={styles.infoDivider} />

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Current Status</Text>
                <View style={styles.disconnectedPill}>
                  <View style={styles.redDot} />
                  <Text style={styles.disconnectedPillText}>Disconnected</Text>
                </View>
              </View>

              <View style={styles.infoDivider} />

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Last Successful Sync</Text>
                <Text style={styles.infoValue}>Today, 10:42 AM</Text>
              </View>
            </View>

            <View style={{ flex: 1 }} />

            {/* Bottom Button */}
            <TouchableOpacity
              style={styles.blueButton}
              onPress={() => setStep(2)}
              activeOpacity={0.85}
            >
              <Ionicons name="logo-whatsapp" size={19} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.blueButtonText}>Reconnect with WhatsApp</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ================= STEP 2: CONTINUE WITH META ================= */}
        {step === 2 && (
          <View style={styles.stepContent}>
            {/* Blue Shield Icon */}
            <View style={styles.shieldSquircle}>
              <Ionicons name="shield-checkmark" size={34} color="#FFFFFF" />
            </View>

            <Text style={styles.sectionTag}>SECURE AUTHORIZATION</Text>
            <Text style={styles.stepHeading}>Continue with Meta</Text>
            <Text style={styles.stepSubtext}>
              Review the requested business permissions before continuing
            </Text>

            {/* Permissions List Card */}
            <View style={styles.permissionsCard}>
              <View style={styles.permRow}>
                <Ionicons name="checkmark" size={18} color="#00B67A" style={{ marginRight: 10 }} />
                <Text style={styles.permText}>Manage WhatsApp business account</Text>
              </View>

              <View style={styles.permDivider} />

              <View style={styles.permRow}>
                <Ionicons name="checkmark" size={18} color="#00B67A" style={{ marginRight: 10 }} />
                <Text style={styles.permText}>Access registered phone numbers</Text>
              </View>

              <View style={styles.permDivider} />

              <View style={styles.permRow}>
                <Ionicons name="checkmark" size={18} color="#00B67A" style={{ marginRight: 10 }} />
                <Text style={styles.permText}>Configure webhook subscriptions</Text>
              </View>
            </View>

            <View style={{ flex: 1 }} />

            {/* Authorize & Continue Button */}
            <TouchableOpacity
              style={styles.blueButton}
              onPress={() => {
                setStep(3);
                setProgressStep(1);
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.blueButtonText}>Authorize & Continue</Text>
            </TouchableOpacity>

            {/* Preview Connection Error Link */}
            <TouchableOpacity
              style={styles.textLink}
              onPress={() => setShowErrorModal(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.textLinkMuted}>Preview Connection Error</Text>
            </TouchableOpacity>

            {/* Cancel Connection Link */}
            <TouchableOpacity
              style={[styles.textLink, { marginTop: 4 }]}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Text style={styles.textLinkDark}>Cancel Connection</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ================= STEP 3: CONNECTING IN PROGRESS ================= */}
        {step === 3 && (
          <View style={styles.stepContent}>
            {/* Circular Green Progress Spinner */}
            <View style={styles.progressSpinnerWrapper}>
              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <View style={styles.progressRing}>
                  <View style={styles.progressRingActive} />
                </View>
              </Animated.View>
            </View>

            <Text style={styles.sectionTag}>CONNECTION IN PROGRESS</Text>
            <Text style={styles.stepHeading}>Connecting your account</Text>
            <Text style={styles.stepSubtext}>
              Verifying credentials and restoring event subscriptions...
            </Text>

            {/* Checklist Progress Card */}
            <View style={styles.progressCheckCard}>
              {/* Item 1: Authorization confirmed */}
              <View style={styles.checkRow}>
                <Ionicons name="checkmark" size={18} color="#00B67A" style={{ marginRight: 10 }} />
                <Text style={styles.checkDoneText}>Authorization confirmed</Text>
              </View>

              <View style={styles.checkDivider} />

              {/* Item 2: Validating account */}
              <View style={styles.checkRow}>
                {progressStep >= 3 ? (
                  <Ionicons name="checkmark" size={18} color="#00B67A" style={{ marginRight: 10 }} />
                ) : (
                  <View style={styles.activeDotOutline}>
                    <View style={styles.activeDotFill} />
                  </View>
                )}
                <Text style={progressStep >= 2 ? styles.checkDoneText : styles.checkPendingText}>
                  Validating account
                </Text>
              </View>

              <View style={styles.checkDivider} />

              {/* Item 3: Restoring webhooks */}
              <View style={styles.checkRow}>
                {progressStep >= 3 ? (
                  <View style={styles.activeDotOutline}>
                    <View style={styles.activeDotFill} />
                  </View>
                ) : (
                  <View style={styles.pendingCircle} />
                )}
                <Text style={progressStep >= 3 ? styles.checkDoneText : styles.checkPendingText}>
                  Restoring webhooks
                </Text>
              </View>
            </View>

            <View style={{ flex: 1 }} />

            {/* Cancel Connection */}
            <TouchableOpacity
              style={styles.textLink}
              onPress={() => setStep(1)}
              activeOpacity={0.7}
            >
              <Text style={styles.textLinkDark}>Cancel Connection</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ================= STEP 4: WHATSAPP IS CONNECTED (Image 2) ================= */}
        {step === 4 && (
          <View style={styles.stepContent}>
            {/* Large Green Checkmark Circle */}
            <View style={styles.successIconCircle}>
              <Ionicons name="checkmark" size={42} color="#FFFFFF" />
            </View>

            <Text style={styles.sectionTag}>CONNECTION RESTORED</Text>
            <Text style={styles.stepHeading}>WhatsApp is connected</Text>
            <Text style={styles.stepSubtext}>
              Your business account is active and ready to process messages.
            </Text>

            <View style={{ flex: 1 }} />

            {/* Solid Green Return Button */}
            <TouchableOpacity
              style={styles.greenButton}
              onPress={handleReturnToConfig}
              activeOpacity={0.85}
            >
              <Text style={styles.greenButtonText}>Return to Configuration</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Error Preview Modal */}
      <Modal
        visible={showErrorModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.errorDialog}>
            <View style={styles.errorIconCircle}>
              <Ionicons name="alert-circle" size={32} color="#EF4444" />
            </View>
            <Text style={styles.errorTitle}>Connection Failed</Text>
            <Text style={styles.errorDesc}>
              Meta Cloud API was unable to verify the system user access token or WABA ID. Please verify your credentials in Business Manager.
            </Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => setShowErrorModal(false)}
            >
              <Text style={styles.retryBtnText}>Try Again</Text>
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
    backgroundColor: '#F8FAFC',
    paddingTop: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  headerTitleCol: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  mainContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 24,
  },
  stepContent: {
    flex: 1,
    alignItems: 'center',
  },

  // WhatsApp Squircle Icon
  whatsappIconWrapper: {
    position: 'relative',
    marginBottom: 20,
  },
  whatsappSquircle: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: '#00B67A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00B67A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  linkSmallBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  // Shield Icon
  shieldSquircle: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },

  sectionTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  stepHeading: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },
  stepSubtext: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
    paddingHorizontal: 16,
  },

  // Details Info Card
  infoCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  disconnectedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  redDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
    marginRight: 5,
  },
  disconnectedPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EF4444',
  },

  // Permissions Card
  permissionsCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  permRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  permDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  permText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
  },

  // Progress Spinner & Checklist
  progressSpinnerWrapper: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  progressRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 4,
    borderColor: '#E2E8F0',
    borderTopColor: '#00B67A',
  },
  progressRingActive: {
    flex: 1,
  },
  progressCheckCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  checkDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  checkDoneText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0F172A',
  },
  checkPendingText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#94A3B8',
  },
  activeDotOutline: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginLeft: 1,
  },
  activeDotFill: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563EB',
  },
  pendingCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    marginRight: 12,
    marginLeft: 1,
  },

  // Success Screen (Step 4)
  successIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#00B67A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#00B67A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },

  // Action Buttons
  blueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 12,
  },
  blueButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  greenButton: {
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
    marginBottom: 12,
  },
  greenButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  textLink: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  textLinkMuted: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
  },
  textLinkDark: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
  },

  // Error modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorDialog: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  errorIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  errorDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  retryBtn: {
    width: '100%',
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  retryBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
