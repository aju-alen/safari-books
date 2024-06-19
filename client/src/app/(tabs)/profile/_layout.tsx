import { View, Text } from 'react-native'
import React from 'react'
import { Stack, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons';


const ProfileLayout = () => {
  return (
    <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
    </Stack>
  )
}

export default ProfileLayout