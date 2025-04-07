import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';
import React from 'react';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

const GuestLogin = () => {
    const handleGuestLogin = async() => {

        await SecureStore.setItemAsync("authToken",JSON.stringify({token:"gues_login"}));
        await SecureStore.setItemAsync("userDetails",JSON.stringify({role:"GUEST",userId:"null",email:"null"}));

        router.replace('/(onboarding)/listeneronboarding');

    }
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Continue as Guest?</Text>
        
        <Text style={styles.warningText}>
          If you continue as a guest, access to the following features will be limited:
        </Text>
        
        <View style={styles.featureList}>
          <Text style={styles.featureItem}>• Saving preferences</Text>
          <Text style={styles.featureItem}>• Syncing across devices</Text>
          <Text style={styles.featureItem}>• Access to premium content</Text>
          <Text style={styles.featureItem}>• Personalized recommendations</Text>
        </View>
        
        <Text style={styles.noteText}>
          You can always create an account later to unlock all features.
        </Text>
        
        <TouchableOpacity 
          style={styles.continueButton}
          onPress={handleGuestLogin}
        >
          <Text style={styles.buttonText}>Continue as Guest</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default GuestLogin;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  contentContainer: {
    width: '100%',
    maxWidth: 400,
    padding: 24,
    borderRadius: 12,
    backgroundColor: '#111',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  warningText: {
    fontSize: 16,
    color: '#ddd',
    marginBottom: 16,
    textAlign: 'center',
  },
  featureList: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  featureItem: {
    fontSize: 14,
    color: '#bbb',
    marginBottom: 8,
    lineHeight: 20,
  },
  noteText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 32,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  continueButton: {
    backgroundColor: '#333',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});