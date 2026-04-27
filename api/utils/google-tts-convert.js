import fetch from 'node-fetch';
import dotenv from "dotenv";
dotenv.config();

const OPENAI_TTS_URL = 'https://api.openai.com/v1/audio/speech';
const OPENAI_TTS_MODEL = process.env.OPENAI_TTS_MODEL || 'gpt-4o-mini-tts';
/** OpenAI speech `input` max length (characters). */
const OPENAI_TTS_INPUT_MAX = 4096;
/**
 * Split target for multi-request TTS when plain text exceeds this (env override, capped at API max).
 * Default 3800 leaves margin under 4096.
 */
const openAiTtsInputChunkSize = () => {
  const raw = parseInt(process.env.OPENAI_TTS_INPUT_CHUNK_CHARS || '3800', 10);
  if (Number.isNaN(raw) || raw < 256) return 3800;
  return Math.min(raw, OPENAI_TTS_INPUT_MAX);
};

/**
 * Split plain TTS input into slices ≤ maxLen, preferring sentence boundaries.
 */
const splitPlainTextForTts = (plain, maxLen) => {
  const text = String(plain || '').trim();
  if (!text) return [];
  if (text.length <= maxLen) return [text];

  const chunks = [];
  const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
  let buf = '';

  const flushBuf = () => {
    const t = buf.trim();
    if (t) chunks.push(t);
    buf = '';
  };

  const pushHardSlices = (long) => {
    let rest = long.trim();
    while (rest.length > maxLen) {
      let cut = maxLen;
      const space = rest.lastIndexOf(' ', maxLen);
      if (space > maxLen * 0.55) cut = space;
      chunks.push(rest.slice(0, cut).trim());
      rest = rest.slice(cut).trim();
    }
    if (rest) buf = buf ? `${buf} ${rest}` : rest;
  };

  for (const sentence of sentences) {
    const s = sentence.trim();
    if (!s) continue;

    if (s.length > maxLen) {
      flushBuf();
      pushHardSlices(s);
      continue;
    }

    const next = buf ? `${buf} ${s}` : s;
    if (next.length <= maxLen) {
      buf = next;
    } else {
      flushBuf();
      buf = s;
    }
  }
  flushBuf();
  return chunks.filter(Boolean);
};
const OPENAI_ALLOWED_VOICES = new Set([
  'alloy', 'ash', 'ballad', 'coral', 'echo', 'fable', 'onyx', 'nova', 'sage', 'shimmer',
  'verse', 'marin', 'cedar'
]);
const OPENAI_RESPONSE_FORMATS = new Set(['mp3', 'opus', 'aac', 'flac', 'wav', 'pcm']);
const LEGACY_SAMPLE_RATE_KEYS = new Set(['22050', '44100']);
const OUTPUT_FORMAT_HINTS = {
  mp3: 'MP3 (default, general purpose)',
  opus: 'Opus (streaming, low latency)',
  aac: 'AAC (mobile / compressed)',
  flac: 'FLAC (lossless archive)',
  wav: 'WAV (uncompressed, low decode overhead)',
  pcm: 'PCM (raw 24kHz 16-bit LE samples, no header)'
};
const LEGACY_HZ_HINTS = {
  '22050': '22.05kHz-class playback (output still encoded per format)',
  '44100': '44.1kHz-class playback (output still encoded per format)'
};

const sanitizeText = (raw = '') =>
  String(raw || '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const ssmlToPlainText = (ssml = '') =>
  sanitizeText(
    String(ssml || '')
      .replace(/```xml|```ssml|```/gi, '')
      .replace(/<\?xml[^>]*\?>/gi, '')
      .replace(/<break[^>]*>/gi, ', ')
      .replace(/<\/?prosody[^>]*>/gi, '')
      .replace(/<\/?emphasis[^>]*>/gi, '')
      .replace(/<\/?speak>/gi, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/<[^>]+>/g, '')
  );

const clamp = (value, min, max, fallback) => {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
};

const parseStoredScalar = (raw) => {
  if (raw == null || raw === '') return undefined;
  if (typeof raw === 'number' && !Number.isNaN(raw)) return raw;
  const s = String(raw).trim();
  try {
    return JSON.parse(s);
  } catch {
    return s;
  }
};

const resolveResponseFormat = (rawSampleOrFormat) => {
  const v = parseStoredScalar(rawSampleOrFormat);
  const key = String(v == null ? '' : v).trim().toLowerCase();
  if (OPENAI_RESPONSE_FORMATS.has(key)) return key;
  if (LEGACY_SAMPLE_RATE_KEYS.has(key)) return 'mp3';
  return 'mp3';
};

const outputQualityHint = (rawSampleOrFormat, responseFormat) => {
  const v = parseStoredScalar(rawSampleOrFormat);
  const key = String(v == null ? '' : v).trim().toLowerCase();
  if (OPENAI_RESPONSE_FORMATS.has(key)) return OUTPUT_FORMAT_HINTS[key] || responseFormat;
  if (LEGACY_SAMPLE_RATE_KEYS.has(key)) return LEGACY_HZ_HINTS[key] || OUTPUT_FORMAT_HINTS[responseFormat];
  return OUTPUT_FORMAT_HINTS[responseFormat];
};

const normalizeGender = (gender) => {
  const value = String(gender || '').toUpperCase();
  if (value.includes('FEMALE')) return 'female';
  if (value.includes('MALE')) return 'male';
  return 'neutral';
};

const voiceFromHints = ({ requestedVoiceName, gender, languageCode }) => {
  const normalized = String(requestedVoiceName || '').trim().toLowerCase();
  if (OPENAI_ALLOWED_VOICES.has(normalized)) return normalized;

  const g = normalizeGender(gender);
  const locale = String(languageCode || '').toLowerCase();

  if (g === 'female') {
    if (locale.startsWith('en-gb')) return 'sage';
    if (locale.startsWith('en-au')) return 'shimmer';
    if (locale.startsWith('en-in')) return 'nova';
    return 'coral';
  }

  if (g === 'male') {
    if (locale.startsWith('en-gb')) return 'onyx';
    if (locale.startsWith('en-au')) return 'echo';
    if (locale.startsWith('en-in')) return 'fable';
    return 'ash';
  }

  return process.env.OPENAI_TTS_VOICE || 'alloy';
};

const fetchTtsAudioBuffer = async (apiKey, voice, inputSlice, openAiInstructions, responseFormat) => {
  if (inputSlice.length > OPENAI_TTS_INPUT_MAX) {
    throw new Error(`OpenAI TTS input slice exceeds ${OPENAI_TTS_INPUT_MAX} characters (${inputSlice.length})`);
  }
  const response = await fetch(OPENAI_TTS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: OPENAI_TTS_MODEL,
      voice,
      input: inputSlice,
      response_format: responseFormat,
      instructions: openAiInstructions
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenAI TTS failed (${response.status}): ${errorBody}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
};

export const googleTtsConvert = async (text, narrationSampleHeartzRate, narrationSpeakingRate, narrationGender, narrationLanguageCode, narrationVoiceName) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const plainText = String(text || '').includes('<speak>')
    ? ssmlToPlainText(text)
    : sanitizeText(text);

  if (!plainText) {
    throw new Error('OpenAI TTS input text is empty after sanitization');
  }

  const voice = voiceFromHints({
    requestedVoiceName: narrationVoiceName,
    gender: narrationGender,
    languageCode: narrationLanguageCode
  });
  const rateRaw = parseStoredScalar(narrationSpeakingRate);
  const speakingRate = clamp(rateRaw, 0.8, 1.2, 1);
  const speed = clamp(speakingRate, 0.8, 1.2, 1);
  const targetLocale = narrationLanguageCode || 'en-US';
  const genderLabel = normalizeGender(narrationGender);
  const responseFormat = resolveResponseFormat(narrationSampleHeartzRate);
  const outputHint = outputQualityHint(narrationSampleHeartzRate, responseFormat);
  const openAiInstructions = `Narrate naturally like a human audiobook reader. Speak in ${targetLocale} accent and pronunciation. Voice presentation should sound ${genderLabel}. Keep pacing calm and expressive, with subtle pauses at punctuation. Aim for speaking pace around ${speed} relative to a neutral conversational baseline (slower than 1 is calmer; faster than 1 is brisker). Optimize for ${outputHint}.`;

  const chunkSize = openAiTtsInputChunkSize();
  const slices = splitPlainTextForTts(plainText, chunkSize);
  const buffers = [];
  for (let i = 0; i < slices.length; i++) {
    const buf = await fetchTtsAudioBuffer(apiKey, voice, slices[i], openAiInstructions, responseFormat);
    buffers.push(buf);
  }
  const audioContent = Buffer.concat(buffers);

  // Return Google-compatible shape so existing controller logic remains unchanged.
  return [{ audioContent, responseFormat }];
}