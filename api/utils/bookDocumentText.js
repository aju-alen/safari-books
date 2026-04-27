import PdfParse from 'pdf-parse';
import { extractEpubPlainTextFromBuffer } from './epubTextFromBuffer.js';

const inferKindFromUrl = (url = '') => {
  const base = String(url).split('?')[0].split('#')[0].toLowerCase();
  if (base.endsWith('.epub')) return 'epub';
  if (base.endsWith('.pdf')) return 'pdf';
  return null;
};

const inferKindFromBuffer = (buffer) => {
  const buf = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  if (buf.length < 5) return null;
  const head = buf.slice(0, 5).toString('ascii');
  if (head.startsWith('%PDF')) return 'pdf';
  if (buf[0] === 0x50 && buf[1] === 0x4b) return 'epub';
  return null;
};

/**
 * Load bytes from S3 (or any source) and return plain text for narration chunking.
 * Supports PDF and EPUB; prefers URL extension, then magic bytes, then parse attempts.
 */
export const extractPlainTextForNarration = async (buffer, documentUrl = '') => {
  const fromUrl = inferKindFromUrl(documentUrl);
  const fromMagic = inferKindFromBuffer(buffer);
  const kind = fromUrl || fromMagic;

  if (kind === 'epub') {
    return extractEpubPlainTextFromBuffer(buffer);
  }
  if (kind === 'pdf') {
    const pdfData = await PdfParse(buffer);
    return typeof pdfData.text === 'string' ? pdfData.text : '';
  }

  try {
    const pdfData = await PdfParse(buffer);
    const t = typeof pdfData.text === 'string' ? pdfData.text : '';
    if (t.trim()) return t;
  } catch {
    /* not a PDF */
  }

  try {
    return await extractEpubPlainTextFromBuffer(buffer);
  } catch (e) {
    throw new Error(`Could not read document as PDF or EPUB: ${e.message}`);
  }
};
