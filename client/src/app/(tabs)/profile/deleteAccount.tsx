import { StyleSheet, Text, TouchableOpacity, View, TextInput, Alert, ActivityIndicator, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { defaultStyles } from '@/styles'
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/tokens';
import { ipURL } from '@/utils/backendURL';

const DeleteAccountPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleDeleteAccount = async () => {
    if (!password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data including books, companies, and authors.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => performDeleteAccount(),
        },
      ]
    );
  };

  const performDeleteAccount = async () => {
    setIsLoading(true);
    try {
      const authToken = await SecureStore.getItemAsync('authToken');
      
      if (!authToken) {
        Alert.alert('Error', 'Authentication required');
        return;
      }
      
      const response = await fetch(`${ipURL}/api/auth/delete-account`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Clear stored data
        await SecureStore.deleteItemAsync('userDetails');
        await SecureStore.deleteItemAsync('authToken');
        
        Alert.alert(
          'Account Deleted',
          'Your account has been successfully deleted. You will be redirected to the login page.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(authenticate)/login'),
            },
          ]
        );
      } else {
        Alert.alert('Error', data.message || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      Alert.alert('Error', 'An error occurred while deleting your account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={[defaultStyles.container, styles.container]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delete Account</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.warningContainer}>
          <Ionicons name="warning" size={48} color="#FF6B6B" />
          <Text style={styles.warningTitle}>Warning</Text>
          <Text style={styles.warningText}>
            This action will permanently delete your account and all associated data including:
          </Text>
          <View style={styles.warningList}>
            <Text style={styles.warningItem}>• Your profile information</Text>
            <Text style={styles.warningItem}>• All your books and content</Text>
            <Text style={styles.warningItem}>• Company and author profiles</Text>
            <Text style={styles.warningItem}>• All associated files and data</Text>
          </View>
          <Text style={styles.warningText}>
            This action cannot be undone.
          </Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Confirm Your Password</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.passwordInput}>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your password"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color="rgba(255, 255, 255, 0.5)"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Confirm Password</Text>
            <View style={styles.passwordInput}>
              <TextInput
                style={styles.textInput}
                placeholder="Confirm your password"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-off" : "eye"}
                  size={20}
                  color="rgba(255, 255, 255, 0.5)"
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={goBack}
          disabled={isLoading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.deleteButton, isLoading && styles.deleteButtonDisabled]}
          onPress={handleDeleteAccount}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Ionicons name="trash" size={20} color="#FFFFFF" style={styles.deleteIcon} />
              <Text style={styles.deleteButtonText}>Delete Account</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
      </ScrollView>

     
    </SafeAreaView>
  )
}

export default DeleteAccountPage

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.background,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
  },
  warningContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.2)',
  },
  warningTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FF6B6B',
    marginTop: 16,
    marginBottom: 12,
  },
  warningText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  warningList: {
    alignSelf: 'stretch',
    marginBottom: 16,
  },
  warningItem: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
    paddingLeft: 8,
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  passwordInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  textInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    paddingVertical: 16,
  },
  eyeButton: {
    padding: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 32,
    backgroundColor: COLORS.background,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#FF6B6B',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  deleteButtonDisabled: {
    backgroundColor: 'rgba(255, 107, 107, 0.5)',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteIcon: {
    marginRight: 8,
  },
}); 