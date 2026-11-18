import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

import HomeScreen from '../screens/main/HomeScreen';
import ChatsScreen from '../screens/main/ChatsScreen';
import ContactsScreen from '../screens/main/ContactsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
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

const Tab = createBottomTabNavigator();
const YouStack = createStackNavigator();

function YouNavigator() {
  return (
    <YouStack.Navigator screenOptions={{ headerShown: false }}>
      <YouStack.Screen name="YouMain" component={ProfileScreen} />
      <YouStack.Screen name="Settings" component={SettingsScreen} />
      <YouStack.Screen name="BusinessProfile" component={BusinessProfileScreen} />
      <YouStack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
      <YouStack.Screen name="ApiManagement" component={ApiManagementScreen} />
      <YouStack.Screen name="SecuritySettings" component={SecuritySettingsScreen} />
      <YouStack.Screen name="NotificationsSettings" component={NotificationsSettingsScreen} />
      <YouStack.Screen name="WhatsAppConfig" component={WhatsAppConfigScreen} />
      <YouStack.Screen name="ConnectionHealth" component={ConnectionHealthScreen} />
      <YouStack.Screen name="ApiCredentials" component={ApiCredentialsScreen} />
      <YouStack.Screen name="WebhookSettings" component={WebhookSettingsScreen} />
    </YouStack.Navigator>
  );
}

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#00B67A',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F1F5F9',
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.04,
          shadowRadius: 6,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Chats') {
            iconName = focused ? 'chatbubble' : 'chatbubble-outline';
          } else if (route.name === 'Contacts') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'You') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="Chats"
        component={ChatsScreen}
        options={{
          tabBarLabel: 'Chats',
          tabBarBadge: 3,
          tabBarBadgeStyle: {
            backgroundColor: '#00B67A',
            color: '#FFFFFF',
            fontSize: 10,
            fontWeight: '700',
            minWidth: 16,
            height: 16,
            borderRadius: 8,
            lineHeight: 15,
          },
        }}
      />
      <Tab.Screen
        name="Contacts"
        component={ContactsScreen}
        options={{
          tabBarLabel: 'Contacts',
        }}
      />
      <Tab.Screen
        name="You"
        component={YouNavigator}
        options={{
          tabBarLabel: 'You',
        }}
      />
    </Tab.Navigator>
  );
}
