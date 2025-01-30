import { StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { defaultStyles } from '@/styles'
import { horizontalScale, verticalScale, moderateScale } from '@/utils/responsiveSize'
import { COLORS, FONT } from '@/constants/tokens'
import { ipURL } from '@/utils/backendURL'
import * as DocumentPicker from 'expo-document-picker'
import Button from '@/components/Button'
import { createId } from '@paralleldrive/cuid2'
import { router, useLocalSearchParams } from 'expo-router'
import axios from 'axios'

const id = createId()

const PublisherCompanyForm = () => {
  const { publishercompanyForm } = useLocalSearchParams()
  
  const [companyName, setCompanyName] = useState('')
  const [address, setAddress] = useState('')
  const [telephone, setTelephone] = useState('')
  const [companyRegNo, setCompanyRegNo] = useState('')
  const [kraPin, setKraPin] = useState('')
  const [doc1, setDoc1] = useState(null)
  const [doc2, setDoc2] = useState(null)

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

    if (doc1) formData.append('document1', { uri: doc1.uri, name: doc1.name, type: doc1.type })
    if (doc2) formData.append('document2', { uri: doc2.uri, name: doc2.name, type: doc2.type })

    formData.append('id', id)
    formData.append('userId', publishercompanyForm)

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
    } catch (error) {
      console.log(error, 'error')
    }
  }

  return (
    <SafeAreaView style={[defaultStyles.container, styles.container]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>Publisher Registration</Text>
          
          <View style={styles.form}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Company Name</Text>
              <TextInput
                placeholder="Enter company name"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                value={companyName}
                onChangeText={setCompanyName}
                style={styles.input}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Address</Text>
              <TextInput
                placeholder="Enter company address"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                value={address}
                onChangeText={setAddress}
                style={styles.input}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Telephone</Text>
              <TextInput
                placeholder="Enter telephone number"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
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
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
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
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
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

            <Button
              title="Complete Registration"
              filled
              color="#6366F1"
              style={styles.submitButton}
              onPress={handleSubmit}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    padding: moderateScale(24),
  },
  title: {
    fontSize: moderateScale(28),
    fontWeight: '600',
    color: '#fff',
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
    color: '#fff',
    marginBottom: verticalScale(8),
    fontFamily: FONT.RobotoLight,
  },
  input: {
    width: '100%',
    height: verticalScale(48),
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: moderateScale(8),
    paddingHorizontal: horizontalScale(16),
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  uploadButton: {
    marginTop: verticalScale(8),
    padding: moderateScale(12),
    borderRadius: moderateScale(8),
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    alignItems: 'center',
  },
  uploadText: {
    color: '#fff',
    fontSize: moderateScale(14),
  },
  submitButton: {
    marginTop: verticalScale(32),
    height: verticalScale(50),
    backgroundColor: '#6366F1',
  },
})

export default PublisherCompanyForm