import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  Animated, 
  Dimensions,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { verticalScale, horizontalScale, moderateScale } from "@/utils/responsiveSize";
import { FONT } from '@/constants/tokens';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/providers/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const options = [
  {
    id: '1',
    title: 'Listener',
    icon: 'headset-outline',
    role: 'LISTENER',
    description: 'Discover and enjoy audiobooks',
    gradient: ['#3E6B3A', '#7BAE7F'] as const,
    features: ['Browse audiobooks', 'Create playlists', 'Track progress']
  },
  {
    id: '2',
    title: 'Publisher',
    icon: 'library-outline',
    role: 'PUBLISHER',
    description: 'Share your stories with the world',
    gradient: ['#4D8455', '#A7C957'] as const,
    features: ['Upload content', 'Manage library', 'Analytics']
  },
  {
    id: '3',
    title: 'Guest',
    icon: 'person-outline',
    role: 'GUEST',
    description: 'Explore with limited features',
    gradient: ['#6D7F6B', '#B6C4A7'] as const,
    features: ['Browse content', 'Limited access', 'No saving']
  }
];

const ChooseRole = () => {
  const { theme } = useTheme();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [animations] = useState(options.map(() => new Animated.Value(0)));
  const [buttonAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Animate cards in on mount
    options.forEach((_, index) => {
      Animated.spring(animations[index], {
        toValue: 1,
        delay: index * 200,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    });
  }, []);

  useEffect(() => {
    // Animate button when selection changes
    Animated.spring(buttonAnim, {
      toValue: selectedId ? 1 : 0,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  }, [selectedId]);

  const handleSelect = (role: string) => {
    const isDeselecting = role === selectedId;
    setSelectedId(isDeselecting ? null : role);
  };

  const handleContinue = () => {
    if (selectedId === "GUEST") {
      router.push('/(authenticate)/guestLogin');
    } else if (selectedId) {
      router.push(`/(authenticate)/${selectedId}`);
    }
  };

  const renderOption = (item: typeof options[0], index: number) => {
    const isSelected = item.role === selectedId;
    const otherSelected = selectedId && !isSelected;

    const scale = animations[index].interpolate({
      inputRange: [0, 1],
      outputRange: [0.8, 1]
    });

    const translateY = animations[index].interpolate({
      inputRange: [0, 1],
      outputRange: [50, 0]
    });

    const opacity = animations[index].interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1]
    });

    return (
      <Animated.View
        key={item.id}
        style={[
          styles.cardContainer,
          {
            transform: [{ scale }, { translateY }],
            opacity,
          },
          otherSelected && styles.cardDimmed
        ]}
      >
        <TouchableOpacity
          style={[
            styles.card,
            isSelected && styles.selectedCard,
            { borderColor: isSelected ? theme.primary : 'transparent' }
          ]}
          onPress={() => handleSelect(item.role)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={item.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardGradient}
          >
            <View style={styles.cardHeader}>
              <View style={styles.iconContainer}>
                <Ionicons name={item.icon as any} size={28} color="#fff" />
              </View>
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDescription}>{item.description}</Text>
              </View>
              {isSelected && (
                <View style={styles.checkmarkContainer}>
                  <Ionicons name="checkmark-circle" size={24} color="#fff" />
                </View>
              )}
            </View>
            
            <View style={styles.featuresContainer}>
              {item.features.map((feature, idx) => (
                <View key={idx} style={styles.featureItem}>
                  <Ionicons name="checkmark" size={16} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const buttonTranslateY = buttonAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [100, 0]
  });

  const buttonOpacity = buttonAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1]
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.headerContainer}>
            <Text style={[styles.heading, { color: theme.text }]}>Welcome!</Text>
            <Text style={[styles.subheading, { color: theme.textMuted }]}>
              How would you like to experience stories?
            </Text>
          </View>
          
          <View style={styles.cardsContainer}>
            {options.map((item, index) => renderOption(item, index))}
          </View>
        </View>
      </ScrollView>

      <Animated.View 
        style={[
          styles.buttonContainer,
          { 
            transform: [{ translateY: buttonTranslateY }],
            opacity: buttonOpacity
          }
        ]}
      >
        <TouchableOpacity
          style={[
            styles.button,
            { 
              backgroundColor: selectedId 
                ? options.find(item => item.role === selectedId)?.gradient[0] || theme.primary
                : theme.gray
            }
          ]}
          onPress={handleContinue}
          disabled={!selectedId}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>
            {selectedId ? 'Continue' : 'Select a role to continue'}
          </Text>
          {selectedId && (
            <Ionicons name="arrow-forward" size={20} color="#fff" style={styles.buttonIcon} />
          )}
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: horizontalScale(24),
    paddingTop: verticalScale(40),
    paddingBottom: verticalScale(120),
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: verticalScale(40),
  },
  heading: {
    fontFamily: FONT.notoBold,
    fontSize: moderateScale(32),
    marginBottom: verticalScale(8),
    textAlign: 'center',
  },
  subheading: {
    fontFamily: FONT.notoRegular,
    fontSize: moderateScale(16),
    textAlign: 'center',
    lineHeight: moderateScale(24),
  },
  cardsContainer: {
    flex: 1,
    gap: verticalScale(20),
  },
  cardContainer: {
    width: '100%',
  },
  card: {
    borderRadius: moderateScale(16),
    overflow: 'hidden',
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  cardGradient: {
    padding: moderateScale(20),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  iconContainer: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(24),
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: horizontalScale(16),
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: FONT.notoBold,
    color: '#fff',
    fontSize: moderateScale(20),
    marginBottom: verticalScale(4),
  },
  cardDescription: {
    fontFamily: FONT.notoRegular,
    color: 'rgba(255,255,255,0.9)',
    fontSize: moderateScale(14),
  },
  checkmarkContainer: {
    marginLeft: horizontalScale(8),
  },
  featuresContainer: {
    gap: verticalScale(8),
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(8),
  },
  featureText: {
    fontFamily: FONT.notoRegular,
    color: 'rgba(255,255,255,0.8)',
    fontSize: moderateScale(13),
  },
  cardDimmed: {
    opacity: 0.5,
    transform: [{ scale: 0.95 }],
  },
  selectedCard: {
    borderWidth: 3,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: verticalScale(40),
    left: horizontalScale(24),
    right: horizontalScale(24),
  },
  button: {
    height: verticalScale(56),
    borderRadius: moderateScale(28),
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    fontFamily: FONT.notoBold,
    color: '#fff',
    fontSize: moderateScale(16),
    letterSpacing: 0.5,
  },
  buttonIcon: {
    marginLeft: horizontalScale(8),
  },
});

export default ChooseRole;
