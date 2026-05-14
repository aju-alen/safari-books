import { defaultStyles } from '@/styles';
import { ipURL } from '@/utils/backendURL';
import { axiosWithAuth } from '@/utils/customAxios';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/providers/ThemeProvider';

type AudioProgressItem = {
  key: string;
  jobType: 'sample' | 'full' | string;
  publisherId: string;
  isCompany: boolean;
  status: 'running' | 'completed' | 'failed' | string;
  phase: string;
  message: string;
  current?: number | null;
  total?: number | null;
  progressPercent?: number;
  resultUrl?: string | null;
  errorMessage?: string | null;
  startedAt?: string;
  updatedAt?: string;
  completedAt?: string | null;
};

const statusColor = (status: string) => {
  if (status === 'completed') return '#22C55E';
  if (status === 'failed') return '#EF4444';
  return '#3B82F6';
};

const ProgressScreen = () => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [jobs, setJobs] = useState<AudioProgressItem[]>([]);

  const loadProgress = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const response = await axiosWithAuth.get(`${ipURL}/api/admin/audio-progress`);
      setJobs(Array.isArray(response.data?.jobs) ? response.data.jobs : []);
    } catch (error) {
      console.error('Failed to load audio progress:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  useEffect(() => {
    const hasRunning = jobs.some((job) => job.status === 'running');
    if (!hasRunning) return undefined;
    const timer = setInterval(() => {
      loadProgress(true);
    }, 1500);
    return () => clearInterval(timer);
  }, [jobs, loadProgress]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProgress(true);
    setRefreshing(false);
  }, [loadProgress]);

  const runningCount = useMemo(() => jobs.filter((job) => job.status === 'running').length, [jobs]);

  return (
    <SafeAreaView style={[defaultStyles.container, styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.gray2 }]}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: theme.white }]}>
          <Ionicons name="arrow-back" size={20} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Progress</Text>
          <Text style={[styles.headerSubtitle, { color: theme.textMuted }]}>
            {runningCount} running · {jobs.length} tracked
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.primary]}
              tintColor={theme.primary}
            />
          }
        >
          {jobs.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: theme.white }]}>
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>No audio progress data yet.</Text>
            </View>
          ) : (
            jobs.map((job) => {
              const pct = Math.max(0, Math.min(100, Number(job.progressPercent ?? 0)));
              const badgeColor = statusColor(job.status);
              return (
                <View key={job.key} style={[styles.card, { backgroundColor: theme.white, borderColor: theme.gray2 }]}>
                  <View style={styles.rowTop}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>
                      {job.jobType === 'sample' ? 'Sample Audio' : 'Full Audio'} · {job.isCompany ? 'Company' : 'Author'}
                    </Text>
                    <View style={[styles.badge, { backgroundColor: `${badgeColor}22`, borderColor: badgeColor }]}>
                      <Text style={[styles.badgeText, { color: badgeColor }]}>{job.status.toUpperCase()}</Text>
                    </View>
                  </View>

                  <Text style={[styles.message, { color: theme.textMuted }]}>{job.message || job.phase || 'Working…'}</Text>

                  <View style={[styles.progressTrack, { backgroundColor: theme.gray2 }]}>
                    <View style={[styles.progressBar, { backgroundColor: badgeColor, width: `${Math.max(4, pct)}%` }]} />
                  </View>

                  <View style={styles.rowMeta}>
                    <Text style={[styles.metaText, { color: theme.textMuted }]}>
                      {pct}% {Number.isFinite(job.current) && Number.isFinite(job.total) ? `· packet ${job.current}/${job.total}` : ''}
                    </Text>
                    <Text style={[styles.metaText, { color: theme.textMuted }]}>{job.publisherId}</Text>
                  </View>

                  {!!job.resultUrl && (
                    <TouchableOpacity
                      style={[styles.linkBtn, { backgroundColor: theme.primary }]}
                      onPress={() => router.push({ pathname: '/(admin)/publisherDetails/singleData', params: { id: job.publisherId, isCompany: String(job.isCompany) } })}
                    >
                      <MaterialIcons name="open-in-new" size={16} color={theme.white} />
                      <Text style={[styles.linkBtnText, { color: theme.white }]}>Open Publisher</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {},
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  backButton: {
    padding: 8,
    borderRadius: 10
  },
  headerTitleWrap: {
    flex: 1
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700'
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2
  },
  loaderWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  content: {
    flex: 1,
    padding: 14
  },
  emptyCard: {
    borderRadius: 12,
    padding: 20
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10
  },
  cardTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700'
  },
  badge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700'
  },
  message: {
    marginTop: 8,
    fontSize: 13
  },
  progressTrack: {
    marginTop: 10,
    borderRadius: 999,
    height: 8,
    overflow: 'hidden'
  },
  progressBar: {
    height: '100%'
  },
  rowMeta: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8
  },
  metaText: {
    fontSize: 11
  },
  linkBtn: {
    marginTop: 10,
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  linkBtnText: {
    fontSize: 12,
    fontWeight: '600'
  }
});

export default ProgressScreen;
