import fetch from 'node-fetch';
import { splitTextIntoChunks } from './splitTextToChunk.js';

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const OPENAI_TIMEOUT_MS = Number(process.env.OPENAI_SEGMENT_TIMEOUT_MS || 120000);

const systemPrompt = `You convert book text (from PDF or EPUB extraction) into clean audiobook-ready SSML segments.
Rules:
- Preserve original meaning, no summarization.
- Remove artifacts (headers, footers, page numbers, OCR noise).
- Fix broken line wraps and hyphenated line-break words.
- Detect chapters. If missing, use "Chapter 1: Main Text".
- Create fewer, longer coherent segments: target about 480 spoken words each, staying roughly between 400 and 620 words per segment when possible.
- HARD LIMIT: The speakable text in each segment (imagine all SSML tags stripped—only words/punctuation that would be spoken) MUST stay under 3800 characters. If a natural break would exceed that, split into two segments instead. This is required for the downstream TTS API (4096 character input cap).
- Output strict JSON only:
{
  "segments": [
    {
      "chapterHeading": "Chapter X: Title",
      "segmentLabel": "[SEGMENT N]",
      "ssml": "<speak>...</speak>"
    }
  ]
}
- ssml must be valid Google TTS SSML and wrapped in <speak>.
- Narration style should feel human and conversational, not robotic.
- Use varied pacing: short pauses (<break time="200ms"/>) inside long sentences only when needed.
- Use medium pauses (<break time="400ms"/>) between sentence groups.
- Use longer pauses (<break time="700ms"/>) only between paragraphs or section transitions.
- Avoid repeating the same break tag after every sentence.
- Use <prosody rate="96%">...</prosody> for normal narration and only occasional emphasis with <emphasis level="moderate">.
- Keep punctuation natural for spoken rhythm; do not over-comma.
- Escape XML-sensitive characters in SSML text.
- Do not include markdown fences.`;

const smoothSsmlCadence = (ssml = '') =>
    ssml
        .replace(/(?:<break time="300ms"\/>\s*){3,}/g, '<break time="500ms"/> ')
        .replace(/(?:<break time="700ms"\/>\s*){2,}/g, '<break time="800ms"/> ')
        .replace(/<break time="250ms"\/>/g, '<break time="200ms"/>')
        .replace(/<break time="350ms"\/>/g, '<break time="400ms"/>')
        .replace(/<break time="600ms"\/>/g, '<break time="700ms"/>')
        .trim();

const coerceSegments = (data, baseIndex = 1) => {
    if (!data || !Array.isArray(data.segments)) return [];

    return data.segments
        .filter((segment) => segment && typeof segment.ssml === 'string')
        .map((segment, index) => {
            const safeHeading = typeof segment.chapterHeading === 'string' && segment.chapterHeading.trim()
                ? segment.chapterHeading.trim()
                : 'Chapter 1: Main Text';

            const safeLabel = `[SEGMENT ${baseIndex + index}]`;
            const safeSsmlRaw = segment.ssml.trim().startsWith('<speak>')
                ? segment.ssml.trim()
                : `<speak>${segment.ssml.trim()}</speak>`;
            const safeSsml = smoothSsmlCadence(safeSsmlRaw);

            return {
                chapterHeading: safeHeading,
                segmentLabel: safeLabel,
                ssml: safeSsml
            };
        });
};

const askChatGptForSegments = async (textChunk) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error('OPENAI_API_KEY is not configured');
    }
    const requestStartedAt = Date.now();
    console.log('[smartChunks] openai_request_start', {
        model: MODEL,
        timeoutMs: OPENAI_TIMEOUT_MS,
        chunkChars: typeof textChunk === 'string' ? textChunk.length : 0
    });
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS);
    let response;
    try {
        response = await fetch(OPENAI_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: MODEL,
                temperature: 0.2,
                max_tokens: 16384,
                response_format: { type: 'json_object' },
                messages: [
                    { role: 'system', content: systemPrompt },
                    {
                        role: 'user',
                        content: `Convert this raw extracted book text into smart audiobook SSML segments:\n\n${textChunk}`
                    }
                ]
            }),
            signal: controller.signal
        });
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error(`OpenAI request timed out after ${OPENAI_TIMEOUT_MS}ms`);
        }
        throw error;
    } finally {
        clearTimeout(timeoutId);
    }

    if (!response.ok) {
        const errorBody = await response.text();
        console.log('[smartChunks] openai_request_failed', {
            status: response.status,
            elapsedMs: Date.now() - requestStartedAt
        });
        throw new Error(`OpenAI request failed (${response.status}): ${errorBody}`);
    }
    console.log('[smartChunks] openai_request_ok', {
        status: response.status,
        elapsedMs: Date.now() - requestStartedAt
    });
    const payload = await response.json();
    const content = payload?.choices?.[0]?.message?.content;
    if (!content) {
        throw new Error('OpenAI response did not contain message content');
    }

    console.log('[smartChunks] openai_content_received', {
        contentChars: content.length,
        elapsedMs: Date.now() - requestStartedAt
    });
    return JSON.parse(content);
};

/**
 * @param {string} rawPdfText
 * @param {function} fallbackBuilder
 * @param {(evt: { phase: string, message?: string, current?: number, total?: number }) => void} [onProgress]
 */
export const buildSmartNarrationChunksWithChatGpt = async (rawPdfText = '', fallbackBuilder, onProgress) => {
    const source = typeof rawPdfText === 'string' ? rawPdfText.trim() : '';
    if (!source) return [];

    console.log('[smartChunks] build_start', {
        sourceChars: source.length
    });
    const inputChunks = splitTextIntoChunks(source, 12000);
    const total = inputChunks.length;
    console.log('[smartChunks] chunks_prepared', {
        total,
        firstChunkChars: inputChunks?.[0]?.length ?? 0
    });
    onProgress?.({
        phase: 'openai_planning',
        message: total > 1
            ? `Preparing ${total} AI requests for narration segments (this often takes several minutes)…`
            : 'Generating narration segments with AI (this often takes several minutes)…',
        current: 0,
        total
    });

    const allSegments = [];

    try {
        for (let i = 0; i < inputChunks.length; i++) {
            const chunk = inputChunks[i];
            const stepStartedAt = Date.now();
            console.log('[smartChunks] chunk_start', {
                index: i + 1,
                total,
                chunkChars: chunk.length
            });
            onProgress?.({
                phase: 'openai_segment',
                message: `Generating SSML via ChatGPT: part ${i + 1} of ${total}…`,
                current: i + 1,
                total
            });
            const structured = await askChatGptForSegments(chunk);
            const normalized = coerceSegments(structured, allSegments.length + 1);
            allSegments.push(...normalized);
            console.log('[smartChunks] chunk_done', {
                index: i + 1,
                normalizedCount: normalized.length,
                cumulativeSegments: allSegments.length,
                elapsedMs: Date.now() - stepStartedAt
            });
        }

        if (allSegments.length > 0) {
            console.log('[smartChunks] build_done', {
                totalSegments: allSegments.length
            });
            return allSegments;
        }
    } catch (error) {
        console.error('ChatGPT smart chunking failed, using fallback builder:', error.message);
    }

    onProgress?.({
        phase: 'openai_fallback',
        message: 'Using on-device fallback segmentation…'
    });

    const fallback = typeof fallbackBuilder === 'function' ? fallbackBuilder(source) : [];
    console.log('[smartChunks] fallback_done', {
        totalSegments: Array.isArray(fallback) ? fallback.length : -1
    });
    return fallback;
};
