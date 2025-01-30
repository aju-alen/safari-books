import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Modal } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { defaultStyles } from '@/styles';
import { eBookData } from '@/utils/flatlistData';
import { horizontalScale, moderateScale, verticalScale } from '@/utils/responsiveSize';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import AudioPlayer from '@/components/AudioPlayer';
import AudioPlayerModal from '@/components/AudioPlayerModal';
import { useAudio } from '@/store/AudioContext';

const COLORS = {
  primary: '#6366F1',
  secondary: '#A5A6F6',
  background: '#000000',
  text: '#FFFFFF',
};

const SingleBookPage = () => {
  const { singleBook } = useLocalSearchParams();
  const [singleBookData, setSingleBookData] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [sound, setSound] = useState(null);
  const [isPlayerVisible, setPlayerVisible] = useState(false);

  console.log(singleBookData,'singleBookData');
  
  useEffect(() => {
    const book = eBookData.find((book) => book.id === singleBook);
    setSingleBookData([book]);
  }, []);

  const { playTrack } = useAudio();

  const playSample = async () => {
    try {
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
      }
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: singleBookData[0]?.sampleAudioUrl }
      );
      setSound(newSound);
      await newSound.playAsync();
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  const handlePlaySample = () => {
    playTrack(singleBookData[0]?.sampleAudioUrl, {
      title: singleBookData[0]?.title,
      author: singleBookData[0]?.authorName,
      coverImage: singleBookData[0]?.coverImage,
    });
  };

  const closeModal = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
    }
    setModalVisible(false);
  };

  const renderRatingStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i < Math.floor(rating) ? 'star' : 'star-outline'}
          size={16}
          color={COLORS.secondary}
        />
      );
    }
    return stars;
  };

  return (
    <ScrollView style={[defaultStyles.container, { backgroundColor: COLORS.background }]}>
      <SafeAreaView>
        <LinearGradient
          style={styles.gradientContainer}
          colors={[`#${singleBookData[0]?.colorCode}`, COLORS.background]}
          end={{ x: 0.5, y: 0.4 }}
        >
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: singleBookData[0]?.coverImage }}
              style={styles.coverImage}
            />

            <View style={styles.titleContainer}>
              <Text style={styles.title}>{singleBookData[0]?.title}</Text>
              <Text style={styles.description}>{singleBookData[0]?.description}</Text>
            </View>

            <View style={styles.infoContainer}>
              <View style={styles.durationContainer}>
                <Ionicons name="time-outline" size={20} color={COLORS.secondary} />
                <Text style={styles.infoText}>
                  {singleBookData[0]?.durationInHours} {singleBookData[0]?.durationInMinutes}
                </Text>
              </View>

              <View style={styles.ratingContainer}>
                <View style={styles.stars}>
                  {renderRatingStars(singleBookData[0]?.rating)}
                </View>
                <Text style={styles.ratingText}>{singleBookData[0]?.rating}</Text>
              </View>
            </View>

            <View style={styles.creditsContainer}>
              <View style={styles.creditItem}>
                <Text style={styles.creditLabel}>AUTHOR</Text>
                <Text style={styles.creditName}>{singleBookData[0]?.authorName}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.creditItem}>
                <Text style={styles.creditLabel}>NARRATOR</Text>
                <Text style={styles.creditName}>{singleBookData[0]?.narratorName}</Text>
              </View>
            </View>

            <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => setPlayerVisible(true)}
              >
                <Ionicons name="play" size={20} color={COLORS.text} />
                <Text style={styles.buttonText}>Listen to Sample</Text>
              </TouchableOpacity>

{/* <TouchableOpacity
    style={styles.primaryButton}
    onPress={handlePlaySample}
  >
    <Ionicons name="play" size={20} color={COLORS.text} />
    <Text style={styles.buttonText}>Listen to Sample</Text>
  </TouchableOpacity> */}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Summary</Text>
              <Text style={styles.sectionText}>{singleBookData[0]?.summary}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Product Details</Text>
              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Release Date</Text>
                  <Text style={styles.detailValue}>{singleBookData[0]?.releaseDate}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Language</Text>
                  <Text style={styles.detailValue}>{singleBookData[0]?.language}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Publisher</Text>
                  <Text style={styles.detailValue}>{singleBookData[0]?.publisher}</Text>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Audio Player Modal */}
        <Modal visible={isModalVisible} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Playing Sample</Text>
              <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                <Ionicons name="close-circle" size={30} color={COLORS.text} />
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
      <AudioPlayerModal
        isVisible={isPlayerVisible}
        onClose={() => setPlayerVisible(false)}
        audioUrl={singleBookData[0]?.sampleAudio}
        bookCover={singleBookData[0]?.coverImage}
        title={singleBookData[0]?.title}
        author={singleBookData[0]?.authorName}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
    gradientContainer: {
        minHeight: '100%',
        paddingBottom: verticalScale(40)
      },
      imageContainer: {
        alignItems: 'center',
        paddingHorizontal: horizontalScale(20),
        marginTop: verticalScale(40)
      },
      coverImage: {
        width: horizontalScale(180),
        height: verticalScale(270),
        borderRadius: moderateScale(12),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },

        shadowRadius: 8
      },
      titleContainer: {
        alignItems: 'center',
        marginTop: verticalScale(24)
      },
      title: {
        fontSize: moderateScale(24),
        fontWeight: '700',
        color: COLORS.text,
        textAlign: 'center'
      },
      description: {
        fontSize: moderateScale(14),
        color: COLORS.secondary,
        textAlign: 'center',
        marginTop: verticalScale(8)
      },
      infoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: verticalScale(16),
        gap: horizontalScale(24)
      },
      durationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: horizontalScale(4)
      },
      infoText: {
        color: COLORS.secondary,
        fontSize: moderateScale(14)
      },
      ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: horizontalScale(8)
      },
      stars: {
        flexDirection: 'row',
        gap: horizontalScale(2)
      },
      ratingText: {
        color: COLORS.secondary,
        fontSize: moderateScale(14)
      },
      creditsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: verticalScale(24),
        width: '100%',
        gap: horizontalScale(24)
      },
      creditItem: {
        alignItems: 'center'
      },
      creditLabel: {
        color: COLORS.secondary,
        fontSize: moderateScale(12),
        marginBottom: verticalScale(4)
      },
      creditName: {
        color: COLORS.text,
        fontSize: moderateScale(14),
        fontWeight: '600'
      },
      divider: {
        width: 1,
        height: '100%',
        backgroundColor: COLORS.secondary,
        opacity: 0.3
      },
      primaryButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: verticalScale(16),
        paddingHorizontal: horizontalScale(32),
        borderRadius: moderateScale(30),
        marginTop: verticalScale(32),
        width: '100%',
        alignItems: 'center'
      },
      buttonText: {
        color: COLORS.text,
        fontSize: moderateScale(16),
        fontWeight: '600'
      },
      section: {
        width: '100%',
        marginTop: verticalScale(32)
      },
      sectionTitle: {
        color: COLORS.text,
        fontSize: moderateScale(20),
        fontWeight: '700',
        marginBottom: verticalScale(12)
      },
      sectionText: {
        color: COLORS.secondary,
        fontSize: moderateScale(14),
        lineHeight: moderateScale(22)
      },
      detailsGrid: {
        gap: verticalScale(16)
      },
      detailItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
      },
      detailLabel: {
        color: COLORS.secondary,
        fontSize: moderateScale(14)
      },
      detailValue: {
        color: COLORS.text,
        fontSize: moderateScale(14),
        fontWeight: '500'
      },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    padding: moderateScale(20),
    borderRadius: moderateScale(10),
    alignItems: 'center',
    width: '80%',
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: moderateScale(18),
    marginBottom: verticalScale(20),
  },
  closeButton: {
    marginTop: verticalScale(20),
  },
});

export default SingleBookPage;








