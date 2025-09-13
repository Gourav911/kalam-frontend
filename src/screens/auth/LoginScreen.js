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

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const { login, loading } = useAuth();

    const handleLogin = async () => {
        // Clear previous errors
        setErrors({});

        // Basic validation
        const newErrors = {};
        if (!email) newErrors.email = 'Email is required';
        if (!password) newErrors.password = 'Password is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        const result = await login({ email, password });

        if (!result.success) {
            // console.log(result);
            Alert.alert('Login Failed', result.message);
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
            colors={['#6B46C1', '#2D2438', '#1F1B2E']}
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
                        <KalamLogo size="large" />
                    </View>

                    {/* Welcome Text */}
                    <View style={styles.welcomeContainer}>
                        <Text style={styles.welcomeTitle}>Welcome Back!</Text>
                        <Text style={styles.welcomeSubtitle}>
                            Sign in to continue your storytelling journey
                        </Text>
                    </View>

                    {/* Login Form */}
                    <View style={styles.formContainer}>
                        <Input
                            label="Email"
                            placeholder="Enter your email"
                            value={email}
                            onChangeText={setEmail}
                            leftIcon="mail-outline"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            error={errors.email}
                        />

                        <Input
                            label="Password"
                            placeholder="Enter your password"
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
                            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                        </TouchableOpacity>

                        <Button
                            title="Sign In"
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
                        <Text style={styles.signupText}>Don't have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                            <Text style={styles.signupLink}>Sign Up</Text>
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
        justifyContent: 'center',
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
        lineHeight: 22,
    },
    formContainer: {
        marginBottom: SPACING.xl,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: SPACING.lg,
    },
    forgotPasswordText: {
        fontSize: FONTS.sizes.sm,
        color: COLORS.secondary,
        fontWeight: '500',
    },
    loginButton: {
        marginBottom: SPACING.lg,
    },
    testCredentials: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: SPACING.md,
        borderRadius: 12,
        alignItems: 'center',
    },
    testTitle: {
        fontSize: FONTS.sizes.sm,
        color: COLORS.text.secondary,
        marginBottom: SPACING.sm,
    },
    testButtons: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    testButton: {
        backgroundColor: COLORS.surface,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        borderRadius: 8,
    },
    testButtonText: {
        fontSize: FONTS.sizes.xs,
        color: COLORS.text.primary,
        fontWeight: '500',
    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    signupText: {
        fontSize: FONTS.sizes.md,
        color: COLORS.text.secondary,
    },
    signupLink: {
        fontSize: FONTS.sizes.md,
        color: COLORS.secondary,
        fontWeight: '600',
    },
});

export default LoginScreen;
