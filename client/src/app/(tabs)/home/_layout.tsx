import { View, Text } from 'react-native'
import React from 'react'
import { Stack, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons';
import { defaultStyles } from '@/styles'

const HomeLayout = () => {
  return (
    
    <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="[singleBook]" options={{ headerShown: false }} />
        <Stack.Screen name="allAudioBooks" options={{ headerShown: false }} />
       
        
    </Stack>
  )
}

export default HomeLayout