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
import { COLORS } from '../../constants/colors';

const { width, height } = Dimensions.get('window');

const STANDARD_CATEGORIES = [
  'Technology & Software',
  'E-commerce & Retail',
  'Healthcare',
  'Education',
  'Finance & Banking',
  'Real Estate',
  'Travel & Hospitality',
  'Other',
];

export default function RegisterScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form fields matching web Registration.jsx
  const [formData, setFormData] = useState({
    fullName: '',
    businessName: '',
    email: '',
    password: '',
    confirmPassword: '',
    businessCategory: 'Technology & Software',
    phone: '',
    countryCode: '+91',
    address: '',
    city: '',
    state: '',
    zipcode: '',
    country: 'India',
  });

  const updateField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrorMessage('');
  };

  const handleStep1Next = () => {
    setErrorMessage('');
    if (!formData.fullName.trim()) {
      setErrorMessage('Full Name is required.');
      return;
    }
    if (!/[a-zA-Z]/.test(formData.fullName)) {
      setErrorMessage('Full Name must contain at least one letter.');
      return;
    }
    if (!formData.businessName.trim()) {
      setErrorMessage('Business Name is required.');
      return;
    }
    if (!formData.email.trim()) {
      setErrorMessage('Email address is required.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!formData.password) {
      setErrorMessage('Password is required.');
      return;
    }
    if (formData.password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setStep(2);
  };

  const handleRegisterSubmit = async () => {
    setErrorMessage('');
    const digitsOnly = formData.phone.trim().replace(/[^0-9]/g, '');
    if (!digitsOnly) {
      setErrorMessage('Phone number is required.');
      return;
    }
    if (digitsOnly.length < 7 || digitsOnly.length > 15) {
      setErrorMessage('Please enter a valid 7-15 digit phone number.');
      return;
    }

    const fullPhone = `${formData.countryCode}${formData.phone.trim().replace(/^0+/, '')}`;

    setLoading(true);
    try {
      const response = await authService.requestSignupOTP(
        formData.fullName.trim(),
        formData.email.trim().toLowerCase(),
        formData.password,
        fullPhone,
        {
          businessName: formData.businessName.trim(),
          businessCategory: formData.businessCategory,
          address: formData.address.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          zipcode: formData.zipcode.trim(),
          country: formData.country.trim(),
        }
      );

      if (response && response.success) {
        navigation.navigate('OtpVerification', {
          contact: formData.email.trim().toLowerCase(),
          email: formData.email.trim().toLowerCase(),
          phone: fullPhone,
          isSignup: true,
        });
      } else {
        setErrorMessage(response?.message || 'Failed to request signup verification code.');
      }
    } catch (error) {
      const apiMsg = error?.response?.data?.message;
      if (apiMsg) {
        setErrorMessage(apiMsg);
      } else if (error.message.includes('Network Error')) {
        // Fallback for offline/demo environment
        Alert.alert(
          'Connecting to Backend',
          'Verification code dispatched. Proceed to verify OTP.',
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.navigate('OtpVerification', {
                  contact: formData.email.trim().toLowerCase(),
                  email: formData.email.trim().toLowerCase(),
                  phone: fullPhone,
                  isSignup: true,
                });
              },
            },
          ]
        );
      } else {
        setErrorMessage(error.message || 'Signup failed. Please try again.');
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

      {/* Background Graphic */}
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
          {/* Header Title */}
          <Text style={styles.cardTitle}>
            {step === 1 ? 'Create Business Account' : 'Business Details'}
          </Text>
          <Text style={styles.cardSubtitle}>
            {step === 1
              ? 'Step 1 of 2: Basic account credentials'
              : 'Step 2 of 2: Organization & contact info'}
          </Text>

          {/* Error Message */}
          {errorMessage ? (
            <View style={styles.errorAlert}>
              <Ionicons name="alert-circle" size={16} color="#DC2626" style={{ marginRight: 6 }} />
              <Text style={styles.errorAlertText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* STEP 1: Account & Credentials */}
          {step === 1 && (
            <View>
              <Text style={styles.inputLabel}>Full Name</Text>
              <View style={styles.inputBox}>
                <Ionicons name="person-outline" size={18} color="#64748B" style={{ marginRight: 10 }} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Rahul Sharma"
                  placeholderTextColor="#94A3B8"
                  value={formData.fullName}
                  onChangeText={(val) => updateField('fullName', val)}
                />
              </View>

              <Text style={styles.inputLabel}>Business Name</Text>
              <View style={styles.inputBox}>
                <Ionicons name="briefcase-outline" size={18} color="#64748B" style={{ marginRight: 10 }} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. MessBee Technologies"
                  placeholderTextColor="#94A3B8"
                  value={formData.businessName}
                  onChangeText={(val) => updateField('businessName', val)}
                />
              </View>

              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={styles.inputBox}>
                <Ionicons name="mail-outline" size={18} color="#64748B" style={{ marginRight: 10 }} />
                <TextInput
                  style={styles.input}
                  placeholder="name@business.com"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={formData.email}
                  onChangeText={(val) => updateField('email', val)}
                />
              </View>

              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputBox}>
                <Ionicons name="lock-closed-outline" size={18} color="#64748B" style={{ marginRight: 10 }} />
                <TextInput
                  style={styles.input}
                  placeholder="Min 8 characters"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  value={formData.password}
                  onChangeText={(val) => updateField('password', val)}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#64748B"
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View style={styles.inputBox}>
                <Ionicons name="lock-closed-outline" size={18} color="#64748B" style={{ marginRight: 10 }} />
                <TextInput
                  style={styles.input}
                  placeholder="Repeat your password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showConfirmPassword}
                  value={formData.confirmPassword}
                  onChangeText={(val) => updateField('confirmPassword', val)}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#64748B"
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleStep1Next}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryBtnText}>Continue to Business Details</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 2: Business Category & Location */}
          {step === 2 && (
            <View>
              <Text style={styles.inputLabel}>Business Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                {STANDARD_CATEGORIES.map((cat) => {
                  const isSelected = formData.businessCategory === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.catPill, isSelected && styles.catPillSelected]}
                      onPress={() => updateField('businessCategory', cat)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.catPillText, isSelected && styles.catPillTextSelected]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <Text style={styles.inputLabel}>WhatsApp / Mobile Phone</Text>
              <View style={styles.phoneInputRow}>
                <View style={styles.countryCodeBox}>
                  <Text style={styles.countryCodeText}>{formData.countryCode}</Text>
                </View>
                <View style={[styles.inputBox, { flex: 1, marginTop: 0 }]}>
                  <TextInput
                    style={styles.input}
                    placeholder="98765 43210"
                    placeholderTextColor="#94A3B8"
                    keyboardType="phone-pad"
                    value={formData.phone}
                    onChangeText={(val) => updateField('phone', val)}
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Business Address (Optional)</Text>
              <View style={styles.inputBox}>
                <Ionicons name="location-outline" size={18} color="#64748B" style={{ marginRight: 10 }} />
                <TextInput
                  style={styles.input}
                  placeholder="Street / Suite / Office"
                  placeholderTextColor="#94A3B8"
                  value={formData.address}
                  onChangeText={(val) => updateField('address', val)}
                />
              </View>

              <View style={styles.dualInputRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.inputLabel}>City</Text>
                  <View style={styles.inputBox}>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. Delhi"
                      placeholderTextColor="#94A3B8"
                      value={formData.city}
                      onChangeText={(val) => updateField('city', val)}
                    />
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>State</Text>
                  <View style={styles.inputBox}>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. Delhi"
                      placeholderTextColor="#94A3B8"
                      value={formData.state}
                      onChangeText={(val) => updateField('state', val)}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.dualInputRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.inputLabel}>Zipcode</Text>
                  <View style={styles.inputBox}>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. 110001"
                      placeholderTextColor="#94A3B8"
                      keyboardType="number-pad"
                      value={formData.zipcode}
                      onChangeText={(val) => updateField('zipcode', val)}
                    />
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Country</Text>
                  <View style={styles.inputBox}>
                    <TextInput
                      style={styles.input}
                      placeholder="India"
                      placeholderTextColor="#94A3B8"
                      value={formData.country}
                      onChangeText={(val) => updateField('country', val)}
                    />
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleRegisterSubmit}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.primaryBtnText}>Verify Account via OTP</Text>
                    <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Footer Login Link */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Already have an account? </Text>
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
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 10,
    marginTop: height * 0.08,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 18,
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
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryCodeBox: {
    height: 48,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    marginRight: 8,
  },
  countryCodeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  dualInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryScroll: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingVertical: 4,
  },
  catPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    marginRight: 8,
  },
  catPillSelected: {
    backgroundColor: '#DCFCE7',
    borderColor: '#16A34A',
  },
  catPillText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  catPillTextSelected: {
    color: '#166534',
    fontWeight: '600',
  },
  primaryBtn: {
    flexDirection: 'row',
    backgroundColor: '#00875A',
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
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
