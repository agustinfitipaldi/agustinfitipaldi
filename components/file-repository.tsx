import { list } from '@vercel/blob';
import { FileText } from 'lucide-react';

export async function FileRepository() {
  const { blobs } = await list();

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-4">File Repository</h2>
      <div className="grid gap-4">
        {blobs.map((blob) => (
          <a
            key={blob.url}
            href={blob.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group p-4 border rounded-lg hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <h3 className="text-xl font-semibold">{blob.pathname}</h3>
            </div>
            <p className="text-muted-foreground mt-2">
              {new Date(blob.uploadedAt).toLocaleDateString()}
            </p>
          </a>
        ))}
      </div>
    </section>
  );
} 