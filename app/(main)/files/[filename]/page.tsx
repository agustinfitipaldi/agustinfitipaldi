import { head } from '@vercel/blob';
import { notFound } from 'next/navigation';
import { getFileNotes } from '../actions';
import { FileViewer } from '@/app/(main)/files/[filename]/file-viewer';

interface PageProps {
  params: Promise<{ filename: string }>;
}

export default async function FileDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const filename = resolvedParams.filename;
  
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

  // Get notes and metadata from server action
  const { html: notesHtml, meta } = await getFileNotes(filename);
  
  // Convert meta to correct type
  const typedMeta = {
    title: meta.title || undefined,
    category: (meta.category || undefined) as "economics" | "history" | "math" | "restored" | undefined
  };

  return <FileViewer blob={blob} notesHtml={notesHtml || undefined} meta={typedMeta} />;
}