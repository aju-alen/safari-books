import { defaultStyles } from '@/styles';
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { ipURL } from '@/utils/backendURL';


const publisherDetailsData = () => {
  const {publisherDetailsData} = useLocalSearchParams();
  console.log(publisherDetailsData,'publisherDetailsData');

  useEffect(() => {
    const getAllData = async () => {
      try {
        const response = await axios.get(`${ipURL}/api/publisher/get-all-publish-data/${publisherDetailsData}`)
        console.log(response.data,'response');
      } catch (error) {
        console.error(error);
    }
  };
  getAllData();
  

  }, []);
  
  const data = [
    { id: 1, type: 'Type A' },
    { id: 2, type: 'Type B' },
    { id: 3, type: 'Type C' },
  ];
    return (
      <SafeAreaView style={defaultStyles.container}>
        <View >
            <View style={styles.header}>
                <Text style={[styles.headerText, styles.headerId,defaultStyles.mainText]}>Id</Text>
                <Text style={[styles.headerText, styles.headerType,defaultStyles.mainText]}>Type</Text>
                <Text style={[styles.headerText, styles.headerViewDetails,defaultStyles.mainText]}>View Details</Text>
            </View>
            <ScrollView >
                {data.map((item, index) => (
                    <View key={index} style={styles.row}>
                        <Text style={[styles.cell, styles.cellId,defaultStyles.text]}>{item.id}</Text>
                        <Text style={[styles.cell, styles.cellType,defaultStyles.text]}>{item.type}</Text>
                        <TouchableOpacity style={[styles.cell, styles.cellViewDetails]}>
                            <Text style={[styles.viewDetailsText,defaultStyles.text]}>View</Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>
        </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        paddingBottom: 5,
        marginBottom: 5,
    },
    headerText: {
        fontWeight: 'bold',
    },
    headerId: {
        flex: 1,
    },
    headerType: {
        flex: 2,
    },
    headerViewDetails: {
        flex: 2,
        textAlign: 'center',
    },
    body: {
        flex: 1,
    },
    row: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        paddingVertical: 10,
    },
    cell: {
        paddingHorizontal: 5,
    },
    cellId: {
        flex: 1,
    },
    cellType: {
        flex: 2,
    },
    cellViewDetails: {
        flex: 2,
        alignItems: 'center',
    },
    viewDetailsText: {
        color: '#007bff',
    },
});

export default publisherDetailsData;



// import { StyleSheet, Text, View } from 'react-native'
// import React from 'react'

// const publisherDetailsData = () => {
//   return (
//     <View>
//       <Text>publisherDetailsData</Text>
//     </View>
//   )
// }

// export default publisherDetailsData

// const styles = StyleSheet.create({})