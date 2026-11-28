import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeScreen from '../screens/main/HomeScreen';
import ChatsScreen from '../screens/main/ChatsScreen';
import ContactsScreen from '../screens/main/ContactsScreen';
import BroadcastCampaignsScreen from '../screens/main/BroadcastCampaignsScreen';
import MoreScreen from '../screens/main/MoreScreen';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, Platform.OS === 'ios' ? 20 : 10);
  const tabHeight = 56 + bottomPad;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#00875A',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F1F5F9',
          height: tabHeight,
          paddingBottom: bottomPad,
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
          } else if (route.name === 'Campaigns') {
            iconName = focused ? 'megaphone' : 'megaphone-outline';
          } else if (route.name === 'More') {
            iconName = focused ? 'grid' : 'grid-outline';
          }

          return <Ionicons name={iconName} size={21} color={color} />;
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
        name="Campaigns"
        component={BroadcastCampaignsScreen}
        options={{
          tabBarLabel: 'Campaigns',
          tabBarStyle: { display: 'none' },
        }}
      />
      <Tab.Screen
        name="More"
        component={MoreScreen}
        options={{
          tabBarLabel: 'More',
        }}
      />
    </Tab.Navigator>
  );
}
