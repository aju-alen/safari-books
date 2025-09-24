import PdfParse from 'pdf-parse';
import textToSpeech from '@google-cloud/text-to-speech';
import AWS from 'aws-sdk';
import { writeFile } from 'fs/promises';



import { PrismaClient } from '@prisma/client'

import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();

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
//                 client_email: "vertexai@safari-books.iam.gserviceaccount.com",
//                 private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC++pZy2X7yIgkA\nJfqYihd5X4tYj4xF5Ysr97C7dXbd48w0UBE0A1+4brDPekBtakwVao511XvYsWCz\n44x4eezb/OYD65skRVJzeOjf87Z5k8VaHpbUoXET6mb/NsOdw8T2M2mgC1seip7i\n8cWGDYHR3VtCdUKaEnQ+uHAXoliwqSgyUvjEh1vw34mrTRPCrJMX3TbfX22QffFy\nG8U/Ynh5ZZJPWM/NbGLUCBVfMuH4UN/yvlK/mN/3twZSm774qKi5ClqVEg0GCC3g\nppmE9D/HwhL3N+2I5nnlaH6rJD1eT2/Vxe23kObApTsgBmIhlr8jMrdThomiB0Ff\n43TqtqJTAgMBAAECggEAHmXlj5dV8PWA6ECjUCde0CdolyqWIcQFMHTm8Rej2XK6\nXLNH4bcNw93+j6++VIwgWyJQVaoq4dVt9oQoJj8F+AgblpEoaxALrSyYKJlyuIxQ\nU+Vdja+6v3hGd6YAYfq4vZV2YQ6drNFUs/vWvF0nBkANGBlxBfQdA6S41tI0+r1S\n++V+/ZoaQmU98DU9x7mpOshRbyUiA/uqu+yHn+YFJr20VdHzwhf3EyqBzw6uRZJH\nIHicRwNLIZpeVwtDCX8ZSjS3V+9Y7+lQckaqVEc03Bcrr2g/9BEMsS7dVYGhoQRQ\nVUx7QMQ/tY+v2N2CoQB4VS4VBajWMBGIky2jgnSLyQKBgQD+seQyEf/2u6lEqSwM\nAMq6J/4QqvX5yizTDnXCqKTTRTW64uq6Bcdxc4HQ5oJl7Qe6niXP1Wg4rAmUV214\nLqsOCCAoMElGOmzTn6M3TZZ1+Yfww29LpT3Q2IOH+oeUeF89T4knQoLzmeAyibNR\n9jc4EBNLC25q35AiAdZbO5zY2QKBgQC/9R0YErcbRynqzxRIEWiweF4rHSU2P1Yr\nONSDo8S/rV/H072lLzO7Ge4dEbcjrYaBgCNVgsW2WqXHDgzi7NXqEutcgJ8VnWby\n2Rdk8RR0zOOLxqa4VirU/2heR+VojERENBQY304QXCYlDbU6Pqj1Yg+mf9SWQJnV\nE5BXXZk5CwKBgCkxzJ7smmHl6HLaie1HE4MYhNddT3ufX7CjXhil/kLNpusbWKvN\n03xeGlkXb2/c7qsYeTUsZzcDXGlJ2sLdiX0zgz/8z100hfWUlGmVewiJ25rtgUrS\n5zSoUF3l/5fcAEuCWcSn1VZhRQnni8Ft+XBv6S7yImHW1xEpCuqmsa/BAoGBAJ9Z\nVyGYx7A5Ty7BYNDCwulbwrB/rVhvE5UlxCTTWozT2+MCfzgVCxiS2fv/rMxNTI9M\nVAi0WnSao2uu2ju25408z20myOkklUWbubPt/VFIlMx/x/7WaRAQRg+eF27GohUM\nNnK/TQp/tJql2n/TbGbnVJ6fF1bzocAkUXp1FLEpAoGAKwa4a2VChGzm2fnXENLR\nFWc4ICRVF2SbQzdZ3FrsEZspisK/+rZVXEqVTqq6pHoJD5E44Yy2UwC6s8TjMGyM\nWQBsFBaiKezKwsP6wgfkHMe4QBVxxKghC+OPoWrXwRmxdUmMBjA1Po9kRx7lOa8t\ntPPZwbEyLSx3DUfvG/4Mlak=\n-----END PRIVATE KEY-----\n",
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