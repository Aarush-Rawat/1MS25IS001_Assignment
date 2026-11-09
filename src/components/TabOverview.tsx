import React, { useState } from 'react';
import { CoreConcepts } from '../types/research';
import { BookOpen, Users, Calendar, Award, CheckCircle, Cpu, Target, HelpCircle, FileCheck, Copy, Check } from 'lucide-react';

interface TabOverviewProps {
  coreConcepts: CoreConcepts;
}

export const TabOverview: React.FC<TabOverviewProps> = ({ coreConcepts }) => {
  const [copiedSummary, setCopiedSummary] = useState(false);

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(coreConcepts.summary);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  // Word count check
  const wordCount = coreConcepts.summary.trim().split(/\s+/).length;

  return (
    <div className="space-y-6">
      {/* Paper Metadata Banner */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 shadow-xs backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
            {coreConcepts.venueOrSource || 'Academic Literature'}
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            {coreConcepts.year}
          </span>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-3">
          {coreConcepts.title}
        </h1>

        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 flex-wrap">
          <Users className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="font-medium">Authors:</span>
          <span>{coreConcepts.authors.join(' • ')}</span>
        </div>
      </div>

      {/* Main Executive Summary (< 300 words) */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white to-slate-50/80 dark:from-slate-900 dark:to-slate-950 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Core Summary
            </h2>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
              {wordCount} words (Under 300 Limit)
            </span>
          </div>
          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
          >
            {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSummary ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        <p className="text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300 font-serif">
          {coreConcepts.summary}
        </p>
      </div>

      {/* Problem Statement & Motivation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-5 rounded-xl border border-amber-200/80 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/20">
          <div className="flex items-center gap-2 mb-2 text-amber-800 dark:text-amber-300 font-semibold text-xs uppercase tracking-wider">
            <HelpCircle className="w-4 h-4" />
            <span>Problem Statement</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-300 leading-relaxed">
            {coreConcepts.problemStatement}
          </p>
        </div>

        <div className="p-5 rounded-xl border border-sky-200/80 dark:border-sky-900/50 bg-sky-50/40 dark:bg-sky-950/20">
          <div className="flex items-center gap-2 mb-2 text-sky-800 dark:text-sky-300 font-semibold text-xs uppercase tracking-wider">
            <Target className="w-4 h-4" />
            <span>Research Motivation</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-300 leading-relaxed">
            {coreConcepts.motivation}
          </p>
        </div>
      </div>

      {/* Methodology */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 shadow-xs">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-indigo-500" />
          <span>Proposed Methodology</span>
        </h3>
        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {coreConcepts.methodology}
        </p>
      </div>

      {/* Key Algorithms & Mathematical Concepts */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 shadow-xs">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-emerald-500" />
          <span>Key Algorithms & Mathematical Formulations</span>
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {coreConcepts.keyAlgorithms.map((alg, index) => (
            <div
              key={index}
              className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {alg.name}
                </h4>
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  Algorithm #{index + 1}
                </span>
              </div>

              {alg.mathConcept && (
                <div className="p-2.5 rounded-lg bg-slate-900 dark:bg-slate-950 text-sky-300 font-mono text-xs overflow-x-auto my-2 border border-slate-800">
                  <code>{alg.mathConcept}</code>
                </div>
              )}

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-2">
                {alg.explanation}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Contributions & Reported Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Contributions */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 shadow-xs">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-sky-500" />
            <span>Main Scientific Contributions</span>
          </h3>
          <ul className="space-y-2.5">
            {coreConcepts.mainContributions.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5 shrink-0" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Reported Results */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-500" />
              <span>Reported Empirical Results</span>
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 font-medium">
              Verified Paper Facts
            </span>
          </div>

          <div className="space-y-3">
            {coreConcepts.reportedResults.map((result, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3"
              >
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-200">
                    {result.metric}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {result.context}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    {result.score}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
