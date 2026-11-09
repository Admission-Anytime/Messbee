import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, Dimensions, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { COLORS, GRADIENTS } from '../../constants/colors';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Connect with\nCustomers',
    subtitle: 'Manage all your customer connections\nin one simple place.',
  },
  {
    id: '2',
    title: 'Automate Your\nConversations',
    subtitle: 'Send campaigns, bot smart replies, and\nsave time with powerful automation.',
  },
  {
    id: '3',
    title: 'Grow with\nMessBee',
    subtitle: 'Build stronger relationships and deliver\nbetter customer experience with AI tools.',
  },
];

const Dot = ({ active }) => (
  <View style={[styles.dot, active && styles.dotActive]} />
);

export default function OnboardingScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatRef = useRef(null);

  const onViewRef = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  });

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      navigation.replace('Login');
    }
  };

  const handleSkip = () => navigation.replace('Login');

  const renderSlide = ({ item, index }) => (
    <View style={styles.slide}>
      {/* Illustration placeholder - replace with actual images */}
      <View style={styles.illustrationBox}>
        <Text style={styles.illustrationEmoji}>
          {index === 0 ? '👥' : index === 1 ? '🤖' : '📈'}
        </Text>
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.subtitle}>{item.subtitle}</Text>
    </View>
  );

  return (
    <LinearGradient colors={GRADIENTS.onboarding} style={styles.container}>
      <StatusBar style="light" />

      {/* Skip */}
      {currentIndex < SLIDES.length - 1 && (
        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      <FlatList
        ref={flatRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewRef.current}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
      />

      {/* Dots */}
      <View style={styles.dotsRow}>
        {SLIDES.map((_, i) => <Dot key={i} active={i === currentIndex} />)}
      </View>

      {/* Next / Get Started */}
      <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
        <Text style={styles.nextText}>
          {currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
        </Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  skipBtn: {
    position: 'absolute', top: 56, right: 24, zIndex: 10,
  },
  skipText: { color: '#fff', fontSize: 14, opacity: 0.8 },
  slide: {
    width, alignItems: 'center', paddingHorizontal: 32, paddingTop: 100,
  },
  illustrationBox: {
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 40,
  },
  illustrationEmoji: { fontSize: 80 },
  title: {
    fontSize: 32, fontWeight: '800', color: '#fff',
    textAlign: 'center', lineHeight: 42, marginBottom: 16,
  },
  subtitle: {
    fontSize: 15, color: 'rgba(255,255,255,0.75)',
    textAlign: 'center', lineHeight: 24,
  },
  dotsRow: {
    flexDirection: 'row', justifyContent: 'center',
    marginBottom: 24, gap: 8,
  },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  dotActive: { backgroundColor: '#fff', width: 24 },
  nextBtn: {
    marginHorizontal: 32, marginBottom: 48,
    backgroundColor: '#fff', borderRadius: 14,
    paddingVertical: 16, alignItems: 'center',
  },
  nextText: { color: COLORS.primaryDark, fontSize: 16, fontWeight: '700' },
});

