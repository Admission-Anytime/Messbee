import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.centerBox}>
        {/* White circle badge with official logo */}
        <View style={styles.logoCircle}>
          <Image
            source={require('../../../assets/splash_badge_clean.png')}
            style={styles.badgeImage}
            resizeMode="contain"
          />
        </View>

        {/* Clean brand title */}
        <Text style={styles.brandTitle}>Messbee</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00B67A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 12,
    marginBottom: 24,
    overflow: 'hidden',
  },
  badgeImage: {
    width: 130,
    height: 130,
  },
  brandTitle: {
    fontSize: 38,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
});
