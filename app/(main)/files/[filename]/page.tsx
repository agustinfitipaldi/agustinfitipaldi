import { head } from '@vercel/blob';
import { notFound } from 'next/navigation';
import fs from 'fs/promises';
import path from 'path';
import { marked } from 'marked';
import matter from 'gray-matter';

const CATEGORY_COLORS: Record<string, string> = {
  economics: 'bg-blue-200 text-blue-800',
  history: 'bg-yellow-200 text-yellow-800',
  math: 'bg-green-200 text-green-800',
  restored: 'bg-purple-200 text-purple-800',
  // add more as needed
};

export default async function FileDetailPage({ params }: { params: { filename: string } }) {
  const { filename } = params;
  
  if (!filename) {
    return notFound();
  }

  let blob;
  try {
    blob = await head(filename);
    if (!blob || typeof blob !== 'object') {
      return notFound();
    }
  } catch (error) {
    console.error('Error fetching blob:', error);
    return notFound();
  }

  // Validate blob properties
  if (!blob.url || !blob.pathname || typeof blob.url !== 'string' || typeof blob.pathname !== 'string') {
    console.error('Invalid blob properties:', blob);
    return notFound();
  }

  // Try to load a markdown writeup with the same name (without extension)
  let notesHtml = null;
  let meta = { title: '', category: '' };
  const baseName = filename.replace(/\.[^/.]+$/, "");
  const mdPath = path.join(process.cwd(), 'content/files', `${baseName}.md`);
  
  try {
    const md = await fs.readFile(mdPath, 'utf8');
    const { data, content } = matter(md);
    notesHtml = marked(content);
    meta = {
      title: data.title || '',
      category: data.category || '',
    };
  } catch (error) {
    console.error('Error loading markdown:', error);
  }

  const displayTitle = meta.title || blob.pathname;
  const categoryColor = meta.category ? CATEGORY_COLORS[meta.category.toLowerCase()] || 'bg-gray-200 text-gray-800' : '';

  return (
    <div className="max-w-2xl mx-auto px-8 pt-24 pb-16">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{displayTitle}</h1>
        {meta.category && (
          <span className={`px-2 py-1 rounded text-xs font-bold ${categoryColor}`}>
            {meta.category}
          </span>
        )}
      </div>
      
      <div className="mb-8">
        <a
          href={blob.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 transition-colors"
        >
          View File
        </a>
      </div>

      {notesHtml && (
        <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: notesHtml }} />
      )}
    </div>
  );
}