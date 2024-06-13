import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { defaultStyles } from '@/styles'
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

const ProfilePage = () => {

  const handleLogout = async() => {
    await SecureStore.deleteItemAsync('userDetails');
    await SecureStore.deleteItemAsync('authToken');
    router.push('/(authenticate)/login');

  }
  return (
    <SafeAreaView style={defaultStyles.container}>
    <View>
      <Text style={defaultStyles.mainText}>Profile</Text>
      <View style={styles.buttonplacement}>
      <TouchableOpacity onPress={handleLogout}  style={styles.buttonContainer}>
        <Text style={defaultStyles.mainText}>Logout</Text>
      </TouchableOpacity>
      </View>

      
    </View>
    </SafeAreaView>
  )
}

export default ProfilePage

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