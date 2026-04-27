import { getPdfFromAws } from './getPdfFromAws.js';
import { extractEpubPlainTextFromBuffer, getFirstChapterPlainFromBuffer } from './epubTextFromBuffer.js';

/** Full book plain text from S3 key (reuses generic S3 getter). */
export const parseEpubFromAws = async (epubKey) => {
  const epubBuffer = await getPdfFromAws(epubKey);
  const fullText = await extractEpubPlainTextFromBuffer(epubBuffer);
  return [{ id: 'full', title: 'Book', text: fullText }];
};

export const getFirstChapterText = async (epubKey) => {
  const epubBuffer = await getPdfFromAws(epubKey);
  return getFirstChapterPlainFromBuffer(epubBuffer);
};
