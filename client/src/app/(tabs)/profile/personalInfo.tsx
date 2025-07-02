import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity, TextInput, Alert, Modal } from 'react-native'
import React, { useEffect, useState } from 'react'
import { defaultStyles } from '@/styles'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { ipURL } from '@/utils/backendURL';
import { FONT, FONTSIZE } from '@/constants/tokens';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/providers/ThemeProvider';
import { axiosWithAuth } from '@/utils/customAxios';

const PersonalInfo = () => {
  const { theme } = useTheme();
  const [userData, setUserData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editField, setEditField] = useState('');
  const [editValue, setEditValue] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const getId = async () => {
      try {
        const id = JSON.parse(await SecureStore.getItemAsync('userDetails'));
        if(id.role === "GUEST") {
          setUserData({
            name: "Guest User",
            email: "N/A",
          });
        } else {
          const getUserDetails = await axios.get(`${ipURL}/api/auth/get-user/${id['userId']}`);
          setUserData(getUserDetails?.data);
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      } finally {
        setIsLoading(false);
      }
    }
    getId();
  }, [])

  console.log(userData,"userdata in guest");
  
  const handleEditField = (field, currentValue) => {
    setEditField(field);
    setEditValue(currentValue);
    setEditModalVisible(true);
  };

  const handleUpdateProfile = async () => {
    if (!editValue.trim()) {
      Alert.alert('Error', 'Field cannot be empty');
      return;
    }

    setIsUpdating(true);
    try {
      const updateData = {};
      updateData[editField] = editValue.trim();

      const response = await axiosWithAuth.put(`${ipURL}/api/auth/update-profile`, updateData);

      console.log(response.data,"response in personal info");
      
      
      if (response.data.emailChanged) {
        Alert.alert(
          'Email Updated', 
          'Your email has been updated. Please check your new email for verification.',
          [{ text: 'OK', onPress: () => setEditModalVisible(false) }]
        );
        await SecureStore.setItemAsync("authToken",JSON.stringify({token:response.data.token}));
        await SecureStore.setItemAsync("userDetails",JSON.stringify({role:response.data.user.role,userId:response.data.user.id,email:response.data.user.email,name:response.data.user.name}));
      } else {
        Alert.alert('Success', 'Profile updated successfully');
        setEditModalVisible(false);
      }

      // Refresh user data
      const id = JSON.parse(await SecureStore.getItemAsync('userDetails'));
      if (id?.role !== "GUEST") {
        const getUserDetails = await axios.get(`${ipURL}/api/auth/get-user/${id?.userId}`);
        setUserData(getUserDetails?.data);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const renderInfoField = (label, value, icon, field) => (
    <View style={styles.infoField}>
      <View style={styles.labelContainer}>
        <Ionicons name={icon} size={20} color={theme.primary} style={styles.fieldIcon} />
        <Text style={[styles.label, { color: theme.textMuted }]}>{label}</Text>
      </View>
      <View style={[styles.valueContainer, { backgroundColor: 'rgba(255, 255, 255, 0.03)' }]}>
        <Text style={[styles.value, { color: theme.text }]}>{value}</Text>
        {(userData as any)?.role !== "GUEST" && (
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => handleEditField(field, value)}
          >
            <Ionicons name="pencil" size={16} color={theme.primary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[defaultStyles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Personal Information</Text>
        <Text style={[styles.headerSubtitle, { color: theme.textMuted }]}>Manage your personal details</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : userData["name"] ? (
        <View style={styles.contentContainer}>
          <View style={[styles.infoCard, { backgroundColor: 'rgba(255, 255, 255, 0.05)' }]}>
            {renderInfoField('Name', userData['name'], 'person-outline', 'name')}
            {renderInfoField('Email', userData['email'], 'mail-outline', 'email')}
          </View>

          <View style={[styles.securityNote, { backgroundColor: `${theme.primary}20` }]}>
            <Ionicons name="shield-checkmark-outline" size={20} color={theme.primary} />
            <Text style={[styles.securityText, { color: theme.textMuted }]}>
              Your personal information is securely stored and protected
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={theme.primary} />
          <Text style={[styles.errorText, { color: theme.textMuted }]}>Unable to load user information</Text>
        </View>
      )}

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Edit {editField === 'name' ? 'Name' : 'Email'}
            </Text>
            
            <TextInput
              style={[styles.textInput, { 
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: theme.text,
                borderColor: theme.textMuted
              }]}
              value={editValue}
              onChangeText={setEditValue}
              placeholder={`Enter your ${editField}`}
              placeholderTextColor={theme.textMuted}
              autoCapitalize={editField === 'name' ? 'words' : 'none'}
              keyboardType={editField === 'email' ? 'email-address' : 'default'}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditModalVisible(false)}
                disabled={isUpdating}
              >
                <Text style={[styles.modalButtonText, { color: theme.textMuted }]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton, { backgroundColor: theme.primary }]}
                onPress={handleUpdateProfile}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <ActivityIndicator size="small" color={theme.white} />
                ) : (
                  <Text style={[styles.modalButtonText, { color: theme.white }]}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

export default PersonalInfo

const styles = StyleSheet.create({
  header: {
    padding: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: FONT.notoBold,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: FONT.notoRegular,
  },
  contentContainer: {
    padding: 20,
  },
  infoCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  infoField: {
    marginBottom: 24,
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
    fontFamily: FONT.notoMedium,
  },
  valueContainer: {
    borderRadius: 12,
    padding: 16,
    marginLeft: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  value: {
    fontSize: 16,
    fontFamily: FONT.notoRegular,
    flex: 1,
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
  },
  securityText: {
    marginLeft: 12,
    fontSize: 14,
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
    fontFamily: FONT.notoMedium,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: FONT.notoBold,
    marginBottom: 20,
    textAlign: 'center',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: FONT.notoRegular,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  saveButton: {
    // backgroundColor will be set dynamically
  },
  modalButtonText: {
    fontSize: 16,
    fontFamily: FONT.notoMedium,
  },
});