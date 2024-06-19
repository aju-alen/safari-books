import { defaultStyles } from '@/styles';
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { ipURL } from '@/utils/backendURL';


const publisherDetailsData = () => {
    const { publisherDetailsData } = useLocalSearchParams();
    const [authorData, setAuthorData] = useState([]);
    const [companyData, setCompanyData] = useState([]);


    useEffect(() => {
        const getAllData = async () => {
            try {
                const authorresponse = await axios.get(`${ipURL}/api/publisher/get-all-author-data/${publisherDetailsData}`)
                const companyResponse = await axios.get(`${ipURL}/api/publisher/get-all-company-data/${publisherDetailsData}`)
                setCompanyData(companyResponse.data["companyData"]);


                setAuthorData(authorresponse.data["authorData"]);
            } catch (error) {
                console.error(error);
            }
        };
        getAllData();


    }, []);
    console.log(authorData,'authorData');


    return (
        <SafeAreaView style={defaultStyles.container}>
            <View >
                <View style={styles.header}>

                    <Text style={[styles.headerText, styles.headerType, defaultStyles.mainText]}>Book Title</Text>

                    <Text style={[styles.headerText, styles.headerViewDetails, defaultStyles.mainText]}>Status</Text>

                    <Text style={[styles.headerText, styles.headerViewDetails, defaultStyles.mainText]}>View Details</Text>
                </View>
                <ScrollView >
                    {authorData.map((item, index) => (
                        <View key={index} style={styles.row}>

                            <Text style={[styles.cell, styles.cellType, defaultStyles.text]}>{item.title}</Text>

                            <Text style={[styles.cell, styles.cellType, defaultStyles.text]}>Waiting for Approval</Text>

                            <TouchableOpacity onPress={()=>router.push(`/(publisher)/publisherSingleDetail/${item.id}`)}>
                                <Text style={[styles.cell, styles.cellViewDetails, styles.viewDetailsText]}>View Details</Text>
                            </TouchableOpacity>

                        </View>
                    ))}

                    {companyData?.map((item, index) => (
                        <View key={index} style={styles.row}>

                            <Text style={[styles.cell, styles.cellType, defaultStyles.text]}>{item.title}</Text>

                            <Text style={[styles.cell, styles.cellType, defaultStyles.text]}>Waiting for Approval</Text>

                            <TouchableOpacity onPress={()=>router.push(`/(publisher)/publisherSingleDetail/${item.id}`)}>
                                <Text style={[styles.cell, styles.cellViewDetails, styles.viewDetailsText]}>View Details</Text>
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