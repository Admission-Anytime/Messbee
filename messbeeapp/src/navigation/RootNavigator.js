import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import SplashScreen from '../screens/onboarding/SplashScreen';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import OtpVerificationScreen from '../screens/auth/OtpVerificationScreen';
import PhoneVerifiedSuccessScreen from '../screens/auth/PhoneVerifiedSuccessScreen';
import BottomTabNavigator from './BottomTabNavigator';
import ChatDetailScreen from '../screens/main/ChatDetailScreen';
import ContactCrmScreen from '../screens/main/ContactCrmScreen';
import TemplateSelectionScreen from '../screens/main/TemplateSelectionScreen';
import BotMenuScreen from '../screens/main/BotMenuScreen';
import CrmPipelineScreen from '../screens/main/CrmPipelineScreen';
import LabelsScreen from '../screens/main/LabelsScreen';
import TemplatesScreen from '../screens/main/TemplatesScreen';
import BroadcastCampaignsScreen from '../screens/main/BroadcastCampaignsScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import BusinessProfileScreen from '../screens/main/BusinessProfileScreen';
import PersonalInfoScreen from '../screens/main/PersonalInfoScreen';
import ApiManagementScreen from '../screens/main/ApiManagementScreen';
import SecuritySettingsScreen from '../screens/main/SecuritySettingsScreen';
import NotificationsSettingsScreen from '../screens/main/NotificationsSettingsScreen';
import WhatsAppConfigScreen from '../screens/whatsappConfig/WhatsAppConfigScreen';
import ConnectionHealthScreen from '../screens/whatsappConfig/ConnectionHealthScreen';
import ApiCredentialsScreen from '../screens/whatsappConfig/ApiCredentialsScreen';
import WebhookSettingsScreen from '../screens/whatsappConfig/WebhookSettingsScreen';
import SubscribedEventsScreen from '../screens/whatsappConfig/SubscribedEventsScreen';
import PhoneNumberStatusScreen from '../screens/whatsappConfig/PhoneNumberStatusScreen';
import WhatsAppTwoStepScreen from '../screens/whatsappConfig/WhatsAppTwoStepScreen';
import WhatsAppDisconnectedScreen from '../screens/whatsappConfig/WhatsAppDisconnectedScreen';
import ReconnectWhatsAppScreen from '../screens/whatsappConfig/ReconnectWhatsAppScreen';

const Stack = createStackNavigator();

export default function RootNavigator() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Show splash screen for 1.5 seconds on app start
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!isReady) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
        <Stack.Screen name="PhoneVerifiedSuccess" component={PhoneVerifiedSuccessScreen} />
        <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
        <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
        <Stack.Screen name="ContactCRM" component={ContactCrmScreen} />
        <Stack.Screen name="TemplateSelection" component={TemplateSelectionScreen} />
        <Stack.Screen name="BotMenu" component={BotMenuScreen} />
        <Stack.Screen name="CrmPipeline" component={CrmPipelineScreen} />
        <Stack.Screen name="Labels" component={LabelsScreen} />
        <Stack.Screen name="Templates" component={TemplatesScreen} />
        <Stack.Screen name="BroadcastCampaigns" component={BroadcastCampaignsScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="BusinessProfile" component={BusinessProfileScreen} />
        <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
        <Stack.Screen name="ApiManagement" component={ApiManagementScreen} />
        <Stack.Screen name="SecuritySettings" component={SecuritySettingsScreen} />
        <Stack.Screen name="NotificationsSettings" component={NotificationsSettingsScreen} />
        <Stack.Screen name="WhatsAppConfig" component={WhatsAppConfigScreen} />
        <Stack.Screen name="ConnectionHealth" component={ConnectionHealthScreen} />
        <Stack.Screen name="ApiCredentials" component={ApiCredentialsScreen} />
        <Stack.Screen name="WebhookSettings" component={WebhookSettingsScreen} />
        <Stack.Screen name="SubscribedEvents" component={SubscribedEventsScreen} />
        <Stack.Screen name="PhoneNumberStatus" component={PhoneNumberStatusScreen} />
        <Stack.Screen name="WhatsAppTwoStep" component={WhatsAppTwoStepScreen} />
        <Stack.Screen name="WhatsAppDisconnected" component={WhatsAppDisconnectedScreen} />
        <Stack.Screen name="ReconnectWhatsApp" component={ReconnectWhatsAppScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
