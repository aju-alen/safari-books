import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { onboardingListenerData } from '@/utils/onboardingData'
import OnboardingPublisherItem from '@/components/OnboardingPublisherItem'
import { horizontalScale, moderateScale, verticalScale } from '@/utils/responsiveSize'
import * as SecureStore from 'expo-secure-store'
import Pageinator from '@/components/Pageinator'
import { router } from 'expo-router'
import { COLORS } from '@/constants/tokens'

const listeneronboarding = () => {

  const handleSkipOnboarding = async () => {
    await SecureStore.setItemAsync('sb-onboarding', 'false');
    router.push('/(tabs)/home');
  }

  return (
    <View style ={styles.container}>
        <FlatList data={onboardingListenerData} 
        renderItem={({item}) => <OnboardingPublisherItem item={item } />}
        horizontal
        showsHorizontalScrollIndicator
        pagingEnabled
        bounces={false}


        />
        <Pageinator data={onboardingListenerData} />
        <TouchableOpacity style={styles.buttonContainer} onPress={handleSkipOnboarding}>
            <Text>Skip Onboarding</Text>
        </TouchableOpacity>
    </View>
  )
}

export default listeneronboarding

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center'
    },
    buttonContainer: {
        flexDirection: 'row',
        marginBottom: 60,
        width: horizontalScale(200),
        height: verticalScale(50),
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        borderRadius: moderateScale(25)
    }
})