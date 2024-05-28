import React, { useState } from 'react';
import { View, TextInput, SafeAreaView, StyleSheet, KeyboardAvoidingView, TouchableOpacity, Text, Pressable, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import axios from 'axios';
import { ipURL } from '../../utils/backendURL'
import { COLORS, welcomeCOLOR } from '../../constants/tokens';
import Button from '../../components/Button';
import { verticalScale, horizontalScale, moderateScale } from '../../utils/responsiveSize';
import { defaultStyles } from '../../styles/index'

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [isPasswordShown, setIsPasswordShown] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');


    const handleRegister = async () => {
        const user = {
            name,
            email,
            password,
            confirmPassword,
        }
        try {
            if (password !== confirmPassword) {
                Alert.alert('Passwords do not match');
                return;
            }
            console.log(`${ipURL}/api/auth/register`);
            
            const resp = await axios.post(`${ipURL}/api/auth/register`, user)
            console.log(resp.data, 'Registered succesfully');
            Alert.alert('Registration Succesful, Verify email to login');
            router.replace(`/(authenticate)/${resp.data.id}`);
        }
        catch (error) {
            console.log(error.response.data, 'Error in registration');
            Alert.alert(error.response.data.message);
            return;
        }
    }

    return (

        <SafeAreaView style={defaultStyles.container}>
            <ScrollView  >

                <View style={{ flex: 1, marginHorizontal: horizontalScale(22) }}>
                    <KeyboardAvoidingView style={styles.container} behavior='height' >
                        <View style={{ marginVertical: verticalScale(22) }}>
                            <Text style={{
                                fontSize: moderateScale(22),
                                fontWeight: 'bold',
                                marginVertical: verticalScale(12),
                                color: welcomeCOLOR.white
                            }}>
                                Create Account
                            </Text>


                        </View>

                        <View style={{ marginBottom: verticalScale(12) }}>
                            <Text style={{
                                fontSize: moderateScale(16),
                                fontWeight: "400",
                                marginVertical: verticalScale(8),
                                color: welcomeCOLOR.black
                            }}>Name</Text>

                            <View style={{
                                width: "100%",
                                height: verticalScale(48),
                                borderColor: welcomeCOLOR.black,
                                borderWidth: moderateScale(1),
                                borderRadius: moderateScale(8),
                                alignItems: "center",
                                justifyContent: "center",
                                paddingLeft: horizontalScale(22)
                            }}>
                                <TextInput
                                    placeholder="Enter Your Name"
                                    placeholderTextColor="gray"
                                    value={name}
                                    onChangeText={setName}
                                    keyboardType='default'
                                    style={{
                                        width: "100%",
                                        color: welcomeCOLOR.white
                                    }}
                                />
                            </View>
                        </View>

                        <View style={{ marginBottom: verticalScale(12) }}>
                            <Text style={{
                                fontSize: moderateScale(16),
                                fontWeight: "400",
                                marginVertical: verticalScale(8),
                                color: welcomeCOLOR.black
                            }}>Email address</Text>

                            <View style={{
                                width: "100%",
                                height: verticalScale(48),
                                borderColor: welcomeCOLOR.black,
                                borderWidth: moderateScale(1),
                                borderRadius: moderateScale(8),
                                alignItems: "center",
                                justifyContent: "center",
                                paddingLeft: horizontalScale(22)
                            }}>
                                <TextInput
                                    placeholder="Enter Your Email"
                                    placeholderTextColor="gray"
                                    autoCapitalize="none"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType='email-address'
                                    style={{
                                        width: "100%",
                                        color: welcomeCOLOR.white
                                    }}
                                />
                            </View>
                        </View>



                        <View style={{ marginBottom: verticalScale(12) }}>
                            <Text style={{
                                fontSize: moderateScale(16),
                                fontWeight: "400",
                                marginVertical: verticalScale(8),
                                color: welcomeCOLOR.black
                            }}>Password</Text>

                            <View style={{
                                width: "100%",
                                height: verticalScale(48),
                                borderColor: welcomeCOLOR.black,
                                borderWidth: moderateScale(1),
                                borderRadius: moderateScale(8),
                                alignItems: "center",
                                justifyContent: "center",
                                paddingLeft: horizontalScale(22)
                            }}>
                                <TextInput
                                    placeholder='Enter your password'
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholderTextColor="gray"
                                    secureTextEntry={isPasswordShown}
                                    style={{
                                        width: "100%",
                                        color: welcomeCOLOR.white
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
                                            <Ionicons name="eye" size={24} color={welcomeCOLOR.grey} />
                                        )
                                    }

                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={{ marginBottom: verticalScale(12) }}>
                            <Text style={{
                                fontSize: moderateScale(16),
                                fontWeight: "400",
                                marginVertical: verticalScale(8),
                                color: welcomeCOLOR.black
                            }}>Re-enter Password</Text>

                            <View style={{
                                width: "100%",
                                height: verticalScale(48),
                                borderColor: welcomeCOLOR.black,
                                borderWidth: moderateScale(1),
                                borderRadius: moderateScale(8),
                                alignItems: "center",
                                justifyContent: "center",
                                paddingLeft: horizontalScale(22)
                            }}>
                                <TextInput
                                    placeholder='Re-enter your password'
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    placeholderTextColor="gray"
                                    secureTextEntry={isPasswordShown}
                                    style={{
                                        width: "100%",
                                        color: welcomeCOLOR.white
                                    }}
                                />

                                <TouchableOpacity
                                    onPress={() => setIsPasswordShown(!isPasswordShown)}
                                    style={{
                                        position: "absolute",
                                        right: 12,
                                    }}
                                >
                                    {
                                        isPasswordShown == true ? (
                                            <Ionicons name="eye-off" size={24} color={COLORS.secondary} />
                                        ) : (
                                            <Ionicons name="eye" size={24} color={welcomeCOLOR.grey} />
                                        )
                                    }

                                </TouchableOpacity>
                            </View>
                        </View>
                    </KeyboardAvoidingView>

                    <Button
                        title="Sign Up"
                        filled
                        color={COLORS.secondary
                        }
                        style={{
                            marginTop: verticalScale(18),
                            marginBottom: verticalScale(4),
                        }}
                        onPress={handleRegister}
                    />



                    <View style={{
                        flexDirection: "row",
                        justifyContent: "center",
                        marginVertical: verticalScale(22)
                    }}>
                        <Text style={{ fontSize: moderateScale(16), color: welcomeCOLOR.white }}>Already have an account?</Text>
                        <Pressable
                            onPress={() => router.replace('/(authenticate)/login')}
                        >
                            <Text style={{
                                fontSize: moderateScale(16),
                                color: COLORS.primary,
                                fontWeight: "bold",
                                marginLeft: horizontalScale(6)
                            }}>Login</Text>
                        </Pressable>
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    )
};

export default RegisterPage;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // justifyContent: 'center',
        // alignItems: 'center',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 50,
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
    },
    checkbox: {
        margin: 8,
    },
    chip: {
        backgroundColor: COLORS.primary,
        borderRadius: moderateScale(20),
        paddingVertical: verticalScale(6),
        paddingHorizontal: horizontalScale(12),
        marginRight: horizontalScale(8),
        marginBottom: verticalScale(8),
    },
    chipText: {
        color: 'white',
        fontSize: moderateScale(14),
    },
});








