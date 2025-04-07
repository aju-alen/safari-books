import React from 'react';
import { View, StyleSheet, Text, Pressable, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { COLORS, FONT, FONTSIZE } from '@/constants/tokens';
import { horizontalScale, moderateScale, verticalScale } from '@/utils/responsiveSize';

const BenefitCard = ({ title, description, icon }) => {
  const scaleValue = new Animated.Value(1);
  const opacityValue = new Animated.Value(0);
  
  React.useEffect(() => {
    Animated.timing(opacityValue, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.97,
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
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.cardPressable}
    >
      <Animated.View 
        style={[
          styles.cardContainer, 
          { 
            transform: [{ scale: scaleValue }],
            opacity: opacityValue 
          }
        ]}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.05)']}
          style={styles.cardGradient}
        >
          <View style={styles.cardIcon}>
            <Feather name={icon} size={24} color={COLORS.primary} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardDescription}>{description}</Text>
          </View>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
};

const HomeOnboarding = () => {
  const benefits = [
    {
      icon: 'headphones',
      title: 'Pick 1 audiobook a month',
      description: 'Choose any title from our unmatched collection—including bestsellers and new releases.',
    },
    {
      icon: 'book-open',
      title: 'Thousands of included titles',
      description: 'Listen all you want to thousands of included audiobooks and Originals with celebs you love.',
    },
    {
      icon: 'gift',
      title: 'Deals & discounts',
      description: 'Get up to 30% off additional audiobooks, plus access to exclusive sales. Cancel anytime.',
    },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(101,1,1,0.2)', 'rgba(101,1,1,0.05)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.headerContainer}>
          <Text style={styles.headerBadge}>Premium Benefits</Text>
          <Text style={styles.headerTitle}>Members get even more</Text>
          <Text style={styles.headerDescription}>
            Unlock exclusive content and features with our premium membership
          </Text>
        </View>

        <View style={styles.benefitsContainer}>
          {benefits.map((benefit, index) => (
            <BenefitCard
              key={index}
              icon={benefit.icon}
              title={benefit.title}
              description={benefit.description}
            />
          ))}
        </View>

        <Pressable style={styles.ctaButton}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaGradient}
          >
            <Text style={styles.ctaText}>Start 7-Day Free Trial</Text>
            <Feather name="arrow-right" size={20} color="white" />
          </LinearGradient>
        </Pressable>
        <Text style={styles.disclaimerText}>Cancel anytime. No credit card required.</Text>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: horizontalScale(16),
    marginVertical: verticalScale(16),
    borderRadius: moderateScale(20),
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  gradient: {
    padding: moderateScale(28),
    borderRadius: moderateScale(20),
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: verticalScale(28),
  },
  headerBadge: {
    fontSize: FONTSIZE.small,
    fontFamily: FONT.notoBold,
    color: COLORS.primary,
    marginBottom: verticalScale(12),
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(20),
  },
  headerTitle: {
    fontSize: FONTSIZE.xxLarge,
    fontFamily: FONT.notoBold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: verticalScale(12),
  },
  headerDescription: {
    fontSize: FONTSIZE.medium,
    fontFamily: FONT.notoRegular,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    maxWidth: '90%',
  },
  benefitsContainer: {
    gap: verticalScale(16),
  },
  cardPressable: {
    borderRadius: moderateScale(16),
    overflow: 'hidden',
  },
  cardContainer: {
    borderRadius: moderateScale(16),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  cardGradient: {
    padding: moderateScale(20),
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(24),
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: horizontalScale(16),
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: FONTSIZE.medium,
    fontFamily: FONT.notoBold,
    color: COLORS.text,
    marginBottom: verticalScale(6),
  },
  cardDescription: {
    fontSize: FONTSIZE.small,
    fontFamily: FONT.notoRegular,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: moderateScale(18),
  },
  ctaButton: {
    marginTop: verticalScale(32),
    borderRadius: moderateScale(16),
    overflow: 'hidden',
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: moderateScale(18),
    gap: horizontalScale(8),
  },
  ctaText: {
    fontSize: FONTSIZE.medium,
    fontFamily: FONT.notoBold,
    color: COLORS.white,
    textAlign: 'center',
  },
  disclaimerText: {
    fontSize: FONTSIZE.xSmall,
    fontFamily: FONT.notoRegular,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginTop: verticalScale(12),
  },
});

export default HomeOnboarding;
