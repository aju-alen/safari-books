import React, { useEffect, useRef } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/providers/ThemeProvider';
import { horizontalScale, moderateScale, verticalScale } from '@/utils/responsiveSize';
import { BOOK_COVER_HEIGHT, BOOK_COVER_WIDTH } from '@/constants/bookCover';

const SHIMMER_DURATION = 1200;

const useShimmer = () => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: SHIMMER_DURATION, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: SHIMMER_DURATION, useNativeDriver: true }),
      ])
    ).start();
  }, [anim]);
  return anim;
};

const SkeletonBox = ({
  width,
  height,
  borderRadius = 6,
  style,
  shimmer,
}: {
  width: number | `${number}%`;
  height: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  shimmer: Animated.Value;
}) => {
  const { theme } = useTheme();

  const opacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.45, 0.9],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: theme.gray2,
          opacity,
        },
        style,
      ]}
    />
  );
};

const SingleBookSkeleton = () => {
  const { theme } = useTheme();
  const shimmer = useShimmer();

  const S = StyleSheet.create({
    scroll: { flex: 1, backgroundColor: theme.background },
    content: {
      minHeight: '100%',
      paddingBottom: verticalScale(48),
      paddingHorizontal: horizontalScale(20),
      maxWidth: 520,
      width: '100%',
      alignSelf: 'center',
    },

    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: verticalScale(4),
      marginBottom: verticalScale(12),
    },
    backBtn: {
      width: moderateScale(44),
      height: moderateScale(44),
      borderRadius: moderateScale(22),
    },

    imageWrap: { alignItems: 'center', marginTop: verticalScale(8), marginBottom: verticalScale(8) },

    titleBlock: { alignItems: 'center', marginTop: verticalScale(22), gap: verticalScale(8) },

    infoCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: verticalScale(20),
      paddingVertical: verticalScale(12),
      paddingHorizontal: horizontalScale(16),
      gap: horizontalScale(8),
      backgroundColor: theme.gray2,
      borderRadius: moderateScale(14),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.maximumTrackTintColor,
    },

    creditsCard: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      marginTop: verticalScale(20),
      padding: moderateScale(16),
      backgroundColor: theme.tabs,
      borderRadius: moderateScale(16),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.maximumTrackTintColor,
    },
    creditItem: { flex: 1, alignItems: 'center', gap: verticalScale(6) },
    divider: {
      width: StyleSheet.hairlineWidth,
      alignSelf: 'stretch',
      backgroundColor: theme.maximumTrackTintColor,
      marginHorizontal: horizontalScale(8),
    },

    btnContainer: { width: '100%', marginTop: verticalScale(24), gap: verticalScale(12) },

    sectionCard: {
      padding: moderateScale(18),
      borderRadius: moderateScale(16),
      backgroundColor: theme.gray2,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.maximumTrackTintColor,
      marginTop: verticalScale(28),
      gap: verticalScale(8),
    },

    detailsGrid: { gap: verticalScale(16), marginTop: verticalScale(4) },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

    recoSection: { marginTop: verticalScale(28) },
    recoScroll: { flexDirection: 'row', marginTop: verticalScale(14), gap: horizontalScale(14) },
    recoItem: {
      width: horizontalScale(124),
      padding: moderateScale(10),
      paddingBottom: moderateScale(12),
      backgroundColor: theme.tabs,
      borderRadius: moderateScale(14),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.maximumTrackTintColor,
      gap: verticalScale(6),
    },
  });

  return (
    <ScrollView style={S.scroll} showsVerticalScrollIndicator={false}>
      <SafeAreaView>
        <View style={S.content}>
          {/* Header */}
          <View style={S.header}>
            <SkeletonBox
              width={moderateScale(44)}
              height={moderateScale(44)}
              borderRadius={moderateScale(22)}
              shimmer={shimmer}
            />
          </View>

          {/* Cover image */}
          <View style={S.imageWrap}>
            <SkeletonBox
              width={horizontalScale(220)}
              height={horizontalScale(220) * (BOOK_COVER_HEIGHT / BOOK_COVER_WIDTH)}
              borderRadius={moderateScale(44)}
              shimmer={shimmer}
            />
          </View>

          {/* Title + description */}
          <View style={S.titleBlock}>
            <SkeletonBox width="72%" height={22} borderRadius={99} shimmer={shimmer} />
            <SkeletonBox width="55%" height={16} borderRadius={99} shimmer={shimmer} />
            <SkeletonBox width="80%" height={13} borderRadius={99} shimmer={shimmer} />
            <SkeletonBox width="68%" height={13} borderRadius={99} shimmer={shimmer} />
          </View>

          {/* Duration pill */}
          <View style={S.infoCard}>
            <SkeletonBox width={18} height={18} borderRadius={9} shimmer={shimmer} />
            <SkeletonBox width={130} height={14} borderRadius={99} shimmer={shimmer} />
          </View>

          {/* Author / Narrator */}
          <View style={S.creditsCard}>
            <View style={S.creditItem}>
              <SkeletonBox width={50} height={11} borderRadius={99} shimmer={shimmer} />
              <SkeletonBox width={80} height={15} borderRadius={99} shimmer={shimmer} />
            </View>
            <View style={S.divider} />
            <View style={S.creditItem}>
              <SkeletonBox width={58} height={11} borderRadius={99} shimmer={shimmer} />
              <SkeletonBox width={90} height={15} borderRadius={99} shimmer={shimmer} />
            </View>
          </View>

          {/* Buttons */}
          <View style={S.btnContainer}>
            <SkeletonBox width="100%" height={verticalScale(52)} borderRadius={moderateScale(28)} shimmer={shimmer} />
            <SkeletonBox width="100%" height={verticalScale(52)} borderRadius={moderateScale(28)} shimmer={shimmer} />
          </View>

          {/* Summary card */}
          <View style={S.sectionCard}>
            <SkeletonBox width={90} height={18} borderRadius={99} shimmer={shimmer} />
            <SkeletonBox width="100%" height={13} shimmer={shimmer} />
            <SkeletonBox width="96%" height={13} shimmer={shimmer} />
            <SkeletonBox width="100%" height={13} shimmer={shimmer} />
            <SkeletonBox width="88%" height={13} shimmer={shimmer} />
            <SkeletonBox width="60%" height={13} shimmer={shimmer} />
            <SkeletonBox
              width={80}
              height={14}
              borderRadius={99}
              style={{ marginTop: verticalScale(4) }}
              shimmer={shimmer}
            />
          </View>

          {/* Book Details card */}
          <View style={S.sectionCard}>
            <SkeletonBox width={110} height={18} borderRadius={99} shimmer={shimmer} />
            <View style={S.detailsGrid}>
              {[90, 70, 80, 75].map((lw, i) => (
                <View key={i} style={S.detailRow}>
                  <SkeletonBox width={lw} height={13} borderRadius={99} shimmer={shimmer} />
                  <SkeletonBox width={lw + 30} height={13} borderRadius={99} shimmer={shimmer} />
                </View>
              ))}
            </View>
          </View>

          {/* You May Also Like */}
          <View style={S.recoSection}>
            <SkeletonBox width={140} height={18} borderRadius={99} shimmer={shimmer} />
            <View style={S.recoScroll}>
              {[0, 1, 2].map((i) => (
                <View key={i} style={S.recoItem}>
                  <SkeletonBox
                    width="100%"
                    height={horizontalScale(124) * (BOOK_COVER_HEIGHT / BOOK_COVER_WIDTH)}
                    borderRadius={moderateScale(10)}
                    shimmer={shimmer}
                  />
                  <SkeletonBox width="85%" height={13} borderRadius={99} shimmer={shimmer} />
                  <SkeletonBox width="60%" height={11} borderRadius={99} shimmer={shimmer} />
                </View>
              ))}
            </View>
          </View>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
};

export default SingleBookSkeleton;
