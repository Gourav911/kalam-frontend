// src/screens/auth/RegisterScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, FONTS, SPACING } from '../../constants/theme';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import KalamLogo from '../../components/common/KalamLogo';

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'reader', // default role
  });
  const [errors, setErrors] = useState({});
  const { register, loading } = useAuth();

  const updateFormData = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    // Clear error when user starts typing
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleRegister = async () => {
    setErrors({});

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const result = await register(formData);
    console.log(result)
    if (!result.success) {
      if (result.errors) {
        // Handle validation errors from server
        const serverErrors = {};
        Object.keys(result.errors).forEach(key => {
          serverErrors[key] = result.errors[key][0]; // Take first error message
        });
        setErrors(serverErrors);
      } else {
        Alert.alert('Registration Failed', result.message);
      }
    }
  };

  const RoleSelector = () => (
    <View style={styles.roleContainer}>
      <Text style={styles.roleLabel}>I want to join as a:</Text>
      <View style={styles.roleButtons}>
        <TouchableOpacity
          style={[
            styles.roleButton,
            formData.role === 'reader' && styles.roleButtonActive
          ]}
          onPress={() => updateFormData('role', 'reader')}
        >
          <Text style={[
            styles.roleButtonText,
            formData.role === 'reader' && styles.roleButtonTextActive
          ]}>
            📚 Reader
          </Text>
          <Text style={styles.roleDescription}>Discover and enjoy amazing stories</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.roleButton,
            formData.role === 'writer' && styles.roleButtonActive
          ]}
          onPress={() => updateFormData('role', 'writer')}
        >
          <Text style={[
            styles.roleButtonText,
            formData.role === 'writer' && styles.roleButtonTextActive
          ]}>
            ✍️ Writer
          </Text>
          <Text style={styles.roleDescription}>Share your stories and earn</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <LinearGradient
      colors={['#1F1B2E', '#2D2438', '#6B46C1']}
      style={styles.container}
    >
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <KalamLogo size="medium" />

          {/* Welcome Text */}
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeTitle}>Join Kalam</Text>
            <Text style={styles.welcomeSubtitle}>
              Start your storytelling journey today
            </Text>
          </View>

          {/* Registration Form */}
          <View style={styles.formContainer}>
            <Input
              label="Full Name"
              placeholder="Enter your full name"
              value={formData.name}
              onChangeText={(value) => updateFormData('name', value)}
              leftIcon="person-outline"
              error={errors.name}
            />

            <Input
              label="Email"
              placeholder="Enter your email"
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              leftIcon="mail-outline"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />

            <Input
              label="Password"
              placeholder="Create a password"
              value={formData.password}
              onChangeText={(value) => updateFormData('password', value)}
              leftIcon="lock-closed-outline"
              secureTextEntry
              error={errors.password}
            />

            <Input
              label="Confirm Password"
              placeholder="Confirm your password"
              value={formData.password_confirmation}
              onChangeText={(value) => updateFormData('password_confirmation', value)}
              leftIcon="lock-closed-outline"
              secureTextEntry
              error={errors.password_confirmation}
            />

            <RoleSelector />

            <Button
              title="Create Account"
              onPress={handleRegister}
              loading={loading}
              style={styles.registerButton}
            />
          </View>

          {/* Sign In Link */}
          <View style={styles.signinContainer}>
            <Text style={styles.signinText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.signinLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  welcomeTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  welcomeSubtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: SPACING.lg,
  },
  roleContainer: {
    marginBottom: SPACING.lg,
  },
  roleLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
    fontWeight: '500',
  },
  roleButtons: {
    gap: SPACING.sm,
  },
  roleButton: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  roleButtonActive: {
    borderColor: COLORS.secondary,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  roleButtonText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.primary,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  roleButtonTextActive: {
    color: COLORS.secondary,
  },
  roleDescription: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
  },
  registerButton: {
    marginTop: SPACING.md,
  },
  signinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signinText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.secondary,
  },
  signinLink: {
    fontSize: FONTS.sizes.md,
    color: COLORS.secondary,
    fontWeight: '600',
  },
});

export default RegisterScreen;