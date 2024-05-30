import { View, Text } from 'react-native'
import React from 'react'
import { Stack, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons';


const DiscoverLayout = () => {
  return (
    <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
       
        
    </Stack>
  )
}

export default DiscoverLayout