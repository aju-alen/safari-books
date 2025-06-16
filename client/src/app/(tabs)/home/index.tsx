import HomeOnboarding from '@/components/HomeOnboarding';
import ImageGrid from '@/components/ImageGrid';
import TrendingRelease from '@/components/TrendingRelease';
import { defaultStyles } from '@/styles';

import { eBookData } from '@/utils/flatlistData';
import { moderateScale, verticalScale } from '@/utils/responsiveSize';
import { EvilIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ipURL } from '@/utils/backendURL';
import axios from 'axios';

type BookData = {
  books: {
    id: string;
    title: string;
    coverImage: string;
    authorName: string;
    rating: number;
    durationInHours: number;
    durationInMinutes: number;
    releaseDate: string;
    categories: string[];
    listens?: number;
    isNew?: boolean;
  }
};

const HomePage = () => {
  const [bookData, setBookData] = useState<BookData>();
  const [latestRelease, setLatestRelease] = useState([]);

  // useEffect(() => {
  //   setBookData(eBookData);
  //   setLatestRelease(eBookData.map((book) => ({
  //     coverImage: book.coverImage,
  //     id: book.id
  //   })).slice(5, 9));
  // }, []);

  const getBooksData = async()=>{
    const resp = await axios.get(`${ipURL}/api/listeners//books-data`);
    setBookData(resp.data);
    setLatestRelease(resp.data.books.map((book ) => ({
      coverImage: book.coverImage,
      id: book.id
    })));
  }
  useEffect(()=>{
    getBooksData();
  },[])

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
          <Image 
            style={styles.homeBarLogo}
            source={require('../../../../assets/sbLogo.png')}
            resizeMode="contain"
          />
          <TouchableOpacity 
            style={styles.searchButton}
            // onPress={() => router.push('(tabs)/search')}
          >
            <EvilIcons name="search" size={30} color="#4A4DFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.onboardingContainer}>
          <HomeOnboarding />
        </View>

        <View style={styles.trendingSection}>
          <SectionTitle title="Trending Release" />
          <View style={styles.trendingContent}>
            <TrendingRelease bookData={bookData?.books} />
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
    paddingBottom: moderateScale(30),
  },
  homeBar: {
    height: verticalScale(70),
    backgroundColor: 'rgba(74, 77, 255, 0.15)',
    borderBottomLeftRadius: moderateScale(20),
    borderBottomRightRadius: moderateScale(20),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: moderateScale(18),
    borderBottomWidth: 1.5,
    borderBottomColor: '#4A4DFF',
    shadowColor: '#4A4DFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  homeBarLogo: {
    width: moderateScale(65),
    height: moderateScale(65),
  },
  searchButton: {
    padding: moderateScale(12),
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderRadius: moderateScale(15),
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  onboardingContainer: {
    marginTop: moderateScale(25),
    marginBottom: moderateScale(35),
    paddingHorizontal: moderateScale(10),
  },
  sectionTitleContainer: {
    marginBottom: moderateScale(18),
    paddingHorizontal: moderateScale(15),
  },
  sectionTitle: {
    fontSize: moderateScale(26),
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: moderateScale(10),
    letterSpacing: 0.5,
  },
  titleUnderline: {
    height: 4,
    width: '35%',
    backgroundColor: '#6366F1',
    borderRadius: moderateScale(4),
  },
  trendingSection: {
    marginBottom: moderateScale(35),
  },
  trendingContent: {
    paddingHorizontal: moderateScale(15),
  },
  newReleaseSection: {
    marginBottom: moderateScale(25),
  },
  newReleaseContainer: {
    paddingHorizontal: moderateScale(15),
  },
});