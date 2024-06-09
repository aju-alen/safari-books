import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { onboardingListenerData } from '@/utils/onboardingData'
import OnboardingPublisherItem from '@/components/OnboardingPublisherItem'
import { horizontalScale, moderateScale, verticalScale } from '@/utils/responsiveSize'
import Pageinator from '@/components/Pageinator'
import { router } from 'expo-router'

const listeneronboarding = () => {
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
        <TouchableOpacity style={styles.buttonContainer} onPress={()=>router.push(`/(tabs)/home`)}>
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
        backgroundColor: 'red',
        borderRadius: moderateScale(25)
    }
})