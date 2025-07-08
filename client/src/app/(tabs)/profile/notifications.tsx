import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { defaultStyles } from '@/styles'
import { useTheme } from '@/providers/ThemeProvider'
import { useNotification } from '@/providers/NotificationsProvider'
import { Ionicons } from '@expo/vector-icons'
import { verticalScale, horizontalScale, moderateScale } from '@/utils/responsiveSize'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { router } from 'expo-router'
import * as SecureStore from 'expo-secure-store'

const NotificationsPage = () => {
  const { theme } = useTheme()
  const { expoPushToken, notification, error } = useNotification()
  const [notificationSettings, setNotificationSettings] = useState({
    newReleases: true,
  })
  const [deviceInfo, setDeviceInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNotificationData()
  }, [])

  const loadNotificationData = async () => {
    try {
      setLoading(true)
      
      // Get device info
      const deviceData = {
        name: Device.deviceName,
        brand: Device.brand,
        modelName: Device.modelName,
        osVersion: Device.osVersion,
        platformApiLevel: Device.platformApiLevel,
        isDevice: Device.isDevice
      }
      setDeviceInfo(deviceData)
      
      // Load saved notification settings
      const savedSettings = await SecureStore.getItemAsync('notificationSettings')
      if (savedSettings) {
        console.log('savedSettings', savedSettings);
        
        setNotificationSettings(JSON.parse(savedSettings))
      }
      
      // Push token is now handled by the NotificationsProvider
      
    } catch (error) {
      console.error('Error loading notification data:', error)
      Alert.alert('Error', 'Failed to load notification data')
    } finally {
      setLoading(false)
    }
  }

  const handleSettingToggle = async (setting: string) => {
    try {
      const newSettings = {
        ...notificationSettings,
        [setting]: !notificationSettings[setting as keyof typeof notificationSettings]
      }
      setNotificationSettings(newSettings)
      
      // Save to secure store
      await SecureStore.setItemAsync('notificationSettings', JSON.stringify(newSettings))
      
    } catch (error) {
      console.error('Error updating notification settings:', error)
      Alert.alert('Error', 'Failed to update notification settings')
    }
  }

  const handleTestNotification = async () => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Test Notification",
          body: "This is a test notification from Safari Books",
          data: { data: 'test' },
        },
        trigger: { seconds: 2, type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL },
      })
      Alert.alert('Success', 'Test notification sent!')
    } catch (error) {
      console.error('Error sending test notification:', error)
      Alert.alert('Error', 'Failed to send test notification')
    }
  }

  const copyToClipboard = (text: string) => {
    Alert.alert('Copied!', 'Text copied to clipboard')
  }

  return (
    <SafeAreaView style={[defaultStyles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={[styles.backButton, { backgroundColor: `${theme.gray2}15` }]}
          >
            <Ionicons name="arrow-back" size={moderateScale(24)} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Notifications</Text>
          <View style={styles.placeholderView} />
        </View>

        {/* Push Token Section */}
        <View style={[styles.section, { backgroundColor: theme.white }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Push Token</Text>
          <Text style={[styles.sectionDescription, { color: theme.textMuted }]}>
            This token is used to send push notifications to your device
          </Text>
          
          {expoPushToken ? (
            <View style={[styles.tokenContainer, { backgroundColor: `${theme.gray2}10` }]}>
              <Text style={[styles.tokenLabel, { color: theme.textMuted }]}>Expo Push Token:</Text>
              <Text style={[styles.tokenText, { color: theme.text }]} numberOfLines={3}>
                {expoPushToken}
              </Text>
              <View style={styles.tokenActions}>
                <TouchableOpacity 
                  style={[styles.tokenButton, { backgroundColor: theme.primary }]}
                  onPress={() => copyToClipboard(expoPushToken)}
                >
                  <Ionicons name="copy-outline" size={moderateScale(16)} color={theme.white} />
                  <Text style={[styles.tokenButtonText, { color: theme.white }]}>Copy</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={[styles.noTokenContainer, { backgroundColor: `${theme.gray2}10` }]}>
              <Ionicons name="notifications-off-outline" size={moderateScale(48)} color={theme.textMuted} />
              <Text style={[styles.noTokenText, { color: theme.textMuted }]}>
                No push token availabl || {error?.message}
              </Text>
            </View>
          )}
        </View>

        {/* Device Information */}
        {deviceInfo && (
          <View style={[styles.section, { backgroundColor: theme.white }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Device Information</Text>
            <View style={styles.deviceInfo}>
              <View style={[styles.infoRow, { borderBottomColor: theme.gray2 }]}>
                <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Device Name:</Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>{deviceInfo.name}</Text>
              </View>
              <View style={[styles.infoRow, { borderBottomColor: theme.gray2 }]}>
                <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Brand:</Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>{deviceInfo.brand}</Text>
              </View>
              <View style={[styles.infoRow, { borderBottomColor: theme.gray2 }]}>
                <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Model:</Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>{deviceInfo.modelName}</Text>
              </View>
              <View style={[styles.infoRow, { borderBottomColor: theme.gray2 }]}>
                <Text style={[styles.infoLabel, { color: theme.textMuted }]}>OS Version:</Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>{deviceInfo.osVersion}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Notification Settings */}
        {/* <View style={[styles.section, { backgroundColor: theme.white }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Notification Settings</Text>
          <Text style={[styles.sectionDescription, { color: theme.textMuted }]}>
            Customize which notifications you want to receive
          </Text>
          
          <View style={styles.settingsList}>
            {Object.entries(notificationSettings).map(([key, value]) => (
              <View key={key} style={[styles.settingItem, { borderBottomColor: theme.gray2 }]}>
                <View style={styles.settingInfo}>
                  <Ionicons 
                    name={getSettingIcon(key)} 
                    size={moderateScale(20)} 
                    color={theme.text} 
                  />
                  <View style={styles.settingText}>
                    <Text style={[styles.settingLabel, { color: theme.text }]}>
                      {getSettingLabel(key)}
                    </Text>
                    <Text style={[styles.settingDescription, { color: theme.textMuted }]}>
                      {getSettingDescription(key)}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={value}
                  onValueChange={() => handleSettingToggle(key)}
                  trackColor={{ false: theme.gray2, true: theme.primary }}
                  thumbColor={value ? theme.white : theme.white}
                  ios_backgroundColor={theme.gray2}
                />
              </View>
            ))}
          </View>
        </View> */}

        {/* Current Notification */}
        {notification && (
          <View style={[styles.section, { backgroundColor: theme.white }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Last Received Notification</Text>
            <View style={[styles.notificationContainer, { backgroundColor: `${theme.gray2}10` }]}>
              <Text style={[styles.notificationTitle, { color: theme.text }]}>
                {notification.request.content.title}
              </Text>
              <Text style={[styles.notificationBody, { color: theme.textMuted }]}>
                {notification.request.content.body}
              </Text>
              <Text style={[styles.notificationTime, { color: theme.textMuted }]}>
                {new Date(notification.date).toLocaleString()}
              </Text>
            </View>
          </View>
        )}

        {/* Error Display */}
        {error && (
          <View style={[styles.section, { backgroundColor: theme.white }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Notification Error</Text>
            <View style={[styles.errorContainer, { backgroundColor: `${theme.error}15` }]}>
              <Ionicons name="warning-outline" size={moderateScale(20)} color={theme.error} />
              <Text style={[styles.errorText, { color: theme.error }]}>
                {error.message}
              </Text>
            </View>
          </View>
        )}

        {/* Test Notification */}
        <View style={[styles.section, { backgroundColor: theme.white }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Test Notifications</Text>
          <Text style={[styles.sectionDescription, { color: theme.textMuted }]}>
            Send a test notification to verify everything is working
          </Text>
          
          <TouchableOpacity 
            style={[styles.testButton, { backgroundColor: theme.primary }]}
            onPress={handleTestNotification}
          >
            <Ionicons name="notifications-outline" size={moderateScale(20)} color={theme.white} />
            <Text style={[styles.testButtonText, { color: theme.white }]}>Send Test Notification</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

// Helper functions
const getSettingIcon = (key: string): keyof typeof Ionicons.glyphMap => {
  const icons: { [key: string]: keyof typeof Ionicons.glyphMap } = {
    newReleases: 'book-outline',
  }
  return icons[key] || 'notifications-outline'
}

const getSettingLabel = (key: string) => {
  const labels: { [key: string]: string } = {
    newReleases: 'Library Updates',

  }
  return labels[key] || key
}

const getSettingDescription = (key: string) => {
  const descriptions: { [key: string]: string } = {
    newReleases: 'Get notified about books in your library',
  }
  return descriptions[key] || ''
}

export default NotificationsPage

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(16),
  },
  backButton: {
    padding: moderateScale(8),
    borderRadius: moderateScale(20),
  },
  headerTitle: {
    fontSize: moderateScale(20),
    fontWeight: '600',
  },
  placeholderView: {
    width: moderateScale(40),
  },
  section: {
    marginHorizontal: horizontalScale(20),
    marginVertical: verticalScale(12),
    borderRadius: moderateScale(16),
    padding: moderateScale(20),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    marginBottom: moderateScale(8),
  },
  sectionDescription: {
    fontSize: moderateScale(14),
    marginBottom: moderateScale(16),
    lineHeight: moderateScale(20),
  },
  tokenContainer: {
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    marginTop: moderateScale(12),
  },
  tokenLabel: {
    fontSize: moderateScale(12),
    fontWeight: '500',
    marginBottom: moderateScale(8),
  },
  tokenText: {
    fontSize: moderateScale(12),
    fontFamily: 'monospace',
    marginBottom: moderateScale(12),
    lineHeight: moderateScale(16),
  },
  tokenActions: {
    flexDirection: 'row',
    gap: moderateScale(12),
  },
  tokenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: moderateScale(8),
    paddingHorizontal: moderateScale(12),
    borderRadius: moderateScale(8),
    gap: moderateScale(6),
  },
  tokenButtonText: {
    fontSize: moderateScale(12),
    fontWeight: '500',
  },
  noTokenContainer: {
    borderRadius: moderateScale(12),
    padding: moderateScale(24),
    alignItems: 'center',
    marginTop: moderateScale(12),
  },
  noTokenText: {
    fontSize: moderateScale(14),
    marginTop: moderateScale(12),
  },
  deviceInfo: {
    marginTop: moderateScale(12),
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: moderateScale(12),
    borderBottomWidth: 1,
  },
  infoLabel: {
    fontSize: moderateScale(14),
    fontWeight: '500',
  },
  infoValue: {
    fontSize: moderateScale(14),
    flex: 1,
    textAlign: 'right',
  },
  settingsList: {
    marginTop: moderateScale(12),
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: moderateScale(16),
    borderBottomWidth: 1,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: moderateScale(12),
    flex: 1,
  },
  settingLabel: {
    fontSize: moderateScale(16),
    fontWeight: '500',
    marginBottom: moderateScale(4),
  },
  settingDescription: {
    fontSize: moderateScale(14),
    lineHeight: moderateScale(18),
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: moderateScale(16),
    borderRadius: moderateScale(12),
    marginTop: moderateScale(12),
    gap: moderateScale(8),
  },
  testButtonText: {
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
  notificationContainer: {
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    marginTop: moderateScale(12),
  },
  notificationTitle: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    marginBottom: moderateScale(8),
  },
  notificationBody: {
    fontSize: moderateScale(14),
    marginBottom: moderateScale(8),
    lineHeight: moderateScale(20),
  },
  notificationTime: {
    fontSize: moderateScale(12),
    fontStyle: 'italic',
  },
  errorContainer: {
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    marginTop: moderateScale(12),
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(8),
  },
  errorText: {
    fontSize: moderateScale(14),
    flex: 1,
  },
})