import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useState } from 'react';
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';

import { COLORS, FONT, welcomeCOLOR } from '../../constants/tokens';
import { defaultStyles } from '../../styles/index';
import { ipURL } from '../../utils/backendURL';
import { horizontalScale, moderateScale, verticalScale } from '../../utils/responsiveSize';
import { useTheme } from '@/providers/ThemeProvider';

const LoginPage = () => {
    const { theme } = useTheme();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordShown, setIsPasswordShown] = useState(true);
    const [loading, setLoading] = useState(false);

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

    const handleAdminLoin = async () => {
        const user = {
            email,
            password,
        }
        try {
            setLoading(true);
            console.log(user, 'user');
            const resp = await axios.post(`${ipURL}/api/auth/admin`, user)
            console.log(resp.data, 'Logged in succesfully');
            
            await SecureStore.setItemAsync("authToken",JSON.stringify({token:resp.data.token}));
            await SecureStore.setItemAsync("userDetails",JSON.stringify({role:resp.data.role,userId:resp.data.id,email:resp.data.email}));
            const result = await SecureStore.getItemAsync("authToken");
            const userDetails = await SecureStore.getItemAsync("userDetails");

            console.log(result, 'this is token');
            console.log(JSON.parse(userDetails), 'this is userDetails');
            

            if (resp.data.role === 'ADMIN') {
                router.replace('/(admin)/home');
            }
            
            setLoading(false);
        }
        catch (err) {
            setLoading(false);
            console.log(err);
            Alert.alert(err.response)
            return;
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
                                Admin Portal
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
                                borderColor: theme.gray2,
                                borderWidth: moderateScale(1),
                                borderRadius: moderateScale(8),
                                alignItems: "center",
                                justifyContent: "center",
                                paddingLeft: horizontalScale(22),
                                backgroundColor: theme.white
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
                                borderColor: theme.gray2,
                                borderWidth: moderateScale(1),
                                borderRadius: moderateScale(8),
                                alignItems: "center",
                                justifyContent: "center",
                                paddingLeft: horizontalScale(22),
                                backgroundColor: theme.white
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
                                            <Ionicons name="eye-off" size={24} color={theme.textMuted} />
                                        ) : (
                                            <Ionicons name="eye" size={24} color={theme.text} />
                                        )
                                    }

                                </TouchableOpacity>
                            </View>
                        </View>
                    
                   
                    <TouchableOpacity
                        style={{
                            padding: moderateScale(12),
                            backgroundColor: theme.primary,
                            borderRadius: moderateScale(8),
                        }}
                        onPress={handleAdminLoin}
                    >
                        {loading?
                         <ActivityIndicator color={theme.white}/>
                         :
                        <Text style={{
                            fontSize: moderateScale(16),
                            fontWeight: "bold",
                            color: theme.white,
                        textAlign: "center"
                        }}>Login</Text>
                        }

                    </TouchableOpacity>



                  
                    
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
