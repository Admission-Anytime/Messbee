import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIF_PREFS_KEY = 'messbee_notification_prefs_v1';

export default function NotificationsSettingsScreen({ navigation }) {
  const [newChat, setNewChat] = useState(true);
  const [mentions, setMentions] = useState(true);
  const [campaigns, setCampaigns] = useState(false);
  const [sounds, setSounds] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(NOTIF_PREFS_KEY)
      .then((raw) => {
        if (!raw) return;
        const p = JSON.parse(raw);
        if (typeof p.newChat === 'boolean') setNewChat(p.newChat);
        if (typeof p.mentions === 'boolean') setMentions(p.mentions);
        if (typeof p.campaigns === 'boolean') setCampaigns(p.campaigns);
        if (typeof p.sounds === 'boolean') setSounds(p.sounds);
      })
      .catch(() => {});
  }, []);

  const updatePref = async (key, val, setter) => {
    setter(val);
    const next = { newChat, mentions, campaigns, sounds, [key]: val };
    try {
      await AsyncStorage.setItem(NOTIF_PREFS_KEY, JSON.stringify(next));
    } catch {}
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MESSAGES & INBOX</Text>
          <View style={styles.card}>
            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleTitle}>New WhatsApp Inbound</Text>
                <Text style={styles.toggleSubtitle}>Alert when a customer sends a message</Text>
              </View>
              <Switch
                value={newChat}
                onValueChange={(v) => updatePref('newChat', v, setNewChat)}
                trackColor={{ false: '#E2E8F0', true: '#A7F3D0' }}
                thumbColor={newChat ? '#00B67A' : '#CBD5E1'}
              />
            </View>

            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleTitle}>Team Mentions & Notes</Text>
                <Text style={styles.toggleSubtitle}>Alert when teammate tags your handle</Text>
              </View>
              <Switch
                value={mentions}
                onValueChange={(v) => updatePref('mentions', v, setMentions)}
                trackColor={{ false: '#E2E8F0', true: '#A7F3D0' }}
                thumbColor={mentions ? '#00B67A' : '#CBD5E1'}
              />
            </View>

            <View style={[styles.toggleRow, { borderBottomWidth: 0 }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleTitle}>Sound & Vibrate</Text>
                <Text style={styles.toggleSubtitle}>Play chime sound on incoming push</Text>
              </View>
              <Switch
                value={sounds}
                onValueChange={(v) => updatePref('sounds', v, setSounds)}
                trackColor={{ false: '#E2E8F0', true: '#A7F3D0' }}
                thumbColor={sounds ? '#00B67A' : '#CBD5E1'}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CAMPAIGNS & MARKETING</Text>
          <View style={styles.card}>
            <View style={[styles.toggleRow, { borderBottomWidth: 0 }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleTitle}>Campaign Status Reports</Text>
                <Text style={styles.toggleSubtitle}>Delivery progress & completion alerts</Text>
              </View>
              <Switch
                value={campaigns}
                onValueChange={(v) => updatePref('campaigns', v, setCampaigns)}
                trackColor={{ false: '#E2E8F0', true: '#A7F3D0' }}
                thumbColor={campaigns ? '#00B67A' : '#CBD5E1'}
              />
            </View>
          </View>
        </View>
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
    paddingTop: 10,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.6,
    marginBottom: 8,
    paddingLeft: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
    overflow: 'hidden',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  toggleSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
});
