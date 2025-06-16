import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, Animated, View, Pressable, Image, Dimensions } from 'react-native';
import { router } from "expo-router";
import React, { useEffect, useRef } from 'react';
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SecureStore from 'expo-secure-store';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const App = () => {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const gradientAnim = useRef(new Animated.Value(0)).current;

  // Enhanced button animation
  const animateButton = () => {
    Animated.sequence([
      Animated.spring(scaleValue, {
        toValue: 0.95,
        useNativeDriver: true,
        damping: 15,
        stiffness: 300,
      }),
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
        damping: 15,
        stiffness: 300,
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

  // Add gradient animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(gradientAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: false,
        }),
        Animated.timing(gradientAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  // Add pulse animation to app name
  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();
  }, []);

  // Check user role
  useEffect(() => {
    const checkUser = async () => {
      let userDetail = await SecureStore.getItemAsync('userDetails');
      let authToken = await SecureStore.getItemAsync('authToken');
      if (!userDetail) return;
      const userData = JSON.parse(userDetail);
      if (userData.role === 'PUBLISHER') {
        router.push('/(publisher)/:home');
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
        colors={['#000000', '#1a1a1a', '#3730A3']}
        locations={[0, 0.4, 1]}
        style={styles.container}
      >
        <Animated.View style={[{ transform: [{ scale: scaleValue }] }, styles.content]}>
          {/* App Logo */}
          {/* <Image
            source={require('@/assets/images/safari-books-logo.png')} // Replace with your logo
            style={styles.logo}
          /> */}

          {/* App Name with scale animation */}
          <Animated.Text style={[styles.appName, { opacity: fadeAnim }]}>
            Safari Books
          </Animated.Text>

          {/* Tagline */}
          <Animated.Text style={[styles.tagline, { opacity: fadeAnim }]}>
            Where Stories Come to Life
          </Animated.Text>

          {/* Updated Features Section */}
          <View style={styles.featuresContainer}>
            {[
              { icon: '🎙️', title: 'Publish', desc: 'Share your stories with the world' },
              { icon: '🎧', title: 'Listen', desc: 'Dive into a world of audio stories' },
              { icon: '🎭', title: 'Narrate', desc: 'Bring stories to life with your voice' }
            ].map((feature, index) => {
              const fadeInAnim = useRef(new Animated.Value(0)).current;
              
              useEffect(() => {
                Animated.timing(fadeInAnim, {
                  toValue: 1,
                  duration: 1000,
                  delay: 400 * index,
                  useNativeDriver: true,
                }).start();
              }, []);

              return (
                <Animated.View 
                  key={index}
                  style={[
                    styles.featureCard,
                    {
                      opacity: fadeInAnim,
                      transform: [{
                        translateY: fadeInAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [50, 0]
                        })
                      }]
                    }
                  ]}
                >
                  <Text style={styles.featureIcon}>{feature.icon}</Text>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.desc}</Text>
                </Animated.View>
              );
            })}
          </View>

          {/* Enhanced Get Started Button */}
          <Pressable 
            onPress={animateButton}
            style={({pressed}) => [
              styles.button,
              pressed && styles.buttonPressed
            ]}
          >
            <LinearGradient
              colors={['#4F46E5', '#6366F1']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Get Started</Text>
            </LinearGradient>
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
    paddingHorizontal: 24,
    paddingTop: height * 0.05,
    paddingBottom: 24,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  appName: {
    fontSize: 44,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 16,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 20,
    color: '#E0E7FF',
    textAlign: 'center',
    marginBottom: 40,
    fontWeight: '500',
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  featureCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  featureDescription: {
    fontSize: 14,
    color: '#E0E7FF',
    textAlign: 'center',
    lineHeight: 20,
  },
  button: {
    width: '85%',
    maxWidth: 280,
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#4338CA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});

export default App;