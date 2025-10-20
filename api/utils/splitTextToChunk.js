export const splitTextIntoChunks = (text, maxLength) => {
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