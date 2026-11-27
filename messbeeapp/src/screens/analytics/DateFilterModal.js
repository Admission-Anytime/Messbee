import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const getDateRangeFromPreset = (preset = '30d', customFrom = '', customTo = '') => {
  if (customFrom && customTo) {
    return { startDate: customFrom.trim(), endDate: customTo.trim() };
  }
  const now = new Date();
  const end = now.toISOString().split('T')[0];
  const start = new Date(now);
  if (preset === 'today') {
    return { startDate: end, endDate: end };
  }
  if (preset === 'yesterday') {
    start.setDate(start.getDate() - 1);
    const yest = start.toISOString().split('T')[0];
    return { startDate: yest, endDate: yest };
  }
  if (preset === '7d') {
    start.setDate(start.getDate() - 7);
    return { startDate: start.toISOString().split('T')[0], endDate: end };
  }
  start.setDate(start.getDate() - 30);
  return { startDate: start.toISOString().split('T')[0], endDate: end };
};

export default function DateFilterModal({
  visible,
  onClose,
  activePreset = '30d',
  onApply,
}) {
  const [selectedPreset, setSelectedPreset] = useState(activePreset);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [sortBy, setSortBy] = useState('Daily');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const presets = [
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: '7d', label: 'Last 7 Days' },
    { id: '30d', label: 'Last 30 Days' },
  ];

  const handleApply = () => {
    onApply({
      preset: selectedPreset,
      fromDate,
      toDate,
      sortBy,
    });
    onClose();
  };

  const handleReset = () => {
    setSelectedPreset('30d');
    setFromDate('');
    setToDate('');
    setSortBy('Daily');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          style={styles.sheetContainer}
          onStartShouldSetResponder={() => true}
        >
          <View style={styles.sheetHandle} />

          {/* Header */}
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetTitle}>Date & sorting filters</Text>
              <Text style={styles.sheetSubtitle}>
                Choose a preset or set a custom reporting period.
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Quick data presets */}
          <Text style={styles.sectionHeading}>Quick data presets</Text>
          <View style={styles.presetsGrid}>
            {presets.map((p) => {
              const isSelected = selectedPreset === p.id;
              return (
                <TouchableOpacity
                  key={p.id}
                  style={[
                    styles.presetPill,
                    isSelected && styles.presetPillSelected,
                  ]}
                  onPress={() => setSelectedPreset(p.id)}
                >
                  <Text
                    style={[
                      styles.presetPillText,
                      isSelected && styles.presetPillTextSelected,
                    ]}
                  >
                    {p.label}
                  </Text>
                  {isSelected && (
                    <Ionicons
                      name="checkmark"
                      size={14}
                      color="#00B67A"
                      style={{ marginLeft: 4 }}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* From / To Date Inputs */}
          <View style={styles.dateInputsRow}>
            <View style={styles.dateInputCol}>
              <Text style={styles.inputLabel}>From date</Text>
              <TextInput
                style={styles.dateInput}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#94A3B8"
                value={fromDate}
                onChangeText={setFromDate}
              />
            </View>
            <View style={styles.dateInputCol}>
              <Text style={styles.inputLabel}>To date</Text>
              <TextInput
                style={styles.dateInput}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#94A3B8"
                value={toDate}
                onChangeText={setToDate}
              />
            </View>
          </View>

          {/* Sort data by */}
          <Text style={styles.sectionHeading}>Sort data by</Text>
          <TouchableOpacity
            style={styles.sortDropdown}
            onPress={() => setShowSortDropdown(!showSortDropdown)}
          >
            <Text style={styles.sortDropdownValue}>{sortBy}</Text>
            <Ionicons
              name={showSortDropdown ? 'chevron-up' : 'chevron-down'}
              size={18}
              color="#64748B"
            />
          </TouchableOpacity>

          {showSortDropdown && (
            <View style={styles.sortOptionsList}>
              {['Daily', 'Weekly', 'Monthly'].map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={styles.sortOptionItem}
                  onPress={() => {
                    setSortBy(opt);
                    setShowSortDropdown(false);
                  }}
                >
                  <Text
                    style={[
                      styles.sortOptionText,
                      sortBy === opt && styles.sortOptionTextActive,
                    ]}
                  >
                    {opt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
              <Text style={styles.resetBtnText}>Reset</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
              <Text style={styles.applyBtnText}>Apply Filter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  sheetSubtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  closeBtn: {
    padding: 4,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginTop: 10,
    marginBottom: 8,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  presetPill: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  presetPillSelected: {
    borderColor: '#00B67A',
    backgroundColor: '#EDF9F2',
  },
  presetPillText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  presetPillTextSelected: {
    color: '#00B67A',
    fontWeight: '700',
  },
  dateInputsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  dateInputCol: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 4,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    fontSize: 13,
    color: '#0F172A',
  },
  sortDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 44,
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
  },
  sortDropdownValue: {
    fontSize: 14,
    color: '#0F172A',
  },
  sortOptionsList: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    marginBottom: 14,
    overflow: 'hidden',
  },
  sortOptionItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  sortOptionText: {
    fontSize: 13,
    color: '#475569',
  },
  sortOptionTextActive: {
    color: '#00B67A',
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  resetBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  resetBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  applyBtn: {
    flex: 1,
    backgroundColor: '#00B67A',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  applyBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
