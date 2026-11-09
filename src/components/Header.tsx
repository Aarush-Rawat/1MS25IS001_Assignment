import React from 'react';
import { BookOpen, Layers, Moon, Sun, Download, History, GitCompare, Sparkles, Terminal } from 'lucide-react';
import { PaperAnalysis } from '../types/research';
import { exportPaperToMarkdown, downloadTextFile } from '../utils/exportUtils';

interface HeaderProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  activePaper: PaperAnalysis | null;
  historyCount: number;
  onOpenHistory: () => void;
  onOpenComparison: () => void;
  onSelectSample: (sampleId: string) => void;
  samples: PaperAnalysis[];
}

export const Header: React.FC<HeaderProps> = ({
  isDarkMode,
  onToggleDarkMode,
  activePaper,
  historyCount,
  onOpenHistory,
  onOpenComparison,
  onSelectSample,
  samples,
}) => {
  const handleExportMarkdown = () => {
    if (!activePaper) return;
    const md = exportPaperToMarkdown(activePaper);
    const cleanTitle = activePaper.coreConcepts.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    downloadTextFile(md, `${cleanTitle}-architect-dossier.md`);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/90 dark:border-slate-800/90 bg-white/90 dark:bg-[#070b14]/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand Zone */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-900 via-indigo-700 to-sky-600 dark:from-indigo-600 dark:via-indigo-500 dark:to-cyan-400 text-white shadow-md shadow-indigo-900/20">
            <Layers className="w-4.5 h-4.5" />
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-cyan-400 border-2 border-white dark:border-[#070b14]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white">
                Research Architect
              </span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold tracking-wider uppercase text-indigo-700 dark:text-cyan-300 bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800">
                AI
              </span>
            </div>
            <p className="hidden md:block text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-none mt-0.5">
              Academic Literature to Executable Systems
            </p>
          </div>
        </div>

        {/* Right Actions Zone */}
        <div className="flex items-center gap-2">
          {/* Quick sample papers buttons */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 dark:text-slate-500 font-medium mr-1 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" /> Samples:
            </span>
            {samples.map((s) => {
              const shortName = s.coreConcepts.title.includes('Attention')
                ? 'Transformer'
                : s.coreConcepts.title.includes('YOLO')
                ? 'YOLOv8'
                : s.coreConcepts.title.includes('Residual') || s.coreConcepts.title.includes('ResNet')
                ? 'ResNet'
                : s.coreConcepts.title.slice(0, 14);
              const isActive = activePaper?.id === s.id;

              return (
                <button
                  key={s.id}
                  onClick={() => onSelectSample(s.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                  }`}
                >
                  {shortName}
                </button>
              );
            })}
          </div>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block mx-1" />

          {/* Compare papers */}
          <button
            onClick={onOpenComparison}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 transition-colors"
            title="Compare papers side-by-side without ranking"
          >
            <GitCompare className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden sm:inline">Compare</span>
          </button>

          {/* History */}
          <button
            onClick={onOpenHistory}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 transition-colors"
            title="Analysis History"
          >
            <History className="w-3.5 h-3.5 text-sky-500" />
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-indigo-600 text-white leading-tight">
                {historyCount}
              </span>
            )}
          </button>

          {/* Export Dossier button if paper active */}
          {activePaper && (
            <button
              onClick={handleExportMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 shadow-sm transition-all"
              title="Export complete research dossier as Markdown"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export Dossier</span>
            </button>
          )}

          {/* Dark / Light Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-colors"
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </div>
    </header>
  );
};
