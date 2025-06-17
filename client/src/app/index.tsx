import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Pressable, Dimensions } from 'react-native';
import { router } from "expo-router";
import React, { useEffect } from 'react';
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SecureStore from 'expo-secure-store';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const App = () => {
  // Check user role
  useEffect(() => {
    const checkUser = async () => {
      let userDetail = await SecureStore.getItemAsync('userDetails');
      let authToken = await SecureStore.getItemAsync('authToken');
      if (!userDetail) return;
      const userData = JSON.parse(userDetail);
      if (userData.role === 'PUBLISHER') {
        router.replace('/(publisher)/publisherhome');
      } else if (userData.role === 'LISTENER') {
        router.replace('/(tabs)/home');
      }
    };
    checkUser();
  }, []);

  const handleGetStarted = () => {
    router.replace('/(authenticate)/chooseRole');
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#000000', '#1a1a1a', '#3730A3']}
        locations={[0, 0.4, 1]}
        style={styles.container}
      >
        <View style={styles.content}>
          {/* App Name */}
          <Text style={styles.appName}>Safari Books</Text>
          <Text style={styles.tagline}>Audiobooks for Everyone</Text>

          {/* App Description */}
          <Text style={styles.description}>
            Discover, listen, and publish audiobooks. Safari Books is your gateway to a world of stories and knowledge.
          </Text>

          {/* Features */}
          <View style={styles.featuresContainer}>
            <View style={styles.featureCard}>
              <Ionicons name="mic-outline" size={28} color="#6366F1" style={{ marginBottom: 6 }} />
              <Text style={styles.featureTitle}>Publish</Text>
            </View>
            <View style={styles.featureCard}>
              <Ionicons name="headset-outline" size={28} color="#6366F1" style={{ marginBottom: 6 }} />
              <Text style={styles.featureTitle}>Listen</Text>
            </View>
            <View style={styles.featureCard}>
              <MaterialCommunityIcons name="account-voice" size={28} color="#6366F1" style={{ marginBottom: 6 }} />
              <Text style={styles.featureTitle}>Narrate</Text>
            </View>
          </View>

          {/* Get Started Button */}
          <Pressable onPress={handleGetStarted} style={styles.button}>
            <LinearGradient
              colors={['#4F46E5', '#6366F1']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Get Started</Text>
            </LinearGradient>
          </Pressable>
        </View>
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
  appName: {
    fontSize: 40,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 18,
    color: '#A5B4FC',
    textAlign: 'center',
    marginBottom: 18,
    fontWeight: '500',
  },
  description: {
    fontSize: 15,
    color: '#E0E7FF',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 36,
    width: '100%',
  },
  featureCard: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 8,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 14,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
  },
  featureTitle: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '600',
    marginTop: 2,
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