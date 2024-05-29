import { StyleSheet, Text, Touchable, TouchableOpacity, View } from 'react-native'
import React,{useEffect, useState} from 'react'
import { defaultStyles } from '@/styles'
import { SafeAreaView } from 'react-native-safe-area-context'
import { moderateScale, verticalScale } from '@/utils/responsiveSize'
import { EvilIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/tokens'
import { router } from 'expo-router'
import FlatlistDynamic from '@/components/FlatlistDynamic'
import {eBookData} from '@/utils/flatlistData'
import LatestRelease from '@/components/LatestRelease'

const HomePage = () => {
  const [bookData, setBookData] = useState([]);
  useEffect(() => {
    setBookData(eBookData)
  }, [])
  return (
    <SafeAreaView style={defaultStyles.container}>
      <View style={styles.homeBar}>
        <Text style={[defaultStyles.text,styles.homeBarLogo]}>LOGO</Text>
        <TouchableOpacity style={styles.homebarSearch} onPress={()=>router.push(`(tabs)/search`)} >
        <EvilIcons name="search" size={24} color={COLORS.primary} /> 
        </TouchableOpacity>
      </View>
        <Text style={[defaultStyles.mainText,styles.mainHeading]}>Latest Release</Text>
        <View>
          <LatestRelease bookData={bookData} />
        </View>
    </SafeAreaView>
  )
}

export default HomePage

const styles = StyleSheet.create({
  homeBar: {
    height: verticalScale(60),
    backgroundColor: COLORS.tabs,
    borderEndEndRadius: moderateScale(10),
    borderBottomLeftRadius: moderateScale(10),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  homebarSearch: {
    padding: moderateScale(10),
    margin: moderateScale(10),
  },
  homeBarLogo: {
    fontSize: moderateScale(20),
    color: COLORS.primary,
    fontWeight: 'bold',
    margin: moderateScale(10),
  },
  mainHeading: {
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    margin: moderateScale(10),
  }
})