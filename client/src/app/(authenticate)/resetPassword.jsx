import axios from 'axios';
import { router, useLocalSearchParams } from 'expo-router';
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

const ResetPasswordPage = () => {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const { token: tokenParam } = useLocalSearchParams();
    const initialToken = typeof tokenParam === 'string' ? tokenParam : '';

    const [token, setToken] = useState(initialToken);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isPasswordShown, setIsPasswordShown] = useState(true);
    const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(true);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (loading) return;

        const trimmedToken = token.trim();
        const trimmedPassword = password.trim();
        const trimmedConfirmPassword = confirmPassword.trim();

        if (!trimmedToken || !trimmedPassword || !trimmedConfirmPassword) {
            Alert.alert('Validation Error', 'Please fill in all fields.');
            return;
        }

        if (trimmedToken.length !== 6) {
            Alert.alert('Validation Error', 'Please enter the full 6-digit reset code.');
            return;
        }

        if (trimmedPassword.length < 6) {
            Alert.alert('Validation Error', 'Password must be at least 6 characters long.');
            return;
        }

        if (trimmedPassword !== trimmedConfirmPassword) {
            Alert.alert('Validation Error', 'Passwords do not match.');
            return;
        }

        try {
            setLoading(true);
            const resp = await axios.post(
                `${ipURL}/api/auth/reset-password`,
                {
                    token: trimmedToken,
                    password: trimmedPassword,
                },
                { timeout: 10000 }
            );

            Alert.alert(
                'Password Updated',
                resp.data?.message || 'Password reset successfully. You can now log in.',
                [{ text: 'Login', onPress: () => router.replace('/(authenticate)/login') }]
            );
        } catch (err) {
            const errorMessage =
                err.response?.data?.message ||
                err.message ||
                'Unable to reset password. Please try again.';
            Alert.alert('Reset Failed', errorMessage);
        } finally {
            setLoading(false);
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
                                Reset password
                            </Text>
                            <Text style={[styles.headerSubtitle, { color: theme.textMuted }]}>
                                Enter the reset code from your email and choose a new password.
                            </Text>
                        </View>

                        <AuthField
                            theme={theme}
                            label="Reset code"
                            placeholder="Enter reset code"
                            value={token}
                            onChangeText={setToken}
                            keyboardType="number-pad"
                            maxLength={6}
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

                        <AuthField
                            theme={theme}
                            label="Confirm password"
                            placeholder="Enter your password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={isConfirmPasswordShown}
                            showPasswordToggle
                            isPasswordShown={isConfirmPasswordShown}
                            onTogglePassword={() =>
                                setIsConfirmPasswordShown(!isConfirmPasswordShown)
                            }
                        />

                        <TouchableOpacity
                            style={[styles.submitButton, { backgroundColor: theme.primary }]}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color={theme.white} />
                            ) : (
                                <Text style={[styles.buttonText, { color: theme.white }]}>
                                    Update Password
                                </Text>
                            )}
                        </TouchableOpacity>

                        <View style={styles.footerContainer}>
                            <Text style={[styles.footerText, { color: theme.textMuted }]}>
                                Need a new code?
                            </Text>
                            <Pressable onPress={() => router.replace('/(authenticate)/forgotPassword')}>
                                <Text style={[styles.footerLink, { color: theme.primary }]}>
                                    Resend
                                </Text>
                            </Pressable>
                        </View>
                    </View>
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
    headerSubtitle: {
        fontSize: moderateScale(16),
        fontFamily: FONT.RobotoLight,
        lineHeight: moderateScale(22),
    },
    submitButton: {
        padding: verticalScale(10),
        alignItems: 'center',
        borderRadius: moderateScale(12),
        marginTop: verticalScale(8),
    },
    buttonText: {
        fontSize: moderateScale(18),
        fontWeight: 'bold',
    },
    footerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: verticalScale(24),
    },
    footerText: {
        fontSize: moderateScale(16),
        fontFamily: FONT.RobotoLight,
    },
    footerLink: {
        fontSize: moderateScale(16),
        fontWeight: 'bold',
        marginLeft: horizontalScale(8),
    },
});

export default ResetPasswordPage;
