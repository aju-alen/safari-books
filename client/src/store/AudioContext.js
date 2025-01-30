// AudioContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Audio } from 'expo-av';

const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [miniPlayerVisible, setMiniPlayerVisible] = useState(false);

  const playTrack = async (audioUrl, trackInfo) => {
    try {
      // Stop and unload any existing sound
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }

      // Create new sound
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true },
        onPlaybackStatusUpdate // Attach status update handler
      );

      // Set audio mode for background play
      await Audio.setAudioModeAsync({
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
      });

      // Save sound instance
      setSound(newSound);
      setIsPlaying(true);
      setCurrentTrack(trackInfo);
      setMiniPlayerVisible(true);

      // Attach status update listener
      newSound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
    } catch (error) {
      console.error('Error playing track:', error);
    }
  };

  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setIsPlaying(status.isPlaying);

      // Automatically unload when playback finishes
      if (status.didJustFinish) {
        setIsPlaying(false);
        setMiniPlayerVisible(false);
        setSound(null);
      }
    }
  };

  const handlePlayPause = async () => {
    if (!sound) return;

    try {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    } catch (error) {
      console.error('Error toggling play/pause:', error);
    }
  };

  // Cleanup sound when component unmounts
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  return (
    <AudioContext.Provider
      value={{
        sound,
        isPlaying,
        currentTrack,
        miniPlayerVisible,
        playTrack,
        handlePlayPause,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => useContext(AudioContext);
