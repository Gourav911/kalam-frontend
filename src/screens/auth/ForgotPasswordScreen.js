// screens/auth/ForgotPasswordScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useLanguage } from '../../contexts/LanguageContext';
import KalamLogo from '../../components/common/KalamLogo';
import apiService from '../../services/apiService';

const ForgotPasswordScreen = ({ navigation }) => {
  const { t } = useLanguage();
  const [step, setStep] = useState(1); // 1: Enter email, 2: Enter OTP, 3: Enter new password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleSendOtp = async () => {
    setEmailError('');
    if (!email.trim()) { setEmailError(t('emailRequired') || 'Email is required'); return; }
    if (!validateEmail(email.trim())) { setEmailError(t('invalidEmail') || 'Invalid email'); return; }

    setIsLoading(true);
    const result = await apiService.forgotPassword(email.trim());
    setIsLoading(false);

    if (result.success) {
      Alert.alert('Code Sent', 'A verification code has been sent to your email.');
      setStep(2);
    } else {
      Alert.alert('Error', result.error?.message || 'Failed to send verification code. Please make sure email is registered.');
    }
  };

  const handleVerifyOtp = async () => {
    setOtpError('');
    if (!otp.trim() || otp.trim().length !== 6) { 
      setOtpError('Please enter a valid 6-digit verification code'); 
      return; 
    }

    setIsLoading(true);
    const result = await apiService.verifyForgotPasswordOtp(email.trim(), otp.trim());
    setIsLoading(false);

    if (result.success) {
      setStep(3);
    } else {
      Alert.alert('Error', result.error?.message || 'Invalid or expired verification code.');
    }
  };

  const handleResetPassword = async () => {
    setPasswordError('');
    if (!password.trim() || password.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    const result = await apiService.resetPassword(
      email.trim(),
      otp.trim(),
      password.trim(),
      confirmPassword.trim()
    );
    setIsLoading(false);

    if (result.success) {
      Alert.alert('Success', 'Your password has been reset successfully.', [
        { text: t('ok') || 'OK', onPress: () => navigation.goBack() },
      ]);
    } else {
      Alert.alert('Error', result.error?.message || 'Failed to reset password.');
    }
  };

  return (
    <LinearGradient colors={['#7C3AED', '#2D1B69', '#0F0A1E']} style={styles.container}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={styles.logoBox}>
            <KalamLogo size="medium" />
          </View>

          {/* Wizard Headers */}
          <View style={styles.titleBox}>
            <Text style={styles.title}>
              {step === 1 && (t('forgotPasswordTitle') ?? 'Reset Password')}
              {step === 2 && 'Enter Code'}
              {step === 3 && 'New Password'}
            </Text>
            <Text style={styles.subtitle}>
              {step === 1 && (t('forgotPasswordSubtitle') ?? "Enter your email and we'll send a verification code")}
              {step === 2 && `Enter the 6-digit code sent to ${email}`}
              {step === 3 && 'Choose a secure new password for your account'}
            </Text>
          </View>

          {/* Form Wizard */}
          <View style={styles.form}>
            {step === 1 && (
              <>
                <Text style={styles.label}>{t('emailAddress') ?? 'Email Address'}</Text>
                <TextInput
                  style={[styles.input, emailError && styles.inputError]}
                  value={email}
                  onChangeText={(text) => { setEmail(text); if (emailError) setEmailError(''); }}
                  placeholder={t('emailPlaceholder') ?? 'you@example.com'}
                  placeholderTextColor="rgba(255,255,255,0.35)"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
                {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

                <TouchableOpacity
                  style={[styles.btn, isLoading && styles.btnDisabled]}
                  onPress={handleSendOtp}
                  disabled={isLoading}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={isLoading ? ['#3A2060', '#3A2060'] : ['#A855F7', '#7C3AED']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.btnGradient}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.btnText}>Send Code</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}

            {step === 2 && (
              <>
                <Text style={styles.label}>6-Digit Code</Text>
                <TextInput
                  style={[styles.input, otpError && styles.inputError, styles.otpInput]}
                  value={otp}
                  onChangeText={(text) => { setOtp(text); if (otpError) setOtpError(''); }}
                  placeholder="000000"
                  placeholderTextColor="rgba(255,255,255,0.35)"
                  keyboardType="number-pad"
                  maxLength={6}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
                {otpError ? <Text style={styles.errorText}>{otpError}</Text> : null}

                <TouchableOpacity
                  style={[styles.btn, isLoading && styles.btnDisabled]}
                  onPress={handleVerifyOtp}
                  disabled={isLoading}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={isLoading ? ['#3A2060', '#3A2060'] : ['#A855F7', '#7C3AED']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.btnGradient}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.btnText}>Verify Code</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.resendBtn}
                  onPress={() => { setStep(1); setOtp(''); }}
                  disabled={isLoading}
                >
                  <Text style={styles.resendText}>Change Email / Resend</Text>
                </TouchableOpacity>
              </>
            )}

            {step === 3 && (
              <>
                <Text style={styles.label}>New Password</Text>
                <TextInput
                  style={[styles.input, passwordError && styles.inputError]}
                  value={password}
                  onChangeText={(text) => { setPassword(text); if (passwordError) setPasswordError(''); }}
                  placeholder="At least 8 characters"
                  placeholderTextColor="rgba(255,255,255,0.35)"
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />

                <Text style={[styles.label, { marginTop: 14 }]}>Confirm Password</Text>
                <TextInput
                  style={[styles.input, passwordError && styles.inputError]}
                  value={confirmPassword}
                  onChangeText={(text) => { setConfirmPassword(text); if (passwordError) setPasswordError(''); }}
                  placeholder="Repeat new password"
                  placeholderTextColor="rgba(255,255,255,0.35)"
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
                {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

                <TouchableOpacity
                  style={[styles.btn, isLoading && styles.btnDisabled]}
                  onPress={handleResetPassword}
                  disabled={isLoading}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={isLoading ? ['#3A2060', '#3A2060'] : ['#A855F7', '#7C3AED']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.btnGradient}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.btnText}>Reset Password</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Back */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            disabled={isLoading}
          >
            <Text style={styles.backText}>← {t('backToLogin') ?? 'Back to Login'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  logoBox: {
    alignItems: 'center',
    marginBottom: 24,
  },
  titleBox: {
    alignItems: 'center',
    marginBottom: 36,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  form: { marginBottom: 24 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#fff',
    marginBottom: 6,
  },
  otpInput: {
    fontSize: 20,
    letterSpacing: 4,
    textAlign: 'center',
    fontWeight: '700',
  },
  inputError: {
    borderColor: '#F87171',
  },
  errorText: {
    color: '#F87171',
    fontSize: 12,
    marginBottom: 10,
  },
  btn: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 14,
  },
  btnDisabled: { opacity: 0.6 },
  btnGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  backBtn: {
    alignItems: 'center',
    padding: 14,
  },
  backText: {
    color: '#C4B5FD',
    fontSize: 15,
    fontWeight: '600',
  },
  resendBtn: {
    alignItems: 'center',
    marginTop: 16,
    padding: 8,
  },
  resendText: {
    color: '#A855F7',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ForgotPasswordScreen;