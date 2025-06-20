import { StyleSheet, Text, View, Image, useWindowDimensions} from 'react-native'
import React from 'react'
import { useTheme } from '@/providers/ThemeProvider'
import { moderateScale, verticalScale } from '@/utils/responsiveSize'

const OnboardingPublisherItem = ({item}) => {
  const {width} = useWindowDimensions()
  const {theme} = useTheme()
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: moderateScale(20),
      paddingTop: verticalScale(40)
    },
    image:{
      flex: 0.7,
      justifyContent: 'center',
      marginBottom: verticalScale(20)
    },
    contentContainer: {
      flex: 0.3,
      alignItems: 'center',
      paddingHorizontal: moderateScale(20)
    },
    title:{
      fontWeight: '800',
      fontSize: moderateScale(28),
      marginBottom: verticalScale(16),
      color: theme.primary,
      textAlign: 'center',
      lineHeight: moderateScale(34)
    },
    description:{
      fontWeight: '400',
      fontSize: moderateScale(16),
      color: theme.textMuted,
      textAlign: 'center',
      paddingHorizontal: moderateScale(32),
      lineHeight: moderateScale(24)
    }
  })

  return (
    <View style={[styles.container,{width}]}>
      <Image source={item.image} style={[styles.image,{width: width * 0.8, resizeMode:'contain'}]} />

      <View style={styles.contentContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  )
}

export default OnboardingPublisherItem