import HomeOnboarding from '@/components/HomeOnboarding';
import ImageGrid from '@/components/ImageGrid';
import TrendingRelease from '@/components/TrendingRelease';
import { defaultStyles } from '@/styles';

import { eBookData } from '@/utils/flatlistData';
import { moderateScale, verticalScale, horizontalScale } from '@/utils/responsiveSize';
import { EvilIcons, Ionicons, MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ipURL } from '@/utils/backendURL';

import axios from 'axios';
import { router } from 'expo-router';

import { useTheme } from '@/providers/ThemeProvider';
import { axiosWithAuth } from '@/utils/customAxios';

const { width } = Dimensions.get('window');

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
  }[]
};

const HomePage = () => {
  const [bookData, setBookData] = useState<BookData>();
  const [latestRelease, setLatestRelease] = useState([]);
  const [continueListeningBooks, setContinueListeningBooks] = useState([]);
  const [featuredBook, setFeaturedBook] = useState(null);

  const {theme} = useTheme()

  const getBooksData = async()=>{
    const resp = await axios.get(`${ipURL}/api/listeners/books-data`);
    setBookData(resp.data);
    setLatestRelease(resp.data.books.map((book ) => ({
      coverImage: book.coverImage,
      id: book.id
    })));
  }

  const getContinueListeningBooks = async () => {
    try {
      const response = await axiosWithAuth.get(`${ipURL}/api/library/books/IN_PROGRESS`);
      setContinueListeningBooks(response.data.books || []);
    } catch (error) {
      console.error('Error fetching continue listening books:', error);
      setContinueListeningBooks([]);
    }
  };

  const getFeaturedBook = async () => {
    try {
      const response = await axios.get(`${ipURL}/api/listeners/featured-books`);
      if (response.data.featuredBooks && response.data.featuredBooks.length > 0) {
        setFeaturedBook(response.data.featuredBooks[0]); // Get the first featured book
      }
    } catch (error) {
      console.error('Error fetching featured book:', error);
    }
  };

  useEffect(()=>{
    getBooksData();
    getContinueListeningBooks();
    getFeaturedBook();
  },[])

  const SectionTitle = ({ title, subtitle, onPress, showBadge }: { title: string; subtitle?: string; onPress?: () => void; showBadge?: boolean }) => (
    <View style={styles.sectionTitleContainer}>
      <View style={styles.sectionTitleRow}>
        <View style={styles.titleContainer}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
          {showBadge && (
            <View style={[styles.badge, { backgroundColor: theme.tertiary }]}>
              <Text style={[styles.badgeText, { color: theme.white }]}>NEW</Text>
            </View>
          )}
        </View>
        {onPress && (
          <TouchableOpacity onPress={onPress} style={styles.seeAllButton}>
            <Text style={[styles.seeAllText, { color: theme.secondary }]}>See All</Text>
            <Ionicons name="chevron-forward" size={16} color={theme.secondary} />
          </TouchableOpacity>
        )}
      </View>
      {subtitle && <Text style={[styles.sectionSubtitle, { color: theme.textMuted }]}>{subtitle}</Text>}
    </View>
  );

  const HeroBookCard = ({ book }) => (
    <TouchableOpacity 
      style={[styles.heroBookCard, { backgroundColor: theme.primary, shadowColor: theme.primary }]}
      onPress={() => router.push(`/(tabs)/home/${book.id}`)}
    >
      <View style={styles.heroContent}>
        <Image source={{ uri: book.coverImage }} style={styles.heroCover} resizeMode='contain' />
        <View style={styles.heroInfo}>
          <View style={[styles.heroBadge, { backgroundColor: theme.white }]}>
            <Text style={[styles.heroBadgeText, { color: theme.primary }]}>FEATURED</Text>
          </View>
          <Text style={[styles.heroTitle, { color: theme.white }]} numberOfLines={2}>{book.title}</Text>
          <Text style={[styles.heroAuthor, { color: theme.white, opacity: 0.8 }]}>{book.authorName}</Text>
          <View style={styles.heroMeta}>
            <View style={styles.heroRating}>
              <Ionicons name="eye-outline" size={14} color={theme.white} />
              <Text style={[styles.heroRatingText, { color: theme.white }]}>{book._count.Library}</Text>
            </View>
            <Text style={[styles.heroDuration, { color: theme.white, opacity: 0.8 }]}>
              {book.durationInHours}h {book.durationInMinutes}m
            </Text>
          </View>
          <TouchableOpacity 
            style={[styles.heroPlayButton, { backgroundColor: theme.tertiary }]}
            onPress={(e) => {
              e.stopPropagation();
              router.push(`/(tabs)/home/${book.id}`);
            }}
          >
            <Ionicons name="play" size={20} color={theme.white} />
            <Text style={[styles.heroPlayText, { color: theme.white }]}>Listen Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const BookCard = ({ book, isContinue = false, isLarge = false }) => (
    <TouchableOpacity style={[styles.bookCard, isLarge && styles.largeBookCard, { backgroundColor: theme.white, borderColor: theme.gray2, shadowColor: theme.text }]}>
      <View style={styles.bookCardHeader}>
        <Image source={{ uri: book.coverImage }} style={[styles.bookCover, isLarge && styles.largeBookCover]} />
        {book.isNew && (
          <View style={[styles.newBadge, { backgroundColor: theme.tertiary }]}>
            <Text style={[styles.newBadgeText, { color: theme.white }]}>NEW</Text>
          </View>
        )}
      </View>
      <View style={styles.bookInfo}>
        <Text style={[styles.bookTitle, isLarge && styles.largeBookTitle, { color: theme.text }]} numberOfLines={2}>{book.title}</Text>
        <Text style={[styles.bookAuthor, { color: theme.textMuted }]}>{book.authorName}</Text>
        <View style={styles.bookMeta}>
          <View style={styles.bookRating}>
            <Ionicons name="star" size={12} color={theme.tertiary} />
            <Text style={[styles.bookRatingText, { color: theme.textMuted }]}>{book.rating}</Text>
          </View>
          <Text style={[styles.bookDuration, { color: theme.textMuted }]}>
            {book.durationInHours}h {book.durationInMinutes}m
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const CategoryCard = ({ icon, title, color, onPress }: { icon: keyof typeof Ionicons.glyphMap; title: string; color: string; onPress: () => void }) => (
    <TouchableOpacity style={[styles.categoryCard, { shadowColor: theme.text }]} onPress={onPress}>
      <View style={[styles.categoryContent, { backgroundColor: color }]}>
        <View style={styles.categoryIconContainer}>
          <Ionicons name={icon} size={28} color={theme.white} />
        </View>
        <Text style={[styles.categoryTitle, { color: theme.white }]}>{title}</Text>
      </View>
    </TouchableOpacity>
  );

  const QuickActionCard = ({ icon, title, subtitle, color, onPress }) => (
    <TouchableOpacity style={[styles.quickActionCard, { backgroundColor: theme.white, borderColor: theme.gray2, shadowColor: theme.text }]} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={24} color={theme.white} />
      </View>
      <View style={styles.quickActionContent}>
        <Text style={[styles.quickActionTitle, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.quickActionSubtitle, { color: theme.textMuted }]}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.secondary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[defaultStyles.container, { flex: 1, backgroundColor: theme.background }]}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Header */}
        <View
          style={[styles.heroHeader, {backgroundColor: theme.background}]}
        >
          <View style={styles.headerTop}>
            <View style={styles.logoContainer}>
              <Image 
                style={styles.logo}
                source={require('../../../../assets/sbLogo.png')}
                resizeMode="contain"
              />
              <Text style={[styles.appName, { color: theme.text }]}>Safari Books</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={[styles.headerButton, { backgroundColor: theme.white, shadowColor: theme.text }]}>
                <Ionicons name="notifications-outline" size={24} color={theme.text} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.headerButton, { backgroundColor: theme.white, shadowColor: theme.text }]}>
                <Ionicons name="search" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.welcomeSection}>
            <Text style={[styles.welcomeText, { color: theme.text }]}>Welcome back! 👋</Text>
            <Text style={[styles.welcomeSubtext, { color: theme.textMuted }]}>Ready to dive into your next adventure?</Text>
          </View>

          {/* Hero Book */}
          {featuredBook ? (
            <HeroBookCard book={featuredBook} />
          ) : bookData?.books && bookData.books.length > 0 && (
            <HeroBookCard book={bookData.books[0]} />
          )}
        </View>

        {/* Continue Listening */}
        {continueListeningBooks.length > 0 && (
          <View style={styles.section}>
            <SectionTitle 
              title="Continue Listening" 
              subtitle="Pick up where you left off"
              onPress={() => router.push({pathname: '/(tabs)/home/allAudioBooks', params: {continue:"continue"}})}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {continueListeningBooks.slice(0, 4).map((book, index) => (
                <BookCard key={index} book={book} isContinue={true} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Categories */}
        <View style={styles.section}>
          <SectionTitle title="Explore Categories" subtitle="Find your perfect genre" />
          <View style={styles.categoriesGrid}>
            <CategoryCard 
              icon="book-outline" 
              title="Fiction" 
              color={theme.secondary}
              onPress={() => router.push({pathname: '/(tabs)/home/allAudioBooks', params: {category: 'fiction'}})}
            />
            <CategoryCard 
              icon="bulb-outline" 
              title="Self-Help" 
              color={theme.primary}
              onPress={() => router.push({pathname: '/(tabs)/home/allAudioBooks', params: {category: 'selfhelp'}})}
            />
            <CategoryCard 
              icon="trending-up-outline" 
              title="Business" 
              color={theme.tertiary}
              onPress={() => router.push({pathname: '/(tabs)/home/allAudioBooks', params: {category: 'business'}})}
            />
            <CategoryCard 
              icon="school-outline" 
              title="Education" 
              color={theme.secondary2}
              onPress={() => router.push({pathname: '/(tabs)/home/allAudioBooks', params: {category: 'education'}})}
            />
            <CategoryCard 
              icon="heart-outline" 
              title="Romance" 
              color={theme.primary}
              onPress={() => router.push({pathname: '/(tabs)/home/allAudioBooks', params: {category: 'romance'}})}
            />
            <CategoryCard 
              icon="flash-outline" 
              title="Thriller" 
              color={theme.secondary}
              onPress={() => router.push({pathname: '/(tabs)/home/allAudioBooks', params: {category: 'thriller'}})}
            />
          </View>
        </View>

        {/* Trending Release */}
        <View style={styles.section}>
          <SectionTitle 
            title="Trending Now" 
            subtitle="Most popular this week"
            onPress={() => router.push({pathname: '/(tabs)/home/allAudioBooks', params: {trending:"trending"}})}
            showBadge={true}
          />
          <View style={styles.trendingContent}>
            <TrendingRelease bookData={bookData?.books} />
          </View>
        </View>

        {/* Recently Added */}
        {bookData?.books && bookData.books.length < 7 && (
          <View style={styles.section}>
            <SectionTitle 
              title="Recently Added" 
              subtitle="Latest additions to our library"
              onPress={() => router.push({pathname: '/(tabs)/home/allAudioBooks', params: {recent:"recent"}})}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {bookData.books.slice(7, 10).map((book, index) => (
                <BookCard key={index} book={book} />
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomePage;

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: verticalScale(30),
  },
  heroHeader: {
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(30),
    paddingHorizontal: horizontalScale(20),
    borderBottomLeftRadius: moderateScale(30),
    borderBottomRightRadius: moderateScale(30),
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(20),
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: moderateScale(40),
    height: moderateScale(40),
    marginRight: horizontalScale(10),
  },
  appName: {
    fontSize: moderateScale(20),
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    gap: horizontalScale(10),
  },
  headerButton: {
    padding: moderateScale(8),
    borderRadius: moderateScale(20),
    shadowOffset: { width: 0, height: 2 },

    shadowRadius: 4,
    elevation: 3,
  },
  welcomeSection: {
    marginBottom: verticalScale(20),
  },
  welcomeText: {
    fontSize: moderateScale(24),
    fontWeight: '700',
    marginBottom: verticalScale(5),
  },
  welcomeSubtext: {
    fontSize: moderateScale(16),
  },
  heroBookCard: {
    borderRadius: moderateScale(20),
    padding: moderateScale(20),
    shadowOffset: { width: 0, height: 8 },

    shadowRadius: 16,
    elevation: 8,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroCover: {
    width: horizontalScale(100),
    height: verticalScale(150),
    borderRadius: moderateScale(12),
    marginRight: horizontalScale(15),
  },
  heroInfo: {
    flex: 1,
  },
  heroBadge: {
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(4),
    borderRadius: moderateScale(12),
    alignSelf: 'flex-start',
    marginBottom: verticalScale(8),
  },
  heroBadgeText: {
    fontSize: moderateScale(10),
    fontWeight: '700',
  },
  heroTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    marginBottom: verticalScale(4),
    lineHeight: moderateScale(22),
  },
  heroAuthor: {
    fontSize: moderateScale(14),
    marginBottom: verticalScale(8),
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  heroRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: horizontalScale(15),
  },
  heroRatingText: {
    fontSize: moderateScale(12),
    marginLeft: horizontalScale(4),
  },
  heroDuration: {
    fontSize: moderateScale(12),
  },
  heroPlayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(8),
    borderRadius: moderateScale(20),
    alignSelf: 'flex-start',
  },
  heroPlayText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    marginLeft: horizontalScale(6),
  },
  quickActionsSection: {
    marginTop: verticalScale(-15),
    paddingHorizontal: horizontalScale(20),
    zIndex: 1,
  },
  quickActionCard: {
    borderRadius: moderateScale(16),
    padding: moderateScale(16),
    marginBottom: verticalScale(12),
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },

    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: horizontalScale(12),
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    marginBottom: verticalScale(2),
  },
  quickActionSubtitle: {
    fontSize: moderateScale(12),
  },
  section: {
    marginTop: verticalScale(30),
    paddingHorizontal: horizontalScale(20),
  },
  sectionTitleContainer: {
    marginBottom: verticalScale(15),
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(5),
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: moderateScale(22),
    fontWeight: '700',
  },
  badge: {
    paddingHorizontal: moderateScale(6),
    paddingVertical: moderateScale(2),
    borderRadius: moderateScale(8),
    marginLeft: horizontalScale(8),
  },
  badgeText: {
    fontSize: moderateScale(10),
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: moderateScale(14),
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(5),
  },
  seeAllText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
  },
  horizontalScroll: {
    marginHorizontal: -horizontalScale(20),
    paddingHorizontal: horizontalScale(20),
  },
  bookCard: {
    width: horizontalScale(140),
    marginRight: horizontalScale(15),
    borderRadius: moderateScale(16),
    padding: moderateScale(12),
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },

    shadowRadius: 4,
    elevation: 3,
  },
  largeBookCard: {
    width: horizontalScale(160),
  },
  bookCardHeader: {
    position: 'relative',
  },
  bookCover: {
    width: '100%',
    height: verticalScale(180),
    borderRadius: moderateScale(12),
    marginBottom: verticalScale(10),
  },
  largeBookCover: {
    height: verticalScale(200),
  },
  progressContainer: {
    position: 'absolute',
    bottom: verticalScale(70),
    left: moderateScale(12),
    right: moderateScale(12),
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: moderateScale(6),
    padding: moderateScale(6),
  },
  progressBar: {
    height: moderateScale(4),
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: moderateScale(2),
    marginBottom: verticalScale(3),
  },
  progressFill: {
    height: '100%',
    borderRadius: moderateScale(2),
  },
  progressText: {
    fontSize: moderateScale(10),
    textAlign: 'center',
    fontWeight: '600',
  },
  newBadge: {
    position: 'absolute',
    top: moderateScale(8),
    right: moderateScale(8),
    paddingHorizontal: moderateScale(6),
    paddingVertical: moderateScale(2),
    borderRadius: moderateScale(8),
  },
  newBadgeText: {
    fontSize: moderateScale(8),
    fontWeight: '700',
  },
  continueBadge: {
    position: 'absolute',
    top: moderateScale(8),
    left: moderateScale(8),
    paddingHorizontal: moderateScale(6),
    paddingVertical: moderateScale(2),
    borderRadius: moderateScale(8),
  },
  continueBadgeText: {
    fontSize: moderateScale(8),
    fontWeight: '700',
  },
  bookInfo: {
    flex: 1,
  },
  bookTitle: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    marginBottom: verticalScale(4),
    lineHeight: moderateScale(18),
  },
  largeBookTitle: {
    fontSize: moderateScale(16),
  },
  bookAuthor: {
    fontSize: moderateScale(12),
    marginBottom: verticalScale(6),
  },
  bookMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bookRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookRatingText: {
    fontSize: moderateScale(11),
    marginLeft: horizontalScale(4),
  },
  bookDuration: {
    fontSize: moderateScale(11),
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: horizontalScale(12),
  },
  categoryCard: {
    width: (width - horizontalScale(52) - horizontalScale(36)) / 3,
    aspectRatio: 1,
    borderRadius: moderateScale(16),
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },

    shadowRadius: 8,
    elevation: 5,
  },
  categoryContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: moderateScale(15),
  },
  categoryIconContainer: {
    width: moderateScale(50),
    height: moderateScale(50),
    borderRadius: moderateScale(25),
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  categoryTitle: {
    fontSize: moderateScale(12),
    fontWeight: '700',
    textAlign: 'center',
  },
  trendingContent: {
    marginHorizontal: -horizontalScale(20),
  },
  newReleaseContainer: {
    marginHorizontal: -horizontalScale(20),
    paddingHorizontal: horizontalScale(20),
  },
});