import { defaultStyles } from '@/styles';
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { ipURL } from '@/utils/backendURL';
import { MaterialIcons } from '@expo/vector-icons';

const PublisherDetailsData = () => {
    const { publisherDetailsData } = useLocalSearchParams();
    const [authorData, setAuthorData] = useState([]);
    const [companyData, setCompanyData] = useState([]);

    useEffect(() => {
        const getAllData = async () => {
            try {
                const authorResponse = await axios.get(`${ipURL}/api/publisher/get-all-author-data/${publisherDetailsData}`);
                const companyResponse = await axios.get(`${ipURL}/api/publisher/get-all-company-data/${publisherDetailsData}`);
                setCompanyData(companyResponse.data["companyData"]);
                setAuthorData(authorResponse.data["authorData"]);
            } catch (error) {
                console.error(error);
            }
        };
        getAllData();
    }, []);

    const renderBookItem = (item, index, type) => (
        <View key={index} style={styles.bookCard}>
            <View style={styles.bookInfo}>
                <Text style={styles.bookTitle}>{item.title}</Text>
                <View style={styles.detailRow}>
                    <View style={styles.statusContainer}>
                        <MaterialIcons name="pending" size={16} color="#6366F1" />
                        <Text style={styles.statusText}>Pending Approval</Text>
                    </View>
                    {type === 'company' && (
                        <Text style={styles.companyName}>{item.companyName}</Text>
                    )}
                </View>
            </View>
            <TouchableOpacity 
                style={styles.viewDetailsButton}
                onPress={() => router.push(`/(publisher)/publisherSingleDetail/${item.id}`)}
            >
                <MaterialIcons name="arrow-forward" size={24} color="white" />
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={[defaultStyles.container, styles.container]}>
            <View style={styles.header}>
                {/* <Text style={styles.headerTitle}>Your Books</Text> */}
                <Text style={styles.subTitle}>
                    {authorData.length + (companyData?.length || 0)} Total Books
                </Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {authorData.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Author Publications</Text>
                        {authorData.map((item, index) => renderBookItem(item, index, 'author'))}
                    </View>
                )}

                {companyData?.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Company Publications</Text>
                        {companyData.map((item, index) => renderBookItem(item, index, 'company'))}
                    </View>
                )}

                {authorData.length === 0 && (!companyData || companyData.length === 0) && (
                    <View style={styles.emptyState}>
                        <MaterialIcons name="library-books" size={48} color="#6366F1" />
                        <Text style={styles.emptyStateText}>No books published yet</Text>
                        <TouchableOpacity 
                            style={styles.addBookButton}
                            onPress={() => router.back()}
                        >
                            <Text style={styles.addBookButtonText}>Add Your First Book</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#000000',
    },
    header: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#1A1A1A',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    subTitle: {
        fontSize: 14,
        color: '#6366F1',
        marginTop: 4,
    },
    content: {
        flex: 1,
        padding: 15,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 12,
    },
    bookCard: {
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    bookInfo: {
        flex: 1,
    },
    bookTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2D2D2D',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: '#6366F1',
        fontSize: 12,
        marginLeft: 4,
    },
    companyName: {
        color: '#A5A6F6',
        fontSize: 12,
    },
    viewDetailsButton: {
        backgroundColor: '#4A4DFF',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyStateText: {
        color: '#FFFFFF',
        fontSize: 16,
        marginTop: 12,
        marginBottom: 20,
    },
    addBookButton: {
        backgroundColor: '#4A4DFF',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
    },
    addBookButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default PublisherDetailsData;