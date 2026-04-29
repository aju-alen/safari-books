import { View, Text } from 'react-native'
import React from 'react'
import { Stack, router } from 'expo-router'
import { useTheme } from '@/providers/ThemeProvider'

const HomeLayout = () => {
  const {theme} = useTheme()
  return (
    
    <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="[singleBook]" options={{ headerShown: true, headerStyle: { backgroundColor: theme.background },
         headerTintColor: theme.text, headerTitleStyle: { fontWeight: 'bold', fontSize: 26 }, headerBackTitle: 'Back', title: 'Book Details' }} />

        <Stack.Screen name="play/[bookId]" options={{ headerShown: false }} />

        <Stack.Screen name="allAudioBooks" options={{ headerShown: false }} />
        <Stack.Screen name="search" options={{ headerShown: false }} />
       
        
    </Stack>
  )
}

export default HomeLayout