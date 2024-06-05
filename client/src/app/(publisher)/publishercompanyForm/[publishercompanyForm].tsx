import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { defaultStyles } from '@/styles'
import { horizontalScale, verticalScale, moderateScale } from '@/utils/responsiveSize'
import { COLORS, FONT, welcomeCOLOR } from '@/constants/tokens'
import { ipURL } from '@/utils/backendURL'
import * as DocumentPicker from 'expo-document-picker';
import Button from '@/components/Button'
import { createId } from '@paralleldrive/cuid2';
import { router, useLocalSearchParams } from 'expo-router'
import axios from 'axios'

const id = createId();

const publishercompanyForm = () => {
  const {publishercompanyForm} = useLocalSearchParams();
  console.log(publishercompanyForm,'this is userId');
  
  const [companyName, setCompanyName] = React.useState('')
  const [address, setAddress] = React.useState('')
  const [telephone, setTelephone] = React.useState('')
  const [companyRegNo, setCompanyRegNo] = React.useState('')
  const [kraPin, setKraPin] = React.useState('')

  const [doc1, setDoc1] = useState(null);
  const [doc2, setDoc2] = useState(null);

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

    formData.append('id',id,);
    formData.append('userId',publishercompanyForm);
  

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
      return responseData['data'];

    } catch (error) {
      console.error('Error:', error);
      return error;
    }
  };

  const handleSubmit = async () => {
    try{
      const docata = await postDocuments();
      console.log(docata,'document function return ');
      
      const data = {
        id,
        companyName: companyName,
        address: address,
        telephone: telephone,
        companyRegNo: companyRegNo,
        kraPin: kraPin,
        companyRegNoPdfUrl:docata[0],
        kraPinPdfUrl:docata[1],
        userId:publishercompanyForm
  
      }
  
      const response = await axios.post(`${ipURL}/api/publisher/create-company`, data
      );
      console.log(response.data,'after backend data is saved');

      router.push(`/(publisher)/${id}`)
    }
    catch(error){
      console.log(error,'error');
    }
  


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
            Publish as an company
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

            }}>Company Name</Text>

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
                placeholder="Enter Your Company Name"
                placeholderTextColor="gray"
                autoCapitalize="none"
                value={companyName}
                onChangeText={setCompanyName}
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

            }}>Telephone</Text>

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
                placeholder="Enter Your Telephone"
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

            }}>Company Registration No.</Text>

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
                placeholder="Enter Your Company Registration No."
                placeholderTextColor="gray"
                autoCapitalize="none"
                value={companyRegNo}
                onChangeText={setCompanyRegNo}
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

              }}>Upload Company Registration No.</Text>
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

              }}>Upload Company Registration No.</Text>
            </TouchableOpacity>

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
                        onPress={handleSubmit}
                    />
        </View>


      </View>
    </SafeAreaView>
  )
}

export default publishercompanyForm

const styles = StyleSheet.create({})