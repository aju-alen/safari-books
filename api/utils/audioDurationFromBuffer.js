import { parseBuffer } from 'music-metadata';

export const getAudioDurationMs = async (audioBuffer, mimeType = 'audio/mpeg') => {
    if (!Buffer.isBuffer(audioBuffer) || audioBuffer.length === 0) {
        throw new Error('Audio buffer is empty or invalid');
    }

    const metadata = await parseBuffer(audioBuffer, { mimeType });
    const seconds = metadata?.format?.duration;
    if (!Number.isFinite(seconds) || seconds <= 0) {
        throw new Error('Unable to read audio duration from metadata');
    }

    return Math.round(seconds * 1000);
};

