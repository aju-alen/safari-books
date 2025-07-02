import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Pressable, Dimensions } from 'react-native';
import { router } from "expo-router";
import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SecureStore from 'expo-secure-store';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { verticalScale, horizontalScale ,moderateScale} from "@/utils/responsiveSize";
import { useTheme } from '@/providers/ThemeProvider';

const { width, height } = Dimensions.get('window');

const App = () => {
  const { theme } = useTheme();
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Check user role
  useEffect(() => {
    const user = async () => {
      const user = await SecureStore.getItemAsync("userDetails");
      console.log(user, 'user');
      
      if (!user) {
        setLoading(false);
        return;
      }
      const parsed = JSON.parse(user);
      setUserDetails(parsed);

      if (parsed.role === 'GUEST') {
        router.replace('/(tabs)/home');
        return;
      }
      else if (parsed.role === 'LISTENER') {
        router.replace('/(tabs)/home');
        return;
      }
      else if (parsed.role === 'PUBLISHER') {
        router.replace('/(publisher)/publisherhome');
        return;
      }
      // Add other redirects if needed
      setLoading(false);
    };
    user();
  }, []);

  const handleGetStarted = () => {
    router.replace('/(authenticate)/chooseRole');
  };

  if (loading) return null; // or a spinner

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={[styles.logoContainer, { backgroundColor: theme.primary }]}>
            <Ionicons name="library" size={moderateScale(40)} color={theme.white} />
          </View>
          <Text style={[styles.appName, { color: theme.text }]}>Safari Books</Text>
          <Text style={[styles.tagline, { color: theme.textMuted }]}>Your Gateway to Stories</Text>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <Text style={[styles.heroTitle, { color: theme.text }]}>
              Discover Amazing Audiobooks
            </Text>
            <Text style={[styles.heroSubtitle, { color: theme.textMuted }]}>
              Listen to your favorite books, publish your own stories, and connect with a community of book lovers.
            </Text>
          </View>

          {/* Features Grid */}
          <View style={styles.featuresGrid}>
            <View style={[styles.featureCard, { backgroundColor: theme.white, borderColor: theme.gray2 }]}>
              <View style={[styles.featureIcon, { backgroundColor: `${theme.primary}15` }]}>
                <Ionicons name="headset" size={moderateScale(24)} color={theme.primary} />
              </View>
              <Text style={[styles.featureTitle, { color: theme.text }]}>Listen</Text>
              <Text style={[styles.featureDesc, { color: theme.textMuted }]}>Immerse yourself in stories</Text>
            </View>

            <View style={[styles.featureCard, { backgroundColor: theme.white, borderColor: theme.gray2 }]}>
              <View style={[styles.featureIcon, { backgroundColor: `${theme.secondary}15` }]}>
                <Ionicons name="mic" size={moderateScale(24)} color={theme.secondary} />
              </View>
              <Text style={[styles.featureTitle, { color: theme.text }]}>Publish</Text>
              <Text style={[styles.featureDesc, { color: theme.textMuted }]}>Share your stories</Text>
            </View>

            <View style={[styles.featureCard, { backgroundColor: theme.white, borderColor: theme.gray2 }]}>
              <View style={[styles.featureIcon, { backgroundColor: `${theme.tertiary}15` }]}>
                <MaterialCommunityIcons name="account-voice" size={moderateScale(24)} color={theme.tertiary} />
              </View>
              <Text style={[styles.featureTitle, { color: theme.text }]}>Narrate</Text>
              <Text style={[styles.featureDesc, { color: theme.textMuted }]}>Bring stories to life</Text>
            </View>

            <View style={[styles.featureCard, { backgroundColor: theme.white, borderColor: theme.gray2 }]}>
              <View style={[styles.featureIcon, { backgroundColor: `${theme.secondary2}15` }]}>
                <Ionicons name="people" size={moderateScale(24)} color={theme.secondary2} />
              </View>
              <Text style={[styles.featureTitle, { color: theme.text }]}>Connect</Text>
              <Text style={[styles.featureDesc, { color: theme.textMuted }]}>Join the community</Text>
            </View>
          </View>
        </View>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          <Pressable onPress={handleGetStarted} style={[styles.ctaButton, { backgroundColor: theme.primary }]}>
            <Text style={[styles.ctaText, { color: theme.white }]}>Get Started</Text>
            <Ionicons name="arrow-forward" size={moderateScale(20)} color={theme.white} />
          </Pressable>
          
          <Text style={[styles.footerText, { color: theme.textMuted }]}>
            Join thousands of readers and authors
          </Text>
        </View>
      </View>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSection: {
    alignItems: 'center',
    paddingTop: verticalScale(height * 0.08),
    paddingBottom: verticalScale(40),
  },
  logoContainer: {
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: moderateScale(20),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(20),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },

    shadowRadius: 16,
    elevation: 8,
  },
  appName: {
    fontSize: moderateScale(32),
    fontWeight: '700',
    marginBottom: verticalScale(8),
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: moderateScale(16),
    fontWeight: '400',
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: horizontalScale(24),
  },
  heroSection: {
    marginBottom: verticalScale(40),
  },
  heroTitle: {
    fontSize: moderateScale(28),
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: verticalScale(12),
    lineHeight: moderateScale(36),
  },
  heroSubtitle: {
    fontSize: moderateScale(16),
    textAlign: 'center',
    lineHeight: moderateScale(24),
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: (width - horizontalScale(48) - horizontalScale(12)) / 2,
    backgroundColor: 'white',
    borderRadius: moderateScale(16),
    padding: moderateScale(20),
    marginBottom: verticalScale(16),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowRadius: 8,
    elevation: 4,
  },
  featureIcon: {
    width: moderateScale(50),
    height: moderateScale(50),
    borderRadius: moderateScale(25),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  featureTitle: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    marginBottom: verticalScale(4),
    textAlign: 'center',
  },
  featureDesc: {
    fontSize: moderateScale(12),
    textAlign: 'center',
    lineHeight: moderateScale(16),
  },
  bottomSection: {
    paddingHorizontal: horizontalScale(24),
    paddingBottom: verticalScale(40),
    alignItems: 'center',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(16),
    paddingHorizontal: verticalScale(32),
    borderRadius: moderateScale(28),
    marginBottom: verticalScale(16),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowRadius: 12,
    elevation: 8,
  },
  ctaText: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    marginRight: verticalScale(8),
  },
  footerText: {
    fontSize: moderateScale(14),
    textAlign: 'center',
  },
});

export default App;