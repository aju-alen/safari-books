import { defaultStyles } from '@/styles';
import { ipURL } from '@/utils/backendURL';
import { FontAwesome5, MaterialIcons, Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useLocalSearchParams, router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Linking,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { axiosWithAuth } from '@/utils/customAxios';

const PublisherDetails = () => {
  const { id, isCompany } = useLocalSearchParams();
  const isCompanyBoolean = isCompany === 'true';
  console.log(id, isCompanyBoolean, 'this is id and isCompany');
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [publisherData, setPublisherData] = useState(null);
  const [error, setError] = useState(null);
  
  const fetchPublisherDetails = async () => {
    try {
      setLoading(true);
      // Make API call to get the specific publisher details
      const response = await axiosWithAuth.get(`${ipURL}/api/admin/get-single/${isCompanyBoolean}/${id}`);
      setPublisherData(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching publisher details:', err);
      setError('Failed to load publisher details');
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchPublisherDetails();
  }, [id, isCompanyBoolean]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchPublisherDetails().finally(() => {
      setRefreshing(false);
    });
  }, [id, isCompanyBoolean]);

  const handleGoBack = () => {
    router.back();
  };

  const handleRejectPublisher = (id) => {}

  const handleVerifyPublisher = (id) => {
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
              // Make API call to verify the publisher
              await axiosWithAuth.post(`${ipURL}/api/admin/verify-publisher/${id}`, {
                type: isCompanyBoolean ? 'company' : 'author'
              });
              
              Alert.alert('Success', 'Publisher has been verified successfully');
              router.back();
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
            // API call to reject the publisher would go here
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

  const renderCompanyDetails = () => {
    const company = publisherData.publisher;
    console.log(company, 'this is companyyyyyy -----------');
    
    return (
      <View style={styles.detailsContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Company Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Company Name:</Text>
            <Text style={styles.infoValue}>{company.companyName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Registration No:</Text>
            <Text style={styles.infoValue}>{company.companyRegNo}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>KRA PIN:</Text>
            <Text style={styles.infoValue}>{company.kraPin}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Telephone:</Text>
            <Text style={styles.infoValue}>{company.telephone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Address:</Text>
            <Text style={styles.infoValue}>{company.address}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Book Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Title:</Text>
            <Text style={styles.infoValue}>{company.title}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Language:</Text>
            <Text style={styles.infoValue}>{company.language}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Category:</Text>
            <Text style={styles.infoValue}>{company.categories}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ISBN/DOI/ISRC:</Text>
            <Text style={styles.infoValue}>{company.ISBNDOIISRC}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Publication Date:</Text>
            <Text style={styles.infoValue}>{new Date(company.date).toLocaleDateString()}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Synopsis</Text>
          <View style={styles.synopsisContainer}>
            <Text style={styles.synopsisText}>{company.synopsis}</Text>
          </View>
        </View>

        {company.narrator && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Narration Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Narrator:</Text>
              <Text style={styles.infoValue}>{company.narrator}</Text>
            </View>
            <View style={styles.narratorStyles}>
              <Text style={styles.infoLabel}>Narration Style:</Text>
              <View style={styles.stylesContainer}>
                {company.narrationStyleSlow && (
                  <View style={styles.styleBadge}>
                    <Text style={styles.styleBadgeText}>Slow</Text>
                  </View>
                )}
                {company.narrationStyleFast && (
                  <View style={styles.styleBadge}>
                    <Text style={styles.styleBadgeText}>Fast</Text>
                  </View>
                )}
                {company.narrationStyleIntimate && (
                  <View style={styles.styleBadge}>
                    <Text style={styles.styleBadgeText}>Intimate</Text>
                  </View>
                )}
                {company.narrationStyleCasual && (
                  <View style={styles.styleBadge}>
                    <Text style={styles.styleBadgeText}>Casual</Text>
                  </View>
                )}
                {company.narrationStyleStatic && (
                  <View style={styles.styleBadge}>
                    <Text style={styles.styleBadgeText}>Static</Text>
                  </View>
                )}
                {company.narrationStyleOratoric && (
                  <View style={styles.styleBadge}>
                    <Text style={styles.styleBadgeText}>Oratoric</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Verification Documents</Text>
          <TouchableOpacity 
            style={styles.documentItem}
            onPress={() => handleOpenDocument(company.companyRegNoPdfUrl)}
          >
            <MaterialIcons name="description" size={20} color="#94A3B8" />
            <View style={styles.documentDetails}>
              <Text style={styles.documentLabel}>Company Registration Document</Text>
              <Text style={styles.documentNumber}>{company.companyRegNo}</Text>
            </View>
            <MaterialIcons name="open-in-new" size={20} color="#4F46E5" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.documentItem}
            onPress={() => handleOpenDocument(company.kraPinPdfUrl)}
          >
            <MaterialIcons name="description" size={20} color="#94A3B8" />
            <View style={styles.documentDetails}>
              <Text style={styles.documentLabel}>KRA PIN Document</Text>
              <Text style={styles.documentNumber}>{company.kraPin}</Text>
            </View>
            <MaterialIcons name="open-in-new" size={20} color="#4F46E5" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sample Files</Text>
          {company.audioSampleURL && (
            <TouchableOpacity 
              style={styles.documentItem}
              onPress={() => handleOpenDocument(company.audioSampleURL)}
            >
              <FontAwesome5 name="file-audio" size={20} color="#94A3B8" />
              <View style={styles.documentDetails}>
                <Text style={styles.documentLabel}>Audio Sample</Text>
                <Text style={styles.documentNumber}>Open to listen</Text>
              </View>
              <MaterialIcons name="play-circle-filled" size={24} color="#4F46E5" />
            </TouchableOpacity>
          )}
          
          {company.pdfURL && (
            <TouchableOpacity 
              style={styles.documentItem}
              onPress={() => handleOpenDocument(company.pdfURL)}
            >
              <FontAwesome5 name="file-pdf" size={20} color="#94A3B8" />
              <View style={styles.documentDetails}>
                <Text style={styles.documentLabel}>PDF Sample</Text>
                <Text style={styles.documentNumber}>Open to view</Text>
              </View>
              <MaterialIcons name="open-in-new" size={20} color="#4F46E5" />
            </TouchableOpacity>
          )}
          
          {company.coverImage && (
            <View style={styles.imageContainer}>
              <Text style={styles.documentLabel}>Cover Image</Text>
              <Image 
                source={{ uri: company.coverImage }} 
                style={styles.coverImage}
                resizeMode="cover"
              />
              <TouchableOpacity 
                style={styles.viewImageButton}
                onPress={() => handleOpenDocument(company.coverImage)}
              >
                <Text style={styles.viewImageButtonText}>View Full Image</Text>
                <MaterialIcons name="open-in-new" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}
        </View>
        

        <View style={styles.accountInfo}>
          <View style={styles.statusIndicator}>
            <Text style={styles.statusLabel}>Rights Holder:</Text>
            <View style={[styles.statusBadge, company.rightsHolder ? styles.statusActive : styles.statusInactive]}>
              <Text style={styles.statusText}>{company.rightsHolder ? 'Yes' : 'No'}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderAuthorDetails = () => {
    const author = publisherData.publisher;
    console.log(author, 'this is authoryyyyy -----------');
    
    return (
      <View style={styles.detailsContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Author Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Full Name:</Text>
            <Text style={styles.infoValue}>{author.fullName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ID/PP Number:</Text>
            <Text style={styles.infoValue}>{author.idppNo}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>KRA PIN:</Text>
            <Text style={styles.infoValue}>{author.kraPin}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Writers Guild No:</Text>
            <Text style={styles.infoValue}>{author.writersGuildNo || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Telephone:</Text>
            <Text style={styles.infoValue}>{author.telephone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Address:</Text>
            <Text style={styles.infoValue}>{author.address}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Book Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Title:</Text>
            <Text style={styles.infoValue}>{author.title}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Language:</Text>
            <Text style={styles.infoValue}>{author.language}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Category:</Text>
            <Text style={styles.infoValue}>{author.categories}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ISBN/DOI/ISRC:</Text>
            <Text style={styles.infoValue}>{author.ISBNDOIISRC}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Publication Date:</Text>
            <Text style={styles.infoValue}>{new Date(author.date).toLocaleDateString()}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Synopsis</Text>
          <View style={styles.synopsisContainer}>
            <Text style={styles.synopsisText}>{author.synopsis}</Text>
          </View>
        </View>

        {author.narrator && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Narration Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Narrator:</Text>
              <Text style={styles.infoValue}>{author.narrator}</Text>
            </View>
            <View style={styles.narratorStyles}>
              <Text style={styles.infoLabel}>Narration Style:</Text>
              <View style={styles.stylesContainer}>
                {author.narrationStyleSlow && (
                  <View style={styles.styleBadge}>
                    <Text style={styles.styleBadgeText}>Slow</Text>
                  </View>
                )}
                {author.narrationStyleFast && (
                  <View style={styles.styleBadge}>
                    <Text style={styles.styleBadgeText}>Fast</Text>
                  </View>
                )}
                {author.narrationStyleIntimate && (
                  <View style={styles.styleBadge}>
                    <Text style={styles.styleBadgeText}>Intimate</Text>
                  </View>
                )}
                {author.narrationStyleCasual && (
                  <View style={styles.styleBadge}>
                    <Text style={styles.styleBadgeText}>Casual</Text>
                  </View>
                )}
                {author.narrationStyleStatic && (
                  <View style={styles.styleBadge}>
                    <Text style={styles.styleBadgeText}>Static</Text>
                  </View>
                )}
                {author.narrationStyleOratoric && (
                  <View style={styles.styleBadge}>
                    <Text style={styles.styleBadgeText}>Oratoric</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Verification Documents</Text>
          <TouchableOpacity 
            style={styles.documentItem}
            onPress={() => handleOpenDocument(author.idppPdfUrl)}
          >
            <MaterialIcons name="description" size={20} color="#94A3B8" />
            <View style={styles.documentDetails}>
              <Text style={styles.documentLabel}>ID/Passport Document</Text>
              <Text style={styles.documentNumber}>{author.idppNo}</Text>
            </View>
            <MaterialIcons name="open-in-new" size={20} color="#4F46E5" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.documentItem}
            onPress={() => handleOpenDocument(author.kraPinPdfUrl)}
          >
            <MaterialIcons name="description" size={20} color="#94A3B8" />
            <View style={styles.documentDetails}>
              <Text style={styles.documentLabel}>KRA PIN Document</Text>
              <Text style={styles.documentNumber}>{author.kraPin}</Text>
            </View>
            <MaterialIcons name="open-in-new" size={20} color="#4F46E5" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sample Files</Text>
          {author.audioSampleURL && (
            <TouchableOpacity 
              style={styles.documentItem}
              onPress={() => handleOpenDocument(author.audioSampleURL)}
            >
              <FontAwesome5 name="file-audio" size={20} color="#94A3B8" />
              <View style={styles.documentDetails}>
                <Text style={styles.documentLabel}>Audio Sample</Text>
                <Text style={styles.documentNumber}>Open to listen</Text>
              </View>
              <MaterialIcons name="play-circle-filled" size={24} color="#4F46E5" />
            </TouchableOpacity>
          )}
          
          {author.pdfURL && (
            <TouchableOpacity 
              style={styles.documentItem}
              onPress={() => handleOpenDocument(author.pdfURL)}
            >
              <FontAwesome5 name="file-pdf" size={20} color="#94A3B8" />
              <View style={styles.documentDetails}>
                <Text style={styles.documentLabel}>PDF Sample</Text>
                <Text style={styles.documentNumber}>Open to view</Text>
              </View>
              <MaterialIcons name="open-in-new" size={20} color="#4F46E5" />
            </TouchableOpacity>
          )}
          
          {author.coverImage && (
            <View style={styles.imageContainer}>
              <Text style={styles.documentLabel}>Cover Image</Text>
              <Image 
                source={{ uri: author.coverImage }} 
                style={styles.coverImage}
                resizeMode="cover"
              />
              <TouchableOpacity 
                style={styles.viewImageButton}
                onPress={() => handleOpenDocument(author.coverImage)}
              >
                <Text style={styles.viewImageButtonText}>View Full Image</Text>
                <MaterialIcons name="open-in-new" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.accountInfo}>
          <View style={styles.statusIndicator}>
            <Text style={styles.statusLabel}>Rights Holder:</Text>
            <View style={[styles.statusBadge, author.rightsHolder ? styles.statusActive : styles.statusInactive]}>
              <Text style={styles.statusText}>{author.rightsHolder ? 'Yes' : 'No'}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[defaultStyles.container, styles.container]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isCompanyBoolean ? 'Company Details' : 'Author Details'}
        </Text>
        <View style={styles.placeholderView} />
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Loading publisher details...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <FontAwesome5 name="exclamation-circle" size={50} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
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
          <View style={styles.publisherHeader}>
            <View style={styles.publisherIconContainer}>
              {isCompanyBoolean ? (
                <FontAwesome5 name="building" size={30} color="white" />
              ) : (
                <FontAwesome5 name="user" size={30} color="white" />
              )}
            </View>
            <View style={styles.publisherBasicInfo}>
              <Text style={styles.publisherName}>
                {isCompanyBoolean ? publisherData.companyName : publisherData.fullName}
              </Text>
              <View style={styles.publisherMeta}>
                <Text style={styles.publisherType}>
                  {isCompanyBoolean ? 'Publishing Company' : 'Independent Author'}
                </Text>
                <View style={styles.verificationStatus}>
                  {publisherData.isVerified ? (
                    <>
                      <FontAwesome5 name="check-circle" size={14} color="#34D399" />
                      <Text style={styles.verifiedText}>Verified</Text>
                    </>
                  ) : (
                    <>
                      <FontAwesome5 name="clock" size={14} color="#FBBF24" />
                      <Text style={styles.pendingText}>Pending Verification</Text>
                    </>
                  )}
                </View>
              </View>
            </View>
          </View>

          {isCompanyBoolean ? renderCompanyDetails() : renderAuthorDetails()}
          
          {!publisherData.isVerified && (
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity style={styles.rejectButton} onPress={handleRejectPublisher}>
                <MaterialIcons name="close" size={20} color="white" />
                <Text style={styles.buttonText}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.verifyButton} onPress={() => handleVerifyPublisher(id)}>
                <MaterialIcons name="verified" size={20} color="white" />
                <Text style={styles.buttonText}>Verify Publisher</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F172A', // Dark blue background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  placeholderView: {
    width: 40, // To balance the header
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#94A3B8',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 18,
    fontWeight: '500',
    marginTop: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  publisherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  publisherIconContainer: {
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 16,
    marginRight: 16,
  },
  publisherBasicInfo: {
    flex: 1,
  },
  publisherName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  publisherMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  publisherType: {
    fontSize: 14,
    color: '#94A3B8',
  },
  verificationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedText: {
    color: '#34D399',
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
  },
  pendingText: {
    color: '#FBBF24',
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
  },
  detailsContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E2E8F0',
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#4F46E5',
    paddingLeft: 10,
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  infoLabel: {
    width: '40%',
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: '#E2E8F0',
  },
  synopsisContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 12,
  },
  synopsisText: {
    color: '#E2E8F0',
    fontSize: 14,
    lineHeight: 20,
  },
  narratorStyles: {
    marginTop: 8,
  },
  stylesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  styleBadge: {
    backgroundColor: 'rgba(79, 70, 229, 0.2)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4F46E5',
  },
  styleBadgeText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '500',
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  documentDetails: {
    flex: 1,
    marginLeft: 12,
  },
  documentLabel: {
    fontSize: 14,
    color: '#E2E8F0',
    fontWeight: '500',
  },
  documentNumber: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  accountInfo: {
    marginBottom: 24,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusLabel: {
    fontSize: 14,
    color: '#94A3B8',
    marginRight: 8,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: 'rgba(52, 211, 153, 0.2)',
    borderWidth: 1,
    borderColor: '#34D399',
  },
  statusInactive: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    gap: 12,
  },
  verifyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  imageContainer: {
    marginTop: 15,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#1E293B',
    padding: 15,
  },
  coverImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginVertical: 10,
  },
  viewImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  viewImageButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginRight: 8,
  },
});

export default PublisherDetails;