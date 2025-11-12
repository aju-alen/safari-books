import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useState } from 'react';
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { COLORS, FONT, welcomeCOLOR } from '../../constants/tokens.ts';
import { useTheme } from '@/providers/ThemeProvider';
import { defaultStyles } from '../../styles/index.ts';
import { ipURL } from '../../utils/backendURL.ts';
import { horizontalScale, moderateScale, verticalScale } from '../../utils/responsiveSize.ts';


const LoginPage = () => {
    const {theme} = useTheme()
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordShown, setIsPasswordShown] = useState(true);
    const [loading, setLoading] = useState(false);
    const [clickCount, setClickCount] = useState(0);

    // useEffect(() => {
    //     const checkLogin = async () => {
    //         const token = await AsyncStorage.getItem('authToken');
    //         const user = await AsyncStorage.getItem('userDetails');
    //         console.log(token,'this is token');
    //         console.log(JSON.parse(user),'this is userDetails');
            
    //         if (token) {
    //             router.replace('/(tabs)/home');
                
    //         }
    //     }
    //     checkLogin();

    // }, []);



const handleAdminLogin = () => {
  // Increment click count
  const newCount = clickCount + 1;
  setClickCount(prev=> prev + 1);
  
  // Check if we've reached 7 clicks
  if (clickCount >= 7) {
    // Reset the count and call the admin login function
    setClickCount(0);
    router.replace('/(authenticate)/adminLogin');
  }
};
console.log(clickCount, 'this is click count');

    const handleLogin = async () => {
        // Prevent multiple simultaneous login attempts
        if (loading) {
            return;
        }

        // Input validation
        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();

        if (!trimmedEmail || !trimmedPassword) {
            Alert.alert('Validation Error', 'Please enter both email and password.');
            return;
        }

        // Email format validation
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
            console.log('Attempting login for:', trimmedEmail);
            
            // Make API request with timeout
            const resp = await axios.post(`${ipURL}/api/auth/login`, user, {
                timeout: 10000, // 10 second timeout
            });

            // Validate response data
            if (!resp.data || !resp.data.token) {
                throw new Error('Invalid response from server. Please try again.');
            }

            if (!resp.data.role || !resp.data.id || !resp.data.email) {
                throw new Error('Incomplete user data received. Please try again.');
            }

            console.log('Login successful for:', resp.data.email);

            // Store authentication token with error handling
            try {
                await SecureStore.setItemAsync(
                    "authToken",
                    JSON.stringify({ token: resp.data.token })
                );
            } catch (storeError) {
                console.error('Error storing auth token:', storeError);
                throw new Error('Failed to save authentication token. Please try again.');
            }

            // Store user details with error handling
            try {
                await SecureStore.setItemAsync(
                    "userDetails",
                    JSON.stringify({
                        role: resp.data.role,
                        userId: resp.data.id,
                        email: resp.data.email,
                        name: resp.data.name || ''
                    })
                );
            } catch (storeError) {
                console.error('Error storing user details:', storeError);
                // Try to clean up auth token if user details storage fails
                try {
                    await SecureStore.deleteItemAsync("authToken");
                } catch (cleanupError) {
                    console.error('Error cleaning up auth token:', cleanupError);
                }
                throw new Error('Failed to save user details. Please try again.');
            }

            // Get onboarding status
            const sbOnboarding = await SecureStore.getItemAsync("sb-onboarding");
            console.log('Onboarding status:', sbOnboarding);

            // Navigate based on role and onboarding status
            try {
                if (resp.data.role === 'LISTENER') {
                    if (sbOnboarding === null) {
                        router.replace('/(onboarding)/listeneronboarding');
                    } else if (sbOnboarding === 'false') {
                        router.replace('/(tabs)/home');
                    } else {
                        // If onboarding is 'true' or any other value, go to home
                        router.replace('/(tabs)/home');
                    }
                } else if (resp.data.role === 'PUBLISHER') {
                    if (sbOnboarding === null) {
                        router.replace('/(onboarding)/publisheronboarding');
                    } else if (sbOnboarding === 'false') {
                        router.replace('/(publisher)/publisherhome');
                    } else {
                        // If onboarding is 'true' or any other value, go to publisher home
                        router.replace('/(publisher)/publisherhome');
                    }
                } else if (resp.data.role === 'ADMIN') {
                    router.replace('/(admin)/home');
                } else {
                    // Unknown role - log and redirect to home as fallback
                    console.warn('Unknown user role:', resp.data.role);
                    router.replace('/(tabs)/home');
                }
            } catch (navigationError) {
                console.error('Navigation error:', navigationError);
                // Don't throw here - user is already logged in, just navigation failed
                Alert.alert('Navigation Error', 'Login successful but navigation failed. Please restart the app.');
            }

            setLoading(false);
        } catch (err) {
            setLoading(false);
            console.error('Login error:', err);

            let errorMessage = 'An unexpected error occurred. Please try again.';

            if (err.response) {
                // Server responded with error status
                errorMessage = err.response.data?.message || 
                              err.response.data?.error || 
                              `Server error: ${err.response.status}`;
            } else if (err.request) {
                // Request was made but no response received
                errorMessage = 'Network error. Please check your internet connection and try again.';
            } else if (err.message) {
                // Error message from our validation or other code
                errorMessage = err.message;
            } else if (err.code === 'ECONNABORTED') {
                // Timeout error
                errorMessage = 'Request timed out. Please check your connection and try again.';
            }

            Alert.alert('Login Failed', errorMessage);
        }
    }

    return (
       
        <SafeAreaView style={[defaultStyles.container, { backgroundColor: theme.background }]}>
          
                <View style={{ flex: 1, 
                    marginHorizontal: horizontalScale(22),
                    display:"flex",
                    flexDirection:"column",
                     justifyContent:"center"  }}>
                  
                        <View style={{ marginVertical: verticalScale(22) }}>
                            <Text style={{
                                fontSize: moderateScale(22),
                                fontWeight: 'bold',
                                marginVertical: verticalScale(12),
                                color: theme.text
                            }}>
                                Login to your account
                            </Text>


                        </View>

                        
                        <View >
                        <View style={{ marginBottom: verticalScale(12) }}>
                            <Text style={{
                                fontSize: moderateScale(16),
                                fontWeight: "200",
                                marginVertical: verticalScale(8),
                                color: theme.text,
                                fontFamily:FONT.RobotoLight
                                
                            }}>Email address</Text>

                            <View style={[{
                                width: "100%",
                                height: verticalScale(48),
                                borderColor: theme.border,
                                borderWidth: moderateScale(1),
                                borderRadius: moderateScale(8),
                                alignItems: "center",
                                justifyContent: "center",
                                paddingLeft: horizontalScale(22),
                                backgroundColor: theme.inputBackground
                            },]}>
                                <TextInput
                                    placeholder="Enter Your Email"
                                    placeholderTextColor={theme.textMuted}
                                    autoCapitalize="none"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType='email-address'
                                    style={{
                                        width: "100%",
                                        color: theme.text
                                    }}
                                />
                            </View>
                        </View>



                        <View style={{ marginBottom: verticalScale(12) }}>
                            <Text style={{
                                fontSize: moderateScale(16),
                                fontWeight: "400",
                                marginVertical: verticalScale(8),
                                color: theme.text
                            }}>Password</Text>

                            <View style={[{
                                width: "100%",
                                height: verticalScale(48),
                                borderColor: theme.border,
                                borderWidth: moderateScale(1),
                                borderRadius: moderateScale(8),
                                alignItems: "center",
                                justifyContent: "center",
                                paddingLeft: horizontalScale(22),
                                backgroundColor: theme.inputBackground
                            },]}>
                                <TextInput
                                    placeholder='Enter your password'
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholderTextColor={theme.textMuted}
                                    secureTextEntry={isPasswordShown}
                                    style={{
                                        width: "100%",
                                        color: theme.text
                                    }}
                                />

                                <TouchableOpacity
                                    onPress={() => setIsPasswordShown(!isPasswordShown)}
                                    style={{
                                        position: "absolute",
                                        right: 12
                                    }}
                                >
                                    {
                                        isPasswordShown == true ? (
                                            <Ionicons name="eye-off" size={24} color={theme.primary} />
                                        ) : (
                                            <Ionicons name="eye" size={24} color={theme.text} />
                                        )
                                    }

                                </TouchableOpacity>
                            </View>
                        </View>
                    
                   
                    <TouchableOpacity

                        filled
                        color={theme.primary
                        }
                        style={{
                            padding: moderateScale(12),
                            backgroundColor: theme.primary,
                            borderRadius: moderateScale(8),
                        }}
                        onPress={handleLogin}
                    >
                        {loading?
                         <ActivityIndicator color={theme.text}/>
                         :
                        <Text style={{
                            fontSize: moderateScale(16),
                            fontWeight: "bold",
                            color: theme.white,
                        textAlign: "center"
                        }}>Login</Text>
                        }

                    </TouchableOpacity>



                    <View style={{
                        flexDirection: "row",
                        justifyContent: "center",
                        marginVertical: verticalScale(22)
                    }}>
                        <Text style={{ 
                            fontSize: moderateScale(16),
                             color: theme.text,
                                fontFamily:FONT.RobotoLight
                             }}>Don't have an account?</Text>
                        <Pressable
                            onPress={() => router.replace('/(authenticate)/chooseRole')}
                        >
                            <Text style={{
                                fontSize: moderateScale(16),
                                color: theme.primary,
                                fontWeight: "bold",
                                marginLeft: horizontalScale(6)
                            }}>Register</Text>
                          
                        </Pressable>
                    </View>
                    
                    </View>
                    
                </View>
                <Pressable
                    onPress={handleAdminLogin}
                    >
                {/* <Text style={{
                                alignSelf: "center",
                                fontSize: moderateScale(10),
                                color: theme.primary,
                                fontWeight: "bold",
                                marginLeft: horizontalScale(6)
                            }}>Admin Panel</Text> */}
                </Pressable>
        </SafeAreaView>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        fontSize: moderateScale(24),
        fontWeight: 'bold',
        marginBottom:verticalScale(50),
        alignItems: 'center',

    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(10),
    },
    icon: {
        marginRight: horizontalScale(10),
    },
    input: {
        width: horizontalScale(300),
        height: verticalScale(40),
        borderWidth: moderateScale(1),
        borderRadius: moderateScale(5),
        paddingLeft: horizontalScale(10),
    },
    button: {
        padding: moderateScale(10),
        borderRadius: moderateScale(5),
        marginTop: verticalScale(25),
        width: horizontalScale(150),
    },
    buttonText: {
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: moderateScale(22),
    },
    link: {
        marginTop: verticalScale(10),
        textAlign: 'center',
        fontSize: moderateScale(14),
    }
});

export default LoginPage;
