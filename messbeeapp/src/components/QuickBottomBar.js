import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * 3-option bottom navigation bar (Home, Notification, You)
 * used on Automation and Commerce stack screens.
 */
export default function QuickBottomBar({ navigation, activeTab = 'Home' }) {
  const tabs = [
    {
      key: 'Home',
      label: 'Home',
      icon: activeTab === 'Home' ? 'home' : 'home-outline',
      onPress: () => navigation.navigate('MainTabs', { screen: 'Home' }),
    },
    {
      key: 'Notification',
      label: 'Notification',
      icon: activeTab === 'Notification' ? 'notifications' : 'notifications-outline',
      onPress: () => navigation.navigate('Notifications'),
    },
    {
      key: 'You',
      label: 'You',
      icon: activeTab === 'You' ? 'person-circle' : 'person-circle-outline',
      onPress: () => navigation.navigate('Profile'),
    },
  ];

  return (
    <View style={styles.bar}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabBtn}
            onPress={tab.onPress}
            activeOpacity={0.75}
          >
            <View style={[styles.iconPill, isActive && styles.iconPillActive]}>
              <Ionicons
                name={tab.icon}
                size={20}
                color={isActive ? '#00875A' : '#64748B'}
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
    borderTopColor: '#E2E8F0',
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 22 : 10,
  },
  tabBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 72,
  },
  iconPill: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 14,
    marginBottom: 2,
  },
  iconPillActive: {
    backgroundColor: '#E8F8F2',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  labelActive: {
    color: '#00875A',
    fontWeight: '700',
  },
});
