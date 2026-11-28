import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

export default function TemplateVariablesScreen({ route, navigation }) {
  const { template, contact } = route.params || {};
  const varLabels = Array.isArray(template?.variables) && template.variables.length > 0
    ? template.variables
    : ['Variable 1'];

  // Initialize dynamic variable map from template placeholders
  const [variables, setVariables] = useState(() => {
    const initial = {};
    varLabels.forEach((_, idx) => {
      initial[idx + 1] = idx === 0 ? (contact?.name || '') : '';
    });
    return initial;
  });

  // Calculate rendered text with replacements
  const getRenderedPreview = () => {
    let text = template?.body || '';
    Object.keys(variables).forEach((key) => {
      const val = variables[key] || `{{${key}}}`;
      text = text.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), val);
    });
    return text;
  };

  const handleContinue = () => {
    const missing = varLabels.findIndex((_, idx) => !String(variables[idx + 1] || '').trim());
    if (missing !== -1) {
      Alert.alert('Validation Error', `Please fill in ${varLabels[missing]} ({{${missing + 1}}}).`);
      return;
    }
    navigation.navigate('ConfirmSendTemplate', {
      template,
      contact,
      variables,
      renderedText: getRenderedPreview(),
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* Header (Matching Image 2 Screen 5) */}
      <View style={styles.header}>
        <View style={styles.headerTitleBox}>
          <View style={styles.templateIconSquare}>
            <Ionicons name="document-text-outline" size={18} color="#00875A" />
          </View>
          <View>
            <Text style={styles.headerTag}>MESSBEE</Text>
            <Text style={styles.headerTitle}>Template Variables</Text>
          </View>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('ChatDetail', { chat: contact })} style={styles.closeBtn}>
          <Ionicons name="close" size={22} color="#0F172A" />
        </TouchableOpacity>
      </View>

      {/* Stepper Progress Indicator */}
      <View style={styles.stepperContainer}>
        <View style={[styles.stepCircle, styles.stepCircleActive]}>
          <Text style={styles.stepNumActive}>1</Text>
        </View>
        <View style={styles.stepLine} />
        <View style={styles.stepCircle}>
          <Text style={styles.stepNum}>2</Text>
        </View>
        <View style={styles.stepLine} />
        <View style={styles.stepCircle}>
          <Text style={styles.stepNum}>3</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTag}>PERSONALIZE MESSAGE</Text>
        <Text style={styles.mainTitle}>Complete required details</Text>
        <Text style={styles.subTitle}>Values are inserted into the template before sending.</Text>

        {/* Dynamic Variables Form */}
        {varLabels.map((label, idx) => {
          const varIndex = idx + 1;
          return (
            <View key={varIndex} style={styles.fieldCard}>
              <View style={styles.fieldLabelRow}>
                <Text style={styles.fieldLabel}>{label}</Text>
                <Text style={styles.requiredTag}>Required</Text>
              </View>

              <View style={styles.inputWithBadge}>
                <View style={styles.varBadge}>
                  <Text style={styles.varBadgeText}>{`{${varIndex}}`}</Text>
                </View>
                <TextInput
                  style={styles.textInput}
                  value={variables[varIndex] || ''}
                  onChangeText={(text) => setVariables({ ...variables, [varIndex]: text })}
                  placeholder={`Enter ${label.toLowerCase()}`}
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>
          );
        })}

        {/* Live Preview Card */}
        <Text style={styles.previewHeading}>PREVIEW</Text>
        <View style={styles.previewBubbleBox}>
          <Text style={styles.previewBubbleText}>{getRenderedPreview()}</Text>
          <View style={styles.previewFooter}>
            <Text style={styles.previewTime}>10:45 AM</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footerBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.continueBtn} onPress={handleContinue} activeOpacity={0.85}>
          <Text style={styles.continueBtnText}>Continue</Text>
          <Ionicons name="chevron-forward" size={16} color="#FFFFFF" style={{ marginLeft: 4 }} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
  },
  headerTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  templateIconSquare: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerTag: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#00875A',
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: '#00875A',
    borderColor: '#00875A',
  },
  stepNum: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  stepNumActive: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stepLine: {
    width: 44,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
  },
  sectionTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  subTitle: {
    fontSize: 12.5,
    color: '#64748B',
    marginBottom: 20,
  },
  fieldCard: {
    marginBottom: 24,
  },
  fieldLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  requiredTag: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#EF4444',
  },
  inputWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
  },
  varBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 8,
  },
  varBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#00875A',
  },
  textInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#0F172A',
  },
  previewHeading: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  previewBubbleBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    borderRadius: 16,
    padding: 14,
  },
  previewBubbleText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#064E3B',
  },
  previewFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 6,
  },
  previewTime: {
    fontSize: 10,
    color: '#94A3B8',
  },
  footerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  backBtn: {
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  backBtnText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#64748B',
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00875A',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
  },
  continueBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
