// Example usage of the worker thread system

import { processTextWithWorker, processTextSync } from './textProcessorWorker.js';

/**
 * Example function showing how to use worker threads with fallback
 */
export const processTextWithFallback = async (pdfBuffer, chunkSize = 1000) => {
    try {
        // Try worker thread first
        console.log('Attempting to process with worker thread...');
        const result = await processTextWithWorker(
            pdfBuffer, 
            chunkSize,
            (progress, message) => {
                console.log(`Worker Progress: ${progress}% - ${message}`);
            }
        );
        
        console.log('Worker thread processing completed successfully');
        return result;
        
    } catch (workerError) {
        console.warn('Worker thread failed, falling back to synchronous processing:', workerError.message);
        
        try {
            // Fallback to synchronous processing
            const result = await processTextSync(pdfBuffer, chunkSize);
            console.log('Synchronous processing completed successfully');
            return result;
            
        } catch (syncError) {
            console.error('Both worker and sync processing failed:', syncError);
            throw new Error(`Text processing failed: ${syncError.message}`);
        }
    }
};

/**
 * Example of processing multiple PDFs concurrently
 */
export const processMultiplePDFs = async (pdfBuffers, chunkSize = 1000) => {
    const promises = pdfBuffers.map((buffer, index) => 
        processTextWithWorker(buffer, chunkSize)
            .then(result => ({ index, result, success: true }))
            .catch(error => ({ index, error, success: false }))
    );
    
    const results = await Promise.allSettled(promises);
    
    return results.map((result, index) => {
        if (result.status === 'fulfilled') {
            return result.value;
        } else {
            return {
                index,
                error: result.reason.message,
                success: false
            };
        }
    });
};
