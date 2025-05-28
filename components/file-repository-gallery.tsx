'use server';

import { list } from '@vercel/blob';
import Link from 'next/link';
import { FileText } from 'lucide-react';
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

const CATEGORY_COLORS: Record<string, string> = {
  economics: 'bg-blue-200 text-blue-800',
  history: 'bg-yellow-200 text-yellow-800',
  math: 'bg-green-200 text-green-800',
  restored: 'bg-purple-200 text-purple-800',
  // add more as needed
};

export async function FileRepositoryGallery() {
  const { blobs } = await list();

  // Load frontmatter for each file if markdown exists
  const filesWithMeta = await Promise.all(
    blobs.map(async (blob) => {
      const baseName = blob.pathname.replace(/\.[^/.]+$/, "");
      const mdPath = path.join(process.cwd(), 'content/files', `${baseName}.md`);
      let meta = { title: '', category: '' };
      try {
        const md = await fs.readFile(mdPath, 'utf8');
        const { data } = matter(md);
        meta = {
          title: data.title || '',
          category: data.category || '',
        };
      } catch {}
      return { ...blob, meta };
    })
  );

  return (
    <section className="max-w-2xl mx-auto px-8 pt-24 sm:pt-24 mb-12">
      <h2 className="text-2xl font-bold mb-4">File Repository</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {filesWithMeta.map((blob) => (
          <Link
            key={blob.url}
            href={`/files/${encodeURIComponent(blob.pathname)}`}
            className="group p-6 border rounded-lg hover:bg-accent transition-colors flex flex-col items-center aspect-[4/5] justify-center"
          >
            <FileText className="h-12 w-12 mb-3" />
            <span className="text-center text-lg font-semibold break-words mb-2">
              {blob.meta.title || blob.pathname}
            </span>
            {blob.meta.category && (
              <span className={`px-2 py-1 rounded text-xs font-bold ${CATEGORY_COLORS[blob.meta.category.toLowerCase()] || 'bg-gray-200 text-gray-800'}`}>
                {blob.meta.category}
              </span>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
} 