import Button from '@/components/Button'
import { FONT } from '@/constants/tokens'
import { defaultStyles } from '@/styles'
import { ipURL } from '@/utils/backendURL'
import { horizontalScale, moderateScale, verticalScale } from '@/utils/responsiveSize'
import { createId } from '@paralleldrive/cuid2'
import axios from 'axios'
import * as DocumentPicker from 'expo-document-picker'
import { router, useLocalSearchParams } from 'expo-router'
import React, { useState } from 'react'
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '@/providers/ThemeProvider'
import { Ionicons, Feather } from '@expo/vector-icons'

const PublisherCompanyForm = () => {
  const id = createId()
  const { publishercompanyForm } = useLocalSearchParams()
  const {theme} = useTheme()
  const [companyName, setCompanyName] = useState('')
  const [address, setAddress] = useState('')
  const [telephone, setTelephone] = useState('')
  const [companyRegNo, setCompanyRegNo] = useState('')
  const [kraPin, setKraPin] = useState('')
  const [doc1, setDoc1] = useState(null)
  const [doc2, setDoc2] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  const pickDocument = async (setDoc) => {
    let result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
      copyToCacheDirectory: true
    })

    if (!result.canceled) {
      let { name, size, uri } = result.assets[0]
      let nameParts = name.split('.')
      let fileType = nameParts[nameParts.length - 1]
      var fileToUpload = {
        name: name,
        size: size,
        uri: uri,
        type: "application/" + fileType
      }
      setDoc(fileToUpload)
    }
  }

  const postDocuments = async () => {
    const url = `${ipURL}/api/s3/upload-to-aws`
    const formData = new FormData()

    if (doc1) formData.append('document1', { uri: doc1.uri, name: doc1.name, type: doc1.type } as any)
    if (doc2) formData.append('document2', { uri: doc2.uri, name: doc2.name, type: doc2.type } as any)

    formData.append('id', id)
    formData.append('userId', publishercompanyForm as string)

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      })
      if (!response.ok) throw new Error('Network response was not ok')
      const responseData = await response.json()
      return responseData['data']
    } catch (error) {
      console.error('Error:', error)
      return error
    }
  }

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}
    
    if (!companyName.trim()) {
      newErrors.companyName = 'Company name is required'
    }
    
    if (!address.trim()) {
      newErrors.address = 'Address is required'
    }
    
    if (!telephone.trim()) {
      newErrors.telephone = 'Telephone number is required'
    }
    
    if (!companyRegNo.trim()) {
      newErrors.companyRegNo = 'Company registration number is required'
    }
    
    if (!kraPin.trim()) {
      newErrors.kraPin = 'KRA PIN is required'
    }
    
    if (!doc1) {
      newErrors.doc1 = 'Company registration document is required'
    }
    
    if (!doc2) {
      newErrors.doc2 = 'KRA PIN document is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    // Validate form before proceeding
    if (!validateForm()) {
      return
    }
    
    try {
      setLoading(true)
      const docData = await postDocuments()
      const data = {
        id,
        companyName,
        address,
        telephone,
        companyRegNo,
        kraPin,
        companyRegNoPdfUrl: docData[0],
        kraPinPdfUrl: docData[1],
        userId: publishercompanyForm
      }

      await axios.post(`${ipURL}/api/publisher/create-company`, data)
      router.replace(`/(publisher)/${id}`)
      setLoading(false)
    } catch (error) {
      setLoading(false)
      console.log(error, 'error')
    }
  }

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.background,
    },
    content: {
      flex: 1,
      padding: moderateScale(20),
    },
    header: {
      alignItems: 'center',
      marginBottom: verticalScale(32),
      paddingTop: verticalScale(20),
    },
    title: {
      fontSize: moderateScale(24),
      fontWeight: '700',
      color: theme.text,
      marginBottom: verticalScale(8),
      textAlign: 'center',
    },
    subtitle: {
      fontSize: moderateScale(14),
      color: theme.textMuted,
      textAlign: 'center',
      lineHeight: moderateScale(20),
    },
    form: {
      gap: verticalScale(20),
    },
    fieldGroup: {
      marginBottom: verticalScale(16),
    },
    label: {
      fontSize: moderateScale(14),
      fontWeight: '600',
      color: theme.text,
      marginBottom: verticalScale(8),
      fontFamily: FONT.RobotoMedium,
    },
    input: {
      width: '100%',
      height: verticalScale(52),
      backgroundColor: theme.white,
      borderRadius: moderateScale(12),
      paddingHorizontal: horizontalScale(16),
      color: theme.text,
      borderWidth: 1.5,
      borderColor: theme.gray2,
      fontSize: moderateScale(16),
      shadowColor: theme.text,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    documentSection: {
      marginTop: verticalScale(12),
    },
    uploadButton: {
      paddingVertical: verticalScale(14),
      paddingHorizontal: horizontalScale(20),
      borderRadius: moderateScale(10),
      backgroundColor: theme.primary,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      shadowColor: theme.text,
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 6,
    },
    uploadText: {
      color: theme.white,
      fontSize: moderateScale(14),
      fontWeight: '600',
      marginLeft: horizontalScale(8),
    },
    uploadIcon: {
      marginRight: horizontalScale(4),
    },
    submitSection: {
      marginTop: verticalScale(32),
      paddingHorizontal: horizontalScale(10),
    },
    submitButton: {
      height: verticalScale(56),
      backgroundColor: theme.primary,
      borderRadius: moderateScale(16),
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: theme.text,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    submitText: {
      color: theme.white,
      fontSize: moderateScale(18),
      fontWeight: '700',
      fontFamily: FONT.RobotoMedium,
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingText: {
      color: theme.white,
      fontSize: moderateScale(16),
      fontWeight: '600',
      marginLeft: horizontalScale(8),
    },
    errorText: {
      color: '#FF6B6B',
      fontSize: moderateScale(12),
      marginTop: verticalScale(4),
      fontFamily: FONT.RobotoLight,
    },
    inputError: {
      borderColor: '#FF6B6B',
      borderWidth: 2,
    },
  })

  return (
    <SafeAreaView style={[defaultStyles.container, styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header Section */}
          <View style={styles.header}>
            <Text style={styles.title}>Company Registration</Text>
            <Text style={styles.subtitle}>Complete your company profile to start publishing</Text>
          </View>
          
          <View style={styles.form}>
            {/* Company Information Section */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Company Name</Text>
              <TextInput
                placeholder="Enter company name"
                placeholderTextColor={theme.textMuted}
                value={companyName}
                onChangeText={setCompanyName}
                style={[styles.input, errors.companyName && styles.inputError]}
              />
              {errors.companyName && <Text style={styles.errorText}>{errors.companyName}</Text>}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Address</Text>
              <TextInput
                placeholder="Enter company address"
                placeholderTextColor={theme.textMuted}
                value={address}
                onChangeText={setAddress}
                style={[styles.input, errors.address && styles.inputError]}
              />
              {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Telephone</Text>
              <TextInput
                placeholder="Enter telephone number"
                placeholderTextColor={theme.textMuted}
                value={telephone}
                onChangeText={setTelephone}
                keyboardType="phone-pad"
                style={[styles.input, errors.telephone && styles.inputError]}
              />
              {errors.telephone && <Text style={styles.errorText}>{errors.telephone}</Text>}
            </View>

            {/* Document Upload Section */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Company Registration No.</Text>
              <TextInput
                placeholder="Enter registration number"
                placeholderTextColor={theme.textMuted}
                value={companyRegNo}
                onChangeText={setCompanyRegNo}
                style={[styles.input, errors.companyRegNo && styles.inputError]}
              />
              {errors.companyRegNo && <Text style={styles.errorText}>{errors.companyRegNo}</Text>}
              <View style={styles.documentSection}>
                <TouchableOpacity 
                  onPress={() => pickDocument(setDoc1)}
                  style={[styles.uploadButton, errors.doc1 && { backgroundColor: '#FF6B6B' }]}
                >
                  <Feather 
                    name={doc1 ? "check-circle" : "upload"} 
                    size={moderateScale(18)} 
                    color={theme.white} 
                    style={styles.uploadIcon}
                  />
                  <Text style={styles.uploadText}>
                    {doc1 ? 'Document uploaded' : 'Upload registration document'}
                  </Text>
                </TouchableOpacity>
                {errors.doc1 && <Text style={styles.errorText}>{errors.doc1}</Text>}
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>KRA PIN</Text>
              <TextInput
                placeholder="Enter KRA PIN"
                placeholderTextColor={theme.textMuted}
                value={kraPin}
                onChangeText={setKraPin}
                style={[styles.input, errors.kraPin && styles.inputError]}
              />
              {errors.kraPin && <Text style={styles.errorText}>{errors.kraPin}</Text>}
              <View style={styles.documentSection}>
                <TouchableOpacity 
                  onPress={() => pickDocument(setDoc2)}
                  style={[styles.uploadButton, errors.doc2 && { backgroundColor: '#FF6B6B' }]}
                >
                  <Feather 
                    name={doc2 ? "check-circle" : "upload"} 
                    size={moderateScale(18)} 
                    color={theme.white} 
                    style={styles.uploadIcon}
                  />
                  <Text style={styles.uploadText}>
                    {doc2 ? 'Document uploaded' : 'Upload KRA PIN document'}
                  </Text>
                </TouchableOpacity>
                {errors.doc2 && <Text style={styles.errorText}>{errors.doc2}</Text>}
              </View>
            </View>

            {/* Submit Section */}
            <View style={styles.submitSection}>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={theme.white} />
                    <Text style={styles.loadingText}>Submitting...</Text>
                  </View>
                ) : (
                  <Text style={styles.submitText}>Submit Registration</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default PublisherCompanyForm