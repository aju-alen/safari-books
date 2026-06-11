import axios from 'axios';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';
import AuthField from '../../components/AuthField.jsx';
import { FONT } from '../../constants/tokens.ts';
import { useTheme } from '@/providers/ThemeProvider';
import { ipURL } from '../../utils/backendURL.ts';
import { horizontalScale, moderateScale, verticalScale } from '../../utils/responsiveSize.ts';

const LoginPage = () => {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordShown, setIsPasswordShown] = useState(true);
    const [loading, setLoading] = useState(false);
    const [clickCount, setClickCount] = useState(0);

    const handleAdminLogin = () => {
        setClickCount((prev) => prev + 1);

        if (clickCount >= 7) {
            setClickCount(0);
            router.replace('/(authenticate)/adminLogin');
        }
    };

    const handleLogin = async () => {
        if (loading) {
            return;
        }

        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();

        if (!trimmedEmail || !trimmedPassword) {
            Alert.alert('Validation Error', 'Please enter both email and password.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
            Alert.alert('Invalid Email', 'Please enter a valid email address.');
            return;
        }

        const user = {
            email: trimmedEmail,
            password: trimmedPassword,
        };

        try {
            setLoading(true);

            const resp = await axios.post(`${ipURL}/api/auth/login`, user, {
                timeout: 10000,
            });

            if (!resp.data || !resp.data.token) {
                throw new Error('Invalid response from server. Please try again.');
            }

            if (!resp.data.role || !resp.data.id || !resp.data.email) {
                throw new Error('Incomplete user data received. Please try again.');
            }

            try {
                await SecureStore.setItemAsync(
                    'authToken',
                    JSON.stringify({ token: resp.data.token })
                );
            } catch (storeError) {
                console.error('Error storing auth token:', storeError);
                throw new Error('Failed to save authentication token. Please try again.');
            }

            try {
                await SecureStore.setItemAsync(
                    'userDetails',
                    JSON.stringify({
                        role: resp.data.role,
                        userId: resp.data.id,
                        email: resp.data.email,
                        name: resp.data.name || '',
                    })
                );
            } catch (storeError) {
                console.error('Error storing user details:', storeError);
                try {
                    await SecureStore.deleteItemAsync('authToken');
                } catch (cleanupError) {
                    console.error('Error cleaning up auth token:', cleanupError);
                }
                throw new Error('Failed to save user details. Please try again.');
            }

            const sbOnboarding = await SecureStore.getItemAsync('sb-onboarding');

            try {
                if (resp.data.role === 'LISTENER') {
                    if (sbOnboarding === null) {
                        router.replace('/(onboarding)/listeneronboarding');
                    } else {
                        router.replace('/(tabs)/home');
                    }
                } else if (resp.data.role === 'PUBLISHER') {
                    if (sbOnboarding === null) {
                        router.replace('/(onboarding)/publisheronboarding');
                    } else {
                        router.replace('/(publisher)/publisherhome');
                    }
                } else if (resp.data.role === 'ADMIN') {
                    router.replace('/(admin)/home');
                } else {
                    console.warn('Unknown user role:', resp.data.role);
                    router.replace('/(tabs)/home');
                }
            } catch (navigationError) {
                console.error('Navigation error:', navigationError);
                Alert.alert(
                    'Navigation Error',
                    'Login successful but navigation failed. Please restart the app.'
                );
            }

            setLoading(false);
        } catch (err) {
            setLoading(false);
            console.error('Login error:', err);

            let errorMessage = 'An unexpected error occurred. Please try again.';

            if (err.response) {
                errorMessage =
                    err.response.data?.message ||
                    err.response.data?.error ||
                    `Server error: ${err.response.status}`;
            } else if (err.request) {
                errorMessage =
                    'Network error. Please check your internet connection and try again.';
            } else if (err.message) {
                errorMessage = err.message;
            } else if (err.code === 'ECONNABORTED') {
                errorMessage =
                    'Request timed out. Please check your connection and try again.';
            }

            Alert.alert('Login Failed', errorMessage);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
                keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
            >
                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <View style={styles.content}>
                        <View style={styles.headerContainer}>
                            <Text style={[styles.headerTitle, { color: theme.text }]}>
                                Login to your account
                            </Text>
                        </View>

                        <AuthField
                            theme={theme}
                            label="Email address"
                            placeholder="Enter Your Email"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            textContentType="emailAddress"
                            autoComplete="email"
                        />

                        <AuthField
                            theme={theme}
                            label="Password"
                            placeholder="Enter your password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={isPasswordShown}
                            showPasswordToggle
                            isPasswordShown={isPasswordShown}
                            onTogglePassword={() => setIsPasswordShown(!isPasswordShown)}
                        />

                        <Pressable
                            onPress={() => router.push('/(authenticate)/forgotPassword')}
                            style={styles.forgotPasswordLink}
                        >
                            <Text style={[styles.forgotPasswordText, { color: theme.primary }]}>
                                Forgot password?
                            </Text>
                        </Pressable>

                        <TouchableOpacity
                            style={[styles.loginButton, { backgroundColor: theme.primary }]}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color={theme.white} />
                            ) : (
                                <Text style={[styles.buttonText, { color: theme.white }]}>
                                    Login
                                </Text>
                            )}
                        </TouchableOpacity>

                        <View style={styles.registerContainer}>
                            <Text style={[styles.registerText, { color: theme.textMuted }]}>
                                Don't have an account?
                            </Text>
                            <Pressable onPress={() => router.replace('/(authenticate)/chooseRole')}>
                                <Text style={[styles.registerLink, { color: theme.primary }]}>
                                    Register
                                </Text>
                            </Pressable>
                        </View>
                    </View>

                    <Pressable onPress={handleAdminLogin} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
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
        justifyContent: 'center',
    },
    content: {
        flex: 1,
        padding: moderateScale(24),
        justifyContent: 'center',
    },
    headerContainer: {
        marginBottom: verticalScale(32),
    },
    headerTitle: {
        fontSize: moderateScale(32),
        fontWeight: 'bold',
        marginBottom: verticalScale(8),
    },
    forgotPasswordLink: {
        alignSelf: 'flex-end',
        marginTop: verticalScale(-12),
        marginBottom: verticalScale(8),
    },
    forgotPasswordText: {
        fontSize: moderateScale(14),
        fontWeight: '600',
    },
    loginButton: {
        padding: verticalScale(10),
        alignItems: 'center',
        borderRadius: moderateScale(12),
        marginTop: verticalScale(8),
    },
    buttonText: {
        fontSize: moderateScale(18),
        fontWeight: 'bold',
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: verticalScale(24),
    },
    registerText: {
        fontSize: moderateScale(16),
        fontFamily: FONT.RobotoLight,
    },
    registerLink: {
        fontSize: moderateScale(16),
        fontWeight: 'bold',
        marginLeft: horizontalScale(8),
    },
});

export default LoginPage;
