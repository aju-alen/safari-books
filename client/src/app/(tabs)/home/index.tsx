import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Button } from 'react-native';
import React, { useEffect, useState } from 'react';
import { defaultStyles } from '@/styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale, verticalScale } from '@/utils/responsiveSize';
import { EvilIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/tokens';
import { router } from 'expo-router';
import { eBookData } from '@/utils/flatlistData';
import TrendingRelease from '@/components/TrendingRelease';
import ImageGrid from '@/components/ImageGrid';
import AudioPlayer from '@/components/AudioPlayer';
import HomeOnboarding from '@/components/HomeOnboarding';

const HomePage = () => {
  const [bookData, setBookData] = useState([]);
  const [latestRelease, setLatestRelease] = useState([]);

  useEffect(() => {
    setBookData(eBookData);
    setLatestRelease(eBookData.map((book) => ({
      coverImage: book.coverImage,
      id: book.id
    })).slice(5, 9));
  }, []);

  const SectionTitle = ({ title }) => (
    <View style={styles.sectionTitleContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.titleUnderline} />
    </View>
  );

  return (
    <SafeAreaView style={[defaultStyles.container, styles.container]}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.homeBar}>
          <Text style={styles.homeBarLogo}>LOGO</Text>
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={() => router.push('(tabs)/search')}
          >
            <EvilIcons name="search" size={28} color="#4A4DFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.onboardingContainer}>
          <HomeOnboarding />
        </View>

        <View style={styles.trendingSection}>
          <SectionTitle title="Trending Release" />
          <View style={styles.trendingContent}>
            <TrendingRelease bookData={bookData} />
          </View>
        </View>

        <View style={styles.newReleaseSection}>
          <SectionTitle title="New Release" />
          <View style={styles.newReleaseContainer}>
            <ImageGrid images={latestRelease} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomePage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    paddingBottom: moderateScale(20),
  },
  homeBar: {
    height: verticalScale(70),
    backgroundColor: 'rgba(74, 77, 255, 0.1)',
    borderBottomLeftRadius: moderateScale(15),
    borderBottomRightRadius: moderateScale(15),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: moderateScale(15),
    borderBottomWidth: 1,
    borderBottomColor: '#4A4DFF',
  },
  homeBarLogo: {
    fontSize: moderateScale(24),
    color: '#4A4DFF',
    fontWeight: '700',
  },
  searchButton: {
    padding: moderateScale(10),
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: moderateScale(12),
  },
  onboardingContainer: {
    marginTop: moderateScale(20),
    marginBottom: moderateScale(30),
  },
  sectionTitleContainer: {
    marginBottom: moderateScale(15),
    paddingHorizontal: moderateScale(15),
  },
  sectionTitle: {
    fontSize: moderateScale(24),
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: moderateScale(8),
  },
  titleUnderline: {
    height: 3,
    width: '30%',
    backgroundColor: '#6366F1',
    borderRadius: moderateScale(2),
  },
  trendingSection: {
    marginBottom: moderateScale(30),
  },
  trendingContent: {
    paddingHorizontal: moderateScale(15),
  },
  newReleaseSection: {
    marginBottom: moderateScale(20),
  },
  newReleaseContainer: {
    paddingHorizontal: moderateScale(15),
  },
});