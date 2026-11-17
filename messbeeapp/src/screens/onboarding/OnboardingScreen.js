import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Image,
  SafeAreaView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    titleGreen: 'Connect with',
    titleDark: 'Customers',
    subtitle: 'Manage all your customer conversations in one simple inbox.',
    buttonText: 'Next',
  },
  {
    id: '2',
    titleGreen: 'Automate Your',
    titleDark: 'Conversations',
    subtitle: 'Send campaigns, set smart replies, and save time with powerful automation.',
    buttonText: 'Next',
  },
  {
    id: '3',
    titleGreen: 'Grow with',
    titleDark: 'MessBee',
    subtitle: 'Build stronger relationships and deliver better customer experiences with AI powered tools.',
    buttonText: 'Finish',
  },
];

export default function OnboardingScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatRef = useRef(null);

  const onViewRef = useRef(({ viewableItems }) => {
    if (viewableItems && viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  });

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      navigation.replace('Login');
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      flatRef.current?.scrollToIndex({ index: currentIndex - 1, animated: true });
    }
  };

  const handleSkip = () => {
    navigation.replace('Login');
  };

  // Render Graphic for Slide 1: Character & 3 Chat Notifications
  const renderSlide1Graphic = () => (
    <View style={styles.graphicRow}>
      {/* Left Column: 3D Character Box */}
      <View style={styles.leftCharacterBox}>
        {/* Floating WhatsApp Badge */}
        <View style={styles.floatWhatsappBadge}>
          <Ionicons name="logo-whatsapp" size={20} color="#FFFFFF" />
        </View>

        {/* Character Image */}
        <Image
          source={require('../../../assets/hero_character_1.jpg')}
          style={styles.heroCharacterImage}
          resizeMode="cover"
        />
      </View>

      {/* Right Column: 3 Floating Chat Cards */}
      <View style={styles.rightChatCardsStack}>
        {/* Card 1: Priya Sharma */}
        <View style={styles.chatCard}>
          <View style={[styles.avatarBox, { backgroundColor: '#FCE7F3' }]}>
            <Text style={styles.avatarEmoji}>👩‍💼</Text>
          </View>
          <View style={styles.chatCardBody}>
            <View style={styles.chatCardHeader}>
              <Text style={styles.chatSenderName}>Priya Sharma</Text>
              <Ionicons name="logo-whatsapp" size={13} color="#25D366" />
            </View>
            <Text style={styles.chatMsgSnippet} numberOfLines={1}>
              Hi, I want to know about menu?
            </Text>
          </View>
        </View>

        {/* Card 2: Rahul Mehta */}
        <View style={styles.chatCard}>
          <View style={[styles.avatarBox, { backgroundColor: '#E0F2FE' }]}>
            <Text style={styles.avatarEmoji}>👨‍💻</Text>
          </View>
          <View style={styles.chatCardBody}>
            <View style={styles.chatCardHeader}>
              <Text style={styles.chatSenderName}>Rahul Mehta</Text>
              <Ionicons name="logo-whatsapp" size={13} color="#25D366" />
            </View>
            <Text style={styles.chatMsgSnippet} numberOfLines={1}>
              Is lunch available today?
            </Text>
          </View>
        </View>

        {/* Card 3: Sneha Kapoor */}
        <View style={styles.chatCard}>
          <View style={[styles.avatarBox, { backgroundColor: '#FEF3C7' }]}>
            <Text style={styles.avatarEmoji}>👩‍🦰</Text>
          </View>
          <View style={styles.chatCardBody}>
            <View style={styles.chatCardHeader}>
              <Text style={styles.chatSenderName}>Sneha Kapoor</Text>
              <Ionicons name="logo-whatsapp" size={13} color="#25D366" />
            </View>
            <Text style={styles.chatMsgSnippet} numberOfLines={1}>
              Can I get the price details?
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  // Render Graphic for Slide 2: Metrics Chart & 3 Floating Benefit Pills
  const renderSlide2Graphic = () => (
    <View style={styles.graphicRow}>
      {/* Left: Total Customers Metric Card */}
      <View style={styles.metricCard}>
        <View style={styles.metricHeaderRow}>
          <Text style={styles.metricLabel}>Total Customers</Text>
          <View style={styles.growthBadgePill}>
            <Ionicons name="trending-up" size={11} color="#15803D" />
            <Text style={styles.growthBadgeText}>+24%</Text>
          </View>
        </View>

        <Text style={styles.metricBigNumber}>1,248</Text>

        {/* Dynamic Growth Bar Chart */}
        <View style={styles.chartBarsContainer}>
          <View style={[styles.growthBar, { height: 16 }]} />
          <View style={[styles.growthBar, { height: 26 }]} />
          <View style={[styles.growthBar, { height: 36 }]} />
          <View style={[styles.growthBar, { height: 46 }]} />
          <View style={[styles.growthBar, { height: 56, backgroundColor: '#059669' }]} />
          <View style={[styles.growthBar, { height: 68, backgroundColor: '#10B981' }]} />
        </View>
      </View>

      {/* Right: 3 Benefit Pills */}
      <View style={styles.benefitStack}>
        <View style={styles.benefitPillCard}>
          <View style={[styles.benefitIconCircle, { backgroundColor: '#EFF6FF' }]}>
            <Ionicons name="people" size={16} color="#3B82F6" />
          </View>
          <Text style={styles.benefitPillLabel}>More Engagement</Text>
        </View>

        <View style={styles.benefitPillCard}>
          <View style={[styles.benefitIconCircle, { backgroundColor: '#ECFDF5' }]}>
            <Ionicons name="trending-up" size={16} color="#10B981" />
          </View>
          <Text style={styles.benefitPillLabel}>Higher Retention</Text>
        </View>

        <View style={styles.benefitPillCard}>
          <View style={[styles.benefitIconCircle, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="star" size={16} color="#F59E0B" />
          </View>
          <Text style={styles.benefitPillLabel}>Happier Customers</Text>
        </View>
      </View>
    </View>
  );

  // Render Graphic for Slide 3: Friendly Robot & 3 Automation Workflow Cards
  const renderSlide3Graphic = () => (
    <View style={styles.graphicRow}>
      {/* Left: Friendly AI Robot Mascot */}
      <View style={styles.robotMascotBox}>
        <View style={styles.floatWhatsappBadge}>
          <Ionicons name="logo-whatsapp" size={20} color="#FFFFFF" />
        </View>

        <View style={styles.robotCircleAvatar}>
          <Text style={styles.robotFaceEmoji}>🤖</Text>
          <View style={styles.robotChestBadge}>
            <Text style={styles.beeEmojiSmall}>🐝</Text>
          </View>
        </View>

        {/* Small greeting speech bubble */}
        <View style={styles.robotHelloBubble}>
          <Text style={styles.robotHelloText}>AI Copilot</Text>
        </View>
      </View>

      {/* Right: 3 Workflow Cards */}
      <View style={styles.workflowStack}>
        {/* Card 1: Welcome Message */}
        <View style={styles.workflowCard}>
          <View style={[styles.workflowIconCircle, { backgroundColor: '#3B82F6' }]}>
            <Ionicons name="paper-plane" size={14} color="#FFFFFF" />
          </View>
          <View style={styles.workflowCardBody}>
            <Text style={styles.workflowCardTitle}>Welcome Message</Text>
            <Text style={styles.workflowCardDesc} numberOfLines={2}>
              Send instant welcome messages to new customers
            </Text>
          </View>
        </View>

        {/* Card 2: Auto Reply */}
        <View style={styles.workflowCard}>
          <View style={[styles.workflowIconCircle, { backgroundColor: '#10B981' }]}>
            <Ionicons name="chatbubbles" size={14} color="#FFFFFF" />
          </View>
          <View style={styles.workflowCardBody}>
            <Text style={styles.workflowCardTitle}>Auto Reply</Text>
            <Text style={styles.workflowCardDesc} numberOfLines={2}>
              Reply to common questions automatically
            </Text>
          </View>
        </View>

        {/* Card 3: Campaigns */}
        <View style={styles.workflowCard}>
          <View style={[styles.workflowIconCircle, { backgroundColor: '#8B5CF6' }]}>
            <Ionicons name="megaphone" size={14} color="#FFFFFF" />
          </View>
          <View style={styles.workflowCardBody}>
            <Text style={styles.workflowCardTitle}>Campaigns</Text>
            <Text style={styles.workflowCardDesc} numberOfLines={2}>
              Send offers, menu updates and announcements
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderSlide = ({ item, index }) => (
    <View style={styles.slide}>
      {/* Top Graphic Scene Container */}
      <View style={styles.topSceneContainer}>
        {index === 0 && renderSlide1Graphic()}
        {index === 1 && renderSlide2Graphic()}
        {index === 2 && renderSlide3Graphic()}
      </View>

      {/* Bottom Sheet White Card */}
      <View style={styles.bottomCard}>
        <View style={styles.textContainer}>
          <Text style={styles.titleGreen}>
            {item.titleGreen}{' '}
            <Text style={styles.titleDark}>{item.titleDark}</Text>
          </Text>

          <Text style={styles.subtitle}>{item.subtitle}</Text>
        </View>

        {/* Full-width Solid Green Action Button */}
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={handleNext}
          activeOpacity={0.88}
        >
          <Text style={styles.actionBtnText}>{item.buttonText}</Text>
        </TouchableOpacity>

        {/* Pagination Dots */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === currentIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Top Header Bar (Back & Skip Intro) */}
      <SafeAreaView style={styles.safeHeaderArea}>
        <View style={styles.headerBar}>
          {currentIndex > 0 ? (
            <TouchableOpacity onPress={handleBack} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Text style={styles.headerText}>Back</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 44 }} />
          )}

          <TouchableOpacity onPress={handleSkip} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Text style={styles.headerText}>Skip Intro</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Horizontal Carousel */}
      <FlatList
        ref={flatRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewRef.current}
        viewabilityConfig={viewConfigRef.current}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00B67A',
  },
  safeHeaderArea: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 10 : 0,
    left: 0,
    right: 0,
    zIndex: 30,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: Platform.OS === 'android' ? 24 : 10,
    height: 48,
  },
  headerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.95,
  },
  slide: {
    width,
    height,
    justifyContent: 'space-between',
  },

  /* Top Scene Styles */
  topSceneContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 64 : 74,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  graphicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 4,
  },

  /* Slide 1 - Left Hero Character */
  leftCharacterBox: {
    width: width * 0.38,
    height: width * 0.44,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0BA571',
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 6,
  },
  heroCharacterImage: {
    width: '100%',
    height: '100%',
  },
  floatWhatsappBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#25D366',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },

  /* Slide 1 - Right Chat Cards */
  rightChatCardsStack: {
    flex: 1,
    gap: 8,
  },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 9,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarEmoji: {
    fontSize: 16,
  },
  chatCardBody: {
    flex: 1,
  },
  chatCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  chatSenderName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  chatMsgSnippet: {
    fontSize: 10,
    color: '#4B5563',
    lineHeight: 13,
  },

  /* Slide 2 - Metrics & Benefits */
  metricCard: {
    width: width * 0.42,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  metricHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
  },
  growthBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
    gap: 2,
  },
  growthBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#15803D',
  },
  metricBigNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  chartBarsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 70,
    paddingTop: 6,
  },
  growthBar: {
    width: 14,
    borderRadius: 4,
    backgroundColor: '#34D399',
  },
  benefitStack: {
    flex: 1,
    gap: 8,
  },
  benefitPillCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  benefitIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  benefitPillLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F2937',
  },

  /* Slide 3 - Robot & Automation Workflow */
  robotMascotBox: {
    width: width * 0.36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    position: 'relative',
  },
  robotCircleAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 8,
    position: 'relative',
  },
  robotFaceEmoji: {
    fontSize: 48,
  },
  robotChestBadge: {
    position: 'absolute',
    bottom: 6,
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  beeEmojiSmall: {
    fontSize: 12,
  },
  robotHelloBubble: {
    marginTop: 8,
    backgroundColor: '#064E3B',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  robotHelloText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  workflowStack: {
    flex: 1,
    gap: 8,
  },
  workflowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  workflowIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  workflowCardBody: {
    flex: 1,
  },
  workflowCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  workflowCardDesc: {
    fontSize: 10,
    color: '#6B7280',
    lineHeight: 13,
  },

  /* Bottom White Sheet */
  bottomCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 26,
    paddingTop: 30,
    paddingBottom: Platform.OS === 'ios' ? 36 : 26,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 10,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 22,
  },
  titleGreen: {
    fontSize: 27,
    fontWeight: '800',
    color: '#00B67A',
    textAlign: 'center',
    lineHeight: 34,
  },
  titleDark: {
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 10,
    paddingHorizontal: 8,
  },
  actionBtn: {
    backgroundColor: '#00B67A',
    borderRadius: 16,
    paddingVertical: 15,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00B67A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 4,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 20,
    backgroundColor: '#1D4ED8',
  },
  dotInactive: {
    width: 6,
    backgroundColor: '#D1D5DB',
  },
});
