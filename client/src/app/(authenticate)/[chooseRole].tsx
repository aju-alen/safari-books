import { defaultStyles } from '@/styles';
import { horizontalScale, verticalScale } from '@/utils/responsiveSize';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Dimensions, SafeAreaView } from 'react-native';
import {FONT} from '@/constants/tokens';


const options = [
  { id: '1', title: 'I am here to listen to some books' },
  { id: '2', title: 'I am here to publish my book' },
  { id: '3', title: 'I am here to narrate books' },
  { id: '4', title: 'I am here to publish book rights' },
];

const App = () => {
  const [selectedId, setSelectedId] = useState(null);

  const handlePress = (id) => {
    setSelectedId(id);
  };

  const renderItem = ({ item }) => {
    const backgroundColor = item.id === selectedId ? '#fff' : '#000';
    const textColor = item.id === selectedId ? 'black' : 'white';
    const borderColor = item.id === selectedId ? '#000' : '#fff';
    return (
      <TouchableOpacity
        onPress={() => handlePress(item.id)}
        style={[styles.card, { backgroundColor, borderColor,borderWidth:1, shadowColor: "#000", shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5}]}
      >
        <Text style={[styles.text, { color: textColor }]}>{item.title}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[defaultStyles.container,styles.container]}>
    <Text style={styles.mainHeading}>What are you looking for </Text>
      <FlatList
        data={options}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        extraData={selectedId}
        contentContainerStyle={styles.list}
      />
    
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
    fontFamily:FONT.notoBold,
    color:'#fff',
    fontSize:28,
  }
});

export default App;
