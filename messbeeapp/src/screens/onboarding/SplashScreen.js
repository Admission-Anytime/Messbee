import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { GRADIENTS } from '../../constants/colors';

export default function SplashScreen() {
  return (
    <LinearGradient colors={GRADIENTS.splash} style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.logoContainer}>
        {/* Replace with actual logo image */}
        <View style={styles.logoCircle}>
          <Text style={styles.logoEmoji}>🐝</Text>
        </View>
        <Text style={styles.logoText}>Messbee</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logoContainer: { alignItems: 'center' },
  logoCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
  },
  logoEmoji: { fontSize: 50 },
  logoText: {
    fontSize: 36, fontWeight: '800', color: '#fff', letterSpacing: 1,
  },
});

