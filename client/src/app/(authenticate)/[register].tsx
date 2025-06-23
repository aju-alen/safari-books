import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { COLORS, welcomeCOLOR } from '../../constants/tokens';
import { ipURL } from '../../utils/backendURL';
import { horizontalScale, moderateScale, verticalScale } from '../../utils/responsiveSize';
import { useTheme } from '@/providers/ThemeProvider';

const RegisterPage = () => {
  const {theme} = useTheme()
  const { register } = useLocalSearchParams<{ register: string }>();
  const [formAnimation] = useState(new Animated.Value(0));

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isPasswordShown, setIsPasswordShown] = useState(true);
  const [focusedField, setFocusedField] = useState(null);
  const [loading, setLoading] = useState(false);

  // Animate form on mount
  React.useEffect(() => {
    Animated.spring(formAnimation, {
      toValue: 1,
      tension: 20,
      friction: 7,
      useNativeDriver: true
    }).start();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRegister = async () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      Alert.alert('Missing Fields', 'Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const resp = await axios.post(`${ipURL}/api/auth/register`, {
        ...formData,
        role: register
      });
      Alert.alert('Success', 'Registration successful! Please verify your email to login.');
      setLoading(false);
      router.replace('/(authenticate)/login');

    } catch (error) {
      setLoading(false);
      Alert.alert('Error', error.response?.data?.message || 'Registration failed');
    }
  };

  const renderInput = (field, placeholder, icon, isPassword = false) => {
    const isFocused = focusedField === field;
    
    return (
      <Animated.View style={[
        styles.inputWrapper,
        {
          transform: [{
            translateX: formAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [-100, 0]
            })
          }],
          opacity: formAnimation
        }
      ]}>
        <Text style={[styles.inputLabel, { color: theme.textMuted }]}>
          {placeholder}
        </Text>
        <View style={[
          styles.inputContainer,
          { 
            backgroundColor: theme.background,
            borderColor: theme.textMuted
          },
          isFocused && {
            borderColor: theme.primary,
            backgroundColor: theme.white
          }
        ]}>
          <Ionicons 
            name={icon} 
            size={20} 
            color={isFocused ? theme.primary : theme.textMuted} 
            style={styles.inputIcon}
          />
          <TextInput
            value={formData[field]}
            onChangeText={(value) => handleInputChange(field, value)}
            placeholder={`Enter your ${field.toLowerCase()}`}
            placeholderTextColor={theme.textMuted}
            secureTextEntry={isPassword && isPasswordShown}
            style={[styles.input, { color: theme.text }]}
            autoCapitalize={field === 'email' ? 'none' : 'words'}
            keyboardType={field === 'email' ? 'email-address' : 'default'}
            onFocus={() => setFocusedField(field)}
            onBlur={() => setFocusedField(null)}
          />
          {isPassword && (
            <TouchableOpacity
              onPress={() => setIsPasswordShown(!isPasswordShown)}
              style={styles.passwordToggle}
            >
              <Ionicons 
                name={isPasswordShown ? "eye-off" : "eye"} 
                size={24} 
                color={theme.textMuted}
              />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.content}>
            <Animated.View style={[
              styles.headerContainer,
              {
                transform: [{
                  translateY: formAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-50, 0]
                  })
                }],
                opacity: formAnimation
              }
            ]}>
              <Text style={[styles.headerTitle, { color: theme.text }]}>Create Account</Text>
              <Text style={[styles.headerSubtitle, { color: theme.textMuted }]}>
                Join our community of {register?.toLowerCase() || ''}s
              </Text>
            </Animated.View>

            {renderInput('name', 'Full Name', 'person-outline')}
            {renderInput('email', 'Email Address', 'mail-outline')}
            {renderInput('password', 'Password', 'lock-closed-outline', true)}
            {renderInput('confirmPassword', 'Confirm Password', 'lock-closed-outline', true)}

            <Animated.View style={[
              styles.buttonContainer,
              {
                transform: [{
                  translateY: formAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [100, 0]
                  })
                }],
                opacity: formAnimation
              }
            ]}>
              <TouchableOpacity
                style={[styles.registerButton, { backgroundColor: theme.primary }]}
                onPress={handleRegister}
              >
                  {loading? 
                  <ActivityIndicator color={theme.white}/>
                  :
                  <Text style={[styles.buttonText, { color: theme.white }]}>Create Account</Text>
                  }
              </TouchableOpacity>

              <View style={styles.loginContainer}>
                <Text style={[styles.loginText, { color: theme.textMuted }]}>Already have an account?</Text>
                <Pressable onPress={() => router.replace('/(authenticate)/login')}>
                  <Text style={[styles.loginLink, { color: theme.primary }]}>Login</Text>
                </Pressable>
              </View>
            </Animated.View>
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
  },
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
  inputIcon: {
    marginRight: horizontalScale(12),
  },
  input: {
    flex: 1,
    fontSize: moderateScale(16),
  },
  passwordToggle: {
    padding: moderateScale(8),
  },
  buttonContainer: {
    marginTop: verticalScale(24),
  },
  registerButton: {
    padding: verticalScale(10),
    alignItems: 'center',
    borderRadius: moderateScale(12),
  },
  gradient: {
    paddingVertical: verticalScale(16),
    alignItems: 'center',
  },
  buttonText: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: verticalScale(24),
  },
  loginText: {
    fontSize: moderateScale(16),
  },
  loginLink: {
    fontSize: moderateScale(16),
    fontWeight: 'bold',
    marginLeft: horizontalScale(8),
  },
});

export default RegisterPage;