import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { onboardingListenerData } from '@/utils/onboardingData'
import OnboardingPublisherItem from '@/components/OnboardingPublisherItem'
import { horizontalScale, moderateScale, verticalScale } from '@/utils/responsiveSize'
import * as SecureStore from 'expo-secure-store'
import Pageinator from '@/components/Pageinator'
import { router } from 'expo-router'

import { useTheme } from '@/providers/ThemeProvider'

const listeneronboarding = () => {
    const {theme} = useTheme()
    
    const handleSkipOnboarding = async () => {
        await SecureStore.setItemAsync('sb-onboarding', 'false');
        router.push('/(tabs)/home');
    }

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.background,
            justifyContent: 'center',
            alignItems: 'center',

            paddingTop: verticalScale(40)
        },
        flatListContainer: {
            flex: 1,
            width: '100%'
        },
        buttonContainer: {
            flexDirection: 'row',
            marginBottom: verticalScale(60),
            width: horizontalScale(200),
            height: verticalScale(50),
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.primary,
            borderRadius: moderateScale(25),
            shadowColor: theme.text,
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5
        },
        buttonText: {
            color: theme.white,
            fontSize: moderateScale(16),
            fontWeight: '600',
            textAlign: 'center'
        },
        pageinatorContainer: {
            marginVertical: verticalScale(20)
        }
    })

    return (
        <View style={styles.container}>
            <View style={styles.flatListContainer}>
                <FlatList 
                    data={onboardingListenerData} 
                    renderItem={({item}) => <OnboardingPublisherItem item={item} />}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    pagingEnabled
                    bounces={false}
                    keyExtractor={(item, index) => index.toString()}
                />
            </View>
            <View style={styles.pageinatorContainer}>
                <Pageinator data={onboardingListenerData} />
            </View>
            <TouchableOpacity style={styles.buttonContainer} onPress={handleSkipOnboarding}>
                <Text style={styles.buttonText}>Skip Onboarding</Text>
            </TouchableOpacity>
        </View>
    )
}

export default listeneronboarding