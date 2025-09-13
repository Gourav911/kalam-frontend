
// src/components/common/LoadingSpinner.js
import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING } from '../../constants/theme';
import KalamLogo from './KalamLogo';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <LinearGradient
      colors={['#1F1B2E', '#2D2438', '#6B46C1']}
      style={styles.container}
    >
      <KalamLogo size="medium" />
      <ActivityIndicator size="large" color={COLORS.secondary} style={styles.spinner} />
      <Text style={styles.message}>{message}</Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  spinner: {
    marginVertical: SPACING.lg,
  },
  message: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
});

export default LoadingSpinner;