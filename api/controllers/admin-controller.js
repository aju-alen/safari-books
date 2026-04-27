import AWS from 'aws-sdk';
import { prisma } from '../utils/database.js'
import { getPdfFromAws } from '../utils/getPdfFromAws.js'
import { extractPlainTextForNarration } from '../utils/bookDocumentText.js'
import { googleTtsConvert } from '../utils/google-tts-convert.js'
import { uploadAudioBufferToS3 } from '../utils/uploadAudioBuffer.js'
import { buildSmartNarrationChunksWithChatGpt } from '../utils/chatgpt-smart-chunks.js'


import dotenv from "dotenv";
dotenv.config();

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

// Fewer, longer segments → fewer TTS calls. Plain text per TTS request must stay ≤4096 chars (see google-tts-convert).
const MIN_SEGMENT_WORDS = 320;
const TARGET_SEGMENT_WORDS = 480;
const MAX_SEGMENT_WORDS = 620;

const escapeSsml = (text = '') => text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const cleanPdfTextForNarration = (rawText = '') => {
    const normalized = rawText
        .replace(/\r/g, '\n')
        .replace(/\u000c/g, '\n')
        .replace(/-\n(?=[a-z])/g, '')
        .replace(/[^\S\n]+/g, ' ');

    const lines = normalized
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .filter((line) => !/^(page\s*)?\d+$/i.test(line))
        .filter((line) => !/^[|_~`•·\-.]{2,}$/.test(line));

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
    const chapterRegex = /^(chapter|part)\s+([ivxlcdm\d]+)\b[:.\-\s]*(.*)$/i;
    const chapters = [];
    let currentChapter = null;

    for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line) continue;
        const chapterMatch = line.match(chapterRegex);

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

        for (const segmentText of chapterSegments) {
            const expanded = expandNarrationAbbreviations(segmentText);
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

const getNarrationSegmentsWithCache = async ({
    publisher,
    isCompany,
    id,
    rawPdfText,
    onProgress
}) => {
    const t0 = Date.now();
    console.log('[sendSampleAudio][segments] start', {
        publisherId: id,
        isCompany,
        rawTextChars: typeof rawPdfText === 'string' ? rawPdfText.length : 0,
        hasStoredSegments: Boolean(publisher?.narrationSegments)
    });

    const cachedSegments = parseStoredNarrationSegments(publisher?.narrationSegments);
    console.log('[sendSampleAudio][segments] parsed_cached_segments', {
        count: cachedSegments.length
    });
    if (cachedSegments.length > 0) {
        onProgress?.({
            phase: 'segments_cached',
            message: `Using saved narration plan (${cachedSegments.length} segments).`,
            segmentCount: cachedSegments.length
        });
        console.log('[sendSampleAudio][segments] using_cache', {
            count: cachedSegments.length,
            elapsedMs: Date.now() - t0
        });
        return cachedSegments;
    }

    onProgress?.({
        phase: 'generating_segments',
        message: 'Building SSML narration segments with ChatGPT (often several minutes)…'
    });

    const generatedSegments = await buildSmartNarrationChunksWithChatGpt(
        rawPdfText,
        buildNarrationSegments,
        onProgress
    );
    console.log('[sendSampleAudio][segments] generated_result', {
        count: Array.isArray(generatedSegments) ? generatedSegments.length : -1,
        elapsedMs: Date.now() - t0
    });
    if (!generatedSegments.length) {
        console.log('[sendSampleAudio][segments] empty_segments_return');
        return [];
    }

    onProgress?.({
        phase: 'segments_generated',
        message: `Generated ${generatedSegments.length} segments. Saving narration plan…`,
        segmentCount: generatedSegments.length
    });

    const serialized = JSON.stringify(generatedSegments);
    if (isCompany === 'true') {
        console.log('[sendSampleAudio][segments] saving_to_company');
        await prisma.company.update({
            where: { id },
            data: { narrationSegments: serialized }
        });
    } else {
        console.log('[sendSampleAudio][segments] saving_to_author');
        await prisma.author.update({
            where: { id },
            data: { narrationSegments: serialized }
        });
    }

    console.log('[sendSampleAudio][segments] done', {
        count: generatedSegments.length,
        elapsedMs: Date.now() - t0
    });
    return generatedSegments;
};

export const getAllPendingVerifications = async (req, res) => {

    if(req.middlewareRole !== 'ADMIN'){
        return res.status(403).json({message: "You are not authorized to access this resource"});
    }
    try{
        const pendingVerificationsCompany = await prisma.company.findMany({
            where: {
                isVerified: false
            },
            include: {
                user: true,
            }
        });

        const pendingVerificationsAuthor = await prisma.author.findMany({
            where: {
                isVerified: false
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

    try{
        if(type === 'company'){
            const publisher = await prisma.company.update({
                where: {
                    id: id
                },
                data: {
                    isVerified: true
                },
            })
            console.log(publisher,'updated company publisher data');
            

            const addBook = await prisma.book.create({
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
                    publishedAt: new Date()

                }
            })
            res.status(200).json({message: "Company verified successfully",});
        }
        else{
            const publisher = await prisma.author.update({
                where: {
                    id: id
                },
                data: {
                    isVerified: true
                }
            })

            console.log(publisher,'updated publisher data');

            const addBook = await prisma.book.create({
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
                    publishedAt: new Date()
                }})
            res.status(200).json({message: "Company verified successfully", publisher});
        }
      
    }
    catch(error){
        console.log(error);
        res.status(500).json({message: "Internal server error", error});
    }
}

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


export const sendSampleAudio = async (req, res) => {
    const {id} = req.params;
    const {isCompany} = req.query;

    const {narrationSampleHeartzRate, narrationSpeakingRate, narrationGender, narrationLanguageCode, narrationVoiceName} = req.body;
    if (req.middlewareRole !== 'ADMIN') {
        return res.status(403).json({ message: 'You are not authorized to access this resource' });
    }

    const stream = wantsNdjsonStream(req);
    const pushProgress = (payload) => {
        if (stream) writeNdjsonLine(res, { type: 'progress', ...payload });
    };

    try {
        let publisher;
        if (isCompany === 'true') {
            publisher = await prisma.company.findUnique({ where: { id } });
        } else {
            publisher = await prisma.author.findUnique({ where: { id } });
        }

        if (!publisher) {
            return res.status(404).json({ message: 'Publisher not found' });
        }

        if (!publisher.pdfURL) {
            return res.status(400).json({ message: 'No book document URL found for this publisher' });
        }

        if (stream) beginNdjsonStream(res);

        pushProgress({ phase: 'downloading_document', message: 'Downloading book file from storage…' });
        const pdfKey = publisher.pdfURL.split('/').slice(3).join('/');
        const userId = pdfKey.split('/').slice(0, 3).join('/');
        const data = await getPdfFromAws(pdfKey);

        pushProgress({ phase: 'parsing_document', message: 'Extracting text from PDF or EPUB…' });
        const rawBookText = await extractPlainTextForNarration(data, publisher.pdfURL);

        console.log('[sendSampleAudio] extracted_raw_text', {
            chars: typeof rawBookText === 'string' ? rawBookText.length : 0,
            preview: typeof rawBookText === 'string' ? rawBookText.slice(0, 120) : ''
        });

        const narrationSegments = await getNarrationSegmentsWithCache({
            publisher,
            isCompany,
            id,
            rawPdfText: rawBookText,
            onProgress: pushProgress
        });

        console.log('[sendSampleAudio] narration_segments_ready', {
            count: narrationSegments.length,
            firstSegmentChars: narrationSegments?.[0]?.ssml?.length ?? 0
        });

        if (!narrationSegments.length) {
            if (stream) {
                writeNdjsonLine(res, { type: 'error', message: 'Unable to generate narration chunks from the uploaded document' });
                return res.end();
            }
            return res.status(400).json({ message: 'Unable to generate narration chunks from the uploaded document' });
        }

        pushProgress({ phase: 'synthesizing_audio', message: 'Converting first segment to speech (OpenAI TTS)…' });
        const firstSegment = narrationSegments[0].ssml;
        const [response] = await googleTtsConvert(
            firstSegment,
            narrationSampleHeartzRate,
            narrationSpeakingRate,
            narrationGender,
            narrationLanguageCode,
            narrationVoiceName
        );

        const ext = response.responseFormat || 'mp3';
        const sampleFileName = `sample_output_${id}.${ext}`;

        pushProgress({ phase: 'uploading', message: 'Uploading sample audio…' });
        const { Location } = await uploadAudioBufferToS3(response.audioContent, userId, sampleFileName);

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

    const { narrationSpeakingRate, narrationGender, narrationLanguageCode, narrationVoiceName } = req.body;
    if (req.middlewareRole !== 'ADMIN') {
        return res.status(403).json({ message: 'You are not authorized to access this resource' });
    }

    const stream = wantsNdjsonStream(req);
    const pushProgress = (payload) => {
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
            return res.status(404).json({ message: 'Publisher not found' });
        }

        if (!publisher.pdfURL) {
            logGenerateFullAudio(id, isCompany, 'missing_document_url', {});
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
        const data = await getPdfFromAws(pdfKey);
        logGenerateFullAudio(id, isCompany, 'document_downloaded', {
            s3KeyTail: pdfKey.split('/').slice(-2).join('/'),
            byteLength: Buffer.isBuffer(data) ? data.length : (data?.byteLength ?? 'unknown')
        });

        pushProgress({ phase: 'parsing_document', message: 'Extracting text from PDF or EPUB…' });
        const rawBookText = await extractPlainTextForNarration(data, publisher.pdfURL);
        logGenerateFullAudio(id, isCompany, 'text_extracted', {
            textCharLength: typeof rawBookText === 'string' ? rawBookText.length : 0
        });

        const narrationSegments = await getNarrationSegmentsWithCache({
            publisher,
            isCompany,
            id,
            rawPdfText: rawBookText,
            onProgress: pushProgress
        });
        if (!narrationSegments.length) {
            logGenerateFullAudio(id, isCompany, 'no_narration_segments', { msSinceStart: Date.now() - jobStartedAt });
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

        const audioBuffers = [];
        const ttsStartedAt = Date.now();
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
            audioBuffers.push(response.audioContent);
            const bufLen = response.audioContent?.length ?? 0;
            logGenerateFullAudio(id, isCompany, 'tts_segment_done', {
                segmentIndex: i + 1,
                segmentTotal: narrationSegments.length,
                ssmlChars: narrationSegments[i].ssml?.length ?? 0,
                audioBytes: bufLen,
                segmentMs: segMs
            });
            if (i < narrationSegments.length - 1) {
                await new Promise((resolve) => setTimeout(resolve, 100));
            }
        }
        logGenerateFullAudio(id, isCompany, 'tts_batch_complete', {
            segmentTotal: narrationSegments.length,
            ttsTotalMs: Date.now() - ttsStartedAt
        });

        const singleAudio = Buffer.concat(audioBuffers);
        const fullAudioFileName = `full_output_${id}.mp3`;
        logGenerateFullAudio(id, isCompany, 'audio_concatenated', {
            combinedBytes: singleAudio.length
        });

        pushProgress({ phase: 'uploading', message: 'Uploading combined audiobook file…' });
        const { Location } = await uploadAudioBufferToS3(singleAudio, userId, fullAudioFileName);
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

        logGenerateFullAudio(id, isCompany, 'job_complete', {
            msTotal: Date.now() - jobStartedAt,
            completeAudioUrl: Location
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
        console.error('Error in generateFullAudio:', error);
        if (stream && res.headersSent) {
            writeNdjsonLine(res, { type: 'error', message: error.message || 'Internal server error' });
            return res.end();
        }
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};