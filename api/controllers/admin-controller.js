import PdfParse from 'pdf-parse';
import textToSpeech from '@google-cloud/text-to-speech';
import AWS from 'aws-sdk';
import { writeFile } from 'fs/promises';
import { prisma } from '../utils/database.js'





import dotenv from "dotenv";
dotenv.config();



const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  });
  
  // S3 details
  const bucketName = "safari-books-mobile";
  const fileKey = "clwymbela0001coko5h4b0mar/rfsexrn09v6f14qt83vkn9d4/verificationfiles/9781780227320-1120545.pdf";

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
//                 client_email: "clientemail on json",
//                 private_key: "private key on json",
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
            
//             const [response] = await client.synthesizeSpeech(request);
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

// // Helper function to split text into chunks
// function splitTextIntoChunks(text, maxLength) {
//     const chunks = [];
//     let currentChunk = '';
    
//     // Split by sentences first, then by words if needed
//     const sentences = text.split(/[.!?]+/);
    
//     for (const sentence of sentences) {
//         if (sentence.trim().length === 0) continue;
        
//         // If adding this sentence would exceed the limit
//         if (currentChunk.length + sentence.length > maxLength) {
//             if (currentChunk.length > 0) {
//                 chunks.push(currentChunk.trim());
//                 currentChunk = sentence;
//             } else {
//                 // Sentence is too long, split by words
//                 const words = sentence.split(' ');
//                 let wordChunk = '';
                
//                 for (const word of words) {
//                     if (wordChunk.length + word.length + 1 > maxLength) {
//                         if (wordChunk.length > 0) {
//                             chunks.push(wordChunk.trim());
//                             wordChunk = word;
//                         } else {
//                             // Single word is too long, truncate
//                             chunks.push(word.substring(0, maxLength));
//                             wordChunk = word.substring(maxLength);
//                         }
//                     } else {
//                         wordChunk += (wordChunk.length > 0 ? ' ' : '') + word;
//                     }
//                 }
                
//                 if (wordChunk.length > 0) {
//                     currentChunk = wordChunk;
//                 }
//             }
//         } else {
//             currentChunk += (currentChunk.length > 0 ? '. ' : '') + sentence;
//         }
//     }
    
//     if (currentChunk.length > 0) {
//         chunks.push(currentChunk.trim());
//     }
    
//     return chunks;
// }