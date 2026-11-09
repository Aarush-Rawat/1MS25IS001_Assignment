import React, { useState } from 'react';
import { PaperAnalysis, ComparisonMatrix } from '../types/research';
import { X, GitCompare, Sparkles, Scale, AlertCircle } from 'lucide-react';

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  historyPapers: PaperAnalysis[];
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({
  isOpen,
  onClose,
  historyPapers,
}) => {
  const [paperAId, setPaperAId] = useState<string>(historyPapers[0]?.id || '');
  const [paperBId, setPaperBId] = useState<string>(historyPapers[1]?.id || historyPapers[0]?.id || '');
  const [comparisonResult, setComparisonResult] = useState<ComparisonMatrix | null>(null);
  const [isComparing, setIsComparing] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const paperA = historyPapers.find((p) => p.id === paperAId);
  const paperB = historyPapers.find((p) => p.id === paperBId);

  const handleRunComparison = async () => {
    if (!paperA || !paperB) {
      setError('Please select two valid papers to compare.');
      return;
    }
    if (paperA.id === paperB.id) {
      setError('Please select two distinct papers for comparison.');
      return;
    }

    setError('');
    setIsComparing(true);
    setComparisonResult(null);

    try {
      const response = await fetch('/api/compare-papers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paperA, paperB }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to compare papers');
      }

      const matrix: ComparisonMatrix = await response.json();
      setComparisonResult(matrix);
    } catch (err: any) {
      console.error('Comparison error:', err);
      setError(err.message || 'Error executing comparison');
    } finally {
      setIsComparing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Factual Paper Comparison Matrix
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Objective empirical and architectural trade-offs without ranking
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Paper Selectors */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Paper A
                </label>
                <select
                  value={paperAId}
                  onChange={(e) => setPaperAId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  {historyPapers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.coreConcepts.title} ({p.coreConcepts.year})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Paper B
                </label>
                <select
                  value={paperBId}
                  onChange={(e) => setPaperBId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {historyPapers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.coreConcepts.title} ({p.coreConcepts.year})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 mb-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs border border-rose-200 dark:border-rose-900">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleRunComparison}
              disabled={isComparing || !paperAId || !paperBId || paperAId === paperBId}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 hover:from-sky-500 hover:to-purple-500 shadow-md transition-all disabled:opacity-50"
            >
              {isComparing ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Synthesizing Objective Factual Matrix...</span>
                </>
              ) : (
                <>
                  <Scale className="w-4 h-4" />
                  <span>Generate Objective Comparison</span>
                </>
              )}
            </button>
          </div>

          {/* Neutrality Note */}
          <div className="text-center">
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500">
              ⚖️ Grounded Policy: Highlights architectural and empirical divergence without subjective ranking.
            </span>
          </div>

          {/* Render Comparison Result */}
          {comparisonResult && (
            <div className="space-y-6">
              {/* Side-by-side Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Paper A Card */}
                <div className="p-5 rounded-2xl border border-sky-200 dark:border-sky-900/60 bg-sky-50/30 dark:bg-sky-950/20">
                  <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider block mb-1">
                    Paper A
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                    {comparisonResult.paperA.title} ({comparisonResult.paperA.year})
                  </h4>
                  <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                    <p>
                      <strong>Methodology:</strong> {comparisonResult.paperA.methodology}
                    </p>
                    <p>
                      <strong>Dataset:</strong> {comparisonResult.paperA.dataset}
                    </p>
                    <p>
                      <strong>Hardware:</strong> {comparisonResult.paperA.hardware}
                    </p>
                  </div>
                </div>

                {/* Paper B Card */}
                <div className="p-5 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/30 dark:bg-indigo-950/20">
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mb-1">
                    Paper B
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                    {comparisonResult.paperB.title} ({comparisonResult.paperB.year})
                  </h4>
                  <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                    <p>
                      <strong>Methodology:</strong> {comparisonResult.paperB.methodology}
                    </p>
                    <p>
                      <strong>Dataset:</strong> {comparisonResult.paperB.dataset}
                    </p>
                    <p>
                      <strong>Hardware:</strong> {comparisonResult.paperB.hardware}
                    </p>
                  </div>
                </div>
              </div>

              {/* Comparison Points Table */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
                <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Detailed Dimension Matrix
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {comparisonResult.comparisonPoints.map((point, idx) => (
                    <div key={idx} className="p-4 space-y-3">
                      <div className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-sky-500" />
                        <span>{point.dimension}</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-sky-50/40 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/40">
                          <span className="font-semibold text-sky-800 dark:text-sky-300 block mb-1">
                            Paper A:
                          </span>
                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            {point.paperAObservation}
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40">
                          <span className="font-semibold text-indigo-800 dark:text-indigo-300 block mb-1">
                            Paper B:
                          </span>
                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            {point.paperBObservation}
                          </p>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 text-[11px] text-slate-600 dark:text-slate-400">
                        <strong>Factual Trade-off:</strong> {point.factualTradeoff}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
