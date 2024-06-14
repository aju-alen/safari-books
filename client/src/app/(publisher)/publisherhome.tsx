import { StyleSheet, Text, TouchableOpacity, View,Alert } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as SecureStore from 'expo-secure-store';
import { defaultStyles } from '@/styles';
import { router } from 'expo-router';


const publisherhome = () => {
  const [token, setToken] = useState(null);
  const createCheckbox = () =>
    Alert.alert('Who are you?', 'Are you a company or an author?', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel'),
      },
      {
        text: 'I am a company',
        onPress: () => router.push(`/(publisher)/publishercompanyForm/${token}`),
      },
      {text: 'I am an author', onPress: () => router.push(`/(publisher)/publisherauthorForm/${token}`),}
    ]);

  useEffect(() => {
    const getAsyncData = async () => {
      const tokenStore = await SecureStore.getItemAsync('userDetails');
      setToken(JSON.parse(tokenStore).userId);
      

    }
    getAsyncData();
  }, [])

console.log(token,'token');

  
  
  return (
    <SafeAreaView style={defaultStyles.container}>
    <View>
      <Text style={defaultStyles.mainText}>Welcome Publisher</Text>
      <View style={styles.buttonplacement}>
      <TouchableOpacity onPress={createCheckbox} style={styles.buttonContainer}>
        <Text style={defaultStyles.mainText}>Publish</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={()=>router.push(`/(publisher)/publisherDetails/${token}`)} style={styles.buttonContainer}>
        <Text style={defaultStyles.mainText}>View Details</Text>
      </TouchableOpacity>
      </View>

      
    </View>
    </SafeAreaView>
  )
}

export default publisherhome

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    marginBottom: 60,
    width: 200,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'red',
    borderRadius: 25
  },
  buttonplacement:{
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 200
  }
})