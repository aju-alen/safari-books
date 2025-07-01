import { ScrollView, StyleSheet, Text, View, ActivityIndicator, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { moderateScale, verticalScale, horizontalScale } from '@/utils/responsiveSize'
import TrendingRelease from '@/components/TrendingRelease'
import { ipURL } from '@/utils/backendURL'
import { axiosWithAuth } from '@/utils/customAxios'
import { useTheme } from '@/providers/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';

const API_URL = `${ipURL}/api/listeners/books-data`;

const DiscoverPage = () => {
  const [allBooks, setAllBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { theme } = useTheme();

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axiosWithAuth.get(API_URL);
        setAllBooks(response.data.books || []);
      } catch (err) {
        setError('Failed to load books. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  const filterByCategory = (category) =>
    allBooks.filter((book) =>
      (book.categories || '').toLowerCase() === category.toLowerCase()
    );

  const bookDataMystery = filterByCategory('mystery');
  const bookDataScience = filterByCategory('science');
  const bookDataEducation = filterByCategory('selfhelp');

  const renderCategory = (title, books) => (
    <View style={styles.category}>
      <Text style={styles.categoryTitle}>{title}</Text>
      {books.length > 0 ? (
        <TrendingRelease bookData={books} />
      ) : (
        <Text style={styles.emptyText}>No books available</Text>
      )}
    </View>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      paddingHorizontal: horizontalScale(20),
      paddingVertical: verticalScale(16),
    },
    headerTitle: {
      fontSize: moderateScale(24),
      fontWeight: '600',
      color: theme.text,
      marginBottom: verticalScale(4),
    },
    headerSubtitle: {
      fontSize: moderateScale(14),
      color: theme.textMuted,
    },
    content: {
      flex: 1,
    },
    category: {
      marginBottom: verticalScale(32),
    },
    categoryTitle: {
      fontSize: moderateScale(18),
      fontWeight: '600',
      color: theme.text,
      marginBottom: verticalScale(12),
      paddingHorizontal: horizontalScale(20),
    },
    emptyText: {
      fontSize: moderateScale(14),
      color: theme.textMuted,
      textAlign: 'center',
      paddingVertical: verticalScale(20),
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: moderateScale(16),
      color: theme.textMuted,
      marginTop: verticalScale(16),
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: horizontalScale(40),
    },
    errorText: {
      fontSize: moderateScale(16),
      color: theme.textMuted,
      textAlign: 'center',
      marginBottom: verticalScale(20),
    },
    retryButton: {
      backgroundColor: theme.primary,
      paddingHorizontal: horizontalScale(20),
      paddingVertical: verticalScale(10),
      borderRadius: moderateScale(6),
    },
    retryButtonText: {
      color: theme.white,
      fontSize: moderateScale(14),
      fontWeight: '500',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover</Text>
        <Text style={styles.headerSubtitle}>Explore books by category</Text>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: verticalScale(40) }}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {renderCategory('Mystery & Thriller', bookDataMystery)}
            {renderCategory('Science & Technology', bookDataScience)}
            {renderCategory('Education & Learning', bookDataEducation)}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

export default DiscoverPage