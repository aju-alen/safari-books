import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { onboardingPublisherData } from '@/utils/onboardingData'
import OnboardingPublisherItem from '@/components/OnboardingPublisherItem'
import { horizontalScale, moderateScale, verticalScale } from '@/utils/responsiveSize'
import Pageinator from '@/components/Pageinator'
import { router } from 'expo-router'
import { COLORS } from '@/constants/tokens'

const publisheronboarding = () => {
  return (
    <View style ={styles.container}>
        <FlatList data={onboardingPublisherData} 
        renderItem={({item}) => <OnboardingPublisherItem item={item } />}
        horizontal
        showsHorizontalScrollIndicator
        pagingEnabled
        bounces={false}


        />
        <Pageinator data={onboardingPublisherData} />
        <TouchableOpacity style={styles.buttonContainer} onPress={()=>router.push(`/(publisher)/publisherhome`)}>
            <Text>Skip Onboarding</Text>
        </TouchableOpacity>
    </View>
  )
}

export default publisheronboarding

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