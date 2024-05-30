import { FontAwesome } from '@expo/vector-icons';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import { Sound } from 'expo-av/build/Audio';
import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity,SafeAreaView,ScrollView } from 'react-native';
import { defaultStyles } from '@/styles';



const AudioPlayer = ({ audioUrl}) => {
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [sound, setSound] = useState<Sound | null>(null);
    console.log(audioUrl, 'audioUrl');
    
  
    useEffect(() => {
      Audio.setAudioModeAsync({
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          interruptionModeIOS: InterruptionModeIOS.DuckOthers,
          interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: true,
      });
      return sound
        ? () => {
          sound.unloadAsync();
        }
        : undefined;
    }, [sound]);
  
    const playAudio = async () => {
      // Set and play the sound
      const { sound: newSound } = await Audio.Sound.createAsync(require('../../assets/sounds/testAudio.mp3'));
      setSound(newSound);
  
      setIsPlaying(true);
      await newSound.playAsync();
  
      // After the sound has finished, update the state so that the icon changes
      newSound.setOnPlaybackStatusUpdate((status) => {
        if ('didJustFinish' in status && status.didJustFinish) {
          setIsPlaying(false);
        }
      });
  };
    
    return (
      <SafeAreaView style={defaultStyles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          
        <TouchableOpacity onPress={playAudio}>
        <FontAwesome name={isPlaying ? 'volume-up' : 'play'} size={35} color="#fff" />
      </TouchableOpacity>
          </ScrollView>
      </SafeAreaView>
    )
  }

export default AudioPlayer;

const styles = StyleSheet.create({
  button: {
    height: 30,
    width: 30,
    borderRadius: 15, // Half of the height/width
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginHorizontal: 5,
  },
});