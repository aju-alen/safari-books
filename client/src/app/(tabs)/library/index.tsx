import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { defaultStyles } from '@/styles'
import { SafeAreaView } from 'react-native-safe-area-context'

const LibraryPage = () => {
  const data = ["All", "Audiobooks","Podcast"];
  const subData = ["All Titles ", "Not Started", "In Progress", "Downloaded","Finished"];

  const [selectedItem, setSelectedItem] = useState("All");
  const [selectedSubItem, setSelectedSubItem] = useState("One");

  const renderItem = ({ item }) => {
    const isSelected = selectedItem === item;
    return (
     
      <TouchableOpacity
        style={[styles.item, isSelected && styles.selectedItem]}
        onPress={() => setSelectedItem(item)}
      >
        <Text style={[styles.itemText, isSelected && styles.selectedItemText]}>{item}</Text>
      </TouchableOpacity>
    
    );
  };

  const renderSubItem = ({ item }) => {
    const isSelected = selectedSubItem === item;
    return (
      <TouchableOpacity
        style={[styles.subitem, isSelected && styles.selectedItem]}
        onPress={() => setSelectedSubItem(item)}
      >
        <Text style={[styles.itemText, isSelected && styles.selectedSubItemText]}>{item}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={defaultStyles.container}>
    <View style={styles.container}>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item}
        horizontal
        showsHorizontalScrollIndicator={false}
      />
      <FlatList
        data={subData}
        renderItem={renderSubItem}
        keyExtractor={(item) => item}
        horizontal
        showsHorizontalScrollIndicator={false}
      />
    </View>
    <View>
      <Text style={[defaultStyles.mainText,{textAlign:'center', marginVertical:40}]}>No Purchases Made. Please make a purchase.</Text>
    </View>
    </SafeAreaView>
  );
};

export default LibraryPage

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  item: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 20,
  },
  subitem: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'gray',
  },
  selectedItem: {
    fontSize: 28,
  },
  itemText: {
    fontSize: 16,
    color: 'white',
  },
  selectedItemText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  selectedSubItemText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});