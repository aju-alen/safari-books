import { StyleSheet, Text, View, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { defaultStyles } from '@/styles'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { ipURL } from '@/utils/backendURL';
import { COLORS, FONT, FONTSIZE } from '@/constants/tokens';
import { Ionicons } from '@expo/vector-icons';

const PersonalInfo = () => {
  const [userData, setUserData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getId = async () => {
      try {
        const id = JSON.parse(await SecureStore.getItemAsync('userDetails'));
        const getUserDetails = await axios.get(`${ipURL}/api/auth/get-user/${id['userId']}`);
        setUserData(getUserDetails.data["user"]);
      } catch (error) {
        console.error('Error fetching user details:', error);
      } finally {
        setIsLoading(false);
      }
    }
    getId();
  }, [])

  const renderInfoField = (label, value, icon) => (
    <View style={styles.infoField}>
      <View style={styles.labelContainer}>
        <Ionicons name={icon} size={20} color={COLORS.primary} style={styles.fieldIcon} />
        <Text style={styles.label}>{label}</Text>
      </View>
      <View style={styles.valueContainer}>
        <Text style={styles.value}>{value}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[defaultStyles.container, styles.container]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Personal Information</Text>
        <Text style={styles.headerSubtitle}>Manage your personal details</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : userData["name"] ? (
        <View style={styles.contentContainer}>
          <View style={styles.infoCard}>
            {renderInfoField('Name', userData['name'], 'person-outline')}
            {renderInfoField('Email', userData['email'], 'mail-outline')}
          </View>

          <View style={styles.securityNote}>
            <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.primary} />
            <Text style={styles.securityText}>
              Your personal information is securely stored and protected
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.primary} />
          <Text style={styles.errorText}>Unable to load user information</Text>
        </View>
      )}
    </SafeAreaView>
  )
}

export default PersonalInfo

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 20,
    backgroundColor: COLORS.background,
  },
  headerTitle: {
    fontSize: 28,
    color: '#FFFFFF',
    fontFamily: FONT.notoBold,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: FONT.notoRegular,
  },
  contentContainer: {
    padding: 20,
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  infoField: {
    marginBottom: 24,
  },
  infoField: {
    last: {
      marginBottom: 0,
    },
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldIcon: {
    marginRight: 8,
  },
  label: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: FONT.notoMedium,
  },
  valueContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 16,
    marginLeft: 28,
  },
  value: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: FONT.notoRegular,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 12,
    padding: 16,
  },
  securityText: {
    marginLeft: 12,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: FONT.notoRegular,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: FONT.notoMedium,
    textAlign: 'center',
  },
});