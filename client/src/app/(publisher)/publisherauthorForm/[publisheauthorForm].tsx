import Button from '@/components/Button'
import { FONT } from '@/constants/tokens'
import { defaultStyles } from '@/styles'
import { ipURL } from '@/utils/backendURL'
import { horizontalScale, moderateScale, verticalScale } from '@/utils/responsiveSize'
import { MaterialIcons, Ionicons } from '@expo/vector-icons'
import { createId } from '@paralleldrive/cuid2'
import axios from 'axios'
import * as DocumentPicker from 'expo-document-picker'
import { router, useLocalSearchParams } from 'expo-router'
import React, { useState } from 'react'
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'   
import { useTheme } from '@/providers/ThemeProvider';

const PublishAuthorForm = () => {
    const { theme } = useTheme();
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
        try {
            let result = await DocumentPicker.getDocumentAsync({
                type: "application/pdf",
                copyToCacheDirectory: true
            });

            if (result.canceled) return;

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
        } catch (error) {
            Alert.alert('Error', 'Failed to pick document. Please try again.');
        }
    };

    const postDocuments = async () => {
        const url = `${ipURL}/api/s3/upload-to-aws`;
        const formData = new FormData();
        
        if (doc1) formData.append('document1', { uri: doc1.uri, name: doc1.name, type: doc1.type } as any);
        if (doc2) formData.append('document2', { uri: doc2.uri, name: doc2.name, type: doc2.type } as any);
       
        formData.append('id', id);
        formData.append('userId', publisheauthorForm as string);
    
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
            throw error;
        }
    };

    const handleSubmit = async () => {
        if (!fullname.trim() || !address.trim() || !telephone.trim() || !idppNo.trim() || !kraPin.trim()) {
            Alert.alert('Missing Information', 'Please fill in all required fields.');
            return;
        }

        if (!doc1 || !doc2) {
            Alert.alert('Missing Documents', 'Please upload both ID/PP and KRA PIN documents.');
            return;
        }

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
            router.replace(`/(publisher)/${id}`);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            Alert.alert('Error', 'Failed to submit application. Please try again.');
            console.error('Error:', error);
        }
    }

    const renderInput = (label, value, setValue, placeholder, keyboardType = 'default' as any, optional = false, icon = null) => (
        <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
                {icon && <Ionicons name={icon} size={22} color={theme.primary} style={styles.labelIcon} />}
                <Text style={styles.label}>
                    {label} {optional && <Text style={styles.optionalText}>(Optional)</Text>}
                </Text>
            </View>
            <View style={[styles.inputWrapper, value && styles.inputWrapperFocused]}>
                <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor={theme.textMuted}
                    value={value}
                    onChangeText={setValue}
                    keyboardType={keyboardType}
                />
            </View>
        </View>
    );

    const renderDocumentUpload = (label, doc, setDoc, icon) => (
        <View style={styles.uploadContainer}>
            <View style={styles.uploadHeader}>
                <Ionicons name={icon} size={22} color={theme.primary} />
                <Text style={styles.uploadLabel}>{label}</Text>
            </View>
            <TouchableOpacity 
                style={[styles.uploadButton, doc && styles.uploadButtonSuccess]}
                onPress={() => pickDocument(setDoc)}
            >
                <View style={styles.uploadContent}>
                    <MaterialIcons 
                        name={doc ? "check-circle" : "cloud-upload"} 
                        size={32} 
                        color={doc ? theme.tertiary : theme.primary}
                    />
                    <View style={styles.uploadTextContainer}>
                        <Text style={[styles.uploadButtonText, doc && styles.uploadButtonTextSuccess]}>
                            {doc ? 'Document Uploaded Successfully' : 'Tap to Upload PDF'}
                        </Text>
                        {doc && (
                            <Text style={styles.fileName}>{doc.name}</Text>
                        )}
                    </View>
                </View>
                {doc && (
                    <TouchableOpacity 
                        style={styles.removeButton}
                        onPress={() => setDoc(null)}
                    >
                        <Ionicons name="close-circle" size={24} color={theme.textMuted} />
                    </TouchableOpacity>
                )}
            </TouchableOpacity>
        </View>
    );

    const styles = StyleSheet.create({
        safeArea: {
            backgroundColor: theme.background,
        },
        container: {
            flex: 1,
            backgroundColor: theme.background,
        },
        header: {
            paddingHorizontal: horizontalScale(24),
            paddingVertical: verticalScale(32),
            backgroundColor: theme.white,
            borderBottomWidth: 1,
            borderBottomColor: theme.gray2,
        },
        headerIcon: {
            width: moderateScale(60),
            height: moderateScale(60),
            borderRadius: moderateScale(30),
            backgroundColor: `${theme.primary}15`,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: verticalScale(16),
        },
        headerTitle: {
            fontSize: moderateScale(32),
            fontWeight: 'bold',
            color: theme.text,
            marginBottom: verticalScale(8),
            fontFamily: FONT.RobotoLight,
        },
        headerSubtitle: {
            fontSize: moderateScale(16),
            color: theme.textMuted,
            fontFamily: FONT.RobotoLight,
            lineHeight: verticalScale(24),
        },
        content: {
            flex: 1,
            paddingHorizontal: horizontalScale(24),
        },
        section: {
            marginTop: verticalScale(32),
        },
        sectionTitle: {
            fontSize: moderateScale(24),
            fontWeight: 'bold',
            color: theme.text,
            marginBottom: verticalScale(24),
            fontFamily: FONT.RobotoLight,
        },
        inputGroup: {
            marginBottom: verticalScale(28),
        },
        labelContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: verticalScale(12),
        },
        labelIcon: {
            marginRight: horizontalScale(12),
        },
        label: {
            fontSize: moderateScale(18),
            fontWeight: "600",
            color: theme.text,
            fontFamily: FONT.RobotoLight,
        },
        optionalText: {
            color: theme.textMuted,
            fontSize: moderateScale(16),
            fontWeight: "400",
        },
        inputWrapper: {
            borderRadius: moderateScale(12),
            backgroundColor: theme.white,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: theme.gray2,
            shadowColor: theme.text,
            shadowOffset: {
                width: 0,
                height: 2,
            },
            
            shadowRadius: 4,
            elevation: 2,
        },
        inputWrapperFocused: {
            borderColor: theme.primary,
            borderWidth: 2,
        },
        input: {
            height: verticalScale(60),
            paddingHorizontal: horizontalScale(20),
            color: theme.text,
            fontSize: moderateScale(16),
            fontFamily: FONT.RobotoLight,
        },
        uploadContainer: {
            marginBottom: verticalScale(28),
        },
        uploadHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: verticalScale(16),
        },
        uploadLabel: {
            fontSize: moderateScale(18),
            fontWeight: "600",
            color: theme.text,
            fontFamily: FONT.RobotoLight,
            marginLeft: horizontalScale(12),
        },
        uploadButton: {
            backgroundColor: theme.white,
            borderRadius: moderateScale(12),
            borderWidth: 2,
            borderColor: theme.gray2,
            borderStyle: 'dashed',
            padding: verticalScale(24),
            shadowColor: theme.text,
            shadowOffset: {
                width: 0,
                height: 2,
            },
            
            shadowRadius: 4,
            elevation: 2,
        },
        uploadButtonSuccess: {
            borderColor: theme.tertiary,
            backgroundColor: `${theme.tertiary}08`,
            borderStyle: 'solid',
        },
        uploadContent: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        uploadTextContainer: {
            marginLeft: horizontalScale(20),
            flex: 1,
        },
        uploadButtonText: {
            color: theme.textMuted,
            fontSize: moderateScale(16),
            fontFamily: FONT.RobotoLight,
            fontWeight: '500',
        },
        uploadButtonTextSuccess: {
            color: theme.tertiary,
            fontWeight: '600',
        },
        fileName: {
            color: theme.textMuted,
            fontSize: moderateScale(14),
            fontFamily: FONT.RobotoLight,
            marginTop: verticalScale(4),
        },
        removeButton: {
            position: 'absolute',
            top: moderateScale(12),
            right: moderateScale(12),
            padding: moderateScale(4),
        },
        submitSection: {
            paddingHorizontal: horizontalScale(24),
            paddingVertical: verticalScale(32),
            backgroundColor: theme.white,
            borderTopWidth: 1,
            borderTopColor: theme.gray2,
        },
        submitButton: {
            height: verticalScale(64),
            borderRadius: moderateScale(16),
            backgroundColor: theme.primary,
            shadowColor: theme.primary,
            shadowOffset: {
                width: 0,
                height: 8,
            },
            
            shadowRadius: 16,
            elevation: 16,
            justifyContent: 'center',
            alignItems: 'center',
        },
        buttonText: {
            color: theme.white,
            fontSize: moderateScale(18),
            fontFamily: FONT.RobotoLight,
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: 1,
        },
    });

    return (
        <SafeAreaView style={[defaultStyles.container, styles.safeArea]}>
            <View style={styles.container}>
                

                <ScrollView 
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: verticalScale(100) }}
                >
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Personal Information</Text>
                        
                        {renderInput("Full Name", fullname, setFullname, "Enter your full name", "default", false, "person")}
                        {renderInput("Address", address, setAddress, "Enter your complete address", "default", false, "location")}
                        {renderInput("Telephone Number", telephone, setTelephone, "Enter your phone number", "phone-pad" as any, false, "call")}
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Identity Documents</Text>
                        
                        {renderInput("ID/PP Number", idppNo, setIdppNo, "Enter your ID or Passport number", "default", false, "card")}
                        {renderDocumentUpload("ID/PP Document", doc1, setDoc1, "document")}
                        
                        {renderInput("KRA PIN Number", kraPin, setKraPin, "Enter your KRA PIN number", "default", false, "business")}
                        {renderDocumentUpload("KRA PIN Document", doc2, setDoc2, "document-text")}
                    </View>
                    
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Professional Information</Text>
                        
                        {renderInput(
                            "Writers Guild Member No.", 
                            writersGuildMemberNo, 
                            setWritersGuildMemberNo, 
                            "Enter your Writers Guild membership number",
                            "default",
                            true,
                            "people"
                        )}
                    </View>
                </ScrollView>

                <View style={styles.submitSection}>
                    <TouchableOpacity
                        style={styles.submitButton}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                       {loading ? (
                           <ActivityIndicator
                               size='large'
                               color={theme.white}
                           />
                       ) : (
                           <Text style={styles.buttonText}>
                               Submit Application
                           </Text>
                       )}
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

export default PublishAuthorForm;