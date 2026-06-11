import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { FONT } from '../constants/tokens.ts';
import { horizontalScale, moderateScale, verticalScale } from '../utils/responsiveSize.ts';

const AuthField = ({
    theme,
    label,
    placeholder,
    value,
    onChangeText,
    keyboardType = 'default',
    secureTextEntry = false,
    showPasswordToggle = false,
    isPasswordShown = true,
    onTogglePassword,
    maxLength,
    textContentType,
    autoComplete,
}) => {
    const isEmailLabel = label.toLowerCase() === 'email address';

    return (
        <View style={styles.inputWrapper}>
            <Text
                style={[
                    styles.inputLabel,
                    {
                        color: isEmailLabel ? theme.text : theme.textMuted,
                        fontFamily: isEmailLabel ? FONT.RobotoLight : undefined,
                        fontWeight: isEmailLabel ? '200' : '400',
                    },
                ]}
            >
                {label}
            </Text>

            <View
                style={[
                    styles.inputContainer,
                    {
                        borderColor: theme.border,
                        backgroundColor: theme.inputBackground,
                    },
                ]}
            >
                <TextInput
                    placeholder={placeholder}
                    placeholderTextColor={theme.textMuted}
                    autoCapitalize="none"
                    autoCorrect={false}
                    spellCheck={false}
                    textContentType={textContentType}
                    autoComplete={autoComplete}
                    value={value}
                    onChangeText={onChangeText}
                    keyboardType={keyboardType}
                    secureTextEntry={secureTextEntry}
                    maxLength={maxLength}
                    style={[styles.input, { color: theme.text }]}
                />

                {showPasswordToggle && (
                    <TouchableOpacity
                        onPress={onTogglePassword}
                        style={styles.passwordToggle}
                    >
                        <Ionicons
                            name={isPasswordShown ? 'eye-off' : 'eye'}
                            size={moderateScale(24)}
                            color={isPasswordShown ? theme.primary : theme.textMuted}
                        />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    inputWrapper: {
        marginBottom: verticalScale(20),
    },
    inputLabel: {
        fontSize: moderateScale(14),
        marginBottom: verticalScale(8),
        marginLeft: horizontalScale(4),
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: moderateScale(12),
        borderWidth: 1,
        paddingHorizontal: horizontalScale(16),
        height: verticalScale(56),
    },
    input: {
        flex: 1,
        fontSize: moderateScale(16),
    },
    passwordToggle: {
        padding: moderateScale(8),
    },
});

export default AuthField;
