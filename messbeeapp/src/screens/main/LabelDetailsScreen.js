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

export default function LabelDetailsScreen({ route, navigation }) {
  const { label = { name: 'Sumit yadav', description: 'ux designer', color: '#F59E0B', creator: 'Admission Anytime', contactsCount: 0 } } =
    route.params || {};

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

        <Text style={styles.headerTitle}>Label Details</Text>

        <TouchableOpacity
          style={styles.moreBtn}
          onPress={() => navigation.navigate('EditLabel', { label })}
        >
          <Ionicons name="ellipsis-horizontal" size={20} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ================= HERO TAG VISUAL ================= */}
        <View style={styles.heroSection}>
          <View style={[styles.heroTagCircle, { backgroundColor: label.color + '20' }]}>
            <Ionicons name="pricetag" size={28} color={label.color} />
          </View>
          <Text style={styles.heroTitle}>{label.name}</Text>
          {label.description ? <Text style={styles.heroSubtitle}>{label.description}</Text> : null}
        </View>

        {/* ================= LABEL INFORMATION CARD ================= */}
        <View style={styles.cardContainer}>
          <Text style={styles.cardHeaderTitle}>Label information</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Color</Text>
            <View style={styles.colorPill}>
              <View style={[styles.colorSquare, { backgroundColor: label.color }]} />
              <Text style={styles.colorHexText}>{label.color}</Text>
            </View>
          </View>

          <View style={styles.rowDivider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Created by</Text>
            <Text style={styles.infoValue}>{label.creator || 'Admission Anytime'}</Text>
          </View>

          <View style={styles.rowDivider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Associated contacts</Text>
            <Text style={styles.infoValue}>{label.contactsCount || 0}</Text>
          </View>
        </View>

        {/* ================= ASSIGNED CONTACTS CARD ================= */}
        <View style={styles.cardContainer}>
          <View style={styles.assignedHeaderRow}>
            <Text style={styles.cardHeaderTitle}>Assigned contacts</Text>
            <TouchableOpacity
              style={styles.addContactIconBtn}
              onPress={() => Alert.alert('Assign Contacts', 'Select contacts to add to this label.')}
            >
              <Ionicons name="add" size={18} color="#00875A" />
            </TouchableOpacity>
          </View>

          <View style={styles.emptyAssignedBox}>
            <Text style={styles.emptyAssignedTitle}>No contacts assigned.</Text>
            <Text style={styles.emptyAssignedDesc}>
              Apply contacts to this label to organise them more effectively.
            </Text>

            <TouchableOpacity
              style={styles.assignContactsBtn}
              onPress={() => Alert.alert('Assign Contacts', 'Select contacts from your list.')}
              activeOpacity={0.7}
            >
              <Text style={styles.assignContactsBtnText}>Assign Contacts</Text>
            </TouchableOpacity>
          </View>
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
    fontSize: 16.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  moreBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  heroTagCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 3,
  },

  // Cards
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  cardHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 12.5,
    color: '#64748B',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  colorPill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorSquare: {
    width: 12,
    height: 12,
    borderRadius: 3,
    marginRight: 6,
  },
  colorHexText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },

  // Assigned Contacts
  assignedHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addContactIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyAssignedBox: {
    alignItems: 'center',
    paddingVertical: 18,
  },
  emptyAssignedTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  emptyAssignedDesc: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 17,
    maxWidth: 240,
    marginBottom: 14,
  },
  assignContactsBtn: {
    borderRadius: 12,
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  assignContactsBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
});
