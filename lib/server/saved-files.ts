import fs from 'fs/promises';
import path from 'path';

const TEXTS_DIR = path.join(process.cwd(), 'data', 'texts');

// Helper to ensure directory exists
async function ensureDir() {
  try {
    await fs.access(TEXTS_DIR);
  } catch {
    await fs.mkdir(TEXTS_DIR, { recursive: true });
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
