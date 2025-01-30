import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, Animated, View, Pressable, Image, Dimensions } from 'react-native';
import { router } from "expo-router";
import React, { useEffect, useRef } from 'react';
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SecureStore from 'expo-secure-store';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const App = () => {
  const scaleValue = useRef(new Animated.Value(1)).current; // Initialize scale
  const fadeAnim = useRef(new Animated.Value(0)).current; // Fade animation for text

  // Button animation
  const animateButton = () => {
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.9,  // Scale down to 90%
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,   // Scale back to 100%
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.push('/(authenticate)/chooseRole');
    });
  };

  // Fade-in animation for text
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  // Check user role
  useEffect(() => {
    const checkUser = async () => {
      let userDetail = await SecureStore.getItemAsync('userDetails');
      let authToken = await SecureStore.getItemAsync('authToken');
      if (!userDetail) return;
      const userData = JSON.parse(userDetail);
      if (userData.role === 'PUBLISHER') {
        router.push('/(publisher)/publisherhome');
      } else if (userData.role === 'LISTENER') {
        router.push('/(tabs)/home');
      }
    };
    checkUser();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#000', '#000', '#6366F1']} // Gradient background
        style={styles.container}
      >
        <Animated.View style={[{ transform: [{ scale: scaleValue }] }, styles.content]}>
          {/* App Logo */}
          {/* <Image
            source={require('@/assets/images/safari-books-logo.png')} // Replace with your logo
            style={styles.logo}
          /> */}

          {/* App Name */}
          <Animated.Text style={[styles.appName, { opacity: fadeAnim }]}>
            Safari Books
          </Animated.Text>

          {/* Tagline */}
          <Animated.Text style={[styles.tagline, { opacity: fadeAnim }]}>
            Where Stories Come to Life
          </Animated.Text>

          {/* Features Section */}
          <View style={styles.featuresContainer}>
            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>🎙️</Text>
              <Text style={styles.featureTitle}>Publish</Text>
              <Text style={styles.featureDescription}>
                Share your stories with the world.
              </Text>
            </View>

            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>🎧</Text>
              <Text style={styles.featureTitle}>Listen</Text>
              <Text style={styles.featureDescription}>
                Dive into a world of audio stories.
              </Text>
            </View>

            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>🎭</Text>
              <Text style={styles.featureTitle}>Narrate</Text>
              <Text style={styles.featureDescription}>
                Bring stories to life with your voice.
              </Text>
            </View>
          </View>

          {/* Get Started Button */}
          <Pressable onPress={animateButton} style={styles.button}>
            <Text style={styles.buttonText}>Get Started</Text>
          </Pressable>
        </Animated.View>
      </LinearGradient>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  tagline: {
    fontSize: 18,
    color: '#E0E7FF',
    textAlign: 'center',
    marginBottom: 40,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 40,
  },
  featureCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Semi-transparent white
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)', // Light border
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },

    shadowRadius: 10,
    elevation: 5,
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 10,
    color: '#FFFFFF',
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: '#E0E7FF',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },

    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3B82F6',
  },
});

export default App;