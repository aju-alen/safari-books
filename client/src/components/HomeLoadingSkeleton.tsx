import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, ScrollView, Animated } from 'react-native';
import { moderateScale, verticalScale, horizontalScale } from '@/utils/responsiveSize';
import { useTheme } from '@/providers/ThemeProvider';

const { width } = Dimensions.get('window');

const SkeletonItem = ({ width: itemWidth, height, borderRadius, style = {} }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const {theme} = useTheme()

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width: itemWidth,
          height,
          borderRadius,
          backgroundColor: theme.primary,
          opacity,
        },
        style,
      ]}
    />
  );
};

const HomeLoadingSkeleton = () => {
  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.headerTop}>
          <View style={styles.logoContainer}>
            <SkeletonItem width={moderateScale(40)} height={moderateScale(40)} borderRadius={moderateScale(20)} />
            <SkeletonItem width={horizontalScale(120)} height={moderateScale(20)} borderRadius={moderateScale(10)} />
          </View>
          <View style={styles.headerActions}>
            <SkeletonItem width={moderateScale(40)} height={moderateScale(40)} borderRadius={moderateScale(20)} />
            <SkeletonItem width={moderateScale(40)} height={moderateScale(40)} borderRadius={moderateScale(20)} />
          </View>
        </View>
        
        <View style={styles.welcomeSection}>
          <SkeletonItem width={horizontalScale(200)} height={moderateScale(24)} borderRadius={moderateScale(12)} />
          <SkeletonItem width={horizontalScale(250)} height={moderateScale(16)} borderRadius={moderateScale(8)} />
        </View>

        {/* Hero Book Card */}
        <View style={styles.heroBookCard}>
          <View style={styles.heroContent}>
            <SkeletonItem width={horizontalScale(100)} height={verticalScale(150)} borderRadius={moderateScale(12)} />
            <View style={styles.heroInfo}>
              <SkeletonItem width={horizontalScale(80)} height={moderateScale(20)} borderRadius={moderateScale(10)} />
              <SkeletonItem width="100%" height={moderateScale(18)} borderRadius={moderateScale(9)} />
              <SkeletonItem width={horizontalScale(120)} height={moderateScale(14)} borderRadius={moderateScale(7)} />
              <View style={styles.heroMeta}>
                <SkeletonItem width={horizontalScale(60)} height={moderateScale(12)} borderRadius={moderateScale(6)} />
                <SkeletonItem width={horizontalScale(80)} height={moderateScale(12)} borderRadius={moderateScale(6)} />
              </View>
              <SkeletonItem width={horizontalScale(100)} height={moderateScale(36)} borderRadius={moderateScale(18)} />
            </View>
          </View>
        </View>
      </View>

      {/* Continue Listening Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <SkeletonItem width={horizontalScale(150)} height={moderateScale(22)} borderRadius={moderateScale(11)} />
          <SkeletonItem width={horizontalScale(60)} height={moderateScale(16)} borderRadius={moderateScale(8)} />
        </View>
        <SkeletonItem width={horizontalScale(200)} height={moderateScale(14)} borderRadius={moderateScale(7)} />
        <View style={styles.horizontalScroll}>
          {[1, 2, 3, 4].map((_, index) => (
            <View key={index} style={styles.bookCard}>
              <SkeletonItem width="100%" height={verticalScale(180)} borderRadius={moderateScale(12)} />
              <View style={styles.bookInfo}>
                <SkeletonItem width="100%" height={moderateScale(14)} borderRadius={moderateScale(7)} />
                <SkeletonItem width={horizontalScale(80)} height={moderateScale(12)} borderRadius={moderateScale(6)} />
                <SkeletonItem width={horizontalScale(60)} height={moderateScale(11)} borderRadius={moderateScale(5.5)} />
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Categories Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <SkeletonItem width={horizontalScale(150)} height={moderateScale(22)} borderRadius={moderateScale(11)} />
        </View>
        <SkeletonItem width={horizontalScale(200)} height={moderateScale(14)} borderRadius={moderateScale(7)} />
        <View style={styles.categoriesGrid}>
          {[1, 2, 3, 4, 5, 6].map((_, index) => (
            <View key={index} style={styles.categoryCard}>
              <SkeletonItem width={moderateScale(50)} height={moderateScale(50)} borderRadius={moderateScale(25)} />
              <SkeletonItem width={horizontalScale(60)} height={moderateScale(12)} borderRadius={moderateScale(6)} />
            </View>
          ))}
        </View>
      </View>

      {/* Trending Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <SkeletonItem width={horizontalScale(150)} height={moderateScale(22)} borderRadius={moderateScale(11)} />
          <SkeletonItem width={horizontalScale(60)} height={moderateScale(16)} borderRadius={moderateScale(8)} />
        </View>
        <SkeletonItem width={horizontalScale(200)} height={moderateScale(14)} borderRadius={moderateScale(7)} />
        <View style={styles.trendingContent}>
          {[1, 2, 3].map((_, index) => (
            <View key={index} style={styles.trendingItem}>
              <SkeletonItem width={moderateScale(48)} height={moderateScale(48)} borderRadius={moderateScale(8)} />
              <View style={styles.trendingInfo}>
                <SkeletonItem width="80%" height={moderateScale(14)} borderRadius={moderateScale(7)} />
                <SkeletonItem width="60%" height={moderateScale(12)} borderRadius={moderateScale(6)} />
                <View style={styles.trendingMeta}>
                  <SkeletonItem width={horizontalScale(40)} height={moderateScale(12)} borderRadius={moderateScale(6)} />
                  <SkeletonItem width={horizontalScale(60)} height={moderateScale(12)} borderRadius={moderateScale(6)} />
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Recently Added Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <SkeletonItem width={horizontalScale(150)} height={moderateScale(22)} borderRadius={moderateScale(11)} />
          <SkeletonItem width={horizontalScale(60)} height={moderateScale(16)} borderRadius={moderateScale(8)} />
        </View>
        <SkeletonItem width={horizontalScale(200)} height={moderateScale(14)} borderRadius={moderateScale(7)} />
        <View style={styles.horizontalScroll}>
          {[1, 2, 3].map((_, index) => (
            <View key={index} style={styles.bookCard}>
              <SkeletonItem width="100%" height={verticalScale(180)} borderRadius={moderateScale(12)} />
              <View style={styles.bookInfo}>
                <SkeletonItem width="100%" height={moderateScale(14)} borderRadius={moderateScale(7)} />
                <SkeletonItem width={horizontalScale(80)} height={moderateScale(12)} borderRadius={moderateScale(6)} />
                <SkeletonItem width={horizontalScale(60)} height={moderateScale(11)} borderRadius={moderateScale(5.5)} />
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: verticalScale(30),
  },
  headerSection: {
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
    gap: horizontalScale(10),
  },
  headerActions: {
    flexDirection: 'row',
    gap: horizontalScale(10),
  },
  welcomeSection: {
    marginBottom: verticalScale(20),
    gap: verticalScale(5),
  },
  heroBookCard: {
    borderRadius: moderateScale(20),
    padding: moderateScale(20),
    height: verticalScale(200),
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
    gap: horizontalScale(15),
  },
  heroInfo: {
    flex: 1,
    height: '100%',
    justifyContent: 'space-between',
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(15),
  },
  section: {
    marginTop: verticalScale(30),
    paddingHorizontal: horizontalScale(20),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(5),
  },
  horizontalScroll: {
    flexDirection: 'row',
    gap: horizontalScale(15),
    marginTop: verticalScale(15),
  },
  bookCard: {
    width: horizontalScale(140),
    borderRadius: moderateScale(16),
    padding: moderateScale(12),
    gap: verticalScale(10),
  },
  bookInfo: {
    flex: 1,
    gap: verticalScale(4),
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: horizontalScale(12),
    marginTop: verticalScale(15),
  },
  categoryCard: {
    width: (width - horizontalScale(52) - horizontalScale(36)) / 3,
    aspectRatio: 1,
    borderRadius: moderateScale(16),
    padding: moderateScale(15),
    alignItems: 'center',
    justifyContent: 'center',
    gap: verticalScale(8),
  },
  trendingContent: {
    marginHorizontal: -horizontalScale(20),
    marginTop: verticalScale(15),
  },
  trendingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(12),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    gap: horizontalScale(12),
  },
  trendingInfo: {
    flex: 1,
    gap: verticalScale(8),
  },
  trendingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(15),
  },
});

export default HomeLoadingSkeleton; 