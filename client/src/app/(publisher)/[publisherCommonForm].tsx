import { ipURL } from '@/utils/backendURL'
import { horizontalScale, moderateScale, verticalScale } from '@/utils/responsiveSize'
import DateTimePicker from '@react-native-community/datetimepicker'
import { Picker } from '@react-native-picker/picker'
import axios from 'axios'
import Checkbox from 'expo-checkbox'
import * as DocumentPicker from 'expo-document-picker'
import { router, useLocalSearchParams } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import React, { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Alert, Dimensions, Keyboard, KeyboardAvoidingView, NativeScrollEvent, NativeSyntheticEvent, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { Audio } from 'react-native-compressor'
import { Audio as ExpoAudio } from 'expo-av'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import * as ImageManipulator from 'expo-image-manipulator'
import {BookCategoryLabels} from '../../utils/categoriesdata'
import { useTheme } from '@/providers/ThemeProvider'
import { axiosWithAuth } from '@/utils/customAxios'
import { Ionicons, Feather } from '@expo/vector-icons'
import {
  BOOK_COVER_ASPECT_PAIR,
  BOOK_COVER_HEIGHT,
  BOOK_COVER_WIDTH,
} from '@/constants/bookCover'

interface AudioSample {
  name: string;
  size: number;
  uri: string;
  type: string;
}

const { width } = Dimensions.get('window');

/**
 * No second crop — scale to canonical `BOOK_COVER_WIDTH × BOOK_COVER_HEIGHT`.
 * Crop UI should match `BOOK_COVER_ASPECT_PAIR`; `resize` locks final pixel size/ratio for S3.
 */
async function finalizeCoverUri(uri: string): Promise<string> {
  const manipulated = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: BOOK_COVER_WIDTH, height: BOOK_COVER_HEIGHT } }],
    {
      compress: 0.88,
      format: ImageManipulator.SaveFormat.JPEG,
    },
  );
  return manipulated.uri;
}

/** S3/URL-safe upload name: decode % encoding, keep extension, replace non-alphanumeric runs with "_". */
function sanitizeUploadFileName(originalName: string): string {
  let decoded = (originalName || 'file').trim();
  try {
    decoded = decodeURIComponent(decoded);
  } catch {
    // keep decoded as-is
  }
  const lastDot = decoded.lastIndexOf('.');
  const hasExt = lastDot > 0 && lastDot < decoded.length - 1;
  const base = hasExt ? decoded.slice(0, lastDot) : decoded;
  const ext = hasExt ? decoded.slice(lastDot + 1) : '';
  const safeBase =
    base.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'file';
  const safeExt = ext.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  return safeExt ? `${safeBase}.${safeExt}` : safeBase;
}

const publisherCommonForm = () => {
    const params = useLocalSearchParams<{
        publisherCommonForm?: string;
        loadExisting?: string;
        isCompany?: string;
    }>();
    const listingId = String(params.publisherCommonForm ?? '');
    const loadExistingParam = params.loadExisting === '1';
    const resubmitIsCompany = String(params.isCompany) === 'true';
    console.log(listingId, 'listing id params', { loadExistingParam, resubmitIsCompany });
    const [token, setToken] = useState(null);
    const {theme} = useTheme()
    const insets = useSafeAreaInsets();
    const [title, setTitle] = useState('')
    const [language, setLanguage] = useState('')
    const [categories, setCategories] = useState('none');
    const [date, setDate] = useState(new Date(1598051730000));
    const [ISBNDOIISRC, setISBNDOIISRC] = useState('')
    const [synopsis, setSynopsis] = useState('')
    const [narrator, setNarrator] = useState('')
    // Voice configuration states
    const [selectedLanguage, setSelectedLanguage] = useState('English (US)')
    const [selectedVoiceType, setSelectedVoiceType] = useState('FEMALE')
    const [selectedSpeakingRate, setSelectedSpeakingRate] = useState('Normal')
    const [selectedAudioFormat, setSelectedAudioFormat] = useState('mp3')
    const [image, setImage] = useState(null);
    const [coverUploadFileName, setCoverUploadFileName] = useState('cover.jpg');
    const [imageURL, setImageURL] = useState('');
    const [audioSample, setAudioSample] = useState<AudioSample | null>(null)
    const [audioCompressURL, setAudioCompressURL] = useState('')
    const [amount, setAmount] = useState('');

    const [doc1, setDoc1] = useState(null);
    /** When resubmitting a rejected listing without picking a new manuscript, reuse this URL. */
    const [existingPdfUrl, setExistingPdfUrl] = useState('');
    const [rightsHolder, setRightsHolder] = useState(false)

    const [isChecked, setChecked] = useState(false);
    const [errors, setErrors] = useState<{[key: string]: string}>({});
    const [isPlayingSample, setIsPlayingSample] = useState(false);

    // Voice options data
    const voiceOptions = {
        "English (Arabic)": [
            {
                "id": "ar-XA-female",
                "languageCode": "ar-XA",
                "voiceName": "ar-XA-Chirp3-HD-Achernar",
                "gender": "FEMALE"
            },
            {
                "id": "ar-XA-male",
                "languageCode": "ar-XA",
                "voiceName": "ar-XA-Chirp3-HD-Achird",
                "gender": "MALE"
            }
        ],
        "English (Australia)": [
            {
                "id": "en-AU-female",
                "languageCode": "en-AU",
                "voiceName": "en-AU-Chirp3-HD-Achernar",
                "gender": "FEMALE"
            },
            {
                "id": "en-AU-male",
                "languageCode": "en-AU",
                "voiceName": "en-AU-Chirp3-HD-Achird",
                "gender": "MALE"
            }
        ],
        "English (India)": [
            {
                "id": "en-IN-female",
                "languageCode": "en-IN",
                "voiceName": "en-IN-Chirp3-HD-Achernar",
                "gender": "FEMALE"
            },
            {
                "id": "en-IN-male",
                "languageCode": "en-IN",
                "voiceName": "en-IN-Chirp3-HD-Achird",
                "gender": "MALE"
            }
        ],
        "English (UK)": [
            {
                "id": "en-GB-female",
                "languageCode": "en-GB",
                "voiceName": "en-GB-Chirp3-HD-Achernar",
                "gender": "FEMALE"
            },
            {
                "id": "en-GB-male",
                "languageCode": "en-GB",
                "voiceName": "en-GB-Chirp3-HD-Achird",
                "gender": "MALE"
            }
        ],
        "English (US)": [
            {
                "id": "en-US-female",
                "languageCode": "en-US",
                "voiceName": "en-US-Chirp3-HD-Achernar",
                "gender": "FEMALE"
            },
            {
                "id": "en-US-male",
                "languageCode": "en-US",
                "voiceName": "en-US-Chirp3-HD-Achird",
                "gender": "MALE"
            }
        ]
    };

    // Speaking pace — OpenAI TTS (gpt-4o-mini-tts) steers speed mainly via `instructions`; these values are hints in that prompt.
    const speakingRateOptions = [
        { label: 'Slower', value: 'Slower', rate: 0.88 },
        { label: 'Normal', value: 'Normal', rate: 1 },
        { label: 'Faster', value: 'Faster', rate: 1.1 }
    ];

    // https://developers.openai.com/api/docs/guides/text-to-speech#supported-output-formats
    const audioFormatOptions = [
        { label: 'MP3', value: 'mp3', hint: 'Default, general use' },
        { label: 'Opus', value: 'opus', hint: 'Streaming, low latency' },
        { label: 'WAV', value: 'wav', hint: 'Uncompressed' }
    ];

    const [mode, setMode] = useState('date');
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);

    const scrollRef = useRef<ScrollView>(null);
    const scrollYRef = useRef(0);
    const keyboardHeightRef = useRef(0);
    const synopsisInputRef = useRef<TextInput>(null);

    useEffect(() => {
        const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
        const showSub = Keyboard.addListener(showEvent, (e) => {
            keyboardHeightRef.current = e.endCoordinates.height;
        });
        const hideSub = Keyboard.addListener(hideEvent, () => {
            keyboardHeightRef.current = 0;
        });
        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    const scrollSynopsisAboveKeyboard = () => {
        const tryScroll = () => {
            synopsisInputRef.current?.measureInWindow((x, y, width, height) => {
                const winH = Dimensions.get('window').height;
                const kb = keyboardHeightRef.current;
                const pad = verticalScale(16);
                const visibleBottom = winH - kb - insets.bottom - pad;
                const fieldBottom = y + height;
                if (fieldBottom > visibleBottom) {
                    const delta = fieldBottom - visibleBottom;
                    scrollRef.current?.scrollTo({
                        y: Math.max(0, scrollYRef.current + delta),
                        animated: true,
                    });
                }
            });
        };
        requestAnimationFrame(tryScroll);
        setTimeout(tryScroll, 120);
        setTimeout(tryScroll, 320);
    };

    const onScrollViewScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        scrollYRef.current = e.nativeEvent.contentOffset.y;
    };

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

    useEffect(() => {
        if (!loadExistingParam || !listingId) {
            setExistingPdfUrl('');
            return;
        }
        let cancelled = false;
        const run = async () => {
            try {
                let row: Record<string, unknown> | null = null;
                if (resubmitIsCompany) {
                    const res = await axios.get(
                        `${ipURL}/api/publisher/get-all-company-data-single/${listingId}`,
                    );
                    row = (res.data?.companyData?.[0] as Record<string, unknown>) ?? null;
                } else {
                    const res = await axios.get(
                        `${ipURL}/api/publisher/get-all-author-data-single/${listingId}`,
                    );
                    row = (res.data?.authorData as Record<string, unknown>) ?? null;
                }
                if (cancelled) return;
                if (!row) {
                    Alert.alert('Error', 'Could not load this listing.');
                    return;
                }
                setTitle(typeof row.title === 'string' ? row.title : '');
                setLanguage(typeof row.language === 'string' ? row.language : '');
                const cat = row.categories;
                setCategories(
                    typeof cat === 'string' && cat !== '' ? cat : 'none',
                );
                setISBNDOIISRC(typeof row.ISBNDOIISRC === 'string' ? row.ISBNDOIISRC : '');
                setSynopsis(typeof row.synopsis === 'string' ? row.synopsis : '');
                setNarrator(typeof row.narrator === 'string' ? row.narrator : '');
                if (row.date) {
                    const d = new Date(row.date as string);
                    if (!Number.isNaN(d.getTime())) setDate(d);
                }
                setRightsHolder(Boolean(row.rightsHolder));
                if (row.amount != null && Number.isFinite(Number(row.amount))) {
                    setAmount(String(Math.round(Number(row.amount)) / 100));
                } else {
                    setAmount('');
                }
                setExistingPdfUrl(typeof row.pdfURL === 'string' ? row.pdfURL : '');
                const cover =
                    typeof row.coverImage === 'string' ? row.coverImage : '';
                setImageURL(cover);
                setImage(null);

                let speakingLabel = 'Normal';
                try {
                    const raw = row.narrationSpeakingRate;
                    const parsed =
                        typeof raw === 'string' ? JSON.parse(raw) : raw;
                    const rateNum =
                        typeof parsed === 'number'
                            ? parsed
                            : Number(String(parsed).replace(/^"|"$/g, ''));
                    const match = speakingRateOptions.find(
                        (o) => Math.abs(o.rate - rateNum) < 0.001,
                    );
                    if (match) speakingLabel = match.value;
                } catch {
                    /* keep default */
                }
                setSelectedSpeakingRate(speakingLabel);

                let fmt = 'mp3';
                try {
                    const hr = row.narrationSampleHeartzRate;
                    fmt =
                        typeof hr === 'string'
                            ? JSON.parse(hr)
                            : String(hr ?? 'mp3');
                } catch {
                    fmt = String(row.narrationSampleHeartzRate ?? 'mp3')
                        .replace(/^"|"$/g, '')
                        .trim();
                }
                if (!fmt) fmt = 'mp3';
                setSelectedAudioFormat(fmt);

                let lang = 'English (US)';
                let gender: string = 'FEMALE';
                const lc = row.narrationLanguageCode;
                const vn = row.narrationVoiceName;
                if (typeof lc === 'string' && typeof vn === 'string' && lc && vn) {
                    for (const [langName, voices] of Object.entries(voiceOptions)) {
                        const hit = voices.find(
                            (v) => v.languageCode === lc && v.voiceName === vn,
                        );
                        if (hit) {
                            lang = langName;
                            gender = hit.gender;
                            break;
                        }
                    }
                }
                setSelectedLanguage(lang);
                setSelectedVoiceType(gender);
            } catch (e) {
                console.error(e);
                if (!cancelled) {
                    Alert.alert('Error', 'Could not load listing details.');
                }
            }
        };
        void run();
        return () => {
            cancelled = true;
        };
    }, [loadExistingParam, resubmitIsCompany, listingId]);

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
        console.log(listingId,'companyId');
        
        formData.append('id', listingId)

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
            type: ["application/pdf", "application/epub+zip"],
            copyToCacheDirectory: true
        });

        
            let { name, size, uri, mimeType } = result["assets"][0];
            const lower = (name || '').toLowerCase();
            const isEpub = lower.endsWith('.epub') || mimeType === 'application/epub+zip';
            const isPdf = lower.endsWith('.pdf') || mimeType === 'application/pdf';
            const resolvedType = isEpub
                ? 'application/epub+zip'
                : isPdf
                    ? 'application/pdf'
                    : (mimeType || 'application/pdf');
            var fileToUpload = {
                name: sanitizeUploadFileName(name || (isEpub ? 'file.epub' : isPdf ? 'file.pdf' : 'file.pdf')),
                size: size,
                uri: uri,
                type: resolvedType
            };
            setDoc1(fileToUpload);
    };

    const postDocuments = async () => {
        
        const url = `${ipURL}/api/s3/upload-to-aws`;
        const formData = new FormData();
        
        if (doc1) formData.append('document1', { uri: doc1.uri, name: doc1.name, type: doc1.type } as any);       

        formData.append('id', listingId);
console.log(listingId,'companyId in document submit');

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
          aspect: [...BOOK_COVER_ASPECT_PAIR],
          quality: 1,
        });
    
        if (!result.canceled && result.assets?.[0]) {
          const asset = result.assets[0];
          try {
            const finalUri = await finalizeCoverUri(asset.uri);
            const raw = asset.fileName || '';
            const dot = raw.lastIndexOf('.');
            const stem = (dot > 0 ? raw.slice(0, dot) : raw) || 'cover';
            setCoverUploadFileName(sanitizeUploadFileName(`${stem}.jpg`));
            setImage(finalUri);
          } catch (e) {
            console.error('Cover crop/resize failed:', e);
            Alert.alert('Image error', 'Could not process the cover image. Try another file.');
          }
        }
      };
    
      const uploadImageToBe = async () => {
        if (!image) return;
    
        const formData = new FormData();
        formData.append('image', {
          uri: image,
          name: coverUploadFileName,
          type: 'image/jpeg',
        } as any);
        formData.append('id', listingId);
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
        
        // if (!amount.trim()) {
        //     newErrors.amount = 'Price is required'
        // }
        
        
        const hasPdf = Boolean(doc1) || Boolean(String(existingPdfUrl || '').trim());
        if (!hasPdf) {
            newErrors.doc1 = 'A PDF or EPUB book file is required (or keep your existing file)'
        }

        const hasCover =
            Boolean(image) || Boolean(String(imageURL || '').trim());
        if (!hasCover) {
            newErrors.image = 'Cover image is required (or keep your existing cover)'
        }
        
        if (!rightsHolder) {
            newErrors.rightsHolder = 'You must confirm you are the rights holder'
        }
        
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handlePlaySample = async () => {
        try {
            setIsPlayingSample(true);
            
            // Get the voice configuration
            const voiceConfig = {
                language: selectedLanguage,
                voiceType: selectedVoiceType,
                speakingRate: speakingRateOptions.find(opt => opt.value === selectedSpeakingRate)?.rate || 1.0,
                sampleRate: selectedAudioFormat,
                voiceDetails: voiceOptions[selectedLanguage]?.find(voice => voice.gender === selectedVoiceType),
                publisherId: listingId,
            };

            // Send request to backend for voice sample
            const response = await axiosWithAuth.post(`${ipURL}/api/publisher/voice-sample`, {
                voiceConfig: voiceConfig
            });

            if (response.data && response.data.audioData) {
                try {
                    // Convert base64 to audio URI
                    const audioData = response.data.audioData;
                    const audioUri = audioData;
                    
                    // Configure and play audio using expo-av
                    await ExpoAudio.setAudioModeAsync({
                        allowsRecordingIOS: false,
                        staysActiveInBackground: false,
                        playsInSilentModeIOS: true,
                        shouldDuckAndroid: true,
                        playThroughEarpieceAndroid: false,
                    });
                    
                    const { sound } = await ExpoAudio.Sound.createAsync(
                        { uri: audioUri },
                        { shouldPlay: true }
                    );
                    
                    Alert.alert('Sample Playing', 'Voice sample is now playing!');
                    
                    // Clean up after playback
                    sound.setOnPlaybackStatusUpdate((status) => {
                        if (status.isLoaded && status.didJustFinish) {
                            sound.unloadAsync();
                        }
                    });
                    
                } catch (playbackError) {
                    console.error('Error playing audio:', playbackError);
                    Alert.alert('Playback Error', 'Could not play the audio sample.');
                }
            }
        } catch (error) {
            console.error('Error generating voice sample:', error);
            Alert.alert('Error', 'Failed to generate voice sample. Please try again.');
        } finally {
            setIsPlayingSample(false);
        }
    };

    const handleSubmit = async () => {
        // Validate form before proceeding
        if (!validateForm()) {
            return
        }
        
        try{
            setLoading(true);

            let coverForPayload = String(imageURL || '').trim();
            if (image && token) {
                const formData = new FormData();
                formData.append('image', {
                    uri: image,
                    name: coverUploadFileName,
                    type: 'image/jpeg',
                } as any);
                formData.append('id', listingId);
                formData.append('userId', token);
                try {
                    const imgRes = await axios.post(
                        `${ipURL}/api/s3/upload-to-aws-image`,
                        formData,
                        {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                            },
                        },
                    );
                    const loc = imgRes.data?.data;
                    coverForPayload =
                        typeof loc === 'string'
                            ? loc
                            : String(loc?.Location ?? '').trim();
                    if (coverForPayload) setImageURL(coverForPayload);
                } catch (uploadErr) {
                    console.error(uploadErr);
                    setLoading(false);
                    Alert.alert(
                        'Cover upload failed',
                        'Could not upload the cover image. Try again or pick a different image.',
                    );
                    return;
                }
            }
            if (!coverForPayload) {
                setLoading(false);
                Alert.alert(
                    'Cover image required',
                    'Add a cover image or keep your existing one.',
                );
                return;
            }

            let pdfURL: string;
            if (doc1) {
                const docData = await postDocuments();
                console.log(docData, 'docData');
                const first =
                    docData?.data?.[0] ??
                    (typeof docData?.data === 'string' ? docData.data : null);
                if (!first || typeof first !== 'string') {
                    setLoading(false);
                    Alert.alert(
                        'Upload failed',
                        'Could not upload your manuscript. Please try again.',
                    );
                    return;
                }
                pdfURL = first;
            } else {
                const reuse = String(existingPdfUrl || '').trim();
                if (!reuse) {
                    setLoading(false);
                    Alert.alert(
                        'Manuscript required',
                        'Upload a PDF or EPUB, or keep your existing file.',
                    );
                    return;
                }
                pdfURL = reuse;
            }

            const voiceDetails = voiceOptions[selectedLanguage]?.find(
                (voice) => voice.gender === selectedVoiceType,
            );
            if (!voiceDetails) {
                setLoading(false);
                Alert.alert(
                    'Voice configuration',
                    'Please select a valid narration language and voice.',
                );
                return;
            }

            let publisherEmail = ''
            try {
                const userDetailsRaw = await SecureStore.getItemAsync('userDetails')
                if (userDetailsRaw) {
                    const userDetails = JSON.parse(userDetailsRaw) as { email?: string }
                    const e = userDetails?.email
                    if (e && e !== 'null') publisherEmail = e
                }
            } catch {
                /* ignore missing or invalid userDetails */
            }

            const amountNum =
                amount === '' || amount == null
                    ? 0
                    : Number(amount);
            const amountForApi = Number.isFinite(amountNum) ? amountNum : 0;
    
            const data ={
                id: listingId,
                title: title,
                language: language,
                categories: categories,
                date: date,
                ISBNDOIISRC: ISBNDOIISRC,
                synopsis: synopsis,
                narrator: narrator,
                voiceConfig: {
                    language: selectedLanguage,
                    voiceType: selectedVoiceType,
                    speakingRate: speakingRateOptions.find(opt => opt.value === selectedSpeakingRate)?.rate || 1.0,
                    sampleRate: selectedAudioFormat,
                    voiceDetails,
                },
                pdfURL,
                rightsHolder: rightsHolder,
                coverImage: coverForPayload,
                amount: amountForApi,
                email: publisherEmail,
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
      pickerItem: {
          backgroundColor: theme.white,
          color: theme.text,
      },
      voiceConfigSection: {
          marginBottom: verticalScale(16),
          gap: verticalScale(16),
      },
      configRow: {
          gap: verticalScale(8),
      },
      configLabel: {
          fontSize: moderateScale(16),
          fontWeight: '600',
          color: theme.text,
      },
      pickerContainer: {
          backgroundColor: theme.white,
          borderRadius: moderateScale(12),
          borderWidth: 1,
          borderColor: theme.gray2,
          overflow: 'hidden',
      },
      picker: {
          height: verticalScale(200),
          color: theme.text,
      },
      voiceTypeContainer: {
          flexDirection: 'row',
          gap: horizontalScale(12),
      },
      voiceTypeButton: {
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.white,
          borderRadius: moderateScale(12),
          padding: moderateScale(12),
          borderWidth: 2,
          borderColor: theme.gray2,
          gap: horizontalScale(8),
      },
      voiceTypeButtonSelected: {
          borderColor: theme.primary,
          backgroundColor: `${theme.primary}10`,
      },
      voiceTypeText: {
          color: theme.text,
          fontSize: moderateScale(14),
          fontWeight: '600',
      },
      voiceTypeTextSelected: {
          color: theme.primary,
      },
      speakingRateContainer: {
          flexDirection: 'row',
          gap: horizontalScale(8),
      },
      speakingRateButton: {
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.white,
          borderRadius: moderateScale(12),
          padding: moderateScale(12),
          borderWidth: 2,
          borderColor: theme.gray2,
          gap: horizontalScale(6),
      },
      speakingRateButtonSelected: {
          borderColor: theme.primary,
          backgroundColor: `${theme.primary}10`,
      },
      speakingRateText: {
          color: theme.text,
          fontSize: moderateScale(13),
          fontWeight: '600',
      },
      speakingRateTextSelected: {
          color: theme.primary,
      },
      sampleRateContainer: {
          flexDirection: 'row',
          gap: horizontalScale(12),
      },
      sampleRateButton: {
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.white,
          borderRadius: moderateScale(12),
          padding: moderateScale(12),
          borderWidth: 2,
          borderColor: theme.gray2,
          gap: horizontalScale(8),
      },
      sampleRateButtonSelected: {
          borderColor: theme.primary,
          backgroundColor: `${theme.primary}10`,
      },
      sampleRateText: {
          color: theme.text,
          fontSize: moderateScale(14),
          fontWeight: '600',
      },
      sampleRateTextSelected: {
          color: theme.primary,
      },
      playSampleButton: {
          backgroundColor: theme.primary,
          borderRadius: moderateScale(12),
          padding: moderateScale(16),
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: horizontalScale(8),
          marginTop: verticalScale(8),
      },
      playSampleButtonText: {
          color: theme.background,
          fontSize: moderateScale(16),
          fontWeight: '600',
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
          <KeyboardAvoidingView
              style={{ flex: 1 }}
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
          >
          <ScrollView
              ref={scrollRef}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              style={{ flex: 1 }}
              scrollEventThrottle={16}
              onScroll={onScrollViewScroll}
              contentContainerStyle={{ paddingBottom: verticalScale(120) }}
          >
              <View style={styles.content}>
                  <View style={styles.headerContainer}>
                      <Text style={styles.headerText}>
                          {loadExistingParam ? 'Update & resubmit' : 'Last Steps'}
                      </Text>
                      <Text style={styles.subHeaderText}>
                          {loadExistingParam
                              ? 'Edit your listing and submit again for review. Rejection is cleared after a successful update.'
                              : 'Fill in the details to publish your audiobook'}
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
                              ref={synopsisInputRef}
                              placeholder="Enter Synopsis"
                              placeholderTextColor={theme.textMuted}
                              multiline={true}
                              numberOfLines={4}
                              value={synopsis}
                              onChangeText={setSynopsis}
                              onFocus={scrollSynopsisAboveKeyboard}
                              style={[styles.textArea, errors.synopsis && styles.inputError]}
                          />
                          {errors.synopsis && <Text style={styles.errorText}>{errors.synopsis}</Text>}
                      </View>
                      {/* TODO: Add price input hidden as its decided by admins */}

                      {/* <View style={styles.inputContainer}>
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
                      </View> */}

                      <View style={styles.voiceConfigSection}>
                          <Text style={styles.label}>Voice Configuration</Text>
                          
                          {/* Language Selection */}
                          <View style={styles.configRow}>
                              <Text style={styles.configLabel}>Language</Text>
                              <View style={styles.pickerContainer}>
                                  <Picker
                                      mode='dropdown'
                                      dropdownIconColor={theme.text}
                                      selectedValue={selectedLanguage}
                                      onValueChange={(itemValue) => setSelectedLanguage(itemValue)}
                                      style={styles.picker}
                                  >
                                      {Object.keys(voiceOptions).map((language) => (
                                          <Picker.Item key={language} label={language} value={language} />
                                      ))}
                                  </Picker>
                              </View>
                          </View>

                          {/* Gender presentation — backend maps locale + this to an OpenAI built-in voice */}
                          <View style={styles.configRow}>
                              <Text style={styles.configLabel}>Voice character</Text>
                              <View style={styles.voiceTypeContainer}>
                                  <TouchableOpacity 
                                      style={[styles.voiceTypeButton, selectedVoiceType === 'FEMALE' && styles.voiceTypeButtonSelected]}
                                      onPress={() => setSelectedVoiceType('FEMALE')}
                                  >
                                      <Ionicons 
                                          name={selectedVoiceType === 'FEMALE' ? "checkmark-circle" : "ellipse-outline"} 
                                          size={moderateScale(20)} 
                                          color={selectedVoiceType === 'FEMALE' ? theme.primary : theme.gray2} 
                                      />
                                      <Text style={[styles.voiceTypeText, selectedVoiceType === 'FEMALE' && styles.voiceTypeTextSelected]}>
                                          Female
                                      </Text>
                                  </TouchableOpacity>
                                  <TouchableOpacity 
                                      style={[styles.voiceTypeButton, selectedVoiceType === 'MALE' && styles.voiceTypeButtonSelected]}
                                      onPress={() => setSelectedVoiceType('MALE')}
                                  >
                                      <Ionicons 
                                          name={selectedVoiceType === 'MALE' ? "checkmark-circle" : "ellipse-outline"} 
                                          size={moderateScale(20)} 
                                          color={selectedVoiceType === 'MALE' ? theme.primary : theme.gray2} 
                                      />
                                      <Text style={[styles.voiceTypeText, selectedVoiceType === 'MALE' && styles.voiceTypeTextSelected]}>
                                          Male
                                      </Text>
                                  </TouchableOpacity>
                              </View>
                          </View>

                          {/* Pace is steered via OpenAI TTS `instructions` on the server */}
                          <View style={styles.configRow}>
                              <Text style={styles.configLabel}>Speaking pace</Text>
                              <View style={styles.speakingRateContainer}>
                                  {speakingRateOptions.map((option) => (
                                      <TouchableOpacity 
                                          key={option.value}
                                          style={[styles.speakingRateButton, selectedSpeakingRate === option.value && styles.speakingRateButtonSelected]}
                                          onPress={() => setSelectedSpeakingRate(option.value)}
                                      >
                                          <Ionicons 
                                              name={selectedSpeakingRate === option.value ? "checkmark-circle" : "ellipse-outline"} 
                                              size={moderateScale(20)} 
                                              color={selectedSpeakingRate === option.value ? theme.primary : theme.gray2} 
                                          />
                                          <Text style={[styles.speakingRateText, selectedSpeakingRate === option.value && styles.speakingRateTextSelected]}>
                                              {option.label}
                                          </Text>
                                      </TouchableOpacity>
                                  ))}
                              </View>
                          </View>

                          {/* OpenAI speech API output format */}
                          <View style={styles.configRow}>
                              <Text style={styles.configLabel}>Audio format</Text>
                              <View style={styles.sampleRateContainer}>
                                  {audioFormatOptions.map((option) => (
                                      <TouchableOpacity 
                                          key={option.value}
                                          style={[styles.sampleRateButton, selectedAudioFormat === option.value && styles.sampleRateButtonSelected]}
                                          onPress={() => setSelectedAudioFormat(option.value)}
                                      >
                                          <Ionicons 
                                              name={selectedAudioFormat === option.value ? "checkmark-circle" : "ellipse-outline"} 
                                              size={moderateScale(20)} 
                                              color={selectedAudioFormat === option.value ? theme.primary : theme.gray2} 
                                          />
                                          <Text style={[styles.sampleRateText, selectedAudioFormat === option.value && styles.sampleRateTextSelected]}>
                                              {option.label}
                                          </Text>
                                      </TouchableOpacity>
                                  ))}
                              </View>
                          </View>

                          {/* Play Sample Button */}
                          <View style={styles.configRow}>
                              <TouchableOpacity 
                                  style={styles.playSampleButton}
                                  onPress={handlePlaySample}
                                  disabled={isPlayingSample}
                              >
                                  {isPlayingSample ? (
                                      <ActivityIndicator size="small" color={theme.background} />
                                  ) : (
                                      <Ionicons name="play" size={moderateScale(20)} color={theme.background} />
                                  )}
                                  <Text style={styles.playSampleButtonText}>
                                      {isPlayingSample ? 'Generating...' : 'Play Sample'}
                                  </Text>
                              </TouchableOpacity>
                          </View>
                      </View>

                      <View style={styles.uploadSection}>
                          <Text style={styles.label}>Upload Files</Text>
                          {/* <TouchableOpacity 
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
                          </TouchableOpacity> */}
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
                                  {doc1?.name || (String(existingPdfUrl || '').trim() ? 'Using existing PDF/EPUB (tap to replace)' : 'Upload PDF or EPUB')}
                              </Text>
                          </TouchableOpacity>
                          {errors.doc1 && <Text style={styles.errorText}>{errors.doc1}</Text>}
                          {loadExistingParam && String(existingPdfUrl || '').trim() && !doc1 ? (
                              <Text style={{ color: theme.textMuted, fontSize: moderateScale(12), marginTop: verticalScale(6) }}>
                                  Your current manuscript will be kept unless you choose a new file.
                              </Text>
                          ) : null}
                          
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
                                  {image
                                      ? 'Image Selected'
                                      : String(imageURL || '').trim()
                                        ? 'Using existing cover (tap to replace)'
                                        : 'Upload Cover Image'}
                              </Text>
                          </TouchableOpacity>
                          {errors.image && <Text style={styles.errorText}>{errors.image}</Text>}
                          {loadExistingParam && String(imageURL || '').trim() && !image ? (
                              <Text style={{ color: theme.textMuted, fontSize: moderateScale(12), marginTop: verticalScale(6) }}>
                                  Your current cover will be kept unless you pick a new image.
                              </Text>
                          ) : null}
                          
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
                                      {loadExistingParam ? 'Resubmit for review' : 'Submit Publication'}
                                  </Text>
                              )}
                          </TouchableOpacity>
                      </View>
                  </View>
              </View>
          </ScrollView>
          </KeyboardAvoidingView>
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