import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../../services/api';

const SECTIONS = [
  {
    category: 'ACCOUNT SETTINGS',
    items: [
      {
        id: 'business_profile',
        title: 'Business Profile',
        subtitle: 'Manage public business details',
        icon: 'briefcase-outline',
      },
      {
        id: 'personal_info',
        title: 'Personal Information',
        subtitle: 'Update your name and contact details',
        icon: 'person-outline',
      },
      {
        id: 'team_mgmt',
        title: 'Team Management',
        subtitle: 'Manage members and permissions',
        icon: 'people-outline',
      },
      {
        id: 'billing_invoices',
        title: 'Billing & Invoices',
        subtitle: 'Manage credits, invoices and plans',
        icon: 'receipt-outline',
      },
    ],
  },
  {
    category: 'WHATSAPP SETTINGS',
    items: [
      {
        id: 'whatsapp_config',
        title: 'WhatsApp Configuration',
        subtitle: 'API, webhooks and connection health',
        icon: 'logo-whatsapp',
      },
      {
        id: 'phone_mgmt',
        title: 'Phone Number Management',
        subtitle: 'Manage registered business numbers',
        icon: 'phone-portrait-outline',
      },
      {
        id: 'waba_profile',
        title: 'WhatsApp Business Profile',
        subtitle: 'Business details shown in WhatsApp',
        icon: 'storefront-outline',
      },
      {
        id: 'message_settings',
        title: 'Message Settings',
        subtitle: 'Templates, defaults and preferences',
        icon: 'chatbubble-outline',
      },
    ],
  },
  {
    category: 'DEVELOPER SETTINGS',
    items: [
      {
        id: 'api_mgmt',
        title: 'API Management',
        subtitle: 'Credentials and API access',
        icon: 'code-slash-outline',
      },
      {
        id: 'integration_settings',
        title: 'Integration Settings',
        subtitle: 'Connected applications and tools',
        icon: 'flash-outline',
      },
    ],
  },
  {
    category: 'SECURITY SETTINGS',
    items: [
      {
        id: 'two_step_verification',
        title: 'Two-Step Verification',
        subtitle: 'Secure your registered number',
        icon: 'shield-checkmark-outline',
      },
      {
        id: 'access_tokens',
        title: 'Access Tokens',
        subtitle: 'Manage active access tokens',
        icon: 'key-outline',
      },
      {
        id: 'login_security',
        title: 'Login & Security',
        subtitle: 'Password and sign-in controls',
        icon: 'lock-closed-outline',
      },
    ],
  },
  {
    category: 'GENERAL SETTINGS',
    items: [
      {
        id: 'notifications',
        title: 'Notifications',
        subtitle: 'Choose how you are notified',
        icon: 'notifications-outline',
      },
      {
        id: 'language',
        title: 'Language',
        subtitle: 'English (United States)',
        icon: 'globe-outline',
      },
      {
        id: 'preferences',
        title: 'Preferences',
        subtitle: 'Customize your MessBee experience',
        icon: 'options-outline',
      },
      {
        id: 'help_support',
        title: 'Help & Support',
        subtitle: 'Get answers and contact support',
        icon: 'help-circle-outline',
      },
    ],
  },
];

export default function SettingsScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out of your MessBee account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await authService.logout();
          navigation.replace('Login');
        },
      },
    ]);
  };

  const handleItemPress = (item) => {
    if (item.id === 'business_profile' || item.id === 'waba_profile') {
      navigation.navigate('BusinessProfile');
    } else if (item.id === 'personal_info') {
      navigation.navigate('PersonalInfo');
    } else if (item.id === 'team_mgmt') {
      navigation.navigate('ContactCRM');
    } else if (item.id === 'billing_invoices') {
      navigation.navigate('BillingInvoices');
    } else if (item.id === 'whatsapp_config') {
      navigation.navigate('WhatsAppConfig');
    } else if (item.id === 'phone_mgmt') {
      navigation.navigate('PhoneNumberStatus');
    } else if (item.id === 'message_settings') {
      navigation.navigate('Templates');
    } else if (item.id === 'api_mgmt' || item.id === 'integration_settings' || item.id === 'access_tokens') {
      navigation.navigate('ApiManagement');
    } else if (item.id === 'two_step_verification') {
      navigation.navigate('WhatsAppTwoStep');
    } else if (item.id === 'login_security') {
      navigation.navigate('SecuritySettings');
    } else if (item.id === 'notifications') {
      navigation.navigate('NotificationsSettings');
    } else if (item.id === 'language') {
      Alert.alert('Language', 'MessBee currently defaults to English (United States).');
    } else if (item.id === 'preferences') {
      Alert.alert('Preferences', 'Preferences are active.');
    } else if (item.id === 'help_support') {
      Alert.alert('Help & Support', 'Support: support@messbee.com | +91 8181756688');
    } else {
      Alert.alert(item.title, item.subtitle);
    }
  };

  const filteredSections = SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter(
      (item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((section) => section.items.length > 0);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Top Header with Back button */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        <View style={styles.headerRight}>
          {/* Notification Bell */}
          <TouchableOpacity style={styles.bellButton} activeOpacity={0.8}>
            <Ionicons name="notifications-outline" size={20} color="#374151" />
          </TouchableOpacity>

          {/* User Avatar Circle */}
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>AK</Text>
          </View>
        </View>
      </View>

      {/* Search Input Box */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            placeholder="Search settings"
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredSections.map((section, sIdx) => (
          <View key={sIdx} style={styles.sectionContainer}>
            <Text style={styles.sectionHeaderTitle}>{section.category}</Text>

            {/* White Rounded Card */}
            <View style={styles.card}>
              {section.items.map((item, iIdx) => {
                const isLast = iIdx === section.items.length - 1;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.rowItem, isLast && styles.rowItemLast]}
                    onPress={() => handleItemPress(item)}
                    activeOpacity={0.7}
                  >
                    {/* Light Mint Green Icon Circle */}
                    <View style={styles.iconSquircle}>
                      <Ionicons name={item.icon} size={20} color="#00B67A" />
                    </View>

                    {/* Title & Subtitle */}
                    <View style={styles.rowContent}>
                      <Text style={styles.itemTitle}>{item.title}</Text>
                      <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                    </View>

                    {/* Chevron Forward */}
                    <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        {/* Logout Button Card */}
        <View style={styles.logoutSection}>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={20} color="#EF4444" style={{ marginRight: 8 }} />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footerVersion}>MessBee Business v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 24 : 10,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  userAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#00B67A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  searchWrapper: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1E293B',
    paddingVertical: 0,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  sectionContainer: {
    marginTop: 20,
    paddingHorizontal: 18,
  },
  sectionHeaderTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.6,
    marginBottom: 8,
    paddingLeft: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  rowItemLast: {
    borderBottomWidth: 0,
  },
  iconSquircle: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#E6F4EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rowContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
  },
  logoutSection: {
    marginTop: 24,
    paddingHorizontal: 18,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderRadius: 16,
    paddingVertical: 14,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EF4444',
  },
  footerVersion: {
    textAlign: 'center',
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 18,
  },
});
