import React from 'react'
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import {  Stack } from 'expo-router'
import { AudioProvider } from '@/store/AudioContext';


SplashScreen.preventAutoHideAsync();
const MainLayout = () => {
  const [loaded] = useFonts({
  
          NotoSemiBold: require('../../assets/fonts/NotoSans/NotoSans-SemiBold.ttf'),
          NotoRegular: require('../../assets/fonts/NotoSans/NotoSans-Regular.ttf'),
          NotoMedium: require('../../assets/fonts/NotoSans/NotoSans-Medium.ttf'),
          NotoBold: require('../../assets/fonts/NotoSans/NotoSans-Bold.ttf'),
          NotoThinItalic: require('../../assets/fonts/NotoSans/NotoSans-ThinItalic.ttf'),
          NotoThin: require('../../assets/fonts/NotoSans/NotoSans-Thin.ttf'),
          RobotoBold: require('../../assets/fonts/Roboto/Roboto-Bold.ttf'),
          RobotoBoldItalic: require('../../assets/fonts/Roboto/Roboto-BoldItalic.ttf'),
          RobotoItalic: require('../../assets/fonts/Roboto/Roboto-Italic.ttf'),
          RobotoLight: require('../../assets/fonts/Roboto/Roboto-Light.ttf'),
          RobotoLightItalic: require('../../assets/fonts/Roboto/Roboto-LightItalic.ttf'),
          RobotoMedium: require('../../assets/fonts/Roboto/Roboto-Medium.ttf'),
          RobotoMediumItalic: require('../../assets/fonts/Roboto/Roboto-MediumItalic.ttf'),
          RobotoRegular: require('../../assets/fonts/Roboto/Roboto-Regular.ttf'),
          RobotoThin: require('../../assets/fonts/Roboto/Roboto-Thin.ttf'),
          RobotoThinItalic: require('../../assets/fonts/Roboto/Roboto-ThinItalic.ttf'),
          "ClashGroteskBold": require('../../assets/fonts/Clash_Grotesk/ClashGrotesk-Bold.ttf'),
          ClashGroteskRegular: require('../../assets/fonts/Clash_Grotesk/ClashGrotesk-Regular.ttf'),
          ClashGroteskMedium: require('../../assets/fonts/Clash_Grotesk/ClashGrotesk-Medium.ttf'),
          ClashGroteskSemiBold: require('../../assets/fonts/Clash_Grotesk/ClashGrotesk-Semibold.ttf'),
          ClashGroteskExtraLight: require('../../assets/fonts/Clash_Grotesk/ClashGrotesk-Extralight.ttf'),
          "ClashGroteskLight": require('../../assets/fonts/Clash_Grotesk/ClashGrotesk-Light.ttf'),
      });
      useEffect(() => {
        if (loaded) {
          SplashScreen.hideAsync();
        }
      }, [loaded]);
    
      if (!loaded) {
        return null;
      }
  return (
    <AudioProvider>
    <Stack>
    <Stack.Screen name='index' options={{ headerShown: false }} />
    <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
    <Stack.Screen name='(authenticate)' options={{ headerShown: false }} />
    <Stack.Screen name='(publisher)' options={{ headerShown: false }} />
    <Stack.Screen name='(onboarding)' options={{
       headerShown: false }} />
  </Stack>
  </AudioProvider>
  )
}

export default MainLayout