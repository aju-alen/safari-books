import { EventEmitter } from 'events';
import { startBackgroundProcessing } from './backgroundProcessor.js';

class ProcessingQueue extends EventEmitter {
    constructor() {
        super();
        this.queue = [];
        this.processing = false;
        this.maxConcurrent = 3; // Maximum concurrent workers
        this.activeJobs = new Map();
    }

    /**
     * Add a job to the processing queue
     * @param {Object} jobData - Job data including pdfBuffer, userId, id, etc.
     * @returns {string} Job ID
     */
    addJob(jobData) {
        const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const job = {
            id: jobId,
            ...jobData,
            status: 'queued',
            createdAt: Date.now()
        };

        this.queue.push(job);
        console.log(`Job ${jobId} added to queue. Queue length: ${this.queue.length}`);
        
        // Start processing if not already running
        if (!this.processing) {
            this.processQueue();
        }

        return jobId;
    }

    /**
     * Process the queue
     */
    async processQueue() {
        if (this.processing) return;
        this.processing = true;

        while (this.queue.length > 0 && this.activeJobs.size < this.maxConcurrent) {
            const job = this.queue.shift();
            this.startJob(job);
        }

        this.processing = false;
    }

    /**
     * Start processing a job
     * @param {Object} job - Job to process
     */
    startJob(job) {
        job.status = 'processing';
        job.startedAt = Date.now();
        
        this.activeJobs.set(job.id, job);
        
        console.log(`Starting job ${job.id}`);

        // Start background processing
        startBackgroundProcessing(
            job.pdfBuffer,
            job.id,
            (error, result) => {
                this.handleJobComplete(job.id, error, result);
            },
            (progress, message) => {
                this.emit('progress', {
                    jobId: job.id,
                    progress,
                    message
                });
            },
            job.chunkSize || 1000
        );
    }

    /**
     * Handle job completion
     * @param {string} jobId - Job ID
     * @param {Error} error - Error if any
     * @param {Object} result - Processing result
     */
    handleJobComplete(jobId, error, result) {
        const job = this.activeJobs.get(jobId);
        if (!job) return;

        job.status = error ? 'failed' : 'completed';
        job.completedAt = Date.now();
        job.duration = job.completedAt - job.startedAt;
        job.error = error;
        job.result = result;

        this.activeJobs.delete(jobId);

        console.log(`Job ${jobId} ${job.status} in ${job.duration}ms`);

        // Emit completion event
        this.emit('complete', {
            jobId,
            job,
            error,
            result
        });

        // Continue processing queue
        this.processQueue();
    }

    /**
     * Get job status
     * @param {string} jobId - Job ID
     * @returns {Object} Job status
     */
    getJobStatus(jobId) {
        // Check active jobs
        const activeJob = this.activeJobs.get(jobId);
        if (activeJob) {
            return {
                id: jobId,
                status: 'processing',
                progress: 'unknown', // Could be enhanced to track actual progress
                startedAt: activeJob.startedAt,
                duration: Date.now() - activeJob.startedAt
            };
        }

        // Check queue
        const queuedJob = this.queue.find(job => job.id === jobId);
        if (queuedJob) {
            return {
                id: jobId,
                status: 'queued',
                position: this.queue.indexOf(queuedJob) + 1,
                queueLength: this.queue.length
            };
        }

        return { id: jobId, status: 'not_found' };
    }

    /**
     * Get queue statistics
     * @returns {Object} Queue stats
     */
    getStats() {
        return {
            queueLength: this.queue.length,
            activeJobs: this.activeJobs.size,
            maxConcurrent: this.maxConcurrent,
            activeJobIds: Array.from(this.activeJobs.keys())
        };
    }

    /**
     * Cancel a job
     * @param {string} jobId - Job ID to cancel
     * @returns {boolean} Success status
     */
    cancelJob(jobId) {
        // Remove from queue
        const queueIndex = this.queue.findIndex(job => job.id === jobId);
        if (queueIndex !== -1) {
            this.queue.splice(queueIndex, 1);
            return true;
        }

        // Cancel active job
        const activeJob = this.activeJobs.get(jobId);
        if (activeJob) {
            // This would need to be implemented in backgroundProcessor
            // cancelWorker(jobId);
            return true;
        }

        return false;
    }
}

// Create singleton instance
const processingQueue = new ProcessingQueue();

export default processingQueue;
