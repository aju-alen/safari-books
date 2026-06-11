import AWS from 'aws-sdk';
import { once } from 'events';
import { PassThrough } from 'stream';
import { prisma } from '../utils/database.js'
import { getPdfFromAws } from '../utils/getPdfFromAws.js'
import { extractPlainTextForNarration } from '../utils/bookDocumentText.js'
import { googleTtsConvert } from '../utils/google-tts-convert.js'
import { uploadAudioStreamToS3 } from '../utils/uploadAudioBuffer.js'
import {
    buildAudiobookNarrationSegmentsWithChatGpt,
    preCleanRawExtractForNarration
} from '../utils/chatgpt-smart-chunks.js'
import { getAudioDurationMs } from '../utils/audioDurationFromBuffer.js'
import { sampleAudioReadyEmailTemplate, publisherRejectionEmailTemplate, publisherVerificationApprovedEmailTemplate } from '../utils/emailTemplate.js';
import { resendEmailBoiler } from '../utils/resendFunction.js';

import dotenv from "dotenv";
dotenv.config();

const parsedMaxBookSourceBytes = Number(process.env.MAX_BOOK_SOURCE_BYTES || 50 * 1024 * 1024);
const MAX_BOOK_SOURCE_BYTES = Number.isFinite(parsedMaxBookSourceBytes) && parsedMaxBookSourceBytes > 0
    ? parsedMaxBookSourceBytes
    : 50 * 1024 * 1024;
const parsedMaxConcurrentJobs = Number(process.env.MAX_CONCURRENT_FULL_AUDIO_JOBS || 1);
const MAX_CONCURRENT_FULL_AUDIO_JOBS = Number.isFinite(parsedMaxConcurrentJobs) && parsedMaxConcurrentJobs > 0
    ? Math.floor(parsedMaxConcurrentJobs)
    : 1;
const activeFullAudioJobs = new Set();
const adminAudioProgress = new Map();
const MAX_AUDIO_PROGRESS_ENTRIES = 300;

const toIsCompanyBool = (isCompanyQuery) => String(isCompanyQuery) === 'true';

const buildAudioProgressKey = (jobType, publisherId, isCompanyQuery) =>
    `${jobType}:${toIsCompanyBool(isCompanyQuery) ? 'company' : 'author'}:${publisherId}`;

const phaseToProgressPercent = (phase, current, total, existingPercent = 0) => {
    if (Number.isFinite(current) && Number.isFinite(total) && total > 0) {
        const bounded = Math.min(100, Math.max(0, Math.round((current / total) * 100)));
        return Math.max(existingPercent, bounded);
    }

    const phasePercent = {
        queued: 0,
        downloading_document: 5,
        parsing_document: 15,
        generating_segments: 30,
        segments_preview: 30,
        segments_cached: 35,
        tts_batch_start: 50,
        synthesizing_audio: 70,
        synthesizing_segment: 70,
        uploading: 95,
        complete: 100
    };
    const mapped = phasePercent[phase];
    if (!Number.isFinite(mapped)) return existingPercent;
    return Math.max(existingPercent, mapped);
};

const pruneAudioProgressStore = () => {
    if (adminAudioProgress.size <= MAX_AUDIO_PROGRESS_ENTRIES) return;
    const sorted = Array.from(adminAudioProgress.entries())
        .sort((a, b) => new Date(b[1].updatedAt).getTime() - new Date(a[1].updatedAt).getTime());
    const limited = sorted.slice(0, MAX_AUDIO_PROGRESS_ENTRIES);
    adminAudioProgress.clear();
    limited.forEach(([key, value]) => adminAudioProgress.set(key, value));
};

const upsertAudioProgress = (key, patch) => {
    const existing = adminAudioProgress.get(key);
    const nowIso = new Date().toISOString();
    const next = {
        key,
        jobType: patch.jobType || existing?.jobType || 'unknown',
        publisherId: patch.publisherId || existing?.publisherId || '',
        isCompany: typeof patch.isCompany === 'boolean' ? patch.isCompany : (existing?.isCompany ?? false),
        status: patch.status || existing?.status || 'running',
        phase: patch.phase || existing?.phase || 'queued',
        message: patch.message || existing?.message || '',
        current: Number.isFinite(patch.current) ? patch.current : existing?.current ?? null,
        total: Number.isFinite(patch.total) ? patch.total : existing?.total ?? null,
        segmentCount: Number.isFinite(patch.segmentCount) ? patch.segmentCount : existing?.segmentCount ?? null,
        progressPercent: Number.isFinite(patch.progressPercent)
            ? patch.progressPercent
            : phaseToProgressPercent(
                patch.phase || existing?.phase,
                Number.isFinite(patch.current) ? patch.current : existing?.current,
                Number.isFinite(patch.total) ? patch.total : existing?.total,
                existing?.progressPercent ?? 0
            ),
        resultUrl: patch.resultUrl || existing?.resultUrl || null,
        errorMessage: patch.errorMessage || existing?.errorMessage || null,
        startedAt: existing?.startedAt || patch.startedAt || nowIso,
        completedAt: patch.completedAt || existing?.completedAt || null,
        updatedAt: nowIso
    };

    if (next.status === 'completed') {
        next.progressPercent = 100;
        next.completedAt = next.completedAt || nowIso;
    }
    if (next.status === 'failed') {
        next.completedAt = next.completedAt || nowIso;
    }

    adminAudioProgress.set(key, next);
    pruneAudioProgressStore();
    return next;
};

const wantsNdjsonStream = (req) => {
    const q = String(req.query?.stream ?? '').toLowerCase();
    return q === '1' || q === 'true' || q === 'yes';
};

const beginNdjsonStream = (res) => {
    res.status(200);
    res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('X-Accel-Buffering', 'no');
    if (typeof res.flushHeaders === 'function') {
        res.flushHeaders();
    }
};

const writeNdjsonLine = (res, obj) => {
    res.write(`${JSON.stringify(obj)}\n`);
    if (typeof res.flush === 'function') {
        res.flush();
    }
};

/** Server-side status logs for the full-audio job (grep: `[generateFullAudio]`). */
const logGenerateFullAudio = (publisherId, isCompanyQuery, stage, detail = {}) => {
    const line = {
        tag: 'generateFullAudio',
        publisherId,
        isCompany: isCompanyQuery === 'true',
        stage,
        t: new Date().toISOString(),
        ...detail
    };
    console.log('[generateFullAudio]', JSON.stringify(line));
};

/** Plain spoken text from SSML (tags stripped). Used for duration estimates and full section copy. */
const ssmlToPlainText = (ssml = '') =>
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
        .replace(/\s+/g, ' ')
        .trim();

/** Short excerpt for logs or legacy previews only — not written to Book.timeStamp as `p`. */
const ssmlToPreviewText = (ssml = '', maxLen = 160) => {
    const plain = ssmlToPlainText(ssml);
    return plain.length > maxLen ? `${plain.slice(0, maxLen).trim()}…` : plain;
};

const estimateSegmentDurationMs = (ssml = '', narrationSpeakingRate) => {
    const plain = ssmlToPlainText(ssml);
    const words = plain.split(/\s+/).filter(Boolean).length;
    const parsedRate = Number(String(narrationSpeakingRate ?? '').replace(/"/g, ''));
    const rate = Number.isFinite(parsedRate) ? Math.min(Math.max(parsedRate, 0.8), 1.4) : 1;
    const wordsPerMinute = 165 * rate;
    const ms = Math.round((words / wordsPerMinute) * 60_000);
    return Math.max(1000, ms || 1000);
};

// Fewer, longer segments → fewer TTS calls. Plain text per TTS request must stay ≤4096 chars (see google-tts-convert).
const MIN_SEGMENT_WORDS = 320;
const TARGET_SEGMENT_WORDS = 480;
const MAX_SEGMENT_WORDS = 620;

const escapeSsml = (text = '') => text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const CHAPTER_HEADING_RE = /^(chapter|part)\s+([ivxlcdm\d]+)\b[:.\-\s]*(.*)$/i;
const NARRATIVE_SECTION_RE = /^(prologue|epilogue|introduction|preface|summary|synopsis)\b/i;
const TOC_HEADING_RE = /^(table\s+of\s+contents?|contents|index|list\s+of\s+(illustrations|tables|figures))\s*$/i;
const SKIP_BLOCK_RE = /^(thematic playlist|playlist|dedication|author'?s note|copyright|published by|all rights reserved|isbn)\b/i;

const isTocEntryLine = (line = '') => {
    const t = String(line).trim();
    if (!t) return false;
    if (/\.{2,}\s*\d+\s*$/.test(t)) return true;
    if (t.length <= 120 && !/[.!?]["']?\s*$/.test(t) && /\s+\d{1,4}\s*$/.test(t)) {
        const withoutPage = t.replace(/\s+\d{1,4}\s*$/, '').trim();
        if (withoutPage.split(/\s+/).filter(Boolean).length <= 12 || /\.{2,}/.test(withoutPage)) {
            return true;
        }
    }
    return false;
};

const isNarrativeSectionStart = (line = '') => {
    const t = String(line).trim();
    if (!t || isTocEntryLine(t)) return false;
    if (/^prologue\b/i.test(t)) return true;
    if (NARRATIVE_SECTION_RE.test(t) && !/\.{2,}/.test(t)) return true;
    if (CHAPTER_HEADING_RE.test(t) && !/\.{2,}/.test(t.replace(CHAPTER_HEADING_RE, ''))) return true;
    return false;
};

const stripFrontMatterAndTocLines = (lines = []) => {
    const kept = [];
    const openingBuffer = [];
    let inToc = false;
    let capturing = false;

    const flushOpeningBuffer = () => {
        if (openingBuffer.length > 0) {
            kept.push(...openingBuffer);
            openingBuffer.length = 0;
        }
    };

    for (const rawLine of lines) {
        let line = String(rawLine).trim().replace(/^\[\d{1,4}\]\s*/, '');
        if (!line || /^\[\d{1,4}\]\s*$/.test(line)) continue;
        if (TOC_HEADING_RE.test(line)) {
            inToc = true;
            continue;
        }
        if (SKIP_BLOCK_RE.test(line)) {
            capturing = false;
            continue;
        }
        if (inToc) {
            if (isTocEntryLine(line)) continue;
            if (isNarrativeSectionStart(line)) {
                inToc = false;
                capturing = true;
                flushOpeningBuffer();
                kept.push(line);
            }
            continue;
        }
        if (!capturing) {
            if (isTocEntryLine(line) || SKIP_BLOCK_RE.test(line)) continue;
            if (isNarrativeSectionStart(line)) {
                capturing = true;
                flushOpeningBuffer();
                kept.push(line);
                continue;
            }
            if (line.length <= 200 && !/^by\s*$/i.test(line)) {
                openingBuffer.push(line);
            }
            continue;
        }
        kept.push(line);
    }

    return kept.length > 0 ? kept : lines;
};

const cleanPdfTextForNarration = (rawText = '') => {
    const preCleaned = preCleanRawExtractForNarration(rawText);
    const normalized = preCleaned
        .replace(/\r/g, '\n')
        .replace(/\u000c/g, '\n')
        .replace(/-\n(?=[a-z])/g, '')
        .replace(/[^\S\n]+/g, ' ');

    const lines = stripFrontMatterAndTocLines(
        normalized
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line.length > 0)
            .filter((line) => !/^(page\s*)?\d+$/i.test(line))
            .filter((line) => !/^[|_~`•·\-.]{2,}$/.test(line))
    );

    return lines
        .join('\n')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/[ \t]+/g, ' ')
        .replace(/\s+([,.;:!?])/g, '$1')
        .trim();
};

const splitIntoSentences = (text = '') =>
    text
        .replace(/\s+/g, ' ')
        .match(/[^.!?]+[.!?]+|[^.!?]+$/g)
        ?.map((sentence) => sentence.trim())
        .filter(Boolean) || [];

const addNarrationPauses = (text = '') => {
    const sentenceChunks = splitIntoSentences(text).map(escapeSsml);
    return sentenceChunks.join('<break time="300ms"/> ');
};

const expandNarrationAbbreviations = (text = '') => text
    .replace(/\bDr\./g, 'Doctor')
    .replace(/\bMr\./g, 'Mister')
    .replace(/\bMrs\./g, 'Misses')
    .replace(/\bMs\./g, 'Miss')
    .replace(/\bSt\./g, 'Saint')
    .replace(/\bvs\./gi, 'versus');

const detectChapters = (text = '') => {
    const lines = text.split('\n');
    const chapters = [];
    let currentChapter = null;

    for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line || isTocEntryLine(line)) continue;

        if (/^prologue\b/i.test(line)) {
            if (currentChapter?.content.length) chapters.push(currentChapter);
            currentChapter = { heading: 'Prologue', content: [] };
            const body = line.replace(/^prologue\b[:.\-\s]*/i, '').trim();
            if (body) currentChapter.content.push(body);
            continue;
        }

        const chapterMatch = line.match(CHAPTER_HEADING_RE);
        if (chapterMatch) {
            if (currentChapter && currentChapter.content.length > 0) {
                chapters.push(currentChapter);
            }
            const chapterNumber = chapterMatch[2];
            const chapterTitle = chapterMatch[3]?.trim() || `${chapterMatch[1]} ${chapterNumber}`;
            currentChapter = {
                heading: `Chapter ${chapterNumber}: ${chapterTitle}`,
                content: []
            };
            continue;
        }

        if (/^(epilogue|introduction|preface|summary|synopsis)\b/i.test(line)) {
            if (currentChapter?.content.length) chapters.push(currentChapter);
            const label = line.split(/\s+/)[0];
            currentChapter = {
                heading: label.charAt(0).toUpperCase() + label.slice(1).toLowerCase(),
                content: []
            };
            const body = line.replace(/^(epilogue|introduction|preface|summary|synopsis)\b[:.\-\s]*/i, '').trim();
            if (body) currentChapter.content.push(body);
            continue;
        }

        if (!currentChapter) {
            currentChapter = {
                heading: 'Chapter 1: Main Text',
                content: []
            };
        }

        currentChapter.content.push(line);
    }

    if (currentChapter && currentChapter.content.length > 0) {
        chapters.push(currentChapter);
    }

    return chapters.length > 0 ? chapters : [{ heading: 'Chapter 1: Main Text', content: [text] }];
};

const splitChapterIntoSegments = (chapterContent = '') => {
    const sentences = splitIntoSentences(chapterContent);
    const segments = [];
    let currentSegment = [];
    let currentWordCount = 0;

    for (const sentence of sentences) {
        const sentenceWordCount = sentence.split(/\s+/).filter(Boolean).length;
        const wouldExceed = currentWordCount + sentenceWordCount > MAX_SEGMENT_WORDS;
        const hasMinimumSize = currentWordCount >= MIN_SEGMENT_WORDS;

        if (wouldExceed && hasMinimumSize) {
            segments.push(currentSegment.join(' ').trim());
            currentSegment = [sentence];
            currentWordCount = sentenceWordCount;
            continue;
        }

        currentSegment.push(sentence);
        currentWordCount += sentenceWordCount;

        if (currentWordCount >= TARGET_SEGMENT_WORDS) {
            segments.push(currentSegment.join(' ').trim());
            currentSegment = [];
            currentWordCount = 0;
        }
    }

    if (currentSegment.length > 0) {
        segments.push(currentSegment.join(' ').trim());
    }

    return segments.filter(Boolean);
};

const buildNarrationSegments = (rawPdfText = '') => {
    const cleaned = cleanPdfTextForNarration(rawPdfText);
    const chapters = detectChapters(cleaned);
    const narrationSegments = [];
    let segmentCounter = 1;

    for (const chapter of chapters) {
        const chapterText = chapter.content.join(' ').replace(/\s+/g, ' ').trim();
        const chapterSegments = splitChapterIntoSegments(chapterText);

        for (let segIdx = 0; segIdx < chapterSegments.length; segIdx++) {
            const segmentText = chapterSegments[segIdx];
            let expanded = expandNarrationAbbreviations(segmentText);
            if (segIdx === 0) {
                const headingAnnounce = escapeSsml(`${chapter.heading}.`);
                expanded = `${headingAnnounce}<break time="700ms"/> ${expanded}`;
            }
            const ssmlContent = addNarrationPauses(expanded);

            narrationSegments.push({
                chapterHeading: chapter.heading,
                segmentLabel: `[SEGMENT ${segmentCounter}]`,
                ssml: `<speak><prosody rate="95%">${ssmlContent}</prosody></speak>`
            });
            segmentCounter += 1;
        }
    }

    return narrationSegments;
};

const parseStoredNarrationSegments = (storedValue) => {
    if (!storedValue || typeof storedValue !== 'string') {
        return [];
    }

    try {
        const parsed = JSON.parse(storedValue);
        if (!Array.isArray(parsed)) return [];

        return parsed.filter((segment) =>
            segment &&
            typeof segment === 'object' &&
            typeof segment.ssml === 'string' &&
            typeof segment.chapterHeading === 'string' &&
            typeof segment.segmentLabel === 'string'
        );
    } catch (error) {
        console.error('Failed to parse stored narrationSegments JSON:', error.message);
        return [];
    }
};

const parseNarrationTimelineFromSegments = (storedValue) => {
    const parsed = parseStoredNarrationSegments(storedValue);
    return parsed
        .filter((segment) =>
            Number.isFinite(segment?.s) &&
            Number.isFinite(segment?.e) &&
            segment.e > segment.s
        )
        .map((segment, idx) => ({
            i: Number.isFinite(segment?.i) ? segment.i : idx + 1,
            s: segment.s,
            e: segment.e,
            d: Number.isFinite(segment?.d) ? segment.d : Math.max(0, segment.e - segment.s),
            ch: segment.chapterHeading || '',
            sl: segment.segmentLabel || `[SEGMENT ${idx + 1}]`,
            p: typeof segment?.p === 'string' ? segment.p : '',
            source: typeof segment?.source === 'string' ? segment.source : 'unknown'
        }));
};

const saveNarrationSegmentsToPublisher = async (id, isCompany, segments) => {
    const serialized = JSON.stringify(segments);
    if (isCompany === 'true') {
        await prisma.company.update({
            where: { id },
            data: { narrationSegments: serialized }
        });
    } else {
        await prisma.author.update({
            where: { id },
            data: { narrationSegments: serialized }
        });
    }
};

const buildPublisherNarrationMetadata = (publisher, isCompany) => {
    const authorName = isCompany === 'true'
        ? publisher?.companyName
        : publisher?.fullName;
    return {
        title: typeof publisher?.title === 'string' ? publisher.title.trim() : '',
        authorName: typeof authorName === 'string' ? authorName.trim() : '',
        synopsis: typeof publisher?.synopsis === 'string' ? publisher.synopsis.trim() : ''
    };
};

const getAudiobookNarrationSegmentsWithCache = async ({
    publisher,
    isCompany,
    id,
    rawPdfText,
    onProgress,
    forceRegenerate = false
}) => {
    const t0 = Date.now();
    console.log('[audiobook][segments] start', {
        publisherId: id,
        isCompany,
        rawTextChars: typeof rawPdfText === 'string' ? rawPdfText.length : 0,
        hasStoredSegments: Boolean(publisher?.narrationSegments),
        forceRegenerate
    });

    const cachedSegments = parseStoredNarrationSegments(publisher?.narrationSegments);
    if (!forceRegenerate && cachedSegments.length > 0) {
        onProgress?.({
            phase: 'segments_cached',
            message: `Using saved full-book narration plan (${cachedSegments.length} segments).`,
            segmentCount: cachedSegments.length
        });
        console.log('[audiobook][segments] using_cache', {
            count: cachedSegments.length,
            elapsedMs: Date.now() - t0
        });
        return cachedSegments;
    }

    onProgress?.({
        phase: 'generating_segments',
        message: 'AI building full-book narration plan (title, author, sections — skipping TOC & page numbers)…'
    });

    const metadata = buildPublisherNarrationMetadata(publisher, isCompany);
    const generatedSegments = await buildAudiobookNarrationSegmentsWithChatGpt(
        rawPdfText,
        (text) => buildNarrationSegments(text),
        onProgress,
        metadata
    );
    console.log('[audiobook][segments] generated_result', {
        count: Array.isArray(generatedSegments) ? generatedSegments.length : -1,
        elapsedMs: Date.now() - t0
    });
    if (!generatedSegments.length) {
        console.log('[audiobook][segments] empty_segments_return');
        return [];
    }

    onProgress?.({
        phase: 'segments_generated',
        message: `Saved full-book plan: ${generatedSegments.length} segments.`,
        segmentCount: generatedSegments.length
    });

    await saveNarrationSegmentsToPublisher(id, isCompany, generatedSegments);

    console.log('[audiobook][segments] done', {
        count: generatedSegments.length,
        elapsedMs: Date.now() - t0
    });
    return generatedSegments;
};

const pickSampleSegmentFromList = (segments = []) => {
    if (!segments.length) return { segment: null, selectedIndex: -1 };

    const findByHeading = (pattern) =>
        segments.findIndex((s) => pattern.test(String(s?.chapterHeading || '').trim()));

    const openingIndex = findByHeading(/^opening\b/i);
    if (openingIndex >= 0) {
        return { segment: segments[openingIndex], selectedIndex: openingIndex };
    }

    // Segment 1 is the sample preview: title, author, then prologue/summary/chapter start
    return { segment: segments[0], selectedIndex: 0 };
};

const getSampleNarrationSegmentWithCache = async ({
    publisher,
    isCompany,
    id,
    rawPdfText,
    onProgress,
    forceRegenerate = false
}) => {
    const usedCache = !forceRegenerate
        && parseStoredNarrationSegments(publisher?.narrationSegments).length > 0;

    const segments = await getAudiobookNarrationSegmentsWithCache({
        publisher,
        isCompany,
        id,
        rawPdfText,
        onProgress,
        forceRegenerate
    });

    if (!segments.length) {
        return { segment: null, segments: [], segmentSource: 'ai_failed', selectedIndex: -1 };
    }

    const segmentSource = usedCache ? 'cached_narration_segments' : 'ai_chatgpt_audiobook';

    const { segment, selectedIndex } = pickSampleSegmentFromList(segments);
    console.log('[sendSampleAudio][segment_select]', {
        segmentSource,
        segmentCount: segments.length,
        selectedIndex,
        chapterHeading: segment?.chapterHeading
    });

    return {
        segment,
        segments,
        segmentSource,
        selectedIndex
    };
};

export const getAllPendingVerifications = async (req, res) => {

    if(req.middlewareRole !== 'ADMIN'){
        return res.status(403).json({message: "You are not authorized to access this resource"});
    }
    try{
        const pendingVerificationsCompany = await prisma.company.findMany({
            where: {
                isVerified: false,
                isRejected: false,
            },
            include: {
                user: true,
            }
        });

        const pendingVerificationsAuthor = await prisma.author.findMany({
            where: {
                isVerified: false,
                isRejected: false,
            },
            include: {
                user: true,
            }
        });

        res.status(200).json({ message:"Got all data", company:pendingVerificationsCompany, author:pendingVerificationsAuthor });
    }
    catch(error){
        console.log(error);
        res.status(500).json({ message: "Internal server error", error });
    }
}

export const getSinglePublisher = async (req, res) => {
const {isCompany, id} = req.params;

if(req.middlewareRole !== 'ADMIN'){
    return res.status(403).json({message: "You are not authorized to access this resource"});
}
try{

    
    if(isCompany === 'true'){
        console.log(isCompany, 'this is isCompany -----------');
        
        console.log(id, 'this is company id -----------');
        const publisher = await prisma.company.findUnique({
            where: {
                id: id
            }
        })
        res.status(200).json({message: "Company found", publisher});
    }
    else{
        console.log(id, 'this is author id -----------');
        
        const publisher = await prisma.author.findUnique({
            where: {
                id: id
            }
        })
        res.status(200).json({message: "Author found", publisher});
    }
}
catch(error){
    console.log(error);
    res.status(500).json({message: "Internal server error", error});
}
}

export const verifyPublisher = async (req, res) => {
    const {id} = req.params;
    const {type, durationHours, durationMinutes, completeAudioSample, narratorName, colorCode} = req.body;
    console.log(req.body, 'this is body data');
    
    if(req.middlewareRole !== 'ADMIN'){
        return res.status(403).json({message: "You are not authorized to access this resource"});
    }

    const sendApprovalEmail = async (publisherRow, bookTitle) => {
        const recipientEmail = publisherRow.user?.email;
        if (!recipientEmail || String(recipientEmail).toLowerCase() === 'null') {
            console.warn('verifyPublisher: no publisher email on file; skipping approval email');
            return;
        }
        const html = publisherVerificationApprovedEmailTemplate(
            publisherRow.user?.name || 'there',
            bookTitle
        );
        await resendEmailBoiler(
            process.env.NAMECHEAP_EMAIL,
            recipientEmail,
            'Your Safari Books listing is approved',
            html
        );
    };

    try{
        if(type === 'company'){
            const publisher = await prisma.company.update({
                where: {
                    id: id
                },
                data: {
                    isVerified: true,
                    isRejected: false,
                    reject: null,
                    rejectedAt: null,
                },
                include: { user: { select: { email: true, name: true } } },
            })
            console.log(publisher,'updated company publisher data');
            const cachedTimeline = parseNarrationTimelineFromSegments(publisher.narrationSegments);
            

            await prisma.book.create({
                data:{
                    title:publisher.title,
                    description:publisher.synopsis,
                    durationInHours: durationHours,
                    durationInMinutes: durationMinutes,
                    coverImage: publisher.coverImage,
                    authorName : publisher.companyName,
                    narratorName: narratorName,
                    summary: publisher.synopsis,
                    releaseDate: publisher.date,
                    language: publisher.language,
                    publisher: publisher.companyName,
                    rating: 0,
                    categories: publisher.categories,
                    colorCode: colorCode,
                    sampleAudioURL: publisher.audioSampleURL,
                    completeAudioUrl: completeAudioSample,
                    companyId: publisher.id,
                    isPublished: true,
                    amount: publisher.amount,
                    publishedAt: new Date(),
                    timeStamp: cachedTimeline

                }
            })
            const bookTitle =
                (typeof publisher.title === 'string' && publisher.title.trim()) ||
                publisher.companyName ||
                'Your listing';
            try {
                await sendApprovalEmail(publisher, bookTitle);
            } catch (mailErr) {
                console.error('verifyPublisher: approval email failed', mailErr);
            }
            res.status(200).json({message: "Company verified successfully",});
        }
        else{
            const publisher = await prisma.author.update({
                where: {
                    id: id
                },
                data: {
                    isVerified: true,
                    isRejected: false,
                    reject: null,
                    rejectedAt: null,
                },
                include: { user: { select: { email: true, name: true } } },
            })

            console.log(publisher,'updated publisher data');
            const cachedTimeline = parseNarrationTimelineFromSegments(publisher.narrationSegments);

            await prisma.book.create({
                data:{
                    title:publisher.title,
                    description:publisher.synopsis,
                    durationInHours: durationHours,
                    durationInMinutes: durationMinutes,
                    coverImage: publisher.coverImage,
                    authorName : publisher.fullName,
                    narratorName: narratorName,
                    summary: publisher.synopsis,
                    releaseDate: publisher.date,
                    language: publisher.language,
                    publisher: publisher.fullName,
                    rating: 0,
                    categories: publisher.categories,
                    colorCode: colorCode,
                    sampleAudioURL: publisher.audioSampleURL,
                    completeAudioUrl: completeAudioSample,
                    authorId: publisher.id,
                    isPublished: true,
                    amount: publisher.amount,
                    publishedAt: new Date(),
                    timeStamp: cachedTimeline
                }
            })
            const bookTitle =
                (typeof publisher.title === 'string' && publisher.title.trim()) ||
                publisher.fullName ||
                'Your listing';
            try {
                await sendApprovalEmail(publisher, bookTitle);
            } catch (mailErr) {
                console.error('verifyPublisher: approval email failed', mailErr);
            }
            res.status(200).json({message: "Company verified successfully", publisher});
        }
      
    }
    catch(error){
        console.log(error);
        res.status(500).json({message: "Internal server error", error});
    }
}

export const rejectPublisher = async (req, res) => {
    const { id } = req.params;
    const { isCompany } = req.query;
    const { message } = req.body;

    if (req.middlewareRole !== 'ADMIN') {
        return res.status(403).json({ message: 'You are not authorized to access this resource' });
    }

    if (!message || typeof message !== 'string' || !message.trim()) {
        return res.status(400).json({ message: 'Rejection message is required.' });
    }

    const trimmed = message.trim();
    if (trimmed.length > 8000) {
        return res.status(400).json({ message: 'Rejection message is too long (max 8000 characters).' });
    }

    try {
        let publisher;
        if (String(isCompany) === 'true') {
            publisher = await prisma.company.findUnique({
                where: { id },
                include: { user: { select: { email: true, name: true } } },
            });
        } else {
            publisher = await prisma.author.findUnique({
                where: { id },
                include: { user: { select: { email: true, name: true } } },
            });
        }

        if (!publisher) {
            return res.status(404).json({ message: 'Publisher not found' });
        }

        const recipientEmail = publisher.user?.email;
        if (!recipientEmail || String(recipientEmail).toLowerCase() === 'null') {
            return res.status(400).json({ message: 'No email on file for this publisher account.' });
        }

        const bookTitle =
            (typeof publisher.title === 'string' && publisher.title.trim()) ||
            (String(isCompany) === 'true' ? publisher.companyName : publisher.fullName) ||
            '';

        const html = publisherRejectionEmailTemplate(
            publisher.user?.name || 'there',
            bookTitle,
            trimmed
        );
        await resendEmailBoiler(
            process.env.NAMECHEAP_EMAIL,
            recipientEmail,
            'Update on your Safari Books publisher application',
            html
        );

        if (String(isCompany) === 'true') {
            await prisma.company.update({
                where: { id },
                data: {
                    isRejected: true,
                    reject: trimmed,
                    rejectedAt: new Date(),
                },
            });
        } else {
            await prisma.author.update({
                where: { id },
                data: {
                    isRejected: true,
                    reject: trimmed,
                    rejectedAt: new Date(),
                },
            });
        }

        return res.status(200).json({ message: 'Rejection email sent successfully.' });
    } catch (error) {
        console.error('rejectPublisher:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// export const verifyPublisher = async (req, res) => {
//     try {
//         const data = await s3.getObject({
//             Bucket: bucketName,
//             Key: fileKey,
//         }).promise();
        
//         const pdfData = await PdfParse(data.Body);
        
//         const cleanedText = pdfData.text
//             .replace(/\s+/g, ' ')
//             .replace(/\n\s+/g, '\n')
//             .replace(/\s+\n/g, '\n')
//             .trim();
        
//         console.log("Cleaned PDF Text length:", cleanedText.length);
        
//         // Split text into chunks of 4000 characters (safe limit)
//         const textChunks = splitTextIntoChunks(cleanedText, 4000);
//         console.log(`Split into ${textChunks.length} chunks`);
        
//         const client = new textToSpeech.TextToSpeechClient({
//             projectId: 'safari-books',
//             credentials: {
//                 client_email: process.env.GOOGLE_TTS_EMAIL,
//                 private_key: process.env.GOOGLE_TTS_PRIVATE_KEY,
//             }
//         });
        
//         // Process each chunk and combine audio
//         const audioBuffers = [];
        
//         for (let i = 0; i < textChunks.length; i++) {
//             console.log(`Processing chunk ${i + 1}/${textChunks.length}`);
            
//             const request = {
//                 input: { text: textChunks[i] },
//                 voice: { languageCode: 'en-US', ssmlGender: 'ß' },
//                 audioConfig: { audioEncoding: 'MP3' },
//             };
            
//             const [response] =  await client.synthesizeSpeech(request);
//             audioBuffers.push(response.audioContent);
            
//             // Add small delay between requests to avoid rate limiting
//             if (i < textChunks.length - 1) {
//                 await new Promise(resolve => setTimeout(resolve, 100));
//             }
//         }
//         console.log(audioBuffers, 'this is audioBuffers');

//         const singleAudioBuffer = audioBuffers[0];

//         const SingleAudio = Buffer.concat([singleAudioBuffer]);

//         await writeFile('singleAudio.mp3', SingleAudio, 'binary');
//         console.log('Single audio content written to file: singleAudio.mp3');
        
//         // Combine all audio buffers
//         const combinedAudio = Buffer.concat(audioBuffers);
        
//         // Save combined audio file
//         await writeFile('output.mp3', combinedAudio, 'binary');
//         console.log('Combined audio content written to file: output.mp3');
        
//         return res.status(200).json({
//             message: "Publisher verified successfully",
//             chunksProcessed: textChunks.length,
//             totalLength: cleanedText.length
//         });
        
//     } catch (error) {
//         console.error('Error in verifyPublisher:', error);
//         return res.status(500).json({message: "Internal server error", error: error.message});
//     }
// }

// Helper function to split text into chunks

export const getAdminAudioProgress = async (req, res) => {
    if (req.middlewareRole !== 'ADMIN') {
        return res.status(403).json({ message: 'You are not authorized to access this resource' });
    }

    const { publisherId, isCompany, jobType } = req.query;
    const normalizedIsCompany = isCompany == null ? null : toIsCompanyBool(isCompany);
    const normalizedJobType = typeof jobType === 'string' ? jobType.toLowerCase() : null;

    let jobs = Array.from(adminAudioProgress.values());
    if (publisherId) {
        jobs = jobs.filter((job) => job.publisherId === publisherId);
    }
    if (normalizedIsCompany != null) {
        jobs = jobs.filter((job) => job.isCompany === normalizedIsCompany);
    }
    if (normalizedJobType) {
        jobs = jobs.filter((job) => job.jobType === normalizedJobType);
    }

    jobs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return res.status(200).json({ jobs });
};


export const sendSampleAudio = async (req, res) => {
    const {id} = req.params;
    const {isCompany, regenerateSegments} = req.query;
    const forceRegenerate = String(regenerateSegments).toLowerCase() === 'true' || regenerateSegments === '1';
    const progressKey = buildAudioProgressKey('sample', id, isCompany);

    const {narrationSampleHeartzRate, narrationSpeakingRate, narrationGender, narrationLanguageCode, narrationVoiceName} = req.body;
    if (req.middlewareRole !== 'ADMIN') {
        return res.status(403).json({ message: 'You are not authorized to access this resource' });
    }

    const stream = wantsNdjsonStream(req);
    let sampleAudioStream = null;
    let sampleUploadPromise = null;
    const pushProgress = (payload) => {
        upsertAudioProgress(progressKey, {
            jobType: 'sample',
            publisherId: id,
            isCompany: toIsCompanyBool(isCompany),
            status: 'running',
            phase: payload.phase || 'progress',
            message: payload.message,
            current: payload.current,
            total: payload.total,
            segmentCount: payload.segmentCount
        });
        if (stream) writeNdjsonLine(res, { type: 'progress', ...payload });
    };

    try {
        upsertAudioProgress(progressKey, {
            jobType: 'sample',
            publisherId: id,
            isCompany: toIsCompanyBool(isCompany),
            status: 'running',
            phase: 'queued',
            message: 'Sample audio request accepted.'
        });

        let publisher;
        if (isCompany === 'true') {
            publisher = await prisma.company.findUnique({
                where: { id },
                include: { user: { select: { email: true, name: true } } },
            });
        } else {
            publisher = await prisma.author.findUnique({
                where: { id },
                include: { user: { select: { email: true, name: true } } },
            });
        }

        if (!publisher) {
            upsertAudioProgress(progressKey, {
                status: 'failed',
                phase: 'publisher_not_found',
                message: 'Publisher not found.',
                errorMessage: 'Publisher not found'
            });
            return res.status(404).json({ message: 'Publisher not found' });
        }

        if (!publisher.pdfURL) {
            upsertAudioProgress(progressKey, {
                status: 'failed',
                phase: 'missing_document_url',
                message: 'No book document URL found for this publisher.',
                errorMessage: 'No book document URL found for this publisher'
            });
            return res.status(400).json({ message: 'No book document URL found for this publisher' });
        }

        if (stream) beginNdjsonStream(res);

        pushProgress({ phase: 'downloading_document', message: 'Downloading book file from storage…' });
        const pdfKey = publisher.pdfURL.split('/').slice(3).join('/');
        const userId = pdfKey.split('/').slice(0, 3).join('/');
        let data = await getPdfFromAws(pdfKey);
        const sourceByteLength = Buffer.isBuffer(data) ? data.length : (data?.byteLength ?? 0);
        if (sourceByteLength > MAX_BOOK_SOURCE_BYTES) {
            upsertAudioProgress(progressKey, {
                status: 'failed',
                phase: 'document_too_large',
                message: `Source document is too large (${sourceByteLength} bytes).`,
                errorMessage: 'Source document is too large'
            });
            return res.status(413).json({
                message: `Source document is too large (${sourceByteLength} bytes). Max allowed is ${MAX_BOOK_SOURCE_BYTES} bytes.`
            });
        }

        pushProgress({ phase: 'parsing_document', message: 'Extracting text from PDF or EPUB…' });
        let rawBookText = await extractPlainTextForNarration(data, publisher.pdfURL);
        data = null;

        console.log('[sendSampleAudio] extracted_raw_text', {
            chars: typeof rawBookText === 'string' ? rawBookText.length : 0
        });

        const segmentHeartbeat = setInterval(() => {
            pushProgress({
                phase: 'generating_segments',
                message: 'Still processing book text with AI…'
            });
        }, 15000);

        let sampleResult;
        try {
            sampleResult = await getSampleNarrationSegmentWithCache({
                publisher,
                isCompany,
                id,
                rawPdfText: rawBookText,
                onProgress: pushProgress,
                forceRegenerate
            });
        } finally {
            clearInterval(segmentHeartbeat);
        }

        const sampleSegment = sampleResult.segment;
        rawBookText = null;

        const recipientEmail = publisher.user?.email;
        const recipientName = publisher.user?.name || 'there';
        const bookTitleForEmail =
            (typeof publisher.title === 'string' && publisher.title.trim()) ||
            (isCompany === 'true' ? publisher.companyName : publisher.fullName) ||
            'your listing';

        publisher = null;

        console.log('[sendSampleAudio] narration_segments_ready', {
            hasSampleSegment: Boolean(sampleSegment),
            firstSegmentChars: sampleSegment?.ssml?.length ?? 0
        });

        if (!sampleSegment?.ssml) {
            upsertAudioProgress(progressKey, {
                status: 'failed',
                phase: 'no_narration_segments',
                message: 'Unable to generate narration chunks from the uploaded document',
                errorMessage: 'Unable to generate narration chunks from the uploaded document'
            });
            if (stream) {
                writeNdjsonLine(res, { type: 'error', message: 'Unable to generate narration chunks from the uploaded document' });
                return res.end();
            }
            return res.status(400).json({ message: 'Unable to generate narration chunks from the uploaded document' });
        }

        pushProgress({ phase: 'synthesizing_audio', message: 'Converting first segment to speech (OpenAI TTS)…' });
        const [response] = await googleTtsConvert(
            sampleSegment.ssml,
            narrationSampleHeartzRate,
            narrationSpeakingRate,
            narrationGender,
            narrationLanguageCode,
            narrationVoiceName
        );

        const ext = response.responseFormat || 'mp3';
        const sampleFileName = `sample_output_${id}.${ext}`;

        pushProgress({ phase: 'uploading', message: 'Uploading sample audio…' });
        sampleAudioStream = new PassThrough();
        sampleUploadPromise = uploadAudioStreamToS3(sampleAudioStream, userId, sampleFileName);
        if (response.audioContent?.length) {
            const canContinueWriting = sampleAudioStream.write(response.audioContent);
            if (!canContinueWriting) {
                await once(sampleAudioStream, 'drain');
            }
        }
        sampleAudioStream.end();
        const { Location } = await sampleUploadPromise;

        upsertAudioProgress(progressKey, {
            status: 'completed',
            phase: 'complete',
            message: 'Sample audio generated and uploaded successfully',
            resultUrl: Location
        });

        if (isCompany === 'true') {
            await prisma.company.update({
                where: { id },
                data: { audioSampleURL: Location }
            });
        } else {
            await prisma.author.update({
                where: { id },
                data: { audioSampleURL: Location }
            });
        }

        if (recipientEmail) {
            void (async () => {
                try {
                    const html = sampleAudioReadyEmailTemplate(recipientName, bookTitleForEmail);
                    await resendEmailBoiler(
                        process.env.NAMECHEAP_EMAIL,
                        recipientEmail,
                        'Your sample audio is ready — Safari Books',
                        html
                    );
                } catch (notifyErr) {
                    console.error('[sendSampleAudio] publisher notify email failed:', notifyErr);
                }
            })();
        }

        if (stream) {
            writeNdjsonLine(res, {
                type: 'complete',
                message: 'Sample audio generated and uploaded successfully',
                audioSampleURL: Location
            });
            return res.end();
        }

        return res.status(200).json({
            message: 'Sample audio generated and uploaded successfully',
            audioSampleURL: Location
        });
    } catch (error) {
        console.error('Error in sendSampleAudio:', error);
        upsertAudioProgress(progressKey, {
            status: 'failed',
            phase: 'failed',
            message: error.message || 'Internal server error',
            errorMessage: error.message || 'Internal server error'
        });
        if (sampleAudioStream && !sampleAudioStream.destroyed) {
            sampleAudioStream.destroy(error);
        }
        if (stream && res.headersSent) {
            writeNdjsonLine(res, { type: 'error', message: error.message || 'Internal server error' });
            return res.end();
        }
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

export const generateFullAudio = async (req, res) => {
    const { id } = req.params;
    const { isCompany } = req.query;
    const progressKey = buildAudioProgressKey('full', id, isCompany);

    const { narrationSpeakingRate, narrationGender, narrationLanguageCode, narrationVoiceName } = req.body;
    if (req.middlewareRole !== 'ADMIN') {
        return res.status(403).json({ message: 'You are not authorized to access this resource' });
    }

    const stream = wantsNdjsonStream(req);
    const jobKey = `${isCompany === 'true' ? 'company' : 'author'}:${id}`;
    let audioStream = null;
    let uploadPromise = null;
    let jobRegistered = false;
    const pushProgress = (payload) => {
        upsertAudioProgress(progressKey, {
            jobType: 'full',
            publisherId: id,
            isCompany: toIsCompanyBool(isCompany),
            status: 'running',
            phase: payload.phase || 'progress',
            message: payload.message,
            current: payload.current,
            total: payload.total,
            segmentCount: payload.segmentCount
        });
        logGenerateFullAudio(id, isCompany, payload.phase || 'progress', {
            message: payload.message,
            current: payload.current,
            total: payload.total,
            segmentCount: payload.segmentCount
        });
        if (stream) writeNdjsonLine(res, { type: 'progress', ...payload });
    };

    const jobStartedAt = Date.now();

    try {
        upsertAudioProgress(progressKey, {
            jobType: 'full',
            publisherId: id,
            isCompany: toIsCompanyBool(isCompany),
            status: 'running',
            phase: 'queued',
            message: 'Full audio request accepted.'
        });

        if (activeFullAudioJobs.size >= MAX_CONCURRENT_FULL_AUDIO_JOBS) {
            logGenerateFullAudio(id, isCompany, 'concurrency_limit_hit', {
                activeJobs: activeFullAudioJobs.size,
                maxJobs: MAX_CONCURRENT_FULL_AUDIO_JOBS
            });
            upsertAudioProgress(progressKey, {
                status: 'failed',
                phase: 'concurrency_limit_hit',
                message: 'Full audio generation is busy right now. Please retry shortly.',
                errorMessage: 'Full audio generation is busy right now. Please retry shortly.'
            });
            return res.status(429).json({
                message: 'Full audio generation is busy right now. Please retry shortly.'
            });
        }
        if (activeFullAudioJobs.has(jobKey)) {
            logGenerateFullAudio(id, isCompany, 'job_already_running', { jobKey });
            upsertAudioProgress(progressKey, {
                status: 'running',
                phase: 'job_already_running',
                message: 'A full-audio generation job is already running for this publisher.'
            });
            return res.status(409).json({
                message: 'A full-audio generation job is already running for this publisher.'
            });
        }
        activeFullAudioJobs.add(jobKey);
        jobRegistered = true;

        logGenerateFullAudio(id, isCompany, 'job_started', {
            stream,
            narrationLanguageCode,
            narrationGender
        });

        let publisher;
        if (isCompany === 'true') {
            publisher = await prisma.company.findUnique({ where: { id } });
        } else {
            publisher = await prisma.author.findUnique({ where: { id } });
        }

        if (!publisher) {
            logGenerateFullAudio(id, isCompany, 'publisher_not_found', {});
            upsertAudioProgress(progressKey, {
                status: 'failed',
                phase: 'publisher_not_found',
                message: 'Publisher not found',
                errorMessage: 'Publisher not found'
            });
            return res.status(404).json({ message: 'Publisher not found' });
        }

        if (!publisher.pdfURL) {
            logGenerateFullAudio(id, isCompany, 'missing_document_url', {});
            upsertAudioProgress(progressKey, {
                status: 'failed',
                phase: 'missing_document_url',
                message: 'No book document URL found for this publisher',
                errorMessage: 'No book document URL found for this publisher'
            });
            return res.status(400).json({ message: 'No book document URL found for this publisher' });
        }

        logGenerateFullAudio(id, isCompany, 'publisher_loaded', {
            hasCachedNarrationSegments: Boolean(publisher.narrationSegments),
            documentUrlHost: (() => {
                try {
                    return new URL(publisher.pdfURL).host;
                } catch {
                    return 'unknown';
                }
            })()
        });

        if (stream) beginNdjsonStream(res);

        pushProgress({ phase: 'downloading_document', message: 'Downloading book file from storage…' });
        const pdfKey = publisher.pdfURL.split('/').slice(3).join('/');
        const userId = pdfKey.split('/').slice(0, 3).join('/');
        let data = await getPdfFromAws(pdfKey);
        const sourceByteLength = Buffer.isBuffer(data) ? data.length : (data?.byteLength ?? 0);
        if (sourceByteLength > MAX_BOOK_SOURCE_BYTES) {
            logGenerateFullAudio(id, isCompany, 'document_too_large', {
                sourceByteLength,
                maxAllowedBytes: MAX_BOOK_SOURCE_BYTES
            });
            upsertAudioProgress(progressKey, {
                status: 'failed',
                phase: 'document_too_large',
                message: `Source document is too large (${sourceByteLength} bytes).`,
                errorMessage: 'Source document is too large'
            });
            return res.status(413).json({
                message: `Source document is too large (${sourceByteLength} bytes). Max allowed is ${MAX_BOOK_SOURCE_BYTES} bytes.`
            });
        }
        logGenerateFullAudio(id, isCompany, 'document_downloaded', {
            s3KeyTail: pdfKey.split('/').slice(-2).join('/'),
            byteLength: sourceByteLength || 'unknown'
        });

        pushProgress({ phase: 'parsing_document', message: 'Extracting text from PDF or EPUB…' });
        let rawBookText = await extractPlainTextForNarration(data, publisher.pdfURL);
        data = null;
        logGenerateFullAudio(id, isCompany, 'text_extracted', {
            textCharLength: typeof rawBookText === 'string' ? rawBookText.length : 0
        });

        const narrationSegments = await getAudiobookNarrationSegmentsWithCache({
            publisher,
            isCompany,
            id,
            rawPdfText: rawBookText,
            onProgress: pushProgress
        });
        rawBookText = null;
        publisher = null;
        if (!narrationSegments.length) {
            logGenerateFullAudio(id, isCompany, 'no_narration_segments', { msSinceStart: Date.now() - jobStartedAt });
            upsertAudioProgress(progressKey, {
                status: 'failed',
                phase: 'no_narration_segments',
                message: 'Unable to generate narration chunks from the uploaded document',
                errorMessage: 'Unable to generate narration chunks from the uploaded document'
            });
            if (stream) {
                writeNdjsonLine(res, { type: 'error', message: 'Unable to generate narration chunks from the uploaded document' });
                return res.end();
            }
            return res.status(400).json({ message: 'Unable to generate narration chunks from the uploaded document' });
        }

        logGenerateFullAudio(id, isCompany, 'narration_segments_ready', {
            segmentCount: narrationSegments.length,
            msSinceStart: Date.now() - jobStartedAt
        });

        pushProgress({
            phase: 'tts_batch_start',
            message: `Converting ${narrationSegments.length} segments to speech (this can take a long time)…`,
            segmentCount: narrationSegments.length
        });

        const generatedTimestamps = [];
        let timelineCursorMs = 0;
        const ttsStartedAt = Date.now();
        let cumulativeAudioBytes = 0;
        const fullAudioFileName = `full_output_${id}.mp3`;
        audioStream = new PassThrough();

        pushProgress({ phase: 'uploading', message: 'Uploading combined audiobook file…' });
        uploadPromise = uploadAudioStreamToS3(audioStream, userId, fullAudioFileName);

        for (let i = 0; i < narrationSegments.length; i++) {
            pushProgress({
                phase: 'synthesizing_segment',
                message: `Text-to-speech: segment ${i + 1} of ${narrationSegments.length}…`,
                current: i + 1,
                total: narrationSegments.length
            });
            const segStart = Date.now();
            const [response] = await googleTtsConvert(
                narrationSegments[i].ssml,
                'mp3',
                narrationSpeakingRate,
                narrationGender,
                narrationLanguageCode,
                narrationVoiceName
            );
            const segMs = Date.now() - segStart;
            const bufLen = response.audioContent?.length ?? 0;
            cumulativeAudioBytes += bufLen;

            if (bufLen > 0) {
                const canContinueWriting = audioStream.write(response.audioContent);
                if (!canContinueWriting) {
                    await once(audioStream, 'drain');
                }
            }

            let measuredDurationMs = 0;
            let durationSource = 'measured_from_audio';
            try {
                measuredDurationMs = await getAudioDurationMs(response.audioContent);
            } catch (durationError) {
                measuredDurationMs = estimateSegmentDurationMs(narrationSegments[i].ssml, narrationSpeakingRate);
                durationSource = 'estimated_from_text';
                logGenerateFullAudio(id, isCompany, 'segment_duration_fallback', {
                    segmentIndex: i + 1,
                    reason: durationError.message,
                    fallbackDurationMs: measuredDurationMs
                });
            }
            const startMs = timelineCursorMs;
            const endMs = startMs + measuredDurationMs;
            timelineCursorMs = endMs;
            // Book.timeStamp[]: one object per narration *section* (aligned with one TTS segment — not word-level).
            // Times are cumulative on the concatenated audiobook; `p` is full plain text for that section (UI + sync).
            generatedTimestamps.push({
                i: i + 1,
                s: startMs,
                e: endMs,
                d: measuredDurationMs,
                ch: narrationSegments[i].chapterHeading || '',
                sl: narrationSegments[i].segmentLabel || `[SEGMENT ${i + 1}]`,
                p: ssmlToPlainText(narrationSegments[i].ssml),
                source: durationSource
            });
            logGenerateFullAudio(id, isCompany, 'tts_segment_done', {
                segmentIndex: i + 1,
                segmentTotal: narrationSegments.length,
                ssmlChars: narrationSegments[i].ssml?.length ?? 0,
                audioBytes: bufLen,
                segmentMs: segMs,
                measuredDurationMs,
                durationSource
            });
            if (i < narrationSegments.length - 1) {
                await new Promise((resolve) => setTimeout(resolve, 100));
            }
        }
        audioStream.end();
        const { Location } = await uploadPromise;

        logGenerateFullAudio(id, isCompany, 'tts_batch_complete', {
            segmentTotal: narrationSegments.length,
            ttsTotalMs: Date.now() - ttsStartedAt,
            combinedBytesUploaded: cumulativeAudioBytes
        });
        logGenerateFullAudio(id, isCompany, 'upload_complete', {
            s3ObjectKey: `${userId}/${fullAudioFileName}`
        });

        if (isCompany === 'true') {
            await prisma.company.update({
                where: { id },
                data: { completeAudioUrl: Location }
            });
        } else {
            await prisma.author.update({
                where: { id },
                data: { completeAudioUrl: Location }
            });
        }
        logGenerateFullAudio(id, isCompany, 'database_updated', { completeAudioUrl: Location });

        const matchingBook = await prisma.book.findFirst({
            where: isCompany === 'true'
                ? { companyId: id, isPublished: true }
                : { authorId: id, isPublished: true },
            orderBy: { publishedAt: 'desc' }
        });
        if (matchingBook) {
            await prisma.book.update({
                where: { id: matchingBook.id },
                data: {
                    completeAudioUrl: Location,
                    timeStamp: generatedTimestamps
                }
            });
            logGenerateFullAudio(id, isCompany, 'book_timestamp_saved', {
                bookId: matchingBook.id,
                entries: generatedTimestamps.length,
                totalEstimatedDurationMs: timelineCursorMs
            });
        } else {
            for (let idx = 0; idx < narrationSegments.length; idx++) {
                const timing = generatedTimestamps[idx];
                if (!timing) continue;
                narrationSegments[idx] = {
                    ...narrationSegments[idx],
                    i: timing.i,
                    s: timing.s,
                    e: timing.e,
                    d: timing.d,
                    p: timing.p,
                    source: timing.source
                };
            }
            if (isCompany === 'true') {
                await prisma.company.update({
                    where: { id },
                    data: { narrationSegments: JSON.stringify(narrationSegments) }
                });
            } else {
                await prisma.author.update({
                    where: { id },
                    data: { narrationSegments: JSON.stringify(narrationSegments) }
                });
            }
            logGenerateFullAudio(id, isCompany, 'book_not_found_for_timestamp', {});
            logGenerateFullAudio(id, isCompany, 'timestamps_cached_on_publisher', {
                entries: generatedTimestamps.length
            });
        }

        logGenerateFullAudio(id, isCompany, 'job_complete', {
            msTotal: Date.now() - jobStartedAt,
            completeAudioUrl: Location
        });
        upsertAudioProgress(progressKey, {
            status: 'completed',
            phase: 'complete',
            message: 'Full audio generated and uploaded successfully',
            resultUrl: Location
        });

        if (stream) {
            writeNdjsonLine(res, {
                type: 'complete',
                message: 'Full audio generated and uploaded successfully',
                completeAudioUrl: Location
            });
            return res.end();
        }

        return res.status(200).json({
            message: 'Full audio generated and uploaded successfully',
            completeAudioUrl: Location
        });
    } catch (error) {
        logGenerateFullAudio(id, isCompany, 'job_failed', {
            errorMessage: error.message,
            msSinceStart: Date.now() - jobStartedAt
        });
        upsertAudioProgress(progressKey, {
            status: 'failed',
            phase: 'failed',
            message: error.message || 'Internal server error',
            errorMessage: error.message || 'Internal server error'
        });
        console.error('Error in generateFullAudio:', error);
        if (audioStream && !audioStream.destroyed) {
            audioStream.destroy(error);
        }
        if (stream && res.headersSent) {
            writeNdjsonLine(res, { type: 'error', message: error.message || 'Internal server error' });
            return res.end();
        }
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    } finally {
        if (jobRegistered) {
            activeFullAudioJobs.delete(jobKey);
        }
    }
};