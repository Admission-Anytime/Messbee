import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

const CONTACTS_DATA = [
  {
    id: 'c1',
    name: 'Rahul Sharma',
    phone: '+91 98765 43210',
    tags: ['VIP Lead', 'Retail'],
    color: '#FB923C',
    initials: 'RS',
  },
  {
    id: 'c2',
    name: 'Priya Verma',
    phone: '+91 98123 45678',
    tags: ['Active Customer'],
    color: '#60A5FA',
    initials: 'PV',
  },
  {
    id: 'c3',
    name: 'Amit Kumar',
    phone: '+91 97654 32109',
    tags: ['Wholesale', 'Negotiation'],
    color: '#A78BFA',
    initials: 'AK',
  },
  {
    id: 'c4',
    name: 'Anjali Gupta',
    phone: '+91 99887 76655',
    tags: ['New Inquiry'],
    color: '#F472B6',
    initials: 'AG',
  },
  {
    id: 'c5',
    name: 'Vikram Singh',
    phone: '+91 91234 56789',
    tags: ['Enterprise'],
    color: '#34D399',
    initials: 'VS',
  },
];

export default function ContactsScreen({ navigation }) {
  const [search, setSearch] = useState('');

  const filteredContacts = CONTACTS_DATA.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Contacts CRM</Text>
        <TouchableOpacity style={styles.addBtn} activeOpacity={0.8}>
          <Ionicons name="person-add" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchSection}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            placeholder="Search contacts, phone numbers..."
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* List */}
      <FlatList
        data={filteredContacts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.contactCard}>
            <View style={[styles.avatar, { backgroundColor: item.color }]}>
              <Text style={styles.avatarText}>{item.initials}</Text>
            </View>

            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.phone}>{item.phone}</Text>

              <View style={styles.tagsRow}>
                {item.tags.map((tag, idx) => (
                  <View key={idx} style={styles.tagBadge}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={styles.chatActionBtn}
              onPress={() =>
                navigation.navigate('ChatDetail', {
                  chat: {
                    name: item.name,
                    initials: item.initials,
                    color: item.color,
                    online: true,
                  },
                })
              }
              activeOpacity={0.7}
            >
              <Ionicons name="chatbubble-ellipses" size={20} color={COLORS.primaryDark} />
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    paddingBottom: 14,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  phone: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  chatActionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E6F9F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});
