import { defaultStyles } from '@/styles'
import { ipURL } from '@/utils/backendURL'
import { FontAwesome5, MaterialIcons, Ionicons } from '@expo/vector-icons'
import axios from 'axios'
import { router } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import React, { useEffect, useRef, useState } from 'react'
import { Alert, Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Linking, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { axiosWithAuth } from '@/utils/customAxios';

const AdminDashboard = () => {
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [publisherData, setPublisherData] = useState({ companies: [], authors: [] })
  const [filterType, setFilterType] = useState('all') // 'all', 'companies', 'authors'
  const fadeAnim = useRef(new Animated.Value(0)).current

  // Function to load publisher data from the API
  const loadPublisherData = async () => {
    try {
      const response = await axiosWithAuth.get(`${ipURL}/api/admin/pending-verifications`)
      console.log(response.data, 'this is the response');

      // Store data in state with the correct structure
      setPublisherData({
        companies: response.data.company || [], // Handle typo in the API response
        authors: response.data.author || []
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading publisher data:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to load publisher data');
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadPublisherData().finally(() => {
      setRefreshing(false);
    });
  }, []);

  const handleLogout = async () => {
    try {
      await SecureStore.deleteItemAsync('adminDetails');
      await SecureStore.deleteItemAsync('authToken');
      
      router.replace('/(authenticate)/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleVerifyPublisher = (id, isCompany) => {
    Alert.alert(
      'Verify Publisher',
      'Are you sure you want to verify this publisher?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Verify',
          onPress: async () => {
            try {
              // In a real app, this would be an API call to update verification status
              // For demonstration, we'll update locally
              if (isCompany) {
                setPublisherData({
                  ...publisherData,
                  companies: publisherData.companies.map(company => 
                    company.id === id ? {...company, isVerified: true} : company
                  )
                });
              } else {
                setPublisherData({
                  ...publisherData,
                  authors: publisherData.authors.map(author => 
                    author.id === id ? {...author, isVerified: true} : author
                  )
                });
              }
              
              Alert.alert('Success', 'Publisher has been verified successfully');
            } catch (error) {
              console.error('Verification error:', error);
              Alert.alert('Error', 'Failed to verify publisher');
            }
          },
        },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: () => {
            // In a real app, you would make an API call to reject the publisher
            Alert.alert('Rejected', 'Publisher has been rejected');
          },
        }
      ]
    );
  };

  const handleOpenDocument = (url) => {
    if (url) {
      Linking.openURL(url).catch(err => {
        Alert.alert('Error', 'Could not open the document');
      });
    } else {
      Alert.alert('Error', 'Document URL is not available');
    }
  };

  const handleViewDetails = (id, isCompany) => {
    // Navigate to publisher details page with type info
    router.push({
      pathname: '/(admin)/publisherDetails/singleData',
      params: { id, isCompany }
    });
  };

  const getFilteredPublishers = () => {
    let filteredList = [];
    
    if (filterType === 'all' || filterType === 'companies') {
      const companies = publisherData.companies.map(company => ({
        id: company.id,
        name: company.companyName,
        isCompany: true,
        isVerified: company.isVerified,
        submissionDate: new Date(company.createdAt || company.user?.createdAt || Date.now()).toISOString().split('T')[0],
        document1: company.companyRegNoPdfUrl,
        document2: company.kraPinPdfUrl,
        document1Label: 'Company Registration',
        document2Label: 'KRA PIN',
        documentNumber1: company.companyRegNo,
        documentNumber2: company.kraPin,
        bookTitle: company.title
      }));
      
      if (filterType === 'companies') {
        return companies;
      }
      filteredList = [...companies];
    }
    
    if (filterType === 'all' || filterType === 'authors') {
      const authors = publisherData.authors.map(author => ({
        id: author.id,
        name: author.fullName,
        isCompany: false,
        isVerified: author.isVerified,
        submissionDate: new Date(author.createdAt || author.user?.createdAt || Date.now()).toISOString().split('T')[0],
        document1: author.idppPdfUrl,
        document2: author.kraPinPdfUrl,
        document1Label: 'ID/PP Document',
        document2Label: 'KRA PIN',
        documentNumber1: author.idppNo,
        documentNumber2: author.kraPin,
        bookTitle: author.title
      }));
      
      if (filterType === 'authors') {
        return authors;
      }
      filteredList = [...filteredList, ...authors];
    }
    
    return filteredList;
  };

  useEffect(() => {
    const getAsyncData = async () => {
      try {
        const tokenStore = await SecureStore.getItemAsync('adminDetails');
        if (tokenStore) {
          setToken(JSON.parse(tokenStore).userId);
        }
      } catch (error) {
        console.error('Error fetching token:', error);
      }
      
      loadPublisherData();
    };
    
    getAsyncData();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const filteredPublishers = getFilteredPublishers();
  const pendingCount = filteredPublishers.filter(pub => !pub.isVerified).length;

  return (
    <SafeAreaView style={[defaultStyles.container, styles.container]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Admin Portal</Text>
          <Text style={styles.adminTitle}>Publisher Verification</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <MaterialIcons name="logout" size={22} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4F46E5']}
            tintColor="#4F46E5"
            title="Pull to refresh"
            titleColor="#94A3B8"
          />
        }
      >
        <Animated.View style={[styles.mainContent, { opacity: fadeAnim }]}>
          <View style={styles.statsGrid}>
            <View style={[styles.statBox, styles.statBoxPrimary]}>
              <View style={styles.statIconContainer}>
                <FontAwesome5 name="clock" size={20} color="white" />
              </View>
              <Text style={styles.statNumber}>{pendingCount}</Text>
              <Text style={styles.statLabel}>Pending Verification</Text>
            </View>
            <View style={[styles.statBox, styles.statBoxSecondary]}>
              <View style={styles.statIconContainer}>
                <FontAwesome5 name="check-circle" size={20} color="white" />
              </View>
              <Text style={styles.statNumber}>
                {filteredPublishers.filter(pub => pub.isVerified).length}
              </Text>
              <Text style={styles.statLabel}>Verified Publishers</Text>
            </View>
            <View style={[styles.statBox, styles.statBoxAccent]}>
              <View style={styles.statIconContainer}>
                <FontAwesome5 name="building" size={20} color="white" />
              </View>
              <Text style={styles.statNumber}>{publisherData.companies.length}</Text>
              <Text style={styles.statLabel}>Companies</Text>
            </View>
            <View style={[styles.statBox, styles.statBoxDark]}>
              <View style={styles.statIconContainer}>
                <FontAwesome5 name="user" size={20} color="white" />
              </View>
              <Text style={styles.statNumber}>{publisherData.authors.length}</Text>
              <Text style={styles.statLabel}>Authors</Text>
            </View>
          </View>

          <View style={styles.filtersContainer}>
            <Text style={styles.sectionTitle}>Publishers Pending Verification</Text>
            <View style={styles.filters}>
              <TouchableOpacity 
                style={[styles.filterButton, filterType === 'all' && styles.activeFilter]}
                onPress={() => setFilterType('all')}
              >
                <Text style={styles.filterText}>All</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.filterButton, filterType === 'companies' && styles.activeFilter]}
                onPress={() => setFilterType('companies')}
              >
                <Text style={styles.filterText}>Companies</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.filterButton, filterType === 'authors' && styles.activeFilter]}
                onPress={() => setFilterType('authors')}
              >
                <Text style={styles.filterText}>Authors</Text>
              </TouchableOpacity>
            </View>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#4F46E5" style={styles.loader} />
          ) : (
            <View style={styles.publisherList}>
              {filteredPublishers.length === 0 ? (
                <Text style={styles.noDataText}>No publishers found matching the selected filter</Text>
              ) : (
                filteredPublishers.map((publisher) => (
                  <View key={publisher.id} style={styles.publisherCard}>
                    <TouchableOpacity
                      style={styles.publisherInfo}
                      onPress={() => handleViewDetails(publisher.id, publisher.isCompany)}
                    >
                      <View style={styles.publisherIconContainer}>
                        {publisher.isCompany ? (
                          <FontAwesome5 name="building" size={20} color="white" />
                        ) : (
                          <FontAwesome5 name="user" size={20} color="white" />
                        )}
                      </View>
                      <View style={styles.publisherDetails}>
                        <Text style={styles.publisherName}>{publisher.name}</Text>
                        <View style={styles.publisherMeta}>
                          <Text style={styles.publisherType}>
                            {publisher.isCompany ? 'Publishing Company' : 'Independent Author'}
                          </Text>
                          <Text style={styles.publisherDate}>Submitted: {publisher.submissionDate}</Text>
                          <Text style={styles.bookTitle}>Book: {publisher.bookTitle}</Text>
                        </View>
                        <View style={styles.publisherStats}>
                          <View style={styles.statusBadge}>
                            {publisher.isVerified ? (
                              <Text style={styles.verifiedStatusText}>Verified</Text>
                            ) : (
                              <Text style={styles.pendingStatusText}>Pending</Text>
                            )}
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                    
                    <View style={styles.documentsSection}>
                      <Text style={styles.documentsSectionTitle}>Verification Documents</Text>
                      <View style={styles.documents}>
                        <TouchableOpacity 
                          style={styles.documentItem}
                          onPress={() => handleOpenDocument(publisher.document1)}
                        >
                          <MaterialIcons name="description" size={18} color="#94A3B8" />
                          <View style={styles.documentDetails}>
                            <Text style={styles.documentLabel}>{publisher.document1Label}</Text>
                            <Text style={styles.documentNumber}>{publisher.documentNumber1}</Text>
                          </View>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                          style={styles.documentItem}
                          onPress={() => handleOpenDocument(publisher.document2)}
                        >
                          <MaterialIcons name="description" size={18} color="#94A3B8" />
                          <View style={styles.documentDetails}>
                            <Text style={styles.documentLabel}>{publisher.document2Label}</Text>
                            <Text style={styles.documentNumber}>{publisher.documentNumber2}</Text>
                          </View>
                        </TouchableOpacity>
                      </View>
                    </View>
                    
                    {!publisher.isVerified && (
                      <View style={styles.actionButtons}>
                        <TouchableOpacity 
                          style={styles.verifyButton}
                          onPress={() => handleVerifyPublisher(publisher.id, publisher.isCompany)}
                        >
                          <MaterialIcons name="verified" size={18} color="white" />
                          <Text style={styles.buttonText}>Verify Publisher</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                ))
              )}
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F172A', // Darker blue background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  welcomeText: {
    fontSize: 16,
    color: '#94A3B8',
    marginBottom: 4,
    fontWeight: '500',
  },
  adminTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  logoutButton: {
    padding: 10,
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  content: {
    flex: 1,
  },
  mainContent: {
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
    marginTop: 10,
  },
  statBox: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    width: '47%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 4,
  },
  statBoxPrimary: {
    backgroundColor: '#4F46E5', // Indigo
    borderLeftWidth: 4,
    borderLeftColor: '#818CF8',
  },
  statBoxSecondary: {
    backgroundColor: '#059669', // Green
    borderLeftWidth: 4,
    borderLeftColor: '#34D399',
  },
  statBoxAccent: {
    backgroundColor: '#2563EB', // Blue
    borderLeftWidth: 4,
    borderLeftColor: '#60A5FA',
  },
  statBoxDark: {
    backgroundColor: '#6D28D9', // Violet
    borderLeftWidth: 4,
    borderLeftColor: '#A78BFA',
  },
  statIconContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
  },
  statNumber: {
    color: 'white',
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 4,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
    fontSize: 13,
    fontWeight: '500',
  },
  filtersContainer: {
    marginTop: 28,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#fff',
    paddingLeft: 4,
  },
  filters: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  activeFilter: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  filterText: {
    color: '#fff',
    fontWeight: '500',
  },
  loader: {
    marginTop: 40,
  },
  noDataText: {
    color: '#94A3B8',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
  publisherList: {
    gap: 16,
  },
  publisherCard: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#1E293B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#4F46E5',
    marginBottom: 16,
  },
  publisherInfo: {
    flexDirection: 'row',
    gap: 16,
  },
  publisherIconContainer: {
    backgroundColor: '#4F46E5',
    padding: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  publisherDetails: {
    flex: 1,
  },
  publisherName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  publisherMeta: {
    marginBottom: 8,
  },
  publisherType: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 2,
  },
  publisherDate: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 2,
  },
  bookTitle: {
    fontSize: 13,
    color: '#64748B',
    fontStyle: 'italic',
  },
  publisherStats: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 6,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: '#334155',
  },
  pendingStatusText: {
    color: '#FBBF24',
    fontSize: 12,
    fontWeight: '600',
  },
  verifiedStatusText: {
    color: '#34D399',
    fontSize: 12,
    fontWeight: '600',
  },
  documentsSection: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 16,
  },
  documentsSectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 10,
  },
  documents: {
    gap: 8,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
  },
  documentDetails: {
    flex: 1,
  },
  documentLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#94A3B8',
  },
  documentNumber: {
    fontSize: 12,
    color: '#64748B',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    gap: 8,
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#4F46E5',
    borderRadius: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
})

export default AdminDashboard