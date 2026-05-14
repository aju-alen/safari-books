import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native';
import Slider from '@react-native-community/slider';
import { defaultStyles } from '@/styles';
import { useLocalSearchParams,router } from 'expo-router';
import { ipURL } from '@/utils/backendURL';
import axios from 'axios';
import { axiosWithAuth } from '@/utils/customAxios';
import { MaterialIcons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { Audio } from 'expo-av';
import { useTheme } from '@/providers/ThemeProvider';

const formatTimeMs = (milliseconds) => {
  if (milliseconds == null || Number.isNaN(milliseconds)) return '0:00';
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const PublisherDetailsSingle = () => {
  const { theme } = useTheme();
  const { publisherDetailsSingle } = useLocalSearchParams();
  const [singleData, setSingleData] = useState(null);
  const [listingIsCompany, setListingIsCompany] = useState(null);
  const [rejectDraft, setRejectDraft] = useState('');
  const [rejectSaving, setRejectSaving] = useState(false);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completeSound, setCompleteSound] = useState(null);
  const [isPlayingComplete, setIsPlayingComplete] = useState(false);
  const [samplePosition, setSamplePosition] = useState(0);
  const [sampleDuration, setSampleDuration] = useState(0);
  const [completePosition, setCompletePosition] = useState(0);
  const [completeDuration, setCompleteDuration] = useState(0);
  const isSeekingSampleRef = useRef(false);
  const isSeekingCompleteRef = useRef(false);

  useEffect(() => {
    void Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
  }, []);

  const onSamplePlaybackStatusUpdate = useCallback((status) => {
    if (!status.isLoaded) return;
    if (status.didJustFinish) {
      setIsPlaying(false);
      setSamplePosition(0);
      return;
    }
    if (!isSeekingSampleRef.current && status.positionMillis != null) {
      setSamplePosition(status.positionMillis);
    }
    if (status.durationMillis != null && status.durationMillis > 0) {
      setSampleDuration(status.durationMillis);
    }
  }, []);

  const onCompletePlaybackStatusUpdate = useCallback((status) => {
    if (!status.isLoaded) return;
    if (status.didJustFinish) {
      setIsPlayingComplete(false);
      setCompletePosition(0);
      return;
    }
    if (!isSeekingCompleteRef.current && status.positionMillis != null) {
      setCompletePosition(status.positionMillis);
    }
    if (status.durationMillis != null && status.durationMillis > 0) {
      setCompleteDuration(status.durationMillis);
    }
  }, []);

  useEffect(() => {
    const getSingleDataAuthor = async () => {
      try {
        const response = await axios.get(`${ipURL}/api/publisher/get-all-author-data-single/${publisherDetailsSingle}`);
        const authorData = response.data['authorData'];

        if (authorData) {
          setListingIsCompany(false);
          setSingleData(authorData);
        } else {
          const companyResponse = await axios.get(`${ipURL}/api/publisher/get-all-company-data-single/${publisherDetailsSingle}`);
          setListingIsCompany(true);
          const row = companyResponse.data['companyData']?.[0];
          setSingleData(row ?? null);
        }
      } catch (error) {
        console.error(error);
      }
    };

    getSingleDataAuthor();
  }, [publisherDetailsSingle]);

  useEffect(() => {
    if (singleData?.isRejected) {
      setRejectDraft(typeof singleData.reject === 'string' ? singleData.reject : '');
    } else {
      setRejectDraft('');
    }
  }, [singleData]);

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  useEffect(() => {
    return completeSound
      ? () => {
          completeSound.unloadAsync();
        }
      : undefined;
  }, [completeSound]);

  const playPauseSound = async () => {
    if (sound) {
      try {
        if (isPlaying) {
          await sound.pauseAsync();
        } else {
          await sound.playAsync();
        }
        setIsPlaying(!isPlaying);
      } catch (error) {
        console.error('Error playing/pausing sample:', error);
      }
    } else if (singleData?.audioSampleURL) {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: singleData.audioSampleURL },
          { shouldPlay: true, progressUpdateIntervalMillis: 250 },
          onSamplePlaybackStatusUpdate,
          false
        );
        setSound(newSound);
        setIsPlaying(true);
      } catch (error) {
        console.error('Error loading audio:', error);
      }
    }
  };

  const playPauseCompleteAudio = async () => {
    if (completeSound) {
      try {
        if (isPlayingComplete) {
          await completeSound.pauseAsync();
        } else {
          await completeSound.playAsync();
        }
        setIsPlayingComplete(!isPlayingComplete);
      } catch (error) {
        console.error('Error playing/pausing complete audio:', error);
      }
    } else if (singleData?.completeAudioUrl) {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: singleData.completeAudioUrl },
          { shouldPlay: true, progressUpdateIntervalMillis: 250 },
          onCompletePlaybackStatusUpdate,
          false
        );
        setCompleteSound(newSound);
        setIsPlayingComplete(true);
      } catch (error) {
        console.error('Error loading complete audio:', error);
      }
    }
  };

  const handleSampleSeek = (value) => {
    if (sampleDuration > 0) {
      isSeekingSampleRef.current = true;
      setSamplePosition(value * sampleDuration);
    }
  };

  const handleSampleSlidingStart = () => {
    isSeekingSampleRef.current = true;
  };

  const handleSampleSlidingComplete = async (value) => {
    if (sound && sampleDuration > 0) {
      const newPosition = value * sampleDuration;
      try {
        await sound.setPositionAsync(newPosition);
        setSamplePosition(newPosition);
      } catch (error) {
        console.error('Seek sample error:', error);
      }
    }
    isSeekingSampleRef.current = false;
  };

  const handleCompleteSeek = (value) => {
    if (completeDuration > 0) {
      isSeekingCompleteRef.current = true;
      setCompletePosition(value * completeDuration);
    }
  };

  const handleCompleteSlidingStart = () => {
    isSeekingCompleteRef.current = true;
  };

  const handleCompleteSlidingComplete = async (value) => {
    if (completeSound && completeDuration > 0) {
      const newPosition = value * completeDuration;
      try {
        await completeSound.setPositionAsync(newPosition);
        setCompletePosition(newPosition);
      } catch (error) {
        console.error('Seek complete error:', error);
      }
    }
    isSeekingCompleteRef.current = false;
  };

  const handleSaveRejectNotes = async () => {
    if (listingIsCompany === null || !publisherDetailsSingle) {
      Alert.alert('Error', 'Could not determine listing type. Pull to refresh or try again.');
      return;
    }
    try {
      setRejectSaving(true);
      await axiosWithAuth.put(`${ipURL}/api/publisher/reject-field`, {
        publisherId: String(publisherDetailsSingle),
        isCompany: listingIsCompany,
        reject: rejectDraft,
      });
      setSingleData((prev) => (prev ? { ...prev, reject: rejectDraft.trim() } : prev));
      Alert.alert('Saved', 'Your rejection notes were updated.');
    } catch (err) {
      const ax = err as { response?: { data?: { message?: string } }; message?: string };
      const msg = ax?.response?.data?.message || ax?.message || 'Could not save.';
      Alert.alert('Error', String(msg));
    } finally {
      setRejectSaving(false);
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
    audioSliderBlock: {
      marginTop: 12,
    },
    slider: {
      width: '100%',
      height: 40,
    },
    audioTimeRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 4,
    },
    audioTimeText: {
      fontSize: 12,
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
    rejectNotesInput: {
      borderWidth: 1,
      borderColor: theme.gray2,
      borderRadius: 8,
      padding: 12,
      fontSize: 14,
      color: theme.text,
      minHeight: 120,
      marginTop: 10,
      textAlignVertical: 'top',
    },
    saveRejectButton: {
      marginTop: 12,
      backgroundColor: theme.primary,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    saveRejectButtonText: {
      color: theme.white,
      fontSize: 15,
      fontWeight: '600',
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
        </View>

        {singleData?.isRejected ? (
          <View style={[styles.detailCard, { borderColor: theme.secondary2 }]}>
            <Text style={[styles.cardTitle, { color: theme.secondary2 }]}>Application not approved</Text>
            <Text style={[styles.cardContent, { color: theme.text, marginTop: 6 }]}>
              Your listing was rejected by our team (you should have received an email). You can update the text below
              for your own records or to prepare a follow-up with support — this does not resubmit the application automatically.
            </Text>
            <TextInput
              style={styles.rejectNotesInput}
              value={rejectDraft}
              onChangeText={setRejectDraft}
              placeholder="Rejection details / your notes…"
              placeholderTextColor={theme.textMuted}
              multiline
              maxLength={8000}
              editable={!rejectSaving}
            />
            <TouchableOpacity
              style={[styles.saveRejectButton, { opacity: rejectSaving ? 0.7 : 1 }]}
              onPress={handleSaveRejectNotes}
              disabled={rejectSaving}
            >
              {rejectSaving ? (
                <ActivityIndicator color={theme.white} />
              ) : (
                <Text style={styles.saveRejectButtonText}>Save notes</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : null}

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
            <View>
              <TouchableOpacity
                style={styles.audioButton}
                onPress={playPauseSound}
              >
                <MaterialIcons
                  name={isPlaying ? 'pause' : 'play-arrow'}
                  size={24}
                  color={theme.white}
                />
                <Text style={[styles.audioButtonText, { color: theme.white }]}>
                  {isPlaying ? 'Pause Audio' : 'Play Audio'}
                </Text>
              </TouchableOpacity>
              {sound && sampleDuration > 0 ? (
                <View style={styles.audioSliderBlock}>
                  <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={1}
                    value={samplePosition / sampleDuration}
                    onValueChange={handleSampleSeek}
                    onSlidingStart={handleSampleSlidingStart}
                    onSlidingComplete={handleSampleSlidingComplete}
                    minimumTrackTintColor={theme.primary}
                    maximumTrackTintColor={theme.maximumTrackTintColor}
                    thumbTintColor={theme.primary}
                  />
                  <View style={styles.audioTimeRow}>
                    <Text style={[styles.audioTimeText, { color: theme.textMuted }]}>
                      {formatTimeMs(samplePosition)}
                    </Text>
                    <Text style={[styles.audioTimeText, { color: theme.textMuted }]}>
                      {formatTimeMs(sampleDuration)}
                    </Text>
                  </View>
                </View>
              ) : null}
            </View>
          ) : (
            <Text style={[styles.cardContent, { color: theme.textMuted }]}>No audio sample available</Text>
          )}
        </View>

        <View style={styles.detailCard}>
          <Text style={[styles.cardTitle, { color: theme.primary }]}>Complete Audio:</Text>
          {singleData?.completeAudioUrl ? (
            <View>
              <TouchableOpacity
                style={styles.audioButton}
                onPress={playPauseCompleteAudio}
              >
                <MaterialIcons
                  name={isPlayingComplete ? 'pause' : 'play-arrow'}
                  size={24}
                  color={theme.white}
                />
                <Text style={[styles.audioButtonText, { color: theme.white }]}>
                  {isPlayingComplete ? 'Pause Complete Audio' : 'Play Complete Audio'}
                </Text>
              </TouchableOpacity>
              {completeSound && completeDuration > 0 ? (
                <View style={styles.audioSliderBlock}>
                  <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={1}
                    value={completePosition / completeDuration}
                    onValueChange={handleCompleteSeek}
                    onSlidingStart={handleCompleteSlidingStart}
                    onSlidingComplete={handleCompleteSlidingComplete}
                    minimumTrackTintColor={theme.primary}
                    maximumTrackTintColor={theme.maximumTrackTintColor}
                    thumbTintColor={theme.primary}
                  />
                  <View style={styles.audioTimeRow}>
                    <Text style={[styles.audioTimeText, { color: theme.textMuted }]}>
                      {formatTimeMs(completePosition)}
                    </Text>
                    <Text style={[styles.audioTimeText, { color: theme.textMuted }]}>
                      {formatTimeMs(completeDuration)}
                    </Text>
                  </View>
                </View>
              ) : null}
            </View>
          ) : (
            <Text style={[styles.cardContent, { color: theme.textMuted }]}>No complete audio available</Text>
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
