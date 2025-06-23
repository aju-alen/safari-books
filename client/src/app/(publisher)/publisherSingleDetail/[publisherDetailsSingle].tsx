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
import { useTheme } from '@/providers/ThemeProvider';

const PublisherDetailsSingle = () => {
  const { theme } = useTheme();
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

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.background,
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
      color: theme.text,
      textAlign: 'center',
    },
    detailCard: {
      backgroundColor: theme.white,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderColor: theme.gray2,
      borderWidth: 1,
      shadowColor: theme.text,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      
      shadowRadius: 3.84,
      elevation: 5,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.primary,
      marginBottom: 4,
    },
    cardContent: {
      fontSize: 14,
      color: theme.text,
      lineHeight: 20,
    },
    link: {
      marginTop: 8,
    },
    linkText: {
      color: theme.primary,
      textDecorationLine: 'underline',
      fontSize: 14,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.primary,
      padding: 12,
      borderRadius: 25,
      marginTop: 20,
      shadowColor: theme.primary,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      
      shadowRadius: 3.84,
      elevation: 5,
    },
    backButtonText: {
      color: theme.white,
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
      color: theme.text,
      fontSize: 18,
      fontWeight: '600',
    },
    audioButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.primary,
      padding: 10,
      borderRadius: 8,
      marginTop: 8,
      shadowColor: theme.primary,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      
      shadowRadius: 3.84,
      elevation: 5,
    },
    audioButtonText: {
      color: theme.white,
      marginLeft: 8,
      fontSize: 14,
      fontWeight: '500',
    },
    pdfContainer: {
      height: 400,
      marginTop: 8,
      borderRadius: 8,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.gray2,
    },
    pdfView: {
      flex: 1,
      backgroundColor: theme.white,
    },
  });

  if (!singleData) {
    return (
      <SafeAreaView style={[defaultStyles.container, styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.text }]}>Loading Details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[defaultStyles.container, styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          {/* <Text style={styles.headerTitle}>Book Details</Text> */}
        </View>

        <View style={styles.detailCard}>
          <Text style={[styles.cardTitle, { color: theme.primary }]}>Title:</Text>
          <Text style={[styles.cardContent, { color: theme.text }]}>{singleData?.title || 'N/A'}</Text>
        </View>

        <View style={styles.detailCard}>
          <Text style={[styles.cardTitle, { color: theme.primary }]}>Language:</Text>
          <Text style={[styles.cardContent, { color: theme.text }]}>{singleData?.language || 'N/A'}</Text>
        </View>

        <View style={styles.detailCard}>
          <Text style={[styles.cardTitle, { color: theme.primary }]}>Categories:</Text>
          <Text style={[styles.cardContent, { color: theme.text }]}>{singleData?.categories || 'N/A'}</Text>
        </View>

        <View style={styles.detailCard}>
          <Text style={[styles.cardTitle, { color: theme.primary }]}>ISBN/DOI/ISRC:</Text>
          <Text style={[styles.cardContent, { color: theme.text }]}>{singleData?.ISBNDOIISRC || 'N/A'}</Text>
        </View>

        <View style={styles.detailCard}>
          <Text style={[styles.cardTitle, { color: theme.primary }]}>Synopsis:</Text>
          <Text style={[styles.cardContent, { color: theme.text }]}>{singleData?.synopsis || 'N/A'}</Text>
        </View>

        <View style={styles.detailCard}>
          <Text style={[styles.cardTitle, { color: theme.primary }]}>Audio Sample:</Text>
          {singleData?.audioSampleURL ? (
            <TouchableOpacity 
              style={styles.audioButton} 
              onPress={playPauseSound}
            >
              <MaterialIcons 
                name={isPlaying ? "pause" : "play-arrow"} 
                size={24} 
                color={theme.white} 
              />
              <Text style={[styles.audioButtonText, { color: theme.white }]}>
                {isPlaying ? 'Pause Audio' : 'Play Audio'}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={[styles.cardContent, { color: theme.textMuted }]}>No audio sample available</Text>
          )}
        </View>

        <View style={styles.detailCard}>
          <Text style={[styles.cardTitle, { color: theme.primary }]}>PDF Preview:</Text>
          {singleData?.pdfURL ? (
            <View style={styles.pdfContainer}>
              <WebView
                source={{ uri: singleData.pdfURL }}
                style={styles.pdfView}
                javaScriptEnabled={true}
              />
            </View>
          ) : (
            <Text style={[styles.cardContent, { color: theme.textMuted }]}>No PDF available</Text>
          )}
        </View>

        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={theme.white} />
          <Text style={[styles.backButtonText, { color: theme.white }]}>Go Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PublisherDetailsSingle;
