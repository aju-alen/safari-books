import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, Text, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import { ipURL } from '@/utils/backendURL';
import { useTheme } from '@/providers/ThemeProvider';
import AudioPlayer from '@/components/AudioPlayerModal';
import { moderateScale } from '@/utils/responsiveSize';

function PlayError({
  message,
  onBack,
  theme,
}: {
  message: string;
  onBack: () => void;
  theme: { background: string; text: string; primary: string };
}) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.background,
        paddingHorizontal: 24,
      }}
    >
      <Text
        style={{
          color: theme.text,
          fontSize: moderateScale(16),
          textAlign: 'center',
          marginBottom: 20,
        }}
      >
        {message}
      </Text>
      <TouchableOpacity onPress={onBack} accessibilityRole="button">
        <Text style={{ color: theme.primary, fontSize: moderateScale(16), fontWeight: '600' }}>
          Go back
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default function PlayBookScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { bookId, source } = useLocalSearchParams<{ bookId: string; source?: string }>();
  const id = (Array.isArray(bookId) ? bookId[0] : bookId) ?? '';
  const sourceFlag = Array.isArray(source) ? source[0] : source;
  const [book, setBook] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const resp = await axios.get(`${ipURL}/api/listeners/book-data/${id}`);
        if (!cancelled) setBook(resp.data);
      } catch (e) {
        console.error(e);
        if (!cancelled) setBook(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.background,
        }}
      >
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!id) {
    return <PlayError message="Missing book." onBack={() => router.back()} theme={theme} />;
  }

  if (!book) {
    return (
      <PlayError message="Could not load this book." onBack={() => router.back()} theme={theme} />
    );
  }

  const sampleUrl =
    (book.sampleAudioUrl as string) ||
    (book.sampleAudioURL as string) ||
    '';
  const fullUrl = (book.completeAudioUrl as string) || '';
  const audioUrl = sourceFlag === 'sample' ? sampleUrl : fullUrl;

  if (!audioUrl) {
    return (
      <PlayError
        message="No audio is available for this title."
        onBack={() => router.back()}
        theme={theme}
      />
    );
  }

  return (
    <AudioPlayer
      onClose={() => router.back()}
      audioUrl={audioUrl}
      bookCover={book.coverImage as string}
      title={book.title as string}
      author={book.authorName as string}
      authorAvatar={(book.authorAvatar as string) || (book.coverImage as string)}
      bookId={id}
      timeStamp={(book.timeStamp as unknown[]) || []}
      language={book.language as string}
      rating={book.rating as number}
    />
  );
}
