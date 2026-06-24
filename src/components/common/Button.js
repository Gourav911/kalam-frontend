// src/components/common/Button.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING } from '../../constants/theme';

const Button = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'medium', 
  loading = false, 
  disabled = false,
  style,
  ...props 
}) => {
  const getButtonContent = () => {
    if (loading) {
      return <ActivityIndicator color={COLORS.text.primary} size="small" />;
    }
    return <Text style={getTextStyle()}>{title}</Text>;
  };

  const getTextStyle = () => {
    const baseStyle = [styles.text];
    if (variant === 'outline') {
      baseStyle.push(styles.outlineText);
    }
    return baseStyle;
  };

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        style={[styles.button, styles[size], style]}
        onPress={onPress}
        disabled={disabled || loading}
        {...props}
      >
        <LinearGradient
          colors={['#6B46C1', '#8B5CF6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradient, disabled && styles.disabled]}
        >
          {getButtonContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'secondary') {
    return (
      <TouchableOpacity
        style={[styles.button, styles[size], style]}
        onPress={onPress}
        disabled={disabled || loading}
        {...props}
      >
        <LinearGradient
          colors={['#F59E0B', '#FBBF24']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradient, disabled && styles.disabled]}
        >
          {getButtonContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // Outline variant
  return (
    <TouchableOpacity
      style={[styles.button, styles[size], styles.outline, style, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled || loading}
      {...props}
    >
      {getButtonContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradient: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  small: {
    borderRadius: 8,
  },
  medium: {
    borderRadius: 12,
  },
  large: {
    borderRadius: 16,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: COLORS.text.primary,
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
  },
  outlineText: {
    color: COLORS.primary,
  },
});

export default Button;
