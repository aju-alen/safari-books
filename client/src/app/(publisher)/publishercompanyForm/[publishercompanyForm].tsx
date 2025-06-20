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
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '@/providers/ThemeProvider'

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

  const handleSubmit = async () => {
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
      router.push(`/(publisher)/${id}`)
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
      padding: moderateScale(24),
    },
    title: {
      fontSize: moderateScale(28),
      fontWeight: '600',
      color: theme.text,
      marginBottom: verticalScale(32),
      textAlign: 'center',
    },
    form: {
      gap: verticalScale(24),
    },
    fieldGroup: {
      marginBottom: verticalScale(8),
    },
    label: {
      fontSize: moderateScale(14),
      color: theme.text,
      marginBottom: verticalScale(8),
      fontFamily: FONT.RobotoLight,
    },
    input: {
      width: '100%',
      height: verticalScale(48),
      backgroundColor: theme.white,
      borderRadius: moderateScale(8),
      paddingHorizontal: horizontalScale(16),
      color: theme.text,
      borderWidth: 1,
      borderColor: theme.gray2,
      fontSize: moderateScale(16),
    },
    uploadButton: {
      marginTop: verticalScale(8),
      padding: moderateScale(12),
      borderRadius: moderateScale(8),
      backgroundColor: theme.primary,
      alignItems: 'center',
      shadowColor: theme.text,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.15,
      shadowRadius: 3.84,
      elevation: 5,
    },
    uploadText: {
      color: theme.white,
      fontSize: moderateScale(14),
      fontWeight: '500',
    },
    submitButton: {
      marginTop: verticalScale(32),
      height: verticalScale(50),
      backgroundColor: theme.primary,
      borderRadius: moderateScale(8),
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: theme.text,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
  })

  return (
    <SafeAreaView style={[defaultStyles.container, styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* <Text style={styles.title}>Publisher Registration</Text> */}
          
          <View style={styles.form}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Company Name</Text>
              <TextInput
                placeholder="Enter company name"
                placeholderTextColor={theme.textMuted}
                value={companyName}
                onChangeText={setCompanyName}
                style={styles.input}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Address</Text>
              <TextInput
                placeholder="Enter company address"
                placeholderTextColor={theme.textMuted}
                value={address}
                onChangeText={setAddress}
                style={styles.input}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Telephone</Text>
              <TextInput
                placeholder="Enter telephone number"
                placeholderTextColor={theme.textMuted}
                value={telephone}
                onChangeText={setTelephone}
                keyboardType="phone-pad"
                style={styles.input}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Company Registration No.</Text>
              <TextInput
                placeholder="Enter registration number"
                placeholderTextColor={theme.textMuted}
                value={companyRegNo}
                onChangeText={setCompanyRegNo}
                style={styles.input}
              />
              <TouchableOpacity 
                onPress={() => pickDocument(setDoc1)}
                style={styles.uploadButton}
              >
                <Text style={styles.uploadText}>
                  {doc1 ? '✓ Document uploaded' : 'Upload registration document'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>KRA PIN</Text>
              <TextInput
                placeholder="Enter KRA PIN"
                placeholderTextColor={theme.textMuted}
                value={kraPin}
                onChangeText={setKraPin}
                style={styles.input}
              />
              <TouchableOpacity 
                onPress={() => pickDocument(setDoc2)}
                style={styles.uploadButton}
              >
                <Text style={styles.uploadText}>
                  {doc2 ? '✓ Document uploaded' : 'Upload KRA PIN document'}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
             style={styles.submitButton}
             onPress={handleSubmit}
            >
              <Text
              style={{
                color: theme.white,
                fontSize: moderateScale(18),
                textAlign: 'center',
                fontFamily: FONT.RobotoMedium,
              }}
              >

                {loading ? <ActivityIndicator size="small" color={theme.white} style={{
                  display: loading ? 'flex' : 'none',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: verticalScale(50),  

                }} /> : "Submit"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default PublisherCompanyForm