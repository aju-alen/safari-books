import { StyleSheet, Text, View, Image, Pressable } from 'react-native';
import React, { useMemo } from 'react';
import { horizontalScale, moderateScale } from '@/utils/responsiveSize';
import { FONT } from '@/constants/tokens';
import FlatlistDynamic from './FlatlistDynamic';
import { router } from 'expo-router';
import { useTheme } from '@/providers/ThemeProvider';
import { BookCategoryLabels } from '@/utils/categoriesdata';
import { BOOK_COVER_ASPECT_RATIO } from '@/constants/bookCover';

function isReleaseWithinPastWeek(releaseDate: string | Date | undefined): boolean {
  if (releaseDate == null || releaseDate === '') return false;
  const d = new Date(releaseDate);
  if (Number.isNaN(d.getTime())) return false;
  const diffMs = Date.now() - d.getTime();
  return diffMs <= 7 * 24 * 60 * 60 * 1000 && diffMs >= 0;
}

function normalizeCategoryTags(categories: unknown): string[] {
  if (categories == null || categories === '') return [];
  if (Array.isArray(categories)) return categories.map(String).filter(Boolean).slice(0, 4);
  const s = String(categories).trim();
  if (s.includes(',')) return s.split(',').map((c) => c.trim()).filter(Boolean).slice(0, 4);
  return [s];
}

function formatCategoryLabel(raw: string): string {
  const compact = raw.trim().toLowerCase().replace(/[\s_-]+/g, '') as keyof typeof BookCategoryLabels;
  if (compact && compact in BookCategoryLabels) {
    return BookCategoryLabels[compact];
  }
  if (!raw.trim()) return raw;
  return raw
    .trim()
    .split(/[\s,_-]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function formatListenCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

const R = moderateScale(20);

const TrendingRelease = ({ bookData }) => {
  const { theme } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          width: horizontalScale(176),
          margin: moderateScale(10),
          borderRadius: R,
          borderWidth: StyleSheet.hairlineWidth,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
          overflow: 'hidden',
        },
        pad: {
          paddingHorizontal: moderateScale(10),
          paddingTop: moderateScale(10),
          paddingBottom: moderateScale(12),
        },
        coverOuter: {
          position: 'relative',
        },
        coverWrap: {
          width: '100%',
          aspectRatio: BOOK_COVER_ASPECT_RATIO,
          borderRadius: moderateScale(16),
          overflow: 'hidden',
          marginBottom: moderateScale(12),
          borderWidth: StyleSheet.hairlineWidth,
          alignItems: 'center',
          justifyContent: 'center',
        },
        coverImg: {
          width: '100%',
          height: '100%',
        },
        newLbl: {
          position: 'absolute',
          top: moderateScale(6),
          right: moderateScale(6),
          paddingHorizontal: moderateScale(6),
          paddingVertical: moderateScale(2),
          borderRadius: moderateScale(6),
          borderWidth: StyleSheet.hairlineWidth,
        },
        newLblTxt: {
          fontSize: moderateScale(9),
          fontFamily: FONT.notoMedium,
          letterSpacing: 0.4,
        },
        title: {
          fontSize: moderateScale(14),
          fontFamily: FONT.notoBold,
          lineHeight: moderateScale(18),
          marginBottom: moderateScale(3),
        },
        author: {
          fontSize: moderateScale(12),
          fontFamily: FONT.notoMedium,
          marginBottom: moderateScale(8),
        },
        meta: {
          fontSize: moderateScale(11),
          fontFamily: FONT.notoMedium,
          lineHeight: moderateScale(16),
        },
        cats: {
          fontSize: moderateScale(11),
          fontFamily: FONT.notoMedium,
          marginTop: moderateScale(8),
          lineHeight: moderateScale(16),
        },
      }),
    []
  );

  const renderItem = ({ item }) => {
    const {
      id,
      title,
      coverImage,
      authorName,
      durationInHours,
      durationInMinutes,
      releaseDate,
      categories,
      listens = item?._count?.Library ?? 0,
    } = item;

    const metaText = `${durationInHours ?? 0}h ${durationInMinutes ?? 0}m · ${formatListenCount(Number(listens) || 0)} listens`;

    const showNew = isReleaseWithinPastWeek(releaseDate);
    const cats = normalizeCategoryTags(categories).map(formatCategoryLabel).filter(Boolean);
    const catsText = cats.join(' · ');

    return (
      <Pressable
        onPress={() => router.push(`/(tabs)/home/${id}`)}
        style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1 }]}
      >
        <View
          style={[styles.card, { backgroundColor: theme.white, borderColor: theme.maximumTrackTintColor, shadowColor: theme.text }]}
        >
          <View style={styles.pad}>
            <View style={styles.coverOuter}>
              <View style={[styles.coverWrap, { backgroundColor: theme.gray2, borderColor: theme.maximumTrackTintColor }]}>
                <Image
                  source={{ uri: coverImage || 'https://via.placeholder.com/400x600/e8e8e8/888888?text=%20' }}
                  style={styles.coverImg}
                  resizeMode="stretch"
                />
              </View>
              {showNew ? (
                <View style={[styles.newLbl, { borderColor: theme.textMuted, backgroundColor: theme.background }]}>
                  <Text style={[styles.newLblTxt, { color: theme.textMuted }]}>New</Text>
                </View>
              ) : null}
            </View>

            <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>
              {title || 'Unknown Title'}
            </Text>
            <Text style={[styles.author, { color: theme.textMuted }]} numberOfLines={1}>
              {authorName || 'Unknown Author'}
            </Text>
            <Text style={[styles.meta, { color: theme.textMuted }]} numberOfLines={1}>
              {metaText}
            </Text>
            {catsText ? (
              <Text style={[styles.cats, { color: theme.textMuted }]} numberOfLines={2}>
                {catsText}
              </Text>
            ) : null}
          </View>
        </View>
      </Pressable>
    );
  };

  return <FlatlistDynamic renderItem={renderItem} bookData={bookData} />;
};

export default TrendingRelease;
