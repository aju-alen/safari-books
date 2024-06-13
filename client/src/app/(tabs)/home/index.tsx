import { ScrollView, StyleSheet, Text, TouchableOpacity, View,Button } from 'react-native'
import React,{useEffect, useState} from 'react'
import { defaultStyles } from '@/styles'
import { SafeAreaView } from 'react-native-safe-area-context'
import { moderateScale, verticalScale } from '@/utils/responsiveSize'
import { EvilIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/tokens'
import { router } from 'expo-router'
import {eBookData} from '@/utils/flatlistData'
import TrendingRelease from '@/components/TrendingRelease'
import ImageGrid from '@/components/ImageGrid'
import AudioPlayer from '@/components/AudioPlayer'


const HomePage = () => {
  const [bookData, setBookData] = useState([]);
  const [latestRelease, setLatestRelease] = useState([]);
  useEffect(() => {
    setBookData(eBookData)
    setLatestRelease(eBookData.map((book) => ({coverImage:book.coverImage,id:book.id})).slice(5, 9))
  }, [])
  console.log(latestRelease, 'latestRelease');
  
  return (
    <SafeAreaView style={defaultStyles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.homeBar}>
        <Text style={[defaultStyles.text,styles.homeBarLogo]}>LOGO</Text>
        <TouchableOpacity style={styles.homebarSearch} onPress={()=>router.push(`(tabs)/search`)} >
        <EvilIcons name="search" size={24} color={COLORS.primary} /> 
        </TouchableOpacity>
      </View>
      <AudioPlayer />

        <Text style={[defaultStyles.mainText,styles.mainHeading]}>Trending Release</Text>
        <View>
          <TrendingRelease bookData={bookData} />
        </View>

        <Text style={[defaultStyles.mainText,styles.mainHeading]}>New Release</Text>

        <View style={styles.newReleaseContainer}>
        <ImageGrid images={latestRelease} />
    </View>
    
    </ScrollView>
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
  },
  newReleaseContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
})

// const [bookData, setBookData] = useState([]);
// const [latestRelease, setLatestRelease] = useState([]);
// useEffect(() => {
//   setBookData(eBookData)
//   setLatestRelease(eBookData.map((book) => ({coverImage:book.coverImage,id:book.id})).slice(0, 5))
// }, [])
// console.log(latestRelease, 'latestRelease');

// return (
//   <SafeAreaView style={defaultStyles.container}>
//     <ScrollView showsVerticalScrollIndicator={false}>
//     <View style={styles.homeBar}>
//       <Text style={[defaultStyles.text,styles.homeBarLogo]}>LOGO</Text>
//       <TouchableOpacity style={styles.homebarSearch} onPress={()=>router.push(`(tabs)/search`)} >
//       <EvilIcons name="search" size={24} color={COLORS.primary} /> 
//       </TouchableOpacity>
//     </View>

//       <Text style={[defaultStyles.mainText,styles.mainHeading]}>Trending Release</Text>
//       <View>
//         <TrendingRelease bookData={bookData} />
//       </View>

//       <Text style={[defaultStyles.mainText,styles.mainHeading]}>New Release</Text>

//       <View style={styles.newReleaseContainer}>
//       <ImageGrid images={latestRelease} />
//   </View>
  
//   </ScrollView>
//   </SafeAreaView>