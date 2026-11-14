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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
