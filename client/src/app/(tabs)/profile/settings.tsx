import {  StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React from 'react'
import { defaultStyles } from '@/styles'

const settings = () => {
  return (
    <SafeAreaView style={defaultStyles.container}>
    <View>
      <Text style={defaultStyles.mainText}>Settings</Text>
      <View style={styles.buttonplacement}>
        <TouchableOpacity >
        <Text style={[defaultStyles.text,styles.textContainer]}>Personal Information</Text>
        </TouchableOpacity>

        <TouchableOpacity>
        <Text style={[defaultStyles.text,styles.textContainer]}>Preferences</Text>
        </TouchableOpacity>

        <TouchableOpacity>
        <Text style={[defaultStyles.text,styles.textContainer]}>Analytics</Text>
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