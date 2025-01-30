import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { defaultStyles } from '@/styles';
import { useLocalSearchParams,router } from 'expo-router';
import { ipURL } from '@/utils/backendURL';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';
import { A } from '@expo/html-elements';

const PublisherDetailsSingle = () => {
  const { publisherDetailsSingle } = useLocalSearchParams();
  const [singleData, setSingleData] = useState(null);

  useEffect(() => {
    const getSingleDataAuthor = async () => {
      try {
        const response = await axios.get(`${ipURL}/api/publisher/get-all-author-data-single/${publisherDetailsSingle}`);
        const authorData = response.data['authorData'];

        if (authorData) {
          setSingleData(authorData);
        } else {
          const companyResponse = await axios.get(`${ipURL}/api/publisher/get-all-company-data-single/${publisherDetailsSingle}`);
          setSingleData(companyResponse.data['companyData'][0]);
        }
      } catch (error) {
        console.error(error);
      }
    };

    getSingleDataAuthor();
  }, []);

  if (!singleData) {
    return (
      <SafeAreaView style={[defaultStyles.container, styles.container]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading Details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[defaultStyles.container, styles.container]}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Book Details</Text>
        </View>

        <View style={styles.detailCard}>
          <Text style={styles.cardTitle}>Title:</Text>
          <Text style={styles.cardContent}>{singleData?.title || 'N/A'}</Text>
        </View>

        <View style={styles.detailCard}>
          <Text style={styles.cardTitle}>Language:</Text>
          <Text style={styles.cardContent}>{singleData?.language || 'N/A'}</Text>
        </View>

        <View style={styles.detailCard}>
          <Text style={styles.cardTitle}>Categories:</Text>
          <Text style={styles.cardContent}>{singleData?.categories || 'N/A'}</Text>
        </View>

        <View style={styles.detailCard}>
          <Text style={styles.cardTitle}>ISBN/DOI/ISRC:</Text>
          <Text style={styles.cardContent}>{singleData?.ISBNDOIISRC || 'N/A'}</Text>
        </View>

        <View style={styles.detailCard}>
          <Text style={styles.cardTitle}>Synopsis:</Text>
          <Text style={styles.cardContent}>{singleData?.synopsis || 'N/A'}</Text>
        </View>

        <View style={styles.detailCard}>
          <Text style={styles.cardTitle}>Audio Sample URL:</Text>
          <A href={singleData?.audioSampleURL || '#'} style={styles.link}>
            <Text style={styles.linkText}>Audio Sample</Text>
          </A>
        </View>

        <View style={styles.detailCard}>
          <Text style={styles.cardTitle}>PDF URL:</Text>
          <A href={singleData?.pdfURL || '#'} style={styles.link}>
            <Text style={styles.linkText}>PDF Sample</Text>
          </A>
        </View>

        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000000',
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  detailCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderColor: '#2D2D2D',
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366F1',
    marginBottom: 4,
  },
  cardContent: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  link: {
    marginTop: 8,
  },
  linkText: {
    color: '#4A4DFF',
    textDecorationLine: 'underline',
    fontSize: 14,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A4DFF',
    padding: 12,
    borderRadius: 25,
    marginTop: 20,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default PublisherDetailsSingle;
