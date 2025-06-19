import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  Animated, 
  Dimensions,
  TouchableWithoutFeedback
} from 'react-native';
import { verticalScale, horizontalScale ,moderateScale} from "@/utils/responsiveSize";
import { FONT } from '@/constants/tokens';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
const { width, height } = Dimensions.get('window');

const options = [
  {
    id: '1',
    title: 'Listener',
    icon: '🎧',
    role: 'LISTENER',
    description: 'Discover audiobooks',
    gradient: ['#FF6B6B', '#FF8E53']
  },
  {
    id: '2',
    title: 'Publisher',
    icon: '📚',
    role: 'PUBLISHER',
    description: 'Share your stories',
    gradient: ['#4E65FF', '#92EFFD']
  },
  {
    id: '3',
    title: 'Guest',
    icon: '👤',
    role: 'GUEST',
    description: 'Explore the platform with limited features',
    gradient: ['#6B4EFF', '#B592FD']
  }
];

const App = () => {
  const [selectedId, setSelectedId] = useState(null);
  const [animations] = useState(options.map(() => new Animated.Value(0)));
  const [buttonAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Animate cards in on mount with a more natural spring configuration
    options.forEach((_, index) => {
      Animated.spring(animations[index], {
        toValue: 1,
        delay: index * 150, // Increased delay for more distinct animations
        useNativeDriver: true,
        tension: 50,  // Added for smoother animation
        friction: 7,  // Added for smoother animation
      }).start();
    });
  }, []);

  useEffect(() => {
    // Animate button when selection changes
    Animated.spring(buttonAnim, {
      toValue: selectedId ? 1 : 0,
      useNativeDriver: true,
    }).start();
  }, [selectedId]);

  const handleSelect = (role) => {
    const isDeselecting = role === selectedId;
    setSelectedId(isDeselecting ? null : role);
  };

  const renderOption = (item, index) => {
    const isSelected = item.role === selectedId;
    const otherSelected = selectedId && !isSelected;

    const scale = animations[index].interpolate({
      inputRange: [0, 1],
      outputRange: [0.8, 1]
    });

    const cardStyle = {
      transform: [
        { scale },
        { 
          translateY: animations[index].interpolate({
            inputRange: [0, 1],
            outputRange: [50, 0]
          })
        }
      ],
      opacity: animations[index].interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1]
      })
    };

    return (
      <TouchableWithoutFeedback key={item.id} onPress={() => handleSelect(item.role)}>
        <Animated.View style={[
          styles.card,
          cardStyle,
          otherSelected && styles.cardDimmed,
          { transform: [...cardStyle.transform] }
        ]}>
            <LinearGradient
              colors={item.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.cardGradient,
                isSelected && styles.selectedCard
              ]}
            >
              <View style={styles.cardContent}>
                <Text style={styles.cardIcon}>{item.icon}</Text>
                <View style={styles.cardTextContainer}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardDescription}>{item.description}</Text>
                </View>
              </View>
            </LinearGradient>
        </Animated.View>
      </TouchableWithoutFeedback>
    );
  };

  const buttonTranslateY = buttonAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [100, 0]
  });

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#000000', '#1A1A1A']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Text style={styles.heading}>Welcome!</Text>
          <Text style={styles.subheading}>How would you like to experience stories?</Text>
          
          <View style={styles.cardsContainer}>
            {options.map((item, index) => renderOption(item, index))}
          </View>

          <Animated.View style={[
            styles.buttonContainer,
            { transform: [{ translateY: buttonTranslateY }] }
          ]}>
            <TouchableWithoutFeedback onPress={() => {
              if(selectedId === "GUEST") {
              router.push(`/(authenticate)/guestLogin`)
              }
              else if(selectedId) {
                router.push(`/(authenticate)/${selectedId}`);
              }
            }}>
              <LinearGradient
                colors={selectedId ? options.find((item) => item.role === selectedId).gradient : ['#000', '#000']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.button}
              >
                <Text style={styles.buttonText}>Continue</Text>
              </LinearGradient>
            </TouchableWithoutFeedback>
          </Animated.View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: horizontalScale(24), // Increased padding
    paddingTop: verticalScale(height * 0.1), // More space at top
  },
  heading: {
    fontFamily: FONT.notoBold,
    color: '#fff',
    fontSize: moderateScale(36),
    marginBottom: verticalScale(12),
    letterSpacing: 0.5,
  },
  subheading: {
    fontFamily: FONT.notoRegular,
    color: 'rgba(255,255,255,0.8)',
    fontSize: moderateScale(18),
    marginBottom: verticalScale(height * 0.06),
    letterSpacing: 0.3,
  },
  cardsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: horizontalScale(width * 0.85),
    height: verticalScale(height * 0.15),
    marginBottom: verticalScale(20),
    borderRadius: moderateScale(24),
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    
    shadowRadius: 10.32,
    elevation: 16,
  },
  cardGradient: {
    flex: 1,
    padding: moderateScale(24),
    borderRadius: moderateScale(24),
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTextContainer: {
    flex: 1,
    marginLeft: horizontalScale(20),
  },
  cardDimmed: {
    opacity: 0.4,
    transform: [{ scale: 0.92 }],
  },
  selectedCard: {
    borderWidth: 3,

  },
  cardIcon: {
    fontSize: moderateScale(38),
  },
  cardTitle: {
    fontFamily: FONT.notoBold,
    color: '#fff',
    fontSize: moderateScale(24),
    marginBottom: verticalScale(6),
    letterSpacing: 0.5,
  },
  cardDescription: {
    fontFamily: FONT.notoRegular,
    color: 'rgba(255,255,255,0.9)',
    fontSize: moderateScale(16),
    letterSpacing: 0.3,
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
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    
    shadowRadius: 10.32,
    elevation: 16,
  },
  buttonText: {
    fontFamily: FONT.notoBold,
    color: '#fff',
    fontSize: moderateScale(18),
    letterSpacing: moderateScale(1),
  },
});

export default App;
