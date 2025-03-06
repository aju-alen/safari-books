import Button from '@/components/Button'
import { FONT } from '@/constants/tokens'
import { defaultStyles } from '@/styles'
import { ipURL } from '@/utils/backendURL'
import { horizontalScale, moderateScale, verticalScale } from '@/utils/responsiveSize'
import { MaterialIcons } from '@expo/vector-icons'
import { createId } from '@paralleldrive/cuid2'
import axios from 'axios'
import * as DocumentPicker from 'expo-document-picker'
import { router, useLocalSearchParams } from 'expo-router'
import React, { useState } from 'react'
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'


const PublishAuthorForm = () => {
    const id = createId();
    const { publisheauthorForm } = useLocalSearchParams()
    const [fullname, setFullname] = useState('')
    const [address, setAddress] = useState('')
    const [telephone, setTelephone] = useState('')
    const [idppNo, setIdppNo] = useState('')
    const [kraPin, setKraPin] = useState('')
    const [writersGuildMemberNo, setWritersGuildMemberNo] = useState('')
    const [doc1, setDoc1] = useState(null)
    const [doc2, setDoc2] = useState(null)
    const [loading, setLoading] = useState(false)

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
       
        formData.append('id', id);
        formData.append('userId', publisheauthorForm);
    
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
            if (!response.ok) throw new Error('Network response was not ok');
            const responseData = await response.json();
            return responseData['data'];
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const docURL = await postDocuments();
            
            const data = {
                id,
                fullName: fullname,
                address: address,
                telephone: telephone,
                idppNo: idppNo,
                idppPdfUrl: docURL[0],
                kraPin: kraPin,
                kraPinPdfUrl: docURL[1],
                writersGuildNo: writersGuildMemberNo,
                userId: publisheauthorForm
            }
            const response = await axios.post(`${ipURL}/api/publisher/create-author`, data);
            console.log(response.data, 'after backend data is saved');
            router.push(`/(publisher)/${id}`);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.error('Error:', error);
        }
    }

    const renderInput = (label, value, setValue, placeholder, keyboardType = 'default', optional = false) => (
        <View style={styles.inputGroup}>
            <Text style={styles.label}>
                {label} {optional && <Text style={styles.optionalText}>(Optional)</Text>}
            </Text>
            <View style={styles.inputWrapper}>
                <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor="#666666"
                    value={value}
                    onChangeText={setValue}
                    keyboardType={keyboardType}
                />
            </View>
        </View>
    );

    const renderDocumentUpload = (label, doc, setDoc) => (
        <TouchableOpacity 
            style={[styles.uploadButton, doc && styles.uploadButtonSuccess]}
            onPress={() => pickDocument(setDoc)}
        >
            <MaterialIcons 
                name={doc ? "check-circle" : "upload-file"} 
                size={24} 
                color={doc ? "#4CAF50" : "#4A4DFF"}
            />
            <Text style={[styles.uploadButtonText, doc && styles.uploadButtonTextSuccess]}>
                {doc ? `✓ ${label} Uploaded` : `Upload ${label}`}
            </Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[defaultStyles.container, styles.safeArea]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        {/* <Text style={styles.headerTitle}>Publish as an Author</Text> */}
                        <Text style={styles.headerSubtitle}>Complete your author profile to get started</Text>
                    </View>

                    <View style={styles.formContainer}>
                        {renderInput("Full Name", fullname, setFullname, "Enter your full name")}
                        {renderInput("Address", address, setAddress, "Enter your address")}
                        {renderInput("Telephone Number", telephone, setTelephone, "Enter your telephone number", "phone-pad")}
                        
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>ID/PP Number</Text>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your ID/PP number"
                                    placeholderTextColor="#666666"
                                    value={idppNo}
                                    onChangeText={setIdppNo}
                                />
                            </View>
                            {renderDocumentUpload("ID/PP Document", doc1, setDoc1)}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>KRA PIN Number</Text>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your KRA PIN number"
                                    placeholderTextColor="#666666"
                                    value={kraPin}
                                    onChangeText={setKraPin}
                                />
                            </View>
                            {renderDocumentUpload("KRA PIN Document", doc2, setDoc2)}
                        </View>

                        {renderInput(
                            "Writers Guild Member No.", 
                            writersGuildMemberNo, 
                            setWritersGuildMemberNo, 
                            "Enter your Writers Guild number",
                            "default",
                            true
                        )}

                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={handleSubmit}
                        >
                           {loading?<ActivityIndicator
                            size='large'
                            color="#FFFFFF"
                            style={{padding: moderateScale(16)}}
                           />: <Text 
                            style={[defaultStyles.text,{
                                fontSize: moderateScale(16),
                                fontFamily: FONT.RobotoLight,
                                textAlign: 'center',
                                lineHeight: verticalScale(56),
                                color: '#FFFFFF',
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                letterSpacing: 1,
                            }] }
                            >Submit Application</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {

    },
    container: {
        flex: 1,

    },
    header: {

        paddingHorizontal: horizontalScale(4),
    },
    headerTitle: {
        fontSize: moderateScale(32),
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: verticalScale(8),
        fontFamily: FONT.RobotoLight,
    },
    headerSubtitle: {
        fontSize: moderateScale(16),
        color: '#A0A0A0',
        fontFamily: FONT.RobotoLight,
    },
    formContainer: {
        backgroundColor: '#0A0A0A',
        borderRadius: moderateScale(20),
        padding: moderateScale(24),
        shadowColor: '#4A4DFF',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
        borderWidth: 1,
        borderColor: '#1A1A1A',
    },
    inputGroup: {
        marginBottom: verticalScale(24),
    },
    label: {
        fontSize: moderateScale(16),
        fontWeight: "600",
        marginBottom: verticalScale(8),
        color: '#FFFFFF',
        fontFamily: FONT.RobotoLight,
    },
    optionalText: {
        color: '#666666',
        fontSize: moderateScale(14),
        fontWeight: "400",
    },
    inputWrapper: {
        borderRadius: moderateScale(12),
        backgroundColor: '#1A1A1A',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#333333',
    },
    input: {
        height: verticalScale(50),
        paddingHorizontal: horizontalScale(16),
        color: '#FFFFFF',
        fontSize: moderateScale(16),
        fontFamily: FONT.RobotoLight,
    },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1A1A1A',
        padding: moderateScale(12),
        borderRadius: moderateScale(12),
        borderWidth: 1,
        borderColor: '#4A4DFF',
        marginTop: verticalScale(8),
    },
    uploadButtonSuccess: {
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
    },
    uploadButtonText: {
        color: '#FFFFFF',
        marginLeft: horizontalScale(8),
        fontSize: moderateScale(14),
        fontFamily: FONT.RobotoLight,
    },
    uploadButtonTextSuccess: {
        color: '#4CAF50',
    },
    submitButton: {
        marginTop: verticalScale(32),
        height: verticalScale(56),
        borderRadius: moderateScale(12),
        backgroundColor:"#4A4DFF",
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: moderateScale(16),
        fontFamily: FONT.RobotoLight,
        textAlign: 'center',
        lineHeight: verticalScale(56),
    },
});

export default PublishAuthorForm;