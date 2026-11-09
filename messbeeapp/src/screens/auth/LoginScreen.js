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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

export default function LoginScreen({ navigation }) {
  const [authMethod, setAuthMethod] = useState('phone'); // 'email' | 'phone'
  const [phoneNumber, setPhoneNumber] = useState('8181756688');
  const [email, setEmail] = useState('');

  const handleSendOtp = () => {
    navigation.navigate('OtpVerification', {
      phone: phoneNumber,
      email: email,
      method: authMethod,
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Top Graphic Header */}
      <LinearGradient
        colors={['#06231A', '#0D3D2A', '#1A6B4A']}
        style={styles.headerGraphic}
      >
        <SafeAreaView style={styles.headerSafe}>
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => navigation.canGoBack() && navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.replace('MainTabs')}>
              <Text style={styles.skipText}>Skip Intro</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.brandContainer}>
            <View style={styles.logoPill}>
              <Ionicons name="chatbubbles" size={28} color="#25D366" />
              <Text style={styles.brandTitle}>Messbee</Text>
            </View>
            <Text style={styles.brandSubtitle}>Manage customer chats seamlessly</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Bottom Sheet Card */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.sheetContainer}
      >
        <ScrollView
          contentContainerStyle={styles.sheetContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Text style={styles.title}>Login to Your Account</Text>

          {/* Tab Switcher: Email / Phone Number */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabButton, authMethod === 'email' && styles.tabButtonActive]}
              onPress={() => setAuthMethod('email')}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, authMethod === 'email' && styles.tabTextActive]}>
                Email
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, authMethod === 'phone' && styles.tabButtonActive]}
              onPress={() => setAuthMethod('phone')}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, authMethod === 'phone' && styles.tabTextActive]}>
                Phone Number
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          {authMethod === 'phone' ? (
            <View style={styles.inputRow}>
              <View style={styles.countryPicker}>
                <Text style={styles.countryFlag}>🇮🇳</Text>
                <Text style={styles.countryCode}>+91</Text>
                <Ionicons name="chevron-down" size={16} color="#4B5563" />
              </View>
              <TextInput
                style={styles.phoneInput}
                placeholder="Enter mobile number"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                maxLength={10}
              />
            </View>
          ) : (
            <View style={styles.emailContainer}>
              <Ionicons name="mail-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.emailInput}
                placeholder="Enter your email"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSendOtp}
            activeOpacity={0.85}
          >
            <Text style={styles.submitBtnText}>Send OTP</Text>
          </TouchableOpacity>

          {/* Sign up prompt */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don't have account? </Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.footerLink}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#06231A',
  },
  headerGraphic: {
    height: '42%',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  headerSafe: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 40 : 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    marginBottom: 8,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
  sheetContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
  },
  sheetContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 24,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  countryPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
    marginRight: 10,
  },
  countryFlag: {
    fontSize: 18,
    marginRight: 6,
  },
  countryCode: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginRight: 4,
  },
  phoneInput: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 28,
  },
  inputIcon: {
    marginRight: 10,
  },
  emailInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 24,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F97316', // Orange highlight as in Figma
  },
});

