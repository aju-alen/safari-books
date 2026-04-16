import textToSpeech from '@google-cloud/text-to-speech';
import dotenv from "dotenv";
dotenv.config();

const sanitizeSsml = (rawSsml = '') => {
  const cleaned = rawSsml
    .replace(/```xml|```ssml|```/gi, '')
    .replace(/<\?xml[^>]*\?>/gi, '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .trim();

  const wrapped = cleaned.startsWith('<speak>') ? cleaned : `<speak>${cleaned}</speak>`;

  // Escape bare ampersands so malformed XML does not fail validation.
  return wrapped.replace(/&(?!amp;|lt;|gt;|quot;|apos;|#\d+;)/g, '&amp;');
};

const buildTtsInput = (text = '') => {
  const normalized = typeof text === 'string' ? text.trim() : '';
  if (normalized.startsWith('<speak>') || normalized.includes('</speak>')) {
    return { ssml: sanitizeSsml(normalized) };
  }
  return { text: normalized };
};

const clamp = (value, min, max, fallback) => {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
};

const PREFERRED_VOICES_BY_LANGUAGE = {
  'en-US': {
    FEMALE: ['en-US-Studio-O', 'en-US-Neural2-F', 'en-US-Neural2-C'],
    MALE: ['en-US-Studio-M', 'en-US-Neural2-D', 'en-US-Neural2-I']
  },
  'en-GB': {
    FEMALE: ['en-GB-Neural2-A', 'en-GB-News-G'],
    MALE: ['en-GB-Neural2-B', 'en-GB-News-J']
  }
};

const normalizeGender = (gender) => {
  const normalized = String(gender || '').toUpperCase();
  if (normalized.includes('FEMALE')) return 'FEMALE';
  if (normalized.includes('MALE')) return 'MALE';
  return 'NEUTRAL';
};

const buildVoiceAttempts = ({ languageCode, ssmlGender, requestedVoiceName }) => {
  const attempts = [];
  const normalizedGender = normalizeGender(ssmlGender);

  if (requestedVoiceName) {
    attempts.push({ languageCode, ssmlGender, name: requestedVoiceName });
  }

  const preferred = PREFERRED_VOICES_BY_LANGUAGE[languageCode]?.[normalizedGender] || [];
  for (const voiceName of preferred) {
    if (voiceName !== requestedVoiceName) {
      attempts.push({ languageCode, ssmlGender, name: voiceName });
    }
  }

  // Last fallback lets Google auto-pick a compatible voice for the locale.
  attempts.push({ languageCode, ssmlGender });

  return attempts;
};

export const googleTtsConvert = async (text, narrationSampleHeartzRate, narrationSpeakingRate, narrationGender, narrationLanguageCode, narrationVoiceName) => {
  const client = new textToSpeech.TextToSpeechClient({
    projectId: 'safari-books',
    credentials: {
        client_email: process.env.GOOGLE_TTS_EMAIL,
        private_key: process.env.GOOGLE_TTS_PRIVATE_KEY.replace(/\\n/g, '\n')
    }
  });

  const ttsInput = buildTtsInput(text);
  const requestedVoice = {
    languageCode: narrationLanguageCode,
    ssmlGender: narrationGender,
    name: narrationVoiceName
  };
  const voiceAttempts = buildVoiceAttempts({
    languageCode: narrationLanguageCode,
    ssmlGender: narrationGender,
    requestedVoiceName: narrationVoiceName
  });
  const speakingRate = clamp(narrationSpeakingRate, 0.85, 1.1, 0.96);
  const pitch = clamp(process.env.GOOGLE_TTS_PITCH, -2, 2, 0.3);
  const audioConfig = {
    audioEncoding: 'MP3',
    speakingRate,
    pitch,
    volumeGainDb: 0.6,
    sampleRateHertz: narrationSampleHeartzRate,
    effectsProfileId: ['headphone-class-device']
  };

  const buildFallbackAudioConfig = () => ({
    audioEncoding: 'MP3',
    speakingRate,
    volumeGainDb: 0.6,
    effectsProfileId: ['headphone-class-device']
  });

  let lastError = null;
  for (const voice of voiceAttempts) {
    try {
      return await client.synthesizeSpeech({
        input: ttsInput,
        voice,
        audioConfig
      });
    } catch (error) {
      lastError = error;

      if (error?.code !== 3) {
        throw error;
      }

      console.error('Google TTS INVALID_ARGUMENT diagnostics:', {
        hasSsmlInput: Boolean(ttsInput.ssml),
        ssmlPreview: ttsInput.ssml ? ttsInput.ssml.slice(0, 300) : null,
        textPreview: ttsInput.text ? ttsInput.text.slice(0, 300) : null,
        requestedLanguageCode: requestedVoice.languageCode,
        requestedVoiceName: requestedVoice.name,
        attemptedVoiceName: voice.name || '(auto)',
        ssmlGender: voice.ssmlGender,
        speakingRate: audioConfig.speakingRate,
        pitch: audioConfig.pitch,
        sampleRateHertz: audioConfig.sampleRateHertz,
        errorDetails: error?.details || null
      });

      try {
        // Retry same voice with safer audio config because some voices reject pitch/sample rate.
        return await client.synthesizeSpeech({
          input: ttsInput,
          voice,
          audioConfig: buildFallbackAudioConfig()
        });
      } catch (fallbackError) {
        lastError = fallbackError;
      }
    }
  }

  throw lastError;
}