import { FlatList, ScrollView, StyleSheet, Text, Touchable, TouchableOpacity, View, Image } from 'react-native'
import React from 'react'
import { defaultStyles } from '@/styles';
import { horizontalScale, moderateScale, verticalScale } from '@/utils/responsiveSize';
import { FONT } from '@/constants/tokens';

const FlatlistDynamic = ({ bookData,renderItem }) => {

  return (

    <View>
      <FlatList
        data={bookData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
      />
    </View>

  )
}

export default FlatlistDynamic

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