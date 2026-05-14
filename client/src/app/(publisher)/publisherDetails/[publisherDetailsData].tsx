import { defaultStyles } from '@/styles';
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { ipURL } from '@/utils/backendURL';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/providers/ThemeProvider';

const PublisherDetailsData = () => {
    const { theme } = useTheme();
    const { publisherDetailsData } = useLocalSearchParams();
    console.log(publisherDetailsData,'userId in publisher details');
    const [authorData, setAuthorData] = useState([]);
    const [companyData, setCompanyData] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    const fetchListings = React.useCallback(async () => {
        try {
            const authorResponse = await axios.get(`${ipURL}/api/publisher/get-all-author-data/${publisherDetailsData}`);
            const companyResponse = await axios.get(`${ipURL}/api/publisher/get-all-company-data/${publisherDetailsData}`);
            setCompanyData(companyResponse.data["companyData"]);
            setAuthorData(authorResponse.data["authorData"]);
        } catch (error) {
            console.error(error);
        }
    }, [publisherDetailsData]);

    useEffect(() => {
        fetchListings();
    }, [fetchListings]);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchListings();
        setRefreshing(false);
    }, [fetchListings]);

    const renderBookItem = (item, index, type) => {
        console.log(item,'renderEach book item');
        const isRejected = Boolean(item.isRejected);
        const statusLabel = item.isVerified
            ? 'Approved'
            : isRejected
              ? 'Not approved'
              : 'Pending Approval';
        const statusIcon = item.isVerified ? 'done' : isRejected ? 'cancel' : 'pending';
        const statusColor = item.isVerified ? theme.primary : isRejected ? theme.secondary2 : theme.tertiary;

        return(
        <View key={index} style={styles.bookCard}>
            <View style={styles.bookInfo}>
                <Text style={styles.bookTitle}>{item.title}</Text>
                <View style={styles.detailRow}>
                    <View style={styles.statusContainer}>
                        <MaterialIcons name={statusIcon} size={16} color={statusColor} />
                        <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
                    </View>
                    {type === 'company' && (
                        <Text style={styles.companyName}>{item.companyName}</Text>
                    )}
                </View>
            </View>
            <View style={styles.cardActions}>
                <TouchableOpacity
                    style={styles.viewDetailsButton}
                    onPress={() => router.push(`/(publisher)/publisherSingleDetail/${item.id}`)}
                    accessibilityLabel="View listing details"
                >
                    <MaterialIcons name="visibility" size={22} color={theme.white} />
                </TouchableOpacity>
                {isRejected ? (
                    <TouchableOpacity
                        style={[styles.viewDetailsButton, { backgroundColor: theme.secondary }]}
                        onPress={() =>
                            router.push({
                                pathname: '/(publisher)/[publisherCommonForm]',
                                params: {
                                    publisherCommonForm: String(item.id),
                                    isCompany: type === 'company' ? 'true' : 'false',
                                    loadExisting: '1',
                                },
                            })
                        }
                        accessibilityLabel="Edit listing and resubmit for review"
                    >
                        <MaterialIcons name="edit" size={22} color={theme.white} />
                    </TouchableOpacity>
                ) : null}
            </View>
        </View>
    )};

    const styles = StyleSheet.create({
        container: {
            backgroundColor: theme.background,
        },
        header: {
            padding: 20,
            borderBottomWidth: 1,
            borderBottomColor: theme.gray2,
        },
        headerTitle: {
            fontSize: 24,
            fontWeight: 'bold',
            color: theme.text,
        },
        subTitle: {
            fontSize: 14,
            color: theme.primary,
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
            color: theme.text,
            marginBottom: 12,
        },
        bookCard: {
            backgroundColor: theme.white,
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            shadowColor: theme.text,
            shadowOffset: {
                width: 0,
                height: 2,
            },
            
            shadowRadius: 3.84,
            elevation: 5,
        },
        bookInfo: {
            flex: 1,
        },
        bookTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.text,
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
            backgroundColor: `${theme.primary}15`,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
        },
        statusText: {
            color: theme.primary,
            fontSize: 12,
            marginLeft: 4,
            fontWeight: '500',
        },
        companyName: {
            color: theme.secondary,
            fontSize: 12,
            fontWeight: '500',
        },
        cardActions: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            marginLeft: 12,
        },
        viewDetailsButton: {
            backgroundColor: theme.primary,
            width: 40,
            height: 40,
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: theme.primary,
            shadowOffset: {
                width: 0,
                height: 2,
            },
            
            shadowRadius: 3.84,
            elevation: 5,
        },
        emptyState: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: 100,
        },
        emptyStateText: {
            color: theme.text,
            fontSize: 16,
            marginTop: 12,
            marginBottom: 20,
        },
        addBookButton: {
            backgroundColor: theme.primary,
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 25,
            shadowColor: theme.primary,
            shadowOffset: {
                width: 0,
                height: 2,
            },
            
            shadowRadius: 3.84,
            elevation: 5,
        },
        addBookButtonText: {
            color: theme.white,
            fontSize: 16,
            fontWeight: '600',
        },
    });

    return (
        <SafeAreaView style={[defaultStyles.container, styles.container, { backgroundColor: theme.background } ]}>
            <View style={styles.header}>
                <Text style={styles.subTitle}>
                    {authorData.length + (companyData?.length || 0)} Total Books
                </Text>
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
                }
            >
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
                        <MaterialIcons name="library-books" size={48} color={theme.primary} />
                        <Text style={[styles.emptyStateText, { color: theme.text }]}>No books published yet</Text>
                        <TouchableOpacity 
                            style={styles.addBookButton}
                            onPress={() => router.back()}
                        >
                            <Text style={[styles.addBookButtonText, { color: theme.white }]}>Add Your First Book</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default PublisherDetailsData;