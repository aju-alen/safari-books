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
  // {
  //   id: '3',
  //   title: 'Narrator',
  //   icon: '🎙️',
  //   role: 'NARRATOR',
  //   description: 'Voice stories',
  //   gradient: ['#6B4EFF', '#B592FD']
  // }
];

const App = () => {
  const [selectedId, setSelectedId] = useState(null);
  const [animations] = useState(options.map(() => new Animated.Value(0)));
  const [buttonAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Animate cards in on mount
    options.forEach((_, index) => {
      Animated.spring(animations[index], {
        toValue: 1,
        delay: index * 100,
        useNativeDriver: true,
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
          otherSelected && styles.cardDimmed
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
              <Text style={styles.cardIcon}>{item.icon}</Text>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDescription}>{item.description}</Text>
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
            <TouchableWithoutFeedback onPress={() => router.push(`/(authenticate)/${selectedId}`)}>
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
    paddingHorizontal: 20,
    paddingTop: height * 0.08,
  },
  heading: {
    fontFamily: FONT.notoBold,
    color: '#fff',
    fontSize: 32, // Reduced heading size
    marginBottom: 8,
  },
  subheading: {
    fontFamily: FONT.notoRegular,
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16, // Reduced subheading size
    marginBottom: height * 0.04,
  },
  cardsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: width * 0.8, // Reduced width
    height: height * 0.18, // Reduced height
    marginBottom: 15, // Reduced margin between cards
    borderRadius: 18, // Reduced border radius
    overflow: 'hidden',
  },
  cardBlur: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 18,
  },
  cardGradient: {
    flex: 1,
    padding: 20, // Reduced padding inside card
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
  },
  cardDimmed: {
    opacity: 0.5,
    transform: [{ scale: 0.95 }],
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#fff',
  },
  cardIcon: {
    fontSize: 32, // Reduced icon size
    marginRight: 16, // Reduced space between icon and text
  },
  cardTitle: {
    fontFamily: FONT.notoBold,
    color: '#fff',
    fontSize: 20, // Reduced title size
    marginBottom: 4,
  },
  cardDescription: {
    fontFamily: FONT.notoRegular,
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14, // Reduced description size
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 30, // Adjusted position for the button
    left: 20,
    right: 20,
  },
  button: {
    height: 50, // Reduced button height
    borderRadius: 25, // Adjusted border radius
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowRadius: 4.65,
    elevation: 8,
  },
  buttonText: {
    fontFamily: FONT.notoBold,
    color: '#fff',
    fontSize: 16, // Reduced button text size
    letterSpacing: 0.5,
  },
});

export default App;
