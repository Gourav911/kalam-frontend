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
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, FONTS, SPACING } from '../../constants/theme';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import KalamLogo from '../../components/common/KalamLogo';
import { useLanguage } from '../../contexts/LanguageContext';
const RegisterScreen = ({ navigation }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'writer', // everyone is a writer now
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
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

    if (!formData.name) newErrors.name = t('nameRequired');
    if (!formData.email) newErrors.email = t('emailRequired');
    if (!formData.password) newErrors.password = t('passwordRequired');
    if (formData.password.length < 8) newErrors.password = t('passwordMinLength');
    if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = t('passwordsDoNotMatch');
    }
    if (!termsAccepted) {
      newErrors.terms = "You must accept the Terms and Privacy Policy.";
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
    if (!result.success) {
      if (result.errors) {
        // Handle validation errors from server
        const serverErrors = {};
        Object.keys(result.errors).forEach(key => {
          serverErrors[key] = result.errors[key][0]; // Take first error message
        });
        setErrors(serverErrors);
      } else {
        Alert.alert(t('registrationFailed'), result.message);
      }
    }
  };


  return (
    <LinearGradient
      colors={['#7C3AED', '#2D1B69', '#0F0A1E']}
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
            <Text style={styles.welcomeTitle}>{t('joinKalam')}</Text>
            <Text style={styles.welcomeSubtitle}>
              {t('registerSubtitle')}            
              </Text>
          </View>

          {/* Registration Form */}
          <View style={styles.formContainer}>
            <Input
              label="Full Name"
              placeholder={t('fullNamePlaceholder')}
              value={formData.name}
              onChangeText={(value) => updateFormData('name', value)}
              leftIcon="person-outline"
              error={errors.name}
            />

            <Input
              label="Email"
              placeholder={t('emailPlaceholder')}
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              leftIcon="mail-outline"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />

            <Input
              label="Password"
              placeholder={t('passwordCreatePlaceholder')}
              value={formData.password}
              onChangeText={(value) => updateFormData('password', value)}
              leftIcon="lock-closed-outline"
              secureTextEntry
              error={errors.password}
            />

            <Input
              label="Confirm Password"
              placeholder={t('confirmPasswordPlaceholder')}
              value={formData.password_confirmation}
              onChangeText={(value) => updateFormData('password_confirmation', value)}
              leftIcon="lock-closed-outline"
              secureTextEntry
              error={errors.password_confirmation}
            />

            <TouchableOpacity 
              style={styles.termsContainer} 
              onPress={() => {
                setTermsAccepted(!termsAccepted);
                if (errors.terms) setErrors(prev => ({...prev, terms: null}));
              }}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, termsAccepted && styles.checkboxActive]}>
                {termsAccepted && <Feather name="check" size={14} color="#fff" />}
              </View>
              <View style={styles.termsTextContainer}>
                <Text style={styles.termsText}>
                  I agree to the <Text style={styles.termsLink} onPress={() => navigation.navigate('Terms')}>Terms & Conditions</Text> and <Text style={styles.termsLink} onPress={() => navigation.navigate('PrivacyPolicy')}>Privacy Policy</Text>
                </Text>
              </View>
            </TouchableOpacity>
            {errors.terms ? <Text style={styles.errorText}>{errors.terms}</Text> : null}

            <Button
              title={t('createAccount')}
              onPress={handleRegister}
              loading={loading}
              style={styles.registerButton}
            />
          </View>

          {/* Sign In Link */}
          <View style={styles.signinContainer}>
            <Text style={styles.signinText}>{t('alreadyHaveAccount')}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.signinLink}>{t('signIn')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
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
    fontWeight: '800',
    color: '#fff',
    marginBottom: SPACING.xs,
  },
  welcomeSubtitle: {
    fontSize: FONTS.sizes.md,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
  formContainer: { marginBottom: SPACING.lg },
  registerButton: { marginTop: SPACING.lg },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  checkboxActive: {
    backgroundColor: '#A855F7',
    borderColor: '#A855F7',
  },
  termsTextContainer: {
    flex: 1,
  },
  termsText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    lineHeight: 18,
  },
  termsLink: {
    color: '#A855F7',
    fontWeight: '700',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    marginBottom: SPACING.sm,
  },
  signinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  signinText: {
    fontSize: FONTS.sizes.md,
    color: 'rgba(255,255,255,0.55)',
  },
  signinLink: {
    fontSize: FONTS.sizes.md,
    color: '#A855F7',
    fontWeight: '700',
  },
});

export default RegisterScreen;