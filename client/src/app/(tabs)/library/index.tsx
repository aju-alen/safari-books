import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import { defaultStyles } from '@/styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/providers/ThemeProvider';

const LibraryPage = () => {
  const { theme } = useTheme();
  const data = ["All", "Audiobooks", "Podcast"];
  const subData = ["All Titles", "Not Started", "In Progress", "Downloaded", "Finished"];

  const [selectedItem, setSelectedItem] = useState("All");
  const [selectedSubItem, setSelectedSubItem] = useState("All Titles");

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
        onPress={() => setSelectedSubItem(item)}
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

      <View style={styles.emptyStateContainer}>
        <View style={styles.emptyStateIconContainer}>
          <Ionicons name="library-outline" size={64} color={theme.primary} />
        </View>
        <Text style={styles.emptyStateTitle}>No Purchases Yet</Text>
        <Text style={styles.emptyStateSubtitle}>
          Start your collection by making your first purchase
        </Text>
        <TouchableOpacity style={styles.browseButton}>
          <Ionicons name="cart-outline" size={20} color={theme.white} style={styles.buttonIcon} />
          <Text style={styles.browseButtonText}>Browse Store</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default LibraryPage;