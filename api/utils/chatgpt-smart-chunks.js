import fetch from 'node-fetch';
import { splitTextIntoChunks } from './splitTextToChunk.js';

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const OPENAI_TIMEOUT_MS = Number(process.env.OPENAI_SEGMENT_TIMEOUT_MS || 120000);

const SECTION_HEADING_NARRATION = `
SECTION HEADINGS — read aloud at each new section:
- When a segment begins a new section (Prologue, Summary, Synopsis, Chapter 1, Chapter 2, Epilogue, etc.), speak the section heading out loud first, then a medium pause, then the body text.
- Examples: "Prologue." then pause then prose; "Chapter 1: Shadows of the Past." then pause then prose.
- Use the chapterHeading value as the spoken announcement (natural audiobook style).
- Only announce the heading once at the start of that section's first segment — not again in later segments of the same section.
- chapterHeading is metadata AND the spoken label at section openings.`;

const SHARED_SSML_RULES = `
- ssml must be valid Google TTS SSML wrapped in <speak>.
- Narration style: warm human audiobook reader — not robotic, not news-anchor flat.
- Pauses: use <break time="400ms"/> between paragraphs; <break time="700ms"/> before body text after a section heading announcement.
- Do NOT put <break> after every sentence — that sounds choppy.
- Wrap body narration in <prosody rate="96%">...</prosody>.
- Escape XML-sensitive characters (&, <, >, quotes).
- No markdown fences in output.`;

const MUST_SKIP_RULES = `
MUST SKIP — never include in speakable SSML (mandatory for every book):
- Page markers in any form: [12], (p. 12), "Page 12", or isolated digits on their own line.
- Entire Table of Contents, Contents, or Index listing blocks.
- TOC-style lines: section titles with dot leaders, ellipses, or trailing page numbers.
- Running headers, footers, and repeated title lines from every page.
- Soundtrack / thematic playlist / track lists and similar bibliographic listings.
- OCR noise, blank filler lines, and decorative separator lines.`;

const AUDIOBOOK_ARTIFACT_RULES = `
${MUST_SKIP_RULES}

Also skip (non-narrative front matter):
- Copyright, ISBN, and legal boilerplate blocks.
- Publisher imprint lines (printing company, "published by", edition notices) — not the author name.
- Dedication pages and author marketing notes (not story prose).
- Standalone epigraph pages (short quote + attribution only, with no continuing narrative).

KEEP verbatim (fix line wraps and hyphenation only — no summarization):
- Main book title and author name from the title page.
- Prologue, Summary, Synopsis, or similar opening narrative sections.
- Introduction, Preface, Epilogue when they contain story prose.
- All chapter body text, dialogue, and internal monologue.`;

const AUDIOBOOK_STRUCTURE_RULES = `
STRUCTURE:
- Label sections in chapterHeading: "Prologue", "Chapter 1: Title", "Epilogue", etc.
- Detect chapters from structure. If none found, use "Chapter 1: Main Text".
${SECTION_HEADING_NARRATION}

SEGMENTATION:
- Target ~480 spoken words per segment (400–620 range).
- HARD LIMIT: speakable plain text per segment MUST stay under 3800 characters (downstream TTS cap is 4096).`;

const SEGMENT_1_OPENING_RULES = `
SEGMENT 1 ONLY (global first segment of the full book — critical):
1. Main book title (from title page; the primary title of the work).
2. Author name (byline or name on title page — not the publishing company).
3. <break time="700ms"/>
4. Then the first available opening narrative body — announce the section name aloud before the prose:
   a) Prologue — speak "Prologue." <break time="700ms"/> then first prose paragraph, OR
   b) Summary / Synopsis — speak "Summary." or the section title aloud, then pause, then body, OR
   c) Chapter 1 — speak "Chapter 1" and subtitle if present aloud, then pause, then first narrative paragraph.
5. Set chapterHeading on segment 1 to match the section being opened (e.g. "Opening: Prologue", "Chapter 1: Title").
6. Segment 1 is also used as the sample audio preview — include title, author, and the start of the opening body in one segment (up to word limit).`;

const firstChunkSystemPrompt = `You are an expert audiobook script editor converting messy PDF/EPUB extraction into clean SSML segments for a FULL audiobook.

${AUDIOBOOK_ARTIFACT_RULES}

MUST NOT violate: never include page numbers or Table of Contents in any segment.

${SEGMENT_1_OPENING_RULES}

SCOPE FOR THIS CHUNK:
- Build segment 1 as above, then continue with further segments covering all narrative text in this portion of the document.
${AUDIOBOOK_STRUCTURE_RULES}

Output strict JSON only:
{
  "segments": [
    {
      "chapterHeading": "Opening: Prologue",
      "segmentLabel": "[SEGMENT 1]",
      "ssml": "<speak><prosody rate=\\"96%\\">Title. <break time=\\"400ms\\"/> Author name. <break time=\\"700ms\\"/> Prologue. <break time=\\"700ms\\"/> Opening body...</prosody></speak>"
    }
  ]
}
${SHARED_SSML_RULES}`;

const continuationSystemPrompt = `You are an expert audiobook script editor continuing a FULL audiobook SSML plan from a later portion of the same book.

${AUDIOBOOK_ARTIFACT_RULES}

MUST NOT violate: never include page numbers or Table of Contents in any segment.

CONTINUATION RULES:
- This is a later portion of the same book. Do NOT repeat the book title or author name.
- Continue segment numbering sequentially from prior chunks.
- Announce section headings at each new section as usual.
- Cover all narrative text in this portion of the document.

${AUDIOBOOK_STRUCTURE_RULES}

Output strict JSON only:
{
  "segments": [
    {
      "chapterHeading": "Chapter 5: Title",
      "segmentLabel": "[SEGMENT 42]",
      "ssml": "<speak><prosody rate=\\"96%\\">...</prosody></speak>"
    }
  ]
}
${SHARED_SSML_RULES}`;

const buildFirstChunkUserPrefix = (metadata = {}) => {
    const hints = [
        'Convert this document extraction into SSML segments for the full audiobook.',
        'MUST skip page numbers and Table of Contents.',
        'Segment 1 must speak: book title, then author name, then announce the section ("Prologue", "Summary", or "Chapter 1…") aloud before the body.',
        'Then continue segmenting the rest of this chunk.'
    ];
    if (metadata.title) {
        hints.push(`Publisher metadata — book title: "${metadata.title}"`);
    }
    if (metadata.authorName) {
        hints.push(`Publisher metadata — author: "${metadata.authorName}"`);
    }
    if (metadata.synopsis) {
        const syn = String(metadata.synopsis).trim().slice(0, 600);
        hints.push(`Publisher synopsis (use only if document has no Prologue/Summary section): ${syn}`);
    }
    hints.push('Document extraction:');
    return hints.join('\n');
};

const buildContinuationUserPrefix = (segmentsSoFar = 0) => [
    'Continue the full-book audiobook SSML plan from this next portion of the document.',
    `Prior chunks already produced ${segmentsSoFar} segments.`,
    'Do NOT repeat book title or author name.',
    `Next segment label should be [SEGMENT ${segmentsSoFar + 1}].`,
    'MUST skip page numbers and Table of Contents.',
    'Document extraction portion:'
].join('\n');

/** Strip PDF page-marker artifacts before AI or fallback segmentation. */
export const preCleanRawExtractForNarration = (rawText = '') => {
    let text = String(rawText || '');
    text = text.replace(/\[\d{1,4}\]/g, ' ');
    text = text.replace(/\(\s*p\.?\s*\d{1,4}\s*\)/gi, ' ');
    text = text.replace(/^\s*page\s+\d{1,4}\s*$/gim, '');
    return text.replace(/\n{3,}/g, '\n\n').trim();
};

const smoothSsmlCadence = (ssml = '') =>
    ssml
        .replace(/(?:<break time="300ms"\/>\s*){3,}/g, '<break time="500ms"/> ')
        .replace(/(?:<break time="700ms"\/>\s*){2,}/g, '<break time="800ms"/> ')
        .replace(/<break time="250ms"\/>/g, '<break time="200ms"/>')
        .replace(/<break time="350ms"\/>/g, '<break time="400ms"/>')
        .replace(/<break time="600ms"\/>/g, '<break time="700ms"/>')
        .trim();

/** Safety net: remove page markers the model may have left in SSML. */
const scrubSsmlArtifacts = (ssml = '') =>
    String(ssml || '')
        .replace(/\s*\[\d{1,4}\]\s*/g, ' ')
        .replace(/\(\s*p\.?\s*\d{1,4}\s*\)/gi, ' ')
        .replace(/\s{2,}/g, ' ')
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
            const safeSsml = scrubSsmlArtifacts(smoothSsmlCadence(safeSsmlRaw));

            return {
                chapterHeading: safeHeading,
                segmentLabel: safeLabel,
                ssml: safeSsml
            };
        });
};

const askChatGptForSegments = async (textChunk, { system, userPrefix } = {}) => {
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
                temperature: 0.15,
                max_tokens: 16384,
                response_format: { type: 'json_object' },
                messages: [
                    { role: 'system', content: system },
                    {
                        role: 'user',
                        content: `${userPrefix}\n\n${textChunk}`
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
 * Full-book narration plan: sample-style rules (TOC skip, section headings, segment-1 opening).
 * Sample audio TTS uses segment 1 only; full audio synthesizes all segments from the same plan.
 */
export const buildAudiobookNarrationSegmentsWithChatGpt = async (
    rawPdfText = '',
    fallbackBuilder,
    onProgress,
    metadata = {}
) => {
    const source = preCleanRawExtractForNarration(rawPdfText);
    if (!source) return [];

    console.log('[smartChunks][audiobook] build_start', {
        sourceChars: source.length,
        hasTitleHint: Boolean(metadata.title),
        hasAuthorHint: Boolean(metadata.authorName)
    });

    const inputChunks = splitTextIntoChunks(source, 12000);
    const total = inputChunks.length;
    console.log('[smartChunks][audiobook] chunks_prepared', {
        total,
        firstChunkChars: inputChunks?.[0]?.length ?? 0
    });

    onProgress?.({
        phase: 'openai_planning',
        message: total > 1
            ? `Preparing ${total} AI requests for full-book narration segments (often several minutes)…`
            : 'Generating full-book narration segments with AI (often several minutes)…',
        current: 0,
        total
    });

    const allSegments = [];

    try {
        for (let i = 0; i < inputChunks.length; i++) {
            const chunk = inputChunks[i];
            const stepStartedAt = Date.now();
            const isFirstChunk = i === 0;
            console.log('[smartChunks][audiobook] chunk_start', {
                index: i + 1,
                total,
                chunkChars: chunk.length,
                isFirstChunk
            });
            onProgress?.({
                phase: 'openai_segment',
                message: isFirstChunk
                    ? `AI segmenting full book (part ${i + 1} of ${total}): title, author, opening section…`
                    : `AI segmenting full book: part ${i + 1} of ${total}…`,
                current: i + 1,
                total
            });

            const structured = await askChatGptForSegments(chunk, {
                system: isFirstChunk ? firstChunkSystemPrompt : continuationSystemPrompt,
                userPrefix: isFirstChunk
                    ? buildFirstChunkUserPrefix(metadata)
                    : buildContinuationUserPrefix(allSegments.length)
            });
            const normalized = coerceSegments(structured, allSegments.length + 1);
            allSegments.push(...normalized);
            console.log('[smartChunks][audiobook] chunk_done', {
                index: i + 1,
                normalizedCount: normalized.length,
                cumulativeSegments: allSegments.length,
                elapsedMs: Date.now() - stepStartedAt
            });
        }

        if (allSegments.length > 0) {
            console.log('[smartChunks][audiobook] build_done', {
                totalSegments: allSegments.length,
                firstHeading: allSegments[0]?.chapterHeading
            });
            return allSegments;
        }
    } catch (error) {
        console.error('[smartChunks][audiobook] AI failed, using fallback:', error.message);
    }

    onProgress?.({
        phase: 'openai_fallback',
        message: 'Using local fallback segmentation for full book…'
    });

    const fallback = typeof fallbackBuilder === 'function' ? fallbackBuilder(source) : [];
    console.log('[smartChunks][audiobook] fallback_done', {
        totalSegments: Array.isArray(fallback) ? fallback.length : -1
    });
    return fallback.map((seg) => ({
        ...seg,
        ssml: scrubSsmlArtifacts(seg.ssml || '')
    }));
};

/** @deprecated Use buildAudiobookNarrationSegmentsWithChatGpt */
export const buildSampleNarrationSegmentsWithChatGpt = buildAudiobookNarrationSegmentsWithChatGpt;

/** @deprecated Use buildAudiobookNarrationSegmentsWithChatGpt */
export const buildSmartNarrationChunksWithChatGpt = async (rawPdfText = '', fallbackBuilder, onProgress) =>
    buildAudiobookNarrationSegmentsWithChatGpt(rawPdfText, fallbackBuilder, onProgress, {});
