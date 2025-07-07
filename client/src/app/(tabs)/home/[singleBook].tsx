import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Modal, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { defaultStyles } from '@/styles';
import { eBookData } from '@/utils/flatlistData';
import { horizontalScale, moderateScale, verticalScale } from '@/utils/responsiveSize';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import AudioPlayerModal from '@/components/AudioPlayerModal';
import { useAudio } from '@/store/AudioContext';
import { ipURL } from '@/utils/backendURL';
import { BookCategoryLabels } from '@/utils/categoriesdata';
import axios from 'axios';
import { useRevenueCat } from '../../../providers/RevenueCat';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import * as Sharing from 'expo-sharing';
import { useTheme } from '@/providers/ThemeProvider';
import { axiosWithAuth } from '@/utils/customAxios';
import HomeLoadingSkeleton from '@/components/HomeLoadingSkeleton';

const SingleBookPage = () => {
  const { theme } = useTheme();
  const { singleBook } = useLocalSearchParams();
  const [singleBookData, setSingleBookData] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [sound, setSound] = useState(null);
  const [isPlayerVisible, setPlayerVisible] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showFullSummary, setShowFullSummary] = useState(false);
  const [currentAudioUrl, setCurrentAudioUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const { isPro } = useRevenueCat();

  console.log(singleBookData,'singleBookData');
  


  const getSingleBookData = async () => {
    try {
      setLoading(true);
      const resp = await axios.get(`${ipURL}/api/listeners/book-data/${singleBook}`);
      setSingleBookData([resp.data]);
    } catch (error) {
      console.error('Error fetching single book data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSingleBookData();
  }, []);

  // Show loading skeleton while data is being fetched
  if (loading) {
    return <HomeLoadingSkeleton />;
  }

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
          color={theme.tertiary}
        />
      );
    }
    return stars;
  };

  const toggleBookmark = async () => {
    setIsBookmarked(!isBookmarked);
    const bookmarkResponse  = await axiosWithAuth.put(`${ipURL}/api/listeners/bookmark/${singleBook}`);
    console.log(bookmarkResponse.data,'bookmarkResponse');
  };

  console.log('singleBookData', singleBookData);

  const handlePurchase = async() => {
    if (isPro) {
      // Logic for already subscribed users
      const resp = await axiosWithAuth.post(`${ipURL}/api/library/create-library/${singleBook}`);
      console.log('User is already subscribed');
      setCurrentAudioUrl(singleBookData[0]?.completeAudioUrl);
      setPlayerVisible(true);
      
    } else {
      // Logic for purchasing the book
      console.log('Proceed to purchase the book');
      const paywallResult: PAYWALL_RESULT = await RevenueCatUI.presentPaywall({});
      
    }
  };

  const handleShare = async () => {
    const bool = await Sharing.isAvailableAsync();
    if (bool) {
      const result = await Sharing.shareAsync('safari-books://');
      console.log(result, 'result');
    } else {
      Alert.alert('Sharing is not available on this device');
    }
  }

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
        width: horizontalScale(250),
        height: verticalScale(350),
        borderRadius: moderateScale(12),
        shadowColor: theme.text,
        shadowOffset: { width: 0, height: 4 },

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
        color: theme.text,
        textAlign: 'center'
      },
      description: {
        fontSize: moderateScale(14),
        color: theme.textMuted,
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
        color: theme.textMuted,
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
        color: theme.textMuted,
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
        color: theme.textMuted,
        fontSize: moderateScale(12),
        marginBottom: verticalScale(4)
      },
      creditName: {
        color: theme.text,
        fontSize: moderateScale(14),
        fontWeight: '600'
      },
      divider: {
        width: 1,
        height: '100%',
        backgroundColor: theme.textMuted,
        opacity: 0.3
      },
      primaryButton: {
        backgroundColor: theme.primary,
        paddingVertical: verticalScale(16),
        paddingHorizontal: horizontalScale(32),
        borderRadius: moderateScale(30),
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: horizontalScale(8),
      },
      buttonText: {
        color: theme.white,
        fontSize: moderateScale(16),
        fontWeight: '600'
      },
      section: {
        width: '100%',
        marginTop: verticalScale(32)
      },
      sectionTitle: {
        color: theme.text,
        fontSize: moderateScale(20),
        fontWeight: '700',
        marginBottom: verticalScale(12)
      },
      sectionText: {
        color: theme.textMuted,
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
        color: theme.textMuted,
        fontSize: moderateScale(14)
      },
      detailValue: {
        color: theme.text,
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
      backgroundColor: theme.background,
      padding: moderateScale(20),
      borderRadius: moderateScale(10),
      alignItems: 'center',
      width: '80%',
    },
    modalTitle: {
      color: theme.text,
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
    headerRightButtons: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: horizontalScale(12),
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
      backgroundColor: theme.primary,
      paddingVertical: verticalScale(16),
      paddingHorizontal: horizontalScale(32),
      borderRadius: moderateScale(30),
      alignItems: 'center',
    },
    buyButtonText: {
      color: theme.white,
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
      color: theme.primary,
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
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarText: {
      color: theme.white,
      fontWeight: '600',
    },
    reviewerName: {
      color: theme.text,
      fontWeight: '600',
    },
    reviewText: {
      color: theme.textMuted,
      fontStyle: 'italic',
      lineHeight: moderateScale(22),
    },
    allReviewsButton: {
      marginTop: verticalScale(12),
      alignSelf: 'center',
    },
    allReviewsText: {
      color: theme.primary,
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
      color: theme.text,
      fontSize: moderateScale(14),
      fontWeight: '600',
    },
    recommendationAuthor: {
      color: theme.textMuted,
      fontSize: moderateScale(12),
    },
  });

  return (
    <ScrollView style={[defaultStyles.container, { backgroundColor: theme.background }]}>
      <SafeAreaView>
        <View
          style={styles.gradientContainer}
         
        >
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={theme.text} />
            </TouchableOpacity>
            <View style={styles.headerRightButtons}>
              <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
                <Ionicons name="share-social-outline" size={22} color={theme.text} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.bookmarkButton} onPress={toggleBookmark}>
                <Ionicons 
                  name={isBookmarked ? "bookmark" : "bookmark-outline"} 
                  size={24} 
                  color={isBookmarked ? theme.tertiary : theme.text} 
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.imageContainer}>
            <Image
              source={{ uri: singleBookData[0]?.coverImage }}
              style={styles.coverImage}
              resizeMode='contain'
            />

            <View style={styles.titleContainer}>
              <Text style={styles.title}>{singleBookData[0]?.title}</Text>
              <Text style={styles.description}>{singleBookData[0]?.description}</Text>
            </View>

            <View style={styles.infoContainer}>
              <View style={styles.durationContainer}>
                <Ionicons name="time-outline" size={20} color={theme.primary} />
                <Text style={styles.infoText}>
                  {singleBookData[0]?.durationInHours} hours {singleBookData[0]?.durationInMinutes} minutes
                </Text>
              </View>

              {/* <View style={styles.ratingContainer}>
                <View style={styles.stars}>
                  {renderRatingStars(singleBookData[0]?.rating)}
                </View>
                <Text style={styles.ratingText}>{singleBookData[0]?.rating}</Text>
              </View> */}
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
                onPress={() => {
                  setCurrentAudioUrl(singleBookData[0]?.sampleAudioURL);
                  setPlayerVisible(true);
                }}
              >
                <Ionicons name="play" size={20} color={theme.white} />
                <Text style={styles.buttonText}>Listen to Sample</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.buyButton} onPress={handlePurchase}>
                <Text style={styles.buyButtonText}>{isPro ? 'Listen Now' : `Subscribe to Listen`}</Text>
              </TouchableOpacity>
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

            {/* <View style={styles.section}>
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
            </View> */}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Product Details</Text>
              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Release Date</Text>
                  <Text style={styles.detailValue}>{new Date(singleBookData[0]?.releaseDate).toLocaleDateString()}</Text>
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
                  <Text style={styles.detailValue}>{BookCategoryLabels[singleBookData[0]?.categories]}</Text>
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
        </View>

        <Modal visible={isModalVisible} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Playing Sample</Text>
              <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                <Ionicons name="close-circle" size={30} color={theme.text} />
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
      <AudioPlayerModal
        isVisible={isPlayerVisible}
        onClose={() => setPlayerVisible(false)}
        audioUrl={currentAudioUrl}
        bookCover={singleBookData[0]?.coverImage}
        title={singleBookData[0]?.title}
        author={singleBookData[0]?.authorName}
        authorAvatar={singleBookData[0]?.authorAvatar || singleBookData[0]?.coverImage}
        bookId={singleBook}
      />
    </ScrollView>
  );
};

export default SingleBookPage;








