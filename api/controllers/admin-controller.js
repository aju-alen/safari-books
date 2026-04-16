import PdfParse from 'pdf-parse';
import AWS from 'aws-sdk';
import { prisma } from '../utils/database.js'
import { getPdfFromAws } from '../utils/getPdfFromAws.js'
import { googleTtsConvert } from '../utils/google-tts-convert.js'
import { uploadAudioBufferToS3 } from '../utils/uploadAudioBuffer.js'
import { buildSmartNarrationChunksWithChatGpt } from '../utils/chatgpt-smart-chunks.js'


import dotenv from "dotenv";
dotenv.config();

const MIN_SEGMENT_WORDS = 150;
const TARGET_SEGMENT_WORDS = 220;
const MAX_SEGMENT_WORDS = 300;

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
    rawPdfText
}) => {
    const cachedSegments = parseStoredNarrationSegments(publisher?.narrationSegments);
    if (cachedSegments.length > 0) {
        return cachedSegments;
    }

    const generatedSegments = await buildSmartNarrationChunksWithChatGpt(rawPdfText, buildNarrationSegments);
    if (!generatedSegments.length) {
        return [];
    }

    const serialized = JSON.stringify(generatedSegments);
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
    if(req.middlewareRole !== 'ADMIN'){
        return res.status(403).json({message: "You are not authorized to access this resource"});
    }
    
    try {
        // Get publisher data
        let publisher;
        if(isCompany === 'true') {
            publisher = await prisma.company.findUnique({
                where: { id: id }
            });
        } else {
            publisher = await prisma.author.findUnique({
                where: { id: id }
            });
        }
        
        if (!publisher) {
            return res.status(404).json({message: "Publisher not found"});
        }
        
        if (!publisher.pdfURL) {
            return res.status(400).json({message: "No PDF URL found for this publisher"});
        }
        console.log(publisher.pdfURL, 'this is pdfURL');
        // Get PDF from S3
        const pdfKey = publisher.pdfURL.split('/').slice(3).join('/'); 

        const userId = pdfKey.split('/').slice(0,3).join('/');
        console.log(pdfKey, 'this is pdfKey');
        const data = await getPdfFromAws(pdfKey);
        console.log(data, 'this is data');
        const pdfData = await PdfParse(data);
        console.log(pdfData.text, 'this is pdfData.text');
        const narrationSegments = await getNarrationSegmentsWithCache({
            publisher,
            isCompany,
            id,
            rawPdfText: pdfData.text
        });

        console.log(narrationSegments, 'this is narrationSegments');
        if (!narrationSegments.length) {
            return res.status(400).json({message: "Unable to generate narration chunks from PDF"});
        }

        const firstSegment = narrationSegments[0].ssml;
        console.log(`Processing sample chunk (${firstSegment.length} characters)`);

        // Build a 
        
        const [response] = await googleTtsConvert(firstSegment, narrationSampleHeartzRate, narrationSpeakingRate, narrationGender, narrationLanguageCode, narrationVoiceName);

        console.log(response, 'this is response');
        
        // Upload sample audio buffer to S3 using the S3 controller function
        const sampleFileName = `sample_output_${id}.mp3`;
        
        try {
            const {Location} = await uploadAudioBufferToS3(
                response.audioContent, 
                userId, 
                sampleFileName
            );
            console.log(Location, 'this is uploadResult waiting for the db to be updated');

            if(isCompany === 'true'){
                await prisma.company.update({
                    where: { id: id },
                    data: { audioSampleURL: Location }
                });
            }
            else{
                await prisma.author.update({
                    where: { id: id },
                    data: { audioSampleURL: Location }
                });
            }
            
            return res.status(200).json({
                message: "Sample audio generated and uploaded successfully",
            });
        } catch (uploadError) {
            console.error('Error uploading to S3:', uploadError);
            return res.status(500).json({
                message: "Error uploading audio to S3",
                error: uploadError.message
            });
        }
        
    } catch (error) {
        console.error('Error in sendSampleAudio:', error);
        return res.status(500).json({message: "Internal server error", error: error.message});
    }
}

export const generateFullAudio = async (req, res) => {
    const {id} = req.params;
    const {isCompany} = req.query;

    const {narrationSampleHeartzRate, narrationSpeakingRate, narrationGender, narrationLanguageCode, narrationVoiceName} = req.body;
    if(req.middlewareRole !== 'ADMIN'){
        return res.status(403).json({message: "You are not authorized to access this resource"});
    }
    
    try {
        // Get publisher data
        let publisher;
        if(isCompany === 'true') {
            publisher = await prisma.company.findUnique({
                where: { id: id }
            });
        } else {
            publisher = await prisma.author.findUnique({
                where: { id: id }
            });
        }
        
        if (!publisher) {
            return res.status(404).json({message: "Publisher not found"});
        }
        
        if (!publisher.pdfURL) {
            return res.status(400).json({message: "No PDF URL found for this publisher"});
        }
        
        // Get PDF from S3
        const pdfKey = publisher.pdfURL.split('/').slice(3).join('/'); 

        const userId = pdfKey.split('/').slice(0,3).join('/');
        
        const data = await getPdfFromAws(pdfKey);
        
        const pdfData = await PdfParse(data);
        
        const narrationSegments = await getNarrationSegmentsWithCache({
            publisher,
            isCompany,
            id,
            rawPdfText: pdfData.text
        });
        if (!narrationSegments.length) {
            return res.status(400).json({message: "Unable to generate narration chunks from PDF"});
        }
        console.log(`Prepared ${narrationSegments.length} SSML narration segments`);
        
        
        // Process each chunk and combine audio
        const audioBuffers = [];
        
        for (let i = 0; i < narrationSegments.length; i++) {
            console.log(`Processing chunk ${i + 1}/${narrationSegments.length}`);
            
            
            const [response] =  await googleTtsConvert(narrationSegments[i].ssml, narrationSampleHeartzRate, narrationSpeakingRate, narrationGender, narrationLanguageCode, narrationVoiceName);
            audioBuffers.push(response.audioContent);
            
            // Add small delay between requests to avoid rate limiting
            if (i < narrationSegments.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
        console.log(audioBuffers, 'this is audioBuffers');
        const SingleAudio = Buffer.concat(audioBuffers);

        const fullAudioFileName = `full_output_${id}.mp3`;

        try {
            const {Location} = await uploadAudioBufferToS3(
                SingleAudio, 
                userId, 
                fullAudioFileName
            );
            console.log(Location, 'this is uploadResult waiting for the db to be updated');

            if(isCompany === 'true'){
                await prisma.company.update({
                    where: { id: id },
                    data: { completeAudioUrl: Location }
                });
            }
            else{
                await prisma.author.update({
                    where: { id: id },
                    data: { completeAudioUrl: Location }
                });
            }
            
            return res.status(200).json({
                message: "Full audio generated and uploaded successfully",
            });
        } catch (uploadError) {
            console.error('Error uploading to S3:', uploadError);
            return res.status(500).json({
                message: "Error uploading audio to S3",
                error: uploadError.message
            });
        }
        
        
    } catch (error) {
        console.error('Error in generateFullAudio:', error);
        return res.status(500).json({message: "Internal server error", error: error.message});
    }
}