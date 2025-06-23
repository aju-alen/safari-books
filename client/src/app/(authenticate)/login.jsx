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
        const user = {
            email,
            password,
        }
        try {
            setLoading(true);
            console.log(user, 'user');
            const resp = await axios.post(`${ipURL}/api/auth/login`, user)
            console.log(resp.data, 'Logged in succesfully');
            
            await SecureStore.setItemAsync("authToken",JSON.stringify({token:resp.data.token}));
            await SecureStore.setItemAsync("userDetails",JSON.stringify({role:resp.data.role,userId:resp.data.id,email:resp.data.email}));

            const sbOnboarding = await SecureStore.getItemAsync("sb-onboarding");
            console.log(sbOnboarding, 'sbOnboarding');

            if (resp.data.role === 'LISTENER' && sbOnboarding === null) {
                router.replace('/(onboarding)/listeneronboarding');
            }
            else if (resp.data.role === 'LISTENER' && sbOnboarding === 'false') {
                router.replace('/(tabs)/home');
            }

            else if (resp.data.role === 'PUBLISHER' && sbOnboarding === null) {
                router.replace('/(onboarding)/publisheronboarding');
            }
            else if (resp.data.role === 'PUBLISHER' && sbOnboarding === 'false') {
                router.replace('/(publisher)/publisherhome');
            }

            setLoading(false);
        }
        catch (err) {
            console.log('this is error');
            setLoading(false);
            console.log(err);
            Alert.alert(err.response.data.message)
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
                <Text style={{
                                alignSelf: "center",
                                fontSize: moderateScale(10),
                                color: theme.primary,
                                fontWeight: "bold",
                                marginLeft: horizontalScale(6)
                            }}>Admin Panel</Text>
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
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom:50,
        alignItems: 'center',

    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    icon: {
        marginRight: 10,
    },
    input: {
        width: 300,
        height: 40,
        borderWidth: 1,
        borderRadius: 5,
        paddingLeft: 10,
    },
    button: {
        padding: 10,
        borderRadius: 5,
        marginTop: 25,
        width: 150,
    },
    buttonText: {
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 22,
    },
    link: {
        marginTop: 10,
        textAlign: 'center',
        fontSize: 14,
    }
});

export default LoginPage;
