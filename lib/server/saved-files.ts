import fs from 'fs/promises';
import path from 'path';

const DATA_PATH = process.env.DATA_PATH || path.join(process.cwd(), 'data');
const TEXTS_DIR = path.join(DATA_PATH, 'texts');

// Helper to ensure directory exists
async function ensureDir() {
  try {
    // console.log(`Checking access to: ${TEXTS_DIR}`);
    await fs.access(TEXTS_DIR);
  } catch (error) {
    console.log(`Creating directory: ${TEXTS_DIR}`);
    try {
      await fs.mkdir(TEXTS_DIR, { recursive: true });
    } catch (mkdirError) {
      console.error(`Failed to create directory ${TEXTS_DIR}:`, mkdirError);
      throw mkdirError;
    }
  }
}

export async function getSavedTexts() {
  await ensureDir();
  const files = await fs.readdir(TEXTS_DIR);
  const textFiles = files.filter(file => file.endsWith('.txt'));
  
  const texts = await Promise.all(textFiles.map(async (file) => {
    const filePath = path.join(TEXTS_DIR, file);
    const stat = await fs.stat(filePath);
    return {
      filename: file,
      name: file.replace('.txt', ''),
      createdAt: stat.birthtime,
      updatedAt: stat.mtime
    };
  }));

  // Sort by newest first
  return texts.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}

export async function saveText(name: string, content: string) {
  await ensureDir();
  // Sanitize filename to prevent directory traversal
  const safeName = name.replace(/[^a-z0-9\u00C0-\u00FF \-_]/gi, '').trim() || 'Sem Titulo';
  const filename = `${safeName}.txt`;
  const filePath = path.join(TEXTS_DIR, filename);
  
  await fs.writeFile(filePath, content, 'utf-8');
  return { filename, name: safeName };
}

export async function deleteText(filename: string) {
  await ensureDir();
  const safeFilename = path.basename(filename); // Ensure no path traversal
  const filePath = path.join(TEXTS_DIR, safeFilename);
  await fs.unlink(filePath);
}

export async function getText(filename: string) {
  await ensureDir();
  const safeFilename = path.basename(filename);
  const filePath = path.join(TEXTS_DIR, safeFilename);
  return await fs.readFile(filePath, 'utf-8');
}
