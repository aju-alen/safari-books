import { Worker } from 'worker_threads';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Process PDF text using a worker thread
 * @param {Buffer} pdfBuffer - The PDF buffer to process
 * @param {number} chunkSize - Size of text chunks (default: 1000)
 * @param {Function} onProgress - Optional progress callback
 * @returns {Promise<Object>} Processed text data
 */
export const processTextWithWorker = (pdfBuffer, chunkSize = 1000, onProgress = null) => {
    return new Promise((resolve, reject) => {
        // Create worker thread
        const workerPath = path.join(__dirname, '../workers/textProcessor.js');
        const worker = new Worker(workerPath, {
            workerData: {
                pdfBuffer,
                chunkSize
            }
        });

        // Handle messages from worker
        worker.on('message', (message) => {
            switch (message.type) {
                case 'progress':
                    console.log(`Worker Progress: ${message.progress}% - ${message.message}`);
                    if (onProgress) {
                        onProgress(message.progress, message.message);
                    }
                    break;
                
                case 'success':
                    console.log('Worker completed successfully');
                    worker.terminate();
                    resolve(message.data);
                    break;
                
                case 'error':
                    console.error('Worker error:', message.error);
                    worker.terminate();
                    reject(new Error(message.error.message));
                    break;
            }
        });

        // Handle worker errors
        worker.on('error', (error) => {
            console.error('Worker thread error:', error);
            worker.terminate();
            reject(error);
        });

        // Handle worker exit
        worker.on('exit', (code) => {
            if (code !== 0) {
                reject(new Error(`Worker stopped with exit code ${code}`));
            }
        });

        // Set timeout for worker (optional)
        const timeout = setTimeout(() => {
            worker.terminate();
            reject(new Error('Worker timeout - text processing took too long'));
        }, 30000); // 30 second timeout

        // Clear timeout when worker completes
        worker.on('message', (message) => {
            if (message.type === 'success' || message.type === 'error') {
                clearTimeout(timeout);
            }
        });
    });
};

/**
 * Process text synchronously (fallback method)
 * @param {Buffer} pdfBuffer - The PDF buffer to process
 * @param {number} chunkSize - Size of text chunks
 * @returns {Promise<Object>} Processed text data
 */
export const processTextSync = async (pdfBuffer, chunkSize = 1000) => {
    const PdfParse = (await import('pdf-parse')).default;
    const { splitTextIntoChunks } = await import('./splitTextToChunk.js');
    
    // Parse PDF
    const pdfData = await PdfParse(pdfBuffer);
    
    // Clean text
    const cleanedText = pdfData.text
        .replace(/\s+/g, ' ')
        .replace(/\n\s+/g, '\n')
        .replace(/\s+\n/g, '\n')
        .trim();
    
    // Split into chunks
    const textChunks = splitTextIntoChunks(cleanedText, chunkSize);
    
    return {
        cleanedText,
        textChunks,
        totalChunks: textChunks.length,
        textLength: cleanedText.length
    };
};
