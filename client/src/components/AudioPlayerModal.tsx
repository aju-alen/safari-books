import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, Image, Alert } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { moderateScale, verticalScale, horizontalScale } from '@/utils/responsiveSize';
import Slider from '@react-native-community/slider';

const COLORS = {
  primary: '#6366F1',
  secondary: '#A5A6F6',
  background: '#000000',
  text: '#FFFFFF',
  darkGray: '#333333',
};

const AudioPlayer = ({ 
  isVisible, 
  onClose, 
  audioUrl, 
  bookCover, 
  title, 
  author 
}) => {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [sliderValue, setSliderValue] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [error, setError] = useState(null);

console.log(audioUrl, 
    bookCover, 
    title, 
    author );


  useEffect(() => {
    if (isVisible && audioUrl) {
      loadAudio();
    }
    return () => {
      unloadAudio();
    };
  }, [isVisible, audioUrl]);

  const loadAudio = async () => {
    if (!audioUrl) {
      setError('Audio URL is missing');
      Alert.alert('Error', 'Cannot play audio - source is missing');
      return;
    }

    try {
      setIsBuffering(true);
      setError(null);

      // Ensure proper audio mode is set
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: false },
        onPlaybackStatusUpdate,
        true  // Set downloadFirst to true for better buffering
      );
      
      setSound(newSound);
      setIsBuffering(false);
    } catch (error) {
      console.error('Error loading audio:', error);
      setError(error.message);
      setIsBuffering(false);
      Alert.alert('Error', 'Failed to load audio file');
    }
  };

  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setDuration(status.durationMillis);
      setPosition(status.positionMillis);
      setIsPlaying(status.isPlaying);
      setIsBuffering(status.isBuffering);
    } else if (status.error) {
      console.error(`Playback error: ${status.error}`);
      setError(status.error);
    }
  };
  const unloadAudio = async () => {
    try {
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }
    } catch (error) {
      console.error('Error unloading audio:', error);
    }
  };

  const handlePlayPause = async () => {
    if (!sound) {
      await loadAudio();
      return;
    }

    try {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    } catch (error) {
      console.error('Error playing/pausing:', error);
      Alert.alert('Error', 'Failed to play audio');
    }
  };


  const handleSeek = async (value) => {
    if (sound) {
      await sound.setPositionAsync(value * duration);
    }
    setSliderValue(value);
  };

  const formatTime = (milliseconds) => {
    if (!milliseconds) return '0:00';
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleClose = async () => {
    await unloadAudio();
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="chevron-down" size={30} color={COLORS.text} />
          </TouchableOpacity>

          <View style={styles.coverContainer}>
            <Image source={{ uri: bookCover }} style={styles.coverImage} />
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
            <Text style={styles.author} numberOfLines={1}>{author}</Text>
          </View>

          <View style={styles.progressContainer}>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              value={duration ? position / duration : 0}
              onValueChange={handleSeek}
              minimumTrackTintColor={COLORS.primary}
              maximumTrackTintColor={COLORS.darkGray}
              thumbTintColor={COLORS.primary}
            />
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>{formatTime(position)}</Text>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
          </View>

          <View style={styles.controls}>
            <TouchableOpacity style={styles.secondaryButton}>
              <Ionicons name="play-skip-back" size={24} color={COLORS.text} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.playButton} 
              onPress={handlePlayPause}
              disabled={isBuffering}
            >
              <Ionicons 
                name={isBuffering ? 'sync' : isPlaying ? 'pause' : 'play'} 
                size={40} 
                color={COLORS.text} 
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton}>
              <Ionicons name="play-skip-forward" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  content: {
    flex: 1,
    paddingTop: verticalScale(40),
    paddingHorizontal: horizontalScale(20),
  },
  closeButton: {
    alignSelf: 'center',
    padding: moderateScale(10),
  },
  coverContainer: {
    alignItems: 'center',
    marginTop: verticalScale(40),
  },
  coverImage: {
    width: horizontalScale(300),
    height: verticalScale(300),
    borderRadius: moderateScale(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },

    shadowRadius: 8,
  },
  infoContainer: {
    alignItems: 'center',
    marginTop: verticalScale(40),
  },
  title: {
    color: COLORS.text,
    fontSize: moderateScale(24),
    fontWeight: '700',
    marginBottom: verticalScale(8),
  },
  author: {
    color: COLORS.secondary,
    fontSize: moderateScale(16),
  },
  progressContainer: {
    marginTop: verticalScale(40),
  },
  slider: {
    width: '100%',
    height: verticalScale(40),
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: verticalScale(-10),
  },
  timeText: {
    color: COLORS.secondary,
    fontSize: moderateScale(12),
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: verticalScale(20),
    gap: horizontalScale(40),
  },
  playButton: {
    width: horizontalScale(80),
    height: horizontalScale(80),
    borderRadius: horizontalScale(40),
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButton: {
    width: horizontalScale(50),
    height: horizontalScale(50),
    borderRadius: horizontalScale(25),
    backgroundColor: COLORS.darkGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: verticalScale(10),
    fontSize: moderateScale(14),
  },
});

export default AudioPlayer;