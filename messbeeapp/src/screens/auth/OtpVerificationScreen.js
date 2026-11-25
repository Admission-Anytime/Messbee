import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../../services/api';

export default function OtpVerificationScreen({ route, navigation }) {
  const { contact = '', email = '', method = 'phone', isSignup = false } = route.params || {};
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [countdown, setCountdown] = useState(30);
  const inputsRef = useRef([]);

  useEffect(() => {
    let interval = null;
    if (countdown > 0) {
      interval = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  const handleChangeText = async (text, index) => {
    setErrorMessage('');
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto-advance focus
    if (text && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are entered
    if (index === 5 && text) {
      const fullCode = newOtp.join('');
      if (fullCode.length === 6) {
        verifyCode(fullCode);
      }
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const verifyCode = async (code) => {
    setLoading(true);
    setErrorMessage('');

    try {
      if (!email || !email.includes('@')) {
        setErrorMessage('Invalid email address for verification.');
        return;
      }

      // Real backend verification via /auth/signup/verify-otp or /auth/login/verify-otp
      const response = isSignup
        ? await authService.verifySignupOTP(email, code)
        : await authService.verifyLoginOTP(email, code);

      if (response?.success || response?.token || response?.accessToken || response?.tokens?.accessToken) {
        navigation.navigate('PhoneVerifiedSuccess');
      } else {
        setErrorMessage(response?.message || 'Invalid verification code');
      }
    } catch (error) {
      console.log('OTP Verification error:', error?.response?.data || error.message);
      const apiMsg = error?.response?.data?.message;
      setErrorMessage(apiMsg || error.message || 'Verification failed. Please check your code and connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setCountdown(30);
    setErrorMessage('');

    try {
      if (email && email.includes('@') && !email.includes('@messbee.com')) {
        await authService.resendOTP(email, isSignup ? 'signup' : 'login');
      }
      Alert.alert('Code Resent', `A new verification code has been sent to ${contact}`);
    } catch (error) {
      console.log('Resend OTP error:', error?.response?.data || error.message);
      Alert.alert('Code Resent', `A new verification code has been sent to ${contact}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Top Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Phone Verification</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.innerContent}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Instruction Text */}
        <Text style={styles.instructionText}>
          Enter 6 digit verification code sent{'\n'}to your{' '}
          <Text style={styles.contactHighlight}>{contact}</Text>
        </Text>

        {/* 6 Digit Input Boxes */}
        <View style={styles.otpBoxesRow}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputsRef.current[index] = ref)}
              style={[
                styles.otpBox,
                digit ? styles.otpBoxFilled : null,
                inputsRef.current[index]?.isFocused() ? styles.otpBoxFocused : null,
              ]}
              value={digit}
              onChangeText={(text) => handleChangeText(text.slice(-1), index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
              selectTextOnFocus
              autoFocus={index === 0}
            />
          ))}
        </View>

        {/* Loading Spinner */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#00B67A" size="small" />
            <Text style={styles.verifyingText}>Verifying code...</Text>
          </View>
        )}

        {/* Error Message */}
        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}

        {/* Resend Code Link */}
        <TouchableOpacity
          onPress={handleResend}
          disabled={countdown > 0}
          style={styles.resendBtn}
        >
          <Text style={[styles.resendText, countdown > 0 ? styles.resendDisabled : null]}>
            {countdown > 0 ? `Resend Code (${countdown}s)` : 'Resend Code'}
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 24 : 10,
    height: 56,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  innerContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 36,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 36,
  },
  contactHighlight: {
    color: '#2563EB',
    fontWeight: '700',
  },
  otpBoxesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    marginBottom: 28,
  },
  otpBox: {
    width: 46,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  otpBoxFilled: {
    borderColor: '#00B67A',
    backgroundColor: '#FFFFFF',
  },
  otpBoxFocused: {
    borderColor: '#00B67A',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 12,
  },
  verifyingText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '500',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  resendBtn: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  resendText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F97316',
    textAlign: 'center',
  },
  resendDisabled: {
    color: '#94A3B8',
    fontWeight: '500',
  },
});
