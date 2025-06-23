import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  Image, 
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  Alert
} from 'react-native'
import React, { useState, useEffect } from 'react'
import { useLocalSearchParams, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/providers/ThemeProvider'
import { horizontalScale, verticalScale, moderateScale } from '@/utils/responsiveSize'
import { FONT } from '@/constants/tokens'
import { axiosWithAuth } from '@/utils/customAxios'
import { ipURL } from '@/utils/backendURL'

const { width } = Dimensions.get('window')

const allAudioBooks = () => {
  const { category } = useLocalSearchParams()
  const { theme } = useTheme()
  
  // Handle category parameter type (can be string or string[])
  const categoryString = Array.isArray(category) ? category[0] : category
  
  const [searchQuery, setSearchQuery] = useState('')
  const [books, setBooks] = useState([])
  const [filteredBooks, setFilteredBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [error, setError] = useState('')

  const ITEMS_PER_PAGE = 7

  // Load initial data
  useEffect(() => {
    loadInitialData()
  }, [categoryString])

  // Filter books based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredBooks(books)
    } else {
      const filtered = books.filter(book => 
        book.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.category?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredBooks(filtered)
    }
  }, [searchQuery, books])

  const loadInitialData = async () => {
    setLoading(true)
    setError('')
    
    try {
      let response
      if (categoryString) {
        response = await axiosWithAuth.get(`${ipURL}/api/listeners/get-all-books-data/${categoryString}`, {
          params: { page: 1, limit: ITEMS_PER_PAGE }
        })
      } else {
        response = await axiosWithAuth.get(`${ipURL}/api/listeners/books-data`, {
          params: { page: 1, limit: ITEMS_PER_PAGE }
        })
      }
      
      const { books: newBooks, pagination } = response.data
      
      // Transform the data to match our component's expected format
      const transformedBooks = newBooks.map(book => ({
        id: book.id,
        title: book.title,
        author: book.authorName,
        coverImage: book.coverImage,
        rating: book.rating || 4.0,
        duration: book.duration || '8h 0m',
        category: book.categories,
        price: book.price ? `$${book.price}` : '$12.99',
        isNew: book.isNew || false
      }))
      
      setBooks(transformedBooks)
      setFilteredBooks(transformedBooks)
      setCurrentPage(1)
      setHasMore(pagination.hasMore)
    } catch (err) {
      console.error('Error loading books:', err)
      setError('Failed to load books. Please try again.')
      Alert.alert('Error', 'Failed to load books. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const loadMoreData = async () => {
    if (loadingMore || !hasMore) return
    
    setLoadingMore(true)
    
    try {
      const nextPage = currentPage + 1
      let response
      
      if (categoryString) {
        response = await axiosWithAuth.get(`${ipURL}/api/listeners/get-all-books-data/${categoryString}`, {
          params: { page: nextPage, limit: ITEMS_PER_PAGE }
        })
      } else {
        response = await axiosWithAuth.get(`${ipURL}/api/listeners/books-data`, {
          params: { page: nextPage, limit: ITEMS_PER_PAGE }
        })
      }
      
      const { books: newBooks, pagination } = response.data
      
      // Transform the new data
      const transformedBooks = newBooks.map(book => ({
        id: book.id,
        title: book.title,
        author: book.authorName,
        coverImage: book.coverImage,
        rating: book.rating || 4.0,
        duration: book.duration || '8h 0m',
        category: book.categories,
        price: book.price ? `$${book.price}` : '$12.99',
        isNew: book.isNew || false
      }))
      
      setBooks(prev => [...prev, ...transformedBooks])
      setCurrentPage(nextPage)
      setHasMore(pagination.hasMore)
    } catch (err) {
      console.error('Error loading more books:', err)
      Alert.alert('Error', 'Failed to load more books. Please try again.')
    } finally {
      setLoadingMore(false)
    }
  }

  const renderBookCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.bookCard}
      onPress={() => router.push(`/(tabs)/home/${item.id}`)}
    >
      <View style={styles.bookCardHeader}>
        <Image 
          source={{ uri: item.coverImage || 'https://via.placeholder.com/150x200/4F46E5/FFFFFF?text=Book' }} 
          style={styles.bookCover}
          resizeMode="cover"
        />
        {item.isNew && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>NEW</Text>
          </View>
        )}
      </View>
      
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={2}>
          {item.title || 'Unknown Title'}
        </Text>
        <Text style={styles.bookAuthor} numberOfLines={1}>
          {item.author || 'Unknown Author'}
        </Text>
        
        <View style={styles.bookMeta}>
          <View style={styles.bookRating}>
            <Ionicons name="star" size={12} color={theme.tertiary} />
            <Text style={styles.bookRatingText}>
              {item.rating ? item.rating.toFixed(1) : 'N/A'}
            </Text>
          </View>
          <Text style={styles.bookDuration}>
            {item.duration || 'N/A'}
          </Text>
        </View>
        
        <View style={styles.priceContainer}>
          <Text style={styles.price}>
            {item.price || '$12.99'}
          </Text>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={16} color={theme.white} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  )

  const renderFooter = () => {
    if (!loadingMore) return null
    
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textMuted }]}>
          Loading more books...
        </Text>
      </View>
    )
  }

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={[styles.emptyStateIcon, { backgroundColor: `${theme.primary}15` }]}>
        <Ionicons name="search-outline" size={48} color={theme.primary} />
      </View>
      <Text style={[styles.emptyStateTitle, { color: theme.text }]}>
        No books found
      </Text>
      <Text style={[styles.emptyStateSubtitle, { color: theme.textMuted }]}>
        {searchQuery ? 'Try adjusting your search terms' : 'Check back later for new releases'}
      </Text>
    </View>
  )

  const renderErrorState = () => (
    <View style={styles.emptyState}>
      <View style={[styles.emptyStateIcon, { backgroundColor: `${theme.primary}15` }]}>
        <Ionicons name="alert-circle-outline" size={48} color={theme.primary} />
      </View>
      <Text style={styles.emptyStateTitle}>Something went wrong</Text>
      <Text style={styles.emptyStateSubtitle}>
        {error || 'Failed to load books. Please check your connection.'}
      </Text>
      <TouchableOpacity 
        style={[styles.retryButton, { backgroundColor: theme.primary }]}
        onPress={loadInitialData}
      >
        <Text style={[styles.retryButtonText, { color: theme.white }]}>Try Again</Text>
      </TouchableOpacity>
    </View>
  )

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: horizontalScale(20),
      paddingVertical: verticalScale(16),
      backgroundColor: theme.background,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    backButton: {
      padding: moderateScale(8),
      marginRight: horizontalScale(12),
    },
    headerTitle: {
      fontSize: moderateScale(24),
      fontWeight: '700',
      color: theme.text,
    },
    searchContainer: {
      paddingHorizontal: horizontalScale(20),
      paddingBottom: verticalScale(16),
    },
    searchWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.white,
      borderRadius: moderateScale(16),
      paddingHorizontal: horizontalScale(16),
      paddingVertical: verticalScale(12),
      borderWidth: 2,
      borderColor: isSearchFocused ? theme.primary : theme.gray2,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    searchIcon: {
      marginRight: horizontalScale(12),
    },
    searchInput: {
      flex: 1,
      fontSize: moderateScale(16),
      color: theme.text,
      fontFamily: FONT.RobotoLight,
    },
    clearButton: {
      padding: moderateScale(4),
    },
    categoryBadge: {
      paddingHorizontal: horizontalScale(12),
      paddingVertical: verticalScale(6),
      backgroundColor: `${theme.primary}15`,
      borderRadius: moderateScale(20),
      marginTop: verticalScale(12),
      alignSelf: 'flex-start',
    },
    categoryText: {
      fontSize: moderateScale(14),
      fontWeight: '600',
      color: theme.primary,
    },
    content: {
      flex: 1,
    },
    booksGrid: {
      paddingHorizontal: horizontalScale(16),
      gap: horizontalScale(8),
    },
    bookCard: {
      flex: 1,
      borderRadius: moderateScale(16),
      padding: moderateScale(10),
      marginBottom: verticalScale(16),
      backgroundColor: theme.white,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
      minWidth: horizontalScale(150),
    },
    bookCardHeader: {
      position: 'relative',
      marginBottom: verticalScale(10),
    },
    bookCover: {
      width: '100%',
      height: verticalScale(180),
      borderRadius: moderateScale(12),
      backgroundColor: theme.gray2,
    },
    newBadge: {
      position: 'absolute',
      top: moderateScale(8),
      right: moderateScale(8),
      paddingHorizontal: moderateScale(6),
      paddingVertical: moderateScale(2),
      borderRadius: moderateScale(8),
      backgroundColor: theme.tertiary,
    },
    newBadgeText: {
      fontSize: moderateScale(8),
      fontWeight: '700',
      color: theme.white,
    },
    bookInfo: {
      flex: 1,
    },
    bookTitle: {
      fontSize: moderateScale(14),
      fontWeight: '600',
      marginBottom: verticalScale(4),
      lineHeight: moderateScale(18),
      color: theme.text,
    },
    bookAuthor: {
      fontSize: moderateScale(12),
      marginBottom: verticalScale(6),
      color: theme.textMuted,
    },
    bookMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: verticalScale(8),
    },
    bookRating: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    bookRatingText: {
      fontSize: moderateScale(11),
      marginLeft: horizontalScale(4),
      color: theme.textMuted,
    },
    bookDuration: {
      fontSize: moderateScale(11),
      color: theme.textMuted,
    },
    priceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    price: {
      fontSize: moderateScale(14),
      fontWeight: '700',
      color: theme.primary,
    },
    addButton: {
      width: moderateScale(28),
      height: moderateScale(28),
      borderRadius: moderateScale(14),
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.primary,
    },
    loadingFooter: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: verticalScale(20),
    },
    loadingText: {
      fontSize: moderateScale(14),
      marginLeft: horizontalScale(8),
      color: theme.textMuted,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: horizontalScale(40),
    },
    emptyStateIcon: {
      width: moderateScale(100),
      height: moderateScale(100),
      borderRadius: moderateScale(50),
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: verticalScale(24),
    },
    emptyStateTitle: {
      fontSize: moderateScale(20),
      fontWeight: '700',
      marginBottom: verticalScale(8),
      textAlign: 'center',
      color: theme.text,
    },
    emptyStateSubtitle: {
      fontSize: moderateScale(16),
      textAlign: 'center',
      lineHeight: moderateScale(24),
      color: theme.textMuted,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingTitle: {
      fontSize: moderateScale(18),
      fontWeight: '600',
      color: theme.text,
      marginTop: verticalScale(16),
    },
    retryButton: {
      padding: moderateScale(12),
      borderRadius: moderateScale(8),
      marginTop: verticalScale(20),
    },
    retryButtonText: {
      fontSize: moderateScale(16),
      fontWeight: '600',
      color: theme.white,
    },
  })

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingTitle}>Loading audiobooks...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {categoryString ? `${categoryString.charAt(0).toUpperCase() + categoryString.slice(1)} Books` : 'All Audiobooks'}
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <Ionicons 
            name="search" 
            size={20} 
            color={isSearchFocused ? theme.primary : theme.textMuted}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search books, authors, or categories..."
            placeholderTextColor={theme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}
            >
              <Ionicons name="close-circle" size={20} color={theme.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        
        {categoryString && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              Category: {categoryString.charAt(0).toUpperCase() + categoryString.slice(1)}
            </Text>
          </View>
        )}
      </View>

      {/* Books Grid */}
      <View style={styles.content}>
        <FlatList
          data={filteredBooks}
          renderItem={renderBookCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMoreData}
          onEndReachedThreshold={0.1}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={error ? renderErrorState : renderEmptyState}
          contentContainerStyle={{ 
            paddingHorizontal: horizontalScale(16),
            paddingBottom: verticalScale(100),
            flexGrow: 1 
          }}
          columnWrapperStyle={styles.booksGrid}
        />
      </View>
    </SafeAreaView>
  )
}

export default allAudioBooks