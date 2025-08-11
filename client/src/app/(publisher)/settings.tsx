import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import { MaterialIcons, Ionicons, FontAwesome5, Feather } from '@expo/vector-icons';
import { useTheme } from '@/providers/ThemeProvider';
import { clearPushTokenCache } from '@/utils/registerForPushNotificationsAsync';

const SettingsPage = () => {
  const router = useRouter();
  const { theme } = useTheme();

const publisherOptions = [
  // {
  //     icon: <Ionicons name="person-circle-outline" size={24} color={theme.primary} />,
  //   label: 'Edit Profile',
  //   route: '/(publisher)/edit-profile',
  // },
  // {
  //     icon: <MaterialIcons name="library-books" size={24} color={theme.primary} />,
  //   label: 'Manage Books',
  //   route: '/(publisher)/manage-books',
  // },
  // {
  //     icon: <FontAwesome5 name="chart-line" size={22} color={theme.primary} />,
  //   label: 'Analytics',
  //   route: '/(publisher)/analytics',
  // },
  // {
  //     icon: <Feather name="credit-card" size={22} color={theme.primary} />,
  //   label: 'Payment Settings',
  //   route: '/(publisher)/payments',
  // },
  {
      icon: <Ionicons name="help-circle-outline" size={24} color={theme.primary} />,
    label: 'Support',
    route: '/(publisher)/support',
  },
  {
    icon: <Ionicons name="document-text-outline" size={24} color={theme.primary} />,
    label: 'Terms of Use (EULA)',
    onPress: () => Linking.openURL('https://safari-books-mobile.s3.ap-south-1.amazonaws.com/Assets/EULA.pdf')
  },
  {
    icon: <Ionicons name="shield-checkmark-outline" size={24} color={theme.primary} />,
    label: 'Privacy Policy',
    onPress: () => Linking.openURL('https://safari-books-mobile.s3.ap-south-1.amazonaws.com/Assets/privacy-policy.pdf')
  },
  
];

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('userDetails');
    await SecureStore.deleteItemAsync('authToken');
    await clearPushTokenCache(); // Clear push token cache on logout
    router.replace('/(authenticate)/login');
  };

  const confirmLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: handleLogout },
      ]
    );
  };

  const handleViewAsListener = () => {
    router.replace('/(tabs)/home' as any);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.header, { color: theme.text }]}>Settings</Text>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.optionsSection}>
          {publisherOptions.map((option, idx) => (
            <TouchableOpacity
              key={option.label}
              style={[styles.optionButton, { backgroundColor: `${theme.primary}10` }]}
              onPress={() => option.onPress ? option.onPress() : router.push(option.route as any)}
            >
              <View style={styles.optionIcon}>{option.icon}</View>
              <Text style={[styles.optionLabel, { color: theme.text }]}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ flex: 1 }} />
        <TouchableOpacity 
          style={[styles.listenerButton, { backgroundColor: `${theme.primary}20` }]} 
          onPress={handleViewAsListener}
        >
          <Ionicons name="headset-outline" size={22} color={theme.primary} />
          <Text style={[styles.listenerText, { color: theme.primary }]}>View as Listener</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.logoutButton, { backgroundColor: theme.primary }]} 
          onPress={confirmLogout}
        >
          <MaterialIcons name="logout" size={22} color={theme.white} />
          <Text style={[styles.logoutText, { color: theme.white }]}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 32,
  },
  optionsSection: {
    marginBottom: 32,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 12,
    marginBottom: 16,
  },
  optionIcon: {
    marginRight: 16,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  listenerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 12,
    marginBottom: 24,
    justifyContent: 'center',
  },
  listenerText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
}); 