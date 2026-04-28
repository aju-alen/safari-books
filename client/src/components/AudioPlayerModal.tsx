import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  Image,
  Alert,
  Animated,
  ScrollView,
  Pressable,
  type LayoutChangeEvent,
} from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { moderateScale, verticalScale, horizontalScale } from '@/utils/responsiveSize';
import Slider from '@react-native-community/slider';
import { useTheme } from '@/providers/ThemeProvider';
import { useAudio } from '@/store/AudioContext';
import { usePlaybackQueueStore } from '@/store/playbackQueueStore';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { axiosWithAuth } from '@/utils/customAxios';
import { ipURL } from '@/utils/backendURL';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
type PlayerMode = 'audio' | 'text';



/** API `timeStamp[]` rows: one entry per narration section (segment). `s`/`e`/`d` are ms on the combined audio; `p` is full plain text for that section (not word-level). */
type SegmentTimeStamp = {
  i?: number;
  s?: number;
  e?: number;
  d?: number;
  ch?: string;
  sl?: string;
  p?: string;
  startMs?: number;
  endMs?: number;
  chapterHeading?: string;
  segmentLabel?: string;
  /** @deprecated Prefer API field `p` — full section text */
  textPreview?: string;
};

const AudioPlayer = ({ 
  isVisible, 
  onClose, 
  audioUrl, 
  bookCover, 
  title, 
  author,
  authorAvatar,
  bookId,
  timeStamp = [],
  language,
  rating,
}) => {
  const { theme, isDarkMode } = useTheme();
  const {
    syncPlaybackState,
    registerActiveSound,
    unregisterIfMatches,
    getActiveSoundForBook,
    unloadActiveSound,
  } = useAudio();
  const queueItems = usePlaybackQueueStore((s) => s.items);
  const removeFromQueue = usePlaybackQueueStore((s) => s.removeFromQueue);
  const moveQueueItemUp = usePlaybackQueueStore((s) => s.moveUp);
  const [sound, setSound] = useState(null);
  const soundRef = useRef(null);
  soundRef.current = sound;
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [error, setError] = useState(null);
  const [isSeeking, setIsSeeking] = useState(false);
  const [isSavingProgress, setIsSavingProgress] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [savedProgressLoaded, setSavedProgressLoaded] = useState(false);
  const [savedTimestamp, setSavedTimestamp] = useState(null);
  
  // New state for enhanced functionality
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [timerOptions] = useState([15, 30, 45, 60, 90, 120]);
  const [selectedTimer, setSelectedTimer] = useState(null);
  const [timerId, setTimerId] = useState(null);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState<number>(-1);
  const [playerMode, setPlayerMode] = useState<PlayerMode>('audio');
  const [showReaderSettings, setShowReaderSettings] = useState(false);
  const [readerFontSize, setReaderFontSize] = useState(20);
  const [readerBgIndex, setReaderBgIndex] = useState(0);

  const insets = useSafeAreaInsets();
  const loadedSessionRef = useRef<{ url: string | null; bookId: string | null }>({
    url: null,
    bookId: null,
  });

  // Animation refs
  const spinAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const coverScaleAnimation = useRef(new Animated.Value(1)).current;
  const previousActiveSegmentRef = useRef<number>(-1);
  const textModeScrollRef = useRef<ScrollView | null>(null);
  /** Y offset of each section within the ScrollView content (from onLayout). */
  const sectionScrollYRef = useRef<(number | undefined)[]>([]);
  const activeSegmentIndexRef = useRef(activeSegmentIndex);
  activeSegmentIndexRef.current = activeSegmentIndex;

  const normalizedSegments = useMemo(
    () =>
      (Array.isArray(timeStamp) ? timeStamp : [])
        .map((segment: SegmentTimeStamp, index: number) => {
          const start = Number(segment.s ?? segment.startMs ?? 0);
          const end = Number(segment.e ?? segment.endMs ?? 0);
          return {
            key: Number(segment.i ?? index + 1),
            startMs: Number.isFinite(start) ? start : 0,
            endMs: Number.isFinite(end) ? end : 0,
            chapterHeading: segment.ch ?? segment.chapterHeading ?? '',
            segmentLabel: segment.sl ?? segment.segmentLabel ?? `Segment ${index + 1}`,
            sectionText: segment.p ?? segment.textPreview ?? ''
          };
        })
        .filter((segment) => segment.endMs > segment.startMs)
        .sort((a, b) => a.startMs - b.startMs),
    [timeStamp]
  );

  const computeSegmentIndex = useCallback(
    (ms: number) => {
      if (normalizedSegments.length === 0) return -1;
      for (let i = 0; i < normalizedSegments.length; i++) {
        const s = normalizedSegments[i];
        if (ms >= s.startMs && ms < s.endMs) return i;
      }
      if (ms >= normalizedSegments[normalizedSegments.length - 1].endMs) {
        return normalizedSegments.length - 1;
      }
      let last = -1;
      for (let i = 0; i < normalizedSegments.length; i++) {
        if (normalizedSegments[i].startMs <= ms) last = i;
      }
      return last;
    },
    [normalizedSegments]
  );

  const computeSegmentIndexRef = useRef(computeSegmentIndex);
  computeSegmentIndexRef.current = computeSegmentIndex;

  const readerBackgroundOptions = useMemo(
    () => [theme.background, theme.gray2, theme.lightWhite] as const,
    [theme.background, theme.gray2, theme.lightWhite]
  );

  const readerPageBackground =
    playerMode === 'text' ? readerBackgroundOptions[readerBgIndex] : null;

  const scrollTextToActiveSection = useCallback((animated: boolean) => {
    if (playerMode !== 'text') return;
    const idx = activeSegmentIndexRef.current;
    if (idx < 0) return;
    const y = sectionScrollYRef.current[idx];
    if (typeof y !== 'number' || Number.isNaN(y)) return;
    const padding = 12;
    textModeScrollRef.current?.scrollTo({
      y: Math.max(0, y - padding),
      animated,
    });
  }, [playerMode]);

  useEffect(() => {
    sectionScrollYRef.current = [];
  }, [timeStamp]);

  useEffect(() => {
    if (playerMode === 'text') {
      sectionScrollYRef.current = [];
    }
  }, [playerMode]);

  const onTextSectionLayout = useCallback(
    (segIdx: number, e: LayoutChangeEvent) => {
      const y = e.nativeEvent.layout.y;
      sectionScrollYRef.current[segIdx] = y;
      if (segIdx === activeSegmentIndexRef.current && playerMode === 'text') {
        requestAnimationFrame(() => {
          scrollTextToActiveSection(true);
        });
      }
    },
    [playerMode, scrollTextToActiveSection]
  );

  useEffect(() => {
    if (playerMode !== 'text') return;
    if (activeSegmentIndex < 0) return;
    const tryScroll = () => {
      const y = sectionScrollYRef.current[activeSegmentIndex];
      if (typeof y === 'number') {
        scrollTextToActiveSection(true);
        return true;
      }
      return false;
    };
    if (tryScroll()) return;
    const id = requestAnimationFrame(() => {
      if (!tryScroll()) {
        requestAnimationFrame(() => tryScroll());
      }
    });
    return () => cancelAnimationFrame(id);
  }, [activeSegmentIndex, playerMode, scrollTextToActiveSection, readerFontSize]);

  // Progress saving function
  const saveProgress = useCallback(async () => {
    console.log(isSavingProgress, 'isSavingProgress', bookId, 'bookId');
    
    if (!bookId || isSavingProgress) return;
    
    try {
      setIsSavingProgress(true);
      
      // Determine status based on position and duration
      let status: 'NOT_STARTED' | 'IN_PROGRESS' | 'FINISHED' = 'NOT_STARTED';
      
      if (position > 0) {
        if (duration > 0 && position >= duration - 1000) { // Within 1 second of end
          status = 'FINISHED';
        } else {
          status = 'IN_PROGRESS';
        }
      }
      
      const timestampInSeconds = Math.floor(position / 1000);
      
      await axiosWithAuth.put(`${ipURL}/api/library/update-status/${bookId}`, {
        status: status,
        timestamp: timestampInSeconds
      });
      
      console.log('Progress saved:', { position, duration, status });
    } catch (error) {
      console.error('Failed to save progress:', error);
    } finally {
      setIsSavingProgress(false);
    }
  }, [bookId, position, duration, isSavingProgress]);

  // Save progress when screen loses focus
  useFocusEffect(
    useCallback(() => {
      return () => {
        if (position > 0 && bookId) {
          console.log('Saving progress when screen loses focus');
          saveProgress();
        }
      };
    }, [isLoading])
  );

  // Reset saved progress when bookId changes
  useEffect(() => {
    setSavedProgressLoaded(false);
    setSavedTimestamp(null);
  }, [bookId]);

  // Open full player: load audio or reattach to session kept for mini player
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!isVisible || !audioUrl) return;

      const bid = bookId != null ? String(bookId) : '';
      const existing = bid ? getActiveSoundForBook(bid) : null;
      if (existing) {
        setSound(existing);
        try {
          const st = await existing.getStatusAsync();
          if (st.isLoaded) {
            setDuration(st.durationMillis ?? 0);
            setPosition(st.positionMillis ?? 0);
            setIsPlaying(!!st.isPlaying);
            syncPlaybackState(!!st.isPlaying);
          }
        } catch {
          /* ignore */
        }
        loadedSessionRef.current = { url: audioUrl, bookId: bid };
        return;
      }

      if (
        soundRef.current &&
        loadedSessionRef.current.url === audioUrl &&
        loadedSessionRef.current.bookId === bid
      ) {
        return;
      }

      const savedTimestamp = await loadSavedProgress();
      if (cancelled) return;
      await loadAudio(savedTimestamp);
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [isVisible, audioUrl, bookId]);

  // When full player is hidden: minimize only (keep playback + mini bar)
  useEffect(() => {
    if (isVisible) return;
    setSavedProgressLoaded(false);
    setSavedTimestamp(null);
    setActiveSegmentIndex(-1);
    previousActiveSegmentRef.current = -1;
    setPlayerMode('audio');
    setShowReaderSettings(false);
  }, [isVisible]);

  // Periodic progress saving during playback - every 20 seconds
  // useEffect(() => {
  //   let intervalId = null;
    
  //   if (isPlaying && bookId && position > 0) {
  //     intervalId = setInterval(() => {
  //       console.log('Periodic progress save (20 seconds)');
  //       saveProgress();
  //     }, 20000); // Save every 20 seconds
  //   }
    
  //   return () => {
  //     if (intervalId) {
  //       clearInterval(intervalId);
  //     }
  //   };
  // }, [isPlaying, bookId, position, saveProgress]);

  // Load saved progress from database
  const loadSavedProgress = async () => {
    if (!bookId) return null;
    
    // Return cached result if already loaded
    if (savedProgressLoaded && savedTimestamp) {
      return savedTimestamp;
    }
    
    try {
      const response = await axiosWithAuth.get(`${ipURL}/api/library/status/${bookId}`);
      if (response.data && response.data.library && response.data.library.timestamp > 0) {
        const timestamp = response.data.library.timestamp * 1000; // Convert seconds to milliseconds
        console.log('Loaded saved progress:', response.data.library, 'timestamp in ms:', timestamp);
        setSavedTimestamp(timestamp);
        setSavedProgressLoaded(true);
        return timestamp;
      }
    } catch (error) {
      console.error('Failed to load saved progress:', error);
    }
    return null;
  };

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

  const loadAudio = async (savedTimestamp = null) => {
    if (!audioUrl) {
      setError('Audio URL is missing');
      Alert.alert('Error', 'Cannot play audio - source is missing');
      return;
    }

    try {
      clearTimer();
      const prev = soundRef.current;
      if (prev) {
        try {
          await unregisterIfMatches(prev);
          await prev.stopAsync();
          await prev.unloadAsync();
        } catch {
          /* ignore */
        }
        setSound(null);
      }
      await unloadActiveSound();

      setIsBuffering(true);
      setError(null);
      setIsSeeking(false);

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
        true
      );

      setSound(newSound);
      registerActiveSound(newSound, {
        title,
        author,
        coverImage: bookCover,
        bookId: bookId != null ? String(bookId) : undefined,
      });
      loadedSessionRef.current = {
        url: audioUrl,
        bookId: bookId != null ? String(bookId) : '',
      };
      setIsBuffering(false);

      if (savedTimestamp && savedTimestamp > 0) {
        await newSound.setPositionAsync(savedTimestamp);
        setPosition(savedTimestamp);
      }
    } catch (error) {
      console.error('Error loading audio:', error);
      setError(error.message);
      setIsBuffering(false);
      Alert.alert('Error', 'Failed to load audio file');
    }
  };

  const stopAndUnloadAudio = async () => {
    clearTimer();
    const s = soundRef.current;
    try {
      if (s) {
        await unregisterIfMatches(s);
        try {
          await s.stopAsync();
          await s.unloadAsync();
        } catch {
          /* ignore */
        }
        setSound(null);
        setIsPlaying(false);
        setPosition(0);
        setDuration(0);
        setIsSeeking(false);
      }
      loadedSessionRef.current = { url: null, bookId: null };
      syncPlaybackState(false);
    } catch (error) {
      console.error('Error stopping/unloading audio:', error);
    }
  };

  const advanceToNextQueuedBook = async () => {
    const next = usePlaybackQueueStore.getState().shiftNext();
    if (!next) return false;
    await stopAndUnloadAudio();
    onClose();
    router.replace(`/(tabs)/home/${next.id}?openPlayer=1`);
    return true;
  };

  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setDuration(status.durationMillis);
      if (!isSeeking) {
        setPosition(status.positionMillis);
      }
      if (normalizedSegments.length > 0) {
        const currentPosition = status.positionMillis ?? 0;
        const foundIndex = computeSegmentIndexRef.current(currentPosition);
        if (foundIndex !== previousActiveSegmentRef.current) {
          previousActiveSegmentRef.current = foundIndex;
          setActiveSegmentIndex(foundIndex);
        }
      }
      setIsPlaying(status.isPlaying);
      syncPlaybackState(status.isPlaying);
      setIsBuffering(status.isBuffering);

      if (status.didJustFinish) {
        syncPlaybackState(false);
        void (async () => {
          const advanced = await advanceToNextQueuedBook();
          if (!advanced) {
            await stopAndUnloadAudio();
            onClose();
          }
        })();
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
      // Load saved progress when creating new sound
      const savedTimestamp = await loadSavedProgress();
      await loadAudio(savedTimestamp);
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
      setPosition(newPosition);
    }
  };

  const handleForward = async () => {
    if (sound) {
      const newPosition = Math.min(duration, position + 10000); // 10 seconds forward
      await sound.setPositionAsync(newPosition);
      setPosition(newPosition);
    }
  };

  const handleSkipBack = async () => {
    if (sound) {
      const newPosition = Math.max(0, position - 30000); // 30 seconds back
      await sound.setPositionAsync(newPosition);
      setPosition(newPosition);
    }
  };

  const handleSkipForward = async () => {
    if (sound) {
      const newPosition = Math.min(duration, position + 30000); // 30 seconds forward
      await sound.setPositionAsync(newPosition);
      setPosition(newPosition);
    }
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

  const handleMinimize = async () => {
    if (position > 0 && bookId) {
      await saveProgress();
    }
    onClose();
  };

  const handlePlayNextInQueue = () => {
    void (async () => {
      const peeked = usePlaybackQueueStore.getState().peekNext();
      if (!peeked) {
        Alert.alert(
          'Queue',
          'No books in your queue. Add titles from a book page when full audio is available.'
        );
        return;
      }
      if (position > 0 && bookId) {
        await saveProgress();
      }
      await advanceToNextQueuedBook();
    })();
  };

  const seekToMs = useCallback(
    async (ms: number) => {
      if (!sound) return;
      try {
        setIsSeeking(true);
        await sound.setPositionAsync(ms);
        setPosition(ms);
      } catch (error) {
        console.error('Failed to seek:', error);
      } finally {
        setIsSeeking(false);
      }
    },
    [sound]
  );

  const handleSegmentPress = (segmentStartMs: number) => {
    void seekToMs(segmentStartMs);
  };

  const spin = spinAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const mainBgColor =
    playerMode === 'text' && readerPageBackground ? readerPageBackground : theme.background;

  const audioDockPillBg = !isDarkMode ? theme.text : theme.tabs;
  const audioDockIconColor = !isDarkMode ? theme.background : theme.text;

  const highText = theme.text;
  const lowText = theme.textMuted;

  const playBarRow =
    playerMode === 'text' ? (
      <View style={styles.textModeTransport}>
        <TouchableOpacity onPress={handleRewind} style={styles.transportBtn} activeOpacity={0.7}>
          <Ionicons name="play-skip-back" size={28} color={theme.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.textModeMainPlay, { backgroundColor: theme.tabs }]}
          onPress={handlePlayPause}
          disabled={isBuffering}
          activeOpacity={0.8}
        >
          {isBuffering ? (
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <Ionicons name="sync" size={32} color={theme.primary} />
            </Animated.View>
          ) : (
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={36}
              color={theme.primary}
            />
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={handleForward} style={styles.transportBtn} activeOpacity={0.7}>
          <Ionicons name="play-skip-forward" size={28} color={theme.text} />
        </TouchableOpacity>
      </View>
    ) : null;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={handleMinimize}
    >
      <View style={[styles.greenBg, { backgroundColor: mainBgColor }]}>
        <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 12) + 4 }]}>
          <TouchableOpacity onPress={handleMinimize} style={styles.topIconBtn} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={28} color={theme.text} />
          </TouchableOpacity>
          <View style={styles.modeSwitchWrap}>
            <View style={[styles.modeSwitch, { backgroundColor: theme.secondary }]}>
              <Pressable
                onPress={() => setPlayerMode('audio')}
                style={({ pressed }) => [
                  styles.modePill,
                  playerMode === 'audio' && { backgroundColor: theme.tabs },
                  pressed && { opacity: 0.9 },
                ]}
              >
                <Text
                  style={[
                    styles.modePillText,
                    { color: playerMode === 'audio' ? theme.text : theme.textMuted },
                  ]}
                >
                  Audio
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setPlayerMode('text')}
                style={({ pressed }) => [
                  styles.modePill,
                  playerMode === 'text' && { backgroundColor: theme.tabs },
                  pressed && { opacity: 0.9 },
                ]}
              >
                <Text
                  style={[
                    styles.modePillText,
                    { color: playerMode === 'text' ? theme.text : theme.textMuted },
                  ]}
                >
                  Text
                </Text>
              </Pressable>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => setShowReaderSettings(true)}
            style={styles.topIconBtn}
            activeOpacity={0.7}
            accessibilityLabel="Reader settings"
          >
            <Ionicons name="settings-outline" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        {playerMode === 'audio' ? (
          <>
            <ScrollView
              style={styles.audioScroll}
              contentContainerStyle={[
                styles.audioScrollInner,
                { paddingBottom: verticalScale(200) },
              ]}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <View style={styles.audioHero}>
                <View style={styles.vinylStage}>
                  <View
                    style={[styles.vinylRingOuter, { backgroundColor: theme.gray2, borderColor: theme.maximumTrackTintColor }]}
                  />
                  <View style={[styles.vinylRingMid, { borderColor: `${String(theme.primary)}35` }]} />
                  <View style={styles.audioCoverWrap}>
                    <Image source={{ uri: bookCover }} style={styles.audioCoverImage} resizeMode="contain" />
                  </View>
                </View>

                <View style={styles.audioMetaRow}>
                  {typeof rating === 'number' && !Number.isNaN(rating) && rating > 0 ? (
                    <View style={styles.audioMetaChip}>
                      <Ionicons name="star" size={16} color={theme.primary} />
                      <Text style={[styles.audioMetaChipText, { color: theme.text }]}>{rating.toFixed(1)}</Text>
                    </View>
                  ) : null}
                  {language ? (
                    <View style={styles.audioMetaChip}>
                      <Ionicons name="globe-outline" size={16} color={theme.primary} />
                      <Text style={[styles.audioMetaChipText, { color: theme.text }]}>{language}</Text>
                    </View>
                  ) : null}
                  <View style={styles.audioMetaChip}>
                    <Ionicons name="mic-outline" size={16} color={theme.primary} />
                    <Text style={[styles.audioMetaChipText, { color: theme.text }]}>
                      {duration > 0 ? formatTime(duration) : '--:--'}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.bigTitle, { color: theme.text }]} numberOfLines={3}>
                  {title}
                </Text>
                <Text style={[styles.audioAuthorSubtitle, { color: theme.textMuted }]}>{author}</Text>
              </View>

              <View style={styles.audioTimelineBlock}>
                <View style={[styles.audioSliderWrap, { marginTop: 8 }]}>
                  <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={1}
                    value={duration > 0 ? position / duration : 0}
                    onValueChange={handleSeek}
                    onSlidingStart={handleSlidingStart}
                    onSlidingComplete={handleSlidingComplete}
                    minimumTrackTintColor={theme.primary}
                    maximumTrackTintColor={theme.maximumTrackTintColor}
                    thumbTintColor={theme.primary}
                  />
                  <View style={styles.audioTimeRow}>
                    <Text style={[styles.timeText, { color: theme.textMuted }]}>{formatTime(position)}</Text>
                    <Text style={[styles.timeText, { color: theme.textMuted }]}>{formatTime(duration)}</Text>
                  </View>
                </View>
              </View>

              {queueItems.length > 0 ? (
                <View style={styles.queueSection}>
                  <View style={styles.queueTitleRow}>
                    <Text style={[styles.queueTitle, { color: theme.text }]}>Up next</Text>
                    <TouchableOpacity
                      style={[styles.queuePlayNext, { backgroundColor: `${theme.primary}22` }]}
                      onPress={handlePlayNextInQueue}
                      activeOpacity={0.85}
                    >
                      <Ionicons name="play-forward" size={18} color={theme.primary} />
                      <Text style={[styles.queuePlayNextText, { color: theme.primary }]}>
                        Play next
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {queueItems.map((q, index) => (
                    <View
                      key={q.id}
                      style={[
                        styles.queueRow,
                        { backgroundColor: theme.gray2, borderColor: theme.maximumTrackTintColor },
                      ]}
                    >
                      <View style={styles.queueRowInfo}>
                        <Text style={[styles.queueRowTitle, { color: theme.text }]} numberOfLines={2}>
                          {q.title}
                        </Text>
                        <Text style={[styles.queueRowAuthor, { color: theme.textMuted }]} numberOfLines={1}>
                          {q.authorName}
                        </Text>
                      </View>
                      <View style={styles.queueRowActions}>
                        {index > 0 ? (
                          <TouchableOpacity
                            onPress={() => moveQueueItemUp(q.id)}
                            hitSlop={8}
                            accessibilityLabel="Move up in queue"
                          >
                            <Ionicons name="chevron-up" size={22} color={theme.primary} />
                          </TouchableOpacity>
                        ) : null}
                        <TouchableOpacity
                          onPress={() => removeFromQueue(q.id)}
                          hitSlop={8}
                          accessibilityLabel="Remove from queue"
                        >
                          <Ionicons name="trash-outline" size={20} color={theme.textMuted} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              ) : null}
            </ScrollView>

            <View
              style={[styles.audioDockOuter, { paddingBottom: Math.max(insets.bottom, 12) }]}
              pointerEvents="box-none"
            >
              <View style={[styles.audioDockPill, { backgroundColor: audioDockPillBg }]}>
                <TouchableOpacity
                  style={styles.audioDockMiniBtn}
                  onPress={handleRewind}
                  activeOpacity={0.75}
                  accessibilityLabel="Back ten seconds"
                >
                  <Ionicons name="play-skip-back" size={24} color={audioDockIconColor} />
                  <Text style={[styles.audioDockTinyLabel, { color: audioDockIconColor }]}>10</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.audioDockMainPlay, { backgroundColor: theme.primary }]}
                  onPress={handlePlayPause}
                  disabled={isBuffering}
                  activeOpacity={0.88}
                >
                  {isBuffering ? (
                    <Animated.View style={{ transform: [{ rotate: spin }] }}>
                      <Ionicons name="sync" size={30} color={theme.white} />
                    </Animated.View>
                  ) : (
                    <Ionicons
                      name={isPlaying ? 'pause' : 'play'}
                      size={32}
                      color={theme.white}
                      style={isPlaying ? undefined : { marginLeft: 3 }}
                    />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.audioDockMiniBtn}
                  onPress={handleForward}
                  activeOpacity={0.75}
                  accessibilityLabel="Forward ten seconds"
                >
                  <Ionicons name="play-skip-forward" size={24} color={audioDockIconColor} />
                  <Text style={[styles.audioDockTinyLabel, { color: audioDockIconColor }]}>10</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.textModeRoot}>
            <ScrollView
              ref={textModeScrollRef}
              style={styles.textModeScroll}
              contentContainerStyle={[
                styles.textModeContent,
                { paddingBottom: insets.bottom + 180 },
              ]}
              showsVerticalScrollIndicator={false}
            >
              <Text style={[styles.bookTitleInReader, { color: highText, fontSize: readerFontSize + 2 }]}>
                {title}
              </Text>
              <Text style={[styles.authorInReader, { color: lowText }]}>{author}</Text>
              {normalizedSegments.length === 0 ? (
                <Text style={[styles.emptyTranscript, { color: lowText }]}>
                  No timestamped transcript is available for this book yet. You can still listen in Audio
                  mode.
                </Text>
              ) : (
                normalizedSegments.map((seg, segIdx) => {
                  const prev = segIdx > 0 ? normalizedSegments[segIdx - 1] : null;
                  const showChapter =
                    seg.chapterHeading && (!prev || prev.chapterHeading !== seg.chapterHeading);
                  const isActive = segIdx === activeSegmentIndex;
                  const bodyText = (seg.sectionText || '').trim() || seg.segmentLabel;
                  return (
                    <Pressable
                      key={`seg-${seg.key}-${seg.startMs}`}
                      onLayout={(e) => onTextSectionLayout(segIdx, e)}
                      onPress={() => handleSegmentPress(seg.startMs)}
                      style={({ pressed }) => [
                        styles.textSectionBlock,
                        {
                          backgroundColor: isActive ? theme.gray2 : 'transparent',
                          opacity: pressed ? 0.9 : 1,
                        },
                      ]}
                    >
                      <View style={styles.textSectionRow}>
                        <View
                          style={[
                            styles.textSectionAccent,
                            { backgroundColor: isActive ? theme.primary : 'transparent' },
                          ]}
                        />
                        <View style={styles.textSectionBody}>
                          {showChapter ? (
                            <Text
                              style={[
                                styles.chapterHeadingText,
                                {
                                  color: highText,
                                  fontSize: readerFontSize + 6,
                                  marginBottom: 10,
                                },
                              ]}
                            >
                              {seg.chapterHeading}
                            </Text>
                          ) : null}
                          <Text
                            style={{
                              color: highText,
                              fontSize: readerFontSize,
                              lineHeight: Math.round(readerFontSize * 1.55),
                            }}
                          >
                            {bodyText}
                          </Text>
                        </View>
                      </View>
                    </Pressable>
                  );
                })
              )}
            </ScrollView>
          </View>
        )}

        {playerMode === 'text' ? (
          <View
            style={[
              styles.bottomWrap,
              {
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: mainBgColor,
                borderTopWidth: StyleSheet.hairlineWidth,
                borderTopColor: theme.maximumTrackTintColor,
                paddingBottom: Math.max(insets.bottom, 10),
              },
            ]}
          >
            {playBarRow}
            <View style={[styles.progressSection, { width: '92%', marginTop: 4 }]}>
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
        ) : null}

        <Modal
          visible={showReaderSettings}
          transparent
          animationType="slide"
          onRequestClose={() => setShowReaderSettings(false)}
        >
          <Pressable
            style={styles.settingsBackdrop}
            onPress={() => setShowReaderSettings(false)}
          >
            <Pressable
              style={[styles.settingsSheet, { backgroundColor: theme.background }]}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={[styles.settingsGrabber, { backgroundColor: theme.maximumTrackTintColor }]} />
              <Text style={[styles.settingsTitle, { color: theme.text }]}>Reader</Text>
              <Text style={[styles.settingsLabel, { color: theme.textMuted }]}>Font size</Text>
              <View style={styles.fontStepper}>
                <TouchableOpacity
                  onPress={() => setReaderFontSize((s) => Math.max(14, s - 1))}
                  style={[styles.fontStepperBtn, { borderColor: theme.textMuted }]}
                >
                  <Ionicons name="remove" size={22} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.fontStepperValue, { color: theme.text }]}>{readerFontSize}</Text>
                <TouchableOpacity
                  onPress={() => setReaderFontSize((s) => Math.min(32, s + 1))}
                  style={[styles.fontStepperBtn, { borderColor: theme.textMuted }]}
                >
                  <Ionicons name="add" size={22} color={theme.text} />
                </TouchableOpacity>
              </View>
              <Text style={[styles.settingsLabel, { color: theme.textMuted, marginTop: 20 }]}>
                Page color
              </Text>
              <View style={styles.swatchRow}>
                {readerBackgroundOptions.map((bg, i) => (
                  <TouchableOpacity
                    key={`reader-bg-${i}`}
                    onPress={() => setReaderBgIndex(i)}
                    style={[
                      styles.swatch,
                      { backgroundColor: bg, borderColor: readerBgIndex === i ? theme.primary : 'transparent' },
                    ]}
                  />
                ))}
              </View>
              <Text style={[styles.settingsHint, { color: theme.textMuted }]}>
                Playback follows each timestamped section. The left bar marks the current section; tap a
                section to jump.
              </Text>
            </Pressable>
          </Pressable>
        </Modal>
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 2,
  },
  modeSwitchWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  modeSwitch: {
    flexDirection: 'row',
    borderRadius: moderateScale(20),
    padding: 3,
  },
  modePill: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: moderateScale(16),
  },
  modePillText: {
    fontSize: 14,
    fontWeight: '600',
  },
  topIconBtn: {
    padding: 4,
  },
  audioContentRoot: {
    flex: 1,
    zIndex: 1,
    justifyContent: 'center',
    paddingHorizontal: horizontalScale(22),
    paddingBottom: verticalScale(12),
  },
  audioHero: {
    alignItems: 'center',
    width: '100%',
    marginBottom: verticalScale(24),
  },
  audioCoverWrap: {
    width: horizontalScale(248),
    height: verticalScale(300),
    alignSelf: 'center',
    marginBottom: verticalScale(14),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: moderateScale(28),
    overflow: 'hidden',
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  audioCoverImage: {
    width: '100%',
    height: '100%',
    borderRadius: moderateScale(28),
  },
  audioKicker: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  audioAuthorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '100%',
    marginTop: 14,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  audioAuthorAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ccc',
  },
  audioTransportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 26,
    marginBottom: verticalScale(4),
  },
  audioSideBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  audioPlayRing: {
    padding: 4,
    borderRadius: 48,
    borderWidth: 2,
  },
  audioMainPlay: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 10,
  },
  textModeRoot: {
    flex: 1,
    zIndex: 1,
  },
  textModeScroll: {
    flex: 1,
  },
  textModeContent: {
    paddingHorizontal: horizontalScale(22),
    paddingTop: 8,
  },
  bookTitleInReader: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  authorInReader: {
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 20,
  },
  emptyTranscript: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 24,
  },
  textSectionBlock: {
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: moderateScale(12),
  },
  textSectionRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  textSectionAccent: {
    width: 4,
    borderRadius: 2,
    marginRight: 12,
  },
  textSectionBody: {
    flex: 1,
  },
  chapterHeadingText: {
    fontWeight: '700',
  },
  bigTitle: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 32,
    letterSpacing: 0.35,
    maxWidth: '100%',
    paddingHorizontal: 4,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '500',
    flexShrink: 1,
  },
  bottomWrap: {
    width: '100%',
    paddingBottom: 24,
    zIndex: 2,
  },
  audioScroll: {
    flex: 1,
  },
  audioScrollInner: {
    paddingHorizontal: horizontalScale(20),
    alignItems: 'stretch',
  },
  vinylStage: {
    position: 'relative',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: verticalScale(300),
    marginBottom: verticalScale(10),
  },
  vinylRingOuter: {
    position: 'absolute',
    width: horizontalScale(300),
    height: horizontalScale(300),
    borderRadius: horizontalScale(150),
    borderWidth: StyleSheet.hairlineWidth,
  },
  vinylRingMid: {
    position: 'absolute',
    width: horizontalScale(210),
    height: horizontalScale(210),
    borderRadius: horizontalScale(105),
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  audioMetaRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 14,
    marginBottom: verticalScale(14),
  },
  audioMetaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  audioMetaChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  audioAuthorSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 4,
  },
  audioTimelineBlock: {
    width: '100%',
    marginTop: verticalScale(8),
  },
  queueSection: {
    width: '100%',
    marginTop: verticalScale(20),
    paddingHorizontal: horizontalScale(4),
  },
  queueTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: verticalScale(10),
    gap: 8,
  },
  queueTitle: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    flex: 1,
  },
  queuePlayNext: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  queuePlayNextText: {
    fontSize: moderateScale(13),
    fontWeight: '700',
  },
  queueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  queueRowInfo: {
    flex: 1,
    marginRight: 8,
  },
  queueRowTitle: {
    fontSize: moderateScale(14),
    fontWeight: '600',
  },
  queueRowAuthor: {
    fontSize: moderateScale(12),
    marginTop: 2,
  },
  queueRowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  audioSliderWrap: {
    width: '100%',
    alignSelf: 'center',
  },
  audioTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
    paddingHorizontal: 2,
  },
  audioDockOuter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 6,
    zIndex: 4,
    pointerEvents: 'box-none',
  },
  audioDockPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: horizontalScale(20),
    marginHorizontal: horizontalScale(16),
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 999,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  audioDockMiniBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 48,
    minHeight: 48,
    paddingVertical: 2,
  },
  audioDockMainPlay: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioDockTinyLabel: {
    fontSize: 10,
    fontWeight: '800',
    marginTop: -2,
    letterSpacing: 0.2,
  },
  textModeTransport: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
    marginBottom: 4,
  },
  transportBtn: {
    padding: 8,
  },
  textModeMainPlay: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
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
  settingsBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  settingsSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 36,
  },
  settingsGrabber: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.12)',
    marginBottom: 16,
  },
  settingsTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  settingsLabel: {
    fontSize: 13,
    marginTop: 12,
    marginBottom: 10,
  },
  fontStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  fontStepperBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fontStepperValue: {
    fontSize: 22,
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'center',
  },
  swatchRow: {
    flexDirection: 'row',
    gap: 16,
  },
  swatch: {
    width: 56,
    height: 40,
    borderRadius: 12,
    borderWidth: 2,
  },
  settingsHint: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 20,
  },
});

export default AudioPlayer;