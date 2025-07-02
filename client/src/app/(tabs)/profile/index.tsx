import { StyleSheet, Text, TouchableOpacity, View, Image, ScrollView, Dimensions, RefreshControl, ActivityIndicator } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { defaultStyles } from '@/styles'
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/providers/ThemeProvider';
import { moderateScale, verticalScale } from '@/utils/responsiveSize';
import { LinearGradient } from 'expo-linear-gradient';

type IconName = keyof typeof Ionicons.glyphMap;

interface Stat {
  icon: IconName;
  label: string;
  value: string;
}

interface MenuItem {
  icon: IconName;
  label: string;
  route: any;
  color: string;
}

const { width } = Dimensions.get('window');

const ProfilePage = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const {theme} = useTheme()

  const getUserDetails = async () => {
    const details = await SecureStore.getItemAsync('userDetails');
    console.log(details, 'details in profile');
    
    if (details) {
      setUserDetails(JSON.parse(details));
    }
    setLoading(false);
  };

  useEffect(() => {
    getUserDetails();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await getUserDetails();
      // Add a small delay to show the refresh animation
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error refreshing profile:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleLogout = async() => {
    await SecureStore.deleteItemAsync('userDetails');
    await SecureStore.deleteItemAsync('authToken');
    router.replace('/(authenticate)/login');
  }

  const stats: Stat[] = [
    { icon: 'headset-outline', label: 'Listening Hours', value: '24.5' },
    { icon: 'book-outline', label: 'Books Completed', value: '12' },
    { icon: 'time-outline', label: 'Current Streak', value: '7 days' },
  ];

  const menuItems: MenuItem[] = [
    { 
      icon: 'bookmark-outline', 
      label: 'My Library', 
      route: '/(tabs)/library',
      color: theme.secondary
    },
    { 
      icon: 'heart-outline', 
      label: 'Favorites', 
      route: '/(tabs)/profile/favorites',
      color: theme.tertiary
    },
  
    { 
      icon: 'notifications-outline', 
      label: 'Notifications', 
      route: '/(tabs)/notifications',
      color: theme.primary
    },
    { 
      icon: 'help-circle-outline', 
      label: 'Help & Support', 
      route: '/(tabs)/support',
      color: theme.secondary
    },
  ];

  const SectionTitle = ({ title }: { title: string }) => (
    <View style={styles.sectionTitleContainer}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
      <View style={[styles.titleUnderline, { backgroundColor: theme.primary }]} />
    </View>
  );

  return (
    <SafeAreaView style={[defaultStyles.container, { backgroundColor: theme.background }]}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
            progressBackgroundColor={theme.background}
          />
        }
      >
        {/* Loading State */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadingText, { color: theme.textMuted }]}>Loading profile...</Text>
          </View>
        ) : (
          <>
          {/* Header with Gradient */}
          <View
            style={[styles.headerGradient, { backgroundColor: theme.background }]}
          >
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Profile</Text>
            <TouchableOpacity 
              style={[styles.settingsButton, { 
                backgroundColor: `${theme.primary}20`,
                borderColor: `${theme.primary}30`
              }]}
              onPress={() => router.push('/(tabs)/profile/settings')}
            >
              <Ionicons name="settings-outline" size={24} color={theme.primary} />
            </TouchableOpacity>
          </View>

          {/* Profile Info */}
          <View style={styles.profileSection}>
            <View style={styles.profileInfo}>
              <Text style={[styles.userName, { color: theme.text }]}>{userDetails?.name || 'Guest User'}</Text>
              <Text style={[styles.userEmail, { color: theme.textMuted }]}>{userDetails?.email || 'No Email'}</Text>
            </View>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View key={index} style={[styles.statCard, { 
              backgroundColor: theme.white,
              borderColor: theme.gray2
            }]}>
              <View style={[styles.statIconContainer, { backgroundColor: `${theme.primary}20` }]}>
                <Ionicons name={stat.icon} size={24} color={theme.primary} />
              </View>
              <Text style={[styles.statValue, { color: theme.text }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Menu Items */}
        <SectionTitle title="Account" />
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuItem, { 
                backgroundColor: theme.white,
                borderColor: theme.gray2
              }]}
              onPress={() => router.push(item.route)}
            >
              <View style={styles.menuItemContent}>
                <View style={styles.menuItemLeft}>
                  <View style={[styles.menuIconContainer, { backgroundColor: `${item.color}20` }]}>
                    <Ionicons name={item.icon} size={24} color={item.color} />
                  </View>
                  <Text style={[styles.menuItemText, { color: theme.text }]}>{item.label}</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color={theme.primary} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          style={[styles.logoutButton, { 
            backgroundColor: `${theme.tertiary}20`,
            borderColor: `${theme.tertiary}30`
          }]} 
          onPress={handleLogout}
        >
          <MaterialCommunityIcons name="logout" size={24} color={theme.tertiary} style={styles.logoutIcon} />
          <Text style={[styles.logoutText, { color: theme.tertiary }]}>Logout</Text>
        </TouchableOpacity>
        </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

export default ProfilePage

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: moderateScale(30),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: moderateScale(100),
  },
  loadingText: {
    fontSize: moderateScale(16),
    marginTop: moderateScale(16),
  },
  headerGradient: {
    paddingTop: moderateScale(20),
    paddingBottom: moderateScale(30),
    borderBottomLeftRadius: moderateScale(20),
    borderBottomRightRadius: moderateScale(20),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: moderateScale(20),
    marginBottom: moderateScale(20),
  },
  headerTitle: {
    fontSize: moderateScale(28),
    fontWeight: '700',
  },
  settingsButton: {
    padding: moderateScale(12),
    borderRadius: moderateScale(15),
    borderWidth: 1,
  },
  profileSection: {
    paddingHorizontal: moderateScale(20),
  },
  profileInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: moderateScale(24),
    fontWeight: '600',
    marginBottom: moderateScale(4),
  },
  userEmail: {
    fontSize: moderateScale(16),
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(20),
    marginTop: moderateScale(-20),
    marginBottom: moderateScale(30),
  },
  statCard: {
    width: (width - moderateScale(60)) / 3,
    borderRadius: moderateScale(16),
    padding: moderateScale(15),
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowRadius: 4,
    elevation: 3,
  },
  statIconContainer: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: moderateScale(8),
  },
  statValue: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    marginBottom: moderateScale(4),
  },
  statLabel: {
    fontSize: moderateScale(12),
    textAlign: 'center',
  },
  sectionTitleContainer: {
    marginBottom: moderateScale(18),
    paddingHorizontal: moderateScale(20),
  },
  sectionTitle: {
    fontSize: moderateScale(24),
    fontWeight: '700',
    marginBottom: moderateScale(10),
  },
  titleUnderline: {
    height: 4,
    width: '25%',
    borderRadius: moderateScale(4),
  },
  menuContainer: {
    paddingHorizontal: moderateScale(20),
  },
  menuItem: {
    marginBottom: moderateScale(12),
    borderRadius: moderateScale(16),
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowRadius: 4,
    elevation: 3,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: moderateScale(16),
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconContainer: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: moderateScale(12),
  },
  menuItemText: {
    fontSize: moderateScale(16),
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: moderateScale(20),
    marginTop: moderateScale(20),
    paddingVertical: moderateScale(16),
    borderRadius: moderateScale(16),
    borderWidth: 1,
  },
  logoutIcon: {
    marginRight: moderateScale(8),
  },
  logoutText: {
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
});