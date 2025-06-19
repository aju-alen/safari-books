import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text, Pressable, Animated, Image, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, FontAwesome5, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { COLORS, FONT, FONTSIZE } from '@/constants/tokens';
import { horizontalScale, moderateScale, verticalScale } from '@/utils/responsiveSize';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

const BenefitCard = ({ title, description, icon, iconType = 'feather', delay = 0, index }) => {
  const [isPressed, setIsPressed] = useState(false);
  const scaleValue = useRef(new Animated.Value(0.9)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const rotateValue = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        })
      ])
    ]).start();
  }, []);

  const handlePressIn = () => {
    setIsPressed(true);
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: 0.97,
        useNativeDriver: true,
      }),
      Animated.timing(rotateValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(rotateValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
  };

  const renderIcon = () => {
    switch (iconType) {
      case 'feather':
        return <Feather name={icon} size={24} color={COLORS.primary} />;
      case 'fontawesome':
        return <FontAwesome5 name={icon} size={24} color={COLORS.primary} />;
      case 'material':
        return <MaterialCommunityIcons name={icon} size={24} color={COLORS.primary} />;
      default:
        return <Feather name={icon} size={24} color={COLORS.primary} />;
    }
  };

  const rotate = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '2deg']
  });

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
            transform: [
              { scale: scaleValue },
              { translateY: translateY },
              { rotate: rotate }
            ],
            opacity: opacityValue 
          }
        ]}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
          style={styles.cardGradient}
        >
          <View style={styles.cardGlow} />
          <View style={styles.cardIconContainer}>
            <LinearGradient
              colors={['rgba(74, 77, 255, 0.3)', 'rgba(99, 102, 241, 0.15)']}
              style={styles.cardIcon}
            >
              {renderIcon()}
            </LinearGradient>
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardDescription}>{description}</Text>
          </View>
          <View style={styles.cardNumberContainer}>
            <Text style={styles.cardNumber}>{index + 1}</Text>
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
      iconType: 'feather',
      title: 'Unlimited Audiobooks',
      description: 'Access thousands of premium audiobooks from bestselling authors and new releases.',
      delay: 100,
    },
    {
      icon: 'book-open',
      iconType: 'feather',
      title: 'Exclusive Content',
      description: 'Get early access to new releases and exclusive content not available elsewhere.',
      delay: 200,
    },
    {
      icon: 'download',
      iconType: 'feather',
      title: 'Offline Listening',
      description: 'Download your favorite books and listen anywhere, even without internet connection.',
      delay: 300,
    },
    {
      icon: 'gift',
      iconType: 'feather',
      title: 'Member Discounts',
      description: 'Enjoy up to 40% off on additional audiobooks and exclusive member-only sales.',
      delay: 400,
    },
    {
      icon: 'star',
      iconType: 'feather',
      title: 'Premium Experience',
      description: 'Ad-free listening experience with high-quality audio and personalized recommendations.',
      delay: 500,
    },
  ];

  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(20)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(headerTranslateY, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowOpacity, {
            toValue: 0.8,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(glowOpacity, {
            toValue: 0.4,
            duration: 2000,
            useNativeDriver: true,
          })
        ])
      )
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(74, 77, 255, 0.4)', 'rgba(99, 102, 241, 0.15)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.backgroundPattern}>
          <Animated.View 
            style={[
              styles.glowCircle,
              { opacity: glowOpacity }
            ]} 
          />
          <View style={styles.circle1} />
          <View style={styles.circle2} />
          <View style={styles.circle3} />
          <View style={styles.circle4} />
        </View>

        <Animated.View 
          style={[
            styles.headerContainer,
            {
              opacity: headerOpacity,
              transform: [{ translateY: headerTranslateY }]
            }
          ]}
        >
          <View style={styles.badgeContainer}>
            <LinearGradient
              colors={['rgba(74, 77, 255, 0.9)', 'rgba(99, 102, 241, 0.7)']}
              style={styles.headerBadgeGradient}
            >
              <Text style={styles.headerBadge}>Premium Benefits</Text>
            </LinearGradient>
          </View>
          <Text style={styles.headerTitle}>Unlock Premium Features</Text>
          <Text style={styles.headerDescription}>
            Elevate your audiobook experience with our exclusive premium membership
          </Text>
        </Animated.View>

        <View style={styles.benefitsContainer}>
          {benefits.map((benefit, index) => (
            <BenefitCard
              key={index}
              icon={benefit.icon}
              iconType={benefit.iconType}
              title={benefit.title}
              description={benefit.description}
              delay={benefit.delay}
              index={index}
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
    borderRadius: moderateScale(24),
    overflow: 'hidden',
    elevation: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },

    shadowRadius: 8,
  },
  gradient: {
    padding: moderateScale(28),
    borderRadius: moderateScale(24),
    position: 'relative',
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  glowCircle: {
    position: 'absolute',
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: width * 0.6,
    backgroundColor: 'rgba(74, 77, 255, 0.15)',
    top: -width * 0.4,
    right: -width * 0.3,
    transform: [{ scale: 1.2 }],
  },
  circle1: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: 'rgba(74, 77, 255, 0.05)',
    top: -width * 0.3,
    right: -width * 0.2,
  },
  circle2: {
    position: 'absolute',
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
    bottom: -width * 0.2,
    left: -width * 0.1,
  },
  circle3: {
    position: 'absolute',
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: width * 0.2,
    backgroundColor: 'rgba(74, 77, 255, 0.05)',
    top: width * 0.2,
    left: width * 0.3,
  },
  circle4: {
    position: 'absolute',
    width: width * 0.3,
    height: width * 0.3,
    borderRadius: width * 0.15,
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
    top: width * 0.4,
    right: width * 0.2,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: verticalScale(32),
  },
  badgeContainer: {
    marginBottom: verticalScale(16),
  },
  headerBadgeGradient: {
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(20),
  },
  headerBadge: {
    fontSize: FONTSIZE.small,
    fontFamily: FONT.notoBold,
    color: COLORS.white,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
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
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    maxWidth: '90%',
    lineHeight: moderateScale(22),
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
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },

    shadowRadius: 6,
    elevation: 5,
  },
  cardGradient: {
    padding: moderateScale(20),
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  cardGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(74, 77, 255, 0.05)',
    borderRadius: moderateScale(16),
  },
  cardIconContainer: {
    marginRight: horizontalScale(16),
  },
  cardIcon: {
    width: moderateScale(52),
    height: moderateScale(52),
    borderRadius: moderateScale(26),
    justifyContent: 'center',
    alignItems: 'center',
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
    color: 'rgba(255,255,255,0.9)',
    lineHeight: moderateScale(20),
  },
  cardNumberContainer: {
    position: 'absolute',
    top: moderateScale(10),
    right: moderateScale(10),
    width: moderateScale(24),
    height: moderateScale(24),
    borderRadius: moderateScale(12),
    backgroundColor: 'rgba(74, 77, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardNumber: {
    fontSize: FONTSIZE.xSmall,
    fontFamily: FONT.notoBold,
    color: COLORS.primary,
  },
  ctaButton: {
    marginTop: verticalScale(32),
    borderRadius: moderateScale(16),
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },

    shadowRadius: 6,
    elevation: 6,
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
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: verticalScale(12),
  },
});

export default HomeOnboarding;
