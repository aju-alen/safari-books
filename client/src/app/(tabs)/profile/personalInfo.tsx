import {  StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { defaultStyles } from '@/styles'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { ipURL } from '@/utils/backendURL';
import { FONT, FONTSIZE } from '@/constants/tokens';


const personalInfo = () => {
    const [userData,setUserData] = useState({});

    useEffect(() => {
        const getId = async () => {
            const id = JSON.parse(await (SecureStore.getItemAsync('userDetails')));

            const getUserDetails =await axios.get(`${ipURL}/api/auth/get-user/${id['userId']}`);

            console.log(getUserDetails.data, 'getUserDetails');
            setUserData(getUserDetails.data["user"]);
            

        }
        getId();
    }, [])

    console.log(userData, 'id');
    
  return (
    <SafeAreaView style={defaultStyles.container}>
    <View>
      {userData["name"] && <View style={styles.header}>
      <Text style={{fontSize:28,color:'white',fontFamily:FONT.notoBold}}>Personal Information</Text>

      <View>
        <Text style={defaultStyles.mainText}>Name</Text>
        <Text style={defaultStyles.text}>{userData['name']}</Text>

        <Text style={defaultStyles.mainText}>Email</Text>   
        <Text style={defaultStyles.text}>{userData['email']}</Text>
      </View>

        </View>}
        </View>
    </SafeAreaView> 
  )
}

export default personalInfo

const styles = StyleSheet.create({
    header: {
        padding: 20,
        backgroundColor: '#000',
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
      },
})