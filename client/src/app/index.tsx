import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Redirect } from "expo-router";
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useState } from "react";
import { View, Text } from "react-native";
import * as SecureStore from 'expo-secure-store';
import { FONT } from '../constants/tokens';

// SplashScreen.preventAutoHideAsync();

const App = () => {

    const [fontsLoaded] = useFonts({

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


    });

    return (
      <Redirect href='(authenticate)/[chooseRole]' />
    )

}



export default App;