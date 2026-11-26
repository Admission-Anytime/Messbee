import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * 5-option bottom navigation bar (Home, Chats, Contacts, Campaigns, More)
 * matching BottomTabNavigator for stack screens accessed from More/Tabs.
 */
export default function MainBottomBar({ navigation, activeTab = 'More' }) {
  const tabs = [
    { key: 'Home', label: 'Home', icon: 'home-outline', activeIcon: 'home' },
    { key: 'Chats', label: 'Chats', icon: 'chatbubble-outline', activeIcon: 'chatbubble' },
    { key: 'Contacts', label: 'Contacts', icon: 'people-outline', activeIcon: 'people' },
    { key: 'Campaigns', label: 'Campaigns', icon: 'megaphone-outline', activeIcon: 'megaphone' },
    { key: 'More', label: 'More', icon: 'grid-outline', activeIcon: 'grid' },
  ];

  return (
    <View style={styles.bar}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabBtn}
            onPress={() => navigation.navigate('MainTabs', { screen: tab.key })}
            activeOpacity={0.75}
          >
            <View style={[styles.iconPill, isActive && styles.iconPillActive]}>
              <Ionicons
                name={isActive ? tab.activeIcon : tab.icon}
                size={20}
                color={isActive ? '#00875A' : '#94A3B8'}
              />
            </View>
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 22 : 10,
    elevation: 8,
  },
  tabBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  iconPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 2,
  },
  iconPillActive: {
    backgroundColor: '#E8F8F2',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  labelActive: {
    color: '#00875A',
    fontWeight: '700',
  },
});
