import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, Image, Alert, Animated, ScrollView, AppState } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { moderateScale, verticalScale, horizontalScale } from '@/utils/responsiveSize';
import Slider from '@react-native-community/slider';
import { useTheme } from '@/providers/ThemeProvider';



const AudioPlayer = ({ 
  isVisible, 
  onClose, 
  audioUrl, 
  bookCover, 
  title, 
  author,
  authorAvatar
}) => {
  const { theme } = useTheme();
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [error, setError] = useState(null);
  const [isSeeking, setIsSeeking] = useState(false);
  
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
      setIsSeeking(false);

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
        setIsSeeking(false);
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
      // Only update position if not currently seeking
      if (!isSeeking) {
        setPosition(status.positionMillis);
      }
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
    if (sound && duration > 0) {
      setIsSeeking(true);
      const newPosition = value * duration;
      setPosition(newPosition);
    }
  };

  const handleSlidingStart = () => {
    setIsSeeking(true);
  };

  const handleSlidingComplete = async (value) => {
    if (sound && duration > 0) {
      const newPosition = value * duration;
      await sound.setPositionAsync(newPosition);
      setPosition(newPosition);
    }
    setIsSeeking(false);
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
      <View style={[styles.greenBg, { backgroundColor: theme.background }]}>
        {/* Concentric Circles */}
        <View style={styles.circlesBg} pointerEvents="none">
          <View style={[styles.circleLarge, { backgroundColor: theme.secondary }]} />
          <View style={[styles.circleMedium, { backgroundColor: theme.secondary }]} />
          <View style={[styles.circleSmall, { backgroundColor: theme.secondary }]} />
        </View>
        {/* Top Bar */}
        <View style={styles.topBar}>
                      <TouchableOpacity onPress={handleClose} style={styles.topIconBtn} activeOpacity={0.7}>
              <Ionicons name="chevron-back" size={28} color={theme.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.topIconBtn} activeOpacity={0.7}>
              <Ionicons name="notifications-outline" size={24} color={theme.text} />
            </TouchableOpacity>
        </View>
        {/* Main Content */}
        <View style={styles.contentWrap}>
          {/* Title & Author */}
          <View style={styles.titleBlock}>
            <Text style={[styles.bigTitle, { color: theme.text }]} numberOfLines={2}>{title}</Text>
            <View style={styles.authorRow}>
              <Image source={{ uri: authorAvatar }} style={styles.avatar} />
              <Text style={[styles.authorName, { color: theme.text }]}>{author}</Text>
            </View>
          </View>
          {/* Play Button */}
          <View style={styles.centerSection}>
            <TouchableOpacity 
              style={[styles.bigPlayButton, { backgroundColor: theme.background }]} 
              onPress={handlePlayPause}
              disabled={isBuffering}
              activeOpacity={0.8}
            >
              {isBuffering ? (
                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                  <Ionicons name="sync" size={48} color={theme.primary} />
                </Animated.View>
              ) : (
                <Ionicons 
                  name={isPlaying ? 'pause' : 'play'} 
                  size={48} 
                  color={theme.primary} 
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
        {/* Bottom Controls & Progress */}
        <View style={styles.bottomWrap}>
          <View style={styles.bottomRow}>
            <TouchableOpacity style={styles.bottomIconBtn}>
              <Ionicons name="settings-outline" size={24} color={theme.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.bottomIconBtn}>
              <Ionicons name="heart-outline" size={24} color={theme.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.bottomIconBtn}>
              <Ionicons name="share-social-outline" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>
          {/* Progress Bar */}
          <View style={styles.progressSection}>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              value={duration > 0 ? position / duration : 0}
              onValueChange={handleSeek}
              onSlidingStart={handleSlidingStart}
              onSlidingComplete={handleSlidingComplete}
              minimumTrackTintColor={theme.text}
              maximumTrackTintColor={theme.maximumTrackTintColor}
              thumbTintColor={theme.text}
            />
            <View style={styles.timeRow}>
              <Text style={[styles.timeText, { color: theme.text }]}>{formatTime(position)}</Text>
              <Text style={[styles.timeText, { color: theme.text }]}>{formatTime(duration)}</Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  greenBg: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  circlesBg: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 0,
  },
  circleLarge: {
    position: 'absolute',
    width: 600,
    height: 600,
    borderRadius: 300,
    opacity: 0.18,
  },
  circleMedium: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    opacity: 0.28,
  },
  circleSmall: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    opacity: 0.45,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 48,
    paddingHorizontal: 24,
    zIndex: 2,
  },
  topIconBtn: {
    padding: 4,
  },
  contentWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  titleBlock: {
    alignItems: 'center',
    marginBottom: 32,
  },
  bigTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    marginRight: 8,
    backgroundColor: '#d9d9d9',
  },
  authorName: {
    fontSize: 13,
    fontWeight: '400',
    opacity: 0.95,
  },
  centerSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
  },
  bigPlayButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomWrap: {
    width: '100%',
    paddingBottom: 24,
    zIndex: 2,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '80%',
    alignSelf: 'center',
    marginBottom: 12,
  },
  bottomIconBtn: {
    padding: 8,
  },
  progressSection: {
    width: '90%',
    alignSelf: 'center',
    marginTop: 0,
  },
  slider: {
    width: '100%',
    height: 18,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -2,
  },
  timeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '400',
    opacity: 0.9,
  },
});

export default AudioPlayer;