// export default KalamLogo;
// src/components/common/KalamLogo.js
import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { SPACING } from '../../constants/theme';

// Replace with the path to your logo image
import LogoImage from '../../assets/logo_circle.png';

const KalamLogo = ({ size = 'large' }) => {
  const logoSizeStyle =
    size === 'large'
      ? styles.large
      : size === 'medium'
      ? styles.medium
      : styles.small;

  return (
    <View style={[styles.container, logoSizeStyle]}>
      <Image
        source={LogoImage}
        style={[styles.logoImage, logoSizeStyle]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width:"100%",
  },
  logoImage: {
    borderRadius: 84,
  },
  large: {
    marginVertical: SPACING.xl,
    width: 168,
    height: 168,
    borderRadius: 84,
    overflow: 'hidden',
  },
  medium: {
    marginVertical: SPACING.lg,
    width: 150,
    height: 45,
  },
  small: {
    marginVertical: SPACING.md,
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
  },
  extraSmall: {
    marginVertical: SPACING.sm,
    width: 50,
    height: 50,
  }
});

export default KalamLogo;
