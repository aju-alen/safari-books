import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { defaultStyles } from '@/styles'
import { SafeAreaView } from 'react-native-safe-area-context'

const LibraryPage = () => {
  return (
    <SafeAreaView style={defaultStyles.container}>
    <View >
      <Text style={[defaultStyles.mainText,{color:"red"}]}>No Purchases Made</Text>
    </View>
  </SafeAreaView>
  )
}

export default LibraryPage

const styles = StyleSheet.create({})