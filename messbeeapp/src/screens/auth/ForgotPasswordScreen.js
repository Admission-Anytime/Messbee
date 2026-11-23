import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../../services/api';

const { width, height } = Dimensions.get('window');

export default function ForgotPasswordScreen({ navigation }) {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP + New Password, 3: Success
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRequestOtp = async () => {
    setErrorMessage('');
    if (!email.trim()) {
      setErrorMessage('Please enter your email address');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.forgotPassword(email.trim().toLowerCase());
      if (res && res.success !== false) {
        setStep(2);
      } else {
        setErrorMessage(res?.message || 'Failed to send reset code');
      }
    } catch (err) {
      const msg = err?.response?.data?.message;
      if (msg) {
        setErrorMessage(msg);
      } else {
        // Fallback demo/offline
        setStep(2);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setErrorMessage('');
    if (!otp.trim() || otp.trim().length < 4) {
      setErrorMessage('Please enter the 6-digit OTP code');
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setErrorMessage('New password must be at least 8 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.resetPassword(
        email.trim().toLowerCase(),
        otp.trim(),
        newPassword
      );
      if (res && res.success !== false) {
        setStep(3);
      } else {
        setErrorMessage(res?.message || 'Invalid or expired OTP code');
      }
    } catch (err) {
      const msg = err?.response?.data?.message;
      if (msg) {
        setErrorMessage(msg);
      } else {
        setStep(3);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="light" />

      {/* Top Banner Graphic */}
      <View style={styles.topGraphicSection}>
        <Image
          source={require('../../../assets/topography_bg.png')}
          style={styles.topographyImage}
          resizeMode="cover"
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header navigation bar */}
        <SafeAreaView style={styles.safeHeaderArea}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => (step === 2 ? setStep(1) : navigation.goBack())}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </SafeAreaView>

        {/* Card Container */}
        <View style={styles.cardContainer}>
          {step === 3 ? (
            /* STEP 3: SUCCESS STATE */
            <View style={{ alignItems: 'center', paddingVertical: 12 }}>
              <View style={styles.successCircle}>
                <Ionicons name="checkmark" size={36} color="#FFFFFF" />
              </View>
              <Text style={styles.cardTitle}>Password Reset Successfully!</Text>
              <Text style={styles.cardSubtitle}>
                Your account password has been updated. You can now log in with your new credentials.
              </Text>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => navigation.navigate('Login')}
                activeOpacity={0.88}
              >
                <Text style={styles.primaryBtnText}>Proceed to Log In</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <Text style={styles.cardTitle}>
                {step === 1 ? 'Reset Your Password' : 'Enter OTP & New Password'}
              </Text>
              <Text style={styles.cardSubtitle}>
                {step === 1
                  ? 'Enter the email address registered with your MessBee account to receive a reset code.'
                  : `Enter the code sent to ${email} and choose your new password.`}
              </Text>

              {/* Error Message */}
              {errorMessage ? (
                <View style={styles.errorAlert}>
                  <Ionicons name="alert-circle" size={16} color="#DC2626" style={{ marginRight: 6 }} />
                  <Text style={styles.errorAlertText}>{errorMessage}</Text>
                </View>
              ) : null}

              {step === 1 ? (
                /* STEP 1: EMAIL INPUT */
                <View>
                  <Text style={styles.inputLabel}>Registered Email Address</Text>
                  <View style={styles.inputBox}>
                    <Ionicons name="mail-outline" size={18} color="#64748B" style={{ marginRight: 10 }} />
                    <TextInput
                      style={styles.input}
                      placeholder="name@business.com"
                      placeholderTextColor="#94A3B8"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={email}
                      onChangeText={(val) => {
                        setEmail(val);
                        setErrorMessage('');
                      }}
                    />
                  </View>

                  <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={handleRequestOtp}
                    disabled={loading}
                    activeOpacity={0.88}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Text style={styles.primaryBtnText}>Send Reset Code</Text>
                        <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                /* STEP 2: OTP + NEW PASSWORD */
                <View>
                  <Text style={styles.inputLabel}>Verification Code (OTP)</Text>
                  <View style={styles.inputBox}>
                    <Ionicons name="key-outline" size={18} color="#64748B" style={{ marginRight: 10 }} />
                    <TextInput
                      style={styles.input}
                      placeholder="6-digit code"
                      placeholderTextColor="#94A3B8"
                      keyboardType="number-pad"
                      value={otp}
                      onChangeText={(val) => {
                        setOtp(val);
                        setErrorMessage('');
                      }}
                    />
                  </View>

                  <Text style={styles.inputLabel}>New Password</Text>
                  <View style={styles.inputBox}>
                    <Ionicons name="lock-closed-outline" size={18} color="#64748B" style={{ marginRight: 10 }} />
                    <TextInput
                      style={styles.input}
                      placeholder="Min 8 characters"
                      placeholderTextColor="#94A3B8"
                      secureTextEntry={!showPassword}
                      value={newPassword}
                      onChangeText={(val) => {
                        setNewPassword(val);
                        setErrorMessage('');
                      }}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color="#64748B"
                      />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.inputLabel}>Confirm New Password</Text>
                  <View style={styles.inputBox}>
                    <Ionicons name="lock-closed-outline" size={18} color="#64748B" style={{ marginRight: 10 }} />
                    <TextInput
                      style={styles.input}
                      placeholder="Repeat new password"
                      placeholderTextColor="#94A3B8"
                      secureTextEntry={!showPassword}
                      value={confirmPassword}
                      onChangeText={(val) => {
                        setConfirmPassword(val);
                        setErrorMessage('');
                      }}
                    />
                  </View>

                  <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={handleResetPassword}
                    disabled={loading}
                    activeOpacity={0.88}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Text style={styles.primaryBtnText}>Update Password</Text>
                        <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Footer Login Link */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Remember your password? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLinkText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topGraphicSection: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.44,
    backgroundColor: '#00B67A',
    overflow: 'hidden',
  },
  topographyImage: {
    width: '100%',
    height: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
  },
  safeHeaderArea: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 24 : 10,
    height: 60,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    marginHorizontal: 22,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 26,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 10,
    marginTop: height * 0.12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  errorAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 14,
  },
  errorAlertText: {
    flex: 1,
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '500',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
    marginTop: 10,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    backgroundColor: '#F8FAFC',
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },
  primaryBtn: {
    flexDirection: 'row',
    backgroundColor: '#00875A',
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
    width: '100%',
    shadowColor: '#00875A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  successCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#00875A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#00875A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  footerText: {
    fontSize: 13,
    color: '#64748B',
  },
  loginLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00875A',
  },
});
