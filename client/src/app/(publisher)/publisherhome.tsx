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
      {text: 'I am an author', onPress: () => router.push('/(publisher)/publisheauthorForm'),}
    ]);

  useEffect(() => {
    const getAsyncData = async () => {
      const tokenStore = await SecureStore.getItemAsync('userDetails');
      setToken(JSON.parse(tokenStore).userId);
      

    }
    getAsyncData();
  }, [])


  
  
  return (
    <SafeAreaView style={defaultStyles.container}>
    <View>
      <Text style={defaultStyles.mainText}>Welcome Publisher</Text>
      <TouchableOpacity onPress={createCheckbox}>
        <Text style={defaultStyles.mainText}>Publish</Text>
      </TouchableOpacity>

      
    </View>
    </SafeAreaView>
  )
}

export default publisherhome

const styles = StyleSheet.create({})