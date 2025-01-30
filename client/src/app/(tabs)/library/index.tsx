import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import { defaultStyles } from '@/styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/tokens';

const LibraryPage = () => {
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
          isSelected && styles.selectedItem,
        ]}
        onPress={() => setSelectedItem(item)}
      >
        <Text style={[
          styles.itemText,
          isSelected && styles.selectedItemText
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
          isSelected && styles.selectedSubItem,
        ]}
        onPress={() => setSelectedSubItem(item)}
      >
        <Text style={[
          styles.subItemText,
          isSelected && styles.selectedSubItemText
        ]}>
          {item}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[defaultStyles.container, styles.safeArea]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Library</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color={COLORS.primary} />
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
          <Ionicons name="library-outline" size={64} color={COLORS.primary} />
        </View>
        <Text style={styles.emptyStateTitle}>No Purchases Yet</Text>
        <Text style={styles.emptyStateSubtitle}>
          Start your collection by making your first purchase
        </Text>
        <TouchableOpacity style={styles.browseButton}>
          <Ionicons name="cart-outline" size={20} color="#FFF" style={styles.buttonIcon} />
          <Text style={styles.browseButtonText}>Browse Store</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.background,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  settingsButton: {
    padding: 8,
  },
  filterContainer: {
    backgroundColor: COLORS.background,
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedItem: {
    backgroundColor: COLORS.primary,
  },
  subitem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  selectedSubItem: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
  },
  itemText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  subItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  selectedItemText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  selectedSubItemText: {
    color: COLORS.primary,
    fontWeight: '600',
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
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 24,
  },
  browseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 32,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 28,
  },
  buttonIcon: {
    marginRight: 8,
  },
  browseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LibraryPage;