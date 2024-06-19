import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context';
import { defaultStyles } from '@/styles';
import { ipURL } from '@/utils/backendURL';
import axios from 'axios';
import { A } from '@expo/html-elements';

const publisherDetailsSingle = () => {

    const { publisherDetailsSingle } = useLocalSearchParams();
    console.log(publisherDetailsSingle,'publisherDetailsData11');
    const [singleData, setSingleData] = useState([]);
    
    
    useEffect(() => {

      const getSingleDataAuthor = async () => {
        try {
          const response = await axios.get(`${ipURL}/api/publisher/get-all-author-data-single/${publisherDetailsSingle}`)
          console.log(response.data['authorData'],'response.data');
          setSingleData(response.data['authorData']);



          if(response.data['authorData']===null){
          const companyDataAPI = await axios.get(`${ipURL}/api/publisher/get-all-company-data-single/${publisherDetailsSingle}`)

          console.log(companyDataAPI.data['companyData'],'companyDataAPI.data');
          setSingleData(companyDataAPI.data['companyData'][0]);
          }
        } catch (error) {
          console.error(error);
        }

      }

      getSingleDataAuthor();
    }, [])
    
    console.log(singleData,'singleData');
    

  return (
    <SafeAreaView style={defaultStyles.container}>
    <View>
      <Text style={defaultStyles.mainText}>Details</Text>
      <Text style={defaultStyles.text}>Title: {singleData?.title}</Text>
      <Text style={defaultStyles.text}>Language: {singleData?.language}</Text>
      <Text style={defaultStyles.text}>Categories: {singleData?.categories}</Text>
      <Text style={defaultStyles.text}>ISBNDOIISRC: {singleData?.ISBNDOIISRC}</Text>
      <Text style={defaultStyles.text}>Synopsis: {singleData?.synopsis}</Text>
      
      <Text style={defaultStyles.text}>Audio Sample URL:<A href={singleData?.audioSampleURL}>Audio Sample</A></Text>
      <Text style={defaultStyles.text}>PDF URL: 
      <A href={singleData?.pdfURL}>Pdf Sample</A>
       </Text>


    </View>
  </SafeAreaView>
  )
}

export default publisherDetailsSingle

const styles = StyleSheet.create({})

// language
// categories
// date
// ISBNDOIISRC
// synopsis
// narrator
// narrationStyleSlow
// narrationStyleFast
// narrationStyleIntimate
// narrationStyleCasual
// narrationStyleStatic
// narrationStyleOratoric
// audioSampleURL
// pdfURL
// rightsHolder