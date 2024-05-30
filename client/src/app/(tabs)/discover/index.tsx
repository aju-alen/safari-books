import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { defaultStyles } from '@/styles'

const DiscoverPage = () => {
  return (
    <SafeAreaView style={defaultStyles.container}>
    <View>
      <Text style={defaultStyles.text}>DiscoverPage</Text>
    </View>
    </SafeAreaView>
  )
}

export default DiscoverPage

const styles = StyleSheet.create({})