import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import SplashScreen from '../screens/onboarding/SplashScreen';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import OtpVerificationScreen from '../screens/auth/OtpVerificationScreen';
import PhoneVerifiedSuccessScreen from '../screens/auth/PhoneVerifiedSuccessScreen';
import BottomTabNavigator from './BottomTabNavigator';
import ChatDetailScreen from '../screens/main/ChatDetailScreen';
import ContactCrmScreen from '../screens/main/ContactCrmScreen';
import TemplateSelectionScreen from '../screens/main/TemplateSelectionScreen';
import BotMenuScreen from '../screens/main/BotMenuScreen';
import CrmPipelineScreen from '../screens/main/CrmPipelineScreen';
import LabelsScreen from '../screens/main/LabelsScreen';
import LabelDetailsScreen from '../screens/main/LabelDetailsScreen';
import EditLabelScreen from '../screens/main/EditLabelScreen';
import AddLabelScreen from '../screens/main/AddLabelScreen';
import AddContactScreen from '../screens/main/AddContactScreen';
import TemplatesScreen from '../screens/main/TemplatesScreen';
import BroadcastCampaignsScreen from '../screens/main/BroadcastCampaignsScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import BusinessProfileScreen from '../screens/main/BusinessProfileScreen';
import PersonalInfoScreen from '../screens/main/PersonalInfoScreen';
import ApiManagementScreen from '../screens/main/ApiManagementScreen';
import SecuritySettingsScreen from '../screens/main/SecuritySettingsScreen';
import NotificationsSettingsScreen from '../screens/main/NotificationsSettingsScreen';
import CustomFieldsScreen from '../screens/main/CustomFieldsScreen';
import CreateCustomFieldScreen from '../screens/main/CreateCustomFieldScreen';
import EditCustomFieldScreen from '../screens/main/EditCustomFieldScreen';
import QuickRepliesScreen from '../screens/main/QuickRepliesScreen';
import AddQuickReplyScreen from '../screens/main/AddQuickReplyScreen';
import EditQuickReplyScreen from '../screens/main/EditQuickReplyScreen';
import StatusScreen from '../screens/main/StatusScreen';
import AnalyticsOverviewScreen from '../screens/analytics/AnalyticsOverviewScreen';
import ConversationalAnalyticsScreen from '../screens/analytics/ConversationalAnalyticsScreen';
import MessageAnalyticsScreen from '../screens/analytics/MessageAnalyticsScreen';
import TemplateAnalyticsScreen from '../screens/analytics/TemplateAnalyticsScreen';
import CampaignAnalyticsScreen from '../screens/analytics/CampaignAnalyticsScreen';
import TemplateVariablesScreen from '../screens/main/TemplateVariablesScreen';
import ConfirmSendTemplateScreen from '../screens/main/ConfirmSendTemplateScreen';
import TemplateSuccessScreen from '../screens/main/TemplateSuccessScreen';
import ContactProfileScreen from '../screens/main/ContactProfileScreen';
import EditContactProfileScreen from '../screens/main/EditContactProfileScreen';
import ContactFullHistoryScreen from '../screens/main/ContactFullHistoryScreen';
import ManageLabelsModal from '../screens/main/ManageLabelsModal';
import UpdateLeadStatusModal from '../screens/main/UpdateLeadStatusModal';
import ArchivedChatsScreen from '../screens/main/ArchivedChatsScreen';
import WhatsAppConfigScreen from '../screens/whatsappConfig/WhatsAppConfigScreen';
import ConnectionHealthScreen from '../screens/whatsappConfig/ConnectionHealthScreen';
import ApiCredentialsScreen from '../screens/whatsappConfig/ApiCredentialsScreen';
import WebhookSettingsScreen from '../screens/whatsappConfig/WebhookSettingsScreen';
import SubscribedEventsScreen from '../screens/whatsappConfig/SubscribedEventsScreen';
import PhoneNumberStatusScreen from '../screens/whatsappConfig/PhoneNumberStatusScreen';
import WhatsAppTwoStepScreen from '../screens/whatsappConfig/WhatsAppTwoStepScreen';
import WhatsAppDisconnectedScreen from '../screens/whatsappConfig/WhatsAppDisconnectedScreen';
import ReconnectWhatsAppScreen from '../screens/whatsappConfig/ReconnectWhatsAppScreen';
import NotificationsScreen from '../screens/main/NotificationsScreen';
import CommerceCatalogScreen from '../screens/main/CommerceCatalogScreen';
import CommerceHubScreen from '../screens/main/CommerceHubScreen';
import PaymentListScreen from '../screens/main/PaymentListScreen';
import PaymentDetailsScreen from '../screens/main/PaymentDetailsScreen';
import AutomationDashboardScreen from '../screens/main/AutomationDashboardScreen';
import CreateAutomationScreen from '../screens/automation/CreateAutomationScreen';
import AutomationFlowBuilderScreen from '../screens/automation/AutomationFlowBuilderScreen';
import AutomationNodeConfigScreen from '../screens/automation/AutomationNodeConfigScreen';
import PublishAutomationScreen from '../screens/automation/PublishAutomationScreen';
import AutomationSimulatorScreen from '../screens/automation/AutomationSimulatorScreen';
import InventoryScreen from '../screens/main/InventoryScreen';
import BillingInvoicesScreen from '../screens/main/BillingInvoicesScreen';
import ContactGroupsScreen from '../screens/main/ContactGroupsScreen';
import MediaLibraryScreen from '../screens/main/MediaLibraryScreen';
import WhatsAppQrScreen from '../screens/main/WhatsAppQrScreen';
import TeamPerformanceScreen from '../screens/main/TeamPerformanceScreen';
import SuppliersPurchasesScreen from '../screens/main/SuppliersPurchasesScreen';
import CategoriesCustomersScreen from '../screens/main/CategoriesCustomersScreen';
import TeamManagementScreen from '../screens/main/TeamManagementScreen';
import EntitiesBookingsScreen from '../screens/main/EntitiesBookingsScreen';
import WorkspaceSettingsScreen from '../screens/main/WorkspaceSettingsScreen';
import SubscriptionPlansScreen from '../screens/main/SubscriptionPlansScreen';
import HelpSupportScreen from '../screens/main/HelpSupportScreen';
import PrivacyPolicyScreen from '../screens/main/PrivacyPolicyScreen';
import TermsConditionsScreen from '../screens/main/TermsConditionsScreen';
import { loadAuthToken } from '../services/api';

const Stack = createStackNavigator();

export default function RootNavigator() {
  const [isReady, setIsReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState('Onboarding');

  useEffect(() => {
    let mounted = true;
    const initApp = async () => {
      const token = await loadAuthToken();
      if (mounted && token) {
        setInitialRoute('MainTabs');
      }
    };
    initApp();

    // Show splash screen for 1.5 seconds on app start
    const timer = setTimeout(() => {
      if (mounted) setIsReady(true);
    }, 1500);
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []);

  if (!isReady) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
        <Stack.Screen name="PhoneVerifiedSuccess" component={PhoneVerifiedSuccessScreen} />
        <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
        <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
        <Stack.Screen name="ContactCRM" component={ContactCrmScreen} />
        <Stack.Screen name="AddContact" component={AddContactScreen} />
        <Stack.Screen name="TemplateSelection" component={TemplateSelectionScreen} />
        <Stack.Screen name="BotMenu" component={BotMenuScreen} />
        <Stack.Screen name="CrmPipeline" component={CrmPipelineScreen} />
        <Stack.Screen name="Labels" component={LabelsScreen} />
        <Stack.Screen name="LabelDetails" component={LabelDetailsScreen} />
        <Stack.Screen name="EditLabel" component={EditLabelScreen} />
        <Stack.Screen name="AddLabel" component={AddLabelScreen} />
        <Stack.Screen name="CustomFields" component={CustomFieldsScreen} />
        <Stack.Screen name="CreateCustomField" component={CreateCustomFieldScreen} />
        <Stack.Screen name="EditCustomField" component={EditCustomFieldScreen} />
        <Stack.Screen name="QuickReplies" component={QuickRepliesScreen} />
        <Stack.Screen name="AddQuickReply" component={AddQuickReplyScreen} />
        <Stack.Screen name="EditQuickReply" component={EditQuickReplyScreen} />
        <Stack.Screen name="StatusScreen" component={StatusScreen} />
        <Stack.Screen name="Templates" component={TemplatesScreen} />
        <Stack.Screen name="BroadcastCampaigns" component={BroadcastCampaignsScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="BusinessProfile" component={BusinessProfileScreen} />
        <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
        <Stack.Screen name="ApiManagement" component={ApiManagementScreen} />
        <Stack.Screen name="SecuritySettings" component={SecuritySettingsScreen} />
        <Stack.Screen name="NotificationsSettings" component={NotificationsSettingsScreen} />
        <Stack.Screen name="AnalyticsOverview" component={AnalyticsOverviewScreen} />
        <Stack.Screen name="ConversationalAnalytics" component={ConversationalAnalyticsScreen} />
        <Stack.Screen name="MessageAnalytics" component={MessageAnalyticsScreen} />
        <Stack.Screen name="TemplateAnalytics" component={TemplateAnalyticsScreen} />
        <Stack.Screen name="CampaignAnalytics" component={CampaignAnalyticsScreen} />
        <Stack.Screen name="TemplateVariables" component={TemplateVariablesScreen} />
        <Stack.Screen name="ConfirmSendTemplate" component={ConfirmSendTemplateScreen} />
        <Stack.Screen name="TemplateSuccess" component={TemplateSuccessScreen} />
        <Stack.Screen name="ContactProfile" component={ContactProfileScreen} />
        <Stack.Screen name="EditContactProfile" component={EditContactProfileScreen} />
        <Stack.Screen name="ContactFullHistory" component={ContactFullHistoryScreen} />
        <Stack.Screen name="ManageLabelsModal" component={ManageLabelsModal} />
        <Stack.Screen name="UpdateLeadStatus" component={UpdateLeadStatusModal} />
        <Stack.Screen name="ArchivedChats" component={ArchivedChatsScreen} />
        <Stack.Screen name="WhatsAppConfig" component={WhatsAppConfigScreen} />
        <Stack.Screen name="ConnectionHealth" component={ConnectionHealthScreen} />
        <Stack.Screen name="ApiCredentials" component={ApiCredentialsScreen} />
        <Stack.Screen name="WebhookSettings" component={WebhookSettingsScreen} />
        <Stack.Screen name="SubscribedEvents" component={SubscribedEventsScreen} />
        <Stack.Screen name="PhoneNumberStatus" component={PhoneNumberStatusScreen} />
        <Stack.Screen name="WhatsAppTwoStep" component={WhatsAppTwoStepScreen} />
        <Stack.Screen name="WhatsAppDisconnected" component={WhatsAppDisconnectedScreen} />
        <Stack.Screen name="ReconnectWhatsApp" component={ReconnectWhatsAppScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="CommerceHub" component={CommerceHubScreen} />
        <Stack.Screen name="PaymentList" component={PaymentListScreen} />
        <Stack.Screen name="PaymentDetails" component={PaymentDetailsScreen} />
        <Stack.Screen name="AutomationDashboard" component={AutomationDashboardScreen} />
        <Stack.Screen name="CreateAutomation" component={CreateAutomationScreen} />
        <Stack.Screen name="AutomationFlowBuilder" component={AutomationFlowBuilderScreen} />
        <Stack.Screen name="AutomationNodeConfig" component={AutomationNodeConfigScreen} />
        <Stack.Screen name="PublishAutomation" component={PublishAutomationScreen} />
        <Stack.Screen name="AutomationSimulator" component={AutomationSimulatorScreen} />
        <Stack.Screen name="CommerceCatalog" component={CommerceCatalogScreen} />
        <Stack.Screen name="Inventory" component={InventoryScreen} />
        <Stack.Screen name="BillingInvoices" component={BillingInvoicesScreen} />
        <Stack.Screen name="ContactGroups" component={ContactGroupsScreen} />
        <Stack.Screen name="MediaLibrary" component={MediaLibraryScreen} />
        <Stack.Screen name="WhatsAppQr" component={WhatsAppQrScreen} />
        <Stack.Screen name="TeamPerformance" component={TeamPerformanceScreen} />
        <Stack.Screen name="SuppliersPurchases" component={SuppliersPurchasesScreen} />
        <Stack.Screen name="CategoriesCustomers" component={CategoriesCustomersScreen} />
        <Stack.Screen name="TeamManagement" component={TeamManagementScreen} />
        <Stack.Screen name="EntitiesBookings" component={EntitiesBookingsScreen} />
        <Stack.Screen name="WorkspaceSettings" component={WorkspaceSettingsScreen} />
        <Stack.Screen name="SubscriptionPlans" component={SubscriptionPlansScreen} />
        <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
        <Stack.Screen name="TermsConditions" component={TermsConditionsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
