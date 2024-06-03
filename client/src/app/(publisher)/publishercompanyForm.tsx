import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { defaultStyles } from '@/styles'

const publishercompanyForm = () => {
  return (
    <SafeAreaView style={defaultStyles.container}>
    <View>
      <Text style={defaultStyles.mainText}>publishercompanyForm</Text>
    </View>
    </SafeAreaView>
  )
}

export default publishercompanyForm

const styles = StyleSheet.create({})