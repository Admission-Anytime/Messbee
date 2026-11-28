import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

const MORE_TILES = [
  {
    id: 'crm_pipeline',
    title: 'CRM Pipeline',
    subtitle: 'Manage crm pipeline',
    icon: 'grid-outline',
    route: 'CrmPipeline',
  },
  {
    id: 'labels',
    title: 'Labels',
    subtitle: 'Manage labels',
    icon: 'pricetag-outline',
    route: 'Labels',
  },
  {
    id: 'custom_fields',
    title: 'Custom Fields',
    subtitle: 'Manage custom fields',
    icon: 'list-outline',
    route: 'CustomFields',
  },
  {
    id: 'quick_reply',
    title: 'Quick Reply',
    subtitle: 'Manage quick reply',
    icon: 'flash-outline',
    route: 'QuickReplies',
  },
  {
    id: 'status',
    title: 'Status',
    subtitle: 'Manage status',
    icon: 'options-outline',
    route: 'StatusScreen',
  },
  {
    id: 'templates',
    title: 'Templates',
    subtitle: 'Manage templates',
    icon: 'document-text-outline',
    route: 'Templates',
  },
  {
    id: 'analytics',
    title: 'Analytics',
    subtitle: 'Manage analytics',
    icon: 'bar-chart-outline',
    route: 'AnalyticsOverview',
  },
  {
    id: 'commerce',
    title: 'Commerce',
    subtitle: 'Manage commerce',
    icon: 'cart-outline',
    route: 'CommerceHub',
  },
  {
    id: 'automation',
    title: 'Automation',
    subtitle: 'Manage automation',
    icon: 'git-network-outline',
    route: 'AutomationDashboard',
  },
  {
    id: 'dev_api',
    title: 'Developer API',
    subtitle: 'Manage developer api',
    icon: 'code-slash-outline',
    route: 'ApiManagement',
  },
  {
    id: 'inventory',
    title: 'Inventory Management',
    subtitle: 'Manage inventory management',
    icon: 'cube-outline',
    route: 'Inventory',
  },
  {
    id: 'billing_invoices',
    title: 'Billing & Invoices',
    subtitle: 'Manage invoices and billing',
    icon: 'receipt-outline',
    route: 'BillingInvoices',
  },
  {
    id: 'contact_groups',
    title: 'Audience Groups',
    subtitle: 'Manage contact groups & segments',
    icon: 'people-circle-outline',
    route: 'ContactGroups',
  },
  {
    id: 'media_library',
    title: 'Media Library',
    subtitle: 'Images, docs & template assets',
    icon: 'images-outline',
    route: 'MediaLibrary',
  },
  {
    id: 'whatsapp_qr',
    title: 'QR WhatsApp Web',
    subtitle: 'Scan QR & auto-responder',
    icon: 'qr-code-outline',
    route: 'WhatsAppQr',
  },
  {
    id: 'team_performance',
    title: 'Performance & Reports',
    subtitle: 'Agent stats & revenue reports',
    icon: 'stats-chart-outline',
    route: 'TeamPerformance',
  },
  {
    id: 'suppliers_purchases',
    title: 'Suppliers & Purchases',
    subtitle: 'Vendors & stock-in orders',
    icon: 'briefcase-outline',
    route: 'SuppliersPurchases',
  },
  {
    id: 'categories_customers',
    title: 'Categories & Customers',
    subtitle: 'Product categories & ledger',
    icon: 'albums-outline',
    route: 'CategoriesCustomers',
  },
  {
    id: 'team_management',
    title: 'Team & Plan Limits',
    subtitle: 'Members, roles & usage limits',
    icon: 'people-outline',
    route: 'TeamManagement',
  },
  {
    id: 'entities_bookings',
    title: 'Branches & Bookings',
    subtitle: 'Stores, resources & slots',
    icon: 'storefront-outline',
    route: 'EntitiesBookings',
  },
  {
    id: 'workspace_settings',
    title: 'Workspace & Logs',
    subtitle: 'Preferences & automation logs',
    icon: 'options-outline',
    route: 'WorkspaceSettings',
  },
  {
    id: 'subscription_plans',
    title: 'Plans & Upgrade',
    subtitle: 'Manage subscription & pricing',
    icon: 'ribbon-outline',
    route: 'SubscriptionPlans',
  },
  {
    id: 'help_support',
    title: 'Help & Support',
    subtitle: 'FAQs & support tickets',
    icon: 'help-circle-outline',
    route: 'HelpSupport',
  },
  {
    id: 'settings',
    title: 'Account and Settings',
    subtitle: 'Manage account and settings',
    icon: 'settings-outline',
    route: 'Settings',
  },
];

export default function MoreScreen({ navigation }) {
  const handleTilePress = (item) => {
    if (item.route) {
      navigation.navigate(item.route);
    } else if (item.action) {
      item.action();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
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
        <Text style={styles.headerTitle}>More</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {MORE_TILES.map((tile) => (
            <TouchableOpacity
              key={tile.id}
              style={styles.tileCard}
              onPress={() => handleTilePress(tile)}
              activeOpacity={0.7}
            >
              <View style={styles.tileIconBox}>
                <Ionicons name={tile.icon} size={20} color="#00875A" />
              </View>
              <Text style={styles.tileTitle}>{tile.title}</Text>
              <Text style={styles.tileSubtitle}>{tile.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
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
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tileCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tileIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  tileTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  tileSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
  },
});
