import fetch from 'node-fetch';
import { splitTextIntoChunks } from './splitTextToChunk.js';

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

const systemPrompt = `You convert PDF-extracted book text into clean audiobook-ready SSML segments.
Rules:
- Preserve original meaning, no summarization.
- Remove artifacts (headers, footers, page numbers, OCR noise).
- Fix broken line wraps and hyphenated line-break words.
- Detect chapters. If missing, use "Chapter 1: Main Text".
- Create coherent segments near 150-300 words each.
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
        // Remove robotic repeated breaks like ...300ms 300ms 300ms...
        .replace(/(?:<break time="300ms"\/>\s*){3,}/g, '<break time="500ms"/> ')
        // Tighten excessive long breaks
        .replace(/(?:<break time="700ms"\/>\s*){2,}/g, '<break time="800ms"/> ')
        // Normalize uncommon break values to a more stable set
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

    const response = await fetch(OPENAI_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: MODEL,
            temperature: 0.2,
            response_format: { type: 'json_object' },
            messages: [
                { role: 'system', content: systemPrompt },
                {
                    role: 'user',
                    content: `Convert this raw PDF text into smart audiobook SSML segments:\n\n${textChunk}`
                }
            ]
        })
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`OpenAI request failed (${response.status}): ${errorBody}`);
    }

    const payload = await response.json();
    const content = payload?.choices?.[0]?.message?.content;
    if (!content) {
        throw new Error('OpenAI response did not contain message content');
    }

    return JSON.parse(content);
};

export const buildSmartNarrationChunksWithChatGpt = async (rawPdfText = '', fallbackBuilder) => {
    const source = typeof rawPdfText === 'string' ? rawPdfText.trim() : '';
    if (!source) return [];

    const inputChunks = splitTextIntoChunks(source, 12000);
    const allSegments = [];

    try {
        for (const chunk of inputChunks) {
            const structured = await askChatGptForSegments(chunk);
            const normalized = coerceSegments(structured, allSegments.length + 1);
            allSegments.push(...normalized);
        }

        if (allSegments.length > 0) {
            return allSegments;
        }
    } catch (error) {
        console.error('ChatGPT smart chunking failed, using fallback builder:', error.message);
    }

    return typeof fallbackBuilder === 'function' ? fallbackBuilder(source) : [];
};
