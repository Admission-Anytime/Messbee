import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { templateService } from '../../services/api';

const CATEGORIES = ['All', 'Utility', 'Marketing', 'Authentication'];

const DEFAULT_TEMPLATES = [
  {
    id: 't1',
    name: 'admission_welcome_v1',
    category: 'Utility',
    language: 'en_US',
    status: 'Approved',
    updated: 'Updated 2 days ago',
    body: 'Hello {{1}}, thank you for contacting Admission Anytime. We have received your inquiry and our counseling team will get in touch with you shortly.',
    variables: ['Customer Name'],
  },
  {
    id: 't2',
    name: 'testing',
    category: 'Marketing',
    language: 'en_US',
    status: 'Approved',
    updated: 'Updated 5 days ago',
    body: 'Hello, welcome to Admission Anytime.',
    variables: [],
  },
  {
    id: 't3',
    name: 'custom',
    category: 'Marketing',
    language: 'en_US',
    status: 'Approved',
    updated: 'Updated 1 week ago',
    body: 'the main purpose for testing metam gd',
    variables: [],
  },
  {
    id: 't4',
    name: 'login_code',
    category: 'Authentication',
    language: 'en',
    status: 'Approved',
    updated: 'Updated 3 weeks ago',
    body: 'Your login code is {{1}}. This code expires in 10 minutes.',
    variables: ['Login Code'],
  },
];

export default function TemplateSelectionScreen({ route, navigation }) {
  const { contact = { name: '919350157447', phone: '+91 9350157447' } } = route.params || {};

  const [templates, setTemplates] = useState(DEFAULT_TEMPLATES);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(DEFAULT_TEMPLATES[0]);

  // Load real templates from Meta API / DB
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const live = await templateService.getTemplates();
        if (Array.isArray(live) && live.length > 0) {
          const mapped = live.map((item, idx) => {
            const bodyComponent = item.components?.find((c) => c.type === 'BODY') || {};
            const rawBody = bodyComponent.text || item.body || 'Template message';
            const vars = [];
            const matches = rawBody.match(/\{\{(\d+)\}\}/g);
            if (matches) {
              matches.forEach((_, i) => vars.push(`Variable ${i + 1}`));
            }
            return {
              id: item.id || `live_${idx}`,
              name: item.name || `template_${idx}`,
              category: item.category || 'Utility',
              language: item.language || 'en_US',
              status: item.status || 'Approved',
              updated: 'Recently synced',
              body: rawBody,
              variables: vars.length > 0 ? vars : ['Customer Name'],
            };
          });
          setTemplates(mapped);
          setSelectedTemplate(mapped[0]);
        }
      } catch (err) {
        console.log('Template fetch note:', err.message);
      }
    };
    fetchTemplates();
  }, []);

  const filteredTemplates = templates.filter((t) => {
    if (selectedCategory !== 'All' && t.category.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return t.name.toLowerCase().includes(q) || t.body.toLowerCase().includes(q);
    }
    return true;
  });

  const handleUseTemplate = () => {
    if (!selectedTemplate) return;
    navigation.navigate('TemplateVariables', {
      template: selectedTemplate,
      contact,
    });
  };

  const renderTemplateCard = ({ item }) => {
    const isSelected = selectedTemplate?.id === item.id;
    return (
      <TouchableOpacity
        style={[styles.templateCard, isSelected && styles.templateCardSelected]}
        onPress={() => setSelectedTemplate(item)}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeaderRow}>
          {/* Radio circle */}
          <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
            {isSelected && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
          </View>

          <Text style={styles.templateTitle} numberOfLines={1}>{item.name}</Text>

          <View style={styles.approvedBadge}>
            <Text style={styles.approvedBadgeText}>{item.status}</Text>
          </View>
        </View>

        {/* Body Snippet */}
        <Text style={styles.templateBodySnippet} numberOfLines={2}>
          {item.body}
        </Text>

        {/* Tags Row */}
        <View style={styles.tagsRow}>
          <View style={styles.tagPill}>
            <Text style={styles.tagPillText}>{item.category}</Text>
          </View>
          <View style={styles.tagPill}>
            <Text style={styles.tagPillText}>{item.language}</Text>
          </View>
          <Text style={styles.updatedText}>{item.updated}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* Header (Matching Image 1 Screen 4) */}
      <View style={styles.header}>
        <View style={styles.headerTitleBox}>
          <View style={styles.templateIconSquare}>
            <Ionicons name="document-text-outline" size={18} color="#00875A" />
          </View>
          <View>
            <Text style={styles.headerTag}>MESSBEE</Text>
            <Text style={styles.headerTitle}>Select Template</Text>
          </View>
        </View>

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Ionicons name="close" size={22} color="#0F172A" />
        </TouchableOpacity>
      </View>

      {/* Sending to Subheader Pill */}
      <View style={styles.sendingPillContainer}>
        <View style={styles.sendingPill}>
          <Ionicons name="send" size={12} color="#00875A" style={{ marginRight: 6 }} />
          <Text style={styles.sendingPillText}>Sending to: {contact.name || contact.phone || '919350157447'}</Text>
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchSection}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={17} color="#94A3B8" style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search templates by name or tag..."
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabsContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(c) => c}
          renderItem={({ item }) => {
            const isTabActive = selectedCategory === item;
            return (
              <TouchableOpacity
                style={[styles.categoryTab, isTabActive && styles.categoryTabActive]}
                onPress={() => setSelectedCategory(item)}
                activeOpacity={0.8}
              >
                <Text style={[styles.categoryTabText, isTabActive && styles.categoryTabTextActive]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={styles.tabsList}
        />
      </View>

      {/* Template Info Header */}
      <View style={styles.listHeaderRow}>
        <Text style={styles.templatesCount}>{filteredTemplates.length} templates</Text>
        <Text style={styles.tapPreviewText}>Tap a card to preview</Text>
      </View>

      {/* Templates List */}
      <FlatList
        data={filteredTemplates}
        keyExtractor={(item) => item.id}
        renderItem={renderTemplateCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Footer Actions */}
      <View style={styles.footerBar}>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.useTemplateBtn}
          onPress={handleUseTemplate}
          activeOpacity={0.85}
        >
          <Text style={styles.useTemplateBtnText}>Use Template</Text>
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
    paddingTop: Platform.OS === 'android' ? 36 : 0,
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
  sendingPillContainer: {
    paddingHorizontal: 16,
    marginVertical: 6,
  },
  sendingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  sendingPillText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#00875A',
  },
  searchSection: {
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
  },
  tabsContainer: {
    marginBottom: 10,
  },
  tabsList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
  },
  categoryTabActive: {
    backgroundColor: '#00875A',
  },
  categoryTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  categoryTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    marginBottom: 8,
  },
  templatesCount: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#94A3B8',
  },
  tapPreviewText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  templateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  templateCardSelected: {
    borderColor: '#00875A',
    borderWidth: 1.5,
    backgroundColor: '#FAFCFA',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioCircleSelected: {
    backgroundColor: '#00875A',
    borderColor: '#00875A',
  },
  templateTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    marginRight: 8,
  },
  approvedBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  approvedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#166534',
  },
  templateBodySnippet: {
    fontSize: 12.5,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 10,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 6,
  },
  tagPillText: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '600',
  },
  updatedText: {
    fontSize: 10.5,
    color: '#94A3B8',
    marginLeft: 'auto',
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
  cancelBtn: {
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  cancelBtnText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#64748B',
  },
  useTemplateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00875A',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
  },
  useTemplateBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
