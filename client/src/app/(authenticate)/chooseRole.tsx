import { defaultStyles } from '@/styles';
import { horizontalScale, verticalScale } from '@/utils/responsiveSize';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Dimensions, SafeAreaView } from 'react-native';
import {FONT} from '@/constants/tokens';
import { router } from 'expo-router';


const options = [
  { id: '1', title: 'I am here to listen to some books',role:'LISTENER' },
  { id: '2', title: 'I am here to publish my book',role:'AUTHOR' },
  { id: '3', title: 'I am here to narrate books', role:'NARRATOR' },
  { id: '4', title: 'I am here to publish book rights', role:'PUBLISHER'},
];

const App = () => {
  const [selectedId, setSelectedId] = useState(null);

  const handlePress = (role) => {
    setSelectedId(role);

  };

  const renderItem = ({ item }) => {
    const backgroundColor = item.role === selectedId ? '#fff' : '#000';
    const textColor = item.role === selectedId ? 'black' : 'white';
    const borderColor = item.role === selectedId ? '#000' : '#fff';
    return (
      <TouchableOpacity
        onPress={() => handlePress(item.role)}
        style={[styles.card, { backgroundColor, borderColor,borderWidth:1, shadowColor: "#000", shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5}]}
      >
        <Text style={[styles.text, { color: textColor }]}>{item.title}</Text>
      </TouchableOpacity>
    );
  };
  console.log(selectedId,'selectedId');
  

  return (
    <SafeAreaView style={[defaultStyles.container,styles.container]}>
      <View>
    <Text style={styles.mainHeading}>You are here to </Text>
      <FlatList
        style={{marginTop:20}}
        data={options}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        extraData={selectedId}
        contentContainerStyle={styles.list}
        
      />
      <TouchableOpacity onPress={()=> router.push(`/(authenticate)/${selectedId}`)}>
      <Text style={{color:'#fff',fontSize:20,marginTop:10,fontFamily:FONT.notoBold, textAlign:'right'}}>Continue</Text>
    </TouchableOpacity>
    </View>
    
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  list: {
    alignItems: 'center',
  },
  card: {
    width: horizontalScale(350),
    height: verticalScale(150),
    padding: 20,
    marginVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 18,
  },
  mainHeading:{
    fontFamily: FONT.notoBold,
    color: '#fff',
    fontSize: 28,
    textShadowColor: 'rgba(0, 0, 0, 0)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 20,
    letterSpacing: 1,
    marginTop:verticalScale(20),
  }
});

export default App;
