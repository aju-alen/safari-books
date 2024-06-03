import React, { useEffect, useState } from 'react';
import { View, TextInput, SafeAreaView, StyleSheet, KeyboardAvoidingView, TouchableOpacity, Text,Pressable, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { ipURL } from '../../utils/backendURL.ts';
import { COLORS, FONT, SHADOWS } from '../../constants/tokens.ts';
import { welcomeCOLOR } from '../../constants/tokens.ts';
import Button from '../../components/Button.tsx';
import { horizontalScale, moderateScale, verticalScale } from '../../utils/responsiveSize.ts';
import { defaultStyles } from '../../styles/index.ts';


const LoginPage = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordShown, setIsPasswordShown] = useState(true);

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

    const handleLogin = async () => {
        const user = {
            email,
            password,
        }
        try {
            console.log(user, 'user');
            const resp = await axios.post(`${ipURL}/api/auth/login`, user)
            console.log(resp.data, 'Logged in succesfully');
            
            await SecureStore.setItemAsync("authToken",resp.data.token);
            await SecureStore.setItemAsync("userDetails",JSON.stringify({role:resp.data.role,userId:resp.data.id,email:resp.data.email}));
            const result = await SecureStore.getItemAsync("authToken");
            const userDetails = await SecureStore.getItemAsync("userDetails");

            if (resp.data.role === 'LISTENER') {
                router.replace('/(tabs)/home');
            }
            else if (resp.data.role === 'PUBLISHER') {
                router.replace('/(publisher)/publisherhome');
            }

        }
        catch (err) {
            console.log(err);
            Alert.alert(err.response.data.message)
            return;
        }
    }

    return (
       
        <SafeAreaView style={defaultStyles.container }>
          
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
                                color: welcomeCOLOR.white
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
                                color: welcomeCOLOR.black,
                                fontFamily:FONT.RobotoLight
                                
                            }}>Email address</Text>

                            <View style={[{
                                width: "100%",
                                height: verticalScale(48),
                                borderColor: welcomeCOLOR.black,
                                borderWidth: moderateScale(1),
                                borderRadius: moderateScale(8),
                                alignItems: "center",
                                justifyContent: "center",
                                paddingLeft: horizontalScale(22)
                            },]}>
                                <TextInput
                                    placeholder="Enter Your Email"
                                    placeholderTextColor="gray"
                                    autoCapitalize="none"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType='email-address'
                                    style={{
                                        width: "100%",
                                        color: COLORS.white
                                    }}
                                />
                            </View>
                        </View>



                        <View style={{ marginBottom: verticalScale(12) }}>
                            <Text style={{
                                fontSize: moderateScale(16),
                                fontWeight: "400",
                                marginVertical: verticalScale(8)
                            }}>Password</Text>

                            <View style={[{
                                width: "100%",
                                height: verticalScale(48),
                                borderColor: welcomeCOLOR.black,
                                borderWidth: moderateScale(1),
                                borderRadius: moderateScale(8),
                                alignItems: "center",
                                justifyContent: "center",
                                paddingLeft: horizontalScale(22)
                            },]}>
                                <TextInput
                                    placeholder='Enter your password'
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholderTextColor="gray"
                                    secureTextEntry={isPasswordShown}
                                    style={{
                                        width: "100%",
                                        color: COLORS.white
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
                                            <Ionicons name="eye-off" size={24} color={COLORS.secondary} />
                                        ) : (
                                            <Ionicons name="eye" size={24} color={COLORS.white} />
                                        )
                                    }

                                </TouchableOpacity>
                            </View>
                        </View>
                    
                    <Button
                        title="Login"
                        filled
                        color={COLORS.secondary
                        }
                        style={{
                            marginTop: verticalScale(18),
                            marginBottom: verticalScale(4),
                        }}
                        onPress={handleLogin}
                    />



                    <View style={{
                        flexDirection: "row",
                        justifyContent: "center",
                        marginVertical: verticalScale(22)
                    }}>
                        <Text style={{ 
                            fontSize: moderateScale(16),
                             color: welcomeCOLOR.white,
                                fontFamily:FONT.RobotoLight
                             }}>Don't have an account?</Text>
                        <Pressable
                            onPress={() => router.replace('/(authenticate)/chooseRole')}
                        >
                            <Text style={{
                                fontSize: moderateScale(16),
                                color: COLORS.primary,
                                fontWeight: "bold",
                                marginLeft: horizontalScale(6)
                            }}>Register</Text>
                        </Pressable>
                    </View>
                    </View>
                </View>
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
        backgroundColor: '#1E90FF',
        padding: 10,
        borderRadius: 5,
        marginTop: 25,
        width: 150,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 22,
    },
    link: {
        marginTop: 10,
        color: 'gray',
        textAlign: 'center',
        fontSize: 14,
    }
});

export default LoginPage;
