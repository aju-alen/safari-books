import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { defaultStyles } from '@/styles'

const SearchPage = () => {
  return (
    <SafeAreaView style={defaultStyles.container}>
    <View>
      <Text style={defaultStyles.text}>SearchPage</Text>
    </View>
    </SafeAreaView>
  )
}

export default SearchPage

const styles = StyleSheet.create({})