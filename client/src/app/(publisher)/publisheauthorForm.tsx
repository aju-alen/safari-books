import { StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { defaultStyles } from '@/styles'
import { horizontalScale, verticalScale,moderateScale } from '@/utils/responsiveSize'
import { COLORS, FONT, welcomeCOLOR } from '@/constants/tokens'
import Button from '@/components/Button'
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';
import { ipURL } from '@/utils/backendURL'

const publisheauthorForm = () => {
  const [fullname, setFullname] = React.useState('')
  const [address, setAddress] = React.useState('')
  const [telephone, setTelephone] = React.useState('')
  const [idppNo, setIdppNo] = React.useState('')

  const [ doc, setDoc ] = useState();
  const pickDocument = async () => {
      let result = await DocumentPicker.getDocumentAsync({ type: "*/*", copyToCacheDirectory: true })
        console.log(result);
        let { name, size, uri } = result["assets"][0];
      // console.log(result);
      let nameParts = name.split('.');
      let fileType = nameParts[nameParts.length - 1];
      var fileToUpload = {
        name: name,
        size: size,
        uri: uri,
        type: "application/" + fileType
      }
      console.log(fileToUpload, '...............file')
      setDoc(fileToUpload);
  }

  const postDocument = () => {
    const url = `${ipURL}/api/s3/upload-to-aws`;
    const fileUri = doc.uri;
    const formData = new FormData();
    formData.append('document', doc);
    const options = {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
        },
    };
    console.log(formData);

    fetch(url, options).catch((error) => console.log(error));
}
 

  

  const handleAuthorForm = () => {
    console.log('handleAuthorForm in logs');
    
  }
  console.log(doc, 'doc');
  
  return (

    <SafeAreaView style={defaultStyles.container }>

<View>
            <Button title="Select Document" onPress={pickDocument} />
            <Button title="Upload" onPress={postDocument} />
        </View>
          
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
                    fontFamily:FONT.RobotoLight
                    
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
                    fontFamily:FONT.RobotoLight
                    
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
                    fontFamily:FONT.RobotoLight
                    
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
                    fontFamily:FONT.RobotoLight
                    
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
            onPress={handleAuthorForm}
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