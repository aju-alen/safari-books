import { ipURL } from '@/utils/backendURL'
import { horizontalScale, moderateScale, verticalScale } from '@/utils/responsiveSize'
import DateTimePicker from '@react-native-community/datetimepicker'
import { Picker } from '@react-native-picker/picker'
import axios from 'axios'
import Checkbox from 'expo-checkbox'
import * as DocumentPicker from 'expo-document-picker'
import { router, useLocalSearchParams } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import React, { useEffect, useState } from 'react'
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, Alert, Dimensions } from 'react-native'
import { Audio } from 'react-native-compressor'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import * as ImageManipulator from 'expo-image-manipulator'
import {BookCategoryLabels} from '../../utils/categoriesdata'
import { useTheme } from '@/providers/ThemeProvider'
import { axiosWithAuth } from '@/utils/customAxios'
import { Ionicons, Feather } from '@expo/vector-icons'

interface AudioSample {
  name: string;
  size: number;
  uri: string;
  type: string;
}

const { width } = Dimensions.get('window');

const publisherCommonForm = () => {
    const {publisherCommonForm} = useLocalSearchParams()
    console.log(publisherCommonForm, 'params');
    const [token, setToken] = useState(null);
    const {theme} = useTheme()
    const [title, setTitle] = useState('')
    const [language, setLanguage] = useState('')
    const [categories, setCategories] = useState({});
    const [date, setDate] = useState(new Date(1598051730000));
    const [ISBNDOIISRC, setISBNDOIISRC] = useState('')
    const [synopsis, setSynopsis] = useState('')
    const [narrator, setNarrator] = useState('')
    const [narrationStyleSlow, setNarrationStyleSlow] = useState(false)
    const [narrationStyleFast, setNarrationStyleFast] = useState(false)
    const [narrationStyleIntimate, setNarrationStyleIntimate] = useState(false)
    const [narrationStyleCasual, setNarrationStyleCasual] = useState(false)
    const [narrationStyleStatic, setNarrationStyleStatic] = useState(false)
    const [narrationStyleOratoric, setNarrationStyleOratoric] = useState(false)
    const [image, setImage] = useState(null);
    const [imageURL, setImageURL] = useState('');
    const [audioSample, setAudioSample] = useState<AudioSample | null>(null)
    const [audioCompressURL, setAudioCompressURL] = useState('')
    const [amount, setAmount] = useState('');

    const [doc1, setDoc1] = useState(null);
    const [rightsHolder, setRightsHolder] = useState(false)

    const [isChecked, setChecked] = useState(false);
    const [errors, setErrors] = useState<{[key: string]: string}>({});

    const [mode, setMode] = useState('date');
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);

    const onChange = (event, selectedDate) => {
        const currentDate = selectedDate;
        setShow(false);
        setDate(currentDate);
    };

    const showMode = (currentMode) => {
        setShow(true);
        setMode(currentMode);
    };

    const showDatepicker = () => {
        showMode('date');
    };

    useEffect(() => {
        const getAsyncData = async () => {
          const tokenStore = await SecureStore.getItemAsync('userDetails');
          setToken(JSON.parse(tokenStore).userId);
          
    
        }
        getAsyncData();
      }, [])

    const pickAudio = async () => {
        let result = await DocumentPicker.getDocumentAsync({
            type: "audio/*",
            copyToCacheDirectory: true
        });
    
            let { name, size, uri } = result["assets"][0];
            let nameParts = name.split('.');
            let fileType = nameParts[nameParts.length - 1];
            var fileToUpload = {
                name: name,
                size: size,
                uri: uri,
                type: `audio/${fileType}`
            };
            setAudioSample(fileToUpload);
            
            const resultCompress = await Audio.compress(
                uri, // recommended wav file but can be use mp3 file. . Edit: convert to 192
                {
                    bitrate: 32000,
                    samplerate: 22050,
                    channels: 1,
                }
            );
            setAudioCompressURL(resultCompress)
              
    };
    

    const postAudio = async () => {
        const url = `${ipURL}/api/s3/upload-to-aws-audio`;
        const formData = new FormData();
       
        
        
        formData.append('audio1', {
            uri: audioCompressURL,
            name: audioSample.name,
            type: audioSample.type
        } as any);
        console.log(publisherCommonForm,'companyId');
        
        formData.append('id', publisherCommonForm as string)

        formData.append('userId', token)

        
        const options = {
            method: 'POST',
            body: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        };
        
        try {
            console.log(url, 'url', options, 'options');
            
            const response = await fetch(url, options);
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const responseData = await response.json();
            console.log('Success:', responseData);
            return responseData
            
        } catch (error) {
            console.error('Error:', error);
            return error
        }
    };

    const pickDocument = async () => {
        let result = await DocumentPicker.getDocumentAsync({
            type: "application/pdf",
            copyToCacheDirectory: true
        });

        
            let { name, size, uri } = result["assets"][0];
            let nameParts = name.split('.');
            let fileType = nameParts[nameParts.length - 1];
            var fileToUpload = {
                name: name,
                size: size,
                uri: uri,
                type: "application/" + fileType
            };
            setDoc1(fileToUpload);
    };

    const postDocuments = async () => {
        
        const url = `${ipURL}/api/s3/upload-to-aws`;
        const formData = new FormData();
        
        if (doc1) formData.append('document1', { uri: doc1.uri, name: doc1.name, type: doc1.type } as any);       

        formData.append('id',publisherCommonForm as string);
console.log(publisherCommonForm,'companyId in document submit');

        formData.append('userId',token);
    
        const options = {
            method: 'POST',
            body: formData,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'multipart/form-data',
            },
        };
    
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const responseData = await response.json();
            console.log('Success:', responseData);
            return responseData
            
        } catch (error) {
            console.error('Error:', error);
            return error
        }
    };

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
        if (permissionResult.granted === false) {
          Alert.alert('Permission to access the gallery is required!');
          return;
        }
    
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 1,
        });
    
        if (!result.canceled) {
          const manipResult = await ImageManipulator.manipulateAsync(
            result.assets[0].uri,
            [{ resize: { width: 800 } }], // Resize the image
            { compress: 0.0, format: ImageManipulator.SaveFormat.WEBP } // Compress the image
          );
          setImage(manipResult.uri);
        }
      };
    
      const uploadImageToBe = async () => {
        if (!image) return;
    
        const uriParts = image.split('.');
        const fileType = uriParts[uriParts.length - 1];
    
        const formData = new FormData();
        formData.append('image', {
          uri: image,
          name: `photo.${fileType}`,
          type: `image/${fileType}`,
        } as any);
        formData.append('id', publisherCommonForm as string);
        formData.append('userId', token);
    
        try {
          console.log(formData, 'form data');
          
          const response = await axios.post(`${ipURL}/api/s3/upload-to-aws-image`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          console.log('Image uploaded successfully', response.data.data.Location);
    
          // Update the form data with the image URL
          const imageURL = response.data.data;
          setImageURL(imageURL)
          
          // You can either update the state with the image URL or proceed with form submission
          Alert.alert('Image uploaded successfully');
          
          // If you want to include the image URL in the form submission, you can store it in state
          // setImageURL(imageURL);
          
        } catch (error) {
          console.error('Image upload failed', error);
          Alert.alert('Image upload failed', error.message);
        }
      };

    const validateForm = () => {
        const newErrors: {[key: string]: string} = {}
        
        if (!title.trim()) {
            newErrors.title = 'Title is required'
        }
        
        if (!language.trim()) {
            newErrors.language = 'Language is required'
        }
        
        if (!categories || categories === 'none') {
            newErrors.categories = 'Please select a category'
        }
        
        if (!ISBNDOIISRC.trim()) {
            newErrors.ISBNDOIISRC = 'ISBN/DOI/ISRC is required'
        }
        
        if (!synopsis.trim()) {
            newErrors.synopsis = 'Synopsis is required'
        }
        
        if (!amount.trim()) {
            newErrors.amount = 'Price is required'
        }
        
        if (!audioSample) {
            newErrors.audioSample = 'Audio sample is required'
        }
        
        if (!doc1) {
            newErrors.doc1 = 'PDF document is required'
        }
        
        if (!image) {
            newErrors.image = 'Cover image is required'
        }
        
        if (!rightsHolder) {
            newErrors.rightsHolder = 'You must confirm you are the rights holder'
        }
        
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async () => {
        // Validate form before proceeding
        if (!validateForm()) {
            return
        }
        
        try{
            setLoading(true);
            const audioData = await postAudio()
            const docData = await postDocuments()
            console.log(audioData, 'audioData', docData, 'docData');
    
            const data ={
                id:publisherCommonForm,
                title: title,
                language: language,
                categories: categories,
                date: date,
                ISBNDOIISRC: ISBNDOIISRC,
                synopsis: synopsis,
                narrator: narrator,
                narrationStyleSlow: narrationStyleSlow,
                narrationStyleFast: narrationStyleFast,
                narrationStyleIntimate: narrationStyleIntimate,
                narrationStyleCasual: narrationStyleCasual,
                narrationStyleStatic: narrationStyleStatic,
                narrationStyleOratoric: narrationStyleOratoric,
                audioSampleURL: audioData.data,
                pdfURL: docData.data[0],
                rightsHolder: rightsHolder,
                coverImage: imageURL,
                amount: amount,
            }
    
            console.log(data, 'data');
            const response = await axiosWithAuth.put(`${ipURL}/api/publisher/update-company`, data)
            console.log(response, 'responsein common form');
            setLoading(false);
            router.replace('/(tabs)/home')

        }
       catch (error) {
        setLoading(false);
        console.error('Error:', error);
        
       }

    }

    const styles = StyleSheet.create({
      container: {
          flex: 1,
          backgroundColor: theme.background,
      },
      content: {
          flex: 1,
          padding: moderateScale(20),
      },
      headerContainer: {
          marginBottom: verticalScale(32),
          alignItems: 'center',
          paddingTop: verticalScale(20),
      },
      headerText: {
          fontSize: moderateScale(24),
          fontWeight: '700',
          color: theme.text,
          marginBottom: verticalScale(8),
          textAlign: 'center',
      },
      subHeaderText: {
          fontSize: moderateScale(14),
          color: theme.textMuted,
          textAlign: 'center',
          lineHeight: moderateScale(20),
      },
      formContainer: {
          gap: verticalScale(24),
      },
      inputContainer: {
          marginBottom: verticalScale(16),
      },
      label: {
          fontSize: moderateScale(14),
          fontWeight: '600',
          color: theme.text,
          marginBottom: verticalScale(8),
      },
      input: {
          backgroundColor: theme.white,
          borderRadius: moderateScale(12),
          padding: moderateScale(16),
          color: theme.text,
          borderWidth: 1.5,
          borderColor: theme.gray2,
          fontSize: moderateScale(16),
          shadowColor: theme.text,
          shadowOffset: {
              width: 0,
              height: 1,
          },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
      },
      inputError: {
          borderColor: '#FF6B6B',
          borderWidth: 2,
      },
      errorText: {
          color: '#FF6B6B',
          fontSize: moderateScale(12),
          marginTop: verticalScale(4),
      },
      textArea: {
          backgroundColor: theme.white,
          borderRadius: moderateScale(12),
          padding: moderateScale(16),
          color: theme.text,
          height: verticalScale(120),
          textAlignVertical: 'top',
          borderWidth: 1.5,
          borderColor: theme.gray2,
          fontSize: moderateScale(16),
          shadowColor: theme.text,
          shadowOffset: {
              width: 0,
              height: 1,
          },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
      },
      pickerContainer: {
          backgroundColor: theme.white,
          borderRadius: moderateScale(12),
          borderWidth: 1.5,
          borderColor: theme.gray2,
          shadowColor: theme.text,
          shadowOffset: {
              width: 0,
              height: 1,
          },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
      },
      picker: {
          color: theme.text,
      },
      pickerItem: {
          backgroundColor: theme.white,
          color: theme.text,
      },
      narrationSection: {
          marginBottom: verticalScale(16),
      },
      narrationGrid: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          gap: verticalScale(12),
      },
      narrationCard: {
          width: (width - horizontalScale(48) - horizontalScale(12)) / 2,
          backgroundColor: theme.white,
          borderRadius: moderateScale(12),
          padding: moderateScale(16),
          alignItems: 'center',
          borderWidth: 2,
          borderColor: theme.gray2,
          shadowColor: theme.text,
          shadowOffset: {
              width: 0,
              height: 2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
      },
      narrationCardSelected: {
          borderColor: theme.primary,
          backgroundColor: `${theme.primary}10`,
      },
      narrationCardText: {
          color: theme.text,
          fontSize: moderateScale(14),
          fontWeight: '600',
          marginTop: verticalScale(8),
      },
      narrationCardTextSelected: {
          color: theme.primary,
      },
      uploadSection: {
          gap: verticalScale(16),
      },
      uploadButton: {
          backgroundColor: theme.white,
          padding: moderateScale(16),
          borderRadius: moderateScale(12),
          alignItems: 'center',
          borderWidth: 2,
          borderColor: theme.gray2,
          shadowColor: theme.text,
          shadowOffset: {
              width: 0,
              height: 2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
      },
      uploadButtonError: {
          borderColor: '#FF6B6B',
          backgroundColor: '#FF6B6B10',
      },
      uploadButtonText: {
          color: theme.text,
          fontSize: moderateScale(14),
          fontWeight: '600',
      },
      uploadButtonTextError: {
          color: '#FF6B6B',
      },
      dateButton: {
          backgroundColor: theme.white,
          padding: moderateScale(16),
          borderRadius: moderateScale(12),
          alignItems: 'center',
          borderWidth: 1.5,
          borderColor: theme.gray2,
          shadowColor: theme.text,
          shadowOffset: {
              width: 0,
              height: 1,
          },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
      },
      dateButtonText: {
          color: theme.text,
          fontSize: moderateScale(14),
          fontWeight: '600',
      },
      rightsHolder: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: horizontalScale(12),
          marginVertical: verticalScale(24),
          padding: moderateScale(16),
          backgroundColor: theme.white,
          borderRadius: moderateScale(12),
          borderWidth: 1.5,
          borderColor: theme.gray2,
          shadowColor: theme.text,
          shadowOffset: {
              width: 0,
              height: 1,
          },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
      },
      rightsHolderError: {
          borderColor: '#FF6B6B',
          backgroundColor: '#FF6B6B10',
      },
      rightsHolderText: {
          color: theme.text,
          fontSize: moderateScale(14),
          fontWeight: '500',
          flex: 1,
      },
      submitSection: {
          marginTop: verticalScale(32),
          paddingHorizontal: horizontalScale(10),
      },
      submitButton: {
          backgroundColor: theme.primary,
          padding: moderateScale(18),
          borderRadius: moderateScale(16),
          alignItems: 'center',
          shadowColor: theme.text,
          shadowOffset: {
              width: 0,
              height: 4,
          },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
      },
      submitButtonText: {
          color: theme.white,
          fontSize: moderateScale(18),
          fontWeight: '700',
      },
      uploadButtonPrimary: {
          backgroundColor: theme.primary,
          borderColor: theme.primary,
      },
      uploadButtonPrimaryText: {
          color: theme.white,
      },
      loadingContainer: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
      },
      loadingText: {
          color: theme.white,
          fontSize: moderateScale(16),
          fontWeight: '600',
          marginLeft: horizontalScale(8),
      },
    });

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.content}>
                  <View style={styles.headerContainer}>
                      <Text style={styles.headerText}>
                          Last Steps
                      </Text>
                      <Text style={styles.subHeaderText}>
                          Fill in the details to publish your audiobook
                      </Text>
                  </View>

                  <View style={styles.formContainer}>
                      <FormInput
                          label="Title"
                          placeholder="Enter Title Name"
                          value={title}
                          onChangeText={setTitle}
                          error={errors.title}
                      />

                      <View style={styles.inputContainer}>
                          <Text style={styles.label}>Category</Text>
                          <View style={[styles.pickerContainer, errors.categories && styles.inputError]}>
                              <Picker
                                  mode='dropdown'
                                  dropdownIconColor={theme.text}
                                  style={styles.picker}
                                  selectedValue={categories}
                                  onValueChange={(itemValue) => setCategories(itemValue)}>
                                  <Picker.Item style={styles.pickerItem} label="Select a category" value="none" color={theme.text} />
                                  {Object.entries(BookCategoryLabels).map(([value, label]) => (
                                      <Picker.Item 
                                        color={theme.text}
                                          key={value} 
                                          style={styles.pickerItem} 
                                          label={label} 
                                          value={value} 

                                      />
                                  ))}
                              </Picker>
                          </View>
                          {errors.categories && <Text style={styles.errorText}>{errors.categories}</Text>}
                      </View>

                      <FormInput
                          label="Language"
                          placeholder="Enter Language"
                          value={language}
                          onChangeText={setLanguage}
                          error={errors.language}
                      />

                      <View style={styles.inputContainer}>
                          <Text style={styles.label}>Release Date</Text>
                          <TouchableOpacity 
                              style={styles.dateButton}
                              onPress={showDatepicker}
                          >
                              <Text style={styles.dateButtonText}>
                                  {date.toLocaleDateString()}
                              </Text>
                          </TouchableOpacity>
                          {show && (
                              <DateTimePicker
                                  testID="dateTimePicker"
                                  value={date}
                                  is24Hour={true}
                                  onChange={onChange}
                              />
                          )}
                      </View>

                      <FormInput
                          label="ISBN/DOI/ISRC Number"
                          placeholder="Enter ISBN/DOI/ISRC No."
                          value={ISBNDOIISRC}
                          onChangeText={setISBNDOIISRC}
                          error={errors.ISBNDOIISRC}
                      />

                      <View style={styles.inputContainer}>
                          <Text style={styles.label}>Synopsis</Text>
                          <TextInput
                              placeholder="Enter Synopsis"
                              placeholderTextColor={theme.textMuted}
                              multiline={true}
                              numberOfLines={4}
                              value={synopsis}
                              onChangeText={setSynopsis}
                              style={[styles.textArea, errors.synopsis && styles.inputError]}
                          />
                          {errors.synopsis && <Text style={styles.errorText}>{errors.synopsis}</Text>}
                      </View>
                      
                      <View style={styles.inputContainer}>
                          <Text style={styles.label}>Enter Your Price</Text>
                          <TextInput
                              placeholder="Enter Your Price"
                              placeholderTextColor={theme.textMuted}
                              value={amount}
                              onChangeText={setAmount}
                              keyboardType="numeric"
                              style={[styles.input, errors.amount && styles.inputError]}
                          />
                          {errors.amount && <Text style={styles.errorText}>{errors.amount}</Text>}
                      </View>

                      <View style={styles.narrationSection}>
                          <Text style={styles.label}>Narration Style</Text>
                          <View style={styles.narrationGrid}>
                              <TouchableOpacity 
                                  style={[styles.narrationCard, narrationStyleSlow && styles.narrationCardSelected]}
                                  onPress={() => setNarrationStyleSlow(!narrationStyleSlow)}
                              >
                                  <Ionicons 
                                      name={narrationStyleSlow ? "checkmark-circle" : "ellipse-outline"} 
                                      size={moderateScale(24)} 
                                      color={narrationStyleSlow ? theme.primary : theme.gray2} 
                                  />
                                  <Text style={[styles.narrationCardText, narrationStyleSlow && styles.narrationCardTextSelected]}>
                                      Slow
                                  </Text>
                              </TouchableOpacity>

                              <TouchableOpacity 
                                  style={[styles.narrationCard, narrationStyleFast && styles.narrationCardSelected]}
                                  onPress={() => setNarrationStyleFast(!narrationStyleFast)}
                              >
                                  <Ionicons 
                                      name={narrationStyleFast ? "checkmark-circle" : "ellipse-outline"} 
                                      size={moderateScale(24)} 
                                      color={narrationStyleFast ? theme.primary : theme.gray2} 
                                  />
                                  <Text style={[styles.narrationCardText, narrationStyleFast && styles.narrationCardTextSelected]}>
                                      Fast
                                  </Text>
                              </TouchableOpacity>

                              <TouchableOpacity 
                                  style={[styles.narrationCard, narrationStyleIntimate && styles.narrationCardSelected]}
                                  onPress={() => setNarrationStyleIntimate(!narrationStyleIntimate)}
                              >
                                  <Ionicons 
                                      name={narrationStyleIntimate ? "checkmark-circle" : "ellipse-outline"} 
                                      size={moderateScale(24)} 
                                      color={narrationStyleIntimate ? theme.primary : theme.gray2} 
                                  />
                                  <Text style={[styles.narrationCardText, narrationStyleIntimate && styles.narrationCardTextSelected]}>
                                      Intimate
                                  </Text>
                              </TouchableOpacity>

                              <TouchableOpacity 
                                  style={[styles.narrationCard, narrationStyleCasual && styles.narrationCardSelected]}
                                  onPress={() => setNarrationStyleCasual(!narrationStyleCasual)}
                              >
                                  <Ionicons 
                                      name={narrationStyleCasual ? "checkmark-circle" : "ellipse-outline"} 
                                      size={moderateScale(24)} 
                                      color={narrationStyleCasual ? theme.primary : theme.gray2} 
                                  />
                                  <Text style={[styles.narrationCardText, narrationStyleCasual && styles.narrationCardTextSelected]}>
                                      Casual
                                  </Text>
                              </TouchableOpacity>

                              <TouchableOpacity 
                                  style={[styles.narrationCard, narrationStyleOratoric && styles.narrationCardSelected]}
                                  onPress={() => setNarrationStyleOratoric(!narrationStyleOratoric)}
                              >
                                  <Ionicons 
                                      name={narrationStyleOratoric ? "checkmark-circle" : "ellipse-outline"} 
                                      size={moderateScale(24)} 
                                      color={narrationStyleOratoric ? theme.primary : theme.gray2} 
                                  />
                                  <Text style={[styles.narrationCardText, narrationStyleOratoric && styles.narrationCardTextSelected]}>
                                      Oratoric
                                  </Text>
                              </TouchableOpacity>

                              <TouchableOpacity 
                                  style={[styles.narrationCard, narrationStyleStatic && styles.narrationCardSelected]}
                                  onPress={() => setNarrationStyleStatic(!narrationStyleStatic)}
                              >
                                  <Ionicons 
                                      name={narrationStyleStatic ? "checkmark-circle" : "ellipse-outline"} 
                                      size={moderateScale(24)} 
                                      color={narrationStyleStatic ? theme.primary : theme.gray2} 
                                  />
                                  <Text style={[styles.narrationCardText, narrationStyleStatic && styles.narrationCardTextSelected]}>
                                      Static
                                  </Text>
                              </TouchableOpacity>
                          </View>
                      </View>

                      <View style={styles.uploadSection}>
                          <Text style={styles.label}>Upload Files</Text>
                          <TouchableOpacity 
                              style={[styles.uploadButton, errors.audioSample && styles.uploadButtonError]} 
                              onPress={pickAudio}
                          >
                              <Feather 
                                  name={audioSample ? "check-circle" : "upload"} 
                                  size={moderateScale(18)} 
                                  color={errors.audioSample ? '#FF6B6B' : theme.text} 
                              />
                              <Text style={[styles.uploadButtonText, errors.audioSample && styles.uploadButtonTextError]}>
                                  {audioSample?.name || 'Upload Audio Sample'}
                              </Text>
                          </TouchableOpacity>
                          {errors.audioSample && <Text style={styles.errorText}>{errors.audioSample}</Text>}

                          <TouchableOpacity 
                              style={[styles.uploadButton, errors.doc1 && styles.uploadButtonError]} 
                              onPress={pickDocument}
                          >
                              <Feather 
                                  name={doc1 ? "check-circle" : "upload"} 
                                  size={moderateScale(18)} 
                                  color={errors.doc1 ? '#FF6B6B' : theme.text} 
                              />
                              <Text style={[styles.uploadButtonText, errors.doc1 && styles.uploadButtonTextError]}>
                                  {doc1?.name || 'Upload PDF Document'}
                              </Text>
                          </TouchableOpacity>
                          {errors.doc1 && <Text style={styles.errorText}>{errors.doc1}</Text>}
                          
                          <TouchableOpacity 
                              style={[styles.uploadButton, errors.image && styles.uploadButtonError]} 
                              onPress={pickImage}
                          >
                              <Feather 
                                  name={image ? "check-circle" : "upload"} 
                                  size={moderateScale(18)} 
                                  color={errors.image ? '#FF6B6B' : theme.text} 
                              />
                              <Text style={[styles.uploadButtonText, errors.image && styles.uploadButtonTextError]}>
                                  {image ? 'Image Selected' : 'Upload Cover Image'}
                              </Text>
                          </TouchableOpacity>
                          {errors.image && <Text style={styles.errorText}>{errors.image}</Text>}
                          
                          {image && (
                              <TouchableOpacity 
                                  style={[styles.uploadButton, styles.uploadButtonPrimary]} 
                                  onPress={uploadImageToBe}
                              >
                                  <Text style={[styles.uploadButtonText, styles.uploadButtonPrimaryText]}>
                                      Submit Image
                                  </Text>
                              </TouchableOpacity>
                          )}
                      </View>

                      <View style={[styles.rightsHolder, errors.rightsHolder && styles.rightsHolderError]}>
                          <Checkbox
                              value={rightsHolder}
                              onValueChange={setRightsHolder}
                              color={rightsHolder ? theme.primary : undefined}
                          />
                          <Text style={styles.rightsHolderText}>
                              I confirm that I am the rights holder
                          </Text>
                      </View>
                      {errors.rightsHolder && <Text style={styles.errorText}>{errors.rightsHolder}</Text>}

                      <View style={styles.submitSection}>
                          <TouchableOpacity 
                              style={styles.submitButton}
                              onPress={handleSubmit}
                              disabled={loading}
                          >
                              {loading ? (
                                  <View style={styles.loadingContainer}>
                                      <ActivityIndicator color={theme.white} />
                                      <Text style={styles.loadingText}>Submitting...</Text>
                                  </View>
                              ) : (
                                  <Text style={styles.submitButtonText}>
                                      Submit Publication
                                  </Text>
                              )}
                          </TouchableOpacity>
                      </View>
                  </View>
              </View>
          </ScrollView>
      </SafeAreaView>
  )
}

const FormInput = ({ label, error, ...props }) => {
  const {theme} = useTheme()
  return (
    <View style={{marginBottom: verticalScale(16)}}>
        <Text style={{fontSize: moderateScale(14), color: theme.text, marginBottom: verticalScale(8), fontWeight: '600'}}>{label}</Text>
        <TextInput
            {...props}
            placeholderTextColor={theme.textMuted}
            style={[
                {
                    backgroundColor: theme.white, 
                    borderRadius: moderateScale(12), 
                    padding: moderateScale(16), 
                    color: theme.text, 
                    borderWidth: 1.5, 
                    borderColor: theme.gray2, 
                    fontSize: moderateScale(16),
                    shadowColor: theme.text,
                    shadowOffset: {
                        width: 0,
                        height: 1,
                    },
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                    elevation: 2,
                },
                error && {
                    borderColor: '#FF6B6B',
                    borderWidth: 2,
                }
            ]}
        />
        {error && <Text style={{color: '#FF6B6B', fontSize: moderateScale(12), marginTop: verticalScale(4)}}>{error}</Text>}
    </View>
  )
}

const CheckboxItem = ({ label, value, onValueChange }) => {
  const {theme} = useTheme()
  return (
    <View style={{flexDirection: 'row', alignItems: 'center', gap: horizontalScale(8)}}>
        <Checkbox
            value={value}
            onValueChange={onValueChange}
            color={value ? theme.primary : undefined}
        />
        <Text style={{color: theme.text, fontSize: moderateScale(14)}}>{label}</Text>
    </View>
  )
}

export default publisherCommonForm;