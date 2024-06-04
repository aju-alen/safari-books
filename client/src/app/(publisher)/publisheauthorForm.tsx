import { StyleSheet, Text, TextInput,TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { defaultStyles } from '@/styles'
import { horizontalScale, verticalScale, moderateScale } from '@/utils/responsiveSize'
import { COLORS, FONT, welcomeCOLOR } from '@/constants/tokens'
import Button from '@/components/Button'
import * as DocumentPicker from 'expo-document-picker';
import { ipURL } from '@/utils/backendURL'
import { router } from 'expo-router'

const publisheauthorForm = () => {
    const [fullname, setFullname] = React.useState('')
    const [address, setAddress] = React.useState('')
    const [telephone, setTelephone] = React.useState('')
    const [idppNo, setIdppNo] = React.useState('')
    const [kraPin, setKraPin] = React.useState('')
    const [writersGuildMemberNo, setWritersGuildMemberNo] = React.useState('')
    const [doc1, setDoc1] = useState(null);
    const [doc2, setDoc2] = useState(null);
    const [formData, setFormData] = useState({})
    

    const pickDocument = async (setDoc) => {
        let result = await DocumentPicker.getDocumentAsync({
            type: "application/pdf",
            copyToCacheDirectory: true
        });

        
            let { name, size, uri } = result["assets"][0];
            let nameParts = name.split('.');
            let fileType = nameParts[nameParts.length - 1];
            var fileToUpload = {
                name: name,
                size: size,
                uri: uri,
                type: "application/" + fileType
            };
            setDoc(fileToUpload);
    };

    const postDocuments = async () => {
        const url = `${ipURL}/api/s3/upload-to-aws`;
        const formData = new FormData();
        
        if (doc1) formData.append('document1', { uri: doc1.uri, name: doc1.name, type: doc1.type });
        if (doc2) formData.append('document2', { uri: doc2.uri, name: doc2.name, type: doc2.type });
       
    
        const options = {
            method: 'POST',
            body: formData,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'multipart/form-data',
            },
        };
    
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const responseData = await response.json();
            console.log('Success:', responseData);
            const data = {
                fullname: fullname,
                address: address,
                telephone: telephone,
                idppNo: idppNo,
                kraPin: kraPin,
                writersGuildMemberNo: writersGuildMemberNo,
                publishingType: "author",
            }
            console.log(data);
            router.push(`/(publisher)/${123}`);
            
        } catch (error) {
            console.error('Error:', error);
        }
    };
    




    const handleAuthorForm = () => {
        console.log('handleAuthorForm in logs');

    }

    return (

        <SafeAreaView style={defaultStyles.container}>
            
            
            <View style={{
                flex: 1,
                marginHorizontal: horizontalScale(22),
                display: "flex",
                flexDirection: "column",
                justifyContent: "center"
            }}>

                <View style={{ marginVertical: verticalScale(22) }}>
                    <Text style={{
                        fontSize: moderateScale(22),
                        fontWeight: 'bold',
                        marginVertical: verticalScale(12),
                        color: welcomeCOLOR.white
                    }}>
                        Publish as an author
                    </Text>


                </View>


                <View >
                    <View style={{ marginBottom: verticalScale(12) }}>
                        <Text style={{
                            fontSize: moderateScale(16),
                            fontWeight: "200",
                            marginVertical: verticalScale(8),
                            color: welcomeCOLOR.black,
                            fontFamily: FONT.RobotoLight

                        }}>Full name</Text>

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
                                placeholder="Enter Your Full name"
                                placeholderTextColor="gray"
                                autoCapitalize="none"
                                value={fullname}
                                onChangeText={setFullname}
                                keyboardType='default'
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
                            fontWeight: "200",
                            marginVertical: verticalScale(8),
                            color: welcomeCOLOR.black,
                            fontFamily: FONT.RobotoLight

                        }}>Address</Text>

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
                                placeholder="Enter Your Address"
                                placeholderTextColor="gray"
                                autoCapitalize="none"
                                value={address}
                                onChangeText={setAddress}
                                keyboardType='default'
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
                            fontWeight: "200",
                            marginVertical: verticalScale(8),
                            color: welcomeCOLOR.black,
                            fontFamily: FONT.RobotoLight

                        }}>Telephone number</Text>

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
                                placeholder="Enter Your Telephone number"
                                placeholderTextColor="gray"
                                autoCapitalize="none"
                                value={telephone}
                                onChangeText={setTelephone}
                                keyboardType='number-pad'
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
                            fontWeight: "200",
                            marginVertical: verticalScale(8),
                            color: welcomeCOLOR.black,
                            fontFamily: FONT.RobotoLight

                        }}>ID/PP No.</Text>

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
                                placeholder="Enter Your ID/PP No."
                                placeholderTextColor="gray"
                                autoCapitalize="none"
                                value={idppNo}
                                onChangeText={setIdppNo}
                                keyboardType='number-pad'
                                style={{
                                    width: "100%",
                                    color: COLORS.white
                                }}
                            />
                        </View>
                        <TouchableOpacity onPress={() => pickDocument(setDoc1)}>
                            <Text style={{
                                fontSize: moderateScale(16),
                                fontWeight: "200",
                                marginVertical: verticalScale(8),
                                color: COLORS.white,
                                fontFamily: FONT.RobotoLight

                            }}>Upload ID/PP</Text>
                        </TouchableOpacity>
                        
                    </View>
                    <View style={{ marginBottom: verticalScale(12) }}>
                        <Text style={{
                            fontSize: moderateScale(16),
                            fontWeight: "200",
                            marginVertical: verticalScale(8),
                            color: welcomeCOLOR.black,
                            fontFamily: FONT.RobotoLight

                        }}>KRA PIN No.</Text>

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
                                placeholder="Enter Your KRA PIN No."
                                placeholderTextColor="gray"
                                autoCapitalize="none"
                                value={kraPin}
                                onChangeText={setKraPin}
                                keyboardType='number-pad'
                                style={{
                                    width: "100%",
                                    color: COLORS.white
                                }}
                            />
                        </View>
                        <TouchableOpacity onPress={() => pickDocument(setDoc2)}>
                            <Text style={{
                                fontSize: moderateScale(16),
                                fontWeight: "200",
                                marginVertical: verticalScale(8),
                                color: COLORS.white,
                                fontFamily: FONT.RobotoLight

                            }}>Upload KRA PIN No.</Text>
                        </TouchableOpacity>
                        
                    </View>
                    <View style={{ marginBottom: verticalScale(12) }}>
                        <Text style={{
                            fontSize: moderateScale(16),
                            fontWeight: "200",
                            marginVertical: verticalScale(8),
                            color: welcomeCOLOR.black,
                            fontFamily: FONT.RobotoLight

                        }}>Writers Guild Member No.</Text>

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
                                placeholder="Enter Your Writers Guild Member No. (optional)"
                                placeholderTextColor="gray"
                                autoCapitalize="none"
                                value={writersGuildMemberNo}
                                onChangeText={setWritersGuildMemberNo}
                                keyboardType='number-pad'
                                style={{
                                    width: "100%",
                                    color: COLORS.white
                                }}
                            />
                        </View>
                        
                        
                    </View>

                    <Button
                        title="Submit"
                        filled
                        color={COLORS.secondary
                        }
                        style={{
                            marginTop: verticalScale(18),
                            marginBottom: verticalScale(4),
                        }}
                        onPress={postDocuments}
                    />

                </View>


            </View>
        </SafeAreaView>
    )
}

export default publisheauthorForm

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
    }
});