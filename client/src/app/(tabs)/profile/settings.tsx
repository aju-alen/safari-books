import { StyleSheet, Text, TouchableOpacity, View, Switch, ScrollView, Modal, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { defaultStyles } from '@/styles'
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ThemeType } from '@/providers/ThemeProvider';
import { clearPushTokenCache } from '@/utils/registerForPushNotificationsAsync';
import { verticalScale, horizontalScale, moderateScale } from '@/utils/responsiveSize';

const SettingsPage = () => {
  const [userData, setUserData] = useState<any>(null);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const { theme, isDarkMode, toggleTheme, currentTheme, setTheme } = useTheme();

  const themes = [
    { id: 'nature', name: 'Nature', icon: '🌿', description: 'Forest green theme' },
    { id: 'desert', name: 'Desert', icon: '🏜️', description: 'Warm earth tones' },
    { id: 'ocean', name: 'Ocean', icon: '🌊', description: 'Cool blue tones' },
    { id: 'pastel', name: 'Pastel', icon: '🌸', description: 'Soft pink theme' },
    { id: 'sunset', name: 'Sunset', icon: '🌅', description: 'Vibrant orange-pink' },
    { id: 'royal', name: 'Royal', icon: '✨', description: 'Sophisticated purple' },
    { id: 'autumn', name: 'Autumn', icon: '🍂', description: 'Warm earth tones' },
    { id: 'mint', name: 'Mint', icon: '🌱', description: 'Fresh cool green' },
    { id: 'neon', name: 'Neon', icon: '⚡', description: 'Bold cyberpunk style' },
  ];

  useEffect(() => {
    const checkUser = async () => {
      let userDetail = await SecureStore.getItemAsync('userDetails');
      if (!userDetail) return;
      const userData = JSON.parse(userDetail);
      setUserData(userData);
    };
    checkUser();
  }, []);

  const menuItems = [
    {
      title: 'Personal Information',
      icon: 'person-outline',
      onPress: () => router.push('/(tabs)/profile/personalInfo')
    },
    {
      title: 'App Theme',
      icon: 'color-palette-outline',
      onPress: () => setShowThemeModal(true)
    },
    {
      title: 'Delete Account',
      icon: 'trash-outline',
      onPress: () => router.push('/(tabs)/profile/deleteAccount')
    }
  ];

  const handleLogout = async() => {
    await SecureStore.deleteItemAsync('userDetails');
    await SecureStore.deleteItemAsync('authToken');
    await clearPushTokenCache(); // Clear push token cache on logout
    router.replace('/(authenticate)/login');
  }

  return (
    <SafeAreaView style={[defaultStyles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Settings</Text>
      </View>

      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity 
            key={index}
            style={[styles.menuItem, { backgroundColor: theme.white }]}
            onPress={item.onPress}
          >
            <View style={styles.menuItemContent}>
              <View style={styles.menuItemLeft}>
                  <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={moderateScale(24)} color={theme.text} />
                <Text style={[styles.menuItemText, { color: theme.text }]}>{item.title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={moderateScale(20)} color={theme.textMuted} />
            </View>
          </TouchableOpacity>
        ))}
        
        {/* Dark Mode Toggle */}
        <View style={[styles.menuItem, { backgroundColor: theme.white }]}>
          <View style={styles.menuItemContent}>
            <View style={styles.menuItemLeft}>
              <Ionicons 
                name={isDarkMode ? "moon" : "sunny"} 
                size={moderateScale(24)} 
                color={theme.text} 
              />
              <Text style={[styles.menuItemText, { color: theme.text }]}>
                {isDarkMode ? 'Dark Mode' : 'Light Mode'}
              </Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.gray2, true: theme.primary }}
              thumbColor={isDarkMode ? theme.white : theme.white}
              ios_backgroundColor={theme.gray2}
            />
          </View>
        </View>

        {userData?.role === 'PUBLISHER' && <TouchableOpacity 
            style={[styles.menuItem, { backgroundColor: theme.white }]}
            onPress={() => router.replace('/(publisher)/publisherhome')}
          >
            <View style={styles.menuItemContent}>
              <View style={styles.menuItemLeft}>
                <Ionicons name="person-outline" size={moderateScale(24)} color={theme.text} />
                <Text style={[styles.menuItemText, { color: theme.text }]}>Switch to Publisher</Text>
              </View>
              <Ionicons name="chevron-forward" size={moderateScale(20)} color={theme.textMuted} />
            </View>
          </TouchableOpacity>}
      </View>

      <View style={styles.logoutContainer}>
        <TouchableOpacity 
          onPress={handleLogout}
          style={[styles.logoutButton, { backgroundColor: theme.primary, shadowColor: theme.primary }]}
        >
          <Ionicons name="log-out-outline" size={moderateScale(20)} color={theme.white} style={styles.logoutIcon} />
          <Text style={[styles.logoutText, { color: theme.white }]}>Logout</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>

      {/* Theme Selection Modal */}
      <Modal
        visible={showThemeModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowThemeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.white }]}>
            {/* Header */}
            <View style={[styles.modalHeader, { borderBottomColor: theme.gray2 }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Choose Theme</Text>
              <TouchableOpacity 
                onPress={() => setShowThemeModal(false)}
                style={[styles.closeButton, { backgroundColor: `${theme.gray2}15` }]}
              >
                <Ionicons name="close" size={moderateScale(20)} color={theme.text} />
              </TouchableOpacity>
            </View>
            
            {/* Theme Options */}
            <ScrollView 
              style={[styles.themeList, { backgroundColor: theme.white }]} 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.themeListContent}
            >
              {themes.map((themeOption) => (
                <TouchableOpacity
                  key={themeOption.id}
                  style={[
                    styles.themeOption,
                    { backgroundColor: theme.background },
                    currentTheme === themeOption.id && { 
                      borderColor: theme.primary, 
                      borderWidth: 2,
                      backgroundColor: `${theme.primary}05`
                    }
                  ]}
                  onPress={() => {
                    setTheme(themeOption.id as ThemeType);
                    setShowThemeModal(false);
                  }}
                >
                  <View style={styles.themeOptionContent}>
                    <View style={[styles.themeIconContainer, { backgroundColor: `${theme.primary}10` }]}>
                      <Text style={styles.themeIcon}>{themeOption.icon}</Text>
                    </View>
                    <View style={styles.themeInfo}>
                      <Text style={[styles.themeName, { color: theme.text }]}>
                        {themeOption.name}
                      </Text>
                      <Text style={[styles.themeDescription, { color: theme.textMuted }]}>
                        {themeOption.description}
                      </Text>
                    </View>
                    {currentTheme === themeOption.id && (
                      <View style={[styles.checkmarkContainer, { backgroundColor: theme.primary }]}>
                        <Ionicons name="checkmark" size={moderateScale(16)} color={theme.white} />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

export default SettingsPage

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(16),
  },
  headerTitle: {
    fontSize: moderateScale(28),
    fontWeight: '700',
  },
  settingsButton: {
    padding: moderateScale(8),
    borderRadius: moderateScale(20),
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  menuContainer: {
    marginTop: 20,
    paddingHorizontal: horizontalScale(16),
  },
  menuItem: {
    marginBottom: 8,
    borderRadius: 16,
    overflow: 'hidden',
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
  menuItemText: {
    marginLeft: moderateScale(12),
    fontSize: moderateScale(16),
    fontWeight: '500',
  },
  logoutContainer: {
    paddingHorizontal: horizontalScale(16),
    paddingBottom: verticalScale(32),
    marginTop: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(16),
    borderRadius: moderateScale(28),
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowRadius: 8,
    elevation: 5,
  },
  logoutIcon: {
    marginRight: horizontalScale(8),
  },
  logoutText: {
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
    paddingBottom: verticalScale(60),
  },
  modalContent: {
    borderTopLeftRadius: moderateScale(24),
    borderTopRightRadius: moderateScale(24),
    paddingTop: verticalScale(24),
    maxHeight: '85%',
    minHeight: '50%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(24),
    paddingBottom: verticalScale(24),
    borderBottomWidth: 1,
    // borderBottomColor removed - now using theme
  },
  modalTitle: {
    fontSize: moderateScale(22),
    fontWeight: '700',
  },
  themeList: {
    paddingHorizontal: horizontalScale(24),
    paddingVertical: verticalScale(16),
    flex: 1,
  },
  themeListContent: {
    paddingBottom: verticalScale(20),
    flexGrow: 1,
  },
  themeOption: {
    borderRadius: moderateScale(16),
    padding: moderateScale(20),
    marginBottom: moderateScale(16),
    borderWidth: 1,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 8,
    elevation: 3,
  },
  themeOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeIconContainer: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(14),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: horizontalScale(16),
  },
  themeIcon: {
    fontSize: moderateScale(28),
  },
  themeInfo: {
    flex: 1,
  },
  themeName: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    marginBottom: moderateScale(4),
  },
  themeDescription: {
    fontSize: moderateScale(14),
    lineHeight: moderateScale(20),
  },
  closeButton: {
    padding: moderateScale(10),
    borderRadius: moderateScale(22),
  },
  checkmarkContainer: {
    width: moderateScale(24),
    height: moderateScale(24),
    borderRadius: moderateScale(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
});