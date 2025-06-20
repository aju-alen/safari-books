import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, Image, Alert, Animated, ScrollView, AppState } from 'react-native';
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
  
  // New state for enhanced functionality
  const [isRepeat, setIsRepeat] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [timerOptions] = useState([15, 30, 45, 60, 90, 120]);
  const [selectedTimer, setSelectedTimer] = useState(null);
  const [timerId, setTimerId] = useState(null);

  // Animation refs
  const spinAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const coverScaleAnimation = useRef(new Animated.Value(1)).current;

  console.log(audioUrl, bookCover, title, author, 'audioUrl in playerrrr');

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        // Pause audio when app goes to background
        if (sound && isPlaying) {
          sound.pauseAsync();
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [sound, isPlaying]);

  // Handle modal visibility changes
  useEffect(() => {
    if (isVisible && audioUrl) {
      loadAudio();
    } else {
      // Stop and unload audio when modal is not visible
      stopAndUnloadAudio();
    }
    
    return () => {
      stopAndUnloadAudio();
    };
  }, [isVisible, audioUrl]);

  // Animation effects
  useEffect(() => {
    if (isBuffering) {
      Animated.loop(
        Animated.timing(spinAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinAnimation.setValue(0);
    }
  }, [isBuffering]);

  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnimation.setValue(1);
    }
  }, [isPlaying]);

  const loadAudio = async () => {
    if (!audioUrl) {
      setError('Audio URL is missing');
      Alert.alert('Error', 'Cannot play audio - source is missing');
      return;
    }

    try {
      setIsBuffering(true);
      setError(null);

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false, // Changed to false to stop background playback
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: false },
        onPlaybackStatusUpdate,
        true
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

  const stopAndUnloadAudio = async () => {
    try {
      if (sound) {
        // Stop the audio first
        await sound.stopAsync();
        // Then unload it
        await sound.unloadAsync();
        setSound(null);
        setIsPlaying(false);
        setPosition(0);
        setDuration(0);
      }
      // Clear any active timers
      clearTimer();
    } catch (error) {
      console.error('Error stopping/unloading audio:', error);
    }
  };

  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setDuration(status.durationMillis);
      setPosition(status.positionMillis);
      setIsPlaying(status.isPlaying);
      setIsBuffering(status.isBuffering);
      
      // Handle repeat
      if (isRepeat && status.didJustFinish) {
        sound?.replayAsync();
      }
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

  const handleRewind = async () => {
    if (sound) {
      const newPosition = Math.max(0, position - 10000); // 10 seconds back
      await sound.setPositionAsync(newPosition);
    }
  };

  const handleForward = async () => {
    if (sound) {
      const newPosition = Math.min(duration, position + 10000); // 10 seconds forward
      await sound.setPositionAsync(newPosition);
    }
  };

  const handleSkipBack = async () => {
    if (sound) {
      const newPosition = Math.max(0, position - 30000); // 30 seconds back
      await sound.setPositionAsync(newPosition);
    }
  };

  const handleSkipForward = async () => {
    if (sound) {
      const newPosition = Math.min(duration, position + 30000); // 30 seconds forward
      await sound.setPositionAsync(newPosition);
    }
  };

  const toggleRepeat = () => {
    setIsRepeat(!isRepeat);
  };

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    Alert.alert(
      isBookmarked ? 'Bookmark Removed' : 'Bookmark Added',
      isBookmarked ? 'Bookmark has been removed' : 'Current position has been bookmarked'
    );
  };

  const toggleTimer = () => {
    setShowTimer(!showTimer);
  };

  const setTimer = (minutes) => {
    clearTimer();
    if (minutes > 0) {
      const timer = setTimeout(() => {
        if (sound && isPlaying) {
          sound.pauseAsync();
          Alert.alert('Timer', 'Playback stopped by timer');
        }
        setSelectedTimer(null);
        setTimerId(null);
      }, minutes * 60 * 1000);
      
      setSelectedTimer(minutes);
      setTimerId(timer);
      setShowTimer(false);
    }
  };

  const clearTimer = () => {
    if (timerId) {
      clearTimeout(timerId);
      setTimerId(null);
    }
    setSelectedTimer(null);
  };

  const changePlaybackRate = () => {
    const rates = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
    const currentIndex = rates.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % rates.length;
    const newRate = rates[nextIndex];
    
    setPlaybackRate(newRate);
    if (sound) {
      sound.setRateAsync(newRate, true);
    }
  };

  const formatTime = (milliseconds) => {
    if (!milliseconds) return '0:00';
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleClose = async () => {
    await stopAndUnloadAudio();
    onClose();
  };

  const spin = spinAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.blurBackground} />
        
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="chevron-down" size={28} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Now Playing</Text>
          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="ellipsis-horizontal" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.coverWrapper}>
            <Animated.View 
              style={[
                styles.coverContainer,
                { transform: [{ scale: pulseAnimation }] }
              ]}
            >
              <Image source={{ uri: bookCover }} style={styles.coverImage} />
              <View style={styles.coverGlow} />
              <View style={styles.coverOverlay} />
            </Animated.View>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
            <Text style={styles.author} numberOfLines={1}>{author}</Text>
            {playbackRate !== 1.0 && (
              <View style={styles.rateIndicator}>
                <Text style={styles.rateText}>{playbackRate}x</Text>
              </View>
            )}
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
            />
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>{formatTime(position)}</Text>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
          </View>

          <View style={styles.controls}>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleSkipBack}>
              <Ionicons name="play-back" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.rewindButton} onPress={handleRewind}>
              <Ionicons name="play-skip-back" size={24} color={COLORS.text} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.playButton} 
              onPress={handlePlayPause}
              disabled={isBuffering}
            >
              <View style={styles.playButtonInner}>
                {isBuffering ? (
                  <Animated.View style={{ transform: [{ rotate: spin }] }}>
                    <Ionicons name="sync" size={36} color={COLORS.text} />
                  </Animated.View>
                ) : (
                  <Ionicons 
                    name={isPlaying ? 'pause' : 'play'} 
                    size={36} 
                    color={COLORS.text} 
                  />
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.forwardButton} onPress={handleForward}>
              <Ionicons name="play-skip-forward" size={24} color={COLORS.text} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.secondaryButton} onPress={handleSkipForward}>
              <Ionicons name="play-forward" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.additionalControls}>
            <TouchableOpacity 
              style={[styles.iconButton, isRepeat && styles.iconButtonActive]}
              onPress={toggleRepeat}
            >
              <Ionicons name="repeat" size={20} color={isRepeat ? COLORS.accent : COLORS.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.iconButton, selectedTimer && styles.iconButtonActive]}
              onPress={toggleTimer}
            >
              <Ionicons name="timer-outline" size={20} color={selectedTimer ? COLORS.accent : COLORS.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.iconButton} onPress={changePlaybackRate}>
              <Text style={styles.speedText}>{playbackRate}x</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.iconButton, isBookmarked && styles.iconButtonActive]}
              onPress={toggleBookmark}
            >
              <Ionicons 
                name={isBookmarked ? "bookmark" : "bookmark-outline"} 
                size={20} 
                color={isBookmarked ? COLORS.accent : COLORS.textSecondary} 
              />
            </TouchableOpacity>
          </View>

          {showTimer && (
            <View style={styles.timerContainer}>
              <Text style={styles.timerTitle}>Set Sleep Timer</Text>
              <View style={styles.timerOptions}>
                {timerOptions.map((minutes) => (
                  <TouchableOpacity
                    key={minutes}
                    style={[
                      styles.timerOption,
                      selectedTimer === minutes && styles.timerOptionActive
                    ]}
                    onPress={() => setTimer(minutes)}
                  >
                    <Text style={[
                      styles.timerOptionText,
                      selectedTimer === minutes && styles.timerOptionTextActive
                    ]}>
                      {minutes}m
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={styles.timerOption}
                  onPress={clearTimer}
                >
                  <Text style={styles.timerOptionText}>Off</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          
          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}
        </ScrollView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: horizontalScale(24),
    paddingTop: verticalScale(40),
    paddingBottom: verticalScale(20),
    backgroundColor: 'transparent',
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: horizontalScale(24),
    paddingBottom: verticalScale(40),
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
    width: horizontalScale(280),
    height: verticalScale(280),
    borderRadius: moderateScale(20),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  coverGlow: {
    position: 'absolute',
    width: horizontalScale(280),
    height: verticalScale(280),
    borderRadius: moderateScale(20),
    backgroundColor: 'transparent',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 30,
    elevation: 25,
    zIndex: -1,
  },
  coverOverlay: {
    position: 'absolute',
    width: horizontalScale(280),
    height: verticalScale(280),
    borderRadius: moderateScale(20),
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  infoContainer: {
    alignItems: 'center',
    marginTop: verticalScale(20),
    marginBottom: verticalScale(20),
  },
  title: {
    color: COLORS.text,
    fontSize: moderateScale(24),
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
  rateIndicator: {
    backgroundColor: 'rgba(236, 72, 153, 0.2)',
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(4),
    borderRadius: moderateScale(12),
    marginTop: verticalScale(8),
  },
  rateText: {
    color: COLORS.accent,
    fontSize: moderateScale(12),
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: verticalScale(20),
    marginBottom: verticalScale(20),
    paddingHorizontal: horizontalScale(5),
  },
  slider: {
    width: '100%',
    height: verticalScale(40),
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
    marginTop: verticalScale(20),
    marginBottom: verticalScale(20),
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
    marginTop: verticalScale(20),
    marginBottom: verticalScale(20),
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
  speedText: {
    color: COLORS.textSecondary,
    fontSize: moderateScale(12),
    fontWeight: '600',
  },
  timerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: moderateScale(16),
    padding: moderateScale(20),
    marginTop: verticalScale(20),
    marginBottom: verticalScale(20),
  },
  timerTitle: {
    color: COLORS.text,
    fontSize: moderateScale(16),
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: moderateScale(16),
  },
  timerOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: moderateScale(8),
  },
  timerOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(8),
    borderRadius: moderateScale(20),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  timerOptionActive: {
    backgroundColor: 'rgba(236, 72, 153, 0.2)',
    borderColor: 'rgba(236, 72, 153, 0.4)',
  },
  timerOptionText: {
    color: COLORS.textSecondary,
    fontSize: moderateScale(14),
    fontWeight: '500',
  },
  timerOptionTextActive: {
    color: COLORS.accent,
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