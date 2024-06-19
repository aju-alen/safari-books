import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { defaultStyles } from '@/styles'
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { AntDesign } from '@expo/vector-icons'; 

const ProfilePage = () => {

  const handleLogout = async() => {
    await SecureStore.deleteItemAsync('userDetails');
    await SecureStore.deleteItemAsync('authToken');
    router.push('/(authenticate)/login');

  }
  return (
    <SafeAreaView style={defaultStyles.container}>
    <View>
      <View style={styles.header}>
      <Text style={defaultStyles.mainText}>Profile</Text>
      <TouchableOpacity onPress={() => router.push('/(tabs)/profile/settings')}>
      <AntDesign name="setting" size={24} color="white" />
      </TouchableOpacity>
      </View>
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