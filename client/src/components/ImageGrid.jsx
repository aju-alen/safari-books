import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { horizontalScale, verticalScale, moderateScale } from '@/utils/responsiveSize';
import { router } from 'expo-router';

const ImageGrid = ({ images }) => {
  return (
    <View style={styles.gridContainer}>
      {images.map((image, index) => {
        const scaleValue = new Animated.Value(1);

        const handlePressIn = () => {
          Animated.spring(scaleValue, {
            toValue: 0.95,
            useNativeDriver: true,
          }).start();
        };

        const handlePressOut = () => {
          Animated.spring(scaleValue, {
            toValue: 1,
            useNativeDriver: true,
          }).start();
        };

        return (
          <TouchableOpacity
            key={image.id}
            onPress={() => router.push(`/(tabs)/home/${image.id}`)}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={0.8}
          >
            <Animated.View style={[styles.imageContainer, { transform: [{ scale: scaleValue }] }]}>
              <Image source={{ uri: image.coverImage }} style={styles.image} resizeMode="cover" />
            </Animated.View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(5),
  },
  imageContainer: {
    borderRadius: moderateScale(12),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },

    shadowRadius: 5,
    elevation: 5,
    backgroundColor: '#fff', // Ensures shadows are visible
  },
  image: {
    width: horizontalScale(160),
    height: verticalScale(200),
    borderRadius: moderateScale(12),
  },
});

export default ImageGrid;
