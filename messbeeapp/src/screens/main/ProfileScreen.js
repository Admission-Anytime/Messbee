import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen({ navigation }) {
  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out of your MessBee account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => navigation.replace('Login'),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>You</Text>
        <TouchableOpacity
          style={styles.settingsHeaderBtn}
          onPress={() => navigation.navigate('Settings')}
          activeOpacity={0.8}
        >
          <Ionicons name="settings-outline" size={22} color="#111827" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Business Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>AK</Text>
          </View>
          <View style={styles.userInfoCol}>
            <Text style={styles.userName}>Arshlan Khan</Text>
            <Text style={styles.userSubtitle}>+91 8181756688 • admin@messbee.com</Text>
            <View style={styles.planBadge}>
              <Text style={styles.planBadgeText}>PRO PLAN</Text>
            </View>
          </View>
        </View>

        {/* Settings Option Card */}
        <View style={styles.sectionWrap}>
          <TouchableOpacity
            style={styles.settingsPrimaryCard}
            onPress={() => navigation.navigate('Settings')}
            activeOpacity={0.8}
          >
            <View style={styles.settingsIconSquircle}>
              <Ionicons name="settings" size={24} color="#00B67A" />
            </View>
            <View style={styles.settingsContent}>
              <View style={styles.settingsTitleRow}>
                <Text style={styles.settingsTitle}>Settings</Text>
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>ALL CONTROLS</Text>
                </View>
              </View>
              <Text style={styles.settingsSubtitle}>
                Account, WhatsApp, Developer & Security
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#00B67A" />
          </TouchableOpacity>
        </View>

        {/* Quick Menu Options */}
        <View style={styles.menuCard}>
          {/* Settings in Menu List */}
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => navigation.navigate('Settings')}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBox, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="settings-outline" size={20} color="#00B67A" />
            </View>
            <View style={styles.menuTextBox}>
              <Text style={styles.menuRowTitle}>Settings</Text>
              <Text style={styles.menuRowSubtitle}>All configuration and system settings</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
          </TouchableOpacity>

          {/* WhatsApp Business */}
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => navigation.navigate('BotMenu')}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBox, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="logo-whatsapp" size={20} color="#00B67A" />
            </View>
            <View style={styles.menuTextBox}>
              <Text style={styles.menuRowTitle}>WhatsApp Connection</Text>
              <Text style={styles.menuRowSubtitle}>+91 8181756688 • Active</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
          </TouchableOpacity>

          {/* Templates */}
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => navigation.navigate('Templates')}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBox, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="document-text-outline" size={20} color="#3B82F6" />
            </View>
            <View style={styles.menuTextBox}>
              <Text style={styles.menuRowTitle}>Message Templates</Text>
              <Text style={styles.menuRowSubtitle}>Manage approved WhatsApp templates</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
          </TouchableOpacity>

          {/* Team Members */}
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => navigation.navigate('ContactCRM')}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBox, { backgroundColor: '#F3E8FF' }]}>
              <Ionicons name="people-outline" size={20} color="#9333EA" />
            </View>
            <View style={styles.menuTextBox}>
              <Text style={styles.menuRowTitle}>Team Management</Text>
              <Text style={styles.menuRowSubtitle}>4 active members and roles</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
          </TouchableOpacity>

          {/* Help & Support */}
          <TouchableOpacity
            style={[styles.menuRow, { borderBottomWidth: 0 }]}
            onPress={() => navigation.navigate('Settings')}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBox, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="help-circle-outline" size={20} color="#D97706" />
            </View>
            <View style={styles.menuTextBox}>
              <Text style={styles.menuRowTitle}>Help & Support</Text>
              <Text style={styles.menuRowSubtitle}>Guides, FAQ and contact support</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
          </TouchableOpacity>
        </View>

        {/* Log Out Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

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
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 24 : 10,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  settingsHeaderBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 18,
    marginTop: 18,
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#00B67A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  userInfoCol: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  userSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  planBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  planBadgeText: {
    color: '#15803D',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  sectionWrap: {
    marginTop: 18,
    paddingHorizontal: 18,
  },
  settingsPrimaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    shadowColor: '#00B67A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  settingsIconSquircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  settingsContent: {
    flex: 1,
  },
  settingsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 3,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  newBadge: {
    backgroundColor: '#00B67A',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  newBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  settingsSubtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 18,
    marginTop: 18,
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
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  menuIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuTextBox: {
    flex: 1,
  },
  menuRowTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  menuRowSubtitle: {
    fontSize: 11,
    color: '#64748B',
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
    marginHorizontal: 18,
    marginTop: 24,
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
