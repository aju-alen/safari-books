import { FlatList, StyleSheet, Text, TouchableOpacity, View, Image, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { defaultStyles } from '@/styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/providers/ThemeProvider';
import { axiosWithAuth } from '@/utils/customAxios';
import { ipURL } from '@/utils/backendURL';
import { router } from 'expo-router';
import { horizontalScale, moderateScale, verticalScale } from '@/utils/responsiveSize';

const status = {
  'All Titles': 'All',
  'In Progress': 'IN_PROGRESS',
  'Finished': 'FINISHED',
  'Not Started': 'NOT_STARTED',
}

const LibraryPage = () => {
  const { theme } = useTheme();
  const data = ["All", "Audiobooks", "Podcast"];
  const subData = ["All Titles","In Progress", "Finished"];

  const [selectedItem, setSelectedItem] = useState("All");
  const [selectedSubItem, setSelectedSubItem] = useState("All Titles");
  const [libraryBooks, setLibraryBooks] = useState([]);
  const [loading, setLoading] = useState(false);

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

  const fetchLibraryBooks = async (status) => {
    console.log(status,'status');
    if(status === 'All Titles'){
      status = 'All';
    }
    else if(status === 'In Progress'){
      status = 'IN_PROGRESS';
    }
    else if(status === 'Finished'){
      status = 'FINISHED';
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
        <Image source={{ uri: item.coverImage }} style={styles.bookCover} />
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
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color={theme.primary} />
        </TouchableOpacity>
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
      </View>

      {loading ? (
        <View style={styles.emptyStateContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.emptyStateSubtitle, { marginTop: 16 }]}>Loading your library...</Text>
        </View>
      ) : libraryBooks.length > 0 ? (
        <FlatList
          data={libraryBooks}
          renderItem={renderBookItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingVertical: 16 }}
          showsVerticalScrollIndicator={false}
        />
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