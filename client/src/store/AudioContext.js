// AudioContext.js — single active playback for sample + full-book (mini player)
import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';
import { Audio } from 'expo-av';

const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const activeSoundRef = useRef(null);
  const currentTrackRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [miniPlayerVisible, setMiniPlayerVisible] = useState(false);

  useEffect(() => {
    currentTrackRef.current = currentTrack;
  }, [currentTrack]);

  const syncPlaybackState = useCallback((playing) => {
    setIsPlaying(!!playing);
  }, []);

  const unloadActiveSound = useCallback(async () => {
    const s = activeSoundRef.current;
    if (s) {
      try {
        await s.stopAsync();
        await s.unloadAsync();
      } catch (e) {
        console.warn('unloadActiveSound', e);
      }
      activeSoundRef.current = null;
    }
    setIsPlaying(false);
    currentTrackRef.current = null;
    setCurrentTrack(null);
    setMiniPlayerVisible(false);
  }, []);

  const registerActiveSound = useCallback((soundInstance, trackInfo) => {
    if (!soundInstance) return;
    activeSoundRef.current = soundInstance;
    currentTrackRef.current = trackInfo;
    setCurrentTrack(trackInfo);
    setMiniPlayerVisible(true);
  }, []);

  const unregisterIfMatches = useCallback(async (soundInstance) => {
    if (activeSoundRef.current !== soundInstance) return;
    activeSoundRef.current = null;
    currentTrackRef.current = null;
    setCurrentTrack(null);
    setMiniPlayerVisible(false);
    setIsPlaying(false);
  }, []);

  const getActiveSoundForBook = useCallback((bookId) => {
    if (!bookId || !activeSoundRef.current) return null;
    const t = currentTrackRef.current;
    if (!t || String(t.bookId) !== String(bookId)) return null;
    return activeSoundRef.current;
  }, []);

  const playTrack = async (audioUrl, trackInfo) => {
    try {
      await unloadActiveSound();

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true },
        (status) => {
          if (status.isLoaded) {
            setIsPlaying(status.isPlaying);
            if (status.didJustFinish) {
              unloadActiveSound();
            }
          }
        }
      );

      await Audio.setAudioModeAsync({
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
      });

      activeSoundRef.current = newSound;
      currentTrackRef.current = trackInfo;
      setIsPlaying(true);
      setCurrentTrack(trackInfo);
      setMiniPlayerVisible(true);
    } catch (error) {
      console.error('Error playing track:', error);
    }
  };

  const handlePlayPause = async () => {
    const s = activeSoundRef.current;
    if (!s) return;

    try {
      const status = await s.getStatusAsync();
      if (!status.isLoaded) return;
      if (status.isPlaying) {
        await s.pauseAsync();
        setIsPlaying(false);
      } else {
        await s.playAsync();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error toggling play/pause:', error);
    }
  };

  useEffect(() => {
    return () => {
      if (activeSoundRef.current) {
        activeSoundRef.current.unloadAsync();
        activeSoundRef.current = null;
      }
    };
  }, []);

  return (
    <AudioContext.Provider
      value={{
        isPlaying,
        currentTrack,
        miniPlayerVisible,
        playTrack,
        handlePlayPause,
        syncPlaybackState,
        unloadActiveSound,
        registerActiveSound,
        unregisterIfMatches,
        getActiveSoundForBook,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => useContext(AudioContext);
