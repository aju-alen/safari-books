import { StyleSheet, Text, View,Image, TouchableOpacity, ScrollView } from 'react-native'
import React, { useEffect,useState } from 'react'
import { useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { defaultStyles } from '@/styles'
import { eBookData } from '@/utils/flatlistData'
import { horizontalScale, moderateScale, verticalScale } from '@/utils/responsiveSize'
import { LinearGradient } from 'expo-linear-gradient'
import { COLORS } from '@/constants/tokens'

const SingleBookPage = () => {
    const { singleBook } = useLocalSearchParams()
    console.log(singleBook, 'singleBook');
    const [singleBookData, setSingleBookData] = useState([]);
    useEffect(() => {
        const book = eBookData.find((book) => book.id === singleBook)
        setSingleBookData([book])
        
    }, [])
    console.log(singleBookData, 'singleBookData');
    
  return (
        <ScrollView style={defaultStyles.container}>
    <SafeAreaView >
         <LinearGradient
            style={{
                flex: 1
            }}
            colors={[`#${singleBookData[0]?.colorCode}`, COLORS.background]}
            end={{ x: 0.5, y: 0.3 }}
        >
    <View style={styles.imageContainer}>
      <Image source={{uri: singleBookData[0]?.coverImage}} style={{width: 200, height: 200,borderRadius:moderateScale(10)}} />
      <Text style={[defaultStyles.text,{fontSize:moderateScale(20),marginTop:moderateScale(10)}]}>{singleBookData[0]?.title}</Text>
        <Text style={[defaultStyles.text,{fontSize:moderateScale(15),marginTop:moderateScale(10)}]}>{singleBookData[0]?.description}</Text>
        <View style={{flexDirection:'row'}}>
        <Text style={[defaultStyles.text,{fontSize:moderateScale(15),marginTop:moderateScale(10)}]}>Audiobook</Text>
        <Text style={[defaultStyles.text,{fontSize:moderateScale(15),marginTop:moderateScale(10)}]}>.</Text>
        <Text style={[defaultStyles.text,{fontSize:moderateScale(15),marginTop:moderateScale(10)}]}>{singleBookData[0]?.durationInHours}</Text>
        <Text style={[defaultStyles.text,{fontSize:moderateScale(15),marginTop:moderateScale(10)}]}>{singleBookData[0]?.durationInMinutes}</Text>
        </View>
        <View style={{flexDirection:'row'}} >
        <Text style={[defaultStyles.text,{fontSize:moderateScale(15),marginTop:moderateScale(10)}]}>☆ ☆ ☆</Text>
        <Text style={[defaultStyles.text,{fontSize:moderateScale(15),marginTop:moderateScale(10)}]}>{singleBookData[0]?.rating} rating</Text>
        </View>

        <View style={{flexDirection:'row', width:"100%", justifyContent:'space-around',alignItems:"center"}} >
            <View style={{justifyContent:'center', alignItems:'center'}}>
        <Text style={[defaultStyles.text,{fontSize:moderateScale(15),marginTop:moderateScale(10)}]}>BY</Text>
        <Text style={[defaultStyles.text,{fontSize:moderateScale(15),marginTop:moderateScale(10)}]}>{singleBookData[0]?.authorName}</Text>
        </View>

        <View style={{justifyContent:'center', alignItems:'center'}}>
        <Text style={[defaultStyles.text,{fontSize:moderateScale(15),marginTop:moderateScale(10)}]}>BY</Text>
        <Text style={[defaultStyles.text,{fontSize:moderateScale(15),marginTop:moderateScale(10)}]}>{singleBookData[0]?.narratorName}</Text>
        </View>
        
        </View>

        <TouchableOpacity style={{backgroundColor:COLORS.primary, padding:moderateScale(20), borderRadius:moderateScale(30), marginTop:moderateScale(10),width:"90%"}}>
            <Text style={[defaultStyles.text,{fontSize:moderateScale(15), color:'#fff',textAlign:'center'}]}>Sample Now</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity style={{backgroundColor:COLORS.primary, padding:moderateScale(20), borderRadius:moderateScale(30), marginTop:moderateScale(10),width:"90%"}}>
            <Text style={[defaultStyles.text,{fontSize:moderateScale(15), color:'#fff',textAlign:'center'}]}>Add to wishlist</Text>
        </TouchableOpacity> */}

        <Text style={[defaultStyles.mainText]}>Summary</Text>
        <Text style={[defaultStyles.text,{fontSize:moderateScale(15),marginTop:moderateScale(10),marginHorizontal:horizontalScale(10)}]}>{singleBookData[0]?.summary}</Text>

        <Text style={[defaultStyles.mainText]}>Product Details</Text>
        <Text style={[defaultStyles.text,{fontSize:moderateScale(15),marginTop:moderateScale(10)}]}>Release Date: {singleBookData[0]?.releaseDate}</Text>
        <Text style={[defaultStyles.text,{fontSize:moderateScale(15),marginTop:moderateScale(10)}]}>Language: {singleBookData[0]?.language}</Text>
        <Text style={[defaultStyles.text,{fontSize:moderateScale(15),marginTop:moderateScale(10)}]}>Publisher: {singleBookData[0]?.publisher}</Text>

        <Text style={[defaultStyles.mainText]}>You may also enjoy...</Text>
        



    </View>
    </LinearGradient>
    </SafeAreaView>
    </ScrollView>
  )
}

export default SingleBookPage

const styles = StyleSheet.create({
    imageContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: verticalScale(80),
    }
})