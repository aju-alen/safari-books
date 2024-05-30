import React from 'react';
import { View, Image, StyleSheet, Touchable, TouchableOpacity } from 'react-native';
import { horizontalScale,verticalScale,moderateScale } from '@/utils/responsiveSize';
import { router } from 'expo-router';

const ImageGrid = ({ images }) => {
    console.log(images, 'images');
  return (
    <View style={styles.gridContainer}>
      {images.map((image, index) => (
        <TouchableOpacity key={image.id} onPress={()=>router.push(`/(tabs)/home/${image.id}`)}>
        <Image
          key={image.id}
          source={{ uri: image.coverImage }}
          style={styles.image}
        />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  image: {
    width: horizontalScale(163),
    height: verticalScale(200),
    marginBottom: verticalScale(10),
    borderRadius: moderateScale(10),
  },
});

export default ImageGrid;