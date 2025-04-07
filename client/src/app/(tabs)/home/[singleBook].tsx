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
  accent: '#FF9500',
  success: '#4CAF50',
};

const SingleBookPage = () => {
  const { singleBook } = useLocalSearchParams();
  const [singleBookData, setSingleBookData] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [sound, setSound] = useState(null);
  const [isPlayerVisible, setPlayerVisible] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showFullSummary, setShowFullSummary] = useState(false);

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

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  return (
    <ScrollView style={[defaultStyles.container, { backgroundColor: COLORS.background }]}>
      <SafeAreaView>
        <LinearGradient
          style={styles.gradientContainer}
          colors={[`#${singleBookData[0]?.colorCode}`, COLORS.background]}
          end={{ x: 0.5, y: 0.4 }}
        >
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.bookmarkButton} onPress={toggleBookmark}>
              <Ionicons 
                name={isBookmarked ? "bookmark" : "bookmark-outline"} 
                size={24} 
                color={isBookmarked ? COLORS.accent : COLORS.text} 
              />
            </TouchableOpacity>
          </View>

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

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => setPlayerVisible(true)}
              >
                <Ionicons name="play" size={20} color={COLORS.text} />
                <Text style={styles.buttonText}>Listen to Sample</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.buyButton}>
                <Text style={styles.buyButtonText}>Buy for $14.99</Text>
              </TouchableOpacity>
              
              <View style={styles.shareContainer}>
                <TouchableOpacity style={styles.iconButton}>
                  <Ionicons name="share-social-outline" size={22} color={COLORS.text} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton}>
                  <Ionicons name="gift-outline" size={22} color={COLORS.text} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Summary</Text>
              <Text style={styles.sectionText} numberOfLines={showFullSummary ? undefined : 5}>
                {singleBookData[0]?.summary}
              </Text>
              {singleBookData[0]?.summary?.length > 150 && (
                <TouchableOpacity 
                  style={styles.readMoreButton} 
                  onPress={() => setShowFullSummary(!showFullSummary)}
                >
                  <Text style={styles.readMoreText}>
                    {showFullSummary ? 'Show less' : 'Read more'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What Listeners Say</Text>
              <View style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewerInfo}>
                    <View style={styles.reviewerAvatar}>
                      <Text style={styles.avatarText}>JD</Text>
                    </View>
                    <Text style={styles.reviewerName}>John Doe</Text>
                  </View>
                  <View style={styles.stars}>
                    {renderRatingStars(5)}
                  </View>
                </View>
                <Text style={styles.reviewText}>
                  "This audiobook completely changed my perspective. The narration is exceptional and brings the story to life!"
                </Text>
              </View>
              <TouchableOpacity style={styles.allReviewsButton}>
                <Text style={styles.allReviewsText}>See all reviews</Text>
              </TouchableOpacity>
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
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Categories</Text>
                  <Text style={styles.detailValue}>Fiction, Thriller</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>You May Also Like</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recommendationsScroll}>
                {eBookData.slice(0, 5).map((book, index) => (
                  <View key={index} style={styles.recommendationItem}>
                    <Image source={{ uri: book.coverImage }} style={styles.recommendationCover} />
                    <Text style={styles.recommendationTitle} numberOfLines={1}>{book.title}</Text>
                    <Text style={styles.recommendationAuthor} numberOfLines={1}>{book.authorName}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        </LinearGradient>

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
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
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
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: horizontalScale(8),
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: horizontalScale(20),
    marginTop: verticalScale(10),
    marginBottom: verticalScale(20),
  },
  backButton: {
    padding: moderateScale(8),
    borderRadius: moderateScale(20),
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  bookmarkButton: {
    padding: moderateScale(8),
    borderRadius: moderateScale(20),
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  buttonContainer: {
    width: '100%',
    marginTop: verticalScale(24),
    gap: verticalScale(12),
  },
  buyButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: verticalScale(16),
    paddingHorizontal: horizontalScale(32),
    borderRadius: moderateScale(30),
    alignItems: 'center',
  },
  buyButtonText: {
    color: COLORS.text,
    fontSize: moderateScale(16),
    fontWeight: '700',
  },
  shareContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: horizontalScale(20),
    marginTop: verticalScale(8),
  },
  iconButton: {
    padding: moderateScale(10),
    borderRadius: moderateScale(20),
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  readMoreButton: {
    marginTop: verticalScale(8),
    alignSelf: 'flex-start',
  },
  readMoreText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  reviewCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    marginVertical: verticalScale(8),
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(10),
  },
  reviewerAvatar: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: COLORS.text,
    fontWeight: '600',
  },
  reviewerName: {
    color: COLORS.text,
    fontWeight: '600',
  },
  reviewText: {
    color: COLORS.secondary,
    fontStyle: 'italic',
    lineHeight: moderateScale(22),
  },
  allReviewsButton: {
    marginTop: verticalScale(12),
    alignSelf: 'center',
  },
  allReviewsText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  recommendationsScroll: {
    marginTop: verticalScale(12),
  },
  recommendationItem: {
    width: horizontalScale(120),
    marginRight: horizontalScale(16),
  },
  recommendationCover: {
    width: horizontalScale(120),
    height: verticalScale(180),
    borderRadius: moderateScale(8),
    marginBottom: verticalScale(8),
  },
  recommendationTitle: {
    color: COLORS.text,
    fontSize: moderateScale(14),
    fontWeight: '600',
  },
  recommendationAuthor: {
    color: COLORS.secondary,
    fontSize: moderateScale(12),
  },
});

export default SingleBookPage;








