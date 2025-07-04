import { StyleSheet, Text, TouchableOpacity, View, Switch, ScrollView, Modal, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { defaultStyles } from '@/styles'
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ThemeType } from '@/providers/ThemeProvider';
import { clearPushTokenCache } from '@/utils/registerForPushNotificationsAsync';

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
    { id: 'royal', name: 'Royal', icon: '🧘🏼‍♀️', description: 'Sophisticated purple' },
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
                  <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={24} color={theme.text} />
                <Text style={[styles.menuItemText, { color: theme.text }]}>{item.title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
            </View>
          </TouchableOpacity>
        ))}
        
        {/* Dark Mode Toggle */}
        <View style={[styles.menuItem, { backgroundColor: theme.white }]}>
          <View style={styles.menuItemContent}>
            <View style={styles.menuItemLeft}>
              <Ionicons 
                name={isDarkMode ? "moon" : "sunny"} 
                size={24} 
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
                <Ionicons name="person-outline" size={24} color={theme.text} />
                <Text style={[styles.menuItemText, { color: theme.text }]}>Switch to Publisher</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
            </View>
          </TouchableOpacity>}
      </View>

      <View style={styles.logoutContainer}>
        <TouchableOpacity 
          onPress={handleLogout}
          style={[styles.logoutButton, { backgroundColor: theme.primary, shadowColor: theme.primary }]}
        >
          <Ionicons name="log-out-outline" size={20} color={theme.white} style={styles.logoutIcon} />
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
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Choose Theme</Text>
              <TouchableOpacity onPress={() => setShowThemeModal(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.themeList} showsVerticalScrollIndicator={false}>
              {themes.map((themeOption) => (
                <TouchableOpacity
                  key={themeOption.id}
                  style={[
                    styles.themeOption,
                    { backgroundColor: theme.background },
                    currentTheme === themeOption.id && { borderColor: theme.primary, borderWidth: 2 }
                  ]}
                  onPress={() => {
                    setTheme(themeOption.id as ThemeType);
                    setShowThemeModal(false);
                  }}
                >
                  <View style={styles.themeOptionContent}>
                    <Text style={styles.themeIcon}>{themeOption.icon}</Text>
                    <View style={styles.themeInfo}>
                      <Text style={[styles.themeName, { color: theme.text }]}>
                        {themeOption.name}
                      </Text>
                      <Text style={[styles.themeDescription, { color: theme.textMuted }]}>
                        {themeOption.description}
                      </Text>
                    </View>
                    {currentTheme === themeOption.id && (
                      <Ionicons name="checkmark-circle" size={24} color={theme.primary} />
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
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  settingsButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  menuContainer: {
    marginTop: 20,
    paddingHorizontal: 16,
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
    padding: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  logoutContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    marginTop: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 28,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowRadius: 8,
    elevation: 5,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  themeList: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  themeOption: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  themeOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  themeInfo: {
    flex: 1,
  },
  themeName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  themeDescription: {
    fontSize: 14,
  },
});