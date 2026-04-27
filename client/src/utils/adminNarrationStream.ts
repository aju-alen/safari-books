import * as SecureStore from 'expo-secure-store';

export type NarrationProgressPayload = {
  phase?: string;
  message?: string;
  current?: number;
  total?: number;
  segmentCount?: number;
};

export const NARRATION_PHASE_TITLE: Record<string, string> = {
  downloading_document: 'Downloading book file',
  parsing_document: 'Extracting text (PDF / EPUB)',
  segments_cached: 'Using saved narration plan',
  generating_segments: 'Generating narration with AI',
  segments_generated: 'Saving narration plan',
  openai_planning: 'Planning AI segment batches',
  openai_segment: 'ChatGPT: building SSML',
  openai_fallback: 'Fallback segmentation',
  synthesizing_audio: 'Text-to-speech (sample)',
  tts_batch_start: 'Preparing full audiobook',
  synthesizing_segment: 'Text-to-speech (full book)',
  uploading: 'Uploading to storage',
};

const formatDetail = (p: NarrationProgressPayload) => {
  const parts: string[] = [];
  if (p.message) parts.push(p.message);
  if (p.current != null && p.total != null) parts.push(`Step ${p.current} / ${p.total}`);
  if (p.segmentCount != null) parts.push(`${p.segmentCount} segments`);
  return parts.join(' · ');
};

/**
 * POSTs to an admin narration endpoint with `stream=1` and reads NDJSON progress lines.
 * Calls onProgress for each `{ type: 'progress', ... }` line; resolves with the `complete` object.
 */
export const postAdminNarrationStream = async (
  urlWithoutStream: string,
  body: Record<string, unknown>,
  onProgress: (humanTitle: string, detail: string, raw: NarrationProgressPayload) => void
): Promise<{ message?: string; audioSampleURL?: string; completeAudioUrl?: string }> => {
  const raw = await SecureStore.getItemAsync('authToken');
  const token = raw ? JSON.parse(raw)?.token : null;
  const joiner = urlWithoutStream.includes('?') ? '&' : '?';
  const url = `${urlWithoutStream}${joiner}stream=1`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/x-ndjson',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    try {
      const j = JSON.parse(text) as { message?: string; error?: string };
      throw new Error(String(j.message || j.error || text || `Request failed (${res.status})`));
    } catch (e) {
      if (e instanceof SyntaxError) {
        throw new Error(text || `Request failed (${res.status})`);
      }
      throw e;
    }
  }

  const reader = res.body?.getReader();
  if (!reader) {
    onProgress(
      'Streaming unavailable on device',
      'Reading full response from the same request. Live progress may be delayed.',
      { phase: 'streaming_unavailable' }
    );

    const fullText = await res.text();
    const lines = fullText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    let lastComplete: { message?: string; audioSampleURL?: string; completeAudioUrl?: string } | null = null;
    let lastJson: { message?: string; error?: string; audioSampleURL?: string; completeAudioUrl?: string } | null = null;

    for (const line of lines) {
      try {
        const obj = JSON.parse(line) as {
          type?: string;
          message?: string;
          error?: string;
          audioSampleURL?: string;
          completeAudioUrl?: string;
        };
        lastJson = obj;
        if (obj.type === 'error') {
          throw new Error(obj.message || obj.error || 'Narration job failed');
        }
        if (obj.type === 'complete') {
          lastComplete = {
            message: obj.message,
            audioSampleURL: obj.audioSampleURL,
            completeAudioUrl: obj.completeAudioUrl,
          };
        }
      } catch {
        // Ignore non-JSON lines and continue scanning for complete/error events.
      }
    }

    if (!res.ok) {
      throw new Error(String(lastJson?.message || lastJson?.error || fullText || `Request failed (${res.status})`));
    }

    if (lastComplete) {
      return lastComplete;
    }

    if (fullText) {
      try {
        const parsed = JSON.parse(fullText) as { message?: string; error?: string; audioSampleURL?: string; completeAudioUrl?: string };
        return {
          message: parsed.message,
          audioSampleURL: parsed.audioSampleURL,
          completeAudioUrl: parsed.completeAudioUrl,
        };
      } catch {
        // Fall through to final error.
      }
    }

    throw new Error('Server ended without a completion message.');
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let lastComplete: { message?: string; audioSampleURL?: string; completeAudioUrl?: string } | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      if (!line.trim()) continue;
      const obj = JSON.parse(line) as {
        type?: string;
        phase?: string;
        message?: string;
        current?: number;
        total?: number;
        segmentCount?: number;
        audioSampleURL?: string;
        completeAudioUrl?: string;
      };
      if (obj.type === 'progress') {
        const rawPayload: NarrationProgressPayload = {
          phase: obj.phase,
          message: obj.message,
          current: obj.current,
          total: obj.total,
          segmentCount: obj.segmentCount,
        };
        const title = (obj.phase && NARRATION_PHASE_TITLE[obj.phase]) || obj.phase || 'Working…';
        onProgress(title, formatDetail(rawPayload), rawPayload);
      } else if (obj.type === 'complete') {
        lastComplete = {
          message: obj.message,
          audioSampleURL: obj.audioSampleURL,
          completeAudioUrl: obj.completeAudioUrl,
        };
      } else if (obj.type === 'error') {
        throw new Error((obj as { message?: string }).message || 'Narration job failed');
      }
    }
  }

  if (buffer.trim()) {
    const obj = JSON.parse(buffer) as { type?: string; message?: string };
    if (obj.type === 'error') throw new Error(obj.message || 'Narration job failed');
    if (obj.type === 'complete') {
      lastComplete = obj as typeof lastComplete;
    }
  }

  if (!lastComplete) {
    throw new Error('Server ended without a completion message.');
  }
  return lastComplete;
};
