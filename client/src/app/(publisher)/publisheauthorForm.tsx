import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { defaultStyles } from '@/styles'

const publisheauthorForm = () => {
  return (
    <SafeAreaView style={defaultStyles.container}>
    <View>
      <Text style={defaultStyles.mainText}>publisheauthorForm</Text>
    </View>
    </SafeAreaView>
  )
}

export default publisheauthorForm

const styles = StyleSheet.create({})