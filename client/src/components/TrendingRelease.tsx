import { StyleSheet, Text, View, TouchableOpacity, Image, Animated } from 'react-native';
import React, { useRef } from 'react';
import { horizontalScale, moderateScale, verticalScale } from '@/utils/responsiveSize';
import { FONT } from '@/constants/tokens';
import FlatlistDynamic from './FlatlistDynamic';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/providers/ThemeProvider';

const TrendingRelease = ({ bookData }) => {
  const { theme } = useTheme();
  const scaleValue = useRef(new Animated.Value(1)).current;
  const opacityValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: 0.97,
        useNativeDriver: true,
      }),
      Animated.timing(opacityValue, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(opacityValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const renderItem = ({ item }) => {
    const {
      id,
      title,
      coverImage,
      authorName,
      rating,
      durationInHours,
      durationInMinutes,
      releaseDate,
      categories,
      listens = 0,
      isNew = false,
    } = item;

const checkIfNew = (releaseDate) => {
  const newReleaseDate = new Date(releaseDate);
  const now = new Date();

  // Calculate difference in milliseconds
  const diffInMs = now.getTime() - newReleaseDate.getTime();

  // One week in milliseconds
  const oneWeekInMs = 7 * 24 * 60 * 60 * 1000;

  const isOverAWeek = diffInMs > oneWeekInMs;

  return !isOverAWeek
}
    

    return (
      <Animated.View style={{ transform: [{ scale: scaleValue }], opacity: opacityValue }}>
        <TouchableOpacity
          onPress={() => router.push(`/(tabs)/home/${id}`)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
        >
          <View style={[styles.cardContainer, { backgroundColor: theme.white, shadowColor: theme.text }]}>
            {/* Cover Image */}
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: coverImage || 'https://via.placeholder.com/150' }}
                style={styles.coverImage}
                resizeMode="contain"
              />
              {checkIfNew(releaseDate) && (
                <View style={[styles.newBadge, { backgroundColor: theme.primary }]}>
                  <Text style={[styles.newBadgeText, { color: theme.white }]}>NEW</Text>
                </View>
              )}
            </View>

            {/* Book Details */}
            <View style={[styles.detailsContainer, { backgroundColor: theme.white }]}>
              <View style={styles.titleContainer}>
                <Text style={[styles.bookTitle, { color: theme.text }]} numberOfLines={1}>
                  {title || 'Unknown Title'}
                </Text>
                <Text style={[styles.bookAuthor, { color: theme.textMuted }]} numberOfLines={1}>
                  {authorName || 'Unknown Author'}
                </Text>
              </View>

              {/* Rating Section with improved visual */}
              <View style={[styles.ratingContainer, { backgroundColor: `${theme.primary}15` }]}>
                {[...Array(5)].map((_, index) => (
                  <Ionicons
                    key={index}
                    name={index < Math.floor(rating || 0) ? 'star' : 'star-outline'}
                    size={moderateScale(14)}
                    color={index < Math.floor(rating || 0) ? theme.tertiary : theme.textMuted}
                  />
                ))}
                <Text style={[styles.ratingText, { color: theme.primary }]}>
                  {rating ? `${rating.toFixed(1)}` : 'N/A'}
                </Text>
              </View>

              {/* Info Row */}
              <View style={[styles.infoRow, { backgroundColor: theme.lightWhite }]}>
                <View style={styles.infoItem}>
                  <Ionicons name="time-outline" size={moderateScale(14)} color={theme.primary} />
                  <Text style={[styles.infoText, { color: theme.text }]}>
                    {`${durationInHours || 0}h ${durationInMinutes || 0}m`}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="headset-outline" size={moderateScale(14)} color={theme.secondary} />
                  <Text style={[styles.infoText, { color: theme.text }]}>
                    {listens > 999 ? `${(listens/1000).toFixed(1)}K` : listens}
                  </Text>
                </View>
              </View>

              {/* Categories as Tags */}
              <View style={styles.categoryContainer}>
                {categories && categories.split(',').slice(0, 2).map((category, index) => (
                  <View key={index} style={[styles.categoryTag, { backgroundColor: `${theme.primary}15` }]}>
                    <Text style={[styles.categoryText, { color: theme.primary }]}>{category.trim()}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const styles = StyleSheet.create({
    cardContainer: {
      width: horizontalScale(180),
      margin: moderateScale(10),
      borderRadius: moderateScale(16),
      shadowOffset: { width: 0, height: 5 },

      shadowRadius: 8,
      elevation: 7,
      overflow: 'hidden',
    },
    imageContainer: {
      position: 'relative',
      width: '100%',
      height: verticalScale(220),
    },
    coverImage: {
      width: '100%',
      height: '100%',
      borderTopLeftRadius: moderateScale(16),
      borderTopRightRadius: moderateScale(16),
    },
    newBadge: {
      position: 'absolute',
      top: moderateScale(10),
      right: moderateScale(10),
      paddingHorizontal: moderateScale(8),
      paddingVertical: moderateScale(4),
      borderRadius: moderateScale(12),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },

      shadowRadius: 3,
      elevation: 3,
    },
    newBadgeText: {
      fontSize: moderateScale(10),
      fontFamily: FONT.notoBold,
    },
    detailsContainer: {
      padding: moderateScale(12),
      borderBottomLeftRadius: moderateScale(16),
      borderBottomRightRadius: moderateScale(16),
    },
    titleContainer: {
      marginBottom: moderateScale(8),
    },
    bookTitle: {
      fontSize: moderateScale(16),
      fontFamily: FONT.notoBold,
      marginBottom: moderateScale(2),
    },
    bookAuthor: {
      fontSize: moderateScale(14),
      fontFamily: FONT.notoMedium,
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: moderateScale(8),
      paddingVertical: moderateScale(4),
      paddingHorizontal: moderateScale(8),
      borderRadius: moderateScale(12),
      alignSelf: 'flex-start',
    },
    ratingText: {
      fontSize: moderateScale(12),
      fontFamily: FONT.notoBold,
      marginLeft: moderateScale(6),
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: moderateScale(10),
      padding: moderateScale(8),
      borderRadius: moderateScale(12),
    },
    infoItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    infoText: {
      fontSize: moderateScale(12),
      fontFamily: FONT.notoMedium,
      marginLeft: moderateScale(4),
    },
    categoryContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: moderateScale(4),
    },
    categoryTag: {
      paddingHorizontal: moderateScale(8),
      paddingVertical: moderateScale(4),
      borderRadius: moderateScale(12),
      marginRight: moderateScale(6),
      marginBottom: moderateScale(4),
    },
    categoryText: {
      fontSize: moderateScale(10),
      fontFamily: FONT.notoMedium,
    },
  });

  return (
    <FlatlistDynamic
      renderItem={renderItem}
      bookData={bookData}
    />
  );
};

export default TrendingRelease;
