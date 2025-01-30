import { StyleSheet, Text, View, TouchableOpacity, Image, Animated } from 'react-native';
import React, { useRef } from 'react';
import { horizontalScale, moderateScale, verticalScale } from '@/utils/responsiveSize';
import { FONT } from '@/constants/tokens';
import FlatlistDynamic from './FlatlistDynamic';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const TrendingRelease = ({ bookData }) => {
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
    } = item;

    return (
      <Animated.View style={{ transform: [{ scale: scaleValue }], opacity: opacityValue }}>
        <TouchableOpacity
          onPress={() => router.push(`/(tabs)/home/${id}`)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
        >
          <View style={styles.cardContainer}>
            {/* Cover Image */}
            <Image
              source={{ uri: coverImage || 'https://via.placeholder.com/150' }}
              style={styles.coverImage}
              resizeMode="cover"
            />

            {/* Book Details */}
            <View style={styles.detailsContainer}>
              <Text style={styles.bookTitle} numberOfLines={1}>
                {title || 'Unknown Title'}
              </Text>
              <Text style={styles.bookAuthor} numberOfLines={1}>
                {authorName || 'Unknown Author'}
              </Text>

              {/* Duration */}
              <Text style={styles.durationText}>
                ⏳ {`${durationInHours || 0}h ${durationInMinutes || 0}m`}
              </Text>

              {/* Rating Section */}
              <View style={styles.ratingContainer}>
                {[...Array(5)].map((_, index) => (
                  <Ionicons
                    key={index}
                    name={index < Math.floor(rating || 0) ? 'star' : 'star-outline'}
                    size={moderateScale(16)}
                    color={index < Math.floor(rating || 0) ? '#FFD700' : '#BDC3C7'}
                  />
                ))}
                <Text style={styles.ratingText}>
                  {rating ? `${rating.toFixed(1)} / 5` : 'No ratings'}
                </Text>
              </View>

              {/* Release Date and Categories */}
              <View style={styles.metaContainer}>
                <Text style={styles.metaText}>
                  📅 {releaseDate || 'Unknown Date'}
                </Text>
                <Text style={styles.metaText} numberOfLines={1}>
                  📚 {categories || 'Unknown Category'}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <FlatlistDynamic
      renderItem={renderItem}
      bookData={bookData}
      keyExtractor={(item) => item.id.toString()}
    />
  );
};

export default TrendingRelease;

const styles = StyleSheet.create({
  cardContainer: {
    width: horizontalScale(180),
    margin: moderateScale(10),
    borderRadius: moderateScale(12),

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },

    shadowRadius: 8,
    elevation: 7,
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: verticalScale(220),
    borderTopLeftRadius: moderateScale(12),
    borderTopRightRadius: moderateScale(12),
  },
  detailsContainer: {
    padding: moderateScale(12),
    backgroundColor: '#111',
    borderBottomLeftRadius: moderateScale(12),
    borderBottomRightRadius: moderateScale(12),
  },
  bookTitle: {
    fontSize: moderateScale(16),
    fontFamily: FONT.notoBold,
    color: '#2c3e50',
    marginBottom: moderateScale(2),
  },
  bookAuthor: {
    fontSize: moderateScale(14),
    fontFamily: FONT.notoMedium,
    color: '#7f8c8d',
    marginBottom: moderateScale(6),
  },
  durationText: {
    fontSize: moderateScale(12),
    fontFamily: FONT.notoRegular,
    color: '#3498db',
    marginBottom: moderateScale(6),
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: moderateScale(6),
  },
  ratingText: {
    fontSize: moderateScale(12),
    fontFamily: FONT.notoMedium,
    color: '#34495e',
    marginLeft: moderateScale(6),
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: moderateScale(4),
  },
  metaText: {
    fontSize: moderateScale(12),
    fontFamily: FONT.notoRegular,
    color: '#7f8c8d',
  },
});
