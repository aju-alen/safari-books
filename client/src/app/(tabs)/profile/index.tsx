import { StyleSheet, Text, TouchableOpacity, View, Image, ScrollView, Dimensions } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { defaultStyles } from '@/styles'
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/tokens';
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

  useEffect(() => {
    const getUserDetails = async () => {
      const details = await SecureStore.getItemAsync('authToken');
      console.log(details, 'details in profile');
      
      if (details) {
        setUserDetails(JSON.parse(details));
      }
    };
    getUserDetails();
  }, []);

  const handleLogout = async() => {
    await SecureStore.deleteItemAsync('userDetails');
    await SecureStore.deleteItemAsync('authToken');
    router.push('/(authenticate)/login');
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
      color: '#4A4DFF'
    },
    { 
      icon: 'heart-outline', 
      label: 'Favorites', 
      route: '/(tabs)/favorites',
      color: '#FF3B30'
    },
    { 
      icon: 'download-outline', 
      label: 'Downloads', 
      route: '/(tabs)/downloads',
      color: '#34C759'
    },
    { 
      icon: 'notifications-outline', 
      label: 'Notifications', 
      route: '/(tabs)/notifications',
      color: '#FF9500'
    },
    { 
      icon: 'help-circle-outline', 
      label: 'Help & Support', 
      route: '/(tabs)/support',
      color: '#5856D6'
    },
  ];

  const SectionTitle = ({ title }: { title: string }) => (
    <View style={styles.sectionTitleContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.titleUnderline} />
    </View>
  );

  return (
    <SafeAreaView style={[defaultStyles.container, styles.container]}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header with Gradient */}
        <LinearGradient
          colors={['rgba(74, 77, 255, 0.15)', 'rgba(74, 77, 255, 0.05)']}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Profile</Text>
            <TouchableOpacity 
              style={styles.settingsButton}
              onPress={() => router.push('/(tabs)/profile/settings')}
            >
              <Ionicons name="settings-outline" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {/* Profile Info */}
          <View style={styles.profileSection}>
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{userDetails?.name || 'Guest User'}</Text>
              <Text style={styles.userEmail}>{userDetails?.email || 'No Email'}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: `${COLORS.primary}20` }]}>
                <Ionicons name={stat.icon} size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Menu Items */}
        <SectionTitle title="Account" />
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => router.push(item.route)}
            >
              <View style={styles.menuItemContent}>
                <View style={styles.menuItemLeft}>
                  <View style={[styles.menuIconContainer, { backgroundColor: `${item.color}20` }]}>
                    <Ionicons name={item.icon} size={24} color={item.color} />
                  </View>
                  <Text style={styles.menuItemText}>{item.label}</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color={COLORS.primary} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
        >
          <MaterialCommunityIcons name="logout" size={24} color="#FFFFFF" style={styles.logoutIcon} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

export default ProfilePage

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000000',
  },
  scrollContent: {
    paddingBottom: moderateScale(30),
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
    color: '#FFFFFF',
  },
  settingsButton: {
    padding: moderateScale(12),
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderRadius: moderateScale(15),
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
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
    color: '#FFFFFF',
    marginBottom: moderateScale(4),
  },
  userEmail: {
    fontSize: moderateScale(16),
    color: 'rgba(255, 255, 255, 0.6)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: moderateScale(16),
    padding: moderateScale(15),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
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
    color: '#FFFFFF',
    marginBottom: moderateScale(4),
  },
  statLabel: {
    fontSize: moderateScale(12),
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  sectionTitleContainer: {
    marginBottom: moderateScale(18),
    paddingHorizontal: moderateScale(20),
  },
  sectionTitle: {
    fontSize: moderateScale(24),
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: moderateScale(10),
  },
  titleUnderline: {
    height: 4,
    width: '25%',
    backgroundColor: COLORS.primary,
    borderRadius: moderateScale(4),
  },
  menuContainer: {
    paddingHorizontal: moderateScale(20),
  },
  menuItem: {
    marginBottom: moderateScale(12),
    borderRadius: moderateScale(16),
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
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
    color: '#FFFFFF',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    marginHorizontal: moderateScale(20),
    marginTop: moderateScale(20),
    paddingVertical: moderateScale(16),
    borderRadius: moderateScale(16),
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.3)',
  },
  logoutIcon: {
    marginRight: moderateScale(8),
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
});