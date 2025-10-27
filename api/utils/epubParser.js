
import { EPub } from 'epub2';
import { getPdfFromAws } from './getPdfFromAws.js';

export const parseEpubFromAws = async (epubKey) => {
    try {
        // Get EPUB file from S3
        const epubBuffer = await getPdfFromAws(epubKey);
        
        // Parse EPUB
        const epub = new EPub(epubBuffer);
        await epub.parse();
        
        // Extract chapters
        const chapters = [];
        
        // Get all spine items (chapters)
        const spine = epub.spine;
        
        for (let i = 0; i < spine.length; i++) {
            const item = spine[i];
            const chapterData = await epub.getChapter(item.id);
            
            if (chapterData && chapterData.text) {
                // Clean the text similar to PDF processing
                const cleanedText = chapterData.text
                    .replace(/\s+/g, ' ')
                    .replace(/\n\s+/g, '\n')
                    .replace(/\s+\n/g, '\n')
                    .trim();
                
                if (cleanedText.length > 0) {
                    chapters.push({
                        id: item.id,
                        title: item.title || `Chapter ${i + 1}`,
                        text: cleanedText
                    });
                }
            }
        }
        
        return chapters;
    } catch (error) {
        console.error('Error parsing EPUB:', error);
        throw error;
    }
};

export const getFirstChapterText = async (epubKey) => {
    try {
        const chapters = await parseEpubFromAws(epubKey);
        
        if (chapters.length === 0) {
            throw new Error('No chapters found in EPUB');
        }
        
        // Return the first chapter's text
        return chapters[0].text;
    } catch (error) {
        console.error('Error getting first chapter:', error);
        throw error;
    }
};
