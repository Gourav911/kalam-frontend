// src/screens/auth/LoginScreen.js
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
import { useLanguage } from '../../contexts/LanguageContext';
const LoginScreen = ({ navigation }) => {
    const {t}=useLanguage();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const { login, loading } = useAuth();
    const handleLogin = async () => {
    setErrors({});

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    const newErrors = {};
    if (!trimmedEmail) newErrors.email = t('emailRequired');
    if (!trimmedPassword) newErrors.password = t('passwordRequired');

    if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
    }

    const result = await login({
        email: trimmedEmail,
        password: trimmedPassword,
    });

    if (!result.success) {
        Alert.alert(t('loginFailed'), result.message);
    }
};


    const fillTestCredentials = (role) => {
        if (role === 'admin') {
            setEmail('admin@kalam.com');
            setPassword('password');
        } else if (role === 'writer') {
            setEmail('writer@kalam.com');
            setPassword('password');
        } else if (role === 'reader') {
            setEmail('reader@kalam.com');
            setPassword('password');
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
                    {/* <KalamLogo size="large" /> */}
                    <View style={{ alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                        <KalamLogo size="small" />
                    </View>

                    {/* Welcome Text */}
                    <View style={styles.welcomeContainer}>
                        <Text style={styles.welcomeTitle}>{t('welcomeBack')}</Text>
                        <Text style={styles.welcomeSubtitle}>
                           {t('loginSubtitle')} 
                        </Text>
                    </View>

                    {/* Login Form */}
                    <View style={styles.formContainer}>
                        <Input
                            label="Email"
                            placeholder={t('emailPlaceholder')}
                            value={email}
                            onChangeText={setEmail}
                            leftIcon="mail-outline"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            error={errors.email}
                        />

                        <Input
                            label="Password"
                            placeholder={t('passwordPlaceholder')}
                            value={password}
                            onChangeText={setPassword}
                            leftIcon="lock-closed-outline"
                            secureTextEntry
                            error={errors.password}
                        />

                        <TouchableOpacity
                            style={styles.forgotPassword}
                            onPress={() => navigation.navigate('ForgotPassword')}
                        >
                            <Text style={styles.forgotPasswordText}>{t('forgotPassword')}</Text>
                        </TouchableOpacity>

                        <Button
                            title={t('signIn')}
                            onPress={handleLogin}
                            loading={loading}
                            style={styles.loginButton}
                        />

                        {/* Test Credentials */}
                        {/* <View style={styles.testCredentials}>
                            <Text style={styles.testTitle}>Quick Test Login:</Text>
                            <View style={styles.testButtons}>
                                <TouchableOpacity
                                    style={styles.testButton}
                                    onPress={() => fillTestCredentials('admin')}
                                >
                                    <Text style={styles.testButtonText}>Admin</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.testButton}
                                    onPress={() => fillTestCredentials('writer')}
                                >
                                    <Text style={styles.testButtonText}>Writer</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.testButton}
                                    onPress={() => fillTestCredentials('reader')}
                                >
                                    <Text style={styles.testButtonText}>Reader</Text>
                                </TouchableOpacity>
                            </View>
                        </View> */}
                    </View>

                    {/* Sign Up Link */}
                    <View style={styles.signupContainer}>
                        <Text style={styles.signupText}>{t('noAccount')} </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                            <Text style={styles.signupLink}>{t('signUp')}</Text>
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
        paddingTop: Platform.OS === 'ios' ? 40 : 20,
        paddingBottom: 25,
    },
    welcomeContainer: {
        alignItems: 'center',
        marginBottom: SPACING.md,
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
        lineHeight: 22,
    },
    formContainer: { marginBottom: SPACING.md },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: SPACING.md,
    },
    forgotPasswordText: {
        fontSize: FONTS.sizes.sm,
        color: '#A855F7',
        fontWeight: '600',
    },
    loginButton: { marginBottom: SPACING.md },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    signupText: {
        fontSize: FONTS.sizes.md,
        color: 'rgba(255,255,255,0.55)',
    },
    signupLink: {
        fontSize: FONTS.sizes.md,
        color: '#A855F7',
        fontWeight: '700',
    },
});

export default LoginScreen;
