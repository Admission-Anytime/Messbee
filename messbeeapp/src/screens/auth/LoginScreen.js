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
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { authService, getServerEnvironment, setServerEnvironment } from '../../services/api';
import { isValidEmail } from '../../utils/validation';

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('password'); // 'password' | 'otp'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [serverEnv, setServerEnv] = useState(getServerEnvironment());

  const toggleServerEnv = async () => {
    const next = serverEnv === 'live' ? 'local' : 'live';
    await setServerEnvironment(next);
    setServerEnv(next);
    setErrorMessage('');
  };

  const handleLogin = async () => {
    setErrorMessage('');
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setErrorMessage('Please enter your email address');
      return;
    }
    if (!isValidEmail(cleanEmail)) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    if (activeTab === 'password') {
      if (!password) {
        setErrorMessage('Please enter your password');
        return;
      }

      setLoading(true);
      try {
        const response = await authService.loginWithPassword(cleanEmail, password);
        if (response?.success || response?.accessToken || response?.token || response?.tokens?.accessToken) {
          navigation.replace('MainTabs');
        } else {
          setErrorMessage(response?.message || 'Invalid credentials. Please try again.');
        }
      } catch (error) {
        console.log('Login error:', error?.response?.data || error.message);
        const apiMsg = error?.response?.data?.message;
        setErrorMessage(apiMsg || error.message || 'Login failed. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Email OTP flow (1:1 with web backend /api/auth/login/request-otp)
    setLoading(true);
    try {
      const response = await authService.requestLoginOTP(cleanEmail);
      if (response?.success) {
        navigation.navigate('OtpVerification', {
          contact: cleanEmail,
          email: cleanEmail,
          method: 'email',
        });
      } else {
        setErrorMessage(response?.message || 'Failed to send OTP. Please try again.');
      }
    } catch (error) {
      console.log('Login OTP request error:', error?.response?.data || error.message);
      const apiMsg = error?.response?.data?.message;
      setErrorMessage(apiMsg || error.message || 'Failed to send OTP. Please check your connection.');
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

      {/* Top Half: Emerald Green with Topography Contour Wavy Lines */}
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
        bounces={false}
      >
        <SafeAreaView style={styles.safeHeaderArea}>
          {/* Back button if can go back */}
          {navigation.canGoBack() && (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </SafeAreaView>

        {/* Elevated White Login Card */}
        <View style={styles.cardContainer}>
          <Text style={styles.cardTitle}>Login to Your Account</Text>

          {/* Segmented Tab Selector: Password vs Email OTP */}
          <View style={styles.tabSelector}>
            <TouchableOpacity
              style={[
                styles.tabBtn,
                activeTab === 'password' ? styles.tabBtnActive : styles.tabBtnInactive,
              ]}
              onPress={() => {
                setActiveTab('password');
                setErrorMessage('');
              }}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabBtnText,
                  activeTab === 'password' ? styles.tabBtnTextActive : styles.tabBtnTextInactive,
                ]}
              >
                Password
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabBtn,
                activeTab === 'otp' ? styles.tabBtnActive : styles.tabBtnInactive,
              ]}
              onPress={() => {
                setActiveTab('otp');
                setErrorMessage('');
              }}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabBtnText,
                  activeTab === 'otp' ? styles.tabBtnTextActive : styles.tabBtnTextInactive,
                ]}
              >
                Email OTP
              </Text>
            </TouchableOpacity>
          </View>

          {/* Email Input */}
          <View style={styles.inputBox}>
            <Ionicons name="mail-outline" size={18} color="#9CA3AF" style={{ marginRight: 10 }} />
            <TextInput
              style={styles.textInput}
              placeholder="Enter your email"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setErrorMessage('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password Input (shown in Password mode) */}
          {activeTab === 'password' && (
            <View style={[styles.inputBox, { marginTop: 12 }]}>
              <Ionicons name="lock-closed-outline" size={18} color="#9CA3AF" style={{ marginRight: 10 }} />
              <TextInput
                style={styles.textInput}
                placeholder="Enter your password"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setErrorMessage('');
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>
          )}

          {/* Forgot Password Link */}
          <View style={{ alignItems: 'flex-end', marginTop: 10, marginBottom: 4 }}>
            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: '#00875A' }}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          {/* Error Message if any */}
          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

          {/* Login / Send OTP Action Button */}
          <TouchableOpacity
            style={styles.sendOtpBtn}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.88}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.sendOtpBtnText}>
                {activeTab === 'password' ? 'Login' : 'Send OTP'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Server Environment Switcher (Dev builds only) */}
          {__DEV__ && (
            <TouchableOpacity
              onPress={toggleServerEnv}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 14,
                paddingVertical: 6,
                gap: 6,
              }}
              activeOpacity={0.7}
            >
              <Ionicons
                name={serverEnv === 'live' ? 'globe-outline' : 'laptop-outline'}
                size={14}
                color="#64748B"
              />
              <Text style={{ fontSize: 12, color: '#64748B', fontWeight: '600' }}>
                Server: {serverEnv === 'live' ? 'Live (webservices.messbee.com)' : 'Local Dev (:5002)'} • Tap to switch
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Bottom Footer: Don't have account? Create Account */}
        <View style={styles.footerWrap}>
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don't have account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.createAccountText}>Create Account</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.legalLinksRow}>
            <TouchableOpacity
              onPress={() => navigation.navigate('PrivacyPolicy')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.legalLinkText}>Privacy Policy</Text>
            </TouchableOpacity>
            <Text style={styles.legalDot}>•</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('TermsConditions')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.legalLinkText}>Terms & Conditions</Text>
            </TouchableOpacity>
          </View>
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
    paddingTop: 10,
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
    marginTop: height * 0.14,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 20,
  },
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 18,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBtnActive: {
    backgroundColor: '#00B67A',
  },
  tabBtnInactive: {
    backgroundColor: 'transparent',
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
  },
  tabBtnTextInactive: {
    color: '#4B5563',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 16,
  },
  countryCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryCodeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  verticalDivider: {
    width: 1,
    height: 22,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
    paddingVertical: 0,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  sendOtpBtn: {
    backgroundColor: '#00B67A',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00B67A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  sendOtpBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  footerWrap: {
    marginTop: 28,
    alignItems: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  legalLinksRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
    gap: 10,
  },
  legalLinkText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  legalDot: {
    fontSize: 12,
    color: '#94A3B8',
  },
  footerText: {
    fontSize: 13,
    color: '#6B7280',
  },
  createAccountText: {
    fontSize: 13,
    color: '#F97316',
    fontWeight: '700',
  },
});
