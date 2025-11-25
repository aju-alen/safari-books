import { Worker } from 'worker_threads';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Store active workers and their callbacks
const activeWorkers = new Map();

/**
 * Start background text processing without blocking
 * @param {Buffer} pdfBuffer - The PDF buffer to process
 * @param {string} jobId - Unique job identifier
 * @param {Function} onComplete - Callback when processing is complete
 * @param {Function} onProgress - Optional progress callback
 * @param {number} chunkSize - Size of text chunks
 */
export const startBackgroundProcessing = (pdfBuffer, jobId, onComplete, onProgress = null, chunkSize = 1000) => {
    const workerPath = path.join(__dirname, '../workers/textProcessor.js');
    
    const worker = new Worker(workerPath, {
        workerData: {
            pdfBuffer,
            chunkSize
        }
    });

    // Store worker reference
    activeWorkers.set(jobId, {
        worker,
        onComplete,
        onProgress,
        startTime: Date.now()
    });

    // Handle messages from worker
    worker.on('message', (message) => {
        const workerInfo = activeWorkers.get(jobId);
        if (!workerInfo) return;

        switch (message.type) {
            case 'progress':
                console.log(`Background Job ${jobId}: ${message.progress}% - ${message.message}`);
                if (workerInfo.onProgress) {
                    workerInfo.onProgress(message.progress, message.message);
                }
                break;
            
            case 'success':
                console.log(`Background Job ${jobId} completed successfully`);
                workerInfo.onComplete(null, message.data);
                cleanupWorker(jobId);
                break;
            
            case 'error':
                console.error(`Background Job ${jobId} error:`, message.error);
                workerInfo.onComplete(new Error(message.error.message), null);
                cleanupWorker(jobId);
                break;
        }
    });

    // Handle worker errors
    worker.on('error', (error) => {
        console.error(`Background Job ${jobId} worker error:`, error);
        const workerInfo = activeWorkers.get(jobId);
        if (workerInfo) {
            workerInfo.onComplete(error, null);
            cleanupWorker(jobId);
        }
    });

    // Handle worker exit
    worker.on('exit', (code) => {
        if (code !== 0) {
            console.error(`Background Job ${jobId} stopped with exit code ${code}`);
            const workerInfo = activeWorkers.get(jobId);
            if (workerInfo) {
                workerInfo.onComplete(new Error(`Worker stopped with exit code ${code}`), null);
                cleanupWorker(jobId);
            }
        }
    });

    // Set timeout for worker
    setTimeout(() => {
        const workerInfo = activeWorkers.get(jobId);
        if (workerInfo) {
            console.warn(`Background Job ${jobId} timeout - terminating worker`);
            workerInfo.worker.terminate();
            workerInfo.onComplete(new Error('Worker timeout - text processing took too long'), null);
            cleanupWorker(jobId);
        }
    }, 60000); // 60 second timeout

    console.log(`Background processing started for job: ${jobId}`);
    return jobId;
};

/**
 * Clean up worker and remove from active workers
 */
const cleanupWorker = (jobId) => {
    const workerInfo = activeWorkers.get(jobId);
    if (workerInfo) {
        workerInfo.worker.terminate();
        activeWorkers.delete(jobId);
        console.log(`Cleaned up worker for job: ${jobId}`);
    }
};

/**
 * Get status of active workers
 */
export const getActiveWorkers = () => {
    const workers = [];
    for (const [jobId, info] of activeWorkers.entries()) {
        workers.push({
            jobId,
            startTime: info.startTime,
            duration: Date.now() - info.startTime
        });
    }
    return workers;
};

/**
 * Cancel a specific worker
 */
export const cancelWorker = (jobId) => {
    const workerInfo = activeWorkers.get(jobId);
    if (workerInfo) {
        workerInfo.worker.terminate();
        cleanupWorker(jobId);
        return true;
    }
    return false;
};
