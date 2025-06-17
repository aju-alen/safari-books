import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import { MaterialIcons, Ionicons, FontAwesome5, Feather } from '@expo/vector-icons';
import { COLORS, welcomeCOLOR } from '@/constants/tokens';

const publisherOptions = [
  {
    icon: <Ionicons name="person-circle-outline" size={24} color={COLORS.primary} />,
    label: 'Edit Profile',
    route: '/(publisher)/edit-profile',
  },
  {
    icon: <MaterialIcons name="library-books" size={24} color={COLORS.primary} />,
    label: 'Manage Books',
    route: '/(publisher)/manage-books',
  },
  {
    icon: <FontAwesome5 name="chart-line" size={22} color={COLORS.primary} />,
    label: 'Analytics',
    route: '/(publisher)/analytics',
  },
  {
    icon: <Feather name="credit-card" size={22} color={COLORS.primary} />,
    label: 'Payment Settings',
    route: '/(publisher)/payments',
  },
  {
    icon: <Ionicons name="help-circle-outline" size={24} color={COLORS.primary} />,
    label: 'Support',
    route: '/(publisher)/support',
  },
];

const SettingsPage = () => {
  const router = useRouter();

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('userDetails');
    await SecureStore.deleteItemAsync('authToken');
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
    router.replace({ pathname: '/(tabs)/home' }); // Adjust this route to your listener home/dashboard
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Settings</Text>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.optionsSection}>
          {publisherOptions.map((option, idx) => (
            <TouchableOpacity
              key={option.label}
              style={styles.optionButton}
              onPress={() => router.push(option.route)}
            >
              <View style={styles.optionIcon}>{option.icon}</View>
              <Text style={styles.optionLabel}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ flex: 1 }} />
        <TouchableOpacity style={styles.listenerButton} onPress={handleViewAsListener}>
          <Ionicons name="headset-outline" size={22} color={COLORS.primary} />
          <Text style={styles.listenerText}>View as Listener</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={confirmLogout} style={styles.logoutButton}>
          <MaterialIcons name="logout" size={22} color={COLORS.text} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 24,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 32,
  },
  optionsSection: {
    marginBottom: 32,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74,77,255,0.07)',
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
    color: COLORS.text,
    fontWeight: '500',
  },
  listenerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74,77,255,0.12)',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 12,
    marginBottom: 24,
    justifyContent: 'center',
  },
  listenerText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoutText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
}); 