import { StyleSheet, Text, View, TouchableOpacity,Image} from 'react-native'
import React from 'react'
import { horizontalScale, moderateScale, verticalScale } from '@/utils/responsiveSize'
import { FONT } from '@/constants/tokens'
import { defaultStyles } from '@/styles'
import FlatlistDynamic from './FlatlistDynamic'
import { router } from 'expo-router'

const TrendingRelease = ({bookData}) => {

    const renderItem=({ item }) => (
        
        <View style={[styles.flatlistItemContainer]}>
          <TouchableOpacity onPress={()=>router.push(`/(tabs)/home/${item.id}`)} >

            <Image source={{ uri: item.coverImage }} style={styles.coverImageContainer} />
            <View style={styles.coverTextContainer}>
            <Text style={[defaultStyles.text, styles.bookTitle]}>{item.title}</Text>
            <Text style={[defaultStyles.text, styles.bookAuthor]}>{item.authorName}</Text>
            <View style={{flexDirection:'row'}}>
              <Text style={[defaultStyles.text,styles.bookRatings]}> ☆ ☆ ☆ </Text>
              <Text style={[defaultStyles.text,styles.bookRatings]}>{item.rating} rating</Text>
            </View>
            </View>

          </TouchableOpacity>
        </View>
      )
  return (
    <FlatlistDynamic renderItem={renderItem} bookData={bookData} />
    
  )
}

export default TrendingRelease

const styles = StyleSheet.create({
    flatlistItemContainer: {
      margin: moderateScale(10),
      alignItems: 'center',
      justifyContent: 'center',
      
    },
    coverImageContainer: {
      width: horizontalScale(170),
      height: verticalScale(200),
      borderRadius: moderateScale(10),
     
      
    },
    coverTextContainer: {
      width: horizontalScale(170),
      borderRadius: moderateScale(10),
      
      
    },
    bookTitle: {
      fontSize: moderateScale(14),
      fontFamily: FONT.notoBold,
      marginTop: moderateScale(5)
    },
    bookAuthor: {
      fontSize: moderateScale(13),
      fontFamily: FONT.notoMedium,
      marginTop: moderateScale(5)
    },
    bookRatings:{
      fontSize:moderateScale(13)
    }
  })