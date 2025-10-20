import PdfParse from 'pdf-parse';
import AWS from 'aws-sdk';
import { prisma } from '../utils/database.js'
import { getPdfFromAws } from '../utils/getPdfFromAws.js'
import { googleTtsConvert } from '../utils/google-tts-convert.js'
import { uploadAudioBufferToS3 } from '../utils/uploadAudioBuffer.js'
import { splitTextIntoChunks } from '../utils/splitTextToChunk.js'


import dotenv from "dotenv";
dotenv.config();

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
        
        // Get PDF from S3
        const pdfKey = publisher.pdfURL.split('/').slice(3).join('/'); 

        const userId = pdfKey.split('/').slice(0,3).join('/');
        
        const data = await getPdfFromAws(pdfKey);
        
        const pdfData = await PdfParse(data);
        
        const cleanedText = pdfData.text
            .replace(/\s+/g, ' ')
            .replace(/\n\s+/g, '\n')
            .replace(/\s+\n/g, '\n')
            .trim();
        
        console.log("Cleaned PDF Text length:", cleanedText.length);
        
        // Split text into chunks of 4000 characters (safe limit)
        const textChunks = splitTextIntoChunks(cleanedText, 1000);
        console.log(`Split into ${textChunks} chunks`);
        
        
        // Process first chunk only for sample
        const firstChunk = textChunks[0];
        console.log(`Processing sample chunk (${firstChunk.length} characters)`);
        
        const [response] = await googleTtsConvert(firstChunk, narrationSampleHeartzRate, narrationSpeakingRate, narrationGender, narrationLanguageCode, narrationVoiceName);

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
        
        const cleanedText = pdfData.text
            .replace(/\s+/g, ' ')
            .replace(/\n\s+/g, '\n')
            .replace(/\s+\n/g, '\n')
            .trim();
        
        console.log("Cleaned PDF Text length:", cleanedText.length);

        const textChunks = splitTextIntoChunks(cleanedText, 4000);
        console.log(`Split into ${textChunks.length} chunks`);
        
        
        // Process each chunk and combine audio
        const audioBuffers = [];
        
        for (let i = 0; i < textChunks.length; i++) {
            console.log(`Processing chunk ${i + 1}/${textChunks.length}`);
            
            
            const [response] =  await googleTtsConvert(textChunks[i], narrationSampleHeartzRate, narrationSpeakingRate, narrationGender, narrationLanguageCode, narrationVoiceName);
            audioBuffers.push(response.audioContent);
            
            // Add small delay between requests to avoid rate limiting
            if (i < textChunks.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
        console.log(audioBuffers, 'this is audioBuffers');

        const singleAudioBuffer = audioBuffers[0];

        const SingleAudio = Buffer.concat([singleAudioBuffer]);

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