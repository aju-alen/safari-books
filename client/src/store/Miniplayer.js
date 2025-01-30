
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudio } from './AudioContext';
import { COLORS } from '@/constants/tokens';

const MiniPlayer = () => {
  const { currentTrack, isPlaying, handlePlayPause, miniPlayerVisible } = useAudio();

  if (!miniPlayerVisible) return null;

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: currentTrack?.coverImage }}
        style={styles.coverImage}
      />
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {currentTrack?.title}
        </Text>
        <Text style={styles.author} numberOfLines={1}>
          {currentTrack?.author}
        </Text>
      </View>
      <TouchableOpacity onPress={handlePlayPause} style={styles.playButton}>
        <Ionicons
          name={isPlaying ? 'pause' : 'play'}
          size={24}
          color={COLORS.text}
        />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
  },
  coverImage: {
    width: 40,
    height: 40,
    borderRadius: 4,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 10,
  },
  title: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  author: {
    color: COLORS.secondary,
    fontSize: 12,
  },
  playButton: {
    padding: 10,
  },
});

export default MiniPlayer;