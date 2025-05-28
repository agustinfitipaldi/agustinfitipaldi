import { list } from '@vercel/blob';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

export default async function FilesPage() {
  const { blobs } = await list();

  return (
    <div className="max-w-2xl mx-auto px-8 pt-4 sm:pt-64 pb-96">
      <h1 className="text-4xl font-bold mb-8">Files</h1>
      <div className="flex flex-col gap-4">
        {blobs.map((blob) => (
          <Link key={blob.pathname} href={`/files/${blob.pathname}`}>
            <Card className="transition-colors hover:bg-muted/50">
              <CardContent className="p-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold">{blob.pathname}</h2>
                  <p className="text-sm text-muted-foreground">
                    {new Date(blob.uploadedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
} 