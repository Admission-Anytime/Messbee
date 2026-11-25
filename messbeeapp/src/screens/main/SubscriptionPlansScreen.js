import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { teamService, authService } from '../../services/api';
import { validateForm } from '../../utils/validation';

const PLANS = [
  {
    id: 'free',
    name: 'Free Starter',
    price: '₹0 / mo',
    contacts: '500 Contacts',
    features: ['QR WhatsApp Web Link', '500 Contacts Limit', 'Basic Quick Replies', '1 Team Member'],
  },
  {
    id: 'basic',
    name: 'Growth Basic',
    price: '₹999 / mo',
    contacts: '5,000 Contacts',
    features: ['Official Meta Cloud API', '5,000 Contacts Limit', 'Broadcast Campaigns', '5 Team Members'],
  },
  {
    id: 'premium',
    name: 'Business Pro',
    price: '₹2,499 / mo',
    contacts: '25,000 Contacts',
    features: ['Full Bot Automation Flows', '25,000 Contacts Limit', 'Commerce & Inventory', '15 Team Members'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise Scale',
    price: 'Custom',
    contacts: 'Unlimited Contacts',
    features: ['Unlimited Contacts & Broadcasts', 'Dedicated Account Manager', 'Custom Webhook & APIs', 'Unlimited Team'],
  },
];

export default function SubscriptionPlansScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPlan, setCurrentPlan] = useState('free');
  const [limits, setLimits] = useState(null);
  const [upgrading, setUpgrading] = useState(false);

  // Contact Sales Modal
  const [salesModalVisible, setSalesModalVisible] = useState(false);
  const [inquiryMsg, setInquiryMsg] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [sendingInquiry, setSendingInquiry] = useState(false);

  const loadPlanInfo = useCallback(async () => {
    try {
      const [user, lim] = await Promise.all([
        authService.getCurrentUser().catch(() => null),
        teamService.getAccountLimits().catch(() => null),
      ]);
      const plan = lim?.plan || lim?.subscriptionPlan || user?.subscriptionPlan || 'free';
      setCurrentPlan(String(plan).toLowerCase());
      setLimits(lim);
    } catch (err) {
      console.warn('SubscriptionPlans load error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadPlanInfo();
  }, [loadPlanInfo]);

  const handleSelectPlan = (plan) => {
    if (plan.id === currentPlan) return;
    if (plan.id === 'enterprise') {
      setSalesModalVisible(true);
      return;
    }

    Alert.alert('Switch Plan', `Switch your subscription to ${plan.name} (${plan.price})?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: async () => {
          setUpgrading(true);
          try {
            await teamService.updateSubscription({ plan: plan.id, subscriptionPlan: plan.id });
            setCurrentPlan(plan.id);
            Alert.alert('Success', `Your plan has been updated to ${plan.name}!`);
            loadPlanInfo();
          } catch (err) {
            Alert.alert('Notice', err?.response?.data?.message || 'Could not update plan. Contact support.');
          } finally {
            setUpgrading(false);
          }
        },
      },
    ]);
  };

  const handleContactSales = async () => {
    const { isValid, firstError } = validateForm({
      inquiryPhone: { value: inquiryPhone, required: true, phone: true, label: 'Phone Number' },
      inquiryMsg: { value: inquiryMsg, required: true, minLength: 5, label: 'Requirements' },
    });
    if (!isValid) {
      Alert.alert('Validation Error', firstError);
      return;
    }

    setSendingInquiry(true);
    try {
      await teamService.contactSales({
        phone: inquiryPhone.trim(),
        message: inquiryMsg.trim(),
        planInterested: 'enterprise',
      });
      Alert.alert('Inquiry Sent', 'Our sales team will reach out to you shortly!');
      setSalesModalVisible(false);
      setInquiryMsg('');
      setInquiryPhone('');
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to send inquiry.');
    } finally {
      setSendingInquiry(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Plans & Subscription</Text>
        <TouchableOpacity onPress={() => setSalesModalVisible(true)}>
          <Text style={styles.salesLink}>Contact Sales</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#00B67A" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadPlanInfo(); }} colors={['#00B67A']} />}
        >
          {/* Current Active Plan Banner */}
          <View style={styles.activeBanner}>
            <Text style={styles.activeTag}>CURRENT ACTIVE PLAN</Text>
            <Text style={styles.activePlanName}>{currentPlan.toUpperCase()}</Text>
            {limits && (
              <Text style={styles.activeUsage}>
                Contacts Used: {limits.contactsUsed ?? 0} / {limits.contactLimit === -1 ? 'Unlimited' : limits.contactLimit ?? 500}
              </Text>
            )}
          </View>

          {PLANS.map((plan) => {
            const isActive = plan.id === currentPlan;
            return (
              <View key={plan.id} style={[styles.planCard, isActive && styles.planCardActive]}>
                <View style={styles.planTop}>
                  <View>
                    <Text style={styles.planName}>{plan.name}</Text>
                    <Text style={styles.planContacts}>{plan.contacts}</Text>
                  </View>
                  <Text style={styles.planPrice}>{plan.price}</Text>
                </View>

                <View style={styles.featuresList}>
                  {plan.features.map((f, i) => (
                    <View key={i} style={styles.featureRow}>
                      <Ionicons name="checkmark-circle" size={16} color="#00B67A" />
                      <Text style={styles.featureText}>{f}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  style={[styles.planBtn, isActive && styles.planBtnActive]}
                  onPress={() => handleSelectPlan(plan)}
                  disabled={isActive || upgrading}
                >
                  <Text style={[styles.planBtnText, isActive && styles.planBtnTextActive]}>
                    {isActive ? 'Current Plan' : plan.id === 'enterprise' ? 'Contact Sales' : 'Select Plan'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
      )}

      <Modal visible={salesModalVisible} animationType="slide" transparent onRequestClose={() => setSalesModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Contact Enterprise Sales</Text>
              <TouchableOpacity onPress={() => setSalesModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalForm}>
              <Text style={styles.label}>Phone Number *</Text>
              <TextInput style={styles.input} value={inquiryPhone} onChangeText={setInquiryPhone} keyboardType="phone-pad" maxLength={15} placeholder="10-digit mobile" />
              <Text style={styles.label}>Your Requirements *</Text>
              <TextInput
                style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                value={inquiryMsg}
                onChangeText={setInquiryMsg}
                multiline
                placeholder="Tell us about your team size & monthly message volume..."
              />
              <TouchableOpacity style={styles.saveBtn} onPress={handleContactSales} disabled={sendingInquiry}>
                {sendingInquiry ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveBtnText}>Send Inquiry</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  salesLink: { fontSize: 13, fontWeight: '700', color: '#00B67A' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { padding: 16, gap: 12 },
  activeBanner: { backgroundColor: '#0F172A', borderRadius: 14, padding: 16 },
  activeTag: { color: '#38BDF8', fontSize: 11, fontWeight: '700' },
  activePlanName: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', marginTop: 4 },
  activeUsage: { color: '#CBD5E1', fontSize: 13, marginTop: 4 },
  planCard: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  planCardActive: { borderColor: '#00B67A', borderWidth: 2, backgroundColor: '#F0FDF4' },
  planTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  planName: { fontSize: 17, fontWeight: '700', color: '#0F172A' },
  planContacts: { fontSize: 12, color: '#64748B', marginTop: 2 },
  planPrice: { fontSize: 18, fontWeight: '800', color: '#00B67A' },
  featuresList: { gap: 6, marginBottom: 14 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featureText: { fontSize: 13, color: '#334155' },
  planBtn: { backgroundColor: '#00B67A', paddingVertical: 11, borderRadius: 8, alignItems: 'center' },
  planBtnActive: { backgroundColor: '#DCFCE7' },
  planBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  planBtnTextActive: { color: '#166534' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#0F172A' },
  modalForm: { padding: 18 },
  label: { fontSize: 13, fontWeight: '600', color: '#334155', marginTop: 10, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#0F172A' },
  saveBtn: { backgroundColor: '#00B67A', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 18 },
  saveBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
