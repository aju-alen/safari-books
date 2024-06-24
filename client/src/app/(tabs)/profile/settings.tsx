import {  StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React from 'react'
import { defaultStyles } from '@/styles'
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';


const settings = () => {

  const handleLogout = async() => {
    await SecureStore.deleteItemAsync('userDetails');
    await SecureStore.deleteItemAsync('authToken');
    router.push('/(authenticate)/login');

  }

  return (
    <SafeAreaView style={defaultStyles.container}>
    <View>
      <Text style={defaultStyles.mainText}>Settings</Text>
      <View style={styles.buttonplacement}>
        

        <TouchableOpacity onPress={handleLogout}>
        <Text style={[defaultStyles.text,styles.textContainer]}>Logout</Text>
        </TouchableOpacity>
        </View>


      
    </View>
    </SafeAreaView>
  )
}

export default settings

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
    flexDirection: 'column',
    marginTop: 200
  },
  textContainer:{
    borderBottomWidth: 0.5,
    borderColor: 'gray',
    width:"100%",
    paddingVertical: 40 ,
    paddingHorizontal: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#000',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
})