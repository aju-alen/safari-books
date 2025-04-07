import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { defaultStyles } from '@/styles';
import { useLocalSearchParams,router } from 'expo-router';
import { ipURL } from '@/utils/backendURL';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';
import { A } from '@expo/html-elements';
import { WebView } from 'react-native-webview';
import { Audio } from 'expo-av';

const PublisherDetailsSingle = () => {
  const { publisherDetailsSingle } = useLocalSearchParams();
  const [singleData, setSingleData] = useState(null);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

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

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const playPauseSound = async () => {
    if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
      setIsPlaying(!isPlaying);
    } else if (singleData?.audioSampleURL) {
      try {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: singleData.audioSampleURL },
          { shouldPlay: true }
        );
        setSound(newSound);
        setIsPlaying(true);
      } catch (error) {
        console.error('Error loading audio:', error);
      }
    }
  };

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
          {/* <Text style={styles.headerTitle}>Book Details</Text> */}
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
          <Text style={styles.cardTitle}>Audio Sample:</Text>
          {singleData?.audioSampleURL ? (
            <TouchableOpacity 
              style={styles.audioButton} 
              onPress={playPauseSound}
            >
              <MaterialIcons 
                name={isPlaying ? "pause" : "play-arrow"} 
                size={24} 
                color="#FFFFFF" 
              />
              <Text style={styles.audioButtonText}>
                {isPlaying ? 'Pause Audio' : 'Play Audio'}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.cardContent}>No audio sample available</Text>
          )}
        </View>

        <View style={styles.detailCard}>
          <Text style={styles.cardTitle}>PDF Preview:</Text>
          {singleData?.pdfURL ? (
            <View style={styles.pdfContainer}>
              <WebView
                source={{ uri: singleData.pdfURL }}
                style={styles.pdfView}
                javaScriptEnabled={true}
              />
            </View>
          ) : (
            <Text style={styles.cardContent}>No PDF available</Text>
          )}
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
  audioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A4DFF',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  audioButtonText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  pdfContainer: {
    height: 400,
    marginTop: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  pdfView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});

export default PublisherDetailsSingle;
