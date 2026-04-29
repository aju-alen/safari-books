import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Pressable,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudio } from './AudioContext';
import { useTheme } from '@/providers/ThemeProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, usePathname } from 'expo-router';
import { moderateScale } from '@/utils/responsiveSize';

const TAB_BAR_BASE = Platform.OS === 'android' ? 60 : 52;

const MiniPlayer = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const { currentTrack, isPlaying, handlePlayPause, miniPlayerVisible, unloadActiveSound } = useAudio();

  const isFullAudioPlayerRoute = /\/play\//.test(pathname);
  if (isFullAudioPlayerRoute || !miniPlayerVisible || !currentTrack) return null;

  const bottom = TAB_BAR_BASE + insets.bottom + 6;

  const openFullPlayer = () => {
    if (currentTrack.bookId) {
      router.push(`/(tabs)/home/play/${currentTrack.bookId}`);
    }
  };

  return (
    <View style={[styles.wrap, { bottom }]} pointerEvents="box-none">
      <View
        style={[
          styles.container,
          { backgroundColor: theme.background, borderColor: theme.gray2 },
        ]}
      >
        <Pressable
          onPress={openFullPlayer}
          style={({ pressed }) => [styles.mainPress, { opacity: pressed ? 0.88 : 1 }]}
        >
          <Image source={{ uri: currentTrack.coverImage }} style={styles.coverImage} />
          <View style={styles.infoContainer}>
            <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
              {currentTrack.title}
            </Text>
            <Text style={[styles.author, { color: theme.textMuted }]} numberOfLines={1}>
              {currentTrack.author}
            </Text>
          </View>
        </Pressable>
        <TouchableOpacity onPress={() => void handlePlayPause()} style={styles.playButton} hitSlop={12}>
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={26}
            color={theme.primary}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => void unloadActiveSound()}
          style={styles.closeButton}
          hitSlop={12}
          accessibilityLabel="Close mini player and stop playback"
        >
          <Ionicons name="close" size={24} color={theme.textMuted} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 100,
    paddingHorizontal: 12,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingLeft: 12,
    paddingRight: 6,
    borderRadius: moderateScale(14),
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  mainPress: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
  },
  coverImage: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
  },
  author: {
    fontSize: 13,
    marginTop: 2,
  },
  playButton: {
    padding: 8,
  },
  closeButton: {
    padding: 8,
    marginLeft: -2,
  },
});

export default MiniPlayer;
