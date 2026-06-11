import { defaultStyles } from '@/styles';
import { ipURL } from '@/utils/backendURL';
import { FontAwesome5, MaterialIcons, Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useLocalSearchParams, router } from 'expo-router';
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Linking,
  Image,
  RefreshControl,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { axiosWithAuth } from '@/utils/customAxios';
import { postAdminNarrationStream } from '@/utils/adminNarrationStream';
import { useTheme } from '@/providers/ThemeProvider';

const ACCENT_PALETTE = ['#0d9488', '#2563eb', '#7c3aed', '#c026d3', '#ea580c', '#ca8a04'];

function stableAccentFromId(listingId: string): string {
  let h = 0;
  for (let i = 0; i < listingId.length; i++) {
    h = listingId.charCodeAt(i) + ((h << 5) - h);
  }
  return ACCENT_PALETTE[Math.abs(h) % ACCENT_PALETTE.length];
}

/** Timeline entries use `s` / `e` in ms (admin full-audio pipeline). */
function durationFromNarrationSegmentsJson(
  raw: string | null | undefined
): { hours: number; minutes: number } {
  if (!raw || typeof raw !== 'string') return { hours: 0, minutes: 0 };
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return { hours: 0, minutes: 0 };
    let maxEnd = 0;
    let hasTimeline = false;
    for (const seg of parsed) {
      if (!seg || typeof seg !== 'object') continue;
      const e = (seg as { e?: unknown }).e;
      const s = (seg as { s?: unknown }).s;
      if (typeof e === 'number' && typeof s === 'number' && e > s) {
        hasTimeline = true;
        maxEnd = Math.max(maxEnd, e);
      }
    }
    if (!hasTimeline || maxEnd <= 0) return { hours: 0, minutes: 0 };
    let totalMinutes = Math.ceil(maxEnd / 60000);
    if (maxEnd > 0 && totalMinutes === 0) totalMinutes = 1;
    return {
      hours: Math.floor(totalMinutes / 60),
      minutes: totalMinutes % 60,
    };
  } catch {
    return { hours: 0, minutes: 0 };
  }
}

function buildVerifyPublisherBody(
  pub: Record<string, unknown>,
  isCompany: boolean,
  listingId: string
) {
  const { hours, minutes } = durationFromNarrationSegmentsJson(
    typeof pub.narrationSegments === 'string' ? pub.narrationSegments : undefined
  );
  const complete =
    String(pub.completeAudioUrl || '').trim() ||
    String(pub.audioSampleURL || '').trim();
  const narrator = String(pub.narrator || '').trim() || 'Audiobook';
  return {
    type: isCompany ? 'company' : 'author',
    durationHours: hours,
    durationMinutes: minutes,
    completeAudioSample: complete,
    narratorName: narrator,
    colorCode: stableAccentFromId(listingId),
    pdfURL: pub.pdfURL,
  };
}

const PublisherDetails = () => {
  const { theme } = useTheme();
  const { id, isCompany } = useLocalSearchParams();
  const isCompanyBoolean = isCompany === 'true';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [publisherData, setPublisherData] = useState(null);
  const [error, setError] = useState(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [audioJobVisible, setAudioJobVisible] = useState(false);
  const [audioJobTitle, setAudioJobTitle] = useState('');
  const [audioJobDetail, setAudioJobDetail] = useState('');
  const [audioJobStatus, setAudioJobStatus] = useState<'running' | 'completed' | 'failed'>('running');
  const [sampleAudioRunning, setSampleAudioRunning] = useState(false);
  const [fullAudioRunning, setFullAudioRunning] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectMessage, setRejectMessage] = useState('');
  const [isRejectSubmitting, setIsRejectSubmitting] = useState(false);
  const keepAwakeTag = `admin-audio-generation-${String(id)}`;
  
  const fetchPublisherDetails = async (opts?: { silent?: boolean }) => {
    const silent = Boolean(opts?.silent);
    try {
      if (!silent) setLoading(true);
      const response = await axiosWithAuth.get(`${ipURL}/api/admin/get-single/${isCompanyBoolean}/${id}`);
      setPublisherData(response.data);
      if (!silent) setLoading(false);
    } catch (err) {
      console.error('Error fetching publisher details:', err);
      if (!silent) {
        setError('Failed to load publisher details');
        setLoading(false);
      }
    }
  };
  
  useEffect(() => {
    fetchPublisherDetails();
  }, [id, isCompanyBoolean]);

  useEffect(() => {
    const shouldKeepAwake = sampleAudioRunning || fullAudioRunning;

    if (shouldKeepAwake) {
      activateKeepAwake(keepAwakeTag);
    } else {
      deactivateKeepAwake(keepAwakeTag);
    }

    return () => {
      deactivateKeepAwake(keepAwakeTag);
    };
  }, [sampleAudioRunning, fullAudioRunning, keepAwakeTag]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchPublisherDetails().finally(() => {
      setRefreshing(false);
    });
  }, [id, isCompanyBoolean]);

  const handleGoBack = () => {
    router.back();
  };

  const handleRejectPublisher = () => {
    setRejectMessage('');
    setShowRejectModal(true);
  };

  const handleRejectModalCancel = () => {
    if (isRejectSubmitting) return;
    setShowRejectModal(false);
    setRejectMessage('');
  };

  const handleSubmitRejection = async () => {
    const msg = rejectMessage.trim();
    if (!msg) {
      Alert.alert('Message required', 'Please enter a message explaining the rejection for the publisher.');
      return;
    }
    if (!id) return;
    try {
      setIsRejectSubmitting(true);
      await axiosWithAuth.post(
        `${ipURL}/api/admin/reject-publisher/${id}?isCompany=${isCompanyBoolean}`,
        { message: msg }
      );
      Alert.alert('Email sent', 'The publisher has been notified by email with your message.');
      setShowRejectModal(false);
      setRejectMessage('');
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } }; message?: string };
      const m = ax?.response?.data?.message || ax?.message || 'Failed to send rejection email.';
      Alert.alert('Error', String(m));
    } finally {
      setIsRejectSubmitting(false);
    }
  };

  const handleSendSampleAudio = async (id) => {
    if (!publisherData?.publisher) return;
    if (sampleAudioRunning) return;
    setSampleAudioRunning(true);
    setAudioJobVisible(true);
    setAudioJobStatus('running');
    setAudioJobTitle('Starting sample audio…');
    setAudioJobDetail('Builds the full-book narration plan with AI, then TTS for the first segment only.');
    const body = {
      narrationSampleHeartzRate: publisherData.publisher.narrationSampleHeartzRate,
      narrationSpeakingRate: publisherData.publisher.narrationSpeakingRate,
      narrationGender: publisherData.publisher.narrationGender,
      narrationLanguageCode: publisherData.publisher.narrationLanguageCode,
      narrationVoiceName: publisherData.publisher.narrationVoiceName,
    };
    const url = `${ipURL}/api/admin/send-sample-audio/${id}?isCompany=${isCompanyBoolean}&regenerateSegments=true`;
    try {
      await postAdminNarrationStream(url, body, (title, detail) => {
        setAudioJobTitle(title);
        setAudioJobDetail(detail);
      });
      setAudioJobStatus('completed');
      setAudioJobTitle('Sample audio completed');
      setAudioJobDetail('You can continue using the screen while this status stays visible.');
      await fetchPublisherDetails({ silent: true });
    } catch (error) {
      console.error('Error generating sample audio:', error);
      const msg = error instanceof Error ? error.message : 'Failed to generate sample audio.';
      setAudioJobStatus('failed');
      setAudioJobTitle('Sample audio failed');
      setAudioJobDetail(msg);
    } finally {
      setSampleAudioRunning(false);
    }
  };

  const handleGenerateFullAudio = async (id) => {
    if (!publisherData?.publisher) return;
    if (fullAudioRunning) return;
    setFullAudioRunning(true);
    setAudioJobVisible(true);
    setAudioJobStatus('running');
    setAudioJobTitle('Starting full audiobook…');
    setAudioJobDetail('Uses the saved full-book narration plan (or builds it if missing), then TTS for every segment.');
    const body = {
      narrationSampleHeartzRate: publisherData.publisher.narrationSampleHeartzRate,
      narrationSpeakingRate: publisherData.publisher.narrationSpeakingRate,
      narrationGender: publisherData.publisher.narrationGender,
      narrationLanguageCode: publisherData.publisher.narrationLanguageCode,
      narrationVoiceName: publisherData.publisher.narrationVoiceName,
    };
    const url = `${ipURL}/api/admin/generate-full-audio/${id}?isCompany=${isCompanyBoolean}`;
    try {
      await postAdminNarrationStream(url, body, (title, detail) => {
        setAudioJobTitle(title);
        setAudioJobDetail(detail);
      });
      setAudioJobStatus('completed');
      setAudioJobTitle('Full audio completed');
      setAudioJobDetail('Full audiobook has been generated successfully.');
      await fetchPublisherDetails({ silent: true });
    } catch (error) {
      console.error('Error generating full audio:', error);
      const msg = error instanceof Error ? error.message : 'Failed to generate full audio.';
      setAudioJobStatus('failed');
      setAudioJobTitle('Full audio failed');
      setAudioJobDetail(msg);
    } finally {
      setFullAudioRunning(false);
    }
  };

  const handleVerifyPublisher = async () => {
    if (!id || !publisherData?.publisher) {
      Alert.alert('Error', 'Publisher data is not loaded yet.');
      return;
    }
    setIsSubmitting(true);
    try {
      const body = buildVerifyPublisherBody(
        publisherData.publisher as Record<string, unknown>,
        isCompanyBoolean,
        String(id)
      );
      await axiosWithAuth.post(
        `${ipURL}/api/admin/verify-publisher/${id}`,
        body
      );
      Alert.alert(
        'Verified',
        'Publisher verified successfully. A confirmation email was sent to the publisher account on file.'
      );
      router.back();
    } catch (error: unknown) {
      console.error('Verification error:', error);
      const ax = error as { response?: { data?: { message?: string } }; message?: string };
      const m =
        ax?.response?.data?.message ||
        ax?.message ||
        'Failed to verify publisher. Please try again.';
      Alert.alert('Error', String(m));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDocument = (url) => {
    if (url) {
      Linking.openURL(url).catch(err => {
        Alert.alert('Error', 'Could not open the document');
      });
    } else {
      Alert.alert('Error', 'Document URL is not available');
    }
  };

  const renderCompanyDetails = () => {
    const company = publisherData.publisher;
    console.log(company, 'this is companyyyyyy -----------');
    
    return (
      <View style={styles.detailsContainer}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text, borderLeftColor: theme.primary }]}>Company Information</Text>
          <View style={[styles.infoRow, { borderBottomColor: theme.gray2 }]}>
            <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Company Name:</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>{company.companyName}</Text>
          </View>
          <View style={[styles.infoRow, { borderBottomColor: theme.gray2 }]}>
            <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Registration No:</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>{company.companyRegNo}</Text>
          </View>
          <View style={[styles.infoRow, { borderBottomColor: theme.gray2 }]}>
            <Text style={[styles.infoLabel, { color: theme.textMuted }]}>KRA PIN:</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>{company.kraPin}</Text>
          </View>
          <View style={[styles.infoRow, { borderBottomColor: theme.gray2 }]}>
            <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Telephone:</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>{company.telephone}</Text>
          </View>
          <View style={[styles.infoRow, { borderBottomColor: theme.gray2 }]}>
            <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Address:</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>{company.address}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text, borderLeftColor: theme.primary }]}>Book Information</Text>
          <View style={[styles.infoRow, { borderBottomColor: theme.gray2 }]}>
            <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Title:</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>{company.title}</Text>
          </View>
          <View style={[styles.infoRow, { borderBottomColor: theme.gray2 }]}>
            <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Language:</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>{company.language}</Text>
          </View>
          <View style={[styles.infoRow, { borderBottomColor: theme.gray2 }]}>
            <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Category:</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>{company.categories}</Text>
          </View>
          <View style={[styles.infoRow, { borderBottomColor: theme.gray2 }]}>
            <Text style={[styles.infoLabel, { color: theme.textMuted }]}>ISBN/DOI/ISRC:</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>{company.ISBNDOIISRC}</Text>
          </View>
          <View style={[styles.infoRow, { borderBottomColor: theme.gray2 }]}>
            <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Publication Date:</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>{new Date(company.date).toLocaleDateString()}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text, borderLeftColor: theme.primary }]}>Synopsis</Text>
          <View style={[styles.synopsisContainer, { backgroundColor: `${theme.gray2}15` }]}>
            <Text style={[styles.synopsisText, { color: theme.text }]}>{company.synopsis}</Text>
          </View>
        </View>

        {company.narrator && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text, borderLeftColor: theme.primary }]}>Narration Information</Text>
            <View style={[styles.infoRow, { borderBottomColor: theme.gray2 }]}>
              <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Narrator:</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{company.narrator}</Text>
            </View>
            <View style={styles.narratorStyles}>
              <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Narration Style:</Text>
              <View style={styles.stylesContainer}>
                {company.narrationStyleSlow && (
                  <View style={[styles.styleBadge, { backgroundColor: `${theme.primary}15`, borderColor: theme.primary }]}>
                    <Text style={[styles.styleBadgeText, { color: theme.text }]}>Slow</Text>
                  </View>
                )}
                {company.narrationStyleFast && (
                  <View style={[styles.styleBadge, { backgroundColor: `${theme.primary}15`, borderColor: theme.primary }]}>
                    <Text style={[styles.styleBadgeText, { color: theme.text }]}>Fast</Text>
                  </View>
                )}
                {company.narrationStyleIntimate && (
                  <View style={[styles.styleBadge, { backgroundColor: `${theme.primary}15`, borderColor: theme.primary }]}>
                    <Text style={[styles.styleBadgeText, { color: theme.text }]}>Intimate</Text>
                  </View>
                )}
                {company.narrationStyleCasual && (
                  <View style={[styles.styleBadge, { backgroundColor: `${theme.primary}15`, borderColor: theme.primary }]}>
                    <Text style={[styles.styleBadgeText, { color: theme.text }]}>Casual</Text>
                  </View>
                )}
                {company.narrationStyleStatic && (
                  <View style={[styles.styleBadge, { backgroundColor: `${theme.primary}15`, borderColor: theme.primary }]}>
                    <Text style={[styles.styleBadgeText, { color: theme.text }]}>Static</Text>
                  </View>
                )}
                {company.narrationStyleOratoric && (
                  <View style={[styles.styleBadge, { backgroundColor: `${theme.primary}15`, borderColor: theme.primary }]}>
                    <Text style={[styles.styleBadgeText, { color: theme.text }]}>Oratoric</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Verification Documents</Text>
          <TouchableOpacity 
            style={[styles.documentItem, { backgroundColor: `${theme.gray2}15` }]}
            onPress={() => handleOpenDocument(company.companyRegNoPdfUrl)}
          >
            <MaterialIcons name="description" size={20} color={theme.textMuted} />
            <View style={styles.documentDetails}>
              <Text style={[styles.documentLabel, { color: theme.text }]}>Company Registration Document</Text>
              <Text style={[styles.documentNumber, { color: theme.textMuted }]}>{company.companyRegNo}</Text>
            </View>
            <MaterialIcons name="open-in-new" size={20} color={theme.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.documentItem, { backgroundColor: `${theme.gray2}15` }]}
            onPress={() => handleOpenDocument(company.kraPinPdfUrl)}
          >
            <MaterialIcons name="description" size={20} color={theme.textMuted} />
            <View style={styles.documentDetails}>
              <Text style={[styles.documentLabel, { color: theme.text }]}>KRA PIN Document</Text>
              <Text style={[styles.documentNumber, { color: theme.textMuted }]}>{company.kraPin}</Text>
            </View>
            <MaterialIcons name="open-in-new" size={20} color={theme.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sample Files</Text>
          {company.audioSampleURL && (
            <TouchableOpacity 
              style={[styles.documentItem, { backgroundColor: `${theme.gray2}15` }]}
              onPress={() => handleOpenDocument(company.audioSampleURL)}
            >
              <FontAwesome5 name="file-audio" size={20} color={theme.textMuted} />
              <View style={styles.documentDetails}>
                <Text style={[styles.documentLabel, { color: theme.text }]}>Audio Sample</Text>
                <Text style={[styles.documentNumber, { color: theme.textMuted }]}>Open to listen</Text>
              </View>
              <MaterialIcons name="play-circle-filled" size={24} color={theme.primary} />
            </TouchableOpacity>
          )}
          
          {company.pdfURL && (
            <TouchableOpacity 
              style={[styles.documentItem, { backgroundColor: `${theme.gray2}15` }]}
              onPress={() => handleOpenDocument(company.pdfURL)}
            >
              <FontAwesome5 name="file-pdf" size={20} color={theme.textMuted} />
              <View style={styles.documentDetails}>
                <Text style={[styles.documentLabel, { color: theme.text }]}>PDF Sample</Text>
                <Text style={[styles.documentNumber, { color: theme.textMuted }]}>Open to view</Text>
              </View>
              <MaterialIcons name="open-in-new" size={20} color={theme.primary} />
            </TouchableOpacity>
          )}
          
          {company.coverImage && (
            <View style={[styles.imageContainer, { backgroundColor: theme.white }]}>
              <Text style={[styles.documentLabel, { color: theme.text }]}>Cover Image</Text>
              <Image 
                source={{ uri: company.coverImage }} 
                style={styles.coverImage}
                resizeMode="cover"
              />
              <TouchableOpacity 
                style={[styles.viewImageButton, { backgroundColor: theme.primary }]}
                onPress={() => handleOpenDocument(company.coverImage)}
              >
                <Text style={[styles.viewImageButtonText, { color: theme.white }]}>View Full Image</Text>
                <MaterialIcons name="open-in-new" size={20} color={theme.white} />
              </TouchableOpacity>
            </View>
          )}
        </View>
        

        <View style={styles.accountInfo}>
          <View style={styles.statusIndicator}>
            <Text style={[styles.statusLabel, { color: theme.textMuted }]}>Rights Holder:</Text>
            <View style={[styles.statusBadge, company.rightsHolder ? { backgroundColor: `${theme.secondary}15`, borderColor: theme.secondary } : { backgroundColor: `${theme.secondary2}15`, borderColor: theme.secondary2 }]}>
              <Text style={[styles.statusText, { color: theme.text }]}>{company.rightsHolder ? 'Yes' : 'No'}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderAuthorDetails = () => {
    const author = publisherData.publisher;

    return (
      <View style={styles.detailsContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Author Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Full Name:</Text>
            <Text style={styles.infoValue}>{author.fullName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ID/PP Number:</Text>
            <Text style={styles.infoValue}>{author.idppNo}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>KRA PIN:</Text>
            <Text style={styles.infoValue}>{author.kraPin}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Writers Guild No:</Text>
            <Text style={styles.infoValue}>{author.writersGuildNo || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Telephone:</Text>
            <Text style={styles.infoValue}>{author.telephone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Address:</Text>
            <Text style={styles.infoValue}>{author.address}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Book Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Title:</Text>
            <Text style={styles.infoValue}>{author.title}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Language:</Text>
            <Text style={styles.infoValue}>{author.language}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Category:</Text>
            <Text style={styles.infoValue}>{author.categories}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ISBN/DOI/ISRC:</Text>
            <Text style={styles.infoValue}>{author.ISBNDOIISRC}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Publication Date:</Text>
            <Text style={styles.infoValue}>{new Date(author.date).toLocaleDateString()}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Synopsis</Text>
          <View style={styles.synopsisContainer}>
            <Text style={styles.synopsisText}>{author.synopsis}</Text>
          </View>
        </View>

        {author.narrator && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Narration Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Narrator:</Text>
              <Text style={styles.infoValue}>{author.narrator}</Text>
            </View>
            <View style={styles.narratorStyles}>
              <Text style={styles.infoLabel}>Narration Style:</Text>
              <View style={styles.stylesContainer}>
                {author.narrationStyleSlow && (
                  <View style={styles.styleBadge}>
                    <Text style={styles.styleBadgeText}>Slow</Text>
                  </View>
                )}
                {author.narrationStyleFast && (
                  <View style={styles.styleBadge}>
                    <Text style={styles.styleBadgeText}>Fast</Text>
                  </View>
                )}
                {author.narrationStyleIntimate && (
                  <View style={styles.styleBadge}>
                    <Text style={styles.styleBadgeText}>Intimate</Text>
                  </View>
                )}
                {author.narrationStyleCasual && (
                  <View style={styles.styleBadge}>
                    <Text style={styles.styleBadgeText}>Casual</Text>
                  </View>
                )}
                {author.narrationStyleStatic && (
                  <View style={styles.styleBadge}>
                    <Text style={styles.styleBadgeText}>Static</Text>
                  </View>
                )}
                {author.narrationStyleOratoric && (
                  <View style={styles.styleBadge}>
                    <Text style={styles.styleBadgeText}>Oratoric</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Verification Documents</Text>
          <TouchableOpacity 
            style={[styles.documentItem, { backgroundColor: `${theme.gray2}15` }]}
            onPress={() => handleOpenDocument(author.idppPdfUrl)}
          >
            <MaterialIcons name="description" size={20} color={theme.textMuted} />
            <View style={styles.documentDetails}>
              <Text style={[styles.documentLabel, { color: theme.text }]}>ID/Passport Document</Text>
              <Text style={[styles.documentNumber, { color: theme.textMuted }]}>{author.idppNo}</Text>
            </View>
            <MaterialIcons name="open-in-new" size={20} color={theme.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.documentItem, { backgroundColor: `${theme.gray2}15` }]}
            onPress={() => handleOpenDocument(author.kraPinPdfUrl)}
          >
            <MaterialIcons name="description" size={20} color={theme.textMuted} />
            <View style={styles.documentDetails}>
              <Text style={[styles.documentLabel, { color: theme.text }]}>KRA PIN Document</Text>
              <Text style={[styles.documentNumber, { color: theme.textMuted }]}>{author.kraPin}</Text>
            </View>
            <MaterialIcons name="open-in-new" size={20} color={theme.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sample Files</Text>
          {author.audioSampleURL && (
            <TouchableOpacity 
              style={[styles.documentItem, { backgroundColor: `${theme.gray2}15` }]}
              onPress={() => handleOpenDocument(author.audioSampleURL)}
            >
              <FontAwesome5 name="file-audio" size={20} color={theme.textMuted} />
              <View style={styles.documentDetails}>
                <Text style={[styles.documentLabel, { color: theme.text }]}>Audio Sample</Text>
                <Text style={[styles.documentNumber, { color: theme.textMuted }]}>Open to listen</Text>
              </View>
              <MaterialIcons name="play-circle-filled" size={24} color={theme.primary} />
            </TouchableOpacity>
          )}
          
          {author.pdfURL && (
            <TouchableOpacity 
              style={[styles.documentItem, { backgroundColor: `${theme.gray2}15` }]}
              onPress={() => handleOpenDocument(author.pdfURL)}
            >
              <FontAwesome5 name="file-pdf" size={20} color={theme.textMuted} />
              <View style={styles.documentDetails}>
                <Text style={[styles.documentLabel, { color: theme.text }]}>PDF Sample</Text>
                <Text style={[styles.documentNumber, { color: theme.textMuted }]}>Open to view</Text>
              </View>
              <MaterialIcons name="open-in-new" size={20} color={theme.primary} />
            </TouchableOpacity>
          )}
          
          {author.coverImage && (
            <View style={[styles.imageContainer, { backgroundColor: theme.white }]}>
              <Text style={[styles.documentLabel, { color: theme.text }]}>Cover Image</Text>
              <Image 
                source={{ uri: author.coverImage }} 
                style={styles.coverImage}
                resizeMode="cover"
              />
              <TouchableOpacity 
                style={[styles.viewImageButton, { backgroundColor: theme.primary }]}
                onPress={() => handleOpenDocument(author.coverImage)}
              >
                <Text style={[styles.viewImageButtonText, { color: theme.white }]}>View Full Image</Text>
                <MaterialIcons name="open-in-new" size={20} color={theme.white} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.accountInfo}>
          <View style={styles.statusIndicator}>
            <Text style={[styles.statusLabel, { color: theme.textMuted }]}>Rights Holder:</Text>
            <View style={[styles.statusBadge, author.rightsHolder ? { backgroundColor: `${theme.secondary}15`, borderColor: theme.secondary } : { backgroundColor: `${theme.secondary2}15`, borderColor: theme.secondary2 }]}>
              <Text style={[styles.statusText, { color: theme.text }]}>{author.rightsHolder ? 'Yes' : 'No'}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderRejectModal = () => (
    <Modal
      visible={showRejectModal}
      transparent
      animationType="slide"
      onRequestClose={handleRejectModalCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Reject publisher</Text>
            <TouchableOpacity onPress={handleRejectModalCancel} style={styles.modalCloseButton} disabled={isRejectSubmitting}>
              <Ionicons name="close" size={24} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Text style={styles.modalDescription}>
              Enter the reason for rejection. This text is emailed to the publisher as the main message body.
            </Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Message to publisher</Text>
              <TextInput
                style={[styles.textInput, styles.textAreaInput, styles.rejectMessageInput]}
                value={rejectMessage}
                onChangeText={setRejectMessage}
                placeholder="Explain why this application cannot be approved…"
                placeholderTextColor="#64748B"
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                maxLength={8000}
                editable={!isRejectSubmitting}
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={handleRejectModalCancel}
              disabled={isRejectSubmitting}
            >
              <Text style={styles.modalCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalSubmitButton, { backgroundColor: theme.secondary2 }]}
              onPress={handleSubmitRejection}
              disabled={isRejectSubmitting}
            >
              {isRejectSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <MaterialIcons name="email" size={20} color="white" />
                  <Text style={styles.modalSubmitButtonText}>Send email</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={[defaultStyles.container, styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.gray2 }]}>
        <TouchableOpacity onPress={handleGoBack} style={[styles.backButton, { backgroundColor: `${theme.gray2}15` }]}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {isCompanyBoolean ? 'Company Details' : 'Author Details'}
        </Text>
        <View style={styles.placeholderView} />
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textMuted }]}>Loading publisher details...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <FontAwesome5 name="exclamation-circle" size={50} color={theme.secondary2} />
          <Text style={[styles.errorText, { color: theme.secondary2 }]}>{error}</Text>
          <TouchableOpacity style={[styles.retryButton, { backgroundColor: theme.primary }]} onPress={() => router.back()}>
            <Text style={[styles.retryButtonText, { color: theme.white }]}>Go Back</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.primary]}
              tintColor={theme.primary}
              title="Pull to refresh"
              titleColor={theme.textMuted}
            />
          }
        >
          <View style={[styles.publisherHeader, { borderBottomColor: theme.gray2 }]}>
            <View style={[styles.publisherIconContainer, { backgroundColor: theme.primary }]}>
              {isCompanyBoolean ? (
                <FontAwesome5 name="building" size={30} color={theme.white} />
              ) : (
                <FontAwesome5 name="user" size={30} color={theme.white} />
              )}
            </View>
            <View style={styles.publisherBasicInfo}>
              <Text style={[styles.publisherName, { color: theme.text }]}>
                {isCompanyBoolean ? publisherData.companyName : publisherData.fullName}
              </Text>
              <View style={styles.publisherMeta}>
                <Text style={[styles.publisherType, { color: theme.textMuted }]}>
                  {isCompanyBoolean ? 'Publishing Company' : 'Independent Author'}
                </Text>
                <View style={styles.verificationStatus}>
                  {publisherData.isVerified ? (
                    <>
                      <FontAwesome5 name="check-circle" size={14} color={theme.secondary} />
                      <Text style={[styles.verifiedText, { color: theme.secondary }]}>Verified</Text>
                    </>
                  ) : (
                    <>
                      <FontAwesome5 name="clock" size={14} color={theme.tertiary} />
                      <Text style={[styles.pendingText, { color: theme.tertiary }]}>Pending Verification</Text>
                    </>
                  )}
                </View>
              </View>
            </View>
          </View>

          {isCompanyBoolean ? renderCompanyDetails() : renderAuthorDetails()}
          
          {!publisherData.isVerified && (
            <View style={styles.actionButtonsContainer}>
              <View style={styles.firstRowButtons}>
                <TouchableOpacity style={[styles.rejectButton, { backgroundColor: theme.secondary2 }]} onPress={handleRejectPublisher}>
                  <MaterialIcons name="close" size={20} color={theme.white} />
                  <Text style={[styles.buttonText, { color: theme.white }]}>Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.sampleAudioButton, { backgroundColor: theme.tertiary }]} 
                  onPress={() => handleSendSampleAudio(id)}
                  disabled={sampleAudioRunning}
                >
                  <MaterialIcons name="audiotrack" size={20} color={theme.white} />
                  <Text style={[styles.buttonText, { color: theme.white }]}>
                    {sampleAudioRunning ? 'Generating…' : 'Sample Audio'}
                  </Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity 
                style={[styles.fullAudioButton, { backgroundColor: theme.primary }]} 
                onPress={() => handleGenerateFullAudio(id)}
                disabled={fullAudioRunning}
              >
                <MaterialIcons name="library-music" size={20} color={theme.white} />
                <Text style={[styles.buttonText, { color: theme.white }]}>
                  {fullAudioRunning ? 'Generating…' : 'Generate Full Audio'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.verifyButton, { backgroundColor: theme.primary, opacity: isSubmitting ? 0.7 : 1 }]}
                onPress={handleVerifyPublisher}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color={theme.white} />
                ) : (
                  <MaterialIcons name="verified" size={20} color={theme.white} />
                )}
                <Text style={[styles.buttonText, { color: theme.white }]}>
                  {isSubmitting ? 'Verifying…' : 'Verify Publisher'}
                </Text>
              </TouchableOpacity>
             
            </View>
          )}
        </ScrollView>
      )}

      {renderRejectModal()}

      {audioJobVisible && (
        <View pointerEvents="box-none" style={styles.audioProgressContainer}>
          <View style={[styles.audioProgressCard, { backgroundColor: theme.white }]}>
            {audioJobStatus === 'running' ? (
              <ActivityIndicator size="small" color={theme.primary} />
            ) : null}
            <Text style={[styles.audioProgressTitle, { color: theme.text }]}>{audioJobTitle}</Text>
            {audioJobDetail ? (
              <Text style={[styles.audioProgressDetail, { color: theme.textMuted }]}>{audioJobDetail}</Text>
            ) : null}
            {(audioJobStatus === 'completed' || audioJobStatus === 'failed') && (
              <TouchableOpacity onPress={() => setAudioJobVisible(false)} style={styles.audioProgressCloseButton}>
                <Text style={[styles.audioProgressCloseText, { color: theme.white }]}>Dismiss</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    // backgroundColor removed - now using theme
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    // borderBottomColor removed - now using theme
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    // backgroundColor removed - now using theme
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    // color removed - now using theme
  },
  placeholderView: {
    width: 40, // To balance the header
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    // color removed - now using theme
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    // color removed - now using theme
    fontSize: 18,
    fontWeight: '500',
    marginTop: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    // backgroundColor removed - now using theme
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  retryButtonText: {
    // color removed - now using theme
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  publisherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    // borderBottomColor removed - now using theme
  },
  publisherIconContainer: {
    // backgroundColor removed - now using theme
    padding: 16,
    borderRadius: 16,
    marginRight: 16,
  },
  publisherBasicInfo: {
    flex: 1,
  },
  publisherName: {
    fontSize: 24,
    fontWeight: 'bold',
    // color removed - now using theme
    marginBottom: 4,
  },
  publisherMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  publisherType: {
    fontSize: 14,
    // color removed - now using theme
  },
  verificationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedText: {
    // color removed - now using theme
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
  },
  pendingText: {
    // color removed - now using theme
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
  },
  detailsContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    // color removed - now using theme
    marginBottom: 12,
    borderLeftWidth: 3,
    // borderLeftColor removed - now using theme
    paddingLeft: 10,
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    // borderBottomColor removed - now using theme
  },
  infoLabel: {
    width: '40%',
    fontSize: 14,
    // color removed - now using theme
    fontWeight: '500',
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    // color removed - now using theme
  },
  synopsisContainer: {
    // backgroundColor removed - now using theme
    borderRadius: 8,
    padding: 12,
  },
  synopsisText: {
    // color removed - now using theme
    fontSize: 14,
    lineHeight: 20,
  },
  narratorStyles: {
    marginTop: 8,
  },
  stylesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  styleBadge: {
    // backgroundColor removed - now using theme
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    // borderColor removed - now using theme
  },
  styleBadgeText: {
    // color removed - now using theme
    fontSize: 12,
    fontWeight: '500',
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor removed - now using theme
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  documentDetails: {
    flex: 1,
    marginLeft: 12,
  },
  documentLabel: {
    fontSize: 14,
    // color removed - now using theme
    fontWeight: '500',
  },
  documentNumber: {
    fontSize: 12,
    // color removed - now using theme
    marginTop: 2,
  },
  accountInfo: {
    marginBottom: 24,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusLabel: {
    fontSize: 14,
    color: '#94A3B8',
    marginRight: 8,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: 'rgba(52, 211, 153, 0.2)',
    borderWidth: 1,
    borderColor: '#34D399',
  },
  statusInactive: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  actionButtonsContainer: {
    padding: 20,
    gap: 12,
  },
  firstRowButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  verifyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor removed - now using theme
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor removed - now using theme
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  sampleAudioButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor removed - now using theme
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  fullAudioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor removed - now using theme
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  buttonText: {
    // color removed - now using theme
    fontSize: 16,
    fontWeight: '600',
  },
  imageContainer: {
    marginTop: 15,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#1E293B',
    padding: 15,
  },
  coverImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginVertical: 10,
  },
  viewImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  viewImageButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginRight: 8,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },

    shadowRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E2E8F0',
  },
  modalCloseButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalContent: {
    padding: 20,
    maxHeight: 400,
  },
  modalDescription: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E2E8F0',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#E2E8F0',
    minHeight: 44,
  },
  textAreaInput: {
    minHeight: 80,
    paddingTop: 12,
  },
  rejectMessageInput: {
    minHeight: 160,
  },
  durationPreview: {
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(79, 70, 229, 0.3)',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    alignItems: 'center',
  },
  durationPreviewText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94A3B8',
  },
  modalSubmitButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  modalSubmitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  audioProgressContainer: {
    position: 'absolute',
    right: 16,
    bottom: 88,
    left: 16,
    alignItems: 'flex-end',
    zIndex: 30,
  },
  audioProgressCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 16,
    padding: 16,
    alignItems: 'flex-start',
    gap: 10,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  audioProgressTitle: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  audioProgressDetail: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'left',
  },
  audioProgressCloseButton: {
    marginTop: 6,
    alignSelf: 'flex-end',
    backgroundColor: '#4F46E5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  audioProgressCloseText: {
    fontSize: 12,
    fontWeight: '700',
  },
});

export default PublisherDetails;




[{"chapterHeading":"Opening: Prologue","segmentLabel":"[SEGMENT 1]","ssml":"<speak><prosody rate=\"96%\">The First Betrayal. <break time=\"400ms\"/> Agnes Mwelu Mugenya. <break time=\"700ms\"/> Prologue. <break time=\"700ms\"/> I watch frozen with shock as the manor — my whole life — engulfs in flames. I cling tighter to my teddy bear while police and firefighters from both sides arrive. Tears are streaking down my face while I try my best not to have a meltdown. I feel a tap on my shoulder. I turn around to find Aunt Julie, my mother’s best friend, sad face staring back at me. <break time=\"400ms\"/> She says nothing as she stretches her arms wide open to welcome me in. I don’t waste a second. I run into her open arms finally crumbling down while she calmly soothes me, caressing my hair. <break time=\"400ms\"/> “They didn’t make it out in time,” I whimper, wiping my tears with the back of my silk sleeping gown sleeve. She gives me a sad smile releasing me from the embrace enough for me to see her face. She tilts my chin up one hand on my shoulder. Her warm chocolate eyes now glistening with tears. <break time=\"400ms\"/> “No, they didn’t because... saving you was their first priority honey. Since they loved you Violet,” she whispers, as if she was there with us when the ceiling collapsed, her voice cracking as tears fall down her face. <break time=\"400ms\"/> “Why did they have to love me so much? I miss them. Now they’re gone,” I sob fresh tears cascading down my face. She pulls me in again and I can feel her tears in my hair as she hugs me.</prosody></speak>"}]