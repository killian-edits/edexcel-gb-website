'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Download,
  ExternalLink,
  RotateCw,
  FileText,
  AlertCircle,
  Upload,
} from 'lucide-react';

export interface PDFViewerProps {
  title: string;
  type: 'question_paper' | 'mark_scheme';
  pdfUrl?: string | null;
  storagePath?: string | null;
  paperCode: string;
  className?: string;
}

export function PDFViewer({
  title,
  type,
  pdfUrl,
  storagePath,
  paperCode,
  className = '',
}: PDFViewerProps) {
  const [zoom, setZoom] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [reloadKey, setReloadKey] = useState<number>(0);
  const [hasError, setHasError] = useState<boolean>(false);

  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));
  const handleResetZoom = () => setZoom(100);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  React.useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const badgeColor =
    type === 'question_paper'
      ? 'bg-[#F0F9FF] text-[#0284C7] border-[#BAE6FD]'
      : 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]';

  return (
    <div
      ref={containerRef}
      className={`flex flex-col h-full bg-[#1E293B] rounded-xl overflow-hidden border border-[#334155] shadow-sm ${className} ${
        isFullscreen ? 'p-2' : ''
      }`}
    >
      {/* PDF Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-[#0F172A] border-b border-[#334155] text-white">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${badgeColor}`}>
            {type === 'question_paper' ? 'Question Paper' : 'Mark Scheme'}
          </span>
          <span className="text-xs font-semibold text-slate-200 truncate">
            {title}
          </span>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-1">
          <div className="flex items-center bg-[#1E293B] rounded-lg p-0.5 border border-[#334155]">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleZoomOut}
              className="h-7 w-7 p-0 text-slate-300 hover:text-white hover:bg-slate-700"
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="text-[11px] font-mono px-2 text-slate-300 hover:text-white"
              title="Reset Zoom"
            >
              {zoom}%
            </button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleZoomIn}
              className="h-7 w-7 p-0 text-slate-300 hover:text-white hover:bg-slate-700"
              title="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setHasError(false);
              setReloadKey((k) => k + 1);
            }}
            className="h-7 w-7 p-0 text-slate-300 hover:text-white hover:bg-slate-700"
            title="Reload Viewer"
          >
            <RotateCw className="h-3.5 w-3.5" />
          </Button>

          {pdfUrl && (
            <>
              <a
                href={pdfUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                title="Download PDF"
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-slate-300 hover:text-white hover:bg-slate-700"
                >
                  <Download className="h-3.5 w-3.5" />
                </Button>
              </a>

              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Open in New Tab"
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-slate-300 hover:text-white hover:bg-slate-700"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </a>
            </>
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="h-7 w-7 p-0 text-slate-300 hover:text-white hover:bg-slate-700"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? (
              <Minimize2 className="h-3.5 w-3.5" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </div>

      {/* PDF Viewport */}
      <div className="relative flex-1 w-full h-full min-h-[460px] bg-slate-900 overflow-auto flex items-center justify-center">
        {hasError || !pdfUrl ? (
          <div className="max-w-md p-6 text-center space-y-3 bg-slate-800/80 rounded-xl border border-slate-700 m-4">
            <div className="mx-auto h-12 w-12 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-bold text-white">
              {type === 'question_paper' ? 'Question Paper Document' : 'Mark Scheme Document'}
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              This document file has not yet been uploaded to the Supabase Storage bucket (<code className="text-amber-300 font-mono">past_papers</code>).
            </p>
            {storagePath && (
              <div className="rounded bg-slate-950 p-2.5 border border-slate-800 text-left">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                  Target Storage Key:
                </span>
                <code className="text-[11px] font-mono text-sky-300 break-all select-all">
                  {storagePath}
                </code>
              </div>
            )}
            <p className="text-[11px] text-slate-400">
              Upload the PDF to Supabase Storage at this path to render the document immediately.
            </p>
          </div>
        ) : (
          <div
            className="w-full h-full transition-transform origin-top"
            style={{
              width: `${zoom}%`,
              height: `${zoom}%`,
              minWidth: '100%',
              minHeight: '100%',
            }}
          >
            <object
              key={reloadKey}
              data={`${pdfUrl}#toolbar=0&navpanes=0`}
              type="application/pdf"
              className="w-full h-full min-h-[500px]"
              onError={() => setHasError(true)}
            >
              <iframe
                src={`${pdfUrl}#toolbar=0&navpanes=0`}
                className="w-full h-full min-h-[500px] border-0"
                title={title}
                onError={() => setHasError(true)}
              >
                <div className="p-6 text-center text-slate-300">
                  <p className="text-sm">Unable to render PDF preview directly in browser.</p>
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-400 underline mt-2 inline-block text-xs"
                  >
                    Click here to open PDF file
                  </a>
                </div>
              </iframe>
            </object>
          </div>
        )}
      </div>
    </div>
  );
}

