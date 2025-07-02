import { StyleSheet, Text, TouchableOpacity, View, FlatList, TextInput, Dimensions, RefreshControl, ActivityIndicator } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { defaultStyles } from '@/styles'
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/providers/ThemeProvider';
import { moderateScale, verticalScale } from '@/utils/responsiveSize';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

interface Book {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  duration: string;
  category: string;
  rating: number;
}

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState<Book[]>([]);
  const [filteredFavorites, setFilteredFavorites] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  // Mock data - replace with actual API call
  const mockFavorites: Book[] = [
    {
      id: '1',
      title: 'The Psychology of Money',
      author: 'Morgan Housel',
      coverImage: 'https://example.com/cover1.jpg',
      duration: '6h 23m',
      category: 'Business',
      rating: 4.8
    },
    {
      id: '2',
      title: 'Atomic Habits',
      author: 'James Clear',
      coverImage: 'https://example.com/cover2.jpg',
      duration: '5h 35m',
      category: 'Self-Help',
      rating: 4.9
    },
    {
      id: '3',
      title: 'Deep Work',
      author: 'Cal Newport',
      coverImage: 'https://example.com/cover3.jpg',
      duration: '7h 12m',
      category: 'Productivity',
      rating: 4.7
    },
    {
      id: '4',
      title: 'The 7 Habits of Highly Effective People',
      author: 'Stephen R. Covey',
      coverImage: 'https://example.com/cover4.jpg',
      duration: '8h 45m',
      category: 'Self-Help',
      rating: 4.6
    },
    {
      id: '5',
      title: 'Thinking, Fast and Slow',
      author: 'Daniel Kahneman',
      coverImage: 'https://example.com/cover5.jpg',
      duration: '9h 20m',
      category: 'Psychology',
      rating: 4.8
    },
    {
      id: '6',
      title: 'The Power of Now',
      author: 'Eckhart Tolle',
      coverImage: 'https://example.com/cover6.jpg',
      duration: '4h 15m',
      category: 'Spirituality',
      rating: 4.5
    }
  ];

  const categories = ['All', 'Business', 'Self-Help', 'Productivity', 'Psychology', 'Spirituality'];

  useEffect(() => {
    loadFavorites();
  }, []);

  useEffect(() => {
    filterFavorites();
  }, [favorites, searchQuery, selectedCategory]);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setFavorites(mockFavorites);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadFavorites();
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Error refreshing favorites:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const filterFavorites = () => {
    let filtered = favorites;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(book =>
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(book => book.category === selectedCategory);
    }

    setFilteredFavorites(filtered);
  };

  const removeFromFavorites = (bookId: string) => {
    setFavorites(prev => prev.filter(book => book.id !== bookId));
  };

  const renderBookItem = ({ item }: { item: Book }) => (
    <TouchableOpacity
      style={[
        styles.bookItem,
        viewMode === 'grid' ? styles.bookItemGrid : styles.bookItemList,
        { backgroundColor: theme.white, borderColor: theme.gray2 }
      ]}
      onPress={() => router.push(`/(tabs)/book/${item.id}`)}
    >
      <View style={styles.bookCover}>
        <View style={[styles.coverPlaceholder, { backgroundColor: theme.primary }]}>
          <Ionicons name="book" size={24} color={theme.white} />
        </View>
        <TouchableOpacity
          style={[styles.favoriteButton, { backgroundColor: theme.primary }]}
          onPress={() => removeFromFavorites(item.id)}
        >
          <Ionicons name="heart" size={16} color={theme.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.bookInfo}>
        <Text style={[styles.bookTitle, { color: theme.text }]} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={[styles.bookAuthor, { color: theme.textMuted }]} numberOfLines={1}>
          {item.author}
        </Text>
        
        <View style={styles.bookMeta}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={12} color={theme.primary} />
            <Text style={[styles.rating, { color: theme.textMuted }]}>
              {item.rating}
            </Text>
          </View>
          <Text style={[styles.duration, { color: theme.textMuted }]}>
            {item.duration}
          </Text>
        </View>

        <View style={[styles.categoryTag, { backgroundColor: `${theme.primary}20` }]}>
          <Text style={[styles.categoryText, { color: theme.primary }]}>
            {item.category}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCategoryFilter = () => (
    <View style={styles.categoryContainer}>
      <FlatList
        data={categories}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedCategory === item && { backgroundColor: theme.primary }
            ]}
            onPress={() => setSelectedCategory(item)}
          >
            <Text style={[
              styles.categoryButtonText,
              { color: selectedCategory === item ? theme.white : theme.textMuted }
            ]}>
              {item}
            </Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.categoryList}
      />
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[defaultStyles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textMuted }]}>
            Loading favorites...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[defaultStyles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Favorites</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.viewModeButton, { backgroundColor: `${theme.primary}20` }]}
            onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            <Ionicons
              name={viewMode === 'grid' ? 'list' : 'grid'}
              size={20}
              color={theme.primary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: theme.white, borderColor: theme.gray2 }]}>
          <Ionicons name="search" size={20} color={theme.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search favorites..."
            placeholderTextColor={theme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={theme.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Filters */}
      {renderCategoryFilter()}

      {/* Results Count */}
      <View style={styles.resultsContainer}>
        <Text style={[styles.resultsText, { color: theme.textMuted }]}>
          {filteredFavorites.length} {filteredFavorites.length === 1 ? 'book' : 'books'} found
        </Text>
      </View>

      {/* Books List */}
      <FlatList
        data={filteredFavorites}
        renderItem={renderBookItem}
        keyExtractor={(item) => item.id}
        numColumns={viewMode === 'grid' ? 2 : 1}
        columnWrapperStyle={viewMode === 'grid' ? styles.gridRow : undefined}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
            progressBackgroundColor={theme.background}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={64} color={theme.textMuted} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              No favorites yet
            </Text>
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
              {searchQuery || selectedCategory !== 'All' 
                ? 'Try adjusting your search or filters'
                : 'Start adding books to your favorites to see them here'
              }
            </Text>
            {!searchQuery && selectedCategory === 'All' && (
              <TouchableOpacity
                style={[styles.browseButton, { backgroundColor: theme.primary }]}
                onPress={() => router.push('/(tabs)/')}
              >
                <Text style={[styles.browseButtonText, { color: theme.white }]}>
                  Browse Books
                </Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default FavoritesPage;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: moderateScale(16),
    marginTop: moderateScale(16),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: moderateScale(20),
    paddingVertical: moderateScale(16),
  },
  headerTitle: {
    fontSize: moderateScale(28),
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    gap: moderateScale(12),
  },
  viewModeButton: {
    padding: moderateScale(8),
    borderRadius: moderateScale(8),
  },
  searchContainer: {
    paddingHorizontal: moderateScale(20),
    marginBottom: moderateScale(16),
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(12),
    borderRadius: moderateScale(12),
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: moderateScale(12),
    fontSize: moderateScale(16),
  },
  categoryContainer: {
    marginBottom: moderateScale(16),
  },
  categoryList: {
    paddingHorizontal: moderateScale(20),
    gap: moderateScale(8),
  },
  categoryButton: {
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(8),
    borderRadius: moderateScale(20),
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryButtonText: {
    fontSize: moderateScale(14),
    fontWeight: '500',
  },
  resultsContainer: {
    paddingHorizontal: moderateScale(20),
    marginBottom: moderateScale(16),
  },
  resultsText: {
    fontSize: moderateScale(14),
  },
  listContainer: {
    paddingHorizontal: moderateScale(20),
    paddingBottom: moderateScale(30),
  },
  gridRow: {
    justifyContent: 'space-between',
  },
  bookItem: {
    borderRadius: moderateScale(16),
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookItemGrid: {
    width: (width - moderateScale(60)) / 2,
    marginBottom: moderateScale(16),
  },
  bookItemList: {
    marginBottom: moderateScale(12),
  },
  bookCover: {
    position: 'relative',
  },
  coverPlaceholder: {
    width: '100%',
    height: moderateScale(120),
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: moderateScale(16),
    borderTopRightRadius: moderateScale(16),
  },
  favoriteButton: {
    position: 'absolute',
    top: moderateScale(8),
    right: moderateScale(8),
    width: moderateScale(24),
    height: moderateScale(24),
    borderRadius: moderateScale(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookInfo: {
    padding: moderateScale(12),
  },
  bookTitle: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    marginBottom: moderateScale(4),
    lineHeight: moderateScale(18),
  },
  bookAuthor: {
    fontSize: moderateScale(12),
    marginBottom: moderateScale(8),
  },
  bookMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: moderateScale(8),
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(4),
  },
  rating: {
    fontSize: moderateScale(12),
    fontWeight: '500',
  },
  duration: {
    fontSize: moderateScale(12),
  },
  categoryTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(4),
    borderRadius: moderateScale(12),
  },
  categoryText: {
    fontSize: moderateScale(10),
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: moderateScale(60),
  },
  emptyTitle: {
    fontSize: moderateScale(20),
    fontWeight: '600',
    marginTop: moderateScale(16),
    marginBottom: moderateScale(8),
  },
  emptyText: {
    fontSize: moderateScale(16),
    textAlign: 'center',
    lineHeight: moderateScale(24),
    marginBottom: moderateScale(24),
  },
  browseButton: {
    paddingHorizontal: moderateScale(24),
    paddingVertical: moderateScale(12),
    borderRadius: moderateScale(12),
  },
  browseButtonText: {
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
}); 