"use client";

import { useEffect, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
}

const CATEGORY_COLORS = {
  economics: 'bg-blue-200 text-blue-800',
  history: 'bg-yellow-200 text-yellow-800',
  math: 'bg-green-200 text-green-800',
  restored: 'bg-purple-200 text-purple-800',
  // add more as needed
} as const;

interface BlobInfo {
  url: string;
  pathname: string;
}

interface Meta {
  title?: string;
  category?: keyof typeof CATEGORY_COLORS;
}

interface FileViewerProps {
  blob: BlobInfo;
  notesHtml?: string;
  meta: Meta;
}

export function FileViewer({ blob, notesHtml, meta }: FileViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 800
  );
  const [pdfError, setPdfError] = useState<string | null>(null);
  const isPdf = blob.pathname.toLowerCase().endsWith('.pdf');

  useEffect(() => {
    function handleResize() {
      setWindowWidth(window.innerWidth);
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const displayTitle = meta.title || blob.pathname;
  const categoryColor = meta.category ? CATEGORY_COLORS[meta.category] || 'bg-gray-200 text-gray-800' : '';

  return (
    <div className="relative min-h-screen">
      {/* Left side - Notes and metadata */}
      <div className="fixed left-0 top-0 w-[300px] h-screen p-8 border-r border-border overflow-y-auto bg-background">
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
            Download File
          </a>
        </div>

        {notesHtml && (
          <div 
            className="prose dark:prose-invert max-w-none" 
            dangerouslySetInnerHTML={{ __html: notesHtml }} 
          />
        )}
      </div>

      {/* Right side - PDF Viewer or File Preview */}
      <div className="ml-[300px] p-8 min-h-screen bg-muted/30">
        {isPdf ? (
          <div className="flex flex-col items-center">
            {pdfError ? (
              <div className="text-red-500">
                Error loading PDF: {pdfError}
              </div>
            ) : (
              <Document
                file={blob.url}
                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                onLoadError={(error) => setPdfError(error.message)}
                className="max-w-full"
                loading={<div>Loading PDF...</div>}
              >
                {Array.from(new Array(numPages || 0), (_, index) => (
                  <Page
                    key={`page_${index + 1}`}
                    pageNumber={index + 1}
                    className="mb-4 shadow-lg bg-white"
                    width={Math.min(windowWidth * 0.6, 800)}
                    loading={<div>Loading page {index + 1}...</div>}
                    error={<div>Error loading page {index + 1}</div>}
                  />
                ))}
              </Document>
            )}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-muted-foreground">Preview not available for this file type</p>
          </div>
        )}
      </div>
    </div>
  );
} 