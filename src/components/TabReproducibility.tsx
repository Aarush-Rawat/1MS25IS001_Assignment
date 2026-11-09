import React from 'react';
import { Reproducibility } from '../types/research';
import { Database, Code2, Cpu, CheckSquare, Clock, AlertTriangle, ShieldCheck, ExternalLink } from 'lucide-react';

interface TabReproducibilityProps {
  reproducibility: Reproducibility;
}

export const TabReproducibility: React.FC<TabReproducibilityProps> = ({ reproducibility }) => {
  const getDifficultyBadge = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low':
        return 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'medium':
        return 'bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800';
      case 'high':
        return 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'extreme':
        return 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
    }
  };

  const getDatasetAvailabilityBadge = (status: string) => {
    if (status.toLowerCase().includes('open')) {
      return 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    }
    if (status.toLowerCase().includes('restricted') || status.toLowerCase().includes('proprietary')) {
      return 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800';
    }
    return 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800';
  };

  return (
    <div className="space-y-6">
      {/* Prominent Distinction Callout Banner */}
      <div className="p-5 rounded-2xl border border-sky-200 dark:border-sky-900 bg-gradient-to-r from-sky-50 to-indigo-50 dark:from-sky-950/40 dark:to-indigo-950/40 shadow-xs flex items-start gap-3.5">
        <ShieldCheck className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h3 className="text-xs font-bold text-sky-950 dark:text-sky-200 uppercase tracking-wider">
            Critical Distinction: Paper Facts vs. Student Feasibility Scope
          </h3>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            {reproducibility.paperFactsNotes}
          </p>
        </div>
      </div>

      {/* Reproducibility Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Difficulty */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Reproduction Barrier
          </span>
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border ${getDifficultyBadge(
                reproducibility.difficulty
              )}`}
            >
              {reproducibility.difficulty} Barrier
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Based on compute scale & codebase maturity.
          </p>
        </div>

        {/* Dataset Availability */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Data Accessibility
          </span>
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border ${getDatasetAvailabilityBadge(
                reproducibility.datasetAvailability
              )}`}
            >
              {reproducibility.datasetAvailability}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 truncate">
            {reproducibility.dataset}
          </p>
        </div>

        {/* Framework */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Ecosystem / Framework
          </span>
          <div className="mt-2">
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {reproducibility.framework}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Primary runtime environment
          </p>
        </div>

        {/* Code Availability */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Official Source Code
          </span>
          <div className="mt-2">
            {reproducibility.codeUrl ? (
              <a
                href={reproducibility.codeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline"
              >
                <span>Verified Repository</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {reproducibility.codeAvailability}
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Open-source community implementation
          </p>
        </div>
      </div>

      {/* Hardware & Training Requirements Detailed Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Hardware Specs */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <Cpu className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Original Compute & Hardware Profile (Paper Fact)
            </h4>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-mono p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800">
            {reproducibility.hardware}
          </p>
          <div className="mt-3 text-[11px] text-slate-500 dark:text-slate-400">
            💡 Student Adaptation Note: To reproduce on consumer cards, scale batch sizes down with gradient accumulation and leverage FP16/BF16 mixed precision.
          </div>
        </div>

        {/* Training Requirements */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-indigo-500" />
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Training Duration & Hyperparameters (Paper Fact)
            </h4>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800">
            {reproducibility.trainingRequirements}
          </p>
        </div>
      </div>

      {/* Dataset Details & Evaluation Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Dataset Breakdown */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <Database className="w-4 h-4 text-emerald-500" />
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Dataset Specification
            </h4>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {reproducibility.dataset}
          </p>
        </div>

        {/* Evaluation Metrics List */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <CheckSquare className="w-4 h-4 text-purple-500" />
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Standard Evaluation Metrics
            </h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {reproducibility.evaluationMetrics.map((metric, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
              >
                {metric}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
