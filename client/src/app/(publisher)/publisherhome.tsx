import { defaultStyles } from '@/styles'
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons'
import { router } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import React, { useEffect, useRef, useState } from 'react'
import { Alert, Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const PublisherHome = () => {
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

  return (
    <SafeAreaView style={[defaultStyles.container, styles.container]}>
    <View style={styles.header}>
      <View>
        <Text style={styles.welcomeText}>Welcome Back</Text>
        <Text style={styles.publisherName}>Publisher Dashboard</Text>
      </View>
      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <MaterialIcons name="logout" size={24} color="white" />
      </TouchableOpacity>
    </View>

    <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
      <Animated.View style={[styles.mainContent, { opacity: fadeAnim }]}>
        <View style={styles.statsGrid}>
          <View style={[styles.statBox, { backgroundColor: '#4A4DFF' }]}>
            <FontAwesome5 name="book" size={24} color="white" />
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Published Books</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: '#4A4DFF' }]}>
            <FontAwesome5 name="headphones" size={24} color="white" />
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Total Listens</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: '#4A4DFF' }]}>
            <FontAwesome5 name="dollar-sign" size={24} color="white" />
            <Text style={styles.statNumber}>$0</Text>
            <Text style={styles.statLabel}>Revenue</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: '#4A4DFF' }]}>
            <FontAwesome5 name="users" size={24} color="white" />
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity onPress={createCheckbox} style={[styles.buttonContainer, { backgroundColor: '#6366F1' }]}>
            <MaterialIcons name="publish" size={24} color="white" />
            <Text style={styles.buttonText}>Publish New Book</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push(`/(publisher)/publisherDetails/${token}`)}
            style={[styles.buttonContainer, { backgroundColor: '#6366F1' }]}
          >
            <MaterialIcons name="library-books" size={24} color="white" />
            <Text style={styles.buttonText}>View My Books</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.insightsContainer}>
          <Text style={[styles.sectionTitle, { color: '#fff' }]}>Quick Insights</Text>
          <View style={styles.insightCards}>
            <View style={[styles.insightCard, { backgroundColor: '#1A1A1A' }]}>
              <View style={styles.insightHeader}>
                <MaterialIcons name="trending-up" size={20} color="#6366F1" />
                <Text style={[styles.insightTitle, { color: '#fff' }]}>Today's Performance</Text>
              </View>
              <View style={styles.insightContent}>
                <Text style={[styles.insightStat, { color: '#A5A6F6' }]}>↑ 0 New Downloads</Text>
                <Text style={[styles.insightStat, { color: '#A5A6F6' }]}>★ 0 New Reviews</Text>
                <Text style={[styles.insightStat, { color: '#A5A6F6' }]}>$ 0 Revenue</Text>
              </View>
            </View>

            <View style={[styles.insightCard, { backgroundColor: '#1A1A1A' }]}>
              <View style={styles.insightHeader}>
                <MaterialIcons name="timeline" size={20} color="#6366F1" />
                <Text style={[styles.insightTitle, { color: '#fff' }]}>Monthly Overview</Text>
              </View>
              <View style={styles.insightContent}>
                <Text style={[styles.insightStat, { color: '#A5A6F6' }]}>📚 0 Books Published</Text>
                <Text style={[styles.insightStat, { color: '#A5A6F6' }]}>👥 0 New Listeners</Text>
                <Text style={[styles.insightStat, { color: '#A5A6F6' }]}>⭐ 0 Avg Rating</Text>
              </View>
            </View>
          </View>
        </View>
      </Animated.View>
    </ScrollView>
  </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 20,
  },
  welcomeText: {
    fontSize: 16,
    color: '#fff',
  },
  publisherName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  logoutButton: {
    padding: 8,
    backgroundColor: '#4A4DFF',
    borderRadius: 12,
  },
  content: {
    flex: 1,
  },
  mainContent: {
    padding: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
    marginTop: 20,
  },
  statBox: {
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    width: '47%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },

    shadowRadius: 8,
    elevation: 5,
  },
  statNumber: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    color: 'white',
    marginTop: 5,
    opacity: 0.9,
  },
  actionButtons: {
    marginTop: 25,
    gap: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },

    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  insightsContainer: {
    marginTop: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  insightCards: {
    gap: 15,
  },
  insightCard: {
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },

    shadowRadius: 8,
    elevation: 5,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  insightContent: {
    gap: 8,
  },
  insightStat: {
    fontSize: 15,
  },
})

export default PublisherHome