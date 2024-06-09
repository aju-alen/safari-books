import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const Pageinator = ({data}) => {
  return (
    <View style={{flexDirection:'row',height:64}}>

        {data.map((_,index) => {
            return (
                <View style={[styles.dot,{width:10}]} key={index.toString()} />
            )
        }
        )}
      
    </View>
  )
}

export default Pageinator

const styles = StyleSheet.create({
    dot:{
        height:10,
        width:10,
        borderRadius:5,
        backgroundColor:'white',
        marginHorizontal:8
    }
})