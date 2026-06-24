// src/components/common/LoadingSpinner.js
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import KalamLogo from './KalamLogo';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0.4)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation for logo scale
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.03,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Pulse animation for text opacity
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.4,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [scaleAnim, opacityAnim]);

  return (
    <LinearGradient
      colors={['#0F0A1E', '#080415']}
      style={styles.container}
    >
      <View style={styles.contentContainer}>
        {/* Pulsing Outer Nebula Glow */}
        <Animated.View 
          style={[
            styles.glowRing, 
            { transform: [{ scale: scaleAnim }] }
          ]}
        >
          {/* Inner Golden Halo Circle */}
          <View style={styles.haloCircle}>
            <KalamLogo size="large" />
          </View>
        </Animated.View>

        {/* Fading text loader */}
        <Animated.Text style={[styles.message, { opacity: opacityAnim }]}>
          {message}
        </Animated.Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#080415',
  },
  contentContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowRing: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(124, 58, 237, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  haloCircle: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1.5,
    borderColor: 'rgba(245, 158, 11, 0.22)', // Subtle Golden accent border
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 4,
  },
  message: {
    marginTop: 32,
    fontSize: 13,
    fontWeight: '700',
    color: '#FCD34D', // Gold Accent Text
    textAlign: 'center',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },
});

export default LoadingSpinner;
