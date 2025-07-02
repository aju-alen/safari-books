import { StyleSheet, Text, TouchableOpacity, View, Switch } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { defaultStyles } from '@/styles'
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import {  Ionicons } from '@expo/vector-icons';
import { COLORS, DARK_COLORS } from '@/constants/tokens';
import { useTheme } from '@/providers/ThemeProvider';

const SettingsPage = () => {

  const [userData, setUserData] = useState<any>(null);
  const { theme, isDarkMode, toggleTheme } = useTheme();

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
      title: 'Preferences',
      icon: 'options-outline',
      onPress: () => {}
    },
    {
      title: 'Analytics',
      icon: 'analytics-outline',
      onPress: () => {}
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
    router.replace('/(authenticate)/login');
  }

  return (
    <SafeAreaView style={[defaultStyles.container, { backgroundColor: theme.background }]}>
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
                <Ionicons name ={item.icon as keyof typeof Ionicons.glyphMap} size={24} color={theme.text} />
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
    </SafeAreaView>
  )
}

export default SettingsPage

const styles = StyleSheet.create({
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
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 32,
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
});