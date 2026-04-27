import { EPub } from 'epub2';

export const htmlToPlainText = (html = '') =>
  String(html || '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim();

const getChapterHtml = (epub, chapterId) =>
  new Promise((resolve, reject) => {
    epub.getChapter(chapterId, (err, html) => {
      if (err) reject(err);
      else resolve(html);
    });
  });

/**
 * Parse an EPUB file already loaded as a buffer (e.g. from S3).
 */
export const extractEpubPlainTextFromBuffer = async (buffer) => {
  const epub = new EPub(buffer);
  await new Promise((resolve, reject) => {
    epub.on('error', reject);
    epub.on('end', resolve);
    epub.parse();
  });

  const contents = epub.spine?.contents || epub.flow || [];
  const chunks = [];

  for (let i = 0; i < contents.length; i++) {
    const item = contents[i];
    const id = item?.id;
    if (!id) continue;
    try {
      const html = await getChapterHtml(epub, id);
      const plain = htmlToPlainText(html);
      if (plain) chunks.push(plain);
    } catch (err) {
      console.warn(`Skipping EPUB spine item ${id}: ${err.message}`);
    }
  }

  if (!chunks.length) {
    throw new Error('No readable chapter text found in EPUB');
  }

  return chunks.join('\n\n');
};

export const getFirstChapterPlainFromBuffer = async (buffer) => {
  const epub = new EPub(buffer);
  await new Promise((resolve, reject) => {
    epub.on('error', reject);
    epub.on('end', resolve);
    epub.parse();
  });
  const first = epub.spine?.contents?.[0];
  if (!first?.id) throw new Error('No chapters found in EPUB');
  const html = await getChapterHtml(epub, first.id);
  return htmlToPlainText(html);
};
