'use server';

import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

export async function getFileNotes(filename) {
  try {
    const baseName = filename.replace(/\.[^/.]+$/, "");
    const mdPath = path.join(process.cwd(), 'content/files', `${baseName}.md`);
    
    const md = await fs.readFile(mdPath, 'utf8');
    const { data, content } = matter(md);
    const html = await marked.parse(content, { async: true });
    
    return {
      html: typeof html === 'string' ? html : null,
      meta: {
        title: data.title || '',
        category: data.category || '',
      }
    };
  } catch (error) {
    console.error('Error loading markdown:', error);
    return {
      html: null,
      meta: {
        title: '',
        category: '',
      }
    };
  }
} 