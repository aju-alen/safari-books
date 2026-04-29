import { FlatList, StyleSheet, Text, TouchableOpacity, View, Image, ActivityIndicator, TextInput } from 'react-native';
import React, { useState, useEffect, useMemo } from 'react';
import { defaultStyles } from '@/styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/providers/ThemeProvider';
import { axiosWithAuth } from '@/utils/customAxios';
import { ipURL } from '@/utils/backendURL';
import { router } from 'expo-router';
import { horizontalScale, moderateScale, verticalScale } from '@/utils/responsiveSize';

const SORT_OPTIONS = [
  { key: 'recent', label: 'Recent' },
  { key: 'title_asc', label: 'Title A–Z' },
  { key: 'title_desc', label: 'Title Z–A' },
  { key: 'duration_asc', label: 'Shortest' },
  { key: 'duration_desc', label: 'Longest' },
] as const;

type SortKey = (typeof SORT_OPTIONS)[number]['key'];

const LibraryPage = () => {
  const { theme } = useTheme();
  const data = ["All", "Audiobooks"];
  const subData = ["All Titles", "In Progress", "Finished", "Not Started"];

  const [selectedItem, setSelectedItem] = useState("All");
  const [selectedSubItem, setSelectedSubItem] = useState("All Titles");
  const [libraryBooks, setLibraryBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('recent');
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    fetchLibraryBooks(selectedSubItem);
  }, []);

  const renderItem = ({ item }) => {
    const isSelected = selectedItem === item;
    return (
      <TouchableOpacity
        style={[
          styles.item,
          { backgroundColor: isSelected ? theme.primary : `${theme.primary}15` },
        ]}
        onPress={() => setSelectedItem(item)}
      >
        <Text style={[
          styles.itemText,
          { color: isSelected ? theme.white : theme.text }
        ]}>
          {item}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderSubItem = ({ item }) => {
    const isSelected = selectedSubItem === item;
    return (
      <TouchableOpacity
        style={[
          styles.subitem,
          { 
            borderColor: isSelected ? theme.primary : theme.gray2,
            backgroundColor: isSelected ? `${theme.primary}20` : theme.lightWhite
          },
        ]}
        onPress={() => {
          setSelectedSubItem(item);
          fetchLibraryBooks(item);
        }}
      >
        <Text style={[
          styles.subItemText,
          { color: isSelected ? theme.primary : theme.text }
        ]}>
          {item}
        </Text>
      </TouchableOpacity>
    );
  };

  const fetchLibraryBooks = async (statusParam) => {
    let status = statusParam;
    if (status === 'All Titles') {
      status = 'All';
    } else if (status === 'In Progress') {
      status = 'IN_PROGRESS';
    } else if (status === 'Finished') {
      status = 'FINISHED';
    } else if (status === 'Not Started') {
      status = 'NOT_STARTED';
    }
    try {
      setLoading(true);
      const response = await axiosWithAuth.get(`${ipURL}/api/library/books/${status}`);
      setLibraryBooks(response.data.books || []);
    } catch (error) {
      console.error('Error fetching library books:', error);
      setLibraryBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const displayBooks = useMemo(() => {
    const dur = (b: { durationInHours?: number; durationInMinutes?: number }) =>
      (b.durationInHours || 0) * 60 + (b.durationInMinutes || 0);
    let list = [...libraryBooks];
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (b) =>
          (b.title && String(b.title).toLowerCase().includes(q)) ||
          (b.authorName && String(b.authorName).toLowerCase().includes(q))
      );
    }
    switch (sortKey) {
      case 'title_asc':
        list.sort((a, b) => String(a.title || '').localeCompare(String(b.title || ''), undefined, { sensitivity: 'base' }));
        break;
      case 'title_desc':
        list.sort((a, b) => String(b.title || '').localeCompare(String(a.title || ''), undefined, { sensitivity: 'base' }));
        break;
      case 'duration_asc':
        list.sort((a, b) => dur(a) - dur(b));
        break;
      case 'duration_desc':
        list.sort((a, b) => dur(b) - dur(a));
        break;
      case 'recent':
      default:
        break;
    }
    return list;
  }, [libraryBooks, searchQuery, sortKey]);

  const renderBookItem = ({ item }) => {
    const formatDuration = (hours, minutes) => {
      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      }
      return `${minutes}m`;
    };

    const getStatusColor = (status) => {
      switch (status) {
        case 'IN_PROGRESS':
          return theme.primary;
        case 'FINISHED':
          return theme.tertiary || '#4CAF50';
        case 'NOT_STARTED':
          return theme.textMuted;
        default:
          return theme.textMuted;
      }
    };

    const getStatusText = (status) => {
      switch (status) {
        case 'IN_PROGRESS':
          return 'In Progress';
        case 'FINISHED':
          return 'Finished';
        case 'NOT_STARTED':
          return 'Not Started';
        default:
          return 'Unknown';
      }
    };

    return (
      <TouchableOpacity 
        style={styles.bookItem}
        onPress={() => router.push(`/(tabs)/home/${item.id}`)}
      >
        <Image source={{ uri: item.coverImage }} style={styles.bookCover} resizeMode="stretch" />
        <View style={styles.bookInfo}>
          <Text style={styles.bookTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.bookAuthor}>{item.authorName}</Text>
          <View style={styles.bookMeta}>
            <Text style={styles.bookDuration}>
              {formatDuration(item.durationInHours, item.durationInMinutes)}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const styles = StyleSheet.create({
    safeArea: {
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 16,
      backgroundColor: theme.background,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: '700',
      color: theme.text,
    },
    settingsButton: {
      padding: 8,
    },
    filterContainer: {
      backgroundColor: theme.background,
      paddingVertical: 12,
    },
    filterList: {
      paddingHorizontal: 16,
    },
    subFilterList: {
      paddingHorizontal: 16,
      marginTop: 12,
    },
    searchWrap: {
      paddingHorizontal: 16,
      marginTop: 12,
    },
    searchInner: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 14,
      borderWidth: 1,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchField: {
      flex: 1,
      fontSize: 16,
    },
    sortScroll: {
      marginTop: 12,
      paddingHorizontal: 16,
      maxHeight: 44,
    },
    sortChip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 999,
      borderWidth: 1,
      marginRight: 8,
    },
    sortChipText: {
      fontSize: 13,
      fontWeight: '600',
    },
    item: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      marginRight: 8,
      borderRadius: 24,
    },
    subitem: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      marginRight: 8,
      borderRadius: 16,
      borderWidth: 1,
    },
    itemText: {
      fontSize: 15,
      fontWeight: '600',
    },
    subItemText: {
      fontSize: 14,
      fontWeight: '500',
    },
    emptyStateContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
    },
    emptyStateIconContainer: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: `${theme.primary}15`,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
    },
    emptyStateTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 12,
    },
    emptyStateSubtitle: {
      fontSize: 16,
      color: theme.textMuted,
      textAlign: 'center',
      lineHeight: 24,
    },
    browseButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 32,
      backgroundColor: theme.primary,
      paddingHorizontal: 24,
      paddingVertical: 14,
      borderRadius: 28,
    },
    buttonIcon: {
      marginRight: 8,
    },
    browseButtonText: {
      color: theme.white,
      fontSize: 16,
      fontWeight: '600',
    },
    bookItem: {
      flexDirection: 'row',
      padding: moderateScale(16),
      backgroundColor: theme.lightWhite,
      marginHorizontal: horizontalScale(16),
      marginVertical: verticalScale(8),
      borderRadius: moderateScale(12),
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    bookCover: {
      width: horizontalScale(60),
      height: verticalScale(90),
      borderRadius: moderateScale(8),
      marginRight: horizontalScale(12),
    },
    bookInfo: {
      flex: 1,
      justifyContent: 'space-between',
    },
    bookTitle: {
      fontSize: moderateScale(16),
      fontWeight: '600',
      color: theme.text,
      marginBottom: verticalScale(4),
    },
    bookAuthor: {
      fontSize: moderateScale(14),
      color: theme.textMuted,
      marginBottom: verticalScale(8),
    },
    bookMeta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    bookDuration: {
      fontSize: moderateScale(12),
      color: theme.textMuted,
    },
    statusBadge: {
      paddingHorizontal: horizontalScale(8),
      paddingVertical: verticalScale(4),
      borderRadius: moderateScale(12),
    },
    statusText: {
      fontSize: moderateScale(10),
      fontWeight: '600',
      color: theme.white,
    },
  });

  return (
    <SafeAreaView style={[defaultStyles.container, styles.safeArea]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Library</Text>
       
      </View>
      
      <View style={styles.filterContainer}>
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
        />
        <FlatList
          data={subData}
          renderItem={renderSubItem}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.subFilterList}
        />
        <View style={styles.searchWrap}>
          <View
            style={[
              styles.searchInner,
              {
                backgroundColor: theme.lightWhite,
                borderColor: searchFocused ? theme.primary : theme.gray2,
              },
            ]}
          >
            <Ionicons
              name="search-outline"
              size={20}
              color={searchFocused ? theme.primary : theme.textMuted}
              style={styles.searchIcon}
            />
            <TextInput
              style={[styles.searchField, { color: theme.text }]}
              placeholder="Search title or author..."
              placeholderTextColor={theme.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              returnKeyType="search"
            />
            {searchQuery.length > 0 ? (
              <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={12}>
                <Ionicons name="close-circle" size={20} color={theme.textMuted} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
        <FlatList
          data={[...SORT_OPTIONS]}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.sortScroll}
          renderItem={({ item }) => {
            const selected = sortKey === item.key;
            return (
              <TouchableOpacity
                style={[
                  styles.sortChip,
                  {
                    backgroundColor: selected ? theme.primary : 'transparent',
                    borderColor: selected ? theme.primary : theme.gray2,
                  },
                ]}
                onPress={() => setSortKey(item.key)}
              >
                <Text
                  style={[
                    styles.sortChipText,
                    { color: selected ? theme.white : theme.text },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {loading ? (
        <View style={styles.emptyStateContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.emptyStateSubtitle, { marginTop: 16 }]}>Loading your library...</Text>
        </View>
      ) : libraryBooks.length > 0 ? (
        displayBooks.length > 0 ? (
          <FlatList
            data={displayBooks}
            renderItem={renderBookItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingVertical: 16 }}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              searchQuery.trim() ? (
                <Text
                  style={[
                    styles.emptyStateSubtitle,
                    { textAlign: 'center', marginBottom: 8, paddingHorizontal: 16 },
                  ]}
                >
                  {displayBooks.length} match{displayBooks.length === 1 ? '' : 'es'}
                </Text>
              ) : null
            }
          />
        ) : (
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyStateIconContainer}>
              <Ionicons name="search-outline" size={64} color={theme.primary} />
            </View>
            <Text style={styles.emptyStateTitle}>No matches</Text>
            <Text style={styles.emptyStateSubtitle}>
              Try a different search or clear the filter.
            </Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => setSearchQuery('')}
            >
              <Text style={styles.browseButtonText}>Clear search</Text>
            </TouchableOpacity>
          </View>
        )
      ) : (
        <View style={styles.emptyStateContainer}>
          <View style={styles.emptyStateIconContainer}>
            <Ionicons name="library-outline" size={64} color={theme.primary} />
          </View>
          <Text style={styles.emptyStateTitle}>
            {selectedSubItem === 'All Titles' ? 'No Books in Library' : `No ${selectedSubItem} Books`}
          </Text>
          <Text style={styles.emptyStateSubtitle}>
            {selectedSubItem === 'All Titles' 
              ? 'Start your collection by adding books to your library'
              : `You don't have any ${selectedSubItem.toLowerCase()} books yet`
            }
          </Text>
          <TouchableOpacity 
            style={styles.browseButton}
            onPress={() => router.push('/(tabs)/home')}
          >
            <Ionicons name="cart-outline" size={20} color={theme.white} style={styles.buttonIcon} />
            <Text style={styles.browseButtonText}>Browse Store</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default LibraryPage;