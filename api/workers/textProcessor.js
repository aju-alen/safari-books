import { parentPort, workerData } from 'worker_threads';
import PdfParse from 'pdf-parse';

// Text chunking function (moved from utils)
function splitTextIntoChunks(text, maxLength) {
    const chunks = [];
    let currentChunk = '';
    
    // Split by sentences first, then by words if needed
    const sentences = text.split(/[.!?]+/);
    
    for (const sentence of sentences) {
        if (sentence.trim().length === 0) continue;
        
        // If adding this sentence would exceed the limit
        if (currentChunk.length + sentence.length > maxLength) {
            if (currentChunk.length > 0) {
                chunks.push(currentChunk.trim());
                currentChunk = sentence;
            } else {
                // Sentence is too long, split by words
                const words = sentence.split(' ');
                let wordChunk = '';
                
                for (const word of words) {
                    if (wordChunk.length + word.length + 1 > maxLength) {
                        if (wordChunk.length > 0) {
                            chunks.push(wordChunk.trim());
                            wordChunk = word;
                        } else {
                            // Single word is too long, truncate
                            chunks.push(word.substring(0, maxLength));
                            wordChunk = word.substring(maxLength);
                        }
                    } else {
                        wordChunk += (wordChunk.length > 0 ? ' ' : '') + word;
                    }
                }
                
                if (wordChunk.length > 0) {
                    currentChunk = wordChunk;
                }
            }
        } else {
            currentChunk += (currentChunk.length > 0 ? '. ' : '') + sentence;
        }
    }
    
    if (currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
    }
    
    return chunks;
}

// Main processing function
async function processTextData(pdfBuffer, chunkSize = 1000) {
    try {
        // Send progress update
        parentPort.postMessage({ 
            type: 'progress', 
            message: 'Starting PDF parsing...',
            progress: 10 
        });

        // Parse PDF
        const pdfData = await PdfParse(pdfBuffer);
        
        parentPort.postMessage({ 
            type: 'progress', 
            message: 'PDF parsed, cleaning text...',
            progress: 30 
        });

        // Clean text
        const cleanedText = pdfData.text
            .replace(/\s+/g, ' ')
            .replace(/\n\s+/g, '\n')
            .replace(/\s+\n/g, '\n')
            .trim();
        
        parentPort.postMessage({ 
            type: 'progress', 
            message: 'Text cleaned, splitting into chunks...',
            progress: 60 
        });

        // Split into chunks
        const textChunks = splitTextIntoChunks(cleanedText, chunkSize);
        
        parentPort.postMessage({ 
            type: 'progress', 
            message: 'Text processing completed',
            progress: 100 
        });

        // Send final result
        parentPort.postMessage({
            type: 'success',
            data: {
                cleanedText,
                textChunks,
                totalChunks: textChunks.length,
                textLength: cleanedText.length
            }
        });

    } catch (error) {
        parentPort.postMessage({
            type: 'error',
            error: {
                message: error.message,
                stack: error.stack
            }
        });
    }
}

// Handle incoming data
if (workerData) {
    const { pdfBuffer, chunkSize } = workerData;
    processTextData(pdfBuffer, chunkSize);
}

// Handle messages from main thread
parentPort.on('message', (message) => {
    if (message.type === 'process') {
        const { pdfBuffer, chunkSize } = message.data;
        processTextData(pdfBuffer, chunkSize);
    }
});
