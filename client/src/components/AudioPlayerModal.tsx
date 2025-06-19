import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, Image, Alert } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { moderateScale, verticalScale, horizontalScale } from '@/utils/responsiveSize';
import Slider from '@react-native-community/slider';

const COLORS = {
  primary: '#8B5CF6',      // Vibrant purple
  secondary: '#C4B5FD',    // Light purple
  accent: '#EC4899',       // Pink accent
  background: '#000000',
  text: '#FFFFFF',
  textSecondary: '#D1D5DB',
  darkGray: '#1F2937',
  lightGray: 'rgba(255, 255, 255, 0.1)',
  gradient: {
    start: '#8B5CF6',      // Vibrant purple
    end: '#EC4899',        // Pink
  },
  overlay: 'rgba(17, 24, 39, 0.95)', // Dark overlay with higher opacity
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
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.blurBackground} />
        
        <View style={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Ionicons name="chevron-down" size={28} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Now Playing</Text>
            <TouchableOpacity style={styles.menuButton}>
              <Ionicons name="ellipsis-horizontal" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.coverWrapper}>
            <View style={styles.coverContainer}>
              <Image source={{ uri: bookCover }} style={styles.coverImage} />
              <View style={styles.coverGlow} />
            </View>
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
              minimumTrackTintColor={COLORS.accent}
              maximumTrackTintColor={COLORS.lightGray}
              thumbTintColor={COLORS.text}
              thumbStyle={styles.sliderThumb}
            />
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>{formatTime(position)}</Text>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
          </View>

          <View style={styles.controls}>
            <TouchableOpacity style={styles.secondaryButton}>
              <Ionicons name="play-back" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.rewindButton}>
              <Ionicons name="play-skip-back" size={24} color={COLORS.text} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.playButton} 
              onPress={handlePlayPause}
              disabled={isBuffering}
            >
              <View style={styles.playButtonInner}>
                {isBuffering ? (
                  <Ionicons name="sync" size={36} color={COLORS.text} style={styles.spinningIcon} />
                ) : (
                  <Ionicons 
                    name={isPlaying ? 'pause' : 'play'} 
                    size={36} 
                    color={COLORS.text} 
                  />
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.forwardButton}>
              <Ionicons name="play-skip-forward" size={24} color={COLORS.text} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.secondaryButton}>
              <Ionicons name="play-forward" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.additionalControls}>
            <TouchableOpacity style={[styles.iconButton, styles.iconButtonActive]}>
              <Ionicons name="repeat" size={20} color={COLORS.accent} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="timer-outline" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="speedometer-outline" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="bookmark-outline" size={20} color={COLORS.textSecondary} />
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
    backgroundColor: 'transparent',
  },
  blurBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
  },
  content: {
    flex: 1,
    paddingTop: verticalScale(40),
    paddingHorizontal: horizontalScale(24),
    justifyContent: 'space-between',
    paddingBottom: verticalScale(50),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: verticalScale(20),
  },
  headerTitle: {
    color: COLORS.textSecondary,
    fontSize: moderateScale(16),
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  closeButton: {
    padding: moderateScale(8),
    borderRadius: moderateScale(20),
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  menuButton: {
    padding: moderateScale(8),
    borderRadius: moderateScale(20),
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  coverWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: verticalScale(20),
  },
  coverContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverImage: {
    width: horizontalScale(300),
    height: verticalScale(300),
    borderRadius: moderateScale(20),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  coverGlow: {
    position: 'absolute',
    width: horizontalScale(300),
    height: verticalScale(300),
    borderRadius: moderateScale(20),
    backgroundColor: 'transparent',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },

    shadowRadius: 30,
    elevation: 25,
    zIndex: -1,
  },
  infoContainer: {
    alignItems: 'center',
    marginTop: verticalScale(30),
  },
  title: {
    color: COLORS.text,
    fontSize: moderateScale(28),
    fontWeight: '700',
    marginBottom: verticalScale(8),
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  author: {
    color: COLORS.secondary,
    fontSize: moderateScale(16),
    opacity: 0.9,
    letterSpacing: 0.5,
  },
  progressContainer: {
    marginTop: verticalScale(40),
    paddingHorizontal: horizontalScale(5),
  },
  slider: {
    width: '100%',
    height: verticalScale(40),
  },
  sliderThumb: {
    width: horizontalScale(12),
    height: verticalScale(12),
    borderRadius: moderateScale(6),
    backgroundColor: COLORS.accent,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: verticalScale(-15),
  },
  timeText: {
    color: COLORS.textSecondary,
    fontSize: moderateScale(12),
    fontWeight: '500',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: verticalScale(30),
  },
  playButton: {
    width: horizontalScale(80),
    height: horizontalScale(80),
    borderRadius: horizontalScale(40),
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: horizontalScale(20),
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  playButtonInner: {
    width: horizontalScale(70),
    height: horizontalScale(70),
    borderRadius: horizontalScale(35),
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },

    shadowRadius: 15,
    elevation: 10,
  },
  secondaryButton: {
    width: horizontalScale(40),
    height: horizontalScale(40),
    borderRadius: horizontalScale(20),
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  rewindButton: {
    width: horizontalScale(56),
    height: horizontalScale(56),
    borderRadius: horizontalScale(28),
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: horizontalScale(10),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  forwardButton: {
    width: horizontalScale(56),
    height: horizontalScale(56),
    borderRadius: horizontalScale(28),
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: horizontalScale(10),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  additionalControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: verticalScale(40),
    gap: horizontalScale(30),
  },
  iconButton: {
    width: horizontalScale(44),
    height: horizontalScale(44),
    borderRadius: horizontalScale(22),
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  iconButtonActive: {
    backgroundColor: 'rgba(236, 72, 153, 0.15)',
    borderColor: 'rgba(236, 72, 153, 0.3)',
  },
  spinningIcon: {
    opacity: 0.8,
  },
  errorText: {
    color: COLORS.accent,
    textAlign: 'center',
    marginTop: verticalScale(20),
    fontSize: moderateScale(14),
    backgroundColor: 'rgba(236, 72, 153, 0.15)',
    padding: moderateScale(10),
    borderRadius: moderateScale(8),
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.3)',
  },
});

export default AudioPlayer;