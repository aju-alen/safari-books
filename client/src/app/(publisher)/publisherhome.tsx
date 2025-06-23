import { defaultStyles } from '@/styles'
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons'
import { router } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import React, { useEffect, useRef, useState } from 'react'
import { Alert, Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '@/providers/ThemeProvider'

const PublisherHome = () => {
  const {theme} = useTheme()

  const [token, setToken] = useState(null)
  const fadeAnim = useRef(new Animated.Value(0)).current
  const createCheckbox = () =>
    Alert.alert('Publisher Type', 'Choose your publisher category', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Publishing Company',
        onPress: () => router.push(`/(publisher)/publishercompanyForm/${token}`),
      },
      {
        text: 'Independent Author',
        onPress: () => router.push(`/(publisher)/publisherauthorForm/${token}`),
      },
    ])

  const handleLogout = async () => {
    try {
      await SecureStore.deleteItemAsync('userDetails')
      await SecureStore.deleteItemAsync('authToken')
      
      router.replace('/(authenticate)/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  useEffect(() => {
    const getAsyncData = async () => {
      const tokenStore = await SecureStore.getItemAsync('userDetails')
      setToken(JSON.parse(tokenStore).userId)
    }
    getAsyncData()

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start()
  }, [])

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 24,
      borderBottomWidth: 1,
      borderBottomColor: theme.gray2,
    },
    welcomeText: {
      fontSize: 16,
      color: theme.textMuted,
      marginBottom: 4,
      fontWeight: '500',
    },
    publisherName: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.text,
    },
    logoutButton: {
      padding: 10,
      backgroundColor: theme.primary,
      borderRadius: 12,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 4 },
      
      shadowRadius: 8,
      elevation: 5,
    },
    content: {
      flex: 1,
    },
    mainContent: {
      padding: 20,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: 16,
      marginTop: 10,
    },
    statBox: {
      padding: 16,
      borderRadius: 16,
      alignItems: 'center',
      width: '47%',
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 4 },
      
      shadowRadius: 8,
      elevation: 5,
      marginBottom: 4,
    },
    statBoxPrimary: {
      backgroundColor: theme.primary,
      borderLeftWidth: 4,
      borderLeftColor: theme.white,
    },
    statBoxSecondary: {
      backgroundColor: theme.secondary,
      borderLeftWidth: 4,
      borderLeftColor: theme.white,
    },
    statBoxAccent: {
      backgroundColor: theme.tertiary,
      borderLeftWidth: 4,
      borderLeftColor: theme.white,
    },
    statBoxDark: {
      backgroundColor: theme.secondary2,
      borderLeftWidth: 4,
      borderLeftColor: theme.white,
    },
    statIconContainer: {
      backgroundColor: 'rgba(255,255,255,0.2)',
      padding: 10,
      borderRadius: 12,
      marginBottom: 8,
    },
    statNumber: {
      color: theme.white,
      fontSize: 26,
      fontWeight: 'bold',
      marginTop: 4,
    },
    statLabel: {
      color: theme.white,
      marginTop: 4,
      fontSize: 13,
      fontWeight: '500',
    },
    actionButtons: {
      marginTop: 28,
      gap: 16,
    },
    buttonContainer: {
      flexDirection: 'row',
      height: 56,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 16,
      gap: 12,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 4 },
      
      shadowRadius: 8,
      elevation: 5,
    },
    primaryButton: {
      backgroundColor: theme.primary,
      borderLeftWidth: 4,
      borderLeftColor: theme.white,
    },
    secondaryButton: {
      backgroundColor: theme.secondary,
      borderLeftWidth: 4,
      borderLeftColor: theme.white,
    },
    buttonIconContainer: {
      backgroundColor: 'rgba(255,255,255,0.2)',
      padding: 8,
      borderRadius: 10,
    },
    buttonText: {
      color: theme.white,
      fontSize: 17,
      fontWeight: '600',
    },
    insightsContainer: {
      marginTop: 28,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 16,
      color: theme.text,
      paddingLeft: 4,
    },
    insightCards: {
      gap: 16,
    },
    insightCard: {
      borderRadius: 16,
      padding: 18,
      backgroundColor: theme.white,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 4 },
      
      shadowRadius: 8,
      elevation: 5,
      borderLeftWidth: 4,
      borderLeftColor: theme.primary,
    },
    insightHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 14,
    },
    insightIconContainer: {
      backgroundColor: theme.primary,
      padding: 8,
      borderRadius: 10,
    },
    insightTitle: {
      fontSize: 17,
      fontWeight: '600',
      color: theme.text,
    },
    insightContent: {
      gap: 10,
    },
    insightStat: {
      fontSize: 15,
      color: theme.textMuted,
      fontWeight: '500',
    },
  })

  return (
    <SafeAreaView style={[defaultStyles.container, styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome Back</Text>
          <Text style={styles.publisherName}>Publisher Dashboard</Text>
        </View>
        <TouchableOpacity onPress={() => router.push(`/(publisher)/settings`)} style={styles.logoutButton}>
          <MaterialIcons name="settings" size={22} color={theme.white} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        <Animated.View style={[styles.mainContent, { opacity: fadeAnim }]}>
          <View style={styles.statsGrid}>
            <View style={[styles.statBox, styles.statBoxPrimary]}>
              <View style={styles.statIconContainer}>
                <FontAwesome5 name="book" size={20} color={theme.white} />
              </View>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Published Books</Text>
            </View>
            <View style={[styles.statBox, styles.statBoxSecondary]}>
              <View style={styles.statIconContainer}>
                <FontAwesome5 name="headphones" size={20} color={theme.white} />
              </View>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Total Listens</Text>
            </View>
            <View style={[styles.statBox, styles.statBoxAccent]}>
              <View style={styles.statIconContainer}>
                <FontAwesome5 name="dollar-sign" size={20} color={theme.white} />
              </View>
              <Text style={styles.statNumber}>$0</Text>
              <Text style={styles.statLabel}>Revenue</Text>
            </View>
            <View style={[styles.statBox, styles.statBoxDark]}>
              <View style={styles.statIconContainer}>
                <FontAwesome5 name="users" size={20} color={theme.white} />
              </View>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity onPress={createCheckbox} style={[styles.buttonContainer, styles.primaryButton]}>
              <View style={styles.buttonIconContainer}>
                <MaterialIcons name="publish" size={22} color={theme.white} />
              </View>
              <Text style={styles.buttonText}>Publish New Book</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push(`/(publisher)/publisherDetails/${token}`)}
              style={[styles.buttonContainer, styles.secondaryButton]}
            >
              <View style={styles.buttonIconContainer}>
                <MaterialIcons name="library-books" size={22} color={theme.white} />
              </View>
              <Text style={styles.buttonText}>View My Books</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.insightsContainer}>
            <Text style={styles.sectionTitle}>Quick Insights</Text>
            <View style={styles.insightCards}>
              <View style={styles.insightCard}>
                <View style={styles.insightHeader}>
                  <View style={styles.insightIconContainer}>
                    <MaterialIcons name="trending-up" size={18} color={theme.white} />
                  </View>
                  <Text style={styles.insightTitle}>Today's Performance</Text>
                </View>
                <View style={styles.insightContent}>
                  <Text style={styles.insightStat}>↑ 0 New Downloads</Text>
                  <Text style={styles.insightStat}>★ 0 New Reviews</Text>
                  <Text style={styles.insightStat}>$ 0 Revenue</Text>
                </View>
              </View>

              <View style={styles.insightCard}>
                <View style={styles.insightHeader}>
                  <View style={styles.insightIconContainer}>
                    <MaterialIcons name="timeline" size={18} color={theme.white} />
                  </View>
                  <Text style={styles.insightTitle}>Monthly Overview</Text>
                </View>
                <View style={styles.insightContent}>
                  <Text style={styles.insightStat}>📚 0 Books Published</Text>
                  <Text style={styles.insightStat}>👥 0 New Listeners</Text>
                  <Text style={styles.insightStat}>⭐ 0 Avg Rating</Text>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default PublisherHome