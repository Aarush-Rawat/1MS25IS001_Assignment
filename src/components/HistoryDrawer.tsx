import React, { useState } from 'react';
import { PaperAnalysis } from '../types/research';
import { X, History, Star, Trash2, ArrowUpRight, Download, Search, BookOpen, Layers } from 'lucide-react';
import { exportPaperToMarkdown, downloadTextFile } from '../utils/exportUtils';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: PaperAnalysis[];
  onSelectPaper: (paper: PaperAnalysis) => void;
  onDeletePaper: (paperId: string) => void;
  onToggleFavorite: (paperId: string) => void;
  onClearAll: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectPaper,
  onDeletePaper,
  onToggleFavorite,
  onClearAll,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredHistory = history.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.coreConcepts.title.toLowerCase().includes(q) ||
      p.coreConcepts.authors.some((a) => a.toLowerCase().includes(q)) ||
      p.sourceName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 h-full shadow-2xl flex flex-col">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-sky-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Research History ({history.length})
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Actions Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search previous papers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          {history.length > 0 && (
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Saved locally in browser</span>
              <button
                onClick={onClearAll}
                className="text-rose-500 hover:underline text-[11px]"
              >
                Clear all history
              </button>
            </div>
          )}
        </div>

        {/* Papers List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <BookOpen className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
              <p>No papers found in research history.</p>
            </div>
          ) : (
            filteredHistory.map((paper) => (
              <div
                key={paper.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 hover:border-sky-300 dark:hover:border-sky-800 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      {new Date(paper.timestamp).toLocaleDateString()} • {paper.depth}
                    </span>
                    <button
                      onClick={() => onToggleFavorite(paper.id)}
                      className="text-slate-400 hover:text-amber-400 transition-colors"
                      title="Star favorite"
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          paper.isFavorite ? 'fill-amber-400 text-amber-400' : ''
                        }`}
                      />
                    </button>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                    {paper.coreConcepts.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                    {paper.coreConcepts.authors.slice(0, 3).join(', ')}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-slate-850 text-xs">
                  <button
                    onClick={() => {
                      onSelectPaper(paper);
                      onClose();
                    }}
                    className="flex items-center gap-1 text-sky-600 dark:text-sky-400 font-semibold hover:underline"
                  >
                    <span>Open Analysis</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const md = exportPaperToMarkdown(paper);
                        downloadTextFile(md, `${paper.id}.md`);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                      title="Export Markdown"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeletePaper(paper.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-500"
                      title="Delete record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
