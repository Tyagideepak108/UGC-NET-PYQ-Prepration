import React, { useState } from 'react';
import { X, ExternalLink, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

interface PdfModalProps {
  initialPage?: number;
  isOpen: boolean;
  onClose: () => void;
}

export const PdfModal: React.FC<PdfModalProps> = ({
  initialPage = 1,
  isOpen,
  onClose,
}) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [inputPage, setInputPage] = useState(String(initialPage));

  if (!isOpen) return null;

  const pdfUrl = `/assets/aistudio/ugcnet__1__194481fe.pdf#page=${currentPage}`;

  const handlePageChange = (newPage: number) => {
    const clamped = Math.max(1, Math.min(757, newPage));
    setCurrentPage(clamped);
    setInputPage(String(clamped));
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(inputPage, 10);
    if (!isNaN(p)) {
      handlePageChange(p);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-2 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-5xl h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Modal Top Bar */}
        <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Original UGC NET PYQ PDF Document</h3>
              <p className="text-[11px] text-slate-400">Total 757 Pages • GATE Overflow Edition</p>
            </div>
          </div>

          {/* Page navigation controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <form onSubmit={handleInputSubmit} className="flex items-center gap-1 text-xs">
              <span>Page</span>
              <input
                type="number"
                min="1"
                max="757"
                value={inputPage}
                onChange={e => setInputPage(e.target.value)}
                className="w-14 px-1.5 py-0.5 text-center bg-slate-800 border border-slate-700 rounded text-white font-mono"
              />
              <span className="text-slate-400">/ 757</span>
            </form>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= 757}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <a
              href={`/assets/aistudio/ugcnet__1__194481fe.pdf#page=${currentPage}`}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors ml-2"
              title="Open full PDF in new browser tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors ml-1"
              aria-label="Close PDF viewer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Embedded PDF iframe */}
        <div className="flex-1 w-full bg-slate-100 relative">
          <iframe
            key={currentPage}
            src={pdfUrl}
            title="Original UGC NET PDF"
            className="w-full h-full border-0"
          />
        </div>

      </div>
    </div>
  );
};
