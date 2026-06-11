import axios from 'axios';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';
import AuthField from '../../components/AuthField.jsx';
import { FONT } from '../../constants/tokens.ts';
import { useTheme } from '@/providers/ThemeProvider';
import { defaultStyles } from '../../styles/index.ts';
import { ipURL } from '../../utils/backendURL.ts';
import { horizontalScale, moderateScale, verticalScale } from '../../utils/responsiveSize.ts';

const ForgotPasswordPage = () => {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (loading) return;

        const trimmedEmail = email.trim();
        if (!trimmedEmail) {
            Alert.alert('Validation Error', 'Please enter your email address.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
            Alert.alert('Invalid Email', 'Please enter a valid email address.');
            return;
        }

        try {
            setLoading(true);
            const resp = await axios.post(
                `${ipURL}/api/auth/forgot-password`,
                { email: trimmedEmail },
                { timeout: 10000 }
            );

            Alert.alert(
                'Check Your Email',
                resp.data?.message || 'If an account exists with that email, you will receive a password reset code shortly.',
                [
                    {
                        text: 'Enter Reset Code',
                        onPress: () => router.push('/(authenticate)/resetPassword'),
                    },
                    {
                        text: 'Back to Login',
                        onPress: () => router.replace('/(authenticate)/login'),
                    },
                ]
            );
        } catch (err) {
            const errorMessage =
                err.response?.data?.message ||
                err.message ||
                'Unable to send reset email. Please try again.';
            Alert.alert('Request Failed', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[defaultStyles.container, { backgroundColor: theme.background }]}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
            >
                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    style={{ flex: 1 }}
                    contentContainerStyle={{
                        flexGrow: 1,
                        justifyContent: 'center',
                        paddingVertical: verticalScale(12),
                    }}
                >
                    <View style={{ marginHorizontal: horizontalScale(22) }}>
                        <View style={{ marginVertical: verticalScale(22) }}>
                            <Text
                                style={{
                                    fontSize: moderateScale(22),
                                    fontWeight: 'bold',
                                    marginVertical: verticalScale(12),
                                    color: theme.text,
                                }}
                            >
                                Forgot password?
                            </Text>
                            <Text
                                style={{
                                    fontSize: moderateScale(15),
                                    color: theme.textMuted,
                                    fontFamily: FONT.RobotoLight,
                                    lineHeight: moderateScale(22),
                                }}
                            >
                                Enter the email linked to your account and we will send you a reset code.
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

                        <TouchableOpacity
                            style={{
                                padding: moderateScale(12),
                                backgroundColor: theme.primary,
                                borderRadius: moderateScale(8),
                            }}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color={theme.text} />
                            ) : (
                                <Text
                                    style={{
                                        fontSize: moderateScale(16),
                                        fontWeight: 'bold',
                                        color: theme.white,
                                        textAlign: 'center',
                                    }}
                                >
                                    Send Reset Code
                                </Text>
                            )}
                        </TouchableOpacity>

                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'center',
                                marginVertical: verticalScale(22),
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: moderateScale(16),
                                    color: theme.text,
                                    fontFamily: FONT.RobotoLight,
                                }}
                            >
                                Remember your password?
                            </Text>
                            <Pressable onPress={() => router.replace('/(authenticate)/login')}>
                                <Text
                                    style={{
                                        fontSize: moderateScale(16),
                                        color: theme.primary,
                                        fontWeight: 'bold',
                                        marginLeft: horizontalScale(6),
                                    }}
                                >
                                    Login
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default ForgotPasswordPage;
