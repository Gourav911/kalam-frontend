
// // src/components/common/KalamLogo.js
// import React from 'react';
// import { View, Text, StyleSheet } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { COLORS, FONTS, SPACING } from '../../constants/theme';

// const KalamLogo = ({ size = 'large' }) => {
//   const logoSize = size === 'large' ? styles.large : size === 'medium' ? styles.medium : styles.small;
  
//   return (
//     <View style={[styles.container, logoSize]}>
//       {/* Fountain Pen Icon (simplified version) */}
//       <View style={styles.penContainer}>
//         <LinearGradient
//           colors={['#4338CA', '#6366F1', '#8B5CF6']}
//           start={{ x: 0, y: 0 }}
//           end={{ x: 1, y: 1 }}
//           style={styles.pen}
//         />
//         <LinearGradient
//           colors={['#F59E0B', '#FBBF24']}
//           start={{ x: 0, y: 0 }}
//           end={{ x: 1, y: 1 }}
//           style={styles.penTip}
//         />
//       </View>
      
//       {/* Kalam Text */}
//       <LinearGradient
//         colors={['#F59E0B', '#FBBF24', '#FCD34D']}
//         start={{ x: 0, y: 0 }}
//         end={{ x: 1, y: 1 }}
//         style={styles.textGradient}
//       >
//         <Text style={[styles.logoText, logoSize]}>Kalam</Text>
//       </LinearGradient>
      
//       {size === 'large' && (
//         <Text style={styles.tagline}>A PEOPLE'S STORY</Text>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   large: {
//     marginVertical: SPACING.xl,
//   },
//   medium: {
//     marginVertical: SPACING.lg,
//   },
//   small: {
//     marginVertical: SPACING.md,
//   },
//   penContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: SPACING.sm,
//   },
//   pen: {
//     width: 40,
//     height: 6,
//     borderRadius: 3,
//     marginRight: 2,
//   },
//   penTip: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//   },
//   textGradient: {
//     borderRadius: 8,
//     padding: 2,
//   },
//   logoText: {
//     fontSize: FONTS.sizes.xxxl,
//     fontWeight: 'bold',
//     color: COLORS.text.primary,
//     textAlign: 'center',
//   },
//   tagline: {
//     fontSize: FONTS.sizes.sm,
//     color: COLORS.secondary,
//     letterSpacing: 2,
//     marginTop: SPACING.xs,
//     fontWeight: '600',
//   },
// });

// export default KalamLogo;
// src/components/common/KalamLogo.js
import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { SPACING } from '../../constants/theme';

// Replace with the path to your logo image
import LogoImage from '../../assets/logo.png';

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
    // width: 200,
    // height: 150,
    resizeMode: 'contain',
  },
  large: {
    marginVertical: SPACING.xl,
    width: 200,
    height: 150,
  },
  medium: {
    marginVertical: SPACING.lg,
    width: 150,
    height: 45,
  },
  small: {
    marginVertical: SPACING.md,
    width: 100,
    height: 150,
  },
});

export default KalamLogo;
