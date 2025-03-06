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

const RegisterPage = () => {
  const { register } = useLocalSearchParams();
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
        <Text style={styles.inputLabel}>
          {placeholder}
        </Text>
        <View style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused
        ]}>
          <Ionicons 
            name={icon} 
            size={20} 
            color={isFocused ? COLORS.primary : welcomeCOLOR.grey} 
            style={styles.inputIcon}
          />
          <TextInput
            value={formData[field]}
            onChangeText={(value) => handleInputChange(field, value)}
            placeholder={`Enter your ${field.toLowerCase()}`}
            placeholderTextColor={welcomeCOLOR.grey}
            secureTextEntry={isPassword && isPasswordShown}
            style={styles.input}
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
                color={welcomeCOLOR.grey}
              />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
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
              <Text style={styles.headerTitle}>Create Account</Text>
              <Text style={styles.headerSubtitle}>
                Join our community of {register.toLowerCase()}s
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
                style={styles.registerButton}
                onPress={handleRegister}
              >
                  {loading? 
                  <ActivityIndicator/>
                  :
                  <Text style={styles.buttonText}>Create Account</Text>
                  }
              </TouchableOpacity>

              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have an account?</Text>
                <Pressable onPress={() => router.replace('/(authenticate)/login')}>
                  <Text style={styles.loginLink}>Login</Text>
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
    backgroundColor: '#000',
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
    color: welcomeCOLOR.white,
    marginBottom: verticalScale(8),
  },
  headerSubtitle: {
    fontSize: moderateScale(16),
    color: welcomeCOLOR.grey,
  },
  inputWrapper: {
    marginBottom: verticalScale(20),
  },
  inputLabel: {
    fontSize: moderateScale(14),
    color: welcomeCOLOR.grey,
    marginBottom: verticalScale(8),
    marginLeft: horizontalScale(4),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: horizontalScale(16),
    height: verticalScale(56),
  },
  inputContainerFocused: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  inputIcon: {
    marginRight: horizontalScale(12),
  },
  input: {
    flex: 1,
    color: welcomeCOLOR.white,
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
    backgroundColor:COLORS.secondary,
    borderRadius: moderateScale(12),
  },
  gradient: {
    paddingVertical: verticalScale(16),
    alignItems: 'center',
  },
  buttonText: {
    color: welcomeCOLOR.white,
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
    color: welcomeCOLOR.grey,
    fontSize: moderateScale(16),
  },
  loginLink: {
    color: COLORS.primary,
    fontSize: moderateScale(16),
    fontWeight: 'bold',
    marginLeft: horizontalScale(8),
  },
});

export default RegisterPage;